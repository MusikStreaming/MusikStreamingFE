import { cookies } from "next/headers";
import { NextResponse } from "next/server";

interface UserResponse {
  data: {
    role: string;
    avatarurl?: string;
  }
}

const DEFAULT_RESPONSE = {
  authenticated: false,
  admin: false,
  artistManager: false,
  avatarUrl: '/assets/default-avatar.png',
  role: null
};

export async function GET() {
  console.group('🔐 User Info Request');
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session_token");

    if (!sessionToken?.value) {
      console.warn('⚠️ No session token found');
      console.groupEnd();
      return NextResponse.json(DEFAULT_RESPONSE, { status: 401 });
    }

    console.log('🌐 API URL:', process.env.NEXT_PUBLIC_API_URL);
    console.log('🎫 Token Present:', !!sessionToken.value);
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/user/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${sessionToken.value}`,
        'Accept': 'application/json',
      },
      cache: 'no-store'
    });

    console.log('📥 API Response Status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);
      console.groupEnd();
      return NextResponse.json(DEFAULT_RESPONSE, { status: response.status });
    }

    const userData: UserResponse = await response.json();
    console.log('👤 User Data:', JSON.stringify(userData, null, 2));

    // Handle the nested data structure
    const userInfo = userData.data || userData;

    console.log('✅ Request completed successfully');
    console.groupEnd();
    return NextResponse.json({
      authenticated: true,
      admin: userInfo.role === 'Admin',
      artistManager: userInfo.role === 'Artist Manager',
      avatarUrl: userInfo.avatarurl || '/assets/default-avatar.png',
      role: userInfo.role
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache'
      }
    });

  } catch (error) {
    console.error('❌ Error in user-info route:', error);
    console.groupEnd();
    return NextResponse.json({
      ...DEFAULT_RESPONSE,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}