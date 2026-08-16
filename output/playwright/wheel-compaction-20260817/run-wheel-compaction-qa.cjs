const { chromium } = require("C:/Temp/codex-playwright-session/node_modules/playwright-core");
const fs = require("fs");
const http = require("http");
const path = require("path");

const outputPath = (name) => path.resolve(__dirname, name);
const workspaceRoot = path.resolve(__dirname, "../../..");
const names = [
  "Main Giveaway", "VIP Draw", "Community Pick", "Sponsor Draw", "Finalists", "Bonus Round",
  "Merch Drop", "Raid Pick", "Giveaway B", "Partners", "Aftershow", "Wild Card"
];

function fixture(count = 6) {
  return {
    artifactCode: "qa-wheel-set",
    title: "Milestone 2 Production Deck",
    slug: "qa-wheel-set",
    wheelSet: {
      activeWheelId: "wheel-1",
      spinAll: { mode: "staggered", delayMs: 200 },
      wheels: Array.from({ length: count }, (_, index) => ({
        wheelId: `wheel-${index + 1}`,
        name: names[index],
        winnerLimit: 12,
        allowDuplicates: true,
        entries: Array.from({ length: 8 + (index % 6) }, (_, entrant) => ({
          entryId: `w${index}e${entrant}`,
          displayName: `Entrant ${entrant + 1}`,
          entries: entrant % 3 + 1,
          weight: 1,
          enabled: true,
          color: ["#38bdf8", "#8b5cf6", "#f59e0b", "#14b8a6", "#ef476f", "#84cc16"][entrant % 6]
        })),
        palette: {
          accent_color: ["#38bdf8", "#a78bfa", "#f59e0b", "#14b8a6", "#ef476f", "#84cc16"][index % 6],
          trim_color: "#7c92ff",
          glow_color: "#4de9ff"
        },
        presentation: {
          center_image_url: "/assets/placeholders/wheelcenterdefault.webp",
          celebration_enabled: true,
          confetti_enabled: true,
          sound_enabled: false,
          spin_duration_ms: 2000
        }
      }))
    }
  };
}

let qaServer;
let qaBrowser;

