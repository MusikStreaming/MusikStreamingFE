'use client';

import "@material/web/fab/fab";
import { useRouter } from "next/navigation";
import { Suspense, useState, useEffect } from "react";

export default function DiscographyPage() {
  const router = useRouter();
  const [artists, setArtists] = useState([]);
  const [showAddMenu, setShowAddMenu] = useState(false);
  useEffect(() => {
    const checkManagerStatus = async () => {
      try {
        const response = await fetch('/api/auth/user-info', {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to check manager status');
        }

        const data = await response.json();
        if (!data.artistManager) {
          router.replace('/');
          return;
        }

        // Fetch stats only if user is a manager
        // setStats({
        //   totalSongs: 42,
        //   totalAlbums: 5,
        //   totalPlays: 10000
        // });
      } catch (error) {
        console.error('Error checking manager status:', error);
        router.replace('/');
      }
    };

    checkManagerStatus();
  }, [router]);

  useEffect(() => {
    // TODO: Fetch artists data
    setArtists([
      {
        id: 1,
        name: "Artist 1",
        albums: [
          { id: 1, title: "Album 1", coverUrl: "/placeholder.jpg" }
        ],
        songs: [
          { id: 1, title: "Song 1" }
        ]
      }
    ]);
  }, []);

  return (
    <Suspense>
      <div className="h-full">
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-6">Artists Management</h1>
          <div className="grid grid-cols-1 gap-6">
            {artists.map((artist) => (
              <div key={artist.id} className="bg-[--md-sys-color-surface-container] rounded-lg p-4">
                <h2 className="text-xl font-bold mb-4">{artist.name}</h2>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Albums</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {artist.albums.map((album) => (
                      <div key={album.id} className="p-2 bg-[--md-sys-color-surface-container-high] rounded">
                        <img src={album.coverUrl} alt={album.title} className="w-full aspect-square rounded mb-2" />
                        <p className="text-sm font-medium">{album.title}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Songs</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {artist.songs.map((song) => (
                      <div key={song.id} className="p-2 bg-[--md-sys-color-surface-container-high] rounded">
                        {song.title}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="fixed bottom-24 right-8 md:bottom-32">
          {showAddMenu && (
            <div className="absolute bottom-16 min-w-fit right-0 bg-[--md-sys-color-surface-container] rounded-lg shadow-lg overflow-hidden">
              <button
                className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-[--md-sys-color-surface-container-high]"
                onClick={() => router.push('/manager/discography/add?type=album')}
              >
                <span className="material-symbols-outlined">album</span>
                <span className="w-full truncate">Add Album</span>
              </button>
              <button
                className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-[--md-sys-color-surface-container-high]"
                onClick={() => router.push('/manager/discography/add?type=song')}
              >
                <span className="material-symbols-outlined">music_note</span>
                <span className="w-full truncate">Add Song</span>
              </button>
            </div>
          )}
          <button
            className="w-14 h-14 bg-[--md-sys-color-primary] rounded-full text-[--md-sys-color-on-primary] flex items-center justify-center"
            onClick={() => setShowAddMenu(!showAddMenu)}
          >
            <span className="material-symbols-outlined">
              {showAddMenu ? 'close' : 'add'}
            </span>
          </button>
        </div>
      </div>
    </Suspense>
  );
}
