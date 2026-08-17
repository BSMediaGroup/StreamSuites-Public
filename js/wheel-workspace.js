(() => {
  "use strict";

  const DEFAULT_CENTER_IMAGE = "/assets/placeholders/wheelcenterdefault.webp";
  const localApiBase = ["127.0.0.1", "localhost"].includes(String(window.location?.hostname || "").toLowerCase())
    ? "http://127.0.0.1:18087"
    : "https://api.streamsuites.app";
  const API_BASE = String(window.StreamSuitesPublicConfig?.AUTH_API_BASE || localApiBase).replace(/\/$/, "");
  const VIEW_MODES = new Set(["focus", "grid", "results"]);
  const STAGE_BACKGROUND_PRESETS = Object.freeze([
    Object.freeze({ id: "cinematic_chamber", name: "Cinematic Chamber" }),
    Object.freeze({ id: "aurora_vault", name: "Aurora Vault" }),
    Object.freeze({ id: "prism_grid", name: "Prism Grid" }),
    Object.freeze({ id: "eclipse_halo", name: "Eclipse Halo" })
  ]);
  const STAGE_BACKGROUND_PRESET_IDS = new Set(STAGE_BACKGROUND_PRESETS.map((preset) => preset.id));
  let wheelGraphicSequence = 0;
  const SOUND_LIBRARY = Object.freeze({
    music: ["music0.mp3", "music1.mp3", "music2.mp3", "music3.mp3", "music4.mp3", "music5.mp3", "music6.mp3"],
    startspin: ["startspin0.mp3", "startspin1.mp3", "startspin2.mp3"],
    respin: ["respin0.mp3", "respin1.mp3"],
    click: ["click0.mp3", "click1.mp3", "click2.mp3", "click3.mp3", "click4.mp3", "click5.mp3", "click6.mp3"],
    winner: ["winner0.mp3", "winner1.mp3", "winner2.mp3", "winner3.mp3", "winner4.mp3", "winner5.mp3", "winner6.mp3"]
  });

  function element(tag, className = "", text = "") {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== "") node.textContent = text;
    return node;
  }

  function svgElement(tag, attributes = {}) {
    const node = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.entries(attributes).forEach(([name, value]) => node.setAttribute(name, String(value)));
    return node;
  }

  function clamp(value, min, max, fallback = min) {
    const number = Number(value);
    return Number.isFinite(number) ? Math.max(min, Math.min(max, number)) : fallback;
  }

  function text(value, fallback = "") {
    return String(value ?? "").trim() || fallback;
  }

  function normalizedColor(value, fallback) {
    const candidate = text(value);
    return /^#[0-9a-f]{6}$/i.test(candidate) ? candidate.toLowerCase() : fallback;
  }

  function safeStageImageUrl(value) {
    const candidate = text(value);
    if (!candidate || /[?#]/.test(candidate) || /^(?:blob:|data:|javascript:)/i.test(candidate)) return "";
    if (/^\/api\/public\/wheel-media\/[A-Za-z0-9_-]+\/whl_[A-Za-z0-9_-]+\/[a-f0-9]{32}\.webp$/i.test(candidate)) return candidate;
    try {
      const parsed = new URL(candidate);
      const allowedProtocol = parsed.protocol === "https:"
        || (parsed.protocol === "http:" && ["127.0.0.1", "localhost"].includes(parsed.hostname));
      return allowedProtocol && /^\/api\/public\/wheel-media\/[A-Za-z0-9_-]+\/whl_[A-Za-z0-9_-]+\/[a-f0-9]{32}\.webp$/i.test(parsed.pathname)
        ? candidate
        : "";
    } catch (_error) {
      return "";
    }
  }

  function shadeHex(value, amount) {
    const hex = normalizedColor(value, "#64748b").slice(1);
    const channels = [0, 2, 4].map((offset) => parseInt(hex.slice(offset, offset + 2), 16));
    const shifted = channels.map((channel) => Math.max(0, Math.min(255, Math.round(channel + (amount * 255)))));
    return `#${shifted.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
  }

  function readLocalFlag(key, fallback = false) {
    try {
      const value = window.localStorage.getItem(key);
      return value === null ? fallback : value === "true";
    } catch (_error) {
      return fallback;
    }
  }

  function writeLocalFlag(key, value) {
    try { window.localStorage.setItem(key, value ? "true" : "false"); } catch (_error) { /* Presentation state remains optional. */ }
  }

  function entryName(entry) {
    return text(entry?.displayName || entry?.display_name || entry?.label || entry?.name, "Entrant");
  }

  function entryId(entry, index = 0) {
    return text(entry?.entryId || entry?.entry_id || entry?.id, `entry-${index + 1}`);
  }

  function entryUnits(entry) {
    return Math.max(1, Math.round(Number(entry?.entries ?? entry?.entryCount ?? entry?.entry_count) || 1));
  }

  function effectiveWeight(entry) {
    if (entry?.enabled === false) return 0;
    const supplied = Number(entry?.effectiveWeight ?? entry?.effective_weight);
    if (Number.isFinite(supplied) && supplied >= 0) return supplied;
    return entryUnits(entry) * Math.max(0.0001, Number(entry?.weight ?? entry?.unitWeight ?? entry?.unit_weight) || 1);
  }

  function normalizeEntry(entry, index) {
    const units = entryUnits(entry);
    const weight = Math.max(0.0001, Number(entry?.weight ?? entry?.unitWeight ?? entry?.unit_weight) || 1);
    return {
      ...entry,
      entryId: entryId(entry, index),
      displayName: entryName(entry),
      label: text(entry?.label || entry?.name, entryName(entry)),
      entries: units,
      entryCount: units,
      weight,
      effectiveWeight: effectiveWeight({ ...entry, entries: units, weight }),
      enabled: entry?.enabled !== false,
      color: text(entry?.color, ["#ff6b6b", "#ffd166", "#06d6a0", "#118ab2", "#9b5de5", "#f15bb5"][index % 6])
    };
  }

  function normalizeChildWheel(child, index, artifactCode) {
    const palette = child?.palette && typeof child.palette === "object" ? child.palette : {};
    const presentation = child?.presentation && typeof child.presentation === "object" ? child.presentation : {};
    const entries = (Array.isArray(child?.entries) ? child.entries : []).map(normalizeEntry);
    return {
      wheelId: text(child?.wheelId || child?.wheel_id, `legacy-${artifactCode}-${index + 1}`),
      name: text(child?.name || child?.title, `Wheel ${index + 1}`),
      winnerLimit: clamp(child?.winnerLimit ?? child?.winner_limit, 1, 128, 1),
      allowDuplicates: child?.allowDuplicates !== false && child?.allow_duplicates !== false,
      autoRemoveWinner: child?.autoRemoveWinner === true || child?.auto_remove_winner === true,
      entries,
      palette: {
        segment_colors: Array.isArray(palette.segment_colors) ? palette.segment_colors.slice(0, 32) : [],
        background_color: text(palette.background_color, "#08111f"),
        text_color: text(palette.text_color, "#f8fafc"),
        accent_color: text(palette.accent_color, "#38bdf8"),
        trim_color: text(palette.trim_color || palette.accent_color, "#7c92ff"),
        glow_color: text(palette.glow_color || palette.accent_color, "#4de9ff")
      },
      presentation: {
        animation_enabled: presentation.animation_enabled !== false,
        sound_enabled: presentation.sound_enabled !== false,
        celebration_enabled: presentation.celebration_enabled !== false,
        confetti_enabled: presentation.confetti_enabled === true || presentation.celebration_enabled === true,
        show_entry_labels: presentation.show_entry_labels !== false,
        show_display_names_on_slices: presentation.show_display_names_on_slices !== false,
        slice_label_mode: ["full_name", "initials", "avatar"].includes(text(presentation.slice_label_mode)) ? text(presentation.slice_label_mode) : "full_name",
        center_image_url: text(presentation.center_image_url || presentation.centerImageUrl, DEFAULT_CENTER_IMAGE),
        stage_background_preset: STAGE_BACKGROUND_PRESET_IDS.has(text(presentation.stage_background_preset || presentation.stageBackgroundPreset))
          ? text(presentation.stage_background_preset || presentation.stageBackgroundPreset)
          : "cinematic_chamber",
        stage_background_color: normalizedColor(presentation.stage_background_color || presentation.stageBackgroundColor, "#38bdf8"),
        stage_background_image_url: safeStageImageUrl(presentation.stage_background_image_url || presentation.stageBackgroundImageUrl),
        spin_owner_only: presentation.spin_owner_only === true || presentation.spinOwnerOnly === true,
        slow_drift_enabled: presentation.slow_drift_enabled !== false,
        spin_duration_ms: clamp(presentation.spin_duration_ms, 2000, 60000, 8500),
        scoreboard_max_rows: clamp(presentation.scoreboard_max_rows, 3, 100, 24),
        sound: presentation.sound && typeof presentation.sound === "object" ? structuredClone(presentation.sound) : {}
      }
    };
  }

  function normalizeArtifact(item) {
    const artifactCode = text(item?.artifactCode || item?.artifact_code || item?.id, "wheel");
    const sourceSet = item?.wheelSet && typeof item.wheelSet === "object"
      ? item.wheelSet
      : item?.wheel_set && typeof item.wheel_set === "object"
        ? item.wheel_set
        : null;
    const sourceWheels = Array.isArray(sourceSet?.wheels) && sourceSet.wheels.length
      ? sourceSet.wheels
      : [item?.activeWheel || item];
    const wheels = sourceWheels.map((wheel, index) => normalizeChildWheel(wheel, index, artifactCode));
    const requestedDefault = text(sourceSet?.activeWheelId || sourceSet?.active_wheel_id || item?.activeWheelId || item?.active_wheel_id);
    const active = wheels.find((wheel) => wheel.wheelId === requestedDefault) || wheels[0];
    const spinAll = sourceSet?.spinAll || sourceSet?.spin_all || {};
    return {
      ...item,
      artifactCode,
      title: text(item?.artifactTitle || item?.title, "Wheel workspace"),
      slug: text(item?.slug || item?.customSlug || item?.custom_slug || item?.defaultSlug || item?.default_slug, artifactCode),
      defaultSlug: text(item?.defaultSlug || item?.default_slug || item?.slug, artifactCode),
      customSlug: text(item?.customSlug || item?.custom_slug),
      shortlinkSlug: text(item?.shortlinkSlug || item?.shortlink_slug),
      slugAliases: Array.isArray(item?.slugAliases || item?.slug_aliases) ? [...(item.slugAliases || item.slug_aliases)] : [],
      wheelService: item?.wheelService && typeof item.wheelService === "object"
        ? structuredClone(item.wheelService)
        : item?.wheel_service && typeof item.wheel_service === "object"
          ? structuredClone(item.wheel_service)
          : null,
      wheelSet: {
        activeWheelId: active.wheelId,
        spinAll: {
          mode: text(spinAll.mode, "staggered"),
          delayMs: clamp(spinAll.delayMs ?? spinAll.delay_ms, 100, 1000, 250)
        },
        wheels
      }
    };
  }

  function serializeChild(wheel) {
    return {
      wheel_id: wheel.wheelId,
      name: wheel.name,
      winner_limit: wheel.winnerLimit,
      allow_duplicates: wheel.allowDuplicates,
      auto_remove_winner: wheel.autoRemoveWinner,
      entries: wheel.entries.map((entry) => ({
        entry_id: entry.entryId,
        label: entry.label || entry.displayName,
        display_name: entry.displayName,
        avatar_url: text(entry.avatarUrl || entry.avatar_url),
        entries: entry.entries,
        weight: entry.weight,
        enabled: entry.enabled !== false,
        color: entry.color,
        notes: text(entry.notes),
        ...(entry.assignment ? { assignment: entry.assignment } : {})
      })),
      palette: { ...wheel.palette },
      presentation: structuredClone(wheel.presentation)
    };
  }

  function createResultState() {
    return { latestResult: null, history: [], excludedEntrants: new Set(), spinState: "idle", rotation: 0, currentEntrantId: "", traversalTimer: 0 };
  }

  function serializeResultState(result) {
    return {
      latestResult: result.latestResult ? { ...result.latestResult } : null,
      history: result.history.map((entry) => ({ ...entry })),
      excludedEntrants: [...result.excludedEntrants],
      spinState: result.spinState,
      rotation: result.rotation,
      currentEntrantId: result.currentEntrantId
    };
  }

  function hydrateResultState(value) {
    return {
      latestResult: value?.latestResult ? { ...value.latestResult } : null,
      history: Array.isArray(value?.history) ? value.history.map((entry) => ({ ...entry })) : [],
      excludedEntrants: new Set(Array.isArray(value?.excludedEntrants) ? value.excludedEntrants : []),
      spinState: text(value?.spinState, "idle"),
      rotation: Number(value?.rotation) || 0,
      currentEntrantId: text(value?.currentEntrantId),
      traversalTimer: 0
    };
  }

  function weightedWinner(entries, random = Math.random) {
    const eligible = entries.filter((entry) => entry.enabled !== false && effectiveWeight(entry) > 0);
    const total = eligible.reduce((sum, entry) => sum + effectiveWeight(entry), 0);
    if (!eligible.length || total <= 0) return null;
    let cursor = Math.max(0, Math.min(0.999999999, Number(random()) || 0)) * total;
    for (const entry of eligible) {
      cursor -= effectiveWeight(entry);
      if (cursor <= 0) return entry;
    }
    return eligible[eligible.length - 1];
  }

  function polar(cx, cy, radius, angle) {
    const radians = ((angle - 90) * Math.PI) / 180;
    return { x: cx + radius * Math.cos(radians), y: cy + radius * Math.sin(radians) };
  }

  function radialLabelRotation(angle) {
    let rotation = (((Number(angle) || 0) + 90) % 360 + 360) % 360;
    if (rotation > 180) rotation -= 360;
    if (rotation > 90) rotation -= 180;
    if (rotation < -90) rotation += 180;
    return rotation;
  }

  function slicePath(start, end) {
    const from = polar(240, 240, 214, start);
    const to = polar(240, 240, 214, end);
    return `M 240 240 L ${from.x} ${from.y} A 214 214 0 ${end - start > 180 ? 1 : 0} 1 ${to.x} ${to.y} Z`;
  }

  function buildWheelGraphic(wheel, compact = false) {
    const entries = wheel.entries.filter((entry) => entry.enabled !== false && effectiveWeight(entry) > 0);
    const total = entries.reduce((sum, entry) => sum + effectiveWeight(entry), 0) || 1;
    const svg = svgElement("svg", { viewBox: "0 0 480 480", role: "img", "aria-label": `${wheel.name}, ${entries.length} eligible entrants` });
    svg.classList.add("wheel-svg");
    const graphicId = `wheel-${++wheelGraphicSequence}`;
    const defs = svgElement("defs");
    const gloss = svgElement("radialGradient", { id: `${graphicId}-gloss`, cx: "34%", cy: "22%", r: "78%" });
    gloss.append(
      svgElement("stop", { offset: "0%", "stop-color": "#ffffff", "stop-opacity": "0.34" }),
      svgElement("stop", { offset: "42%", "stop-color": "#ffffff", "stop-opacity": "0.04" }),
      svgElement("stop", { offset: "100%", "stop-color": "#02050b", "stop-opacity": "0.42" })
    );
    defs.appendChild(gloss);
    const centerClip = svgElement("clipPath", { id: `${graphicId}-center-clip` });
    centerClip.appendChild(svgElement("circle", { cx: 240, cy: 240, r: compact ? 37 : 45 }));
    defs.appendChild(centerClip);
    svg.append(defs, svgElement("circle", { cx: 240, cy: 240, r: 220, fill: "#050a12" }));
    let angle = 0;
    entries.forEach((entry, index) => {
      const sweep = (effectiveWeight(entry) / total) * 360;
      const group = svgElement("g", { "data-wheel-entry-id": entry.entryId });
      group.classList.add("wheel-slice-group");
      const sliceColor = normalizedColor(entry.color || wheel.palette.segment_colors[index % Math.max(1, wheel.palette.segment_colors.length)], "#64748b");
      const gradientId = `${graphicId}-slice-${index}`;
      const gradient = svgElement("radialGradient", { id: gradientId, cx: "38%", cy: "28%", r: "82%" });
      gradient.append(
        svgElement("stop", { offset: "0%", "stop-color": shadeHex(sliceColor, 0.16) }),
        svgElement("stop", { offset: "55%", "stop-color": sliceColor }),
        svgElement("stop", { offset: "100%", "stop-color": shadeHex(sliceColor, -0.24) })
      );
      defs.appendChild(gradient);
      const path = svgElement("path", {
        d: slicePath(angle, angle + sweep),
        fill: `url(#${gradientId})`,
        stroke: "rgba(3, 8, 15, 0.64)",
        "stroke-width": compact ? 2.4 : 3.2,
        "stroke-linejoin": "round"
      });
      path.classList.add("wheel-slice");
      group.appendChild(path);
      if (!compact && wheel.presentation.show_display_names_on_slices !== false && sweep >= 9) {
        const mid = angle + sweep / 2;
        const labelPoint = polar(240, 240, 145, mid);
        const label = svgElement("text", { x: labelPoint.x, y: labelPoint.y, fill: wheel.palette.text_color, "text-anchor": "middle", transform: `rotate(${radialLabelRotation(mid)} ${labelPoint.x} ${labelPoint.y})` });
        const name = wheel.presentation.slice_label_mode === "initials"
          ? entryName(entry).split(/\s+/).map((part) => part[0]).join("").slice(0, 3).toUpperCase()
          : entryName(entry).slice(0, compact ? 8 : 16);
        label.textContent = name;
        group.appendChild(label);
      }
      svg.appendChild(group);
      angle += sweep;
    });
    svg.append(
      svgElement("circle", { class: "wheel-disc-gloss", cx: 240, cy: 240, r: 214, fill: `url(#${graphicId}-gloss)` }),
      svgElement("circle", { class: "wheel-disc-vignette", cx: 240, cy: 240, r: 215, fill: "none", stroke: "rgba(2, 6, 12, 0.7)", "stroke-width": compact ? 14 : 18 }),
      svgElement("circle", { cx: 240, cy: 240, r: 218, fill: "none", stroke: wheel.palette.trim_color, "stroke-width": compact ? 7 : 10 }),
      svgElement("circle", { cx: 240, cy: 240, r: 211, fill: "none", stroke: "rgba(255,255,255,0.24)", "stroke-width": 2 }),
      svgElement("circle", { class: "wheel-hub-shadow", cx: 240, cy: 240, r: compact ? 48 : 58, fill: "#02050a", stroke: "rgba(0,0,0,0.72)", "stroke-width": 10 }),
      svgElement("circle", { class: "wheel-hub-bezel", cx: 240, cy: 240, r: compact ? 44 : 53, fill: wheel.palette.background_color, stroke: wheel.palette.accent_color, "stroke-width": compact ? 5 : 7 }),
      svgElement("circle", { cx: 240, cy: 240, r: compact ? 39 : 47, fill: "rgba(7,12,21,0.88)", stroke: "rgba(255,255,255,0.18)", "stroke-width": 2 })
    );
    if (wheel.presentation.center_image_url) {
      const image = svgElement("image", {
        href: wheel.presentation.center_image_url,
        x: compact ? 203 : 195,
        y: compact ? 203 : 195,
        width: compact ? 74 : 90,
        height: compact ? 74 : 90,
        preserveAspectRatio: "xMidYMid slice",
        "clip-path": `url(#${graphicId}-center-clip)`
      });
      svg.appendChild(image);
    }
    svg.appendChild(svgElement("circle", { class: "wheel-hub-highlight", cx: 226, cy: 224, r: compact ? 17 : 21, fill: "rgba(255,255,255,0.1)" }));
    return svg;
  }

  function createWorkspace(rawItem, options = {}) {
    let artifact = normalizeArtifact(rawItem);
    const stageMode = options.stageMode === true;
    const isOwner = options.isOwner === true;
    const serviceFeatures = artifact.wheelService?.features && typeof artifact.wheelService.features === "object"
      ? artifact.wheelService.features
      : {};
    const canEdit = isOwner && artifact.wheelService?.schema_version === "streamsuites.wheel-set.v2" && serviceFeatures.update === true && serviceFeatures.child_operations === true;
    const sessionId = text(options.sessionId || new URLSearchParams(window.location.search).get("session"));
    const sourceId = crypto.randomUUID?.() || `src-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const presentationStateKey = `streamsuites.wheel.presentation.${artifact.artifactCode}`;
    const root = element("article", `wheel-workspace${stageMode ? " wheel-workspace--stage" : ""}`);
    root.dataset.wheelWorkspace = stageMode ? "stage" : "detail";
    root.dataset.artifactCode = artifact.artifactCode;
    const state = {
      authoritativeWheelSet: artifact.wheelSet,
      authorityDefaultWheelId: artifact.wheelSet.activeWheelId,
      selectedWheelId: artifact.wheelSet.activeWheelId,
      viewMode: "focus",
      gridPage: 0,
      resultsByWheel: new Map(),
      currentSpinAll: null,
      revision: 0,
      appliedRevision: 0,
      popup: null,
      popupMonitor: 0,
      popupOpen: stageMode && Boolean(sessionId),
      channel: null,
      timers: new Set(),
      spinAllScheduledCount: 0,
      destroyed: false,
      modalCleanup: null,
      pendingCanonicalRender: false,
      lastFocus: null,
      renderCleanups: [],
      inspectorCollapsed: readLocalFlag(`${presentationStateKey}.inspector`, false),
      titleCollapsed: readLocalFlag(`${presentationStateKey}.title`, false)
    };
    artifact.wheelSet.wheels.forEach((wheel) => state.resultsByWheel.set(wheel.wheelId, createResultState()));

    const live = element("div", "wheel-workspace-live");
    live.setAttribute("aria-live", "polite");
    live.setAttribute("aria-atomic", "true");
    root.appendChild(live);

    function announce(message) {
      live.textContent = "";
      window.requestAnimationFrame(() => { live.textContent = message; });
    }

    function registerRenderCleanup(cleanup) {
      if (typeof cleanup === "function") state.renderCleanups.push(cleanup);
    }

    function clearRenderCleanups() {
      state.renderCleanups.splice(0).forEach((cleanup) => {
        try { cleanup(); } catch (_error) { /* Render cleanup is best-effort. */ }
      });
    }

    function selectedWheel() {
      return state.authoritativeWheelSet.wheels.find((wheel) => wheel.wheelId === state.selectedWheelId) || state.authoritativeWheelSet.wheels[0];
    }

    function resultFor(wheelId) {
      if (!state.resultsByWheel.has(wheelId)) state.resultsByWheel.set(wheelId, createResultState());
      return state.resultsByWheel.get(wheelId);
    }

    function stagePath() {
      return `/wheels/${encodeURIComponent(artifact.slug || artifact.artifactCode)}/stage`;
    }

    function stageUrl(includeSession = false) {
      const url = new URL(stagePath(), window.location.origin);
      if (includeSession && sessionId) url.searchParams.set("session", sessionId);
      return url.toString();
    }

    function publicUrl() {
      return new URL(`/wheels/${encodeURIComponent(artifact.slug || artifact.artifactCode)}`, window.location.origin).toString();
    }

    function snapshot() {
      return {
        artifactCode: artifact.artifactCode,
        selectedWheelId: state.selectedWheelId,
        viewMode: state.viewMode,
        gridPage: state.gridPage,
        results: Object.fromEntries([...state.resultsByWheel.entries()].map(([id, value]) => [id, serializeResultState(value)])),
        currentSpinAll: state.currentSpinAll ? { id: state.currentSpinAll.id, status: state.currentSpinAll.status, completed: state.currentSpinAll.completed, total: state.currentSpinAll.total } : null
      };
    }

    function applySnapshot(payload) {
      if (!payload || payload.artifactCode !== artifact.artifactCode) return;
      if (state.authoritativeWheelSet.wheels.some((wheel) => wheel.wheelId === payload.selectedWheelId)) state.selectedWheelId = payload.selectedWheelId;
      if (VIEW_MODES.has(payload.viewMode)) state.viewMode = payload.viewMode;
      state.gridPage = Math.max(0, Number(payload.gridPage) || 0);
      Object.entries(payload.results || {}).forEach(([id, value]) => {
        if (state.authoritativeWheelSet.wheels.some((wheel) => wheel.wheelId === id)) state.resultsByWheel.set(id, hydrateResultState(value));
      });
      render();
    }

    function publish(type = "state", extra = {}) {
      if (!state.channel) return;
      state.revision += 1;
      state.channel.postMessage({ schema: "streamsuites.wheel-local-session.v1", artifactCode: artifact.artifactCode, sessionId, sourceId, messageId: crypto.randomUUID?.() || `${sourceId}-${state.revision}`, revision: state.revision, type, state: snapshot(), ...extra });
    }

    function attachChannel() {
      if (!sessionId || typeof BroadcastChannel !== "function") return;
      state.channel = new BroadcastChannel(`streamsuites-wheel:${artifact.artifactCode}:${sessionId}`);
      state.channel.addEventListener("message", (event) => {
        const message = event.data;
        if (!message || message.schema !== "streamsuites.wheel-local-session.v1" || message.artifactCode !== artifact.artifactCode || message.sessionId !== sessionId || message.sourceId === sourceId) return;
        if (message.type === "dock") {
          if (!stageMode) restoreDockedStage(true);
          return;
        }
        if (message.type === "closing") {
          if (!stageMode) restoreDockedStage(false);
          return;
        }
        if (message.type === "ready" && !stageMode) {
          publish("state");
          return;
        }
        const revision = Number(message.revision) || 0;
        if (revision < state.appliedRevision) return;
        state.appliedRevision = revision;
        applySnapshot(message.state);
      });
      if (stageMode) publish("ready");
    }

    function schedule(callback, delay) {
      const timer = window.setTimeout(() => {
        state.timers.delete(timer);
        callback();
      }, delay);
      state.timers.add(timer);
      return timer;
    }

    function clearScheduledTimers() {
      state.timers.forEach((timer) => window.clearTimeout(timer));
      state.timers.clear();
      state.resultsByWheel.forEach((result) => {
        if (result.traversalTimer) window.clearTimeout(result.traversalTimer);
        result.traversalTimer = 0;
      });
    }

    function eligibleEntries(wheel) {
      const result = resultFor(wheel.wheelId);
      const previousWinners = new Set(result.history.map((entry) => entry.entryId));
      return wheel.entries.filter((entry) => {
        if (entry.enabled === false || effectiveWeight(entry) <= 0) return false;
        if (result.excludedEntrants.has(entry.entryId)) return false;
        if (!wheel.allowDuplicates && previousWinners.has(entry.entryId)) return false;
        return true;
      });
    }

    function canSpin(wheel) {
      const result = resultFor(wheel.wheelId);
      if (wheel.presentation.spin_owner_only && !isOwner) return false;
      if (state.popupOpen && !stageMode) return false;
      if (result.spinState === "spinning") return false;
      if (result.history.length >= wheel.winnerLimit) return false;
      return eligibleEntries(wheel).length > 0;
    }

    function entrantForState(wheel, result) {
      const entrantIdValue = result.currentEntrantId || result.latestResult?.entryId || "";
      return wheel.entries.find((entry) => entry.entryId === entrantIdValue) || null;
    }

    function updateCurrentEntrantSurfaces(wheel) {
      const result = resultFor(wheel.wheelId);
      const entrant = entrantForState(wheel, result);
      root.querySelectorAll(`[data-wheel-render-id="${CSS.escape(wheel.wheelId)}"]`).forEach((surface) => {
        const value = surface.querySelector(".wheel-current-entrant__value");
        if (value) value.textContent = result.spinState === "idle" && !entrant ? "Ready" : entrant ? entryName(entrant) : "Ready";
        const card = surface.querySelector(".wheel-entry-detail-card");
        if (card) renderEntrantDetailCard(card, wheel, entrant, result);
      });
      root.querySelectorAll(`.wheel-quick-inspector[data-wheel-id="${CSS.escape(wheel.wheelId)}"] .wheel-entry-detail-card`).forEach((card) => {
        renderEntrantDetailCard(card, wheel, entrant, result);
      });
    }

    function startEntrantTraversal(wheel, duration) {
      const result = resultFor(wheel.wheelId);
      const entries = eligibleEntries(wheel);
      if (!entries.length || duration <= 0) return;
      let index = Math.max(0, entries.findIndex((entry) => entry.entryId === result.currentEntrantId));
      const cadence = Math.max(110, Math.min(220, Math.round(duration / Math.max(18, entries.length * 4))));
      const tick = () => {
        if (result.spinState !== "spinning") return;
        result.currentEntrantId = entries[index % entries.length].entryId;
        index += 1;
        updateCurrentEntrantSurfaces(wheel);
        result.traversalTimer = window.setTimeout(tick, cadence);
      };
      tick();
    }

    function recordWinner(wheel, winner, runId, mode) {
      const result = resultFor(wheel.wheelId);
      const eligible = eligibleEntries(wheel);
      const eligibleTotal = eligible.reduce((sum, entry) => sum + effectiveWeight(entry), 0) || 1;
      const record = {
        wheelId: wheel.wheelId,
        wheelName: wheel.name,
        entryId: winner.entryId,
        winner: entryName(winner),
        entries: entryUnits(winner),
        weight: Number(winner.weight) || 1,
        effectiveWeight: effectiveWeight(winner),
        probability: effectiveWeight(winner) / eligibleTotal,
        spunAt: new Date().toISOString(),
        autoRemoved: wheel.autoRemoveWinner === true,
        mode,
        runId: runId || null
      };
      result.latestResult = record;
      result.history.push(record);
      if (wheel.autoRemoveWinner) result.excludedEntrants.add(winner.entryId);
      result.spinState = "winner";
      result.currentEntrantId = winner.entryId;
      if (result.traversalTimer) window.clearTimeout(result.traversalTimer);
      result.traversalTimer = 0;
      return record;
    }

    function performSpin(wheel, options = {}) {
      if (!canSpin(wheel)) return false;
      const result = resultFor(wheel.wheelId);
      const winner = weightedWinner(eligibleEntries(wheel));
      if (!winner) return false;
      result.spinState = "spinning";
      const entries = eligibleEntries(wheel);
      result.currentEntrantId = entries[0]?.entryId || "";
      const total = entries.reduce((sum, entry) => sum + effectiveWeight(entry), 0) || 1;
      let cursor = 0;
      let winnerMid = 0;
      entries.forEach((entry) => {
        const sweep = (effectiveWeight(entry) / total) * 360;
        if (entry.entryId === winner.entryId) winnerMid = cursor + sweep / 2;
        cursor += sweep;
      });
      const startRotation = result.rotation;
      const phase = ((startRotation % 360) + 360) % 360;
      const target = (360 - winnerMid + 360) % 360;
      result.rotation += ((target - phase + 360) % 360) + 5 * 360;
      render();
      announce(`${wheel.name} is spinning.`);
      const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches || wheel.presentation.animation_enabled === false;
      const duration = reduced ? 0 : clamp(wheel.presentation.spin_duration_ms, 2000, 12000, 8500);
      startEntrantTraversal(wheel, duration);
      if (!reduced) {
        const selector = `[data-wheel-render-id="${CSS.escape(wheel.wheelId)}"] .wheel-spin-disc, [data-wheel-render-id="${CSS.escape(wheel.wheelId)}"] .wheel-grid-disc`;
        root.querySelectorAll(selector).forEach((disc) => {
          disc.style.transition = "none";
          disc.style.transform = `rotate(${startRotation}deg)`;
          void disc.getBoundingClientRect();
          disc.style.transition = "";
          window.requestAnimationFrame(() => { disc.style.transform = `rotate(${result.rotation}deg)`; });
        });
      }
      schedule(() => {
        if (options.runId && state.currentSpinAll?.id !== options.runId) return;
        const record = recordWinner(wheel, winner, options.runId, options.mode || "spin");
        render();
        announce(`${wheel.name} winner: ${record.winner}.`);
        if (options.celebrate !== false) showWinner(record, wheel);
        publish("state");
        options.onResolved?.(record);
      }, duration);
      publish("state");
      return true;
    }

    function cancelSpinAll(reason = "cancelled") {
      if (state.currentSpinAll) {
        state.currentSpinAll.status = reason;
        state.currentSpinAll = null;
      }
      clearScheduledTimers();
      state.resultsByWheel.forEach((result) => {
        if (result.spinState === "spinning") result.spinState = result.latestResult ? "winner" : "idle";
        if (result.spinState === "idle") result.currentEntrantId = "";
      });
    }

    function spinAll() {
      if (state.currentSpinAll || (state.popupOpen && !stageMode)) return;
      const wheels = state.authoritativeWheelSet.wheels.filter(canSpin);
      if (!wheels.length) return;
      const runId = crypto.randomUUID?.() || `run-${Date.now()}`;
      const delay = state.authoritativeWheelSet.spinAll.delayMs;
      state.currentSpinAll = { id: runId, status: "running", completed: 0, total: wheels.length, results: [] };
      state.spinAllScheduledCount = wheels.length;
      announce(`Spin All started for ${wheels.length} wheels.`);
      wheels.forEach((wheel, index) => {
        schedule(() => {
          if (state.currentSpinAll?.id !== runId) return;
          performSpin(wheel, {
            runId,
            mode: "spin-all",
            celebrate: index === wheels.length - 1,
            onResolved(record) {
              if (state.currentSpinAll?.id !== runId) return;
              state.currentSpinAll.completed += 1;
              state.currentSpinAll.results.push(record);
              if (state.currentSpinAll.completed === state.currentSpinAll.total) {
                state.currentSpinAll.status = "complete";
                state.currentSpinAll = null;
                state.viewMode = "results";
                announce(`Spin All complete. ${wheels.length} local results are ready.`);
                render();
                publish("state");
              } else {
                render();
              }
            }
          });
        }, index * delay);
      });
      render();
      publish("state");
    }

    function resetWheel(wheelId) {
      if (state.currentSpinAll) cancelSpinAll("reset");
      state.resultsByWheel.set(wheelId, createResultState());
      render();
      announce("Selected wheel local results reset.");
      publish("state");
    }

    function resetAll() {
      cancelSpinAll("reset");
      state.authoritativeWheelSet.wheels.forEach((wheel) => state.resultsByWheel.set(wheel.wheelId, createResultState()));
      render();
      announce("All local wheel results reset.");
      publish("state");
    }

    function selectWheel(wheelId, focusSelector = false) {
      if (!state.authoritativeWheelSet.wheels.some((wheel) => wheel.wheelId === wheelId)) return;
      state.selectedWheelId = wheelId;
      render();
      if (focusSelector) root.querySelector(".wheel-title-selector")?.focus();
      publish("state");
    }

    function setView(viewMode) {
      if (!VIEW_MODES.has(viewMode)) return;
      state.viewMode = viewMode;
      render();
      publish("state");
    }

    function showWinner(record, wheel) {
      const overlay = element("div", "wheel-winner-overlay is-visible");
      overlay.setAttribute("aria-hidden", "false");
      const dialog = element("section", "wheel-winner-dialog");
      dialog.setAttribute("role", "dialog");
      dialog.setAttribute("aria-modal", "true");
      dialog.setAttribute("aria-label", `${wheel.name} winner`);
      const close = element("button", "wheel-winner-close", "×");
      close.type = "button";
      close.setAttribute("aria-label", "Close winner announcement");
      dialog.append(close, element("span", "wheel-winner-kicker", record.mode === "spin-all" ? "Final Spin All result" : "The wheel has spoken"), element("h2", "wheel-winner-name", record.winner), element("p", "wheel-winner-subtitle", `${wheel.name} · ${(record.probability * 100).toFixed(record.probability < 0.1 ? 1 : 0)}% probability · local session result`));
      const actions = element("div", "wheel-winner-actions");
      const view = element("button", "wheel-winner-continue", "View results");
      view.type = "button";
      const again = element("button", "wheel-winner-again", record.mode === "spin-all" ? "Spin all again" : "Spin again");
      again.type = "button";
      actions.append(view, again);
      dialog.appendChild(actions);
      overlay.append(element("div", "wheel-winner-rays"), element("div", "wheel-winner-halo"), dialog);
      root.appendChild(overlay);
      const remove = () => overlay.remove();
      close.addEventListener("click", remove);
      overlay.addEventListener("click", (event) => { if (event.target === overlay) remove(); });
      view.addEventListener("click", () => { remove(); setView("results"); });
      again.addEventListener("click", () => { remove(); record.mode === "spin-all" ? spinAll() : performSpin(wheel, { mode: "respin" }); });
      close.focus();
    }

    function buildViewSelector() {
      const tabs = element("div", "wheel-workspace-view-tabs");
      tabs.setAttribute("role", "tablist");
      tabs.setAttribute("aria-label", "Wheel workspace view");
      [["focus", "Focus"], ["grid", "Grid"], ["results", "Results"]].forEach(([key, label]) => {
        const button = element("button", `wheel-workspace-view-tab${state.viewMode === key ? " is-active" : ""}`, label);
        button.type = "button";
        button.setAttribute("role", "tab");
        button.setAttribute("aria-selected", state.viewMode === key ? "true" : "false");
        button.addEventListener("click", () => setView(key));
        tabs.appendChild(button);
      });
      return tabs;
    }

    function productionIcon(asset) {
      const icon = element("span", "wheel-production-icon");
      icon.setAttribute("aria-hidden", "true");
      icon.style.setProperty("--wheel-production-icon", `url('/assets/icons/ui/${asset}.svg')`);
      return icon;
    }

    function buildProductionToolbar() {
      const wheel = selectedWheel();
      const result = resultFor(wheel.wheelId);
      const toolbar = element("section", "wheel-production-toolbar");
      toolbar.setAttribute("aria-label", "Wheel production controls");
      const selection = element("div", "wheel-production-identity");
      const titleRow = element("span", "wheel-production-title");
      titleRow.appendChild(element("strong", "", wheel.name));
      if (state.authorityDefaultWheelId === wheel.wheelId) {
        const marker = element("span", "wheel-production-default", "Default");
        marker.title = "Saved default wheel";
        titleRow.appendChild(marker);
      }
      selection.append(titleRow, element("small", "", `${artifact.title} · ${wheel.entries.length} entrants`));
      const play = element("div", "wheel-production-play");
      const spin = element("button", "wheel-production-primary", "Spin");
      spin.type = "button";
      spin.disabled = !canSpin(wheel);
      spin.addEventListener("click", () => performSpin(wheel));
      play.appendChild(spin);
      const spinAllButton = element("button", "wheel-production-primary wheel-production-primary--all", state.currentSpinAll ? `Spin All ${state.currentSpinAll.completed}/${state.currentSpinAll.total}` : "Spin All");
      spinAllButton.type = "button";
      spinAllButton.disabled = Boolean(state.currentSpinAll) || (state.popupOpen && !stageMode) || !state.authoritativeWheelSet.wheels.some(canSpin);
      spinAllButton.addEventListener("click", spinAll);
      if (state.authoritativeWheelSet.wheels.length > 1) play.appendChild(spinAllButton);
      const respin = element("button", "wheel-production-secondary wheel-production-respin", "Re-spin");
      respin.type = "button";
      respin.disabled = !result.latestResult || !canSpin(wheel);
      respin.addEventListener("click", () => performSpin(wheel, { mode: "respin" }));
      if (result.latestResult) play.appendChild(respin);
      const utilities = element("div", "wheel-production-utilities");
      utilities.appendChild(buildViewSelector());
      if (!stageMode) {
        const popout = element("button", "wheel-production-secondary wheel-production-presentation", state.popupOpen ? "Focus stage" : "Pop out");
        popout.type = "button";
        popout.title = state.popupOpen ? "Focus stage window" : "Pop out Stage";
        popout.prepend(productionIcon("popout"));
        popout.addEventListener("click", state.popupOpen ? () => state.popup?.focus?.() : openPopout);
        utilities.appendChild(popout);
        if (state.popupOpen) {
          const dock = element("button", "wheel-production-secondary wheel-production-presentation", "Dock");
          dock.type = "button";
          dock.title = "Dock Stage";
          dock.prepend(productionIcon("restoredock"));
          dock.addEventListener("click", () => { publish("dock"); state.popup?.close?.(); restoreDockedStage(true); });
          utilities.appendChild(dock);
        }
      } else if (sessionId) {
        const dock = element("button", "wheel-production-secondary wheel-production-presentation", "Dock");
        dock.type = "button";
        dock.title = "Dock Stage";
        dock.prepend(productionIcon("restoredock"));
        dock.addEventListener("click", requestDock);
        utilities.appendChild(dock);
      } else {
        const full = element("a", "wheel-production-secondary wheel-production-presentation", "Full page");
        full.href = publicUrl();
        full.target = "_blank";
        full.rel = "noopener noreferrer";
        full.title = "Open full Wheel page";
        full.prepend(productionIcon("fullwindow"));
        utilities.appendChild(full);
      }
      if (!stageMode) {
        const more = element("div", "wheel-production-more");
        const trigger = element("button", "wheel-production-more-trigger");
        trigger.type = "button";
        trigger.setAttribute("aria-label", "More wheel actions");
        trigger.setAttribute("aria-haspopup", "menu");
        trigger.setAttribute("aria-expanded", "false");
        trigger.title = "More wheel actions";
        trigger.appendChild(productionIcon("moremenu"));
        const menu = element("div", "wheel-production-menu");
        menu.setAttribute("role", "menu");
        menu.setAttribute("aria-label", "More wheel actions");
        menu.hidden = true;
        let open = false;
        const items = () => [...menu.querySelectorAll('[role="menuitem"]:not(:disabled)')];
        const closeMenu = (restoreFocus = false) => {
          open = false;
          menu.hidden = true;
          trigger.setAttribute("aria-expanded", "false");
          if (restoreFocus) trigger.focus();
        };
        const openMenu = (focusFirst = false) => {
          open = true;
          menu.hidden = false;
          trigger.setAttribute("aria-expanded", "true");
          if (focusFirst) items()[0]?.focus();
        };
        const addHeading = (label) => menu.appendChild(element("span", "wheel-production-menu-heading", label));
        const addAction = (label, handler, actionOptions = {}) => {
          const button = element("button", `wheel-production-menu-item${actionOptions.danger ? " is-danger" : ""}`, label);
          button.type = "button";
          button.setAttribute("role", "menuitem");
          button.disabled = actionOptions.disabled === true;
          button.addEventListener("click", () => {
            closeMenu(false);
            trigger.focus();
            handler();
          });
          menu.appendChild(button);
        };
        if (canEdit) {
          addHeading("Wheel management");
          addAction("Add wheel", async () => {
            try { await mutate({ type: "add", wheel: { name: `Wheel ${state.authoritativeWheelSet.wheels.length + 1}`, entries: ["Entry 1", "Entry 2"] } }); announce("Wheel added."); }
            catch (error) { announce(error instanceof Error ? error.message : "Add failed."); }
          });
          addAction("Manage wheels", manageWheelsModal);
          if (serviceFeatures.export === true) {
            addAction("Export wheel set (.sswheel)", async () => {
              try { await exportWheelSet(); announce("Canonical wheel-set export downloaded."); }
              catch (error) { announce(error instanceof Error ? error.message : "Export failed."); }
            });
          }
          if (state.selectedWheelId !== state.authorityDefaultWheelId) {
            addAction("Set as default", async () => {
              try { await mutate({ type: "set_active", wheel_id: state.selectedWheelId }); announce(`${selectedWheel().name} is now the saved default.`); }
              catch (error) { announce(error instanceof Error ? error.message : "Default update failed."); }
            });
          }
        } else if (isOwner) {
          addHeading("Compatibility");
          addAction("Wheel editing requires the current Runtime wheel service", () => {}, { disabled: true });
        }
        addHeading("Local session");
        addAction("Reset wheel", () => resetWheel(wheel.wheelId), { disabled: !result.history.length && result.spinState !== "spinning" });
        addAction("Reset all", resetAll, { disabled: ![...state.resultsByWheel.values()].some((entry) => entry.history.length || entry.spinState === "spinning") });
        trigger.addEventListener("click", () => { if (open) closeMenu(true); else openMenu(false); });
        trigger.addEventListener("keydown", (event) => {
          if (event.key === "ArrowDown") { event.preventDefault(); openMenu(true); }
        });
        menu.addEventListener("keydown", (event) => {
          const available = items();
          const index = available.indexOf(document.activeElement);
          if (event.key === "Escape") { event.preventDefault(); closeMenu(true); }
          else if (event.key === "Tab") closeMenu(false);
          else if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
            event.preventDefault();
            const target = event.key === "Home" ? 0 : event.key === "End" ? available.length - 1 : event.key === "ArrowDown" ? (index + 1) % available.length : (index - 1 + available.length) % available.length;
            available[target]?.focus();
          }
        });
        const abort = new AbortController();
        document.addEventListener("pointerdown", (event) => { if (open && !more.contains(event.target)) closeMenu(false); }, { signal: abort.signal });
        document.addEventListener("keydown", (event) => {
          if (open && event.key === "Escape") { event.preventDefault(); closeMenu(true); }
        }, { signal: abort.signal });
        registerRenderCleanup(() => abort.abort());
        more.append(trigger, menu);
        utilities.appendChild(more);
      }
      toolbar.append(selection, play, utilities);
      return toolbar;
    }

    function applyStageAppearance(node, wheel) {
      node.dataset.stagePreset = wheel.presentation.stage_background_preset;
      node.classList.toggle("has-custom-stage-image", Boolean(wheel.presentation.stage_background_image_url));
      node.style.setProperty("--wheel-trim-color", wheel.palette.trim_color);
      node.style.setProperty("--wheel-glow-color", wheel.palette.glow_color);
      node.style.setProperty("--wheel-stage-color", wheel.presentation.stage_background_color);
    }

    function buildStageAtmosphere(wheel) {
      const atmosphere = element("div", "wheel-arena-atmosphere");
      atmosphere.setAttribute("aria-hidden", "true");
      const customImage = element("div", "wheel-stage-custom-image");
      if (wheel.presentation.stage_background_image_url) {
        customImage.style.backgroundImage = `url("${wheel.presentation.stage_background_image_url.replace(/["\\]/g, "")}")`;
      }
      atmosphere.append(
        customImage,
        element("div", "wheel-arena-backplate"),
        element("div", "wheel-arena-beam wheel-arena-beam--left"),
        element("div", "wheel-arena-beam wheel-arena-beam--right"),
        element("div", "wheel-arena-portal"),
        element("div", "wheel-arena-floor"),
        element("div", "wheel-arena-reflection")
      );
      return atmosphere;
    }

    function buildWheelAssembly(wheel, result, compact = false) {
      const assembly = element("div", compact ? "wheel-grid-assembly" : "wheel-stage-assembly");
      const trim = element("div", compact ? "wheel-grid-trim" : "wheel-stage-trim");
      trim.dataset.state = result.spinState;
      const disc = element("div", compact ? "wheel-grid-disc" : "wheel-spin-disc wheel-spin-disc-premium");
      disc.style.transform = `rotate(${result.rotation}deg)`;
      disc.appendChild(buildWheelGraphic(wheel, compact));
      const pointer = element("div", compact ? "wheel-grid-pointer-hardware" : "wheel-hardware-pointer");
      pointer.append(element("span", "wheel-pointer-mount"), element("span", "wheel-pointer-tip"));
      assembly.append(
        element("div", compact ? "wheel-grid-shadow" : "wheel-stage-ground-shadow"),
        element("div", compact ? "wheel-grid-chassis" : "wheel-stage-aura"),
        ...(compact ? [] : [
          element("div", "wheel-stage-chassis"),
          element("div", "wheel-stage-outer-groove"),
          element("div", "wheel-stage-marker-ring"),
          element("div", "wheel-stage-light-ring"),
          element("div", "wheel-stage-reflective-edge")
        ]),
        trim,
        ...(compact ? [] : [element("div", "wheel-stage-inner-bezel")]),
        disc,
        pointer
      );
      return assembly;
    }

    function buildTitleOverlay(wheel) {
      const overlay = element("section", `wheel-title-overlay${state.titleCollapsed ? " is-collapsed" : ""}`);
      overlay.id = `wheel-stage-title-${sourceId}`;
      const multipleWheels = state.authoritativeWheelSet.wheels.length > 1;
      const copy = element(multipleWheels ? "button" : "div", `wheel-title-overlay__copy${multipleWheels ? " wheel-title-selector" : ""}`);
      if (multipleWheels) {
        copy.type = "button";
        copy.setAttribute("aria-haspopup", "listbox");
        copy.setAttribute("aria-expanded", "false");
        copy.setAttribute("aria-controls", `${overlay.id}-selector`);
        copy.setAttribute("aria-label", `Select wheel. Current wheel: ${wheel.name}`);
      }
      const heading = element("span", "wheel-arena-title", wheel.name);
      heading.setAttribute("role", "heading");
      heading.setAttribute("aria-level", "1");
      copy.append(
        element("span", "wheel-console-eyebrow", multipleWheels ? "Select wheel" : "Wheel arena"),
        heading,
        element("small", "", wheel.presentation.spin_owner_only ? "Owner controls spins" : "Public local session")
      );
      if (multipleWheels) copy.appendChild(element("span", "wheel-title-selector__chevron"));
      const toggle = element("button", "wheel-title-overlay__toggle", state.titleCollapsed ? "Expand title" : "Collapse title");
      toggle.type = "button";
      toggle.setAttribute("aria-expanded", state.titleCollapsed ? "false" : "true");
      toggle.setAttribute("aria-controls", overlay.id);
      toggle.addEventListener("click", () => {
        state.titleCollapsed = !state.titleCollapsed;
        writeLocalFlag(`${presentationStateKey}.title`, state.titleCollapsed);
        render();
      });
      overlay.append(copy, toggle);
      if (multipleWheels) {
        const listbox = element("div", "wheel-title-selector__menu");
        listbox.id = `${overlay.id}-selector`;
        listbox.setAttribute("role", "listbox");
        listbox.setAttribute("aria-label", "Select a wheel to view");
        listbox.hidden = true;
        const options = [];
        state.authoritativeWheelSet.wheels.forEach((candidate) => {
          const result = resultFor(candidate.wheelId);
          const option = element("button", `wheel-title-selector__option${candidate.wheelId === state.selectedWheelId ? " is-selected" : ""}`);
          option.type = "button";
          option.setAttribute("role", "option");
          option.setAttribute("aria-selected", candidate.wheelId === state.selectedWheelId ? "true" : "false");
          option.tabIndex = -1;
          const signature = element("span", "wheel-title-selector__signature");
          signature.style.background = `linear-gradient(135deg, ${candidate.palette.accent_color}, ${candidate.palette.glow_color})`;
          const optionCopy = element("span", "wheel-title-selector__option-copy");
          optionCopy.append(
            element("strong", "", candidate.name),
            element("small", "", `${candidate.entries.length} entrants${result.latestResult ? ` · ${result.latestResult.winner}` : ""}`)
          );
          const markers = element("span", "wheel-title-selector__markers");
          if (state.authorityDefaultWheelId === candidate.wheelId) markers.appendChild(element("span", "", "Default"));
          if (result.latestResult) {
            const resultMarker = element("i");
            resultMarker.setAttribute("aria-label", "Has a local result");
            resultMarker.title = "Has a local result";
            markers.appendChild(resultMarker);
          }
          option.append(signature, optionCopy, markers);
          option.addEventListener("click", () => {
            selectWheel(candidate.wheelId, true);
            announce(`${candidate.name} selected.`);
          });
          options.push(option);
          listbox.appendChild(option);
        });
        const closeSelector = (restoreFocus = false) => {
          listbox.hidden = true;
          copy.setAttribute("aria-expanded", "false");
          overlay.classList.remove("is-selector-open");
          if (restoreFocus) copy.focus();
        };
        const openSelector = (focusIndex = state.authoritativeWheelSet.wheels.findIndex((candidate) => candidate.wheelId === state.selectedWheelId)) => {
          listbox.hidden = false;
          copy.setAttribute("aria-expanded", "true");
          overlay.classList.add("is-selector-open");
          options[Math.max(0, Math.min(options.length - 1, focusIndex))]?.focus();
        };
        copy.addEventListener("click", () => listbox.hidden ? openSelector() : closeSelector(false));
        copy.addEventListener("keydown", (event) => {
          if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
          event.preventDefault();
          openSelector(event.key === "ArrowUp" || event.key === "End" ? options.length - 1 : 0);
        });
        options.forEach((option, index) => option.addEventListener("keydown", (event) => {
          let target = index;
          if (event.key === "ArrowDown" || event.key === "ArrowRight") target = (index + 1) % options.length;
          else if (event.key === "ArrowUp" || event.key === "ArrowLeft") target = (index - 1 + options.length) % options.length;
          else if (event.key === "Home") target = 0;
          else if (event.key === "End") target = options.length - 1;
          else if (event.key === "Escape" || event.key === "Tab") { closeSelector(event.key === "Escape"); return; }
          else return;
          event.preventDefault();
          options[target]?.focus();
        }));
        const outside = (event) => { if (!overlay.contains(event.target)) closeSelector(false); };
        document.addEventListener("pointerdown", outside);
        registerRenderCleanup(() => document.removeEventListener("pointerdown", outside));
        overlay.appendChild(listbox);
      }
      return overlay;
    }

    function buildCurrentEntrantIndicator(wheel, result) {
      const entrant = entrantForState(wheel, result);
      const indicator = element("div", "wheel-current-entrant");
      indicator.append(
        element("span", "wheel-current-entrant__eyebrow", "Current entrant"),
        element("strong", "wheel-current-entrant__value", result.spinState === "idle" && !entrant ? "Ready" : entrant ? entryName(entrant) : "Ready")
      );
      return indicator;
    }

    function buildFocus() {
      const wheel = selectedWheel();
      const result = resultFor(wheel.wheelId);
      const arena = element("section", "wheel-arena-card wheel-focus-arena");
      arena.dataset.wheelRenderId = wheel.wheelId;
      applyStageAppearance(arena, wheel);
      const stage = element("div", "wheel-spin-stage wheel-spin-stage-premium");
      stage.dataset.state = result.spinState;
      const summary = element("div", "wheel-focus-summary wheel-stage-status");
      summary.append(
        element("strong", "", result.spinState === "spinning" ? "Spinning…" : result.latestResult?.winner || "Ready to spin"),
        element("span", "", result.latestResult ? `${(result.latestResult.probability * 100).toFixed(1)}% at selection · local result` : `${wheel.entries.length} unique entrants · no backend winner history`)
      );
      stage.append(buildStageAtmosphere(wheel), buildCurrentEntrantIndicator(wheel, result), buildWheelAssembly(wheel, result), summary);
      arena.append(buildTitleOverlay(wheel), stage);
      return arena;
    }

    function gridCapacity() {
      if (window.innerWidth < 640) return 1;
      if (window.innerWidth < 1100) return 2;
      return 4;
    }

    function buildGrid() {
      const capacity = gridCapacity();
      const pages = Math.max(1, Math.ceil(state.authoritativeWheelSet.wheels.length / capacity));
      state.gridPage = Math.min(state.gridPage, pages - 1);
      const section = element("section", "wheel-grid-view");
      const grid = element("div", "wheel-grid-cards");
      state.authoritativeWheelSet.wheels.slice(state.gridPage * capacity, state.gridPage * capacity + capacity).forEach((wheel) => {
        const result = resultFor(wheel.wheelId);
        const card = element("article", `wheel-grid-card${wheel.wheelId === state.selectedWheelId ? " is-selected" : ""}`);
        card.dataset.wheelRenderId = wheel.wheelId;
        const graphic = element("div", "wheel-grid-graphic");
        applyStageAppearance(graphic, wheel);
        const signature = element("div", "wheel-grid-background-signature");
        if (wheel.presentation.stage_background_image_url) signature.style.backgroundImage = `url("${wheel.presentation.stage_background_image_url.replace(/["\\]/g, "")}")`;
        graphic.append(signature, buildWheelAssembly(wheel, result, true));
        const copy = element("div", "wheel-grid-copy");
        copy.append(element("h2", "", wheel.name), element("p", "", `${wheel.entries.length} entrants`), element("strong", "", result.spinState === "spinning" ? "Spinning…" : result.latestResult?.winner || "No local result"));
        const focus = element("button", "wheel-production-secondary", "Select and focus");
        focus.type = "button";
        focus.addEventListener("click", () => { state.selectedWheelId = wheel.wheelId; setView("focus"); });
        const spin = element("button", "wheel-production-secondary", "Spin");
        spin.type = "button";
        spin.disabled = !canSpin(wheel);
        spin.addEventListener("click", () => performSpin(wheel, { celebrate: false }));
        copy.append(focus, spin);
        card.append(graphic, copy);
        grid.appendChild(card);
      });
      const pagination = element("nav", "wheel-grid-pagination");
      pagination.setAttribute("aria-label", "Grid pages");
      const previous = element("button", "wheel-production-secondary", "Previous");
      previous.disabled = state.gridPage === 0;
      previous.addEventListener("click", () => { state.gridPage -= 1; render(); });
      const label = element("span", "", `Page ${state.gridPage + 1} of ${pages}`);
      const next = element("button", "wheel-production-secondary", "Next");
      next.disabled = state.gridPage >= pages - 1;
      next.addEventListener("click", () => { state.gridPage += 1; render(); });
      pagination.append(previous, label, next);
      section.append(grid, pagination);
      return section;
    }

    function buildResults() {
      const section = element("section", "wheel-results-view");
      section.append(element("h2", "", "Local session results"), element("p", "wheel-results-note", "These results exist only in this browser-local session. They are not backend draw history and do not synchronize to independently opened browser sources."));
      const list = element("div", "wheel-results-list");
      const wheelsWithResults = state.authoritativeWheelSet.wheels.filter((wheel) => resultFor(wheel.wheelId).history.length);
      if (!wheelsWithResults.length) list.appendChild(element("div", "wheel-results-empty", "No wheels have been spun in this local session yet."));
      wheelsWithResults.forEach((wheel) => {
        const result = resultFor(wheel.wheelId);
        const card = element("article", "wheel-result-card");
        card.append(element("span", "wheel-console-eyebrow", wheel.name), element("h3", "", result.latestResult.winner));
        const history = element("ol", "wheel-result-history");
        [...result.history].reverse().forEach((record) => {
          const row = element("li");
          row.append(element("strong", "", record.winner), element("span", "", `${record.entries} entries · weight ${record.weight} · ${(record.probability * 100).toFixed(1)}% · ${new Date(record.spunAt).toLocaleTimeString()}${record.autoRemoved ? " · auto-removed locally" : ""}`));
          history.appendChild(row);
        });
        const actions = element("div", "wheel-result-actions");
        const focus = element("button", "wheel-production-secondary", "Focus winning wheel");
        focus.addEventListener("click", () => { state.selectedWheelId = wheel.wheelId; setView("focus"); });
        const respin = element("button", "wheel-production-secondary", "Re-spin");
        respin.disabled = !canSpin(wheel);
        respin.addEventListener("click", () => performSpin(wheel, { mode: "respin" }));
        const reset = element("button", "wheel-production-secondary", "Reset this wheel");
        reset.addEventListener("click", () => resetWheel(wheel.wheelId));
        actions.append(focus, respin, reset);
        card.append(history, actions);
        list.appendChild(card);
      });
      section.appendChild(list);
      return section;
    }

    function closeModal() {
      state.modalCleanup?.();
      state.modalCleanup = null;
    }

    function openModal(title, description, buildBody, options = {}) {
      closeModal();
      state.lastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      const backdrop = element("div", "wheel-editor-backdrop");
      const dialog = element("section", "wheel-editor-modal");
      dialog.setAttribute("role", "dialog");
      dialog.setAttribute("aria-modal", "true");
      const titleId = `wheel-editor-${Math.random().toString(16).slice(2)}`;
      dialog.setAttribute("aria-labelledby", titleId);
      const header = element("header", "wheel-editor-header");
      const heading = element("div");
      const h2 = element("h2", "", title);
      h2.id = titleId;
      heading.append(h2, element("p", "", description));
      const close = element("button", "wheel-editor-close", "×");
      close.type = "button";
      close.setAttribute("aria-label", `Close ${title}`);
      header.append(heading, close);
      const body = element("div", "wheel-editor-body");
      const cleanup = buildBody(body, dialog) || (() => {});
      dialog.append(header, body);
      backdrop.appendChild(dialog);
      document.body.appendChild(backdrop);
      document.body.classList.add("modal-open");
      document.body.classList.add("wheel-editor-open");
      const dismiss = () => {
        cleanup();
        backdrop.remove();
        document.body.classList.remove("modal-open");
        document.body.classList.remove("wheel-editor-open");
        state.modalCleanup = null;
        state.lastFocus?.focus?.();
        if (state.pendingCanonicalRender) {
          state.pendingCanonicalRender = false;
          render();
        }
        document.dispatchEvent(new CustomEvent("streamsuites:wheel-editor-closed"));
      };
      const keydown = (event) => {
        if (event.key === "Escape") { event.preventDefault(); dismiss(); return; }
        if (event.key !== "Tab") return;
        const focusable = [...dialog.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])')];
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      };
      backdrop.addEventListener("keydown", keydown);
      backdrop.addEventListener("click", (event) => { if (event.target === backdrop && options.dismissible !== false) dismiss(); });
      close.addEventListener("click", dismiss);
      state.modalCleanup = dismiss;
      close.focus();
      return { backdrop, dialog, body, dismiss };
    }

    async function parseResponse(response) {
      try { return await response.json(); } catch (_error) { return {}; }
    }

    function responseErrorMessage(payload, status, fallback = "Wheel request failed") {
      if (payload?.error && typeof payload.error === "object") {
        return text(payload.error.message, `${fallback} (${status})`);
      }
      return text(payload?.error, `${fallback} (${status})`);
    }

    function rehydrateCanonical(payload) {
      const canonical = payload?.wheel || payload;
      if (!canonical || typeof canonical !== "object") return;
      const previousSelection = state.selectedWheelId;
      artifact = normalizeArtifact({
        ...canonical,
        wheelService: canonical.wheelService || canonical.wheel_service || payload?.wheel_service || artifact.wheelService
      });
      state.authoritativeWheelSet = artifact.wheelSet;
      state.authorityDefaultWheelId = artifact.wheelSet.activeWheelId;
      state.selectedWheelId = artifact.wheelSet.wheels.some((wheel) => wheel.wheelId === previousSelection) ? previousSelection : artifact.wheelSet.activeWheelId;
      const validIds = new Set(artifact.wheelSet.wheels.map((wheel) => wheel.wheelId));
      [...state.resultsByWheel.keys()].forEach((id) => { if (!validIds.has(id)) state.resultsByWheel.delete(id); });
      artifact.wheelSet.wheels.forEach((wheel) => resultFor(wheel.wheelId));
      if (state.modalCleanup) state.pendingCanonicalRender = true;
      else render();
      publish("state");
    }

    async function mutatePayload(body) {
      if (!canEdit) throw new Error("Wheel editing requires the current Runtime wheel service");
      const response = await fetch(`${API_BASE}/api/creator/wheels/${encodeURIComponent(artifact.artifactCode)}`, {
        method: "PATCH",
        cache: "no-store",
        credentials: "include",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const payload = await parseResponse(response);
      if (!response.ok || payload?.success === false) throw new Error(responseErrorMessage(payload, response.status, "Save failed"));
      rehydrateCanonical(payload);
      const warning = Array.isArray(payload?.warnings) ? payload.warnings.find((item) => item?.message) : null;
      if (warning?.message) announce(warning.message);
      return payload;
    }

    async function mutate(operation) {
      return mutatePayload({ operation });
    }

    async function mutateArtifact(updates) {
      return mutatePayload(updates && typeof updates === "object" ? updates : {});
    }

    async function exportWheelSet() {
      if (!canEdit || serviceFeatures.export !== true) throw new Error("Wheel export requires the current Runtime wheel service");
      const response = await fetch(`${API_BASE}/api/creator/wheels/${encodeURIComponent(artifact.artifactCode)}/export`, {
        method: "GET",
        cache: "no-store",
        credentials: "include",
        headers: { Accept: "application/json" }
      });
      const payload = await parseResponse(response);
      if (!response.ok || payload?.success === false) throw new Error(responseErrorMessage(payload, response.status, "Export failed"));
      const portable = payload?.export?.payload;
      if (!portable || typeof portable !== "object") throw new Error("Runtime returned no portable wheel document");
      const blob = new Blob([JSON.stringify(portable, null, 2)], { type: "application/json" });
      const href = URL.createObjectURL(blob);
      try {
        const anchor = element("a");
        anchor.href = href;
        anchor.download = text(payload?.export?.filename, `${artifact.slug || "wheel-set"}.sswheel`);
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
      } finally {
        URL.revokeObjectURL(href);
      }
      return payload;
    }

    function modalStatus(body) {
      let status = body.querySelector("[data-wheel-editor-status]");
      if (!status) {
        status = element("div", "wheel-editor-status");
        status.dataset.wheelEditorStatus = "true";
        status.setAttribute("role", "status");
        body.appendChild(status);
      }
      return status;
    }

    function manageWheelsModal() {
      openModal("Manage wheels", "Add, duplicate, rename, reorder, choose the saved default, or remove child wheels.", (body) => {
        const list = element("div", "wheel-manager-list");
        function rebuild() {
          list.replaceChildren();
          state.authoritativeWheelSet.wheels.forEach((wheel, index) => {
            const row = element("article", "wheel-manager-row");
            const input = element("input", "wheel-manager-name");
            input.value = wheel.name;
            input.setAttribute("aria-label", `Name for ${wheel.name}`);
            const meta = element("span", "wheel-manager-meta", `${wheel.entries.length} entrants${wheel.wheelId === state.authorityDefaultWheelId ? " · default" : ""}`);
            const actions = element("div", "wheel-manager-actions");
            const action = (label, handler, disabled = false) => {
              const button = element("button", "wheel-production-secondary", label);
              button.type = "button";
              button.disabled = disabled;
              button.addEventListener("click", async () => {
                const status = modalStatus(body);
                status.textContent = `${label}…`;
                try { await handler(input); status.textContent = `${label} complete.`; rebuild(); }
                catch (error) { status.textContent = error instanceof Error ? error.message : `${label} failed.`; }
              });
              actions.appendChild(button);
            };
            action("Rename", () => mutate({ type: "rename", wheel_id: wheel.wheelId, name: input.value }));
            action("Duplicate", () => mutate({ type: "duplicate", wheel_id: wheel.wheelId }));
            action("Move up", () => {
              const ids = state.authoritativeWheelSet.wheels.map((entry) => entry.wheelId);
              [ids[index - 1], ids[index]] = [ids[index], ids[index - 1]];
              return mutate({ type: "reorder", wheel_ids: ids });
            }, index === 0);
            action("Move down", () => {
              const ids = state.authoritativeWheelSet.wheels.map((entry) => entry.wheelId);
              [ids[index], ids[index + 1]] = [ids[index + 1], ids[index]];
              return mutate({ type: "reorder", wheel_ids: ids });
            }, index === state.authoritativeWheelSet.wheels.length - 1);
            action("Set as default", () => mutate({ type: "set_active", wheel_id: wheel.wheelId }), wheel.wheelId === state.authorityDefaultWheelId);
            action("Remove", () => {
              if (!window.confirm(`Remove “${wheel.name}”? This cannot remove the final wheel.`)) return Promise.resolve();
              return mutate({ type: "remove", wheel_id: wheel.wheelId });
            }, state.authoritativeWheelSet.wheels.length === 1);
            row.append(input, meta, actions);
            list.appendChild(row);
          });
        }
        rebuild();
        const add = element("button", "wheel-production-primary", "Add wheel");
        add.type = "button";
        add.addEventListener("click", async () => {
          const status = modalStatus(body);
          status.textContent = "Adding wheel…";
          try { await mutate({ type: "add", wheel: { name: `Wheel ${state.authoritativeWheelSet.wheels.length + 1}`, entries: ["Entry 1", "Entry 2"] } }); status.textContent = "Wheel added."; rebuild(); }
          catch (error) { status.textContent = error instanceof Error ? error.message : "Add failed."; }
        });
        body.append(add, list);
      });
    }

    function entrantManagerModal() {
      const wheel = selectedWheel();
      const draft = wheel.entries.map((entry) => ({ ...entry }));
      openModal("Manage entrants", `${wheel.name} uses Runtime/Auth unique-entrant normalization as final authority.`, (body) => {
        const tools = element("div", "wheel-editor-toolbar");
        const table = element("div", "wheel-entrant-editor");
        function rebuild() {
          table.replaceChildren();
          const total = draft.reduce((sum, entry) => sum + effectiveWeight(entry), 0) || 1;
          draft.forEach((entry, index) => {
            const row = element("div", "wheel-entrant-row");
            const name = element("input"); name.value = entry.displayName; name.setAttribute("aria-label", `Entrant ${index + 1} name`);
            const entries = element("input"); entries.type = "number"; entries.min = "1"; entries.value = entry.entries; entries.setAttribute("aria-label", `${entry.displayName} entries`);
            const weight = element("input"); weight.type = "number"; weight.min = "0.1"; weight.step = "0.1"; weight.value = entry.weight; weight.setAttribute("aria-label", `${entry.displayName} weight`);
            const probability = element("span", "wheel-entrant-probability", `${((effectiveWeight(entry) / total) * 100).toFixed(1)}%`);
            const color = element("input"); color.type = "color"; color.value = entry.color; color.setAttribute("aria-label", `${entry.displayName} colour`);
            const enabled = element("input"); enabled.type = "checkbox"; enabled.checked = entry.enabled !== false; enabled.setAttribute("aria-label", `${entry.displayName} enabled`);
            const remove = element("button", "wheel-production-secondary", "Remove");
            remove.addEventListener("click", () => { draft.splice(index, 1); rebuild(); });
            name.addEventListener("input", () => { entry.displayName = name.value; entry.label = name.value; });
            entries.addEventListener("input", () => { entry.entries = Math.max(1, Math.round(Number(entries.value) || 1)); rebuild(); });
            weight.addEventListener("input", () => { entry.weight = Math.max(0.1, Number(weight.value) || 1); rebuild(); });
            color.addEventListener("input", () => { entry.color = color.value; });
            enabled.addEventListener("change", () => { entry.enabled = enabled.checked; rebuild(); });
            row.append(name, entries, weight, probability, color, enabled, remove);
            table.appendChild(row);
          });
        }
        const tool = (label, handler) => {
          const button = element("button", "wheel-production-secondary", label);
          button.addEventListener("click", handler);
          tools.appendChild(button);
        };
        tool("Add entrant", () => { draft.push(normalizeEntry({ label: `Entrant ${draft.length + 1}` }, draft.length)); rebuild(); });
        tool("Bulk paste", () => {
          const value = window.prompt("Paste one entrant per line. Duplicate logical names are sent to Runtime/Auth for canonical normalization.", "");
          if (value == null) return;
          value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).forEach((label) => draft.push(normalizeEntry({ label }, draft.length)));
          rebuild();
        });
        tool("Sort", () => { draft.sort((a, b) => entryName(a).localeCompare(entryName(b))); rebuild(); });
        tool("Shuffle", () => { for (let i = draft.length - 1; i > 0; i -= 1) { const j = Math.floor(Math.random() * (i + 1)); [draft[i], draft[j]] = [draft[j], draft[i]]; } rebuild(); });
        tool("Merge duplicates", () => {
          const merged = new Map();
          draft.forEach((entry) => {
            const key = entryName(entry).toLocaleLowerCase();
            if (!merged.has(key)) merged.set(key, { ...entry });
            else merged.get(key).entries += entry.entries;
          });
          draft.splice(0, draft.length, ...merged.values()); rebuild();
        });
        tool("Clear", () => { if (window.confirm("Clear all staged entrants?")) { draft.splice(0); rebuild(); } });
        const save = element("button", "wheel-production-primary", "Save entrants");
        save.addEventListener("click", async () => {
          const status = modalStatus(body); status.textContent = "Saving…";
          try { await mutate({ type: "update", wheel_id: wheel.wheelId, wheel: { ...serializeChild(wheel), entries: draft.map((entry) => ({ entry_id: entry.entryId, label: entry.displayName, display_name: entry.displayName, entries: entry.entries, weight: entry.weight, enabled: entry.enabled, color: entry.color })) } }); status.textContent = "Saved and rehydrated from Runtime/Auth."; }
          catch (error) { status.textContent = error instanceof Error ? error.message : "Save failed."; }
        });
        body.append(tools, table, save);
        rebuild();
      });
    }

    function appearanceModal() {
      const wheel = selectedWheel();
      const draft = structuredClone(wheel);
      const existingStageImageUrl = wheel.presentation.stage_background_image_url;
      let centerObjectUrl = "";
      let stageObjectUrl = "";
      let selectedCenterFile = null;
      let selectedStageFile = null;
      let useCustomBackground = Boolean(existingStageImageUrl);
      openModal("Wheel appearance", `Edit the currently authoritative appearance fields for ${wheel.name}.`, (body) => {
        const layout = element("div", "wheel-appearance-editor");
        const preview = element("div", "wheel-appearance-preview");
        const controls = element("div", "wheel-appearance-controls");
        const backgroundStatus = element("p", "wheel-editor-status", "Four system environments are available. Custom images are normalized by Runtime/Auth.");
        const presetGrid = element("div", "wheel-stage-preset-grid");
        const customPreset = element("button", "wheel-stage-preset-card wheel-stage-preset-card--custom", "Custom image");
        customPreset.type = "button";

        function refreshPresetSelection() {
          presetGrid.querySelectorAll("button[data-preset]").forEach((button) => button.classList.toggle("is-selected", !useCustomBackground && button.dataset.preset === draft.presentation.stage_background_preset));
          customPreset.classList.toggle("is-selected", useCustomBackground);
        }

        function refreshPreview() {
          const arena = element("div", "wheel-appearance-stage-preview");
          arena.dataset.wheelRenderId = draft.wheelId;
          applyStageAppearance(arena, draft);
          const stage = element("div", "wheel-spin-stage wheel-spin-stage-premium");
          stage.dataset.state = "idle";
          const previewResult = { spinState: "idle", rotation: 0, latestResult: null, currentEntrantId: "" };
          stage.append(buildStageAtmosphere(draft), buildCurrentEntrantIndicator(draft, previewResult), buildWheelAssembly(draft, previewResult));
          arena.appendChild(stage);
          preview.replaceChildren(arena);
          refreshPresetSelection();
        }

        [["Accent", "accent_color"], ["Trim", "trim_color"], ["Glow", "glow_color"], ["Background", "background_color"], ["Labels", "text_color"]].forEach(([label, key]) => {
          const field = element("label", "wheel-editor-field");
          const input = element("input"); input.type = "color"; input.value = draft.palette[key];
          input.addEventListener("input", () => { draft.palette[key] = input.value; refreshPreview(); });
          field.append(element("span", "", label), input); controls.appendChild(field);
        });
        const labelMode = element("select");
        ["full_name", "initials", "avatar"].forEach((value) => { const option = element("option", "", value.replace("_", " ")); option.value = value; option.selected = draft.presentation.slice_label_mode === value; labelMode.appendChild(option); });
        labelMode.addEventListener("change", () => { draft.presentation.slice_label_mode = labelMode.value; refreshPreview(); });
        const labelField = element("label", "wheel-editor-field"); labelField.append(element("span", "", "Slice label mode"), labelMode); controls.appendChild(labelField);

        const backgroundHeading = element("div", "wheel-appearance-section-heading");
        backgroundHeading.append(element("strong", "", "Stage background"), element("span", "", "Child-wheel presentation"));
        STAGE_BACKGROUND_PRESETS.forEach((preset) => {
          const card = element("button", "wheel-stage-preset-card");
          card.type = "button";
          card.dataset.preset = preset.id;
          const swatch = element("span", "wheel-stage-preset-card__preview");
          swatch.dataset.stagePreset = preset.id;
          swatch.style.setProperty("--wheel-stage-color", draft.presentation.stage_background_color);
          card.append(swatch, element("strong", "", preset.name));
          card.addEventListener("click", () => {
            useCustomBackground = false;
            draft.presentation.stage_background_preset = preset.id;
            draft.presentation.stage_background_image_url = "";
            refreshPreview();
          });
          presetGrid.appendChild(card);
        });
        customPreset.prepend(element("span", "wheel-stage-preset-card__preview wheel-stage-preset-card__preview--custom"));
        customPreset.addEventListener("click", () => {
          useCustomBackground = true;
          draft.presentation.stage_background_image_url = stageObjectUrl || existingStageImageUrl;
          refreshPreview();
        });
        presetGrid.appendChild(customPreset);

        const stageColourField = element("label", "wheel-editor-field wheel-stage-colour-field");
        const stageColourPicker = element("input"); stageColourPicker.type = "color"; stageColourPicker.value = draft.presentation.stage_background_color;
        const stageColourText = element("input"); stageColourText.type = "text"; stageColourText.value = draft.presentation.stage_background_color; stageColourText.pattern = "#[0-9A-Fa-f]{6}"; stageColourText.maxLength = 7;
        const updateStageColour = (value) => {
          const normalized = normalizedColor(value, "");
          if (!normalized) return;
          draft.presentation.stage_background_color = normalized;
          stageColourPicker.value = normalized;
          stageColourText.value = normalized;
          refreshPreview();
        };
        stageColourPicker.addEventListener("input", () => updateStageColour(stageColourPicker.value));
        stageColourText.addEventListener("change", () => updateStageColour(stageColourText.value));
        const stageColourControls = element("span", "wheel-stage-colour-controls");
        stageColourControls.append(stageColourPicker, stageColourText);
        stageColourField.append(element("span", "", "Stage colour / tint"), stageColourControls);

        const stageDrop = element("label", "wheel-stage-image-drop");
        const stageFile = element("input"); stageFile.type = "file"; stageFile.accept = "image/png,image/jpeg,image/webp";
        stageDrop.append(element("strong", "", "Browse or drop a Stage image"), element("span", "", "PNG, JPEG, or WebP · max 5 MiB · landscape preserved"), stageFile);
        const selectStageFile = (candidate) => {
          if (!candidate) return;
          if (candidate.size > 5 * 1024 * 1024 || !["image/png", "image/jpeg", "image/webp"].includes(candidate.type)) {
            backgroundStatus.textContent = "Choose a decoded PNG, JPEG, or WebP no larger than 5 MiB.";
            return;
          }
          selectedStageFile = candidate;
          if (stageObjectUrl) URL.revokeObjectURL(stageObjectUrl);
          stageObjectUrl = URL.createObjectURL(candidate);
          useCustomBackground = true;
          draft.presentation.stage_background_image_url = stageObjectUrl;
          backgroundStatus.textContent = `${candidate.name} is staged locally. Save to upload through Runtime/Auth.`;
          refreshPreview();
        };
        stageFile.addEventListener("change", () => selectStageFile(stageFile.files?.[0]));
        stageDrop.addEventListener("dragover", (event) => { event.preventDefault(); stageDrop.classList.add("is-dragging"); });
        stageDrop.addEventListener("dragleave", () => stageDrop.classList.remove("is-dragging"));
        stageDrop.addEventListener("drop", (event) => { event.preventDefault(); stageDrop.classList.remove("is-dragging"); selectStageFile(event.dataTransfer?.files?.[0]); });
        const removeStageImage = element("button", "wheel-production-secondary", "Remove custom Stage image");
        removeStageImage.type = "button";
        removeStageImage.addEventListener("click", () => {
          selectedStageFile = null;
          if (stageObjectUrl) URL.revokeObjectURL(stageObjectUrl);
          stageObjectUrl = "";
          useCustomBackground = false;
          draft.presentation.stage_background_image_url = "";
          backgroundStatus.textContent = "Custom image removed from the draft. Save to apply the selected system preset.";
          refreshPreview();
        });

        const fileField = element("label", "wheel-editor-field");
        const file = element("input"); file.type = "file"; file.accept = "image/png,image/jpeg,image/webp";
        file.addEventListener("change", () => {
          selectedCenterFile = file.files?.[0] || null;
          if (centerObjectUrl) URL.revokeObjectURL(centerObjectUrl);
          centerObjectUrl = selectedCenterFile ? URL.createObjectURL(selectedCenterFile) : "";
          draft.presentation.center_image_url = centerObjectUrl || wheel.presentation.center_image_url;
          refreshPreview();
        });
        fileField.append(element("span", "", "Centre image · PNG, JPEG, or WebP · max 5 MiB"), file);
        const urlField = element("label", "wheel-editor-field");
        const url = element("input"); url.type = "url"; url.value = wheel.presentation.center_image_url; url.placeholder = "Existing safe image URL";
        url.addEventListener("input", () => { if (!selectedCenterFile) { draft.presentation.center_image_url = url.value || DEFAULT_CENTER_IMAGE; refreshPreview(); } });
        urlField.append(element("span", "", "Centre image URL"), url);
        controls.append(backgroundHeading, presetGrid, stageColourField, stageDrop, removeStageImage, backgroundStatus, fileField, urlField);
        const save = element("button", "wheel-production-primary", "Save appearance");
        save.addEventListener("click", async () => {
          const status = modalStatus(body); status.textContent = "Saving…";
          try {
            if (selectedCenterFile) {
              const form = new FormData(); form.append("file", selectedCenterFile);
              const response = await fetch(`${API_BASE}/api/creator/wheels/${encodeURIComponent(artifact.artifactCode)}/wheels/${encodeURIComponent(wheel.wheelId)}/center-image`, { method: "POST", credentials: "include", cache: "no-store", headers: { Accept: "application/json" }, body: form });
              const payload = await parseResponse(response);
              if (!response.ok || payload?.success === false) throw new Error(responseErrorMessage(payload, response.status, "Upload failed"));
              rehydrateCanonical(payload);
              const hydrated = state.authoritativeWheelSet.wheels.find((entry) => entry.wheelId === wheel.wheelId);
              draft.presentation.center_image_url = hydrated?.presentation.center_image_url || draft.presentation.center_image_url;
            } else {
              draft.presentation.center_image_url = url.value || DEFAULT_CENTER_IMAGE;
            }
            if (selectedStageFile) {
              const form = new FormData(); form.append("file", selectedStageFile);
              const response = await fetch(`${API_BASE}/api/creator/wheels/${encodeURIComponent(artifact.artifactCode)}/wheels/${encodeURIComponent(wheel.wheelId)}/stage-background-image`, { method: "POST", credentials: "include", cache: "no-store", headers: { Accept: "application/json" }, body: form });
              const payload = await parseResponse(response);
              if (!response.ok || payload?.success === false) throw new Error(responseErrorMessage(payload, response.status, "Stage upload failed"));
              rehydrateCanonical(payload);
              const hydrated = state.authoritativeWheelSet.wheels.find((entry) => entry.wheelId === wheel.wheelId);
              draft.presentation.stage_background_image_url = hydrated?.presentation.stage_background_image_url || draft.presentation.stage_background_image_url;
            } else if (!useCustomBackground) {
              draft.presentation.stage_background_image_url = "";
            }
            await mutate({ type: "update", wheel_id: wheel.wheelId, wheel: serializeChild(draft) });
            status.textContent = "Saved and rehydrated from Runtime/Auth.";
            if (centerObjectUrl) { URL.revokeObjectURL(centerObjectUrl); centerObjectUrl = ""; }
            if (stageObjectUrl) { URL.revokeObjectURL(stageObjectUrl); stageObjectUrl = ""; }
          } catch (error) { status.textContent = error instanceof Error ? error.message : "Save failed."; }
        });
        controls.appendChild(save);
        layout.append(preview, controls); body.appendChild(layout); refreshPreview();
        return () => {
          if (centerObjectUrl) URL.revokeObjectURL(centerObjectUrl);
          if (stageObjectUrl) URL.revokeObjectURL(stageObjectUrl);
        };
      });
    }

    function rulesModal() {
      const wheel = selectedWheel();
      const draft = structuredClone(wheel);
      openModal("Advanced rules", `Only current Runtime/Auth rules for ${wheel.name} are shown.`, (body) => {
        const form = element("div", "wheel-editor-form");
        const limitField = element("label", "wheel-editor-field"); const limit = element("input"); limit.type = "number"; limit.min = "1"; limit.max = "128"; limit.value = draft.winnerLimit; limitField.append(element("span", "", "Winner limit"), limit); form.appendChild(limitField);
        [["Allow duplicate winners", "allowDuplicates"], ["Auto-remove winner locally", "autoRemoveWinner"]].forEach(([label, key]) => { const field = element("label", "wheel-editor-check"); const input = element("input"); input.type = "checkbox"; input.checked = draft[key]; input.addEventListener("change", () => { draft[key] = input.checked; }); field.append(input, element("span", "", label)); form.appendChild(field); });
        const owner = element("label", "wheel-editor-check"); const ownerInput = element("input"); ownerInput.type = "checkbox"; ownerInput.checked = draft.presentation.spin_owner_only; ownerInput.addEventListener("change", () => { draft.presentation.spin_owner_only = ownerInput.checked; }); owner.append(ownerInput, element("span", "", "Owner-only spin")); form.appendChild(owner);
        const save = element("button", "wheel-production-primary", "Save rules"); save.addEventListener("click", async () => { const status = modalStatus(body); status.textContent = "Saving…"; draft.winnerLimit = clamp(limit.value, 1, 128, 1); try { await mutate({ type: "update", wheel_id: wheel.wheelId, wheel: serializeChild(draft) }); status.textContent = "Rules saved."; } catch (error) { status.textContent = error instanceof Error ? error.message : "Save failed."; } });
        body.append(form, save);
      });
    }

    function celebrationModal() {
      const wheel = selectedWheel();
      const draft = structuredClone(wheel);
      openModal("Celebration", `Preview and edit the celebration flags currently supported for ${wheel.name}.`, (body) => {
        const enabled = element("input"); enabled.type = "checkbox"; enabled.checked = draft.presentation.celebration_enabled;
        const field = element("label", "wheel-editor-check"); field.append(enabled, element("span", "", "Celebration and confetti enabled"));
        const preview = element("button", "wheel-production-secondary", "Preview celebration");
        let previewTimer = 0;
        preview.addEventListener("click", () => { if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) { announce("Celebration preview reduced because reduced motion is active."); return; } body.classList.add("is-celebrating"); window.clearTimeout(previewTimer); previewTimer = window.setTimeout(() => body.classList.remove("is-celebrating"), 1800); });
        const save = element("button", "wheel-production-primary", "Save celebration");
        save.addEventListener("click", async () => { const status = modalStatus(body); status.textContent = "Saving…"; draft.presentation.celebration_enabled = enabled.checked; draft.presentation.confetti_enabled = enabled.checked; try { await mutate({ type: "update", wheel_id: wheel.wheelId, wheel: serializeChild(draft) }); status.textContent = "Celebration saved."; } catch (error) { status.textContent = error instanceof Error ? error.message : "Save failed."; } });
        body.append(field, preview, save);
        return () => window.clearTimeout(previewTimer);
      });
    }

    function soundModal() {
      const wheel = selectedWheel();
      const draft = structuredClone(wheel);
      openModal("Sound settings", `Configure the existing wheel sound library for ${wheel.name}.`, (body) => {
        const enabled = element("input"); enabled.type = "checkbox"; enabled.checked = draft.presentation.sound_enabled;
        const enabledField = element("label", "wheel-editor-check"); enabledField.append(enabled, element("span", "", "Sound enabled")); body.appendChild(enabledField);
        let audio = null;
        Object.entries(SOUND_LIBRARY).forEach(([category, choices]) => {
          const row = element("div", "wheel-sound-row"); const select = element("select");
          choices.forEach((choice) => { const option = element("option", "", choice); option.value = choice; option.selected = text(draft.presentation.sound?.[category]?.asset_id, choices[0]) === choice; select.appendChild(option); });
          select.addEventListener("change", () => { draft.presentation.sound[category] = { enabled: true, asset_id: select.value }; });
          const preview = element("button", "wheel-production-secondary", "Preview"); preview.addEventListener("click", async () => { audio?.pause?.(); audio = new Audio(`/assets/sounds/wheels/${category}/${select.value}`); try { await audio.play(); } catch (_error) { announce("Sound preview could not start."); } });
          row.append(element("span", "", category), select, preview); body.appendChild(row);
        });
        const save = element("button", "wheel-production-primary", "Save sound settings"); save.addEventListener("click", async () => { const status = modalStatus(body); status.textContent = "Saving…"; draft.presentation.sound_enabled = enabled.checked; try { await mutate({ type: "update", wheel_id: wheel.wheelId, wheel: serializeChild(draft) }); status.textContent = "Sound settings saved."; } catch (error) { status.textContent = error instanceof Error ? error.message : "Save failed."; } }); body.appendChild(save);
        return () => { audio?.pause?.(); };
      });
    }

    function shareModal() {
      openModal("Share and presentation", "Normal sharing remains artifact-level. The Stage URL is a shell-free, browser-local presentation surface.", (body) => {
        function shareRow(label, value) {
          const row = element("div", "wheel-share-row"); const input = element("input"); input.readOnly = true; input.value = value; input.setAttribute("aria-label", label); const copy = element("button", "wheel-production-secondary", `Copy ${label}`); copy.addEventListener("click", async () => { try { await navigator.clipboard.writeText(value); copy.textContent = "Copied"; } catch (_error) { input.select(); document.execCommand("copy"); } }); row.append(element("span", "", label), input, copy); body.appendChild(row);
        }
        shareRow("Public URL", publicUrl());
        shareRow("Stage URL", stageUrl(false));
        if (artifact.shortlinkSlug) shareRow("Shortlink", `https://ssvx.cc/${artifact.shortlinkSlug}`);
        body.appendChild(element("p", "wheel-results-note", "Directly opened OBS, Studio, iframe, or browser-source Stage instances use independent local result sessions until a later authoritative synchronized-session milestone."));
        if (canEdit) {
          const titleField = element("label", "wheel-editor-field");
          const titleInput = element("input"); titleInput.type = "text"; titleInput.maxLength = 160; titleInput.value = artifact.title;
          titleField.append(element("span", "", "Wheel-set title"), titleInput);
          const descriptionField = element("label", "wheel-editor-field");
          const descriptionInput = element("textarea"); descriptionInput.maxLength = 2000; descriptionInput.value = text(artifact.description);
          descriptionField.append(element("span", "", "Description"), descriptionInput);
          const saveIdentity = element("button", "wheel-production-primary", "Save wheel-set details");
          saveIdentity.addEventListener("click", async () => {
            const status = modalStatus(body); status.textContent = "Saving…";
            try {
              await mutateArtifact({ title: titleInput.value, description: descriptionInput.value });
              status.textContent = "Wheel-set details saved.";
            } catch (error) {
              status.textContent = error instanceof Error ? error.message : "Save failed.";
            }
          });
          const delayField = element("label", "wheel-editor-field"); const delay = element("input"); delay.type = "number"; delay.min = "100"; delay.max = "1000"; delay.value = state.authoritativeWheelSet.spinAll.delayMs; delayField.append(element("span", "", "Spin All stagger delay (ms)"), delay);
          const save = element("button", "wheel-production-primary", "Save Spin All timing"); save.addEventListener("click", async () => { const status = modalStatus(body); status.textContent = "Saving…"; try { await mutate({ type: "update_spin_all", spin_all: { mode: "staggered", delay_ms: Number(delay.value) } }); status.textContent = "Spin All timing saved."; } catch (error) { status.textContent = error instanceof Error ? error.message : "Save failed."; } }); body.append(delayField, save);
          const exportButton = element("button", "wheel-production-secondary", "Export wheel set (.sswheel)");
          exportButton.addEventListener("click", async () => {
            const status = modalStatus(body); status.textContent = "Preparing canonical export…";
            try { await exportWheelSet(); status.textContent = "Export downloaded."; }
            catch (error) { status.textContent = error instanceof Error ? error.message : "Export failed."; }
          });
          body.prepend(titleField, descriptionField, saveIdentity);
          body.appendChild(exportButton);
        } else if (isOwner) {
          body.appendChild(element("div", "wheel-editor-status", "Wheel editing requires the current Runtime wheel service. Viewing and local play remain available."));
        }
      });
    }

    function renderEntrantDetailCard(card, wheel, entrant, result) {
      card.replaceChildren();
      card.style.setProperty("--wheel-entry-color", entrant?.color || wheel.palette.accent_color);
      if (!entrant) {
        card.classList.add("is-empty");
        card.append(
          element("span", "wheel-entry-detail-card__eyebrow", "Selected entrant"),
          element("strong", "wheel-entry-detail-card__empty-title", "No entrant selected"),
          element("p", "", "Spin the wheel to follow the current entrant. A winner remains selected after the result.")
        );
        return;
      }
      card.classList.remove("is-empty");
      const heading = element("div", "wheel-entry-detail-heading");
      const avatar = element("div", "wheel-entry-detail-avatar");
      const avatarUrl = text(entrant.avatarUrl || entrant.avatar_url || entrant.assignment?.avatarUrl || entrant.assignment?.avatar_url);
      if (avatarUrl) {
        const image = element("img"); image.src = avatarUrl; image.alt = ""; avatar.appendChild(image);
      } else {
        avatar.appendChild(element("span", "", entryName(entrant).slice(0, 1).toUpperCase()));
      }
      const identity = element("div", "wheel-entry-detail-identity");
      identity.append(
        element("span", "wheel-entry-detail-card__eyebrow", result.spinState === "spinning" ? "Current traversal" : result.latestResult?.entryId === entrant.entryId ? "Selected winner" : "Selected entrant"),
        element("strong", "", entryName(entrant))
      );
      const identityState = text(entrant.assignment?.publicSlug || entrant.assignment?.public_slug || entrant.assignment?.userCode || entrant.assignment?.user_code);
      identity.appendChild(element("small", "", identityState ? `Public identity · ${identityState}` : "Wheel entrant · no linked public identity"));
      heading.append(avatar, identity);
      const enabledEntries = eligibleEntries(wheel);
      const total = enabledEntries.reduce((sum, entry) => sum + effectiveWeight(entry), 0) || 1;
      const probability = entrant.enabled === false ? 0 : effectiveWeight(entrant) / total;
      const stats = element("div", "wheel-entry-detail-meta");
      [
        ["Entries", String(entryUnits(entrant))],
        ["Weight", String(Number(entrant.weight) || 1)],
        ["Effective probability", `${(probability * 100).toFixed(probability < 0.1 ? 1 : 0)}%`],
        ["Enabled", entrant.enabled === false ? "No" : "Yes"]
      ].forEach(([label, value]) => {
        const row = element("div", "wheel-entry-detail-row");
        row.append(element("span", "", label), element("strong", "", value));
        stats.appendChild(row);
      });
      const colour = element("div", "wheel-entry-detail-colour");
      const swatch = element("span"); swatch.style.background = entrant.color;
      colour.append(element("span", "", "Colour"), swatch, element("strong", "", entrant.color));
      card.append(heading, stats, colour);
    }

    function buildInspector() {
      const wheel = selectedWheel();
      const result = resultFor(wheel.wheelId);
      const aside = element("aside", `wheel-quick-inspector${state.inspectorCollapsed ? " is-collapsed" : ""}`);
      aside.dataset.wheelId = wheel.wheelId;
      aside.id = `wheel-inspector-${sourceId}`;
      aside.setAttribute("aria-label", "Quick inspector");
      const inspectorHeader = element("div", "wheel-inspector-header");
      inspectorHeader.appendChild(element("strong", "", "Inspector"));
      const collapse = element("button", "wheel-inspector-collapse", state.inspectorCollapsed ? "Open inspector" : "Collapse inspector");
      collapse.type = "button";
      collapse.setAttribute("aria-expanded", state.inspectorCollapsed ? "false" : "true");
      collapse.setAttribute("aria-controls", `${aside.id}-body`);
      collapse.addEventListener("click", () => {
        state.inspectorCollapsed = !state.inspectorCollapsed;
        writeLocalFlag(`${presentationStateKey}.inspector`, state.inspectorCollapsed);
        render();
      });
      inspectorHeader.appendChild(collapse);
      const inspectorBody = element("div", "wheel-inspector-body");
      inspectorBody.id = `${aside.id}-body`;
      inspectorBody.hidden = state.inspectorCollapsed;
      const tabs = element("div", "wheel-inspector-tabs");
      tabs.setAttribute("role", "tablist");
      tabs.setAttribute("aria-label", "Wheel inspector sections");
      const panels = element("div", "wheel-inspector-panels");
      const definitions = [
        ["entries", "Entries", () => {
          const panel = element("section", "wheel-inspector-panel");
          const enabled = wheel.entries.filter((entry) => entry.enabled !== false);
          const detailCard = element("div", "wheel-entry-detail-card");
          renderEntrantDetailCard(detailCard, wheel, entrantForState(wheel, result), result);
          panel.appendChild(detailCard);
          panel.append(element("strong", "", `${wheel.entries.length} unique · ${wheel.entries.reduce((sum, entry) => sum + entryUnits(entry), 0)} total tickets · ${enabled.length} enabled`));
          wheel.entries.slice(0, 5).forEach((entry) => panel.appendChild(element("p", "", `${entryName(entry)} · ${entryUnits(entry)} × ${entry.weight} · ${((effectiveWeight(entry) / (wheel.entries.reduce((sum, item) => sum + effectiveWeight(item), 0) || 1)) * 100).toFixed(1)}%`)));
          if (canEdit) { const button = element("button", "wheel-production-secondary", "Manage entrants"); button.addEventListener("click", entrantManagerModal); panel.appendChild(button); }
          return panel;
        }],
        ["rules", "Rules", () => {
          const panel = element("section", "wheel-inspector-panel"); panel.append(element("p", "", `Winner limit ${wheel.winnerLimit}`), element("p", "", wheel.allowDuplicates ? "Duplicate winners allowed" : "Duplicate winners blocked"), element("p", "", wheel.autoRemoveWinner ? "Winner auto-removes locally" : "Winner remains eligible"), element("p", "", wheel.presentation.spin_owner_only ? "Owner-only spin" : "Public local spin"));
          if (canEdit) { const button = element("button", "wheel-production-secondary", "Advanced rules"); button.addEventListener("click", rulesModal); panel.appendChild(button); }
          return panel;
        }],
        ["appearance", "Appearance", () => {
          const panel = element("section", "wheel-inspector-panel"); const palette = element("div", "wheel-palette-preview"); [wheel.palette.accent_color, wheel.palette.trim_color, wheel.palette.glow_color, ...wheel.palette.segment_colors.slice(0, 5)].forEach((color) => { const swatch = element("span"); swatch.style.background = color; palette.appendChild(swatch); }); panel.append(palette, element("p", "", `${wheel.presentation.slice_label_mode.replace("_", " ")} labels`)); const image = element("img", "wheel-inspector-center-image"); image.src = wheel.presentation.center_image_url; image.alt = "Current centre image"; panel.appendChild(image);
          if (canEdit) { const appearance = element("button", "wheel-production-secondary", "Edit appearance"); appearance.addEventListener("click", appearanceModal); const celebration = element("button", "wheel-production-secondary", "Celebration"); celebration.addEventListener("click", celebrationModal); panel.append(appearance, celebration); }
          return panel;
        }],
        ["sound", "Sound", () => {
          const panel = element("section", "wheel-inspector-panel"); panel.append(element("p", "", wheel.presentation.sound_enabled ? "Sound enabled" : "Sound disabled"), element("p", "", `Winner cue: ${text(wheel.presentation.sound?.winner?.asset_id, SOUND_LIBRARY.winner[0])}`)); if (canEdit) { const button = element("button", "wheel-production-secondary", "Sound settings"); button.addEventListener("click", soundModal); panel.appendChild(button); } return panel;
        }],
        ["share", "Share", () => {
          const panel = element("section", "wheel-inspector-panel"); panel.append(element("p", "", publicUrl()), element("p", "", stagePath()), element("p", "", `Saved default: ${state.authorityDefaultWheelId === wheel.wheelId ? wheel.name : state.authoritativeWheelSet.wheels.find((entry) => entry.wheelId === state.authorityDefaultWheelId)?.name || "Wheel"}`)); const button = element("button", "wheel-production-secondary", "Share settings"); button.addEventListener("click", shareModal); panel.appendChild(button); return panel;
        }]
      ];
      let active = "entries";
      function select(key) {
        active = key;
        tabs.querySelectorAll("button").forEach((button) => { const selected = button.dataset.key === key; button.classList.toggle("is-active", selected); button.setAttribute("aria-selected", selected ? "true" : "false"); });
        [...panels.children].forEach((panel) => { panel.hidden = panel.dataset.key !== key; });
      }
      definitions.forEach(([key, label, builder], index) => { const button = element("button", `wheel-inspector-tab${index === 0 ? " is-active" : ""}`, label); const tabId = `wheel-inspector-${sourceId}-${index}`; const panelId = `${tabId}-panel`; button.type = "button"; button.id = tabId; button.dataset.key = key; button.setAttribute("role", "tab"); button.setAttribute("aria-controls", panelId); button.setAttribute("aria-selected", index === 0 ? "true" : "false"); button.addEventListener("click", () => select(key)); tabs.appendChild(button); const panel = builder(); panel.id = panelId; panel.dataset.key = key; panel.setAttribute("role", "tabpanel"); panel.setAttribute("aria-labelledby", tabId); panel.hidden = index !== 0; panels.appendChild(panel); });
      inspectorBody.append(tabs, panels);
      if (result.latestResult) inspectorBody.appendChild(element("div", "wheel-inspector-result", `Latest: ${result.latestResult.winner}`));
      aside.append(inspectorHeader, inspectorBody);
      return aside;
    }

    function buildMobileInspectorLauncher() {
      const launcher = element("button", "wheel-mobile-inspector-launcher", "Open inspector");
      launcher.type = "button";
      launcher.setAttribute("aria-expanded", "false");
      launcher.setAttribute("aria-controls", `wheel-inspector-${sourceId}`);
      launcher.addEventListener("click", () => {
        state.inspectorCollapsed = false;
        writeLocalFlag(`${presentationStateKey}.inspector`, false);
        render();
      });
      return launcher;
    }

    function buildPoppedOutPlaceholder() {
      const placeholder = element("section", "wheel-popped-placeholder");
      placeholder.setAttribute("aria-label", "Stage popped out");
      placeholder.append(element("span", "wheel-console-eyebrow", "Presentation window"), element("h2", "", "Stage popped out"), element("p", "", "Gameplay is active in the Stage window. Parent play controls are disabled while this local session has a popup writer."));
      const focus = element("button", "wheel-production-primary", "Focus stage window"); focus.addEventListener("click", () => state.popup?.focus?.());
      const dock = element("button", "wheel-production-secondary", "Dock stage"); dock.addEventListener("click", () => { publish("dock"); state.popup?.close?.(); restoreDockedStage(true); });
      placeholder.append(focus, dock);
      return placeholder;
    }

    function render() {
      if (state.destroyed) return;
      const savedScroll = window.scrollY;
      root.classList.toggle("is-inspector-collapsed", state.inspectorCollapsed && !stageMode);
      root.classList.toggle("is-title-collapsed", state.titleCollapsed);
      clearRenderCleanups();
      [...root.children].forEach((child) => { if (child !== live && !child.classList.contains("wheel-editor-backdrop") && !child.classList.contains("wheel-winner-overlay")) child.remove(); });
      root.append(buildProductionToolbar());
      const content = element("div", "wheel-workspace-content");
      const primary = element("div", "wheel-workspace-primary");
      if (state.popupOpen && !stageMode) primary.appendChild(buildPoppedOutPlaceholder());
      else if (state.viewMode === "grid") primary.appendChild(buildGrid());
      else if (state.viewMode === "results") primary.appendChild(buildResults());
      else primary.appendChild(buildFocus());
      content.appendChild(primary);
      if (!stageMode) {
        if (state.inspectorCollapsed) content.appendChild(buildMobileInspectorLauncher());
        content.appendChild(buildInspector());
      }
      root.appendChild(content);
      window.scrollTo({ top: savedScroll, behavior: "instant" });
    }

    function openPopout() {
      if (state.popup && !state.popup.closed) { state.popup.focus(); return; }
      const width = Math.min(1500, Math.max(900, Math.round(window.screen.availWidth * 0.78)));
      const height = Math.min(1000, Math.max(680, Math.round(window.screen.availHeight * 0.82)));
      const popup = window.open(stageUrl(true), `streamsuites-wheel-stage-${artifact.artifactCode}`, `popup=yes,width=${width},height=${height},resizable=yes,scrollbars=yes`);
      if (!popup) { announce("Popup blocked. The Stage remains docked on this page."); state.popupOpen = false; render(); return; }
      state.popup = popup;
      state.popupOpen = true;
      render();
      state.popupMonitor = window.setInterval(() => { if (!state.popup || state.popup.closed) restoreDockedStage(false); }, 500);
    }

    function restoreDockedStage(restoreFocus) {
      if (state.popupMonitor) window.clearInterval(state.popupMonitor);
      state.popupMonitor = 0;
      state.popup = null;
      state.popupOpen = false;
      render();
      if (restoreFocus) root.querySelector(".wheel-production-presentation")?.focus();
      announce("Stage docked. Parent gameplay controls restored.");
    }

    function requestDock() {
      publish("dock");
      window.close();
    }

    function destroy() {
      state.destroyed = true;
      clearRenderCleanups();
      cancelSpinAll("destroyed");
      closeModal();
      if (state.popupMonitor) window.clearInterval(state.popupMonitor);
      state.channel?.close?.();
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pagehide", handlePageHide);
    }

    let resizeTimer = 0;
    function handleResize() { window.clearTimeout(resizeTimer); resizeTimer = window.setTimeout(render, 120); }
    function handlePageHide() { if (stageMode && sessionId) publish("closing"); }
    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("pagehide", handlePageHide);
    attachChannel();
    render();
    root._cleanupWheelWorkspace = destroy;
    root._wheelWorkspaceState = state;
    return root;
  }

  window.StreamSuitesWheelWorkspace = Object.freeze({
    createWorkspace,
    normalizeArtifact,
    weightedWinner,
    radialLabelRotation,
    serializeChild,
    constants: Object.freeze({ DEFAULT_CENTER_IMAGE, VIEW_MODES: [...VIEW_MODES], STAGE_BACKGROUND_PRESETS, API_BASE })
  });
})();
