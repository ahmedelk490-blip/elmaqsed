"use client";
import { useActionState } from "react";
import { login } from "@/lib/actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, null);
  return (
    <div className="grid min-h-screen place-items-center p-6">
      <form action={action} className="a-card w-full max-w-sm p-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/symbol.svg" alt="" className="mx-auto mb-4 h-14 w-14 rounded-full bg-navy p-3" />
        <h1 className="text-center text-xl font-bold">لوحة تحكم المقصد</h1>
        <p className="mt-1 text-center text-sm text-slate-500">أدخل كلمة المرور للمتابعة</p>
        <label className="mt-6 block">
          <span className="a-label">كلمة المرور</span>
          <input name="password" type="password" required autoFocus className="a-input" dir="ltr" />
        </label>
        {state?.error && <p className="mt-3 text-sm text-red-600">{state.error}</p>}
        <button disabled={pending} className="a-btn mt-5 w-full justify-center disabled:opacity-60">{pending ? "جارٍ الدخول…" : "دخول"}</button>
      </form>
    </div>
  );
}
