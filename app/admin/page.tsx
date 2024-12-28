'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import UsersTable from './components/UsersTable';
import SongsTable from './components/SongsTable';
import AlbumsTable from './components/AlbumsTable';
import PlaylistsTable from './components/PlaylistsTable';
import ArtistTable from './components/ArtistTable';
import { Suspense } from 'react';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('users');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function checkAdmin() {
      try {
        console.group('🔒 Admin Page Access Check');
        setIsLoading(true);
        setError(null);

        // First verify user info
        const userResponse = await fetch('/api/auth/user-info', {
          credentials: 'include'
        });
        
        if (!userResponse.ok) {
          console.error('❌ User info check failed:', userResponse.status);
          throw new Error('Failed to verify user');
        }

        const userData = await userResponse.json();
        console.log('👤 User data:', userData);

        if (!userData.authenticated) {
          console.warn('⚠️ User not authenticated');
          router.replace('/login');
          return;
        }

        if (!userData.admin) {
          console.warn('⚠️ User not admin:', userData.role);
          router.replace('/');
          return;
        }

        // Double check with admin endpoint
        const adminResponse = await fetch('/api/auth/admin', {
          credentials: 'include'
        });

        if (!adminResponse.ok) {
          console.error('❌ Admin check failed:', adminResponse.status);
          throw new Error('Failed to verify admin status');
        }

        const adminData = await adminResponse.json();
        console.log('👑 Admin check result:', adminData);

        if (!adminData.isAdmin) {
          console.warn('⚠️ Not an admin');
          router.replace('/');
          return;
        }

        console.log('✅ Admin access granted');
        setIsAdmin(true);
      } catch (err) {
        console.error('❌ Admin verification error:', err);
        setError(err instanceof Error ? err.message : 'Failed to verify admin status');
        router.replace('/');
      } finally {
        setIsLoading(false);
        console.groupEnd();
      }
    }

    checkAdmin();
  }, [router]);

  if (isLoading) {
    return <div>Verifying admin access...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <Suspense>
      <div>
        <div className="flex gap-4 mb-4 w-full overflow-x-auto scrollbar-hide">
        <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          height: 4px;
          display: none;
        }
        
        .scrollbar-hide:hover::-webkit-scrollbar {
          display: block;
        }

        .scrollbar-hide::-webkit-scrollbar-track {
          background: transparent;
        }

        .scrollbar-hide::-webkit-scrollbar-thumb {
          background: var(--md-sys-color-outline-variant);
          border-radius: 2px;
        }

        .scrollbar-hide::-webkit-scrollbar-button {
          display: none;
        }

        .scrollbar-hide {
          scrollbar-width: thin;
          scrollbar-color: var(--md-sys-color-outline-variant) transparent;
        }
      `}</style>
          {['users', 'artists', 'songs', 'albums', 'playlists'].map((tab) => (
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
        {activeTab === 'artists' && <ArtistTable/>}
        {activeTab === 'songs' && <SongsTable />}
        {activeTab === 'albums' && <AlbumsTable />}
        {activeTab === 'playlists' && <PlaylistsTable />}
      </div>
    </Suspense>
  );
}
