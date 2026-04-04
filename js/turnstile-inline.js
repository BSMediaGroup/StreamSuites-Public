(function () {
  const TURNSTILE_SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
  const configCache = new Map();
  let scriptPromise = null;

  function setStatus(element, message, tone) {
    if (!element) return;
    element.textContent = typeof message === "string" ? message : "";
    element.dataset.tone = tone || "";
  }

  function loadScript() {
    if (window.turnstile?.render) {
      return Promise.resolve(window.turnstile);
    }
    if (scriptPromise) return scriptPromise;

    scriptPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${TURNSTILE_SCRIPT_URL}"]`);
      if (existing) {
        existing.addEventListener("load", () => resolve(window.turnstile), { once: true });
        existing.addEventListener("error", () => reject(new Error("turnstile-script-load-failed")), { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src = TURNSTILE_SCRIPT_URL;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve(window.turnstile);
      script.onerror = () => reject(new Error("turnstile-script-load-failed"));
      document.head.appendChild(script);
    }).finally(() => {
      scriptPromise = null;
    });

    return scriptPromise;
  }

  async function loadConfig(configUrl) {
    if (configCache.has(configUrl)) return configCache.get(configUrl);
    const promise = fetch(configUrl, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: { Accept: "application/json" },
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`turnstile-config-${response.status}`);
        const payload = await response.json();
        const sitekey = typeof payload?.sitekey === "string" ? payload.sitekey.trim() : "";
        return {
          enabled: payload?.enabled === true && sitekey.length > 0,
          sitekey,
        };
      })
      .catch(() => ({ enabled: false, sitekey: "" }));
    configCache.set(configUrl, promise);
    return promise;
  }

  function createController(options) {
    const state = {
      enabled: false,
      token: "",
      widgetId: null,
    };
    const configUrl = options?.configUrl || "/auth/turnstile/config";
    const panel = options?.panel || null;
    const slot = options?.slot || null;
    const status = options?.status || null;
    const onStateChange = typeof options?.onStateChange === "function" ? options.onStateChange : null;

    function notify() {
      if (onStateChange) {
        onStateChange({
          enabled: state.enabled,
          token: state.token,
        });
      }
    }

    async function init() {
      const config = await loadConfig(configUrl);
      state.enabled = config.enabled;
      if (panel) {
        panel.hidden = !state.enabled;
      }
      if (!state.enabled || !slot) {
        notify();
        return state;
      }
      if (state.widgetId !== null) {
        notify();
        return state;
      }

      setStatus(status, "Complete the security check to continue.");
      const turnstile = await loadScript();
      state.widgetId = turnstile.render(slot, {
        sitekey: config.sitekey,
        theme: "auto",
        callback(token) {
          state.token = String(token || "").trim();
          setStatus(status, "Security check ready.", "success");
          notify();
        },
        "expired-callback"() {
          state.token = "";
          setStatus(status, "The security check expired. Complete it again.", "error");
          notify();
        },
        "error-callback"() {
          state.token = "";
          setStatus(status, "Security check failed to load. Refresh and try again.", "error");
          notify();
        },
      });
      notify();
      return state;
    }

    function reset() {
      if (!state.enabled || state.widgetId === null || !window.turnstile?.reset) return;
      state.token = "";
      window.turnstile.reset(state.widgetId);
      setStatus(status, "Complete the security check to continue.");
      notify();
    }

    async function requireToken() {
      await init();
      if (!state.enabled) return "";
      if (state.token) return state.token;
      setStatus(status, "Complete the security check to continue.", "error");
      notify();
      return "";
    }

    return {
      init,
      reset,
      requireToken,
      isEnabled() {
        return state.enabled;
      },
      hasToken() {
        return !!state.token;
      },
      getToken() {
        return state.token;
      },
    };
  }

  window.StreamSuitesTurnstileInline = {
    createController,
  };
})();
