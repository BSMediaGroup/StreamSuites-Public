(() => {
  "use strict";

  const CREATOR_WHEELS_PATH = "/api/creator/wheels";
  const PUBLIC_WHEELS_PATH = "/api/public/wheels";

  function resolveApiBase() {
    const configured = window.StreamSuitesPublicConfig?.AUTH_API_BASE || window.StreamSuitesAuth?.apiBaseUrl;
    if (typeof configured === "string" && configured.trim()) return configured.trim().replace(/\/$/, "");
    const host = String(window.location?.hostname || "").trim().toLowerCase();
    if (host === "localhost" || host === "127.0.0.1") return "http://127.0.0.1:18087";
    return "https://api.streamsuites.app";
  }

  const apiBase = resolveApiBase();

  function safeResponseText(value) {
    const normalized = String(value || "").replace(/\s+/g, " ").trim();
    if (!normalized || /<(?:!doctype|html|head|body)\b/i.test(normalized)) return "";
    return normalized.slice(0, 300);
  }

  async function parseResponse(response) {
    const text = await response.text();
    if (!text) return {};
    try {
      const payload = JSON.parse(text);
      return payload && typeof payload === "object" ? payload : {};
    } catch (_error) {
      const message = safeResponseText(text);
      return message ? { success: false, error: { code: "wheel_http_error", message } } : {};
    }
  }

  function normalizedError(payload, status) {
    const raw = payload?.error;
    const code = String(raw?.code || payload?.code || "wheel_request_failed").trim() || "wheel_request_failed";
    let message = safeResponseText(raw?.message || (typeof raw === "string" ? raw : "") || payload?.message);
    if ((status === 404 && !message) || /^not found$/i.test(message)) {
      message = "Wheel service route is unavailable on the connected Runtime";
    }
    if (!message) message = `Wheel request failed (${status || "network"})`;
    const error = new Error(message);
    error.name = "WheelApiError";
    error.status = Number(status) || 0;
    error.code = /^not found$/i.test(safeResponseText(raw?.message || raw)) ? "wheel_route_unavailable" : code;
    error.field = raw?.field || payload?.field || null;
    error.details = raw?.details || payload?.details || null;
    error.payload = payload;
    return error;
  }

  async function request(path, options = {}) {
    let response;
    const headers = { Accept: "application/json", ...(options.headers || {}) };
    const init = {
      method: options.method || "GET",
      cache: "no-store",
      credentials: "include",
      headers,
      ...(options.signal ? { signal: options.signal } : {})
    };
    if (Object.prototype.hasOwnProperty.call(options, "json")) {
      headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(options.json);
    } else if (options.body !== undefined) {
      init.body = options.body;
    }
    try {
      response = await fetch(`${apiBase}${path}`, init);
    } catch (cause) {
      const error = new Error("Wheel service could not be reached");
      error.name = "WheelApiError";
      error.status = 0;
      error.code = cause?.name === "AbortError" ? "request_cancelled" : "wheel_network_error";
      error.cause = cause;
      throw error;
    }
    const payload = await parseResponse(response);
    if (!response.ok || payload?.success === false) throw normalizedError(payload, response.status);
    return payload;
  }

  function creatorPath(path = "") {
    const suffix = String(path || "");
    return `${CREATOR_WHEELS_PATH}${suffix && !suffix.startsWith("?") && !suffix.startsWith("/") ? "/" : ""}${suffix}`;
  }

  function requestCreator(path = "", options = {}) {
    return request(creatorPath(path), options);
  }

  function listPublic(options = {}) {
    return request(PUBLIC_WHEELS_PATH, options);
  }

  function listOwned(query = "?summary=1&limit=50&offset=0", options = {}) {
    return requestCreator(query, options);
  }

  function createWheelSet(payload, options = {}) {
    return requestCreator("", { ...options, method: "POST", json: payload });
  }

  function importWheelSet(payload, options = {}) {
    return requestCreator("/import", { ...options, method: "POST", json: payload });
  }

  function getArtifact(artifactCode, options = {}) {
    return requestCreator(`/${encodeURIComponent(artifactCode)}`, options);
  }

  function updateArtifact(artifactCode, payload, options = {}) {
    return requestCreator(`/${encodeURIComponent(artifactCode)}`, { ...options, method: "PATCH", json: payload });
  }

  function exportArtifact(artifactCode, options = {}) {
    return requestCreator(`/${encodeURIComponent(artifactCode)}/export`, options);
  }

  function importWheel(artifactCode, payload, options = {}) {
    return requestCreator(`/${encodeURIComponent(artifactCode)}/wheels/import`, { ...options, method: "POST", json: payload });
  }

  function exportWheel(artifactCode, wheelId, options = {}) {
    return requestCreator(`/${encodeURIComponent(artifactCode)}/wheels/${encodeURIComponent(wheelId)}/export`, options);
  }

  function uploadMedia(artifactCode, wheelId, kind, file, options = {}) {
    if (!new Set(["center-image", "stage-background-image"]).has(kind)) {
      return Promise.reject(new Error("Unsupported wheel media operation"));
    }
    const form = new FormData();
    form.append("file", file);
    return requestCreator(`/${encodeURIComponent(artifactCode)}/wheels/${encodeURIComponent(wheelId)}/${kind}`, {
      ...options,
      method: "POST",
      body: form
    });
  }

  function supports(service, feature) {
    return service?.schema_version === "streamsuites.wheel-set.v2" && service?.features?.[feature] === true;
  }

  window.StreamSuitesWheelApi = Object.freeze({
    apiBase,
    creatorPath,
    request,
    requestCreator,
    listPublic,
    listOwned,
    createWheelSet,
    importWheelSet,
    getArtifact,
    updateArtifact,
    exportArtifact,
    importWheel,
    exportWheel,
    uploadMedia,
    supports,
    publicEventsUrl: `${apiBase}${PUBLIC_WHEELS_PATH}/events`
  });
})();
