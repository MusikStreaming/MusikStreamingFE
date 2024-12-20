// fetch api for all artists
'use client'
import type { Artist } from '@/app/model/artist';
import axios from 'axios';
import z from 'zod';

const ArtistSchema = z.object({
    count: z.number(),
    data: z.array(z.object({
        id: z.string(),
        name: z.string(),
        description: z.string().optional(),
        avatarurl: z.string(),
        createdAt: z.string().optional(),
        updatedAt: z.string().optional(),
        country: z.string().optional(),
        managerid: z.string().optional(),
    })),
});

export default async function fetchArtists() {
    if (!process.env.NEXT_PUBLIC_API_URL) {
        throw new Error('API URL not set');
    }
    try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/v1/artist`, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = ArtistSchema.parse(res.data);
        return data["data"] as Artist[];
    }
    catch {
        return;
    }
}