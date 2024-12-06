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
    const CACHE_TIME_MS = 3600000;
    const CACHE_KEY = {
        ALBUMS: "albums",
        ALBUMS_TIME: "albumsTime"
    }
    if (!process.env.NEXT_PUBLIC_API_URL) {
        console.warn('API URL not set, using fallback URL');
    }
    try {
        if (typeof window !== 'undefined') {
            const storedAlbums = localStorage.getItem(CACHE_KEY.ALBUMS);
            const storedTime = localStorage.getItem(CACHE_KEY.ALBUMS_TIME);
            
            if (storedAlbums && storedTime && Date.now() - Number.parseInt(storedTime) < CACHE_TIME_MS) {
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
                    localStorage.removeItem(CACHE_KEY.ALBUMS);
                    localStorage.removeItem(CACHE_KEY.ALBUMS_TIME);
                }
            }
        }

        console.log("Fetching fresh albums data");
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/v1/collection/albums?page=1&limit=10`, {
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 10000,
        });
        
        console.log("Raw API response:", res.data);

        if (!res.data) {
            throw new Error("No data received from API");
        }

        if (typeof window !== 'undefined') {
            localStorage.setItem(CACHE_KEY.ALBUMS, JSON.stringify(res.data));
            localStorage.setItem(CACHE_KEY.ALBUMS_TIME, Date.now().toString());
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
        localStorage.removeItem(CACHE_KEY.ALBUMS);
        localStorage.removeItem(CACHE_KEY.ALBUMS_TIME);
        throw error; // Re-throw to be handled by the component
    }
}