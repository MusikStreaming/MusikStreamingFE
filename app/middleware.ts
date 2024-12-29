import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  console.group('🔒 Middleware Check');
  
  // Only check manager routes
  if (request.nextUrl.pathname.startsWith('/manager')) {
    console.log('📍 Route:', request.nextUrl.pathname);
    const sessionToken = request.cookies.get('session_token')?.value;
    const user_id = request.cookies.get('user_id')?.value;

    console.log('🎫 Session token present:', !!sessionToken);
    console.log('👤 User ID present:', !!user_id);

    if (!sessionToken) {
      console.warn('⚠️ No session token - redirecting to login');
      console.groupEnd();
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      console.log('🔍 Verifying manager status...');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/user/${user_id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Accept': 'application/json',
        },
        cache: 'no-store'
      });

      console.log('📥 Verification status:', response.status);

      if (!response.ok) {
        console.error('❌ Role verification failed:', await response.text());
        console.groupEnd();
        return NextResponse.redirect(new URL('/login', request.url));
      }

      const userData = await response.json();
      console.log('👑 User role:', userData.role);
      
      if (!userData.role || !['Artist Manager'].includes(userData.role)) {
        console.warn('⚠️ Unauthorized role:', userData.role);
        console.groupEnd();
        return NextResponse.redirect(new URL('/', request.url));
      }

      console.log('✅ Access granted');
      console.groupEnd();
      return NextResponse.next();
    } catch (error) {
      console.error('❌ Auth verification error:', error);
      console.groupEnd();
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  if (request.nextUrl.pathname.startsWith('/admin')) {
    console.log('📍 Route:', request.nextUrl.pathname);
    const sessionToken = request.cookies.get('session_token')?.value;
    const user_id = request.cookies.get('user_id')?.value;

    console.log('🎫 Session token present:', !!sessionToken);
    console.log('👤 User ID present:', !!user_id);

    if (!sessionToken) {
      console.warn('⚠️ No session token - redirecting to login');
      console.groupEnd();
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      console.log('🔍 Verifying admin status...');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/user/${user_id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Accept': 'application/json',
        },
        cache: 'no-store'
      });

      console.log('📥 Verification status:', response.status);

      if (!response.ok) {
        console.error('❌ Role verification failed:', await response.text());
        console.groupEnd();
        return NextResponse.redirect(new URL('/login', request.url));
      }

      const userData = await response.json();
      console.log('👑 User role:', userData.role);
      
      if (!userData.role || !['Admin'].includes(userData.role)) {
        console.warn('⚠️ Unauthorized role:', userData.role);
        console.groupEnd();
        return NextResponse.redirect(new URL('/', request.url));
      }

      console.log('✅ Access granted');
      console.groupEnd();
      return NextResponse.next();
    } catch (error) {
      console.error('❌ Auth verification error:', error);
      console.groupEnd();
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  console.log('⏩ Skipping middleware check');
  console.groupEnd();
  return NextResponse.next();
}

// Only run middleware on manager routes
export const config = {
  matcher: [
    '/manager/:path*',  // Match all manager routes
  ]
};