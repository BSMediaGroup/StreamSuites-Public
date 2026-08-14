const DEFAULT_AUTH_API_ORIGIN = "https://api.streamsuites.app";
const PUBLIC_ORIGIN = "https://streamsuites.app";
const PROFILE_LOOKUP_TIMEOUT_MS = 2500;
const SHARE_IMAGE_PATH = "/assets/backgrounds/seoshare.jpg";

function resolveUpstreamOrigin(env) {
  const raw = String(env?.STREAMSUITES_API_ORIGIN || DEFAULT_AUTH_API_ORIGIN).trim();
  try {
    const parsed = new URL(raw);
    if (!/^https?:$/.test(parsed.protocol)) {
      throw new Error("invalid protocol");
    }
    parsed.pathname = "/";
    parsed.search = "";
    parsed.hash = "";
    return parsed;
  } catch (_error) {
    return new URL(DEFAULT_AUTH_API_ORIGIN);
  }
}

function decodeSlug(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    return decodeURIComponent(raw);
  } catch (_error) {
    return raw;
  }
}

function normalizeSlug(value) {
  return decodeSlug(value)
    .trim()
    .toLowerCase()
    .replace(/^@+/, "")
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9_-]+/g, "")
    .replace(/^[-_]+|[-_]+$/g, "");
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeJsonForScript(value) {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

function resolveHttpsAssetUrl(value, requestUrl) {
  const raw = String(value || "").trim();
  const fallback = new URL(SHARE_IMAGE_PATH, PUBLIC_ORIGIN).toString();
  if (!raw) return fallback;

  try {
    const base = requestUrl.protocol === "https:" ? requestUrl.origin : PUBLIC_ORIGIN;
    const parsed = new URL(raw, base);
    const localRequest = requestUrl.protocol === "http:"
      && ["127.0.0.1", "localhost"].includes(requestUrl.hostname)
      && parsed.origin === requestUrl.origin;
    if (parsed.protocol !== "https:" && !localRequest) return fallback;
    return parsed.toString();
  } catch (_error) {
    return fallback;
  }
}

function resolveOptionalHttpsAssetUrl(value, requestUrl) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  let resolved = resolveHttpsAssetUrl(raw, requestUrl);
  try {
    const parsed = new URL(resolved);
    if (
      ["cdn.streamsuites.app", "api.streamsuites.app"].includes(parsed.hostname) &&
      /^\/u\/[A-Za-z0-9]{7}\/(avatar|cover|background|logo)\/v[1-9]\d*\.webp$/.test(parsed.pathname)
    ) {
      parsed.hostname = "streamsuites.app";
      parsed.pathname = `/profile-media${parsed.pathname}`;
      resolved = parsed.toString();
    }
  } catch (_error) {
    return "";
  }
  return resolved.endsWith(SHARE_IMAGE_PATH) && !raw.endsWith(SHARE_IMAGE_PATH) ? "" : resolved;
}

function pickString(...values) {
  for (const value of values) {
    const text = String(value || "").trim();
    if (text) return text;
  }
  return "";
}

