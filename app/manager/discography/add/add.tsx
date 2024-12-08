'use client';

import { useSearchParams } from 'next/navigation';
import AddSong from './add-song';
import AddAlbum from './add-album';

export default function AddDiscographyItem() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type');

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">
        {type === 'album' ? 'Add New Album' : 'Add New Song'}
      </h1>
      {type === 'album' ? (
        <AddAlbum />
      ) : (
        <AddSong />
      )}
    </div>
  );
} 