import { defineCollection, z } from 'astro:content';
import { file, glob } from 'astro/loaders';

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

/**
 * The bench inventory. One file rather than one file per tool: the list is short,
 * it is reordered far more often than it is added to, and reordering a single
 * array is one write instead of renumbering eleven documents.
 *
 * `icon` is a simple-icons slug, resolved at build time. It is allowed to be empty
 * — not every tool has a mark that may be redistributed (Azure is one), and a tool
 * without a logo still belongs on the bench. The component falls back to a
 * monogram, so an unknown slug degrades instead of breaking the build.
 */
const toolkit = defineCollection({
  loader: file('src/content/toolkit.json'),
  schema: z.object({
    order: z.number().int().positive(),
    name: z.string().min(1).max(40),
    icon: z.string().regex(/^[a-z0-9.-]*$/).max(40),
  }),
});

export const collections = { projects, toolkit };
