import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    ogImage: z.string().optional(),
  }),
});

const submissions = defineCollection({
  loader: glob({ base: './src/content/submissions', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    author: z.string(),
    authorTitle: z.string().optional(),
    location: z.string().optional(),
    pubDate: z.coerce.date(),
    featured: z.boolean().default(true),
    model: z.string().optional(),
    summary: z.string(),
    coverImage: z.string(),
    coverAlt: z.string().optional(),
    images: z
      .array(z.object({ src: z.string(), alt: z.string() }))
      .default([]),
    video: z
      .object({
        provider: z.enum(['youtube', 'file']).default('youtube'),
        embedId: z.string().optional(),
        src: z.string().optional(),
        poster: z.string().optional(),
        title: z.string().optional(),
      })
      .optional(),
    order: z.number().default(0),
  }),
});

export const collections = { blog, submissions };
