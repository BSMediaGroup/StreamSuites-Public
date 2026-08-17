const { chromium } = require("C:/Temp/codex-playwright-session/node_modules/playwright-core");
const fs = require("fs");
const http = require("http");
const path = require("path");
const { spawn } = require("child_process");

const publicRoot = path.resolve(__dirname, "../../..");
const runtimeRoot = "C:/NEPTUNE LOCAL/GIT/StreamSuites";
const isolatedRoot = "C:/Temp/streamsuites-wheel-lifecycle-20260817-run13";
const contextPath = path.join(isolatedRoot, "context.json");
const runtimeScript = path.join(runtimeRoot, "tools/isolated-wheel-acceptance-server.py");
const fixtureImage = path.join(publicRoot, "output/playwright/wheel-detail-v3-corrective/flattened-stage-1600x1000.png");
const baseUrl = "http://127.0.0.1:5173";
const apiUrl = "http://127.0.0.1:18087";

fs.mkdirSync(__dirname, { recursive: true });
fs.mkdirSync(isolatedRoot, { recursive: true });

function contentType(file) {
  const ext = path.extname(file).toLowerCase();
  return ({ ".html": "text/html; charset=utf-8", ".js": "application/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml", ".webp": "image/webp", ".png": "image/png", ".ico": "image/x-icon", ".mp3": "audio/mpeg" })[ext] || "application/octet-stream";
}

function staticFileFor(rawUrl) {
  const parsed = new URL(rawUrl, baseUrl);
  let pathname = decodeURIComponent(parsed.pathname);
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
      if (req.method === "HEAD") res.end(); else res.end(bytes);
    });
    server.listen(5173, "127.0.0.1", () => resolve(server));
  });
}

function startRuntime() {
  return new Promise((resolve, reject) => {
    const child = spawn("python", [runtimeScript, "--root", isolatedRoot, "--context", contextPath, "--port", "18087"], { cwd: runtimeRoot, windowsHide: true });
    let buffer = "";
    let stderrBuffer = "";
    const timeout = setTimeout(() => reject(new Error(`Isolated Runtime did not become ready: ${stderrBuffer.slice(-1000)}`)), 30000);
    child.stdout.on("data", (chunk) => {
      buffer += chunk.toString();
      for (const line of buffer.split(/\r?\n/)) {
        if (!line.includes('"ready": true')) continue;
        clearTimeout(timeout);
        resolve({ child, context: JSON.parse(fs.readFileSync(contextPath, "utf8")) });
        return;
      }
      buffer = buffer.slice(buffer.lastIndexOf("\n") + 1);
    });
    child.stderr.on("data", (chunk) => { stderrBuffer = `${stderrBuffer}${chunk}`.slice(-20000); });
    child.on("exit", (code) => { if (code && code !== 0) reject(new Error(`Isolated Runtime exited ${code}: ${stderrBuffer.slice(-1000)}`)); });
  });
}

async function stopRuntime(runtime) {
  if (!runtime?.child || runtime.child.exitCode !== null) return;
  runtime.child.kill();
  await Promise.race([new Promise((resolve) => runtime.child.once("exit", resolve)), new Promise((resolve) => setTimeout(resolve, 5000))]);
}

async function screenshot(page, name, viewport) {
  if (viewport) await page.setViewportSize(viewport);
  await page.screenshot({ path: path.join(__dirname, name), fullPage: true });
}

