import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { getContent } from "@/lib/content";
import { waLink } from "@/lib/types";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import Wizard from "@/components/Wizard";

export const metadata: Metadata = pageMeta({ path: "/contact", title: "تواصل معنا", description: "ابدأ استشارتك المجانية في ثلاث خطوات، أو تواصل معنا مباشرة عبر واتساب والهاتف والبريد." });

export default async function ContactPage() {
  const { site } = await getContent();
  const channels: [string, string, string][] = [
    ["واتساب", `+${site.whatsapp}`, waLink(site.whatsapp)],
    ["الهاتف", site.phone, `tel:${site.phone.replace(/\s/g, "")}`],
    ["البريد", site.email, `mailto:${site.email}`],
  ];
  return (
    <>
      <PageHero image="/img/p14.jpg" eyebrow="Contact" title="ابدأ من هنا" text="ثلاث خطوات قصيرة وتصلنا رسالتك جاهزة على واتساب. الاستشارة الأولى مجانية بلا التزام." />
      <section className="pb-24">
        <div className="container-x grid gap-10 lg:grid-cols-[1.1fr_.9fr]">
          <Wizard />
          <Reveal className="space-y-4">
            {channels.map(([k, v, h]) => (
              <a key={k} href={h} target={h.startsWith("http") ? "_blank" : undefined} rel="noopener" data-r className="card flex items-center justify-between p-5">
                <span className="text-mist/60">{k}</span><span className="font-semibold" dir="ltr">{v}</span>
              </a>
            ))}
            <div data-r className="card p-5">
              <p className="text-mist/60">المقر</p>
              <p className="mt-1 font-semibold">{site.city}</p>
              <p className="mt-1 text-sm text-mist/60">{site.hours}</p>
            </div>
            <div data-r className="card overflow-hidden p-0">
              <iframe title="الخريطة" src={`https://www.google.com/maps?q=${encodeURIComponent(site.city)}&output=embed`} className="h-64 w-full grayscale invert-[.92] hue-rotate-180" loading="lazy" />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
