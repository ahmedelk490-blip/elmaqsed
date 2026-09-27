import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import KineticBand from "@/components/KineticBand";
import CompareSlider from "@/components/CompareSlider";
import VisaChecker from "@/components/VisaChecker";
import Testimonials from "@/components/Testimonials";
import Services from "@/components/Services";
import Destinations from "@/components/Destinations";
import Process from "@/components/Process";
import Why from "@/components/Why";
import FAQ from "@/components/FAQ";
import Contact from "@/components/Contact";
import { getContent } from "@/lib/content";

export default async function Home() {
  const { faq, site } = await getContent();
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "TravelAgency", name: site.name, alternateName: site.nameEn, description: site.description, url: site.url, telephone: site.phone, email: site.email, address: { "@type": "PostalAddress", addressLocality: "Riyadh", addressCountry: "SA" } },
      { "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
    ],
  };
  return (
    <>
      <Hero />
      <KineticBand />
      <Stats />
      <Services />
      <CompareSlider />
      <Destinations />
      <VisaChecker />
      <Process />
      <Why />
      <Testimonials />
      <FAQ />
      <Contact />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </>
  );
}
