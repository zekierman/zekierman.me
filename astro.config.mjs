// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import tailwind from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://zekierman.me',

  // Turkish lives at the root, English under /en. The site's own language is what
  // the domain people type should open in, and the apex keeps its link equity.
  i18n: {
    locales: ['tr', 'en'],
    defaultLocale: 'tr',
    routing: { prefixDefaultLocale: false },
  },

  // /tr/ was the Turkish URL before the languages swapped. Anything already
  // shared under it still has to land somewhere.
  redirects: { '/tr/': '/' },

  // Astro self-hosts, subsets and preloads these. No third-party font request,
  // no separate font pipeline to maintain.
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Archivo',
      cssVariable: '--font-sans',
      weights: [300, 400],
      styles: ['normal'],
      subsets: ['latin', 'latin-ext'],
    },
    {
      provider: fontProviders.google(),
      name: 'Instrument Serif',
      cssVariable: '--font-serif',
      weights: [400],
      styles: ['normal', 'italic'],
      subsets: ['latin', 'latin-ext'],
    },
  ],

  integrations: [sitemap({ i18n: { defaultLocale: 'tr', locales: { tr: 'tr', en: 'en' } } })],

  vite: { plugins: [tailwind()] },
});
