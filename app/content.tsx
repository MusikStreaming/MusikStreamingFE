// app/home/home-client.tsx
"use client";

import { useEffect, useState } from "react";
import { getCookie } from "cookies-next";
import { Suspense } from "react";
import Loading from "./loading";

import Artists from "@/app/components/api-fetch-container/all-artists";
import Songs from "@/app/components/api-fetch-container/all-songs";
import Albums from "@/app/components/api-fetch-container/all-albums";
import HorizontalCard from "./components/info-cards/horizontal-card";
import { SongListSchema } from "./api-fetch/all-songs";
import { AlternativeSongListSchema } from "./api-fetch/all-songs";
import { Song } from "./model/song";

export default function Content() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        const accessToken = getCookie("access_token");
        if (mounted) {
          setIsLoggedIn(!!accessToken);
          setIsInitialized(true);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        if (mounted) {
          setIsLoading(false);
          setIsInitialized(true);
        }
      }
    };

    checkAuth();

    const interval = setInterval(checkAuth, 5000);
    window.addEventListener('storage', checkAuth);

    return () => {
      mounted = false;
      clearInterval(interval);
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  if (!isInitialized || isLoading) {
    return <Loading />;
  }

  if (!isLoggedIn) {
    return (
      <div className="home w-full flex flex-col gap-8">
        <div className="card-scroll">
          <h2 className="text-lg font-bold">Nghệ sĩ nổi bật</h2>
          <Suspense fallback={<Loading />}>
            <Artists />
          </Suspense>
        </div>
        <div className="card-scroll flex flex-col overflow-x-hidden gap-4">
          <h2 className="text-lg font-bold">Bài hát nổi bật</h2>
          <Suspense fallback={<Loading />}>
            <Songs />
          </Suspense>
        </div>
      </div>
    );
  }
  // let songs: Song[] = [];
  // const storedSongs = localStorage.getItem("songs");
  
  // if (storedSongs) {
  //   try {
  //     const parsedSongs = JSON.parse(storedSongs);
  //     songs = SongListSchema.parse(parsedSongs);
  //   } catch (error) {
  //     try {
  //       const parsedSongs = JSON.parse(storedSongs);
  //       songs = AlternativeSongListSchema.parse(parsedSongs).data;
  //     } catch (e) {
  //       console.error('Error parsing songs:', e);
  //     }
  //   }
  // }

  // // shuffle songs
  // songs = songs.sort(() => Math.random() - 0.5);

  return (
    <div className="home w-full flex flex-col gap-8">
      <h1 className="text-lg font-bold">Chào mừng đã quay lại, {getCookie("user_name")!}</h1>
      <h2 className="text-lg font-bold">Bài hát vừa nghe</h2>
      <div className="grid grid-cols-2 gap-4">
        
        {/* {
          songs.map((song, index) => (
            index < 8 && (
              <HorizontalCard key={song.id} title={song.title} subtitle={song.artists.map((artist) => artist.artist.name).join(", ")} img={{src: song.thumbnailurl, alt: song.title, width: 140}} href={`/song/${song.id}`} />
            )
          ))
        } */}
      </div>
      <div className="card-scroll flex flex-col overflow-x-hidden gap-4">
        <h2 className="text-lg font-bold">Bài hát mới</h2>
        <Suspense fallback={<Loading />}>
          <Songs />
        </Suspense>
      </div>
      <div className="card-scroll flex flex-col overflow-x-hidden gap-4">
        <h2 className="text-lg font-bold">Đề xuất dành cho bạn</h2>
        <Suspense fallback={<Loading />}>
          <Albums />
        </Suspense>
      </div>
    </div>
  );
}
