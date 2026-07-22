import { fetchValidatedManifest, jsonResponse, readDownloadAccessConfig, verifyAccessCookie } from "../../../_shared/studioapp-download-gate.js";

export async function onRequestGet(context) {
  const config = readDownloadAccessConfig(context.env);
  if (!(await verifyAccessCookie(context.request, config))) return jsonResponse({ success: false, error: "Download access is locked." }, 403);
  let release;
  try { release = await fetchValidatedManifest(); } catch { return jsonResponse({ success: false, error: "The current StudioApp release is temporarily unavailable." }, 502); }
  const url = new URL(context.request.url);
  if (url.searchParams.get("metadata") === "1") return jsonResponse({ success: true, release: release.publicMetadata });
  return new Response(null, { status: 302, headers: { Location: release.installerUrl, "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" } });
}
