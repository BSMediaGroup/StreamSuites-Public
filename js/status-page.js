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
  };

  const COMPONENT_PRESENTATION = Object.freeze({
    "3qsdkc52dgt5": { icon: "/assets/icons/icondiag-studioweb.svg", description: "Browser-based studio shell and production workspace." },
    "b6k38lrqx93f": { icon: "/assets/icons/ui/mobilecast.svg", description: "Realtime media and guest connection readiness." },
    "q7435t6bd41x": { icon: "/assets/icons/icondiag-studioapp.svg", description: "Native StudioApp access to connected Runtime services." },
    "4fp296vdg5w7": { icon: "/assets/icons/ui/tvlive.svg", description: "Streaming destination readiness and secure credential delivery." },
    "94cn19vph28j": { icon: "/assets/icons/obs-0.svg", description: "Studio for OBS connected service boundary." },
    "tb383cr2p92n": { icon: "/assets/icons/ui/shieldlock.svg", description: "Authentication, account authority, and managed sessions." },
    "4vrh4mg9l4hn": { icon: "/assets/icons/ui/meetingroom.svg", description: "Studio rooms, participants, and room-scoped invitations." },
    "0xm0hsy3byjj": { icon: "/assets/icons/ui/storage.svg", description: "Public APIs, published exports, and the canonical version registry." },
    "3xjjgpbydbbf": { icon: "/assets/icons/ui/zapmagnet.svg", description: "Creator-scoped automation and trigger execution." },
    "qbczblv2hgv8": { icon: "/assets/icons/ui/status-bell.svg", description: "Alert evaluation and notification delivery." },
    "6ww27z4z9vj8": { icon: "/assets/icons/ui/chatnotif.svg", description: "Platform integrations and live-chat services." },
    "zx07yy34tyvl": { icon: "/assets/icons/ui/ss-public.svg", description: "Public website and this Status Center." },
    "rdb3pmbvr4bv": { icon: "/assets/icons/ui/photostackflower.svg", description: "Public profiles, community discovery, and artifacts." },
    "5wm11qq4b7w9": { icon: "/assets/icons/ui/ss-creator.svg", description: "Creator-facing dashboard and control surfaces." },
    "jnd29jsl8w7b": { icon: "/assets/icons/ui/ss-admin.svg", description: "Administrative dashboard and operations surfaces." },
    "8x9n41kfjtc8": { icon: "/assets/icons/ui/ss-developer.svg", description: "Developer console and shipped-reality documentation." },
    "p00vypwhfhx3": { icon: "/assets/icons/ui/download.svg", description: "Fail-closed downloads and update distribution." },
    "n1lw27451j6d": { icon: "/assets/icons/ui/status-cloud.svg", description: "Cloudflare-managed Pages delivery state." },
    "8zfbmn6ynv99": { icon: "/assets/icons/ui/status-envelope.svg", description: "Transactional email delivery." },
    "5qbjrf4hq5nn": { icon: "/assets/icons/stripeicon-0.svg", description: "Stripe-managed payment API state." },
    "gd23vgnp3n89": { icon: "/assets/icons/github-0.svg", description: "GitHub-managed Git operations state." },
  });
  const IMPLEMENTED_COMPONENTS = new Set(["3qsdkc52dgt5", "q7435t6bd41x", "94cn19vph28j", "tb383cr2p92n", "0xm0hsy3byjj", "zx07yy34tyvl", "rdb3pmbvr4bv", "5wm11qq4b7w9", "jnd29jsl8w7b", "8x9n41kfjtc8", "p00vypwhfhx3"]);
  const VENDOR_COMPONENTS = new Set(["n1lw27451j6d", "5qbjrf4hq5nn", "gd23vgnp3n89"]);
  const GROUP_PRESENTATION = Object.freeze({
    production: { accent: "#58b7ff", role: "Creation products and their connected production services." },
    core: { accent: "#9c7cff", role: "Identity, rooms, APIs, automation, and notification authority." },
    web: { accent: "#5fe2b0", role: "Audience, creator, admin, developer, documentation, and distribution surfaces." },
    surfaces: { accent: "#5fe2b0", role: "Public and operator-facing product surfaces." },
    edge: { accent: "#5fe2b0", role: "Delivery and edge services." },
    dependencies: { accent: "#f1bc62", role: "External delivery, email, payment, and Git operations." },
  });

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

    setText(".system-pulse__state-mark", meta.mark);
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
      : `${coreMetric.history?.["24h"]?.sample_count || 0} observed samples · ${snapshot.diagnosticsStale ? "stale" : "fresh"} · ${trend}`);
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

  const renderHistoryGraph = (panel, diagnostic, requestedRange) => {
    panel.innerHTML = "";
    const ranges = ["24h", "7d", "30d"];
    const available = ranges.filter((key) => (diagnostic?.history?.[key]?.buckets || []).length);
    const toolbar = node("div", "component-graph__toolbar");
    const controls = node("div", "component-graph__controls");
    controls.setAttribute("aria-label", "Watchdog history range");
    const activeRange = available.includes(requestedRange) ? requestedRange : available[0];
    ranges.forEach((key) => {
      const button = node("button", key === activeRange ? "is-active" : "", key.toUpperCase());
      button.type = "button";
      button.dataset.graphRange = key;
      button.disabled = !available.includes(key);
      button.setAttribute("aria-pressed", String(key === activeRange));
      button.addEventListener("click", () => {
        state.graphRanges.set(diagnostic.component_id, key);
        renderHistoryGraph(panel, diagnostic, key);
      });
      controls.appendChild(button);
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
    const summary = node("p", "component-graph__summary");
    summary.textContent = `${activeRange.toUpperCase()} watchdog-observed availability: ${range.availability_percent == null ? "Unavailable" : `${range.availability_percent}%`}. ${range.sample_count || 0} samples.`;
    summary.setAttribute("role", "status");
    panel.appendChild(summary);

    const latestLatency = [...buckets].reverse().find((bucket) => Number.isFinite(bucket?.latency_ms));
    const currentValue = node("div", "component-graph__current");
    currentValue.append(node("span", "", "Latest measured latency"), node("strong", "", latestLatency ? `${latestLatency.latency_ms} ms` : "Unavailable"));
    toolbar.appendChild(currentValue);
    panel.classList.toggle("is-sparse", (range.sample_count || 0) < 3);
    if ((range.sample_count || 0) < 3) panel.appendChild(node("p", "component-graph__sparse", "Sparse real history · the graph shows only received samples and leaves missing periods open."));

    const width = 720;
    const height = 154;
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", summary.textContent);
    svg.classList.add("component-graph__svg");
    const timestamps = buckets.map((bucket) => Date.parse(bucket.at)).filter(Number.isFinite);
    const start = Math.min(...timestamps);
    const end = Math.max(...timestamps, start + 1);
    const xFor = (value) => 12 + ((Date.parse(value) - start) / Math.max(1, end - start)) * (width - 24);
    const latencyValues = buckets.map((bucket) => bucket.latency_ms).filter((value) => Number.isFinite(value));
    const maxLatency = Math.max(1, ...latencyValues);
    const yFor = (value) => 96 - (Number(value) / maxLatency) * 72;
    const expectedGap = activeRange === "24h" ? 600000 : 172800000;

    [24, 60, 96].forEach((y, index) => {
      const gridLine = document.createElementNS(svg.namespaceURI, "line");
      gridLine.setAttribute("x1", "12");
      gridLine.setAttribute("x2", String(width - 12));
      gridLine.setAttribute("y1", String(y));
      gridLine.setAttribute("y2", String(y));
      gridLine.setAttribute("class", "component-graph__gridline");
      svg.appendChild(gridLine);
      const label = document.createElementNS(svg.namespaceURI, "text");
      label.setAttribute("x", "14");
      label.setAttribute("y", String(y - 5));
      label.setAttribute("class", "component-graph__axis-label");
      label.textContent = index === 0 ? `${maxLatency} ms` : index === 2 ? "0 ms" : "latency";
      svg.appendChild(label);
    });

    buckets.forEach((bucket, index) => {
      const rect = document.createElementNS(svg.namespaceURI, "rect");
      const x = xFor(bucket.at);
      const nextX = buckets[index + 1] ? xFor(buckets[index + 1].at) : x + 4;
      rect.setAttribute("x", String(x));
      rect.setAttribute("y", "118");
      rect.setAttribute("width", String(Math.max(3, nextX - x - 1)));
      rect.setAttribute("height", "14");
      rect.setAttribute("rx", "2");
      rect.setAttribute("data-state", bucket.state || "unknown");
      const title = document.createElementNS(svg.namespaceURI, "title");
      title.textContent = `${formatAbsolute(bucket.at)} · ${bucket.availability_percent == null ? "availability unavailable" : `${bucket.availability_percent}% available`}`;
      rect.appendChild(title);
      svg.appendChild(rect);
    });

    let segment = [];
    const flushSegment = () => {
      if (!segment.length) return;
      if (segment.length > 1) {
        const path = document.createElementNS(svg.namespaceURI, "path");
        path.setAttribute("d", segment.map((point, index) => `${index ? "L" : "M"}${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(" "));
        path.setAttribute("class", "component-graph__line");
        svg.appendChild(path);
      }
      segment.forEach((point) => {
        const circle = document.createElementNS(svg.namespaceURI, "circle");
        circle.setAttribute("cx", String(point.x));
        circle.setAttribute("cy", String(point.y));
        circle.setAttribute("r", "3");
        circle.setAttribute("class", "component-graph__point");
        circle.setAttribute("tabindex", "0");
        circle.setAttribute("role", "img");
        circle.setAttribute("aria-label", `${formatAbsolute(point.at)} · ${point.latency} milliseconds`);
        const title = document.createElementNS(svg.namespaceURI, "title");
        title.textContent = `${formatAbsolute(point.at)} · ${point.latency} ms`;
        circle.appendChild(title);
        svg.appendChild(circle);
      });
      segment = [];
    };
    let previousTime = null;
    buckets.forEach((bucket) => {
      const timestamp = Date.parse(bucket.at);
      if (!Number.isFinite(bucket.latency_ms)) {
        flushSegment();
        previousTime = timestamp;
        return;
      }
      if (previousTime != null && timestamp - previousTime > expectedGap) flushSegment();
      segment.push({ x: xFor(bucket.at), y: yFor(bucket.latency_ms), at: bucket.at, latency: bucket.latency_ms });
      previousTime = timestamp;
    });
    flushSegment();
    const startLabel = document.createElementNS(svg.namespaceURI, "text");
    startLabel.setAttribute("x", "12");
    startLabel.setAttribute("y", "151");
    startLabel.setAttribute("class", "component-graph__axis-label");
    startLabel.textContent = formatAbsolute(buckets[0]?.at, { includeTime: false });
    const endLabel = document.createElementNS(svg.namespaceURI, "text");
    endLabel.setAttribute("x", String(width - 12));
    endLabel.setAttribute("y", "151");
    endLabel.setAttribute("text-anchor", "end");
    endLabel.setAttribute("class", "component-graph__axis-label");
    endLabel.textContent = formatAbsolute(buckets[buckets.length - 1]?.at, { includeTime: false });
    svg.append(startLabel, endLabel);
    panel.appendChild(svg);
    const legend = node("div", "component-graph__legend");
    legend.append(node("span", "component-graph__legend-latency", "Latency samples"), node("span", "component-graph__legend-state", "Observed state band"), node("span", "component-graph__legend-gap", "Gap = no observation"));
    panel.appendChild(legend);
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
      detailItem("30D observations", String(diagnostic?.history?.["30d"]?.sample_count || 0)),
      detailItem("Recent latency", diagnostic?.latency_ms == null ? "Unavailable" : `${diagnostic.latency_ms} ms`),
      detailItem("Last success", diagnostic?.last_success ? formatAbsolute(diagnostic.last_success) : "Unavailable"),
      detailItem("Last failure", diagnostic?.last_failure ? formatAbsolute(diagnostic.last_failure) : "Unavailable")
    );
    details.append(detailSummary, detailList);
    if (source.coverage === "deferred") {
      details.appendChild(node("p", "component-empty-state", "Automated monitoring is not active for this component. Official Statuspage state is currently maintained manually. Historical direct diagnostics will begin when monitoring is enabled."));
    } else if (source.coverage === "vendor_managed") {
      details.appendChild(node("p", "component-empty-state", "Managed by an Atlassian third-party integration. No local uptime graph is produced."));
    } else {
      const graph = node("div", "component-graph");
      renderHistoryGraph(graph, diagnostic || { component_id: component.id, history: {} }, state.graphRanges.get(component.id) || "24h");
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
      if (expanded) state.expanded.add(component.id); else state.expanded.delete(component.id);
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
    inner.append(
      node("span", "operation-empty__mark", "✓"),
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

  const init = () => {
    initNavigation();
    initFilters();
    initReveals();
    initRefresh();
    store.subscribe(render);
    store.start();
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
