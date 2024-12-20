import React from 'react';
import { CardProps } from '@/app/model/card-props';
import { useMedia } from '@/app/contexts/media-context';
import { hasCookie } from 'cookies-next';
import { redirectToLogin } from '@/app/services/auth.service';
import fetchAlbumById from '@/app/api-fetch/album-by-id';
import GeneralCard from '@/app/components/info-cards/vertical-card';

export function AlbumCard(props: CardProps) {
  const { playList } = useMedia();

  const handlePlayClick = async () => {
    console.log("AlbumCard: handlePlayClick");
    try {
      const album = await fetchAlbumById(props.listID || '');
      if (album.songs && album.songs.length > 0) {
        const mappedSongs = album.songs.map(s => {
          if (!s.song) {
            throw new Error('Invalid song data');
          }
          return {
            id: s.song.id,
            title: s.song.title,
            duration: s.song.duration || null,
            thumbnailurl: s.song.thumbnailurl || '/assets/placeholder.jpg',
            artists: s.song.artists?.map(a => ({ 
              artist: {
                id: a.id || "#",  // Make sure we're using the artist's actual ID
                name: a.name || ''
              }
            })) || []
          };
        });
        // Use playList which will handle both adding songs to queue and playing first song
        playList(mappedSongs);
      }
    } catch (error) {
      console.error('Error playing album:', error);
    }
  };

  return <GeneralCard {...props} onClick={handlePlayClick} />;
}