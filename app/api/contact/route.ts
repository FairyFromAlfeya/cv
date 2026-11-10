import { Resend } from "resend";

const CONTACT_EMAIL = "fairyfromalfeya@gmail.com";
const DEFAULT_FROM_EMAIL = "CV Website <onboarding@resend.dev>";
const MAX_REQUEST_LENGTH = 8_000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;
const SUBMISSION_ID_PATTERN = /^[a-zA-Z0-9_-]{8,128}$/u;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1_000;
const RATE_LIMIT_MAX_REQUESTS = 5;

const contactRateLimits = new Map<string, { count: number; resetAt: number }>();

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  subject?: unknown;
  message?: unknown;
  website?: unknown;
  submissionId?: unknown;
};

function requiredString(value: unknown, maxLength: number) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.length <= maxLength ? trimmed : null;
}

function optionalString(value: unknown, maxLength: number) {
  if (value === undefined || value === null || value === "") return "";
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length <= maxLength ? trimmed : null;
}

function jsonError(status: number, headers?: HeadersInit) {
  return Response.json({ ok: false }, { status, headers });
}

function hasValidOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  try {
    const expectedHost = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? new URL(request.url).host;
    return new URL(origin).host === expectedHost;
  } catch {
    return false;
  }
}

function getClientIdentifier(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

function getRateLimitReset(request: Request) {
  const now = Date.now();
  const identifier = getClientIdentifier(request);

  if (contactRateLimits.size > 1_000) {
    contactRateLimits.forEach((entry, key) => {
      if (entry.resetAt <= now) contactRateLimits.delete(key);
    });
  }

  const current = contactRateLimits.get(identifier);
  if (!current || current.resetAt <= now) {
    contactRateLimits.set(identifier, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return null;
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) return current.resetAt;
  current.count += 1;
  return null;
}

async function readContactPayload(request: Request): Promise<{ payload: ContactPayload } | { error: number }> {
  if (!request.body) return { error: 400 };

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let byteLength = 0;
  let rawBody = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    byteLength += value.byteLength;
    if (byteLength > MAX_REQUEST_LENGTH) {
      await reader.cancel();
      return { error: 413 };
    }

    rawBody += decoder.decode(value, { stream: true });
  }

  rawBody += decoder.decode();

  try {
    return { payload: JSON.parse(rawBody) as ContactPayload };
  } catch {
    return { error: 400 };
  }
}

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return jsonError(415);
  if (!hasValidOrigin(request)) return jsonError(403);

  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(declaredLength) && declaredLength > MAX_REQUEST_LENGTH) return jsonError(413);

  const parsedBody = await readContactPayload(request);
  if ("error" in parsedBody) return jsonError(parsedBody.error);
  const { payload } = parsedBody;

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return jsonError(400);

  const website = optionalString(payload.website, 200);
  if (website === null) return jsonError(400);
  if (website) return Response.json({ ok: true });

  const name = requiredString(payload.name, 100);
  const email = requiredString(payload.email, 254);
  const subject = optionalString(payload.subject, 150);
  const message = requiredString(payload.message, 5_000);
  const submissionId = requiredString(payload.submissionId, 128);

  if (
    !name ||
    !email ||
    !EMAIL_PATTERN.test(email) ||
    subject === null ||
    !message ||
    !submissionId ||
    !SUBMISSION_ID_PATTERN.test(submissionId)
  ) {
    return jsonError(400);
  }

  const rateLimitReset = getRateLimitReset(request);
  if (rateLimitReset) {
    const retryAfter = Math.max(1, Math.ceil((rateLimitReset - Date.now()) / 1_000));
    return jsonError(429, { "Retry-After": String(retryAfter) });
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.error("Contact email is not configured: RESEND_API_KEY is missing.");
    return jsonError(503);
  }

  const safeName = name.replace(/[\r\n]+/gu, " ");
  const safeSubject = subject.replace(/[\r\n]+/gu, " ");
  const emailSubject = safeSubject || `CV website message from ${safeName}`;
  const emailText = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Subject: ${subject || "Not provided"}`,
    "",
    "Message:",
    message,
  ].join("\n");

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send(
      {
        from: process.env.RESEND_FROM_EMAIL?.trim() || DEFAULT_FROM_EMAIL,
        to: CONTACT_EMAIL,
        replyTo: email,
        subject: emailSubject,
        text: emailText,
      },
      {
        idempotencyKey: `cv-contact/${submissionId}`,
        signal: AbortSignal.timeout(10_000),
      },
    );

    if (error || !data) {
      console.error("Contact email delivery failed.", error);
      return jsonError(502);
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Contact email delivery failed.", error);
    return jsonError(502);
  }
}
