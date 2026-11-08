import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { getLocalContent } from "@/lib/content";
import { getT, getLang } from "@/lib/i18n";
import { waLink, contactLines } from "@/lib/types";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import { Suspense } from "react";
import ApplyFlow from "@/components/ApplyFlow";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return pageMeta({ lang: await getLang(), path: "/contact", title: t("تواصل معنا", "Contact us"), description: t("ابدأ استشارتك المجانية في ثلاث خطوات، أو تواصل معنا مباشرة عبر واتساب والهاتف والبريد.", "Start your free consultation in three steps, or reach us directly on WhatsApp, phone or email.") });
}

export default async function ContactPage() {
  const t = await getT();
  const { site } = await getLocalContent();
  const { calls, chats } = contactLines(site);
  const card = "card flex items-center justify-between gap-4 p-5";
  return (
    <>
      <PageHero image="/img/p14.jpg" eyebrow="Contact" title={t("ابدأ من هنا", "Start here")} text={t("ثلاث خطوات قصيرة وتصلنا رسالتك جاهزة على واتساب. الاستشارة الأولى مجانية بلا التزام.", "Three short steps and your message reaches us ready on WhatsApp. The first consultation is free, with no commitment.")} />
      <section className="pb-24">
        <div className="container-x grid gap-10 lg:grid-cols-[1.1fr_.9fr]">
          <Suspense fallback={<div className="card h-80" />}><ApplyFlow /></Suspense>
          <Reveal className="space-y-4">
            {chats.map((l) => (
              <a key={`w${l.dial}`} href={waLink(l.dial, t("السلام عليكم، أرغب في استشارة بخصوص تأشيرة السفر", "Hello, I would like a consultation about a travel visa"))} target="_blank" rel="noopener" data-r className={card}>
                <span className="text-mist/60">{t("واتساب", "WhatsApp")} <span className="text-sm text-mist/45">· {t(l.ar, l.en)}</span></span>
                <span className="flex items-center gap-2 font-semibold" dir="ltr">{l.flag && <span className={`fi fi-${l.flag} rounded-sm`} />}{l.shown}</span>
              </a>
            ))}
            {calls.map((l) => (
              <a key={`c${l.dial}`} href={`tel:+${l.dial}`} data-r className={card}>
                <span className="text-mist/60">{t("الهاتف", "Phone")} <span className="text-sm text-mist/45">· {t(l.ar, l.en)}</span></span>
                <span className="flex items-center gap-2 font-semibold" dir="ltr">{l.flag && <span className={`fi fi-${l.flag} rounded-sm`} />}{l.shown}</span>
              </a>
            ))}
            <a href={`mailto:${site.email}`} data-r className={card}>
              <span className="text-mist/60">{t("البريد", "Email")}</span><span className="font-semibold" dir="ltr">{site.email}</span>
            </a>
            <div data-r className="card p-5">
              <p className="text-mist/60">{t("المقر", "Office")}</p>
              <p className="mt-1 font-semibold">{site.city}</p>
              <p className="mt-1 text-sm text-mist/60">{site.hours}</p>
            </div>
            <div data-r className="card overflow-hidden p-0">
              <iframe title={t("الخريطة", "Map")} src={`https://www.google.com/maps?q=${encodeURIComponent(site.city)}&output=embed`} className="h-64 w-full grayscale invert-[.92] hue-rotate-180" loading="lazy" />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
