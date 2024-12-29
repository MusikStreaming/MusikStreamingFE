'use client'
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import search from "@/app/api-fetch/search";
import ErrorComponent from "@/app/components/api-fetch-container/fetch-error";
import { Suspense } from "react";
import { useMedia } from "@/app/contexts/media-context"; // Import useMedia hook
import PlayButton from "../components/buttons/play-button-main";
import { AlbumCard } from "../components/info-cards/album-card";
import SearchFilterChips from "../components/filters/search-filter-chips";
import Link from "next/link";

interface ResultDesktopProps {
  query: string;
}

export default function ResultDesktop({ query }: ResultDesktopProps) {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['search', query],
    queryFn: async () => await search(query),
    enabled: query.length > 0,
    staleTime: 30000, // Cache results for 30 seconds
  });

  const { 
    playSong, 
    playList,
    currentSong,
    isPlaying, 
  } = useMedia(); // Destructure playSong and playList from useMedia

  if (query.trim().length === 0) {
    return <p>Please enter a search term</p>;
  }

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <ErrorComponent onReloadClick={refetch} />;
  if (!data?.data) return <p>No results found</p>;

  const renderContent = () => {
    const { albums = [], songs = [], artists = [], users = [] } = data?.data || {};
    const counts = {
      albums: albums.length,
      songs: songs.length,
      artists: artists.length,
      users: users.length
    };

    const hasResults = albums.length > 0 || songs.length > 0 || artists.length > 0 || users.length > 0;

    if (!hasResults) {
      return <p>No results found for &quot;{query}&quot;</p>;
    }

    return (
      <>
        <SearchFilterChips
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
          counts={counts}
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(selectedFilter === 'all' || selectedFilter === 'albums') && albums.length > 0 && (
            <div className="flex flex-col rounded-lg bg-[--md-sys-color-surface-container-highest] p-4 gap-4">
              <h3 className="text-xl font-bold">Albums</h3>
              <div className="grid grid-cols-2 gap-4">
                {albums.map(album => (
                  <AlbumCard
                    key={album.id}
                    listID={album.id}
                    title={album.title}
                    subtitle={album.profiles?.map(profile => profile.name).join(", ") || "Unknown Artist"}
                    img={{
                      src: album.thumbnailurl || '/assets/placeholder.jpg',
                      alt: album.title + " cover image",
                      width: 48
                    }}
                    href={`/album/${album.id}`}
                    type="album"
                  />
                ))}
              </div>
            </div>
          )}
          {(selectedFilter === 'all' || selectedFilter === 'songs') && songs.length > 0 && (
            <div className="flex flex-col rounded-lg bg-[--md-sys-color-surface-container-highest] p-4 gap-4">
              <h3 className="text-xl font-bold">Songs</h3>
              <div className="flex flex-col gap-4">
                {songs.map(song => (
                  <div key={song.id} className="group flex gap-2 justify-between items-center hover:bg-[--md-sys-color-surface-container-highe] rounded-lg p-2">
                    <Link href={`/song/${song.id}`} className="flex gap-2 items-center flex-1">
                      <div className="flex gap-2 items-center">
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
                          <div className="flex flex-wrap gap-1">
                            {song.artists?.map((artist, index) => (
                              <Link
                                key={artist.id}
                                href={`/artist/${artist.id}`}
                                className="text-sm hover:underline"
                                onClick={e => e.stopPropagation()}
                              >
                                {artist.name}
                                {index < (song.artists?.length || 0) - 1 ? ", " : ""}
                              </Link>
                            )) || "Unknown Artist"}
                          </div>
                        </div>
                      </div>
                    </Link>
                    <PlayButton
                      isPlaying={isPlaying && currentSong?.id === song.id}
                      onClick={() => {
                        if (!song) return;
                        playSong({
                          id: song.id,
                          title: song.title,
                          duration: song.duration || null,
                          thumbnailurl: song.thumbnailurl || '/assets/placeholder.jpg',
                          artists: song.artists?.map(a => ({ artist: { id: a.id || '#', name: a.name || 'Unknown Artist' } })) || []
                        });
                      }} />
                  </div>
                ))}
              </div>
            </div>
          )}
          {(selectedFilter === 'all' || selectedFilter === 'artists') && artists.length > 0 && (
            <div className="flex flex-col rounded-lg bg-[--md-sys-color-surface-container-highest] p-4 gap-4">
              <h3 className="text-xl font-bold">Artists</h3>
              <div className="flex flex-col gap-4">
                {artists.map(artist => (
                  <Link
                    key={artist.id}
                    href={`/artist/${artist.id}`}
                    className="flex gap-2 items-center hover:bg-[--md-sys-color-surface-container-high] rounded-lg p-2"
                  >
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
                  </Link>
                ))}
              </div>
            </div>
          )}
          {(selectedFilter === 'all' || selectedFilter === 'users') && users.length > 0 && (
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
      </>
    );
  };

  return (
    <Suspense>
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold">Search results for &quot;{query}&quot;</h2>
        {renderContent()}
      </div>
    </Suspense>
  );
}