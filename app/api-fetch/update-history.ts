import axios from "axios";

export default async function updateHistory(songId: string): Promise<void> {
  console.log(songId);
  try {
    const request = {
      method: 'post',
      url: "/api/user/history",
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        songid: songId,
      },
    }
    console.log(request)
    await axios.request(request);
  } catch (e) {
    console.error(e);
  }
}