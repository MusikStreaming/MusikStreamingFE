import Image from 'next/image';
import Link from 'next/link';

interface ArtistLinkProps {
    artists: {
        id: string | null | undefined;
        name: string | null | undefined;
        avatarurl: string | null | undefined;
    }[];
}

export default function ArtistLinks({ artists }: ArtistLinkProps) {
  return (
    <div className="flex items-center gap-3">
      {/* Cascading Avatars */}
      <div className="flex">
        {artists.map((artistData, index) => (
          <div 
            key={artistData.id}
            className={`relative ${index > 0 ? '-ml-4' : ''}`}
          >
            <Link href={`/artist/${artistData.id}`} className="border-1 border-[--md-sys-color-outline-variant]">
              <Image
                src={artistData.avatarurl || '/assets/placeholder.jpg'}
                alt={artistData.name || 'Artist'}
                width={40}
                height={40}
                className="rounded-full w-10 h-10 object-cover border-1 border-[--md-sys-color-outline-variant]"
              />
            </Link>
          </div>
        ))}
      </div>

      {/* Artist Names */}
      <div className="flex flex-wrap gap-1 items-center">
        {artists.map((artistData, index) => (
          <span key={artistData.id}>
            <Link 
              href={`/artist/${artistData.id}`}
              className="font-medium hover:underline"
            >
              {artistData.name}
            </Link>
            {index < artists.length - 1 && ", "}
          </span>
        ))}
      </div>
    </div>
  );
}