(() => {
  "use strict";

  const API_BASE = "https://v0hwlmly3pd2.statuspage.io/api/v2";
  const ENDPOINTS = Object.freeze({
    summary: `${API_BASE}/summary.json`,
    incidents: `${API_BASE}/incidents.json`,
    maintenances: `${API_BASE}/scheduled-maintenances.json`,
  });
  const POLL_INTERVAL_MS = 60_000;
  const REQUEST_TIMEOUT_MS = 8_000;

  const nowIso = () => new Date().toISOString();

  const fallbackComponents = [
    { id: "runtime", name: "StreamSuites Runtime Engine", status: "operational", position: 1, category: "core" },
    { id: "auth", name: "StreamSuites Auth API", status: "operational", position: 2, category: "core" },
    { id: "login", name: "StreamSuites Login", status: "operational", position: 3, category: "core" },
    { id: "automation", name: "Automation / Trigger Engine", status: "operational", position: 4, category: "core" },
    { id: "telemetry", name: "Telemetry / Usage", status: "operational", position: 5, category: "core" },
    { id: "public", name: "StreamSuites Public Pages", status: "operational", position: 10, category: "surfaces" },
    { id: "creator", name: "StreamSuites Creator Dashboard", status: "operational", position: 11, category: "surfaces" },
    { id: "admin", name: "StreamSuites Admin Dashboard", status: "operational", position: 12, category: "surfaces" },
    { id: "studio", name: "StreamSuites Studio", status: "operational", position: 13, category: "surfaces" },
    { id: "support", name: "StreamSuites Support Hub", status: "operational", position: 14, category: "surfaces" },
    { id: "cf-syd", name: "Cloudflare Sydney, NSW, Australia", status: "operational", position: 20, category: "edge" },
    { id: "cf-sjc", name: "Cloudflare San Jose, CA, United States", status: "operational", position: 21, category: "edge" },
    { id: "cf-network", name: "Cloudflare Network", status: "operational", position: 22, category: "edge" },
    { id: "github-pages", name: "GitHub Pages", status: "operational", position: 23, category: "edge" },
    { id: "github-git", name: "GitHub Git Operations", status: "operational", position: 30, category: "dependencies" },
    { id: "github-api", name: "GitHub API Requests", status: "operational", position: 31, category: "dependencies" },
    { id: "github-actions", name: "GitHub Actions", status: "operational", position: 32, category: "dependencies" },
    { id: "github-pr", name: "GitHub Pull Requests", status: "operational", position: 33, category: "dependencies" },
    { id: "stripe-api", name: "Stripe API", status: "operational", position: 34, category: "dependencies" },
    { id: "stripe-dashboard", name: "Stripe Dashboard", status: "operational", position: 35, category: "dependencies" },
  ];

  const createFallback = () => ({
    page: {
      id: "v0hwlmly3pd2",
      name: "StreamSuites",
      url: "https://streamsuites.statuspage.io/",
      updated_at: nowIso(),
    },
    status: { indicator: "none", description: "All Systems Operational" },
    components: fallbackComponents.map((component) => ({ ...component })),
    incidents: [],
    scheduled_maintenances: [],
  });

  const clone = (value) => JSON.parse(JSON.stringify(value));

  const normalizeDemoMode = () => {
    const params = new URLSearchParams(window.location.search);
    const raw = String(window.__STATUS_POC_DEMO__ || params.get("demo") || "").trim().toLowerCase();
    return ["operational", "degraded", "partial", "major", "maintenance"].includes(raw)
      ? raw
      : "";
  };

  const applyDemoMode = (summary, mode) => {
    if (!mode || mode === "operational") return summary;
    const next = clone(summary);
    const target = next.components.find((component) => component.id === "auth") || next.components[0];
    if (!target) return next;

    if (mode === "degraded") {
      target.status = "degraded_performance";
      next.status = { indicator: "minor", description: "Degraded System Performance" };
      next.incidents = [{
        id: "demo-degraded",
        name: "Elevated authentication latency",
        impact: "minor",
        status: "monitoring",
        created_at: nowIso(),
        updated_at: nowIso(),
        incident_updates: [{ status: "monitoring", body: "Response times have recovered and the service is being monitored.", created_at: nowIso() }],
      }];
    } else if (mode === "partial") {
      target.status = "partial_outage";
      next.status = { indicator: "major", description: "Partial System Outage" };
      next.incidents = [{
        id: "demo-partial",
        name: "Intermittent login failures",
        impact: "major",
        status: "identified",
        created_at: nowIso(),
        updated_at: nowIso(),
        incident_updates: [{ status: "identified", body: "The affected path has been identified and mitigation is in progress.", created_at: nowIso() }],
      }];
    } else if (mode === "major") {
      target.status = "major_outage";
      const runtime = next.components.find((component) => component.id === "runtime");
      if (runtime) runtime.status = "major_outage";
      next.status = { indicator: "critical", description: "Major System Outage" };
      next.incidents = [{
        id: "demo-major",
        name: "Runtime/Auth service disruption",
        impact: "critical",
        status: "investigating",
        created_at: nowIso(),
        updated_at: nowIso(),
        incident_updates: [{ status: "investigating", body: "Operators are investigating a disruption affecting core StreamSuites services.", created_at: nowIso() }],
      }];
    } else if (mode === "maintenance") {
      target.status = "under_maintenance";
      next.status = { indicator: "minor", description: "Scheduled Maintenance" };
      next.scheduled_maintenances = [{
        id: "demo-maintenance",
        name: "Runtime/Auth infrastructure maintenance",
        status: "in_progress",
        impact: "maintenance",
        scheduled_for: nowIso(),
        scheduled_until: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        incident_updates: [{ status: "in_progress", body: "A planned maintenance window is currently in progress.", created_at: nowIso() }],
      }];
    }
    return next;
  };

  const fetchJson = async (url) => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        cache: "no-store",
        credentials: "omit",
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error(`Statuspage request failed (${response.status})`);
      return await response.json();
    } finally {
      window.clearTimeout(timeout);
    }
  };

  const mergePayloads = (summaryPayload, incidentsPayload, maintenancePayload) => {
    const summary = summaryPayload && typeof summaryPayload === "object" ? clone(summaryPayload) : createFallback();
    if (Array.isArray(incidentsPayload?.incidents)) summary.incidents = incidentsPayload.incidents;
    if (Array.isArray(maintenancePayload?.scheduled_maintenances)) {
      summary.scheduled_maintenances = maintenancePayload.scheduled_maintenances;
    }
    return summary;
  };

  let currentSnapshot = null;
  let inFlight = null;
  let intervalId = 0;
  const listeners = new Set();
  const demoMode = normalizeDemoMode();

  const emit = () => {
    listeners.forEach((listener) => {
      try { listener(currentSnapshot); } catch (error) { console.error("[Status POC] listener failed", error); }
    });
    window.dispatchEvent(new CustomEvent("streamsuites:status", { detail: currentSnapshot }));
  };

  const buildSnapshot = ({ data, live, stale, latencyMs, error }) => ({
    data,
    live,
    stale,
    demo: Boolean(demoMode),
    demoMode: demoMode || null,
    source: demoMode ? "poc-demo" : live ? "atlassian-statuspage" : "poc-fallback",
    checkedAt: nowIso(),
    latencyMs: Number.isFinite(latencyMs) ? latencyMs : null,
    error: error ? String(error.message || error) : null,
    endpoints: ENDPOINTS,
  });

  const refresh = async ({ force = false } = {}) => {
    if (inFlight && !force) return inFlight;

    if (demoMode) {
      const data = applyDemoMode(createFallback(), demoMode);
      currentSnapshot = buildSnapshot({ data, live: false, stale: false, latencyMs: 0, error: null });
      emit();
      return currentSnapshot;
    }

    const started = performance.now();
    inFlight = Promise.allSettled([
      fetchJson(ENDPOINTS.summary),
      fetchJson(ENDPOINTS.incidents),
      fetchJson(ENDPOINTS.maintenances),
    ])
      .then((results) => {
        const summaryResult = results[0];
        if (summaryResult.status !== "fulfilled") throw summaryResult.reason;
        const data = mergePayloads(
          summaryResult.value,
          results[1].status === "fulfilled" ? results[1].value : null,
          results[2].status === "fulfilled" ? results[2].value : null
        );
        currentSnapshot = buildSnapshot({
          data,
          live: true,
          stale: false,
          latencyMs: Math.max(0, Math.round(performance.now() - started)),
          error: null,
        });
        emit();
        return currentSnapshot;
      })
      .catch((error) => {
        if (currentSnapshot?.data) {
          currentSnapshot = buildSnapshot({
            data: currentSnapshot.data,
            live: currentSnapshot.live,
            stale: true,
            latencyMs: currentSnapshot.latencyMs,
            error,
          });
        } else {
          currentSnapshot = buildSnapshot({
            data: createFallback(),
            live: false,
            stale: false,
            latencyMs: null,
            error,
          });
        }
        emit();
        return currentSnapshot;
      })
      .finally(() => { inFlight = null; });

    return inFlight;
  };

  const subscribe = (listener) => {
    if (typeof listener !== "function") return () => {};
    listeners.add(listener);
    if (currentSnapshot) listener(currentSnapshot);
    return () => listeners.delete(listener);
  };

  const start = () => {
    if (!intervalId && !demoMode) {
      intervalId = window.setInterval(() => refresh(), POLL_INTERVAL_MS);
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") refresh();
      });
    }
    return refresh();
  };

  const stop = () => {
    if (intervalId) window.clearInterval(intervalId);
    intervalId = 0;
  };

  window.StreamSuitesStatusData = Object.freeze({
    ENDPOINTS,
    POLL_INTERVAL_MS,
    refresh,
    subscribe,
    start,
    stop,
    getSnapshot: () => currentSnapshot,
  });
})();
