import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function loadWorkspaceApi() {
  const window = { StreamSuitesPublicConfig: {} };
  const context = vm.createContext({ window, structuredClone, URLSearchParams, console });
  vm.runInContext(read("js/wheel-workspace.js"), context, { filename: "wheel-workspace.js" });
  return window.StreamSuitesWheelWorkspace;
}

test("shared module normalizes authoritative multi-wheel identity without mutating the saved default", () => {
  const api = loadWorkspaceApi();
  const artifact = api.normalizeArtifact({
    artifact_code: "art_1",
    title: "Set",
    wheel_set: {
      active_wheel_id: "whl_b",
      spin_all: { mode: "staggered", delay_ms: 425 },
      wheels: [
        { wheel_id: "whl_a", name: "A", entries: [{ entry_id: "ent_a", display_name: "Alpha", entries: 2, weight: 3 }] },
        { wheel_id: "whl_b", name: "B", entries: [{ entry_id: "ent_b", display_name: "Bravo", entries: 1, weight: 1 }] }
      ]
    }
  });

  assert.equal(artifact.wheelSet.activeWheelId, "whl_b");
  assert.equal(artifact.wheelSet.spinAll.delayMs, 425);
  assert.deepEqual(Array.from(artifact.wheelSet.wheels, (wheel) => wheel.wheelId), ["whl_a", "whl_b"]);
  assert.equal(artifact.wheelSet.wheels[0].entries[0].effectiveWeight, 6);
});

test("weighted resolution uses entries times independent weight", () => {
  const api = loadWorkspaceApi();
  const entries = [
    { entryId: "a", displayName: "A", entries: 1, weight: 1, enabled: true },
    { entryId: "b", displayName: "B", entries: 3, weight: 2, enabled: true }
  ];
  assert.equal(api.weightedWinner(entries, () => 0.01).entryId, "a");
  assert.equal(api.weightedWinner(entries, () => 0.99).entryId, "b");
});

test("workspace source contains stable wheel-keyed local state, staggered cancellation, and one final celebration", () => {
  const source = read("js/wheel-workspace.js");
  assert.match(source, /resultsByWheel: new Map\(\)/);
  assert.match(source, /state\.resultsByWheel\.set\(wheel\.wheelId/);
  assert.match(source, /const delay = state\.authoritativeWheelSet\.spinAll\.delayMs/);
  assert.match(source, /celebrate: index === wheels\.length - 1/);
  assert.match(source, /if \(options\.runId && state\.currentSpinAll\?\.id !== options\.runId\) return/);
  assert.match(source, /function cancelSpinAll\(reason = "cancelled"\)/);
  assert.match(source, /clearScheduledTimers\(\)/);
  assert.match(source, /Local session results/);
  assert.match(source, /selectedWheelId/);
  assert.match(source, /authorityDefaultWheelId/);
  assert.match(source, /type: "set_active"/);
});

test("complex owner editors remain lightboxes and the quick inspector only launches them", () => {
  const source = read("js/wheel-workspace.js");
  for (const name of ["manageWheelsModal", "entrantManagerModal", "appearanceModal", "rulesModal", "celebrationModal", "soundModal", "shareModal"]) {
    assert.match(source, new RegExp(`function ${name}\\(`));
  }
  assert.match(source, /className = "wheel-editor-modal"|element\("section", "wheel-editor-modal"\)/);
  assert.match(source, /Manage entrants/);
  assert.match(source, /Edit appearance/);
  assert.match(source, /Sound settings/);
  assert.match(source, /Share settings/);
});

test("stage route is shell-free and uses the shared workspace implementation", () => {
  const html = read("wheels/stage.html");
  const detail = read("wheels/detail.html");
  const route = read("functions/wheels/[[artifact]].js");
  const stageApp = read("js/wheel-stage-app.js");
  assert.match(html, /wheel-workspace\.css/);
  assert.match(html, /wheel-workspace\.js/);
  assert.match(html, /wheel-stage-app\.js/);
  assert.doesNotMatch(html, /public-shell\.js|public-pages-app\.js|status-widget|public-badge-ui|profile-hovercard/);
  assert.match(detail, /wheel-workspace\.js/);
  assert.match(route, /stageRoute = \/\^\\\/wheels\\\/\[\^\/\]\+\\\/stage\$\/i/);
  assert.match(route, /stageRoute \? "\/wheels\/stage\.html" : "\/wheels\/detail\.html"/);
  assert.match(stageApp, /stageMode: true/);
});

test("popout coordination is same-origin, session-keyed, revisioned, and bounded", () => {
  const source = read("js/wheel-workspace.js");
  assert.match(source, /new BroadcastChannel\(`streamsuites-wheel:\$\{artifact\.artifactCode\}:\$\{sessionId\}`\)/);
  assert.match(source, /schema: "streamsuites\.wheel-local-session\.v1"/);
  assert.match(source, /artifactCode: artifact\.artifactCode/);
  assert.match(source, /sourceId/);
  assert.match(source, /messageId/);
  assert.match(source, /revision/);
  assert.match(source, /if \(state\.popup && !state\.popup\.closed\) \{ state\.popup\.focus\(\); return; \}/);
  assert.match(source, /state\.popupMonitor = window\.setInterval/);
  assert.match(source, /window\.clearInterval\(state\.popupMonitor\)/);
  assert.match(source, /Popup blocked\. The Stage remains docked/);
});
