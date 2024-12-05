export type AlbumDetails = {
  id: string;
  title: string;
  description: string | null;
  thumbnailurl: string;
  type: string;
  profiles?: {
    id?: string | null;
    name?: string | null;
    avatarurl?: string | null;
  }[] | null;
  songs?: {
    song: {
      id: string;
      title: string;
      thumbnailurl: string;
      duration?: number | null;
      views?: number | null;
    }
  }[] | null;
}