"use client"

import fetchAllSongs from "@/app/api-fetch/all-songs"
import { CardProps } from "@/app/model/card-props"
import { processCloudinaryUrl } from "@/app/api-fetch/cloudinary-url-processing"
import { SongCard } from "@/app/components/info-cards/song-card"
import Skeleton from "../loading/skeleton"
import { useQuery } from "@tanstack/react-query"

export default function Songs() {
    const { data: songs, error, isLoading: loading } = useQuery({queryKey: ["songs"], queryFn:fetchAllSongs});

    if (error) {
        return <div className="text-error">{error.message}</div>;
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
            {songs && songs.map((song, index) => {
                const cardData: CardProps = {
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
                        : undefined,
                    songID: song.id,
                    duration: song.duration ?? undefined,
                    artists: song.artists.map(artist => ({ id: artist.artist.id, name: artist.artist.name })),
                    type: 'song'
                };
                return <SongCard key={index} {...cardData} />;
            })}
        </div>
    );
}