import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

export const COOKIE = "elmaqsed_admin";
export type AuthState = { error?: string; ok?: string; user?: string; code?: string } | null;
type Creds = { user: string; salt: string; hash: string };

// One admin account, created once at /admin/setup. Only a salted scrypt hash is stored: beside the site content in
// production (outside the app directory, so redeploys keep it), in the git-ignored .data folder locally.
const FILE = process.env.NODE_ENV === "production" ? path.join(os.homedir(), "elmaqsed-data", "admin.json") : path.join(process.cwd(), ".data", "admin.json");
// SHA-256 of the setup code. The code itself stays with the site owner and never goes in the repo.
const SETUP_HASH = process.env.ADMIN_SETUP_HASH || "eed9f9ce02b0eed4ef8fd9e37d19a7e9646b62416466b1fb148b93fbe6f205ac";

const derive = promisify(scrypt) as (pass: string, salt: string, len: number) => Promise<Buffer>;
const same = (a: Buffer, b: Buffer) => a.length === b.length && timingSafeEqual(a, b);

export const normUser = (v: unknown) => String(v ?? "").trim().toLowerCase();

export async function getCreds(): Promise<Creds | null> {
  try {
    const c = JSON.parse(await fs.readFile(FILE, "utf8"));
    return c?.user && c?.salt && c?.hash ? c : null;
  } catch {
    return null;
  }
}

/** replace=false is the first setup: it must never overwrite an existing account, so the write fails if the file is there. */
export async function saveCreds(user: string, pass: string, replace: boolean): Promise<Creds | null> {
  const salt = randomBytes(16).toString("hex");
  const creds: Creds = { user, salt, hash: (await derive(pass, salt, 32)).toString("hex") };
  try {
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    if (replace) {
      await fs.writeFile(`${FILE}.tmp`, JSON.stringify(creds), { mode: 0o600 });
      await fs.rename(`${FILE}.tmp`, FILE);
    } else await fs.writeFile(FILE, JSON.stringify(creds), { flag: "wx", mode: 0o600 });
    return creds;
  } catch {
    return null;
  }
}

export const passOk = async (c: Creds, pass: string) => same(await derive(pass, c.salt, 32), Buffer.from(c.hash, "hex"));
export const setupCodeOk = (code: string) => same(createHash("sha256").update(code.replace(/[^a-z0-9]/gi, "").toUpperCase()).digest(), Buffer.from(SETUP_HASH, "hex"));

export function credsProblem(user: string, pass: string, confirm: string) {
  if (!/^[a-z0-9._-]{3,32}$/.test(user)) return "اسم المستخدم: من 3 إلى 32 حرفاً إنجليزياً أو رقماً، بدون مسافات";
  if (pass.length < 8 || pass.length > 200) return "كلمة المرور: 8 أحرف على الأقل";
  if (pass !== confirm) return "كلمتا المرور غير متطابقتين";
  return null;
}

// The session cookie is derived from the stored hash, so changing the password signs every other device out.
export const sessionToken = (c: Creds) => createHmac("sha256", c.hash).update(`elmaqsed-admin:${c.user}`).digest("hex");

export async function isAuthed() {
  const got = (await cookies()).get(COOKIE)?.value;
  const c = got ? await getCreds() : null;
  return !!c && same(Buffer.from(got!), Buffer.from(sessionToken(c)));
}

/** Every admin page calls this itself: layouts are skipped on client-side navigations, so the layout check alone is not enough. */
export async function requireAdmin() {
  if (!(await isAuthed())) redirect("/admin/login");
}

// Wrong-password limiter: 5 misses per address and 40 in total per quarter of an hour (in memory, cleared on restart).
const misses = new Map<string, { n: number; until: number }>();
const LIMIT = { ip: 5, all: 40, ms: 15 * 60_000 };

export function blocked(ip: string) {
  const now = Date.now(), a = misses.get(ip), b = misses.get("*");
  return (!!a && a.until > now && a.n >= LIMIT.ip) || (!!b && b.until > now && b.n >= LIMIT.all);
}

export function strike(ip: string) {
  const now = Date.now();
  if (misses.size > 500) for (const [k, m] of misses) if (m.until <= now) misses.delete(k);
  for (const k of [ip, "*"]) {
    const m = misses.get(k);
    misses.set(k, { n: m && m.until > now ? m.n + 1 : 1, until: now + LIMIT.ms });
  }
}

export const pardon = (ip: string) => void misses.delete(ip);
