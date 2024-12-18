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
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminPath, setIsAdminPath] = useState(false);
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const response = await fetch('/api/auth/user-info', {
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error('Failed to check user status');
        }
        const { artistManager, avatarUrl } = await response.json();
        setIsManager(artistManager);
        setAvatarUrl(avatarUrl);
      } catch (error) {
        console.error('Error checking user status:', error);
        setIsManager(false);
      }
    };

    checkUserStatus();
    setIsManagerPath(pathname?.startsWith('/manager'));
    // setIsAdminPath(pathname?.startsWith('/admin'));
  }, [pathname]);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await fetch('/api/auth/admin', {
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error('Failed to check admin status');
        }
        const { admin, artistManager } = await response.json();
        setIsManager(artistManager);
        setIsAdmin(admin);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsManager(false);
        setIsAdmin(false);
      }
    };
    checkAdmin();
    setIsAdminPath(pathname?.startsWith('/admin'));
  }, [pathname]);

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
      setIsAdmin(false);
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
      if (avatarUrl === null)
        setAvatarUrl(data);
    };
    setAvatar();
  }, [avatarUrl]);

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
          <div className="py-1 rounded-xl max-h-60 overflow-y-auto" role="menu">
            {isAdmin ? (
              <Link
                href={isAdminPath ? '/' : '/admin'}
                className="px-4 py-2 text-sm hover:bg-[--md-sys-color-surface-variant] rounded-md flex items-center gap-2"
                role="menuitem"
                onClick={() => setIsOpen(false)}
              >
                <span className="material-symbols-outlined">
                  {isAdminPath ? "exit_to_app" : "admin_panel_settings"}
                </span>
                <span className="text-sm font-medium">
                  {isAdminPath ? "Thoát khỏi trang quản trị" : "Vào trang dành cho quản trị viên"}
                </span>
              </Link>
            ) : isManager && (
              <Link
                href={isManagerPath ? '/' : '/manager'}
                className="px-4 py-2 text-sm hover:bg-[--md-sys-color-surface-variant] rounded-md flex items-center gap-2"
                role="menuitem"
                onClick={() => setIsOpen(false)}
              >
                <span className="material-symbols-outlined">
                  {isManagerPath ? "exit_to_app" : "dashboard"}
                </span>
                <span className="text-sm font-medium">
                  {isManagerPath ? "Thoát khỏi chế độ quản lý" : "Quản lý dành cho nghệ sĩ"}
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