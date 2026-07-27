import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const gateSource = read("functions/_shared/studioapp-download-gate.js");
const gateModuleUrl = `data:text/javascript;base64,${Buffer.from(gateSource).toString("base64")}`;
const gate = await import(gateModuleUrl);
const PRODUCT_KEY = "studioapp/windows-x64/alpha/product-manifest.json";
const LEGACY_KEY = "studioapp/windows-x64/alpha/manifest.json";
const importFunction = async (relative) => {
  const source = read(relative).replace(
    /["']\.\.\/\.\.\/\.\.\/_shared\/studioapp-download-gate\.js["']/,
    JSON.stringify(gateModuleUrl),
  );
  return import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}#${encodeURIComponent(relative)}`);
};
const secret = "test-only-bypass-value";
const configEnv = {
  DOWNLOAD_ACCESS_LOCKED: "true",
  DOWNLOAD_ACCESS_MESSAGE: "Approved testers only.",
  DOWNLOAD_BYPASS_ENABLED: "true",
  DOWNLOAD_BYPASS_CODE: secret,
  DOWNLOAD_BYPASS_TTL_MINUTES: "15",
  SHOW_DOWNLOAD_LOCKOUT_BANNER: "true",
};
const currentManifest = {
  schema_version: 2,
  product_id: "streamsuites-studioapp",
  product: "StreamSuites StudioApp",
  channel: "alpha",
  version: "0.2.4-alpha",
  build: "2026.07.27+001",
  system_version: "0.5.4-alpha",
  system_build: "2026.07.27+003",
  source_revision: "036646be4e29bc3f3bfbfedd8b62cb39382dd091",
  package_provenance_version: 2,
  product_version_epoch: 1,
  published_at: "2026-07-27T18:25:16.2849697+10:00",
  installer_url: "https://updates.streamsuites.app/studioapp/windows-x64/releases/0.2.4-alpha/2026.07.27_2b001/StreamSuites-StudioApp-0.2.4-alpha-windows-x64-setup.exe",
  installer_filename: "StreamSuites-StudioApp-0.2.4-alpha-windows-x64-setup.exe",
  installer_size: 58257989,
  installer_sha256: "982f1fcdd3b1bbd51a55cf94147c0bb970102039c903c69c52663277f5d40d8f",
  signed: false,
  signature_subject: null,
  architecture: "windows-x64",
  title: "StreamSuites StudioApp 0.2.4-alpha ALPHA",
  summary: "StreamSuites StudioApp 0.2.4-alpha (2026.07.27+001) for Windows x64.",
};
const legacyManifest = {
  ...currentManifest,
  schema_version: 1,
  product_id: undefined,
  version: "0.5.0-alpha",
  installer_url: "https://updates.streamsuites.app/studioapp/windows-x64/releases/0.5.0-alpha/2026.07.27_2b001/StreamSuites-StudioApp-0.2.4-alpha-windows-x64-setup.exe",
};
const json = (payload, status = 200) => new Response(JSON.stringify(payload), { status, headers: { "Content-Type": "application/json" } });
const r2Object = (payload, size = null) => {
  const bytes = new TextEncoder().encode(typeof payload === "string" ? payload : JSON.stringify(payload));
  return {
    size: size ?? bytes.byteLength,
    async arrayBuffer() { return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength); },
  };
};
const fakeR2 = (entries = {}, readErrors = []) => ({
  async get(key) {
    if (readErrors.includes(key)) throw new Error("test-only R2 read failure");
    return Object.hasOwn(entries, key) ? entries[key] : null;
  },
});
const withR2 = (env, product = currentManifest) => ({
  ...env,
  STREAMSUITES_UPDATES_BUCKET: fakeR2({ [PRODUCT_KEY]: r2Object(product) }),
});

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
    installer_url: "https://updates.streamsuites.app/studioapp/windows-x64/releases/0.5.0-alpha/TEST-001/StreamSuites-StudioApp-test-setup.exe",
    installer_size: 1234, installer_sha256: "a".repeat(64), published_at: "2026-07-22T00:00:00Z", signed: false,
  };
  const responseFor = (payload, headers = { "Content-Type": "application/json" }) => async () => new Response(JSON.stringify(payload), { status: 200, headers });
  const release = await gate.fetchValidatedManifest(responseFor(valid));
  assert.equal(release.publicMetadata.version, valid.version); assert.equal(release.installerUrl, valid.installer_url);
  const current = {
    ...valid,
    schema_version: 2,
    product_id: "streamsuites-studioapp",
    build: "2026.07.22+007",
    installer_url: "https://updates.streamsuites.app/studioapp/windows-x64/releases/0.5.0-alpha/2026.07.22_2b007/StreamSuites-StudioApp-test-setup.exe",
    system_version: "0.5.0-alpha",
    system_build: "2026.07.22+006",
    package_provenance_version: 2,
  };
  const currentRelease = await gate.fetchValidatedManifest(responseFor(current));
  assert.equal(currentRelease.publicMetadata.product_id, "streamsuites-studioapp");
  assert.equal(currentRelease.publicMetadata.system_build, "2026.07.22+006");
  await assert.rejects(() => gate.fetchValidatedManifest(responseFor({ ...current, product_id: "other-product" })), /manifest_/);
  await assert.rejects(() => gate.fetchValidatedManifest(responseFor({ ...valid, product_id: "other-product" })), /manifest_/);
  for (const mutation of [
    { product: "Other" }, { channel: "stable" }, { architecture: "arm64" },
    { installer_url: "http://updates.streamsuites.app/a.exe" },
    { installer_url: "https://example.com/StreamSuites-StudioApp-test-setup.exe" },
    { installer_filename: "../unsafe.exe" }, { installer_sha256: "bad" }, { installer_size: 0 },
    { installer_url: "https://updates.streamsuites.app/uncontrolled/setup.exe", installer_filename: "setup.exe" },
  ]) await assert.rejects(() => gate.fetchValidatedManifest(responseFor({ ...valid, ...mutation })), /manifest_/);
  await assert.rejects(() => gate.fetchValidatedManifest(async () => new Response("bad", { status: 502 })), /product_manifest_http_status/);
  await assert.rejects(() => gate.fetchValidatedManifest(responseFor(valid, { "Content-Type": "text/html" })), /manifest_/);
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

