// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import tailwind from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://zekierman.me',

  // English lives at the root, Turkish under /tr. The apex keeps its link equity
  // and shared URLs stay clean, with no redirect hop on the domain people type.
  i18n: {
    locales: ['en', 'tr'],
    defaultLocale: 'en',
    routing: { prefixDefaultLocale: false },
  },

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

  integrations: [sitemap({ i18n: { defaultLocale: 'en', locales: { en: 'en', tr: 'tr' } } })],

  vite: { plugins: [tailwind()] },
});
