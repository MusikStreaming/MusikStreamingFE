export interface Song {
  id: string;
  title: string;
  duration: number | null;
  coverImage: string;
  thumbnailurl: string;
  artists: { artist: { id: string; name: string } }[];
  releasedate?: string;
  genre?: string;
  views?: number;
  url?: string;
}