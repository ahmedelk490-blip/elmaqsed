"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useContent } from "./ContentProvider";
import SectionHead from "./SectionHead";
import Reveal from "./Reveal";
import { Icon } from "./Icons";
import { inGroup } from "./HeroSearch";
import type { Country } from "@/lib/types";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const GROUPS = ["الكل", "شنغن", "للمقيمين", "وجهات أخرى"];
const fill = (a: Country[], min: number) => { const out = [...a]; while (a.length && out.length < min) out.push(...a); return out; };

/** "Find your visa": group filter, then an endless row of landmark cards that glides on its own (two opposite rows on phones). */
export default function Destinations() {
  const { countries } = useContent();
  const ref = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [g, setG] = useState("الكل");
  const list = useMemo(() => fill(countries.filter((c) => inGroup(c, g)), 8), [countries, g]);
  const rows = [list.filter((_, k) => k % 2 === 0), list.filter((_, k) => k % 2 === 1)];

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".drail", { autoAlpha: 0, y: 40, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: ".drail", start: "top 85%", once: true } });
      });
      // desktop: the row glides by itself (CSS); hovering slows it, scrolling the page gives it a burst of speed
      gsap.matchMedia().add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const rail = ref.current?.querySelector<HTMLElement>(".drail");
        if (!rail) return;
        let base = 1, boost = 0;
        const enter = () => { base = 0.3; };
        const leave = () => { base = 1; };
        rail.addEventListener("mouseenter", enter);
        rail.addEventListener("mouseleave", leave);
        const st = ScrollTrigger.create({ trigger: ref.current, start: "top bottom", end: "bottom top", onUpdate: (self) => { boost = Math.min(Math.abs(self.getVelocity()) / 600, 4); } });
        const tick = () => {
          const a = track.current?.getAnimations()[0];
          if (!a || !st.isActive) return;
          const target = base + boost;
          if (Math.abs(a.playbackRate - target) > 0.02) a.playbackRate += (target - a.playbackRate) * 0.12;
          boost *= 0.93;
        };
        gsap.ticker.add(tick);
        return () => { gsap.ticker.remove(tick); rail.removeEventListener("mouseenter", enter); rail.removeEventListener("mouseleave", leave); };
      });
      // phones: scrolling adds a push to the two drifting rows
      gsap.matchMedia().add("(max-width: 1023px) and (prefers-reduced-motion: no-preference)", () => {
        const shift = () => -window.innerWidth * 0.35;
        gsap.utils.toArray<HTMLElement>(".mrow", ref.current).forEach((row, i) => {
          gsap.fromTo(row, { x: i % 2 ? shift : 0 }, { x: i % 2 ? 0 : shift, ease: "none", scrollTrigger: { trigger: ".mrows", start: "top bottom", end: "bottom top", scrub: 0.8, invalidateOnRefresh: true } });
        });
      });
    },
    { scope: ref },
  );

  // pause the drifting rows while they are off screen
  useEffect(() => {
    const els = ref.current?.querySelectorAll<HTMLElement>(".mrows, .drail");
    if (!els?.length) return;
    const io = new IntersectionObserver((entries) => entries.forEach((e) => e.target.classList.toggle("is-off", !e.isIntersecting)));
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section id="destinations" ref={ref} className="relative overflow-hidden bg-ink/70 py-20 md:py-28">
      <div className="dots-bg absolute inset-0" />
      <span className="ghost right-[-3%] top-10" data-t="DESTINATIONS" aria-hidden="true" />
      <div className="container-x relative">
        <Reveal>
          <SectionHead eyebrow="Destinations" title="ابحث عن تأشيرتك" text={`${countries.length} وجهة: دول شنغن، أمريكا وبريطانيا والخليج، وتأشيرات المقيمين. اختر وجهتك لتعرف المتطلبات والمدة وتقدّم طلبك.`} link={{ href: "/destinations", label: "كل الوجهات والبحث" }} />
          <div data-r className="rail -mt-6 mb-8 flex gap-2 overflow-x-auto pb-1">
            {GROUPS.map((x) => <button key={x} type="button" onClick={() => setG(x)} aria-pressed={g === x} className={`badge shrink-0 px-4 py-2 text-sm transition-colors ${g === x ? "badge-sky bg-sky/15" : "hover:border-sky/50"}`}>{x}</button>)}
          </div>
        </Reveal>
      </div>
      <div className="drail relative hidden pb-6 lg:block" dir="ltr">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-28 bg-gradient-to-r from-ink to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-28 bg-gradient-to-l from-ink to-transparent" />
        <div key={g} ref={track} className="dtrack flex w-max" style={{ animationDuration: `${list.length * 3.5}s` }}>
          {[...list, ...list].map((c, k) => {
            const dup = k >= list.length;
            return (
              <Link key={`${c.slug}-${k}`} href={`/visa/${c.slug}`} dir="rtl" aria-hidden={dup || undefined} tabIndex={dup ? -1 : undefined} className="dest-card group relative mr-5 aspect-[3/4] w-[300px] shrink-0 overflow-hidden rounded-3xl bg-navy-2 shadow-[0_30px_60px_-30px_rgba(0,0,0,.8)]" data-cursor>
                <Image src={c.img} alt={dup ? "" : c.name} fill sizes="300px" className="object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/20 to-transparent" />
                <span className="absolute left-4 top-3 grid h-10 w-10 -translate-y-2 place-items-center rounded-full bg-sky text-white opacity-0 shadow-lg shadow-sky/40 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"><Icon name="arrow" className="h-5 w-5" /></span>
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="font-serif text-[11px] tracking-[.25em] text-sky-2">{c.en.toUpperCase()}</p>
                  <h3 className="mt-1 text-2xl font-bold">{c.name}</h3>
                  <div className="mt-3 flex items-center justify-between gap-2 text-xs text-mist/85">
                    <span className="badge">{c.group || c.kind}</span>
                    <span>{c.time}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      <div className="mrows space-y-3 lg:hidden" dir="ltr">
        {rows.map((row, r) => (
          <div key={r} className="mrow">
            <div key={g} className={`mtrack flex w-max ${r ? "mtrack-rev" : ""}`} style={{ animationDuration: `${row.length * 6.4 + r * 6}s` }}>
              {[...row, ...row].map((c, k) => {
                const dup = k >= row.length;
                return (
                  <Link key={`${c.slug}-${k}`} href={`/visa/${c.slug}`} dir="rtl" aria-hidden={dup || undefined} tabIndex={dup ? -1 : undefined} className="mcard relative mr-3 block h-[230px] w-[170px] shrink-0 overflow-hidden rounded-2xl border border-white/10 shadow-[0_20px_40px_-20px_rgba(0,0,0,.8)] active:scale-[.97] md:h-[300px] md:w-[225px]">
                    <Image src={c.img} alt={dup ? "" : c.name} fill sizes="225px" className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/20 to-transparent" />
                    {c.group && <span className="absolute right-2 top-2 rounded-full bg-navy/85 px-2.5 py-1 text-[10px] font-semibold text-sky-2">{c.group}</span>}
                    <div className="absolute inset-x-0 bottom-0 p-3">
                      <p className="font-serif text-[10px] tracking-[.22em] text-sky-2">{c.en.toUpperCase()}</p>
                      <h3 className="mt-0.5 text-lg font-bold md:text-xl">{c.name}</h3>
                      <p className="text-[11px] text-mist/75">{c.time}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
