'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCookie } from 'cookies-next';
import PaginationTable from '@/app/components/tables/PaginationTable';
import AddAlbum from '@/app/components/dialogs/add-album';
// import EditAlbumDialog from '@/app/components/dialogs/EditAlbumDialog';
import TextButton from '@/app/components/buttons/text-button';
import IconSmallButton from '@/app/components/buttons/icon-small-button';
import OutlinedIcon from '@/app/components/icons/outlined-icon';

interface Album {
  id: string;
  title: string;
  artist: string;
  releaseDate: string;
}

interface AlbumsResponse {
  data: Album[];
  total: number;
}

export default function AlbumsTable() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: albums, isLoading, isError, refetch } = useQuery<AlbumsResponse>({
    queryKey: ['albums', page, limit],
    queryFn: async () => {
      const token = getCookie('session_token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/collection/albums?page=${page}&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'cache-control': 'no-cache',
            'cross-origin-resource-policy': 'cross-origin',
            'access-control-allow-origin': '*'
          }
        }
      );
      if (!response.ok) throw new Error('Failed to fetch albums');
      return response.json();
    },
    staleTime: 2000,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = getCookie('session_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/collection/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      if (!response.ok) throw new Error('Failed to delete album');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['albums'] });
      refetch();
    },
  });

  const addMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const token = getCookie('session_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/collection/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: data
      });
      if (!response.ok) throw new Error('Failed to add album');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['albums'] });
      refetch();
    },
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this album?')) return;
    deleteMutation.mutate(id);
  };

  const handleRowClick = (album: Album) => {
    setSelectedAlbum(album);
  };

  const handleCloseModal = () => {
    setSelectedAlbum(null);
    setIsAddModalOpen(false);
  };

  const handleSuccess = () => {
    refetch();
  };

  return (
    <div className="flex flex-col">
      <div className="mb-4 flex justify-between items-center">
        <input
          type="text"
          placeholder='Search albums...'
          className='p-2 rounded-md bg-[--md-sys-color-surface-container-highest] text-[--md-sys-color-on-surface]'
        />
        <div className='flex gap-2'>
          <TextButton
            className='bg-[--md-sys-color-surface-container-high] rounded-md'
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['albums', page, limit] })
              console.log("refresh")
              refetch()
            }}>
            Refresh
          </TextButton>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-[--md-sys-color-primary] text-[--md-sys-color-on-primary] rounded-md"
          >
            Add Album
          </button>
        </div>
      </div>
      <PaginationTable
        data={albums?.data || []}
        columns={[
          { header: 'Title', accessor: 'title' },
          { header: 'Artist', accessor: 'artist' },
          { header: 'Release Date', accessor: 'releaseDate' }
        ]}
        isLoading={isLoading || deleteMutation.isPending}
        isError={isError}
        errorMessage="Failed to load albums."
        totalPages={albums?.total ? Math.ceil(albums.total / limit) : undefined}
        page={page}
        onPageChange={setPage}
        rowActions={(album: Album) => (
          <div className="flex gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); handleRowClick(album); }}
              className="text-[--md-sys-color-primary]"
              aria-label='Edit album'
            >
              <OutlinedIcon icon="edit" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleDelete(album.id); }}
              className="text-[--md-sys-color-error]"
              aria-label='Delete album'
            >
              <OutlinedIcon icon="delete" />
            </button>
          </div>
        )}
        onRowClick={handleRowClick}
        showPageInput={true}
      />

      {/* <AddAlbumDialog
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
      /> */}
      {isAddModalOpen &&
        <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 h-full'>
          <div className='bg-[--md-sys-color-surface-container] p-4 rounded-md w-full max-w-md h-3/4 max-h-dvh overflow-auto flex flex-col items-end'>
            <IconSmallButton onClick={() => setIsAddModalOpen(false)}>
              <OutlinedIcon icon='close' />
            </IconSmallButton>
            <AddAlbum />
          </div>
        </div>}

      {/* {selectedAlbum && (
        <EditAlbumDialog
          isOpen={true}
          onClose={handleCloseModal}
          onSuccess={handleSuccess}
          album={selectedAlbum}
        />
      )} */}
    </div>
  );
}