function normalizeProfilePayload(payload, slug, requestUrl) {
  const source = payload?.profile && typeof payload.profile === "object" ? payload.profile : payload;
  if (!source || typeof source !== "object") return null;

  const publicSlug = normalizeSlug(source.public_slug || source.publicSlug || source.slug || slug);
  const displayName = pickString(source.display_name, source.displayName, source.name);
  if (!publicSlug || !displayName) return null;

  const profileMedia = source.profile_media && typeof source.profile_media === "object" ? source.profile_media : {};
  const image = source.image && typeof source.image === "object" ? source.image : {};
  const avatarUrl = resolveOptionalHttpsAssetUrl(pickString(
    image.avatar_url,
    image.profile_image_url,
    image.profile_photo_url,
    image.url,
    image.provider_picture,
    profileMedia.avatar_url,
    profileMedia.profile_image_url,
    profileMedia.provider_picture,
    source.profile_image_url,
    source.profileImageUrl,
    source.profile_photo_url,
    source.profilePhotoUrl,
    source.avatar_url,
    source.avatarUrl,
    source.avatar,
    source.provider_picture,
    source.providerPicture
  ), requestUrl);
  const coverImageUrl = resolveOptionalHttpsAssetUrl(
    pickString(source.cover_image_url, source.coverImageUrl, source.banner_image_url, source.bannerImageUrl),
    requestUrl
  );
  const bannerImageUrl = resolveOptionalHttpsAssetUrl(
    pickString(source.banner_image_url, source.bannerImageUrl, source.cover_image_url, source.coverImageUrl),
    requestUrl
  );
  const backgroundImageUrl = resolveOptionalHttpsAssetUrl(
    pickString(source.background_image_url, source.backgroundImageUrl),
    requestUrl
  );
  const bio = pickString(source.bio, source.summary, source.description);
  const about = pickString(source.about, source.about_story, source.aboutStory);
  const allowedThemePresets = new Set([
    "violet_blue", "crimson_magenta", "signal_red", "emerald_cyan", "gold_amber",
    "royal_blue", "magenta_violet", "red_gold", "green_gold",
    "dark_slate", "neutral_greytone", "frosted_silver"
  ]);
  const requestedThemePreset = String(source.streamsuites_theme_preset || source.streamsuitesThemePreset || "violet_blue")
    .trim()
    .toLowerCase()
    .replace(/-/g, "_");
  const requestedThemeTone = String(source.streamsuites_theme_tone || source.streamsuitesThemeTone || "dark")
    .trim()
    .toLowerCase();
  const canonicalUrl = new URL(`/u/${encodeURIComponent(publicSlug)}`, PUBLIC_ORIGIN).toString();

  return {
    id: pickString(source.id, source.account_id, source.accountId),
    publicSlug,
    slug: publicSlug,
    userCode: pickString(source.canonical_user_code, source.canonicalUserCode, source.account_user_code, source.accountUserCode, source.user_code, source.userCode),
    username: pickString(source.username),
    displayName,
    avatar: avatarUrl,
    avatarUrl,
    rawAvatarUrl: avatarUrl,
    imageVersion: pickString(source.image_version, source.imageVersion, image.image_version, image.cache_key),
    avatarSource: pickString(source.avatar_source, source.avatarSource, image.avatar_source, image.source),
    fallbackDisplayInitial: pickString(source.fallback_display_initial, source.fallbackDisplayInitial, image.fallback_display_initial),
    image,
    profileMedia,
    coverImageUrl,
    bannerImageUrl,
    backgroundImageUrl,
    bio,
    about,
    aboutHtml: pickString(source.about_html, source.aboutHtml),
    aboutMode: pickString(source.about_mode, source.aboutMode) || "text",
    aboutVideo: source.about_video && typeof source.about_video === "object" ? source.about_video : source.aboutVideo || null,
    aboutVideoProviders: Array.isArray(source.about_video_providers) ? source.about_video_providers : Array.isArray(source.aboutVideoProviders) ? source.aboutVideoProviders : [],
    aboutVideoUpload: source.about_video_upload && typeof source.about_video_upload === "object" ? source.about_video_upload : source.aboutVideoUpload || null,
    socialLinks: source.social_links && typeof source.social_links === "object" ? source.social_links : source.socialLinks || {},
    streamsuitesThemePreset: allowedThemePresets.has(requestedThemePreset) ? requestedThemePreset : "violet_blue",
    streamsuitesThemeTone: requestedThemeTone === "light" ? "light" : "dark",
    role: pickString(source.role, source.account_type, source.accountType) || "viewer",
    accountType: pickString(source.account_type, source.accountType),
    tier: pickString(source.tier),
    joinedAt: pickString(source.joined_at, source.joinedAt, source.created_at, source.createdAt),
    slugAliases: Array.isArray(source.slug_aliases) ? source.slug_aliases : Array.isArray(source.slugAliases) ? source.slugAliases : [],
    badges: Array.isArray(source.badges) ? source.badges : [],
    publicSurfaceAccountType: pickString(source.public_surface_account_type, source.publicSurfaceAccountType),
    creatorCapable: source.creator_capable === true || source.creatorCapable === true,
    viewerOnly: source.viewer_only === true || source.viewerOnly === true,
    isAnonymous: source.is_anonymous === true || source.isAnonymous === true,
    isListed: source.is_listed !== false && source.isListed !== false,
    liveStatus: source.live_status && typeof source.live_status === "object" ? source.live_status : source.liveStatus || null,
    latestStream: source.latest_stream && typeof source.latest_stream === "object" ? source.latest_stream : source.latestStream || null,
    progression: source.progression && typeof source.progression === "object" ? source.progression : null,
    economy: source.economy && typeof source.economy === "object" ? source.economy : null,
    inventory: Array.isArray(source.inventory) ? source.inventory : [],
    inventoryAvailable: source.inventory_available === true || source.inventoryAvailable === true,
    exchangeableItems: Array.isArray(source.exchangeable_items) ? source.exchangeable_items : Array.isArray(source.exchangeableItems) ? source.exchangeableItems : [],
    scopedProgression: Array.isArray(source.scoped_progression) ? source.scoped_progression : Array.isArray(source.scopedProgression) ? source.scopedProgression : [],
    streamsuitesProfileUrl: canonicalUrl,
    streamsuitesShareUrl: canonicalUrl,
    streamsuitesProfileVisible: source.streamsuites_profile_visible !== false && source.streamsuitesProfileVisible !== false,
    streamsuitesProfileEnabled: source.streamsuites_profile_enabled !== false && source.streamsuitesProfileEnabled !== false,
    streamsuitesProfileEligible: source.streamsuites_profile_eligible !== false && source.streamsuitesProfileEligible !== false,
    streamsuitesProfileStatusReason: pickString(source.streamsuites_profile_status_reason, source.streamsuitesProfileStatusReason),
    findmehereEnabled: source.findmehere_enabled === true || source.findmehereEnabled === true,
    findmehereEligible: source.findmehere_eligible === true || source.findmehereEligible === true,
    findmehereVisible: source.findmehere_visible === true || source.findmehereVisible === true,
    findmehereProfileUrl: pickString(source.findmehere_profile_url, source.findmehereProfileUrl),
    findmehereShareUrl: pickString(source.findmehere_share_url, source.findmehereShareUrl),
    findmehereStatusReason: pickString(source.findmehere_status_reason, source.findmehereStatusReason),
    authorityIdentity: source.authority_identity && typeof source.authority_identity === "object" ? source.authority_identity : source.authorityIdentity || null
  };
}

