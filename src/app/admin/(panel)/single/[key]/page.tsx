import { notFound } from "next/navigation";
import { getContent } from "@/lib/content";
import { singles } from "@/lib/admin";
import { saveSingle } from "@/lib/actions";
import Fields from "@/components/admin/Fields";

export default async function SinglePage({ params, searchParams }: { params: Promise<{ key: string }>; searchParams: Promise<{ saved?: string }> }) {
  const { key } = await params;
  const { saved } = await searchParams;
  const def = singles[key];
  if (!def) notFound();
  const c = await getContent();
  const values = (c as unknown as Record<string, Record<string, unknown>>)[key] ?? {};
  return (
    <form action={saveSingle.bind(null, key)}>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{def.label}</h1>
        <button className="a-btn">حفظ ونشر</button>
      </div>
      {saved && <p className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">تم الحفظ ونشر التغييرات على الموقع.</p>}
      <div className="a-card p-6"><Fields fields={def.fields} values={values} /></div>
    </form>
  );
}
