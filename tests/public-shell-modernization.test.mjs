import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => fs.readFileSync(path.join(ROOT, relativePath), "utf8");
const preferencesSource = read("js/public-ui-preferences.js");
const shellSource = read("js/public-shell.js");
const appSource = read("js/public-pages-app.js");
const shellCss = read("css/public-shell.css");
const wheelWorkspaceSource = read("js/wheel-workspace.js");
const wheelWorkspaceCss = read("css/wheel-workspace.css");
const statsHtml = read("stats.html");
const statsSource = read("js/stats-page.js");
const statsCss = read("css/stats-page.css");

const SHELL_HTML = [
  "home.html", "clips.html", "clips/detail.html", "polls.html", "polls/detail.html", "polls/results.html",
  "wheels.html", "wheels/detail.html", "leaderboards.html", "scoreboards.html", "scoreboards/detail.html",
  "tallies.html", "tallies/detail.html", "economy.html", "market-exchange.html", "market-exchange/index.html",
  "live/index.html", "community/index.html", "community/members.html", "community/notices.html",
  "community/profile.html", "community/settings.html", "community/my-data.html"
];

function instantiatePreferences({ stored = null, storageThrows = false, fetchImpl } = {}) {
  const values = new Map();
  if (stored !== null) values.set("streamsuites.public-ui-preferences.v1", stored);
  const root = { dataset: {}, style: {} };
  const events = [];
  const context = {
    console,
    document: { documentElement: root },
    CustomEvent: class CustomEvent { constructor(type, init) { this.type = type; this.detail = init?.detail; } },
    fetch: fetchImpl || (async () => ({ ok: true, json: async () => ({ public_ui_preferences: { appearance: "dark", theme_preset: "violet_blue" } }) })),
    window: {
      localStorage: {
        getItem(key) { if (storageThrows) throw new Error("blocked"); return values.get(key) ?? null; },
        setItem(key, value) { if (storageThrows) throw new Error("blocked"); values.set(key, value); }
      },
      dispatchEvent(event) { events.push(event); }
    }
  };
  vm.runInNewContext(preferencesSource, context, { filename: "public-ui-preferences.js" });
  return { api: context.window.StreamSuitesPublicUiPreferences, root, values, events };
}

test("early bootstrap uses a versioned local preference and survives blocked storage", () => {
  const stored = JSON.stringify({ version: 1, appearance: "light", themePreset: "signal_red" });
  const local = instantiatePreferences({ stored });
  assert.equal(local.root.dataset.publicAppearance, "light");
  assert.equal(local.root.dataset.publicTheme, "signal_red");
  assert.equal(local.root.style.colorScheme, "light");

  const blocked = instantiatePreferences({ storageThrows: true });
  assert.equal(blocked.root.dataset.publicAppearance, "dark");
  assert.equal(blocked.root.dataset.publicTheme, "violet_blue");
});

test("authenticated authority overrides a stale mirror and successful saves replace the mirror", async () => {
  const calls = [];
  const local = instantiatePreferences({
    stored: JSON.stringify({ version: 1, appearance: "light", themePreset: "signal_red" }),
    fetchImpl: async (_url, options) => {
      calls.push(JSON.parse(options.body));
      return { ok: true, json: async () => ({ public_ui_preferences: { appearance: "dark", theme_preset: "gold_amber" } }) };
    }
  });
  local.api.hydrate({ authenticated: true, public_ui_preferences: { appearance: "dark", theme_preset: "emerald_cyan" } });
  assert.equal(local.api.getState().appearance, "dark");
  assert.equal(local.api.getState().themePreset, "emerald_cyan");
  assert.equal(JSON.parse(local.values.get(local.api.STORAGE_KEY)).themePreset, "emerald_cyan");

  await local.api.setThemePreset("gold_amber");
  assert.deepEqual(calls[0], { appearance: "dark", theme_preset: "gold_amber" });
  assert.equal(local.api.getState().status, "saved");
  assert.equal(JSON.parse(local.values.get(local.api.STORAGE_KEY)).themePreset, "gold_amber");
});

