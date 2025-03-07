import SongContent from "./content";
import fetchSongByIdServer from "@/app/api-fetch/song-id-server";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  const song = await fetchSongByIdServer(id);

  if (!song || !song.artists) {
    return {
      title: 'Song not found',
      description: 'The song you are looking for is not found',
    };
  }

  const artistNames = song.artists.map((artist: { name: string }) => artist.name).join(", ");
  const title = `${song.title} - ${artistNames} | MusikStreaming`;
  const description = `${song.title} by ${artistNames} - Listen to the latest music on MusikStreaming`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website"
    }
  };
}

export default async function SongPage({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  const data = await fetchSongByIdServer(id);
  const initialData = data?.thumbnailurl ? { ...data, genre: data.genre ?? '' } : null;
  
  return (
    <div className="w-full max-w-full">
      <SongContent id={id} initialData={initialData} />
    </div>
  )
}