// import { Artist } from '@/app/model/artist';
interface Artist {
  id: string;
  name: string;
  description?: string;
  avatarurl?: string;
  createdAt?: string;
  updatedAt?: string;
  country?: string;
  managerid?: string
}


interface ArtistChipProps {
  artist: Artist;
  onDeleteClick: (artist: Artist) => void;
}

export default function ArtistChip({ artist, onDeleteClick }: ArtistChipProps) {
  return (
    <div key={artist.id} className="flex items-center justify-center gap-2 bg-[--md-sys-color-surface-container] px-2 py-1 rounded-md">
      <span>{artist.name}</span>
      <button
        type="button"
        onClick={() => onDeleteClick(artist)}
        className="text-red-500 flex"
      >
        <span className='material-symbols-outlined'>close</span>
      </button>
    </div>
  );
}