test("current schema-v2 product release projects exact public metadata while locked", async () => {
  const release = await gate.fetchValidatedManifest(async () => json(currentManifest));
  assert.equal(release.publicMetadata.version, "0.2.4-alpha");
  assert.equal(release.publicMetadata.build, "2026.07.27+001");
  assert.equal(release.publicMetadata.release_epoch, 1);
  assert.equal(release.publicMetadata.installer_size, 58257989);
  assert.equal(release.publicMetadata.installer_sha256, currentManifest.installer_sha256);
  assert.equal(release.publicMetadata.signature, "Unsigned ALPHA");
  const locked = gate.projectPublicRelease(release, gate.readDownloadAccessConfig(configEnv), false);
  assert.equal(locked.available, true);
  assert.equal(locked.access_locked, true);
  assert.equal(locked.download_available, false);
  assert.equal(Object.hasOwn(locked, "installer_url"), false);
  assert.match(locked.controlled_download_url, /version=0\.2\.4-alpha&build=2026\.07\.27%2B001/);
  const unlocked = gate.projectPublicRelease(release, gate.readDownloadAccessConfig(configEnv), true);
  assert.equal(unlocked.access_locked, false);
  assert.equal(unlocked.download_available, true);
});

test("manifest fallback is limited to unavailable or unsupported product contracts", async () => {
  let calls = 0;
  const unavailable = await gate.fetchValidatedManifest(async () => {
    calls += 1;
    return calls === 1 ? json({ error: "missing" }, 404) : json(legacyManifest);
  });
  assert.equal(unavailable.publicMetadata.manifest_source, "legacy");
  calls = 0;
  const unsupported = await gate.fetchValidatedManifest(async () => {
    calls += 1;
    return calls === 1 ? json({ ...currentManifest, schema_version: 3 }) : json(legacyManifest);
  });
  assert.equal(unsupported.publicMetadata.manifest_source, "legacy");
  calls = 0;
  await assert.rejects(() => gate.fetchValidatedManifest(async () => {
    calls += 1;
    return calls === 1
      ? new Response("{", { status: 200, headers: { "Content-Type": "application/json" } })
      : json(legacyManifest);
  }), /product_manifest_parse_failed/);
  assert.equal(calls, 1);
});

