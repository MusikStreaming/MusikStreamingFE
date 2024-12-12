'use client'

import { useState, useEffect } from "react";

import VerticalCard from "../info-cards/vertical-card";
import ErrorComponent from "./fetch-error";

import { CardProps } from "@/app/model/card-props";

import fetchArtists from "@/app/api-fetch/all-artists";
import { processCloudinaryUrl } from "@/app/api-fetch/cloudinary-url-processing";

import { Artist } from "@/app/model/artist";
import Skeleton from "../loading/skeleton";

export default function Artists() {
  // useEffect to fetch data
  const [data, setData] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const loadArtists = async () => {
    try {
      setIsLoading(true);
      const artists = await fetchArtists();
      if (artists) {
        setData(artists);
      } else {
        throw new Error('No artists data received');
      }
    }
    catch (e) {
      console.error('Error fetching artists:', e);
      setError(e);
    }
    finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadArtists();
  }, []);

  if (error) {
    return (
      <ErrorComponent onReloadClick={() => {
        // fetchArtists();
        setError(null);
        setIsLoading(true);
        loadArtists();
      }} />
    );
  }

  if (isLoading) {
    <div className="card-scroll-inner flex gap-4 flex-wrap">
      <Skeleton className="w-[100px] h-[140px]"/>
      <Skeleton className="w-[100px] h-[140px]"/>
      <Skeleton className="w-[100px] h-[140px]"/>
      <Skeleton className="w-[100px] h-[140px]"/>
    </div>
  }

  try {
    console.log(data);
    const cards: CardProps[] = [];
    if (!data) {
      return (
        <ErrorComponent onReloadClick={() => {
          // fetchArtists();
          setError(null);
          setIsLoading(true);
          loadArtists();
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
      <div className="card-scroll-inner grid grid-cols-2 gap-3 md:grid-cols-3 lg:flex lg:gap-3">
        {cards.map((card, index) => {
          return (
          // <Suspense key={index} fallback={<Skeleton className="w-[100px] h-[140px]"/>}>
            <VerticalCard key={index} {...card} />
          // </Suspense>
          );
        })}
      </div>
    );
  }
  catch (e) {
    console.error('Error fetching artists:', e);
    return (
      <ErrorComponent onReloadClick={() => {
        // fetchArtists();
        setError(null);
        setIsLoading(true);
        loadArtists();
      }} />
    )
  }
}