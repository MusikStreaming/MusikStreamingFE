import axios from "axios";
import { Song } from "../model/song";
import z from "zod";

export const SongListSchema = z.array(z.object({
        id: z.string(),
        title: z.string(),
        thumbnailurl: z.string(),
        duration: z.number(),
        releasedate: z.string(),
        genre: z.string(),
        views: z.number(),
        artists: z.array(
            z.object({
                artist: z.object({
                    id: z.string(),
                    name: z.string()
                })
            })
        )
    }));

export const AlternativeSongListSchema = z.object({
    data: z.array(z.object({
        id: z.string(),
        title: z.string(),
        thumbnailurl: z.string(),
        duration: z.number(),
        releasedate: z.string(),
        genre: z.string(),
        views: z.number(),
        artists: z.array(
            z.object({
                artist: z.object({
                    id: z.string(),
                    name: z.string()
                })
            })
        )
    }))
})

export default async function fetchAllSongs() {
    // try {
        if (localStorage.getItem("songs") !== null && localStorage.getItem("songsTime") === null) {
            localStorage.removeItem("songs");
        }
        // xoá cache nếu đã quá 1 giờ
        if (localStorage.getItem("songs") !== null && Date.now() - parseInt(localStorage.getItem("songsTime")!) < 3600000) {
            try{
                const data = AlternativeSongListSchema.parse(JSON.parse(localStorage.getItem("songs")!));
                console.log(data)
                return data.data as Song[];
            }
            catch {
                const data = SongListSchema.parse(JSON.parse(localStorage.getItem("songs")!));
                console.log(data);
                return data as Song[];
            }
        }
        else {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/v1/song?page=1&limit=30`, {
                headers: {
                    'Cache-Control': 'max-age=3600000, stale-while-revalidate',
                }
            });
            console.log(res.data)
            localStorage.setItem("songs", JSON.stringify(res.data));
            localStorage.setItem("songsTime", Date.now().toString());
            console.log(res.data);
            try{
                const data = AlternativeSongListSchema.parse(res.data);
                return data.data as Song[];
            }
            catch {
                const data = SongListSchema.parse(res.data);
                return data as Song[];
            }
        }

    // } catch {
    //     console.log("maybe the schema has malfunctioned")
    //     localStorage.removeItem("songs");
    //     localStorage.removeItem("songsTime");
    //     return;
    // }
}