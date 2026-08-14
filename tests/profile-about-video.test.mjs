import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("public About renderer keeps Markdown story primary with optional Runtime-approved media", () => {
  const app = read("js/public-pages-app.js");
  assert.match(app, /AUTH_PUBLIC_PROFILE_ABOUT_VIDEO_RESOLVE_URL/);
  assert.match(app, /function normalizeAboutVideoProjection/);
  assert.match(app, /function buildTrustedAboutVideoIframe/);
  assert.match(app, /iframe = create\("iframe", "profile-about-video-iframe"\)/);
  assert.match(app, /iframe\.loading = "lazy"/);
  assert.match(app, /iframe\.referrerPolicy = "strict-origin-when-cross-origin"/);
  assert.match(app, /iframe\.allowFullscreen = true/);
  assert.match(app, /profile-about-layout profile-about-layout--\$\{contentState\}/);
  assert.match(app, /layout\.dataset\.profileAboutState = contentState/);
  assert.match(app, /appendSanitizedAboutProjection\(story, aboutHtml\)/);
  assert.match(app, /aboutVideo\.sourceType === "upload"/);
  assert.match(app, /video\.controls = true/);
  assert.match(app, /video\.preload = "metadata"/);
  assert.match(app, /payload\.about_video_provider\s*=/);
  assert.match(app, /payload\.about_video_source_url\s*=/);
  assert.match(app, /remove_about_video/);
  assert.match(app, /AUTH_PUBLIC_PROFILE_ABOUT_PREVIEW_URL/);
  assert.match(app, /AUTH_PUBLIC_PROFILE_ABOUT_VIDEO_UPLOAD_URL/);
  assert.match(app, /buildMarkdownAuthoringControls/);
  assert.match(app, /applyMarkdownToolbarAction/);
  assert.match(app, /URL\.revokeObjectURL/);
  assert.match(app, /https:\/\/rumble\.com\/embed\/v7bv5ia\/\?pub=vmzw3/);
  assert.match(app, /key: "vimeo"[\s\S]*https:\/\/vimeo\.com\/76979871/);
  assert.doesNotMatch(app, /key: "kick", label: "Kick Live Channel"/);
  assert.doesNotMatch(app, /YouTube, Rumble, or Kick source/);
  assert.doesNotMatch(app, /Paste a Rumble watch URL/);
  assert.doesNotMatch(app, /innerHTML\s*=\s*.*iframe/i);
  assert.doesNotMatch(app, /RUMBLE PRESENTATION/i);
});

test("public CSP permits only the required validated player and retained first-party frame origins", () => {
  const headers = read("_headers");
  assert.match(headers, /frame-src 'self'/);
  for (const origin of [
    "https://challenges.cloudflare.com",
    "https://www.youtube.com",
    "https://www.youtube-nocookie.com",
    "https://rumble.com",
    "https://player.vimeo.com",
    "https://player.kick.com",
    "https://player.twitch.tv",
  ]) {
    assert.ok(headers.includes(origin), `missing ${origin}`);
  }
  assert.doesNotMatch(headers, /frame-src[^\n]*(?:\s\*|https:;|\*\.com)/);
  assert.doesNotMatch(headers, /frame-ancestors/);
  assert.match(headers, /media-src 'self' blob: https:\/\/api\.streamsuites\.app/);
});

