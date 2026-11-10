"use client";

import { useReportWebVitals } from "next/web-vitals";
import { trackGoal } from "./yandexMetrica";

type ReportWebVitals = Parameters<typeof useReportWebVitals>[0];

const reportWebVitals: ReportWebVitals = (metric) => {
  const value = metric.name === "CLS"
    ? Math.round(metric.value * 10_000) / 10_000
    : Math.round(metric.value);

  trackGoal("web_vital", {
    metric: metric.name,
    value,
    delta: metric.name === "CLS"
      ? Math.round(metric.delta * 10_000) / 10_000
      : Math.round(metric.delta),
    rating: metric.rating,
    navigation_type: metric.navigationType,
  });
};

export function WebVitals() {
  useReportWebVitals(reportWebVitals);
  return null;
}

