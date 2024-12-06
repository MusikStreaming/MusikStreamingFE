'use client'
import { useLiked } from '@/app/contexts/liked-context'

export default function Favorites(){
    const { likedSongs } = useLiked();
    return (
        <div className="favorites-page">
            <h1 className="favorites-title">Favorites</h1>
            {likedSongs.map((song) => (
                <div key={song.id}>{song.title}</div>
            ))}
        </div>
    )
}