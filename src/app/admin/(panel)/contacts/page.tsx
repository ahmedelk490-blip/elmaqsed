import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { readContacts, type ContactHit } from "@/lib/contacts";
import { getContent } from "@/lib/content";

export const dynamic = "force-dynamic";

const DAY = 86_400_000;
const KIND = { call: ["اتصال", "bg-[#e0f2fe] text-[#075985]"], whatsapp: ["واتساب", "bg-[#dcfce7] text-[#166534]"] } as const;
const when = (iso: string) => new Date(iso).toLocaleString("ar-SA-u-nu-latn-ca-gregory", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Riyadh" });
const top = (list: ContactHit[], key: (h: ContactHit) => string) =>
  Object.entries(list.reduce<Record<string, number>>((m, h) => ((m[key(h)] = (m[key(h)] ?? 0) + 1), m), {})).sort((a, b) => b[1] - a[1]).slice(0, 8);

/** Who tapped call / WhatsApp, when, from which page and device. Numbers are changed in the site settings. */
export default async function ContactsPage() {
  await requireAdmin();
  const [list, { site }] = await Promise.all([readContacts(), getContent()]);
  const now = Date.now();
  const since = (ms: number) => list.filter((h) => now - Date.parse(h.at) < ms);
  const periods: [string, ContactHit[]][] = [["آخر 24 ساعة", since(DAY)], ["آخر 7 أيام", since(7 * DAY)], ["آخر 30 يوماً", since(30 * DAY)], ["الكل", list]];
  const month = since(30 * DAY);
  const boxes: [string, [string, number][]][] = [
    ["أكثر الصفحات (30 يوماً)", top(month, (h) => h.page)],
    ["الأجهزة والأرقام (30 يوماً)", [...top(month, (h) => (h.device === "mobile" ? "موبايل" : "كمبيوتر")), ...top(month, (h) => `${KIND[h.kind][0]}: ${h.number || "-"}`)]],
  ];
  return (
    <div>
      <h1 className="text-2xl font-bold">الاتصالات</h1>
      <p className="mt-1 text-sm text-slate-500">كل ضغطة على زر الاتصال أو أزرار واتساب في الموقع تُسجَّل هنا. نعرف أن الزائر بدأ الاتصال، لا مدة المكالمة.</p>

      <div className="a-card mt-6 flex flex-wrap items-center justify-between gap-4 p-5 text-sm">
        <p className="flex flex-wrap gap-x-6 gap-y-2"><span className="whitespace-nowrap">رقم الاتصال: <b dir="ltr" className="inline-block">{site.phone}</b></span>{site.phone2 && <span className="whitespace-nowrap">الرقم الثاني: <b dir="ltr" className="inline-block">{site.phone2}</b></span>}<span className="whitespace-nowrap">واتساب: <b dir="ltr" className="inline-block">+{site.whatsapp}</b></span></p>
        <Link href="/admin/single/site" className="a-btn">تغيير الأرقام</Link>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {periods.map(([label, l]) => (
          <div key={label} className="a-card p-5">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 font-serif text-4xl font-semibold">{l.length}</p>
            <p className="mt-1 text-xs text-slate-500">{l.filter((h) => h.kind === "call").length} اتصال · {l.filter((h) => h.kind === "whatsapp").length} واتساب</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {boxes.map(([title, rows]) => (
          <div key={title} className="a-card p-5">
            <h2 className="font-bold">{title}</h2>
            {rows.length ? (
              <ul className="mt-3 space-y-2 text-sm">{rows.map(([k, n]) => <li key={k} className="flex justify-between gap-4"><span className="min-w-0 truncate" dir="auto">{k}</span><b>{n}</b></li>)}</ul>
            ) : <p className="mt-3 text-sm text-slate-500">لا توجد بيانات بعد.</p>}
          </div>
        ))}
      </div>

      <ul className="a-card mt-4 divide-y divide-slate-100 p-0 md:hidden">
        {list.slice(0, 200).map((h, i) => (
          <li key={i} className="flex items-start gap-3 p-4 text-sm">
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${KIND[h.kind][1]}`}>{KIND[h.kind][0]}</span>
            <span className="min-w-0 flex-1">
              <b className="block truncate" dir="ltr">{h.page}</b>
              <span className="mt-0.5 block text-xs text-slate-500">{when(h.at)} · {h.device === "mobile" ? "موبايل" : "كمبيوتر"}</span>
            </span>
          </li>
        ))}
        {!list.length && <li className="p-6 text-center text-sm text-slate-500">لا توجد ضغطات بعد.</li>}
      </ul>
      <div className="a-card mt-4 hidden overflow-x-auto p-0 md:block">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="bg-slate-50 text-slate-500"><tr><th className="p-3 text-start font-medium">الوقت</th><th className="p-3 text-start font-medium">النوع</th><th className="p-3 text-start font-medium">الرقم</th><th className="p-3 text-start font-medium">الصفحة</th><th className="p-3 text-start font-medium">الزر</th><th className="p-3 text-start font-medium">الجهاز</th></tr></thead>
          <tbody>
            {list.slice(0, 200).map((h, i) => (
              <tr key={i} className="border-t border-slate-100">
                <td className="whitespace-nowrap p-3">{when(h.at)}</td>
                <td className="p-3"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${KIND[h.kind][1]}`}>{KIND[h.kind][0]}</span></td>
                <td className="p-3" dir="ltr">{h.number}</td>
                <td className="p-3" dir="ltr">{h.page}</td>
                <td className="max-w-[220px] truncate p-3">{h.label}</td>
                <td className="p-3">{h.device === "mobile" ? "موبايل" : "كمبيوتر"}</td>
              </tr>
            ))}
            {!list.length && <tr><td colSpan={6} className="p-8 text-center text-slate-500">لا توجد ضغطات بعد. أول ضغطة على زر اتصال أو واتساب ستظهر هنا.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
