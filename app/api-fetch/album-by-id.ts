import axios from "axios";
import z from "zod";
import { AlbumDetails } from "../model/album-details";


const AlbumSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().nullable(),
    thumbnailurl: z.string(),
    profiles: z.array(z.object({
        id: z.string().optional().nullable(),
        name: z.string().optional().nullable(),
        avatarurl: z.string().optional().nullable(),
    })).optional().nullable(),
    type: z.string(),
    songs: z.array(
        z.object({
            song: z.object({
                id: z.string(),
                title: z.string(),
                thumbnailurl: z.string(),
                duration: z.number().nullable(),
                views: z.number().nullable().optional(),
                artists: z.array(z.object({
                    id: z.string().optional(),
                    name: z.string()
                })).optional().default([]),
                releasedate: z.string().optional(),
                genre: z.string().optional()
            })
        })
    ).optional().nullable(),
});

const AlternativeAlbumSchema = z.object({
  data: AlbumSchema
});

export default async function fetchAlbumById(id: string): Promise<AlbumDetails> {
  try {
    if (localStorage && localStorage.getItem(
      `playlist-${id}`
    ) && Date.now() - (parseInt(localStorage.getItem(`playlist-time-${id}`) || '0')) < 1000 * 30) {
      console.log("Fetching album with ID:", id, "from local storage");
      const data = JSON.parse(localStorage.getItem(`playlist-${id}`) as string);
      console.log("Successfully fetched album data from local storage:", data);
      return data;
    }
    console.log("Fetching album with ID:", id);
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/collection/${id}`,
      {
        headers: {
          'cache-control': 'no-cache',
        }
      }
    );
    console.log("Raw API response:", res.data);

    try {
      console.log("Attempting to parse with AlbumSchema");
      const data = AlbumSchema.parse(res.data);
      console.log("Successfully parsed album data:", data);
      localStorage.setItem(`playlist-${id}`, JSON.stringify(data));
      localStorage.setItem(`playlist-time-${id}`, Date.now().toString());
      return data;
    } catch (parseError) {
      console.log("Failed to parse with AlbumSchema, trying AlternativeAlbumSchema");
      console.error("Parse error:", parseError);
      
      const alternativeData = AlternativeAlbumSchema.parse(res.data);
      console.log("Successfully parsed with AlternativeAlbumSchema:", alternativeData.data);
      localStorage.setItem(`playlist-${id}`, JSON.stringify(alternativeData.data));
      localStorage.setItem(`playlist-time-${id}`, Date.now().toString());
      return alternativeData.data;
    }
  } catch (error) {
    console.error("Failed to fetch album:", error);
    if (axios.isAxiosError(error)) {
      console.error("Axios error details:", error.response?.data);
    }
    throw error;
  }
}

