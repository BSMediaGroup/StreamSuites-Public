const CHANGELOG_PATH = "/data/changelog.json";

function resolveJsonUrl(path) {
  try {
    return new URL(path, window.location.origin).toString();
  } catch {
    return String(path || "");
  }
}

async function fetchJson(url) {
  const resolvedUrl = resolveJsonUrl(url);
  const response = await fetch(resolvedUrl, { cache: "no-store" });
  if (!response.ok) {
    console.error(`[Changelog] Failed to fetch ${resolvedUrl} (HTTP ${response.status})`);
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
}

function normalizeEntries(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.entries)) return payload.entries;
  if (Array.isArray(payload?.releases)) return payload.releases;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}

export async function loadMergedChangelog() {
  const payload = await fetchJson(CHANGELOG_PATH);
  return normalizeEntries(payload);
}
