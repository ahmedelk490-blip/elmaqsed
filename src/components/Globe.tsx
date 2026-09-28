"use client";
import createGlobe from "cobe";
import { useEffect, useRef } from "react";

const RIYADH: [number, number] = [24.71, 46.68];
const dests: [number, number][] = [
  [48.85, 2.35], [40.71, -74.0], [51.5, -0.12], [45.42, -75.7], [-33.87, 151.2], [41.0, 28.97],
  [35.68, 139.69], [39.9, 116.4], [28.61, 77.2], [25.2, 55.27], [30.04, 31.24], [43.85, 18.41],
];

/** Dotted globe with flight arcs out of Riyadh. Drag it left/right to spin (with inertia); renders only while on screen. */
export default function Globe({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const el = ref.current!;
    const size = el.offsetWidth || 300;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let phi = 4.2, velocity = 0, dragging = false, lastX = 0, raf = 0, visible = false;
    const globe = createGlobe(el, {
      devicePixelRatio: dpr, width: size * dpr, height: size * dpr, phi, theta: 0.28, dark: 1, diffuse: 1.4,
      mapSamples: 12000, mapBrightness: 5, baseColor: [0.08, 0.2, 0.38], markerColor: [0.39, 0.71, 0.92], glowColor: [0.08, 0.28, 0.55],
      markers: [...dests.map((location) => ({ location, size: 0.05 })), { location: RIYADH, size: 0.1 }],
      arcs: dests.map((to) => ({ from: RIYADH, to })), arcColor: [0.39, 0.71, 0.92], arcWidth: 0.6, arcHeight: 0.35,
    });
    const tick = () => {
      if (!dragging) { phi += (still ? 0 : 0.003) + velocity; velocity *= 0.94; }
      globe.update({ phi });
      raf = requestAnimationFrame(tick);
    };
    const start = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(tick); };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); else cancelAnimationFrame(raf); });
    io.observe(el);
    const down = (e: PointerEvent) => { dragging = true; lastX = e.clientX; velocity = 0; el.style.cursor = "grabbing"; el.setPointerCapture(e.pointerId); };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const d = (e.clientX - lastX) * 0.006;
      lastX = e.clientX; phi += d; velocity = d;
      if (!visible) globe.update({ phi });
    };
    const up = () => { dragging = false; el.style.cursor = "grab"; };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    return () => {
      io.disconnect(); cancelAnimationFrame(raf); globe.destroy();
      el.removeEventListener("pointerdown", down); el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up); el.removeEventListener("pointercancel", up);
    };
  }, []);
  return <canvas ref={ref} className={`aspect-square w-full cursor-grab ${className}`} style={{ contain: "layout paint size", touchAction: "pan-y" }} aria-label="اسحب الكرة لتدويرها" />;
}
