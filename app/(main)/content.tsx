// app/home/home-client.tsx
"use client";

import { useEffect, useState } from "react";
import { getCookie } from "cookies-next";
import { Suspense } from "react";
import Loading from "./loading";

import Artists from "@/app/components/api-fetch-container/all-artists";
import Songs from "@/app/components/api-fetch-container/all-songs";
import Albums from "@/app/components/api-fetch-container/all-albums";

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

  return (
    <div className="home w-full flex flex-col gap-8">
      <h1 className="text-lg font-bold">Chào mừng đã quay lại, {getCookie("user_name")!}</h1>
      <h2 className="text-lg font-bold">Bài hát vừa nghe</h2>
      <div className="grid grid-cols-2 gap-4">
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
