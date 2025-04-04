import { v4 as uuidv4 } from 'uuid';
import { supabase } from './supabase';

export async function migrateLocalStorageToSupabase(userId: string) {
  try {
    // Get data from localStorage
    const stored = localStorage.getItem('roadmapai_initiatives');
    if (!stored) {
      console.log('No data found in localStorage to migrate');
      return;
    }

    const initiatives = JSON.parse(stored);
    
    // Transform data to match new schema
    const transformedInitiatives = initiatives.map((initiative: any) => ({
      id: initiative.id || uuidv4(),
      user_id: userId,
      name: initiative.name,
      value_lever: initiative.valueLever,
      uplift: initiative.uplift,
      confidence: initiative.confidence,
      effort_estimate: initiative.effortEstimate,
      priority_score: initiative.uplift * initiative.confidence / initiative.effortEstimate,
      start_month: initiative.startMonth || null,
      end_month: initiative.endMonth || null,
      is_mandatory: initiative.isMandatory,
      created_at: initiative.createdAt || new Date().toISOString(),
      updated_at: initiative.updatedAt || new Date().toISOString(),
    }));

    // Insert data into Supabase
    const { error } = await supabase
      .from('initiatives')
      .insert(transformedInitiatives);

    if (error) throw error;

    // Clear localStorage after successful migration
    localStorage.removeItem('roadmapai_initiatives');
    console.log('Data migration completed successfully');
  } catch (error) {
    console.error('Error migrating data:', error);
    throw error;
  }
} 