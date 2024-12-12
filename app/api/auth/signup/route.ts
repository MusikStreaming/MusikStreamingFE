import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        console.log('User data:', data);
        // const { username } = data.username!;
        // const {email_verified} = data.email_verified!;
        // if (!username || email_verified === null) {
        //     console.error('Invalid signup data received:', data);
        //     return NextResponse.json(
        //         { error: 'Invalid signup data' },
        //         { status: 400 }
        //     );
        // }
        // return NextResponse.json(
        //     { message: 'Signup successful' },
        //     { status: 200 }
        // );
        const response = NextResponse.json({
            user: {
                id: data.externalAuth.user.id,
                email: data.externalAuth.user.email,
                username: data.externalAuth.user.username,
                verified: data.externalAuth.user.verify_email,
            },
            success: true,
            redirectToManager: ['Artist Manager', 'Admin'].includes(data.externalAuth.user.role)
        });
        response.cookies.delete('session');
        response.cookies.delete('user_id');
        response.cookies.delete('username');
        response.cookies.delete('session_token');
        // response.cookies.set('session_token', data.session.access_token, {
        //     httpOnly: true,
        //     secure: process.env.NODE_ENV === 'production',
        //     sameSite: 'lax',
        //     maxAge: data.session.expires_in || 60 * 60 * 24 * 7,
        // })
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { error: 'Failed to signup' },
            { status: 500 }
        );
    }
} 