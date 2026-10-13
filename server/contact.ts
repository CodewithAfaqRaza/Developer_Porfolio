import { COUNTRY_CODES, BUDGET_OPTIONS, BUDGET_CURRENCY, CONTACT_RETENTION_DAYS } from "../shared/contact.ts";
import { deliverNotifications, notificationAddressConfigured, type NotificationEnv } from './notifications.ts';
/** Shared Cloudflare Pages/local handler. No browser code imports this module. */
export interface ContactResult {
  success: boolean;
  results?: Record<string, unknown>[];
  meta?: { changes?: number };
}

export interface ContactStatement {
  bind(...values: (string | number | null)[]): ContactStatement;
  run(): Promise<ContactResult>;
  first<T = Record<string, unknown>>(): Promise<T | null>;
}

export interface ContactDatabase {
  prepare(sql: string): ContactStatement;
  /** Must execute as one transaction, rolling back the entire batch on failure. */
  batch(statements: ContactStatement[]): Promise<ContactResult[]>;
}

export interface ContactEnv extends NotificationEnv {
  DB?: ContactDatabase;
  SITE_ORIGIN?: string;
  TURNSTILE_SITE_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;
  DATA_ENCRYPTION_KEY?: string;
  RATE_LIMIT_SECRET?: string;
  DEPLOYMENT_PLATFORM?: 'cloudflare' | 'vercel';
  /** Set only by the local adapter. Pages handlers always force this to false. */
  LOCAL_DEVELOPMENT?: boolean;
}

export const LOCAL_TURNSTILE_TOKEN = "local-development-only";
export const INQUIRY_RETENTION_DAYS = CONTACT_RETENTION_DAYS;
export const CONTACT_BODY_LIMIT = 16 * 1024;

const MINUTE = 60_000;
const DAY = 86_400_000;
const IP_WINDOW = 15 * MINUTE;
const GLOBAL_WINDOW = 60 * MINUTE;
const IP_LIMIT = 5;
const GLOBAL_LIMIT = 100;
const encoder = new TextEncoder();
const BUDGETS = new Set<string>(BUDGET_OPTIONS.map(([value]) => value));
const COUNTRIES = new Set(COUNTRY_CODES);
const BODY_FIELDS = new Set([
  "name",
  "email",
  "phone",
  "country",
  "kind",
  "description",
  "budget",
  "consent",
  "website",
  "turnstileToken",
]);

export interface Inquiry {
  name: string;
  email: string;
  /** Legacy fields accepted from cached clients; the current form does not collect them. */
  phone?: string | null;
  country: string;
  kind?: "project" | "collaboration";
  description: string;
  budget: string;
  budgetCurrency: "USD";
  consent: true;
  consentVersion: "contact-v1";
}

interface Configuration {
  database: ContactDatabase;
  origin: string;
  hostname: string;
  encryptionKey: Uint8Array<ArrayBuffer>;
  rateSecret: string;
  local: boolean;
  siteKey: string | null;
  turnstileSecret: string | null;
}

class RequestError extends Error {
  readonly status: number;
  readonly fields?: Record<string, string>;
  readonly retryAfter?: number;

  constructor(
    status: number,
    message: string,
    fields?: Record<string, string>,
    retryAfter?: number,
  ) {
    super(message);
    this.status = status;
    this.fields = fields;
    this.retryAfter = retryAfter;
  }
}

function response(
  body: Record<string, unknown>,
  status = 200,
  extraHeaders: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
      "Pragma": "no-cache",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'; base-uri 'none'",
      "Vary": "Origin",
      ...extraHeaders,
    },
  });
}

function unavailable(): RequestError {
  return new RequestError(503, "The contact form is temporarily unavailable. Please try again later.");
}

function errorResponse(error: unknown): Response {
  const safeError = error instanceof RequestError ? error : unavailable();
  const headers: Record<string, string> = {};
  if (safeError.retryAfter) headers["Retry-After"] = String(safeError.retryAfter);
  return response(
    {
      ok: false,
      error: safeError.message,
      ...(safeError.fields ? { fields: safeError.fields } : {}),
    },
    safeError.status,
    headers,
  );
}

function loopback(hostname: string): boolean {
  return ["localhost", "127.0.0.1", "[::1]"].includes(hostname);
}

