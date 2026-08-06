(function () {
  "use strict";

  var REGISTRY_URL = "/api/public/version-registry";
  var SOURCE_URL = "https://api.streamsuites.app/api/public/version-registry";
  var FALLBACK_ICON = "/assets/logos/ssmainlogosq.webp";
  var manifest = null;

  var PRESENTATION = {
    "runtime-system": { group: "System authority", order: 10, icon: "/assets/logos/ssmainlogosq.webp", note: "Canonical system version and build authority" },
    "studio-web": { group: "Production products", order: 20, icon: "/assets/icons/icondiag-studioweb.svg", note: "Browser-native production surface" },
    "studio-windows": { group: "Production products", order: 21, icon: "/assets/logos/studiofavicon.webp", note: "Native Windows production application" },
    "obs-plugin": { group: "Production products", order: 22, icon: "/assets/icons/obs-0.svg", note: "OBS integration with OBS-owned media" },
    "public-web": { group: "Public and account surfaces", order: 30, icon: "/assets/icons/ui/ss-public.svg", note: "Read-only public presentation client" },
    "creator-web": { group: "Public and account surfaces", order: 31, icon: "/assets/icons/ui/ss-creator.svg", note: "Creator-facing Runtime/Auth client" },
    "dashboard-web": { group: "Public and account surfaces", order: 32, icon: "/assets/logos/ssadminshldv2.webp", note: "Administrative web client" },
    "developer-web": { group: "Public and account surfaces", order: 33, icon: "/assets/icons/ui/ss-developer.svg", note: "Developer-facing Runtime/Auth client" },
    "docs-web": { group: "Public and account surfaces", order: 34, icon: "/assets/logos/docscon3d.webp", note: "Shipped-reality documentation" },
    "members-web": { group: "Public and account surfaces", order: 35, icon: "/assets/logos/fmhnewfavicon5.webp", note: "FindMeHere member surface" },
    "desktop-admin-winforms": { group: "Desktop and companion clients", order: 40, icon: "/assets/logos/ssadminshldv2.webp", note: "Privileged Windows administration product" },
    "alerts-windows": { group: "Desktop and companion clients", order: 41, icon: "/assets/logos/ssmainlogosq.webp", note: "Read-only registry-consuming alerts client" },
    "livechat-launcher": { group: "Desktop and companion clients", order: 42, icon: "/assets/icons/browser-extension.svg", note: "Browser launcher and bridge" }
  };

  var POLICY_LABELS = {
    system_semantic: "System semantic",
    independent_product_semantic: "Independent product semantic",
    deferred_product_semantic: "Deferred product semantic",
    deployment_identity_only: "Deployment identity only"
  };

  var STATE_LABELS = {
    ready: "Ready in registry",
    deferred: "Baseline deferred",
    uninitialized: "Not initialized"
  };

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (typeof text === "string") node.textContent = text;
    return node;
  }

  function text(value, fallback) {
    if (value === null || typeof value === "undefined" || value === "") return fallback || "Not reported";
    return String(value);
  }

  function humanize(value) {
    return text(value, "Not reported").replaceAll("_", " ").replace(/\b\w/g, function (letter) { return letter.toUpperCase(); });
  }

  function formatDate(value) {
    if (!value) return "Not reported";
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) return text(value);
    return new Intl.DateTimeFormat("en-AU", {
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "UTC", timeZoneName: "short"
    }).format(date);
  }

  function eventSummary(value) {
    if (!value) return "Not reported";
    if (typeof value !== "object") return text(value);
    return text(value.build_id || value.deployment_id || value.publication_id || value.event_id, "Reported");
  }

  function validate(payload) {
    return payload && payload.schema_version === "version-registry-public-v1" &&
      typeof payload.system_semantic_version === "string" &&
      Number.isInteger(payload.ecosystem_revision) &&
      Array.isArray(payload.components) &&
      payload.components.every(function (item) {
        return item && typeof item.component_id === "string" && typeof item.display_name === "string" && typeof item.version_policy === "string";
      });
  }

  function setText(selector, value) {
    var node = document.querySelector(selector);
    if (node) node.textContent = value;
  }

  function appendField(list, label, value, className) {
    var item = el("div", className || "");
    item.append(el("dt", "", label), el("dd", "", value));
    list.appendChild(item);
  }

  function presentationFor(component) {
    return PRESENTATION[component.component_id] || {
      group: "Other public components",
      order: 90,
      icon: FALLBACK_ICON,
      note: "Public registry component"
    };
  }

  function versionLabel(component) {
    if (component.semantic_version) return component.semantic_version;
    if (component.semantic_version_status === "not_applicable") return "System-aligned client";
    if (component.semantic_version_status === "deferred") return "Baseline deferred";
    return "Not initialized";
  }

  function cardCopyText(component) {
    var build = component.last_build;
    var lines = [
      "StreamSuites version diagnostic",
      "Component: " + component.display_name,
      "Component ID: " + component.component_id,
      "System version: " + manifest.system_semantic_version,
      "Ecosystem revision: " + manifest.ecosystem_revision,
      "Latest ecosystem build: " + text(manifest.latest_ecosystem_build_id),
      "Product semantic version: " + versionLabel(component),
      "Version policy: " + (POLICY_LABELS[component.version_policy] || humanize(component.version_policy)),
      "Semantic status: " + humanize(component.semantic_version_status),
      "Registry state: " + (STATE_LABELS[component.state] || humanize(component.state)),
      "Last component build: " + eventSummary(build),
      "Last deployment: " + eventSummary(component.last_deployment),
      "Last publication: " + eventSummary(component.last_publication),
      "Compatibility: " + text(component.compatibility),
      "Registry schema: " + manifest.schema_version,
      "Registry generated: " + text(manifest.generated_at),
      "Source: " + SOURCE_URL
    ];
    if (build && typeof build === "object") {
      if (build.source_sha) lines.splice(11, 0, "Source revision: " + build.source_sha);
      if (build.component_build_sequence !== null && typeof build.component_build_sequence !== "undefined") lines.splice(11, 0, "Component build sequence: " + build.component_build_sequence);
      if (build.received_at) lines.splice(11, 0, "Build received: " + build.received_at);
    }
    return lines.join("\n");
  }

  function wholeCopyText() {
    var lines = [
      "StreamSuites complete public version reference",
      "System version: " + manifest.system_semantic_version,
      "Ecosystem revision: " + manifest.ecosystem_revision,
      "Latest ecosystem build: " + text(manifest.latest_ecosystem_build_id),
      "Registry generated: " + text(manifest.generated_at),
      "Registry schema: " + manifest.schema_version,
      "Source: " + SOURCE_URL,
      "",
      "PUBLIC COMPONENTS"
    ];
    orderedComponents(manifest.components).forEach(function (component) {
      lines.push("", cardCopyText(component));
    });
    lines.push(
      "",
      "LOCAL DIAGNOSTIC COMPANION",
      "StreamSuites Release Manager",
      "Public registry posture: no separate public product version is projected.",
      "Use its local About dialog for StudioApp version/build, system version/build, source revision, and Release Manager assembly version.",
      "Boundary: private StudioApp release-operations utility; excluded from end-user installers and payloads.",
      "",
      "Local diagnostics may contain device or path details. Never share credentials, tokens, cookies, stream keys, bypass codes, or private registry exports."
    );
    return lines.join("\n");
  }

  function copyText(value) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(value);
    return new Promise(function (resolve, reject) {
      var area = el("textarea", "version-copy-fallback");
      area.value = value;
      area.setAttribute("readonly", "");
      document.body.appendChild(area);
      area.select();
      try {
        if (!document.execCommand("copy")) throw new Error("copy_unavailable");
        resolve();
      } catch (error) {
        reject(error);
      } finally {
        area.remove();
      }
    });
  }

  function announce(message) {
    setText("[data-copy-status]", message);
  }

  function runCopy(button, value, successMessage) {
    if (!value || button.disabled) return;
    var original = button.textContent;
    button.disabled = true;
    copyText(value).then(function () {
      button.classList.add("is-copied");
      button.textContent = "Copied";
      announce(successMessage);
    }).catch(function () {
      button.classList.add("is-copy-error");
      button.textContent = "Copy unavailable";
      announce("Clipboard access is unavailable. Try the source manifest link instead.");
    }).finally(function () {
      window.setTimeout(function () {
        button.disabled = false;
        button.classList.remove("is-copied", "is-copy-error");
        button.textContent = original;
      }, 1800);
    });
  }

  function createComponentCard(component) {
    var present = presentationFor(component);
    var article = el("article", "version-component");
    article.dataset.componentId = component.component_id;
    article.dataset.search = [component.display_name, component.component_id, component.version_policy, component.semantic_version_status, component.state, component.compatibility].join(" ").toLowerCase();

    var head = el("div", "version-component__head");
    var identity = el("div", "version-component__identity");
    var iconWrap = el("span", "version-component__icon");
    var icon = el("img");
    icon.src = present.icon;
    icon.alt = "";
    icon.loading = "lazy";
    icon.addEventListener("error", function () { if (!icon.src.endsWith(FALLBACK_ICON)) icon.src = FALLBACK_ICON; }, { once: true });
    iconWrap.appendChild(icon);
    var titles = el("div");
    titles.append(el("span", "version-component__eyebrow", component.component_id), el("h3", "", component.display_name), el("p", "", present.note));
    identity.append(iconWrap, titles);

    var copy = el("button", "version-copy-button");
    copy.type = "button";
    copy.setAttribute("aria-label", "Copy " + component.display_name + " version details");
    copy.append(el("span", "", "⧉"), document.createTextNode(" Copy details"));
    copy.addEventListener("click", function () { runCopy(copy, cardCopyText(component), component.display_name + " version details copied."); });
    head.append(identity, copy);

    var posture = el("div", "version-component__posture");
    var primary = el("div", "version-component__primary");
    primary.append(el("span", "", "Product version"), el("strong", "", versionLabel(component)));
    var state = el("span", "version-state version-state--" + text(component.state, "unknown"));
    state.append(el("i"), document.createTextNode(STATE_LABELS[component.state] || humanize(component.state)));
    posture.append(primary, state);

    var facts = el("dl", "version-component__facts");
    appendField(facts, "Version policy", POLICY_LABELS[component.version_policy] || humanize(component.version_policy));
    appendField(facts, "Semantic status", humanize(component.semantic_version_status));
    appendField(facts, "Last build", eventSummary(component.last_build));
    appendField(facts, "Last deployment", eventSummary(component.last_deployment));
    appendField(facts, "Last publication", eventSummary(component.last_publication));
    if (component.last_build && typeof component.last_build === "object") {
      appendField(facts, "Build received", formatDate(component.last_build.received_at));
      appendField(facts, "Source revision", text(component.last_build.source_sha));
      appendField(facts, "Component sequence", text(component.last_build.component_build_sequence));
    }

    var compatibility = el("div", "version-component__compatibility");
    compatibility.append(el("span", "", "Compatibility posture"), el("p", "", text(component.compatibility, "No compatibility note reported.")));
    article.append(head, posture, facts, compatibility);
    return article;
  }

  function orderedComponents(components) {
    return components.slice().sort(function (left, right) {
      var leftMeta = presentationFor(left);
      var rightMeta = presentationFor(right);
      return leftMeta.order - rightMeta.order || left.display_name.localeCompare(right.display_name);
    });
  }

  function renderComponents(components) {
    var container = document.querySelector("[data-version-components]");
    var groups = new Map();
    orderedComponents(components).forEach(function (component) {
      var groupName = presentationFor(component).group;
      if (!groups.has(groupName)) groups.set(groupName, []);
      groups.get(groupName).push(component);
    });

    var fragment = document.createDocumentFragment();
    groups.forEach(function (items, groupName) {
      var section = el("section", "version-component-group");
      if (items.length === 1) section.classList.add("version-component-group--single");
      section.dataset.versionGroup = groupName;
      var heading = el("div", "version-component-group__heading");
      heading.append(el("h3", "", groupName), el("span", "", items.length + (items.length === 1 ? " component" : " components")));
      var grid = el("div", "version-component-grid");
      items.forEach(function (component) { grid.appendChild(createComponentCard(component)); });
      section.append(heading, grid);
      fragment.appendChild(section);
    });
    container.replaceChildren(fragment);
    container.hidden = false;
  }

  function renderSummary(payload) {
    var ready = payload.components.filter(function (item) { return item.state === "ready"; }).length;
    var versioned = payload.components.filter(function (item) { return item.semantic_version_status === "initialized" && item.semantic_version; }).length;
    var pending = payload.components.filter(function (item) { return item.semantic_version_status === "deferred" || item.semantic_version_status === "uninitialized"; }).length;
    setText("[data-summary-version]", payload.system_semantic_version);
    setText("[data-summary-revision]", String(payload.ecosystem_revision));
    setText("[data-summary-build]", text(payload.latest_ecosystem_build_id));
    setText("[data-summary-generated]", formatDate(payload.generated_at));
    setText("[data-metric-components]", String(payload.components.length));
    setText("[data-metric-ready]", String(ready));
    setText("[data-metric-versioned]", String(versioned));
    setText("[data-metric-pending]", String(pending));
    setText("[data-registry-state]", "Live public registry connected");
    document.querySelector(".version-authority")?.classList.add("is-connected");
  }

  function bindSearch() {
    var input = document.querySelector("[data-version-search]");
    if (!input) return;
    input.disabled = false;
    input.addEventListener("input", function () {
      var query = input.value.trim().toLowerCase();
      var visible = 0;
      document.querySelectorAll(".version-component").forEach(function (card) {
        var matches = !query || card.dataset.search.includes(query);
        card.hidden = !matches;
        if (matches) visible += 1;
      });
      document.querySelectorAll(".version-component-group").forEach(function (group) {
        group.hidden = !group.querySelector(".version-component:not([hidden])");
      });
      document.querySelector("[data-version-empty]").hidden = visible !== 0;
    });
    document.addEventListener("keydown", function (event) {
      if (event.key !== "/" || event.ctrlKey || event.metaKey || event.altKey || /input|textarea|select/i.test(document.activeElement?.tagName || "")) return;
      event.preventDefault();
      input.focus();
    });
  }

  function bindCopyActions() {
    var all = document.querySelector("[data-copy-manifest]");
    if (all) {
      all.disabled = false;
      all.addEventListener("click", function () { runCopy(all, wholeCopyText(), "Complete public version reference copied."); });
    }
    var companion = document.querySelector("[data-copy-companion]");
    if (companion) companion.addEventListener("click", function () {
      runCopy(companion, [
        "StreamSuites Release Manager diagnostic guidance",
        "Public registry posture: no separate public product version is projected.",
        "Use the local About dialog for StudioApp version/build, system version/build, source revision, and Release Manager assembly version.",
        "Private StudioApp release-operations utility; excluded from end-user installers and payloads.",
        "Never share credentials, tokens, cookies, bypass codes, or private registry exports."
      ].join("\n"), "Release Manager diagnostic guidance copied.");
    });
  }

  function showError() {
    var state = document.querySelector("[data-version-load-state]");
    if (!state) return;
    var title = el("strong", "", "The live registry is temporarily unavailable");
    var description = el("p", "", "No cached or invented version data is shown. Retry the read-only request or open the canonical source manifest.");
    var actions = el("div", "version-load-state__actions");
    var retry = el("button", "button button--quiet button--small", "Retry registry");
    retry.type = "button";
    retry.addEventListener("click", init, { once: true });
    var source = el("a", "button button--quiet button--small", "Open source manifest ↗");
    source.href = SOURCE_URL;
    source.target = "_blank";
    source.rel = "noopener noreferrer";
    actions.append(retry, source);
    state.classList.add("is-error");
    state.replaceChildren(el("span", "version-error-mark", "!"), el("div"));
    state.lastChild.append(title, description, actions);
    setText("[data-registry-state]", "Public registry unavailable");
  }

  async function init() {
    var state = document.querySelector("[data-version-load-state]");
    if (state) {
      state.classList.remove("is-error");
      state.innerHTML = '<span class="version-loader" aria-hidden="true"></span><div><strong>Reading the authoritative registry</strong><p>The component reference will appear here when Runtime/Auth responds.</p></div>';
    }
    try {
      var response = await fetch(REGISTRY_URL, { cache: "no-store", headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error("version_registry_http_" + response.status);
      var payload = await response.json();
      if (!validate(payload)) throw new Error("version_registry_schema_invalid");
      manifest = payload;
      renderSummary(payload);
      renderComponents(payload.components);
      bindSearch();
      bindCopyActions();
      if (state) state.hidden = true;
    } catch (error) {
      console.error("[VersionReference] Unable to load the public version registry.", error);
      showError();
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
