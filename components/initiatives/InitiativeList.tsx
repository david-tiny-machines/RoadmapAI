'use client';

import { useState, useEffect, useMemo } from 'react';
import { Initiative } from '../../types/initiative';
import { fromDbInitiative, DbInitiativeType } from '../../types/database';
import { useAuth } from '../../contexts/AuthContext';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '../../types/supabase';
import InitiativeForm from './InitiativeForm';
import { calculateWeightedImpact, calculatePriorityScore, sortInitiativesByPriority } from '../../utils/prioritizationUtils';
import { formatMonthYear } from '../../utils/dateUtils';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem';
import { RealtimePostgresChangesPayload as SupabaseRealtimePayload } from '@supabase/supabase-js';
import ErrorDisplay from '../shared/ErrorDisplay';

/**
 * Props for the InitiativeList component
 * @interface InitiativeListProps
 * @property {Initiative[]} initiatives - Array of initiatives to display and manage
 * @property {function} onEdit - Callback function when an initiative is edited
 * @property {function} onDelete - Callback function when an initiative is deleted
 */
interface InitiativeListProps {
  initiatives: Initiative[];
  onEdit: (initiative: Initiative) => void;
  onDelete: (id: string) => void;
}

interface ConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

interface DeleteModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmModal({ isOpen, onConfirm, onCancel }: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <h4 className="text-lg font-medium text-gray-900 mb-2">Reset Priority Order?</h4>
        <p className="text-gray-600 mb-6">
          This will remove all manual ordering and sort initiatives based on their calculated priority scores. Mandatory items will remain at the top.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
          >
            Reset Priority
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteModal({ isOpen, onConfirm, onCancel }: DeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <h4 className="text-lg font-medium text-gray-900 mb-2">Delete Initiative?</h4>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this initiative? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InitiativeList() {
  const { user } = useAuth();
  const supabaseClient = useSupabaseClient<Database>();

  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingInitiative, setEditingInitiative] = useState<Initiative | undefined>();
  const [showResetModal, setShowResetModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize the channel name to prevent unnecessary re-subscriptions
  const channelName = useMemo(() => 
    `initiatives-${user?.id}`, 
    [user?.id]
  );

  // Load initiatives from Supabase
  const loadInitiatives = async () => {
    if (!user || !supabaseClient) {
        setError('User or database connection unavailable.');
        setIsLoading(false);
        return; 
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Loading initiatives...');
      const { data, error: dbError } = await supabaseClient
        .from('initiatives')
        .select('*')
        .order('priority_score', { ascending: false });

      if (dbError) throw dbError;
      
      if (data) {
        console.log('Loaded initiatives:', data.length);
        const converted = data.map(fromDbInitiative);
        // Sort by mandatory status first, then priority score
        setInitiatives(sortInitiativesByPriority(converted));
      }
    } catch (error) {
      console.error('Error loading initiatives:', error);
      setError(error instanceof Error ? error.message : 'Failed to load initiatives');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadInitiatives();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, supabaseClient]);

  // Set up real-time subscription
  useEffect(() => {
    if (!user || !supabaseClient) return;

    console.log('Setting up global initiative subscription...');
    let isSubscribed = true;

    // Use a fixed channel name for global updates
    const globalChannelName = 'public:initiatives';

    const subscription = supabaseClient
      .channel(globalChannelName) // Changed channel name
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'initiatives' }, // REMOVED filter
        async (payload: SupabaseRealtimePayload<DbInitiativeType>) => {
          console.log('Received global change event:', {
            type: payload.eventType,
            timestamp: new Date().toISOString(),
            payload
          });

          // Only update if we're still mounted
          if (!isSubscribed) {
            console.log('Component unmounted, ignoring update');
            return;
          }

          try {
            if (payload.eventType === 'INSERT') {
              const newItem = fromDbInitiative(payload.new);
              console.log('Adding new initiative:', newItem);
              setInitiatives(current => {
                const updated = [...current, newItem];
                const sorted = sortInitiativesByPriority(updated);
                console.log('Updated initiatives after INSERT:', sorted.length);
                return sorted;
              });
            } else if (payload.eventType === 'UPDATE') {
              console.log('Updating initiative:', payload.new.id);
              setInitiatives(current => {
                const updated = current.map(item => 
                  item.id === payload.new.id ? fromDbInitiative(payload.new) : item
                );
                const sorted = sortInitiativesByPriority(updated);
                console.log('Updated initiatives after UPDATE:', sorted.length);
                return sorted;
              });
            } else if (payload.eventType === 'DELETE') {
              console.log('Deleting initiative:', payload.old.id);
              setInitiatives(current => {
                const updated = current.filter(item => item.id !== payload.old.id);
                const sorted = sortInitiativesByPriority(updated);
                console.log('Updated initiatives after DELETE:', sorted.length);
                return sorted;
              });
            }
          } catch (error) {
            console.error('Error handling subscription event:', error);
          }
        }
      )
      .subscribe((status, err) => {
        console.log('Subscription status:', status);
        if (err) {
          console.error('Realtime subscription error:', err);
          setError(`Realtime connection error: ${err.message}`);
        }
         if (status === 'SUBSCRIBED') {
           // Optional: Clear errors on successful subscribe?
           // setError(null); 
         }
      });

    return () => {
      console.log('Cleaning up subscription:', globalChannelName);
      isSubscribed = false;
      if (supabaseClient) {
        supabaseClient.removeChannel(subscription);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, supabaseClient]); // Removed channelName dependency, user?.id maybe still needed if other logic depends on it, review later if needed

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setInitiatives((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        // Get all mandatory items
        const mandatoryItems = items.filter(item => item.isMandatory);
        if (mandatoryItems.length === 0) {
          return arrayMove(items, oldIndex, newIndex);
        }

        // Find the index of the last mandatory item
        const lastMandatoryIndex = items.findIndex(item => 
          item.id === mandatoryItems[mandatoryItems.length - 1].id
        );

        const activeItem = items[oldIndex];
        const overItem = items[newIndex];

        // Don't allow:
        // 1. Moving mandatory items below optional ones
        // 2. Moving optional items above mandatory ones
        if (
          (activeItem.isMandatory && newIndex > lastMandatoryIndex) || 
          (!activeItem.isMandatory && newIndex <= lastMandatoryIndex)
        ) {
          return items;
        }
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!user || !supabaseClient) {
        setError('Cannot delete: User or database connection unavailable.');
        return;
    }

    try {
      setError(null);
      console.log(`Attempting to delete initiative ${id}`);
      const { error: deleteError } = await supabaseClient
        .from('initiatives')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      console.log(`Initiative ${id} marked for deletion.`);
      // No need to manually remove from state here if relying on subscription
      // If subscription is slow or unreliable, uncomment below:
      // setInitiatives(current => current.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting initiative:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete initiative');
    }
  };

  const handleEdit = (initiative: Initiative) => {
    setEditingInitiative(initiative);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setEditingInitiative(undefined);
    setIsFormOpen(false);
    // Reload initiatives after form close to ensure we have the latest data
    loadInitiatives();
  };

  const handleResetOrder = () => {
    // Sort by priority score and mandatory status
    setInitiatives(current => sortInitiativesByPriority(current));
    setShowResetModal(false);
  };

  return (
    <div>
      {error && <ErrorDisplay message={error} onClose={() => setError(null)} />}

      <div className="mb-8">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Initiatives</h2>
          <button
            onClick={() => setIsFormOpen(true)}
            className="btn-primary"
          >
            New Initiative
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : initiatives.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No initiatives yet. Click "New Initiative" to create one.
        </div>
      ) : (
        <>
    <div className="mt-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Prioritised Initiatives 
                  <span className="text-sm text-gray-500 ml-2">({initiatives.length} items)</span>
          </h3>
          <p className="text-sm text-gray-500 mt-1">
                  Drag and drop to reorder. Mandatory items must stay at the top.
          </p>
        </div>
        <button
          onClick={() => setShowResetModal(true)}
                className="text-sm text-primary-600 hover:text-primary-900"
        >
                Reset Order
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
                items={initiatives.map(item => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="bg-white rounded-xl shadow-soft">
                  {initiatives.map((item) => (
              <SortableItem
                key={item.id}
                item={item}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
          </div>

          <ConfirmModal
            isOpen={showResetModal}
            onConfirm={handleResetOrder}
            onCancel={() => setShowResetModal(false)}
          />
        </>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingInitiative ? 'Edit Initiative' : 'New Initiative'}
              </h3>
              <button
                onClick={handleFormClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <InitiativeForm
              onSave={handleFormClose}
              onCancel={handleFormClose}
              initialData={editingInitiative}
            />
          </div>
        </div>
      )}
    </div>
  );
} 