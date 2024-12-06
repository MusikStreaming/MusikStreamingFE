'use client';

import { twMerge } from 'tailwind-merge';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import fetchSongById from '@/app/api-fetch/song-by-id';
import ErrorComponent from '@/app/components/api-fetch-container/fetch-error';
import { SongDetails } from '@/app/model/song-details';
import Skeleton from '@/app/components/loading/skeleton';
import PlayButton from '@/app/components/buttons/play-button-main';
import IconSmallButton from '@/app/components/buttons/icon-small-button';
import ArtistLinks from '@/app/components/info-links/artist-link';
import ToggleButtonFilled from '@/app/components/buttons/toggle-button';
import ToggleIconButton from '@/app/components/buttons/toggle-icon-button';
import SongTable from '@/app/components/tables/song-table';
import { formatDuration } from '@/app/utils/time';
import { useMedia } from '@/app/contexts/media-context';
import { useLiked } from '@/app/contexts/liked-context';
import TextButton from '@/app/components/buttons/text-button';

function processDatetime(ISODate: string): string {
  const date = new Date(ISODate);
  return date.toLocaleDateString();
}

export default function SongContent(params: { id: string; initialData: SongDetails | null }) {
  const [song, setSong] = useState<SongDetails | undefined>(params.initialData || undefined);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const {
    playSong,
    isPlaying,
    currentSong,
    progress,
    seekTo,
    isLoading
  } = useMedia();
  const { likedSongs, addLikedSong, removeLikedSong } = useLiked();
  const fetchData = useCallback(async () => {
    try {
      const { id } = params;
      const songData = await fetchSongById(id);
      if (songData) {
        setSong(songData);
      }
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError(String(e));
      }
    }
  }, [params]);

  useEffect(() => {
    if (!params.initialData) {
      fetchData();
    }
  }, [fetchData, params.initialData]);

  const isEmpty = !currentSong;
  const isDisabled = isEmpty || isLoading;

  if (error) {
    return <ErrorComponent onReloadClick={fetchData} />;
  }

  try {
    return (
      <div className='flex flex-col w-full gap-8 p-4'>
        {/* Hero Section */}
        <div className="desktop hidden md:flex md:flex-col gap-6">
          <div className='flex flex-col md:flex-row items-center gap-6'>
            {song ?
              <Image
                src={song.thumbnailurl!}
                alt={song.title}
                width={200}
                height={200}
                priority={true}
                className="rounded-lg shadow-lg"
              /> :
              <Skeleton className="w-[200px] h-[200px] rounded-lg" />
            }
            <div className="flex flex-col gap-3 w-full">
              <p className='font-medium text-md'>Song</p>
              {song ?
                <h1 className='font-bold text-2xl md:text-3xl'>{song.title}</h1> :
                <Skeleton className='h-8 w-full' />
              }
              {song?.artists ?
                <ArtistLinks artists={song.artists} /> :
                <Skeleton className='h-10 w-2/3' />
              }
              <div className="mt-4 flex justify-start items-center gap-4">
                <PlayButton
                  className="bg-[--md-sys-color-primary] text-[--md-sys-color-on-primary] w-12 h-12"
                  onClick={() => song && playSong({
                    id: song.id,
                    title: song.title,
                    duration: song.duration,
                    coverImage: song.thumbnailurl,
                    thumbnailurl: song.thumbnailurl || '',
                    releasedate: song.releasedate,
                    genre: song.genre,
                    views: song.views,
                    artists: song.artists?.map(a => ({ artist: { id: a.id, name: a.name } })) || []
                  })}
                  isPlaying={isPlaying && currentSong?.id === song?.id}
                />
                <IconSmallButton onClick={() => {
                  if (song && window.location) {
                    navigator.clipboard.writeText(window.location.href);
                  }
                }}>
                  <span className="material-symbols-outlined">share</span>
                </IconSmallButton>
                <ToggleButtonFilled 
                  active={song && likedSongs.some(s => s.id === song.id)} 
                  onClick={() => song && (likedSongs.some(s => s.id === song.id) 
                    ? removeLikedSong({ 
                        ...song, 
                        thumbnailurl: song.thumbnailurl || '',
                        artists: song.artists?.map(a => ({ artist: { id: a.id, name: a.name } })) || []
                      }) 
                    : addLikedSong({ 
                        ...song, 
                        thumbnailurl: song.thumbnailurl || '',
                        artists: song.artists?.map(a => ({ artist: { id: a.id, name: a.name } })) || []
                      })
                  )}>
                  favorite
                </ToggleButtonFilled>
                <IconSmallButton>
                  <span className="material-symbols-outlined">more_vert</span>
                </IconSmallButton>
              </div>
            </div>
          </div>
          {/* Song Details Table */}
          {
            song ?
              <SongTable className="w-full mt-6" songs={[{
                song: {
                  id: song.id,
                  title: song.title,
                  duration: song.duration,
                  views: song.views,
                  coverImage: song.thumbnailurl,
                  artists: song.artists?.map(a => ({ name: a.name })) || []
                }
              }]} showImage={false} /> :
              <Skeleton className="w-full h-[200px]" />
          }
          {/* Additional Info */}
          <div className="flex flex-col gap-3 w-full pt-6">
            {song ?
              <p className="">Release Date: {processDatetime(song.releasedate)}</p> :
              <Skeleton className='h-4 w-48' />
            }
            {song ?
              <p className="">Total Views: {song.views.toLocaleString()}</p> :
              <Skeleton className='h-4 w-32' />
            }
          </div>
        </div>
        <div className="mobile flex flex-col md:hidden">
          <TextButton className="text-[--md-sys-color-primary] w-fit" onClick={() => router.back()}>
            <span className="material-symbols-outlined">arrow_back</span>
            Quay lại
          </TextButton>
          <div className="song-info flex flex-col gap-[60px] w-full pt-6 items-center">
            <div className="cover-and-title flex flex-col w-full items-center">
              <div className={`img-large-rotate ${isPlaying && currentSong?.id === song?.id ? 'animate-spin-slow' : ''}`}>
                <Image
                  src={song?.thumbnailurl || '/assets/placeholder.jpg'}
                  alt={song?.title || 'Song cover'}
                  width={300}
                  height={300}
                  priority={true}
                  className="rounded-full shadow-lg"
                />
              </div>
              <div className="flex justify-between items-center w-full pt-6">
                <div className="flex flex-col gap-3 w-full">
                  <h1 className='font-bold text-2xl md:text-3xl'>{song?.title}</h1>
                  <ArtistLinks artists={song?.artists || []} />
                </div>
                <div className="flex justify-end gap-4 items-center">
                  <ToggleIconButton alternateIcon={<span className="material-symbols-outlined">playlist_add_check</span>}>
                    <span className="material-symbols-outlined">playlist_add</span>
                  </ToggleIconButton>
                  <ToggleButtonFilled 
                    active={song && likedSongs.some(s => s.id === song.id)} 
                    onClick={() => song && (likedSongs.some(s => s.id === song.id) 
                      ? removeLikedSong({ 
                          ...song, 
                          thumbnailurl: song.thumbnailurl || '',
                          artists: song.artists?.map(a => ({ artist: { id: a.id, name: a.name } })) || []
                        }) 
                      : addLikedSong({ 
                          ...song, 
                          thumbnailurl: song.thumbnailurl || '',
                          artists: song.artists?.map(a => ({ artist: { id: a.id, name: a.name } })) || []
                        })
                    )}>
                    favorite
                  </ToggleButtonFilled>
                </div>
              </div>
            </div>
            <div className="control-region flex flex-col w-full items-center gap-4">
              <div className="progress-bar flex flex-col gap-3 w-full items-center">
                <input
                  className={twMerge(
                    "w-full",
                    isDisabled && "opacity-50"
                  )}
                  aria-label="song-progress"
                  type="range"
                  value={song?.id === currentSong?.id ? progress : 0}
                  min={0}
                  max={song?.duration || 100}
                  onChange={(e) => seekTo(parseInt(e.target.value))}
                  disabled={isDisabled}
                />
                <div className="flex justify-between gap-3 w-full items-center">
                  <p className="">{song?.id === currentSong?.id ? formatDuration(progress, true) : '0:00'}</p>
                  <p className="">{formatDuration(song?.duration || 0, true)}</p>
                </div>
              </div>
              <div className="flex justify-between items-center gap-4 w-full">
                <IconSmallButton>
                  <span className="material-symbols-outlined">shuffle</span>
                </IconSmallButton>
                <IconSmallButton>
                  <span className="material-symbols-outlined">skip_previous</span>
                </IconSmallButton>
                <PlayButton
                  className="bg-[--md-sys-color-primary] text-[--md-sys-color-on-primary] w-12 h-12"
                  onClick={() => song && playSong({
                    id: song.id,
                    title: song.title,
                    duration: song.duration,
                    coverImage: song.thumbnailurl,
                    thumbnailurl: song.thumbnailurl || '',
                    releasedate: song.releasedate,
                    genre: song.genre,
                    views: song.views,
                    artists: song.artists?.map(a => ({ artist: { id: a.id, name: a.name } })) || []
                  })}
                />
                <IconSmallButton>
                  <span className="material-symbols-outlined">skip_next</span>
                </IconSmallButton>
                <IconSmallButton>
                  <span className="material-symbols-outlined">repeat</span>
                </IconSmallButton>
              </div>
              <div className="additional flex justify-between items-center gap-4 w-full">
                <IconSmallButton>
                  <span className="material-symbols-outlined">queue_music</span>
                </IconSmallButton>
              </div>
            </div>
            <div className="flex flex-col gap-3 w-full pt-6 items-center">
              <p className="">Release Date: {processDatetime(song?.releasedate || '')}</p>
              <p className="">Total Views: {song?.views.toLocaleString()}</p>
            </div>
          </div>

        </div>
      </div>
    );
  } catch (e) {
    console.error(e);
    return <ErrorComponent onReloadClick={fetchData} />;
  }
}