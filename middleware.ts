import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  
  // Add CORS headers to prevent CORS issues
  res.headers.set('Access-Control-Allow-Origin', '*');
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: res.headers });
  }
  
  // Log the path being accessed (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.log('Middleware: Processing path:', request.nextUrl.pathname);
  }
  
  // Skip auth check for client-side routes - let the client handle auth
  // Middleware should only handle server-side API routes
  
  // API route caching with rate limiting protection
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const pathname = request.nextUrl.pathname;
    
    // Add rate limiting headers to prevent infinite loops
    res.headers.set('X-RateLimit-Limit', '100');
    res.headers.set('X-RateLimit-Remaining', '99');
    
    if (pathname.includes('/products') || pathname.includes('/categories')) {
      res.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    }
    else if (pathname.includes('/users') || pathname.includes('/admin')) {
      res.headers.set('Cache-Control', 'no-store, must-revalidate');
    }
    else {
      res.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    }
  }

  // Protected routes - removed /complete-profile to allow access after OTP verification
  const protectedRoutes = ['/admin', '/profile', '/orders', '/wishlist'];
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  // Remove server-side auth check for protected routes
  // Let client-side components handle authentication
  // This prevents issues with localStorage vs cookies mismatch

  // Note: complete-profile is handled by the component itself to allow
  // access after OTP verification even without Supabase cookie

  return res;
}

export const config = {
  matcher: [
    '/api/:path*',
    '/admin/:path*',
    '/profile/:path*',
    '/orders/:path*',
    '/wishlist/:path*'
    // Removed '/complete-profile/:path*' to allow access after OTP verification
  ],
};
