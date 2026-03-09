function isPassthroughPath(pathname, allowedNames = [], passthroughExtensions = []) {
  const lastSegment = String(pathname || "").split("/").pop() || "";
  if (!lastSegment) return true;
  if (allowedNames.includes(lastSegment)) return true;
  const extensionMatch = lastSegment.match(/(\.[a-z0-9]+)$/i);
  if (!extensionMatch) return false;
  return passthroughExtensions.includes(extensionMatch[1].toLowerCase());
}

export async function serveArtifactRoute(context, options) {
  const requestUrl = new URL(context.request.url);
  const pathname = requestUrl.pathname;
  if (isPassthroughPath(pathname, options.allowedPassthrough || [], options.passthroughExtensions || [])) {
    return context.next();
  }

  const assetPath = String(options.assetPath || "").trim();
  if (!assetPath) {
    return context.next();
  }

  requestUrl.pathname = assetPath;
  requestUrl.search = "";
  const assetRequest = new Request(requestUrl.toString(), {
    method: context.request.method === "HEAD" ? "HEAD" : "GET",
    headers: context.request.headers
  });
  return context.env.ASSETS.fetch(assetRequest);
}

export async function serveAssetPath(context, assetPath) {
  const requestUrl = new URL(context.request.url);
  requestUrl.pathname = assetPath;
  requestUrl.search = "";
  const assetRequest = new Request(requestUrl.toString(), {
    method: context.request.method === "HEAD" ? "HEAD" : "GET",
    headers: context.request.headers
  });
  return context.env.ASSETS.fetch(assetRequest);
}
