"use client";
import { ReactLenis, useLenis } from "lenis/react";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function GsapSync() {
  const lenis = useLenis();
  const pathname = usePathname();
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

  // After a client-side navigation the new page has its own height (pinned sections add more):
  // re-measure, otherwise Lenis stops scrolling where the previous page ended.
  useEffect(() => {
    if (!lenis) return;
    const sync = () => { lenis.resize(); ScrollTrigger.refresh(); lenis.resize(); };
    const a = requestAnimationFrame(() => requestAnimationFrame(sync));
    const t = window.setTimeout(sync, 700); // once the page-enter animation has finished
    return () => { cancelAnimationFrame(a); clearTimeout(t); };
  }, [lenis, pathname]);

  // <html> is height:100%, so Lenis' own observer never sees the content grow; watch <body> instead
  useEffect(() => {
    if (!lenis) return;
    const ro = new ResizeObserver(() => lenis.resize());
    ro.observe(document.body);
    return () => ro.disconnect();
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
