import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect logic remains the same - only redirect if definitively not logged in
    if (!loading && !user && !router.pathname.startsWith('/auth/')) {
      router.push(`/auth/signin?redirectTo=${encodeURIComponent(router.asPath)}`);
    }
  }, [user, loading, router]);

  // If we are still loading the auth state, show a simple loading indicator.
  // This prevents rendering children prematurely or returning null abruptly.
  if (loading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  // If not loading AND we have a user, render the children.
  if (!loading && user) {
    return <>{children}</>;
  }

  // If not loading and no user, the redirect effect should have already fired.
  // Return null (or the loading indicator again) while the redirect happens.
  return <div>Loading...</div>; // Or null
} 