# Authentication Implementation Documentation

## Overview

RoadmapAI implements authentication using Supabase Auth, providing a secure and straightforward user authentication system. The implementation supports both client-side and server-side authentication with session persistence across page reloads.

## Quick Start

1. Install dependencies:
```bash
npm install @supabase/auth-helpers-nextjs @supabase/supabase-js
```

2. Set environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

3. Create auth context (`contexts/AuthContext.tsx`):
```typescript
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (mounted) {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
```

4. Configure Supabase client (`utils/supabase.ts`):
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
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
});
```

5. Add middleware protection (`middleware.ts`):
```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const isProtectedRoute = req.nextUrl.pathname.startsWith('/initiatives');
  const isAuthRoute = req.nextUrl.pathname.startsWith('/auth');

  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (isProtectedRoute && !session) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    if (isAuthRoute && session) {
      return NextResponse.redirect(new URL('/initiatives', req.url));
    }

    return res;
  } catch (error) {
    return res;
  }
}
```

6. Wrap your app with the AuthProvider (`pages/_app.tsx`):
```typescript
import { AuthProvider } from '../contexts/AuthContext';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
```

## Core Components

### 1. Authentication Context (`contexts/AuthContext.tsx`)
- Provides global authentication state management
- Implements core authentication functions:
  - `signIn(email, password)`
  - `signUp(email, password)`
  - `signOut()`
- Manages user state and loading states
- Handles session initialization and auth state changes

### 2. Supabase Client Configuration (`utils/supabase.ts`)
- Implements hybrid storage strategy using both cookies and localStorage
- Validates environment variables
- Handles both client-side and server-side scenarios
- Custom storage implementation with:
  - Primary storage in cookies for better security
  - Fallback to localStorage when cookies are unavailable

### 3. Middleware Protection (`middleware.ts`)
- Protects routes based on authentication state
- Implements route guards:
  - Redirects unauthenticated users to login
  - Prevents authenticated users from accessing auth pages
  - Handles session verification

## Storage Implementation

### Token Storage Strategy
```typescript
// Primary storage in cookies
document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=604800; secure; samesite=lax`;

// Backup storage in localStorage
window.localStorage.setItem(key, value);
```

### Security Features
- Secure cookie attributes:
  - `secure`: HTTPS only
  - `samesite=lax`: CSRF protection
  - `max-age=604800`: 7-day expiration
- Fallback mechanism for environments without cookie support
- Encryption of sensitive data in transit

## Session Management
- PKCE flow for enhanced security
- Session persistence across page reloads
- Automatic token refresh
- Robust error handling

## Integration Points

### 1. Protected Routes
- All routes under `/initiatives/*` require authentication
- Auth routes (`/auth/*`) are accessible only to unauthenticated users
- Main layout automatically handles auth state display

### 2. User Interface
- Login page (`/auth/login`)
- Signup page (`/auth/signup`)
- Auth state indicators in navigation
- Loading states during authentication

## Error Handling

### Client-Side Errors
- Form validation errors
- Network request failures
- Session expiration
- Token refresh failures

### Server-Side Errors
- Invalid session tokens
- Database connection issues
- Environment configuration issues

## Phase 3 Integration

As per the PRD, Phase 3 ("Forecasting Engine & Data Infrastructure") includes:
- Basic authentication (implemented)
- User management
- Data persistence layer
- Historical metrics storage

The current implementation aligns with Phase 3 requirements while maintaining:
- Local storage for initiatives (until Phase 4)
- Supabase authentication
- User profile management
- Secure session handling

## Future Enhancements

### Phase 4 Preparation
- Real-time collaboration support
- Enhanced user permissions
- Complete transition to Supabase storage
- Team-based access controls 