test("profile video shell is themed responsive and overflow-safe", () => {
  const app = read("js/public-pages-app.js");
  const css = read("css/public-profile.css");
  assert.match(css, /\.profile-about-video-frame\s*\{[\s\S]*aspect-ratio:\s*16\s*\/\s*9/);
  assert.match(css, /\.profile-about-video-iframe\s*\{[\s\S]*width:\s*100%[\s\S]*height:\s*100%/);
  assert.match(css, /var\(--profile-gradient-b\)/);
  assert.match(css, /\.profile-about-provider-selector\s*\{[\s\S]*grid-template-columns/);
  assert.match(css, /\.profile-about-layout\.has-media\s*\{[\s\S]*grid-template-columns:\s*minmax\(320px, 0\.96fr\) minmax\(0, 1\.14fr\)/);
  assert.match(app, /if \(hasStory\) layout\.appendChild\(story\);\s*if \(presentation\) layout\.appendChild\(presentation\)/);
  assert.doesNotMatch(app, /create\("span", "profile-about-video-provider"/);
  assert.match(app, /create\("img", "profile-about-video-source-icon"\)/);
  assert.match(app, /create\("div", "profile-about-footer", "PUBLIC IDENTITY \/ STREAMSUITES"\)/);
  assert.match(css, /\.profile-about-layout\.is-video-only\s*\{[\s\S]*grid-template-columns:\s*minmax\(0, 1fr\)/);
  assert.match(css, /\.profile-about-layout--video-only \.profile-about-video-presentation\s*\{[\s\S]*width:\s*min\(100%, 1120px\)/);
  assert.match(css, /@media \(max-width: 900px\)[\s\S]*grid-template-areas:\s*"story" "video"/);
});

test("profile owner action, sticky header, cover fade, and theme variables use the profile contract", () => {
  const app = read("js/public-pages-app.js");
  const css = read("css/public-profile.css");
  const headerBody = app.slice(app.indexOf("function buildStandaloneProfileHeader"), app.indexOf("async function resolveMyAboutVideo"));
  assert.doesNotMatch(headerBody, /profile-edit-open-button/);
  assert.match(app, /profile-edit-open-button--hero/);
  assert.match(app, /scrollBody\.addEventListener\("scroll", scheduleEditorSectionNavigation/);
  assert.match(app, /activateEditorSection\(activeSection\.id\)/);
  assert.match(app, /const stickyNavOffset = window\.getComputedStyle\(editorNav\)\.position === "sticky"/);
  assert.doesNotMatch(app, /profileEditProgress/);
  assert.doesNotMatch(css, /\.profile-edit-progress(?:-item)?\s*\{/);
  assert.match(app, /initializeStandaloneProfileScrollEffects/);
  assert.match(app, /requestAnimationFrame\(update\)/);
  assert.match(app, /addEventListener\("scroll", onScroll, \{ passive: true \}\)/);
  assert.match(css, /--profile-feature-bright:/);
  assert.match(css, /--profile-scroll-thumb:/);
  assert.match(css, /\.profile-overlay-header\s*\{[\s\S]*position:\s*fixed/);
  assert.match(css, /\.profile-hero-media\s*\{[\s\S]*position:\s*sticky[\s\S]*opacity:\s*calc\(1 - var\(--profile-scroll-progress/);
  assert.match(css, /\.profile-about-section::before\s*\{[\s\S]*background:\s*url\("\/assets\/logos\/ssmotfinew\.webp"\)/);
  assert.ok(fs.existsSync(new URL("../assets/logos/ssmotfinew.webp", import.meta.url)));
});

test("profile chrome uses shared actions, docked navigation, metadata chips, and route-root scrollbars", () => {
  const app = read("js/public-pages-app.js");
  const css = read("css/public-profile.css");
  const hero = app.match(/function buildStandaloneProfileHero\(profile, authState, options = \{\}\) \{[\s\S]*?return hero;\r?\n  \}/)?.[0] || "";
  const rail = app.match(/function buildProfileHeroActionRail\(profile, options = \{\}\) \{[\s\S]*?return rail;\r?\n  \}/)?.[0] || "";

  assert.match(css, /--profile-header-control-border:/);
  assert.match(css, /\.profile-header-social-btn,[\s\S]*\.profile-header-account \.account-pill[\s\S]*var\(--profile-header-control-border\)/);
  assert.doesNotMatch(css.match(/body\[data-public-page="public-profile-standalone"\] :where\(\.profile-edit-open-button--hero, \.profile-section-edit-button\)[\s\S]*?\}/)?.[0] || "", /profile-header-social/);
  assert.match(css, /\.profile-feature-action--primary/);
  assert.match(css, /\.profile-feature-action--subtle/);
  assert.match(css, /\.profile-feature-action--neutral/);
  assert.match(hero, /profile-edit-open-button--hero profile-feature-action profile-feature-action--subtle/);
  assert.doesNotMatch(hero, /buildStandaloneRoleChips/);
  assert.match(rail, /addSignal\("Identity", buildProfileTypeChip\(profile\)\)/);
  assert.match(rail, /addSignal\("Tier", buildProfileTierChip\(/);
  assert.match(app, /className: `profile-tier-chip profile-tier-chip--\$\{normalized\}`/);
  assert.match(app, /icon\.classList\.add\(badgeKind === "tier" \? "ss-tier-badge"/);
  assert.match(css, /\.profile-signal-list\s*\{[\s\S]*grid-template-columns:\s*repeat\(auto-fit, minmax\(118px, 1fr\)\)/);
  assert.match(css, /\.profile-signal-row :where\(\.profile-role-chip, \.profile-tier-chip\)\s*\{[\s\S]*white-space:\s*nowrap/);
  assert.equal((css.match(/-webkit-line-clamp:\s*2/g) || []).length, 0);
  assert.ok((css.match(/-webkit-line-clamp:\s*3/g) || []).length >= 1);
  assert.match(app, /new IntersectionObserver/);
  assert.match(app, /profile-section-nav-sentinel/);
  assert.match(app, /setProfileSectionNavInteractive\(nextNav, true, \{ hidden: false \}\)/);
  assert.match(app, /setProfileSectionNavInteractive\(previousNav, false, \{ hidden: previousNav === headerNav \}\)/);
  assert.match(app, /lastFocusedNav === previousNav \? lastFocusedHref/);
  assert.match(app, /focusTarget\?\.focus\(\{ preventScroll: true \}\)/);
  assert.match(app, /setDocked\(sentinel\.getBoundingClientRect\(\)\.top < header\.getBoundingClientRect\(\)\.bottom\)/);
  assert.match(app, /link\.tabIndex = interactive \? 0 : -1/);
  assert.match(css, /\.standalone-profile-shell\.is-profile-nav-docked \.profile-overlay-brand-text/);
  assert.match(css, /\.standalone-profile-shell\.is-profile-nav-docked > \.profile-standalone-section-nav/);
  assert.doesNotMatch(css.match(/\.profile-standalone-section-nav\s*\{[\s\S]*?\}/)?.[0] || "", /transition:[^;]*visibility/);
  assert.match(css, /html\[data-profile-page="active"\] body \*::?-webkit-scrollbar/);
  assert.match(css, /--profile-scroll-thumb-hover:/);
  assert.match(css, /--profile-scroll-thumb-active:/);
  assert.match(css, /::-webkit-scrollbar-corner/);
  assert.match(app, /clearStandaloneProfileRootTheme\(\)/);
});
