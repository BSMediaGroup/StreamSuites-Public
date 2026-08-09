import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const loadChartHelpers = () => {
  const context = {
    window: {
      StreamSuitesStatusHelpers: {},
      StreamSuitesStatusData: {},
      matchMedia: () => ({ matches: false }),
    },
    document: { readyState: "loading", addEventListener() {} },
    console,
    Intl,
  };
  vm.runInNewContext(read("js/status-page.js"), context);
  return context.window.StreamSuitesStatusChartHelpers;
};
const observation = (minute, latency_ms, state = "operational", availability_percent = 100) => ({
  at: new Date(Date.UTC(2026, 7, 9, 0, minute)).toISOString(),
  latency_ms,
  state,
  availability_percent,
  sample_count: 1,
});

test("canonical status page uses the approved production brand and omits the floating widget", () => {
  const html = read("status.html");
  const pageScript = read("js/status-page.js");
  assert.match(html, /<link rel="canonical" href="https:\/\/streamsuites\.app\/status"/);
  assert.match(html, /\/assets\/logos\/ssmainlogosq\.webp/);
  assert.match(html, /\/assets\/logos\/wmnew\.webp/);
  assert.match(html, /\/css\/status-page\.css/);
  assert.match(html, /\/js\/status-data\.js/);
  assert.match(html, /\/js\/status-page\.js/);
  assert.doesNotMatch(html, /status-widget\.css|status-widget\.js|ss-status-indicator|data-status-slot|data-status-widget-host/);

  const refresh = html.indexOf("Refresh status");
  const components = html.indexOf("See components");
  const atlassian = html.indexOf("Atlassian hosted page");
  assert.ok(refresh >= 0 && components > refresh && atlassian > components);
  assert.match(html, /id="components"/);
  assert.match(html, /data-component-search/);
  assert.match(html, /data-status-filter="operational"/);
  assert.match(html, /data-status-filter="attention"/);
  assert.match(html, /data-active-incidents/);
  assert.match(html, /data-maintenances/);
  assert.match(html, /data-incident-history/);
  assert.match(pageScript, /open \? "Close navigation" : "Open navigation"/);
});

