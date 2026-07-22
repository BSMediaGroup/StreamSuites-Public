(() => {
  "use strict";
  const ACCESS_URL = "/api/downloads/studioapp/access-state";
  const UNLOCK_URL = "/api/downloads/studioapp/unlock";
  const LOCK_URL = "/api/downloads/studioapp/lock";
  const LATEST_URL = "/api/downloads/studioapp/latest";
  const BANNER_KEY = "streamsuites.studioapp.downloadBanner.dismissed";
  const $ = (id) => document.getElementById(id);
  const download = $("studioapp-download-action");
  const actionNote = $("download-action-note");
  const modal = $("download-access-modal");
  const modalPanel = modal?.querySelector(".auth-modal");
  const bypassGate = $("download-bypass-gate");
  const bypassForm = $("download-bypass-form");
  const bypassInput = $("download-bypass-code");
  const bypassFeedback = $("download-bypass-feedback");
  const liveStatus = $("download-live-status");
  const banner = $("download-lockout-banner");
  let lastFocus = null;
  let accessState = { locked: true, authorized: false, bypass_enabled: false, show_banner: false, message: "Download access could not be verified." };

  function announce(message) { if (liveStatus) liveStatus.textContent = message; }
  function setDownloadEnabled(enabled) {
    download.setAttribute("aria-disabled", String(!enabled));
    if (enabled) { download.href = LATEST_URL; download.removeAttribute("tabindex"); }
    else { download.removeAttribute("href"); download.tabIndex = -1; }
  }
  function openModal() {
    if (!modal) return;
    lastFocus = document.activeElement;
    modal.classList.add("is-open"); modal.setAttribute("aria-hidden", "false"); document.body.classList.add("modal-open");
    requestAnimationFrame(() => (accessState.bypass_enabled ? bypassInput : $("return-to-download-page"))?.focus());
  }
  function closeModal() {
    if (!modal) return;
    modal.classList.remove("is-open"); modal.setAttribute("aria-hidden", "true"); document.body.classList.remove("modal-open");
    lastFocus?.focus?.();
  }
  function renderAccess() {
    const locked = accessState.locked && !accessState.authorized;
    setDownloadEnabled(!locked);
    $("download-access-message").textContent = accessState.message || "StudioApp downloads are temporarily limited.";
    bypassGate.hidden = !(locked && accessState.bypass_enabled);
    if (banner) {
      const dismissed = sessionStorage.getItem(BANNER_KEY) === accessState.message;
      banner.hidden = !(accessState.locked && accessState.show_banner && !dismissed);
      $("download-banner-message").textContent = accessState.message || "StudioApp ALPHA download access is temporarily limited.";
    }
    actionNote.textContent = locked ? "The normal download action is locked. Approved testers may use the server-validated access code when enabled." : "Release metadata is validated server-side before the installer download begins.";
    $("end-download-session").hidden = !(accessState.locked && accessState.authorized);
    if (locked) openModal(); else closeModal();
  }
  function formatBytes(value) {
    const bytes = Number(value); if (!Number.isFinite(bytes) || bytes <= 0) return "—";
    const units = ["B", "KB", "MB", "GB"]; const index = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
    return `${(bytes / (1024 ** index)).toFixed(index ? 1 : 0)} ${units[index]}`;
  }
  function renderRelease(release) {
    $("release-version").textContent = release.version || "—"; $("release-build").textContent = release.build || "—";
    $("release-size").textContent = formatBytes(release.installer_size); $("release-published").textContent = release.published_at ? new Date(release.published_at).toLocaleString() : "Not reported";
    $("release-signature").textContent = release.signed ? (release.signature_subject || "Signed") : "Unsigned ALPHA";
    $("release-sha").textContent = release.installer_sha256; $("copy-release-sha").disabled = false;
    $("release-state").textContent = "Available";
    const notes = $("release-notes-link"); if (release.release_notes_url) { notes.href = release.release_notes_url; notes.hidden = false; }
  }
  async function loadRelease() {
    if (accessState.locked && !accessState.authorized) return;
    try {
      const response = await fetch(`${LATEST_URL}?metadata=1`, { credentials: "same-origin", headers: { Accept: "application/json" } });
      const payload = await response.json(); if (!response.ok || !payload?.release) throw new Error("release_unavailable");
      renderRelease(payload.release); announce("Current StudioApp ALPHA release metadata loaded.");
    } catch { $("release-state").textContent = "Unavailable"; actionNote.textContent = "The current release manifest could not be validated. Download remains unavailable."; setDownloadEnabled(false); }
  }
  async function loadAccess() {
    try {
      const response = await fetch(ACCESS_URL, { credentials: "same-origin", headers: { Accept: "application/json" } });
      const payload = await response.json(); if (!response.ok || typeof payload?.locked !== "boolean") throw new Error("access_unavailable");
      accessState = payload;
    } catch { accessState = { locked: true, authorized: false, bypass_enabled: false, show_banner: false, message: "Download access could not be verified. The download remains locked." }; }
    renderAccess(); await loadRelease();
  }
  bypassForm?.addEventListener("submit", async (event) => {
    event.preventDefault(); const code = bypassInput.value; bypassFeedback.textContent = "Checking access…"; bypassFeedback.dataset.tone = "";
    try {
      const response = await fetch(UNLOCK_URL, { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ code }) });
      const payload = await response.json(); if (!response.ok || payload?.authorized !== true) throw new Error("unlock_failed");
      bypassInput.value = ""; accessState.authorized = true; bypassFeedback.textContent = "Access unlocked."; bypassFeedback.dataset.tone = "success"; renderAccess(); await loadRelease(); announce("StudioApp download access unlocked.");
    } catch { bypassFeedback.textContent = "The access code was not accepted."; bypassFeedback.dataset.tone = "error"; bypassInput.select(); }
  });
  download?.addEventListener("click", (event) => { if (download.getAttribute("aria-disabled") === "true") { event.preventDefault(); openModal(); } });
  $("close-download-access")?.addEventListener("click", closeModal); $("return-to-download-page")?.addEventListener("click", closeModal);
  modal?.addEventListener("click", (event) => { if (event.target === modal) closeModal(); });
  document.addEventListener("keydown", (event) => {
    if (!modal?.classList.contains("is-open")) return;
    if (event.key === "Escape") { event.preventDefault(); closeModal(); return; }
    if (event.key !== "Tab") return;
    const focusable = [...modal.querySelectorAll('button:not([hidden]):not([disabled]),input:not([hidden]):not([disabled]),a[href]')].filter((node) => node.offsetParent !== null);
    if (!focusable.length) return; const first = focusable[0]; const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  $("dismiss-download-banner")?.addEventListener("click", () => { sessionStorage.setItem(BANNER_KEY, accessState.message || "dismissed"); banner.hidden = true; });
  $("copy-release-sha")?.addEventListener("click", async () => { try { await navigator.clipboard.writeText($("release-sha").textContent); announce("Installer SHA-256 copied."); } catch { announce("Installer SHA-256 could not be copied."); } });
  $("end-download-session")?.addEventListener("click", async () => { await fetch(LOCK_URL, { method: "POST", credentials: "same-origin" }); accessState.authorized = false; renderAccess(); announce("Tester download session ended."); });
  loadAccess();
})();
