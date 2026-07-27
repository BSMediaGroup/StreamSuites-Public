import {
  fetchValidatedManifestForContext,
  jsonResponse,
  projectPublicRelease,
  readDownloadAccessConfig,
  unavailablePublicRelease,
  verifyAccessCookie,
} from "../../../_shared/studioapp-download-gate.js";

export async function onRequestGet(context) {
  const config = readDownloadAccessConfig(context.env);
  const authorized = await verifyAccessCookie(context.request, config);
  try {
    const release = await fetchValidatedManifestForContext(context);
    return jsonResponse(projectPublicRelease(release, config, authorized));
  } catch (error) {
    return jsonResponse(unavailablePublicRelease(config, authorized, error));
  }
}
