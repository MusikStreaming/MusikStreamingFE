import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  console.group('👑 Admin Check');
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session_token");

    if (!sessionToken?.value) {
      console.warn('⚠️ No admin session token');
      console.groupEnd();
      return NextResponse.json({ isAdmin: false }, { status: 401 });
    }

    // First verify user data
    console.log('🔍 Debug: Verifying user data...');
    const debugResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/user/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${sessionToken.value}`,
        'Accept': 'application/json',
      },
      cache: 'no-store'
    });

    console.log('📥 Debug response status:', debugResponse.status);
    
    if (debugResponse.ok) {
      const debugData = await debugResponse.json();
      const userData = debugData.data; // Access nested data
      console.log('🔎 Token belongs to:', {
        id: userData.id,
        username: userData.username,
        role: userData.role,
        email: userData.email
      });

      // Check admin status directly
      if (userData.role !== 'Admin') {
        console.warn('⚠️ Not an admin:', userData.role);
        console.groupEnd();
        return NextResponse.json({ isAdmin: false }, { status: 403 });
      }

      console.log('✅ Admin verified');
      console.groupEnd();
      return NextResponse.json({ isAdmin: true }, { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
    } else {
      console.warn('⚠️ Debug check failed:', await debugResponse.text());
    }

    // Continue with existing admin verification
    console.log('🔍 Proceeding with admin verification...');
    console.log('🔍 Verifying admin status...');
    const userInfoResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/user/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${sessionToken.value}`,
        'Accept': 'application/json',
      },
      cache: 'no-store'
    });

    console.log('📥 Admin verify status:', userInfoResponse.status);
    
    if (!userInfoResponse.ok) {
      console.warn('⚠️ Admin verification failed');
      console.groupEnd();
      return NextResponse.json({ isAdmin: false }, { status: userInfoResponse.status });
    }

    const userData = await userInfoResponse.json();
    console.log('👤 User role:', userData.role);
    
    if (userData.role !== 'Admin') {
      return NextResponse.json({ isAdmin: false }, { status: 403 });
    }

    console.log('✅ Admin check completed');
    console.groupEnd();
    return NextResponse.json({
      isAdmin: true
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache'
      }
    });

  } catch (error) {
    console.error('❌ Admin check error:', error);
    console.groupEnd();
    return NextResponse.json({ isAdmin: false }, { status: 500 });
  }
}