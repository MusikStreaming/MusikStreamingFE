import Image from 'next/image';
import Link from 'next/link';
import GeneralCard from './vertical-card';

interface PlaylistCardProps {
  id: string;
  title: string;
  description: string;
  thumbnailurl?: string;
  // tracksCount: number;
}

export default function PlaylistCard({ id, title, description, thumbnailurl }: PlaylistCardProps) {
  return (
    <GeneralCard
      img={{ src: thumbnailurl || '/images/playlist-default.png', alt: `Playlist ${title}` }}
      title={title}
      subtitle={description}
      href={`/playlists/${id}`}
      type="playlist"
    />
  );
}
