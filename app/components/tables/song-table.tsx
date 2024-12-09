'use client';

import Skeleton from "@/app/components/loading/skeleton";
import { formatDuration } from "@/app/utils/time";
import { useMedia } from "@/app/contexts/media-context";
import PlayButton from "../buttons/play-button-main";
import { hasCookie } from "cookies-next";
import { redirectToLogin } from "@/app/services/auth.service";
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
      coverImage?: string;
      artists?: {
        name: string;
      }[];
    }
  }[];
  className?: string;
  showImage?: boolean;
}) {
  const { currentSong, isPlaying, playSong, pauseSong } = useMedia();

  const getSongUrl = async (id: string) => {
    const song = await getSong(id);
    console.log(song);
    return song.url;
  };

  const handlePlayClick = async (song: typeof songs[0]['song']) => {
    try {
      if (!hasCookie('session')) {
        redirectToLogin(window.location.pathname);
        return;
      }

      if (currentSong?.id === song.id && isPlaying) {
        pauseSong();
        return;
      }

      const songUrl = await getSongUrl(song.id);
      if (!songUrl) {
        console.error('Failed to get song URL');
        return;
      }

      playSong({
        id: song.id,
        title: song.title,
        url: songUrl,
        duration: song.duration || 0,
        coverImage: song.coverImage || '',
        thumbnailurl: song.coverImage || '',
        releasedate: "",
        genre: '',
        views: song.views || 0,
        artists: song.artists?.map(a => ({ artist: { id: '', name: a.name } })) || []
      });
    } catch (error) {
      console.error('Error playing song:', error);
    }
  };

  return (
    <div className={twMerge("w-full overflow-x-auto", className)}>
      <table className="w-full">
        <thead>
          <tr>
            <th className="px-4 py-3 hidden md:table-cell text-center">#</th>
            <th className="text-left px-4 py-3">Title</th>
            <th className="text-left px-4 py-3">Duration</th>
            <th className="text-left px-4 py-3">Plays</th>
          </tr>
        </thead>
        <tbody>
          {songs.map((song, index) => (
            <tr
              className="hover:bg-[--md-sys-color-surface-container-highest] group cursor-pointer rounded-lg"
              key={song.song.id}
              onClick={() => handlePlayClick(song.song)}
            >
              <td className="px-4 py-4 hidden text-center md:table-cell rounded-l-lg">
                <span className="group-hover:hidden">
                  {currentSong?.id === song.song.id && isPlaying ?
                    <p className="material-symbols-outlined-filled text-[--md-sys-color-primary]">pause</p> :
                    index + 1
                  }
                </span>
                <PlayButton
                  isPlaying={currentSong?.id === song.song.id && isPlaying}
                  onClick={() => handlePlayClick(song.song)}
                  className="hidden group-hover:block m-auto"
                />
              </td>
              <td className="px-4 py-4 flex items-center gap-4">
                {showImage && song.song.coverImage &&
                  <Image src={song.song.coverImage} alt={song.song.title} className="w-10 h-10 rounded-lg" width={40} height={40} />
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
                    <p className="text-sm text-gray-500">
                      {song.song.artists.map((artist) => artist.name).join(', ')}
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