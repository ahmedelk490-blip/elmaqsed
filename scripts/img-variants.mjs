// Builds fixed-width WebP variants of every photo in public/img into public/img/v,
// plus src/lib/img-manifest.json. The custom image loader serves these static files,
// so the host never resizes images at runtime (Hostinger returned 503s under load).
// Re-run after adding or replacing photos:  node scripts/img-variants.mjs
import sharp from "sharp";
import { readdir, mkdir, writeFile, rm } from "node:fs/promises";
import path from "node:path";

const ROOT = "public/img";
const OUT = path.join(ROOT, "v");
const WIDTHS = [256, 384, 640, 1080, 1920]; // must match images.imageSizes + deviceSizes in next.config.ts

const files = [];
async function walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (path.normalize(p) !== path.normalize(OUT)) await walk(p); }
    else if (/\.(jpe?g|png)$/i.test(e.name)) files.push(p);
  }
}
await walk(ROOT);
await rm(OUT, { recursive: true, force: true });
const manifest = [];
for (const f of files) {
  const rel = path.relative(ROOT, f).replace(/\\/g, "/");
  const { width = 1920 } = await sharp(f).metadata();
  for (const w of WIDTHS) {
    const out = path.join(OUT, rel.replace(/\.(jpe?g|png)$/i, `-${w}.webp`));
    await mkdir(path.dirname(out), { recursive: true });
    await sharp(f).resize({ width: Math.min(w, width), withoutEnlargement: true }).webp({ quality: 72 }).toFile(out);
  }
  manifest.push(`/img/${rel}`);
}
await writeFile("src/lib/img-manifest.json", JSON.stringify(manifest.sort()) + "\n");
console.log(`${files.length} photos x ${WIDTHS.length} widths`);
