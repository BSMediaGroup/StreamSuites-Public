import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function walkHtml(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkHtml(full, out);
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".html")) {
      out.push(full);
    }
  }
  return out;
}

test("every public-shell route loads the shared turnstile helper", () => {
  const htmlFiles = walkHtml(repoRoot);
  const missing = htmlFiles
    .filter((file) => {
      const text = fs.readFileSync(file, "utf8");
      return text.includes("/js/public-shell.js") && !text.includes("/js/turnstile-inline.js");
    })
    .map((file) => path.relative(repoRoot, file));

  assert.deepEqual(missing, []);
});

test("public login surfaces expose alternate surface links", () => {
  const lander = read("index.html");
  const publicLogin = read("public-login.html");
  const requestsLogin = read("requests-login.html");
  const shellScript = read("js/public-shell.js");

  for (const text of [lander, publicLogin, requestsLogin, shellScript]) {
    assert.match(text, /Login to other surfaces/);
    assert.doesNotMatch(text, /Elsewhere/);
    assert.match(text, /Creator Dashboard|Public/);
    assert.match(text, /Admin Dashboard/);
    assert.match(text, /Developer Console/);
  }
});

test("public lander defers auth modal turnstile init until deferred helper is ready", () => {
  const lander = read("index.html");
  assert.match(lander, /function initLandingPageAuth\(\)/);
  assert.match(lander, /document\.addEventListener\('DOMContentLoaded', initLandingPageAuth, \{ once: true \}\)/);
  assert.match(lander, /function initLandingPageAuthModal\(\)/);
  assert.match(lander, /if \(!window\.StreamSuitesTurnstileInline\?\.createController\) \{/);
  assert.match(lander, /document\.addEventListener\('DOMContentLoaded', initLandingPageAuthModal, \{ once: true \}\)/);
  assert.match(lander, /window\.StreamSuitesTurnstileInline\?\.createController\?\.\(/);
});

test("public auth surfaces keep alternate-surface links above the lower turnstile block", () => {
  for (const relativePath of ["index.html", "public-login.html", "requests-login.html"]) {
    const html = read(relativePath);
    const surfaceLinksIndex = html.indexOf("Login to other surfaces");
    const turnstileIndex = html.indexOf("turnstile-status");
    assert.notEqual(surfaceLinksIndex, -1, `${relativePath} missing alternate surface links`);
    assert.notEqual(turnstileIndex, -1, `${relativePath} missing turnstile status slot`);
    assert.ok(surfaceLinksIndex < turnstileIndex, `${relativePath} should keep Turnstile below alternate surface links`);
  }
});

test("public account menu keeps the overview card and capability-aware console link", () => {
  const app = read("js/public-pages-app.js");
  const shell = read("js/public-shell.js");
  const css = read("css/public-shell.css");

  assert.match(app, /developer_console_access/);
  assert.match(app, /creator_workspace_access/);
  assert.match(app, /admin_access/);
  assert.match(app, /Developer Console/);
  assert.match(shell, /account-menu-overview/);
  assert.match(css, /account-menu-overview/);
});