test("status overview and component controls retain the polished dark layout contract", () => {
  const html = read("status.html");
  const css = read("css/status-page.css");
  const metricCards = html.match(/<article class="status-metric(?: status-metric--overall)?">/g) || [];

  assert.equal(metricCards.length, 4);
  assert.match(css, /:root\s*\{[\s\S]*?color-scheme:\s*dark;/);
  assert.match(css, /\.status-metric\s*\{[\s\S]*?display:\s*flex;[\s\S]*?min-height:\s*154px;/);
  assert.match(css, /\.component-controls\s*\{[\s\S]*?grid-template-columns:\s*minmax\(320px, 1fr\) auto;[\s\S]*?background:/);
  assert.match(css, /\.component-search input\s*\{[\s\S]*?appearance:\s*none;[\s\S]*?background:\s*#07101a;/);
  assert.match(css, /\.status-filters button\s*\{[\s\S]*?min-height:\s*48px;[\s\S]*?appearance:\s*none;/);
  assert.match(css, /\.status-filters button:focus-visible\s*\{[\s\S]*?box-shadow:/);
  assert.doesNotMatch(css, /tokens truncated|truncation placeholder/i);
});

test("status controller is read-only, bounded, stale-safe, and has no demo or fake operational fallback", () => {
  const script = read("js/status-data.js");
  assert.match(script, /v0hwlmly3pd2\.statuspage\.io\/api\/v2/);
  assert.match(script, /summary\.json/);
  assert.match(script, /incidents\.json/);
  assert.match(script, /scheduled-maintenances\.json/);
  assert.match(script, /cache:\s*"no-store"/);
  assert.match(script, /REQUEST_TIMEOUT_MS\s*=\s*8000/);
  assert.match(script, /POLL_INTERVAL_MS\s*=\s*60000/);
  assert.match(script, /api\/public\/status\/diagnostics/);
  assert.match(script, /diagnosticsLive/);
  assert.match(read("js/status-page.js"), /Atlassian-only mode/);
  assert.match(script, /lastSuccessfulData/);
  assert.match(script, /visibilitychange/);
  assert.doesNotMatch(script, /localStorage|\?demo=|fallbackComponents|createFallback|api\/v2\/components\/[^"'`]*\.(?:json|put|post)/i);
  assert.doesNotMatch(script, /api[_-]?key|manage\.statuspage|method:\s*["'](?:POST|PUT|PATCH|DELETE)/i);
});

test("final locked topology renders four groups and 21 child components without group cards", () => {
  const source = read("js/status-data.js");
  const context = { window: {}, document: {}, console, performance: { now: () => 0 }, AbortController, fetch: async () => ({ ok: true, json: async () => ({}) }), CustomEvent: class {} };
  vm.runInNewContext(source, context);
  const groups = [
    ["h70vntnsh3v9", "Production Products"], ["z1wlqnyx91nl", "Core Platform"],
    ["mrlp0c2t3vlb", "Web & Audience Surfaces"], ["n8hrjx9krwgt", "External Dependencies"],
  ];
  const childIds = [
    "3qsdkc52dgt5", "b6k38lrqx93f", "q7435t6bd41x", "4fp296vdg5w7", "94cn19vph28j",
    "tb383cr2p92n", "4vrh4mg9l4hn", "0xm0hsy3byjj", "3xjjgpbydbbf", "qbczblv2hgv8", "6ww27z4z9vj8",
    "zx07yy34tyvl", "rdb3pmbvr4bv", "5wm11qq4b7w9", "jnd29jsl8w7b", "8x9n41kfjtc8", "p00vypwhfhx3",
    "n1lw27451j6d", "8zfbmn6ynv99", "5qbjrf4hq5nn", "gd23vgnp3n89",
  ];
  const components = groups.map(([id, name], position) => ({ id, name, group: true, position }));
  childIds.forEach((id, position) => components.push({ id, name: `Component ${position + 1}`, group: false, group_id: groups[Math.floor(position / 6)]?.[0] || groups[3][0], status: "operational", position }));
  const grouped = context.window.StreamSuitesStatusHelpers.groupComponents(components);
  assert.equal(grouped.length, 4);
  assert.equal(grouped.reduce((count, group) => count + group.components.length, 0), 21);
  assert.equal(Array.from(grouped, (group) => group.label).join("|"), groups.map((group) => group[1]).join("|"));
  assert.equal(grouped.some((group) => group.components.some((component) => component.group)), false);
});

test("component cards use meaningful icons, truthful source states, expansion, and real-history-only graphs", () => {
  const page = read("js/status-page.js");
  const html = read("status.html");
  const css = read("css/status-page.css");
  const iconEntries = page.match(/"[a-z0-9]{12}": \{ icon:/g) || [];
  assert.equal(iconEntries.length, 21);
  assert.doesNotMatch(page, /componentInitial/);
  assert.match(page, /aria-expanded/);
  assert.match(page, /state\.graphRanges/);
  assert.match(page, /state\.graphEntrances/);
  assert.match(page, /\["24h", "7d", "30d"\]/);
  assert.match(page, /role", "img"/);
  assert.match(page, /tabindex", "0"/);
  assert.match(page, /aria-label", `\$\{formatAbsolute\(point\.at\)\} · \$\{point\.latency\} milliseconds/);
  assert.match(page, /Watchdog-observed availability|watchdog-observed availability/);
  assert.match(page, /if \(!activeRange\)/);
  assert.match(page, /History is still accumulating/);
  assert.match(page, /Nothing is interpolated or backfilled/);
  assert.match(page, /flushSegment\(\)/);
  assert.match(page, /observation\.time - previousMeasured\.time > rangeMeta\.maxGapMs/);
  assert.match(page, /Managed through Atlassian's provider integration/);
  assert.match(page, /Automated monitoring is deferred/);
  assert.match(page, /Reconciliation pending/);
  assert.match(page, /!directObservationStale/);
  assert.match(page, /event\.key !== "Escape"/);
  assert.match(html, /Atlassian-only operation/);
  assert.match(html, /Studio Room Readiness/);
  assert.match(html, /data-diagnostic-core-history[^>]*aria-controls="component-tb383cr2p92n-details"/);
  assert.match(page, /View 24H \/ 7D \/ 30D history/);
  assert.match(page, /initMetricHistory/);
  assert.match(css, /\.component-card\.is-expanded/);
  assert.match(css, /\.component-card\s*\{[\s\S]*?min-height:\s*248px;/);
  assert.match(css, /\.component-detail-rail__summary/);
  assert.match(css, /\.component-graph__axis-label/);
  assert.match(css, /\.component-graph__point:focus/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});

test("chart model preserves only real observations, explicit nulls, and measured zero values", () => {
  const helpers = loadChartHelpers();
  const buckets = [
    observation(0, 120),
    observation(5, null, "major_outage", 0),
    observation(10, 0),
  ];
  const model = helpers.buildChartModel(buckets, "24h");
  assert.equal(model.observations.length, buckets.length);
  assert.deepEqual(Array.from(model.latencyPoints, (point) => point.latency), [120, 0]);
  assert.deepEqual(Array.from(model.segments, (segment) => segment.length), [1, 1]);
  assert.equal(model.gaps.length, 1);
  assert.equal(model.gaps[0].reason, "missing_measurement");
  assert.equal(model.observations[1].latency, null);
  assert.equal(model.observations[1].availability, 0);
  const measuredValues = Array.from(model.latencyPoints, (point) => point.latency);
  assert.equal(Math.min(...measuredValues), 0);
  assert.equal(Math.max(...measuredValues), 120);
  assert.equal(measuredValues.reduce((total, value) => total + value, 0) / measuredValues.length, 60);
});

test("24H, 7D, and 30D models retain exact selected time domains", () => {
  const helpers = loadChartHelpers();
  const buckets = [observation(0, 100), observation(5, 110)];
  for (const [range, duration] of [["24h", 86400000], ["7d", 604800000], ["30d", 2592000000]]) {
    const model = helpers.buildChartModel(buckets, range);
    assert.equal(model.endTime - model.startTime, duration, range);
    assert.equal(model.rangeKey, range);
  }
});

test("selected-range time before the first real bucket is exposed as unavailable history", () => {
  const helpers = loadChartHelpers();
  const model = helpers.buildChartModel([observation(0, 100), observation(5, 110)], "24h");
  assert.ok(model.leadingGap);
  assert.equal(model.leadingGap.kind, "leading");
  assert.equal(model.leadingGap.fromTime, model.startTime);
  assert.equal(model.leadingGap.to, model.observations[0]);
  assert.equal(model.leadingGap.toX, model.observations[0].x);
  assert.ok(model.leadingGap.durationMs > 23 * 60 * 60 * 1000);
});

test("single and two-point latency history stays sparse without manufactured geometry", () => {
  const helpers = loadChartHelpers();
  const single = helpers.buildChartModel([observation(0, 84)], "24h");
  assert.equal(single.latencyPoints.length, 1);
  assert.equal(single.segments[0].length, 1);
  assert.match(helpers.smoothChartPath([{ x: 10, y: 20 }]), /^M10\.00 20\.00$/);
  const two = helpers.buildChartModel([observation(0, 84), observation(5, 92)], "24h");
  assert.equal(two.segments[0].length, 2);
  assert.match(helpers.smoothChartPath([{ x: 10, y: 20 }, { x: 30, y: 12 }]), / L30\.00 12\.00$/);
  assert.doesNotMatch(helpers.smoothChartPath([{ x: 10, y: 20 }, { x: 30, y: 12 }]), / C/);
});

test("missing intervals split smooth curves instead of implying measurements", () => {
  const helpers = loadChartHelpers();
  const adjacent = helpers.buildChartModel([observation(0, 80), observation(5, 95)], "24h");
  assert.deepEqual(Array.from(adjacent.segments, (segment) => segment.length), [2]);
  assert.equal(adjacent.gaps.length, 0);
  const timestampGap = helpers.buildChartModel([observation(0, 80), observation(10, 95)], "24h");
  assert.deepEqual(Array.from(timestampGap.segments, (segment) => segment.length), [1, 1]);
  assert.equal(timestampGap.gaps.length, 1);
  assert.equal(timestampGap.gaps[0].missingBucketCount, 1);
  assert.equal(timestampGap.gaps[0].reason, "missing_interval");
  const explicitGap = helpers.buildChartModel([observation(0, 80), observation(5, null), observation(10, 95)], "24h");
  assert.deepEqual(Array.from(explicitGap.segments, (segment) => segment.length), [1, 1]);
  assert.equal(explicitGap.gaps.length, 1);
  assert.equal(explicitGap.gaps[0].reason, "missing_measurement");
});

test("observability rail creates flat markers only for missing internal buckets", () => {
  const helpers = loadChartHelpers();
  const model = helpers.buildChartModel([
    observation(0, 80),
    observation(5, null, "operational", null),
    observation(15, 95),
  ], "24h");
  const markers = helpers.internalMissingRailMarkers(model);
  assert.equal(markers.length, 1);
  assert.equal(markers[0].time, Date.parse(observation(10, 0).at));
  assert.ok(markers[0].x > model.observations[1].x && markers[0].x < model.observations[2].x);
  assert.equal(helpers.internalMissingRailMarkers(helpers.buildChartModel([observation(0, 80), observation(5, 95)], "24h")).length, 0);
});

test("five-minute normalization tolerates timestamp jitter and reports plotted bucket counts", () => {
  const helpers = loadChartHelpers();
  const interval = 300000;
  assert.equal(
    helpers.normalizeBucketTimestamp("2026-08-09T00:09:59.999Z", interval),
    Date.parse("2026-08-09T00:05:00.000Z")
  );
  const model = helpers.buildChartModel([
    { ...observation(0, 80), at: "2026-08-09T00:00:02.000Z" },
    { ...observation(5, 84), at: "2026-08-09T00:05:59.000Z" },
    { ...observation(5, 86), at: "2026-08-09T00:05:12.000Z" },
  ], "24h");
  assert.equal(model.plottedBucketCount, 2);
  assert.equal(model.plottedMeasurementCount, 2);
  assert.equal(model.segments.length, 1);
  assert.equal(model.gaps.length, 0);
});

test("latest measured point after a genuine gap remains real and is the gap destination", () => {
  const helpers = loadChartHelpers();
  const model = helpers.buildChartModel([observation(0, 80), observation(5, 84), observation(20, 91)], "24h");
  const latest = model.latencyPoints.at(-1);
  assert.equal(latest.latency, 91);
  assert.equal(model.gaps.length, 1);
  assert.equal(model.gaps[0].to, latest);
  assert.match(helpers.formatGapDuration(model.gaps[0].durationMs), /minutes|hour/);
});

test("state-only history never manufactures a latency series", () => {
  const helpers = loadChartHelpers();
  const model = helpers.buildChartModel([observation(0, null), observation(5, null, "degraded_performance", 50)], "24h");
  assert.equal(model.graphType, "state");
  assert.equal(model.latencyPoints.length, 0);
  assert.equal(model.observations.length, 2);
  assert.equal(helpers.observedStateKey("scheduled_maintenance"), "maintenance");
});

test("nearest-point tooltip data is copied from a real observation", () => {
  const helpers = loadChartHelpers();
  const model = helpers.buildChartModel([observation(0, 80), observation(5, null, "partial_outage", 0), observation(10, 95)], "24h");
  const source = model.observations[1];
  const nearest = helpers.nearestChartObservation(model.observations, source.x);
  const tooltip = helpers.tooltipDataForObservation(nearest);
  assert.equal(tooltip.at, source.at);
  assert.equal(tooltip.latency, null);
  assert.equal(tooltip.availability, 0);
  assert.equal(tooltip.state, "Partial outage");
});

test("premium SVG treatment remains dependency-free, range-accessible, and reduced-motion safe", () => {
  const page = read("js/status-page.js");
  const css = read("css/status-page.css");
  const html = read("status.html");
  assert.match(page, /createElementNS\("http:\/\/www\.w3\.org\/2000\/svg", tag\)/);
  assert.match(page, /linearGradient/);
  assert.match(page, /component-graph__area/);
  assert.match(page, /component-graph__gap-band/);
  assert.match(page, /component-graph__gap-label/);
  assert.match(page, /component-graph__gap-bridge/);
  assert.match(page, /bridge\.setAttribute\("data-unmeasured", "true"\)/);
  assert.match(page, /No observations are included in this bridge/);
  const measuredSegmentRenderer = page.indexOf("model.segments.forEach((sourceSegment)");
  const gapBridgeRenderer = page.indexOf("model.gaps.forEach((gap) =>", measuredSegmentRenderer);
  assert.ok(measuredSegmentRenderer >= 0 && gapBridgeRenderer > measuredSegmentRenderer);
  assert.match(page.slice(measuredSegmentRenderer, gapBridgeRenderer), /component-graph__area/);
  assert.doesNotMatch(page.slice(gapBridgeRenderer), /component-graph__gap-bridge[\s\S]*?component-graph__area/);
  assert.match(page, /path\.getTotalLength\(\)/);
  assert.match(page, /--chart-draw-length/);
  assert.match(page, /is-chart-primed/);
  assert.match(page, /IntersectionObserver/);
  assert.match(page, /visiblePixels < Math\.min\(160, bounds\.height \* \.22\)/);
  assert.match(page, /if \(options\.transition === "range"\) queueChartEntrance\(panel\)/);
  assert.match(page, /internalMissingRailMarkers\(model\)/);
  assert.match(page, /component-graph__state-bar--missing/);
  assert.match(page, /Flat grey markers = missing internal observations/);
  assert.match(page, /component-graph__point is-current/);
  assert.match(page, /component-graph__crosshair/);
  assert.match(page, /component-graph__tooltip/);
  assert.match(page, /nearestChartObservation\(model\.observations, x\)/);
  assert.match(page, /is-range-leaving/);
  assert.match(page, /aria-pressed/);
  assert.match(page, /ArrowRight|ArrowLeft/);
  assert.match(page, /chartMotionReduced\(\)/);
  assert.match(page, /panel\.dataset\.chartMotion = "reduced"/);
  assert.match(page, /Core API response time/);
  assert.match(page, /CORE_API_COMPONENT_ID\s*=\s*"tb383cr2p92n"/);
  assert.doesNotMatch(page, /CORE_API_COMPONENT_ID\s*=\s*"0xm0hsy3byjj"/);
  assert.match(page, /Range min/);
  assert.match(page, /Observed average/);
  assert.match(page, /Range max/);
  assert.match(page, /Plotted buckets/);
  assert.match(page, /Latency buckets/);
  assert.match(page, /Raw observations/);
  assert.match(page, /Missing intervals/);
  assert.match(page, /areaGradient\.setAttribute\("x1", String\(CHART_VIEW\.left\)\)[\s\S]*?areaGradient\.setAttribute\("x2", String\(CHART_VIEW\.left\)\)[\s\S]*?areaGradient\.setAttribute\("y1", String\(CHART_VIEW\.top\)\)[\s\S]*?areaGradient\.setAttribute\("y2", String\(CHART_VIEW\.bottom\)\)/);
  assert.match(css, /--status-chart-gap:\s*#8091a5/);
  assert.match(css, /\.component-graph__gap-bridge\s*\{[\s\S]*?stroke-dasharray:/);
  assert.match(css, /\.component-graph__line\s*\{[\s\S]*?stroke-dasharray:\s*none/);
  assert.match(css, /stroke-dashoffset 2050ms/);
  assert.match(css, /component-graph__state-bar[\s\S]*?transition:[^;]*opacity 720ms[^;]*transform 880ms/);
  assert.match(css, /component-graph__rail-stop--top[^{]*\{[^}]*stop-opacity:\s*\.98/);
  assert.match(css, /component-graph__rail-stop--bottom[^{]*\{[^}]*stop-opacity:\s*\.58/);
  assert.match(css, /component-graph__state-bar--missing/);
  assert.match(css, /\.component-graph__stop--fill-top[^\n]*stop-opacity:\s*\.34/);
  assert.match(css, /\.component-graph__stop--fill-tail[^\n]*stop-opacity:\s*\.11/);
  assert.match(css, /chart-tip-settle/);
  assert.match(css, /\.component-graph__area \{ opacity: 1 !important; transform: none !important; \}/);
  assert.doesNotMatch(`${page}\n${html}`, /Chart\.js|\bd3\.|ApexCharts|ECharts|Highcharts|Recharts/);
});

test("hero diagram uses production SVG assets and sequential semantic routes", () => {
  const html = read("status.html");
  const page = read("js/status-page.js");
  const css = read("css/status-page.css");
  assert.match(html, /system-map__hub[\s\S]*?\/assets\/icons\/streamsuites-0\.svg/);
  assert.match(css, /system-pulse__state-mark\[data-state="operational"\][\s\S]*?\/assets\/icons\/ui\/tick\.svg/);
  assert.equal((html.match(/data-group-node=/g) || []).length, 4);
  for (const route of ["products", "core", "web", "dependencies"]) {
    assert.match(html, new RegExp(`data-route="${route}"`));
    assert.match(html, new RegExp(`data-route-signal="${route}"`));
  }
  assert.match(css, /@keyframes systemRouteTrace/);
  assert.match(css, /system-map__packet/);
  assert.match(css, /prefers-reduced-motion:[\s\S]*?system-map__packet/);
  assert.match(css, /system-map__node--products \{ --node-color: #6f9dff/);
  assert.match(css, /system-map__node--core \{ --node-color: #51d4e8/);
  assert.match(css, /system-map__node--web \{ --node-color: #987cff/);
  assert.doesNotMatch(html, /system-map__hub[^>]*>\s*<span>S<\/span>/);
  assert.doesNotMatch(`${html}\n${page}`, /operation-empty__mark", "✓"|system-pulse__state-mark">✓/);
});

test("status header reuses canonical Public version hydration without a hardcoded version", () => {
  const status = read("status.html");
  for (const pageName of ["support.html", "privacy.html", "status.html"]) {
    const html = read(pageName);
    assert.match(html, /standalone-version-badge footer-version button button--quiet button--small/);
    assert.match(html, /\/js\/utils\/versioning\.js/);
    assert.match(html, /\/js\/utils\/version-stamp\.js/);
  }
  assert.match(status, /href="\/version">Loading version…<\/a>/);
  assert.doesNotMatch(status, /v0\.5\.4-alpha|v\d+\.\d+\.\d+-alpha/);
  assert.match(read("js/utils/version-stamp.js"), /formatDisplayVersion\(info\)/);
  assert.match(read("js/utils/versioning.js"), /UNAVAILABLE_LABEL\s*=\s*"Version unavailable"/);
});

test("incident and maintenance empty states use the local tick while real-event rendering remains", () => {
  const html = read("status.html");
  const page = read("js/status-page.js");
  const css = read("css/status-page.css");
  assert.match(html, /data-operation-panel="incident"/);
  assert.match(html, /data-operation-panel="maintenance"/);
  assert.match(css, /\.operation-empty__mark::before[\s\S]*?\/assets\/icons\/ui\/tick\.svg/);
  assert.match(css, /\.panel-icon--incident::before[\s\S]*?position:\s*absolute;[\s\S]*?inset:\s*0;[\s\S]*?margin:\s*auto;[\s\S]*?transform:\s*translate\(\.6px, -1\.2px\)/);
  assert.match(page, /else incidents\.forEach\(\(incident\) => incidentRoot\.appendChild\(createOperationItem\(incident, "incident"\)\)\)/);
  assert.match(page, /else maintenances\.forEach\(\(maintenance\) => maintenanceRoot\.appendChild\(createOperationItem\(maintenance, "maintenance"\)\)\)/);
  assert.match(page, /item\.incident_updates/);
  assert.match(page, /item\.scheduled_for/);
});

test("group summaries and source labels expose the locked monitoring taxonomy", () => {
  const page = read("js/status-page.js");
  const css = read("css/status-page.css");
  assert.match(page, /const GROUP_PRESENTATION = Object\.freeze/);
  assert.match(page, /Creation products and their connected production services/);
  assert.match(page, /Identity, rooms, APIs, automation, and notification authority/);
  assert.match(page, /Audience, creator, admin, developer, documentation, and distribution surfaces/);
  assert.match(page, /External delivery, email, payment, and Git operations/);
  for (const label of ["Monitored", "Deferred", "External", "Attention"]) assert.match(page, new RegExp(`\\["${label}"`));
  assert.match(page, /Official status — Atlassian/);
  assert.match(page, /Direct observation — StreamSuites Watchdog/);
  assert.match(page, /External provider — Atlassian integration/);
  assert.match(page, /Manual \/ deferred monitor/);
  assert.match(css, /\.component-group__counts/);
  assert.match(css, /--group-accent/);
  const cardSurface = css.slice(css.indexOf(".component-card {"), css.indexOf(".component-card__top"));
  assert.doesNotMatch(cardSurface, /--group-accent/);
  assert.match(cardSurface, /border:\s*1px solid var\(--line\)/);
  assert.match(cardSurface, /background:\s*rgba\(8, 15, 23, \.78\)/);
  const graphSurface = css.slice(css.indexOf(".component-graph {"), css.indexOf(".component-state {"));
  assert.doesNotMatch(graphSurface, /--group-accent/);
  assert.match(css, /\.component-card__footer/);
});

test("all newly referenced status icons exist locally", () => {
  const page = read("js/status-page.js");
  const iconPaths = [...page.matchAll(/icon: "(\/assets\/icons\/[^"]+)"/g)].map((match) => match[1]);
  assert.equal(iconPaths.length, 22);
  for (const iconPath of iconPaths) assert.ok(fs.existsSync(path.join(root, iconPath.slice(1))), iconPath);
});

test("public widget implements the approved idle, hover, detailed, and footer-aware states", () => {
  const script = read("js/status-widget.js");
  const css = read("css/status-widget.css");
  assert.match(script, /groupComponents\(components\)/);
  assert.match(script, /createComponentGroup/);
  assert.match(script, /Active incidents/);
  assert.match(script, /Scheduled maintenance/);
  assert.match(script, /Full StreamSuites status/);
  assert.match(script, /PRIMARY_STATUS_URL\s*=\s*"\/status"/);
  assert.match(script, /https:\/\/streamsuites\.statuspage\.io\//);
  assert.match(script, /\/assets\/icons\/ui\/plus\.svg/);
  assert.match(script, /\/assets\/icons\/ui\/cross\.svg/);
  assert.match(script, /data\.iconKind = kind|dataset\.iconKind = kind/);
  assert.match(script, /const clearance = 12/);
  assert.match(script, /viewportHeight - rect\.top \+ clearance/);
  assert.match(script, /ResizeObserver/);
  assert.match(script, /public-page-visit\.js/);
  assert.match(script, /status-data\.js/);
  assert.match(script, /Atlassian custom metrics/);
  assert.match(script, /Core API response time/);
  assert.match(script, /Studio Room Readiness/);
  assert.match(script, /core_api_response_time/);
  assert.match(script, /studio_room_readiness/);
  assert.match(script, /Awaiting a measured Core API observation/);
  assert.match(script, /Number\(coreValue\) >= 0/);
  assert.match(script, /No genuine Studio room readiness observation is available/);
  assert.match(script, /Historical ranges are available in the Status Center/);
  assert.match(script, /Historical data begins only after that transaction exists/);
  assert.match(script, /Sanitized Runtime\/Auth projection/);
  assert.match(css, /\.ss-status-widget__metrics-grid/);
  assert.match(css, /\.ss-status-widget__metric\[data-state="deferred"\]/);
  assert.doesNotMatch(script, /manage\.statuspage|api[_-]?key|method:\s*["'](?:POST|PUT|PATCH|DELETE)/i);
  assert.doesNotMatch(script, /\?demo=|__STATUS_POC/);

  assert.match(css, /\.ss-status-widget__toggle\s*\{[\s\S]*?width:\s*50px;[\s\S]*?background:\s*transparent;[\s\S]*?backdrop-filter:\s*none;/);
  assert.match(css, /\.ss-status-widget__signal\s*\{[\s\S]*?overflow:\s*hidden;[\s\S]*?isolation:\s*isolate;/);
  assert.match(css, /\.ss-status-widget:hover \.ss-status-widget__toggle/);
  assert.match(css, /\.ss-status-widget:focus-within \.ss-status-widget__toggle/);
  assert.match(css, /width:\s*258px/);
  assert.match(css, /\.ss-status-widget__expand-control/);
  assert.match(css, /@media \(max-width:\s*600px\)/);
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)/);
});

test("production status imports never depend on retained POC directories", () => {
  for (const relativePath of ["status.html", "js/status-data.js", "js/status-page.js", "js/status-widget.js", "css/status-page.css", "css/status-widget.css"]) {
    assert.doesNotMatch(read(relativePath), /statuspoc/i, relativePath);
  }
  for (const relativePath of ["index.html", "about.html", "support.html", "version.html"]) {
    assert.match(read(relativePath), /\/js\/status-widget\.js/);
  }
});

test("primary public status links now resolve to the branded status center", () => {
  for (const relativePath of ["index.html", "about.html", "accessibility.html", "donate.html", "privacy.html", "roadmap.html", "support.html", "version.html"]) {
    assert.match(read(relativePath), /href="\/status"[^>]*>[^<]*(?:Status|status)/, relativePath);
  }
  assert.match(read("status.html"), /href="https:\/\/streamsuites\.statuspage\.io\/"/);
});
