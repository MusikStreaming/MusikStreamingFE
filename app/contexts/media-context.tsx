/**
 * Media Context and Provider for handling audio playback functionality
 * @module MediaContext
 */

'use client';

import { createContext, useContext, useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCookie } from 'cookies-next/client';
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
}

/**
 * Provider component that wraps app to provide media playback functionality
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export function MediaProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentSong, setCurrentSong] = useState<Song | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('currentSong');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Error parsing saved song:', e);
          return null;
        }
      }
    }
    return null;
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const router = useRouter();
  const [isQueueVisible, setIsQueueVisible] = useState(false);

  useEffect(() => {
    const handleAuthChange = (isAuth: boolean) => {
      if (!isAuth) {
        // Clear audio state
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = '';
          audioRef.current.load();
          console.log('Audio cleared');
          console.log(audioRef.current);
        }

        // Reset all state
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
    const accessToken = getCookie("access_token");
    handleAuthChange(!!accessToken);
    setIsInitialized(true);

    // Add listener for auth changes
    addAuthListener(handleAuthChange);
    
    return () => {
      removeAuthListener(handleAuthChange);
      // Clean up audio on unmount
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current.load();
      }
    };
  }, [router]);

  useEffect(() => {
    debounce(() => {
      if (audioRef.current && progress > 0) {
        audioRef.current.currentTime = progress;
      }
    }, 1000);
  }, [progress, isPlaying]);

  if (!isInitialized) {
    return null;
  }

  /**
   * Starts playing a song
   * @param {Song} song - Song to play
   */
  const playSong = async (song: Song) => {
    if (!isAuthenticated) return;
    
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
        
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error playing song:', error);
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Pauses the currently playing song
   */
  const pauseSong = () => {
    if (!isAuthenticated) return;
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  /**
   * Resumes playback of the current song
   */
  const resumeSong = async () => {
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
  };

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

  /**
   * Seeks to a specific time in the song
   * @param {number} time - Time to seek to in seconds
   */
  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  };

  /**
   * Updates the current playback progress
   * @param {number} time - Current time in seconds
   */
  const updateProgress = (time: number) => {
    setProgress(time);
  };

  const toggleQueue = () => {
    setIsQueueVisible(prev => !prev);
  };

  return (
    <MediaContext.Provider
      value={{
        currentSong,
        isPlaying,
        isLoading,
        progress,
        volume,
        playSong,
        pauseSong,
        resumeSong,
        setVolume: handleVolumeChange,
        seekTo,
        isQueueVisible,
        toggleQueue,
      }}
    >
      <audio
        ref={audioRef}
        onTimeUpdate={(e) => {
          const audio = e.currentTarget as HTMLAudioElement;
          updateProgress(audio.currentTime);
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
        const accessToken = getCookie("access_token");
        setIsAuthenticated(!!accessToken);
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
    };
  }

  if (!context) {
    throw new Error('useMedia must be used within a MediaProvider');
  }

  return context;
}