import { NextRequest, NextResponse } from 'next/server';
import { setCookie } from 'cookies-next';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const data = await request.json();
    
    // Destructure user and session data
    const { user, session } = data;

    // Set access token cookie
    setCookie('access_token', session.access_token, {
      req: request,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: session.expires_in,
      httpOnly: true
    });

    // Set refresh token cookie if it exists
    if (session.refresh_token) {
      setCookie('refresh_token', session.refresh_token, {
        req: request,
        path: '/',
        secure: process.env.NODE_ENV === 'production', 
        sameSite: 'lax',
        maxAge: session.expires_in,
        httpOnly: true
      });
    }

    // Set user data cookie (optional, but can be useful)
    setCookie('user_data', JSON.stringify(user), {
      req: request,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: session.expires_in,
      httpOnly: true
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
