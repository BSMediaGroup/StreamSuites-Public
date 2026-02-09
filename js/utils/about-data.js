(() => {
  "use strict";

  const ABOUT_BASE = "/about";
  const MANIFEST_FILE = "about.manifest.json";
  const REQUIRED_ABOUT_SOURCES = [
    "about_part1_core.json",
    "about_part2_platforms_interfaces.json",
    "about_part3_about_system_spec.json"
  ];
  const ABOUT_URLS = {
    "about.manifest.json": () => new URL("/about/about.manifest.json", window.location.origin).href,
    "about_part1_core.json": () => new URL("/about/about_part1_core.json", window.location.origin).href,
    "about_part2_platforms_interfaces.json": () => new URL("/about/about_part2_platforms_interfaces.json", window.location.origin).href,
    "about_part3_about_system_spec.json": () => new URL("/about/about_part3_about_system_spec.json", window.location.origin).href
  };

  function resolveJsonUrl(path) {
    try {
      return new URL(path, window.location.origin).toString();
    } catch {
      return String(path || "");
    }
  }

  function resolveAboutSource(path) {
    if (!path) return "";
    const raw = String(path).trim();
    if (/^(https?:)?\/\//.test(raw)) return raw;
    const normalized = raw.replace(/^\/+/, "");
    if (ABOUT_URLS[normalized]) return ABOUT_URLS[normalized]();
    if (normalized.startsWith("about/")) {
      const key = normalized.replace(/^about\//, "");
      if (ABOUT_URLS[key]) return ABOUT_URLS[key]();
    }
    return "";
  }

  async function fetchJson(url) {
    const resolvedUrl = resolveJsonUrl(url);
    console.info(`[AboutData] Fetch URL: ${resolvedUrl}`);
    const response = await fetch(resolvedUrl, { cache: "no-store" });
    console.info(`[AboutData] Response status for ${resolvedUrl}: ${response.status}`);
    if (!response.ok) {
      console.error(`[AboutData] Failed to fetch ${resolvedUrl} (HTTP ${response.status})`);
      throw new Error(`HTTP ${response.status}`);
    }
    try {
      return await response.json();
    } catch (err) {
      console.error(`[AboutData] JSON parse failed for ${resolvedUrl}: ${err?.message || "Unknown parse error"}`);
      throw err;
    }
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
      const manifest = await fetchJson(ABOUT_URLS[MANIFEST_FILE]());
      Object.assign(payload, extractMeta(manifest));

      const sources = Array.isArray(manifest?.sources) && manifest.sources.length
        ? manifest.sources
        : REQUIRED_ABOUT_SOURCES;
      const sections = [];

      for (const source of sources) {
        const sourcePath = resolveAboutSource(source);
        if (!sourcePath) {
          payload.errors.push({
            source,
            message: "Unsupported source path"
          });
          continue;
        }
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
      console.error(`[AboutData] Manifest load failed for ${ABOUT_URLS[MANIFEST_FILE]()}: ${err?.message || "Unknown error"}`);
      payload.errors.push({
        source: MANIFEST_FILE,
        message: err?.message || "Unable to load manifest"
      });
    }

    return payload;
  }

  window.AboutData = {
    load,
    buildUrl: (path) => resolveAboutSource(path),
    resolveBasePath: () => ABOUT_BASE
  };
})();
