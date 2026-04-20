import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

test("public data hub hydrates wheels from the authoritative live API first and reuses them for scoreboard mode", () => {
  const source = read("js/public-data-hub.js");

  assert.match(source, /const WHEELS_API_PATH = "\/api\/public\/wheels";/);
  assert.match(source, /wheels:\s*\["\/shared\/state\/wheels\.json", "\/runtime\/exports\/wheels\.json", "\/data\/wheels\.json"\]/);
  assert.match(source, /async function loadLiveWheelPayload\(\)/);
  assert.match(source, /fetch\(`\$\{API_BASE\}\$\{WHEELS_API_PATH\}`/);
  assert.match(source, /const wheelsPayload = wheelsApiPayload && Array\.isArray\(wheelsApiPayload\.items\)/);
  assert.match(source, /mode: wheelsApiPayload && Array\.isArray\(wheelsApiPayload\.items\) \? "api" : "mirror"/);
  assert.match(source, /function normalizeWheel\(raw, index, profiles, authorityArtifacts = null\)/);
  assert.match(source, /function buildScoreboardLensFromWheel\(wheel\)/);
  assert.match(source, /const wheels = sortByUpdated\(toArray\(wheelsPayload\)\.map\(\(item, index\) => normalizeWheel\(item, index, profilesMap, authorityArtifacts\)\)\);/);
  assert.match(source, /const scoreboards = sortByUpdated\(wheels\.map\(\(item\) => buildScoreboardLensFromWheel\(item\)\)\);/);
});

test("public wheels route preserves the shell and provides clean list/detail artifact routes", () => {
  const app = read("js/public-pages-app.js");
  const shell = read("js/public-shell.js");
  const listHtml = read("wheels.html");
  const detailHtml = read("wheels/detail.html");
  const indexFn = read("functions/wheels/index.js");
  const detailFn = read("functions/wheels/[[artifact]].js");
  const css = read("css/public-shell.css");

  assert.match(app, /aliases: \["\/wheels", "\/wheels\/"\]/);
  assert.match(app, /detailType: "wheels"/);
  assert.match(app, /prefix: "\/wheels\/", pageId: "detail-wheel", detailType: "wheels"/);
  assert.match(app, /function findArtifactByIdentifier\(items, identifier\)/);
  assert.match(app, /entry\?\.routeKeys\) && entry\.routeKeys\.includes\(normalizedRequested\)/);
  assert.match(app, /function resolveDefaultSidebarState\(config\)/);
  assert.match(app, /return String\(config\.path \|\| ""\)\.includes\("\/detail\.html"\) \? "icon" : "";/);
  assert.match(app, /defaultSidebarState: resolveDefaultSidebarState\(currentConfig\)/);
  assert.match(app, /defaultSidebarState: resolveDefaultSidebarState\(nextConfig\)/);
  assert.match(app, /function buildWheelDetailMain\(item, config\)/);
  assert.match(app, /const PUBLIC_WHEEL_EVENTS_URL = `\$\{AUTH_API_BASE\}\/api\/public\/wheels\/events`;/);
  assert.match(app, /function syncWheelLiveSubscription\(\)/);
  assert.match(app, /wheelEventSource = new EventSource\(PUBLIC_WHEEL_EVENTS_URL, \{ withCredentials: true \}\);/);
  assert.match(app, /wheelEventSource\.addEventListener\("wheel\.changed"/);
  assert.match(app, /refreshWheelDataFromAuthority\(\)\.catch\(\(\) => \{\}\);/);
  assert.match(app, /function toTitle\(value\)/);
  assert.match(app, /buildAuthorityRequestPanel\(resolveArtifactAuthorityContext\(item\), \{/);
  assert.match(app, /Spin locally/);
  assert.match(app, /No winner history or backend state is written from this surface/);
  assert.match(shell, /href: "\/wheels", label: "Wheels"/);
  assert.match(shell, /const cleanPrefixes = \["\/clips\/", "\/polls\/", "\/scores\/", "\/wheels\/"\]/);
  assert.match(shell, /defaultSidebarState: ""/);
  assert.match(shell, /autoSidebarStateOverride = normalizeSidebarState\(options\.defaultSidebarState\)/);
  assert.match(shell, /if \(useAutoSidebarState\) \{/);
  assert.match(listHtml, /data-public-page="media-wheels"/);
  assert.match(detailHtml, /data-public-page="detail-wheel"/);
  assert.match(indexFn, /serveAssetPath\(context, "\/wheels\.html"\)/);
  assert.match(detailFn, /basePath: "\/wheels"/);
  assert.match(detailFn, /assetPath: "\/wheels\/detail\.html"/);
  assert.match(css, /\.wheel-spin-shell/);
  assert.match(css, /\.wheel-scoreboard-table/);
});
