"use client";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Symbol from "./Symbol";
import BgImage from "./BgImage";
import HeroSearch from "./HeroSearch";
import { useContent } from "./ContentProvider";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

/** Brand hero: the symbol's arrows converge on one point, then the visitor searches for a visa or a hotel. */
export default function Hero() {
  const { site } = useContent();
  const ref = useRef<HTMLElement>(null);
  const symRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Brand story: arrows arrive from different directions and converge on one destination point.
        const svg = ref.current!.querySelector<SVGSVGElement>(".sym-svg")!;
        const vb = svg.viewBox.baseVal;
        const cx = vb.x + vb.width / 2, cy = vb.y + vb.height / 2;
        const arrows = gsap.utils.toArray<SVGPathElement>(".sym-arrow", svg);
        arrows.forEach((p) => {
          const b = p.getBBox();
          gsap.set(p, { x: (b.x + b.width / 2 - cx) * 1.3, y: (b.y + b.height / 2 - cy) * 1.3, opacity: 0, scale: 0.5, transformOrigin: "50% 50%" });
        });
        gsap.timeline({ defaults: { ease: "power4.out" } })
          .to(arrows, { x: 0, y: 0, opacity: 1, scale: 1, duration: 1.4, stagger: { each: 0.08, from: "random" } }, 0.2)
          .fromTo(".sym-core", { scale: 0, opacity: 0, transformOrigin: "50% 50%" }, { scale: 1, opacity: 1, duration: 0.7, ease: "back.out(3)" }, 1)
          .fromTo(".ignite", { scale: 0, opacity: 0.9 }, { scale: 4, opacity: 0, duration: 1.3, ease: "power2.out" }, 1.05)
          .fromTo(".sym-glow", { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 1.2 }, 1.05)
          .fromTo("[data-h]", { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.1 }, 0.9);

        SplitText.create(".hero-title", {
          type: "words",
          autoSplit: true,
          onSplit: (self) => {
            gsap.set(".hero-title", { opacity: 1 });
            return gsap.from(self.words, { opacity: 0, y: 26, filter: "blur(16px)", duration: 1, ease: "power3.out", stagger: 0.07, delay: 0.7 });
          },
        });

        // idle life
        gsap.to(".sym-glow", { opacity: 0.6, scale: 1.15, duration: 2.6, yoyo: true, repeat: -1, ease: "sine.inOut", delay: 2.5 });
        gsap.to(symRef.current, { y: -10, duration: 3, yoyo: true, repeat: -1, ease: "sine.inOut", delay: 2.5 });

        // the symbol tilts in 3D toward the pointer
        const rY = gsap.quickTo(".sym-tilt", "rotationY", { duration: 0.9, ease: "power3" });
        const rX = gsap.quickTo(".sym-tilt", "rotationX", { duration: 0.9, ease: "power3" });
        const el = ref.current!;
        const move = (e: MouseEvent) => {
          const r = el.getBoundingClientRect();
          rY(((e.clientX - r.left) / r.width - 0.5) * 30);
          rX(-((e.clientY - r.top) / r.height - 0.5) * 30);
        };
        el.addEventListener("mousemove", move);
        return () => el.removeEventListener("mousemove", move);
      });
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        gsap.to(".hero-content", { yPercent: -10, opacity: 0.2, ease: "none", scrollTrigger: { trigger: ref.current, start: "top top", end: "bottom top", scrub: true } });
      });
      mm.add("(prefers-reduced-motion: reduce)", () => gsap.set(["[data-h]", ".sym-glow", ".hero-title"], { autoAlpha: 1 }));
    },
    { scope: ref },
  );

  return (
    <section ref={ref} className="relative flex min-h-[100svh] items-center overflow-hidden pt-[84px]">
      <BgImage src="/img/p05.jpg" priority kenburns overlay="bg-[linear-gradient(180deg,rgba(11,31,57,.76)_0%,rgba(11,31,57,.96)_30%,rgba(11,31,57,.985)_62%,#0b1f39_100%)]" />
      <div className="orb absolute left-[10%] top-[16%] h-72 w-72 rounded-full bg-sky/25 blur-[90px]" />
      <div className="orb absolute right-[8%] top-[52%] h-96 w-96 rounded-full bg-[#1d4f8f]/40 blur-[110px]" />
      <div className="orb absolute -bottom-[10%] left-[38%] h-80 w-80 rounded-full bg-white/10 blur-[100px]" />
      <div className="grid-bg absolute inset-0 opacity-70" />
      <div className="pointer-events-none absolute inset-x-0 bottom-[-10%] h-[58%]" aria-hidden="true">
        {[0, 1, 2].map((i) => <span key={i} className="ripple-ring" style={{ animationDelay: `${i * 2.8}s` }} />)}
      </div>

      <div className="hero-content container-x relative flex flex-col items-center py-6 text-center md:py-6">
        <p data-h className="pill mb-5 hidden md:inline-flex"><i />{site.nameEn} · Visa Consulting</p>

        <div ref={symRef} className="relative mb-4 w-[min(22vw,84px)] md:mb-5 md:w-[116px]" style={{ perspective: 800 }}>
          <div className="ignite absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,.95),rgba(46,148,210,.6)_35%,transparent_70%)]" />
          <div className="sym-glow absolute inset-[-45%] rounded-full bg-[radial-gradient(circle,rgba(46,148,210,.5),transparent_65%)]" />
          <div className="sym-tilt relative" style={{ transformStyle: "preserve-3d" }}>
            <Symbol className="sym-svg w-full text-white" id="hero" />
          </div>
        </div>

        <h1 className="hero-title max-w-4xl text-4xl font-bold leading-[1.3] sm:text-5xl lg:text-6xl">
          مسار واضح
          <br />
          <span className="grad-text">لوجهتك الصحيحة</span>
        </h1>
        <p data-h className="mt-4 max-w-2xl text-[15px] leading-7 text-mist/85 md:mt-5 md:text-lg md:leading-8">
          استشارات تأشيرات السفر وتجهيز الطلبات باحترافية: نقيّم ملفك بصدق، نجهّز مستنداتك بدقة، ونرافقك خطوة بخطوة حتى تصل إلى مقصدك.
        </p>
        <div data-h className="mt-7 w-full min-w-0 max-w-5xl md:mt-8"><HeroSearch /></div>
        <ul data-h className="mt-6 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-mist/70">
          <li>✓ شركة استشارية مرخصة</li>
          <li>✓ رد خلال 24 ساعة</li>
          <li>✓ رسوم واضحة قبل البدء</li>
        </ul>
      </div>
    </section>
  );
}
