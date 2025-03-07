import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token');
    // console.log(token!.value);
    if (!token) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/collection/${id}`,
      {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token.value}`,
          'cache-control': 'no-cache',
        }
      }
    );

    if (!response.ok) throw new Error('Failed to delete album/collection');

    return new NextResponse("Deleted", { status: 200 });

  } catch (error) {
    console.log('[ALBUM_DELETE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token');
    if (!token) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;

    const formData = await req.formData();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/collection/${id}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'cache-control': 'no-cache',
      },
      body: formData,
    });

    // const data = await response.json();
    // return new NextResponse(data, { status: response.status });
    return new NextResponse("Updated", { status: 200 });

  } catch (error) {
    console.log('[ALBUM_EDIT]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}