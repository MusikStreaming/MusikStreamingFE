'use client';

import { useState } from 'react';
import UsersTable from './components/UsersTable';
import SongsTable from './components/SongsTable';
import AlbumsTable from './components/AlbumsTable';
import PlaylistsTable from './components/PlaylistsTable';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div>
      <div className="flex gap-4 mb-4">
        {['users', 'songs', 'albums', 'playlists'].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded ${
              activeTab === tab 
                ? 'bg-[--md-sys-color-primary] text-[--md-sys-color-on-primary]' 
                : 'bg-[--md-sys-color-surface-variant]'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'users' && <UsersTable />}
      {activeTab === 'songs' && <SongsTable />}
      {activeTab === 'albums' && <AlbumsTable />}
      {activeTab === 'playlists' && <PlaylistsTable />}
    </div>
  );
}
