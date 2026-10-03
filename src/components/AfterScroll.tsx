"use client";
import { useEffect, useState } from "react";

/** Shows its children only after the page has been scrolled a little (keeps floating buttons off the hero). */
export default function AfterScroll({ children, offset = 320 }: { children: React.ReactNode; offset?: number }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const check = () => setOn(window.scrollY > offset);
    const id = requestAnimationFrame(check);
    window.addEventListener("scroll", check, { passive: true });
    return () => { cancelAnimationFrame(id); window.removeEventListener("scroll", check); };
  }, [offset]);
  return <div className={`transition-opacity duration-300 ${on ? "opacity-100" : "pointer-events-none opacity-0"}`}>{children}</div>;
}
