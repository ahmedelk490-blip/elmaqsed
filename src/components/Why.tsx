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

const RINGS = [
  { size: 150, dur: 28, n: 2, rev: false, from: 0 },
  { size: 200, dur: 40, n: 3, rev: true, from: 2 },
  { size: 250, dur: 54, n: 3, rev: false, from: 5 },
];

/** The symbol lies flat in its orbit like a turning disc; destinations circle around it and always face the reader. */
export default function Why() {
  const { why, countries } = useContent();
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
          .from(".orb3d", { scale: 0.6, autoAlpha: 0, stagger: 0.15, duration: 0.9, ease: "power3.out" }, "-=0.8");
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
        <div className="orbit-stage relative mx-auto my-16 w-[min(56vw,270px)]" style={{ perspective: 1000 }}>
          {RINGS.map((r, i) => (
            <div key={i} className="orb3d absolute left-1/2 top-1/2" style={{ width: `${r.size}%`, height: `${r.size}%`, animationDuration: `${r.dur}s`, animationDirection: r.rev ? "reverse" : "normal" }}>
              {countries.slice(r.from, r.from + r.n).map((c, j, arr) => {
                const a = (j / arr.length) * Math.PI * 2 + i * 0.7;
                return (
                  <span key={c.slug} className={`orb3d-anchor ${i === 2 ? "hidden sm:block" : ""}`} style={{ left: `${50 + 50 * Math.cos(a)}%`, top: `${50 + 50 * Math.sin(a)}%`, animationDuration: `${r.dur}s`, animationDirection: r.rev ? "reverse" : "normal" }}>
                    <span className="orb3d-chip"><span className={`fi fi-${c.code} rounded-sm`} />{c.name}</span>
                  </span>
                );
              })}
            </div>
          ))}
          <span className="absolute inset-[-10%] rounded-full bg-sky/15 blur-3xl" />
          <div className="why-disc-wrap relative">
            <div className="why-disc">
              <div className="why-sym"><Symbol className="w-full text-white drop-shadow-[0_0_30px_rgba(46,148,210,.45)]" id="why" /></div>
            </div>
          </div>
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
