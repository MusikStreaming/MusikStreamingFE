import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const data = await request.json();
    
    // Destructure user and session data
    const { user, session } = data;

    // Ensure user and session data are present
    if (!user || !session) {
      console.error('Invalid auth callback data:', data);
      return NextResponse.json({ error: 'Invalid auth callback data' }, { status: 400 });
    }

    // Create response with minimal user data
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatarUrl: user.avatar_url
      },
      success: true,
      redirectToManager: ['Artist Manager', 'Admin'].includes(user.role)
    });

    // Set HTTP-only cookie for session token
    response.cookies.set('session_token', session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: session.expires_in || 60 * 60 * 24 * 7,
    });

    // Set non-HTTP-only cookie for session detection
    response.cookies.set('session', 'true', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: session.expires_in || 60 * 60 * 24 * 7,
    });

    // Set user data cookies
    response.cookies.set('user_id', user.id, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: session.expires_in || 60 * 60 * 24 * 7,
    });

    response.cookies.set('username', user.username, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: session.expires_in || 60 * 60 * 24 * 7,
    });

    // Redirect to home page
    return NextResponse.redirect(new URL('/', request.url));

  } catch (error) {
    console.error('Auth callback error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}

export async function OPTIONS(request: NextRequest) {
  request.headers.set('Access-Control-Request-Method', 'POST');
  request.headers.set('Access-Control-Request-Headers', 'Content-Type, Authorization');
  request.headers.set('Access-Control-Allow-Origin', '*');
  request.headers.set('Access-Control-Allow-Methods', 'POST');
  request.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return NextResponse.json({ message: 'OK' }, { status: 200 });
}
