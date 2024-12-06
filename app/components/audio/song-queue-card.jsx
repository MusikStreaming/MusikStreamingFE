import Image from "next/image";

export default function SongQueueCard({ song }) {
  return(
    <div className="song-queue-card flex items-center gap-4" aria-label="song-queue-card">
      <input type="checkbox" className="checkbox rounded-full" />
      <div className="song-queue-card-cover-image rounded-full">
        <Image src={song.coverImage} alt={song.title} width={52} height={52} />
      </div>
      <div className="song-queue-card-title-info flex flex-col gap-1">
        <p className="song-queue-card-title-text">{song.title}</p>
        <p className="song-queue-card-artist-text">{song.artists.join(", ")}</p>
      </div>
      <div className="card-drag-handle">
        <span className="material-symbols-outlined">drag_indicator</span>
      </div>
    </div>
  );
}