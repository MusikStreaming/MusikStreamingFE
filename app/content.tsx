// app/home/home-client.tsx
"use client";

import { useEffect, useState } from "react";
import { getCookie, hasCookie } from "cookies-next";
import { useQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import Loading from "./loading";
import fetchHistory, {HistoryItem} from "@/app/api-fetch/get-history";
import { useMedia } from "./contexts/media-context";

import Artists from "@/app/components/api-fetch-container/all-artists";
import Songs from "@/app/components/api-fetch-container/all-songs";
import Albums from "@/app/components/api-fetch-container/all-albums";
import HorizontalCard from "./components/info-cards/horizontal-card";

export default function Content() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [username, setUsername] = useState<string>('');

  // Separate effect for auth check
  useEffect(() => {
    let mounted = true;

    const checkAuth = () => {
      const hasSession = hasCookie('session');
      const sessionValue = getCookie('session');
      const isAuthenticated = hasSession && sessionValue === 'true';

      if (mounted) {
        setIsLoggedIn(isAuthenticated);
        if (!isAuthenticated) {
          setUsername('');
        }
      }
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);

    return () => {
      mounted = false;
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  // Separate effect for profile data
  useEffect(() => {
    let mounted = true;

    const fetchProfile = async () => {
      if (!isLoggedIn) {
        setIsLoading(false);
        setIsInitialized(true);
        return;
      }

      try {
        // Get username from cookie first for quick display
        const cookieUsername = getCookie('username');
        if (cookieUsername) {
          setUsername(String(cookieUsername));
        }

        // Then fetch full profile data once
        const response = await fetch('/api/user/profile', {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user profile');
        }

        if (mounted) {
          setIsInitialized(true);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        if (mounted) {
          setIsInitialized(true);
          setIsLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      mounted = false;
    };
  }, [isLoggedIn]); // Only re-run when login state changes

  const { data, error, refetch } = useQuery({
    queryKey: ['history'],
    queryFn: async () => {
      const response = await fetchHistory();
      if (!response) {
        throw new Error('Failed to fetch history');
      }
      return response;
    },
    enabled: isLoggedIn && isInitialized && !isLoading
  });

  if (!isInitialized || isLoading) {
    return <Loading />;
  }

  if (!isLoggedIn) {
    return (
      <div className="home w-full flex flex-col gap-8">
        <div className="card-scroll flex flex-col gap-4">
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
        <div className="card-scroll flex flex-col overflow-x-hidden gap-4">
          <h2 className="text-lg font-bold">Đề xuất dành cho bạn</h2>
          <Suspense fallback={<Loading />}>
            <Albums />
          </Suspense>
        </div> 
      </div>
    );
  }

  return (
    <div className="home w-full flex flex-col gap-8">
      <h1 className="text-lg font-bold">Chào mừng đã quay lại, {username}!</h1>
      <h2 className="text-lg font-bold">Bài hát vừa nghe</h2>
      <div className="grid grid-cols-2 gap-4">
        {
        data && data.data && data.data.length > 0 && data.data.map((historyItem: HistoryItem) => (
          <HorizontalCard
            key={historyItem.songs.id}
            title={historyItem.songs.title}
            subtitle={historyItem.songs.artists.map(artist => artist.artist.name).join(', ')}
            href={`/song/${historyItem.songs.id}`}
            type="song"
            img={{
              src: historyItem.songs.thumbnailurl || '/assets/placeholder.jpg',
              alt: historyItem.songs.title,
              width: 64,
            }}
            songID={historyItem.songs.id}
          />
        ))
      }
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
