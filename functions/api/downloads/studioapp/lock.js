import { assertSameOrigin, clearAccessCookieHeader, jsonResponse } from "../../../_shared/studioapp-download-gate.js";

export async function onRequestPost(context) {
  try { assertSameOrigin(context.request); } catch { return jsonResponse({ success: false }, 403); }
  return jsonResponse({ success: true, authorized: false }, 200, { "Set-Cookie": clearAccessCookieHeader() });
}
