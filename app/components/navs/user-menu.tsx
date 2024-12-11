'use client';

import { useState, useEffect } from 'react';
import { getCookie } from 'cookies-next';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface User {
  id: string;
  username: string;
  country: string;
  role?: string;
  avatarurl?: string;
}

interface UserMenuProps {
  onLogout: () => void;
}

export default function UserMenu({ onLogout }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isManagerPath, setIsManagerPath] = useState(false);
  const [isManager, setIsManager] = useState(false);
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [avatarUrl, setAvatarUrl] = useState <string | null>(null);

  useEffect(() => {
    const checkManagerStatus = async () => {
      try {
        const response = await fetch('/api/auth/user-info', {
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error('Failed to check manager status');
        }
        const { manager: managerStatus, avatarUrl: avatar } = await response.json();
        setIsManager(managerStatus);
        // set
      } catch (error) {
        console.error('Error checking manager status:', error);
        setIsManager(false);
      }
    };

    checkManagerStatus();
    setIsManagerPath(pathname?.startsWith('/manager'));
  }, [pathname]);

  // setAvatarUrl(getCookie('avatarurl'));

  const handleLogout = async () => {
    try {
      setIsOpen(false);

      // Call logout endpoint
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      // Clear client state
      setIsManager(false);
      setUser(null);

      // Notify parent
      onLogout();

      // Redirect
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

useEffect(() => {
  const setAvatar = async () => {
    const data = await getCookie('avatarurl') || '/assets/default-avatar.png';
    setAvatarUrl(data);
  };
  setAvatar();
}, []);

return (
  <div className="relative">
    <button
      onClick={() => setIsOpen(!isOpen)}
      className="flex items-center justify-center w-10 h-10 rounded-full overflow-hidden border-2 border-[--md-sys-color-outline]"
      title="Open user menu"
      aria-label="Open user menu"
    >
      <Image
        src={avatarUrl!}
        alt="User avatar"
        width={40}
        height={40}
      />
    </button>

    {isOpen && (
      <div className="absolute right-0 mt-2 w-48 rounded-xl shadow-lg bg-[--md-sys-color-surface] ring-1 ring-black ring-opacity-5 px-2">
        <div className="py-1 rounded-xl" role="menu">
          {isManager && (
            <Link
              href={isManagerPath ? "/" : "/manager"}
              className="px-4 py-2 text-sm hover:bg-[--md-sys-color-surface-variant] rounded-md flex items-center gap-2"
              role="menuitem"
              onClick={() => setIsOpen(false)}
            >
              <span className="material-symbols-outlined">
                {isManagerPath ? "exit_to_app" : "dashboard"}
              </span>
              <span className="text-sm font-medium">
                {isManagerPath ? "Thoát chế độ quản lý" : "Bảng điều khiển"}
              </span>
            </Link>
          )}
          <Link
            href={pathname === "/manager" ? "/manager/settings" : "/settings"}
            className="px-4 py-2 text-sm hover:bg-[--md-sys-color-surface-variant] rounded-md flex items-center gap-2"
            role="menuitem"
            onClick={() => setIsOpen(false)}
          >
            <span className="material-symbols-outlined">settings</span>
            <span className="text-sm font-medium">Cài đặt</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-sm text-[--md-sys-color-error] hover:bg-[--md-sys-color-surface-variant] rounded-md flex items-center gap-2"
            role="menuitem"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="text-sm font-medium">Đăng xuất</span>
          </button>
        </div>
      </div>
    )}
  </div>
);
}