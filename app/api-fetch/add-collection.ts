import { Album } from "@/app/model/album";

export async function addCollection(collection: Album) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/collection`, {
    method: 'POST',
    body: JSON.stringify(collection),
  });
  return response.json();
}
