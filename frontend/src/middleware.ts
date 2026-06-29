// ============================================================
// Protected Route Middleware
// ============================================================

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface TokenPayload {
  id: string;
  email?: string;
  phone?: string;
  role: string;
  status: string;
  iat?: number;
  exp?: number;
}

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/verify-phone',
  '/about',
  '/contact',
  '/faq',
  '/privacy',
  '/terms',
  '/success-stories',
  '/marketplace'
];

// Routes that require specific roles
const ROLE_PROTECTED_ROUTES: Record<string, string[]> = {
  '/admin': ['super_admin'],
  '/centre': ['centre_admin', 'centre_staff'],
  '/staff': ['centre_staff'],
  '/dashboard': ['free_member', 'paid_member', 'centre_admin', 'centre_staff', 'super_admin'],
  '/matches': ['free_member', 'paid_member'],
  '/inbox': ['free_member', 'paid_member'],
  '/membership': ['free_member', 'paid_member'],
  '/settings': ['free_member', 'paid_member', 'centre_admin', 'centre_staff', 'super_admin']
};

function decodeToken(token: string): TokenPayload | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('access_token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '') ||
    (typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null);

  // Check if route is public
  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // If public route and no token, continue
  if (isPublicRoute && !token) {
    return NextResponse.next();
  }

  // If public route with token, redirect to dashboard
  if (isPublicRoute && token) {
    const decoded = decodeToken(token);
    if (decoded && decoded.status !== 'banned') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Protected routes require authentication
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const decoded = decodeToken(token);
  if (!decoded) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    loginUrl.searchParams.set('expired', 'true');
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('access_token');
    response.cookies.delete('refresh_token');
    return response;
  }

  // Check if user is banned
  if (decoded.status === 'banned') {
    const response = NextResponse.redirect(new URL('/banned', request.url));
    response.cookies.delete('access_token');
    response.cookies.delete('refresh_token');
    return response;
  }

  // Check role-based access
  const matchedRoute = Object.keys(ROLE_PROTECTED_ROUTES).find(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (matchedRoute) {
    const requiredRoles = ROLE_PROTECTED_ROUTES[matchedRoute];
    if (requiredRoles && !requiredRoles.includes(decoded.role)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // Add user info to headers for server components
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', decoded.id);
  requestHeaders.set('x-user-role', decoded.role);
  requestHeaders.set('x-user-status', decoded.status);

  return NextResponse.next({
    request: {
      headers: requestHeaders
    }
  });
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public|.*\\..*).*)'
  ]
};
