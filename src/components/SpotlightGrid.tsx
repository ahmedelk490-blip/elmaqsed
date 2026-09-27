"use client";
import { useEffect, useRef } from "react";

/** Feeds cursor coordinates to every `.spot` card (radial highlight) and tilts `.tilt` cards in 3D toward the pointer. */
export default function SpotlightGrid({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const el = ref.current!;
    const cards = el.querySelectorAll<HTMLElement>(".spot, .tilt");
    const move = (e: MouseEvent) => {
      cards.forEach((c) => {
        const r = c.getBoundingClientRect();
        const x = e.clientX - r.left, y = e.clientY - r.top;
        c.style.setProperty("--mx", `${x}px`);
        c.style.setProperty("--my", `${y}px`);
        if (c.classList.contains("tilt") && x >= 0 && y >= 0 && x <= r.width && y <= r.height) {
          const rx = -((y / r.height) - 0.5) * 9, ry = ((x / r.width) - 0.5) * 9;
          c.style.transform = `perspective(900px) translateY(-6px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
        }
      });
    };
    const leave = (e: Event) => { (e.currentTarget as HTMLElement).style.transform = ""; };
    el.addEventListener("mousemove", move);
    cards.forEach((c) => c.addEventListener("mouseleave", leave));
    return () => { el.removeEventListener("mousemove", move); cards.forEach((c) => c.removeEventListener("mouseleave", leave)); };
  }, []);
  return <div ref={ref} className={className}>{children}</div>;
}
