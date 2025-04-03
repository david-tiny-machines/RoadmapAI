import { useState, useEffect } from 'react';
import { CapacityData, MonthlyCapacity } from '../../types/capacity';
import { getNextNMonths, formatMonthYear, getDefaultCapacity } from '../../utils/dateUtils';
import CapacityChart from './CapacityChart';
import { Initiative } from '../../types/initiative';

const MONTHS_TO_SHOW = 12;
const STORAGE_KEY = 'roadmapai_capacity';

interface CapacityManagerProps {
  onCapacityChange?: (capacity: CapacityData) => void;
  initiatives?: Initiative[];
}

const getInitialCapacityData = (): CapacityData => {
  const months = getNextNMonths(MONTHS_TO_SHOW);
  return {
    id: crypto.randomUUID(),
    monthlyCapacities: months.map(month => ({
      month,
      availableDays: getDefaultCapacity(),
    })),
    updatedAt: new Date().toISOString(),
  };
};

export default function CapacityManager({ onCapacityChange, initiatives = [] }: CapacityManagerProps) {
  const [isClient, setIsClient] = useState(false);
  const [bulkValue, setBulkValue] = useState<string>('20');
  const [capacityData, setCapacityData] = useState<CapacityData>(getInitialCapacityData);
  const [bulkUpdateValue, setBulkUpdateValue] = useState('');
  
  useEffect(() => {
    setIsClient(true);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setCapacityData(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(capacityData));
      onCapacityChange?.(capacityData);
    }
  }, [capacityData, onCapacityChange, isClient]);

  const handleCapacityChange = (month: string, value: number) => {
    setCapacityData(prev => ({
      ...prev,
      monthlyCapacities: prev.monthlyCapacities.map(mc =>
        mc.month === month ? { ...mc, availableDays: value } : mc
      ),
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleBulkUpdate = () => {
    const value = parseFloat(bulkUpdateValue);
    if (!isNaN(value)) {
      const updatedCapacities = capacityData.monthlyCapacities.map(item => ({
        ...item,
        availableDays: value
      }));
      
      const newCapacityData = {
        ...capacityData,
        monthlyCapacities: updatedCapacities,
        updatedAt: new Date().toISOString()
      };
      
      setCapacityData(newCapacityData);
      if (onCapacityChange) {
        onCapacityChange(newCapacityData);
      }
      setBulkUpdateValue('');
    }
  };

  if (!isClient) {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-soft">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-soft">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Monthly Capacity</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={bulkUpdateValue}
                onChange={(e) => setBulkUpdateValue(e.target.value)}
                placeholder="Set all to..."
                className="w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleBulkUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {capacityData.monthlyCapacities.map((item, index) => (
            <div key={item.month} className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">{formatMonthYear(item.month)}</h4>
              <input
                type="number"
                value={item.availableDays}
                onChange={(e) => handleCapacityChange(item.month, parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Available days"
              />
            </div>
          ))}
        </div>
      </div>
      {isClient && <CapacityChart initiatives={initiatives} monthlyCapacities={capacityData.monthlyCapacities} />}
    </div>
  );
} 