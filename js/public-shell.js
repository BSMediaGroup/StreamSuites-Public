(() => {
  const MEDIA_NAV = [
    { href: "/media.html", label: "Home", icon: "⌂" },
    { href: "/clips.html", label: "Clips", icon: "▶" },
    { href: "/polls.html", label: "Polls", icon: "◉" },
    { href: "/scoreboards.html", label: "Scoreboards", icon: "▦" },
    { href: "/tallies.html", label: "Tallies", icon: "▤" },
    { href: "/support.html", label: "Support", icon: "?" },
    { href: "/donate.html", label: "Donate", icon: "$" },
    { href: "/about.html", label: "About", icon: "i" },
    { href: "/community/index.html", label: "Community", icon: "♣" }
  ];

  const COMMUNITY_NAV = [
    { href: "/community/index.html", label: "Community Home", icon: "⌂" },
    { href: "/community/members.html", label: "Members", icon: "☺" },
    { href: "/community/notices.html", label: "Notices", icon: "✦" },
    { href: "/media.html", label: "Media", icon: "▶" },
    { href: "/support.html", label: "Support", icon: "?" },
    { href: "/about.html", label: "About", icon: "i" }
  ];

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

  function buildSidebar(navItems, activeHref) {
    const sidebar = create("aside", "public-sidebar");

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

    const nav = create("nav", "sidebar-nav");
    nav.setAttribute("aria-label", "Public navigation");

    const current = normalizePath(activeHref || window.location.pathname);
    navItems.forEach((item) => {
      const link = create("a", "sidebar-link");
      link.href = item.href;
      const target = normalizePath(item.href);
      if (target === current) link.classList.add("active");
      const icon = create("span", "sidebar-icon", item.icon || "•");
      icon.setAttribute("aria-hidden", "true");
      const text = create("span", "sidebar-text", item.label);
      link.append(icon, text);
      nav.appendChild(link);
    });

    sidebar.append(brand, nav);
    return sidebar;
  }

  function buildFooter() {
    const shell = create("div", "footer-shell");
    const status = create("div", "footer-status");
    status.setAttribute("data-status-slot", "");

    const bar = create("div", "footer-bar");

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

    bar.append(left, links, meta);
    shell.append(status, bar);
    return shell;
  }

  function buildTopbar(options) {
    const topbar = create("header", "public-topbar");

    const left = create("div", "topbar-left");
    const menuBtn = create("button", "topbar-menu-btn", "☰");
    menuBtn.type = "button";
    menuBtn.setAttribute("aria-label", "Toggle navigation");

    const brand = create("a", "topbar-brand");
    brand.href = "/media.html";
    const brandLogo = create("img");
    brandLogo.src = "/assets/logos/logo.png";
    brandLogo.alt = "StreamSuites";
    const brandText = create("span", "", options.topbarLabel || "Media Gallery");
    brand.append(brandLogo, brandText);
    left.append(menuBtn, brand);

    const center = create("div", "topbar-center");
    const searchShell = create("label", "search-shell");
    const searchIcon = create("span", "", "⌕");
    searchIcon.setAttribute("aria-hidden", "true");
    const searchInput = create("input");
    searchInput.type = "search";
    searchInput.placeholder = options.searchPlaceholder || "Search";
    searchInput.setAttribute("data-shell-search", "");
    searchShell.append(searchIcon, searchInput);
    center.appendChild(searchShell);

    const filterRow = create("div", "filter-row");
    filterRow.setAttribute("data-shell-filters", "");
    const chips = Array.isArray(options.filters) ? options.filters : [];
    chips.forEach((chip) => {
      const btn = create("button", "filter-chip", chip.label);
      btn.type = "button";
      btn.dataset.filter = chip.value;
      btn.setAttribute("aria-pressed", chip.active ? "true" : "false");
      if (chip.active) btn.classList.add("active");
      filterRow.appendChild(btn);
    });

    if (chips.length) {
      center.appendChild(filterRow);
    }

    const right = create("div", "topbar-right");
    const account = create("div", "account-pill");
    account.append(create("span", "account-avatar"), create("span", "", options.accountLabel || "Guest"));
    right.appendChild(account);

    topbar.append(left, center, right);
    return { topbar, menuBtn, searchInput, filterRow };
  }

  function mount(userOptions = {}) {
    const options = {
      rootSelector: "#public-app",
      shellKind: "media",
      activeHref: window.location.pathname,
      topbarLabel: "Media Gallery",
      searchPlaceholder: "Search",
      filters: [],
      accountLabel: "Guest",
      ...userOptions
    };

    const root = document.querySelector(options.rootSelector);
    if (!root) {
      throw new Error("Missing shell root element");
    }

    document.body.classList.add("public-shell-page");

    root.innerHTML = "";
    const bg = create("div", "public-shell-bg");
    const layout = create("div", "public-shell-root");
    layout.classList.toggle("sidebar-collapsed", Boolean(options.startCollapsed));

    const navItems = options.shellKind === "community" ? COMMUNITY_NAV : MEDIA_NAV;
    const sidebar = buildSidebar(navItems, options.activeHref);

    const main = create("div", "public-main");
    const { topbar, menuBtn, searchInput, filterRow } = buildTopbar(options);
    const content = create("main", "public-content");
    content.setAttribute("id", "public-content");

    const overlay = create("button", "mobile-overlay");
    overlay.type = "button";
    overlay.setAttribute("aria-label", "Close navigation");

    const footer = buildFooter();

    main.append(topbar, content, footer);
    layout.append(sidebar, main, overlay);
    root.append(bg, layout);

    const setDrawer = (open) => {
      layout.classList.toggle("drawer-open", Boolean(open));
    };

    menuBtn.addEventListener("click", () => {
      if (window.matchMedia("(max-width: 920px)").matches) {
        setDrawer(!layout.classList.contains("drawer-open"));
        return;
      }
      layout.classList.toggle("sidebar-collapsed");
    });

    overlay.addEventListener("click", () => setDrawer(false));

    searchInput.addEventListener("input", () => {
      const detail = { query: searchInput.value.trim() };
      root.dispatchEvent(new CustomEvent("public-shell:search", { detail }));
      if (typeof options.onSearch === "function") options.onSearch(detail.query);
    });

    if (filterRow) {
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
        if (typeof options.onFilter === "function") options.onFilter(detail);
      });
    }

    return {
      root,
      content,
      searchInput,
      filterRow,
      setHeading(label) {
        const brandLabel = topbar.querySelector(".topbar-brand span");
        if (brandLabel) brandLabel.textContent = label;
      },
      setQuery(value) {
        searchInput.value = value || "";
      },
      getActiveFilters() {
        if (!filterRow) return [];
        return Array.from(filterRow.querySelectorAll("button.active[data-filter]")).map((chip) => chip.dataset.filter);
      },
      setFilterState(values) {
        if (!filterRow) return;
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
