export interface Song {
  id: string;
  title: string;
  duration: number | null;
  thumbnailurl: string;
  artists: { artist: { id: string; name: string } }[];
  releasedate?: string;
  genre?: string;
  views?: number;
  url?: string;
}