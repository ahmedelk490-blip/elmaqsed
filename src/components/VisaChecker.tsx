"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useContent } from "./ContentProvider";
import { waLink } from "@/lib/types";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";
import { Icon } from "./Icons";

const purposes = ["سياحة", "أعمال", "زيارة عائلية", "علاج", "دراسة"];

/** Pick a destination and purpose; a result card with the key facts animates in with a direct WhatsApp start. */
export default function VisaChecker() {
  const { countries, site } = useContent();
  const [slug, setSlug] = useState(countries[0]?.slug ?? "");
  const [purpose, setPurpose] = useState(purposes[0]);
  const c = countries.find((x) => x.slug === slug) ?? countries[0];
  if (!c) return null;
  const tiles: [string, string][] = [["المدة التقريبية", c.time], ["نوع التقديم", c.kind], ["المستندات", `${c.reqs.length} مستندات`]];
  return (
    <section id="checker" className="relative overflow-hidden py-24 md:py-32">
      <div className="container-x relative grid items-center gap-12 lg:grid-cols-2">
        <div>
          <Reveal><SectionHead eyebrow="Quick check" title="افحص وجهتك في ثوانٍ" text="اختر الدولة والغرض، ونعرض لك نوع التقديم والمدة والمستندات فوراً، ثم ابدأ مع مستشارك بضغطة." /></Reveal>
          <p className="mb-3 text-sm text-mist/60">الوجهة</p>
          <div className="flex flex-wrap gap-2">
            {countries.map((x) => (
              <button key={x.slug} type="button" onClick={() => setSlug(x.slug)} aria-pressed={slug === x.slug} className={`badge transition-all ${slug === x.slug ? "badge-sky scale-105 bg-sky/15" : "hover:border-sky/50"}`}>
                <span className={`fi fi-${x.code} rounded-sm`} />{x.name}
              </button>
            ))}
          </div>
          <p className="mb-3 mt-6 text-sm text-mist/60">الغرض من السفر</p>
          <div className="flex flex-wrap gap-2">
            {purposes.map((p) => (
              <button key={p} type="button" onClick={() => setPurpose(p)} aria-pressed={purpose === p} className={`badge transition-all ${purpose === p ? "badge-sky bg-sky/15" : "hover:border-sky/50"}`}>{p}</button>
            ))}
          </div>
        </div>
        <div key={c.slug + purpose} className="checker-card card glow overflow-hidden p-0">
          <div className="relative h-48 overflow-hidden">
            <Image src={c.img} alt={c.name} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#10284a] via-[#10284a]/40 to-transparent" />
            <span className={`fi fi-${c.code} absolute left-6 top-5 h-8 w-11 rounded-md shadow-lg`} />
            <div className="absolute bottom-4 right-6">
              <p className="font-serif text-[11px] tracking-[.25em] text-sky-2">{c.en.toUpperCase()} · {purpose}</p>
              <h3 className="mt-1 text-3xl font-bold">تأشيرة {c.name}</h3>
            </div>
          </div>
          <div className="grid grid-cols-3 divide-x divide-white/10 border-b border-white/10">
            {tiles.map(([k, v]) => <div key={k} className="p-5 text-center"><p className="text-xs text-mist/55">{k}</p><p className="mt-2 font-bold leading-7">{v}</p></div>)}
          </div>
          <div className="p-6">
            <p className="text-sm leading-7 text-mist/75">الأنواع المتاحة: {c.types.join(" · ")}</p>
            <p className="mt-2 text-sm leading-7 text-mist/60">{c.note}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={waLink(site.whatsapp, `السلام عليكم، أرغب في تأشيرة ${c.name} بغرض ${purpose}`)} target="_blank" rel="noopener" className="btn btn-primary">ابدأ الآن <Icon name="arrow" className="h-5 w-5" /></a>
              <Link href={`/visa/${c.slug}`} className="btn btn-ghost">التفاصيل والمستندات</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
