import CapacityManager from '../../components/capacity/CapacityManager';
import { CapacityData } from '../../types/capacity';

export default function Capacity() {
  const handleCapacityChange = (capacity: CapacityData) => {
    // This will be used later for capacity visualization
    console.log('Capacity updated:', capacity);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Capacity Management</h1>
        <p className="mt-2 text-gray-600">
          Set and manage your team's monthly capacity in available working days.
        </p>
      </div>

      <CapacityManager onCapacityChange={handleCapacityChange} />
    </div>
  );
} 