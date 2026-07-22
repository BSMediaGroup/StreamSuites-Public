import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const gateSource = read("functions/_shared/studioapp-download-gate.js");
const gate = await import(`data:text/javascript;base64,${Buffer.from(gateSource).toString("base64")}`);
const secret = "test-only-bypass-value";
const configEnv = {
  DOWNLOAD_ACCESS_LOCKED: "true",
  DOWNLOAD_ACCESS_MESSAGE: "Approved testers only.",
  DOWNLOAD_BYPASS_ENABLED: "true",
  DOWNLOAD_BYPASS_CODE: secret,
  DOWNLOAD_BYPASS_TTL_MINUTES: "15",
  SHOW_DOWNLOAD_LOCKOUT_BANNER: "true",
};

test("download configuration is bounded and fails closed when locked", () => {
  const unlocked = gate.readDownloadAccessConfig({ DOWNLOAD_ACCESS_LOCKED: "false" });
  assert.equal(unlocked.locked, false);
  const locked = gate.readDownloadAccessConfig(configEnv);
  assert.equal(locked.locked, true); assert.equal(locked.bypassEnabled, true); assert.equal(locked.ttlMinutes, 15); assert.equal(locked.showBanner, true);
  assert.equal(gate.readDownloadAccessConfig({ ...configEnv, DOWNLOAD_BYPASS_TTL_MINUTES: "999" }).ttlMinutes, 15);
  assert.equal(gate.readDownloadAccessConfig({ ...configEnv, DOWNLOAD_BYPASS_CODE: "" }).locked, true);
});

test("signed HttpOnly access cookie expires and rejects tampering", async () => {
  const config = gate.readDownloadAccessConfig(configEnv);
  const now = Date.UTC(2026, 6, 22, 10, 0, 0);
  const cookie = await gate.createAccessCookie(config, now);
  assert.match(cookie.header, /HttpOnly/); assert.match(cookie.header, /Secure/); assert.match(cookie.header, /SameSite=Lax/); assert.match(cookie.header, /Max-Age=900/);
  assert.doesNotMatch(cookie.header, new RegExp(secret));
  const pair = cookie.header.split(";")[0];
  const request = new Request("https://streamsuites.app/api/downloads/studioapp/access-state", { headers: { Cookie: pair } });
  assert.equal(await gate.verifyAccessCookie(request, config, now + 1000), true);
  const tampered = new Request(request.url, { headers: { Cookie: `${pair.slice(0, -1)}x` } });
  assert.equal(await gate.verifyAccessCookie(tampered, config, now + 1000), false);
  assert.equal(await gate.verifyAccessCookie(request, config, now + 16 * 60 * 1000), false);
  const rotated = gate.readDownloadAccessConfig({ ...configEnv, DOWNLOAD_BYPASS_CODE: "rotated-test-secret" });
  assert.equal(await gate.verifyAccessCookie(request, rotated, now + 1000), false);
});

test("bypass comparison is constant-shape and bounded request parsing rejects oversized input", async () => {
  assert.equal(await gate.safeCodeEqual(secret, secret), true);
  assert.equal(await gate.safeCodeEqual("wrong", secret), false);
  const valid = new Request("https://streamsuites.app/api/downloads/studioapp/unlock", { method: "POST", body: JSON.stringify({ code: "tester" }) });
  assert.equal(await gate.readBoundedCode(valid), "tester");
  const oversized = new Request(valid.url, { method: "POST", body: JSON.stringify({ code: "x".repeat(300) }) });
  await assert.rejects(() => gate.readBoundedCode(oversized), /invalid_request/);
  assert.throws(() => gate.assertSameOrigin(new Request(valid.url, { method: "POST" })), /missing_origin/);
  assert.doesNotThrow(() => gate.assertSameOrigin(new Request(valid.url, { method: "POST", headers: { Origin: "https://streamsuites.app" } })));
  assert.throws(() => gate.assertSameOrigin(new Request(valid.url, { method: "POST", headers: { Origin: "https://example.com" } })), /cross_origin_request/);
});

test("manifest validation accepts only the canonical product channel architecture host and filename", async () => {
  const valid = {
    schema_version: 1, product: "StreamSuites StudioApp", channel: "alpha", architecture: "windows-x64",
    version: "0.5.0-alpha", build: "TEST-001", installer_filename: "StreamSuites-StudioApp-test-setup.exe",
    installer_url: "https://updates.streamsuites.app/studioapp/windows-x64/releases/test/StreamSuites-StudioApp-test-setup.exe",
    installer_size: 1234, installer_sha256: "a".repeat(64), published_at: "2026-07-22T00:00:00Z", signed: false,
  };
  const responseFor = (payload, headers = { "Content-Type": "application/json" }) => async () => new Response(JSON.stringify(payload), { status: 200, headers });
  const release = await gate.fetchValidatedManifest(responseFor(valid));
  assert.equal(release.publicMetadata.version, valid.version); assert.equal(release.installerUrl, valid.installer_url);
  const current = { ...valid, schema_version: 2, product_id: "streamsuites-studioapp", build: "2026.07.22+007", system_version: "0.5.0-alpha", system_build: "2026.07.22+006", package_provenance_version: 2 };
  const currentRelease = await gate.fetchValidatedManifest(responseFor(current));
  assert.equal(currentRelease.publicMetadata.product_id, "streamsuites-studioapp");
  assert.equal(currentRelease.publicMetadata.system_build, "2026.07.22+006");
  await assert.rejects(() => gate.fetchValidatedManifest(responseFor({ ...current, product_id: "other-product" })), /manifest_invalid/);
  await assert.rejects(() => gate.fetchValidatedManifest(responseFor({ ...valid, product_id: "other-product" })), /manifest_invalid/);
  for (const mutation of [
    { product: "Other" }, { channel: "stable" }, { architecture: "arm64" },
    { installer_url: "http://updates.streamsuites.app/a.exe" },
    { installer_url: "https://example.com/StreamSuites-StudioApp-test-setup.exe" },
    { installer_filename: "../unsafe.exe" }, { installer_sha256: "bad" }, { installer_size: 0 },
    { installer_url: "https://updates.streamsuites.app/uncontrolled/setup.exe", installer_filename: "setup.exe" },
  ]) await assert.rejects(() => gate.fetchValidatedManifest(responseFor({ ...valid, ...mutation })), /manifest_invalid/);
  await assert.rejects(() => gate.fetchValidatedManifest(async () => new Response("bad", { status: 502 })), /manifest_unavailable/);
  await assert.rejects(() => gate.fetchValidatedManifest(responseFor(valid, { "Content-Type": "text/html" })), /manifest_invalid/);
});

