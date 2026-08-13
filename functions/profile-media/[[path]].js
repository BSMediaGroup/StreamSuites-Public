const DEFAULT_AUTH_API_ORIGIN = "https://api.streamsuites.app";
const UPSTREAM_TIMEOUT_MS = 15000;
const IMAGE_PATH = /^\/profile-media\/u\/[A-Za-z0-9]{7}\/(?:avatar|cover|background|logo)\/v[1-9]\d*\.webp$/;
const VIDEO_PATH = /^\/profile-media\/u\/[A-Za-z0-9]{7}\/about-video\/[a-f0-9]{32}\.(?:mp4|webm)$/;

function resolveUpstreamOrigin(env) {
  const candidate = String(env?.STREAMSUITES_API_ORIGIN || DEFAULT_AUTH_API_ORIGIN).trim();
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== "https:" && !(parsed.protocol === "http:" && ["127.0.0.1", "localhost"].includes(parsed.hostname))) {
      throw new Error("unsupported protocol");
    }
    parsed.pathname = "/";
    parsed.search = "";
    parsed.hash = "";
    return parsed;
  } catch (_error) {
    return new URL(DEFAULT_AUTH_API_ORIGIN);
  }
}

function expectedMediaType(pathname) {
  if (IMAGE_PATH.test(pathname)) return "image/webp";
  if (VIDEO_PATH.test(pathname)) return pathname.endsWith(".mp4") ? "video/mp4" : "video/webm";
  return "";
}

function errorResponse(status) {
  return new Response(null, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Content-Length": "0",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function copyHeader(source, target, name) {
  const value = source.get(name);
  if (value) target.set(name, value);
}

export async function onRequest(context) {
  const request = context.request;
  if (request.method !== "GET" && request.method !== "HEAD") return errorResponse(405);

  const requestUrl = new URL(request.url);
  const expectedType = expectedMediaType(requestUrl.pathname);
  if (!expectedType || requestUrl.search || requestUrl.hash) return errorResponse(404);

  const upstreamPath = requestUrl.pathname.slice("/profile-media".length);
  const upstreamUrl = new URL(upstreamPath, resolveUpstreamOrigin(context.env));
  const upstreamHeaders = new Headers({
    Accept: expectedType,
    "X-StreamSuites-Public-Media-Proxy": "cloudflare-pages",
  });
  for (const name of ["Range", "If-None-Match", "If-Modified-Since"]) {
    const value = request.headers.get(name);
    if (value) upstreamHeaders.set(name, value);
  }

  const init = {
    method: request.method,
    headers: upstreamHeaders,
    redirect: "manual",
  };
  if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") {
    init.signal = AbortSignal.timeout(UPSTREAM_TIMEOUT_MS);
  }

  let upstream;
  try {
    upstream = await fetch(upstreamUrl.toString(), init);
  } catch (_error) {
    return errorResponse(502);
  }

  if (![200, 206, 304, 404, 416].includes(upstream.status)) return errorResponse(502);
  if (upstream.status === 404) return errorResponse(404);
  if (upstream.status === 416) {
    const response = errorResponse(416);
    const contentRange = upstream.headers.get("Content-Range");
    if (contentRange) response.headers.set("Content-Range", contentRange);
    return response;
  }

  const upstreamType = String(upstream.headers.get("Content-Type") || "").split(";", 1)[0].trim().toLowerCase();
  if (upstream.status !== 304 && upstreamType !== expectedType) return errorResponse(502);

  const headers = new Headers({
    "Cache-Control": "public, max-age=31536000, immutable",
    "Cross-Origin-Resource-Policy": "same-site",
    "X-Content-Type-Options": "nosniff",
  });
  if (upstream.status !== 304) headers.set("Content-Type", expectedType);
  for (const name of ["Content-Length", "Content-Range", "Accept-Ranges", "ETag", "Last-Modified"]) {
    copyHeader(upstream.headers, headers, name);
  }

  return new Response(request.method === "HEAD" || upstream.status === 304 ? null : upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers,
  });
}
