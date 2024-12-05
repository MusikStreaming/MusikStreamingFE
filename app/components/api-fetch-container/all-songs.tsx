"use client"

import { useEffect, useState } from "react"
import fetchAllSongs from "@/app/api-fetch/all-songs"
import { CardProps } from "@/app/model/card-props"
import { processCloudinaryUrl } from "@/app/api-fetch/cloudinary-url-processing"
import VerticalCard from "@/app/components/info-cards/vertical-card"
import Skeleton from "../loading/skeleton"
import ErrorComponent from "./fetch-error"
import { randomUUID } from "crypto"
// import ErrorComponent from "./fetch-error"

export default function Songs() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [songs, setSongs] = useState<CardProps[]>([]);

    useEffect(() => {
        let mounted = true;

        async function loadSongs() {
            try {
                setLoading(true);
                const songsData = await fetchAllSongs();
                
                if (!mounted) return;
                
                if (!songsData) {
                    setError('No songs found');
                    return;
                }

                const cardData: CardProps[] = songsData.map((song) => ({
                    img: {
                        src: processCloudinaryUrl(song.thumbnailurl, 200, 200, "songs"),
                        alt: song.title,
                        width: 200
                    },
                    title: song.title,
                    subtitle: song.artists.length > 1 
                        ? song.artists.map(artist => artist.artist.name).join(", ")
                        : song.artists[0].artist.name,
                    href: `/song/${song.id}`,
                    isMultipleItemSub: song.artists.length > 1,
                    subHref: song.artists.length === 1 ? `/artist/${song.artists[0].artist.id}` : undefined,
                    subHrefItems: song.artists.length > 1 
                        ? song.artists.map(artist => `/artist/${artist.artist.id}`)
                        : undefined,
                    subItems: song.artists.length > 1 
                        ? song.artists.map(artist => artist.artist.name)
                        : undefined
                }));

                setSongs(cardData);
            } catch (error) {
                if (mounted) {
                    console.error('Error loading songs:', error);
                    setError(error instanceof Error ? error.message : 'Failed to load songs');
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        }

        loadSongs();

        return () => {
            mounted = false;
        };
    }, []);

    if (error) {
        return <div className="text-error">{error}</div>;
    }

    if (loading) {
        return (
            <div className="card-grid grid grid-flow-row">
                {[...Array(21)].map((_, i) => (
                    <Skeleton key={i} className="w-[140px] h-[200px]"/>
                ))}
            </div>
        );
    }

    return (
        <div className="card-grid grid grid-flow-row">
            {songs.map((song, index) => (
                <VerticalCard key={index} {...song} />
            ))}
        </div>
    );
}