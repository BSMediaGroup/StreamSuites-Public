(() => {
  const DATA_PATHS = {
    clips: "/data/clips.json",
    polls: "/data/polls.json",
    wheels: ["/shared/state/wheels.json", "/runtime/exports/wheels.json", "/data/wheels.json"],
    scoreboards: "/data/scoreboards.json",
    tallies: "/data/tallies.json",
    profiles: "/api/public/community/members",
    publicAuthorityIdentities: ["/shared/state/public_identities.json", "/runtime/exports/public_identities.json"],
    publicAuthorityArtifacts: ["/shared/state/public_artifacts.json", "/runtime/exports/public_artifacts.json"],
    notices: "/data/notices.json",
    meta: "/data/meta.json",
    liveStatus: ["/shared/state/live_status.json", "/data/live-status.json"],
    rumbleDiscovery: ["/shared/state/rumble_live_discovery.json", "/data/rumble_live_discovery.json"]
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
  const SOCIAL_PLATFORM_REGISTRY = Object.freeze([
    { key: "rumble", label: "Rumble", icon: "/assets/icons/rumble.svg", aliases: ["rumble"], tier: "first-class" },
    { key: "youtube", label: "YouTube", icon: "/assets/icons/youtube.svg", aliases: ["youtube", "yt"], tier: "first-class" },
    { key: "twitch", label: "Twitch", icon: "/assets/icons/twitch.svg", aliases: ["twitch"], tier: "first-class" },
    { key: "kick", label: "Kick", icon: "/assets/icons/kick.svg", aliases: ["kick"], tier: "first-class" },
    { key: "pilled", label: "Pilled", icon: "/assets/icons/pilled.svg", aliases: ["pilled"], tier: "first-class" },
    { key: "discord", label: "Discord", icon: "/assets/icons/discord.svg", aliases: ["discord"], tier: "first-class" },
    { key: "x", label: "X", icon: "/assets/icons/x.svg", aliases: ["x", "twitter"], tier: "first-class" },
    { key: "instagram", label: "Instagram", icon: "/assets/icons/instagram.svg", aliases: ["instagram", "insta"], tier: "first-class" },
    { key: "tiktok", label: "TikTok", icon: "/assets/icons/tiktok.svg", aliases: ["tiktok", "tik_tok"], tier: "first-class" },
    { key: "facebook", label: "Facebook", icon: "/assets/icons/facebook.svg", aliases: ["facebook", "fb"], tier: "first-class" },
    { key: "threads", label: "Threads", icon: "/assets/icons/threads.svg", aliases: ["threads"], tier: "first-class" },
    { key: "reddit", label: "Reddit", icon: "/assets/icons/reddit.svg", aliases: ["reddit"], tier: "first-class" },
    { key: "telegram", label: "Telegram", icon: "/assets/icons/telegram.svg", aliases: ["telegram"], tier: "first-class" },
    {
      key: "whatsappchannels",
      label: "WhatsApp Channels",
      icon: "/assets/icons/whatsapp.svg",
      aliases: ["whatsappchannels", "whatsappchannel", "whatsapp_channels", "whatsapp_channel", "whatsapp"],
      tier: "first-class"
    },
    { key: "patreon", label: "Patreon", icon: "/assets/icons/patreon.svg", aliases: ["patreon"], tier: "first-class" },
    { key: "substack", label: "Substack", icon: "/assets/icons/substack.svg", aliases: ["substack"], tier: "first-class" },
    { key: "soundcloud", label: "SoundCloud", icon: "/assets/icons/soundcloud.svg", aliases: ["soundcloud", "sound_cloud"], tier: "first-class" },
    {
      key: "applepodcasts",
      label: "Apple Podcasts",
      icon: "/assets/icons/applepodcasts.svg",
      aliases: ["applepodcasts", "apple_podcasts", "applepodcast", "apple_podcast"],
      tier: "first-class"
    },
    { key: "website", label: "Website", icon: "/assets/icons/website.svg", aliases: ["website", "site", "web", "url", "homepage"], tier: "first-class" },
    { key: "bluesky", label: "Bluesky", icon: "/assets/icons/bluesky.svg", aliases: ["bluesky", "bsky"], tier: "extended" },
    { key: "locals", label: "Locals", icon: "/assets/icons/locals.svg", aliases: ["locals"], tier: "extended" },
    { key: "spotify", label: "Spotify", icon: "/assets/icons/spotify.svg", aliases: ["spotify"], tier: "extended" },
    { key: "vimeo", label: "Vimeo", icon: "/assets/icons/vimeo.svg", aliases: ["vimeo"], tier: "extended" },
    { key: "dailymotion", label: "Dailymotion", icon: "/assets/icons/dailymotion.svg", aliases: ["dailymotion", "dailymotion"], tier: "extended" },
    { key: "odysee", label: "Odysee", icon: "/assets/icons/odysee.svg", aliases: ["odysee"], tier: "extended" },
    { key: "trovo", label: "Trovo", icon: "/assets/icons/trovo.svg", aliases: ["trovo"], tier: "extended" },
    { key: "snapchat", label: "Snapchat", icon: "/assets/icons/snapchat.svg", aliases: ["snapchat"], tier: "extended" },
    { key: "pinterest", label: "Pinterest", icon: "/assets/icons/pinterest.svg", aliases: ["pinterest"], tier: "extended" },
    { key: "kofi", label: "Ko-fi", icon: "/assets/icons/kofi.svg", aliases: ["kofi", "ko-fi", "ko_fi"], tier: "extended" },
    { key: "github", label: "GitHub", icon: "/assets/icons/github.svg", aliases: ["github"], tier: "extended" },
    { key: "minds", label: "Minds", icon: "/assets/icons/minds.svg", aliases: ["minds"], tier: "extended" },
    { key: "custom", label: "Custom", icon: "/assets/icons/link.svg", aliases: ["custom", "link"], tier: "extended" }
  ]);
  const SOCIAL_PLATFORM_METADATA = Object.freeze(
    SOCIAL_PLATFORM_REGISTRY.reduce((acc, entry, index) => {
      acc[entry.key] = Object.freeze({ ...entry, order: index });
      return acc;
    }, {})
  );
  const SOCIAL_PLATFORM_ALIAS_MAP = Object.freeze(
    SOCIAL_PLATFORM_REGISTRY.reduce((acc, entry) => {
      entry.aliases.forEach((alias) => {
        acc[alias.replace(/[\s_-]+/g, "").toLowerCase()] = entry.key;
      });
      return acc;
    }, {})
  );
  const SOCIAL_PLATFORM_ORDER = Object.freeze(SOCIAL_PLATFORM_REGISTRY.map((entry) => entry.key));
  const AUTHORITATIVE_BADGE_KEYS = new Set([
    "admin",
    "core",
    "gold",
    "pro",
    "founder",
    "moderator",
    "developer"
  ]);

  const DEFAULT_PROFILE = {
    id: "public-user",
    userCode: "public-user",
    publicSlug: "public-user",
    slug: "public-user",
    slugAliases: [],
    username: "public-user",
    displayName: "Public User",
    avatar: FALLBACK_AVATAR,
    platform: "StreamSuites",
    platformKey: "streamsuites",
    role: "viewer",
    tier: "",
    badges: [],
    bio: "Community-visible profile used when creator metadata is unavailable.",
    accountType: "PUBLIC",
    socialLinks: {},
    coverImageUrl: "/assets/placeholders/defaultprofilecover.webp",
    bannerImageUrl: "/assets/placeholders/defaultprofilecover.webp",
    backgroundImageUrl: "",
    isAnonymous: false,
    isListed: true,
    publicSurfaceAccountType: "viewer_only",
    creatorCapable: false,
    viewerOnly: true,
    streamsuitesProfileUrl: "https://streamsuites.app/u/public-user",
    streamsuitesShareUrl: "https://streamsuites.app/u/public-user",
    streamsuitesProfileEnabled: true,
    streamsuitesProfileEligible: true,
    streamsuitesProfileVisible: true,
    streamsuitesProfileStatusReason: "visible",
    findmehereEnabled: false,
    findmehereEligible: false,
    findmehereVisible: false,
    findmehereProfileUrl: "",
    findmehereShareUrl: "",
    findmehereStatusReason: "creator_capable_required",
    liveStatus: null
  };

  const EMPTY_LIVE_STATUS_SNAPSHOT = Object.freeze({
    schema_version: "v1",
    generated_at: null,
    providers: [],
    creators: []
  });
  const EMPTY_RUMBLE_DISCOVERY_SNAPSHOT = Object.freeze({
    schema_version: "v1",
    provider: "rumble",
    generated_at: null,
    scan: {},
    streams: [],
    creators: []
  });
  const EMPTY_PUBLIC_AUTHORITY_IDENTITIES = Object.freeze({
    schema_version: "v1",
    generated_at: null,
    counts: {},
    identities: []
  });
  const EMPTY_PUBLIC_AUTHORITY_ARTIFACTS = Object.freeze({
    schema_version: "v1",
    generated_at: null,
    counts: {},
    artifacts: []
  });
  const AUTHORITATIVE_LIVE_PROVIDERS = new Set(["rumble"]);
  const WHEELS_API_PATH = "/api/public/wheels";
  const CLIP_THUMBNAIL_FALLBACK = "/assets/backgrounds/seodash.jpg";
  const KNOWN_PUBLIC_BACKGROUND_THUMBNAILS = new Set([
    "banner1.webp",
    "fmhwordmarkbg.webp",
    "fmhwordmarkblockbg.webp",
    "seodash.jpg",
    "seodashxs1.png",
    "seoshare.jpg",
    "splash-nutty.webp",
    "splash-streemrz.webp",
    "ss-ytbanner-01.png",
    "ssbansml.webp",
    "sswmbansml.webp",
    "stss-rumblebanner-01.png"
  ]);

  let cachePromise = null;

  function detectFallbackApiBase() {
    const host = String(window.location?.hostname || "").trim().toLowerCase();
    if (host === "localhost" || host === "127.0.0.1") {
      return "http://127.0.0.1:18087";
    }
    return "";
  }

  function resolveApiBase() {
    const apiBaseUrl = window.StreamSuitesAuth?.apiBaseUrl;
    if (typeof apiBaseUrl === "string" && apiBaseUrl.trim()) {
      return apiBaseUrl.replace(/\/$/, "");
    }
    return detectFallbackApiBase();
  }

  const API_BASE = resolveApiBase();

  function isUuidLike(value) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || "").trim());
  }

  function normalizeSocialNetworkKey(value) {
    const normalized = String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[\s_-]+/g, "");
    if (!normalized) return "";
    return SOCIAL_PLATFORM_ALIAS_MAP[normalized] || normalized;
  }

  function normalizeSocialLinks(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    return Object.entries(value).reduce((acc, [key, raw]) => {
      const normalizedKey = normalizeSocialNetworkKey(key);
      const normalizedValue = String(raw || "").trim();
      if (!normalizedKey || !normalizedValue) return acc;
      if (!acc[normalizedKey]) acc[normalizedKey] = normalizedValue;
      return acc;
    }, {});
  }

  function normalizeExternalUrl(url) {
    const raw = String(url || "").trim();
    if (!raw) return "";
    if (/^https?:\/\//i.test(raw)) return raw;
    if (/^(mailto:|tel:)/i.test(raw)) return raw;
    if (/^[a-z][a-z0-9+.-]*:/i.test(raw)) return "";
    return `https://${raw.replace(/^\/+/, "")}`;
  }

  function socialPlatformMeta(key) {
    return SOCIAL_PLATFORM_METADATA[normalizeSocialNetworkKey(key)] || null;
  }

  function socialIconPath(key) {
    return socialPlatformMeta(key)?.icon || "/assets/icons/link.svg";
  }

  function socialLabel(key) {
    const meta = socialPlatformMeta(key);
    if (meta?.label) return meta.label;
    const raw = String(key || "").trim().replace(/[_-]+/g, " ");
    return raw ? raw.replace(/\b\w/g, (char) => char.toUpperCase()) : "Custom";
  }

  function collectOrderedSocialEntries(value) {
    const normalized = normalizeSocialLinks(value);
    const entries = [];
    const seen = new Set();
    SOCIAL_PLATFORM_ORDER.forEach((network) => {
      const url = normalizeExternalUrl(normalized[network]);
      if (!url) return;
      entries.push({
        network,
        url,
        label: socialLabel(network),
        iconPath: socialIconPath(network)
      });
      seen.add(network);
    });
    Object.entries(normalized).forEach(([network, rawUrl]) => {
      if (seen.has(network)) return;
      const url = normalizeExternalUrl(rawUrl);
      if (!url) return;
      entries.push({
        network,
        url,
        label: socialLabel(network),
        iconPath: socialIconPath(network)
      });
    });
    return entries;
  }

  function normalizeProfileLookup(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, "")
      .replace(/[^a-z0-9_]+/g, "")
      .replace(/^_+|_+$/g, "");
  }

  function normalizeCanonicalSlug(value) {
    const raw = String(value || "").trim().toLowerCase().replace(/^@+/, "");
    if (!raw || isUuidLike(raw)) return "";
    return raw
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/-{2,}/g, "-")
      .replace(/^[-_]+|[-_]+$/g, "");
  }

  function normalizeArtifactLookup(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function normalizeAuthorityKey(value) {
    return String(value || "").trim().toLowerCase();
  }

  function normalizePublicAuthorityIdentity(raw) {
    if (!raw || typeof raw !== "object") return null;
    const identityCode = String(raw.identity_code || "").trim();
    if (!identityCode) return null;
    return {
      identityCode,
      identityKind: String(raw.identity_kind || "").trim().toLowerCase(),
      accountUserCode: normalizeAuthorityKey(raw.account_user_code),
      displayName: String(raw.display_name || raw.source_display_name || "").trim(),
      listingState: String(raw.listing_state || "").trim().toLowerCase(),
      sourcePlatform: String(raw.source_platform || "").trim().toLowerCase(),
      sourceDisplayName: String(raw.source_display_name || "").trim(),
      sourceChannelScope: String(raw.source_channel_scope || "").trim(),
      sourceConfidence: String(raw.source_confidence || "").trim().toLowerCase(),
      createdAt: String(raw.created_at || "").trim(),
      updatedAt: String(raw.updated_at || "").trim(),
      assignedAt: String(raw.assigned_at || "").trim()
    };
  }

  function compareAuthorityIdentityPriority(left, right) {
    const score = (entry) => {
      if (!entry) return -1;
      let total = 0;
      if (entry.identityKind === "assigned") total += 20;
      if (entry.listingState === "listed") total += 10;
      if (entry.listingState === "unlisted") total += 5;
      if (entry.sourceConfidence === "observed") total += 3;
      if (entry.assignedAt) total += 2;
      return total;
    };
    return score(right) - score(left);
  }

  function buildPublicAuthorityIdentityMap(payload) {
    const byUserCode = new Map();
    const identities = Array.isArray(payload?.identities) ? payload.identities : [];
    identities
      .map(normalizePublicAuthorityIdentity)
      .filter(Boolean)
      .sort(compareAuthorityIdentityPriority)
      .forEach((identity) => {
        if (!identity.accountUserCode || byUserCode.has(identity.accountUserCode)) return;
        byUserCode.set(identity.accountUserCode, identity);
      });
    return byUserCode;
  }

  function normalizePublicAuthorityArtifact(raw) {
    if (!raw || typeof raw !== "object") return null;
    const artifactCode = String(raw.artifact_code || "").trim();
    if (!artifactCode) return null;
    return {
      artifactCode,
      artifactType: String(raw.artifact_type || "").trim().toLowerCase(),
      ownerIdentityCode: String(raw.owner_identity_code || "").trim(),
      linkedAccountUserCode: normalizeAuthorityKey(raw.linked_account_user_code),
      title: String(raw.title || raw.display_label || "").trim(),
      displayLabel: String(raw.display_label || raw.title || "").trim(),
      visibilityState: String(raw.visibility_state || "").trim().toLowerCase(),
      lifecycleState: String(raw.lifecycle_state || "").trim().toLowerCase(),
      createdAt: String(raw.created_at || "").trim(),
      updatedAt: String(raw.updated_at || "").trim()
    };
  }

  function buildPublicAuthorityArtifactMap(payload) {
    const byCode = new Map();
    const artifacts = Array.isArray(payload?.artifacts) ? payload.artifacts : [];
    artifacts
      .map(normalizePublicAuthorityArtifact)
      .filter(Boolean)
      .forEach((artifact) => {
        byCode.set(artifact.artifactCode, artifact);
      });
    return { byCode };
  }

  function firstArtifactIdentifier(raw, keys) {
    for (const key of keys) {
      const value = String(raw?.[key] || "").trim();
      if (value) return value;
    }
    return "";
  }

  function buildArtifactHref(type, identifier) {
    const encoded = encodeURIComponent(String(identifier || "").trim());
    if (type === "clips") return `/clips/${encoded}`;
    if (type === "polls") return `/polls/${encoded}`;
    if (type === "wheels") return `/wheels/${encoded}`;
    if (type === "scoreboards") return `/scores/${encoded}`;
    if (type === "tallies") return `/tallies/detail.html?id=${encoded}`;
    return `/media.html`;
  }

  function normalizeSlugAliases(value) {
    const items = Array.isArray(value) ? value : [];
    const seen = new Set();
    return items.reduce((acc, entry) => {
      const normalized = normalizeCanonicalSlug(entry);
      if (!normalized || seen.has(normalized)) return acc;
      seen.add(normalized);
      acc.push(normalized);
      return acc;
    }, []);
  }

  function parseViewerCount(value) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) return null;
    return Math.round(parsed);
  }

  function normalizeLiveStatus(raw) {
    if (!raw || typeof raw !== "object") return null;
    const activeStatus =
      raw?.active_status && typeof raw.active_status === "object"
        ? raw.active_status
        : raw?.activeStatus && typeof raw.activeStatus === "object"
          ? raw.activeStatus
          : null;
    const freshness = String(raw?.freshness || "").trim().toLowerCase();
    const stale = raw?.stale === true || freshness === "stale";
    const activeFreshness = String(activeStatus?.freshness || "").trim().toLowerCase();
    const activeStale = activeStatus?.stale === true || activeFreshness === "stale";
    const isLive = raw?.is_live === true || raw?.isLive === true;
    if (!isLive || stale || (activeStatus && (activeStatus?.is_live !== true || activeStale))) {
      return null;
    }

    const provider = String(raw?.active_provider || raw?.activeProvider || activeStatus?.provider || "").trim().toLowerCase();
    if (!AUTHORITATIVE_LIVE_PROVIDERS.has(provider)) return null;
    return {
      isLive: true,
      provider,
      providerLabel: toTitle(provider || "live"),
      title: String(activeStatus?.live_title || activeStatus?.liveTitle || "").trim(),
      url: String(activeStatus?.live_url || activeStatus?.liveUrl || "").trim(),
      viewerCount: parseViewerCount(activeStatus?.viewer_count || activeStatus?.viewerCount),
      startedAt: String(activeStatus?.started_at || activeStatus?.startedAt || "").trim(),
      lastCheckedAt: String(
        raw?.last_checked_at || raw?.lastCheckedAt || activeStatus?.last_checked_at || activeStatus?.lastCheckedAt || ""
      ).trim(),
      thumbnailUrl: String(activeStatus?.thumbnail_url || activeStatus?.thumbnailUrl || "").trim()
    };
  }

  function normalizeRumbleDiscoveryStatus(raw) {
    if (!raw || typeof raw !== "object" || raw?.is_live !== true) return null;
    return {
      isLive: true,
      provider: "rumble",
      providerLabel: "Rumble",
      title: String(raw?.live_title || "").trim(),
      url: String(raw?.live_url || raw?.channel_url || "").trim(),
      viewerCount: parseViewerCount(raw?.viewer_count),
      startedAt: String(raw?.started_at || "").trim(),
      lastCheckedAt: String(raw?.last_checked_at || "").trim(),
      channelUrl: String(raw?.channel_url || "").trim(),
      channelSlug: String(raw?.channel_slug || "").trim(),
      streamKey: String(raw?.stream_key || "").trim(),
      numericVideoId: String(raw?.numeric_video_id || "").trim()
    };
  }

  function mergeLiveStatuses(primary, fallback) {
    if (!primary?.isLive) return fallback?.isLive ? { ...fallback } : null;
    if (!fallback?.isLive || primary.provider !== fallback.provider) return { ...primary };
    return {
      ...fallback,
      ...primary,
      title: primary.title || fallback.title || "",
      url: primary.url || fallback.url || "",
      viewerCount: primary.viewerCount ?? fallback.viewerCount ?? null,
      startedAt: primary.startedAt || fallback.startedAt || "",
      lastCheckedAt: primary.lastCheckedAt || fallback.lastCheckedAt || "",
      thumbnailUrl: primary.thumbnailUrl || fallback.thumbnailUrl || "",
      channelUrl: primary.channelUrl || fallback.channelUrl || "",
      channelSlug: primary.channelSlug || fallback.channelSlug || "",
      streamKey: primary.streamKey || fallback.streamKey || "",
      numericVideoId: primary.numericVideoId || fallback.numericVideoId || ""
    };
  }

  function enrichAuthoritativeLiveStatus(authoritative, discovery) {
    if (!authoritative?.isLive) return null;
    return mergeLiveStatuses(authoritative, discovery);
  }

  function buildRumbleDiscoveryMap(payload) {
    const map = new Map();
    const add = (entry) => {
      const normalized = normalizeRumbleDiscoveryStatus(entry);
      if (!normalized) return;
      [
        entry?.creator_id,
        entry?.display_name,
        entry?.channel_slug,
        entry?.channel_url
      ].forEach((value) => {
        const key = normalizeProfileLookup(value);
        if (key) map.set(key, normalized);
      });
    };

    (Array.isArray(payload?.creators) ? payload.creators : []).forEach(add);
    (Array.isArray(payload?.streams) ? payload.streams : []).forEach((entry) => {
      const matched = entry?.matched_creator;
      add({
        creator_id: matched?.creator_id,
        display_name: matched?.display_name,
        channel_slug: entry?.channel?.slug || matched?.matched_value,
        channel_url: entry?.channel?.canonical_url,
        is_live: entry?.is_live === true,
        live_title: entry?.title,
        live_url: entry?.watch_url,
        viewer_count: entry?.viewer_count,
        started_at: entry?.started_at
      });
    });

    return map;
  }

  function resolveRumbleDiscovery(raw, rumbleDiscoveryMap) {
    const candidates = [
      raw?.id,
      raw?.creator_id,
      raw?.creatorId,
      raw?.public_slug,
      raw?.publicSlug,
      raw?.slug,
      raw?.user_code,
      raw?.userCode,
      raw?.username,
      raw?.display_name,
      raw?.displayName,
      raw?.name,
      raw?.social_links?.rumble,
      raw?.socialLinks?.rumble
    ];
    for (const candidate of candidates) {
      const key = normalizeProfileLookup(candidate);
      if (key && rumbleDiscoveryMap?.has(key)) {
        return rumbleDiscoveryMap.get(key) || null;
      }
    }
    return null;
  }

  function buildLiveStatusMap(payload, rumbleDiscoveryMap = null) {
    const map = new Map();
    const items = Array.isArray(payload?.creators) ? payload.creators : [];
    items.forEach((entry) => {
      const normalized = enrichAuthoritativeLiveStatus(normalizeLiveStatus(entry), resolveRumbleDiscovery(entry, rumbleDiscoveryMap));
      if (!normalized) return;
      [
        entry?.creator_id,
        entry?.creatorId,
        entry?.display_name,
        entry?.displayName
      ].forEach((value) => {
        const key = normalizeProfileLookup(value);
        if (key) map.set(key, normalized);
      });
    });
    return map;
  }

  function hasEmbeddedLiveStatus(raw) {
    if (!raw || typeof raw !== "object") return false;
    return Object.prototype.hasOwnProperty.call(raw, "live_status") || Object.prototype.hasOwnProperty.call(raw, "liveStatus");
  }

  function resolveMappedLiveStatus(raw, liveStatusMap) {
    const candidates = [
      raw?.id,
      raw?.creator_id,
      raw?.creatorId,
      raw?.public_slug,
      raw?.publicSlug,
      raw?.slug,
      raw?.user_code,
      raw?.userCode,
      raw?.username,
      raw?.display_name,
      raw?.displayName,
      raw?.name
    ];
    for (const candidate of candidates) {
      const key = normalizeProfileLookup(candidate);
      if (key && liveStatusMap?.has(key)) {
        return liveStatusMap.get(key) || null;
      }
    }
    return null;
  }

  function resolveLiveStatus(raw, liveStatusMap, rumbleDiscoveryMap = null) {
    const authoritative = resolveMappedLiveStatus(raw, liveStatusMap);
    return enrichAuthoritativeLiveStatus(authoritative, resolveRumbleDiscovery(raw, rumbleDiscoveryMap));
  }

  function toArray(payload) {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.clips)) return payload.clips;
    if (Array.isArray(payload?.polls)) return payload.polls;
    if (Array.isArray(payload?.wheels)) return payload.wheels;
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

  async function loadJsonFromPaths(paths, fallback, options = {}) {
    const candidates = Array.isArray(paths) ? paths : [paths];
    for (const path of candidates) {
      try {
        const response = await fetch(path, {
          cache: "no-store",
          ...(options.sameOrigin ? { credentials: "same-origin" } : {})
        });
        if (!response.ok) continue;
        return await response.json();
      } catch (_err) {
        // Try the next candidate.
      }
    }
    return fallback;
  }

  async function loadJsonResult(path, fallback) {
    try {
      const response = await fetch(path, { cache: "no-store", credentials: "same-origin" });
      if (!response.ok) {
        return {
          ok: false,
          status: response.status,
          payload: fallback
        };
      }
      return {
        ok: true,
        status: response.status,
        payload: await response.json()
      };
    } catch (_err) {
      return {
        ok: false,
        status: 0,
        payload: fallback
      };
    }
  }

  async function loadLiveWheelPayload() {
    try {
      const response = await fetch(`${API_BASE}${WHEELS_API_PATH}`, {
        cache: "no-store",
        credentials: "include",
        headers: {
          Accept: "application/json"
        }
      });
      if (!response.ok) return null;
      const payload = await response.json();
      if (payload?.success === false) return null;
      return payload;
    } catch (_err) {
      return null;
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
    const raw = String(value || "viewer").trim().toLowerCase();
    if (!raw) return "viewer";
    if (raw.includes("admin")) return "admin";
    if (raw.includes("creator")) return "creator";
    return "viewer";
  }

  function normalizeTier(value) {
    const raw = String(value || "").trim().toUpperCase();
    if (!raw) return "";
    if (raw === "OPEN") return "CORE";
    if (["CORE", "GOLD", "PRO"].includes(raw)) return raw;
    return toTitle(raw);
  }

  function normalizeBadgeKey(value) {
    const normalized = String(value || "").trim().toLowerCase();
    return AUTHORITATIVE_BADGE_KEYS.has(normalized) ? normalized : "";
  }

  function buildProfileBadges(role, tier) {
    const tierLabel = normalizeTier(tier || "CORE");
    const tierKey = normalizeBadgeKey(tierLabel);
    const badges = [];
    if (role === "admin") {
      badges.push({
        key: "admin",
        kind: "role",
        value: "admin",
        label: "Admin",
        title: "Administrator"
      });
      return badges;
    }
    if (role === "creator" && tierKey) {
      badges.push({
        key: tierKey,
        kind: "tier",
        value: tierKey,
        label: tierLabel,
        title: `${tierLabel} Creator`
      });
    }
    return badges;
  }

  function normalizeAuthoritativeBadges(value, role, tier) {
    let normalized = [];
    if (Array.isArray(value) && value.length) {
      normalized = value
        .map((badge) => {
          if (!badge || typeof badge !== "object") return null;
          const key = normalizeBadgeKey(badge.key || badge.icon_key || badge.iconKey || badge.value);
          if (!key) return null;
          const rawKind = String(badge.kind || "").trim().toLowerCase();
          const kind =
            rawKind.includes("tier") ? "tier" : rawKind.includes("role") ? "role" : rawKind || (key === "admin" ? "role" : "entitlement");
          return {
            key,
            kind,
            value: key,
            label: String(badge.label || badge.title || key).trim(),
            title: String(badge.title || badge.tooltip || badge.label || key).trim()
          };
        })
        .filter(Boolean);
    }
    if (!normalized.length) {
      normalized = buildProfileBadges(role, tier);
    }
    return normalized;
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

  function normalizeClipThumbnail(raw) {
    const thumbnail = String(raw?.thumbnail || raw?.thumbnail_url || "").trim();
    if (!thumbnail) return CLIP_THUMBNAIL_FALLBACK;
    const localBackgroundMatch = thumbnail.match(/^\/assets\/backgrounds\/([^/?#]+)(?:[?#].*)?$/i);
    if (localBackgroundMatch) {
      const fileName = String(localBackgroundMatch[1] || "").trim().toLowerCase();
      if (!KNOWN_PUBLIC_BACKGROUND_THUMBNAILS.has(fileName)) return CLIP_THUMBNAIL_FALLBACK;
    }
    return thumbnail;
  }

  function normalizeOwnerAccountId(raw) {
    const directKeys = [
      "owner_account_id",
      "ownerAccountId",
      "created_by_account_id",
      "createdByAccountId",
      "account_id",
      "accountId"
    ];
    for (const key of directKeys) {
      const value = String(raw?.[key] || "").trim();
      if (value) return value;
    }

    if (raw?.creator && typeof raw.creator === "object") {
      for (const key of ["account_id", "accountId", "owner_account_id", "ownerAccountId"]) {
        const value = String(raw.creator?.[key] || "").trim();
        if (value) return value;
      }
    }

    return "";
  }

  function resolveRemovalState(raw) {
    const visibility = String(raw?.visibility || "").trim().toLowerCase();
    const state = String(raw?.state || "").trim().toLowerCase();
    const status = String(raw?.status || "").trim().toLowerCase();
    const removedValues = new Set(["removed", "removed_by_owner"]);
    const removedState =
      (removedValues.has(visibility) && visibility) ||
      (removedValues.has(state) && state) ||
      (removedValues.has(status) && status) ||
      "";
    return {
      visibility,
      removedState,
      isRemoved: Boolean(removedState)
    };
  }

  function normalizeProfile(raw, liveStatusMap = null, authorityIdentityMap = null) {
    const id = raw?.id || raw?.profile_id || raw?.user_code || raw?.userCode || raw?.username || raw?.name;
    if (!id) return null;
    const userCodeRaw = raw?.user_code || raw?.userCode || raw?.username || id;
    const normalizedCode = String(userCodeRaw || "public-user")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const userCode = !normalizedCode || isUuidLike(normalizedCode) ? "public-user" : normalizedCode;
    const publicSlug = normalizeCanonicalSlug(raw?.public_slug || raw?.publicSlug || raw?.slug || "");
    const slugAliases = normalizeSlugAliases(raw?.slug_aliases || raw?.slugAliases);

    const accountTypeRaw = String(raw.account_type || raw.accountType || raw.role || "").trim().toUpperCase();
    const role = normalizeRole(raw.role || raw.role_hint || accountTypeRaw);
    const accountType = accountTypeRaw || (role === "admin" ? "ADMIN" : role === "creator" ? "CREATOR" : "PUBLIC");
    const tier = normalizeTier(raw.tier || raw.plan_tier || raw.membership_tier || raw.membershipTier || raw.tier_label);
    const platform = raw.platform || "StreamSuites";
    const socialLinks = normalizeSocialLinks(raw.social_links || raw.socialLinks);
    const coverImageUrl = String(raw.cover_image_url || raw.coverImageUrl || "").trim() || "/assets/placeholders/defaultprofilecover.webp";
    const bannerImageUrl = String(raw.banner_image_url || raw.bannerImageUrl || raw.cover_image_url || raw.coverImageUrl || "").trim() || coverImageUrl;
    const backgroundImageUrl = String(raw.background_image_url || raw.backgroundImageUrl || "").trim();
    const isAnonymous = raw?.is_anonymous === true || raw?.anonymous === true;
    const isListed = raw?.is_listed !== false && raw?.listed !== false;
    const creatorCapable = raw?.creator_capable === true;
    const viewerOnly = raw?.viewer_only === true || (!creatorCapable && String(raw?.public_surface_account_type || "").trim() === "viewer_only");
    const streamsuitesProfileUrl = String(raw?.streamsuites_profile_url || raw?.streamsuitesProfileUrl || "").trim();
    const streamsuitesShareUrl = String(raw?.streamsuites_share_url || raw?.streamsuitesShareUrl || streamsuitesProfileUrl).trim();
    const streamsuitesProfileEnabled = raw?.streamsuites_profile_enabled !== false && raw?.streamsuitesProfileEnabled !== false;
    const streamsuitesProfileEligible = raw?.streamsuites_profile_eligible !== false && raw?.streamsuitesProfileEligible !== false;
    const streamsuitesProfileVisible =
      raw?.streamsuites_profile_visible === true ||
      raw?.streamsuitesProfileVisible === true ||
      (streamsuitesProfileEnabled && streamsuitesProfileEligible && !("streamsuites_profile_visible" in (raw || {})) && !("streamsuitesProfileVisible" in (raw || {})));
    const streamsuitesProfileStatusReason = String(
      raw?.streamsuites_profile_status_reason || raw?.streamsuitesProfileStatusReason || (streamsuitesProfileVisible ? "visible" : "")
    ).trim();
    const findmehereEnabled = raw?.findmehere_enabled === true || raw?.findmehereEnabled === true;
    const findmehereEligible = raw?.findmehere_eligible === true || raw?.findmehereEligible === true;
    const findmehereVisible = raw?.findmehere_visible === true || raw?.findmehereVisible === true;
    const findmehereProfileUrl = String(raw?.findmehere_profile_url || raw?.findmehereProfileUrl || "").trim();
    const findmehereShareUrl = String(raw?.findmehere_share_url || raw?.findmehereShareUrl || findmehereProfileUrl).trim();
    const findmehereStatusReason = String(raw?.findmehere_status_reason || raw?.findmehereStatusReason || "").trim();

    const authorityIdentity =
      authorityIdentityMap?.get(normalizeAuthorityKey(raw?.user_code || raw?.userCode || raw?.username || id)) || null;

    return {
      id: userCode || String(id),
      userCode,
      publicSlug,
      slug: publicSlug,
      slugAliases,
      username: String(raw.username || raw.handle || id),
      displayName: raw.display_name || raw.displayName || raw.name || String(id),
      avatar: raw.avatar || raw.avatar_url || FALLBACK_AVATAR,
      platform,
      platformKey: normalizePlatformKey(platform),
      platformIcon: platformIconFor(platform),
      role,
      accountType,
      tier,
      joinedAt: raw?.joined_at || raw?.joinedAt || raw?.created_at || raw?.createdAt || null,
      createdAt: raw?.created_at || raw?.createdAt || null,
      badges: normalizeAuthoritativeBadges(
        raw?.badges || raw?.display_badges || raw?.displayBadges,
        role,
        tier
      ),
      bio: raw.bio || raw.summary || "",
      socialLinks,
      coverImageUrl,
      bannerImageUrl,
      backgroundImageUrl,
      isAnonymous,
      isListed,
      publicSurfaceAccountType: String(raw?.public_surface_account_type || raw?.publicSurfaceAccountType || (creatorCapable ? "creator_capable" : "viewer_only")).trim(),
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
      liveStatus: resolveLiveStatus(raw, liveStatusMap),
      authorityIdentity
    };
  }

  function indexProfile(map, profile) {
    [
      profile?.id,
      profile?.publicSlug,
      profile?.slug,
      ...(Array.isArray(profile?.slugAliases) ? profile.slugAliases : []),
      profile?.userCode,
      profile?.username
    ].forEach((value) => {
      const raw = String(value || "").trim();
      const normalized = normalizeProfileLookup(raw);
      if (!normalized) return;
      map.set(raw, profile);
      map.set(normalized, profile);
    });
  }

  function buildProfileMap(items, liveStatusMap = null, authorityIdentityMap = null) {
    const map = new Map();
    indexProfile(map, { ...DEFAULT_PROFILE });
    items.forEach((raw) => {
      const profile = normalizeProfile(raw, liveStatusMap, authorityIdentityMap);
      if (!profile) return;
      indexProfile(map, profile);
    });
    return map;
  }

  function resolveProfileRef(rawCreator, profiles) {
    if (!rawCreator) return profiles.get(DEFAULT_PROFILE.id);

    if (typeof rawCreator === "string") {
      const byRaw = profiles.get(rawCreator);
      if (byRaw) return byRaw;
      const byNormalized = profiles.get(normalizeProfileLookup(rawCreator));
      return byNormalized || profiles.get(DEFAULT_PROFILE.id);
    }

    const candidateId =
      rawCreator.public_slug ||
      rawCreator.publicSlug ||
      rawCreator.slug ||
      rawCreator.profile_id ||
      rawCreator.profileId ||
      rawCreator.user_code ||
      rawCreator.userCode ||
      rawCreator.profile_code ||
      rawCreator.profileCode ||
      rawCreator.id ||
      rawCreator.username ||
      rawCreator.name;

    if (candidateId) {
      const byRaw = profiles.get(String(candidateId));
      if (byRaw) return byRaw;
      const byNormalized = profiles.get(normalizeProfileLookup(candidateId));
      if (byNormalized) return byNormalized;
    }

    const derived = normalizeProfile(rawCreator);
    if (derived) {
      indexProfile(profiles, derived);
      return derived;
    }

    return profiles.get(DEFAULT_PROFILE.id);
  }

  function normalizeClip(raw, index, profiles, authorityArtifacts = null) {
    const id = raw?.id || raw?.clip_id || `clip-${index + 1}`;
    const routeId =
      firstArtifactIdentifier(raw, ["public_slug", "slug", "clip_slug", "clipSlug", "canonical_id", "canonicalId"]) || id;
    const profile = resolveProfileRef(raw?.creator, profiles);
    const mediaUrl = raw?.media_url || raw?.video_url || raw?.url || null;
    const removal = resolveRemovalState(raw);

    const platform = raw?.platform || profile.platform || "StreamSuites";

    const authorityArtifactCode = String(raw?.artifact_code || raw?.artifactCode || "").trim();

    return {
      id,
      type: "clips",
      title: raw?.title || raw?.name || `Clip ${index + 1}`,
      summary: raw?.summary || raw?.description || "Stream clip artifact.",
      status: removal.isRemoved ? "Removed" : toTitle(raw?.status || raw?.state || "pending"),
      platform,
      platformKey: normalizePlatformKey(platform),
      platformIcon: platformIconFor(platform),
      duration: raw?.duration || toDuration(raw?.duration_seconds, "--:--"),
      thumbnail: normalizeClipThumbnail(raw),
      mediaUrl,
      sourceUrl: pickSourceUrl(raw),
      views: raw?.views ?? raw?.view_count ?? null,
      createdAt: raw?.created_at || raw?.createdAt || null,
      updatedAt: raw?.updated_at || raw?.updatedAt || null,
      ownerAccountId: normalizeOwnerAccountId(raw),
      visibility: removal.visibility,
      removedState: removal.removedState,
      isRemoved: removal.isRemoved,
      routeId,
      routeKeys: [id, routeId].map(normalizeArtifactLookup).filter(Boolean),
      profileId: profile.id,
      profileCode: profile.publicSlug || profile.userCode || profile.username || profile.id,
      creator: profile,
      authorityArtifact:
        authorityArtifactCode && authorityArtifacts?.byCode?.has(authorityArtifactCode)
          ? authorityArtifacts.byCode.get(authorityArtifactCode)
          : null,
      href: buildArtifactHref("clips", routeId)
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

  function normalizePoll(raw, index, profiles, authorityArtifacts = null) {
    const id = raw?.id || raw?.poll_id || `poll-${index + 1}`;
    const routeId =
      firstArtifactIdentifier(raw, ["public_slug", "slug", "poll_slug", "pollSlug", "canonical_id", "canonicalId"]) || id;
    const profile = resolveProfileRef(raw?.creator, profiles);
    const options = normalizeOptions(raw?.options || raw?.choices);
    const removal = resolveRemovalState(raw);

    const chartType = String(raw?.chart_type || raw?.chartType || "").toLowerCase() === "pie" ? "pie" : "bar";

    const authorityArtifactCode = String(raw?.artifact_code || raw?.artifactCode || "").trim();

    return {
      id,
      type: "polls",
      title: raw?.title || raw?.question || `Poll ${index + 1}`,
      question: raw?.question || raw?.title || `Poll ${index + 1}`,
      summary: raw?.summary || raw?.description || "Community poll artifact.",
      status: removal.isRemoved ? "Removed" : toTitle(raw?.status || raw?.state || "pending"),
      options,
      chartType,
      totalVotes: options.reduce((sum, option) => sum + option.votes, 0),
      createdAt: raw?.created_at || raw?.createdAt || null,
      updatedAt: raw?.updated_at || raw?.updatedAt || null,
      closesAt: raw?.closes_at || raw?.closesAt || raw?.closed_at || null,
      sourceUrl: pickSourceUrl(raw),
      ownerAccountId: normalizeOwnerAccountId(raw),
      visibility: removal.visibility,
      removedState: removal.removedState,
      isRemoved: removal.isRemoved,
      routeId,
      routeKeys: [id, routeId].map(normalizeArtifactLookup).filter(Boolean),
      platform: profile.platform,
      platformKey: profile.platformKey,
      platformIcon: profile.platformIcon,
      profileId: profile.id,
      profileCode: profile.publicSlug || profile.userCode || profile.username || profile.id,
      creator: profile,
      authorityArtifact:
        authorityArtifactCode && authorityArtifacts?.byCode?.has(authorityArtifactCode)
          ? authorityArtifacts.byCode.get(authorityArtifactCode)
          : null,
      href: buildArtifactHref("polls", routeId),
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

  function normalizeWheelEntries(rawEntries) {
    const entries = Array.isArray(rawEntries) ? rawEntries : [];
    const fallback = entries.length
      ? entries
      : [
          { label: "Alpha", weight: 1, color: "#ff6b6b" },
          { label: "Bravo", weight: 1, color: "#ffd166" },
          { label: "Charlie", weight: 1, color: "#06d6a0" }
        ];

    const totalWeight = fallback.reduce((sum, entry) => {
      const weight = Number(entry?.weight ?? entry?.value ?? 1);
      return sum + (Number.isFinite(weight) && weight > 0 ? weight : 1);
    }, 0);

    return fallback.map((entry, index) => {
      const weight = Number(entry?.weight ?? entry?.value ?? 1);
      const resolvedWeight = Number.isFinite(weight) && weight > 0 ? weight : 1;
      const share = Number(entry?.share);
      const resolvedShare = Number.isFinite(share) && share > 0 ? share : resolvedWeight;
      const percent = totalWeight > 0 ? Math.round((resolvedWeight / totalWeight) * 100) : 0;
      const assignment = entry?.assignment && typeof entry.assignment === "object" ? entry.assignment : null;
      const displayName = String(entry?.display_name || entry?.label || entry?.name || `Entry ${index + 1}`).trim() || `Entry ${index + 1}`;
      return {
        id: entry?.entry_id || entry?.entryId || entry?.id || `entry-${index + 1}`,
        entryId: entry?.entry_id || entry?.entryId || entry?.id || `entry-${index + 1}`,
        label: entry?.label || entry?.name || displayName,
        displayName,
        avatarUrl: String(entry?.avatar_url || assignment?.avatar_url || "").trim(),
        weight: resolvedWeight,
        share: resolvedShare,
        value: resolvedWeight,
        votes: resolvedWeight,
        percent,
        sharePercent: percent,
        color: entry?.color || ["#ff6b6b", "#ffd166", "#06d6a0", "#118ab2", "#9b5de5", "#f15bb5"][index % 6],
        notes: String(entry?.notes || "").trim(),
        assignment: assignment
          ? {
              accountId: String(assignment.account_id || "").trim(),
              userCode: String(assignment.user_code || "").trim(),
              displayName: String(assignment.display_name || displayName).trim() || displayName,
              avatarUrl: String(assignment.avatar_url || "").trim(),
              role: String(assignment.role || "").trim(),
              tier: String(assignment.tier || "").trim(),
              publicSlug: String(assignment.public_slug || "").trim(),
              badges: Array.isArray(assignment.badges) ? assignment.badges : [],
              publicProfile:
                assignment.public_profile && typeof assignment.public_profile === "object"
                  ? assignment.public_profile
                  : null
            }
          : null,
        roleBadges: Array.isArray(entry?.role_badges) ? entry.role_badges : [],
        statsStub: entry?.stats_stub && typeof entry.stats_stub === "object" ? entry.stats_stub : {}
      };
    });
  }

  function normalizeWheel(raw, index, profiles, authorityArtifacts = null) {
    const artifactCode = String(raw?.artifact_code || raw?.artifactCode || raw?.id || `wheel-${index + 1}`).trim();
    const defaultSlug = String(raw?.default_slug || raw?.defaultSlug || raw?.slug || "").trim();
    const customSlug = String(raw?.custom_slug || raw?.customSlug || "").trim();
    const shortlinkSlug = String(raw?.shortlink_slug || raw?.shortlinkSlug || "").trim();
    const slug = customSlug || String(raw?.slug || defaultSlug).trim();
    const slugAliases = Array.isArray(raw?.slug_aliases || raw?.slugAliases)
      ? (raw?.slug_aliases || raw?.slugAliases).map((value) => String(value || "").trim()).filter(Boolean)
      : [];
    const routeId =
      firstArtifactIdentifier(
        { ...raw, slug, default_slug: defaultSlug, custom_slug: customSlug, shortlink_slug: shortlinkSlug },
        ["custom_slug", "customSlug", "default_slug", "defaultSlug", "slug", "public_slug", "publicSlug", "artifact_code", "artifactCode", "id"]
      ) || artifactCode;
    const creatorRef =
      raw?.creator && typeof raw.creator === "object"
        ? { role: "creator", platform: "StreamSuites", ...raw.creator }
        : raw?.creator;
    const profile = resolveProfileRef(creatorRef, profiles);
    const removal = resolveRemovalState(raw);
    const entries = normalizeWheelEntries(raw?.entries);
    const totalWeight = entries.reduce((sum, entry) => sum + (Number(entry?.weight) || 0), 0);
    const scoreboardEntries = [...entries]
      .sort((left, right) => (Number(right?.weight) || 0) - (Number(left?.weight) || 0) || String(left?.label || "").localeCompare(String(right?.label || "")))
      .map((entry, position) => ({
        ...entry,
        rank: position + 1
      }));
    const palette = raw?.palette && typeof raw.palette === "object" ? raw.palette : {};
    const presentation = raw?.presentation && typeof raw.presentation === "object" ? raw.presentation : {};

    return {
      id: artifactCode,
      artifactCode,
      artifactType: "wheel",
      sourceType: "wheel",
      viewFamily: "wheel",
      type: "wheels",
      title: raw?.title || raw?.name || `Wheel ${index + 1}`,
      summary: raw?.summary || raw?.description || raw?.notes || "Portable wheel artifact.",
      description: raw?.description || "",
      notes: raw?.notes || "",
      status: removal.isRemoved ? "Removed" : toTitle(raw?.status || raw?.state || "active"),
      defaultDisplayMode: String(raw?.default_display_mode || raw?.defaultDisplayMode || "wheel").trim().toLowerCase() === "scoreboard" ? "scoreboard" : "wheel",
      winnerLimit: Number.isFinite(Number(raw?.winner_limit ?? raw?.max_winners))
        ? Math.max(1, Math.min(100, Number(raw?.winner_limit ?? raw?.max_winners)))
        : 1,
      allowDuplicates: raw?.allow_duplicates !== false && raw?.allowDuplicates !== false,
      autoRemoveWinner: raw?.auto_remove_winner === true || raw?.autoRemoveWinner === true,
      entries,
      scoreboardEntries,
      entryCount: entries.length,
      totalWeight,
      palette: {
        segment_colors: Array.isArray(palette.segment_colors) ? palette.segment_colors : [],
        background_color: String(palette.background_color || "#0f172a").trim() || "#0f172a",
        text_color: String(palette.text_color || "#f8fafc").trim() || "#f8fafc",
        accent_color: String(palette.accent_color || "#38bdf8").trim() || "#38bdf8",
        trim_color: String(palette.trim_color || palette.accent_color || "#7c92ff").trim() || "#7c92ff",
        glow_color: String(palette.glow_color || palette.accent_color || "#4de9ff").trim() || "#4de9ff"
      },
      presentation: {
        animation_enabled: presentation.animation_enabled !== false,
        sound_enabled: presentation.sound_enabled !== false,
        celebration_enabled: presentation.celebration_enabled !== false,
        confetti_enabled: presentation.confetti_enabled === true || presentation.celebration_enabled === true,
        show_entry_labels: presentation.show_entry_labels !== false,
        show_display_names_on_slices: presentation.show_display_names_on_slices !== false,
        slice_label_mode: ["full_name", "initials", "avatar"].includes(String(presentation.slice_label_mode || "").trim())
          ? String(presentation.slice_label_mode).trim()
          : "full_name",
        center_image_url:
          String(
            presentation.center_image_url ||
              presentation.centerImageUrl ||
              "/assets/placeholders/wheelcenterdefault.webp"
          ).trim() || "/assets/placeholders/wheelcenterdefault.webp",
        spin_owner_only:
          presentation.spin_owner_only === true ||
          presentation.spinOwnerOnly === true ||
          presentation.owner_spin_only === true ||
          presentation.ownerSpinOnly === true,
        slow_drift_enabled: presentation.slow_drift_enabled !== false,
        spin_duration_ms: Number.isFinite(Number(presentation.spin_duration_ms)) ? Number(presentation.spin_duration_ms) : 8500,
        scoreboard_max_rows: Number.isFinite(Number(presentation.scoreboard_max_rows)) ? Number(presentation.scoreboard_max_rows) : 24,
        sound:
          presentation.sound && typeof presentation.sound === "object"
            ? presentation.sound
            : presentation.sound_config && typeof presentation.sound_config === "object"
              ? presentation.sound_config
              : {}
      },
      unsupportedImportFields: Array.isArray(raw?.unsupported_import_fields)
        ? raw.unsupported_import_fields.map((value) => String(value || "").trim()).filter(Boolean)
        : [],
      importProvenance: raw?.import_provenance && typeof raw.import_provenance === "object" ? raw.import_provenance : {},
      provenance: String(raw?.provenance || "manual").trim() || "manual",
      sourcePlatform: String(raw?.source_platform || "").trim(),
      createdAt: raw?.created_at || raw?.createdAt || null,
      updatedAt: raw?.updated_at || raw?.updatedAt || null,
      ownerAccountId: normalizeOwnerAccountId(raw) || String(raw?.creator?.account_id || raw?.creator?.accountId || "").trim(),
      visibility: removal.visibility || String(raw?.visibility || "listed").trim().toLowerCase(),
      removedState: removal.removedState,
      isRemoved: removal.isRemoved,
      slug,
      defaultSlug,
      customSlug,
      shortlinkSlug,
      slugAliases,
      routeId,
      routeKeys: [artifactCode, slug, defaultSlug, customSlug, shortlinkSlug, routeId, ...slugAliases]
        .map(normalizeArtifactLookup)
        .filter(Boolean),
      platform: profile.platform,
      platformKey: profile.platformKey,
      platformIcon: profile.platformIcon,
      profileId: profile.id,
      profileCode: profile.publicSlug || profile.userCode || profile.username || profile.id,
      creator: profile,
      authorityArtifact:
        artifactCode && authorityArtifacts?.byCode?.has(artifactCode)
          ? authorityArtifacts.byCode.get(artifactCode)
          : null,
      href: buildArtifactHref("wheels", routeId),
      scoreboardHref: buildArtifactHref("scoreboards", routeId)
    };
  }

  function buildScoreboardLensFromWheel(wheel) {
    return {
      ...wheel,
      type: "scoreboards",
      href: wheel.scoreboardHref,
      wheelHref: wheel.href,
      summary: wheel.summary || "Wheel artifact rendered in list view mode."
    };
  }

  function normalizeScoreboard(raw, index, profiles, authorityArtifacts = null) {
    const id = raw?.id || raw?.scoreboard_id || `score-${index + 1}`;
    const routeId =
      firstArtifactIdentifier(raw, ["public_slug", "slug", "score_slug", "scoreSlug", "scoreboard_slug", "scoreboardSlug", "canonical_id", "canonicalId"]) || id;
    const profile = resolveProfileRef(raw?.creator, profiles);
    const removal = resolveRemovalState(raw);

    const authorityArtifactCode = String(raw?.artifact_code || raw?.artifactCode || "").trim();

    return {
      id,
      type: "scoreboards",
      title: raw?.title || raw?.name || `Scoreboard ${index + 1}`,
      summary: raw?.summary || raw?.description || "Scoreboard artifact.",
      status: removal.isRemoved ? "Removed" : toTitle(raw?.status || raw?.state || "active"),
      entries: normalizeScoreEntries(raw?.entries || raw?.scores),
      createdAt: raw?.created_at || raw?.createdAt || null,
      updatedAt: raw?.updated_at || raw?.updatedAt || null,
      sourceUrl: pickSourceUrl(raw),
      ownerAccountId: normalizeOwnerAccountId(raw),
      visibility: removal.visibility,
      removedState: removal.removedState,
      isRemoved: removal.isRemoved,
      routeId,
      routeKeys: [id, routeId].map(normalizeArtifactLookup).filter(Boolean),
      platform: profile.platform,
      platformKey: profile.platformKey,
      platformIcon: profile.platformIcon,
      profileId: profile.id,
      profileCode: profile.publicSlug || profile.userCode || profile.username || profile.id,
      creator: profile,
      authorityArtifact:
        authorityArtifactCode && authorityArtifacts?.byCode?.has(authorityArtifactCode)
          ? authorityArtifacts.byCode.get(authorityArtifactCode)
          : null,
      href: buildArtifactHref("scoreboards", routeId)
    };
  }

  function normalizeTally(raw, index, profiles, authorityArtifacts = null) {
    const id = raw?.id || raw?.tally_id || `tally-${index + 1}`;
    const profile = resolveProfileRef(raw?.creator, profiles);
    const removal = resolveRemovalState(raw);

    const authorityArtifactCode = String(raw?.artifact_code || raw?.artifactCode || "").trim();

    return {
      id,
      type: "tallies",
      title: raw?.title || raw?.name || `Tally ${index + 1}`,
      summary: raw?.summary || raw?.description || "Programmatic tally artifact.",
      status: removal.isRemoved ? "Removed" : toTitle(raw?.status || raw?.state || "live"),
      entries: normalizeTallyEntries(raw?.entries || raw?.totals || raw?.options),
      window: raw?.window || raw?.time_window || raw?.scope || "Rolling window",
      createdAt: raw?.created_at || raw?.createdAt || null,
      updatedAt: raw?.updated_at || raw?.updatedAt || null,
      sourceUrl: pickSourceUrl(raw),
      ownerAccountId: normalizeOwnerAccountId(raw),
      visibility: removal.visibility,
      removedState: removal.removedState,
      isRemoved: removal.isRemoved,
      platform: profile.platform,
      platformKey: profile.platformKey,
      platformIcon: profile.platformIcon,
      profileId: profile.id,
      profileCode: profile.publicSlug || profile.userCode || profile.username || profile.id,
      creator: profile,
      authorityArtifact:
        authorityArtifactCode && authorityArtifacts?.byCode?.has(authorityArtifactCode)
          ? authorityArtifacts.byCode.get(authorityArtifactCode)
          : null,
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
        if (item.profileId === profileId && !item.isRemoved) artifacts.push(item);
      });
    });
    return sortByUpdated(artifacts);
  }

  async function loadAll(options = {}) {
    if (options.force === true) {
      cachePromise = null;
    }
    if (cachePromise) return cachePromise;

    cachePromise = (async () => {
      const [
        clipsPayload,
        pollsPayload,
        wheelsApiPayload,
        wheelsMirrorPayload,
        talliesPayload,
        profilesResult,
        authorityIdentitiesPayload,
        authorityArtifactsPayload,
        noticesPayload,
        metaPayload,
        liveStatusPayload,
        rumbleDiscoveryPayload
      ] = await Promise.all([
        loadJson(DATA_PATHS.clips, { items: [] }),
        loadJson(DATA_PATHS.polls, { items: [] }),
        loadLiveWheelPayload(),
        loadJsonFromPaths(DATA_PATHS.wheels, { wheels: [] }),
        loadJson(DATA_PATHS.tallies, { items: [] }),
        loadJsonResult(DATA_PATHS.profiles, { items: [] }),
        loadJsonFromPaths(DATA_PATHS.publicAuthorityIdentities, EMPTY_PUBLIC_AUTHORITY_IDENTITIES),
        loadJsonFromPaths(DATA_PATHS.publicAuthorityArtifacts, EMPTY_PUBLIC_AUTHORITY_ARTIFACTS),
        loadJson(DATA_PATHS.notices, { items: [] }),
        loadJson(DATA_PATHS.meta, null),
        loadJsonFromPaths(DATA_PATHS.liveStatus, EMPTY_LIVE_STATUS_SNAPSHOT),
        loadJsonFromPaths(DATA_PATHS.rumbleDiscovery, EMPTY_RUMBLE_DISCOVERY_SNAPSHOT)
      ]);

      const profilesPayload = profilesResult.payload;
      const profileItems = toArray(profilesPayload);
      const rumbleDiscoveryMap = buildRumbleDiscoveryMap(rumbleDiscoveryPayload);
      const liveStatusMap = buildLiveStatusMap(liveStatusPayload, rumbleDiscoveryMap);
      const authorityIdentityMap = buildPublicAuthorityIdentityMap(authorityIdentitiesPayload);
      const authorityArtifacts = buildPublicAuthorityArtifactMap(authorityArtifactsPayload);
      const profilesMap = buildProfileMap(profileItems, liveStatusMap, authorityIdentityMap);

      const clips = sortByUpdated(toArray(clipsPayload).map((item, index) => normalizeClip(item, index, profilesMap, authorityArtifacts)));
      const polls = sortByUpdated(toArray(pollsPayload).map((item, index) => normalizePoll(item, index, profilesMap, authorityArtifacts)));
      const wheelsPayload = wheelsApiPayload && Array.isArray(wheelsApiPayload.items)
        ? { wheels: wheelsApiPayload.items }
        : wheelsMirrorPayload;
      const wheels = sortByUpdated(toArray(wheelsPayload).map((item, index) => normalizeWheel(item, index, profilesMap, authorityArtifacts)));
      const scoreboards = sortByUpdated(wheels.map((item) => buildScoreboardLensFromWheel(item)));
      const tallies = sortByUpdated(toArray(talliesPayload).map((item, index) => normalizeTally(item, index, profilesMap, authorityArtifacts)));
      const notices = sortByUpdated(toArray(noticesPayload).map((item, index) => normalizeNotice(item, index, profilesMap)));

      const profileList = [];
      const seen = new Set();
      profilesMap.forEach((profile) => {
        if (!profile || seen.has(profile.id)) return;
        seen.add(profile.id);
        profileList.push(profile);
      });

      const artifactsByProfile = profileList.reduce((acc, profile) => {
        const artifacts = buildProfileArtifacts({ clips, polls, wheels, tallies }, profile.id);
        [
          profile?.id,
          profile?.publicSlug,
          profile?.slug,
          ...(Array.isArray(profile?.slugAliases) ? profile.slugAliases : []),
          profile?.userCode,
          profile?.username
        ].forEach((key) => {
          const normalized = normalizeProfileLookup(key);
          if (normalized) acc[normalized] = artifacts;
        });
        return acc;
      }, {});

      return {
        clips,
        polls,
        wheels,
        scoreboards,
        tallies,
        notices,
        profiles: profileList,
        profilesById: Object.fromEntries(profileList.map((profile) => [profile.id, profile])),
        profilesBySlug: Object.fromEntries(
          profileList.flatMap((profile) => {
            const keys = [
              profile?.publicSlug,
              profile?.slug,
              ...(Array.isArray(profile?.slugAliases) ? profile.slugAliases : [])
            ]
              .map((value) => normalizeProfileLookup(value))
              .filter(Boolean);
            return keys.map((key) => [key, profile]);
          })
        ),
        profilesByCode: Object.fromEntries(profileList.map((profile) => [profile.userCode || profile.id, profile])),
        artifactsByProfile,
        meta: metaPayload,
        liveStatus: liveStatusPayload,
        rumbleDiscovery: rumbleDiscoveryPayload,
        authority: {
          identities: authorityIdentitiesPayload,
          artifacts: authorityArtifactsPayload,
          identityByUserCode: authorityIdentityMap,
          artifactByCode: authorityArtifacts.byCode
        },
        sourceStatus: {
          wheels: {
            ok: Boolean(wheelsApiPayload && Array.isArray(wheelsApiPayload.items)),
            mode: wheelsApiPayload && Array.isArray(wheelsApiPayload.items) ? "api" : "mirror",
            path: wheelsApiPayload && Array.isArray(wheelsApiPayload.items) ? `${API_BASE}${WHEELS_API_PATH}` : DATA_PATHS.wheels[0]
          },
          profiles: {
            ok: profilesResult.ok,
            status: profilesResult.status,
            path: DATA_PATHS.profiles
          }
        },
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
    invalidateCache: () => {
      cachePromise = null;
    },
    parseDetailId: () => window.StreamSuitesPublicShell?.parseDetailId?.() || "",
    toTimestamp,
    toTitle,
    DEFAULT_PROFILE,
    buildArtifactHref,
    normalizeArtifactLookup,
    normalizeLiveStatus,
    mergeLiveStatuses,
    buildRumbleDiscoveryMap,
    buildLiveStatusMap,
    resolveLiveStatus,
    platformIconFor,
    normalizePlatformKey,
    SOCIAL_PLATFORM_REGISTRY,
    normalizeSocialNetworkKey,
    normalizeSocialLinks,
    collectOrderedSocialEntries,
    socialIconPath,
    socialLabel
  };
})();
