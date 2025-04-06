import { useState, useEffect, useMemo } from 'react';
import CapacityManager from '../../components/capacity/CapacityManager';
import { Initiative } from '../../types/initiative';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { Database } from '../../types/supabase';
import { fromDbInitiative, DbInitiativeType, DbCapacityType, fromDbCapacity } from '../../types/database';
import { calculateRoadmapSchedule, ScheduledInitiative, MonthlyAllocationMap, ScheduleResult } from '../../utils/schedulingUtils';
import { MonthlyCapacity } from '../../types/capacity';
import ErrorDisplay from '../../components/shared/ErrorDisplay';
import { getNextNMonths, fromMonthString, formatDateToYYYYMMDD, getDefaultCapacity } from '../../utils/dateUtils';

const MONTHS_TO_SHOW = 12; // Ensure this matches CapacityManager if still used there

export default function Capacity() {
  const [initiatives, setInitiatives] = useState<DbInitiativeType[]>([]);
  const [monthlyCapacities, setMonthlyCapacities] = useState<MonthlyCapacity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabaseClient = useSupabaseClient<Database>();
  const user = useUser();

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !supabaseClient) return;

      setLoading(true);
      setError(null);

      try {
        // Define the date range for capacity fetching
        const defaultMonthsCapacity = getNextNMonths(MONTHS_TO_SHOW).map(month => ({
          month,
          availableDays: getDefaultCapacity(),
        }));
        const firstMonthStr = defaultMonthsCapacity[0].month;
        const lastMonthStr = defaultMonthsCapacity[defaultMonthsCapacity.length - 1].month;
        const firstMonthDbFormat = formatDateToYYYYMMDD(fromMonthString(firstMonthStr));
        const lastMonthDbFormat = formatDateToYYYYMMDD(fromMonthString(lastMonthStr));

        if (!firstMonthDbFormat || !lastMonthDbFormat) {
          throw new Error("Could not determine date range for fetching capacity.");
        }

        // Fetch initiatives and capacity in parallel
        const [initiativeResult, capacityResult] = await Promise.all([
          supabaseClient
            .from('initiatives')
            .select('*')
            .order('priority_score', { ascending: false }),
          supabaseClient
            .from('monthly_capacity')
            .select('*')
            .gte('month', firstMonthDbFormat)
            .lte('month', lastMonthDbFormat)
            .order('month', { ascending: true })
        ]);

        const { data: initiativeData, error: initiativeError } = initiativeResult;
        const { data: capacityData, error: capacityError } = capacityResult;

        if (initiativeError) throw initiativeError;
        if (capacityError) throw capacityError;

        const fetchedInitiatives: DbInitiativeType[] = initiativeData || [];
        const fetchedCapacities: MonthlyCapacity[] = (capacityData as DbCapacityType[] || []).map(fromDbCapacity);

        // Merge fetched capacity with defaults for the full range
        const mergedCapacities = defaultMonthsCapacity.map(defaultCap => {
          const fetched = fetchedCapacities.find(fc => fc.month === defaultCap.month);
          return fetched || defaultCap;
        });

        setInitiatives(fetchedInitiatives);
        setMonthlyCapacities(mergedCapacities);

      } catch (e: any) {
        console.error('Capacity page: Error fetching data:', e);
        setError(`Failed to load data: ${e.message || 'Unknown error'}. Please try refreshing.`);
        // Provide defaults on error to prevent crashing lower components
        setInitiatives([]);
        setMonthlyCapacities(getNextNMonths(MONTHS_TO_SHOW).map(month => ({ month, availableDays: getDefaultCapacity() })));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, supabaseClient]);

  // Calculate the schedule once data is loaded - now returns ScheduleResult
  const scheduleResult: ScheduleResult = useMemo(() => {
    if (loading || !initiatives.length || !monthlyCapacities.length) {
      return { scheduledInitiatives: [], monthlyAllocation: {} }; // Return empty result object
    }
    // Convert MonthlyCapacity back to DbCapacityType for the scheduler function
    const dbCapacities: DbCapacityType[] = monthlyCapacities.map(mc => ({
        id: '', // Provide dummy values for fields not used by scheduler
        user_id: user?.id || '',
        month: formatDateToYYYYMMDD(fromMonthString(mc.month)) || '',
        available_days: mc.availableDays,
        created_at: '',
        updated_at: ''
    })).filter(dbCap => dbCap.month);

    // Convert DbInitiativeType[] to Initiative[] for the scheduler
    const frontendInitiatives = initiatives.map(fromDbInitiative).filter((i): i is Initiative => i !== null);

    return calculateRoadmapSchedule(frontendInitiatives, dbCapacities);
  }, [initiatives, monthlyCapacities, loading, user]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Capacity Plan</h1>
        <p className="mt-2 text-gray-600">
          View scheduled initiative load against your team&apos;s available capacity.
        </p>
      </div>

      {loading && (
         <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-soft">
            <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-4 text-gray-600">Loading capacity & schedule data...</span>
            </div>
            </div>
        </div>
      )}

      {error && !loading && (
        <ErrorDisplay message={error} onClose={() => setError(null)} />
      )}

      {!loading && !error && (
        <CapacityManager
          // Pass down the relevant parts of the scheduleResult
          scheduledInitiatives={scheduleResult.scheduledInitiatives}
          monthlyCapacities={monthlyCapacities} // Still needed for the input fields
          monthlyAllocation={scheduleResult.monthlyAllocation} // Pass the new allocation map
        />
      )}
    </div>
  );
} 