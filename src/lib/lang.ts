// Site language: Arabic (default, right-to-left) or English. Chosen with the header button, kept in a cookie.
export type Lang = "ar" | "en";
export const LANG_COOKIE = "lang";
/** Picks the text for the current language: t("احجز الآن", "Book now"). */
export type T = (ar: string, en: string) => string;
export const tFor = (lang: Lang): T => (ar, en) => (lang === "en" ? en : ar);
