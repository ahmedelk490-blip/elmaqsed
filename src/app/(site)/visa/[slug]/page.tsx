import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import { pageMeta } from "@/lib/seo";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getContent, getLocalContent } from "@/lib/content";
import { getT, getLang } from "@/lib/i18n";
import { waLink } from "@/lib/types";
import Reveal from "@/components/Reveal";
import FAQ from "@/components/FAQ";
import SectionHead from "@/components/SectionHead";
import VisaChecklist from "@/components/VisaChecklist";
import PriceNote from "@/components/PriceNote";
import StepsStrip from "@/components/StepsStrip";
import { Fragment, type CSSProperties, type ReactNode } from "react";
import { getTheme, ORDER } from "@/lib/destinations";
import { HeroBoarding, HeroStamp, HeroPostcard, HeroRoute, HeroClassic } from "@/components/DestHeroes";
import { Glance, EVisaFlow, EmbassyDay, CenterDay } from "@/components/DestSections";

export async function generateStaticParams() {
  const { countries } = await getContent();
  return countries.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/visa/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const { countries } = await getLocalContent();
  const t = await getT();
  const c = countries.find((x) => x.slug === slug);
  if (!c) return {};
  const og = fs.existsSync(path.join(process.cwd(), "public", "og", `${c.slug}.jpg`)) ? `/og/${c.slug}.jpg` : undefined;
  return pageMeta({
    path: `/visa/${c.slug}`,
    title: t(`تأشيرة ${c.name} — المتطلبات والمدة والخطوات`, `${c.name} visa: requirements, timing and steps`),
    description: t(`استشارة وتجهيز طلب تأشيرة ${c.name} (${c.en}) من الدول العربية: المستندات المطلوبة وخطوات التقديم مع المقصد.`, `Consultation and application preparation for the ${c.name} visa from the Arab world: required documents and application steps with ELMAQSED.`),
    image: og,
  });
}

export default async function CountryPage({ params }: PageProps<"/visa/[slug]">) {
  const { slug } = await params;
  const { countries, site } = await getLocalContent();
  const tr = await getT();
  const lang = await getLang();
  const c = countries.find((x) => x.slug === slug);
  if (!c) notFound();
  const others = countries.filter((x) => x.slug !== slug);
  const wa = waLink(site.whatsapp, tr(`السلام عليكم، أرغب في استشارة بخصوص تأشيرة ${c.name}`, `Hello, I would like a consultation about the ${c.name} visa`));
  const t = getTheme(c.slug, lang);
  const HERO = { boarding: HeroBoarding, stamp: HeroStamp, postcard: HeroPostcard, route: HeroRoute };
  const Hero = t ? HERO[t.concept] : null;
  const sig = c.kind.includes("إلكترون") ? <EVisaFlow c={c} /> : c.kind.includes("سفارة") ? <EmbassyDay c={c} /> : c.kind.includes("مركز") ? <CenterDay c={c} /> : null;
  const blocks: Record<string, ReactNode> = {
    glance: t ? <Glance c={c} t={t} /> : null,
    sig,
    docs: (
      <section id="docs" className="relative scroll-mt-24 py-20 md:py-28">
        <div className="container-x">
          <Reveal><SectionHead eyebrow="Documents" title={tr("جهّز ملفك خطوة بخطوة", "Prepare your file step by step")} text={tr("علّم المستندات المتوفرة لديك وأرسل القائمة لنراجع الناقص معك. القائمة النهائية تصلك بعد الاستشارة حسب جنسيتك وغرض السفر.", "Tick the documents you have and send the list so we can review what is missing. You receive the final list after the consultation, based on your nationality and purpose of travel.")} /></Reveal>
          <VisaChecklist reqs={c.reqs} country={c.name} whatsapp={site.whatsapp} />
          <div className="mt-8 grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
            <PriceNote price={c.price} includes={site.priceIncludes} excludes={site.priceExcludes} />
            <Link href={`/booking?dest=${c.slug}`} className="btn btn-primary btn-lg justify-center">{tr(`قدّم على تأشيرة ${c.name}`, `Apply for the ${c.name} visa`)}</Link>
          </div>
        </div>
      </section>
    ),
    steps: (
      <section className="relative overflow-hidden bg-ink/70 py-20 md:py-28">
        <div className="container-x">
          <Reveal><SectionHead eyebrow="Your journey" title={tr(`طريقك إلى تأشيرة ${c.name}`, `Your way to the ${c.name} visa`)} /></Reveal>
          <StepsStrip />
        </div>
      </section>
    ),
    others: (
      <section className="py-20 md:py-28">
        <div className="container-x"><Reveal><SectionHead eyebrow="More destinations" title={tr("وجهات أخرى", "More destinations")} link={{ href: "/destinations", label: tr("كل الوجهات", "All destinations") }} /></Reveal></div>
        <div className="rail flex gap-5 overflow-x-auto px-[max(1rem,calc((100vw-76rem)/2))] pb-4">
          {others.map((o) => (
            <Link key={o.slug} href={`/visa/${o.slug}`} className="rail-card group relative aspect-[3/4] w-[220px] shrink-0 overflow-hidden rounded-3xl md:w-[250px]">
              <Image src={o.img} alt={o.name} fill sizes="250px" className="object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="font-serif text-[11px] tracking-[.25em] text-sky-2">{o.en.toUpperCase()}</p>
                <h3 className="mt-1 text-xl font-bold">{o.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>
    ),
  };

  return (
    <div style={{ "--accent": t?.accent ?? "#63b6ea" } as CSSProperties}>
      {Hero && t ? <Hero c={c} t={t} wa={wa} /> : <HeroClassic c={c} wa={wa} />}

      {(t ? ORDER[t.concept] : ["docs", "steps", "others"]).map((k) => <Fragment key={k}>{blocks[k]}</Fragment>)}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@graph": [
        { "@type": "BreadcrumbList", itemListElement: [
          { "@type": "ListItem", position: 1, name: tr("الرئيسية", "Home"), item: site.url },
          { "@type": "ListItem", position: 2, name: tr("الوجهات", "Destinations"), item: `${site.url}/destinations` },
          { "@type": "ListItem", position: 3, name: tr(`تأشيرة ${c.name}`, `${c.name} visa`), item: `${site.url}/visa/${c.slug}` },
        ] },
        { "@type": "Service", name: tr(`استشارات تأشيرة ${c.name}`, `${c.name} visa consulting`), serviceType: "Visa consulting", description: c.note, areaServed: "SA", provider: { "@type": "TravelAgency", name: site.name, url: site.url } },
      ] }) }} />
      <FAQ compact />
    </div>
  );
}
