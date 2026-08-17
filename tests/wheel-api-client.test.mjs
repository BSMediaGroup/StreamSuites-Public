import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const source = fs.readFileSync(path.join(process.cwd(), "js/wheel-api-client.js"), "utf8");

function response(status, payload, contentType = "application/json") {
  const text = typeof payload === "string" ? payload : JSON.stringify(payload);
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (name) => name.toLowerCase() === "content-type" ? contentType : null },
    text: async () => text
  };
}

function loadClient({ hostname = "streamsuites.app", configuredBase = "", fetchImpl } = {}) {
  const calls = [];
  const window = {
    location: { hostname },
    StreamSuitesPublicConfig: configuredBase ? { AUTH_API_BASE: configuredBase } : {},
    StreamSuitesAuth: {}
  };
  const context = vm.createContext({
    window,
    FormData,
    Error,
    Set,
    fetch: async (...args) => {
      calls.push(args);
      return fetchImpl ? fetchImpl(...args) : response(200, { success: true });
    }
  });
  vm.runInContext(source, context);
  return { api: window.StreamSuitesWheelApi, calls };
}

test("production wheel operations use the canonical Runtime origin with credentials", async () => {
  const { api, calls } = loadClient();
  await api.createWheelSet({ title: "Friday giveaway" });
  assert.equal(api.apiBase, "https://api.streamsuites.app");
  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], "https://api.streamsuites.app/api/creator/wheels");
  assert.equal(calls[0][1].method, "POST");
  assert.equal(calls[0][1].credentials, "include");
  assert.equal(calls[0][1].headers["Content-Type"], "application/json");
  assert.deepEqual(JSON.parse(calls[0][1].body), { title: "Friday giveaway" });
});

test("local and explicitly configured Runtime origins remain supported", () => {
  assert.equal(loadClient({ hostname: "localhost" }).api.apiBase, "http://127.0.0.1:18087");
  assert.equal(loadClient({ configuredBase: "https://runtime.example.test/" }).api.apiBase, "https://runtime.example.test");
});

test("bare or HTML route failures become safe structured wheel errors", async () => {
  const bare = loadClient({ fetchImpl: async () => response(404, "Not Found", "text/plain") });
  await assert.rejects(
    bare.api.listOwned(),
    (error) => error.code === "wheel_route_unavailable" && error.status === 404 && !/^not found$/i.test(error.message)
  );

  const html = loadClient({ fetchImpl: async () => response(404, "<!doctype html><title>Not Found</title>", "text/html") });
  await assert.rejects(html.api.listOwned(), /Wheel service route is unavailable/);
});

test("media upload uses the exact child route without overriding multipart content type", async () => {
  const { api, calls } = loadClient();
  await api.uploadMedia("artifact-a", "whl_b", "stage-background-image", new Blob(["image"]));
  assert.equal(calls[0][0], "https://api.streamsuites.app/api/creator/wheels/artifact-a/wheels/whl_b/stage-background-image");
  assert.equal(calls[0][1].method, "POST");
  assert.equal(calls[0][1].headers["Content-Type"], undefined);
  assert.ok(calls[0][1].body instanceof FormData);
});

test("portable child import and export use the containing Wheel Set routes", async () => {
  const { api, calls } = loadClient();
  await api.importWheel("artifact-a", { source_name: "prize.swl", payload_text: "{}" });
  await api.exportWheel("artifact-a", "whl_prize");
  assert.equal(calls[0][0], "https://api.streamsuites.app/api/creator/wheels/artifact-a/wheels/import");
  assert.equal(calls[0][1].method, "POST");
  assert.equal(calls[1][0], "https://api.streamsuites.app/api/creator/wheels/artifact-a/wheels/whl_prize/export");
  assert.equal(calls[1][1].method, "GET");
});
