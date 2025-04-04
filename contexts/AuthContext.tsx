import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../utils/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (email: string, password: string) => Promise<User>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => { throw new Error('Not implemented') },
  signUp: async () => { throw new Error('Not implemented') },
  signOut: async () => { throw new Error('Not implemented') },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    console.log('\n=== AUTH PROVIDER INITIALIZATION ===');
    console.log('AuthProvider mounted, checking session...');
    
    let mounted = true;

    // Check active sessions and sets the user
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log('Initial session check:', { 
          hasSession: !!session,
          sessionUser: session?.user ? {
            id: session.user.id,
            email: session.user.email,
            lastSignInAt: session.user.last_sign_in_at
          } : null,
          error: error || null
        });

        if (mounted) {
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error during session initialization:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('\n=== AUTH STATE CHANGE ===');
      console.log('Event:', event);
      console.log('Session state:', {
        hasSession: !!session,
        user: session?.user ? {
          id: session.user.id,
          email: session.user.email,
          lastSignInAt: session.user.last_sign_in_at
        } : null
      });

      if (mounted) {
        setUser(session?.user ?? null);
      }
    });

    return () => {
      mounted = false;
      console.log('AuthProvider unmounting, cleaning up subscription');
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<User> => {
    console.log('\n=== SIGN IN ATTEMPT ===');
    console.log('Starting signIn process for:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    console.log('SignIn response:', { 
      success: !error,
      hasSession: !!data.session,
      user: data.session?.user ? {
        id: data.session.user.id,
        email: data.session.user.email,
        lastSignInAt: data.session.user.last_sign_in_at
      } : null,
      error: error || null
    });
    
    if (error) {
      console.error('SignIn error:', error);
      throw error;
    }
    
    if (!data.session?.user) {
      console.error('No session user after signIn');
      throw new Error('No session established after login');
    }
    
    console.log('Setting user state...');
    setUser(data.session.user);
    
    // Verify session was established
    const { data: { session } } = await supabase.auth.getSession();
    console.log('Post-signin session check:', {
      hasSession: !!session,
      sessionUser: session?.user ? {
        id: session.user.id,
        email: session.user.email
      } : null
    });
    
    return data.session.user;
  };

  const signUp = async (email: string, password: string): Promise<User> => {
    console.log('Starting signUp process');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          email_confirmed: true
        }
      }
    });
    
    console.log('SignUp response:', { signUpData, signUpError });
    
    if (signUpError) throw signUpError;
    if (!signUpData.user) throw new Error('No user returned after signup');

    // Immediately sign in after signup
    console.log('Attempting immediate sign in after signup');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    console.log('Post-signup signin response:', { signInData, signInError });
    
    if (signInError) throw signInError;
    if (!signInData.session?.user) {
      throw new Error('No session established after signup');
    }

    setUser(signInData.session.user);
    return signInData.session.user;
  };

  const signOut = async () => {
    console.log('Starting signOut process');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('SignOut error:', error);
      throw error;
    }
    console.log('SignOut successful');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}