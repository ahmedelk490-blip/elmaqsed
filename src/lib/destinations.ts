import type { Lang } from "./lang";

export type Concept = "boarding" | "stamp" | "postcard" | "route";
export type DestTheme = {
  concept: Concept;
  accent: string; // taken from the flag
  city: string; // arrival city
  iata: string; // arrival airport
  capLabel?: string;
  capital: string;
  currency: string;
  language: string;
  tz: string; // time compared with Riyadh
  flight: string; // approximate flight time from Riyadh
};
const EU = "أقل بساعة إلى ساعتين";

/** Each destination page gets a hero concept; neighbours in the list differ in concept, accent and visa type. */
export const THEMES: Record<string, DestTheme> = {
  france: { concept: "boarding", accent: "#4f7fe8", city: "باريس", iata: "CDG", capital: "باريس", currency: "اليورو", language: "الفرنسية", tz: EU, flight: "6 ساعات ونصف تقريباً" },
  germany: { concept: "stamp", accent: "#e0b83a", city: "فرانكفورت", iata: "FRA", capital: "برلين", currency: "اليورو", language: "الألمانية", tz: EU, flight: "6 ساعات تقريباً" },
  italy: { concept: "postcard", accent: "#2fa66a", city: "روما", iata: "FCO", capital: "روما", currency: "اليورو", language: "الإيطالية", tz: EU, flight: "5 ساعات تقريباً" },
  netherlands: { concept: "route", accent: "#f08a24", city: "أمستردام", iata: "AMS", capital: "أمستردام", currency: "اليورو", language: "الهولندية", tz: EU, flight: "6 ساعات ونصف تقريباً" },
  spain: { concept: "boarding", accent: "#f0b429", city: "مدريد", iata: "MAD", capital: "مدريد", currency: "اليورو", language: "الإسبانية", tz: EU, flight: "7 ساعات تقريباً" },
  sweden: { concept: "postcard", accent: "#3d8fe0", city: "ستوكهولم", iata: "ARN", capital: "ستوكهولم", currency: "الكرونة السويدية", language: "السويدية", tz: EU, flight: "7 ساعات تقريباً" },
  switzerland: { concept: "postcard", accent: "#e5383b", city: "زيورخ", iata: "ZRH", capital: "برن", currency: "الفرنك السويسري", language: "الألمانية والفرنسية والإيطالية", tz: EU, flight: "6 ساعات تقريباً" },
  czech: { concept: "route", accent: "#3f6fd8", city: "براغ", iata: "PRG", capital: "براغ", currency: "الكرونة التشيكية", language: "التشيكية", tz: EU, flight: "5 ساعات ونصف تقريباً" },
  austria: { concept: "route", accent: "#e5484d", city: "فيينا", iata: "VIE", capital: "فيينا", currency: "اليورو", language: "الألمانية", tz: EU, flight: "5 ساعات ونصف تقريباً" },
  hungary: { concept: "route", accent: "#3fae6a", city: "بودابست", iata: "BUD", capital: "بودابست", currency: "الفورنت المجري", language: "المجرية", tz: EU, flight: "5 ساعات تقريباً" },
  greece: { concept: "stamp", accent: "#4aa3e8", city: "أثينا", iata: "ATH", capital: "أثينا", currency: "اليورو", language: "اليونانية", tz: "نفس التوقيت صيفاً وأقل بساعة شتاءً", flight: "4 ساعات تقريباً" },
  portugal: { concept: "postcard", accent: "#d9404f", city: "لشبونة", iata: "LIS", capital: "لشبونة", currency: "اليورو", language: "البرتغالية", tz: "أقل بساعتين إلى ثلاث", flight: "8 ساعات تقريباً" },
  usa: { concept: "boarding", accent: "#e0413b", city: "نيويورك", iata: "JFK", capital: "واشنطن", currency: "الدولار الأمريكي", language: "الإنجليزية", tz: "أقل بـ 7 إلى 11 ساعة", flight: "13 ساعة تقريباً" },
  uk: { concept: "stamp", accent: "#d9404f", city: "لندن", iata: "LHR", capital: "لندن", currency: "الجنيه الإسترليني", language: "الإنجليزية", tz: "أقل بساعتين إلى ثلاث", flight: "7 ساعات تقريباً" },
  malaysia: { concept: "boarding", accent: "#f0c63a", city: "كوالالمبور", iata: "KUL", capital: "كوالالمبور", currency: "الرينغيت الماليزي", language: "الملايوية", tz: "أكثر بـ 5 ساعات", flight: "8 ساعات ونصف تقريباً" },
  turkey: { concept: "stamp", accent: "#e5484d", city: "إسطنبول", iata: "IST", capital: "أنقرة", currency: "الليرة التركية", language: "التركية", tz: "نفس التوقيت", flight: "4 ساعات تقريباً" },
  seychelles: { concept: "postcard", accent: "#2fa66a", city: "ماهيه", iata: "SEZ", capital: "فيكتوريا", currency: "الروبية السيشلية", language: "الكريولية والإنجليزية والفرنسية", tz: "أكثر بساعة", flight: "5 ساعات تقريباً" },
  egypt: { concept: "stamp", accent: "#d8ad45", city: "القاهرة", iata: "CAI", capital: "القاهرة", currency: "الجنيه المصري", language: "العربية", tz: "نفس التوقيت صيفاً وأقل بساعة شتاءً", flight: "ساعتان ونصف تقريباً" },
  indonesia: { concept: "route", accent: "#e5383b", city: "جاكرتا", iata: "CGK", capital: "جاكرتا", currency: "الروبية الإندونيسية", language: "الإندونيسية", tz: "أكثر بـ 4 ساعات", flight: "9 ساعات ونصف تقريباً" },
  uae: { concept: "boarding", accent: "#1fae6f", city: "دبي", iata: "DXB", capital: "أبوظبي", currency: "الدرهم الإماراتي", language: "العربية", tz: "أكثر بساعة", flight: "ساعتان تقريباً" },
  qatar: { concept: "boarding", accent: "#c2477a", city: "الدوحة", iata: "DOH", capital: "الدوحة", currency: "الريال القطري", language: "العربية", tz: "نفس التوقيت", flight: "ساعة ونصف تقريباً" },
  bahrain: { concept: "stamp", accent: "#e5484d", city: "المنامة", iata: "BAH", capital: "المنامة", currency: "الدينار البحريني", language: "العربية", tz: "نفس التوقيت", flight: "ساعة تقريباً" },
};

