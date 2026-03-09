import { serveArtifactRoute } from "../_shared/artifact-route.js";

export async function onRequest(context) {
  return serveArtifactRoute(context, {
    assetPath: "/scoreboards/detail.html"
  });
}
