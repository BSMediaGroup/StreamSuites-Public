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
  const publicLogin = read("public-login.html");
  const requestsLogin = read("requests-login.html");
  const shellScript = read("js/public-shell.js");

  for (const text of [publicLogin, requestsLogin, shellScript]) {
    assert.match(text, /Alternate login surfaces/);
    assert.match(text, /Creator/);
    assert.match(text, /Admin/);
    assert.match(text, /Developer/);
  }
});
