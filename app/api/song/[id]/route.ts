import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token');
    const formData = await request.formData();
    console.log(formData);
    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/v1/song/${id}`, 
          {
            method: 'POST',
            body: formData,
            headers: {
              'Authorization': `Bearer ${token.value}`,
              'cache-control': 'no-cache',
            }
        });
        if (!response.ok) {
            console.log(response)
            throw new Error('Failed to edit song');
        }
        return NextResponse.json({ message: `Song ${id} edited successfully` });
    } catch (error) {
        console.log('[SONG_EDIT]', error);
        return NextResponse.json({ error: error }, { status: 500 });
    }
}