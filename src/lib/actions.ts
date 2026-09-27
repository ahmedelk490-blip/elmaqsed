"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { COOKIE, PASSWORD, isAuthed, token } from "./auth";
import { getContent, saveContent } from "./content";
import { collections, fromInput, setPath, singles } from "./admin";
import type { Content } from "./types";

type Lists = Record<string, Record<string, unknown>[]>;

export async function login(_prev: { error?: string } | null, fd: FormData) {
  if (!PASSWORD) return { error: "لوحة التحكم غير مفعّلة: أضف ADMIN_PASSWORD في متغيرات البيئة بالاستضافة" };
  if (String(fd.get("password")) !== PASSWORD) return { error: "كلمة المرور غير صحيحة" };
  (await cookies()).set(COOKIE, token(), { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
  redirect("/admin");
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
