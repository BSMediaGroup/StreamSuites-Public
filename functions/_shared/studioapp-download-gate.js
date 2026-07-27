const COOKIE_NAME = "ss_studioapp_download_access";
const COOKIE_VERSION = "v1";
const DEFAULT_TTL_MINUTES = 15;
const MIN_TTL_MINUTES = 1;
const MAX_TTL_MINUTES = 60;
const PRODUCT_MANIFEST_URL = "https://updates.streamsuites.app/studioapp/windows-x64/alpha/product-manifest.json";
const LEGACY_MANIFEST_URL = "https://updates.streamsuites.app/studioapp/windows-x64/alpha/manifest.json";
const PRODUCT_MANIFEST_KEY = "studioapp/windows-x64/alpha/product-manifest.json";
const LEGACY_MANIFEST_KEY = "studioapp/windows-x64/alpha/manifest.json";
const UPDATES_BUCKET_BINDING = "STREAMSUITES_UPDATES_BUCKET";
const HTTP_FALLBACK_FLAG = "STUDIOAPP_MANIFEST_HTTP_FALLBACK_ENABLED";
const EXPECTED_PRODUCT = "StreamSuites StudioApp";
const EXPECTED_PRODUCT_ID = "streamsuites-studioapp";
const EXPECTED_CHANNEL = "alpha";
const EXPECTED_ARCHITECTURE = "windows-x64";
const EXPECTED_INSTALLER_HOST = "updates.streamsuites.app";
const MANIFEST_TIMEOUT_MS = 5000;
const MAX_MANIFEST_BYTES = 1024 * 1024;
const encoder = new TextEncoder();

export function parseBoolean(value, fallback = false) {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (["true", "1", "yes", "on"].includes(normalized)) return true;
  if (["false", "0", "no", "off"].includes(normalized)) return false;
  return fallback;
}

