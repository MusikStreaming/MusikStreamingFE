'use client'
import { useLiked } from '@/app/contexts/liked-context'
import SongTable from '@/app/components/tables/song-table'

export default function Favorites(){
    const { likedSongs } = useLiked();
    return (
        <div className="favorites-page w-full">
            <h1 className="favorites-title">Favorites</h1>
            <SongTable songs={likedSongs.map(song => ({ 
                song: {
                    ...song,
                    coverImage: song.thumbnailurl,
                    artists: song.artists?.map(a => ({ name: a.artist.name }))
                }
            }))} showImage={true} />
        </div>
    )
}