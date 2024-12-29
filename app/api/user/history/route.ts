import { cookies } from "next/headers";
import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  console.group('📖 History Fetch');
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token');
  
  if (!token?.value) {
    console.warn('⚠️ No token for history fetch');
    console.groupEnd();
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // First verify the user and get their ID
  try {
    console.log('🔍 Verifying user token...');
    const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/user/me`, {
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Accept': 'application/json',
      },
      cache: 'no-store'
    });

    if (!userResponse.ok) {
      console.error('❌ User verification failed:', userResponse.status);
      console.groupEnd();
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userData = await userResponse.json();
    const userInfo = userData.data;
    
    if (!userInfo?.id) {
      console.error('❌ No user ID found in token data');
      console.groupEnd();
      return new NextResponse("Invalid user data", { status: 400 });
    }

    console.log('👤 Fetching history for user:', {
      id: userInfo.id,
      username: userInfo.username,
      role: userInfo.role
    });

    // Fetch history using verified user ID
    const historyResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/user/me/history`,
      {
        headers: {
          'Authorization': `Bearer ${token.value}`,
          'cache-control': 'no-cache',
        },
        cache: 'no-store'
      }
    );

    console.log('📥 History API status:', historyResponse.status);

    if (!historyResponse.ok) {
      console.error('❌ History API error:', historyResponse.status);
      console.groupEnd();
      throw new Error(`API responded with status: ${historyResponse.status}`);
    }

    const historyData = await historyResponse.json();
    console.log('✅ History fetch successful');
    console.log('📊 Items count:', Array.isArray(historyData.data) ? historyData.data.length : 'N/A');
    console.groupEnd();

    return new NextResponse(JSON.stringify(historyData), {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
        'Content-Type': 'application/json',
      }
    });
  } catch (error) {
    console.error('❌ History fetch error:', error);
    console.groupEnd();
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  console.group('📝 History Update');
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token');
  
  if (!token?.value) {
    console.warn('⚠️ No token for history update');
    console.groupEnd();
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // Debug: Verify user details first
    console.log('🔍 Verifying user identity...');
    const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/user/me`, {
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Accept': 'application/json',
      },
      cache: 'no-store'
    });

    console.log('📥 User verification status:', userResponse.status);

    if (!userResponse.ok) {
      console.error('❌ User verification failed:', await userResponse.text());
      console.groupEnd();
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userData = await userResponse.json();
    const userInfo = userData.data;

    console.log('👤 Request from user:', {
      id: userInfo.id,
      username: userInfo.username,
      role: userInfo.role
    });

    // Parse request body
    const body = await req.json();
    const songId = body.songid;

    console.log('🎵 History update details:', {
      userId: userInfo.id,
      songId: songId,
    });

    // Add to history using verified user ID
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/user/me/history/${songId}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.value}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...body,
          userId: userInfo.id // Include verified user ID
        }),
      }
    );

    console.log('📥 History update status:', response.status);

    let data;
    try {
      data = await response.json();
      console.log('✅ History updated successfully');
    } catch (error) {
      console.error('❌ Failed to parse response:', error);
      data = null;
    }

    console.groupEnd();
    return new NextResponse(data ? JSON.stringify(data) : null, { status: response.status });

  } catch (error) {
    console.error('❌ History update error:', error);
    console.groupEnd();
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}