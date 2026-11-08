"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useLenis } from "lenis/react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useContent, useLang, useT } from "./ContentProvider";
import { Icon } from "./Icons";
import ContactChoice, { ContactOptions } from "./ContactChoice";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function Header() {
  const { nav: items, site } = useContent();
  const lang = useLang();
  const t = useT();
  const nav = items.some((n) => n.href === "/") ? items : [{ href: "/", label: t("الرئيسية", "Home") }, ...items];
  // the language lives in a cookie; reloading renders every page (and the html dir) in the new language
  const switchLang = () => {
    document.cookie = `lang=${lang === "en" ? "ar" : "en"}; path=/; max-age=31536000; samesite=lax`;
    location.reload();
  };
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const bar = useRef<HTMLSpanElement>(null);
  const pathname = usePathname();
  const lenis = useLenis((l) => setScrolled(l.scroll > 24));

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
        <Link href="/" aria-label={t("المقصد — الرئيسية", "ELMAQSED — Home")} className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo.svg" alt="المقصد ELMAQSED" className="h-10 w-auto md:h-11" />
        </Link>
        <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[.06] p-1 lg:flex">{links("hdr-link")}</nav>
        <div className="flex items-center gap-4">
          <ContactChoice />
          <button type="button" onClick={switchLang} className="lang-btn" lang={lang === "en" ? "ar" : "en"} aria-label={lang === "en" ? "العربية" : "English"}>
            <Icon name="globe" className="h-[1.1rem] w-[1.1rem] text-sky-2" /><span className="max-[400px]:hidden lg:max-xl:hidden">{lang === "en" ? "العربية" : "EN"}</span>
          </button>
          <Link href="/booking" className="btn btn-primary btn-sm hidden sm:inline-flex">{t("احجز الآن", "Book now")}</Link>
          <button onClick={() => setOpen((o) => !o)} className="hdr-burger lg:hidden" aria-label={t("القائمة", "Menu")} aria-expanded={open}>
            <span /><span /><span />
          </button>
        </div>
      </div>

      <div className={`hdr-menu lg:hidden ${open ? "is-open" : ""}`} aria-hidden={!open} data-lenis-prevent>
        <nav className="flex flex-col px-6 pt-2">{links("hdr-mlink")}</nav>
        <div className="mt-8 flex flex-col gap-3 px-6">
          <Link href="/booking" onClick={() => setOpen(false)} className="btn btn-primary justify-center">{t("احجز الآن", "Book now")}</Link>
          <div className="cc-menu"><ContactOptions onPick={() => setOpen(false)} /></div>
        </div>
        <p className="mt-8 px-6 text-sm text-mist/50">{site.hours}</p>
      </div>
    </header>
  );
}
