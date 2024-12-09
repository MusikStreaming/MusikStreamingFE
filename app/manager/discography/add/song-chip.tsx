import { Song } from "@/app/model/song";

export default function SongChip({ song, onDelete }: { song: Song, onDelete: () => void }) {
  return <div>{song.title}</div>;
}