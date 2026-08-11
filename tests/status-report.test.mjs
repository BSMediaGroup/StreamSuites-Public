import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");

const loadReportHelpers = () => {
  const context = {
    window: {},
    document: { readyState: "loading", addEventListener() {} },
    console,
    Intl,
    URL,
    Blob,
  };
  vm.runInNewContext(read("js/status-report.js"), context);
  return context.window.StreamSuitesStatusReport;
};

const criticalComponents = [
  ["tb383cr2p92n", "Authentication, Accounts & Sessions"],
  ["0xm0hsy3byjj", "Public APIs, Exports & Version Registry"],
  ["zx07yy34tyvl", "Public Website & Status Center"],
  ["3qsdkc52dgt5", "Browser Studio"],
  ["q7435t6bd41x", "StudioApp Connected Services"],
  ["94cn19vph28j", "Studio for OBS Connected Services"],
];

const ranges = ["5h", "24h", "7d", "30d"];
const generatedAt = "2026-08-10T05:00:00.000Z";
const bucket = (minute, latency = 87, state = "operational", availability = 100) => ({
  at: `2026-08-10T04:${String(minute).padStart(2, "0")}:00.000Z`,
  state,
  latency_ms: latency,
  availability_percent: availability,
  success_count: state === "operational" ? 1 : 0,
  failure_count: state === "operational" ? 0 : 1,
  sample_count: 1,
});

const overallRange = (range) => ({
  requested_start: range === "5h" ? "2026-08-10T00:00:00.000Z" : "2026-08-09T05:00:00.000Z",
  requested_end: generatedAt,
  effective_range_start: "2026-08-10T04:40:00.000Z",
  effective_monitoring_start: "2026-08-10T04:40:00.000Z",
  bucket_range_start: "2026-08-10T04:40:00.000Z",
  expected_buckets: 4,
  observed_buckets: 3,
  known_buckets: 2,
  operational_buckets: 1,
  degraded_buckets: 0,
  partial_outage_buckets: 1,
  major_outage_buckets: 0,
  maintenance_buckets: 0,
  unknown_buckets: 1,
  operational_seconds: 300,
  available_seconds: 300,
  downtime_seconds: 300,
  degraded_seconds: 0,
  maintenance_seconds: 0,
  unknown_seconds: 300,
  before_overall_monitoring_began_seconds: range === "5h" ? 16800 : 0,
  watchdog_observed_availability_percent: 99.98342,
  observation_coverage_percent: 83.333,
  timeline_resolution_seconds: 300,
  state_timeline: [
    { at: "2026-08-10T04:45:00.000Z", state: "operational", source_bucket_count: 1, observed_bucket_count: 1 },
    { at: "2026-08-10T04:50:00.000Z", state: "unknown", source_bucket_count: 1, observed_bucket_count: 0 },
    { at: "2026-08-10T04:55:00.000Z", state: "partial_outage", source_bucket_count: 1, observed_bucket_count: 1 },
  ],
  critical_path_availability_timeline: [
    { at: "2026-08-10T04:45:00.000Z", critical_path_availability_percent: 100, available_path_observations: 6, unavailable_path_observations: 0, maintenance_path_observations: 0, unknown_path_observations: 0, source_bucket_count: 1 },
    { at: "2026-08-10T04:50:00.000Z", critical_path_availability_percent: null, available_path_observations: 0, unavailable_path_observations: 0, maintenance_path_observations: 0, unknown_path_observations: 6, source_bucket_count: 1 },
    { at: "2026-08-10T04:55:00.000Z", critical_path_availability_percent: 83.333, available_path_observations: 5, unavailable_path_observations: 1, maintenance_path_observations: 0, unknown_path_observations: 0, source_bucket_count: 1 },
  ],
});

