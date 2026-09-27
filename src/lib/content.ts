import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { cache } from "react";
import type { Content } from "./types";

// Seed content shipped with the repo.
const REPO_FILE = path.join(process.cwd(), "content", "site.json");
// Live content edited from /admin. In production it lives OUTSIDE the app folder so redeploys (git push) never wipe admin edits.
const DATA_FILE = process.env.CONTENT_FILE || (process.env.NODE_ENV === "production" ? path.join(os.homedir(), "elmaqsed-data", "site.json") : REPO_FILE);

export const getContent = cache(async (): Promise<Content> => {
  try {
    return JSON.parse(await fs.readFile(DATA_FILE, "utf8")) as Content;
  } catch {
    return JSON.parse(await fs.readFile(REPO_FILE, "utf8")) as Content;
  }
});

export async function saveContent(c: Content) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(c, null, 2), "utf8");
}
