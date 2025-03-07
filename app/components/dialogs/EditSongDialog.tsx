import React, { useEffect, useState } from 'react';
import { getCookie } from 'cookies-next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Input from '../inputs/outlined-input';
import { Song } from '@/app/model/song';
import DialogFrame from './dialog-frame';
import DragNDropZone from '../inputs/dragndropzone';
import { debounce } from 'lodash';

interface SearchArtist {
  id: string;
  name: string;
  avatarurl: string;
  country: string;
  managerid: string;
  description: string | null;
}

interface SearchArtistResponse {
  data: {
    artists: SearchArtist[]
  };
}

interface EditSongData {
  id: string;
  title: string;
  genre: string;
  artists: string[];
  releasedate: string;
  duration: number;
  file: File | null;
}

interface EditSongDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  song: Song;
}

const EditSongDialog: React.FC<EditSongDialogProps> = ({ isOpen, onClose, onSuccess, song }) => {
  const queryClient = useQueryClient();
  const [songData, setSongData] = useState<EditSongData>({
    id: song.id,
    title: song.title,
    genre: song.genre || '',
    artists: song.artists.map(a => a.artist.id),
    releasedate: song.releasedate || new Date().toISOString().split('T')[0],
    duration: song.duration || 0,
    file: null
  });
  const [artistSearch, setArtistSearch] = useState('');
  const [selectedArtists, setSelectedArtists] = useState(song.artists);
  const [thumbnailUrl, setThumbnailUrl] = useState(song.thumbnailurl || '');

  // Query for searching artists
  const { data: artistResults = [] } = useQuery<SearchArtist[]>({
    queryKey: ['artistSearch', artistSearch],
    queryFn: async () => {
      if (!artistSearch) return [];
      const token = getCookie('session_token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/search/${artistSearch}/artists`,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'cache-control': 'no-cache'
          }
        }
      );
      if (!response.ok) throw new Error('Failed to search artists');
      const data = await response.json() as SearchArtistResponse;
      return data.data.artists;
    },
    enabled: artistSearch.length > 0,
    staleTime: 10000
  });

  useEffect(() => {
    debounce(() => {
      queryClient.invalidateQueries({ queryKey: ['artistSearch'] });
    });
  })

  // Mutation for updating song
  const updateSongMutation = useMutation({
    mutationFn: async (data: EditSongData) => {
      const token = getCookie('session_token');
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('genre', data.genre);
      formData.append('releasedate', data.releasedate);
      formData.append('duration', data.duration.toString());
      if (data.file) {
        formData.append('file', data.file);
      }
      const response = await fetch(`/api/song/${data.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });
      if (!response.ok) throw new Error('Failed to update song');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
      onSuccess();
      onClose();
    },
    onError: (error) => {
      console.error('Error updating song:', error);
    }
  });

  const handleArtistAdd = (artist: SearchArtist) => {
    if (!songData.artists.includes(artist.id)) {
      setSongData(prev => ({
        ...prev,
        artists: [...prev.artists, artist.id]
      }));
      setSelectedArtists(prev => [...prev, { artist: { id: artist.id, name: artist.name } }]);
      setArtistSearch('');
    }
  };

  const handleSave = () => {
    updateSongMutation.mutate(songData);
  };

  const handleThumbnailChange = (files: File[]) => {
    const file = files[0];
    setSongData({ ...songData, file });
    setThumbnailUrl(URL.createObjectURL(file));
  };

  if (!isOpen) return null;

  return (
    <DialogFrame onClose={onClose}>
        <h2 className="text-xl font-bold mb-4">Edit Song</h2>
        <DragNDropZone
          onDrop={handleThumbnailChange}
          supportText="Song File"
          avatarPreview={thumbnailUrl}
          supportedTypes={['audio/*']}
        />
        <Input
          type="text"
          value={songData.title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSongData({ ...songData, title: e.target.value })}
          className="mb-4 w-full"
          title="Song Title"
          label="Title"
          leadingIcon={null}
          trailingIcon={null}
        />

        <Input
          type="text"
          value={songData.genre}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSongData({ ...songData, genre: e.target.value })}
          className="mb-4 w-full"
          title="Genre"
          label="Genre"
          leadingIcon={null}
          trailingIcon={null}
        />

        <div className="mb-4">
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedArtists.map((artist) => (
              <div key={artist.artist.id} className="flex items-center justify-center gap-2 bg-[--md-sys-color-surface-container] px-2 py-1 rounded-md">
                <span>{artist.artist.name}</span>
                <button
                  onClick={() => {
                    setSongData({
                      ...songData,
                      artists: songData.artists.filter(id => id !== artist.artist.id)
                    });
                    setSelectedArtists(prev => prev.filter(a => a.artist.id !== artist.artist.id));
                  }}
                className="text-red-500 flex"
                >
                <span className='material-symbols-outlined'>close</span>
              </button>
              </div>
            ))}
        </div>
        <Input
          type="text"
          value={artistSearch}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setArtistSearch(e.target.value)}
          className="w-full"
          title="Search Artists"
          label="Search Artists"
          leadingIcon={null}
          trailingIcon={null}
        />
        {Array.isArray(artistResults) && artistResults.length > 0 && (
          <div className="mt-2 max-h-40 overflow-y-auto border border-[--md-sys-color-outline] rounded-md">
            {artistResults.map((artist) => (
              <div
                key={artist.id}
                onClick={() => handleArtistAdd(artist)}
                className="px-4 py-2 cursor-pointer hover:bg-[--md-sys-color-surface-container]"
              >
                {artist.name}
              </div>
            ))}
          </div>
        )}
      </div>

      <Input
        type="date"
        value={songData.releasedate.split('T')[0]}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSongData({ ...songData, releasedate: e.target.value })}
        className="mb-4 w-full"
        title="Release Date"
        label="Release Date"
        leadingIcon={null}
        trailingIcon={null}
      />

      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={handleSave}
          disabled={updateSongMutation.isPending || !songData.title || songData.artists.length === 0}
          className="px-4 py-2 bg-[--md-sys-color-primary] text-[--md-sys-color-on-primary] rounded-md disabled:opacity-50 flex items-center gap-2"
        >
          {updateSongMutation.isPending && (
            <div className="animate-spin h-4 w-4 border-2 border-[--md-sys-color-on-primary] border-t-transparent rounded-full" />
          )}
          Save Changes
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-[--md-sys-color-surface-variant] text-[--md-sys-color-on-surface-variant] rounded-md"
        >
          Cancel
        </button>
      </div>
    </DialogFrame>
  );
};

export default EditSongDialog;
