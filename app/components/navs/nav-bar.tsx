'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { getCookie, hasCookie } from 'cookies-next';
import { useQuery } from '@tanstack/react-query';
import UserMenu from '@/app/components/navs/user-menu';
import IconSmallButton from '../buttons/icon-small-button';
import FilledButton from '@/app/components/buttons/filled-button';
import SearchBox from '@/app/components/inputs/search-box';
import { useRouter, usePathname } from 'next/navigation';
import { redirectToLogin } from '@/app/services/auth.service';
import Image from 'next/image';
import { useSearch } from '@/app/hooks/useSearch';
import OutlinedIcon from '../icons/outlined-icon';
import Link from 'next/link';

const fetchUserInfo = async () => {
  const hasSession = hasCookie('session');
  const sessionValue = getCookie('session');
  const isAuthenticated = hasSession && sessionValue === 'true';

  if (!isAuthenticated) {
    return { authenticated: false, username: null, role: null };
  }

  const response = await fetch('/api/auth/user-info', {
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user info');
  }

  return response.json();
};

export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchFocus = useRef<HTMLInputElement>(null);
  const { searchQuery, handleSearchChange } = useSearch();

  const { data: userInfo, isLoading } = useQuery({
    queryKey: ['userInfo'],
    queryFn: fetchUserInfo,
    refetchInterval: 60000 * 60, // Refetch every minute
    retry: false
  });

  const isLoggedIn = userInfo?.authenticated ?? false;
  const userData = isLoggedIn ? {
    username: userInfo.username,
    role: userInfo.role
  } : null;

  useEffect(() => {
    if ((pathname == "/search" || pathname == "/manager/discography") && searchFocus.current && window.innerWidth > 768) {
      searchFocus.current.focus();
    }
  }, [pathname]);

  const handleLoginClick = () => {
    redirectToLogin(pathname);
  };

  const shouldHide = pathname === '/login' || pathname === '/sign-up'
                    || pathname === '/forgot-password' || pathname === '/new-password' 
                    || pathname === '/verify-email'
                    || pathname.includes('/auth');

  return (
    <Suspense>
      <div className={`nav-bar flex flex-grow-0 pl-4 md:pl-0 pt-3 items-center justify-between w-full top-0 max-h-24 sticky bg-inherit z-[1000] ${shouldHide ? "hidden" : ""}`} autoFocus={true}>
        <div className='flex mr-3'>
          <div className="nav-bar-button-container hidden md:flex md:p-3 md:gap-3 md:items-center">
            <IconSmallButton className="app-bar-button" onClick={() => {
              router.back();
            }}>
              <OutlinedIcon icon='arrow_back'/>
            </IconSmallButton>
            <IconSmallButton onClick={() => {
              router.forward();
            }}>
              <OutlinedIcon icon='arrow_forward'/>
            </IconSmallButton>
          </div>
          <div className="nav-bar-title-container flex items-center gap-3">
            <Link href="/" className='flex items-center gap-3'>
              <Image width={64} height={64} src={"/assets/rounded-logo.png"} priority alt="logo" />
              <h1 className="hidden lg:block nav-bar-title text-lg font-bold">
                MusikStreaming
              </h1>
            </Link>
          </div>
        </div>
        <div className="search-and-browse-container flex justify-center gap-4 flex-grow">
          <div className="search-and-browse-inner flex-grow flex items-center sm:justify-center">
            <SearchBox
              className={"hidden md:flex bg-[--md-sys-color-surface] text-[--md-sys-color-on-surface]"}
              placeholder="Search"
              ref={searchFocus}
              text={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        </div>
        <div className="nav-bar-button-container flex p-3 gap-3 items-center">
          {!isLoading && (isLoggedIn && userData ? (
            <>
              <span className="text-sm font-medium">{userData.username}</span>
              <UserMenu 
                username={userData.username}
                onLogout={() => {
                  // The query will automatically refetch when auth state changes
                }} 
              />
            </>
          ) : (
            <FilledButton onClick={handleLoginClick}>
              {"Đăng nhập/Đăng ký"}
            </FilledButton>
          ))}
        </div>
      </div>
    </Suspense>
  );
}