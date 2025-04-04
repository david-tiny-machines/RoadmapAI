import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate URL format
function isValidUrl(urlString: string) {
  try {
    new URL(urlString);
    return true;
  } catch (e) {
    return false;
  }
}

if (!supabaseUrl) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}

if (!isValidUrl(supabaseUrl)) {
  throw new Error(`Invalid NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl}. URL must start with https:// and be properly formatted`);
}

if (!supabaseAnonKey) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Type definitions for our database tables
export type Tables = {
  initiatives: Initiative[];
  historical_metrics: HistoricalMetric[];
  user_profiles: UserProfile[];
};

export interface Initiative {
  id: string;
  user_id: string;
  name: string;
  value_lever: string;
  uplift: number;
  confidence: number;
  effort_estimate: number;
  start_month: string | null;
  end_month: string | null;
  is_mandatory: boolean;
  created_at: string;
  updated_at: string;
}

export interface HistoricalMetric {
  id: string;
  metric_type: 'conversion' | 'loan_size' | 'interest_rate';
  value: number;
  date: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  role: 'admin' | 'user';
  created_at: string;
} 