import { Song } from "@/app/model/song";

interface SongQueueCardProps {
  song: Song;
  isPlaying?: boolean;
  onRemove?: () => void;
}

export default function SongQueueCard({ song, isPlaying, onRemove }: SongQueueCardProps) {
  // ... rest of component
} 