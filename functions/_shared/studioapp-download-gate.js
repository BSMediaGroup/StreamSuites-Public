const COOKIE_NAME = "ss_studioapp_download_access";
const COOKIE_VERSION = "v1";
const DEFAULT_TTL_MINUTES = 15;
const MIN_TTL_MINUTES = 1;
const MAX_TTL_MINUTES = 60;
const MANIFEST_URL = "https://updates.streamsuites.app/studioapp/windows-x64/alpha/manifest.json";
const EXPECTED_PRODUCT = "StreamSuites StudioApp";
const EXPECTED_CHANNEL = "alpha";
const EXPECTED_ARCHITECTURE = "windows-x64";
const EXPECTED_INSTALLER_HOST = "updates.streamsuites.app";
const encoder = new TextEncoder();

export function parseBoolean(value, fallback = false) {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (["true", "1", "yes", "on"].includes(normalized)) return true;
  if (["false", "0", "no", "off"].includes(normalized)) return false;
  return fallback;
}

export function readDownloadAccessConfig(env = {}) {
  const locked = parseBoolean(env.DOWNLOAD_ACCESS_LOCKED, false);
  const bypassEnabled = locked && parseBoolean(env.DOWNLOAD_BYPASS_ENABLED, false);
  const parsedTtl = Number.parseInt(String(env.DOWNLOAD_BYPASS_TTL_MINUTES ?? ""), 10);
  const ttlMinutes = Number.isFinite(parsedTtl) && parsedTtl >= MIN_TTL_MINUTES && parsedTtl <= MAX_TTL_MINUTES
    ? parsedTtl
    : DEFAULT_TTL_MINUTES;
  return Object.freeze({
    locked,
    message: String(env.DOWNLOAD_ACCESS_MESSAGE || "StudioApp ALPHA downloads are temporarily limited to approved testers.").trim().slice(0, 500),
    bypassEnabled,
    bypassCode: String(env.DOWNLOAD_BYPASS_CODE || ""),
    ttlMinutes,
    showBanner: locked && parseBoolean(env.SHOW_DOWNLOAD_LOCKOUT_BANNER, false),
  });
}

function base64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function signingKey(secret) {
  const material = await crypto.subtle.digest("SHA-256", encoder.encode(`streamsuites:studioapp-download:${COOKIE_VERSION}:${secret}`));
  return crypto.subtle.importKey("raw", material, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
}

async function signAssertion(assertion, secret) {
  const key = await signingKey(secret);
  return base64Url(new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(assertion))));
}

function constantTimeEqual(left, right) {
  const a = encoder.encode(String(left));
  const b = encoder.encode(String(right));
  let difference = a.length ^ b.length;
  const length = Math.max(a.length, b.length);
  for (let index = 0; index < length; index += 1) difference |= (a[index % Math.max(1, a.length)] || 0) ^ (b[index % Math.max(1, b.length)] || 0);
  return difference === 0;
}

export async function safeCodeEqual(submitted, configured) {
  const [left, right] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(String(submitted))),
    crypto.subtle.digest("SHA-256", encoder.encode(String(configured))),
  ]);
  return constantTimeEqual(base64Url(new Uint8Array(left)), base64Url(new Uint8Array(right)));
}

function cookieMap(request) {
  return new Map(String(request.headers.get("Cookie") || "").split(";").map((entry) => {
    const separator = entry.indexOf("=");
    return separator < 0 ? [entry.trim(), ""] : [entry.slice(0, separator).trim(), entry.slice(separator + 1).trim()];
  }).filter(([name]) => name));
}

export async function createAccessCookie(config, now = Date.now()) {
  const expiresAt = Math.floor(now / 1000) + config.ttlMinutes * 60;
  const assertion = `${COOKIE_VERSION}.${expiresAt}`;
  const signature = await signAssertion(assertion, config.bypassCode);
  return {
    value: `${assertion}.${signature}`,
    expiresAt: new Date(expiresAt * 1000).toISOString(),
    header: `${COOKIE_NAME}=${assertion}.${signature}; Max-Age=${config.ttlMinutes * 60}; Path=/api/downloads/studioapp; HttpOnly; Secure; SameSite=Lax`,
  };
}