const diagnostic = (componentId, name, coverage = "implemented") => ({
  component_key: name.toLowerCase().replace(/[^a-z0-9]+/g, "_"),
  component_id: componentId,
  display_name: name,
  group_key: "core",
  description: `${name} public diagnostic boundary.`,
  owner: coverage === "vendor_managed" ? "atlassian_third_party" : coverage === "deferred" ? "manual_deferred" : "watchdog",
  monitor_mode: coverage === "vendor_managed" ? "external_provider" : coverage === "deferred" ? "deferred" : "external_black_box",
  coverage,
  direct_state: coverage === "implemented" ? "operational" : null,
  last_checked: coverage === "implemented" ? "2026-08-10T04:55:00.000Z" : null,
  last_success: coverage === "implemented" ? "2026-08-10T04:55:00.000Z" : null,
  last_failure: null,
  latency_ms: coverage === "implemented" ? 87 : null,
  direct_stale: false,
  data_quality: coverage === "implemented" ? "observed" : coverage,
  history: Object.fromEntries(ranges.map((range) => [range, {
    buckets: coverage === "implemented" ? [bucket(45), bucket(50, null, "unknown", null), bucket(55, 93, "partial_outage", 83.333)] : [],
    availability_percent: coverage === "implemented" ? 99.98342 : null,
    sample_count: coverage === "implemented" ? 3 : 0,
  }])),
});

const fixture = () => {
  const group = { id: "z1wlqnyx91nl", name: "Core Platform", group: true, position: 0 };
  const official = criticalComponents.map(([id, name], index) => ({ id, name, group: false, group_id: group.id, status: "operational", position: index, updated_at: generatedAt }));
  official.push(
    { id: "b6k38lrqx93f", name: "Realtime Media & Guest Connections", group: false, group_id: group.id, status: "operational", position: 7, updated_at: generatedAt },
    { id: "n1lw27451j6d", name: "Cloudflare Pages", group: false, group_id: group.id, status: "operational", position: 8, updated_at: generatedAt },
  );
  const componentDiagnostics = Object.fromEntries(criticalComponents.map(([id, name]) => [name.toLowerCase().replace(/[^a-z0-9]+/g, "_"), diagnostic(id, name)]));
  componentDiagnostics.realtime_media = diagnostic("b6k38lrqx93f", "Realtime Media & Guest Connections", "deferred");
  componentDiagnostics.cloudflare_pages = diagnostic("n1lw27451j6d", "Cloudflare Pages", "vendor_managed");
  return {
    data: {
      page: { id: "v0hwlmly3pd2", name: "StreamSuites", url: "https://streamsuites.statuspage.io", updated_at: generatedAt },
      status: { indicator: "none", description: "All Systems Operational" },
      components: [group, ...official],
      incidents: [{ id: "incident-1", name: "Authentication event", status: "investigating", impact: "minor", created_at: generatedAt, updated_at: generatedAt, components: [{ id: "tb383cr2p92n", name: "Authentication, Accounts & Sessions" }], incident_updates: [{ status: "investigating", body: "Investigating a public authentication event.", created_at: generatedAt, updated_at: generatedAt }] }],
      scheduled_maintenances: [{ id: "maintenance-1", name: "Browser Studio maintenance", status: "scheduled", impact: "maintenance", created_at: generatedAt, updated_at: generatedAt, scheduled_for: "2026-08-11T05:00:00.000Z", scheduled_until: "2026-08-11T06:00:00.000Z", components: [{ id: "3qsdkc52dgt5", name: "Browser Studio" }], incident_updates: [] }],
    },
    diagnostics: {
      schema_version: "status-watchdog-public-v1",
      generated_at: generatedAt,
      source: "streamsuites-independent-watchdog",
      freshness: { state: "fresh", age_seconds: 5, max_age_seconds: 240 },
      coverage: { implemented: 6, deferred_manual: 1, vendor_managed: 1, total: 8 },
      overall_availability: {
        contract_version: "overall-availability-v1",
        bucket_size_seconds: 300,
        source: "watchdog_observations_secondary",
        official_status_source: "atlassian_statuspage",
        critical_components: criticalComponents.map(([id, name], index) => ({ component_key: `critical_${index}`, component_id: id, display_name: name, role: index < 2 ? "common_authority" : "product_path" })),
        common_authority_component_ids: criticalComponents.slice(0, 2).map(([id]) => id),
        product_path_component_ids: criticalComponents.slice(2).map(([id]) => id),
        effective_monitoring_start: "2026-08-10T04:40:00.000Z",
        generated_at: generatedAt,
        supported_ranges: ranges,
        current: {
          watchdog_overall_state: "partial_outage",
          state_label: "Partial outage",
          critical_path_availability_percent: 83.333,
          available_path_count: 5,
          unavailable_path_count: 1,
          maintenance_path_count: 0,
          unknown_path_count: 0,
          total_eligible_path_count: 6,
          critical_component_count: 6,
          observed_at: "2026-08-10T04:55:00.000Z",
          derived_at: generatedAt,
          bucket_at: "2026-08-10T04:55:00.000Z",
          contract_version: "overall-availability-v1",
          observation_freshness: { state: "fresh", age_seconds: 5, max_age_seconds: 240 },
        },
        ranges: Object.fromEntries(ranges.map((range) => [range, overallRange(range)])),
      },
      components: componentDiagnostics,
      metrics: {
        core_api_response_time: { metric_id: "pp5z548msg40", state: "observed", value_ms: 87, last_checked: "2026-08-10T04:55:00.000Z", history: diagnostic("tb383cr2p92n", "Authentication").history },
        studio_room_readiness: { metric_id: "xz42g5v44kxv", state: "deferred", value: null, reason: "No genuine Studio room and RealtimeKit readiness transaction exists; homepage latency is not a substitute." },
      },
      status_report: { schema_version: "streamsuites-status-report-v1", supported_ranges: ranges },
    },
    diagnosticsStale: false,
    live: true,
    stale: false,
    checkedAt: generatedAt,
  };
};

