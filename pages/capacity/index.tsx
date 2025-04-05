import { useState, useEffect } from 'react';
import CapacityManager from '../../components/capacity/CapacityManager';
import { Initiative } from '../../types/initiative';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { Database } from '../../types/supabase';
import { fromDbInitiative } from '../../types/database';

export default function Capacity() {
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabaseClient = useSupabaseClient<Database>();
  const user = useUser();

  useEffect(() => {
    const fetchInitiatives = async () => {
      if (!user || !supabaseClient) return;

      setLoading(true);
      setError(null);

      console.log('Capacity page: Fetching initiatives from Supabase...');
      try {
        const { data, error: dbError } = await supabaseClient
          .from('initiatives')
          .select('*')
          .eq('user_id', user.id)
          .order('priority_score', { ascending: false });

        if (dbError) {
          throw dbError;
        }

        const fetchedInitiatives = data.map(fromDbInitiative);
        console.log('Capacity page: Fetched initiatives:', fetchedInitiatives);
        setInitiatives(fetchedInitiatives);
      } catch (e: any) {
        console.error('Capacity page: Error fetching initiatives:', e);
        setError('Failed to load initiatives. Please try refreshing.');
      } finally {
        setLoading(false);
      }
    };

    fetchInitiatives();
  }, [user, supabaseClient]);

  if (loading) {
    return <div>Loading capacity data...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Capacity Management</h1>
        <p className="mt-2 text-gray-600">
          Set and manage your team's monthly capacity in available working days.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      <CapacityManager initiatives={initiatives} />
    </div>
  );
} 