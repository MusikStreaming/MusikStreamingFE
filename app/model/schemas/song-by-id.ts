import z from "zod";

export const SongSchema = z.object({
    id: z.string(),
    title: z.string(),
    thumbnailurl: z.string().optional(),
    duration: z.number(),
    releasedate: z.string(),
    genre: z.string(),
    views: z.number(),
    albums: z.array(
        z.object({
            album: z.object({
                id: z.string().optional(),
                type: z.string().optional(),
                title: z.string().optional(),
                thumbnailurl: z.string().optional(),
            })
        }).optional()
    ).nullable(),
    artists: z.array(z.object({
        id: z.string(),
        name: z.string(),
        avatarurl: z.string(),
    })
    )
});

export const AlternativeSongSchema = z.object({
    data: z.object({
        id: z.string(),
        title: z.string(),
        thumbnailurl: z.string().optional(),
        duration: z.number(),
        releasedate: z.string(),
        genre: z.string(),
        views: z.number(),
        albums: z.array(
            z.object({
                album: z.object({
                    id: z.string().optional(),
                    type: z.string().optional(),
                    title: z.string().optional(),
                    thumbnailurl: z.string().optional(),
                })
            }).optional()
        ).nullable(),
        artists: z.array(z.object({
            id: z.string(),
            name: z.string(),
            avatarurl: z.string(),
        })
        )
    })
}); 