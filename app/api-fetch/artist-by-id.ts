import { Artist } from "@//app/model/artist";
import axios from "axios";
import z from 'zod';

export const ArtistSchema = z.array(
    z.object({
        id: z.string(),
        name: z.string(),
        avatarurl: z.string(),
        country: z.string().optional().nullable(),
        description: z.string().optional().nullable(),
        managerid: z.string().optional().nullable(),
    })
);

export const AlternativeArtistSchema = z.object({
    data: z.array(
        z.object({
            id: z.string(),
            name: z.string(),
            avatarurl: z.string(),
            country: z.string().optional().nullable(),
            description: z.string().optional().nullable(),
            managerid: z.string().optional().nullable(),
        })
    )
});

/**
 * Fetches artist information from the API by their ID
 * 
 * @param id - The unique identifier of the artist to fetch
 * @returns Promise<Artist[]> - A promise that resolves to an array of Artist objects
 *                             Returns empty array if the fetch fails
 * 
 * @example
 * const artists = await fetchArtistById("123");
 * 
 * @throws {Error} When the network request fails
 * @remarks
 * - The function logs the ID to console for debugging purposes
 * - Error responses are caught and logged to console
 */
export default async function fetchArtistById(id: string) {
    console.log(`Fetching artist with ID: ${id}`);
    if (localStorage) {
        try {
            if (localStorage.getItem("artist-" + id) !== null && localStorage.getItem("artistTime-" + id) === null) {
                localStorage.removeItem("artist-" + id);
            }
            if (localStorage.getItem("artist-" + id) !== null || Date.now() - parseInt(localStorage.getItem("artistTime-" + id)!) < 3600000) {
                try{
                    const data = ArtistSchema.parse(JSON.parse(localStorage.getItem("artist-" + id)!));
                    return data[0] as Artist;
                } catch {
                    const data = AlternativeArtistSchema.parse(JSON.parse(localStorage.getItem("artist-" + id)!));
                    return data.data[0] as Artist;
                }
            }
            else {
                const response = await axios.get(`${process.env.API_URL}/v1/artist/${id}`, {
                    headers: {
                        'Cache-Control': 'max-age=3600000, stale-while-revalidate',
                    }
                });
                try {
                    const data = ArtistSchema.parse(response.data);
                    return data[0] as Artist;
                }
                catch {
                    const data = AlternativeArtistSchema.parse(response.data);
                    return data.data[0] as Artist;
                }
                finally{
                    localStorage.setItem("artist-" + id, JSON.stringify(response.data));
                    localStorage.setItem("artistTime-" + id, Date.now().toString());
                }
            }
        } catch (error) {
            localStorage.removeItem("artist-" + id);
            localStorage.removeItem("artistTime-" + id);
            console.error(error);
            return null;
        }
    }
    else {
        // server render
        try {
            const response = await axios.get(`${process.env.API_URL}/v1/artist/${id}`);
            try {
                const data = ArtistSchema.parse(response.data);
                return data[0] as Artist;
            }
            catch {
                const data = AlternativeArtistSchema.parse(response.data);
                return data.data[0] as Artist;
            }
        } catch (error) {
            console.error(error);
            return null;
        }
    }
}