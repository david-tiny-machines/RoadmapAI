import { useState, useEffect } from 'react';
import { Initiative } from '../types/initiative';
import { CapacityData } from '../types/capacity';
import { getNextNMonths, getDefaultCapacity } from '../utils/dateUtils';

const INITIATIVES_KEY = 'roadmapai_initiatives';
const CAPACITY_KEY = 'roadmapai_capacity';

const getInitialCapacityData = (): CapacityData => {
  const months = getNextNMonths(12);
  return {
    id: crypto.randomUUID(),
    monthlyCapacities: months.map(month => ({
      month,
      availableDays: getDefaultCapacity(),
    })),
    updatedAt: new Date().toISOString(),
  };
};

export default function TestStorage() {
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [capacityData, setCapacityData] = useState<CapacityData | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [newInitiative, setNewInitiative] = useState<Partial<Initiative>>({
    name: '',
    valueLever: 'Conversion',
    uplift: 0,
    confidence: 50,
    effortEstimate: 1,
    isMandatory: false,
  });

  // Set isClient to true when component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load data from local storage
  useEffect(() => {
    if (!isClient) return;

    console.log('Loading data from local storage');
    
    // Load initiatives
    const storedInitiatives = localStorage.getItem(INITIATIVES_KEY);
    console.log('Stored initiatives:', storedInitiatives);
    if (storedInitiatives) {
      try {
        const parsed = JSON.parse(storedInitiatives);
        console.log('Parsed initiatives:', parsed);
        setInitiatives(parsed);
      } catch (error) {
        console.error('Error parsing initiatives:', error);
      }
    }

    // Load capacity
    const storedCapacity = localStorage.getItem(CAPACITY_KEY);
    console.log('Stored capacity:', storedCapacity);
    if (storedCapacity) {
      try {
        const parsed = JSON.parse(storedCapacity);
        console.log('Parsed capacity:', parsed);
        setCapacityData(parsed);
      } catch (error) {
        console.error('Error parsing capacity:', error);
      }
    }
  }, [isClient]);

  // Save initiatives to local storage
  useEffect(() => {
    if (!isClient) return;
    console.log('Saving initiatives to local storage:', initiatives);
    localStorage.setItem(INITIATIVES_KEY, JSON.stringify(initiatives));
  }, [initiatives, isClient]);

  // Save capacity to local storage
  useEffect(() => {
    if (!isClient || !capacityData) return;
    console.log('Saving capacity to local storage:', capacityData);
    localStorage.setItem(CAPACITY_KEY, JSON.stringify(capacityData));
  }, [capacityData, isClient]);

  const handleAddInitiative = () => {
    const initiative: Initiative = {
      ...newInitiative as Initiative,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setInitiatives([...initiatives, initiative]);
  };

  const handleClearStorage = () => {
    if (!isClient) return;
    localStorage.removeItem(INITIATIVES_KEY);
    localStorage.removeItem(CAPACITY_KEY);
    setInitiatives([]);
    setCapacityData(null);
  };

  const handleInitializeCapacity = () => {
    setCapacityData(getInitialCapacityData());
  };

  if (!isClient) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Test Local Storage</h1>
      
      <div className="mb-8 p-4 bg-gray-100 rounded">
        <h2 className="text-xl font-semibold mb-4">Add Test Initiative</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-1">Name</label>
            <input
              type="text"
              value={newInitiative.name}
              onChange={(e) => setNewInitiative({ ...newInitiative, name: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Value Lever</label>
            <select
              value={newInitiative.valueLever}
              onChange={(e) => setNewInitiative({ ...newInitiative, valueLever: e.target.value as any })}
              className="w-full p-2 border rounded"
            >
              <option value="Conversion">Conversion</option>
              <option value="Average Loan Size">Average Loan Size</option>
              <option value="Interest Rate">Interest Rate</option>
            </select>
          </div>
          <div>
            <label className="block mb-1">Uplift (%)</label>
            <input
              type="number"
              value={newInitiative.uplift}
              onChange={(e) => setNewInitiative({ ...newInitiative, uplift: parseFloat(e.target.value) })}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Effort (days)</label>
            <input
              type="number"
              value={newInitiative.effortEstimate}
              onChange={(e) => setNewInitiative({ ...newInitiative, effortEstimate: parseInt(e.target.value) })}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="isMandatory"
            checked={newInitiative.isMandatory}
            onChange={(e) => setNewInitiative({ ...newInitiative, isMandatory: e.target.checked })}
            className="mr-2"
          />
          <label htmlFor="isMandatory">Mandatory</label>
        </div>
        <button
          onClick={handleAddInitiative}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Initiative
        </button>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Storage Management</h2>
          <div className="space-x-4">
            <button
              onClick={handleInitializeCapacity}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Initialize Capacity
            </button>
            <button
              onClick={handleClearStorage}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Clear All Storage
            </button>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Stored Initiatives</h2>
        <div className="bg-white p-4 rounded shadow">
          <pre className="whitespace-pre-wrap">{JSON.stringify(initiatives, null, 2)}</pre>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Stored Capacity</h2>
        <div className="bg-white p-4 rounded shadow">
          <pre className="whitespace-pre-wrap">{JSON.stringify(capacityData, null, 2)}</pre>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Raw Local Storage</h2>
        <div className="bg-white p-4 rounded shadow space-y-4">
          <div>
            <h3 className="font-medium mb-2">Initiatives ({INITIATIVES_KEY}):</h3>
            <pre className="whitespace-pre-wrap">
              {isClient ? localStorage.getItem(INITIATIVES_KEY) : 'Loading...'}
            </pre>
          </div>
          <div>
            <h3 className="font-medium mb-2">Capacity ({CAPACITY_KEY}):</h3>
            <pre className="whitespace-pre-wrap">
              {isClient ? localStorage.getItem(CAPACITY_KEY) : 'Loading...'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
} 