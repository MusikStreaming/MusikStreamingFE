import axios from "axios";
import { ArtistSchema, AlternativeArtistSchema } from "./artist-by-id";

export default async function fetchArtistByIdServer(id: string) {
  const res = await axios.get(`${process.env.API_URL}/v1/artist/${id}`);
  try{
    const data = ArtistSchema.parse(res.data);
    return data[0];
  }
  catch{
    const data = AlternativeArtistSchema.parse(res.data);
    return data.data[0];
  }
}