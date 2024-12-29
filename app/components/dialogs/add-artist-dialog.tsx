import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getCookie } from 'cookies-next';
import { SingleValue } from 'react-select';
import Input from '../inputs/outlined-input';
import DialogFrame from './dialog-frame';
import DragNDropZone from '../inputs/dragndropzone';
import countryList from 'react-select-country-list';
import Dropdown from '../inputs/dropdown';

interface CountryOption {
  label: string;
  value: string;
}

interface AddArtistDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddArtistDialog: React.FC<AddArtistDialogProps> = (
  { isOpen, onClose, onSuccess }
) => {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [country, setCountry] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const addArtistMutation = useMutation({
    mutationFn: async () => {
      const token = getCookie('session_token');
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('country', country);
      if (avatarFile) formData.append('file', avatarFile);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/artist`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to add artist');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artists'] });
      onSuccess();
      onClose();
    },
    onError: (error) => {
      console.error('Error adding artist:', error);
    },
  });

  const handleSave = () => {
    addArtistMutation.mutate();
  };

  const handleDrop = (acceptedFiles: File[]) => {
    setAvatarFile(acceptedFiles[0]);
    setAvatarUrl(URL.createObjectURL(acceptedFiles[0]));
  };

  const handleCountryChange = (selectedOption: SingleValue<CountryOption>) => {
    setCountry(selectedOption?.value || '');
  };

  if (!isOpen) return null;

  return (
    <DialogFrame onClose={onClose}>
      <h2 className="text-xl font-bold mb-4">Add Artist</h2>
      <DragNDropZone
        onDrop={handleDrop}
        avatarPreview={avatarUrl}
        supportText="Drag 'n' drop an avatar image here, or click to select one"
        supportedTypes="image/*"
      />
      <Input
        label="Name"
        value={name}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
        required={true}
        placeholder="Enter artist name"
        leadingIcon={null}
        trailingIcon={null}
        className="w-full"
      />
      <Input
        label="Description"
        value={description}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
        required={true}
        placeholder="Enter description"
        leadingIcon={null}
        trailingIcon={null}
        multiline={true}
        className="w-full"
      />
      <Dropdown
        options={countryList().getData() as CountryOption[]}
        defaultValue={country}
        onChange={handleCountryChange}
      />
      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={handleSave}
          disabled={addArtistMutation.isPending || !name || !avatarUrl || !country}
          className="px-4 py-2 bg-[--md-sys-color-primary] text-[--md-sys-color-on-primary] rounded-md disabled:opacity-50 flex items-center gap-2"
        >
          {addArtistMutation.isPending && (
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

export default AddArtistDialog;