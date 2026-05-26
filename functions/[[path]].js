const PROFILE_ALIAS_PATHNAME_RE = /^\/@([^\/?#]+)\/?$/;

// Public routing hotfix route table. These paths are served directly as
// static assets through the Pages Function so aliases do not redirect between
// one another and do not depend on browser state:
// / -> static index.html via context.next()
// /home, /home/, /home.html -> /home.html
// /media, /media/ -> /home.html compatibility
// /media.html -> static compatibility shim
// /economy, /economy/, /economy.html -> /economy.html canonical hub
// /games, /games/ -> /economy.html preferred Games & Economy entry
// /market, /market/, /exchange, /exchange/, /shop, /shop/ -> /economy.html short shims
// /market-exchange, /market-exchange/, /market-exchange.html -> /economy.html compatibility only
const DIRECT_ASSET_ROUTES = new Map([
  ["/home", "/home.html"],
  ["/home/", "/home.html"],
  ["/home.html", "/home.html"],
  ["/media", "/home.html"],
  ["/media/", "/home.html"],
  ["/media.html", "/media.html"],
  ["/economy", "/economy.html"],
  ["/economy/", "/economy.html"],
  ["/economy.html", "/economy.html"],
  ["/games", "/economy.html"],
  ["/games/", "/economy.html"],
  ["/market", "/economy.html"],
  ["/market/", "/economy.html"],
  ["/exchange", "/economy.html"],
  ["/exchange/", "/economy.html"],
  ["/shop", "/economy.html"],
  ["/shop/", "/economy.html"],
  ["/market-exchange", "/economy.html"],
  ["/market-exchange/", "/economy.html"],
  ["/market-exchange.html", "/economy.html"]
]);

function isDirectProfileAliasPath(pathname) {
  return PROFILE_ALIAS_PATHNAME_RE.test(String(pathname || "").trim());
}

function assetRequestFor(context, requestUrl, assetPathname) {
  const assetUrl = new URL(requestUrl.toString());
  assetUrl.pathname = assetPathname;
  assetUrl.search = "";

  return new Request(assetUrl.toString(), {
    method: context.request.method === "HEAD" ? "HEAD" : "GET",
    headers: context.request.headers
  });
}

export async function onRequest(context) {
  const requestUrl = new URL(context.request.url);
  const directAssetPathname = DIRECT_ASSET_ROUTES.get(requestUrl.pathname);

  if (directAssetPathname) {
    return context.env.ASSETS.fetch(assetRequestFor(context, requestUrl, directAssetPathname));
  }

  if (isDirectProfileAliasPath(requestUrl.pathname)) {
    return context.env.ASSETS.fetch(assetRequestFor(context, requestUrl, "/u/index.html"));
  }

  return context.next();
}
