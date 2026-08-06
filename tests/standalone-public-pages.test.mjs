import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const rootPath = fileURLToPath(root);
const read = (path) => readFileSync(new URL(path, root), "utf8");

const standalonePages = [
  "about.html",
  "accessibility.html",
  "donate.html",
  "donate-success.html",
  "donate-cancel.html",
  "privacy.html",
  "roadmap.html",
  "support.html",
  "version.html"
];

test("standalone pages use the canonical landing brand, shell, and mobile navigation contract", () => {
  for (const path of standalonePages) {
    const html = read(path);
    assert.match(html, /class="site-header" data-site-header/);
    assert.match(html, /class="brand__mark" src="\/assets\/logos\/ssmainlogosq\.webp"/);
    assert.match(html, /class="brand__wordmark" src="\/assets\/logos\/wmnew\.webp"/);
    assert.match(html, /data-nav-toggle/);
    assert.match(html, /data-primary-nav/);
    assert.match(html, /class="site-footer"/);
    assert.match(html, /class="brand site-footer__brand-lockup"/);
    assert.doesNotMatch(html, /\/assets\/logos\/sswordmarktm\.webp/);
    assert.match(html, /\/css\/studio-first-landing\.css/);
    assert.match(html, /\/css\/standalone-pages\.css/);
    assert.doesNotMatch(html, /\/assets\/logos\/logo\.png/);
  }
});

test("obsolete rendered Tools and Changelog pages are removed and compatibility redirects are bounded", () => {
  const files = readdirSync(root);
  assert.ok(!files.includes("tools.html"));
  assert.ok(!files.includes("changelog.html"));
  assert.ok(files.includes("roadmap.html"));

  const redirects = read("_redirects");
  for (const rule of [
    "/download /downloads/ 301",
    "/download/ /downloads/ 301",
    "/download.html /downloads/ 301",
    "/tools /downloads/ 301",
    "/tools/ /downloads/ 301",
    "/tools.html /downloads/ 301",
    "/changelog https://docs.streamsuites.app/docs/changelog 301",
    "/changelog/ https://docs.streamsuites.app/docs/changelog 301",
    "/changelog.html https://docs.streamsuites.app/docs/changelog 301"
  ]) assert.ok(redirects.split(/\r?\n/).includes(rule), `missing redirect: ${rule}`);
});

