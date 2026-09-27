"use client";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useContent } from "./ContentProvider";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function StepsStrip() {
  const { steps } = useContent();
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(".ss-line", { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { trigger: ref.current, start: "top 75%", end: "bottom 60%", scrub: 0.6 } });
        gsap.utils.toArray<HTMLElement>(".ss-step", ref.current).forEach((el, i) => {
          ScrollTrigger.create({ trigger: ref.current, start: `top ${75 - i * 5}%`, onEnter: () => el.classList.add("is-on"), onLeaveBack: () => el.classList.remove("is-on") });
        });
      });
    },
    { scope: ref },
  );
  return (
    <div ref={ref} className="relative">
      <span className="absolute inset-x-[10%] top-7 hidden h-px bg-white/10 lg:block" />
      <span className="ss-line absolute inset-x-[10%] top-7 hidden h-px origin-right bg-gradient-to-l from-sky-2 to-sky lg:block" />
      <ol className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:text-center">
        {steps.map((s) => (
          <li key={s.n} className="ss-step">
            <span className="ss-dot grid h-14 w-14 place-items-center rounded-full border border-white/20 bg-navy font-serif text-lg transition-all duration-500 lg:mx-auto">{s.n}</span>
            <h3 className="mt-5 text-lg font-bold">{s.title}</h3>
            <p className="mt-2 text-sm leading-7 text-mist/70">{s.text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
