import type { Metadata } from "next";

const SITE = "المقصد ELMAQSED";
const DEFAULT_TITLE = "المقصد | استشارات تأشيرات السفر";

/** Canonical URL, Open Graph and Twitter card for one page. Images are 1200×630 files in /public/og (scripts/og-images.mjs). */
export function pageMeta({ path, title, description, image = "/og/default.jpg" }: { path: string; title?: string; description: string; image?: string }): Metadata {
  const full = title ? `${title} | المقصد` : DEFAULT_TITLE;
  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", locale: "ar_SA", siteName: SITE, url: path, title: full, description, images: [{ url: image, width: 1200, height: 630, alt: full }] },
    twitter: { card: "summary_large_image", title: full, description, images: [image] },
  };
}
