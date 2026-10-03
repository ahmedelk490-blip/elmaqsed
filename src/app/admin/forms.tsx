"use client";
import { useActionState, type InputHTMLAttributes } from "react";
import { changeAccount, login, setupAdmin } from "@/lib/actions";
import type { AuthState } from "@/lib/auth";

const card = "a-card w-full max-w-sm p-8";
const btn = "a-btn mt-5 w-full justify-center disabled:opacity-60";

const Field = ({ label, ...rest }: { label: string } & InputHTMLAttributes<HTMLInputElement>) => (
  <label className="mt-4 block"><span className="a-label">{label}</span><input required dir="ltr" className="a-input" {...rest} /></label>
);
const Note = ({ state }: { state: AuthState }) => (
  <>
    {state?.error && <p role="alert" className="mt-3 text-sm text-red-600">{state.error}</p>}
    {state?.ok && <p role="status" className="mt-3 text-sm text-emerald-700">{state.ok}</p>}
  </>
);
const Head = ({ title, text }: { title: string; text: string }) => (
  <>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src="/brand/symbol.svg" alt="" className="mx-auto mb-4 h-14 w-14 rounded-full bg-navy p-3" />
    <h1 className="text-center text-xl font-bold">{title}</h1>
    <p className="mt-1 text-center text-sm text-slate-500">{text}</p>
  </>
);

export function LoginForm() {
  const [state, action, pending] = useActionState(login, null);
  return (
    <form action={action} className={card}>
      <Head title="لوحة تحكم المقصد" text="أدخل اسم المستخدم وكلمة المرور" />
      <Field label="اسم المستخدم" name="username" defaultValue={state?.user} autoComplete="username" autoCapitalize="none" autoFocus />
      <Field label="كلمة المرور" name="password" type="password" autoComplete="current-password" />
      <Note state={state} />
      <button disabled={pending} className={btn}>{pending ? "جارٍ الدخول…" : "دخول"}</button>
    </form>
  );
}

export function SetupForm() {
  const [state, action, pending] = useActionState(setupAdmin, null);
  return (
    <form action={action} className={card}>
      <Head title="إعداد حساب لوحة التحكم" text="مرة واحدة فقط: اختر اسم المستخدم وكلمة المرور" />
      <Field label="رمز الإعداد" name="code" defaultValue={state?.code} autoComplete="off" autoFocus />
      <Field label="اسم المستخدم" name="username" defaultValue={state?.user} autoComplete="username" autoCapitalize="none" />
      <Field label="كلمة المرور" name="password" type="password" autoComplete="new-password" minLength={8} />
      <Field label="تأكيد كلمة المرور" name="confirm" type="password" autoComplete="new-password" minLength={8} />
      <Note state={state} />
      <button disabled={pending} className={btn}>{pending ? "جارٍ الحفظ…" : "إنشاء الحساب والدخول"}</button>
    </form>
  );
}

export function AccountForm({ user }: { user: string }) {
  const [state, action, pending] = useActionState(changeAccount, null);
  return (
    <form action={action} className="a-card mt-6 p-6">
      <Field label="كلمة المرور الحالية" name="current" type="password" autoComplete="current-password" />
      <Field label="اسم المستخدم" name="username" defaultValue={state?.user ?? user} autoComplete="username" autoCapitalize="none" />
      <Field label="كلمة المرور الجديدة" name="password" type="password" autoComplete="new-password" minLength={8} />
      <Field label="تأكيد كلمة المرور الجديدة" name="confirm" type="password" autoComplete="new-password" minLength={8} />
      <Note state={state} />
      <button disabled={pending} className="a-btn mt-5 disabled:opacity-60">{pending ? "جارٍ الحفظ…" : "حفظ"}</button>
    </form>
  );
}
