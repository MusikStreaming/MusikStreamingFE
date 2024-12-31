'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getCookie } from 'cookies-next';
import type { Playlist } from '@/app/model/playlist';
import DialogFrame from './dialog-frame';

interface EditPlaylistDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  playlist: Playlist;
}

export default function EditPlaylistDialog({ isOpen, onClose, onSuccess, playlist }: EditPlaylistDialogProps) {
  const [title, setTitle] = useState(playlist.title);
  const [description, setDescription] = useState(playlist.description || '');
  const queryClient = useQueryClient();

  useEffect(() => {
    setTitle(playlist.title);
    setDescription(playlist.description || '');
  }, [playlist]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const token = getCookie('session_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/collection/${playlist.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to update playlist');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      onSuccess();
      onClose();
    },
  });

  return (
    <DialogFrame onClose={onClose}>
      <form onSubmit={(e) => {
        e.preventDefault();
        updateMutation.mutate();
      }}
      className="space-y-4"
      >
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-[--md-sys-color-on-surface]">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md bg-[--md-sys-color-surface-container] 
                     text-[--md-sys-color-on-surface] p-2"
            required
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-[--md-sys-color-on-surface]">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full rounded-md bg-[--md-sys-color-surface-container] 
                     text-[--md-sys-color-on-surface] p-2"
            rows={3}
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-[--md-sys-color-surface-container] 
                     text-[--md-sys-color-on-surface]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="px-4 py-2 rounded-md bg-[--md-sys-color-primary] 
                     text-[--md-sys-color-on-primary]"
          >
            {updateMutation.isPending ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </DialogFrame>
  );
}
