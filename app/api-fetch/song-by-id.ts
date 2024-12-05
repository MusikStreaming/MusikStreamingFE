'use client';
import axios from "axios";
import z from "zod";
import { SongDetails } from "../model/song-details";

export const SongSchema = z.object({
    id: z.string(),
    title: z.string(),
    thumbnailurl: z.string().optional(),
    duration: z.number(),
    releasedate: z.string(),
    genre: z.string(),
    views: z.number(),
    albums: z.array(
        z.object({
            album: z.object({
                id: z.string().optional(),
                type: z.string().optional(),
                title: z.string().optional(),
                thumbnailurl: z.string().optional(),
            })
        }).optional()
    ).nullable(),
    artists: z.array(z.object({
        id: z.string(),
        name: z.string(),
        avatarurl: z.string(),
    })
    )
});

// As the API calls are not stable yet, we need to have a schema for the alternative response
export const AlternativeSongSchema = z.object({
    data: z.object({
        id: z.string(),
        title: z.string(),
        thumbnailurl: z.string().optional(),
        duration: z.number(),
        releasedate: z.string(),
        genre: z.string(),
        views: z.number(),
        albums: z.array(
            z.object({
                album: z.object({
                    id: z.string().optional(),
                    type: z.string().optional(),
                    title: z.string().optional(),
                    thumbnailurl: z.string().optional(),
                })
            }).optional()
        ).nullable(),
        artists: z.array(z.object({
            id: z.string(),
            name: z.string(),
            avatarurl: z.string(),
        })
        )
    })
});

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
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/v1/song/${id}`, {
                    headers: {
                        'Cache-Control': 'max-age=300000, stale-while-revalidate',
                    }
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
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/v1/song/${id}`);
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