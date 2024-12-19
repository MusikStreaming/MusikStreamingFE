'use client'
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import search from "@/app/api-fetch/search";
import ErrorComponent from "@/app/components/api-fetch-container/fetch-error";
import { Suspense } from "react";

interface ResultDesktopProps {
  query: string;
}

export default function ResultDesktop({ query }: ResultDesktopProps) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['search', query],
    queryFn: async () => await search(query),
    enabled: query.length > 0,
    staleTime: 1000 * 60 * 5, // Cache results for 5 minutes
  });

  if (query.length === 0) {
    return <p>Please enter a search term</p>;
  }

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <ErrorComponent onReloadClick={refetch} />;
  if (!data?.data) return <p>No results found</p>;

  const { albums = [], songs = [], artists = [], users = [] } = data.data;

  const hasResults = albums.length > 0 || songs.length > 0 || artists.length > 0 || users.length > 0;

  if (!hasResults) {
    return <p>No results found for &quot;{query}&quot;</p>;
  }

  return (
    <Suspense>
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold">Search results for &quot;{query}&quot;</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {albums.length > 0 && (
            <div className="flex flex-col rounded-lg bg-[--md-sys-color-surface-container-highest] p-4 gap-4">
              <h3 className="text-xl font-bold">Albums</h3>
              <div className="grid grid-cols-2 gap-4">
                {albums.map(album => (
                  <div key={album.id} className="flex flex-col gap-2">
                    {album.thumbnailurl && (
                      <Image
                        src={album.thumbnailurl}
                        alt={album.title}
                        width={64}
                        height={64}
                        className="rounded-lg"
                      />
                    )}
                    <p className="text-sm font-bold">{album.title}</p>
                    <p className="text-sm">{album.profiles?.map(profile => profile.name).join(", ") || "Unknown Artist"}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {songs.length > 0 && (
            <div className="flex flex-col rounded-lg bg-[--md-sys-color-surface-container-highest] p-4 gap-4">
              <h3 className="text-xl font-bold">Songs</h3>
              <div className="flex flex-col gap-4">
                {songs.map(song => (
                  <div key={song.id} className="flex gap-2">
                    {song.thumbnailurl && (
                      <Image
                        src={song.thumbnailurl}
                        alt={song.title}
                        width={64}
                        height={64}
                        className="rounded-lg"
                      />
                    )}
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-bold">{song.title}</p>
                      <p className="text-sm">{song.artists?.map(artist => artist.name).join(", ") || "Unknown Artist"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {artists.length > 0 && (
            <div className="flex flex-col rounded-lg bg-[--md-sys-color-surface-container-highest] p-4 gap-4">
              <h3 className="text-xl font-bold">Artists</h3>
              <div className="flex flex-col gap-4">
                {artists.map(artist => (
                  <div key={artist.id} className="flex gap-2 items-center">
                    {artist.avatarurl && (
                      <Image
                        src={artist.avatarurl}
                        alt={artist.name || ""}
                        width={64}
                        height={64}
                        className="rounded-lg"
                      />
                    )}
                    <p className="text-sm font-bold">{artist.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {users.length > 0 && (
            <div className="flex flex-col rounded-lg bg-[--md-sys-color-surface-container-highest] p-4 gap-4">
              <h3 className="text-xl font-bold">Users</h3>
              <div className="flex flex-col gap-4">
                {users.map(user => (
                  <div key={user.id} className="flex gap-2 items-center">
                    {user.avatarurl && (
                      <div className="flex items-center gap-2 w-16 h-16 overflow-hidden rounded-lg bg-[--md-sys-color-surface-container-lowest]">
                        <Image
                          src={user.avatarurl}
                          alt={user.username || ""}
                          width={64}
                          height={64}
                          className="rounded-lg"
                        />
                      </div>
                    )}
                    <p className="text-sm font-bold">{user.username}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Suspense>
  );
}