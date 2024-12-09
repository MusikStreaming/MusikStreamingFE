'use client'
import Image from 'next/image';
import { useMedia } from '@/app/contexts/media-context';
import { formatDuration } from '@/app/utils/time';
import { twMerge } from 'tailwind-merge';
import { useState, useEffect, useCallback, useRef } from 'react';
import { getCookie } from 'cookies-next/client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import IconSmallButton from '@/app/components/buttons/icon-small-button';
import PassiveProgress from '@/app/components/audio/passive-progress';
import PlayButton from '@/app/components/buttons/play-button-main';
import ToggleIconButtonDotted from '@/app/components/buttons/toggle-icon-button-dotted';

import { useLiked } from '@/app/contexts/liked-context';
import { Song } from '@/app/model/song';
import ToggleButtonFilled from '../buttons/toggle-button';

export default function SongControl() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [shouldHide, setShouldHide] = useState(false);
  const {
    currentSong,
    isPlaying,
    isLoading,
    progress,
    volume,
    pauseSong,
    resumeSong,
    seekTo,
    setVolume,
    toggleQueue,
    isQueueVisible,
    handleSeekStart,
    handleSeekEnd,
    isDragging,
    playPreviousSong,
    playNextSong,
  } = useMedia();

  const { likedSongs, addLikedSong, removeLikedSong } = useLiked();

  const pathname = usePathname();
  const router = useRouter();

  const [isMuted, setIsMuted] = useState(false);
  const [volumeBeforeMute, setVolumeBeforeMute] = useState(volume);

  const [isOverflowing, setIsOverflowing] = useState(false);
  const titleRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const checkAuth = () => {
      const session = getCookie("session");
      setIsAuthenticated(!!session);
    };

    const handleResize = () => {
      setShouldHide(pathname.includes('/song') && window.innerWidth < 768);
    };

    checkAuth();
    handleResize(); // Initial check

    window.addEventListener('storage', checkAuth);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('resize', handleResize);
    };
  }, [pathname]);

  const isEmpty = !currentSong;
  const isDisabled = isEmpty || isLoading;

  const handleSongTitleClick = useCallback(async (e: React.MouseEvent) => {
    if (window.innerWidth < 768 && currentSong?.id) {
      e.preventDefault();

      // Get the song control element
      const songControl = document.querySelector('.song-playing');
      if (!songControl) return;

      // Navigate to song page
      router.push(`/song/${currentSong.id}`);
    }
  }, [currentSong, router]);

  // Add effect to check for overflow
  useEffect(() => {
    const checkOverflow = () => {
      if (titleRef.current) {
        const isTextOverflowing = titleRef.current.scrollWidth > titleRef.current.clientWidth;
        setIsOverflowing(isTextOverflowing);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);

    return () => {
      window.removeEventListener('resize', checkOverflow);
    };
  }, [currentSong]); // Re-check when song changes

  const handleImageClick = useCallback((e: React.MouseEvent) => {
    if (currentSong?.id) {
      handleSongTitleClick(e);
    }
  }, [currentSong, handleSongTitleClick]);

  return (
    <div className={twMerge(
      'song-playing z-[1000] bg-[--md-sys-color-inverse-on-surface] flex-col transition-transform duration-300',
      shouldHide && 'hidden'
    )}>
      <div className="p-4 gap-4 flex flex-wrap items-center justify-between">
        <div className="song-title flex items-center gap-2 w-fit md:w-1/4">
          <div className={twMerge(
            "relative cursor-pointer",
            (isLoading || isEmpty) && "opacity-50",
            isLoading && "animate-pulse"
          )} onClick={handleImageClick}>
            <div className="w-16 h-16">
              <Image
                src={currentSong?.coverImage || "/assets/placeholder.jpg"}
                alt={currentSong?.title || "song-playing"}
                width={64}
                height={64}
                className={twMerge(
                  "transition-opacity duration-200 w-16 h-16 md:w-[64px] md:h-[64px] object-cover",
                  (isLoading || isEmpty) && "grayscale",
                  "cursor-pointer"
                )}
                onClick={handleImageClick}
                placeholder="data:image/png;base64,/9j/4AAQSkZJRgABAQEBLAEsAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/wAALCABAAEABAREA/8QAGwABAAIDAQEAAAAAAAAAAAAAAAEIBgcJBQD/xAAuEAABAwQCAQIEBgMBAAAAAAABAgMEAAUGBxESCBMhCRQiMRUjQUJRgRhhcZH/2gAIAQEAAD8A6p0pUE8DmqdWf4m2nL15Uf42w7PLMNy4Gxx8q+bQYr11BKfQDXHb0lOD0kvBR5WR9PUhdXFB5HNTSlKVge+cln4bpPPcqtUhcedacbuUuK8j7tvIjLKFj/iuD/VVT85da6k0T4Ox7DjGL2uHdcdm2OLiMluM2mWLqmUyovJdA7KdWht9biuSV8rJ55q8jClqZQpxHRakgqT/AASPcf8AtfSlKUrU3lZk+D4v48Z+9sHKINhtVxx+4Wv5qUr2L0iM4htCEj6nHCojhCQVHj2Fc/dOXPbXxMvILD86y6wSLHprU640r5Raipmdc2kIUUKXwA8844kFQA6tMDr7KXy51aA4FTSlKx3YeeY3q/Br7sPL5pi2bHYD1xmupT2UGm0lRCU/uWfZKU/qogfrXMPUepdpfFH2bI3zvu4XCx6dsU5yPYMeiuqQJISodmGT7cD2Aflcd1q/Lb69fyrdeEWea4xfWp0EM6xwX3Asov2LR7d+JsCW/HYuL5jLSz27r7MONfUAeSDyeeatH96mlKVVX4oEK9zvCXYTdkDhLQtz0pLZ9zGRPYU5/QABP+gaxrb8ORZ/GPRvj7pLIl41a9nzbLiYvsE9XY9pcgrlSXmlD7vPIaUOeR2Li/fk81oK8/DA0rcNpbG03iVwvdlvkHFLLlGE3J+eXSVrVJjSW5KeAFpMiO0olASpHrDrwAEm3fw9dl5rtLxWxS97Dkvy8gtrkyyTJb6uzskxJC2ULWr9y+iUpUoklSkkk8k1ZGlKV52RY9ZMtsFxxfJLaxcLTd4rsGdEfTy2+w4kocbUP4KSR/dVKtHi7tzUdnia2sQsO1tYWG8sX3FbdfLs9aMhxiSy56jCYs1ttxt9DaivgLDZ6rUgkoJSfP3HO37ePIDWlwsmN2/VVwzK133ADkE6e1eHGUutN3BC2o7BQj1kfIvekXFlHdf1JIHCrRab1NiejtaWLVuEtPptNijlptyQsLfkOKUVuvuqAAU444ta1EADlR4AHArNKUpUE8AmuQPnt59+UmsvKS+4BgGUOYjYsQdjNxYaYDDvz/dht0vvqdQouJX3ISkEJCQPbtyo2l3HuGVn2JeI0+fARA2Jl2c4zkv4AzyH2opjOi4O9FfUhhLb6/dX6KAPPB4uyOOBx9qmlKUrSu//AA90L5Kuw7js7Dy9ebcgNQ7zAkrhz2UAlQR6qD9aQSSErCgkkkAEmo054h6a0rlEvP7HBvF9zCayYz2SZLdXrpcvR446JddPDY49j0AJHsSR7VuulK//2Q=="
              />
            </div>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          <div className="song-title-info md:w-full max-w-[200px] md:max-w-[300px] overflow-hidden">
            <p 
              ref={titleRef}
              className={twMerge(
                "song-title-text block whitespace-nowrap text-nowrap",
                isOverflowing && "hover:animate-marquee"
              )}
            >
              <Link
                href={currentSong?.id ? `/song/${currentSong.id}` : "#"}
                onClick={handleSongTitleClick}
                scroll={false}
                className="hover:text-[--md-sys-color-primary] hover:underline"
              >
                {currentSong?.title || "No song selected"}
              </Link>
            </p>
            {currentSong?.artists && currentSong.artists.length > 0 && (
              <p className="text-sm text-[--md-sys-color-outline]">
                {[...currentSong.artists].map((artist, index, array) => (
                  <span key={artist.artist.id}>
                    <Link
                      href={`/artist/${artist.artist.id}`}
                      className="hover:text-[--md-sys-color-primary] transition-colors"
                    >
                      {artist.artist.name}
                    </Link>
                    {index < array.length - 1 && ", "}
                  </span>
                ))}
              </p>
            )}
          </div>
          <ToggleButtonFilled className='hidden lg:flex' active={!!currentSong?.id && likedSongs.some(song => song.id === currentSong?.id)} onClick={() => !!currentSong?.id && likedSongs.some(song => song.id === currentSong?.id) ? removeLikedSong(currentSong as Song) : addLikedSong(currentSong as Song)}>
            favorite
          </ToggleButtonFilled>
        </div>
        <div className="song-controls-container flex-col w-1/3">
          <div className="song-controls flex items-center justify-end md:justify-center gap-4">
            <IconSmallButton disabled={isDisabled} onClick={playPreviousSong}>
              <span className={twMerge(
                "material-symbols-outlined-filled",
                isDisabled && "opacity-50"
              )}>skip_previous</span>
            </IconSmallButton>
            <PlayButton
              className={twMerge(
                "h-8 w-8 md:p-3 md:h-12 md:w-12 md:bg-[--md-sys-color-primary] md:text-[--md-sys-color-on-primary]",
                isDisabled && "opacity-50"
              )}
              onClick={() => isPlaying ? pauseSong() : resumeSong()}
              disabled={isDisabled}
              isPlaying={isPlaying}
              songId={currentSong?.id}
            />
            <IconSmallButton disabled={isDisabled} onClick={playNextSong}>
              <span className={twMerge(
                "material-symbols-outlined-filled",
                isDisabled && "opacity-50"
              )}>skip_next</span>
            </IconSmallButton>
          </div>
          <div className="song-progress md:flex items-center gap-4 hidden">
            <p className={isDisabled ? "opacity-50" : ""}>
              {isEmpty ? "0:00" : formatDuration(progress, true)}
            </p>
            <input
              className={twMerge(
                "w-full",
                isDisabled && "opacity-50"
              )}
              aria-label="song-progress"
              type="range"
              value={isEmpty ? 0 : progress}
              min={0}
              max={currentSong?.duration || 100}
              onChange={(e) => seekTo(parseInt(e.target.value))}
              onMouseDown={handleSeekStart}
              onMouseUp={handleSeekEnd}
              onTouchStart={handleSeekStart}
              onTouchEnd={handleSeekEnd}
              disabled={isDisabled}
            />
            <p className={isDisabled ? "opacity-50" : ""}>
              {isEmpty ? "0:00" : (currentSong?.duration ? formatDuration(currentSong.duration, true) : '0:00')}
            </p>
          </div>
        </div>
        <div className="right-controls w-1/4 items-end justify-end hidden md:flex">
          <ToggleIconButtonDotted>
            <span className={isDisabled ? "opacity-50" : ""}>lyrics</span>
          </ToggleIconButtonDotted>
          <ToggleIconButtonDotted onClick={toggleQueue} active={isQueueVisible}>
            <span className={twMerge(
              "material-symbols-outlined",
              isDisabled && "opacity-50"
            )}>queue_music</span>
          </ToggleIconButtonDotted>
          <div className="volume flex items-center">
            <IconSmallButton disabled={isDisabled}>
              <span className={twMerge(
                "material-symbols-outlined",
                isDisabled && "opacity-50"
              )} onClick={() => {
                if (volume === 0) {
                  setVolume(volumeBeforeMute);
                  setIsMuted(false);
                } else {
                  setVolume(0);
                  setIsMuted(true);
                }
              }}>{isMuted ? "volume_off" : "volume_up"}</span>
            </IconSmallButton>
            <input
              className={twMerge(
                "max-w-28 w-full",
                isDisabled && "opacity-50"
              )}
              aria-label="volume"
              type="range"
              value={volume * 100}
              min={0}
              max={100}
              onChange={(e) => {
                setVolume(Number.parseInt(e.target.value) / 100);
                setIsMuted(false);
                setVolumeBeforeMute(volume);
              }}
              disabled={isDisabled}
            />
          </div>
        </div>
      </div>
      <PassiveProgress className='md:hidden' />
    </div>
  )
}