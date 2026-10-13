"use client";
import { useEffect } from "react";

/** Counts every tap on a call (tel:) or WhatsApp (wa.me) link anywhere on the site, for the dashboard. */
export default function ContactTracker() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a) return;
      const href = a.getAttribute("href") ?? "";
      const kind = href.startsWith("tel:") ? "call" : /wa\.me\//.test(href) ? "whatsapp" : null;
      if (!kind) return;
      const number = kind === "call" ? href.slice(4) : href.split("wa.me/")[1]?.split("?")[0] ?? "";
      const label = (a.getAttribute("aria-label") || a.textContent || "").trim().slice(0, 60);
      const body = JSON.stringify({ kind, number, page: location.pathname, label });
      if (!navigator.sendBeacon?.("/api/track", new Blob([body], { type: "application/json" })))
        void fetch("/api/track", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {});
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
  return null;
}
