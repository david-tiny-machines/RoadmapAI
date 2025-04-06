import { useState, useEffect } from 'react';
import { Initiative } from '../../types/initiative';
import { CapacityData } from '../../types/capacity';
import { getNextNMonths, getDefaultCapacity } from '../../utils/dateUtils';

const INITIATIVES_KEY = 'roadmapai_initiatives';
const CAPACITY_KEY = 'roadmapai_capacity';

const StorageDebugPage: React.FC = () => {
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [capacityData, setCapacityData] = useState<CapacityData | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    loadData();
  }, []);

  const loadData = () => {
    if (typeof window !== 'undefined') {
      const storedInitiatives = localStorage.getItem(INITIATIVES_KEY);
      const storedCapacity = localStorage.getItem(CAPACITY_KEY);
      
      if (storedInitiatives) {
        setInitiatives(JSON.parse(storedInitiatives));
      }
      if (storedCapacity) {
        setCapacityData(JSON.parse(storedCapacity));
      }
    }
  };

  const clearInitiatives = () => {
    localStorage.removeItem(INITIATIVES_KEY);
    setInitiatives([]);
  };

  const clearCapacity = () => {
    localStorage.removeItem(CAPACITY_KEY);
    setCapacityData(null);
  };

  const clearAll = () => {
    clearInitiatives();
    clearCapacity();
  };

  if (!isClient) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Storage Debug</h1>
      
      <div className="space-y-8">
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Initiatives</h2>
          <div className="mb-4">
            <p>Stored initiatives: {initiatives.length}</p>
            {initiatives.map(initiative => (
              <div key={initiative.id} className="text-sm text-gray-600 mt-1">
                {initiative.name} (ID: {initiative.id})
              </div>
            ))}
          </div>
          <button
            onClick={clearInitiatives}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Clear Initiatives
          </button>
        </section>

        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Capacity Data</h2>
          <div className="mb-4">
            <p>Status: {capacityData ? 'Present' : 'Not set'}</p>
            {capacityData && (
              <div className="text-sm text-gray-600 mt-1">
                Months: {capacityData.monthlyCapacities.length}
              </div>
            )}
          </div>
          <button
            onClick={clearCapacity}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Clear Capacity
          </button>
        </section>

        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">All Data</h2>
          <button
            onClick={clearAll}
            className="bg-red-800 text-white px-4 py-2 rounded hover:bg-red-900"
          >
            Clear All Data
          </button>
        </section>

        <div className="text-sm text-gray-500 mt-8">
          <p>Storage Keys:</p>
          <code className="block mt-1">{INITIATIVES_KEY}</code>
          <code className="block mt-1">{CAPACITY_KEY}</code>
        </div>
      </div>
    </div>
  );
};

export default StorageDebugPage; 