/**
 * Media Context and Provider for handling audio playback functionality
 * @module MediaContext
 */

'use client';

import { createContext, useContext, useRef, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getCookie, hasCookie } from 'cookies-next/client';
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
  isLoop: boolean
}

/**
 * Provider component that wraps app to provide media playback functionality
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export function MediaProvider({ children }: { children: React.ReactNode }) {
  // 1. All useState declarations
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // const router = useRouter();
  const [isQueueVisible, setIsQueueVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragProgress, setDragProgress] = useState(0);
  // const [previousSong, setPreviousSong] = useState<Song | null>(null);
  // const [nextSong, setNextSong] = useState<Song | null>(null);
  const [queue, setQueue] = useState<Song[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [backupQueue, setBackupQueue] = useState<Song[]>([]);
  const [isCaching, setIsCaching] = useState(false);
  const [isLoop, setIsLoop] = useState(false);


  // 2. All useCallback declarations
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
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const resumeSong = useCallback(async () => {
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

  const saveQueueToCache = async (queueData: { 
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
  };
  
  const loadQueueFromCache = async () => {
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
  };

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

  const playSong = useCallback(async (song: Song) => {
    if (!isAuthenticated) return;
    
    // If the song is not in queue, add it and set as current
    if (!queue.some(s => s.id === song.id)) {
      setQueue(prev => [...prev, song]);
      setQueueIndex(queue.length);
    }

    if (currentSong?.id === song.id && audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
      return;
    }

    setIsLoading(true);
    setCurrentSong(song);

    try {
      let audioUrl = song.url;
      let audioBlob: Blob | null = null;

      // Try to get from cache first
      audioBlob = await getCachedSong(song.id);
      
      if (!audioBlob) {
        // If not in cache, fetch and cache
        const songData = await getSong(song.id);
        audioUrl = songData.url;
        const response = await fetch(audioUrl);
        audioBlob = await response.blob();
        await cacheSong(song.id, audioBlob);
      }

      if (audioRef.current) {
        const blobUrl = URL.createObjectURL(audioBlob);
        audioRef.current.src = blobUrl;
        audioRef.current.load();
        audioRef.current.volume = volume;
        await audioRef.current.play();
        
        updateMediaSession(song);
        setIsPlaying(true);

        // Save current state
        sessionStorage.setItem(CURRENT_SONG_KEY, JSON.stringify(song));
        sessionStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
        sessionStorage.setItem(QUEUE_INDEX_KEY, String(queueIndex));
      }
    } catch (error) {
      console.error('Error playing song:', error);
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, queue, volume, queueIndex, updateMediaSession]);

  const playPreviousSong = useCallback(() => {
    if (queueIndex > 0) {
      setQueueIndex(prev => prev - 1);
      playSong(queue[queueIndex - 1]);
    } else if (audioRef.current) {
      // If at start of queue, restart current song
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  }, [queue, queueIndex, playSong]);

  const playNextSong = useCallback(() => {
    if (queue.length > queueIndex + 1) {
      // Move current song to backup queue if it exists
      if (currentSong) {
        setBackupQueue(prev => [...prev, currentSong]);
      }
      
      // Simply move to next song in queue
      const nextIndex = queueIndex + 1;
      const nextSong = queue[nextIndex];
      setQueueIndex(nextIndex);
      playSong(nextSong);
    } else if (backupQueue.length > 0 && isLoop) {
      // If at end of queue and have backup, reset with backup
      setQueue(backupQueue);
      setBackupQueue([]);
      setQueueIndex(0);
      playSong(backupQueue[0]);
    }
  }, [queue, queueIndex, currentSong, backupQueue, playSong, isLoop]);

  const playList = useCallback((songs: Song[]) => {
    if (!isAuthenticated || songs.length === 0) return;
    
    // Clear both queues when starting new album
    setBackupQueue([]);
    setQueue(songs);
    setQueueIndex(0);
    playSong(songs[0]);
  }, [isAuthenticated, playSong]);

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

  // 4. All useEffect declarations
  useEffect(() => {
    const audio = audioRef.current;
    const handleAuthChange = (isAuth: boolean) => {
      if (!isAuth) {
        if (audio) {
          audio.pause();
          audio.src = '';
          audio.load();
        }
        // Clear audio state
        setIsPlaying(false);
        setCurrentSong(null);
        setProgress(0);
        setVolume(1);
        setIsLoading(false);
        setIsQueueVisible(false);

        // Clear storage
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('currentSong');
          localStorage.removeItem('currentSong');
        }
      }
      
      setIsAuthenticated(isAuth);
    };

    // Initial auth check
    const hasSession = hasCookie('session');
    const sessionValue = getCookie('session');
    const isAuth = hasSession && sessionValue === 'true';
    handleAuthChange(isAuth);
    setIsInitialized(true);

    // Add listener for auth changes
    addAuthListener(handleAuthChange);
    
    return () => {
      removeAuthListener(handleAuthChange);
      if (audio) {
        audio.pause();
        audio.src = '';
        audio.load();
      }
    };
  }, []);

  useEffect(() => {
    debounce(() => {
      if (audioRef.current && progress > 0) {
        audioRef.current.currentTime = progress;
      }
    }, 1000);
  }, [progress, isPlaying]);

  useEffect(() => {
    if (isAuthenticated) {
      const loadState = async () => {
        try {
          // Try to load from IndexedDB first
          const cachedQueue = await loadQueueFromCache();
          if (cachedQueue) {
            setQueue(cachedQueue.queue);
            setQueueIndex(cachedQueue.currentIndex);
            if (cachedQueue.currentSong) {
              setCurrentSong(cachedQueue.currentSong);
              playSong(cachedQueue.currentSong);
            }
          } else {
            // Fall back to session storage
            const savedQueue = sessionStorage.getItem(QUEUE_STORAGE_KEY);
            const savedIndex = sessionStorage.getItem(QUEUE_INDEX_KEY);
            const savedSong = sessionStorage.getItem(CURRENT_SONG_KEY);

            if (savedQueue) setQueue(JSON.parse(savedQueue));
            if (savedIndex) setQueueIndex(Number(savedIndex));
            if (savedSong) {
              const song = JSON.parse(savedSong);
              setCurrentSong(song);
              playSong(song);
            }
          }
        } catch (error) {
          console.error('Error loading cached queue:', error);
        }
      };

      loadState();
    }
  }, [isAuthenticated]);

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
    if (isAuthenticated && queue.length > 0) {
      saveQueueToCache({
        queue,
        currentIndex: queueIndex,
        currentSong
      });
    }
  }, [queue, queueIndex, currentSong, isAuthenticated]);

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

  if (!isInitialized) {
    return null;
  }

  /**
   * Updates the volume level
   * @param {number} newVolume - New volume level (0-1)
   */
  const handleVolumeChange = (newVolume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setVolume(newVolume);
    }
  };

  return (
    <MediaContext.Provider
      value={{
        currentSong,
        isPlaying,
        isLoading,
        progress: isDragging ? dragProgress : progress,
        volume,
        playSong: isAuthenticated ? playSong : () => {},
        pauseSong: isAuthenticated ? pauseSong : () => {},
        resumeSong: isAuthenticated ? resumeSong : () => {},
        setVolume: isAuthenticated ? handleVolumeChange : () => {},
        seekTo: isAuthenticated ? seekTo : () => {},
        isQueueVisible,
        toggleQueue: isAuthenticated ? toggleQueue : () => {},
        handleSeekStart: isAuthenticated ? handleSeekStart : () => {},
        handleSeekEnd: isAuthenticated ? handleSeekEnd : () => {},
        isDragging,
        playPreviousSong: isAuthenticated ? playPreviousSong : () => {},
        playNextSong: isAuthenticated ? playNextSong : () => {},
        playList: isAuthenticated ? playList : () => {},
        queue,
        addToQueue: isAuthenticated ? addToQueue : () => {},
        removeFromQueue: isAuthenticated ? removeFromQueue : () => {},
        clearQueue: isAuthenticated ? clearQueue : () => {},
        queueIndex,
        isLoop
      }}
    >
      <audio
        ref={audioRef}
        onTimeUpdate={(e) => {
          if (!isAuthenticated) return;
          const audio = e.currentTarget as HTMLAudioElement;
          updateProgress(audio.currentTime);
          if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession) {
            navigator.mediaSession.setPositionState({
              duration: audio.duration || 0,
              playbackRate: audio.playbackRate,
              position: audio.currentTime,
            });
          }
        }}
        onEnded={() => {
          playNextSong();
        }}
        onLoadStart={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        onError={() => setIsLoading(false)}
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const session = getCookie("session");
        setIsAuthenticated(!!session);
      }
    };

    checkAuth();
    
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', checkAuth);
      
      return () => {
        window.removeEventListener('storage', checkAuth);
      };
    }
  }, []);

  if (!isAuthenticated) {
    return {
      currentSong: null,
      isPlaying: false,
      isLoading: false,
      progress: 0,
      volume: 1,
      playSong: () => {},
      pauseSong: () => {},
      resumeSong: () => {},
      setVolume: () => {},
      seekTo: () => {},
      isQueueVisible: false,
      toggleQueue: () => {},
      handleSeekStart: () => {},
      handleSeekEnd: () => {},
      isDragging: false,
      playPreviousSong: () => {},
      playNextSong: () => {},
      playList: () => {},
      queue: [],
      addToQueue: () => {},
      removeFromQueue: () => {},
      clearQueue: () => {},
      queueIndex: 0,
      isLoop: false
    };
  }

  if (!context) {
    throw new Error('useMedia must be used within a MediaProvider');
  }

  return context;
}