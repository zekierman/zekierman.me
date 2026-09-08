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
