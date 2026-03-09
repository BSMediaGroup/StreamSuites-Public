(() => {
  const CURRENT_ORIGIN = String(window.location.origin || "").trim();
  const PUBLIC_BASE = /^https?:\/\//.test(CURRENT_ORIGIN) ? CURRENT_ORIGIN : "https://streamsuites.app";
  const ME_API_URL = new URL("/api/public/me", PUBLIC_BASE).toString();
  const LOGIN_URL = new URL("/public-login.html", PUBLIC_BASE).toString();
  const DEFAULT_RETURN_TO = new URL("/media.html", PUBLIC_BASE).toString();
  const AUTH_COMPLETE_MESSAGE_TYPE = "ss_public_auth_complete";
  const CLOSE_FALLBACK_DELAY_MS = 700;
  const REQUEST_TIMEOUT_MS = 12000;

  const statusEl = document.getElementById("public-auth-complete-status");
  const errorEl = document.getElementById("public-auth-complete-error");
  const backLinkEl = document.getElementById("public-auth-complete-back");
  const loginLinkEl = document.getElementById("public-auth-complete-login");

  const params = new URLSearchParams(window.location.search || "");
  const returnTo = normalizeReturnTo(params.get("return_to") || DEFAULT_RETURN_TO);

  function normalizeReturnTo(value) {
    if (!value || typeof value !== "string") return DEFAULT_RETURN_TO;
    const trimmed = value.trim();
    if (!trimmed) return DEFAULT_RETURN_TO;
    try {
      const parsed = new URL(trimmed, window.location.origin);
      const allowed = parsed.origin === "https://streamsuites.app" || parsed.origin === window.location.origin;
      if (!allowed) return DEFAULT_RETURN_TO;
      return parsed.href;
    } catch (_err) {
      return DEFAULT_RETURN_TO;
    }
  }

  function setStatus(message) {
    if (statusEl) statusEl.textContent = message || "";
  }

  function setError(message) {
    if (!errorEl) return;
    const text = String(message || "").trim();
    errorEl.textContent = text;
    errorEl.hidden = !text;
  }

  function isAuthenticatedPayload(payload) {
    const candidates = [
      payload?.authenticated,
      payload?.is_authenticated,
      payload?.isAuthenticated,
      payload?.data?.authenticated,
      payload?.data?.is_authenticated,
      payload?.data?.isAuthenticated
    ];
    return candidates.some((value) => value === true);
  }

  async function fetchWithTimeout(resource, options = {}, timeoutMs = REQUEST_TIMEOUT_MS) {
    const controller = new AbortController();
    const timeoutHandle = window.setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(resource, {
        ...options,
        signal: controller.signal
      });
    } finally {
      window.clearTimeout(timeoutHandle);
    }
  }

  async function checkSession() {
    const response = await fetchWithTimeout(ME_API_URL, {
      method: "GET",
      cache: "no-store",
      credentials: "include",
      headers: { Accept: "application/json" }
    });
    if (!response.ok) return false;
    const payload = await response.json();
    return isAuthenticatedPayload(payload);
  }

  function notifyOpener() {
    if (!window.opener || typeof window.opener.postMessage !== "function") return;
    try {
      const targetOrigin = new URL(returnTo).origin;
      window.opener.postMessage({ type: AUTH_COMPLETE_MESSAGE_TYPE }, targetOrigin);
      if (targetOrigin !== "https://streamsuites.app") {
        window.opener.postMessage({ type: AUTH_COMPLETE_MESSAGE_TYPE }, "https://streamsuites.app");
      }
    } catch (_err) {
      // Ignore postMessage errors in cross-window edge cases.
    }
  }

  function wireLinks() {
    if (backLinkEl instanceof HTMLAnchorElement) {
      backLinkEl.href = returnTo;
    }
    if (loginLinkEl instanceof HTMLAnchorElement) {
      const loginUrl = new URL(LOGIN_URL);
      loginUrl.searchParams.set("return_to", returnTo);
      loginLinkEl.href = loginUrl.toString();
    }
  }

  async function complete() {
    wireLinks();
    try {
      const authenticated = await checkSession();
      if (!authenticated) {
        setStatus("You are not signed in yet.");
        setError("Complete login to continue.");
        return;
      }

      setStatus("Signed in. Returning to your page...");
      setError("");
      notifyOpener();

      if (window.opener && !window.opener.closed) {
        try {
          window.close();
        } catch (_err) {
          // Ignore close failures; redirect fallback below.
        }
      }

      window.setTimeout(() => {
        if (!window.closed) {
          window.location.replace(returnTo);
        }
      }, CLOSE_FALLBACK_DELAY_MS);
    } catch (error) {
      setStatus("Unable to verify session.");
      setError(
        error?.name === "AbortError"
          ? "Session check timed out. Please retry login."
          : "Auth API unavailable. Please retry login."
      );
      console.warn("[StreamSuites Public] Unable to verify session on auth completion.");
    }
  }

  complete();
})();
