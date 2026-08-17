import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = fs.readFileSync(path.join(root, "js", "public-page-visit.js"), "utf8");

function createHarness(pathname = "/u/private-profile") {
  const storage = new Map();
  const bodies = [];
  const timers = [];
  const context = {
    Blob: class Blob {
      constructor(parts) { this.value = parts.join(""); }
    },
    Date,
    JSON,
    Math,
    crypto: { randomUUID: () => "fixture-event" },
    document: {
      visibilityState: "visible",
      addEventListener() {},
    },
    fetch: async (_url, options) => {
      bodies.push(options.body);
      throw new Error("telemetry offline");
    },
    navigator: {
      sendBeacon(_url, blob) {
        bodies.push(blob.value);
        return true;
      },
    },
    window: {
      location: { pathname },
      sessionStorage: {
        getItem: (key) => storage.get(key) ?? null,
        setItem: (key, value) => storage.set(key, value),
      },
      setTimeout: (callback) => timers.push(callback),
    },
  };
  context.window.window = context.window;
  return { context: vm.createContext(context), bodies, timers };
}

test("Public reports one minimal normalized page view and ignores query/hash state", () => {
  const harness = createHarness("/u/private-profile");
  harness.context.window.location.search = "?tab=clips";
  harness.context.window.location.hash = "#latest";
  vm.runInContext(source, harness.context);
  assert.equal(harness.timers.length, 1);
  harness.timers.shift()();
  assert.equal(harness.bodies.length, 1);
  assert.deepEqual(
    JSON.parse(harness.bodies[0]),
    { surface: "public", path: "/u/:slug", event_id: "pv-fixture-event" },
  );

  harness.context.window.__streamSuitesPageVisitReporterLoaded = false;
  harness.context.window.location.search = "?tab=about";
  harness.context.window.location.hash = "#bio";
  vm.runInContext(source, harness.context);
  harness.timers.shift()();
  assert.equal(harness.bodies.length, 1);
});

test("Public telemetry failure stays bounded and contains no private payload fields", async () => {
  const harness = createHarness("/wheels/secret-artifact?token=secret#result");
  harness.context.navigator.sendBeacon = () => false;
  vm.runInContext(source, harness.context);
  assert.doesNotThrow(() => harness.timers.shift()());
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(harness.bodies.length, 1);
  const payload = JSON.parse(harness.bodies[0]);
  assert.deepEqual(Object.keys(payload).sort(), ["event_id", "path", "surface"]);
  assert.equal(payload.path, "/wheels/:artifact");
  assert.doesNotMatch(JSON.stringify(payload), /secret-artifact|token|referrer|email|account|session|user-agent/i);
});
