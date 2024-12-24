import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token');
    if (!token) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await req.formData();
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/collection/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'cache-control': 'no-cache',
      },
      body: formData,
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    console.log('[COLLECTION_ADD]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token');

    if (!token) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/collections/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete collection');
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.log('[COLLECTION_DELETE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token');
    if (!token) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/collection/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'cache-control': 'no-cache',
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    console.log('[COLLECTION_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}