import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { waLink } from "@/lib/types";
import { getContent } from "@/lib/content";
import Reveal from "@/components/Reveal";
import FAQ from "@/components/FAQ";
import { Icon } from "@/components/Icons";
import BgImage from "@/components/BgImage";

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
  const { countries, steps, site } = await getContent();
  const c = countries.find((x) => x.slug === slug);
  if (!c) notFound();
  const others = countries.filter((x) => x.slug !== slug).slice(0, 6);
  const wa = waLink(site.whatsapp, `السلام عليكم، أرغب في استشارة بخصوص تأشيرة ${c.name}`);

  return (
    <>
      <section className="relative flex min-h-[60vh] items-end overflow-hidden pt-[84px]">
        <BgImage src={c.img} priority kenburns overlay="bg-gradient-to-b from-navy/65 via-navy/70 to-navy" />
        <Reveal className="container-x relative py-16 md:py-24">
          <nav data-r className="mb-8 flex items-center gap-2 text-sm text-mist/60">
            <Link href="/" className="hover:text-white">الرئيسية</Link><span>/</span>
            <Link href="/#destinations" className="hover:text-white">الوجهات</Link><span>/</span>
            <span className="text-white">{c.name}</span>
          </nav>
          <div className="flex flex-wrap items-center gap-6">
            <span data-r className={`fi fi-${c.code} flag flag-lg`} />
            <div>
              <p data-r className="eyebrow mb-3">{c.en}</p>
              <h1 data-r className="text-4xl font-bold md:text-6xl">تأشيرة {c.name}</h1>
            </div>
          </div>
          <p data-r className="mt-8 max-w-2xl text-lg leading-9 text-mist/80">{c.note}</p>
          <div data-r className="mt-8 flex flex-wrap gap-3">
            <span className="badge">نوع التقديم: {c.kind}</span>
            <span className="badge">المدة التقريبية: {c.time}</span>
            {c.types.map((t) => <span key={t} className="badge badge-sky">{t}</span>)}
          </div>
        </Reveal>
      </section>

      <section className="pb-24">
        <Reveal className="container-x grid gap-10 lg:grid-cols-[1fr_360px]">
          <div>
            <h2 data-r className="text-2xl font-bold md:text-3xl">المستندات المطلوبة</h2>
            <ul className="mt-6 space-y-3">
              {c.reqs.map((r) => (
                <li key={r} data-r className="glass flex items-start gap-3 rounded-2xl p-4">
                  <span className="mt-1 text-sky-2"><Icon name="check" className="h-5 w-5" /></span>
                  <span className="leading-7">{r}</span>
                </li>
              ))}
            </ul>
            <p data-r className="mt-4 text-sm text-mist/60">* المتطلبات تقريبية وقد تختلف حسب الجنسية والغرض. القائمة النهائية تصلك بعد الاستشارة.</p>
            <h2 data-r className="mt-14 text-2xl font-bold md:text-3xl">خطوات التقديم معنا</h2>
            <ol className="mt-6 grid gap-4 sm:grid-cols-2">
              {steps.map((s) => (
                <li key={s.n} data-r className="glass rounded-2xl p-5">
                  <span className="eyebrow">{s.n}</span>
                  <h3 className="mt-2 font-bold">{s.title}</h3>
                  <p className="mt-1 text-sm leading-7 text-mist/70">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
          <aside data-r className="glass glow h-fit rounded-3xl p-7 lg:sticky lg:top-24">
            <h3 className="text-xl font-bold">ابدأ طلب تأشيرة {c.name}</h3>
            <p className="mt-3 leading-8 text-mist/75">استشارة أولى مجانية لتقييم ملفك وتحديد فرصك بصدق قبل أي رسوم.</p>
            <a href={wa} target="_blank" rel="noopener" className="btn btn-primary mt-6 w-full justify-center">تواصل عبر واتساب</a>
            <Link href="/#contact" className="btn btn-ghost mt-3 w-full justify-center">اطلب اتصالاً</Link>
            <p className="mt-6 text-xs leading-6 text-mist/50">المقصد شركة استشارية مستقلة ولا تمثل سفارة {c.name} أو أي جهة حكومية.</p>
          </aside>
        </Reveal>
      </section>

      <section className="pb-8">
        <Reveal className="container-x">
          <h2 data-r className="mb-6 text-2xl font-bold">وجهات أخرى</h2>
          <div className="flex flex-wrap gap-3">
            {others.map((o) => (
              <Link key={o.slug} data-r href={`/visa/${o.slug}`} className="badge hover:border-sky"><span className={`fi fi-${o.code} rounded-sm`} /> {o.name}</Link>
            ))}
          </div>
        </Reveal>
      </section>
      <FAQ compact />
    </>
  );
}
