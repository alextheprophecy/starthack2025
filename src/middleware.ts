import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // This is a simplified client-side authentication middleware
  // In a production app, you'd verify JWT tokens or session cookies
  
  const { pathname } = request.nextUrl;
  
  // Public paths that don't require authentication
  const publicPaths = ['/login', '/signup', '/_next', '/api', '/favicon.ico'];
  
  // Internal paths that require internal user type
  const internalPaths = ['/internal'];
  
  // Check if the current path is public
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
  
  // Check if the current path is an internal path
  const isInternalPath = internalPaths.some(path => pathname.startsWith(path));
  
  // Get user from session storage (this is client-side only, so we rely on client redirects)
  // In a real app, you would use cookies or JWT tokens that can be validated server-side
  
  if (isPublicPath) {
    return NextResponse.next();
  }
  
  // For internal paths, client-side checks will handle user type validation
  
  return NextResponse.next();
}

// Add paths that should be checked by the middleware
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}; 