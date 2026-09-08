// All site copy lives here, both languages side by side so drift is visible.
// Turkish is written natively, not translated — same person, same voice,
// different language.

export const locales = ['en', 'tr'] as const;
export type Locale = (typeof locales)[number];

export const copy = {
  en: {
    meta: {
      title: 'Zeki Erman — Chasing Light',
      description:
        'I build things because I want to know what happens if they exist. Computer engineering, creative development, and the things I chased.',
      langName: 'English',
    },
    hero: {
      // Set as two lines on purpose: stacked and left-aligned, the title sits in
      // the dark beside the doorway instead of across its light.
      title: ['Chasing', 'Light'],
      hint: 'Scroll to follow the light',
    },
    arrival: {
      opening: ['I don’t really know', 'where this is going.'],
      aside: 'That’s usually why I start.',
      name: 'Zeki Erman',
      role: 'Computer Engineering · Creative Development',
      manifesto: ['I build things because I want to know', 'what happens if they exist.'],
    },
  },

  tr: {
    meta: {
      title: 'Zeki Erman — Chasing Light',
      description:
        'Aklıma takılan şeyleri sadece düşünmek yerine var etmeyi seviyorum. Bilgisayar mühendisliği, creative development ve peşinden gittiklerim.',
      langName: 'Türkçe',
    },
    hero: {
      // The concept keeps its name in both languages.
      title: ['Chasing', 'Light'],
      hint: 'Işığı takip etmek için kaydır',
    },
    arrival: {
      opening: ['Bunun nereye gittiğini', 'ben de bilmiyorum.'],
      aside: 'Genelde tam da bu yüzden başlıyorum.',
      name: 'Zeki Erman',
      role: 'Bilgisayar Mühendisliği · Creative Development',
      manifesto: ['Aklıma takılan şeyleri sadece düşünmek yerine,', 'var etmeyi seviyorum.'],
    },
  },
} satisfies Record<Locale, unknown>;

export type Copy = (typeof copy)['en'];

export function getCopy(locale: Locale): Copy {
  return copy[locale] as Copy;
}

/** Path to the same page in the other language. */
export function altPath(locale: Locale): string {
  return locale === 'en' ? '/tr/' : '/';
}
