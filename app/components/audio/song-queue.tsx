import SongQueueCard from "./song-queue-card";
import { Song } from "@/app/model/song";

export default function SongQueue({ 
  songs,
  ...props
}: {
  songs: Song[];
}) {
  return(
    <div className="song-queue flex flex-col gap-4" aria-label="song-queue" {...props}>
      {songs.length > 0 ? (
        songs.map((song) => (
          <SongQueueCard key={song.id} song={song} />
        ))
      ) : (
        <div className="text-center py-8 text-[--md-sys-color-outline]">
          No songs in queue
        </div>
      )}
    </div>
  );
}