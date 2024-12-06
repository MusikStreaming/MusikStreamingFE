'use client';
import axios from "axios";
import { SongDetails } from "../model/song-details";
import { SongSchema, AlternativeSongSchema } from "../model/schemas/song-by-id";

export default async function fetchSongById(id: string) {
    try {
        if (localStorage) {
            if (localStorage.getItem("song-" + id) !== null && localStorage.getItem("songTime-" + id) === null) {
                localStorage.removeItem("song-" + id);
            }
            if (localStorage.getItem("song-" + id) || Date.now() - parseInt(localStorage.getItem("songTime-" + id)!) < 300000) {
                try {
                    const data = AlternativeSongSchema.parse(JSON.parse(localStorage.getItem("song-" + id)!));
                    return data.data as SongDetails;
                }
                catch {
                    const data = SongSchema.parse(JSON.parse(localStorage.getItem("song-" + id)!));
                    return data as SongDetails;
                }
            }
            else {
                const res = await axios.get(`${process.env.API_URL}/v1/song/${id}`, {
                    headers: {
                        'Cache-Control': 'max-age=300000, stale-while-revalidate',
                    },
                    timeout: 5000, // 5 second timeout
                });
                localStorage.setItem("song-" + id, JSON.stringify(res.data));
                localStorage.setItem("songTime-" + id, Date.now().toString());
                try {
                    const data = AlternativeSongSchema.parse(res.data);
                    return data.data as SongDetails;
                }
                catch {
                    const data = SongSchema.parse(res.data);
                    return data as SongDetails;
                }
            }
        }
        else {
            const res = await axios.get(`${process.env.API_URL}/v1/song/${id}`);
            try {
                const data = AlternativeSongSchema.parse(res.data);
                return data.data as SongDetails;
            }
            catch {
                const data = SongSchema.parse(res.data);
                return data as SongDetails;
            }
        }
    } catch {
        // localStorage.removeItem("song-" + id);
        // localStorage.removeItem("songTime-" + id);
        return;
    }
}