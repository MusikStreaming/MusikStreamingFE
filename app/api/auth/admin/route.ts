import { cookies } from "next/headers";
import { NextResponse } from "next/server";

interface UserResponse {
  data: {
    role: string;
    avatarurl?: string;
    country?: string;
    username?: string;
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session_token");
    const user_id = cookieStore.get("user_id");

    if (!sessionToken?.value || !user_id?.value) {
      return NextResponse.json(
        {
          admin: false,
          artistManager: false,
          avatarUrl: '/assets/default-avatar.png',
          role: null
        },
        { status: 401 }
      );
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/user/${user_id.value}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${sessionToken.value}`,
        'Accept': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          admin: false,
          artistManager: false,
          avatarUrl: '/assets/default-avatar.png',
          role: null
        },
        { status: response.status }
      );
    }

    const userData: UserResponse = await response.json();
    console.log(userData);
    if (userData.data.role !== 'Admin') {
      return NextResponse.json(
        {
          admin: false,
          artistManager: false,
          avatarUrl: '/assets/default-avatar.png',
          role: null
        },
        { status: 403 }
      );
    }

    const defaultHeaders = {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };

    return NextResponse.json({
      admin: true,
      avatarUrl: userData.data.avatarurl || '/assets/default-avatar.png',
      role: userData.data.role
    }, {
      status: 200,
      headers: defaultHeaders
    });

  } catch (error) {
    console.error("Error in user-info route:", error);
    return NextResponse.json(
      {
        admin: false,
        artistManager: false,
        avatarUrl: '/assets/default-avatar.png',
        role: null
      },
      { status: 500 }
    );
  }
}