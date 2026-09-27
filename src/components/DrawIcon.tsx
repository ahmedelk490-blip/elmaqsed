"use client";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { Icon } from "./Icons";

gsap.registerPlugin(useGSAP, ScrollTrigger, DrawSVGPlugin);

/** Service icon that draws its stroke as it scrolls into view. */
export default function DrawIcon({ name }: { name: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const p = ref.current!.querySelector("path")!;
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(p, { drawSVG: "0%" }, { drawSVG: "100%", ease: "none", scrollTrigger: { trigger: ref.current, start: "top 88%", end: "top 45%", scrub: 0.5 } });
      });
    },
    { scope: ref },
  );
  return (
    <div ref={ref} className="grid h-24 w-24 shrink-0 place-items-center rounded-full border border-sky/40 bg-sky/10 text-sky-2 shadow-[0_0_40px_rgba(46,148,210,.25)] md:h-28 md:w-28">
      <Icon name={name} className="h-11 w-11 md:h-12 md:w-12" />
    </div>
  );
}
