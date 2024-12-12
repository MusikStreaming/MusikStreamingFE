'use client';

import { twMerge } from 'tailwind-merge';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import fetchSongById from '@/app/api-fetch/song-by-id';
import fetchAlbumById from '@/app/api-fetch/album-by-id';
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
import { AlbumDetails } from '@/app/model/album-details';
import VerticalCard from '@/app/components/info-cards/vertical-card';
import Link from 'next/link';
import { SongCard } from '@/app/components/info-cards/song-card';

const mapSongToPlayable = (song: SongDetails) => ({
  id: song.id,
  title: song.title,
  duration: song.duration,
  thumbnailurl: song.thumbnailurl || '/assets/placeholder.jpg',
  releasedate: song.releasedate,
  genre: song.genre,
  views: song.views,
  artists: song.artists?.map(a => ({ artist: { id: a.id, name: a.name } })) || []
});

function processDatetime(ISODate: string): string {
  const date = new Date(ISODate);
  return date.toLocaleDateString();
}

interface AlbumSong {
  song: {
    id: string;
    title: string;
    thumbnailurl?: string;
    artists?: { name: string }[];
  };
}

const mapSongToCard = (songData: AlbumSong['song']) => ({
  title: songData?.title || '',
  subtitle: songData?.artists?.map(a => a.name).join(', ') || '',
  img: {
    src: songData?.thumbnailurl || '',
    alt: songData?.title || '',
    width: 200,
    height: 200
  },
  href: `/song/${songData?.id}`,
});

export default function SongContent(params: { id: string; initialData: SongDetails | null }) {
  const [song, setSong] = useState<SongDetails | undefined>(params.initialData || undefined);
  const [albums, setAlbums] = useState<AlbumDetails[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const {
    playSong,
    pauseSong,
    isPlaying,
    currentSong,
    progress,
    seekTo,
    isLoading,
    queue,
  } = useMedia();
  const { likedSongs, addLikedSong, removeLikedSong } = useLiked();
  const fetchSongData = useCallback(async () => {
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
      fetchSongData();
    }
  }, [fetchSongData, params.initialData]);

  const fetchAlbumData = useCallback(async (id: string) => {
    const album = await fetchAlbumById(id);
    return album;
  }, []);

  useEffect(() => {
    if (song?.albums) {
      song.albums.forEach(async (album) => {
        const albumData = await fetchAlbumData(album?.album?.id || '');
        setAlbums(prevAlbums => [...prevAlbums, albumData]);
      });
    }
  }, [song, fetchAlbumData]);

  useEffect(() => {
    // Reset any scroll position when the page loads
    window.scrollTo(0, 0);
  }, []);

  const hasNoCurrentSong = !currentSong;
  const isPlaybackDisabled = hasNoCurrentSong || isLoading;

  if (error) {
    return <ErrorComponent onReloadClick={fetchSongData} />;
  }

  try {
    return (
      <div className='flex flex-col w-full gap-8 p-4'>
        {/* Hero Section */}
        <div className="desktop hidden md:flex md:flex-col gap-6 w-full">
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
                  // play this song
                  // or resume playback if this song is paused
                  // or pause if this song is playing
                  onClick={() => {
                    return song && (isPlaying && currentSong?.id === song?.id ? pauseSong() : playSong(mapSongToPlayable(song)));
                  }}
                  isPlaying={isPlaying && currentSong?.id === song?.id}
                  songId={song?.id}
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
                      thumbnailurl: song.thumbnailurl || '/assets/placeholder.jpg',
                      artists: song.artists?.map(a => ({ artist: { id: a.id, name: a.name } })) || []
                    })
                    : addLikedSong({
                      ...song,
                      thumbnailurl: song.thumbnailurl || '/assets/placeholder.jpg',
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
                  thumbnailurl: song.thumbnailurl,
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
        <div className="mobile flex flex-col md:hidden slide-up-enter w-full">
          <TextButton className="text-[--md-sys-color-primary] w-fit" onClick={() => router.back()}>
            <span className="material-symbols-outlined">arrow_back</span>
            Quay lại
          </TextButton>
          <div className="song-info flex flex-col gap-[60px] w-full pt-6 items-center">
            <div className="cover-and-title flex flex-col w-full items-center">
              <div className={`img-large-rotate ${currentSong?.id === song?.id ? 'animate-spin-slow' : ''}`}>
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
                        thumbnailurl: song.thumbnailurl || '/assets/placeholder.jpg',
                        artists: song.artists?.map(a => ({ artist: { id: a.id, name: a.name } })) || []
                      })
                      : addLikedSong({
                        ...song,
                        thumbnailurl: song.thumbnailurl || '/assets/placeholder.jpg',
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
                    isPlaybackDisabled && "opacity-50"
                  )}
                  aria-label="song-progress"
                  type="range"
                  value={song?.id === currentSong?.id ? progress : 0}
                  min={0}
                  max={song?.duration || 100}
                  onChange={(e) => seekTo(parseInt(e.target.value))}
                  disabled={isPlaybackDisabled}
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
                  onClick={() => song && (isPlaying && currentSong?.id === song?.id ? pauseSong() : playSong(mapSongToPlayable(song)))}
                  isPlaying={isPlaying && currentSong?.id === song?.id}
                  songId={song?.id}
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
            {/* <div className="flex flex-col gap-3 w-full pt-6 items-center">
              <p className="">Ngày phát hành: {processDatetime(song?.releasedate || '')}</p>
              <p className="">Lượt xem: {song?.views.toLocaleString()}</p>
            </div> */}
          </div>

        </div>
        <div className="flex flex-col gap-3 w-full">
          <h2 className="text-lg font-bold">Lời bài hát</h2>
        </div>
        <div className='flex flex-col'>
          <h2 className='text-lg font-bold'>Danh sách phát</h2>

        </div>
        <div className="flex flex-col w-full overflow-hidden">
          {
            albums.map((album, index) => (
              index === 0 && <div key={album?.id} className="flex flex-col gap-3 w-full">
                <p className="text-lg">Các bài hát cùng album <Link href={`/album/${album?.id}`} className="font-medium hover:underline hover:text-[--md-sys-color-primary]">{album?.title}</Link></p>
                <div className="card-scroll grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-4">
                  {
                    album?.songs?.map(song => (
                      <SongCard key={song?.song?.id} type="song" {...mapSongToCard(song?.song)} />
                    ))
                  }
                </div>
              </div>
            ))
          }
        </div>
      </div>
    );
  } catch (e) {
    console.error(e);
    return <ErrorComponent onReloadClick={fetchSongData} />;
  }
}