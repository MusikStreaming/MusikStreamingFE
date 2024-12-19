'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCookie } from 'cookies-next';
import PaginationTable from '@/app/components/tables/PaginationTable';

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
  const queryClient = useQueryClient();

  const { data: playlists, isLoading } = useQuery<PlaylistsResponse>({
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/playlists/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      if (!response.ok) throw new Error('Failed to delete playlist');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
    }
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this playlist?')) return;
    deleteMutation.mutate(id);
  };

  if (!playlists?.data) return <div>No playlists available.</div>;

  return (
    <div className="overflow-x-auto">
      <PaginationTable
        data={playlists.data}
        columns={[
          { header: 'Name', accessor: 'title' },
          { header: 'Owner', accessor: (playlist: Playlist) => playlist.owner.username },
          { header: 'Type', accessor: 'type' }
        ]}
        page={page}
        onPageChange={setPage}
        rowActions={(playlist: Playlist) => (
          <button
            onClick={() => handleDelete(playlist.id)}
            className="text-[--md-sys-color-error]"
          >
            <span className='material-symbols-outlined'>delete</span>
          </button>
        )}
        showPageInput={true}
        isLoading={isLoading}
        totalPages={playlists ? Math.ceil(playlists.total / limit) : undefined}
      />
    </div>
  );
}
