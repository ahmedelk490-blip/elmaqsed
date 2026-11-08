import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getLocalContent } from "@/lib/content";
import { getT } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";
import { waLink } from "@/lib/types";
import ApplyFlow from "@/components/ApplyFlow";
import PriceNote from "@/components/PriceNote";
import Reveal from "@/components/Reveal";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return pageMeta({ path: "/booking", title: t("الحجز", "Booking"), description: t("احجز تأشيرتك السياحية أو فندقك في ثلاث خطوات: تفاصيل الرحلة، بيانات المسافرين، ثم المراجعة والإرسال. نرد خلال 24 ساعة.", "Book your tourist visa or hotel in three steps: trip details, traveller details, then review and send. We reply within 24 hours.") });
}

const HOW: [string, string][] = [["اختر الوجهة وتاريخ السفر ومدينة الموعد", "Choose the destination, travel date and appointment city"], ["أدخل أسماء المسافرين ورقم الجوال", "Enter the travellers' names and your mobile number"], ["راجع الطلب وأرسله على واتساب", "Review the request and send it on WhatsApp"], ["نرد خلال 24 ساعة بالمتطلبات والسعر النهائي", "We reply within 24 hours with the requirements and final price"]];
const GROUPS: [number, string, string][] = [[0, "دول شنغن", "Schengen countries"], [1, "وجهات أخرى", "Other destinations"], [2, "تأشيرات المقيمين", "Resident visas"]];
/** Group of a country whatever language its group label is in: 0 Schengen, 1 other, 2 residents. */
const groupOf = (g?: string) => (/شنغن|schengen/i.test(g ?? "") ? 0 : /مقيم|resident/i.test(g ?? "") ? 2 : 1);

/** Standalone booking page: the three-step form, how it works, what the price covers, and every destination as a shortcut. */
export default async function BookingPage() {
  const { countries, site } = await getLocalContent();
  const t = await getT();
  return (
    <div className="on-light">
      <section className="relative overflow-hidden pt-[84px]">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[28rem] w-[50rem] -translate-x-1/2 rounded-full bg-sky/20 blur-[120px]" />
        <div className="container-x relative py-10 md:py-16">
          <Reveal className="mb-8 max-w-2xl">
            <p data-r className="eyebrow mb-4">Booking</p>
            <h1 data-r className="text-[2.1rem] font-bold leading-[1.3] md:text-6xl">{t("احجز تأشيرتك أو فندقك", "Book your visa or hotel")}</h1>
            <p data-r className="mt-4 text-lg leading-9 text-mist">{t("أكمل ثلاث خطوات قصيرة ويصلنا طلبك جاهزاً. نرد خلال 24 ساعة بالمتطلبات والسعر النهائي قبل أي التزام.", "Complete three short steps and your request reaches us ready to process. We reply within 24 hours with the requirements and the final price, before any commitment.")}</p>
          </Reveal>
          <div className="grid items-start gap-6 lg:grid-cols-[1.3fr_.7fr] lg:gap-8">
            <Suspense fallback={<div className="card h-96" />}><ApplyFlow /></Suspense>
            <aside className="space-y-5 lg:sticky lg:top-28">
              <div className="card p-6">
                <h2 className="text-xl font-bold">{t("كيف يتم الحجز؟", "How does booking work?")}</h2>
                <ol className="mt-4 space-y-3">
                  {HOW.map(([ar, en], i) => (
                    <li key={ar} className="flex gap-3 leading-7 text-mist"><span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-sky text-xs font-bold text-white">{i + 1}</span>{t(ar, en)}</li>
                  ))}
                </ol>
              </div>
              <PriceNote includes={site.priceIncludes} excludes={site.priceExcludes} />
              <div className="card flex flex-wrap items-center justify-between gap-3 p-6">
                <div><p className="font-bold">{t("تفضّل الكلام مباشرة؟", "Prefer to talk directly?")}</p><p className="mt-1 text-sm text-mist">{site.hours}</p></div>
                <a href={waLink(site.whatsapp)} target="_blank" rel="noopener" className="btn btn-primary">{t("واتساب", "WhatsApp")}</a>
              </div>
            </aside>
          </div>
        </div>
      </section>
      <section className="relative pb-20 md:pb-28">
        <div className="container-x">
          <h2 className="text-2xl font-bold md:text-3xl">{t("الوجهات المتاحة للحجز", "Destinations available to book")}</h2>
          <p className="mt-2 text-mist">{t("اضغط على الوجهة لتبدأ طلبها مباشرة.", "Tap a destination to start its request right away.")}</p>
          {GROUPS.map(([g, ar, en]) => (
            <div key={g} className="mt-8">
              <h3 className="mb-3 text-sm font-bold text-sky-2">{t(ar, en)}</h3>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
                {countries.filter((c) => groupOf(c.group) === g).map((c) => (
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
