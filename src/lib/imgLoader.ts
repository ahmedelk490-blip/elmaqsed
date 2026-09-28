"use client";
import manifest from "./img-manifest.json";

const known = new Set<string>(manifest);
const WIDTHS = [256, 384, 640, 1080, 1920];

/** Serves pre-built WebP variants from /img/v (scripts/img-variants.mjs), so the server never resizes images. */
export default function imgLoader({ src, width }: { src: string; width: number; quality?: number }) {
  if (!known.has(src)) return src;
  const w = WIDTHS.find((x) => x >= width) ?? WIDTHS[WIDTHS.length - 1];
  return `${src.replace(/^\/img\//, "/img/v/").replace(/\.(jpe?g|png)$/i, "")}-${w}.webp`;
}
