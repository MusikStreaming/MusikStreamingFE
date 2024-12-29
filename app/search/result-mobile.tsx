'use client'
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import search from "@/app/api-fetch/search";
import ErrorComponent from "@/app/components/api-fetch-container/fetch-error";
import { Suspense } from "react";
import { useMedia } from "@/app/contexts/media-context";
import PlayButton from "../components/buttons/play-button-main";
import { AlbumCard } from "../components/info-cards/album-card";
import SearchFilterChips from "../components/filters/search-filter-chips";
import Link from "next/link";

interface ResultMobileProps {
  query: string;
}

export default function ResultMobile({ query }: ResultMobileProps) {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['search', query],
    queryFn: async () => await search(query),
    enabled: query.length > 0,
    staleTime: 30000,
  });

  const { 
    playSong, 
    playList,
    currentSong,
    isPlaying, 
  } = useMedia();

  if (query.trim().length === 0) {
    return <p className="p-4">Please enter a search term</p>;
  }

  if (isLoading) return <p className="p-4">Loading...</p>;
  if (isError) return <ErrorComponent onReloadClick={refetch} />;
  if (!data?.data) return <p className="p-4">No results found</p>;

  const { albums = [], songs = [], artists = [], users = [] } = data.data;
  const hasResults = albums.length > 0 || songs.length > 0 || artists.length > 0 || users.length > 0;

  const renderContent = () => {
    const counts = {
      albums: albums.length,
      songs: songs.length,
      artists: artists.length,
      users: users.length
    };

    if (!hasResults) {
      return <p className="p-4">No results found for &quot;{query}&quot;</p>;
    }

    return (
      <>
        <SearchFilterChips
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
          counts={counts}
        />
        {(selectedFilter === 'all' || selectedFilter === 'albums') && albums.length > 0 && (
          <div className="flex flex-col gap-3">
            <h3 className="text-lg font-bold">Albums</h3>
            <div className="grid grid-cols-2 gap-3">
              {albums.map(album => (
                <AlbumCard
                  key={album.id}
                  listID={album.id}
                  title={album.title}
                  subtitle={album.profiles?.map(profile => profile.name).join(", ") || "Unknown Artist"}
                  img={{
                    src: album.thumbnailurl || '/assets/placeholder.jpg',
                    alt: album.title
                  }}
                  href={`/album/${album.id}`}
                  type="album"
                />
              ))}
            </div>
          </div>
        )}
        {(selectedFilter === 'all' || selectedFilter === 'songs') && songs.length > 0 && (
          <div className="flex flex-col gap-3">
            <h3 className="text-lg font-bold">Songs</h3>
            <div className="flex flex-col gap-2">
              {songs.map(song => (
                <div key={song.id} className="group flex gap-2 justify-between items-center bg-[--md-sys-color-surface-container-highest] p-2 rounded-lg hover:bg-[--md-sys-color-surface-container-high]">
                  <Link href={`/song/${song.id}`} className="flex gap-2 items-center flex-1 min-w-0">
                    <div className="flex gap-2 items-center flex-1 min-w-0">
                      {song.thumbnailurl && (
                        <Image
                          src={song.thumbnailurl}
                          alt={song.title}
                          width={40}
                          height={40}
                          className="rounded-lg shrink-0"
                        />
                      )}
                      <div className="flex flex-col gap-1 min-w-0">
                        <p className="text-sm font-bold truncate">{song.title}</p>
                        <div className="flex flex-wrap gap-1">
                          {song.artists?.map((artist, index) => (
                            <Link
                              key={artist.id}
                              href={`/artist/${artist.id}`}
                              className="text-xs hover:underline"
                              onClick={e => e.stopPropagation()}
                            >
                              {artist.name}
                              {index < (song.artists?.length || 0) - 1 ? ", " : ""}
                            </Link>
                          )) || "Unknown"}
                        </div>
                      </div>
                    </div>
                  </Link>
                  <PlayButton
                    isPlaying={isPlaying && currentSong?.id === song.id}
                    onClick={(e: React.ChangeEvent) => {
                      e.stopPropagation();
                      if (!song) return;
                      playSong({
                        id: song.id,
                        title: song.title,
                        duration: song.duration || null,
                        thumbnailurl: song.thumbnailurl || '/assets/placeholder.jpg',
                        artists: song.artists?.map(a => ({ artist: { id: a.id || '#', name: a.name || 'Unknown' } })) || []
                      });
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        {(selectedFilter === 'all' || selectedFilter === 'artists') && artists.length > 0 && (
          <div className="flex flex-col gap-3">
            <h3 className="text-lg font-bold">Artists</h3>
            <div className="grid grid-cols-2 gap-2">
              {artists.map(artist => (
                <Link 
                  key={artist.id} 
                  href={`/artist/${artist.id}`}
                  className="flex gap-2 items-center bg-[--md-sys-color-surface-container-highest] p-2 rounded-lg hover:bg-[--md-sys-color-surface-container-high]"
                >
                  {artist.avatarurl && (
                    <Image
                      src={artist.avatarurl}
                      alt={artist.name || ""}
                      width={40}
                      height={40}
                      className="rounded-lg"
                    />
                  )}
                  <p className="text-sm font-bold truncate">{artist.name}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
        {(selectedFilter === 'all' || selectedFilter === 'users') && users.length > 0 && (
          <div className="flex flex-col gap-3">
            <h3 className="text-lg font-bold">Users</h3>
            <div className="grid grid-cols-2 gap-2">
              {users.map(user => (
                <div key={user.id} className="flex gap-2 items-center bg-[--md-sys-color-surface-container-highest] p-2 rounded-lg">
                  {user.avatarurl && (
                    <div className="w-10 h-10 overflow-hidden rounded-lg bg-[--md-sys-color-surface-container-lowest]">
                      <Image
                        src={user.avatarurl}
                        alt={user.username || ""}
                        width={40}
                        height={40}
                        className="rounded-lg"
                      />
                    </div>
                  )}
                  <p className="text-sm font-bold truncate">{user.username}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <Suspense>
      <div className="flex flex-col gap-4 p-4">
        <h2 className="text-xl font-bold">Search results for &quot;{query}&quot;</h2>
        {renderContent()}
      </div>
    </Suspense>
  );
}