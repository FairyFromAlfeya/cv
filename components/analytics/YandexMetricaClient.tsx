"use client";

import Link from "next/link";
import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";
import { WebVitals } from "./WebVitals";
import {
  OPEN_ANALYTICS_SETTINGS_EVENT,
  configureYandexMetrica,
  disableYandexMetrica,
  markYandexMetricaScriptLoaded,
  type AnalyticsSettingsRequestDetail,
} from "./yandexMetrica";

const CONSENT_COOKIE = "cv_analytics_consent";
const CONSENT_MAX_AGE = 60 * 60 * 24 * 365;

type Consent = "loading" | "pending" | "accepted" | "declined";

export type YandexMetricaCopy = {
  message: string;
  accept: string;
  decline: string;
  privacyNote: string;
  privacyLink: string;
  settings: string;
  settingsTitle: string;
  settingsDescription: string;
  acceptedStatus: string;
  declinedStatus: string;
  revoke: string;
  close: string;
};

export type YandexMetricaProps = {
  counterId: number | null;
  initialLocale: "en" | "ru";
  copies: Record<"en" | "ru", YandexMetricaCopy>;
};

function readConsentCookie(): Exclude<Consent, "loading" | "pending"> | null {
  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${CONSENT_COOKIE}=`));
  const value = cookie?.slice(CONSENT_COOKIE.length + 1);

  return value === "accepted" || value === "declined" ? value : null;
}

function writeConsentCookie(value: "accepted" | "declined"): void {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE}=${value}; Path=/; Max-Age=${CONSENT_MAX_AGE}; SameSite=Lax${secure}`;
}

