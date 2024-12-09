'use client';

import { useMedia } from '@/app/contexts/media-context';
import SongQueueCard from './song-queue-card';

export default function SongQueue() {
  const { currentSong, queue, removeFromQueue, queueIndex } = useMedia();
  
  if (!removeFromQueue) {
    return null;
  }

  if (!currentSong && queue.length === 0) {
    return (
      <div className="text-center text-[--md-sys-color-outline] py-4">
        No songs in queue
      </div>
    );
  }

  // Get only upcoming songs (after current index)
  const upcomingSongs = queue.slice(queueIndex + 1);

  return (
    <div className="flex flex-col gap-4 md:max-h-[calc(100vh-220px)] max-h-[calc(100vh-328px)] overflow-y-hidden">
      <div className="h-full overflow-y-auto">
        {currentSong && (
          <div className="now-playing">
            <h3 className="text-sm font-medium text-[--md-sys-color-outline] mb-2">Now Playing</h3>
            <SongQueueCard
              key={`now-playing-${currentSong.id}`}
              song={currentSong}
              isPlaying={true}
              onRemove={() => removeFromQueue(currentSong.id)}
            />
          </div>
        )}
        
        {upcomingSongs.length > 0 && (
          <div className="next-up">
            <h3 className="text-sm font-medium text-[--md-sys-color-outline] mb-2">Next Up</h3>
            <div className="flex flex-col gap-2">
              {upcomingSongs.map((song) => (
                <SongQueueCard
                  key={`queue-${song.id}`}
                  song={song}
                  isPlaying={false}
                  onRemove={() => removeFromQueue(song.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}