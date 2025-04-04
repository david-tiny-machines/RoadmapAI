import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  console.log('Middleware - Request path:', req.nextUrl.pathname);

  // Check if the request is for a protected route
  const isProtectedRoute = req.nextUrl.pathname.startsWith('/initiatives');
  const isAuthRoute = req.nextUrl.pathname.startsWith('/auth');

  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    console.log('Middleware - Session check:', { hasSession: !!session, error });

    if (isProtectedRoute && !session) {
      // Redirect to login if accessing protected route without session
      console.log('Middleware - No session, redirecting to login');
      const redirectUrl = new URL('/auth/login', req.url);
      return NextResponse.redirect(redirectUrl);
    }

    if (isAuthRoute && session) {
      // Redirect to initiatives if accessing auth routes with session
      console.log('Middleware - Has session, redirecting to initiatives');
      const redirectUrl = new URL('/initiatives', req.url);
      return NextResponse.redirect(redirectUrl);
    }

    return res;
  } catch (error) {
    console.error('Middleware - Error:', error);
    return res;
  }
}

export const config = {
  matcher: ['/initiatives/:path*', '/auth/:path*']
}; 