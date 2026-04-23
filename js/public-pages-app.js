(() => {
  const MEDIA_FILTERS = [
    { value: "clips", label: "Clips" },
    { value: "polls", label: "Polls" },
    { value: "wheels", label: "Wheels" },
    { value: "tallies", label: "Tallies" }
  ];

  const TYPE_TO_PAGE = {
    clips: "/clips",
    polls: "/polls",
    wheels: "/wheels",
    scoreboards: "/leaderboards",
    leaderboards: "/leaderboards",
    tallies: "/tallies"
  };

  const DETAIL_LAYOUT_STORAGE_KEY = "ss-public-detail-layout";
  const PROFILE_ARTIFACT_LAYOUT_STORAGE_KEY = "ss-public-profile-artifact-layout";
  const CURRENT_ORIGIN = String(window.location.origin || "").trim();
  function detectFallbackAuthApiBase() {
    const host = String(window.location.hostname || "").trim().toLowerCase();
    if (host === "localhost" || host === "127.0.0.1") {
      return "http://127.0.0.1:18087";
    }
    return /^https?:\/\//.test(CURRENT_ORIGIN) ? CURRENT_ORIGIN : "https://streamsuites.app";
  }
  const AUTH_API_BASE = (() => {
    const apiBaseUrl = window.StreamSuitesAuth?.apiBaseUrl;
    if (typeof apiBaseUrl === "string" && apiBaseUrl.trim()) {
      return apiBaseUrl.replace(/\/$/, "");
    }
    return detectFallbackAuthApiBase();
  })();
  const AUTH_ME_URL = `${AUTH_API_BASE}/api/public/me`;
  const AUTH_PUBLIC_PROFILE_URL = `${AUTH_API_BASE}/api/public/profile`;
  const AUTH_PUBLIC_PROFILE_ME_URL = `${AUTH_API_BASE}/api/public/profile/me`;
  const AUTH_PUBLIC_PROFILE_RESOLVE_URL = `${AUTH_API_BASE}/api/public/profile/resolve`;
  const AUTH_PUBLIC_AUTHORITY_REQUESTS_URL = `${AUTH_API_BASE}/api/public/authority/requests`;
  const AUTH_PUBLIC_AUTHORITY_REQUESTS_MINE_URL = `${AUTH_API_BASE}/api/public/authority/requests/mine`;
  const AUTH_PUBLIC_ARTIFACTS_URL = `${AUTH_API_BASE}/api/public/artifacts`;
  const PUBLIC_WHEEL_EVENTS_URL = `${AUTH_API_BASE}/api/public/wheels/events`;
  const AUTH_LOGOUT_URL = `${AUTH_API_BASE}/auth/logout`;
  const CREATOR_DASHBOARD_URL = "https://creator.streamsuites.app/";
  const CREATOR_LOGIN_URL = (() => {
    const url = new URL("/login/", CREATOR_DASHBOARD_URL);
    url.searchParams.set("return_to", CREATOR_DASHBOARD_URL);
    return url.toString();
  })();
  const CREATOR_SIGNUP_URL = CREATOR_LOGIN_URL;
  const ADMIN_DASHBOARD_URL = "https://admin.streamsuites.app";
  const PUBLIC_AUTH_COMPLETE_MESSAGE_TYPE = "ss_public_auth_complete";
  const CANONICAL_PROFILE_PREFIX = "/u/";
  const BADGE_ICON_MAP = Object.freeze({
    admin: "/assets/icons/tierbadge-admin.svg",
    core: "/assets/icons/tierbadge-core.svg",
    gold: "/assets/icons/tierbadge-gold.svg",
    pro: "/assets/icons/tierbadge-pro.svg",
    founder: "/assets/icons/founder-gold.svg",
    moderator: "/assets/icons/modgavel-blue.svg",
    developer: "/assets/icons/dev-green.svg"
  });
  const UI_ICON_MAP = Object.freeze({
    copy: "/assets/icons/ui/clipboard.svg",
    check: "/assets/icons/ui/tickyes.svg",
    layoutSide: "/assets/icons/ui/cards.svg",
    layoutStack: "/assets/icons/ui/tablechart.svg",
    gallery: "/assets/icons/ui/cards.svg",
    list: "/assets/icons/ui/tablechart.svg",
    edit: "/assets/icons/ui/cog.svg",
    share: "/assets/icons/ui/send.svg",
    visibility: "/assets/icons/ui/globe.svg",
    profile: "/assets/icons/ui/profile.svg",
    community: "/assets/icons/ui/community.svg",
    social: "/assets/icons/ui/integrations.svg",
    streamsuites: "/assets/icons/ui/streamsuitesicon.svg",
    findmehere: "/assets/icons/ui/findmehereicon.svg"
  });
  const STREAM_PLATFORM_LABELS = Object.freeze({
    rumble: "Rumble",
    youtube: "YouTube",
    twitch: "Twitch",
    kick: "Kick"
  });
  const STREAM_SOURCE_PRIORITY = Object.freeze(["rumble", "youtube", "twitch", "kick"]);
  const WHEEL_DEFAULT_AVATAR = "/assets/icons/ui/wheeluser.svg";
  const WHEEL_CENTER_DEFAULT = "/assets/placeholders/wheelcenterdefault.webp";
  const WHEEL_CENTER_ACCEPT = ".webp,.png,.jpg,.jpeg,.gif,.svg";
  const WHEEL_SOUND_BASE = "/assets/sounds/wheels";
  const WHEEL_SOUND_LIBRARY = Object.freeze({
    music: ["music0.mp3", "music1.mp3", "music2.mp3", "music3.mp3", "music4.mp3", "music5.mp3", "music6.mp3"],
    startspin: ["startspin0.mp3", "startspin1.mp3", "startspin2.mp3"],
    respin: ["respin0.mp3", "respin1.mp3"],
    click: ["click0.mp3", "click1.mp3", "click2.mp3", "click3.mp3", "click4.mp3", "click5.mp3", "click6.mp3"],
    winner: ["winner0.mp3", "winner1.mp3", "winner2.mp3", "winner3.mp3", "winner4.mp3", "winner5.mp3", "winner6.mp3"]
  });
  const CREATOR_WHEELS_API_URL = `${AUTH_API_BASE}/api/creator/wheels`;
  const CREATOR_WHEEL_ACCOUNT_LOOKUP_URL = `${AUTH_API_BASE}/api/creator/wheels/account-lookup`;
  const MEMBER_PAGE_SIZE = 20;
  const MEMBER_ALPHA_OPTIONS = Object.freeze([
    { value: "all", label: "All" },
    ...Array.from({ length: 26 }, (_, index) => {
      const letter = String.fromCharCode(65 + index);
      return { value: letter, label: letter };
    }),
    { value: "#", label: "#" }
  ]);
  const DEFAULT_PROFILE_COVER = "/assets/placeholders/defaultprofilecover.webp";
  let standaloneProfileCleanupFns = [];

  function registerStandaloneProfileCleanup(fn) {
    if (typeof fn === "function") standaloneProfileCleanupFns.push(fn);
  }

  function cleanupStandaloneProfileInteractions() {
    standaloneProfileCleanupFns.forEach((fn) => {
      try {
        fn();
      } catch (_err) {
        // Ignore cleanup failures from already-detached profile controls.
      }
    });
    standaloneProfileCleanupFns = [];
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener("load", () => resolve(String(reader.result || "")), { once: true });
      reader.addEventListener("error", () => reject(reader.error || new Error("Unable to read file.")), { once: true });
      reader.readAsDataURL(file);
    });
  }

  function getPublicBadgeUi() {
    return window.StreamSuitesPublicBadgeUi || null;
  }

  const PAGE_CONFIG = {
    "media-home": {
      path: "/media.html",
      aliases: ["/media", "/media/"],
      shellKind: "media",
      activeHref: "/media",
      topbarLabel: "Media Home",
      searchPlaceholder: "Search clips, polls, wheels, tallies",
      filterMode: "multi",
      filtersCollapsed: true,
      defaultFilters: ["clips", "polls", "wheels", "tallies"],
      showLockoutBanner: true,
      render: renderMediaHome
    },
    "media-clips": {
      path: "/clips.html",
      aliases: ["/clips", "/clips/"],
      shellKind: "media",
      activeHref: "/clips",
      topbarLabel: "Clips",
      searchPlaceholder: "Search clips",
      filterMode: "single-nav",
      filtersCollapsed: true,
      defaultFilters: ["clips"],
      showLockoutBanner: true,
      render: renderMediaList,
      listType: "clips"
    },
    "media-polls": {
      path: "/polls.html",
      aliases: ["/polls", "/polls/"],
      shellKind: "media",
      activeHref: "/polls",
      topbarLabel: "Polls",
      searchPlaceholder: "Search polls",
      filterMode: "single-nav",
      filtersCollapsed: true,
      defaultFilters: ["polls"],
      render: renderMediaList,
      listType: "polls"
    },
    "media-scoreboards": {
      path: "/scoreboards.html",
      aliases: ["/scoreboards", "/scoreboards/"],
      shellKind: "media",
      activeHref: "/leaderboards",
      topbarLabel: "Leaderboards",
      searchPlaceholder: "Search leaderboards",
      filterMode: "none",
      filtersCollapsed: true,
      defaultFilters: [],
      render: renderLeaderboardsPlaceholder
    },
    "media-leaderboards": {
      path: "/leaderboards.html",
      aliases: ["/leaderboards", "/leaderboards/"],
      shellKind: "media",
      activeHref: "/leaderboards",
      topbarLabel: "Leaderboards",
      searchPlaceholder: "Search leaderboards",
      filterMode: "none",
      filtersCollapsed: true,
      defaultFilters: [],
      render: renderLeaderboardsPlaceholder
    },
    "media-wheels": {
      path: "/wheels.html",
      aliases: ["/wheels", "/wheels/"],
      shellKind: "media",
      activeHref: "/wheels",
      topbarLabel: "Wheels",
      searchPlaceholder: "Search wheels",
      filterMode: "single-nav",
      filtersCollapsed: true,
      defaultFilters: ["wheels"],
      render: renderMediaList,
      listType: "wheels"
    },
    "media-tallies": {
      path: "/tallies.html",
      aliases: ["/tallies", "/tallies/"],
      shellKind: "media",
      activeHref: "/tallies",
      topbarLabel: "Tallies",
      searchPlaceholder: "Search tallies",
      filterMode: "single-nav",
      filtersCollapsed: true,
      defaultFilters: ["tallies"],
      render: renderMediaList,
      listType: "tallies"
    },
    "media-economy": {
      path: "/economy.html",
      shellKind: "media",
      activeHref: "/economy.html",
      topbarLabel: "Games / Economy",
      searchPlaceholder: "Search",
      hideSearch: true,
      filterMode: "none",
      filtersCollapsed: true,
      defaultFilters: [],
      render: renderGamesEconomyWorkspace
    },
    "detail-clip": {
      path: "/clips/detail.html",
      shellKind: "media",
      activeHref: "/clips",
      topbarLabel: "Clip Detail",
      searchPlaceholder: "Search",
      hideSearch: true,
      filterMode: "single-nav",
      filtersCollapsed: true,
      defaultFilters: ["clips"],
      render: renderDetail,
      detailType: "clips"
    },
    "detail-poll": {
      path: "/polls/detail.html",
      shellKind: "media",
      activeHref: "/polls",
      topbarLabel: "Poll Detail",
      searchPlaceholder: "Search",
      hideSearch: true,
      filterMode: "single-nav",
      filtersCollapsed: true,
      defaultFilters: ["polls"],
      render: renderDetail,
      detailType: "polls"
    },
    "detail-poll-results": {
      path: "/polls/results.html",
      shellKind: "media",
      activeHref: "/polls",
      topbarLabel: "Poll Results",
      searchPlaceholder: "Search",
      hideSearch: true,
      filterMode: "single-nav",
      filtersCollapsed: true,
      defaultFilters: ["polls"],
      render: renderPollResults,
      detailType: "polls"
    },
    "detail-scoreboard": {
      path: "/scoreboards/detail.html",
      shellKind: "media",
      activeHref: "/wheels",
      topbarLabel: "List View Detail",
      searchPlaceholder: "Search",
      hideSearch: true,
      filterMode: "none",
      filtersCollapsed: true,
      defaultFilters: [],
      render: renderDetail,
      detailType: "scoreboards"
    },
    "detail-wheel": {
      path: "/wheels/detail.html",
      shellKind: "media",
      activeHref: "/wheels",
      topbarLabel: "Wheel Detail",
      searchPlaceholder: "Search",
      hideSearch: true,
      filterMode: "single-nav",
      filtersCollapsed: true,
      defaultFilters: ["wheels"],
      render: renderDetail,
      detailType: "wheels"
    },
    "detail-tally": {
      path: "/tallies/detail.html",
      shellKind: "media",
      activeHref: "/tallies",
      topbarLabel: "Tally Detail",
      searchPlaceholder: "Search",
      hideSearch: true,
      filterMode: "single-nav",
      filtersCollapsed: true,
      defaultFilters: ["tallies"],
      render: renderDetail,
      detailType: "tallies"
    },
    "community-home": {
      path: "/community/index.html",
      aliases: ["/community", "/community/"],
      shellKind: "community",
      activeHref: "/community",
      topbarLabel: "Community",
      searchPlaceholder: "Search members and notices",
      filterMode: "none",
      filtersCollapsed: true,
      defaultFilters: [],
      showLockoutBanner: true,
      render: renderCommunityHome
    },
    "community-members": {
      path: "/community/members.html",
      shellKind: "community",
      activeHref: "/community/members.html",
      topbarLabel: "Members",
      searchPlaceholder: "Search members",
      filterMode: "none",
      filtersCollapsed: true,
      defaultFilters: [],
      render: renderCommunityMembers
    },
    "community-live": {
      path: "/live/index.html",
      aliases: ["/live", "/live/"],
      shellKind: "community",
      activeHref: "/live",
      topbarLabel: "Live",
      searchPlaceholder: "Search live creators",
      filterMode: "none",
      filtersCollapsed: true,
      defaultFilters: [],
      render: renderCommunityLive
    },
    "community-notices": {
      path: "/community/notices.html",
      shellKind: "community",
      activeHref: "/community/notices.html",
      topbarLabel: "Notices",
      searchPlaceholder: "Search notices",
      filterMode: "none",
      filtersCollapsed: true,
      defaultFilters: [],
      render: renderCommunityNotices
    },
    "community-profile": {
      path: "/community/profile.html",
      shellKind: "community",
      activeHref: "/community/members.html",
      topbarLabel: "Profile",
      searchPlaceholder: "Search",
      hideSearch: true,
      filterMode: "none",
      filtersCollapsed: true,
      defaultFilters: [],
      render: renderCommunityProfile
    },
    "community-settings": {
      path: "/community/settings.html",
      shellKind: "community",
      activeHref: "/community/settings.html",
      topbarLabel: "Account Settings",
      searchPlaceholder: "Search",
      hideSearch: true,
      filterMode: "none",
      filtersCollapsed: true,
      defaultFilters: [],
      render: renderCommunitySettings
    },
    "community-my-data": {
      path: "/community/my-data.html",
      shellKind: "community",
      activeHref: "/community/my-data.html",
      topbarLabel: "My Data",
      searchPlaceholder: "Search",
      hideSearch: true,
      filterMode: "none",
      filtersCollapsed: true,
      defaultFilters: [],
      render: renderCommunityMyData
    },
    "public-profile-standalone": {
      path: "/u/index.html",
      aliases: ["/u", "/u/"],
      shellKind: "public",
      activeHref: "/community/members.html",
      topbarLabel: "Public Profile",
      searchPlaceholder: "Search",
      hideSearch: true,
      filterMode: "none",
      filtersCollapsed: true,
      defaultFilters: [],
      standalone: true,
      render: renderStandaloneProfile
    }
  };

  const PAGE_ID_BY_PATH = Object.entries(PAGE_CONFIG).reduce((acc, [, cfg]) => {
    acc[normalizePath(cfg.path)] = cfg;
    (cfg.aliases || []).forEach((alias) => {
      acc[normalizePath(alias)] = cfg;
    });
    return acc;
  }, {});
  const ARTIFACT_ROUTE_CONFIG = Object.freeze([
    { prefix: "/clips/", pageId: "detail-clip", detailType: "clips" },
    { prefix: "/polls/", pageId: "detail-poll", detailType: "polls" },
    { prefix: "/wheels/", pageId: "detail-wheel", detailType: "wheels" },
    { prefix: "/scores/", pageId: "detail-scoreboard", detailType: "scoreboards" }
  ]);

  function resolveDefaultSidebarState(config) {
    if (!config || config.standalone) return "";
    return String(config.path || "").includes("/detail.html") ? "icon" : "";
  }

  function applyDocumentTitle(label, options = {}) {
    const productName = String(options.productName || "StreamSuites").trim() || "StreamSuites";
    const trimmed = String(label || "").trim();
    document.title = trimmed ? `${trimmed} | ${productName}` : productName;
  }

  function create(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (typeof text === "string") node.textContent = text;
    return node;
  }

  function createIcon(path, className = "inline-icon-mask") {
    const icon = create("span", className);
    icon.setAttribute("aria-hidden", "true");
    icon.style.setProperty("--icon-mask", `url("${String(path || "").trim()}")`);
    return icon;
  }

  function clear(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function norm(value) {
    return String(value || "").toLowerCase();
  }

  function normalizePath(pathname) {
    const raw = String(pathname || "/").trim() || "/";
    if (raw.length > 1 && raw.endsWith("/")) {
      return raw.slice(0, -1);
    }
    return raw;
  }

  function firstBoolean(...values) {
    for (const value of values) {
      if (typeof value === "boolean") return value;
    }
    return null;
  }

  function isCanonicalProfilePath(pathname) {
    const normalized = normalizePath(pathname);
    return normalized === "/u" || normalized === "/u/index.html" || normalized.startsWith(CANONICAL_PROFILE_PREFIX);
  }

  function decodePathSegment(value) {
    const raw = String(value || "").trim();
    if (!raw) return "";
    try {
      return decodeURIComponent(raw);
    } catch (_err) {
      return raw;
    }
  }

  function getProfileAliasSlug(pathname) {
    const normalized = normalizePath(pathname);
    const match = normalized.match(/^\/@([^\/?#]+)$/);
    if (!match) return "";
    return normalizeUserCode(decodePathSegment(match[1]), "");
  }

  function getCanonicalProfileAliasUrl(value, search = "", hash = "") {
    const source = value instanceof URL ? value : new URL(String(value || window.location.href), window.location.origin);
    const slug = getProfileAliasSlug(source.pathname);
    if (!slug) return null;
    const canonicalUrl = new URL(buildCanonicalProfileHref(slug), window.location.origin);
    canonicalUrl.search = source.search || search || "";
    canonicalUrl.hash = source.hash || hash || "";
    return canonicalUrl;
  }

  function isUuidLike(value) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || "").trim());
  }

  function normalizeSocialLinks(value) {
    const api = getSocialDataApi();
    if (typeof api?.normalizeSocialLinks === "function") {
      return api.normalizeSocialLinks(value);
    }
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    return Object.entries(value).reduce((acc, [key, raw]) => {
      const normalizedKey = String(key || "").trim().toLowerCase();
      const normalizedValue = String(raw || "").trim();
      if (!normalizedKey || !normalizedValue) return acc;
      acc[normalizedKey] = normalizedValue;
      return acc;
    }, {});
  }

  function buildFiltersForConfig(config) {
    if (config.filterMode === "none") return [];
    return MEDIA_FILTERS.map((filter) => ({
      ...filter,
      active: config.defaultFilters.includes(filter.value)
    }));
  }

  function matchesQuery(item, query) {
    const q = norm(query).trim();
    if (!q) return true;

    const haystack = [
      item.title,
      item.summary,
      item.question,
      item.platform,
      item.status,
      item.creator?.displayName,
      item.creator?.role
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(q);
  }

  function sliceRows(items, perRow, rows) {
    const size = Math.max(1, perRow) * Math.max(1, rows);
    return items.slice(0, size);
  }

  function toStatusClass(value) {
    return norm(value).replace(/[^a-z0-9]+/g, "-") || "pending";
  }

  function formatNumber(value) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return "0";
    return parsed.toLocaleString();
  }

  function getLiveStatus(profile) {
    return profile?.liveStatus && profile.liveStatus.isLive ? profile.liveStatus : null;
  }

  function buildLiveBadge(profile, options = {}) {
    const liveStatus = getLiveStatus(profile);
    if (!liveStatus) return null;
    const badge = create("span", options.compact ? "live-badge live-badge-compact" : "live-badge", "LIVE");
    badge.setAttribute("aria-label", `${liveStatus.providerLabel || "Live"} live now`);
    return getPublicBadgeUi()?.wrapTooltipTarget?.(
      badge,
      getPublicBadgeUi()?.resolveLiveLabel?.(liveStatus) || `${liveStatus.providerLabel || "Live"} live now`,
      { className: "ss-badge-tooltip-target ss-badge-tooltip-target--pill" }
    ) || badge;
  }

  function buildLiveSummary(profile) {
    const liveStatus = getLiveStatus(profile);
    if (!liveStatus) return "";
    const parts = [`${liveStatus.providerLabel || "Live"} live now`];
    if (liveStatus.viewerCount != null) {
      parts.push(`${formatNumber(liveStatus.viewerCount)} watching`);
    }
    return parts.join(" · ");
  }

  function buildProfileLiveBanner(profile) {
    const liveStatus = getLiveStatus(profile);
    if (!liveStatus) return null;
    const banner = create("section", "profile-live-banner");
    const heading = create("div", "profile-live-heading");
    heading.append(buildLiveBadge(profile), create("span", "profile-live-summary", buildLiveSummary(profile)));
    banner.appendChild(heading);
    if (liveStatus.title) {
      banner.appendChild(create("p", "profile-live-title", liveStatus.title));
    }
    if (liveStatus.url) {
      const link = create("a", "profile-live-link", "Watch stream");
      link.href = liveStatus.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      banner.appendChild(link);
    }
    return banner;
  }

  function normalizeLatestStreamSourcePayload(value) {
    if (!value || typeof value !== "object") return null;
    const platform = String(value.platform || value.source_platform || value.sourcePlatform || "").trim().toLowerCase();
    if (!Object.prototype.hasOwnProperty.call(STREAM_PLATFORM_LABELS, platform)) return null;
    const sourceUrl = String(value.source_url || value.sourceUrl || "").trim();
    const url = String(value.url || value.live_url || value.liveUrl || sourceUrl || "").trim();
    const channelHandle = String(value.channel_handle || value.channelHandle || "").trim();
    const configured = value.configured === true || Boolean(sourceUrl || url || channelHandle);
    if (!configured) return null;
    const viewerCount = value.viewer_count ?? value.viewerCount;
    return {
      platform,
      platformLabel: String(value.platform_label || value.platformLabel || STREAM_PLATFORM_LABELS[platform]).trim() || STREAM_PLATFORM_LABELS[platform],
      platformIcon: getStreamPlatformIconPath(platform),
      sourceUrl,
      channelHandle,
      configured,
      isLive: value.is_live === true || value.isLive === true,
      title: String(value.title || value.live_title || value.liveTitle || "").trim(),
      url,
      thumbnailUrl: String(value.thumbnail_url || value.thumbnailUrl || "").trim(),
      viewerCount: Number.isFinite(Number(viewerCount)) ? Number(viewerCount) : null,
      gameName: String(value.game_name || value.gameName || "").trim(),
      startedAt: String(value.started_at || value.startedAt || "").trim(),
      lastCheckedAt: String(value.last_checked_at || value.lastCheckedAt || "").trim(),
      status: String(value.status || "").trim()
    };
  }

  function normalizeLatestStreamPayload(value) {
    const primary = normalizeLatestStreamSourcePayload(value);
    if (!primary) return null;
    const seen = new Set([
      `${primary.platform}|${primary.url}|${primary.sourceUrl}`,
      `${primary.platform}|${primary.sourceUrl}|${primary.url}`
    ]);
    const alternateSources = (Array.isArray(value?.alternate_sources) ? value.alternate_sources : Array.isArray(value?.alternateSources) ? value.alternateSources : [])
      .map((entry) => normalizeLatestStreamSourcePayload(entry))
      .filter((entry) => {
        if (!entry) return false;
        if (!entry.url && !entry.sourceUrl) return false;
        const key = `${entry.platform}|${entry.url}|${entry.sourceUrl}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    return {
      ...primary,
      alternateSources
    };
  }

  function parseUrl(value) {
    try {
      return new URL(String(value || ""), window.location.origin);
    } catch (_err) {
      return null;
    }
  }

  function resolveYouTubeEmbedUrl(value) {
    const url = parseUrl(value);
    if (!url) return "";
    const host = url.hostname.replace(/^www\./i, "").toLowerCase();
    let videoId = "";
    if (host === "youtu.be") {
      videoId = url.pathname.split("/").filter(Boolean)[0] || "";
    } else if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
      const parts = url.pathname.split("/").filter(Boolean);
      if (url.searchParams.get("v")) videoId = url.searchParams.get("v") || "";
      else if (["embed", "live", "shorts"].includes(parts[0])) videoId = parts[1] || "";
    }
    videoId = String(videoId || "").trim().replace(/[^a-zA-Z0-9_-]/g, "");
    return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}?rel=0` : "";
  }

  function resolveTwitchEmbedUrl(stream) {
    const host = encodeURIComponent(window.location.hostname || "streamsuites.app");
    const url = parseUrl(stream?.url || stream?.sourceUrl || "");
    const pathParts = (url?.pathname || "").split("/").filter(Boolean);
    if (pathParts[0] === "videos" && pathParts[1]) {
      return `https://player.twitch.tv/?video=${encodeURIComponent(pathParts[1])}&parent=${host}`;
    }
    const channel = String(stream?.channelHandle || pathParts[0] || "").trim().replace(/^@+/, "").replace(/[^a-zA-Z0-9_]/g, "");
    return channel ? `https://player.twitch.tv/?channel=${encodeURIComponent(channel)}&parent=${host}` : "";
  }

  function resolveLatestStreamEmbedUrl(stream) {
    if (!stream?.isLive && !stream?.title) return "";
    if (stream.platform === "youtube") return resolveYouTubeEmbedUrl(stream.url || stream.sourceUrl);
    if (stream.platform === "twitch") return resolveTwitchEmbedUrl(stream);
    return "";
  }

  function buildStreamPlatformPill(stream, fallbackLabel = "Stream") {
    const pill = create("span", "profile-stream-platform");
    if (stream?.platform) {
      pill.append(createStreamPlatformIcon(stream.platform), create("span", "", stream.platformLabel || fallbackLabel));
      return pill;
    }
    pill.append(createStreamPlatformIcon("", "profile-stream-platform-icon profile-stream-platform-icon--fallback"), create("span", "", fallbackLabel));
    return pill;
  }

  function buildLatestStreamSourceButton(stream, label) {
    const href = String(stream?.url || stream?.sourceUrl || "").trim();
    const disabled = stream?.disabled === true || !href;
    const button = create(disabled ? "span" : "a", `profile-latest-stream-source-button${disabled ? " is-disabled" : ""}`);
    if (!disabled) {
      button.href = href;
      button.target = "_blank";
      button.rel = "noopener noreferrer";
    } else {
      button.setAttribute("aria-disabled", "true");
    }
    const platform = String(stream?.platform || "").trim().toLowerCase();
    const platformLabel = label || stream?.platformLabel || STREAM_PLATFORM_LABELS[platform] || "Source";
    button.append(
      createStreamPlatformIcon(platform, "profile-latest-stream-source-button-icon"),
      create("span", "", platformLabel)
    );
    return button;
  }

  function buildAvatar(profile) {
    const avatar = create("span", "creator-avatar");
    if (getLiveStatus(profile)) avatar.classList.add("is-live");
    const image = profile?.avatar;
    if (image) {
      avatar.style.backgroundImage = `url(${image})`;
      avatar.classList.add("has-image");
      avatar.textContent = "";
      return avatar;
    }

    const initial = (profile?.displayName || "Public User").trim().charAt(0).toUpperCase() || "P";
    avatar.textContent = initial;
    avatar.classList.add("is-fallback");
    return avatar;
  }

  function textInitial(value) {
    return String(value || "").trim().charAt(0).toUpperCase() || "P";
  }

  function setHoverDataAttr(node, name, value) {
    if (!node || !name) return;
    const text = String(value || "").trim();
    if (text) {
      node.setAttribute(name, text);
      return;
    }
    node.removeAttribute(name);
  }

  function setHoverJsonAttr(node, name, value) {
    if (!node || !name) return;
    if (value == null) {
      node.removeAttribute(name);
      return;
    }
    let text = "";
    try {
      text = JSON.stringify(value);
    } catch (_err) {
      text = "";
    }
    if (text && text !== "{}" && text !== "[]") {
      node.setAttribute(name, text);
      return;
    }
    node.removeAttribute(name);
  }

  function applyProfileHoverAttrs(node, profile) {
    if (!node || !profile || typeof profile !== "object") return;
    node.setAttribute("data-ss-profile-hover-trigger", "true");

    const profileHref = buildProfileHref(profile);
    const publicSlug = getCanonicalProfileSlug(profile, "");
    const userCode = String(profile.userCode || profile.username || profile.id || "").trim();
    const userId = String(profile.id || profile.userCode || profile.username || "").trim();
    const displayName = String(profile.displayName || profile.username || "Public User").trim();
    const avatarUrl = String(profile.avatar || "").trim();
    const role = roleLabel(normalizeRoleForUi(profile.role));
    const bio = String(profile.bio || "").trim();
    const coverUrl = String(profile.coverImageUrl || profile.cover_image_url || "").trim();
    const socialLinks = normalizeSocialLinks(profile.socialLinks || profile.social_links);
    const badges = Array.isArray(profile?.badge_state?.surface_badges?.profile_card)
      ? profile.badge_state.surface_badges.profile_card
      : Array.isArray(profile.badges)
      ? profile.badges
      : [];
    const liveStatus = getLiveStatus(profile);

    setHoverDataAttr(node, "data-ss-user-code", userCode);
    setHoverDataAttr(node, "data-ss-public-slug", publicSlug);
    setHoverDataAttr(node, "data-ss-user-id", userId);
    setHoverDataAttr(node, "data-ss-display-name", displayName);
    setHoverDataAttr(node, "data-ss-avatar-url", avatarUrl);
    setHoverDataAttr(node, "data-ss-role", role);
    setHoverDataAttr(node, "data-ss-bio", bio);
    setHoverDataAttr(node, "data-ss-cover-url", coverUrl);
    setHoverDataAttr(node, "data-ss-profile-href", profileHref);
    setHoverJsonAttr(node, "data-ss-social-links", socialLinks);
    setHoverJsonAttr(node, "data-ss-badges", badges);
    setHoverJsonAttr(node, "data-ss-live-status", liveStatus);
  }

  function bindClipThumbLoading(img, thumb) {
    if (!img || !thumb) return;
    thumb.classList.add("is-loading");
    const settle = () => {
      thumb.classList.remove("is-loading");
    };
    img.addEventListener("load", settle, { once: true });
    img.addEventListener("error", settle, { once: true });
    if (img.complete) {
      settle();
    }
  }

  function normalizeRoleForUi(value) {
    const role = String(value || "").trim().toLowerCase();
    if (role.includes("admin")) return "admin";
    if (role.includes("developer")) return "developer";
    if (role.includes("creator")) return "creator";
    if (role.includes("viewer") || role.includes("public")) return "viewer";
    return "viewer";
  }

  function normalizeTierForUi(value) {
    const tier = String(value || "").trim().toLowerCase();
    if (tier === "gold" || tier === "pro") return tier;
    if (tier === "admin" || tier === "developer") return "pro";
    return "core";
  }

  function normalizeBadgeKey(value) {
    const normalized = String(value || "").trim().toLowerCase();
    return BADGE_ICON_MAP[normalized] ? normalized : "";
  }

  function normalizeAuthoritativeBadges(value, accountType, tier) {
    let normalized = [];
    if (Array.isArray(value) && value.length) {
      normalized = value
        .map((badge) => {
          if (!badge || typeof badge !== "object") return null;
          const key = normalizeBadgeKey(badge.key || badge.icon_key || badge.iconKey || badge.value);
          if (!key) return null;
          return {
            key,
            kind: String(badge.kind || (key === "admin" ? "role" : "entitlement")).trim().toLowerCase(),
            value: key,
            label: String(badge.label || badge.title || key).trim(),
          };
        })
        .filter(Boolean);
    }
    if (!normalized.length) {
      normalized = buildAccountBadges(accountType, tier);
    }
    return normalized;
  }

  function roleLabel(role) {
    if (role === "admin") return "ADMIN";
    if (role === "developer") return "DEVELOPER";
    if (role === "creator") return "CREATOR";
    return "VIEWER";
  }

  function accountTypeToRole(accountType) {
    const normalized = normalizeAccountType(accountType);
    if (normalized === "ADMIN") return "admin";
    if (normalized === "DEVELOPER") return "developer";
    if (normalized === "CREATOR") return "creator";
    return "viewer";
  }

  function resolveAccountTypeFromProfile(profile) {
    const explicit = normalizeAccountType(profile?.accountType || profile?.account_type);
    if (explicit) return explicit;
    const role = normalizeRoleForUi(profile?.role);
    if (role === "admin") return "ADMIN";
    if (role === "developer") return "DEVELOPER";
    if (role === "creator" || profile?.creatorCapable) return "CREATOR";
    return "VIEWER";
  }

  function resolveProfileTypeDescriptor(profile) {
    const accountType = resolveAccountTypeFromProfile(profile);
    if (accountType === "ADMIN") {
      return { accountType, key: "admin", label: "ADMIN" };
    }
    if (accountType === "DEVELOPER") {
      return { accountType, key: "developer", label: "DEVELOPER" };
    }
    if (accountType === "CREATOR") {
      return {
        accountType,
        key: "creator",
        label: "CREATOR",
        icon: "/assets/icons/ui/ss-creator.svg"
      };
    }
    return {
      accountType: "VIEWER",
      key: "viewer",
      label: "VIEWER",
      icon: "/assets/icons/ui/ss-public.svg"
    };
  }

  function resolveProfileTier(value, accountType) {
    const rawTier = String(value || "").trim();
    const normalizedAccountType = normalizeAccountType(accountType);
    if (!rawTier && (normalizedAccountType === "ADMIN" || normalizedAccountType === "DEVELOPER")) {
      return "pro";
    }
    return normalizeTierForUi(rawTier);
  }

  function createBadgeIcon(type, value, label = "") {
    const icon = create("img", "badge-icon");
    const normalized = normalizeBadgeKey(value);
    icon.src = BADGE_ICON_MAP[normalized];
    if (!icon.src) return null;
    icon.alt = `${normalized || "badge"} badge`;
    icon.classList.add(["core", "gold", "pro"].includes(normalized) ? "badge-icon-tier" : "badge-icon-role");
    icon.classList.add(["core", "gold", "pro"].includes(normalized) ? "ss-tier-badge" : "ss-role-badge");
    icon.setAttribute("data-ss-role-badge", normalized || "badge");
    return getPublicBadgeUi()?.wrapTooltipTarget?.(
      icon,
      getPublicBadgeUi()?.resolveBadgeLabel?.(label || normalized, "Badge") || label || normalized,
      { className: "ss-badge-tooltip-target ss-badge-tooltip-target--icon" }
    ) || icon;
  }

  function buildBadgeSuffix(profile, options = {}) {
    const includeRoleChip = Boolean(options.includeRoleChip);
    const row = create("span", "creator-badges ss-role-badges");
    row.setAttribute("data-ss-badge-kind", "role");
    const role = normalizeRoleForUi(profile?.role);
    normalizeAuthoritativeBadges(
      profile?.badge_state?.surface_badges?.directory ||
        profile?.badge_state?.surface_badges?.public_surface ||
        profile?.badges,
      profile?.accountType || profile?.account_type || roleLabel(role),
      profile?.tier
    ).forEach((badge) => {
      const icon = createBadgeIcon(badge.kind, badge.key || badge.value, badge.label || badge.title || badge.key || badge.value);
      if (icon) row.appendChild(icon);
    });

    if (includeRoleChip) {
      const chip = create("span", "badge-role-chip", roleLabel(role));
      row.appendChild(chip);
    }
    const liveBadge = buildLiveBadge(profile, { compact: true });
    if (liveBadge) row.appendChild(liveBadge);
    return row;
  }

  function buildCreatorMeta(profile, options = {}) {
    const expanded = Boolean(options.expanded);
    const includeRoleChip = Boolean(options.includeRoleChip);
    const enableHover = Boolean(options.enableHover);
    const row = create("div", "creator-meta");
    if (expanded) row.classList.add("is-expanded");
    const avatar = buildAvatar(profile);
    if (enableHover) applyProfileHoverAttrs(avatar, profile);
    if (expanded) avatar.classList.add("is-expanded");
    row.appendChild(avatar);

    const textWrap = create("div", "creator-meta-text");
    const top = create("div", "creator-meta-top");
    const name = create("span", "creator-name", profile?.displayName || "Public User");
    if (enableHover) applyProfileHoverAttrs(name, profile);
    top.appendChild(name);

    top.appendChild(buildBadgeSuffix(profile, { includeRoleChip }));

    const bottom = create("div", "creator-meta-bottom", profile?.platform || "StreamSuites");

    textWrap.append(top, bottom);
    row.appendChild(textWrap);
    return row;
  }

  function buildPlatformChip(platform, iconPath) {
    const chip = create("span", "meta-pill platform-pill");
    const icon = create("img", "chip-icon");
    icon.src = iconPath || window.StreamSuitesPublicData?.platformIconFor?.(platform) || "/assets/icons/pilled.svg";
    icon.alt = `${platform || "Platform"} icon`;
    chip.append(icon, create("span", "", platform || "Platform"));
    return chip;
  }

  function getStreamPlatformIconPath(platform) {
    const normalized = String(platform || "").trim().toLowerCase();
    const socialData = window.StreamSuitesPublicData;
    if (typeof socialData?.socialIconPath === "function") {
      const resolved = String(socialData.socialIconPath(normalized) || "").trim();
      if (resolved) return resolved;
    }
    return normalized && Object.prototype.hasOwnProperty.call(STREAM_PLATFORM_LABELS, normalized)
      ? `/assets/icons/${normalized}.svg`
      : "/assets/icons/ui/cast.svg";
  }

  function createStreamPlatformIcon(platform, className = "profile-stream-platform-icon") {
    const icon = create("img", className);
    icon.src = getStreamPlatformIconPath(platform);
    icon.alt = "";
    icon.setAttribute("aria-hidden", "true");
    icon.loading = "lazy";
    icon.decoding = "async";
    return icon;
  }

  function buildStatusChip(status) {
    return create("span", `meta-pill status-pill status-${toStatusClass(status)}`, status || "Pending");
  }

  function buildResultsRows(items, fieldName = "percent", maxRows = 3) {
    const wrap = create("div", "results-list");
    (items || []).slice(0, maxRows).forEach((entry) => {
      const row = create("div", "result-row");
      const label = create("div", "result-label");
      const value = Number(entry?.[fieldName]) || 0;
      label.append(create("span", "", entry?.label || "Entry"), create("span", "", `${value}%`));

      const bar = create("div", "result-bar");
      const fill = create("span", "result-fill");
      fill.style.width = `${Math.max(0, Math.min(100, value))}%`;
      if (entry?.color) {
        fill.style.background = `linear-gradient(90deg, ${entry.color}, rgba(255,255,255,0.2))`;
      }
      bar.appendChild(fill);
      row.append(label, bar);
      wrap.appendChild(row);
    });
    return wrap;
  }

  function buildPiePreview(entries, percentField = "sharePercent") {
    const wrap = create("div", "pie-preview");
    const chart = create("div", "pie-chart");
    const legend = create("div", "pie-legend");

    const slices = (entries || []).slice(0, 5);
    let cursor = 0;
    const gradientStops = [];

    slices.forEach((entry, index) => {
      const percent = Number(entry?.[percentField]) || 0;
      const clamped = Math.max(0, Math.min(100, percent));
      const start = cursor;
      const end = Math.min(100, cursor + clamped);
      cursor = end;
      const color = entry?.color || ["#7dd63d", "#6cc6ff", "#ffc24f", "#c595ff", "#56e0cd"][index % 5];
      gradientStops.push(`${color} ${start}% ${end}%`);

      const legendItem = create("div", "pie-legend-item");
      const swatch = create("span", "pie-swatch");
      swatch.style.background = color;
      const label = create("span", "", `${entry?.label || "Entry"} ${clamped}%`);
      legendItem.append(swatch, label);
      legend.appendChild(legendItem);
    });

    if (!gradientStops.length) {
      gradientStops.push("rgba(210,220,236,0.2) 0% 100%");
    } else if (cursor < 100) {
      gradientStops.push(`rgba(210,220,236,0.16) ${cursor}% 100%`);
    }

    chart.style.background = `conic-gradient(${gradientStops.join(", ")})`;
    wrap.append(chart, legend);
    return wrap;
  }

  function buildCardTitle(item) {
    return item.type === "polls" ? item.question || item.title || "Poll" : item.title || "Untitled";
  }

  function buildClipCard(item, options) {
    const card = create("article", "item-card type-clips");
    const link = create("a", "item-link");
    link.href = item.href;

    const thumb = create("div", "item-thumb");
    const thumbSkeleton = create("span", "ss-thumb-skeleton");
    thumbSkeleton.setAttribute("aria-hidden", "true");
    thumb.appendChild(thumbSkeleton);
    if (item.mediaUrl && /\.(mp4|webm|ogg)(\?.*)?$/i.test(item.mediaUrl)) {
      const video = create("video");
      video.src = item.mediaUrl;
      video.muted = true;
      video.playsInline = true;
      video.preload = "metadata";
      video.setAttribute("aria-hidden", "true");
      thumb.appendChild(video);
    } else {
      const img = create("img");
      img.loading = "lazy";
      img.src = item.thumbnail || "/assets/backgrounds/seodash.jpg";
      img.alt = `${item.title} preview`;
      thumb.appendChild(img);
      bindClipThumbLoading(img, thumb);
    }

    if (item.duration) {
      thumb.appendChild(create("span", "item-duration", item.duration));
    }

    const body = create("div", "item-body");
    body.append(
      create("h3", "item-title", buildCardTitle(item)),
      buildCreatorMeta(item.creator, { enableHover: options.enableProfileHover !== false })
    );

    if (options.showSnippet) {
      body.appendChild(create("p", "item-snippet", item.summary || ""));
    }

    const meta = create("div", "item-meta");
    meta.append(buildPlatformChip(item.platform, item.platformIcon), buildStatusChip(item.status));

    if (item.views != null) {
      meta.appendChild(create("span", "meta-pill", `${formatNumber(item.views)} views`));
    }

    body.appendChild(meta);
    link.append(thumb, body);
    card.appendChild(link);
    return card;
  }

  function buildPollCard(item) {
    const card = create("article", "item-card type-polls");
    const link = create("a", "item-link");
    link.href = item.href;

    const body = create("div", "item-body");
    body.append(
      create("h3", "item-title", buildCardTitle(item)),
      buildCreatorMeta(item.creator, { enableHover: item?.enableProfileHover !== false })
    );

    if (item.chartType === "pie") {
      body.appendChild(buildPiePreview(item.options || [], "percent"));
    } else {
      body.appendChild(buildResultsRows(item.options || [], "percent", 3));
    }

    const meta = create("div", "item-meta");
    meta.append(
      buildStatusChip(item.status),
      create("span", "meta-pill", `${formatNumber(item.totalVotes)} votes`),
      buildPlatformChip(item.platform, item.platformIcon)
    );

    body.appendChild(meta);
    link.appendChild(body);
    card.appendChild(link);
    return card;
  }

  function buildWheelCard(item) {
    const card = create("article", "item-card type-wheels");
    const link = create("a", "item-link");
    link.href = item.href;

    const body = create("div", "item-body");
    body.append(
      create("h3", "item-title", buildCardTitle(item)),
      buildCreatorMeta(item.creator, { enableHover: item?.enableProfileHover !== false }),
      buildResultsRows(item.scoreboardEntries || item.entries || [], "percent", 3)
    );

    if (item.summary) {
      body.appendChild(create("p", "item-snippet", item.summary));
    }

    const meta = create("div", "item-meta");
    meta.append(
      buildStatusChip(item.status),
      create("span", "meta-pill", `${formatNumber(item.entryCount || (item.entries || []).length)} entries`),
      create("span", "meta-pill", `${item.defaultDisplayMode === "scoreboard" ? "List view" : "Wheel"} default`)
    );

    body.appendChild(meta);
    link.appendChild(body);
    card.appendChild(link);
    return card;
  }

  function buildScoreboardCard(item) {
    const card = create("article", "item-card type-scoreboards");
    const link = create("a", "item-link");
    link.href = item.href;

    const body = create("div", "item-body");
    body.append(
      create("h3", "item-title", buildCardTitle(item)),
      buildCreatorMeta(item.creator, { enableHover: item?.enableProfileHover !== false }),
      buildResultsRows(item.entries || [], "percent", 3)
    );

    const meta = create("div", "item-meta");
    meta.append(
      buildStatusChip(item.status),
      create("span", "meta-pill", "List view"),
      buildPlatformChip(item.platform, item.platformIcon)
    );

    body.appendChild(meta);
    link.appendChild(body);
    card.appendChild(link);
    return card;
  }

  function buildTallyCard(item) {
    const card = create("article", "item-card type-tallies");
    const link = create("a", "item-link");
    link.href = item.href;

    const body = create("div", "item-body");
    body.append(
      create("h3", "item-title", buildCardTitle(item)),
      buildCreatorMeta(item.creator, { enableHover: item?.enableProfileHover !== false }),
      buildPiePreview(item.entries || [], "sharePercent")
    );

    const meta = create("div", "item-meta");
    const total = (item.entries || []).reduce((sum, entry) => sum + (Number(entry?.value) || 0), 0);
    meta.append(
      buildStatusChip(item.status),
      create("span", "meta-pill", `${formatNumber(total)} total`),
      buildPlatformChip(item.platform, item.platformIcon)
    );

    body.appendChild(meta);
    link.appendChild(body);
    card.appendChild(link);
    return card;
  }

  function buildMediaCard(item, options = {}) {
    if (!item || typeof item !== "object") return create("div");
    const nextItem = { ...item, enableProfileHover: options.enableProfileHover };
    if (item.type === "clips") return buildClipCard(nextItem, options);
    if (item.type === "polls") return buildPollCard(nextItem, options);
    if (item.type === "wheels") return buildWheelCard(nextItem, options);
    if (item.type === "scoreboards") return buildScoreboardCard(nextItem, options);
    if (item.type === "tallies") return buildTallyCard(nextItem, options);
    return buildClipCard(nextItem, options);
  }

  function buildPageHeading(title, subtitle) {
    const heading = create("section", "page-heading page-heading-compact");
    const h1 = create("h1", "", title);
    const p = create("p", "", subtitle || "");
    heading.append(h1, p);
    return heading;
  }

  function buildSection(title, seeAllHref) {
    const section = create("section", "section");
    const head = create("div", "section-heading");
    head.append(create("h2", "", title));
    if (seeAllHref) {
      const link = create("a", "see-all", "See all");
      link.href = seeAllHref;
      head.appendChild(link);
    }
    section.appendChild(head);
    return { section, contentHost: section };
  }

  function buildDashboardHero(options = {}) {
    const hero = create("section", "dashboard-hero");
    if (options.tone) {
      hero.dataset.tone = String(options.tone).trim().toLowerCase();
    }

    const intro = create("div", "dashboard-hero-copy");
    if (options.eyebrow) {
      intro.appendChild(create("p", "dashboard-eyebrow", options.eyebrow));
    }
    intro.append(
      create("h1", "dashboard-hero-title", options.title || "Public Dashboard"),
      create("p", "dashboard-hero-body", options.body || "")
    );

    if (Array.isArray(options.highlights) && options.highlights.length) {
      const highlights = create("div", "dashboard-chip-row");
      options.highlights.forEach((highlight) => {
        const chip = create("span", "dashboard-chip", String(highlight || "").trim());
        if (chip.textContent) highlights.appendChild(chip);
      });
      if (highlights.childElementCount) intro.appendChild(highlights);
    }

    if (Array.isArray(options.actions) && options.actions.length) {
      const actions = create("div", "dashboard-action-row");
      options.actions.forEach((action) => {
        if (!action || typeof action !== "object" || !action.label) return;
        const tag = action.href ? "a" : "button";
        const control = create(tag, `dashboard-action${action.emphasis === "strong" ? " is-strong" : ""}`, action.label);
        if (tag === "a") {
          control.href = action.href;
          if (action.target) control.target = String(action.target);
          if (action.rel) control.rel = String(action.rel);
        } else {
          control.type = "button";
          control.disabled = action.disabled === true;
        }
        if (action.note) control.title = String(action.note);
        actions.appendChild(control);
      });
      if (actions.childElementCount) intro.appendChild(actions);
    }

    const aside = create("div", "dashboard-hero-aside");
    (Array.isArray(options.stats) ? options.stats : []).forEach((stat) => {
      if (!stat || typeof stat !== "object") return;
      const card = create("article", "dashboard-stat-card");
      card.append(
        create("span", "dashboard-stat-label", stat.label || ""),
        create("strong", "dashboard-stat-value", stat.value || "0")
      );
      if (stat.note) {
        card.appendChild(create("span", "dashboard-stat-note", stat.note));
      }
      aside.appendChild(card);
    });

    hero.append(intro, aside);
    return hero;
  }

  function buildDashboardCard(options = {}) {
    const card = create("article", "dashboard-card");
    if (options.state) {
      card.dataset.state = String(options.state).trim().toLowerCase();
    }

    const head = create("div", "dashboard-card-head");
    const titleWrap = create("div", "dashboard-card-title-wrap");
    titleWrap.appendChild(create("h3", "dashboard-card-title", options.title || "Card"));
    if (options.kicker) {
      titleWrap.appendChild(create("p", "dashboard-card-kicker", options.kicker));
    }
    head.appendChild(titleWrap);

    if (options.badge) {
      const badge = create("span", "dashboard-state-badge", options.badge);
      if (options.state) badge.dataset.state = String(options.state).trim().toLowerCase();
      head.appendChild(badge);
    }

    card.append(head, create("p", "dashboard-card-body", options.body || ""));

    if (Array.isArray(options.meta) && options.meta.length) {
      const list = create("div", "dashboard-meta-list");
      options.meta.forEach((entry) => {
        const text = String(entry || "").trim();
        if (text) list.appendChild(create("span", "dashboard-meta-pill", text));
      });
      if (list.childElementCount) card.appendChild(list);
    }

    if (Array.isArray(options.actions) && options.actions.length) {
      const actions = create("div", "dashboard-card-actions");
      options.actions.forEach((action) => {
        if (!action || typeof action !== "object" || !action.label) return;
        const control = create(action.href ? "a" : "button", `dashboard-card-link${action.muted ? " is-muted" : ""}`, action.label);
        if (action.href) {
          control.href = action.href;
          if (action.target) control.target = String(action.target);
          if (action.rel) control.rel = String(action.rel);
        } else {
          control.type = "button";
          control.disabled = action.disabled === true;
        }
        if (action.note) control.title = String(action.note);
        actions.appendChild(control);
      });
      if (actions.childElementCount) card.appendChild(actions);
    }

    if (options.footnote) {
      card.appendChild(create("p", "dashboard-card-footnote", options.footnote));
    }

    return card;
  }

  function buildDashboardGrid(cards = [], className = "") {
    const grid = create("div", `dashboard-card-grid${className ? ` ${className}` : ""}`);
    cards.forEach((card) => {
      if (card) grid.appendChild(card);
    });
    return grid;
  }

  function buildActionScaffoldCard(options = {}) {
    return buildDashboardCard({
      title: options.title || "Claim, assign, or report",
      kicker: options.kicker || "Future workflow scaffold",
      badge: "Context required",
      state: "preview",
      body:
        options.body ||
        "Public authority requests now submit against the real review contract only on surfaces that can resolve a real identity or artifact target. This location stays informational until that context exists.",
      meta: options.meta || ["Real backend contract is now live", "Submission stays disabled until a real target can be resolved"],
      actions: [
        { label: "Open support", href: "/support.html" },
        { label: "Removal request", disabled: true, muted: true, note: "A real identity or artifact target is required before the request can be submitted." },
        { label: "Claim / assign", disabled: true, muted: true, note: "Only contextual profile or artifact surfaces can submit to the authority backend." }
      ],
      footnote: "This card stays informational unless the current page can map to a real public authority target."
    });
  }

  const PUBLIC_AUTHORITY_TYPE_CONFIG = Object.freeze({
    claim_profile: {
      label: "Claim profile",
      requiresAuth: true,
      buttonLabel: "Claim profile",
      help: "Approval records review state only. It does not promise instant profile transfer."
    },
    assign_to_profile: {
      label: "Assign to profile",
      requiresAuth: true,
      buttonLabel: "Assign to my profile",
      help: "Use this when the public identity is mapped to the wrong StreamSuites profile."
    },
    report_issue: {
      label: "Report issue",
      requiresAuth: false,
      buttonLabel: "Report issue",
      help: "Use this for incorrect metadata, attribution, or listing issues."
    },
    request_removal: {
      label: "Request removal",
      requiresAuth: false,
      buttonLabel: "Request removal",
      help: "Approval suppresses or unlists the public item. It does not physically delete history-backed records."
    }
  });
  const PUBLIC_AUTHORITY_STATUS_LABELS = Object.freeze({
    pending: "Pending review",
    approved: "Approved",
    rejected: "Rejected",
    cancelled: "Cancelled"
  });

  function publicAuthorityTypeLabel(value) {
    return PUBLIC_AUTHORITY_TYPE_CONFIG[String(value || "").trim().toLowerCase()]?.label || "Request";
  }

  function publicAuthorityStatusLabel(value) {
    return PUBLIC_AUTHORITY_STATUS_LABELS[String(value || "").trim().toLowerCase()] || "Unknown";
  }

  function createAuthorityContext(value = {}) {
    if (!value || typeof value !== "object") return null;
    const targetIdentityCode = String(value.targetIdentityCode || value.target_identity_code || "").trim();
    const targetArtifactCode = String(value.targetArtifactCode || value.target_artifact_code || "").trim();
    if (!targetIdentityCode && !targetArtifactCode) return null;
    return {
      targetIdentityCode,
      targetArtifactCode,
      title: String(value.title || "").trim() || "Authority request",
      summary: String(value.summary || "").trim(),
      meta: Array.isArray(value.meta) ? value.meta.filter(Boolean).map((entry) => String(entry).trim()) : [],
      unsupportedReason: String(value.unsupportedReason || "").trim()
    };
  }

  function resolveProfileAuthorityContext(profile) {
    const identity = profile?.authorityIdentity || null;
    if (!identity?.identityCode) {
      return createAuthorityContext({
        title: "Profile authority requests",
        summary: "This profile does not currently expose a published public authority identity code, so claim, assignment, issue, and removal requests cannot be submitted from this page yet.",
        unsupportedReason: "Authority target unavailable for this profile."
      });
    }
    return createAuthorityContext({
      targetIdentityCode: identity.identityCode,
      title: "Profile authority requests",
      summary: "Submit a real claim, assignment, issue, or removal request against this public profile identity. Approval changes request state and review metadata; it does not imply instant ownership transfer.",
      meta: [
        `Identity: ${identity.identityCode}`,
        `Listing: ${toTitle(identity.listingState || "listed")}`,
        identity.sourcePlatform ? `Source: ${toTitle(identity.sourcePlatform)}` : ""
      ]
    });
  }

  function resolveArtifactAuthorityContext(item) {
    const authorityArtifact = item?.authorityArtifact || null;
    if (!authorityArtifact?.artifactCode) {
      return createAuthorityContext({
        title: "Artifact authority requests",
        summary: "This artifact route does not currently expose a published authority artifact code in the public payload, so requests stay informational here instead of guessing a target.",
        unsupportedReason: "Authority artifact target unavailable for this page."
      });
    }
    return createAuthorityContext({
      targetArtifactCode: authorityArtifact.artifactCode,
      targetIdentityCode: authorityArtifact.ownerIdentityCode,
      title: "Artifact authority requests",
      summary: "Submit a real issue or removal request against this public artifact. Removal approval suppresses public visibility rather than deleting the record.",
      meta: [
        `Artifact: ${authorityArtifact.artifactCode}`,
        `Type: ${toTitle(authorityArtifact.artifactType || item?.type || "artifact")}`,
        authorityArtifact.ownerIdentityCode ? `Owner identity: ${authorityArtifact.ownerIdentityCode}` : ""
      ]
    });
  }

  async function parseJsonResponse(response) {
    const contentType = String(response?.headers?.get?.("content-type") || "").toLowerCase();
    if (!contentType.includes("application/json")) return {};
    try {
      return await response.json();
    } catch (_err) {
      return {};
    }
  }

  function resolveAuthorityErrorMessage(payload, fallbackStatus) {
    const raw = String(payload?.error || payload?.message || "").trim();
    if (!raw) return fallbackStatus ? `Request failed (${fallbackStatus}).` : "Request failed.";
    const normalized = raw.toLowerCase();
    if (normalized.includes("authentication required")) return "Sign in is required for that request type.";
    if (normalized === "request_target_required") return "A real public identity or artifact target is required before submission.";
    if (normalized === "claim_profile_requires_identity_target") return "Claim requests currently require a resolved public identity target.";
    if (normalized === "account_required_for_claim_or_assignment") return "Sign in is required for claim or assignment requests.";
    if (normalized === "target_public_identity_not_found") return "The selected public identity could not be resolved by the authority layer.";
    if (normalized === "target_public_artifact_not_found") return "The selected public artifact could not be resolved by the authority layer.";
    return raw.replace(/_/g, " ");
  }

  async function submitPublicAuthorityRequest(payload) {
    const response = await fetch(AUTH_PUBLIC_AUTHORITY_REQUESTS_URL, {
      method: "POST",
      cache: "no-store",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    const body = await parseJsonResponse(response);
    if (!response.ok || body?.success === false) {
      const error = new Error(resolveAuthorityErrorMessage(body, response.status));
      error.status = response.status;
      error.payload = body;
      throw error;
    }
    return body;
  }

  async function fetchMyPublicAuthorityRequests() {
    const response = await fetch(AUTH_PUBLIC_AUTHORITY_REQUESTS_MINE_URL, {
      method: "GET",
      cache: "no-store",
      credentials: "include",
      headers: { Accept: "application/json" }
    });
    const body = await parseJsonResponse(response);
    if (!response.ok || body?.success === false) {
      const error = new Error(resolveAuthorityErrorMessage(body, response.status));
      error.status = response.status;
      error.payload = body;
      throw error;
    }
    return Array.isArray(body?.requests) ? body.requests : [];
  }

  function getMemberDisplayName(profile) {
    return String(profile?.displayName || profile?.username || profile?.userCode || profile?.id || "Public User").trim() || "Public User";
  }

  function normalizePublicHandle(value, fallback = "") {
    const raw = String(value || "").trim().toLowerCase().replace(/^@+/, "");
    const normalized = raw
      .replace(/[^a-z0-9_-]+/g, "")
      .replace(/^[-_]+|[-_]+$/g, "");
    if (!normalized || isUuidLike(normalized)) return fallback;
    return normalized;
  }

  function getMemberLegacyUsername(profile) {
    return normalizePublicHandle(profile?.username || profile?.userCode || "", "");
  }

  function getCanonicalSlugFromUrl(value) {
    const raw = String(value || "").trim();
    if (!raw) return "";
    try {
      const url = new URL(raw, window.location.origin);
      const normalizedPath = normalizePath(url.pathname);
      if (!normalizedPath.startsWith(CANONICAL_PROFILE_PREFIX)) return "";
      return normalizePublicHandle(decodeURIComponent(normalizedPath.slice(CANONICAL_PROFILE_PREFIX.length).split("/")[0] || ""), "");
    } catch (_err) {
      return "";
    }
  }

  function getMemberPublicSlug(profile) {
    return (
      normalizePublicHandle(profile?.publicSlug || profile?.public_slug || profile?.slug || "", "") ||
      getCanonicalSlugFromUrl(
        profile?.streamsuitesProfileUrl ||
          profile?.streamsuites_profile_url ||
          profile?.streamsuitesShareUrl ||
          profile?.streamsuites_share_url
      )
    );
  }

  function getMemberPublicHandle(profile) {
    return getMemberPublicSlug(profile) || getMemberLegacyUsername(profile) || "";
  }

  function compareMembersAlphabetically(left, right) {
    const leftName = getMemberDisplayName(left);
    const rightName = getMemberDisplayName(right);
    const byName = leftName.localeCompare(rightName, undefined, { sensitivity: "base", numeric: true });
    if (byName) return byName;

    const leftUser = getMemberPublicHandle(left);
    const rightUser = getMemberPublicHandle(right);
    const byUser = leftUser.localeCompare(rightUser, undefined, { sensitivity: "base", numeric: true });
    if (byUser) return byUser;

    return String(left?.id || "").localeCompare(String(right?.id || ""), undefined, { sensitivity: "base", numeric: true });
  }

  function resolveMemberAlpha(value) {
    const normalized = String(value || "all").trim().toUpperCase();
    if (normalized === "ALL") return "all";
    if (normalized === "#" || /^[A-Z]$/.test(normalized)) return normalized;
    return "all";
  }

  function getMemberAlphaBucket(profile) {
    const firstChar = getMemberDisplayName(profile).trim().charAt(0).toUpperCase();
    return /^[A-Z]$/.test(firstChar) ? firstChar : "#";
  }

  function matchesMemberSearch(profile, query) {
    const q = norm(query).trim();
    if (!q) return true;

    const haystack = [
      getMemberDisplayName(profile),
      getMemberPublicHandle(profile),
      getMemberLegacyUsername(profile),
      profile?.publicSlug,
      profile?.role,
      profile?.platform,
      profile?.bio
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(q);
  }

  function collectCommunityMembers(data, query) {
    return (data.profiles || [])
      .filter((profile) => profile?.isListed !== false && isProfileVisibleOnStreamSuites(profile))
      .filter((profile) => matchesMemberSearch(profile, query))
      .sort(compareMembersAlphabetically);
  }

  function filterMembersByAlpha(members, alphaValue) {
    const activeAlpha = resolveMemberAlpha(alphaValue);
    if (activeAlpha === "all") return members.slice();
    return members.filter((profile) => getMemberAlphaBucket(profile) === activeAlpha);
  }

  function buildMemberAlphaCounts(members) {
    return (members || []).reduce((acc, profile) => {
      const bucket = getMemberAlphaBucket(profile);
      acc[bucket] = (acc[bucket] || 0) + 1;
      return acc;
    }, { all: members.length });
  }

  function normalizeExternalUrl(url) {
    const raw = String(url || "").trim();
    if (!raw) return "";
    if (/^https?:\/\//i.test(raw)) return raw;
    if (/^(mailto:|tel:)/i.test(raw)) return raw;
    if (/^[a-z][a-z0-9+.-]*:/i.test(raw)) return "";
    return `https://${raw.replace(/^\/+/, "")}`;
  }

  function getSocialDataApi() {
    return window.StreamSuitesPublicData || null;
  }

  function toTitle(value) {
    const api = window.StreamSuitesPublicData || null;
    if (typeof api?.toTitle === "function") {
      return api.toTitle(value);
    }
    const raw = String(value || "").trim().replace(/[_-]+/g, " ");
    return raw ? raw.replace(/\b\w/g, (char) => char.toUpperCase()) : "";
  }

  function collectOrderedSocialEntries(socialLinks) {
    const api = getSocialDataApi();
    if (typeof api?.collectOrderedSocialEntries === "function") {
      return api.collectOrderedSocialEntries(socialLinks);
    }
    const normalized =
      typeof api?.normalizeSocialLinks === "function"
        ? api.normalizeSocialLinks(socialLinks)
        : {};
    return Object.entries(normalized).map(([network, url]) => ({
      network,
      url: normalizeExternalUrl(url),
      label: network,
      iconPath: typeof api?.socialIconPath === "function" ? api.socialIconPath(network) : "/assets/icons/link.svg"
    })).filter((entry) => entry.url);
  }

  function socialLabel(network) {
    const api = getSocialDataApi();
    return typeof api?.socialLabel === "function" ? api.socialLabel(network) : String(network || "").trim();
  }

  function getProfileSocialVisibleLimit() {
    if (window.matchMedia("(max-width: 640px)").matches) return 8;
    if (window.matchMedia("(max-width: 900px)").matches) return 10;
    return 14;
  }

  function createSocialOverflowIndicator(hiddenCount, className = "social-overflow-indicator") {
    const chip = create("span", className, `+${hiddenCount}`);
    chip.setAttribute("aria-label", `${hiddenCount} more social link${hiddenCount === 1 ? "" : "s"} available`);
    chip.title = `${hiddenCount} more social link${hiddenCount === 1 ? "" : "s"} on the full profile`;
    return chip;
  }

  function buildSocialIconLink(entry, className = "social-icon-btn", iconClass = "") {
    const anchor = create("a", className);
    anchor.href = entry.url;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.setAttribute("aria-label", entry.label || socialLabel(entry.network));
    const icon = create("img", iconClass);
    icon.src = entry.iconPath || socialIconPath(entry.network);
    icon.alt = "";
    anchor.appendChild(icon);
    return anchor;
  }

  function collectMemberSocialEntries(socialLinks) {
    return collectOrderedSocialEntries(socialLinks);
  }

  function buildMemberCardAvatar(profile) {
    const avatar = create("div", "ss-profile-hovercard-avatar");
    if (getLiveStatus(profile)) avatar.classList.add("is-live");
    if (profile?.avatar) {
      avatar.style.backgroundImage = `url(${profile.avatar})`;
      avatar.textContent = "";
      return avatar;
    }

    avatar.textContent = textInitial(getMemberDisplayName(profile));
    return avatar;
  }

  function buildMemberCardBadges(profile) {
    const row = create("span", "ss-profile-hovercard-badges");
    normalizeAuthoritativeBadges(
      profile?.badge_state?.surface_badges?.directory ||
        profile?.badge_state?.surface_badges?.public_surface ||
        profile?.badges,
      profile?.accountType || profile?.account_type || roleLabel(normalizeRoleForUi(profile?.role)),
      profile?.tier
    ).forEach((badge) => {
      const normalized = normalizeBadgeKey(badge?.key || badge?.value);
      const iconPath = BADGE_ICON_MAP[normalized];
      if (!iconPath) return;
      const icon = create("img", "ss-profile-hovercard-badge");
      icon.src = iconPath;
      icon.alt = "";
      row.appendChild(
        getPublicBadgeUi()?.wrapTooltipTarget?.(
          icon,
          getPublicBadgeUi()?.resolveBadgeLabel?.(badge, "Badge") || badge.label || badge.title || normalized,
          { className: "ss-badge-tooltip-target ss-badge-tooltip-target--icon" }
        ) || icon
      );
    });

    const liveStatus = getLiveStatus(profile);
    if (liveStatus) {
      const liveBadge = create("span", "ss-profile-hovercard-live-badge", "LIVE");
      liveBadge.setAttribute("aria-label", `${liveStatus.providerLabel || "Live"} live now`);
      row.appendChild(
        getPublicBadgeUi()?.wrapTooltipTarget?.(
          liveBadge,
          getPublicBadgeUi()?.resolveLiveLabel?.(liveStatus) || `${liveStatus.providerLabel || "Live"} live now`,
          { className: "ss-badge-tooltip-target ss-badge-tooltip-target--pill" }
        ) || liveBadge
      );
    }

    row.hidden = row.childElementCount === 0;
    return row;
  }

  function buildMemberRoleLabel(profile) {
    const role = normalizeRoleForUi(profile?.role);
    if (role === "admin") return "Admin";
    if (role === "creator") return "Creator";
    return "Member";
  }

  function buildMemberSubtitle(profile) {
    const subtitle = create("p", "ss-profile-hovercard-subtitle member-gallery-card-subtitle");
    const handle = getMemberPublicHandle(profile);
    if (handle) {
      subtitle.appendChild(create("span", "member-gallery-card-handle", `@${handle}`));
    }
    const subline = create("span", "member-gallery-card-subline", buildMemberRoleLabel(profile));
    if (!handle) subline.classList.add("member-gallery-card-subline-plain");
    subtitle.appendChild(subline);
    return subtitle;
  }

  function buildMemberCardHeader(profile) {
    const head = create("div", "ss-profile-hovercard-head member-gallery-card-head");
    const nameRow = create("div", "ss-profile-hovercard-name-row member-gallery-card-name-row");
    nameRow.append(
      create("h3", "ss-profile-hovercard-name", getMemberDisplayName(profile)),
      buildMemberCardBadges(profile)
    );
    head.append(nameRow, buildMemberSubtitle(profile));
    return head;
  }

  function getProfileArtifactCount(profile, data) {
    const identifiers = collectProfileIdentifiers(profile);
    for (const key of identifiers) {
      const artifacts = data.artifactsByProfile?.[key];
      if (Array.isArray(artifacts)) return artifacts.length;
    }
    return 0;
  }

  function buildMemberCardSocialRow(profile) {
    const row = create("div", "ss-profile-hovercard-social-row");
    const entries = collectMemberSocialEntries(profile?.socialLinks || profile?.social_links);
    if (!entries.length) {
      row.hidden = true;
      return row;
    }

    entries.slice(0, 8).forEach((entry) => {
      row.appendChild(buildSocialIconLink(entry, "ss-profile-hovercard-social", "member-gallery-card-social-icon-image"));
    });
    if (entries.length > 8) {
      row.appendChild(createSocialOverflowIndicator(entries.length - 8));
    }

    return row;
  }

  function buildMemberArtifactSummary(profile, data) {
    const count = getProfileArtifactCount(profile, data);
    if (count <= 0) return null;
    return create("p", "member-gallery-card-artifact-count", `${formatNumber(count)} public artifact${count === 1 ? "" : "s"}`);
  }

  function buildMemberGalleryCard(profile, data) {
    const card = create("article", "profile-card member-gallery-card");
    const cover = create("div", "ss-profile-hovercard-cover");
    const coverImage = create("img", "ss-profile-hovercard-cover-image");
    const displayName = getMemberDisplayName(profile);
    coverImage.src = String(profile?.coverImageUrl || profile?.bannerImageUrl || DEFAULT_PROFILE_COVER).trim() || DEFAULT_PROFILE_COVER;
    coverImage.alt = `${displayName} cover`;
    cover.appendChild(coverImage);

    const body = create("div", "ss-profile-hovercard-body member-gallery-card-body");
    const avatar = buildMemberCardAvatar(profile);
    const head = buildMemberCardHeader(profile);

    const bio = create("p", "ss-profile-hovercard-bio", String(profile?.bio || "Profile details are being updated.").trim());
    const artifactSummary = buildMemberArtifactSummary(profile, data);
    const socialRow = buildMemberCardSocialRow(profile);
    const actions = create("div", "ss-profile-hovercard-actions member-gallery-card-actions");
    const profileLink = create("a", "ss-profile-hovercard-action", "View profile");
    profileLink.href = buildProfileHref(profile);
    actions.appendChild(profileLink);

    body.append(avatar, head, bio);
    if (artifactSummary) body.appendChild(artifactSummary);
    if (!socialRow.hidden) body.appendChild(socialRow);
    body.appendChild(actions);
    card.append(cover, body);
    return card;
  }

  function buildMemberGalleryControls(ctx, members, activeAlpha) {
    const controls = create("div", "member-gallery-controls");
    const total = members.length;
    const activeLabel = activeAlpha === "all" ? "All names" : `${activeAlpha} names`;
    controls.appendChild(
      create("p", "member-gallery-summary", `${formatNumber(total)} member${total === 1 ? "" : "s"} · ${activeLabel}`)
    );

    const rail = create("div", "member-alpha-rail");
    rail.setAttribute("role", "toolbar");
    rail.setAttribute("aria-label", "Filter members by name");

    const counts = buildMemberAlphaCounts(members);
    MEMBER_ALPHA_OPTIONS.forEach((option) => {
      const count = counts[option.value] || 0;
      const isActive = option.value === activeAlpha;
      const button = create("button", `member-alpha-btn${isActive ? " is-active" : ""}`, option.label);
      button.type = "button";
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
      button.disabled = count === 0 && !isActive;
      button.addEventListener("click", () => {
        if (ctx.state.memberAlpha === option.value) return;
        ctx.state.memberAlpha = option.value;
        ctx.state.memberPage = 1;
        ctx.rerender();
      });
      rail.appendChild(button);
    });

    controls.appendChild(rail);
    return controls;
  }

  function buildMemberGalleryPagination(ctx, totalItems, currentPage, totalPages) {
    const pagination = create("div", "member-gallery-pagination");
    const previous = create("button", "member-gallery-page-btn", "Previous");
    previous.type = "button";
    previous.disabled = currentPage <= 1;
    previous.addEventListener("click", () => {
      if (currentPage <= 1) return;
      ctx.state.memberPage = currentPage - 1;
      ctx.rerender();
    });

    const pageStart = totalItems ? (currentPage - 1) * MEMBER_PAGE_SIZE + 1 : 0;
    const pageEnd = totalItems ? Math.min(totalItems, currentPage * MEMBER_PAGE_SIZE) : 0;
    const status = create(
      "p",
      "member-gallery-page-status",
      `Page ${formatNumber(currentPage)} of ${formatNumber(totalPages)} · ${formatNumber(pageStart)}-${formatNumber(pageEnd)} of ${formatNumber(totalItems)}`
    );

    const next = create("button", "member-gallery-page-btn", "Next");
    next.type = "button";
    next.disabled = currentPage >= totalPages;
    next.addEventListener("click", () => {
      if (currentPage >= totalPages) return;
      ctx.state.memberPage = currentPage + 1;
      ctx.rerender();
    });

    pagination.append(previous, status, next);
    return pagination;
  }

  function buildMemberGallerySection(ctx, options = {}) {
    const section = create("section", "section member-gallery-section");
    const title = String(options.title || "").trim();
    const seeAllHref = String(options.seeAllHref || "").trim();

    if (title || seeAllHref) {
      const head = create("div", "section-heading");
      if (title) head.appendChild(create("h2", "", title));
      if (seeAllHref) {
        const link = create("a", "see-all", "See all");
        link.href = seeAllHref;
        head.appendChild(link);
      }
      section.appendChild(head);
    }

    const membersSourceOk = ctx.data.sourceStatus?.profiles?.ok !== false;
    const searchedMembers = collectCommunityMembers(ctx.data, ctx.state.query);
    const activeAlpha = resolveMemberAlpha(ctx.state.memberAlpha);
    const filteredMembers = filterMembersByAlpha(searchedMembers, activeAlpha);

    if (!searchedMembers.length && !membersSourceOk) {
      section.appendChild(create("div", "empty-state", "Member directory unavailable right now. Please try again shortly."));
      return section;
    }

    section.appendChild(buildMemberGalleryControls(ctx, searchedMembers, activeAlpha));

    if (!filteredMembers.length) {
      section.appendChild(create("div", "empty-state", "No members match this search/filter."));
      return section;
    }

    const totalPages = Math.max(1, Math.ceil(filteredMembers.length / MEMBER_PAGE_SIZE));
    const currentPage = Math.min(Math.max(1, Number(ctx.state.memberPage) || 1), totalPages);
    ctx.state.memberPage = currentPage;
    const start = (currentPage - 1) * MEMBER_PAGE_SIZE;
    const visibleMembers = filteredMembers.slice(start, start + MEMBER_PAGE_SIZE);

    const grid = create("div", "member-gallery-grid");
    visibleMembers.forEach((profile) => {
      grid.appendChild(buildMemberGalleryCard(profile, ctx.data));
    });

    section.append(grid, buildMemberGalleryPagination(ctx, filteredMembers.length, currentPage, totalPages));
    return section;
  }

  function filterItemsByType(data, type, query) {
    return (data[type] || []).filter((item) => !item?.isRemoved && matchesQuery(item, query));
  }

  function renderMediaHome(ctx) {
    const { host, data, state } = ctx;
    clear(host);
    const activeFilters = new Set(
      state.activeFilters.length ? state.activeFilters : ["clips", "polls", "wheels", "tallies"]
    );
    const liveCount = collectLiveProfiles(data).length;
    const memberCount = collectCommunityMembers(data, "").length;
    const noticeCount = Array.isArray(data.notices) ? data.notices.length : 0;
    const clips = filterItemsByType(data, "clips", state.query);
    const polls = filterItemsByType(data, "polls", state.query);
    const wheels = filterItemsByType(data, "wheels", state.query);
    const scoreboards = filterItemsByType(data, "scoreboards", state.query);
    const tallies = filterItemsByType(data, "tallies", state.query);

    host.appendChild(
      buildDashboardHero({
        eyebrow: "Viewer dashboard",
        title: "Media home",
        body: "One public dashboard for clips, polls, wheels, tallies, live discovery, and community surfaces. Wheel artifacts now render from the authoritative runtime export, keep list view as an internal wheel presentation mode, and reserve Leaderboards as the future standalone scoring IA.",
        highlights: [
          "Public-facing shell consolidated",
          `${formatNumber(liveCount)} live creator${liveCount === 1 ? "" : "s"} now`,
          `${formatNumber(memberCount)} listed member${memberCount === 1 ? "" : "s"}`
        ],
        actions: [
          { label: "Browse wheels", href: "/wheels", emphasis: "strong" },
          { label: "Open community", href: "/community" }
        ],
        stats: [
          { label: "Wheels", value: formatNumber(wheels.length), note: "Published artifacts" },
          { label: "Leaderboards", value: "Scaffold", note: "Reserved route" },
          { label: "Clips", value: formatNumber(clips.length), note: "Public artifacts" },
          { label: "Notices", value: formatNumber(noticeCount), note: "Community updates" }
        ]
      })
    );

    host.appendChild(
      buildDashboardGrid([
        buildDashboardCard({
          title: "Clips",
          kicker: "Operational now",
          badge: "Active",
          state: "active",
          body: "Public clip cards, detail routes, and creator attribution are already live in the shared shell.",
          meta: [`${formatNumber(clips.length)} available`, "Deep links preserved", "Gallery and detail views"],
          actions: [{ label: "Open clips", href: "/clips" }]
        }),
        buildDashboardCard({
          title: "Polls",
          kicker: "Operational now",
          badge: "Active",
          state: "active",
          body: "Published poll surfaces stay browseable from the same dashboard instead of living in a separate media identity.",
          meta: [`${formatNumber(polls.length)} available`, "Results routes preserved"],
          actions: [{ label: "Open polls", href: "/polls" }]
        }),
        buildDashboardCard({
          title: "Wheels",
          kicker: "Operational now",
          badge: "Active",
          state: "active",
          body: "Wheel artifacts now hydrate from the authoritative runtime export, render with their persisted configuration, and keep list view attached to each wheel instead of splitting that mode into a second top-level destination.",
          meta: [`${formatNumber(wheels.length)} wheels`, "Wheel and list view modes", "No fake winner history"],
          actions: [{ label: "Open wheels", href: "/wheels" }, { label: "Open leaderboards", href: "/leaderboards", muted: true }]
        }),
        buildDashboardCard({
          title: "Live + Community",
          kicker: "Shared dashboard area",
          badge: liveCount ? "Live now" : "Monitoring",
          state: liveCount ? "active" : "planned",
          body: "Live discovery, member browsing, and notices now sit inside the same dashboard model as media instead of branching into a separate shell.",
          meta: [`${formatNumber(liveCount)} live now`, `${formatNumber(memberCount)} listed members`],
          actions: [{ label: "Open live", href: "/live" }, { label: "Open community", href: "/community", muted: true }]
        })
      ])
    );

    host.appendChild(
      buildDashboardGrid(
        [
          buildDashboardCard({
            title: "Leaderboards",
            kicker: "Planned artifact surface",
            badge: "Scaffold",
            state: "planned",
            body: "Leaderboards is now the truthful public scaffold destination for future standalone scoring artifacts, while legacy /scoreboards remains only as a compatibility alias and wheel list view stays inside each wheel.",
            meta: ["Legacy /scoreboards alias preserved", "No XP/rank backend yet", "Wheel list view stays internal"],
            actions: [{ label: "Open leaderboards", href: "/leaderboards" }]
          }),
          buildDashboardCard({
            title: "Games / Economy",
            kicker: "Planned public module",
            badge: "Planned",
            state: "planned",
            body: "Public games, economy snapshots, and viewer-facing balances are staged as dashboard destinations without inventing data before the runtime is ready.",
            meta: ["Route reserved", "No balance or inventory backend on this surface yet"],
            actions: [{ label: "Open games / economy", href: "/economy.html" }]
          }),
          buildDashboardCard({
            title: "My Data",
            kicker: "Account workspace",
            badge: "Preview",
            state: "preview",
            body: "A dedicated member/data workspace now exists as a truthful placeholder for exports, history, and preferences that have not been activated yet.",
            meta: ["Account-facing destination added", "No data export backend wired in this milestone"],
            actions: [{ label: "Open my data", href: "/community/my-data.html" }]
          }),
          buildActionScaffoldCard({
            title: "Ownership and reporting",
            body: "Future claim, assign, report, and removal-request flows are now represented inside the public dashboard language without simulating any backend approval behavior."
          })
        ],
        "dashboard-card-grid--four"
      )
    );

    const spotlightSection = buildSection("Current public media", "/clips").section;
    const spotlightGrid = create("div", "media-grid");
    [
      ...sliceRows(wheels, 1, 1),
      ...sliceRows(clips, 2, 1),
      ...sliceRows(polls, 1, 1),
      ...sliceRows(tallies, 1, 1)
    ]
      .filter((item) => activeFilters.has(item.type))
      .slice(0, 5)
      .forEach((item) => {
        spotlightGrid.appendChild(buildMediaCard(item, { showSnippet: item.type !== "clips" }));
      });

    if (spotlightGrid.childElementCount) {
      spotlightSection.appendChild(spotlightGrid);
      host.appendChild(spotlightSection);
    }

    const sections = [
      { type: "wheels", title: "Wheels", seeAll: "/wheels", limitRows: 1, showSnippet: true },
      { type: "clips", title: "Clips", seeAll: "/clips", limitRows: 2, showSnippet: false },
      { type: "polls", title: "Polls", seeAll: "/polls", limitRows: 1 },
      { type: "tallies", title: "Tallies", seeAll: "/tallies", limitRows: 1 }
    ];

    let renderedAny = false;
    let sectionIndex = 0;

    sections.forEach((config) => {
      if (!activeFilters.has(config.type)) return;
      let items = filterItemsByType(data, config.type, state.query);
      const perRow = config.type === "clips" ? 5 : 4;
      items = sliceRows(items, perRow, config.limitRows || 1);
      if (!items.length) return;

      renderedAny = true;
      const section = buildSection(config.title, config.seeAll).section;
      section.classList.add(`section-${config.type}`);
      if (sectionIndex > 0) section.classList.add("section-divided");
      sectionIndex += 1;

      const grid = create("div", "media-grid");
      items.forEach((item) => {
        grid.appendChild(buildMediaCard(item, { showSnippet: Boolean(config.showSnippet) }));
      });

      section.appendChild(grid);
      host.appendChild(section);
    });

    if (!renderedAny) {
      host.appendChild(create("div", "empty-state", "No media matches the current search/filter."));
    }
  }

  function renderMediaList(ctx, config) {
    const { host, data, state } = ctx;
    clear(host);

    const titles = {
      clips: ["Clips Gallery", "Creator clips with larger thumbnails and quick metadata."],
      polls: ["Polls Gallery", "Public poll questions and vote snapshots."],
      wheels: ["Wheels Gallery", "Authoritative wheel artifacts with the premium stage view, local session spins, and richer entrant detail."],
      scoreboards: ["List Views", "The legacy /scoreboards route now presents wheel artifacts in list view rather than acting as their canonical home."],
      tallies: ["Tallies Gallery", "Programmatic tally summaries with pie previews."]
    };

    const [title, subtitle] = titles[config.listType] || ["Gallery", "Public media gallery."];
    host.appendChild(buildPageHeading(title, subtitle));

    const section = buildSection(title, null).section;
    const grid = create("div", `media-grid${config.listType === "clips" ? " clips-dedicated" : ""}`);

    const items = filterItemsByType(data, config.listType, state.query);
    items.forEach((item) => {
      grid.appendChild(buildMediaCard(item, { showSnippet: config.listType === "clips" }));
    });

    section.appendChild(grid);
    host.appendChild(section);

    if (!items.length) {
      host.appendChild(create("div", "empty-state", "No items match this search."));
    }
  }

  function buildDetailRows(item, helpers) {
    const rows = create("ul", "data-list");

    const make = (label, value) => {
      const li = create("li");
      const strong = create("strong", "", `${label}:`);
      li.append(strong, document.createTextNode(` ${value || "Unknown"}`));
      rows.appendChild(li);
    };

    make("Creator", item.creator?.displayName || "Public User");
    make("Platform", item.platform || "StreamSuites");
    make("Status", item.status || "Pending");
    if (item.viewFamily === "wheel" || item.type === "wheels" || item.artifactType === "wheel") {
      make("Entries", formatNumber(item.entryCount || (item.entries || []).length));
      make("Default view", item.defaultDisplayMode === "scoreboard" ? "List view" : "Wheel");
      make("Winner limit", String(item.winnerLimit || 1));
      make("Duplicates", item.allowDuplicates ? "Allowed" : "Blocked");
      make("Auto-remove winner", item.autoRemoveWinner ? "Enabled" : "Disabled");
    }
    make("Created", helpers.toTimestamp(item.createdAt));
    make("Updated", helpers.toTimestamp(item.updatedAt));

    return rows;
  }

  function buildProfileHref(profileOrCode) {
    return buildCanonicalProfileHref(profileOrCode);
  }

  function buildCanonicalProfileHref(profileOrCode) {
    const slug = getCanonicalProfileSlug(profileOrCode, "public-user");
    return `${CANONICAL_PROFILE_PREFIX}${encodeURIComponent(String(slug || "public-user").trim() || "public-user")}`;
  }

  function buildLegacyProfileHref(profileOrCode) {
    const code = getLegacyProfileCode(profileOrCode, "public-user");
    return `/community/profile.html?u=${encodeURIComponent(String(code || "public-user").trim() || "public-user")}`;
  }

  function buildArtifactDetailHref(itemOrType, idOrRouteId) {
    if (typeof window.StreamSuitesPublicData?.buildArtifactHref !== "function") {
      const type = typeof itemOrType === "string" ? itemOrType : itemOrType?.type;
      const identifier = typeof itemOrType === "string" ? idOrRouteId : itemOrType?.routeId || itemOrType?.id;
      const encoded = encodeURIComponent(String(identifier || "").trim());
      if (type === "clips") return `/clips/${encoded}`;
      if (type === "polls") return `/polls/${encoded}`;
      if (type === "wheels") return `/wheels/${encoded}`;
      if (type === "scoreboards") return `/scores/${encoded}`;
      if (type === "leaderboards") return "/leaderboards";
      return `/media.html`;
    }
    const type = typeof itemOrType === "string" ? itemOrType : itemOrType?.type;
    const identifier = typeof itemOrType === "string" ? idOrRouteId : itemOrType?.routeId || itemOrType?.id;
    return window.StreamSuitesPublicData.buildArtifactHref(type, identifier);
  }

  function buildShareLink(item) {
    return new URL(buildArtifactDetailHref(item), window.location.origin).toString();
  }

  function buildArtifactGalleryLink(type) {
    return TYPE_TO_PAGE[type] || "/media.html";
  }

  function resolveWheelShareModel(item) {
    const slug = String(item?.slug || item?.customSlug || item?.custom_slug || item?.defaultSlug || item?.default_slug || "").trim();
    const defaultSlug = String(item?.defaultSlug || item?.default_slug || item?.slug || "").trim();
    const customSlug = String(item?.customSlug || item?.custom_slug || "").trim();
    const shortlinkSlug = String(item?.shortlinkSlug || item?.shortlink_slug || "").trim();
    const publicPath = slug ? `/wheels/${encodeURIComponent(slug)}` : "";
    const defaultPublicPath = defaultSlug ? `/wheels/${encodeURIComponent(defaultSlug)}` : "";
    return {
      slug,
      defaultSlug,
      customSlug,
      shortlinkSlug,
      publicPath,
      defaultPublicPath,
      publicUrl: publicPath ? new URL(publicPath, window.location.origin).toString() : "",
      defaultPublicUrl: defaultPublicPath ? new URL(defaultPublicPath, window.location.origin).toString() : "",
      shortlinkUrl: shortlinkSlug ? `https://ssvx.cc/${encodeURIComponent(shortlinkSlug)}` : ""
    };
  }

  function renderLeaderboardsPlaceholder(ctx) {
    const { host } = ctx;
    clear(host);
    applyDocumentTitle("Leaderboards");
    host.appendChild(
      buildPageHeading(
        "Leaderboards",
        "Successor surface reserved for the future standalone leaderboard artifact type."
      )
    );
    host.appendChild(
      buildDashboardGrid([
        buildDashboardCard({
          title: "Scaffold only",
          kicker: "Truthful placeholder",
          badge: "Pending",
          state: "planned",
          body: "This route exists so leaderboards can become a first-class public artifact later without reusing the old standalone list-view route forever.",
          meta: ["Legacy /scoreboards resolves here", "No rank backend", "No winner persistence implied"],
          actions: [{ label: "Open wheels", href: "/wheels" }, { label: "Open scoreboards alias", href: "/scoreboards", muted: true }]
        })
      ])
    );
  }

  function getArtifactRouteMatch(pathname) {
    const normalizedPath = normalizePath(pathname);
    for (const config of ARTIFACT_ROUTE_CONFIG) {
      if (normalizedPath.startsWith(config.prefix) && normalizedPath.length > config.prefix.length) {
        return config;
      }
    }
    return null;
  }

  function findArtifactByIdentifier(items, identifier) {
    const requested = String(identifier || "").trim();
    if (!requested) return null;
    const normalizedRequested =
      typeof window.StreamSuitesPublicData?.normalizeArtifactLookup === "function"
        ? window.StreamSuitesPublicData.normalizeArtifactLookup(requested)
        : String(requested).trim().toLowerCase();
    return (
      (items || []).find((entry) => String(entry?.id || "").trim() === requested) ||
      (items || []).find((entry) => String(entry?.routeId || "").trim() === requested) ||
      (items || []).find((entry) => Array.isArray(entry?.routeKeys) && entry.routeKeys.includes(normalizedRequested)) ||
      null
    );
  }

  function syncCanonicalArtifactRoute(item, config) {
    if (!item || !config || config.detailType === "tallies") return;
    const canonicalPath = buildArtifactDetailHref(item);
    const nextUrl = new URL(canonicalPath, window.location.origin);
    if (normalizePath(window.location.pathname) === normalizePath(nextUrl.pathname) && !window.location.search) {
      return;
    }
    window.history.replaceState(window.history.state, "", nextUrl.toString());
  }

  function isArtifactOwner(authState, item) {
    const accountId = String(authState?.accountId || "").trim();
    const ownerAccountId = String(item?.ownerAccountId || "").trim();
    if (!accountId || !ownerAccountId) return false;
    return accountId === ownerAccountId;
  }

  function buildRemoveEndpoint(item) {
    const artifactType = encodeURIComponent(String(item?.type || "").trim().toLowerCase());
    const artifactId = encodeURIComponent(String(item?.id || "").trim());
    return `${AUTH_PUBLIC_ARTIFACTS_URL}/${artifactType}/${artifactId}/remove`;
  }

  function copyTextToClipboard(text) {
    const payload = String(text || "");
    if (!payload) return Promise.resolve(false);

    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      return navigator.clipboard.writeText(payload).then(
        () => true,
        () => false
      );
    }

    try {
      const area = document.createElement("textarea");
      area.value = payload;
      area.setAttribute("readonly", "true");
      area.style.position = "fixed";
      area.style.top = "-9999px";
      area.style.left = "-9999px";
      document.body.appendChild(area);
      area.focus();
      area.select();
      const copied = document.execCommand("copy");
      area.remove();
      return Promise.resolve(copied);
    } catch (_err) {
      return Promise.resolve(false);
    }
  }

  function setShareCopyButtonState(button, copied) {
    if (!button) return;
    const isCopied = copied === true;
    button.classList.toggle("is-copied", isCopied);
    button.setAttribute("aria-label", isCopied ? "Share link copied" : "Copy share link");
    button.setAttribute("title", isCopied ? "Copied" : "Copy");
  }

  function buildNativeShareButton(url, label) {
    const shareButton = create("button", "share-copy-btn share-native-btn");
    shareButton.type = "button";
    shareButton.append(
      createIcon(UI_ICON_MAP.share, "button-icon-mask share-copy-icon share-copy-icon-copy"),
      createIcon(UI_ICON_MAP.check, "button-icon-mask share-copy-icon share-copy-icon-check")
    );
    shareButton.setAttribute("aria-label", `Share ${label} link`);
    shareButton.setAttribute("title", navigator.share ? "Share" : "Share unavailable; copy link");

    let resetTimer = 0;
    shareButton.addEventListener("click", async () => {
      window.clearTimeout(resetTimer);
      if (navigator.share) {
        try {
          await navigator.share({ title: `${label} profile`, url });
          shareButton.classList.add("is-copied");
          shareButton.setAttribute("title", "Shared");
          resetTimer = window.setTimeout(() => {
            shareButton.classList.remove("is-copied");
            shareButton.setAttribute("title", "Share");
          }, 1300);
        } catch (_err) {
          // User cancellation does not need an error state.
        }
        return;
      }

      const copied = await copyTextToClipboard(url);
      shareButton.classList.toggle("is-copied", copied);
      shareButton.setAttribute("title", copied ? "Copied fallback link" : "Copy fallback failed");
      if (copied) {
        resetTimer = window.setTimeout(() => {
          shareButton.classList.remove("is-copied");
          shareButton.setAttribute("title", "Share unavailable; copy link");
        }, 1300);
      }
    });

    return shareButton;
  }

  function buildShareBox(url, options = {}) {
    const box = create("div", "share-box");
    const label = String(options.label || "Share").trim() || "Share";
    if (options.compact !== true) {
      const text = create("code", "share-link-text", url);
      text.setAttribute("title", url);

      const copyButton = create("button", "share-copy-btn");
      copyButton.type = "button";
      copyButton.append(
        createIcon(UI_ICON_MAP.copy, "button-icon-mask share-copy-icon share-copy-icon-copy"),
        createIcon(UI_ICON_MAP.check, "button-icon-mask share-copy-icon share-copy-icon-check")
      );
      setShareCopyButtonState(copyButton, false);

      let resetTimer = 0;
      copyButton.addEventListener("click", () => {
        copyTextToClipboard(url).then((copied) => {
          window.clearTimeout(resetTimer);
          setShareCopyButtonState(copyButton, copied);
          if (!copied) return;
          resetTimer = window.setTimeout(() => {
            setShareCopyButtonState(copyButton, false);
          }, 1300);
        });
      });

      box.append(text, copyButton);
      return box;
    }

    const linkPill = create("a", "share-link-pill");
    linkPill.href = url;
    linkPill.target = "_blank";
    linkPill.rel = "noopener noreferrer";
    linkPill.setAttribute("aria-label", `Open ${label} link`);
    if (options.iconPath) {
      linkPill.appendChild(createIcon(options.iconPath, "share-link-brand-icon"));
    }
    linkPill.appendChild(create("span", "share-link-brand", label));

    const text = create("code", "share-link-text", url);
    text.setAttribute("title", url);
    linkPill.appendChild(text);

    const copyButton = create("button", "share-copy-btn");
    copyButton.type = "button";
    copyButton.append(
      createIcon(UI_ICON_MAP.copy, "button-icon-mask share-copy-icon share-copy-icon-copy"),
      createIcon(UI_ICON_MAP.check, "button-icon-mask share-copy-icon share-copy-icon-check")
    );
    setShareCopyButtonState(copyButton, false);

    let resetTimer = 0;
    copyButton.addEventListener("click", () => {
      copyTextToClipboard(url).then((copied) => {
        window.clearTimeout(resetTimer);
        setShareCopyButtonState(copyButton, copied);
        if (!copied) return;
        resetTimer = window.setTimeout(() => {
          setShareCopyButtonState(copyButton, false);
        }, 1300);
      });
    });

    box.append(linkPill, copyButton, buildNativeShareButton(url, label));
    return box;
  }

  function buildWheelShareField(label, url, options = {}) {
    const shell = create("div", "wheel-share-field");
    const heading = create("div", "wheel-share-field__label", label);
    const row = create("div", "wheel-share-field__row");
    const value = create("code", "wheel-share-field__value", url || String(options.emptyText || "Unavailable"));
    value.title = url || "";
    if (!url) value.dataset.empty = "true";
    const copyButton = create("button", "wheel-share-field__copy", options.copyLabel || "Copy");
    copyButton.type = "button";
    copyButton.disabled = !url;
    copyButton.addEventListener("click", () => {
      if (!url) return;
      copyTextToClipboard(url).then((copied) => {
        copyButton.textContent = copied ? "Copied" : (options.copyLabel || "Copy");
        if (!copied) return;
        window.setTimeout(() => {
          copyButton.textContent = options.copyLabel || "Copy";
        }, 1200);
      });
    });
    row.append(value, copyButton);
    shell.append(heading, row);
    if (options.caption) {
      shell.appendChild(create("div", "wheel-share-field__caption", options.caption));
    }
    return shell;
  }

  function resolveProfileVisibilityReason(profile) {
    const reason = String(profile?.streamsuitesProfileStatusReason || "").trim();
    if (reason) return reason;
    if (profile?.streamsuitesProfileVisible) return "visible";
    if (profile?.streamsuitesProfileEligible === false) return "missing_public_slug";
    if (profile?.streamsuitesProfileEnabled === false) return "disabled_by_account";
    return "unavailable";
  }

  function isProfileVisibleOnStreamSuites(profile) {
    return Boolean(profile?.streamsuitesProfileVisible);
  }

  function buildUnavailableProfileMessage(profile) {
    const reason = resolveProfileVisibilityReason(profile);
    if (reason === "disabled_by_account") {
      return "This StreamSuites public profile is currently unavailable because public profile visibility is disabled in the authoritative account settings.";
    }
    if (reason === "missing_public_slug") {
      return "This account does not currently have a canonical public profile slug, so the StreamSuites public profile cannot be shown.";
    }
    return "This StreamSuites public profile is currently unavailable.";
  }

  function buildFindMeHereStatusText(profile) {
    const reason = String(profile?.findmehereStatusReason || "").trim();
    if (profile?.findmehereVisible) return "";
    if (reason === "creator_capable_required" || profile?.viewerOnly) {
      return "FindMeHere listing is not available for viewer-only public accounts.";
    }
    if (reason === "disabled_by_account") {
      return "FindMeHere listing is currently disabled for this profile.";
    }
    if (reason === "missing_public_slug") {
      return "FindMeHere listing is unavailable until this account has a canonical public slug.";
    }
    return "FindMeHere listing is not enabled for this profile.";
  }

  function buildStreamSuitesVisibilityText(profile) {
    const reason = resolveProfileVisibilityReason(profile);
    if (reason === "visible") {
      return "This StreamSuites public profile is visible on the canonical /u/<slug> route.";
    }
    if (reason === "disabled_by_account") {
      return "This StreamSuites public profile is hidden because visibility is disabled in the authoritative account settings.";
    }
    if (reason === "missing_public_slug") {
      return "A canonical public slug is required before this StreamSuites public profile can be shown.";
    }
    return "This StreamSuites public profile is currently unavailable.";
  }

  function buildFindMeHereUpgradeText(profile) {
    const reason = String(profile?.findmehereStatusReason || "").trim();
    if (reason === "missing_public_slug") {
      return "FindMeHere also requires a canonical public slug, but this account still needs a creator-capable upgrade before listing is possible.";
    }
    if (reason === "disabled_by_account" && profile?.creatorCapable) {
      return "FindMeHere is available only on creator-capable accounts and is currently disabled in the authoritative settings.";
    }
    return "FindMeHere listing is creator-only. Viewer/public accounts can manage their StreamSuites profile here, then upgrade through the creator flow when FindMeHere listing is needed.";
  }

  function normalizeProfileEditorLinks(socialInputs) {
    return Object.entries(socialInputs).reduce((acc, [key, input]) => {
      const value = String(input?.value || "").trim();
      if (!value) return acc;
      acc[key] = value;
      return acc;
    }, {});
  }

  function validateSettingsFormFields(fields) {
    const errors = [];
    (fields.urlInputs || []).forEach((input) => {
      if (!(input instanceof HTMLInputElement)) return;
      const value = String(input.value || "").trim();
      if (!value) return;
      if (!input.checkValidity()) {
        const label = String(input.dataset.label || input.name || "Field").trim();
        errors.push(`${label} must be a valid URL.`);
      }
    });
    const bioLength = String(fields.bioInput?.value || "").trim().length;
    if (bioLength > 1200) {
      errors.push("Bio must be 1200 characters or fewer.");
    }
    return errors;
  }

  function syncViewerSettingsForm(profile, formState) {
    if (!profile || !formState) return;
    formState.profile = profile;
    formState.avatarPreview.style.backgroundImage = profile.avatar ? `url(${profile.avatar})` : "";
    formState.avatarPreview.classList.toggle("has-image", Boolean(profile.avatar));
    formState.avatarPreview.textContent = profile.avatar ? "" : textInitial(profile.displayName || "P");
    formState.avatarUrlInput.value = profile.avatar || "";
    formState.displayNameInput.value = profile.displayName || "";
    formState.slugInput.value = profile.publicSlug || "";
    formState.slugAliases.textContent = (profile.slugAliases || []).length
      ? `Aliases: ${(profile.slugAliases || []).join(", ")}`
      : "No historical slug aliases are currently exposed.";
    formState.streamSuitesToggle.checked = profile.streamsuitesProfileEnabled === true;
    formState.streamSuitesStatus.textContent = buildStreamSuitesVisibilityText(profile);
    formState.listingToggle.checked = profile.isListed !== false;
    formState.anonymousToggle.checked = profile.isAnonymous === true;
    formState.coverInput.value = profile.coverImageUrl || "";
    formState.backgroundInput.value = profile.backgroundImageUrl || "";
    formState.bioInput.value = profile.bio || "";
    Object.entries(formState.socialInputs).forEach(([key, input]) => {
      input.value = profile.socialLinks?.[key] || "";
    });

    const canonicalUrl = String(profile.streamsuitesProfileUrl || "").trim();
    const visibleUrl = String(profile.streamsuitesShareUrl || profile.streamsuitesProfileUrl || "").trim();
    formState.sharePreview.textContent = canonicalUrl || "Canonical public URL unavailable until a slug is assigned.";
    formState.sharePreview.dataset.empty = canonicalUrl ? "false" : "true";
    formState.shareCopy.disabled = !canonicalUrl;
    formState.sharePublicStatus.textContent = visibleUrl
      ? "Currently public on StreamSuites."
      : buildStreamSuitesVisibilityText(profile);
    formState.findMeHereStatus.textContent = buildFindMeHereUpgradeText(profile);
    formState.findMeHereReason.textContent = buildFindMeHereStatusText(profile);
    formState.findMeHereUrl.textContent = String(profile.findmehereProfileUrl || "").trim() || "Unavailable for this account type";
  }

  function buildProfileShareSection(profile, renderOptions = {}) {
    const section = create("div", "profile-share-section");
    if (renderOptions.compact === true) section.classList.add("profile-share-section--compact");
    const optionGrid = create("div", "profile-share-grid");
    const streamSuitesUrl = String(profile?.streamsuitesShareUrl || profile?.streamsuitesProfileUrl || "").trim();
    const findMeHereUrl = profile?.findmehereVisible ? String(profile?.findmehereShareUrl || profile?.findmehereProfileUrl || "").trim() : "";

    const createShareOption = (label, iconPath, url, tone = "") => {
      const card = create("div", `profile-share-option${tone ? ` ${tone}` : ""}`);
      if (renderOptions.compact === true) {
        card.appendChild(buildShareBox(url, { label, iconPath, compact: true }));
      } else {
        const title = create("div", "profile-share-option-title");
        title.append(createIcon(iconPath, "profile-share-option-icon"), create("span", "", label.toUpperCase()));
        card.append(title, buildShareBox(url));
      }
      return card;
    };

    if (streamSuitesUrl) {
      optionGrid.appendChild(createShareOption("StreamSuites", UI_ICON_MAP.streamsuites, streamSuitesUrl));
    }

    if (findMeHereUrl) {
      optionGrid.appendChild(createShareOption("FindMeHere", UI_ICON_MAP.findmehere, findMeHereUrl));
    } else {
      const note = create("div", "profile-share-note", buildFindMeHereStatusText(profile));
      if (note.textContent) {
        optionGrid.appendChild(note);
      }
    }

    section.appendChild(optionGrid);
    return section;
  }

  function buildAuthorityRequestPanel(context, options = {}) {
    const authorityContext = createAuthorityContext(context);
    const authState = options.authState || null;
    const openAuthModal = typeof options.openAuthModal === "function" ? options.openAuthModal : null;
    const panel = create("section", "profile-card authority-request-panel");
    const header = create("div", "profile-inline-header");
    header.append(create("h3", "", authorityContext?.title || "Public authority requests"));
    panel.appendChild(header);

    const intro = create(
      "p",
      "authority-request-copy",
      authorityContext?.summary ||
        "Use this panel to submit a real public authority request once the current page can resolve a real identity or artifact target."
    );
    panel.appendChild(intro);

    const meta = create("div", "dashboard-meta-list");
    (authorityContext?.meta || []).forEach((entry) => {
      if (!entry) return;
      meta.appendChild(create("span", "dashboard-meta-pill", entry));
    });
    if (meta.childElementCount) {
      panel.appendChild(meta);
    }

    const noteRow = create("label", "ss-form-row");
    const noteLabel = create("span", "", "Request note");
    const noteInput = create("textarea", "authority-request-note");
    noteInput.rows = 4;
    noteInput.placeholder = "Add the review context operators should see.";
    noteRow.append(noteLabel, noteInput);
    panel.appendChild(noteRow);

    const status = create("div", "authority-request-status muted");
    panel.appendChild(status);

    const actionGrid = create("div", "authority-request-actions");
    Object.entries(PUBLIC_AUTHORITY_TYPE_CONFIG).forEach(([requestType, config]) => {
      const button = create("button", "dashboard-card-link");
      button.type = "button";
      button.textContent = config.buttonLabel;

      const targetAvailable =
        requestType === "claim_profile" || requestType === "assign_to_profile"
          ? Boolean(authorityContext?.targetIdentityCode)
          : Boolean(authorityContext?.targetIdentityCode || authorityContext?.targetArtifactCode);
      const authRequired = config.requiresAuth === true;
      const needsAuthPrompt = authRequired && !authState?.authenticated;
      const unavailableReason =
        authorityContext?.unsupportedReason ||
        (requestType === "claim_profile" || requestType === "assign_to_profile"
          ? "A real identity target is required for this request type."
          : "A real identity or artifact target is required for this request type.");

      if (!targetAvailable) {
        button.disabled = true;
        button.title = unavailableReason;
      } else if (needsAuthPrompt) {
        button.title = "Sign in is required before this request can be submitted.";
      }

      button.addEventListener("click", async () => {
        if (!targetAvailable) {
          status.textContent = unavailableReason;
          status.className = "authority-request-status authority-request-status-error";
          return;
        }
        if (needsAuthPrompt) {
          status.textContent = "Sign in to submit that request type.";
          status.className = "authority-request-status muted";
          openAuthModal?.("login");
          return;
        }

        const originalLabel = button.textContent;
        status.textContent = `${config.label} submitting…`;
        status.className = "authority-request-status muted";
        button.disabled = true;
        button.textContent = "Submitting…";
        try {
          const payload = await submitPublicAuthorityRequest({
            request_type: requestType,
            target_identity_code: authorityContext?.targetIdentityCode || undefined,
            target_artifact_code: authorityContext?.targetArtifactCode || undefined,
            requester_note: String(noteInput.value || "").trim() || undefined
          });
          const requestId = String(payload?.request?.request_id || "").trim();
          if (payload?.duplicate === true) {
            status.textContent = requestId
              ? `A pending ${config.label.toLowerCase()} request already exists for this target. (${requestId})`
              : `A pending ${config.label.toLowerCase()} request already exists for this target.`;
            status.className = "authority-request-status authority-request-status-warning";
          } else {
            status.textContent = requestId
              ? `${config.label} submitted for review. (${requestId})`
              : `${config.label} submitted for review.`;
            status.className = "authority-request-status authority-request-status-success";
          }
          if (typeof options.onSubmitted === "function") {
            options.onSubmitted(payload?.request || null, payload?.duplicate === true);
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : "Request failed.";
          status.textContent = message;
          status.className = "authority-request-status authority-request-status-error";
          if ((error?.status === 401 || error?.status === 403) && needsAuthPrompt) {
            openAuthModal?.("login");
          }
        } finally {
          button.disabled = !targetAvailable;
          button.textContent = originalLabel;
        }
      });

      const action = create("div", "authority-request-action");
      const help = create("p", "authority-request-action-help", config.help);
      action.append(button, help);
      actionGrid.appendChild(action);
    });
    panel.appendChild(actionGrid);

    panel.appendChild(
      create(
        "p",
        "dashboard-card-footnote authority-request-footnote",
        "Approved requests update review state and metadata first. Profile claim or assignment approval does not imply automatic transfer, and removal approval suppresses public visibility rather than deleting the underlying record."
      )
    );

    return panel;
  }

  function buildAuthorityHistoryCard(request) {
    const type = String(request?.request_type || "").trim().toLowerCase();
    const status = String(request?.status || "").trim().toLowerCase();
    const card = create("article", "dashboard-card authority-history-card");
    card.dataset.state = status || "pending";

    const head = create("div", "dashboard-card-head");
    const titleWrap = create("div", "dashboard-card-title-wrap");
    titleWrap.append(
      create("h3", "dashboard-card-title", publicAuthorityTypeLabel(type)),
      create("p", "dashboard-card-kicker", request?.created_at ? `Submitted ${String(request.created_at)}` : "Submission time unavailable")
    );
    head.append(titleWrap, create("span", "dashboard-state-badge", publicAuthorityStatusLabel(status)));
    card.appendChild(head);

    const targetBits = [];
    if (request?.target_identity?.display_name) targetBits.push(request.target_identity.display_name);
    if (request?.target_identity_code) targetBits.push(request.target_identity_code);
    if (request?.target_artifact?.display_label || request?.target_artifact?.title) {
      targetBits.push(String(request.target_artifact.display_label || request.target_artifact.title));
    }
    if (request?.target_artifact_code) targetBits.push(request.target_artifact_code);
    card.appendChild(
      create(
        "p",
        "dashboard-card-body",
        targetBits.length
          ? `Target: ${targetBits.join(" | ")}`
          : "Target metadata was not included in the current response."
      )
    );

    const meta = create("div", "dashboard-meta-list");
    [
      request?.updated_at ? `Updated ${String(request.updated_at)}` : "",
      request?.resolved_at ? `Resolved ${String(request.resolved_at)}` : "",
      request?.requester_user_code ? `Requester ${String(request.requester_user_code)}` : ""
    ].forEach((entry) => {
      if (!entry) return;
      meta.appendChild(create("span", "dashboard-meta-pill", entry));
    });
    if (meta.childElementCount) {
      card.appendChild(meta);
    }

    if (request?.requester_note) {
      card.appendChild(create("p", "dashboard-card-footnote", `Submitted note: ${String(request.requester_note)}`));
    }
    if (request?.resolution_note) {
      card.appendChild(create("p", "dashboard-card-footnote", `Admin note: ${String(request.resolution_note)}`));
    } else if (status === "pending") {
      card.appendChild(create("p", "dashboard-card-footnote", "Pending review. No admin resolution note yet."));
    }
    return card;
  }

  function buildExternalSourceBlock(item) {
    const wrap = create("div", "external-source");
    const link = create("a", "external-source-link");
    const sourceUrl = String(item?.sourceUrl || "").trim();
    const hasSource = Boolean(sourceUrl);
    if (hasSource) {
      link.href = sourceUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    } else {
      link.href = "#";
      link.classList.add("is-disabled");
      link.setAttribute("aria-disabled", "true");
      link.tabIndex = -1;
    }

    const icon = create("img", "chip-icon");
    icon.src = "/assets/icons/rumble.svg";
    icon.alt = "Rumble icon";
    const text = item?.type === "clips" ? "Watch on Rumble" : "Open on Rumble";
    link.append(icon, create("span", "", hasSource ? text : `${text} (Unavailable)`));

    wrap.appendChild(link);
    return wrap;
  }

  function readDetailLayoutPreference() {
    try {
      const raw = window.localStorage.getItem(DETAIL_LAYOUT_STORAGE_KEY);
      if (raw === "stack" || raw === "side") return raw;
    } catch (_err) {
      // Ignore storage failures.
    }
    return "side";
  }

  function writeDetailLayoutPreference(value) {
    try {
      window.localStorage.setItem(DETAIL_LAYOUT_STORAGE_KEY, value === "stack" ? "stack" : "side");
    } catch (_err) {
      // Ignore storage failures.
    }
  }

  function buildLayoutToggle(layout) {
    const toolbar = create("div", "detail-toolbar");
    const label = create("span", "detail-toolbar-label", "Layout");
    const group = create("div", "detail-layout-toggle-group");

    const sideButton = create("button", "detail-layout-toggle");
    sideButton.type = "button";
    sideButton.dataset.layout = "side";
    sideButton.setAttribute("aria-label", "Show side panel layout");
    sideButton.appendChild(createIcon(UI_ICON_MAP.layoutSide, "button-icon-mask"));

    const stackButton = create("button", "detail-layout-toggle");
    stackButton.type = "button";
    stackButton.dataset.layout = "stack";
    stackButton.setAttribute("aria-label", "Stack details under media");
    stackButton.appendChild(createIcon(UI_ICON_MAP.layoutStack, "button-icon-mask"));

    const applyLayout = (nextLayout, persist) => {
      const layoutMode = nextLayout === "stack" ? "stack" : "side";
      layout.classList.toggle("is-stacked", layoutMode === "stack");
      sideButton.classList.toggle("active", layoutMode === "side");
      stackButton.classList.toggle("active", layoutMode === "stack");
      sideButton.setAttribute("aria-pressed", layoutMode === "side" ? "true" : "false");
      stackButton.setAttribute("aria-pressed", layoutMode === "stack" ? "true" : "false");
      if (persist) writeDetailLayoutPreference(layoutMode);
    };

    sideButton.addEventListener("click", () => applyLayout("side", true));
    stackButton.addEventListener("click", () => applyLayout("stack", true));

    group.append(sideButton, stackButton);
    toolbar.append(label, group);

    applyLayout(readDetailLayoutPreference(), false);
    return toolbar;
  }

  function buildVoteBreakdownList(items, percentField = "percent") {
    const list = create("ul", "vote-list");
    (items || []).forEach((entry) => {
      const li = create("li", "vote-item");
      const label = create("strong", "", entry?.label || "Entry");
      const meta = create("span", "timestamp");
      const percent = Number(entry?.[percentField]) || 0;
      const votes = Number(entry?.votes ?? entry?.value ?? 0);
      meta.textContent = `${percent}% | ${formatNumber(votes)} votes`;
      li.append(label, meta);
      list.appendChild(li);
    });
    return list;
  }

  function buildBarRows(items, percentField = "percent") {
    const rows = create("div", "bar-rows");
    (items || []).forEach((entry) => {
      const row = create("div", "bar-row");
      const label = create("div", "bar-label", entry?.label || "Entry");
      const meter = create("div", "bar-meter");
      const fill = create("span", "bar-fill");
      const percent = Math.max(0, Math.min(100, Number(entry?.[percentField]) || 0));
      fill.style.width = `${percent}%`;
      if (entry?.color) {
        fill.style.background = `linear-gradient(90deg, ${entry.color}, ${entry.color})`;
      }
      meter.appendChild(fill);
      const meta = create("div", "bar-meta");
      const votes = Number(entry?.votes ?? entry?.value ?? 0);
      meta.textContent = `${percent}% | ${formatNumber(votes)} votes`;
      row.append(label, meter, meta);
      rows.appendChild(row);
    });
    return rows;
  }

  function buildVisualizationPanel(item, config) {
    const panel = create("div", "visualization-panel");

    const top = create("div", "viz-top");
    const left = create("div", "viz-top-left");
    const toggle = create("div", "viz-toggle");
    toggle.setAttribute("role", "tablist");
    toggle.setAttribute("aria-label", "Select visualization format");

    const barBtn = create("button", "viz-toggle-btn is-active", "Bar view");
    barBtn.type = "button";
    barBtn.dataset.view = "bar";
    barBtn.setAttribute("aria-pressed", "true");
    toggle.appendChild(barBtn);

    const pieBtn = create("button", "viz-toggle-btn", "Pie view");
    pieBtn.type = "button";
    pieBtn.dataset.view = "pie";
    pieBtn.setAttribute("aria-pressed", "false");
    toggle.appendChild(pieBtn);

    let customBtn = null;
    if (config.detailType === "tallies") {
      customBtn = create("button", "viz-toggle-btn", "Custom pie");
      customBtn.type = "button";
      customBtn.dataset.view = "custom";
      customBtn.setAttribute("aria-pressed", "false");
      toggle.appendChild(customBtn);
    }

    const hint = create("span", "viz-hint", "Expanded detail visualization");
    left.append(toggle, hint);
    top.appendChild(left);

    const stage = create("div", "viz-stage");

    const barView = create("div", "viz-view active");
    barView.dataset.view = "bar";
    const pieView = create("div", "viz-view");
    pieView.dataset.view = "pie";
    pieView.hidden = true;

    let items = [];
    let percentField = "percent";
    if (config.detailType === "polls") {
      items = item.options || [];
      percentField = "percent";
    } else if (config.detailType === "tallies") {
      items = item.entries || [];
      percentField = "sharePercent";
    } else {
      items = item.entries || [];
      percentField = "percent";
    }

    barView.appendChild(buildBarRows(items, percentField));
    pieView.appendChild(buildPiePreview(items, percentField));

    stage.append(barView, pieView);

    if (customBtn) {
      const customView = create("div", "viz-view");
      customView.dataset.view = "custom";
      customView.hidden = true;
      const customPie = create("div", "custom-pie-shell");
      customPie.appendChild(buildPiePreview(items, percentField));
      const center = create("div", "custom-pie-center");
      const logo = create("img");
      logo.src = item.creator?.avatar || "/assets/logos/logocircle.png";
      logo.alt = `${item.creator?.displayName || "Creator"} avatar`;
      center.appendChild(logo);
      customPie.appendChild(center);
      customView.appendChild(customPie);
      stage.appendChild(customView);
    }

    const views = Array.from(stage.querySelectorAll(".viz-view"));
    const buttons = [barBtn, pieBtn].concat(customBtn ? [customBtn] : []);
    const setView = (name) => {
      buttons.forEach((btn) => {
        const active = btn.dataset.view === name;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-pressed", active ? "true" : "false");
      });
      views.forEach((view) => {
        const active = view.dataset.view === name;
        view.classList.toggle("active", active);
        view.hidden = !active;
      });
    };
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => setView(btn.dataset.view));
    });

    panel.append(top, stage);
    return panel;
  }

  function buildDetailMain(item, config, helpers) {
    const main = create("article", "detail-main");

    if (config.detailType === "clips") {
      const player = create("div", "detail-player");
      if (item.mediaUrl) {
        if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(item.mediaUrl)) {
          const video = create("video");
          video.controls = true;
          video.src = item.mediaUrl;
          player.appendChild(video);
        } else {
          const iframe = create("iframe");
          iframe.src = item.mediaUrl;
          iframe.title = item.title;
          iframe.loading = "lazy";
          player.appendChild(iframe);
        }
      } else {
        const image = create("img");
        image.src = item.thumbnail || "/assets/backgrounds/seodash.jpg";
        image.alt = `${item.title || item.question} preview`;
        player.appendChild(image);
      }
      const copy = create("div", "detail-copy");
      copy.append(create("h2", "", item.title || item.question || "Detail"));
      copy.append(create("p", "", item.summary || "No description available."));
      main.append(player, copy);
      return main;
    }

    const detailShell = create("div", "detail-shell");
    const vizCard = create("div", "detail-card");
    const vizHeading = create("div", "detail-heading");
    const detailTypeLabels = {
      polls: "Poll",
      scoreboards: "List view",
      tallies: "Tally"
    };
    const typeLabel = detailTypeLabels[config.detailType] || "Artifact";
    vizHeading.append(
      create("h3", "detail-title", `${typeLabel} overview`),
      create("span", "timestamp", helpers.toTimestamp(item.updatedAt || item.createdAt))
    );
    vizCard.append(vizHeading, buildVisualizationPanel(item, config));

    const secondaryCard = create("div", "detail-card");
    const secondaryHeading = create("div", "detail-heading");
    const secondaryTitle =
      config.detailType === "scoreboards"
        ? "Metadata"
        : config.detailType === "tallies"
          ? "Tally breakdown"
          : "Vote breakdown";
    secondaryHeading.append(create("h3", "detail-title", secondaryTitle));
    secondaryCard.appendChild(secondaryHeading);

    if (config.detailType === "scoreboards") {
      const list = create("ul", "meta-list");
      const totalEntries = (item.entries || []).length;
      const totalValue = (item.entries || []).reduce((sum, entry) => sum + (Number(entry?.value) || 0), 0);
      const items = [
        ["Mode", "Expanded scoreboard detail"],
        ["Entries", String(totalEntries)],
        ["Total value", formatNumber(totalValue)],
        ["Status", item.status || "Pending"]
      ];
      items.forEach(([label, value]) => {
        const li = create("li");
        li.innerHTML = `<strong>${label}:</strong> ${value}`;
        list.appendChild(li);
      });
      secondaryCard.appendChild(list);
    } else {
      const entries = config.detailType === "polls" ? item.options || [] : item.entries || [];
      const percentField = config.detailType === "tallies" ? "sharePercent" : "percent";
      secondaryCard.appendChild(buildVoteBreakdownList(entries, percentField));
    }

    detailShell.append(vizCard, secondaryCard);
    main.appendChild(detailShell);
    return main;
  }

  function buildDetailSide(item, helpers, options = {}) {
    const authState = options.authState || null;
    const onRemoved = options.onRemoved;
    const openAuthModal = typeof options.openAuthModal === "function" ? options.openAuthModal : null;
    const side = create("aside", "detail-side");

    const profileCard = create("div", "profile-card");
    profileCard.appendChild(buildCreatorMeta(item.creator, { expanded: true, includeRoleChip: true, enableHover: true }));
    profileCard.appendChild(buildDetailRows(item, helpers));

    const profileLink = create("a", "see-all", "Open profile");
    profileLink.href = buildProfileHref(item.profileCode || item.profileId || "public-user");

    const shareLabel = create("div", "detail-subtle-label", "Share Link");
    const shareUrl = buildShareLink(item);
    const shareBox = buildShareBox(shareUrl);
    const sourceLabel = create("div", "detail-subtle-label", "External Link");
    const sourceBlock = item?.type === "clips" ? buildExternalSourceBlock(item) : null;

    profileCard.append(profileLink, shareLabel, shareBox);
    if (sourceBlock) {
      profileCard.append(sourceLabel, sourceBlock);
    }

    const showOwnerRemoveAction =
      !item?.isRemoved &&
      Boolean(authState?.authenticated) &&
      isArtifactOwner(authState, item);
    if (showOwnerRemoveAction) {
      const ownerActionLabel = create("div", "detail-subtle-label", "Owner Action");
      const ownerActionWrap = create("div", "detail-owner-actions");
      const removeButton = create("button", "detail-remove-btn", "Remove");
      removeButton.type = "button";
      const inlineError = create("div", "detail-remove-error");

      removeButton.addEventListener("click", async () => {
        inlineError.textContent = "";
        const confirmed = window.confirm("Remove this artifact from public view?");
        if (!confirmed) return;

        removeButton.disabled = true;
        try {
          const response = await fetch(buildRemoveEndpoint(item), {
            method: "POST",
            cache: "no-store",
            credentials: "include",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ reason: "user_request" })
          });
          let payload = null;
          try {
            payload = await response.json();
          } catch (_err) {
            payload = null;
          }

          if (!response.ok || payload?.success === false) {
            const detail =
              String(payload?.error || "").trim() ||
              `Remove failed (${response.status})`;
            inlineError.textContent = detail;
            return;
          }

          item.isRemoved = true;
          item.status = "Removed";
          item.visibility = "removed_by_owner";
          item.removedState = "removed_by_owner";
          if (typeof onRemoved === "function") onRemoved();
        } catch (_err) {
          inlineError.textContent = "Remove failed. Please retry.";
        } finally {
          removeButton.disabled = false;
        }
      });

      ownerActionWrap.append(removeButton, inlineError);
      profileCard.append(ownerActionLabel, ownerActionWrap);
    }

    side.appendChild(profileCard);
    side.appendChild(
      buildAuthorityRequestPanel(resolveArtifactAuthorityContext(item), {
        authState,
        openAuthModal
      })
    );

    if (item.resultsHref) {
      const resultsLink = create("a", "see-all", "Open results page");
      resultsLink.href = item.resultsHref;
      side.appendChild(resultsLink);
    }

    return side;
  }

  function createSvgElement(name, attributes = {}) {
    const node = document.createElementNS("http://www.w3.org/2000/svg", name);
    Object.entries(attributes).forEach(([key, value]) => {
      if (value == null) return;
      node.setAttribute(key, String(value));
    });
    return node;
  }

  function polarToCartesian(cx, cy, radius, angle) {
    const radians = ((Number(angle) || 0) - 90) * (Math.PI / 180);
    return {
      x: cx + radius * Math.cos(radians),
      y: cy + radius * Math.sin(radians)
    };
  }

  function describeWheelSlice(cx, cy, radius, startAngle, endAngle) {
    const start = polarToCartesian(cx, cy, radius, startAngle);
    const end = polarToCartesian(cx, cy, radius, endAngle);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
  }

  function clampNumber(value, min, max, fallback = min) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return fallback;
    return Math.max(min, Math.min(max, numeric));
  }

  function normalizeWheelAngle(angle) {
    const numeric = Number(angle) || 0;
    return ((numeric % 360) + 360) % 360;
  }

  function getWheelEntryName(entry) {
    return String(entry?.displayName || entry?.label || "Entrant").trim() || "Entrant";
  }

  function getWheelEntryInitials(entry) {
    const words = getWheelEntryName(entry).split(/\s+/).filter(Boolean);
    if (!words.length) return "?";
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return `${words[0][0] || ""}${words[1][0] || ""}`.toUpperCase();
  }

  function getWheelSegments(entries) {
    const list = Array.isArray(entries) ? entries : [];
    const totalWeight = list.reduce((sum, entry) => sum + Math.max(0, Number(entry?.weight) || 0), 0) || 1;
    let cursor = 0;
    return list.map((entry) => {
      const weight = Math.max(0.0001, Number(entry?.weight) || 0.0001);
      const sliceAngle = (weight / totalWeight) * 360;
      const startAngle = cursor;
      const endAngle = cursor + sliceAngle;
      const midAngle = startAngle + sliceAngle / 2;
      cursor = endAngle;
      return {
        entry,
        weight,
        startAngle,
        endAngle,
        sliceAngle,
        midAngle,
        chance: totalWeight > 0 ? (weight / totalWeight) * 100 : 0
      };
    });
  }

  function resolveEntryColor(entry, item, index) {
    return (
      entry?.color ||
      (item?.palette?.segment_colors || [])[index % Math.max(1, (item?.palette?.segment_colors || []).length)] ||
      "#64748b"
    );
  }

  function getWheelLabelText(entry, item) {
    if (item?.presentation?.show_display_names_on_slices === false) return "";
    const mode = String(item?.presentation?.slice_label_mode || "full_name").trim();
    if (mode === "initials") return getWheelEntryInitials(entry);
    if (mode === "avatar") return "";
    const label = getWheelEntryName(entry);
    return label.length > 18 ? `${label.slice(0, 17)}…` : label;
  }

  function shouldFlipSliceLabel(angle) {
    const normalized = normalizeWheelAngle(angle);
    return normalized > 90 && normalized < 270;
  }

  function resolveWheelPointerEntry(segments, rotation) {
    if (!Array.isArray(segments) || !segments.length) return null;
    const pointerAngle = normalizeWheelAngle(360 - rotation);
    return (
      segments.find((segment) => pointerAngle >= segment.startAngle && pointerAngle < segment.endAngle) ||
      segments[segments.length - 1] ||
      null
    );
  }

  function resolveWheelSoundConfig(item, category) {
    const sound = item?.presentation?.sound && typeof item.presentation.sound === "object"
      ? item.presentation.sound[category]
      : null;
    const assetIds = WHEEL_SOUND_LIBRARY[category] || [];
    const assetId = String(sound?.asset_id || "").trim();
    return {
      enabled: item?.presentation?.sound_enabled !== false && sound?.enabled !== false,
      assetId: assetIds.includes(assetId) ? assetId : assetIds[0] || ""
    };
  }

  function buildWheelSoundUrl(category, assetId) {
    if (!category || !assetId) return "";
    return `${WHEEL_SOUND_BASE}/${category}/${assetId}`;
  }

  function buildWheelAvatarTone(entry) {
    const color = String(entry?.color || "").trim();
    if (!/^#?[0-9a-f]{6}$/i.test(color)) return "light";
    const hex = color.replace("#", "");
    const red = Number.parseInt(hex.slice(0, 2), 16);
    const green = Number.parseInt(hex.slice(2, 4), 16);
    const blue = Number.parseInt(hex.slice(4, 6), 16);
    const luminance = (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;
    return luminance > 0.55 ? "dark" : "light";
  }

  function buildWheelSvg(item) {
    const entries = Array.isArray(item?.entries) ? item.entries : [];
    const palette = item?.palette || {};
    const segments = getWheelSegments(entries);
    const graphicIdBase = String(item?.artifactCode || item?.artifact_code || item?.slug || item?.title || "wheel")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "wheel";
    const glowId = `${graphicIdBase}-center-glow`;
    const centerClipId = `${graphicIdBase}-center-clip`;
    const centerImageUrl = String(item?.presentation?.center_image_url || item?.presentation?.centerImageUrl || WHEEL_CENTER_DEFAULT).trim() || WHEEL_CENTER_DEFAULT;
    const svg = createSvgElement("svg", {
      viewBox: "0 0 480 480",
      role: "img",
      "aria-label": `${item?.title || "Wheel"} artifact viewer`
    });
    svg.classList.add("wheel-svg");

    const defs = createSvgElement("defs");
    const glowGradient = createSvgElement("radialGradient", { id: glowId, cx: "50%", cy: "50%", r: "65%" });
    glowGradient.append(
      createSvgElement("stop", { offset: "0%", "stop-color": palette.glow_color || "#4de9ff", "stop-opacity": "0.36" }),
      createSvgElement("stop", { offset: "100%", "stop-color": palette.background_color || "#08111f", "stop-opacity": "0" })
    );
    const centerClip = createSvgElement("clipPath", { id: centerClipId });
    centerClip.appendChild(createSvgElement("circle", { cx: 240, cy: 240, r: 48 }));
    defs.append(glowGradient, centerClip);
    svg.appendChild(defs);

    svg.append(
      createSvgElement("circle", {
        cx: 240,
        cy: 240,
        r: 228,
        fill: palette.background_color || "#08111f",
        stroke: palette.trim_color || "#7c92ff",
        "stroke-width": 10
      }),
      createSvgElement("circle", {
        cx: 240,
        cy: 240,
        r: 222,
        fill: `url(#${glowId})`,
        opacity: "0.88"
      })
    );

    segments.forEach((segment, index) => {
      const entry = segment.entry;
      const color = resolveEntryColor(entry, item, index);
      const group = createSvgElement("g", {
        class: "wheel-slice-group",
        "data-wheel-entry-id": String(entry?.entryId || entry?.id || `entry-${index + 1}`),
        "data-mid-angle": segment.midAngle.toFixed(3),
        "data-offset-x": (Math.cos(((segment.midAngle - 90) * Math.PI) / 180) * 8).toFixed(3),
        "data-offset-y": (Math.sin(((segment.midAngle - 90) * Math.PI) / 180) * 8).toFixed(3)
      });
      const slice = createSvgElement("path", {
        class: "wheel-slice",
        d: describeWheelSlice(240, 240, 208, segment.startAngle, segment.endAngle),
        fill: color,
        stroke: "rgba(8, 14, 24, 0.72)",
        "stroke-width": 2.4
      });
      const sheen = createSvgElement("path", {
        class: "wheel-slice-sheen",
        d: describeWheelSlice(240, 240, 184, segment.startAngle, segment.endAngle),
        fill: "rgba(255, 255, 255, 0.08)"
      });
      group.append(slice, sheen);

      if (item?.presentation?.show_entry_labels !== false && segment.sliceAngle >= 8) {
        const labelPoint = polarToCartesian(240, 240, segment.sliceAngle >= 24 ? 136 : 150, segment.midAngle);
        const labelGroup = createSvgElement("g", { class: "wheel-slice-label" });
        let labelRotation = segment.midAngle - 90;
        if (shouldFlipSliceLabel(segment.midAngle)) {
          labelRotation += 180;
        }
        const labelText = getWheelLabelText(entry, item);
        const labelMode = String(item?.presentation?.slice_label_mode || "full_name").trim();
        if (labelMode === "avatar" && segment.sliceAngle >= 12) {
          const avatarRing = createSvgElement("circle", {
            cx: labelPoint.x,
            cy: labelPoint.y,
            r: 19,
            fill: "rgba(9, 15, 26, 0.76)",
            stroke: "rgba(255, 255, 255, 0.28)",
            "stroke-width": 1.6
          });
          labelGroup.appendChild(avatarRing);
          if (entry?.avatarUrl) {
            labelGroup.appendChild(
              createSvgElement("image", {
                href: entry.avatarUrl,
                x: labelPoint.x - 15,
                y: labelPoint.y - 15,
                width: 30,
                height: 30,
                preserveAspectRatio: "xMidYMid slice",
                clipPath: ""
              })
            );
          } else {
            const initials = createSvgElement("text", {
              x: labelPoint.x,
              y: labelPoint.y,
              fill: palette.text_color || "#f8fafc",
              "font-size": "12",
              "font-weight": "800",
              "text-anchor": "middle",
              "dominant-baseline": "middle"
            });
            initials.textContent = getWheelEntryInitials(entry);
            labelGroup.appendChild(initials);
          }
        } else if (labelText) {
          const text = createSvgElement("text", {
            x: labelPoint.x,
            y: labelPoint.y,
            fill: palette.text_color || "#f8fafc",
            "font-size": segment.sliceAngle >= 22 ? "15" : "12",
            "font-weight": "800",
            "text-anchor": "middle",
            "dominant-baseline": "middle",
            transform: `rotate(${labelRotation} ${labelPoint.x} ${labelPoint.y})`
          });
          text.textContent = labelText;
          labelGroup.appendChild(text);
        }
        group.appendChild(labelGroup);
      }

      svg.appendChild(group);
    });

    svg.append(
      createSvgElement("circle", {
        cx: 240,
        cy: 240,
        r: 66,
        fill: "rgba(6, 10, 18, 0.9)",
        stroke: palette.trim_color || palette.accent_color || "#7c92ff",
        "stroke-width": 4
      }),
      createSvgElement("image", {
        href: centerImageUrl,
        x: 192,
        y: 192,
        width: 96,
        height: 96,
        preserveAspectRatio: "xMidYMid slice",
        "clip-path": `url(#${centerClipId})`
      }),
      createSvgElement("circle", {
        cx: 240,
        cy: 240,
        r: 52,
        fill: "rgba(255, 255, 255, 0.02)",
        stroke: "rgba(255, 255, 255, 0.16)",
        "stroke-width": 1.8
      }),
      createSvgElement("circle", {
        cx: 240,
        cy: 240,
        r: 48,
        fill: "transparent",
        stroke: "rgba(255, 255, 255, 0.16)",
        "stroke-width": 1.2
      })
    );
    const subtitle = createSvgElement("text", {
      x: 240,
      y: 309,
      fill: "rgba(226, 232, 240, 0.8)",
      "font-size": "10",
      "font-weight": "700",
      "text-anchor": "middle"
    });
    subtitle.textContent = `${formatNumber(entries.length)} entrants`;
    svg.appendChild(subtitle);
    return svg;
  }

  function pickWheelWinner(entries) {
    const list = Array.isArray(entries) ? entries : [];
    const totalWeight = list.reduce((sum, entry) => sum + (Number(entry?.weight) || 0), 0);
    if (!list.length || totalWeight <= 0) return null;
    let cursor = Math.random() * totalWeight;
    for (const entry of list) {
      cursor -= Number(entry?.weight) || 0;
      if (cursor <= 0) return entry;
    }
    return list[list.length - 1] || null;
  }

  function buildWheelScoreboardTable(item, options = {}) {
    const wrap = create("div", `wheel-scoreboard-table${options.compact ? " is-compact" : ""}`);
    const header = create("div", "wheel-scoreboard-row wheel-scoreboard-row-head");
    header.append(
      create("span", "", "#"),
      create("span", "", "Entrant"),
      create("span", "", "Weight"),
      create("span", "", "Chance")
    );
    wrap.appendChild(header);

    const entries = (item?.scoreboardEntries || item?.entries || []).slice(
      0,
      Math.max(1, Number(options.maxRows) || Number(item?.presentation?.scoreboard_max_rows) || 24)
    );
    if (!entries.length) {
      wrap.appendChild(create("div", "empty-state", "No wheel entries available."));
      return wrap;
    }

    entries.forEach((entry, index) => {
      const row = create("div", "wheel-scoreboard-row");
      const swatch = create("span", "wheel-scoreboard-swatch");
      swatch.style.background = entry?.color || "#64748b";

      const entryCell = create("div", "wheel-scoreboard-entry");
      entryCell.append(swatch, create("strong", "", entry?.label || `Entry ${index + 1}`));
      if (entry?.notes) {
        entryCell.appendChild(create("span", "timestamp", entry.notes));
      }

      row.append(
        create("span", "wheel-scoreboard-rank", String(entry?.rank || index + 1)),
        entryCell,
        create("span", "", formatNumber(Number(entry?.weight) || 0)),
        create("span", "", `${Math.max(0, Math.min(100, Number(entry?.percent ?? entry?.sharePercent) || 0))}%`)
      );
      wrap.appendChild(row);
    });

    return wrap;
  }

  function buildWheelDetailMain(item, config) {
    const authState = config?.authState || null;
    const isOwner = isArtifactOwner(authState, item);
    const spinOwnerOnly = item?.presentation?.spin_owner_only === true || item?.presentation?.spinOwnerOnly === true;
    const shareModel = resolveWheelShareModel(item);
    const main = create("article", "detail-main wheel-detail-main");
    const card = create("div", "wheel-detail-card");
    const wheelView = create("section", "wheel-detail-view");
    const wheelShell = create("div", "wheel-spin-shell wheel-spin-shell-premium");
    const wheelStageWrap = create("div", "wheel-stage-wrap");
    const liveLabel = create("div", "wheel-live-selection");
    const liveLabelTitle = create("span", "wheel-live-selection__eyebrow", "Current entrant");
    const liveLabelValue = create("strong", "wheel-live-selection__value", "Ready");
    liveLabel.append(liveLabelTitle, liveLabelValue);

    const wheelStage = create("div", "wheel-spin-stage wheel-spin-stage-premium");
    const celebrationLayer = create("div", "wheel-celebration-layer");
    const stageAssembly = create("div", "wheel-stage-assembly");
    const stageGlow = create("div", "wheel-stage-aura");
    const trimRing = create("div", "wheel-stage-trim");
    const trimNoise = create("div", "wheel-stage-trim-noise");
    const wheelDisc = create("div", "wheel-spin-disc wheel-spin-disc-premium");
    const hardwarePointer = create("div", "wheel-hardware-pointer");
    const hardwarePointerMount = create("div", "wheel-hardware-pointer-mount");
    const pointer = create("div", "wheel-spin-pointer wheel-spin-pointer-premium");
    const pointerGlow = create("div", "wheel-spin-pointer-glow");
    trimRing.appendChild(trimNoise);
    hardwarePointer.append(hardwarePointerMount, pointer);
    stageAssembly.append(stageGlow, trimRing, wheelDisc, hardwarePointer);
    wheelStage.style.setProperty("--wheel-trim-color", item?.palette?.trim_color || item?.palette?.accent_color || "#7c92ff");
    wheelStage.style.setProperty("--wheel-glow-color", item?.palette?.glow_color || item?.palette?.accent_color || "#4de9ff");
    wheelStage.append(liveLabel, celebrationLayer, stageAssembly, pointerGlow);
    wheelStageWrap.appendChild(wheelStage);

    const wheelSide = create("details", "wheel-spin-side wheel-session-side");
    wheelSide.open = true;
    const sideSummary = create("summary", "wheel-session-side__summary");
    sideSummary.append(
      create("span", "wheel-session-side__title", "Wheel details"),
      create("span", "wheel-session-side__caption", spinOwnerOnly ? "Owner-locked spin" : "Session controls")
    );
    const sideBody = create("div", "wheel-session-side__body");
    const emphasis = create("div", "dashboard-chip-row");
    emphasis.append(
      create("span", "dashboard-chip", `${formatNumber(item.entryCount || (item.entries || []).length)} entrants`),
      create("span", "dashboard-chip", item.allowDuplicates ? "Duplicate winners allowed" : "Duplicate winners blocked"),
      create("span", "dashboard-chip", item.autoRemoveWinner ? "Auto-remove after win" : "Winner remains on wheel"),
      create("span", "dashboard-chip", spinOwnerOnly ? "Spin locked to owner" : "Public spin enabled")
    );

    const creatorCard = create("div", "wheel-meta-card");
    creatorCard.appendChild(buildCreatorMeta(item.creator, { expanded: true, includeRoleChip: true, enableHover: true }));
    creatorCard.appendChild(buildDetailRows(item, config.helpers || window.StreamSuitesPublicData.helpers));

    const shareCard = create("div", "wheel-meta-card wheel-meta-card--share");
    shareCard.append(
      create("div", "detail-subtle-label", "Share"),
      buildWheelShareField("Primary public URL", shareModel.publicUrl, { emptyText: "Unavailable until a slug resolves", copyLabel: "Copy link" }),
      buildWheelShareField("Generated slug URL", shareModel.defaultPublicUrl, { emptyText: "Unavailable until saved", copyLabel: "Copy default" }),
      buildWheelShareField("Shortlink", shareModel.shortlinkUrl, { emptyText: "Generated shortlink unavailable", copyLabel: "Copy short" })
    );
    if (shareModel.customSlug) {
      shareCard.appendChild(create("p", "dashboard-card-footnote", `Custom slug claimed: ${shareModel.customSlug}`));
    }
    if (Array.isArray(item?.slugAliases) && item.slugAliases.length) {
      shareCard.appendChild(create("p", "dashboard-card-footnote", `Legacy aliases still resolve: ${item.slugAliases.join(", ")}`));
    }

    const detailCard = create("div", "wheel-entry-detail-card");
    const detailHeading = create("div", "wheel-entry-detail-heading");
    const detailAvatar = create("div", "wheel-entry-detail-avatar");
    const detailIdentity = create("div", "wheel-entry-detail-identity");
    detailHeading.append(detailAvatar, detailIdentity);
    const detailMeta = create("div", "wheel-entry-detail-meta");
    const detailPublic = create("div", "wheel-entry-detail-public");
    const detailStats = create("div", "wheel-entry-detail-stats");
    detailCard.append(detailHeading, detailMeta, detailPublic, detailStats);

    const resultBox = create("div", "wheel-spin-result");
    const resultLabel = create("p", "dashboard-card-kicker", "Local viewer result");
    const resultValue = create("h3", "wheel-spin-result__title", "Ready to spin");
    const resultMeta = create(
      "p",
      "dashboard-card-footnote",
      "Spins are local to this browser session only. No winner history or backend state is written from this surface."
    );
    resultBox.append(resultLabel, resultValue, resultMeta);

    const actionRow = create("div", "dashboard-action-row wheel-action-row");
    const spinButton = create("button", "dashboard-action is-strong", "Spin");
    spinButton.type = "button";
    const respinButton = create("button", "dashboard-action", "Re-spin");
    respinButton.type = "button";
    const resetButton = create("button", "dashboard-action", "Reset Wheel");
    resetButton.type = "button";
    actionRow.append(spinButton, respinButton, resetButton);

    const accessNote = create("div", "wheel-access-note");
    accessNote.hidden = !spinOwnerOnly;
    if (spinOwnerOnly) {
      const accessText = isOwner
        ? "Owner-only spin is active. This wheel can only be advanced from the logged-in owner session."
        : "Owner-only spin is active. Public viewers can inspect the wheel, but only the logged-in owner can spin it.";
      accessNote.appendChild(create("p", "dashboard-card-footnote", accessText));
      if (!isOwner && typeof config?.openAuthModal === "function") {
        const accessButton = create("button", "dashboard-action", "Owner Sign In");
        accessButton.type = "button";
        accessButton.addEventListener("click", () => config.openAuthModal("login"));
        accessNote.appendChild(accessButton);
      }
    }

    const winnersPanel = create("div", "wheel-winners-panel");
    const winnersTitle = create("h3", "wheel-panel-title", "Session winners");
    const winnersList = create("div", "wheel-winners-list");
    winnersPanel.append(winnersTitle, winnersList);

    const compactList = create("div", "wheel-inline-list-view");
    compactList.append(
      create("div", "detail-subtle-label", "List view preview"),
      buildWheelScoreboardTable(item, { compact: true, maxRows: 5 })
    );

    sideBody.append(
      creatorCard,
      shareCard,
      create("p", "dashboard-card-body", item.summary || "This wheel artifact is rendered directly from the authoritative runtime export."),
      emphasis,
      detailCard,
      resultBox,
      accessNote,
      actionRow,
      winnersPanel,
      compactList,
      buildWheelOwnerEditorPanel(item, config),
      buildCompactWheelAuthorityPanel(item, config)
    );
    wheelSide.append(sideSummary, sideBody);
    wheelShell.append(wheelStageWrap, wheelSide);
    wheelView.appendChild(wheelShell);

    card.append(wheelView);
    main.appendChild(card);

    const importNotes = [];
    if (String(item?.importProvenance?.notes || "").trim()) {
      importNotes.push(String(item.importProvenance.notes).trim());
    }
    if (Array.isArray(item?.unsupportedImportFields) && item.unsupportedImportFields.length) {
      importNotes.push(`Unsupported imported fields are preserved as metadata only: ${item.unsupportedImportFields.join(", ")}`);
    }
    if (importNotes.length) {
      const notesCard = create("div", "detail-card wheel-import-notes-card");
      const notesHeading = create("div", "detail-heading");
      notesHeading.append(create("h3", "detail-title", "Import notes"));
      notesCard.appendChild(notesHeading);
      importNotes.forEach((note) => {
        notesCard.appendChild(create("p", "dashboard-card-footnote", note));
      });
      main.appendChild(notesCard);
    }

    const sessionState = {
      winnerLimit: clampNumber(item?.winnerLimit || 1, 1, 100, 1),
      winners: [],
      drawHistory: [],
      removedEntryIds: new Set(),
      selectedEntryId: "",
      pointerEntryId: "",
      lastSpinPointerEntryId: "",
      lastClickSoundAt: 0,
      hoverEntryId: "",
      isHoveringStage: false,
      isSpinning: false,
      rotation: 0,
      frameId: 0,
      spinTimer: 0,
      pulseTimer: 0,
      audioUnlocked: false,
      musicAudio: null
    };
    const ownerSpinLocked = spinOwnerOnly && !isOwner;
    const spinDurationMs = clampNumber(item?.presentation?.spin_duration_ms || 8500, 2000, 60000, 8500);
    let lastFrameTs = 0;

    function setWheelStageState(nextState = "idle") {
      const resolved =
        nextState === "winner" ? "winner" :
        sessionState.isSpinning ? "spinning" :
        nextState === "hover" ? "hover" :
        "idle";
      trimRing.dataset.state = resolved;
      wheelStage.dataset.state = resolved;
    }

    function cloneWinnerRecord(winner) {
      return winner && typeof winner === "object" ? { ...winner } : winner;
    }

    function buildSessionSnapshot() {
      return {
        winners: sessionState.winners.map((winner) => cloneWinnerRecord(winner)),
        removedEntryIds: Array.from(sessionState.removedEntryIds),
        selectedEntryId: sessionState.selectedEntryId,
        rotation: sessionState.rotation
      };
    }

    function applySessionSnapshot(snapshot) {
      const source = snapshot && typeof snapshot === "object" ? snapshot : {};
      sessionState.winners = Array.isArray(source.winners) ? source.winners.map((winner) => cloneWinnerRecord(winner)) : [];
      sessionState.removedEntryIds = new Set(Array.isArray(source.removedEntryIds) ? source.removedEntryIds : []);
      sessionState.selectedEntryId = String(source.selectedEntryId || "");
      sessionState.hoverEntryId = "";
      sessionState.rotation = Number(source.rotation) || 0;
      sessionState.lastSpinPointerEntryId = "";
      wheelDisc.style.transform = `rotate(${sessionState.rotation}deg)`;
      if (sessionState.winners.length) {
        const lastWinner = sessionState.winners[sessionState.winners.length - 1];
        resultValue.textContent = getWheelEntryName(lastWinner);
        resultMeta.textContent = `Local result. Weight ${formatNumber(Number(lastWinner?.weight) || 0)} · ${Math.max(0, Math.min(100, Number(lastWinner?.percent ?? lastWinner?.sharePercent) || 0))}% share. No winner history or backend state is written from this surface.`;
      } else {
        resultValue.textContent = "Ready to spin";
        resultMeta.textContent = "Spins are local to this browser session only. No winner history or backend state is written from this surface.";
      }
      rebuildWheel();
      renderWinnerList();
      updateControls();
    }

    function getDisplayedEntries() {
      const base = Array.isArray(item?.entries) ? item.entries : [];
      if (!item?.autoRemoveWinner) return base.slice();
      return base.filter((entry) => !sessionState.removedEntryIds.has(String(entry?.entryId || entry?.id || "")));
    }

    function getEligibleEntries() {
      const base = Array.isArray(item?.entries) ? item.entries : [];
      const blockedIds = new Set();
      if (item?.autoRemoveWinner) {
        sessionState.removedEntryIds.forEach((value) => blockedIds.add(value));
      }
      if (!item?.allowDuplicates) {
        sessionState.winners.forEach((winner) => blockedIds.add(String(winner?.entryId || winner?.id || "")));
      }
      return base.filter((entry) => !blockedIds.has(String(entry?.entryId || entry?.id || "")));
    }

    function findEntryById(entryId) {
      const allEntries = Array.isArray(item?.entries) ? item.entries : [];
      return allEntries.find((entry) => String(entry?.entryId || entry?.id || "") === String(entryId || "")) || null;
    }

    function resolveActiveEntry() {
      return (
        findEntryById(sessionState.selectedEntryId) ||
        findEntryById(sessionState.hoverEntryId) ||
        findEntryById(sessionState.pointerEntryId) ||
        sessionState.winners[sessionState.winners.length - 1] ||
        item?.entries?.[0] ||
        null
      );
    }

    function renderDetailAvatar(entry) {
      clear(detailAvatar);
      detailAvatar.dataset.tone = buildWheelAvatarTone(entry);
      detailAvatar.style.setProperty("--wheel-entry-color", entry?.color || item?.palette?.accent_color || "#4de9ff");
      const avatarUrl = String(entry?.avatarUrl || entry?.assignment?.avatarUrl || "").trim();
      if (avatarUrl) {
        const avatarImg = create("img", "wheel-entry-detail-avatar-img");
        avatarImg.src = avatarUrl;
        avatarImg.alt = "";
        detailAvatar.appendChild(avatarImg);
        return;
      }
      const fallbackIcon = create("span", "wheel-entry-detail-avatar-icon");
      fallbackIcon.setAttribute("aria-hidden", "true");
      detailAvatar.appendChild(fallbackIcon);
    }

    function renderDetailCard(entry) {
      const activeEntry = entry || item?.entries?.[0] || null;
      clear(detailIdentity);
      clear(detailMeta);
      clear(detailPublic);
      clear(detailStats);
      if (!activeEntry) {
        detailIdentity.append(create("strong", "", "No entrants available"));
        detailMeta.appendChild(create("p", "dashboard-card-footnote", "Add entrants in Creator or import a wheel payload."));
        return;
      }
      renderDetailAvatar(activeEntry);
      detailIdentity.append(
        create("span", "wheel-panel-title", getWheelEntryName(activeEntry)),
        create("p", "dashboard-card-footnote", activeEntry?.assignment?.role || activeEntry?.assignment?.userCode || "Wheel entrant")
      );
      if (Array.isArray(activeEntry?.roleBadges) && activeEntry.roleBadges.length) {
        const badgeRow = create("div", "dashboard-meta-list");
        activeEntry.roleBadges.forEach((badge) => {
          badgeRow.appendChild(create("span", "dashboard-meta-pill", String(badge?.label || badge?.name || "Badge")));
        });
        detailIdentity.appendChild(badgeRow);
      }

      const eligible = getEligibleEntries();
      const eligibleTotal = eligible.reduce((sum, candidate) => sum + Math.max(0, Number(candidate?.weight) || 0), 0) || 1;
      const activeEligible = eligible.find((candidate) => String(candidate?.entryId || candidate?.id || "") === String(activeEntry?.entryId || activeEntry?.id || ""));
      const chance = activeEligible ? ((Math.max(0, Number(activeEntry?.weight) || 0) / eligibleTotal) * 100) : 0;
      const rows = [
        ["Weight", formatNumber(Number(activeEntry?.weight) || 0)],
        ["Share", formatNumber(Number(activeEntry?.share) || Number(activeEntry?.weight) || 0)],
        ["Win chance", `${chance.toFixed(chance < 10 ? 1 : 0)}%`],
        ["Color", `${String(activeEntry?.color || "").trim() || "Unassigned"}`]
      ];
      rows.forEach(([label, value]) => {
        const row = create("div", "wheel-entry-detail-row");
        const valueNode = create("strong", "", value);
        if (label === "Color") {
          valueNode.classList.add("wheel-entry-detail-color-value");
          const swatch = create("span", "wheel-entry-detail-color-chip");
          swatch.style.background = String(activeEntry?.color || "#64748b").trim() || "#64748b";
          valueNode.prepend(swatch);
        }
        row.append(create("span", "", label), valueNode);
        detailMeta.appendChild(row);
      });

      const publicParts = [];
      if (activeEntry?.assignment?.publicSlug) publicParts.push(`@${activeEntry.assignment.publicSlug}`);
      if (activeEntry?.assignment?.publicProfile?.bio) publicParts.push(String(activeEntry.assignment.publicProfile.bio));
      if (activeEntry?.notes) publicParts.push(String(activeEntry.notes));
      detailPublic.appendChild(
        create(
          "p",
          "dashboard-card-footnote",
          publicParts.length ? publicParts.join(" · ") : "No expanded public-user profile details are available for this entrant."
        )
      );

      const stats = activeEntry?.statsStub && typeof activeEntry.statsStub === "object" ? activeEntry.statsStub : {};
      const hasStats = Object.keys(stats).length > 0;
      detailStats.hidden = !hasStats;
      if (hasStats) {
        const xp = create("div", "wheel-entry-detail-row");
        xp.append(create("span", "", "XP / Rank"), create("strong", "", `${stats.xp_label || stats.xp_total || "XP"} · ${stats.rank_label || stats.rank_value || "Rank"}`));
        detailStats.appendChild(xp);
      }
    }

    function renderWinnerList() {
      winnersPanel.hidden = sessionState.winnerLimit <= 1;
      clear(winnersList);
      if (sessionState.winnerLimit <= 1) return;
      if (!sessionState.winners.length) {
        winnersList.appendChild(create("p", "dashboard-card-footnote", "No session winners yet."));
        return;
      }
      sessionState.winners.forEach((winner, index) => {
        const row = create("div", "wheel-winner-row");
        row.append(
          create("span", "wheel-winner-rank", `#${index + 1}`),
          create("strong", "", getWheelEntryName(winner)),
          create("span", "", `${Math.max(0, Math.min(100, Number(winner?.percent ?? winner?.sharePercent) || 0))}%`)
        );
        winnersList.appendChild(row);
      });
    }

    function updateControls() {
      const eligibleEntries = getEligibleEntries();
      const remainingSlots = Math.max(0, sessionState.winnerLimit - sessionState.winners.length);
      const canAdvance = !ownerSpinLocked && !sessionState.isSpinning && eligibleEntries.length > 0 && remainingSlots > 0;
      const hasCompletedDraw = sessionState.drawHistory.length > 0;
      spinButton.textContent = hasCompletedDraw && canAdvance ? "Spin Again" : "Spin";
      spinButton.disabled = !canAdvance;
      respinButton.disabled = ownerSpinLocked || sessionState.isSpinning || !sessionState.drawHistory.length;
      respinButton.hidden = false;
      resetButton.disabled =
        ownerSpinLocked ||
        sessionState.isSpinning ||
        (!sessionState.drawHistory.length && !sessionState.winners.length && !sessionState.removedEntryIds.size);
    }

    function flashCelebration() {
      if (item?.presentation?.celebration_enabled === false && item?.presentation?.confetti_enabled !== true) return;
      clear(celebrationLayer);
      const count = 200;
      const bursts = [
        { particleRatio: 0.25, spread: 26, startVelocity: 55, decay: 0.91, scalar: 1 },
        { particleRatio: 0.2, spread: 60, startVelocity: 40, decay: 0.9, scalar: 1 },
        { particleRatio: 0.35, spread: 100, startVelocity: 48, decay: 0.91, scalar: 0.8 },
        { particleRatio: 0.1, spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 },
        { particleRatio: 0.1, spread: 120, startVelocity: 45, decay: 0.9, scalar: 1 }
      ];
      let colorIndex = 0;
      bursts.forEach((burst, burstIndex) => {
        const particleCount = Math.max(1, Math.floor(count * burst.particleRatio));
        for (let index = 0; index < particleCount; index += 1) {
          const confetti = create("span", "wheel-confetti");
          const spreadAngle = (-90 + (Math.random() - 0.5) * burst.spread) * (Math.PI / 180);
          const velocity = burst.startVelocity * (0.55 + Math.random() * 0.8) * (burst.scalar || 1);
          const distance = velocity * (burst.decay || 0.9) * 3.2;
          const drift = Math.cos(spreadAngle) * distance;
          const rise = Math.sin(spreadAngle) * distance;
          const spin = (Math.random() * 480 - 240).toFixed(2);
          const duration = 860 + Math.round(Math.random() * 520) + burstIndex * 40;
          confetti.style.left = "50%";
          confetti.style.top = "70%";
          confetti.style.setProperty("--confetti-x", `${drift.toFixed(2)}px`);
          confetti.style.setProperty("--confetti-y", `${rise.toFixed(2)}px`);
          confetti.style.setProperty("--confetti-rotate", `${spin}deg`);
          confetti.style.setProperty("--confetti-scale", `${(0.72 + Math.random() * 0.75 * (burst.scalar || 1)).toFixed(2)}`);
          confetti.style.setProperty("--confetti-delay", `${(Math.random() * 0.12 + burstIndex * 0.02).toFixed(3)}s`);
          confetti.style.setProperty("--confetti-duration", `${duration}ms`);
          confetti.style.setProperty(
            "--confetti-color",
            resolveEntryColor(item.entries[colorIndex % Math.max(1, item.entries.length)] || {}, item, colorIndex)
          );
          colorIndex += 1;
          celebrationLayer.appendChild(confetti);
        }
      });
      celebrationLayer.classList.remove("is-active");
      window.requestAnimationFrame(() => celebrationLayer.classList.add("is-active"));
    }

    async function playSound(category, { loop = false } = {}) {
      const resolved = resolveWheelSoundConfig(item, category);
      if (!sessionState.audioUnlocked || !resolved.enabled || !resolved.assetId) return null;
      const audio = new Audio(buildWheelSoundUrl(category, resolved.assetId));
      audio.loop = loop;
      audio.volume = category === "music" ? 0.36 : 0.78;
      try {
        await audio.play();
        return audio;
      } catch (_error) {
        return null;
      }
    }

    function stopMusic() {
      if (!sessionState.musicAudio) return;
      try {
        sessionState.musicAudio.pause();
      } catch (_error) {
        // Ignore pause failures.
      }
      sessionState.musicAudio = null;
    }

    function unlockAudio() {
      sessionState.audioUnlocked = true;
    }

    function publishLocalWinner(winner, contextLabel) {
      if (!winner) return;
      resultValue.textContent = getWheelEntryName(winner);
      resultMeta.textContent = `${contextLabel} Weight ${formatNumber(Number(winner.weight) || 0)} · ${Math.max(0, Math.min(100, Number(winner.percent ?? winner.sharePercent) || 0))}% share. No winner history or backend state is written from this surface.`;
      sessionState.selectedEntryId = String(winner?.entryId || winner?.id || "");
      renderDetailCard(winner);
      renderWinnerList();
      updateControls();
    }

    function rebuildWheel() {
      clear(wheelDisc);
      const displayEntries = getDisplayedEntries();
      const wheelSvg = buildWheelSvg({ ...item, entries: displayEntries });
      wheelDisc.appendChild(wheelSvg);
      const sliceGroups = Array.from(wheelSvg.querySelectorAll("[data-wheel-entry-id]"));
      sliceGroups.forEach((group) => {
        const entryId = group.getAttribute("data-wheel-entry-id") || "";
        group.addEventListener("mouseenter", () => {
          sessionState.hoverEntryId = entryId;
          sessionState.selectedEntryId = entryId;
          sessionState.isHoveringStage = true;
          updatePointerState();
        });
        group.addEventListener("mouseleave", () => {
          sessionState.hoverEntryId = "";
          updatePointerState();
        });
        group.addEventListener("click", () => {
          unlockAudio();
          sessionState.selectedEntryId = entryId;
          renderDetailCard(findEntryById(entryId));
        });
      });
      updatePointerState();
    }

    function updatePointerState(options = {}) {
      const segments = getWheelSegments(getDisplayedEntries());
      const pointed = resolveWheelPointerEntry(segments, sessionState.rotation);
      const pointedId = String(pointed?.entry?.entryId || pointed?.entry?.id || "");
      if (options.allowClickSound && sessionState.isSpinning && pointedId && pointedId !== sessionState.lastSpinPointerEntryId) {
        const timestamp = Number(options.timestamp) || performance.now();
        if (timestamp - sessionState.lastClickSoundAt > 48) {
          sessionState.lastClickSoundAt = timestamp;
          void playSound("click");
        }
      }
      sessionState.pointerEntryId = pointedId;
      sessionState.lastSpinPointerEntryId = pointedId;
      liveLabelValue.textContent = pointed?.entry ? getWheelEntryName(pointed.entry) : "Ready";
      renderDetailCard(resolveActiveEntry());
      const groups = wheelDisc.querySelectorAll("[data-wheel-entry-id]");
      groups.forEach((group) => {
        const entryId = group.getAttribute("data-wheel-entry-id") || "";
        const isActive = entryId === sessionState.hoverEntryId || entryId === pointedId;
        group.classList.toggle("is-active", isActive);
      });
      if (!sessionState.isSpinning) {
        setWheelStageState(sessionState.hoverEntryId || sessionState.isHoveringStage ? "hover" : "idle");
      }
    }

    function finishSpin(winner, spinContext = {}) {
      sessionState.isSpinning = false;
      setWheelStageState("winner");
      stopMusic();
      void playSound("winner");
      flashCelebration();
      if (winner) {
        sessionState.winners.push(winner);
        if (item?.autoRemoveWinner) {
          sessionState.removedEntryIds.add(String(winner?.entryId || winner?.id || ""));
        }
        sessionState.drawHistory.push({
          mode: spinContext.mode || "spin",
          winnerId: String(winner?.entryId || winner?.id || ""),
          beforeState: spinContext.beforeState || buildSessionSnapshot()
        });
        publishLocalWinner(winner, "Local result.");
        rebuildWheel();
      }
      window.clearTimeout(sessionState.pulseTimer);
      sessionState.pulseTimer = window.setTimeout(() => {
        setWheelStageState(sessionState.hoverEntryId || sessionState.isHoveringStage ? "hover" : "idle");
      }, 1100);
    }

    function spinWheel(mode = "spin", context = {}) {
      const eligibleEntries = getEligibleEntries();
      const remainingSlots = Math.max(0, sessionState.winnerLimit - sessionState.winners.length);
      if (sessionState.isSpinning || !eligibleEntries.length || remainingSlots <= 0) return;
      unlockAudio();
      const displayEntries = getDisplayedEntries();
      const winner = pickWheelWinner(eligibleEntries);
      if (!winner) return;
      const displaySegments = getWheelSegments(displayEntries);
      const winnerSegment = displaySegments.find((segment) => String(segment.entry?.entryId || segment.entry?.id || "") === String(winner?.entryId || winner?.id || ""));
      if (!winnerSegment) return;
      const targetRotation = (360 - winnerSegment.midAngle + 360) % 360;
      const currentPhase = normalizeWheelAngle(sessionState.rotation);
      const delta = (targetRotation - currentPhase + 360) % 360;
      const endRotation = sessionState.rotation + delta + (4 + Math.floor(Math.random() * 3)) * 360;
      const startRotation = sessionState.rotation;
      const startTime = performance.now();
      const beforeState = context.beforeState || buildSessionSnapshot();

      sessionState.isSpinning = true;
      sessionState.lastSpinPointerEntryId = sessionState.pointerEntryId || "";
      setWheelStageState("spinning");
      resultValue.textContent = mode === "respin" ? "Re-spinning…" : sessionState.drawHistory.length ? "Spinning again…" : "Spinning…";
      resultMeta.textContent =
        mode === "respin"
          ? "Re-spin replays the most recent draw from the pre-draw session state. No backend history is written."
          : "This animation advances the local browser-session draw history only. No backend state is written.";
      void playSound(mode === "respin" ? "respin" : "startspin");
      stopMusic();
      playSound("music", { loop: true }).then((audio) => {
        if (audio) sessionState.musicAudio = audio;
      });

      function step(now) {
        const progress = clampNumber((now - startTime) / spinDurationMs, 0, 1, 0);
        const eased = 1 - Math.pow(1 - progress, 4);
        sessionState.rotation = startRotation + (endRotation - startRotation) * eased;
        wheelDisc.style.transform = `rotate(${sessionState.rotation}deg)`;
        updatePointerState({ allowClickSound: true, timestamp: now });
        if (progress < 1) {
          sessionState.spinTimer = window.requestAnimationFrame(step);
          return;
        }
        finishSpin(winner, { mode, beforeState });
      }

      updateControls();
      sessionState.spinTimer = window.requestAnimationFrame(step);
    }

    function respinWheel() {
      if (sessionState.isSpinning || !sessionState.drawHistory.length) return;
      const previousDraw = sessionState.drawHistory.pop();
      applySessionSnapshot(previousDraw?.beforeState || buildSessionSnapshot());
      spinWheel("respin", { beforeState: previousDraw?.beforeState || buildSessionSnapshot() });
    }

    function resetSession() {
      stopMusic();
      window.cancelAnimationFrame(sessionState.spinTimer);
      sessionState.isSpinning = false;
      sessionState.winners = [];
      sessionState.drawHistory = [];
      sessionState.removedEntryIds.clear();
      sessionState.selectedEntryId = "";
      sessionState.hoverEntryId = "";
      sessionState.lastSpinPointerEntryId = "";
      setWheelStageState("idle");
      resultValue.textContent = "Ready to spin";
      resultMeta.textContent = "Spins are local to this browser session only. No winner history or backend state is written from this surface.";
      rebuildWheel();
      renderWinnerList();
      updateControls();
    }

    function tick(now) {
      const delta = lastFrameTs ? now - lastFrameTs : 16;
      lastFrameTs = now;
      if (!sessionState.isSpinning && item?.presentation?.slow_drift_enabled !== false && !sessionState.isHoveringStage) {
        sessionState.rotation += delta * 0.0022;
        wheelDisc.style.transform = `rotate(${sessionState.rotation}deg)`;
        updatePointerState();
      }
      sessionState.frameId = window.requestAnimationFrame(tick);
    }

    wheelStage.addEventListener("mouseenter", () => {
      sessionState.isHoveringStage = true;
      if (!sessionState.isSpinning) setWheelStageState("hover");
    });
    wheelStage.addEventListener("mouseleave", () => {
      sessionState.isHoveringStage = false;
      sessionState.hoverEntryId = "";
      updatePointerState();
    });
    spinButton.addEventListener("click", () => spinWheel("spin"));
    respinButton.addEventListener("click", respinWheel);
    resetButton.addEventListener("click", resetSession);

    renderDetailCard(item?.entries?.[0] || null);
    renderWinnerList();
    rebuildWheel();
    updateControls();
    sessionState.frameId = window.requestAnimationFrame(tick);
    main._cleanupWheelDetail = () => {
      stopMusic();
      window.cancelAnimationFrame(sessionState.frameId);
      window.cancelAnimationFrame(sessionState.spinTimer);
      window.clearTimeout(sessionState.pulseTimer);
    };
    return main;
  }

  function buildWheelEditorDraft(item) {
    return {
      slug: String(item?.slug || item?.defaultSlug || "").trim(),
      default_slug: String(item?.defaultSlug || item?.slug || "").trim(),
      custom_slug: String(item?.customSlug || item?.custom_slug || "").trim(),
      shortlink_slug: String(item?.shortlinkSlug || item?.shortlink_slug || "").trim(),
      slug_aliases: Array.isArray(item?.slugAliases || item?.slug_aliases)
        ? (item?.slugAliases || item?.slug_aliases).map((value) => String(value || "").trim()).filter(Boolean)
        : [],
      title: String(item?.title || "").trim(),
      description: String(item?.description || "").trim(),
      notes: String(item?.notes || "").trim(),
      default_display_mode: item?.defaultDisplayMode === "scoreboard" ? "scoreboard" : "wheel",
      winner_limit: clampNumber(item?.winnerLimit || 1, 1, 100, 1),
      allow_duplicates: item?.allowDuplicates !== false,
      auto_remove_winner: item?.autoRemoveWinner === true,
      palette: {
        segment_colors: Array.isArray(item?.palette?.segment_colors) ? item.palette.segment_colors.slice(0, 16) : [],
        background_color: String(item?.palette?.background_color || "#08111f").trim() || "#08111f",
        text_color: String(item?.palette?.text_color || "#f8fafc").trim() || "#f8fafc",
        accent_color: String(item?.palette?.accent_color || "#38bdf8").trim() || "#38bdf8",
        trim_color: String(item?.palette?.trim_color || item?.palette?.accent_color || "#7c92ff").trim() || "#7c92ff",
        glow_color: String(item?.palette?.glow_color || item?.palette?.accent_color || "#4de9ff").trim() || "#4de9ff"
      },
      presentation: {
        animation_enabled: item?.presentation?.animation_enabled !== false,
        sound_enabled: item?.presentation?.sound_enabled !== false,
        celebration_enabled: item?.presentation?.celebration_enabled !== false,
        show_entry_labels: item?.presentation?.show_entry_labels !== false,
        show_display_names_on_slices: item?.presentation?.show_display_names_on_slices !== false,
        slice_label_mode: String(item?.presentation?.slice_label_mode || "full_name").trim() || "full_name",
        center_image_url: String(item?.presentation?.center_image_url || item?.presentation?.centerImageUrl || WHEEL_CENTER_DEFAULT).trim() || WHEEL_CENTER_DEFAULT,
        spin_owner_only:
          item?.presentation?.spin_owner_only === true ||
          item?.presentation?.spinOwnerOnly === true ||
          item?.presentation?.owner_spin_only === true ||
          item?.presentation?.ownerSpinOnly === true,
        slow_drift_enabled: item?.presentation?.slow_drift_enabled !== false,
        spin_duration_ms: clampNumber(item?.presentation?.spin_duration_ms || 8500, 2000, 60000, 8500),
        scoreboard_max_rows: clampNumber(item?.presentation?.scoreboard_max_rows || 24, 3, 100, 24),
        sound: Object.keys(WHEEL_SOUND_LIBRARY).reduce((acc, category) => {
          const resolved = resolveWheelSoundConfig(item, category);
          acc[category] = {
            enabled: resolved.enabled,
            asset_id: resolved.assetId
          };
          return acc;
        }, {})
      },
      entries: (Array.isArray(item?.entries) ? item.entries : []).map((entry) => ({
        entry_id: String(entry?.entryId || entry?.id || "").trim(),
        label: String(entry?.label || getWheelEntryName(entry)).trim(),
        display_name: String(entry?.displayName || getWheelEntryName(entry)).trim(),
        avatar_url: String(entry?.avatarUrl || "").trim(),
        weight: Math.max(0.1, Number(entry?.weight) || 1),
        share: Math.max(0.1, Number(entry?.share) || Number(entry?.weight) || 1),
        color: String(entry?.color || "#64748b").trim(),
        notes: String(entry?.notes || "").trim(),
        assignment: entry?.assignment ? { ...entry.assignment } : null,
        role_badges: Array.isArray(entry?.roleBadges) ? entry.roleBadges : [],
        stats_stub: entry?.statsStub && typeof entry.statsStub === "object" ? entry.statsStub : {}
      }))
    };
  }

  function buildWheelEditorPayload(draft) {
    return {
      title: draft.title,
      custom_slug: draft.custom_slug,
      description: draft.description,
      notes: draft.notes,
      default_display_mode: draft.default_display_mode,
      winner_limit: draft.winner_limit,
      allow_duplicates: draft.allow_duplicates,
      auto_remove_winner: draft.auto_remove_winner,
      palette: draft.palette,
      presentation: {
        ...draft.presentation,
        confetti_enabled: draft.presentation.celebration_enabled === true
      },
      entries: draft.entries
    };
  }

  function buildCompactWheelAuthorityPanel(item, options = {}) {
    const wrapper = create("details", "wheel-compact-panel wheel-authority-compact");
    wrapper.open = false;
    const summary = create("summary", "wheel-compact-panel-summary");
    summary.append(
      create("span", "wheel-compact-panel-title", "Authority requests"),
      create("span", "wheel-compact-panel-caption", "Report or request review")
    );
    wrapper.appendChild(summary);
    const body = create("div", "wheel-compact-panel-body");
    body.appendChild(
      buildAuthorityRequestPanel(resolveArtifactAuthorityContext(item), {
        authState: options.authState,
        openAuthModal: options.openAuthModal
      })
    );
    wrapper.appendChild(body);
    return wrapper;
  }

  function buildWheelOwnerEditorPanel(item, options = {}) {
    const authState = options.authState || null;
    const canEdit = Boolean(authState?.authenticated) && isArtifactOwner(authState, item) && String(item?.artifactCode || "").trim();
    const wrapper = create("div", `wheel-owner-editor-shell${canEdit ? "" : " is-disabled"}`);
    const details = create("details", "wheel-compact-panel wheel-owner-editor-panel");
    details.open = false;
    const summary = create("summary", "wheel-compact-panel-summary");
    summary.append(
      create("span", "wheel-compact-panel-title", "Owner editor"),
      create("span", "wheel-compact-panel-caption", canEdit ? "Compact inline wheel editing" : "Only available to the owner")
    );
    if (!canEdit) {
      summary.setAttribute("aria-disabled", "true");
    }
    details.appendChild(summary);
    wrapper.appendChild(details);

    const body = create("div", "wheel-compact-panel-body");
    details.appendChild(body);
    if (!canEdit) {
      body.appendChild(
        create("p", "dashboard-card-footnote", "Sign in with the owning StreamSuites account to edit this wheel inline.")
      );
      details.addEventListener("toggle", () => {
        if (details.open) details.open = false;
      });
      return wrapper;
    }

    const draft = buildWheelEditorDraft(item);
    const lookupState = Object.create(null);
    const lookupTimers = new Map();
    const lookupAborters = new Map();
    let previewAudio = null;
    let previewCategory = "";
    let centerImageUploadName = "";

    function stopPreviewSound() {
      if (!previewAudio) return;
      try {
        previewAudio.pause();
        previewAudio.currentTime = 0;
      } catch (_error) {
        // Ignore preview stop failures.
      }
      previewAudio = null;
      previewCategory = "";
    }

    async function previewSound(category) {
      const sound = draft.presentation?.sound?.[category];
      const assetId = String(sound?.asset_id || "").trim();
      if (!category || !assetId) return;
      if (previewCategory === category && previewAudio) {
        stopPreviewSound();
        renderEditor();
        return;
      }
      stopPreviewSound();
      const audio = new Audio(buildWheelSoundUrl(category, assetId));
      audio.volume = category === "music" ? 0.36 : 0.78;
      previewAudio = audio;
      previewCategory = category;
      audio.addEventListener("ended", () => {
        if (previewAudio === audio) {
          previewAudio = null;
          previewCategory = "";
          renderEditor();
        }
      }, { once: true });
      try {
        await audio.play();
      } catch (_error) {
        stopPreviewSound();
      }
      renderEditor();
    }

    function getEntryLookup(entryId) {
      if (!lookupState[entryId]) {
        lookupState[entryId] = { query: "", loading: false, results: [], error: "" };
      }
      return lookupState[entryId];
    }

    function renderEditor() {
      const shareModel = resolveWheelShareModel(draft);
      const centerImageUrl = String(draft.presentation.center_image_url || WHEEL_CENTER_DEFAULT).trim() || WHEEL_CENTER_DEFAULT;
      const centerImageLabel = centerImageUploadName || centerImageUrl.split("/").pop() || "Embedded center image";
      body.innerHTML = `
        <div class="wheel-owner-editor-grid">
          <label class="wheel-owner-field">
            <span>Custom slug</span>
            <input type="text" data-wheel-editor-field="custom_slug" value="${escapeHtml(draft.custom_slug || "")}" placeholder="mycustomwheel" />
          </label>
          <label class="wheel-owner-field">
            <span>Title</span>
            <input type="text" data-wheel-editor-field="title" value="${escapeHtml(draft.title)}" />
          </label>
          <label class="wheel-owner-field">
            <span>Description</span>
            <textarea rows="2" data-wheel-editor-field="description">${escapeHtml(draft.description)}</textarea>
          </label>
          <label class="wheel-owner-field">
            <span>Notes</span>
            <textarea rows="3" data-wheel-editor-field="notes">${escapeHtml(draft.notes)}</textarea>
          </label>
          <label class="wheel-owner-field">
            <span>Default view</span>
            <select data-wheel-editor-field="default_display_mode">
              <option value="wheel" ${draft.default_display_mode === "wheel" ? "selected" : ""}>Wheel</option>
              <option value="scoreboard" ${draft.default_display_mode === "scoreboard" ? "selected" : ""}>List view</option>
            </select>
          </label>
          <label class="wheel-owner-field">
            <span>Winner limit</span>
            <input type="number" min="1" max="100" step="1" data-wheel-editor-field="winner_limit" value="${escapeHtml(String(draft.winner_limit))}" />
          </label>
          <label class="wheel-owner-toggle">
            <input type="checkbox" data-wheel-editor-field="allow_duplicates" ${draft.allow_duplicates ? "checked" : ""} />
            <span>Allow duplicate winners</span>
          </label>
          <label class="wheel-owner-toggle">
            <input type="checkbox" data-wheel-editor-field="auto_remove_winner" ${draft.auto_remove_winner ? "checked" : ""} />
            <span>Auto-remove after win</span>
          </label>
          <label class="wheel-owner-toggle">
            <input type="checkbox" data-wheel-editor-field="presentation.spin_owner_only" ${draft.presentation.spin_owner_only ? "checked" : ""} />
            <span>Owner-only spin</span>
          </label>
          <label class="wheel-owner-field">
            <span>Slice label mode</span>
            <select data-wheel-editor-field="presentation.slice_label_mode">
              <option value="full_name" ${draft.presentation.slice_label_mode === "full_name" ? "selected" : ""}>Full name</option>
              <option value="initials" ${draft.presentation.slice_label_mode === "initials" ? "selected" : ""}>Initials</option>
              <option value="avatar" ${draft.presentation.slice_label_mode === "avatar" ? "selected" : ""}>Avatar</option>
            </select>
          </label>
          <label class="wheel-owner-field">
            <span>Center image URL / embedded data URL</span>
            <input type="text" data-wheel-editor-field="presentation.center_image_url" value="${escapeHtml(centerImageUrl)}" />
          </label>
          <label class="wheel-owner-toggle">
            <input type="checkbox" data-wheel-editor-field="presentation.show_display_names_on_slices" ${draft.presentation.show_display_names_on_slices ? "checked" : ""} />
            <span>Show display names on slices</span>
          </label>
          <label class="wheel-owner-toggle">
            <input type="checkbox" data-wheel-editor-field="presentation.slow_drift_enabled" ${draft.presentation.slow_drift_enabled ? "checked" : ""} />
            <span>Enable slow drift</span>
          </label>
          <label class="wheel-owner-toggle">
            <input type="checkbox" data-wheel-editor-field="presentation.sound_enabled" ${draft.presentation.sound_enabled ? "checked" : ""} />
            <span>Enable sound cues</span>
          </label>
          <label class="wheel-owner-toggle">
            <input type="checkbox" data-wheel-editor-field="presentation.celebration_enabled" ${draft.presentation.celebration_enabled ? "checked" : ""} />
            <span>Enable celebration visuals</span>
          </label>
          <label class="wheel-owner-field wheel-owner-field--compact">
            <span>Trim</span>
            <input type="color" data-wheel-editor-field="palette.trim_color" value="${escapeHtml(draft.palette.trim_color)}" />
          </label>
          <label class="wheel-owner-field wheel-owner-field--compact">
            <span>Glow</span>
            <input type="color" data-wheel-editor-field="palette.glow_color" value="${escapeHtml(draft.palette.glow_color)}" />
          </label>
        </div>
        <div class="wheel-owner-inline-meta">
          <div class="wheel-owner-share-stack">
            <div class="wheel-owner-share-row">
              <span>Primary URL</span>
              <code>${escapeHtml(shareModel.publicUrl || "Generated on save")}</code>
            </div>
            <div class="wheel-owner-share-row">
              <span>Generated URL</span>
              <code>${escapeHtml(shareModel.defaultPublicUrl || "Generated on save")}</code>
            </div>
            <div class="wheel-owner-share-row">
              <span>Shortlink</span>
              <code>${escapeHtml(shareModel.shortlinkUrl || "Generated on save")}</code>
            </div>
          </div>
          <div class="wheel-owner-center-tools">
            <label class="wheel-file-picker wheel-file-picker--inline">
              <span>Choose center image</span>
              <input type="file" accept="${escapeHtml(WHEEL_CENTER_ACCEPT)}" data-wheel-owner-center-file="true" />
            </label>
            <button type="button" class="dashboard-action" data-wheel-center-reset="true">Use default</button>
            <div class="wheel-owner-center-preview">
              <img src="${escapeHtml(centerImageUrl)}" alt="" loading="lazy" decoding="async" />
              <div>
                <strong>${escapeHtml(centerImageLabel)}</strong>
                <span>Local files are embedded inline into the wheel payload so the saved config stays truthful.</span>
              </div>
            </div>
          </div>
        </div>
        <div class="wheel-owner-sound-grid">
          ${Object.keys(WHEEL_SOUND_LIBRARY).map((category) => `
            <div class="wheel-owner-sound-row">
              <label class="wheel-owner-field">
                <span>${escapeHtml(category)}</span>
                <select data-wheel-editor-field="presentation.sound.${category}.asset_id">
                  ${WHEEL_SOUND_LIBRARY[category].map((assetId) => `<option value="${escapeHtml(assetId)}" ${draft.presentation.sound[category].asset_id === assetId ? "selected" : ""}>${escapeHtml(assetId)}</option>`).join("")}
                </select>
              </label>
              <button type="button" class="dashboard-action" data-wheel-sound-preview="true" data-wheel-sound-category="${escapeHtml(category)}">${previewCategory === category ? "Stop" : "Preview"}</button>
            </div>
          `).join("")}
        </div>
        <div class="wheel-owner-entry-stack">
          ${draft.entries.map((entry, index) => {
            const lookup = getEntryLookup(entry.entry_id);
            return `
              <article class="wheel-owner-entry-card">
                <div class="wheel-owner-entry-grid">
                  <label class="wheel-owner-field">
                    <span>Display name</span>
                    <input type="text" data-entry-index="${index}" data-entry-field="display_name" value="${escapeHtml(entry.display_name)}" />
                  </label>
                  <label class="wheel-owner-field">
                    <span>Avatar URL</span>
                    <input type="url" data-entry-index="${index}" data-entry-field="avatar_url" value="${escapeHtml(entry.avatar_url)}" />
                  </label>
                  <label class="wheel-owner-field wheel-owner-field--compact">
                    <span>Weight</span>
                    <input type="number" min="0.1" step="0.1" data-entry-index="${index}" data-entry-field="weight" value="${escapeHtml(String(entry.weight))}" />
                  </label>
                  <label class="wheel-owner-field wheel-owner-field--compact">
                    <span>Share</span>
                    <input type="number" min="0.1" step="0.1" data-entry-index="${index}" data-entry-field="share" value="${escapeHtml(String(entry.share))}" />
                  </label>
                  <label class="wheel-owner-field wheel-owner-field--compact">
                    <span>Color</span>
                    <input type="color" data-entry-index="${index}" data-entry-field="color" value="${escapeHtml(entry.color)}" />
                  </label>
                </div>
                <label class="wheel-owner-field">
                  <span>Assign existing StreamSuites account</span>
                  <input type="search" data-entry-index="${index}" data-entry-lookup="true" value="${escapeHtml(lookup.query)}" placeholder="Search existing StreamSuites accounts" autocomplete="off" />
                </label>
                ${lookup.loading ? `<div class="wheel-owner-lookup-results"><div class="wheel-owner-lookup-empty">Searching accounts…</div></div>` : lookup.error ? `<div class="wheel-owner-lookup-results"><div class="wheel-owner-lookup-empty">${escapeHtml(lookup.error)}</div></div>` : lookup.results.length ? `<div class="wheel-owner-lookup-results">${lookup.results.map((result, resultIndex) => `<button class="wheel-owner-lookup-result" type="button" data-entry-index="${index}" data-result-index="${resultIndex}" data-entry-lookup-assign="true">${escapeHtml(result.display_name || result.user_code || "Account")} ${result.public_slug ? `@${escapeHtml(result.public_slug)}` : ""}</button>`).join("")}</div>` : ""}
              </article>
            `;
          }).join("")}
        </div>
        <div class="wheel-owner-editor-actions">
          <button type="button" class="dashboard-action is-strong" data-wheel-editor-save="true">Save wheel</button>
          <div class="wheel-owner-editor-status" data-wheel-editor-status="true"></div>
        </div>
      `;
    }

    function setDraftField(path, value) {
      const segments = String(path || "").split(".");
      let cursor = draft;
      segments.slice(0, -1).forEach((segment) => {
        if (!cursor[segment] || typeof cursor[segment] !== "object") cursor[segment] = {};
        cursor = cursor[segment];
      });
      cursor[segments[segments.length - 1]] = value;
    }

    async function runLookup(entryIndex, query) {
      const entry = draft.entries[entryIndex];
      if (!entry) return;
      const lookup = getEntryLookup(entry.entry_id);
      lookup.query = query;
      if (String(query || "").trim().length < 2) {
        lookup.loading = false;
        lookup.results = [];
        lookup.error = "";
        renderEditor();
        return;
      }
      lookupAborters.get(entry.entry_id)?.abort?.();
      const controller = new AbortController();
      lookupAborters.set(entry.entry_id, controller);
      lookup.loading = true;
      lookup.error = "";
      renderEditor();
      try {
        const response = await fetch(`${CREATOR_WHEEL_ACCOUNT_LOOKUP_URL}?q=${encodeURIComponent(query)}`, {
          method: "GET",
          cache: "no-store",
          credentials: "include",
          headers: { Accept: "application/json" },
          signal: controller.signal
        });
        const payload = await parseJsonResponse(response);
        if (!response.ok || payload?.success === false) {
          throw new Error(String(payload?.error || `Lookup failed (${response.status})`));
        }
        lookup.results = Array.isArray(payload?.items) ? payload.items : [];
        lookup.loading = false;
      } catch (error) {
        if (controller.signal.aborted) return;
        lookup.loading = false;
        lookup.error = error instanceof Error ? error.message : "Lookup failed.";
        lookup.results = [];
      }
      renderEditor();
    }

    body.addEventListener("input", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.matches("[data-wheel-editor-field]")) {
        const field = String(target.dataset.wheelEditorField || "");
        const value =
          target instanceof HTMLInputElement && target.type === "checkbox"
            ? target.checked
            : target instanceof HTMLInputElement && target.type === "number"
              ? Number(target.value)
              : target.value;
        setDraftField(field, value);
        return;
      }
      if (target.matches("[data-entry-index][data-entry-field]")) {
        const index = Number(target.dataset.entryIndex);
        const field = String(target.dataset.entryField || "");
        const entry = draft.entries[index];
        if (!entry) return;
        entry[field] =
          target instanceof HTMLInputElement && target.type === "number"
            ? Math.max(0.1, Number(target.value) || 1)
            : target.value;
        return;
      }
      if (target.matches("[data-entry-index][data-entry-lookup='true']")) {
        const index = Number(target.dataset.entryIndex);
        const entry = draft.entries[index];
        if (!entry) return;
        const timer = lookupTimers.get(entry.entry_id);
        if (timer) window.clearTimeout(timer);
        const nextTimer = window.setTimeout(() => {
          void runLookup(index, target.value || "");
        }, 220);
        lookupTimers.set(entry.entry_id, nextTimer);
        getEntryLookup(entry.entry_id).query = target.value || "";
      }
    });

    body.addEventListener("click", async (event) => {
      const trigger = event.target.closest("[data-entry-lookup-assign='true'], [data-wheel-editor-save='true'], [data-wheel-sound-preview='true'], [data-wheel-center-reset='true']");
      if (!(trigger instanceof HTMLElement)) return;
      if (trigger.matches("[data-wheel-sound-preview='true']")) {
        void previewSound(String(trigger.dataset.wheelSoundCategory || ""));
        return;
      }
      if (trigger.matches("[data-wheel-center-reset='true']")) {
        draft.presentation.center_image_url = WHEEL_CENTER_DEFAULT;
        centerImageUploadName = "";
        renderEditor();
        return;
      }
      const statusNode = body.querySelector("[data-wheel-editor-status='true']");
      if (trigger.matches("[data-entry-lookup-assign='true']")) {
        const entryIndex = Number(trigger.dataset.entryIndex);
        const resultIndex = Number(trigger.dataset.resultIndex);
        const entry = draft.entries[entryIndex];
        const lookup = entry ? getEntryLookup(entry.entry_id) : null;
        const picked = lookup?.results?.[resultIndex];
        if (!entry || !picked) return;
        entry.assignment = {
          account_id: String(picked.account_id || "").trim(),
          user_code: String(picked.user_code || "").trim(),
          display_name: String(picked.display_name || entry.display_name || entry.label).trim(),
          avatar_url: String(picked.avatar_url || "").trim(),
          role: String(picked.role || "").trim(),
          tier: String(picked.tier || "").trim(),
          public_slug: String(picked.public_slug || "").trim(),
          badges: Array.isArray(picked.badges) ? picked.badges : [],
          public_profile: picked.public_profile && typeof picked.public_profile === "object" ? picked.public_profile : null
        };
        if (!entry.avatar_url && entry.assignment.avatar_url) {
          entry.avatar_url = entry.assignment.avatar_url;
        }
        if (!entry.display_name && entry.assignment.display_name) {
          entry.display_name = entry.assignment.display_name;
        }
        lookup.query = entry.assignment.display_name || "";
        lookup.results = [];
        lookup.error = "";
        renderEditor();
        return;
      }
      if (trigger.matches("[data-wheel-editor-save='true']")) {
        if (statusNode) statusNode.textContent = "Saving…";
        const response = await fetch(`${CREATOR_WHEELS_API_URL}/${encodeURIComponent(item.artifactCode)}`, {
          method: "PATCH",
          cache: "no-store",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify(buildWheelEditorPayload(draft))
        });
        const payload = await parseJsonResponse(response);
        if (!response.ok || payload?.success === false) {
          if (statusNode) statusNode.textContent = String(payload?.error || `Save failed (${response.status})`);
          return;
        }
        if (statusNode) {
          statusNode.textContent = "Saved. Live update will arrive through wheel sync.";
        }
      }
    });

    body.addEventListener("change", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement)) return;
      if (!target.matches("[data-wheel-owner-center-file='true']")) return;
      const file = target.files?.[0];
      if (!file) return;
      readFileAsDataUrl(file)
        .then((dataUrl) => {
          draft.presentation.center_image_url = dataUrl || WHEEL_CENTER_DEFAULT;
          centerImageUploadName = file.name || "";
          renderEditor();
        })
        .catch(() => {
          const statusNode = body.querySelector("[data-wheel-editor-status='true']");
          if (statusNode) statusNode.textContent = "Unable to load center image.";
        });
    });

    renderEditor();
    details.addEventListener("toggle", () => {
      if (!details.open) {
        stopPreviewSound();
        renderEditor();
      }
    });
    return wrapper;
  }

  function buildWheelSupportRail(item, helpers, options = {}) {
    const side = create("aside", "detail-side wheel-detail-rail");
    const profileCard = create("div", "profile-card wheel-meta-card");
    profileCard.appendChild(buildCreatorMeta(item.creator, { expanded: true, includeRoleChip: true, enableHover: true }));
    profileCard.appendChild(buildDetailRows(item, helpers));
    const shareLabel = create("div", "detail-subtle-label", "Share link");
    profileCard.append(shareLabel, buildShareBox(buildShareLink(item)));
    side.appendChild(profileCard);
    side.appendChild(buildWheelOwnerEditorPanel(item, options));
    side.appendChild(buildCompactWheelAuthorityPanel(item, options));
    return side;
  }

  function renderDetail(ctx, config) {
    const { host, data, authState, updateShell } = ctx;
    if (typeof host._cleanupWheelDetail === "function") {
      try {
        host._cleanupWheelDetail();
      } catch (_error) {
        // Ignore cleanup failures during rerender.
      }
      host._cleanupWheelDetail = null;
    }
    clear(host);

    const id = window.StreamSuitesPublicData.parseDetailId();
    const allItems = data[config.detailType] || [];
    const item = findArtifactByIdentifier(allItems, id);

    if (!item) {
      applyDocumentTitle(config.topbarLabel);
      updateShell?.({ topbarLabel: config.topbarLabel, filtersCollapsed: true });
      const typeLabel = config.detailType === "scoreboards" ? "Score" : toTitle(config.detailType).replace(/s$/, "");
      host.appendChild(buildPageHeading(`${typeLabel} unavailable`, `No public ${typeLabel.toLowerCase()} matches the requested identifier.`));
      const state = create("div", "empty-state", "Check the artifact link or return to the gallery.");
      host.appendChild(state);
      return;
    }

    syncCanonicalArtifactRoute(item, config);
    applyDocumentTitle(item.title || item.question || config.topbarLabel);
    updateShell?.({ topbarLabel: item.title || item.question || config.topbarLabel, filtersCollapsed: true });

    host.appendChild(buildPageHeading(item.title || item.question || "Detail", item.summary || "Public detail view."));

    if (item.isRemoved) {
      const removedLayout = create("section", "detail-layout is-stacked");
      const removedCard = create("article", "detail-main detail-removed-card");
      const removedTitle = create("h2", "", "Removed by owner");
      const removedBody = create(
        "p",
        "",
        "This artifact is no longer visible in public listings."
      );
      const backLink = create("a", "see-all", "Back to gallery");
      backLink.href = buildArtifactGalleryLink(config.detailType);
      removedCard.append(removedTitle, removedBody, backLink);
      removedLayout.appendChild(removedCard);
      host.appendChild(removedLayout);
      return;
    }

    if (item.viewFamily === "wheel" || config.detailType === "wheels") {
      const wheelLayout = create("section", "detail-layout is-stacked");
      const wheelMain = buildWheelDetailMain(item, { ...config, authState, helpers: data.helpers, openAuthModal: ctx.openAuthModal });
      if (typeof wheelMain?._cleanupWheelDetail === "function") {
        host._cleanupWheelDetail = wheelMain._cleanupWheelDetail;
      }
      wheelLayout.append(wheelMain);
      host.append(wheelLayout);
      return;
    }

    const layout = create("section", "detail-layout");
    const toolbar = buildLayoutToggle(layout);

    const main = buildDetailMain(item, config, data.helpers);
    const side = buildDetailSide(item, data.helpers, {
      authState,
      openAuthModal: ctx.openAuthModal,
      onRemoved() {
        renderDetail(ctx, config);
      }
    });

    layout.append(main, side);
    host.append(toolbar, layout);
  }

  function renderPollResults(ctx) {
    const { host, data, authState } = ctx;
    clear(host);

    const id = window.StreamSuitesPublicData.parseDetailId();
    const allPolls = data.polls || [];
    const poll = findArtifactByIdentifier(allPolls, id);

    if (!poll) {
      host.appendChild(buildPageHeading("Poll unavailable", "No public poll matches the requested identifier."));
      host.appendChild(create("div", "empty-state", "Check the poll link or return to the gallery."));
      return;
    }

    if (poll.isRemoved) {
      host.appendChild(buildPageHeading("Removed by owner", "This poll is no longer visible in public listings."));
      const removedLayout = create("section", "detail-layout is-stacked");
      const removedCard = create("article", "detail-main detail-removed-card");
      const backLink = create("a", "see-all", "Back to Polls");
      backLink.href = "/polls.html";
      removedCard.append(create("p", "", "Poll results are unavailable because this artifact was removed."), backLink);
      removedLayout.appendChild(removedCard);
      host.appendChild(removedLayout);
      return;
    }

    host.appendChild(buildPageHeading(`Results: ${poll.title}`, "Standalone poll results with shareable URL."));

    const layout = create("section", "detail-layout");
    const toolbar = buildLayoutToggle(layout);

    const main = create("article", "detail-main");
    const detailShell = create("div", "detail-shell");
    const vizCard = create("div", "detail-card");
    const vizHeading = create("div", "detail-heading");
    vizHeading.append(
      create("h3", "detail-title", "Poll results"),
      create("span", "timestamp", `Status: ${poll.status} | Total votes: ${formatNumber(poll.totalVotes)}`)
    );
    vizCard.append(vizHeading, buildVisualizationPanel(poll, { detailType: "polls" }));

    const breakdownCard = create("div", "detail-card vote-card");
    const breakdownHeading = create("div", "detail-heading");
    breakdownHeading.append(
      create("h3", "detail-title", "Vote breakdown"),
      create("span", "timestamp", data.helpers.toTimestamp(poll.updatedAt || poll.createdAt))
    );
    breakdownCard.append(breakdownHeading, buildVoteBreakdownList(poll.options || [], "percent"));

    detailShell.append(vizCard, breakdownCard);
    main.appendChild(detailShell);

    const side = buildDetailSide(poll, data.helpers, {
      authState,
      openAuthModal: ctx.openAuthModal,
      onRemoved() {
        renderPollResults(ctx);
      }
    });

    layout.append(main, side);
    host.append(toolbar, layout);
  }

  function renderCommunityHome(ctx) {
    const { host, data } = ctx;
    clear(host);
    const latestNotice = (data.notices || [])[0] || null;
    const liveEntries = sortLiveProfiles(collectLiveProfiles(data));
    const members = collectCommunityMembers(data, "");

    host.appendChild(
      buildDashboardHero({
        eyebrow: "Community workspace",
        title: "Community",
        body: "Member discovery, live visibility, notices, and account destinations now live inside the same public dashboard shell as media. The shell is unified even where later systems are still placeholder-only.",
        highlights: [
          `${formatNumber(members.length)} listed members`,
          `${formatNumber(liveEntries.length)} creators live now`,
          latestNotice ? "Latest notice surfaced below" : "Notice feed ready"
        ],
        actions: [
          { label: "Browse members", href: "/community/members.html", emphasis: "strong" },
          { label: "Open my data", href: "/community/my-data.html" }
        ],
        stats: [
          { label: "Members", value: formatNumber(members.length), note: "Directory entries" },
          { label: "Live now", value: formatNumber(liveEntries.length), note: "Public creators" },
          { label: "Notices", value: formatNumber((data.notices || []).length), note: "Published updates" },
          { label: "Public routes", value: "Unified", note: "Shared shell + nav" }
        ]
      })
    );

    host.appendChild(
      buildDashboardGrid([
        buildDashboardCard({
          title: "Member directory",
          kicker: "Operational now",
          badge: "Active",
          state: "active",
          body: "The public community landing now feels like part of the main dashboard instead of a second application with its own navigation identity.",
          meta: [`${formatNumber(members.length)} listed members`, "Alphabetical browse", "Search-ready"],
          actions: [{ label: "Open directory", href: "/community/members.html" }]
        }),
        buildDashboardCard({
          title: "Live visibility",
          kicker: "Operational now",
          badge: liveEntries.length ? "Live now" : "Monitoring",
          state: liveEntries.length ? "active" : "preview",
          body: "Live creators remain grounded in the existing public live logic while inheriting the same dashboard structure and entry points as the rest of the public surface.",
          meta: [`${formatNumber(liveEntries.length)} creators live`, "Canonical public profiles only"],
          actions: [{ label: "Open live", href: "/live" }]
        }),
        buildDashboardCard({
          title: "Member settings + data",
          kicker: "Account area",
          badge: "Expanded",
          state: "preview",
          body: "The community side now includes direct account destinations for My Data and Settings, even where later export/history features are still intentionally inactive.",
          meta: ["My Data placeholder added", "Settings kept truthful"],
          actions: [{ label: "Open my data", href: "/community/my-data.html" }, { label: "Open settings", href: "/community/settings.html", muted: true }]
        }),
        buildActionScaffoldCard({
          title: "Community moderation requests",
          body: "Future member-facing claim, report, and removal workflows can reuse this shared CTA language without creating fake moderation behavior in the current milestone."
        })
      ])
    );

    const noticeSection = buildSection("Latest notice", "/community/notices.html").section;
    if (latestNotice) {
      const noticeCard = create("article", "notice-card");
      noticeCard.append(
        create("h3", "", latestNotice.title),
        create("p", "", latestNotice.body),
        create("div", "notice-meta", `${data.helpers.toTimestamp(latestNotice.createdAt)} | ${latestNotice.author.displayName}`)
      );
      noticeSection.appendChild(noticeCard);
    } else {
      noticeSection.appendChild(create("div", "empty-state", "No notices published yet."));
    }
    host.appendChild(noticeSection);

    host.appendChild(buildMemberGallerySection(ctx, { title: "Member directory", seeAllHref: "/community/members.html" }));

    const liveSection = buildSection("Live now", "/live").section;
    const liveGrid = create("div", "profile-grid");
    liveEntries.slice(0, 4).forEach(({ profile, liveStatus }) => {
      liveGrid.appendChild(buildLiveProfileCard(profile, liveStatus));
    });
    if (liveGrid.childElementCount) {
      liveSection.appendChild(liveGrid);
    } else {
      liveSection.appendChild(create("div", "empty-state", "No public StreamSuites creators are live right now."));
    }
    host.appendChild(liveSection);
  }

  function buildPlaceholderWorkspacePage(ctx, options = {}) {
    const { host, authState } = ctx;
    clear(host);

    const authReady = Boolean(authState?.authenticated);
    const authLabel = authReady ? authState.displayName : "Guest";
    host.appendChild(
      buildDashboardHero({
        eyebrow: options.eyebrow || "Dashboard workspace",
        title: options.title || "Workspace",
        body: options.body || "",
        tone: options.tone || "planned",
        highlights: [
          authReady ? `Signed in as ${authLabel}` : "Public preview visible without backend actions",
          options.highlight || "Route and shell reserved for later expansion"
        ],
        actions: Array.isArray(options.actions) ? options.actions : [],
        stats: Array.isArray(options.stats) ? options.stats : []
      })
    );

    if (Array.isArray(options.cards) && options.cards.length) {
      host.appendChild(buildDashboardGrid(options.cards, options.gridClass || ""));
    }

    if (Array.isArray(options.followupCards) && options.followupCards.length) {
      host.appendChild(buildDashboardGrid(options.followupCards, options.followupGridClass || ""));
    }
  }

  function collectLiveProfiles(data) {
    return (data.profiles || [])
      .filter((profile) => profile?.isListed !== false && isProfileVisibleOnStreamSuites(profile))
      .map((profile) => ({ profile, liveStatus: getLiveStatus(profile) }))
      .filter((entry) => entry.liveStatus);
  }

  function sortLiveProfiles(entries) {
    return [...entries].sort((left, right) => {
      const leftViewers = left.liveStatus?.viewerCount ?? -1;
      const rightViewers = right.liveStatus?.viewerCount ?? -1;
      if (rightViewers !== leftViewers) return rightViewers - leftViewers;

      const leftChecked = Date.parse(left.liveStatus?.lastCheckedAt || "") || 0;
      const rightChecked = Date.parse(right.liveStatus?.lastCheckedAt || "") || 0;
      if (rightChecked !== leftChecked) return rightChecked - leftChecked;

      const leftStarted = Date.parse(left.liveStatus?.startedAt || "") || 0;
      const rightStarted = Date.parse(right.liveStatus?.startedAt || "") || 0;
      if (rightStarted !== leftStarted) return rightStarted - leftStarted;

      return String(left.profile?.displayName || "").localeCompare(String(right.profile?.displayName || ""));
    });
  }

  function buildLiveProfileCard(profile, liveStatus) {
    const card = create("article", "profile-card");
    card.appendChild(buildCreatorMeta(profile, { expanded: true, includeRoleChip: false, enableHover: true }));

    const meta = create("div", "item-meta");
    meta.append(
      buildPlatformChip(liveStatus?.providerLabel || profile?.platform || "Live", window.StreamSuitesPublicData?.platformIconFor?.(liveStatus?.provider || profile?.platform)),
      buildStatusChip("Live")
    );

    if (profile?.platform && norm(profile.platform) !== norm(liveStatus?.providerLabel || "")) {
      meta.appendChild(buildPlatformChip(profile.platform, profile.platformIcon));
    }

    if (liveStatus?.viewerCount != null) {
      meta.appendChild(create("span", "meta-pill", `${formatNumber(liveStatus.viewerCount)} watching`));
    }

    const summary = create(
      "p",
      "item-snippet",
      liveStatus?.title || `${liveStatus?.providerLabel || "Creator"} stream is live now on the public StreamSuites surface.`
    );

    const actions = create("div", "live-directory-actions");
    const profileLink = create("a", "see-all", "Open profile");
    profileLink.href = buildProfileHref(profile);
    actions.appendChild(profileLink);
    if (liveStatus?.url) {
      const watchLink = create("a", "see-all", "Watch stream");
      watchLink.href = liveStatus.url;
      watchLink.target = "_blank";
      watchLink.rel = "noopener noreferrer";
      actions.appendChild(watchLink);
    }

    const checkedAt = liveStatus?.lastCheckedAt ? create("p", "item-snippet", `Last checked ${toTimestamp(liveStatus.lastCheckedAt)}`) : null;
    card.append(meta, summary);
    if (checkedAt) card.appendChild(checkedAt);
    card.appendChild(actions);
    return card;
  }

  function renderCommunityMembers(ctx) {
    const { host } = ctx;
    clear(host);
    host.appendChild(buildPageHeading("Members Directory", "Search all public creator/member profiles."));
    host.appendChild(buildMemberGallerySection(ctx));
  }

  function renderCommunityLive(ctx) {
    const { host, data, state } = ctx;
    clear(host);
    host.appendChild(buildPageHeading("Live Now", "Browse creators currently live on the canonical StreamSuites public surface."));

    const entries = sortLiveProfiles(collectLiveProfiles(data)).filter(({ profile, liveStatus }) => {
      const haystack = [
        profile?.displayName,
        profile?.publicSlug,
        profile?.username,
        profile?.platform,
        liveStatus?.providerLabel,
        liveStatus?.title
      ].join(" ").toLowerCase();
      return haystack.includes(String(state.query || "").trim().toLowerCase());
    });

    const summary = create("section", "section");
    const summaryHead = create("div", "section-heading");
    summaryHead.append(
      create("h2", "", "Currently live creators"),
      create("span", "meta-pill status-pill status-live", `${entries.length} live`)
    );
    summary.appendChild(summaryHead);

    if (!entries.length) {
      summary.appendChild(
        create("div", "empty-state", state.query ? "No live creators match this search." : "No public StreamSuites creators are live right now.")
      );
      host.appendChild(summary);
      return;
    }

    const grid = create("section", "profile-grid");
    entries.forEach(({ profile, liveStatus }) => {
      grid.appendChild(buildLiveProfileCard(profile, liveStatus));
    });
    summary.appendChild(grid);
    host.appendChild(summary);
  }

  function renderCommunityNotices(ctx) {
    const { host, data, state } = ctx;
    clear(host);
    host.appendChild(buildPageHeading("Community Notices", "All published notices and updates."));

    const list = create("section", "section");
    const notices = (data.notices || []).filter((notice) => {
      const haystack = `${notice.title} ${notice.body} ${notice.author.displayName} ${notice.priority}`.toLowerCase();
      return haystack.includes(norm(state.query));
    });

    notices.forEach((notice) => {
      const card = create("article", "notice-card");
      card.append(
        create("h3", "", notice.title),
        create("p", "", notice.body),
        create("div", "notice-meta", `${notice.priority} | ${data.helpers.toTimestamp(notice.createdAt)} | ${notice.author.displayName}`)
      );
      list.appendChild(card);
    });

    host.appendChild(list);
    if (!notices.length) {
      host.appendChild(create("div", "empty-state", "No notices match this search."));
    }
  }

  function renderWheelsWorkspace(ctx) {
    buildPlaceholderWorkspacePage(ctx, {
      eyebrow: "Planned public module",
      title: "Wheels",
      body: "This route now lives inside the unified public dashboard so future competition wheels, prize wheels, or community pickers can land without introducing another separate shell.",
      actions: [
        { label: "Back to media home", href: "/media", emphasis: "strong" },
        { label: "Browse polls", href: "/polls" }
      ],
      stats: [
        { label: "Runtime status", value: "Planned", note: "No wheel engine wired" },
        { label: "Shell status", value: "Ready", note: "Route + nav reserved" }
      ],
      cards: [
        buildDashboardCard({
          title: "Viewer wheel surface",
          kicker: "Not active yet",
          badge: "Planned",
          state: "planned",
          body: "Wheel rendering, result state, and trigger authority are out of scope for this milestone. Only the public dashboard destination and visual language are being prepared here.",
          meta: ["No backend actions", "No trigger wiring", "No runtime-owned wheel logic copied locally"]
        }),
        buildDashboardCard({
          title: "Planned future uses",
          kicker: "Direction only",
          badge: "Reserved",
          state: "preview",
          body: "This workspace is intended to absorb public contest wheels, event pickers, or on-stream selection views when the authoritative runtime implementations are ready.",
          meta: ["Contest wheels", "Community picks", "Event surfaces"]
        }),
        buildActionScaffoldCard({
          title: "Wheel ownership / report requests",
          body: "Future claim, dispute, or removal-report actions can use this pattern when public wheels become real artifacts."
        })
      ]
    });
  }

  function renderGamesEconomyWorkspace(ctx) {
    buildPlaceholderWorkspacePage(ctx, {
      eyebrow: "Planned public module",
      title: "Games / Economy",
      body: "Games, balances, rewards, and public economy views are staged as first-class destinations in the unified dashboard without fabricating balances, inventory, or progression data before the backend exists.",
      actions: [
        { label: "Back to media home", href: "/media", emphasis: "strong" },
        { label: "Open community", href: "/community" }
      ],
      stats: [
        { label: "Economy data", value: "Offline", note: "No public authority yet" },
        { label: "Route status", value: "Ready", note: "Destination reserved" }
      ],
      cards: [
        buildDashboardCard({
          title: "Viewer economy summary",
          kicker: "Not active yet",
          badge: "Planned",
          state: "planned",
          body: "No balances, wallet, inventory, or reward history are being simulated here. This page exists to establish the public shell and navigation footprint only.",
          meta: ["No fake hydration", "No wallet logic", "No rewards ledger"]
        }),
        buildDashboardCard({
          title: "Games surface",
          kicker: "Reserved for later",
          badge: "Planned",
          state: "planned",
          body: "Future lightweight public game modules can attach to this route family later without splitting the public experience away from media and community again.",
          meta: ["Route family reserved", "Shared dashboard styling"]
        }),
        buildActionScaffoldCard({
          title: "Economy support requests",
          body: "This CTA pattern is reserved for future balance disputes or data-correction requests when public economy systems become authoritative."
        })
      ]
    });
  }

  function renderCommunityMyData(ctx) {
    const { host, authState, openAuthModal } = ctx;
    clear(host);
    const authReady = Boolean(authState?.authenticated);
    host.appendChild(
      buildDashboardHero({
        eyebrow: "Account workspace",
        title: "My Data",
        body: authReady
          ? "Review your real public authority submissions here. Request status remains backend-owned, and pending requests are not treated as completed outcomes."
          : "Sign in to view your real public authority submission history. This page does not fabricate account history for guest sessions.",
        tone: authReady ? "active" : "preview",
        actions: authReady
          ? [
              { label: "Open settings", href: "/community/settings.html", emphasis: "strong" },
              { label: "Browse community", href: "/community" }
            ]
          : [
              { label: "Use account menu", disabled: true, emphasis: "strong", note: "Open the existing account menu to sign in." },
              { label: "Browse community", href: "/community" }
            ],
        stats: [
          { label: "Access", value: authReady ? "Signed in" : "Guest", note: authReady ? authState.displayName : "Login required for request history" },
          { label: "Authority history", value: authReady ? "Live" : "Locked", note: authReady ? "Backed by /requests/mine" : "Unavailable without session" },
          { label: "Exports", value: "Planned", note: "No export job exposed yet" }
        ]
      })
    );

    if (!authReady) {
      const empty = create("div", "empty-state");
      empty.textContent = "Sign in to load your public authority requests.";
      const cta = create("button", "dashboard-action is-strong", "Sign in");
      cta.type = "button";
      cta.addEventListener("click", () => openAuthModal?.("login"));
      host.append(empty, cta);
      return;
    }

    host.appendChild(
      buildDashboardGrid([
        buildDashboardCard({
          title: "Authority request history",
          kicker: "Live backend data",
          badge: "Active",
          state: "active",
          body: "This panel reflects the real `/api/public/authority/requests/mine` response. Pending requests remain pending until an operator changes status.",
          meta: ["Claim, assign, report, and removal requests", "Admin notes appear when the backend returns them", "No fake completion states"]
        }),
        buildDashboardCard({
          title: "Important behavior",
          kicker: "Truthful workflow",
          badge: "Review-first",
          state: "preview",
          body: "Approval updates request state and review metadata. It does not imply automatic identity transfer, and removal approval suppresses public visibility rather than deleting the underlying record.",
          meta: ["Pending stays pending", "Removal is suppression/unlisting", "Transfer is not auto-executed here"]
        }),
        buildActionScaffoldCard({
          title: "New authority requests",
          body: "Use profile or artifact pages that can resolve a real authority target to submit new requests. This account view is for truthful history, not blind target entry."
        })
      ], "dashboard-card-grid--three")
    );

    const section = buildSection("My authority requests").section;
    const status = create("p", "muted authority-history-status", "Loading your request history…");
    const list = create("div", "dashboard-card-grid dashboard-card-grid--three authority-history-grid");
    section.append(status, list);
    host.appendChild(section);

    (async () => {
      try {
        const requests = await fetchMyPublicAuthorityRequests();
        if (!requests.length) {
          status.textContent = "No public authority requests submitted yet.";
          list.appendChild(create("div", "empty-state", "You have not submitted any public authority requests yet."));
          return;
        }
        status.textContent = `${formatNumber(requests.length)} request${requests.length === 1 ? "" : "s"} loaded.`;
        requests.forEach((request) => {
          list.appendChild(buildAuthorityHistoryCard(request));
        });
      } catch (error) {
        status.textContent = error instanceof Error ? error.message : "Unable to load your request history.";
        list.appendChild(create("div", "empty-state", "Request history is unavailable right now."));
      }
    })();
  }

  function resolveLocalProfile(data, code) {
    const normalizedCode = normalizeUserCode(code || "public-user");
    const fallback = data.profilesById?.[window.StreamSuitesPublicData.DEFAULT_PROFILE.id] || window.StreamSuitesPublicData.DEFAULT_PROFILE;
    const direct =
      data.profilesBySlug?.[normalizedCode] ||
      data.profilesByCode?.[normalizedCode] ||
      data.profilesById?.[normalizedCode];
    if (direct) return direct;

    const aliasMatch = (data.profiles || []).find((profile) => {
      return collectProfileIdentifiers(profile, { includeDisplayNames: true }).includes(normalizedCode);
    });
    return aliasMatch || fallback;
  }

  function findLocalProfile(data, code) {
    const normalizedCode = normalizeUserCode(code || "", "");
    if (!normalizedCode) return null;
    const direct =
      data.profilesBySlug?.[normalizedCode] ||
      data.profilesByCode?.[normalizedCode] ||
      data.profilesById?.[normalizedCode];
    if (direct) return direct;

    return (data.profiles || []).find((profile) => collectProfileIdentifiers(profile, { includeDisplayNames: true }).includes(normalizedCode)) || null;
  }

  function resolveCommunityProfileCode(data) {
    const params = new URLSearchParams(window.location.search || "");
    const byCode = String(params.get("u") || "").trim();
    const legacyId = String(params.get("id") || "").trim();
    const fallbackCode = window.StreamSuitesPublicData.DEFAULT_PROFILE.userCode || "public-user";

    if (byCode) {
      const normalized = normalizeUserCode(byCode, fallbackCode);
      const safeHref = buildLegacyProfileHref(findLocalProfile(data, normalized) || normalized);
      if (window.location.pathname + window.location.search !== safeHref) {
        window.history.replaceState(window.history.state, "", safeHref);
      }
      return normalized;
    }

    if (legacyId) {
      if (isUuidLike(legacyId)) {
        window.history.replaceState(window.history.state, "", "/community/profile.html");
        return fallbackCode;
      }
      const profile = resolveLocalProfile(data, legacyId);
      const normalized = normalizeUserCode(profile?.publicSlug || profile?.userCode || profile?.id || fallbackCode, fallbackCode);
      window.history.replaceState(window.history.state, "", buildLegacyProfileHref(profile || normalized));
      return normalized;
    }

    return fallbackCode;
  }

  function resolveStandaloneProfileCode() {
    const normalizedPath = normalizePath(window.location.pathname);
    if (normalizedPath === "/u" || normalizedPath === "/u/index.html") {
      return "";
    }
    if (!normalizedPath.startsWith(CANONICAL_PROFILE_PREFIX)) {
      return "";
    }
    const slug = normalizedPath.slice(CANONICAL_PROFILE_PREFIX.length).split("/")[0] || "";
    return normalizeUserCode(slug, "");
  }

  function socialIconPath(network) {
    const api = getSocialDataApi();
    if (typeof api?.socialIconPath === "function") return api.socialIconPath(network);
    return "/assets/icons/link.svg";
  }

  function normalizeProfilePayload(payload, fallbackProfile, fallbackCode) {
    const inferredCreatorCapable = firstBoolean(payload?.creator_capable, payload?.creatorCapable, fallbackProfile?.creatorCapable);
    const inferredViewerOnly = firstBoolean(payload?.viewer_only, payload?.viewerOnly, fallbackProfile?.viewerOnly);
    const accountType =
      normalizeAccountType(payload?.account_type) ||
      normalizeAccountType(payload?.accountType) ||
      normalizeAccountType(fallbackProfile?.accountType) ||
      normalizeAccountType(fallbackProfile?.account_type) ||
      (String(payload?.role || fallbackProfile?.role || "").toLowerCase().includes("admin")
        ? "ADMIN"
        : String(payload?.role || fallbackProfile?.role || "").toLowerCase().includes("developer")
          ? "DEVELOPER"
          : String(payload?.role || fallbackProfile?.role || "").toLowerCase().includes("creator")
          ? "CREATOR"
          : inferredCreatorCapable === true
            ? "CREATOR"
            : inferredViewerOnly === true
              ? "VIEWER"
              : "VIEWER");
    const role = accountTypeToRole(accountType);
    const tier = resolveProfileTier(payload?.tier || fallbackProfile?.tier || "", accountType);
    const publicSlug = getCanonicalProfileSlug(
      payload?.public_slug || payload?.publicSlug || payload?.slug || fallbackProfile?.publicSlug || fallbackProfile?.slug || "",
      ""
    );
    const userCode = normalizeUserCode(
      payload?.user_code || payload?.userCode || fallbackProfile?.userCode || fallbackCode || "public-user"
    );
    const canonicalPublicUrl = publicSlug ? `https://streamsuites.app/u/${encodeURIComponent(publicSlug)}` : "";
    const displayName = String(payload?.display_name || payload?.displayName || fallbackProfile?.displayName || "Public User").trim() || "Public User";
    const avatar = String(payload?.avatar_url || payload?.avatarUrl || fallbackProfile?.avatar || window.StreamSuitesPublicData.DEFAULT_PROFILE.avatar || "").trim();
    const coverImageUrl = String(payload?.cover_image_url || payload?.coverImageUrl || fallbackProfile?.coverImageUrl || DEFAULT_PROFILE_COVER).trim() || DEFAULT_PROFILE_COVER;
    const bannerImageUrl = String(
      payload?.banner_image_url || payload?.bannerImageUrl || payload?.cover_image_url || payload?.coverImageUrl || fallbackProfile?.bannerImageUrl || coverImageUrl
    ).trim() || coverImageUrl;
    const backgroundImageUrl = String(payload?.background_image_url || payload?.backgroundImageUrl || fallbackProfile?.backgroundImageUrl || "").trim();
    const bio = String(payload?.bio || fallbackProfile?.bio || "").trim();
    const joinedAt = String(
      payload?.joined_at ||
      payload?.joinedAt ||
      payload?.created_at ||
      payload?.createdAt ||
      payload?.account_created_at ||
      payload?.accountCreatedAt ||
      fallbackProfile?.joinedAt ||
      fallbackProfile?.createdAt ||
      ""
    ).trim();
    const socialLinks = normalizeSocialLinks(payload?.social_links || payload?.socialLinks || fallbackProfile?.socialLinks);
    const isAnonymous = payload?.is_anonymous === true || payload?.anonymous === true || fallbackProfile?.isAnonymous === true;
    const isListed = payload?.is_listed !== false && payload?.listed !== false && fallbackProfile?.isListed !== false;
    const creatorCapable = firstBoolean(payload?.creator_capable, payload?.creatorCapable, fallbackProfile?.creatorCapable, accountType !== "VIEWER") === true;
    const viewerOnly =
      firstBoolean(payload?.viewer_only, payload?.viewerOnly, fallbackProfile?.viewerOnly, accountType === "VIEWER" && !creatorCapable) === true;
    const streamsuitesProfileUrl = String(
      payload?.streamsuites_profile_url || payload?.streamsuitesProfileUrl || fallbackProfile?.streamsuitesProfileUrl || canonicalPublicUrl || ""
    ).trim();
    const streamsuitesShareUrl = String(
      payload?.streamsuites_share_url || payload?.streamsuitesShareUrl || fallbackProfile?.streamsuitesShareUrl || streamsuitesProfileUrl || ""
    ).trim();
    const streamsuitesProfileEnabled = firstBoolean(
      payload?.streamsuites_profile_enabled,
      payload?.streamsuitesProfileEnabled,
      fallbackProfile?.streamsuitesProfileEnabled,
      true
    ) === true;
    const streamsuitesProfileEligible = firstBoolean(
      payload?.streamsuites_profile_eligible,
      payload?.streamsuitesProfileEligible,
      fallbackProfile?.streamsuitesProfileEligible,
      Boolean(publicSlug)
    ) === true;
    const streamsuitesProfileVisible = firstBoolean(
      payload?.streamsuites_profile_visible,
      payload?.streamsuitesProfileVisible,
      fallbackProfile?.streamsuitesProfileVisible,
      streamsuitesProfileEnabled && streamsuitesProfileEligible
    ) === true;
    const streamsuitesProfileStatusReason = String(
      payload?.streamsuites_profile_status_reason ||
      payload?.streamsuitesProfileStatusReason ||
      fallbackProfile?.streamsuitesProfileStatusReason ||
      (streamsuitesProfileVisible ? "visible" : "")
    ).trim();
    const findmehereEnabled = firstBoolean(payload?.findmehere_enabled, payload?.findmehereEnabled, fallbackProfile?.findmehereEnabled, false) === true;
    const findmehereEligible = firstBoolean(payload?.findmehere_eligible, payload?.findmehereEligible, fallbackProfile?.findmehereEligible, false) === true;
    const findmehereVisible = firstBoolean(payload?.findmehere_visible, payload?.findmehereVisible, fallbackProfile?.findmehereVisible, false) === true;
    const findmehereProfileUrl = String(
      payload?.findmehere_profile_url || payload?.findmehereProfileUrl || fallbackProfile?.findmehereProfileUrl || ""
    ).trim();
    const findmehereShareUrl = String(
      payload?.findmehere_share_url || payload?.findmehereShareUrl || fallbackProfile?.findmehereShareUrl || findmehereProfileUrl || ""
    ).trim();
    const findmehereStatusReason = String(
      payload?.findmehere_status_reason || payload?.findmehereStatusReason || fallbackProfile?.findmehereStatusReason || ""
    ).trim();
    const liveStatus = fallbackProfile?.liveStatus || null;
    const latestStream = normalizeLatestStreamPayload(payload?.latest_stream || payload?.latestStream || fallbackProfile?.latestStream);
    return {
      id: fallbackProfile?.id || userCode,
      userCode,
      publicSlug,
      slug: publicSlug,
      slugAliases: normalizeSlugAliases(payload?.slug_aliases || payload?.slugAliases || fallbackProfile?.slugAliases),
      username: fallbackProfile?.username || publicSlug || userCode,
      displayName,
      avatar,
      platform: fallbackProfile?.platform || "StreamSuites",
      platformKey: fallbackProfile?.platformKey || "streamsuites",
      platformIcon: fallbackProfile?.platformIcon || "/assets/icons/pilled.svg",
      role,
      accountType,
      tier,
      joinedAt,
      bio,
      socialLinks,
      coverImageUrl,
      bannerImageUrl,
      backgroundImageUrl,
      isAnonymous,
      isListed,
      badges: normalizeAuthoritativeBadges(payload?.badges, accountType, tier),
      publicSurfaceAccountType: String(
        payload?.public_surface_account_type || payload?.publicSurfaceAccountType || fallbackProfile?.publicSurfaceAccountType || (creatorCapable ? "creator_capable" : "viewer_only")
      ).trim(),
      creatorCapable,
      viewerOnly,
      streamsuitesProfileUrl,
      streamsuitesShareUrl,
      streamsuitesProfileEnabled,
      streamsuitesProfileEligible,
      streamsuitesProfileVisible,
      streamsuitesProfileStatusReason,
      findmehereEnabled,
      findmehereEligible,
      findmehereVisible,
      findmehereProfileUrl,
      findmehereShareUrl,
      findmehereStatusReason,
      liveStatus,
      latestStream,
      authorityIdentity: payload?.authorityIdentity || payload?.authority_identity || fallbackProfile?.authorityIdentity || null
    };
  }

  async function fetchPublicProfileByIdentifier(identifier) {
    const endpoint = new URL(AUTH_PUBLIC_PROFILE_URL);
    endpoint.searchParams.set("slug", normalizeUserCode(identifier));
    const response = await fetch(endpoint.toString(), {
      method: "GET",
      cache: "no-store",
      credentials: "include",
      headers: { Accept: "application/json" }
    });
    if (!response.ok) {
      const error = new Error(`public profile request failed (${response.status})`);
      error.status = response.status;
      throw error;
    }
    const payload = await response.json();
    return payload?.profile && typeof payload.profile === "object" ? payload.profile : payload;
  }

  function syncStandaloneProfileCanonicalUrl(profile, requestedIdentifier) {
    const canonicalSlug = getCanonicalProfileSlug(profile, "");
    const requested = normalizeUserCode(requestedIdentifier, "");
    if (!canonicalSlug || !requested || canonicalSlug === requested) return;
    const canonicalHref = buildCanonicalProfileHref(profile);
    if (normalizePath(window.location.pathname) === normalizePath(canonicalHref)) return;
    // TODO: replace with a server-side redirect once migration-safe legacy handling is retired.
    window.history.replaceState(window.history.state, "", canonicalHref);
  }

  function canEditResolvedProfile(authState, profile, fallbackIdentifier = "") {
    if (!authState?.authenticated) return false;
    const authIdentifiers = new Set([
      getCanonicalProfileSlug(authState, ""),
      getLegacyProfileCode(authState, "")
    ].filter(Boolean));
    return collectProfileIdentifiers(profile || fallbackIdentifier).some((identifier) => authIdentifiers.has(identifier));
  }

  function renderProfileNotFound(host, requestedCode, options = {}) {
    const normalizedCode = String(requestedCode || "").trim();
    const title = normalizedCode ? `@${normalizedCode}` : "Profile";
    const subtitle = normalizedCode
      ? "This public profile could not be found."
      : "A public profile slug is required for this route.";
    renderStandaloneProfileMessage(host, {
      title,
      subtitle,
      authState: options.authState || null,
      openAuthModal: options.openAuthModal || null,
      onMenuAction: options.onMenuAction || null
    });
    document.title = normalizedCode ? `${normalizedCode} | Profile Not Found` : "Profile Not Found | StreamSuites";
  }

  function renderProfileUnavailable(host, profile, requestedCode, options = {}) {
    const normalizedCode = String(profile?.publicSlug || requestedCode || "").trim();
    const title = normalizedCode ? `@${normalizedCode}` : "Profile unavailable";
    const subtitle = "This canonical StreamSuites public profile is currently unavailable.";
    renderStandaloneProfileMessage(host, {
      title,
      subtitle: buildUnavailableProfileMessage(profile) || subtitle,
      authState: options.authState || null,
      openAuthModal: options.openAuthModal || null,
      onMenuAction: options.onMenuAction || null
    });
    document.title = normalizedCode ? `${normalizedCode} | Profile Unavailable` : "Profile Unavailable | StreamSuites";
  }

  async function fetchMyPublicProfile() {
    const response = await fetch(AUTH_PUBLIC_PROFILE_ME_URL, {
      method: "GET",
      cache: "no-store",
      credentials: "include",
      headers: { Accept: "application/json" }
    });
    if (!response.ok) {
      throw new Error(`public profile me request failed (${response.status})`);
    }
    const payload = await response.json();
    return payload?.profile && typeof payload.profile === "object" ? payload.profile : payload;
  }

  async function saveMyPublicProfile(payload) {
    const response = await fetch(AUTH_PUBLIC_PROFILE_ME_URL, {
      method: "POST",
      cache: "no-store",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload || {})
    });
    const responsePayload = await response.json().catch(() => ({}));
    if (!response.ok || responsePayload?.success === false) {
      throw new Error(String(responsePayload?.error || "").trim() || `save failed (${response.status})`);
    }
    return responsePayload?.profile && typeof responsePayload.profile === "object"
      ? responsePayload.profile
      : responsePayload;
  }

  function collectProfileArtifacts(data, ...profileKeys) {
    const seen = new Set();
    const items = [];
    profileKeys.forEach((key) => {
      const normalizedKey = normalizeUserCode(key, "");
      if (!normalizedKey) return;
      (data.artifactsByProfile?.[normalizedKey] || []).forEach((item) => {
        if (!item || item.isRemoved) return;
        if (seen.has(item.id)) return;
        seen.add(item.id);
        items.push(item);
      });
    });
    return items;
  }

  function readProfileArtifactLayoutPreference() {
    try {
      const raw = window.localStorage.getItem(PROFILE_ARTIFACT_LAYOUT_STORAGE_KEY);
      if (raw === "gallery" || raw === "list") return raw;
    } catch (_err) {
      // Ignore storage failures.
    }
    return "gallery";
  }

  function writeProfileArtifactLayoutPreference(value) {
    try {
      window.localStorage.setItem(PROFILE_ARTIFACT_LAYOUT_STORAGE_KEY, value === "list" ? "list" : "gallery");
    } catch (_err) {
      // Ignore storage failures.
    }
  }

  function buildProfileArtifactsToggle(initialMode, onModeChange) {
    const wrap = create("div", "detail-layout-toggle-group profile-artifact-toggle");
    const galleryBtn = create("button", "detail-layout-toggle");
    galleryBtn.type = "button";
    galleryBtn.dataset.mode = "gallery";
    galleryBtn.setAttribute("aria-label", "Show gallery artifact view");
    galleryBtn.appendChild(createIcon(UI_ICON_MAP.gallery, "button-icon-mask"));
    const listBtn = create("button", "detail-layout-toggle");
    listBtn.type = "button";
    listBtn.dataset.mode = "list";
    listBtn.setAttribute("aria-label", "Show list artifact view");
    listBtn.appendChild(createIcon(UI_ICON_MAP.list, "button-icon-mask"));
    wrap.append(galleryBtn, listBtn);

    const setMode = (nextMode, persist = true) => {
      const mode = nextMode === "list" ? "list" : "gallery";
      galleryBtn.classList.toggle("active", mode === "gallery");
      listBtn.classList.toggle("active", mode === "list");
      galleryBtn.setAttribute("aria-pressed", mode === "gallery" ? "true" : "false");
      listBtn.setAttribute("aria-pressed", mode === "list" ? "true" : "false");
      if (persist) writeProfileArtifactLayoutPreference(mode);
      if (typeof onModeChange === "function") onModeChange(mode);
    };

    galleryBtn.addEventListener("click", () => setMode("gallery", true));
    listBtn.addEventListener("click", () => setMode("list", true));
    setMode(initialMode, false);
    return { wrap, setMode };
  }

  function buildSocialLinksRow(socialLinks) {
    const row = create("div", "profile-social-row");
    const entries = collectOrderedSocialEntries(socialLinks);
    if (!entries.length) {
      row.appendChild(create("span", "muted", "No social links set."));
      return row;
    }
    const collapsedLimit = getProfileSocialVisibleLimit();
    const hiddenEntries = entries.slice(collapsedLimit);
    let expanded = false;
    const render = () => {
      row.innerHTML = "";
      const visibleEntries = expanded ? entries : entries.slice(0, collapsedLimit);
      visibleEntries.forEach((entry) => {
        row.appendChild(buildSocialIconLink(entry));
      });
      if (hiddenEntries.length) {
        const toggle = create("button", "social-overflow-toggle", expanded ? "Less" : `+${hiddenEntries.length}`);
        toggle.type = "button";
        toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
        toggle.setAttribute(
          "aria-label",
          expanded ? "Collapse extra social links" : `Show ${hiddenEntries.length} more social links`
        );
        toggle.addEventListener("click", () => {
          expanded = !expanded;
          render();
        });
        row.appendChild(toggle);
      }
    };
    render();
    return row;
  }

  function getProfileHeaderSocialVisibleLimit() {
    if (window.matchMedia("(max-width: 520px)").matches) return 3;
    if (window.matchMedia("(max-width: 760px)").matches) return 4;
    if (window.matchMedia("(max-width: 1080px)").matches) return 6;
    return 10;
  }

  function buildProfileHeaderSocialRail(socialLinks) {
    const entries = collectOrderedSocialEntries(socialLinks);
    if (!entries.length) return null;

    const wrap = create("div", "profile-header-social-wrap");
    const rail = create("div", "profile-header-social-rail");
    rail.setAttribute("aria-label", "Profile social links");
    const toggle = create("button", "profile-header-social-overflow", "+");
    toggle.type = "button";
    toggle.setAttribute("aria-expanded", "false");
    const panel = create("div", "profile-header-social-panel");
    panel.hidden = true;

    let expanded = false;
    const render = () => {
      const visibleLimit = Math.max(1, Math.min(entries.length, getProfileHeaderSocialVisibleLimit()));
      const visibleEntries = entries.slice(0, visibleLimit);
      const hiddenEntries = entries.slice(visibleLimit);
      rail.innerHTML = "";
      panel.innerHTML = "";

      visibleEntries.forEach((entry) => {
        rail.appendChild(buildSocialIconLink(entry, "profile-header-social-btn", "profile-header-social-icon"));
      });

      hiddenEntries.forEach((entry) => {
        panel.appendChild(buildSocialIconLink(entry, "profile-header-social-panel-btn", "profile-header-social-icon"));
      });

      toggle.hidden = hiddenEntries.length === 0;
      toggle.textContent = hiddenEntries.length ? `+${hiddenEntries.length}` : "+";
      toggle.setAttribute(
        "aria-label",
        expanded ? "Collapse extra social links" : `Show ${hiddenEntries.length} more social links`
      );
      toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
      panel.hidden = !expanded || hiddenEntries.length === 0;
      wrap.classList.toggle("is-expanded", expanded && hiddenEntries.length > 0);
    };

    toggle.addEventListener("click", (event) => {
      event.stopPropagation();
      expanded = !expanded;
      render();
    });
    const handleDocumentClick = (event) => {
      if (!wrap.contains(event.target)) {
        expanded = false;
        render();
      }
    };
    const handleDocumentKeydown = (event) => {
      if (event.key === "Escape" && expanded) {
        expanded = false;
        render();
      }
    };
    document.addEventListener("click", handleDocumentClick);
    document.addEventListener("keydown", handleDocumentKeydown);
    window.addEventListener("resize", render, { passive: true });
    registerStandaloneProfileCleanup(() => {
      document.removeEventListener("click", handleDocumentClick);
      document.removeEventListener("keydown", handleDocumentKeydown);
      window.removeEventListener("resize", render);
    });

    wrap.append(rail, toggle, panel);
    render();
    return wrap;
  }

  function normalizeProfileHeaderAccountBadges(badges = []) {
    const normalized = (Array.isArray(badges) ? badges : [])
      .map((badge) => {
        if (!badge || typeof badge !== "object") return null;
        const key = normalizeBadgeKey(badge.key || badge.icon_key || badge.iconKey || badge.value);
        if (!key) return null;
        return {
          key,
          label: String(badge.label || badge.title || key).trim() || key
        };
      })
      .filter(Boolean)
      .filter((badge) => badge.key !== "founder");

    const roleBadge = normalized.find((badge) => badge.key === "admin" || badge.key === "developer");
    if (roleBadge) return [roleBadge];
    const tierBadge = normalized.find((badge) => ["core", "gold", "pro"].includes(badge.key));
    return tierBadge ? [tierBadge] : [];
  }

  function buildProfileHeaderAccountWidget(authState, options = {}) {
    const authenticated = Boolean(authState?.authenticated);
    const widget = create("div", "account-widget profile-header-account ss-no-profile-hover");
    widget.setAttribute("data-ss-profile-hover", "off");

    const account = create("button", "account-pill account-trigger");
    account.type = "button";
    account.setAttribute("aria-haspopup", "menu");
    account.setAttribute("aria-expanded", "false");
    account.classList.toggle("is-authenticated", authenticated);

    const accountAvatar = create("span", "account-avatar");
    const avatarUrl = authenticated ? String(authState?.avatarUrl || "").trim() : "";
    if (avatarUrl) {
      accountAvatar.classList.add("has-image");
      accountAvatar.style.backgroundImage = `url(${avatarUrl})`;
    } else {
      accountAvatar.appendChild(createIcon(UI_ICON_MAP.profile, "account-avatar-icon"));
    }

    const accountText = create("span", "account-text");
    const accountName = create("span", "account-name", authenticated ? authState.displayName || "User" : "Login");
    const accountBadges = create("span", "account-badges");
    if (authenticated) {
      normalizeProfileHeaderAccountBadges(authState?.badges).forEach((badge) => {
        const icon = create("img", "account-badge-icon");
        icon.src = BADGE_ICON_MAP[badge.key];
        if (!icon.src) return;
        icon.alt = badge.label || badge.key;
        accountBadges.appendChild(
          getPublicBadgeUi()?.wrapTooltipTarget?.(
            icon,
            getPublicBadgeUi()?.resolveBadgeLabel?.(badge, "Badge") || badge.label || badge.key,
            { className: "ss-badge-tooltip-target ss-badge-tooltip-target--icon" }
          ) || icon
        );
      });
    }
    accountText.append(accountName, accountBadges);
    account.append(accountAvatar, accountText);

    const accountMenu = create("div", "account-menu");
    accountMenu.hidden = true;
    accountMenu.setAttribute("role", "menu");
    const menuItems = buildAccountMenuItems(authState);

    if (authenticated) {
      const header = create("div", "account-menu-header");
      header.append(
        create("div", "account-menu-name", authState.displayName || "User"),
        create("div", "account-menu-role", authState.accessClass || authState.accountType || "")
      );
      accountMenu.appendChild(header);
      if (authState.accountId || authState.userCode || authState.displayTier) {
        const overview = create("div", "account-menu-overview");
        [
          { label: "User code", value: authState.userCode || "Not available" },
          { label: "Account type", value: authState.accessClass || authState.accountType || "VIEWER" },
          { label: "Tier", value: authState.displayTier || authState.tier || "core" }
        ].forEach((row) => {
          const item = create("div", "account-menu-overview-row");
          item.append(
            create("span", "account-menu-overview-label", row.label),
            create("span", "account-menu-overview-value", row.value)
          );
          overview.appendChild(item);
        });
        accountMenu.appendChild(overview);
      }
    }

    menuItems.forEach((item) => {
      if (!item || typeof item !== "object") return;
      if (item.separator) {
        accountMenu.appendChild(create("div", "account-menu-separator"));
        return;
      }
      const label = String(item.label || "").trim();
      if (!label) return;
      const menuItem = item.href ? create("a", "account-menu-item", label) : create("button", "account-menu-item", label);
      if (item.href) {
        menuItem.href = String(item.href);
        if (item.target) menuItem.target = String(item.target);
        if (item.rel) menuItem.rel = String(item.rel);
      } else {
        menuItem.type = "button";
      }
      menuItem.setAttribute("role", "menuitem");
      if (item.subtle) menuItem.classList.add("is-subtle");
      if (String(item.action || "").toLowerCase() === "logout") menuItem.classList.add("is-danger");
      menuItem.addEventListener("click", (event) => {
        accountMenu.hidden = true;
        account.classList.remove("is-open");
        account.setAttribute("aria-expanded", "false");
        if (!item.href) event.preventDefault();
        if (typeof options.onMenuAction === "function") {
          options.onMenuAction(String(item.action || ""), item);
          return;
        }
        if (item.action === "public_login") options.openAuthModal?.("login");
        if (item.action === "public_signup") options.openAuthModal?.("signup");
      });
      accountMenu.appendChild(menuItem);
    });

    account.addEventListener("click", (event) => {
      event.stopPropagation();
      const open = accountMenu.hidden;
      accountMenu.hidden = !open;
      account.classList.toggle("is-open", open);
      account.setAttribute("aria-expanded", open ? "true" : "false");
    });
    const handleDocumentClick = (event) => {
      if (!widget.contains(event.target)) {
        accountMenu.hidden = true;
        account.classList.remove("is-open");
        account.setAttribute("aria-expanded", "false");
      }
    };
    document.addEventListener("click", handleDocumentClick);
    registerStandaloneProfileCleanup(() => {
      document.removeEventListener("click", handleDocumentClick);
    });

    widget.append(account, accountMenu);
    return widget;
  }

  function buildStandaloneProfileHeader(profile, authState, options = {}) {
    const header = create("header", "profile-overlay-header");
    const left = create("a", "profile-overlay-brand");
    left.href = "/community/";
    left.setAttribute("aria-label", "Community home");
    const logo = create("img", "profile-overlay-brand-logo");
    logo.src = "/assets/logos/ssnewcon.webp";
    logo.alt = "";
    logo.loading = "eager";
    logo.decoding = "async";
    const brandText = create("span", "profile-overlay-brand-text");
    brandText.append(
      create("span", "profile-overlay-brand-text-default", "StreamSuites™"),
      create("span", "profile-overlay-brand-text-hover", "COMMUNITY HOME")
    );
    left.append(
      logo,
      brandText
    );

    const right = create("div", "profile-overlay-actions");
    const socialRail = buildProfileHeaderSocialRail(profile?.socialLinks);
    if (socialRail) right.appendChild(socialRail);
    right.appendChild(
      buildProfileHeaderAccountWidget(authState, {
        openAuthModal: options.openAuthModal,
        onMenuAction: options.onMenuAction
      })
    );

    header.append(left, right);
    return header;
  }

  function buildStandaloneRoleChips(profile) {
    const row = create("div", "profile-hero-role-chips");
    const typeChip = resolveProfileTypeDescriptor(profile);
    row.appendChild(create("span", `profile-hero-role-chip profile-hero-role-chip--${typeChip.key}`, typeChip.label));
    row.hidden = row.childElementCount === 0;
    return row;
  }

  function buildStandaloneProfileHero(profile, authState, options = {}) {
    const hero = create("section", "profile-cinematic-hero");
    const coverUrl = String(profile?.bannerImageUrl || profile?.coverImageUrl || DEFAULT_PROFILE_COVER).trim() || DEFAULT_PROFILE_COVER;
    hero.style.setProperty("--profile-cover-image", `url("${coverUrl.replace(/"/g, "%22")}")`);

    hero.appendChild(buildStandaloneProfileHeader(profile, authState, options));
    hero.append(create("div", "profile-hero-cover", ""), create("div", "profile-hero-vignette", ""));

    const content = create("div", "profile-hero-content");
    const avatar = buildAvatar(profile);
    avatar.classList.add("profile-hero-avatar");

    const identity = create("div", "profile-hero-identity");
    const name = create("h1", "profile-hero-name", profile?.displayName || "Public User");
    const handleText = getCanonicalProfileSlug(profile, "");
    const handle = create("p", "profile-hero-handle", handleText ? `@${handleText}` : "@public-user");
    const badgeRow = buildBadgeSuffix(profile, { includeRoleChip: false });
    badgeRow.classList.add("profile-hero-badges");
    badgeRow.hidden = badgeRow.childElementCount === 0;
    identity.append(name, handle);
    if (!badgeRow.hidden) identity.appendChild(badgeRow);

    const bioText = String(profile?.bio || "").trim();
    if (bioText) {
      const bioWrap = create("div", "profile-hero-bio-wrap");
      const bio = create("p", "profile-hero-bio", bioText);
      const toggle = create("button", "profile-hero-bio-toggle", "Show more");
      toggle.type = "button";
      toggle.setAttribute("aria-expanded", "false");
      toggle.hidden = true;
      toggle.addEventListener("click", () => {
        const expanded = !bioWrap.classList.contains("is-expanded");
        bioWrap.classList.toggle("is-expanded", expanded);
        toggle.textContent = expanded ? "Show less" : "Show more";
        toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
      });
      bioWrap.append(bio, toggle);
      identity.appendChild(bioWrap);
      window.requestAnimationFrame(() => {
        const isOverflowing = bio.scrollHeight > bio.clientHeight + 2;
        toggle.hidden = !isOverflowing;
      });
    }

    const chips = buildStandaloneRoleChips(profile);
    if (!chips.hidden) identity.appendChild(chips);
    content.append(avatar, identity);
    hero.appendChild(content);
    return hero;
  }

  function buildStandaloneProfileOwnerTools(profile, canEdit) {
    if (!canEdit) return null;
    const tools = create("section", "profile-utility-section profile-owner-tools");
    const header = create("div", "profile-inline-header");
    header.appendChild(create("h3", "", "Owner controls"));
    const settings = create("a", "edit-affordance", "Edit links");
    settings.href = "/community/settings.html";
    header.appendChild(settings);

    const bioHeader = create("div", "profile-inline-header");
    bioHeader.appendChild(create("h3", "", "Bio editor"));
    const editBioBtn = create("button", "edit-affordance edit-button-inline", "Edit");
    editBioBtn.type = "button";
    editBioBtn.prepend(createIcon(UI_ICON_MAP.edit, "inline-icon-mask"));
    bioHeader.appendChild(editBioBtn);

    const bioEditor = create("div", "profile-bio-editor");
    bioEditor.hidden = true;
    const bioInput = create("textarea");
    bioInput.value = profile.bio || "";
    bioInput.rows = 4;
    const bioSave = create("button", "filter-chip active", "Save");
    bioSave.type = "button";
    const bioCancel = create("button", "filter-chip", "Cancel");
    bioCancel.type = "button";
    const bioStatus = create("span", "muted");
    const bioActions = create("div", "profile-bio-actions");
    bioActions.append(bioSave, bioCancel, bioStatus);
    bioEditor.append(bioInput, bioActions);

    editBioBtn.addEventListener("click", () => {
      bioEditor.hidden = false;
      bioInput.focus();
      bioInput.select();
    });
    bioCancel.addEventListener("click", () => {
      bioEditor.hidden = true;
      bioInput.value = profile.bio || "";
      bioStatus.textContent = "";
    });
    bioSave.addEventListener("click", async () => {
      bioStatus.textContent = "Saving...";
      bioSave.disabled = true;
      try {
        const updated = await saveMyPublicProfile({ bio: bioInput.value.trim() });
        profile.bio = String(updated?.bio || bioInput.value || "").trim();
        bioStatus.textContent = "Saved";
      } catch (error) {
        bioStatus.textContent = error instanceof Error ? error.message : "Save failed";
      } finally {
        bioSave.disabled = false;
      }
    });

    const privacyWrap = create("label", "profile-visibility-toggle");
    const toggle = create("input");
    toggle.type = "checkbox";
    toggle.checked = profile.isAnonymous === true;
    const text = create("span", "", "Anonymous / Private profile");
    const status = create("span", "muted");
    privacyWrap.append(toggle, text, status);
    toggle.addEventListener("change", async () => {
      status.textContent = "Saving...";
      toggle.disabled = true;
      try {
        const updated = await saveMyPublicProfile({ anonymous: toggle.checked });
        profile.isAnonymous = updated?.is_anonymous === true || updated?.anonymous === true;
        toggle.checked = profile.isAnonymous;
        status.textContent = profile.isAnonymous ? "Anonymous enabled" : "Public profile enabled";
      } catch (error) {
        toggle.checked = !toggle.checked;
        status.textContent = error instanceof Error ? error.message : "Save failed";
      } finally {
        toggle.disabled = false;
      }
    });

    tools.append(header, bioHeader, bioEditor, privacyWrap);
    return tools;
  }

  function formatProfileDate(value, helpers) {
    const raw = String(value || "").trim();
    if (!raw) return "";
    if (typeof helpers?.toTimestamp === "function") {
      const formatted = String(helpers.toTimestamp(raw) || "").trim();
      if (formatted && formatted !== "--") return formatted;
    }
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return raw;
    return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  }

  function countProfileArtifactsByType(artifacts) {
    return (Array.isArray(artifacts) ? artifacts : []).reduce((acc, item) => {
      const type = String(item?.type || "artifact").trim().toLowerCase() || "artifact";
      acc.total += 1;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, { total: 0 });
  }

  function buildProfileBadgeChip(key, options = {}) {
    const normalized = String(key || "").trim().toLowerCase() || "core";
    const label = String(options.label || toTitle(normalized) || "Badge").trim() || "Badge";
    const chip = create("span", `profile-badge-chip profile-badge-chip--${normalized}`, label.toUpperCase());
    const iconPath = String(options.icon || BADGE_ICON_MAP[normalized] || "").trim();
    if (iconPath) {
      const icon = create("img", "profile-badge-chip-icon");
      icon.src = iconPath;
      icon.alt = "";
      icon.setAttribute("aria-hidden", "true");
      chip.prepend(icon);
    }
    return getPublicBadgeUi()?.registerTarget?.(chip, label) || chip;
  }

  function buildProfileTierChip(tier) {
    const normalized = normalizeTierForUi(tier);
    return buildProfileBadgeChip(normalized, {
      label: toTitle(normalized)
    });
  }

  function buildProfileTypeChip(profile) {
    const typeChip = resolveProfileTypeDescriptor(profile);
    return buildProfileBadgeChip(typeChip.key, {
      label: typeChip.label,
      icon: typeChip.icon
    });
  }

  function buildProfileOverviewPanel(profile, artifacts, helpers) {
    const counts = countProfileArtifactsByType(artifacts);
    const section = create("section", "profile-utility-section profile-overview-panel");
    const header = create("div", "profile-inline-header");
    header.appendChild(create("h3", "", "Public overview"));

    const statGrid = create("div", "profile-overview-stat-grid");
    [
      { label: "Tier", value: buildProfileTierChip(profile?.tier || "core") },
      { label: "Artifacts", value: formatNumber(counts.total) },
      { label: "Clips", value: formatNumber(counts.clips || 0) },
      { label: "Polls", value: formatNumber(counts.polls || 0) }
    ].forEach((entry) => {
      const stat = create("div", "profile-overview-stat");
      const value = create("strong");
      if (entry.value instanceof Node) value.appendChild(entry.value);
      else value.textContent = entry.value;
      stat.append(create("span", "profile-overview-stat-label", entry.label), value);
      statGrid.appendChild(stat);
    });

    const details = create("div", "profile-overview-table");
    const addRow = (label, value, pending = false) => {
      const row = create("div", "profile-overview-row");
      if (pending) row.classList.add("is-pending");
      const valueNode = create("span", "profile-overview-value");
      if (value instanceof Node) valueNode.appendChild(value);
      else valueNode.textContent = String(value || "");
      row.append(create("span", "profile-overview-label", label), valueNode);
      details.appendChild(row);
    };

    addRow("Joined", formatProfileDate(profile?.joinedAt || profile?.createdAt, helpers) || "Pending public data", !profile?.joinedAt && !profile?.createdAt);
    addRow("Profile type", buildProfileTypeChip(profile));
    addRow("XP", "Pending", true);
    addRow("Rank", "Pending", true);

    section.append(header, statGrid, details);
    return section;
  }

  function buildLatestStreamSection(profile, helpers) {
    const stream = profile?.latestStream || null;
    const alternateSources = Array.isArray(stream?.alternateSources) ? stream.alternateSources : [];
    const hasUsableStream = Boolean(
      stream &&
      (
        stream.isLive ||
        stream.title ||
        stream.thumbnailUrl ||
        stream.url ||
        stream.sourceUrl
      )
    );
    const details = create("details", "profile-authority-collapsible profile-stream-collapsible");
    details.open = hasUsableStream;
    const summary = create("summary", "profile-authority-summary profile-stream-summary");
    const action = create("span", "profile-authority-summary-action profile-stream-summary-action");
    action.append(
      createIcon("/assets/icons/ui/visible.svg", "profile-authority-summary-action-icon"),
      create("span", "", "LATEST STREAM")
    );
    const meta = create("span", "profile-authority-summary-meta");
    [
      hasUsableStream ? stream?.platformLabel : "No data available",
      hasUsableStream ? (stream?.isLive ? "Current live" : "Featured source") : "Expand for details"
    ].forEach((entry) => {
      if (entry) meta.appendChild(create("span", "", entry));
    });
    const stateIcon = createIcon(details.open ? "/assets/icons/ui/visible.svg" : "/assets/icons/ui/hidden.svg", "profile-authority-summary-icon");
    const syncStateIcon = () => {
      stateIcon.style.setProperty(
        "--icon-mask",
        details.open ? 'url("/assets/icons/ui/visible.svg")' : 'url("/assets/icons/ui/hidden.svg")'
      );
    };
    details.addEventListener("toggle", syncStateIcon);
    syncStateIcon();
    summary.append(action, meta, stateIcon);

    const panel = create("div", "profile-stream-panel");
    const card = create("article", `profile-latest-stream-card${hasUsableStream && stream?.isLive ? " is-live" : ""}${hasUsableStream ? "" : " is-empty"}`);
    const media = create("div", "profile-latest-stream-media");
    const embedUrl = hasUsableStream ? resolveLatestStreamEmbedUrl(stream) : "";
    if (embedUrl) {
      const iframe = create("iframe");
      iframe.src = embedUrl;
      iframe.title = `${stream.platformLabel} stream player`;
      iframe.loading = "lazy";
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";
      iframe.allowFullscreen = true;
      media.appendChild(iframe);
    } else if (hasUsableStream && stream?.thumbnailUrl) {
      const thumbnail = create("img");
      thumbnail.src = stream.thumbnailUrl;
      thumbnail.alt = "";
      thumbnail.loading = "lazy";
      thumbnail.decoding = "async";
      media.appendChild(thumbnail);
    } else {
      media.classList.add("is-fallback-preview");
      const placeholder = create("div", "profile-latest-stream-placeholder");
      const placeholderCard = create("div", "profile-latest-stream-placeholder-card");
      placeholderCard.append(
        createStreamPlatformIcon(hasUsableStream ? stream?.platform : "", "profile-latest-stream-placeholder-icon-image"),
        create(
          "span",
          "profile-latest-stream-placeholder-text",
          hasUsableStream ? (stream?.isLive ? "Player unavailable" : "Source preview unavailable") : "No livestream data available"
        )
      );
      placeholder.appendChild(placeholderCard);
      media.appendChild(placeholder);
    }

    const body = create("div", "profile-latest-stream-body");
    const eyebrow = create("div", "profile-latest-stream-eyebrow");
    if (hasUsableStream) {
      eyebrow.append(
        buildStreamPlatformPill(stream, stream.platformLabel),
        create("span", stream.isLive ? "profile-stream-state is-live" : "profile-stream-state", stream.isLive ? "Live now" : "Featured source")
      );
    } else {
      eyebrow.append(
        buildStreamPlatformPill(null, "Stream"),
        create("span", "profile-stream-state", "No current data")
      );
    }
    body.append(
      eyebrow,
      create("h3", "", hasUsableStream ? (stream.title || (stream.isLive ? `${stream.platformLabel} stream` : "Latest stream")) : "No livestream data available"),
      create(
        "p",
        "",
        hasUsableStream
          ? stream.isLive
            ? "This source is selected from the creator's configured platform priority."
            : "This featured stream source was selected from the supported platform priority for this public profile."
          : profile?.creatorCapable
            ? "No supported public livestream data is currently available for this creator profile. Expand this section any time to check again later."
            : "No supported public livestream data is currently available for this public profile."
      )
    );
    const facts = create("div", "profile-latest-stream-facts");
    if (hasUsableStream && stream?.viewerCount != null) facts.appendChild(create("span", "", `${formatNumber(stream.viewerCount)} watching`));
    if (hasUsableStream && stream?.gameName) facts.appendChild(create("span", "", stream.gameName));
    if (hasUsableStream && stream?.startedAt) facts.appendChild(create("span", "", `Started ${formatProfileDate(stream.startedAt, helpers) || stream.startedAt}`));
    if (stream?.lastCheckedAt) facts.appendChild(create("span", "", `Checked ${formatProfileDate(stream.lastCheckedAt, helpers) || stream.lastCheckedAt}`));
    if (facts.childElementCount) body.appendChild(facts);
    const streamUrl = hasUsableStream ? (stream.url || stream.sourceUrl) : "";
    if (streamUrl) {
      const link = create("a", "profile-latest-stream-link", stream.isLive ? "Watch on platform" : "Open source");
      link.href = streamUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.prepend(createStreamPlatformIcon(stream.platform, "profile-latest-stream-link-icon"));
      body.appendChild(link);
    }
    const sourceEntries = (() => {
      if (hasUsableStream) return alternateSources;
      const byPlatform = new Map(
        alternateSources
          .filter((entry) => entry?.platform)
          .map((entry) => [entry.platform, entry])
      );
      if (!profile?.creatorCapable && !byPlatform.size) return [];
      return STREAM_SOURCE_PRIORITY.map((platform) => byPlatform.get(platform) || {
        platform,
        platformLabel: STREAM_PLATFORM_LABELS[platform],
        disabled: true
      });
    })();
    if (sourceEntries.length) {
      const sourceRow = create("div", "profile-latest-stream-sources");
      sourceRow.appendChild(create("span", "profile-latest-stream-sources-label", "Other sources"));
      const sourceButtons = create("div", "profile-latest-stream-sources-list");
      sourceEntries.forEach((entry) => {
        const button = buildLatestStreamSourceButton(entry, entry.platformLabel);
        if (button) sourceButtons.appendChild(button);
      });
      if (sourceButtons.childElementCount) {
        sourceRow.appendChild(sourceButtons);
        body.appendChild(sourceRow);
      }
    }
    card.append(media, body);
    panel.appendChild(card);
    details.append(summary, panel);
    return details;
  }

  function buildProfileGameCompetitionSection() {
    const details = create("details", "profile-authority-collapsible profile-game-collapsible");
    details.open = true;
    const summary = create("summary", "profile-authority-summary profile-game-summary");
    const action = create("span", "profile-authority-summary-action profile-game-summary-action");
    action.append(
      createIcon("/assets/icons/ui/gamecontroller.svg", "profile-authority-summary-action-icon"),
      create("span", "", "GAME & COMPETITION")
    );
    const meta = create("span", "profile-authority-summary-meta");
    ["Preview only", "Future-facing"].forEach((entry) => meta.appendChild(create("span", "", entry)));
    const stateIcon = createIcon("/assets/icons/ui/visible.svg", "profile-authority-summary-icon");
    const syncStateIcon = () => {
      stateIcon.style.setProperty(
        "--icon-mask",
        details.open ? 'url("/assets/icons/ui/visible.svg")' : 'url("/assets/icons/ui/hidden.svg")'
      );
    };
    details.addEventListener("toggle", syncStateIcon);
    syncStateIcon();
    summary.append(action, meta, stateIcon);

    const panel = create("div", "profile-game-panel");
    const grid = create("div", "profile-game-grid");
    [
      { label: "Economy balance", value: "Future system", note: "No live wallet data" },
      { label: "Resource inventory", value: "Reserved", note: "Items not issued yet" },
      { label: "Competition points", value: "Pending launch", note: "No season is active" },
      { label: "Season standing", value: "Not seeded", note: "Ladders arrive later" }
    ].forEach((item) => {
      const card = create("article", "profile-game-preview-card");
      card.append(
        create("span", "profile-game-preview-label", item.label),
        create("strong", "", item.value),
        create("span", "profile-game-preview-note", item.note)
      );
      grid.appendChild(card);
    });
    panel.append(
      grid,
      create("p", "profile-game-disclaimer", "Preview-only fields. They are not hydrated from economy, inventory, or competition services yet.")
    );
    details.append(summary, panel);
    return details;
  }

  function getProfileArtifactPreviewImage(item) {
    return String(
      item?.thumbnail ||
      item?.image ||
      item?.coverImageUrl ||
      item?.presentation?.center_image_url ||
      item?.presentation?.centerImageUrl ||
      ""
    ).trim();
  }

  function buildProfileMiniArtifactCard(item, helpers) {
    const link = create("a", "profile-mini-artifact-card");
    link.href = item?.href || buildArtifactGalleryLink(item?.type || "clips");
    const preview = create("span", "profile-mini-artifact-preview");
    const previewImage = getProfileArtifactPreviewImage(item);
    if (previewImage) {
      const img = create("img");
      img.src = previewImage;
      img.alt = "";
      img.loading = "lazy";
      img.decoding = "async";
      img.addEventListener("error", () => {
        clear(preview);
        preview.appendChild(createIcon(UI_ICON_MAP.gallery, "profile-mini-artifact-icon"));
      }, { once: true });
      preview.appendChild(img);
    } else {
      preview.appendChild(createIcon(UI_ICON_MAP.gallery, "profile-mini-artifact-icon"));
    }

    const body = create("span", "profile-mini-artifact-body");
    body.append(
      create("span", "profile-mini-artifact-type", toTitle(item?.type || item?.artifactType || "Artifact")),
      create("span", "profile-mini-artifact-title", buildCardTitle(item || {})),
      create(
        "span",
        "profile-mini-artifact-meta",
        `${item?.status || "Public"}${item?.updatedAt || item?.createdAt ? ` | ${formatProfileDate(item.updatedAt || item.createdAt, helpers)}` : ""}`
      )
    );
    link.append(preview, body);
    return link;
  }

  function buildProfileMiniArtifactGallery(artifacts, ownerMode, helpers) {
    const section = create("section", "profile-utility-section profile-mini-artifacts");
    const header = create("div", "profile-inline-header");
    header.appendChild(create("h3", "", "Artifact showcase"));
    if (Array.isArray(artifacts) && artifacts.length) {
      const count = create("span", "profile-section-count", `${formatNumber(artifacts.length)} public`);
      header.appendChild(count);
    }
    section.appendChild(header);

    if (!Array.isArray(artifacts) || !artifacts.length) {
      section.appendChild(create("div", "profile-empty-state", "No public artifacts are linked to this profile yet."));
      return section;
    }

    const gallery = create("div", "profile-mini-artifact-grid");
    artifacts.slice(0, 6).forEach((item) => {
      const wrap = create("article", "profile-mini-artifact-item");
      wrap.appendChild(buildProfileMiniArtifactCard(item, helpers));
      if (ownerMode) {
        const edit = create("a", "edit-affordance artifact-edit-affordance", "Edit");
        edit.href = item.href;
        wrap.appendChild(edit);
      }
      gallery.appendChild(wrap);
    });
    section.appendChild(gallery);
    return section;
  }

  function buildCollapsedAuthorityRequestPanel(context, options = {}) {
    const authorityContext = createAuthorityContext(context);
    const details = create("details", "profile-authority-collapsible");
    const summary = create("summary", "profile-authority-summary");
    const action = create("span", "profile-authority-summary-action");
    action.append(
      createIcon("/assets/icons/ui/shieldtick.svg", "profile-authority-summary-action-icon"),
      create("span", "", "PUBLIC AUTHORITY")
    );
    const meta = create("span", "profile-authority-summary-meta");
    [
      authorityContext?.targetIdentityCode ? "Identity target" : "Target pending",
      options.authState?.authenticated ? "Signed in" : "Sign in required"
    ].forEach((entry) => meta.appendChild(create("span", "", entry)));
    const stateIcon = createIcon("/assets/icons/ui/hidden.svg", "profile-authority-summary-icon");
    const syncStateIcon = () => {
      stateIcon.style.setProperty(
        "--icon-mask",
        details.open ? 'url("/assets/icons/ui/visible.svg")' : 'url("/assets/icons/ui/hidden.svg")'
      );
    };
    details.addEventListener("toggle", syncStateIcon);
    syncStateIcon();
    summary.append(action, meta, stateIcon);

    const panel = buildAuthorityRequestPanel(context, options);
    panel.classList.add("profile-authority-expanded-panel");
    details.append(summary, panel);
    return details;
  }

  function renderStandaloneProfileUtilityBody(profileCard, profile, canEdit, options = {}) {
    clear(profileCard);
    const profileArtifacts = Array.isArray(options.profileArtifacts) ? options.profileArtifacts : [];
    profileCard.appendChild(buildLatestStreamSection(profile, options.helpers || null));

    const primaryGrid = create("div", "profile-body-grid");
    primaryGrid.append(
      buildProfileOverviewPanel(profile, profileArtifacts, options.helpers || null),
      buildProfileMiniArtifactGallery(profileArtifacts, canEdit, options.helpers || null)
    );
    profileCard.appendChild(primaryGrid);
    profileCard.appendChild(buildProfileGameCompetitionSection());

    const grid = create("div", "profile-utility-grid profile-utility-grid--slim");
    const shareSection = create("section", "profile-utility-section");
    const shareHeader = create("div", "profile-inline-header");
    const shareTitle = create("h3", "", "Share Links");
    shareHeader.appendChild(shareTitle);
    shareSection.append(shareHeader, buildProfileShareSection(profile, { compact: true }));

    grid.appendChild(shareSection);
    profileCard.appendChild(grid);

    profileCard.appendChild(
      buildCollapsedAuthorityRequestPanel(resolveProfileAuthorityContext(profile), {
        authState: options.authState || null,
        openAuthModal: options.openAuthModal || null
      })
    );

    const ownerTools = buildStandaloneProfileOwnerTools(profile, canEdit);
    if (ownerTools) profileCard.appendChild(ownerTools);
  }

  function renderStandaloneProfilePage(host, profile, canEdit, options = {}) {
    cleanupStandaloneProfileInteractions();
    clear(host);
    const shell = create("div", "standalone-profile-shell");
    shell.appendChild(buildStandaloneProfileHero(profile, options.authState || null, options));
    shell.appendChild(create("div", "profile-hero-trim"));

    const body = create("section", "public-standalone-main profile-standalone-body");
    const profileCard = create("div", "profile-utility-panel");
    body.appendChild(profileCard);
    shell.appendChild(body);
    host.appendChild(shell);

    renderStandaloneProfileUtilityBody(profileCard, profile, canEdit, options);
  }

  function renderStandaloneProfileMessage(host, options = {}) {
    const title = String(options.title || "Profile").trim();
    const subtitle = String(options.subtitle || "").trim();
    const profile = {
      displayName: title,
      publicSlug: "",
      userCode: "",
      role: "viewer",
      tier: "core",
      bio: subtitle,
      socialLinks: {},
      coverImageUrl: DEFAULT_PROFILE_COVER,
      bannerImageUrl: DEFAULT_PROFILE_COVER,
      badges: []
    };
    cleanupStandaloneProfileInteractions();
    clear(host);
    const shell = create("div", "standalone-profile-shell standalone-profile-shell--message");
    shell.appendChild(buildStandaloneProfileHero(profile, options.authState || null, options));
    const body = create("section", "public-standalone-main profile-standalone-body");
    const card = create("article", "profile-card profile-card-expanded profile-card-standalone profile-message-panel");
    card.append(
      create("div", "empty-state", title),
      create("p", "profile-unavailable-copy", subtitle)
    );
    body.appendChild(card);
    shell.appendChild(body);
    host.appendChild(shell);
  }

  function renderProfileArtifactRows(host, artifacts, ownerMode) {
    clear(host);
    const list = create("div", "profile-artifact-list");
    artifacts.slice(0, 20).forEach((item) => {
      const row = create("article", "profile-artifact-row");
      const heading = create("a", "profile-artifact-title", buildCardTitle(item));
      heading.href = item.href;
      const meta = create("div", "profile-artifact-meta", `${toTitle(item.type)} | ${item.status || "Pending"}`);
      const actions = create("div", "profile-artifact-actions");
      const openLink = create("a", "see-all", "Open");
      openLink.href = item.href;
      actions.appendChild(openLink);
      if (ownerMode) {
        const editLink = create("a", "edit-affordance", "Edit");
        editLink.href = item.href;
        actions.appendChild(editLink);
      }
      row.append(heading, meta, actions);
      list.appendChild(row);
    });
    host.appendChild(list);
  }

  function renderProfileArtifactGrid(host, artifacts, ownerMode) {
    clear(host);
    const grid = create("div", "media-grid");
    artifacts.slice(0, 12).forEach((item) => {
      const wrap = create("article", "profile-artifact-item");
      wrap.appendChild(buildMediaCard(item, { showSnippet: true, enableProfileHover: false }));
      if (ownerMode) {
        const edit = create("a", "edit-affordance artifact-edit-affordance", "Edit");
        edit.href = item.href;
        wrap.appendChild(edit);
      }
      grid.appendChild(wrap);
    });
    host.appendChild(grid);
  }

  function renderProfileBody(profileCard, profile, canEdit, options = {}) {
    clear(profileCard);
    const coverWrap = create("div", "profile-cover");
    const coverImage = create("img");
    coverImage.src = profile.bannerImageUrl || profile.coverImageUrl || DEFAULT_PROFILE_COVER;
    coverImage.alt = `${profile.displayName} cover`;
    coverWrap.appendChild(coverImage);
    profileCard.appendChild(coverWrap);

    const profileMeta = buildCreatorMeta(profile, { expanded: true, includeRoleChip: true, enableHover: false });
    profileCard.appendChild(profileMeta);
    const liveBanner = buildProfileLiveBanner(profile);
    if (liveBanner) profileCard.appendChild(liveBanner);

    const socialHeader = create("div", "profile-inline-header");
    socialHeader.append(create("h3", "", "Social Links"));
    if (canEdit) {
      const editSocial = create("a", "edit-affordance", "Edit");
      editSocial.href = "/community/settings.html";
      socialHeader.appendChild(editSocial);
    }
    profileCard.append(socialHeader, buildSocialLinksRow(profile.socialLinks));

    const bioHeader = create("div", "profile-inline-header");
    bioHeader.append(create("h3", "", "Bio"));
    const bioBody = create("p", "profile-bio-text", profile.bio || "No bio provided yet.");
    profileCard.append(bioHeader, bioBody);

    if (canEdit) {
      const editBioBtn = create("button", "edit-affordance edit-button-inline", "Edit");
      editBioBtn.type = "button";
      editBioBtn.prepend(createIcon(UI_ICON_MAP.edit, "inline-icon-mask"));
      bioHeader.appendChild(editBioBtn);

      const bioEditor = create("div", "profile-bio-editor");
      bioEditor.hidden = true;
      const bioInput = create("textarea");
      bioInput.value = profile.bio || "";
      bioInput.rows = 4;
      const bioSave = create("button", "filter-chip active", "Save");
      bioSave.type = "button";
      const bioCancel = create("button", "filter-chip", "Cancel");
      bioCancel.type = "button";
      const bioStatus = create("span", "muted");
      const bioActions = create("div", "profile-bio-actions");
      bioActions.append(bioSave, bioCancel, bioStatus);
      bioEditor.append(bioInput, bioActions);
      profileCard.appendChild(bioEditor);

      editBioBtn.addEventListener("click", () => {
        bioEditor.hidden = false;
        bioInput.focus();
        bioInput.select();
      });
      bioCancel.addEventListener("click", () => {
        bioEditor.hidden = true;
        bioInput.value = profile.bio || "";
        bioStatus.textContent = "";
      });
      bioSave.addEventListener("click", async () => {
        bioStatus.textContent = "Saving…";
        bioSave.disabled = true;
        try {
          const updated = await saveMyPublicProfile({ bio: bioInput.value.trim() });
          profile.bio = String(updated?.bio || bioInput.value || "").trim();
          bioBody.textContent = profile.bio || "No bio provided yet.";
          bioStatus.textContent = "Saved";
          window.setTimeout(() => {
            bioEditor.hidden = true;
            bioStatus.textContent = "";
          }, 700);
        } catch (error) {
          bioStatus.textContent = error instanceof Error ? error.message : "Save failed";
        } finally {
          bioSave.disabled = false;
        }
      });
    }

    const shareHeader = create("div", "profile-inline-header");
    const shareTitle = create("h3", "", "Share Links");
    shareTitle.prepend(createIcon(UI_ICON_MAP.share, "inline-icon-mask"));
    shareHeader.appendChild(shareTitle);
    profileCard.append(shareHeader, buildProfileShareSection(profile));
    profileCard.appendChild(
      buildAuthorityRequestPanel(resolveProfileAuthorityContext(profile), {
        authState: options.authState || null,
        openAuthModal: options.openAuthModal || null
      })
    );

    if (canEdit) {
      const privacyWrap = create("label", "profile-visibility-toggle");
      const toggle = create("input");
      toggle.type = "checkbox";
      toggle.checked = profile.isAnonymous === true;
      const text = create("span", "", "Anonymous / Private profile");
      const status = create("span", "muted");
      privacyWrap.append(toggle, text, status);
      profileCard.appendChild(privacyWrap);
      toggle.addEventListener("change", async () => {
        status.textContent = "Saving…";
        toggle.disabled = true;
        try {
          const updated = await saveMyPublicProfile({ anonymous: toggle.checked });
          profile.isAnonymous = updated?.is_anonymous === true || updated?.anonymous === true;
          toggle.checked = profile.isAnonymous;
          status.textContent = profile.isAnonymous ? "Anonymous enabled" : "Public profile enabled";
        } catch (error) {
          toggle.checked = !toggle.checked;
          status.textContent = error instanceof Error ? error.message : "Save failed";
        } finally {
          toggle.disabled = false;
        }
      });
    }
  }

  function renderCommunityProfile(ctx) {
    const { host, data, authState } = ctx;
    clear(host);
    host.appendChild(buildPageHeading("Profile", "Loading public profile…"));

    const profileCode = resolveCommunityProfileCode(data);
    const fallbackProfile = resolveLocalProfile(data, profileCode);
    const hero = create("section", "detail-layout is-stacked profile-layout");
    const left = create("article", "detail-main");
    const right = create("aside", "detail-side");
    const profileCard = create("article", "profile-card profile-card-expanded");
    left.appendChild(profileCard);

    const artifactSection = create("section", "section profile-artifacts-section");
    const artifactHeading = create("div", "section-heading");
    artifactHeading.append(create("h2", "", "Recent Artifacts"));
    const artifactHost = create("div", "profile-artifacts-host");
    artifactSection.append(artifactHeading, artifactHost);
    right.appendChild(artifactSection);

    hero.append(left, right);
    host.appendChild(hero);

    let profileArtifacts = collectProfileArtifacts(
      data,
      profileCode,
      fallbackProfile?.publicSlug,
      fallbackProfile?.id,
      fallbackProfile?.userCode
    );
    let ownerCanEdit = false;
    let currentArtifactMode = readProfileArtifactLayoutPreference();
    const artifactToggle = buildProfileArtifactsToggle(currentArtifactMode, (mode) => {
      currentArtifactMode = mode;
      if (mode === "list") {
        renderProfileArtifactRows(artifactHost, profileArtifacts, ownerCanEdit);
      } else {
        renderProfileArtifactGrid(artifactHost, profileArtifacts, ownerCanEdit);
      }
    });
    artifactHeading.appendChild(artifactToggle.wrap);
    artifactToggle.setMode(currentArtifactMode, false);

    (async () => {
      let profile = normalizeProfilePayload(fallbackProfile, fallbackProfile, profileCode);
      let canEdit = canEditResolvedProfile(authState, profile, profileCode);
      let artifactItems = collectProfileArtifacts(data, profile.publicSlug, profile.userCode, profile.id, profile.username);
      try {
        const payload = canEdit ? await fetchMyPublicProfile() : await fetchPublicProfileByIdentifier(profileCode);
        profile = normalizeProfilePayload(payload, fallbackProfile, profileCode);
        canEdit = canEditResolvedProfile(authState, profile, profileCode);
        artifactItems = collectProfileArtifacts(
          data,
          profile.publicSlug,
          profile.userCode,
          profile.id,
          fallbackProfile?.publicSlug,
          fallbackProfile?.id
        );
      } catch (_err) {
        // Keep local profile fallback when API profile endpoints are unavailable.
      }

      const nextHeading = buildPageHeading(profile.displayName, `${profile.platform} | ${roleLabel(normalizeRoleForUi(profile.role))}`);
      const existingHeading = host.querySelector(".page-heading");
      if (existingHeading && existingHeading.parentElement === host) {
        host.replaceChild(nextHeading, existingHeading);
      } else {
        host.prepend(nextHeading);
      }
      renderProfileBody(profileCard, profile, canEdit, {
        authState,
        openAuthModal: ctx.openAuthModal
      });
      ownerCanEdit = canEdit;
      profileArtifacts = artifactItems;
      if (currentArtifactMode === "list") {
        renderProfileArtifactRows(artifactHost, profileArtifacts, ownerCanEdit);
      } else {
        renderProfileArtifactGrid(artifactHost, profileArtifacts, ownerCanEdit);
      }
      if (!profileArtifacts.length) {
        artifactHost.appendChild(create("div", "empty-state", "No artifacts linked to this profile yet."));
      }
    })();
  }

  function renderStandaloneProfile(ctx) {
    const { host, data, authState } = ctx;
    clear(host);
    renderStandaloneProfileMessage(host, {
      title: "Profile",
      subtitle: "Loading public profile...",
      authState,
      openAuthModal: ctx.openAuthModal,
      onMenuAction: ctx.handleAccountMenuAction
    });

    const profileCode = resolveStandaloneProfileCode();
    const localProfile = findLocalProfile(data, profileCode);
    const fallbackProfile = localProfile || resolveLocalProfile(data, profileCode);

    (async () => {
      if (!profileCode) {
        renderProfileNotFound(host, "", {
          authState,
          openAuthModal: ctx.openAuthModal,
          onMenuAction: ctx.handleAccountMenuAction
        });
        return;
      }

      let profile = localProfile ? normalizeProfilePayload(localProfile, localProfile, profileCode) : null;
      let canEdit = canEditResolvedProfile(authState, profile, profileCode);
      try {
        const payload = canEdit ? await fetchMyPublicProfile() : await fetchPublicProfileByIdentifier(profileCode);
        profile = normalizeProfilePayload(payload, fallbackProfile, profileCode);
        canEdit = canEditResolvedProfile(authState, profile, profileCode);
      } catch (error) {
        if (!profile) {
          renderProfileNotFound(host, profileCode, {
            authState,
            openAuthModal: ctx.openAuthModal,
            onMenuAction: ctx.handleAccountMenuAction
          });
          return;
        }
        if (!canEdit && error?.status === 404) {
          if (!isProfileVisibleOnStreamSuites(profile)) {
            renderProfileUnavailable(host, profile, profileCode, {
              authState,
              openAuthModal: ctx.openAuthModal,
              onMenuAction: ctx.handleAccountMenuAction
            });
          } else {
            renderProfileNotFound(host, profileCode, {
              authState,
              openAuthModal: ctx.openAuthModal,
              onMenuAction: ctx.handleAccountMenuAction
            });
          }
          return;
        }
        // Keep local profile fallback when API profile endpoints are unavailable.
      }

      if (!profile) {
        renderProfileNotFound(host, profileCode, {
          authState,
          openAuthModal: ctx.openAuthModal,
          onMenuAction: ctx.handleAccountMenuAction
        });
        return;
      }

      if (!canEdit && !isProfileVisibleOnStreamSuites(profile)) {
        renderProfileUnavailable(host, profile, profileCode, {
          authState,
          openAuthModal: ctx.openAuthModal,
          onMenuAction: ctx.handleAccountMenuAction
        });
        return;
      }

      syncStandaloneProfileCanonicalUrl(profile, profileCode);
      document.title = `${profile.displayName} | StreamSuites Public Profile`;
      const profileArtifacts = collectProfileArtifacts(
        data,
        profile.publicSlug,
        profile.userCode,
        profile.id,
        profile.username,
        fallbackProfile?.publicSlug,
        fallbackProfile?.id,
        fallbackProfile?.userCode
      );
      renderStandaloneProfilePage(host, profile, canEdit, {
        authState,
        openAuthModal: ctx.openAuthModal,
        onMenuAction: ctx.handleAccountMenuAction,
        profileArtifacts,
        helpers: data.helpers
      });
    })();
  }

  function renderCommunitySettings(ctx) {
    const { host, authState } = ctx;
    clear(host);
    host.appendChild(
      buildDashboardHero({
        eyebrow: "Account workspace",
        title: "Settings",
        body: "Viewer/public settings now sit inside the same dashboard system as media and community. Writable fields remain limited to the existing authoritative public-profile endpoint, and future controls stay clearly marked as inactive.",
        tone: "preview",
        actions: [
          { label: "Open my data", href: "/community/my-data.html", emphasis: "strong" },
          { label: "Back to community", href: "/community" }
        ],
        stats: [
          { label: "Writable today", value: "Profile", note: "Existing public profile endpoint" },
          { label: "Future controls", value: "Planned", note: "Notifications, exports, privacy expansions" }
        ]
      })
    );

    if (!authState?.authenticated) {
      host.appendChild(create("div", "empty-state", "Log in to access Public Account Settings."));
      return;
    }

    const accountType = String(authState.accountType || "").toUpperCase();
    if (accountType !== "VIEWER") {
      host.appendChild(create("div", "empty-state", "This settings view is available for Viewer/Public accounts only."));
      return;
    }

    host.appendChild(
      buildDashboardGrid([
        buildDashboardCard({
          title: "Authoritative settings scope",
          kicker: "Grounded behavior",
          badge: "Active",
          state: "active",
          body: "Only fields already supported by the current public profile API are writable here. This milestone does not invent extra mutation paths for alerts, approvals, or creator-only workflows.",
          meta: ["Public profile visibility", "Directory listing", "Cover/background URLs", "Bio + supported social links"]
        }),
        buildDashboardCard({
          title: "Future account controls",
          kicker: "Not active yet",
          badge: "Planned",
          state: "planned",
          body: "Notification settings, export controls, member-level privacy presets, and deeper dashboard preferences are intentionally deferred until their backend paths exist.",
          meta: ["No notification center", "No export controls here yet", "No backend-side preference bundle"]
        }),
        buildActionScaffoldCard({
          title: "Profile correction / removal requests",
          body: "This shared CTA treatment prepares the public account surface for future profile correction and removal workflows without pretending those backend reviews exist yet."
        })
      ],
      "dashboard-card-grid--three"
      )
    );

    const panel = create("section", "profile-card settings-form");
    const status = create("div", "muted settings-status");
    status.textContent = "Loading authoritative profile settings…";
    const form = create("form", "settings-grid viewer-settings-grid");
    form.addEventListener("submit", (event) => event.preventDefault());

    const topGrid = create("div", "viewer-settings-top-grid");
    const identityCard = create("section", "settings-card");
    const identityHeader = create("div", "settings-card-header");
    identityHeader.append(
      create("h2", "settings-card-title", "Profile identity"),
      create("p", "settings-card-copy", "Authoritative identity values shown here come from the account payload. Slug, display name, and avatar are visible on the public surface, but are not writable through the current public profile save endpoint.")
    );
    const identityBody = create("div", "settings-card-body");
    const identityHero = create("div", "viewer-settings-identity");
    const avatarPreview = create("span", "viewer-settings-avatar");
    const identityFields = create("div", "viewer-settings-identity-fields");

    const displayNameField = create("label", "settings-field");
    const displayNameTitle = create("span", "settings-label", "Display name");
    const displayNameInput = create("input");
    displayNameInput.type = "text";
    displayNameInput.name = "display_name";
    displayNameInput.readOnly = true;
    displayNameField.append(displayNameTitle, displayNameInput, create("span", "settings-help", "Displayed from the authoritative account identity. Public-side editing is not yet exposed."));

    const avatarUrlField = create("label", "settings-field");
    const avatarUrlTitle = create("span", "settings-label", "Avatar URL");
    const avatarUrlInput = create("input");
    avatarUrlInput.type = "text";
    avatarUrlInput.name = "avatar_url";
    avatarUrlInput.readOnly = true;
    avatarUrlField.append(avatarUrlTitle, avatarUrlInput, create("span", "settings-help", "Avatar is currently sourced from the authoritative account payload. URL-based profile avatar editing is not exposed on this endpoint yet."));

    const slugField = create("label", "settings-field");
    const slugTitle = create("span", "settings-label", "Canonical public slug");
    const slugInput = create("input");
    slugInput.type = "text";
    slugInput.name = "public_slug";
    slugInput.readOnly = true;
    const slugAliases = create("span", "settings-help");
    slugField.append(slugTitle, slugInput, create("span", "settings-help", "Slug assignment exists in the authoritative backend, but this public settings surface currently receives it as read-only."), slugAliases);

    identityFields.append(displayNameField, avatarUrlField, slugField);
    identityHero.append(avatarPreview, identityFields);
    identityBody.appendChild(identityHero);
    identityCard.append(identityHeader, identityBody);

    const shareCard = create("section", "settings-card");
    const shareHeader = create("div", "settings-card-header");
    shareHeader.append(
      create("h2", "settings-card-title", "Share preview"),
      create("p", "settings-card-copy", "This is the canonical StreamSuites public URL generated from the authoritative profile model.")
    );
    const shareBody = create("div", "settings-card-body");
    const sharePreview = create("code", "settings-share-preview");
    const shareActions = create("div", "settings-share-actions");
    const shareCopy = create("button", "filter-chip settings-share-copy", "Copy URL");
    shareCopy.type = "button";
    const sharePublicStatus = create("div", "settings-inline-note");
    shareCopy.addEventListener("click", () => {
      const url = String(sharePreview.textContent || "").trim();
      if (!url || shareCopy.disabled) return;
      copyTextToClipboard(url).then((copied) => {
        shareCopy.textContent = copied ? "Copied" : "Copy URL";
        window.setTimeout(() => {
          shareCopy.textContent = "Copy URL";
        }, 1200);
      });
    });
    shareActions.append(sharePreview, shareCopy);
    shareBody.append(shareActions, sharePublicStatus);
    shareCard.append(shareHeader, shareBody);
    topGrid.append(identityCard, shareCard);

    const streamsuitesCard = create("section", "settings-card");
    const streamsuitesHeader = create("div", "settings-card-header");
    streamsuitesHeader.append(
      create("h2", "settings-card-title", "StreamSuites public profile"),
      create("p", "settings-card-copy", "Viewer/public accounts are eligible for the StreamSuites profile only. These controls save through the authoritative `/api/public/profile/me` path.")
    );
    const streamsuitesBody = create("div", "settings-card-body");

    const streamSuitesField = create("label", "settings-toggle-row");
    const streamSuitesMeta = create("span", "settings-toggle-meta");
    streamSuitesMeta.append(
      create("span", "settings-label", "Public profile visibility"),
      create("span", "settings-help", "Hide or show your canonical StreamSuites profile without affecting account access.")
    );
    const streamSuitesToggle = create("input");
    streamSuitesToggle.type = "checkbox";
    streamSuitesToggle.name = "streamsuites_profile_enabled";
    streamSuitesField.append(streamSuitesMeta, streamSuitesToggle);
    const streamSuitesStatus = create("div", "settings-inline-note");

    const listingField = create("label", "settings-toggle-row");
    const listingMeta = create("span", "settings-toggle-meta");
    listingMeta.append(
      create("span", "settings-label", "Community directory listing"),
      create("span", "settings-help", "Show this profile in the public members directory when the StreamSuites profile is visible.")
    );
    const listingToggle = create("input");
    listingToggle.type = "checkbox";
    listingToggle.name = "listed";
    listingField.append(listingMeta, listingToggle);

    const anonymousField = create("label", "settings-toggle-row");
    const anonymousMeta = create("span", "settings-toggle-meta");
    anonymousMeta.append(
      create("span", "settings-label", "Anonymous mode"),
      create("span", "settings-help", "Hide your real identity on the public profile while retaining the profile shell.")
    );
    const anonymousToggle = create("input");
    anonymousToggle.type = "checkbox";
    anonymousToggle.name = "anonymous";
    anonymousField.append(anonymousMeta, anonymousToggle);

    const coverField = create("label", "settings-field");
    const coverTitle = create("span", "settings-label", "Cover or banner image URL");
    const coverInput = create("input");
    coverInput.type = "url";
    coverInput.name = "cover_image_url";
    coverInput.dataset.label = "Cover or banner image URL";
    coverInput.placeholder = DEFAULT_PROFILE_COVER;
    coverField.append(coverTitle, coverInput, create("span", "settings-help", "The current backend stores cover and banner from the same authoritative `cover_image_url` value."));

    const backgroundField = create("label", "settings-field");
    const backgroundTitle = create("span", "settings-label", "Background image URL");
    const backgroundInput = create("input");
    backgroundInput.type = "url";
    backgroundInput.name = "background_image_url";
    backgroundInput.dataset.label = "Background image URL";
    backgroundInput.placeholder = "https://cdn.example.com/background.png";
    backgroundField.append(backgroundTitle, backgroundInput, create("span", "settings-help", "URL-based media only for now. This preserves room for future authoritative upload flows."));

    const bioField = create("label", "settings-field");
    const bioTitle = create("span", "settings-label", "Bio / about");
    const bioInput = create("textarea");
    bioInput.name = "bio";
    bioInput.rows = 5;
    bioInput.maxLength = 1200;
    bioField.append(bioTitle, bioInput, create("span", "settings-help", "Up to 1200 characters."));

    const socialField = create("div", "settings-field");
    socialField.appendChild(create("span", "settings-label", "Public links"));
    socialField.appendChild(create("span", "settings-help", "Only grounded URL fields already accepted by the backend are editable here."));
    const socialInputs = {};
    ["youtube", "rumble", "discord", "x", "tiktok", "twitch", "kick"].forEach((key) => {
      const row = create("label", "settings-social-row");
      const label = create("span", "", key.toUpperCase());
      const input = create("input");
      input.type = "url";
      input.name = `social_${key}`;
      input.dataset.label = `${key.toUpperCase()} link`;
      input.placeholder = `${key} URL`;
      socialInputs[key] = input;
      row.append(label, input);
      socialField.appendChild(row);
    });

    streamsuitesBody.append(streamSuitesField, streamSuitesStatus, listingField, anonymousField, coverField, backgroundField, bioField, socialField);
    streamsuitesCard.append(streamsuitesHeader, streamsuitesBody);

    const findMeHereCard = create("section", "settings-card settings-card-muted");
    const findMeHereHeader = create("div", "settings-card-header");
    findMeHereHeader.append(
      create("h2", "settings-card-title", "FindMeHere listing"),
      create("p", "settings-card-copy", "FindMeHere is creator-only. Viewer/public accounts should see eligibility truthfully instead of an editable toggle.")
    );
    const findMeHereBody = create("div", "settings-card-body");
    const findMeHereStatus = create("p", "settings-callout is-warning");
    const findMeHereReason = create("p", "settings-inline-note");
    const findMeHereUrl = create("code", "settings-share-preview");
    const findMeHereActions = create("div", "settings-cta-row");
    const upgradeLink = create("a", "filter-chip active settings-cta-primary", "Upgrade to Creator");
    upgradeLink.href = CREATOR_SIGNUP_URL;
    upgradeLink.target = "_blank";
    upgradeLink.rel = "noopener noreferrer";
    const creatorSiteLink = create("a", "filter-chip settings-cta-secondary", "Open Creator Surface");
    creatorSiteLink.href = CREATOR_DASHBOARD_URL;
    creatorSiteLink.target = "_blank";
    creatorSiteLink.rel = "noopener noreferrer";
    findMeHereActions.append(upgradeLink, creatorSiteLink);
    findMeHereBody.append(findMeHereStatus, findMeHereReason, findMeHereUrl, findMeHereActions);
    findMeHereCard.append(findMeHereHeader, findMeHereBody);

    const saveButton = create("button", "filter-chip active settings-save-btn", "Save profile settings");
    saveButton.type = "button";
    saveButton.addEventListener("click", async () => {
      const validationErrors = validateSettingsFormFields({
        urlInputs: [coverInput, backgroundInput, ...Object.values(socialInputs)],
        bioInput
      });
      if (validationErrors.length) {
        status.textContent = validationErrors[0];
        return;
      }

      status.textContent = "Saving authoritative profile settings…";
      saveButton.disabled = true;
      try {
        const socialPayload = normalizeProfileEditorLinks(socialInputs);
        const payload = {
          streamsuites_profile_enabled: streamSuitesToggle.checked,
          anonymous: anonymousToggle.checked,
          listed: listingToggle.checked,
          cover_image_url: String(coverInput.value || "").trim(),
          background_image_url: String(backgroundInput.value || "").trim(),
          bio: String(bioInput.value || "").trim(),
          social_links: socialPayload
        };
        const updated = await saveMyPublicProfile(payload);
        syncViewerSettingsForm(normalizeProfilePayload(updated, updated, authState?.publicSlug || authState?.userCode || "public-user"), formState);
        status.textContent = "Profile settings saved.";
      } catch (error) {
        status.textContent = error instanceof Error ? error.message : "Save failed";
      } finally {
        saveButton.disabled = false;
      }
    });

    const formActions = create("div", "settings-actions");
    formActions.append(saveButton, status);
    form.append(topGrid, streamsuitesCard, findMeHereCard, formActions);
    panel.append(form);
    host.appendChild(panel);

    const formState = {
      profile: null,
      avatarPreview,
      avatarUrlInput,
      displayNameInput,
      slugInput,
      slugAliases,
      streamSuitesToggle,
      streamSuitesStatus,
      listingToggle,
      anonymousToggle,
      coverInput,
      backgroundInput,
      bioInput,
      socialInputs,
      sharePreview,
      shareCopy,
      sharePublicStatus,
      findMeHereStatus,
      findMeHereReason,
      findMeHereUrl
    };

    (async () => {
      try {
        const payload = await fetchMyPublicProfile();
        const profile = normalizeProfilePayload(payload, payload, authState?.publicSlug || authState?.userCode || "public-user");
        syncViewerSettingsForm(profile, formState);
        status.textContent = "Authoritative profile settings loaded.";
      } catch (_err) {
        status.textContent = "Unable to load settings from the authoritative Auth API.";
      }
    })();
  }

  function readAuthenticated(payload) {
    const candidates = [
      payload?.authenticated,
      payload?.is_authenticated,
      payload?.isAuthenticated,
      payload?.data?.authenticated,
      payload?.data?.is_authenticated,
      payload?.data?.isAuthenticated
    ];
    return candidates.some((value) => value === true);
  }

  function normalizeAccountType(value) {
    const normalized = String(value || "").trim().toUpperCase();
    if (normalized === "ADMIN" || normalized === "CREATOR" || normalized === "DEVELOPER" || normalized === "VIEWER") {
      return normalized;
    }
    if (normalized === "PUBLIC" || normalized === "USER" || normalized === "MEMBER") return "VIEWER";
    return "";
  }

  function normalizeAccessContract(value) {
    return value && typeof value === "object" ? value : { allowed: false };
  }

  function resolveDisplayTier(payload) {
    return String(
      payload?.effective_tier?.display_tier_label ||
      payload?.effective_tier?.tier_label ||
      payload?.effectiveTier?.display_tier_label ||
      payload?.effectiveTier?.displayTierLabel ||
      payload?.effectiveTier?.tier_label ||
      payload?.effectiveTier?.tierLabel ||
      payload?.tier ||
      payload?.data?.tier ||
      payload?.user?.tier ||
      "core"
    ).trim();
  }

  function normalizeUserCode(value, fallback = "public-user") {
    const raw = String(value || "").trim().toLowerCase();
    const isUuidLike = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(raw);
    const normalized = raw
      .replace(/[\s-]+/g, "")
      .replace(/[^a-z0-9_]+/g, "")
      .replace(/^_+|_+$/g, "");
    if (!normalized || isUuidLike) return fallback;
    return normalized;
  }

  function normalizeSlugAliases(value) {
    const entries = Array.isArray(value) ? value : [];
    const seen = new Set();
    return entries.reduce((acc, entry) => {
      const normalized = normalizeUserCode(entry, "");
      if (!normalized || seen.has(normalized)) return acc;
      seen.add(normalized);
      acc.push(normalized);
      return acc;
    }, []);
  }

  function getCanonicalProfileSlug(profileOrCode, fallback = "public-user") {
    if (typeof profileOrCode === "string") {
      return normalizeUserCode(profileOrCode, fallback);
    }
    return normalizeUserCode(
      profileOrCode?.publicSlug || profileOrCode?.public_slug || profileOrCode?.slug || profileOrCode?.userCode || profileOrCode?.username || profileOrCode?.id,
      fallback
    );
  }

  function getLegacyProfileCode(profileOrCode, fallback = "public-user") {
    if (typeof profileOrCode === "string") {
      return normalizeUserCode(profileOrCode, fallback);
    }
    return normalizeUserCode(
      profileOrCode?.userCode || profileOrCode?.user_code || profileOrCode?.username || profileOrCode?.id || profileOrCode?.publicSlug || profileOrCode?.slug,
      fallback
    );
  }

  function collectProfileIdentifiers(profile, options = {}) {
    if (!profile || typeof profile !== "object") {
      const normalized = normalizeUserCode(profile, "");
      return normalized ? [normalized] : [];
    }

    const displayName = String(profile?.displayName || profile?.display_name || "").trim();
    const firstName = displayName.split(/\s+/)[0] || "";
    const identifiers = [
      profile?.publicSlug,
      profile?.public_slug,
      profile?.slug,
      ...(Array.isArray(profile?.slugAliases) ? profile.slugAliases : []),
      ...(Array.isArray(profile?.slug_aliases) ? profile.slug_aliases : []),
      profile?.userCode,
      profile?.user_code,
      profile?.username,
      profile?.id
    ];

    if (options.includeDisplayNames) {
      identifiers.push(displayName, firstName);
    }

    const seen = new Set();
    return identifiers.reduce((acc, entry) => {
      const normalized = normalizeUserCode(entry, "");
      if (!normalized || seen.has(normalized)) return acc;
      seen.add(normalized);
      acc.push(normalized);
      return acc;
    }, []);
  }

  function buildAccountBadges(accountType, tier) {
    const role =
      accountType === "ADMIN" ? "admin" :
      accountType === "DEVELOPER" ? "developer" :
      accountType === "CREATOR" ? "creator" :
      "viewer";
    const tierValue = normalizeTierForUi(tier);
    const badges = [];
    if (role === "admin") {
      badges.push({ key: "admin", kind: "role", value: "admin", label: "Admin" });
      return badges;
    }
    if (role === "developer") {
      badges.push({ key: "developer", kind: "role", value: "developer", label: "Developer" });
      return badges;
    }
    if (role === "creator") {
      badges.push({ key: tierValue, kind: "tier", value: tierValue, label: tierValue.toUpperCase() });
    }
    return badges;
  }

  function normalizeAuthState(payload) {
    const authenticated = readAuthenticated(payload);
    if (!authenticated) {
      return {
        authenticated: false,
        accountId: "",
        userCode: "public-user",
        publicSlug: "public-user",
        displayName: "Login",
        avatarUrl: "",
        accountType: "VIEWER",
        tier: "core",
        badges: []
      };
    }

    const accountId = String(
      payload?.account_id ||
      payload?.data?.account_id ||
      payload?.user?.internal_id ||
      payload?.user?.id ||
      ""
    ).trim();
    const displayName = String(
      payload?.display_name ||
      payload?.data?.display_name ||
      payload?.user?.display_name ||
      payload?.creator?.display_name ||
      payload?.creator?.name ||
      payload?.name ||
      "User"
    ).trim() || "User";
    const avatarUrl = String(
      payload?.avatar_url ||
      payload?.data?.avatar_url ||
      payload?.user?.avatar_url ||
      payload?.creator?.avatar_url ||
      ""
    ).trim();
    const accountType =
      normalizeAccountType(payload?.access_class) ||
      normalizeAccountType(payload?.data?.access_class) ||
      normalizeAccountType(payload?.user?.access_class) ||
      normalizeAccountType(payload?.account_type) ||
      normalizeAccountType(payload?.role) ||
      normalizeAccountType(payload?.data?.role) ||
      normalizeAccountType(payload?.user?.role) ||
      (payload?.is_admin ? "ADMIN" : payload?.is_creator ? "CREATOR" : "VIEWER");
    const tier = String(
      payload?.tier ||
      payload?.data?.tier ||
      payload?.user?.tier ||
      "core"
    ).trim().toLowerCase() || "core";
    const displayTier = resolveDisplayTier(payload) || tier;
    const userCode = normalizeUserCode(
      payload?.user_code ||
      payload?.data?.user_code ||
      payload?.user?.user_code ||
      payload?.creator?.user_code ||
      payload?.username ||
      payload?.user?.username
    );
    const publicSlug = getCanonicalProfileSlug(
      payload?.public_slug ||
      payload?.data?.public_slug ||
      payload?.user?.public_slug ||
      payload?.slug ||
      payload?.data?.slug ||
      payload?.user?.slug ||
      "",
      ""
    );

    return {
      authenticated: true,
      accountId,
      userCode,
      publicSlug,
      displayName,
      avatarUrl,
      accountType,
      accessClass: accountType,
      tier,
      displayTier,
      developerConsoleAccess: normalizeAccessContract(
        payload?.developer_console_access ||
        payload?.developerConsoleAccess ||
        payload?.data?.developer_console_access ||
        payload?.user?.developer_console_access
      ),
      adminAccess: normalizeAccessContract(
        payload?.admin_access ||
        payload?.adminAccess ||
        payload?.data?.admin_access ||
        payload?.user?.admin_access
      ),
      creatorWorkspaceAccess: normalizeAccessContract(
        payload?.creator_workspace_access ||
        payload?.creatorWorkspaceAccess ||
        payload?.data?.creator_workspace_access ||
        payload?.user?.creator_workspace_access
      ),
      creatorCapable:
        payload?.creator_workspace_access?.allowed === true ||
        payload?.creatorWorkspaceAccess?.allowed === true ||
        payload?.creator_capable === true ||
        payload?.creatorCapable === true,
      badges: normalizeAuthoritativeBadges(payload?.badges, accountType, tier)
    };
  }

  function buildAccountMenuItems(authState) {
    if (!authState?.authenticated) {
      return [
        { label: "Public Login", action: "public_login" },
        {
          label: "Creator Login",
          href: CREATOR_LOGIN_URL,
          target: "_blank",
          rel: "noopener noreferrer",
          action: "creator_login"
        },
        { label: "Sign up", action: "public_signup", subtle: true }
      ];
    }

    const items = [
      {
        label: "Profile",
        href: buildProfileHref(authState),
        action: "profile"
      }
    ];

    if (authState.accountType === "VIEWER") {
      items.push({
        label: "Account Settings",
        href: "/community/settings.html",
        action: "account_settings"
      });
    }

    if (authState.creatorWorkspaceAccess?.allowed === true || authState.creatorCapable === true) {
      items.push({ separator: true });
      items.push({
        label: "Creator Dashboard",
        href: CREATOR_DASHBOARD_URL,
        target: "_blank",
        rel: "noopener noreferrer",
        action: "creator_dashboard"
      });
    }

    if (authState.adminAccess?.allowed === true || authState.accountType === "ADMIN") {
      items.push({
        label: "Admin Dashboard",
        href: ADMIN_DASHBOARD_URL,
        target: "_blank",
        rel: "noopener noreferrer",
        action: "admin_dashboard"
      });
    }

    if (authState.developerConsoleAccess?.allowed === true) {
      items.push({
        label: "Developer Console",
        href: "https://console.streamsuites.app/dashboard/",
        target: "_blank",
        rel: "noopener noreferrer",
        action: "developer_console"
      });
    }

    items.push({ separator: true });
    items.push({ label: "Logout", action: "logout" });
    return items;
  }

  function applyAuthStateToShell(shell, authState, onMenuAction) {
    shell.updateOptions({
      accountLabel: authState?.authenticated ? authState.displayName : "Login",
      accountAvatar: authState?.authenticated ? authState.avatarUrl : "",
      accountBadges: authState?.authenticated ? authState.badges : [],
      accountAuthenticated: Boolean(authState?.authenticated),
      accountOverview: authState?.authenticated ? {
        rows: [
          { label: "Display name", value: authState.displayName },
          { label: "User code", value: authState.userCode || "Not available" },
          { label: "Account type", value: authState.accessClass || authState.accountType },
          { label: "Tier", value: authState.displayTier || authState.tier || "core" },
        ],
      } : null,
      accountMenuItems: buildAccountMenuItems(authState),
      onAccountMenuAction(action, item) {
        if (typeof onMenuAction === "function") {
          onMenuAction(String(action || ""), item || null);
        }
      }
    });
  }

  async function fetchAuthState() {
    const response = await fetch(AUTH_ME_URL, {
      method: "GET",
      cache: "no-store",
      credentials: "include",
      headers: { Accept: "application/json" }
    });
    if (!response.ok) {
      throw new Error(`auth me request failed (${response.status})`);
    }
    const payload = await response.json();
    return normalizeAuthState(payload);
  }

  function resolveConfigFromPath(pathname) {
    const normalizedPath = normalizePath(pathname);
    if (PAGE_ID_BY_PATH[normalizedPath]) {
      return PAGE_ID_BY_PATH[normalizedPath];
    }
    const artifactRoute = getArtifactRouteMatch(normalizedPath);
    if (artifactRoute) {
      return PAGE_CONFIG[artifactRoute.pageId];
    }
    if (isCanonicalProfilePath(normalizedPath)) {
      return PAGE_CONFIG["public-profile-standalone"];
    }
    if (getProfileAliasSlug(normalizedPath)) {
      return PAGE_CONFIG["public-profile-standalone"];
    }
    return null;
  }

  function canHandleUrl(url) {
    return url.origin === window.location.origin && Boolean(resolveConfigFromPath(url.pathname));
  }

  async function resolveLegacyProfileUuid(uuidValue) {
    const uuid = String(uuidValue || "").trim();
    if (!isUuidLike(uuid)) return "";
    const response = await fetch(AUTH_PUBLIC_PROFILE_RESOLVE_URL, {
      method: "POST",
      cache: "no-store",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ uuid })
    });
    if (!response.ok) return "";
    const payload = await response.json().catch(() => ({}));
    return getCanonicalProfileSlug(payload?.public_slug || payload?.slug || payload?.user_code || payload?.userCode || "", "");
  }

  function parsePageIdFromDocument(doc) {
    const fromBody = doc?.body?.dataset?.publicPage;
    if (fromBody && PAGE_CONFIG[fromBody]) return fromBody;
    return "";
  }

  function mountStandaloneRoot() {
    const root = document.querySelector("#public-app");
    if (!root) return null;
    document.body.classList.remove("public-shell-page", "modal-open");
    document.body.classList.add("public-standalone-page");
    root.classList.add("public-standalone-root");
    clear(root);
    return {
      content: root,
      setLoading() {},
      updateOptions() {},
      setQuery() {},
      setFilterState() {},
      setActiveHref() {},
      openAuthModal() {
        const loginUrl = new URL("/public-login.html", window.location.origin);
        loginUrl.searchParams.set("return_to", `${window.location.pathname}${window.location.search}${window.location.hash}`);
        window.location.assign(loginUrl.toString());
      }
    };
  }

  function init() {
    const initialAliasUrl = getCanonicalProfileAliasUrl(window.location.href);
    if (initialAliasUrl) {
      window.history.replaceState(window.history.state, "", initialAliasUrl.toString());
    }

    const initialPageId = document.body.dataset.publicPage;
    if (!initialPageId || !PAGE_CONFIG[initialPageId]) return;

    let currentPageId = initialPageId;
    let currentConfig = PAGE_CONFIG[currentPageId];
    let loadedData = null;
    let navigationToken = 0;
    let pendingLegacyProfileUuid = "";
    let wheelEventSource = null;
    let wheelRefreshPromise = null;
    let wheelRefreshQueued = false;

    if (normalizePath(window.location.pathname) === "/community/profile.html") {
      const params = new URLSearchParams(window.location.search || "");
      const legacyId = String(params.get("id") || "").trim();
      if (isUuidLike(legacyId)) {
        pendingLegacyProfileUuid = legacyId;
        window.history.replaceState(window.history.state, "", "/community/profile.html");
      }
    }

    const state = {
      query: "",
      activeFilters: [...currentConfig.defaultFilters],
      memberAlpha: "all",
      memberPage: 1
    };

    const shell = currentConfig.standalone
      ? mountStandaloneRoot()
      : window.StreamSuitesPublicShell.mount({
          shellKind: currentConfig.shellKind,
        activeHref: currentConfig.activeHref,
        topbarLabel: currentConfig.topbarLabel,
        searchPlaceholder: currentConfig.searchPlaceholder,
        showSearch: currentConfig.hideSearch !== true,
        showLockoutBanner: currentConfig.showLockoutBanner === true,
        filters: buildFiltersForConfig(currentConfig),
        defaultSidebarState: resolveDefaultSidebarState(currentConfig),
          filtersCollapsed: currentConfig.filtersCollapsed,
          multiFilter: currentConfig.filterMode === "multi",
          accountLabel: "Guest"
        });
    if (!shell) return;
    applyDocumentTitle(currentConfig.topbarLabel);

    let authState = normalizeAuthState(null);
    let authRefreshPromise = null;

    async function handleAccountMenuAction(action) {
      if (action === "public_login") {
        shell.openAuthModal?.("login");
        return;
      }
      if (action === "public_signup") {
        shell.openAuthModal?.("signup");
        return;
      }
      if (action !== "logout") return;

      try {
        await fetch(AUTH_LOGOUT_URL, {
          method: "POST",
          cache: "no-store",
          credentials: "include",
          headers: { Accept: "application/json" }
        });
      } catch (_err) {
        // Continue and refresh auth state even when logout network call fails.
      }

      await refreshAuthWidget(true);
    }

    function applyCurrentAuthState() {
      if (currentConfig.standalone) return;
      applyAuthStateToShell(shell, authState, handleAccountMenuAction);
    }

    async function refreshAuthWidget(force = false) {
      if (!force && authRefreshPromise) return authRefreshPromise;

      authRefreshPromise = (async () => {
        try {
          authState = await fetchAuthState();
        } catch (error) {
          authState = normalizeAuthState(null);
          console.warn("[StreamSuites Public] Auth API unavailable; falling back to Guest widget.");
        } finally {
          applyCurrentAuthState();
          rerender();
        }
        return authState;
      })();

      try {
        return await authRefreshPromise;
      } finally {
        authRefreshPromise = null;
      }
    }

    applyCurrentAuthState();

    window.addEventListener("message", (event) => {
      if (!event || !event.data || event.data.type !== PUBLIC_AUTH_COMPLETE_MESSAGE_TYPE) return;
      if (event.origin !== "https://streamsuites.app" && event.origin !== window.location.origin) return;
      refreshAuthWidget(true);
    });

    const rerender = () => {
      if (!loadedData) return;
      currentConfig.render(
        {
          host: shell.content,
          data: loadedData,
          state,
          authState,
          rerender,
          updateShell: typeof shell.updateOptions === "function" ? shell.updateOptions.bind(shell) : null,
          openAuthModal: typeof shell.openAuthModal === "function" ? shell.openAuthModal.bind(shell) : null,
          handleAccountMenuAction
        },
        currentConfig
      );
    };

    function shouldUseWheelLiveSync(config) {
      return Boolean(
        config?.listType === "wheels" ||
        config?.detailType === "wheels" ||
        config?.detailType === "scoreboards"
      );
    }

    function closeWheelLiveSync() {
      if (!wheelEventSource) return;
      wheelEventSource.close();
      wheelEventSource = null;
    }

    async function refreshWheelDataFromAuthority() {
      if (wheelRefreshPromise) {
        wheelRefreshQueued = true;
        return wheelRefreshPromise;
      }
      wheelRefreshPromise = (async () => {
        do {
          wheelRefreshQueued = false;
          window.StreamSuitesPublicData.invalidateCache?.();
          loadedData = await window.StreamSuitesPublicData.loadAll({ force: true });
        } while (wheelRefreshQueued);
        rerender();
        return loadedData;
      })();
      try {
        return await wheelRefreshPromise;
      } finally {
        wheelRefreshPromise = null;
      }
    }

    function syncWheelLiveSubscription() {
      if (!shouldUseWheelLiveSync(currentConfig)) {
        closeWheelLiveSync();
        return;
      }
      if (wheelEventSource) return;
      wheelEventSource = new EventSource(PUBLIC_WHEEL_EVENTS_URL, { withCredentials: true });
      wheelEventSource.addEventListener("wheel.changed", () => {
        refreshWheelDataFromAuthority().catch(() => {});
      });
      wheelEventSource.addEventListener("error", () => {
        if (wheelEventSource?.readyState === EventSource.CLOSED) {
          closeWheelLiveSync();
        }
      });
    }

    function applyConfig(nextConfig, options = {}) {
      currentConfig = nextConfig;
      currentPageId = Object.keys(PAGE_CONFIG).find((key) => PAGE_CONFIG[key] === nextConfig) || currentPageId;

      if (nextConfig.standalone) {
        document.body.classList.add("public-standalone-page");
      } else {
        document.body.classList.remove("public-standalone-page");
      }

      if (!options.keepState) {
        state.query = "";
        state.activeFilters = [...nextConfig.defaultFilters];
        state.memberAlpha = "all";
        state.memberPage = 1;
      }

      shell.updateOptions({
        shellKind: nextConfig.shellKind,
        activeHref: nextConfig.activeHref,
        topbarLabel: nextConfig.topbarLabel,
        searchPlaceholder: nextConfig.searchPlaceholder,
        showSearch: nextConfig.hideSearch !== true,
        showLockoutBanner: nextConfig.showLockoutBanner === true,
        filters: buildFiltersForConfig(nextConfig),
        defaultSidebarState: resolveDefaultSidebarState(nextConfig),
        multiFilter: nextConfig.filterMode === "multi",
        filtersCollapsed: nextConfig.filtersCollapsed,
        onSearch(query) {
          state.query = query;
          state.memberPage = 1;
          rerender();
        },
        onFilter(detail) {
          if (nextConfig.filterMode === "multi") {
            state.activeFilters = detail.activeFilters.length ? detail.activeFilters : ["clips", "polls", "wheels", "tallies"];
            rerender();
            return;
          }

          if (nextConfig.filterMode === "single-nav") {
            const target = TYPE_TO_PAGE[detail.value];
            if (target && normalizePath(target) !== normalizePath(window.location.pathname)) {
              navigateTo(new URL(target, window.location.origin), { historyMode: "push" });
              return;
            }
            state.activeFilters = [detail.value];
            rerender();
          }
        }
      });

      applyDocumentTitle(nextConfig.topbarLabel);
      shell.setQuery(state.query);
      shell.setFilterState(state.activeFilters);
      shell.setActiveHref(nextConfig.activeHref);

      syncWheelLiveSubscription();
      rerender();
    }

    async function ensureData() {
      if (loadedData) return loadedData;
      loadedData = await window.StreamSuitesPublicData.loadAll();
      return loadedData;
    }

    async function navigateTo(url, navOptions = {}) {
      const historyMode = navOptions.historyMode || "push";
      const nextUrl = getCanonicalProfileAliasUrl(url) || url;
      if (!canHandleUrl(nextUrl)) {
        window.location.assign(nextUrl.toString());
        return;
      }

      const token = ++navigationToken;
      shell.setLoading(true);

      try {
        const response = await fetch(nextUrl.toString(), {
          cache: "no-store",
          credentials: "same-origin"
        });

        if (!response.ok) {
          throw new Error(`Navigation fetch failed: ${response.status}`);
        }

        const html = await response.text();
        if (token !== navigationToken) return;

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const fetchedPageId = parsePageIdFromDocument(doc);
        const nextConfig = fetchedPageId ? PAGE_CONFIG[fetchedPageId] : resolveConfigFromPath(nextUrl.pathname);

        if (!nextConfig) {
          window.location.assign(nextUrl.toString());
          return;
        }

        if (Boolean(nextConfig.standalone) !== Boolean(currentConfig.standalone)) {
          window.location.assign(nextUrl.toString());
          return;
        }

        if (doc.title) {
          document.title = doc.title;
        }

        if (fetchedPageId) {
          document.body.dataset.publicPage = fetchedPageId;
        }

        if (historyMode === "push") {
          window.history.pushState({ path: nextUrl.pathname + nextUrl.search }, "", nextUrl.toString());
        } else if (historyMode === "replace") {
          window.history.replaceState({ path: nextUrl.pathname + nextUrl.search }, "", nextUrl.toString());
        }

        await ensureData();
        applyConfig(nextConfig, { keepState: false });
      } catch (_err) {
        window.location.assign(nextUrl.toString());
      } finally {
        if (token === navigationToken) {
          shell.setLoading(false);
        }
      }
    }

    document.addEventListener("click", (event) => {
      const anchor = event.target.closest("a[href]");
      if (!anchor) return;
      if (anchor.hasAttribute("download")) return;
      if (anchor.target === "_blank") return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const href = anchor.getAttribute("href") || "";
      if (!href || href.startsWith("#")) return;

      let url;
      try {
        url = new URL(href, window.location.href);
      } catch (_err) {
        return;
      }

      const nextUrl = getCanonicalProfileAliasUrl(url) || url;
      if (!canHandleUrl(nextUrl)) return;

      if (
        normalizePath(nextUrl.pathname) === normalizePath(window.location.pathname) &&
        nextUrl.search === window.location.search &&
        nextUrl.hash === window.location.hash
      ) {
        return;
      }

      event.preventDefault();
      navigateTo(nextUrl, { historyMode: "push" });
    });

    window.addEventListener("popstate", () => {
      const url = new URL(window.location.href);
      if (!canHandleUrl(url)) {
        window.location.reload();
        return;
      }
      navigateTo(url, { historyMode: "none" });
    });
    window.addEventListener("beforeunload", () => {
      closeWheelLiveSync();
    });

    ensureData()
      .then(async () => {
        if (pendingLegacyProfileUuid) {
          const resolvedCode = await resolveLegacyProfileUuid(pendingLegacyProfileUuid).catch(() => "");
          const finalCode = resolvedCode || "public-user";
          window.history.replaceState(window.history.state, "", buildLegacyProfileHref(finalCode));
        }
      })
      .finally(() => {
        applyConfig(currentConfig, { keepState: false });
        refreshAuthWidget(true);
        shell.setLoading(false);
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
