import { useState, useEffect } from 'react';
import CapacityManager from '../../components/capacity/CapacityManager';
import { CapacityData } from '../../types/capacity';
import { Initiative } from '../../types/initiative';

const STORAGE_KEY = 'roadmapai_initiatives';

export default function Capacity() {
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true when component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load initiatives from local storage
  useEffect(() => {
    if (!isClient) return;

    console.log('Capacity page: Loading initiatives from local storage');
    const stored = localStorage.getItem(STORAGE_KEY);
    console.log('Capacity page: Stored data:', stored);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        console.log('Capacity page: Parsed initiatives:', parsed);
        setInitiatives(parsed);
      } catch (error) {
        console.error('Capacity page: Error parsing initiatives:', error);
      }
    }
  }, [isClient]);

  const handleCapacityChange = (capacity: CapacityData) => {
    // This will be used later for capacity visualization
    console.log('Capacity updated:', capacity);
  };

  if (!isClient) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Capacity Management</h1>
        <p className="mt-2 text-gray-600">
          Set and manage your team's monthly capacity in available working days.
        </p>
      </div>

      <CapacityManager onCapacityChange={handleCapacityChange} initiatives={initiatives} />
    </div>
  );
} 