import axios from "axios";
import { SongSchema, AlternativeSongSchema } from "@/app/model/schemas/song-by-id";

export default async function fetchSongByIdServer(id: string){
  const res = await axios.get(
    `${process.env.API_URL}/v1/song/${id}`,
    {
      headers: {
        'Cache-Control': 'max-age=300000, stale-while-revalidate',
      }
    }
  );
  try{
    const data = SongSchema.parse(res.data);
    return data;
  }
  catch{
    const data = AlternativeSongSchema.parse(res.data);
    return data.data;
  }
}