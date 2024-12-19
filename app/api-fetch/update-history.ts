import axios from "axios";

export default async function updateHistory(songId: string): Promise<void> {
  try {
    await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/v1/user/me/history`, {
      song_id: songId,
    }, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('session_token'),
      },
    });
  } catch (e) {
    console.error(e);
  }
}