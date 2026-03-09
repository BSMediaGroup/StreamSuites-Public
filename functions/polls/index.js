import { serveAssetPath } from "../_shared/artifact-route.js";

export async function onRequest(context) {
  return serveAssetPath(context, "/polls.html");
}
