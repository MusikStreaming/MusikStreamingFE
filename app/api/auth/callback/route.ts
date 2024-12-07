import { NextRequest, NextResponse } from 'next/server';
import { setCookie } from 'cookies-next';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { code } = data;

    if (!code) {
      return NextResponse.json({ error: 'Missing authorization code' }, { status: 400 });
    }

    // Exchange code for tokens with your backend
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/auth/callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    const authData = await response.json();
    
    if (!response.ok) {
      return NextResponse.json({ error: authData.error }, { status: response.status });
    }

    // Set cookies
    setCookie('access_token', authData.session.access_token, {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: authData.session.expires_in
    });

    if (authData.session.refresh_token) {
      setCookie('refresh_token', authData.session.refresh_token, {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: authData.session.expires_in
      });
    }

    // Redirect to home page
    return NextResponse.redirect(new URL('/', request.url));

  } catch (error) {
    console.error('Auth callback error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
} 

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.redirect(new URL('/login?error=missing_code', request.url));
    }

    // Exchange code for tokens with your backend
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/auth/callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        code,
        redirect_uri: `${request.nextUrl.origin}/auth/callback`
      }),
    });

    const authData = await response.json();
    
    if (!response.ok) {
      console.error('Auth error:', authData);
      return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
    }

    // Set cookies
    const cookieOptions = {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: authData.session.expires_in || 3600
    };

    setCookie('access_token', authData.session.access_token, cookieOptions);
    
    if (authData.session.refresh_token) {
      setCookie('refresh_token', authData.session.refresh_token, cookieOptions);
    }

    if (authData.user.username) {
      setCookie('user_name', authData.user.username, cookieOptions);
    }

    setCookie('user_id', authData.user.id, cookieOptions);
    setCookie('role', authData.user.role || 'User', cookieOptions);

    // Get return URL or default to home
    const returnUrl = searchParams.get('returnUrl') || '/';
    return NextResponse.redirect(new URL(returnUrl, request.url));

  } catch (error) {
    console.error('Auth callback error:', error);
    return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
  }
} 