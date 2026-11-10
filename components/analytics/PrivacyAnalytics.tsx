"use client";

import { useEffect } from "react";
import {
  ANALYTICS_ENABLED_EVENT,
  trackPageHit,
} from "./yandexMetrica";

export function PrivacyAnalytics({
  description,
  locale,
  title,
}: {
  description: string;
  locale: "en" | "ru";
  title: string;
}) {
  useEffect(() => {
    document.title = title;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", description);

    const sendPageHit = () => {
      trackPageHit({
        locale,
        title,
        params: { page_type: "privacy" },
      });
    };

    sendPageHit();
    window.addEventListener(ANALYTICS_ENABLED_EVENT, sendPageHit);
    return () => window.removeEventListener(ANALYTICS_ENABLED_EVENT, sendPageHit);
  }, [description, locale, title]);

  return null;
}
