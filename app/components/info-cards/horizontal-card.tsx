'use client'

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useMedia } from '@/app/contexts/media-context';

import { CardProps } from '@/app/model/card-props';
import TextButton from '../buttons/text-button';
import Skeleton from '../loading/skeleton';
import { useQuery } from '@tanstack/react-query';
import fetchSongById from '@/app/api-fetch/song-by-id';
import PlayButton from '../buttons/play-button-main';

export default function HorizontalCard({
  img,
  title,
  href,
  songID = undefined,
}: CardProps) {
  const router = useRouter();
  const { currentSong, isPlaying, playSong, pauseSong, resumeSong } = useMedia();
  
  router.prefetch(href);

  const { data: songData } = useQuery({
    queryKey: ["song", songID],
    queryFn: () => {
      if (!songID) throw new Error('Song ID is required');
      return fetchSongById(songID);
    },
    enabled: !!songID
  });

  return (
    <div 
      className="horizontal-card song-card flex items-center gap-3 bg-[--md-sys-color-surface-variant] rounded-lg cursor-pointer" 
      onClick={() => router.push(href)}
    >
      <div className="image-frame flex justify-start relative w-24 h-24 overflow-hidden bg-[--md-sys-color-surface-container]">
        {img.src ? (
          <>
            <Image
              className="rounded-l-lg object-cover w-full h-full transition-transform duration-300 group-hover:scale-125 group-hover:brightness-50"
              src={img.src}
              alt={title}
              fill={true}
              sizes="96px"
              priority={true}
            />
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </>
        ) : (
          <Skeleton className="w-full h-full rounded-l-lg" />
        )}
      </div>
      <div className="title text-ellipsis line-clamp-1 w-full">
        <Link href={href} className="text-left hover:underline">
          {title}
        </Link>
      </div>
      <div className="play-button-container">
        <div className="play-button w-12 h-12 bg-[--md-sys-color-primary] rounded-full overflow-hidden">
          <PlayButton className='w-12 h-12 bg-[--md-sys-color-primary] text-[--md-sys-color-on-primary]' songId={songData?.id} onClick={
            (e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation();
              if (songData?.id === currentSong?.id) {
                if (isPlaying) {
                  pauseSong();
                } else {
                  resumeSong();
                }
              } else if (songData) {
                playSong({
                  ...songData,
                  thumbnailurl: songData.thumbnailurl || '',
                  artists: songData.artists.map(a => ({ artist: { id: a.id, name: a.name } }))
                });
              }
            }
          } isPlaying={isPlaying}/>
        </div>
      </div>
    </div>
  );
}