test("product manifest is preferred and the deployed legacy path remains a bounded fallback", async () => {
  const product = {
    schema_version: 2, product_id: "streamsuites-studioapp", product: "StreamSuites StudioApp", channel: "alpha", architecture: "windows-x64",
    version: "0.2.4-alpha", build: "2026.07.23+001", installer_filename: "StreamSuites-StudioApp-0.2.4-alpha-windows-x64-setup.exe",
    installer_url: "https://updates.streamsuites.app/studioapp/windows-x64/releases/0.2.4-alpha/2026.07.23_2b001/StreamSuites-StudioApp-0.2.4-alpha-windows-x64-setup.exe",
    installer_size: 42, installer_sha256: "a".repeat(64), published_at: "2026-07-23T00:00:00Z", signed: false,
    system_version: "0.5.0-alpha", system_build: "2026.07.22+007", package_provenance_version: 2,
  };
  const productUrls = [];
  const preferred = await gate.fetchValidatedManifest(async (url) => { productUrls.push(url); return new Response(JSON.stringify(product), { status: 200, headers: { "Content-Type": "application/json" } }); });
  assert.equal(preferred.publicMetadata.version, "0.2.4-alpha"); assert.equal(preferred.publicMetadata.manifest_source, "product"); assert.equal(productUrls.length, 1);
  const legacy = { ...product, schema_version: 1, product_id: undefined, version: "0.5.0-alpha", installer_url: "https://updates.streamsuites.app/studioapp/windows-x64/releases/0.5.0-alpha/2026.07.23_2b001/StreamSuites-StudioApp-0.2.4-alpha-windows-x64-setup.exe" };
  const fallbackUrls = [];
  const fallback = await gate.fetchValidatedManifest(async (url) => { fallbackUrls.push(url); return fallbackUrls.length === 1 ? new Response("missing", { status: 404 }) : new Response(JSON.stringify(legacy), { status: 200, headers: { "Content-Type": "application/json" } }); });
  assert.equal(fallback.publicMetadata.manifest_source, "legacy"); assert.equal(fallbackUrls.length, 2);
});

test("static download route reuses access visuals, contains no secret, and exposes no raw installer URL", () => {
  const html = read("downloads/studioapp/index.html");
  const client = read("js/studioapp-download.js");
  const css = read("css/studioapp-download.css");
  const redirects = read("_redirects");
  assert.match(html, /auth-modal-backdrop/); assert.match(html, /public-lockout-banner/); assert.match(html, /ss-auth-access-gate/);
  assert.match(html, /\/assets\/icons\/ui\/streamsuitesicon\.svg/);
  assert.ok(fs.statSync(path.join(root, "assets/icons/ui/streamsuitesicon.svg")).size > 0);
  assert.match(html, /aria-modal="true"/); assert.match(html, /aria-live="polite"/); assert.match(html, /prefers-reduced-motion|studioapp-download\.css/);
  assert.match(html, /StudioApp version/); assert.match(html, /System compatibility/);
  assert.match(css, /prefers-reduced-motion:reduce/); assert.match(css, /forced-colors:active/); assert.match(css, /@media\(max-width:620px\)/);
  assert.match(redirects, /\/downloads\/studioapp \/downloads\/studioapp\/index\.html 200/);
  assert.doesNotMatch(html, /https:\/\/updates\.streamsuites\.app\/studioapp\/windows-x64\/releases\//);
  assert.doesNotMatch(html + client, /DOWNLOAD_BYPASS_CODE|test-only-bypass-value/);
  assert.match(client, /sessionStorage\.setItem\(BANNER_KEY/); assert.match(client, /accessState\.authorized = false/);
});

test("Pages Function routes keep the bypass code server-side and normal downloads controlled", () => {
  const access = read("functions/api/downloads/studioapp/access-state.js");
  const unlock = read("functions/api/downloads/studioapp/unlock.js");
  const latest = read("functions/api/downloads/studioapp/latest.js");
  assert.doesNotMatch(access, /bypass_code\s*:/i);
  assert.match(access, /bypass_enabled:\s*config\.bypassEnabled\s*&&\s*Boolean\(config\.bypassCode\)/);
  assert.match(unlock, /readBoundedCode/); assert.match(unlock, /safeCodeEqual/); assert.match(unlock, /Set-Cookie/);
  assert.match(latest, /verifyAccessCookie/); assert.match(latest, /fetchValidatedManifest/); assert.match(latest, /status: 302/);
  assert.doesNotMatch(latest, /updates\.streamsuites\.app/);
});
