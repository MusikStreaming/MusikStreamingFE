import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getCookie } from 'cookies-next';
import Input from '../inputs/outlined-input';
import DialogFrame from './dialog-frame';
import { Artist } from '@/app/model/artist';

interface EditArtistDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  artist: Artist;
}

const EditArtistDialog: React.FC<EditArtistDialogProps> = ({ isOpen, onClose, onSuccess, artist }) => {
  const queryClient = useQueryClient();
  const [name, setName] = useState(artist.name);
  const [avatarUrl, setAvatarUrl] = useState(artist.avatarurl || '');

  const editArtistMutation = useMutation({
    mutationFn: async () => {
      const token = getCookie('session_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/artist/${artist.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, avatarUrl }),
      });
      if (!response.ok) throw new Error('Failed to edit artist');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artists'] });
      onSuccess();
      onClose();
    },
    onError: (error) => {
      console.error('Error editing artist:', error);
    },
  });

  const handleSave = () => {
    editArtistMutation.mutate();
  };

  if (!isOpen) return null;

  return (
    <DialogFrame onClose={onClose}>
      <h2 className="text-xl font-bold mb-4">Edit Artist</h2>
      <Input
        label="Name"
        value={name}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
        required={true}
        placeholder="Enter artist name"
        leadingIcon={null}
        trailingIcon={null}
      />
      <Input
        label="Avatar URL"
        value={avatarUrl}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAvatarUrl(e.target.value)}
        required={true}
        placeholder="Enter avatar URL"
        leadingIcon={null}
        trailingIcon={null}
      />
      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={handleSave}
          disabled={editArtistMutation.isPending || !name || !avatarUrl}
          className="px-4 py-2 bg-[--md-sys-color-primary] text-[--md-sys-color-on-primary] rounded-md disabled:opacity-50 flex items-center gap-2"
        >
          {editArtistMutation.isPending && (
            <div className="animate-spin h-4 w-4 border-2 border-[--md-sys-color-on-primary] border-t-transparent rounded-full" />
          )}
          Save
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

export default EditArtistDialog;
