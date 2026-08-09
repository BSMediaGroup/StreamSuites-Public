(() => {
  "use strict";

  const helpers = window.StreamSuitesStatusHelpers;
  const store = window.StreamSuitesStatusData;
  if (!helpers || !store) return;

  const {
    STATE_META,
    stateFromIndicator,
    normalizeComponent,
    groupComponents,
    unresolvedIncidents,
    activeMaintenances,
    formatRelative,
  } = helpers;

  const STATUS_COLORS = Object.freeze({
    operational: "#62dea2",
    degraded: "#f2b84b",
    partial: "#ef8c57",
    major: "#ff6464",
    critical: "#ff6464",
    maintenance: "#78b9ff",
    unknown: "#8a96a3",
  });

  const state = {
    snapshot: null,
    search: "",
    filter: "all",
    expanded: new Set(),
    graphRanges: new Map(),
    graphEntrances: new Set(),
  };

  const COMPONENT_PRESENTATION = Object.freeze({
    "3qsdkc52dgt5": { icon: "/assets/icons/icondiag-studioweb.svg", description: "Browser-based studio shell and production workspace." },
    "b6k38lrqx93f": { icon: "/assets/icons/ui/cast.svg", description: "Realtime media and guest connection readiness." },
    "q7435t6bd41x": { icon: "/assets/icons/icondiag-studioapp.svg", description: "Native StudioApp access to connected Runtime services." },
    "4fp296vdg5w7": { icon: "/assets/icons/ui/tvlive.svg", description: "Streaming destination readiness and secure credential delivery." },
    "94cn19vph28j": { icon: "/assets/icons/obs-0.svg", description: "Studio for OBS connected service boundary." },
    "tb383cr2p92n": { icon: "/assets/icons/ui/shieldlock.svg", description: "Authentication, account authority, and managed sessions." },
    "4vrh4mg9l4hn": { icon: "/assets/icons/ui/meetingroom.svg", description: "Studio rooms, participants, and room-scoped invitations." },
    "0xm0hsy3byjj": { icon: "/assets/icons/ui/storage.svg", description: "Public APIs, published exports, and the canonical version registry." },
    "3xjjgpbydbbf": { icon: "/assets/icons/ui/zap.svg", description: "Creator-scoped automation and trigger execution." },
    "qbczblv2hgv8": { icon: "/assets/icons/ui/status-bell.svg", description: "Alert evaluation and notification delivery." },
    "6ww27z4z9vj8": { icon: "/assets/icons/ui/chatnotif.svg", description: "Platform integrations and live-chat services." },
    "zx07yy34tyvl": { icon: "/assets/icons/ui/ss-public.svg", description: "Public website and this Status Center." },
    "rdb3pmbvr4bv": { icon: "/assets/icons/ui/photostackflower.svg", description: "Public profiles, community discovery, and artifacts." },
    "5wm11qq4b7w9": { icon: "/assets/icons/ui/ss-creator.svg", description: "Creator-facing dashboard and control surfaces." },
    "jnd29jsl8w7b": { icon: "/assets/icons/ui/ss-admin.svg", description: "Administrative dashboard and operations surfaces." },
    "8x9n41kfjtc8": { icon: "/assets/icons/ui/ss-developer.svg", description: "Developer console and shipped-reality documentation." },
    "p00vypwhfhx3": { icon: "/assets/icons/ui/download.svg", description: "Fail-closed downloads and update distribution." },
    "n1lw27451j6d": { icon: "/assets/icons/cloudflare-0.svg", description: "Cloudflare-managed Pages delivery state." },
    "8zfbmn6ynv99": { icon: "/assets/icons/ui/status-envelope.svg", description: "Transactional email delivery." },
    "5qbjrf4hq5nn": { icon: "/assets/icons/stripeicon-0.svg", description: "Stripe-managed payment API state." },
    "gd23vgnp3n89": { icon: "/assets/icons/github-0.svg", description: "GitHub-managed Git operations state." },
  });
  const IMPLEMENTED_COMPONENTS = new Set(["3qsdkc52dgt5", "q7435t6bd41x", "94cn19vph28j", "tb383cr2p92n", "0xm0hsy3byjj", "zx07yy34tyvl", "rdb3pmbvr4bv", "5wm11qq4b7w9", "jnd29jsl8w7b", "8x9n41kfjtc8", "p00vypwhfhx3"]);
  const VENDOR_COMPONENTS = new Set(["n1lw27451j6d", "5qbjrf4hq5nn", "gd23vgnp3n89"]);
  const GROUP_PRESENTATION = Object.freeze({
    production: { accent: "#6f9dff", role: "Creation products and their connected production services." },
    core: { accent: "#51d4e8", role: "Identity, rooms, APIs, automation, and notification authority." },
    web: { accent: "#987cff", role: "Audience, creator, admin, developer, documentation, and distribution surfaces." },
    surfaces: { accent: "#987cff", role: "Public and operator-facing product surfaces." },
    edge: { accent: "#987cff", role: "Delivery and edge services." },
    dependencies: { accent: "#f1bc62", role: "External delivery, email, payment, and Git operations." },
  });
  const CORE_API_COMPONENT_ID = "tb383cr2p92n";

  const select = (selector, root = document) => root.querySelector(selector);
  const selectAll = (selector, root = document) => [...root.querySelectorAll(selector)];
  const node = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text != null) element.textContent = text;
    return element;
  };

  const formatAbsolute = (value, { includeTime = true } = {}) => {
    const ms = Date.parse(value || "");
    if (!Number.isFinite(ms)) return "Date unavailable";
    return new Intl.DateTimeFormat(undefined, includeTime
      ? { dateStyle: "medium", timeStyle: "short" }
      : { dateStyle: "medium" }
    ).format(new Date(ms));
  };

  const truncate = (value, limit = 220) => {
    const text = String(value || "").trim();
    if (!text) return "";
    if (text.length <= limit) return text;
    const slice = text.slice(0, limit);
    const space = slice.lastIndexOf(" ");
    return `${slice.slice(0, space > 100 ? space : limit)}…`;
  };

  const inferGroupKey = (group) => {
    const id = String(group?.id || "");
    if (id === "statuspage:h70vntnsh3v9") return "production";
    if (id === "statuspage:z1wlqnyx91nl") return "core";
    if (id === "statuspage:mrlp0c2t3vlb") return "web";
    if (id === "statuspage:n8hrjx9krwgt") return "dependencies";
    if (["core", "surfaces", "edge", "dependencies"].includes(id)) return id;
    const label = String(group?.label || "").toLowerCase();
    if (/core|runtime|identity|auth/.test(label)) return "core";
    if (/production product/.test(label)) return "production";
    if (/web|audience/.test(label)) return "web";
    if (/surface|product|client|application/.test(label)) return "surfaces";
    if (/edge|delivery|network|cloudflare/.test(label)) return "edge";
    return "dependencies";
  };

  const groupState = (components) => {
    const ranks = { operational: 0, maintenance: 1, degraded: 2, partial: 3, major: 4, critical: 5, unknown: 6 };
    return (components || [])
      .map((component) => normalizeComponent(component).normalizedState)
      .sort((a, b) => ranks[b] - ranks[a])[0] || "unknown";
  };

  const setText = (selector, value) => {
    const element = select(selector);
    if (element) element.textContent = value;
  };

  const renderHero = (snapshot) => {
    const data = snapshot.data;
    const components = (Array.isArray(data.components) ? data.components : []).filter((component) => !component?.group).map(normalizeComponent);
    const operational = components.filter((component) => component.normalizedState === "operational").length;
    const overallState = stateFromIndicator(data.status?.indicator, data.status?.description);
    const meta = STATE_META[overallState] || STATE_META.unknown;
    const core = select(".system-pulse__core");
    const pulse = select(".system-pulse");

    if (core) core.dataset.overallState = overallState;
    if (pulse) pulse.style.setProperty("--state-color", STATUS_COLORS[overallState] || STATUS_COLORS.unknown);
    document.documentElement.style.setProperty("--state-color", STATUS_COLORS[overallState] || STATUS_COLORS.unknown);

    const stateMark = select(".system-pulse__state-mark");
    if (stateMark) {
      stateMark.dataset.state = overallState;
      stateMark.textContent = overallState === "operational" ? "" : meta.mark;
    }
    setText("[data-overall-description]", data.status?.description || meta.label);
    setText("[data-overall-subtitle]", overallState === "operational"
      ? "No active system-wide disruption is being reported."
      : "Review the affected components and incident updates below.");
    setText("[data-hero-operational]", String(operational));
    setText("[data-hero-total]", String(components.length));
    setText("[data-hero-latency]", snapshot.latencyMs == null ? "—" : `${snapshot.latencyMs} ms`);

    const sourceChip = select("[data-source-chip]");
    if (sourceChip) {
      const sourceState = snapshot.live ? "live" : "unavailable";
      sourceChip.dataset.state = sourceState;
      const textNode = [...sourceChip.childNodes].find((item) => item.nodeType === Node.TEXT_NODE);
      if (textNode) textNode.textContent = snapshot.live ? " Atlassian Statuspage" : " Status unavailable";
    }
    setText("[data-last-checked]", `Checked ${formatRelative(snapshot.checkedAt)}${snapshot.stale ? " · live refresh unavailable" : ""}`);

    const liveBadge = select("[data-live-badge]");
    if (liveBadge) {
      liveBadge.dataset.state = snapshot.live ? "live" : "unavailable";
      liveBadge.innerHTML = `<span></span>${snapshot.live ? "LIVE" : snapshot.stale ? "STALE" : "UNAVAILABLE"}`;
    }

    const groups = groupComponents(data.components);
    const aggregate = { production: [], core: [], web: [], dependencies: [] };
    groups.forEach((group) => {
      const key = inferGroupKey(group);
      aggregate[key].push(...group.components);
    });
    Object.entries(aggregate).forEach(([key, items]) => {
      const normalized = items.map(normalizeComponent);
      const count = normalized.filter((component) => component.normalizedState === "operational").length;
      const summary = select(`[data-group-summary="${key}"]`);
      const nodeElement = select(`[data-group-node="${key}"]`);
      if (summary) summary.textContent = normalized.length ? `${count}/${normalized.length} operational` : "No components";
      if (nodeElement) nodeElement.dataset.state = groupState(normalized);
    });
  };

  const renderMetrics = (snapshot) => {
    const data = snapshot.data;
    const components = (Array.isArray(data.components) ? data.components : []).filter((component) => !component?.group).map(normalizeComponent);
    const operational = components.filter((component) => component.normalizedState === "operational").length;
    const incidents = unresolvedIncidents(data.incidents);
    const maintenances = activeMaintenances(data.scheduled_maintenances);
    const overallState = stateFromIndicator(data.status?.indicator, data.status?.description);
    const meta = STATE_META[overallState] || STATE_META.unknown;

    setText("[data-metric-overall]", meta.short);
    setText("[data-metric-operational]", `${operational}/${components.length}`);
    setText("[data-metric-incidents]", String(incidents.length));
    setText("[data-metric-maintenance]", String(maintenances.length));
    const coreMetric = snapshot.diagnostics?.metrics?.core_api_response_time;
    const coreBuckets = coreMetric?.history?.["24h"]?.buckets || [];
    const measured = coreBuckets.map((bucket) => bucket?.latency_ms).filter(Number.isFinite);
    const trendDelta = measured.length > 1 ? measured[measured.length - 1] - measured[0] : null;
    const trend = trendDelta == null ? "trend forming" : Math.abs(trendDelta) < 2 ? "steady" : `${trendDelta > 0 ? "↑" : "↓"} ${Math.abs(trendDelta)} ms`;
    setText("[data-diagnostic-core-value]", coreMetric?.value_ms == null ? "Awaiting measured data" : `${coreMetric.value_ms} ms`);
    setText("[data-diagnostic-core-meta]", coreMetric?.value_ms == null
      ? "No real watchdog latency sample is available."
      : `${coreBuckets.length} plotted five-minute buckets from ${coreMetric.history?.["24h"]?.sample_count || 0} raw probe observations · ${snapshot.diagnosticsStale ? "stale" : "fresh"} · ${trend}`);
    const coreHistoryButton = select("[data-diagnostic-core-history]");
    if (coreHistoryButton) {
      coreHistoryButton.disabled = coreBuckets.length === 0;
      coreHistoryButton.textContent = coreBuckets.length ? "View 24H / 7D / 30D history ↓" : "History unavailable";
    }
    setText("[data-diagnostic-room-value]", "Deferred");
    const diagnosticSource = select("[data-diagnostic-source]");
    if (diagnosticSource) {
      diagnosticSource.dataset.state = snapshot.diagnosticsLive ? "live" : snapshot.diagnostics ? "stale" : "unavailable";
      diagnosticSource.textContent = snapshot.diagnosticsLive ? "Independent diagnostics connected" : snapshot.diagnostics ? "Independent diagnostics stale" : "Atlassian-only mode";
    }
  };

  const matchesFilter = (component) => {
    const name = String(component.name || "").toLowerCase();
    if (state.search && !name.includes(state.search)) return false;
    if (state.filter === "operational") return component.normalizedState === "operational";
    if (state.filter === "attention") return component.normalizedState !== "operational";
    return true;
  };

  const diagnosticFor = (component, snapshot) => snapshot.diagnostics?.components?.[component.id] ||
    Object.values(snapshot.diagnostics?.components || {}).find((item) => item?.component_id === component.id) || null;

  const fallbackCoverage = (componentId) => VENDOR_COMPONENTS.has(componentId)
    ? { owner: "atlassian_third_party", coverage: "vendor_managed", monitor_mode: "external_provider" }
    : IMPLEMENTED_COMPONENTS.has(componentId)
      ? { owner: "watchdog", coverage: "implemented", monitor_mode: "external_black_box" }
      : { owner: "manual_deferred", coverage: "deferred", monitor_mode: "deferred" };

  const chipLabel = (value) => ({
    watchdog: "Independent watchdog",
    atlassian_third_party: "Atlassian integration",
    manual_deferred: "Manual / deferred",
    implemented: "Automated coverage",
    vendor_managed: "Vendor managed",
    deferred: "Monitoring deferred",
    external_black_box: "External black box",
    safe_authority_boundary: "Safe authority boundary",
    direct_diagnostic: "Direct diagnostic",
    external_provider: "External provider",
  })[value] || String(value || "Unavailable").replaceAll("_", " ");

  const detailItem = (label, value) => {
    const wrapper = node("div", "component-detail");
    wrapper.append(node("dt", "", label), node("dd", "", value || "Unavailable"));
    return wrapper;
  };

  const CHART_RANGE_META = Object.freeze({
    "24h": { durationMs: 86400000, intervalMs: 300000, gapToleranceMs: 150000, maxGapMs: 450000, tickCount: 5, bucketLabel: "five-minute buckets" },
    "7d": { durationMs: 604800000, intervalMs: 86400000, gapToleranceMs: 43200000, maxGapMs: 129600000, tickCount: 5, bucketLabel: "daily aggregate buckets" },
    "30d": { durationMs: 2592000000, intervalMs: 86400000, gapToleranceMs: 43200000, maxGapMs: 129600000, tickCount: 6, bucketLabel: "daily aggregate buckets" },
  });
  const CHART_VIEW = Object.freeze({ width: 760, height: 270, left: 58, right: 742, top: 34, bottom: 176, stateY: 202, stateHeight: 18, axisY: 258 });
  const OBSERVED_STATE_LABELS = Object.freeze({
    operational: "Operational",
    degraded: "Degraded performance",
    partial: "Partial outage",
    major: "Major outage",
    maintenance: "Maintenance",
    unknown: "Unknown",
  });
  let chartSequence = 0;

  const observedStateKey = (value) => {
    const normalized = String(value || "unknown").toLowerCase();
    if (normalized === "operational") return "operational";
    if (normalized.includes("degraded")) return "degraded";
    if (normalized.includes("partial")) return "partial";
    if (normalized.includes("major") || normalized.includes("critical")) return "major";
    if (normalized.includes("maintenance")) return "maintenance";
    return "unknown";
  };

  const normalizeBucketTimestamp = (value, intervalMs) => {
    const parsed = Date.parse(value || "");
    if (!Number.isFinite(parsed)) return null;
    return Math.floor(parsed / intervalMs) * intervalMs;
  };

  const formatGapDuration = (durationMs) => {
    const minutes = Math.max(1, Math.round(durationMs / 60000));
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    return remainder ? `${hours} hours ${remainder} minutes` : `${hours} ${hours === 1 ? "hour" : "hours"}`;
  };

  const buildChartModel = (buckets, rangeKey) => {
    const rangeMeta = CHART_RANGE_META[rangeKey] || CHART_RANGE_META["24h"];
    const parsedObservations = (Array.isArray(buckets) ? buckets : []).map((bucket) => {
      const time = normalizeBucketTimestamp(bucket?.at, rangeMeta.intervalMs);
      return {
        source: bucket,
        at: Number.isFinite(time) ? new Date(time).toISOString() : bucket?.at,
        time,
        latency: Number.isFinite(bucket?.latency_ms) ? Number(bucket.latency_ms) : null,
        availability: Number.isFinite(bucket?.availability_percent) ? Number(bucket.availability_percent) : null,
        state: observedStateKey(bucket?.state),
      };
    }).filter((observation) => Number.isFinite(observation.time)).sort((a, b) => a.time - b.time);
    const deduplicated = [...new Map(parsedObservations.map((observation) => [observation.time, observation])).values()];
    const endTime = deduplicated.at(-1)?.time || 0;
    const startTime = endTime - rangeMeta.durationMs;
    const observations = deduplicated.filter((observation) => observation.time >= startTime && observation.time <= endTime);
    const plotWidth = CHART_VIEW.right - CHART_VIEW.left;
    observations.forEach((observation) => {
      const ratio = (observation.time - startTime) / rangeMeta.durationMs;
      observation.x = CHART_VIEW.left + Math.max(0, Math.min(1, ratio)) * plotWidth;
    });
    const latencyPoints = observations.filter((observation) => observation.latency !== null);
    const latencyValues = latencyPoints.map((observation) => observation.latency);
    const observedMin = latencyValues.length ? Math.min(...latencyValues) : null;
    const observedMax = latencyValues.length ? Math.max(...latencyValues) : null;
    const spread = observedMin == null ? 0 : observedMax - observedMin;
    const padding = observedMax == null ? 0 : Math.max(3, spread * .2, observedMax * .045);
    const domainMin = observedMin == null ? null : Math.max(0, observedMin - padding);
    const domainMax = observedMax == null ? null : Math.max(domainMin + 1, observedMax + padding);
    const segments = [];
    const gaps = [];
    const firstObservation = observations[0] || null;
    const leadingGap = firstObservation && firstObservation.time - startTime > rangeMeta.maxGapMs
      ? {
          kind: "leading",
          fromTime: startTime,
          to: firstObservation,
          durationMs: firstObservation.time - startTime,
          fromX: CHART_VIEW.left,
          toX: firstObservation.x,
        }
      : null;
    let segment = [];
    let previousMeasured = null;
    let explicitUnmeasured = false;
    const flushSegment = () => {
      if (segment.length) segments.push(segment);
      segment = [];
    };
    observations.forEach((observation) => {
      if (observation.latency === null) {
        flushSegment();
        explicitUnmeasured = true;
        return;
      }
      const timestampGap = previousMeasured && observation.time - previousMeasured.time > rangeMeta.maxGapMs;
      if (previousMeasured && (explicitUnmeasured || timestampGap)) {
        flushSegment();
        const durationMs = observation.time - previousMeasured.time;
        gaps.push({
          from: previousMeasured,
          to: observation,
          durationMs,
          missingBucketCount: Math.max(1, Math.round(durationMs / rangeMeta.intervalMs) - 1),
          reason: explicitUnmeasured ? "missing_measurement" : "missing_interval",
        });
      }
      segment.push(observation);
      previousMeasured = observation;
      explicitUnmeasured = false;
    });
    flushSegment();
    return {
      rangeKey,
      rangeMeta,
      observations,
      latencyPoints,
      segments,
      gaps,
      leadingGap,
      startTime,
      endTime,
      domainMin,
      domainMax,
      graphType: latencyPoints.length ? "latency" : "state",
      plottedBucketCount: observations.length,
      plottedMeasurementCount: latencyPoints.length,
      stateBandWidth: Math.max(2.4, plotWidth * (rangeMeta.intervalMs / rangeMeta.durationMs) * .86),
    };
  };

  const internalMissingRailMarkers = (model) => {
    if (!model?.gaps?.length) return [];
    const observedTimes = new Set(model.observations.map((observation) => observation.time));
    const plotWidth = CHART_VIEW.right - CHART_VIEW.left;
    return model.gaps.flatMap((gap) => {
      const markers = [];
      for (let time = gap.from.time + model.rangeMeta.intervalMs; time < gap.to.time; time += model.rangeMeta.intervalMs) {
        if (observedTimes.has(time)) continue;
        const ratio = (time - model.startTime) / model.rangeMeta.durationMs;
        markers.push({
          time,
          x: CHART_VIEW.left + Math.max(0, Math.min(1, ratio)) * plotWidth,
          gap,
        });
      }
      return markers;
    });
  };

  const smoothChartPath = (points) => {
    if (!points.length) return "";
    if (points.length === 1) return `M${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
    if (points.length === 2) return `M${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)} L${points[1].x.toFixed(2)} ${points[1].y.toFixed(2)}`;
    const slopes = points.slice(0, -1).map((point, index) => (points[index + 1].y - point.y) / Math.max(.001, points[index + 1].x - point.x));
    const tangents = points.map((point, index) => {
      if (index === 0) return slopes[0];
      if (index === points.length - 1) return slopes.at(-1);
      return slopes[index - 1] * slopes[index] <= 0 ? 0 : (slopes[index - 1] + slopes[index]) / 2;
    });
    slopes.forEach((slope, index) => {
      if (slope === 0) {
        tangents[index] = 0;
        tangents[index + 1] = 0;
        return;
      }
      const a = tangents[index] / slope;
      const b = tangents[index + 1] / slope;
      const magnitude = Math.hypot(a, b);
      if (magnitude <= 3) return;
      const scale = 3 / magnitude;
      tangents[index] = scale * a * slope;
      tangents[index + 1] = scale * b * slope;
    });
    let path = `M${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
    points.slice(0, -1).forEach((point, index) => {
      const next = points[index + 1];
      const distance = next.x - point.x;
      path += ` C${(point.x + distance / 3).toFixed(2)} ${(point.y + tangents[index] * distance / 3).toFixed(2)} ${(next.x - distance / 3).toFixed(2)} ${(next.y - tangents[index + 1] * distance / 3).toFixed(2)} ${next.x.toFixed(2)} ${next.y.toFixed(2)}`;
    });
    return path;
  };

  const nearestChartObservation = (observations, x) => observations.reduce((nearest, observation) => (
    !nearest || Math.abs(observation.x - x) < Math.abs(nearest.x - x) ? observation : nearest
  ), null);
  const tooltipDataForObservation = (observation) => ({
    at: observation?.at || "",
    state: OBSERVED_STATE_LABELS[observation?.state] || OBSERVED_STATE_LABELS.unknown,
    latency: observation?.latency ?? null,
    availability: observation?.availability ?? null,
  });
  const chartMotionReduced = () => window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;
  const svgNode = (tag, className) => {
    const element = document.createElementNS("http://www.w3.org/2000/svg", tag);
    if (className) element.setAttribute("class", className);
    return element;
  };
  const chartFrame = (callback) => (window.requestAnimationFrame || ((next) => window.setTimeout(next, 0)))(callback);

  const cancelChartEntrance = (panel) => {
    panel._chartEntranceObserver?.disconnect();
    panel._chartEntranceObserver = null;
    if (panel._chartEntranceTimer) window.clearTimeout(panel._chartEntranceTimer);
    panel._chartEntranceTimer = null;
    panel.dataset.chartEntranceToken = String(Number(panel.dataset.chartEntranceToken || 0) + 1);
    delete panel.dataset.chartEntranceStarted;
    panel.classList.remove("is-chart-primed", "is-chart-entering", "is-chart-visible");
    selectAll(".component-graph__line", panel).forEach((path) => {
      path.style.removeProperty("--chart-draw-length");
      path.style.removeProperty("stroke-dasharray");
      path.style.removeProperty("stroke-dashoffset");
    });
  };

  const primeChartEntrance = (panel) => {
    cancelChartEntrance(panel);
    const token = panel.dataset.chartEntranceToken;
    if (chartMotionReduced()) {
      panel.dataset.chartMotion = "reduced";
      panel.classList.add("is-chart-visible");
      return null;
    }
    panel.dataset.chartMotion = "animated";
    selectAll(".component-graph__line", panel).forEach((path) => {
      const length = Math.max(1, path.getTotalLength());
      path.style.setProperty("--chart-draw-length", `${length}px`);
      path.style.strokeDasharray = `${length}px`;
    });
    const railBars = selectAll(".component-graph__state-bar", panel);
    railBars.forEach((bar, index) => {
      const progress = railBars.length <= 1 ? 0 : index / (railBars.length - 1);
      bar.style.setProperty("--rail-reveal-delay", `${Math.round(progress * 320)}ms`);
    });
    panel.classList.add("is-chart-primed");
    return token;
  };

  const startChartEntrance = (panel, token) => {
    if (!token || panel.dataset.chartEntranceToken !== token) return;
    if (panel.dataset.chartEntranceStarted === token) return;
    panel.dataset.chartEntranceStarted = token;
    panel._chartEntranceObserver?.disconnect();
    panel._chartEntranceObserver = null;
    chartFrame(() => {
      if (panel.dataset.chartEntranceToken !== token) return;
      panel.classList.add("is-chart-entering");
      chartFrame(() => {
        if (panel.dataset.chartEntranceToken !== token) return;
        panel.classList.remove("is-chart-primed");
        panel.classList.add("is-chart-visible");
      });
    });
    panel._chartEntranceTimer = window.setTimeout(() => {
      if (panel.dataset.chartEntranceToken !== token) return;
      panel.classList.remove("is-chart-primed", "is-chart-entering");
      selectAll(".component-graph__line", panel).forEach((path) => {
        path.style.removeProperty("--chart-draw-length");
        path.style.removeProperty("stroke-dasharray");
        path.style.removeProperty("stroke-dashoffset");
      });
      panel._chartEntranceTimer = null;
    }, 3100);
  };

  const queueChartEntrance = (panel) => {
    const prepare = () => {
      if (!panel.isConnected) {
        chartFrame(prepare);
        return;
      }
      const token = primeChartEntrance(panel);
      if (!token) return;
      const plot = select(".component-graph__plot", panel);
      if (!plot) return;
      const startWhenVisible = () => {
        if (panel.dataset.chartEntranceToken !== token) return;
        const bounds = plot.getBoundingClientRect();
        const viewportTop = window.innerHeight * .08;
        const viewportBottom = window.innerHeight * .92;
        const visiblePixels = Math.max(0, Math.min(bounds.bottom, viewportBottom) - Math.max(bounds.top, viewportTop));
        if (visiblePixels < Math.min(160, bounds.height * .22)) return;
        startChartEntrance(panel, token);
      };
      startWhenVisible();
      if (panel.dataset.chartEntranceStarted === token) return;
      if (!("IntersectionObserver" in window)) {
        startChartEntrance(panel, token);
        return;
      }
      panel._chartEntranceObserver = new IntersectionObserver(startWhenVisible, {
        rootMargin: "-8% 0px -8% 0px",
        threshold: [.16, .3],
      });
      panel._chartEntranceObserver.observe(plot);
    };
    if (panel.isConnected) prepare();
    else chartFrame(prepare);
  };

  window.StreamSuitesStatusChartHelpers = Object.freeze({
    buildChartModel,
    formatGapDuration,
    internalMissingRailMarkers,
    nearestChartObservation,
    normalizeBucketTimestamp,
    observedStateKey,
    smoothChartPath,
    tooltipDataForObservation,
  });

  const createIntentionalState = (kind, title, description, source) => {
    const wrapper = node("div", "component-intentional-state");
    wrapper.dataset.kind = kind;
    const copy = node("div", "component-intentional-state__copy");
    copy.append(node("span", "", kind === "provider" ? "Provider-owned state" : "Intentional monitoring boundary"), node("strong", "", title), node("p", "", description), node("small", "", source));
    wrapper.append(node("span", "component-intentional-state__signal"), copy);
    return wrapper;
  };

  const renderHistoryGraph = (panel, diagnostic, requestedRange, options = {}) => {
    cancelChartEntrance(panel);
    panel.innerHTML = "";
    panel.classList.remove("is-range-leaving", "is-range-entering", "is-range-visible");
    const ranges = ["24h", "7d", "30d"];
    const available = ranges.filter((key) => (diagnostic?.history?.[key]?.buckets || []).length);
    const activeRange = available.includes(requestedRange) ? requestedRange : available[0];
    const heading = node("div", "component-graph__heading");
    heading.append(node("span", "", options.isCoreApi ? "Atlassian custom metric" : "Direct analytics"), node("h5", "", options.isCoreApi ? "Core API response time" : `${options.componentName || "Component"} history`));
    const header = node("div", "component-graph__header");
    header.appendChild(heading);
    panel.appendChild(header);
    const toolbar = node("div", "component-graph__toolbar");
    const controls = node("div", "component-graph__controls");
    controls.setAttribute("aria-label", "Watchdog history range");
    controls.setAttribute("role", "group");
    ranges.forEach((key) => {
      const button = node("button", key === activeRange ? "is-active" : "", key.toUpperCase());
      button.type = "button";
      button.dataset.graphRange = key;
      button.disabled = !available.includes(key);
      button.setAttribute("aria-pressed", String(key === activeRange));
      button.addEventListener("click", () => {
        if (key === activeRange) return;
        state.graphRanges.set(diagnostic.component_id, key);
        const applyRange = () => renderHistoryGraph(panel, diagnostic, key, { ...options, transition: "range", focusRange: key });
        if (chartMotionReduced()) applyRange();
        else {
          panel.classList.add("is-range-leaving");
          panel.setAttribute("aria-busy", "true");
          window.setTimeout(applyRange, 130);
        }
      });
      controls.appendChild(button);
    });
    controls.addEventListener("keydown", (event) => {
      if (!event.target.matches("button[data-graph-range]")) return;
      const enabled = [...controls.querySelectorAll("button:not(:disabled)")];
      const current = enabled.indexOf(event.target);
      let next = null;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") next = enabled[(current + 1) % enabled.length];
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = enabled[(current - 1 + enabled.length) % enabled.length];
      if (event.key === "Home") next = enabled[0];
      if (event.key === "End") next = enabled.at(-1);
      if (!next) return;
      event.preventDefault();
      next.click();
    });
    toolbar.appendChild(controls);
    panel.appendChild(toolbar);
    if (!activeRange) {
      const empty = node("div", "component-graph__empty");
      empty.append(node("strong", "", "No real history yet"), node("p", "", "Historical direct diagnostics will begin when watchdog observations are available. Nothing is interpolated or backfilled."));
      panel.appendChild(empty);
      return;
    }
    const range = diagnostic.history[activeRange];
    const buckets = range.buckets;
    const model = buildChartModel(buckets, activeRange);
    if (!model.observations.length) {
      const empty = node("div", "component-graph__empty");
      empty.append(node("strong", "", "No readable observations"), node("p", "", "The selected range contains no timestamped watchdog observations. No substitute history is drawn."));
      panel.appendChild(empty);
      return;
    }
    panel.dataset.chartType = model.graphType;
    const summary = node("p", "component-graph__summary");
    const rawObservationCount = Number.isFinite(range.sample_count) ? Number(range.sample_count) : 0;
    const gapLabel = `${model.gaps.length} internal unmeasured ${model.gaps.length === 1 ? "interval" : "intervals"}`;
    const leadingHistoryLabel = model.leadingGap
      ? ` Earlier selected-range time predates the available history by ${formatGapDuration(model.leadingGap.durationMs)}.`
      : "";
    summary.textContent = `${activeRange.toUpperCase()} watchdog-observed availability: ${range.availability_percent == null ? "Unavailable" : `${range.availability_percent}%`}. ${model.plottedBucketCount} plotted ${model.rangeMeta.bucketLabel} from ${rawObservationCount} raw probe observations; ${gapLabel}.${leadingHistoryLabel}`;
    summary.setAttribute("role", "status");
    panel.appendChild(summary);

    const latestObservation = model.observations.at(-1);
    const latestLatency = model.latencyPoints.at(-1);
    const currentValue = node("div", "component-graph__current");
    currentValue.append(
      node("span", "", latestLatency ? "Latest measured latency" : "Latest observed state"),
      node("strong", "", latestLatency ? `${latestLatency.latency} ms` : OBSERVED_STATE_LABELS[latestObservation.state]),
      node("small", "", `${formatAbsolute((latestLatency || latestObservation).at)} · ${options.stale ? "stale diagnostics" : "latest received"}`)
    );
    header.appendChild(currentValue);

    const metrics = node("div", "component-graph__metrics");
    const appendMetric = (label, value) => {
      const item = node("div", "component-graph__metric");
      item.append(node("span", "", label), node("strong", "", value));
      metrics.appendChild(item);
    };
    appendMetric("Plotted buckets", String(model.plottedBucketCount));
    appendMetric("Latency buckets", String(model.plottedMeasurementCount));
    appendMetric("Raw observations", String(rawObservationCount));
    appendMetric("Missing intervals", String(model.gaps.length));
    appendMetric("Availability", range.availability_percent == null ? "Unavailable" : `${range.availability_percent}%`);
    appendMetric("Freshness", options.stale ? "Stale" : "Current projection");
    if (options.isCoreApi) appendMetric("Last success", diagnostic.last_success ? formatAbsolute(diagnostic.last_success) : "Unavailable");
    const latencyValues = model.latencyPoints.map((point) => point.latency);
    if (latencyValues.length >= 3) {
      appendMetric("Range min", `${Math.min(...latencyValues)} ms`);
      appendMetric("Observed average", `${Math.round(latencyValues.reduce((sum, value) => sum + value, 0) / latencyValues.length)} ms`);
      appendMetric("Range max", `${Math.max(...latencyValues)} ms`);
    }
    if (options.isCoreApi && latencyValues.length >= 2) {
      const delta = latencyValues.at(-1) - latencyValues[0];
      appendMetric("Range change", `${delta > 0 ? "+" : ""}${delta} ms`);
    }
    toolbar.appendChild(metrics);
    panel.classList.toggle("is-sparse", model.observations.length < 3 || (model.graphType === "latency" && model.latencyPoints.length < 3));
    if (panel.classList.contains("is-sparse")) panel.appendChild(node("p", "component-graph__sparse", `History is still accumulating · ${model.observations.length} plotted ${model.observations.length === 1 ? "bucket" : "buckets"}; unmeasured time is identified separately and never included in the statistics.`));

    const svg = svgNode("svg", "component-graph__svg");
    svg.setAttribute("viewBox", `0 0 ${CHART_VIEW.width} ${CHART_VIEW.height}`);
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", summary.textContent);
    const description = svgNode("desc");
    description.textContent = `${model.plottedBucketCount} watchdog-observed buckets. ${model.plottedMeasurementCount} contain measured latency. ${model.gaps.length} internal unmeasured intervals use neutral dashed bridges with no measured fill.${model.leadingGap ? ` The first ${formatGapDuration(model.leadingGap.durationMs)} of the selected range has no available history.` : ""}`;
    svg.appendChild(description);
    const definitionId = `status-chart-${String(diagnostic.component_id || "component").replace(/[^a-z0-9_-]/gi, "")}-${++chartSequence}`;
    const defs = svgNode("defs");
    const lineGradient = svgNode("linearGradient");
    lineGradient.id = `${definitionId}-line`;
    lineGradient.setAttribute("gradientUnits", "userSpaceOnUse");
    lineGradient.setAttribute("x1", String(CHART_VIEW.left));
    lineGradient.setAttribute("x2", String(CHART_VIEW.right));
    [["0%", "component-graph__stop component-graph__stop--start"], ["58%", "component-graph__stop component-graph__stop--mid"], ["100%", "component-graph__stop component-graph__stop--end"]].forEach(([offset, className]) => {
      const stop = svgNode("stop", className);
      stop.setAttribute("offset", offset);
      lineGradient.appendChild(stop);
    });
    const areaGradient = svgNode("linearGradient");
    areaGradient.id = `${definitionId}-area`;
    areaGradient.setAttribute("gradientUnits", "userSpaceOnUse");
    areaGradient.setAttribute("x1", String(CHART_VIEW.left));
    areaGradient.setAttribute("x2", String(CHART_VIEW.left));
    areaGradient.setAttribute("y1", String(CHART_VIEW.top));
    areaGradient.setAttribute("y2", String(CHART_VIEW.bottom));
    [["0%", "component-graph__stop component-graph__stop--fill-top"], ["58%", "component-graph__stop component-graph__stop--fill-low"], ["84%", "component-graph__stop component-graph__stop--fill-tail"], ["100%", "component-graph__stop component-graph__stop--fill-bottom"]].forEach(([offset, className]) => {
      const stop = svgNode("stop", className);
      stop.setAttribute("offset", offset);
      areaGradient.appendChild(stop);
    });
    defs.append(lineGradient, areaGradient);
    svg.appendChild(defs);

    const plotWidth = CHART_VIEW.right - CHART_VIEW.left;
    const yFor = (value) => CHART_VIEW.bottom - ((value - model.domainMin) / Math.max(1, model.domainMax - model.domainMin)) * (CHART_VIEW.bottom - CHART_VIEW.top);
    if (model.graphType === "latency") {
      [0, 1 / 3, 2 / 3, 1].forEach((ratio) => {
        const y = CHART_VIEW.top + ratio * (CHART_VIEW.bottom - CHART_VIEW.top);
        const gridLine = svgNode("line", "component-graph__gridline");
        gridLine.setAttribute("x1", String(CHART_VIEW.left));
        gridLine.setAttribute("x2", String(CHART_VIEW.right));
        gridLine.setAttribute("y1", String(y));
        gridLine.setAttribute("y2", String(y));
        const label = svgNode("text", "component-graph__axis-label component-graph__axis-label--y");
        label.setAttribute("x", String(CHART_VIEW.left - 9));
        label.setAttribute("y", String(y + 3));
        label.setAttribute("text-anchor", "end");
        label.textContent = `${Math.round(model.domainMax - ratio * (model.domainMax - model.domainMin))} ms`;
        svg.append(gridLine, label);
      });
    } else {
      const stateLabel = svgNode("text", "component-graph__axis-label component-graph__axis-label--state");
      stateLabel.setAttribute("x", String(CHART_VIEW.left));
      stateLabel.setAttribute("y", "72");
      stateLabel.textContent = "WATCHDOG-OBSERVED COMPONENT STATE";
      const track = svgNode("rect", "component-graph__state-track");
      track.setAttribute("x", String(CHART_VIEW.left));
      track.setAttribute("y", "86");
      track.setAttribute("width", String(plotWidth));
      track.setAttribute("height", "46");
      track.setAttribute("rx", "9");
      svg.append(stateLabel, track);
    }

    const xTickCount = model.rangeMeta.tickCount;
    const xAxisLabels = node("div", "component-graph__x-axis");
    for (let index = 0; index < xTickCount; index += 1) {
      const ratio = index / (xTickCount - 1);
      const x = CHART_VIEW.left + ratio * plotWidth;
      const gridLine = svgNode("line", "component-graph__gridline component-graph__gridline--vertical");
      gridLine.setAttribute("x1", String(x));
      gridLine.setAttribute("x2", String(x));
      gridLine.setAttribute("y1", String(model.graphType === "latency" ? CHART_VIEW.top : 86));
      gridLine.setAttribute("y2", String(model.graphType === "latency" ? CHART_VIEW.stateY + CHART_VIEW.stateHeight : 132));
      const tickTime = model.startTime + ratio * model.rangeMeta.durationMs;
      const label = node("span");
      label.textContent = activeRange === "24h"
        ? new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(tickTime)
        : new Intl.DateTimeFormat(undefined, activeRange === "7d" ? { weekday: "short", day: "numeric" } : { month: "short", day: "numeric" }).format(tickTime);
      xAxisLabels.appendChild(label);
      svg.appendChild(gridLine);
    }

    const stateY = model.graphType === "latency" ? CHART_VIEW.stateY : 90;
    const stateHeight = model.graphType === "latency" ? CHART_VIEW.stateHeight : 38;
    const missingRailHeight = Math.max(4, Math.round(stateHeight * .28));
    const missingRailY = stateY + stateHeight - missingRailHeight;
    const railGradientIds = new Map();
    const addRailGradient = (railState, y1, y2) => {
      const id = `${definitionId}-rail-${railState}`;
      const gradient = svgNode("linearGradient");
      gradient.id = id;
      gradient.setAttribute("gradientUnits", "userSpaceOnUse");
      gradient.setAttribute("x1", String(CHART_VIEW.left));
      gradient.setAttribute("x2", String(CHART_VIEW.left));
      gradient.setAttribute("y1", String(y1));
      gradient.setAttribute("y2", String(y2));
      [["0%", "top"], ["52%", "mid"], ["100%", "bottom"]].forEach(([offset, position]) => {
        const stop = svgNode("stop", `component-graph__rail-stop component-graph__rail-stop--${position}`);
        stop.setAttribute("offset", offset);
        stop.setAttribute("data-state", railState);
        gradient.appendChild(stop);
      });
      defs.appendChild(gradient);
      railGradientIds.set(railState, id);
    };
    ["operational", "degraded", "partial", "major", "maintenance", "unknown"].forEach((railState) => addRailGradient(railState, stateY, stateY + stateHeight));
    addRailGradient("missing", missingRailY, missingRailY + missingRailHeight);
    if (model.graphType === "latency") {
      const availabilityTrack = svgNode("rect", "component-graph__availability-track");
      availabilityTrack.setAttribute("x", String(CHART_VIEW.left));
      availabilityTrack.setAttribute("y", String(stateY - 3));
      availabilityTrack.setAttribute("width", String(plotWidth));
      availabilityTrack.setAttribute("height", String(stateHeight + 6));
      availabilityTrack.setAttribute("rx", "5");
      const availabilityLabel = svgNode("text", "component-graph__axis-label component-graph__axis-label--availability");
      availabilityLabel.setAttribute("x", String(CHART_VIEW.left));
      availabilityLabel.setAttribute("y", String(stateY - 10));
      availabilityLabel.textContent = "OBSERVED AVAILABILITY";
      svg.append(availabilityTrack, availabilityLabel);
    }
    const unobservedBands = [
      ...(model.leadingGap ? [{
        ...model.leadingGap,
        label: `No earlier history · ${formatGapDuration(model.leadingGap.durationMs)}`,
        title: `No watchdog history is available from ${formatAbsolute(new Date(model.leadingGap.fromTime).toISOString())} until the first observation at ${formatAbsolute(model.leadingGap.to.at)}.`,
      }] : []),
      ...model.gaps.map((gap) => ({
        ...gap,
        kind: "internal",
        fromX: gap.from.x,
        toX: gap.to.x,
        label: `No observations · ${formatGapDuration(gap.durationMs)}`,
        title: `No observations for ${formatGapDuration(gap.durationMs)} between ${formatAbsolute(gap.from.at)} and ${formatAbsolute(gap.to.at)}.`,
      })),
    ];
    unobservedBands.forEach((gap) => {
      const band = svgNode("rect", "component-graph__gap-band");
      band.setAttribute("x", String(gap.fromX));
      band.setAttribute("y", String(CHART_VIEW.top));
      band.setAttribute("width", String(Math.max(1, gap.toX - gap.fromX)));
      band.setAttribute("height", String(CHART_VIEW.bottom - CHART_VIEW.top));
      band.setAttribute("data-unmeasured", "true");
      band.setAttribute("data-gap-kind", gap.kind);
      const title = svgNode("title");
      title.textContent = gap.title;
      band.appendChild(title);
      svg.appendChild(band);
      if (gap.toX - gap.fromX >= 82) {
        const label = svgNode("text", "component-graph__gap-label");
        label.setAttribute("x", String((gap.fromX + gap.toX) / 2));
        label.setAttribute("y", String(CHART_VIEW.top + 15));
        label.setAttribute("text-anchor", "middle");
        label.setAttribute("data-gap-kind", gap.kind);
        label.textContent = gap.label;
        svg.appendChild(label);
      }
    });
    const missingMarkers = internalMissingRailMarkers(model);
    missingMarkers.forEach((marker) => {
      const bar = svgNode("rect", "component-graph__state-bar component-graph__state-bar--missing");
      bar.setAttribute("x", String(Math.max(CHART_VIEW.left, Math.min(CHART_VIEW.right - model.stateBandWidth, marker.x - model.stateBandWidth / 2))));
      bar.setAttribute("y", String(missingRailY));
      bar.setAttribute("width", String(model.stateBandWidth));
      bar.setAttribute("height", String(missingRailHeight));
      bar.setAttribute("rx", String(Math.min(2.4, missingRailHeight / 2)));
      bar.setAttribute("data-state", "missing");
      bar.setAttribute("data-unmeasured", "true");
      bar.style.fill = `url(#${railGradientIds.get("missing")})`;
      const title = svgNode("title");
      title.textContent = `${formatAbsolute(new Date(marker.time).toISOString())} · no watchdog observation`;
      bar.appendChild(title);
      svg.appendChild(bar);
    });
    model.observations.forEach((observation) => {
      const bar = svgNode("rect", "component-graph__state-bar");
      bar.setAttribute("x", String(Math.max(CHART_VIEW.left, Math.min(CHART_VIEW.right - model.stateBandWidth, observation.x - model.stateBandWidth / 2))));
      bar.setAttribute("y", String(stateY));
      bar.setAttribute("width", String(model.stateBandWidth));
      bar.setAttribute("height", String(stateHeight));
      bar.setAttribute("rx", model.graphType === "latency" ? "2" : "5");
      bar.setAttribute("data-state", observation.state);
      bar.style.fill = `url(#${railGradientIds.get(observation.state) || railGradientIds.get("unknown")})`;
      const title = svgNode("title");
      title.textContent = `${formatAbsolute(observation.at)} · ${OBSERVED_STATE_LABELS[observation.state]}${observation.availability == null ? "" : ` · ${observation.availability}% available`}`;
      bar.appendChild(title);
      svg.appendChild(bar);
    });

    if (model.graphType === "latency") {
      model.segments.forEach((sourceSegment) => {
        const segment = sourceSegment.map((point) => ({ ...point, y: yFor(point.latency) }));
        const pathData = smoothChartPath(segment);
        if (segment.length >= 3) {
          const area = svgNode("path", "component-graph__area");
          area.setAttribute("d", `${pathData} L${segment.at(-1).x.toFixed(2)} ${CHART_VIEW.bottom} L${segment[0].x.toFixed(2)} ${CHART_VIEW.bottom} Z`);
          area.setAttribute("fill", `url(#${definitionId}-area)`);
          svg.appendChild(area);
        }
        if (segment.length >= 2) {
          const path = svgNode("path", "component-graph__line");
          path.setAttribute("d", pathData);
          path.setAttribute("stroke", `url(#${definitionId}-line)`);
          svg.appendChild(path);
        }
      });
      model.gaps.forEach((gap) => {
        const bridge = svgNode("path", "component-graph__gap-bridge");
        bridge.setAttribute("d", `M${gap.from.x.toFixed(2)} ${yFor(gap.from.latency).toFixed(2)} L${gap.to.x.toFixed(2)} ${yFor(gap.to.latency).toFixed(2)}`);
        bridge.setAttribute("data-unmeasured", "true");
        bridge.setAttribute("role", "img");
        bridge.setAttribute("aria-label", `Unmeasured interval lasting ${formatGapDuration(gap.durationMs)}. No observations are included in this bridge.`);
        const title = svgNode("title");
        title.textContent = `No observations · ${formatAbsolute(gap.from.at)} to ${formatAbsolute(gap.to.at)} · ${gap.missingBucketCount} expected buckets missing.`;
        bridge.appendChild(title);
        svg.appendChild(bridge);
      });
      const showAllLatencyPoints = model.latencyPoints.length <= 18;
      model.latencyPoints.forEach((point) => {
        const isCurrent = point === latestLatency;
        if (!isCurrent && !showAllLatencyPoints) return;
        const circle = svgNode("circle", `component-graph__point${isCurrent ? " is-current" : ""}`);
        circle.setAttribute("cx", String(point.x));
        circle.setAttribute("cy", String(yFor(point.latency)));
        circle.setAttribute("r", isCurrent ? "3.2" : "2.1");
        if (isCurrent) {
          circle.setAttribute("tabindex", "0");
          circle.setAttribute("role", "img");
          circle.setAttribute("aria-label", `${formatAbsolute(point.at)} · ${point.latency} milliseconds · ${OBSERVED_STATE_LABELS[point.state]}`);
        } else circle.setAttribute("aria-hidden", "true");
        svg.appendChild(circle);
        if (isCurrent) {
          const tip = svgNode("circle", "component-graph__tip");
          tip.setAttribute("cx", String(point.x));
          tip.setAttribute("cy", String(yFor(point.latency)));
          tip.setAttribute("r", "7");
          svg.appendChild(tip);
        }
      });
    } else {
      const latestMarker = svgNode("circle", "component-graph__point is-current component-graph__point--state");
      latestMarker.setAttribute("cx", String(latestObservation.x));
      latestMarker.setAttribute("cy", String(stateY + stateHeight / 2));
      latestMarker.setAttribute("r", "4.2");
      latestMarker.setAttribute("data-state", latestObservation.state);
      latestMarker.setAttribute("tabindex", "0");
      latestMarker.setAttribute("role", "img");
      latestMarker.setAttribute("aria-label", `${formatAbsolute(latestObservation.at)} · ${OBSERVED_STATE_LABELS[latestObservation.state]}`);
      svg.appendChild(latestMarker);
    }

    const crosshair = svgNode("line", "component-graph__crosshair");
    crosshair.setAttribute("y1", String(model.graphType === "latency" ? CHART_VIEW.top : 78));
    crosshair.setAttribute("y2", String(model.graphType === "latency" ? CHART_VIEW.stateY + CHART_VIEW.stateHeight : 140));
    const hoverPoint = svgNode("circle", "component-graph__hover-point");
    hoverPoint.setAttribute("r", "4.4");
    svg.append(crosshair, hoverPoint);

    const plot = node("div", "component-graph__plot");
    const tooltip = node("div", "component-graph__tooltip");
    tooltip.hidden = true;
    tooltip.setAttribute("aria-hidden", "true");
    const tooltipTime = node("span");
    const tooltipValue = node("strong");
    const tooltipMeta = node("small");
    tooltip.append(tooltipTime, tooltipValue, tooltipMeta);
    plot.append(svg, tooltip);
    panel.append(plot, xAxisLabels);

    const pointY = (observation) => observation.latency === null ? stateY + stateHeight / 2 : yFor(observation.latency);
    const showTooltip = (observation) => {
      if (!observation) return;
      const data = tooltipDataForObservation(observation);
      tooltipTime.textContent = formatAbsolute(data.at);
      tooltipValue.textContent = data.latency == null ? data.state : `${data.latency} ms`;
      tooltipMeta.textContent = `${data.state}${data.availability == null ? " · availability unavailable" : ` · ${data.availability}% available`}`;
      crosshair.setAttribute("x1", String(observation.x));
      crosshair.setAttribute("x2", String(observation.x));
      hoverPoint.setAttribute("cx", String(observation.x));
      hoverPoint.setAttribute("cy", String(pointY(observation)));
      hoverPoint.setAttribute("data-state", observation.state);
      tooltip.hidden = false;
      tooltip.setAttribute("aria-hidden", "false");
      crosshair.classList.add("is-visible");
      hoverPoint.classList.add("is-visible");
      const bounds = plot.getBoundingClientRect();
      const tooltipWidth = Math.min(tooltip.offsetWidth || 196, Math.max(120, bounds.width - 16));
      const tooltipHeight = tooltip.offsetHeight || 76;
      const rawLeft = (observation.x / CHART_VIEW.width) * bounds.width;
      const rawTop = (pointY(observation) / CHART_VIEW.height) * bounds.height - tooltipHeight - 12;
      tooltip.style.left = `${Math.max(8, Math.min(bounds.width - tooltipWidth - 8, rawLeft - tooltipWidth / 2))}px`;
      tooltip.style.top = `${Math.max(8, Math.min(bounds.height - tooltipHeight - 8, rawTop))}px`;
    };
    const hideTooltip = () => {
      tooltip.hidden = true;
      tooltip.setAttribute("aria-hidden", "true");
      crosshair.classList.remove("is-visible");
      hoverPoint.classList.remove("is-visible");
    };
    if (window.matchMedia?.("(hover: hover) and (pointer: fine)")?.matches) {
      plot.addEventListener("pointermove", (event) => {
        const bounds = plot.getBoundingClientRect();
        const x = ((event.clientX - bounds.left) / Math.max(1, bounds.width)) * CHART_VIEW.width;
        showTooltip(nearestChartObservation(model.observations, x));
      });
      plot.addEventListener("pointerleave", hideTooltip);
    }
    const currentPoint = select(".component-graph__point.is-current", svg);
    currentPoint?.addEventListener("focus", () => showTooltip(latestLatency || latestObservation));
    currentPoint?.addEventListener("blur", hideTooltip);

    const legend = node("div", "component-graph__legend");
    if (model.graphType === "latency") legend.appendChild(node("span", "component-graph__legend-latency", "Measured latency"));
    legend.appendChild(node("span", "component-graph__legend-state", "Observed availability rail"));
    if (missingMarkers.length) legend.appendChild(node("span", "component-graph__legend-missing", "Flat grey markers = missing internal observations"));
    if (model.leadingGap || model.gaps.length) legend.appendChild(node("span", "component-graph__legend-unobserved", "Shaded span = no observations"));
    if (model.gaps.length) legend.appendChild(node("span", "component-graph__legend-gap", "Dashed bridge = internal unmeasured interval"));
    panel.appendChild(legend);
    if (options.transition === "range" && !chartMotionReduced()) {
      panel.classList.add("is-range-entering");
      chartFrame(() => chartFrame(() => {
        panel.classList.add("is-range-visible");
        panel.removeAttribute("aria-busy");
      }));
      window.setTimeout(() => panel.classList.remove("is-range-entering", "is-range-visible"), 430);
    } else panel.removeAttribute("aria-busy");
    if (options.transition === "range") queueChartEntrance(panel);
    if (options.focusRange) select(`button[data-graph-range="${options.focusRange}"]`, controls)?.focus({ preventScroll: true });
  };

  const createComponentCard = (component, snapshot) => {
    const card = node("article", "component-card");
    card.dataset.state = component.normalizedState;
    card.dataset.componentId = component.id || "";
    card.style.setProperty("--component-color", STATUS_COLORS[component.normalizedState] || STATUS_COLORS.unknown);
    const presentation = COMPONENT_PRESENTATION[component.id] || { icon: "/assets/icons/ui/pageinfo.svg", description: "Statuspage component." };
    const diagnostic = diagnosticFor(component, snapshot);
    const source = diagnostic || fallbackCoverage(component.id);
    const cardId = `component-${String(component.id || "unknown").replace(/[^a-z0-9_-]/gi, "")}`;

    const identity = node("div", "component-card__identity");
    const icon = node("span", "component-card__icon");
    icon.setAttribute("aria-hidden", "true");
    const image = document.createElement("img");
    image.src = presentation.icon;
    image.alt = "";
    image.addEventListener("error", () => {
      if (icon.dataset.fallback === "true") return;
      icon.dataset.fallback = "true";
      image.src = "/assets/icons/ui/pageinfo.svg";
    });
    icon.appendChild(image);
    const copy = node("div");
    const heading = node("h4", "", component.name || "Unnamed component");
    heading.id = `${cardId}-title`;
    copy.append(heading, node("p", "", diagnostic?.description || presentation.description));
    identity.append(icon, copy);

    const badge = node("span", "component-state", `Official · ${component.statusLabel}`);
    const top = node("div", "component-card__top");
    top.append(identity, badge);
    const chips = node("div", "component-card__chips");
    const officialChip = node("span", "component-chip", "Official status — Atlassian");
    officialChip.dataset.kind = "official";
    const ownerLabel = source.owner === "watchdog"
      ? "Direct observation — StreamSuites Watchdog"
      : source.owner === "atlassian_third_party"
        ? "External provider — Atlassian integration"
        : "Manual / deferred monitor";
    const ownerChip = node("span", "component-chip", ownerLabel);
    ownerChip.dataset.kind = source.owner || "unknown";
    const coverageChip = node("span", "component-chip", chipLabel(source.coverage));
    coverageChip.dataset.kind = source.coverage || "unknown";
    chips.append(officialChip, ownerChip, coverageChip);

    const directObservationStale = Boolean(snapshot.diagnosticsStale || diagnostic?.direct_stale);
    const facts = node("div", "component-card__facts");
    facts.append(
      node("span", "", `Official update · ${formatRelative(component.updated_at)}`),
      node("span", "", diagnostic?.last_checked ? `Direct check · ${formatRelative(diagnostic.last_checked)}` : "Direct check · unavailable"),
      node("span", "", diagnostic?.last_checked ? `Direct observation · ${directObservationStale ? "stale" : "fresh"}` : "Direct observation · unavailable")
    );
    if (diagnostic?.latency_ms != null) facts.appendChild(node("span", "component-card__latency", `${diagnostic.latency_ms} ms`));

    const directState = diagnostic?.direct_state ? normalizeComponent({ status: diagnostic.direct_state }).normalizedState : null;
    const discrepancy = Boolean(diagnostic && !directObservationStale && directState && directState !== "unknown" && directState !== component.normalizedState);
    if (discrepancy) {
      const warning = node("p", "component-discrepancy", `Reconciliation pending · official is ${component.statusLabel}; fresh direct observation is ${chipLabel(diagnostic.direct_state)}.`);
      warning.setAttribute("role", "status");
      card.append(top, chips, facts, warning);
    } else {
      card.append(top, chips, facts);
    }

    const toggle = node("button", "component-card__toggle", "View diagnostics");
    toggle.type = "button";
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-controls", `${cardId}-details`);
    const details = node("div", "component-card__details");
    details.id = `${cardId}-details`;
    details.hidden = true;
    const detailSummary = node("div", "component-detail-rail__summary");
    const officialSummary = node("div", "component-detail-rail__source");
    officialSummary.append(node("span", "", "Official status — Atlassian"), node("strong", "", component.statusLabel), node("small", "", `Updated ${formatRelative(component.updated_at)}`));
    const directSummary = node("div", "component-detail-rail__source");
    directSummary.append(node("span", "", source.owner === "watchdog" ? "Direct observation — StreamSuites Watchdog" : ownerLabel), node("strong", "", diagnostic?.direct_state ? chipLabel(diagnostic.direct_state) : source.coverage === "deferred" ? "Deferred" : source.coverage === "vendor_managed" ? "Provider managed" : "Unavailable"), node("small", "", diagnostic?.last_checked ? `${directObservationStale ? "Stale" : "Fresh"} · checked ${formatRelative(diagnostic.last_checked)}` : "No local check available"));
    detailSummary.append(officialSummary, directSummary);
    const detailList = node("dl", "component-details-grid");
    detailList.append(
      detailItem("Official source", "Atlassian Statuspage"),
      detailItem("Direct source", source.owner === "watchdog" ? chipLabel(source.monitor_mode) : chipLabel(source.owner)),
      detailItem("Ownership", chipLabel(source.owner)),
      detailItem("Coverage", chipLabel(source.coverage)),
      detailItem("Last checked", diagnostic?.last_checked ? formatAbsolute(diagnostic.last_checked) : "Unavailable"),
      detailItem("Direct state", diagnostic?.direct_state ? chipLabel(diagnostic.direct_state) : "Unavailable"),
      detailItem("24H availability", diagnostic?.history?.["24h"]?.availability_percent == null ? "Unavailable" : `${diagnostic.history["24h"].availability_percent}%`),
      detailItem("7D availability", diagnostic?.history?.["7d"]?.availability_percent == null ? "Unavailable" : `${diagnostic.history["7d"].availability_percent}%`),
      detailItem("30D availability", diagnostic?.history?.["30d"]?.availability_percent == null ? "Unavailable" : `${diagnostic.history["30d"].availability_percent}%`),
      detailItem("30D plotted buckets", String(diagnostic?.history?.["30d"]?.buckets?.length || 0)),
      detailItem("30D raw observations", String(diagnostic?.history?.["30d"]?.sample_count || 0)),
      detailItem("Recent latency", diagnostic?.latency_ms == null ? "Unavailable" : `${diagnostic.latency_ms} ms`),
      detailItem("Last success", diagnostic?.last_success ? formatAbsolute(diagnostic.last_success) : "Unavailable"),
      detailItem("Last failure", diagnostic?.last_failure ? formatAbsolute(diagnostic.last_failure) : "Unavailable")
    );
    details.append(detailSummary, detailList);
    let graph = null;
    if (source.coverage === "deferred") {
      details.appendChild(component.id === "b6k38lrqx93f"
        ? createIntentionalState("deferred", "Studio Room Readiness remains deferred", "A genuine end-to-end Studio, room, and media-readiness transaction is not yet implemented. No watchdog-observed graph is shown.", "Official current state remains available from Atlassian Statuspage.")
        : createIntentionalState("deferred", "Automated monitoring is deferred", "No watchdog-observed history exists for this manual monitoring boundary, so no empty or synthetic graph is rendered.", "Official current state remains available from Atlassian Statuspage."));
    } else if (source.coverage === "vendor_managed") {
      details.appendChild(createIntentionalState("provider", "Managed through Atlassian's provider integration", "StreamSuites does not independently publish synthetic uptime or a local watchdog graph for this provider-owned component.", "Official provider state remains available from Atlassian Statuspage."));
    } else {
      graph = node("div", "component-graph");
      renderHistoryGraph(graph, diagnostic || { component_id: component.id, history: {} }, state.graphRanges.get(component.id) || "24h", {
        componentName: component.name,
        isCoreApi: component.id === CORE_API_COMPONENT_ID,
        stale: directObservationStale,
      });
      details.appendChild(graph);
    }
    const incident = unresolvedIncidents(snapshot.data.incidents).find((item) => (item.components || []).some((entry) => entry.id === component.id));
    if (incident) details.appendChild(node("p", "component-incident", `Associated incident · ${incident.name || "Active incident"}`));
    const footer = node("div", "component-card__footer");
    footer.appendChild(toggle);
    card.append(footer, details);
    const setExpanded = (expanded) => {
      card.classList.toggle("is-expanded", expanded);
      details.hidden = !expanded;
      toggle.setAttribute("aria-expanded", String(expanded));
      toggle.textContent = expanded ? "Close diagnostics ↑" : "View diagnostics ↓";
      if (expanded) {
        state.expanded.add(component.id);
        if (graph && !state.graphEntrances.has(component.id)) {
          state.graphEntrances.add(component.id);
          queueChartEntrance(graph);
        }
      } else state.expanded.delete(component.id);
    };
    toggle.addEventListener("click", () => setExpanded(toggle.getAttribute("aria-expanded") !== "true"));
    toggle.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || toggle.getAttribute("aria-expanded") !== "true") return;
      setExpanded(false);
      toggle.focus();
    });
    setExpanded(state.expanded.has(component.id));
    return card;
  };

  const renderComponents = (snapshot) => {
    const loadState = select("[data-component-load-state]");
    const groupsRoot = select("[data-component-groups]");
    const empty = select("[data-component-empty]");
    if (!groupsRoot) return;

    const groups = groupComponents(snapshot.data.components);
    groupsRoot.innerHTML = "";
    let visibleCount = 0;

    groups.forEach((group) => {
      const visible = group.components.map(normalizeComponent).filter(matchesFilter);
      if (!visible.length) return;
      visibleCount += visible.length;

      const groupKey = inferGroupKey(group);
      const groupPresentation = GROUP_PRESENTATION[groupKey] || GROUP_PRESENTATION.dependencies;
      const section = node("section", "component-group reveal is-visible");
      section.dataset.group = groupKey;
      section.style.setProperty("--group-accent", groupPresentation.accent);
      const heading = node("div", "component-group__heading");
      const normalizedAll = group.components.map(normalizeComponent);
      const operational = normalizedAll.filter((component) => component.normalizedState === "operational").length;
      const attention = normalizedAll.length - operational;
      const coverage = normalizedAll.map((component) => diagnosticFor(component, snapshot) || fallbackCoverage(component.id));
      const monitored = coverage.filter((item) => item.coverage === "implemented").length;
      const deferred = coverage.filter((item) => item.coverage === "deferred").length;
      const vendor = coverage.filter((item) => item.coverage === "vendor_managed").length;
      const copy = node("div", "component-group__copy");
      copy.append(node("span", "component-group__eyebrow", `${operational}/${normalizedAll.length} operational`), node("h3", "", group.label), node("p", "", groupPresentation.role));
      const counts = node("div", "component-group__counts");
      [["Monitored", monitored, "monitored"], ["Deferred", deferred, "deferred"], ["External", vendor, "vendor"], ["Attention", attention, "attention"]].forEach(([label, value, kind]) => {
        const count = node("span", "", `${label} ${value}`);
        count.dataset.kind = kind;
        counts.appendChild(count);
      });
      heading.append(copy, counts);
      const grid = node("div", "component-grid");
      visible.forEach((component) => grid.appendChild(createComponentCard(component, snapshot)));
      section.append(heading, grid);
      groupsRoot.appendChild(section);
    });

    if (loadState) loadState.hidden = true;
    groupsRoot.hidden = visibleCount === 0;
    if (empty) empty.hidden = visibleCount !== 0;
  };

  const createEmptyOperation = (kind) => {
    const wrapper = node("div", "operation-empty");
    const inner = node("div");
    const mark = node("span", "operation-empty__mark");
    mark.setAttribute("aria-hidden", "true");
    inner.append(
      mark,
      node("strong", "", kind === "incident" ? "No active incidents" : "No active maintenance"),
      node("p", "", kind === "incident"
        ? "Atlassian Statuspage is not reporting an unresolved incident."
        : "There are no active or upcoming maintenance windows in the loaded feed.")
    );
    wrapper.appendChild(inner);
    return wrapper;
  };

  const createOperationItem = (item, kind) => {
    const article = node("article", "operation-item");
    const top = node("div", "operation-item__top");
    const copy = node("div");
    copy.append(
      node("h4", "", item.name || (kind === "incident" ? "Untitled incident" : "Scheduled maintenance")),
      node("div", "operation-item__meta", String(item.status || "Unknown").replaceAll("_", " "))
    );
    const timeValue = item.updated_at || item.scheduled_for || item.created_at;
    top.append(copy, node("span", "operation-item__time", formatRelative(timeValue)));
    article.appendChild(top);
    const update = Array.isArray(item.incident_updates) ? item.incident_updates[0] : null;
    const body = truncate(update?.body || "No additional update is available.", 240);
    if (body) article.appendChild(node("p", "operation-item__body", body));
    return article;
  };

  const renderOperations = (snapshot) => {
    const incidents = unresolvedIncidents(snapshot.data.incidents);
    const maintenances = activeMaintenances(snapshot.data.scheduled_maintenances);
    const incidentRoot = select("[data-active-incidents]");
    const maintenanceRoot = select("[data-maintenances]");

    setText("[data-incident-count]", String(incidents.length));
    setText("[data-maintenance-count]", String(maintenances.length));
    setText("[data-incident-heading]", incidents.length ? `${incidents.length} active ${incidents.length === 1 ? "incident" : "incidents"}` : "No active incidents");
    setText("[data-maintenance-heading]", maintenances.length ? `${maintenances.length} maintenance ${maintenances.length === 1 ? "window" : "windows"}` : "No active windows");

    const incidentPanel = incidentRoot?.closest(".operations-panel");
    const maintenancePanel = maintenanceRoot?.closest(".operations-panel");
    if (incidentPanel) incidentPanel.dataset.empty = String(!incidents.length);
    if (maintenancePanel) maintenancePanel.dataset.empty = String(!maintenances.length);

    if (incidentRoot) {
      incidentRoot.innerHTML = "";
      if (!incidents.length) incidentRoot.appendChild(createEmptyOperation("incident"));
      else incidents.forEach((incident) => incidentRoot.appendChild(createOperationItem(incident, "incident")));
    }

    if (maintenanceRoot) {
      maintenanceRoot.innerHTML = "";
      if (!maintenances.length) maintenanceRoot.appendChild(createEmptyOperation("maintenance"));
      else maintenances.forEach((maintenance) => maintenanceRoot.appendChild(createOperationItem(maintenance, "maintenance")));
    }
  };

  const impactState = (impact) => {
    const key = String(impact || "").toLowerCase();
    if (key === "critical") return "critical";
    if (key === "major") return "partial";
    if (key === "minor") return "degraded";
    return "operational";
  };

  const renderHistory = (snapshot) => {
    const root = select("[data-incident-history]");
    if (!root) return;
    const incidents = (Array.isArray(snapshot.data.incidents) ? snapshot.data.incidents : [])
      .filter((incident) => ["resolved", "postmortem"].includes(String(incident?.status || "").toLowerCase()))
      .sort((a, b) => Date.parse(b.resolved_at || b.updated_at || b.created_at || 0) - Date.parse(a.resolved_at || a.updated_at || a.created_at || 0))
      .slice(0, 6);
    root.innerHTML = "";

    if (!incidents.length) {
      const item = node("article", "history-item");
      item.style.setProperty("--history-color", STATUS_COLORS.operational);
      item.append(
        node("span", "history-item__date", "Current loaded history"),
        node("h3", "", "No resolved incidents in the loaded feed"),
        node("p", "", "The public Statuspage response did not include a resolved incident record for this view. The hosted history remains linked for the complete archive."),
        node("span", "history-item__chip", "Clear loaded history")
      );
      root.appendChild(item);
      return;
    }

    incidents.forEach((incident) => {
      const item = node("article", "history-item");
      const stateName = impactState(incident.impact);
      item.style.setProperty("--history-color", STATUS_COLORS[stateName]);
      const update = Array.isArray(incident.incident_updates) ? incident.incident_updates[0] : null;
      item.append(
        node("span", "history-item__date", formatAbsolute(incident.resolved_at || incident.updated_at || incident.created_at)),
        node("h3", "", incident.name || "Resolved incident"),
        node("p", "", truncate(update?.body || "This incident was resolved.", 300)),
        node("span", "history-item__chip", `${String(incident.impact || "none").replaceAll("_", " ")} · ${String(incident.status || "resolved").replaceAll("_", " ")}`)
      );
      root.appendChild(item);
    });
  };

  const renderUnavailable = (snapshot) => {
    document.documentElement.style.setProperty("--state-color", STATUS_COLORS.unknown);
    const core = select(".system-pulse__core");
    if (core) core.dataset.overallState = "unknown";
    setText(".system-pulse__state-mark", "?");
    setText("[data-overall-description]", "Status unavailable");
    setText("[data-overall-subtitle]", "The public Atlassian Statuspage feed could not be reached.");
    setText("[data-hero-operational]", "—");
    setText("[data-hero-total]", "—");
    setText("[data-hero-latency]", "—");
    setText("[data-metric-overall]", "Unavailable");
    setText("[data-metric-operational]", "—");
    setText("[data-metric-incidents]", "—");
    setText("[data-metric-maintenance]", "—");
    setText("[data-last-checked]", "Status unavailable · retry available");
    const sourceChip = select("[data-source-chip]");
    if (sourceChip) {
      sourceChip.dataset.state = "unavailable";
      const textNode = [...sourceChip.childNodes].find((item) => item.nodeType === Node.TEXT_NODE);
      if (textNode) textNode.textContent = " Status unavailable";
    }
    const liveBadge = select("[data-live-badge]");
    if (liveBadge) {
      liveBadge.dataset.state = "unavailable";
      liveBadge.innerHTML = "<span></span>UNAVAILABLE";
    }
    const loadState = select("[data-component-load-state]");
    if (loadState) loadState.innerHTML = "<span class=\"loader\" aria-hidden=\"true\"></span><div><strong>Status unavailable</strong><p>No successful public Statuspage response is available. Refresh to try again.</p></div>";
    const groups = select("[data-component-groups]");
    if (groups) groups.hidden = true;
    const empty = select("[data-component-empty]");
    if (empty) empty.hidden = true;
    const incidentRoot = select("[data-active-incidents]");
    if (incidentRoot) { incidentRoot.innerHTML = ""; incidentRoot.appendChild(createEmptyOperation("incident")); }
    const maintenanceRoot = select("[data-maintenances]");
    if (maintenanceRoot) { maintenanceRoot.innerHTML = ""; maintenanceRoot.appendChild(createEmptyOperation("maintenance")); }
    const history = select("[data-incident-history]");
    if (history) {
      history.innerHTML = "";
      const item = node("article", "history-item");
      item.style.setProperty("--history-color", STATUS_COLORS.unknown);
      item.append(node("span", "history-item__date", "Public feed unavailable"), node("h3", "", "Recent incident history is unavailable"), node("p", "", "No local or fabricated history is substituted. Use the Atlassian hosted archive or retry the public feed."));
      history.appendChild(item);
    }
  };

  const render = (snapshot) => {
    state.snapshot = snapshot;
    if (!snapshot?.data) {
      renderUnavailable(snapshot);
      return;
    }
    renderHero(snapshot);
    renderMetrics(snapshot);
    renderComponents(snapshot);
    renderOperations(snapshot);
    renderHistory(snapshot);
  };

  const initFilters = () => {
    const search = select("[data-component-search]");
    const filters = selectAll("[data-status-filter]");
    search?.addEventListener("input", () => {
      state.search = String(search.value || "").trim().toLowerCase();
      if (state.snapshot) renderComponents(state.snapshot);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "/" && !/input|textarea|select/i.test(document.activeElement?.tagName || "")) {
        event.preventDefault();
        search?.focus();
      }
    });
    filters.forEach((button) => {
      button.addEventListener("click", () => {
        state.filter = button.dataset.statusFilter || "all";
        filters.forEach((candidate) => candidate.classList.toggle("is-active", candidate === button));
        if (state.snapshot) renderComponents(state.snapshot);
      });
    });
  };

  const initNavigation = () => {
    const toggle = select("[data-nav-toggle]");
    const nav = select("[data-primary-nav]");
    if (!toggle || !nav) return;
    const setOpen = (open) => {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    };
    toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        setOpen(false);
        toggle.focus();
      }
    });
  };

  const initReveals = () => {
    const items = selectAll(".reveal");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      items.forEach((item) => item.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: .12, rootMargin: "0px 0px -5% 0px" });
    items.forEach((item) => observer.observe(item));
  };

  const initRefresh = () => {
    const button = select("[data-refresh-status]");
    button?.addEventListener("click", async () => {
      button.disabled = true;
      button.setAttribute("aria-busy", "true");
      const original = button.innerHTML;
      button.innerHTML = '<span class="button__icon" aria-hidden="true">↻</span>Refreshing…';
      try { await store.refresh({ force: true }); }
      finally {
        button.disabled = false;
        button.removeAttribute("aria-busy");
        button.innerHTML = original;
      }
    });
  };

  const initMetricHistory = () => {
    const button = select("[data-diagnostic-core-history]");
    button?.addEventListener("click", () => {
      if (!state.snapshot) return;
      state.search = "";
      state.filter = "all";
      const search = select("[data-component-search]");
      if (search) search.value = "";
      selectAll("[data-status-filter]").forEach((filter) => filter.classList.toggle("is-active", filter.dataset.statusFilter === "all"));
      renderComponents(state.snapshot);
      const card = select(`[data-component-id="${CORE_API_COMPONENT_ID}"]`);
      const toggle = card ? select(".component-card__toggle", card) : null;
      if (toggle?.getAttribute("aria-expanded") !== "true") toggle?.click();
      card?.scrollIntoView({ behavior: chartMotionReduced() ? "auto" : "smooth", block: "start" });
    });
  };

  const init = () => {
    initNavigation();
    initFilters();
    initReveals();
    initRefresh();
    initMetricHistory();
    store.subscribe(render);
    store.start();
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
