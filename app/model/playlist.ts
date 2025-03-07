export interface Playlist {
  id: string;
  title: string;
  type: string;
  description?: string;
  owner: {
    id: string;
    username: string;
  };
  thumbnailurl: string;
  visibility?: 'Public' | 'Private';
}

export interface PlaylistsResponse {
  data: Playlist[];
  total: number;
}