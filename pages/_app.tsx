import { useState } from 'react';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { SessionContextProvider, Session } from '@supabase/auth-helpers-react';
import { AuthProvider } from '../contexts/AuthContext';
import MainLayout from '../components/layout/MainLayout';
import '../styles/globals.css';
import { Database } from '../types/supabase';

export default function App({ Component, pageProps }: AppProps<{ initialSession: Session }>) {
  const router = useRouter();
  // Create a new supabase browser client on every first render.
  const [supabaseClient] = useState(() => createPagesBrowserClient<Database>());
  const isAuthPage = router.pathname.startsWith('/auth/');

  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={pageProps.initialSession}
    >
      <AuthProvider>
        {isAuthPage ? (
          <Component {...pageProps} />
        ) : (
          <MainLayout>
            <Component {...pageProps} />
          </MainLayout>
        )}
      </AuthProvider>
    </SessionContextProvider>
  );
}
