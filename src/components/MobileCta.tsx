"use client";
import { useEffect, useState } from "react";
import { useContent } from "./ContentProvider";
import { waLink } from "@/lib/types";
import { Icon } from "./Icons";

/** Mobile: a floating booking bar that slides up after the hero and hides again near the footer. */
export default function MobileCta() {
  const { site } = useContent();
  const [show, setShow] = useState(false);
  useEffect(() => {
    let raf = 0;
    const check = () => {
      const h = window.innerHeight;
      const footer = document.querySelector("footer");
      const nearFooter = footer ? footer.getBoundingClientRect().top < h * 0.9 : false;
      setShow(window.scrollY > h * 0.8 && !nearFooter);
    };
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(check); };
    raf = requestAnimationFrame(check);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", onScroll); };
  }, []);
  return (
    <div className={`mcta lg:hidden ${show ? "is-on" : ""}`} aria-hidden={!show}>
      <a href={waLink(site.whatsapp)} target="_blank" rel="noopener" tabIndex={show ? 0 : -1} className="btn btn-primary flex-1 justify-center">احجز استشارتك المجانية</a>
      <a href={`tel:${site.phone.replace(/\s/g, "")}`} tabIndex={show ? 0 : -1} aria-label="اتصال" className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-white/20 text-sky-2"><Icon name="phone" className="h-5 w-5" /></a>
    </div>
  );
}
