import { NextResponse, type NextRequest } from "next/server";

const CANONICAL = "elmaqsed.com";

/**
 * One address for the site: the temporary Hostinger domain and www.elmaqsed.com redirect
 * permanently to https://elmaqsed.com (same path and query). Behind Hostinger's CDN the app
 * receives the visitor's host in both Host and X-Forwarded-Host, so elmaqsed.com itself never matches.
 */
export function proxy(request: NextRequest) {
  const host = (request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "").split(",")[0].trim().split(":")[0].toLowerCase();
  if (host.endsWith(".hostingersite.com") || host === `www.${CANONICAL}`) {
    const { pathname, search } = request.nextUrl;
    return NextResponse.redirect(`https://${CANONICAL}${pathname}${search}`, 301);
  }
  return NextResponse.next();
}

// pages and routes only; static files (anything with an extension) and Next assets skip the proxy
export const config = { matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"] };
