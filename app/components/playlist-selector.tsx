'use client';

import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import PlaylistForm from './playlist/playlist-form';
import addSongToCollection from '@/app/api-fetch/add-song-to-collection';
import OutlinedIcon from './icons/outlined-icon';
import IconSmallButton from './buttons/icon-small-button';
import type { Playlist, PlaylistsResponse } from '../model/playlist';

interface PlaylistSelectorProps {
  songId?: string;
  currentPlaylistId?: string;  // Add this prop
  onClose: () => void;
}

export default function PlaylistSelector({ songId, currentPlaylistId, onClose }: PlaylistSelectorProps) {
  const [showNewPlaylistForm, setShowNewPlaylistForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: playlistsData, isLoading, error: fetchError } = useQuery({
    queryKey: ['playlists'],
    queryFn: async () => {
      const response = await fetch('/api/user/playlists');
      if (!response.ok) throw new Error('Failed to fetch playlists');
      const data = await response.json() as PlaylistsResponse;
      return data?.data || [];
    },
  });

  const { mutate: addToPlaylist, isPending } = useMutation({
    mutationFn: async (playlistId: string) => {
      if (!songId) throw new Error('No song selected');
      try {
        await addSongToCollection(playlistId, songId);
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : 'Failed to add song');
      }
    },
    onSuccess: () => {
      setSuccess('Song added to playlist successfully');
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      setTimeout(() => {
        onClose();
      }, 1500);
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Failed to add song to playlist');
      // Clear error after 3 seconds
      setTimeout(() => setError(null), 3000);
    },
  });

  // Filter playlists properly
  const playlists = Array.isArray(playlistsData) 
    ? playlistsData.filter(p => p.type === "Playlist" && p.id !== currentPlaylistId)
    : [];

  if (showNewPlaylistForm) {
    return (
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-4">
          <IconSmallButton onClick={() => setShowNewPlaylistForm(false)}>
            <OutlinedIcon icon="arrow_back" />
          </IconSmallButton>
          <h2 className="text-xl font-bold">Create New Playlist</h2>
        </div>
        <PlaylistForm
          onSuccess={() => {
            setShowNewPlaylistForm(false);
            queryClient.invalidateQueries({ queryKey: ['playlists'] });
          }}
          onCancel={() => setShowNewPlaylistForm(false)}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <h2 className="text-xl font-bold mb-4">Add to Playlist</h2>
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
          {success}
        </div>
      )}
      <div className="flex flex-col gap-2">
        <button
          onClick={() => setShowNewPlaylistForm(true)}
          className="w-full px-4 py-2 rounded hover:bg-[--md-sys-color-surface-container-highest] text-left flex items-center gap-2"
        >
          <OutlinedIcon icon="add" />
          Create New Playlist
        </button>
        {playlists.length === 0 && !isLoading && (
          <p className="text-center text-[--md-sys-color-on-surface-variant] py-4">
            No playlists found. Create one to get started!
          </p>
        )}
        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[--md-sys-color-primary]"></div>
          </div>
        ) : (
          playlists.map((playlist: Playlist) => (
            <button
              key={playlist.id}
              onClick={() => addToPlaylist(playlist.id)}
              disabled={isPending}
              className="w-full px-4 py-2 rounded bg-[--md-sys-color-surface-container-high] hover:bg-[--md-sys-color-surface-container-highest] text-left disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <OutlinedIcon icon="playlist_add" />
              {playlist.title}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