async function fetchPublicProfile(context, slug, requestUrl) {
  if (!slug) return null;
  const upstreamUrl = new URL("/api/public/profile", resolveUpstreamOrigin(context.env));
  upstreamUrl.searchParams.set("slug", slug);

  const init = {
    method: "GET",
    headers: { Accept: "application/json" }
  };
  if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") {
    init.signal = AbortSignal.timeout(PROFILE_LOOKUP_TIMEOUT_MS);
  }

  const response = await fetch(upstreamUrl.toString(), init);
  if (!response.ok) return null;
  const payload = await response.json().catch(() => null);
  return normalizeProfilePayload(payload, slug, requestUrl);
}

function buildMetadata(profile, slug, requestUrl) {
  const requestedSlug = normalizeSlug(slug);
  const profileName = profile?.displayName || (requestedSlug ? `@${requestedSlug}` : "StreamSuites Public Profile");
  const title = profile?.displayName
    ? `${profile.displayName} | StreamSuites Public Profile`
    : "StreamSuites Public Profile";
  const description = (profile?.bio
    ? profile.bio
    : profile?.displayName
      ? `View ${profile.displayName}'s public StreamSuites profile.`
      : "Standalone public profile on the canonical StreamSuites site.")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200);
  const canonicalUrl = profile?.streamsuitesProfileUrl || new URL(requestUrl.pathname, PUBLIC_ORIGIN).toString();
  const image = resolveHttpsAssetUrl(profile?.avatarUrl || profile?.avatar, requestUrl);

  return {
    title,
    description,
    ogTitle: profile?.displayName ? profileName : title,
    ogDescription: description,
    ogType: "profile",
    ogUrl: canonicalUrl,
    ogImage: image,
    twitterCard: "summary_large_image",
    twitterTitle: profile?.displayName ? profileName : title,
    twitterDescription: description,
    twitterImage: image
  };
}

