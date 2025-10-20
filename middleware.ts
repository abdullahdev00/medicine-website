import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  if (request.nextUrl.pathname.startsWith('/api/')) {
    const pathname = request.nextUrl.pathname;
    
    if (pathname.includes('/products') || pathname.includes('/categories')) {
      response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    }
    
    else if (pathname.includes('/users') || pathname.includes('/admin')) {
      response.headers.set('Cache-Control', 'no-store, must-revalidate');
    }
    
    else {
      response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    }
  }

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
