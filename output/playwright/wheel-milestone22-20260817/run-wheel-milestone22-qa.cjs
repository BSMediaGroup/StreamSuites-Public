const { chromium } = require("C:/Temp/codex-playwright-session/node_modules/playwright-core");
const fs = require("fs");
const http = require("http");
const path = require("path");

const workspaceRoot = path.resolve(__dirname, "../../..");
const outputPath = (name) => path.resolve(__dirname, name);
const customImageUrl = `https://api.example/api/public/wheel-media/qa-wheel-set/whl_1/${"a".repeat(32)}.webp`;
const customImagePath = path.resolve(workspaceRoot, "output/playwright/wheel-detail-v3-corrective/flattened-stage-1600x1000.png");
const presets = ["cinematic_chamber", "aurora_vault", "prism_grid", "eclipse_halo"];

function fixture({ preset = "cinematic_chamber", customImage = false, count = 6 } = {}) {
  const names = ["Main Giveaway", "VIP Draw", "Community Pick", "Sponsor Draw", "Finalists", "Bonus Round"];
  return {
    artifactCode: "qa-wheel-set",
    title: "Milestone 2.2 Premium Wheel Arena",
    slug: "qa-wheel-set",
    wheelSet: {
      activeWheelId: "whl_1",
      spinAll: { mode: "staggered", delayMs: 200 },
      wheels: Array.from({ length: count }, (_, index) => ({
        wheelId: `whl_${index + 1}`,
        name: names[index] || `Wheel ${index + 1}`,
        winnerLimit: 12,
        allowDuplicates: true,
        entries: Array.from({ length: 8 + index }, (_, entrant) => ({
          entryId: `w${index}e${entrant}`,
          displayName: ["Tully", "Big Balloon", "Daniel", "Marisol", "Avery", "Juniper", "Cosmo", "River", "Phoenix", "Sage"][entrant % 10],
          entries: (entrant % 3) + 1,
          weight: 1,
          enabled: true,
          color: ["#ff6b6b", "#ffd166", "#14b8a6", "#8b5cf6", "#38bdf8", "#ef476f", "#84cc16"][entrant % 7],
          assignment: entrant === 0 ? { public_slug: "tully", user_code: "TULLY" } : undefined
        })),
        palette: { background_color: "#08111f", text_color: "#f8fafc", accent_color: "#38bdf8", trim_color: "#7c92ff", glow_color: "#4de9ff" },
        presentation: {
          center_image_url: "/assets/placeholders/wheelcenterdefault.webp",
          stage_background_preset: preset,
          stage_background_color: ["#38bdf8", "#62d3ff", "#54e4c2", "#9b7bff"][presets.indexOf(preset)] || "#38bdf8",
          stage_background_image_url: customImage ? customImageUrl : "",
          celebration_enabled: true,
          confetti_enabled: true,
          sound_enabled: false,
          spin_duration_ms: 2000
        }
      }))
    }
  };
}

function rect(node) {
  if (!node) return null;
  const box = node.getBoundingClientRect();
  return { x: +box.x.toFixed(2), y: +box.y.toFixed(2), width: +box.width.toFixed(2), height: +box.height.toFixed(2), centerX: +(box.x + box.width / 2).toFixed(2), centerY: +(box.y + box.height / 2).toFixed(2) };
}

let server;
let browser;

