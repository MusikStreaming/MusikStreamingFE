'use client';
import axios from "axios";
import { SongDetails } from "../model/song-details";
import { SongSchema, AlternativeSongSchema } from "../model/schemas/song-by-id";

export default async function fetchSongById(id: string) {
    try {
        const res = await axios.get(`${process.env.API_URL}/v1/song/${id}`);
        try {
            const data = AlternativeSongSchema.parse(res.data);
            return data.data as SongDetails;
        }
        catch {
            const data = SongSchema.parse(res.data);
            return data as SongDetails;
        }
    } catch (error) {
        throw new Error('Failed to fetch song: ' + error);
    }
}
