"use client";
import { useLenis } from "lenis/react";
import { Icon } from "./Icons";

/** Clear "back to top" button at the very bottom of the footer. */
export default function BackToTop() {
  const lenis = useLenis();
  const up = () => (lenis ? lenis.scrollTo(0, { duration: 1.2 }) : window.scrollTo({ top: 0, behavior: "smooth" }));
  return (
    <button type="button" onClick={up} className="to-top">
      <span className="to-top-ico"><Icon name="arrow" className="h-4 w-4 rotate-90" /></span>
      أعلى الصفحة
    </button>
  );
}
