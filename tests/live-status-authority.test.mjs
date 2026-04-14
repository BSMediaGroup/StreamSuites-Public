import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const repoRoot = process.cwd();
const source = fs.readFileSync(path.join(repoRoot, "js/public-data-hub.js"), "utf8");

function instantiatePublicData(fetchImpl) {
  const context = {
    window: {
      StreamSuitesPublicShell: {
        parseDetailId() {
          return "";
        }
      }
    },
    fetch: fetchImpl,
    console,
    URL,
    Map,
    Set
  };
  vm.runInNewContext(source, context, { filename: "public-data-hub.js" });
  return context.window.StreamSuitesPublicData;
}

function jsonResponse(payload, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async json() {
      return payload;
    }
  };
}

test("public authoritative live adapter enriches rumble entries from discovery metadata", () => {
  const api = instantiatePublicData(async () => jsonResponse({ items: [] }));
  const rumbleDiscoveryMap = api.buildRumbleDiscoveryMap({
    creators: [
      {
        creator_id: "creator-1",
        display_name: "Creator One",
        is_live: true,
        live_title: "Discovery Title",
        live_url: "https://rumble.com/v123-creator-one-live",
        viewer_count: 88,
        last_checked_at: "2026-04-13T08:45:00Z",
        channel_url: "https://rumble.com/c/creatorone"
      }
    ]
  });
  const liveStatusMap = api.buildLiveStatusMap(
    {
      creators: [
        {
          creator_id: "creator-1",
          display_name: "Creator One",
          is_live: true,
          active_provider: "rumble",
          active_status: {
            provider: "rumble",
            is_live: true,
            live_title: "",
            live_url: "",
            viewer_count: null,
            last_checked_at: "2026-04-13T08:45:00Z",
            freshness: "fresh",
            stale: false
          },
          freshness: "fresh",
          stale: false
        }
      ]
    },
    rumbleDiscoveryMap
  );

  const resolved = api.resolveLiveStatus({ user_code: "creator-1" }, liveStatusMap, rumbleDiscoveryMap);
  assert.equal(resolved?.provider, "rumble");
  assert.equal(resolved?.title, "Discovery Title");
  assert.equal(resolved?.url, "https://rumble.com/v123-creator-one-live");
  assert.equal(resolved?.viewerCount, 88);
});

test("public authoritative live adapter does not create live state from discovery alone", () => {
  const api = instantiatePublicData(async () => jsonResponse({ items: [] }));
  const rumbleDiscoveryMap = api.buildRumbleDiscoveryMap({
    creators: [
      {
        creator_id: "creator-1",
        display_name: "Creator One",
        is_live: true,
        live_title: "Discovery Only",
        live_url: "https://rumble.com/v123-discovery-only"
      }
    ]
  });

  const liveStatusMap = api.buildLiveStatusMap(
    {
      creators: [
        {
          creator_id: "creator-1",
          display_name: "Creator One",
          is_live: false,
          active_provider: null,
          active_status: null,
          freshness: "fresh",
          stale: false
        }
      ]
    },
    rumbleDiscoveryMap
  );

  assert.equal(liveStatusMap.get("creator-1") || null, null);
  assert.equal(api.resolveLiveStatus({ user_code: "creator-1" }, liveStatusMap, rumbleDiscoveryMap), null);
});

test("public authoritative live adapter keeps stale aggregate entries offline", () => {
  const api = instantiatePublicData(async () => jsonResponse({ items: [] }));
  const resolved = api.normalizeLiveStatus({
    is_live: true,
    freshness: "stale",
    active_provider: "rumble",
    active_status: {
      provider: "rumble",
      is_live: true,
      freshness: "stale"
    }
  });
  assert.equal(resolved, null);
});

test("public authoritative live adapter suppresses non-rumble live providers for this phase", () => {
  const api = instantiatePublicData(async () => jsonResponse({ items: [] }));
  const resolved = api.normalizeLiveStatus({
    is_live: true,
    freshness: "fresh",
    active_provider: "twitch",
    active_status: {
      provider: "twitch",
      is_live: true,
      freshness: "fresh",
      stale: false
    }
  });
  assert.equal(resolved, null);
});

test("public authoritative live adapter ignores embedded live payloads when aggregate truth is absent", () => {
  const api = instantiatePublicData(async () => jsonResponse({ items: [] }));
  const resolved = api.resolveLiveStatus(
    {
      user_code: "creator-1",
      live_status: {
        is_live: true,
        active_provider: "rumble",
        active_status: {
          provider: "rumble",
          is_live: true,
          live_title: "Embedded Sample",
          freshness: "fresh",
          stale: false
        },
        freshness: "fresh",
        stale: false
      }
    },
    new Map(),
    new Map()
  );
  assert.equal(resolved, null);
});

test("public data hub prefers shared runtime live exports and falls back to checked-in mirrors", async () => {
  const calls = [];
  const api = instantiatePublicData(async (resource) => {
    calls.push(resource);
    if (resource === "/api/public/community/members") return jsonResponse({ items: [{ user_code: "creator-1", display_name: "Creator One" }] });
    if (resource === "/shared/state/live_status.json") return jsonResponse({}, 404);
    if (resource === "/data/live-status.json") {
      return jsonResponse({
        schema_version: "v1",
        generated_at: "2026-04-13T09:00:00Z",
        creators: []
      });
    }
    if (resource === "/shared/state/rumble_live_discovery.json") return jsonResponse({}, 404);
    if (resource === "/data/rumble_live_discovery.json") return jsonResponse({}, 404);
    return jsonResponse({ items: [] });
  });

  const data = await api.loadAll();
  assert.equal(data.liveStatus.generated_at, "2026-04-13T09:00:00Z");
  assert.ok(calls.indexOf("/shared/state/live_status.json") !== -1);
  assert.ok(calls.indexOf("/data/live-status.json") !== -1);
  assert.ok(calls.indexOf("/shared/state/live_status.json") < calls.indexOf("/data/live-status.json"));
});
