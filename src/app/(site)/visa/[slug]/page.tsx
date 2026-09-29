import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import { pageMeta } from "@/lib/seo";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getContent } from "@/lib/content";
import { waLink } from "@/lib/types";
import Reveal from "@/components/Reveal";
import FAQ from "@/components/FAQ";
import SectionHead from "@/components/SectionHead";
import VisaChecklist from "@/components/VisaChecklist";
import StepsStrip from "@/components/StepsStrip";
import { Fragment, type CSSProperties, type ReactNode } from "react";
import { THEMES, ORDER } from "@/lib/destinations";
import { HeroBoarding, HeroStamp, HeroPostcard, HeroRoute, HeroClassic } from "@/components/DestHeroes";
import { Glance, EVisaFlow, EmbassyDay, CenterDay } from "@/components/DestSections";

export async function generateStaticParams() {
  const { countries } = await getContent();
  return countries.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/visa/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const { countries } = await getContent();
  const c = countries.find((x) => x.slug === slug);
  if (!c) return {};
  const og = fs.existsSync(path.join(process.cwd(), "public", "og", `${c.slug}.jpg`)) ? `/og/${c.slug}.jpg` : undefined;
  return pageMeta({
    path: `/visa/${c.slug}`,
    title: `تأشيرة ${c.name} — المتطلبات والمدة والخطوات`,
    description: `استشارة وتجهيز طلب تأشيرة ${c.name} (${c.en}) من السعودية: المستندات المطلوبة، مدة المعالجة ${c.time}، وخطوات التقديم مع المقصد.`,
    image: og,
  });
}

export default async function CountryPage({ params }: PageProps<"/visa/[slug]">) {
  const { slug } = await params;
  const { countries, site } = await getContent();
  const c = countries.find((x) => x.slug === slug);
  if (!c) notFound();
  const others = countries.filter((x) => x.slug !== slug);
  const wa = waLink(site.whatsapp, `السلام عليكم، أرغب في استشارة بخصوص تأشيرة ${c.name}`);
  const t = THEMES[c.slug];
  const HERO = { boarding: HeroBoarding, stamp: HeroStamp, postcard: HeroPostcard, route: HeroRoute };
  const Hero = t ? HERO[t.concept] : null;
  const sig = c.kind.includes("إلكترون") ? <EVisaFlow c={c} /> : c.kind.includes("سفارة") ? <EmbassyDay c={c} /> : c.kind.includes("مركز") ? <CenterDay c={c} /> : null;
  const blocks: Record<string, ReactNode> = {
    glance: t ? <Glance c={c} t={t} /> : null,
    sig,
    docs: (
      <section id="docs" className="relative scroll-mt-24 py-20 md:py-28">
        <div className="container-x">
          <Reveal><SectionHead eyebrow="Documents" title="جهّز ملفك خطوة بخطوة" text="علّم المستندات المتوفرة لديك وأرسل القائمة لنراجع الناقص معك. القائمة النهائية تصلك بعد الاستشارة حسب جنسيتك وغرض السفر." /></Reveal>
          <VisaChecklist reqs={c.reqs} country={c.name} whatsapp={site.whatsapp} />
        </div>
      </section>
    ),
    steps: (
      <section className="relative overflow-hidden bg-ink/70 py-20 md:py-28">
        <div className="container-x">
          <Reveal><SectionHead eyebrow="Your journey" title={`طريقك إلى تأشيرة ${c.name}`} /></Reveal>
          <StepsStrip />
        </div>
      </section>
    ),
    others: (
      <section className="py-20 md:py-28">
        <div className="container-x"><Reveal><SectionHead eyebrow="More destinations" title="وجهات أخرى" link={{ href: "/destinations", label: "كل الوجهات" }} /></Reveal></div>
        <div className="rail flex gap-5 overflow-x-auto px-[max(1rem,calc((100vw-76rem)/2))] pb-4">
          {others.map((o) => (
            <Link key={o.slug} href={`/visa/${o.slug}`} className="rail-card group relative aspect-[3/4] w-[220px] shrink-0 overflow-hidden rounded-3xl md:w-[250px]">
              <Image src={o.img} alt={o.name} fill sizes="250px" className="object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="font-serif text-[11px] tracking-[.25em] text-sky-2">{o.en.toUpperCase()}</p>
                <h3 className="mt-1 text-xl font-bold">{o.name}</h3>
                <p className="mt-1 text-xs text-mist/75">{o.time}</p>
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
          { "@type": "ListItem", position: 1, name: "الرئيسية", item: site.url },
          { "@type": "ListItem", position: 2, name: "الوجهات", item: `${site.url}/destinations` },
          { "@type": "ListItem", position: 3, name: `تأشيرة ${c.name}`, item: `${site.url}/visa/${c.slug}` },
        ] },
        { "@type": "Service", name: `استشارات تأشيرة ${c.name}`, serviceType: "Visa consulting", description: c.note, areaServed: "SA", provider: { "@type": "TravelAgency", name: site.name, url: site.url } },
      ] }) }} />
      <FAQ compact />
    </div>
  );
}
