import { cookies } from "next/headers";
import { NextResponse, NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    const body = await request.json();
    const userCookies = await cookies();
    const session = userCookies.get('session');

    if (!session) {
        return NextResponse.redirect('/login');
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/user/me`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session}`,
        },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        return NextResponse.json({ message: 'Failed to update settings' }, { status: res.status });
    }

    const updatedUserData = await res.json();

    return NextResponse.json({
        message: 'Settings updated successfully',
        user: {
            id: updatedUserData.id,
            username: updatedUserData.username,
            email: updatedUserData.email,
            role: updatedUserData.role || 'User',
            country: updatedUserData.country,
            avatarurl: updatedUserData.avatarurl
        }
    });
}

