import { useState, useEffect, useCallback } from 'react';
import { MonthlyCapacity } from '../../types/capacity';
import { getNextNMonths, formatMonthYear, getDefaultCapacity, fromMonthString, formatDateToYYYYMMDD } from '../../utils/dateUtils';
import CapacityChart from './CapacityChart';
import { Initiative } from '../../types/initiative';
import { useAuth } from '../../contexts/AuthContext';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { DbCapacityType, fromDbCapacity, toDbCapacity } from '../../types/database';
import ErrorDisplay from '../shared/ErrorDisplay';

const MONTHS_TO_SHOW = 12;

interface CapacityManagerProps {
  initiatives?: Initiative[];
}

export default function CapacityManager({ initiatives = [] }: CapacityManagerProps) {
  const { user } = useAuth();
  const supabase = useSupabaseClient();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [monthlyCapacities, setMonthlyCapacities] = useState<MonthlyCapacity[]>([]);
  const [bulkUpdateValue, setBulkUpdateValue] = useState<string>('');

  const getDefaultCapacities = useCallback((): MonthlyCapacity[] => {
    const months = getNextNMonths(MONTHS_TO_SHOW);
    return months.map(month => ({
      month,
      availableDays: getDefaultCapacity(),
    }));
  }, []);

  useEffect(() => {
    const fetchCapacity = async () => {
      if (!user) {
        setError("User not logged in.");
        setLoading(false);
        setMonthlyCapacities(getDefaultCapacities());
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const defaultMonths = getDefaultCapacities();
        const firstMonthStr = defaultMonths[0].month;
        const lastMonthStr = defaultMonths[defaultMonths.length - 1].month;
        const firstMonthDbFormat = formatDateToYYYYMMDD(fromMonthString(firstMonthStr));
        const lastMonthDbFormat = formatDateToYYYYMMDD(fromMonthString(lastMonthStr));

        if (!firstMonthDbFormat || !lastMonthDbFormat) {
          throw new Error("Could not determine date range for fetching capacity.");
        }

        const { data, error: dbError } = await supabase
          .from('monthly_capacity')
          .select('*')
          .eq('user_id', user.id)
          .gte('month', firstMonthDbFormat)
          .lte('month', lastMonthDbFormat)
          .order('month', { ascending: true });

        if (dbError) throw dbError;

        const fetchedCapacities: MonthlyCapacity[] = data.map((dbCap: DbCapacityType) => fromDbCapacity(dbCap));

        const mergedCapacities = defaultMonths.map(defaultCap => {
          const fetched = fetchedCapacities.find(fc => fc.month === defaultCap.month);
          return fetched || defaultCap;
        });

        setMonthlyCapacities(mergedCapacities);

      } catch (err: any) {
        console.error("Error fetching capacity data:", err);
        setError(`Failed to load capacity data: ${err.message || 'Unknown error'}`);
        setMonthlyCapacities(getDefaultCapacities());
      } finally {
        setLoading(false);
      }
    };

    fetchCapacity();
  }, [user, supabase, getDefaultCapacities]);

  const handleCapacityChange = async (month: string, value: number) => {
    if (!user) {
      setError("Cannot save capacity: User not logged in.");
      return;
    }
    setError(null);

    const updatedValue = isNaN(value) || value < 0 ? 0 : Math.round(value);

    const originalCapacities = monthlyCapacities;
    setMonthlyCapacities(prev =>
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
      setMonthlyCapacities(originalCapacities);
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

    const originalCapacities = monthlyCapacities;
    const updatedCapacities = monthlyCapacities.map(item => ({
      ...item,
      availableDays: roundedValue
    }));
    setMonthlyCapacities(updatedCapacities);

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
        setMonthlyCapacities(originalCapacities);
    }
  };

  if (loading) {
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
      {error && <ErrorDisplay message={error} onClose={() => setError(null)} />}

      <div className="bg-white p-6 rounded-xl shadow-soft">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <h3 className="text-lg font-semibold text-gray-900">Monthly Capacity</h3>
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
          {monthlyCapacities.map((item) => (
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
      {!loading && monthlyCapacities.length > 0 &&
        <CapacityChart initiatives={initiatives} monthlyCapacities={monthlyCapacities} />
      }
    </div>
  );
} 