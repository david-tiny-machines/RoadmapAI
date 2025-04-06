import { useState, useEffect, useCallback } from 'react';
import { MonthlyCapacity } from '../../types/capacity';
import { formatMonthYear, fromMonthString, formatDateToYYYYMMDD } from '../../utils/dateUtils';
import CapacityChart from './CapacityChart';
import { ScheduledInitiative, MonthlyAllocationMap } from '../../utils/schedulingUtils';
import { useAuth } from '../../contexts/AuthContext';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { toDbCapacity } from '../../types/database';
import ErrorDisplay from '../shared/ErrorDisplay';

interface CapacityManagerProps {
  scheduledInitiatives: ScheduledInitiative[];
  monthlyCapacities: MonthlyCapacity[];
  monthlyAllocation: MonthlyAllocationMap;
}

export default function CapacityManager({ scheduledInitiatives, monthlyCapacities, monthlyAllocation }: CapacityManagerProps) {
  const { user } = useAuth();
  const supabase = useSupabaseClient();

  const [error, setError] = useState<string | null>(null);
  const [currentMonthlyCapacities, setCurrentMonthlyCapacities] = useState<MonthlyCapacity[]>(monthlyCapacities);
  const [bulkUpdateValue, setBulkUpdateValue] = useState<string>('');

  useEffect(() => {
    setCurrentMonthlyCapacities(monthlyCapacities);
  }, [monthlyCapacities]);

  const handleCapacityChange = async (month: string, value: number) => {
    if (!user) {
      setError("Cannot save capacity: User not logged in.");
      return;
    }
    setError(null);

    const updatedValue = isNaN(value) || value < 0 ? 0 : Math.round(value);

    const originalCapacities = currentMonthlyCapacities;
    setCurrentMonthlyCapacities(prev =>
      prev.map(mc =>
        mc.month === month ? { ...mc, availableDays: updatedValue } : mc
      )
    );

    const capacityToSave: MonthlyCapacity = { month, availableDays: updatedValue };
    try {
      const dbData = toDbCapacity(capacityToSave, user.id);

      const { error: upsertError } = await supabase
        .from('monthly_capacity')
        .upsert(dbData, { onConflict: 'user_id, month' });

      if (upsertError) throw upsertError;

    } catch (err: any) {
      console.error("Error saving capacity:", err);
      setError(`Failed to save capacity for ${formatMonthYear(month)}: ${err.message || 'Unknown error'}`);
      setCurrentMonthlyCapacities(originalCapacities);
    }
  };

  const handleBulkUpdate = async () => {
    if (!user) {
      setError("Cannot save capacity: User not logged in.");
      return;
    }
    setError(null);

    const value = parseFloat(bulkUpdateValue);
    if (isNaN(value) || value < 0) {
        setError("Please enter a valid non-negative number for bulk update.");
        return;
    }
    const roundedValue = Math.round(value);

    const originalCapacities = currentMonthlyCapacities;
    const updatedCapacities = currentMonthlyCapacities.map(item => ({
      ...item,
      availableDays: roundedValue
    }));
    setCurrentMonthlyCapacities(updatedCapacities);

    try {
      const dbDataArray = updatedCapacities.map(cap => toDbCapacity(cap, user.id));

      const { error: upsertError } = await supabase
        .from('monthly_capacity')
        .upsert(dbDataArray, { onConflict: 'user_id, month' });

      if (upsertError) throw upsertError;

      setBulkUpdateValue('');

    } catch (err: any) {
        console.error("Error performing bulk capacity update:", err);
        setError(`Failed to save bulk capacity update: ${err.message || 'Unknown error'}`);
        setCurrentMonthlyCapacities(originalCapacities);
    }
  };

  return (
    <div className="space-y-6">
      {error && <ErrorDisplay message={error} onClose={() => setError(null)} />}

      <div className="bg-white p-6 rounded-xl shadow-soft">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <h3 className="text-lg font-semibold text-gray-900">Set Monthly Capacity</h3>
          <div className="flex items-center space-x-2">
              <input
                type="number"
                min="0"
                value={bulkUpdateValue}
                onChange={(e) => setBulkUpdateValue(e.target.value)}
                placeholder="Set all to..."
                className="w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={!user}
              />
              <button
                onClick={handleBulkUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!user || !bulkUpdateValue}
              >
                Apply
              </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentMonthlyCapacities.map((item) => (
            <div key={item.month} className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">{formatMonthYear(item.month)}</h4>
              <input
                type="number"
                min="0"
                value={item.availableDays}
                onChange={(e) => handleCapacityChange(item.month, parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Available days"
                disabled={!user}
              />
            </div>
          ))}
        </div>
      </div>
      {currentMonthlyCapacities.length > 0 &&
        <CapacityChart
          monthlyCapacities={currentMonthlyCapacities}
          monthlyAllocation={monthlyAllocation}
        />
      }
    </div>
  );
} 