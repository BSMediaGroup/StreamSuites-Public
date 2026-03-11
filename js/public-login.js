(() => {
  const CURRENT_ORIGIN = String(window.location.origin || "").trim();
  const PUBLIC_BASE = /^https?:\/\//.test(CURRENT_ORIGIN) ? CURRENT_ORIGIN : "https://streamsuites.app";
  const API_BASE = PUBLIC_BASE;
  const ME_API_URL = `${API_BASE}/api/public/me`;
  const ACCESS_STATE_URL = `${API_BASE}/auth/access-state`;
  const DEBUG_UNLOCK_URL = `${API_BASE}/auth/debug/unlock`;
  const LOGIN_PASSWORD_URL = `${API_BASE}/auth/login/password`;
  const SIGNUP_PASSWORD_URL = `${API_BASE}/auth/signup/password`;
  const COMPLETE_URL = new URL("/public-auth-complete.html", PUBLIC_BASE).toString();
  const DEFAULT_RETURN_TO = new URL("/media.html", PUBLIC_BASE).toString();
  const MIN_PASSWORD_LENGTH = 8;
  const REQUEST_TIMEOUT_MS = 12000;
  const AUTH_ACCESS_STORAGE_KEY = "streamsuites.public.authAccessGate";
  const AUTH_ACCESS_CACHE_MS = 30000;
  const AUTH_ACCESS_FALLBACK_MESSAGES = Object.freeze({
    normal: "Authentication is operating normally.",
    maintenance: "Authentication is temporarily unavailable while maintenance is in progress.",
    development: "Authentication is temporarily limited while development access mode is active."
  });

  const providerEndpointPaths = {
    google: "/auth/login/google",
    github: "/auth/login/github",
    x: "/auth/x/start",
    discord: "/auth/login/discord",
    twitch: "/oauth/twitch/start"
  };

  const statusEl = document.getElementById("public-login-status");
  const providersEl = document.getElementById("public-login-providers");
  const tabs = Array.from(document.querySelectorAll(".ss-public-login__tab"));
  const providerLinks = Array.from(document.querySelectorAll("[data-provider]"));
  const loginForm = document.getElementById("public-login-form");
  const signupForm = document.getElementById("public-signup-form");
  const loginSubmitEl = document.getElementById("public-login-submit");
  const signupSubmitEl = document.getElementById("public-signup-submit");
  const backLinkEl = document.getElementById("public-login-back");
  const closeButtonEl = document.getElementById("public-login-close");
  const accessGateEl = document.getElementById("public-login-access-gate");
  const accessMessageEl = document.getElementById("public-login-access-message");
  const accessToggleEl = document.getElementById("public-login-access-toggle");
  const accessFormEl = document.getElementById("public-login-access-form");
  const accessCodeEl = document.getElementById("public-login-access-code");
  const accessSubmitEl = document.getElementById("public-login-access-submit");
  const accessFeedbackEl = document.getElementById("public-login-access-feedback");
  const toast = window.StreamSuitesPublicToast;

  const params = new URLSearchParams(window.location.search || "");
  const returnTo = normalizeReturnTo(params.get("return_to") || DEFAULT_RETURN_TO);
  const completeUrl = new URL(COMPLETE_URL);
  completeUrl.searchParams.set("return_to", returnTo);

  let loginBusy = false;
  let signupBusy = false;
  let accessFormOpen = false;
  let accessStateLoadedAt = 0;
  let accessStatePromise = null;
  let accessState = normalizeAccessState(null, false);

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

  function hasSpecialCharacter(value) {
    return /[^A-Za-z0-9]/.test(String(value || ""));
  }

  function fallbackAccessMessage(mode) {
    return AUTH_ACCESS_FALLBACK_MESSAGES[mode] || AUTH_ACCESS_FALLBACK_MESSAGES.normal;
  }

  function clearAccessUnlockState() {
    try {
      window.sessionStorage.removeItem(AUTH_ACCESS_STORAGE_KEY);
    } catch (_err) {
      // Ignore storage failures.
    }
  }

  function readAccessUnlockState() {
    try {
      const raw = window.sessionStorage.getItem(AUTH_ACCESS_STORAGE_KEY);
      if (!raw) return { active: false, expiresAt: "" };
      const parsed = JSON.parse(raw);
      const expiresAt = typeof parsed?.expiresAt === "string" ? parsed.expiresAt.trim() : "";
      const expiresAtMs = Date.parse(expiresAt);
      if (!expiresAt || !Number.isFinite(expiresAtMs) || expiresAtMs <= Date.now()) {
        clearAccessUnlockState();
        return { active: false, expiresAt: "" };
      }
      return { active: true, expiresAt };
    } catch (_err) {
      clearAccessUnlockState();
      return { active: false, expiresAt: "" };
    }
  }

  function persistAccessUnlockState(expiresAt) {
    if (typeof expiresAt !== "string" || !expiresAt.trim()) return;
    try {
      window.sessionStorage.setItem(
        AUTH_ACCESS_STORAGE_KEY,
        JSON.stringify({
          unlocked: true,
          expiresAt: expiresAt.trim()
        })
      );
    } catch (_err) {
      // Ignore storage failures.
    }
  }

  function normalizeAccessState(payload, available = true) {
    const rawMode = typeof payload?.mode === "string" ? payload.mode.trim().toLowerCase() : "";
    const mode = rawMode === "maintenance" || rawMode === "development" ? rawMode : "normal";
    const gateActive = mode !== "normal";
    const bypassEnabled = gateActive && payload?.bypass_enabled === true;
    const unlockState = bypassEnabled ? readAccessUnlockState() : { active: false, expiresAt: "" };
    if (!gateActive || !bypassEnabled) {
      clearAccessUnlockState();
    }
    return {
      available,
      mode,
      gateActive,
      message:
        typeof payload?.message === "string" && payload.message.trim()
          ? payload.message.trim()
          : fallbackAccessMessage(mode),
      bypassEnabled,
      bypassUnlocked: bypassEnabled && unlockState.active,
      unlockExpiresAt: unlockState.expiresAt
    };
  }

  function isAccessBlocked() {
    return accessState.gateActive && !accessState.bypassUnlocked;
  }

  function setStatus(message) {
    if (statusEl) statusEl.textContent = message || "";
  }

  function setError(target, message) {
    const text = String(message || "").trim();
    const key = target === "signup" ? "public-signup-error" : "public-login-error";
    if (!text) {
      toast?.dismiss?.(key);
      return;
    }
    toast?.error?.(text, { key, title: "Error" });
  }

  function setSuccess(message) {
    const text = String(message || "").trim();
    if (!text) {
      toast?.dismiss?.("public-signup-success");
      return;
    }
    toast?.success?.(text, { key: "public-signup-success", title: "Success" });
  }

  function syncSubmitAvailability() {
    if (loginSubmitEl instanceof HTMLButtonElement) {
      loginSubmitEl.disabled = loginBusy || isAccessBlocked();
    }
    if (signupSubmitEl instanceof HTMLButtonElement) {
      signupSubmitEl.disabled = signupBusy || isAccessBlocked();
    }
    providerLinks.forEach((link) => {
      link.classList.toggle("is-disabled", isAccessBlocked());
      link.setAttribute("aria-disabled", isAccessBlocked() ? "true" : "false");
    });
  }

  function setBusy(button, busy, labelBusy, labelIdle) {
    if (!(button instanceof HTMLButtonElement)) return;
    if (button === loginSubmitEl) loginBusy = Boolean(busy);
    if (button === signupSubmitEl) signupBusy = Boolean(busy);
    button.disabled = Boolean(busy) || isAccessBlocked();
    button.textContent = busy ? labelBusy : labelIdle;
  }

  function setAccessFeedback(message, tone) {
    if (!accessFeedbackEl) return;
    const text = typeof message === "string" ? message.trim() : "";
    accessFeedbackEl.hidden = !text;
    accessFeedbackEl.textContent = text;
    accessFeedbackEl.dataset.tone = tone || "";
  }

  function setAccessFormOpen(open) {
    accessFormOpen = Boolean(open && accessState.gateActive && accessState.bypassEnabled && !accessState.bypassUnlocked);
    if (accessFormEl) {
      accessFormEl.hidden = !accessFormOpen;
    }
    if (accessToggleEl instanceof HTMLButtonElement) {
      accessToggleEl.setAttribute("aria-expanded", accessFormOpen ? "true" : "false");
      accessToggleEl.classList.toggle("is-active", accessFormOpen);
    }
    if (accessFormOpen && accessCodeEl instanceof HTMLInputElement) {
      window.setTimeout(() => accessCodeEl.focus(), 0);
    }
  }

  function syncAccessUi() {
    if (accessGateEl) {
      accessGateEl.hidden = !accessState.gateActive;
      accessGateEl.classList.toggle("is-unlocked", accessState.bypassUnlocked);
    }
    if (accessMessageEl) {
      accessMessageEl.textContent = accessState.gateActive ? accessState.message : "";
    }
    if (accessToggleEl instanceof HTMLButtonElement) {
      accessToggleEl.hidden = !(accessState.gateActive && accessState.bypassEnabled);
    }
    if (!accessState.gateActive || !accessState.bypassEnabled || accessState.bypassUnlocked) {
      setAccessFormOpen(false);
    } else if (accessFormEl) {
      accessFormEl.hidden = !accessFormOpen;
    }
    syncSubmitAvailability();
    if (accessState.gateActive && accessState.bypassUnlocked) {
      setStatus("Access unlocked. Continue with login or signup.");
      return;
    }
    if (accessState.gateActive) {
      setStatus(
        accessState.bypassEnabled
          ? "Normal login is paused. Unlock access to continue."
          : "Normal login is paused right now."
      );
      return;
    }
    setStatus("Choose a sign-in method.");
  }

  function showProviders() {
    if (providersEl) providersEl.hidden = false;
    syncAccessUi();
  }

  function showTab(name) {
    const tabName = name === "signup" ? "signup" : "login";
    tabs.forEach((tab) => {
      const active = tab.dataset.tab === tabName;
      tab.classList.toggle("is-active", active);
    });
    if (loginForm) loginForm.hidden = tabName !== "login";
    if (signupForm) signupForm.hidden = tabName !== "signup";
    setError("login", "");
    setError("signup", "");
    if (tabName === "login") setSuccess("");
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

  async function fetchMeState() {
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

  async function loadAccessState(force = false) {
    const shouldUseCache =
      !force &&
      accessStateLoadedAt > 0 &&
      Date.now() - accessStateLoadedAt < AUTH_ACCESS_CACHE_MS;
    if (shouldUseCache) {
      syncAccessUi();
      return accessState;
    }
    if (accessStatePromise) return accessStatePromise;

    accessStatePromise = fetchWithTimeout(ACCESS_STATE_URL, {
      method: "GET",
      cache: "no-store",
      credentials: "include",
      headers: { Accept: "application/json" }
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`access-state-${response.status}`);
        }
        return response.json();
      })
      .then((payload) => {
        accessState = normalizeAccessState(payload, true);
        accessStateLoadedAt = Date.now();
        syncAccessUi();
        return accessState;
      })
      .catch(() => {
        accessState = normalizeAccessState(null, false);
        accessStateLoadedAt = Date.now();
        syncAccessUi();
        return accessState;
      })
      .finally(() => {
        accessStatePromise = null;
      });

    return accessStatePromise;
  }

  async function waitForSession(maxAttempts = 6) {
    for (let index = 0; index < maxAttempts; index += 1) {
      try {
        const authenticated = await fetchMeState();
        if (authenticated) return true;
      } catch (_err) {
        // Continue retry loop.
      }
      await new Promise((resolve) => window.setTimeout(resolve, 150 + (index * 120)));
    }
    return false;
  }

  function redirectToComplete() {
    window.location.replace(completeUrl.toString());
  }

  function parseErrorMessage(payload, fallback) {
    const candidates = [
      payload?.error,
      payload?.message,
      payload?.data?.error,
      payload?.data?.message
    ];
    for (const candidate of candidates) {
      if (typeof candidate === "string" && candidate.trim()) {
        return candidate.trim();
      }
    }
    return fallback;
  }

  async function unlockAccess(code) {
    const response = await fetchWithTimeout(DEBUG_UNLOCK_URL, {
      method: "POST",
      cache: "no-store",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ code })
    });

    let payload = null;
    try {
      payload = await response.json();
    } catch (_err) {
      payload = null;
    }

    if (!response.ok) {
      const error = new Error("unlock_failed");
      error.status = response.status;
      error.payload = payload;
      throw error;
    }

    const expiresAt = typeof payload?.expires_at === "string" ? payload.expires_at.trim() : "";
    if (expiresAt) {
      persistAccessUnlockState(expiresAt);
    }
    accessState = {
      ...normalizeAccessState(
        {
          mode: payload?.mode || accessState.mode,
          message: payload?.message || accessState.message,
          bypass_enabled: true
        },
        true
      ),
      bypassUnlocked: true,
      unlockExpiresAt: expiresAt || accessState.unlockExpiresAt
    };
    accessStateLoadedAt = Date.now();
    setAccessFormOpen(false);
    setAccessFeedback("Access unlocked.", "success");
    syncAccessUi();
    return accessState;
  }

  function wireProviderLinks() {
    Object.keys(providerEndpointPaths).forEach((provider) => {
      const link = document.querySelector(`[data-provider="${provider}"]`);
      if (!(link instanceof HTMLAnchorElement)) return;

      const endpoint = new URL(providerEndpointPaths[provider], API_BASE);
      endpoint.searchParams.set("surface", "public");
      endpoint.searchParams.set("login_intent", "public");
      endpoint.searchParams.set("return_to", completeUrl.toString());
      link.href = endpoint.toString();
      link.addEventListener("click", async (event) => {
        event.preventDefault();
        const nextAccessState = await loadAccessState(false);
        if (nextAccessState.gateActive && !nextAccessState.bypassUnlocked) {
          if (nextAccessState.bypassEnabled) {
            setAccessFormOpen(true);
          }
          return;
        }
        window.location.assign(link.href);
      });
    });
  }

  async function ensureAccessBeforeAuth() {
    const nextAccessState = await loadAccessState(false);
    if (nextAccessState.gateActive && !nextAccessState.bypassUnlocked) {
      if (nextAccessState.bypassEnabled) {
        setAccessFormOpen(true);
      }
      return false;
    }
    return true;
  }

  async function submitLogin(event) {
    event.preventDefault();
    if (!(loginForm instanceof HTMLFormElement)) return;

    const canProceed = await ensureAccessBeforeAuth();
    if (!canProceed) return;

    const email = String(loginForm.elements.email?.value || "").trim().toLowerCase();
    const password = String(loginForm.elements.password?.value || "");
    setError("login", "");

    if (!email || !password) {
      setError("login", "Please provide an email and password.");
      return;
    }

    setBusy(loginSubmitEl, true, "Logging in...", "Log in");
    try {
      const response = await fetchWithTimeout(LOGIN_PASSWORD_URL, {
        method: "POST",
        cache: "no-store",
        credentials: "include",
        redirect: "manual",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password,
          surface: "public",
          login_intent: "public"
        })
      });

      let payload = null;
      try {
        payload = await response.json();
      } catch (_err) {
        payload = null;
      }

      if (response.status === 401) {
        setError("login", "Invalid credentials.");
        return;
      }
      if (response.status === 429) {
        setError("login", "Too many login attempts. Please wait and try again.");
        return;
      }
      if (payload?.verification_required === true) {
        setError("login", "Check your email to verify your account before logging in.");
        return;
      }
      if (response.status >= 400) {
        setError("login", parseErrorMessage(payload, "Unable to log in right now."));
        return;
      }

      const authenticated = await waitForSession();
      if (!authenticated) {
        setStatus("Finishing login...");
      }
      redirectToComplete();
    } catch (error) {
      if (error?.name === "AbortError") {
        setError("login", "Login timed out. Please try again.");
        return;
      }
      setError("login", "Network error during login. Please try again.");
    } finally {
      setBusy(loginSubmitEl, false, "Logging in...", "Log in");
      syncSubmitAvailability();
    }
  }

  async function submitSignup(event) {
    event.preventDefault();
    if (!(signupForm instanceof HTMLFormElement)) return;

    const canProceed = await ensureAccessBeforeAuth();
    if (!canProceed) return;

    const email = String(signupForm.elements.email?.value || "").trim().toLowerCase();
    const password = String(signupForm.elements.password?.value || "");
    const confirmPassword = String(signupForm.elements.confirm_password?.value || "");
    setError("signup", "");
    setSuccess("");

    if (!email || !password || !confirmPassword) {
      setError("signup", "Please complete all fields.");
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH || !hasSpecialCharacter(password)) {
      setError("signup", "Password must be at least 8 characters and include a special character.");
      return;
    }
    if (password !== confirmPassword) {
      setError("signup", "Passwords do not match.");
      return;
    }

    setBusy(signupSubmitEl, true, "Creating...", "Create account");
    try {
      const response = await fetchWithTimeout(SIGNUP_PASSWORD_URL, {
        method: "POST",
        cache: "no-store",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password,
          surface: "public",
          login_intent: "public"
        })
      });

      let payload = null;
      try {
        payload = await response.json();
      } catch (_err) {
        payload = null;
      }

      if (!response.ok) {
        setError("signup", parseErrorMessage(payload, "Unable to create account right now."));
        return;
      }

      setSuccess("Account created. Check your email to verify your account before logging in.");
      setStatus("Verification email sent.");
      showTab("login");
      if (loginForm instanceof HTMLFormElement) {
        loginForm.elements.email.value = email;
      }
    } catch (error) {
      if (error?.name === "AbortError") {
        setError("signup", "Signup timed out. Please try again.");
        return;
      }
      setError("signup", "Network error during signup. Please try again.");
    } finally {
      setBusy(signupSubmitEl, false, "Creating...", "Create account");
      syncSubmitAvailability();
    }
  }

  function wireTabs() {
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        showTab(tab.dataset.tab);
      });
    });
  }

  function wireNavigation() {
    if (backLinkEl instanceof HTMLAnchorElement) {
      backLinkEl.href = returnTo;
    }

    if (closeButtonEl instanceof HTMLButtonElement) {
      closeButtonEl.addEventListener("click", () => {
        if (window.opener && !window.opener.closed) {
          window.close();
          return;
        }
        window.location.assign(returnTo);
      });
    }
  }

  function wireAccessGate() {
    if (accessToggleEl instanceof HTMLButtonElement) {
      accessToggleEl.addEventListener("click", () => {
        setAccessFeedback("", "");
        setAccessFormOpen(!accessFormOpen);
      });
    }

    if (accessFormEl instanceof HTMLFormElement) {
      accessFormEl.addEventListener("submit", async (event) => {
        event.preventDefault();
        const code = accessCodeEl instanceof HTMLInputElement ? accessCodeEl.value.trim() : "";
        if (!code) {
          setAccessFeedback("Enter the access code.", "error");
          return;
        }
        if (accessSubmitEl instanceof HTMLButtonElement) {
          accessSubmitEl.disabled = true;
          accessSubmitEl.textContent = "Unlocking...";
        }
        setAccessFeedback("", "");
        try {
          await unlockAccess(code);
          if (accessCodeEl instanceof HTMLInputElement) {
            accessCodeEl.value = "";
          }
        } catch (error) {
          const payload = error?.payload || {};
          const message =
            error?.status === 403
              ? "Invalid access code."
              : error?.status === 429
                ? "Too many attempts. Please wait and try again."
                : "Unlock is unavailable right now.";
          setAccessFeedback(
            typeof payload?.error === "string" && payload.error.trim() && error?.status !== 403
              ? payload.error.trim()
              : message,
            "error"
          );
        } finally {
          if (accessSubmitEl instanceof HTMLButtonElement) {
            accessSubmitEl.disabled = false;
            accessSubmitEl.textContent = "Unlock";
          }
        }
      });
    }
  }

  async function init() {
    wireProviderLinks();
    wireTabs();
    wireNavigation();
    wireAccessGate();
    showTab("login");

    if (loginForm instanceof HTMLFormElement) {
      loginForm.addEventListener("submit", submitLogin);
    }
    if (signupForm instanceof HTMLFormElement) {
      signupForm.addEventListener("submit", submitSignup);
    }

    try {
      const [authenticated] = await Promise.all([
        fetchMeState(),
        loadAccessState(true)
      ]);
      if (authenticated) {
        setStatus("Signed in. Finishing...");
        redirectToComplete();
        return;
      }
      showProviders();
    } catch (_err) {
      showProviders();
      if (!accessState.gateActive) {
        setStatus("Auth API unavailable. You can still try sign-in.");
      }
      console.warn("[StreamSuites Public] Unable to check session before login.");
    }
  }

  init();
})();
