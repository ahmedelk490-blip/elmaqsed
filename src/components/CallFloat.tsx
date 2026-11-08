"use client";
import { useEffect, useRef, useState } from "react";
import { contactLines, waLink, type Line } from "@/lib/types";
import { useContent, useT } from "./ContentProvider";
import { WA_PATH } from "./ContactChoice";
import { Icon } from "./Icons";

const btn = "relative grid h-14 w-14 place-items-center rounded-full border shadow-[0_10px_40px_rgba(46,148,210,.4)] transition-transform hover:scale-105";
const waIcon = (cls: string) => <svg viewBox="0 0 24 24" className={`relative ${cls}`} fill="currentColor" aria-hidden="true"><path d={WA_PATH} /></svg>;

/**
 * Floating contact buttons on every screen: WhatsApp on top, call below, numbers from the dashboard.
 * With two numbers (e.g. Saudi Arabia and the UAE) a tap opens them side by side, each with its country flag.
 */
export default function CallFloat() {
  const { site } = useContent();
  const t = useT();
  const { calls, chats } = contactLines(site);
  const [open, setOpen] = useState<"wa" | "call" | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const away = (e: Event) => { if (!ref.current?.contains(e.target as Node)) setOpen(null); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(null); };
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("pointerdown", away); document.removeEventListener("keydown", esc); };
  }, [open]);

  const msg = t("السلام عليكم، أرغب في استشارة بخصوص تأشيرة السفر", "Hello, I would like advice about a travel visa");
  const groups = [
    { key: "wa" as const, list: chats, href: (l: Line) => waLink(l.dial, msg), ext: true, label: t("واتساب", "WhatsApp"), cls: "border-sky/40 bg-gradient-to-br from-sky-2 to-sky text-white", icon: waIcon("h-7 w-7"), small: waIcon("h-6 w-6") },
    { key: "call" as const, list: calls, href: (l: Line) => `tel:${l.tel}`, ext: false, label: t("اتصل بنا", "Call us"), cls: "border-sky/50 bg-navy/95 text-sky-2", icon: <Icon name="phone" className="h-6 w-6" />, small: <Icon name="phone" className="h-5 w-5" /> },
  ];
  const ext = (on: boolean) => (on ? { target: "_blank", rel: "noopener" } : {});

  return (
    <div ref={ref} dir="ltr" className="contact-stack fixed bottom-5 left-5 z-50 flex flex-col gap-3">
      {groups.map((g) => g.list.length > 0 && (
        <div key={g.key} className="flex items-center gap-3">
          {g.list.length === 1 ? (
            <a href={g.href(g.list[0])} {...ext(g.ext)} aria-label={`${g.label} ${g.list[0].shown}`} className={`${btn} ${g.cls}`}>
              {g.key === "wa" && <span className="wa-ring" />}{g.icon}
            </a>
          ) : (
            <button type="button" onClick={() => setOpen(open === g.key ? null : g.key)} aria-expanded={open === g.key} aria-label={g.label} className={`${btn} ${g.cls}`}>
              {g.key === "wa" && open !== g.key && <span className="wa-ring" />}
              {open === g.key ? <Icon name="close" className="h-6 w-6" /> : g.icon}
            </button>
          )}
          {open === g.key && (
            <div className="flex gap-2.5">
              {g.list.map((l, i) => (
                <a key={l.dial} href={g.href(l)} {...ext(g.ext)} onClick={() => setOpen(null)} aria-label={`${g.label} — ${t(l.ar, l.en)} ${l.shown}`} title={`${t(l.ar, l.en)} ${l.shown}`}
                  className={`cf-opt ${g.cls}`} style={{ animationDelay: `${i * 70}ms` }}>
                  {g.small}
                  {l.flag && <span className={`fi fi-${l.flag} cf-flag`} />}
                </a>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
