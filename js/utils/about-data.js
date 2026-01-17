(() => {
  "use strict";

  const ABOUT_BASE = "/about";
  const MANIFEST_FILE = "about.manifest.json";

  function normalizePath(path) {
    if (!path) return ABOUT_BASE;
    if (/^(https?:)?\/\//.test(path)) return path;
    const trimmed = String(path).replace(/^\/+/, "");
    return `${ABOUT_BASE}/${trimmed}`.replace(/\/+/g, "/");
  }

  async function fetchJson(url) {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
  }

  function extractMeta(manifest) {
    return {
      version: manifest?.version || "",
      build: manifest?.build || "",
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

      const sources = Array.isArray(manifest?.sources) ? manifest.sources : [];
      const sections = [];

      for (const source of sources) {
        try {
          const data = await fetchJson(normalizePath(source));
          if (Array.isArray(data?.sections)) {
            sections.push(...data.sections);
          }
        } catch (err) {
          payload.errors.push({
            source,
            message: err?.message || "Unable to load source"
          });
        }
      }

      payload.sections = sections;
    } catch (err) {
      payload.errors.push({
        source: MANIFEST_FILE,
        message: err?.message || "Unable to load manifest"
      });
    }

    return payload;
  }

  window.AboutData = {
    load,
    buildUrl: normalizePath,
    resolveBasePath: () => ABOUT_BASE
  };
})();
