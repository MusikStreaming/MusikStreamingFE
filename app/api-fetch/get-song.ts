import z from "zod";
import axios, { AxiosError } from "axios";

const songFileSchema = z.object({
  url: z.string().url(),
});

export default async function getSong(id: string) {
  try {
    if (!process.env.NEXT_PUBLIC_API_URL) {
      throw new Error("API URL is not configured");
    }

    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/v1/song/${id}/presigned/stream`);
    
    console.log("API Response:", res.data);
    
    const data = songFileSchema.parse(res.data);
    return data;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Invalid response format:", error.errors);
      throw new Error("Invalid song data received from server");
    }
    if (error instanceof AxiosError) {
      console.error("API request failed:", error.response?.data || error.message);
      throw new Error(`Failed to fetch song: ${error.message}`);
    }
    throw error;
  }
}
