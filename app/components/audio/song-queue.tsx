'use client';

import { Song } from '@/app/model/song';
import { useMedia } from '@/app/contexts/media-context';
import SongQueueCard from './song-queue-card';

export default function SongQueue() {
  const { currentSong, queue, removeFromQueue } = useMedia();

  if (!currentSong && queue.length === 0) {
    return (
      <div className="text-center text-[--md-sys-color-outline] py-4">
        No songs in queue
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {currentSong && (
        <div className="now-playing">
          <h3 className="text-sm font-medium text-[--md-sys-color-outline] mb-2">Now Playing</h3>
          <SongQueueCard 
            key={`now-playing-${currentSong.id}`}
            song={currentSong} 
            isPlaying={true} 
            onRemove={() => {}}
          />
        </div>
      )}
      
      {queue.length > 0 && (
        <div className="next-up">
          <h3 className="text-sm font-medium text-[--md-sys-color-outline] mb-2">Next Up</h3>
          <div className="flex flex-col gap-2">
            {queue.filter(song => song.id !== currentSong?.id).map((song, index) => (
              <SongQueueCard 
                key={`queue-${song.id}-${index}`}
                song={song}
                isPlaying={false}
                onRemove={() => removeFromQueue(index)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}