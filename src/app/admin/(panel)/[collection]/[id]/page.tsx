import Link from "next/link";
import { notFound } from "next/navigation";
import { getContent } from "@/lib/content";
import { collections } from "@/lib/admin";
import { saveItem } from "@/lib/actions";
import Fields from "@/components/admin/Fields";
import { requireAdmin } from "@/lib/auth";

export default async function EditPage({ params }: { params: Promise<{ collection: string; id: string }> }) {
  await requireAdmin();
  const { collection, id } = await params;
  const def = collections[collection];
  if (!def) notFound();
  const c = await getContent();
  const list = (c as unknown as Record<string, Record<string, unknown>[]>)[collection] ?? [];
  const index = id === "new" ? -1 : Number(id);
  const item = index >= 0 ? list[index] : undefined;
  if (index >= 0 && !item) notFound();
  return (
    <form action={saveItem.bind(null, collection, index)}>
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{item ? `تعديل ${def.single}` : `إضافة ${def.single}`}</h1>
        <div className="flex gap-2">
          <Link href={`/admin/${collection}`} className="a-btn a-btn-ghost">إلغاء</Link>
          <button className="a-btn">حفظ ونشر</button>
        </div>
      </div>
      <div className="a-card p-6"><Fields fields={def.fields} values={item ?? {}} /></div>
    </form>
  );
}
