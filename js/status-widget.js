(() => {
  "use strict";

  const STATUS_PAGE_URL = "https://streamsuites.statuspage.io/";
  const PRIMARY_STATUS_URL = "/status";

  // Inline geometry is derived from /assets/icons/ui/plus.svg and /assets/icons/ui/cross.svg.
  const EXPAND_ICONS = Object.freeze({
    plus: {
      viewBox: "0 -960 960 960",
      path: "M427.67-92v-335.67H92v-104.66h335.67v-336.34h104.66v336.34h336.34v104.66H532.33V-92H427.67Z",
    },
    cross: {
      viewBox: "0 0 512 512",
      path: "M141.077,418.667l-47.744,-47.744l114.295,-115.018l-114.295,-114.295l47.744,-47.743l115.018,114.295l114.295,-114.295l47.743,47.743l-114.295,114.295l114.295,115.018l-47.743,47.744l-114.295,-114.295l-115.018,114.295Z",
    },
  });

  const STATE_META = Object.freeze({
    operational: { label: "Operational", short: "Operational", mark: "✓" },
    degraded: { label: "Degraded performance", short: "Degraded", mark: "!" },
    partial: { label: "Partial outage", short: "Partial outage", mark: "!" },
    major: { label: "Major outage", short: "Major outage", mark: "×" },
    critical: { label: "Critical outage", short: "Critical", mark: "×" },
    maintenance: { label: "Under maintenance", short: "Maintenance", mark: "◇" },
    unknown: { label: "Status unavailable", short: "Unknown", mark: "?" },
  });

  const COMPONENT_META = Object.freeze({
    operational: { state: "operational", label: "Operational" },
    degraded_performance: { state: "degraded", label: "Degraded" },
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
    const meta = COMPONENT_META[component?.status] || { state: "unknown", label: "Unknown" };
    return { ...component, normalizedState: meta.state, statusLabel: meta.label };
  };

  const inferCategory = (component) => {
    if (component?.category) return component.category;
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
    const normalized = (Array.isArray(components) ? components : [])
      .filter((component) => !component?.group)
      .map(normalizeComponent)
      .sort((a, b) => {
        const positionA = Number.isFinite(Number(a.position)) ? Number(a.position) : Number.MAX_SAFE_INTEGER;
        const positionB = Number.isFinite(Number(b.position)) ? Number(b.position) : Number.MAX_SAFE_INTEGER;
        if (positionA !== positionB) return positionA - positionB;
        return String(a.name || "").localeCompare(String(b.name || ""));
      });

    const parentGroups = new Map(
      (Array.isArray(components) ? components : [])
        .filter((component) => component?.group && component?.id)
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
      const indexA = order.indexOf(a.id);
      const indexB = order.indexOf(b.id);
      if (indexA !== -1 || indexB !== -1) {
        return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
      }
      return a.label.localeCompare(b.label);
    });
  };

  const unresolvedIncidents = (incidents) => (Array.isArray(incidents) ? incidents : [])
    .filter((incident) => !["resolved", "postmortem"].includes(String(incident?.status || "").toLowerCase()));

  const activeMaintenances = (maintenances) => (Array.isArray(maintenances) ? maintenances : [])
    .filter((item) => !["completed"].includes(String(item?.status || "").toLowerCase()));

  const latestUpdate = (event) => Array.isArray(event?.incident_updates) && event.incident_updates.length
    ? event.incident_updates[0]
    : null;

  const truncate = (value, limit = 130) => {
    const text = String(value || "").trim();
    if (text.length <= limit) return text;
    const slice = text.slice(0, limit);
    const lastSpace = slice.lastIndexOf(" ");
    return `${slice.slice(0, lastSpace > 65 ? lastSpace : limit)}…`;
  };

  const formatRelative = (value) => {
    const ms = Date.parse(value || "");
    if (!Number.isFinite(ms)) return "Time unavailable";
    const delta = Date.now() - ms;
    const abs = Math.abs(delta);
    const units = [
      ["day", 86_400_000],
      ["hour", 3_600_000],
      ["minute", 60_000],
    ];
    for (const [unit, size] of units) {
      if (abs >= size) {
        const amount = Math.round(delta / size);
        return new Intl.RelativeTimeFormat(undefined, { numeric: "auto" }).format(-amount, unit);
      }
    }
    return "Just now";
  };

  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  };

  const createExpandIcon = (kind = "plus") => {
    const icon = EXPAND_ICONS[kind] || EXPAND_ICONS.plus;
    const wrap = element("span", "ss-status-widget__expand-icon");
    wrap.dataset.iconKind = kind;
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", icon.viewBox);
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", icon.path);
    path.setAttribute("fill", "currentColor");
    svg.appendChild(path);
    wrap.appendChild(svg);
    return wrap;
  };

  class FullStatusWidget {
    constructor(host) {
      this.host = host || document.body;
      this.root = null;
      this.toggle = null;
      this.panel = null;
      this.expandIcon = null;
      this.currentSnapshot = null;
      this.expanded = false;
      this.userCollapsedDuringAlert = false;
      this.footerAvoidanceCleanup = null;
      this.build();
    }

    build() {
      const root = element("div", "ss-status-widget ss-status-indicator");
      root.id = "ss-status-indicator";
      root.dataset.state = "unknown";
      root.dataset.expanded = "false";

      const toggle = element("button", "ss-status-widget__toggle");
      toggle.type = "button";
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-controls", "ss-status-widget-panel");
      toggle.setAttribute("aria-label", "Open complete StreamSuites service status");

      const signal = element("span", "ss-status-widget__signal");
      signal.setAttribute("aria-hidden", "true");
      signal.appendChild(element("span", "ss-status-widget__signal-dot"));

      const summary = element("span", "ss-status-widget__summary");
      const summaryTitle = element("strong", "", "Loading status…");
      summaryTitle.dataset.widgetSummaryTitle = "";
      const summaryMeta = element("span", "", "Connecting to Statuspage");
      summaryMeta.dataset.widgetSummaryMeta = "";
      summary.append(summaryTitle, summaryMeta);

      const expandControl = element("span", "ss-status-widget__expand-control");
      expandControl.setAttribute("aria-hidden", "true");
      const expandIcon = createExpandIcon("plus");
      expandControl.appendChild(expandIcon);
      toggle.append(signal, summary, expandControl);

      const panel = element("section", "ss-status-widget__panel");
      panel.id = "ss-status-widget-panel";
      panel.setAttribute("aria-label", "Detailed StreamSuites service status");
      panel.setAttribute("aria-hidden", "true");

      root.append(toggle, panel);
      this.host.classList.add("ss-status-widget-host");
      this.host.appendChild(root);
      this.root = root;
      this.toggle = toggle;
      this.panel = panel;
      this.expandIcon = expandIcon;
      this.setupFooterAvoidance();
      this.updateExpandIcon();

      toggle.addEventListener("click", () => this.setExpanded(!this.expanded, { user: true }));
      root.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && this.expanded) {
          event.preventDefault();
          this.setExpanded(false, { user: true });
          toggle.focus();
        }
      });
      document.addEventListener("pointerdown", (event) => {
        if (!this.expanded || root.contains(event.target)) return;
        this.setExpanded(false, { user: true });
      });
    }

    setupFooterAvoidance() {
      const host = this.host;
      if (!(host instanceof HTMLElement)) return;

      const findFooter = () => {
        const candidates = [...document.querySelectorAll("footer, [role='contentinfo']")]
          .filter((node) => node instanceof HTMLElement)
          .filter((node) => {
            const rect = node.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0;
          });
        if (!candidates.length) return null;
        return candidates.reduce((lowest, candidate) => {
          if (!lowest) return candidate;
          return candidate.getBoundingClientRect().top > lowest.getBoundingClientRect().top ? candidate : lowest;
        }, null);
      };

      let footer = findFooter();
      let frame = 0;
      let footerObserver = null;

      const update = () => {
        frame = 0;
        if (!footer || !document.documentElement.contains(footer)) footer = findFooter();
        if (!footer) {
          host.style.setProperty("--status-widget-footer-floor", "0px");
          host.dataset.footerAvoiding = "false";
          return;
        }

        const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
        const rect = footer.getBoundingClientRect();
        const footerVisible = rect.top < viewportHeight && rect.bottom > 0;
        const clearance = 12;

        // The widget is fixed to the viewport. When the footer enters view,
        // lift the widget so its bottom edge stays above the footer's top edge.
        const requiredBottom = footerVisible
          ? Math.max(0, Math.ceil(viewportHeight - rect.top + clearance))
          : 0;
        const maximumFloor = Math.max(0, viewportHeight - 84);
        const floor = Math.min(maximumFloor, requiredBottom);

        host.style.setProperty("--status-widget-footer-floor", `${floor}px`);
        host.dataset.footerAvoiding = String(floor > 0);
      };

      const requestUpdate = () => {
        if (frame) return;
        frame = window.requestAnimationFrame(update);
      };

      if ("ResizeObserver" in window && footer) {
        footerObserver = new ResizeObserver(requestUpdate);
        footerObserver.observe(footer);
      }

      window.addEventListener("scroll", requestUpdate, { passive: true });
      window.addEventListener("resize", requestUpdate, { passive: true });
      window.addEventListener("orientationchange", requestUpdate, { passive: true });
      requestUpdate();

      this.footerAvoidanceCleanup = () => {
        if (frame) window.cancelAnimationFrame(frame);
        footerObserver?.disconnect();
        window.removeEventListener("scroll", requestUpdate);
        window.removeEventListener("resize", requestUpdate);
        window.removeEventListener("orientationchange", requestUpdate);
      };
    }

    updateExpandIcon() {
      if (!(this.expandIcon instanceof HTMLElement)) return;
      const kind = this.expanded ? "cross" : "plus";
      if (this.expandIcon.dataset.iconKind === kind) return;
      const icon = EXPAND_ICONS[kind] || EXPAND_ICONS.plus;
      const svg = this.expandIcon.querySelector("svg");
      const path = svg?.querySelector("path");
      if (!svg || !path) return;
      svg.setAttribute("viewBox", icon.viewBox);
      path.setAttribute("d", icon.path);
      this.expandIcon.dataset.iconKind = kind;
    }

    setExpanded(expanded, { user = false } = {}) {
      this.expanded = Boolean(expanded);
      this.root.dataset.expanded = String(this.expanded);
      this.toggle.setAttribute("aria-expanded", String(this.expanded));
      this.toggle.setAttribute("aria-label", this.expanded
        ? "Collapse complete StreamSuites service status"
        : "Open complete StreamSuites service status");
      this.panel.setAttribute("aria-hidden", String(!this.expanded));
      this.updateExpandIcon();
      if (user && !this.expanded && ["major", "critical", "partial"].includes(this.root.dataset.state)) {
        this.userCollapsedDuringAlert = true;
      }
    }

    render(snapshot) {
      if (!snapshot?.data) {
        this.renderUnavailable(snapshot);
        return;
      }
      this.currentSnapshot = snapshot;
      const data = snapshot.data;
      const components = Array.isArray(data.components) ? data.components : [];
      const normalized = components.filter((component) => !component?.group).map(normalizeComponent);
      const operational = normalized.filter((component) => component.normalizedState === "operational").length;
      const incidents = unresolvedIncidents(data.incidents);
      const maintenances = activeMaintenances(data.scheduled_maintenances);
      const state = stateFromIndicator(data.status?.indicator, data.status?.description);
      const meta = STATE_META[state] || STATE_META.unknown;

      this.root.dataset.state = state;
      this.root.dataset.stale = String(Boolean(snapshot.stale));
      this.toggle.querySelector("[data-widget-summary-title]").textContent = data.status?.description || meta.label;
      this.toggle.querySelector("[data-widget-summary-meta]").textContent = `${operational}/${normalized.length} components · ${formatRelative(snapshot.checkedAt)}`;
      this.toggle.setAttribute("aria-label", `${data.status?.description || meta.label}. ${this.expanded ? "Collapse" : "Open"} complete service status.`);

      this.panel.innerHTML = "";
      this.panel.appendChild(this.createHeader(data, snapshot, meta));
      if (snapshot.stale) this.panel.appendChild(this.createStaleNotice(snapshot));
      this.panel.appendChild(this.createStats(normalized, incidents, maintenances, snapshot));

      const scroll = element("div", "ss-status-widget__scroll");
      scroll.appendChild(this.createMetrics(snapshot));
      groupComponents(components).forEach((group) => scroll.appendChild(this.createComponentGroup(group)));
      scroll.appendChild(this.createEventGroup("Active incidents", incidents, "incident"));
      scroll.appendChild(this.createEventGroup("Scheduled maintenance", maintenances, "maintenance"));
      this.panel.appendChild(scroll);
      this.panel.appendChild(this.createActions());

      if (["major", "critical", "partial"].includes(state) && !this.userCollapsedDuringAlert) {
        this.setExpanded(true);
      }
    }

    renderUnavailable(snapshot) {
      this.root.dataset.state = "unknown";
      this.root.dataset.stale = "false";
      this.toggle.querySelector("[data-widget-summary-title]").textContent = "Status unavailable";
      this.toggle.querySelector("[data-widget-summary-meta]").textContent = "Public feed unavailable";
      this.panel.innerHTML = "";
      const safeSnapshot = {
        live: false,
        stale: false,
        checkedAt: snapshot?.checkedAt || new Date().toISOString(),
        latencyMs: null,
      };
      this.panel.appendChild(this.createHeader({ status: { description: "Status unavailable" } }, safeSnapshot, STATE_META.unknown));
      this.panel.appendChild(this.createStats([], [], [], safeSnapshot));
      const scroll = element("div", "ss-status-widget__scroll");
      scroll.appendChild(this.createMetrics(snapshot));
      const unavailable = element("section", "ss-status-widget__group");
      unavailable.appendChild(element("p", "ss-status-widget__empty", "The read-only Atlassian Statuspage feed could not be reached. No local or fabricated operational state is substituted."));
      scroll.appendChild(unavailable);
      scroll.appendChild(this.createEventGroup("Active incidents", [], "incident"));
      scroll.appendChild(this.createEventGroup("Scheduled maintenance", [], "maintenance"));
      this.panel.appendChild(scroll);
      this.panel.appendChild(this.createActions());
    }

    createHeader(data, snapshot, meta) {
      const head = element("header", "ss-status-widget__head");
      const icon = element("span", "ss-status-widget__head-icon", meta.mark);
      icon.setAttribute("aria-hidden", "true");
      const copy = element("div", "ss-status-widget__head-copy");
      copy.append(
        element("p", "", snapshot.live ? "Live Atlassian Statuspage" : snapshot.stale ? "Last successful public read" : "Public read unavailable"),
        element("h2", "", data.status?.description || meta.label),
        element("span", "", `Checked ${formatRelative(snapshot.checkedAt)}${snapshot.latencyMs != null ? ` · ${snapshot.latencyMs} ms` : ""}`)
      );
      const close = element("button", "ss-status-widget__close", "×");
      close.type = "button";
      close.setAttribute("aria-label", "Close status details");
      close.addEventListener("click", () => this.setExpanded(false, { user: true }));
      head.append(icon, copy, close);
      return head;
    }

    createStaleNotice(snapshot) {
      const notice = element("div", "ss-status-widget__stale");
      notice.append(element("span", "", "!"), element("span", "", "Live refresh failed. Showing the last successful in-memory state."));
      return notice;
    }

    createStats(components, incidents, maintenances, snapshot) {
      const operational = components.filter((component) => component.normalizedState === "operational").length;
      const attention = components.length - operational;
      const stats = element("div", "ss-status-widget__stats");
      [
        [String(components.length), "Components"],
        [String(attention), "Attention"],
        [String(incidents.length), "Incidents"],
        [snapshot.latencyMs == null ? "—" : `${snapshot.latencyMs}ms`, "Feed latency"],
      ].forEach(([value, label]) => {
        const item = element("div");
        item.append(element("strong", "", value), element("span", "", label));
        stats.appendChild(item);
      });
      return stats;
    }

    createMetrics(snapshot) {
      const diagnostics = snapshot?.diagnostics;
      const metrics = diagnostics?.metrics;
      const core = metrics?.core_api_response_time;
      const studio = metrics?.studio_room_readiness;
      const stale = Boolean(snapshot?.diagnosticsStale || (diagnostics && !snapshot?.diagnosticsLive));
      const coreValue = core?.value_ms;
      const coreObserved = core?.state === "observed" && coreValue != null && Number.isFinite(Number(coreValue)) && Number(coreValue) >= 0;
      const studioValue = studio?.value;
      const studioObserved = studio?.state === "observed" && studioValue != null && Number.isFinite(Number(studioValue));
      const studioDeferred = studio?.state === "deferred";

      const section = element("section", "ss-status-widget__group ss-status-widget__metrics");
      const heading = element("div", "ss-status-widget__group-head");
      heading.append(element("h3", "", "Atlassian custom metrics"), element("span", "", "2 metrics"));
      const source = element("p", "ss-status-widget__metrics-source", "Sanitized Runtime/Auth projection · read only");
      const grid = element("div", "ss-status-widget__metrics-grid");

      const createCard = ({ key, title, value, state, detail }) => {
        const card = element("article", "ss-status-widget__metric");
        card.dataset.metric = key;
        card.dataset.state = state;
        const head = element("div", "ss-status-widget__metric-head");
        head.append(element("h4", "", title), element("span", "ss-status-widget__metric-state", state === "observed" ? "Observed" : state === "stale" ? "Stale reading" : state === "deferred" ? "Deferred" : "Unavailable"));
        card.append(head, element("strong", "ss-status-widget__metric-value", value), element("p", "ss-status-widget__metric-detail", detail));
        return card;
      };

      grid.append(
        createCard({
          key: "core-api-response-time",
          title: "Core API response time",
          value: coreObserved ? `${Math.round(Number(coreValue))} ms` : "Unavailable",
          state: coreObserved ? (stale ? "stale" : "observed") : "unavailable",
          detail: coreObserved ? `Measured ${formatRelative(core.last_checked)}.` : core?.state === "awaiting_measured_data" ? "Awaiting a measured Core API observation." : "No measured Core API value is available.",
        }),
        createCard({
          key: "studio-room-readiness",
          title: "Studio Room Readiness",
          value: studioDeferred ? "Deferred" : studioObserved ? String(studioValue) : "Unavailable",
          state: studioDeferred ? "deferred" : studioObserved ? (stale ? "stale" : "observed") : "unavailable",
          detail: studioDeferred ? truncate(studio.reason || "A genuine Studio room readiness transaction is not available yet.", 170) : studioObserved ? "Latest measured readiness value." : "No genuine Studio room readiness observation is available.",
        })
      );

      section.append(heading, source, grid);
      return section;
    }

    createComponentGroup(group) {
      const section = element("section", "ss-status-widget__group");
      const heading = element("div", "ss-status-widget__group-head");
      const operational = group.components.filter((component) => component.normalizedState === "operational").length;
      heading.append(element("h3", "", group.label), element("span", "", `${operational}/${group.components.length} operational`));
      const list = element("ul", "ss-status-widget__components");
      group.components.forEach((component) => {
        const item = element("li", "ss-status-widget__component");
        item.dataset.state = component.normalizedState;
        item.append(
          element("span", "ss-status-widget__component-dot"),
          element("span", "ss-status-widget__component-name", component.name || "Unnamed component"),
          element("span", "ss-status-widget__component-state", component.statusLabel)
        );
        list.appendChild(item);
      });
      section.append(heading, list);
      return section;
    }

    createEventGroup(title, items, kind) {
      const section = element("section", "ss-status-widget__group");
      const heading = element("div", "ss-status-widget__group-head");
      heading.append(element("h3", "", title), element("span", "", String(items.length)));
      section.appendChild(heading);

      if (!items.length) {
        section.appendChild(element("p", "ss-status-widget__empty", kind === "incident" ? "No active incidents reported." : "No active maintenance windows reported."));
        return section;
      }

      items.slice(0, 4).forEach((item) => {
        const update = latestUpdate(item);
        const event = element("article", "ss-status-widget__event");
        event.append(
          element("h4", "", item.name || (kind === "incident" ? "Untitled incident" : "Scheduled maintenance")),
          element("p", "", truncate(update?.body || "No additional detail is available.", 115))
        );
        const meta = element("div", "ss-status-widget__event-meta");
        meta.append(element("span", "", String(item.status || "unknown").replaceAll("_", " ")), element("span", "", formatRelative(item.updated_at || update?.created_at || item.created_at)));
        event.appendChild(meta);
        section.appendChild(event);
      });
      return section;
    }

    createActions() {
      const actions = element("div", "ss-status-widget__actions");
      const primary = element("a", "ss-status-widget__action ss-status-widget__action--primary", "Full StreamSuites status");
      primary.href = PRIMARY_STATUS_URL;
      const external = element("a", "ss-status-widget__action", "Atlassian page ↗");
      external.href = STATUS_PAGE_URL;
      external.target = "_blank";
      external.rel = "noopener noreferrer";
      actions.append(primary, external);
      return actions;
    }
  }

  const loadModule = (src, id) => new Promise((resolve) => {
    if (document.getElementById(id)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.defer = true;
    script.addEventListener("load", resolve, { once: true });
    script.addEventListener("error", resolve, { once: true });
    document.head.appendChild(script);
  });

  const init = () => {
    if (document.getElementById("ss-status-indicator")) return;
    const inlineHost = document.querySelector('[data-status-slot][data-status-slot-mode="inline"]');
    const host = inlineHost || document.createElement("div");
    if (!inlineHost) {
      host.setAttribute("data-status-widget-host", "");
      document.body.appendChild(host);
    }
    const widget = new FullStatusWidget(host);
    widget.root.dataset.layout = inlineHost ? "inline" : "floating";
    const store = window.StreamSuitesStatusData;
    if (store) {
      store.subscribe((snapshot) => widget.render(snapshot));
      store.start();
    } else {
      widget.renderUnavailable(null);
    }
    window.StreamSuitesFullStatusWidget = widget;
  };

  const boot = async () => {
    void loadModule("/js/public-page-visit.js", "ss-public-page-visit-module");
    if (!window.StreamSuitesStatusData) {
      await loadModule("/js/status-data.js", "ss-status-data-module");
    }
    init();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    void boot();
  }

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
})();