function base64Bytes(value: string): Uint8Array<ArrayBuffer> {
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(value) || value.length % 4 !== 0) throw unavailable();
  const decoded = atob(value);
  return Uint8Array.from(decoded, (character) => character.charCodeAt(0));
}

function base64(value: Uint8Array<ArrayBuffer>): string {
  return btoa(String.fromCharCode(...value));
}

function testTurnstileKey(value: string): boolean {
  // All official dummy sitekeys/secrets begin with 1x/2x/3x followed by zeroes.
  return /^[123]x0{10,}/.test(value);
}

/** Also used by GET /api/contact/config; it never returns a secret. */
function configuration(request: Request, env: ContactEnv): Configuration {
  if (
    !env.DB ||
    typeof env.DB.prepare !== "function" ||
    typeof env.DB.batch !== "function" ||
    typeof env.SITE_ORIGIN !== "string" ||
    typeof env.DATA_ENCRYPTION_KEY !== "string" ||
    typeof env.RATE_LIMIT_SECRET !== "string" ||
    env.RATE_LIMIT_SECRET.length < 32 ||
    env.RATE_LIMIT_SECRET.length > 512
  ) throw unavailable();

  const target = new URL(request.url);
  const origin = new URL(env.SITE_ORIGIN);
  const local = env.LOCAL_DEVELOPMENT === true;
  if (
    env.SITE_ORIGIN !== origin.origin ||
    origin.username ||
    origin.password ||
    target.origin !== origin.origin ||
    (local
      ? !loopback(origin.hostname) || !loopback(target.hostname) || !["http:", "https:"].includes(origin.protocol)
      : origin.protocol !== "https:" || loopback(origin.hostname))
  ) throw unavailable();

  const encryptionKey = base64Bytes(env.DATA_ENCRYPTION_KEY);
  if (encryptionKey.length !== 32) throw unavailable();
  if (!local) {
    if (
      !env.TURNSTILE_SITE_KEY ||
      !env.TURNSTILE_SECRET_KEY ||
      !/^[A-Za-z0-9_-]{20,100}$/.test(env.TURNSTILE_SITE_KEY) ||
      !/^[A-Za-z0-9_-]{20,100}$/.test(env.TURNSTILE_SECRET_KEY) ||
      testTurnstileKey(env.TURNSTILE_SITE_KEY) ||
      testTurnstileKey(env.TURNSTILE_SECRET_KEY)
    ) throw unavailable();
  }
  return {
    database: env.DB,
    origin: origin.origin,
    hostname: origin.hostname,
    encryptionKey,
    rateSecret: env.RATE_LIMIT_SECRET,
    local,
    siteKey: local ? null : env.TURNSTILE_SITE_KEY!,
    turnstileSecret: local ? null : env.TURNSTILE_SECRET_KEY!,
  };
}

function checkOrigin(request: Request, config: Configuration, required: boolean): void {
  const origin = request.headers.get("Origin");
  if (
    request.headers.get("Sec-Fetch-Site") === "cross-site" ||
    (required && !origin) ||
    (origin !== null && origin !== config.origin) ||
    (config.local && origin !== null && !loopback(new URL(origin).hostname))
  ) throw new RequestError(403, "This request is not allowed.");
}

export async function handleConfig(request: Request, env: ContactEnv): Promise<Response> {
  if (request.method !== "GET") {
    return response({ ok: false, error: "Method not allowed." }, 405, { Allow: "GET" });
  }
  try {
    const config = configuration(request, env);
    checkOrigin(request, config, false);
    return response({ siteKey: config.siteKey, local: config.local, hosting: env.DEPLOYMENT_PLATFORM || 'cloudflare' });
  } catch (error) {
    return errorResponse(error);
  }
}

