'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCookie } from 'cookies-next';
import { formatDuration } from '@/app/utils/time';
// import { Song } from '@/app/model/song';
import PaginationTable from '@/app/components/tables/PaginationTable';
import AddSongDialog from '@/app/components/dialogs/AddSongDialog';
import EditSongDialog from '@/app/components/dialogs/EditSongDialog';
import TextButton from '@/app/components/buttons/text-button';
import OutlinedIcon from "@/app/components/icons/outlined-icon";
import { useDebounce } from '@/app/hooks/useDebounce';

interface Song {
  id: string;
  title: string;
  duration: number | null;
  thumbnailurl: string;
  artists: { id: string; name: string }[];
  releasedate?: string;
  genre?: string;
  views?: number;
  url?: string;
}

interface SongsResponse {
  count: number;
  data: Song[];
}

interface SearchResponse {
  data: {
    songs: Song[];
  }
}

interface SongDialogData {
  id?: string;
  title: string;
  artists: string[];
  releasedate?: string | null;
  genre: string;
  duration?: number | null;
  thumbnailUrl?: File | null;
  file?: File | null;
}

// Transform functions to convert between Song and SongData

export default function SongsTable() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const debouncedSearch = useDebounce(search, 200);

  const { data: songs, isLoading, isError, refetch } = useQuery<SongsResponse>({
    queryKey: ['songs', page, limit, search],
    queryFn: async () => {
      const token = getCookie('session_token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/song?page=${page}&limit=${limit}${search ? `&search=${search}` : ''}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'cache-control': 'no-cache'
          }
        }
      );
      if (!response.ok) throw new Error('Failed to fetch songs');
      return response.json();
    },
  });

  const { data: searchResults } = useQuery<SearchResponse>({
    queryKey: ['songsSearch', debouncedSearch],
    queryFn: async () => {
      if (!debouncedSearch) return { data: { songs: [] } };
      const token = getCookie('session_token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/search/${debouncedSearch}/songs`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );
      if (!response.ok) throw new Error('Failed to search songs');
      const data = await response.json() as SearchResponse;
      console.log(data);
      return data;
    },
    enabled: !!debouncedSearch,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = getCookie('session_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/song/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'cache-control': 'no-cache'
        }
      });
      if (!response.ok) throw new Error('Failed to delete song');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
    }
  });

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this song?')) return;
    
    // Disable the delete button while mutation is in progress
    if (deleteMutation.isPending) return;
    
    // Show optimistic updates or loading state
    deleteMutation.mutate(id, {
      onError: (error) => {
        // Optionally show error toast/message
        console.error('Failed to delete song:', error);
      }
    });
  };

  const handleRowClick = (song: Song) => {
    setSelectedSong(song);
  };

  const handleCloseModal = () => {
    setSelectedSong(null);
    setIsAddModalOpen(false);
  };

  const handleSuccess = () => {
    refetch();
  };

  // if (isLoading) return <div>Loading songs...</div>;
  // if (isError) return <div>Failed to load songs.</div>;
  // if (!songs?.data) return <div>No songs found.</div>;

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <input
          type="text"
          placeholder="Search songs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 rounded-md bg-[--md-sys-color-surface-container-highest] text-[--md-sys-color-on-surface]"
        />
        <div className='flex gap-2'>
          <TextButton 
          className='bg-[--md-sys-color-surface-container-high] rounded-md'
          onClick={() => {
            queryClient.invalidateQueries({ queryKey: ['songs'] })
            refetch()
            }}>
            Refresh
          </TextButton>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-[--md-sys-color-primary] text-[--md-sys-color-on-primary] rounded-md"
          >
            Add Song
          </button>
        </div>
      </div>

      <PaginationTable
        data={debouncedSearch ? searchResults?.data?.songs || [] : songs?.data || []}
        columns={[
          {header: 'ID', accessor: 'id'},
          { header: 'Title', accessor: 'title' },
          
          {
            header: 'Artist',
            accessor: (song: Song) => song.artists.map(a => a.name).join(', ')
          },
          {
            header: 'Duration',
            accessor: (song: Song) => formatDuration(song.duration || 0, true)
          },
          {
            header: 'Genre',
            accessor: 'genre'
          },
          {
            header: 'Release Date',
            accessor: (song: Song) => song.releasedate || 'N/A'
          }
        ]}
        page={debouncedSearch ? 1 : page}
        onPageChange={setPage}
        rowActions={(song: Song) => (
          <div className="flex gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); handleRowClick(song); }}
              className="text-[--md-sys-color-primary]"
              aria-label='Edit song'
            >
              <OutlinedIcon icon="edit" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleDelete(song.id); }}
              className="text-[--md-sys-color-error]"
              aria-label='Delete song'
            >
              <OutlinedIcon icon="delete" />
            </button>
          </div>
        )}
        onRowClick={handleRowClick}
        showPageInput={!debouncedSearch}
        isLoading={isLoading || deleteMutation.isPending}
        isError={isError}
        errorMessage="Failed to load songs."
        totalPages={debouncedSearch ? undefined : (songs?.count ? Math.ceil(songs.count / limit) : undefined)}
      />

      <AddSongDialog
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
      />

      {selectedSong && (
        <EditSongDialog
          isOpen={true}
          onClose={handleCloseModal}
          onSuccess={handleSuccess}
          song={{
            id: selectedSong.id,
            title: selectedSong.title,
            artists: selectedSong.artists.map(a => ({ artist: { id: a.id, name: a.name } })),
            releasedate: selectedSong.releasedate,
            genre: selectedSong.genre,
            duration: selectedSong.duration,
            thumbnailurl: selectedSong.thumbnailurl,
          }}
        />
      )}
    </div>
  );
}
