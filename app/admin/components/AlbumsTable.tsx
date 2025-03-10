'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCookie } from 'cookies-next';
import PaginationTable from '@/app/components/tables/PaginationTable';
// import AddAlbum from '@/app/components/dialogs/add-album';
import AddAlbumDialog from '@/app/components/dialogs/add-album-dialog';
import EditAlbumDialog from '@/app/components/dialogs/EditAlbumDialog';
import TextButton from '@/app/components/buttons/text-button';
import IconSmallButton from '@/app/components/buttons/icon-small-button';
import OutlinedIcon from '@/app/components/icons/outlined-icon';
import { useDebounce } from '@/app/hooks/useDebounce';

interface Album {
  id: string;
  title: string;
  artist: string;
  releaseDate: string;
  thumbnailurl: string;
  type: string;
  visibility: string;
  // songs: { id: string; title: string }[];
}

interface AlbumsResponse {
  data: Album[];
  count: number;
}

interface SearchResponse {
  data: {
    albums: Album[];
  }
}

export default function AlbumsTable() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 200);
  const queryClient = useQueryClient();

  const { data: albums, isLoading, isError, refetch } = useQuery<AlbumsResponse>({
    queryKey: ['albums', page, limit],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/collection/albums?page=${page}&limit=${limit}`,
        {
          headers: {
            'cache-control': 'no-cache',
          }
        }
      );
      if (!response.ok) throw new Error('Failed to fetch albums');
      return response.json();
    },
    staleTime: 2000,
  });

  const { data: searchResults } = useQuery<SearchResponse>({
    queryKey: ['albumsSearch', debouncedSearch],
    queryFn: async () => {
      if (!debouncedSearch) return { data: { albums: [] } };
      const token = getCookie('session_token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/search/${debouncedSearch}/albums`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );
      if (!response.ok) throw new Error('Failed to search albums');
      const data = await response.json() as SearchResponse;
      return data;
    },
    enabled: !!debouncedSearch,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = getCookie('session_token');
      const response = await fetch(`/api/collection/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
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
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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
        data={searchResults?.data?.albums || albums?.data || []}
        columns={[
          { header: 'Title', accessor: 'title' },
        ]}
        isLoading={isLoading || deleteMutation.isPending}
        isError={isError}
        errorMessage="Failed to load albums."
        totalPages={albums?.count ? Math.ceil(albums.count / limit) : undefined}
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

      {isAddModalOpen &&
        <AddAlbumDialog onClose={handleCloseModal}/>}

      {selectedAlbum && (
        <EditAlbumDialog
          isOpen={true}
          onClose={handleCloseModal}
          onSuccess={handleSuccess}
          album={selectedAlbum}
        />
      )}
    </div>
  );
}
