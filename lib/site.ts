import "server-only";

export const SITE_NAME = "Alexander — Full-Stack & Solidity Developer";
export const SITE_SHORT_NAME = "Alexander CV";

const LOCAL_SITE_URL = "http://localhost:3000";

function isLoopback(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
}

export function getSiteUrl(): URL {
  const configuredUrl =
    process.env.SITE_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_URL ??
    process.env.CF_PAGES_URL ??
    process.env.RENDER_EXTERNAL_URL ??
    process.env.URL;

  if (!configuredUrl) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SITE_URL must contain the public HTTPS origin in production.");
    }

    return new URL(LOCAL_SITE_URL);
  }

  const url = new URL(
    configuredUrl.startsWith("http://") || configuredUrl.startsWith("https://")
      ? configuredUrl
      : `https://${configuredUrl}`,
  );

  if (process.env.NODE_ENV === "production" && url.protocol !== "https:" && !isLoopback(url.hostname)) {
    throw new Error("SITE_URL must use HTTPS in production.");
  }

  if (url.pathname !== "/" || url.search || url.hash) {
    throw new Error("SITE_URL must be an origin without a path, query, or hash.");
  }

  return new URL(url.origin);
}

export function getAbsoluteUrl(pathname = "/"): string {
  return new URL(pathname, getSiteUrl()).toString();
}
