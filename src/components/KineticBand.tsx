"use client";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useContent } from "./ContentProvider";
import Symbol from "./Symbol";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** Two giant rows of destination names drifting in opposite directions; scrolling speeds them up and skews them. */
export default function KineticBand() {
  const { countries } = useContent();
  const ref = useRef<HTMLElement>(null);
  const items = [...countries, ...countries];
  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const rows = gsap.utils.toArray<HTMLElement>(".kb-row", ref.current);
        const tweens = rows.map((row, i) =>
          i % 2
            ? gsap.fromTo(row, { xPercent: -50 }, { xPercent: 0, ease: "none", duration: 48, repeat: -1 })
            : gsap.fromTo(row, { xPercent: 0 }, { xPercent: -50, ease: "none", duration: 48, repeat: -1 }),
        );
        const skew = gsap.quickTo(rows, "skewX", { duration: 0.4, ease: "power3" });
        let reset: gsap.core.Tween | undefined;
        ScrollTrigger.create({
          trigger: ref.current,
          start: "top bottom",
          end: "bottom top",
          onToggle: (self) => tweens.forEach((t) => (self.isActive ? t.resume() : t.pause())),
          onUpdate: (self) => {
            const v = self.getVelocity();
            const boost = 1 + Math.min(Math.abs(v) / 300, 5);
            tweens.forEach((t) => {
              gsap.killTweensOf(t);
              gsap.to(t, { timeScale: boost, duration: 0.2, onComplete: () => { gsap.to(t, { timeScale: 1, duration: 1.2, ease: "power2.out" }); } });
            });
            skew(gsap.utils.clamp(-10, 10, v / -250));
            reset?.kill();
            reset = gsap.delayedCall(0.2, () => skew(0));
          },
        });
      });
    },
    { scope: ref },
  );
  return (
    <section ref={ref} className="relative overflow-hidden border-y border-white/5 bg-ink py-10 md:py-14" aria-hidden="true">
      {[0, 1].map((r) => (
        <div key={r} className={`overflow-hidden ${r ? "mt-3 md:mt-5" : ""}`} dir="ltr">
          <div className={`kb-row flex w-max items-center ${r ? "kb-outline" : ""}`}>
            {items.map((c, i) => (
              <span key={i} className="flex items-center gap-8 pe-8 md:gap-12 md:pe-12">
                <span className="kb-word display whitespace-nowrap text-5xl font-bold leading-[1.4] md:text-8xl">{c.name}</span>
                <Symbol className="h-7 w-7 shrink-0 text-sky md:h-11 md:w-11" id="kb" />
              </span>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
