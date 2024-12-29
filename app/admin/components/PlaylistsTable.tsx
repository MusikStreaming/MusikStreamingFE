'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCookie } from 'cookies-next';
import PaginationTable from '@/app/components/tables/PaginationTable';
// import AddPlaylistDialog from '@/app/components/dialogs/AddPlaylistDialog';
// import EditPlaylistDialog from '@/app/components/dialogs/EditPlaylistDialog';
import TextButton from '@/app/components/buttons/text-button';
import OutlinedIcon from "@/app/components/icons/outlined-icon";

interface Playlist {
  id: string;
  title: string;
  type: string;
  owner: {
    id: string;
    username: string;
  };
  thumbnailurl: string;
}

interface PlaylistsResponse {
  data: Playlist[];
  total: number;
}

export default function PlaylistsTable() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: playlists, isLoading, isError, refetch } = useQuery<PlaylistsResponse>({
    queryKey: ['playlists', page, limit],
    queryFn: async () => {
      const token = getCookie('session_token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/collection?page=${page}&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );
      if (!response.ok) throw new Error('Failed to fetch playlists');
      return response.json();
    }
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

  if (!playlists?.data) return <div>No playlists available.</div>;

  return (
    <div className="overflow-x-auto">
      <div className="mb-4 flex justify-between items-center">
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
        data={playlists?.data || []}
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

      {/* <AddPlaylistDialog
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
      />

      {selectedPlaylist && (
        <EditPlaylistDialog
          isOpen={true}
          onClose={handleCloseModal}
          onSuccess={handleSuccess}
          playlist={selectedPlaylist}
        />
      )} */}
    </div>
  );
}
