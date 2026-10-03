import { getCreds, requireAdmin } from "@/lib/auth";
import { AccountForm } from "@/app/admin/forms";

export default async function AccountPage() {
  await requireAdmin();
  const user = (await getCreds())?.user ?? "";
  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold">حساب الدخول</h1>
      <p className="mt-1 text-sm text-slate-500">غيّر اسم المستخدم أو كلمة المرور. بعد الحفظ تخرج الأجهزة الأخرى من اللوحة تلقائياً.</p>
      <AccountForm user={user} />
    </div>
  );
}
