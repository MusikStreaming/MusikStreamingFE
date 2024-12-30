'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import PlaylistForm from '../playlist/playlist-form';
import DialogFrame from '../dialogs/dialog-frame';
import PlaylistCard from '../info-cards/playlist-card';
import type {Playlist, PlaylistsResponse} from '../../model/playlist';
import { getCookie } from 'cookies-next';
import { redirectToLogin } from '@/app/services/auth.service';

export default function PlaylistsGrid() {
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const queryClient = useQueryClient();

  const { data: playlists, isLoading, error } = useQuery<Playlist[], Error>({
    queryKey: ['playlists'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/user/playlists');
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json() as PlaylistsResponse;
        if (!data || !Array.isArray(data.data)) {
          throw new Error('Invalid response format');
        }
        return data.data;
      } catch (err) {
        throw err instanceof Error ? err : new Error('Failed to fetch playlists');
      }
    },
  });

  const { mutate: deletePlaylist } = useMutation({
    mutationFn: async (playlistId: string) => {
      const response = await fetch(`/api/collection/${playlistId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete playlist');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
    },
  });

  const isLoggedIn = getCookie('session');
  if (!isLoggedIn) {
    redirectToLogin();
    return null;
  }

  if (isLoading) return <div>Loading...</div>;
  if (error) return (
    <div className="p-4 text-center">
      <div className="text-[--md-sys-color-error] mb-2">
        <span className="material-symbols-outlined">error</span>
      </div>
      <div className="text-[--md-sys-color-error]">
        {error.message || 'Error loading playlists'}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
      <button
        onClick={() => setEditingPlaylist({ id: '', title: '', type: "Playlist", owner: {id: "", username: ""}, thumbnailurl: '' })}
        className="aspect-square flex flex-col items-center justify-center rounded-lg bg-[--md-sys-color-surface-container] hover:bg-[--md-sys-color-surface-container-high] transition-colors gap-2"
      >
        <span className="material-symbols-outlined text-4xl">add</span>
        <span>Create New Playlist</span>
      </button>

      {Array.isArray(playlists) && playlists.filter((p) => p.type === "Playlist").map((playlist) => (
        <PlaylistCard
          key={playlist.id}
          {...playlist}
          onEdit={() => setEditingPlaylist(playlist)}
          onDelete={() => deletePlaylist(playlist.id)}
        />
      ))}

      {editingPlaylist && (
        <DialogFrame onClose={() => setEditingPlaylist(null)}>
          <PlaylistForm
            id={editingPlaylist.id || undefined}
            initialData={editingPlaylist}
            onSuccess={() => setEditingPlaylist(null)}
            onCancel={() => setEditingPlaylist(null)}
          />
        </DialogFrame>
      )}
    </div>
  );
}
