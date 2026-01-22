(() => {
  "use strict";

  const VERSION_URL = "https://admin.streamsuites.app/docs/runtime/exports/version.json";
  const VERSION_TIMEOUT_MS = 4000;
  let cachedVersionPromise = null;

  const UNAVAILABLE_LABEL = "Version unavailable";

  function getValue(value) {
    return value ? String(value) : "";
  }

  function normalizeVersionLabel(label) {
    if (!label) return "";
    if (/StreamSuites/i.test(label)) return label;
    if (label.startsWith("v")) return label;
    return `v${label}`;
  }

  function formatDisplayVersion(info) {
    const rawVersion = getValue(info?.version);
    const normalized = normalizeVersionLabel(rawVersion);
    return normalized;
  }

  function formatFooterVersion(info) {
    const displayVersion = formatDisplayVersion(info);
    const project = getValue(info?.project) || "StreamSuites™";
    if (!displayVersion) return project;
    if (/StreamSuites/i.test(displayVersion)) return displayVersion;
    return `${project} ${displayVersion}`.trim();
  }

  function getBuildLabel(info) {
    return getValue(info?.build);
  }

  function formatVersionWithBuild(info) {
    const versionLabel = formatDisplayVersion(info);
    const buildLabel = getBuildLabel(info);
    if (!versionLabel && !buildLabel) return "";
    if (!buildLabel) return versionLabel;
    if (!versionLabel) return `Build ${buildLabel}`;
    return `${versionLabel} • ${buildLabel}`;
  }

  function formatFooterVersionWithBuild(info) {
    const footerLabel = formatFooterVersion(info);
    const buildLabel = getBuildLabel(info);
    if (!buildLabel) return footerLabel;
    return `${footerLabel} • Build ${buildLabel}`;
  }

  function resolveBasePath() {
    return "";
  }

  function resolveVersionUrl() {
    const origin = window.location ? window.location.origin : "";
    return new URL(VERSION_URL, origin || window.location.href).toString();
  }

  function loadVersion() {
    if (!cachedVersionPromise) {
      const controller =
        typeof AbortController !== "undefined" ? new AbortController() : null;
      const timeoutId = controller
        ? setTimeout(() => controller.abort(), VERSION_TIMEOUT_MS)
        : null;

      const versionUrl = resolveVersionUrl();

      cachedVersionPromise = fetch(versionUrl, {
        cache: "no-store",
        signal: controller ? controller.signal : undefined
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Version metadata request failed (${response.status})`);
          }
          return response.json();
        })
        .then((info) => ({ info, error: null }))
        .catch((error) => {
          console.error("[Versioning] Unable to load runtime version metadata.", error);
          return { info: null, error };
        })
        .finally(() => {
          if (timeoutId) clearTimeout(timeoutId);
        });
    }

    return cachedVersionPromise;
  }

  function applyVersionToElements(selectors = {}) {
    const resolvedSelectors = {
      version: selectors.version || null,
      footerVersion: selectors.footerVersion || null,
      build: selectors.build || null,
      copyright: selectors.copyright || null,
      owner: selectors.owner || null
    };

    return loadVersion().then((result) => {
      if (!result || result.error || !result.info) return null;
      const info = result.info;

      if (resolvedSelectors.version) {
        const versionLabel = formatDisplayVersion(info);
        document.querySelectorAll(resolvedSelectors.version).forEach((el) => {
          el.textContent = versionLabel;
        });
      }

      if (resolvedSelectors.footerVersion) {
        const footerLabel = formatFooterVersion(info);
        document.querySelectorAll(resolvedSelectors.footerVersion).forEach((el) => {
          el.textContent = footerLabel;
        });
      }

      if (resolvedSelectors.build) {
        const buildLabel = getBuildLabel(info);
        if (buildLabel) {
          document.querySelectorAll(resolvedSelectors.build).forEach((el) => {
            el.textContent = buildLabel;
          });
        }
      }

      if (resolvedSelectors.copyright && info?.copyright) {
        document.querySelectorAll(resolvedSelectors.copyright).forEach((el) => {
          el.textContent = String(info.copyright);
        });
      }

      if (resolvedSelectors.owner && info?.owner) {
        document.querySelectorAll(resolvedSelectors.owner).forEach((el) => {
          el.textContent = String(info.owner);
        });
      }

      return info;
    });
  }

  window.Versioning = {
    loadVersion,
    getBuildLabel,
    formatDisplayVersion,
    formatFooterVersion,
    formatVersionWithBuild,
    formatFooterVersionWithBuild,
    resolveBasePath,
    applyVersionToElements,
    UNAVAILABLE_LABEL
  };
})();
