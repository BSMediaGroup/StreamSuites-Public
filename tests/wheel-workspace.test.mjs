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
  const context = vm.createContext({ window, structuredClone, URL, URLSearchParams, console });
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

test("slice labels rotate ninety degrees into the radial wedge axis and remain upright", () => {
  const api = loadWorkspaceApi();
  assert.equal(api.radialLabelRotation(0), 90);
  assert.equal(api.radialLabelRotation(90), 0);
  assert.equal(api.radialLabelRotation(180), -90);
  assert.equal(api.radialLabelRotation(270), 0);
  const source = read("js/wheel-workspace.js");
  assert.match(source, /rotate\(\$\{radialLabelRotation\(mid\)\}/);
  assert.doesNotMatch(source, /transform: `rotate\(\$\{mid\}/);
});

test("child Stage presentation normalizes exactly four presets, colour, and immutable media", () => {
  const api = loadWorkspaceApi();
  assert.deepEqual(Array.from(api.constants.STAGE_BACKGROUND_PRESETS, (preset) => preset.id), [
    "cinematic_chamber", "aurora_vault", "prism_grid", "eclipse_halo"
  ]);
  const artifact = api.normalizeArtifact({
    artifact_code: "art_stage",
    entries: ["A"],
    presentation: {
      stage_background_preset: "aurora_vault",
      stage_background_color: "#2468AC",
      stage_background_image_url: "https://api.example/api/public/wheel-media/art_stage/whl_alpha/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.webp"
    }
  });
  const presentation = artifact.wheelSet.wheels[0].presentation;
  assert.equal(presentation.stage_background_preset, "aurora_vault");
  assert.equal(presentation.stage_background_color, "#2468ac");
  assert.match(presentation.stage_background_image_url, /\/api\/public\/wheel-media\//);

  const unsafe = api.normalizeArtifact({
    artifact_code: "art_unsafe",
    entries: ["A"],
    presentation: {
      stage_background_preset: "unknown",
      stage_background_color: "red",
      stage_background_image_url: "blob:https://streamsuites.app/temporary"
    }
  }).wheelSet.wheels[0].presentation;
  assert.equal(unsafe.stage_background_preset, "cinematic_chamber");
  assert.equal(unsafe.stage_background_color, "#38bdf8");
  assert.equal(unsafe.stage_background_image_url, "");
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

test("production chrome is one compact toolbar with secondary actions in an accessible overflow", () => {
  const source = read("js/wheel-workspace.js");
  const toolbar = source.slice(source.indexOf("function buildProductionToolbar"), source.indexOf("function buildFocus"));
  assert.match(toolbar, /wheel-production-toolbar/);
  assert.match(toolbar, /wheel-production-identity/);
  assert.match(toolbar, /Spin All/);
  assert.match(toolbar, /if \(result\.latestResult\) play\.appendChild\(respin\)/);
  assert.match(toolbar, /buildViewSelector\(\)/);
  assert.match(toolbar, /Pop out/);
  assert.match(toolbar, /aria-haspopup", "menu/);
  assert.match(toolbar, /event\.key === "Escape"/);
  assert.match(toolbar, /document\.addEventListener\("pointerdown"/);
  for (const action of ["Add wheel", "Manage wheels", "Set as default", "Reset wheel", "Reset all"]) {
    assert.match(toolbar, new RegExp(action));
  }
  assert.match(toolbar, /if \(isOwner\)[\s\S]*Add wheel[\s\S]*Manage wheels/);
  assert.match(toolbar, /if \(state\.selectedWheelId !== state\.authorityDefaultWheelId\)[\s\S]*Set as default/);
  assert.match(toolbar, /if \(!stageMode\)[\s\S]*wheel-production-more/);
  assert.doesNotMatch(source, /wheel-workspace-header|wheel-owner-bar|wheel-production-rail/);
  assert.match(source, /root\.append\(buildProductionToolbar\(\)\)/);
  assert.doesNotMatch(source, /function buildDeck\(|wheel-deck/);
});

test("multi-wheel selection is consolidated into the accessible Stage title card", () => {
  const source = read("js/wheel-workspace.js");
  const titleSelector = source.slice(source.indexOf("function buildTitleOverlay"), source.indexOf("function buildCurrentEntrantIndicator"));
  assert.match(titleSelector, /state\.authoritativeWheelSet\.wheels\.length > 1/);
  assert.match(titleSelector, /wheel-title-selector/);
  assert.match(titleSelector, /aria-haspopup", "listbox/);
  assert.match(source, /role", "listbox/);
  assert.match(source, /role", "option/);
  assert.match(titleSelector, /event\.key === "Home"/);
  assert.match(titleSelector, /event\.key === "End"/);
  assert.match(titleSelector, /event\.key === "Escape"/);
  assert.match(titleSelector, /document\.addEventListener\("pointerdown"/);
  assert.match(titleSelector, /selectWheel\(candidate\.wheelId, true\)/);
  assert.doesNotMatch(source, /scroll wheel deck|data-wheel-deck-id|wheel-deck-card/);
});

test("responsive workspace contracts keep desktop, tablet, and mobile stage-first", () => {
  const css = read("css/wheel-workspace.css");
  assert.match(css, /\.wheel-production-toolbar\s*\{[\s\S]*grid-template-columns/);
  assert.match(css, /\.wheel-title-selector__menu\s*\{[\s\S]*position:\s*absolute/);
  assert.match(css, /@media \(max-width: 820px\)[\s\S]*grid-template-areas:[\s\S]*"identity play"[\s\S]*"utilities utilities"/);
  assert.match(css, /@media \(max-width: 820px\)[\s\S]*\.wheel-workspace-content\s*\{\s*grid-template-columns:\s*1fr/);
  assert.match(css, /@media \(max-width: 520px\)[\s\S]*\.wheel-production-presentation/);
  assert.match(css, /@media \(max-width: 520px\)[\s\S]*\.wheel-title-overlay/);
  assert.doesNotMatch(css, /\.wheel-deck/);
  assert.match(css, /overflow-x:\s*hidden/);
});

test("premium Stage structure restores hardware, overlays, inspector detail, and lightweight Grid parity", () => {
  const source = read("js/wheel-workspace.js");
  const css = read("css/wheel-workspace.css");
  const focus = source.slice(source.indexOf("function buildFocus"), source.indexOf("function gridCapacity"));
  for (const className of [
    "wheel-stage-chassis", "wheel-stage-outer-groove", "wheel-stage-marker-ring",
    "wheel-stage-light-ring", "wheel-stage-reflective-edge", "wheel-stage-inner-bezel",
    "wheel-hardware-pointer", "wheel-current-entrant", "wheel-title-overlay"
  ]) assert.match(source, new RegExp(className));
  assert.doesNotMatch(focus, /wheel-arena-header/);
  assert.match(source, /function renderEntrantDetailCard/);
  assert.match(source, /Effective probability/);
  assert.match(source, /aria-expanded/);
  assert.match(source, /wheel-mobile-inspector-launcher/);
  assert.match(source, /wheel-grid-chassis/);
  assert.match(css, /\.wheel-workspace\.is-inspector-collapsed \.wheel-workspace-content\s*\{\s*grid-template-columns:\s*minmax\(0, 1fr\) 44px/);
  assert.match(css, /\.wheel-stage-assembly\s*\{[\s\S]*place-items:\s*center/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.wheel-arena-atmosphere::after/);
});

test("Appearance lightbox owns Stage presets, colour, upload preview, cleanup, and canonical save", () => {
  const source = read("js/wheel-workspace.js");
  const appearance = source.slice(source.indexOf("function appearanceModal"), source.indexOf("function rulesModal"));
  assert.match(appearance, /STAGE_BACKGROUND_PRESETS\.forEach/);
  assert.match(appearance, /Custom image/);
  assert.match(appearance, /Stage colour \/ tint/);
  assert.match(appearance, /Browse or drop a Stage image/);
  assert.match(appearance, /stage-background-image/);
  assert.match(appearance, /5 \* 1024 \* 1024/);
  assert.match(appearance, /URL\.createObjectURL/);
  assert.match(appearance, /URL\.revokeObjectURL/);
  assert.match(appearance, /rehydrateCanonical/);
});

test("mundane wheel controls inherit the canonical Public Blinker token", () => {
  const css = read("css/wheel-workspace.css");
  assert.match(css, /\.wheel-workspace\s*\{[\s\S]*font-family:\s*var\(--public-font-body\)/);
  assert.match(css, /\.wheel-workspace button,[\s\S]*font-family:\s*var\(--public-font-body\)/);
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
  assert.match(read("js/wheel-workspace.js"), /stageMode[\s\S]*Dock[\s\S]*Open full page|stageMode[\s\S]*Dock[\s\S]*Full page/);
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
