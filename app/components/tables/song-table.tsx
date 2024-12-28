'use client';

import Link from "next/link";
import Skeleton from "@/app/components/loading/skeleton";
import { formatDuration } from "@/app/utils/time";
import { useMedia } from "@/app/contexts/media-context";
import PlayButton from "../buttons/play-button-main";
import getSong from "@/app/api-fetch/get-song";
import { twMerge } from "tailwind-merge";
import Image from "next/image";

export default function SongTable({ songs, className, showImage }: {
  songs: {
    song: {
      title: string;
      duration?: number | null;
      views?: number | null;
      id: string;
      url?: string;
      thumbnailurl?: string;
      artists?: {
        name: string;
        id?: string;
      }[];
    }
  }[];
  className?: string;
  showImage?: boolean;
}) {
  const { currentSong, isPlaying, playSong, pauseSong, addToQueue, clearQueue, playList } = useMedia();

  const getSongUrl = async (id: string) => {
    const song = await getSong(id);
    console.log(song);
    return song.url;
  };

  const handlePlayClick = async (song: typeof songs[0]['song'], index: number) => {
    try {
      if (currentSong?.id === song.id && isPlaying) {
        pauseSong();
        return;
      }

      // Clear existing queue first
      clearQueue();

      // Get the URL for the clicked song immediately
      const songUrl = await getSongUrl(song.id);
      if (!songUrl) {
        console.error('Failed to get song URL');
        return;
      }

      // Create playlist starting from clicked song with the immediate URL
      const playlist = songs.slice(index).map((s, i) => ({
        id: s.song.id,
        title: s.song.title,
        url: s.song.id === song.id ? songUrl : s.song.url || "", // Only include URL for clicked song
        duration: s.song.duration || 0,
        thumbnailurl: s.song.thumbnailurl || '',
        releasedate: "",
        genre: '',
        views: s.song.views || 0,
        artists: s.song.artists?.map(a => ({ artist: { id: a.id || "#", name: a.name } })) || [{ artist: { id: "#", name: "Unknown" } }]
      }));

      // Play the sliced list with the clicked song first
      await playList(playlist);
    } catch (error) {
      console.error('Error playing song:', error);
    }
  };

  return (
    <div className={twMerge("w-full overflow-x-auto", className)}>
      <table className="w-full">
        <thead>
          <tr>
            <th className="px-4 py-3 hidden md:table-cell text-center w-16">#</th>
            <th className="text-left px-4 py-3">Title</th>
            <th className="text-left px-4 py-3">Duration</th>
            <th className="text-left px-4 py-3">Plays</th>
          </tr>
        </thead>
        <tbody>
          {songs.map((song, index) => (
            <tr
              className="hover:bg-[--md-sys-color-surface-container-highest] group cursor-pointer rounded-lg"
              key={`${song.song.id}-${index}`}
              onClick={() => handlePlayClick(song.song, index)}
            >
              <td className="px-4 py-4 hidden text-center md:table-cell rounded-l-lg w-16">
                <span className="group-hover:hidden">
                  {currentSong?.id === song.song.id && isPlaying ?
                    <p className="material-symbols-outlined-filled text-[--md-sys-color-primary]">pause</p> :
                    index + 1
                  }
                </span>
                <PlayButton
                  isPlaying={currentSong?.id === song.song.id && isPlaying}
                  onClick={() => handlePlayClick(song.song, index)}
                  className="hidden group-hover:block m-auto"
                  songId={song.song.id}
                />
              </td>
              <td className="px-4 py-4 flex items-center gap-4">
                {showImage && song.song.thumbnailurl &&
                  <Image src={song.song.thumbnailurl} alt={song.song.title} className="w-10 h-10 rounded-lg" width={40} height={40} />
                }
                <div className="flex flex-col">
                  {song.song.title ?
                    <p className={currentSong?.id === song.song.id ? "text-[--md-sys-color-primary]" : ""}>
                      {song.song.title}
                    </p> :
                    <Skeleton className='h-4 w-full' />
                  }
                  {
                    song.song.artists && song.song.artists.length > 0 &&
                    <p className="text-sm text-[--md-sys-color-outline]">
                      {song.song.artists && song.song.artists.map((artist, artistIndex) => (
                        <span key={artist.id ? artist.id : `artist-${artistIndex}`}>
                          <Link href={`/artist/${artist.id}`} className="hover:underline">{artist.name}</Link>
                          {song.song.artists && artistIndex < song.song.artists.length - 1 && ', '}
                        </span>
                      ))}
                    </p>
                  }
                </div>
              </td>
              <td className="px-4 py-4">
                {song.song.duration ?
                  <p>{formatDuration(song.song.duration, true)}</p> :
                  <Skeleton className='h-4 w-full' />
                }
              </td>
              <td className="px-4 py-4 rounded-r-lg">
                {song.song.views ?
                  <p>{song.song.views.toLocaleString()}</p> :
                  <Skeleton className='h-4 w-full' />
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}