'use client';

import { useMedia } from '@/app/contexts/media-context';
import { twMerge } from 'tailwind-merge';
import SongQueue from './song-queue';

export default function QueueContainer() {
  const { isQueueVisible, toggleQueue } = useMedia();
  
  return (
    <>
      {/* Desktop queue */}
      <div className={twMerge(
        "song-queue-container w-80 transition-all duration-300",
        isQueueVisible ? "md:block" : "hidden"
      )}>
        <div className="bg-[--md-sys-color-surface] h-full rounded-xl p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Queue</h2>
          </div>
          <SongQueue songs={[]} />
        </div>
      </div>

      {/* Mobile queue overlay */}
      <div className={twMerge(
        "fixed inset-0 bg-black/50 z-[1001] transition-opacity duration-300",
        isQueueVisible ? "md:hidden opacity-100" : "hidden opacity-0"
      )}>
        <div className="absolute bottom-0 left-0 right-0 bg-[--md-sys-color-surface] rounded-t-xl p-4 max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Queue</h2>
            <button 
              onClick={toggleQueue}
              className="p-2 hover:bg-[--md-sys-color-surface-variant] rounded-full"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <SongQueue songs={[]} />
        </div>
      </div>
    </>
  );
} 