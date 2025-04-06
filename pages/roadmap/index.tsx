import React, { useState, useEffect } from 'react';
import { useSupabaseClient, useSessionContext } from '@supabase/auth-helpers-react';
import { Database } from '@/types/supabase';
import { Initiative, fromDbInitiative } from '@/types/database';
import { calculateRoadmapSchedule, ScheduledInitiative } from '@/utils/schedulingUtils';
import RoadmapGantt from '@/components/roadmap/RoadmapGantt';
import ErrorDisplay from '@/components/shared/ErrorDisplay';

type DbInitiative = Database['public']['Tables']['initiatives']['Row'];
type DbCapacity = Database['public']['Tables']['monthly_capacity']['Row'];

const RoadmapPage: React.FC = () => {
  const supabase = useSupabaseClient<Database>();
  const { session, isLoading: isLoadingSession } = useSessionContext();
  const [scheduledInitiatives, setScheduledInitiatives] = useState<ScheduledInitiative[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoadingSession) {
      // Still waiting for session info
      return;
    }
    if (!session) {
        // No user logged in, stop loading and potentially show a message
        setIsLoading(false);
        setError("User not logged in.");
        return;
    }

    const fetchDataAndCalculateSchedule = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch Initiatives
        const { data: initiativesData, error: initiativesError } = await supabase
          .from('initiatives')
          .select('*');

        if (initiativesError) throw new Error(`Failed to fetch initiatives: ${initiativesError.message}`);
        if (!initiativesData) throw new Error('No initiatives data returned from query.');
        
        // Convert fetched DbInitiative[] to Initiative[]
        const frontendInitiatives = (initiativesData as DbInitiative[])
            .map(fromDbInitiative)
            .filter((i): i is Initiative => i !== null);

        // Fetch Capacity
        const { data: capacityData, error: capacityError } = await supabase
          .from('monthly_capacity')
          .select('*')
          .order('month', { ascending: true });

        if (capacityError) throw new Error(`Failed to fetch capacity: ${capacityError.message}`);
        if (!capacityData) throw new Error('No capacity data returned from query. Please set capacity.');
        
        const dbCapacity = capacityData as DbCapacity[]; // Ensure correct type for scheduler

        // Calculate Schedule using frontendInitiatives
        const scheduleResult = calculateRoadmapSchedule(frontendInitiatives, dbCapacity);
        setScheduledInitiatives(scheduleResult.scheduledInitiatives);

      } catch (err) {
        console.error('Error fetching data or calculating schedule:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDataAndCalculateSchedule();

  }, [supabase, session, isLoadingSession]);

  return (
    <>
      <h1 className="text-2xl font-semibold mb-4">Roadmap Schedule</h1>
      {isLoading && <p>Loading roadmap...</p>}
      {error && <ErrorDisplay message={`Failed to load roadmap: ${error}`} />}
      {!isLoading && !error && (
         scheduledInitiatives.length > 0 ? (
            <div>
                {/* Remove placeholder text */}
                {/* <p className="mb-4">Roadmap Gantt chart will be displayed here once the component is created.</p> */}
                <RoadmapGantt scheduledInitiatives={scheduledInitiatives} />
            </div>
         ) : (
            <p>No initiatives scheduled. Ensure you have added initiatives and set monthly capacity.</p>
         )
      )}
    </>
  );
};

export default RoadmapPage;
