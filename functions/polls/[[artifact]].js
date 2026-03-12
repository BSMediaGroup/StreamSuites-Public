import { serveArtifactRoute } from "../_shared/artifact-route.js";

export async function onRequest(context) {
  return serveArtifactRoute(context, {
    basePath: "/polls",
    indexAssetPath: "/polls.html",
    assetPath: "/polls/detail.html",
    allowedPassthrough: ["detail.html", "results.html"]
  });
}
