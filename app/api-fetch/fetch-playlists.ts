import { getCookie } from "cookies-next";

export default async function fetchPlaylists() {
  const session = getCookie("session")

  if (!session) {
    return;
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/collection/`, {
    method: 'GET',
    headers: {
      'cache-control': 'no-cache',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch playlists');
  }

  return response.json();
}
