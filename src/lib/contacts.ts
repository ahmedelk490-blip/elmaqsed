import { promises as fs } from "fs";
import os from "os";
import path from "path";

/** One tap on a call or WhatsApp button. We cannot see the call itself, only that a visitor started it. */
export type ContactHit = { at: string; kind: "call" | "whatsapp"; number: string; page: string; label: string; device: "mobile" | "desktop" };

// Beside the bookings in production (outside the app directory, so redeploys keep it); a git-ignored folder locally.
const FILE = process.env.CONTACTS_FILE || (process.env.NODE_ENV === "production" ? path.join(os.homedir(), "elmaqsed-data", "contacts.json") : path.join(process.cwd(), ".data", "contacts.json"));

export async function readContacts(): Promise<ContactHit[]> {
  try {
    const v = JSON.parse(await fs.readFile(FILE, "utf8"));
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export async function writeContacts(list: ContactHit[]) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  const tmp = `${FILE}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(list), { encoding: "utf8", mode: 0o600 });
  await fs.rename(tmp, FILE);
}
