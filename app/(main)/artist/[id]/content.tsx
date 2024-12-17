'use client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import fetchArtistById from '@/app/api-fetch/artist-by-id';
import Image from 'next/image';
import Skeleton from '@/app/components/loading/skeleton';
import ErrorComponent from '@/app/components/api-fetch-container/fetch-error';
import { useRouter } from 'next/navigation';
import TextButton from '@/app/components/buttons/text-button';
import { fetchAlbumsFromArtist } from '@/app/api-fetch/albums-from-artist';
import { AlbumCard } from '@/app/components/info-cards/album-card';
import { useState } from 'react';

const styles = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .animate-fade-in {
        animation: fadeIn 0.2s ease-out;
    }

    .animate-slide-up {
        animation: slideUp 0.3s ease-out;
    }
`;

/**
 * Component to display artist content including artist details and their albums.
 * @param {Object} params - The parameters containing the artist ID.
 * @returns {JSX.Element} The rendered component.
 */
export default function ArtistContent({ params }: { params: Promise<{ id: string }> }) {
    const queryClient = useQueryClient();
    const router = useRouter();
    const [showPopup, setShowPopup] = useState(false);

    // Fetch albums by artist using react-query
    const { data: albumsByArtist, error } = useQuery({
        queryKey: ["albums-artist", (params as Promise<{ id: string }>)],
        queryFn: async () => {
            const { id } = await params;
            return fetchAlbumsFromArtist(id);
        }
    });

    // Fetch artist details using react-query
    const { data: artist } = useQuery({
        queryKey: ["artist", (params as Promise<{ id: string }>)],
        queryFn: async () => {
            const { id } = await params;
            return fetchArtistById(id);
        }
    });

    const ArtistDetailPopup = () => {
        if (!artist || !showPopup) return null;

        return (
            <div 
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in"
                onClick={() => setShowPopup(false)}
            >
                <div 
                    className="bg-[--md-sys-color-surface] p-6 rounded-lg max-w-2xl w-full m-4 animate-slide-up"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <Image
                                src={artist.avatarurl}
                                alt={artist.name}
                                width={100}
                                height={100}
                                className="rounded-lg"
                            />
                            <h2 className="text-2xl font-bold">{artist.name}</h2>
                        </div>
                        <button 
                            onClick={() => setShowPopup(false)}
                            className="text-[--md-sys-color-primary]"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <p className="whitespace-pre-wrap">{artist.description}</p>
                </div>
            </div>
        );
    };

    // Handle error state
    if (error) {
        return <ErrorComponent onReloadClick={() => queryClient.invalidateQueries({ queryKey: ["albums-artist"] })} />;
    }

    try {
        return (
            <>
                <style jsx global>{styles}</style>
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
                                        artist
                                            ? <p>
                                                <span className='line-clamp-2 text-ellipsis'>{artist.description}</span>
                                                {
                                                    artist.description && artist.description.length > 100 && 
                                                    <button 
                                                        className='text-[--md-sys-color-primary] ml-1' 
                                                        type='button'
                                                        onClick={() => setShowPopup(true)}
                                                    >
                                                        See more
                                                    </button>
                                                }
                                            </p>
                                            : <Skeleton className="w-[200px] h-6" />
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='flex flex-col w-full gap-4'>
                        <h2 className='text-lg font-bold'>Albums</h2>
                        <div className='grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-4'>
                            {
                                albumsByArtist && albumsByArtist.map((album) => (
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
                    <ArtistDetailPopup />
                </div>
            </>
        );
    } catch (e) {
        console.error(e);
        return <ErrorComponent onReloadClick={() => queryClient.invalidateQueries({ queryKey: ["albums-artist"] })} />;
    }
}
