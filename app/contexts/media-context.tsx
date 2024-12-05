'use client';

import { createContext, useContext, useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCookie } from 'cookies-next/client';

interface Song {
  id: string;
  title: string;
  duration?: number | null;
  views?: number | null;
  url?: string;
}

interface MediaContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  isLoading: boolean;
  progress: number;
  volume: number;
  playSong: (song: Song) => void;
  pauseSong: () => void;
  resumeSong: () => void;
  setVolume: (volume: number) => void;
  seekTo: (time: number) => void;
}

const MediaContext = createContext<MediaContextType | null>(null);

export function MediaProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Only check cookies on client side
        if (typeof window !== 'undefined') {
          await new Promise(resolve => setTimeout(resolve, 100));
          const accessToken = getCookie("access_token");
          
          if (mounted) {
            setIsAuthenticated(!!accessToken);
            setIsInitialized(true);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setIsInitialized(true);
        }
      }
    };

    initializeAuth();

    const handleStorageChange = async () => {
      if (typeof window !== 'undefined') {
        const accessToken = getCookie("access_token");
        if (mounted) {
          setIsAuthenticated(!!accessToken);
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
    }
    
    return () => {
      mounted = false;
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange);
      }
    };
  }, []);

  if (!isInitialized) {
    return null;
  }

  const playSong = async (song: Song) => {
    if (!isAuthenticated) return;
    if (audioRef.current) {
      if (currentSong?.id === song.id) {
        audioRef.current.play();
        setIsPlaying(true);
        return;
      }
      setIsLoading(true);
      setCurrentSong(song);
      audioRef.current.src = song.url || '';
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error('Error playing song:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const pauseSong = () => {
    if (!isAuthenticated) return;
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

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

  const handleVolumeChange = (newVolume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setVolume(newVolume);
    }
  };

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
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
      }}
    >
      <audio
        ref={audioRef}
        onTimeUpdate={() => setProgress(audioRef.current?.currentTime || 0)}
        onEnded={() => setIsPlaying(false)}
        onLoadStart={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        onError={() => setIsLoading(false)}
      />
      {children}
    </MediaContext.Provider>
  );
}

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
    };
  }

  if (!context) {
    throw new Error('useMedia must be used within a MediaProvider');
  }

  return context;
} 