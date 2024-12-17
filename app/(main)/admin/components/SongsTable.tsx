'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCookie } from 'cookies-next';

interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
}

export default function SongsTable() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data: songs, isLoading } = useQuery<Song[]>({
    queryKey: ['songs', page, limit, search],
    queryFn: async () => {
      const token = getCookie('session_token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/songs?page=${page}&limit=${limit}&search=${search}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );
      if (!response.ok) throw new Error('Failed to fetch songs');
      return response.json();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = getCookie('session_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/songs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      if (!response.ok) throw new Error('Failed to delete song');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
    }
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this song?')) return;
    deleteMutation.mutate(id);
  };

  if (isLoading) return <div>Loading songs...</div>;

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search songs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border rounded-md"
        />
      </div>

      <table className="min-w-full divide-y divide-[--md-sys-color-outline]">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left">Title</th>
            <th className="px-6 py-3 text-left">Artist</th>
            <th className="px-6 py-3 text-left">Album</th>
            <th className="px-6 py-3 text-left">Duration</th>
            <th className="px-6 py-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {songs?.map((song) => (
            <tr key={song.id}>
              <td className="px-6 py-4">{song.title}</td>
              <td className="px-6 py-4">{song.artist}</td>
              <td className="px-6 py-4">{song.album}</td>
              <td className="px-6 py-4">{song.duration}</td>
              <td className="px-6 py-4">
                <button
                  onClick={() => handleDelete(song.id)}
                  className="text-[--md-sys-color-error]"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex justify-between">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-[--md-sys-color-surface-variant] rounded-md"
        >
          Previous
        </button>
        <button
          onClick={() => setPage(p => p + 1)}
          className="px-4 py-2 bg-[--md-sys-color-surface-variant] rounded-md"
        >
          Next
        </button>
      </div>
    </div>
  );
}
