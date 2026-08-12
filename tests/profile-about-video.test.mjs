import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("public About renderer selects text or one Runtime-approved video iframe", () => {
  const app = read("js/public-pages-app.js");
  assert.match(app, /AUTH_PUBLIC_PROFILE_ABOUT_VIDEO_RESOLVE_URL/);
  assert.match(app, /function normalizeAboutVideoProjection/);
  assert.match(app, /function buildTrustedAboutVideoIframe/);
  assert.match(app, /iframe = create\("iframe", "profile-about-video-iframe"\)/);
  assert.match(app, /iframe\.loading = "lazy"/);
  assert.match(app, /iframe\.referrerPolicy = "strict-origin-when-cross-origin"/);
  assert.match(app, /iframe\.allowFullscreen = true/);
  assert.match(app, /if \(aboutMode === "video" && aboutVideo\)/);
  assert.match(app, /else if \(aboutMode === "video"\)/);
  assert.match(app, /about_mode:/);
  assert.match(app, /payload\.about_video_provider\s*=/);
  assert.match(app, /payload\.about_video_source_url\s*=/);
  assert.match(app, /remove_about_video/);
  assert.doesNotMatch(app, /innerHTML\s*=\s*.*iframe/i);
});

test("public CSP permits only the required validated player and retained first-party frame origins", () => {
  const headers = read("_headers");
  assert.match(headers, /frame-src 'self'/);
  for (const origin of [
    "https://challenges.cloudflare.com",
    "https://www.youtube.com",
    "https://www.youtube-nocookie.com",
    "https://rumble.com",
    "https://player.kick.com",
    "https://player.twitch.tv",
  ]) {
    assert.ok(headers.includes(origin), `missing ${origin}`);
  }
  assert.doesNotMatch(headers, /frame-src[^\n]*(?:\s\*|https:;|\*\.com)/);
  assert.doesNotMatch(headers, /frame-ancestors/);
});

test("profile video shell is themed responsive and overflow-safe", () => {
  const css = read("css/public-profile.css");
  assert.match(css, /\.profile-about-video-frame\s*\{[\s\S]*aspect-ratio:\s*16\s*\/\s*9/);
  assert.match(css, /\.profile-about-video-iframe\s*\{[\s\S]*width:\s*100%[\s\S]*height:\s*100%/);
  assert.match(css, /var\(--profile-gradient-b\)/);
  assert.match(css, /\.profile-about-provider-selector\s*\{[\s\S]*grid-template-columns/);
});
