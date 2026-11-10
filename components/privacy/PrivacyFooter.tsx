"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trackGoal } from "@/components/analytics/yandexMetrica";
import { SiteFooter } from "@/components/cv/chrome/SiteFooter";
import { LOCALE_COOKIE, type Dictionary, type Locale } from "@/components/cv/config";

type PrivacyFooterProps = {
  copies: Record<Locale, Dictionary["footer"]>;
  initialLocale: Locale;
};

export function PrivacyFooter({ copies, initialLocale }: PrivacyFooterProps) {
  const router = useRouter();
  const [locale, setLocale] = useState(initialLocale);

  function changeLocale(nextLocale: Locale) {
    if (nextLocale === locale) return;

    trackGoal("language_changed", {
      from_locale: locale,
      to_locale: nextLocale,
      placement: "privacy",
    });
    setLocale(nextLocale);
    document.documentElement.lang = nextLocale;

    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${LOCALE_COOKIE}=${encodeURIComponent(nextLocale)}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
    router.refresh();
  }

  return (
    <SiteFooter
      copy={copies[locale]}
      locale={locale}
      onLocaleChange={changeLocale}
      showPrivacyLink={false}
    />
  );
}
