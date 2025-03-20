import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // This is a simplified client-side authentication middleware
  // In a production app, you'd verify JWT tokens or session cookies
  
  // For our demo, we'll just check if the route is protected
  // and let the client-side auth handle the actual authentication
  
  const { pathname } = request.nextUrl;
  
  // Public paths that don't require authentication
  const publicPaths = ['/login', '/signup'];
  
  const isPublicPath = publicPaths.includes(pathname);
  
  // In a real application with server-side auth, you'd check for a valid token/cookie here
  // For our client-side auth, we'll just handle redirects
  
  return NextResponse.next();
}

// Add paths that should be checked by the middleware
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}; 