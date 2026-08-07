(() => {
  "use strict";

  if (window.StreamSuitesStatusData && window.StreamSuitesStatusHelpers) return;

  const API_BASE = "https://v0hwlmly3pd2.statuspage.io/api/v2";
  const ENDPOINTS = Object.freeze({
    summary: `${API_BASE}/summary.json`,
    incidents: `${API_BASE}/incidents.json`,
    maintenances: `${API_BASE}/scheduled-maintenances.json`,
  });
  const POLL_INTERVAL_MS = 60000;
  const REQUEST_TIMEOUT_MS = 8000;

  const STATE_META = Object.freeze({
    operational: { label: "Operational", short: "Operational", mark: "✓" },
    degraded: { label: "Degraded performance", short: "Degraded", mark: "!" },
    partial: { label: "Partial outage", short: "Partial outage", mark: "!" },
    major: { label: "Major outage", short: "Major outage", mark: "×" },
    critical: { label: "Critical outage", short: "Critical", mark: "×" },
    maintenance: { label: "Under maintenance", short: "Maintenance", mark: "◇" },
    unknown: { label: "Status unavailable", short: "Unavailable", mark: "?" },
  });

  const COMPONENT_META = Object.freeze({
    operational: { state: "operational", label: "Operational" },
    degraded_performance: { state: "degraded", label: "Degraded performance" },
    partial_outage: { state: "partial", label: "Partial outage" },
    major_outage: { state: "major", label: "Major outage" },
    under_maintenance: { state: "maintenance", label: "Maintenance" },
  });

  const stateFromIndicator = (indicator, description = "") => {
    const key = String(indicator || "").toLowerCase();
    const text = String(description || "").toLowerCase();
    if (text.includes("maintenance")) return "maintenance";
    if (key === "none") return "operational";
    if (key === "minor") return "degraded";
    if (key === "major") return "partial";
    if (key === "critical") return "critical";
    return "unknown";
  };

  const normalizeComponent = (component) => {
    const meta = COMPONENT_META[component?.status] || { state: "unknown", label: "Unknown / unavailable" };
    return { ...component, normalizedState: meta.state, statusLabel: meta.label };
  };

  const inferCategory = (component) => {
    const name = String(component?.name || "").toLowerCase();
    if (/runtime|auth api|login|account session|automation|trigger|telemetry|usage/.test(name)) return "core";
    if (/streamsuites/.test(name) && /dashboard|studio|public|support|docs|console|creator|admin|pages/.test(name)) return "surfaces";
    if (/cloudflare|edge|network|cdn|pages/.test(name)) return "edge";
    return "dependencies";
  };

  const GROUP_LABELS = Object.freeze({
    core: "Core services",
    surfaces: "Product surfaces",
    edge: "Delivery & edge",
    dependencies: "External dependencies",
    other: "Other components",
  });

  const groupComponents = (components) => {
    const source = Array.isArray(components) ? components : [];
    const normalized = source
      .filter((component) => !component?.group)
      .map(normalizeComponent)
      .sort((a, b) => {
        const aPosition = Number.isFinite(Number(a.position)) ? Number(a.position) : Number.MAX_SAFE_INTEGER;
        const bPosition = Number.isFinite(Number(b.position)) ? Number(b.position) : Number.MAX_SAFE_INTEGER;
        if (aPosition !== bPosition) return aPosition - bPosition;
        return String(a.name || "").localeCompare(String(b.name || ""));
      });
    const parentGroups = new Map(
      source.filter((component) => component?.group && component?.id)
        .map((component) => [component.id, component.name || "Component group"])
    );
    const groups = new Map();

    normalized.forEach((component) => {
      const groupId = component.group_id && parentGroups.has(component.group_id)
        ? `statuspage:${component.group_id}`
        : inferCategory(component) || "other";
      const label = groupId.startsWith("statuspage:")
        ? parentGroups.get(component.group_id)
        : GROUP_LABELS[groupId] || GROUP_LABELS.other;
      if (!groups.has(groupId)) groups.set(groupId, { id: groupId, label, components: [] });
      groups.get(groupId).components.push(component);
    });

    const order = ["core", "surfaces", "edge", "dependencies", "other"];
    return [...groups.values()].sort((a, b) => {
      const aIndex = order.indexOf(a.id);
      const bIndex = order.indexOf(b.id);
      if (aIndex !== -1 || bIndex !== -1) {
        return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
      }
      return a.label.localeCompare(b.label);
    });
  };

  const unresolvedIncidents = (incidents) => (Array.isArray(incidents) ? incidents : [])
    .filter((incident) => !["resolved", "postmortem"].includes(String(incident?.status || "").toLowerCase()));

  const activeMaintenances = (maintenances) => (Array.isArray(maintenances) ? maintenances : [])
    .filter((maintenance) => String(maintenance?.status || "").toLowerCase() !== "completed");

  const formatRelative = (value) => {
    const timestamp = Date.parse(value || "");
    if (!Number.isFinite(timestamp)) return "Time unavailable";
    const delta = Date.now() - timestamp;
    const absolute = Math.abs(delta);
    for (const [unit, size] of [["day", 86400000], ["hour", 3600000], ["minute", 60000]]) {
      if (absolute >= size) {
        return new Intl.RelativeTimeFormat(undefined, { numeric: "auto" }).format(-Math.round(delta / size), unit);
      }
    }
    return "Just now";
  };

  window.StreamSuitesStatusHelpers = Object.freeze({
    STATE_META,
    COMPONENT_META,
    stateFromIndicator,
    normalizeComponent,
    groupComponents,
    unresolvedIncidents,
    activeMaintenances,
    formatRelative,
  });

  const clone = (value) => JSON.parse(JSON.stringify(value));
  const nowIso = () => new Date().toISOString();
  const listeners = new Set();
  let currentSnapshot = null;
  let lastSuccessfulData = null;
  let lastSuccessfulLatency = null;
  let inFlight = null;
  let intervalId = 0;
  let visibilityBound = false;

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
      if (!response.ok) throw new Error(`Statuspage public read failed (${response.status})`);
      return await response.json();
    } finally {
      window.clearTimeout(timeout);
    }
  };

  const mergePayloads = (summaryPayload, incidentsPayload, maintenancePayload) => {
    const summary = clone(summaryPayload);
    if (Array.isArray(incidentsPayload?.incidents)) summary.incidents = incidentsPayload.incidents;
    if (Array.isArray(maintenancePayload?.scheduled_maintenances)) {
      summary.scheduled_maintenances = maintenancePayload.scheduled_maintenances;
    }
    if (!Array.isArray(summary.incidents)) summary.incidents = [];
    if (!Array.isArray(summary.scheduled_maintenances)) summary.scheduled_maintenances = [];
    if (!Array.isArray(summary.components)) summary.components = [];
    return summary;
  };

  const emit = () => {
    listeners.forEach((listener) => {
      try {
        listener(currentSnapshot);
      } catch (error) {
        console.error("[StreamSuites status] listener failed", error);
      }
    });
    window.dispatchEvent(new CustomEvent("streamsuites:status", { detail: currentSnapshot }));
  };

  const refresh = ({ force = false } = {}) => {
    if (inFlight && !force) return inFlight;
    const started = performance.now();
    inFlight = Promise.allSettled([
      fetchJson(ENDPOINTS.summary),
      fetchJson(ENDPOINTS.incidents),
      fetchJson(ENDPOINTS.maintenances),
    ]).then((results) => {
      if (results[0].status !== "fulfilled") throw results[0].reason;
      const data = mergePayloads(
        results[0].value,
        results[1].status === "fulfilled" ? results[1].value : null,
        results[2].status === "fulfilled" ? results[2].value : null
      );
      const latencyMs = Math.max(0, Math.round(performance.now() - started));
      lastSuccessfulData = data;
      lastSuccessfulLatency = latencyMs;
      currentSnapshot = {
        data,
        live: true,
        stale: false,
        checkedAt: nowIso(),
        latencyMs,
        error: null,
        endpoints: ENDPOINTS,
      };
      emit();
      return currentSnapshot;
    }).catch((error) => {
      currentSnapshot = {
        data: lastSuccessfulData,
        live: false,
        stale: Boolean(lastSuccessfulData),
        checkedAt: nowIso(),
        latencyMs: lastSuccessfulLatency,
        error: error?.name === "AbortError" ? "Status request timed out." : "Status data is temporarily unavailable.",
        endpoints: ENDPOINTS,
      };
      emit();
      return currentSnapshot;
    }).finally(() => {
      inFlight = null;
    });
    return inFlight;
  };

  const subscribe = (listener) => {
    if (typeof listener !== "function") return () => {};
    listeners.add(listener);
    if (currentSnapshot) listener(currentSnapshot);
    return () => listeners.delete(listener);
  };

  const start = () => {
    if (!intervalId) intervalId = window.setInterval(() => refresh(), POLL_INTERVAL_MS);
    if (!visibilityBound) {
      visibilityBound = true;
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
    REQUEST_TIMEOUT_MS,
    refresh,
    subscribe,
    start,
    stop,
    getSnapshot: () => currentSnapshot,
  });
})();
