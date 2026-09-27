"use client";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useContent } from "./ContentProvider";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function Stats() {
  const { stats } = useContent();
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const tiles = gsap.utils.toArray<HTMLElement>(".stat", ref.current);
      const els = gsap.utils.toArray<HTMLElement>("[data-count]", ref.current);
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(tiles, { autoAlpha: 0, y: 30, scale: 0.92 });
        ScrollTrigger.create({
          trigger: ref.current,
          start: "top 85%",
          once: true,
          onEnter: () => {
            gsap.to(tiles, { autoAlpha: 1, y: 0, scale: 1, duration: 0.9, ease: "power3.out", stagger: 0.1 });
            els.forEach((el) => {
              const target = Number(el.dataset.count), dec = Number(el.dataset.dec || 0), o = { v: 0 };
              gsap.to(o, {
                v: target,
                duration: 2.2,
                ease: "power3.out",
                onUpdate: () => { el.textContent = o.v.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec }); },
              });
            });
          },
        });
      });
      mm.add("(prefers-reduced-motion: reduce)", () => els.forEach((el) => { el.textContent = Number(el.dataset.count).toLocaleString("en-US"); }));
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className="container-x py-16">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
        {stats.map((s, i) => (
          <div key={s.label} className={`stat text-center ${i ? "md:border-r md:border-white/10" : ""}`}>
            <dd className="font-serif text-5xl font-semibold tabular-nums text-white md:text-6xl">
              <span data-count={s.value} data-dec={s.decimals ?? 0}>0</span>
              <span className="text-sky-2">{s.suffix}</span>
            </dd>
            <dt className="mt-3 text-sm tracking-wide text-mist/65">{s.label}</dt>
          </div>
        ))}
      </dl>
    </div>
  );
}
