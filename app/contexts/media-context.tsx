/**
 * Media Context and Provider for handling audio playback functionality
 * @module MediaContext
 */

'use client';

import { createContext, useContext, useRef, useState, useEffect, useCallback } from 'react';
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
}

/**
 * Updates the media session metadata
 * @param {Song} song - Current song
 */


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
  const [isDragging, setIsDragging] = useState(false);
  const [dragProgress, setDragProgress] = useState(0);
  const [previousSong, setPreviousSong] = useState<Song | null>(null);
  const [nextSong, setNextSong] = useState<Song | null>(null);

  const updateMediaSession = (song: Song) => {
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
  };

  useEffect(() => {
    const handleAuthChange = (isAuth: boolean) => {
      if (!isAuth) {
        // Clear audio state
        const audio = audioRef.current;
        if (audio) {
          audio.pause();
          audio.src = '';
          audio.load();
          console.log('Audio cleared');
          console.log(audio);
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
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audio.src = '';
        audio.load();
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

  // Debounced seek function
  const debouncedSeek = useCallback(
    debounce((time: number) => {
      if (audioRef.current) {
        audioRef.current.currentTime = time;
      }
    }, 100),
    []
  );

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
   * Starts playing a song
   * @param {Song} song - Song to play
   */
  const playSong = async (song: Song) => {
    if (!isAuthenticated) return;
    
    if (currentSong?.id === song.id && audioRef.current) {
      audioRef.current.play();
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing';
      }
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
        if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = 'playing';
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
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
      }
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
        if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = 'playing';
        }
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

  const playPreviousSong = () => {
    console.log('playPreviousSong');
    if (audioRef.current && progress > 0) {
      seekTo(0);
      audioRef.current.play();
    }
  };

  const playNextSong = () => {
    console.log('playNextSong');
  };

  return (
    <MediaContext.Provider
      value={{
        currentSong,
        isPlaying,
        isLoading,
        progress: isDragging ? dragProgress : progress,
        volume,
        playSong,
        pauseSong,
        resumeSong,
        setVolume: handleVolumeChange,
        seekTo,
        isQueueVisible,
        toggleQueue,
        handleSeekStart,
        handleSeekEnd,
        isDragging,
        playPreviousSong,
        playNextSong,
      }}
    >
      <audio
        ref={audioRef}
        onTimeUpdate={(e) => {
          const audio = e.currentTarget as HTMLAudioElement;
          updateProgress(audio.currentTime);
          // Update media session position state
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
      handleSeekStart: () => {},
      handleSeekEnd: () => {},
      isDragging: false,
      playPreviousSong: () => {},
      playNextSong: () => {},
    };
  }

  if (!context) {
    throw new Error('useMedia must be used within a MediaProvider');
  }

  return context;
}