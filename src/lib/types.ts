export type Site = {
  name: string; nameEn: string; tagline: string; description: string; url: string;
  whatsapp: string; phone: string; email: string; city: string; cr: string; license: string; hours: string;
  footerNote: string; disclaimer: string;
  social: { instagram: string; x: string; tiktok: string; snapchat: string };
};
export type NavItem = { href: string; label: string };
export type Stat = { value: number; suffix: string; label: string; decimals?: number };
export type Service = { icon: string; title: string; text: string; bullets: string[]; img: string };
export type Step = { n: string; title: string; text: string };
export type Country = { slug: string; name: string; en: string; code: string; kind: string; time: string; types: string[]; reqs: string[]; note: string; img: string };
export type Why = { title: string; text: string };
export type Faq = { q: string; a: string; cat: string };
export type Testimonial = { name: string; city: string; visa: string; text: string };
export type About = { title: string; intro: string; story: string[]; values: { title: string; text: string }[] };
export type Content = {
  site: Site; nav: NavItem[]; stats: Stat[]; services: Service[]; steps: Step[]; countries: Country[];
  why: Why[]; faq: Faq[]; testimonials: Testimonial[]; about: About;
};

export const waLink = (whatsapp: string, msg = "السلام عليكم، أرغب في استشارة بخصوص تأشيرة السفر") =>
  `https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`;