function renderMetaTags(meta) {
  return [
    `<meta property="og:title" content="${escapeHtml(meta.ogTitle)}" />`,
    `<meta property="og:description" content="${escapeHtml(meta.ogDescription)}" />`,
    `<meta property="og:type" content="${escapeHtml(meta.ogType)}" />`,
    `<meta property="og:url" content="${escapeHtml(meta.ogUrl)}" />`,
    `<meta property="og:image" content="${escapeHtml(meta.ogImage)}" />`,
    `<meta name="twitter:card" content="${escapeHtml(meta.twitterCard)}" />`,
    `<meta name="twitter:title" content="${escapeHtml(meta.twitterTitle)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(meta.twitterDescription)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(meta.twitterImage)}" />`
  ].join("\n  ");
}

function injectProfileHead(html, meta, profile) {
  const metaTags = renderMetaTags(meta);
  const withMeta = html
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(meta.title)}</title>`)
    .replace(/<meta\s+name=["']description["'][^>]*>/i, `<meta name="description" content="${escapeHtml(meta.description)}" />`)
    .replace(/\s*<link\s+rel=["']canonical["'][^>]*>/i, "")
    .replace("</head>", `  <link rel="canonical" href="${escapeHtml(meta.ogUrl)}" />\n  ${metaTags}\n</head>`);

  if (!profile) return withMeta;

  const profileTheme = escapeHtml(profile.streamsuitesThemePreset || "violet_blue");
  const profileTone = escapeHtml(profile.streamsuitesThemeTone || "dark");
  const withAppearance = withMeta
    .replace(
      /<html\s+lang="en"[^>]*>/i,
      `<html lang="en" data-profile-page="active" data-profile-theme="${profileTheme}" data-profile-tone="${profileTone}">`
    )
    .replace(
      /<body\s+data-public-page="public-profile-standalone"[^>]*>/i,
      `<body data-public-page="public-profile-standalone" data-profile-theme="${profileTheme}" data-profile-tone="${profileTone}">`
    );

  const bootstrap = {
    profile,
    fetchedAt: new Date().toISOString(),
    source: "pages-function"
  };
  const script = `<script id="streamsuites-profile-bootstrap" type="application/json">${escapeJsonForScript(bootstrap)}</script>`;
  return withAppearance.replace("</body>", `  ${script}\n</body>`);
}

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const slug = normalizeSlug(context.params?.slug || url.pathname.replace(/^\/u\/?/i, "").split("/")[0] || "");
  url.pathname = "/u/index.html";
  const assetRequest = new Request(url.toString(), {
    method: context.request.method === "HEAD" ? "HEAD" : "GET",
    headers: context.request.headers
  });
  const assetResponse = await context.env.ASSETS.fetch(assetRequest);

  if (context.request.method === "HEAD") {
    return assetResponse;
  }

  const contentType = String(assetResponse.headers.get("Content-Type") || "");
  if (!assetResponse.ok || !contentType.toLowerCase().includes("text/html")) {
    return assetResponse;
  }

  let profile = null;
  try {
    profile = await fetchPublicProfile(context, slug, new URL(context.request.url));
  } catch (_error) {
    profile = null;
  }

  const html = await assetResponse.text();
  const meta = buildMetadata(profile, slug, new URL(context.request.url));
  const headers = new Headers(assetResponse.headers);
  headers.set("Content-Type", "text/html; charset=utf-8");
  headers.set("Cache-Control", profile ? "public, max-age=60, s-maxage=120" : "public, max-age=30, s-maxage=60");

  return new Response(injectProfileHead(html, meta, profile), {
    status: assetResponse.status,
    statusText: assetResponse.statusText,
    headers
  });
}
