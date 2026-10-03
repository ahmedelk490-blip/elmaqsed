import type { MetadataRoute } from "next";
import { getContent } from "@/lib/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { countries, site } = await getContent();
  const pages = ["", "/services", "/destinations", "/process", "/about", "/faq", "/contact", "/apply"];
  const lastModified = new Date();
  return [
    ...pages.map((p) => ({ url: `${site.url}${p}`, lastModified, changeFrequency: "weekly" as const, priority: p ? 0.9 : 1 })),
    ...countries.map((c) => ({ url: `${site.url}/visa/${c.slug}`, lastModified, changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}
