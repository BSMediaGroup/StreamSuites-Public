import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");

const loadHelpers = () => {
  const context = {
    window: {},
    document: { readyState: "loading", addEventListener() {} },
    Intl,
    console,
  };
  vm.runInNewContext(read("js/health-page.js"), context);
  return context.window.StreamSuitesHealthHelpers;
};

const component = (overrides = {}) => ({
  component_key: "authentication_accounts_sessions",
  component_id: "tb383cr2p92n",
  display_name: "Authentication, Accounts & Sessions",
  group_key: "core_platform",
  owner: "watchdog",
  coverage: "implemented",
  direct_state: "operational",
  direct_stale: false,
  history: {
    "5h": { buckets: [] },
    "24h": { buckets: [] },
    "7d": { buckets: [] },
    "30d": { buckets: [] },
  },
  ...overrides,
});

const diagnostics = (overrides = {}) => ({
  schema_version: "status-watchdog-public-v1",
  generated_at: "2026-08-10T00:00:00.000Z",
  components: { authentication_accounts_sessions: component() },
  ...overrides,
});

test("canonical /health page is a separate observability surface with stable section anchors", () => {
  const html = read("health.html");
  assert.match(html, /<link rel="canonical" href="https:\/\/streamsuites\.app\/health"/);
  assert.match(html, /<body class="health-page" data-page="health" data-health-state="unknown">/);
  for (const id of ["overview", "topology", "components", "core", "web-surfaces", "dependencies", "signals", "history", "methodology"]) {
    if (["core", "web-surfaces", "dependencies"].includes(id)) assert.match(read("js/health-page.js"), new RegExp(`id:\\s*"${id}"`));
    else assert.match(html, new RegExp(`id="${id}"`));
  }
  assert.match(html, /Service status &amp; incidents/);
  assert.match(html, /href="\/status"/);
  assert.match(html, /\/css\/status-page\.css/);
  assert.match(html, /\/css\/health-page\.css/);
  assert.match(html, /\/js\/health-page\.js/);
  assert.doesNotMatch(html, /status-widget\.css|status-widget\.js|data-status-slot/);
});

