'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCookie } from 'cookies-next';
import PaginationTable from '@/app/components/tables/PaginationTable';
import AddPlaylistDialog from '@/app/components/dialogs/AddPlaylistDialog';
import EditPlaylistDialog from '@/app/components/dialogs/EditPlaylistDialog';
import TextButton from '@/app/components/buttons/text-button';
import OutlinedIcon from "@/app/components/icons/outlined-icon";
import type {Playlist, PlaylistsResponse} from '@/app/model/playlist';
import ErrorComponent from '@/app/components/api-fetch-container/fetch-error';
import { useDebounce } from '@/app/hooks/useDebounce';

interface SearchResponse {
  data: {
    playlists: Playlist[];
  }
}

export default function PlaylistsTable() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState(''); // Add search state
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const debouncedSearch = useDebounce(search, 200);

  const { data: playlists, isLoading, isError, refetch } = useQuery<PlaylistsResponse>({
    queryKey: ['playlists', page, limit, search], // Add search to query key
    queryFn: async () => {
      const token = getCookie('session_token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/collection?page=${page}&limit=${limit}${search ? `&search=${search}` : ''}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'cache-control': 'no-cache',
          }
        }
      );
      if (!response.ok) throw new Error('Failed to fetch playlists');
      return response.json();
    }
  });

  const { data: searchResults } = useQuery<SearchResponse>({
    queryKey: ['playlistsSearch', debouncedSearch],
    queryFn: async () => {
      if (!debouncedSearch) return { data: { playlists: [] } };
      const token = getCookie('session_token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/search/${debouncedSearch}/playlists`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );
      if (!response.ok) throw new Error('Failed to search playlists');
      const data = await response.json() as SearchResponse;
      return data;
    },
    enabled: !!debouncedSearch,
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
      if (!response.ok) throw new Error('Failed to delete playlist');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      refetch();
    }
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this playlist?')) return;
    deleteMutation.mutate(id);
  };

  const handleRowClick = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
  };

  const handleCloseModal = () => {
    setSelectedPlaylist(null);
    setIsAddModalOpen(false);
  };

  const handleSuccess = () => {
    refetch();
  };

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <input
          type="text"
          placeholder="Search playlists..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 rounded-md bg-[--md-sys-color-surface-container-highest] text-[--md-sys-color-on-surface]"
        />
        <div className='flex gap-2'>
          <TextButton 
            className='bg-[--md-sys-color-surface-container-high] rounded-md'
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['playlists'] })
              refetch()
            }}>
            Refresh
          </TextButton>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-[--md-sys-color-primary] text-[--md-sys-color-on-primary] rounded-md"
          >
            Add Playlist
          </button>
        </div>
      </div>

      <PaginationTable
        data={searchResults?.data?.playlists.filter((p) => p.type === "Playlist") || playlists?.data.filter((p) => p.type === "Playlist") || []}
        columns={[
          { header: 'Name', accessor: 'title' },
          { header: 'Owner', accessor: (playlist: Playlist) => playlist.owner.username },
          { header: 'Type', accessor: 'type' }
        ]}
        page={page}
        onPageChange={setPage}
        rowActions={(playlist: Playlist) => (
          <div className="flex gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); handleRowClick(playlist); }}
              className="text-[--md-sys-color-primary]"
              aria-label='Edit playlist'
            >
              <OutlinedIcon icon="edit" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleDelete(playlist.id); }}
              className="text-[--md-sys-color-error]"
              aria-label='Delete playlist'
            >
              <OutlinedIcon icon="delete" />
            </button>
          </div>
        )}
        onRowClick={handleRowClick}
        showPageInput={true}
        isLoading={isLoading || deleteMutation.isPending}
        isError={isError}
        errorMessage="Failed to load playlists."
        totalPages={playlists?.total ? Math.ceil(playlists.total / limit) : undefined}
      />

      {isAddModalOpen && <AddPlaylistDialog
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
      />
      }

      {selectedPlaylist && (
        <EditPlaylistDialog
          isOpen={true}
          onClose={handleCloseModal}
          onSuccess={handleSuccess}
          playlist={selectedPlaylist}
        />
      )}
    </div>
  );
}
