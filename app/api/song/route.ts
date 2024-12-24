import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token');
    if (!token) {
      redirect('/login');
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Ensure the request body is parsed as FormData
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return new NextResponse("Invalid content type", { status: 400 });
    }

    const formData = await req.formData();

    // exclude audio file from metadata, separate it to another form data
    const audioFile = formData.get('audioFile');
    formData.delete('audioFile');

    // Send metadata
    const metadataResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/song`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'cross-origin-resource-policy': 'same-origin',
        'cache-control': 'no-cache',
        'boundary': '----WebKitFormBoundary7MA4YWxkTrZu0gW',
        'access-control-allow-origin': '*',
      },
      body: formData,
    });

    if (!metadataResponse.ok) throw new Error('Failed to create song metadata');

    const metadata = await metadataResponse.json();

    // Handle file upload if present
    const file = audioFile as Blob | null;
    if (file) {
      const uploadUrlResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/song/${metadata.data.id}/presigned/upload`,
        {
          headers: { 'Authorization': `Bearer ${token.value}` }
        }
      );

      if (!uploadUrlResponse.ok) throw new Error('Failed to get upload URL');

      const { url } = await uploadUrlResponse.json();

      const fileFormData = new FormData();
      fileFormData.append('file', file);

      // Upload file
      await fetch(url, {
        method: 'PUT',
        body: fileFormData,
        headers: {
          'Authorization': `Bearer ${token.value}`,
          'Content-Type': file.type,
          'cache-control': 'no-cache'
        },
      });
    }

    return NextResponse.json(metadata, { status: metadataResponse.status });

  } catch (error) {
    console.log('[SONG_ADD]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}