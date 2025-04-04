import { createClient } from '@supabase/supabase-js';
import { logger } from './logger';

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

logger.log('Initializing Supabase client', {
  url: supabaseUrl,
  hasAnonKey: !!supabaseAnonKey,
  environment: typeof window === 'undefined' ? 'server' : 'client'
});

// Get the current domain from the window object if it exists
const domain = typeof window !== 'undefined' ? window.location.hostname : '';

// Create a debug-friendly storage implementation
const createStorage = () => {
  if (typeof window === 'undefined') {
    console.log('Creating server-side storage implementation');
    return {
      getItem: (key: string) => {
        console.log('Server-side getItem called for key:', key);
        return null;
      },
      setItem: (key: string, value: string) => {
        console.log('Server-side setItem called:', { key, value });
      },
      removeItem: (key: string) => {
        console.log('Server-side removeItem called for key:', key);
      }
    };
  }

  console.log('Creating client-side storage implementation');
  return {
    getItem: (key: string) => {
      const value = window.localStorage.getItem(key);
      console.log('Client-side getItem:', { key, value });
      return value;
    },
    setItem: (key: string, value: string) => {
      console.log('Client-side setItem:', { key, value });
      window.localStorage.setItem(key, value);
    },
    removeItem: (key: string) => {
      console.log('Client-side removeItem:', { key });
      window.localStorage.removeItem(key);
    }
  };
};

// Create the Supabase client with both cookie and localStorage handling
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: {
      getItem: (key: string) => {
        try {
          // Try cookies first
          if (typeof document !== 'undefined') {
            const cookieValue = document.cookie
              .split('; ')
              .find(row => row.startsWith(`${key}=`))
              ?.split('=')[1];
            
            if (cookieValue) {
              return decodeURIComponent(cookieValue);
            }
          }

          // Fallback to localStorage
          if (typeof window !== 'undefined') {
            return window.localStorage.getItem(key);
          }

          return null;
        } catch (error) {
          logger.error('Error in getItem', { key, error });
          return null;
        }
      },
      setItem: (key: string, value: string) => {
        try {
          // Set in both cookie and localStorage
          if (typeof document !== 'undefined') {
            document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=604800; secure; samesite=lax`;
          }

          if (typeof window !== 'undefined') {
            window.localStorage.setItem(key, value);
          }
        } catch (error) {
          logger.error('Error in setItem', { key, error });
        }
      },
      removeItem: (key: string) => {
        try {
          // Remove from both cookie and localStorage
          if (typeof document !== 'undefined') {
            document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=lax`;
          }

          if (typeof window !== 'undefined') {
            window.localStorage.removeItem(key);
          }
        } catch (error) {
          logger.error('Error in removeItem', { key, error });
        }
      }
    }
  }
});

// Log when the Supabase client is created
logger.log('Supabase client created');

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