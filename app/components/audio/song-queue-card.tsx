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
    <div className={twMerge(
      "flex items-center gap-2 p-2 rounded-lg hover:bg-[--md-sys-color-surface-variant]",
      isPlaying && "bg-[--md-sys-color-surface-variant]"
    )}>
      <Image
        src={song.coverImage || '/assets/placeholder.jpg'}
        alt={song.title}
        width={48}
        height={48}
        className="rounded-md"
      />
      <div className="flex-grow min-w-0">
        <p className="font-medium truncate">{song.title}</p>
        <p className="text-sm text-[--md-sys-color-outline] truncate">
          {song.artists?.map(a => a.artist.name).join(', ')}
        </p>
      </div>
      {onRemove && (
        <button 
          onClick={onRemove}
          className="p-2 hover:bg-[--md-sys-color-surface] rounded-full"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      )}
    </div>
  );
} 