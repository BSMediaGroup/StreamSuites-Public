(() => {
  "use strict";

  function identifierFromPath(pathname) {
    const match = String(pathname || "").match(/^\/wheels\/([^/?#]+)\/stage\/?$/i);
    if (!match) return "";
    try { return decodeURIComponent(match[1]); } catch (_error) { return match[1]; }
  }

  function normalizeLookup(value) {
    return String(value || "").trim().toLowerCase();
  }

  async function resolveOwnerState(item) {
    const apiBase = String(window.StreamSuitesWheelWorkspace?.constants?.API_BASE || "https://api.streamsuites.app").replace(/\/$/, "");
    try {
      const response = await fetch(`${apiBase}/api/public/me`, { credentials: "include", cache: "no-store", headers: { Accept: "application/json" } });
      if (!response.ok) return false;
      const payload = await response.json();
      const accountId = String(payload?.account?.id || payload?.account_id || "").trim();
      const ownerId = String(item?.ownerAccountId || item?.owner_account_id || item?.creator?.accountId || item?.creator?.account_id || "").trim();
      return Boolean(accountId && ownerId && accountId === ownerId);
    } catch (_error) {
      return false;
    }
  }

  async function boot() {
    const host = document.getElementById("wheel-stage-app");
    const identifier = identifierFromPath(window.location.pathname);
    if (!host || !identifier || !window.StreamSuitesPublicData || !window.StreamSuitesWheelWorkspace) {
      if (host) host.innerHTML = '<section class="wheel-stage-error"><h1>Stage unavailable</h1><p>The wheel identifier or shared stage runtime is missing.</p></section>';
      return;
    }
    try {
      const data = await window.StreamSuitesPublicData.loadAll();
      const requested = window.StreamSuitesPublicData.normalizeArtifactLookup?.(identifier) || normalizeLookup(identifier);
      const item = (data.wheels || []).find((wheel) =>
        String(wheel?.id || "") === identifier ||
        String(wheel?.routeId || "") === identifier ||
        (Array.isArray(wheel?.routeKeys) && wheel.routeKeys.includes(requested))
      );
      if (!item) throw new Error("Public wheel not found.");
      const isOwner = await resolveOwnerState(item);
      host.replaceChildren(window.StreamSuitesWheelWorkspace.createWorkspace(item, {
        stageMode: true,
        isOwner,
        sessionId: new URLSearchParams(window.location.search).get("session") || ""
      }));
      document.title = `${item.title || "Wheel"} Stage · StreamSuites`;
    } catch (error) {
      host.innerHTML = "";
      const section = document.createElement("section");
      section.className = "wheel-stage-error";
      const heading = document.createElement("h1");
      heading.textContent = "Stage unavailable";
      const copy = document.createElement("p");
      copy.textContent = error instanceof Error ? error.message : "The public wheel could not be loaded.";
      section.append(heading, copy);
      host.appendChild(section);
    }
  }

  window.addEventListener("DOMContentLoaded", () => { void boot(); }, { once: true });
})();
