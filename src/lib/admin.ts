// Admin schemas: which fields each collection / single document exposes in the control panel.
export type FieldType = "text" | "textarea" | "number" | "select" | "lines" | "pairs";
export type Field = { name: string; label: string; type?: FieldType; options?: string[]; hint?: string; required?: boolean };
export type Coll = { label: string; single: string; title: string; fields: Field[] };

const t = (name: string, label: string, extra: Partial<Field> = {}): Field => ({ name, label, ...extra });

export const collections: Record<string, Coll> = {
  countries: {
    label: "الوجهات", single: "وجهة", title: "name",
    fields: [
      t("name", "الاسم بالعربي", { required: true }), t("en", "الاسم بالإنجليزي"),
      t("slug", "الرابط (slug)", { hint: "حروف إنجليزية صغيرة بدون مسافات، مثل: schengen" }),
      t("code", "رمز العلم", { hint: "رمز الدولة ISO بحرفين مثل: us, gb, eu" }),
      t("kind", "نوع التقديم", { type: "select", options: ["سفارة", "إلكترونية", "مركز تأشيرات"] }),
      t("time", "المدة التقريبية", { hint: "مثل: 15 – 30 يوم عمل" }),
      t("img", "صورة الوجهة", { hint: "رابط صورة https://... أو مسار مثل /img/p06.jpg" }),
      t("types", "أنواع التأشيرة", { type: "lines", hint: "سطر لكل نوع" }),
      t("reqs", "المستندات المطلوبة", { type: "lines", hint: "سطر لكل مستند" }),
      t("note", "نبذة قصيرة", { type: "textarea" }),
    ],
  },
  services: {
    label: "الخدمات", single: "خدمة", title: "title",
    fields: [
      t("title", "العنوان", { required: true }),
      t("icon", "الأيقونة", { type: "select", options: ["compass", "docs", "form", "calendar", "letter", "shield"] }),
      t("img", "صورة الخدمة", { type: "select", options: ["/img/p03.jpg", "/img/p04.jpg", "/img/p05.jpg", "/img/p06.jpg", "/img/p07.jpg", "/img/p08.jpg", "/img/p09.jpg", "/img/p10.jpg", "/img/p11.jpg", "/img/p12.jpg", "/img/p13.jpg", "/img/p14.jpg", "/img/p15.jpg"] }),
      t("text", "الوصف", { type: "textarea" }), t("bullets", "ماذا تشمل الخدمة", { type: "lines", hint: "سطر لكل بند" }),
    ],
  },
  steps: { label: "خطوات العمل", single: "خطوة", title: "title", fields: [t("n", "الرقم", { hint: "مثل 01" }), t("title", "العنوان", { required: true }), t("text", "الوصف", { type: "textarea" })] },
  why: { label: "لماذا المقصد", single: "سبب", title: "title", fields: [t("title", "العنوان", { required: true }), t("text", "الوصف", { type: "textarea" })] },
  faq: {
    label: "الأسئلة الشائعة", single: "سؤال", title: "q",
    fields: [t("q", "السؤال", { required: true }), t("cat", "التصنيف", { type: "select", options: ["عام", "المستندات", "الرسوم", "بعد الرفض"] }), t("a", "الإجابة", { type: "textarea" })],
  },
  testimonials: { label: "شهادات العملاء", single: "شهادة", title: "name", fields: [t("name", "الاسم"), t("city", "المدينة"), t("visa", "التأشيرة"), t("text", "النص", { type: "textarea" })] },
  stats: { label: "الإحصائيات", single: "إحصائية", title: "label", fields: [t("label", "العنوان"), t("value", "القيمة", { type: "number" }), t("suffix", "اللاحقة", { hint: "مثل +" }), t("decimals", "عدد الكسور العشرية", { type: "number" })] },
  nav: { label: "القائمة الرئيسية", single: "رابط", title: "label", fields: [t("label", "النص"), t("href", "الرابط", { hint: "مثل /services" })] },
};

export const singles: Record<string, { label: string; fields: Field[] }> = {
  site: {
    label: "إعدادات الموقع",
    fields: [
      t("name", "اسم الشركة"), t("nameEn", "الاسم بالإنجليزي"), t("tagline", "الشعار النصي"), t("description", "وصف الموقع (SEO)", { type: "textarea" }),
      t("url", "رابط الموقع", { hint: "https://..." }), t("whatsapp", "رقم واتساب", { hint: "بصيغة دولية بدون + مثل 9665xxxxxxxx" }),
      t("phone", "الهاتف"), t("email", "البريد"), t("city", "المدينة / العنوان"), t("hours", "ساعات العمل"),
      t("cr", "السجل التجاري"), t("license", "رقم ترخيص السياحة"),
      t("social.instagram", "إنستغرام"), t("social.x", "منصة X"), t("social.tiktok", "تيك توك"), t("social.snapchat", "سناب شات"),
      t("footerNote", "نص الفوتر", { type: "textarea" }), t("disclaimer", "إخلاء المسؤولية", { type: "textarea" }),
    ],
  },
  about: {
    label: "صفحة من نحن",
    fields: [t("title", "العنوان الرئيسي"), t("intro", "المقدمة", { type: "textarea" }), t("story", "القصة", { type: "lines", hint: "فقرة لكل سطر" }), t("values", "القيم", { type: "pairs", hint: "سطر لكل قيمة بصيغة: العنوان | النص" })],
  },
};

export function getPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((o, k) => (o && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined), obj);
}
export function setPath(obj: Record<string, unknown>, path: string, val: unknown) {
  const keys = path.split(".");
  let o = obj;
  for (const k of keys.slice(0, -1)) o = (o[k] ??= {}) as Record<string, unknown>;
  o[keys[keys.length - 1]] = val;
}
export function toInput(f: Field, v: unknown): string {
  if (f.type === "lines") return Array.isArray(v) ? v.join("\n") : "";
  if (f.type === "pairs") return Array.isArray(v) ? (v as { title: string; text: string }[]).map((p) => `${p.title} | ${p.text}`).join("\n") : "";
  return v == null ? "" : String(v);
}
export function fromInput(f: Field, raw: FormDataEntryValue | null): unknown {
  const v = String(raw ?? "").trim();
  if (f.type === "number") return Number(v) || 0;
  if (f.type === "lines") return v.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
  if (f.type === "pairs") return v.split(/\r?\n/).map((l) => l.split("|")).filter((p) => p[0]?.trim()).map(([a, b]) => ({ title: a.trim(), text: (b || "").trim() }));
  return v;
}
