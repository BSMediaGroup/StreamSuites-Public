(() => {
  const MEDIA_NAV = [
    { href: "/media", label: "Home", icon: "/assets/icons/ui/home.svg", group: "main" },
    { href: "/clips", label: "Clips", icon: "/assets/icons/ui/clipcards.svg", group: "main" },
    { href: "/polls", label: "Polls", icon: "/assets/icons/ui/vote.svg", group: "main" },
    { href: "/scoreboards", label: "Scoreboards", icon: "/assets/icons/ui/tablechart.svg", group: "main" },
    { href: "/tallies", label: "Tallies", icon: "/assets/icons/ui/ballot.svg", group: "main" },
    { href: "/live", label: "Live", icon: "/assets/icons/ui/cast.svg", group: "main" },
    { href: "/community/index.html", label: "Community", icon: "/assets/icons/ui/community.svg", group: "main" },
    { href: "/support.html", label: "Support", icon: "/assets/icons/ui/support.svg", group: "quick" },
    { href: "/resources.html", label: "Resources", icon: "/assets/icons/ui/contactbook.svg", group: "quick" },
    { href: "/donate.html", label: "Donate", icon: "/assets/icons/ui/donate.svg", group: "quick" },
    { href: "/stats.html", label: "Statistics", icon: "/assets/icons/ui/statgraph.svg", group: "quick" },
    { href: "/about.html", label: "About", icon: "/assets/icons/ui/info.svg", group: "quick" }
  ];

  const COMMUNITY_NAV = [
    { href: "/community", label: "Home", icon: "/assets/icons/ui/home.svg", group: "main" },
    { href: "/community/members.html", label: "Members", icon: "/assets/icons/ui/profilecard.svg", group: "main" },
    { href: "/live", label: "Live", icon: "/assets/icons/ui/cast.svg", group: "main" },
    { href: "/community/notices.html", label: "Notices", icon: "/assets/icons/ui/campaign.svg", group: "main" },
    { href: "/community/settings.html", label: "Settings", icon: "/assets/icons/ui/cog.svg", group: "main" },
    { href: "/media", label: "Media", icon: "/assets/icons/ui/mediafill.svg", group: "main" },
    { href: "/support.html", label: "Support", icon: "/assets/icons/ui/support.svg", group: "quick" },
    { href: "/resources.html", label: "Resources", icon: "/assets/icons/ui/contactbook.svg", group: "quick" },
    { href: "/donate.html", label: "Donate", icon: "/assets/icons/ui/donate.svg", group: "quick" },
    { href: "/stats.html", label: "Statistics", icon: "/assets/icons/ui/statgraph.svg", group: "quick" },
    { href: "/about.html", label: "About", icon: "/assets/icons/ui/info.svg", group: "quick" }
  ];

  const SIDEBAR_STATE_KEY = "ss-public-sidebar-state";
  const FILTER_COLLAPSE_STATE_KEY = "ss-public-filters-collapsed";
  const SIDEBAR_STATES = Object.freeze({
    hidden: "hidden",
    icon: "icon",
    expanded: "expanded"
  });

  const MOBILE_MEDIA_QUERY = "(max-width: 920px)";
  const CURRENT_ORIGIN = String(window.location.origin || "").trim();
  const AUTH_API_BASE = /^https?:\/\//.test(CURRENT_ORIGIN) ? CURRENT_ORIGIN : "https://streamsuites.app";
  const AUTH_COMPLETE_URL = new URL("/public-auth-complete.html", AUTH_API_BASE).toString();
  const AUTH_OAUTH_LINKS = Object.freeze([
    { provider: "google", label: "Continue with Google", icon: "/assets/icons/google.svg", path: "/auth/login/google" },
    { provider: "github", label: "Continue with GitHub", icon: "/assets/icons/github.svg", path: "/auth/login/github" },
    { provider: "x", label: "Continue with X", icon: "/assets/icons/x.svg", path: "/auth/x/start" },
    { provider: "discord", label: "Continue with Discord", icon: "/assets/icons/discord.svg", path: "/auth/login/discord" },
    { provider: "twitch", label: "Continue with Twitch", icon: "/assets/icons/twitch.svg", path: "/oauth/twitch/start" }
  ]);
  const AUTH_ACCESS_STORAGE_KEY = "streamsuites.public.authAccessGate";
  const LOCKOUT_BANNER_STORAGE_KEY = "streamsuites.public.lockoutBanner.dismissed";
  const AUTH_ACCESS_CACHE_MS = 30000;
  const AUTH_ACCESS_FALLBACK_MESSAGES = Object.freeze({
    normal: "Authentication is operating normally.",
    maintenance: "Authentication is temporarily unavailable while maintenance is in progress.",
    development: "Authentication is temporarily limited while development access mode is active."
  });
  const ROLE_ICON_MAP = Object.freeze({
    admin: "/assets/icons/tierbadge-admin.svg",
    developer: "/assets/icons/dev-green.svg",
    founder: "/assets/icons/founder-gold.svg"
  });
  const TIER_ICON_MAP = Object.freeze({
    core: "/assets/icons/tierbadge-core.svg",
    gold: "/assets/icons/tierbadge-gold.svg",
    pro: "/assets/icons/tierbadge-pro.svg"
  });
  const ACCOUNT_BADGE_ICON_MAP = Object.freeze({
    ...ROLE_ICON_MAP,
    ...TIER_ICON_MAP
  });
  const UI_ICON_MAP = Object.freeze({
    menu: "/assets/icons/ui/sidebar.svg",
    hideVisible: "/assets/icons/ui/sidebarclose.svg",
    hideHidden: "/assets/icons/ui/sidebaropen.svg",
    close: "/assets/icons/ui/close.svg",
    info: "/assets/icons/ui/info.svg",
    profile: "/assets/icons/ui/profile.svg",
    search: "/assets/icons/ui/search.svg",
    filters: "/assets/icons/ui/filters.svg",
    cmd: "/assets/icons/ui/cmdkey.svg",
    layoutSide: "/assets/icons/ui/cards.svg",
    layoutStack: "/assets/icons/ui/tablechart.svg",
    check: "/assets/icons/ui/tickyes.svg"
  });

  function create(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (typeof text === "string") node.textContent = text;
    return node;
  }

  function createIcon(path, className = "icon-mask") {
    const icon = create("span", className);
    icon.setAttribute("aria-hidden", "true");
    icon.style.setProperty("--icon-mask", `url("${String(path || "").trim()}")`);
    return icon;
  }

  function setIconMask(icon, path) {
    if (!icon) return;
    icon.style.setProperty("--icon-mask", `url("${String(path || "").trim()}")`);
  }

  function normalizeCompactAccountBadges(badges = []) {
    const normalized = (Array.isArray(badges) ? badges : [])
      .map((badge) => {
        if (!badge || typeof badge !== "object") return null;
        const key = String(
          badge.key ||
          badge.icon_key ||
          badge.iconKey ||
          badge.value ||
          ""
        ).trim().toLowerCase();
        if (!ACCOUNT_BADGE_ICON_MAP[key]) return null;
        return {
          key,
          label: String(badge.label || badge.title || key).trim() || key,
        };
      })
      .filter(Boolean);

    const filtered = normalized.filter((badge) => badge?.key !== "founder");
    const roleBadge = filtered.find((badge) => badge.key === "admin" || badge.key === "developer");
    if (roleBadge) return [roleBadge];
    const tierBadge = filtered.find((badge) => ["core", "gold", "pro"].includes(badge.key));
    return tierBadge ? [tierBadge] : [];
  }

  function renderAccountAvatarFallback(accountAvatar) {
    if (!accountAvatar) return;
    accountAvatar.replaceChildren(createIcon(UI_ICON_MAP.profile, "account-avatar-icon"));
  }

  function fallbackAuthAccessMessage(mode) {
    return AUTH_ACCESS_FALLBACK_MESSAGES[mode] || AUTH_ACCESS_FALLBACK_MESSAGES.normal;
  }

  function normalizePassiveAccessState(payload, available = true) {
    const rawMode = typeof payload?.mode === "string" ? payload.mode.trim().toLowerCase() : "";
    const mode = rawMode === "maintenance" || rawMode === "development" ? rawMode : "normal";
    const gateActive = mode !== "normal";
    return {
      available,
      mode,
      gateActive,
      showLockoutBanner: gateActive && payload?.show_lockout_banner === true,
      message:
        typeof payload?.message === "string" && payload.message.trim()
          ? payload.message.trim()
          : fallbackAuthAccessMessage(mode)
    };
  }

  function buildLockoutBannerDismissKey(mode, message) {
    return `${String(mode || "normal").trim().toLowerCase()}::${String(message || "").trim()}`;
  }

  function readDismissedLockoutBannerKey() {
    try {
      return String(window.sessionStorage.getItem(LOCKOUT_BANNER_STORAGE_KEY) || "").trim();
    } catch (_err) {
      return "";
    }
  }

  function persistDismissedLockoutBannerKey(key) {
    if (!key) return;
    try {
      window.sessionStorage.setItem(LOCKOUT_BANNER_STORAGE_KEY, key);
    } catch (_err) {
      // Ignore session storage failures.
    }
  }

  function clearAuthAccessUnlockState() {
    try {
      window.sessionStorage.removeItem(AUTH_ACCESS_STORAGE_KEY);
    } catch (_err) {
      // Ignore session storage failures.
    }
  }

  function readAuthAccessUnlockState() {
    try {
      const raw = window.sessionStorage.getItem(AUTH_ACCESS_STORAGE_KEY);
      if (!raw) return { active: false, expiresAt: "" };
      const parsed = JSON.parse(raw);
      const expiresAt = typeof parsed?.expiresAt === "string" ? parsed.expiresAt.trim() : "";
      const expiresAtMs = Date.parse(expiresAt);
      if (!expiresAt || !Number.isFinite(expiresAtMs) || expiresAtMs <= Date.now()) {
        clearAuthAccessUnlockState();
        return { active: false, expiresAt: "" };
      }
      return { active: true, expiresAt };
    } catch (_err) {
      clearAuthAccessUnlockState();
      return { active: false, expiresAt: "" };
    }
  }

  function persistAuthAccessUnlockState(expiresAt) {
    if (typeof expiresAt !== "string" || !expiresAt.trim()) return;
    try {
      window.sessionStorage.setItem(
        AUTH_ACCESS_STORAGE_KEY,
        JSON.stringify({
          unlocked: true,
          expiresAt: expiresAt.trim()
        })
      );
    } catch (_err) {
      // Ignore session storage failures.
    }
  }

  function normalizeAuthAccessState(payload, available = true) {
    const rawMode = typeof payload?.mode === "string" ? payload.mode.trim().toLowerCase() : "";
    const mode = rawMode === "maintenance" || rawMode === "development" ? rawMode : "normal";
    const gateActive = mode !== "normal";
    const bypassEnabled = gateActive && payload?.bypass_enabled === true;
    const unlockState = bypassEnabled ? readAuthAccessUnlockState() : { active: false, expiresAt: "" };
    if (!gateActive || !bypassEnabled) {
      clearAuthAccessUnlockState();
    }
    return {
      available,
      mode,
      gateActive,
      showLockoutBanner: gateActive && payload?.show_lockout_banner === true,
      message:
        typeof payload?.message === "string" && payload.message.trim()
          ? payload.message.trim()
          : fallbackAuthAccessMessage(mode),
      bypassEnabled,
      bypassUnlocked: bypassEnabled && unlockState.active,
      unlockExpiresAt: unlockState.expiresAt
    };
  }

  async function parseAccessStateResponse(response) {
    if (!response.ok) {
      throw new Error(`access-state-${response.status}`);
    }
    const contentType = String(response.headers.get("content-type") || "").toLowerCase();
    if (!contentType.includes("application/json")) {
      throw new Error("access-state-non-json");
    }
    return response.json();
  }

  async function fetchPassiveAccessState(baseUrl) {
    try {
      const response = await fetch(new URL("/auth/access-state", baseUrl).toString(), {
        method: "GET",
        cache: "no-store",
        credentials: "include",
        redirect: "error",
        headers: {
          Accept: "application/json"
        }
      });
      const payload = await parseAccessStateResponse(response);
      return normalizePassiveAccessState(payload, true);
    } catch (_err) {
      return normalizePassiveAccessState(null, false);
    }
  }

  async function fetchAuthAccessState(baseUrl) {
    try {
      const response = await fetch(new URL("/auth/access-state", baseUrl).toString(), {
        method: "GET",
        cache: "no-store",
        credentials: "include",
        redirect: "error",
        headers: {
          Accept: "application/json"
        }
      });
      const payload = await parseAccessStateResponse(response);
      return normalizeAuthAccessState(payload, true);
    } catch (_err) {
      return normalizeAuthAccessState(null, false);
    }
  }

  async function unlockAuthAccessGate(baseUrl, code) {
    const response = await fetch(new URL("/auth/debug/unlock", baseUrl).toString(), {
      method: "POST",
      cache: "no-store",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ code })
    });

    let payload = null;
    try {
      payload = await response.json();
    } catch (_err) {
      payload = null;
    }

    if (!response.ok) {
      const error = new Error("unlock_failed");
      error.status = response.status;
      error.payload = payload;
      throw error;
    }

    const expiresAt = typeof payload?.expires_at === "string" ? payload.expires_at.trim() : "";
    if (expiresAt) {
      persistAuthAccessUnlockState(expiresAt);
    }

    return {
      ...normalizeAuthAccessState(
        {
          mode: payload?.mode,
          message: payload?.message,
          bypass_enabled: true
        },
        true
      ),
      bypassUnlocked: true,
      unlockExpiresAt: expiresAt
    };
  }

  function normalizePath(path) {
    if (!path) return "/";
    return path.endsWith("/") && path.length > 1 ? path.slice(0, -1) : path;
  }

  function isEditableTarget(target) {
    if (!(target instanceof Element)) return false;
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) {
      return true;
    }
    return target.closest("[contenteditable='true']") !== null;
  }

  function parseDetailId() {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get("id");
    if (fromQuery) return fromQuery;

    const pathname = normalizePath(window.location.pathname);
    const cleanPrefixes = ["/clips/", "/polls/", "/scores/"];
    for (const prefix of cleanPrefixes) {
      if (pathname.startsWith(prefix) && pathname.length > prefix.length) {
        return decodeURIComponent(pathname.slice(prefix.length));
      }
    }

    const hash = (window.location.hash || "").replace(/^#/, "").trim();
    if (!hash) return "";
    if (hash.includes("=")) {
      const hashParams = new URLSearchParams(hash);
      return hashParams.get("id") || "";
    }
    return decodeURIComponent(hash);
  }

  function readSidebarState() {
    try {
      const raw = window.localStorage.getItem(SIDEBAR_STATE_KEY);
      if (raw && Object.values(SIDEBAR_STATES).includes(raw)) {
        return raw;
      }
    } catch (_err) {
      // Ignore storage failures.
    }
    return "";
  }

  function writeSidebarState(state) {
    try {
      window.localStorage.setItem(SIDEBAR_STATE_KEY, state);
    } catch (_err) {
      // Ignore storage failures.
    }
  }

  function readFilterCollapsedState() {
    try {
      const raw = window.localStorage.getItem(FILTER_COLLAPSE_STATE_KEY);
      if (raw === "true") return true;
      if (raw === "false") return false;
    } catch (_err) {
      // Ignore storage failures.
    }
    return null;
  }

  function writeFilterCollapsedState(collapsed) {
    try {
      window.localStorage.setItem(FILTER_COLLAPSE_STATE_KEY, collapsed ? "true" : "false");
    } catch (_err) {
      // Ignore storage failures.
    }
  }

  function isMobileViewport() {
    return window.matchMedia(MOBILE_MEDIA_QUERY).matches;
  }

  function shellSubheading(shellKind) {
    return shellKind === "community" ? "COMMUNITY HUB" : "PUBLIC SURFACE";
  }

  function createSidebarLink(item, currentPath) {
    const link = create("a", "sidebar-link");
    link.href = item.href;
    link.dataset.navHref = item.href;

    const target = normalizePath(item.href);
    if (target === currentPath) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }

    const icon = create("span", "sidebar-icon");
    icon.appendChild(createIcon(item.icon || "/assets/icons/ui/portal.svg", "sidebar-icon-mask"));

    const text = create("span", "sidebar-text", item.label);
    link.append(icon, text);
    return link;
  }

  function createSidebarGroup(title, links) {
    const section = create("section", "sidebar-group");
    if (title) {
      section.appendChild(create("h2", "sidebar-group-title", title));
    }

    const nav = create("nav", "sidebar-nav");
    nav.setAttribute("aria-label", title || "Navigation");
    links.forEach((link) => nav.appendChild(link));
    section.appendChild(nav);
    return section;
  }

  function buildFooter() {
    const shell = create("div", "footer-shell");
    const status = create("div", "footer-status");
    status.setAttribute("data-status-slot", "");

    const bar = create("div", "footer-bar");

    const cluster = create("div", "footer-cluster");
    const links = create("div", "footer-links");
    links.append(
      Object.assign(create("a", "", "/support"), { href: "/support.html" }),
      Object.assign(create("a", "", "/donate"), { href: "/donate.html" }),
      Object.assign(create("a", "", "/privacy"), { href: "/privacy.html" }),
      Object.assign(create("a", "", "/about"), { href: "/about.html" })
    );

    cluster.appendChild(links);

    const meta = create("div", "footer-meta");
    const copyright = create("a", "footer-copyright", "© 2026 Brainstream Media Group");
    copyright.href = "https://brainstream.media";
    copyright.target = "_blank";
    copyright.rel = "noopener noreferrer";

    const tooltipContainer = create("span", "footer-version-tooltip-container");
    const versionLink = create("a", "footer-version", "Loading version…");
    versionLink.href = "/changelog";
    versionLink.setAttribute("aria-describedby", "footer-version-tooltip");

    const tooltip = create("div", "footer-version-tooltip");
    tooltip.id = "footer-version-tooltip";
    tooltip.setAttribute("role", "tooltip");

    const lineVersion = create("div", "footer-version-tooltip-line", "Loading version…");
    lineVersion.setAttribute("data-footer-version-tooltip", "version");
    const lineBuild = create("div", "footer-version-tooltip-line", "Build …");
    lineBuild.setAttribute("data-footer-version-tooltip", "build");
    const changelogLink = create("a", "footer-version-tooltip-link", "View changelog");
    changelogLink.href = "/changelog";

    tooltip.append(lineVersion, lineBuild, changelogLink);
    tooltipContainer.append(versionLink, tooltip);
    meta.append(copyright, tooltipContainer);

    bar.append(cluster, meta);
    shell.append(status, bar);
    return shell;
  }

  function mount(userOptions = {}) {
    const options = {
      rootSelector: "#public-app",
      shellKind: "media",
      activeHref: window.location.pathname,
      topbarLabel: "Media Gallery",
      searchPlaceholder: "Search",
      showSearch: true,
      showLockoutBanner: false,
      filters: [],
      filtersCollapsed: false,
      multiFilter: false,
      accountLabel: "Guest",
      accountAvatar: "",
      accountBadges: [],
      accountAuthenticated: false,
      accountMenuItems: [],
      ...userOptions
    };

    const callbacks = {
      onSearch: typeof options.onSearch === "function" ? options.onSearch : null,
      onFilter: typeof options.onFilter === "function" ? options.onFilter : null,
      onAccountLogin: typeof options.onAccountLogin === "function" ? options.onAccountLogin : null,
      onAccountMenuAction: typeof options.onAccountMenuAction === "function" ? options.onAccountMenuAction : null
    };

    const root = document.querySelector(options.rootSelector);
    if (!root) {
      throw new Error("Missing shell root element");
    }

    document.body.classList.remove("public-standalone-page", "modal-open");
    document.body.classList.add("public-shell-page");

    root.innerHTML = "";
    const bg = create("div", "public-shell-bg");

    const layout = create("div", "public-shell-root");
    layout.dataset.sidebarState = SIDEBAR_STATES.expanded;

    const sidebar = create("aside", "public-sidebar");
    sidebar.setAttribute("aria-label", "Public navigation");

    const sidebarTop = create("div", "sidebar-top");
    const brand = create("a", "sidebar-brand");
    brand.href = "/";
    const logo = create("img");
    logo.src = "/assets/logos/logo.png";
    logo.alt = "StreamSuites";
    const labels = create("span", "sidebar-brand-label");
    const brandSubheading = create("span", "sidebar-brand-subheading");
    const brandSubheadingText = create("span", "sidebar-brand-subheading-text", shellSubheading(options.shellKind));
    brandSubheading.appendChild(brandSubheadingText);
    labels.append(
      create("span", "sidebar-brand-title", "StreamSuites™"),
      brandSubheading
    );
    brand.append(logo, labels);
    sidebarTop.append(brand);

    const sidebarScroll = create("div", "sidebar-scroll");

    sidebar.append(sidebarTop, sidebarScroll);

    const main = create("div", "public-main");

    const topbar = create("header", "public-topbar");

    const topbarMain = create("div", "topbar-main");
    const topbarLeft = create("div", "topbar-left");

    const modeBtn = create("button", "topbar-menu-btn");
    modeBtn.type = "button";
    modeBtn.setAttribute("aria-label", "Toggle sidebar size");
    const modeBtnIcon = createIcon(UI_ICON_MAP.menu, "topbar-btn-icon");
    modeBtn.appendChild(modeBtnIcon);

    const hideBtn = create("button", "topbar-hide-btn");
    hideBtn.type = "button";
    hideBtn.setAttribute("aria-label", "Hide sidebar");
    const hideBtnIcon = createIcon(UI_ICON_MAP.hideVisible, "topbar-btn-icon");
    hideBtn.appendChild(hideBtnIcon);

    const topbarTitle = create("span", "topbar-title", options.topbarLabel || "Media Gallery");
    topbarLeft.append(modeBtn, hideBtn, topbarTitle);

    const topbarCenter = create("div", "topbar-center");
    const searchShell = create("label", "search-shell");
    const searchIcon = create("span", "search-icon");
    searchIcon.appendChild(createIcon(UI_ICON_MAP.search, "search-icon-mask"));
    const searchInput = create("input");
    searchInput.type = "search";
    searchInput.placeholder = options.searchPlaceholder || "Search";
    searchInput.setAttribute("data-shell-search", "");
    const searchHint = create("span", "search-kbd-hint");
    const searchCmdHint = create("span", "search-kbd-key");
    searchCmdHint.appendChild(createIcon(UI_ICON_MAP.cmd, "search-kbd-cmd-icon"));
    const searchKeyHint = create("kbd", "", "K");
    searchHint.append(searchCmdHint, searchKeyHint);
    searchShell.append(searchIcon, searchInput, searchHint);
    topbarCenter.appendChild(searchShell);

    const topbarRight = create("div", "topbar-right");
    const accountWidget = create("div", "account-widget ss-no-profile-hover");
    accountWidget.setAttribute("data-ss-profile-hover", "off");
    const account = create("button", "account-pill account-trigger");
    account.type = "button";
    account.setAttribute("aria-haspopup", "menu");
    account.setAttribute("aria-expanded", "false");
    const accountAvatar = create("span", "account-avatar");
    const accountText = create("span", "account-text");
    const accountName = create("span", "account-name", options.accountLabel || "Guest");
    const accountBadges = create("span", "account-badges");
    accountText.append(accountName, accountBadges);
    account.append(accountAvatar, accountText);

    const accountMenu = create("div", "account-menu");
    accountMenu.hidden = true;
    accountMenu.setAttribute("role", "menu");

    accountWidget.append(account, accountMenu);
    topbarRight.appendChild(accountWidget);

    topbarMain.append(topbarLeft, topbarCenter, topbarRight);

    const filterToggle = create("button", "filter-toggle");
    filterToggle.type = "button";
    filterToggle.setAttribute("aria-label", "Show filters");
    filterToggle.setAttribute("aria-expanded", "false");
    filterToggle.setAttribute("aria-controls", "public-filter-row");
    filterToggle.title = "Toggle filters";
    filterToggle.appendChild(createIcon(UI_ICON_MAP.filters, "filter-toggle-icon"));
    topbarLeft.appendChild(filterToggle);

    const filterDock = create("div", "filter-dock");
    const filterRowWrap = create("div", "filter-row-wrap");
    filterRowWrap.id = "public-filter-row";

    const filterRow = create("div", "filter-row");
    filterRow.setAttribute("data-shell-filters", "");
    filterRowWrap.appendChild(filterRow);

    filterDock.append(filterRowWrap);

    const loadingBar = create("div", "shell-loading");
    loadingBar.setAttribute("aria-hidden", "true");
    loadingBar.append(create("div", "shell-loading-track"), create("div", "shell-loading-bar"));

    topbar.append(topbarMain, filterDock);

    const pageBanner = create("section", "public-lockout-banner");
    pageBanner.hidden = true;
    pageBanner.setAttribute("aria-live", "polite");
    const pageBannerBody = create("div", "public-lockout-banner__body");
    const pageBannerMeta = create("div", "public-lockout-banner__meta");
    const pageBannerEyebrow = create("span", "public-lockout-banner__eyebrow");
    pageBannerEyebrow.append(
      createIcon(UI_ICON_MAP.info, "public-lockout-banner__eyebrow-icon"),
      create("span", "", "ACCESS NOTICE")
    );
    pageBannerMeta.append(
      pageBannerEyebrow,
      create("p", "public-lockout-banner__message")
    );
    const pageBannerClose = create("button", "public-lockout-banner__close");
    pageBannerClose.type = "button";
    pageBannerClose.setAttribute("aria-label", "Dismiss access notice");
    pageBannerClose.appendChild(createIcon(UI_ICON_MAP.close, "public-lockout-banner__close-icon"));
    pageBannerBody.append(pageBannerMeta, pageBannerClose);
    pageBanner.appendChild(pageBannerBody);

    const content = create("main", "public-content");
    content.id = "public-content";

    const footer = buildFooter();

    main.append(topbar, loadingBar, pageBanner, content);
    layout.append(sidebar, main, footer);
    root.append(bg, layout);

    function syncLockoutBannerOffset() {
      const topbarHeight = Math.max(52, Math.ceil(topbar.getBoundingClientRect().height || topbar.offsetHeight || 0));
      main.style.setProperty("--ps-lockout-banner-offset", `${topbarHeight}px`);
    }

    syncLockoutBannerOffset();
    if (typeof ResizeObserver === "function") {
      const topbarObserver = new ResizeObserver(() => {
        syncLockoutBannerOffset();
      });
      topbarObserver.observe(topbar);
    } else {
      window.addEventListener("resize", syncLockoutBannerOffset);
    }

    const authBackdrop = create("div", "auth-modal-backdrop");
    authBackdrop.setAttribute("aria-hidden", "true");
    authBackdrop.innerHTML = `
      <div class="auth-modal" role="dialog" aria-modal="true" aria-labelledby="public-auth-modal-title" data-state="login">
        <button class="auth-modal-close" type="button" aria-label="Close"><span class="auth-modal-close-icon" aria-hidden="true"></span></button>
        <div class="auth-modal-header">
          <p class="auth-modal-eyebrow">Public access</p>
          <h2 id="public-auth-modal-title" class="auth-modal-title">
            <img src="/assets/logos/pubcon.webp" alt="StreamSuites logo" />
            <span data-auth-title-text>Log in to StreamSuites™</span>
          </h2>
          <p class="auth-modal-subtitle" data-auth-subtitle>Use OAuth to continue.</p>
          <section class="ss-auth-access-gate" data-auth-access-gate hidden>
            <div class="ss-auth-access-gate__summary">
              <p class="ss-auth-access-gate__message" data-auth-access-message></p>
              <button
                class="ss-auth-access-gate__toggle"
                type="button"
                data-auth-access-toggle
                aria-expanded="false"
                aria-controls="public-auth-access-form"
                aria-label="Unlock temporary auth access"
                hidden
              >
                <span class="ss-auth-access-gate__icon" aria-hidden="true"></span>
              </button>
            </div>
            <form id="public-auth-access-form" class="ss-auth-access-gate__form" data-auth-access-form hidden novalidate>
              <label class="ss-auth-access-gate__label" for="public-auth-access-code">Access code</label>
              <input
                id="public-auth-access-code"
                class="ss-auth-access-gate__input"
                type="password"
                autocomplete="current-password"
                spellcheck="false"
                data-auth-access-input
              />
              <button class="ss-auth-access-gate__submit" type="submit" data-auth-access-submit>Unlock</button>
            </form>
            <p class="ss-auth-access-gate__feedback" data-auth-access-feedback hidden></p>
          </section>
        </div>
        <div class="auth-panel" data-state="login"></div>
        <div class="auth-panel" data-state="signup"></div>
      </div>
    `;
    root.appendChild(authBackdrop);
    const authModal = authBackdrop.querySelector(".auth-modal");
    const authTitle = authBackdrop.querySelector("[data-auth-title-text]");
    const authSubtitle = authBackdrop.querySelector("[data-auth-subtitle]");
    const authClose = authBackdrop.querySelector(".auth-modal-close");
    const authCloseIcon = authBackdrop.querySelector(".auth-modal-close-icon");
    const authAccessGate = authBackdrop.querySelector("[data-auth-access-gate]");
    const authAccessMessage = authBackdrop.querySelector("[data-auth-access-message]");
    const authAccessToggle = authBackdrop.querySelector("[data-auth-access-toggle]");
    const authAccessForm = authBackdrop.querySelector("[data-auth-access-form]");
    const authAccessInput = authBackdrop.querySelector("[data-auth-access-input]");
    const authAccessSubmit = authBackdrop.querySelector("[data-auth-access-submit]");
    const authAccessFeedback = authBackdrop.querySelector("[data-auth-access-feedback]");
    const pageBannerMessage = pageBanner.querySelector(".public-lockout-banner__message");
    if (authCloseIcon) {
      authCloseIcon.style.setProperty("--icon-mask", `url("${UI_ICON_MAP.close}")`);
    }
    const authPanels = Array.from(authBackdrop.querySelectorAll(".auth-panel"));
    let authAccessState = normalizeAuthAccessState(null, false);
    let authAccessLoadedAt = 0;
    let authAccessPromise = null;
    let authAccessFormOpen = false;
    let pageBannerAccessState = normalizePassiveAccessState(null, false);
    let pageBannerAccessLoadedAt = 0;
    let pageBannerAccessPromise = null;

    function isAuthAccessBlocked() {
      return authAccessState.gateActive && !authAccessState.bypassUnlocked;
    }

    function setAuthAccessFeedback(message, tone) {
      if (!authAccessFeedback) return;
      const text = typeof message === "string" ? message.trim() : "";
      authAccessFeedback.hidden = !text;
      authAccessFeedback.textContent = text;
      authAccessFeedback.dataset.tone = tone || "";
    }

    function setAuthAccessFormOpen(open) {
      authAccessFormOpen = Boolean(
        open && authAccessState.gateActive && authAccessState.bypassEnabled && !authAccessState.bypassUnlocked
      );
      if (authAccessForm) {
        authAccessForm.hidden = !authAccessFormOpen;
      }
      if (authAccessToggle) {
        authAccessToggle.setAttribute("aria-expanded", authAccessFormOpen ? "true" : "false");
        authAccessToggle.classList.toggle("is-active", authAccessFormOpen);
      }
      if (authAccessFormOpen && authAccessInput instanceof HTMLInputElement) {
        window.setTimeout(() => authAccessInput.focus(), 0);
      }
    }

    function syncLockoutBannerUi() {
      const bannerKey = buildLockoutBannerDismissKey(pageBannerAccessState.mode, pageBannerAccessState.message);
      const shouldShow =
        options.showLockoutBanner === true &&
        pageBannerAccessState.gateActive &&
        pageBannerAccessState.showLockoutBanner === true &&
        Boolean(pageBannerAccessState.message) &&
        readDismissedLockoutBannerKey() !== bannerKey;

      pageBanner.hidden = !shouldShow;
      if (pageBannerMessage) {
        pageBannerMessage.textContent = shouldShow ? pageBannerAccessState.message : "";
      }
      pageBanner.dataset.mode = shouldShow ? pageBannerAccessState.mode : "";
      pageBanner.dataset.bannerKey = shouldShow ? bannerKey : "";
    }

    function syncAuthAccessUi() {
      if (authAccessGate) {
        authAccessGate.hidden = !authAccessState.gateActive;
        authAccessGate.classList.toggle("is-unlocked", authAccessState.bypassUnlocked);
      }
      if (authAccessMessage) {
        authAccessMessage.textContent = authAccessState.gateActive ? authAccessState.message : "";
      }
      if (authAccessToggle instanceof HTMLButtonElement) {
        authAccessToggle.hidden = !(authAccessState.gateActive && authAccessState.bypassEnabled);
      }
      if (!authAccessState.gateActive || !authAccessState.bypassEnabled || authAccessState.bypassUnlocked) {
        setAuthAccessFormOpen(false);
      } else if (authAccessForm) {
        authAccessForm.hidden = !authAccessFormOpen;
      }

      authBackdrop.querySelectorAll("[data-auth-gate-action]").forEach((action) => {
        action.classList.toggle("is-disabled", isAuthAccessBlocked());
        action.setAttribute("aria-disabled", isAuthAccessBlocked() ? "true" : "false");
      });
    }

    async function loadPageBannerAccessState(force = false) {
      const shouldUseCache =
        !force &&
        pageBannerAccessLoadedAt > 0 &&
        Date.now() - pageBannerAccessLoadedAt < AUTH_ACCESS_CACHE_MS;
      if (shouldUseCache) {
        syncLockoutBannerUi();
        return pageBannerAccessState;
      }
      if (pageBannerAccessPromise) return pageBannerAccessPromise;

      pageBannerAccessPromise = fetchPassiveAccessState(AUTH_API_BASE)
        .then((nextState) => {
          pageBannerAccessState = nextState;
          pageBannerAccessLoadedAt = Date.now();
          syncLockoutBannerUi();
          return pageBannerAccessState;
        })
        .finally(() => {
          pageBannerAccessPromise = null;
        });

      return pageBannerAccessPromise;
    }

    async function loadModalAuthAccessState(force = false) {
      const shouldUseCache =
        !force &&
        authAccessLoadedAt > 0 &&
        Date.now() - authAccessLoadedAt < AUTH_ACCESS_CACHE_MS;
      if (shouldUseCache) {
        syncAuthAccessUi();
        return authAccessState;
      }
      if (authAccessPromise) return authAccessPromise;

      authAccessPromise = fetchAuthAccessState(AUTH_API_BASE)
        .then((nextState) => {
          authAccessState = nextState;
          authAccessLoadedAt = Date.now();
          syncAuthAccessUi();
          return authAccessState;
        })
        .finally(() => {
          authAccessPromise = null;
        });

      return authAccessPromise;
    }

    function buildAuthPanel(mode) {
      const panel = authBackdrop.querySelector(`.auth-panel[data-state="${mode}"]`);
      if (!panel) return;
      panel.innerHTML = "";

      const oauthGrid = create("div", "auth-oauth-grid");
      AUTH_OAUTH_LINKS.forEach((entry) => {
        const endpoint = new URL(entry.path, AUTH_API_BASE);
        endpoint.searchParams.set("surface", "public");
        endpoint.searchParams.set("login_intent", "public");
        endpoint.searchParams.set("return_to", `${AUTH_COMPLETE_URL}?return_to=${encodeURIComponent(window.location.href)}`);
        const link = create("a", "auth-oauth-button", entry.label);
        link.href = endpoint.toString();
        link.dataset.authGateAction = "true";
        const icon = create("img");
        icon.src = entry.icon;
        icon.alt = "";
        link.addEventListener("click", async (event) => {
          event.preventDefault();
          const nextState = await loadModalAuthAccessState(false);
          if (nextState.gateActive && !nextState.bypassUnlocked) {
            if (nextState.bypassEnabled) {
              setAuthAccessFormOpen(true);
            }
            return;
          }
          window.location.assign(link.href);
        });
        link.prepend(icon);
        oauthGrid.appendChild(link);
      });
      panel.appendChild(oauthGrid);

      const methodsToggle = create("div", "auth-toggle");
      const methodLink = create("a", "", "Use email/password");
      methodLink.href = `/public-login.html?return_to=${encodeURIComponent(window.location.href)}&auth=${mode}`;
      methodLink.dataset.authGateAction = "true";
      methodLink.addEventListener("click", async (event) => {
        event.preventDefault();
        const nextState = await loadModalAuthAccessState(false);
        if (nextState.gateActive && !nextState.bypassUnlocked) {
          if (nextState.bypassEnabled) {
            setAuthAccessFormOpen(true);
          }
          return;
        }
        window.location.assign(methodLink.href);
      });
      methodsToggle.appendChild(methodLink);
      panel.appendChild(methodsToggle);

      const legal = create("p", "auth-legal muted");
      legal.innerHTML = `By continuing, you agree to the <a href="/terms.html">Terms of Service</a> and acknowledge the <a href="/privacy.html">Privacy page</a>.`;
      panel.appendChild(legal);

      const swap = create("div", "auth-toggle");
      if (mode === "login") {
        swap.innerHTML = `Need an account? <button type="button" data-auth-toggle="signup">Sign up</button>`;
      } else {
        swap.innerHTML = `Already have an account? <button type="button" data-auth-toggle="login">Log in</button>`;
      }
      panel.appendChild(swap);
    }

    buildAuthPanel("login");
    buildAuthPanel("signup");

    function setAuthModalState(state) {
      const next = state === "signup" ? "signup" : "login";
      if (authModal) {
        authModal.dataset.state = next;
      }
      if (authTitle) {
        authTitle.textContent = next === "signup" ? "Sign up to StreamSuites™" : "Log in to StreamSuites™";
      }
      if (authSubtitle) {
        authSubtitle.textContent = next === "signup" ? "Create your public account." : "Use OAuth to continue.";
      }
      authPanels.forEach((panel) => {
        panel.hidden = panel.getAttribute("data-state") !== next;
      });
    }

    function openAuthModal(state = "login") {
      setAuthModalState(state);
      authBackdrop.classList.add("is-open");
      authBackdrop.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
      void loadModalAuthAccessState(true);
    }

    function closeAuthModal() {
      authBackdrop.classList.remove("is-open");
      authBackdrop.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");
    }

    authClose?.addEventListener("click", closeAuthModal);
    authBackdrop.addEventListener("click", (event) => {
      if (event.target === authBackdrop) closeAuthModal();
    });
    authBackdrop.addEventListener("click", (event) => {
      const toggle = event.target.closest("[data-auth-toggle]");
      if (!toggle) return;
      const state = String(toggle.getAttribute("data-auth-toggle") || "login");
      setAuthModalState(state);
    });

    authAccessToggle?.addEventListener("click", () => {
      setAuthAccessFeedback("", "");
      setAuthAccessFormOpen(!authAccessFormOpen);
    });

    pageBannerClose.addEventListener("click", () => {
      const dismissKey = String(pageBanner.dataset.bannerKey || "").trim();
      if (!dismissKey) return;
      persistDismissedLockoutBannerKey(dismissKey);
      syncLockoutBannerUi();
    });

    authAccessForm?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const code = authAccessInput instanceof HTMLInputElement ? authAccessInput.value.trim() : "";
      if (!code) {
        setAuthAccessFeedback("Enter the access code.", "error");
        return;
      }
      if (authAccessSubmit instanceof HTMLButtonElement) {
        authAccessSubmit.disabled = true;
        authAccessSubmit.textContent = "Unlocking...";
      }
      setAuthAccessFeedback("", "");
      try {
        authAccessState = await unlockAuthAccessGate(AUTH_API_BASE, code);
        authAccessLoadedAt = Date.now();
        if (authAccessInput instanceof HTMLInputElement) {
          authAccessInput.value = "";
        }
        setAuthAccessFormOpen(false);
        setAuthAccessFeedback("Access unlocked.", "success");
        syncAuthAccessUi();
      } catch (error) {
        const message =
          error?.status === 403
            ? "Invalid access code."
            : error?.status === 429
              ? "Too many attempts. Please wait and try again."
              : "Unlock is unavailable right now.";
        setAuthAccessFeedback(message, "error");
      } finally {
        if (authAccessSubmit instanceof HTMLButtonElement) {
          authAccessSubmit.disabled = false;
          authAccessSubmit.textContent = "Unlock";
        }
      }
    });

    let lastVisibleSidebarState = SIDEBAR_STATES.expanded;
    const storedSidebarState = readSidebarState();
    let useAutoSidebarState = !storedSidebarState;

    function setAccountIdentity(label, avatarUrl, badges = []) {
      const nextLabel = (label || "Guest").trim() || "Guest";
      accountName.textContent = nextLabel;
      accountBadges.innerHTML = "";

      normalizeCompactAccountBadges(badges).forEach((badge) => {
        const icon = create("img", "account-badge-icon");
        icon.src = ACCOUNT_BADGE_ICON_MAP[badge.key];
        if (!icon.src) return;
        icon.alt = badge.label || badge.key;
        accountBadges.appendChild(icon);
      });

      if (avatarUrl) {
        accountAvatar.replaceChildren();
        accountAvatar.classList.add("has-image");
        accountAvatar.style.backgroundImage = `url(${avatarUrl})`;
        accountAvatar.style.backgroundSize = "cover";
        accountAvatar.style.backgroundPosition = "center";
        return;
      }

      accountAvatar.classList.remove("has-image");
      accountAvatar.style.backgroundImage = "";
      renderAccountAvatarFallback(accountAvatar);
    }

    function closeAccountMenu() {
      accountMenu.hidden = true;
      account.classList.remove("is-open");
      account.setAttribute("aria-expanded", "false");
    }

    function openAccountMenu() {
      if (!Array.isArray(options.accountMenuItems) || !options.accountMenuItems.length) {
        closeAccountMenu();
        return;
      }
      accountMenu.hidden = false;
      account.classList.add("is-open");
      account.setAttribute("aria-expanded", "true");
    }

    function setAccountMenuItems(items = []) {
      options.accountMenuItems = Array.isArray(items) ? items.slice() : [];
      accountMenu.innerHTML = "";
      if (options.accountAuthenticated) {
        const header = create("div", "account-menu-header");
        const roleChip = (options.accountBadges || []).find((badge) => String(badge?.kind || "") === "role-chip");
        header.append(
          create("div", "account-menu-name", accountName.textContent || "User"),
          create("div", "account-menu-role", String(roleChip?.label || "").trim())
        );
        accountMenu.appendChild(header);
      }

      options.accountMenuItems.forEach((item) => {
        if (!item || typeof item !== "object") return;
        if (item.separator) {
          accountMenu.appendChild(create("div", "account-menu-separator"));
          return;
        }
        const label = String(item.label || "").trim();
        if (!label) return;

        if (item.href) {
          const link = create("a", "account-menu-item", label);
          link.href = String(item.href);
          link.setAttribute("role", "menuitem");
          if (item.target) link.target = String(item.target);
          if (item.rel) link.rel = String(item.rel);
          link.addEventListener("click", () => {
            closeAccountMenu();
            if (typeof callbacks.onAccountMenuAction === "function") {
              callbacks.onAccountMenuAction(String(item.action || ""), item);
            }
          });
          accountMenu.appendChild(link);
          return;
        }

        const button = create("button", "account-menu-item", label);
        button.type = "button";
        button.setAttribute("role", "menuitem");
        if (item.subtle) button.classList.add("is-subtle");
        if (String(item.action || "").toLowerCase() === "logout") {
          button.classList.add("is-danger");
        }
        button.addEventListener("click", () => {
          closeAccountMenu();
          if (typeof callbacks.onAccountMenuAction === "function") {
            callbacks.onAccountMenuAction(String(item.action || ""), item);
          }
        });
        accountMenu.appendChild(button);
      });
    }

    function setAccountAuthenticated(authenticated) {
      options.accountAuthenticated = Boolean(authenticated);
      account.classList.toggle("is-authenticated", options.accountAuthenticated);
      if (!options.accountAuthenticated) {
        account.classList.remove("is-authenticated");
      }
    }

    function setAccountState(next = {}) {
      if (typeof next.accountLabel === "string") {
        options.accountLabel = next.accountLabel;
      }
      if (typeof next.accountAvatar === "string") {
        options.accountAvatar = next.accountAvatar;
      }
      if (Array.isArray(next.accountBadges)) {
        options.accountBadges = next.accountBadges.slice();
      }
      if (typeof next.accountAuthenticated === "boolean") {
        options.accountAuthenticated = next.accountAuthenticated;
      }
      if (Array.isArray(next.accountMenuItems)) {
        options.accountMenuItems = next.accountMenuItems.slice();
      }
      setAccountIdentity(options.accountLabel, options.accountAvatar, options.accountBadges);
      setAccountAuthenticated(options.accountAuthenticated);
      setAccountMenuItems(options.accountMenuItems);
    }

    function setSidebarState(nextState, persist = true) {
      const state = Object.values(SIDEBAR_STATES).includes(nextState) ? nextState : SIDEBAR_STATES.expanded;
      layout.dataset.sidebarState = state;

      if (state !== SIDEBAR_STATES.hidden) {
        lastVisibleSidebarState = state;
      }

      modeBtn.setAttribute("aria-label", state === SIDEBAR_STATES.expanded ? "Collapse sidebar" : "Expand sidebar");
      hideBtn.setAttribute("aria-label", state === SIDEBAR_STATES.hidden ? "Show sidebar" : "Hide sidebar");
      hideBtn.classList.toggle("is-hidden-state", state === SIDEBAR_STATES.hidden);
      setIconMask(modeBtnIcon, UI_ICON_MAP.menu);
      setIconMask(hideBtnIcon, state === SIDEBAR_STATES.hidden ? UI_ICON_MAP.hideHidden : UI_ICON_MAP.hideVisible);

      if (persist) {
        useAutoSidebarState = false;
        writeSidebarState(state);
      }
    }

    function renderSidebarNav(shellKind, activeHref) {
      const navItems = shellKind === "community" ? COMMUNITY_NAV : MEDIA_NAV;
      const currentPath = normalizePath(activeHref || window.location.pathname);

      const mainLinks = [];
      const quickLinks = [];

      navItems.forEach((item) => {
        const link = createSidebarLink(item, currentPath);
        if (item.group === "quick") {
          quickLinks.push(link);
        } else {
          mainLinks.push(link);
        }
      });

      sidebarScroll.innerHTML = "";
      if (mainLinks.length) {
        sidebarScroll.appendChild(createSidebarGroup("", mainLinks));
      }

      if (quickLinks.length) {
        sidebarScroll.appendChild(createSidebarGroup("Quicklinks", quickLinks));
      }
    }

    function setActiveNav(href) {
      const currentPath = normalizePath(href || window.location.pathname);
      sidebarScroll.querySelectorAll("a.sidebar-link").forEach((link) => {
        const target = normalizePath(link.dataset.navHref || link.getAttribute("href") || "");
        const active = target === currentPath;
        link.classList.toggle("active", active);
        if (active) {
          link.setAttribute("aria-current", "page");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    }

    let hasPersistedFilterPreference = false;
    let filterCollapsed = Boolean(options.filtersCollapsed);

    function setFilterCollapsed(collapsed, { persist = false } = {}) {
      const hasFilters = filterRow.childElementCount > 0;
      const nextCollapsed = hasFilters ? Boolean(collapsed) : true;
      filterCollapsed = nextCollapsed;
      options.filtersCollapsed = nextCollapsed;
      filterDock.classList.toggle("is-empty", !hasFilters);
      filterDock.classList.toggle("is-collapsed", nextCollapsed || !hasFilters);
      filterToggle.classList.toggle("is-collapsed", nextCollapsed);
      filterToggle.setAttribute("aria-expanded", String(!nextCollapsed));
      filterToggle.setAttribute("aria-label", nextCollapsed ? "Show filters" : "Hide filters");
      filterToggle.disabled = !hasFilters;
      filterToggle.hidden = !hasFilters;
      filterRowWrap.setAttribute("aria-hidden", String(nextCollapsed || !hasFilters));
      if (persist && hasFilters) {
        writeFilterCollapsedState(nextCollapsed);
        hasPersistedFilterPreference = true;
      }
    }

    function setSearchVisible(visible) {
      const show = visible !== false;
      options.showSearch = show;
      topbar.classList.toggle("search-hidden", !show);
      topbarCenter.hidden = !show;
      searchShell.hidden = !show;
      if (!show) {
        searchInput.value = "";
        root.dispatchEvent(new CustomEvent("public-shell:search", { detail: { query: "" } }));
      }
    }

    function setFilterOptions(filters, multiFilter) {
      filterRow.innerHTML = "";
      const chips = Array.isArray(filters) ? filters : [];

      chips.forEach((chip) => {
        const button = create("button", "filter-chip", chip.label);
        button.type = "button";
        button.dataset.filter = chip.value;
        const isActive = Boolean(chip.active);
        button.classList.toggle("active", isActive);
        button.setAttribute("aria-pressed", isActive ? "true" : "false");
        filterRow.appendChild(button);
      });

      options.filters = chips;
      options.multiFilter = Boolean(multiFilter);
      setFilterCollapsed(filterCollapsed, { persist: false });
    }

    function getSidebarState() {
      return layout.dataset.sidebarState || SIDEBAR_STATES.expanded;
    }

    function toggleSidebarMode() {
      const current = getSidebarState();
      if (current === SIDEBAR_STATES.expanded) {
        setSidebarState(SIDEBAR_STATES.icon, true);
        return;
      }
      if (current === SIDEBAR_STATES.icon) {
        setSidebarState(SIDEBAR_STATES.expanded, true);
        return;
      }
      setSidebarState(lastVisibleSidebarState || SIDEBAR_STATES.icon, true);
    }

    function toggleSidebarVisibility() {
      const current = getSidebarState();
      if (current === SIDEBAR_STATES.hidden) {
        setSidebarState(lastVisibleSidebarState || SIDEBAR_STATES.icon, true);
        return;
      }
      const nextVisible = current === SIDEBAR_STATES.expanded ? SIDEBAR_STATES.expanded : SIDEBAR_STATES.icon;
      lastVisibleSidebarState = nextVisible;
      setSidebarState(SIDEBAR_STATES.hidden, true);
    }

    function setLoading(active) {
      const isActive = Boolean(active);
      loadingBar.classList.toggle("is-active", isActive);
      loadingBar.setAttribute("aria-hidden", isActive ? "false" : "true");
      content.setAttribute("aria-busy", isActive ? "true" : "false");
    }

    function updateOptions(next = {}) {
      if (!next || typeof next !== "object") return;

      const nextShellKind = next.shellKind || options.shellKind;
      const nextActiveHref = next.activeHref || options.activeHref;

      if (nextShellKind !== options.shellKind || nextActiveHref !== options.activeHref) {
        options.shellKind = nextShellKind;
        options.activeHref = nextActiveHref;
        brandSubheadingText.textContent = shellSubheading(options.shellKind);
        renderSidebarNav(options.shellKind, options.activeHref);
      } else if (next.activeHref) {
        options.activeHref = next.activeHref;
        setActiveNav(options.activeHref);
      }

      if (typeof next.topbarLabel === "string") {
        options.topbarLabel = next.topbarLabel;
        topbarTitle.textContent = next.topbarLabel;
      }

      if (typeof next.searchPlaceholder === "string") {
        options.searchPlaceholder = next.searchPlaceholder;
        searchInput.placeholder = next.searchPlaceholder;
      }

      if (typeof next.showSearch === "boolean") {
        setSearchVisible(next.showSearch);
      }

      if (typeof next.showLockoutBanner === "boolean") {
        options.showLockoutBanner = next.showLockoutBanner;
        syncLockoutBannerUi();
        if (options.showLockoutBanner) {
          void loadPageBannerAccessState(false);
        }
      }

      if (Array.isArray(next.filters) || typeof next.multiFilter === "boolean") {
        setFilterOptions(Array.isArray(next.filters) ? next.filters : options.filters, next.multiFilter ?? options.multiFilter);
      }

      if (typeof next.filtersCollapsed === "boolean" && !hasPersistedFilterPreference) {
        options.filtersCollapsed = next.filtersCollapsed;
        setFilterCollapsed(next.filtersCollapsed, { persist: false });
      }

      if (
        typeof next.accountLabel === "string" ||
        typeof next.accountAvatar === "string" ||
        Array.isArray(next.accountBadges) ||
        typeof next.accountAuthenticated === "boolean" ||
        Array.isArray(next.accountMenuItems)
      ) {
        setAccountState(next);
      }

      if (typeof next.onSearch === "function" || next.onSearch === null) {
        callbacks.onSearch = typeof next.onSearch === "function" ? next.onSearch : null;
      }

      if (typeof next.onFilter === "function" || next.onFilter === null) {
        callbacks.onFilter = typeof next.onFilter === "function" ? next.onFilter : null;
      }

      if (typeof next.onAccountLogin === "function" || next.onAccountLogin === null) {
        callbacks.onAccountLogin = typeof next.onAccountLogin === "function" ? next.onAccountLogin : null;
      }

      if (typeof next.onAccountMenuAction === "function" || next.onAccountMenuAction === null) {
        callbacks.onAccountMenuAction = typeof next.onAccountMenuAction === "function" ? next.onAccountMenuAction : null;
      }
    }

    modeBtn.addEventListener("click", () => {
      toggleSidebarMode();
    });

    hideBtn.addEventListener("click", () => {
      toggleSidebarVisibility();
    });

    searchInput.addEventListener("input", () => {
      const detail = { query: searchInput.value.trim() };
      root.dispatchEvent(new CustomEvent("public-shell:search", { detail }));
      if (typeof callbacks.onSearch === "function") callbacks.onSearch(detail.query);
    });

    filterToggle.addEventListener("click", () => {
      if (filterToggle.disabled) return;
      setFilterCollapsed(!filterCollapsed, { persist: true });
    });

    filterRow.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-filter]");
      if (!button) return;

      const filterValue = button.dataset.filter;

      if (options.multiFilter) {
        button.classList.toggle("active");
      } else {
        filterRow.querySelectorAll("button[data-filter]").forEach((chip) => {
          chip.classList.remove("active");
          chip.setAttribute("aria-pressed", "false");
        });
        button.classList.add("active");
      }

      button.setAttribute("aria-pressed", button.classList.contains("active") ? "true" : "false");
      const activeFilters = Array.from(filterRow.querySelectorAll("button.active[data-filter]")).map((chip) => chip.dataset.filter);
      const detail = { value: filterValue, activeFilters };
      root.dispatchEvent(new CustomEvent("public-shell:filter", { detail }));
      if (typeof callbacks.onFilter === "function") callbacks.onFilter(detail);
    });

    account.addEventListener("click", (event) => {
      event.stopPropagation();
      if (accountMenu.hidden) {
        openAccountMenu();
      } else {
        closeAccountMenu();
      }
    });

    document.addEventListener("click", (event) => {
      if (!accountWidget.contains(event.target)) {
        closeAccountMenu();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeAuthModal();
        closeAccountMenu();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && String(event.key || "").toLowerCase() === "k") {
        if (!options.showSearch) return;
        if (isEditableTarget(event.target)) return;
        event.preventDefault();
        searchInput.focus();
        searchInput.select();
      }
    });

    window.addEventListener(
      "resize",
      () => {
        if (!useAutoSidebarState) return;
        setSidebarState(isMobileViewport() ? SIDEBAR_STATES.icon : SIDEBAR_STATES.expanded, false);
      },
      { passive: true }
    );

    renderSidebarNav(options.shellKind, options.activeHref);
    setFilterOptions(options.filters, options.multiFilter);
    setSearchVisible(options.showSearch);
    syncLockoutBannerUi();
    setAccountState({
      accountLabel: options.accountLabel,
      accountAvatar: options.accountAvatar,
      accountBadges: options.accountBadges,
      accountAuthenticated: options.accountAuthenticated,
      accountMenuItems: options.accountMenuItems
    });

    const initialSidebarState = storedSidebarState || (isMobileViewport() ? SIDEBAR_STATES.icon : SIDEBAR_STATES.expanded);
    if (initialSidebarState !== SIDEBAR_STATES.hidden) {
      lastVisibleSidebarState = initialSidebarState;
    }
    setSidebarState(initialSidebarState, false);
    if (options.showLockoutBanner) {
      void loadPageBannerAccessState(true);
    }

    return {
      root,
      content,
      searchInput,
      filterRow,
      updateOptions,
      setHeading(label) {
        topbarTitle.textContent = label || "";
      },
      setQuery(value) {
        searchInput.value = value || "";
      },
      setLoading,
      setActiveHref(href) {
        options.activeHref = href;
        setActiveNav(href);
      },
      getSidebarState,
      setSidebarState(state) {
        setSidebarState(state, true);
      },
      getActiveFilters() {
        return Array.from(filterRow.querySelectorAll("button.active[data-filter]")).map((chip) => chip.dataset.filter);
      },
      setFilterState(values) {
        const active = new Set(Array.isArray(values) ? values : []);
        filterRow.querySelectorAll("button[data-filter]").forEach((chip) => {
          const isActive = active.has(chip.dataset.filter);
          chip.classList.toggle("active", isActive);
          chip.setAttribute("aria-pressed", isActive ? "true" : "false");
        });
      },
      setAccount(nextAccount) {
        setAccountState(nextAccount || {});
      },
      openAuthModal(state) {
        openAuthModal(state);
      },
      closeAuthModal() {
        closeAuthModal();
      }
    };
  }

  window.StreamSuitesPublicShell = {
    mount,
    parseDetailId
  };
})();
