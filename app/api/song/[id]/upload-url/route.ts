import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token');
    // console.log(token!.value);
    if (!token) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/song/${id}/presigned/upload`,
      {
        headers: { 'Authorization': `Bearer ${token.value}` }
      }
    );

    if (!response.ok) throw new Error('Failed to get upload URL');

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    console.log('[UPLOAD_URL_FETCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token');
    console.log(token!.value);
    if (!token) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;

    // First, get the presigned URL
    const presignedResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/song/${id}/presigned/upload`,
      {
        headers: { 'Authorization': `Bearer ${token.value}` }
      }
    );

    if (!presignedResponse.ok) throw new Error('Failed to get upload URL');
    const { url } = await presignedResponse.json();

    // Then, upload the file to the presigned URL
    const formData = await req.formData();
    const file = formData.get('file') as File;

    const uploadResponse = await fetch(url, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
        'cache-control': 'no-cache'
      }
    });

    if (!uploadResponse.ok) throw new Error('Failed to upload song file');

    return new NextResponse("Uploaded", { status: 200 });

  } catch (error) {
    console.log('[UPLOAD_FILE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
