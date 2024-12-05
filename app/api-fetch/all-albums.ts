'use client';
import z from 'zod';
import axios from 'axios';

import type { Album } from '@/app/model/album';

const AlbumSchema = z.array(z.object({
    id: z.string(),
    title: z.string(),
    type: z.string(),
    thumbnailurl: z.string(),
    owner: z.string().nullable().optional(),
}));

const AlternativeAlbumSchema = z.object({
    data: z.array(
        z.object({
            id: z.string(),
            title: z.string(),
            type: z.string(),
            thumbnailurl: z.string(),
            owner: z.string().nullable().optional(),
        })
    )
});

export default async function fetchAllAlbums() {
    if (!process.env.NEXT_PUBLIC_API_URL) {
        console.warn('API URL not set, using fallback URL');
    }
    try {
        if (typeof window !== 'undefined') {
            const storedAlbums = localStorage.getItem("albums");
            const storedTime = localStorage.getItem("albumsTime");
            
            if (storedAlbums && storedTime && Date.now() - parseInt(storedTime) < 3600000) {
            console.log("Using cached albums data");
            try {
                const parsedData = JSON.parse(storedAlbums);
                console.log("Parsed cached data:", parsedData);
                
                if (Array.isArray(parsedData)) {
                    const data = AlbumSchema.parse(parsedData);
                    return data;
                } else if (parsedData.data) {
                    const data = AlternativeAlbumSchema.parse(parsedData);
                    return data.data;
                }
            } catch (error) {
                console.error("Error parsing cached data:", error);
                // Clear invalid cache
                    localStorage.removeItem("albums");
                    localStorage.removeItem("albumsTime");
                }
            }
        }

        console.log("Fetching fresh albums data");
        const res = await axios.get(`https://api.hustmusik.live/v1/collection/albums?page=1&limit=10`, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        console.log("Raw API response:", res.data);

        if (!res.data) {
            throw new Error("No data received from API");
        }

        if (typeof window !== 'undefined') {
            localStorage.setItem("albums", JSON.stringify(res.data));
            localStorage.setItem("albumsTime", Date.now().toString());
        }

        if (Array.isArray(res.data)) {
            try {
                const data = AlbumSchema.parse(res.data);
                return data;
            } catch (error) {
                console.error("Schema validation error:", error);
                throw error;
            }
        } else if (res.data.data) {
            try {
                const data = AlternativeAlbumSchema.parse(res.data);
                return data.data;
            } catch (error) {
                console.error("Alternative schema validation error:", error);
                throw error;
            }
        } else {
            throw new Error("Unexpected data format");
        }
    }
    catch (error) {
        console.error("Error fetching albums:", error);
        localStorage.removeItem("albums");
        localStorage.removeItem("albumsTime");
        throw error; // Re-throw to be handled by the component
    }
}