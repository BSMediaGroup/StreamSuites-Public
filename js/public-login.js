(() => {
  const CURRENT_ORIGIN = String(window.location.origin || "").trim();
  const PUBLIC_BASE = /^https?:\/\//.test(CURRENT_ORIGIN) ? CURRENT_ORIGIN : "https://streamsuites.app";
  const API_BASE = PUBLIC_BASE;
  const ME_API_URL = `${API_BASE}/api/public/me`;
  const LOGIN_PASSWORD_URL = `${API_BASE}/auth/login/password`;
  const SIGNUP_PASSWORD_URL = `${API_BASE}/auth/signup/password`;
  const COMPLETE_URL = new URL("/public-auth-complete.html", PUBLIC_BASE).toString();
  const DEFAULT_RETURN_TO = new URL("/media.html", PUBLIC_BASE).toString();
  const MIN_PASSWORD_LENGTH = 8;
  const REQUEST_TIMEOUT_MS = 12000;

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
  const loginForm = document.getElementById("public-login-form");
  const signupForm = document.getElementById("public-signup-form");
  const loginSubmitEl = document.getElementById("public-login-submit");
  const signupSubmitEl = document.getElementById("public-signup-submit");
  const backLinkEl = document.getElementById("public-login-back");
  const closeButtonEl = document.getElementById("public-login-close");
  const toast = window.StreamSuitesPublicToast;

  const params = new URLSearchParams(window.location.search || "");
  const returnTo = normalizeReturnTo(params.get("return_to") || DEFAULT_RETURN_TO);
  const completeUrl = new URL(COMPLETE_URL);
  completeUrl.searchParams.set("return_to", returnTo);

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

  function setBusy(button, busy, labelBusy, labelIdle) {
    if (!(button instanceof HTMLButtonElement)) return;
    button.disabled = Boolean(busy);
    button.textContent = busy ? labelBusy : labelIdle;
  }

  function showProviders() {
    if (providersEl) providersEl.hidden = false;
    setStatus("Choose a sign-in method.");
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

  function wireProviderLinks() {
    Object.keys(providerEndpointPaths).forEach((provider) => {
      const link = document.querySelector(`[data-provider="${provider}"]`);
      if (!(link instanceof HTMLAnchorElement)) return;

      const endpoint = new URL(providerEndpointPaths[provider], API_BASE);
      endpoint.searchParams.set("surface", "public");
      endpoint.searchParams.set("login_intent", "public");
      endpoint.searchParams.set("return_to", completeUrl.toString());
      link.href = endpoint.toString();
    });
  }

  async function submitLogin(event) {
    event.preventDefault();
    if (!(loginForm instanceof HTMLFormElement)) return;

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
    }
  }

  async function submitSignup(event) {
    event.preventDefault();
    if (!(signupForm instanceof HTMLFormElement)) return;

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

  async function init() {
    wireProviderLinks();
    wireTabs();
    wireNavigation();
    showTab("login");

    if (loginForm instanceof HTMLFormElement) {
      loginForm.addEventListener("submit", submitLogin);
    }
    if (signupForm instanceof HTMLFormElement) {
      signupForm.addEventListener("submit", submitSignup);
    }

    try {
      const authenticated = await fetchMeState();
      if (authenticated) {
        setStatus("Signed in. Finishing...");
        redirectToComplete();
        return;
      }
      showProviders();
    } catch (_err) {
      showProviders();
      setStatus("Auth API unavailable. You can still try sign-in.");
      console.warn("[StreamSuites Public] Unable to check session before login.");
    }
  }

  init();
})();
