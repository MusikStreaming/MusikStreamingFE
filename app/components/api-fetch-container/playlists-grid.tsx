import PlaylistCard from '../info-cards/playlist-card';
import { usePlaylists } from '@/app/hooks/use-playlists';

export default function PlaylistsGrid() {
  const { playlists, loading, error } = usePlaylists();

  if (loading) return <div>Loading playlists...</div>;
  if (error) return <div>Error: {error}</div>;
  if (playlists.length === 0) return <div>No playlists found</div>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {playlists.filter(playlist => playlist.type === "Playlist").map(
        playlist => (
          <PlaylistCard
            key={playlist.id}
            id={playlist.id}
            title={playlist.title}
            description={playlist.description}
            thumbnailurl={playlist.thumbnailurl}
          />
        )
      )}
    </div>
  );
}
