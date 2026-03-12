import { serveArtifactRoute } from "../_shared/artifact-route.js";

export async function onRequest(context) {
  return serveArtifactRoute(context, {
    basePath: "/scores",
    indexAssetPath: "/scoreboards.html",
    assetPath: "/scoreboards/detail.html"
  });
}
