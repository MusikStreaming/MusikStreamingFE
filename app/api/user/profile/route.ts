import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Get the session token
    const sessionToken = request.cookies.get('session_token')?.value;

    if (!sessionToken) {
      console.log('No session token found');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify the token with external auth service
    const externalResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/user`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${sessionToken}`,
        'Content-Type': 'application/json',
      }
    });

    if (!externalResponse.ok) {
      console.log('External auth verification failed');
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    const userData = await externalResponse.json();

    // Return user profile data
    return NextResponse.json({
      id: userData.id,
      username: userData.username,
      email: userData.email,
      role: userData.role,
      country: userData.country,
      avatarurl: userData.avatarurl
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 