test("roadmap is a concise programme snapshot with matching visible, width, and ARIA values", () => {
  const payload = JSON.parse(read("data/roadmap.json"));
  assert.ok(Array.isArray(payload.initiatives));
  assert.ok(payload.initiatives.length >= 6 && payload.initiatives.length <= 9);
  assert.equal(new Set(payload.initiatives.map((item) => item.id)).size, payload.initiatives.length);
  for (const item of payload.initiatives) {
    assert.ok(Number.isInteger(item.percent));
    assert.ok(item.percent >= 0 && item.percent <= 100);
    assert.ok(item.title && item.description && item.phase);
  }

  const script = read("js/public-roadmap.js");
  assert.match(script, /item\.percent \+ "%"/);
  assert.match(script, /--roadmap-percent/);
  assert.match(script, /aria-valuemin", "0"/);
  assert.match(script, /aria-valuemax", "100"/);
  assert.match(script, /aria-valuenow", String\(item\.percent\)/);
  assert.match(script, /aria-valuetext", item\.percent \+ " percent"/);
  assert.match(script, /IntersectionObserver/);
  assert.match(script, /dataset\.targetPercent = String\(item\.percent\)/);
  assert.match(script, /programme\.dataset\.progressVisible = "true"/);
  assert.match(script, /prefersReducedMotion\(\)/);

  const css = read("css/standalone-pages.css");
  assert.match(css, /roadmap-program\[data-progress-visible="true"\]:hover \.roadmap-progress/);
  assert.match(css, /roadmap-progress__fill::after/);
  assert.match(css, /\.roadmap-program::before/);
  assert.match(css, /\.roadmap-program:hover::before/);
});

test("roadmap release cards link only to changelog routes present in StreamSuites Docs", () => {
  const html = read("roadmap.html");
  for (const slug of ["v0-4-0-alpha", "v0-4-2-alpha", "v0-5-0-alpha", "v0-5-4-alpha"]) {
    assert.match(html, new RegExp(`https://docs\\.streamsuites\\.app/docs/changelog/${slug}`));
  }
  assert.doesNotMatch(html, /changelog-container|public-changelog\.js|changelog-merge\.js/);
});

test("donation checkout preserves the real one-time API contract and validates whole-dollar amounts", () => {
  const html = read("donate.html");
  const script = read("js/public-donate.js");
  assert.match(html, /id="donate-checkout"/);
  assert.match(html, /id="donate-custom-amount"[^>]*min="1"[^>]*step="1"/);
  assert.match(script, /https:\/\/api\.streamsuites\.app\/billing\/donate\/session/);
  assert.match(script, /JSON\.stringify\(\{ amount: amount, source: "public" \}\)/);
  assert.match(script, /Number\.isInteger\(amount\)/);
  assert.match(script, /window\.location\.assign\(payload\.checkout_url\)/);
  for (const amount of [5, 10, 25, 50, 100, 250]) {
    assert.match(html, new RegExp(`class="button button--quiet donate-impact-select"[^>]+data-amount="${amount}"`));
  }
  for (const heading of ["Realtime compute boost", "Faster event handling", "Clip and asset retention", "Export throughput", "Monitoring and reliability", "Feature acceleration"]) {
    assert.match(html, new RegExp(heading));
  }
  for (const heading of ["Faster hosting and compute", "Clip and asset archive storage", "Bandwidth and export throughput", "Monitoring and incident tooling", "Development acceleration"]) {
    assert.match(html, new RegExp(heading));
  }
  assert.match(html, /id="donor-message"/);
  assert.match(script, /streamsuites_donor_message_draft/);
  assert.match(html + script, /will not be sent with checkout/i);
  assert.doesNotMatch(html + script, /data-recurring|subscription-plan|fake ticket number/i);
});

test("standalone hero scale and About primary CTA retain deliberate contrast", () => {
  const css = read("css/standalone-pages.css");
  assert.match(css, /\.standalone-title\s*\{[^}]*font-size: clamp\(44px, 5vw, 76px\)/s);
  assert.match(css, /\.standalone-page--about \.public-about-hero h1\s*\{[^}]*font-size: clamp\(46px, 5\.2vw, 78px\)/s);
  assert.match(css, /:not\(\.public-story-button\)/);

  const about = read("about.html");
  assert.match(about, /class="public-story-button public-story-button--primary"/);
});

test("support ticket-centre preview is stable, disabled, and has no client submission path", () => {
  const html = read("support.html");
  assert.match(html, /id="ticket-center-preview"/);
  assert.match(html, /id="support-ticket-preview-form"/);
  assert.match(html, /id="ticket-account-state"/);
  assert.match(html, /id="ticket-history-preview"/);
  assert.match(html, /<fieldset disabled/);
  assert.match(html, /type="submit" disabled/);
  assert.doesNotMatch(html, /<form[^>]+action=/);
  assert.doesNotMatch(html, /fetch\(|XMLHttpRequest|ticket number assigned/i);
  assert.match(html, /https:\/\/discord\.com\/channels\/1449303974086967306\/1449303975890260021/);
});

test("privacy policy date and section anchors remain intact", () => {
  const html = read("privacy.html");
  assert.match(html, /Last updated:<\/strong> February 22, 2026/);
  const ids = ["definitions-scope", "information-we-collect", "creator-analytics-stats", "livechat-logging-replay", "how-we-use-information", "oauth-platform-connections", "cookies-sessions", "legal-bases", "third-party-providers", "data-sharing", "end-users-audience", "international-transfers", "retention-deletion", "security", "rights-choices", "children", "policy-updates", "contact"];
  for (const id of ids) {
    assert.match(html, new RegExp(`id="${id}"`));
    assert.match(html, new RegExp(`href="#${id}"`));
  }
});

test("live public HTML and shell code no longer link to obsolete public routes", () => {
  const excludedDirectories = new Set([".git", ".wrangler", "node_modules", "changelog", "sspoc1"]);
  const excludedFiles = new Set(["BUMP_NOTES.md", "README.md", "_redirects", "index-old.html"]);
  const stale = [];

  function visit(path) {
    for (const name of readdirSync(path)) {
      if (excludedDirectories.has(name)) continue;
      const absolute = join(path, name);
      const relative = absolute.slice(rootPath.length).replaceAll("\\", "/");
      if (statSync(absolute).isDirectory()) visit(absolute);
      else if (!excludedFiles.has(name) && /\.(?:html|js)$/.test(name)) {
        const contents = readFileSync(absolute, "utf8");
        if (/href=["']\/tools(?:\.html)?\/?["']|href=["']\/changelog(?:\.html)?\/?["']/.test(contents)) stale.push(relative);
      }
    }
  }

  visit(rootPath);
  assert.deepEqual(stale, []);
});
