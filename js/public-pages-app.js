(() => {
  const MEDIA_FILTERS = [
    { value: "clips", label: "Clips" },
    { value: "polls", label: "Polls" },
    { value: "scoreboards", label: "Scoreboards" },
    { value: "tallies", label: "Tallies" }
  ];

  const TYPE_TO_PAGE = {
    clips: "/clips.html",
    polls: "/polls.html",
    scoreboards: "/scoreboards.html",
    tallies: "/tallies.html"
  };

  const DETAIL_LAYOUT_STORAGE_KEY = "ss-public-detail-layout";
  const PROFILE_ARTIFACT_LAYOUT_STORAGE_KEY = "ss-public-profile-artifact-layout";
  const CURRENT_ORIGIN = String(window.location.origin || "").trim();
  const AUTH_API_BASE = /^https?:\/\//.test(CURRENT_ORIGIN) ? CURRENT_ORIGIN : "https://streamsuites.app";
  const AUTH_ME_URL = `${AUTH_API_BASE}/api/public/me`;
  const AUTH_PUBLIC_PROFILE_URL = `${AUTH_API_BASE}/api/public/profile`;
  const AUTH_PUBLIC_PROFILE_ME_URL = `${AUTH_API_BASE}/api/public/profile/me`;
  const AUTH_PUBLIC_PROFILE_RESOLVE_URL = `${AUTH_API_BASE}/api/public/profile/resolve`;
  const AUTH_PUBLIC_ARTIFACTS_URL = `${AUTH_API_BASE}/api/public/artifacts`;
  const AUTH_LOGOUT_URL = `${AUTH_API_BASE}/auth/logout`;
  const CREATOR_DASHBOARD_URL = "https://creator.streamsuites.app";
  const CREATOR_SIGNUP_URL = "https://api.streamsuites.app/auth/login/google?surface=creator";
  const ADMIN_DASHBOARD_URL = "https://admin.streamsuites.app";
  const PUBLIC_AUTH_COMPLETE_MESSAGE_TYPE = "ss_public_auth_complete";
  const CANONICAL_PROFILE_PREFIX = "/u/";
  const ROLE_ICON_MAP = Object.freeze({
    admin: "/assets/icons/tierbadge-admin.svg"
  });
  const TIER_ICON_MAP = Object.freeze({
    core: "/assets/icons/tierbadge-core.svg",
    gold: "/assets/icons/tierbadge-gold.svg",
    pro: "/assets/icons/tierbadge-pro.svg"
  });
  const UI_ICON_MAP = Object.freeze({
    copy: "/assets/icons/ui/portal.svg",
    check: "/assets/icons/ui/tickyes.svg",
    layoutSide: "/assets/icons/ui/cards.svg",
    layoutStack: "/assets/icons/ui/tablechart.svg",
    gallery: "/assets/icons/ui/cards.svg",
    list: "/assets/icons/ui/tablechart.svg",
    edit: "/assets/icons/ui/cog.svg",
    share: "/assets/icons/ui/send.svg",
    visibility: "/assets/icons/ui/globe.svg",
    social: "/assets/icons/ui/integrations.svg"
  });
  const SOCIAL_ICON_MAP = Object.freeze({
    youtube: "/assets/icons/youtube.svg",
    rumble: "/assets/icons/rumble.svg",
    discord: "/assets/icons/discord.svg",
    x: "/assets/icons/x.svg",
    twitter: "/assets/icons/twitter.svg",
    twitch: "/assets/icons/twitch.svg",
    kick: "/assets/icons/kick.svg",
    tiktok: "/assets/icons/ui/widget.svg"
  });
  const DEFAULT_PROFILE_COVER = "/assets/placeholders/defaultprofilecover.webp";

  const PAGE_CONFIG = {
    "media-home": {
      path: "/media.html",
      shellKind: "media",
      activeHref: "/media.html",
      topbarLabel: "Media Home",
      searchPlaceholder: "Search clips, polls, scoreboards, tallies",
      filterMode: "multi",
      filtersCollapsed: true,
      defaultFilters: ["clips", "polls", "scoreboards", "tallies"],
      render: renderMediaHome
    },
    "media-clips": {
      path: "/clips.html",
      shellKind: "media",
      activeHref: "/clips.html",
      topbarLabel: "Clips",
      searchPlaceholder: "Search clips",
      filterMode: "single-nav",
      filtersCollapsed: true,
      defaultFilters: ["clips"],
      render: renderMediaList,
      listType: "clips"
    },
    "media-polls": {
      path: "/polls.html",
      shellKind: "media",
      activeHref: "/polls.html",
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
      shellKind: "media",
      activeHref: "/scoreboards.html",
      topbarLabel: "Scoreboards",
      searchPlaceholder: "Search scoreboards",
      filterMode: "single-nav",
      filtersCollapsed: true,
      defaultFilters: ["scoreboards"],
      render: renderMediaList,
      listType: "scoreboards"
    },
    "media-tallies": {
      path: "/tallies.html",
      shellKind: "media",
      activeHref: "/tallies.html",
      topbarLabel: "Tallies",
      searchPlaceholder: "Search tallies",
      filterMode: "single-nav",
      filtersCollapsed: true,
      defaultFilters: ["tallies"],
      render: renderMediaList,
      listType: "tallies"
    },
    "detail-clip": {
      path: "/clips/detail.html",
      shellKind: "media",
      activeHref: "/clips.html",
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
      activeHref: "/polls.html",
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
      activeHref: "/polls.html",
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
      activeHref: "/scoreboards.html",
      topbarLabel: "Scoreboard Detail",
      searchPlaceholder: "Search",
      hideSearch: true,
      filterMode: "single-nav",
      filtersCollapsed: true,
      defaultFilters: ["scoreboards"],
      render: renderDetail,
      detailType: "scoreboards"
    },
    "detail-tally": {
      path: "/tallies/detail.html",
      shellKind: "media",
      activeHref: "/tallies.html",
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
      activeHref: "/community/index.html",
      topbarLabel: "Community",
      searchPlaceholder: "Search members and notices",
      filterMode: "none",
      filtersCollapsed: true,
      defaultFilters: [],
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
    { prefix: "/scores/", pageId: "detail-scoreboard", detailType: "scoreboards" }
  ]);

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

  function isUuidLike(value) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || "").trim());
  }

  function normalizeSocialLinks(value) {
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
    return badge;
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
    node.classList.add("ss-profile-hover");

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
    const badges = Array.isArray(profile.badges) ? profile.badges : [];
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
    if (role.includes("creator")) return "creator";
    return "viewer";
  }

  function normalizeTierForUi(value) {
    const tier = String(value || "").trim().toLowerCase();
    if (tier === "gold" || tier === "pro") return tier;
    return "core";
  }

  function roleLabel(role) {
    if (role === "admin") return "ADMIN";
    if (role === "creator") return "CREATOR";
    return "VIEWER";
  }

  function createBadgeIcon(type, value) {
    const icon = create("img", "badge-icon");
    const normalized = String(value || "").trim().toLowerCase();
    if (type === "tier") {
      icon.src = TIER_ICON_MAP[normalized];
      if (!icon.src) return null;
      icon.alt = `${normalized || "core"} tier`;
      icon.classList.add("badge-icon-tier");
      icon.classList.add("ss-tier-badge");
      icon.setAttribute("data-ss-role-badge", normalized || "core");
      return icon;
    }
    icon.src = ROLE_ICON_MAP[normalized];
    if (!icon.src) return null;
    icon.alt = `${normalized || "viewer"} role`;
    icon.classList.add("badge-icon-role");
    icon.classList.add("ss-role-badge");
    icon.setAttribute("data-ss-role-badge", normalized || "role");
    return icon;
  }

  function buildBadgeSuffix(profile, options = {}) {
    const includeRoleChip = Boolean(options.includeRoleChip);
    const row = create("span", "creator-badges ss-role-badges");
    row.setAttribute("data-ss-badge-kind", "role");
    const role = normalizeRoleForUi(profile?.role);
    const tier = normalizeTierForUi(profile?.tier);
    if (role === "admin") {
      const adminIcon = createBadgeIcon("role", "admin");
      if (adminIcon) row.appendChild(adminIcon);
    } else if (role === "creator") {
      const tierIcon = createBadgeIcon("tier", tier);
      if (tierIcon) row.appendChild(tierIcon);
    }

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
    const row = create("div", "creator-meta");
    applyProfileHoverAttrs(row, profile);
    if (expanded) row.classList.add("is-expanded");
    const avatar = buildAvatar(profile);
    applyProfileHoverAttrs(avatar, profile);
    if (expanded) avatar.classList.add("is-expanded");
    row.appendChild(avatar);

    const textWrap = create("div", "creator-meta-text");
    const top = create("div", "creator-meta-top");
    const name = create("span", "creator-name", profile?.displayName || "Public User");
    applyProfileHoverAttrs(name, profile);
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
    body.append(create("h3", "item-title", buildCardTitle(item)), buildCreatorMeta(item.creator));

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
    body.append(create("h3", "item-title", buildCardTitle(item)), buildCreatorMeta(item.creator));

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

  function buildScoreboardCard(item) {
    const card = create("article", "item-card type-scoreboards");
    const link = create("a", "item-link");
    link.href = item.href;

    const body = create("div", "item-body");
    body.append(
      create("h3", "item-title", buildCardTitle(item)),
      buildCreatorMeta(item.creator),
      buildResultsRows(item.entries || [], "percent", 3)
    );

    const meta = create("div", "item-meta");
    meta.append(buildStatusChip(item.status), buildPlatformChip(item.platform, item.platformIcon));

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
      buildCreatorMeta(item.creator),
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
    if (item.type === "clips") return buildClipCard(item, options);
    if (item.type === "polls") return buildPollCard(item, options);
    if (item.type === "scoreboards") return buildScoreboardCard(item, options);
    if (item.type === "tallies") return buildTallyCard(item, options);
    return buildClipCard(item, options);
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

  function filterItemsByType(data, type, query) {
    return (data[type] || []).filter((item) => !item?.isRemoved && matchesQuery(item, query));
  }

  function renderMediaHome(ctx) {
    const { host, data, state } = ctx;
    clear(host);
    host.appendChild(buildPageHeading("Media Gallery", "Browse public clips, polls, scoreboards, and tallies."));

    const activeFilters = new Set(
      state.activeFilters.length ? state.activeFilters : ["clips", "polls", "scoreboards", "tallies"]
    );

    const sections = [
      { type: "clips", title: "Clips", seeAll: "/clips.html", limitRows: 2, showSnippet: false },
      { type: "polls", title: "Polls", seeAll: "/polls.html", limitRows: 1 },
      { type: "scoreboards", title: "Scoreboards", seeAll: "/scoreboards.html", limitRows: 1 },
      { type: "tallies", title: "Tallies", seeAll: "/tallies.html", limitRows: 1 }
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
      if (sectionIndex > 0) {
        section.classList.add("section-divided");
      }
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
      scoreboards: ["Scoreboards Gallery", "Scoreboard overlays and metric snapshots."],
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
      if (type === "scoreboards") return `/scores/${encoded}`;
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

  function buildShareBox(url) {
    const box = create("div", "share-box");
    const text = create("code", "share-link-text", url);
    text.setAttribute("title", url);

    const copyButton = create("button", "share-copy-btn");
    copyButton.type = "button";
    copyButton.setAttribute("aria-label", "Copy share link");
    copyButton.appendChild(createIcon(UI_ICON_MAP.copy, "button-icon-mask"));

    copyButton.addEventListener("click", () => {
      copyTextToClipboard(url).then((copied) => {
        copyButton.classList.toggle("is-copied", copied);
        copyButton.innerHTML = "";
        copyButton.appendChild(createIcon(copied ? UI_ICON_MAP.check : UI_ICON_MAP.copy, "button-icon-mask"));
        window.setTimeout(() => {
          copyButton.classList.remove("is-copied");
          copyButton.innerHTML = "";
          copyButton.appendChild(createIcon(UI_ICON_MAP.copy, "button-icon-mask"));
        }, 1300);
      });
    });

    box.append(text, copyButton);
    return box;
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

  function buildProfileShareSection(profile) {
    const section = create("div", "profile-share-section");
    const options = create("div", "profile-share-grid");
    const streamSuitesUrl = String(profile?.streamsuitesShareUrl || profile?.streamsuitesProfileUrl || "").trim();
    const findMeHereUrl = profile?.findmehereVisible ? String(profile?.findmehereShareUrl || profile?.findmehereProfileUrl || "").trim() : "";

    const createShareOption = (label, url, tone = "") => {
      const card = create("div", `profile-share-option${tone ? ` ${tone}` : ""}`);
      card.append(create("div", "profile-share-option-title", label), buildShareBox(url));
      return card;
    };

    if (streamSuitesUrl) {
      options.appendChild(createShareOption("StreamSuites", streamSuitesUrl));
    }

    if (findMeHereUrl) {
      options.appendChild(createShareOption("FindMeHere", findMeHereUrl));
    } else {
      const note = create("div", "profile-share-note", buildFindMeHereStatusText(profile));
      if (note.textContent) {
        options.appendChild(note);
      }
    }

    section.appendChild(options);
    return section;
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
      scoreboards: "Scoreboard",
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
    const side = create("aside", "detail-side");

    const profileCard = create("div", "profile-card");
    profileCard.appendChild(buildCreatorMeta(item.creator, { expanded: true, includeRoleChip: true }));
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

    if (item.resultsHref) {
      const resultsLink = create("a", "see-all", "Open results page");
      resultsLink.href = item.resultsHref;
      side.appendChild(resultsLink);
    }

    return side;
  }

  function renderDetail(ctx, config) {
    const { host, data, authState } = ctx;
    clear(host);

    const id = window.StreamSuitesPublicData.parseDetailId();
    const allItems = data[config.detailType] || [];
    const item = findArtifactByIdentifier(allItems, id);

    if (!item) {
      const typeLabel = config.detailType === "scoreboards" ? "Score" : toTitle(config.detailType).replace(/s$/, "");
      host.appendChild(buildPageHeading(`${typeLabel} unavailable`, `No public ${typeLabel.toLowerCase()} matches the requested identifier.`));
      const state = create("div", "empty-state", "Check the artifact link or return to the gallery.");
      host.appendChild(state);
      return;
    }

    syncCanonicalArtifactRoute(item, config);

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

    const layout = create("section", "detail-layout");
    const toolbar = buildLayoutToggle(layout);

    const main = buildDetailMain(item, config, data.helpers);
    const side = buildDetailSide(item, data.helpers, {
      authState,
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
      onRemoved() {
        renderPollResults(ctx);
      }
    });

    layout.append(main, side);
    host.append(toolbar, layout);
  }

  function renderCommunityHome(ctx) {
    const { host, data, state } = ctx;
    clear(host);
    host.appendChild(buildPageHeading("Community", "Latest notices and public member directory."));

    const latestNotice = (data.notices || [])[0] || null;
    const noticeSection = buildSection("Latest Notice", "/community/notices.html").section;
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

    const memberCap = window.matchMedia("(max-width: 900px)").matches ? 4 : 8;
    const members = (data.profiles || [])
      .filter((profile) => profile?.isListed !== false && isProfileVisibleOnStreamSuites(profile))
      .filter((profile) => norm(profile.displayName).includes(norm(state.query)) || norm(profile.username).includes(norm(state.query)))
      .slice(0, memberCap);

    const memberSection = buildSection("Members", "/community/members.html").section;
    const grid = create("div", "profile-grid");
    members.forEach((profile) => {
      grid.appendChild(buildProfileCard(profile, data));
    });
    memberSection.appendChild(grid);

    if (!members.length) {
      memberSection.appendChild(create("div", "empty-state", "No members match this search."));
    }

    host.appendChild(memberSection);
  }

  function buildProfileCard(profile, data) {
    const card = create("article", "profile-card");
    card.appendChild(buildCreatorMeta(profile, { expanded: true, includeRoleChip: false }));

    const artifactCount = (data.artifactsByProfile?.[profile.id] || []).length;
    const badge = create("div", "item-meta");
    badge.append(create("span", "meta-pill", `${artifactCount} artifacts`));

    const link = create("a", "see-all", "Open profile");
    link.href = buildProfileHref(profile);

    card.append(create("p", "item-snippet", profile.bio || ""), badge, link);
    return card;
  }

  function renderCommunityMembers(ctx) {
    const { host, data, state } = ctx;
    clear(host);
    host.appendChild(buildPageHeading("Members Directory", "Search all public creator/member profiles."));

    const grid = create("section", "profile-grid");
    const members = (data.profiles || []).filter((profile) => {
      if (profile?.isListed === false || !isProfileVisibleOnStreamSuites(profile)) return false;
      const haystack = `${profile.displayName} ${profile.username} ${profile.role} ${profile.platform}`.toLowerCase();
      return haystack.includes(norm(state.query));
    });

    members.forEach((profile) => {
      grid.appendChild(buildProfileCard(profile, data));
    });

    host.appendChild(grid);
    if (!members.length) {
      host.appendChild(create("div", "empty-state", "No members match this search."));
    }
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
    const normalized = String(network || "").trim().toLowerCase();
    return SOCIAL_ICON_MAP[normalized] || "/assets/icons/ui/globe.svg";
  }

  function normalizeProfilePayload(payload, fallbackProfile, fallbackCode) {
    const accountType =
      normalizeAccountType(payload?.account_type) ||
      normalizeAccountType(payload?.accountType) ||
      (String(payload?.role || "").toLowerCase().includes("admin")
        ? "ADMIN"
        : String(payload?.role || "").toLowerCase().includes("creator")
          ? "CREATOR"
          : "PUBLIC");
    const role = accountType === "ADMIN" ? "admin" : accountType === "CREATOR" ? "creator" : "viewer";
    const tier = normalizeTierForUi(payload?.tier || fallbackProfile?.tier || "core");
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
    const socialLinks = normalizeSocialLinks(payload?.social_links || payload?.socialLinks || fallbackProfile?.socialLinks);
    const isAnonymous = payload?.is_anonymous === true || payload?.anonymous === true || fallbackProfile?.isAnonymous === true;
    const isListed = payload?.is_listed !== false && payload?.listed !== false && fallbackProfile?.isListed !== false;
    const creatorCapable = firstBoolean(payload?.creator_capable, payload?.creatorCapable, fallbackProfile?.creatorCapable, accountType === "ADMIN" || accountType === "CREATOR") === true;
    const viewerOnly =
      firstBoolean(payload?.viewer_only, payload?.viewerOnly, fallbackProfile?.viewerOnly, !creatorCapable && payload?.public_surface_account_type === "viewer_only") === true;
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
    const hasLiveStatusPayload =
      Object.prototype.hasOwnProperty.call(payload || {}, "live_status") ||
      Object.prototype.hasOwnProperty.call(payload || {}, "liveStatus");
    const liveStatus = hasLiveStatusPayload
      ? window.StreamSuitesPublicData?.normalizeLiveStatus?.(payload?.live_status || payload?.liveStatus) || null
      : fallbackProfile?.liveStatus || null;
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
      tier,
      bio,
      socialLinks,
      coverImageUrl,
      bannerImageUrl,
      backgroundImageUrl,
      isAnonymous,
      isListed,
      badges: buildAccountBadges(accountType, tier),
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
      liveStatus
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

  function renderProfileNotFound(host, requestedCode) {
    const normalizedCode = String(requestedCode || "").trim();
    const title = normalizedCode ? `@${normalizedCode}` : "Profile";
    const subtitle = normalizedCode
      ? "This public profile could not be found."
      : "A public profile slug is required for this route.";
    const nextHeading = buildPageHeading(title, subtitle);
    const existingHeading = host.querySelector(".page-heading");
    if (existingHeading && existingHeading.parentElement === host) {
      host.replaceChild(nextHeading, existingHeading);
    } else {
      host.prepend(nextHeading);
    }

    const layout = host.querySelector(".public-standalone-main");
    const profileCard = host.querySelector(".profile-card-standalone");
    if (!layout || !profileCard) return;

    clear(profileCard);
    profileCard.append(
      create("div", "empty-state", normalizedCode ? "Profile not found." : "Missing profile slug."),
      create("p", "item-snippet", normalizedCode
        ? "Check the profile link or try searching the community directory."
        : "Use a canonical public profile URL in the format /u/<slug>.")
    );
    document.title = normalizedCode ? `${normalizedCode} | Profile Not Found` : "Profile Not Found | StreamSuites";
  }

  function renderProfileUnavailable(host, profile, requestedCode) {
    const normalizedCode = String(profile?.publicSlug || requestedCode || "").trim();
    const title = normalizedCode ? `@${normalizedCode}` : "Profile unavailable";
    const subtitle = "This canonical StreamSuites public profile is currently unavailable.";
    const nextHeading = buildPageHeading(title, subtitle);
    const existingHeading = host.querySelector(".page-heading");
    if (existingHeading && existingHeading.parentElement === host) {
      host.replaceChild(nextHeading, existingHeading);
    } else {
      host.prepend(nextHeading);
    }

    const layout = host.querySelector(".public-standalone-main");
    const profileCard = host.querySelector(".profile-card-standalone");
    if (!layout || !profileCard) return;

    clear(profileCard);
    profileCard.append(
      create("div", "empty-state", "Profile unavailable"),
      create("p", "profile-unavailable-copy", buildUnavailableProfileMessage(profile))
    );
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
    const entries = Object.entries(normalizeSocialLinks(socialLinks));
    if (!entries.length) {
      row.appendChild(create("span", "muted", "No social links set."));
      return row;
    }
    entries.forEach(([network, url]) => {
      const anchor = create("a", "social-icon-btn");
      anchor.href = url;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      anchor.setAttribute("aria-label", network);
      const icon = create("img");
      icon.src = socialIconPath(network);
      icon.alt = "";
      anchor.appendChild(icon);
      row.appendChild(anchor);
    });
    return row;
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
      wrap.appendChild(buildMediaCard(item, { showSnippet: true }));
      if (ownerMode) {
        const edit = create("a", "edit-affordance artifact-edit-affordance", "Edit");
        edit.href = item.href;
        wrap.appendChild(edit);
      }
      grid.appendChild(wrap);
    });
    host.appendChild(grid);
  }

  function renderProfileBody(profileCard, profile, canEdit) {
    clear(profileCard);
    const coverWrap = create("div", "profile-cover");
    const coverImage = create("img");
    coverImage.src = profile.bannerImageUrl || profile.coverImageUrl || DEFAULT_PROFILE_COVER;
    coverImage.alt = `${profile.displayName} cover`;
    coverWrap.appendChild(coverImage);
    profileCard.appendChild(coverWrap);

    const profileMeta = buildCreatorMeta(profile, { expanded: true, includeRoleChip: true });
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
      renderProfileBody(profileCard, profile, canEdit);
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
    host.appendChild(buildPageHeading("Profile", "Loading public profile…"));

    const layout = create("section", "public-standalone-main");
    const profileCard = create("article", "profile-card profile-card-expanded profile-card-standalone");
    layout.appendChild(profileCard);
    host.appendChild(layout);

    const profileCode = resolveStandaloneProfileCode();
    const localProfile = findLocalProfile(data, profileCode);
    const fallbackProfile = localProfile || resolveLocalProfile(data, profileCode);

    (async () => {
      if (!profileCode) {
        renderProfileNotFound(host, "");
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
          renderProfileNotFound(host, profileCode);
          return;
        }
        if (!canEdit && error?.status === 404) {
          if (!isProfileVisibleOnStreamSuites(profile)) {
            renderProfileUnavailable(host, profile, profileCode);
          } else {
            renderProfileNotFound(host, profileCode);
          }
          return;
        }
        // Keep local profile fallback when API profile endpoints are unavailable.
      }

      if (!profile) {
        renderProfileNotFound(host, profileCode);
        return;
      }

      if (!canEdit && !isProfileVisibleOnStreamSuites(profile)) {
        renderProfileUnavailable(host, profile, profileCode);
        return;
      }

      syncStandaloneProfileCanonicalUrl(profile, profileCode);

      const nextHeading = buildPageHeading(profile.displayName, `${profile.platform} | ${roleLabel(normalizeRoleForUi(profile.role))}`);
      const existingHeading = host.querySelector(".page-heading");
      if (existingHeading && existingHeading.parentElement === host) {
        host.replaceChild(nextHeading, existingHeading);
      } else {
        host.prepend(nextHeading);
      }
      document.title = `${profile.displayName} | StreamSuites Public Profile`;
      renderProfileBody(profileCard, profile, canEdit);
    })();
  }

  function renderCommunitySettings(ctx) {
    const { host, authState } = ctx;
    clear(host);
    host.appendChild(buildPageHeading("Public Account Settings", "Manage your StreamSuites public profile and review creator-only FindMeHere eligibility."));

    if (!authState?.authenticated) {
      host.appendChild(create("div", "empty-state", "Log in to access Public Account Settings."));
      return;
    }

    const accountType = String(authState.accountType || "").toUpperCase();
    if (accountType !== "PUBLIC") {
      host.appendChild(create("div", "empty-state", "This settings view is available for Viewer/Public accounts only."));
      return;
    }

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
    if (normalized === "ADMIN" || normalized === "CREATOR" || normalized === "PUBLIC") {
      return normalized;
    }
    return "";
  }

  function normalizeUserCode(value, fallback = "public-user") {
    const normalized = String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const isUuidLike = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(normalized);
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
    const role = accountType === "ADMIN" ? "admin" : accountType === "CREATOR" ? "creator" : "viewer";
    const tierValue = normalizeTierForUi(tier);
    const badges = [{ kind: "role-chip", value: role, label: roleLabel(role) }];
    if (role === "admin") {
      badges.unshift({ kind: "role-icon", value: "admin" });
      return badges;
    }
    if (role === "creator") {
      badges.unshift({ kind: "tier-icon", value: tierValue });
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
        accountType: "PUBLIC",
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
      normalizeAccountType(payload?.account_type) ||
      normalizeAccountType(payload?.role) ||
      normalizeAccountType(payload?.data?.role) ||
      normalizeAccountType(payload?.user?.role) ||
      (payload?.is_admin ? "ADMIN" : payload?.is_creator ? "CREATOR" : "PUBLIC");
    const tier = String(
      payload?.tier ||
      payload?.data?.tier ||
      payload?.user?.tier ||
      "core"
    ).trim().toLowerCase() || "core";
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
      tier,
      badges: buildAccountBadges(accountType, tier)
    };
  }

  function buildAccountMenuItems(authState) {
    if (!authState?.authenticated) {
      return [
        { label: "Public Login", action: "public_login" },
        {
          label: "Creator Login",
          href: "https://api.streamsuites.app/auth/login/google?surface=creator",
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

    if (authState.accountType === "PUBLIC") {
      items.push({
        label: "Account Settings",
        href: "/community/settings.html",
        action: "account_settings"
      });
    }

    if (authState.accountType === "CREATOR" || authState.accountType === "ADMIN") {
      items.push({ separator: true });
      items.push({
        label: "Creator Dashboard",
        href: CREATOR_DASHBOARD_URL,
        target: "_blank",
        rel: "noopener noreferrer",
        action: "creator_dashboard"
      });
    }

    if (authState.accountType === "ADMIN") {
      items.push({
        label: "Admin Dashboard",
        href: ADMIN_DASHBOARD_URL,
        target: "_blank",
        rel: "noopener noreferrer",
        action: "admin_dashboard"
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
      openAuthModal() {}
    };
  }

  function init() {
    const initialPageId = document.body.dataset.publicPage;
    if (!initialPageId || !PAGE_CONFIG[initialPageId]) return;

    let currentPageId = initialPageId;
    let currentConfig = PAGE_CONFIG[currentPageId];
    let loadedData = null;
    let navigationToken = 0;
    let pendingLegacyProfileUuid = "";

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
      activeFilters: [...currentConfig.defaultFilters]
    };

    const shell = currentConfig.standalone
      ? mountStandaloneRoot()
      : window.StreamSuitesPublicShell.mount({
          shellKind: currentConfig.shellKind,
          activeHref: currentConfig.activeHref,
          topbarLabel: currentConfig.topbarLabel,
          searchPlaceholder: currentConfig.searchPlaceholder,
          showSearch: currentConfig.hideSearch !== true,
          filters: buildFiltersForConfig(currentConfig),
          filtersCollapsed: currentConfig.filtersCollapsed,
          multiFilter: currentConfig.filterMode === "multi",
          accountLabel: "Guest"
        });
    if (!shell) return;

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
      currentConfig.render({ host: shell.content, data: loadedData, state, authState }, currentConfig);
    };

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
      }

      shell.updateOptions({
        shellKind: nextConfig.shellKind,
        activeHref: nextConfig.activeHref,
        topbarLabel: nextConfig.topbarLabel,
        searchPlaceholder: nextConfig.searchPlaceholder,
        showSearch: nextConfig.hideSearch !== true,
        filters: buildFiltersForConfig(nextConfig),
        multiFilter: nextConfig.filterMode === "multi",
        filtersCollapsed: nextConfig.filtersCollapsed,
        onSearch(query) {
          state.query = query;
          rerender();
        },
        onFilter(detail) {
          if (nextConfig.filterMode === "multi") {
            state.activeFilters = detail.activeFilters.length ? detail.activeFilters : ["clips", "polls", "scoreboards", "tallies"];
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

      shell.setQuery(state.query);
      shell.setFilterState(state.activeFilters);
      shell.setActiveHref(nextConfig.activeHref);

      rerender();
    }

    async function ensureData() {
      if (loadedData) return loadedData;
      loadedData = await window.StreamSuitesPublicData.loadAll();
      return loadedData;
    }

    async function navigateTo(url, navOptions = {}) {
      const historyMode = navOptions.historyMode || "push";
      if (!canHandleUrl(url)) {
        window.location.assign(url.toString());
        return;
      }

      const token = ++navigationToken;
      shell.setLoading(true);

      try {
        const response = await fetch(url.toString(), {
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
        const nextConfig = fetchedPageId ? PAGE_CONFIG[fetchedPageId] : resolveConfigFromPath(url.pathname);

        if (!nextConfig) {
          window.location.assign(url.toString());
          return;
        }

        if (Boolean(nextConfig.standalone) !== Boolean(currentConfig.standalone)) {
          window.location.assign(url.toString());
          return;
        }

        if (doc.title) {
          document.title = doc.title;
        }

        if (fetchedPageId) {
          document.body.dataset.publicPage = fetchedPageId;
        }

        if (historyMode === "push") {
          window.history.pushState({ path: url.pathname + url.search }, "", url.toString());
        } else if (historyMode === "replace") {
          window.history.replaceState({ path: url.pathname + url.search }, "", url.toString());
        }

        await ensureData();
        applyConfig(nextConfig, { keepState: false });
      } catch (_err) {
        window.location.assign(url.toString());
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

      if (!canHandleUrl(url)) return;

      if (
        normalizePath(url.pathname) === normalizePath(window.location.pathname) &&
        url.search === window.location.search &&
        url.hash === window.location.hash
      ) {
        return;
      }

      event.preventDefault();
      navigateTo(url, { historyMode: "push" });
    });

    window.addEventListener("popstate", () => {
      const url = new URL(window.location.href);
      if (!canHandleUrl(url)) {
        window.location.reload();
        return;
      }
      navigateTo(url, { historyMode: "none" });
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
