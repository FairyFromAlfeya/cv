import "server-only";

import { cookies } from "next/headers";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, type Locale } from "@/components/cv/config";

export async function getRequestLocale(): Promise<Locale> {
  const storedLocale = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isLocale(storedLocale) ? storedLocale : DEFAULT_LOCALE;
}
