import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  console.group('📝 User Playlists Request');
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    console.log('🎫 Token Status:', !!token ? 'Present' : 'Missing');

    if (!token) {
      console.warn('⚠️ Authentication failed: No token');
      console.groupEnd();
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/v1/user/me/playlists`;
    console.log('🌐 Fetching from:', apiUrl);

    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Accept': 'application/json',
      },
      cache: 'no-store'
    });

    console.log('📥 Response Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      console.groupEnd();
      return NextResponse.json(
        { error: 'Failed to fetch playlists' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ Playlists fetched:', {
      count: data.length,
      firstPlaylist: data[0]?.title || 'No playlists'
    });

    console.groupEnd();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
  } catch (error) {
    console.error('❌ Playlist fetch error:', error);
    console.groupEnd();
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
