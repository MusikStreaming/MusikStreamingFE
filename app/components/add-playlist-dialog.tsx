'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import createPlaylist from '@/app/api-fetch/create-playlist';
import Input from './inputs/outlined-input';
import DialogFrame from './dialogs/dialog-frame';

interface AddPlaylistDialogProps {
  onClose: () => void;
}

export default function AddPlaylistDialog({ onClose }: AddPlaylistDialogProps) {
  const [newPlaylistTitle, setNewPlaylistTitle] = useState<string>('');
  const [newPlaylistDescription, setNewPlaylistDescription] = useState<string>('');
  const [newPlaylistThumbnail, setNewPlaylistThumbnail] = useState<File | null>(null);
  const createMutation = useMutation({
    mutationFn: createPlaylist,
    onSuccess: () => {
      onClose();
    },
  });

  const handleCreateAndAdd = () => {
    if (newPlaylistTitle) {
      createMutation.mutate({
        title: newPlaylistTitle,
        description: newPlaylistDescription,
        file: newPlaylistThumbnail || undefined,
      });
    }
  };

  return (
    <DialogFrame onClose={onClose}>
      <div className="add-playlist-dialog p-4 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Create New Playlist</h2>
        <div className="mb-4">
          <Input
            value={newPlaylistTitle}
            label="Playlist Title"
            leadingIcon={null}
            trailingIcon={null}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPlaylistTitle(e.target.value)}
            className="w-full mb-2"
          />
          <Input
            value={newPlaylistDescription}
            label="Description"
            leadingIcon={null}
            trailingIcon={null}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPlaylistDescription(e.target.value)}
            className="w-full mb-2"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setNewPlaylistThumbnail(e.target.files ? e.target.files[0] : null)}
            className="w-full mb-2"
            aria-label='Image'
          />
          <button
            className="w-full p-2 bg-[--md-sys-color-secondary] text-[--md-sys-color-on-secondary] rounded"
            onClick={handleCreateAndAdd}
            disabled={!newPlaylistTitle}
            type="button"
          >
            Create and Add
          </button>
        </div>
        <div className="flex justify-end gap-2">
          <button
            className="p-2 bg-[--md-sys-color-outline-variant] rounded"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </DialogFrame>
  );
}
