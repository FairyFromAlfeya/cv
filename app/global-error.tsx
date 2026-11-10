"use client";

import { useEffect } from "react";
import { trackDiagnostic } from "@/components/analytics/yandexMetrica";

export default function GlobalError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    trackDiagnostic("react_error_boundary", {
      scope: "root",
      error_type: error instanceof Error ? "Error" : typeof error,
    });
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#272727", color: "white", fontFamily: "system-ui, sans-serif" }}>
        <title>Website error</title>
        <main style={{ display: "grid", minHeight: "100vh", placeItems: "center", padding: 24, textAlign: "center" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 32, textTransform: "uppercase" }}>Something went wrong</h1>
            <p style={{ marginTop: 16, opacity: 0.7 }}>Что-то пошло не так. Попробуйте ещё раз.</p>
            <button
              type="button"
              onClick={retry}
              style={{
                minHeight: 44,
                marginTop: 24,
                border: 0,
                background: "#f3ca2f",
                color: "#202020",
                cursor: "pointer",
                fontWeight: 700,
                padding: "10px 24px",
              }}
            >
              Try again / Повторить
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
