"use client";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { useContent } from "./ContentProvider";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";
import SpotlightGrid from "./SpotlightGrid";
import Symbol from "./Symbol";

gsap.registerPlugin(useGSAP, ScrollTrigger, DrawSVGPlugin);

/** Why us: the symbol draws itself with destinations orbiting it; each reason card lights up as it crosses the middle of the screen. */
export default function Why() {
  const { why } = useContent();
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const paths = gsap.utils.toArray<SVGPathElement>(".why-sym path", ref.current);
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(paths, { fillOpacity: 0, stroke: "#63b6ea", strokeWidth: 3, drawSVG: "0%" });
        gsap.timeline({ scrollTrigger: { trigger: ".why-sym", start: "top 85%", once: true } })
          .to(paths, { drawSVG: "100%", stagger: 0.12, duration: 1.4, ease: "power2.inOut" })
          .to(paths, { fillOpacity: 1, strokeOpacity: 0, duration: 0.8, ease: "power2.out" }, "-=0.3")
          .from(".orbit", { scale: 0.6, autoAlpha: 0, stagger: 0.15, duration: 0.9, ease: "power3.out" }, "-=0.8");
        gsap.utils.toArray<HTMLElement>(".why-card", ref.current).forEach((card) => {
          ScrollTrigger.create({ trigger: card, start: "top 60%", end: "bottom 40%", toggleClass: "is-lit" });
        });
      });
      mm.add("(prefers-reduced-motion: reduce)", () => gsap.set(paths, { clearProps: "all" }));
    },
    { scope: ref },
  );

  return (
    <section id="why" ref={ref} className="relative overflow-hidden py-24 md:py-32">
      <span className="ghost right-[-3%] top-8">WHY ELMAQSED</span>
      <div className="pointer-events-none absolute left-[10%] top-1/2 h-[34rem] w-[34rem] -translate-y-1/2 rounded-full bg-sky/10 blur-[120px]" />
      <Reveal className="container-x relative grid items-center gap-16 lg:grid-cols-2">
        <div className="relative mx-auto w-[min(60vw,300px)]" style={{ perspective: 900 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} className="orbit absolute left-1/2 top-1/2" style={{ width: `${150 + i * 45}%`, height: `${150 + i * 45}%`, animationDuration: `${14 + i * 8}s`, animationDirection: i === 1 ? "reverse" : "normal" }}>
              <span className="orbit-dot" />
            </div>
          ))}
          <span className="absolute inset-[-10%] rounded-full bg-sky/15 blur-3xl" />
          <div className="why-sym relative"><Symbol className="w-full text-white drop-shadow-[0_0_30px_rgba(46,148,210,.45)]" id="why" /></div>
        </div>
        <div>
          <SectionHead
            eyebrow="Why Elmaqsed"
            title="كل عميل له مسار مختلف… ووجهة واحدة"
            text="بُنيت علامة المقصد على فكرة بسيطة: أسهم قادمة من اتجاهات مختلفة تتوحد نحو نقطة واحدة. دورنا أن نأخذ ظروفك كما هي، ونرسم لك المسار الأوضح نحو الوصول."
          />
          <SpotlightGrid className="space-y-4">
            {why.map((w, i) => (
              <div key={w.title} data-r className="why-card card spot tilt flex gap-5 p-6">
                <span className="num-grad font-serif text-5xl leading-none">0{i + 1}</span>
                <div>
                  <h3 className="text-lg font-bold">{w.title}</h3>
                  <p className="mt-2 leading-8 text-mist/75">{w.text}</p>
                </div>
              </div>
            ))}
          </SpotlightGrid>
        </div>
      </Reveal>
    </section>
  );
}
