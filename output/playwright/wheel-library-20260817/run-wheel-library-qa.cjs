const { chromium } = require("C:/Temp/codex-playwright-session/node_modules/playwright-core");
const fs = require("fs");
const http = require("http");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");

const publicRoot = path.resolve(__dirname, "../../..");
const runtimeRoot = "C:/NEPTUNE LOCAL/GIT/StreamSuites";
const isolatedRoot = process.env.STREAMSUITES_WHEEL_ACCEPTANCE_ROOT || path.join(os.tmpdir(), `streamsuites-wheel-library-${Date.now()}`);
const evidenceRoot = process.env.STREAMSUITES_WHEEL_ACCEPTANCE_OUTPUT || __dirname;
const contextPath = path.join(isolatedRoot, "context.json");
const runtimeScript = path.join(runtimeRoot, "tools/isolated-wheel-acceptance-server.py");
const baseUrl = "http://127.0.0.1:5173";
const apiUrl = "http://127.0.0.1:18087";

fs.mkdirSync(isolatedRoot, { recursive: true });
fs.mkdirSync(evidenceRoot, { recursive: true });

function contentType(file) {
  return ({ ".html": "text/html; charset=utf-8", ".js": "application/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml", ".webp": "image/webp", ".png": "image/png", ".ico": "image/x-icon", ".mp3": "audio/mpeg" })[path.extname(file).toLowerCase()] || "application/octet-stream";
}

function staticFileFor(rawUrl) {
  let pathname = decodeURIComponent(new URL(rawUrl, baseUrl).pathname);
  if (pathname === "/" || pathname === "/wheels" || pathname === "/wheels/") pathname = "/wheels.html";
  else if (/^\/wheels\/[^/]+\/stage\/?$/i.test(pathname)) pathname = "/wheels/stage.html";
  else if (/^\/wheels\/[^/]+\/?$/i.test(pathname)) pathname = "/wheels/detail.html";
  const resolved = path.resolve(publicRoot, `.${pathname}`);
  if (!resolved.toLowerCase().startsWith(publicRoot.toLowerCase())) return null;
  return fs.existsSync(resolved) && fs.statSync(resolved).isFile() ? resolved : null;
}

function startStaticServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const file = staticFileFor(req.url || "/");
      if (!file) { res.writeHead(404, { "Content-Type": "text/plain" }); res.end("Not found"); return; }
      const bytes = fs.readFileSync(file);
      res.writeHead(200, { "Content-Type": contentType(file), "Content-Length": bytes.length, "Cache-Control": "no-store" });
      req.method === "HEAD" ? res.end() : res.end(bytes);
    });
    server.listen(5173, "127.0.0.1", () => resolve(server));
  });
}

function startRuntime() {
  return new Promise((resolve, reject) => {
    const child = spawn("python", [runtimeScript, "--root", isolatedRoot, "--context", contextPath, "--port", "18087"], { cwd: runtimeRoot, windowsHide: true });
    let output = ""; let errors = "";
    const timeout = setTimeout(() => reject(new Error(`Isolated Runtime did not become ready: ${errors.slice(-1200)}`)), 30000);
    child.stdout.on("data", (chunk) => {
      output += chunk.toString();
      if (!output.includes('"ready": true')) return;
      clearTimeout(timeout);
      resolve({ child, context: JSON.parse(fs.readFileSync(contextPath, "utf8")) });
    });
    child.stderr.on("data", (chunk) => { errors = `${errors}${chunk}`.slice(-20000); });
    child.on("exit", (code) => { if (code && code !== 0) reject(new Error(`Isolated Runtime exited ${code}: ${errors.slice(-1200)}`)); });
  });
}

async function stopRuntime(runtime) {
  if (!runtime?.child || runtime.child.exitCode !== null) return;
  runtime.child.kill();
  await Promise.race([new Promise((resolve) => runtime.child.once("exit", resolve)), new Promise((resolve) => setTimeout(resolve, 5000))]);
}

