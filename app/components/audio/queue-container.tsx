'use client';

import { useMedia } from '@/app/contexts/media-context';
import { twMerge } from 'tailwind-merge';
import SongQueue from './song-queue';
import { useCallback, useEffect, useState } from 'react';
import { twJoin } from 'tailwind-merge';

const slideInAnimation = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
    }
    to {
      transform: translateX(0);
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(100%);
    }
  }
`;

export default function QueueContainer() {
  const { isQueueVisible, toggleQueue } = useMedia();
  const [width, setWidth] = useState(500); // Default fallback width
  const [isClient, setIsClient] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Handle hydration and localStorage
  useEffect(() => {
    setIsClient(true);
    const storedWidth = localStorage.getItem('queue-width');
    if (storedWidth) {
      const parsedWidth = parseInt(storedWidth);
      if (!isNaN(parsedWidth)) {
        setWidth(parsedWidth);
        document.documentElement.style.setProperty('--queue-width', `${parsedWidth}px`);
      }
    }
  }, []);

  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const newWidth = window.innerWidth - e.clientX;
      const clampedWidth = Math.min(Math.max(newWidth, 280), 600);
      setWidth(clampedWidth);
      document.documentElement.style.setProperty('--queue-width', `${clampedWidth}px`);
      if (isClient) {
        localStorage.setItem('queue-width', clampedWidth.toString());
      }
    }
  }, [isDragging, isClient]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  if (!isClient) {
    return null; // or a loading skeleton if preferred
  }

  return (
    <div className='overflow-hidden rounded-2xl bg-[--md-sys-color-surface-container]'>
      <style>{slideInAnimation}</style>
      {/* Desktop queue */}
      <div 
        className={twMerge(
          "song-queue-container h-full overflow-y-auto rounded-2xl relative w-[var(--queue-width,500px)]",
          isQueueVisible ? twJoin(
            "md:block",
            "hidden",
            "animate-[slideIn_0.3s_ease-out]"
          ) : twJoin(
            "hidden",
            "animate-[slideOut_0.3s_ease-in]"
          ),
          isDragging ? "transition-none" : "transition-[width] duration-200"
        )}
      >
        <div 
          className={twMerge(
            "absolute left-0 top-0 w-1 h-full cursor-ew-resize hover:bg-[--md-sys-color-primary]",
            "before:absolute before:inset-0 before:w-4 before:-left-2",
            isDragging && "bg-[--md-sys-color-primary]"
          )}
          onMouseDown={handleMouseDown}
        />
        <div className="bg-[--md-sys-color-surface-container] rounded-xl p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Queue</h2>
          </div>
          <SongQueue />
        </div>
      </div>

      {/* Mobile queue overlay */}
      <div className={twMerge(
        "fixed inset-0 bg-black/50 z-[1001]",
        isQueueVisible ? "md:hidden opacity-100 transition-opacity duration-300" : "hidden opacity-0"
      )}>
        <div className={twMerge(
          "absolute bottom-0 left-0 right-0 bg-[--md-sys-color-surface] rounded-t-xl p-4 max-h-[80vh] overflow-y-auto",
          "transition-transform duration-300",
          isQueueVisible ? "translate-y-0" : "translate-y-full"
        )}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Queue</h2>
            <button 
              onClick={toggleQueue}
              className="p-2 hover:bg-[--md-sys-color-surface-variant] rounded-full"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <SongQueue />
        </div>
      </div>
    </div>
  );
}