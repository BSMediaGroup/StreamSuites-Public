import { proxyAuthApiRequest } from "../_shared/auth-api-proxy.js";

const ALLOWED_AUTH_PATHS = [
  "/auth/login/password",
  "/auth/signup/password",
  "/auth/logout",
  "/auth/login/google",
  "/auth/login/github",
  "/auth/login/discord",
  "/auth/x/start",
];

export async function onRequest(context) {
  return proxyAuthApiRequest(context, ALLOWED_AUTH_PATHS);
}
