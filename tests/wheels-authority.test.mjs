import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

test("public data hub hydrates wheels from the authoritative runtime export and reuses them for scoreboard mode", () => {
  const source = read("js/public-data-hub.js");

  assert.match(source, /wheels:\s*\["\/runtime\/exports\/wheels\.json", "\/shared\/state\/wheels\.json", "\/data\/wheels\.json"\]/);
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
  assert.match(app, /function buildWheelDetailMain\(item, config\)/);
  assert.match(app, /Spin locally/);
  assert.match(app, /No winner history or backend state is written from this surface/);
  assert.match(shell, /href: "\/wheels", label: "Wheels"/);
  assert.match(shell, /const cleanPrefixes = \["\/clips\/", "\/polls\/", "\/scores\/", "\/wheels\/"\]/);
  assert.match(listHtml, /data-public-page="media-wheels"/);
  assert.match(detailHtml, /data-public-page="detail-wheel"/);
  assert.match(indexFn, /serveAssetPath\(context, "\/wheels\.html"\)/);
  assert.match(detailFn, /basePath: "\/wheels"/);
  assert.match(detailFn, /assetPath: "\/wheels\/detail\.html"/);
  assert.match(css, /\.wheel-spin-shell/);
  assert.match(css, /\.wheel-scoreboard-table/);
});
