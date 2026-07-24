import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

test("download routes share Browser Studio typography and the authoritative Studio mark", () => {
  const shared = read("css/download-surface.css");
  const studio = read("downloads/studioapp/index.html");
  const obs = read("downloads/obs-plugin/index.html");
  const extensions = read("downloads/studioapp/extensions/index.html");
  const studioFontHash = crypto.createHash("sha256").update(fs.readFileSync(path.join(root, "assets/fonts/SuiGeneris-Regular.otf"))).digest("hex");
  const displayFontHash = crypto.createHash("sha256").update(fs.readFileSync(path.join(root, "assets/fonts/Recharge-Bold.otf"))).digest("hex");
  const studioIconHash = crypto.createHash("sha256").update(fs.readFileSync(path.join(root, "assets/logos/studiologo3.webp"))).digest("hex");

  assert.equal(studioFontHash, "39b21df023a5833e2d891a5c0d72703db4306b9008c0d44d4dc01f2350c71964");
  assert.equal(displayFontHash, "1faa8af96c598f49d2e6791de161f7845379197c1d36c489cd39ad548550ef1f");
  assert.equal(studioIconHash, "43c28a45fbabc4a710c4dad151ecd33952fa823c5a2e17d615343f1c6bf7a786");
  assert.match(shared, /--download-font-body:\s*"Sui Generis"/);
  assert.match(shared, /--download-font-display:\s*"Recharge"/);
  [studio, obs, extensions].forEach((html) => {
    assert.match(html, /\/css\/download-surface\.css/);
    assert.match(html, /\/assets\/logos\/studiologo3\.webp/);
    assert.match(html, /aria-label="Studio downloads"/);
    assert.match(html, /prefers-reduced-motion|download-surface\.css/);
  });
});

test("OBS route is a truthful unavailable product scaffold with required cross-links", () => {
  const html = read("downloads/obs-plugin/index.html");
  const redirects = read("_redirects");
  assert.match(html, /StreamSuites Studio for OBS/);
  assert.match(html, /In development/i);
  assert.match(html, /Download not yet available/);
  assert.match(html, /not an OBS fork/i);
  assert.match(html, /OBS retains its media pipeline|OBS retains ownership/i);
  assert.match(html, /Runtime\/Auth remains authoritative/);
  assert.match(html, /href="\/downloads\/studioapp\/"/);
  assert.match(html, /href="\/downloads\/studioapp\/extensions\/"/);
  assert.doesNotMatch(html, /href="[^"]+\.(?:exe|zip|msi)"/i);
  assert.doesNotMatch(html, /\bversion\s+\d+\.\d+\.\d+/i);
  assert.doesNotMatch(html, /\brelease(?:d)?\s+(?:on\s+)?\d{4}-\d{2}-\d{2}/i);
  assert.doesNotMatch(html, /OBS\s+\d+\.\d+(?:\.\d+)?/);
  assert.match(redirects, /\/downloads\/obs-plugin \/downloads\/obs-plugin\/index\.html 200/);
  assert.match(redirects, /\/downloads\/obs-plugin\/ \/downloads\/obs-plugin\/index\.html 200/);
});

test("StudioApp surface preserves dynamic release and gate hooks without live values", () => {
  const html = read("downloads/studioapp/index.html");
  const client = read("js/studioapp-download.js");
  for (const id of [
    "download-lockout-banner",
    "download-access-modal",
    "download-bypass-form",
    "studioapp-download-action",
    "release-download-action",
    "release-version",
    "release-build",
    "release-system-version",
    "release-system-build",
    "release-size",
    "release-published",
    "release-signature",
    "release-sha",
    "copy-release-sha",
  ]) assert.match(html, new RegExp(`id="${id}"`));
  assert.match(client, /\/api\/downloads\/studioapp\/access-state/);
  assert.match(client, /\/api\/downloads\/studioapp\/unlock/);
  assert.match(client, /\/api\/downloads\/studioapp\/lock/);
  assert.match(client, /\/api\/downloads\/studioapp\/latest/);
  assert.match(client, /\?metadata=1/);
  assert.doesNotMatch(html + client, /DOWNLOAD_BYPASS_CODE/);
  assert.doesNotMatch(html, /updates\.streamsuites\.app\/studioapp\/windows-x64\/releases/);
  assert.doesNotMatch(html, /\b20\d{2}\.\d{2}\.\d{2}\+\d+\b/);
});
