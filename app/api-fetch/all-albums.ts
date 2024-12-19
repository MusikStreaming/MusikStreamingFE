'use client';
import z from 'zod';
import axios from 'axios';

const AlbumSchema = z.array(z.object({
    id: z.string(),
    title: z.string(),
    type: z.string(),
    thumbnailurl: z.string(),
    owner: z.object({
        id: z.string(),
        username: z.string(),
    }).nullable().optional(),
}));

const AlternativeAlbumSchema = z.object({
    data: AlbumSchema
});

export default async function fetchAllAlbums() {
    try {
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
        throw error; // Re-throw to be handled by the component
    }
}