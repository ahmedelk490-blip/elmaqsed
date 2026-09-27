"use client";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Symbol from "./Symbol";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** The brand symbol assembles itself as you scroll: arrows fly in from their own directions and meet at the centre. */
export default function SymbolConverge() {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const svg = ref.current!.querySelector("svg")!;
      const vb = svg.viewBox.baseVal;
      const cx = vb.x + vb.width / 2, cy = vb.y + vb.height / 2;
      const arrows = gsap.utils.toArray<SVGPathElement>(".sym-arrow", svg);
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: ref.current, start: "top 85%", end: "center 40%", scrub: 0.8 } });
        arrows.forEach((p) => {
          const b = p.getBBox();
          tl.from(p, { x: (b.x + b.width / 2 - cx) * 1.4, y: (b.y + b.height / 2 - cy) * 1.4, opacity: 0, transformOrigin: "50% 50%", ease: "power2.out" }, 0);
        });
        tl.from(".sym-core", { scale: 0, transformOrigin: "50% 50%", ease: "back.out(2)" }, 0.6);
      });
    },
    { scope: ref },
  );
  return (
    <div ref={ref} className="relative mx-auto w-[min(70vw,360px)]">
      <div className="absolute inset-[-20%] rounded-full bg-sky/20 blur-3xl" />
      <Symbol className="relative w-full text-white drop-shadow-[0_0_30px_rgba(46,148,210,.4)]" id="about" />
    </div>
  );
}
