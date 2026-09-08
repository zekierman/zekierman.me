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
      name: 'Zeki Erman',
      role: 'Computer Engineering · Creative Development',
      manifesto: ['I build things because I want to know', 'what happens if they exist.'],
    },
    work: {
      label: 'Things I chased',
      lead: ['Some of it turned into products.', 'Some of it only taught me something.'],
      projects: [
        {
          index: '01',
          name: 'Pandoo',
          meta: 'Mobile product · Konya · two of us on the software',
          question: 'What does it take to put a loyalty card in someone’s pocket?',
          note: 'Cafes still run on paper cards that end up lost at the bottom of a wallet. Pandoo replaces them: collect a stamp, fill the card, take the reward at the counter. It shipped on both stores — which turned out to be the hard part.',
          image: '/media/work/pandoo.webp',
          href: 'https://pandoo.novantesoft.com',
        },
        {
          index: '02',
          name: 'Novante Soft ERP',
          meta: 'Platform · B2B · two of us on the software',
          question: 'Can a whole business fit on one screen?',
          note: 'Customers, quotes, invoices, VAT, stock that decrements itself the moment an invoice is issued, live central-bank rates. It starts as CRM and pre-accounting and grows with the company using it.',
          image: '/media/work/novante.webp',
          href: 'https://novantesoft.com',
        },
        {
          index: '03',
          name: 'Erman Ofset',
          meta: 'Web · Konya · on my own',
          question: 'What do thirty years of ink look like on a screen?',
          note: 'My father’s press. Heidelberg and MAN Roland machines, ten million printed pages a year, and until recently no address on the internet. Building it meant first learning what the work actually is.',
          image: '/media/work/ermanofset.webp',
          href: 'https://ermanofset.com',
        },
      ],
    },
    lab: {
      label: 'The lab',
      lead: ['Things that don’t need to become companies', 'to be worth building.'],
      items: [
        {
          name: 'coffee-brew-tracker',
          meta: 'TypeScript · mobile · open',
          note: 'A tracker for coffee recipes and brew history. It came months before Pandoo. I didn’t know at the time that it was the beginning of something.',
          href: 'https://github.com/zekierman/coffee-brew-tracker',
        },
        {
          name: 'akilli-galeri-sistemi',
          meta: 'JavaScript · zero dependencies · open',
          note: 'A gallery system for car dealerships, written without a single external package — partly because the job didn’t need them, partly to find out whether I could.',
          href: 'https://github.com/zekierman/akilli-galeri-sistemi',
        },
        {
          name: 'Client work',
          meta: 'TypeScript · private',
          note: 'Sites built for people who needed one. Closed repositories, but a good share of what I know came out of them.',
          href: '',
        },
      ],
    },
    context: {
      label: 'A little context',
      lines: ['I’m studying computer engineering.', 'But most of what I’ve learned didn’t start with a lecture.'],
      pull: 'It started with: “Can I build this?”',
      body: [
        'The answer was usually no, at first. Then it was almost. Then it was something that worked but only on my machine, and then something other people could open on their phone.',
        'I like that distance. Most of what I can do now, I learned somewhere along it.',
      ],
    },
    currently: {
      label: 'Currently',
      rows: [
        { k: 'Building', v: 'this site, and the next version of Pandoo' },
        { k: 'Learning', v: 'how video behaves on the web when you take it apart' },
        { k: 'Curious about', v: 'interfaces that feel like places rather than pages' },
      ],
    },
    closing: {
      title: 'Another door?',
      line: 'If something here looks worth building, let’s build it.',
      links: [{ label: 'GitHub', href: 'https://github.com/zekierman' }],
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
        { n: '05', label: 'Another door', href: '#another-door' },
      ],
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
      beats: [
        { at: 0.42, text: 'Bir şey ışığa doğru gidiyor.' },
        { at: 0.68, text: 'Ben de.' },
      ],
    },
    arrival: {
      opening: ['Bunun nereye gittiğini', 'ben de bilmiyorum.'],
      aside: 'Genelde tam da bu yüzden başlıyorum.',
      name: 'Zeki Erman',
      role: 'Bilgisayar Mühendisliği · Creative Development',
      manifesto: ['Aklıma takılan şeyleri sadece düşünmek yerine,', 'var etmeyi seviyorum.'],
    },
    work: {
      label: 'Peşinden gittiklerim',
      lead: ['Bazıları ürüne dönüştü.', 'Bazıları sadece bana bir şey öğretti.'],
      projects: [
        {
          index: '01',
          name: 'Pandoo',
          meta: 'Mobil ürün · Konya · yazılımda iki kişiydik',
          question: 'Bir sadakat kartı cebe nasıl girer?',
          note: 'Kafeler hâlâ cüzdanın dibinde kaybolan karton kartlarla çalışıyor. Pandoo onların yerine geçiyor: damgayı topla, kart dolsun, ödülü kasadan al. İki mağazada da yayına girdi — asıl zor kısmı orasıymış.',
          image: '/media/work/pandoo.webp',
          href: 'https://pandoo.novantesoft.com',
        },
        {
          index: '02',
          name: 'Novante Soft ERP',
          meta: 'Platform · B2B · yazılımda iki kişiydik',
          question: 'Bir işletmenin tamamı tek ekrana sığar mı?',
          note: 'Müşteriler, teklifler, faturalar, KDV, fatura kesilir kesilmez kendi kendine düşen stok, TCMB’den canlı kur. CRM ve ön muhasebeyle başlıyor, kullanan şirketle birlikte büyüyor.',
          image: '/media/work/novante.webp',
          href: 'https://novantesoft.com',
        },
        {
          index: '03',
          name: 'Erman Ofset',
          meta: 'Web · Konya · tek başıma',
          question: 'Otuz yıllık mürekkep ekranda nasıl görünür?',
          note: 'Babamın matbaası. Heidelberg ve MAN Roland makineleri, yılda on milyon sayfa baskı, ve daha düne kadar internette hiçbir adres. Bunu yaparken asıl öğrendiğim şey işin kendisi oldu.',
          image: '/media/work/ermanofset.webp',
          href: 'https://ermanofset.com',
        },
      ],
    },
    lab: {
      label: 'Lab',
      lead: ['Şirkete dönüşmesi gerekmeyen,', 'ama yapmaya değer şeyler.'],
      items: [
        {
          name: 'coffee-brew-tracker',
          meta: 'TypeScript · mobil · açık',
          note: 'Kahve reçetelerini ve demleme geçmişini tutan bir uygulama. Pandoo’dan aylar önce yazıldı. O sırada bir şeyin başlangıcı olduğunu bilmiyordum.',
          href: 'https://github.com/zekierman/coffee-brew-tracker',
        },
        {
          name: 'akilli-galeri-sistemi',
          meta: 'JavaScript · sıfır bağımlılık · açık',
          note: 'Oto galeriler için bir galeri sistemi, tek bir harici paket kullanmadan. Kısmen iş gerektirmediği için, kısmen yapabilir miyim diye.',
          href: 'https://github.com/zekierman/akilli-galeri-sistemi',
        },
        {
          name: 'Müşteri işleri',
          meta: 'TypeScript · kapalı',
          note: 'İhtiyacı olan insanlar için yapılmış siteler. Depoları kapalı, ama bildiklerimin epey bir kısmı onların içinden çıktı.',
          href: '',
        },
      ],
    },
    context: {
      label: 'Biraz bağlam',
      lines: ['Bilgisayar mühendisliği okuyorum.', 'Ama öğrendiklerimin çoğu bir derste başlamadı.'],
      pull: 'Şununla başladı: “Bunu yapabilir miyim?”',
      body: [
        'Cevap genelde önce hayırdı. Sonra neredeyse oldu. Sonra çalışan ama sadece benim bilgisayarımda çalışan bir şey, sonra başkalarının telefonunda açabildiği bir şey.',
        'Aradaki o mesafeyi seviyorum. Bugün yapabildiğim şeylerin çoğunu o mesafede öğrendim.',
      ],
    },
    currently: {
      label: 'Şu sıralar',
      rows: [
        { k: 'Yapıyorum', v: 'bu siteyi, ve Pandoo’nun bir sonraki sürümünü' },
        { k: 'Öğreniyorum', v: 'videoyu parçalarına ayırınca web’de nasıl davrandığını' },
        { k: 'Merak ediyorum', v: 'sayfadan çok mekân gibi duran arayüzleri' },
      ],
    },
    closing: {
      title: 'Başka bir kapı?',
      line: 'Burada yapmaya değer bir şey gördüysen, yapalım.',
      links: [{ label: 'GitHub', href: 'https://github.com/zekierman' }],
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
        { n: '05', label: 'Başka bir kapı', href: '#another-door' },
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
  return locale === 'en' ? '/tr/' : '/';
}
