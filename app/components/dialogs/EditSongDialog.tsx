import React, { useState, useEffect } from 'react';
import { getCookie } from 'cookies-next';
import Input from '../inputs/outlined-input';
import { Song } from '@/app/model/song';

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
}

interface EditSongDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  song: Song;
}

const EditSongDialog: React.FC<EditSongDialogProps> = ({ isOpen, onClose, onSuccess, song }) => {
  const [songData, setSongData] = useState<EditSongData>({
    id: song.id,
    title: song.title,
    genre: song.genre || '',
    artists: song.artists.map(a => a.artist.id),
    releasedate: song.releasedate || new Date().toISOString().split('T')[0],
    duration: song.duration || 0
  });
  const [artistSearch, setArtistSearch] = useState('');
  const [artistResults, setArtistResults] = useState<SearchArtist[]>([]);
  const [selectedArtists, setSelectedArtists] = useState(song.artists);

  useEffect(() => {
    const searchArtists = async () => {
      console.log(artistSearch);
      if (!artistSearch) {
        setArtistResults([]);
        return;
      }

      const token = getCookie('session_token');
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/v1/search/${artistSearch}/artists`,
          {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'cache-control': 'no-cache'
            }
            
          }
        );
        if (response.ok) {
          const data = await response.json() as SearchArtistResponse;
          setArtistResults(data.data.artists);
          console.log(artistResults);
        }
      } catch (error) {
        console.error('Error searching artists:', error);
      }
    };

    const debounce = setTimeout(searchArtists, 300);
    return () => clearTimeout(debounce);
  }, [artistSearch, artistResults]);

  const handleArtistAdd = (artist: SearchArtist) => {
    if (!songData.artists.includes(artist.id)) {
      setSongData(prev => ({
        ...prev,
        artists: [...prev.artists, artist.id]
      }));
      setSelectedArtists(prev => [...prev, { artist: { id: artist.id, name: artist.name } }]);
      console.log(songData.artists);
      setArtistSearch('');
    }
  };

  const handleSave = async () => {
    const token = getCookie('session_token');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/song/${song.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: songData.title,
          artists: songData.artists,
          releasedate: songData.releasedate,
          genre: songData.genre,
          duration: songData.duration
        })
      });

      if (!response.ok) throw new Error('Failed to update song');

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating song:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-[--md-sys-color-surface] p-6 rounded-md w-96">
        <h2 className="text-xl font-bold mb-4">Edit Song</h2>

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
        {artistResults.length > 0 && (
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
          disabled={!songData.title || songData.artists.length === 0}
          className="px-4 py-2 bg-[--md-sys-color-primary] text-[--md-sys-color-on-primary] rounded-md disabled:opacity-50"
        >
          Save Changes
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-[--md-sys-color-surface-variant] text-[--md-sys-color-on-surface-variant] rounded-md"
        >
          Cancel
        </button>
      </div>
    </div>
    </div >
  );
};

export default EditSongDialog;
