'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCookie } from 'cookies-next';

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

  if (isLoading) return <div>Loading playlists...</div>;

  if (!playlists || !Array.isArray(playlists.data)) return <div>Failed to load playlists.</div>;

  const totalPages = Math.ceil(playlists.total / limit);

  console.log('playlists: ', playlists);

  return (
    <div className="overflow-x-auto">
      <div className="overflow-x-auto max-h-96 overflow-y-auto">
        <table className="min-w-full divide-y divide-[--md-sys-color-outline]">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Owner</th>
              {/* <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Songs</th> */}
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[--md-sys-color-outline]">
            {playlists.data.map((playlist) => (
              <tr key={playlist.id}>
                <td className="px-6 py-4 whitespace-nowrap">{playlist.title}</td>
                <td className="px-6 py-4 whitespace-nowrap">{playlist.owner.username}</td>
                {/* <td className="px-6 py-4 whitespace-nowrap">{playlist.songCount}</td> */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleDelete(playlist.id)}
                    className="text-[--md-sys-color-error]"
                  >
                    <span className='material-symbols-outlined'>Delete</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center mt-4">
        <button
          className="px-4 py-2 bg-gray-300 rounded"
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
        >
          Previous
        </button>
        <span>Page {page} of {totalPages}</span>
        <button
          className="px-4 py-2 bg-gray-300 rounded"
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}
