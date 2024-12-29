'use client';

import { useMedia } from "../contexts/media-context";
import { useLiked } from "../contexts/liked-context";
import { useRouter } from "next/navigation";
import { formatDuration } from "@/app/utils/time";
import { twMerge } from "tailwind-merge";
import Image from "next/image";
import TextButton from "@/app/components/buttons/text-button";
import PlayButton from "@/app/components/buttons/play-button-main";
import IconSmallButton from "@/app/components/buttons/icon-small-button";
import ToggleButtonFilled from "@/app/components/buttons/toggle-button";
import ToggleIconButton from "@/app/components/buttons/toggle-icon-button";
import PlainTooltip from "@/app/components/tooltips/plain-tooltip";
import ArtistLinks from "@/app/components/info-links/artist-link";
import { Song } from "@/app/model/song";
import OutlinedIcon from "../components/icons/outlined-icon";
import OutlinedFilledIcon from "../components/icons/outlined-filled-icon";
import { useState, useEffect, useRef, TouchEvent } from "react";
import { useQuery } from "@tanstack/react-query";

export default function NowPlayingPage() {
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);
  const {
    currentSong,
    isPlaying,
    isLoading,
    progress,
    seekTo,
    pauseSong,
    resumeSong,
    toggleQueue,
    playPreviousSong,
    playNextSong
  } = useMedia();

  const { likedSongs, addLikedSong, removeLikedSong } = useLiked();

  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  // const 

  const handleTouchStart = (e: TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setIsSwiping(true);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isSwiping) return;
    
    const currentTouch = e.targetTouches[0].clientX;
    const offset = currentTouch - touchStart;
    
    if (Math.abs(offset) < window.innerWidth * 0.5) {
      setSwipeOffset(offset);
    }
  };

  const handleTouchEnd = (e: TouchEvent) => {
    setIsSwiping(false);
    const minSwipeDistance = 50;

    if (Math.abs(swipeOffset) > minSwipeDistance) {
      if (contentRef.current) {
        contentRef.current.classList.add('transitioning');
      }

      if (swipeOffset > 0) {
        playPreviousSong();
      } else {
        playNextSong();
      }

      setTimeout(() => {
        setSwipeOffset(0);
        if (contentRef.current) {
          contentRef.current.classList.remove('transitioning');
        }
      }, 300);
    } else {
      setSwipeOffset(0);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        router.push('/');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [router]);

  if (!currentSong) {
    router.push('/');
    return null;
  }

  const handlePlayPause = () => {
    if (isPlaying) {
      pauseSong();
    } else {
      resumeSong();
    }
  };

  const handleBack = () => {
    setIsExiting(true);
    setTimeout(() => router.back(), 300);
  };

  return (
    <div className={twMerge(
      "flex flex-col md:hidden w-full p-4",
      "transition-all duration-300 origin-bottom",
      isExiting ? "scale-[0.125] translate-y-[400px] opacity-0" : "slide-up-enter"
    )}>
      <TextButton className="text-[--md-sys-color-primary] w-fit" onClick={handleBack}>
        <span className="material-symbols-outlined">arrow_back</span>
        Quay lại
      </TextButton>

      <div 
        ref={contentRef}
        className={twMerge(
          "song-info flex flex-col gap-[60px] w-full pt-6 items-center",
          "transition-transform duration-300 ease-out",
          isSwiping ? "transition-none" : ""
        )}
        style={{ transform: `translateX(${swipeOffset}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="cover-and-title flex flex-col w-full items-center">
          <div className={`img-large-rotate ${isPlaying ? 'animate-spin-slow' : ''}`}>
            <Image
              src={currentSong.thumbnailurl || '/assets/placeholder.jpg'}
              alt={currentSong.title}
              width={300}
              height={300}
              priority={true}
              className="rounded-full shadow-lg"
            />
          </div>
          <div className="flex justify-between items-center w-full pt-6">
            <div className="flex flex-col gap-3 w-full">
              <h1 className='font-bold text-2xl md:text-3xl'>{currentSong.title}</h1>
              <ArtistLinks artists={currentSong.artists?.map(a => ({ id: a.artist.id, name: a.artist.name, avatarurl: null })) || []} />
            </div>
            <ToggleButtonFilled
              active={likedSongs.some(s => s.id === currentSong.id)}
              onClick={() => likedSongs.some(s => s.id === currentSong.id)
                ? removeLikedSong(currentSong as Song)
                : addLikedSong(currentSong as Song)
              }>
              favorite
            </ToggleButtonFilled>
          </div>
        </div>

        <div className="control-region flex flex-col w-full items-center gap-4">
          <div className="progress-bar flex flex-col gap-3 w-full items-center">
            <input
              className="w-full"
              aria-label="song-progress"
              type="range"
              value={progress}
              min={0}
              max={currentSong.duration || 100}
              onChange={(e) => seekTo(parseInt(e.target.value))}
            />
            <div className="flex justify-between gap-3 w-full items-center">
              <p>{formatDuration(progress, true)}</p>
              <p>{formatDuration(currentSong.duration || 0, true)}</p>
            </div>
          </div>

          <div className="flex justify-between items-center gap-4 w-full">
            <IconSmallButton onClick={()=>{}}>
              <OutlinedIcon icon='shuffle'/>
            </IconSmallButton>
            <IconSmallButton onClick={playPreviousSong}>
              <OutlinedFilledIcon icon='skip_previous'/>
            </IconSmallButton>
            <PlayButton
              className="bg-[--md-sys-color-primary] text-[--md-sys-color-on-primary] w-12 h-12"
              onClick={handlePlayPause}
              isPlaying={isPlaying}
              songId={currentSong.id}
            />
            <IconSmallButton onClick={playNextSong}>
              <OutlinedFilledIcon icon='skip_next'/>
            </IconSmallButton>
            <IconSmallButton onClick={()=>{}}>
              <OutlinedIcon icon='repeat'/>
            </IconSmallButton>
          </div>

          <div className="additional flex justify-between items-center gap-4 w-full">
            <PlainTooltip content="Danh sách phát">
              <IconSmallButton onClick={toggleQueue}>
                <span className="material-symbols-outlined">queue_music</span>
              </IconSmallButton>
            </PlainTooltip>
          </div>
        </div>
      </div>
    </div>
  );
}