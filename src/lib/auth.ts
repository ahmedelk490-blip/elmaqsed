import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

export const COOKIE = "elmaqsed_admin";
export type AuthState = { error?: string; ok?: string; user?: string; code?: string } | null;
export type Creds = { user: string; salt: string; hash: string };

// Dashboard users. The first one is created at /admin/setup (needs the setup code); that user can add more from the account
// page. Only salted scrypt hashes are stored: beside the site content in production (outside the app directory, so redeploys
// keep it), in the git-ignored .data folder locally. Older single-account files ({user, salt, hash}) are still read.
const FILE = process.env.NODE_ENV === "production" ? path.join(os.homedir(), "elmaqsed-data", "admin.json") : path.join(process.cwd(), ".data", "admin.json");
// SHA-256 of the setup code. The code itself stays with the site owner and never goes in the repo.
const SETUP_HASH = process.env.ADMIN_SETUP_HASH || "eed9f9ce02b0eed4ef8fd9e37d19a7e9646b62416466b1fb148b93fbe6f205ac";

const derive = promisify(scrypt) as (pass: string, salt: string, len: number) => Promise<Buffer>;
const same = (a: Buffer, b: Buffer) => a.length === b.length && timingSafeEqual(a, b);

export const normUser = (v: unknown) => String(v ?? "").trim().toLowerCase();

export async function getUsers(): Promise<Creds[]> {
  try {
    const v = JSON.parse(await fs.readFile(FILE, "utf8"));
    const list: Creds[] = Array.isArray(v?.users) ? v.users : v?.user ? [v] : [];
    return list.filter((c) => c?.user && c?.salt && c?.hash);
  } catch {
    return [];
  }
}

/** The first user, or null while the dashboard has not been set up. */
export const getCreds = async (): Promise<Creds | null> => (await getUsers())[0] ?? null;
export const findUser = async (user: string) => (await getUsers()).find((c) => c.user === user) ?? null;

export async function makeCreds(user: string, pass: string): Promise<Creds> {
  const salt = randomBytes(16).toString("hex");
  return { user, salt, hash: (await derive(pass, salt, 32)).toString("hex") };
}

/** first=true is the initial setup: it must never overwrite existing users, so the write fails if the file is there. */
export async function writeUsers(users: Creds[], first = false): Promise<boolean> {
  try {
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    const data = JSON.stringify({ users });
    if (first) await fs.writeFile(FILE, data, { flag: "wx", mode: 0o600 });
    else {
      await fs.writeFile(`${FILE}.tmp`, data, { mode: 0o600 });
      await fs.rename(`${FILE}.tmp`, FILE);
    }
    return true;
  } catch {
    return false;
  }
}

export const passOk = async (c: Creds, pass: string) => same(await derive(pass, c.salt, 32), Buffer.from(c.hash, "hex"));
export const setupCodeOk = (code: string) => same(createHash("sha256").update(code.replace(/[^a-z0-9]/gi, "").toUpperCase()).digest(), Buffer.from(SETUP_HASH, "hex"));

export function credsProblem(user: string, pass: string, confirm: string) {
  if (!/^[a-z0-9._@+-]{3,64}$/.test(user)) return "اسم المستخدم أو البريد: من 3 إلى 64 حرفاً إنجليزياً أو رقماً، بدون مسافات";
  if (pass.length < 8 || pass.length > 200) return "كلمة المرور: 8 أحرف على الأقل";
  if (pass !== confirm) return "كلمتا المرور غير متطابقتين";
  return null;
}

// The session cookie names the user and is signed with that user's hash, so a new password signs their other devices out,
// and removing a user ends their sessions at once.
const sign = (c: Creds) => createHmac("sha256", c.hash).update(`elmaqsed-admin:${c.user}`).digest("hex");
export const sessionToken = (c: Creds) => `${encodeURIComponent(c.user)}|${sign(c)}`;

export async function currentUser(): Promise<Creds | null> {
  const got = (await cookies()).get(COOKIE)?.value ?? "";
  const cut = got.lastIndexOf("|");
  if (cut < 1) return null;
  let name = "";
  try { name = decodeURIComponent(got.slice(0, cut)); } catch { return null; }
  const c = await findUser(name);
  return c && same(Buffer.from(got.slice(cut + 1)), Buffer.from(sign(c))) ? c : null;
}

export async function isAuthed() {
  return !!(await currentUser());
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
