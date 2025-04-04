import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import InitiativeList from '../../components/initiatives/InitiativeList';
import InitiativeForm from '../../components/initiatives/InitiativeForm';
import { Initiative } from '../../types/initiative';
import { sortInitiativesByPriority } from '../../utils/prioritizationUtils';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { migrateLocalStorageToSupabase } from '../../utils/migrateData';

export default function Initiatives() {
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasLocalData, setHasLocalData] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    console.log('Initiatives page mounted, user:', user);
    fetchInitiatives();
    checkLocalStorage();
  }, [user]);

  const checkLocalStorage = () => {
    const stored = localStorage.getItem('roadmapai_initiatives');
    setHasLocalData(!!stored);
  };

  const fetchInitiatives = async () => {
    try {
      console.log('Fetching initiatives for user:', user?.id);
      const { data, error } = await supabase
        .from('initiatives')
        .select('*')
        .order('is_mandatory', { ascending: false })
        .order('priority_score', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      console.log('Fetched initiatives:', data);
      setInitiatives(data || []);
    } catch (error) {
      console.error('Error fetching initiatives:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMigration = async () => {
    if (!user) return;
    try {
      await migrateLocalStorageToSupabase(user.id);
      setHasLocalData(false);
      await fetchInitiatives();
    } catch (error) {
      console.error('Error during migration:', error);
    }
  };

  const handleSubmit = async (initiative: Omit<Initiative, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'priority_score'>) => {
    try {
      const newInitiative = {
        ...initiative,
        id: uuidv4(),
        user_id: user?.id,
        priority_score: initiative.uplift * initiative.confidence / initiative.effort_estimate
      };

      const { error } = await supabase
        .from('initiatives')
        .insert([newInitiative]);

      if (error) throw error;
      
      await fetchInitiatives();
    } catch (error) {
      console.error('Error adding initiative:', error);
    }
  };

  const handleUpdate = async (updatedInitiative: Initiative) => {
    try {
      const { error } = await supabase
        .from('initiatives')
        .update({
          ...updatedInitiative,
          priority_score: updatedInitiative.uplift * updatedInitiative.confidence / updatedInitiative.effort_estimate,
          updated_at: new Date().toISOString()
        })
        .eq('id', updatedInitiative.id);

      if (error) throw error;
      
      await fetchInitiatives();
    } catch (error) {
      console.error('Error updating initiative:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('initiatives')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchInitiatives();
    } catch (error) {
      console.error('Error deleting initiative:', error);
    }
  };

  if (loading) {
    return <div>Loading initiatives...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Initiatives</h1>
        {hasLocalData && (
          <button
            onClick={handleMigration}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Migrate Local Data
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 gap-8">
        <InitiativeForm onSubmit={handleSubmit} />
        <InitiativeList
          initiatives={initiatives}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}

Initiatives.displayName = 'InitiativesPage'; 