(() => {
  const REQUESTS_API_URL = "https://api.streamsuites.app/api/public/requests";
  const ME_API_URL = "https://api.streamsuites.app/api/me";
  const CREATOR_REQUESTS_API_URL = "https://api.streamsuites.app/api/creator/requests";
  const CREATOR_LOGIN_URL = "https://api.streamsuites.app/auth/login/google?surface=creator";
  const REQUESTS_RETURN_TO_URL = "https://streamsuites.app/requests.html";
  const VOTE_TOKEN_STORAGE_KEY = "ss_vote_token";
  const REQUEST_DRAFT_STORAGE_KEY = "ss_requests_draft";
  const BODY_PREVIEW_LIMIT = 320;

  const listEl = document.getElementById("requests-list");
  const emptyEl = document.getElementById("requests-empty");
  const loadingEl = document.getElementById("requests-loading");
  const loadErrorEl = document.getElementById("requests-error");
  const sortEl = document.getElementById("request-sort");
  const submitCtaEl = document.getElementById("requests-submit-cta");
  const submitPanelEl = document.getElementById("requests-submit-panel");
  const submitFormEl = document.getElementById("requests-submit-form");
  const submitTitleInputEl = document.getElementById("requests-submit-title");
  const submitBodyInputEl = document.getElementById("requests-submit-body");
  const submitTitleErrorEl = document.getElementById("requests-submit-title-error");
  const submitBodyErrorEl = document.getElementById("requests-submit-body-error");
  const submitErrorEl = document.getElementById("requests-submit-error");
  const submitSuccessEl = document.getElementById("requests-submit-success");
  const submitCancelEl = document.getElementById("requests-submit-cancel");
  const submitConfirmEl = document.getElementById("requests-submit-confirm");

  if (!listEl || !emptyEl || !loadingEl) return;

  let sortMode = "new";
  let requests = [];
  const votingInFlight = new Set();
  let submitInFlight = false;
  let meStatusPromise = null;

  function getVoteToken() {
    try {
      return window.localStorage.getItem(VOTE_TOKEN_STORAGE_KEY) || "";
    } catch (err) {
      return "";
    }
  }

  function setVoteToken(token) {
    if (!token || typeof token !== "string") return;
    try {
      window.localStorage.setItem(VOTE_TOKEN_STORAGE_KEY, token);
    } catch (err) {
      // Ignore storage errors in restricted contexts.
    }
  }

  function jsonHeaders() {
    const headers = { Accept: "application/json" };
    const voteToken = getVoteToken();
    if (voteToken) {
      headers["X-Vote-Token"] = voteToken;
    }
    return headers;
  }

  function parseDateLabel(value) {
    if (!value) return "Unknown date";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString(undefined, { hour12: false });
  }

  function parseDateTimestamp(value) {
    if (!value) return 0;
    const timestamp = Date.parse(value);
    return Number.isFinite(timestamp) ? timestamp : 0;
  }

  function truncateBody(value) {
    const text = String(value || "").trim();
    if (!text) return "No details provided yet.";
    if (text.length <= BODY_PREVIEW_LIMIT) return text;
    const preview = text.slice(0, BODY_PREVIEW_LIMIT);
    const lastSpace = preview.lastIndexOf(" ");
    if (lastSpace > 120) {
      return `${preview.slice(0, lastSpace)}...`;
    }
    return `${preview}...`;
  }

  function readVoteCount(raw) {
    const candidates = [
      raw?.vote_count,
      raw?.votes,
      raw?.upvotes,
      raw?.voteCount,
      raw?.request?.vote_count,
      raw?.request?.votes,
      raw?.request?.upvotes,
      raw?.request?.voteCount
    ];

    for (const value of candidates) {
      const numeric = Number(value);
      if (Number.isFinite(numeric) && numeric >= 0) {
        return numeric;
      }
    }
    return null;
  }

  function readVoteState(raw) {
    const candidates = [
      raw?.has_voted,
      raw?.hasVoted,
      raw?.request?.has_voted,
      raw?.request?.hasVoted
    ];
    for (const value of candidates) {
      if (typeof value === "boolean") return value;
    }
    return null;
  }

  function normalizeRequest(raw) {
    if (!raw || typeof raw !== "object") return null;
    const id = raw.id || raw.request_id || raw.requestId;
    if (!id) return null;

    const createdAt = raw.created_at || raw.createdAt || raw.submitted_at || raw.submittedAt || null;
    const implementedAt = raw.implemented_at || raw.implementedAt || null;

    return {
      id: String(id),
      title: String(raw.title || raw.request_title || "Untitled request"),
      body: String(raw.body || raw.description || raw.summary || ""),
      voteCount: readVoteCount(raw) ?? 0,
      hasVoted: Boolean(readVoteState(raw)),
      creatorDisplayName: String(
        raw.creator_display_name ||
        raw.created_by_display_name ||
        raw.creator_name ||
        raw.creator?.display_name ||
        raw.creator?.name ||
        raw.creator ||
        "Creator"
      ),
      createdAt,
      createdTimestamp: parseDateTimestamp(createdAt),
      implementedAt,
      voteError: ""
    };
  }

  function normalizePayload(payload) {
    const rows =
      payload?.requests ||
      payload?.items ||
      payload?.data ||
      (Array.isArray(payload) ? payload : []);

    if (!Array.isArray(rows)) return [];
    return rows.map(normalizeRequest).filter(Boolean);
  }

  function getOrderedRequests() {
    if (sortMode === "trending") {
      return requests.slice().sort((a, b) => (
        (b.voteCount - a.voteCount) ||
        (b.createdTimestamp - a.createdTimestamp)
      ));
    }
    return requests.slice().sort((a, b) => (
      (b.createdTimestamp - a.createdTimestamp) ||
      (b.voteCount - a.voteCount)
    ));
  }

  function buildRequestCard(request) {
    const card = document.createElement("article");
    card.className = "card request-card";
    card.dataset.requestId = request.id;

    const body = document.createElement("div");
    body.className = "card-body";

    const titleRow = document.createElement("div");
    titleRow.className = "request-title-row";

    const title = document.createElement("h3");
    title.className = "title";
    title.textContent = request.title;

    titleRow.appendChild(title);
    if (request.implementedAt) {
      const implemented = document.createElement("span");
      implemented.className = "request-implemented";
      implemented.textContent = "Implemented";
      titleRow.appendChild(implemented);
    }

    const content = document.createElement("p");
    content.className = "request-body";
    content.textContent = truncateBody(request.body);

    const meta = document.createElement("div");
    meta.className = "meta-row";

    const creator = document.createElement("span");
    creator.textContent = request.creatorDisplayName;

    const divider = document.createElement("span");
    divider.className = "divider";
    divider.textContent = "•";

    const createdAt = document.createElement("span");
    createdAt.textContent = `Created ${parseDateLabel(request.createdAt)}`;

    meta.append(creator, divider, createdAt);

    const voteRow = document.createElement("div");
    voteRow.className = "request-vote-row";

    const voteCount = document.createElement("span");
    voteCount.className = "request-vote-count";
    voteCount.textContent = `${request.voteCount} vote${request.voteCount === 1 ? "" : "s"}`;

    const voteButton = document.createElement("button");
    voteButton.type = "button";
    voteButton.className = "ss-btn secondary request-upvote-btn";
    const isVoting = votingInFlight.has(request.id);
    if (request.hasVoted) {
      voteButton.classList.add("is-voted");
      voteButton.textContent = "Voted";
      voteButton.disabled = true;
      voteButton.setAttribute("aria-pressed", "true");
    } else if (isVoting) {
      voteButton.textContent = "Voting...";
      voteButton.disabled = true;
      voteButton.setAttribute("aria-pressed", "false");
    } else {
      voteButton.textContent = "Upvote";
      voteButton.disabled = false;
      voteButton.setAttribute("aria-pressed", "false");
      voteButton.addEventListener("click", () => {
        handleVote(request.id);
      });
    }

    voteRow.append(voteCount, voteButton);

    const voteError = document.createElement("div");
    voteError.className = "request-vote-error";
    voteError.hidden = !request.voteError;
    voteError.textContent = request.voteError || "";

    body.append(titleRow, content, meta, voteRow, voteError);
    card.appendChild(body);
    return card;
  }

  function renderRequests() {
    listEl.innerHTML = "";

    const ordered = getOrderedRequests();
    if (!ordered.length) {
      emptyEl.hidden = false;
      return;
    }

    emptyEl.hidden = true;
    const fragment = document.createDocumentFragment();
    ordered.forEach((request) => {
      fragment.appendChild(buildRequestCard(request));
    });
    listEl.appendChild(fragment);
  }

  function captureTokenFromPayload(payload) {
    const nextToken = payload?.vote_token || payload?.voteToken || payload?.data?.vote_token || payload?.data?.voteToken;
    if (typeof nextToken === "string" && nextToken.length > 0) {
      setVoteToken(nextToken);
    }
  }

  function updateRequestFromVoteResponse(request, payload) {
    const voteCount = readVoteCount(payload);
    const hasVoted = readVoteState(payload);

    request.voteCount = voteCount == null ? request.voteCount + 1 : voteCount;
    request.hasVoted = hasVoted == null ? true : hasVoted;
    request.voteError = "";
  }

  function buildRequestsUrl() {
    const url = new URL(REQUESTS_API_URL);
    if (sortMode === "trending") {
      url.searchParams.set("sort", "trending");
    }
    return url.toString();
  }

  function safeStorageGet(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function safeStorageSet(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {
      // Ignore storage failures in restricted contexts.
    }
  }

  function safeStorageRemove(key) {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      // Ignore storage failures in restricted contexts.
    }
  }

  function readDraft() {
    const raw = safeStorageGet(REQUEST_DRAFT_STORAGE_KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return null;
      return {
        title: String(parsed.title || ""),
        body: String(parsed.body || "")
      };
    } catch (error) {
      return null;
    }
  }

  function writeDraft(draft) {
    if (!draft || typeof draft !== "object") return;
    safeStorageSet(REQUEST_DRAFT_STORAGE_KEY, JSON.stringify({
      title: String(draft.title || ""),
      body: String(draft.body || "")
    }));
  }

  function clearDraft() {
    safeStorageRemove(REQUEST_DRAFT_STORAGE_KEY);
  }

  function restoreDraftIntoForm() {
    if (!submitTitleInputEl || !submitBodyInputEl) return false;
    const draft = readDraft();
    if (!draft) return false;
    const hasData = Boolean(draft.title.trim() || draft.body.trim());
    if (!hasData) return false;
    submitTitleInputEl.value = draft.title;
    submitBodyInputEl.value = draft.body;
    return true;
  }

  function captureDraftFromForm() {
    if (!submitTitleInputEl || !submitBodyInputEl) return;
    writeDraft({
      title: submitTitleInputEl.value,
      body: submitBodyInputEl.value
    });
  }

  function hideSubmitFeedback() {
    if (submitErrorEl) {
      submitErrorEl.hidden = true;
      submitErrorEl.textContent = "";
    }
    if (submitSuccessEl) {
      submitSuccessEl.hidden = true;
    }
  }

  function setSubmitFieldError(field, message) {
    const target = field === "title" ? submitTitleErrorEl : submitBodyErrorEl;
    if (!target) return;
    target.textContent = message || "";
    target.hidden = !message;
  }

  function setSubmitError(message) {
    if (!submitErrorEl) return;
    submitErrorEl.textContent = message || "";
    submitErrorEl.hidden = !message;
  }

  function openSubmitPanel() {
    if (!submitPanelEl) return;
    submitPanelEl.hidden = false;
  }

  function closeSubmitPanel() {
    if (!submitPanelEl) return;
    submitPanelEl.hidden = true;
    setSubmitError("");
    setSubmitFieldError("title", "");
    setSubmitFieldError("body", "");
  }

  function setSubmitBusy(busy) {
    submitInFlight = Boolean(busy);
    if (submitTitleInputEl) submitTitleInputEl.disabled = submitInFlight;
    if (submitBodyInputEl) submitBodyInputEl.disabled = submitInFlight;
    if (submitConfirmEl) {
      submitConfirmEl.disabled = submitInFlight;
      submitConfirmEl.textContent = submitInFlight ? "Submitting..." : "Submit";
    }
    if (submitCancelEl) submitCancelEl.disabled = submitInFlight;
    if (submitCtaEl) submitCtaEl.disabled = submitInFlight;
  }

  function normalizeMe(payload) {
    const authenticatedCandidates = [
      payload?.authenticated,
      payload?.is_authenticated,
      payload?.isAuthenticated,
      payload?.data?.authenticated,
      payload?.data?.is_authenticated,
      payload?.data?.isAuthenticated
    ];

    const creatorCandidates = [
      payload?.is_creator,
      payload?.isCreator,
      payload?.creator,
      payload?.is_creator_user,
      payload?.data?.is_creator,
      payload?.data?.isCreator,
      payload?.data?.creator,
      payload?.data?.is_creator_user
    ];

    const authenticated = authenticatedCandidates.some((value) => value === true);
    const isCreator = creatorCandidates.some((value) => value === true);
    return { authenticated, isCreator };
  }

  async function fetchMeStatus(forceRefresh = false) {
    if (!forceRefresh && meStatusPromise) return meStatusPromise;

    meStatusPromise = (async () => {
      const response = await fetch(ME_API_URL, {
        method: "GET",
        cache: "no-store",
        credentials: "include",
        headers: { Accept: "application/json" }
      });

      if (!response.ok) {
        throw new Error(`Me request failed with status ${response.status}`);
      }

      const payload = await response.json();
      return normalizeMe(payload);
    })();

    try {
      return await meStatusPromise;
    } finally {
      if (forceRefresh) {
        meStatusPromise = null;
      }
    }
  }

  function buildCreatorLoginUrl() {
    const endpoint = new URL(CREATOR_LOGIN_URL);
    endpoint.searchParams.set("return_to", REQUESTS_RETURN_TO_URL);
    return endpoint.toString();
  }

  function redirectToCreatorLogin() {
    captureDraftFromForm();
    window.location.assign(buildCreatorLoginUrl());
  }

  async function ensureCreatorAccess({ redirectOnFailure = false } = {}) {
    try {
      const me = await fetchMeStatus(true);
      if (me.authenticated && me.isCreator) {
        return true;
      }
    } catch (error) {
      // Treat /api/me failures as unauthenticated.
    }

    if (redirectOnFailure) {
      redirectToCreatorLogin();
    }
    return false;
  }

  function parseSubmitError(payload) {
    const candidates = [
      payload?.error,
      payload?.message,
      payload?.detail,
      payload?.data?.error,
      payload?.data?.message
    ];

    for (const candidate of candidates) {
      if (typeof candidate === "string" && candidate.trim()) {
        return candidate.trim();
      }
    }
    return "";
  }

  function validateSubmitForm() {
    const title = String(submitTitleInputEl?.value || "").trim();
    const body = String(submitBodyInputEl?.value || "").trim();

    let isValid = true;
    if (!title) {
      isValid = false;
      setSubmitFieldError("title", "Title is required.");
    } else {
      setSubmitFieldError("title", "");
    }

    if (!body) {
      isValid = false;
      setSubmitFieldError("body", "Body is required.");
    } else {
      setSubmitFieldError("body", "");
    }

    return {
      isValid,
      title,
      body
    };
  }

  async function handleSubmitCtaClick() {
    hideSubmitFeedback();
    const canSubmit = await ensureCreatorAccess({ redirectOnFailure: true });
    if (!canSubmit) return;
    restoreDraftIntoForm();
    openSubmitPanel();
    if (submitTitleInputEl && !submitTitleInputEl.value.trim()) {
      submitTitleInputEl.focus();
    } else if (submitBodyInputEl && !submitBodyInputEl.value.trim()) {
      submitBodyInputEl.focus();
    }
  }

  async function handleRequestSubmit(event) {
    event.preventDefault();
    if (!submitFormEl || submitInFlight) return;

    hideSubmitFeedback();
    setSubmitError("");

    const validated = validateSubmitForm();
    if (!validated.isValid) return;

    const payload = {
      title: validated.title,
      body: validated.body
    };
    writeDraft(payload);
    setSubmitBusy(true);

    try {
      const response = await fetch(CREATOR_REQUESTS_API_URL, {
        method: "POST",
        cache: "no-store",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (response.status === 401 || response.status === 403) {
        redirectToCreatorLogin();
        return;
      }

      if (!response.ok) {
        let message = "Unable to submit your request right now.";
        try {
          const failure = await response.json();
          const parsed = parseSubmitError(failure);
          if (parsed) message = parsed;
        } catch (error) {
          // Leave default message for non-JSON responses.
        }
        throw new Error(message);
      }

      clearDraft();
      if (submitFormEl) submitFormEl.reset();
      closeSubmitPanel();
      if (submitSuccessEl) submitSuccessEl.hidden = false;
    } catch (error) {
      setSubmitError(error instanceof Error && error.message
        ? error.message
        : "Unable to submit your request right now.");
    } finally {
      setSubmitBusy(false);
    }
  }

  async function restoreDraftAfterLoginBounce() {
    const draft = readDraft();
    if (!draft || (!draft.title.trim() && !draft.body.trim())) return;
    const canSubmit = await ensureCreatorAccess({ redirectOnFailure: true });
    if (!canSubmit) return;
    restoreDraftIntoForm();
    openSubmitPanel();
  }

  function initializeSubmissionFlow() {
    if (!submitCtaEl || !submitPanelEl || !submitFormEl || !submitTitleInputEl || !submitBodyInputEl) {
      return;
    }

    submitCtaEl.addEventListener("click", handleSubmitCtaClick);
    submitFormEl.addEventListener("submit", handleRequestSubmit);

    submitTitleInputEl.addEventListener("input", () => {
      if (!submitTitleInputEl.value.trim()) {
        setSubmitFieldError("title", "Title is required.");
      } else {
        setSubmitFieldError("title", "");
      }
      captureDraftFromForm();
    });

    submitBodyInputEl.addEventListener("input", () => {
      if (!submitBodyInputEl.value.trim()) {
        setSubmitFieldError("body", "Body is required.");
      } else {
        setSubmitFieldError("body", "");
      }
      captureDraftFromForm();
    });

    if (submitCancelEl) {
      submitCancelEl.addEventListener("click", () => {
        closeSubmitPanel();
      });
    }

    restoreDraftAfterLoginBounce();
  }

  async function fetchRequests() {
    if (loadErrorEl) loadErrorEl.hidden = true;

    try {
      const response = await fetch(buildRequestsUrl(), {
        method: "GET",
        cache: "no-store",
        headers: jsonHeaders()
      });

      if (!response.ok) {
        throw new Error(`Request list failed with status ${response.status}`);
      }

      const payload = await response.json();
      captureTokenFromPayload(payload);
      requests = normalizePayload(payload);
      renderRequests();
    } catch (error) {
      if (loadErrorEl) loadErrorEl.hidden = false;
      emptyEl.hidden = false;
      emptyEl.textContent = "Unable to load requests right now.";
      listEl.innerHTML = "";
    } finally {
      loadingEl.hidden = true;
    }
  }

  async function handleVote(requestId) {
    const request = requests.find((entry) => entry.id === requestId);
    if (!request || request.hasVoted || votingInFlight.has(requestId)) return;

    request.voteError = "";
    votingInFlight.add(requestId);
    renderRequests();

    try {
      const response = await fetch(`${REQUESTS_API_URL}/${encodeURIComponent(requestId)}/vote`, {
        method: "POST",
        cache: "no-store",
        headers: jsonHeaders()
      });

      if (!response.ok) {
        throw new Error(`Vote failed with status ${response.status}`);
      }

      const payload = await response.json();
      captureTokenFromPayload(payload);
      updateRequestFromVoteResponse(request, payload);
    } catch (error) {
      request.voteError = "Unable to register vote right now.";
    } finally {
      votingInFlight.delete(requestId);
      renderRequests();
    }
  }

  if (sortEl) {
    sortEl.addEventListener("change", (event) => {
      sortMode = event.target?.value === "trending" ? "trending" : "new";
      fetchRequests();
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    fetchRequests();
    initializeSubmissionFlow();
  });
})();
