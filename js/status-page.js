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
  };

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
    if (["core", "surfaces", "edge", "dependencies"].includes(id)) return id;
    const label = String(group?.label || "").toLowerCase();
    if (/core|runtime|identity|auth/.test(label)) return "core";
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
    const aggregate = { core: [], surfaces: [], edge: [], dependencies: [] };
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
  };

  const matchesFilter = (component) => {
    const name = String(component.name || "").toLowerCase();
    if (state.search && !name.includes(state.search)) return false;
    if (state.filter === "operational") return component.normalizedState === "operational";
    if (state.filter === "attention") return component.normalizedState !== "operational";
    return true;
  };

  const componentInitial = (name) => {
    const words = String(name || "").replace(/StreamSuites/gi, "").trim().split(/\s+/).filter(Boolean);
    if (!words.length) return "S";
    return words.slice(0, 2).map((word) => word[0]).join("").toUpperCase();
  };

  const createComponentCard = (component) => {
    const card = node("article", "component-card");
    card.dataset.state = component.normalizedState;
    card.style.setProperty("--component-color", STATUS_COLORS[component.normalizedState] || STATUS_COLORS.unknown);

    const identity = node("div", "component-card__identity");
    const icon = node("span", "component-card__icon", componentInitial(component.name));
    icon.setAttribute("aria-hidden", "true");
    const copy = node("div");
    copy.append(node("h4", "", component.name || "Unnamed component"), node("p", "", `Component status · ${component.statusLabel}`));
    identity.append(icon, copy);

    const badge = node("span", "component-state", component.statusLabel);
    card.append(identity, badge);
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

      const section = node("section", "component-group reveal is-visible");
      const heading = node("div", "component-group__heading");
      const operational = visible.filter((component) => component.normalizedState === "operational").length;
      heading.append(node("h3", "", group.label), node("span", "", `${operational}/${visible.length} operational`));
      const grid = node("div", "component-grid");
      visible.forEach((component) => grid.appendChild(createComponentCard(component)));
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
