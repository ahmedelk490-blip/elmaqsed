import { NextResponse } from "next/server";
import { createBooking } from "@/lib/actions";

const foreign = (req: Request) => {
  const origin = req.headers.get("origin");
  try {
    return !!origin && new URL(origin).host !== req.headers.get("host");
  } catch {
    return true;
  }
};

/** The site's own forms post here (see lib/submit.ts). */
export async function POST(req: Request) {
  if (foreign(req)) return NextResponse.json({ ok: false }, { status: 403 });
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ ok: false }, { status: 400 });
  const res = await createBooking(body);
  return NextResponse.json(res, { status: res.ok ? 200 : 422 });
}