async function apiJson(page, method, urlPath, body) {
  return page.evaluate(async ({ method, url, body }) => {
    const response = await fetch(url, { method, credentials: "include", cache: "no-store", headers: { Accept: "application/json", ...(body ? { "Content-Type": "application/json" } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
    return { status: response.status, body: await response.json() };
  }, { method, url: `${apiUrl}${urlPath}`, body });
}

async function readJsonEventually(filePath) {
  let lastError = null;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    try { return JSON.parse(fs.readFileSync(filePath, "utf8")); }
    catch (error) { lastError = error; await new Promise((resolve) => setTimeout(resolve, 200)); }
  }
  throw lastError;
}

async function openInspectorTab(page, name) {
  await page.getByRole("tab", { name, exact: true }).click();
}

async function openMore(page) {
  await page.getByRole("button", { name: "More wheel actions" }).click();
}

let activeRuntime = null;
let activeStaticServer = null;
let activeBrowser = null;

async function main() {
  let runtime = await startRuntime();
  activeRuntime = runtime;
  const staticServer = await startStaticServer();
  activeStaticServer = staticServer;
  const browser = await chromium.launch({ headless: true });
  activeBrowser = browser;
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  const page = await context.newPage();
  const pageErrors = [];
  const wheelResponses = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("response", (response) => { if (/\/api\/(?:creator|public)\/wheels/i.test(response.url())) wheelResponses.push({ method: response.request().method(), url: response.url(), status: response.status() }); });

  await page.goto(`${baseUrl}/wheels`, { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Sign in to create" }).waitFor();
  await screenshot(page, "01-signed-out-gallery-1440x900.png", { width: 1440, height: 900 });

  await context.addCookies([{ name: runtime.context.session_cookie_name, value: runtime.context.session_id, domain: "127.0.0.1", path: "/", httpOnly: true, sameSite: "Lax", secure: false }]);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Create wheel set" }).waitFor();
  await page.getByText("You do not own any wheel sets yet.").waitFor();
  await screenshot(page, "02-empty-owned-wheels-1600x1000.png", { width: 1600, height: 1000 });

  await page.getByRole("button", { name: "Create wheel set", exact: true }).click();
  await page.getByLabel("Wheel-set title").fill("Lifecycle Wheel A");
  await page.getByLabel("Description (optional)").fill("Isolated canonical lifecycle acceptance");
  await page.getByLabel("First wheel name").fill("First Wheel A");
  await page.getByLabel("One entrant per line").fill("Alpha\nBravo\nCharlie");
  await page.getByLabel("System Stage preset").selectOption("aurora_vault");
  await page.getByLabel("Stage colour").fill("#2458a6");
  await screenshot(page, "03-create-modal-1440x900.png", { width: 1440, height: 900 });
  await page.getByRole("dialog", { name: "Create wheel set" }).getByRole("button", { name: "Create wheel set", exact: true }).click();
  await page.waitForURL(/\/wheels\/[^/]+$/);
  await page.locator(".wheel-workspace").waitFor();
  const originalPath = new URL(page.url()).pathname;
  const created = await apiJson(page, "GET", "/api/creator/wheels?summary=1&limit=50&offset=0");
  const originalSummary = created.body.items[0];
  const originalCode = originalSummary.artifact_code;
  let detail = (await apiJson(page, "GET", `/api/creator/wheels/${originalCode}`)).body.wheel;
  const originalChildId = detail.wheel_set.wheels[0].wheel_id;
  await screenshot(page, "04-new-wheel-detail-1920x1080.png", { width: 1920, height: 1080 });

  const stagePage = await context.newPage();
  await stagePage.goto(`${baseUrl}${originalPath}/stage`, { waitUntil: "domcontentloaded" });
  await stagePage.locator(".wheel-workspace--stage").waitFor();
  await screenshot(stagePage, "05-new-stage-1440x900.png", { width: 1440, height: 900 });
  await stagePage.close();

  await openInspectorTab(page, "Share");
  await page.getByRole("button", { name: "Share settings" }).click();
  await page.getByLabel("Wheel-set title").fill("Lifecycle Wheel A Edited");
  await page.getByLabel("Description").fill("Canonical edits survive reload and restart");
  await page.getByRole("button", { name: "Save wheel-set details" }).click();
  await page.getByText("Wheel-set details saved.").waitFor();
  await screenshot(page, "06-owner-editor-title-save-1440x900.png", { width: 1440, height: 900 });
  await page.getByRole("button", { name: "Close Share and presentation" }).click();

  await openInspectorTab(page, "Entries");
  await page.getByRole("button", { name: "Manage entrants" }).click();
  const entrantRows = page.locator(".wheel-entrant-row");
  await entrantRows.nth(0).getByLabel(/entries$/).fill("3");
  await entrantRows.nth(0).getByLabel(/weight$/).fill("1.5");
  await entrantRows.nth(1).getByRole("button", { name: "Remove" }).click();
  await page.getByRole("button", { name: "Add entrant" }).click();
  const lastEntrant = page.locator(".wheel-entrant-row").last();
  await lastEntrant.locator("input").first().fill("Delta");
  await lastEntrant.getByLabel(/entries$/).fill("4");
  await lastEntrant.getByLabel(/weight$/).fill("2");
  await page.getByRole("button", { name: "Save entrants" }).click();
  await page.getByText("Saved and rehydrated from Runtime/Auth.").waitFor();
  await screenshot(page, "07-entrant-save-success-1440x900.png", { width: 1440, height: 900 });
  await page.getByRole("button", { name: "Close Manage entrants" }).click();

  await openInspectorTab(page, "Appearance");
  await page.getByRole("button", { name: "Edit appearance" }).click();
  await page.getByRole("button", { name: "Prism Grid" }).click();
  await page.locator('.wheel-stage-colour-field input[type="color"]').fill("#6b3fd4");
  await page.locator('.wheel-appearance-controls input[type="color"]').first().fill("#e54b6b");
  const fileInputs = page.locator('.wheel-appearance-controls input[type="file"]');
  await fileInputs.nth(0).setInputFiles(fixtureImage);
  await fileInputs.nth(1).setInputFiles(fixtureImage);
  await page.getByRole("button", { name: "Save appearance" }).click();
  await page.getByText("Saved and rehydrated from Runtime/Auth.").waitFor({ timeout: 30000 });
  await screenshot(page, "08-appearance-save-success-1440x900.png", { width: 1440, height: 900 });
  await page.getByRole("button", { name: "Close Wheel appearance" }).click();

  await openInspectorTab(page, "Rules");
  await page.getByRole("button", { name: "Advanced rules" }).click();
  await page.getByLabel("Winner limit").fill("5");
  await page.getByLabel("Allow duplicate winners").uncheck();
  await page.getByLabel("Auto-remove winner locally").check();
  await page.getByLabel("Owner-only spin").check();
  await page.getByRole("button", { name: "Save rules" }).click();
  await page.getByText("Rules saved.").waitFor();
  await page.getByRole("button", { name: "Close Advanced rules" }).click();

  await openInspectorTab(page, "Appearance");
  await page.getByRole("button", { name: "Celebration" }).click();
  await page.getByLabel("Celebration and confetti enabled").check();
  await page.getByRole("button", { name: "Save celebration" }).click();
  await page.getByText("Celebration saved.").waitFor();
  await page.getByRole("button", { name: "Close Celebration" }).click();
  await openInspectorTab(page, "Sound");
  await page.getByRole("button", { name: "Sound settings" }).click();
  await page.getByLabel("Sound enabled").check();
  await page.locator(".wheel-sound-row select").last().selectOption("winner2.mp3");
  await page.getByRole("button", { name: "Save sound settings" }).click();
  await page.getByText("Sound settings saved.").waitFor();
  await page.getByRole("button", { name: "Close Sound settings" }).click();

  await openMore(page);
  await page.getByRole("menuitem", { name: "Manage wheels" }).click();
  let managerRows = page.locator(".wheel-manager-row");
  await managerRows.nth(0).locator(".wheel-manager-name").fill("First Wheel Renamed");
  await managerRows.nth(0).getByRole("button", { name: "Rename" }).click();
  await page.getByText("Rename complete.").waitFor();
  await page.getByRole("button", { name: "Add wheel" }).click();
  await page.getByText("Wheel added.").waitFor();
  managerRows = page.locator(".wheel-manager-row");
  if (await managerRows.count() < 2) throw new Error("Manager did not rehydrate the added wheel");
  await managerRows.nth(1).getByRole("button", { name: "Duplicate" }).click();
  await page.getByText("Duplicate complete.").waitFor();
  managerRows = page.locator(".wheel-manager-row");
  await managerRows.nth(1).locator(".wheel-manager-name").fill("Second Wheel");
  await managerRows.nth(1).getByRole("button", { name: "Rename" }).click();
  await page.getByText("Rename complete.").waitFor();
  managerRows = page.locator(".wheel-manager-row");
  await managerRows.nth(2).locator(".wheel-manager-name").fill("Temporary Wheel");
  await managerRows.nth(2).getByRole("button", { name: "Rename" }).click();
  await page.getByText("Rename complete.").waitFor();
  managerRows = page.locator(".wheel-manager-row");
  await managerRows.nth(0).getByRole("button", { name: "Move down" }).click();
  await page.getByText("Move down complete.").waitFor();
  managerRows = page.locator(".wheel-manager-row");
  await managerRows.nth(0).getByRole("button", { name: "Set as default" }).click();
  await page.getByText("Set as default complete.").waitFor();
  page.once("dialog", (dialog) => dialog.accept());
  managerRows = page.locator(".wheel-manager-row");
  await managerRows.nth(2).getByRole("button", { name: "Remove" }).click();
  await page.getByText("Remove complete.").waitFor();
  await screenshot(page, "09-manage-wheels-reorder-1600x1000.png", { width: 1600, height: 1000 });
  await page.getByRole("button", { name: "Close Manage wheels" }).click();

  await openMore(page);
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "Export wheel set (.sswheel)" }).click();
  const download = await downloadPromise;
  const exportPath = path.join(__dirname, "lifecycle-wheel-export.sswheel");
  await download.saveAs(exportPath);
  const portable = await readJsonEventually(exportPath);
  await screenshot(page, "10-export-action-1440x900.png", { width: 1440, height: 900 });

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.locator(".wheel-workspace").waitFor();
  detail = (await apiJson(page, "GET", `/api/creator/wheels/${originalCode}`)).body.wheel;
  const afterReload = detail;

  await page.goto(`${baseUrl}/wheels`, { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Import .sswheel" }).click();
  await page.locator('.wheel-import-drop input[type="file"]').setInputFiles(exportPath);
  await screenshot(page, "11-import-modal-1440x900.png", { width: 1440, height: 900 });
  await page.getByRole("button", { name: "Import wheel set" }).click();
  await page.waitForURL(/\/wheels\/[^/]+$/);
  await page.locator(".wheel-workspace").waitFor();
  const importedPath = new URL(page.url()).pathname;
  const summaries = (await apiJson(page, "GET", "/api/creator/wheels?summary=1&limit=50&offset=0")).body.items;
  const importedSummary = summaries.find((item) => item.artifact_code !== originalCode);
  const importedCode = importedSummary.artifact_code;
  await screenshot(page, "12-imported-wheel-set-1440x900.png", { width: 1440, height: 900 });

  await stopRuntime(runtime);
  runtime = await startRuntime();
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.locator(".wheel-workspace").waitFor();
  const originalAfterRestart = (await apiJson(page, "GET", `/api/creator/wheels/${originalCode}`)).body.wheel;
  const importedAfterRestart = (await apiJson(page, "GET", `/api/creator/wheels/${importedCode}`)).body.wheel;

  await openInspectorTab(page, "Entries");
  await page.getByRole("button", { name: "Manage entrants" }).click();
  await page.locator(".wheel-entrant-row").first().getByLabel(/weight$/).fill("2.25");
  await page.getByRole("button", { name: "Save entrants" }).click();
  await page.getByText("Saved and rehydrated from Runtime/Auth.").waitFor();
  await page.getByRole("button", { name: "Close Manage entrants" }).click();

  await page.goto(`${baseUrl}/wheels`, { waitUntil: "domcontentloaded" });
  await page.getByText("2 owned").waitFor();
  await screenshot(page, "13-owned-gallery-1920x1080.png", { width: 1920, height: 1080 });
  await screenshot(page, "14-owned-gallery-1024x768.png", { width: 1024, height: 768 });
  await screenshot(page, "15-mobile-owned-gallery-390x844.png", { width: 390, height: 844 });
  await page.getByRole("button", { name: "Create wheel set" }).click();
  await screenshot(page, "16-mobile-create-flow-390x844.png", { width: 390, height: 844 });
  await page.getByRole("button", { name: "Cancel" }).click();
  const galleryCounts = await page.evaluate(() => ({
    ownedCards: document.querySelectorAll(".wheel-owned-card").length,
    publicCards: document.querySelectorAll(".wheel-public-gallery [data-wheel-artifact-code]").length,
    lifecycleModals: document.querySelectorAll(".wheel-lifecycle-modal-backdrop").length
  }));

  await page.goto(`${baseUrl}${originalPath}`, { waitUntil: "domcontentloaded" });
  await openMore(page);
  await page.getByRole("menuitem", { name: "Manage wheels" }).click();
  await page.locator(".wheel-manager-row").first().locator(".wheel-manager-name").fill("");
  await page.locator(".wheel-manager-row").first().getByRole("button", { name: "Rename" }).click();
  await page.getByText("Child wheel name is required").waitFor();
  await screenshot(page, "17-structured-save-error-1440x900.png", { width: 1440, height: 900 });
  await page.getByRole("button", { name: "Close Manage wheels" }).click();

  const stalePage = await context.newPage();
  await stalePage.route(`${apiUrl}/api/public/wheels`, async (route) => {
    const response = await route.fetch();
    const payload = await response.json();
    delete payload.wheel_service;
    await route.fulfill({ response, json: payload });
  });
  await stalePage.goto(`${baseUrl}/wheels`, { waitUntil: "domcontentloaded" });
  await stalePage.getByText("Wheel editing requires the current Runtime wheel service").waitFor();
  await screenshot(stalePage, "18-stale-runtime-768x1024.png", { width: 768, height: 1024 });
  await stalePage.close();

  const finalOriginal = (await apiJson(page, "GET", `/api/creator/wheels/${originalCode}`)).body.wheel;
  const finalImported = (await apiJson(page, "GET", `/api/creator/wheels/${importedCode}`)).body.wheel;
  const metrics = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth, objectUrlsInDom: [...document.querySelectorAll("img")].filter((img) => img.src.startsWith("blob:")).length }));
  const result = {
    originalCode,
    originalChildId,
    importedCode,
    originalPath,
    importedPath,
    pageErrors,
    wheelHttp500: wheelResponses.filter((entry) => entry.status === 500),
    wheelResponseCount: wheelResponses.length,
    portable: { schema: portable.schema_version, wheelCount: portable.wheel_set.wheels.length, hasArtifactCode: Object.hasOwn(portable, "artifact_code"), hasPrivatePaths: /(?:storage_path|temp_path|linked_account_id|owner_account_id)/i.test(JSON.stringify(portable)) },
    afterReload: { title: afterReload.title, wheelCount: afterReload.wheel_set.wheels.length, firstWheelId: afterReload.wheel_set.wheels[0].wheel_id },
    afterRestart: { originalTitle: originalAfterRestart.title, importedTitle: importedAfterRestart.title, originalWheelCount: originalAfterRestart.wheel_set.wheels.length, importedWheelCount: importedAfterRestart.wheel_set.wheels.length },
    final: { title: finalOriginal.title, wheelCount: finalOriginal.wheel_set.wheels.length, originalFirstWeight: finalOriginal.wheel_set.wheels[0].entries[0].weight, importedFirstWeight: finalImported.wheel_set.wheels[0].entries[0].weight },
    galleryCounts,
    performance: { mutationPatchCount: wheelResponses.filter((item) => item.method === "PATCH").length, longTaskObservation: "not_captured" },
    metrics,
    screenshots: fs.readdirSync(__dirname).filter((name) => /^\d{2}-.*\.png$/.test(name)).sort()
  };
  fs.writeFileSync(path.join(__dirname, "qa-results.json"), JSON.stringify(result, null, 2));
  if (pageErrors.length) throw new Error(`Page exceptions: ${pageErrors.join(" | ")}`);
  if (result.wheelHttp500.length) throw new Error(`Wheel HTTP 500 responses: ${JSON.stringify(result.wheelHttp500)}`);
  if (metrics.width > metrics.clientWidth) throw new Error(`Horizontal overflow ${metrics.width} > ${metrics.clientWidth}`);
  if (portable.schema_version !== "streamsuites.wheel-set.v2" || result.portable.hasArtifactCode || result.portable.hasPrivatePaths) throw new Error("Portable export contract failed");
  if (originalCode === importedCode || originalPath === importedPath) throw new Error("Import did not receive new canonical identity");
  if (originalAfterRestart.title !== "Lifecycle Wheel A Edited" || importedAfterRestart.wheel_set.wheels.length !== portable.wheel_set.wheels.length) throw new Error("Restart persistence failed");
  if (finalImported.wheel_set.wheels[0].entries[0].weight !== 2.25) throw new Error("Post-restart imported edit did not persist");
  if (galleryCounts.ownedCards !== 2 || galleryCounts.publicCards !== 0 || galleryCounts.lifecycleModals !== 0) throw new Error(`Gallery/modal cleanup contract failed: ${JSON.stringify(galleryCounts)}`);

  await browser.close();
  activeBrowser = null;
  staticServer.close();
  activeStaticServer = null;
  await stopRuntime(runtime);
  activeRuntime = null;
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

main().catch(async (error) => {
  fs.writeFileSync(path.join(__dirname, "qa-failure.txt"), `${error.stack || error}\n`);
  process.stderr.write(`${error.stack || error}\n`);
  await activeBrowser?.close().catch(() => {});
  activeStaticServer?.close();
  await stopRuntime(activeRuntime).catch(() => {});
  process.exit(1);
});