export async function verifyAccessCookie(request, config, now = Date.now()) {
  if (!config.locked) return true;
  if (!config.bypassEnabled || !config.bypassCode) return false;
  const raw = cookieMap(request).get(COOKIE_NAME) || "";
  const parts = raw.split(".");
  if (parts.length !== 3 || parts[0] !== COOKIE_VERSION || !/^\d{10,12}$/.test(parts[1]) || !parts[2]) return false;
  const expiresAt = Number(parts[1]);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= Math.floor(now / 1000)) return false;
  const expected = await signAssertion(`${parts[0]}.${parts[1]}`, config.bypassCode);
  return constantTimeEqual(parts[2], expected);
}

export function clearAccessCookieHeader() {
  return `${COOKIE_NAME}=; Max-Age=0; Path=/api/downloads/studioapp; HttpOnly; Secure; SameSite=Lax`;
}

export function assertSameOrigin(request) {
  const origin = request.headers.get("Origin");
  if (!origin) throw new Error("missing_origin");
  if (origin !== new URL(request.url).origin) throw new Error("cross_origin_request");
}

export async function readBoundedCode(request) {
  const length = Number(request.headers.get("Content-Length") || 0);
  if (Number.isFinite(length) && length > 1024) throw new Error("request_too_large");
  const text = await request.text();
  if (text.length > 1024) throw new Error("request_too_large");
  let payload;
  try { payload = JSON.parse(text || "{}"); } catch { throw new Error("invalid_request"); }
  const code = typeof payload?.code === "string" ? payload.code : "";
  if (!code || code.length > 256) throw new Error("invalid_request");
  return code;
}

export function jsonResponse(payload, status = 200, extraHeaders = {}) {
  return Response.json(payload, { status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", ...extraHeaders } });
}

export async function fetchValidatedManifest(fetchImpl = fetch) {
  const options = { headers: { Accept: "application/json" }, redirect: "error" };
  if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") options.signal = AbortSignal.timeout(5000);
  const response = await fetchImpl(MANIFEST_URL, options);
  if (!response.ok) throw new Error("manifest_unavailable");
  const contentType = String(response.headers.get("Content-Type") || "").toLowerCase();
  if (!contentType.includes("application/json")) throw new Error("manifest_invalid");
  const manifest = await response.json();
  if (manifest?.schema_version !== 1 || manifest?.product !== EXPECTED_PRODUCT || manifest?.channel !== EXPECTED_CHANNEL || manifest?.architecture !== EXPECTED_ARCHITECTURE) throw new Error("manifest_invalid");
  if (typeof manifest.version !== "string" || !manifest.version || manifest.version.length > 64 || typeof manifest.build !== "string" || !manifest.build || manifest.build.length > 64) throw new Error("manifest_invalid");
  if (!Number.isSafeInteger(manifest.installer_size) || manifest.installer_size <= 0 || !/^[a-f0-9]{64}$/i.test(String(manifest.installer_sha256 || ""))) throw new Error("manifest_invalid");
  if (!/^[A-Za-z0-9._-]+\.exe$/.test(String(manifest.installer_filename || ""))) throw new Error("manifest_invalid");
  const installer = new URL(String(manifest.installer_url || ""));
  if (installer.protocol !== "https:" || installer.hostname !== EXPECTED_INSTALLER_HOST || installer.username || installer.password || installer.search || installer.hash || !installer.pathname.startsWith("/studioapp/windows-x64/releases/") || !installer.pathname.endsWith(`/${manifest.installer_filename}`)) throw new Error("manifest_invalid");
  let releaseNotesUrl = null;
  if (manifest.release_notes_url) {
    const notes = new URL(String(manifest.release_notes_url));
    if (notes.protocol === "https:" && ["updates.streamsuites.app", "streamsuites.app", "docs.streamsuites.app"].includes(notes.hostname)) releaseNotesUrl = notes.toString();
  }
  return Object.freeze({
    installerUrl: installer.toString(),
    publicMetadata: {
      version: manifest.version,
      build: manifest.build,
      architecture: EXPECTED_ARCHITECTURE,
      installer_filename: manifest.installer_filename,
      installer_size: manifest.installer_size,
      installer_sha256: String(manifest.installer_sha256).toLowerCase(),
      published_at: typeof manifest.published_at === "string" ? manifest.published_at : null,
      signed: manifest.signed === true,
      signature_subject: manifest.signed === true && typeof manifest.signature_subject === "string" ? manifest.signature_subject.slice(0, 256) : null,
      title: typeof manifest.title === "string" ? manifest.title.slice(0, 160) : "StudioApp ALPHA",
      summary: typeof manifest.summary === "string" ? manifest.summary.slice(0, 2000) : "",
      release_notes_url: releaseNotesUrl,
    },
  });
}
