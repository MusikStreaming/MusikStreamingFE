import { NextRequest, NextResponse } from 'next/server';
// import { createClient } from '@supabase/supabase-js';

// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.SUPABASE_SERVICE_KEY!
// );

export async function POST(request: NextRequest) {
  try {
    console.log('Processing signin request...');
    const { externalAuth } = await request.json();
    
    if (!externalAuth?.session?.access_token || !externalAuth?.user) {
      console.error('Invalid auth data received:', externalAuth);
      return NextResponse.json(
        { error: 'Dữ liệu xác thực không hợp lệ' },
        { status: 401 }
      );
    }

    const { session, user } = externalAuth;

    // Create response with user data
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        avatarUrl: user.avatar_url
      },
      success: true
    });

    // Set HTTP-only cookie for sensitive session data
    response.cookies.set('session_token', session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: session.expires_in || 60 * 60 * 24 * 7,
      path: '/',
    });

    // Set a non-HTTP-only cookie for session detection
    response.cookies.set('session', 'true', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: session.expires_in || 60 * 60 * 24 * 7,
      path: '/',
    });

    // Set role cookie - Make it accessible to client
    response.cookies.set('role', user.role || 'User', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: session.expires_in || 60 * 60 * 24 * 7,
      path: '/',
    });

    // Set username cookie for quick access
    response.cookies.set('username', user.username || '', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: session.expires_in || 60 * 60 * 24 * 7,
      path: '/',
    });

    // Set user data cookies
    response.cookies.set('user_id', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: session.expires_in || 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Sign in error:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra, vui lòng thử lại sau' },
      { status: 500 }
    );
  }
} 