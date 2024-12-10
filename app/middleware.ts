import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Only check manager routes
  if (request.nextUrl.pathname.startsWith('/manager')) {
    const sessionToken = request.cookies.get('session_token')?.value;

    if (!sessionToken) {
      console.log('No session token found');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      // Verify manager status with backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/user`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Accept': 'application/json',
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        console.error('Failed to verify user role:', await response.text());
        return NextResponse.redirect(new URL('/login', request.url));
      }

      const userData = await response.json();
      console.log('User role:', userData.role); // Debug log
      
      // Check if user has manager privileges
      if (!userData.role || !['Artist Manager', 'Admin'].includes(userData.role)) {
        console.log('User role not authorized:', userData.role);
        // Redirect unauthorized users to home page
        return NextResponse.redirect(new URL('/', request.url));
      }

      // Allow the request to proceed
      return NextResponse.next();
    } catch (error) {
      console.error('Auth verification failed:', error);
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

// Only run middleware on manager routes
export const config = {
  matcher: [
    '/manager/:path*',  // Match all manager routes
  ]
}; 