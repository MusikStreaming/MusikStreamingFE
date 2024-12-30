export default async function addSongToCollection(playlistId: string, songId: string) {
  const response = await fetch(`/api/collection/${playlistId}/songs/${songId}`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Failed to add song to collection');
  }

  return response.json();
}
