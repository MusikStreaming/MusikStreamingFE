import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(
  req: Request,
  { body }: {
    body: {
      title: string,
      description: string,
      visibility: string,
      type: string,
      file: File
    }
  }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token');
    // console.log(token)
    if (!token) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/collection`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json',
        'cross-origin-resource-policy': 'cross-origin',
        'cache-control': 'no-cache',
        'access-control-allow-origin': '*'
      },
      body: JSON.stringify(body),
    });
    console.log(response);
    if (!response.ok) {
      throw new Error('Failed to add collection');
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.log('[COLLECTION_ADD]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}


export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token');

    if (!token) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/collections/${params.id}`, {
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