import { jsonResponse, publicManifestSourceState, readDownloadAccessConfig, verifyAccessCookie } from "../../../_shared/studioapp-download-gate.js";

export async function onRequestGet(context) {
  const config = readDownloadAccessConfig(context.env);
  const authorized = await verifyAccessCookie(context.request, config);
  const sourceState = publicManifestSourceState(context);
  return jsonResponse({
    locked: config.locked,
    authorized,
    message: config.locked ? config.message : "",
    bypass_enabled: config.bypassEnabled && Boolean(config.bypassCode),
    show_banner: config.showBanner,
    ttl_minutes: config.ttlMinutes,
    configuration_state: config.missingVariables.length ? "required" : config.invalidVariables.length ? "invalid" : "valid",
    missing_variables: config.missingVariables,
    invalid_variables: config.invalidVariables,
    release_source: sourceState.release_source,
    binding_configured: sourceState.binding_configured,
  });
}
