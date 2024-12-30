'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import DragNDropZone from '../inputs/dragndropzone';

interface PlaylistFormProps {
  id?: string;
  initialData?: {
    title: string;
    description?: string;
    coverImage?: string;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function PlaylistForm({ id, initialData, onSuccess, onCancel }: PlaylistFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(initialData?.coverImage || '');
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      try {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('type', 'Playlist');
        if (image) {
          formData.append('file', image);
        }

        const response = await fetch(`/api/collection/${id || ''}`, {
          method: id ? 'POST' : 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(await response.text() || 'Failed to save playlist');
        }

        // return response.json();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      setError(null);
      onSuccess?.();
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Failed to save playlist');
    },
  });

  const handleImageDrop = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      setImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  return (
    <form className="flex flex-col gap-4 p-4" onSubmit={(e) => {
      e.preventDefault();
      mutate();
    }}>
      {error && (
        <div className="p-3 rounded bg-[--md-sys-color-error-container] text-[--md-sys-color-on-error-container]">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label>Cover Image</label>
        <DragNDropZone
          onDrop={handleImageDrop}
          supportedTypes="image/*"
          avatarPreview={previewUrl}
          supportText="Drag and drop an image here"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="title">Title *</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="px-3 py-2 rounded bg-[--md-sys-color-surface-container-high]"
          required
          disabled={isPending}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="px-3 py-2 rounded bg-[--md-sys-color-surface-container-high]"
          disabled={isPending}
        />
      </div>

      <div className="flex gap-2 justify-end mt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded hover:bg-[--md-sys-color-surface-container-highest]"
          disabled={isPending}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending || !title.trim()}
          className="px-4 py-2 rounded bg-[--md-sys-color-primary] text-[--md-sys-color-on-primary] disabled:opacity-50"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin"></span>
              Saving...
            </span>
          ) : 'Save'}
        </button>
      </div>
    </form>
  );
}
