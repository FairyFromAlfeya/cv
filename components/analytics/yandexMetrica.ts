export type KnownAnalyticsGoal =
  | "navigation_used"
  | "navigation_menu_opened"
  | "navigation_menu_closed"
  | "social_link_clicked"
  | "work_clicked"
  | "work_skills_reveal"
  | "language_changed"
  | "philosophy_quote_changed"
  | "contact_form_started"
  | "contact_form_validation_error"
  | "contact_form_submitted"
  | "contact_form_success"
  | "contact_form_failed"
  | "contact_form_abandoned"
  | "web_vital"
  | "client_diagnostic";

/**
 * Known goals retain editor autocomplete while still allowing a project to add
 * another categorical goal without changing this module first.
 */
export type AnalyticsGoal =
  | KnownAnalyticsGoal
  | (string & Record<never, never>);

export type AnalyticsParamValue = string | number | boolean;
export type AnalyticsParams = Readonly<
  Record<string, AnalyticsParamValue | null | undefined>
>;

export type SectionHitOptions = {
  locale?: string;
  title?: string;
  previousSectionId?: string;
  params?: AnalyticsParams;
};

export type PageHitOptions = {
  locale?: string;
  title?: string;
  params?: AnalyticsParams;
};

export type AnalyticsEnableSource = "saved_consent" | "user_consent";

type SanitizedParams = Record<string, AnalyticsParamValue>;

type HitOptions = {
  title?: string;
  referer?: string;
  params?: SanitizedParams;
};

type PendingCommand =
  | {
      method: "reachGoal";
      goal: string;
      params?: SanitizedParams;
    }
  | {
      method: "hit";
      url: string;
      options: HitOptions;
    };

type YandexMetricaInitOptions = {
  accurateTrackBounce: boolean;
  clickmap: boolean;
  defer: boolean;
  trackHash: boolean;
  trackLinks: boolean;
  webvisor: boolean;
};

type YandexMetricaFunction = {
  (counterId: number, method: "init", options: YandexMetricaInitOptions): void;
  (
    counterId: number,
    method: "reachGoal",
    goal: string,
    params?: SanitizedParams,
  ): void;
  (
    counterId: number,
    method: "hit",
    url: string,
    options?: HitOptions,
  ): void;
  (counterId: number, method: "destruct"): void;
  a?: unknown[][];
  l?: number;
};

declare global {
  interface Window {
    /** Runtime-only public counter identifier, intentionally not a build env. */
    __YANDEX_METRICA_ID__?: number;
    ym?: YandexMetricaFunction;
  }
}

const MAX_PARAM_COUNT = 24;
const MAX_PARAM_STRING_LENGTH = 120;
const MAX_IDENTIFIER_LENGTH = 64;

const forbiddenParamKey =
  /^(?:e_?mail|phone|telephone|full_?name|first_?name|last_?name|name|message|subject|text|comment|address|ip|password|passphrase|secret|token|authorization|cookie|user_?id|username)$/i;
const emailValue = /\b[^\s@]+@[^\s@]+\.[^\s@]+\b/;
const phoneValue = /(?:^|\D)\+?\d(?:[\s().-]*\d){6,}(?:\D|$)/;

let collectionState: "pending" | "enabled" | "disabled" = "pending";
let configuredCounterId: number | null = null;
let initializedCounterId: number | null = null;
let lastHit: { url: string; timestamp: number } | null = null;
let scriptLoaded = false;

export const ANALYTICS_ENABLED_EVENT = "cv:analytics-enabled";
export const OPEN_ANALYTICS_SETTINGS_EVENT = "cv:analytics-settings-open";

export type AnalyticsSettingsRequestDetail = {
  returnFocus?: HTMLElement | null;
};

export function requestAnalyticsSettings(returnFocus?: HTMLElement | null): void {
  if (!isBrowser()) return;

  window.dispatchEvent(new CustomEvent<AnalyticsSettingsRequestDetail>(
    OPEN_ANALYTICS_SETTINGS_EVENT,
    { detail: { returnFocus } },
  ));
}

export function markYandexMetricaScriptLoaded(): void {
  scriptLoaded = true;
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function isCounterId(value: number): boolean {
  return Number.isSafeInteger(value) && value > 0;
}

function normalizeIdentifier(value: string): string | null {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, MAX_IDENTIFIER_LENGTH);

  return normalized || null;
}

