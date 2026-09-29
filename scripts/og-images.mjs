// Builds the 1200x630 share images (public/og), a raster logo for structured data and the Apple touch icon.
// Re-run after adding a destination or changing its photo:  node scripts/og-images.mjs
import sharp from "sharp";
import { readFile, mkdir } from "node:fs/promises";

const NAVY = "#0b1f39";
const esc = (s) => s.replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]);
const content = JSON.parse(await readFile("content/site.json", "utf8"));
const logo = await readFile("public/brand/logo.svg");
const symbol = await readFile("public/brand/symbol.svg");
const png = (svg, width) => sharp(svg, { density: 300 }).resize({ width }).png().toBuffer();
await mkdir("public/og", { recursive: true });

// default share image: navy, soft blue glow, the logo
const bg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><defs><radialGradient id="g" cx="50%" cy="42%" r="62%"><stop offset="0" stop-color="#2e94d2" stop-opacity=".38"/><stop offset="1" stop-color="${NAVY}" stop-opacity="0"/></radialGradient></defs><rect width="1200" height="630" fill="${NAVY}"/><rect width="1200" height="630" fill="url(#g)"/><text x="600" y="530" text-anchor="middle" font-family="Georgia, serif" font-size="26" letter-spacing="10" fill="#63b6ea">VISA CONSULTING · RIYADH</text></svg>`);
await sharp(bg).composite([{ input: await png(logo, 720), gravity: "center" }]).jpeg({ quality: 84, mozjpeg: true }).toFile("public/og/default.jpg");

// one per destination: its landmark, a navy fade, the English name and the logo
const small = await png(logo, 280);
for (const c of content.countries) {
  const shade = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${NAVY}" stop-opacity=".35"/><stop offset=".5" stop-color="${NAVY}" stop-opacity=".35"/><stop offset="1" stop-color="${NAVY}" stop-opacity=".96"/></linearGradient></defs><rect width="1200" height="630" fill="url(#g)"/><text x="70" y="520" font-family="Georgia, serif" font-size="72" font-weight="bold" letter-spacing="4" fill="#ffffff">${esc(c.en.toUpperCase())}</text><text x="74" y="574" font-family="Georgia, serif" font-size="24" letter-spacing="8" fill="#63b6ea">VISA CONSULTING · ELMAQSED</text></svg>`);
  await sharp(`public${c.img}`).resize(1200, 630, { fit: "cover" }).composite([{ input: shade }, { input: small, top: 56, left: 1200 - 280 - 64 }]).jpeg({ quality: 82, mozjpeg: true }).toFile(`public/og/${c.slug}.jpg`);
}

// raster logo for structured data, and the Apple touch icon
await sharp({ create: { width: 512, height: 512, channels: 4, background: NAVY } }).composite([{ input: await png(logo, 440), gravity: "center" }]).png().toFile("public/brand/logo-512.png");
await sharp({ create: { width: 180, height: 180, channels: 4, background: NAVY } }).composite([{ input: await png(symbol, 118), gravity: "center" }]).png().toFile("src/app/apple-icon.png");
console.log(`share images: default + ${content.countries.length} destinations; logo-512; apple-icon`);
