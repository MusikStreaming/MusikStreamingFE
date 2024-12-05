'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import fetchAlbumById from '@/app/api-fetch/album-by-id';
import ErrorComponent from '@/app/components/api-fetch-container/fetch-error';
import { AlbumDetails } from '@/app/model/album-details';
import Skeleton from '@/app/components/loading/skeleton';
import PlayButton from '@/app/components/buttons/play-button-main';
import IconSmallButton from '@/app/components/buttons/icon-small-button';
import ArtistLinks from '@/app/components/info-links/artist-link';
import ToggleIconButton from '@/app/components/buttons/toggle-button';
import SongTable from '@/app/components/tables/song-table';
import { processCloudinaryUrl } from "@/app/api-fetch/cloudinary-url-processing";

function calculateAlbumDuration(songs: AlbumDetails["songs"]) {
  if (!songs) return 0;
  const totalDuration = songs.reduce((total, song) => total + (song.song?.duration || 0), 0);
  return totalDuration;
}

function countAlbumSongs(songs: AlbumDetails["songs"]) {
  if (!songs) return 0;
  return songs.length;
}

function formatDuration(duration: number) {
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = duration % 60;
  return `${hours > 0 ? `${hours}h ` : ''}${minutes > 0 ? `${minutes}min ` : ''}${seconds > 0 ? `${seconds}sec` : ''}`;
}

function formatSongCount(count: number) {
  return count > 1 ? `${count} songs` : `${count} song`;
}

export default function AlbumContent(params: { id: string }) {
  const [album, setAlbum] = useState<AlbumDetails | undefined>();
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const {id} = params;
      const albumData = await fetchAlbumById(id);
      console.log("Album data:", albumData);
      if (albumData) {
        setAlbum(albumData);
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
    fetchData();
  }, [fetchData, params.id]);

  if (error) {
    return <ErrorComponent onReloadClick={fetchData} />;
  }

  try {
    return (
      <div className='flex flex-col w-full gap-8 p-4'>
        {/* Hero Section */}
        <div className='flex flex-col md:flex-row items-center gap-6'>
          {album ? 
            <Image
              src={processCloudinaryUrl(album.thumbnailurl, 200, 200, "collections")}
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
              <PlayButton className="bg-[--md-sys-color-primary] text-[--md-sys-color-on-primary] w-12 h-12"/>
              <IconSmallButton>
                <span className="material-symbols-outlined">share</span>
              </IconSmallButton>
              <ToggleIconButton>
                favorite
              </ToggleIconButton>
              <IconSmallButton>
                <span className="material-symbols-outlined">more_vert</span>
              </IconSmallButton>
            </div>
          </div>
        </div>

        {
          album?.songs && album.songs.length > 0 &&
          <SongTable songs={album.songs} />
        }

        {/* Additional Info */}
        <div className="flex flex-col gap-3 w-full pt-6">
          {/* {album ?
            <p className="">Release Date: {processDatetime(album.releasedate)}</p> :
            <Skeleton className='h-4 w-48' />
          } */}
          {/* {album ?
            <p className="">Total Views: {album.views.toLocaleString()}</p> :
            <Skeleton className='h-4 w-32' />
          } */}
        </div>
      </div>
    );
  } catch (e) {
    console.error(e);
    return <ErrorComponent onReloadClick={fetchData} />;
  }
}