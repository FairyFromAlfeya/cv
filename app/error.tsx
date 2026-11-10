"use client";

import { useEffect } from "react";
import { trackDiagnostic } from "@/components/analytics/yandexMetrica";

function safeErrorType(error: unknown): string {
  if (!(error instanceof Error)) return typeof error;
  return ["AggregateError", "Error", "RangeError", "ReferenceError", "SyntaxError", "TypeError", "URIError"]
    .includes(error.name)
    ? error.name
    : "Error";
}

export default function ErrorPage({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    trackDiagnostic("react_error_boundary", {
      scope: "page",
      error_type: safeErrorType(error),
    });
  }, [error]);

  return (
    <main className="grid min-h-screen place-items-center bg-[#272727] px-6 text-center text-white">
      <div>
        <h1 className="text-3xl font-semibold uppercase">Something went wrong</h1>
        <p className="mt-4 text-sm text-white/70">Что-то пошло не так. Попробуйте загрузить страницу ещё раз.</p>
        <button
          type="button"
          onClick={retry}
          className="mt-8 min-h-11 bg-[#f3ca2f] px-6 font-semibold text-[#202020] focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          Try again / Повторить
        </button>
      </div>
    </main>
  );
}
