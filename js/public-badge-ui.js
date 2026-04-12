(() => {
  const TOOLTIP_ID = "ss-shared-badge-tooltip";
  const DEFAULT_LABELS = Object.freeze({
    admin: "Admin",
    core: "Core",
    gold: "Gold",
    pro: "Pro",
    founder: "Founder",
    moderator: "Moderator",
    developer: "Developer",
    live: "Live"
  });

  let tooltip = null;
  let activeTarget = null;

  function safeText(value, fallback = "") {
    const text = String(value || "").trim();
    return text || fallback;
  }

  function normalizeKey(value) {
    return safeText(value).toLowerCase().replace(/[_\s-]+/g, " ").trim();
  }

  function titleCase(value) {
    return safeText(value)
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }

  function ensureTooltip() {
    if (tooltip?.isConnected) return tooltip;
    tooltip = document.getElementById(TOOLTIP_ID);
    if (tooltip) return tooltip;
    tooltip = document.createElement("div");
    tooltip.id = TOOLTIP_ID;
    tooltip.className = "ss-badge-floating-tooltip";
    tooltip.setAttribute("role", "tooltip");
    tooltip.setAttribute("aria-hidden", "true");
    document.body.appendChild(tooltip);
    return tooltip;
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function positionTooltip(target) {
    const node = ensureTooltip();
    if (!target?.isConnected || !node.textContent) return;
    const rect = target.getBoundingClientRect();
    const tooltipRect = node.getBoundingClientRect();
    const gap = 10;
    const viewportGap = 10;
    const shouldPlaceBelow = rect.top - tooltipRect.height - gap < viewportGap;
    const left = clamp(
      rect.left + (rect.width / 2) - (tooltipRect.width / 2),
      viewportGap,
      Math.max(viewportGap, window.innerWidth - tooltipRect.width - viewportGap)
    );
    const top = shouldPlaceBelow
      ? Math.min(window.innerHeight - tooltipRect.height - viewportGap, rect.bottom + gap)
      : Math.max(viewportGap, rect.top - tooltipRect.height - gap);
    node.dataset.side = shouldPlaceBelow ? "bottom" : "top";
    node.style.left = `${Math.round(left)}px`;
    node.style.top = `${Math.round(top)}px`;
  }

  function showTooltip(target) {
    const label = safeText(target?.dataset?.ssBadgeTooltipLabel);
    const node = ensureTooltip();
    if (!target?.isConnected || !label) return;
    activeTarget = target;
    node.textContent = label;
    node.classList.add("is-visible");
    node.setAttribute("aria-hidden", "false");
    positionTooltip(target);
  }

  function hideTooltip(target) {
    if (target && activeTarget && target !== activeTarget) return;
    activeTarget = null;
    if (!tooltip) return;
    tooltip.classList.remove("is-visible");
    tooltip.setAttribute("aria-hidden", "true");
  }

  function isNaturallyFocusable(node) {
    if (!(node instanceof HTMLElement)) return false;
    if (node.tabIndex >= 0) return true;
    const tag = node.tagName.toLowerCase();
    return tag === "a" || tag === "button" || tag === "input" || tag === "select" || tag === "textarea";
  }

  function registerTarget(target, label) {
    if (!(target instanceof HTMLElement)) return target;
    const tooltipLabel = safeText(label);
    if (!tooltipLabel) return target;
    ensureTooltip();
    target.classList.add("ss-badge-tooltip-target");
    target.dataset.ssBadgeTooltipLabel = tooltipLabel;
    target.setAttribute("aria-label", tooltipLabel);
    target.setAttribute("aria-describedby", TOOLTIP_ID);
    if (!isNaturallyFocusable(target)) {
      target.tabIndex = 0;
    }
    if (target.dataset.ssBadgeTooltipBound === "true") return target;
    target.dataset.ssBadgeTooltipBound = "true";
    target.addEventListener("mouseenter", () => showTooltip(target));
    target.addEventListener("mouseleave", () => hideTooltip(target));
    target.addEventListener("focus", () => showTooltip(target));
    target.addEventListener("blur", () => hideTooltip(target));
    target.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        hideTooltip(target);
      }
    });
    return target;
  }

  function wrapTooltipTarget(content, label, options = {}) {
    if (!(content instanceof Element)) return content;
    const tooltipLabel = safeText(label);
    if (!tooltipLabel) return content;
    const target = document.createElement(options.tagName || "span");
    target.className = safeText(options.className, "ss-badge-tooltip-target");
    registerTarget(target, tooltipLabel);
    content.setAttribute("aria-hidden", "true");
    target.appendChild(content);
    return target;
  }

  function resolveBadgeLabel(badgeOrKey, fallback = "Badge") {
    if (badgeOrKey && typeof badgeOrKey === "object") {
      const explicit =
        safeText(badgeOrKey.label) ||
        safeText(badgeOrKey.title) ||
        safeText(badgeOrKey.tooltip) ||
        safeText(badgeOrKey.value) ||
        safeText(badgeOrKey.key);
      return explicit ? titleCase(explicit) : fallback;
    }
    const key = normalizeKey(badgeOrKey);
    return DEFAULT_LABELS[key] || titleCase(key) || fallback;
  }

  function resolveLiveLabel(value) {
    if (value && typeof value === "object") {
      const provider = safeText(value.providerLabel || value.provider);
      return provider ? `Live on ${provider}` : "Live";
    }
    return "Live";
  }

  window.addEventListener("resize", () => {
    if (activeTarget) positionTooltip(activeTarget);
  });

  window.addEventListener("scroll", () => {
    if (activeTarget) positionTooltip(activeTarget);
  }, true);

  window.StreamSuitesPublicBadgeUi = Object.freeze({
    hideTooltip,
    registerTarget,
    resolveBadgeLabel,
    resolveLiveLabel,
    wrapTooltipTarget
  });
})();
