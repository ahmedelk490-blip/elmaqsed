"use client";
import { ReactLenis, useLenis } from "lenis/react";
import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function GsapSync() {
  const lenis = useLenis();
  useEffect(() => {
    if (!lenis) return;
    const onScroll = () => ScrollTrigger.update();
    const tick = (t: number) => lenis.raf(t * 1000);
    lenis.on("scroll", onScroll);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return () => {
      lenis.off("scroll", onScroll);
      gsap.ticker.remove(tick);
    };
  }, [lenis]);
  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return (
    <ReactLenis root options={{ lerp: reduce ? 1 : 0.1, autoRaf: false }}>
      <GsapSync />
      {children}
    </ReactLenis>
  );
}
