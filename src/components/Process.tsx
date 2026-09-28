"use client";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { waLink } from "@/lib/types";
import { useContent } from "./ContentProvider";
import Symbol from "./Symbol";
import SectionHead from "./SectionHead";
import Reveal from "./Reveal";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function Process() {
  const { steps, site } = useContent();
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      // Desktop: the row of steps glides sideways while the section passes, and the path lights up station by station. No pinning.
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const track = ref.current!.querySelector<HTMLElement>(".p-track")!;
        const wrap = track.parentElement!;
        const dist = () => Math.max(0, track.scrollWidth - wrap.clientWidth);
        const tl = gsap.timeline({ scrollTrigger: { trigger: ref.current, start: "top top", end: () => "+=" + (dist() + window.innerHeight * 0.4), pin: true, scrub: 0.8, anticipatePin: 1, invalidateOnRefresh: true } });
        tl.to(track, { x: () => dist(), ease: "none", duration: 1 }, 0)
          .fromTo(".p-line", { scaleX: 0 }, { scaleX: 1, ease: "none", duration: 1 }, 0)
          .to(".p-dot", { backgroundColor: "#2e94d2", borderColor: "#2e94d2", boxShadow: "0 0 18px rgba(46,148,210,.9)", stagger: 0.18, duration: 0.05 }, 0.02)
          .fromTo(".p-dest", { opacity: 0.3, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.15 }, 0.8)
          .fromTo(".p-dest-glow", { opacity: 0 }, { opacity: 1, duration: 0.15 }, 0.8);
        gsap.from(".p-card", { autoAlpha: 0, y: 30, stagger: 0.1, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: wrap, start: "top 85%", once: true } });
      });
      mm.add("(max-width: 1023px) and (prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(".p-line", { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: ref.current, start: "top 60%", end: "bottom 85%", scrub: 0.8 } });
        gsap.from(".p-card", { autoAlpha: 0, y: 30, stagger: 0.12, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: ref.current, start: "top 75%", once: true } });
        gsap.set([".p-dest", ".p-dest-glow"], { autoAlpha: 1 });
      });
      mm.add("(prefers-reduced-motion: reduce)", () => gsap.set([".p-line", ".p-card", ".p-dest", ".p-dest-glow"], { clearProps: "all", autoAlpha: 1 }));
    },
    { scope: ref },
  );

  return (
    <section id="process" ref={ref} className="relative overflow-clip bg-ink py-24 md:py-32 lg:flex lg:h-screen lg:flex-col lg:justify-center lg:py-0">
      <span className="ghost right-[-2%] top-6">JOURNEY</span>
      <div className="container-x relative">
        <Reveal>
          <SectionHead eyebrow="How it works" title="رحلتك معنا… خطوة بخطوة" text="خمس خطوات واضحة، ومستشار واحد يعرف ملفك من البداية حتى الوصول." link={{ href: "/process", label: "تفاصيل الرحلة كاملة" }} />
        </Reveal>
        <div className="relative">
          <ol className="p-track relative hidden lg:flex lg:w-max lg:flex-row lg:gap-6">
            <span className="absolute bottom-2 right-[7px] top-2 w-px bg-white/10 lg:inset-x-0 lg:bottom-auto lg:right-auto lg:top-[7px] lg:h-px lg:w-auto" />
            <span className="p-line absolute bottom-2 right-[7px] top-2 w-px origin-top bg-gradient-to-b from-sky-2 to-sky lg:inset-x-0 lg:bottom-auto lg:right-auto lg:top-[7px] lg:h-px lg:w-auto lg:origin-right lg:bg-gradient-to-l" />
            {steps.map((s) => (
              <li key={s.n} className="p-card relative pr-10 lg:w-[340px] lg:shrink-0 lg:pr-0 lg:pt-12">
                <span className="p-dot absolute right-0 top-2 h-[15px] w-[15px] rounded-full border border-white/30 bg-navy lg:left-0 lg:right-auto lg:top-0" />
                <span className="font-serif text-6xl leading-none text-sky-2/70">{s.n}</span>
                <h3 className="mt-4 text-2xl font-bold">{s.title}</h3>
                <p className="mt-3 max-w-sm leading-8 text-mist/70">{s.text}</p>
              </li>
            ))}
            <li className="p-card relative pr-10 lg:w-[400px] lg:shrink-0 lg:pr-0 lg:pt-12">
              <span className="p-dest-glow absolute -right-16 -top-16 h-48 w-48 rounded-full bg-sky/30 blur-3xl lg:-left-16 lg:right-auto" />
              <span className="p-dest absolute -right-2 top-0 grid h-9 w-9 place-items-center rounded-full bg-navy lg:-left-3 lg:right-auto lg:-top-3">
                <Symbol className="h-8 w-8 text-white" id="dest" />
              </span>
              <Symbol className="h-14 w-14 text-white drop-shadow-[0_0_24px_rgba(46,148,210,.7)]" id="dest-big" />
              <h3 className="mt-4 text-3xl font-bold">وصلت إلى مقصدك</h3>
              <p className="mt-3 max-w-sm leading-8 text-mist/70">تأشيرة في الجواز، وخطة سفر واضحة. وحين تفكر في وجهتك التالية، ملفك جاهز عندنا.</p>
              <a href={waLink(site.whatsapp)} target="_blank" rel="noopener" className="btn btn-primary mt-6">ابدأ رحلتك الآن</a>
            </li>
          </ol>
          {/* mobile: step cards that stack as you scroll */}
          <div className="lg:hidden">
            {steps.map((s, k) => (
              <div key={s.n} className="sticky pb-4" style={{ top: `${96 + k * 14}px` }}>
                <div className="card p-6 shadow-[0_-24px_40px_-24px_rgba(0,0,0,.85)]">
                  <div className="flex items-center justify-between"><span className="num-outline font-serif text-5xl">{s.n}</span><span className="badge text-xs">الخطوة {k + 1} من {steps.length}</span></div>
                  <h3 className="mt-4 text-xl font-bold">{s.title}</h3>
                  <p className="mt-2 leading-8 text-mist/75">{s.text}</p>
                </div>
              </div>
            ))}
            <div className="card glow mt-2 p-6 text-center">
              <Symbol className="mx-auto h-12 w-12 text-white" id="dest-m" />
              <h3 className="mt-3 text-2xl font-bold">وصلت إلى مقصدك</h3>
              <a href={waLink(site.whatsapp)} target="_blank" rel="noopener" className="btn btn-primary mt-5">ابدأ رحلتك الآن</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
