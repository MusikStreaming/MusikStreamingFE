import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { getCookie } from 'cookies-next';
import axios from 'axios';
import Image from 'next/image';
import IconSmallButton from '@/app/components/buttons/icon-small-button';
import OutlinedIcon from '@/app/components/icons/outlined-icon';
import fetchAlbumById from '@/app/api-fetch/album-by-id';
import DialogFrame from './dialog-frame';
import { debounce } from 'lodash';

interface EditAlbumDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  album: {
    id: string;
    title: string;
    artist: string;
    releaseDate: string;
    thumbnailurl: string;
    type: string;
    visibility: string;
    songs?: { id: string; title: string }[];
  };
}

export default function EditAlbumDialog({ isOpen, onClose, onSuccess, album }: EditAlbumDialogProps) {
  const { data: details } = useQuery({
    queryKey: ['album', album.id],
    queryFn: async () => {
      // const token = getCookie('session_token');
      const response = await fetchAlbumById(album.id);
      if (!response) throw new Error('Failed to fetch album details');
      return response;
    },
  });
  const [title, setTitle] = useState(album.title);
  const [type, setType] = useState(album.type);
  const [visibility, setVisibility] = useState(album.visibility);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState(album.thumbnailurl);
  const [songs, setSongs] = useState(details?.songs || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<{
    id: string;
    title: string
    artists: { id: string; name: string }[];
  }[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const queryClient = useQueryClient();

  const [initialState, setInitialState] = useState({
    title: album.title,
    type: album.type,
    visibility: album.visibility,
    thumbnailUrl: album.thumbnailurl,
    songs: details?.songs || []
  });

  const [addedSongs, setAddedSongs] = useState<string[]>([]);
  const [removedSongs, setRemovedSongs] = useState<string[]>([]);

  useEffect(() => {
    setInitialState({
      title: album.title,
      type: album.type,
      visibility: album.visibility,
      thumbnailUrl: album.thumbnailurl,
      songs: details?.songs || []
    });
    setTitle(album.title);
    setType(album.type);
    setVisibility(album.visibility);
    setThumbnailUrl(album.thumbnailurl);
    setSongs(details?.songs || []);
  }, [album, details]);

  useEffect(() => {
    debounce(() => handleSearch, 300)
  })

  const hasMetadataChanges = () => {
    return (
      title !== initialState.title ||
      type !== initialState.type ||
      visibility !== initialState.visibility ||
      thumbnailUrl !== initialState.thumbnailUrl
    );
  };

  const hasSongsChanges = () => {
    const initialSongIds = initialState.songs.map(song => song.song.id);
    const currentSongIds = songs.map(song => song.song.id);

    console.log('Initial song IDs:', initialSongIds);
    console.log('Current song IDs:', currentSongIds);

    const added = currentSongIds.filter(id => !initialSongIds.includes(id));
    const removed = initialSongIds.filter(id => !currentSongIds.includes(id));

    console.log('Added song IDs:', added);
    console.log('Removed song IDs:', removed);

    setAddedSongs(added);
    setRemovedSongs(removed);

    console.log('Added songs:', addedSongs);
    console.log('Removed songs:', removedSongs);

    return added.length > 0 || removed.length > 0;
  };

  const editMutation = useMutation({
    mutationFn: async (e: React.FormEvent) => {
      e.preventDefault();
      if (!hasMetadataChanges() && !hasSongsChanges()) {
        alert('No changes detected');
        return;
      }

      const token = getCookie('session_token');

      try {
        // Update metadata
        if (hasMetadataChanges()) {
          const formData = new FormData();
          formData.append('title', title);
          formData.append('type', type);
          formData.append('visibility', visibility || 'Public'); // Add default value
          if (thumbnail) formData.append('file', thumbnail);

          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/collection/${album.id}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            body: formData,
          });
          if (!response.ok) {
            console.error(response);
            throw new Error('Failed to update album metadata');
          }
        }

        const initialSongIds = initialState.songs.map(song => song.song.id);
        const currentSongIds = songs.map(song => song.song.id);

        console.log('Initial song IDs:', initialSongIds);
        console.log('Current song IDs:', currentSongIds);

        const added = currentSongIds.filter(id => !initialSongIds.includes(id));
        const removed = initialSongIds.filter(id => !currentSongIds.includes(id));

        console.log('Added song IDs:', added);
        console.log('Removed song IDs:', removed);

        // Add songs
        for (const songId of added) {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/collection/${album.id}/songs/${songId}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (!response.ok) throw new Error(`Failed to add song with ID ${songId}`);
        }

        // Remove songs
        for (const songId of removed) {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/collection/${album.id}/songs/${songId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (!response.ok) throw new Error(`Failed to remove song with ID ${songId}`);
        }

        queryClient.invalidateQueries({ queryKey: ['albums'] });
        localStorage.removeItem(`playlist-${album.id}`);
        localStorage.removeItem(`playlist-time-${album.id}`);
        onSuccess();
        onClose();
      } catch (error) {
        if (error instanceof Error) {
          alert(error.message);
        } else {
          alert('An unexpected error occurred');
        }
      }

    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['albums'] });
      onSuccess();
      onClose();
    },
  });

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setThumbnail(e.target.files[0]);
      setThumbnailUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const processedQuery = searchTerm.trim().replace(/\s+/g, '+');
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/v1/search/${encodeURIComponent(processedQuery)}/songs?page=1&limit=10`);
      setSearchResults(response.data.songs || []);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddSong = (song: { id: string; title: string, artists: { id: string; name: string }[] }) => {
    setSongs([...songs, { song: { ...song, thumbnailurl: '', duration: null, views: null, artists: song.artists } }]);
    setSearchResults([]); // Close the search results
    setSearchTerm(''); // Clear the search term
  };

  const handleRemoveSong = (songId: string) => {
    setSongs(songs.filter(s => s.song.id !== songId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // if (!hasMetadataChanges() && !hasSongsChanges()) {
    //   alert('No changes detected');
    //   return;
    // }

    // const token = getCookie('session_token');

    // try {
    //   // Update metadata
    //   if (hasMetadataChanges()) {
    //     const formData = new FormData();
    //     formData.append('title', title);
    //     formData.append('type', type);
    //     formData.append('visibility', visibility);
    //     if (thumbnail) formData.append('thumbnail', thumbnail);

    //     const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/collection/${album.id}`, {
    //       method: 'POST',
    //       headers: {
    //         'Authorization': `Bearer ${token}`,
    //       },
    //       body: formData,
    //     });
    //     if (!response.ok) {
    //       console.error(response);
    //       throw new Error('Failed to update album metadata');
    //     }
    //   }

    //   const initialSongIds = initialState.songs.map(song => song.song.id);
    //   const currentSongIds = songs.map(song => song.song.id);

    //   console.log('Initial song IDs:', initialSongIds);
    //   console.log('Current song IDs:', currentSongIds);

    //   const added = currentSongIds.filter(id => !initialSongIds.includes(id));
    //   const removed = initialSongIds.filter(id => !currentSongIds.includes(id));

    //   console.log('Added song IDs:', added);
    //   console.log('Removed song IDs:', removed);

    //   // Add songs
    //   for (const songId of added) {
    //     const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/collection/${album.id}/songs/${songId}`, {
    //       method: 'POST',
    //       headers: {
    //         'Authorization': `Bearer ${token}`,
    //       },
    //     });
    //     if (!response.ok) throw new Error(`Failed to add song with ID ${songId}`);
    //   }

    //   // Remove songs
    //   for (const songId of removed) {
    //     const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/collection/${album.id}/songs/${songId}`, {
    //       method: 'DELETE',
    //       headers: {
    //         'Authorization': `Bearer ${token}`,
    //       },
    //     });
    //     if (!response.ok) throw new Error(`Failed to remove song with ID ${songId}`);
    //   }

    //   queryClient.invalidateQueries({ queryKey: ['albums'] });
    //   localStorage.removeItem(`playlist-${album.id}`);
    //   onSuccess();
    //   onClose();
    // } catch (error) {
    //   if (error instanceof Error) {
    //     alert(error.message);
    //   } else {
    //     alert('An unexpected error occurred');
    //   }
    // }
    editMutation.mutate(e);
  };

  if (!isOpen) return null;

  return (
    <DialogFrame onClose={onClose}>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <div className='w-full'>
          <label className='block text-sm font-medium'>Title</label>
          <input
            type='text'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className='p-2 rounded-md bg-[--md-sys-color-surface-container-highest] text-[--md-sys-color-on-surface] w-full'
            required
            aria-label='title'
          />
        </div>
        <div className='w-full'>
          <label className='block text-sm font-medium'>Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className='p-2 rounded-md bg-[--md-sys-color-surface-container-highest] text-[--md-sys-color-on-surface] w-full'
            required
            aria-label='type'
          >
            <option value='Album'>Album</option>
            <option value='Single'>Single</option>
            <option value='EP'>EP</option>
          </select>
        </div>
        <div>
          <label className='block text-sm font-medium'>Visibility</label>
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            className='p-2 rounded-md bg-[--md-sys-color-surface-container-highest] text-[--md-sys-color-on-surface] w-full'
            required
            aria-label='visibility'
          >
            <option value='Public'>Public</option>
            <option value='Private'>Private</option>
          </select>
        </div>
        <div>
          <label className='block text-sm font-medium'>Thumbnail</label>
          <input
            type='file'
            onChange={handleThumbnailChange}
            className='p-2 rounded-md bg-[--md-sys-color-surface-container-highest] text-[--md-sys-color-on-surface] w-full'
            aria-label='thumbnail'
          />
          {thumbnailUrl && <Image src={thumbnailUrl} alt='Thumbnail' width={128} height={128} className='mt-2 object-cover' />}
        </div>
        <div>
          <div className='flex flex-col gap-2'>
            <label className='block text-sm font-medium'>Songs</label>
            <div className='flex gap-2 w-full'>
              <input
                type='text'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='p-2 rounded-md bg-[--md-sys-color-surface-container-highest] text-[--md-sys-color-on-surface] flex-1'
                placeholder='Search for songs...'
                aria-label='search songs'
              />
              <button type='button' onClick={handleSearch} aria-label='search' className='p-2 h-full flex items-center bg-[--md-sys-color-tertiary] text-[--md-sys-color-on-tertiary] rounded-md'>
                <OutlinedIcon icon='search' />
              </button>
            </div>
          </div>
          <ul className='mt-2'>
            {searchTerm !== "" && (
              isSearching ? (
                <li className='text-center p-2'>Searching...</li>
              ) : Array.isArray(searchResults) && searchResults.length > 0 ? (
                searchResults.map(song => (
                  <li key={song.id} className='flex justify-between items-center'>
                    <div className='flex flex-col'>
                      <span>{song.title}</span>
                      {song.artists && <span className='text-sm text-[--md-sys-color-on-surface-variant]'>{song.artists.map(a => a.name).join(', ')}</span>}
                    </div>
                    <button type='button' onClick={() => handleAddSong(song)} className='px-2 py-1 bg-[--md-sys-color-secondary] text-[--md-sys-color-on-secondary] rounded-md'>
                      Add
                    </button>
                  </li>
                ))
              ) : (
                <li className='text-center p-2'>No results found</li>
              )
            )}
          </ul>
          <table className='mt-2 w-full'>
            <thead>
              <tr>
                <th className='text-left p-2'>Title</th>
                <th className='text-left p-2'>Artists</th>
                <th className='text-left p-2'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {songs && songs.map(({ song }) => (
                <tr key={song.id}>
                  <td className='p-2'>{song.title}</td>
                  <td className='p-2'>{song.artists && song.artists.map(a => a.name).join(', ')}</td>
                  <td className='p-2 flex items-center justify-center'>
                    <button type='button' onClick={() => handleRemoveSong(song.id)} className='px-2 py-1 bg-[--md-sys-color-error] text-[--md-sys-color-on-error] rounded-md' aria-label='delete song'>
                      <OutlinedIcon icon='delete' />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          type='submit'
          className='px-4 py-2 bg-[--md-sys-color-primary] text-[--md-sys-color-on-primary] rounded-md'
        >
          Save Changes
        </button>
      </form>
    </DialogFrame>
  );
}
