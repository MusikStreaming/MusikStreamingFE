'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCookie } from 'cookies-next';
import PaginationTable from '@/app/components/tables/PaginationTable';

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
  const queryClient = useQueryClient();

  const { data: albums, isLoading, isError } = useQuery<AlbumsResponse>({
    queryKey: ['albums', page, limit],
    queryFn: async () => {
      const token = getCookie('session_token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/collection/albums?page=${page}&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );
      if (!response.ok) throw new Error('Failed to fetch albums');
      return response.json();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = getCookie('session_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/collection/albums/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      if (!response.ok) throw new Error('Failed to delete album');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['albums'] });
    }
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this album?')) return;
    deleteMutation.mutate(id);
  };

  if (!albums || !Array.isArray(albums.data)) return <div>Failed to load albums.</div>;

  return (
    <div className="flex items-center">
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
          <button
            onClick={() => handleDelete(album.id)}
            className="text-[--md-sys-color-error]"
          >
            <span className='material-symbols-outlined'>delete</span>
          </button>
        )}
        showPageInput={true}
      />
    </div>
  );
}
