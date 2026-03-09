import { serveArtifactRoute } from "../_shared/artifact-route.js";

export async function onRequest(context) {
  return serveArtifactRoute(context, {
    assetPath: "/polls/detail.html",
    allowedPassthrough: ["detail.html", "results.html"]
  });
}
