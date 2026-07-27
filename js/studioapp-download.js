(() => {
  "use strict";

  const ACCESS_URL = "/api/downloads/studioapp/access-state";
  const UNLOCK_URL = "/api/downloads/studioapp/unlock";
  const LOCK_URL = "/api/downloads/studioapp/lock";
  const RELEASE_URL = "/api/downloads/studioapp/release";
  const LATEST_URL = "/api/downloads/studioapp/latest";
  const BANNER_KEY = "streamsuites.studioapp.downloadBanner.dismissed";
  const $ = (id) => document.getElementById(id);
  const downloadActions = [...document.querySelectorAll("#studioapp-download-action, #release-download-action")];
  const actionNote = $("download-action-note");
  const releaseCard = $("studioapp-release-card");
  const modal = $("download-access-modal");
  const modalPanel = modal?.querySelector(".auth-modal");
  const bypassGate = $("download-bypass-gate");
  const bypassForm = $("download-bypass-form");
  const bypassInput = $("download-bypass-code");
  const bypassFeedback = $("download-bypass-feedback");
  const liveStatus = $("download-live-status");
  const banner = $("download-lockout-banner");
  const releaseFieldIds = [
    "release-version",
    "release-build",
    "release-system-version",
    "release-system-build",
    "release-size",
    "release-published",
    "release-signature",
  ];
  let lastFocus = null;
  let accessState = {
    locked: true,
    authorized: false,
    bypass_enabled: false,
    show_banner: false,
    message: "Download access could not be verified.",
  };

  function announce(message) {
    if (liveStatus) liveStatus.textContent = message;
  }

  function setDownloadEnabled(enabled, release = null) {
    downloadActions.forEach((action) => {
      action.setAttribute("aria-disabled", String(!enabled));
      if (enabled) {
        action.href = release?.controlled_download_url || LATEST_URL;
        action.removeAttribute("tabindex");
        action.textContent = "Download for Windows";
      } else {
        action.removeAttribute("href");
        action.tabIndex = 0;
        action.textContent = release?.access_locked ? "Download locked" : "Download unavailable";
      }
    });
  }

  function setReleaseState(label, tone = "") {
    const state = $("release-state");
    if (!state) return;
    state.textContent = label;
    state.className = `download-status-chip${tone ? ` download-status-chip--${tone}` : ""}`;
  }

  function setReleaseLoading() {
    releaseCard?.classList.add("is-loading");
    releaseCard?.setAttribute("aria-busy", "true");
    releaseFieldIds.forEach((id) => {
      const field = $(id);
      if (field) field.textContent = "Loading";
    });
    $("release-summary").textContent = "Validating the canonical release manifest and installer metadata.";
    $("release-sha").textContent = "Release metadata has not loaded yet.";
    $("copy-release-sha").disabled = true;
    $("copy-release-feedback").textContent = "";
    $("release-notes-link").hidden = true;
    setReleaseState("Checking");
    setDownloadEnabled(false);
  }

  function setReleaseUnavailable(label, message, tone = "unavailable") {
    releaseCard?.classList.remove("is-loading");
    releaseCard?.setAttribute("aria-busy", "false");
    releaseFieldIds.forEach((id) => {
      const field = $(id);
      if (field) field.textContent = "Unavailable";
    });
    $("release-summary").textContent = message;
    $("release-sha").textContent = "Release metadata unavailable";
    $("copy-release-sha").disabled = true;
    $("copy-release-feedback").textContent = "";
    $("release-notes-link").hidden = true;
    setReleaseState(label, tone);
    setDownloadEnabled(false);
  }

  function openModal() {
    if (!modal) return;
    lastFocus = document.activeElement;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    requestAnimationFrame(() => (accessState.bypass_enabled ? bypassInput : $("return-to-download-page"))?.focus());
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    lastFocus?.focus?.();
  }

  function renderAccess() {
    const locked = accessState.locked && !accessState.authorized;
    $("download-access-message").textContent = accessState.message || "StudioApp downloads are temporarily limited.";
    bypassGate.hidden = !(locked && accessState.bypass_enabled);

    if (banner) {
      const dismissed = sessionStorage.getItem(BANNER_KEY) === accessState.message;
      banner.hidden = !(accessState.locked && accessState.show_banner && !dismissed);
      $("download-banner-message").textContent = accessState.message || "StudioApp ALPHA download access is temporarily limited.";
    }

    $("end-download-session").hidden = !(accessState.locked && accessState.authorized);
    if (locked) {
      actionNote.textContent = "The download is locked. Approved testers may use the server-validated access code when enabled.";
      openModal();
    } else {
      actionNote.textContent = "Access is available. Validating the current release before enabling the installer download.";
      closeModal();
    }
  }

  function formatBytes(value) {
    const bytes = Number(value);
    if (!Number.isFinite(bytes) || bytes <= 0) return "Not reported";
    const units = ["B", "KB", "MB", "GB"];
    const index = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
    return `${(bytes / (1024 ** index)).toFixed(index ? 1 : 0)} ${units[index]}`;
  }

  function formatPublished(value) {
    if (!value) return "Not reported";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Not reported" : date.toLocaleString();
  }

  function renderRelease(release) {
    releaseCard?.classList.remove("is-loading");
    releaseCard?.setAttribute("aria-busy", "false");
    $("release-version").textContent = release.version || "Not reported";
    $("release-build").textContent = release.build || "Not reported";
    $("release-system-version").textContent = release.system_version || "Not reported";
    $("release-system-build").textContent = release.system_build || "Not reported";
    $("release-size").textContent = formatBytes(release.installer_size);
    $("release-published").textContent = formatPublished(release.published_at);
    $("release-signature").textContent = release.signed ? (release.signature_subject || "Signed") : "Unsigned ALPHA";
    $("release-summary").textContent = release.summary || "The current release manifest passed server-side validation.";
    $("release-sha").textContent = release.installer_sha256;
    $("copy-release-sha").disabled = false;
    setReleaseState(release.access_locked ? "Locked" : "Available", release.access_locked ? "pending" : "available");
    const notes = $("release-notes-link");
    if (release.release_notes_url) {
      notes.href = release.release_notes_url;
      notes.hidden = false;
    } else {
      notes.hidden = true;
    }
    setDownloadEnabled(release.download_available === true, release);
    actionNote.textContent = release.access_locked
      ? "The current release is validated and visible. Download remains locked until tester access is authorized."
      : "Release metadata is validated server-side before the installer download begins.";
  }

  async function loadRelease() {
    setReleaseLoading();
    try {
      const response = await fetch(RELEASE_URL, {
        credentials: "same-origin",
        headers: { Accept: "application/json" },
      });
      const payload = await response.json();
      if (!response.ok || payload?.available !== true) throw new Error(payload?.diagnostic || "release_unavailable");
      renderRelease(payload);
      announce("Current StudioApp ALPHA release metadata loaded.");
    } catch {
      setReleaseUnavailable("Unavailable", "The current release manifest could not be validated. Download remains unavailable.");
      actionNote.textContent = "The current release manifest could not be validated. Download remains unavailable.";
      announce("StudioApp release metadata is unavailable.");
    }
  }

  async function loadAccess() {
    try {
      const response = await fetch(ACCESS_URL, {
        credentials: "same-origin",
        headers: { Accept: "application/json" },
      });
      const payload = await response.json();
      if (!response.ok || typeof payload?.locked !== "boolean") throw new Error("access_unavailable");
      accessState = payload;
    } catch {
      accessState = {
        locked: true,
        authorized: false,
        bypass_enabled: false,
        show_banner: false,
        message: "Download access could not be verified. The download remains locked.",
      };
    }
    renderAccess();
    await loadRelease();
  }

  bypassForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const code = bypassInput.value;
    bypassFeedback.textContent = "Checking access…";
    bypassFeedback.dataset.tone = "";
    try {
      const response = await fetch(UNLOCK_URL, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ code }),
      });
      const payload = await response.json();
      if (!response.ok || payload?.authorized !== true) throw new Error("unlock_failed");
      bypassInput.value = "";
      accessState.authorized = true;
      bypassFeedback.textContent = "Access unlocked.";
      bypassFeedback.dataset.tone = "success";
      renderAccess();
      await loadRelease();
      announce("StudioApp download access unlocked.");
    } catch {
      bypassFeedback.textContent = "The access code was not accepted.";
      bypassFeedback.dataset.tone = "error";
      bypassInput.select();
    }
  });

  downloadActions.forEach((action) => {
    action.addEventListener("click", (event) => {
      if (action.getAttribute("aria-disabled") !== "true") return;
      event.preventDefault();
      if (accessState.locked && !accessState.authorized) openModal();
      else announce("The StudioApp download remains unavailable because release metadata did not validate.");
    });
  });

  $("close-download-access")?.addEventListener("click", closeModal);
  $("return-to-download-page")?.addEventListener("click", closeModal);
  modal?.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });

  document.addEventListener("keydown", (event) => {
    if (!modal?.classList.contains("is-open")) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeModal();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = [...modal.querySelectorAll('button:not([hidden]):not([disabled]),input:not([hidden]):not([disabled]),a[href]')]
      .filter((node) => node.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  $("dismiss-download-banner")?.addEventListener("click", () => {
    sessionStorage.setItem(BANNER_KEY, accessState.message || "dismissed");
    banner.hidden = true;
  });

  $("copy-release-sha")?.addEventListener("click", async () => {
    const button = $("copy-release-sha");
    const feedback = $("copy-release-feedback");
    try {
      await navigator.clipboard.writeText($("release-sha").textContent);
      button.textContent = "Copied";
      feedback.textContent = "SHA-256 copied to the clipboard.";
      announce("Installer SHA-256 copied.");
      window.setTimeout(() => {
        button.textContent = "Copy hash";
      }, 1800);
    } catch {
      feedback.textContent = "SHA-256 could not be copied. Select the hash to copy it manually.";
      announce("Installer SHA-256 could not be copied.");
    }
  });

  $("end-download-session")?.addEventListener("click", async () => {
    try {
      await fetch(LOCK_URL, { method: "POST", credentials: "same-origin" });
    } finally {
      accessState.authorized = false;
      renderAccess();
      announce("Tester download session ended.");
    }
  });

  loadAccess();
})();
