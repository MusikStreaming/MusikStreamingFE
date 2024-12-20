import axios, { AxiosError } from "axios";

export interface SearchSchema {
  data: {
    songs?: {
      id: string;
      title: string;
      thumbnailurl: string;
      duration: number | null;
      views?: number | null;
      artists?: {
          id?: string | null;
          name?: string;
      }[];
      releasedate?: string | null;
      genre?: string | null;
    }[];
    artists?: {
      id?: string | null;
      name?: string;
      avatarurl?: string | null;
    }[];
    albums?: {
      id: string;
      title: string;
      description: string | null;
      thumbnailurl: string;
      profiles: {
        id: string | null;
        name?: string | null;
        avatarurl?: string | null;
      }[];
      type: string;
      songs?: {
        id: string;
        title: string;
        thumbnailurl: string;
        duration: number | null;
        views: number | null;
        artists: {
          artist: {
            id: string | null;
            name: string;
          };
        }[];
        releasedate: string | null;
        genre: string | null;
      }[];
    }[];
    users?: {
      id: string;
      username: string;
      avatarurl: string | null;
    }[];
  }
}

export default async function search(query: string): Promise<SearchSchema | null> {
  if (!query.trim()) {
    return null;
  }
  
  const processedQuery = query.trim().replace(/\s+/g, '+');
  
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/search/${encodeURIComponent(processedQuery)}`,
      {
        // withCredentials: true,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );
    return res.data as SearchSchema;
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.code === 'ERR_NETWORK') {
        console.error('CORS or Network Error:', error.message);
      } else {
        console.error(`API Error (${error.response?.status}):`, error.response?.data);
      }
    } else {
      console.error("Unexpected error during search:", error);
    }
    return null;
  }
}