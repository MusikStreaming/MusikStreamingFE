import { getCookie } from "cookies-next";

interface AddToPlaylistParams {
  playlistId: string;
  songId: string;
}

export default async function addToPlaylist({ playlistId, songId }: AddToPlaylistParams) {
  const session = await getCookie("session");
  if (!session) {
    throw new Error("Unauthorized");
  }

  const response = await fetch(`/api/collection/${playlistId}/songs/${songId}`, {
    method: 'POST',
    headers: {
      'cache-control': 'no-cache',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to add song to playlist');
  }

  return response.json();
}
