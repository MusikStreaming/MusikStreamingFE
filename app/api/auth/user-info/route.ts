import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionToken = await cookieStore.get("session_token");
    const user_id = await cookieStore.get("user_id");
    if (!sessionToken?.value) {
      console.log('No session token found in check-manager');
      return NextResponse.json({ manager: false }, { status: 403 });
    }

    // Verify with backend
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/user/${user_id!.value}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${sessionToken.value}`,
        'Accept': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      console.error('Failed to verify user in check-manager:', await response.text());
      return NextResponse.json({ 
        manager: false,
        avatarurl: null 
      }, { status: 403 });
    }

    const userData = await response.json();
    console.log('User data in check-manager:', userData); // Debug log

    // Ensure role is correctly identified
    const isManager = userData?.role && ['Artist Manager', 'Admin'].includes(userData.role);
    console.log('Is manager:', isManager); // Debug log

    cookieStore.set('avatarurl', userData.avatarurl || '/assets/default-avatar.png', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    });

    if (!isManager) {
      return NextResponse.json({ 
        manager: false,
        avatarurl: userData.avatarurl || '/assets/default-avatar.png' 
      }, { status: 403 });
    }

    return NextResponse.json({ 
      manager: true,
      avatarUrl: userData.avatarurl || '/assets/default-avatar.png'
    }, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    });

  } catch (error) {
    console.error("Error checking manager status:", error);
    return NextResponse.json({ manager: false }, { status: 500 });
  }
}