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
  const index = read("downloads/index.html");
  const studio = read("downloads/studioapp/index.html");
  const obs = read("downloads/obs-plugin/index.html");
  const extensions = read("downloads/studioapp/extensions/index.html");
  const displayFontHash = crypto.createHash("sha256").update(fs.readFileSync(path.join(root, "assets/fonts/Tektur-VariableFont_wdth,wght.ttf"))).digest("hex");
  const bodyFontHash = crypto.createHash("sha256").update(fs.readFileSync(path.join(root, "assets/fonts/body/Blinker-Regular.ttf"))).digest("hex");
  const monoFontHash = crypto.createHash("sha256").update(fs.readFileSync(path.join(root, "assets/fonts/mono/IBMPlexMono-Regular.ttf"))).digest("hex");
  const studioIconHash = crypto.createHash("sha256").update(fs.readFileSync(path.join(root, "assets/logos/studiologo3.webp"))).digest("hex");
  const obsExtensionIconHash = crypto.createHash("sha256").update(fs.readFileSync(path.join(root, "assets/icons/icon-obsextension.webp"))).digest("hex");

  assert.equal(displayFontHash, "1ff1792ecc4728cf011d31e43a53a5c97e82f5c7cc7b9f23af24b209106e962c");
  assert.equal(bodyFontHash, "17a43fd073fec5375570ec55f768ce4a404f918cc5a3d33e3912630248ed5ab2");
  assert.equal(monoFontHash, "ab08018ccd276b79fb2c636bb95b9c543598f9d50505fe92506fcb4dae7810cd");
  assert.equal(studioIconHash, "43c28a45fbabc4a710c4dad151ecd33952fa823c5a2e17d615343f1c6bf7a786");
  assert.equal(obsExtensionIconHash, "d2ba2fb6f3ec6ecc3888d39f2c7595707e65a5c455852c7fe7a0c64a254fbed5");
  assert.match(shared, /@import url\("\/css\/public-fonts\.css"\)/);
  assert.match(shared, /--download-font-body:\s*var\(--public-font-body\)/);
  assert.match(shared, /--download-font-display:\s*var\(--public-font-display\)/);
  assert.match(shared, /--download-font-mono:\s*var\(--public-font-mono\)/);
  assert.match(fonts, /font-family:\s*"Tektur"/);
  assert.match(fonts, /font-family:\s*"Blinker"/);
  assert.match(fonts, /font-family:\s*"IBM Plex Mono"/);
  assert.doesNotMatch(shared, /SuiGeneris|Recharge/);
  [index, studio, obs, extensions].forEach((html) => {
    assert.match(html, /\/css\/download-surface\.css/);
    assert.match(html, /aria-label="Studio downloads"/);
    assert.match(html, /prefers-reduced-motion|download-surface\.css/);
  });
  assert.match(index, /<link rel="icon" href="\/favicon\.ico"/);
  assert.match(index, /<img src="\/assets\/logos\/ssmainlogosq\.webp" alt="" width="52" height="52" \/>/);
  [studio, obs, extensions].forEach((html) => assert.match(html, /<link rel="icon" href="\/assets\/icons\/studiofavicon\.ico"/));
  [studio, obs, extensions].forEach((html) => assert.doesNotMatch(html, /SuiGeneris-Regular|Recharge-Bold/));
  assert.match(studio, /<img src="\/assets\/logos\/studiologo3\.webp" alt="" width="52" height="52" \/>/);
  assert.match(studio, /<img src="\/assets\/icons\/packboxicon-plugin\.webp" alt="StreamSuites Plugin Store" width="44" height="44" \/>/);
  assert.match(obs, /<img src="\/assets\/icons\/icon-obsextension\.webp" alt="" width="52" height="52" \/>/);
  assert.match(obs, /<img src="\/assets\/logos\/studiologo3\.webp" alt="" width="38" height="38" \/>/);
  assert.match(obs, /<img src="\/assets\/logos\/studiologo3\.webp" alt="" \/>/);
  assert.match(extensions, /<img src="\/assets\/icons\/packboxicon-plugin\.webp" alt="StreamSuites Plugin Store" width="52" height="52" \/>/);
  assert.match(extensions, /<img src="\/assets\/logos\/studiologo3\.webp" alt="StreamSuites StudioApp" width="44" height="44" \/>/);
  assert.doesNotMatch(extensions, /<img src="\/assets\/logos\/studiologo3\.webp" alt="StreamSuites Plugin Store"/);
  assert.match(index, /download-index-visual__node--obs[\s\S]*?<img src="\/assets\/icons\/icon-obsextension\.webp"/);
  assert.match(index, /download-index-card--obs[\s\S]*?<img src="\/assets\/icons\/icon-obsextension\.webp"/);
  assert.match(studio, /<img src="\/assets\/icons\/icon-obsextension\.webp" alt="" \/>[\s\S]*?<h3>StreamSuites Studio for OBS<\/h3>/);
  assert.match(extensions, /<img src="\/assets\/icons\/icon-obsextension\.webp" alt="" \/><div><h3>StreamSuites Studio for OBS<\/h3>/);
  assert.match(obs, /obs-preview__node--obs"><img src="\/assets\/icons\/obs-white\.svg" alt="" \/><strong>OBS-owned output<\/strong>/);
});

