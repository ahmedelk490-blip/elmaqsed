"use client";
import { useRef } from "react";
import type { Testimonial } from "@/lib/types";
import { useRailAutoplay } from "@/lib/useRailAutoplay";

/** Mobile testimonials: a native swipe rail (no continuous animation) that advances on its own. */
export default function TestiRail({ items }: { items: Testimonial[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useRailAutoplay(ref, ".t-card", 4000);
  return (
    <div ref={ref} className="rail flex gap-4 overflow-x-auto px-6 pb-4">
      {items.map((t) => (
        <figure key={t.name} className="t-card rail-card card flex w-[84%] shrink-0 flex-col p-6">
          <span className="font-serif text-6xl leading-none text-sky/60">“</span>
          <blockquote className="-mt-3 flex-1 leading-8 text-mist/85">{t.text}</blockquote>
          <figcaption className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
            <div><p className="font-bold">{t.name}</p><p className="text-sm text-mist/60">{t.city} · {t.visa}</p></div>
            <span className="text-sm tracking-[.2em] text-sky-2">★★★★★</span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
