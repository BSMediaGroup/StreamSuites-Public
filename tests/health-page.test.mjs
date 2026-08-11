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

test("history and latency helpers preserve only authoritative bounded observations", () => {
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
  assert.match(script, /source bucket|retained bucket/i);
  assert.doesNotMatch(script, /fake|mock history|seed history|synthetic row/i);
});

test("canonical timeline aligns sparse history and materializes explicit unknown source positions", () => {
  const helpers = loadHelpers();
  const range = {
    requested_start: "2026-08-10T00:00:00.000Z",
    requested_end: "2026-08-10T00:30:00.000Z",
    bucket_range_start: "2026-08-10T00:00:00.000Z",
    timeline_resolution_seconds: 300,
    expected_buckets: 6,
  };
  const axis = helpers.buildCanonicalAxis(range, "24h");
  assert.equal(axis.times.length, 6);
  assert.deepEqual([...axis.times], [...axis.times].sort((left, right) => left - right));

  const aligned = helpers.alignBucketsToAxis([
    { at: "2026-08-10T00:00:00.000Z", state: "operational", sample_count: 2 },
    { at: "2026-08-10T00:25:00.000Z", state: "degraded_performance", sample_count: 1 },
  ], axis);
  assert.equal(aligned.length, 6);
  assert.equal(aligned[0].state, "operational");
  assert.equal(aligned[1].state, "unknown");
  assert.equal(aligned[1].observed, false);
  assert.equal(aligned[5].state, "degraded");
  assert.equal(aligned[5].source.at, "2026-08-10T00:25:00.000Z");
  assert.equal(helpers.buildCanonicalAxis({ expected_buckets: 6 }, "24h"), null);

  const sevenDayAxis = helpers.buildCanonicalAxis({
    requested_start: "2026-08-04T00:00:00.000Z",
    requested_end: "2026-08-11T00:00:00.000Z",
    bucket_range_start: "2026-08-09T00:50:00.000Z",
    timeline_resolution_seconds: 3600,
    expected_buckets: 632,
  }, "7d");
  assert.equal(sevenDayAxis.times.length, 168, "display timing comes from the requested window and Runtime resolution, not raw five-minute expected bucket totals");
  assert.equal(helpers.alignBucketsToAxis([{ at: "2026-08-10T00:00:00.000Z", state: "operational" }], sevenDayAxis)[144].state, "operational");
});

test("display aggregation stays capped and conservatively preserves incidents and unknown coverage", () => {
  const helpers = loadHelpers();
  const range = {
    requested_start: "2026-08-10T00:00:00.000Z",
    requested_end: "2026-08-10T00:30:00.000Z",
    bucket_range_start: "2026-08-10T00:00:00.000Z",
    timeline_resolution_seconds: 300,
    expected_buckets: 6,
  };
  const source = [
    { at: "2026-08-10T00:00:00.000Z", state: "operational", sample_count: 2, availability_percent: 100 },
    { at: "2026-08-10T00:10:00.000Z", state: "degraded_performance", sample_count: 1, availability_percent: 50 },
    { at: "2026-08-10T00:25:00.000Z", state: "major_outage", sample_count: 1, availability_percent: 0 },
  ];
  const segments = helpers.aggregateTimeline(helpers.alignBucketsToAxis(source, helpers.buildCanonicalAxis(range, "24h")), 3);
  assert.equal(segments.length, 3);
  assert.equal(segments[0].state, "unknown", "operational plus an unobserved source bucket must not become operational");
  assert.equal(segments[1].state, "degraded");
  assert.equal(segments[2].state, "major");
  assert.equal(segments[0].sourceBucketCount, 2);
  assert.equal(segments[0].retainedBucketCount, 1);
  assert.equal(segments[0].observedCount, 1);
  assert.equal(segments[0].unknownCount, 1);
  assert.equal(segments[0].startAt, Date.parse("2026-08-10T00:00:00.000Z"));
  assert.equal(segments[0].endAt, Date.parse("2026-08-10T00:10:00.000Z"));
  assert.equal("availability_percent" in segments[0], false, "display segments must not calculate authoritative availability");
  assert.deepEqual([
    helpers.displaySegmentCapacity(1400),
    helpers.displaySegmentCapacity(800),
    helpers.displaySegmentCapacity(390),
  ], [96, 72, 48]);
});