(async () => {
  fs.mkdirSync(__dirname, { recursive: true });
  server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url || "/", "http://127.0.0.1").pathname);
    const relativePath = pathname === "/wheels/stage.html" || /^\/wheels\/[^/]+\/stage$/i.test(pathname)
      ? "wheels/stage.html"
      : /^\/wheels\/[^/]+$/i.test(pathname)
        ? "wheels/detail.html"
        : pathname === "/wheels"
          ? "wheels.html"
      : pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
    const filePath = path.resolve(workspaceRoot, relativePath);
    if (!filePath.startsWith(`${workspaceRoot}${path.sep}`)) { response.writeHead(403); response.end(); return; }
    fs.readFile(filePath, (error, body) => {
      if (error) { response.writeHead(404); response.end(); return; }
      const contentType = { ".css": "text/css", ".html": "text/html", ".js": "text/javascript", ".png": "image/png", ".svg": "image/svg+xml", ".webp": "image/webp", ".ttf": "font/ttf", ".woff2": "font/woff2" }[path.extname(filePath).toLowerCase()] || "application/octet-stream";
      response.writeHead(200, { "Content-Type": contentType });
      if (request.method !== "HEAD") response.end(body); else response.end();
    });
  });
  await new Promise((resolve, reject) => { server.once("error", reject); server.listen(18742, "127.0.0.1", resolve); });

  browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(`page:${String(error)}`));
  page.on("console", (message) => { if (message.type() === "error" && !message.text().includes("favicon")) errors.push(`console:${message.text()}`); });
  page.on("requestfailed", (request) => errors.push(`request:${request.url()}:${request.failure()?.errorText || "failed"}`));
  await page.route("https://api.example/**", async (route) => route.fulfill({ status: 200, contentType: "image/png", body: fs.readFileSync(customImagePath) }));
  await page.route("https://api.streamsuites.app/**", async (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: false, wheels: [], status: "unavailable" }) }));
  await page.context().route("http://127.0.0.1:18087/**", async (route) => {
    if (route.request().url().endsWith("/events")) return route.fulfill({ status: 200, contentType: "text/event-stream", body: "event: ready\ndata: {}\n\n" });
    if (route.request().url().includes("/api/public/wheels/qa-wheel-set")) return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, wheel: fixture() }) });
    if (route.request().url().endsWith("/api/public/wheels")) return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, items: [fixture()] }) });
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: false, wheels: [], status: "unavailable" }) });
  });
  await page.goto("http://127.0.0.1:18742/wheels/detail.html", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => window.StreamSuitesWheelWorkspace && document.querySelector(".public-content"));
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    const stableShell = document.querySelector(".public-shell-root").cloneNode(true);
    stableShell.querySelector(".public-content").replaceChildren();
    document.body.replaceChildren(stableShell);
  });
  errors.length = 0;

  async function mount(options = {}, owner = true) {
    await page.evaluate(({ data, isOwner }) => {
      const old = document.querySelector("[data-wheel-workspace]");
      old?._cleanupWheelWorkspace?.();
      localStorage.setItem(`streamsuites.wheel.presentation.${data.artifactCode}.inspector`, "false");
      localStorage.setItem(`streamsuites.wheel.presentation.${data.artifactCode}.title`, "false");
      document.querySelector(".public-content").replaceChildren(window.StreamSuitesWheelWorkspace.createWorkspace(data, { isOwner, sessionId: "qa-session" }));
    }, { data: fixture(options), isOwner: owner });
    await page.waitForTimeout(220);
    await page.evaluate(() => {
      const content = document.querySelector(".public-content");
      if (content) content.scrollTop = 0;
      window.scrollTo(0, 0);
    });
  }

  async function geometry(label) {
    return page.evaluate((name) => {
      const read = (selector) => {
        const node = document.querySelector(selector);
        if (!node) return null;
        const box = node.getBoundingClientRect();
        return { x: +box.x.toFixed(2), y: +box.y.toFixed(2), width: +box.width.toFixed(2), height: +box.height.toFixed(2), centerX: +(box.x + box.width / 2).toFixed(2), centerY: +(box.y + box.height / 2).toFixed(2) };
      };
      const arena = read(".wheel-spin-stage-premium");
      const wheel = read(".wheel-stage-assembly");
      const disc = read(".wheel-spin-disc");
      const pointer = read(".wheel-pointer-tip");
      const hub = read(".wheel-hub-bezel");
      const chamber = read(".wheel-arena-backplate");
      const entrant = read(".wheel-current-entrant");
      const inspector = read(".wheel-quick-inspector");
      const delta = (candidate) => candidate && arena ? +(candidate.centerX - arena.centerX).toFixed(2) : null;
      return {
        label: name,
        viewport: `${innerWidth}x${innerHeight}`,
        arena, wheel, disc, pointer, hub, chamber, entrant, inspector,
        centerDelta: { wheel: delta(wheel), disc: delta(disc), pointer: delta(pointer), hub: delta(hub), chamber: delta(chamber) },
        documentOverflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth
      };
    }, label);
  }

  const report = { geometry: [], checks: {}, performance: {}, errors };

  await mount();
  await page.screenshot({ path: outputPath("premium-focus-1440x900.png") });
  await page.locator(".wheel-stage-assembly").screenshot({ path: outputPath("premium-rim-closeup.png") });
  await page.locator(".wheel-current-entrant").screenshot({ path: outputPath("current-entrant-ready.png") });
  await page.locator(".wheel-entry-detail-card").screenshot({ path: outputPath("entrant-detail-neutral.png") });
  report.checks.titleSelector = {
    separateDeckRows: await page.locator(".wheel-deck").count(),
    trigger: await page.locator(".wheel-title-selector").count()
  };
  await page.locator(".wheel-title-selector").click();
  report.checks.titleSelector.options = await page.locator(".wheel-title-selector__option").count();
  await page.screenshot({ path: outputPath("title-wheel-selector-1440x900.png") });
  await page.locator(".wheel-title-selector__option").nth(1).click();
  report.checks.titleSelector.switchedTo = await page.locator(".wheel-title-selector .wheel-arena-title").textContent();
  await page.locator(".wheel-title-selector").focus();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("End");
  await page.keyboard.press("Enter");
  report.checks.titleSelector.keyboardSwitchedTo = await page.locator(".wheel-title-selector .wheel-arena-title").textContent();
  await mount({ count: 1 });
  report.checks.titleSelector.singleWheelTrigger = await page.locator(".wheel-title-selector").count();
  await mount();
  report.geometry.push(await geometry("inspector-open-title-open-1440x900"));

  await page.getByRole("button", { name: "Collapse inspector" }).click();
  await page.waitForTimeout(160);
  report.geometry.push(await geometry("inspector-closed-title-open-1440x900"));
  await page.screenshot({ path: outputPath("inspector-collapsed-1440x900.png") });
  report.checks.collapsedInspectorWidth = await page.locator(".wheel-quick-inspector").evaluate((node) => node.getBoundingClientRect().width);
  await page.getByRole("button", { name: "Collapse title" }).click();
  await page.waitForTimeout(120);
  report.geometry.push(await geometry("inspector-closed-title-closed-1440x900"));
  await page.screenshot({ path: outputPath("title-collapsed-1440x900.png") });
  await page.getByRole("button", { name: "Open inspector" }).click();
  await page.waitForTimeout(120);
  report.geometry.push(await geometry("inspector-open-title-closed-1440x900"));
  await page.getByRole("button", { name: "Expand title" }).click();

  for (let index = 0; index < presets.length; index += 1) {
    await mount({ preset: presets[index] });
    await page.screenshot({ path: outputPath(`preset-${index + 1}-${presets[index]}.png`) });
  }

  await mount({ preset: "cinematic_chamber", customImage: true });
  await page.screenshot({ path: outputPath("custom-stage-image-1440x900.png") });

  await mount();
  await page.getByRole("tab", { name: "Appearance" }).click();
  await page.getByRole("button", { name: "Edit appearance" }).click();
  await page.waitForTimeout(180);
  await page.screenshot({ path: outputPath("appearance-lightbox-1440x900.png") });
  report.checks.appearancePresetCards = await page.locator(".wheel-stage-preset-card").count();
  await page.locator('.wheel-stage-image-drop input[type="file"]').setInputFiles(customImagePath);
  await page.waitForTimeout(180);
  await page.screenshot({ path: outputPath("appearance-custom-preview-1440x900.png") });
  await page.getByRole("button", { name: "Close Wheel appearance" }).click();

  await mount();
  await page.getByRole("tab", { name: "Grid" }).click();
  await page.waitForTimeout(160);
  await page.screenshot({ path: outputPath("premium-grid-1440x900.png") });
  report.checks.gridHardware = await page.locator(".wheel-grid-chassis").count();

  await mount();
  await page.getByRole("button", { name: "Spin", exact: true }).click();
  await page.waitForTimeout(420);
  report.checks.spinningEntrant = await page.locator(".wheel-current-entrant__value").textContent();
  await page.screenshot({ path: outputPath("spinning-current-entrant-1440x900.png") });
  await page.waitForTimeout(1900);
  report.checks.winnerOverlay = await page.locator(".wheel-winner-overlay").count();
  await page.screenshot({ path: outputPath("winner-state-1440x900.png") });
  await page.getByRole("button", { name: "Close winner announcement" }).click();
  await page.locator(".wheel-entry-detail-card").screenshot({ path: outputPath("entrant-detail-selected.png") });

  for (const [width, height] of [[1920, 1080], [1600, 1000], [1024, 768], [768, 1024], [390, 844]]) {
    await page.setViewportSize({ width, height });
    await mount();
    report.geometry.push(await geometry(`responsive-${width}x${height}`));
    if (width === 390) {
      await page.screenshot({ path: outputPath("mobile-390x844.png") });
      await page.getByRole("button", { name: "Collapse inspector" }).click();
      report.checks.mobileCollapsedInspectorHidden = await page.locator(".wheel-quick-inspector").evaluate((node) => getComputedStyle(node).display === "none");
      report.checks.mobileInspectorLauncher = await page.locator(".wheel-mobile-inspector-launcher").isVisible();
      await page.screenshot({ path: outputPath("mobile-inspector-collapsed-390x844.png") });
    }
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await mount({ preset: "aurora_vault" });
  report.checks.reducedMotion = await page.evaluate(() => ({
    ambient: getComputedStyle(document.querySelector(".wheel-arena-atmosphere"), "::after").animationDuration,
    trim: getComputedStyle(document.querySelector(".wheel-stage-trim")).animationDuration,
    transition: getComputedStyle(document.querySelector(".wheel-spin-disc")).transitionDuration
  }));
  await page.screenshot({ path: outputPath("reduced-motion-1440x900.png") });
  await page.emulateMedia({ reducedMotion: "no-preference" });

  await mount();
  report.performance = await page.evaluate(() => {
    const root = document.querySelector("[data-wheel-workspace]");
    const focusDom = root.querySelectorAll("*").length;
    const hardwareElements = root.querySelectorAll(".wheel-stage-assembly > *").length;
    const ambientElements = root.querySelectorAll(".wheel-arena-atmosphere > *").length;
    const before = performance.now();
    for (let index = 0; index < 12; index += 1) document.querySelector(".wheel-title-overlay__toggle").click();
    const titleToggleMs = performance.now() - before;
    const switchStart = performance.now();
    [...document.querySelectorAll('[role="tab"]')].find((node) => node.textContent === "Grid").click();
    const modeSwitchMs = performance.now() - switchStart;
    return {
      focusDom,
      hardwareElements,
      ambientElements,
      titleToggleMs: +titleToggleMs.toFixed(2),
      modeSwitchMs: +modeSwitchMs.toFixed(2)
    };
  });

  await mount();
  const popupPromise = page.waitForEvent("popup", { timeout: 5000 });
  await page.getByRole("button", { name: "Pop out" }).click();
  const popup = await popupPromise;
  await popup.waitForLoadState("domcontentloaded");
  await popup.waitForSelector(".wheel-stage-chassis", { timeout: 10000 });
  report.checks.popout = {
    placeholder: await page.locator(".wheel-popped-placeholder").count(),
    sharedChassis: await popup.locator(".wheel-stage-chassis").count(),
    currentEntrant: await popup.locator(".wheel-current-entrant").count()
  };
  await page.screenshot({ path: outputPath("popout-parent-placeholder-1440x900.png") });
  await popup.screenshot({ path: outputPath("popout-stage-1440x900.png") });
  await page.getByRole("button", { name: "Dock", exact: true }).click();
  await page.waitForTimeout(180);
  report.checks.popout.docked = popup.isClosed() && (await page.getByRole("button", { name: "Pop out" }).count()) === 1;

  const stage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  stage.on("pageerror", (error) => errors.push(`stage:${String(error)}`));
  await stage.route("https://api.example/**", async (route) => route.fulfill({ status: 200, contentType: "image/png", body: fs.readFileSync(customImagePath) }));
  await stage.goto("http://127.0.0.1:18742/wheels/stage.html", { waitUntil: "domcontentloaded" });
  await stage.waitForFunction(() => window.StreamSuitesWheelWorkspace && document.querySelector("#wheel-stage-app"));
  await stage.evaluate((data) => document.querySelector("#wheel-stage-app").replaceChildren(window.StreamSuitesWheelWorkspace.createWorkspace(data, { stageMode: true, isOwner: true, sessionId: "" })), fixture({ preset: "prism_grid" }));
  await stage.waitForTimeout(220);
  report.checks.stageParity = await stage.evaluate(() => ({
    chassis: document.querySelectorAll(".wheel-stage-chassis").length,
    currentEntrant: document.querySelectorAll(".wheel-current-entrant").length,
    titleOverlay: document.querySelectorAll(".wheel-title-overlay").length,
    inspector: document.querySelectorAll(".wheel-quick-inspector").length,
    preset: document.querySelector(".wheel-focus-arena")?.dataset.stagePreset,
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth
  }));
  await stage.screenshot({ path: outputPath("stage-route-1440x900.png") });
  await stage.setViewportSize({ width: 390, height: 844 });
  await stage.waitForTimeout(180);
  report.checks.stageMobileOverflowX = await stage.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  await stage.screenshot({ path: outputPath("stage-route-390x844.png") });
  await stage.close();

  const smokeContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await smokeContext.route("https://api.example/**", async (route) => route.fulfill({ status: 200, contentType: "image/png", body: fs.readFileSync(customImagePath) }));
  await smokeContext.route("https://api.streamsuites.app/**", async (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: false, items: [], status: "unavailable" }) }));
  await smokeContext.route("http://127.0.0.1:18087/**", async (route) => {
    if (route.request().url().endsWith("/events")) return route.fulfill({ status: 200, contentType: "text/event-stream", body: "event: ready\ndata: {}\n\n" });
    if (route.request().url().includes("/api/public/wheels/qa-wheel-set")) return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, wheel: fixture() }) });
    if (route.request().url().endsWith("/api/public/wheels")) return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, items: [fixture()] }) });
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: false, items: [], status: "unavailable" }) });
  });
  const smokePage = await smokeContext.newPage();
  report.checks.smokeRoutes = {};
  for (const check of [
    { route: "/", selector: "body" },
    { route: "/wheels", selector: 'body[data-public-page="media-wheels"]' },
    { route: "/wheels/qa-wheel-set", selector: "[data-wheel-workspace]" },
    { route: "/wheels/qa-wheel-set/stage", selector: ".wheel-stage-chassis" }
  ]) {
    const response = await smokePage.goto(`http://127.0.0.1:18742${check.route}`, { waitUntil: "domcontentloaded" });
    let rendered = true;
    try { await smokePage.waitForSelector(check.selector, { timeout: 10000 }); } catch (_error) { rendered = false; }
    report.checks.smokeRoutes[check.route] = { status: response?.status() || 0, rendered };
  }
  await smokeContext.close();

  fs.writeFileSync(outputPath("qa-results.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report));
  await browser.close(); browser = null;
  await new Promise((resolve) => server.close(resolve)); server = null;
})().catch((error) => {
  console.error(error);
  Promise.resolve(browser?.close?.()).finally(() => {
    if (server) server.close(() => process.exit(1)); else process.exit(1);
  });
});
