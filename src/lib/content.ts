import { promises as fs } from "node:fs";
import path from "node:path";
import { cache } from "react";
import type { Content } from "./types";

const FILE = path.join(process.cwd(), "content", "site.json");

/** All site content lives in one JSON file edited from /admin. Cached per request. */
export const getContent = cache(async (): Promise<Content> => JSON.parse(await fs.readFile(FILE, "utf8")) as Content);

export async function saveContent(c: Content) {
  await fs.writeFile(FILE, JSON.stringify(c, null, 2), "utf8");
}
