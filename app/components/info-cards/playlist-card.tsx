'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import OutlinedIcon from '../icons/outlined-icon';
import IconSmallButton from '../buttons/icon-small-button';
import type { Playlist } from '@/app/model/playlist';

interface PlaylistCardProps extends Playlist {
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function PlaylistCard({
  id,
  title,
  description,
  thumbnailurl,
  type,
  onEdit,
  onDelete
}: PlaylistCardProps) {
  const router = useRouter();

  return (
    <div 
      className="vertical-card rounded-lg bg-[--md-sys-color-outline-variant] flex flex-col items-center justify-start overflow-hidden w-full max-w-[280px] sm:max-w-[200px] h-full cursor-pointer" 
      onClick={() => router.push(`/playlists/${id}`)}
    >
      <div className="cover-img relative w-full aspect-square overflow-hidden bg-[--md-sys-color-surface-container]">
        <div className="w-full h-full group">
          <Image
            className="rounded-t-lg object-cover w-full h-full transition-transform duration-300 group-hover:scale-125 group-hover:brightness-50"
            src={thumbnailurl || '/assets/placeholder.jpg'}
            alt={title}
            fill={true}
            sizes="(max-width: 640px) 280px, 200px"
          />
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {onEdit && (
              <IconSmallButton
                onClick={(e: React.ChangeEvent) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="bg-[--md-sys-color-surface-container-highest] text-[--md-sys-color-on-surface]"
              >
                <OutlinedIcon icon="edit" />
              </IconSmallButton>
            )}
            {onDelete && (
              <IconSmallButton
                onClick={(e: React.ChangeEvent) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="bg-[--md-sys-color-surface-container-highest] text-[--md-sys-color-on-surface]"
              >
                <OutlinedIcon icon="delete" />
              </IconSmallButton>
            )}
          </div>
        </div>
      </div>
      <div className="px-2 w-full py-3 flex flex-col justify-between min-h-[4rem]">
        <div className="title mb-1">
          <Link href={`/playlists/${id}`} className="line-clamp-1 text-md font-medium text-[--md-sys-color-on-surface] text-left hover:underline">
            {title}
          </Link>
        </div>
        {description && (
          <div className="subtitle">
            <p className="line-clamp-2 text-sm text-[--md-sys-color-on-surface-variant] text-left">
              {description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
