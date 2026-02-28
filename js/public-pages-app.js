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
  const AUTH_API_BASE = "https://api.streamsuites.app";
  const AUTH_ME_URL = `${AUTH_API_BASE}/api/public/me`;
  const AUTH_PUBLIC_ARTIFACTS_URL = `${AUTH_API_BASE}/api/public/artifacts`;
  const AUTH_LOGOUT_URL = `${AUTH_API_BASE}/auth/logout`;
  const PUBLIC_LOGIN_URL = "https://streamsuites.app/public-login.html";
  const CREATOR_DASHBOARD_URL = "https://creator.streamsuites.app";
  const ADMIN_DASHBOARD_URL = "https://admin.streamsuites.app";
  const PUBLIC_AUTH_POPUP_TARGET = "ss_public_auth_login";
  const PUBLIC_AUTH_POPUP_FEATURES = "popup=yes,width=560,height=760";
  const PUBLIC_AUTH_COMPLETE_MESSAGE_TYPE = "ss_public_auth_complete";

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
      filterMode: "none",
      filtersCollapsed: true,
      defaultFilters: [],
      render: renderCommunityProfile
    }
  };

  const PAGE_ID_BY_PATH = Object.entries(PAGE_CONFIG).reduce((acc, [, cfg]) => {
    acc[normalizePath(cfg.path)] = cfg;
    (cfg.aliases || []).forEach((alias) => {
      acc[normalizePath(alias)] = cfg;
    });
    return acc;
  }, {});

  function create(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (typeof text === "string") node.textContent = text;
    return node;
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

  function buildAvatar(profile) {
    const avatar = create("span", "creator-avatar");
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

  function buildBadgeChip(badge) {
    const chip = create("span", "badge-chip", badge.label || "Badge");
    const kind = badge?.kind === "admin" ? "admin" : "tier";
    chip.classList.add(`badge-${kind}`);

    if (kind === "tier" && badge?.tier) {
      chip.dataset.tier = String(badge.tier).toUpperCase();
    }

    return chip;
  }

  function buildCreatorMeta(profile) {
    const row = create("div", "creator-meta");
    row.appendChild(buildAvatar(profile));

    const textWrap = create("div", "creator-meta-text");
    const top = create("div", "creator-meta-top");
    top.appendChild(create("span", "creator-name", profile?.displayName || "Public User"));

    const badges = Array.isArray(profile?.badges) ? profile.badges : [];
    if (badges.length) {
      const badgeWrap = create("div", "creator-badges");
      badges.forEach((badge) => badgeWrap.appendChild(buildBadgeChip(badge)));
      top.appendChild(badgeWrap);
    }

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
      img.src = item.thumbnail || "/assets/backgrounds/seodash.jpg";
      img.alt = `${item.title} preview`;
      thumb.appendChild(img);
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
    make("ID", item.id);

    return rows;
  }

  function buildShareLink(pathname, id) {
    const url = new URL(pathname, window.location.origin);
    url.searchParams.set("id", id);
    return url.toString();
  }

  function buildArtifactGalleryLink(type) {
    return TYPE_TO_PAGE[type] || "/media.html";
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

    const copyButton = create("button", "share-copy-btn", "⎘");
    copyButton.type = "button";
    copyButton.setAttribute("aria-label", "Copy share link");

    copyButton.addEventListener("click", () => {
      copyTextToClipboard(url).then((copied) => {
        copyButton.textContent = copied ? "✓" : "!";
        window.setTimeout(() => {
          copyButton.textContent = "⎘";
        }, 1300);
      });
    });

    box.append(text, copyButton);
    return box;
  }

  function buildExternalSourceBlock(item) {
    if (!item?.sourceUrl) return null;

    const wrap = create("div", "external-source");
    const link = create("a", "external-source-link");
    link.href = item.sourceUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    const icon = create("img", "chip-icon");
    icon.src = item.platformIcon || window.StreamSuitesPublicData?.platformIconFor?.(item.platform) || "/assets/icons/pilled.svg";
    icon.alt = `${item.platform || "Source"} icon`;

    const action = item.type === "clips" ? "Watch on" : "Open on";
    link.append(icon, create("span", "", `${action} ${item.platform || "Source"}`));

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

    const sideButton = create("button", "detail-layout-toggle", "▥");
    sideButton.type = "button";
    sideButton.dataset.layout = "side";
    sideButton.setAttribute("aria-label", "Show side panel layout");

    const stackButton = create("button", "detail-layout-toggle", "▤");
    stackButton.type = "button";
    stackButton.dataset.layout = "stack";
    stackButton.setAttribute("aria-label", "Stack details under media");

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

  function buildDetailMain(item, config) {
    const main = create("article", "detail-main");

    const player = create("div", "detail-player");
    if (config.detailType === "clips" && item.mediaUrl) {
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

    if (config.detailType === "polls") {
      if (item.chartType === "pie") {
        copy.appendChild(buildPiePreview(item.options || [], "percent"));
      } else {
        copy.appendChild(buildResultsRows(item.options || [], "percent", 6));
      }
    }

    if (config.detailType === "scoreboards") {
      copy.appendChild(buildResultsRows(item.entries || [], "percent", 6));
    }

    if (config.detailType === "tallies") {
      copy.appendChild(buildPiePreview(item.entries || [], "sharePercent"));
      copy.appendChild(buildResultsRows(item.entries || [], "sharePercent", 6));
    }

    main.append(player, copy);
    return main;
  }

  function buildDetailSide(item, helpers, options = {}) {
    const authState = options.authState || null;
    const onRemoved = options.onRemoved;
    const side = create("aside", "detail-side");

    const profileCard = create("div", "profile-card");
    profileCard.appendChild(buildCreatorMeta(item.creator));
    profileCard.appendChild(buildDetailRows(item, helpers));

    const profileLink = create("a", "see-all", "Open profile");
    profileLink.href = `/community/profile.html?id=${encodeURIComponent(item.profileId || "public-user")}`;

    const shareLabel = create("div", "detail-subtle-label", "Share Link");
    const shareUrl = buildShareLink(window.location.pathname, item.id);
    const shareBox = buildShareBox(shareUrl);

    profileCard.append(profileLink, shareLabel, shareBox);

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

    const sourceBlock = buildExternalSourceBlock(item);
    if (sourceBlock) {
      profileCard.appendChild(sourceBlock);
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
    const item = allItems.find((entry) => entry.id === id) || allItems.find((entry) => !entry?.isRemoved) || allItems[0];

    if (!item) {
      host.appendChild(create("div", "empty-state", "Item not found."));
      return;
    }

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

    const main = buildDetailMain(item, config);
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
    const poll = allPolls.find((entry) => entry.id === id) || allPolls.find((entry) => !entry?.isRemoved) || allPolls[0];

    if (!poll) {
      host.appendChild(create("div", "empty-state", "Poll not found."));
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
    main.appendChild(create("p", "item-snippet", `Status: ${poll.status} | Total votes: ${formatNumber(poll.totalVotes)}`));

    if (poll.chartType === "pie") {
      main.appendChild(buildPiePreview(poll.options || [], "percent"));
    }
    main.appendChild(buildResultsRows(poll.options || [], "percent", 8));

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
    card.appendChild(buildCreatorMeta(profile));

    const artifactCount = (data.artifactsByProfile?.[profile.id] || []).length;
    const badge = create("div", "item-meta");
    badge.append(create("span", "meta-pill", `${artifactCount} artifacts`));

    const link = create("a", "see-all", "Open profile");
    link.href = `/community/profile.html?id=${encodeURIComponent(profile.id)}`;

    card.append(create("p", "item-snippet", profile.bio || ""), badge, link);
    return card;
  }

  function renderCommunityMembers(ctx) {
    const { host, data, state } = ctx;
    clear(host);
    host.appendChild(buildPageHeading("Members Directory", "Search all public creator/member profiles."));

    const grid = create("section", "profile-grid");
    const members = (data.profiles || []).filter((profile) => {
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

  function renderCommunityProfile(ctx) {
    const { host, data } = ctx;
    clear(host);

    const id = window.StreamSuitesPublicData.parseDetailId();
    const profile = data.profilesById[id] || data.profilesById[window.StreamSuitesPublicData.DEFAULT_PROFILE.id];
    const artifacts = data.artifactsByProfile?.[profile.id] || [];

    host.appendChild(buildPageHeading(profile.displayName, `${profile.platform} | ${profile.role}`));

    const hero = create("section", "detail-layout is-stacked");
    const left = create("article", "detail-main");
    const right = create("aside", "detail-side");

    const profileCard = create("article", "profile-card");
    profileCard.append(buildCreatorMeta(profile), create("p", "", profile.bio || ""));
    left.appendChild(profileCard);

    const artifactSection = create("section", "section");
    artifactSection.append(create("h2", "", "Recent Artifacts"));
    const grid = create("div", "media-grid");
    artifacts.slice(0, 12).forEach((item) => {
      grid.appendChild(buildMediaCard(item, { showSnippet: true }));
    });
    artifactSection.appendChild(grid);

    if (!artifacts.length) {
      artifactSection.appendChild(create("div", "empty-state", "No artifacts linked to this profile yet."));
    }

    right.appendChild(artifactSection);
    hero.append(left, right);
    host.appendChild(hero);
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

  function deriveBadges(accountType, tier) {
    const badges = [];
    const normalizedTier = String(tier || "").trim().toLowerCase();
    if (normalizedTier === "gold" || normalizedTier === "pro") {
      badges.push({ kind: "tier", value: normalizedTier, label: normalizedTier.toUpperCase() });
    }
    if (accountType === "ADMIN") {
      badges.push({ kind: "role", value: "admin", label: "Admin" });
    } else if (accountType === "CREATOR") {
      badges.push({ kind: "role", value: "creator", label: "Creator" });
    }
    return badges;
  }

  function normalizeBadges(rawBadges, accountType, tier) {
    if (!Array.isArray(rawBadges) || !rawBadges.length) {
      return deriveBadges(accountType, tier);
    }
    return rawBadges
      .map((badge) => {
        if (!badge || typeof badge !== "object") return null;
        const label = String(badge.label || badge.value || "").trim();
        if (!label) return null;
        const kind = String(badge.kind || "").trim().toLowerCase() || "role";
        const value = String(badge.value || badge.tier || "").trim().toLowerCase();
        return { kind, value, label };
      })
      .filter(Boolean);
  }

  function normalizeAuthState(payload) {
    const authenticated = readAuthenticated(payload);
    if (!authenticated) {
      return {
        authenticated: false,
        accountId: "",
        displayName: "Guest",
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

    return {
      authenticated: true,
      accountId,
      displayName,
      avatarUrl,
      accountType,
      tier,
      badges: normalizeBadges(payload?.badges, accountType, tier)
    };
  }

  function openPublicLoginPopup() {
    const loginUrl = new URL(PUBLIC_LOGIN_URL);
    loginUrl.searchParams.set("return_to", window.location.href);
    const popup = window.open(
      loginUrl.toString(),
      PUBLIC_AUTH_POPUP_TARGET,
      PUBLIC_AUTH_POPUP_FEATURES
    );
    if (!popup) {
      window.location.assign(loginUrl.toString());
      return null;
    }
    try {
      popup.focus();
    } catch (_err) {
      // Ignore popup focus errors.
    }
    return popup;
  }

  function buildAccountMenuItems(authState) {
    if (!authState?.authenticated) return [];

    const items = [
      {
        label: "Profile",
        href: `/community/profile.html?id=${encodeURIComponent(authState.accountId || "public-user")}`,
        action: "profile"
      }
    ];

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
      accountLabel: authState?.authenticated ? authState.displayName : "Guest",
      accountAvatar: authState?.authenticated ? authState.avatarUrl : "",
      accountBadges: authState?.authenticated ? authState.badges : [],
      accountAuthenticated: Boolean(authState?.authenticated),
      accountMenuItems: buildAccountMenuItems(authState),
      accountLoginLabel: "Public Login",
      onAccountLogin() {
        openPublicLoginPopup();
      },
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
    return PAGE_ID_BY_PATH[normalizePath(pathname)] || null;
  }

  function canHandleUrl(url) {
    return url.origin === window.location.origin && Boolean(resolveConfigFromPath(url.pathname));
  }

  function parsePageIdFromDocument(doc) {
    const fromBody = doc?.body?.dataset?.publicPage;
    if (fromBody && PAGE_CONFIG[fromBody]) return fromBody;
    return "";
  }

  function init() {
    const initialPageId = document.body.dataset.publicPage;
    if (!initialPageId || !PAGE_CONFIG[initialPageId]) return;

    let currentPageId = initialPageId;
    let currentConfig = PAGE_CONFIG[currentPageId];
    let loadedData = null;
    let navigationToken = 0;

    const state = {
      query: "",
      activeFilters: [...currentConfig.defaultFilters]
    };

    const shell = window.StreamSuitesPublicShell.mount({
      shellKind: currentConfig.shellKind,
      activeHref: currentConfig.activeHref,
      topbarLabel: currentConfig.topbarLabel,
      searchPlaceholder: currentConfig.searchPlaceholder,
      filters: buildFiltersForConfig(currentConfig),
      filtersCollapsed: currentConfig.filtersCollapsed,
      multiFilter: currentConfig.filterMode === "multi",
      accountLabel: "Guest"
    });

    let authState = normalizeAuthState(null);
    let authRefreshPromise = null;

    async function handleAccountMenuAction(action) {
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

      if (!options.keepState) {
        state.query = "";
        state.activeFilters = [...nextConfig.defaultFilters];
      }

      shell.updateOptions({
        shellKind: nextConfig.shellKind,
        activeHref: nextConfig.activeHref,
        topbarLabel: nextConfig.topbarLabel,
        searchPlaceholder: nextConfig.searchPlaceholder,
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

    ensureData().then(() => {
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
