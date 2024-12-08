import z from "zod";

export const AuthResponse = z.object({
  user: z.object({
      id: z.string(),
      aud: z.string(),
      role: z.string().optional(), // User, Admin, Artist Manager
      username: z.string().optional(),
  }),
  session: z.object({
      access_token: z.string().optional(),
      expires_in: z.number().optional(),
      refresh_token: z.string().optional(),
  }).optional(),
})