test("download polish uses feature accents, supplied platform icons, and truthful coming-soon scaffolds", () => {
  const shared = read("css/download-surface.css");
  const index = read("downloads/index.html");
  const indexCss = read("css/download-index.css");
  const studio = read("downloads/studioapp/index.html");
  const studioCss = read("css/studioapp-download.css");
  const obs = read("downloads/obs-plugin/index.html");
  const obsCss = read("css/obs-plugin-download.css");
  const extensions = read("downloads/studioapp/extensions/index.html");
  const extensionsCss = read("css/studioapp-extensions.css");

  assert.match(shared, /\.download-hero h1[\s\S]*linear-gradient[\s\S]*background-clip:\s*text/);
  assert.match(shared, /url\("\/assets\/icons\/windows-0\.svg"\)/);
  assert.match(shared, /url\("\/assets\/icons\/obs-0\.svg"\)/);
  assert.match(shared, /url\("\/assets\/icons\/apple-0\.svg"\)/);
  assert.match(shared, /url\("\/assets\/icons\/linux-0\.svg"\)/);
  assert.match(shared, /color:\s*var\(--download-primary-ink\)/);
  assert.match(shared, /\.download-product-nav a\[aria-current="page"\][\s\S]*border-color:\s*rgba\(140, 199, 54, 0\.34\)/);
  assert.match(indexCss, /body\.download-index-page \.download-product-nav a\[aria-current="page"\][\s\S]*border-color:\s*rgba\(80, 168, 255, 0\.38\)/);
  assert.match(obsCss, /body\.obs-plugin-download-page \.download-product-nav a\[aria-current="page"\][\s\S]*border-color:\s*rgba\(140, 124, 255, 0\.38\)/);
  assert.match(extensionsCss, /body\.studioapp-extensions-page \.download-product-nav a\[aria-current="page"\][\s\S]*border-color:\s*rgba\(80, 168, 255, 0\.38\)/);
  assert.match(studio, /download-button--windows/);
  assert.match(studio, /StudioApp for macOS/);
  assert.match(studio, /download-button--apple[^>]*disabled/);
  assert.match(studio, /StudioApp for Linux/);
  assert.match(studio, /download-button--linux[^>]*disabled/);
  assert.match(studio, /Free storage greater than the published installer size/);
  assert.match(studio, /Minimum install storage is not yet published/);
  assert.doesNotMatch(studio, /(?:macOS|Linux)[\s\S]{0,300}href="[^"]+\.(?:dmg|pkg|app|deb|rpm|AppImage)"/i);
  assert.match(obs, /download-button--obs/);
  assert.match(obs, /minimum install storage are not yet published/i);
  assert.match(extensions, /There is no standalone directory installer/);
  assert.match(studio, /class="studioapp-preview__title-icon" aria-hidden="true"/);
  assert.doesNotMatch(studio, /studioapp-preview__title"><img[^>]+streamsuites-0\.svg/);
  assert.match(studioCss, /\.studioapp-preview__title-icon\s*\{[\s\S]*color:\s*#b4ef5b;[\s\S]*icondiag-studioapp\.svg/);
  assert.match(obs, /class="obs-preview__title-icon" aria-hidden="true"/);
  assert.match(obsCss, /\.obs-preview__title-icon\s*\{[\s\S]*color:\s*var\(--download-accent-bright\);[\s\S]*icondiag-studioapp\.svg/);
  assert.doesNotMatch(obsCss, /\.obs-preview__title-icon\s*\{[\s\S]*?obs-0\.svg[\s\S]*?\}/);
  assert.match(extensions, /class="extensions-preview__title-icon" aria-hidden="true"/);
  assert.match(extensionsCss, /\.extensions-preview__title-icon\s*\{[\s\S]*color:\s*var\(--download-accent-bright\);[\s\S]*icondiag-studioapp\.svg/);
  assert.match(studio, /\/css\/studioapp-download\.css\?v=20260806-diagram-title-icons/);
  [index, obs, extensions].forEach((html) => assert.match(html, /\?v=20260806-active-nav-color/));
});

test("downloads index is searchable, routed, and links only to truthful product surfaces", () => {
  const html = read("downloads/index.html");
  const css = read("css/download-index.css");
  const client = read("js/download-index.js");
  const redirects = read("_redirects");

  assert.match(html, /id="download-index-search"/);
  assert.match(html, /id="download-index-count"[^>]*role="status" aria-live="polite"/);
  assert.equal((html.match(/data-download-card/g) || []).length, 3);
  assert.match(html, /href="\/downloads\/studioapp\/"/);
  assert.match(html, /href="\/downloads\/obs-plugin\/"/);
  assert.match(html, /href="\/downloads\/studioapp\/extensions\/"/);
  assert.match(html, /Browser Studio stays in the browser/);
  assert.doesNotMatch(html + client, /href="[^"]+\.(?:exe|zip|msi|dmg|pkg|deb|rpm)"/i);
  assert.match(client, /URLSearchParams|searchParams/);
  assert.match(client, /card\.hidden/);
  assert.match(css, /\.download-index-visual/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(redirects, /\/downloads \/downloads\/index\.html 200/);
  assert.match(redirects, /\/downloads\/ \/downloads\/index\.html 200/);
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