async function readJson(request: Request): Promise<Record<string, unknown>> {
  if (!/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(request.headers.get("Content-Type") ?? "")) {
    throw new RequestError(415, "Send the form as JSON.");
  }
  if (request.headers.has("Content-Encoding") && request.headers.get("Content-Encoding") !== "identity") {
    throw new RequestError(415, "Compressed request bodies are not supported.");
  }
  const declaredLength = request.headers.get("Content-Length");
  if (declaredLength !== null) {
    if (!/^\d+$/.test(declaredLength)) throw new RequestError(400, "Invalid request.");
    if (Number(declaredLength) > CONTACT_BODY_LIMIT) throw new RequestError(413, "The form is too large.");
  }
  if (!request.body) throw new RequestError(400, "The form is empty.");

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  let deadline: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    deadline = setTimeout(() => reject(new RequestError(408, "The request took too long. Please try again.")), 5000);
  });
  try {
    while (true) {
      const chunk = await Promise.race([reader.read(), timeout]);
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > CONTACT_BODY_LIMIT) throw new RequestError(413, "The form is too large.");
      chunks.push(chunk.value);
    }
  } finally {
    if (deadline) clearTimeout(deadline);
    void reader.cancel().catch(() => undefined);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    const data: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
    if (typeof data !== "object" || data === null || Array.isArray(data)) throw new Error();
    return data as Record<string, unknown>;
  } catch {
    throw new RequestError(400, "The form contains invalid JSON.");
  }
}

function text(value: unknown): string | null {
  return typeof value === "string" ? value.normalize("NFC").trim() : null;
}

function validate(data: Record<string, unknown>): { inquiry: Inquiry; token: string } {
  if (Object.keys(data).some((key) => !BODY_FIELDS.has(key))) {
    throw new RequestError(400, "The form contains unexpected fields.");
  }
  if (typeof data.website !== "string" || data.website.trim() !== "") {
    throw new RequestError(400, "The request could not be accepted.");
  }
  const fields: Record<string, string> = {};
  const name = text(data.name);
  const email = text(data.email);
  const phone = data.phone === undefined ? "" : text(data.phone);
  const country = text(data.country);
  const description = text(data.description)?.replace(/\r\n?/g, "\n") ?? null;
  const budget = text(data.budget);
  const control = /[\u0000-\u001f\u007f-\u009f]/;
  const emailLocal = email?.split("@")[0];
  if (!name || name.length < 2 || name.length > 100 || control.test(name) || /[<>]/.test(name)) {
    fields.name = "Enter a name between 2 and 100 characters.";
  }
  if (
    !email || email.length > 254 || control.test(email) ||
    emailLocal?.startsWith(".") || emailLocal?.endsWith(".") || emailLocal?.includes("..") ||
    !/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]{1,64}@[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?\.[A-Za-z]{2,63}$/.test(email) ||
    email.split("@")[1]?.split(".").some((label) => !label || label.length > 63 || label.startsWith("-") || label.endsWith("-"))
  ) fields.email = "Enter a valid email address.";
  if (
    phone === null || (phone !== "" && (
      phone.length > 35 || !/^\+?[0-9 ()\-.]+$/.test(phone) ||
      phone.replace(/\D/g, "").length < 7 || phone.replace(/\D/g, "").length > 15
    ))
  ) fields.phone = "Enter a valid phone number, or leave it blank.";
  if (!country || !COUNTRIES.has(country)) fields.country = "Select your country.";
  if (data.kind !== undefined && data.kind !== "project" && data.kind !== "collaboration") fields.kind = "Select a project or collaboration.";
  if (
    !description || description.length < 20 || description.length > 2000 ||
    /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f]/.test(description)
  ) fields.description = "Describe your idea in 20 to 2,000 characters.";
  if (!budget || !BUDGETS.has(budget)) fields.budget = "Select a budget range.";
  if (data.consent !== true) fields.consent = "Please agree to being contacted about your inquiry.";
  if (Object.keys(fields).length) throw new RequestError(422, "Please check the highlighted fields.", fields);
  if (
    typeof data.turnstileToken !== "string" ||
    !data.turnstileToken ||
    data.turnstileToken.length > 2048 ||
    control.test(data.turnstileToken)
  ) throw new RequestError(400, "Complete the security check and try again.");

  const separator = email!.lastIndexOf("@");
  return {
    inquiry: {
      name: name!,
      email: email!.slice(0, separator + 1) + email!.slice(separator + 1).toLowerCase(),
      ...(data.phone !== undefined ? { phone: phone || null } : {}),
      country: country!,
      ...(data.kind !== undefined ? { kind: data.kind as Inquiry["kind"] } : {}),
      description: description!,
      budget: budget!,
      budgetCurrency: BUDGET_CURRENCY,
      consent: true,
      consentVersion: "contact-v1",
    },
    token: data.turnstileToken,
  };
}

