import { serveArtifactRoute } from "../_shared/artifact-route.js";

export async function onRequest(context) {
  return serveArtifactRoute(context, {
    basePath: "/clips",
    indexAssetPath: "/clips.html",
    assetPath: "/clips/detail.html",
    allowedPassthrough: ["detail.html"],
    passthroughExtensions: [".mp4", ".webm", ".ogg"]
  });
}
