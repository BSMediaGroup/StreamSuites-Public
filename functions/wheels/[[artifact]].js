import { serveArtifactRoute } from "../_shared/artifact-route.js";

export async function onRequest(context) {
  const pathname = new URL(context.request.url).pathname.replace(/\/$/, "");
  const stageRoute = /^\/wheels\/[^/]+\/stage$/i.test(pathname);
  return serveArtifactRoute(context, {
    basePath: "/wheels",
    indexAssetPath: "/wheels.html",
    assetPath: stageRoute ? "/wheels/stage.html" : "/wheels/detail.html"
  });
}
