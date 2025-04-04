import type { AppProps } from 'next/app';
import MainLayout from '../components/layout/MainLayout';
import { AuthProvider } from '../contexts/AuthContext';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  const isAuthPage = Component.displayName === 'LoginPage' || Component.displayName === 'SignupPage';

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
