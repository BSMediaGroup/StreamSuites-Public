import { assertSameOrigin, createAccessCookie, jsonResponse, readBoundedCode, readDownloadAccessConfig, safeCodeEqual } from "../../../_shared/studioapp-download-gate.js";

export async function onRequestPost(context) {
  try { assertSameOrigin(context.request); } catch { return jsonResponse({ success: false, error: "Access could not be unlocked." }, 403); }
  const config = readDownloadAccessConfig(context.env);
  if (!config.locked) return jsonResponse({ success: true, authorized: true });
  if (!config.bypassEnabled || !config.bypassCode) return jsonResponse({ success: false, error: "Access could not be unlocked." }, 403);
  let submitted;
  try { submitted = await readBoundedCode(context.request); } catch { return jsonResponse({ success: false, error: "Access could not be unlocked." }, 400); }
  if (!(await safeCodeEqual(submitted, config.bypassCode))) return jsonResponse({ success: false, error: "Access could not be unlocked." }, 403);
  const cookie = await createAccessCookie(config);
  return jsonResponse({ success: true, authorized: true, expires_at: cookie.expiresAt }, 200, { "Set-Cookie": cookie.header });
}
