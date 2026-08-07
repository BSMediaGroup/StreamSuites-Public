(() => {
  "use strict";

  if (window.__streamSuitesPageVisitReporterLoaded) return;
  window.__streamSuitesPageVisitReporterLoaded = true;

  const ANALYTICS_URL = "https://api.streamsuites.app/api/public/analytics/page-visit";
  const VISIT_SESSION_STORAGE_KEY = "ss-public-page-visit";
  const VISIT_DEDUPE_MS = 30000;

  const normalizePath = (value) => {
    const raw = String(value || "").trim();
    if (!raw) return "/";
    const base = raw.split("#", 1)[0].split("?", 1)[0] || raw;
    return base.startsWith("/") ? base : `/${base.replace(/^\/+/, "")}`;
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

  const ensureSessionMarker = () => {
    const cache = readVisitCache();
    if (typeof cache.sessionMarker === "string" && cache.sessionMarker) {
      return cache.sessionMarker;
    }
    const marker = `pv-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    cache.sessionMarker = marker;
    writeVisitCache(cache);
    return marker;
  };

  const reportPageVisit = () => {
    const pagePath = normalizePath(window.location.pathname);
    const cache = readVisitCache();
    const pageVisits = cache.pageVisits && typeof cache.pageVisits === "object" ? cache.pageVisits : {};
    const lastVisitAt = Date.parse(pageVisits[pagePath] || "");
    if (Number.isFinite(lastVisitAt) && Date.now() - lastVisitAt < VISIT_DEDUPE_MS) return;

    pageVisits[pagePath] = new Date().toISOString();
    cache.pageVisits = pageVisits;
    cache.sessionMarker = cache.sessionMarker || ensureSessionMarker();
    writeVisitCache(cache);

    const payload = {
      path: pagePath,
      title: document.title || null,
      page_key: document.body?.dataset?.page || null,
      referrer: document.referrer || null,
      timestamp: new Date().toISOString(),
      session_marker: cache.sessionMarker,
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
