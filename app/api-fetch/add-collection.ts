import axios from 'axios';

interface Album {
  file: File,
  title: string,
  description: string,
  type: string,
  visibility: string
}

export async function addCollection(collection: Album) {
  const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/v1/collection`, collection);
  console.log(response.data);
  return response.data;
}
