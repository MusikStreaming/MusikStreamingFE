'use client';

import { twMerge } from 'tailwind-merge';

/**
 * PlayButton component
 * 
 * @param {Object} props - Component properties
 * @param {string} [props.className] - Optional class name for the button
 * @param {Function} [props.onClick] - Optional click handler for the button
 * @param {bool} [props.disabled] - Optional flag to disable the button
 * @param {bool} [props.isPlaying] - Whether the media is currently playing
 * @returns {JSX.Element} The rendered PlayButton component
 */
export default function PlayButton({
  className,
  onClick,
  isPlaying,
  ...props
}) {
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
          {isPlaying ? "pause" : "play_arrow"}
        </div>
      </div>
    </button>
  )
}