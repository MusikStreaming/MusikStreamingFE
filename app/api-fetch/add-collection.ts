import axios from 'axios';
import { getCookie } from 'cookies-next';

interface Album {
  file: File,
  title: string,
  description: string,
  type: string,
  visibility: string
}

export async function addCollection(collection: Album) {
  const token = getCookie("session_token");
  // console.log(token)
  // if (!token) {
  //   throw new Error("No authentication token found");
  // }

  const formData = new FormData();
  formData.append('file', collection.file);
  formData.append('title', collection.title);
  formData.append('description', collection.description);
  formData.append('type', collection.type);
  formData.append('visibility', collection.visibility);

  // const response = await axios.post(
  //   `${process.env.NEXT_PUBLIC_API_URL}/v1/collection`,
  //   formData,
  //   {
  //     headers: {
  //       'cache-control': 'no-cache',
  //       'cross-origin-resource-policy': 'cross-origin',
  //       'access-control-allow-origin': '*'
  //     }
  //   }
  // );
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v1/collection/`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'cache-control': 'no-cache',
        // 'cross-origin-resource-policy': 'cross-origin',
        // 'access-control-allow-origin': '*'
      }
    }
  )
  console.log(response);
  return response;
}