function clientIp(request: Request, config: Configuration): string {
  if (config.local) return "local-development";
  // Cloudflare sets this header. Never use client-controlled X-Forwarded-For.
  const ip = request.headers.get("CF-Connecting-IP");
  if (!ip || ip.length > 45 || !/^[0-9a-fA-F:.]+$/.test(ip)) throw unavailable();
  return ip.toLowerCase();
}

async function consumeRateLimit(config: Configuration, ip: string, now: number): Promise<void> {
  const key = await crypto.subtle.importKey(
    "raw", encoder.encode(config.rateSecret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const digest = new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(ip)));
  const ipKey = "ip:" + Array.from(digest, (byte) => byte.toString(16).padStart(2, "0")).join("");
  const db = config.database;
  const results = await db.batch([
    db.prepare(`
      INSERT INTO contact_rate_limits (key, attempts, expires_at)
      SELECT ?, 1, ?
      WHERE COALESCE((SELECT attempts FROM contact_rate_limits WHERE key = ? AND expires_at > ?), 0) <= ?
      ON CONFLICT(key) DO UPDATE SET
        attempts = CASE WHEN contact_rate_limits.expires_at <= ? THEN 1 ELSE MIN(contact_rate_limits.attempts + 1, ?) END,
        expires_at = CASE WHEN contact_rate_limits.expires_at <= ? THEN excluded.expires_at ELSE contact_rate_limits.expires_at END
      RETURNING attempts, expires_at
    `).bind(ipKey, now + IP_WINDOW, "global", now, GLOBAL_LIMIT, now, IP_LIMIT + 1, now),
    db.prepare(`
      INSERT INTO contact_rate_limits (key, attempts, expires_at)
      SELECT ?, 1, ?
      WHERE (SELECT attempts FROM contact_rate_limits WHERE key = ? AND expires_at > ?) <= ?
      ON CONFLICT(key) DO UPDATE SET
        attempts = CASE WHEN contact_rate_limits.expires_at <= ? THEN 1 ELSE MIN(contact_rate_limits.attempts + 1, ?) END,
        expires_at = CASE WHEN contact_rate_limits.expires_at <= ? THEN excluded.expires_at ELSE contact_rate_limits.expires_at END
      RETURNING attempts, expires_at
    `).bind("global", now + GLOBAL_WINDOW, ipKey, now, IP_LIMIT, now, GLOBAL_LIMIT + 1, now),
  ]);
  if (results.length !== 2 || results.some((result) => result.success !== true)) throw unavailable();
  const perIp = results[0].results?.[0];
  const global = results[1].results?.[0];
  if (!perIp) throw new RequestError(429, "The form is busy. Please try again later.", undefined, 3600);
  if (typeof perIp.attempts !== "number" || typeof perIp.expires_at !== "number") throw unavailable();
  if (perIp.attempts > IP_LIMIT) {
    throw new RequestError(429, "Too many attempts. Please try again in 15 minutes.", undefined, Math.max(1, Math.ceil((perIp.expires_at - now) / 1000)));
  }
  if (!global || typeof global.attempts !== "number" || typeof global.expires_at !== "number") throw unavailable();
  if (global.attempts > GLOBAL_LIMIT) {
    throw new RequestError(429, "The form is busy. Please try again later.", undefined, Math.max(1, Math.ceil((global.expires_at - now) / 1000)));
  }
}

async function verifyTurnstile(token: string, config: Configuration, ip: string): Promise<void> {
  if (config.local) {
    if (token !== LOCAL_TURNSTILE_TOKEN) throw new RequestError(400, "Complete the security check and try again.");
    return;
  }
  if (token === LOCAL_TURNSTILE_TOKEN || token === "XXXX.DUMMY.TOKEN.XXXX") {
    throw new RequestError(400, "Complete the security check and try again.");
  }
  const controller = new AbortController();
  const deadline = setTimeout(() => controller.abort(), 5000);
  try {
    const result = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: config.turnstileSecret, response: token, remoteip: ip }),
      signal: controller.signal,
      redirect: "error",
    });
    if (!result.ok) throw unavailable();
    const validation: unknown = await result.json();
    if (typeof validation !== "object" || validation === null || Array.isArray(validation)) throw unavailable();
    const check = validation as Record<string, unknown>;
    if (check.success !== true) {
      if (Array.isArray(check["error-codes"]) && check["error-codes"].some((code) =>
        ["internal-error", "missing-input-secret", "invalid-input-secret"].includes(String(code)),
      )) throw unavailable();
      throw new RequestError(400, "The security check expired or failed. Please complete it again.");
    }
    const challengeTime = typeof check.challenge_ts === "string" ? Date.parse(check.challenge_ts) : NaN;
    const age = Date.now() - challengeTime;
    if (
      check.action !== "contact" || check.hostname !== config.hostname ||
      !Number.isFinite(challengeTime) || age > 5 * MINUTE || age < -MINUTE
    ) throw new RequestError(400, "The security check expired or failed. Please complete it again.");
  } catch (error) {
    if (error instanceof RequestError) throw error;
    throw unavailable();
  } finally {
    clearTimeout(deadline);
  }
}

