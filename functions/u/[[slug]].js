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
    .replace(/[\s-]+/g, "")
    .replace(/[^a-z0-9_]+/g, "")
    .replace(/^_+|_+$/g, "");
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
    if (parsed.protocol !== "https:") return fallback;
    return parsed.toString();
  } catch (_error) {
    return fallback;
  }
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

  const avatarUrl = resolveHttpsAssetUrl(pickString(source.avatar_url, source.avatarUrl, source.avatar), requestUrl);
  const coverImageUrl = resolveHttpsAssetUrl(
    pickString(source.cover_image_url, source.coverImageUrl, source.banner_image_url, source.bannerImageUrl),
    requestUrl
  );
  const bio = pickString(source.bio, source.summary, source.description);
  const canonicalUrl = new URL(`/u/${encodeURIComponent(publicSlug)}`, PUBLIC_ORIGIN).toString();

  return {
    publicSlug,
    slug: publicSlug,
    userCode: pickString(source.canonical_user_code, source.canonicalUserCode, source.account_user_code, source.accountUserCode, source.user_code, source.userCode),
    displayName,
    avatar: avatarUrl,
    avatarUrl,
    coverImageUrl,
    bannerImageUrl: coverImageUrl,
    bio,
    role: pickString(source.role, source.account_type, source.accountType) || "viewer",
    tier: pickString(source.tier),
    streamsuitesProfileUrl: canonicalUrl,
    streamsuitesShareUrl: canonicalUrl,
    streamsuitesProfileVisible: source.streamsuites_profile_visible !== false && source.streamsuitesProfileVisible !== false,
    streamsuitesProfileEnabled: source.streamsuites_profile_enabled !== false && source.streamsuitesProfileEnabled !== false,
    streamsuitesProfileEligible: source.streamsuites_profile_eligible !== false && source.streamsuitesProfileEligible !== false
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
  const description = profile?.bio
    ? profile.bio
    : profile?.displayName
      ? `View ${profile.displayName}'s public StreamSuites profile.`
      : "Standalone public profile on the canonical StreamSuites site.";
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
    .replace("</head>", `  ${metaTags}\n</head>`);

  if (!profile) return withMeta;

  const bootstrap = {
    profile,
    fetchedAt: new Date().toISOString(),
    source: "pages-function"
  };
  const script = `<script id="streamsuites-profile-bootstrap" type="application/json">${escapeJsonForScript(bootstrap)}</script>`;
  return withMeta.replace("</body>", `  ${script}\n</body>`);
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
