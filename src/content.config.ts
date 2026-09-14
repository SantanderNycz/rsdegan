/* Content Collections — Jornal de Elarion (blog estático em Markdown). */
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    author: z.string().default('Robson Degan'),
    category: z.string().optional(),
    /** Slug original no WordPress (para redirect 301 do URL antigo). */
    legacySlug: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
