const { chromium } = require("C:/Temp/codex-playwright-session/node_modules/playwright-core");
const fs = require("fs");
const http = require("http");
const path = require("path");

const workspaceRoot = path.resolve(__dirname, "../../..");
const outputPath = (name) => path.resolve(__dirname, name);
const fixture = {
  artifactCode: "icon-selector-qa",
  title: "Icon Selector QA",
  description: "Local browser fixture",
  wheelSet: {
    activeWheelId: "wheel-1",
    spinAll: { mode: "staggered", delayMs: 250 },
    wheels: ["Primary Wheel", "Second Wheel"].map((name, index) => ({
      wheelId: `wheel-${index + 1}`,
      name,
      winnerLimit: 12,
      allowDuplicates: true,
      entries: ["Daniel", "Big Balloon", "Tully"].map((displayName, entrant) => ({
        entryId: `wheel-${index + 1}-entry-${entrant + 1}`,
        displayName,
        entries: entrant === 0 ? 3 : 1,
        weight: 1,
        enabled: true,
        color: ["#38bdf8", "#8b5cf6", "#f59e0b"][entrant]
      })),
      palette: { accent_color: "#38bdf8", trim_color: "#7c92ff", glow_color: "#4de9ff" },
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
    server.listen(18744, "127.0.0.1", resolve);
  });

  browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(String(error)));
  await page.goto("http://127.0.0.1:18744/wheels/detail.html", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => window.StreamSuitesWheelWorkspace && document.querySelector(".public-content"));
  await page.waitForFunction(() => document.querySelector(".page-heading h1")?.textContent.includes("unavailable"), null, { timeout: 15000 });
  await page.evaluate((data) => {
    const shell = document.querySelector(".public-shell-root").cloneNode(true);
    const host = shell.querySelector(".public-content");
    host.replaceChildren(window.StreamSuitesWheelWorkspace.createWorkspace(data, { isOwner: true, sessionId: "icon-selector-qa" }));
    document.body.replaceChildren(shell);
  }, fixture);
  await page.waitForTimeout(350);

  const inspect = () => page.locator(".wheel-workspace-view-tab").evaluateAll((buttons) => buttons.map((button) => {
    const icon = button.querySelector(".wheel-production-icon");
    const buttonStyle = getComputedStyle(button);
    const iconStyle = getComputedStyle(icon);
    return {
      label: button.getAttribute("aria-label"),
      title: button.title,
      selected: button.getAttribute("aria-selected"),
      visibleText: button.textContent.trim(),
      width: button.getBoundingClientRect().width,
      height: button.getBoundingClientRect().height,
      iconWidth: icon.getBoundingClientRect().width,
      iconHeight: icon.getBoundingClientRect().height,
      iconMask: iconStyle.webkitMaskImage || iconStyle.maskImage,
      color: buttonStyle.color
    };
  }));

  const report = { pageErrors };
  report.desktop = {
    tabs: await inspect(),
    selectorWidth: await page.locator(".wheel-workspace-view-tabs").evaluate((node) => node.getBoundingClientRect().width),
    overflow: await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  };
  await page.screenshot({ path: outputPath("icon-selector-focus-1440x900.png") });

  await page.getByRole("tab", { name: "Grid view" }).click();
  report.gridSelected = await page.getByRole("tab", { name: "Grid view" }).getAttribute("aria-selected");
  await page.getByRole("tab", { name: "Results view" }).click();
  report.resultsSelected = await page.getByRole("tab", { name: "Results view" }).getAttribute("aria-selected");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(250);
  report.mobile = {
    tabs: await inspect(),
    selectorWidth: await page.locator(".wheel-workspace-view-tabs").evaluate((node) => node.getBoundingClientRect().width),
    overflow: await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  };
  await page.getByRole("tab", { name: "Focus view" }).click();
  await page.screenshot({ path: outputPath("icon-selector-focus-390x844.png") });

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
