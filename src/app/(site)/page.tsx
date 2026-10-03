import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import Testimonials from "@/components/Testimonials";
import Services from "@/components/Services";
import Destinations from "@/components/Destinations";
import Process from "@/components/Process";
import Why from "@/components/Why";
import FAQ from "@/components/FAQ";
import Contact from "@/components/Contact";
import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { site } = await getContent();
  return pageMeta({ path: "/", description: site.description });
}

export default async function Home() {
  const { site } = await getContent();
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "TravelAgency", name: site.name, alternateName: site.nameEn, description: site.description, url: site.url, telephone: site.phone, email: site.email, address: { "@type": "PostalAddress", addressLocality: "Riyadh", addressCountry: "SA" }, logo: `${site.url}/brand/logo-512.png`, image: `${site.url}/og/default.jpg`, areaServed: "SA" },
      { "@type": "WebSite", name: site.name, alternateName: site.nameEn, url: site.url, inLanguage: "ar" },
    ],
  };
  return (
    <>
      <Hero />
      <Marquee />
      <Destinations />
      <Services />
      <Process />
      <Why />
      <Testimonials />
      <FAQ />
      <Contact />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </>
  );
}
