import React, { useState, useEffect } from 'react';
import { getCookie } from 'cookies-next';
import Input from '../inputs/outlined-input';
import { formatDuration } from '@/app/utils/time';
import DragNDropZone from '../inputs/dragndropzone';

interface SearchArtist {
  id: string;
  name: string;
  avatarurl: string;
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

  useEffect(() => {
    const searchArtists = async () => {
      if (!artistSearch) {
        setArtistResults([]);
        return;
      }

      const token = getCookie('session_token');
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/v1/search/${artistSearch}/artists`,
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
      }
    };

    const debounce = setTimeout(searchArtists, 300);
    return () => clearTimeout(debounce);
  }, [artistSearch]);

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      const audio = new Audio(URL.createObjectURL(file));
      audio.onloadedmetadata = () => {
        setSongData(prev => ({ ...prev, duration: Math.round(audio.duration) }));
      };
    }
  };

  const handleArtistAdd = (artist: SearchArtist) => {
    if (!songData.artists.find(a => a.id === artist.id)) {
      setSongData(prev => ({
        ...prev,
        artists: [...prev.artists, { id: artist.id, name: artist.name }]
      }));
      setArtistSearch('');
    }
  };

  const handleSave = async () => {
    const token = getCookie('session_token');
    const formData = new FormData();

    formData.append('title', songData.title);
    formData.append('genre', songData.genre);
    formData.append('releasedate', songData.releasedate);
    formData.append('duration', songData.duration.toString());
    formData.append('artists', songData.artists.map(a => a.id).join(','));
    if (songData.file) {
      formData.append('file', songData.file);
    }

    try {
      // First, create the song metadata
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/song`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'cache-control': 'no-cache'
        },
        body: formData
      });

      if (!response.ok) throw new Error('Failed to create song');

      const result: AddSongResponse = await response.json();

      // Then, if we have an audio file, upload it
      if (audioFile) {
        const uploadResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/v1/song/${result.data.id}/presigned/upload`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );

        if (!uploadResponse.ok) throw new Error('Failed to get upload URL');

        const { url } = await uploadResponse.json();
        await fetch(url, {
          method: 'PUT',
          body: audioFile,
          headers: { 
            'Content-Type': audioFile.type,
            'cache-control': 'no-cache'
          }
        });
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating song:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-[--md-sys-color-surface] p-6 rounded-md w-96 flex flex-col gap-4">
        <h2 className="text-xl font-bold ">Add New Song</h2>

        <DragNDropZone
          onDrop={(files: File[]) => {
            if (files[0]) {
              setSongData(prev => ({ ...prev, file: files[0] }));
            }
          }}
          supportText="Drag and drop a thumbnail image here, or click to select a file."
          supportedTypes={
            {
              'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
            }
          }
          avatarPreview={songData.file ? URL.createObjectURL(songData.file) : null}
          icon_text="image"
        />

        <Input
          type="text"
          value={songData.title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSongData({ ...songData, title: e.target.value })}
          className=" w-full"
          title="Song Title"
          label="Title"
          leadingIcon={null}
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
          leadingIcon={null}
          trailingIcon={null}
        />

        <div className="">
          <div className="flex flex-wrap gap-2 mb-2">
            {songData.artists.map((artist) => (
              <div key={artist.id} className="flex items-center justify-center gap-2 bg-[--md-sys-color-surface-container] px-2 py-1 rounded-md">
                <span>{artist.name}</span>
                <button
                  onClick={() => setSongData({
                    ...songData,
                    artists: songData.artists.filter(a => a.id !== artist.id)
                  })}
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
          value={songData.releasedate}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSongData({ ...songData, releasedate: e.target.value })}
          className=" w-full"
          title="Release Date"
          label="Release Date"
          leadingIcon={null}
          trailingIcon={null}
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

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={handleSave}
            disabled={!songData.title || songData.artists.length === 0}
            className="px-4 py-2 bg-[--md-sys-color-primary] text-[--md-sys-color-on-primary] rounded-md disabled:opacity-50"
          >
            Add Song
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[--md-sys-color-surface-variant] text-[--md-sys-color-on-surface-variant] rounded-md"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSongDialog;
