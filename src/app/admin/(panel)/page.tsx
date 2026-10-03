import Link from "next/link";
import { getContent } from "@/lib/content";
import { collections } from "@/lib/admin";
import { readBookings } from "@/lib/bookings";
import type { Content } from "@/lib/types";
import { requireAdmin } from "@/lib/auth";

export default async function Dashboard() {
  await requireAdmin();
  const c = await getContent();
  const bookings = await readBookings();
  const fresh = bookings.filter((b) => b.status === "new").length;
  return (
    <div>
      <h1 className="text-2xl font-bold">لوحة التحكم</h1>
      <p className="mt-1 text-sm text-slate-500">من هنا تدير كل محتوى الموقع. أي حفظ يُنشر على الموقع مباشرة.</p>
      <Link href="/admin/bookings" className="a-card mt-8 flex items-center justify-between gap-4 p-6 transition-shadow hover:shadow-md">
        <div><h2 className="font-bold">الحجوزات والطلبات</h2><p className="mt-1 text-sm text-slate-500">كل من حجز أو أرسل طلباً من الموقع، مع بيانات التواصل.</p></div>
        <p className="shrink-0"><span className="font-serif text-4xl font-semibold">{bookings.length}</span>{fresh > 0 && <span className="mr-2 rounded-full bg-[#e0f2fe] px-2.5 py-1 text-xs font-bold text-[#075985]">{fresh} جديد</span>}</p>
      </Link>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(collections).map(([k, d]) => (
          <Link key={k} href={`/admin/${k}`} className="a-card p-5 transition-shadow hover:shadow-md">
            <p className="text-sm text-slate-500">{d.label}</p>
            <p className="mt-2 font-serif text-4xl font-semibold">{(c[k as keyof Content] as unknown[]).length}</p>
          </Link>
        ))}
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Link href="/admin/single/site" className="a-card p-6 transition-shadow hover:shadow-md">
          <h2 className="font-bold">إعدادات الموقع</h2>
          <p className="mt-1 text-sm text-slate-500">الاسم، أرقام التواصل، السجل التجاري، نص الفوتر وإخلاء المسؤولية.</p>
        </Link>
        <Link href="/admin/single/about" className="a-card p-6 transition-shadow hover:shadow-md">
          <h2 className="font-bold">صفحة من نحن</h2>
          <p className="mt-1 text-sm text-slate-500">القصة، المقدمة، والقيم.</p>
        </Link>
      </div>
      <div className="a-card mt-6 p-6">
        <h2 className="font-bold">قبل الإطلاق</h2>
        <ul className="mt-3 list-disc space-y-1 pr-5 text-sm text-slate-600">
          <li>حدّث رقم الواتساب والهاتف والبريد من إعدادات الموقع.</li>
          <li>استبدل الإحصائيات وشهادات العملاء ببيانات حقيقية.</li>
          <li>راجع الوجهات: أضف ما تخدمه فعلاً واحذف الباقي، وحدّث المدد والمستندات.</li>
          <li>غيّر اسم المستخدم أو كلمة المرور من صفحة <Link href="/admin/account" className="underline">حساب الدخول</Link>.</li>
        </ul>
      </div>
    </div>
  );
}