export const ORDER: Record<Concept, ("glance" | "sig" | "docs" | "others")[]> = {
  boarding: ["glance", "sig", "docs", "others"],
  stamp: ["docs", "sig", "glance", "others"],
  postcard: ["glance", "docs", "sig", "others"],
  route: ["sig", "docs", "glance", "others"],
};

type EnFields = Pick<DestTheme, "city" | "capital" | "currency" | "language" | "tz" | "flight">;
const EU_EN = "1 to 2 hours behind";
const e = (city: string, capital: string, currency: string, language: string, flight: string, tz = EU_EN): EnFields => ({ city, capital, currency, language, tz, flight });

/** English text for each destination's facts (the accent, airport code and concept are shared with THEMES). */
const THEMES_EN: Record<string, EnFields> = {
  france: e("Paris", "Paris", "Euro", "French", "About 6.5 hours"),
  germany: e("Frankfurt", "Berlin", "Euro", "German", "About 6 hours"),
  italy: e("Rome", "Rome", "Euro", "Italian", "About 5 hours"),
  netherlands: e("Amsterdam", "Amsterdam", "Euro", "Dutch", "About 6.5 hours"),
  spain: e("Madrid", "Madrid", "Euro", "Spanish", "About 7 hours"),
  sweden: e("Stockholm", "Stockholm", "Swedish krona", "Swedish", "About 7 hours"),
  switzerland: e("Zurich", "Bern", "Swiss franc", "German, French and Italian", "About 6 hours"),
  czech: e("Prague", "Prague", "Czech koruna", "Czech", "About 5.5 hours"),
  austria: e("Vienna", "Vienna", "Euro", "German", "About 5.5 hours"),
  hungary: e("Budapest", "Budapest", "Hungarian forint", "Hungarian", "About 5 hours"),
  greece: e("Athens", "Athens", "Euro", "Greek", "About 4 hours", "Same in summer, 1 hour behind in winter"),
  portugal: e("Lisbon", "Lisbon", "Euro", "Portuguese", "About 8 hours", "2 to 3 hours behind"),
  usa: e("New York", "Washington, D.C.", "US dollar", "English", "About 13 hours", "7 to 11 hours behind"),
  uk: e("London", "London", "Pound sterling", "English", "About 7 hours", "2 to 3 hours behind"),
  malaysia: e("Kuala Lumpur", "Kuala Lumpur", "Malaysian ringgit", "Malay", "About 8.5 hours", "5 hours ahead"),
  turkey: e("Istanbul", "Ankara", "Turkish lira", "Turkish", "About 4 hours", "Same time"),
  seychelles: e("Mahé", "Victoria", "Seychellois rupee", "Creole, English and French", "About 5 hours", "1 hour ahead"),
  egypt: e("Cairo", "Cairo", "Egyptian pound", "Arabic", "About 2.5 hours", "Same in summer, 1 hour behind in winter"),
  indonesia: e("Jakarta", "Jakarta", "Indonesian rupiah", "Indonesian", "About 9.5 hours", "4 hours ahead"),
  uae: e("Dubai", "Abu Dhabi", "UAE dirham", "Arabic", "About 2 hours", "1 hour ahead"),
  qatar: e("Doha", "Doha", "Qatari riyal", "Arabic", "About 1.5 hours", "Same time"),
  bahrain: e("Manama", "Manama", "Bahraini dinar", "Arabic", "About 1 hour", "Same time"),
};

/** The theme of a destination in the visitor's language (undefined for destinations added later from the admin). */
export function getTheme(slug: string, lang: Lang = "ar"): DestTheme | undefined {
  const t = THEMES[slug];
  if (!t || lang !== "en") return t;
  return { ...t, ...THEMES_EN[slug], capLabel: t.capLabel ? "Capital" : undefined };
}
