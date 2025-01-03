/**
 * Media Context and Provider for handling audio playback functionality
 * @module MediaContext
 */

'use client';

import { createContext, useContext, useRef, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getCookie, hasCookie } from 'cookies-next/client';
import updateHistory from '../api-fetch/update-history';
import { debounce } from 'lodash';
import { Song } from '@/app/model/song';
import getSong from '@/app/api-fetch/get-song';
import { addAuthListener, removeAuthListener } from '@/app/services/auth.service';

const CACHE_DB_NAME = 'musicCache';
const CACHE_STORE_NAME = 'songs';
const QUEUE_STORAGE_KEY = 'musicQueue';
const CURRENT_SONG_KEY = 'currentSong';
const QUEUE_INDEX_KEY = 'queueIndex';
const QUEUE_STORE_NAME = 'queue';

const MediaContext = createContext<MediaContextType | null>(null);

/**
 * Interface for the media context value
 * @interface MediaContextType
 */
interface MediaContextType {
  /** Currently playing song */
  currentSong: Song | null;
  /** Whether audio is currently playing */
  isPlaying: boolean;
  /** Whether audio is loading */
  isLoading: boolean;
  /** Current playback progress in seconds */
  progress: number;
  /** Current volume level (0-1) */
  volume: number;
  /** Function to start playing a song */
  playSong: (song: Song) => void;
  /** Function to pause playback */
  pauseSong: () => void;
  /** Function to resume playback */
  resumeSong: () => void;
  /** Function to set volume level */
  setVolume: (volume: number) => void;
  /** Function to seek to specific time */
  seekTo: (time: number) => void;
  /** Whether the queue is visible */
  isQueueVisible: boolean;
  /** Function to toggle the queue visibility */
  toggleQueue: () => void;
  /** Function to handle seek start */
  handleSeekStart: () => void;
  /** Function to handle seek end */
  handleSeekEnd: () => void;
  /** Whether seeking is in progress */
  isDragging: boolean;
  /** Play the previous song */
  playPreviousSong: () => void;
  /** Play the next song */
  playNextSong: () => void;
  /** Function to play an album */
  playList: (songs: Song[]) => void;
  /** Queue of songs */
  queue: Song[];
  /** Function to add a song to the queue */
  addToQueue: (song: Song) => void;
  /** Function to remove a song from the queue */
  removeFromQueue: (songId: string) => void;
  /** Function to clear the queue */
  clearQueue: () => void;
  /** Index of the current song in the queue */
  queueIndex: number;
  isLoop: boolean;
  isError: boolean;
  errorMessage: string;
  resetError: () => void;
  playHistory: Song[];
  historyIndex: number;
}

