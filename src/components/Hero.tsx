"use client";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Symbol from "./Symbol";
import BgImage from "./BgImage";
import Magnetic from "./Magnetic";
import { Icon } from "./Icons";
import { waLink } from "@/lib/types";
import { useContent } from "./ContentProvider";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

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
        const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
        tl.to(arrows, { x: 0, y: 0, opacity: 1, scale: 1, duration: 1.6, stagger: { each: 0.09, from: "random" } }, 0.3)
          .fromTo(".sym-core", { scale: 0, opacity: 0, transformOrigin: "50% 50%" }, { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(3)" }, 1.25)
          .fromTo(".ignite", { scale: 0, opacity: 0.9 }, { scale: 4, opacity: 0, duration: 1.4, ease: "power2.out" }, 1.3)
          .fromTo(".sym-glow", { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 1.4 }, 1.3)
          .fromTo("[data-h]", { autoAlpha: 0, y: 26, filter: "blur(10px)" }, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 1, stagger: 0.12 }, 1.7);

        SplitText.create(".hero-title", {
          type: "words",
          autoSplit: true,
          onSplit: (self) => {
            gsap.set(".hero-title", { opacity: 1 });
            return gsap.from(self.words, { opacity: 0, y: 26, filter: "blur(16px)", duration: 1.1, ease: "power3.out", stagger: 0.07, delay: 1.4 });
          },
        });

        // idle life
        gsap.to(".sym-glow", { opacity: 0.6, scale: 1.15, duration: 2.6, yoyo: true, repeat: -1, ease: "sine.inOut", delay: 3 });
        gsap.to(symRef.current, { y: -10, duration: 3, yoyo: true, repeat: -1, ease: "sine.inOut", delay: 3 });
        gsap.to(".chip", { y: "random(-9, 9)", x: "random(-5, 5)", duration: "random(2.5, 4)", yoyo: true, repeat: -1, ease: "sine.inOut", stagger: 0.5, delay: 3 });

        // cursor tilt on the symbol
        const rY = gsap.quickTo(".sym-tilt", "rotationY", { duration: 0.9, ease: "power3" });
        const rX = gsap.quickTo(".sym-tilt", "rotationX", { duration: 0.9, ease: "power3" });
        const move = (e: MouseEvent) => {
          const r = ref.current!.getBoundingClientRect();
          rY(((e.clientX - r.left) / r.width - 0.5) * 26);
          rX(-((e.clientY - r.top) / r.height - 0.5) * 26);
        };
        const el = ref.current!;
        el.addEventListener("mousemove", move);

        gsap.to(".hero-content", { yPercent: -14, opacity: 0.15, ease: "none", scrollTrigger: { trigger: ref.current, start: "top top", end: "bottom top", scrub: true } });
        return () => el.removeEventListener("mousemove", move);
      });
      mm.add("(prefers-reduced-motion: reduce)", () => gsap.set(["[data-h]", ".sym-glow", ".hero-title"], { autoAlpha: 1 }));
    },
    { scope: ref },
  );

  return (
    <section ref={ref} className="relative flex min-h-[100svh] items-center overflow-hidden pt-[84px]">
      <BgImage src="/img/p05.jpg" priority kenburns overlay="bg-gradient-to-b from-navy/85 via-navy/75 to-navy" />
      <div className="orb absolute left-[10%] top-[16%] h-72 w-72 rounded-full bg-sky/25 blur-[90px]" />
      <div className="orb absolute right-[8%] top-[52%] h-96 w-96 rounded-full bg-[#1d4f8f]/40 blur-[110px]" />
      <div className="orb absolute -bottom-[10%] left-[38%] h-80 w-80 rounded-full bg-white/10 blur-[100px]" />
      <div className="grid-bg absolute inset-0 opacity-70" />
      <div className="pointer-events-none absolute inset-x-0 bottom-[-10%] h-[58%]" aria-hidden="true">
        {[0, 1, 2].map((i) => <span key={i} className="ripple-ring" style={{ animationDelay: `${i * 2.8}s` }} />)}
      </div>

      <div className="hero-content container-x relative flex flex-col items-center py-14 text-center">
        <p data-h className="pill mb-8"><i />{site.nameEn} · Visa Consulting</p>

        <div ref={symRef} className="relative mb-10 w-[min(46vw,190px)] md:w-[240px]" style={{ perspective: 800 }}>
          <div className="ignite absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,.95),rgba(46,148,210,.6)_35%,transparent_70%)]" />
          <div className="sym-glow absolute inset-[-30%] rounded-full bg-sky/35 blur-3xl" />
          <span data-h className="chip absolute -left-36 top-0 hidden md:inline-flex"><i /><span className="fi fi-eu rounded-sm" />شنغن · موافقة</span>
          <span data-h className="chip absolute -right-40 top-10 hidden md:inline-flex"><i /><span className="fi fi-us rounded-sm" />أمريكا · موافقة</span>
          <span data-h className="chip absolute -left-28 bottom-2 hidden md:inline-flex"><i /><span className="fi fi-gb rounded-sm" />بريطانيا · موافقة</span>
          <span data-h className="chip absolute -right-32 -bottom-8 hidden md:inline-flex"><i /><span className="fi fi-ca rounded-sm" />كندا · موافقة</span>
          <span data-h className="chip chip-far absolute -left-56 top-28 hidden lg:inline-flex"><i /><span className="fi fi-au rounded-sm" />أستراليا · موافقة</span>
          <span data-h className="chip chip-far absolute -right-60 -top-10 hidden lg:inline-flex"><i /><span className="fi fi-jp rounded-sm" />اليابان · موافقة</span>
          <div className="sym-tilt relative" style={{ transformStyle: "preserve-3d" }}>
            <Symbol className="sym-svg w-full text-white drop-shadow-[0_0_40px_rgba(46,148,210,.5)]" id="hero" />
          </div>
        </div>

        <h1 className="hero-title max-w-4xl text-4xl font-bold leading-[1.3] sm:text-6xl lg:text-7xl">
          مسار واضح
          <br />
          <span className="grad-text">لوجهتك الصحيحة</span>
        </h1>
        <p data-h className="mt-8 max-w-2xl text-lg leading-9 text-mist/85 md:text-xl">
          استشارات تأشيرات السفر وتجهيز الطلبات باحترافية: نقيّم ملفك بصدق، نجهّز مستنداتك بدقة، ونرافقك خطوة بخطوة حتى تصل إلى مقصدك.
        </p>
        <div data-h className="mt-10 flex flex-wrap justify-center gap-4">
          <Magnetic>
            <a className="btn btn-primary btn-lg" href={waLink(site.whatsapp)} target="_blank" rel="noopener">
              احجز استشارتك المجانية <Icon name="arrow" className="h-5 w-5" />
            </a>
          </Magnetic>
          <Magnetic>
            <a className="btn btn-ghost btn-lg" href="#destinations">استعرض الوجهات</a>
          </Magnetic>
        </div>
        <ul data-h className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-mist/70">
          <li>✓ شركة استشارية مرخصة</li>
          <li>✓ رد خلال 24 ساعة</li>
          <li>✓ رسوم واضحة قبل البدء</li>
        </ul>
      </div>

      <div data-h className="absolute bottom-5 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 font-serif text-[10px] tracking-[.35em] text-mist/50">
        <span>SCROLL</span>
        <span className="scroll-cue block h-10 w-px bg-white/40" />
      </div>
    </section>
  );
}
