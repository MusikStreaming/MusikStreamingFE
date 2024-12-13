'use client';
import { useState, useEffect, useCallback } from 'react';
import fetchArtistById from '@/app/api-fetch/artist-by-id';
import { Artist } from '@/app/model/artist';
import Image from 'next/image';
import Skeleton from '@/app/components/loading/skeleton';
import ErrorComponent from '@/app/components/api-fetch-container/fetch-error';
// import AlbumCả from '@/app/components/info-cards/vertical-card';
import { useRouter } from 'next/navigation';
import TextButton from '@/app/components/buttons/text-button';
import { Album } from '@/app/model/album';
import { fetchAlbumsFromArtist } from '@/app/api-fetch/albums-from-artist';
import { AlbumCard } from '@/app/components/info-cards/album-card';

export default function ArtistContent({ params }: { params: Promise<{ id: string }> }) {
    const [artist, setArtist] = useState<Artist | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [albums, setAlbums] = useState<Album[]>([]);
    const router = useRouter();
    const fetchData = useCallback(async () => {
        try {
            const data = await params;
            const artist = await fetchArtistById(data.id);
            if (!artist) return;
            setArtist(artist);
            const albums = await fetchAlbumsFromArtist(data.id);
            console.log(albums);
            setAlbums(albums);
        } catch (e) {
            console.error(e);
            if (e instanceof Error) {
                setError(e.message);
            } else {
                setError(String(e));
            }
        }
    }, [params]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (error) {
        return <ErrorComponent onReloadClick={fetchData} />;
    }

    try {
        return (
            // <Suspense fallback={<Loading/>}>
            <div className="flex flex-col gap-8">
                <TextButton className='flex md:hidden text-[--md-sys-color-primary]' onClick={() => router.back()}>
                    <span className='material-symbols-outlined'>arrow_back</span>
                    Quay lại
                </TextButton>
                <div className='flex w-full'>
                    <div className='flex flex-col justify-start items-center w-full'>
                        <div className='flex items-center gap-4 w-full'>
                            {
                                artist ?
                                    <Image
                                        src={artist.avatarurl}
                                        alt={artist.name}
                                        width={200}
                                        height={200}
                                    />
                                    : <Skeleton className="w-[200px] h-[200px]" />
                            }
                            <div className="flex flex-col">
                                {
                                    artist ? <h1 className='text-2xl font-bold'>{artist.name}</h1> : <Skeleton className="w-[200px] h-6" />
                                }
                                {
                                    artist ? <p>{artist.description}</p> : <Skeleton className="w-[200px] h-6" />
                                }
                            </div>
                        </div>

                    </div>
                </div>
                <div className='flex flex-col w-full gap-4'>
                    <h2 className='text-lg font-bold'>Albums</h2>
                    <div className='grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-4'>
                        {
                            albums.map((album) => (
                                <AlbumCard
                                    type='album'
                                    key={album.id}
                                    subtitle={album.type}
                                    img={{
                                        src: album.thumbnailurl ? album.thumbnailurl : '/assets/placeholder.jpg',
                                        alt: album.title,
                                        width: 200,
                                    }}
                                    href={`/album/${album.id}`}
                                    title={album.title} />
                            ))
                        }
                    </div>
                </div>
            </div>
        );
    } catch (e) {
        console.error(e);
        return <ErrorComponent onReloadClick={fetchData} />;
    }
}