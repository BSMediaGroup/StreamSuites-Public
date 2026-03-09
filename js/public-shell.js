(() => {
  const MEDIA_NAV = [
    { href: "/media.html", label: "Home", icon: "/assets/icons/ui/dashboard.svg", group: "main" },
    { href: "/clips.html", label: "Clips", icon: "/assets/icons/ui/portal.svg", group: "main" },
    { href: "/polls.html", label: "Polls", icon: "/assets/icons/ui/clickpoint.svg", group: "main" },
    { href: "/scoreboards.html", label: "Scoreboards", icon: "/assets/icons/ui/tablechart.svg", group: "main" },
    { href: "/tallies.html", label: "Tallies", icon: "/assets/icons/ui/piechart.svg", group: "main" },
    { href: "/community/index.html", label: "Community", icon: "/assets/icons/ui/profile.svg", group: "main" },
    { href: "/support.html", label: "Support", icon: "/assets/icons/ui/checkbox.svg", group: "quick" },
    { href: "/resources.html", label: "Resources", icon: "/assets/icons/ui/portal.svg", group: "quick" },
    { href: "/donate.html", label: "Donate", icon: "/assets/icons/ui/heart.svg", group: "quick" },
    { href: "/stats.html", label: "Statistics", icon: "/assets/icons/ui/chartdata.svg", group: "quick" },
    { href: "/about.html", label: "About", icon: "/assets/icons/ui/identity.svg", group: "quick" }
  ];

  const COMMUNITY_NAV = [
    { href: "/community/index.html", label: "Home", icon: "/assets/icons/ui/dashboard.svg", group: "main" },
    { href: "/community/members.html", label: "Members", icon: "/assets/icons/ui/profile.svg", group: "main" },
    { href: "/community/notices.html", label: "Notices", icon: "/assets/icons/ui/tickbadge.svg", group: "main" },
    { href: "/community/settings.html", label: "Settings", icon: "/assets/icons/ui/cog.svg", group: "main" },
    { href: "/media.html", label: "Media", icon: "/assets/icons/ui/portal.svg", group: "main" },
    { href: "/support.html", label: "Support", icon: "/assets/icons/ui/checkbox.svg", group: "quick" },
    { href: "/resources.html", label: "Resources", icon: "/assets/icons/ui/portal.svg", group: "quick" },
    { href: "/donate.html", label: "Donate", icon: "/assets/icons/ui/heart.svg", group: "quick" },
    { href: "/stats.html", label: "Statistics", icon: "/assets/icons/ui/chartdata.svg", group: "quick" },
    { href: "/about.html", label: "About", icon: "/assets/icons/ui/identity.svg", group: "quick" }
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
  const ROLE_ICON_MAP = Object.freeze({
    admin: "/assets/icons/tierbadge-admin.svg"
  });
  const TIER_ICON_MAP = Object.freeze({
    core: "/assets/icons/tierbadge-core.svg",
    gold: "/assets/icons/tierbadge-gold.svg",
    pro: "/assets/icons/tierbadge-pro.svg"
  });
  const UI_ICON_MAP = Object.freeze({
    menu: "/assets/icons/ui/sidebar.svg",
    close: "/assets/icons/ui/minus.svg",
    search: "/assets/icons/ui/querystats.svg",
    filterExpand: "/assets/icons/ui/plus.svg",
    filterCollapse: "/assets/icons/ui/minus.svg",
    copy: "/assets/icons/ui/portal.svg",
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

    const left = create("div", "footer-left");
    const creatorLogin = create("a", "creator-login-btn login-primary", "Creator Login");
    creatorLogin.href = "https://api.streamsuites.app/auth/login/google?surface=creator";
    creatorLogin.rel = "noopener noreferrer";
    creatorLogin.target = "_blank";
    creatorLogin.setAttribute("aria-label", "Creator Login");
    left.appendChild(creatorLogin);

    const links = create("div", "footer-links");
    links.append(
      Object.assign(create("a", "", "/support"), { href: "/support.html" }),
      Object.assign(create("a", "", "/donate"), { href: "/donate.html" }),
      Object.assign(create("a", "", "/privacy"), { href: "/privacy.html" }),
      Object.assign(create("a", "", "/about"), { href: "/about.html" })
    );

    cluster.append(left, links);

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
      filters: [],
      filtersCollapsed: true,
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
    modeBtn.appendChild(createIcon(UI_ICON_MAP.menu, "topbar-btn-icon"));

    const hideBtn = create("button", "topbar-hide-btn");
    hideBtn.type = "button";
    hideBtn.setAttribute("aria-label", "Hide sidebar");
    hideBtn.appendChild(createIcon(UI_ICON_MAP.close, "topbar-btn-icon topbar-btn-icon-close"));

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
    searchHint.innerHTML = "<kbd>Ctrl</kbd>/<kbd>Cmd</kbd> K";
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
    const filterToggleLabel = create("span", "filter-toggle-label", "Filters");
    const filterToggleCaret = create("span", "filter-toggle-caret");
    filterToggleCaret.setAttribute("aria-hidden", "true");
    filterToggle.append(filterToggleLabel, filterToggleCaret);
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

    const content = create("main", "public-content");
    content.id = "public-content";

    const footer = buildFooter();

    main.append(topbar, loadingBar, content);
    layout.append(sidebar, main, footer);
    root.append(bg, layout);

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
    if (authCloseIcon) {
      authCloseIcon.style.setProperty("--icon-mask", `url("${UI_ICON_MAP.close}")`);
    }
    const authPanels = Array.from(authBackdrop.querySelectorAll(".auth-panel"));

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
        const icon = create("img");
        icon.src = entry.icon;
        icon.alt = "";
        link.prepend(icon);
        oauthGrid.appendChild(link);
      });
      panel.appendChild(oauthGrid);

      const methodsToggle = create("div", "auth-toggle");
      const methodLink = create("a", "", "Use email/password");
      methodLink.href = `/public-login.html?return_to=${encodeURIComponent(window.location.href)}&auth=${mode}`;
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

    let lastVisibleSidebarState = SIDEBAR_STATES.expanded;
    const storedSidebarState = readSidebarState();
    let useAutoSidebarState = !storedSidebarState;

    function setAccountIdentity(label, avatarUrl, badges = []) {
      const nextLabel = (label || "Guest").trim() || "Guest";
      accountName.textContent = nextLabel;
      accountBadges.innerHTML = "";

      (Array.isArray(badges) ? badges : []).forEach((badge) => {
        if (!badge || typeof badge !== "object") return;
        const kind = String(badge.kind || "").trim().toLowerCase();
        const value = String(badge.value || "").trim().toLowerCase();
        if (kind === "role-icon" || kind === "tier-icon") {
          if (kind === "role-icon" && value !== "admin") return;
          const icon = create("img", "account-badge-icon");
          icon.src = kind === "tier-icon" ? TIER_ICON_MAP[value] : ROLE_ICON_MAP[value];
          if (!icon.src) return;
          icon.alt = "";
          accountBadges.appendChild(icon);
          return;
        }
        if (kind === "role-chip") {
          const chip = create("span", "account-badge-role-chip", String(badge.label || value || "").trim());
          if (chip.textContent) {
            accountBadges.appendChild(chip);
          }
        }
      });

      if (avatarUrl) {
        accountAvatar.textContent = "";
        accountAvatar.classList.add("has-image");
        accountAvatar.style.backgroundImage = `url(${avatarUrl})`;
        accountAvatar.style.backgroundSize = "cover";
        accountAvatar.style.backgroundPosition = "center";
        return;
      }

      accountAvatar.classList.remove("has-image");
      accountAvatar.style.backgroundImage = "";
      const initial = nextLabel.charAt(0).toUpperCase();
      accountAvatar.textContent = initial || "G";
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

    const storedFilterCollapsed = readFilterCollapsedState();
    let hasPersistedFilterPreference = typeof storedFilterCollapsed === "boolean";
    let filterCollapsed = hasPersistedFilterPreference ? storedFilterCollapsed : Boolean(options.filtersCollapsed);

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
