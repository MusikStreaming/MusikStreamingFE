import { NextRequest, NextResponse } from 'next/server';
import { getCookie } from 'cookies-next';

export async function POST(req: NextRequest) {
  const token = getCookie('session_token');
  console.log(req.body);
  const formData = await req.json();

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/artist`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'cache-control': 'no-cache',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to add artist');
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