async function apiJson(page, method, urlPath, body) {
  return page.evaluate(async ({ method, url, body }) => {
    const response = await fetch(url, { method, credentials: "include", cache: "no-store", headers: { Accept: "application/json", ...(body ? { "Content-Type": "application/json" } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
    return { status: response.status, body: await response.json() };
  }, { method, url: `${apiUrl}${urlPath}`, body });
}

async function capture(page, name, viewport) {
  if (viewport) await page.setViewportSize(viewport);
  await page.screenshot({ path: path.join(evidenceRoot, name), fullPage: true });
}

async function assertNoOverflow(page, label) {
  const metric = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
  if (metric.scrollWidth > metric.clientWidth) throw new Error(`${label} horizontal overflow ${metric.scrollWidth} > ${metric.clientWidth}`);
  return metric;
}

let activeRuntime = null;
let activeStaticServer = null;
let activeBrowser = null;

async function main() {
  const staleFailure = path.join(evidenceRoot, "qa-failure.txt");
  if (fs.existsSync(staleFailure)) fs.unlinkSync(staleFailure);
  let runtime = await startRuntime(); activeRuntime = runtime;
  const staticServer = await startStaticServer(); activeStaticServer = staticServer;
  const browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" }); activeBrowser = browser;
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  const page = await context.newPage(); await page.emulateMedia({ reducedMotion: "no-preference", colorScheme: "dark" });
  const pageErrors = []; const wheelResponses = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("response", async (response) => {
    if (!/\/api\/(?:creator|public)\/wheels/i.test(response.url())) return;
    wheelResponses.push({ method: response.request().method(), path: new URL(response.url()).pathname, status: response.status() });
  });

  await page.goto(`${baseUrl}/wheels`, { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Sign in to create" }).waitFor();
  await capture(page, "01-wheels-hero-signed-out-1440x900.png", { width: 1440, height: 900 });

  await context.addCookies([{ name: runtime.context.session_cookie_name, value: runtime.context.session_id, domain: "127.0.0.1", path: "/", httpOnly: true, sameSite: "Lax", secure: false }]);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Create", exact: true }).waitFor();
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await capture(page, "02-create-menu-1440x900.png", { width: 1440, height: 900 });
  await page.getByRole("menuitem", { name: "New Wheel Set" }).click();
  await page.getByLabel("Wheel-set title").fill("Library Set A");
  await page.getByLabel("Description (optional)").fill("Portable gallery lifecycle acceptance");
  await page.getByLabel("First wheel name").fill("Wheel A1");
  await page.getByLabel("One entrant per line").fill("Alpha\nBravo\nCharlie");
  await capture(page, "03-new-wheel-set-modal-1440x900.png", { width: 1440, height: 900 });
  await page.getByRole("dialog", { name: "Create wheel set" }).getByRole("button", { name: "Create wheel set", exact: true }).click();
  await page.waitForURL(/\/wheels\/[^/?]+$/); await page.locator(".wheel-workspace").waitFor();

  const ownedAfterCreate = await apiJson(page, "GET", "/api/creator/wheels?summary=1&limit=100&offset=0");
  const setA = ownedAfterCreate.body.items[0]; const setACode = setA.artifact_code;
  const detailA = (await apiJson(page, "GET", `/api/creator/wheels/${setACode}`)).body.wheel;
  const defaultA1 = detailA.wheel_set.active_wheel_id;
  const addA2 = await apiJson(page, "PATCH", `/api/creator/wheels/${setACode}`, { operation: { type: "add", wheel: { name: "Wheel A2", entries: ["Delta", "Echo", "Foxtrot", "Golf"], palette: { segment_colors: ["#ff385c", "#ffd166", "#22d3a7", "#6d7cff"], accent_color: "#ff385c", trim_color: "#ffd166" }, presentation: { spin_duration_ms: 2000, celebration_enabled: true, confetti_enabled: true, stage_background_preset: "prism_grid", stage_background_color: "#ff385c" } } } });
  if (addA2.status !== 200) throw new Error("Could not add Wheel A2");
  const a2 = addA2.body.wheel.wheel_set.wheels.at(-1); const a2Id = a2.wheel_id;

  await page.goto(`${baseUrl}/wheels`, { waitUntil: "domcontentloaded" });
  const myLibrary = page.locator(".wheel-library-section").filter({ has: page.getByRole("heading", { name: "My Library" }) });
  await myLibrary.getByRole("link", { name: /Wheel Set: Library Set A/ }).waitFor();
  await myLibrary.getByRole("link", { name: /Wheel Set: Library Set A/ }).hover();
  await capture(page, "04-my-library-wheel-sets-hover-1920x1080.png", { width: 1920, height: 1080 });
  await myLibrary.getByRole("tab", { name: "Wheels" }).click();
  await myLibrary.getByRole("link", { name: /Wheel: Wheel A2, from Wheel Set Library Set A/ }).waitFor();
  await myLibrary.getByRole("link", { name: /Wheel: Wheel A2, from Wheel Set Library Set A/ }).hover();
  await capture(page, "05-my-library-wheels-hover-1440x900.png", { width: 1440, height: 900 });
  await myLibrary.getByRole("link", { name: /Wheel: Wheel A2, from Wheel Set Library Set A/ }).click();
  await page.waitForURL(new RegExp(`wheel=${a2Id}`)); await page.locator(".wheel-workspace").waitFor();
  const deepLinkState = await page.locator(".wheel-workspace").evaluate((node) => ({ selected: node._wheelWorkspaceState?.selectedWheelId, title: node.querySelector(".wheel-production-title strong")?.textContent, search: window.location.search }));
  if (deepLinkState.selected !== a2Id) throw new Error(`Child deep link did not select A2: ${JSON.stringify(deepLinkState)}`);
  await capture(page, "06-child-wheel-deep-link-1440x900.png", { width: 1440, height: 900 });
  const defaultAfterDeepLink = (await apiJson(page, "GET", `/api/creator/wheels/${setACode}`)).body.wheel.wheel_set.active_wheel_id;
  if (defaultAfterDeepLink !== defaultA1) throw new Error("Child deep link mutated the authority default");
  await page.reload({ waitUntil: "domcontentloaded" }); await page.locator(".wheel-workspace").waitFor();
  const reloadSelection = await page.locator(".wheel-workspace").evaluate((node) => node._wheelWorkspaceState?.selectedWheelId);
  if (reloadSelection !== a2Id) throw new Error(`Child deep link did not survive reload: ${reloadSelection}`);

  await page.getByRole("tab", { name: "Share" }).click(); await page.getByRole("button", { name: "Share settings" }).click();
  await page.getByRole("button", { name: "Export Stage (.stg)" }).waitFor(); await page.getByRole("button", { name: "Export wheel (.swl)" }).waitFor();
  await capture(page, "07-stg-swl-export-actions-1440x900.png", { width: 1440, height: 900 });
  await page.getByRole("button", { name: "Close Share and presentation" }).click();

  const stageExport = await apiJson(page, "GET", `/api/creator/wheels/${setACode}/export`);
  const wheelExport = await apiJson(page, "GET", `/api/creator/wheels/${setACode}/wheels/${a2Id}/export`);
  const stageFile = path.join(evidenceRoot, stageExport.body.export.filename); const wheelFile = path.join(evidenceRoot, wheelExport.body.export.filename);
  fs.writeFileSync(stageFile, JSON.stringify(stageExport.body.export.payload, null, 2)); fs.writeFileSync(wheelFile, JSON.stringify(wheelExport.body.export.payload, null, 2));

  await page.getByRole("button", { name: "Spin", exact: true }).click();
  await page.locator(".wheel-winner-overlay .wheel-celebration-layer").waitFor({ timeout: 5000 });
  await page.waitForTimeout(350);
  const celebrationPixels = await page.locator(".wheel-celebration-layer").evaluate((canvas) => ({ width: canvas.width, height: canvas.height }));
  if (!celebrationPixels.width || !celebrationPixels.height) throw new Error("Celebration canvas did not render");
  await capture(page, "08-restored-confetti-fireworks-1440x900.png", { width: 1440, height: 900 });

  const setB = await apiJson(page, "POST", "/api/creator/wheels/import", { source_name: path.basename(stageFile), payload: stageExport.body.export.payload, exact_source_available: true });
  const setBCode = setB.body.wheel.artifact_code;
  const childIntoB = await apiJson(page, "POST", `/api/creator/wheels/${setBCode}/wheels/import`, { source_name: path.basename(wheelFile), payload: wheelExport.body.export.payload });
  const setC = await apiJson(page, "POST", "/api/creator/wheels/import", { source_name: path.basename(wheelFile), title: "Library Set C", payload: wheelExport.body.export.payload });
  const legacy = await apiJson(page, "POST", "/api/creator/wheels/import", { source_name: "legacy-library.sswheel", payload: { schema_version: "streamsuites.wheel.v1", portable_format: "sswheel", artifact_type: "wheel", title: "Legacy Library Set", entries: ["Legacy Alpha", "Legacy Bravo"] } });
  if ([setB.status, childIntoB.status, setC.status, legacy.status].some((status) => status !== 201)) throw new Error("One isolated import workflow failed");

  await page.goto(`${baseUrl}/wheels`, { waitUntil: "domcontentloaded" }); await page.getByRole("button", { name: "Import", exact: true }).click();
  await page.getByText("Stage / Wheel Set (.stg)").waitFor(); await page.getByText("Individual Wheel (.swl)").waitFor();
  await capture(page, "09-import-modal-stg-swl-1440x900.png", { width: 1440, height: 900 });
  await page.locator('.wheel-import-drop input[type="file"]').setInputFiles(wheelFile);
  await page.getByText("Individual Wheel destination").waitFor();
  await capture(page, "10-swl-destination-selection-1440x900.png", { width: 1440, height: 900 });
  await page.getByRole("button", { name: "Cancel" }).click();

  const importedLibrary = page.locator(".wheel-library-section").filter({ has: page.getByRole("heading", { name: "My Library" }) });
  await importedLibrary.getByRole("link", { name: /Wheel Set: Library Set C/ }).waitFor();
  await capture(page, "11-imported-my-library-1920x1080.png", { width: 1920, height: 1080 });
  const publicGallery = page.locator(".wheel-library-section").filter({ has: page.getByRole("heading", { name: "Public Gallery" }) });
  await publicGallery.getByRole("link", { name: /Wheel Set: Library Set A/ }).first().waitFor();
  await capture(page, "12-public-gallery-wheel-sets-1440x900.png", { width: 1440, height: 900 });
  await publicGallery.getByRole("tab", { name: "Wheels" }).click(); await publicGallery.getByRole("link", { name: /Wheel: Wheel A2/ }).first().waitFor();
  await capture(page, "13-public-gallery-wheels-1440x900.png", { width: 1440, height: 900 });

  const viewports = [[1024, 768], [768, 1024], [390, 844]];
  for (const [width, height] of viewports) { await capture(page, `14-library-${width}x${height}.png`, { width, height }); await assertNoOverflow(page, `${width}x${height}`); }
  await page.evaluate(() => { document.documentElement.dataset.publicAppearance = "light"; document.documentElement.style.colorScheme = "light"; });
  await capture(page, "15-light-theme-library-1440x900.png", { width: 1440, height: 900 }); await assertNoOverflow(page, "light-1440x900");

  await stopRuntime(runtime); runtime = await startRuntime(); activeRuntime = runtime;
  await page.reload({ waitUntil: "domcontentloaded" }); await page.getByRole("heading", { name: "My Library" }).waitFor();
  const persisted = await apiJson(page, "GET", "/api/creator/wheels?summary=1&limit=100&offset=0");
  if (persisted.body.total !== 4) throw new Error(`Restart persistence expected 4 sets, received ${persisted.body.total}`);

  const galleryMetrics = await page.evaluate(() => ({
    setCards: document.querySelectorAll(".wheel-library-card--set").length,
    wheelCards: document.querySelectorAll(".wheel-library-card--wheel").length,
    svgPreviews: document.querySelectorAll(".wheel-mini-preview").length,
    fullWorkspaceCards: document.querySelectorAll(".wheel-library-card .wheel-workspace").length,
    animationCanvases: document.querySelectorAll(".wheel-library-card canvas").length,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
  }));
  const publicListCalls = wheelResponses.filter((entry) => entry.method === "GET" && entry.path === "/api/public/wheels").length;
  const ownerListCalls = wheelResponses.filter((entry) => entry.method === "GET" && entry.path === "/api/creator/wheels").length;
  const result = {
    isolatedRoot,
    identities: { setA: setACode, setB: setBCode, setC: setC.body.wheel.artifact_code, legacy: legacy.body.wheel.artifact_code, wheelA2: a2Id, savedDefault: defaultA1 },
    portable: { stageFilename: path.basename(stageFile), stageSchema: stageExport.body.export.payload.portable_schema, wheelFilename: path.basename(wheelFile), wheelSchema: wheelExport.body.export.payload.portable_schema, stageHasOwner: /(?:linked_account_id|owner_account_id|creator_account_id)/i.test(JSON.stringify(stageExport.body.export.payload)), wheelHasOwner: /(?:linked_account_id|owner_account_id|creator_account_id)/i.test(JSON.stringify(wheelExport.body.export.payload)) },
    imports: { setBWheelCount: childIntoB.body.wheel.wheel_set.wheels.length, setCWheelCount: setC.body.wheel.wheel_set.wheels.length, legacyFormat: legacy.body.import_summary.source_format },
    celebrationPixels,
    persistedSetCount: persisted.body.total,
    galleryMetrics,
    network: { wheelResponseCount: wheelResponses.length, wheelHttp500: wheelResponses.filter((entry) => entry.status === 500), publicListCalls, ownerListCalls },
    pageErrors,
    screenshots: fs.readdirSync(evidenceRoot).filter((name) => /^\d{2}-.*\.png$/.test(name)).sort()
  };
  if (result.portable.stageSchema !== "streamsuites.stage-package.v1" || !result.portable.stageFilename.endsWith(".stg") || result.portable.stageHasOwner) throw new Error(".stg contract failed");
  if (result.portable.wheelSchema !== "streamsuites.wheel-package.v1" || !result.portable.wheelFilename.endsWith(".swl") || result.portable.wheelHasOwner) throw new Error(".swl contract failed");
  if (result.imports.setBWheelCount !== 3 || result.imports.setCWheelCount !== 1 || result.imports.legacyFormat !== "sswheel") throw new Error("Import semantics failed");
  if (galleryMetrics.fullWorkspaceCards || galleryMetrics.animationCanvases || galleryMetrics.overflow || galleryMetrics.svgPreviews !== galleryMetrics.setCards + galleryMetrics.wheelCards) throw new Error(`Gallery performance/DOM contract failed: ${JSON.stringify(galleryMetrics)}`);
  if (result.network.wheelHttp500.length || pageErrors.length) throw new Error(`Browser errors: ${JSON.stringify({ pageErrors, wheelHttp500: result.network.wheelHttp500 })}`);
  fs.writeFileSync(path.join(evidenceRoot, "qa-results.json"), JSON.stringify(result, null, 2));
  fs.writeFileSync(path.join(evidenceRoot, "network-results.json"), JSON.stringify(wheelResponses, null, 2));

  await browser.close(); activeBrowser = null; staticServer.close(); activeStaticServer = null; await stopRuntime(runtime); activeRuntime = null;
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

main().catch(async (error) => {
  fs.writeFileSync(path.join(evidenceRoot, "qa-failure.txt"), `${error.stack || error}\n`);
  process.stderr.write(`${error.stack || error}\n`);
  await activeBrowser?.close().catch(() => {}); activeStaticServer?.close(); await stopRuntime(activeRuntime).catch(() => {}); process.exit(1);
});
