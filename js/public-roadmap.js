(function () {
  "use strict";

  var DATA_URL = "/data/roadmap.json";

  function element(tagName, className, text) {
    var node = document.createElement(tagName);
    if (className) node.className = className;
    if (typeof text === "string") node.textContent = text;
    return node;
  }

  function normalizeInitiatives(payload) {
    var rows = payload && Array.isArray(payload.initiatives) ? payload.initiatives : [];
    return rows.filter(function (row) {
      return row && typeof row.title === "string" && Number.isInteger(row.percent) && row.percent >= 0 && row.percent <= 100;
    }).sort(function (left, right) {
      return Number(left.order || 0) - Number(right.order || 0);
    });
  }

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function setVisiblePercent(label, value) {
    label.textContent = value + "%";
  }

  function revealInitiative(programme) {
    if (programme.dataset.progressVisible === "true") return;

    var label = programme.querySelector(".roadmap-program__percent");
    var target = label ? Number(label.dataset.targetPercent) : 0;
    programme.dataset.progressVisible = "true";
    if (!label || !Number.isInteger(target)) return;

    if (prefersReducedMotion()) {
      setVisiblePercent(label, target);
      return;
    }

    var duration = 920;
    var startedAt = null;
    function tick(timestamp) {
      if (startedAt === null) startedAt = timestamp;
      var elapsed = Math.min(1, (timestamp - startedAt) / duration);
      var eased = 1 - Math.pow(1 - elapsed, 3);
      setVisiblePercent(label, Math.round(target * eased));
      if (elapsed < 1) requestAnimationFrame(tick);
      else setVisiblePercent(label, target);
    }
    requestAnimationFrame(tick);
  }

  function observeInitiatives(container) {
    var programmes = Array.prototype.slice.call(container.querySelectorAll(".roadmap-program"));
    if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
      programmes.forEach(revealInitiative);
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        revealInitiative(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.24, rootMargin: "0px 0px -8% 0px" });

    programmes.forEach(function (programme) {
      observer.observe(programme);
    });
  }

  function renderInitiative(item, index) {
    var details = element("details", "roadmap-program");
    if (index === 0) details.open = true;

    var summary = element("summary");
    var titleRow = element("div", "roadmap-program__title-row");
    var icon = element("span", "roadmap-program__icon");
    icon.setAttribute("aria-hidden", "true");
    icon.style.setProperty("--roadmap-icon", "url('" + String(item.icon || "/assets/icons/ui/api.svg") + "')");

    var titleCopy = element("div");
    var title = element("h2", "", item.title);
    var phase = element("span", "roadmap-program__phase", item.phase || "Alpha programme");
    titleCopy.append(title, phase);
    titleRow.append(icon, titleCopy);

    var percent = element("span", "roadmap-program__percent", "0%");
    percent.dataset.targetPercent = String(item.percent);
    percent.setAttribute("aria-label", item.percent + " percent complete");

    var progress = element("div", "roadmap-progress");
    progress.setAttribute("role", "progressbar");
    progress.setAttribute("aria-label", item.title + " programme estimate");
    progress.setAttribute("aria-valuemin", "0");
    progress.setAttribute("aria-valuemax", "100");
    progress.setAttribute("aria-valuenow", String(item.percent));
    progress.setAttribute("aria-valuetext", item.percent + " percent");
    var fill = element("span", "roadmap-progress__fill");
    fill.style.setProperty("--roadmap-percent", item.percent + "%");
    progress.appendChild(fill);
    summary.append(titleRow, percent, progress);

    var detail = element("div", "roadmap-program__detail");
    detail.appendChild(element("p", "", item.description));
    if (item.next_milestone) {
      var next = element("p", "roadmap-next");
      next.append(element("strong", "", "Next milestone"), document.createTextNode(item.next_milestone));
      detail.appendChild(next);
    }

    details.append(summary, detail);
    return details;
  }

  async function init() {
    var container = document.getElementById("public-roadmap-list");
    if (!container) return;

    try {
      var response = await fetch(DATA_URL, { cache: "no-store" });
      if (!response.ok) throw new Error("roadmap_http_" + response.status);
      var payload = await response.json();
      var initiatives = normalizeInitiatives(payload);
      if (!initiatives.length) throw new Error("roadmap_empty");

      var fragment = document.createDocumentFragment();
      initiatives.forEach(function (item, index) {
        fragment.appendChild(renderInitiative(item, index));
      });
      container.replaceChildren(fragment);
      container.removeAttribute("aria-live");
      observeInitiatives(container);
    } catch (error) {
      var message = element("p", "roadmap-error", "The roadmap snapshot is unavailable right now. Release changelogs and the rest of this page remain accessible below.");
      message.setAttribute("role", "status");
      container.replaceChildren(message);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
