"use client";
import Link from "next/link";
import Image from "next/image";
import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useContent } from "./ContentProvider";
import SectionHead from "./SectionHead";
import Reveal from "./Reveal";
import { Icon } from "./Icons";
import ServiceDeck from "./ServiceDeck";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** Theatrical list: hover (or scroll past) a service and the floating preview crossfades, the ghost number slides in and the row opens. */
export default function Services() {
  const { services } = useContent();
  const root = useRef<HTMLElement>(null);
  const noRef = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".svc-row", { autoAlpha: 0, y: 30, stagger: 0.06, duration: 0.65, ease: "power3.out", scrollTrigger: { trigger: ".svc-list", start: "top 82%", once: true } });
        gsap.from(".svc-preview", { clipPath: "inset(0 0 100% 0 round 24px)", duration: 1.1, ease: "power3.inOut", scrollTrigger: { trigger: ".svc-stage", start: "top 78%", once: true } });
      });
      mm.add("(min-width: 1024px)", () => {
        gsap.utils.toArray<HTMLElement>(".svc-row", root.current).forEach((row, i) => {
          ScrollTrigger.create({ trigger: row, start: "top 58%", end: "bottom 58%", onToggle: (self) => { if (self.isActive) requestAnimationFrame(() => activate(i)); } });
        });
      });
    },
    { scope: root },
  );

  const activate = (i: number) => {
    if (i === activeRef.current) return;
    const dir = i > activeRef.current ? 1 : -1;
    activeRef.current = i;
    setActive(i);
    gsap.utils.toArray<HTMLElement>(".svc-img", root.current).forEach((img, k) => {
      if (k === i) gsap.fromTo(img, { autoAlpha: 0, scale: 1.12 }, { autoAlpha: 1, scale: 1, duration: 0.8, ease: "power3.out", overwrite: true });
      else gsap.to(img, { autoAlpha: 0, duration: 0.45, overwrite: true });
    });
    if (noRef.current) gsap.fromTo(noRef.current, { yPercent: 60 * dir, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.55, ease: "power3.out", overwrite: true });
  };

  return (
    <section id="services" ref={root} className="relative overflow-hidden py-24 md:py-32">
      <span className="ghost left-[-3%] top-8">SERVICES</span>
      <div className="container-x relative">
        <Reveal>
          <SectionHead eyebrow="Services" title="خدماتنا الاستشارية" text="من أول سؤال حتى استلام الجواز، نتولى التفاصيل التي تصنع الفرق بين القبول والرفض." link={{ href: "/services", label: "كل الخدمات بالتفصيل" }} />
        </Reveal>
        <div className="lg:hidden"><ServiceDeck /></div>
        <div className="svc-stage hidden items-start gap-10 lg:grid lg:grid-cols-[1fr_.85fr] lg:gap-16">
          <div className="svc-list flex flex-col">
            {services.map((s, i) => (
              <Link key={s.title} href={`/services#s${i + 1}`} className={`svc-row ${i === active ? "is-active" : ""}`} onMouseEnter={() => activate(i)} onFocus={() => activate(i)} data-cursor>
                <span className="svc-thumb relative"><Image src={s.img} alt="" fill sizes="80px" className="object-cover" /></span>
                <span className="idx font-serif">{String(i + 1).padStart(2, "0")}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
                <span className="go"><Icon name="arrow" className="h-4 w-4" /></span>
              </Link>
            ))}
          </div>
          <div className="svc-preview hidden lg:block" aria-hidden="true">
            {services.map((s, i) => (
              <div key={s.title} className="svc-img absolute inset-0" style={{ opacity: i === 0 ? 1 : 0 }}>
                <Image src={s.img} alt="" fill sizes="45vw" className="object-cover" />
              </div>
            ))}
            <span className="svc-no"><span ref={noRef}>{String(active + 1).padStart(2, "0")}</span></span>
            <span className="svc-label">{services[active]?.title}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
