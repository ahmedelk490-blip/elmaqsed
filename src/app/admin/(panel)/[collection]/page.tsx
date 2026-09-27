import Link from "next/link";
import { notFound } from "next/navigation";
import { getContent } from "@/lib/content";
import { collections } from "@/lib/admin";
import { deleteItem, moveItem } from "@/lib/actions";
import DeleteButton from "@/components/admin/DeleteButton";

export default async function ListPage({ params, searchParams }: { params: Promise<{ collection: string }>; searchParams: Promise<{ saved?: string }> }) {
  const { collection } = await params;
  const { saved } = await searchParams;
  const def = collections[collection];
  if (!def) notFound();
  const c = await getContent();
  const list = (c as unknown as Record<string, Record<string, unknown>[]>)[collection] ?? [];
  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{def.label} <span className="text-base font-normal text-slate-400">({list.length})</span></h1>
        <Link href={`/admin/${collection}/new`} className="a-btn">+ إضافة {def.single}</Link>
      </div>
      {saved && <p className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">تم الحفظ ونشر التغييرات على الموقع.</p>}
      <div className="a-card divide-y divide-slate-100">
        {list.map((item, i) => (
          <div key={i} className="flex flex-wrap items-center gap-2 p-4 md:gap-3">
            <span className="w-8 font-serif text-slate-400">{i + 1}</span>
            <Link href={`/admin/${collection}/${i}`} className="min-w-[10rem] flex-1 font-semibold hover:text-sky">{String(item[def.title] ?? "—")}</Link>
            <form action={moveItem.bind(null, collection, i, -1)}><button className="a-btn a-btn-ghost px-2" aria-label="أعلى">↑</button></form>
            <form action={moveItem.bind(null, collection, i, 1)}><button className="a-btn a-btn-ghost px-2" aria-label="أسفل">↓</button></form>
            <Link href={`/admin/${collection}/${i}`} className="a-btn a-btn-ghost">تعديل</Link>
            <form action={deleteItem.bind(null, collection, i)}><DeleteButton /></form>
          </div>
        ))}
        {!list.length && <p className="p-8 text-center text-slate-500">لا توجد عناصر بعد.</p>}
      </div>
    </div>
  );
}
