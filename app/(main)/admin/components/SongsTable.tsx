'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCookie } from 'cookies-next';
import { formatDuration } from '@/app/utils/time';
import { Song } from '@/app/model/song';
import Input from '@/app/components/inputs/input';
import PaginationTable, { Column } from '@/app/components/tables/PaginationTable';

interface AlternateSong {
  data: Song[];
  count: number; // Add this if not already present
}

interface Artist {
  id: string;
  name: string;
}

interface ArtistWithMetadata {
  artist: Artist;
}

const getAudioDuration = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.onloadedmetadata = () => resolve(audio.duration);
    audio.onerror = reject;
    audio.src = URL.createObjectURL(file);
  });
};

interface SongsResponse {
  count: number;  // Changed from 'total' to 'count' to match API
  data: Song[];
}

export default function SongsTable() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [artistSearch, setArtistSearch] = useState('');
  const [artistResults, setArtistResults] = useState<Artist[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSong, setNewSong] = useState({
    title: '',
    artists: [] as Artist[],
    releaseDate: '',
    genre: '',
    duration: 0,
    thumbnailUrl: null as File | null,
    file: null as File | null,
  });
  const queryClient = useQueryClient();

  const { data: songs, isLoading, isError } = useQuery<SongsResponse>({
    queryKey: ['songs', page, limit, search],
    queryFn: async () => {
      const token = getCookie('session_token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/song?page=${page}&limit=${limit}`,
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

  const updateMutation = useMutation({
    mutationFn: async (updatedSong: Song) => {
      const token = getCookie('session_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/songs/${updatedSong.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedSong)
      });
      if (!response.ok) throw new Error('Failed to update song');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
    }
  });

  const createMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const token = getCookie('session_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/songs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });
      if (!response.ok) throw new Error('Failed to create song');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
      setIsAddModalOpen(false);
      setNewSong({
        title: '',
        artists: [],
        releaseDate: '',
        genre: '',
        duration: 0,
        thumbnailUrl: null,
        file: null,
      });
    }
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this song?')) return;
    deleteMutation.mutate(id);
  };

  const handleRowClick = (song: Song) => {
    setSelectedSong(song);
  };

  const handleCloseModal = () => {
    setSelectedSong(null);
  };

  const handleArtistSearch = async (term: string): Promise<void> => {
    if (!term || term.length < 2) return;
    const token = getCookie('session_token');
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/search/${term}/artists?page=1&limit=30`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      }
    );
    const data = await response.json();
    setArtistResults(data.data || []);
  };

  const handleArtistAdd = (artist: Artist): void => {
    if (selectedSong) {
      setSelectedSong({
        ...selectedSong,
        artists: [...selectedSong.artists, { artist } as ArtistWithMetadata]
      });
    }
  };

  const handleArtistRemove = (artistId: string) => {
    if (selectedSong) {
      setSelectedSong({
        ...selectedSong,
        artists: selectedSong.artists.filter(a => a.artist.id !== artistId)
      });
    }
  };

  const handleSave = () => {
    if (selectedSong) {
      updateMutation.mutate(selectedSong);
      handleCloseModal();
    }
  };

  const handleAudioFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const duration = await getAudioDuration(file);
      setNewSong(prev => ({
        ...prev,
        file,
        duration
      }));
    } catch (error) {
      console.error('Error getting audio duration:', error);
    }
  };

  const handleAddSong = async (): Promise<void> => {
    const formData = new FormData();
    formData.append('title', newSong.title);
    formData.append('releaseDate', newSong.releaseDate);
    formData.append('genre', newSong.genre);
    formData.append('duration', newSong.duration.toString());
    
    // Convert artists array to comma-separated string of IDs
    const artistIds = newSong.artists.map(artist => artist.id).join(',');
    formData.append('artists', artistIds);
    
    if (newSong.thumbnailUrl) formData.append('thumbnailUrl', newSong.thumbnailUrl);
    if (newSong.file) formData.append('file', newSong.file);
    createMutation.mutate(formData);
  };

  useEffect(() => {
    if (artistSearch.length > 2) {
      handleArtistSearch(artistSearch);
    }
  }, [artistSearch]);

  if (isLoading) return <div>Loading songs...</div>;
  if (isError) return <div>Failed to load songs.</div>;
  if (!songs?.data) return <div>No songs found.</div>;

  const songList = songs.data;
  const totalPages = Math.ceil(songs.count / limit);

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <input
          type="text"
          placeholder="Search songs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 rounded-md bg-[--md-sys-color-surface-container-highest] text-[--md-sys-color-on-surface] placeholder-[--md-sys-color-on-surface] ring-0"
        />
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-[--md-sys-color-primary] text-[--md-sys-color-on-primary] rounded-md"
        >
          Add Song
        </button>
      </div>

      <PaginationTable
        data={songList}
        columns={[
          { header: 'Title', accessor: 'title' },
          { header: 'Artist', accessor: (song: Song) => song.artists.map(artist => artist.artist.name).join(', ') },
          { header: 'Duration', accessor: (song: Song) => formatDuration(song.duration!, true) }
        ]}
        page={page}
        onPageChange={setPage}
        rowActions={(song: Song) => (
          <div className="flex gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); handleRowClick(song); }}
              className="text-[--md-sys-color-primary]"
            >
              <span className='material-symbols-outlined'>edit</span>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleDelete(song.id); }}
              className="text-[--md-sys-color-error]"
            >
              <span className='material-symbols-outlined'>delete</span>
            </button>
          </div>
        )}
        onRowClick={handleRowClick}
        showPageInput={true}
        isLoading={isLoading}
        totalPages={totalPages}
      />

      {isAddModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-[--md-sys-color-surface] p-6 rounded-md w-96">
            <h2 className="text-xl font-bold mb-4">Add New Song</h2>
            
            <Input
              type="text"
              value={newSong.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                setNewSong({ ...newSong, title: e.target.value })}
              className="mb-4 w-full"
              title="Song Title"
              label="Title"
              leadingIcon={null}
              trailingIcon={null}
            />

            <Input
              type="text"
              value={newSong.genre}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                setNewSong({ ...newSong, genre: e.target.value })}
              className="mb-4 w-full"
              title="Genre"
              label="Genre"
              leadingIcon={null}
              trailingIcon={null}
            />

            <div className="mb-4">
              <div className="flex flex-wrap gap-2 mb-2">
                {newSong.artists.map((artist) => (
                  <div key={artist.id} className="flex items-center gap-2 bg-[--md-sys-color-surface-container] px-2 py-1 rounded-md">
                    <span>{artist.name}</span>
                    <button 
                      onClick={() => setNewSong({
                        ...newSong,
                        artists: newSong.artists.filter(a => a.id !== artist.id)
                      })}
                      className="text-red-500"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
              <Input
                type="text"
                placeholder="Search artists..."
                value={artistSearch}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setArtistSearch(e.target.value)}
                className="w-full"
                label="Search artists"
                leadingIcon={null}
                trailingIcon={null}
              />
              {artistResults.length > 0 && (
                <div className="mt-2 max-h-40 overflow-y-auto border rounded-md">
                  {artistResults.map((artist) => (
                    <div
                      key={artist.id}
                      onClick={() => {
                        if (!newSong.artists.find(a => a.id === artist.id)) {
                          setNewSong({
                            ...newSong,
                            artists: [...newSong.artists, artist]
                          });
                        }
                      }}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                    >
                      {artist.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Input
              type="date"
              value={newSong.releaseDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                setNewSong({ ...newSong, releaseDate: e.target.value })}
              className="mb-4 w-full"
              title="Release Date"
              label="Release Date"
              leadingIcon={null}
              trailingIcon={null}
            />

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Cover Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => 
                  setNewSong({ ...newSong, thumbnailUrl: e.target.files?.[0] || null })}
                className="w-full"
                aria-label='Image'
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Audio File</label>
              <input
                type="file"
                accept="audio/*"
                onChange={handleAudioFileChange}
                className="w-full"
                aria-label='Audio'
              />
              {newSong.duration > 0 && (
                <p className="mt-2 text-sm text-[--md-sys-color-on-surface-variant]">
                  Duration: {formatDuration(newSong.duration, true)}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={handleAddSong}
                disabled={!newSong.title || !newSong.file || newSong.artists.length === 0}
                className="px-4 py-2 bg-[--md-sys-color-primary] text-[--md-sys-color-on-primary] rounded-md disabled:opacity-50"
              >
                Add Song
              </button>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 bg-[--md-sys-color-outlined] rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedSong && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-[--md-sys-color-surface] p-6 rounded-md">
            <h2 className="text-xl font-bold mb-4">Edit Song</h2>
            {/* <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Title</label> */}
              <Input
              type="text"
              value={selectedSong.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedSong({ ...selectedSong, title: e.target.value })}
              className=""
              title="Song Title"
              label="Title"
              leadingIcon={null}
              trailingIcon={null}
              />
            {/* </div> */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Artists</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedSong.artists?.map(({ artist }) => (
                  <div key={artist.id} className="flex items-center gap-2 bg-[--md-sys-color-surface-container] px-2 py-1 rounded-md">
                    <span>{artist.name}</span>
                    <button onClick={() => handleArtistRemove(artist.id)} className="text-red-500">x</button>
                  </div>
                ))}
              </div>
              <Input
                type="text"
                placeholder="Search artists..."
                value={artistSearch}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setArtistSearch(e.target.value)}
                className="w-full"
                label="Search artists"
                leadingIcon={null}
                trailingIcon={null}
              />
              {artistResults.length > 0 && (
                <div className="mt-2 max-h-40 overflow-y-auto border rounded-md">
                  {artistResults.map((artist) => (
                    <div
                      key={artist.id}
                      onClick={() => handleArtistAdd(artist)}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                    >
                      {artist.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={handleSave}
              className="mt-4 px-4 py-2 bg-[--md-sys-color-primary] text-[--md-sys-color-on-primary] rounded-md"
            >
              Save
            </button>
            <button
              onClick={handleCloseModal}
              className="mt-4 ml-2 px-4 py-2 bg-[--md-sys-color-outlined] rounded-md"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