async function encryptInquiry(inquiry: Inquiry, config: Configuration, id: string, createdAt: number): Promise<string> {
  const key = await crypto.subtle.importKey("raw", config.encryptionKey, "AES-GCM", false, ["encrypt"]);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv, additionalData: encoder.encode(`${id}:${createdAt}`), tagLength: 128 },
    key,
    encoder.encode(JSON.stringify(inquiry)),
  );
  return JSON.stringify({ v: 1, iv: base64(iv), ciphertext: base64(new Uint8Array(ciphertext)) });
}

/** Owner tooling and authenticated admin reads only; never expose an unauthenticated decryption endpoint. */
export async function decryptInquiryPayload(payload: string, encryptionKey: string, id: string, createdAt: number): Promise<unknown> {
  const envelope = JSON.parse(payload) as Record<string, unknown>;
  if (envelope.v !== 1 || typeof envelope.iv !== "string" || typeof envelope.ciphertext !== "string") {
    throw new Error("Unsupported inquiry envelope.");
  }
  const bytes = base64Bytes(encryptionKey);
  const iv = base64Bytes(envelope.iv);
  if (bytes.length !== 32 || iv.length !== 12) throw new Error("Invalid decryption key or envelope.");
  const key = await crypto.subtle.importKey("raw", bytes, "AES-GCM", false, ["decrypt"]);
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv, additionalData: encoder.encode(`${id}:${createdAt}`), tagLength: 128 },
    key,
    base64Bytes(envelope.ciphertext),
  );
  return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(decrypted));
}

export async function handleContact(request: Request, env: ContactEnv): Promise<Response> {
  if (request.method !== "POST") {
    return response({ ok: false, error: "Method not allowed." }, 405, { Allow: "POST" });
  }
  try {
    const config = configuration(request, env);
    checkOrigin(request, config, true);
    const ip = clientIp(request, config);
    await consumeRateLimit(config, ip, Date.now());
    const { inquiry, token } = validate(await readJson(request));
    await verifyTurnstile(token, config, ip);
    const id = crypto.randomUUID();
    const createdAt = Date.now();
    const payload = await encryptInquiry(inquiry, config, id, createdAt);
    // Indexed bounded cleanup runs together with storage. Any failure rolls back.
    const statements = [
      config.database.prepare(`
        DELETE FROM contact_inquiries WHERE id IN (
          SELECT id FROM contact_inquiries WHERE created_at < ? ORDER BY created_at LIMIT 500
        )
      `).bind(createdAt - INQUIRY_RETENTION_DAYS * DAY),
      config.database.prepare(`
        DELETE FROM contact_rate_limits WHERE key IN (
          SELECT key FROM contact_rate_limits WHERE expires_at < ? ORDER BY expires_at LIMIT 500
        )
      `).bind(createdAt - DAY),
      config.database.prepare("INSERT INTO contact_inquiries (id, created_at, payload) VALUES (?, ?, ?)").bind(id, createdAt, payload),
    ];
    if (notificationAddressConfigured(env)) statements.push(config.database.prepare(
      'INSERT INTO contact_notifications (inquiry_id, created_at, next_attempt_at) VALUES (?, ?, ?)'
    ).bind(id, createdAt, createdAt));
    const results = await config.database.batch(statements);
    if (results.length !== statements.length || results.some((result) => result.success !== true)) throw unavailable();
    try { await deliverNotifications(config.database, env, id); }
    catch { /* Submission is saved; a notification failure must not cause resubmission. */ }
    return response({ ok: true, reference: id }, 201);
  } catch (error) {
    // No request body, identifiers, IP, secrets, or database errors are logged.
    return errorResponse(error);
  }
}
