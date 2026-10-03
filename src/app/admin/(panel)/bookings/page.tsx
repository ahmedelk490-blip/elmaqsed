import { readBookings } from "@/lib/bookings";
import { deleteBooking, setBookingStatus } from "@/lib/actions";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const STATUS: Record<string, [string, string]> = {
  new: ["جديد", "bg-[#e0f2fe] text-[#075985]"],
  contacted: ["تم التواصل", "bg-[#fef3c7] text-[#92400e]"],
  done: ["مكتمل", "bg-[#d1fae5] text-[#065f46]"],
  cancelled: ["ملغي", "bg-[#e2e8f0] text-[#475569]"],
};
const SERVICE: Record<string, string> = { visa: "تأشيرة", hotel: "فندق", contact: "استشارة" };
const when = (iso: string) => new Date(iso).toLocaleString("ar-SA-u-nu-latn-ca-gregory", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Riyadh" });
const wa = (p: string) => p.replace(/\D/g, "").replace(/^0/, "966");

/** Every booking and enquiry sent from the site, newest first, with contact shortcuts and a status. */
export default async function BookingsPage() {
  await requireAdmin();
  const list = await readBookings();
  const fresh = list.filter((b) => b.status === "new").length;
  return (
    <div>
      <h1 className="text-2xl font-bold">الحجوزات والطلبات</h1>
      <p className="mt-1 text-sm text-slate-500">{list.length} طلب، منها {fresh} جديد. كل طلب يُرسل من الموقع يُسجَّل هنا تلقائياً.</p>
      {!list.length && <div className="a-card mt-8 p-8 text-center text-slate-500">لا توجد طلبات بعد. أول طلب يُرسل من صفحة الحجز سيظهر هنا.</div>}
      <div className="mt-6 space-y-3">
        {list.map((b) => (
          <details key={b.id} className="a-card p-0" open={b.status === "new"}>
            <summary className="flex cursor-pointer flex-wrap items-center gap-x-4 gap-y-2 p-4">
              <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${STATUS[b.status]?.[1] ?? ""}`}>{STATUS[b.status]?.[0] ?? b.status}</span>
              <b>{b.name || "بدون اسم"}</b>
              <span className="text-sm text-slate-600">{SERVICE[b.service] ?? b.service} · {b.summary}</span>
              <span className="text-sm text-slate-500" dir="ltr">{b.phone}</span>
              <span className="mr-auto text-xs text-slate-400">{when(b.at)}</span>
            </summary>
            <div className="border-t border-slate-200 p-4">
              <dl className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
                {b.rows.map(([k, v], i) => <div key={i} className="rounded-lg bg-slate-50 p-2.5"><dt className="text-xs text-slate-500">{k}</dt><dd className="mt-0.5 break-words font-semibold" dir="auto">{v}</dd></div>)}
              </dl>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <a href={`https://wa.me/${wa(b.phone)}`} target="_blank" rel="noopener" className="a-btn">واتساب</a>
                <a href={`tel:${b.phone}`} className="a-btn a-btn-ghost">اتصال</a>
                {b.email && <a href={`mailto:${b.email}`} className="a-btn a-btn-ghost">بريد</a>}
                <form key={b.status} action={setBookingStatus.bind(null, b.id)} className="flex items-center gap-2 sm:mr-auto">
                  <select name="status" defaultValue={b.status} className="a-input w-auto" aria-label="حالة الطلب">
                    {Object.entries(STATUS).map(([k, [label]]) => <option key={k} value={k}>{label}</option>)}
                  </select>
                  <button className="a-btn a-btn-ghost">حفظ الحالة</button>
                </form>
                <form action={deleteBooking.bind(null, b.id)}><button className="a-btn a-btn-danger">حذف</button></form>
              </div>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
