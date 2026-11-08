import type { Metadata } from "next";
import type { Lang } from "./lang";

const SITE = "المقصد ELMAQSED";
const DEFAULT_TITLE = "المقصد | استشارات تأشيرات السفر";
const DEFAULT_TITLE_EN = "ELMAQSED | Travel visa consulting";

/** Canonical URL, Open Graph and Twitter card for one page. Images are 1200×630 files in /public/og (scripts/og-images.mjs). */
export function pageMeta({ path, title, description, image = "/og/default.jpg", lang = "ar" }: { path: string; title?: string; description: string; image?: string; lang?: Lang }): Metadata {
  const en = lang === "en";
  const full = title ? `${title} | ${en ? "ELMAQSED" : "المقصد"}` : en ? DEFAULT_TITLE_EN : DEFAULT_TITLE;
  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", locale: en ? "en_US" : "ar_SA", siteName: en ? "ELMAQSED" : SITE, url: path, title: full, description, images: [{ url: image, width: 1200, height: 630, alt: full }] },
    twitter: { card: "summary_large_image", title: full, description, images: [image] },
  };
}
