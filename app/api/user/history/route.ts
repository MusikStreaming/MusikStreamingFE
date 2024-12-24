import { cookies } from "next/headers";
import { NextResponse, NextRequest } from "next/server";

export async function GET(){
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token');
  if (!token) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/user/me/history`, {
    headers: {
      'Authorization': `Bearer ${token.value}`,
      'cache-control': 'no-cache',
    },
  });
  const data = await response.json();
  return new NextResponse(JSON.stringify(data), { status: response.status });
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token');
  if (!token) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  console.log(req)
  const body = await req.json();
  const songId = body.songid;
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/user/me/history/${songId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token.value}`,
      'cache-control': 'no-cache',
    },
    body: JSON.stringify(body),
  });

  let data;
  try {
    data = await response.json();
  } catch (error) {
    data = null;
  }

  return new NextResponse(data ? JSON.stringify(data) : null, { status: response.status });
}