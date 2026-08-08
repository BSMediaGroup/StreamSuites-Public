import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");

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
  assert.match(script, /lastSuccessfulData/);
  assert.match(script, /visibilitychange/);
  assert.doesNotMatch(script, /localStorage|\?demo=|fallbackComponents|createFallback|api\/v2\/components\/[^"'`]*\.(?:json|put|post)/i);
  assert.doesNotMatch(script, /api[_-]?key|manage\.statuspage|method:\s*["'](?:POST|PUT|PATCH|DELETE)/i);
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
