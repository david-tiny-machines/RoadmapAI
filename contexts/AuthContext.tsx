import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, AuthError, SupabaseClient } from '@supabase/supabase-js';
import { useSessionContext } from '@supabase/auth-helpers-react';
import { Database } from '../types/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null; user: User | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { session, isLoading, supabaseClient, error: sessionError } = useSessionContext();

  useEffect(() => {
    if (sessionError) {
      console.error("Session Context Error:", sessionError.message);
    }
  }, [sessionError]);

  const ensureUserProfile = async (user: User, client: SupabaseClient) => {
    if (!client) return;
    try {
      const { data: existingProfile, error: fetchError } = await client
        .from('user_profiles')
        .select('id, email, role')
        .eq('id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching user profile:', fetchError);
        return;
      }

      if (!existingProfile) {
        console.log('Creating user profile for:', user.email);
        const { error: insertError } = await client
          .from('user_profiles')
          .upsert({
            id: user.id,
            email: user.email ?? 'FallbackEmailOnError',
            role: 'user'
          }, {
            onConflict: 'id'
          });

        if (insertError) {
          console.error('Error creating user profile:', insertError);
        }
      } else {
        // Optional: Update profile if needed (e.g., email change)
        // console.log('User profile exists for:', user.email);
      }
    } catch (error) {
      console.error('Error managing user profile:', error);
    }
  };

  useEffect(() => {
    const currentUser = session?.user;
    if (currentUser && supabaseClient) {
      ensureUserProfile(currentUser, supabaseClient);
    }
  }, [session?.user, supabaseClient]);

  const value: AuthContextType = {
    user: session?.user ?? null,
    loading: isLoading,
    signIn: async (email: string, password: string) => {
      if (!supabaseClient) return { error: new AuthError('Supabase client not available') };
      const { error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    },
    signUp: async (email: string, password: string) => {
      if (!supabaseClient) return { error: new AuthError('Supabase client not available'), user: null };
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
      });
      return { error, user: data?.user ?? null };
    },
    signOut: async () => {
      if (!supabaseClient) return { error: new AuthError('Supabase client not available') };
      try {
        const { error } = await supabaseClient.auth.signOut();
        return { error };
      } catch (err) {
        console.error('Error during sign out:', err);
        const authError = err instanceof AuthError ? err : new AuthError(String(err));
        return { error: authError };
      }
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 