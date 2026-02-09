(() => {
  const REQUESTS_API_URL = "https://api.streamsuites.app/api/public/requests";
  const VOTE_TOKEN_STORAGE_KEY = "ss_vote_token";
  const BODY_PREVIEW_LIMIT = 320;

  const listEl = document.getElementById("requests-list");
  const emptyEl = document.getElementById("requests-empty");
  const loadingEl = document.getElementById("requests-loading");
  const loadErrorEl = document.getElementById("requests-error");
  const sortEl = document.getElementById("request-sort");

  if (!listEl || !emptyEl || !loadingEl) return;

  let sortMode = "new";
  let requests = [];
  const votingInFlight = new Set();

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

  document.addEventListener("DOMContentLoaded", fetchRequests);
})();
