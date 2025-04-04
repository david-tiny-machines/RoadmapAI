import { useState, useEffect } from 'react';
import InitiativeForm from '../../components/initiatives/InitiativeForm';
import InitiativeList from '../../components/initiatives/InitiativeList';
import { Initiative } from '../../types/initiative';
import { sortInitiativesByPriority } from '../../utils/prioritizationUtils';
import { useAuth } from '../../contexts/AuthContext';

const STORAGE_KEY = 'roadmapai_initiatives';

export default function Initiatives() {
  const { user } = useAuth(); // Keep Supabase auth
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [editingInitiative, setEditingInitiative] = useState<Initiative | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true when component mounts
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsClient(true);
    }, 0);
    return () => clearTimeout(timeout);
  }, []);

  // Load initiatives from local storage
  useEffect(() => {
    if (!isClient) return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setInitiatives(parsed);
      }
    } catch (error) {
      console.error('Error loading initiatives:', error);
    }
  }, [isClient]);

  // Save initiatives to local storage
  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initiatives));
  }, [initiatives, isClient]);

  const handleSubmit = (initiativeData: Omit<Initiative, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingInitiative) {
      // Update existing initiative
      const updated = initiatives.map((i) =>
        i.id === editingInitiative.id
          ? {
              ...initiativeData,
              id: editingInitiative.id,
              createdAt: editingInitiative.createdAt,
              updatedAt: new Date().toISOString(),
            }
          : i
      );
      setInitiatives(sortInitiativesByPriority(updated));
    } else {
      // Create new initiative
      const newInitiative: Initiative = {
        ...initiativeData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setInitiatives((prev) => sortInitiativesByPriority([...prev, newInitiative]));
    }
    setEditingInitiative(null);
    setShowForm(false);
  };

  const handleEdit = (initiative: Initiative) => {
    setEditingInitiative(initiative);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setInitiatives((prev) => prev.filter((i) => i.id !== id));
  };

  if (!isClient) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Initiatives</h1>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Initiatives</h1>
            <p className="mt-2 text-gray-600">Create and manage your product initiatives.</p>
          </div>
          <button
            onClick={() => {
              setEditingInitiative(null);
              setShowForm(!showForm);
            }}
            className="btn-primary"
          >
            {showForm ? 'Close Form' : 'New Initiative'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="mb-8">
          <InitiativeForm
            onSubmit={handleSubmit}
            initialData={editingInitiative || undefined}
          />
        </div>
      )}

      <InitiativeList
        initiatives={initiatives}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
} 