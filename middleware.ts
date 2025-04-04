import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  console.log('Middleware executing for path:', req.nextUrl.pathname);
  
  // Only run middleware for specific routes
  const protectedPaths = ['/initiatives', '/capacity'];
  const authPaths = ['/auth/login', '/auth/signup'];
  const isProtectedPath = protectedPaths.some(path => req.nextUrl.pathname === path);
  const isAuthPath = authPaths.some(path => req.nextUrl.pathname === path);

  // If not a protected or auth path, skip middleware
  if (!isProtectedPath && !isAuthPath) {
    console.log('Not a protected or auth path, skipping middleware');
    return NextResponse.next();
  }

  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();

  console.log('Middleware - Current path:', req.nextUrl.pathname);
  console.log('Middleware - Session:', session ? 'exists' : 'none');
  console.log('Middleware - Protected Path:', isProtectedPath);
  console.log('Middleware - Auth Path:', isAuthPath);

  // Handle protected routes
  if (isProtectedPath && !session) {
    console.log('Middleware - Redirecting to login (no session)');
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  // Handle auth routes
  if (isAuthPath && session) {
    console.log('Middleware - Redirecting to initiatives (has session)');
    return NextResponse.redirect(new URL('/initiatives', req.url));
  }

  return res;
}

// Match all routes except static files and api
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 