export function readDownloadAccessConfig(env = {}) {
  const locked = parseBoolean(env.DOWNLOAD_ACCESS_LOCKED, true);
  const bypassEnabled = locked && parseBoolean(env.DOWNLOAD_BYPASS_ENABLED, false);
  const parsedTtl = Number.parseInt(String(env.DOWNLOAD_BYPASS_TTL_MINUTES ?? ""), 10);
  const ttlMinutes = Number.isFinite(parsedTtl) && parsedTtl >= MIN_TTL_MINUTES && parsedTtl <= MAX_TTL_MINUTES
    ? parsedTtl
    : DEFAULT_TTL_MINUTES;
  const requiredVariables = [
    "DOWNLOAD_ACCESS_LOCKED",
    "DOWNLOAD_ACCESS_MESSAGE",
    "DOWNLOAD_BYPASS_ENABLED",
    "DOWNLOAD_BYPASS_TTL_MINUTES",
    "SHOW_DOWNLOAD_LOCKOUT_BANNER",
  ];
  const missingVariables = requiredVariables.filter((name) => !String(env[name] ?? "").trim());
  if (locked && bypassEnabled && !String(env.DOWNLOAD_BYPASS_CODE || "")) missingVariables.push("DOWNLOAD_BYPASS_CODE");
  const invalidVariables = [
    ...["DOWNLOAD_ACCESS_LOCKED", "DOWNLOAD_BYPASS_ENABLED", "SHOW_DOWNLOAD_LOCKOUT_BANNER"].filter((name) => {
      const value = String(env[name] ?? "").trim().toLowerCase();
      return value && !["1", "true", "yes", "on", "0", "false", "no", "off"].includes(value);
    }),
    ...(!missingVariables.includes("DOWNLOAD_BYPASS_TTL_MINUTES") &&
      (!Number.isSafeInteger(parsedTtl) || parsedTtl < MIN_TTL_MINUTES || parsedTtl > MAX_TTL_MINUTES)
      ? ["DOWNLOAD_BYPASS_TTL_MINUTES"] : []),
  ];
  return Object.freeze({
    locked,
    message: String(env.DOWNLOAD_ACCESS_MESSAGE || "StudioApp ALPHA downloads are temporarily limited to approved testers.").trim().slice(0, 500),
    bypassEnabled,
    bypassCode: String(env.DOWNLOAD_BYPASS_CODE || ""),
    ttlMinutes,
    showBanner: locked && parseBoolean(env.SHOW_DOWNLOAD_LOCKOUT_BANNER, false),
    missingVariables: Object.freeze(missingVariables),
    invalidVariables: Object.freeze(invalidVariables),
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

function manifestError(category) {
  const error = new Error(category);
  error.category = category;
  return error;
}

async function readManifestResponse(response, prefix) {
  if (!response?.ok) throw manifestError(`${prefix}_http_status`);
  const contentType = String(response.headers.get("Content-Type") || "").toLowerCase();
  if (!contentType.includes("application/json")) throw manifestError(`${prefix}_content_type`);
  const text = await response.text();
  if (encoder.encode(text).byteLength > MAX_MANIFEST_BYTES) throw manifestError(`${prefix}_contract_failed`);
  try {
    return JSON.parse(text);
  } catch {
    throw manifestError(`${prefix}_parse_failed`);
  }
}

function boundedString(value, maximum = 64) {
  return typeof value === "string" && value.length > 0 && value.length <= maximum ? value : null;
}

function updateObjectSegment(value) {
  let result = "";
  for (const byte of encoder.encode(value)) {
    result += (byte >= 65 && byte <= 90) || (byte >= 97 && byte <= 122) ||
      (byte >= 48 && byte <= 57) || byte === 46 || byte === 45
      ? String.fromCharCode(byte)
      : `_${byte.toString(16).padStart(2, "0")}`;
  }
  return result;
}

function validateManifest(manifest, source) {
  const productManifest = source === "product";
  if (!manifest || typeof manifest !== "object") throw manifestError("manifest_invalid");
  if (productManifest && manifest.schema_version !== 2) throw manifestError("product_manifest_unsupported");
  if (!productManifest && manifest.schema_version !== 1) throw manifestError("legacy_manifest_unsupported");
  if (productManifest && manifest.product_id !== EXPECTED_PRODUCT_ID) throw manifestError("manifest_product_mismatch");
  if (!productManifest && manifest.product_id != null && manifest.product_id !== EXPECTED_PRODUCT_ID) throw manifestError("manifest_product_mismatch");
  if (manifest.product !== EXPECTED_PRODUCT || manifest.channel !== EXPECTED_CHANNEL || manifest.architecture !== EXPECTED_ARCHITECTURE) throw manifestError("manifest_contract_mismatch");
  if (!boundedString(manifest.version) || !boundedString(manifest.build)) throw manifestError("manifest_version_invalid");
  for (const name of ["system_version", "system_build", "source_revision", "published_at"]) {
    if (manifest[name] != null && !boundedString(manifest[name], name === "source_revision" ? 80 : 128)) throw manifestError("manifest_metadata_invalid");
  }
  for (const name of ["release_epoch", "product_version_epoch", "package_provenance_version"]) {
    if (manifest[name] != null && (!Number.isSafeInteger(manifest[name]) || manifest[name] < 0)) throw manifestError("manifest_metadata_invalid");
  }
  if (manifest.published_at != null && Number.isNaN(Date.parse(manifest.published_at))) throw manifestError("manifest_metadata_invalid");
  if (typeof manifest.signed !== "boolean") throw manifestError("manifest_signature_invalid");
  if (manifest.signed && manifest.signature_subject != null && !boundedString(manifest.signature_subject, 256)) throw manifestError("manifest_signature_invalid");
  if (!Number.isSafeInteger(manifest.installer_size) || manifest.installer_size <= 0 || !/^[a-f0-9]{64}$/i.test(String(manifest.installer_sha256 || ""))) throw manifestError("manifest_artifact_invalid");
  if (!/^[A-Za-z0-9._-]+\.exe$/.test(String(manifest.installer_filename || ""))) throw manifestError("manifest_filename_invalid");
  let installer;
  try {
    installer = new URL(String(manifest.installer_url || ""));
  } catch {
    throw manifestError("manifest_installer_url_invalid");
  }
  const expectedInstallerPath = `/studioapp/windows-x64/releases/${updateObjectSegment(manifest.version)}/${updateObjectSegment(manifest.build)}/${manifest.installer_filename}`;
  if (installer.protocol !== "https:" || installer.hostname !== EXPECTED_INSTALLER_HOST || installer.username || installer.password || installer.port || installer.search || installer.hash || installer.pathname !== expectedInstallerPath) throw manifestError("manifest_installer_url_invalid");
  let releaseNotesUrl = null;
  if (manifest.release_notes_url) {
    try {
      const notes = new URL(String(manifest.release_notes_url));
      if (notes.protocol === "https:" && !notes.username && !notes.password && ["updates.streamsuites.app", "streamsuites.app", "docs.streamsuites.app"].includes(notes.hostname)) releaseNotesUrl = notes.toString();
    } catch {
      releaseNotesUrl = null;
    }
  }
  return Object.freeze({
    installerUrl: installer.toString(),
    publicMetadata: {
      product_id: EXPECTED_PRODUCT_ID,
      manifest_source: source,
      version: manifest.version,
      build: manifest.build,
      release_epoch: Number.isSafeInteger(manifest.release_epoch)
        ? manifest.release_epoch
        : Number.isSafeInteger(manifest.product_version_epoch) ? manifest.product_version_epoch : null,
      channel: EXPECTED_CHANNEL,
      system_version: boundedString(manifest.system_version),
      system_build: boundedString(manifest.system_build),
      source_revision: boundedString(manifest.source_revision, 80),
      package_provenance_version: Number.isSafeInteger(manifest.package_provenance_version) ? manifest.package_provenance_version : null,
      architecture: EXPECTED_ARCHITECTURE,
      installer_filename: manifest.installer_filename,
      installer_host: installer.hostname,
      installer_path: installer.pathname,
      installer_size: manifest.installer_size,
      installer_sha256: String(manifest.installer_sha256).toLowerCase(),
      published_at: boundedString(manifest.published_at, 80),
      signed: manifest.signed === true,
      signature_subject: manifest.signed === true && typeof manifest.signature_subject === "string" ? manifest.signature_subject.slice(0, 256) : null,
      signature: manifest.signed === true ? (boundedString(manifest.signature_subject, 256) || "Signed") : "Unsigned ALPHA",
      title: typeof manifest.title === "string" ? manifest.title.slice(0, 160) : "StudioApp ALPHA",
      summary: typeof manifest.summary === "string" ? manifest.summary.slice(0, 2000) : "",
      release_notes_url: releaseNotesUrl,
    },
  });
}

async function requestManifest(url, fetchImpl) {
  const options = { headers: { Accept: "application/json" }, redirect: "error", cache: "no-store" };
  if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") options.signal = AbortSignal.timeout(MANIFEST_TIMEOUT_MS);
  return fetchImpl(url, options);
}

async function fetchLegacyManifest(fetchImpl) {
  let response;
  try {
    response = await requestManifest(LEGACY_MANIFEST_URL, fetchImpl);
  } catch {
    throw manifestError("legacy_manifest_fetch_failed");
  }
  try {
    return validateManifest(await readManifestResponse(response, "legacy_manifest"), "legacy");
  } catch (error) {
    if (String(error?.category || "").startsWith("legacy_manifest_")) throw error;
    throw manifestError("legacy_manifest_contract_failed");
  }
}

export async function fetchValidatedManifest(fetchImpl = fetch) {
  let response;
  try {
    response = await requestManifest(PRODUCT_MANIFEST_URL, fetchImpl);
  } catch {
    throw manifestError("product_manifest_fetch_failed");
  }
  if (response.status === 404) return { ...(await fetchLegacyManifest(fetchImpl)), releaseSource: "http_fallback", bindingConfigured: false };
  const manifest = await readManifestResponse(response, "product_manifest");
  if (Number.isInteger(manifest?.schema_version) && manifest.schema_version !== 2)
    return { ...(await fetchLegacyManifest(fetchImpl)), releaseSource: "http_fallback", bindingConfigured: false };
  try {
    return { ...validateManifest(manifest, "product"), releaseSource: "http_fallback", bindingConfigured: false };
  } catch {
    throw manifestError("product_manifest_contract_failed");
  }
}

function hasUpdatesBucket(env = {}) {
  return Boolean(env[UPDATES_BUCKET_BINDING] && typeof env[UPDATES_BUCKET_BINDING].get === "function");
}

function httpFallbackAllowed(context) {
  if (!parseBoolean(context?.env?.[HTTP_FALLBACK_FLAG], false)) return false;
  const hostname = new URL(context.request.url).hostname.toLowerCase();
  return hostname === "127.0.0.1" || hostname === "localhost" || hostname.endsWith(".pages.dev");
}

async function readR2Manifest(bucket, key, prefix) {
  let object;
  try {
    object = await bucket.get(key);
  } catch {
    throw manifestError(`${prefix}_read_failed`);
  }
  if (!object) throw manifestError(`${prefix}_missing`);
  if (Number.isSafeInteger(object.size) && object.size > MAX_MANIFEST_BYTES) throw manifestError(`${prefix}_too_large`);
  let bytes;
  try {
    if (typeof object.arrayBuffer === "function") {
      bytes = new Uint8Array(await object.arrayBuffer());
    } else if (typeof object.text === "function") {
      bytes = encoder.encode(await object.text());
    } else {
      throw new Error("R2 object body is unavailable.");
    }
  } catch {
    throw manifestError(`${prefix}_read_failed`);
  }
  if (bytes.byteLength > MAX_MANIFEST_BYTES) throw manifestError(`${prefix}_too_large`);
  let text;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw manifestError(`${prefix}_parse_failed`);
  }
  try {
    return JSON.parse(text);
  } catch {
    throw manifestError(`${prefix}_parse_failed`);
  }
}

async function fetchLegacyManifestFromR2(bucket) {
  const manifest = await readR2Manifest(bucket, LEGACY_MANIFEST_KEY, "legacy_manifest");
  try {
    return { ...validateManifest(manifest, "legacy"), releaseSource: "r2_binding", bindingConfigured: true };
  } catch (error) {
    if (String(error?.category || "").startsWith("legacy_manifest_")) throw error;
    throw manifestError("legacy_manifest_contract_failed");
  }
}

export async function fetchValidatedManifestFromR2(bucket) {
  let manifest;
  try {
    manifest = await readR2Manifest(bucket, PRODUCT_MANIFEST_KEY, "product_manifest");
  } catch (error) {
    if (error?.category === "product_manifest_missing") return fetchLegacyManifestFromR2(bucket);
    throw error;
  }
  if (Number.isInteger(manifest?.schema_version) && manifest.schema_version !== 2)
    return fetchLegacyManifestFromR2(bucket);
  try {
    return { ...validateManifest(manifest, "product"), releaseSource: "r2_binding", bindingConfigured: true };
  } catch {
    throw manifestError("product_manifest_contract_failed");
  }
}

export function publicManifestSourceState(context) {
  const bindingConfigured = hasUpdatesBucket(context?.env);
  return Object.freeze({
    binding_configured: bindingConfigured,
    release_source: bindingConfigured ? "r2_binding" : httpFallbackAllowed(context) ? "http_fallback" : null,
  });
}

export async function fetchValidatedManifestForContext(context) {
  const fixtureEnabled = parseBoolean(context?.env?.LOCAL_STUDIOAPP_RELEASE_FIXTURE, false);
  if (fixtureEnabled) {
    const hostname = new URL(context.request.url).hostname;
    if (!["127.0.0.1", "localhost"].includes(hostname)) throw manifestError("local_fixture_forbidden");
    const raw = String(context.env.STUDIOAPP_RELEASE_FIXTURE_JSON || "");
    if (!raw || encoder.encode(raw).byteLength > MAX_MANIFEST_BYTES) throw manifestError("local_fixture_invalid");
    let manifest;
    try {
      manifest = JSON.parse(raw);
    } catch {
      throw manifestError("local_fixture_malformed");
    }
    return { ...validateManifest(manifest, "product"), releaseSource: "fixture", bindingConfigured: false };
  }
  if (hasUpdatesBucket(context?.env))
    return fetchValidatedManifestFromR2(context.env[UPDATES_BUCKET_BINDING]);
  if (httpFallbackAllowed(context))
    return fetchValidatedManifest(context?.fetch || fetch);
  throw manifestError("r2_binding_missing");
}

export function projectPublicRelease(release, config, authorized) {
  const accessLocked = config.locked && !authorized;
  return Object.freeze({
    available: true,
    ...release.publicMetadata,
    release_source: release.releaseSource,
    binding_configured: release.bindingConfigured,
    download_available: !accessLocked,
    access_locked: accessLocked,
    controlled_download_url: `/api/downloads/studioapp/latest?version=${encodeURIComponent(release.publicMetadata.version)}&build=${encodeURIComponent(release.publicMetadata.build)}`,
    diagnostic: null,
  });
}

export function unavailablePublicRelease(config, authorized, error, sourceState = {}) {
  const category = typeof error?.category === "string" ? error.category : "release_projection_failed";
  return Object.freeze({
    available: false,
    product_id: EXPECTED_PRODUCT_ID,
    release_source: sourceState.release_source ?? null,
    binding_configured: sourceState.binding_configured === true,
    download_available: false,
    access_locked: config.locked && !authorized,
    diagnostic: category,
  });
}
