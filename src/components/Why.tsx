"use client";
import { useEffect, useRef } from "react";
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

const RINGS = [130, 165, 205]; // ring diameters, % of the logo width
const TURN = 40; // seconds per revolution
const TILT = (64 * Math.PI) / 180;
const PERSP = 1000;

/** The symbol lies flat in its orbit like a turning disc; destinations circle around it and always face the reader. */
export default function Why() {
  const { why, countries } = useContent();
  const ref = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);

  // Chips ride the tilted rings: same perspective projection as the CSS rings, but always facing the reader.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const all = [...el.querySelectorAll<HTMLElement>(".orb-chip")];
    const wide = matchMedia("(min-width: 640px)");
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t0 = performance.now();
    let W = el.offsetWidth, raf = 0;
    // One rigid rotation, chips evenly spaced and alternating rings, so they never collide.
    const place = (now: number) => {
      const chips = wide.matches ? all : all.slice(0, 5), rings = wide.matches ? 3 : 2;
      const spin = still ? 0 : ((now - t0) / 1000 / TURN) * Math.PI * 2;
      chips.forEach((c, i) => {
        const a = (i / chips.length) * Math.PI * 2 + spin;
        const R = (RINGS[i % rings] / 200) * W, s = Math.sin(a);
        const z = R * s * Math.sin(TILT), k = PERSP / (PERSP - z);
        c.style.transform = `translate3d(${(R * Math.cos(a) * k).toFixed(1)}px, ${(R * s * Math.cos(TILT) * k).toFixed(1)}px, 0) translate(-50%, -50%) scale(${k.toFixed(3)})`;
        c.style.opacity = (0.5 + 0.25 * (s + 1)).toFixed(2);
        c.style.zIndex = z > 0 ? "3" : "1";
      });
    };
    const tick = (now: number) => { place(now); raf = requestAnimationFrame(tick); };
    const io = new IntersectionObserver(([e]) => { cancelAnimationFrame(raf); if (e.isIntersecting && !still) raf = requestAnimationFrame(tick); });
    const ro = new ResizeObserver(() => { W = el.offsetWidth; place(performance.now()); });
    place(t0);
    io.observe(el);
    ro.observe(el);
    return () => { io.disconnect(); ro.disconnect(); cancelAnimationFrame(raf); };
  }, []);

  useGSAP(
    () => {
      const paths = gsap.utils.toArray<SVGPathElement>(".why-sym path", ref.current);
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(paths, { fillOpacity: 0, stroke: "#63b6ea", strokeWidth: 3, drawSVG: "0%" });
        gsap.timeline({ scrollTrigger: { trigger: ".why-sym", start: "top 85%", once: true } })
          .to(paths, { drawSVG: "100%", stagger: 0.12, duration: 1.4, ease: "power2.inOut" })
          .to(paths, { fillOpacity: 1, strokeOpacity: 0, duration: 0.8, ease: "power2.out" }, "-=0.3")
          .from(".orb-rings", { scale: 0.8, autoAlpha: 0, duration: 0.9, ease: "power3.out" }, "-=0.8")
          .from(".orb-chips", { autoAlpha: 0, duration: 0.8 }, "-=0.5");
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
        <div ref={stage} className="orbit-stage relative mx-auto my-16 w-[min(40vw,270px)]" style={{ perspective: 1000 }}>
          <div className="orb-rings absolute inset-0" style={{ perspective: 1000 }}>
            {RINGS.map((s) => <div key={s} className="orb3d absolute left-1/2 top-1/2" style={{ width: `${s}%`, height: `${s}%` }} />)}
          </div>
          <span className="absolute inset-[-10%] rounded-full bg-sky/15 blur-3xl" />
          <div className="why-disc-wrap relative z-[2]">
            <div className="why-disc">
              <div className="why-sym"><Symbol className="w-full text-white drop-shadow-[0_0_30px_rgba(46,148,210,.45)]" id="why" /></div>
            </div>
          </div>
          <div className="orb-chips absolute inset-0">
            {countries.slice(0, 8).map((c, i) => (
              <span key={c.slug} className={`orb-chip ${i >= 5 ? "hidden sm:inline-flex" : ""}`} style={{ opacity: 0 }}>
                <span className={`fi fi-${c.code} rounded-sm`} />{c.name}
              </span>
            ))}
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