test("direct R2 binding prefers a valid product manifest and reports its source", async () => {
  const bucket = fakeR2({ [PRODUCT_KEY]: r2Object(currentManifest), [LEGACY_KEY]: r2Object(legacyManifest) });
  const release = await gate.fetchValidatedManifestFromR2(bucket);
  assert.equal(release.publicMetadata.version, currentManifest.version);
  assert.equal(release.publicMetadata.installer_host, "updates.streamsuites.app");
  assert.equal(release.publicMetadata.installer_path, new URL(currentManifest.installer_url).pathname);
  assert.equal(release.releaseSource, "r2_binding");
  assert.equal(release.bindingConfigured, true);
});

test("direct R2 binding falls back only when the product manifest is missing or unsupported", async () => {
  const missing = await gate.fetchValidatedManifestFromR2(fakeR2({ [LEGACY_KEY]: r2Object(legacyManifest) }));
  assert.equal(missing.publicMetadata.manifest_source, "legacy");

  const unsupported = await gate.fetchValidatedManifestFromR2(fakeR2({
    [PRODUCT_KEY]: r2Object({ ...currentManifest, schema_version: 3 }),
    [LEGACY_KEY]: r2Object(legacyManifest),
  }));
  assert.equal(unsupported.publicMetadata.manifest_source, "legacy");

  await assert.rejects(
    () => gate.fetchValidatedManifestFromR2(fakeR2({
      [PRODUCT_KEY]: r2Object({ ...currentManifest, product_id: "wrong-product" }),
      [LEGACY_KEY]: r2Object(legacyManifest),
    })),
    /product_manifest_contract_failed/,
  );
});

test("direct R2 binding returns bounded precise read parse size and contract failures", async () => {
  await assert.rejects(
    () => gate.fetchValidatedManifestFromR2(fakeR2({ [PRODUCT_KEY]: r2Object("{") })),
    /product_manifest_parse_failed/,
  );
  await assert.rejects(
    () => gate.fetchValidatedManifestFromR2(fakeR2({ [PRODUCT_KEY]: r2Object(currentManifest, 1_048_577) })),
    /product_manifest_too_large/,
  );
  await assert.rejects(
    () => gate.fetchValidatedManifestFromR2(fakeR2({}, [PRODUCT_KEY])),
    /product_manifest_read_failed/,
  );
  for (const mutation of [
    { installer_url: currentManifest.installer_url.replace("updates.streamsuites.app", "example.com") },
    { installer_url: currentManifest.installer_url.replace("2026.07.27_2b001", "wrong-build") },
  ]) {
    await assert.rejects(
      () => gate.fetchValidatedManifestFromR2(fakeR2({ [PRODUCT_KEY]: r2Object({ ...currentManifest, ...mutation }) })),
      /product_manifest_contract_failed/,
    );
  }
});

test("Production fails explicitly when the R2 binding is missing and HTTP fallback remains local or Preview only", async () => {
  await assert.rejects(() => gate.fetchValidatedManifestForContext({
    env: {},
    request: new Request("https://streamsuites.app/api/downloads/studioapp/release"),
  }), /r2_binding_missing/);

  const release = await gate.fetchValidatedManifestForContext({
    env: { STUDIOAPP_MANIFEST_HTTP_FALLBACK_ENABLED: "true" },
    request: new Request("http://127.0.0.1:8788/api/downloads/studioapp/release"),
    fetch: async () => json(currentManifest),
  });
  assert.equal(release.releaseSource, "http_fallback");

  await assert.rejects(() => gate.fetchValidatedManifestForContext({
    env: { STUDIOAPP_MANIFEST_HTTP_FALLBACK_ENABLED: "true" },
    request: new Request("https://streamsuites.app/api/downloads/studioapp/release"),
    fetch: async () => json(currentManifest),
  }), /r2_binding_missing/);
});

