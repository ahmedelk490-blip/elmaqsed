"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useContent } from "./ContentProvider";
import { waLink } from "@/lib/types";
import Reveal from "./Reveal";
import { Icon } from "./Icons";

const purposes = ["سياحة", "أعمال", "زيارة عائلية", "علاج", "دراسة"];
const examples = ["أسافر إلى اليابان للسياحة في الربيع", "تأشيرة شنغن لزيارة عائلية في فرنسا", "رحلة عمل إلى أمريكا", "علاج في الهند الشهر القادم", "دراسة صيفية في لندن"];
const aliases: Record<string, string[]> = {
  schengen: ["أوروبا", "اوروبا", "فرنسا", "ألمانيا", "المانيا", "إيطاليا", "ايطاليا", "إسبانيا", "اسبانيا", "هولندا", "سويسرا"],
  usa: ["أمريكا", "امريكا", "نيويورك"], uk: ["إنجلترا", "انجلترا", "لندن"], uae: ["دبي", "أبوظبي", "ابوظبي"],
  turkey: ["إسطنبول", "اسطنبول"], japan: ["طوكيو"], egypt: ["القاهرة"], bosnia: ["سراييفو"], australia: ["سيدني"],
  canada: ["تورنتو"], china: ["بكين"], india: ["دلهي", "مومباي"],
};
const detectPurpose = (q: string) => (/عمل|أعمال|اعمال|مؤتمر/.test(q) ? "أعمال" : /عائل|زيارة|أهل|اهل/.test(q) ? "زيارة عائلية" : /علاج|مستشفى/.test(q) ? "علاج" : /دراس|جامع|كورس/.test(q) ? "دراسة" : null);

/** "Where will you go next?": type a trip in your own words (typewriter hints), get the visa facts instantly. */
export default function VisaChecker() {
  const { countries, site } = useContent();
  const [q, setQ] = useState("");
  const [slug, setSlug] = useState(countries[0]?.slug ?? "");
  const [purpose, setPurpose] = useState(purposes[0]);
  const [ph, setPh] = useState("");
  const [focus, setFocus] = useState(false);

  useEffect(() => {
    if (focus || q || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let i = 0, ch = 0, del = false;
    const t = setInterval(() => {
      const full = examples[i];
      ch += del ? -2 : 1;
      setPh(full.slice(0, Math.max(0, ch)));
      if (!del && ch >= full.length + 18) del = true;
      if (del && ch <= 0) { del = false; ch = 0; i = (i + 1) % examples.length; }
    }, 65);
    return () => clearInterval(t);
  }, [focus, q]);

  const onType = (v: string) => {
    setQ(v);
    const low = v.toLowerCase();
    const hit = countries.find((c) => v.includes(c.name) || low.includes(c.en.toLowerCase()) || (aliases[c.slug] || []).some((a) => v.includes(a)));
    if (hit) setSlug(hit.slug);
    const p = detectPurpose(v);
    if (p) setPurpose(p);
  };

  const c = countries.find((x) => x.slug === slug) ?? countries[0];
  if (!c) return null;
  const tiles: [string, string][] = [["المدة التقريبية", c.time], ["نوع التقديم", c.kind], ["المستندات", `${c.reqs.length} مستندات`]];
  const ask = q.trim() || `أرغب في تأشيرة ${c.name} بغرض ${purpose}`;

  return (
    <section id="checker" className="relative overflow-hidden py-24 md:py-32">
      <div className="pointer-events-none absolute left-1/2 top-16 h-[26rem] w-[50rem] -translate-x-1/2 rounded-full bg-sky/10 blur-[120px]" />
      <div className="container-x relative">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p data-r className="pill mx-auto mb-6"><i />Quick check</p>
          <h2 data-r className="text-balance text-4xl font-bold leading-[1.25] md:text-6xl">أين وجهتك القادمة؟</h2>
          <p data-r className="mx-auto mt-5 max-w-xl text-lg leading-8 text-mist/75">اكتب رحلتك بكلماتك، ونعرض لك نوع التأشيرة والمدة والمستندات فوراً.</p>
          <form data-r onSubmit={(e) => { e.preventDefault(); window.open(waLink(site.whatsapp, `السلام عليكم، ${ask}`), "_blank", "noopener"); }} className="beam relative mx-auto mt-10 flex items-center gap-2 rounded-full border border-sky/30 bg-navy-2/95 p-2 ps-6 text-start shadow-[0_0_0_6px_rgba(46,148,210,.08),0_30px_60px_-30px_rgba(46,148,210,.55)]">
            <Icon name="compass" className="h-5 w-5 shrink-0 text-sky-2" />
            <input value={q} onChange={(e) => onType(e.target.value)} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} placeholder={ph || "اكتب وجهتك…"} aria-label="اكتب وجهتك وغرض السفر" className="min-w-0 flex-1 bg-transparent py-3 text-base text-white outline-none placeholder:text-mist/45 md:text-lg" />
            <button type="submit" className="btn btn-primary shrink-0 px-5" aria-label="أرسل عبر واتساب"><span className="hidden sm:inline">اسأل الآن</span><Icon name="arrow" className="h-5 w-5" /></button>
          </form>
          <div data-r className="rail mt-5 flex gap-2 overflow-x-auto pb-2 md:flex-wrap md:justify-center">
            {countries.map((x) => (
              <button key={x.slug} type="button" onClick={() => { setSlug(x.slug); setQ(`تأشيرة ${x.name} — ${purpose}`); }} aria-pressed={slug === x.slug} className={`badge shrink-0 transition-all ${slug === x.slug ? "badge-sky bg-sky/15" : "hover:border-sky/50"}`}>
                <span className={`fi fi-${x.code} rounded-sm`} />{x.name}
              </button>
            ))}
          </div>
          <div data-r className="mt-2 flex flex-wrap justify-center gap-2">
            {purposes.map((p) => <button key={p} type="button" onClick={() => setPurpose(p)} aria-pressed={purpose === p} className={`badge text-xs transition-all ${purpose === p ? "badge-sky bg-sky/15" : "hover:border-sky/50"}`}>{p}</button>)}
          </div>
        </Reveal>

        <div key={c.slug + purpose} className="checker-card card glow mx-auto mt-12 grid max-w-5xl overflow-hidden p-0 lg:grid-cols-[1.1fr_1fr]">
          <div className="relative h-60 overflow-hidden lg:h-auto lg:min-h-[340px]">
            <Image src={c.img} alt={c.name} fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b1f39] via-[#0b1f39]/30 to-transparent" />
            <span className="giant-en" aria-hidden="true">{c.en.toUpperCase()}</span>
            <div className="absolute bottom-5 right-6">
              <p className="font-serif text-[11px] tracking-[.25em] text-sky-2">{c.en.toUpperCase()} · {purpose}</p>
              <h3 className="mt-1 text-3xl font-bold">تأشيرة {c.name}</h3>
            </div>
          </div>
          <div className="flex flex-col justify-center p-6 md:p-8">
            <div className="grid grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/10">
              {tiles.map(([k, v]) => <div key={k} className="p-4 text-center"><p className="text-xs text-mist/55">{k}</p><p className="mt-2 text-sm font-bold leading-6 md:text-base">{v}</p></div>)}
            </div>
            <p className="mt-5 text-sm leading-7 text-mist/75">الأنواع المتاحة: {c.types.join(" · ")}</p>
            <p className="mt-1 text-sm leading-7 text-mist/60">{c.note}</p>
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
