import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { copy } from '../content/copy';
import toolkit from '../content/toolkit.json';

/**
 * The deep context file, for a model asked something specific.
 *
 * `llms.txt` is the summary: who, what, where. This is the layer under it — how
 * the work is actually built, which is the only part a technical reader cannot
 * get from the page itself.
 *
 * It is generated rather than written, from the same content the site renders.
 * A second hand-written copy would be correct on the day it was written and
 * wrong the first time a project is added from the panel, and nobody would ever
 * notice, because nothing renders it.
 *
 * Everything here is verifiable: it comes from the repository, the content
 * collections, or the page's own copy. Nothing is estimated.
 */
export const GET: APIRoute = async ({ site }) => {
  const base = (site ?? new URL('https://zekierman.me')).origin;

  const projects = (await getCollection('projects')).sort((a, b) => a.data.order - b.data.order);

  const tools = (toolkit as { order: number; name: string }[])
    .sort((a, b) => a.order - b.order)
    .map((t) => t.name);

  const projectBlocks = projects
    .map((p) =>
      [
        `### ${p.data.en.name}`,
        `- URL: ${p.data.href}`,
        `- Role: ${p.data.en.meta}`,
        `- Question it answers: ${p.data.en.question}`,
        `- What it is: ${p.data.en.note}`,
        `- Turkish description: ${p.data.tr.note}`,
      ].join('\n'),
    )
    .join('\n\n');

  const body = `# Zeki Erman — full context

${copy.en.meta.description}

This file is the layer under ${base}/llms.txt. That one answers who and what;
this one answers how. It is generated from the site's own content at build time,
so it cannot drift from what the page says.

- Canonical URL: ${base}
- Contact: zekierman01@outlook.com
- Summary file: ${base}/llms.txt

## Work

${projectBlocks}

## Current toolkit

${tools.map((t) => `- ${t}`).join('\n')}

## How this site is built

The site itself is the most detailed piece of work on it, and it is open at
https://github.com/zekierman/zekierman.me — read only, all rights reserved.

- **Astro 7, static output.** Two pages, both prerendered. No client framework.
  Turkish at the root, English under /en, /tr redirecting because it was the
  Turkish URL before the two swapped.
- **The hero is a film scrubbed by scroll.** The video's \`currentTime\` follows
  the scroll position through a short requestAnimationFrame loop that eases
  toward its target rather than assigning directly — writing on every frame
  queues seeks faster than the decoder retires them and the picture stutters.
  The derivatives are cut with a six-frame GOP and no B-frames, because the
  master carries one keyframe for the whole clip and every seek would otherwise
  decode from frame zero. Playback depends on the origin honouring HTTP range
  requests.
- **Smooth scrolling is Lenis**, and it owns the page: in-page links route
  through it, because a native hash jump leaves Lenis animating back to its own
  target while the hero reads window.scrollY every frame.
- **The colours are sampled from the film**, frame by frame, with ffmpeg — not
  chosen. The darkness is warm (#0F0A06 has more red than blue) because an
  off-the-shelf blue-black put the page and the footage in different rooms.
- **The design system is halftone.** The brand mark is a halftone seagull, the
  light sections carry a halftone ground, and the transition into the dark
  footer is a halftone screen: two aligned layers on one cell whose dots shrink
  as the light gives out, which is what an ink gradient does on a press.
- **Content is files, not rows.** Projects are one JSON document each under
  src/content/projects; the bench inventory is one array. A small Fastify panel
  on the server writes those files, derives the image with ffmpeg, commits the
  change to git and rebuilds. There is no database: the store is the repository,
  so every change is a commit that can be read back and reverted.
- **The contribution graph never touches the network at build time.** A separate
  script refreshes a cached JSON file on its own schedule; the component only
  reads it. Fetching from the component took the build from 2.4s to 14.5s
  whenever GitHub was slow, once per page, and shipped a hole in the page when
  it failed.
- **Fonts are self-hosted and subset** by Astro's font pipeline — Archivo for
  interface, Instrument Serif for the editorial voice, latin and latin-ext
  because Turkish needs ş ğ ı İ ö ü ç.
- **Deployment** is a VPS running Ubuntu 24.04 behind Caddy, which terminates
  TLS and serves the static output directly. The panel listens on loopback only.

## Languages

Both languages are written natively and live side by side in one module. Neither
is a translation of the other — same person, same thought, said the way each
language says it.

## Elsewhere

- GitHub: https://github.com/zekierman
- LinkedIn: https://www.linkedin.com/in/zeki-erman-2197b3248/
- X: https://x.com/zekierman01
- Instagram: https://www.instagram.com/zekierman_/
- Email: zekierman01@outlook.com
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
