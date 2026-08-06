import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");

test("version reference is a canonical standalone public surface with the exact brand lockup", () => {
  const html = read("version.html");
  assert.match(html, /<link rel="canonical" href="https:\/\/streamsuites\.app\/version"/);
  assert.match(html, /class="site-header" data-site-header/);
  assert.match(html, /class="brand__mark" src="\/assets\/logos\/ssmainlogosq\.webp"/);
  assert.match(html, /class="brand__wordmark" src="\/assets\/logos\/wmnew\.webp"/);
  assert.match(html, /class="brand site-footer__brand-lockup"/);
  assert.match(html, /data-copy-manifest/);
  assert.match(html, /data-version-components/);
  assert.match(html, /data-version-search/);
  assert.match(html, /StreamSuites Release Manager/);
  assert.match(html, /\/assets\/icons\/icon-releasemanager\.png/);
  assert.ok(existsSync(new URL("../assets/icons/icon-releasemanager.png", import.meta.url)));
  assert.doesNotMatch(html, /sswordmarktm\.webp/);
});

test("version reference consumes only the same-origin authoritative public registry route", () => {
  const script = read("js/public-version.js");
  const proxy = read("functions/api/[[path]].js");
  assert.match(script, /REGISTRY_URL = "\/api\/public\/version-registry"/);
  assert.match(script, /schema_version === "version-registry-public-v1"/);
  assert.match(script, /fetch\(REGISTRY_URL, \{ cache: "no-store"/);
  assert.match(proxy, /\^\\\/api\\\/public/);
  assert.doesNotMatch(script, /version-registry-admin|\/api\/admin|admin\/version-registry/);
  assert.doesNotMatch(script, /system_semantic_version:\s*["']/);
  assert.doesNotMatch(script, /0\.5\.4-alpha|2026\.08\.05\+002/);
});

test("version reference renders and copies all public fields without fake local state", () => {
  const script = read("js/public-version.js");
  for (const field of [
    "component_id",
    "display_name",
    "version_policy",
    "semantic_version_status",
    "semantic_version",
    "state",
    "last_build",
    "last_deployment",
    "last_publication",
    "compatibility"
  ]) assert.match(script, new RegExp(field));
  assert.match(script, /navigator\.clipboard\.writeText/);
  assert.match(script, /document\.execCommand\("copy"\)/);
  assert.match(script, /data-copy-companion/);
  assert.match(script, /No separate public product version is projected/i);
  assert.doesNotMatch(script, /fake ticket|localStorage|sessionStorage|POST|PUT|PATCH|DELETE/);
});

test("version page presentation is responsive, focus-visible, and reduced-motion aware", () => {
  const css = read("css/version-page.css");
  assert.match(css, /\.version-component::before/);
  assert.match(css, /\.version-component:hover::before/);
  assert.match(css, /\.version-copy-button:focus-visible/);
  assert.match(css, /@media \(max-width: 600px\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /\.version-component::before \{ display: none; \}/);
  assert.match(css, /@media \(forced-colors: active\)/);
});

test("landing footer uses the same mark and wordmark as its header and links to version details", () => {
  const html = read("index.html");
  const footer = html.match(/<footer class="site-footer">[\s\S]*?<\/footer>/)?.[0] || "";
  assert.ok(footer, "landing footer should exist");
  assert.match(footer, /class="brand site-footer__brand-lockup"/);
  assert.match(footer, /\/assets\/logos\/ssmainlogosq\.webp/);
  assert.match(footer, /\/assets\/logos\/wmnew\.webp/);
  assert.match(footer, /href="\/version"/);
  assert.doesNotMatch(footer, /sswordmarktm\.webp/);
});
