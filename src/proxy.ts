import { NextResponse, type NextRequest } from "next/server";

/** Diagnostic: reports the host the app receives behind Hostinger's CDN, so the temporary-domain redirect can be added without a loop. */
export function proxy(request: NextRequest) {
  const res = NextResponse.next();
  res.headers.set("x-seen-host", request.headers.get("host") ?? "-");
  res.headers.set("x-seen-fwd-host", request.headers.get("x-forwarded-host") ?? "-");
  res.headers.set("x-seen-url-host", request.nextUrl.host);
  return res;
}

export const config = { matcher: ["/robots.txt"] };
