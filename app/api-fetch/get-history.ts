import axios from "axios";

interface Artist {
  id: string;
  name: string;
}

interface Song {
  id: string;
  title: string;
  artists: { artist: Artist }[];
  duration: number | null;
  thumbnailurl: string | null;
}

export interface HistoryItem {
  last_listened: string;
  songs: Song;
}

export interface History {
  data: HistoryItem[];
}

export default async function fetchHistory(): Promise<History | null> {
  try {
    const { data } = await axios.get<History>(`${process.env.NEXT_PUBLIC_API_URL}/v1/user/me/history`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('session_token'),
      },
    });
    return data;
  } catch (e) {
    console.error(e);
    return null;
  }
}