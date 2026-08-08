import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");

const sharedThemeRoutes = [
  "404.html",
  "about.html",
  "accessibility.html",
  "clips.html",
  "clips/detail.html",
  "community/index.html",
  "community/members.html",
  "community/my-data.html",
  "community/notices.html",
  "community/profile.html",
  "community/settings.html",
  "donate-cancel.html",
  "donate-success.html",
  "donate.html",
  "downloads/studioapp/index.html",
  "economy.html",
  "home.html",
  "leaderboards.html",
  "live/index.html",
  "market-exchange.html",
  "market-exchange/index.html",
  "polls.html",
  "polls/detail.html",
  "polls/results.html",
  "postmortem.html",
  "privacy.html",
  "public-login.html",
  "requests-login.html",
  "requests.html",
  "resources.html",
  "roadmap.html",
  "scoreboards.html",
  "scoreboards/detail.html",
  "stats.html",
  "support.html",
  "tallies.html",
  "tallies/detail.html",
  "terms.html",
  "u/index.html",
  "version.html",
  "wheels.html",
  "wheels/detail.html",
];

const directFeatureRoutes = [
  "index.html",
  "downloads/index.html",
  "downloads/obs-plugin/index.html",
  "downloads/studioapp/extensions/index.html",
];

const excludedSpecialRoutes = [
  "auth-bridge.html",
  "public-auth-complete.html",
  "requests-auth-complete.html",
  "index-old.html",
  "index-v2.html",
  "login.html",
  "login/index.html",
  "media.html",
  "rarity-poc.html",
  "rarity-poc2.html",
  "rarity-poc3.html",
  "status-check.html",
  "pocv9/index.html",
  "sspoc1/index.html",
  "statuspocv4/index.html",
  "statuspocv4/status-poc-standalone.html",
  "stream_suites_public_leaderboards_poc.html",
];

test("shared feature edges retain the Status geometry and page-aware accent token", () => {
  const css = read("css/feature-edges.css");

  assert.match(css, /--feature-edge-accent:\s*#76c3ff/);
  assert.match(css, /html\[data-product\][\s\S]*--feature-edge-accent:\s*var\(--product-accent-bright/);
  assert.match(css, /body\.download-surface[\s\S]*--feature-edge-accent:\s*var\(--download-accent-bright/);
  assert.match(css, /\.site-header,[\s\S]*\.public-topbar,[\s\S]*\.download-topbar[\s\S]*::after\s*\{[\s\S]*right:\s*12%;[\s\S]*bottom:\s*-1px;[\s\S]*width:\s*28%;[\s\S]*height:\s*1px/);
  assert.match(css, /\.site-footer,[\s\S]*\.public-footer,[\s\S]*\.download-footer,[\s\S]*\.footer-bar,[\s\S]*\.profile-shell-footer,[\s\S]*\.not-found-footer[\s\S]*::before\s*\{[\s\S]*top:\s*-1px;[\s\S]*left:\s*10%;[\s\S]*width:\s*34%;[\s\S]*height:\s*1px/);
  assert.match(css, /color-mix\(in srgb, var\(--feature-edge-accent\)/);
  assert.match(css, /pointer-events:\s*none/);
});

test("every inventoried human-facing route directly loads or inherits the shared edge stylesheet", () => {
  const theme = read("css/theme-dark.css");
  assert.match(theme, /^@import url\("\/css\/public-fonts\.css"\);\r?\n@import url\("\/css\/feature-edges\.css\?v=20260808-feature-edges"\);/);

  for (const relativePath of sharedThemeRoutes) {
    assert.match(read(relativePath), /href="\/css\/theme-dark\.css"/, `${relativePath} must inherit feature edges`);
  }

  for (const relativePath of directFeatureRoutes) {
    assert.match(read(relativePath), /href="\/css\/feature-edges\.css\?v=20260808-feature-edges"/, `${relativePath} must load feature edges`);
  }

  assert.match(read("public-login.html"), /<body class="ss-public-login" data-feature-edges>/);
  assert.match(read("requests-login.html"), /<body class="ss-requests-auth" data-feature-edges>/);
});

test("Status owns exactly one unchanged edge pair and special-purpose entries remain excluded", () => {
  const statusHtml = read("status.html");
  const statusCss = read("css/status-page.css");
  const featureCss = read("css/feature-edges.css");

  assert.doesNotMatch(statusHtml, /feature-edges\.css|theme-dark\.css/);
  assert.equal((statusCss.match(/\.site-header::after/g) || []).length, 1);
  assert.equal((statusCss.match(/\.site-footer::before/g) || []).length, 1);
  assert.match(statusCss, /\.site-header::after\s*\{[^}]*right:\s*12%;[^}]*bottom:\s*-1px;[^}]*width:\s*28%;[^}]*height:\s*1px/s);
  assert.match(statusCss, /\.site-footer::before\s*\{[^}]*top:\s*-1px;[^}]*left:\s*10%;[^}]*width:\s*34%;[^}]*height:\s*1px/s);
  assert.match(featureCss, /body:not\(\.status-page\)/);

  for (const relativePath of excludedSpecialRoutes) {
    const html = read(relativePath);
    assert.doesNotMatch(html, /feature-edges\.css|data-feature-edges/, `${relativePath} must stay outside the rollout`);
  }
});

test("the approved pocv9 reference still matches its protected SHA-256 manifest", () => {
  const manifest = read("pocv9/SHA256SUMS.txt").trim().split(/\r?\n/);
  assert.equal(manifest.length, 5);

  for (const entry of manifest) {
    const match = entry.match(/^([a-f0-9]{64})\s{2}(.+)$/);
    assert.ok(match, `invalid pocv9 manifest entry: ${entry}`);
    const actual = crypto
      .createHash("sha256")
      .update(fs.readFileSync(path.join(root, "pocv9", match[2])))
      .digest("hex");
    assert.equal(actual, match[1], `pocv9/${match[2]} changed`);
  }
});
