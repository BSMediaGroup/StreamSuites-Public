(() => {
  "use strict";

  if (window.StreamSuitesStatusReport) return;

  const REPORT_SCHEMA = "streamsuites-status-report-v1";
  const STATUSPAGE_PAGE_ID = "v0hwlmly3pd2";
  const RANGE_ORDER = Object.freeze(["5h", "24h", "7d", "30d"]);
  const RANGE_SECONDS = Object.freeze({ "5h": 18000, "24h": 86400, "7d": 604800, "30d": 2592000 });
  const FORMAT_LABELS = Object.freeze({ png: "PNG Report", pdf: "PDF Report", json: "JSON Data" });
  const PNG_LIMITS = Object.freeze({ width: 1600, pageHeight: 2200, maximumPixelsPerPage: 3520000 });
  const FORBIDDEN_KEY = /^(?:api[_-]?key|authorization|cookie|cookies|credentials?|heartbeat[_-]?secret|instance[_-]?id|local[_-]?path|oauth[_-]?token|password|pid|private[_-]?url|repo[_-]?root|secret|signature|state[_-]?path|stream[_-]?key|token|username)$/i;
  const FORBIDDEN_STRING = /(?:[a-z]:\\|\\users\\|\\\\|\/users\/|file:\/\/)/i;
  const STATE_LABELS = Object.freeze({
    operational: "Operational",
    degraded: "Degraded performance",
    degraded_performance: "Degraded performance",
    partial: "Partial outage",
    partial_outage: "Partial outage",
    major: "Major outage",
    major_outage: "Major outage",
    critical: "Major outage",
    maintenance: "Maintenance",
    under_maintenance: "Maintenance",
    unknown: "Unknown",
  });
  const STATE_COLORS = Object.freeze({
    operational: "#62dea2",
    degraded: "#f2b84b",
    partial: "#ef8c57",
    major: "#ff6464",
    maintenance: "#78b9ff",
    unknown: "#8a96a3",
  });

  const state = {
    snapshot: null,
    currentOverallRange: "24h",
    modalContext: null,
    previousFocus: null,
    busy: false,
  };

  const cleanText = (value, fallback = "") => {
    const text = String(value ?? fallback).trim();
    if (!text) return String(fallback || "");
    return FORBIDDEN_STRING.test(text) ? "[redacted unsafe value]" : text;
  };

  const finiteOrNull = (value) => Number.isFinite(value) ? Number(value) : null;
  const isoOrNull = (value) => Number.isFinite(Date.parse(value || "")) ? new Date(value).toISOString() : null;
  const stateKey = (value) => {
    const normalized = String(value || "unknown").toLowerCase();
    if (normalized === "operational") return "operational";
    if (normalized.includes("degraded")) return "degraded";
    if (normalized.includes("partial")) return "partial";
    if (normalized.includes("major") || normalized.includes("critical")) return "major";
    if (normalized.includes("maintenance")) return "maintenance";
    return "unknown";
  };
  const stateLabel = (value) => STATE_LABELS[String(value || "unknown").toLowerCase()] || STATE_LABELS[stateKey(value)] || "Unknown";
  const slugify = (value) => String(value || "component")
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 72) || "component";
  const escapeHtml = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
  const formatDate = (value, options = { dateStyle: "medium", timeStyle: "short" }) => {
    const parsed = Date.parse(value || "");
    return Number.isFinite(parsed) ? new Intl.DateTimeFormat(undefined, options).format(parsed) : "Unavailable";
  };
  const formatPercent = (value) => Number.isFinite(value)
    ? `${new Intl.NumberFormat(undefined, { maximumFractionDigits: 3 }).format(Number(value))}%`
    : "Unavailable";
  const formatDuration = (seconds) => {
    if (!Number.isFinite(seconds)) return "Unavailable";
    const minutes = Math.max(0, Math.round(Number(seconds) / 60));
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    if (hours < 24) return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
    const days = Math.floor(hours / 24);
    return hours % 24 ? `${days}d ${hours % 24}h` : `${days}d`;
  };

  const sanitizeBucket = (bucket) => ({
    at: isoOrNull(bucket?.at),
    state: cleanText(bucket?.state, "unknown"),
    success_count: finiteOrNull(bucket?.success_count),
    failure_count: finiteOrNull(bucket?.failure_count),
    sample_count: finiteOrNull(bucket?.sample_count),
    latency_ms: finiteOrNull(bucket?.latency_ms),
    availability_percent: finiteOrNull(bucket?.availability_percent),
  });

  const chartGapsFor = (buckets, rangeKey) => {
    const helpers = window.StreamSuitesStatusChartHelpers;
    if (!helpers?.buildChartModel) return { internal: [], leading: null };
    const model = helpers.buildChartModel(buckets, rangeKey);
    return {
      internal: model.gaps.map((gap) => ({
        from: gap.from?.at || null,
        to: gap.to?.at || null,
        duration_seconds: Math.round(gap.durationMs / 1000),
        missing_bucket_count: finiteOrNull(gap.missingBucketCount),
        reason: cleanText(gap.reason, "missing_interval"),
      })),
      leading: model.leadingGap ? {
        requested_start: new Date(model.leadingGap.fromTime).toISOString(),
        first_observation: model.leadingGap.to?.at || null,
        duration_seconds: Math.round(model.leadingGap.durationMs / 1000),
        state: "unavailable_pre_history",
      } : null,
    };
  };

  const trailingOfflineSpan = (timestamps, stale, displayEnd) => {
    if (!stale) return null;
    const lastObserved = (Array.isArray(timestamps) ? timestamps : []).map((value) => Date.parse(value || "")).filter(Number.isFinite).sort((a, b) => a - b).at(-1);
    const end = Date.parse(displayEnd || "");
    if (!Number.isFinite(lastObserved) || !Number.isFinite(end) || end <= lastObserved) return null;
    return {
      state: "unobserved_watchdog_offline",
      from: new Date(lastObserved).toISOString(),
      to: new Date(end).toISOString(),
      duration_seconds: Math.round((end - lastObserved) / 1000),
      included_in_calculations: false,
    };
  };

  const sanitizeComponentHistory = (diagnostic, rangeKey, context = {}) => {
    const history = diagnostic?.history;
    const supplied = Boolean(history && Object.prototype.hasOwnProperty.call(history, rangeKey));
    const selected = supplied && history[rangeKey] && typeof history[rangeKey] === "object" ? history[rangeKey] : null;
    const buckets = Array.isArray(selected?.buckets) ? selected.buckets.map(sanitizeBucket).filter((item) => item.at) : [];
    const gaps = chartGapsFor(buckets, rangeKey);
    return {
      range: rangeKey,
      available: supplied,
      unavailable_reason: supplied ? null : "Awaiting updated watchdog diagnostics",
      availability_percent: finiteOrNull(selected?.availability_percent),
      sample_count: finiteOrNull(selected?.sample_count),
      buckets,
      gaps: gaps.internal,
      pre_history: gaps.leading,
      trailing_offline: trailingOfflineSpan(buckets.map((item) => item.at), context.stale, context.displayEnd),
      calculated_as_of: context.stale ? isoOrNull(context.snapshotTime) : null,
    };
  };

  const sanitizeDiagnostic = (diagnostic, rangeKey, context = {}) => {
    if (!diagnostic || typeof diagnostic !== "object") {
      return {
        available: false,
        owner: null,
        coverage: "unavailable",
        monitor_mode: null,
        direct_state: null,
        direct_stale: null,
        data_quality: "unavailable",
        last_checked: null,
        last_success: null,
        last_failure: null,
        latency_ms: null,
        current_direct_observation_available: false,
        selected_range: sanitizeComponentHistory(null, rangeKey, context),
      };
    }
    return {
      available: true,
      component_key: cleanText(diagnostic.component_key),
      owner: cleanText(diagnostic.owner),
      coverage: cleanText(diagnostic.coverage),
      monitor_mode: cleanText(diagnostic.monitor_mode),
      direct_state: diagnostic.direct_state == null ? null : cleanText(diagnostic.direct_state),
      direct_stale: Boolean(diagnostic.direct_stale || context.stale),
      current_direct_observation_available: Boolean(!context.stale && !diagnostic.direct_stale),
      data_quality: cleanText(diagnostic.data_quality),
      last_checked: isoOrNull(diagnostic.last_checked),
      last_success: isoOrNull(diagnostic.last_success),
      last_failure: isoOrNull(diagnostic.last_failure),
      latency_ms: finiteOrNull(diagnostic.latency_ms),
      selected_range: sanitizeComponentHistory(diagnostic, rangeKey, context),
    };
  };

  const sanitizeOfficialComponent = (component, groupName = null) => ({
    component_id: cleanText(component?.id),
    component_name: cleanText(component?.name, "Unnamed component"),
    group_id: component?.group_id == null ? null : cleanText(component.group_id),
    group_name: groupName ? cleanText(groupName) : null,
    state: cleanText(component?.status, "unknown"),
    state_label: stateLabel(component?.status),
    updated_at: isoOrNull(component?.updated_at),
  });

  const sanitizeIncident = (item) => ({
    id: cleanText(item?.id),
    name: cleanText(item?.name, "Untitled incident"),
    status: cleanText(item?.status, "unknown"),
    impact: cleanText(item?.impact, "none"),
    created_at: isoOrNull(item?.created_at),
    updated_at: isoOrNull(item?.updated_at),
    resolved_at: isoOrNull(item?.resolved_at),
    scheduled_for: isoOrNull(item?.scheduled_for),
    scheduled_until: isoOrNull(item?.scheduled_until),
    components: Array.isArray(item?.components) ? item.components.map((component) => ({
      component_id: cleanText(component?.id),
      component_name: cleanText(component?.name),
    })) : [],
    latest_update: (() => {
      const update = Array.isArray(item?.incident_updates) ? item.incident_updates[0] : null;
      return update ? {
        status: cleanText(update.status),
        body: cleanText(update.body),
        created_at: isoOrNull(update.created_at),
        updated_at: isoOrNull(update.updated_at),
      } : null;
    })(),
  });

  const recordsForComponent = (records, componentId) => {
    const source = Array.isArray(records) ? records : [];
    const associationMetadataAvailable = source.some((item) => Array.isArray(item?.components));
    return {
      association_metadata_available: associationMetadataAvailable,
      association_note: associationMetadataAvailable
        ? "Only records explicitly associated by Atlassian component metadata are included."
        : "No component-specific incident association is available in the loaded data.",
      records: source.filter((item) => Array.isArray(item?.components) && item.components.some((component) => component?.id === componentId)).map(sanitizeIncident),
    };
  };

  const sanitizeOverallRange = (range, rangeKey, context = {}) => {
    if (!range || typeof range !== "object") {
      return {
        range: rangeKey,
        available: false,
        unavailable_reason: "Awaiting updated watchdog diagnostics",
        state_timeline: [],
        critical_path_availability_timeline: [],
      };
    }
    return {
      range: rangeKey,
      available: true,
      requested_start: isoOrNull(range.requested_start),
      requested_end: isoOrNull(range.requested_end),
      effective_range_start: isoOrNull(range.effective_range_start),
      effective_monitoring_start: isoOrNull(range.effective_monitoring_start),
      bucket_range_start: isoOrNull(range.bucket_range_start),
      expected_buckets: finiteOrNull(range.expected_buckets),
      observed_buckets: finiteOrNull(range.observed_buckets),
      known_buckets: finiteOrNull(range.known_buckets),
      operational_buckets: finiteOrNull(range.operational_buckets),
      degraded_buckets: finiteOrNull(range.degraded_buckets),
      partial_outage_buckets: finiteOrNull(range.partial_outage_buckets),
      major_outage_buckets: finiteOrNull(range.major_outage_buckets),
      maintenance_buckets: finiteOrNull(range.maintenance_buckets),
      unknown_buckets: finiteOrNull(range.unknown_buckets),
      operational_seconds: finiteOrNull(range.operational_seconds),
      available_seconds: finiteOrNull(range.available_seconds),
      downtime_seconds: finiteOrNull(range.downtime_seconds),
      degraded_seconds: finiteOrNull(range.degraded_seconds),
      maintenance_seconds: finiteOrNull(range.maintenance_seconds),
      unknown_seconds: finiteOrNull(range.unknown_seconds),
      before_overall_monitoring_began_seconds: finiteOrNull(range.before_overall_monitoring_began_seconds),
      watchdog_observed_availability_percent: finiteOrNull(range.watchdog_observed_availability_percent),
      observation_coverage_percent: finiteOrNull(range.observation_coverage_percent),
      timeline_resolution_seconds: finiteOrNull(range.timeline_resolution_seconds),
      state_timeline: (Array.isArray(range.state_timeline) ? range.state_timeline : []).map((item) => ({
        at: isoOrNull(item?.at),
        state: cleanText(item?.state, "unknown"),
        source_bucket_count: finiteOrNull(item?.source_bucket_count),
        observed_bucket_count: finiteOrNull(item?.observed_bucket_count),
      })).filter((item) => item.at),
      critical_path_availability_timeline: (Array.isArray(range.critical_path_availability_timeline) ? range.critical_path_availability_timeline : []).map((item) => ({
        at: isoOrNull(item?.at),
        critical_path_availability_percent: finiteOrNull(item?.critical_path_availability_percent),
        available_path_observations: finiteOrNull(item?.available_path_observations),
        unavailable_path_observations: finiteOrNull(item?.unavailable_path_observations),
        maintenance_path_observations: finiteOrNull(item?.maintenance_path_observations),
        unknown_path_observations: finiteOrNull(item?.unknown_path_observations),
        source_bucket_count: finiteOrNull(item?.source_bucket_count),
      })).filter((item) => item.at),
      trailing_offline: trailingOfflineSpan([
        ...(Array.isArray(range.state_timeline) ? range.state_timeline : []).map((item) => item?.at),
        ...(Array.isArray(range.critical_path_availability_timeline) ? range.critical_path_availability_timeline : []).map((item) => item?.at),
      ], context.stale, context.displayEnd),
      calculated_as_of: context.stale ? isoOrNull(context.snapshotTime) : null,
    };
  };

  const sanitizeOverall = (diagnostics, rangeKey, included, context = {}) => {
    if (!included) return { included: false };
    const overall = diagnostics?.overall_availability;
    if (!overall || overall.contract_version !== "overall-availability-v1") {
      return {
        included: true,
        available: false,
        unavailable_reason: "Awaiting updated watchdog diagnostics",
        contract_version: overall?.contract_version ? cleanText(overall.contract_version) : null,
        selected_range: sanitizeOverallRange(null, rangeKey, context),
      };
    }
    const current = overall.current || {};
    return {
      included: true,
      available: true,
      contract_version: cleanText(overall.contract_version),
      source: cleanText(overall.source),
      official_status_source: cleanText(overall.official_status_source),
      bucket_size_seconds: finiteOrNull(overall.bucket_size_seconds),
      generated_at: isoOrNull(overall.generated_at),
      effective_monitoring_start: isoOrNull(overall.effective_monitoring_start),
      supported_ranges: (Array.isArray(overall.supported_ranges) ? overall.supported_ranges : []).filter((key) => RANGE_ORDER.includes(key)),
      critical_components: (Array.isArray(overall.critical_components) ? overall.critical_components : []).map((item) => ({
        component_key: cleanText(item?.component_key),
        component_id: cleanText(item?.component_id),
        component_name: cleanText(item?.display_name),
        role: cleanText(item?.role),
      })),
      current: {
        watchdog_overall_state: cleanText(current.watchdog_overall_state, "unknown"),
        state_label: cleanText(current.state_label, stateLabel(current.watchdog_overall_state)),
        critical_path_availability_percent: finiteOrNull(current.critical_path_availability_percent),
        available_path_count: finiteOrNull(current.available_path_count),
        unavailable_path_count: finiteOrNull(current.unavailable_path_count),
        maintenance_path_count: finiteOrNull(current.maintenance_path_count),
        unknown_path_count: finiteOrNull(current.unknown_path_count),
        total_eligible_path_count: finiteOrNull(current.total_eligible_path_count),
        critical_component_count: finiteOrNull(current.critical_component_count),
        observed_at: isoOrNull(current.observed_at),
        derived_at: isoOrNull(current.derived_at),
        bucket_at: isoOrNull(current.bucket_at),
        observation_freshness: current.observation_freshness ? {
          state: cleanText(current.observation_freshness.state),
          age_seconds: finiteOrNull(current.observation_freshness.age_seconds),
          max_age_seconds: finiteOrNull(current.observation_freshness.max_age_seconds),
        } : null,
        available_now: !context.stale,
      },
      selected_range: sanitizeOverallRange(overall.ranges?.[rangeKey], rangeKey, context),
    };
  };

  const buildStatusReportModel = (snapshot, options = {}) => {
    const generatedAt = isoOrNull(options.generatedAt) || new Date().toISOString();
    const scopeType = options.scopeType === "component" ? "component" : "full";
    const rangeKey = RANGE_ORDER.includes(options.range) ? options.range : "24h";
    const sections = new Set(Array.isArray(options.sections) && options.sections.length
      ? options.sections
      : ["overall", "metrics", "components", "incidents", "maintenance"]);
    const data = snapshot?.data && typeof snapshot.data === "object" ? snapshot.data : null;
    const diagnostics = snapshot?.diagnostics && typeof snapshot.diagnostics === "object" ? snapshot.diagnostics : null;
    const diagnosticsStale = Boolean(snapshot?.diagnosticsStale && diagnostics);
    const snapshotTime = isoOrNull(snapshot?.diagnosticsGeneratedAt || diagnostics?.generated_at);
    const historyContext = { stale: diagnosticsStale, snapshotTime, displayEnd: generatedAt };
    const sourceComponents = Array.isArray(data?.components) ? data.components : [];
    const groupNames = new Map(sourceComponents.filter((item) => item?.group && item?.id).map((item) => [item.id, item.name || "Component group"]));
    const officialComponents = sourceComponents.filter((item) => !item?.group);
    const diagnosticsById = new Map(Object.values(diagnostics?.components || {}).filter((item) => item?.component_id).map((item) => [item.component_id, item]));
    const componentId = scopeType === "component" ? cleanText(options.componentId) : null;
    const selectedOfficial = scopeType === "component" ? officialComponents.find((item) => item?.id === componentId) || null : null;
    const selectedDiagnostic = scopeType === "component" ? diagnosticsById.get(componentId) || null : null;
    const componentName = cleanText(options.componentName || selectedOfficial?.name || selectedDiagnostic?.display_name, "Component");
    const includeComponents = scopeType === "component" || sections.has("components");
    const selectedComponents = scopeType === "component"
      ? [{ official: selectedOfficial, diagnostic: selectedDiagnostic }]
      : includeComponents
        ? officialComponents.length
          ? officialComponents.map((official) => ({ official, diagnostic: diagnosticsById.get(official.id) || null }))
          : [...diagnosticsById.values()].map((diagnostic) => ({ official: null, diagnostic }))
        : [];
    const allIncidents = Array.isArray(data?.incidents) ? data.incidents : [];
    const allMaintenance = Array.isArray(data?.scheduled_maintenances) ? data.scheduled_maintenances : [];
    const incidentAssociation = scopeType === "component" ? recordsForComponent(allIncidents, componentId) : null;
    const maintenanceAssociation = scopeType === "component" ? recordsForComponent(allMaintenance, componentId) : null;
    const overallRange = diagnostics?.overall_availability?.ranges?.[rangeKey];
    const requestedEnd = isoOrNull(overallRange?.requested_end) || generatedAt;
    const requestedStart = isoOrNull(overallRange?.requested_start) || new Date(Date.parse(requestedEnd) - RANGE_SECONDS[rangeKey] * 1000).toISOString();
    const components = selectedComponents.map(({ official, diagnostic }) => {
      const officialModel = official ? sanitizeOfficialComponent(official, groupNames.get(official.group_id)) : {
        component_id: componentId || cleanText(diagnostic?.component_id),
        component_name: cleanText(diagnostic?.display_name, componentName),
        group_id: null,
        group_name: diagnostic?.group_key ? cleanText(diagnostic.group_key) : null,
        state: null,
        state_label: "Official source unavailable",
        updated_at: null,
      };
      return {
        component_id: officialModel.component_id || cleanText(diagnostic?.component_id),
        component_name: officialModel.component_name || cleanText(diagnostic?.display_name, componentName),
        group_id: officialModel.group_id,
        group_name: officialModel.group_name || cleanText(diagnostic?.group_key, "Ungrouped"),
        description: cleanText(diagnostic?.description),
        official: {
          available: Boolean(official),
          source: "atlassian_statuspage",
          state: officialModel.state,
          state_label: officialModel.state_label,
          updated_at: officialModel.updated_at,
        },
        direct: sanitizeDiagnostic(diagnostic, rangeKey, historyContext),
        incidents: scopeType === "component" ? incidentAssociation.records : [],
        scheduled_maintenance: scopeType === "component" ? maintenanceAssociation.records : [],
        association: scopeType === "component" ? {
          incidents: { available: incidentAssociation.association_metadata_available, note: incidentAssociation.association_note },
          scheduled_maintenance: { available: maintenanceAssociation.association_metadata_available, note: maintenanceAssociation.association_note },
        } : null,
      };
    });
    const coreMetric = diagnostics?.metrics?.core_api_response_time;
    const studioMetric = diagnostics?.metrics?.studio_room_readiness;
    const officialTimestamp = data?.page?.updated_at || officialComponents.map((item) => item?.updated_at).filter(Boolean).sort().at(-1) || null;
    const overallIncluded = scopeType === "full" && sections.has("overall");
    const report = {
      schema: REPORT_SCHEMA,
      generated_at: generatedAt,
      scope: scopeType === "component"
        ? { type: "component", component_id: componentId, component_name: componentName }
        : { type: "full", page: "streamsuites-status" },
      time_window: {
        range: rangeKey,
        requested_start: requestedStart,
        requested_end: requestedEnd,
        display_end: generatedAt,
        historical_through: snapshotTime,
        effective_start: isoOrNull(overallRange?.effective_range_start),
        monitoring_start: isoOrNull(overallRange?.effective_monitoring_start || diagnostics?.overall_availability?.effective_monitoring_start),
      },
      overall: sanitizeOverall(diagnostics, rangeKey, overallIncluded, historyContext),
      official_status: {
        source: "atlassian_statuspage",
        page_id: STATUSPAGE_PAGE_ID,
        available: Boolean(data),
        current: data ? {
          indicator: cleanText(data.status?.indicator, "unknown"),
          description: cleanText(data.status?.description, "Status unavailable"),
        } : { indicator: null, description: "Official source unavailable" },
        page: data?.page ? {
          id: cleanText(data.page.id, STATUSPAGE_PAGE_ID),
          name: cleanText(data.page.name, "StreamSuites"),
          url: cleanText(data.page.url),
          updated_at: isoOrNull(data.page.updated_at),
        } : null,
        components: scopeType === "component"
          ? components.map((item) => ({ component_id: item.component_id, component_name: item.component_name, ...item.official }))
          : officialComponents.map((item) => sanitizeOfficialComponent(item, groupNames.get(item.group_id))),
        updated_at: isoOrNull(officialTimestamp),
        stale: Boolean(snapshot?.stale),
      },
      watchdog_diagnostics: {
        source: "streamsuites-independent-watchdog",
        available: Boolean(diagnostics),
        schema_version: diagnostics ? cleanText(diagnostics.schema_version) : null,
        generated_at: isoOrNull(diagnostics?.generated_at),
        last_successful_projection_at: snapshotTime,
        freshness: diagnostics?.freshness ? {
          state: cleanText(diagnostics.freshness.state),
          age_seconds: finiteOrNull(diagnostics.freshness.age_seconds),
          max_age_seconds: finiteOrNull(diagnostics.freshness.max_age_seconds),
        } : null,
        fresh: Boolean(diagnostics && !diagnosticsStale),
        stale: diagnosticsStale,
        current_direct_observation_available: Boolean(diagnostics && !diagnosticsStale),
        coverage: diagnostics?.coverage ? {
          implemented: finiteOrNull(diagnostics.coverage.implemented),
          deferred_manual: finiteOrNull(diagnostics.coverage.deferred_manual),
          vendor_managed: finiteOrNull(diagnostics.coverage.vendor_managed),
          total: finiteOrNull(diagnostics.coverage.total),
        } : null,
      },
      metrics: scopeType === "full" && sections.has("metrics") ? {
        core_api_response_time: {
          metric_id: cleanText(coreMetric?.metric_id),
          state: cleanText(coreMetric?.state, "unavailable"),
          value_ms: finiteOrNull(coreMetric?.value_ms),
          last_checked: isoOrNull(coreMetric?.last_checked),
          last_measured_at: isoOrNull(coreMetric?.last_checked),
          current_measurement_available: Boolean(diagnostics && !diagnosticsStale && coreMetric?.value_ms != null),
          freshness: diagnosticsStale ? "stale_watchdog_offline" : diagnostics ? "current_projection" : "unavailable",
          selected_range: sanitizeComponentHistory({ history: coreMetric?.history }, rangeKey, historyContext),
        },
        studio_room_readiness: {
          metric_id: cleanText(studioMetric?.metric_id),
          state: cleanText(studioMetric?.state, "deferred"),
          value: null,
          reason: cleanText(studioMetric?.reason, "No genuine Studio room and RealtimeKit readiness transaction exists; homepage latency is not a substitute."),
        },
      } : {},
      components,
      incidents: scopeType === "component"
        ? incidentAssociation.records
        : sections.has("incidents") ? allIncidents.map(sanitizeIncident) : [],
      scheduled_maintenance: scopeType === "component"
        ? maintenanceAssociation.records
        : sections.has("maintenance") ? allMaintenance.map(sanitizeIncident) : [],
      provenance: {
        report_schema: REPORT_SCHEMA,
        generated_by: "StreamSuites Status Center",
        generated_at: generatedAt,
        selected_range: rangeKey,
        statuspage_page_id: STATUSPAGE_PAGE_ID,
        official_source: "Atlassian Statuspage",
        official_data_available: Boolean(data),
        official_data_timestamp: isoOrNull(officialTimestamp),
        official_data_freshness: snapshot?.stale ? "stale" : data ? "current_loaded_response" : "unavailable",
        diagnostics_source: "StreamSuites Status Watchdog",
        diagnostics_available: Boolean(diagnostics),
        diagnostics_schema: diagnostics ? cleanText(diagnostics.schema_version) : null,
        diagnostics_timestamp: isoOrNull(diagnostics?.generated_at),
        diagnostics_freshness: diagnosticsStale ? "stale_watchdog_offline" : diagnostics?.freshness ? cleanText(diagnostics.freshness.state) : "unavailable",
        overall_availability_contract: diagnostics?.overall_availability?.contract_version ? cleanText(diagnostics.overall_availability.contract_version) : null,
      },
    };
    return report;
  };

  const scanReportSafety = (value, path = "report") => {
    const violations = [];
    const visit = (item, itemPath) => {
      if (Array.isArray(item)) {
        item.forEach((entry, index) => visit(entry, `${itemPath}[${index}]`));
        return;
      }
      if (item && typeof item === "object") {
        Object.entries(item).forEach(([key, entry]) => {
          if (FORBIDDEN_KEY.test(key)) violations.push(`${itemPath}.${key}`);
          visit(entry, `${itemPath}.${key}`);
        });
        return;
      }
      if (typeof item === "string" && FORBIDDEN_STRING.test(item)) violations.push(itemPath);
    };
    visit(value, path);
    return violations;
  };

  const buildFilename = (model, extension, pageNumber = null, pageCount = 1) => {
    const date = String(model.generated_at || new Date().toISOString()).slice(0, 10);
    const scope = model.scope.type === "component" ? `-${slugify(model.scope.component_name)}` : "";
    const page = pageCount > 1 ? `-page-${String(pageNumber || 1).padStart(2, "0")}` : "";
    return `streamsuites-status${scope}-${model.time_window.range}-${date}${page}.${extension}`;
  };

  window.StreamSuitesStatusReport = {
    REPORT_SCHEMA,
    RANGE_ORDER,
    PNG_LIMITS,
    buildStatusReportModel,
    buildFilename,
    scanReportSafety,
    setCurrentOverallRange(range) {
      if (RANGE_ORDER.includes(range)) state.currentOverallRange = range;
    },
    createFormatMenu: null,
  };

  const reportChartModel = (kind, payload, rangeKey) => {
    const helpers = window.StreamSuitesStatusChartHelpers;
    const chartOptions = payload?.trailing_offline ? { stale: true, now: payload.trailing_offline.to } : {};
    if (kind === "overall" && helpers?.buildOverallChartModel) {
      return helpers.buildOverallChartModel({ ranges: { [rangeKey]: payload } }, rangeKey, chartOptions);
    }
    if (kind === "component" && helpers?.buildChartModel) {
      return helpers.buildChartModel(payload?.buckets || [], rangeKey, chartOptions);
    }
    return null;
  };

  const buildStaticSvgChart = ({ title, kind, payload, rangeKey }) => {
    const model = reportChartModel(kind, payload, rangeKey);
    if (!model) return "";
    const width = 760;
    const height = 270;
    const left = 58;
    const right = 742;
    const top = 34;
    const bottom = 176;
    const stateY = 202;
    const stateHeight = 18;
    const lines = [];
    const labels = [];
    const shapes = [];
    const rail = [];
    const offline = [];
    const xTickCount = model.rangeMeta?.tickCount || 5;
    const duration = Math.max(1, model.endTime - model.startTime);
    for (let index = 0; index < xTickCount; index += 1) {
      const ratio = index / Math.max(1, xTickCount - 1);
      const x = left + ratio * (right - left);
      lines.push(`<line x1="${x}" x2="${x}" y1="${top}" y2="${stateY + stateHeight}"/>`);
      const tickTime = model.startTime + ratio * duration;
      const label = rangeKey === "5h" || rangeKey === "24h"
        ? new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(tickTime)
        : new Intl.DateTimeFormat(undefined, rangeKey === "7d" ? { weekday: "short", day: "numeric" } : { month: "short", day: "numeric" }).format(tickTime);
      labels.push(`<text x="${x}" y="258" text-anchor="${index === 0 ? "start" : index === xTickCount - 1 ? "end" : "middle"}">${escapeHtml(label)}</text>`);
    }
    if (kind === "overall") {
      const yFor = (value) => bottom - (Math.max(0, Math.min(100, Number(value))) / 100) * (bottom - top);
      [100, 75, 50, 25, 0].forEach((value) => {
        const y = yFor(value);
        lines.push(`<line x1="${left}" x2="${right}" y1="${y}" y2="${y}"/>`);
        labels.push(`<text x="${left - 9}" y="${y + 3}" text-anchor="end">${value}%</text>`);
      });
      model.segments.forEach((segment) => {
        if (segment.length < 2) return;
        const path = window.StreamSuitesStatusChartHelpers.stepChartPath(segment, yFor);
        shapes.push(`<path class="report-chart-area" d="${path} L${segment.at(-1).x.toFixed(2)} ${bottom} L${segment[0].x.toFixed(2)} ${bottom} Z"/>`);
        shapes.push(`<path class="report-chart-line" d="${path}"/>`);
      });
      model.stateObservations.forEach((item) => {
        const color = STATE_COLORS[stateKey(item.state)] || STATE_COLORS.unknown;
        rail.push(`<rect x="${Math.max(left, Math.min(right - model.stateBandWidth, item.x - model.stateBandWidth / 2))}" y="${stateY}" width="${model.stateBandWidth}" height="${stateHeight}" rx="2" fill="${color}"><title>${escapeHtml(`${formatDate(item.at)} · ${stateLabel(item.state)}`)}</title></rect>`);
      });
    } else {
      if (!model.observations.length) return "";
      const yFor = (value) => bottom - ((value - model.domainMin) / Math.max(1, model.domainMax - model.domainMin)) * (bottom - top);
      if (model.graphType === "latency") {
        [0, 1 / 3, 2 / 3, 1].forEach((ratio) => {
          const y = top + ratio * (bottom - top);
          const value = Math.round(model.domainMax - ratio * (model.domainMax - model.domainMin));
          lines.push(`<line x1="${left}" x2="${right}" y1="${y}" y2="${y}"/>`);
          labels.push(`<text x="${left - 9}" y="${y + 3}" text-anchor="end">${value} ms</text>`);
        });
        model.segments.forEach((segment) => {
          const points = segment.map((point) => ({ ...point, y: yFor(point.latency) }));
          const path = window.StreamSuitesStatusChartHelpers.smoothChartPath(points);
          if (points.length >= 3) shapes.push(`<path class="report-chart-area" d="${path} L${points.at(-1).x.toFixed(2)} ${bottom} L${points[0].x.toFixed(2)} ${bottom} Z"/>`);
          if (points.length >= 2) shapes.push(`<path class="report-chart-line" d="${path}"/>`);
        });
        model.gaps.forEach((gap) => {
          shapes.push(`<path class="report-chart-gap" d="M${gap.from.x.toFixed(2)} ${yFor(gap.from.latency).toFixed(2)} L${gap.to.x.toFixed(2)} ${yFor(gap.to.latency).toFixed(2)}"/>`);
        });
      }
      model.observations.forEach((item) => {
        const color = STATE_COLORS[stateKey(item.state)] || STATE_COLORS.unknown;
        rail.push(`<rect x="${Math.max(left, Math.min(right - model.stateBandWidth, item.x - model.stateBandWidth / 2))}" y="${stateY}" width="${model.stateBandWidth}" height="${stateHeight}" rx="2" fill="${color}"><title>${escapeHtml(`${formatDate(item.at)} · ${stateLabel(item.state)}`)}</title></rect>`);
      });
    }
    if (!shapes.length && !rail.length) return "";
    if (model.trailingGap) {
      offline.push(`<rect class="report-chart-offline" x="${model.trailingGap.fromX}" y="${top}" width="${Math.max(1, model.trailingGap.toX - model.trailingGap.fromX)}" height="${bottom - top}"/><text class="report-chart-offline-label" x="${(model.trailingGap.fromX + model.trailingGap.toX) / 2}" y="${top + 16}" text-anchor="middle">WATCHDOG OFFLINE</text>`);
    }
    return `<svg class="report-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(title)}">
      <title>${escapeHtml(title)}</title>
      <defs><linearGradient id="report-line-${kind}" x1="0" x2="1"><stop offset="0" stop-color="#4ddaf0"/><stop offset=".58" stop-color="#62bfff"/><stop offset="1" stop-color="#aa86ff"/></linearGradient><linearGradient id="report-area-${kind}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#62bfff" stop-opacity=".28"/><stop offset="1" stop-color="#aa86ff" stop-opacity=".015"/></linearGradient></defs>
      <g class="report-chart-grid">${lines.join("")}</g>
      <g class="report-chart-labels">${labels.join("")}</g>
      <g>${offline.join("")}</g>
      <rect class="report-chart-rail" x="${left}" y="${stateY - 3}" width="${right - left}" height="${stateHeight + 6}" rx="5"/>
      <g>${rail.join("")}</g><g>${shapes.join("")}</g>
    </svg>`;
  };

  const componentStateCopy = (component) => {
    if (component.direct.coverage === "deferred") return "Automated monitoring is deferred for this component.";
    if (component.direct.coverage === "vendor_managed") return "Official state is Atlassian/provider-managed; no local history is generated.";
    if (!component.direct.available) return "Independent watchdog diagnostics are unavailable for this component.";
    if (!component.direct.selected_range.available) return "Awaiting updated watchdog diagnostics for this selected range.";
    return `${component.direct.direct_stale ? "Watchdog offline · " : ""}${component.direct.selected_range.buckets.length} plotted buckets · ${formatPercent(component.direct.selected_range.availability_percent)} watchdog-observed availability${component.direct.selected_range.calculated_as_of ? ` as of ${formatDate(component.direct.selected_range.calculated_as_of)}` : ""}.`;
  };

  const componentPrintHtml = (component, rangeKey) => {
    const history = component.direct.selected_range;
    const chart = history.available && history.buckets.length
      ? buildStaticSvgChart({ title: `${component.component_name} ${rangeKey.toUpperCase()} history`, kind: "component", payload: history, rangeKey })
      : "";
    const facts = [
      ["Official state", component.official.available ? component.official.state_label : "Official source unavailable"],
      ["Direct state", component.direct.direct_stale && component.direct.coverage === "implemented" ? "Watchdog offline" : component.direct.direct_state ? stateLabel(component.direct.direct_state) : component.direct.coverage === "deferred" ? "Deferred" : component.direct.coverage === "vendor_managed" ? "Provider managed" : "Unavailable"],
      ["Coverage", component.direct.coverage || "Unavailable"],
      ["Availability", formatPercent(history.availability_percent)],
      [component.direct.direct_stale ? "Last measured latency" : "Latest latency", component.direct.latency_ms == null ? "Unavailable" : `${component.direct.latency_ms} ms`],
      ["Last success", formatDate(component.direct.last_success)],
      ["Last failure", formatDate(component.direct.last_failure)],
      ["Observation gaps", String(history.gaps?.length || 0)],
    ].map(([label, value]) => `<div><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join("");
    return `<article class="report-component">
      <header><div><p>${escapeHtml(component.group_name || "Component")}</p><h3>${escapeHtml(component.component_name)}</h3></div><span>${escapeHtml(component.official.available ? `Official · ${component.official.state_label}` : "Official unavailable")}</span></header>
      <p class="report-component-copy">${escapeHtml(component.description || componentStateCopy(component))}</p>
      <div class="report-facts">${facts}</div>
      <p class="report-boundary">${escapeHtml(componentStateCopy(component))}</p>
      ${chart}
    </article>`;
  };

  const operationPrintHtml = (title, records, emptyCopy) => `<section class="report-print-section report-operation-section">
    <h2>${escapeHtml(title)}</h2>
    ${records.length ? records.map((item) => `<article class="report-operation"><div><h3>${escapeHtml(item.name)}</h3><span>${escapeHtml(item.status)} · ${escapeHtml(item.impact)}</span></div><time>${escapeHtml(formatDate(item.updated_at || item.scheduled_for || item.created_at))}</time><p>${escapeHtml(item.latest_update?.body || "No additional public update is available.")}</p></article>`).join("") : `<p class="report-empty">${escapeHtml(emptyCopy)}</p>`}
  </section>`;

  const buildPrintDocument = (model) => {
    const range = model.time_window.range;
    const title = model.scope.type === "component" ? `${model.scope.component_name} Status Report` : "StreamSuites Status Report";
    const overall = model.overall.included ? `<section class="report-print-section report-print-section--overall">
      <p class="report-eyebrow">Watchdog-observed critical paths</p><h2>System availability</h2>
      ${model.overall.available ? `<div class="report-summary-grid">
        <div><span>Availability</span><strong>${escapeHtml(formatPercent(model.overall.selected_range.watchdog_observed_availability_percent))}</strong></div>
        <div><span>Downtime</span><strong>${escapeHtml(formatDuration(model.overall.selected_range.downtime_seconds))}</strong></div>
        <div><span>Coverage</span><strong>${escapeHtml(formatPercent(model.overall.selected_range.observation_coverage_percent))}</strong></div>
        <div><span>Watchdog state</span><strong>${escapeHtml(model.watchdog_diagnostics.stale ? "Watchdog offline" : model.overall.current.state_label)}</strong></div>
      </div>${model.watchdog_diagnostics.stale ? `<p class="report-boundary">Watchdog diagnostics stale · historical calculations as of ${escapeHtml(formatDate(model.watchdog_diagnostics.last_successful_projection_at))}. The trailing offline span is unobserved and excluded.</p>` : ""}${buildStaticSvgChart({ title: `Overall availability ${range.toUpperCase()}`, kind: "overall", payload: model.overall.selected_range, rangeKey: range })}<p class="report-boundary">${escapeHtml(`${model.overall.contract_version} · ${model.overall.critical_components.length} Runtime-defined critical services · direct observation, not official Atlassian uptime`)}</p>` : `<p class="report-empty">Awaiting updated watchdog diagnostics. No overall series was synthesized.</p>`}
    </section>` : "";
    const metrics = Object.keys(model.metrics).length ? `<section class="report-print-section"><h2>Custom metrics</h2><div class="report-summary-grid report-summary-grid--two"><div><span>${model.watchdog_diagnostics.stale ? "Core API response time · last measured" : "Core API response time"}</span><strong>${model.metrics.core_api_response_time.value_ms == null ? "Awaiting measured data" : `${model.metrics.core_api_response_time.value_ms} ms`}</strong><small>${escapeHtml(model.watchdog_diagnostics.stale ? `Watchdog offline · ${formatDate(model.metrics.core_api_response_time.last_measured_at)}` : model.metrics.core_api_response_time.state)}</small></div><div><span>Studio Room Readiness</span><strong>Deferred</strong><small>${escapeHtml(model.metrics.studio_room_readiness.reason)}</small></div></div>${model.metrics.core_api_response_time.selected_range.buckets.length ? buildStaticSvgChart({ title: `Core API response time ${range.toUpperCase()}`, kind: "component", payload: model.metrics.core_api_response_time.selected_range, rangeKey: range }) : ""}</section>` : "";
    const groups = new Map();
    model.components.forEach((component) => {
      const group = component.group_name || "Components";
      if (!groups.has(group)) groups.set(group, []);
      groups.get(group).push(component);
    });
    const components = [...groups.entries()].map(([group, items]) => `<section class="report-print-section report-component-group"><h2>${escapeHtml(group)}</h2>${items.map((component) => componentPrintHtml(component, range)).join("")}</section>`).join("");
    const provenance = `<section class="report-provenance"><h2>Source provenance</h2><p>Official service state and incidents: Atlassian Statuspage</p><p>Independent observations: StreamSuites Status Watchdog</p><p>Generated by StreamSuites Status Center · ${escapeHtml(formatDate(model.generated_at))} · ${escapeHtml(range.toUpperCase())}</p><dl><div><dt>Statuspage page ID</dt><dd>${STATUSPAGE_PAGE_ID}</dd></div><div><dt>Diagnostics schema</dt><dd>${escapeHtml(model.provenance.diagnostics_schema || "Unavailable")}</dd></div><div><dt>Overall contract</dt><dd>${escapeHtml(model.provenance.overall_availability_contract || "Unavailable")}</dd></div><div><dt>Report schema</dt><dd>${REPORT_SCHEMA}</dd></div></dl></section>`;
    return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="color-scheme" content="dark"><title>${escapeHtml(buildFilename(model, "pdf").replace(/\.pdf$/, ""))}</title><style>
      @font-face{font-family:Tektur;src:url('/assets/fonts/Tektur-VariableFont_wdth,wght.ttf')}@font-face{font-family:Geist Sans;src:url('/assets/fonts/Geist-Regular.ttf')}@font-face{font-family:IBM Plex Mono;src:url('/assets/fonts/GeistMono-VariableFont_wght.ttf')}
      @page{size:A4;margin:12mm}*{box-sizing:border-box}html{color-scheme:dark;background:#03070b}body{margin:0;color:#f4f8fb;background:#03070b;font:10pt/1.5 'Geist Sans',sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}.report-page{max-width:190mm;margin:0 auto}.report-cover{min-height:245mm;display:grid;align-content:center;padding:18mm;border:1px solid #263849;border-radius:8mm;background:radial-gradient(circle at 95% 0,#211c43 0,transparent 38%),linear-gradient(145deg,#09131d,#03070b);break-after:page}.report-brand{display:flex;align-items:center;gap:5mm;margin-bottom:22mm}.report-brand img:first-child{width:13mm;height:13mm;border-radius:3mm}.report-brand img:last-child{width:auto;height:8mm}.report-eyebrow,.report-cover p,.report-component header p,.report-facts span,.report-summary-grid span,dt{color:#8ea4b5;font:7.5pt 'IBM Plex Mono',monospace;letter-spacing:.08em;text-transform:uppercase}.report-cover h1,.report-print-section h2,.report-component h3{font-family:Tektur,sans-serif}.report-cover h1{max-width:150mm;margin:0;font-size:34pt;line-height:1;letter-spacing:-.04em}.report-cover .report-lede{max-width:138mm;margin:8mm 0 0;color:#b9c6d1;font:12pt/1.6 'Geist Sans',sans-serif;text-transform:none;letter-spacing:0}.report-cover-grid,.report-summary-grid,.report-facts{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1px;margin-top:14mm;border:1px solid #263849;border-radius:4mm;overflow:hidden;background:#263849}.report-cover-grid>div,.report-summary-grid>div,.report-facts>div{display:grid;gap:2mm;padding:5mm;background:#071019}.report-cover-grid strong,.report-summary-grid strong,.report-facts strong{font-size:11pt}.report-print-section{padding:11mm 0;border-bottom:1px solid #263849;break-inside:auto}.report-print-section--overall{break-before:page}.report-print-section h2{margin:0 0 7mm;font-size:23pt;letter-spacing:-.035em}.report-summary-grid{margin-top:0}.report-summary-grid--two{grid-template-columns:repeat(2,minmax(0,1fr))}.report-summary-grid small{color:#8ea4b5}.report-chart{display:block;width:100%;margin-top:7mm;border:1px solid #263849;border-radius:4mm;background:#040b12}.report-chart-grid line{stroke:#203142;stroke-width:.7}.report-chart-labels text{fill:#8395a6;font:7px 'IBM Plex Mono',monospace}.report-chart-rail{fill:#0a131c;stroke:#253747}.report-chart-area{fill:url(#report-area-overall);stroke:none}.report-component .report-chart-area{fill:url(#report-area-component)}.report-chart-line{fill:none;stroke:url(#report-line-overall);stroke-width:2}.report-component .report-chart-line{stroke:url(#report-line-component)}.report-chart-gap{fill:none;stroke:#8191a3;stroke-width:1;stroke-dasharray:5 5}.report-chart-offline{fill:#8091a5;fill-opacity:.13;stroke:#9aa8b8;stroke-opacity:.22;stroke-width:.7}.report-chart-offline-label{fill:#b8c4cf;font:7px 'IBM Plex Mono',monospace;letter-spacing:.08em}.report-component-group{break-before:page}.report-component{margin:0 0 7mm;padding:6mm;border:1px solid #263849;border-radius:4mm;background:#071019;break-inside:avoid}.report-component header{display:flex;justify-content:space-between;gap:6mm}.report-component h3{margin:1mm 0 0;font-size:16pt}.report-component header span{color:#a7c7db;font:8pt 'IBM Plex Mono',monospace}.report-component-copy,.report-boundary,.report-empty{color:#9fb0bd}.report-facts{grid-template-columns:repeat(4,minmax(0,1fr));margin-top:5mm}.report-facts>div{padding:3.5mm}.report-facts strong{font-size:8.5pt}.report-boundary{padding-left:4mm;border-left:1mm solid #58b7ff}.report-operation{display:grid;grid-template-columns:1fr auto;gap:2mm 8mm;padding:5mm 0;border-bottom:1px solid #263849;break-inside:avoid}.report-operation h3{margin:0}.report-operation span,.report-operation time{color:#8ea4b5;font:7.5pt 'IBM Plex Mono',monospace}.report-operation p{grid-column:1/-1;margin:1mm 0 0;color:#afbcc6}.report-provenance{padding:10mm 0;color:#a9b8c4;break-before:page}.report-provenance h2{font:20pt Tektur,sans-serif}.report-provenance p{margin:2mm 0}.report-provenance dl{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:3mm;margin-top:6mm}.report-provenance dl div{padding:4mm;border:1px solid #263849}.report-provenance dd{margin:2mm 0 0;overflow-wrap:anywhere}@media print{html,body{background:#03070b}.report-page{max-width:none}}
    </style></head><body><main class="report-page"><section class="report-cover"><div class="report-brand"><img src="/assets/logos/ssmainlogosq.webp" alt=""><img src="/assets/logos/wmnew.webp" alt="StreamSuites"></div><p class="report-eyebrow">Operational status report</p><h1>${escapeHtml(title)}</h1><p class="report-lede">Official Atlassian state and independent watchdog observations remain separate throughout this ${escapeHtml(range.toUpperCase())} report.</p><div class="report-cover-grid"><div><span>Range</span><strong>${escapeHtml(range.toUpperCase())}</strong></div><div><span>Official state</span><strong>${escapeHtml(model.official_status.current.description)}</strong></div><div><span>Official source</span><strong>${model.official_status.available ? "Loaded" : "Unavailable"}</strong></div><div><span>Diagnostics</span><strong>${model.watchdog_diagnostics.available ? model.watchdog_diagnostics.stale ? "Stale" : "Loaded" : "Unavailable"}</strong></div></div></section>${overall}${metrics}${components}${operationPrintHtml("Incidents", model.incidents, "No incidents are present in the loaded report context.")}${operationPrintHtml("Scheduled maintenance", model.scheduled_maintenance, "No maintenance is present in the loaded report context.")}${provenance}</main></body></html>`;
  };

  const loadCanvasImage = (src) => new Promise((resolve) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });

  const canvasBlob = (canvas) => new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("The browser could not encode the PNG report.")), "image/png");
  });

  const wrapCanvasText = (context, text, maxWidth) => {
    const words = String(text || "").split(/\s+/).filter(Boolean);
    const lines = [];
    let line = "";
    words.forEach((word) => {
      const candidate = line ? `${line} ${word}` : word;
      if (line && context.measureText(candidate).width > maxWidth) {
        lines.push(line);
        line = word;
      } else line = candidate;
    });
    if (line) lines.push(line);
    return lines.length ? lines : [""];
  };

  const drawWrappedCanvasText = (context, text, x, y, maxWidth, lineHeight, maxLines = Infinity) => {
    const lines = wrapCanvasText(context, text, maxWidth).slice(0, maxLines);
    lines.forEach((line, index) => {
      const finalLine = index === maxLines - 1 && wrapCanvasText(context, text, maxWidth).length > maxLines ? `${line.replace(/[.,;:]?$/, "")}…` : line;
      context.fillText(finalLine, x, y + index * lineHeight);
    });
    return lines.length * lineHeight;
  };

  const roundedRectPath = (context, x, y, width, height, radius) => {
    const r = Math.min(radius, width / 2, height / 2);
    context.beginPath();
    context.moveTo(x + r, y);
    context.arcTo(x + width, y, x + width, y + height, r);
    context.arcTo(x + width, y + height, x, y + height, r);
    context.arcTo(x, y + height, x, y, r);
    context.arcTo(x, y, x + width, y, r);
    context.closePath();
  };

  const drawCanvasChart = (context, { x, y, width, height, kind, payload, rangeKey }) => {
    const model = reportChartModel(kind, payload, rangeKey);
    if (!model) return false;
    const left = x + 54;
    const right = x + width - 18;
    const top = y + 22;
    const bottom = y + height - 54;
    const railY = y + height - 28;
    const railHeight = 10;
    context.save();
    roundedRectPath(context, x, y, width, height, 14);
    context.fillStyle = "#040b12";
    context.fill();
    context.strokeStyle = "#263849";
    context.lineWidth = 1;
    context.stroke();
    context.font = '16px "IBM Plex Mono", monospace';
    context.fillStyle = "#718399";
    context.textAlign = "right";
    context.textBaseline = "middle";
    const gradient = context.createLinearGradient(left, 0, right, 0);
    gradient.addColorStop(0, "#4ddaf0");
    gradient.addColorStop(.58, "#62bfff");
    gradient.addColorStop(1, "#aa86ff");
    const scaleChartX = (chartX) => left + ((chartX - 58) / (742 - 58)) * (right - left);
    if (model.trailingGap) {
      const offlineFrom = scaleChartX(model.trailingGap.fromX);
      const offlineTo = scaleChartX(model.trailingGap.toX);
      context.fillStyle = "rgba(128,145,165,.13)";
      context.fillRect(offlineFrom, top, Math.max(1, offlineTo - offlineFrom), bottom - top);
      if (offlineTo - offlineFrom >= 110) {
        context.fillStyle = "#b8c4cf";
        context.font = '11px "IBM Plex Mono", monospace';
        context.textAlign = "center";
        context.textBaseline = "top";
        context.fillText("WATCHDOG OFFLINE", (offlineFrom + offlineTo) / 2, top + 8);
        context.textAlign = "right";
        context.textBaseline = "middle";
      }
    }
    if (kind === "overall") {
      const yFor = (value) => bottom - Math.max(0, Math.min(100, Number(value))) / 100 * (bottom - top);
      [100, 75, 50, 25, 0].forEach((value) => {
        const lineY = yFor(value);
        context.strokeStyle = "rgba(126,168,210,.15)";
        context.beginPath();
        context.moveTo(left, lineY);
        context.lineTo(right, lineY);
        context.stroke();
        context.fillText(`${value}%`, left - 9, lineY);
      });
      model.segments.forEach((segment) => {
        if (segment.length < 2) return;
        const area = context.createLinearGradient(0, top, 0, bottom);
        area.addColorStop(0, "rgba(98,191,255,.28)");
        area.addColorStop(1, "rgba(170,134,255,.02)");
        const scaleX = (point) => left + ((point.x - 58) / (742 - 58)) * (right - left);
        context.beginPath();
        context.moveTo(scaleX(segment[0]), yFor(segment[0].value));
        segment.slice(1).forEach((point) => {
          context.lineTo(scaleX(point), yFor(segment[segment.indexOf(point) - 1].value));
          context.lineTo(scaleX(point), yFor(point.value));
        });
        context.lineTo(scaleX(segment.at(-1)), bottom);
        context.lineTo(scaleX(segment[0]), bottom);
        context.closePath();
        context.fillStyle = area;
        context.fill();
        context.beginPath();
        context.moveTo(scaleX(segment[0]), yFor(segment[0].value));
        segment.slice(1).forEach((point, index) => {
          context.lineTo(scaleX(point), yFor(segment[index].value));
          context.lineTo(scaleX(point), yFor(point.value));
        });
        context.strokeStyle = gradient;
        context.lineWidth = 4;
        context.lineJoin = "round";
        context.stroke();
      });
      model.stateObservations.forEach((item) => {
        const center = left + ((item.x - 58) / (742 - 58)) * (right - left);
        const barWidth = Math.max(3, ((model.stateBandWidth || 3) / (742 - 58)) * (right - left));
        context.fillStyle = STATE_COLORS[stateKey(item.state)] || STATE_COLORS.unknown;
        context.fillRect(Math.max(left, Math.min(right - barWidth, center - barWidth / 2)), railY, barWidth, railHeight);
      });
    } else {
      if (!model.observations?.length) {
        context.restore();
        return false;
      }
      const scaleX = (point) => left + ((point.x - 58) / (742 - 58)) * (right - left);
      if (model.graphType === "latency") {
        const yFor = (value) => bottom - ((value - model.domainMin) / Math.max(1, model.domainMax - model.domainMin)) * (bottom - top);
        [0, 1 / 3, 2 / 3, 1].forEach((ratio) => {
          const lineY = top + ratio * (bottom - top);
          context.strokeStyle = "rgba(126,168,210,.15)";
          context.beginPath();
          context.moveTo(left, lineY);
          context.lineTo(right, lineY);
          context.stroke();
          context.fillText(`${Math.round(model.domainMax - ratio * (model.domainMax - model.domainMin))} ms`, left - 9, lineY);
        });
        model.segments.forEach((segment) => {
          if (segment.length < 2) return;
          context.beginPath();
          context.moveTo(scaleX(segment[0]), yFor(segment[0].latency));
          segment.slice(1).forEach((point) => context.lineTo(scaleX(point), yFor(point.latency)));
          context.strokeStyle = gradient;
          context.lineWidth = 4;
          context.lineJoin = "round";
          context.stroke();
        });
        model.gaps.forEach((gap) => {
          context.save();
          context.setLineDash([8, 8]);
          context.strokeStyle = "#8091a5";
          context.lineWidth = 2;
          context.beginPath();
          context.moveTo(scaleX(gap.from), yFor(gap.from.latency));
          context.lineTo(scaleX(gap.to), yFor(gap.to.latency));
          context.stroke();
          context.restore();
        });
      }
      model.observations.forEach((item) => {
        const center = scaleX(item);
        const barWidth = Math.max(3, ((model.stateBandWidth || 3) / (742 - 58)) * (right - left));
        context.fillStyle = STATE_COLORS[stateKey(item.state)] || STATE_COLORS.unknown;
        context.fillRect(Math.max(left, Math.min(right - barWidth, center - barWidth / 2)), railY, barWidth, railHeight);
      });
    }
    context.strokeStyle = "#263849";
    context.strokeRect(left, railY - 2, right - left, railHeight + 4);
    context.restore();
    return true;
  };

  class CanvasReportWriter {
    constructor(model, assets) {
      this.model = model;
      this.assets = assets;
      this.pages = [];
      this.canvas = null;
      this.context = null;
      this.y = 0;
      this.newPage();
    }

    newPage() {
      const canvas = document.createElement("canvas");
      canvas.width = PNG_LIMITS.width;
      canvas.height = PNG_LIMITS.pageHeight;
      const context = canvas.getContext("2d", { alpha: false });
      if (!context) throw new Error("Canvas rendering is unavailable in this browser.");
      const background = context.createLinearGradient(0, 0, 0, canvas.height);
      background.addColorStop(0, "#071019");
      background.addColorStop(.55, "#03080d");
      background.addColorStop(1, "#020509");
      context.fillStyle = background;
      context.fillRect(0, 0, canvas.width, canvas.height);
      const glow = context.createRadialGradient(1420, 0, 0, 1420, 0, 650);
      glow.addColorStop(0, "rgba(121,91,238,.18)");
      glow.addColorStop(1, "rgba(121,91,238,0)");
      context.fillStyle = glow;
      context.fillRect(0, 0, canvas.width, 760);
      this.pages.push(canvas);
      this.canvas = canvas;
      this.context = context;
      this.y = 86;
      this.drawPageHeader();
    }

    drawPageHeader() {
      const context = this.context;
      if (this.assets.mark) context.drawImage(this.assets.mark, 78, 58, 52, 52);
      if (this.assets.wordmark) context.drawImage(this.assets.wordmark, 148, 68, Math.min(250, this.assets.wordmark.width * (34 / this.assets.wordmark.height)), 34);
      else {
        context.fillStyle = "#f5f8fb";
        context.font = '600 29px "Tektur", sans-serif';
        context.fillText("StreamSuites", 148, 97);
      }
      context.fillStyle = "#7f95a7";
      context.font = '16px "IBM Plex Mono", monospace';
      context.textAlign = "right";
      context.fillText(`${this.model.time_window.range.toUpperCase()} · ${String(this.model.generated_at).slice(0, 10)}`, 1522, 90);
      context.strokeStyle = "rgba(151,183,219,.18)";
      context.beginPath();
      context.moveTo(78, 132);
      context.lineTo(1522, 132);
      context.stroke();
      context.textAlign = "left";
      this.y = 178;
    }

    ensure(height) {
      if (this.y + height <= PNG_LIMITS.pageHeight - 120) return;
      this.newPage();
    }

    heading(kicker, title, copy = "") {
      this.ensure(copy ? 170 : 125);
      const context = this.context;
      context.fillStyle = "#79c9f5";
      context.font = '16px "IBM Plex Mono", monospace';
      context.fillText(String(kicker || "").toUpperCase(), 78, this.y);
      this.y += 37;
      context.fillStyle = "#f5f8fb";
      context.font = '600 52px "Tektur", sans-serif';
      context.fillText(title, 78, this.y);
      this.y += 25;
      if (copy) {
        context.fillStyle = "#95a6b4";
        context.font = '22px "Geist Sans", sans-serif';
        this.y += drawWrappedCanvasText(context, copy, 78, this.y + 24, 1230, 31, 3) + 24;
      }
      this.y += 26;
    }

    factGrid(facts, columns = 4) {
      const gap = 10;
      const width = (1444 - gap * (columns - 1)) / columns;
      const rows = Math.ceil(facts.length / columns);
      const rowHeight = 116;
      this.ensure(rows * (rowHeight + gap) + 18);
      facts.forEach(([label, value, accent], index) => {
        const column = index % columns;
        const row = Math.floor(index / columns);
        const x = 78 + column * (width + gap);
        const y = this.y + row * (rowHeight + gap);
        roundedRectPath(this.context, x, y, width, rowHeight, 12);
        this.context.fillStyle = "rgba(7,16,25,.92)";
        this.context.fill();
        this.context.strokeStyle = "rgba(151,183,219,.17)";
        this.context.stroke();
        this.context.fillStyle = "#8195a6";
        this.context.font = '14px "IBM Plex Mono", monospace';
        this.context.fillText(String(label).toUpperCase(), x + 18, y + 31);
        this.context.fillStyle = accent || "#eef5fa";
        this.context.font = '600 25px "Tektur", sans-serif';
        drawWrappedCanvasText(this.context, value, x + 18, y + 70, width - 36, 27, 2);
      });
      this.y += rows * (rowHeight + gap) + 18;
    }

    chart(kind, payload, title) {
      const height = 390;
      this.ensure(height + 24);
      this.context.fillStyle = "#a8c7db";
      this.context.font = '600 24px "Tektur", sans-serif';
      this.context.fillText(title, 78, this.y + 26);
      const drawn = drawCanvasChart(this.context, { x: 78, y: this.y + 48, width: 1444, height: 318, kind, payload, rangeKey: this.model.time_window.range });
      this.y += drawn ? height : 54;
      return drawn;
    }

    componentGroup(groupName, components) {
      const firstPair = components.slice(0, 2);
      const firstRowHeight = firstPair.length
        ? Math.max(...firstPair.map((component) => component.direct.selected_range.buckets.length ? 356 : 228))
        : 0;
      this.ensure(125 + firstRowHeight + 18);
      this.heading("Component group", groupName);
      const gap = 14;
      const cardWidth = (1444 - gap) / 2;
      for (let index = 0; index < components.length; index += 2) {
        const pair = components.slice(index, index + 2);
        const heights = pair.map((component) => component.direct.selected_range.buckets.length ? 356 : 228);
        const rowHeight = Math.max(...heights);
        this.ensure(rowHeight + 18);
        pair.forEach((component, column) => this.drawComponentCard(component, 78 + column * (cardWidth + gap), this.y, cardWidth, rowHeight));
        this.y += rowHeight + 18;
      }
    }

    drawComponentCard(component, x, y, width, height) {
      const context = this.context;
      roundedRectPath(context, x, y, width, height, 14);
      context.fillStyle = "rgba(7,16,25,.92)";
      context.fill();
      context.strokeStyle = "rgba(151,183,219,.18)";
      context.stroke();
      context.fillStyle = "#7f95a7";
      context.font = '14px "IBM Plex Mono", monospace';
      context.fillText(String(component.group_name || "COMPONENT").toUpperCase(), x + 20, y + 29);
      context.fillStyle = "#f3f8fb";
      context.font = '600 25px "Tektur", sans-serif';
      drawWrappedCanvasText(context, component.component_name, x + 20, y + 64, width - 40, 28, 2);
      context.fillStyle = STATE_COLORS[stateKey(component.official.state)] || STATE_COLORS.unknown;
      context.font = '15px "IBM Plex Mono", monospace';
      context.fillText(`OFFICIAL · ${component.official.available ? component.official.state_label.toUpperCase() : "UNAVAILABLE"}`, x + 20, y + 116);
      context.fillStyle = "#95a6b4";
      context.font = '17px "Geist Sans", sans-serif';
      drawWrappedCanvasText(context, componentStateCopy(component), x + 20, y + 150, width - 40, 23, 3);
      const history = component.direct.selected_range;
      if (history.buckets.length) drawCanvasChart(context, { x: x + 18, y: y + 216, width: width - 36, height: height - 234, kind: "component", payload: history, rangeKey: this.model.time_window.range });
    }

    operations(title, records, emptyCopy) {
      this.heading("Official communications", title);
      if (!records.length) {
        this.ensure(92);
        this.context.fillStyle = "#91a4b4";
        this.context.font = '21px "Geist Sans", sans-serif';
        this.context.fillText(emptyCopy, 78, this.y + 26);
        this.y += 76;
        return;
      }
      records.forEach((item) => {
        this.ensure(150);
        this.context.fillStyle = "#edf5fa";
        this.context.font = '600 25px "Tektur", sans-serif';
        this.context.fillText(item.name, 78, this.y + 28);
        this.context.fillStyle = "#8297a8";
        this.context.font = '15px "IBM Plex Mono", monospace';
        this.context.fillText(`${String(item.status).toUpperCase()} · ${formatDate(item.updated_at || item.scheduled_for || item.created_at)}`, 78, this.y + 58);
        this.context.fillStyle = "#a7b5c0";
        this.context.font = '18px "Geist Sans", sans-serif';
        drawWrappedCanvasText(this.context, item.latest_update?.body || "No additional public update is available.", 78, this.y + 91, 1320, 25, 2);
        this.context.strokeStyle = "rgba(151,183,219,.16)";
        this.context.beginPath();
        this.context.moveTo(78, this.y + 132);
        this.context.lineTo(1522, this.y + 132);
        this.context.stroke();
        this.y += 150;
      });
    }

    provenance() {
      this.heading("Required provenance", "Sources and freshness");
      this.factGrid([
        ["Official service state and incidents", "Atlassian Statuspage"],
        ["Independent observations", "StreamSuites Status Watchdog"],
        ["Generated by", "StreamSuites Status Center"],
        ["Report schema", REPORT_SCHEMA],
        ["Official source freshness", this.model.provenance.official_data_freshness],
        ["Diagnostics freshness", this.model.provenance.diagnostics_freshness],
        ["Diagnostics schema", this.model.provenance.diagnostics_schema || "Unavailable"],
        ["Overall contract", this.model.provenance.overall_availability_contract || "Unavailable"],
      ], 4);
    }

    finish() {
      const pageCount = this.pages.length;
      this.pages.forEach((canvas, index) => {
        const context = canvas.getContext("2d");
        context.strokeStyle = "rgba(151,183,219,.18)";
        context.beginPath();
        context.moveTo(78, PNG_LIMITS.pageHeight - 82);
        context.lineTo(1522, PNG_LIMITS.pageHeight - 82);
        context.stroke();
        context.fillStyle = "#718596";
        context.font = '14px "IBM Plex Mono", monospace';
        context.textAlign = "left";
        context.fillText(`Generated by StreamSuites Status Center · ${this.model.time_window.range.toUpperCase()} · ${formatDate(this.model.generated_at)}`, 78, PNG_LIMITS.pageHeight - 48);
        context.textAlign = "right";
        context.fillText(`PAGE ${String(index + 1).padStart(2, "0")} / ${String(pageCount).padStart(2, "0")}`, 1522, PNG_LIMITS.pageHeight - 48);
      });
      return this.pages;
    }
  }

  const renderPngReport = async (model) => {
    if (document.fonts?.ready) await document.fonts.ready;
    const [mark, wordmark] = await Promise.all([
      loadCanvasImage("/assets/logos/ssmainlogosq.webp"),
      loadCanvasImage("/assets/logos/wmnew.webp"),
    ]);
    const writer = new CanvasReportWriter(model, { mark, wordmark });
    const title = model.scope.type === "component" ? `${model.scope.component_name} status report` : "StreamSuites status report";
    writer.heading("Operational status report", title, "Official Atlassian state and independent watchdog observations remain separate throughout this report.");
    writer.factGrid([
      ["Selected range", model.time_window.range.toUpperCase(), "#8fd3ff"],
      ["Official overall state", model.official_status.current.description, model.official_status.available ? "#f3f8fb" : "#f2b84b"],
      ["Official source", model.official_status.available ? "Loaded" : "Unavailable", model.official_status.available ? "#62dea2" : "#f2b84b"],
      ["Diagnostics", model.watchdog_diagnostics.available ? model.watchdog_diagnostics.stale ? "Stale" : "Loaded" : "Unavailable", model.watchdog_diagnostics.available && !model.watchdog_diagnostics.stale ? "#62dea2" : "#f2b84b"],
    ]);
    if (model.overall.included) {
      writer.heading("Watchdog-observed critical paths", "System availability", model.watchdog_diagnostics.stale ? `Watchdog diagnostics stale. Historical calculations are frozen as of ${formatDate(model.watchdog_diagnostics.last_successful_projection_at)}; the trailing offline span is unobserved.` : "This direct-observation section consumes Runtime’s overall-availability-v1 contract and is not official Atlassian uptime.");
      if (model.overall.available) {
        writer.factGrid([
          ["Availability", formatPercent(model.overall.selected_range.watchdog_observed_availability_percent)],
          ["Observed downtime", formatDuration(model.overall.selected_range.downtime_seconds)],
          ["Observation coverage", formatPercent(model.overall.selected_range.observation_coverage_percent)],
          ["Watchdog-derived state", model.overall.current.state_label, STATE_COLORS[stateKey(model.overall.current.watchdog_overall_state)]],
        ]);
        writer.chart("overall", model.overall.selected_range, "Critical-path availability and overall state rail");
      } else {
        writer.factGrid([["Overall availability", "Awaiting updated watchdog diagnostics", "#f2b84b"]], 1);
      }
    }
    if (Object.keys(model.metrics).length) {
      writer.heading("Custom metrics", "Measured and deferred signals");
      writer.factGrid([
        [model.watchdog_diagnostics.stale ? "Core API last measured" : "Core API response time", model.metrics.core_api_response_time.value_ms == null ? "Awaiting measured data" : `${model.metrics.core_api_response_time.value_ms} ms`],
        ["Studio Room Readiness", "Deferred", "#f2b84b"],
      ], 2);
      if (model.metrics.core_api_response_time.selected_range.buckets.length) writer.chart("component", model.metrics.core_api_response_time.selected_range, "Core API response time");
    }
    const groups = new Map();
    model.components.forEach((component) => {
      const group = component.group_name || "Components";
      if (!groups.has(group)) groups.set(group, []);
      groups.get(group).push(component);
    });
    groups.forEach((components, group) => writer.componentGroup(group, components));
    writer.operations("Incidents", model.incidents, "No incidents are present in the loaded report context.");
    writer.operations("Scheduled maintenance", model.scheduled_maintenance, "No maintenance is present in the loaded report context.");
    writer.provenance();
    const pages = writer.finish();
    const blobs = await Promise.all(pages.map(canvasBlob));
    return blobs.map((blob, index) => ({
      blob,
      width: pages[index].width,
      height: pages[index].height,
      filename: buildFilename(model, "png", index + 1, pages.length),
      pageNumber: index + 1,
      pageCount: pages.length,
    }));
  };

  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.hidden = true;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1200);
  };

  const downloadJsonReport = (model) => {
    const payload = `${JSON.stringify(model, null, 2)}\n`;
    const blob = new Blob([payload], { type: "application/json;charset=utf-8" });
    const filename = buildFilename(model, "json");
    downloadBlob(blob, filename);
    return { blob, filename, payload };
  };

  const openPdfPrint = async (model) => {
    const html = buildPrintDocument(model);
    const filename = buildFilename(model, "pdf");
    const frame = document.createElement("iframe");
    frame.dataset.statusReportPrintDocument = "";
    frame.title = "StreamSuites status report print document";
    frame.setAttribute("aria-hidden", "true");
    Object.assign(frame.style, { position: "fixed", width: "1px", height: "1px", right: "0", bottom: "0", border: "0", opacity: "0", pointerEvents: "none" });
    document.body.appendChild(frame);
    const printDocument = frame.contentDocument;
    if (!printDocument || !frame.contentWindow) {
      frame.remove();
      throw new Error("The browser could not create the PDF print document.");
    }
    printDocument.open();
    printDocument.write(html);
    printDocument.close();
    if (printDocument.fonts?.ready) await printDocument.fonts.ready;
    await Promise.all([...printDocument.images].map((image) => image.complete ? Promise.resolve() : new Promise((resolve) => {
      image.addEventListener("load", resolve, { once: true });
      image.addEventListener("error", resolve, { once: true });
    })));
    const cleanup = () => frame.remove();
    frame.contentWindow.addEventListener("afterprint", cleanup, { once: true });
    window.setTimeout(cleanup, 60000);
    window.dispatchEvent(new CustomEvent("streamsuites:status-report-print-ready", { detail: { frame, filename } }));
    frame.contentWindow.focus();
    frame.contentWindow.print();
    return { frame, filename, html };
  };

  const menuOptionMarkup = (compact = false) => [
    ["png", "PNG Report", "Polished visual report"],
    ["pdf", "PDF Report", "Vector print report"],
    ["json", "JSON Data", "Machine-readable data"],
  ].map(([format, label, description]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("role", "menuitem");
    button.dataset.reportFormat = format;
    const title = document.createElement("span");
    title.textContent = compact ? format.toUpperCase() : label;
    const small = document.createElement("small");
    small.textContent = description;
    button.append(title, small);
    return button;
  });

  const closeReportMenu = (menu, { restoreFocus = false } = {}) => {
    const trigger = menu?.querySelector("[data-report-menu-trigger]");
    menu?.classList.remove("is-open");
    trigger?.setAttribute("aria-expanded", "false");
    if (restoreFocus) trigger?.focus({ preventScroll: true });
  };

  const closeOtherReportMenus = (except = null) => {
    document.querySelectorAll("[data-report-menu].is-open").forEach((menu) => {
      if (menu !== except) closeReportMenu(menu);
    });
  };

  const openReportModal = ({ format, scopeType = "full", componentId = null, componentName = null, range = null } = {}) => {
    const backdrop = document.querySelector("[data-report-modal]");
    const modal = backdrop?.querySelector(".report-modal");
    if (!backdrop || !modal || !FORMAT_LABELS[format]) return;
    state.previousFocus = document.activeElement;
    state.modalContext = { format, scopeType: scopeType === "component" ? "component" : "full", componentId, componentName };
    const defaultRange = RANGE_ORDER.includes(range) ? range : state.currentOverallRange;
    const scopeLabel = state.modalContext.scopeType === "component" ? cleanText(componentName, "Component") : "Complete StreamSuites status";
    const title = state.modalContext.scopeType === "component" ? `Export ${scopeLabel}` : "Generate status report";
    const titleNode = backdrop.querySelector("[data-report-modal-title]");
    const scopeNode = backdrop.querySelector("[data-report-scope-label]");
    const formatNode = backdrop.querySelector("[data-report-format-label]");
    if (titleNode) titleNode.textContent = title;
    if (scopeNode) scopeNode.textContent = scopeLabel;
    if (formatNode) formatNode.textContent = FORMAT_LABELS[format];
    const fullSections = backdrop.querySelector("[data-report-full-sections]");
    const componentIncludes = backdrop.querySelector("[data-report-component-includes]");
    if (fullSections) fullSections.hidden = state.modalContext.scopeType !== "full";
    if (componentIncludes) componentIncludes.hidden = state.modalContext.scopeType !== "component";
    backdrop.querySelectorAll("[data-report-full-sections] input[type=checkbox]").forEach((input) => { input.checked = true; });
    const diagnostic = state.modalContext.scopeType === "component"
      ? Object.values(state.snapshot?.diagnostics?.components || {}).find((item) => item?.component_id === componentId) || null
      : null;
    const enforceHistorySupport = diagnostic?.coverage === "implemented";
    backdrop.querySelectorAll('input[name="status-report-range"]').forEach((input) => {
      input.disabled = Boolean(enforceHistorySupport && !Object.prototype.hasOwnProperty.call(diagnostic?.history || {}, input.value));
      input.checked = input.value === defaultRange && !input.disabled;
    });
    if (!backdrop.querySelector('input[name="status-report-range"]:checked')) {
      const fallback = [...backdrop.querySelectorAll('input[name="status-report-range"]:not(:disabled)')].find((input) => input.value === "24h") || backdrop.querySelector('input[name="status-report-range"]:not(:disabled)');
      if (fallback) fallback.checked = true;
    }
    const pngNote = backdrop.querySelector("[data-report-png-note]");
    const pdfNote = backdrop.querySelector("[data-report-pdf-note]");
    if (pngNote) pngNote.hidden = format !== "png";
    if (pdfNote) pdfNote.hidden = format !== "pdf";
    const feedback = backdrop.querySelector("[data-report-feedback]");
    if (feedback) {
      feedback.textContent = "";
      delete feedback.dataset.state;
    }
    const generate = backdrop.querySelector("[data-report-generate]");
    if (generate) generate.textContent = format === "pdf" ? "Open PDF print dialog" : `Generate ${format.toUpperCase()} report`;
    modal.removeAttribute("aria-busy");
    backdrop.hidden = false;
    document.body.classList.add("report-modal-open");
    requestAnimationFrame(() => {
      backdrop.classList.add("is-open");
      backdrop.querySelector("[data-report-modal-close]")?.focus({ preventScroll: true });
    });
  };

  const closeReportModal = ({ restoreFocus = true } = {}) => {
    if (state.busy) return;
    const backdrop = document.querySelector("[data-report-modal]");
    if (!backdrop || backdrop.hidden) return;
    backdrop.classList.remove("is-open");
    document.body.classList.remove("report-modal-open");
    const focusTarget = state.previousFocus;
    window.setTimeout(() => {
      backdrop.hidden = true;
      state.modalContext = null;
      if (restoreFocus && focusTarget?.focus) focusTarget.focus({ preventScroll: true });
    }, window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ? 0 : 190);
  };

  const bindReportMenu = (menu, context = {}) => {
    if (!menu || menu.dataset.reportMenuBound === "true") return menu;
    menu.dataset.reportMenuBound = "true";
    const trigger = menu.querySelector("[data-report-menu-trigger]");
    const options = [...menu.querySelectorAll("[data-report-format]")];
    const setOpen = (open, restoreFocus = false) => {
      if (open) closeOtherReportMenus(menu);
      menu.classList.toggle("is-open", open);
      trigger?.setAttribute("aria-expanded", String(open));
      if (!open && restoreFocus) trigger?.focus({ preventScroll: true });
    };
    trigger?.addEventListener("click", (event) => {
      event.stopPropagation();
      setOpen(!menu.classList.contains("is-open"));
    });
    trigger?.addEventListener("keydown", (event) => {
      if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      setOpen(true);
      const target = event.key === "ArrowUp" || event.key === "End" ? options.at(-1) : options[0];
      target?.focus({ preventScroll: true });
    });
    menu.addEventListener("pointerenter", () => {
      if (window.matchMedia?.("(hover: hover) and (pointer: fine)")?.matches) setOpen(true);
    });
    menu.addEventListener("pointerleave", () => {
      if (window.matchMedia?.("(hover: hover) and (pointer: fine)")?.matches && !menu.contains(document.activeElement)) setOpen(false);
    });
    menu.addEventListener("focusout", () => window.setTimeout(() => {
      if (!menu.contains(document.activeElement)) setOpen(false);
    }, 0));
    options.forEach((option) => option.addEventListener("click", () => {
      const format = option.dataset.reportFormat;
      const range = typeof context.getRange === "function" ? context.getRange() : state.currentOverallRange;
      setOpen(false);
      trigger?.focus({ preventScroll: true });
      openReportModal({
        format,
        scopeType: context.scopeType || menu.dataset.reportScope || "full",
        componentId: context.componentId || menu.dataset.componentId || null,
        componentName: context.componentName || menu.dataset.componentName || null,
        range,
      });
    }));
    menu.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false, true);
        return;
      }
      if (!options.includes(event.target)) return;
      const index = options.indexOf(event.target);
      let next = null;
      if (event.key === "ArrowDown" || event.key === "ArrowRight") next = options[(index + 1) % options.length];
      if (event.key === "ArrowUp" || event.key === "ArrowLeft") next = options[(index - 1 + options.length) % options.length];
      if (event.key === "Home") next = options[0];
      if (event.key === "End") next = options.at(-1);
      if (!next) return;
      event.preventDefault();
      next.focus({ preventScroll: true });
    });
    return menu;
  };

  const createFormatMenu = ({ scopeType = "component", componentId = null, componentName = null, getRange = null } = {}) => {
    const menu = document.createElement("div");
    menu.className = "report-menu report-menu--component";
    menu.dataset.reportMenu = "";
    menu.dataset.reportScope = scopeType;
    if (componentId) menu.dataset.componentId = componentId;
    if (componentName) menu.dataset.componentName = componentName;
    const id = `component-report-${slugify(componentId || componentName)}-${Math.random().toString(36).slice(2, 8)}`;
    const trigger = document.createElement("button");
    trigger.className = "report-menu__trigger";
    trigger.type = "button";
    trigger.setAttribute("aria-haspopup", "menu");
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-controls", id);
    trigger.dataset.reportMenuTrigger = "";
    trigger.append("Export ", (() => { const mark = document.createElement("span"); mark.className = "report-menu__chevron"; mark.setAttribute("aria-hidden", "true"); return mark; })());
    const options = document.createElement("div");
    options.className = "report-menu__options";
    options.id = id;
    options.setAttribute("role", "menu");
    options.setAttribute("aria-label", `Export ${componentName || "component"} report`);
    options.dataset.reportMenuOptions = "";
    options.append(...menuOptionMarkup(true));
    menu.append(trigger, options);
    return bindReportMenu(menu, { scopeType, componentId, componentName, getRange });
  };

  const setFeedback = (message, status = null) => {
    const feedback = document.querySelector("[data-report-feedback]");
    if (!feedback) return;
    feedback.textContent = message;
    if (status) feedback.dataset.state = status;
    else delete feedback.dataset.state;
  };

  const generateFromModal = async () => {
    if (state.busy || !state.modalContext) return;
    const backdrop = document.querySelector("[data-report-modal]");
    const modal = backdrop?.querySelector(".report-modal");
    const generate = backdrop?.querySelector("[data-report-generate]");
    const selectedRange = backdrop?.querySelector('input[name="status-report-range"]:checked')?.value || "24h";
    const sections = [...(backdrop?.querySelectorAll("[data-report-full-sections] input:checked") || [])].map((input) => input.value);
    state.busy = true;
    if (modal) modal.setAttribute("aria-busy", "true");
    if (generate) generate.disabled = true;
    try {
      setFeedback("Building report…");
      await Promise.resolve();
      const model = buildStatusReportModel(state.snapshot, {
        ...state.modalContext,
        range: selectedRange,
        sections,
      });
      const violations = scanReportSafety(model);
      if (violations.length) throw new Error("The report was stopped because an unsafe field was detected.");
      if (state.modalContext.format === "json") {
        setFeedback("Preparing download…");
        downloadJsonReport(model);
      } else if (state.modalContext.format === "png") {
        setFeedback("Rendering graphs…");
        const pages = await renderPngReport(model);
        setFeedback("Preparing download…");
        for (const page of pages) {
          downloadBlob(page.blob, page.filename);
          await new Promise((resolve) => window.setTimeout(resolve, 40));
        }
      } else {
        setFeedback("Preparing vector print document…");
        await openPdfPrint(model);
      }
      setFeedback(state.modalContext.format === "pdf" ? "Print document ready." : "Report download prepared.", "success");
      if (generate) generate.textContent = state.modalContext.format === "pdf" ? "Open PDF print dialog again" : "Generate again";
    } catch (error) {
      console.error("[StreamSuites status report] generation failed", error);
      setFeedback(cleanText(error?.message, "The report could not be prepared. Please retry."), "error");
    } finally {
      state.busy = false;
      if (modal) modal.removeAttribute("aria-busy");
      if (generate) generate.disabled = false;
    }
  };

  const initModal = () => {
    const backdrop = document.querySelector("[data-report-modal]");
    const modal = backdrop?.querySelector(".report-modal");
    if (!backdrop || !modal || backdrop.dataset.reportModalBound === "true") return;
    backdrop.dataset.reportModalBound = "true";
    backdrop.querySelector("[data-report-modal-close]")?.addEventListener("click", () => closeReportModal());
    backdrop.querySelector("[data-report-modal-cancel]")?.addEventListener("click", () => closeReportModal());
    backdrop.querySelector("[data-report-generate]")?.addEventListener("click", generateFromModal);
    backdrop.addEventListener("click", (event) => {
      if (event.target === backdrop) closeReportModal();
    });
    document.addEventListener("keydown", (event) => {
      if (backdrop.hidden) return;
      if (event.key === "Escape") {
        event.preventDefault();
        closeReportModal();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = [...modal.querySelectorAll('button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])')]
        .filter((element) => !element.hidden && element.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  };

  const init = () => {
    document.querySelectorAll("[data-report-menu]").forEach((menu) => bindReportMenu(menu, { scopeType: menu.dataset.reportScope || "full", getRange: () => state.currentOverallRange }));
    document.addEventListener("click", (event) => {
      document.querySelectorAll("[data-report-menu].is-open").forEach((menu) => {
        if (!menu.contains(event.target)) closeReportMenu(menu);
      });
    });
    initModal();
    window.StreamSuitesStatusData?.subscribe?.((snapshot) => { state.snapshot = snapshot; });
  };

  Object.assign(window.StreamSuitesStatusReport, {
    buildPrintDocument,
    renderPngReport,
    downloadJsonReport,
    openPdfPrint,
    openReportModal,
    closeReportModal,
    createFormatMenu,
  });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
