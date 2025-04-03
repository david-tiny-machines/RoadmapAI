import { useState, useEffect } from 'react';
import { CapacityData, MonthlyCapacity } from '../../types/capacity';
import { getNextNMonths, formatMonthYear, getDefaultCapacity } from '../../utils/dateUtils';

const MONTHS_TO_SHOW = 12;
const STORAGE_KEY = 'roadmapai_capacity';

interface CapacityManagerProps {
  onCapacityChange?: (capacity: CapacityData) => void;
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

export default function CapacityManager({ onCapacityChange }: CapacityManagerProps) {
  const [isClient, setIsClient] = useState(false);
  const [bulkValue, setBulkValue] = useState<string>('20');
  const [capacityData, setCapacityData] = useState<CapacityData>(getInitialCapacityData);
  
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

  const handleBulkUpdate = (value: string) => {
    setBulkValue(value);
    const numValue = Math.max(0, parseInt(value) || 0);
    setCapacityData(prev => ({
      ...prev,
      monthlyCapacities: prev.monthlyCapacities.map(mc => ({
        ...mc,
        availableDays: numValue,
      })),
      updatedAt: new Date().toISOString(),
    }));
  };

  if (!isClient) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Capacity Planning</h2>
        <div className="flex items-center space-x-4">
          <label className="text-sm text-gray-600">Set all to:</label>
          <input
            type="number"
            min="0"
            className="input-field w-24"
            value={bulkValue}
            onChange={(e) => handleBulkUpdate(e.target.value)}
          />
          <span className="text-sm text-gray-600">days</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {capacityData.monthlyCapacities.map(({ month, availableDays }) => (
          <div
            key={month}
            className="p-4 bg-white rounded-lg border border-gray-200 shadow-soft"
          >
            <div className="flex flex-col space-y-2">
              <label
                htmlFor={`capacity-${month}`}
                className="text-sm font-medium text-gray-700"
              >
                {formatMonthYear(month)}
              </label>
              <div className="flex items-center space-x-2">
                <input
                  id={`capacity-${month}`}
                  type="number"
                  min="0"
                  value={availableDays}
                  onChange={(e) =>
                    handleCapacityChange(month, Math.max(0, parseInt(e.target.value) || 0))
                  }
                  className="input-field"
                />
                <span className="text-sm text-gray-600">days</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-sm text-gray-500 italic">
        Last updated: {new Date(capacityData.updatedAt).toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </p>
    </div>
  );
} 