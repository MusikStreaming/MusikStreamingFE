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
  playAlbum: (songs: Song[]) => void;
  /** Queue of songs */
  queue: Song[];
  /** Function to add a song to the queue */
  addToQueue: (song: Song) => void;
  /** Function to remove a song from the queue */
  removeFromQueue: (index: number) => void;
  /** Function to clear the queue */
  clearQueue: () => void;
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
  const router = useRouter();
  const [isQueueVisible, setIsQueueVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragProgress, setDragProgress] = useState(0);
  const [previousSong, setPreviousSong] = useState<Song | null>(null);
  const [nextSong, setNextSong] = useState<Song | null>(null);
  const [queue, setQueue] = useState<Song[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);

  // 2. All useCallback declarations
  const updateMediaSession = useCallback((song: Song) => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: song.title,
        artist: song.artists?.map(a => a.artist.name).join(', ') || '',
        album: '',
        artwork: [
          { src: song.coverImage || '/favicon.ico', sizes: '96x96', type: 'image/png' },
          { src: song.coverImage || '/favicon.ico', sizes: '128x128', type: 'image/png' },
          { src: song.coverImage || '/favicon.ico', sizes: '192x192', type: 'image/png' },
          { src: song.coverImage || '/favicon.ico', sizes: '256x256', type: 'image/png' },
          { src: song.coverImage || '/favicon.ico', sizes: '384x384', type: 'image/png' },
          { src: song.coverImage || '/favicon.ico', sizes: '512x512', type: 'image/png' },
        ]
      });
  
      navigator.mediaSession.setActionHandler('play', () => resumeSong());
      navigator.mediaSession.setActionHandler('pause', () => pauseSong());
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime && audioRef.current) {
          audioRef.current.currentTime = details.seekTime;
          setProgress(details.seekTime);
        }
      });
    }
  }, []);

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
      // Fetch song URL if not provided
      let audioUrl = song.url;
      if (!audioUrl) {
        const songData = await getSong(song.id);
        audioUrl = songData.url;
      }

      if (!audioUrl) {
        throw new Error('Failed to get audio URL');
      }

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = audioUrl;
        audioRef.current.load();
        audioRef.current.volume = volume;
        await audioRef.current.play();
        
        // Update song with URL before saving to session
        const updatedSong = { ...song, url: audioUrl };
        setCurrentSong(updatedSong);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('currentSong', JSON.stringify(updatedSong));
        }
        
        // Update media session
        updateMediaSession(song);
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error playing song:', error);
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, queue, volume, audioRef, setCurrentSong, setIsPlaying, setIsLoading, currentSong?.id, updateMediaSession]);

  const pauseSong = useCallback(() => {
    if (!isAuthenticated) return;
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [isAuthenticated]);

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
      setQueueIndex(prev => prev + 1);
      playSong(queue[queueIndex + 1]);
    }
  }, [queue, queueIndex, playSong]);

  const playAlbum = useCallback((songs: Song[]) => {
    if (!isAuthenticated || songs.length === 0) return;
    
    // Clear current queue and add all songs
    setQueue(songs);
    
    // Start playing from first song
    setQueueIndex(0);
    playSong(songs[0]);
  }, [isAuthenticated, playSong]);

  const addToQueue = useCallback((song: Song) => {
    setQueue(prev => [...prev, song]);
  }, []);

  const removeFromQueue = useCallback((index: number) => {
    setQueue(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
    setQueueIndex(0);
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
        playAlbum: isAuthenticated ? playAlbum : () => {},
        queue,
        addToQueue: isAuthenticated ? addToQueue : () => {},
        removeFromQueue: isAuthenticated ? removeFromQueue : () => {},
        clearQueue: isAuthenticated ? clearQueue : () => {},
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
          setIsPlaying(false);
          setProgress(0);
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
      playAlbum: () => {},
      queue: [],
      addToQueue: () => {},
      removeFromQueue: () => {},
      clearQueue: () => {},
    };
  }

  if (!context) {
    throw new Error('useMedia must be used within a MediaProvider');
  }

  return context;
}