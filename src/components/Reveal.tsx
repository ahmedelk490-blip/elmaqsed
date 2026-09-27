"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";

/** Staggered fade-up for every descendant carrying `data-r` once the wrapper enters the viewport (IntersectionObserver, immune to stale scroll positions). */
export default function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current!;
    const items = el.querySelectorAll("[data-r]");
    if (!items.length) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { gsap.set(items, { autoAlpha: 1 }); return; }
    let done = false;
    const play = () => {
      if (done) return;
      done = true;
      io.disconnect();
      gsap.fromTo(items, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.08, overwrite: true });
    };
    const io = new IntersectionObserver((entries) => { if (entries.some((e) => e.isIntersecting)) play(); }, { rootMargin: "0px 0px -12% 0px", threshold: 0.05 });
    io.observe(el);
    return () => { io.disconnect(); };
  }, []);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
