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

test("shared public turnstile helper collapses auth surfaces cleanly when runtime config disables it", () => {
  const helper = read("js/turnstile-inline.js");

  assert.match(helper, /enabled:\s*payload\?\.enabled === true && sitekey\.length > 0/);
  assert.match(helper, /panel\.hidden = !state\.enabled/);
  assert.match(helper, /if \(!state\.enabled \|\| !slot\)/);
  assert.match(helper, /if \(!state\.enabled\) return "";/);
});

test("public modal surfaces keep the shared divider hook above alternate surface links", () => {
  const lander = read("index.html");
  const shell = read("js/public-shell.js");
  const auroraCss = read("css/aurora-landing.css");
  const shellCss = read("css/public-shell.css");

  assert.match(lander, /auth-modal-section-divider/);
  assert.match(shell, /auth-modal-section-divider/);
  assert.match(shell, /ss-auth-surface-links ss-auth-surface-links--compact/);
  assert.match(auroraCss, /\.auth-modal-section-divider/);
  assert.match(shellCss, /\.auth-modal-section-divider/);
});

test("public modal disclaimer links use the shared blue treatment", () => {
  const auroraCss = read("css/aurora-landing.css");
  const shellCss = read("css/public-shell.css");

  assert.match(auroraCss, /\.auth-legal a,[\s\S]*#9ad1ff/);
  assert.match(shellCss, /\.auth-legal a,[\s\S]*#9ad1ff/);
});

test("shared public-shell modal ships the lander selector set and divider rhythm", () => {
  const auroraCss = read("css/aurora-landing.css");
  const shellCss = read("css/public-shell.css");

  for (const selector of [
    ".ss-turnstile-panel",
    ".ss-turnstile-status",
    ".ss-auth-surface-links",
    ".ss-auth-surface-links__summary-label",
    ".ss-auth-surface-links__link",
  ]) {
    assert.match(auroraCss, new RegExp(selector.replaceAll(".", "\\.")));
    assert.match(shellCss, new RegExp(selector.replaceAll(".", "\\.")));
  }

  assert.match(auroraCss, /\.auth-modal-section-divider\s*\{[\s\S]*margin:\s*10px 0 0/);
  assert.match(shellCss, /\.auth-modal-section-divider\s*\{[\s\S]*margin:\s*10px 0 0/);
  assert.match(auroraCss, /\.ss-auth-surface-links\s*\{[\s\S]*margin-top:\s*8px/);
  assert.match(shellCss, /\.ss-auth-surface-links\s*\{[\s\S]*margin-top:\s*8px/);
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

test("standalone /u profile pages own the cinematic header and hero treatment", () => {
  const app = read("js/public-pages-app.js");
  const css = read("css/public-shell.css");
  const statusCss = read("css/status-widget.css");
  const profileHtml = read("u/index.html");
  const standaloneUtilityBlock = app.match(/function renderStandaloneProfileUtilityBody\(profileCard, profile, canEdit, options = \{\}\) \{[\s\S]*?\n  \}\n\n  function renderStandaloneProfilePage/)?.[0] || "";

  assert.match(app, /function renderStandaloneProfilePage\(host, profile, canEdit, options = \{\}\)/);
  assert.match(app, /buildStandaloneProfileHero\(profile, options\.authState \|\| null, options\)/);
  assert.match(app, /buildStandaloneProfileHeader\(profile, authState, options = \{\}\)/);
  assert.match(app, /buildProfileHeaderSocialRail\(profile\?\.socialLinks\)/);
  assert.match(app, /buildProfileHeaderAccountWidget\(authState/);
  assert.match(app, /profile-overlay-brand-logo/);
  assert.match(app, /\/assets\/logos\/ssnewcon\.webp/);
  assert.doesNotMatch(app, /profile-overlay-brand-icon/);
  assert.match(app, /profile-overlay-brand-text-default", "StreamSuites™"/);
  assert.match(app, /profile-overlay-brand-text-hover", "COMMUNITY HOME"/);
  assert.match(app, /profile-hero-trim/);
  assert.match(app, /profile-hero-bio-toggle/);
  assert.match(app, /bio\.scrollHeight > bio\.clientHeight \+ 2/);
  assert.match(app, /COMMUNITY HOME/);
  assert.doesNotMatch(app, /buildStandaloneProfileReturnFooter/);
  assert.ok(standaloneUtilityBlock, "standalone profile utility body should exist");
  assert.match(standaloneUtilityBlock, /profileCard\.appendChild\(buildLatestStreamSection\(profile, options\.helpers \|\| null\)\)/);
  assert.match(standaloneUtilityBlock, /buildProfileOverviewPanel\(profile, profileArtifacts/);
  assert.match(standaloneUtilityBlock, /buildProfileMiniArtifactGallery\(profileArtifacts, canEdit/);
  assert.match(standaloneUtilityBlock, /buildProfileGameCompetitionSection\(\)/);
  assert.match(standaloneUtilityBlock, /buildProfileShareSection\(profile, \{ compact: true \}\)/);
  assert.match(standaloneUtilityBlock, /buildCollapsedAuthorityRequestPanel\(resolveProfileAuthorityContext\(profile\)/);
  assert.match(app, /function buildLatestStreamSection\(profile, helpers\)/);
  assert.match(app, /alternate_sources|alternateSources/);
  assert.match(app, /function buildLatestStreamSourceButton\(stream, label\)/);
  assert.match(app, /function buildStreamPlatformPill\(stream, fallbackLabel = "Stream"\)/);
  assert.match(app, /createStreamPlatformIcon\(hasUsableStream \? stream\?\.platform : "", "profile-latest-stream-placeholder-icon-image"\)/);
  assert.match(app, /media\.classList\.add\("is-fallback-preview"\)/);
  assert.match(app, /const hasUsableStream = Boolean/);
  assert.match(app, /details\.open = hasUsableStream/);
  assert.match(app, /No livestream data available/);
  assert.match(app, /Expand for details/);
  assert.match(app, /resolveLatestStreamEmbedUrl\(stream\)/);
  assert.match(app, /function buildProfileGameCompetitionSection\(\)/);
  assert.match(app, /details\.open = true/);
  assert.match(app, /GAME & COMPETITION/);
  assert.match(app, /gamecontroller\.svg/);
  assert.match(app, /Preview-only fields\. They are not hydrated from economy, inventory, or competition services yet\./);
  assert.doesNotMatch(app, /addRow\("StreamSuites"/);
  assert.doesNotMatch(app, /addRow\("FindMeHere"/);
  assert.match(app, /function buildProfileBadgeChip\(key, options = \{\}\)/);
  assert.match(app, /function buildProfileTypeChip\(profile\)/);
  assert.match(app, /buildProfileTierChip\(profile\?\.tier \|\| "core"\)/);
  assert.match(app, /\/assets\/icons\/ui\/shieldtick\.svg/);
  assert.match(app, /\/assets\/icons\/ui\/hidden\.svg/);
  assert.match(app, /details\.open \? 'url\("\/assets\/icons\/ui\/visible\.svg"\)' : 'url\("\/assets\/icons\/ui\/hidden\.svg"\)'/);
  assert.match(app, /details\.addEventListener\("toggle", syncStateIcon\)/);
  assert.match(app, /PUBLIC AUTHORITY/);
  assert.doesNotMatch(standaloneUtilityBlock, /shareTitle\.prepend/);
  assert.match(app, /function buildNativeShareButton\(url, label\)/);

  assert.match(css, /body\[data-public-page="public-profile-standalone"\] \.public-standalone-root/);
  assert.match(css, /\.profile-cinematic-hero/);
  assert.match(css, /\.profile-overlay-header/);
  assert.match(css, /\.profile-overlay-brand-logo/);
  assert.match(css, /\.profile-overlay-brand-text\s*\{[\s\S]*letter-spacing:\s*0\.12em/);
  assert.match(css, /\.profile-overlay-brand-text\s*\{[\s\S]*text-transform:\s*none/);
  assert.match(css, /\.profile-overlay-brand-text-default\s*\{[\s\S]*font-size:\s*1\.25em/);
  assert.match(css, /\.profile-overlay-brand-text-default\s*\{[\s\S]*text-transform:\s*none/);
  assert.match(css, /\.profile-overlay-brand-text-hover\s*\{[\s\S]*text-transform:\s*none/);
  assert.match(css, /\.profile-overlay-brand:hover \.profile-overlay-brand-text-hover/);
  assert.match(css, /\.profile-header-social-panel/);
  assert.match(css, /\.profile-header-account \.account-avatar\s*\{[\s\S]*border-radius:\s*7px/);
  assert.match(css, /\.profile-hero-trim/);
  assert.match(css, /\.profile-hero-bio\s*\{[\s\S]*-webkit-line-clamp:\s*4/);
  assert.match(css, /\.profile-utility-panel\s*\{[\s\S]*backdrop-filter:\s*blur\(18px\) saturate\(122%\)/);
  assert.match(css, /\.profile-body-grid/);
  assert.match(css, /\.profile-stream-collapsible/);
  assert.match(css, /\.profile-latest-stream-card/);
  assert.match(css, /\.profile-latest-stream-card\.is-empty/);
  assert.match(css, /\.profile-latest-stream-media\.is-fallback-preview/);
  assert.match(css, /\.profile-latest-stream-placeholder-icon-image/);
  assert.match(css, /\.profile-latest-stream-sources/);
  assert.match(css, /\.profile-latest-stream-source-button/);
  assert.match(css, /\.profile-stream-platform-icon/);
  assert.match(css, /\.profile-hero-role-chip--admin,[\s\S]*--profile-role-chip-bg:\s*linear-gradient\(135deg, rgba\(255, 198, 84, 0\.42\), rgba\(255, 232, 164, 0\.12\)\)/);
  assert.match(css, /\.profile-hero-role-chip--pro,[\s\S]*\.profile-badge-chip--pro/);
  assert.match(css, /\.profile-game-section/);
  assert.match(css, /\.profile-game-collapsible/);
  assert.match(css, /\.profile-game-panel/);
  assert.match(css, /\.profile-game-preview-card/);
  assert.match(css, /\.profile-badge-chip/);
  assert.match(css, /\.profile-badge-chip-icon/);
  assert.match(css, /\.profile-overview-panel/);
  assert.match(css, /\.profile-mini-artifacts/);
  assert.match(css, /\.profile-share-section--compact \.share-box\s*\{[\s\S]*background:\s*transparent/);
  assert.match(css, /\.profile-authority-collapsible/);
  assert.match(css, /\.profile-authority-summary-action-icon/);
  assert.match(css, /share-link-brand-icon[\s\S]*-webkit-mask-image:\s*var\(--icon-mask\)/);
  assert.match(css, /\.profile-hero-role-chip,[\s\S]*\.profile-badge-chip\s*\{[\s\S]*clip-path:\s*inset\(0 round 999px\)/);
  assert.match(css, /\.profile-hero-role-chip,[\s\S]*\.profile-badge-chip\s*\{[\s\S]*contain:\s*paint/);
  assert.match(css, /\.profile-hero-role-chip::after,[\s\S]*\.profile-badge-chip::before,[\s\S]*\.profile-badge-chip::after\s*\{/);
  assert.match(css, /@keyframes profile-role-chip-sheen/);
  assert.match(css, /\.profile-return-link/);
  assert.match(css, /\.profile-shell-footer\s*\{[\s\S]*position:\s*fixed/);
  assert.match(css, /\.profile-footer-status-slot/);
  assert.match(statusCss, /body\[data-public-page="public-profile-standalone"\] \.profile-footer-status-slot \.ss-status-indicator\s*\{[\s\S]*position:\s*relative/);

  assert.match(profileHtml, /<footer class="profile-shell-footer" data-profile-shell-footer>/);
  assert.match(profileHtml, /data-status-slot data-status-slot-mode="inline"/);
  assert.match(profileHtml, /Community Home/);
});

test("standalone /u profile hydration keeps runtime profile media ahead of local fallback data", () => {
  const app = read("js/public-pages-app.js");
  const normalizeProfilePayloadBlock = app.match(/function normalizeProfilePayload\(payload, fallbackProfile, fallbackCode\) \{[\s\S]*?authorityIdentity:[\s\S]*?\n    \};\n  \}/)?.[0] || "";
  const standaloneProfileBlock = app.match(/function renderStandaloneProfile\(ctx\) \{[\s\S]*?\n  \}\n\n  function renderCommunitySettings/)?.[0] || "";

  assert.ok(normalizeProfilePayloadBlock, "normalizeProfilePayload should exist");
  assert.match(normalizeProfilePayloadBlock, /payload\?\.avatar_url \|\| payload\?\.avatarUrl \|\| fallbackProfile\?\.avatar/);
  assert.match(normalizeProfilePayloadBlock, /payload\?\.cover_image_url \|\| payload\?\.coverImageUrl \|\| fallbackProfile\?\.coverImageUrl/);
  assert.match(normalizeProfilePayloadBlock, /payload\?\.banner_image_url \|\| payload\?\.bannerImageUrl \|\| payload\?\.cover_image_url/);

  assert.ok(standaloneProfileBlock, "renderStandaloneProfile should exist");
  assert.match(standaloneProfileBlock, /await fetchPublicProfileByIdentifier\(profileCode\)/);
  assert.match(standaloneProfileBlock, /profile = normalizeProfilePayload\(payload, fallbackProfile, profileCode\)/);
  assert.match(app, /async function fetchPublicProfileByIdentifier\(identifier\)[\s\S]*cache:\s*"no-store"/);
});

test("public clip normalization does not request missing local SEO placeholder thumbnails", () => {
  const dataHub = read("js/public-data-hub.js");
  assert.match(dataHub, /const CLIP_THUMBNAIL_FALLBACK = "\/assets\/backgrounds\/seodash\.jpg"/);
  assert.match(dataHub, /function normalizeClipThumbnail\(raw\)/);
  assert.match(dataHub, /KNOWN_PUBLIC_BACKGROUND_THUMBNAILS/);
  assert.match(dataHub, /thumbnail:\s*normalizeClipThumbnail\(raw\)/);
});

test("community member hydration uses the authoritative runtime endpoint", () => {
  const dataHub = read("js/public-data-hub.js");
  const app = read("js/public-pages-app.js");

  assert.match(dataHub, /profiles:\s*"\/api\/public\/community\/members"/);
  assert.doesNotMatch(dataHub, /\/data\/profiles\.json/);
  assert.match(app, /Member directory unavailable right now/);
});

test("community member galleries keep shared alpha filtering and 20-per-page pagination", () => {
  const app = read("js/public-pages-app.js");
  const css = read("css/public-shell.css");

  assert.match(app, /const MEMBER_PAGE_SIZE = 20/);
  assert.match(app, /member-alpha-rail/);
  assert.match(app, /member-gallery-grid/);
  assert.match(app, /ctx\.state\.memberPage = 1/);
  assert.match(app, /No members match this search\/filter/);
  assert.match(css, /\.member-gallery-grid/);
  assert.match(css, /\.member-alpha-btn/);
  assert.match(css, /\.member-gallery-pagination/);
});

test("public profile route shim canonicalizes /@slug to /u/slug without adding a second profile route", () => {
  const redirects = read("_redirects");
  const app = read("js/public-pages-app.js");
  const aliasCatchAllFunction = read("functions/[[path]].js");

  assert.doesNotMatch(redirects, /^\/@\s+\/u\/index\.html 200$/m);
  assert.doesNotMatch(redirects, /^\/@\*\s+\/u\/index\.html 200$/m);
  assert.match(aliasCatchAllFunction, /const PROFILE_ALIAS_PATHNAME_RE = \/\^\\\/@\(\[\^\\\/\?#\]\+\)\\\/\?\$\/;/);
  assert.match(aliasCatchAllFunction, /if \(!isDirectProfileAliasPath\(requestUrl\.pathname\)\) \{\s*return context\.next\(\);/s);
  assert.match(aliasCatchAllFunction, /requestUrl\.pathname = "\/u\/index\.html";/);
  assert.match(aliasCatchAllFunction, /requestUrl\.search = "";/);
  assert.match(aliasCatchAllFunction, /return context\.env\.ASSETS\.fetch\(assetRequest\);/);
  assert.match(app, /function getProfileAliasSlug\(pathname\)/);
  assert.match(app, /const match = normalized\.match\(\/\^\\\/@\(\[\^\\\/\?#\]\+\)\$\/\);/);
  assert.match(app, /return normalizeUserCode\(decodePathSegment\(match\[1\]\), ""\);/);
  assert.match(app, /function getCanonicalProfileAliasUrl\(value, search = "", hash = ""\)/);
  assert.match(app, /canonicalUrl\.search = source\.search \|\| search \|\| "";/);
  assert.match(app, /canonicalUrl\.hash = source\.hash \|\| hash \|\| "";/);
  assert.match(app, /const initialAliasUrl = getCanonicalProfileAliasUrl\(window\.location\.href\);/);
  assert.match(app, /window\.history\.replaceState\(window\.history\.state, "", initialAliasUrl\.toString\(\)\);/);
  assert.match(app, /const nextUrl = getCanonicalProfileAliasUrl\(url\) \|\| url;/);
  assert.match(app, /window\.history\.pushState\(\{ path: nextUrl\.pathname \+ nextUrl\.search \}, "", nextUrl\.toString\(\)\);/);
});

test("public badge surfaces share the floating badge-tooltip helper", () => {
  const htmlFiles = walkHtml(repoRoot);
  const missing = htmlFiles
    .filter((file) => {
      const text = fs.readFileSync(file, "utf8");
      return text.includes("/js/public-pages-app.js") && !text.includes("/js/public-badge-ui.js");
    })
    .map((file) => path.relative(repoRoot, file));

  const app = read("js/public-pages-app.js");
  const shell = read("js/public-shell.js");
  const hovercard = read("assets/js/ss-profile-hovercard.js");
  const badgeUi = read("js/public-badge-ui.js");
  const css = read("css/public-shell.css");

  assert.deepEqual(missing, []);
  assert.match(app, /StreamSuitesPublicBadgeUi/);
  assert.match(shell, /StreamSuitesPublicBadgeUi/);
  assert.match(hovercard, /StreamSuitesPublicBadgeUi/);
  assert.match(badgeUi, /ss-shared-badge-tooltip/);
  assert.match(css, /\.ss-badge-floating-tooltip/);
  assert.match(css, /\.ss-badge-tooltip-target/);
});

test("members pagination buttons inherit the shared public font stack", () => {
  const css = read("css/public-shell.css");
  assert.match(css, /\.member-gallery-page-btn\s*\{[\s\S]*font-family:\s*inherit/);
});

test("community member gallery cards keep slug-first handles and the cleaned tooltip-style footer composition", () => {
  const app = read("js/public-pages-app.js");
  const dataHub = read("js/public-data-hub.js");
  const css = read("css/public-shell.css");
  const memberCardBlock = app.match(/function buildMemberGalleryCard\(profile, data\) \{[\s\S]*?return card;\n  \}/)?.[0] || "";

  assert.match(app, /function getMemberPublicHandle\(profile\)/);
  assert.match(app, /function getCanonicalSlugFromUrl\(value\)/);
  assert.match(dataHub, /function normalizeCanonicalSlug\(value\)/);
  assert.match(dataHub, /const publicSlug = normalizeCanonicalSlug/);
  assert.match(dataHub, /const SOCIAL_PLATFORM_REGISTRY = Object\.freeze\(\[/);
  assert.match(dataHub, /function collectOrderedSocialEntries\(value\)/);
  assert.match(app, /function buildMemberCardHeader\(profile\)/);
  assert.match(app, /member-gallery-card-handle/);
  assert.match(app, /entries\.slice\(0, 8\)/);
  assert.match(app, /createSocialOverflowIndicator\(entries\.length - 8\)/);
  assert.match(app, /buildSocialIconLink\(entry, "ss-profile-hovercard-social", "member-gallery-card-social-icon-image"\)/);
  assert.match(app, /function buildMemberArtifactSummary\(profile, data\)/);
  assert.ok(memberCardBlock, "member gallery card builder should exist");
  assert.doesNotMatch(memberCardBlock, /buildPlatformChip/);
  assert.doesNotMatch(memberCardBlock, /buildStatusChip/);
  assert.doesNotMatch(memberCardBlock, /watching/);
  assert.match(memberCardBlock, /body\.append\(avatar, head, bio\)/);
  assert.doesNotMatch(memberCardBlock, /member-gallery-card-identity/);
  assert.match(css, /\.member-gallery-card-subtitle/);
  assert.match(css, /\.member-gallery-card-head/);
  assert.match(css, /\.member-gallery-card-artifact-count/);
  assert.match(css, /\.member-gallery-card-social-icon-image/);
  assert.match(css, /\.social-overflow-indicator/);
});
