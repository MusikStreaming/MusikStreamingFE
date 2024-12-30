'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getCookie } from 'cookies-next';
import DialogFrame from './dialog-frame';

interface AddPlaylistDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddPlaylistDialog({ isOpen, onClose, onSuccess }: AddPlaylistDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async () => {
      const token = getCookie('session_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/collection`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          type: 'Playlist'
        }),
      });
      
      if (!response.ok) throw new Error('Failed to create playlist');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      onSuccess();
      onClose();
      setTitle('');
      setDescription('');
    },
  });

  return (
    <DialogFrame onClose={onClose}>
      <form onSubmit={(e) => {
        e.preventDefault();
        createMutation.mutate();
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
            disabled={createMutation.isPending}
            className="px-4 py-2 rounded-md bg-[--md-sys-color-primary] 
                     text-[--md-sys-color-on-primary]"
          >
            {createMutation.isPending ? 'Creating...' : 'Create'}
          </button>
        </div>
      </form>
    </DialogFrame>
  );
}
