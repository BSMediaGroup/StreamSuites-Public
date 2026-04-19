const PROFILE_ALIAS_PATHNAME_RE = /^\/@([^\/?#]+)\/?$/;

function isDirectProfileAliasPath(pathname) {
  return PROFILE_ALIAS_PATHNAME_RE.test(String(pathname || "").trim());
}

export async function onRequest(context) {
  const requestUrl = new URL(context.request.url);

  if (!isDirectProfileAliasPath(requestUrl.pathname)) {
    return context.next();
  }

  requestUrl.pathname = "/u/index.html";
  requestUrl.search = "";

  const assetRequest = new Request(requestUrl.toString(), {
    method: context.request.method === "HEAD" ? "HEAD" : "GET",
    headers: context.request.headers
  });

  return context.env.ASSETS.fetch(assetRequest);
}
