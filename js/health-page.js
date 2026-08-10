(() => {
  "use strict";

  const HEALTH_ENDPOINT = "/api/public/status/diagnostics";
  const POLL_INTERVAL_MS = 60000;
  const REQUEST_TIMEOUT_MS = 8000;
  const SCHEMA_VERSION = "status-watchdog-public-v1";
  const OVERALL_CONTRACT_VERSION = "overall-availability-v1";
  const HISTORY_LIMITS = Object.freeze({ "5h": 60, "24h": 288, "7d": 168, "30d": 120 });
  const RANGE_MILLISECONDS = Object.freeze({ "5h": 18000000, "24h": 86400000, "7d": 604800000, "30d": 2592000000 });
  const RANGE_LABELS = Object.freeze({ "5h": "5 hours", "24h": "24 hours", "7d": "7 days", "30d": "30 days" });

  const STATE_META = Object.freeze({
    operational: { label: "Operational", mark: "✓", rank: 0 },
    degraded: { label: "Degraded performance", mark: "!", rank: 1 },
    partial: { label: "Partial outage", mark: "!", rank: 2 },
    major: { label: "Major outage", mark: "×", rank: 3 },
    maintenance: { label: "Maintenance", mark: "◇", rank: 1 },
    unknown: { label: "Unknown", mark: "?", rank: -1 },
  });

  const GROUP_META = Object.freeze({
    core_platform: {
      id: "core",
      order: 0,
      eyebrow: "StreamSuites-owned authority",
      title: "Core platform",
      description: "Authentication, rooms, public APIs, automation, alerts, and integration authority.",
    },
    production_products: {
      id: "production",
      order: 1,
      eyebrow: "Connected product paths",
      title: "Studio & production",
      description: "Browser Studio and the bounded Runtime/Auth edges used by StudioApp and Studio for OBS.",
    },
    web_audience_surfaces: {
      id: "web-surfaces",
      order: 2,
      eyebrow: "StreamSuites-owned surfaces",
      title: "Web & audience surfaces",
      description: "Public, Creator, Admin, Developer, documentation, community, and distribution surfaces.",
    },
    external_dependencies: {
      id: "dependencies",
      order: 3,
      eyebrow: "External / upstream",
      title: "External dependencies",
      description: "Provider-owned services remain visually separate and never define StreamSuites core health by implication.",
    },
  });

  const COMPONENT_ICONS = Object.freeze({
    "3qsdkc52dgt5": "/assets/icons/icondiag-studioweb.svg",
    "b6k38lrqx93f": "/assets/icons/ui/cast.svg",
    "q7435t6bd41x": "/assets/icons/icondiag-studioapp.svg",
    "4fp296vdg5w7": "/assets/icons/ui/tvlive.svg",
    "94cn19vph28j": "/assets/icons/obs-0.svg",
    "tb383cr2p92n": "/assets/icons/ui/shieldlock.svg",
    "4vrh4mg9l4hn": "/assets/icons/ui/meetingroom.svg",
    "0xm0hsy3byjj": "/assets/icons/ui/storage.svg",
    "3xjjgpbydbbf": "/assets/icons/ui/zap.svg",
    "qbczblv2hgv8": "/assets/icons/ui/status-bell.svg",
    "6ww27z4z9vj8": "/assets/icons/ui/chatnotif.svg",
    "zx07yy34tyvl": "/assets/icons/ui/ss-public.svg",
    "rdb3pmbvr4bv": "/assets/icons/ui/photostackflower.svg",
    "5wm11qq4b7w9": "/assets/icons/ui/ss-creator.svg",
    "jnd29jsl8w7b": "/assets/icons/ui/ss-admin.svg",
    "8x9n41kfjtc8": "/assets/icons/ui/ss-developer.svg",
    "p00vypwhfhx3": "/assets/icons/ui/download.svg",
    "n1lw27451j6d": "/assets/icons/cloudflare-0.svg",
    "8zfbmn6ynv99": "/assets/icons/ui/status-envelope.svg",
    "5qbjrf4hq5nn": "/assets/icons/stripeicon-0.svg",
    "gd23vgnp3n89": "/assets/icons/github-0.svg",
  });

  const PROMINENT_COMPONENT_KEYS = new Set([
    "authentication_accounts_sessions",
    "public_apis_exports_version_registry",
    "browser_studio",
    "public_website_status_center",
  ]);

  const isRecord = (value) => Boolean(value && typeof value === "object" && !Array.isArray(value));
  const finiteNumber = (value) => typeof value === "number" && Number.isFinite(value) ? value : null;
  const parseTime = (value) => {
    const parsed = Date.parse(String(value || ""));
    return Number.isFinite(parsed) ? parsed : null;
  };

  const normalizeState = (value) => {
    const key = String(value || "").trim().toLowerCase();
    if (key === "operational") return "operational";
    if (key === "degraded" || key === "degraded_performance") return "degraded";
    if (key === "partial" || key === "partial_outage") return "partial";
    if (key === "major" || key === "major_outage" || key === "critical") return "major";
    if (key === "maintenance" || key === "under_maintenance" || key === "scheduled_maintenance") return "maintenance";
    return "unknown";
  };

  const isValidDiagnostics = (diagnostics) => {
    if (!isRecord(diagnostics) || diagnostics.schema_version !== SCHEMA_VERSION || !isRecord(diagnostics.components)) return false;
    const components = Object.values(diagnostics.components);
    if (components.length > 21 || components.some((component) => !isRecord(component))) return false;
    for (const component of components) {
      if (!isRecord(component.history)) continue;
      for (const [range, limit] of Object.entries(HISTORY_LIMITS)) {
        const rangePayload = component.history[range];
        if (rangePayload == null) continue;
        if (!isRecord(rangePayload) || !Array.isArray(rangePayload.buckets) || rangePayload.buckets.length > limit) return false;
      }
    }
    return true;
  };

  const historyBuckets = (history, range) => {
    const limit = HISTORY_LIMITS[range] || 0;
    const buckets = isRecord(history?.[range]) && Array.isArray(history[range].buckets) ? history[range].buckets : [];
    return buckets.slice(0, limit).filter(isRecord);
  };

  const componentPresentation = (component, projectionUnavailable = false) => {
    if (!isRecord(component)) {
      return { state: "unknown", label: "Observation unavailable", ownership: "Authority unavailable", measured: false };
    }
    const coverage = String(component?.coverage || "").toLowerCase();
    if (coverage === "vendor_managed") {
      return { state: "unknown", label: "Externally managed", ownership: "External / upstream", measured: false };
    }
    if (coverage !== "implemented") {
      return { state: "unknown", label: "Not currently measured", ownership: "StreamSuites-owned · deferred", measured: false };
    }
    if (projectionUnavailable || component?.direct_stale) {
      return { state: "unknown", label: "Stale observation", ownership: "StreamSuites-owned · watchdog", measured: false };
    }
    const state = normalizeState(component?.direct_state);
    return {
      state,
      label: state === "unknown" ? "Observation unavailable" : STATE_META[state].label,
      ownership: "StreamSuites-owned · watchdog",
      measured: state !== "unknown",
    };
  };

  const summarizeSamples = (buckets) => {
    const samples = buckets
      .map((bucket) => finiteNumber(bucket.latency_ms))
      .filter((value) => value !== null)
      .sort((left, right) => left - right);
    if (!samples.length) return { count: 0, minimum: null, median: null, maximum: null };
    const middle = Math.floor(samples.length / 2);
    const median = samples.length % 2 ? samples[middle] : Math.round((samples[middle - 1] + samples[middle]) / 2);
    return { count: samples.length, minimum: samples[0], median, maximum: samples[samples.length - 1] };
  };

  window.StreamSuitesHealthHelpers = Object.freeze({
    HEALTH_ENDPOINT,
    POLL_INTERVAL_MS,
    REQUEST_TIMEOUT_MS,
    normalizeState,
    isValidDiagnostics,
    historyBuckets,
    componentPresentation,
    summarizeSamples,
  });

  const initialize = () => {
    const sourceChip = document.querySelector("[data-health-source]");
    if (!sourceChip) return;

    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches || false;
    const componentLoad = document.querySelector("[data-health-component-load]");
    const componentGroups = document.querySelector("[data-health-component-groups]");
    const heatmapRoot = document.querySelector("[data-health-heatmap]");
    const latencyChart = document.querySelector("[data-latency-chart]");
    let lastGoodDiagnostics = null;
    let currentDiagnostics = null;
    let currentProjectionUnavailable = true;
    let latencyRange = "24h";
    let historyRange = "24h";
    let inFlight = null;
    let pollTimer = 0;

    const setText = (selector, value) => {
      const element = document.querySelector(selector);
      if (element) element.textContent = String(value ?? "—");
    };

    const element = (tag, className, text) => {
      const node = document.createElement(tag);
      if (className) node.className = className;
      if (text !== undefined) node.textContent = String(text);
      return node;
    };

    const svgElement = (tag, attributes = {}) => {
      const node = document.createElementNS("http://www.w3.org/2000/svg", tag);
      Object.entries(attributes).forEach(([name, value]) => node.setAttribute(name, String(value)));
      return node;
    };

    const formatTimestamp = (value, options = {}) => {
      const time = parseTime(value);
      if (time === null) return "Unavailable";
      return new Intl.DateTimeFormat(undefined, {
        dateStyle: options.dateOnly ? "medium" : "medium",
        timeStyle: options.dateOnly ? undefined : "short",
      }).format(new Date(time));
    };

    const formatAge = (seconds) => {
      const value = finiteNumber(seconds);
      if (value === null || value < 0) return "age unavailable";
      if (value < 60) return `${Math.round(value)}s old`;
      if (value < 3600) return `${Math.round(value / 60)}m old`;
      if (value < 86400) return `${Math.round(value / 3600)}h old`;
      return `${Math.round(value / 86400)}d old`;
    };

    const formatPercent = (value) => {
      const numeric = finiteNumber(value);
      if (numeric === null) return "Unavailable";
      return `${numeric.toFixed(numeric % 1 ? 1 : 0)}%`;
    };

    const formatDuration = (seconds) => {
      const numeric = finiteNumber(seconds);
      if (numeric === null) return "Unavailable";
      const rounded = Math.max(0, Math.round(numeric));
      const hours = Math.floor(rounded / 3600);
      const minutes = Math.floor((rounded % 3600) / 60);
      const remaining = rounded % 60;
      if (hours) return `${hours}h ${minutes}m`;
      if (minutes) return `${minutes}m ${remaining}s`;
      return `${remaining}s`;
    };

    const readableToken = (value) => String(value || "")
      .replace(/[_-]+/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());

    const componentEntries = (diagnostics = currentDiagnostics) => Object.entries(diagnostics?.components || {})
      .filter(([key, value]) => typeof key === "string" && isRecord(value));

    const overallPresentation = (diagnostics, unavailable, responseMeta = {}) => {
      if (responseMeta.loading) {
        return { state: "unknown", label: "Connecting to Runtime/Auth", detail: "Waiting for the first authoritative health observation.", mark: "…" };
      }
      if (responseMeta.stale) {
        return { state: "unknown", label: "Health observation is stale", detail: "Runtime’s last projection exceeded its freshness window, so it is not presented as current system health.", mark: "?" };
      }
      if (unavailable) {
        return { state: "unknown", label: "Health data unavailable", detail: "Runtime/Auth could not provide a fresh authoritative projection. Last-known observations, if shown, are not current health.", mark: "?" };
      }
      const overall = diagnostics?.overall_availability;
      if (!isRecord(overall) || overall.contract_version !== OVERALL_CONTRACT_VERSION || !isRecord(overall.current)) {
        return { state: "unknown", label: "Overall health not established", detail: "This projection predates or does not contain Runtime’s canonical overall-health contract. Component observations remain individually labelled.", mark: "?" };
      }
      const freshness = String(overall.current.observation_freshness?.state || "").toLowerCase();
      if (freshness && freshness !== "fresh") {
        return { state: "unknown", label: "Overall observation stale", detail: "Runtime’s overall observation is not fresh, so it is not presented as current system health.", mark: "?" };
      }
      const state = normalizeState(overall.current.watchdog_overall_state);
      const labels = {
        operational: "All measured critical paths operational",
        degraded: "Degraded performance detected",
        partial: "Partial outage detected",
        major: "Major outage detected",
        maintenance: "Maintenance affecting measured paths",
        unknown: "Overall health not established",
      };
      const eligible = finiteNumber(overall.current.total_eligible_path_count);
      const unknown = finiteNumber(overall.current.unknown_path_count);
      const observation = overall.current.observed_at ? `Observed ${formatTimestamp(overall.current.observed_at)}.` : "No current overall observation timestamp is available.";
      const counts = eligible !== null || unknown !== null ? ` ${eligible ?? 0} eligible path${eligible === 1 ? "" : "s"}; ${unknown ?? 0} unknown.` : "";
      return { state, label: labels[state], detail: `${observation}${counts}`, mark: STATE_META[state].mark };
    };

    const renderHero = (diagnostics, unavailable, responseMeta = {}) => {
      const overall = overallPresentation(diagnostics, unavailable, responseMeta);
      document.body.dataset.healthState = overall.state;
      const orbitStage = document.querySelector(".health-orbit__stage");
      if (orbitStage) orbitStage.dataset.state = overall.state;
      setText("[data-health-mark]", overall.mark);
      setText("[data-health-overall]", overall.label);
      setText("[data-health-detail]", overall.detail);

      const entries = componentEntries(diagnostics);
      const presentations = entries.map(([, component]) => componentPresentation(component, unavailable));
      const measured = presentations.filter((item) => item.measured).length;
      const operational = presentations.filter((item) => item.state === "operational" && item.measured).length;
      const attention = presentations.filter((item) => item.measured && !["operational", "unknown"].includes(item.state)).length;
      const total = finiteNumber(diagnostics?.coverage?.total) ?? entries.length;
      const unknown = Math.max(0, total - measured);
      setText("[data-health-measured]", measured);
      setText("[data-health-operational]", operational);
      setText("[data-health-attention]", attention);
      setText("[data-health-unknown]", unknown);

      if (responseMeta.loading) {
        sourceChip.dataset.state = "loading";
        sourceChip.lastChild.textContent = "Connecting to Runtime/Auth";
        setText("[data-health-updated]", "Waiting for an authoritative observation…");
      } else if (responseMeta.stale) {
        sourceChip.dataset.state = "stale";
        sourceChip.lastChild.textContent = "Runtime projection stale";
        setText("[data-health-updated]", `Generated ${formatTimestamp(diagnostics?.generated_at)} · ${formatAge(responseMeta.ageSeconds)}`);
      } else if (unavailable) {
        sourceChip.dataset.state = "unavailable";
        sourceChip.lastChild.textContent = lastGoodDiagnostics ? "Runtime projection unavailable · last known shown" : "Runtime projection unavailable";
        setText("[data-health-updated]", responseMeta.message || "Health data is temporarily unavailable.");
      } else {
        sourceChip.dataset.state = "fresh";
        sourceChip.lastChild.textContent = "Runtime/Auth authoritative";
        setText("[data-health-updated]", `Generated ${formatTimestamp(diagnostics?.generated_at)} · ${formatAge(responseMeta.ageSeconds)}`);
      }
    };

    const historySampleCount = (component) => {
      const range = component?.history?.["30d"];
      const declared = finiteNumber(range?.sample_count);
      if (declared !== null) return declared;
      return historyBuckets(component?.history, "30d").reduce((sum, bucket) => sum + (finiteNumber(bucket.sample_count) ?? 0), 0);
    };

    const createFact = (term, description) => {
      const wrapper = element("div");
      wrapper.append(element("dt", "", term), element("dd", "", description));
      return wrapper;
    };

    const createComponentCard = (key, component, unavailable) => {
      const presentation = componentPresentation(component, unavailable);
      const card = element("article", "health-component-card");
      card.id = `component-${key.replace(/[^a-z0-9_-]/gi, "-")}`;
      card.dataset.state = presentation.state;
      if (PROMINENT_COMPONENT_KEYS.has(key)) card.dataset.prominence = "major";

      const top = element("div", "health-component-card__top");
      const identity = element("div", "health-component-card__identity");
      const icon = element("span", "health-component-card__icon");
      icon.setAttribute("aria-hidden", "true");
      const image = element("img");
      image.alt = "";
      image.src = COMPONENT_ICONS[String(component.component_id || "")] || "/assets/icons/ui/pageinfo.svg";
      image.addEventListener("error", () => {
        if (image.dataset.fallback === "true") return;
        image.dataset.fallback = "true";
        image.src = "/assets/icons/ui/pageinfo.svg";
      });
      icon.append(image);
      const identityCopy = element("div");
      const kicker = element("span", "health-component-card__kicker");
      kicker.append(element("i"), document.createTextNode(presentation.ownership));
      identityCopy.append(kicker, element("h4", "", component.display_name || readableToken(key)));
      identity.append(icon, identityCopy);
      top.append(identity, element("span", "health-component-state", presentation.label));
      card.append(top);

      const description = component.description || "No additional public-safe component detail is available.";
      card.append(element("p", "health-component-card__description", description));

      const retained = unavailable ? [] : historyBuckets(component.history, "24h").slice(-18);
      const microhistory = element("div", retained.length ? "health-component-card__microhistory" : "health-component-card__microhistory health-component-card__microhistory--empty");
      if (retained.length) {
        microhistory.style.setProperty("--sample-count", String(retained.length));
        retained.forEach((bucket) => {
          const sample = element("span");
          sample.dataset.state = normalizeState(bucket.state || bucket.overall_state);
          sample.title = bucketDescription(bucket, component.display_name || readableToken(key));
          microhistory.append(sample);
        });
        microhistory.setAttribute("aria-label", `${retained.length} most recent real retained samples in the 24-hour projection.`);
      } else {
        microhistory.textContent = unavailable ? "RETAINED SAMPLE RAIL UNAVAILABLE" : "NO RETAINED SAMPLE RAIL YET";
      }
      card.append(microhistory);

      const facts = element("dl", "health-component-card__facts");
      const observed = component.last_checked ? formatTimestamp(component.last_checked) : "Unavailable";
      const latency = finiteNumber(component.latency_ms);
      const samples = historySampleCount(component);
      facts.append(
        createFact("Last observation", observed),
        createFact("Response", latency !== null && presentation.measured ? `${Math.round(latency)} ms` : "Not measured"),
        createFact("Retained history", samples > 0 ? `${samples} sample${samples === 1 ? "" : "s"}` : "No history yet")
      );
      card.append(facts);
      card.setAttribute("aria-label", `${component.display_name || readableToken(key)}: ${presentation.label}. ${presentation.ownership}.`);
      return card;
    };

    const renderComponents = (diagnostics, unavailable) => {
      componentGroups.replaceChildren();
      const groups = new Map();
      componentEntries(diagnostics).forEach(([key, component]) => {
        const groupKey = GROUP_META[component.group_key] ? component.group_key : "core_platform";
        if (!groups.has(groupKey)) groups.set(groupKey, []);
        groups.get(groupKey).push([key, component]);
      });

      if (!groups.size) {
        componentLoad.hidden = false;
        componentLoad.dataset.state = "unavailable";
        componentLoad.querySelector("strong").textContent = "Component health is unavailable";
        componentLoad.querySelector("p").textContent = "Runtime/Auth did not return a valid public component projection.";
        componentGroups.hidden = true;
        return;
      }

      [...groups.entries()]
        .sort(([left], [right]) => GROUP_META[left].order - GROUP_META[right].order)
        .forEach(([groupKey, entries]) => {
          const meta = GROUP_META[groupKey];
          const group = element("section", "health-component-group");
          group.id = meta.id;
          group.dataset.group = groupKey;
          group.setAttribute("aria-labelledby", `${meta.id}-title`);

          const header = element("header", "health-component-group__header");
          const title = element("div", "health-component-group__title");
          const titleCopy = element("div");
          titleCopy.append(element("small", "", meta.eyebrow), element("h3", "", meta.title));
          titleCopy.querySelector("h3").id = `${meta.id}-title`;
          title.append(element("i"), titleCopy);

          const presentations = entries.map(([, component]) => componentPresentation(component, unavailable));
          const monitored = presentations.filter((item) => item.measured).length;
          const attention = presentations.filter((item) => item.measured && item.state !== "operational").length;
          const counts = element("div", "health-component-group__counts");
          const countItems = groupKey === "external_dependencies"
            ? [[entries.length, "listed upstream"], [monitored, "directly measured"], [entries.length - monitored, "unknown / deferred"]]
            : [[entries.length, "components"], [monitored, "measured"], [attention, "attention"]];
          countItems.forEach(([value, label]) => {
            const chip = element("span");
            chip.append(element("strong", "", value), document.createTextNode(` ${label}`));
            counts.append(chip);
          });
          header.append(title, counts);

          const grid = element("div", "health-component-grid");
          entries
            .sort(([, left], [, right]) => String(left.display_name || "").localeCompare(String(right.display_name || "")))
            .forEach(([key, component]) => grid.append(createComponentCard(key, component, unavailable)));
          group.append(header, element("p", "health-component-card__description", meta.description), grid);
          componentGroups.append(group);
        });

      componentLoad.hidden = true;
      componentGroups.hidden = false;
    };

    const renderTopology = (diagnostics, unavailable) => {
      const components = diagnostics?.components || {};
      document.querySelectorAll("[data-component-key]").forEach((node) => {
        const key = node.dataset.componentKey;
        const component = isRecord(components[key]) ? components[key] : null;
        const presentation = componentPresentation(component, unavailable || !component);
        node.dataset.state = presentation.state;
        const stateLabel = node.querySelector("[data-node-state]");
        if (stateLabel) stateLabel.textContent = presentation.label;
        const name = component?.display_name || node.querySelector("strong")?.textContent || readableToken(key);
        node.setAttribute("aria-label", `${name}: ${presentation.label}. ${presentation.ownership}.`);
      });
      document.querySelectorAll("[data-route-to]").forEach((path) => {
        const component = components[path.dataset.routeTo];
        path.dataset.state = componentPresentation(component, unavailable || !component).state;
      });
      setText("[data-topology-observation]", unavailable ? "LAST KNOWN / UNAVAILABLE" : `OBSERVED ${formatTimestamp(diagnostics?.generated_at).toUpperCase()}`);
    };

    const setFreshnessSignal = (name, state, value, detail) => {
      const row = document.querySelector(`[data-signal="${name}"]`);
      if (!row) return;
      row.dataset.state = state;
      row.querySelector("strong").textContent = value;
      row.querySelector("p").textContent = detail;
    };

    const renderFreshness = (diagnostics, unavailable, responseMeta = {}) => {
      const summary = document.querySelector("[data-freshness-summary]");
      if (unavailable) {
        summary.dataset.state = "unavailable";
        summary.textContent = "Unavailable";
        setFreshnessSignal("projection", "unknown", "Unavailable", "No fresh authoritative response is available.");
      } else if (responseMeta.stale) {
        summary.dataset.state = "stale";
        summary.textContent = "Stale";
        setFreshnessSignal("projection", "degraded", "Stale", `Projection is ${formatAge(responseMeta.ageSeconds)}.`);
      } else {
        summary.dataset.state = "fresh";
        summary.textContent = "Fresh";
        setFreshnessSignal("projection", "operational", "Fresh", `Projection is ${formatAge(responseMeta.ageSeconds)}.`);
      }

      const freshness = diagnostics?.freshness || {};
      const cycleState = String(freshness.state || "unavailable").toLowerCase();
      setFreshnessSignal(
        "cycle",
        unavailable ? "unknown" : cycleState === "fresh" ? "operational" : cycleState === "stale" ? "degraded" : "unknown",
        unavailable ? "Unavailable" : cycleState === "fresh" ? "Fresh" : cycleState === "stale" ? "Stale" : "Unavailable",
        finiteNumber(freshness.age_seconds) !== null ? `Last cycle is ${formatAge(freshness.age_seconds)}; Runtime limit ${freshness.max_age_seconds ?? "—"}s.` : "No cycle age is available."
      );

      const historyState = String(diagnostics?.watchdog?.history || "unavailable").toLowerCase();
      setFreshnessSignal(
        "history",
        unavailable ? "unknown" : historyState === "available" ? "operational" : "unknown",
        unavailable ? "Unavailable" : historyState === "available" ? "Available" : "Unavailable",
        historyState === "available" && !unavailable ? "The bounded Runtime history store is contributing retained observations." : "Retained history is not currently confirmed."
      );

      const heartbeatState = String(diagnostics?.heartbeat?.state || "unavailable").toLowerCase();
      setFreshnessSignal(
        "heartbeat",
        unavailable ? "unknown" : heartbeatState === "fresh" ? "operational" : heartbeatState === "stale" ? "degraded" : "unknown",
        unavailable ? "Unavailable" : heartbeatState === "fresh" ? "Fresh" : heartbeatState === "stale" ? "Stale" : "Unavailable",
        diagnostics?.heartbeat?.last_accepted_at ? `Last accepted ${formatTimestamp(diagnostics.heartbeat.last_accepted_at)}.` : "No accepted public heartbeat timestamp is available."
      );
    };

    const latencyMetric = (diagnostics = currentDiagnostics) => diagnostics?.metrics?.core_api_response_time || null;

    const renderLatency = () => {
      const metric = latencyMetric();
      const current = finiteNumber(metric?.value_ms);
      setText("[data-latency-current]", current !== null && !currentProjectionUnavailable ? `${Math.round(current)} ms` : "—");
      setText("[data-latency-note]", current !== null && !currentProjectionUnavailable
        ? `Latest measured watchdog observation at ${formatTimestamp(metric?.last_checked)}. Browser fetch time is not substituted.`
        : "No fresh measured Runtime response sample is available.");

      const fallbackHistory = currentDiagnostics?.components?.authentication_accounts_sessions?.history;
      const history = isRecord(metric?.history) ? metric.history : fallbackHistory;
      const buckets = historyBuckets(history, latencyRange)
        .filter((bucket) => finiteNumber(bucket.latency_ms) !== null && parseTime(bucket.at) !== null);
      const summary = summarizeSamples(buckets);
      setText("[data-latency-min]", summary.minimum === null ? "—" : `${Math.round(summary.minimum)} ms`);
      setText("[data-latency-median]", summary.median === null ? "—" : `${Math.round(summary.median)} ms`);
      setText("[data-latency-max]", summary.maximum === null ? "—" : `${Math.round(summary.maximum)} ms`);
      setText("[data-latency-samples]", summary.count);

      latencyChart.replaceChildren();
      if (!summary.count || currentProjectionUnavailable) {
        const empty = element("div", "health-empty-plot");
        empty.append(element("span", "", "∿"), element("strong", "", currentProjectionUnavailable ? "Fresh measurement unavailable" : "No retained samples"), element("small", "", `No real Core API response samples are available for the selected ${RANGE_LABELS[latencyRange]} window.`));
        latencyChart.append(empty);
        latencyChart.setAttribute("aria-label", `No measured Core API response history is available for ${RANGE_LABELS[latencyRange]}.`);
        return;
      }

      const width = 720;
      const height = 250;
      const left = 50;
      const right = 20;
      const top = 20;
      const bottom = 38;
      const baseY = height - bottom;
      const maximum = Math.max(1, Math.ceil(summary.maximum * 1.15));
      const generatedAt = parseTime(currentDiagnostics?.generated_at) ?? Math.max(...buckets.map((bucket) => parseTime(bucket.at)));
      const startAt = generatedAt - RANGE_MILLISECONDS[latencyRange];
      const plot = svgElement("svg", { viewBox: `0 0 ${width} ${height}`, class: "health-latency-plot", role: "img" });
      const title = svgElement("title");
      title.textContent = `${summary.count} measured Core API response samples over ${RANGE_LABELS[latencyRange]}; minimum ${summary.minimum} milliseconds, median ${summary.median}, maximum ${summary.maximum}.`;
      plot.append(title);
      const definitions = svgElement("defs");
      const lineGradient = svgElement("linearGradient", { id: "health-latency-line-gradient", gradientUnits: "userSpaceOnUse", x1: left, y1: "0", x2: width - right, y2: "0" });
      [["0%", "#5d96ff"], ["52%", "#70d8ff"], ["100%", "#a68bff"]].forEach(([offset, color]) => lineGradient.append(svgElement("stop", { offset, "stop-color": color })));
      const areaGradient = svgElement("linearGradient", { id: "health-latency-area-gradient", gradientUnits: "userSpaceOnUse", x1: "0", y1: top, x2: "0", y2: baseY });
      [["0%", "#70d8ff", ".28"], ["60%", "#5d96ff", ".13"], ["100%", "#a68bff", ".015"]].forEach(([offset, color, opacity]) => areaGradient.append(svgElement("stop", { offset, "stop-color": color, "stop-opacity": opacity })));
      definitions.append(lineGradient, areaGradient);
      plot.append(definitions);

      const yFor = (value) => baseY - (Math.max(0, Math.min(maximum, value)) / maximum) * (baseY - top);
      [1, .75, .5, .25, 0].forEach((ratio) => {
        const value = Math.round(maximum * ratio);
        const y = yFor(value);
        plot.append(svgElement("line", { x1: left, y1: y, x2: width - right, y2: y, class: "health-latency-plot__gridline" }));
        const label = svgElement("text", { x: left - 8, y: y + 3, "text-anchor": "end", class: "health-latency-plot__axis" });
        label.textContent = `${value}ms`;
        plot.append(label);
      });
      for (let index = 0; index < 5; index += 1) {
        const ratio = index / 4;
        const x = left + ratio * (width - left - right);
        plot.append(svgElement("line", { x1: x, y1: top, x2: x, y2: baseY, class: "health-latency-plot__gridline health-latency-plot__gridline--vertical" }));
        const at = new Date(startAt + ratio * RANGE_MILLISECONDS[latencyRange]);
        const label = svgElement("text", { x, y: height - 14, "text-anchor": index === 0 ? "start" : index === 4 ? "end" : "middle", class: "health-latency-plot__axis" });
        label.textContent = new Intl.DateTimeFormat(undefined, latencyRange === "5h" || latencyRange === "24h" ? { hour: "2-digit", minute: "2-digit" } : { month: "short", day: "numeric" }).format(at);
        plot.append(label);
      }

      const points = buckets
        .map((bucket) => {
          const at = parseTime(bucket.at);
          const value = finiteNumber(bucket.latency_ms);
          const ratio = Math.min(1, Math.max(0, (at - startAt) / RANGE_MILLISECONDS[latencyRange]));
          return { bucket, at, value, x: left + ratio * (width - left - right), y: yFor(value) };
        })
        .sort((one, two) => one.at - two.at);
      const expectedStep = RANGE_MILLISECONDS[latencyRange] / HISTORY_LIMITS[latencyRange];
      const segments = [];
      points.forEach((point) => {
        const segment = segments.at(-1);
        if (!segment || point.at - segment.at(-1).at > expectedStep * 1.8) segments.push([point]);
        else segment.push(point);
      });

      segments.forEach((segment, index) => {
        if (index > 0) {
          const previous = segments[index - 1].at(-1);
          const gap = svgElement("rect", { x: previous.x, y: top, width: Math.max(1, segment[0].x - previous.x), height: baseY - top, class: "health-latency-plot__gap" });
          const gapTitle = svgElement("title");
          gapTitle.textContent = `No retained response sample between ${formatTimestamp(previous.bucket.at)} and ${formatTimestamp(segment[0].bucket.at)}.`;
          gap.append(gapTitle);
          plot.append(gap);
        }
        if (segment.length < 2) return;
        const pathData = segment.map((point, pointIndex) => `${pointIndex ? "L" : "M"}${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(" ");
        const area = svgElement("path", { d: `${pathData} L${segment.at(-1).x.toFixed(2)} ${baseY} L${segment[0].x.toFixed(2)} ${baseY} Z`, fill: "url(#health-latency-area-gradient)", class: "health-latency-plot__area" });
        const line = svgElement("path", { d: pathData, stroke: "url(#health-latency-line-gradient)", class: "health-latency-plot__line" });
        plot.append(area, line);
      });

      points.forEach((point, index) => {
        const marker = svgElement("circle", { cx: point.x, cy: point.y, r: index === points.length - 1 ? "3.5" : "2.2", class: `health-latency-plot__point${index === points.length - 1 ? " is-current" : ""}`, tabindex: "0" });
        const markerTitle = svgElement("title");
        markerTitle.textContent = `${formatTimestamp(point.bucket.at)}: ${Math.round(point.value)} milliseconds.`;
        marker.append(markerTitle);
        plot.append(marker);
      });
      latencyChart.append(plot);
      latencyChart.setAttribute("aria-label", title.textContent);
    };

    const bucketDescription = (bucket, label) => {
      const state = normalizeState(bucket.state || bucket.overall_state);
      const latency = finiteNumber(bucket.latency_ms);
      const availability = finiteNumber(bucket.availability_percent);
      const pieces = [`${label}`, formatTimestamp(bucket.at), STATE_META[state].label];
      if (latency !== null) pieces.push(`${Math.round(latency)} milliseconds`);
      if (availability !== null) pieces.push(`${availability}% observed availability`);
      return pieces.join(" · ");
    };

    const createHeatmapRow = (label, sublabel, buckets, rangeEnd) => {
      const row = element("div", "health-heatmap__row");
      const name = element("div", "health-heatmap__name");
      name.append(element("strong", "", label), element("small", "", sublabel));
      const cells = element("div", "health-heatmap__cells");
      const slots = HISTORY_LIMITS[historyRange];
      const rangeStart = rangeEnd - RANGE_MILLISECONDS[historyRange];
      cells.style.setProperty("--bucket-slots", String(slots));
      buckets.forEach((bucket, index) => {
        const state = normalizeState(bucket.state || bucket.overall_state);
        const cell = element("button", "health-heatmap__cell");
        cell.type = "button";
        cell.dataset.state = state;
        const at = parseTime(bucket.at);
        const ratio = at === null ? index / Math.max(1, buckets.length - 1) : Math.min(1, Math.max(0, (at - rangeStart) / RANGE_MILLISECONDS[historyRange]));
        cell.style.gridColumn = String(Math.min(slots, Math.max(1, Math.floor(ratio * (slots - 1)) + 1)));
        const description = bucketDescription(bucket, label);
        cell.title = description;
        cell.setAttribute("aria-label", description);
        cells.append(cell);
      });
      row.append(name, cells, element("span", "health-heatmap__count", `${buckets.length} bucket${buckets.length === 1 ? "" : "s"}`));
      return row;
    };

    const renderHistory = () => {
      heatmapRoot.replaceChildren();
      const rows = [];
      const overall = currentDiagnostics?.overall_availability;
      const overallRange = isRecord(overall?.ranges?.[historyRange]) ? overall.ranges[historyRange] : null;
      setText("[data-history-availability]", currentProjectionUnavailable ? "Unavailable" : formatPercent(overallRange?.watchdog_observed_availability_percent));
      setText("[data-history-coverage]", currentProjectionUnavailable ? "Unavailable" : formatPercent(overallRange?.observation_coverage_percent));
      setText("[data-history-downtime]", currentProjectionUnavailable ? "Unavailable" : formatDuration(overallRange?.downtime_seconds));
      const observedBuckets = finiteNumber(overallRange?.observed_buckets);
      const expectedBuckets = finiteNumber(overallRange?.expected_buckets);
      setText("[data-history-buckets]", currentProjectionUnavailable || observedBuckets === null ? "Unavailable" : expectedBuckets === null ? observedBuckets : `${observedBuckets}/${expectedBuckets}`);
      const authoritativeRangeEnd = parseTime(currentDiagnostics?.generated_at);
      const rangeEnd = authoritativeRangeEnd ?? Date.now();
      setText("[data-history-start]", authoritativeRangeEnd === null ? "Range start unavailable" : formatTimestamp(new Date(rangeEnd - RANGE_MILLISECONDS[historyRange]).toISOString()));
      setText("[data-history-end]", authoritativeRangeEnd === null ? "Latest unavailable" : formatTimestamp(new Date(rangeEnd).toISOString()));
      const overallBuckets = Array.isArray(overallRange?.state_timeline)
        ? overallRange.state_timeline.slice(0, HISTORY_LIMITS[historyRange]).filter(isRecord)
        : [];
      if (overall?.contract_version === OVERALL_CONTRACT_VERSION && overallBuckets.length) {
        rows.push({ label: "Critical paths (overall)", sublabel: "Runtime-derived overall observations", buckets: overallBuckets });
      }

      const criticalIds = new Set(Array.isArray(overall?.critical_components)
        ? overall.critical_components.map((item) => String(item?.component_id || ""))
        : []);
      componentEntries()
        .map(([key, component]) => ({ key, component, buckets: historyBuckets(component.history, historyRange) }))
        .filter((item) => item.buckets.length)
        .sort((left, right) => {
          const leftCritical = criticalIds.has(String(left.component.component_id || "")) ? 0 : 1;
          const rightCritical = criticalIds.has(String(right.component.component_id || "")) ? 0 : 1;
          return leftCritical - rightCritical || String(left.component.display_name || "").localeCompare(String(right.component.display_name || ""));
        })
        .forEach(({ component, buckets }) => rows.push({
          label: component.display_name || "Unnamed component",
          sublabel: component.coverage === "implemented" ? "Direct watchdog observations" : "Authoritative retained observations",
          buckets,
        }));

      if (!rows.length || currentProjectionUnavailable) {
        const empty = element("div", "health-history-empty");
        const copy = element("div");
        copy.append(
          element("strong", "", currentProjectionUnavailable ? "Historical observations are unavailable" : "Historical sampling has not accumulated yet"),
          element("p", "", `No authoritative retained buckets are available for the selected ${RANGE_LABELS[historyRange]} window.`)
        );
        empty.append(element("span", "health-history-empty__mark"), copy);
        heatmapRoot.append(empty);
        setText("[data-history-caption]", `No retained ${historyRange.toUpperCase()} buckets available`);
        return;
      }

      const container = element("div", "health-heatmap__rows");
      rows.forEach((row) => container.append(createHeatmapRow(row.label, row.sublabel, row.buckets, rangeEnd)));
      heatmapRoot.append(container);
      const bucketCount = rows.reduce((sum, row) => sum + row.buckets.length, 0);
      setText("[data-history-caption]", `${bucketCount} real bucket${bucketCount === 1 ? "" : "s"} across ${rows.length} observed row${rows.length === 1 ? "" : "s"} · ${historyRange.toUpperCase()}`);
    };

    const renderAll = (diagnostics, unavailable, responseMeta = {}) => {
      currentDiagnostics = diagnostics;
      currentProjectionUnavailable = unavailable;
      renderHero(diagnostics, unavailable, responseMeta);
      renderComponents(diagnostics, unavailable);
      renderTopology(diagnostics, unavailable);
      renderFreshness(diagnostics, unavailable, responseMeta);
      renderLatency();
      renderHistory();
    };

    const fetchHealth = ({ force = false } = {}) => {
      if (inFlight && !force) return inFlight;
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
      const refreshButton = document.querySelector("[data-refresh-health]");
      if (refreshButton) refreshButton.disabled = true;

      inFlight = fetch(HEALTH_ENDPOINT, {
        signal: controller.signal,
        cache: "no-store",
        credentials: "omit",
        headers: { Accept: "application/json" },
      })
        .then(async (response) => {
          const payload = await response.json().catch(() => null);
          if (!response.ok || !isRecord(payload) || !payload.available || !isValidDiagnostics(payload.diagnostics)) {
            throw new Error("authoritative_health_unavailable");
          }
          lastGoodDiagnostics = payload.diagnostics;
          const stale = Boolean(payload.stale);
          renderAll(payload.diagnostics, stale, { stale, ageSeconds: finiteNumber(payload.age_seconds) });
          return payload;
        })
        .catch((error) => {
          const message = error?.name === "AbortError"
            ? "The health request timed out; current health is Unknown."
            : "Authoritative health data is unavailable; current health is Unknown.";
          renderAll(lastGoodDiagnostics, true, { message });
          return null;
        })
        .finally(() => {
          window.clearTimeout(timeout);
          if (refreshButton) refreshButton.disabled = false;
          inFlight = null;
        });
      return inFlight;
    };

    document.querySelector("[data-refresh-health]")?.addEventListener("click", () => fetchHealth({ force: true }));

    const bindRangeButtons = (rootSelector, onChange) => {
      const root = document.querySelector(rootSelector);
      const buttons = [...(root?.querySelectorAll("button[data-range]") || [])];
      buttons.forEach((button) => button.setAttribute("aria-pressed", String(button.classList.contains("is-active"))));
      root?.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-range]");
        if (!button || !HISTORY_LIMITS[button.dataset.range]) return;
        buttons.forEach((item) => {
          const active = item === button;
          item.classList.toggle("is-active", active);
          item.setAttribute("aria-pressed", String(active));
        });
        onChange(button.dataset.range);
      });
      root?.addEventListener("keydown", (event) => {
        if (!event.target.matches("button[data-range]")) return;
        const currentIndex = buttons.indexOf(event.target);
        let next = null;
        if (event.key === "ArrowRight" || event.key === "ArrowDown") next = buttons[(currentIndex + 1) % buttons.length];
        if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = buttons[(currentIndex - 1 + buttons.length) % buttons.length];
        if (event.key === "Home") next = buttons[0];
        if (event.key === "End") next = buttons.at(-1);
        if (!next) return;
        event.preventDefault();
        next.focus();
        next.click();
      });
    };
    bindRangeButtons("[data-latency-ranges]", (range) => { latencyRange = range; renderLatency(); });
    bindRangeButtons("[data-history-ranges]", (range) => { historyRange = range; renderHistory(); });

    const topology = document.querySelector("[data-health-topology]");
    const topologyNodes = [...document.querySelectorAll(".health-node[data-component-key]")];
    const setActiveTopologyRoute = (componentKey) => {
      const runtimeActive = componentKey === "public_apis_exports_version_registry";
      let matched = false;
      topology?.querySelectorAll("[data-route-to]").forEach((route) => {
        const active = runtimeActive || route.dataset.routeTo === componentKey;
        route.classList.toggle("is-active", active);
        matched ||= active;
      });
      topology?.classList.toggle("has-active-route", matched);
    };
    const clearActiveTopologyRoute = () => {
      topology?.classList.remove("has-active-route");
      topology?.querySelectorAll("[data-route-to]").forEach((route) => route.classList.remove("is-active"));
    };
    topologyNodes.forEach((node) => {
      node.addEventListener("pointerenter", () => setActiveTopologyRoute(node.dataset.componentKey));
      node.addEventListener("pointerleave", clearActiveTopologyRoute);
      node.addEventListener("focus", () => setActiveTopologyRoute(node.dataset.componentKey));
      node.addEventListener("blur", clearActiveTopologyRoute);
    });

    const navToggle = document.querySelector("[data-nav-toggle]");
    const primaryNav = document.querySelector("[data-primary-nav]");
    navToggle?.addEventListener("click", () => {
      const open = !primaryNav?.classList.contains("is-open");
      primaryNav?.classList.toggle("is-open", open);
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    });
    primaryNav?.addEventListener("click", (event) => {
      if (!event.target.closest("a")) return;
      primaryNav.classList.remove("is-open");
      navToggle?.setAttribute("aria-expanded", "false");
      navToggle?.setAttribute("aria-label", "Open navigation");
    });

    const reveals = [...document.querySelectorAll(".reveal")];
    if (reducedMotion || !("IntersectionObserver" in window)) {
      reveals.forEach((node) => node.classList.add("is-visible"));
    } else {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      }, { rootMargin: "0px 0px -7%", threshold: .08 });
      reveals.forEach((node) => observer.observe(node));
    }

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") fetchHealth();
    });
    pollTimer = window.setInterval(() => {
      if (document.visibilityState === "visible") fetchHealth();
    }, POLL_INTERVAL_MS);
    window.addEventListener("pagehide", () => {
      if (pollTimer) window.clearInterval(pollTimer);
      pollTimer = 0;
    }, { once: true });

    renderHero(null, true, { loading: true });
    fetchHealth();
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true });
  else initialize();
})();
