(() => {
  "use strict";

  const DEFAULT_CENTER_IMAGE = "/assets/placeholders/wheelcenterdefault.webp";
  const API_BASE = String(window.StreamSuitesPublicConfig?.AUTH_API_BASE || "https://api.streamsuites.app").replace(/\/$/, "");
  const VIEW_MODES = new Set(["focus", "grid", "results"]);
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
    return { latestResult: null, history: [], excludedEntrants: new Set(), spinState: "idle", rotation: 0 };
  }

  function serializeResultState(result) {
    return {
      latestResult: result.latestResult ? { ...result.latestResult } : null,
      history: result.history.map((entry) => ({ ...entry })),
      excludedEntrants: [...result.excludedEntrants],
      spinState: result.spinState,
      rotation: result.rotation
    };
  }

  function hydrateResultState(value) {
    return {
      latestResult: value?.latestResult ? { ...value.latestResult } : null,
      history: Array.isArray(value?.history) ? value.history.map((entry) => ({ ...entry })) : [],
      excludedEntrants: new Set(Array.isArray(value?.excludedEntrants) ? value.excludedEntrants : []),
      spinState: text(value?.spinState, "idle"),
      rotation: Number(value?.rotation) || 0
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
    let angle = 0;
    entries.forEach((entry, index) => {
      const sweep = (effectiveWeight(entry) / total) * 360;
      const group = svgElement("g", { "data-wheel-entry-id": entry.entryId });
      group.classList.add("wheel-slice-group");
      const path = svgElement("path", { d: slicePath(angle, angle + sweep), fill: entry.color || wheel.palette.segment_colors[index % Math.max(1, wheel.palette.segment_colors.length)] || "#64748b" });
      path.classList.add("wheel-slice");
      group.appendChild(path);
      if (!compact && wheel.presentation.show_display_names_on_slices !== false && sweep >= 9) {
        const mid = angle + sweep / 2;
        const labelPoint = polar(240, 240, 145, mid);
        const label = svgElement("text", { x: labelPoint.x, y: labelPoint.y, fill: wheel.palette.text_color, "text-anchor": "middle", transform: `rotate(${mid} ${labelPoint.x} ${labelPoint.y})` });
        const name = wheel.presentation.slice_label_mode === "initials"
          ? entryName(entry).split(/\s+/).map((part) => part[0]).join("").slice(0, 3).toUpperCase()
          : entryName(entry).slice(0, compact ? 8 : 16);
        label.textContent = name;
        group.appendChild(label);
      }
      svg.appendChild(group);
      angle += sweep;
    });
    svg.appendChild(svgElement("circle", { cx: 240, cy: 240, r: 218, fill: "none", stroke: wheel.palette.trim_color, "stroke-width": compact ? 8 : 12 }));
    const center = svgElement("circle", { cx: 240, cy: 240, r: compact ? 46 : 54, fill: wheel.palette.background_color, stroke: wheel.palette.accent_color, "stroke-width": 8 });
    svg.appendChild(center);
    if (wheel.presentation.center_image_url) {
      const image = svgElement("image", { href: wheel.presentation.center_image_url, x: compact ? 202 : 194, y: compact ? 202 : 194, width: compact ? 76 : 92, height: compact ? 76 : 92, preserveAspectRatio: "xMidYMid slice" });
      svg.appendChild(image);
    }
    return svg;
  }

  function createWorkspace(rawItem, options = {}) {
    let artifact = normalizeArtifact(rawItem);
    const stageMode = options.stageMode === true;
    const isOwner = options.isOwner === true;
    const sessionId = text(options.sessionId || new URLSearchParams(window.location.search).get("session"));
    const sourceId = crypto.randomUUID?.() || `src-${Date.now()}-${Math.random().toString(16).slice(2)}`;
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
      lastFocus: null
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
      return record;
    }

    function performSpin(wheel, options = {}) {
      if (!canSpin(wheel)) return false;
      const result = resultFor(wheel.wheelId);
      const winner = weightedWinner(eligibleEntries(wheel));
      if (!winner) return false;
      result.spinState = "spinning";
      const entries = eligibleEntries(wheel);
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

    function selectWheel(wheelId, focusCard = false) {
      if (!state.authoritativeWheelSet.wheels.some((wheel) => wheel.wheelId === wheelId)) return;
      state.selectedWheelId = wheelId;
      render();
      if (focusCard) root.querySelector(`[data-wheel-deck-id="${CSS.escape(wheelId)}"]`)?.focus();
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

    function buildDeck() {
      const section = element("section", "wheel-deck");
      section.setAttribute("aria-label", "Wheel deck");
      const previous = element("button", "wheel-deck-nav", "‹");
      previous.type = "button";
      previous.setAttribute("aria-label", "Scroll wheel deck left");
      const viewport = element("div", "wheel-deck-viewport");
      viewport.setAttribute("role", "listbox");
      viewport.setAttribute("aria-label", "Select a wheel to view");
      state.authoritativeWheelSet.wheels.forEach((wheel, index) => {
        const result = resultFor(wheel.wheelId);
        const card = element("button", `wheel-deck-card${state.selectedWheelId === wheel.wheelId ? " is-selected" : ""}`);
        card.type = "button";
        card.dataset.wheelDeckId = wheel.wheelId;
        card.setAttribute("role", "option");
        card.setAttribute("aria-selected", state.selectedWheelId === wheel.wheelId ? "true" : "false");
        card.tabIndex = state.selectedWheelId === wheel.wheelId ? 0 : -1;
        const signature = element("span", "wheel-deck-signature");
        signature.style.background = `linear-gradient(135deg, ${wheel.palette.accent_color}, ${wheel.palette.glow_color})`;
        const copy = element("span", "wheel-deck-copy");
        copy.append(element("strong", "", wheel.name), element("small", "", `${wheel.entries.length} entrants${result.latestResult ? ` · ${result.latestResult.winner}` : ""}`));
        card.append(signature, copy);
        if (state.authorityDefaultWheelId === wheel.wheelId) card.appendChild(element("span", "wheel-deck-default", "Default"));
        if (result.latestResult) card.appendChild(element("span", "wheel-deck-result", "Result"));
        card.addEventListener("click", () => selectWheel(wheel.wheelId));
        card.addEventListener("keydown", (event) => {
          const last = state.authoritativeWheelSet.wheels.length - 1;
          let target = index;
          if (event.key === "ArrowRight") target = Math.min(last, index + 1);
          else if (event.key === "ArrowLeft") target = Math.max(0, index - 1);
          else if (event.key === "Home") target = 0;
          else if (event.key === "End") target = last;
          else return;
          event.preventDefault();
          selectWheel(state.authoritativeWheelSet.wheels[target].wheelId, true);
        });
        viewport.appendChild(card);
      });
      const next = element("button", "wheel-deck-nav", "›");
      next.type = "button";
      next.setAttribute("aria-label", "Scroll wheel deck right");
      previous.addEventListener("click", () => viewport.scrollBy({ left: -320, behavior: "smooth" }));
      next.addEventListener("click", () => viewport.scrollBy({ left: 320, behavior: "smooth" }));
      section.append(previous, viewport, next);
      return section;
    }

    function buildControlRail() {
      const wheel = selectedWheel();
      const result = resultFor(wheel.wheelId);
      const rail = element("section", "wheel-production-rail");
      rail.setAttribute("aria-label", "Wheel production controls");
      const selection = element("div", "wheel-production-selection");
      selection.append(element("span", "", "Selected wheel"), element("strong", "", wheel.name));
      const spin = element("button", "wheel-production-primary", "Spin");
      spin.type = "button";
      spin.disabled = !canSpin(wheel);
      spin.addEventListener("click", () => performSpin(wheel));
      const spinAllButton = element("button", "wheel-production-primary wheel-production-primary--all", state.currentSpinAll ? `Spin All ${state.currentSpinAll.completed}/${state.currentSpinAll.total}` : "Spin All");
      spinAllButton.type = "button";
      spinAllButton.disabled = Boolean(state.currentSpinAll) || (state.popupOpen && !stageMode) || !state.authoritativeWheelSet.wheels.some(canSpin);
      spinAllButton.addEventListener("click", spinAll);
      const respin = element("button", "wheel-production-secondary", "Re-spin");
      respin.type = "button";
      respin.disabled = !result.latestResult || !canSpin(wheel);
      respin.addEventListener("click", () => performSpin(wheel, { mode: "respin" }));
      const reset = element("button", "wheel-production-secondary", "Reset wheel");
      reset.type = "button";
      reset.disabled = !result.history.length && result.spinState !== "spinning";
      reset.addEventListener("click", () => resetWheel(wheel.wheelId));
      const resetEverything = element("button", "wheel-production-secondary", "Reset all");
      resetEverything.type = "button";
      resetEverything.disabled = ![...state.resultsByWheel.values()].some((entry) => entry.history.length || entry.spinState === "spinning");
      resetEverything.addEventListener("click", resetAll);
      rail.append(selection, spin, spinAllButton, respin, reset, resetEverything);
      if (!stageMode) {
        const popout = element("button", "wheel-production-secondary", state.popupOpen ? "Focus stage window" : "Pop out stage");
        popout.type = "button";
        popout.addEventListener("click", openPopout);
        rail.appendChild(popout);
      } else if (sessionId) {
        const dock = element("button", "wheel-production-secondary", "Dock stage");
        dock.type = "button";
        dock.addEventListener("click", requestDock);
        rail.appendChild(dock);
      } else {
        const full = element("a", "wheel-production-secondary", "Open full page");
        full.href = publicUrl();
        full.target = "_blank";
        full.rel = "noopener noreferrer";
        rail.appendChild(full);
      }
      return rail;
    }

    function buildFocus() {
      const wheel = selectedWheel();
      const result = resultFor(wheel.wheelId);
      const arena = element("section", "wheel-arena-card wheel-focus-arena");
      arena.dataset.wheelRenderId = wheel.wheelId;
      arena.style.setProperty("--wheel-trim-color", wheel.palette.trim_color);
      arena.style.setProperty("--wheel-glow-color", wheel.palette.glow_color);
      const header = element("header", "wheel-arena-header");
      const heading = element("div", "wheel-arena-heading");
      heading.append(element("span", "wheel-console-eyebrow", "Wheel arena"), element("h1", "wheel-arena-title", wheel.name));
      header.append(heading, element("span", "wheel-console-policy-chip", wheel.presentation.spin_owner_only ? "Owner controls spins" : "Public local session"));
      const stage = element("div", "wheel-spin-stage wheel-spin-stage-premium");
      stage.dataset.state = result.spinState;
      const atmosphere = element("div", "wheel-arena-atmosphere");
      atmosphere.setAttribute("aria-hidden", "true");
      atmosphere.append(element("div", "wheel-arena-beam wheel-arena-beam--left"), element("div", "wheel-arena-beam wheel-arena-beam--right"), element("div", "wheel-arena-portal"), element("div", "wheel-arena-floor"));
      const assembly = element("div", "wheel-stage-assembly");
      const trim = element("div", "wheel-stage-trim");
      trim.dataset.state = result.spinState;
      const disc = element("div", "wheel-spin-disc wheel-spin-disc-premium");
      disc.style.transform = `rotate(${result.rotation}deg)`;
      disc.appendChild(buildWheelGraphic(wheel));
      assembly.append(element("div", "wheel-stage-aura"), element("div", "wheel-stage-chassis"), trim, disc, element("div", "wheel-hardware-pointer"));
      stage.append(atmosphere, assembly);
      const summary = element("div", "wheel-focus-summary");
      summary.append(element("strong", "", result.spinState === "spinning" ? "Spinning…" : result.latestResult?.winner || "Ready to spin"), element("span", "", result.latestResult ? `${(result.latestResult.probability * 100).toFixed(1)}% at selection · local result` : `${wheel.entries.length} unique entrants · no backend winner history`));
      arena.append(header, stage, summary);
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
        const disc = element("div", "wheel-grid-disc");
        disc.style.transform = `rotate(${result.rotation}deg)`;
        disc.appendChild(buildWheelGraphic(wheel, true));
        graphic.append(disc, element("span", "wheel-grid-pointer"));
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
      const dismiss = () => {
        cleanup();
        backdrop.remove();
        document.body.classList.remove("modal-open");
        state.modalCleanup = null;
        state.lastFocus?.focus?.();
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

    function rehydrateCanonical(payload) {
      const canonical = payload?.wheel || payload;
      if (!canonical || typeof canonical !== "object") return;
      const previousSelection = state.selectedWheelId;
      artifact = normalizeArtifact({ ...artifact, ...canonical });
      state.authoritativeWheelSet = artifact.wheelSet;
      state.authorityDefaultWheelId = artifact.wheelSet.activeWheelId;
      state.selectedWheelId = artifact.wheelSet.wheels.some((wheel) => wheel.wheelId === previousSelection) ? previousSelection : artifact.wheelSet.activeWheelId;
      const validIds = new Set(artifact.wheelSet.wheels.map((wheel) => wheel.wheelId));
      [...state.resultsByWheel.keys()].forEach((id) => { if (!validIds.has(id)) state.resultsByWheel.delete(id); });
      artifact.wheelSet.wheels.forEach((wheel) => resultFor(wheel.wheelId));
      render();
      publish("state");
    }

    async function mutate(operation) {
      const response = await fetch(`${API_BASE}/api/creator/wheels/${encodeURIComponent(artifact.artifactCode)}`, {
        method: "PATCH",
        cache: "no-store",
        credentials: "include",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ operation })
      });
      const payload = await parseResponse(response);
      if (!response.ok || payload?.success === false) throw new Error(text(payload?.error, `Save failed (${response.status})`));
      rehydrateCanonical(payload);
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
      let objectUrl = "";
      let selectedFile = null;
      openModal("Wheel appearance", `Edit the currently authoritative appearance fields for ${wheel.name}.`, (body) => {
        const layout = element("div", "wheel-appearance-editor");
        const preview = element("div", "wheel-appearance-preview");
        const controls = element("div", "wheel-appearance-controls");
        function refreshPreview() { preview.replaceChildren(buildWheelGraphic(draft)); }
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
        const fileField = element("label", "wheel-editor-field");
        const file = element("input"); file.type = "file"; file.accept = "image/png,image/jpeg,image/webp";
        file.addEventListener("change", () => {
          selectedFile = file.files?.[0] || null;
          if (objectUrl) URL.revokeObjectURL(objectUrl);
          objectUrl = selectedFile ? URL.createObjectURL(selectedFile) : "";
          draft.presentation.center_image_url = objectUrl || wheel.presentation.center_image_url;
          refreshPreview();
        });
        fileField.append(element("span", "", "Centre image · PNG, JPEG, or WebP · max 5 MiB"), file); controls.appendChild(fileField);
        const urlField = element("label", "wheel-editor-field");
        const url = element("input"); url.type = "url"; url.value = wheel.presentation.center_image_url; url.placeholder = "Existing safe image URL";
        url.addEventListener("input", () => { if (!selectedFile) { draft.presentation.center_image_url = url.value || DEFAULT_CENTER_IMAGE; refreshPreview(); } });
        urlField.append(element("span", "", "Centre image URL"), url); controls.appendChild(urlField);
        const save = element("button", "wheel-production-primary", "Save appearance");
        save.addEventListener("click", async () => {
          const status = modalStatus(body); status.textContent = "Saving…";
          try {
            if (selectedFile) {
              const form = new FormData(); form.append("file", selectedFile);
              const response = await fetch(`${API_BASE}/api/creator/wheels/${encodeURIComponent(artifact.artifactCode)}/wheels/${encodeURIComponent(wheel.wheelId)}/center-image`, { method: "POST", credentials: "include", cache: "no-store", headers: { Accept: "application/json" }, body: form });
              const payload = await parseResponse(response);
              if (!response.ok || payload?.success === false) throw new Error(text(payload?.error, `Upload failed (${response.status})`));
              rehydrateCanonical(payload);
              const hydrated = state.authoritativeWheelSet.wheels.find((entry) => entry.wheelId === wheel.wheelId);
              draft.presentation.center_image_url = hydrated?.presentation.center_image_url || draft.presentation.center_image_url;
            } else {
              draft.presentation.center_image_url = url.value || DEFAULT_CENTER_IMAGE;
            }
            await mutate({ type: "update", wheel_id: wheel.wheelId, wheel: serializeChild(draft) });
            status.textContent = "Saved and rehydrated from Runtime/Auth.";
            if (objectUrl) { URL.revokeObjectURL(objectUrl); objectUrl = ""; }
          } catch (error) { status.textContent = error instanceof Error ? error.message : "Save failed."; }
        });
        controls.appendChild(save);
        layout.append(preview, controls); body.appendChild(layout); refreshPreview();
        return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
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
        if (isOwner) {
          const delayField = element("label", "wheel-editor-field"); const delay = element("input"); delay.type = "number"; delay.min = "100"; delay.max = "1000"; delay.value = state.authoritativeWheelSet.spinAll.delayMs; delayField.append(element("span", "", "Spin All stagger delay (ms)"), delay);
          const save = element("button", "wheel-production-primary", "Save Spin All timing"); save.addEventListener("click", async () => { const status = modalStatus(body); status.textContent = "Saving…"; try { await mutate({ type: "update_spin_all", spin_all: { mode: "staggered", delay_ms: Number(delay.value) } }); status.textContent = "Spin All timing saved."; } catch (error) { status.textContent = error instanceof Error ? error.message : "Save failed."; } }); body.append(delayField, save);
        }
      });
    }

    function buildInspector() {
      const wheel = selectedWheel();
      const result = resultFor(wheel.wheelId);
      const aside = element("aside", "wheel-quick-inspector");
      aside.setAttribute("aria-label", "Quick inspector");
      const tabs = element("div", "wheel-inspector-tabs");
      const panels = element("div", "wheel-inspector-panels");
      const definitions = [
        ["entries", "Entries", () => {
          const panel = element("section", "wheel-inspector-panel");
          const enabled = wheel.entries.filter((entry) => entry.enabled !== false);
          panel.append(element("strong", "", `${wheel.entries.length} unique · ${wheel.entries.reduce((sum, entry) => sum + entryUnits(entry), 0)} total tickets · ${enabled.length} enabled`));
          wheel.entries.slice(0, 5).forEach((entry) => panel.appendChild(element("p", "", `${entryName(entry)} · ${entryUnits(entry)} × ${entry.weight} · ${((effectiveWeight(entry) / (wheel.entries.reduce((sum, item) => sum + effectiveWeight(item), 0) || 1)) * 100).toFixed(1)}%`)));
          if (isOwner) { const button = element("button", "wheel-production-secondary", "Manage entrants"); button.addEventListener("click", entrantManagerModal); panel.appendChild(button); }
          return panel;
        }],
        ["rules", "Rules", () => {
          const panel = element("section", "wheel-inspector-panel"); panel.append(element("p", "", `Winner limit ${wheel.winnerLimit}`), element("p", "", wheel.allowDuplicates ? "Duplicate winners allowed" : "Duplicate winners blocked"), element("p", "", wheel.autoRemoveWinner ? "Winner auto-removes locally" : "Winner remains eligible"), element("p", "", wheel.presentation.spin_owner_only ? "Owner-only spin" : "Public local spin"));
          if (isOwner) { const button = element("button", "wheel-production-secondary", "Advanced rules"); button.addEventListener("click", rulesModal); panel.appendChild(button); }
          return panel;
        }],
        ["appearance", "Appearance", () => {
          const panel = element("section", "wheel-inspector-panel"); const palette = element("div", "wheel-palette-preview"); [wheel.palette.accent_color, wheel.palette.trim_color, wheel.palette.glow_color, ...wheel.palette.segment_colors.slice(0, 5)].forEach((color) => { const swatch = element("span"); swatch.style.background = color; palette.appendChild(swatch); }); panel.append(palette, element("p", "", `${wheel.presentation.slice_label_mode.replace("_", " ")} labels`)); const image = element("img", "wheel-inspector-center-image"); image.src = wheel.presentation.center_image_url; image.alt = "Current centre image"; panel.appendChild(image);
          if (isOwner) { const appearance = element("button", "wheel-production-secondary", "Edit appearance"); appearance.addEventListener("click", appearanceModal); const celebration = element("button", "wheel-production-secondary", "Celebration"); celebration.addEventListener("click", celebrationModal); panel.append(appearance, celebration); }
          return panel;
        }],
        ["sound", "Sound", () => {
          const panel = element("section", "wheel-inspector-panel"); panel.append(element("p", "", wheel.presentation.sound_enabled ? "Sound enabled" : "Sound disabled"), element("p", "", `Winner cue: ${text(wheel.presentation.sound?.winner?.asset_id, SOUND_LIBRARY.winner[0])}`)); if (isOwner) { const button = element("button", "wheel-production-secondary", "Sound settings"); button.addEventListener("click", soundModal); panel.appendChild(button); } return panel;
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
      definitions.forEach(([key, label, builder], index) => { const button = element("button", `wheel-inspector-tab${index === 0 ? " is-active" : ""}`, label); button.dataset.key = key; button.setAttribute("role", "tab"); button.setAttribute("aria-selected", index === 0 ? "true" : "false"); button.addEventListener("click", () => select(key)); tabs.appendChild(button); const panel = builder(); panel.dataset.key = key; panel.hidden = index !== 0; panels.appendChild(panel); });
      aside.append(tabs, panels);
      if (result.latestResult) aside.appendChild(element("div", "wheel-inspector-result", `Latest: ${result.latestResult.winner}`));
      return aside;
    }

    function buildOwnerBar() {
      const bar = element("div", "wheel-owner-bar");
      const add = element("button", "wheel-production-secondary", "Add wheel"); add.addEventListener("click", async () => { try { await mutate({ type: "add", wheel: { name: `Wheel ${state.authoritativeWheelSet.wheels.length + 1}`, entries: ["Entry 1", "Entry 2"] } }); announce("Wheel added."); } catch (error) { announce(error instanceof Error ? error.message : "Add failed."); } });
      const manage = element("button", "wheel-production-secondary", "Manage wheels"); manage.addEventListener("click", manageWheelsModal);
      const makeDefault = element("button", "wheel-production-secondary", "Set as default"); makeDefault.disabled = state.selectedWheelId === state.authorityDefaultWheelId; makeDefault.addEventListener("click", async () => { try { await mutate({ type: "set_active", wheel_id: state.selectedWheelId }); announce(`${selectedWheel().name} is now the saved default.`); } catch (error) { announce(error instanceof Error ? error.message : "Default update failed."); } });
      bar.append(add, manage, makeDefault);
      return bar;
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
      [...root.children].forEach((child) => { if (child !== live && !child.classList.contains("wheel-editor-backdrop") && !child.classList.contains("wheel-winner-overlay")) child.remove(); });
      const header = element("header", "wheel-workspace-header");
      const heading = element("div");
      heading.append(element("span", "wheel-console-eyebrow", stageMode ? "Shell-free Stage" : "Multi-wheel workspace"), element(stageMode ? "h1" : "h2", "", artifact.title), element("p", "", stageMode ? "Browser-local presentation session" : `${state.authoritativeWheelSet.wheels.length} authoritative wheels · local gameplay state`));
      header.append(heading, buildViewSelector());
      root.append(header, buildDeck());
      if (isOwner && !stageMode) root.appendChild(buildOwnerBar());
      root.appendChild(buildControlRail());
      const content = element("div", "wheel-workspace-content");
      const primary = element("div", "wheel-workspace-primary");
      if (state.popupOpen && !stageMode) primary.appendChild(buildPoppedOutPlaceholder());
      else if (state.viewMode === "grid") primary.appendChild(buildGrid());
      else if (state.viewMode === "results") primary.appendChild(buildResults());
      else primary.appendChild(buildFocus());
      content.appendChild(primary);
      if (!stageMode) content.appendChild(buildInspector());
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
      if (restoreFocus) root.querySelector(".wheel-production-rail button:last-child")?.focus();
      announce("Stage docked. Parent gameplay controls restored.");
    }

    function requestDock() {
      publish("dock");
      window.close();
    }

    function destroy() {
      state.destroyed = true;
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
    serializeChild,
    constants: Object.freeze({ DEFAULT_CENTER_IMAGE, VIEW_MODES: [...VIEW_MODES], API_BASE })
  });
})();
