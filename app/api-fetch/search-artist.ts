import axios from "axios";

import { Artist } from "@/app/model/artist";

export async function searchArtist(query: string): Promise<Artist[]> {
  let processedQuery = query.split(' ').join('+');
  processedQuery = encodeURIComponent(processedQuery);
  console.log(processedQuery);
  const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/v1/search/${processedQuery}/artists`);
  console.log(response.data);
  try {
    return response.data as Artist[];
  } catch (error) {
    return response.data.data as Artist[];
  }
}