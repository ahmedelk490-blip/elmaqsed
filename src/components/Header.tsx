"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useLenis } from "lenis/react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useContent } from "./ContentProvider";
import { Icon } from "./Icons";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function Header() {
  const { nav: items, site } = useContent();
  const nav = items.some((n) => n.href === "/") ? items : [{ href: "/", label: "الرئيسية" }, ...items];
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const bar = useRef<HTMLSpanElement>(null);
  const pathname = usePathname();
  const lenis = useLenis((l) => setScrolled(l.scroll > 24));
  const tel = `tel:${site.phone.replace(/\s/g, "")}`;

  useGSAP(() => {
    gsap.to(bar.current, { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });
  });
  useEffect(() => { if (open) lenis?.stop(); else lenis?.start(); }, [open, lenis]);

  const links = (cls: string) =>
    nav.map((n) => (
      <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className={`${cls} ${pathname === n.href ? "is-active" : ""}`}>
        {n.label}
      </Link>
    ));

  return (
    <header className={`hdr fixed inset-x-0 top-0 z-50 ${scrolled || open || pathname === "/booking" ? "is-solid" : ""}`}>
      <span ref={bar} className="progress" />
      <div className="mx-auto flex h-[84px] max-w-[92rem] items-center justify-between gap-6 px-5 md:px-8">
        <Link href="/" aria-label="المقصد — الرئيسية" className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo.svg" alt="المقصد ELMAQSED" className="h-10 w-auto md:h-11" />
        </Link>
        <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[.06] p-1 lg:flex">{links("hdr-link")}</nav>
        <div className="flex items-center gap-4">
          <a href={tel} className="hidden items-center gap-2 text-sm text-mist/85 transition-colors hover:text-white xl:flex" dir="ltr">
            <Icon name="phone" className="h-4 w-4 text-sky-2" />{site.phone}
          </a>
          <Link href="/booking" className="btn btn-primary btn-sm hidden sm:inline-flex">احجز الآن</Link>
          <button onClick={() => setOpen((o) => !o)} className="hdr-burger lg:hidden" aria-label="القائمة" aria-expanded={open}>
            <span /><span /><span />
          </button>
        </div>
      </div>

      <div className={`hdr-menu lg:hidden ${open ? "is-open" : ""}`} aria-hidden={!open}>
        <nav className="flex flex-col px-6 pt-2">{links("hdr-mlink")}</nav>
        <div className="mt-8 flex flex-col gap-3 px-6">
          <Link href="/booking" onClick={() => setOpen(false)} className="btn btn-primary justify-center">احجز الآن</Link>
          <a href={tel} className="btn btn-ghost justify-center" dir="ltr">{site.phone}</a>
        </div>
        <p className="mt-8 px-6 text-sm text-mist/50">{site.hours}</p>
      </div>
    </header>
  );
}