function removeMetricaCookies(): void {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  const hostname = window.location.hostname;
  const cookieNames = document.cookie
    .split(";")
    .map((entry) => entry.trim().split("=", 1)[0])
    .filter((name): name is string => Boolean(name))
    .filter((name) => name.startsWith("_ym_") || name === "_yasc");

  cookieNames.forEach((name) => {
    const expiration = `${name}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
    document.cookie = expiration;

    if (hostname && hostname !== "localhost") {
      document.cookie = `${name}=; Domain=${hostname}; Path=/; Max-Age=0; SameSite=Lax${secure}`;
    }
  });
}

export function YandexMetrica({ counterId, initialLocale, copies }: YandexMetricaProps) {
  const [consent, setConsent] = useState<Consent>("loading");
  const [loadScript, setLoadScript] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [locale, setLocale] = useState(initialLocale);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const copy = copies[locale];

  const restoreSettingsFocus = useCallback(() => {
    const returnFocus = returnFocusRef.current;
    returnFocusRef.current = null;
    window.requestAnimationFrame(() => returnFocus?.focus());
  }, []);

  const closeSettings = useCallback(() => {
    setSettingsOpen(false);
    restoreSettingsFocus();
  }, [restoreSettingsFocus]);

  useEffect(() => {
    const updateLocale = () => {
      setLocale(document.documentElement.lang === "ru" ? "ru" : "en");
    };
    const observer = new MutationObserver(updateLocale);

    updateLocale();
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (counterId == null) {
        disableYandexMetrica();
        setLoadScript(false);
        setConsent("declined");
        return;
      }

      const savedConsent = readConsentCookie();
      if (savedConsent === "accepted") {
        setLoadScript(configureYandexMetrica(counterId, "saved_consent"));
        setConsent("accepted");
        return;
      }

      if (savedConsent === "declined") {
        disableYandexMetrica();
        setLoadScript(false);
        setConsent("declined");
        return;
      }

      setConsent("pending");
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [counterId]);

  useEffect(() => {
    if (counterId == null) return;

    const openSettings = (event: Event) => {
      const detail = event instanceof CustomEvent
        ? event.detail as AnalyticsSettingsRequestDetail | undefined
        : undefined;
      returnFocusRef.current = detail?.returnFocus instanceof HTMLElement
        ? detail.returnFocus
        : null;
      setSettingsOpen(true);
    };

    window.addEventListener(OPEN_ANALYTICS_SETTINGS_EVENT, openSettings);
    return () => window.removeEventListener(OPEN_ANALYTICS_SETTINGS_EVENT, openSettings);
  }, [counterId]);

  useEffect(() => {
    if (!settingsOpen) return;

    const frameId = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeSettings();
      }
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [closeSettings, settingsOpen]);

  const accept = () => {
    if (counterId == null) return;

    writeConsentCookie("accepted");
    setLoadScript(configureYandexMetrica(counterId, "user_consent"));
    setConsent("accepted");
    closeSettings();
  };

  const decline = () => {
    writeConsentCookie("declined");
    disableYandexMetrica();
    removeMetricaCookies();
    setLoadScript(false);
    setConsent("declined");
    closeSettings();
  };

  const showPanel = consent === "pending" || settingsOpen;
  const statusText = consent === "accepted"
    ? copy.acceptedStatus
    : consent === "declined"
      ? copy.declinedStatus
      : null;

  return (
    <>
      {loadScript ? (
        <Script
          id="yandex-metrica-tag"
          src="https://mc.yandex.ru/metrika/tag.js"
          strategy="afterInteractive"
          onLoad={markYandexMetricaScriptLoaded}
          onError={() => {
            console.warn("Yandex Metrica script failed to load.");
          }}
        />
      ) : null}

      {consent === "accepted" && counterId != null ? <WebVitals /> : null}

      {showPanel ? (
        <aside
          aria-describedby="analytics-consent-description"
          aria-labelledby="analytics-consent-title"
          className="fixed inset-x-4 bottom-[76px] z-[100] mx-auto max-w-3xl border border-white/20 bg-[#202020]/95 p-4 text-white shadow-2xl backdrop-blur md:bottom-[calc(10vh+12px)] md:flex md:items-center md:gap-6 md:p-5"
          data-nosnippet
          aria-live="polite"
          id="analytics-consent-panel"
          role={settingsOpen ? "dialog" : "region"}
        >
          <div className="min-w-0 flex-1">
            <h2
              className="text-sm font-semibold leading-6 md:text-base"
              id="analytics-consent-title"
            >
              {settingsOpen ? copy.settingsTitle : copy.message}
            </h2>
            <p
              className="mt-1 text-xs leading-5 text-white/70"
              id="analytics-consent-description"
            >
              {settingsOpen ? copy.settingsDescription : copy.privacyNote}
            </p>
            {statusText ? (
              <p className="mt-1 text-xs font-semibold leading-5 text-[#f3ca2f]">
                {statusText}
              </p>
            ) : null}
            <Link
              className="mt-2 inline-block text-xs font-semibold text-white underline decoration-white/50 underline-offset-4 transition-colors hover:text-[#f3ca2f] focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-[#f3ca2f]"
              href="/privacy"
            >
              {copy.privacyLink}
            </Link>
          </div>
          <div className="mt-4 flex shrink-0 flex-wrap gap-3 md:mt-0">
            {consent !== "accepted" ? (
              <button
                className="min-h-11 border border-[#f3ca2f] bg-[#f3ca2f] px-4 py-2 text-sm font-semibold text-[#202020] transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-[#f3ca2f]"
                onClick={accept}
                type="button"
              >
                {copy.accept}
              </button>
            ) : null}
            {consent !== "declined" ? (
              <button
                className="min-h-11 border border-white/40 px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-white"
                onClick={decline}
                type="button"
              >
                {consent === "accepted" ? copy.revoke : copy.decline}
              </button>
            ) : null}
            {settingsOpen ? (
              <button
                ref={closeButtonRef}
                className="min-h-11 px-3 py-2 text-sm font-semibold text-white/70 underline decoration-white/40 underline-offset-4 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-white"
                onClick={closeSettings}
                type="button"
              >
                {copy.close}
              </button>
            ) : null}
          </div>
        </aside>
      ) : null}
    </>
  );
}
