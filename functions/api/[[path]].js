import { proxyAuthApiRequest } from "../_shared/auth-api-proxy.js";

const ALLOWED_API_PATHS = [
  /^\/api\/public(?:\/.*)?$/,
  /^\/api\/creator\/wheels(?:\/.*)?$/,
];

export async function onRequest(context) {
  return proxyAuthApiRequest(context, ALLOWED_API_PATHS);
}
