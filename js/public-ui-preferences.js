(() => {
  const STORAGE_KEY = "streamsuites.public-ui-preferences.v1";
  const ENDPOINT = "/api/public/me/preferences";
  const DEFAULTS = Object.freeze({ appearance: "dark", themePreset: "violet_blue" });
  const APPEARANCES = Object.freeze(["dark", "light"]);
  const PRESETS = Object.freeze([
    Object.freeze({ key: "violet_blue", label: "Violet Blue", description: "Signature violet and electric blue", colors: ["#7468ff", "#a76ef2", "#709eff"] }),
    Object.freeze({ key: "crimson_magenta", label: "Crimson Magenta", description: "Deep red with vivid magenta", colors: ["#ef355d", "#e83fb5", "#8f4cff"] }),
    Object.freeze({ key: "signal_red", label: "Signal Red", description: "Bold signal red with deeper scarlet contrast", colors: ["#f02038", "#ff3348", "#580817"] }),
    Object.freeze({ key: "emerald_cyan", label: "Emerald Cyan", description: "Fresh emerald with cool cyan", colors: ["#16b878", "#28d7aa", "#36bce8"] }),
    Object.freeze({ key: "gold_amber", label: "Gold Amber", description: "Warm gold with polished amber", colors: ["#f0b83e", "#ffcf5c", "#f07a36"] }),
    Object.freeze({ key: "royal_blue", label: "Royal Blue", description: "Saturated blue with indigo depth", colors: ["#3568ff", "#5398ff", "#634cff"] }),
    Object.freeze({ key: "magenta_violet", label: "Magenta Violet", description: "Electric magenta with rich violet", colors: ["#ed3fd3", "#bc4bff", "#7356ff"] }),
    Object.freeze({ key: "red_gold", label: "Red Gold", description: "Crimson energy with a gold finish", colors: ["#e64149", "#f2783d", "#f5c84f"] }),
    Object.freeze({ key: "green_gold", label: "Green Gold", description: "Vibrant lime green with warm gold", colors: ["#3acb68", "#78d657", "#e4bd47"] }),
    Object.freeze({ key: "dark_slate", label: "Dark Slate", description: "Deep architectural slate tones", colors: ["#202938", "#3b4658", "#5f6b7a"] }),
    Object.freeze({ key: "neutral_greytone", label: "Neutral Greytone", description: "Balanced graphite and soft grey", colors: ["#565a62", "#858a94", "#afb4bd"] }),
    Object.freeze({ key: "frosted_silver", label: "Frosted Silver", description: "Cool luminous silver and ice", colors: ["#8c9baa", "#c3ced8", "#eef4f7"] })
  ]);
  const PRESET_KEYS = new Set(PRESETS.map((preset) => preset.key));
  const listeners = new Set();
  let saveGeneration = 0;

  function normalizeAppearance(value) {
    const normalized = String(value || "").trim().toLowerCase();
    return APPEARANCES.includes(normalized) ? normalized : DEFAULTS.appearance;
  }

  function normalizeThemePreset(value) {
    const normalized = String(value || "").trim().toLowerCase().replace(/-/g, "_");
    return PRESET_KEYS.has(normalized) ? normalized : DEFAULTS.themePreset;
  }

  function normalizePreferences(value) {
    return {
      appearance: normalizeAppearance(value?.appearance),
      themePreset: normalizeThemePreset(value?.theme_preset ?? value?.themePreset)
    };
  }

  function readLocal() {
    try {
      const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null");
      return parsed && parsed.version === 1 ? normalizePreferences(parsed) : { ...DEFAULTS };
    } catch (_error) {
      return { ...DEFAULTS };
    }
  }

  function writeLocal(preferences) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
        version: 1,
        appearance: preferences.appearance,
        themePreset: preferences.themePreset
      }));
      return true;
    } catch (_error) {
      return false;
    }
  }

  function apply(preferences) {
    const root = document.documentElement;
    root.dataset.publicAppearance = preferences.appearance;
    root.dataset.publicTheme = preferences.themePreset;
    root.style.colorScheme = preferences.appearance;
  }

  let state = {
    ...readLocal(),
    authenticated: false,
    status: "local",
    error: ""
  };
  apply(state);

  function snapshot() {
    return Object.freeze({ ...state });
  }

  function emit() {
    const detail = snapshot();
    listeners.forEach((listener) => {
      try { listener(detail); } catch (_error) { /* A detached settings view must not block theming. */ }
    });
    window.dispatchEvent(new CustomEvent("streamsuites:public-ui-preference-change", { detail }));
  }

  function commit(next, options = {}) {
    state = { ...state, ...normalizePreferences(next), ...options };
    apply(state);
    emit();
    return snapshot();
  }

  function hydrate(authPayload) {
    const authenticated = authPayload?.authenticated === true;
    if (!authenticated) {
      return commit(readLocal(), { authenticated: false, status: "local", error: "" });
    }
    const authoritative = normalizePreferences(authPayload?.public_ui_preferences || {});
    writeLocal(authoritative);
    return commit(authoritative, { authenticated: true, status: "saved", error: "" });
  }

  async function save(next) {
    const previous = snapshot();
    const desired = normalizePreferences(next);
    if (!state.authenticated) {
      writeLocal(desired);
      return commit(desired, { authenticated: false, status: "saved", error: "" });
    }

    const generation = ++saveGeneration;
    commit(desired, { status: "saving", error: "" });
    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        cache: "no-store",
        credentials: "include",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ appearance: desired.appearance, theme_preset: desired.themePreset })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.error || `Preference save failed (${response.status})`);
      if (generation !== saveGeneration) return snapshot();
      const authoritative = normalizePreferences(payload?.public_ui_preferences || desired);
      writeLocal(authoritative);
      return commit(authoritative, { authenticated: true, status: "saved", error: "" });
    } catch (error) {
      if (generation !== saveGeneration) return snapshot();
      return commit(previous, {
        authenticated: true,
        status: "error",
        error: error instanceof Error ? error.message : "Unable to save appearance preferences."
      });
    }
  }

  function setAppearance(appearance) {
    return save({ appearance, themePreset: state.themePreset });
  }

  function setThemePreset(themePreset) {
    return save({ appearance: state.appearance, themePreset });
  }

  function reset() {
    return save(DEFAULTS);
  }

  function subscribe(listener) {
    if (typeof listener !== "function") return () => {};
    listeners.add(listener);
    listener(snapshot());
    return () => listeners.delete(listener);
  }

  window.StreamSuitesPublicUiPreferences = Object.freeze({
    STORAGE_KEY,
    DEFAULTS,
    APPEARANCES,
    PRESETS,
    getState: snapshot,
    hydrate,
    save,
    setAppearance,
    setThemePreset,
    reset,
    subscribe
  });
})();
