import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { AuthProvider } from '../contexts/AuthContext';
import MainLayout from '../components/layout/MainLayout';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isAuthPage = router.pathname.startsWith('/auth/');

  return (
    <AuthProvider>
      {isAuthPage ? (
        <Component {...pageProps} />
      ) : (
        <MainLayout>
          <Component {...pageProps} />
        </MainLayout>
      )}
    </AuthProvider>
  );
}