(async () => {
  qaServer = http.createServer((request, response) => {
    if (!['GET', 'HEAD'].includes(request.method || 'GET')) {
      response.writeHead(204);
      response.end();
      return;
    }
    const pathname = decodeURIComponent(new URL(request.url || '/', 'http://127.0.0.1').pathname);
    const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
    const filePath = path.resolve(workspaceRoot, relativePath);
    if (!filePath.startsWith(`${workspaceRoot}${path.sep}`)) {
      response.writeHead(403);
      response.end();
      return;
    }
    fs.readFile(filePath, (error, body) => {
      if (error) {
        response.writeHead(404);
        response.end();
        return;
      }
      const contentType = {
        '.css': 'text/css', '.html': 'text/html', '.ico': 'image/x-icon', '.js': 'text/javascript',
        '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp'
      }[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
      response.writeHead(200, { 'Content-Type': contentType });
      if (request.method !== 'HEAD') response.end(body);
      else response.end();
    });
  });
  await new Promise((resolve, reject) => {
    qaServer.once('error', reject);
    qaServer.listen(18741, '127.0.0.1', resolve);
  });
  qaBrowser = await chromium.launch({
    headless: true,
    executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
  });
  const browser = qaBrowser;
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  page.on("console", (message) => {
    if (message.type() === "error" && !message.text().includes("127.0.0.1")) errors.push(message.text());
  });
  await page.goto("http://127.0.0.1:18741/wheels/detail.html", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => window.StreamSuitesWheelWorkspace && document.querySelector(".public-content"));
  await page.waitForFunction(() => document.querySelector(".page-heading h1")?.textContent.includes("unavailable"), null, { timeout: 15000 });
  await page.evaluate(() => {
    const stableShell = document.querySelector(".public-shell-root").cloneNode(true);
    stableShell.querySelector(".public-content").replaceChildren();
    document.body.replaceChildren(stableShell);
  });

  async function mount(count, isOwner = true, sessionId = "qa-session") {
    await page.evaluate(({ data, isOwner: owner, sessionId: session }) => {
      const old = document.querySelector("[data-wheel-workspace]");
      old?._cleanupWheelWorkspace?.();
      const host = document.querySelector(".public-content");
      host.replaceChildren(window.StreamSuitesWheelWorkspace.createWorkspace(data, { isOwner: owner, sessionId: session }));
      const title = document.querySelector(".topbar-title");
      if (title) title.textContent = data.title;
    }, { data: fixture(count), isOwner, sessionId });
    await page.waitForTimeout(320);
  }

  async function measure(label) {
    return page.evaluate((measurementLabel) => {
      const rect = (selector) => {
        const node = document.querySelector(selector);
        if (!node) return null;
        const box = node.getBoundingClientRect();
        return { top: +box.top.toFixed(1), bottom: +box.bottom.toFixed(1), height: +box.height.toFixed(1) };
      };
      const shell = rect(".public-topbar");
      const toolbar = rect(".wheel-production-toolbar");
      const deck = rect(".wheel-deck");
      const stage = rect(".wheel-workspace-content");
      const wheel = rect(".wheel-stage-assembly") || rect(".wheel-grid-graphic") || rect(".wheel-results-view");
      return {
        label: measurementLabel,
        viewport: `${innerWidth}x${innerHeight}`,
        shell,
        toolbar,
        deck,
        stage,
        wheel,
        preStage: +(stage.top - shell.bottom).toFixed(1),
        firstWheel: +(wheel.top - shell.bottom).toFixed(1),
        docOverflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        contentOverflowX: document.querySelector(".public-content")?.scrollWidth - document.querySelector(".public-content")?.clientWidth || 0
      };
    }, label);
  }

  const report = { measurements: [], checks: {}, errors };

  for (const [width, height] of [[1920, 1080], [1600, 1000], [1440, 900]]) {
    await page.setViewportSize({ width, height });
    await mount(6, true);
    report.measurements.push(await measure(`focus-${width}x${height}`));
    await page.screenshot({ path: outputPath(`owner-focus-${width}x${height}.png`) });
  }

  await mount(6, true);
  await page.getByRole("tab", { name: "Grid" }).click();
  await page.waitForTimeout(150);
  report.measurements.push(await measure("grid-1440x900"));
  report.checks.gridVisibleInitial = await page.locator(".wheel-grid-graphic").first().isVisible();
  await page.screenshot({ path: outputPath("owner-grid-1440x900.png") });

  await mount(6, true);
  await page.evaluate(() => {
    const root = document.querySelector("[data-wheel-workspace]");
    const state = root._wheelWorkspaceState;
    [...state.resultsByWheel.entries()].slice(0, 3).forEach(([id, result], index) => {
      const record = {
        wheelId: id,
        wheelName: `Wheel ${index + 1}`,
        entryId: `winner-${index}`,
        winner: `Winner ${index + 1}`,
        entries: index + 1,
        weight: 1,
        effectiveWeight: index + 1,
        probability: 0.125,
        spunAt: new Date(Date.now() - index * 1000).toISOString(),
        autoRemoved: false,
        mode: "spin",
        runId: null
      };
      result.latestResult = record;
      result.history = [record];
    });
    [...root.querySelectorAll('[role="tab"]')].find((node) => node.textContent === "Results").click();
  });
  await page.waitForTimeout(150);
  report.measurements.push(await measure("results-1440x900"));
  await page.screenshot({ path: outputPath("owner-results-1440x900.png") });

  await page.setViewportSize({ width: 1024, height: 768 });
  await mount(6, true);
  await page.getByRole("tab", { name: "Grid" }).click();
  await page.waitForTimeout(150);
  report.measurements.push(await measure("grid-1024x768"));
  await page.screenshot({ path: outputPath("owner-grid-1024x768.png") });

  await page.setViewportSize({ width: 768, height: 1024 });
  await mount(6, true);
  report.measurements.push(await measure("focus-768x1024"));
  await page.screenshot({ path: outputPath("owner-focus-768x1024.png") });

  await page.setViewportSize({ width: 390, height: 844 });
  await mount(6, false);
  report.measurements.push(await measure("visitor-focus-390x844"));
  report.checks.mobileToolbarRows = await page.locator(".wheel-production-toolbar").evaluate((node) => getComputedStyle(node).gridTemplateRows.split(" ").length);
  await page.getByRole("button", { name: "More wheel actions" }).click();
  report.checks.visitorMenuItems = await page.locator(".wheel-production-menu-item").allTextContents();
  await page.keyboard.press("Escape");
  report.checks.menuFocusReturn = await page.locator(".wheel-production-more-trigger").evaluate((node) => document.activeElement === node);
  await page.screenshot({ path: outputPath("visitor-focus-390x844.png") });

  await page.setViewportSize({ width: 1600, height: 1000 });
  await mount(12, true);
  report.measurements.push(await measure("focus-12-wheels-1600x1000"));
  report.checks.twelveWheelNav = await page.locator(".wheel-deck-nav:visible").count();
  await page.screenshot({ path: outputPath("owner-12-wheels-1600x1000.png") });

  await page.setViewportSize({ width: 1024, height: 768 });
  await mount(1, false);
  report.checks.oneWheelSpinAll = await page.getByRole("button", { name: /Spin All/ }).count();
  report.checks.oneWheelDeckNav = await page.locator(".wheel-deck-nav:visible").count();
  report.measurements.push(await measure("visitor-1-wheel-1024x768"));
  await page.screenshot({ path: outputPath("visitor-1-wheel-1024x768.png") });

  await page.setViewportSize({ width: 1440, height: 900 });
  await mount(6, true);
  await page.locator('[data-wheel-deck-id="wheel-2"]').click();
  await page.getByRole("button", { name: "More wheel actions" }).click();
  report.checks.contextMenuItems = await page.locator(".wheel-production-menu-item").allTextContents();
  await page.screenshot({ path: outputPath("owner-context-menu-1440x900.png") });
  await page.keyboard.press("Escape");

  await page.emulateMedia({ reducedMotion: "reduce" });
  await mount(6, true);
  report.checks.reducedMotionAnimation = await page.locator(".wheel-spin-disc").first().evaluate((node) => ({
    animationDuration: getComputedStyle(node).animationDuration,
    transitionDuration: getComputedStyle(node).transitionDuration
  }));
  await page.getByRole("button", { name: "Spin All" }).click();
  await page.waitForTimeout(1800);
  report.checks.spinAllHistories = await page.evaluate(() => [...document.querySelector("[data-wheel-workspace]")._wheelWorkspaceState.resultsByWheel.values()].map((value) => value.history.length));
  report.checks.spinAllComplete = await page.evaluate(() => document.querySelector("[data-wheel-workspace]")._wheelWorkspaceState.currentSpinAll === null);
  report.checks.singleWinnerOverlay = await page.locator(".wheel-winner-overlay").count();
  await page.locator(".wheel-winner-close").click();
  await page.waitForTimeout(80);
  await page.screenshot({ path: outputPath("spin-all-results-reduced-motion-1440x900.png") });
  await page.emulateMedia({ reducedMotion: "no-preference" });

  await mount(6, true, "popup-session");
  const popupPromise = page.waitForEvent("popup", { timeout: 5000 });
  await page.getByRole("button", { name: "Pop out" }).click();
  const popup = await popupPromise;
  await popup.waitForLoadState("domcontentloaded").catch(() => {});
  await page.waitForTimeout(200);
  report.checks.poppedControls = await page.locator(".wheel-production-presentation").allTextContents();
  report.checks.poppedPlaceholder = await page.locator(".wheel-popped-placeholder").count();
  await page.screenshot({ path: outputPath("owner-stage-popped-1440x900.png") });
  await page.locator(".wheel-production-toolbar").getByRole("button", { name: "Dock" }).click();
  await page.waitForTimeout(200);
  report.checks.dockedRestored = await page.getByRole("button", { name: "Pop out" }).count();
  report.checks.popupClosed = popup.isClosed();

  const stage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  stage.on("pageerror", (error) => errors.push(`stage:${String(error)}`));
  await stage.goto("http://127.0.0.1:18741/wheels/stage.html", { waitUntil: "domcontentloaded" });
  await stage.waitForFunction(() => window.StreamSuitesWheelWorkspace && document.querySelector("#wheel-stage-app"));
  await stage.waitForFunction(() => document.querySelector(".wheel-stage-error"), null, { timeout: 15000 });
  await stage.evaluate((data) => {
    const host = document.querySelector("#wheel-stage-app");
    host.replaceChildren(window.StreamSuitesWheelWorkspace.createWorkspace(data, { stageMode: true, isOwner: true, sessionId: "" }));
  }, fixture(6));
  await stage.waitForTimeout(300);
  report.checks.stageControls = await stage.locator(".wheel-production-toolbar :is(button,a)").allTextContents();
  report.checks.stageInspector = await stage.locator(".wheel-quick-inspector").count();
  report.checks.stageMore = await stage.locator(".wheel-production-more").count();
  report.checks.stageOverflowX = await stage.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  await stage.screenshot({ path: outputPath("stage-route-focus-1440x900.png") });
  await stage.setViewportSize({ width: 390, height: 844 });
  await stage.waitForTimeout(320);
  report.checks.stageMobileOverflowX = await stage.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  await stage.screenshot({ path: outputPath("stage-route-focus-390x844.png") });
  await stage.close();

  console.log(JSON.stringify(report));
  await browser.close();
  qaBrowser = null;
  await new Promise((resolve) => qaServer.close(resolve));
  qaServer = null;
})().catch((error) => {
  console.error(error);
  Promise.resolve(qaBrowser?.close?.()).finally(() => {
    qaServer?.close?.(() => process.exit(1));
    if (!qaServer) process.exit(1);
  });
});
