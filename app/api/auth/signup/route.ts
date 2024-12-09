import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { signUp } from '@/app/services/auth.service';

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const res = await signUp(data);
        const session = res.session;

        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict' as const,
            path: '/',
            maxAge: 7 * 24 * 60 * 60
        };

        const response = NextResponse.json({ success: true, message: 'Signup successful' });
        
        if (session?.access_token && session?.refresh_token) {
            response.cookies.set('access_token', session.access_token, cookieOptions);
            response.cookies.set('refresh_token', session.refresh_token, cookieOptions);
        }

        return response;

    } catch (error: unknown) {
        return NextResponse.json({ 
            success: false,
            message: error instanceof Error ? error.message : 'Signup failed'
        }, { status: 400 });
    }
} 