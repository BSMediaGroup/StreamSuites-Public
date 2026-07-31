import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

test("download routes use the approved Public typography and retain authoritative product marks", () => {
  const shared = read("css/download-surface.css");
  const fonts = read("css/public-fonts.css");
  const studio = read("downloads/studioapp/index.html");
  const obs = read("downloads/obs-plugin/index.html");
  const extensions = read("downloads/studioapp/extensions/index.html");
  const displayFontHash = crypto.createHash("sha256").update(fs.readFileSync(path.join(root, "assets/fonts/Tektur-VariableFont_wdth,wght.ttf"))).digest("hex");
  const bodyFontHash = crypto.createHash("sha256").update(fs.readFileSync(path.join(root, "assets/fonts/Geist-Regular.ttf"))).digest("hex");
  const monoFontHash = crypto.createHash("sha256").update(fs.readFileSync(path.join(root, "assets/fonts/mono/IBMPlexMono-Regular.ttf"))).digest("hex");
  const studioIconHash = crypto.createHash("sha256").update(fs.readFileSync(path.join(root, "assets/logos/studiologo3.webp"))).digest("hex");

  assert.equal(displayFontHash, "1ff1792ecc4728cf011d31e43a53a5c97e82f5c7cc7b9f23af24b209106e962c");
  assert.equal(bodyFontHash, "cf1737280af17d036786e06d0eb49b2ce83fc303169a0a438c3f4b2f80ee8e06");
  assert.equal(monoFontHash, "ab08018ccd276b79fb2c636bb95b9c543598f9d50505fe92506fcb4dae7810cd");
  assert.equal(studioIconHash, "43c28a45fbabc4a710c4dad151ecd33952fa823c5a2e17d615343f1c6bf7a786");
  assert.match(shared, /@import url\("\/css\/public-fonts\.css"\)/);
  assert.match(shared, /--download-font-body:\s*var\(--public-font-body\)/);
  assert.match(shared, /--download-font-display:\s*var\(--public-font-display\)/);
  assert.match(shared, /--download-font-mono:\s*var\(--public-font-mono\)/);
  assert.match(fonts, /font-family:\s*"Tektur"/);
  assert.match(fonts, /font-family:\s*"Geist Sans"/);
  assert.match(fonts, /font-family:\s*"IBM Plex Mono"/);
  assert.doesNotMatch(shared, /SuiGeneris|Recharge/);
  [studio, obs, extensions].forEach((html) => {
    assert.match(html, /\/css\/download-surface\.css/);
    assert.match(html, /aria-label="Studio downloads"/);
    assert.match(html, /prefers-reduced-motion|download-surface\.css/);
  });
  assert.match(studio, /<img src="\/assets\/logos\/studiologo3\.webp" alt="" width="52" height="52" \/>/);
  assert.match(studio, /<img src="\/assets\/icons\/packboxicon-plugin\.webp" alt="StreamSuites Plugin Store" width="44" height="44" \/>/);
  assert.match(obs, /<img src="\/assets\/icons\/obs-white\.svg" alt="" width="52" height="52" \/>/);
  assert.match(obs, /<img src="\/assets\/logos\/studiologo3\.webp" alt="" width="38" height="38" \/>/);
  assert.match(obs, /<img src="\/assets\/logos\/studiologo3\.webp" alt="" \/>/);
  assert.match(extensions, /<img src="\/assets\/icons\/packboxicon-plugin\.webp" alt="StreamSuites Plugin Store" width="52" height="52" \/>/);
  assert.match(extensions, /<img src="\/assets\/logos\/studiologo3\.webp" alt="StreamSuites StudioApp" width="44" height="44" \/>/);
  assert.doesNotMatch(extensions, /<img src="\/assets\/logos\/studiologo3\.webp" alt="StreamSuites Plugin Store"/);
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
  assert.match(client, /\/api\/downloads\/studioapp\/release/);
  assert.match(client, /controlled_download_url/);
  assert.doesNotMatch(html + client, /DOWNLOAD_BYPASS_CODE/);
  assert.doesNotMatch(html, /updates\.streamsuites\.app\/studioapp\/windows-x64\/releases/);
  assert.doesNotMatch(html, /\b20\d{2}\.\d{2}\.\d{2}\+\d+\b/);
});