test("component history classification distinguishes retained, current-only, vendor, and unmeasured states", () => {
  const helpers = loadHelpers();
  const retained = component({ history: { "24h": { buckets: [{ at: "2026-08-10T00:00:00.000Z", state: "operational" }] } } });
  assert.equal(helpers.classifyComponentHistory(retained, "24h").kind, "direct");
  assert.equal(helpers.classifyComponentHistory(component(), "24h").kind, "current");
  assert.equal(helpers.classifyComponentHistory(component({ coverage: "vendor_managed", direct_state: null }), "24h").kind, "vendor");
  assert.equal(helpers.classifyComponentHistory(component({ coverage: "deferred", direct_state: null }), "24h").kind, "unknown");
  const externalRetained = component({ coverage: "vendor_managed", direct_state: null, history: { "24h": { buckets: [{ at: "2026-08-10T00:00:00.000Z", state: "unknown" }] } } });
  assert.equal(helpers.classifyComponentHistory(externalRetained, "24h").kind, "direct", "real retained external history must not be excluded");
});

test("topology is grouped, line-only, visibility-aware, and keeps the canonical Runtime icon", () => {
  const html = read("health.html");
  const css = read("css/health-page.css");
  const script = read("js/health-page.js");
  assert.equal((html.match(/data-component-key=/g) || []).length, 9);
  assert.equal((html.match(/data-route-group=/g) || []).length, 3);
  assert.equal((html.match(/class="health-route__base"/g) || []).length, 3);
  assert.equal((html.match(/class="health-route__signal"/g) || []).length, 3);
  assert.equal((html.match(/data-topology-group-panel=/g) || []).length, 3);
  assert.doesNotMatch(html, /health-route__glow|health-route__packet|<animateMotion|<circle/);
  assert.match(html, /class="health-node health-node--runtime"[\s\S]*?<img src="\/assets\/icons\/streamsuites-0\.svg"/);
  assert.match(html, /Core &amp; identity/);
  assert.match(html, /Studio &amp; clients/);
  assert.match(html, /Public &amp; web/);
  assert.match(html, /This is not a media-path diagram/);
  assert.match(css, /\.health-topology__routes \.health-route__base[\s\S]*?stroke-width:\s*2/);
  assert.match(css, /\.health-topology__routes \.health-route__signal[\s\S]*?stroke-width:\s*2\.5/);
  assert.match(css, /data-animation-state="paused"[\s\S]*?animation-play-state:\s*paused/);
  assert.match(css, /prefers-reduced-motion:[^}]+reduce[\s\S]*?\.health-topology__routes \.health-route__signal[\s\S]*?animation:\s*none/);
  assert.match(css, /\.health-topology\.has-active-route \.health-route\.is-active/);
  assert.match(css, /\.health-topology \.health-node\s*\{[\s\S]*?position:\s*relative !important;[\s\S]*?left:\s*auto !important;[\s\S]*?grid-column:\s*auto;[\s\S]*?width:\s*100% !important;/);
  assert.match(css, /\.health-topology \.health-node--runtime\s*\{[\s\S]*?justify-self:\s*center;[\s\S]*?width:\s*min\(520px, 100%\) !important;/);
  assert.match(css, /\.health-topology\.is-topology-primed \.health-route__base[\s\S]*?stroke-dashoffset:\s*100/);
  assert.match(css, /\.health-topology\.is-topology-entering \.health-topology-group--studio[\s\S]*?transition-delay:\s*310ms/);
  assert.match(css, /data-animation-state="paused"[^}]*\.health-node--runtime::before[\s\S]*?animation-play-state:\s*paused/);
  assert.match(script, /setActiveTopologyRoute/);
  assert.match(script, /startTopologyEntrance/);
  assert.match(script, /has-topology-entered/);
  assert.match(script, /topologyInView/);
  assert.match(script, /document\.hidden/);
  assert.match(script, /new IntersectionObserver/);
  assert.match(script, /topology\?\.addEventListener\("pointerover"/);
  assert.doesNotMatch(script, /topologyNodes\.forEach|health-route__packet|animateMotion/);
});

test("component matrix, bounded rails, response graph, and incremental polling retain responsive contracts", () => {
  const html = read("health.html");
  const css = read("css/health-page.css");
  const script = read("js/health-page.js");
  assert.match(css, /\.health-component-grid\s*\{[\s\S]*?grid-template-columns:\s*repeat\(2/);
  assert.match(css, /\.health-component-card__microhistory/);
  assert.match(script, /COMPONENT_ICONS/);
  assert.match(css, /\.health-heatmap__cell\[data-state="operational"\]/);
  assert.match(css, /\.health-heatmap__cell\[data-state="unknown"\]/);
  assert.match(script, /--display-segments/);
  assert.match(script, /document\.createDocumentFragment/);
  assert.match(script, /heatmapRoot\?\.addEventListener\("pointerover"/);
  assert.doesNotMatch(script, /cell\.addEventListener/);
  assert.match(script, /historyTooltipModels = new WeakMap/);
  assert.match(script, /historyTooltip\.setAttribute\("role", "tooltip"\)/);
  assert.match(script, /health-history-tooltip__metrics/);
  assert.match(script, /target\.setAttribute\("aria-describedby", tooltip\.id\)/);
  assert.doesNotMatch(script, /cell\.title\s*=/);
  assert.match(script, /const statusComponentHref/);
  assert.match(script, /const cell = element\("a", "health-heatmap__cell"\)/);
  assert.match(script, /cell\.href = statusHref/);
  assert.match(script, /Open this component on Status/);
  assert.match(script, /health-history-classification__link/);
  assert.match(css, /\.health-history-classification__link/);
  assert.match(css, /\.health-history-tooltip\s*\{[\s\S]*?position:\s*fixed;[\s\S]*?background:[\s\S]*?linear-gradient/);
  assert.match(script, /ResizeObserver/);
  assert.match(script, /watchdog_observed_availability_percent/);
  assert.match(html, /data-history-classifications/);
  assert.match(script, /Current snapshot only/);
  assert.match(script, /Vendor-managed/);
  assert.match(script, /Not independently measured/);
  assert.match(script, /const latestMarker = svgElement\("circle"/);
  assert.match(script, /const hoverMarker = svgElement\("circle"/);
  assert.match(script, /data-latency-interaction/);
  const latencyRenderer = script.slice(script.indexOf("const renderLatency"), script.indexOf("const bucketDescription"));
  assert.equal((latencyRenderer.match(/svgElement\("circle"/g) || []).length, 2);
  assert.match(latencyRenderer, /health-latency-line-reveal-mask/);
  assert.match(latencyRenderer, /mask:\s*"url\(#health-latency-line-reveal-mask\)"/);
  assert.doesNotMatch(latencyRenderer, /getTotalLength|strokeDasharray|stroke-dashoffset/);
  assert.match(script, /queueLatencyEntrance/);
  assert.match(script, /checkLatencyEntranceOnScroll/);
  assert.match(script, /latencyEntranceVisibilityCheck/);
  assert.match(script, /visiblePixels < Math\.min\(120, bounds\.height \* \.22\)/);
  assert.match(css, /\.health-latency__chart\.is-plot-entering \.health-latency-plot__line-reveal[\s\S]*?transition:\s*transform 1640ms/);
  assert.match(script, /renderWhenChanged/);
  assert.match(script, /visibilityState === "visible"/);
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
