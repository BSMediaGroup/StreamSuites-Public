import { fetchValidatedManifestForContext, jsonResponse, projectPublicRelease, readDownloadAccessConfig, verifyAccessCookie } from "../../../_shared/studioapp-download-gate.js";

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
