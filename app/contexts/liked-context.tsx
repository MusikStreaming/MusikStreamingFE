import { createContext, useContext, useState } from "react";
import { Song } from "@/app/model/song";

const LikedContext = createContext<LikedContextType | undefined>(undefined);

interface LikedContextType {
    likedSongs: Song[];
    addLikedSong: (song: Song) => void;
    removeLikedSong: (song: Song) => void;
}

export const useLiked = () => {
    const context = useContext(LikedContext);
    if (!context) {
        throw new Error('useLiked must be used within a LikedProvider');
    }
    return context;
};
