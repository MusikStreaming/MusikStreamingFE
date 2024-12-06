import SongContent from "./content";
import fetchSongByIdServer from "@/app/api-fetch/song-id-server";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  const song = await fetchSongByIdServer(id);
  if (song) {
    return {
      title: `${song.title} - ${song.artists.map((artist: { name: string }) => artist.name).join(", ")} | MusikStreaming`,
      description: `${song.title} by ${song.artists.map((artist: { name: string }) => artist.name).join(", ")} - Listen to the latest music on MusikStreaming`,
      openGraph: {
        title: `${song.title} - ${song.artists.map((artist: { name: string }) => artist.name).join(", ")} | MusikStreaming`,
        description: `${song.title} by ${song.artists.map((artist: { name: string }) => artist.name).join(", ")} - Listen to the latest music on MusikStreaming`,
        type: "website"
      }
    };
  }
  else {
    return {
      title: 'Song not found',
      description: 'The song you are looking for is not found',
    }
  }
}

export default async function SongPage({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  const data = await fetchSongByIdServer(id);
  const initialData = data?.thumbnailurl ? data : null;
  
  return (
    <SongContent id={id} initialData={initialData} />
  )
}