test("health page consumes only the existing public-safe Runtime diagnostics contract", () => {
  const script = read("js/health-page.js");
  assert.match(script, /HEALTH_ENDPOINT\s*=\s*"\/api\/public\/status\/diagnostics"/);
  assert.match(script, /SCHEMA_VERSION\s*=\s*"status-watchdog-public-v1"/);
  assert.match(script, /OVERALL_CONTRACT_VERSION\s*=\s*"overall-availability-v1"/);
  assert.match(script, /cache:\s*"no-store"/);
  assert.match(script, /credentials:\s*"omit"/);
  assert.match(script, /POLL_INTERVAL_MS\s*=\s*60000/);
  assert.match(script, /REQUEST_TIMEOUT_MS\s*=\s*8000/);
  assert.doesNotMatch(script, /statuspage\.io|manage\.statuspage|api[_-]?key|oauth|cookie|stream[_-]?key/i);
  assert.doesNotMatch(script, /method:\s*["'](?:POST|PUT|PATCH|DELETE)/i);
});

test("network, stale, malformed, and missing overall data cannot become operational", () => {
  const helpers = loadHelpers();
  assert.equal(helpers.isValidDiagnostics(diagnostics()), true);
  assert.equal(helpers.isValidDiagnostics({ schema_version: "wrong", components: {} }), false);
  assert.equal(helpers.isValidDiagnostics({ schema_version: "status-watchdog-public-v1", components: [] }), false);
  assert.equal(helpers.componentPresentation(component(), true).state, "unknown");
  assert.equal(helpers.componentPresentation(component({ direct_stale: true }), false).state, "unknown");
  assert.equal(helpers.componentPresentation(component({ direct_state: null }), false).state, "unknown");
  assert.equal(helpers.componentPresentation(component(), false).state, "operational");

  const script = read("js/health-page.js");
  assert.match(script, /renderAll\(lastGoodDiagnostics, true/);
  assert.match(script, /Overall health not established/);
  assert.match(script, /current health is Unknown/);
  assert.doesNotMatch(script, /fallback[^\n]{0,80}operational|default[^\n]{0,80}operational/i);
});

test("state normalization and ownership keep direct, deferred, and upstream observations distinct", () => {
  const helpers = loadHelpers();
  assert.equal(helpers.normalizeState("degraded_performance"), "degraded");
  assert.equal(helpers.normalizeState("partial_outage"), "partial");
  assert.equal(helpers.normalizeState("major_outage"), "major");
  assert.equal(helpers.normalizeState("under_maintenance"), "maintenance");
  assert.equal(helpers.normalizeState("anything_else"), "unknown");

  const deferred = helpers.componentPresentation(component({ coverage: "deferred", direct_state: null }), false);
  assert.equal(deferred.state, "unknown");
  assert.equal(deferred.measured, false);
  assert.match(deferred.label, /Not currently measured/);

  const upstream = helpers.componentPresentation(component({ coverage: "vendor_managed", direct_state: null }), false);
  assert.equal(upstream.state, "unknown");
  assert.equal(upstream.measured, false);
  assert.match(upstream.ownership, /External \/ upstream/);
});

test("history and latency helpers preserve only real bounded observations", () => {
  const helpers = loadHelpers();
  const real = [
    { at: "2026-08-10T00:00:00.000Z", state: "operational", latency_ms: 80 },
    { at: "2026-08-10T00:05:00.000Z", state: "unknown", latency_ms: null },
    { at: "2026-08-10T00:10:00.000Z", state: "degraded_performance", latency_ms: 120 },
  ];
  const selected = helpers.historyBuckets({ "24h": { buckets: real } }, "24h");
  assert.equal(selected.length, 3);
  assert.equal(selected[1].state, "unknown");
  const summary = helpers.summarizeSamples(selected);
  assert.equal(summary.count, 2);
  assert.equal(summary.minimum, 80);
  assert.equal(summary.median, 100);
  assert.equal(summary.maximum, 120);
  assert.equal(helpers.historyBuckets({}, "24h").length, 0);

  const oversized = diagnostics({ components: { test: component({ history: { "24h": { buckets: Array.from({ length: 289 }, () => ({})) } } }) } });
  assert.equal(helpers.isValidDiagnostics(oversized), false);
  const script = read("js/health-page.js");
  assert.match(script, /Every coloured cell is a real retained watchdog bucket|real bucket/i);
  assert.doesNotMatch(script, /fake|mock history|seed history|synthetic row/i);
});

test("topology, component matrix, freshness, latency, and heatmap retain premium responsive contracts", () => {
  const html = read("health.html");
  const css = read("css/health-page.css");
  const script = read("js/health-page.js");
  assert.equal((html.match(/data-component-key=/g) || []).length, 9);
  assert.equal((html.match(/data-route-to=/g) || []).length, 8);
  assert.equal((html.match(/class="health-route__base"/g) || []).length, 8);
  assert.equal((html.match(/class="health-route__glow"/g) || []).length, 8);
  assert.equal((html.match(/class="health-route__signal"/g) || []).length, 8);
  assert.equal((html.match(/class="health-route__packet"/g) || []).length, 8);
  assert.match(html, /class="health-node health-node--runtime"[\s\S]*?<img src="\/assets\/icons\/streamsuites-0\.svg"/);
  assert.match(html, /Core \/ authority/);
  assert.match(html, /Studio surfaces \/ clients/);
  assert.match(html, /Public \/ web surfaces/);
  assert.match(html, /This is not a media-path diagram/);
  assert.match(css, /\.health-topology__routes \.health-route__base[\s\S]*?stroke-width:\s*2/);
  assert.match(css, /\.health-topology__routes \.health-route__signal[\s\S]*?stroke-width:\s*2\.5/);
  assert.match(css, /\.health-topology\.has-active-route \.health-route\.is-active/);
  assert.match(script, /setActiveTopologyRoute/);
  assert.match(css, /\.health-component-grid\s*\{[\s\S]*?grid-template-columns:\s*repeat\(2/);
  assert.match(css, /\.health-component-card__microhistory/);
  assert.match(script, /COMPONENT_ICONS/);
  assert.match(css, /\.health-heatmap__cell\[data-state="operational"\]/);
  assert.match(script, /--bucket-slots/);
  assert.match(script, /watchdog_observed_availability_percent/);
  assert.match(css, /@media \(max-width:\s*1080px\)/);
  assert.match(css, /@media \(max-width:\s*820px\)/);
  assert.match(css, /@media \(max-width:\s*600px\)/);
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css, /@media \(forced-colors:\s*active\)/);
});

test("API-derived content uses safe DOM construction and no dynamic HTML execution sinks", () => {
  const script = read("js/health-page.js");
  assert.match(script, /document\.createElement\(/);
  assert.match(script, /textContent/);
  assert.doesNotMatch(script, /\.innerHTML|\.outerHTML|insertAdjacentHTML|document\.write|document\.writeln|eval\(|new Function|setAttribute\(["']on/i);
  assert.doesNotMatch(script, /localStorage|sessionStorage|postMessage/);
  assert.doesNotMatch(read("health.html"), /<script(?![^>]*src=)[^>]*>/);
});

test("status and health cross-link without changing the Status Center authority boundary", () => {
  const status = read("status.html");
  const health = read("health.html");
  assert.match(status, /href="\/health"[^>]*>[\s\S]*?View system health/);
  assert.match(status, /Atlassian remains the incident-notification authority/);
  assert.match(status, /Official status first\. Independent evidence second\./);
  assert.match(health, /Health explains operation\. Status explains impact\./);
  assert.match(health, /href="\/status"[^>]*>Service status &amp; incidents/);
});

test("external dependencies retain explicit upstream presentation and missing history never becomes a healthy segment", () => {
  const script = read("js/health-page.js");
  const css = read("css/health-page.css");
  assert.match(script, /external_dependencies:[\s\S]*?eyebrow:\s*"External \/ upstream"/);
  assert.match(script, /coverage === "vendor_managed"[\s\S]*?state:\s*"unknown"/);
  assert.match(css, /\.health-component-group\[data-group="external_dependencies"\]/);
  assert.match(css, /repeating-linear-gradient\(90deg, rgba\(130,148,168/);
  assert.doesNotMatch(script, /missing[^\n]{0,100}(?:operational|#62dea2)|gap[^\n]{0,100}(?:operational|#62dea2)/i);
});
