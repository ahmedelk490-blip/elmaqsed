import { cookies } from "next/headers";
import { cache } from "react";
import { LANG_COOKIE, tFor, type Lang } from "./lang";

/** Language of the current request (server side). */
export const getLang = cache(async (): Promise<Lang> => ((await cookies()).get(LANG_COOKIE)?.value === "en" ? "en" : "ar"));

/** Text picker for server components: const t = await getT(); t("الرئيسية", "Home"). */
export const getT = async () => tFor(await getLang());
