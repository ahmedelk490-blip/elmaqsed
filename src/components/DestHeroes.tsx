import Link from "next/link";
import Image from "next/image";
import type { Country } from "@/lib/types";
import type { DestTheme } from "@/lib/destinations";
import Reveal from "./Reveal";
import BgImage from "./BgImage";
import Symbol from "./Symbol";
import { Icon } from "./Icons";

type P = { c: Country; t: DestTheme; wa: string };

const PLANE = "M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z";

function Intro({ c, wa, tag, center = false }: { c: Country; wa: string; tag: string; center?: boolean }) {
  return (
    <>
      <nav data-r className={`mb-7 flex items-center gap-2 text-sm text-mist/70 ${center ? "justify-center" : ""}`}>
        <Link href="/" className="hover:text-white">الرئيسية</Link><span>/</span>
        <Link href="/destinations" className="hover:text-white">الوجهات</Link><span>/</span>
        <span className="text-white">{c.name}</span>
      </nav>
      <p data-r className="eyebrow mb-4 text-[var(--accent)]">{tag}</p>
      {c.group && <p data-r className="mb-4"><span className="badge badge-sky bg-sky/15">{c.group === "للمقيمين" ? "للمقيمين في السعودية" : `تأشيرة ${c.group}`}</span></p>}
      <h1 data-r className="text-balance text-5xl font-bold leading-[1.15] md:text-7xl">تأشيرة {c.name}</h1>
      <p data-r className={`mt-6 max-w-xl text-lg leading-9 text-mist/85 ${center ? "mx-auto" : ""}`}>{c.note}</p>
      <div data-r className={`mt-9 flex flex-wrap gap-4 ${center ? "justify-center" : ""}`}>
        <Link href={`/booking?dest=${c.slug}`} className="btn btn-primary btn-lg">قدّم الآن <Icon name="arrow" className="h-5 w-5" /></Link>
        <a href="#docs" className="btn btn-ghost btn-lg">المستندات المطلوبة</a>
      </div>
      <p data-r className="mt-4 text-sm"><a href={wa} target="_blank" rel="noopener" className="text-sky-2 underline-offset-4 hover:underline">أو اسألنا على واتساب</a></p>
    </>
  );
}

