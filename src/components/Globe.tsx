"use client";
import createGlobe from "cobe";
import { useEffect, useRef } from "react";

const RIYADH: [number, number] = [24.71, 46.68];
const dests: [number, number][] = [
  [48.85, 2.35], [40.71, -74.0], [51.5, -0.12], [45.42, -75.7], [-33.87, 151.2], [41.0, 28.97],
  [35.68, 139.69], [39.9, 116.4], [28.61, 77.2], [25.2, 55.27], [30.04, 31.24], [43.85, 18.41],
];

/** Dotted globe with flight arcs out of Riyadh. Renders only while on screen to keep scrolling smooth. */
export default function Globe({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const el = ref.current!;
    const size = el.offsetWidth || 300;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let phi = 4.2, raf = 0;
    const globe = createGlobe(el, {
      devicePixelRatio: dpr, width: size * dpr, height: size * dpr, phi, theta: 0.28, dark: 1, diffuse: 1.4,
      mapSamples: 12000, mapBrightness: 5, baseColor: [0.08, 0.2, 0.38], markerColor: [0.39, 0.71, 0.92], glowColor: [0.08, 0.28, 0.55],
      markers: [...dests.map((location) => ({ location, size: 0.05 })), { location: RIYADH, size: 0.1 }],
      arcs: dests.map((to) => ({ from: RIYADH, to })), arcColor: [0.39, 0.71, 0.92], arcWidth: 0.6, arcHeight: 0.35,
    });
    const tick = () => { phi += 0.0035; globe.update({ phi }); raf = requestAnimationFrame(tick); };
    const io = new IntersectionObserver(([e]) => {
      cancelAnimationFrame(raf);
      if (e.isIntersecting && !still) raf = requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); globe.destroy(); };
  }, []);
  return <canvas ref={ref} className={`aspect-square w-full ${className}`} style={{ contain: "layout paint size" }} aria-hidden="true" />;
}
