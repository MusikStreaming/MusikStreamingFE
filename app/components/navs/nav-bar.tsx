'use client';

import React, { useState, useEffect, useRef } from 'react';
import { getCookie, hasCookie } from 'cookies-next';
import UserMenu from '@/app/components/navs/user-menu';
import IconSmallButton from '../buttons/icon-small-button';
import FilledButton from '@/app/components/buttons/filled-button';
import SearchBox from '@/app/components/inputs/search-box';
import { useRouter, usePathname } from 'next/navigation';
import { redirectToLogin } from '@/app/services/auth.service';
import Image from 'next/image';
import { useSearch } from '@/app/hooks/useSearch';

export default function NavBar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<{
    username: string;
    role?: string;
  } | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchFocus = useRef<HTMLInputElement>(null);
  const { searchQuery, handleSearchChange } = useSearch();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const hasSession = hasCookie('session');
        const sessionValue = getCookie('session');
        const isAuthenticated = hasSession && sessionValue === 'true';
        
        setIsLoggedIn(isAuthenticated);

        if (isAuthenticated) {
          // Fetch user data from our API
          const response = await fetch('/api/user/profile', {
            credentials: 'include'
          });
          const userData = await response.json();
          setUserData({
            username: userData.username || '',
            role: userData.role
          });
        } else {
          setUserData(null);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsLoggedIn(false);
        setUserData(null);
      }
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  useEffect(() => {
    if ((pathname == "/search" || pathname == "/manager/discography") && searchFocus.current && window.innerWidth > 768) {
      searchFocus.current.focus();
    }
  }, [pathname]);

  const handleLoginClick = () => {
    redirectToLogin(pathname);
  };

  return (
    <div className="nav-bar flex flex-grow-0 pl-4 md:pl-0 pt-3 items-center justify-between w-full top-0 max-h-24 sticky bg-inherit z-[1000]" autoFocus={true}>
      <div className='flex mr-3'>
        <div className="nav-bar-button-container hidden md:flex md:p-3 md:gap-3 md:items-center">
          <IconSmallButton className="app-bar-button" onClick={() => {
            router.back();
          }}>
            <span className="material-symbols-outlined">
              arrow_back
            </span>
          </IconSmallButton>
          <IconSmallButton onClick={() => {
            router.forward();
          }}>
            <span className="material-symbols-outlined">
              arrow_forward
            </span>
          </IconSmallButton>
        </div>
        <div className="nav-bar-title-container flex items-center gap-3">
          <Image width={64} height={64} src={"/assets/rounded-logo.png"} priority alt="logo" />
          <h1 className="hidden lg:block nav-bar-title text-lg font-bold">
            {"MusikStreaming"}
          </h1>
        </div>
      </div>

      <div className="search-and-browse-container flex justify-center gap-4 flex-grow">
        <div className="search-and-browse-inner flex-grow flex items-center sm:justify-center">
          <SearchBox 
            className='hidden md:flex' 
            placeholder="Search" 
            ref={searchFocus}
            text={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>
      <div className="nav-bar-button-container flex p-3 gap-3 items-center">
        {isLoggedIn && userData ? (
          <>
            <span className="text-sm font-medium">{userData.username}</span>
            <UserMenu onLogout={() => {
              setIsLoggedIn(false);
              setUserData(null);
            }} />
          </>
        ) : (
          <FilledButton onClick={handleLoginClick}>
            {"Đăng nhập/Đăng ký"}
          </FilledButton>
        )}
      </div>
    </div>
  );
}