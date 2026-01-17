(() => {
  "use strict";

  const VERSION_URL = "https://admin.streamsuites.app/version.json";
  let cachedVersionPromise = null;

  const VERSION_KEYS = ["displayVersion", "version", "tag", "semver", "release", "buildVersion"];
  const BUILD_KEYS = ["build", "buildNumber", "buildId", "buildHash", "buildVersion", "buildTag"];
  const PRODUCT_KEYS = ["product", "productName", "app", "name", "title"];
  const COPYRIGHT_KEYS = ["copyright", "copyrightNotice"];
  const OWNER_KEYS = ["owner", "organization", "company"];

  function getFirstValue(info, keys) {
    if (!info) return "";
    for (const key of keys) {
      if (info[key]) return info[key];
    }
    return "";
  }

  function normalizeVersionLabel(label) {
    if (!label) return "";
    if (/StreamSuites/i.test(label)) return label;
    if (label.startsWith("v")) return label;
    return `v${label}`;
  }

  function formatDisplayVersion(info) {
    const rawVersion = getFirstValue(info, VERSION_KEYS);
    const normalized = normalizeVersionLabel(rawVersion);
    return normalized || "Unknown";
  }

  function formatFooterVersion(info) {
    const displayVersion = formatDisplayVersion(info);
    if (displayVersion === "Unknown") return "StreamSuites™";

    if (/StreamSuites/i.test(displayVersion)) return displayVersion;

    const product = getFirstValue(info, PRODUCT_KEYS) || "StreamSuites™";
    return `${product} ${displayVersion}`.trim();
  }

  function resolveBasePath() {
    return "";
  }

  function loadVersion() {
    if (!cachedVersionPromise) {
      cachedVersionPromise = fetch(VERSION_URL, { cache: "no-store" })
        .then((response) => {
          if (!response.ok) return null;
          return response.json();
        })
        .catch(() => null);
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

    return loadVersion().then((info) => {
      if (!info) return null;

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
        const buildLabel = getFirstValue(info, BUILD_KEYS);
        if (buildLabel) {
          document.querySelectorAll(resolvedSelectors.build).forEach((el) => {
            el.textContent = buildLabel;
          });
        }
      }

      if (resolvedSelectors.copyright) {
        const copyrightLabel = getFirstValue(info, COPYRIGHT_KEYS);
        if (copyrightLabel) {
          document.querySelectorAll(resolvedSelectors.copyright).forEach((el) => {
            el.textContent = copyrightLabel;
          });
        }
      }

      if (resolvedSelectors.owner) {
        const ownerLabel = getFirstValue(info, OWNER_KEYS);
        if (ownerLabel) {
          document.querySelectorAll(resolvedSelectors.owner).forEach((el) => {
            el.textContent = ownerLabel;
          });
        }
      }

      return info;
    });
  }

  window.Versioning = {
    loadVersion,
    formatDisplayVersion,
    formatFooterVersion,
    resolveBasePath,
    applyVersionToElements
  };
})();
