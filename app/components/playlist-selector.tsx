'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import addToPlaylist from '@/app/api-fetch/add-to-playlist';
import PlainTooltip from '@/app/components/tooltips/plain-tooltip';
import IconSmallButton from '@/app/components/buttons/icon-small-button';
import OutlinedIcon from '@/app/components/icons/outlined-icon';
import Image from 'next/image';
import AddPlaylistDialog from './add-playlist-dialog';

interface Playlist {
  id: string;
  title: string;
  avatarurl?: string;
}

interface PlaylistSelectorProps {
  playlists: Playlist[];
  songId: string | undefined;
  onClose: () => void;
}

export default function PlaylistSelector({ playlists, songId, onClose }: PlaylistSelectorProps) {
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const [isAddPlaylistDialogOpen, setIsAddPlaylistDialogOpen] = useState(false);
  const addMutation = useMutation({
    mutationFn: addToPlaylist,
    onSuccess: () => {
      onClose();
    },
  });

  const handleAdd = () => {
    if (selectedPlaylist && songId) {
      addMutation.mutate({ playlistId: selectedPlaylist, songId });
    }
  };

  const handleAddPlaylistDialogClose = () => {
    setIsAddPlaylistDialogOpen(false);
  };

  return (
    <div className="playlist-selector p-4 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Select Playlist</h2>
      <ul className="mb-4">
        {Array.isArray(playlists) && playlists.map((playlist) => (
          <li key={playlist.id} className="flex items-center justify-between mb-2 p-2 rounded bg-gray-100">
            <div className="flex items-center gap-2">
              {playlist.avatarurl && (
                <Image
                  src={playlist.avatarurl}
                  alt={playlist.title}
                  width={40}
                  height={40}
                  className="rounded"
                />
              )}
              <span>{playlist.title}</span>
            </div>
            <PlainTooltip content="Add to Playlist">
              <IconSmallButton onClick={() => setSelectedPlaylist(playlist.id)}>
                <OutlinedIcon icon="add" />
              </IconSmallButton>
            </PlainTooltip>
          </li>
        ))}
      </ul>
      <div className="flex justify-end gap-2">
        <button
          className="p-2 bg-[--md-sys-color-outline-variant] rounded"
          onClick={() => setIsAddPlaylistDialogOpen(true)}
        >
          Add New Playlist
        </button>
        <button
          className="p-2 bg-[--md-sys-color-outline-variant] rounded"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
      {isAddPlaylistDialogOpen && (
        <AddPlaylistDialog onClose={handleAddPlaylistDialogClose} />
      )}
    </div>
  );
}
