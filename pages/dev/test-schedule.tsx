import React, { useState, useEffect } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { calculateRoadmapSchedule, ScheduledInitiative } from '../../utils/schedulingUtils';
import { DbInitiativeType, DbCapacityType } from '../../types/database';
import MainLayout from '../../components/layout/MainLayout'; // Corrected path again

const TestSchedulePage = () => {
  const supabase = useSupabaseClient();
  const user = useUser();
  const [scheduledInitiatives, setScheduledInitiatives] = useState<ScheduledInitiative[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const runScheduler = async () => {
      if (!user || !supabase) return;

      setIsLoading(true);
      setError(null);
      setScheduledInitiatives(null);

      try {
        // Fetch Initiatives
        const { data: initiativesData, error: initiativesError } = await supabase
          .from('initiatives')
          .select('*')
          .eq('user_id', user.id);

        if (initiativesError) throw new Error(`Error fetching initiatives: ${initiativesError.message}`);
        if (!initiativesData) throw new Error('No initiative data returned.');

        // Fetch Capacity
        const { data: capacityData, error: capacityError } = await supabase
          .from('monthly_capacity')
          .select('*')
          .eq('user_id', user.id)
          .order('month', { ascending: true }); // Ensure capacity is ordered

        if (capacityError) throw new Error(`Error fetching capacity: ${capacityError.message}`);
        if (!capacityData) throw new Error('No capacity data returned.');

        // Cast data to expected types (adjust based on actual Db types if needed)
        const initiatives = initiativesData as DbInitiativeType[];
        const capacity = capacityData as DbCapacityType[];

        // Calculate schedule
        const results = calculateRoadmapSchedule(initiatives, capacity);
        setScheduledInitiatives(results);

      } catch (err: any) {
        console.error("Error running scheduler test:", err);
        setError(err.message || 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    runScheduler();
  }, [user, supabase]);

  return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Scheduling Logic Test Output</h1>

        {isLoading && <p>Loading and calculating schedule...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}

        {scheduledInitiatives && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Calculated Schedule Results:</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
              {JSON.stringify(scheduledInitiatives, null, 2)}
            </pre>
          </div>
        )}

        {!isLoading && !error && !scheduledInitiatives && (
           <p>No schedule data generated yet or an issue occurred before calculation.</p>
        )}
      </div>
    </MainLayout>
  );
};

export default TestSchedulePage; 