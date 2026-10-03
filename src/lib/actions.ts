"use server";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { COOKIE, blocked, credsProblem, getCreds, isAuthed, normUser, pardon, passOk, saveCreds, sessionToken, setupCodeOk, strike, type AuthState } from "./auth";
import { getContent, saveContent } from "./content";
import { collections, fromInput, setPath, singles } from "./admin";
import type { Content } from "./types";
import { readBookings, writeBookings, type Booking } from "./bookings";

type Lists = Record<string, Record<string, unknown>[]>;

const SESSION = { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30 };
const TOO_MANY = "محاولات كثيرة. حاول مرة أخرى بعد ربع ساعة.";
const clientIp = async () => (await headers()).get("x-forwarded-for")?.split(",")[0].trim() || "local";
const pause = () => new Promise((r) => setTimeout(r, 700));

export async function login(_prev: AuthState, fd: FormData): Promise<AuthState> {
  const ip = await clientIp(), user = normUser(fd.get("username"));
  if (blocked(ip)) return { error: TOO_MANY, user };
  const creds = await getCreds();
  if (!creds) redirect("/admin/setup");
  const pass = await passOk(creds, String(fd.get("password") ?? ""));
  if (!pass || user !== creds.user) {
    strike(ip);
    await pause();
    return { error: "اسم المستخدم أو كلمة المرور غير صحيحة", user };
  }
  pardon(ip);
  (await cookies()).set(COOKIE, sessionToken(creds), SESSION);
  redirect("/admin");
}

/** First-time setup: needs the owner's setup code and only works while no account exists. */
export async function setupAdmin(_prev: AuthState, fd: FormData): Promise<AuthState> {
  const ip = await clientIp(), user = normUser(fd.get("username")), code = String(fd.get("code") ?? "").trim().slice(0, 80);
  if (blocked(ip)) return { error: TOO_MANY, user, code };
  if (await getCreds()) redirect("/admin/login");
  if (!setupCodeOk(code)) {
    strike(ip);
    await pause();
    return { error: "رمز الإعداد غير صحيح", user, code };
  }
  const pass = String(fd.get("password") ?? "");
  const problem = credsProblem(user, pass, String(fd.get("confirm") ?? ""));
  if (problem) return { error: problem, user, code };
  const creds = await saveCreds(user, pass, false);
  if (!creds) return { error: "تعذّر إنشاء الحساب. حدّث الصفحة وحاول مرة أخرى.", user, code };
  (await cookies()).set(COOKIE, sessionToken(creds), SESSION);
  redirect("/admin");
}

export async function changeAccount(_prev: AuthState, fd: FormData): Promise<AuthState> {
  await guard();
  const ip = await clientIp(), user = normUser(fd.get("username")), creds = await getCreds();
  if (!creds) redirect("/admin/login");
  if (blocked(ip)) return { error: TOO_MANY, user };
  if (!(await passOk(creds, String(fd.get("current") ?? "")))) {
    strike(ip);
    await pause();
    return { error: "كلمة المرور الحالية غير صحيحة", user };
  }
  const pass = String(fd.get("password") ?? "");
  const problem = credsProblem(user, pass, String(fd.get("confirm") ?? ""));
  if (problem) return { error: problem, user };
  const next = await saveCreds(user, pass, true);
  if (!next) return { error: "تعذّر الحفظ. حاول مرة أخرى.", user };
  (await cookies()).set(COOKIE, sessionToken(next), SESSION);
  return { ok: "تم تحديث بيانات الدخول", user };
}

export async function logout() {
  (await cookies()).delete(COOKIE);
  redirect("/admin/login");
}

async function guard() {
  if (!(await isAuthed())) throw new Error("غير مصرح");
}
async function persist(c: Content) {
  await saveContent(c);
  revalidatePath("/", "layout");
}

export async function saveSingle(key: string, fd: FormData) {
  await guard();
  const def = singles[key];
  if (!def) throw new Error("bad key");
  const c = await getContent();
  const target = { ...((c as unknown as Record<string, Record<string, unknown>>)[key] ?? {}) };
  for (const f of def.fields) setPath(target, f.name, fromInput(f, fd.get(f.name)));
  (c as unknown as Record<string, unknown>)[key] = target;
  await persist(c);
  redirect(`/admin/single/${key}?saved=1`);
}

export async function saveItem(key: string, index: number, fd: FormData) {
  await guard();
  const def = collections[key];
  if (!def) throw new Error("bad key");
  const c = await getContent();
  const list = (c as unknown as Lists)[key];
  const item: Record<string, unknown> = index >= 0 ? { ...list[index] } : {};
  for (const f of def.fields) item[f.name] = fromInput(f, fd.get(f.name));
  if (index >= 0) list[index] = item;
  else list.push(item);
  await persist(c);
  redirect(`/admin/${key}?saved=1`);
}

export async function deleteItem(key: string, index: number) {
  await guard();
  const c = await getContent();
  (c as unknown as Lists)[key].splice(index, 1);
  await persist(c);
  revalidatePath(`/admin/${key}`);
}

export async function moveItem(key: string, index: number, dir: number) {
  await guard();
  const c = await getContent();
  const list = (c as unknown as Lists)[key];
  const j = index + dir;
  if (j < 0 || j >= list.length) return;
  [list[index], list[j]] = [list[j], list[index]];
  await persist(c);
  revalidatePath(`/admin/${key}`);
}

const clip = (v: unknown, n: number) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, n);

/** Public: stores a booking or enquiry so it shows in the dashboard. Input is clipped and a burst limit stops floods. */
export async function createBooking(input: { service: string; name: string; phone: string; email: string; summary: string; rows: [string, string][] }) {
  const phone = clip(input?.phone, 30);
  if (phone.replace(/\D/g, "").length < 7) return { ok: false };
  const list = await readBookings();
  const recent = Date.now() - 10 * 60 * 1000;
  if (list.filter((b) => Date.parse(b.at) > recent).length >= 40) return { ok: false };
  const service = input.service === "hotel" ? "hotel" : input.service === "contact" ? "contact" : "visa";
  const rows = (Array.isArray(input.rows) ? input.rows : []).filter(Array.isArray).slice(0, 30).map(([k, v]) => [clip(k, 60), clip(v, 400)] as [string, string]);
  list.unshift({ id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`, at: new Date().toISOString(), status: "new", service, summary: clip(input.summary, 120), name: clip(input.name, 120), phone, email: clip(input.email, 160), rows });
  await writeBookings(list.slice(0, 3000));
  return { ok: true };
}

export async function setBookingStatus(id: string, fd: FormData) {
  await guard();
  const status = String(fd.get("status"));
  if (!["new", "contacted", "done", "cancelled"].includes(status)) return;
  const list = await readBookings();
  const b = list.find((x) => x.id === id);
  if (b) {
    b.status = status as Booking["status"];
    await writeBookings(list);
  }
  revalidatePath("/admin/bookings");
}

export async function deleteBooking(id: string) {
  await guard();
  await writeBookings((await readBookings()).filter((x) => x.id !== id));
  revalidatePath("/admin/bookings");
}
