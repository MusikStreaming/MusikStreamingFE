import React, { useState, useEffect, useMemo } from 'react';
import { getCookie } from 'cookies-next';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import countryList from 'react-select-country-list';
import { Artist } from '@/app/model/artist';
import DialogFrame from './dialog-frame';
import Input from '../inputs/outlined-input';
import DragNDropZone from '../inputs/dragndropzone';
import fetchArtistById from '@/app/api-fetch/artist-by-id';
import Dropdown from '../inputs/dropdown';

interface EditArtistDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  artist: Artist;
}

interface CountryOption {
  value: string;
  label: string;
}

const EditArtistDialog: React.FC<EditArtistDialogProps> = ({ isOpen, onClose, onSuccess, artist }) => {
  const queryClient = useQueryClient();
  const [artistData, setArtistData] = useState({
    name: '',
    description: '',
    country: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  
  // Get country options using react-select-country-list
  const countries = useMemo(() => {
    return countryList().getData().map(country => ({
      value: country.value,
      label: country.label
    }));
  }, []);

  // Fetch artist data
  const { data: fetchedArtist, isLoading } = useQuery({
    queryKey: ['artist', artist.id],
    queryFn: () => fetchArtistById(artist.id),
    enabled: isOpen,
  });

  // Update local state when fetched data arrives
  useEffect(() => {
    if (fetchedArtist) {
      setArtistData({
        name: fetchedArtist.name,
        description: fetchedArtist.description || '',
        country: fetchedArtist.country || '',
      });
      setAvatarPreview(fetchedArtist.avatarurl || '');
    }
  }, [fetchedArtist]);

  const handleCountryChange = (option: CountryOption | null) => {
    setArtistData(prev => ({
      ...prev,
      country: option?.value || ''
    }));
  };

  const updateArtistMutation = useMutation({
    mutationFn: async () => {
      const token = getCookie('session_token');
      const formData = new FormData();
      formData.append('name', artistData.name);
      formData.append('description', artistData.description);
      formData.append('country', artistData.country);
      if (avatarFile) {
        formData.append('file', avatarFile);
      }

      const response = await fetch(`/api/artist/${artist.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      if (!response.ok) throw new Error('Failed to update artist');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artists'] });
      onSuccess();
      onClose();
    },
  });

  const handleAvatarChange = (files: File[]) => {
    const file = files[0];
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateArtistMutation.mutate();
  };

  if (!isOpen) return null;

  return (
    <DialogFrame onClose={onClose}>
      <h2 className="text-xl font-bold mb-4">Edit Artist</h2>
      {isLoading ? (
        <div className="flex justify-center items-center p-4">
          <div className="animate-spin h-8 w-8 border-4 border-[--md-sys-color-primary] border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <DragNDropZone
            onDrop={handleAvatarChange}
            supportText="Artist Avatar"
            avatarPreview={avatarPreview}
            supportedTypes={['image/*']}
          />

          <Input
            type="text"
            value={artistData.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setArtistData({ ...artistData, name: e.target.value })}
            className="w-full"
            title="Artist Name"
            label="Name"
            leadingIcon={null}
            trailingIcon={null}
            required
          />

          <div className="space-y-2">
            <label className="text-sm text-[--md-sys-color-on-surface-variant]">Country</label>
            <Dropdown
              defaultValue={countries.find(c => c.value === artistData.country) || null} 
              options={countries}
              value={countries.find(c => c.value === artistData.country) || null}
              onChange={handleCountryChange}
            />
          </div>

          <textarea
            value={artistData.description}
            onChange={(e) => setArtistData({ ...artistData, description: e.target.value })}
            className="w-full p-2 rounded-md bg-[--md-sys-color-surface-container] text-[--md-sys-color-on-surface]"
            placeholder="Artist Description"
            rows={4}
          />

          <div className="flex justify-end gap-2">
            <button
              type="submit"
              disabled={updateArtistMutation.isPending || !artistData.name}
              className="px-4 py-2 bg-[--md-sys-color-primary] text-[--md-sys-color-on-primary] rounded-md disabled:opacity-50"
            >
              {updateArtistMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[--md-sys-color-surface-variant] text-[--md-sys-color-on-surface-variant] rounded-md"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </DialogFrame>
  );
};

export default EditArtistDialog;
