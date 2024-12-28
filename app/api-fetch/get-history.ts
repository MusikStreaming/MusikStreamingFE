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
    const { data } = await axios.get<History>(`/api/user/history`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
    });
    console.log('📥 History data:', data);
    return data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      console.warn('User not authenticated');
      return null;
    }
    console.error('Error fetching history:', error);
    return null;
  }
}