import { NextResponse, type NextRequest } from "next/server";

const CANONICAL = "elmaqsed.com";
const WIDTHS = [256, 384, 640, 1080, 1920];

/**
 * One address for the site: the temporary Hostinger domain and www.elmaqsed.com redirect
 * permanently to https://elmaqsed.com (same path and query). Behind Hostinger's CDN the app
 * receives the visitor's host in both Host and X-Forwarded-Host, so elmaqsed.com itself never matches.
 *
 * Old /_next/image URLs (from pages cached before images became static files) redirect to the static variant.
 */
export function proxy(request: NextRequest) {
  const host = (request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "").split(",")[0].trim().split(":")[0].toLowerCase();
  const { pathname, search, searchParams } = request.nextUrl;
  if (host.endsWith(".hostingersite.com") || host === `www.${CANONICAL}`) {
    return NextResponse.redirect(`https://${CANONICAL}${pathname}${search}`, 301);
  }
  if (pathname === "/_next/image") {
    const src = searchParams.get("url") ?? "";
    if (!/^\/(?!\/)[\w\-./]+$/.test(src)) return new NextResponse(null, { status: 404 });
    const w = Number(searchParams.get("w")) || 640;
    const size = WIDTHS.find((x) => x >= w) ?? WIDTHS[WIDTHS.length - 1];
    const to = /^\/img\/(?!v\/).+\.(jpe?g|png)$/i.test(src) ? src.replace(/^\/img\//, "/img/v/").replace(/\.(jpe?g|png)$/i, `-${size}.webp`) : src;
    return NextResponse.redirect(`https://${CANONICAL}${to}`, 308);
  }
  return NextResponse.next();
}

// pages and routes (static files and Next assets skip the proxy), plus the retired image endpoint
export const config = { matcher: ["/((?!_next/static|_next/image|.*\\..*).*)", "/_next/image"] };
