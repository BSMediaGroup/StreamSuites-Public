(() => {
  const DATA_PATHS = {
    clips: "/data/clips.json",
    polls: "/data/polls.json",
    scoreboards: "/data/scoreboards.json",
    tallies: "/data/tallies.json",
    profiles: "/data/profiles.json",
    notices: "/data/notices.json",
    meta: "/data/meta.json"
  };

  const FALLBACK_AVATAR = "/assets/logos/logocircle.png";

  const PLATFORM_ICON_MAP = Object.freeze({
    rumble: "/assets/icons/rumble.svg",
    youtube: "/assets/icons/youtube.svg",
    twitch: "/assets/icons/twitch.svg",
    kick: "/assets/icons/kick.svg",
    twitter: "/assets/icons/twitter.svg",
    x: "/assets/icons/x.svg",
    pilled: "/assets/icons/pilled.svg",
    streamsuites: "/assets/icons/pilled.svg",
    generic: "/assets/icons/pilled.svg"
  });

  const DEFAULT_PROFILE = {
    id: "public-user",
    username: "public-user",
    displayName: "Public User",
    avatar: FALLBACK_AVATAR,
    platform: "StreamSuites",
    platformKey: "streamsuites",
    role: "member",
    tier: "",
    badges: [
      { kind: "tier", label: "Member" }
    ],
    bio: "Community-visible profile used when creator metadata is unavailable."
  };

  let cachePromise = null;

  function toArray(payload) {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.clips)) return payload.clips;
    if (Array.isArray(payload?.polls)) return payload.polls;
    if (Array.isArray(payload?.scoreboards)) return payload.scoreboards;
    if (Array.isArray(payload?.tallies)) return payload.tallies;
    return [];
  }

  function toTitle(value) {
    if (!value) return "Pending";
    return String(value)
      .replace(/[_-]+/g, " ")
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0].toUpperCase() + part.slice(1).toLowerCase())
      .join(" ");
  }

  function toTimestamp(value) {
    if (!value) return "Unknown";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function toDateSort(value) {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
  }

  function toDuration(secondsValue, fallback) {
    const parsed = Number(secondsValue);
    if (!Number.isFinite(parsed) || parsed <= 0) return fallback || "--:--";
    const minutes = Math.floor(parsed / 60);
    const seconds = Math.floor(parsed % 60);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  async function loadJson(path, fallback) {
    try {
      const response = await fetch(path, { cache: "no-store" });
      if (!response.ok) return fallback;
      return await response.json();
    } catch (_err) {
      return fallback;
    }
  }

  function normalizePlatformKey(value) {
    const raw = String(value || "").trim().toLowerCase();
    if (!raw) return "generic";
    if (raw === "x") return "x";
    if (raw === "streamsuites" || raw === "streamsuite") return "streamsuites";
    if (Object.prototype.hasOwnProperty.call(PLATFORM_ICON_MAP, raw)) {
      return raw;
    }
    return "generic";
  }

  function platformIconFor(value) {
    const key = normalizePlatformKey(value);
    return PLATFORM_ICON_MAP[key] || PLATFORM_ICON_MAP.generic;
  }

  function normalizeRole(value) {
    const raw = String(value || "member").trim().toLowerCase();
    if (!raw) return "member";
    if (raw.includes("admin")) return "admin";
    if (raw.includes("creator")) return "creator";
    return "member";
  }

  function normalizeTier(value) {
    const raw = String(value || "").trim().toUpperCase();
    if (!raw) return "";
    if (raw === "OPEN") return "CORE";
    if (["CORE", "GOLD", "PRO"].includes(raw)) return raw;
    return toTitle(raw);
  }

  function buildProfileBadges(role, tier) {
    const badges = [];

    if (tier) {
      badges.push({ kind: "tier", label: tier, tier });
    } else {
      const fallbackTier = role === "creator" ? "Creator" : role === "admin" ? "Creator" : "Member";
      badges.push({ kind: "tier", label: fallbackTier, tier: "" });
    }

    if (role === "admin") {
      badges.push({ kind: "admin", label: "Admin" });
    }

    return badges;
  }

  function pickSourceUrl(raw) {
    const candidate =
      raw?.source_url ||
      raw?.sourceUrl ||
      raw?.canonical_url ||
      raw?.canonicalUrl ||
      raw?.external_url ||
      raw?.externalUrl ||
      raw?.original_url ||
      raw?.originalUrl ||
      null;

    if (!candidate || typeof candidate !== "string") return "";

    try {
      const url = new URL(candidate, window.location.origin);
      if (url.origin !== window.location.origin && /^https?:$/i.test(url.protocol)) {
        return url.toString();
      }
    } catch (_err) {
      return "";
    }

    return "";
  }

  function normalizeProfile(raw) {
    const id = raw?.id || raw?.profile_id || raw?.username || raw?.name;
    if (!id) return null;

    const role = normalizeRole(raw.role || raw.role_hint);
    const tier = normalizeTier(raw.tier || raw.plan_tier || raw.membership_tier || raw.membershipTier || raw.tier_label);
    const platform = raw.platform || "StreamSuites";

    return {
      id: String(id),
      username: String(raw.username || raw.handle || id),
      displayName: raw.display_name || raw.displayName || raw.name || String(id),
      avatar: raw.avatar || raw.avatar_url || FALLBACK_AVATAR,
      platform,
      platformKey: normalizePlatformKey(platform),
      platformIcon: platformIconFor(platform),
      role,
      tier,
      badges: buildProfileBadges(role, tier),
      bio: raw.bio || raw.summary || ""
    };
  }

  function buildProfileMap(items) {
    const map = new Map();
    map.set(DEFAULT_PROFILE.id, { ...DEFAULT_PROFILE });
    items.forEach((raw) => {
      const profile = normalizeProfile(raw);
      if (!profile) return;
      map.set(profile.id, profile);
      if (profile.username) {
        map.set(profile.username, profile);
      }
    });
    return map;
  }

  function resolveProfileRef(rawCreator, profiles) {
    if (!rawCreator) return profiles.get(DEFAULT_PROFILE.id);

    if (typeof rawCreator === "string") {
      return profiles.get(rawCreator) || profiles.get(DEFAULT_PROFILE.id);
    }

    const candidateId =
      rawCreator.profile_id ||
      rawCreator.profileId ||
      rawCreator.id ||
      rawCreator.username ||
      rawCreator.name;

    if (candidateId && profiles.has(String(candidateId))) {
      return profiles.get(String(candidateId));
    }

    const derived = normalizeProfile(rawCreator);
    if (derived) {
      profiles.set(derived.id, derived);
      profiles.set(derived.username, derived);
      return derived;
    }

    return profiles.get(DEFAULT_PROFILE.id);
  }

  function normalizeClip(raw, index, profiles) {
    const id = raw?.id || raw?.clip_id || `clip-${index + 1}`;
    const profile = resolveProfileRef(raw?.creator, profiles);
    const mediaUrl = raw?.media_url || raw?.video_url || raw?.url || null;

    const platform = raw?.platform || profile.platform || "StreamSuites";

    return {
      id,
      type: "clips",
      title: raw?.title || raw?.name || `Clip ${index + 1}`,
      summary: raw?.summary || raw?.description || "Stream clip artifact.",
      status: toTitle(raw?.status || raw?.state || "pending"),
      platform,
      platformKey: normalizePlatformKey(platform),
      platformIcon: platformIconFor(platform),
      duration: raw?.duration || toDuration(raw?.duration_seconds, "--:--"),
      thumbnail: raw?.thumbnail || raw?.thumbnail_url || "/assets/backgrounds/seodash.jpg",
      mediaUrl,
      sourceUrl: pickSourceUrl(raw),
      views: raw?.views ?? raw?.view_count ?? null,
      createdAt: raw?.created_at || raw?.createdAt || null,
      updatedAt: raw?.updated_at || raw?.updatedAt || null,
      profileId: profile.id,
      creator: profile,
      href: `/clips/detail.html?id=${encodeURIComponent(id)}`
    };
  }

  function normalizeOptions(rawOptions) {
    const options = Array.isArray(rawOptions) ? rawOptions : [];
    const fallback = options.length
      ? options
      : [
          { label: "Option A", votes: 0 },
          { label: "Option B", votes: 0 }
        ];

    const total = fallback.reduce((sum, option) => sum + Number(option?.votes ?? option?.count ?? 0), 0);

    const palette = ["#7dd63d", "#6cc6ff", "#ffc24f", "#c595ff", "#56e0cd"];

    return fallback.map((option, index) => {
      const votes = Number(option?.votes ?? option?.count ?? 0) || 0;
      const percent =
        typeof option?.percent === "number"
          ? option.percent
          : total > 0
            ? Math.round((votes / total) * 100)
            : 0;

      return {
        id: option?.id || `opt-${index + 1}`,
        label: option?.label || option?.name || `Option ${index + 1}`,
        votes,
        percent,
        color: option?.color || palette[index % palette.length]
      };
    });
  }

  function normalizePoll(raw, index, profiles) {
    const id = raw?.id || raw?.poll_id || `poll-${index + 1}`;
    const profile = resolveProfileRef(raw?.creator, profiles);
    const options = normalizeOptions(raw?.options || raw?.choices);

    const chartType = String(raw?.chart_type || raw?.chartType || "").toLowerCase() === "pie" ? "pie" : "bar";

    return {
      id,
      type: "polls",
      title: raw?.title || raw?.question || `Poll ${index + 1}`,
      question: raw?.question || raw?.title || `Poll ${index + 1}`,
      summary: raw?.summary || raw?.description || "Community poll artifact.",
      status: toTitle(raw?.status || raw?.state || "pending"),
      options,
      chartType,
      totalVotes: options.reduce((sum, option) => sum + option.votes, 0),
      createdAt: raw?.created_at || raw?.createdAt || null,
      updatedAt: raw?.updated_at || raw?.updatedAt || null,
      closesAt: raw?.closes_at || raw?.closesAt || raw?.closed_at || null,
      sourceUrl: pickSourceUrl(raw),
      platform: profile.platform,
      platformKey: profile.platformKey,
      platformIcon: profile.platformIcon,
      profileId: profile.id,
      creator: profile,
      href: `/polls/detail.html?id=${encodeURIComponent(id)}`,
      resultsHref: `/polls/results.html?id=${encodeURIComponent(id)}`
    };
  }

  function normalizeScoreEntries(rawEntries) {
    const entries = Array.isArray(rawEntries) ? rawEntries : [];
    const fallback = entries.length
      ? entries
      : [
          { label: "Alpha", value: 0 },
          { label: "Bravo", value: 0 },
          { label: "Charlie", value: 0 }
        ];

    const maxValue = fallback.reduce((max, entry) => Math.max(max, Number(entry?.value ?? entry?.score ?? 0) || 0), 0);

    return fallback.map((entry, index) => {
      const value = Number(entry?.value ?? entry?.score ?? entry?.count ?? 0) || 0;
      return {
        id: entry?.id || `entry-${index + 1}`,
        label: entry?.label || entry?.name || `Entry ${index + 1}`,
        value,
        votes: value,
        percent: maxValue > 0 ? Math.round((value / maxValue) * 100) : 0,
        sharePercent: 0,
        color: entry?.color || null
      };
    });
  }

  function normalizeTallyEntries(rawEntries) {
    const entries = normalizeScoreEntries(rawEntries);
    const total = entries.reduce((sum, entry) => sum + entry.value, 0);
    const palette = ["#7dd63d", "#6cc6ff", "#ffc24f", "#c595ff", "#56e0cd"];

    return entries.map((entry, index) => ({
      ...entry,
      sharePercent: total > 0 ? Math.round((entry.value / total) * 100) : 0,
      color: entry.color || palette[index % palette.length]
    }));
  }

  function normalizeScoreboard(raw, index, profiles) {
    const id = raw?.id || raw?.scoreboard_id || `score-${index + 1}`;
    const profile = resolveProfileRef(raw?.creator, profiles);

    return {
      id,
      type: "scoreboards",
      title: raw?.title || raw?.name || `Scoreboard ${index + 1}`,
      summary: raw?.summary || raw?.description || "Scoreboard artifact.",
      status: toTitle(raw?.status || raw?.state || "active"),
      entries: normalizeScoreEntries(raw?.entries || raw?.scores),
      createdAt: raw?.created_at || raw?.createdAt || null,
      updatedAt: raw?.updated_at || raw?.updatedAt || null,
      sourceUrl: pickSourceUrl(raw),
      platform: profile.platform,
      platformKey: profile.platformKey,
      platformIcon: profile.platformIcon,
      profileId: profile.id,
      creator: profile,
      href: `/scoreboards/detail.html?id=${encodeURIComponent(id)}`
    };
  }

  function normalizeTally(raw, index, profiles) {
    const id = raw?.id || raw?.tally_id || `tally-${index + 1}`;
    const profile = resolveProfileRef(raw?.creator, profiles);

    return {
      id,
      type: "tallies",
      title: raw?.title || raw?.name || `Tally ${index + 1}`,
      summary: raw?.summary || raw?.description || "Programmatic tally artifact.",
      status: toTitle(raw?.status || raw?.state || "live"),
      entries: normalizeTallyEntries(raw?.entries || raw?.totals || raw?.options),
      window: raw?.window || raw?.time_window || raw?.scope || "Rolling window",
      createdAt: raw?.created_at || raw?.createdAt || null,
      updatedAt: raw?.updated_at || raw?.updatedAt || null,
      sourceUrl: pickSourceUrl(raw),
      platform: profile.platform,
      platformKey: profile.platformKey,
      platformIcon: profile.platformIcon,
      profileId: profile.id,
      creator: profile,
      href: `/tallies/detail.html?id=${encodeURIComponent(id)}`
    };
  }

  function normalizeNotice(raw, index, profiles) {
    const id = raw?.id || `notice-${index + 1}`;
    const profile = resolveProfileRef(raw?.author || raw?.creator, profiles);
    return {
      id,
      title: raw?.title || "Community notice",
      body: raw?.body || raw?.message || "",
      createdAt: raw?.created_at || raw?.createdAt || null,
      priority: toTitle(raw?.priority || "normal"),
      profileId: profile.id,
      author: profile
    };
  }

  function sortByUpdated(items) {
    return [...items].sort((a, b) => {
      const aStamp = toDateSort(a.updatedAt || a.createdAt);
      const bStamp = toDateSort(b.updatedAt || b.createdAt);
      return bStamp - aStamp;
    });
  }

  function buildProfileArtifacts(data, profileId) {
    const artifacts = [];
    ["clips", "polls", "scoreboards", "tallies"].forEach((key) => {
      (data[key] || []).forEach((item) => {
        if (item.profileId === profileId) artifacts.push(item);
      });
    });
    return sortByUpdated(artifacts);
  }

  async function loadAll() {
    if (cachePromise) return cachePromise;

    cachePromise = (async () => {
      const [
        clipsPayload,
        pollsPayload,
        scoreboardsPayload,
        talliesPayload,
        profilesPayload,
        noticesPayload,
        metaPayload
      ] = await Promise.all([
        loadJson(DATA_PATHS.clips, { items: [] }),
        loadJson(DATA_PATHS.polls, { items: [] }),
        loadJson(DATA_PATHS.scoreboards, { items: [] }),
        loadJson(DATA_PATHS.tallies, { items: [] }),
        loadJson(DATA_PATHS.profiles, { items: [] }),
        loadJson(DATA_PATHS.notices, { items: [] }),
        loadJson(DATA_PATHS.meta, null)
      ]);

      const profileItems = toArray(profilesPayload);
      const profilesMap = buildProfileMap(profileItems);

      const clips = sortByUpdated(toArray(clipsPayload).map((item, index) => normalizeClip(item, index, profilesMap)));
      const polls = sortByUpdated(toArray(pollsPayload).map((item, index) => normalizePoll(item, index, profilesMap)));
      const scoreboards = sortByUpdated(
        toArray(scoreboardsPayload).map((item, index) => normalizeScoreboard(item, index, profilesMap))
      );
      const tallies = sortByUpdated(toArray(talliesPayload).map((item, index) => normalizeTally(item, index, profilesMap)));
      const notices = sortByUpdated(toArray(noticesPayload).map((item, index) => normalizeNotice(item, index, profilesMap)));

      const profileList = [];
      const seen = new Set();
      profilesMap.forEach((profile) => {
        if (!profile || seen.has(profile.id)) return;
        seen.add(profile.id);
        profileList.push(profile);
      });

      const artifactsByProfile = profileList.reduce((acc, profile) => {
        acc[profile.id] = buildProfileArtifacts({ clips, polls, scoreboards, tallies }, profile.id);
        return acc;
      }, {});

      return {
        clips,
        polls,
        scoreboards,
        tallies,
        notices,
        profiles: profileList,
        profilesById: Object.fromEntries(profileList.map((profile) => [profile.id, profile])),
        artifactsByProfile,
        meta: metaPayload,
        helpers: {
          toTimestamp,
          toTitle,
          platformIconFor,
          normalizePlatformKey
        }
      };
    })();

    return cachePromise;
  }

  window.StreamSuitesPublicData = {
    loadAll,
    parseDetailId: () => window.StreamSuitesPublicShell?.parseDetailId?.() || "",
    toTimestamp,
    toTitle,
    DEFAULT_PROFILE,
    platformIconFor,
    normalizePlatformKey
  };
})();
