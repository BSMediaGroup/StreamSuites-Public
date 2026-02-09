(() => {
  const REQUESTS_API_URL = "https://api.streamsuites.app/api/public/requests";
  const ME_API_URL = "https://api.streamsuites.app/api/me";
  const CREATOR_REQUESTS_API_URL = "https://api.streamsuites.app/api/creator/requests";
  const PUBLIC_REQUEST_COMMENTS_API_BASE = "https://api.streamsuites.app/api/public/requests";
  const CREATOR_REQUEST_COMMENTS_API_BASE = "https://api.streamsuites.app/api/creator/requests";
  const AUTH_BRIDGE_URL = "/auth-bridge.html";
  const REQUESTS_LOGIN_URL = "https://streamsuites.app/requests-login.html";
  const REQUESTS_RETURN_TO_URL = "https://streamsuites.app/requests.html";
  const REQUESTS_LOGIN_POPUP_TARGET = "ss_public_auth_login";
  const REQUESTS_LOGIN_POPUP_FEATURES = "popup=yes,width=560,height=760";
  const POPUP_LAUNCHED_STORAGE_KEY = "ss_requests_popup_launched";
  const POPUP_BLOCKED_STORAGE_KEY = "ss_requests_popup_blocked";
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
  const requestCommentsTemplateEl = document.getElementById("request-comments-template");

  if (!listEl || !emptyEl || !loadingEl) return;

  let sortMode = "new";
  let requests = [];
  const votingInFlight = new Set();
  let submitInFlight = false;
  let meStatusPromise = null;
  const commentsByRequestId = new Map();
  const commentAuthState = {
    authenticated: false,
    isCreator: false,
    resolved: false
  };

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

  function readCommentCount(raw) {
    const candidates = [
      raw?.comment_count,
      raw?.comments_count,
      raw?.commentCount,
      raw?.commentsCount,
      raw?.request?.comment_count,
      raw?.request?.comments_count,
      raw?.request?.commentCount,
      raw?.request?.commentsCount
    ];

    for (const value of candidates) {
      const numeric = Number(value);
      if (Number.isFinite(numeric) && numeric >= 0) {
        return numeric;
      }
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
      commentCount: readCommentCount(raw) ?? 0,
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

  function normalizeComment(raw) {
    if (!raw || typeof raw !== "object") return null;

    const body = String(raw.body || raw.comment || raw.text || "").trim();
    if (!body) return null;

    const createdAt = raw.created_at || raw.createdAt || raw.posted_at || raw.postedAt || null;
    return {
      id: String(raw.id || raw.comment_id || raw.commentId || `${createdAt || Date.now()}-${body.slice(0, 12)}`),
      body,
      creatorDisplayName: String(
        raw.creator_display_name ||
        raw.created_by_display_name ||
        raw.creator_name ||
        raw.creator?.display_name ||
        raw.creator?.name ||
        raw.creator ||
        "Creator"
      ),
      createdAt
    };
  }

  function normalizeCommentsPayload(payload) {
    const rows =
      payload?.comments ||
      payload?.items ||
      payload?.data?.comments ||
      payload?.data?.items ||
      payload?.data ||
      (Array.isArray(payload) ? payload : []);

    if (!Array.isArray(rows)) return [];
    return rows.map(normalizeComment).filter(Boolean);
  }

  function getCommentState(requestId) {
    const key = String(requestId);
    if (!commentsByRequestId.has(key)) {
      commentsByRequestId.set(key, {
        expanded: false,
        loading: false,
        loaded: false,
        loadError: "",
        postError: "",
        postInFlight: false,
        draft: "",
        items: []
      });
    }
    return commentsByRequestId.get(key);
  }

  function syncCommentStateWithRequests() {
    const validIds = new Set(requests.map((request) => request.id));
    for (const requestId of commentsByRequestId.keys()) {
      if (!validIds.has(requestId)) {
        commentsByRequestId.delete(requestId);
      }
    }
  }

  function safeCommentCount(count) {
    const numeric = Number(count);
    return Number.isFinite(numeric) && numeric >= 0 ? numeric : 0;
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

    const commentState = getCommentState(request.id);

    const commentsSection = requestCommentsTemplateEl?.content?.firstElementChild
      ? requestCommentsTemplateEl.content.firstElementChild.cloneNode(true)
      : document.createElement("section");

    if (!commentsSection.className) {
      commentsSection.className = "request-comments-block";
    }

    let commentsToggle = commentsSection.querySelector('[data-action="toggle-comments"]');
    if (!commentsToggle) {
      commentsToggle = document.createElement("button");
      commentsToggle.type = "button";
      commentsToggle.className = "request-comments-toggle";
      commentsToggle.dataset.action = "toggle-comments";
      commentsSection.appendChild(commentsToggle);
    }

    let commentsContainer = commentsSection.querySelector(".request-comments");
    if (!commentsContainer) {
      commentsContainer = document.createElement("div");
      commentsContainer.className = "request-comments request-comments-panel";
      commentsContainer.hidden = true;
      commentsSection.appendChild(commentsContainer);
    }

    commentsToggle.dataset.requestId = request.id;
    commentsContainer.dataset.requestId = request.id;
    commentsToggle.setAttribute("aria-expanded", commentState.expanded ? "true" : "false");
    commentsToggle.textContent = `Comments (${safeCommentCount(request.commentCount)})`;
    commentsToggle.addEventListener("click", () => {
      toggleCommentsSection(request.id);
    });
    commentsContainer.hidden = !commentState.expanded;

    let commentsList = commentsContainer.querySelector(".comments-list");
    if (!commentsList) {
      commentsList = document.createElement("div");
      commentsList.className = "comments-list request-comments-list";
      commentsContainer.appendChild(commentsList);
    }

    let commentsStatus = commentsContainer.querySelector(".comments-status");
    if (!commentsStatus) {
      commentsStatus = document.createElement("div");
      commentsStatus.className = "comments-status request-comments-status";
      commentsContainer.appendChild(commentsStatus);
    }

    let commentForm = commentsContainer.querySelector(".comment-form");
    if (!commentForm) {
      commentForm = document.createElement("div");
      commentForm.className = "comment-form request-comment-composer";
      commentsContainer.appendChild(commentForm);
    }

    commentsList.innerHTML = "";
    commentsStatus.hidden = true;
    commentsStatus.classList.remove("request-comments-status-error");
    commentsStatus.textContent = "";
    commentForm.innerHTML = "";

    if (commentState.expanded) {
      if (commentState.loading) {
        commentsStatus.hidden = false;
        commentsStatus.textContent = "Loading comments...";
      } else if (commentState.loadError) {
        commentsStatus.hidden = false;
        commentsStatus.classList.add("request-comments-status-error");
        commentsStatus.textContent = "Unable to load comments.";
      } else if (!commentState.items.length) {
        commentsStatus.hidden = false;
        commentsStatus.textContent = "No comments yet.";
      } else {
        const list = document.createElement("ul");
        list.className = "request-comments-list";

        commentState.items.forEach((comment) => {
          const item = document.createElement("li");
          item.className = "request-comment-item";

          const commentMeta = document.createElement("div");
          commentMeta.className = "request-comment-meta";

          const author = document.createElement("span");
          author.className = "request-comment-author";
          author.textContent = comment.creatorDisplayName;

          const created = document.createElement("span");
          created.className = "request-comment-created";
          created.textContent = parseDateLabel(comment.createdAt);

          commentMeta.append(author, created);

          const text = document.createElement("p");
          text.className = "request-comment-body";
          text.textContent = comment.body;

          item.append(commentMeta, text);
          list.appendChild(item);
        });

        commentsList.appendChild(list);
      }

      if (commentAuthState.isCreator) {
        const textarea = document.createElement("textarea");
        textarea.className = "request-comment-input";
        textarea.rows = 3;
        textarea.placeholder = "Write a comment...";
        textarea.value = commentState.draft;
        textarea.disabled = commentState.postInFlight;
        textarea.addEventListener("input", (event) => {
          commentState.draft = String(event.target?.value || "");
          if (commentState.postError) {
            commentState.postError = "";
            renderRequests();
          }
        });

        const actions = document.createElement("div");
        actions.className = "request-comment-actions";

        const submit = document.createElement("button");
        submit.type = "button";
        submit.className = "ss-btn secondary request-comment-submit";
        submit.disabled = commentState.postInFlight;
        submit.textContent = commentState.postInFlight ? "Posting..." : "Post comment";
        submit.addEventListener("click", () => {
          handleCommentSubmit(request.id);
        });

        actions.appendChild(submit);
        commentForm.append(textarea, actions);
      } else {
        const textarea = document.createElement("textarea");
        textarea.className = "request-comment-input";
        textarea.rows = 3;
        textarea.placeholder = "Creator login required to comment.";
        textarea.disabled = true;

        const hint = document.createElement("p");
        hint.className = "request-comment-login-hint";
        hint.textContent = "Creator login required to comment.";

        commentForm.append(textarea, hint);
      }

      if (commentState.postError) {
        const postError = document.createElement("p");
        postError.className = "request-comment-error";
        postError.textContent = commentState.postError;
        commentForm.appendChild(postError);
      }
    }

    body.append(titleRow, content, meta, voteRow, voteError, commentsSection);
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

  async function loadCommentsForRequest(requestId) {
    const state = getCommentState(requestId);
    if (state.loading || state.loaded) return;

    state.loading = true;
    state.loadError = "";
    renderRequests();

    try {
      const response = await fetch(
        `${PUBLIC_REQUEST_COMMENTS_API_BASE}/${encodeURIComponent(requestId)}/comments`,
        {
          method: "GET",
          cache: "no-store",
          headers: { Accept: "application/json" }
        }
      );

      if (!response.ok) {
        throw new Error(`Comment list failed with status ${response.status}`);
      }

      let payload = [];
      try {
        payload = await response.json();
      } catch (error) {
        payload = [];
      }

      state.items = normalizeCommentsPayload(payload);
      state.loaded = true;
      state.loadError = "";

      const request = requests.find((entry) => entry.id === String(requestId));
      if (request) {
        request.commentCount = state.items.length;
      }
    } catch (error) {
      state.loadError = "Unable to load comments.";
    } finally {
      state.loading = false;
      renderRequests();
    }
  }

  function toggleCommentsSection(requestId) {
    const state = getCommentState(requestId);
    state.expanded = !state.expanded;
    renderRequests();

    if (state.expanded && !state.loaded && !state.loading) {
      loadCommentsForRequest(requestId);
    }
  }

  async function handleCommentSubmit(requestId) {
    const state = getCommentState(requestId);
    if (state.postInFlight || !commentAuthState.isCreator) return;

    const body = String(state.draft || "").trim();
    if (!body) {
      state.postError = "Comment cannot be empty.";
      renderRequests();
      return;
    }

    state.postInFlight = true;
    state.postError = "";
    renderRequests();

    try {
      const response = await fetch(
        `${CREATOR_REQUEST_COMMENTS_API_BASE}/${encodeURIComponent(requestId)}/comments`,
        {
          method: "POST",
          cache: "no-store",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ body })
        }
      );

      if (!response.ok) {
        let message = "Unable to post comment.";
        try {
          const failure = await response.json();
          const parsed = parseApiError(failure);
          if (parsed) message = parsed;
        } catch (error) {
          // Keep default message for non-JSON responses.
        }
        throw new Error(message);
      }

      let payload = null;
      try {
        payload = await response.json();
      } catch (error) {
        payload = null;
      }

      const appended = normalizeComment(
        payload?.comment ||
        payload?.data?.comment ||
        payload?.data ||
        payload
      ) || {
        id: `local-${Date.now()}`,
        body,
        creatorDisplayName: "Creator",
        createdAt: new Date().toISOString()
      };

      state.items.push(appended);
      state.loaded = true;
      state.draft = "";
      state.postError = "";

      const request = requests.find((entry) => entry.id === String(requestId));
      if (request) {
        request.commentCount = state.items.length;
      }
    } catch (error) {
      state.postError = error instanceof Error && error.message
        ? error.message
        : "Unable to post comment.";
    } finally {
      state.postInFlight = false;
      renderRequests();
    }
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
    const title = String(submitTitleInputEl.value || "");
    const body = String(submitBodyInputEl.value || "");
    if (!title.trim() && !body.trim()) {
      clearDraft();
      return;
    }
    writeDraft({ title, body });
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

  function primeCommentAuthState() {
    fetchMeStatus(false)
      .then((me) => {
        commentAuthState.authenticated = Boolean(me?.authenticated);
        commentAuthState.isCreator = Boolean(me?.authenticated && me?.isCreator);
      })
      .catch(() => {
        commentAuthState.authenticated = false;
        commentAuthState.isCreator = false;
      })
      .finally(() => {
        commentAuthState.resolved = true;
        renderRequests();
      });
  }

  function buildCreatorLoginUrl() {
    const endpoint = new URL(AUTH_BRIDGE_URL, window.location.origin);
    endpoint.searchParams.set("return_to", REQUESTS_RETURN_TO_URL);
    return endpoint.toString();
  }

  function buildRequestsLoginUrl() {
    const endpoint = new URL(REQUESTS_LOGIN_URL);
    endpoint.searchParams.set("return_to", REQUESTS_RETURN_TO_URL);
    return endpoint.toString();
  }

  function safeSessionStorageSet(key, value) {
    try {
      window.sessionStorage.setItem(key, value);
    } catch (error) {
      // Ignore storage failures in restricted contexts.
    }
  }

  function safeSessionStorageRemove(key) {
    try {
      window.sessionStorage.removeItem(key);
    } catch (error) {
      // Ignore storage failures in restricted contexts.
    }
  }

  function openRequestsLoginPopup() {
    const loginUrl = buildRequestsLoginUrl();
    const popup = window.open(
      loginUrl,
      REQUESTS_LOGIN_POPUP_TARGET,
      REQUESTS_LOGIN_POPUP_FEATURES
    );
    if (!popup) return null;
    try {
      popup.name = "ss_requests_auth";
    } catch (error) {
      // Ignore cross-origin timing issues when setting window.name.
    }
    return popup;
  }

  function redirectToCreatorLogin({ popupAttempted = false, popupWindow = null } = {}) {
    captureDraftFromForm();
    if (popupAttempted) {
      if (popupWindow) {
        safeSessionStorageSet(POPUP_LAUNCHED_STORAGE_KEY, "1");
        safeSessionStorageRemove(POPUP_BLOCKED_STORAGE_KEY);
      } else {
        safeSessionStorageSet(POPUP_BLOCKED_STORAGE_KEY, "1");
        safeSessionStorageRemove(POPUP_LAUNCHED_STORAGE_KEY);
      }
    } else {
      safeSessionStorageRemove(POPUP_LAUNCHED_STORAGE_KEY);
      safeSessionStorageRemove(POPUP_BLOCKED_STORAGE_KEY);
    }
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

  function parseApiError(payload) {
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

  function parseSubmitError(payload) {
    return parseApiError(payload);
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

  async function onSubmitRequestClicked() {
    hideSubmitFeedback();
    captureDraftFromForm();
    const knownCreator =
      commentAuthState.resolved &&
      commentAuthState.authenticated &&
      commentAuthState.isCreator;

    let popupAttempted = false;
    let popupWindow = null;
    if (!knownCreator) {
      popupAttempted = true;
      popupWindow = openRequestsLoginPopup();
    }

    const canSubmit = await ensureCreatorAccess({ redirectOnFailure: false });
    if (!canSubmit) {
      redirectToCreatorLogin({ popupAttempted, popupWindow });
      return;
    }

    if (popupWindow && !popupWindow.closed) {
      try {
        popupWindow.close();
      } catch (error) {
        // Ignore popup close failures.
      }
    }

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
        captureDraftFromForm();
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
    const canSubmit = await ensureCreatorAccess({ redirectOnFailure: false });
    if (!canSubmit) return;
    restoreDraftIntoForm();
    openSubmitPanel();
  }

  function initializeSubmissionFlow() {
    if (!submitCtaEl || !submitPanelEl || !submitFormEl || !submitTitleInputEl || !submitBodyInputEl) {
      return;
    }

    submitCtaEl.addEventListener("click", onSubmitRequestClicked);
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
      syncCommentStateWithRequests();
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

  function initializePage() {
    if (sortEl) {
      sortEl.addEventListener("change", (event) => {
        sortMode = event.target?.value === "trending" ? "trending" : "new";
        fetchRequests();
      });
    }
    primeCommentAuthState();
    fetchRequests();
    initializeSubmissionFlow();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializePage, { once: true });
  } else {
    initializePage();
  }
})();