test("full report preserves exact schema, precise values, canonical critical IDs, and source separation", () => {
  const helpers = loadReportHelpers();
  const model = helpers.buildStatusReportModel(fixture(), { scopeType: "full", range: "5h", generatedAt });
  assert.equal(model.schema, "streamsuites-status-report-v1");
  assert.equal(model.scope.type, "full");
  assert.equal(model.scope.page, "streamsuites-status");
  assert.equal(model.time_window.range, "5h");
  assert.equal(model.official_status.source, "atlassian_statuspage");
  assert.equal(model.watchdog_diagnostics.source, "streamsuites-independent-watchdog");
  assert.equal(model.overall.contract_version, "overall-availability-v1");
  assert.equal(model.overall.selected_range.watchdog_observed_availability_percent, 99.98342);
  assert.equal(typeof model.overall.selected_range.watchdog_observed_availability_percent, "number");
  assert.deepEqual(Array.from(model.overall.critical_components, (item) => item.component_id), criticalComponents.map(([id]) => id));
  assert.equal(model.metrics.core_api_response_time.value_ms, 87);
  assert.equal(model.metrics.core_api_response_time.selected_range.buckets.length, 3);
  assert.equal(model.metrics.studio_room_readiness.state, "deferred");
  assert.equal(model.metrics.studio_room_readiness.value, null);
  assert.equal(model.incidents.length, 1);
  assert.equal(model.scheduled_maintenance.length, 1);
  assert.equal(model.provenance.statuspage_page_id, "v0hwlmly3pd2");
  assert.equal(model.provenance.report_schema, "streamsuites-status-report-v1");
});

test("component reports scope history and only explicitly associated official records", () => {
  const helpers = loadReportHelpers();
  const auth = helpers.buildStatusReportModel(fixture(), { scopeType: "component", componentId: "tb383cr2p92n", componentName: "Authentication, Accounts & Sessions", range: "5h", generatedAt });
  assert.equal(auth.scope.type, "component");
  assert.equal(auth.scope.component_id, "tb383cr2p92n");
  assert.equal(auth.components.length, 1);
  assert.equal(auth.components[0].direct.selected_range.buckets.length, 3);
  assert.equal(auth.incidents.length, 1);
  assert.equal(auth.scheduled_maintenance.length, 0);
  assert.equal(auth.components[0].association.incidents.available, true);

  const deferred = helpers.buildStatusReportModel(fixture(), { scopeType: "component", componentId: "b6k38lrqx93f", componentName: "Realtime Media & Guest Connections", range: "5h", generatedAt });
  assert.equal(deferred.components[0].direct.coverage, "deferred");
  assert.equal(deferred.components[0].direct.selected_range.buckets.length, 0);

  const vendor = helpers.buildStatusReportModel(fixture(), { scopeType: "component", componentId: "n1lw27451j6d", componentName: "Cloudflare Pages", range: "5h", generatedAt });
  assert.equal(vendor.components[0].direct.coverage, "vendor_managed");
  assert.equal(vendor.components[0].direct.selected_range.buckets.length, 0);
});

