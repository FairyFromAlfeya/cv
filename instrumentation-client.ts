// Next loads this module before hydration so early browser failures are observable.
import { trackDiagnostic } from "@/components/analytics/yandexMetrica";

const MAX_DIAGNOSTICS_PER_PAGE = 5;
const knownErrorTypes = new Set([
  "AggregateError",
  "Error",
  "EvalError",
  "RangeError",
  "ReferenceError",
  "SyntaxError",
  "TypeError",
  "URIError",
]);
const knownSections = new Set([
  "introduce",
  "about",
  "works",
  "services",
  "resume",
  "career",
  "philosophy",
  "contact",
]);

type DiagnosticState = {
  count: number;
  fingerprints: Set<string>;
};

type DiagnosticsGlobal = typeof globalThis & {
  __CV_DIAGNOSTICS__?: DiagnosticState;
};

const diagnosticsGlobal = globalThis as DiagnosticsGlobal;

function safePath(value: string): string {
  if (!value) return "unknown";

  try {
    const url = new URL(value, window.location.origin);
    const origin = url.origin === window.location.origin ? "" : url.origin;
    return `${origin}${url.pathname}` || "/";
  } catch {
    return value.split(/[?#]/, 1)[0]?.slice(0, 120) || "unknown";
  }
}

function errorType(value: unknown): string {
  if (!(value instanceof Error)) return typeof value;
  return knownErrorTypes.has(value.name) ? value.name : "Error";
}

function currentSection(): string {
  const section = window.location.hash.slice(1).toLowerCase();
  return knownSections.has(section) ? section : "unknown";
}

function report(
  diagnostic: string,
  fingerprint: string,
  params: Record<string, string | number | boolean | undefined>,
): void {
  const state = diagnosticsGlobal.__CV_DIAGNOSTICS__;
  if (!state || state.count >= MAX_DIAGNOSTICS_PER_PAGE) return;
  if (state.fingerprints.has(fingerprint)) return;

  const sent = trackDiagnostic(diagnostic, params);
  if (!sent) return;

  state.fingerprints.add(fingerprint);
  state.count += 1;
}

if (!diagnosticsGlobal.__CV_DIAGNOSTICS__) {
  diagnosticsGlobal.__CV_DIAGNOSTICS__ = {
    count: 0,
    fingerprints: new Set<string>(),
  };

  window.addEventListener(
    "error",
    (event: Event) => {
      if (event instanceof ErrorEvent) {
        const source = safePath(event.filename);
        const runtimeErrorType = errorType(event.error);
        const fingerprint = [
          "runtime",
          source,
          event.lineno,
          event.colno,
          runtimeErrorType,
        ].join(":");

        report("runtime_error", fingerprint, {
          source,
          line: event.lineno,
          column: event.colno,
          error_type: runtimeErrorType,
          section: currentSection(),
        });
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;

      const resource =
        target.getAttribute("src") ??
        target.getAttribute("href") ??
        target.getAttribute("data");
      const source = safePath(resource ?? "unknown");
      const element = target.tagName.toLowerCase();
      const fingerprint = ["resource", element, source].join(":");

      report("resource_error", fingerprint, {
        element,
        source,
        section: currentSection(),
      });
    },
    true,
  );

  window.addEventListener("unhandledrejection", (event) => {
    const reasonType = errorType(event.reason);

    report("unhandled_rejection", `rejection:${reasonType}`, {
      reason_type: reasonType,
      section: currentSection(),
    });
  });
}
