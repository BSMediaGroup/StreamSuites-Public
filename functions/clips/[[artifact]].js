import { serveArtifactRoute } from "../_shared/artifact-route.js";

export async function onRequest(context) {
  return serveArtifactRoute(context, {
    assetPath: "/clips/detail.html",
    allowedPassthrough: ["detail.html"],
    passthroughExtensions: [".mp4", ".webm", ".ogg"]
  });
}
