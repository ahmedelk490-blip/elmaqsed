export type Site = {
  name: string; nameEn: string; tagline: string; description: string; url: string;
  whatsapp: string; whatsapp2?: string; phone: string; phone2?: string; email: string; city: string; cr: string; license: string; hours: string;
  footerNote: string; disclaimer: string; priceIncludes?: string; priceExcludes?: string;
  social: { instagram: string; x: string; tiktok: string; snapchat: string };
};
export type NavItem = { href: string; label: string };
export type Stat = { value: number; suffix: string; label: string; decimals?: number };
export type Service = { icon: string; title: string; text: string; bullets: string[]; img: string };
export type Step = { n: string; title: string; text: string };
export type Country = { slug: string; name: string; en: string; code: string; kind: string; time: string; types: string[]; reqs: string[]; note: string; img: string; group?: string; price?: string };
export type EsimDest = { name: string; en: string; code: string };
export type Why = { title: string; text: string };
export type Faq = { q: string; a: string; cat: string };
export type Testimonial = { name: string; city: string; visa: string; text: string };
export type About = { title: string; intro: string; story: string[]; values: { title: string; text: string }[] };
export type Content = {
  site: Site; nav: NavItem[]; stats: Stat[]; services: Service[]; steps: Step[]; countries: Country[];
  why: Why[]; faq: Faq[]; testimonials: Testimonial[]; about: About; esim: EsimDest[];
};

export const waLink = (whatsapp: string, msg = "السلام عليكم، أرغب في استشارة بخصوص تأشيرة السفر") =>
  `https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`;

// eSIM requests ask how long the trip is; the hero passes the index, the booking form shows the text
// pick-up / departure times offered in the search box and the request form, every half hour
export const TIMES = Array.from({ length: 48 }, (_, i) => `${String(Math.floor(i / 2)).padStart(2, "0")}:${i % 2 ? "30" : "00"}`);
export const TRIP_LENGTHS = ["حتى 7 أيام", "8 – 15 يوماً", "16 – 30 يوماً", "أكثر من شهر"];
export const TRIP_LENGTHS_EN = ["Up to 7 days", "8 – 15 days", "16 – 30 days", "Over a month"];

// Country of a contact number, read from its dialling code, so the floating buttons can show a flag per number.
const REGIONS: [string, string, string, string][] = [
  ["966", "sa", "السعودية", "Saudi Arabia"], ["971", "ae", "الإمارات", "UAE"], ["20", "eg", "مصر", "Egypt"], ["965", "kw", "الكويت", "Kuwait"],
  ["974", "qa", "قطر", "Qatar"], ["973", "bh", "البحرين", "Bahrain"], ["968", "om", "عُمان", "Oman"], ["962", "jo", "الأردن", "Jordan"],
];
export type Line = { dial: string; tel: string; shown: string; flag: string; ar: string; en: string };
const line = (raw: string, plus: boolean): Line => {
  const digits = raw.replace(/\D/g, "");
  const r = REGIONS.find(([code]) => digits.startsWith(code));
  return { dial: digits, tel: plus ? `+${digits}` : raw.replace(/[^\d+]/g, ""), shown: plus ? `+${digits}` : raw.trim(), flag: r?.[1] ?? "", ar: r?.[2] ?? raw.trim(), en: r?.[3] ?? raw.trim() };
};
/** The call numbers and WhatsApp numbers set in the dashboard (the second of each is optional). */
export const contactLines = (site: Pick<Site, "phone" | "phone2" | "whatsapp" | "whatsapp2">) => ({
  calls: [site.phone, site.phone2].filter((p): p is string => !!p?.trim()).map((p) => line(p, false)),
  chats: [site.whatsapp, site.whatsapp2].filter((p): p is string => !!p?.trim()).map((p) => line(p, true)),
});

// Country `group` and `kind` stay Arabic codes in both languages (filters compare them); show them in English with this map.
export const CODE_EN: Record<string, string> = {
  "إلكترونية": "eVisa", "سفارة": "Embassy", "مركز تأشيرات": "Visa centre", "شنغن": "Schengen", "للمقيمين": "For residents", "الكل": "All", "وجهات أخرى": "Other destinations",
};
