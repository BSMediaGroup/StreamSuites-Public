const CHANGELOG_URL = () => new URL("/data/changelog.json", window.location.origin).href;
const CHANGELOG_RUNTIME_URL = () => new URL("/data/changelog.runtime.json", window.location.origin).href;

function resolveJsonUrl(path) {
  try {
    return new URL(path, window.location.origin).toString();
  } catch {
    return String(path || "");
  }
}

async function fetchJson(url) {
  const resolvedUrl = resolveJsonUrl(url);
  console.info(`[Changelog] Fetch URL: ${resolvedUrl}`);
  const response = await fetch(resolvedUrl, { cache: "no-store" });
  console.info(`[Changelog] Response status for ${resolvedUrl}: ${response.status}`);
  if (!response.ok) {
    console.error(`[Changelog] Failed to fetch ${resolvedUrl} (HTTP ${response.status})`);
    throw new Error(`HTTP ${response.status}`);
  }
  try {
    return await response.json();
  } catch (err) {
    console.error(`[Changelog] JSON parse failed for ${resolvedUrl}: ${err?.message || "Unknown parse error"}`);
    throw err;
  }
}

function normalizeEntries(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.entries)) return payload.entries;
  if (Array.isArray(payload?.releases)) return payload.releases;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}

export async function loadMergedChangelog() {
  const [baseResult, runtimeResult] = await Promise.allSettled([
    fetchJson(CHANGELOG_URL()),
    fetchJson(CHANGELOG_RUNTIME_URL())
  ]);

  const baseEntries = baseResult.status === "fulfilled" ? normalizeEntries(baseResult.value) : [];
  const runtimeEntries = runtimeResult.status === "fulfilled" ? normalizeEntries(runtimeResult.value) : [];
  const merged = [...baseEntries, ...runtimeEntries];

  if (baseResult.status === "rejected" && runtimeResult.status === "rejected") {
    throw new Error("Failed to load data.");
  }

  if (!merged.length) return [];

  const seen = new Set();
  return merged.filter((entry) => {
    const key = [
      entry?.id || "",
      entry?.version || "",
      entry?.title || "",
      entry?.date || ""
    ].join("::");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
