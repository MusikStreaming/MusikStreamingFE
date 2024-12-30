import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  console.group('👤 Profile Request');
  try {
    const userCookies = await cookies();
    const sessionToken = userCookies.get('session_token')?.value;

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
      id: userData.data.id,
      username: userData.data.username,
      email: userData.data.email,
      role: userData.data.role || 'User',
      country: userData.data.country,
      avatarurl: userData.data.avatarurl
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

export async function POST(request: NextRequest) {
  console.group('🔄 Profile Update');
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

    const formData = await request.formData();
    const body = Object.fromEntries(formData.entries());

    console.log('📝 Form data:', body);

    console.log('🔄 Updating profile...');
    const externalResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/user/me`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sessionToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    console.log('📥 External API status:', externalResponse.status);

    if (!externalResponse.ok) {
      console.error('❌ Profile update failed:', externalResponse.status);
      console.log('📝 Response details:', await externalResponse.text());
      console.groupEnd();
      return NextResponse.json(
        { error: 'Profile update failed' },
        { status: 400 }
      );
    }

    console.log('✅ Profile update successful');
    console.groupEnd();
    return NextResponse.json({ message: 'Profile updated' });

  } catch (error) {
    console.error('❌ Profile update error:', error);
    console.groupEnd();
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}