test("optional system metadata may be absent but artifact identity remains strict", async () => {
  const optional = { ...currentManifest };
  delete optional.system_version;
  delete optional.system_build;
  const release = await gate.fetchValidatedManifest(async () => json(optional));
  assert.equal(release.publicMetadata.system_version, null);
  assert.equal(release.publicMetadata.system_build, null);
  for (const mutation of [
    { product_id: "wrong" },
    { architecture: "windows-arm64" },
    { installer_sha256: "0".repeat(63) },
    { installer_url: "https://example.com/setup.exe", installer_filename: "setup.exe" },
  ]) await assert.rejects(() => gate.fetchValidatedManifest(async () => json({ ...currentManifest, ...mutation })), /manifest_/);
});

test("release metadata stays visible while locked and controlled download fails closed", async () => {
  const releaseFunction = await importFunction("functions/api/downloads/studioapp/release.js");
  const latestFunction = await importFunction("functions/api/downloads/studioapp/latest.js");
  const lockedEnv = withR2(configEnv);
  const unlockedEnv = withR2({ DOWNLOAD_ACCESS_LOCKED: "false" });
    const releaseResponse = await releaseFunction.onRequestGet({
      env: lockedEnv,
      request: new Request("https://streamsuites.app/api/downloads/studioapp/release"),
    });
    const releasePayload = await releaseResponse.json();
    assert.equal(releasePayload.available, true);
    assert.equal(releasePayload.access_locked, true);
    assert.equal(releasePayload.download_available, false);
    assert.equal(releasePayload.version, currentManifest.version);
    assert.equal(releasePayload.release_source, "r2_binding");
    assert.equal(releasePayload.binding_configured, true);

    const unauthorized = await latestFunction.onRequestGet({
      env: lockedEnv,
      request: new Request("https://streamsuites.app/api/downloads/studioapp/latest?version=0.2.4-alpha&build=2026.07.27%2B001"),
    });
    assert.equal(unauthorized.status, 403);
    const injected = await latestFunction.onRequestGet({
      env: unlockedEnv,
      request: new Request("https://streamsuites.app/api/downloads/studioapp/latest?url=https://example.com/evil.exe"),
    });
    assert.equal(injected.status, 400);
    const stale = await latestFunction.onRequestGet({
      env: unlockedEnv,
      request: new Request("https://streamsuites.app/api/downloads/studioapp/latest?version=0.2.3-alpha&build=old"),
    });
    assert.equal(stale.status, 409);

    const cookie = await gate.createAccessCookie(gate.readDownloadAccessConfig(configEnv));
    const authorized = await latestFunction.onRequestGet({
      env: lockedEnv,
      request: new Request("https://streamsuites.app/api/downloads/studioapp/latest?version=0.2.4-alpha&build=2026.07.27%2B001", {
        headers: { Cookie: cookie.header.split(";")[0] },
      }),
    });
    assert.equal(authorized.status, 302);
    assert.equal(authorized.headers.get("Location"), currentManifest.installer_url);
    assert.match(authorized.headers.get("Content-Disposition"), /attachment/);
});

test("access state reports configuration blockers without exposing the bypass secret", async () => {
  const accessFunction = await importFunction("functions/api/downloads/studioapp/access-state.js");
  const response = await accessFunction.onRequestGet({
    env: { ...configEnv, DOWNLOAD_BYPASS_CODE: "" },
    request: new Request("https://streamsuites.app/api/downloads/studioapp/access-state"),
  });
  const text = await response.text();
  const payload = JSON.parse(text);
  assert.equal(payload.configuration_state, "required");
  assert.deepEqual(payload.missing_variables, ["DOWNLOAD_BYPASS_CODE"]);
  assert.equal(payload.bypass_enabled, false);
  assert.equal(payload.binding_configured, false);
  assert.equal(payload.release_source, null);
  assert.doesNotMatch(text, new RegExp(secret));

  const invalidResponse = await accessFunction.onRequestGet({
    env: { ...configEnv, DOWNLOAD_BYPASS_TTL_MINUTES: "999" },
    request: new Request("https://streamsuites.app/api/downloads/studioapp/access-state"),
  });
  const invalidPayload = await invalidResponse.json();
  assert.equal(invalidPayload.configuration_state, "invalid");
  assert.deepEqual(invalidPayload.invalid_variables, ["DOWNLOAD_BYPASS_TTL_MINUTES"]);
});

