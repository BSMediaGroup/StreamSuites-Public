(() => {
  "use strict";

  const ABOUT_BASE = "/about";
  const MANIFEST_FILE = "about.manifest.json";
  const REQUIRED_ABOUT_SOURCES = [
    "about_part1_core.json",
    "about_part2_platforms_interfaces.json",
    "about_part3_about_system_spec.json"
  ];

  function resolveJsonUrl(path) {
    try {
      return new URL(path, window.location.origin).toString();
    } catch {
      return String(path || "");
    }
  }

  function normalizePath(path) {
    if (!path) return ABOUT_BASE;
    if (/^(https?:)?\/\//.test(path)) return path;
    const raw = String(path).trim();
    if (raw.startsWith("/about/")) return raw;
    const trimmed = raw.replace(/^\/+/, "");
    return `${ABOUT_BASE}/${trimmed}`;
  }

  async function fetchJson(url) {
    const resolvedUrl = resolveJsonUrl(url);
    const response = await fetch(resolvedUrl, { cache: "no-store" });
    if (!response.ok) {
      console.error(`[AboutData] Failed to fetch ${resolvedUrl} (HTTP ${response.status})`);
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
  }

  function extractMeta(manifest) {
    return {
      version: "",
      build: "",
      lastUpdated: manifest?.lastUpdated || manifest?.updated || ""
    };
  }

  async function load() {
    const payload = {
      version: "",
      build: "",
      lastUpdated: "",
      sections: [],
      errors: []
    };

    try {
      const manifest = await fetchJson(normalizePath(MANIFEST_FILE));
      Object.assign(payload, extractMeta(manifest));

      const sources = Array.isArray(manifest?.sources) && manifest.sources.length
        ? manifest.sources
        : REQUIRED_ABOUT_SOURCES;
      const sections = [];

      for (const source of sources) {
        const sourcePath = normalizePath(source);
        try {
          const data = await fetchJson(sourcePath);
          if (Array.isArray(data?.sections)) {
            sections.push(...data.sections);
          }
        } catch (err) {
          console.error(`[AboutData] Source load failed for ${resolveJsonUrl(sourcePath)}: ${err?.message || "Unknown error"}`);
          payload.errors.push({
            source,
            message: err?.message || "Unable to load source"
          });
        }
      }

      payload.sections = sections;
    } catch (err) {
      console.error(`[AboutData] Manifest load failed for ${resolveJsonUrl(normalizePath(MANIFEST_FILE))}: ${err?.message || "Unknown error"}`);
      payload.errors.push({
        source: MANIFEST_FILE,
        message: err?.message || "Unable to load manifest"
      });
    }

    return payload;
  }

  window.AboutData = {
    load,
    buildUrl: (path) => resolveJsonUrl(normalizePath(path)),
    resolveBasePath: () => ABOUT_BASE
  };
})();
