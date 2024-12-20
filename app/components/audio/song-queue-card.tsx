import { Song } from '@/app/model/song';
import Image from 'next/image';
import { twMerge } from 'tailwind-merge';

interface SongQueueCardProps {
  song: Song;
  isPlaying?: boolean;
  onRemove?: () => void;
}

export default function SongQueueCard({ song, isPlaying, onRemove }: SongQueueCardProps) {
  return (
    <div 
      className={twMerge(
        "flex items-center gap-2 p-2 rounded-lg transition-colors",
        "hover:bg-[--md-sys-color-surface-variant]",
        isPlaying && "bg-[--md-sys-color-surface-variant]"
      )}
    >
      <div className="flex-none relative w-12 h-12">
        <Image
          src={song.thumbnailurl || '/assets/placeholder.jpg'}
          alt=""
          fill
          className="rounded-md object-cover"
        />
      </div>
      <div className="flex-grow min-w-0">
        <p className="font-medium truncate">{song.title}</p>
        <p className="text-sm text-[--md-sys-color-outline] truncate">
          {song.artists?.map(a => a.artist.name).join(', ')}
        </p>
      </div>
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className={twMerge(
            "flex items-center justify-center p-2 rounded-full transition-colors",
            "hover:bg-[--md-sys-color-surface] active:bg-[--md-sys-color-surface-variant]"
          )}
          aria-label="Remove from queue"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      )}
    </div>
  );
}