// All site copy lives here, both languages side by side so drift is visible.
// Turkish is written natively, not translated — same person, same voice,
// different language.

export const locales = ['en', 'tr'] as const;
export type Locale = (typeof locales)[number];

// The name and the role are said twice on the page: once on arrival, once at the
// foot. They are one fact, so they are written once. Two copies drift — the
// footer was still introducing him as something he had stopped calling himself.
const identity = {
  en: { name: 'Zeki Erman', role: 'Computer Engineering · Product Builder' },
  tr: { name: 'Zeki Erman', role: 'Bilgisayar Mühendisliği · Product Builder' },
};

export const copy = {
  en: {
    meta: {
      title: 'Zeki Erman — Chasing Light',
      description:
        'Zeki Erman — 3rd-year computer engineering student at Necmettin Erbakan Üniversitesi. Builds web and mobile products: Pandoo, Novante Soft ERP, Erman Ofset.',
      langName: 'English',
    },
    hero: {
      // Set as two lines on purpose: stacked and left-aligned, the title sits in
      // the dark beside the doorway instead of across its light.
      title: ['Chasing', 'Light'],
      hint: 'Scroll to follow the light',
      // One word, for the cursor. The sentence above is too long to sit on a pointer.
      scrollLabel: 'SCROLL',
      // Lines that surface during the flight and are gone before the doorway.
      // `at` is scroll progress through the hero; they never overlap the title.
      beats: [
        { at: 0.42, text: 'Something is moving toward the light.' },
        { at: 0.68, text: 'So am I.' },
      ],
    },
    arrival: {
      opening: ['I don’t really know', 'where this is going.'],
      aside: 'That’s usually why I start.',
      ...identity.en,
      manifesto: ['I build things because I want to know', 'what happens if they exist.'],
    },
    // The projects themselves are a content collection now, one file each, so the
    // admin panel can add one without editing this module. Only the section's own
    // words are left here.
    work: {
      label: 'Things I chased',
      lead: ['Some of it turned into products.', 'Some of it only taught me something.'],
    },
    lab: {
      label: 'The lab',
      lead: ['Things that don’t need to become companies', 'to be worth building.'],
      items: [
        {
          name: 'coffee-brew-tracker',
          meta: '[TypeScript] · mobile · open',
          note: 'A mobile tracker for brew ratios, grind sizes, and pour history. Built purely out of curiosity months before Pandoo, long before I knew I would be building software for cafes.',
          href: 'https://github.com/zekierman/coffee-brew-tracker',
        },
        {
          name: 'akilli-galeri-sistemi',
          meta: '[JavaScript] · zero dependencies · open',
          note: 'A showcase system for auto dealerships, written without a single npm package or external library. Partly because the problem did not require one, partly to see how far vanilla JavaScript could carry it.',
          href: 'https://github.com/zekierman/akilli-galeri-sistemi',
        },
        {
          name: 'Client work',
          meta: '[TypeScript] · private',
          note: 'Custom interfaces and web tools built for specific client needs. Closed repositories, but most of my production discipline and edge-case reflexes came out of those deadlines.',
          href: '',
        },
      ],
    },
    context: {
      label: 'A little context',
      lines: [
        'Third-year computer engineering student at Necmettin Erbakan Üniversitesi.',
        'Yet most of what I know never started in a lecture hall.',
      ],
      pull: 'It started with: “Can I build this?”',
      body: [
        'At first, the answer was almost always no. Then it became almost. Then something that worked only on my local machine, and eventually something people actually run on their phones.',
        'I respect that distance. Most of what I can build today, I learned somewhere along that stretch.',
      ],
    },
    // The page ends on the name and the ways to reach it. No closing line: the
    // work has already made the case, and a sign-off after it only repeats.
    profile: {
      ...identity.en,
      linksLabel: 'Elsewhere',
      links: [
        { label: 'GitHub', handle: 'zekierman', href: 'https://github.com/zekierman' },
        { label: 'LinkedIn', handle: 'Zeki Erman', href: 'https://www.linkedin.com/in/zeki-erman-2197b3248/' },
        { label: 'X', handle: '@zekierman01', href: 'https://x.com/zekierman01' },
        { label: 'Instagram', handle: '@zekierman_', href: 'https://www.instagram.com/zekierman_/' },
        { label: 'Email', handle: 'zekierman01@outlook.com', href: 'mailto:zekierman01@outlook.com' },
      ],
      sign: 'Zeki Erman © 2026',
      tail: 'Still chasing light.',
    },
    index: {
      open: 'Index',
      close: 'Close',
      items: [
        { n: '01', label: 'The door', href: '#the-door' },
        { n: '02', label: 'Things I chased', href: '#things-i-chased' },
        { n: '03', label: 'The lab', href: '#the-lab' },
        { n: '04', label: 'Context', href: '#context' },
        { n: '05', label: 'Elsewhere', href: '#another-door' },
      ],
    },
  },

  tr: {
    meta: {
      title: 'Zeki Erman — Chasing Light',
      description:
        'Zeki Erman: Necmettin Erbakan Üniversitesi 3. sınıf bilgisayar mühendisliği öğrencisi. Web ve mobil ürünler üretiyor: Pandoo, Novante Soft ERP, Erman Ofset.',
      langName: 'Türkçe',
    },
    hero: {
      // The concept keeps its name in both languages.
      title: ['Chasing', 'Light'],
      hint: 'Işığı takip etmek için kaydır',
      scrollLabel: 'KAYDIR',
      beats: [
        { at: 0.42, text: 'Bir şey ışığa doğru gidiyor.' },
        { at: 0.68, text: 'Ben de.' },
      ],
    },
    arrival: {
      opening: ['Bunun nereye gittiğini', 'ben de bilmiyorum.'],
      aside: 'Genelde tam da bu yüzden başlıyorum.',
      ...identity.tr,
      manifesto: ['Aklıma takılan şeyleri sadece düşünmek yerine,', 'var etmeyi seviyorum.'],
    },
    work: {
      label: 'Peşinden gittiklerim',
      lead: ['Bazıları ürüne dönüştü.', 'Bazıları sadece bana bir şey öğretti.'],
    },
    lab: {
      label: 'Lab',
      lead: ['Şirkete dönüşmesi gerekmeyen,', 'ama yapmaya değer şeyler.'],
      items: [
        {
          name: 'coffee-brew-tracker',
          meta: '[TypeScript] · mobil · açık',
          note: 'Filtre kahve reçetelerini, su-kahve oranlarını ve demleme sürelerini kaydeden mobil uygulama. Pandoo’dan aylar önce meraktan yazdım; sonradan kahve sektörüne gireceğimi o zaman bilmiyordum.',
          href: 'https://github.com/zekierman/coffee-brew-tracker',
        },
        {
          name: 'akilli-galeri-sistemi',
          meta: '[JavaScript] · sıfır bağımlılık · açık',
          note: 'Oto galeriler için tek bir harici kütüphane veya npm paketi kullanmadan yazılmış vitrin sistemi. Kısmen iş fazlasını istemediği için, kısmen de sıfırdan saf JavaScript ile neler yapılabileceğini görmek için.',
          href: 'https://github.com/zekierman/akilli-galeri-sistemi',
        },
        {
          name: 'Müşteri işleri',
          meta: '[TypeScript] · kapalı',
          note: 'Farklı sektörlerdeki işletmeler için hazırladığım özel web arayüzleri ve yönetim araçları. Kodları kapalı, ama bugün bildiğim pratik reflekslerin çoğu o teslim tarihlerinde oturdu.',
          href: '',
        },
      ],
    },
    context: {
      label: 'Biraz bağlam',
      lines: [
        'Necmettin Erbakan Üniversitesi’nde 3. sınıf bilgisayar mühendisliği öğrencisiyim.',
        'Ama öğrendiklerimin çoğu amfilerde başlamadı.',
      ],
      pull: 'Şununla başladı: “Bunu yapabilir miyim?”',
      body: [
        'Cevap önce genelde hayırdı. Sonra neredeyse oldu. Sonra sadece kendi makinemde derlenen bir şey, en sonunda da başka insanların cebinde çalışan bir uygulama.',
        'Fikirle çalışan kod arasındaki o mesafeyi seviyorum. Bugün bildiklerimin çoğunu o yolda yürürken öğrendim.',
      ],
    },
    profile: {
      ...identity.tr,
      linksLabel: 'Başka yerlerde',
      links: [
        { label: 'GitHub', handle: 'zekierman', href: 'https://github.com/zekierman' },
        { label: 'LinkedIn', handle: 'Zeki Erman', href: 'https://www.linkedin.com/in/zeki-erman-2197b3248/' },
        { label: 'X', handle: '@zekierman01', href: 'https://x.com/zekierman01' },
        { label: 'Instagram', handle: '@zekierman_', href: 'https://www.instagram.com/zekierman_/' },
        { label: 'E-posta', handle: 'zekierman01@outlook.com', href: 'mailto:zekierman01@outlook.com' },
      ],
      sign: 'Zeki Erman © 2026',
      tail: 'Hâlâ ışığın peşinde.',
    },
    index: {
      open: 'İçindekiler',
      close: 'Kapat',
      items: [
        { n: '01', label: 'Kapı', href: '#the-door' },
        { n: '02', label: 'Peşinden gittiklerim', href: '#things-i-chased' },
        { n: '03', label: 'Lab', href: '#the-lab' },
        { n: '04', label: 'Bağlam', href: '#context' },
        { n: '05', label: 'Bağlantılar', href: '#another-door' },
      ],
    },
  },
} satisfies Record<Locale, unknown>;

export type Copy = (typeof copy)['en'];

export function getCopy(locale: Locale): Copy {
  return copy[locale] as Copy;
}

/** Path to the same page in the other language. */
export function altPath(locale: Locale): string {
  return locale === 'tr' ? '/en/' : '/';
}

/**
 * Splits a meta line on `[…]` marks. Parts inside the brackets must keep English
 * casing: `.meta` is uppercased in CSS, and under `lang="tr"` that turns
 * "TypeScript" into "TYPESCRİPT". The surrounding Turkish words need the Turkish
 * rules, so the split has to happen in the markup, not around the whole line.
 */
export function metaParts(meta: string): { text: string; en: boolean }[] {
  return meta
    .split(/\[(.+?)\]/g)
    .map((text, i) => ({ text, en: i % 2 === 1 }))
    .filter((part) => part.text !== '');
}
