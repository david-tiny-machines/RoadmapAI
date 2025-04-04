import { createClient } from '@supabase/supabase-js';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      storage: {
        getItem: (key) => {
          try {
            if (typeof document !== 'undefined') {
              const cookieValue = document.cookie
                .split('; ')
                .find(row => row.startsWith(`${key}=`))
                ?.split('=')[1];
              
              if (cookieValue) {
                return decodeURIComponent(cookieValue);
              }
            }
            return typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
          } catch (error) {
            return null;
          }
        },
        setItem: (key, value) => {
          try {
            if (typeof document !== 'undefined') {
              document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=604800; secure; samesite=lax`;
            }
            if (typeof window !== 'undefined') {
              window.localStorage.setItem(key, value);
            }
          } catch (error) {
            console.error('Storage error:', error);
          }
        },
        removeItem: (key) => {
          try {
            if (typeof document !== 'undefined') {
              document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=lax`;
            }
            if (typeof window !== 'undefined') {
              window.localStorage.removeItem(key);
            }
          } catch (error) {
            console.error('Storage error:', error);
          }
        }
      }
    }
  }
); 