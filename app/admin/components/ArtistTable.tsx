'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCookie } from 'cookies-next';
import { useState } from 'react';
import PaginationTable from '@/app/components/tables/PaginationTable';
import TextButton from '@/app/components/buttons/text-button';
import { Artist } from '@/app/model/artist';
import OutlinedIcon from "@/app/components/icons/outlined-icon";
import AddArtistDialog from '@/app/components/dialogs/add-artist-dialog';
import EditArtistDialog from '@/app/components/dialogs/edit-artist-dialog';
import { useDebounce } from '@/app/hooks/useDebounce';

// interface Artist {
//   id: string;
//   name: string;
//   genre: string;
// }

interface ArtistsResponse {
  data: Artist[];
  count: number;
}

interface SearchResponse {
  data: {
    artists: Artist[];
  }
}

export default function ArtistTable() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 200);

  const { data: artists, isLoading, isError, refetch } = useQuery<ArtistsResponse>({
    queryKey: ['artists', page, limit],
    queryFn: async () => {
      const token = getCookie('session_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/artist?page=${page}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      if (!response.ok) throw new Error('Failed to fetch artists');
      return response.json();
    },
    staleTime: 2000,
  });

  const { data: searchResults } = useQuery<SearchResponse>({
    queryKey: ['artistsSearch', debouncedSearch],
    queryFn: async () => {
      if (!debouncedSearch) return { data: { artists: [] } };
      const token = getCookie('session_token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/search/${debouncedSearch}/artists`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );
      if (!response.ok) throw new Error('Failed to search artists');
      const data = await response.json() as SearchResponse;
      return data;
    },
    enabled: !!debouncedSearch,
  });

  const editMutation = useMutation({
    mutationFn: async (artist: Artist) => {
      const token = getCookie('session_token');
      const response = await fetch(`/api/artist/${artist.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(artist)
      });
      if (!response.ok) throw new Error('Failed to update artist');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artists'] });
      handleCloseModal();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = getCookie('session_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/artist/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      if (!response.ok) throw new Error('Failed to delete artist');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artists'] });
      refetch();
    }
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this artist?')) return;
    deleteMutation.mutate(id);
  };

  const handleRowClick = (artist: Artist) => {
    setSelectedArtist(artist);
  };

  const handleCloseModal = () => {
    setSelectedArtist(null);
    setIsAddModalOpen(false);
  };

  const handleSuccess = () => {
    refetch();
  };

  const artistList = searchResults?.data?.artists || artists?.data || [];
  const totalPages = artists?.count ? Math.ceil(artists.count / limit) : undefined;

  return (
    <div className=''>
      <div className="mb-4 flex justify-between items-center">
        <div className="flex justify-between w-full">
        <input
          type="text"
          placeholder="Search artists..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 rounded-md bg-[--md-sys-color-surface-container-highest] text-[--md-sys-color-on-surface]"
        />
          <div className='flex gap-2'>
            <TextButton
              className='bg-[--md-sys-color-surface-container-high] rounded-md'
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ['artists'] })
                refetch()
              }}>
              Refresh
            </TextButton>
            <TextButton
              onClick={() => setIsAddModalOpen(true)}
              className="bg-[--md-sys-color-primary] text-[--md-sys-color-on-primary] rounded-md"
            >
              Add Artist
            </TextButton>
          </div>
        </div>
      </div>
      <PaginationTable
        data={artistList}
        columns={[
          { 
            header: 'ID', 
            accessor: 'id',
            enableSorting: true,
            enableFiltering: true
          },
          { 
            header: 'Name', 
            accessor: 'name',
            enableSorting: true,
            enableFiltering: true
          },
          { 
            header: 'Avatar URL', 
            accessor: 'avatarurl',
            enableSorting: true,
            enableFiltering: true
          },
        ]}
        page={page}
        onPageChange={setPage}
        showPageInput={true}
        isLoading={isLoading || deleteMutation.isPending}
        isError={isError}
        errorMessage="Failed to load artists."
        totalPages={totalPages}
        enableSelection={true}
        onSelectionChange={(selectedArtists) => {
          console.log('Selected artists:', selectedArtists);
        }}
        rowActions={(artist: Artist) => (
          <div className="flex gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); handleRowClick(artist); }}
              className="text-[--md-sys-color-primary]"
              aria-label='Edit artist'
            >
              <OutlinedIcon icon="edit" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleDelete(artist.id); }}
              className="text-[--md-sys-color-error]"
              aria-label='Delete artist'
            >
              <OutlinedIcon icon="delete" />
            </button>
          </div>
        )}
        onRowClick={handleRowClick}
      />

      <AddArtistDialog
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
      />

      {selectedArtist && (
        <EditArtistDialog
          isOpen={true}
          onClose={handleCloseModal}
          onSuccess={handleSuccess}
          artist={selectedArtist}
        />
      )}
    </div>
  );
}