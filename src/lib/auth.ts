import { cookies } from "next/headers";
import { createHash } from "node:crypto";

export const COOKIE = "elmaqsed_admin";
export const PASSWORD = process.env.ADMIN_PASSWORD || "elmaqsed2026";
export const token = () => createHash("sha256").update(`elmaqsed:${PASSWORD}`).digest("hex");

export async function isAuthed() {
  return (await cookies()).get(COOKIE)?.value === token();
}
