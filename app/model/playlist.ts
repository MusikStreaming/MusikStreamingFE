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
}

export interface PlaylistsResponse {
  data: Playlist[];
  total: number;
}