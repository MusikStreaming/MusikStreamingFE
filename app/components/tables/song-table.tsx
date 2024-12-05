'use client';

import Skeleton from "@/app/components/loading/skeleton";
import { processTime } from "@/app/utils/time";
import { useMedia } from "@/app/contexts/media-context";
import PlayButton from "../buttons/play-button-main";
import { hasCookie } from "cookies-next";
import { redirectToLogin } from "@/app/services/auth.service";

export default function SongTable({ songs }: { songs: {
  song:{
    title: string;
    duration?: number | null;
    views?: number | null;
    id: string;
    url?: string;
  }
}[] }) {
  const { currentSong, isPlaying, playSong, pauseSong } = useMedia();

  const handlePlayClick = (song: typeof songs[0]['song']) => {
    if (!hasCookie('access_token')) {
      redirectToLogin(window.location.pathname);
      return;
    }
    
    if (!song.url) {
      console.error('No URL available for song');
      return;
    }

    if (currentSong?.id === song.id && isPlaying) {
      pauseSong();
    } else {
      playSong({
        id: song.id,
        title: song.title,
        url: song.url,
        duration: song.duration || 0
      });
    }
  };

  return (
    <div className="w-full overflow-x-auto">
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
                  className="hidden group-hover:block m-auto "
                />
              </td>
              <td className="px-4 py-4">
                {song.song.title ? 
                  <p className={currentSong?.id === song.song.id ? "text-[--md-sys-color-primary]" : ""}>
                    {song.song.title}
                  </p> :
                  <Skeleton className='h-4 w-full' />
                }
              </td>
              <td className="px-4 py-4">
                {song.song.duration ?
                  <p>{processTime(song.song.duration)}</p> :
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