test("missing component association metadata is described without claiming no historical impact", () => {
  const helpers = loadReportHelpers();
  const snapshot = fixture();
  snapshot.data.incidents = [{ id: "incident-without-components", name: "Public event", status: "resolved", impact: "minor", updated_at: generatedAt }];
  const model = helpers.buildStatusReportModel(snapshot, { scopeType: "component", componentId: "tb383cr2p92n", componentName: "Authentication, Accounts & Sessions", range: "24h", generatedAt });
  assert.equal(model.incidents.length, 0);
  assert.equal(model.components[0].association.incidents.available, false);
  assert.equal(model.components[0].association.incidents.note, "No component-specific incident association is available in the loaded data.");
});

test("partial source reports keep official and direct availability explicit", () => {
  const helpers = loadReportHelpers();
  const officialOnly = fixture();
  officialOnly.diagnostics = null;
  officialOnly.diagnosticsStale = false;
  const officialModel = helpers.buildStatusReportModel(officialOnly, { scopeType: "full", range: "5h", generatedAt });
  assert.equal(officialModel.official_status.available, true);
  assert.equal(officialModel.watchdog_diagnostics.available, false);
  assert.equal(officialModel.overall.available, false);
  assert.equal(officialModel.overall.selected_range.available, false);

  const diagnosticsOnly = fixture();
  diagnosticsOnly.data = null;
  diagnosticsOnly.live = false;
  const directModel = helpers.buildStatusReportModel(diagnosticsOnly, { scopeType: "full", range: "5h", generatedAt });
  assert.equal(directModel.official_status.available, false);
  assert.equal(directModel.official_status.current.description, "Official source unavailable");
  assert.equal(directModel.watchdog_diagnostics.available, true);
  assert.equal(directModel.components.length, 8);
  assert.equal(directModel.components.every((item) => item.official.available === false), true);
});

test("older diagnostics never manufacture 5H or overall history", () => {
  const helpers = loadReportHelpers();
  const snapshot = fixture();
  delete snapshot.diagnostics.overall_availability;
  for (const component of Object.values(snapshot.diagnostics.components)) delete component.history["5h"];
  delete snapshot.diagnostics.metrics.core_api_response_time.history["5h"];
  const model = helpers.buildStatusReportModel(snapshot, { scopeType: "full", range: "5h", generatedAt });
  assert.equal(model.overall.available, false);
  assert.equal(model.overall.unavailable_reason, "Awaiting updated watchdog diagnostics");
  assert.equal(model.components[0].direct.selected_range.available, false);
  assert.equal(model.components[0].direct.selected_range.buckets.length, 0);
  assert.equal(model.metrics.core_api_response_time.selected_range.available, false);
});

