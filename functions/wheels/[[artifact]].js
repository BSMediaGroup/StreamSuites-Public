import { serveArtifactRoute } from "../_shared/artifact-route.js";

export async function onRequest(context) {
  return serveArtifactRoute(context, {
    basePath: "/wheels",
    indexAssetPath: "/wheels.html",
    assetPath: "/wheels/detail.html"
  });
}
