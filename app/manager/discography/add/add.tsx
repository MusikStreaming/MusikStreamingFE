'use client';

import { useSearchParams } from 'next/navigation';
import AddSong from './add-song';
import AddAlbum from '../../../components/dialogs/add-album';
import { Suspense } from 'react';

export default function AddDiscographyItem() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type');

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">
        {type === 'album' ? 'Add New Album' : 'Add New Song'}
      </h1>
      <Suspense>
        {type === 'album' ? (
          <AddAlbum />
        ) : (
          <AddSong />
        )}
      </Suspense>
    </div>
  );
} 