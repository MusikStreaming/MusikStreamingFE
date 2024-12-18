'use client'

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import VerticalCard from "../info-cards/vertical-card";
import ErrorComponent from "./fetch-error";

import { CardProps } from "@/app/model/card-props";

import fetchArtists from "@/app/api-fetch/all-artists";
import { processCloudinaryUrl } from "@/app/api-fetch/cloudinary-url-processing";

import Skeleton from "../loading/skeleton";

export default function Artists() {
  const queryClient = useQueryClient();
  const {data, error, isLoading} = useQuery({
    queryKey: ["artists"], 
    queryFn: fetchArtists,
    staleTime: 5000
  });
  const refresh = useMutation({
    mutationFn: fetchArtists,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["artists"]});
    }
  });

  if (error) {
    return (
      <ErrorComponent onReloadClick={() => {
        refresh.mutate();
      }} />
    );
  }

  if (isLoading) {
    return (
      <div className="card-grid grid grid-flow-row">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="aspect-square">
            <Skeleton className="w-full h-full rounded-lg"/>
          </div>
        ))}
      </div>
    );
  }

  try {
    console.log(data);
    const cards: CardProps[] = [];
    if (!data) {
      return (
        <ErrorComponent onReloadClick={() => {
        }} />
      );
    }
    data.forEach((artist) => {
      const url = processCloudinaryUrl(artist.avatarurl, 200, 200, "artists");
      console.log(url);
      cards.push({
        type: "artist",
        img: {
          src: url,
          alt: artist.name,
        },
        title: artist.name,
        subtitle: "",
        href: `/artist/${artist.id}`
      });
    });
    return (
      <div className="card-grid grid grid-flow-row">
        {cards.map((card, index) => (
            <VerticalCard key={card.href + index} {...card} />
        ))}
      </div>
    );
  }
  catch (e) {
    console.error('Error fetching artists:', e);
    return (
      <ErrorComponent onReloadClick={() => {
        refresh.mutate();
      }} />
    )
  }
}