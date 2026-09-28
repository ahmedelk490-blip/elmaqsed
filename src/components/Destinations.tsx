"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useContent } from "./ContentProvider";
import SectionHead from "./SectionHead";
import Reveal from "./Reveal";
import { Icon } from "./Icons";
import Globe from "./Globe";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** Destinations: on desktop an endless row of landmark cards glides on its own (slows under the mouse, speeds up while you scroll); on phones two rows drift in opposite directions. */
export default function Destinations() {
  const { countries } = useContent();
  const ref = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".drail", { autoAlpha: 0, y: 40, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: ".drail", start: "top 85%", once: true } });
      });
      // desktop: the row glides by itself (CSS); hovering slows it, scrolling the page gives it a burst of speed
      gsap.matchMedia().add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const el = track.current;
        if (!el) return;
        let base = 1, boost = 0;
        const enter = () => { base = 0.3; };
        const leave = () => { base = 1; };
        el.addEventListener("mouseenter", enter);
        el.addEventListener("mouseleave", leave);
        const st = ScrollTrigger.create({ trigger: ref.current, start: "top bottom", end: "bottom top", onUpdate: (self) => { boost = Math.min(Math.abs(self.getVelocity()) / 600, 4); } });
        const tick = () => {
          const a = el.getAnimations()[0];
          if (!a || !st.isActive) return;
          const target = base + boost;
          if (Math.abs(a.playbackRate - target) > 0.02) a.playbackRate += (target - a.playbackRate) * 0.12;
          boost *= 0.93;
        };
        gsap.ticker.add(tick);
        return () => { gsap.ticker.remove(tick); el.removeEventListener("mouseenter", enter); el.removeEventListener("mouseleave", leave); };
      });
      // mobile: the two rows drift on their own (CSS), scrolling adds an extra push in the same direction
      gsap.matchMedia().add("(max-width: 1023px) and (prefers-reduced-motion: no-preference)", () => {
        const rows = gsap.utils.toArray<HTMLElement>(".mrow", ref.current);
        const shift = () => -window.innerWidth * 0.35;
        rows.forEach((row, i) => {
          gsap.fromTo(row, { x: i % 2 ? shift : 0 }, { x: i % 2 ? 0 : shift, ease: "none", scrollTrigger: { trigger: ".mrows", start: "top bottom", end: "bottom top", scrub: 0.8, invalidateOnRefresh: true } });
          gsap.fromTo(row.querySelectorAll(".mcard img"), { xPercent: i % 2 ? 8 : -8 }, { xPercent: i % 2 ? -8 : 8, ease: "none", scrollTrigger: { trigger: ".mrows", start: "top bottom", end: "bottom top", scrub: 0.8 } });
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
    <section id="destinations" ref={ref} className="relative overflow-hidden bg-ink/70 py-24 md:py-32">
      <div className="dots-bg absolute inset-0" />
      <span className="ghost right-[-3%] top-10" data-t="DESTINATIONS" aria-hidden="true" />
      <div className="container-x relative">
        <Reveal className="flex flex-wrap items-start justify-between gap-6">
          <SectionHead eyebrow="Destinations" title="الوجهات التي نخدمها" text="اختر وجهتك لتعرف المتطلبات، المدة التقريبية، وخطوات التقديم معنا." link={{ href: "/destinations", label: "كل الوجهات والبحث" }} />
          <div data-r className="hidden w-56 lg:block"><Globe /></div>
        </Reveal>
      </div>
      <div className="drail relative hidden pb-6 lg:block" dir="ltr">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-28 bg-gradient-to-r from-ink to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-28 bg-gradient-to-l from-ink to-transparent" />
        <div ref={track} className="dtrack flex w-max">
          {[...countries, ...countries].map((c, k) => {
            const i = k % countries.length;
            const dup = k >= countries.length;
            return (
              <Link key={`${c.slug}-${k}`} href={`/visa/${c.slug}`} dir="rtl" aria-hidden={dup || undefined} tabIndex={dup ? -1 : undefined} className="dest-card group relative mr-5 aspect-[3/4] w-[300px] shrink-0 overflow-hidden rounded-3xl bg-navy-2 shadow-[0_30px_60px_-30px_rgba(0,0,0,.8)]" data-cursor>
                <Image src={c.img} alt={dup ? "" : c.name} fill sizes="300px" className="object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/20 to-transparent" />
                <span className="absolute left-4 top-4 font-serif text-sm tracking-[.2em] text-white/60 transition-opacity group-hover:opacity-0">{String(i + 1).padStart(2, "0")}</span>
                <span className="absolute left-4 top-3 grid h-10 w-10 -translate-y-2 place-items-center rounded-full bg-sky text-white opacity-0 shadow-lg shadow-sky/40 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"><Icon name="arrow" className="h-5 w-5" /></span>
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="font-serif text-[11px] tracking-[.25em] text-sky-2">{c.en.toUpperCase()}</p>
                  <h3 className="mt-1 text-2xl font-bold">{c.name}</h3>
                  <div className="mt-3 flex items-center justify-between gap-2 text-xs text-mist/85">
                    <span className="badge">{c.kind}</span>
                    <span>{c.time}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      <div className="mrows space-y-3 lg:hidden" dir="ltr">
        {[0, 1].map((r) => {
          const row = countries.filter((_, k) => k % 2 === r);
          return (
            <div key={r} className="mrow">
              <div className={`mtrack flex w-max ${r ? "mtrack-rev" : ""}`}>
                {[...row, ...row].map((c, k) => {
                  const dup = k >= row.length;
                  return (
                    <Link key={`${c.slug}-${k}`} href={`/visa/${c.slug}`} dir="rtl" aria-hidden={dup || undefined} tabIndex={dup ? -1 : undefined} className="mcard relative mr-3 block h-[230px] w-[170px] shrink-0 md:h-[300px] md:w-[225px] overflow-hidden rounded-2xl border border-white/10 shadow-[0_20px_40px_-20px_rgba(0,0,0,.8)] active:scale-[.97]">
                      <Image src={c.img} alt={dup ? "" : c.name} fill sizes="200px" className="scale-[1.2] object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/20 to-transparent" />
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
          );
        })}
      </div>
    </section>
  );
}
