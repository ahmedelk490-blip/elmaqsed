import { NextResponse } from "next/server";
import { readContacts, writeContacts, type ContactHit } from "@/lib/contacts";

const clip = (v: unknown, n: number) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, n);
let queue = Promise.resolve(); // one write at a time, so two taps at once never overwrite each other

/** Taps on call / WhatsApp links, sent by ContactTracker with navigator.sendBeacon. */
export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  try { if (origin && new URL(origin).host !== req.headers.get("host")) return new NextResponse(null, { status: 403 }); } catch { return new NextResponse(null, { status: 403 }); }
  const b = await req.json().catch(() => null);
  if (!b || (b.kind !== "call" && b.kind !== "whatsapp")) return new NextResponse(null, { status: 400 });
  const hit: ContactHit = {
    at: new Date().toISOString(), kind: b.kind, number: clip(b.number, 30).replace(/[^\d+]/g, ""),
    page: clip(b.page, 120) || "/", label: clip(b.label, 60), device: /Mobi|Android|iPhone|iPad/i.test(req.headers.get("user-agent") ?? "") ? "mobile" : "desktop",
  };
  queue = queue.then(async () => {
    const list = await readContacts();
    const minute = Date.now() - 60_000;
    if (list.filter((h) => Date.parse(h.at) > minute).length >= 120) return; // flood guard
    list.unshift(hit);
    await writeContacts(list.slice(0, 20000));
  }).catch(() => {});
  await queue;
  return new NextResponse(null, { status: 204 });
}
