(() => {
  "use strict";

  if (window.__streamSuitesPageVisitReporterLoaded) return;
  window.__streamSuitesPageVisitReporterLoaded = true;

  const ANALYTICS_URL = "/api/public/analytics/page-visit";
  const VISIT_SESSION_STORAGE_KEY = "ss-public-page-visit";
  const VISIT_DEDUPE_MS = 30000;

  const normalizePath = (value) => {
    const raw = String(value || "").trim();
    if (!raw) return "/";
    const base = raw.split("#", 1)[0].split("?", 1)[0] || raw;
    const path = base.startsWith("/") ? base : `/${base.replace(/^\/+/, "")}`;
    const normalized = path.length > 1 ? path.replace(/\/+$/, "") : path;
    if (/^\/(?:u\/|@|profile\/)[^/]+/i.test(normalized)) return "/u/:slug";
    for (const family of ["wheels", "polls", "clips", "tallies", "scoreboards"]) {
      if (new RegExp(`^/${family}/[^/]+`, "i").test(normalized)) return `/${family}/:artifact`;
    }
    return normalized;
  };

  const createEventId = () => {
    try {
      if (typeof crypto?.randomUUID === "function") return `pv-${crypto.randomUUID()}`;
    } catch (_error) {
      // Use the bounded non-identity fallback below.
    }
    return `pv-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 14)}`;
  };

  const routeCacheKey = (value) => {
    let hash = 2166136261;
    for (const character of String(value || "/")) {
      hash ^= character.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }
    return `route-${(hash >>> 0).toString(16)}`;
  };

  const readVisitCache = () => {
    try {
      const raw = window.sessionStorage.getItem(VISIT_SESSION_STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (_error) {
      return {};
    }
  };

  const writeVisitCache = (cache) => {
    try {
      window.sessionStorage.setItem(VISIT_SESSION_STORAGE_KEY, JSON.stringify(cache));
    } catch (_error) {
      // Ignore sessionStorage failures.
    }
  };

  const reportPageVisit = () => {
    const rawPagePath = String(window.location.pathname || "/");
    const pagePath = normalizePath(rawPagePath);
    const cacheKey = routeCacheKey(rawPagePath);
    const cache = readVisitCache();
    const pageVisits = cache.pageVisits && typeof cache.pageVisits === "object" ? cache.pageVisits : {};
    const lastVisitAt = Date.parse(pageVisits[cacheKey] || "");
    if (Number.isFinite(lastVisitAt) && Date.now() - lastVisitAt < VISIT_DEDUPE_MS) return;

    pageVisits[cacheKey] = new Date().toISOString();
    cache.pageVisits = pageVisits;
    writeVisitCache(cache);

    const payload = {
      surface: "public",
      path: pagePath,
      event_id: createEventId(),
    };
    const body = JSON.stringify(payload);

    try {
      if (navigator.sendBeacon) {
        const blob = new Blob([body], { type: "application/json" });
        if (navigator.sendBeacon(ANALYTICS_URL, blob)) return;
      }
    } catch (_error) {
      // Fall through to fetch.
    }

    try {
      fetch(ANALYTICS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
        mode: "cors",
        credentials: "omit",
      }).catch(() => {});
    } catch (_error) {
      // Ignore analytics transport failures.
    }
  };

  if (document.visibilityState === "prerender") {
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") reportPageVisit();
    }, { once: true });
  } else {
    window.setTimeout(reportPageVisit, 0);
  }
})();
