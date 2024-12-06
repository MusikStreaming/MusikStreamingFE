'use client';
import axios from "axios";
import { getCookie } from "cookies-next";
import z from "zod";

const UserSchema = z.object({
  data: z.object({
    id: z.string(),
    avatarurl: z.string(),
    username: z.string(),
    role: z.string(),
    country: z.string(),
  }),
});

const AlternativeUserSchema = z.object({
  id: z.string(),
  avatarurl: z.string(),
  username: z.string(),
  role: z.string(),
  country: z.string(),
});

export default async function fetchUserById(id: string) {
  if (!process.env.NEXT_PUBLIC_API_URL) {
    throw new Error('API URL not set');
  }
  const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/v1/user/${id}`, {
    headers: {
      'Authorization': `Bearer ${getCookie('access_token') || id}`
    }
  });
  try {
    const data = UserSchema.parse(JSON.parse(res.data));
    return data.data;
  } catch (error) {
    console.error(error);
    const data = AlternativeUserSchema.parse(JSON.parse(res.data));
    return data;
  }
}