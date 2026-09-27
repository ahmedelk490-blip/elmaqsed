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
    },
    { scope: ref },
  );

  const lastTouch = useRef(0);
  // RTL rail: scrolling "forward" moves toward the left edge.
  const go = (dir: 1 | -1) => { lastTouch.current = Date.now(); rail.current?.scrollBy({ left: -dir * rail.current.clientWidth * 0.75, behavior: "smooth" }); };

  // autoplay: glide to the next card every 3s while visible; pauses on touch/hover
  useEffect(() => {
    const r = rail.current;
    if (!r || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let inView = false, hover = false;
    const io = new IntersectionObserver(([e]) => { inView = e.isIntersecting; }, { threshold: 0.35 });
    io.observe(r);
    const touch = () => { lastTouch.current = Date.now(); };
    const enter = () => { hover = true; };
    const leave = () => { hover = false; touch(); };
    r.addEventListener("pointerdown", touch, { passive: true });
    r.addEventListener("wheel", touch, { passive: true });
    r.addEventListener("mouseenter", enter);
    r.addEventListener("mouseleave", leave);
    const t = setInterval(() => {
      if (!inView || hover || document.hidden || Date.now() - lastTouch.current < 5000) return;
      const cards = Array.from(r.querySelectorAll<HTMLElement>(".dest-card"));
      if (!cards.length) return;
      const rr = r.getBoundingClientRect(), mid = rr.left + rr.width / 2;
      let cur = 0, best = Infinity;
      cards.forEach((c, i) => { const b = c.getBoundingClientRect(); const d = Math.abs(b.left + b.width / 2 - mid); if (d < best) { best = d; cur = i; } });
      const b = (cards[cur + 1] ?? cards[0]).getBoundingClientRect();
      r.scrollBy({ left: b.left + b.width / 2 - mid, behavior: "smooth" });
    }, 3000);
    return () => { clearInterval(t); io.disconnect(); r.removeEventListener("pointerdown", touch); r.removeEventListener("wheel", touch); r.removeEventListener("mouseenter", enter); r.removeEventListener("mouseleave", leave); };
  }, []);

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
      <div ref={rail} className="rail relative flex snap-x snap-mandatory gap-5 overflow-x-auto px-[max(1rem,calc((100vw-76rem)/2))] pb-6">
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
    </section>
  );
}
