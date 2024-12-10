import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const { username } = data.username!;
        const {email_verified} = data.email_verified!;
        if (!username || email_verified === null) {
            console.error('Invalid signup data received:', data);
            return NextResponse.json(
                { error: 'Invalid signup data' },
                { status: 400 }
            );
        }
        return 200;
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { error: 'Failed to signup' },
            { status: 500 }
        );
    }
} 