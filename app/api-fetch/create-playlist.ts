import { getCookie } from "cookies-next";

interface CreatePlaylistParams {
  title: string;
  description?: string;
  file?: File;
}

export default async function createPlaylist({ title, description, file }: CreatePlaylistParams) {
  const session = await getCookie("session");
  if (!session) {
    throw new Error("Unauthorized");
  }

  const formData = new FormData();
  formData.append('title', title);
  formData.append('description', description || '');
  formData.append('type', 'Playlist');
  formData.append('visibility', 'Public');
  if (file) {
    formData.append('file', file);
  }

  const response = await fetch(`/api/collection`, {
    method: 'POST',
    headers: {
      'cache-control': 'no-cache',
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to create playlist');
  }

  return response.json();
}
