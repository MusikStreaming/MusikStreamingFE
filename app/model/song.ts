export interface Song {
  id: string;
  title: string;
  thumbnailurl: string;
  duration: number;
  releasedate: string;
  genre: string;
  views: number;
  url?: string;
  coverImage?: string;
  artists: { artist: { id: string; name: string; } }[];
}