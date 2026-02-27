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

  const PAGE_CONFIG = {
    "media-home": {
      shellKind: "media",
      activeHref: "/media.html",
      topbarLabel: "Media Home",
      searchPlaceholder: "Search clips, polls, scoreboards, tallies",
      filterMode: "multi",
      defaultFilters: ["clips", "polls", "scoreboards", "tallies"],
      render: renderMediaHome
    },
    "media-clips": {
      shellKind: "media",
      activeHref: "/clips.html",
      topbarLabel: "Clips",
      searchPlaceholder: "Search clips",
      filterMode: "single-nav",
      defaultFilters: ["clips"],
      render: renderMediaList,
      listType: "clips"
    },
    "media-polls": {
      shellKind: "media",
      activeHref: "/polls.html",
      topbarLabel: "Polls",
      searchPlaceholder: "Search polls",
      filterMode: "single-nav",
      defaultFilters: ["polls"],
      render: renderMediaList,
      listType: "polls"
    },
    "media-scoreboards": {
      shellKind: "media",
      activeHref: "/scoreboards.html",
      topbarLabel: "Scoreboards",
      searchPlaceholder: "Search scoreboards",
      filterMode: "single-nav",
      defaultFilters: ["scoreboards"],
      render: renderMediaList,
      listType: "scoreboards"
    },
    "media-tallies": {
      shellKind: "media",
      activeHref: "/tallies.html",
      topbarLabel: "Tallies",
      searchPlaceholder: "Search tallies",
      filterMode: "single-nav",
      defaultFilters: ["tallies"],
      render: renderMediaList,
      listType: "tallies"
    },
    "detail-clip": {
      shellKind: "media",
      activeHref: "/clips.html",
      topbarLabel: "Clip Detail",
      searchPlaceholder: "Search",
      filterMode: "single-nav",
      defaultFilters: ["clips"],
      render: renderDetail,
      detailType: "clips"
    },
    "detail-poll": {
      shellKind: "media",
      activeHref: "/polls.html",
      topbarLabel: "Poll Detail",
      searchPlaceholder: "Search",
      filterMode: "single-nav",
      defaultFilters: ["polls"],
      render: renderDetail,
      detailType: "polls"
    },
    "detail-poll-results": {
      shellKind: "media",
      activeHref: "/polls.html",
      topbarLabel: "Poll Results",
      searchPlaceholder: "Search",
      filterMode: "single-nav",
      defaultFilters: ["polls"],
      render: renderPollResults,
      detailType: "polls"
    },
    "detail-scoreboard": {
      shellKind: "media",
      activeHref: "/scoreboards.html",
      topbarLabel: "Scoreboard Detail",
      searchPlaceholder: "Search",
      filterMode: "single-nav",
      defaultFilters: ["scoreboards"],
      render: renderDetail,
      detailType: "scoreboards"
    },
    "detail-tally": {
      shellKind: "media",
      activeHref: "/tallies.html",
      topbarLabel: "Tally Detail",
      searchPlaceholder: "Search",
      filterMode: "single-nav",
      defaultFilters: ["tallies"],
      render: renderDetail,
      detailType: "tallies"
    },
    "community-home": {
      shellKind: "community",
      activeHref: "/community/index.html",
      topbarLabel: "Community",
      searchPlaceholder: "Search members and notices",
      filterMode: "none",
      defaultFilters: [],
      render: renderCommunityHome
    },
    "community-members": {
      shellKind: "community",
      activeHref: "/community/members.html",
      topbarLabel: "Members",
      searchPlaceholder: "Search members",
      filterMode: "none",
      defaultFilters: [],
      render: renderCommunityMembers
    },
    "community-notices": {
      shellKind: "community",
      activeHref: "/community/notices.html",
      topbarLabel: "Notices",
      searchPlaceholder: "Search notices",
      filterMode: "none",
      defaultFilters: [],
      render: renderCommunityNotices
    },
    "community-profile": {
      shellKind: "community",
      activeHref: "/community/members.html",
      topbarLabel: "Profile",
      searchPlaceholder: "Search",
      filterMode: "none",
      defaultFilters: [],
      render: renderCommunityProfile
    }
  };

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

  function matchesQuery(item, query) {
    const q = norm(query).trim();
    if (!q) return true;
    return [item.title, item.summary, item.question, item.platform, item.status, item.creator?.displayName]
      .join(" ")
      .toLowerCase()
      .includes(q);
  }

  function sliceRows(items, perRow, rows) {
    const size = Math.max(1, perRow) * Math.max(1, rows);
    return items.slice(0, size);
  }

  function cardMetaPill(text, className) {
    const pill = create("span", `meta-pill ${className || ""}`.trim(), text);
    return pill;
  }

  function buildMediaCard(item, options = {}) {
    const card = create("article", "item-card");
    const link = create("a", "item-link");
    link.href = item.href;

    const thumb = create("div", "item-thumb");
    if (item.type === "clips" && item.mediaUrl && /\.(mp4|webm|ogg)(\?.*)?$/i.test(item.mediaUrl)) {
      const video = create("video");
      video.src = item.mediaUrl;
      video.preload = "metadata";
      video.muted = true;
      video.playsInline = true;
      video.setAttribute("aria-hidden", "true");
      thumb.appendChild(video);
    } else {
      const img = create("img");
      img.src = item.thumbnail || "/assets/backgrounds/seodash.jpg";
      img.alt = `${item.title} preview`;
      thumb.appendChild(img);
    }

    if (item.duration && item.type === "clips") {
      thumb.appendChild(create("span", "item-duration", item.duration));
    }

    const body = create("div", "item-body");
    const title = create("h3", "item-title", item.title || item.question || "Untitled");
    const snippet = create("p", "item-snippet", item.summary || "");
    if (!options.showSnippet) snippet.hidden = true;

    const meta = create("div", "item-meta");
    meta.append(
      cardMetaPill(item.creator?.displayName || "Public User"),
      cardMetaPill(item.status || "Pending", `status-${norm(item.status)}`)
    );

    if (options.showType) {
      meta.appendChild(cardMetaPill((item.type || "item").toUpperCase()));
    }

    if (item.platform) {
      meta.appendChild(cardMetaPill(item.platform));
    }

    if (item.totalVotes != null) {
      meta.appendChild(cardMetaPill(`${item.totalVotes} votes`));
    }

    body.append(title, snippet, meta);
    link.append(thumb, body);
    card.appendChild(link);
    return card;
  }

  function buildPageHeading(title, subtitle) {
    const heading = create("section", "page-heading");
    const left = create("div");
    left.append(create("h1", "", title), create("p", "", subtitle));
    heading.appendChild(left);
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
    return (data[type] || []).filter((item) => matchesQuery(item, query));
  }

  function renderMediaHome(ctx) {
    const { host, data, state } = ctx;
    clear(host);
    host.appendChild(buildPageHeading("Media Gallery", "Browse public clips, polls, scoreboards, and tallies."));

    const activeFilters = new Set(state.activeFilters.length ? state.activeFilters : ["clips", "polls", "scoreboards", "tallies"]);

    const sections = [
      { type: "clips", title: "Clips", seeAll: "/clips.html", limitRows: 2, showSnippet: true },
      { type: "polls", title: "Polls", seeAll: "/polls.html", limitRows: 1 },
      { type: "scoreboards", title: "Scoreboards", seeAll: "/scoreboards.html", limitRows: 1 },
      { type: "tallies", title: "Tallies", seeAll: "/tallies.html", limitRows: 1 }
    ];

    let renderedAny = false;

    sections.forEach((config) => {
      if (!activeFilters.has(config.type)) return;
      let items = filterItemsByType(data, config.type, state.query);

      const perRow = config.type === "clips" ? 5 : 4;
      items = sliceRows(items, perRow, config.limitRows || 1);
      if (!items.length) return;

      renderedAny = true;

      const section = buildSection(config.title, config.seeAll).section;
      const grid = create("div", "media-grid");
      items.forEach((item) => {
        grid.appendChild(buildMediaCard(item, { showSnippet: Boolean(config.showSnippet), showType: config.type !== "clips" }));
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
      polls: ["Polls Gallery", "Public poll questions and current vote snapshots."],
      scoreboards: ["Scoreboards Gallery", "Scoreboard overlays and public metric snapshots."],
      tallies: ["Tallies Gallery", "Programmatic tally summaries and running totals."]
    };

    const [title, subtitle] = titles[config.listType] || ["Gallery", "Public media gallery."];
    host.appendChild(buildPageHeading(title, subtitle));

    const section = buildSection(title, null).section;
    const grid = create("div", `media-grid${config.listType === "clips" ? " clips-dedicated" : ""}`);

    const items = filterItemsByType(data, config.listType, state.query);
    items.forEach((item) => {
      grid.appendChild(buildMediaCard(item, { showSnippet: true, showType: config.listType !== "clips" }));
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
      li.innerHTML = `<strong>${label}:</strong> ${value || "Unknown"}`;
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

  function renderDetail(ctx, config) {
    const { host, data } = ctx;
    clear(host);

    const id = window.StreamSuitesPublicData.parseDetailId();
    const item = (data[config.detailType] || []).find((entry) => entry.id === id) || (data[config.detailType] || [])[0];

    if (!item) {
      host.appendChild(create("div", "empty-state", "Item not found."));
      return;
    }

    host.appendChild(buildPageHeading(item.title || item.question || "Detail", item.summary || "Public detail view."));

    const layout = create("section", "detail-layout");
    const main = create("article", "detail-main");
    const side = create("aside", "detail-side");

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
      image.alt = `${item.title} preview`;
      player.appendChild(image);
    }

    const copy = create("div", "detail-copy");
    copy.append(create("h2", "", item.title || item.question || "Detail"));
    copy.append(create("p", "", item.summary || "No description available."));

    if (config.detailType === "polls") {
      const tableWrap = create("div", "table-wrap");
      const table = create("table", "results-table");
      table.innerHTML = "<thead><tr><th>Option</th><th>Votes</th></tr></thead>";
      const body = create("tbody");
      (item.options || []).forEach((option) => {
        const row = create("tr");
        row.innerHTML = `<td>${option.label} (${option.percent}%)</td><td>${option.votes}</td>`;
        body.appendChild(row);
      });
      table.appendChild(body);
      tableWrap.appendChild(table);
      copy.appendChild(tableWrap);
    }

    if (config.detailType === "scoreboards" || config.detailType === "tallies") {
      const tableWrap = create("div", "table-wrap");
      const table = create("table", "results-table");
      table.innerHTML = "<thead><tr><th>Entry</th><th>Value</th></tr></thead>";
      const body = create("tbody");
      (item.entries || []).forEach((entry) => {
        const row = create("tr");
        row.innerHTML = `<td>${entry.label}</td><td>${entry.value}</td>`;
        body.appendChild(row);
      });
      table.appendChild(body);
      tableWrap.appendChild(table);
      copy.appendChild(tableWrap);
    }

    main.append(player, copy);

    const profileCard = create("div", "profile-card");
    const profileMini = create("div", "profile-mini");
    const avatar = create("img");
    avatar.src = item.creator?.avatar || "/assets/logos/logocircle.png";
    avatar.alt = `${item.creator?.displayName || "Public User"} avatar`;
    const text = create("div");
    text.append(create("strong", "", item.creator?.displayName || "Public User"));
    text.append(create("div", "notice-meta", `${item.creator?.platform || "StreamSuites"} • ${item.creator?.role || "member"}`));
    profileMini.append(avatar, text);

    const profileLink = create("a", "see-all", "Open profile");
    profileLink.href = `/community/profile.html?id=${encodeURIComponent(item.profileId || "public-user")}`;

    const shareLink = create("a", "see-all", "Copyable link");
    shareLink.href = buildShareLink(window.location.pathname, item.id);
    shareLink.textContent = buildShareLink(window.location.pathname, item.id);

    profileCard.append(profileMini, buildDetailRows(item, data.helpers), profileLink, shareLink);

    side.appendChild(profileCard);

    if (config.detailType === "polls") {
      const resultsLink = create("a", "see-all", "Open results page");
      resultsLink.href = item.resultsHref;
      side.appendChild(resultsLink);
    }

    layout.append(main, side);
    host.appendChild(layout);
  }

  function renderPollResults(ctx) {
    const { host, data } = ctx;
    clear(host);

    const id = window.StreamSuitesPublicData.parseDetailId();
    const poll = (data.polls || []).find((entry) => entry.id === id) || (data.polls || [])[0];

    if (!poll) {
      host.appendChild(create("div", "empty-state", "Poll not found."));
      return;
    }

    host.appendChild(buildPageHeading(`Results: ${poll.title}`, "Standalone poll results with shareable URL."));

    const layout = create("section", "detail-layout");
    const main = create("article", "detail-main");
    const side = create("aside", "detail-side");

    const status = create("p", "item-snippet", `Status: ${poll.status} • Total votes: ${poll.totalVotes}`);
    const tableWrap = create("div", "table-wrap");
    const table = create("table", "results-table");
    table.innerHTML = "<thead><tr><th>Option</th><th>Votes</th></tr></thead>";

    const body = create("tbody");
    (poll.options || []).forEach((option) => {
      const row = create("tr");
      row.innerHTML = `<td>${option.label} (${option.percent}%)</td><td>${option.votes}</td>`;
      body.appendChild(row);
    });

    table.appendChild(body);
    tableWrap.appendChild(table);
    main.append(status, tableWrap);

    const profileCard = create("div", "profile-card");
    const profileMini = create("div", "profile-mini");
    const avatar = create("img");
    avatar.src = poll.creator?.avatar || "/assets/logos/logocircle.png";
    avatar.alt = `${poll.creator?.displayName || "Public User"} avatar`;
    const text = create("div");
    text.append(create("strong", "", poll.creator?.displayName || "Public User"));
    text.append(create("div", "notice-meta", `${poll.creator?.platform || "StreamSuites"} • ${poll.creator?.role || "member"}`));
    profileMini.append(avatar, text);

    const profileLink = create("a", "see-all", "Open profile");
    profileLink.href = `/community/profile.html?id=${encodeURIComponent(poll.profileId || "public-user")}`;

    const shareLink = create("a", "see-all", "Copyable link");
    shareLink.href = buildShareLink(window.location.pathname, poll.id);
    shareLink.textContent = buildShareLink(window.location.pathname, poll.id);

    profileCard.append(profileMini, buildDetailRows(poll, data.helpers), profileLink, shareLink);
    side.appendChild(profileCard);

    layout.append(main, side);
    host.appendChild(layout);
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
        create("div", "notice-meta", `${data.helpers.toTimestamp(latestNotice.createdAt)} • ${latestNotice.author.displayName}`)
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
    const top = create("div", "profile-mini");
    const avatar = create("img");
    avatar.src = profile.avatar || "/assets/logos/logocircle.png";
    avatar.alt = `${profile.displayName} avatar`;
    const info = create("div");
    info.append(create("strong", "", profile.displayName));
    info.append(create("div", "notice-meta", `${profile.platform} • ${profile.role}`));
    top.append(avatar, info);

    const artifactCount = (data.artifactsByProfile?.[profile.id] || []).length;
    const badge = create("div", "item-meta");
    badge.append(cardMetaPill(`${artifactCount} artifacts`));

    const link = create("a", "see-all", "Open profile");
    link.href = `/community/profile.html?id=${encodeURIComponent(profile.id)}`;

    card.append(top, create("p", "item-snippet", profile.bio || ""), badge, link);
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
        create("div", "notice-meta", `${notice.priority} • ${data.helpers.toTimestamp(notice.createdAt)} • ${notice.author.displayName}`)
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

    host.appendChild(buildPageHeading(profile.displayName, `${profile.platform} • ${profile.role}`));

    const hero = create("section", "detail-layout");
    const left = create("article", "detail-main");
    const right = create("aside", "detail-side");

    const profileCard = create("article", "profile-card");
    const top = create("div", "profile-mini");
    const avatar = create("img");
    avatar.src = profile.avatar || "/assets/logos/logocircle.png";
    avatar.alt = `${profile.displayName} avatar`;
    const info = create("div");
    info.append(create("strong", "", profile.displayName));
    info.append(create("div", "notice-meta", `@${profile.username} • ${profile.platform}`));
    top.append(avatar, info);
    profileCard.append(top, create("p", "", profile.bio || ""));

    left.appendChild(profileCard);

    const artifactSection = create("section", "section");
    artifactSection.append(create("h2", "", "Recent Artifacts"));
    const grid = create("div", "media-grid");
    artifacts.slice(0, 12).forEach((item) => {
      grid.appendChild(buildMediaCard(item, { showSnippet: true, showType: true }));
    });
    artifactSection.appendChild(grid);

    if (!artifacts.length) {
      artifactSection.appendChild(create("div", "empty-state", "No artifacts linked to this profile yet."));
    }

    right.appendChild(artifactSection);
    hero.append(left, right);
    host.appendChild(hero);
  }

  function init() {
    const pageId = document.body.dataset.publicPage;
    if (!pageId) return;

    const config = PAGE_CONFIG[pageId];
    if (!config) return;

    const filters = config.filterMode === "none"
      ? []
      : MEDIA_FILTERS.map((filter) => ({
          ...filter,
          active: config.defaultFilters.includes(filter.value)
        }));

    const state = {
      query: "",
      activeFilters: [...config.defaultFilters]
    };

    const shell = window.StreamSuitesPublicShell.mount({
      shellKind: config.shellKind,
      activeHref: config.activeHref,
      topbarLabel: config.topbarLabel,
      searchPlaceholder: config.searchPlaceholder,
      filters,
      multiFilter: config.filterMode === "multi",
      onSearch(query) {
        state.query = query;
        rerender();
      },
      onFilter(detail) {
        if (config.filterMode === "multi") {
          state.activeFilters = detail.activeFilters.length ? detail.activeFilters : ["clips", "polls", "scoreboards", "tallies"];
          rerender();
          return;
        }

        if (config.filterMode === "single-nav") {
          const target = TYPE_TO_PAGE[detail.value];
          if (target && target !== window.location.pathname) {
            window.location.assign(target);
            return;
          }
          state.activeFilters = [detail.value];
        }
      }
    });

    let loadedData = null;

    const rerender = () => {
      if (!loadedData) return;
      config.render({ host: shell.content, data: loadedData, state }, config);
    };

    window.StreamSuitesPublicData.loadAll().then((data) => {
      loadedData = data;
      rerender();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
