"use client";
import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useContent } from "./ContentProvider";
import SectionHead from "./SectionHead";
import Reveal from "./Reveal";
import { Icon } from "./Icons";
import { useRailAutoplay } from "@/lib/useRailAutoplay";
import Globe from "./Globe";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** Destination gallery: a horizontal rail of tall landmark cards, snap-scrolling with arrows, photos zoom on hover. */
export default function Destinations() {
  const { countries } = useContent();
  const ref = useRef<HTMLElement>(null);
  const rail = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".dest-card", { autoAlpha: 0, y: 40, stagger: 0.07, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: rail.current, start: "top 82%", once: true } });
      });
      // mobile: two rows of destinations that glide in opposite directions as you scroll
      gsap.matchMedia().add("(max-width: 1023px) and (prefers-reduced-motion: no-preference)", () => {
        const rows = gsap.utils.toArray<HTMLElement>(".mrow", ref.current);
        const travel = (el: HTMLElement) => -Math.max(0, el.scrollWidth - window.innerWidth);
        rows.forEach((row, i) => {
          gsap.fromTo(row, { x: i % 2 ? () => travel(row) : 0 }, { x: i % 2 ? 0 : () => travel(row), ease: "none", scrollTrigger: { trigger: ".mrows", start: "top bottom", end: "bottom top", scrub: 0.8, invalidateOnRefresh: true } });
          gsap.fromTo(row.querySelectorAll(".mcard img"), { xPercent: i % 2 ? 8 : -8 }, { xPercent: i % 2 ? -8 : 8, ease: "none", scrollTrigger: { trigger: ".mrows", start: "top bottom", end: "bottom top", scrub: 0.8 } });
        });
      });
    },
    { scope: ref },
  );

  const lastTouch = useRef(0);
  // RTL rail: scrolling "forward" moves toward the left edge.
  const go = (dir: 1 | -1) => { lastTouch.current = Date.now(); rail.current?.scrollBy({ left: -dir * rail.current.clientWidth * 0.75, behavior: "smooth" }); };

  useRailAutoplay(rail, ".dest-card", 3000, lastTouch);

  return (
    <section id="destinations" ref={ref} className="relative overflow-hidden bg-ink/70 py-24 md:py-32">
      <div className="dots-bg absolute inset-0" />
      <span className="ghost right-[-3%] top-10">DESTINATIONS</span>
      <div className="container-x relative">
        <Reveal className="flex flex-wrap items-start justify-between gap-6">
          <SectionHead eyebrow="Destinations" title="الوجهات التي نخدمها" text="اختر وجهتك لتعرف المتطلبات، المدة التقريبية، وخطوات التقديم معنا." link={{ href: "/destinations", label: "كل الوجهات والبحث" }} />
          <div data-r className="hidden items-end gap-8 md:flex">
            <div className="hidden w-56 lg:block"><Globe /></div>
            <div className="flex gap-3 pb-8">
              <button onClick={() => go(-1)} className="rail-btn" aria-label="السابق"><Icon name="arrow" className="h-5 w-5 rotate-180" /></button>
              <button onClick={() => go(1)} className="rail-btn" aria-label="التالي"><Icon name="arrow" className="h-5 w-5" /></button>
            </div>
          </div>
        </Reveal>
      </div>
      <div ref={rail} className="rail relative hidden lg:flex snap-x snap-mandatory gap-5 overflow-x-auto px-[max(1rem,calc((100vw-76rem)/2))] pb-6">
        {countries.map((c, i) => (
          <Link key={c.slug} href={`/visa/${c.slug}`} className="dest-card group relative aspect-[3/4] w-[250px] shrink-0 snap-start overflow-hidden rounded-3xl bg-navy-2 shadow-[0_30px_60px_-30px_rgba(0,0,0,.8)] md:w-[300px]" data-cursor>
            <Image src={c.img} alt={c.name} fill sizes="300px" className="object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
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
        ))}
      </div>
      <div className="mrows space-y-3 lg:hidden" dir="ltr">
        {[0, 1].map((r) => (
          <div key={r} className="mrow flex w-max gap-3 px-4 will-change-transform">
            {countries.filter((_, k) => k % 2 === r).map((c) => (
              <Link key={c.slug} href={`/visa/${c.slug}`} dir="rtl" className="mcard relative block h-[230px] w-[170px] shrink-0 overflow-hidden rounded-2xl border border-white/10 shadow-[0_20px_40px_-20px_rgba(0,0,0,.8)] active:scale-[.97]">
                <Image src={c.img} alt={c.name} fill sizes="200px" className="scale-[1.2] object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3">
                  <p className="font-serif text-[9px] tracking-[.22em] text-sky-2">{c.en.toUpperCase()}</p>
                  <h3 className="mt-0.5 text-lg font-bold">{c.name}</h3>
                  <p className="text-[11px] text-mist/75">{c.time}</p>
                </div>
              </Link>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
