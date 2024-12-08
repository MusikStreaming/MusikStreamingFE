import { z } from "zod";

export const AlbumSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  thumbnailurl: z.string(),
  profiles: z.array(z.object({
    id: z.string().optional().nullable(),
    name: z.string().optional().nullable(),
    avatarurl: z.string().optional().nullable(),
  })).optional().nullable(),
  type: z.string(),
  songs: z.array(
    z.object({
      song: z.object({
        id: z.string(),
        title: z.string(),
        thumbnailurl: z.string(),
        duration: z.number().nullable().optional(),
        views: z.number().nullable().optional(),
        artists: z.array(z.object({
          name: z.string()
        })).optional(),
      })
    })
  ).optional().nullable(),
});

export const AlternativeAlbumSchema = z.object({
  data: AlbumSchema
});