test("local manifest fixture is strictly localhost-only", async () => {
  const env = {
    LOCAL_STUDIOAPP_RELEASE_FIXTURE: "true",
    STUDIOAPP_RELEASE_FIXTURE_JSON: JSON.stringify(currentManifest),
  };
  const local = await gate.fetchValidatedManifestForContext({
    env,
    request: new Request("http://127.0.0.1:8788/api/downloads/studioapp/release"),
  });
  assert.equal(local.publicMetadata.version, currentManifest.version);
  await assert.rejects(() => gate.fetchValidatedManifestForContext({
    env,
    request: new Request("https://streamsuites.app/api/downloads/studioapp/release"),
  }), /local_fixture_forbidden/);
});

test("static download route reuses access visuals, contains no secret, and exposes no raw installer URL", () => {
  const html = read("downloads/studioapp/index.html");
  const client = read("js/studioapp-download.js");
  const css = read("css/studioapp-download.css");
  const sharedCss = read("css/download-surface.css");
  const redirects = read("_redirects");
  assert.match(html, /auth-modal-backdrop/); assert.match(html, /public-lockout-banner/); assert.match(html, /ss-auth-access-gate/);
  assert.match(html, /\/assets\/logos\/studiologo3\.webp/);
  assert.doesNotMatch(html, /\/assets\/icons\/ui\/streamsuitesicon\.svg/);
  assert.ok(fs.statSync(path.join(root, "assets/logos/studiologo3.webp")).size > 0);
  assert.match(html, /aria-modal="true"/); assert.match(html, /aria-live="polite"/); assert.match(html, /prefers-reduced-motion|studioapp-download\.css/);
  assert.match(html, /StudioApp version/); assert.match(html, /System compatibility/);
  assert.match(sharedCss, /font-family:\s*"Sui Generis"/); assert.match(sharedCss, /font-family:\s*"Recharge"/);
  assert.match(sharedCss, /SuiGeneris-Regular\.otf/); assert.match(sharedCss, /Recharge-Bold\.otf/);
  assert.match(sharedCss, /prefers-reduced-motion:\s*reduce/); assert.match(sharedCss, /forced-colors:\s*active/);
  assert.match(sharedCss, /font-size:\s*clamp\(2\.4rem,\s*4\.4vw,\s*3\.5rem\)/);
  assert.match(sharedCss, /@media \(max-width:\s*640px\)/); assert.match(css, /@media \(max-width:\s*520px\)/);
  assert.match(redirects, /\/downloads\/studioapp \/downloads\/studioapp\/index\.html 200/);
  assert.doesNotMatch(html, /https:\/\/updates\.streamsuites\.app\/studioapp\/windows-x64\/releases\//);
  assert.doesNotMatch(html + client, /DOWNLOAD_BYPASS_CODE|test-only-bypass-value/);
  assert.match(client, /sessionStorage\.setItem\(BANNER_KEY/); assert.match(client, /accessState\.authorized = false/);
  assert.match(client, /navigator\.clipboard\.writeText/); assert.match(client, /setReleaseUnavailable/);
  assert.doesNotMatch(html, /\b0\.\d+\.\d+-alpha\b/);
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

test("deployment marker is nonsecret and identifies the exact public route", () => {
  const marker = JSON.parse(read("deployment-markers/studioapp-release.json"));
  assert.equal(marker.schema_version, 2);
  assert.equal(marker.deployment_id, marker.marker_id);
  assert.match(marker.source_identity, /^[a-f0-9]{64}$/);
  assert.equal(marker.product_id, "streamsuites-studioapp");
  assert.equal(marker.route, "/downloads/studioapp/");
  assert.doesNotMatch(JSON.stringify(marker), /generated_at|source_commit|source_branch/i);
  assert.doesNotMatch(JSON.stringify(marker), /secret|token|password|bypass_code/i);
});

test("Pages runtime declares the authoritative direct R2 bucket binding", () => {
  const wrangler = read("wrangler.toml");
  assert.match(wrangler, /pages_build_output_dir\s*=\s*"\."/);
  assert.match(wrangler, /binding\s*=\s*"STREAMSUITES_UPDATES_BUCKET"/);
  assert.match(wrangler, /bucket_name\s*=\s*"streamsuites-updates"/);
  assert.doesNotMatch(wrangler, /global_fetch_strictly_public/);
});
