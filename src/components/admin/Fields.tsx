import { getPath, toInput, type Field } from "@/lib/admin";

/** Renders a schema-driven form body for the control panel. */
export default function Fields({ fields, values }: { fields: Field[]; values: Record<string, unknown> }) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {fields.map((f) => {
        const val = toInput(f, getPath(values, f.name));
        const wide = f.type === "textarea" || f.type === "lines" || f.type === "pairs";
        const ltr = /href|url|slug|code|email|whatsapp|phone|social|nameEn|en$|suffix/.test(f.name);
        return (
          <label key={f.name} className={`block ${wide ? "md:col-span-2" : ""}`}>
            <span className="a-label">{f.label}{f.required && <span className="text-red-500"> *</span>}</span>
            {f.type === "select" ? (
              <select name={f.name} defaultValue={val} className="a-input">
                {f.options!.map((o) => <option key={o}>{o}</option>)}
              </select>
            ) : wide ? (
              <textarea name={f.name} defaultValue={val} rows={f.type === "textarea" ? 4 : 6} className="a-input" />
            ) : (
              <input name={f.name} type={f.type === "number" ? "number" : "text"} step="any" defaultValue={val} required={f.required} className="a-input" dir={ltr ? "ltr" : undefined} />
            )}
            {f.hint && <span className="a-hint">{f.hint}</span>}
          </label>
        );
      })}
    </div>
  );
}
