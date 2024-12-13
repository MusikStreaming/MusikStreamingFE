'use client'

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useMedia } from '@/app/contexts/media-context';

import { CardProps } from '@/app/model/card-props';
import TextButton from '../buttons/text-button';
import Skeleton from '../loading/skeleton';
import getSong from '@/app/api-fetch/get-song';
import fetchAlbumById from '@/app/api-fetch/album-by-id';
import { hasCookie } from 'cookies-next';
import { redirectToLogin } from '@/app/services/auth.service';

export default function GeneralCard({
  img,
  title,
  subtitle,
  href,
  subHref = href,
  isMultipleItemSub = false,
  subHrefItems,
  subItems,
  songID = undefined,
  duration = undefined,
  artists = undefined,
  type,
  onClick
}: CardProps) {
  const router = useRouter();
  const { currentSong, isPlaying } = useMedia();
  
  router.prefetch(href);
  if (!isMultipleItemSub && subHrefItems) {
    subHref = subHrefItems[0];
  }

  return (
    <div 
      className="vertical-card song-card rounded-lg bg-[--md-sys-color-outline-variant] flex flex-col items-center justify-start overflow-hidden w-full max-w-[280px] sm:max-w-[200px] h-full" 
      onClick={() => router.push(href)}
    >
      <div className="cover-img relative w-full aspect-square overflow-hidden bg-[--md-sys-color-surface-container]">
        <div className="w-full h-full group">
          {img.src ? (
            <>
              <Image
                className="rounded-t-lg object-cover w-full h-full transition-transform duration-300 group-hover:scale-125 group-hover:brightness-50"
                src={img.src}
                alt={title}
                fill={true}
                sizes="(max-width: 640px) 280px, 200px"
                priority={true}
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </>
          ) : (
            <Skeleton className="w-full h-full rounded-t-lg rounded-b-none" />
          )}
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-12 h-12 bg-[--md-sys-color-primary] rounded-full overflow-hidden">
              <TextButton 
                className="w-full h-full flex items-center justify-center bg-[--md-sys-color-primary] text-[--md-sys-color-on-primary]" 
                onClick={async (e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  if (onClick) onClick();
                }}
              >
                <span className="material-symbols-outlined-filled">{songID && songID === currentSong?.id ? (isPlaying ? 'pause' : 'play_arrow') : 'play_arrow'}</span>
              </TextButton>
            </div>
          </div>
        </div>
      </div>
      <div className="px-2 w-full py-3 flex flex-col justify-between min-h-[4rem]">
        <div className="title mb-1">
          <Link href={href} className="line-clamp-1 text-md font-medium text-left hover:underline">
            {title}
          </Link>
        </div>
        <div className="subtitle line-clamp-2 flex flex-wrap">
          {
            (isMultipleItemSub && subItems) ? (
              <div className="block">
                {subItems.map((item, index) => (
                  <Link key={index} onClick={(e) => e.stopPropagation()} href={subHrefItems?.[index] || '#'} className="line-clamp-2 text-sm text-left hover:underline inline mr-1">{item}{index === subItems.length - 1 ? '' : ','}</Link>
                ))}
              </div>
            ) : (
              <Link href={subHref} onClick={(e) => e.stopPropagation()} className="line-clamp-2 text-sm text-left hover:underline">{subtitle}</Link>
            )
          }
        </div>
      </div>
    </div>
  );
}

// export function ArtistCard(props: CardProps) {
//   const { playArtist } = useMedia();

//   const handlePlayClick = async () => {
//     if (!hasCookie('session')) {
//       redirectToLogin(window.location.pathname);
//       return;
//     }

//     const artistSongs = await fetchArtistSongs(props.songID || '');

//     playArtist(artistSongs);
//   };

//   return <GeneralCard {...props} onClick={handlePlayClick} />;
// }