/**
 * Provider component that wraps app to provide media playback functionality
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export function MediaProvider({ children }: { children: React.ReactNode }) {
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedVolume = localStorage.getItem('audio-volume');
      return savedVolume ? Math.min(Math.max(parseFloat(savedVolume), 0), 1) : 1;
    }
    return 1;
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const volumeRef = useRef(volume);
  const [isQueueVisible, setIsQueueVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragProgress, setDragProgress] = useState(0);
  const [queue, setQueue] = useState<Song[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [backupQueue, setBackupQueue] = useState<Song[]>([]);
  const [isCaching, setIsCaching] = useState(false);
  const [isLoop, setIsLoop] = useState(false);
  const [playHistory, setPlayHistory] = useState<Song[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  const handleError = useCallback((error: Error) => {
    console.error('Media error:', error);
    setIsError(true);
    setErrorMessage(error.message);
    setIsPlaying(false);
    setIsLoading(false);
  }, []);

  const resetError = useCallback(() => {
    setIsError(false);
    setErrorMessage('');
  }, []);

  const cacheSong = useCallback(async (songId: string, audioBlob: Blob) => {
    const db = await initCache();
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(CACHE_STORE_NAME, 'readwrite');
      const store = transaction.objectStore(CACHE_STORE_NAME);
      const request = store.put(audioBlob, songId);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }, []);
  
  const getCachedSong = useCallback(async (songId: string): Promise<Blob | null> => {
    const db = await initCache();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(CACHE_STORE_NAME, 'readonly');
      const store = transaction.objectStore(CACHE_STORE_NAME);
      const request = store.get(songId);
      
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }, []);

  const pauseSong = useCallback(() => {
    console.debug('[MediaContext] pauseSong called');
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const resumeSong = useCallback(async () => {
    console.debug('[MediaContext] resumeSong called');
    if (audioRef.current) {
      setIsLoading(true);
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error('Error resuming song:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, []);

  const updateMediaSession = useCallback((song: Song) => {
    if ('mediaSession' in navigator) {
      
      navigator.mediaSession.metadata = new MediaMetadata({
        title: song.title,
        artist: song.artists?.map(a => a.artist.name).join(', ') || '',
        album: '',
        artwork: [
          { src: song.thumbnailurl || '/favicon.ico', sizes: '96x96', type: 'image/png' },
          { src: song.thumbnailurl || '/favicon.ico', sizes: '128x128', type: 'image/png' },
          { src: song.thumbnailurl || '/favicon.ico', sizes: '192x192', type: 'image/png' },
          { src: song.thumbnailurl || '/favicon.ico', sizes: '256x256', type: 'image/png' },
          { src: song.thumbnailurl || '/favicon.ico', sizes: '384x384', type: 'image/png' },
          { src: song.thumbnailurl || '/favicon.ico', sizes: '512x512', type: 'image/png' },
        ]
      });
      navigator.mediaSession.setActionHandler('previoustrack', () => playPreviousSong());
      navigator.mediaSession.setActionHandler('nexttrack', () => playNextSong());
      navigator.mediaSession.setActionHandler('play', () => resumeSong());
      navigator.mediaSession.setActionHandler('pause', () => pauseSong());
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime && audioRef.current) {
          audioRef.current.currentTime = details.seekTime;
          setProgress(details.seekTime);
        }
      });
    }
  }, [resumeSong, pauseSong]);

  const initCache = async () => {
    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(CACHE_DB_NAME, 2); // Bump version to 2
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = request.result;
        if (!db.objectStoreNames.contains(CACHE_STORE_NAME)) {
          db.createObjectStore(CACHE_STORE_NAME);
        }
        if (!db.objectStoreNames.contains(QUEUE_STORE_NAME)) {
          db.createObjectStore(QUEUE_STORE_NAME);
        }
      };
    });
  };

  const saveQueueToCache = useCallback(async (queueData: { 
    queue: Song[], 
    currentIndex: number,
    currentSong: Song | null 
  }) => {
    const db = await initCache();
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(QUEUE_STORE_NAME, 'readwrite');
      const store = transaction.objectStore(QUEUE_STORE_NAME);
      const request = store.put(queueData, 'currentQueue');
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }, []);
  
  const loadQueueFromCache = useCallback(async () => {
    const db = await initCache();
    return new Promise<{ 
      queue: Song[], 
      currentIndex: number,
      currentSong: Song | null 
    } | null>((resolve, reject) => {
      const transaction = db.transaction(QUEUE_STORE_NAME, 'readonly');
      const store = transaction.objectStore(QUEUE_STORE_NAME);
      const request = store.get('currentQueue');
      
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }, []);

  const cacheNextSong = useCallback(async () => {
    if (queue.length > queueIndex + 1 && !isCaching) {
      const nextSong = queue[queueIndex + 1];
      setIsCaching(true);
      
      try {
        // Check if already cached
        const cached = await getCachedSong(nextSong.id);
        if (!cached) {
          const songData = await getSong(nextSong.id);
          const response = await fetch(songData.url);
          const blob = await response.blob();
          await cacheSong(nextSong.id, blob);
        }
      } catch (error) {
        console.error('Error caching next song:', error);
      } finally {
        setIsCaching(false);
      }
    }
  }, [queue, queueIndex, isCaching, cacheSong, getCachedSong]);

  const playSong = useCallback(async (song: Song, addToHistory = true) => {
    console.debug('[MediaContext] playSong called', { song, addToHistory });
    resetError();
    setIsLoading(true);

    try {
      // Add to history if requested
      if (addToHistory) {
        setPlayHistory(prev => {
          // Remove future history if we're not at the end
          const newHistory = prev.slice(0, historyIndex + 1);
          return [...newHistory, song];
        });
        setHistoryIndex(prev => prev + 1);
      }

      // Cleanup previous audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }

      const songIndex = queue.findIndex(s => s.id === song.id);
      if (songIndex !== -1) {
        setQueueIndex(songIndex);
      } else {
        setQueue(prev => [...prev, song]);
        setQueueIndex(queue.length);
      }

      setCurrentSong(song);
      let audioBlob: Blob | null = null;

      try {
        audioBlob = await getCachedSong(song.id);
      } catch (error) {
        console.warn('Cache read error:', error);
      }

      if (!audioBlob) {
        const songData = await getSong(song.id);
        if (!songData?.url) throw new Error('Invalid song URL');
        
        const response = await fetch(songData.url);
        if (!response.ok) throw new Error('Failed to fetch audio');
        
        audioBlob = await response.blob();
        try {
          await cacheSong(song.id, audioBlob);
        } catch (error) {
          console.warn('Cache write error:', error);
        }
      }

      if (audioRef.current && audioBlob) {
        const blobUrl = URL.createObjectURL(audioBlob);
        audioRef.current.src = blobUrl;
        audioRef.current.load();
        audioRef.current.volume = volumeRef.current; // Use ref instead of state
        await audioRef.current.play();
        
        updateMediaSession(song);
        setIsPlaying(true);

        // Cleanup blob URL
        URL.revokeObjectURL(blobUrl);

        await saveQueueToCache({
          queue: [...queue, song],
          currentIndex: queueIndex,
          currentSong: song
        });
      }

      await updateHistory(song.id);
    } catch (error) {
      handleError(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [queue, volume, queueIndex, updateMediaSession, getCachedSong, cacheSong, handleError, resetError, saveQueueToCache, historyIndex]);

  const playPreviousSong = useCallback(() => {
    console.debug('[MediaContext] playPreviousSong called', { historyIndex, playHistory });
    
    if (historyIndex > 0) {
      // There's a previous song in history
      const previousSong = playHistory[historyIndex - 1];
      setHistoryIndex(prev => prev - 1);
      playSong(previousSong, false); // Don't add to history when going back
    } else if (audioRef.current) {
      // No previous song, restart current
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  }, [playHistory, historyIndex, playSong]);

  const playNextSong = useCallback(() => {
    console.debug('[MediaContext] playNextSong called', { historyIndex, playHistory });
    
    if (historyIndex < playHistory.length - 1) {
      // There's a next song in history
      const nextSong = playHistory[historyIndex + 1];
      setHistoryIndex(prev => prev + 1);
      playSong(nextSong, false); // Don't add to history when going forward
    } else if (queue.length > queueIndex + 1) {
      // Play next song from queue
      const nextSong = queue[queueIndex + 1];
      setQueueIndex(prev => prev + 1);
      playSong(nextSong); // Add to history when playing new song
    } else if (backupQueue.length > 0 && isLoop) {
      // Loop behavior
      setQueue(backupQueue);
      setBackupQueue([]);
      setQueueIndex(0);
      if (backupQueue[0]) {
        playSong(backupQueue[0]);
      }
    }
  }, [queue, queueIndex, backupQueue, isLoop, playHistory, historyIndex, playSong]);

  const playList = useCallback(async (songs: Song[], startIndex: number = 0) => {
    if (songs.length === 0) return;
    
    const songToPlay = songs[startIndex];
    if (!songToPlay) return;

    // Update queue first
    setQueue(songs);
    setQueueIndex(startIndex);
    setBackupQueue([]);
    
    try {
      setIsLoading(true);
      // Play the song immediately if URL is provided
      if (songToPlay.url) {
        setCurrentSong(songToPlay);
        if (audioRef.current) {
          audioRef.current.src = songToPlay.url;
          audioRef.current.load();
          await audioRef.current.play();
          setIsPlaying(true);
          updateMediaSession(songToPlay);
        }
      } else {
        // Fetch URL if not provided
        const song = await getSong(songToPlay.id);
        const songWithUrl = { ...songToPlay, url: song.url };
        setCurrentSong(songWithUrl);
        if (audioRef.current) {
          audioRef.current.src = song.url;
          audioRef.current.load();
          await audioRef.current.play();
          setIsPlaying(true);
          updateMediaSession(songWithUrl);
        }
        // Update the queue with the fetched URL
        setQueue(prev => prev.map((s, i) => 
          i === startIndex ? songWithUrl : s
        ));
      }
      
      // Cache the next song in the queue
      if (songs.length > startIndex + 1) {
        cacheNextSong();
      }
    } catch (error) {
      console.error('Error playing song:', error);
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  }, [updateMediaSession, cacheNextSong]);

  const addToQueue = useCallback((song: Song) => {
    setQueue(prev => [...prev, song]);
  }, []);

  const removeFromQueue = useCallback((songId: string) => {
    setQueue(prev => {
      const index = prev.findIndex(song => song.id === songId);
      if (index === -1) return prev;
      
      const newQueue = [...prev];
      newQueue.splice(index, 1);
      
      // Adjust queueIndex if removing a song before current
      if (index < queueIndex) {
        setQueueIndex(prev => prev - 1);
      }
      return newQueue;
    });
  }, [queueIndex]);

  const clearQueue = useCallback(async () => {
    setQueue([]);
    setQueueIndex(0);
    try {
      const db = await initCache();
      const transaction = db.transaction(QUEUE_STORE_NAME, 'readwrite');
      const store = transaction.objectStore(QUEUE_STORE_NAME);
      await store.delete('currentQueue');
    } catch (error) {
      console.error('Error clearing queue cache:', error);
    }
  }, []);

  useEffect(() => {
    debounce(() => {
      if (audioRef.current && progress > 0) {
        audioRef.current.currentTime = progress;
      }
    }, 1000);
  }, [progress, isPlaying]);

  useEffect(() => {
    const loadState = async () => {
      try {
        const cachedQueue = await loadQueueFromCache();
        if (cachedQueue) {
          setQueue(cachedQueue.queue);
          setQueueIndex(cachedQueue.currentIndex);
          if (cachedQueue.currentSong) {
            setCurrentSong(cachedQueue.currentSong);
            // Prepare the audio source without autoplay
            const audioBlob = await getCachedSong(cachedQueue.currentSong.id);
            if (audioBlob && audioRef.current) {
              const blobUrl = URL.createObjectURL(audioBlob);
              audioRef.current.src = blobUrl;
              audioRef.current.load();
              audioRef.current.volume = volume;
              updateMediaSession(cachedQueue.currentSong);
              setIsPlaying(false); // Ensure we start paused
            } else if (cachedQueue.currentSong) {
              // If no cached audio, just prepare the song state
              // but don't start playback
              const songData = await getSong(cachedQueue.currentSong.id);
              const response = await fetch(songData.url);
              const blob = await response.blob();
              const blobUrl = URL.createObjectURL(blob);
              if (audioRef.current) {
                audioRef.current.src = blobUrl;
                audioRef.current.load();
                audioRef.current.volume = volume;
                updateMediaSession(cachedQueue.currentSong);
              }
              // Cache for future use
              await cacheSong(cachedQueue.currentSong.id, blob);
            }
          }
        } else {
          // ...existing session storage fallback code...
        }
      } catch (error) {
        console.error('Error loading cached queue:', error);
      }
    };

    loadState();
  }, [updateMediaSession, getCachedSong, cacheSong, loadQueueFromCache]); // Remove volume dependency

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (audio.duration - audio.currentTime < 30) { // Start caching when less than 30 seconds remaining
        cacheNextSong();
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    return () => audio.removeEventListener('timeupdate', handleTimeUpdate);
  }, [cacheNextSong]);

  useEffect(() => {
    if (queue.length > 0) {
      saveQueueToCache({
        queue,
        currentIndex: queueIndex,
        currentSong
      });
    }
  }, [queue, queueIndex, currentSong, saveQueueToCache]);

  // Cleanup effect
  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, []);

  // Handle audio element errors
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleAudioError = (e: ErrorEvent) => {
      handleError(new Error('Audio playback error: ' + e.message));
    };

    audio.addEventListener('error', handleAudioError);
    return () => audio.removeEventListener('error', handleAudioError);
  }, [handleError]);

  // Persist volume changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('audio-volume', volume.toString());
    }
  }, [volume]);

  // Ensure volume is set whenever audio source changes
  useEffect(() => {
    console.debug('[MediaContext] Volume effect triggered:', volume);
    const audio = audioRef.current;
    if (!audio) return;

    const setInitialVolume = () => {
      if (Math.abs(audio.volume - volumeRef.current) > 0.01) {
        audio.volume = volumeRef.current;
      }
    };

    audio.addEventListener('loadedmetadata', setInitialVolume);
    return () => audio.removeEventListener('loadedmetadata', setInitialVolume);
  }, []); // Remove volume dependency

  // Debounced seek function
  const debouncedSeek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  }, []);

  /**
   * Handles the start of seek drag
   */
  const handleSeekStart = () => {
    setIsDragging(true);
  };

  /**
   * Handles the end of seek drag
   */
  const handleSeekEnd = () => {
    setIsDragging(false);
    if (audioRef.current) {
      audioRef.current.currentTime = dragProgress;
      setProgress(dragProgress);
    }
  };

  /**
   * Seeks to a specific time in the song
   * @param {number} time - Time to seek to in seconds
   */
  const seekTo = (time: number) => {
    setDragProgress(time);
    if (!isDragging) {
      setProgress(time);
    }
    debouncedSeek(time);
  };

  /**
   * Updates the current playback progress
   * @param {number} time - Current time in seconds
   */
  const updateProgress = (time: number) => {
    if (!isDragging) {
      setProgress(time);
    }
  };

  const toggleQueue = () => {
    setIsQueueVisible(prev => !prev);
  };

  /**
   * Updates the volume level without affecting playback
   * @param {number} newVolume - New volume level (0-1)
   */
  const handleVolumeChange = useCallback((newVolume: number) => {
    console.debug('[MediaContext] handleVolumeChange called:', newVolume);
    const safeVolume = Math.min(Math.max(newVolume, 0), 1);
    
    if (audioRef.current) {
      try {
        volumeRef.current = safeVolume;
        audioRef.current.volume = safeVolume;
        setVolume(prev => {
          const shouldUpdate = Math.abs(prev - safeVolume) > 0.01;
          console.debug('[MediaContext] Volume state update:', shouldUpdate);
          return shouldUpdate ? safeVolume : prev;
        });
      } catch (error) {
        console.error('[MediaContext] Volume change failed:', error);
      }
    }
  }, []);

  // Add debug effect for volume changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Only update volume if it's significantly different
    if (Math.abs(audio.volume - volume) > 0.01) {
      audio.volume = volume;
    }
  }, [volume]);

  // Add effect to persist play history
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && playHistory.length > 0) {
        localStorage.setItem('playHistory', JSON.stringify({
          history: playHistory,
          index: historyIndex
        }));
      }
    } catch (error) {
      console.error('[MediaContext] Error saving play history:', error);
    }
  }, [playHistory, historyIndex]);

  // Load saved history on mount
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('playHistory');
        if (saved) {
          const { history, index } = JSON.parse(saved);
          setPlayHistory(history);
          setHistoryIndex(index);
        }
      }
    } catch (error) {
      console.error('[MediaContext] Error loading play history:', error);
    }
  }, []);

  return (
    <MediaContext.Provider
      value={{
        currentSong,
        isPlaying,
        isLoading,
        progress: isDragging ? dragProgress : progress,
        volume,
        playSong: playSong,
        pauseSong: pauseSong,
        resumeSong: resumeSong,
        setVolume: handleVolumeChange,
        seekTo: seekTo,
        isQueueVisible,
        toggleQueue:  toggleQueue,
        handleSeekStart:  handleSeekStart,
        handleSeekEnd:  handleSeekEnd,
        isDragging,
        playPreviousSong:  playPreviousSong,
        playNextSong:  playNextSong,
        playList:  playList,
        queue,
        addToQueue:  addToQueue,
        removeFromQueue:  removeFromQueue,
        clearQueue:  clearQueue,
        queueIndex,
        isLoop,
        isError,
        errorMessage,
        resetError,
        playHistory,
        historyIndex
      }}
    >
      <audio
        ref={audioRef}
        onTimeUpdate={(e) => {
          if (!isDragging) {
            const audio = e.currentTarget;
            updateProgress(audio.currentTime);
            if ('mediaSession' in navigator) {
              navigator.mediaSession.setPositionState({
                duration: audio.duration || 0,
                playbackRate: audio.playbackRate,
                position: audio.currentTime,
              });
            }
          }
        }}
        onEnded={() => {
          if (isLoop || queue.length > queueIndex + 1) {
            playNextSong();
          } else {
            setIsPlaying(false);
          }
        }}
        onLoadStart={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        onError={(e) => {
          setIsLoading(false);
          handleError(new Error('Audio element error'));
        }}
      />
      {children}
    </MediaContext.Provider>
  );
}

/**
 * Hook to access the media context
 * @returns {MediaContextType} Media context value
 * @throws {Error} If used outside of MediaProvider
 */
export function useMedia() {
  const context = useContext(MediaContext);

  if (!context) {
    throw new Error('useMedia must be used within a MediaProvider');
  }

  return context;
}