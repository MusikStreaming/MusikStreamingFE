'use client';

import { twMerge } from 'tailwind-merge';
import { useMedia } from '@/app/contexts/media-context';

/**
 * PlayButton component
 * 
 * @param {Object} props - Component properties
 * @param {string} [props.className] - Optional class name for the button
 * @param {Function} [props.onClick] - Optional click handler for the button
 * @param {bool} [props.disabled] - Optional flag to disable the button
 * @param {bool} [props.isPlaying] - Whether the media is currently playing
 * @param {string} [props.songId] - The ID of the song to check if it's currently playing
 * @returns {JSX.Element} The rendered PlayButton component
 */
export default function PlayButton({
  className,
  onClick,
  songId,
  isPlaying,
  ...props
}) {
  const { currentSong } = useMedia();
  const isCurrentlyPlaying = currentSong?.id === songId && isPlaying;

  return (
    <button 
      className="play-btn" 
      role='button' 
      onClick={onClick} 
      {...props}
    >
      <div className={twMerge("state-layer rounded-full relative flex items-center justify-center", className)}>
        <md-ripple className={`${props.disabled ? "hidden" : ""}`}></md-ripple>
        <div className="flex w-fit gap-3 material-symbols-outlined-filled">
          {isCurrentlyPlaying ? "pause" : "play_arrow"}
        </div>
      </div>
    </button>
  )
}