import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

function getIconPath(filename: string): string {
  let dir = dirname(fileURLToPath(import.meta.url));
  while (dir !== dirname(dir)) {
    const candidate = join(dir, 'node_modules', 'bootstrap-icons', 'icons', filename);
    if (existsSync(candidate)) {
      return candidate;
    }
    dir = dirname(dir);
  }
  return join(process.cwd(), 'node_modules', 'bootstrap-icons', 'icons', filename);
}

function loadIcon(filename: string): string {
  const filePath = getIconPath(filename);
  const raw = readFileSync(filePath, 'utf-8');
  return raw.replace(/^<svg[^>]*>/i, '').replace(/<\/svg>\s*$/i, '').trim();
}

export const icons = {
  GitHub: loadIcon('github.svg'),
  LinkedIn: loadIcon('linkedin.svg'),
  X: loadIcon('twitter-x.svg'),
  Instagram: loadIcon('instagram.svg'),
  Email: loadIcon('envelope.svg'),
} as const;

export type IconName = keyof typeof icons;

/**
 * Interface glyphs, as opposed to the brand marks above. They live here too so
 * that one module owns every inlined icon and the whole set arrives at the same
 * optical weight from the same drawn family.
 */
export const ui = {
  menu: loadIcon('list.svg'),
  close: loadIcon('x-lg.svg'),
} as const;

/**
 * Resolves the icon inner markup for a given link.
 * Link labels are identical in English and Turkish except Email ("E-posta" in TR).
 * So we key off the mailto: href scheme for email, and match the English label for the rest.
 */
export function getLinkIcon(label: string, href: string): string {
  if (href.startsWith('mailto:')) {
    return icons.Email;
  }
  if (label in icons) {
    return icons[label as IconName];
  }
  return '';
}

/**
 * A technology's own mark, for the bench inventory.
 *
 * Resolved at build time from `simple-icons`, so nothing but the path reaches the
 * browser — no icon font, no runtime lookup, no request per logo. Returns `null`
 * when the slug is unknown or empty: brand marks come and go from that package as
 * trademark policies change (Azure is gone from it today), and a tool with no mark
 * still belongs on the bench. The component draws a monogram instead.
 *
 * These are the one place on the site where a shape is not ours. They are drawn at
 * one size, in one ink, and never in a brand's own colour — a wall of coloured
 * logos is the skills section this Lab is deliberately not.
 */
export async function techIcon(slug: string): Promise<string | null> {
  if (!slug) return null;
  const key = 'si' + slug.charAt(0).toUpperCase() + slug.slice(1).replace(/[.-]/g, '');
  try {
    const icons = (await import('simple-icons')) as unknown as Record<string, { path: string } | undefined>;
    return icons[key]?.path ?? null;
  } catch {
    return null;
  }
}

/** Two letters standing in for a mark the set does not carry. */
export function monogram(name: string): string {
  const words = name.replace(/[^\p{L}\p{N} ]/gu, ' ').trim().split(/\s+/);
  if (words.length > 1) return (words[0]![0]! + words[1]![0]!).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}
