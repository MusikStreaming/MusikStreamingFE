'use client';

import { useState, useEffect } from 'react';
import { deleteCookie, getCookie } from 'cookies-next';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import fetchUserById from '@/app/api-fetch/user-by-id';

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
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await fetchUserById(getCookie('access_token') as string);
      setUser(user);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const checkManagerStatus = () => {
      const role = getCookie('role');
      const isManagerRole = decodeURIComponent(String(role)) === 'Artist Manager';
      setIsManager(isManagerRole);
    };

    const checkManagerPath = () => {
      setIsManagerPath(pathname?.startsWith('/manager'));
    };

    checkManagerStatus();
    checkManagerPath();

    window.addEventListener('popstate', checkManagerStatus);
    
    return () => {
      window.removeEventListener('popstate', checkManagerStatus);
    };
  }, [pathname]);

  const handleLogout = async () => {
    try {
      setIsOpen(false);
      
      deleteCookie('access_token');
      deleteCookie('refresh_token');
      deleteCookie('role');
      
      onLogout();
      
      await router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full overflow-hidden border-2 border-[--md-sys-color-outline]"
        title="Open user menu"
        aria-label="Open user menu"
      >
        <Image
          src={user?.avatarurl || "/assets/default-avatar.png"}
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
              >
                <span className="material-symbols-outlined">{isManagerPath ? "exit_to_app" : "dashboard"}</span>
                <span className="text-sm font-medium">{isManagerPath ? "Exit Manager Dashboard" : "Manager Dashboard"}</span>
              </Link>
            )}
            <Link
              href={isManager ? "/manager/settings" : "/settings"}
              className="px-4 py-2 text-sm hover:bg-[--md-sys-color-surface-variant] rounded-md flex items-center gap-2"
              role="menuitem"
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