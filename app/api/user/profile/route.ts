import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.group('👤 Profile Request');
  try {
    const sessionToken = request.cookies.get('session_token')?.value;

    console.log('🎫 Session token present:', !!sessionToken);

    if (!sessionToken) {
      console.warn('⚠️ No session token found');
      console.groupEnd();
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🔍 Verifying with external auth...');
    const externalResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/user/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${sessionToken}`,
        'Content-Type': 'application/json',
      }
    });

    console.log('📥 External API status:', externalResponse.status);

    if (!externalResponse.ok) {
      console.error('❌ External auth failed:', externalResponse.status);
      console.log('📝 Response details:', await externalResponse.text());
      console.groupEnd();
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    const userData = await externalResponse.json();
    console.log('✅ Profile fetch successful');
    console.groupEnd();

    return NextResponse.json({
      id: userData.id,
      username: userData.username,
      email: userData.email,
      role: userData.role || 'User',
      country: userData.country,
      avatarurl: userData.avatarurl
    });

  } catch (error) {
    console.error('❌ Profile error:', error);
    console.groupEnd();
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}