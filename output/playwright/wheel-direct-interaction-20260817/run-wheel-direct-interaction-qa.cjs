const { chromium } = require("C:/Temp/codex-playwright-session/node_modules/playwright-core");
const fs = require("fs");
const http = require("http");
const path = require("path");

const workspaceRoot = path.resolve(__dirname, "../../..");
const outputPath = (name) => path.resolve(__dirname, name);
const fixture = {
  artifactCode: "direct-interaction-qa",
  title: "Direct Interaction QA",
  description: "Local browser fixture",
  wheelSet: {
    activeWheelId: "wheel-1",
    spinAll: { mode: "staggered", delayMs: 250 },
    wheels: ["Primary Wheel", "Second Wheel"].map((name, index) => ({
      wheelId: `wheel-${index + 1}`,
      name,
      winnerLimit: 12,
      allowDuplicates: true,
      entries: [
        { entryId: `wheel-${index + 1}-daniel`, displayName: "Daniel", entries: 3, weight: 1, enabled: true, color: "#38bdf8" },
        { entryId: `wheel-${index + 1}-balloon`, displayName: "Big Balloon", entries: 1, weight: 1, enabled: true, color: "#8b5cf6" },
        { entryId: `wheel-${index + 1}-tully`, displayName: "Tully", entries: 1, weight: 1, enabled: true, color: "#f59e0b" }
      ],
      palette: { accent_color: "#38bdf8", trim_color: "#7c92ff", glow_color: "#4de9ff" },
      presentation: {
        center_image_url: "/assets/placeholders/wheelcenterdefault.webp",
        animation_enabled: true,
        celebration_enabled: true,
        confetti_enabled: true,
        sound_enabled: false,
        spin_duration_ms: 2000
      }
    }))
  }
};

let server;
let browser;

(async () => {
  server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url || "/", "http://127.0.0.1").pathname);
    const relative = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
    const filePath = path.resolve(workspaceRoot, relative);
    if (!filePath.startsWith(`${workspaceRoot}${path.sep}`)) {
      response.writeHead(403).end();
      return;
    }
    fs.readFile(filePath, (error, body) => {
      if (error) {
        response.writeHead(404).end();
        return;
      }
      const type = { ".css": "text/css", ".html": "text/html", ".js": "text/javascript", ".svg": "image/svg+xml", ".webp": "image/webp" }[path.extname(filePath).toLowerCase()] || "application/octet-stream";
      response.writeHead(200, { "Content-Type": type }).end(body);
    });
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(18745, "127.0.0.1", resolve);
  });

  browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(String(error)));
  await page.goto("http://127.0.0.1:18745/wheels/detail.html", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => window.StreamSuitesWheelWorkspace && document.querySelector(".public-content"));
  await page.waitForFunction(() => document.querySelector(".page-heading h1")?.textContent.includes("unavailable"), null, { timeout: 15000 });

  async function mount() {
    await page.evaluate((data) => {
      const existing = document.querySelector("[data-wheel-workspace]");
      existing?._cleanupWheelWorkspace?.();
      const shell = document.querySelector(".public-shell-root").cloneNode(true);
      const host = shell.querySelector(".public-content");
      host.replaceChildren(window.StreamSuitesWheelWorkspace.createWorkspace(data, { isOwner: true, sessionId: "direct-interaction-qa" }));
      document.body.replaceChildren(shell);
    }, fixture);
    await page.waitForTimeout(250);
  }

  await mount();
  const report = { pageErrors };
  report.idleConditions = await page.evaluate(() => {
    const root = document.querySelector("[data-wheel-workspace]");
    const assembly = root.querySelector(".wheel-stage-assembly");
    const wheel = root._wheelWorkspaceState.authoritativeWheelSet.wheels[0];
    const result = root._wheelWorkspaceState.resultsByWheel.get("wheel-1");
    return {
      reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
      animationEnabled: wheel.presentation.animation_enabled,
      spinState: result.spinState,
      hovered: assembly.matches(":hover"),
      containsFocus: assembly.contains(document.activeElement),
      activeElement: document.activeElement?.className || document.activeElement?.tagName
    };
  });
  const rotation = () => page.evaluate(() => document.querySelector("[data-wheel-workspace]")._wheelWorkspaceState.resultsByWheel.get("wheel-1").rotation);
  const idleStart = await rotation();
  await page.waitForTimeout(1200);
  const idleEnd = await rotation();
  report.idleDriftDegrees = +(idleEnd - idleStart).toFixed(3);

  await page.getByRole("tab", { name: "Rules" }).click();
  await page.locator(".wheel-stage-assembly").hover();
  await page.locator('[data-wheel-entry-id="wheel-1-balloon"]').click();
  report.pointerSelection = {
    inspectorTab: await page.getByRole("tab", { name: "Entries" }).getAttribute("aria-selected"),
    inspectorText: await page.locator(".wheel-entry-detail-card").innerText(),
    overlayText: await page.locator(".wheel-current-entrant").innerText(),
    selectedClass: await page.locator('[data-wheel-entry-id="wheel-1-balloon"]').evaluate((node) => node.classList.contains("is-selected"))
  };

  await page.locator('[data-wheel-entry-id="wheel-1-tully"]').focus();
  await page.keyboard.press("Enter");
  report.keyboardSelection = {
    inspectorText: await page.locator(".wheel-entry-detail-card").innerText(),
    selectedClass: await page.locator('[data-wheel-entry-id="wheel-1-tully"]').evaluate((node) => node.classList.contains("is-selected"))
  };
  await page.screenshot({ path: outputPath("entrant-selected-1440x900.png") });

  const center = page.getByRole("button", { name: "Spin Primary Wheel" });
  report.centerButton = {
    count: await center.count(),
    enabled: await center.isEnabled(),
    width: await center.evaluate((node) => +node.getBoundingClientRect().width.toFixed(1)),
    centerImage: await page.locator(".wheel-spin-disc .wheel-svg image").getAttribute("href")
  };
  await center.focus();
  await page.screenshot({ path: outputPath("centre-spin-focus-1440x900.png") });
  await center.click();
  await page.waitForTimeout(120);
  report.centerSpinState = await page.evaluate(() => document.querySelector("[data-wheel-workspace]")._wheelWorkspaceState.resultsByWheel.get("wheel-1").spinState);
  report.centerDisabledDuringSpin = await page.getByRole("button", { name: "Spin Primary Wheel" }).isDisabled();

  await page.emulateMedia({ reducedMotion: "reduce" });
  await mount();
  const reducedStart = await rotation();
  await page.waitForTimeout(900);
  const reducedEnd = await rotation();
  report.reducedMotionDriftDegrees = +(reducedEnd - reducedStart).toFixed(3);

  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 390, height: 844 });
  await mount();
  await page.locator(".wheel-stage-assembly").hover();
  await page.locator('[data-wheel-entry-id="wheel-1-daniel"] text').click();
  report.mobile = {
    inspectorText: await page.locator(".wheel-entry-detail-card").innerText(),
    overflow: await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  };
  await page.screenshot({ path: outputPath("entrant-selected-390x844.png") });

  fs.writeFileSync(outputPath("qa-results.json"), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report));
  await browser.close();
  browser = null;
  await new Promise((resolve) => server.close(resolve));
  server = null;
})().catch((error) => {
  console.error(error);
  Promise.resolve(browser?.close?.()).finally(() => {
    server?.close?.(() => process.exit(1));
    if (!server) process.exit(1);
  });
});
