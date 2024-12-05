'use client'
import Image from 'next/image';
import IconSmallButton from '@/app/components/buttons/icon-small-button';
import PassiveProgress from '@/app/components/audio/passive-progress';
import PlayButton from '@/app/components/buttons/play-button-main';
import ToggleIconButtonDotted from '@/app/components/buttons/toggle-icon-button-dotted';
import { useMedia } from '@/app/contexts/media-context';
import { processTime } from '@/app/utils/time';
import { twMerge } from 'tailwind-merge';
import { useState, useEffect } from 'react';
import { getCookie } from 'cookies-next/client';

export default function SongControl() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { currentSong, isPlaying, isLoading, progress, volume, pauseSong, resumeSong, seekTo, setVolume } = useMedia();

  useEffect(() => {
    const checkAuth = () => {
      const accessToken = getCookie("access_token");
      setIsAuthenticated(!!accessToken);
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  // if (!isAuthenticated) {
  //   return null;
  // }

  const isEmpty = !currentSong;
  const isDisabled = isEmpty || isLoading;

  return (
    <div className='song-playing z-[1000] bg-[--md-sys-color-inverse-on-surface] flex-col'>
      <div className="p-4 gap-4 flex flex-wrap items-center justify-between">
        <div className="song-title flex items-center gap-2 w-1/3 md:w-1/6">
          <div className={twMerge(
            "relative",
            (isLoading || isEmpty) && "opacity-50",
            isLoading && "animate-pulse"
          )}>
            <Image 
              src={"/assets/placeholder.jpg"} 
              alt="song-playing" 
              width={64} 
              height={64}
              className={twMerge(
                "transition-opacity duration-200",
                (isLoading || isEmpty) && "grayscale"
              )}
            />
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          <div className={twMerge(
            "song-title-info",
            (isLoading || isEmpty) && "opacity-50"
          )}>
            <p className="song-title-text">
              {currentSong?.title || "No song selected"}
            </p>
          </div>
          <span className={twMerge(
            "material-symbols-outlined hidden lg:block",
            (isLoading || isEmpty) && "opacity-50"
          )}>favorite</span>
        </div>
        <div className="song-controls-container flex-col w-1/3">
          <div className="song-controls flex items-center justify-end md:justify-center gap-4">
            <IconSmallButton disabled={isDisabled}>
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
            />
            <IconSmallButton disabled={isDisabled}>
              <span className={twMerge(
                "material-symbols-outlined-filled",
                isDisabled && "opacity-50"
              )}>skip_next</span>
            </IconSmallButton>
          </div>
          <div className="song-progress md:flex items-center gap-4 hidden">
            <p className={isDisabled ? "opacity-50" : ""}>
              {isEmpty ? "0:00" : processTime(progress)}
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
              disabled={isDisabled}
            />
            <p className={isDisabled ? "opacity-50" : ""}>
              {isEmpty ? "0:00" : (currentSong?.duration ? processTime(currentSong.duration) : '0:00')}
            </p>
          </div>
        </div>
        <div className="right-controls w-1/6 items-end justify-end hidden md:flex">
          <ToggleIconButtonDotted>
            <span className={isDisabled ? "opacity-50" : ""}>lyrics</span>
          </ToggleIconButtonDotted>
          <ToggleIconButtonDotted>
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
              )}>volume_up</span>
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
              onChange={(e) => setVolume(parseInt(e.target.value) / 100)}
              disabled={isDisabled}
            />
          </div>
        </div>
      </div>
      <PassiveProgress className='md:hidden'/>
    </div>
  )
}