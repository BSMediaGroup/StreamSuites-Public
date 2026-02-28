(() => {
  const MEDIA_NAV = [
    { href: "/media.html", label: "Home", icon: "⌂", group: "main" },
    { href: "/clips.html", label: "Clips", icon: "▶", group: "main" },
    { href: "/polls.html", label: "Polls", icon: "◉", group: "main" },
    { href: "/scoreboards.html", label: "Scoreboards", icon: "▦", group: "main" },
    { href: "/tallies.html", label: "Tallies", icon: "◔", group: "main" },
    { href: "/community/index.html", label: "Community", icon: "☰", group: "main" },
    { href: "/support.html", label: "Support", icon: "?", group: "quick" },
    { href: "/donate.html", label: "Donate", icon: "$", group: "quick" },
    { href: "/about.html", label: "About", icon: "i", group: "quick" }
  ];

  const COMMUNITY_NAV = [
    { href: "/community/index.html", label: "Home", icon: "⌂", group: "main" },
    { href: "/community/members.html", label: "Members", icon: "☺", group: "main" },
    { href: "/community/notices.html", label: "Notices", icon: "✦", group: "main" },
    { href: "/media.html", label: "Media", icon: "▶", group: "main" },
    { href: "/support.html", label: "Support", icon: "?", group: "quick" },
    { href: "/about.html", label: "About", icon: "i", group: "quick" }
  ];

  const SIDEBAR_STATE_KEY = "ss-public-sidebar-state";
  const SIDEBAR_STATES = Object.freeze({
    hidden: "hidden",
    icon: "icon",
    expanded: "expanded"
  });

  const MOBILE_MEDIA_QUERY = "(max-width: 920px)";

  function create(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (typeof text === "string") node.textContent = text;
    return node;
  }

  function normalizePath(path) {
    if (!path) return "/";
    return path.endsWith("/") && path.length > 1 ? path.slice(0, -1) : path;
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

  function isMobileViewport() {
    return window.matchMedia(MOBILE_MEDIA_QUERY).matches;
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

    const icon = create("span", "sidebar-icon", item.icon || "•");
    icon.setAttribute("aria-hidden", "true");

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
      filters: [],
      filtersCollapsed: true,
      multiFilter: false,
      accountLabel: "Guest",
      accountAvatar: "",
      ...userOptions
    };

    const callbacks = {
      onSearch: typeof options.onSearch === "function" ? options.onSearch : null,
      onFilter: typeof options.onFilter === "function" ? options.onFilter : null
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
    labels.append(
      create("span", "sidebar-brand-title", "StreamSuites"),
      create("span", "sidebar-brand-subtitle", "Public")
    );
    brand.append(logo, labels);
    sidebarTop.appendChild(brand);

    const sidebarScroll = create("div", "sidebar-scroll");

    sidebar.append(sidebarTop, sidebarScroll);

    const main = create("div", "public-main");

    const topbar = create("header", "public-topbar");

    const topbarMain = create("div", "topbar-main");
    const topbarLeft = create("div", "topbar-left");

    const modeBtn = create("button", "topbar-menu-btn", "☰");
    modeBtn.type = "button";
    modeBtn.setAttribute("aria-label", "Toggle sidebar size");

    const hideBtn = create("button", "topbar-hide-btn", "⨯");
    hideBtn.type = "button";
    hideBtn.setAttribute("aria-label", "Hide sidebar");

    const topbarTitle = create("span", "topbar-title", options.topbarLabel || "Media Gallery");
    topbarLeft.append(modeBtn, hideBtn, topbarTitle);

    const topbarCenter = create("div", "topbar-center");
    const searchShell = create("label", "search-shell");
    const searchIcon = create("span", "search-icon", "⌕");
    searchIcon.setAttribute("aria-hidden", "true");
    const searchInput = create("input");
    searchInput.type = "search";
    searchInput.placeholder = options.searchPlaceholder || "Search";
    searchInput.setAttribute("data-shell-search", "");
    searchShell.append(searchIcon, searchInput);
    topbarCenter.appendChild(searchShell);

    const topbarRight = create("div", "topbar-right");
    const account = create("div", "account-pill");
    const accountAvatar = create("span", "account-avatar");
    const accountName = create("span", "account-name", options.accountLabel || "Guest");
    account.append(accountAvatar, accountName);
    topbarRight.appendChild(account);

    topbarMain.append(topbarLeft, topbarCenter, topbarRight);

    const filterDock = create("div", "filter-dock");
    const filterToggle = create("button", "filter-toggle", "Filters");
    filterToggle.type = "button";
    filterToggle.setAttribute("aria-expanded", "false");
    filterToggle.setAttribute("aria-controls", "public-filter-row");

    const filterRowWrap = create("div", "filter-row-wrap");
    filterRowWrap.id = "public-filter-row";

    const filterRow = create("div", "filter-row");
    filterRow.setAttribute("data-shell-filters", "");
    filterRowWrap.appendChild(filterRow);

    filterDock.append(filterToggle, filterRowWrap);

    const loadingBar = create("div", "shell-loading");
    loadingBar.setAttribute("aria-hidden", "true");
    loadingBar.append(create("div", "shell-loading-track"), create("div", "shell-loading-bar"));

    topbar.append(topbarMain, filterDock);

    const content = create("main", "public-content");
    content.id = "public-content";

    const footer = buildFooter();

    main.append(topbar, loadingBar, content, footer);
    layout.append(sidebar, main);
    root.append(bg, layout);

    let lastVisibleSidebarState = SIDEBAR_STATES.expanded;
    const storedSidebarState = readSidebarState();
    let useAutoSidebarState = !storedSidebarState;

    function setAccountLabel(label, avatarUrl) {
      const nextLabel = (label || "Guest").trim() || "Guest";
      accountName.textContent = nextLabel;

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

    function setFilterCollapsed(collapsed) {
      const hasFilters = filterRow.childElementCount > 0;
      const nextCollapsed = Boolean(collapsed || !hasFilters);
      filterDock.classList.toggle("is-empty", !hasFilters);
      filterDock.classList.toggle("is-collapsed", nextCollapsed);
      filterToggle.setAttribute("aria-expanded", String(!nextCollapsed));
      filterRowWrap.hidden = nextCollapsed;
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
      setFilterCollapsed(Boolean(options.filtersCollapsed));
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

      if (Array.isArray(next.filters) || typeof next.multiFilter === "boolean") {
        setFilterOptions(Array.isArray(next.filters) ? next.filters : options.filters, next.multiFilter ?? options.multiFilter);
      }

      if (typeof next.filtersCollapsed === "boolean") {
        options.filtersCollapsed = next.filtersCollapsed;
        setFilterCollapsed(next.filtersCollapsed);
      }

      if (typeof next.accountLabel === "string" || typeof next.accountAvatar === "string") {
        options.accountLabel = typeof next.accountLabel === "string" ? next.accountLabel : options.accountLabel;
        options.accountAvatar = typeof next.accountAvatar === "string" ? next.accountAvatar : options.accountAvatar;
        setAccountLabel(options.accountLabel, options.accountAvatar);
      }

      if (typeof next.onSearch === "function" || next.onSearch === null) {
        callbacks.onSearch = typeof next.onSearch === "function" ? next.onSearch : null;
      }

      if (typeof next.onFilter === "function" || next.onFilter === null) {
        callbacks.onFilter = typeof next.onFilter === "function" ? next.onFilter : null;
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
      const collapsed = !filterDock.classList.contains("is-collapsed");
      options.filtersCollapsed = collapsed;
      setFilterCollapsed(collapsed);
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
    setAccountLabel(options.accountLabel, options.accountAvatar);

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
      }
    };
  }

  window.StreamSuitesPublicShell = {
    mount,
    parseDetailId
  };
})();
