import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * The work is data, not copy. It lives one file per project so the admin panel can
 * add one by writing a file — no parsing of a TypeScript module, and every change
 * lands in git where a bad edit can be read back and undone.
 *
 * Both languages sit in the same file on purpose: they are two ways of saying one
 * thing about one project, and keeping them together is what makes drift visible.
 */
const localised = z.object({
  name: z.string().min(1),
  meta: z.string().min(1),
  question: z.string().min(1),
  note: z.string().min(1),
});

const projects = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/projects' }),
  schema: z.object({
    /** Position on the page. The visible 01/02/03 is derived from it, never typed. */
    order: z.number().int().positive(),
    href: z.string().url(),
    /** Path under public/, produced by tools/encode.sh or by the panel's upload. */
    image: z.string().startsWith('/media/work/'),
    en: localised,
    tr: localised,
  }),
});

export const collections = { projects };
