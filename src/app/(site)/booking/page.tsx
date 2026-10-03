import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getContent } from "@/lib/content";
import { pageMeta } from "@/lib/seo";
import { waLink } from "@/lib/types";
import ApplyFlow from "@/components/ApplyFlow";
import PriceNote from "@/components/PriceNote";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = pageMeta({ path: "/booking", title: "الحجز", description: "احجز تأشيرتك السياحية أو فندقك في ثلاث خطوات: تفاصيل الرحلة، بيانات المسافرين، ثم المراجعة والإرسال. نرد خلال 24 ساعة." });

const HOW = ["اختر الوجهة وتاريخ السفر ومدينة الموعد", "أدخل أسماء المسافرين ورقم الجوال", "راجع الطلب وأرسله على واتساب", "نرد خلال 24 ساعة بالمتطلبات والسعر النهائي"];
const GROUPS: [string, string][] = [["شنغن", "دول شنغن"], ["", "وجهات أخرى"], ["للمقيمين", "تأشيرات المقيمين"]];

/** Standalone booking page: the three-step form, how it works, what the price covers, and every destination as a shortcut. */
export default async function BookingPage() {
  const { countries, site } = await getContent();
  return (
    <div className="on-light">
      <section className="relative overflow-hidden pt-[84px]">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[28rem] w-[50rem] -translate-x-1/2 rounded-full bg-sky/20 blur-[120px]" />
        <div className="container-x relative py-10 md:py-16">
          <Reveal className="mb-8 max-w-2xl">
            <p data-r className="eyebrow mb-4">Booking</p>
            <h1 data-r className="text-[2.1rem] font-bold leading-[1.3] md:text-6xl">احجز تأشيرتك أو فندقك</h1>
            <p data-r className="mt-4 text-lg leading-9 text-mist">أكمل ثلاث خطوات قصيرة ويصلنا طلبك جاهزاً. نرد خلال 24 ساعة بالمتطلبات والسعر النهائي قبل أي التزام.</p>
          </Reveal>
          <div className="grid items-start gap-6 lg:grid-cols-[1.3fr_.7fr] lg:gap-8">
            <Suspense fallback={<div className="card h-96" />}><ApplyFlow /></Suspense>
            <aside className="space-y-5 lg:sticky lg:top-28">
              <div className="card p-6">
                <h2 className="text-xl font-bold">كيف يتم الحجز؟</h2>
                <ol className="mt-4 space-y-3">
                  {HOW.map((t, i) => (
                    <li key={t} className="flex gap-3 leading-7 text-mist"><span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-sky text-xs font-bold text-white">{i + 1}</span>{t}</li>
                  ))}
                </ol>
              </div>
              <PriceNote includes={site.priceIncludes} excludes={site.priceExcludes} />
              <div className="card flex flex-wrap items-center justify-between gap-3 p-6">
                <div><p className="font-bold">تفضّل الكلام مباشرة؟</p><p className="mt-1 text-sm text-mist">{site.hours}</p></div>
                <a href={waLink(site.whatsapp)} target="_blank" rel="noopener" className="btn btn-primary">واتساب</a>
              </div>
            </aside>
          </div>
        </div>
      </section>
      <section className="relative pb-20 md:pb-28">
        <div className="container-x">
          <h2 className="text-2xl font-bold md:text-3xl">الوجهات المتاحة للحجز</h2>
          <p className="mt-2 text-mist">اضغط على الوجهة لتبدأ طلبها مباشرة.</p>
          {GROUPS.map(([g, label]) => (
            <div key={label} className="mt-8">
              <h3 className="mb-3 text-sm font-bold text-sky-2">{label}</h3>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
                {countries.filter((c) => (c.group ?? "") === g).map((c) => (
                  <Link key={c.slug} href={`/booking?dest=${c.slug}#form`} className="bk-chip"><span className={`fi fi-${c.code} rounded-sm`} />{c.name}</Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
