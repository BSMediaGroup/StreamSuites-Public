import { fetchValidatedManifestForContext, jsonResponse, projectPublicRelease, readDownloadAccessConfig, verifyAccessCookie } from "../../../_shared/studioapp-download-gate.js";

const DEFAULT_RUNTIME_API_ORIGIN = "https://api.streamsuites.app";

function resolveRuntimeTelemetryUrl(env) {
  const raw = String(env?.STREAMSUITES_API_ORIGIN || DEFAULT_RUNTIME_API_ORIGIN).trim();
  try {
    const origin = new URL(raw);
    if (!/^https?:$/.test(origin.protocol)) throw new Error("invalid protocol");
    return new URL("/api/public/analytics/download-start", origin).toString();
  } catch {
    return new URL("/api/public/analytics/download-start", DEFAULT_RUNTIME_API_ORIGIN).toString();
  }
}

function downloadEventId(request) {
  const ray = String(request.headers.get("CF-Ray") || "").trim().replace(/[^A-Za-z0-9._:-]/g, "").slice(0, 96);
  if (ray.length >= 8) return `download-${ray}`;
  return `download-${crypto.randomUUID()}`;
}

export function queueManualDownloadStart(context) {
  if (typeof context.waitUntil !== "function") return false;
  const telemetry = fetch(resolveRuntimeTelemetryUrl(context.env), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Origin: new URL(context.request.url).origin,
    },
    body: JSON.stringify({
      product: "studioapp",
      platform: "windows_x64",
      channel: "manual",
      event_id: downloadEventId(context.request),
    }),
    signal: typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function"
      ? AbortSignal.timeout(1500)
      : undefined,
  }).then(() => undefined).catch(() => undefined);
  context.waitUntil(telemetry);
  return true;
}

export async function onRequestGet(context) {
  const config = readDownloadAccessConfig(context.env);
  const authorized = await verifyAccessCookie(context.request, config);
  let release;
  try { release = await fetchValidatedManifestForContext(context); } catch { return jsonResponse({ success: false, error: "The current StudioApp release is temporarily unavailable." }, 502); }
  const url = new URL(context.request.url);
  if (url.searchParams.get("metadata") === "1" && [...url.searchParams.keys()].every((key) => key === "metadata")) {
    return jsonResponse({ success: true, release: projectPublicRelease(release, config, authorized) });
  }
  if ([...url.searchParams.keys()].some((key) => !["version", "build"].includes(key))) return jsonResponse({ success: false, error: "The requested release is invalid." }, 400);
  const requestedVersion = url.searchParams.get("version");
  const requestedBuild = url.searchParams.get("build");
  if ((requestedVersion && requestedVersion !== release.publicMetadata.version) || (requestedBuild && requestedBuild !== release.publicMetadata.build)) return jsonResponse({ success: false, error: "The requested release is no longer current." }, 409);
  if (!authorized) return jsonResponse({ success: false, error: "Download access is locked." }, 403);
  queueManualDownloadStart(context);
  return new Response(null, {
    status: 302,
    headers: {
      Location: release.installerUrl,
      "Content-Disposition": `attachment; filename="${release.publicMetadata.installer_filename}"`,
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
