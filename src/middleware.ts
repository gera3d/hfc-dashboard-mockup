import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Temporarily disabled - Supabase uses localStorage for auth, not cookies
  // Client-side protection is handled in dashboard/layout.tsx
  return NextResponse.next();
  
  /* Original middleware - keep for reference when implementing server-side auth
  const path = request.nextUrl.pathname;
  const isPublicPath = path === '/' || path === '/login' || path.startsWith('/_next') || path.startsWith('/api/auth');
  const token = request.cookies.get('hfc-dashboard-auth-token')?.value || '';
  
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  if (path === '/' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
  */
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