test("stale PNG PDF and JSON report models retain history with explicit offline provenance", () => {
  const helpers = loadReportHelpers();
  const snapshot = fixture();
  snapshot.diagnosticsStale = true;
  snapshot.diagnosticsGeneratedAt = generatedAt;
  snapshot.currentDirectObservationAvailable = false;
  const reportTime = "2026-08-10T08:00:00.000Z";
  const model = helpers.buildStatusReportModel(snapshot, { scopeType: "full", range: "5h", generatedAt: reportTime });
  assert.equal(model.watchdog_diagnostics.available, true);
  assert.equal(model.watchdog_diagnostics.fresh, false);
  assert.equal(model.watchdog_diagnostics.stale, true);
  assert.equal(model.watchdog_diagnostics.current_direct_observation_available, false);
  assert.equal(model.watchdog_diagnostics.last_successful_projection_at, generatedAt);
  assert.equal(model.components[0].direct.direct_stale, true);
  assert.equal(model.components[0].direct.current_direct_observation_available, false);
  assert.equal(model.components[0].direct.selected_range.buckets.length, 3);
  assert.equal(model.components[0].direct.selected_range.availability_percent, 99.98342);
  assert.equal(model.components[0].direct.selected_range.sample_count, 3);
  assert.equal(model.components[0].direct.selected_range.trailing_offline.state, "unobserved_watchdog_offline");
  assert.equal(model.components[0].direct.selected_range.trailing_offline.included_in_calculations, false);
  assert.equal(model.overall.selected_range.watchdog_observed_availability_percent, 99.98342);
  assert.equal(model.overall.selected_range.trailing_offline.state, "unobserved_watchdog_offline");
  assert.equal(model.metrics.core_api_response_time.value_ms, 87);
  assert.equal(model.metrics.core_api_response_time.current_measurement_available, false);
  assert.equal(model.metrics.core_api_response_time.selected_range.buckets.length, 3);
  assert.equal(model.metrics.studio_room_readiness.state, "deferred");
  assert.equal(model.time_window.historical_through, generatedAt);
  assert.equal(model.time_window.display_end, reportTime);
  const json = JSON.stringify(model);
  assert.match(json, /unobserved_watchdog_offline/);
  assert.doesNotMatch(json, /fake|synthetic_bucket/);
  const pdf = helpers.buildPrintDocument(model);
  assert.match(pdf, /Watchdog diagnostics stale/);
  assert.match(pdf, /Watchdog offline/i);
  assert.match(pdf, /Core API response time · last measured/);
  assert.match(pdf, /report-chart-offline/);
  const reportSource = read("js/status-report.js");
  assert.match(reportSource, /context\.fillRect\(offlineFrom, top/);
  assert.match(reportSource, /WATCHDOG OFFLINE/);
});

test("report whitelist removes private fields and rejects forbidden key or local-path leakage", () => {
  const helpers = loadReportHelpers();
  const snapshot = fixture();
  snapshot.diagnostics.api_key = "not-exported";
  snapshot.diagnostics.heartbeat_secret = "not-exported";
  snapshot.diagnostics.pid = 1234;
  snapshot.diagnostics.components.authentication_accounts_sessions.authorization = "not-exported";
  snapshot.data.incidents[0].incident_updates[0].body = "See C:\\Users\\private\\trace.txt";
  const model = helpers.buildStatusReportModel(snapshot, { scopeType: "full", range: "5h", generatedAt });
  const serialized = JSON.stringify(model);
  assert.doesNotMatch(serialized, /not-exported|C:\\Users\\|heartbeat_secret|api_key|"pid"|authorization/i);
  assert.equal(helpers.scanReportSafety(model).length, 0);
  assert.deepEqual(Array.from(helpers.scanReportSafety({ authorization: "x", note: "C:\\private" })), ["report.authorization", "report.note"]);
});

test("filenames are stable and component-safe", () => {
  const helpers = loadReportHelpers();
  const full = helpers.buildStatusReportModel(fixture(), { scopeType: "full", range: "5h", generatedAt });
  const component = helpers.buildStatusReportModel(fixture(), { scopeType: "component", componentId: "3qsdkc52dgt5", componentName: "Browser Studio", range: "24h", generatedAt });
  assert.equal(helpers.buildFilename(full, "json"), "streamsuites-status-5h-2026-08-10.json");
  assert.equal(helpers.buildFilename(component, "png"), "streamsuites-status-browser-studio-24h-2026-08-10.png");
  assert.equal(helpers.buildFilename(full, "png", 1, 2), "streamsuites-status-5h-2026-08-10-page-01.png");
});

test("native report renderers stay dependency-free, paginated, vector-printable, and provenance-complete", () => {
  const source = read("js/status-report.js");
  assert.match(source, /new Blob\(\[payload\], \{ type: "application\/json;charset=utf-8" \}\)/);
  assert.match(source, /document\.createElement\("canvas"\)/);
  assert.match(source, /canvas\.toBlob/);
  assert.match(source, /maximumPixelsPerPage:\s*3520000/);
  assert.match(source, /pageCount > 1/);
  assert.match(source, /this\.ensure\(125 \+ firstRowHeight \+ 18\)/);
  assert.match(source, /document\.createElement\("iframe"\)/);
  assert.match(source, /frame\.contentWindow\.print\(\)/);
  assert.match(source, /<svg class="report-chart"/);
  assert.match(source, /break-inside:avoid/);
  assert.match(source, /Official service state and incidents: Atlassian Statuspage/);
  assert.match(source, /Independent observations: StreamSuites Status Watchdog/);
  assert.match(source, /trigger\?\.focus\(\{ preventScroll: true \}\);\s*openReportModal/);
  assert.doesNotMatch(source, /html2canvas|jsPDF|pdf-lib|dom-to-image|Chart\.js|\bd3\./i);
});
