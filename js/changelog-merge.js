const CHANGELOG_PATH = "/data/changelog.json";

async function fetchJson(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
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
