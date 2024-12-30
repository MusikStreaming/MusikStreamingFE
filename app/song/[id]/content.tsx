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
import Link from 'next/link';
import { SongCard } from '@/app/components/info-cards/song-card';
import PlainTooltip from '@/app/components/tooltips/plain-tooltip';
import OutlinedIcon from '@/app/components/icons/outlined-icon';
import { useQuery } from '@tanstack/react-query';
import fetchPlaylists from '@/app/api-fetch/fetch-playlists';
import PlaylistSelector from '@/app/components/playlist-selector';
import DialogFrame from '@/app/components/dialogs/dialog-frame';
import { CardProps } from '@/app/model/card-props';

const AlbumSongCard = ({ song }: { song: AlbumSong['song'] }) => {
  const [cardProps, setCardProps] = useState<CardProps>({
    title: song.title || '',
    subtitle: song.artists?.map(a => a.name).join(', ') || '',
    img: {
      src: song.thumbnailurl || '/assets/placeholder.jpg',
      alt: song.title || '',
      width: 200,
    },
    href: `/song/${song.id}`,
    type: 'song',
    songID: song.id,
    artists: song.artists?.map(a => ({ id: '', name: a.name })) || [],
    duration: NaN,
    isMultipleItemSub: false
  });

  useEffect(() => {
    const fetchSongDetails = async () => {
      console.log(song.id)
      const fullSongData = await fetchSongById(song.id);
      console.log(fullSongData)
      setCardProps({
        title: fullSongData?.title || song.title || '',
        subtitle: fullSongData?.artists?.map(a => a.name).join(', ') || song.artists?.map(a => a.name).join(', ') || '',
        img: {
          src: fullSongData?.thumbnailurl || song.thumbnailurl || '/assets/placeholder.jpg',
          alt: fullSongData?.title || song.title || '',
          width: 200,
        },
        href: `/song/${song.id}`,
        type: 'song',
        songID: song.id,
        artists: fullSongData?.artists?.map(a => ({ id: a.id, name: a.name })) || song.artists?.map(a => ({ id: '', name: a.name })) || [],
        duration: fullSongData?.duration || NaN,
        isMultipleItemSub: fullSongData?.artists?.length > 1
      });
    };

    fetchSongDetails();
  }, [song]);

  return <SongCard {...cardProps} />;
};

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

const mapSongToCard = async (songData: AlbumSong['song']) => {
  try {
    const fullSongData = await fetchSongById(songData.id);
    return {
      id: songData.id,
      title: fullSongData?.title || songData?.title || '',
      subtitle: fullSongData?.artists?.map(a => a.name).join(', ') || 
                songData?.artists?.map(a => a.name).join(', ') || '',
      img: {
        src: fullSongData?.thumbnailurl || songData?.thumbnailurl || '',
        alt: fullSongData?.title || songData?.title || '',
        width: 200,
        height: 200
      },
      href: `/song/${songData?.id}`,
    };
  } catch (error) {
    console.error('Error fetching song data:', error);
    return {
      id: songData.id,
      title: songData?.title || '',
      subtitle: songData?.artists?.map(a => a.name).join(', ') || '',
      img: {
        src: songData?.thumbnailurl || '/assets/placeholder.jpg',
        alt: songData?.title || '',
        width: 200,
        height: 200
      },
      href: `/song/${songData?.id}`,
    };
  }
};

export default function SongContent(params: { id: string; initialData: SongDetails | null }) {
  const [song, setSong] = useState<SongDetails | undefined>(params.initialData || undefined);
  const [albums, setAlbums] = useState<AlbumDetails[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [shareTooltip, setShareTooltip] = useState("Chia sẻ");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const {
    playSong,
    pauseSong,
    resumeSong,
    isPlaying,
    currentSong,
    progress,
    seekTo,
    isLoading,
    clearQueue,
    toggleQueue,
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
  const isPlayingOtherSong = currentSong?.id !== song?.id;
  const isThisSongButPaused = currentSong?.id === song?.id && !isPlaying;
  const handlePlayClick = async () => {
    if (song) {
      console.log(`isPlaybackDisabled: ${isPlaybackDisabled}`);
      console.log(`isPlayingOtherSong: ${isPlayingOtherSong}`);
      console.log(`isThisSongButPaused: ${isThisSongButPaused}`);
      if (isPlaybackDisabled || isPlayingOtherSong) {
        clearQueue();
        playSong(mapSongToPlayable(song));
      } else if (isThisSongButPaused) {
        resumeSong() // Resume the song
      } else {
        pauseSong();
      }
    }
  }

  const handleShare = () => {
    if (song && window.location) {
      navigator.clipboard.writeText(window.location.href);
      setShareTooltip("Đã sao chép link");
      // Reset tooltip after 2 seconds
      setTimeout(() => {
        setShareTooltip("Chia sẻ");
      }, 1000);
    }
  };

  const handleAddToPlaylist = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    // Optionally show a success toast or notification here
  };

  if (error) {
    return <ErrorComponent onReloadClick={fetchSongData} />;
  }

  try {
    return (
      <div className='flex flex-col w-full gap-8 p-4'>
        {/* Hero Section */}
        <div className="flex flex-col gap-6 w-full">
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
                <PlainTooltip content={isPlaying && currentSong?.id === song?.id ? 'Dừng' : 'Phát'}>
                  <PlayButton
                    className="bg-[--md-sys-color-primary] text-[--md-sys-color-on-primary] w-12 h-12"
                    onClick={handlePlayClick}
                    isPlaying={isPlaying && currentSong?.id === song?.id}
                    songId={song?.id}
                  />
                </PlainTooltip>
                <PlainTooltip content={shareTooltip}>
                  <IconSmallButton
                    onClick={handleShare}
                    onMouseLeave={() => setShareTooltip("Chia sẻ")}
                  >
                    {/* <span className="material-symbols-outlined">share</span> */}
                    <OutlinedIcon icon={"share"} />
                  </IconSmallButton>
                </PlainTooltip>
                <PlainTooltip content="Thích">
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
                </PlainTooltip>
                <PlainTooltip content="Add to Playlist">
                  <IconSmallButton onClick={handleAddToPlaylist}>
                    <OutlinedIcon icon="playlist_add" />
                  </IconSmallButton>
                </PlainTooltip>
                <PlainTooltip content="Khác">
                  <IconSmallButton>
                    <span className="material-symbols-outlined">more_vert</span>
                  </IconSmallButton>
                </PlainTooltip>
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

        <div className="flex flex-col w-full overflow-hidden">
          {
            albums.map((album, index) => (
              index === 0 && <div key={album?.id} className="flex flex-col gap-3 w-full">
                <p className="text-lg">Các bài hát cùng album <Link href={`/album/${album?.id}`} className="font-bold underline hover:underline hover:text-[--md-sys-color-primary]">{album?.title}</Link></p>
                <div className="card-scroll grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-4">
                  {
                    album?.songs?.map(song => (
                      <AlbumSongCard key={song?.song?.id} song={song?.song} />
                    ))
                  }
                </div>
              </div>
            ))
          }
        </div>
        {isModalOpen && <DialogFrame onClose={handleModalClose}>
            <PlaylistSelector songId={song?.id} onClose={handleModalClose} />
        </DialogFrame>}
      </div>
    );
  } catch (e) {
    console.error(e);
    return <ErrorComponent onReloadClick={fetchSongData} />;
  }
}