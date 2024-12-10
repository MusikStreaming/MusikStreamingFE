import { NextRequest, NextResponse } from 'next/server';

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
    console.log('User role during signin:', user.role); // Debug log

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
      path: '/',
    });

    // Set non-HTTP-only cookie for session detection
    response.cookies.set('session', 'true', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: session.expires_in || 60 * 60 * 24 * 7,
      path: '/',
    });

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
    })

    return response;
  } catch (error) {
    console.error('Sign in error:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra, vui lòng thử lại sau' },
      { status: 500 }
    );
  }
} 