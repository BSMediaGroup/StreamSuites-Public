import { proxyAuthApiRequest } from "../_shared/auth-api-proxy.js";

const ALLOWED_PUBLIC_API_PATHS = [/^\/api\/public(?:\/.*)?$/];

export async function onRequest(context) {
  return proxyAuthApiRequest(context, ALLOWED_PUBLIC_API_PATHS);
}
