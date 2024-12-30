import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request, { params }: { params: Promise<{ id: string; songId: string }> }) {
    try {
        const { id, songId } = await params;
        const cookieStore = await cookies();
        const token = cookieStore.get('session_token');

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/collection/${id}/songs/${songId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token.value}`,
                'cache-control': 'no-cache',
            }
        });

        if (!response.ok) {
            const error = await response.text();
            return NextResponse.json({ error }, { status: response.status });
        }

        return NextResponse.json({ 
            message: `Song ${songId} added to collection successfully` 
        });
    } catch (error) {
        console.error('Error adding song to collection:', error);
        return NextResponse.json({ 
            error: 'Internal server error' 
        }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string, songId: string }> }) {
    const { id, songId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token');

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/collection/${id}/songs/${songId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token.value}`,
              'cache-control': 'no-cache',
            }
        });
        return NextResponse.json({ message: `Song ${songId} removed from collection successfully` });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}



