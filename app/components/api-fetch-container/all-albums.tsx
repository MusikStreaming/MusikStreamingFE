"use client"

import { useEffect, useState } from "react"
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query"
import fetchAllAlbums from "@/app/api-fetch/all-albums"
import { CardProps } from "@/app/model/card-props"
import { processCloudinaryUrl } from "@/app/api-fetch/cloudinary-url-processing"
import { AlbumCard } from "@/app/components/info-cards/album-card"
import Skeleton from "../loading/skeleton"
import ErrorComponent from "./fetch-error"

export default function Albums() {
    const queryClient = useQueryClient();
    const {data: albums, error, isLoading: loading} = useQuery({
        queryKey: ["albums"], 
        queryFn:fetchAllAlbums,
        staleTime: 5000
    });
    const refresh = useMutation({
        mutationFn: fetchAllAlbums,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["albums"]});
        }
    });
    const [cards, setCards] = useState<CardProps[]>([]);

    useEffect(() => {
        if (albums) {
            const cardData: CardProps[] = albums.map((album) => {
                const url = processCloudinaryUrl(album.thumbnailurl, 200, 200, "collections");
                return {
                    img: {
                        src: url,
                        alt: album.title || "Album cover",
                        width: 200
                    },
                    title: album.title || "Untitled Album",
                    subtitle: album.type || "Unknown Type",
                    href: `/album/${album.id}`,
                    type: 'album',
                    listID: album.id
                };
            });
            setCards(cardData);
        }
    }, [albums]);
    
    if (loading) {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 p-4">
                {[...Array(4)].map((_, index) => (
                    <Skeleton key={index} className="w-full h-[200px]"/>
                ))}
            </div>
        );
    }

    if (error) {
        return <ErrorComponent onReloadClick={() => {
            refresh.mutate();
        }} />;
    }

    if (cards.length === 0) {
        return <div>No albums found</div>;
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 p-4">
            {cards.map((card) => (
                <AlbumCard key={card.href} {...card} />
            ))}
        </div>
    );
}