/** Boarding pass from Riyadh to the destination airport; a plane crosses the dashed flight line. */
export function HeroBoarding({ c, t, wa }: P) {
  const rows: [string, string][] = [["مدة الطيران", t.flight], ["نوع التقديم", c.kind], ["المعالجة", c.time]];
  return (
    <section className="relative flex min-h-[100svh] items-end overflow-hidden pt-[84px]">
      <BgImage src={c.img} priority kenburns overlay="bg-gradient-to-b from-navy/30 via-navy/65 to-navy" />
      <div className="container-x relative grid items-end gap-12 pb-16 lg:grid-cols-2 lg:pb-24">
        <Reveal><Intro c={c} wa={wa} tag={`Boarding · ${c.en}`} /></Reveal>
        <div className="bp">
          <div className="bp-main">
            <div className="flex items-center justify-between">
              <span className="font-serif text-[11px] tracking-[.3em] text-mist/60">BOARDING PASS</span>
              <span className={`fi fi-${c.code} h-6 w-9 rounded shadow`} />
            </div>
            <div dir="ltr" className="mt-6 flex items-center gap-4">
              <div><p className="font-serif text-4xl font-semibold">RUH</p><p className="text-xs text-mist/60">الرياض</p></div>
              <div className="bp-line relative flex-1"><span className="bp-fly"><svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true"><path d={PLANE} /></svg></span></div>
              <div className="text-right"><p className="font-serif text-4xl font-semibold text-[var(--accent)]">{t.iata}</p><p className="text-xs text-mist/60">{t.city}</p></div>
            </div>
            <dl className="mt-7 grid gap-2.5 border-t border-white/10 pt-5 sm:grid-cols-3 sm:gap-4">
              {rows.map(([k, v]) => <div key={k} className="flex items-baseline justify-between gap-3 sm:block"><dt className="text-[11px] text-mist/55">{k}</dt><dd className="text-sm font-semibold leading-6 sm:mt-1">{v}</dd></div>)}
            </dl>
          </div>
          <div className="bp-stub" aria-hidden="true">
            <Symbol className="h-7 w-7 text-[var(--accent)]" id={`bp-${c.slug}`} />
            <span className="bp-code" />
            <span className="font-serif text-[10px] tracking-[.25em] text-mist/60 [writing-mode:vertical-rl]">ELMAQSED</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Passport page: the landmark in a round frame, a ring of text slowly turning, and an APPROVED stamp that lands on it. */
export function HeroStamp({ c, t, wa }: P) {
  return (
    <section className="relative overflow-hidden pt-[84px]">
      <div className="guilloche absolute inset-0" aria-hidden="true" />
      <div className="container-x relative grid items-center gap-12 py-14 md:py-20 lg:grid-cols-[1.05fr_.95fr]">
        <Reveal><Intro c={c} wa={wa} tag={`Passport · ${c.en}`} /></Reveal>
        <div className="relative mx-auto aspect-square w-full max-w-[440px]">
          <div className="absolute inset-[9%] overflow-hidden rounded-full border border-white/15 shadow-[0_40px_80px_-40px_rgba(0,0,0,.9)]">
            <Image src={c.img} alt={c.name} fill priority sizes="(min-width: 1024px) 440px, 90vw" className="kenburns object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent" />
          </div>
          <svg viewBox="0 0 200 200" style={{ direction: "ltr" }} className="stamp-ring absolute inset-0 h-full w-full" aria-hidden="true">
            <defs><path id={`ring-${c.slug}`} d="M100,100 m-93,0 a93,93 0 1,1 186,0 a93,93 0 1,1 -186,0" /></defs>
            <text fontSize="8" fill="currentColor" direction="ltr" className="font-serif"><textPath href={`#ring-${c.slug}`} textLength="578" lengthAdjust="spacing">{`VISA APPROVED · ${c.en.toUpperCase()} · ELMAQSED · RIYADH · `}</textPath></text>
          </svg>
          <div className="stamp-slam" aria-hidden="true">
            <span className="font-serif text-[10px] tracking-[.3em]">VISA · APPROVED</span>
            <span className="font-serif text-2xl font-semibold tracking-[.12em]">{c.en.toUpperCase()}</span>
            <span className="text-[11px]">{t.iata} · {c.time}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/** A cream postcard: landmark on one side, greetings, route and a flag stamp on the other. */
export function HeroPostcard({ c, t, wa }: P) {
  return (
    <section className="relative overflow-hidden pt-[84px]">
      <div className="pointer-events-none absolute -top-40 left-0 h-[30rem] w-[40rem] rounded-full bg-[var(--accent)] opacity-[.12] blur-[130px]" />
      <div className="container-x relative grid items-center gap-14 py-14 md:py-20 lg:grid-cols-[.9fr_1.1fr]">
        <Reveal><Intro c={c} wa={wa} tag={`Postcard · ${c.en}`} /></Reveal>
        <div className="postcard">
          <div className="pc-photo"><Image src={c.img} alt={c.name} fill priority sizes="(min-width: 1024px) 340px, 90vw" className="object-cover" /></div>
          <div className="pc-back">
            <span className="pc-stamp"><span className={`fi fi-${c.code} block h-full w-full`} /></span>
            <p dir="ltr" className="text-right font-serif text-lg italic text-navy/55">Greetings from</p>
            <p dir="ltr" className="text-right font-serif text-4xl font-semibold leading-none text-[var(--accent)]">{c.en}</p>
            <ul className="pc-lines">
              <li><span>إلى</span>مسافر المقصد</li>
              <li><span>المعالجة</span>{c.time}</li>
              <li><span>التقديم</span>{c.kind}</li>
            </ul>
            <span className="pc-postmark" dir="ltr">RUH · {t.iata}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Flight route: the arc from Riyadh draws itself once and a plane lands on the destination. */
export function HeroRoute({ c, t, wa }: P) {
  const d = "M920,250 C700,20 300,20 80,250";
  return (
    <section className="relative overflow-hidden pt-[84px]">
      <div className="dots-bg absolute inset-0 opacity-70" aria-hidden="true" />
      <div className="container-x relative py-14 text-center md:py-20">
        <Reveal className="mx-auto max-w-3xl"><Intro c={c} wa={wa} tag={`Route · RUH → ${t.iata}`} center /></Reveal>
        <div className="relative mx-auto mt-12 max-w-5xl">
          <svg viewBox="0 0 1000 300" className="w-full overflow-visible" aria-hidden="true">
            <path d={d} fill="none" stroke="rgba(255,255,255,.22)" strokeWidth="2" strokeDasharray="6 10" />
            <path d={d} fill="none" style={{ stroke: "var(--accent)" }} strokeWidth="3" pathLength={1} className="route-draw" />
            <circle cx="920" cy="250" r="9" fill="#fff" />
            <circle cx="80" cy="250" r="11" style={{ fill: "var(--accent)" }} />
            <g>
              <path d={PLANE} transform="translate(-14 -14) scale(1.15) rotate(90 12 12)" fill="#fff" />
              <animateMotion dur="3.2s" begin="0.2s" fill="freeze" rotate="auto" path={d} />
            </g>
          </svg>
          <div className="absolute bottom-[2%] right-[8%] translate-x-1/2 translate-y-full pt-3 text-center"><p className="font-serif text-2xl font-semibold" dir="ltr">RUH</p><p className="text-xs text-mist/60">الرياض</p></div>
          <div className="absolute bottom-[2%] left-[8%] -translate-x-1/2 translate-y-full pt-3 text-center"><p className="font-serif text-2xl font-semibold text-[var(--accent)]" dir="ltr">{t.iata}</p><p className="text-xs text-mist/60">{t.city}</p></div>
          <div className="absolute left-1/2 top-[6%] -translate-x-1/2 rounded-full border border-white/15 bg-navy-2/90 px-4 py-1.5 text-sm">{t.flight}</div>
          <div className="absolute bottom-[26%] left-[8%] h-12 w-12 -translate-x-1/2 overflow-hidden rounded-full border-2 border-[var(--accent)] shadow-lg sm:h-20 sm:w-20 md:h-28 md:w-28">
            <Image src={c.img} alt={c.name} fill priority sizes="112px" className="object-cover" />
          </div>
        </div>
        <div className="h-16" />
      </div>
    </section>
  );
}

/** Fallback for destinations added later from the admin: full-bleed photo with the visa card. */
export function HeroClassic({ c, wa }: { c: Country; wa: string }) {
  const mrz1 = `V<${c.code.toUpperCase()}<ELMAQSED<<${c.en.toUpperCase().replace(/[^A-Z]/g, "<")}`.padEnd(44, "<").slice(0, 44);
  const mrz2 = "ELMAQSED<<VISA<CONSULTING<<RIYADH<SA".padEnd(44, "<");
  const facts: [string, string][] = [["نوع التقديم", c.kind], ["المدة التقريبية", c.time], ["أنواع التأشيرة", c.types.join(" · ")], ["المستندات", `${c.reqs.length} مستندات`]];
  return (
    <section className="relative flex min-h-[100svh] items-end overflow-hidden pt-[84px]">
      <BgImage src={c.img} priority kenburns overlay="bg-gradient-to-b from-navy/35 via-navy/65 to-navy" />
      <span className="ghost bottom-[32%] right-[-2%]" data-t={c.en.toUpperCase()} aria-hidden="true" />
      <div className="container-x relative grid items-end gap-12 pb-16 lg:grid-cols-[1.15fr_.85fr] lg:pb-24">
        <Reveal><Intro c={c} wa={wa} tag={`${c.en} · Visa`} /></Reveal>
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
  );
}
