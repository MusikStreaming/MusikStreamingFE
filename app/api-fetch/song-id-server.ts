import axios from "axios";

interface SongDetails {
  id: string;
  title: string;
  thumbnailurl?: string;
  duration: number;
  releasedate: string;
  genre: string | null;
  views: number;
  albums: {
    album: {
      id?: string;
      type?: string;
      title?: string;
      thumbnailurl?: string;
    };
  }[] | null;
  artists: {
    id: string;
    name: string;
    avatarurl: string;
  }[];
}

interface AlternativeSongDetails {
  data: SongDetails;
}

export default async function fetchSongByIdServer(id: string): Promise<SongDetails> {
  try {
    let response;
    try {
      response = await axios.get<SongDetails>(
        `${process.env.API_URL}/v1/song/${id}`,
        {
          headers: {
            'Cache-Control': 'max-age=300000, stale-while-revalidate',
          }
        }
      );
      return response.data;
    } catch {
      response = await axios.get<AlternativeSongDetails>(
        `${process.env.API_URL}/v1/song/${id}`,
        {
          headers: {
            'Cache-Control': 'max-age=300000, stale-while-revalidate',
          }
        }
      );
      return response.data.data;
    }
  } catch (error) {
    console.error('Error fetching song:', error);
    throw error;
  }
}
