import { promises as fs } from "fs";
import os from "os";
import path from "path";

export type Booking = {
  id: string; at: string; status: "new" | "contacted" | "done" | "cancelled"; service: "visa" | "hotel" | "esim" | "contact";
  summary: string; name: string; phone: string; email: string; rows: [string, string][];
};

// Beside the site content in production (outside the app directory, so redeploys keep it); a git-ignored folder locally.
const FILE = process.env.BOOKINGS_FILE || (process.env.NODE_ENV === "production" ? path.join(os.homedir(), "elmaqsed-data", "bookings.json") : path.join(process.cwd(), ".data", "bookings.json"));

export async function readBookings(): Promise<Booking[]> {
  try {
    const v = JSON.parse(await fs.readFile(FILE, "utf8"));
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export async function writeBookings(list: Booking[]) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  const tmp = `${FILE}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(list, null, 2), { encoding: "utf8", mode: 0o600 }); // customers' details: owner-only
  await fs.rename(tmp, FILE);
}
