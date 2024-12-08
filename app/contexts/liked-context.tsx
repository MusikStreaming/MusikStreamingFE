'use client';

import { createContext, useContext, useState } from "react";
import { Song } from "@/app/model/song";

/**
 * Interface defining the shape of the LikedContext
 */
interface LikedContextType {
    /** Array of songs that have been liked by the user */
    likedSongs: Song[];
    /** Function to add a song to liked songs */
    addLikedSong: (song: Song) => void;
    /** Function to remove a song from liked songs */
    removeLikedSong: (song: Song) => void;
}

/**
 * Context for managing liked songs state across the application
 */
const LikedContext = createContext<LikedContextType | undefined>(undefined);

/**
 * Custom hook to access the LikedContext
 * @returns {LikedContextType} The liked songs context value
 * @throws {Error} If used outside of LikedProvider
 */
export const useLiked = () => {
    const context = useContext(LikedContext);
    if (!context) {
        throw new Error('useLiked must be used within a LikedProvider');
    }
    return context;
};

/**
 * Provider component for the LikedContext
 * Wraps children with liked songs context functionality
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to wrap
 * @returns {JSX.Element} Provider component
 */
export const LikedProvider = ({ children }: { children: React.ReactNode }) => {
    const [likedSongs, setLikedSongs] = useState<Song[]>([]);

    const addLikedSong = (song: Song) => {
        setLikedSongs(prev => [...prev, song]);
    };

    const removeLikedSong = (song: Song) => {
        setLikedSongs(prev => prev.filter(s => s.id !== song.id));
    };

    const value = {
        likedSongs,
        addLikedSong,
        removeLikedSong
    };

    return <LikedContext.Provider value={value}>{children}</LikedContext.Provider>;
};
