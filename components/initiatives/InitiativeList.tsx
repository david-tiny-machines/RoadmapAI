'use client';

import { Initiative } from '../../types/initiative';
import { calculateWeightedImpact, calculatePriorityScore } from '../../utils/prioritizationUtils';
import { formatMonthYear } from '../../utils/dateUtils';
import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

function SortableItem({ item, onEdit, onDelete }: { 
  item: Initiative; 
  onEdit: (initiative: Initiative) => void;
  onDelete: (id: string) => void;
}) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    onDelete(item.id);
    setShowDeleteModal(false);
  };

  const weightedImpact = calculateWeightedImpact(item);
  const priorityScore = calculatePriorityScore(item);

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`p-4 rounded-lg border mb-2 ${
          item.isMandatory ? 'bg-yellow-50' : 'bg-white'
        } ${isDragging ? 'shadow-lg' : ''}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div
              {...attributes}
              {...listeners}
              className="mr-3 cursor-move p-1 hover:bg-gray-100 rounded"
            >
              ⋮⋮
            </div>
            <div>
              <div className="font-medium flex items-center">
                {item.name}
                {item.isMandatory && (
                  <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                    Mandatory
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-500">
                {item.valueLever}
                {(item.startMonth || item.endMonth) && (
                  <span className="ml-2 text-gray-400">
                    {item.startMonth && !item.endMonth && `From ${formatMonthYear(item.startMonth)}`}
                    {!item.startMonth && item.endMonth && `Until ${formatMonthYear(item.endMonth)}`}
                    {item.startMonth && item.endMonth && `${formatMonthYear(item.startMonth)} to ${formatMonthYear(item.endMonth)}`}
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Priority Score: {priorityScore.toFixed(2)} • 
                Effort: {item.effortEstimate} days • 
                Impact: {weightedImpact.toFixed(2)}%
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(item)}
              className="text-indigo-600 hover:text-indigo-900"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="text-red-600 hover:text-red-900"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
      <DeleteModal
        isOpen={showDeleteModal}
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </>
  );
}

export default function InitiativeList({ initiatives, onEdit, onDelete }: InitiativeListProps) {
  const [items, setItems] = useState<Initiative[]>([]);
  const [showResetModal, setShowResetModal] = useState(false);
  
  useEffect(() => {
    setItems(initiatives);
  }, [initiatives]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        const draggedItem = items[oldIndex];
        const targetItem = items[newIndex];
        
        // Prevent dragging optional items above mandatory ones
        // AND prevent dragging mandatory items below optional ones
        const isMandatoryToOptionalMove = draggedItem.isMandatory && 
          items.slice(0, newIndex + 1).some(item => !item.isMandatory);
        
        if ((!draggedItem.isMandatory && targetItem.isMandatory) || isMandatoryToOptionalMove) {
          return items;
        }
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  const handleReset = () => {
    // Sort by mandatory first, then by priority score
    const sortedItems = [...initiatives].sort((a, b) => {
      if (a.isMandatory !== b.isMandatory) {
        return a.isMandatory ? -1 : 1;
      }
      const scoreA = calculatePriorityScore(a);
      const scoreB = calculatePriorityScore(b);
      return scoreB - scoreA;
    });
    setItems(sortedItems);
    setShowResetModal(false);
  };

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Prioritised Initiatives 
            <span className="text-sm text-gray-500 ml-2">({items.length} items)</span>
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Priority is calculated based on potential impact and confidence, balanced against effort required. Higher impact and confidence increase priority, while higher effort decreases it. Mandatory items always appear first.
          </p>
        </div>
        <button
          onClick={() => setShowResetModal(true)}
          className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          Reset Priority
        </button>
      </div>

      <ConfirmModal
        isOpen={showResetModal}
        onConfirm={handleReset}
        onCancel={() => setShowResetModal(false)}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map(item => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="bg-white rounded-xl shadow-soft">
            {items.map((item) => (
              <SortableItem
                key={item.id}
                item={item}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
} 