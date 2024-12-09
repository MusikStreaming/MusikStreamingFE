import { Artist } from "@/app/model/artist";

export default function ArtistChip({ artist, onDelete }: { artist: Artist, onDelete: () => void }) {
  return <div>{artist.name}</div>;
}