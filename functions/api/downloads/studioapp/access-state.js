import { jsonResponse, readDownloadAccessConfig, verifyAccessCookie } from "../../../_shared/studioapp-download-gate.js";

export async function onRequestGet(context) {
  const config = readDownloadAccessConfig(context.env);
  const authorized = await verifyAccessCookie(context.request, config);
  return jsonResponse({
    locked: config.locked,
    authorized,
    message: config.locked ? config.message : "",
    bypass_enabled: config.bypassEnabled && Boolean(config.bypassCode),
    show_banner: config.showBanner,
    ttl_minutes: config.ttlMinutes,
  });
}
