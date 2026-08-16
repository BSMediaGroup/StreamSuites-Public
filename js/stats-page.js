(() => {
  const STATS_ENDPOINT = "/api/public/stats";
  const AUTH_ME_ENDPOINT = "/api/public/me";
  const SVG_NS = "http://www.w3.org/2000/svg";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const numberFormatter = new Intl.NumberFormat("en-US");
  let requestGeneration = 0;

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (typeof text === "string") node.textContent = text;
    return node;
  }

  function svgElement(tag, attributes = {}) {
    const node = document.createElementNS(SVG_NS, tag);
    Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, String(value)));
    return node;
  }

  function finiteCount(value) {
    const numeric = Number(value);
    return Number.isFinite(numeric) && numeric >= 0 ? Math.round(numeric) : null;
  }

  function normalizeSeries(value) {
    if (!Array.isArray(value)) return [];
    return value.slice(0, 24).map((item) => {
      const timestamp = Date.parse(String(item?.period_start || ""));
      const count = finiteCount(item?.count);
      return Number.isFinite(timestamp) && count !== null
        ? { periodStart: new Date(timestamp).toISOString(), count }
        : null;
    }).filter(Boolean).sort((a, b) => a.periodStart.localeCompare(b.periodStart));
  }

  function normalizeStats(payload) {
    if (!payload || payload.schema_version !== "public-stats-v1") throw new Error("Unsupported statistics response.");
    const totals = {
      active_accounts: finiteCount(payload?.totals?.active_accounts),
      listed_public_profiles: finiteCount(payload?.totals?.listed_public_profiles),
      public_artifacts: finiteCount(payload?.totals?.public_artifacts)
    };
    if (Object.values(totals).some((value) => value === null)) throw new Error("Statistics totals are incomplete.");
    const artifactsByType = Object.fromEntries(
      Object.entries(payload?.artifacts_by_type || {})
        .map(([key, value]) => [String(key || "").trim().toLowerCase(), finiteCount(value)])
        .filter(([key, value]) => key && value !== null)
        .sort(([left], [right]) => left.localeCompare(right))
    );
    const accountRoles = payload.account_roles && typeof payload.account_roles === "object"
      ? Object.fromEntries(
        Object.entries(payload.account_roles)
          .map(([key, value]) => [String(key || "").trim().toLowerCase(), finiteCount(value)])
          .filter(([key, value]) => key && value !== null)
      )
      : null;
    return {
      generatedAt: String(payload.generated_at || ""),
      coverage: payload.coverage && typeof payload.coverage === "object" ? payload.coverage : {},
      totals,
      accountRoles,
      artifactsByType,
      series: {
        account_creations: normalizeSeries(payload?.series?.account_creations),
        artifact_creations: normalizeSeries(payload?.series?.artifact_creations)
      }
    };
  }

  function formatDate(value, options = {}) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "timestamp unavailable";
    return new Intl.DateTimeFormat(undefined, options).format(date);
  }

  function setState(kind, label, detail) {
    const container = document.querySelector("[data-stats-state]");
    if (container) container.dataset.statsState = kind;
    const constellation = document.querySelector("[data-stats-constellation]");
    if (constellation) constellation.dataset.state = kind;
    const labelNode = document.querySelector("[data-stats-state-label]");
    const detailNode = document.querySelector("[data-stats-generated]");
    if (labelNode) labelNode.textContent = label;
    if (detailNode) detailNode.textContent = detail;
  }

  function animateNumber(node, target) {
    if (!node) return;
    if (reducedMotion) {
      node.textContent = numberFormatter.format(target);
      return;
    }
    const startedAt = performance.now();
    const duration = 900;
    function frame(now) {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      node.textContent = numberFormatter.format(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function showPointTooltip(host, point, x, y) {
    host.querySelector(".stats-graph__tooltip")?.remove();
    const tooltip = element(
      "div",
      "stats-graph__tooltip",
      `${formatDate(point.periodStart, { month: "long", year: "numeric", timeZone: "UTC" })}: ${numberFormatter.format(point.count)}`
    );
    tooltip.style.left = `${(x / 720) * 100}%`;
    tooltip.style.top = `${(y / 240) * 100}%`;
    host.appendChild(tooltip);
  }

  function hidePointTooltip(host) {
    host.querySelector(".stats-graph__tooltip")?.remove();
  }

  function activateGraph(host) {
    if (host.dataset.plotActivated === "true") return;
    host.dataset.plotActivated = "true";
    host.classList.add("is-plot-visible");
  }

  function queueGraphEntrance(host) {
    if (reducedMotion || typeof IntersectionObserver !== "function") {
      activateGraph(host);
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      activateGraph(host);
      observer.disconnect();
    }, { threshold: .3, rootMargin: "0px 0px -8%" });
    observer.observe(host);
  }

  function renderGraph(key, points) {
    const host = document.querySelector(`[data-graph-host="${key}"]`);
    const summary = document.querySelector(`[data-graph-summary="${key}"]`);
    if (!host) return;
    host.replaceChildren();
    host.className = "stats-graph is-plot-primed";
    delete host.dataset.plotActivated;
    if (!points.length || points.every((point) => point.count === 0)) {
      host.className = "stats-graph";
      host.appendChild(element("div", "stats-graph__empty", "No real creation events fall inside this retained UTC window yet."));
      if (summary) summary.textContent = `${points.length || 0} monthly buckets · no recorded creations`;
      return;
    }

    const width = 720;
    const height = 240;
    const inset = { top: 24, right: 24, bottom: 42, left: 34 };
    const plotWidth = width - inset.left - inset.right;
    const plotHeight = height - inset.top - inset.bottom;
    const maximum = Math.max(...points.map((point) => point.count), 1);
    const coordinates = points.map((point, index) => ({
      ...point,
      x: inset.left + (points.length === 1 ? plotWidth / 2 : index / (points.length - 1) * plotWidth),
      y: inset.top + plotHeight - point.count / maximum * plotHeight
    }));
    const pathData = coordinates.map((point, index) => `${index ? "L" : "M"}${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(" ");
    const areaData = `${pathData} L${coordinates.at(-1).x.toFixed(2)} ${(inset.top + plotHeight).toFixed(2)} L${coordinates[0].x.toFixed(2)} ${(inset.top + plotHeight).toFixed(2)} Z`;
    const svg = svgElement("svg", { viewBox: `0 0 ${width} ${height}`, role: "img", "aria-label": `${key.replace(/_/g, " ")} across ${points.length} UTC calendar months` });
    const title = svgElement("title");
    title.textContent = `${key.replace(/_/g, " ")}: ${numberFormatter.format(points.reduce((sum, point) => sum + point.count, 0))} records across ${points.length} months.`;
    const defs = svgElement("defs");
    const lineGradient = svgElement("linearGradient", { id: `${key}-line-gradient`, x1: "0", x2: "1" });
    [["0%", "var(--stats-accent-a)"], ["52%", "var(--stats-accent-b)"], ["100%", "var(--stats-accent-c)"]].forEach(([offset, color]) => lineGradient.appendChild(svgElement("stop", { offset, "stop-color": color })));
    const areaGradient = svgElement("linearGradient", { id: `${key}-area-gradient`, x1: "0", y1: "0", x2: "0", y2: "1" });
    areaGradient.append(svgElement("stop", { offset: "0%", "stop-color": "var(--stats-accent-a)", "stop-opacity": ".38" }), svgElement("stop", { offset: "100%", "stop-color": "var(--stats-accent-a)", "stop-opacity": "0" }));
    defs.append(lineGradient, areaGradient);
    svg.append(title, defs);
    for (let index = 0; index <= 4; index += 1) {
      const y = inset.top + index / 4 * plotHeight;
      svg.appendChild(svgElement("line", { class: "stats-graph__grid", x1: inset.left, x2: width - inset.right, y1: y, y2: y }));
    }
    const area = svgElement("path", { class: "stats-graph__area", d: areaData, fill: `url(#${key}-area-gradient)` });
    const line = svgElement("path", { class: "stats-graph__line", d: pathData, pathLength: "1", stroke: `url(#${key}-line-gradient)` });
    svg.append(area, line);
    coordinates.forEach((point, index) => {
      const circle = svgElement("circle", { class: "stats-graph__point", cx: point.x, cy: point.y, r: "9", tabindex: "0", role: "button", "aria-label": `${formatDate(point.periodStart, { month: "long", year: "numeric", timeZone: "UTC" })}: ${numberFormatter.format(point.count)}` });
      circle.addEventListener("mouseenter", () => showPointTooltip(host, point, point.x, point.y));
      circle.addEventListener("focus", () => showPointTooltip(host, point, point.x, point.y));
      circle.addEventListener("mouseleave", () => hidePointTooltip(host));
      circle.addEventListener("blur", () => hidePointTooltip(host));
      svg.appendChild(circle);
      if (index === 0 || index === coordinates.length - 1 || index === Math.floor((coordinates.length - 1) / 2)) {
        const label = svgElement("text", { class: "stats-graph__label", x: point.x, y: height - 14, "text-anchor": index === 0 ? "start" : index === coordinates.length - 1 ? "end" : "middle" });
        label.textContent = formatDate(point.periodStart, { month: "short", year: "2-digit", timeZone: "UTC" });
        svg.appendChild(label);
      }
    });
    host.appendChild(svg);
    if (summary) summary.textContent = `${numberFormatter.format(points.reduce((sum, point) => sum + point.count, 0))} total · ${points.length} UTC months`;
    queueGraphEntrance(host);
  }

  function renderArtifactBars(entries) {
    const host = document.querySelector("[data-artifact-bars]");
    if (!host) return;
    host.replaceChildren();
    if (!entries.length) {
      host.appendChild(element("div", "stats-graph__empty", "No listed public artifacts are recorded."));
      return;
    }
    const maximum = Math.max(...entries.map(([, count]) => count), 1);
    entries.sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0])).forEach(([type, count]) => {
      const row = element("div", "stats-bar");
      const label = element("span", "stats-bar__label", type.replace(/_/g, " "));
      const track = element("span", "stats-bar__track");
      const fill = element("span", "stats-bar__fill");
      fill.style.setProperty("--bar-target", `${count / maximum * 100}%`);
      track.appendChild(fill);
      row.append(label, track, element("strong", "stats-bar__value", numberFormatter.format(count)));
      host.appendChild(row);
      if (reducedMotion) fill.style.width = fill.style.getPropertyValue("--bar-target");
      else requestAnimationFrame(() => { fill.style.width = fill.style.getPropertyValue("--bar-target"); });
    });
  }

  function render(model) {
    Object.entries(model.totals).forEach(([key, value]) => {
      animateNumber(document.querySelector(`[data-stat-total="${key}"]`), value);
      animateNumber(document.querySelector(`[data-stats-orbit-value="${key}"]`), value);
    });
    const scaffoldValues = {
      active_accounts: model.totals.active_accounts,
      creator_accounts: model.accountRoles ? (model.accountRoles.creator || 0) : null,
      public_accounts: model.accountRoles ? (model.accountRoles.public || 0) : null
    };
    Object.entries(scaffoldValues).forEach(([key, value]) => {
      const node = document.querySelector(`[data-scaffold-stat="${key}"]`);
      if (!node) return;
      if (value === null) node.textContent = "—";
      else animateNumber(node, value);
    });
    renderGraph("account_creations", model.series.account_creations);
    renderGraph("artifact_creations", model.series.artifact_creations);
    renderArtifactBars(Object.entries(model.artifactsByType));
    const generated = new Date(model.generatedAt);
    setState(
      "ready",
      "Authoritative snapshot loaded",
      Number.isNaN(generated.getTime())
        ? "Generated timestamp unavailable"
        : `Generated ${generated.toLocaleString()} · ${model.coverage.month_count || model.series.account_creations.length} UTC monthly buckets`
    );
  }

  function setError(error) {
    document.querySelectorAll("[data-stat-total], [data-scaffold-stat], [data-stats-orbit-value]").forEach((node) => { node.textContent = "—"; });
    document.querySelectorAll("[data-graph-host]").forEach((host) => {
      host.replaceChildren(element("div", "stats-graph__empty", "Authoritative history unavailable."));
      host.className = "stats-graph";
    });
    const errorPanel = document.querySelector("[data-stats-error]");
    const copy = document.querySelector("[data-stats-error-copy]");
    if (errorPanel) errorPanel.hidden = false;
    if (copy) copy.textContent = error instanceof Error ? error.message : "Runtime/Auth did not return a usable public snapshot.";
    setState("error", "Snapshot unavailable", "No totals have been substituted or treated as zero.");
  }

  async function loadStats() {
    const generation = ++requestGeneration;
    document.querySelector("[data-stats-error]")?.setAttribute("hidden", "");
    setState("loading", "Loading authoritative snapshot", "Requesting aggregate data from Runtime/Auth…");
    try {
      const response = await fetch(STATS_ENDPOINT, { cache: "no-store", credentials: "same-origin", headers: { Accept: "application/json" } });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.error || `Statistics request failed (${response.status}).`);
      const model = normalizeStats(payload);
      if (generation !== requestGeneration) return;
      render(model);
    } catch (error) {
      if (generation !== requestGeneration) return;
      setError(error);
    }
  }

  function syncAppearanceToggle() {
    const appearance = window.StreamSuitesPublicUiPreferences?.getState?.().appearance || "dark";
    const toggle = document.querySelector("[data-stats-theme-toggle]");
    if (!toggle) return;
    const nextAppearance = appearance === "light" ? "dark" : "light";
    const label = `Switch to ${nextAppearance} mode`;
    toggle.dataset.appearance = appearance;
    toggle.setAttribute("aria-label", label);
    toggle.setAttribute("title", label);
    toggle.setAttribute("aria-pressed", appearance === "light" ? "true" : "false");
  }

  function initNavigation() {
    const toggle = document.querySelector("[data-nav-toggle]");
    const nav = document.querySelector("[data-primary-nav]");
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
  }

  document.querySelector("[data-stats-theme-toggle]")?.addEventListener("click", () => {
    const appearance = window.StreamSuitesPublicUiPreferences?.getState?.().appearance || "dark";
    window.StreamSuitesPublicUiPreferences?.setAppearance?.(appearance === "light" ? "dark" : "light");
  });
  window.StreamSuitesPublicUiPreferences?.subscribe?.(syncAppearanceToggle);
  document.querySelectorAll("[data-stats-refresh], [data-stats-retry]").forEach((button) => button.addEventListener("click", loadStats));
  initNavigation();

  fetch(AUTH_ME_ENDPOINT, { cache: "no-store", credentials: "include", headers: { Accept: "application/json" } })
    .then((response) => response.ok ? response.json() : null)
    .then((payload) => { if (payload) window.StreamSuitesPublicUiPreferences?.hydrate?.(payload); })
    .catch(() => {});
  syncAppearanceToggle();
  loadStats();

  window.StreamSuitesStatsPage = Object.freeze({ normalizeStats, normalizeSeries });
})();
