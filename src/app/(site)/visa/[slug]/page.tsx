import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getContent } from "@/lib/content";
import { waLink } from "@/lib/types";
import Reveal from "@/components/Reveal";
import BgImage from "@/components/BgImage";
import FAQ from "@/components/FAQ";
import Symbol from "@/components/Symbol";
import SectionHead from "@/components/SectionHead";
import VisaChecklist from "@/components/VisaChecklist";
import StepsStrip from "@/components/StepsStrip";
import { Icon } from "@/components/Icons";

export async function generateStaticParams() {
  const { countries } = await getContent();
  return countries.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/visa/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const { countries } = await getContent();
  const c = countries.find((x) => x.slug === slug);
  if (!c) return {};
  return {
    title: `تأشيرة ${c.name} — المتطلبات والمدة والخطوات`,
    description: `استشارة وتجهيز طلب تأشيرة ${c.name} (${c.en}) من السعودية: المستندات المطلوبة، مدة المعالجة ${c.time}، وخطوات التقديم مع المقصد.`,
  };
}

export default async function CountryPage({ params }: PageProps<"/visa/[slug]">) {
  const { slug } = await params;
  const { countries, site } = await getContent();
  const c = countries.find((x) => x.slug === slug);
  if (!c) notFound();
  const others = countries.filter((x) => x.slug !== slug);
  const wa = waLink(site.whatsapp, `السلام عليكم، أرغب في استشارة بخصوص تأشيرة ${c.name}`);
  const mrz1 = `V<${c.code.toUpperCase()}<ELMAQSED<<${c.en.toUpperCase().replace(/[^A-Z]/g, "<")}`.padEnd(44, "<").slice(0, 44);
  const mrz2 = "ELMAQSED<<VISA<CONSULTING<<RIYADH<SA".padEnd(44, "<");
  const facts: [string, string][] = [["نوع التقديم", c.kind], ["المدة التقريبية", c.time], ["أنواع التأشيرة", c.types.join(" · ")], ["المستندات", `${c.reqs.length} مستندات`]];

  return (
    <>
      <section className="relative flex min-h-[100svh] items-end overflow-hidden pt-[84px]">
        <BgImage src={c.img} priority kenburns overlay="bg-gradient-to-b from-navy/35 via-navy/65 to-navy" />
        <span className="ghost bottom-[32%] right-[-2%]">{c.en.toUpperCase()}</span>
        <div className="container-x relative grid items-end gap-12 pb-16 lg:grid-cols-[1.15fr_.85fr] lg:pb-24">
          <Reveal>
            <nav data-r className="mb-8 flex items-center gap-2 text-sm text-mist/70">
              <Link href="/" className="hover:text-white">الرئيسية</Link><span>/</span>
              <Link href="/destinations" className="hover:text-white">الوجهات</Link><span>/</span>
              <span className="text-white">{c.name}</span>
            </nav>
            <p data-r className="pill mb-6"><i />{c.en} · Visa</p>
            <h1 data-r className="text-balance text-5xl font-bold leading-[1.15] md:text-7xl">تأشيرة {c.name}</h1>
            <p data-r className="mt-6 max-w-xl text-lg leading-9 text-mist/85">{c.note}</p>
            <div data-r className="mt-9 flex flex-wrap gap-4">
              <a href={wa} target="_blank" rel="noopener" className="btn btn-primary btn-lg">ابدأ استشارتك <Icon name="arrow" className="h-5 w-5" /></a>
              <a href="#docs" className="btn btn-ghost btn-lg">المستندات المطلوبة</a>
            </div>
          </Reveal>
          <div className="visa-card relative">
            <div className="relative flex items-center justify-between">
              <span className="font-serif text-xs tracking-[.3em] text-sky-2">VISA · {c.en.toUpperCase()}</span>
              <span className={`fi fi-${c.code} h-8 w-11 rounded-md shadow-lg`} />
            </div>
            <dl className="relative mt-6 grid grid-cols-2 gap-x-6 gap-y-5">
              {facts.map(([k, v]) => <div key={k}><dt className="text-xs text-mist/55">{k}</dt><dd className="mt-1 font-semibold leading-7">{v}</dd></div>)}
            </dl>
            <p className="mrz relative mt-6 border-t border-white/10 pt-4">{mrz1}<br />{mrz2}</p>
            <span className="stamp" aria-hidden="true">
              <span className="text-center"><Symbol className="mx-auto h-8 w-8 text-sky-2" id="stamp" /><span className="mt-1 block font-serif text-[10px] tracking-[.25em]">ELMAQSED</span></span>
            </span>
          </div>
        </div>
      </section>

      <section id="docs" className="relative scroll-mt-24 py-20 md:py-28">
        <div className="container-x">
          <Reveal><SectionHead eyebrow="Documents" title="جهّز ملفك خطوة بخطوة" text="علّم المستندات المتوفرة لديك وأرسل القائمة لنراجع الناقص معك. القائمة النهائية تصلك بعد الاستشارة حسب جنسيتك وغرض السفر." /></Reveal>
          <VisaChecklist reqs={c.reqs} country={c.name} whatsapp={site.whatsapp} />
        </div>
      </section>

      <section className="relative overflow-hidden bg-ink/70 py-20 md:py-28">
        <div className="container-x">
          <Reveal><SectionHead eyebrow="Your journey" title={`طريقك إلى تأشيرة ${c.name}`} /></Reveal>
          <StepsStrip />
        </div>
      </section>

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
      <FAQ compact />
    </>
  );
}
