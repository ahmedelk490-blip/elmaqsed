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

/** Each destination page gets its own hero concept; within a concept the three countries differ in visa type, so the signature section differs too. */
export const THEMES: Record<string, DestTheme> = {
  schengen: { concept: "boarding", accent: "#4f7fe8", city: "باريس", iata: "CDG", capLabel: "الدول", capital: "29 دولة أوروبية", currency: "اليورو في أغلبها", language: "لغات متعددة", tz: "أقل بساعة إلى ساعتين", flight: "6 ساعات ونصف تقريباً" },
  usa: { concept: "boarding", accent: "#e0413b", city: "نيويورك", iata: "JFK", capital: "واشنطن", currency: "الدولار الأمريكي", language: "الإنجليزية", tz: "أقل بـ 7 إلى 11 ساعة", flight: "13 ساعة تقريباً" },
  uae: { concept: "boarding", accent: "#1fae6f", city: "دبي", iata: "DXB", capital: "أبوظبي", currency: "الدرهم الإماراتي", language: "العربية", tz: "أكثر بساعة", flight: "ساعتان تقريباً" },
  uk: { concept: "stamp", accent: "#d9404f", city: "لندن", iata: "LHR", capital: "لندن", currency: "الجنيه الإسترليني", language: "الإنجليزية", tz: "أقل بساعتين إلى ثلاث", flight: "7 ساعات تقريباً" },
  egypt: { concept: "stamp", accent: "#d8ad45", city: "القاهرة", iata: "CAI", capital: "القاهرة", currency: "الجنيه المصري", language: "العربية", tz: "نفس التوقيت صيفاً وأقل بساعة شتاءً", flight: "ساعتان ونصف تقريباً" },
  turkey: { concept: "stamp", accent: "#e5484d", city: "إسطنبول", iata: "IST", capital: "أنقرة", currency: "الليرة التركية", language: "التركية", tz: "نفس التوقيت", flight: "4 ساعات تقريباً" },
  canada: { concept: "postcard", accent: "#e8433f", city: "تورنتو", iata: "YYZ", capital: "أوتاوا", currency: "الدولار الكندي", language: "الإنجليزية والفرنسية", tz: "أقل بـ 7 إلى 11 ساعة", flight: "13 ساعة تقريباً" },
  bosnia: { concept: "postcard", accent: "#e9b92c", city: "سراييفو", iata: "SJJ", capital: "سراييفو", currency: "المارك البوسني", language: "البوسنية", tz: "أقل بساعة إلى ساعتين", flight: "4 ساعات ونصف تقريباً" },
  australia: { concept: "postcard", accent: "#f0b429", city: "سيدني", iata: "SYD", capital: "كانبرا", currency: "الدولار الأسترالي", language: "الإنجليزية", tz: "أكثر بـ 5 إلى 8 ساعات", flight: "16 ساعة تقريباً مع توقف" },
  china: { concept: "route", accent: "#e5383b", city: "بكين", iata: "PEK", capital: "بكين", currency: "اليوان الصيني", language: "الصينية", tz: "أكثر بـ 5 ساعات", flight: "8 ساعات تقريباً" },
  japan: { concept: "route", accent: "#ec5a73", city: "طوكيو", iata: "HND", capital: "طوكيو", currency: "الين الياباني", language: "اليابانية", tz: "أكثر بـ 6 ساعات", flight: "13 ساعة تقريباً مع توقف" },
  india: { concept: "route", accent: "#f08a24", city: "نيودلهي", iata: "DEL", capital: "نيودلهي", currency: "الروبية الهندية", language: "الهندية والإنجليزية", tz: "أكثر بساعتين ونصف", flight: "4 ساعات تقريباً" },
};

export const ORDER: Record<Concept, ("glance" | "sig" | "docs" | "others")[]> = {
  boarding: ["glance", "sig", "docs", "others"],
  stamp: ["docs", "sig", "glance", "others"],
  postcard: ["glance", "docs", "sig", "others"],
  route: ["sig", "docs", "glance", "others"],
};
