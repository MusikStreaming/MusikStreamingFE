// app/utils/album.ts
'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import fetchAlbumById from '@/app/api-fetch/album-by-id';
import ErrorComponent from '@/app/components/api-fetch-container/fetch-error';
import Skeleton from '@/app/components/loading/skeleton';
import PlayButton from '@/app/components/buttons/play-button-main';
import IconSmallButton from '@/app/components/buttons/icon-small-button';
import ArtistLinks from '@/app/components/info-links/artist-link';
import ToggleButtonFilled from '@/app/components/buttons/toggle-button';
import SongTable from '@/app/components/tables/song-table';
import { processCloudinaryUrl } from "@/app/api-fetch/cloudinary-url-processing";
import { useState, useCallback } from 'react';
import { calculateAlbumDuration, countAlbumSongs, formatSongCount } from '@/app/utils/album';
import { useMedia } from '@/app/contexts/media-context';
import TextButton from '@/app/components/buttons/text-button';
import PlaylistSelector from '@/app/components/playlist-selector';
import DialogFrame from '@/app/components/dialogs/dialog-frame';
import PlaylistForm from '../playlist/playlist-form';
import { getCookie } from 'cookies-next';

function formatDuration(duration: number) {
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = duration % 60;
  return `${hours > 0 ? `${hours}h ` : ''}${minutes > 0 ? `${minutes}min ` : ''}${seconds > 0 ? `${seconds}sec` : ''}`;
}

export default function PlaylistContent(params: { id: string }) {
  const { data: album, error, refetch } = useQuery({
    queryKey: ['album', params as { id: string }],
    queryFn: async () => {
      return fetchAlbumById(params.id);
    }
  });
  const { playList } = useMedia();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const isOwner = album?.profiles && album.profiles[0] === getCookie("user_id"); // Replace with actual user ID check

  const handleAddToPlaylist = useCallback((songId: string) => {
    if (!songId) {
      console.error('No song ID provided');
      return;
    }
    setSelectedSongId(songId);
    setIsModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setSelectedSongId(null);
  }, []);

  const handleEditSuccess = useCallback(() => {
    setIsEditing(false);
    refetch();
  }, [refetch]);

  if (isEditing && album) {
    return (
      <div className='w-full md:p-4'>
        <PlaylistForm
          id={params.id}
          initialData={{
            title: album.title,
            description: album.description ?? undefined,
            coverImage: album.thumbnailurl
          }}
          onSuccess={handleEditSuccess}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  if (error) {
    return <ErrorComponent onReloadClick={refetch} />;
  }

  return (
    <div className='flex flex-col w-full gap-8 md:p-4'>
      <TextButton className='flex md:hidden text-[--md-sys-color-primary]' onClick={() => router.back()}>
        <span className='material-symbols-outlined'>arrow_back</span>
        Quay lại
      </TextButton>
        {/* Hero Section */}
        <div className='flex flex-col md:flex-row items-center gap-6'>
          {album ? 
            <Image
              src={processCloudinaryUrl(album.thumbnailurl, 200, 200, "collections") || '/images/playlist-default.png'}
              alt={album.title}
              width={200}
              height={200}
              priority={true}
              className="rounded-lg shadow-lg object-cover"
            /> : 
            <Skeleton className="w-[200px] h-[200px] rounded-lg" />
          }
          <div className="flex flex-col gap-3 w-full">
            {
              album ? 
                <p className='font-medium text-md'>{album.type}</p> :
                <Skeleton className='h-4 w-16' />
            }
            {album ? 
              <h1 className='font-bold text-2xl md:text-3xl'>{album.title}</h1> : 
              <Skeleton className='h-8 w-full' />
            }
            {album &&
              <p className=''>{album.description}</p>
            }
            {
              album?.profiles && album.profiles.length > 0 &&
              <ArtistLinks artists={album.profiles.filter((p): p is { id: string; name: string; avatarurl: string } => 
                  !!p.id && !!p.name && !!p.avatarurl
              )} />
            }
            {
              album?.songs && album.songs.length > 0 &&
              <p className='text-sm'>{formatSongCount(countAlbumSongs(album.songs))} • {formatDuration(calculateAlbumDuration(album.songs))}</p>
            }
            <div className="mt-4 flex justify-start items-center gap-4">
              <PlayButton 
                className="bg-[--md-sys-color-primary] text-[--md-sys-color-on-primary] w-12 h-12"
                onClick={() => {
                  try {
                    if (!album?.songs?.length) {
                      throw new Error('No songs in album');
                    }
                    
                    const mappedSongs = album.songs.map(s => {
                      if (!s.song) {
                        throw new Error('Invalid song data');
                      }
                      return {
                        id: s.song.id,
                        title: s.song.title,
                        duration: s.song.duration || null,
                        thumbnailurl: s.song.thumbnailurl || '/assets/placeholder.jpg',
                        artists: s.song.artists?.map(a => ({ artist: { id: a.id || '#', name: a.name } })) || []
                      };
                    });
                    
                    playList(mappedSongs);
                  } catch (e) {
                    console.error('Error playing album:', e);
                  }
                }}
              />
              <IconSmallButton onClick={() => {
                navigator.clipboard.writeText(`${window.location.href}`);
              }}>
                <span className="material-symbols-outlined">share</span>
              </IconSmallButton>
              <ToggleButtonFilled>
                favorite
              </ToggleButtonFilled>
              {isOwner && (
                <IconSmallButton onClick={() => setIsEditing(true)}>
                  <span className="material-symbols-outlined">edit</span>
                </IconSmallButton>
              )}
              <IconSmallButton>
                <span className="material-symbols-outlined">more_vert</span>
              </IconSmallButton>
            </div>
          </div>
        </div>

        {
          album?.songs && album.songs.length > 0 &&
          <SongTable 
            songs={album.songs.map((song) => ({
              song: {
                id: song.song.id,
                title: song.song.title,
                duration: song.song.duration,
                views: song.song.views,
                thumbnailurl: song.song.thumbnailurl,
                artists: song.song.artists?.map(a => ({ name: a.name, id: a.id })) || []
              }
            }))}
            onAddToPlaylist={handleAddToPlaylist}
            showPlaylistOptions={!isOwner} // Changed to false when user is owner
          />
        }

        {isModalOpen && selectedSongId && (
          <DialogFrame onClose={handleModalClose}>
            <PlaylistSelector 
              songId={selectedSongId}
              currentPlaylistId={params.id}
              onClose={handleModalClose}
            />
          </DialogFrame>
        )}
          <div className="flex flex-col gap-3 w-full pt-6">
          </div>
    </div>
  );
}