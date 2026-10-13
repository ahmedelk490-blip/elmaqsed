"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { logout } from "@/lib/actions";

type L = { href: string; label: string };
const isOn = (path: string, href: string) => (href === "/admin" ? path === "/admin" : path.startsWith(href));

/** Dashboard navigation: a side bar from tablet width, a top bar with a menu button and a drop-down list on phones. */
export default function AdminNav({ links }: { links: L[] }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);
  const current = links.find((l) => isOn(path, l.href))?.label ?? "لوحة التحكم";
  const list = (cls: string) => links.map((l) => <Link key={l.href} href={l.href} aria-current={isOn(path, l.href) ? "page" : undefined} className={cls}>{l.label}</Link>);
  const foot = (
    <>
      <a href="/" target="_blank" className="a-nav">عرض الموقع ↗</a>
      <form action={logout}><button className="a-nav w-full text-start">تسجيل الخروج</button></form>
    </>
  );
  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col overflow-y-auto bg-navy p-5 text-white md:flex">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo.svg" alt="المقصد" className="mb-8 h-9 w-auto self-start" />
        <nav className="flex flex-col gap-1 text-sm">{list("a-nav")}</nav>
        <div className="mt-auto flex flex-col gap-1 border-t border-white/10 pt-4 text-sm">{foot}</div>
      </aside>

      <header className="a-top md:hidden">
        <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="a-menu" aria-label={open ? "إغلاق القائمة" : "القائمة"} className="a-burger">
          <span /><span /><span />
        </button>
        <b className="min-w-0 flex-1 truncate text-base">{current}</b>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/symbol.svg" alt="المقصد" className="h-8 w-8" />
      </header>
      {open && (
        <div id="a-menu" className="a-menu md:hidden" onClick={() => setOpen(false)}>
          <nav className="a-menu-panel" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col gap-1">{list("a-nav")}</div>
            <div className="mt-3 flex flex-col gap-1 border-t border-white/10 pt-3">{foot}</div>
          </nav>
        </div>
      )}
    </>
  );
}
