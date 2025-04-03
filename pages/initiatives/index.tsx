import { useState } from 'react';
import InitiativeForm from '../../components/initiatives/InitiativeForm';
import { Initiative } from '../../types/initiative';

export default function Initiatives() {
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);

  const handleSubmit = (initiativeData: Omit<Initiative, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newInitiative: Initiative = {
      ...initiativeData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setInitiatives((prev) => [...prev, newInitiative]);
    // TODO: Save to local storage
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Initiatives</h1>
        <p className="mt-2 text-gray-600">Create and manage your product initiatives.</p>
      </div>

      <InitiativeForm onSubmit={handleSubmit} />

      {/* TODO: Add initiative list view */}
    </div>
  );
} 