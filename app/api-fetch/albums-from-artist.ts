import axios from 'axios';

interface Album {
    id: string;
    title: string;
    thumbnailurl: string;
    created_at: string;
    type: string;
}

interface AlbumsResponse {
    count: number;
    data: Album[];
}

export const fetchAlbumsFromArtist = async (artistId: string): Promise<Album[]> => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/v1/artist/${artistId}/albums`);
    try {
        const res = response.data as AlbumsResponse;
        return res.data as Album[];
    } catch {
        try {
            return response.data.data as Album[];
        } catch (error) {
            console.error(error);
            return [];
        }
    }
}