function safeUrl(value: string): string | null {
  if (!value || !isBrowser()) return null;

  try {
    const url = new URL(value, window.location.origin);
    const origin = url.origin === window.location.origin ? "" : url.origin;
    return `${origin}${url.pathname}` || "/";
  } catch {
    return value.split(/[?#]/, 1)[0]?.slice(0, MAX_PARAM_STRING_LENGTH) || null;
  }
}

function safeReferrer(value: string): string | null {
  if (!value || !isBrowser()) return null;

  try {
    const url = new URL(value, window.location.origin);
    return url.origin === window.location.origin
      ? `${url.pathname}` || "/"
      : url.origin;
  } catch {
    return null;
  }
}

function sanitizeString(value: string): string | null {
  const normalized = value.replace(/[\u0000-\u001f\u007f]+/g, " ").trim();
  if (!normalized || emailValue.test(normalized) || phoneValue.test(normalized)) {
    return null;
  }

  if (/^(?:https?:\/\/|\/)/i.test(normalized)) {
    return safeUrl(normalized);
  }

  return normalized.slice(0, MAX_PARAM_STRING_LENGTH);
}

function sanitizeParams(params?: AnalyticsParams): SanitizedParams | undefined {
  if (!params) return undefined;

  const sanitized: SanitizedParams = {};

  for (const [rawKey, rawValue] of Object.entries(params)) {
    if (Object.keys(sanitized).length >= MAX_PARAM_COUNT) break;

    const key = normalizeIdentifier(rawKey);
    if (!key || forbiddenParamKey.test(key) || rawValue == null) continue;

    if (typeof rawValue === "string") {
      const value = sanitizeString(rawValue);
      if (value != null) sanitized[key] = value;
      continue;
    }

    if (typeof rawValue === "number") {
      if (Number.isFinite(rawValue)) sanitized[key] = rawValue;
      continue;
    }

    if (typeof rawValue === "boolean") sanitized[key] = rawValue;
  }

  return Object.keys(sanitized).length > 0 ? sanitized : undefined;
}

function sanitizeCampaignValue(
  key: "utm_source" | "utm_medium" | "utm_campaign" | "utm_content" | "utm_term" | "yclid" | "gclid",
  value: string,
): string | null {
  const normalized = value.replace(/[\u0000-\u001f\u007f]+/g, " ").trim();
  if (!normalized || emailValue.test(normalized)) return null;

  // Advertising click identifiers are commonly long numeric strings, so the
  // generic phone-number heuristic would incorrectly discard them.
  if (key === "yclid" || key === "gclid") {
    return /^[a-z0-9._~-]+$/i.test(normalized)
      ? normalized.slice(0, MAX_PARAM_STRING_LENGTH)
      : null;
  }

  if (phoneValue.test(normalized)) return null;
  return normalized.slice(0, MAX_PARAM_STRING_LENGTH);
}

function campaignQuery(): string {
  if (!isBrowser()) return "";

  const allowedKeys = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
    "yclid",
    "gclid",
  ] as const;
  const source = new URLSearchParams(window.location.search);
  const campaign = new URLSearchParams();

  allowedKeys.forEach((key) => {
    const value = source.get(key);
    if (!value) return;

    const sanitized = sanitizeCampaignValue(key, value);
    if (sanitized) campaign.set(key, sanitized);
  });

  const query = campaign.toString();
  return query ? `?${query}` : "";
}

function getOrCreateQueue(): YandexMetricaFunction {
  if (window.ym) return window.ym;

  const queue = ((...args: unknown[]) => {
    queue.a?.push(args);
  }) as YandexMetricaFunction;

  queue.a = [];
  queue.l = Date.now();
  window.ym = queue;
  return queue;
}

function execute(command: PendingCommand): void {
  if (!isBrowser() || collectionState !== "enabled") return;

  const counterId = configuredCounterId ?? window.__YANDEX_METRICA_ID__;
  if (!counterId || !isCounterId(counterId)) return;

  const ym = getOrCreateQueue();
  if (command.method === "reachGoal") {
    ym(counterId, "reachGoal", command.goal, command.params);
    return;
  }

  ym(counterId, "hit", command.url, command.options);
}

function enqueue(command: PendingCommand): boolean {
  if (!isBrowser() || collectionState !== "enabled" || configuredCounterId == null) {
    return false;
  }

  execute(command);
  return true;
}

/** Enable collection only after consent and initialize the runtime counter. */
export function configureYandexMetrica(
  counterId: number,
  source: AnalyticsEnableSource = "saved_consent",
): boolean {
  if (!isBrowser() || !isCounterId(counterId)) return false;

  const wasAlreadyEnabled =
    collectionState === "enabled" && configuredCounterId === counterId;
  if (
    collectionState === "enabled"
    && configuredCounterId != null
    && configuredCounterId !== counterId
    && window.ym
  ) {
    window.ym(configuredCounterId, "destruct");
  }

  collectionState = "enabled";
  configuredCounterId = counterId;
  window.__YANDEX_METRICA_ID__ = counterId;

  const ym = getOrCreateQueue();
  if (initializedCounterId !== counterId) {
    ym(counterId, "init", {
      accurateTrackBounce: true,
      clickmap: true,
      defer: true,
      trackHash: false,
      trackLinks: true,
      webvisor: true,
    });
    initializedCounterId = counterId;
  }

  if (!wasAlreadyEnabled) {
    window.dispatchEvent(new CustomEvent(ANALYTICS_ENABLED_EVENT, {
      detail: { source },
    }));
  }
  return true;
}

/** Stop collection and discard anything recorded before a consent decision. */
export function disableYandexMetrica(): void {
  if (!isBrowser()) return;

  const counterId = configuredCounterId ?? window.__YANDEX_METRICA_ID__;
  if (collectionState === "enabled" && counterId && window.ym) {
    if (scriptLoaded) {
      window.ym(counterId, "destruct");
    } else if (Array.isArray(window.ym.a)) {
      // The remote script has not consumed the local stub yet. Discarding the
      // queue prevents pre-revocation hits from being replayed after reaccept.
      window.ym.a.length = 0;
    }
  }

  collectionState = "disabled";
  configuredCounterId = null;
  initializedCounterId = null;
  lastHit = null;
  delete window.__YANDEX_METRICA_ID__;
}

/** Send a categorical goal. Never pass form values or other user-provided text. */
export function trackGoal(
  name: AnalyticsGoal,
  params?: AnalyticsParams,
): boolean {
  const goal = normalizeIdentifier(name);
  if (!goal) return false;

  return enqueue({
    method: "reachGoal",
    goal,
    params: sanitizeParams(params),
  });
}

/** Record a virtual page view for a full-screen CV section. */
export function trackSectionHit(
  sectionId: string,
  options: SectionHitOptions = {},
): boolean {
  if (!isBrowser()) return false;

  const section = normalizeIdentifier(sectionId);
  if (!section) return false;

  const pathname = safeUrl(window.location.pathname) ?? "/";
  const previousSection = options.previousSectionId
    ? normalizeIdentifier(options.previousSectionId)
    : null;
  const url = `${pathname}${previousSection ? "" : campaignQuery()}#${encodeURIComponent(section)}`;
  const timestamp = Date.now();

  // React Strict Mode can run mount effects twice; keep genuine later revisits.
  if (lastHit?.url === url && timestamp - lastHit.timestamp < 1_000) return true;
  const referer = previousSection
    ? `${pathname}#${encodeURIComponent(previousSection)}`
    : safeReferrer(document.referrer) ?? undefined;
  const title = options.title ? sanitizeString(options.title) ?? undefined : undefined;

  const sent = enqueue({
    method: "hit",
    url,
    options: {
      title,
      referer,
      params: sanitizeParams({
        ...options.params,
        section,
        locale: options.locale,
      }),
    },
  });
  if (sent) lastHit = { url, timestamp };
  return sent;
}

/** Record a normal route outside the full-screen CV section scroller. */
export function trackPageHit(options: PageHitOptions = {}): void {
  if (!isBrowser()) return;

  const pathname = safeUrl(window.location.pathname) ?? "/";
  const url = `${pathname}${campaignQuery()}`;
  const timestamp = Date.now();
  if (lastHit?.url === url && timestamp - lastHit.timestamp < 1_000) return;

  const sent = enqueue({
    method: "hit",
    url,
    options: {
      title: options.title ? sanitizeString(options.title) ?? undefined : undefined,
      referer: safeReferrer(document.referrer) ?? undefined,
      params: sanitizeParams({
        ...options.params,
        locale: options.locale,
      }),
    },
  });
  if (sent) lastHit = { url, timestamp };
}

/**
 * Diagnostics share one goal and use a categorical `diagnostic` parameter so
 * errors can be grouped without ever transmitting messages, stacks, or PII.
 */
export function trackDiagnostic(
  name: string,
  params?: AnalyticsParams,
): boolean {
  const diagnostic = normalizeIdentifier(name);
  if (!diagnostic) return false;

  return trackGoal("client_diagnostic", {
    ...params,
    diagnostic,
  });
}