test("failed authenticated saves restore the previous authoritative preference", async () => {
  const local = instantiatePreferences({
    fetchImpl: async () => ({ ok: false, status: 503, json: async () => ({ error: "Authority unavailable" }) })
  });
  local.api.hydrate({ authenticated: true, public_ui_preferences: { appearance: "dark", theme_preset: "royal_blue" } });
  await local.api.setAppearance("light");
  assert.equal(local.api.getState().appearance, "dark");
  assert.equal(local.api.getState().themePreset, "royal_blue");
  assert.equal(local.api.getState().status, "error");
});

test("every shell document loads the no-flash bootstrap before styles", () => {
  for (const relativePath of SHELL_HTML) {
    const html = read(relativePath);
    const bootstrapIndex = html.indexOf('/js/public-ui-preferences.js');
    const shellStyleIndex = html.indexOf('/css/public-shell.css');
    assert.ok(bootstrapIndex > 0, `${relativePath} has preference bootstrap`);
    assert.ok(shellStyleIndex > bootstrapIndex, `${relativePath} applies preference before shell CSS`);
  }
});

test("shell registry and route-specific modernization retain every current renderer", () => {
  const routeIds = [
    "media-home", "media-clips", "media-polls", "media-scoreboards", "media-leaderboards", "media-wheels",
    "media-tallies", "media-economy", "media-market-exchange", "detail-clip", "detail-poll", "detail-poll-results",
    "detail-scoreboard", "detail-wheel", "detail-tally", "community-home", "community-members", "community-live",
    "community-notices", "community-profile", "community-settings", "community-my-data", "public-profile-standalone"
  ];
  routeIds.forEach((routeId) => assert.match(appSource, new RegExp(`"${routeId}"\\s*:`)));
  ["media-home", "media-clips", "media-polls", "media-wheels", "media-tallies", "media-economy", "community-home", "community-live", "community-members", "community-notices", "community-my-data"].forEach((routeId) => {
    assert.match(shellCss, new RegExp(`data-public-page=\\"${routeId}\\"`));
  });
  assert.match(shellSource, /expanded:\s*"expanded"/);
  assert.match(shellSource, /icon:\s*"icon"/);
  assert.match(shellSource, /hidden:\s*"hidden"/);
  assert.match(shellSource, /create\("button", "sidebar-state-btn"\)/);
  assert.match(shellSource, /function advanceSidebarState\(\)/);
  assert.match(shellSource, /Collapse sidebar to icons/);
  assert.match(shellSource, /Hide sidebar/);
  assert.match(shellSource, /Show expanded sidebar/);
  assert.doesNotMatch(shellSource, /topbar-hide-btn|toggleSidebarVisibility/);
  assert.match(shellSource, /Browser Studio", icon: "\/assets\/icons\/icondiag-studioweb\.svg"/);
  assert.match(shellSource, /StudioApp", icon: "\/assets\/icons\/icondiag-studioapp\.svg"/);
  assert.match(shellSource, /Studio for OBS", icon: "\/assets\/icons\/obs-0\.svg"/);
  assert.match(shellSource, /sidebar-brand-glyph/);
  assert.doesNotMatch(shellSource, /logo\.src = "\/assets\/logos\/ssmainlogosq\.webp"/);
  assert.match(shellCss, /\.sidebar-brand-glyph::before,[\s\S]*streamsuites-filled\.svg/);
  assert.match(shellCss, /\.sidebar-brand:hover \.sidebar-brand-logo/);
});

test("settings, account menu, semantic tokens, and established presets share one Public preference path", () => {
  const presetKeys = ["violet_blue", "crimson_magenta", "signal_red", "emerald_cyan", "gold_amber", "royal_blue", "magenta_violet", "red_gold", "green_gold", "dark_slate", "neutral_greytone", "frosted_silver"];
  presetKeys.forEach((key) => {
    assert.match(preferencesSource, new RegExp(`key: "${key}"`));
    assert.match(appSource, new RegExp(`key: "${key}"`));
  });
  assert.match(preferencesSource, /\/api\/public\/me\/preferences/);
  assert.match(appSource, /buildPublicAppearanceSettings/);
  assert.match(appSource, /Saved to your StreamSuites account/);
  assert.match(shellSource, /buildAccountAppearanceControl/);
  assert.match(shellSource, /Theme settings/);
  assert.match(shellSource, /getAccountMenuControls/);
  assert.match(shellSource, /account\.addEventListener\("keydown"/);
  assert.match(shellCss, /--ss-surface-page:/);
  assert.match(shellCss, /--ss-accent-primary:/);
  assert.match(shellCss, /data-public-appearance="light"/);
  assert.match(shellCss, /--ss-state-success:/);
  assert.match(shellCss, /Light mode must outrank route-local legacy dark surfaces/);
});

test("the shared wheel workspace behavior survives shell modernization", () => {
  for (const marker of ["wheel-arena-card", "wheel-workspace", "weightedWinner", "wheel-winner-overlay", "spin_owner_only", "local session result", "prefers-reduced-motion"]) {
    assert.match(`${appSource}\n${shellCss}\n${wheelWorkspaceSource}\n${wheelWorkspaceCss}`, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("stats uses the public aggregate contract and retains finite graph-entry motion", () => {
  assert.doesNotMatch(`${statsHtml}\n${statsSource}`, /STATS_PLACEHOLDER|89400|3248000|Live placeholder/i);
  assert.match(statsSource, /\/api\/public\/stats/);
  assert.match(statsSource, /schema_version\s*!==\s*"public-stats-v1"/);
  assert.match(statsSource, /is-plot-primed/);
  assert.match(statsSource, /IntersectionObserver/);
  assert.match(statsSource, /prefers-reduced-motion/);
  assert.match(statsSource, /No totals have been substituted or treated as zero/);
  for (const heading of ["Total Site Visits", "Runtime Event Breakdown", "Total Users", "Active Installations", "Runtime Events", "Performance Analytics", "Milestones &amp; Bragging Rights"]) {
    assert.match(statsHtml, new RegExp(heading));
  }
  assert.match(statsHtml, /No authoritative visits aggregate is published/);
  assert.match(statsHtml, /No public installation aggregate is published/);
  assert.match(statsHtml, /No public event-volume aggregate is published/);
  assert.match(statsSource, /payload\.account_roles/);
  assert.match(statsSource, /data-scaffold-stat/);
  assert.match(statsSource, /data-stats-orbit-value/);
  assert.match(statsCss, /stroke-dashoffset:\s*1/);
  assert.match(statsCss, /stroke-dashoffset 1500ms/);
  assert.match(statsCss, /data-public-appearance="light"/);
  assert.match(statsCss, /body\.stats-page \.stats-hero h1/);
  assert.match(statsCss, /max-width:\s*100%;\s*font-size:\s*clamp\(2\.05rem/);
  assert.match(statsCss, /min-height:\s*360px/);
  assert.match(statsCss, /clamp\(2\.65rem, 4\.5vw, 4\.7rem\)/);
  assert.match(statsCss, /--stats-accent-b:\s*#70d8ff/);
  assert.doesNotMatch(statsCss, /data-public-theme="(?:crimson_magenta|emerald_cyan|gold_amber)"[^\n]*--stats-accent/);
  assert.match(statsCss, /@keyframes statsRouteSignal/);
  assert.match(statsCss, /@keyframes statsOrbitRing/);
  assert.match(statsCss, /@keyframes statsFeatureGradient/);
  assert.match(statsHtml, /\/css\/status-page\.css/);
  assert.match(statsHtml, /<header class="site-header" data-site-header>/);
  assert.match(statsHtml, /<footer class="site-footer">/);
  assert.match(statsHtml, /class="brand__mark" src="\/assets\/logos\/ssmainlogosq\.webp"/);
  assert.match(statsHtml, /class="brand__wordmark" src="\/assets\/logos\/wmnew\.webp"/);
  assert.match(statsHtml, /class="stats-theme-toggle"[^>]*data-stats-theme-toggle/);
  assert.match(statsHtml, /class="stats-constellation"[^>]*data-stats-constellation/);
  assert.match(statsHtml, /stats-constellation__routes/);
  assert.match(statsHtml, /data-stats-orbit-value="active_accounts"/);
  assert.doesNotMatch(statsHtml, /data-stats-appearance=/);
  assert.doesNotMatch(statsHtml, /class="stats-header"|class="stats-footer/);
  assert.match(statsSource, /Switch to \$\{nextAppearance\} mode/);
  assert.match(statsSource, /function initNavigation\(\)/);
  assert.match(statsSource, /event\.key === "Escape"/);
});
