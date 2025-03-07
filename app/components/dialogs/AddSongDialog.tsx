import React, { useState, useEffect, useCallback } from 'react';
import { getCookie } from 'cookies-next';
import Input from '../inputs/outlined-input';
import { formatDuration } from '@/app/utils/time';
import DragNDropZone from '../inputs/dragndropzone';
import DialogFrame from './dialog-frame';
import ArtistChip from '../inputs/artist-chip';
import OutlinedIcon from '../icons/outlined-icon';
import IconSmallButton from '../buttons/icon-small-button';

interface SearchArtist {
  id: string;
  name: string;
  avatarurl?: string;
}

interface SearchArtistResponse {
  data: {
    artists: SearchArtist[]
  };
}

interface NewSongData {
  title: string;
  genre: string;
  artists: { id: string; name: string }[];
  releasedate: string;
  file: File | null;
  duration: number;
}

interface AddSongResponse {
  data: {
    id: string;
    title: string;
    thumbnailurl: string;
    duration: number;
    releasedate: string;
    genre: string;
    views: number;
  };
}

interface AddSongDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddSongDialog: React.FC<AddSongDialogProps> = ({ isOpen, onClose, onSuccess }) => {
  const [songData, setSongData] = useState<NewSongData>({
    title: '',
    genre: '',
    artists: [],
    releasedate: new Date().toISOString().split('T')[0],
    file: null,
    duration: 0,
  });
  const [artistSearch, setArtistSearch] = useState('');
  const [artistResults, setArtistResults] = useState<SearchArtist[]>([]);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isSearchingArtists, setIsSearchingArtists] = useState(false);

  const searchArtists = useCallback(async (searchTerm: string) => {
    if (!searchTerm) {
      setArtistResults([]);
      return;
    }

    setIsSearchingArtists(true);
    const token = getCookie('session_token');
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/search/${searchTerm}/artists`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      if (response.ok) {
        const data = await response.json() as SearchArtistResponse;
        setArtistResults(data.data.artists);
      }
    } catch (error) {
      console.error('Error searching artists:', error);
    } finally {
      setIsSearchingArtists(false);
    }
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      searchArtists(artistSearch);
    }, 300);

    return () => clearTimeout(debounce);
  }, [artistSearch, searchArtists]);

  const clear = () => {
    setSongData({
      title: '',
      genre: '',
      artists: [],
      releasedate: new Date().toISOString().split('T')[0],
      file: null,
      duration: 0,
    });
    setArtistSearch('');
    setArtistResults([]);
    setAudioFile(null);
  }

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      const audio = new Audio(URL.createObjectURL(file));
      audio.onloadedmetadata = () => {
        setSongData(prev => ({ ...prev, duration: Math.round(audio.duration) }));
        if (songData.title === '') {
          setSongData(prev => ({ ...prev, title: file.name.split('.').slice(0, -1).join('.') }));
        }
      };
    }
  };

  const handleArtistAdd = (artist: SearchArtist) => {
    if (!songData.artists.find(a => a.id === artist.id)) {
      setSongData(prev => ({
        ...prev,
        artists: [...prev.artists, { id: artist.id, name: artist.name, avatarurl: artist.avatarurl }]
      }));
      setArtistSearch('');
    }
  };

  const handleArtistDelete = (artist: SearchArtist) => {
    setSongData(prev => ({
      ...prev,
      artists: prev.artists.filter(a => a.id !== artist.id)
    }));
  };

  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    const formData = new FormData();

    formData.append('title', songData.title);
    formData.append('genre', songData.genre);
    formData.append('releasedate', songData.releasedate);
    formData.append('duration', songData.duration.toString());
    formData.append('artists', songData.artists.map(a => a.id).join(','));
    formData.append('file', songData.file as Blob);
    if (audioFile) {
      formData.append('audioFile', audioFile, audioFile.name);
    }

    try {
      // First, create the song metadata
      const response = await fetch('/api/song', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to create song');

      const result: AddSongResponse = await response.json();

      // Then, if we have an audio file, upload it
      if (audioFile) {
        const fileFormData = new FormData();
        fileFormData.append('file', audioFile, audioFile.name);
        await fetch(`/api/song/${result.data.id}/upload-url`, {
          method: 'PUT',
          body: fileFormData,
        });
      }

      onSuccess();
      onClose();
      clear();
    } catch (error) {
      console.error('Error creating song:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  if (!isOpen) return null;

  return (
    <DialogFrame onClose={onClose}>
      <h2 className="text-xl font-bold ">Add New Song</h2>

      <DragNDropZone
        onDrop={(files: File[]) => {
          if (files[0]) {
            setSongData(prev => ({ ...prev, file: files[0] }));
          }
        }}
        supportText="Drag and drop a thumbnail image here, or click to select a file."
        supportedTypes={{
          'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
        }}
        avatarPreview={songData.file ? URL.createObjectURL(songData.file) : null}
        icon_text="image"
      />

      <div className="">
        <label className="block text-sm font-medium mb-2">Audio File</label>
        <input
          type="file"
          accept="audio/*"
          onChange={handleAudioFileChange}
          className="w-full"
          aria-label="Audio"
        />
        {songData.duration > 0 && (
          <p className="mt-2 text-sm text-[--md-sys-color-on-surface-variant]">
            Duration: {formatDuration(songData.duration, true)}
          </p>
        )}
      </div>

      <Input
        type="text"
        value={songData.title}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setSongData({ ...songData, title: e.target.value })}
        className=" w-full"
        title="Song Title"
        label="Title"
        leadingIcon={OutlinedIcon({ icon: 'music_note' })}
        trailingIcon={null}
      />

      <Input
        type="text"
        value={songData.genre}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setSongData({ ...songData, genre: e.target.value })}
        className=" w-full"
        title="Genre"
        label="Genre"
        leadingIcon={OutlinedIcon({ icon: 'category' })}
        trailingIcon={null}
      />

      <div className="">
        <div className="flex flex-wrap gap-2 mb-2">
          {songData.artists.map((artist) => (
            <ArtistChip
              key={artist.id}
              artist={artist}
              onDeleteClick={handleArtistDelete}
            />
          ))}
        </div>
        <Input
          type="text"
          value={artistSearch}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setArtistSearch(e.target.value)}
          className="w-full"
          title="Search Artists"
          label="Search Artists"
          leadingIcon={OutlinedIcon({ icon: 'person' })}
          trailingIcon={<IconSmallButton type="button" onClick={() => setArtistSearch('')} className="cursor-pointer">
            <OutlinedIcon icon="search" />
          </IconSmallButton>}
          onKeyDown={handleKeyDown}
        />
        {artistSearch && (
          <div className="mt-2 max-h-40 overflow-y-auto border border-[--md-sys-color-outline] rounded-md">
            {isSearchingArtists ? (
              <div className="px-4 py-2 flex items-center gap-2">
                <span className="animate-spin material-symbols-outlined">progress_activity</span>
                <span>Searching...</span>
              </div>

            ) : Array.isArray(artistResults) && artistResults.length > 0 ? (
              artistResults.map((artist) => (
                <div
                  key={artist.id}
                  onClick={() => handleArtistAdd(artist)}
                  onKeyDown={() => handleArtistAdd(artist)}
                  className="px-4 py-2 cursor-pointer hover:bg-[--md-sys-color-surface-container]"
                >
                  {artist.name}
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-[--md-sys-color-on-surface-variant]">
                No artists found
              </div>
            )}
          </div>
        )}
      </div>

      <Input
        type="date"
        value={songData.releasedate}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setSongData({ ...songData, releasedate: e.target.value })}
        className=" w-full"
        title="Release Date"
        label="Release Date"
        leadingIcon={OutlinedIcon({ icon: 'calendar_today' })}
        trailingIcon={null}
      />

      <div className="flex justify-end gap-2 mt-4">
        <button
          type='button'
          onClick={handleSave}
          disabled={!songData.title || !audioFile || songData.artists.length === 0 || isLoading}
          className="px-4 py-2 bg-[--md-sys-color-primary] text-[--md-sys-color-on-primary] rounded-md disabled:opacity-50 flex items-center gap-2"
        >
          {isLoading && (
            <span className="animate-spin material-symbols-outlined">progress_activity</span>
          )}
          Add Song
        </button>
        <button
          type='button'
          onClick={() => {
            clear();
            onClose();
          }}
          className="px-4 py-2 bg-[--md-sys-color-surface-variant] text-[--md-sys-color-on-surface-variant] rounded-md"
        >
          Cancel
        </button>
      </div>
    </DialogFrame>
  );
};

export default AddSongDialog;
