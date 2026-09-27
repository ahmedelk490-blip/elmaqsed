import { cookies } from "next/headers";
import { createHash } from "node:crypto";

export const COOKIE = "elmaqsed_admin";
// No fallback on purpose: without ADMIN_PASSWORD (hosting env var / .env.local) the admin panel stays locked.
export const PASSWORD = process.env.ADMIN_PASSWORD || "";
export const token = () => createHash("sha256").update(`elmaqsed:${PASSWORD}`).digest("hex");

export async function isAuthed() {
  if (!PASSWORD) return false;
  return (await cookies()).get(COOKIE)?.value === token();
}
