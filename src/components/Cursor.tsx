"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";

/** Desktop-only custom cursor: a quick dot and a lagging ring that swells over links and buttons. */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const d = dot.current!, r = ring.current!;
    const dx = gsap.quickTo(d, "x", { duration: 0.12, ease: "power3" }), dy = gsap.quickTo(d, "y", { duration: 0.12, ease: "power3" });
    const rx = gsap.quickTo(r, "x", { duration: 0.45, ease: "power3" }), ry = gsap.quickTo(r, "y", { duration: 0.45, ease: "power3" });
    const move = (e: MouseEvent) => {
      dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY);
      r.classList.toggle("is-on", !!(e.target as HTMLElement).closest("a, button, [data-cursor]"));
    };
    const hide = () => gsap.to([d, r], { autoAlpha: 0, duration: 0.25 });
    const show = () => gsap.to([d, r], { autoAlpha: 1, duration: 0.25 });
    window.addEventListener("mousemove", move);
    document.addEventListener("mouseleave", hide);
    document.addEventListener("mouseenter", show);
    document.documentElement.classList.add("has-cursor");
    return () => {
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseleave", hide);
      document.removeEventListener("mouseenter", show);
      document.documentElement.classList.remove("has-cursor");
    };
  }, []);
  return (
    <>
      <div ref={dot} className="cur-dot" aria-hidden="true" />
      <div ref={ring} className="cur-ring" aria-hidden="true" />
    </>
  );
}
