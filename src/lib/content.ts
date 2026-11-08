import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { cache } from "react";
import type { Content } from "./types";
import { getLang } from "./i18n";

// Seed content shipped with the repo.
const REPO_FILE = path.join(process.cwd(), "content", "site.json");
// Live content edited from /admin. In production it lives OUTSIDE the app folder so redeploys (git push) never wipe admin edits.
const DATA_FILE = process.env.CONTENT_FILE || (process.env.NODE_ENV === "production" ? path.join(os.homedir(), "elmaqsed-data", "site.json") : REPO_FILE);

const read = async (file: string) => JSON.parse(await fs.readFile(file, "utf8")) as Content;

export const getContent = cache(async (): Promise<Content> => {
  const seed = await read(REPO_FILE);
  if (DATA_FILE === REPO_FILE) return seed;
  try {
    // sections added to the site after the last save from /admin come from the seed
    return { ...seed, ...(await read(DATA_FILE)) };
  } catch {
    return seed;
  }
});

export async function saveContent(c: Content) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(c, null, 2), "utf8");
}

// English texts for the site, same shape as site.json. List items carry `_ar`: the Arabic title they translate,
// so an item added or renamed from /admin simply stays in Arabic until it is translated here.
const EN_FILE = path.join(process.cwd(), "content", "site.en.json");
// numbers, links, images and codes always come from the live (dashboard) content
const KEEP = new Set(["url", "whatsapp", "whatsapp2", "phone", "phone2", "email", "cr", "license", "social", "img", "code", "slug", "href", "price", "group", "kind", "value", "suffix", "decimals", "icon", "n"]);
const ID = ["slug", "href", "title", "q", "label", "name"];
type Rec = Record<string, unknown>;
const isRec = (v: unknown): v is Rec => !!v && typeof v === "object" && !Array.isArray(v);

function overlay(base: unknown, en: unknown): unknown {
  if (Array.isArray(base)) {
    if (!Array.isArray(en)) return base;
    if (base.every((x) => typeof x === "string")) return en.length ? en : base;
    return base.map((item) => {
      if (!isRec(item)) return item;
      const k = ID.find((f) => typeof item[f] === "string");
      const match = k && (en as unknown[]).find((e) => isRec(e) && (e._ar === item[k] || ((k === "slug" || k === "href") && e[k] === item[k])));
      return match ? overlay(item, match) : item;
    });
  }
  if (!isRec(base) || !isRec(en)) return base;
  const out: Rec = { ...base };
  for (const [key, v] of Object.entries(base)) {
    if (KEEP.has(key) || !(key in en)) continue;
    const e = en[key];
    out[key] = typeof v === "string" ? (typeof e === "string" && e ? e : v) : overlay(v, e);
  }
  return out;
}

/** Content for the public site in the visitor's language. The dashboard always edits the Arabic original (getContent). */
export const getLocalContent = cache(async (): Promise<Content> => {
  const c = await getContent();
  if ((await getLang()) !== "en") return c;
  try {
    return overlay(c, JSON.parse(await fs.readFile(EN_FILE, "utf8"))) as Content;
  } catch {
    return c;
  }
});
