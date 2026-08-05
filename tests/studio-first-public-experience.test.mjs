import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const exists = (relative) => fs.existsSync(path.join(root, relative));

test("production landing is Studio-first and preserves the production access contracts", () => {
  const html = read("index.html");
  const client = read("js/studio-first-landing.js");
  const css = read("css/studio-first-landing.css");

  assert.match(html, /StreamSuites Studio/);
  assert.match(html, /StreamSuites StudioApp/);
  assert.match(html, /StreamSuites Studio for OBS/);
  assert.match(html, /https:\/\/studio\.streamsuites\.app/);
  assert.match(html, /\/downloads\/studioapp\//);
  assert.match(html, /\/downloads\/obs-plugin\//);
  assert.match(html, /Cloudflare RealtimeKit/);
  assert.match(html, /supervised native C\+\+ media engine|supervising a C\+\+20 engine/i);
  assert.match(html, /OBS remains the media owner|OBS retains its media pipeline/i);
  assert.match(html, /Runtime\/Auth/);
  assert.match(html, /not a WebView/i);
  assert.match(html, /not an OBS fork/i);
  assert.match(html, /OFF AIR/);
  assert.match(html, /broadcast output (?:remains unimplemented|are not shipped)/i);
  assert.doesNotMatch(html, /broadcast-grade|generally available/i);

  for (const hook of [
    "landing-lockout-banner",
    "auth-modal",
    "data-auth-trigger=\"login\"",
    "data-auth-oauth=\"google\"",
    "data-auth-oauth=\"github\"",
    "data-auth-oauth=\"x\"",
    "data-auth-oauth=\"discord\"",
    "data-auth-oauth=\"twitch\"",
    "data-auth-turnstile-panel",
    "data-auth-access-gate",
  ]) {
    assert.match(html, new RegExp(hook));
  }

  for (const contract of [
    "/auth/access-state",
    "/auth/session",
    "/auth/turnstile/config",
    "/debug/unlock",
    "/auth/login",
    "/signup/email",
  ]) {
    assert.match(html, new RegExp(contract.replaceAll("/", "\\/")));
  }

  assert.match(html, /\/js\/utils\/version-stamp\.js/);
  assert.match(html, /\/js\/status-widget\.js/);
  assert.match(html, /\/js\/turnstile-inline\.js/);
  assert.match(html, /\/js\/studio-first-landing\.js/);
  assert.match(html, /class="brand"[\s\S]*class="brand__mark" src="\/assets\/logos\/ssmainlogosq\.webp"[\s\S]*class="brand__wordmark" src="\/assets\/logos\/wmnew\.webp"/);
  assert.ok(exists("assets/logos/wmnew.webp"));
  assert.ok(exists("assets/logos/ssmainlogosq.webp"));
  assert.ok(exists("assets/icons/ui/info.svg"));
  assert.ok(exists("assets/icons/ui/close.svg"));
  assert.match(html, /data-header-login-menu/);
  assert.match(html, /href="\/public-login\.html"[^>]*role="menuitem">Public</);
  assert.match(html, /href="https:\/\/studio\.streamsuites\.app\/login"[^>]*role="menuitem">Studio</);
  assert.match(html, /href="https:\/\/console\.streamsuites\.app\/login\/"[^>]*role="menuitem">Developer</);
  const headerLoginMenu = html.match(/<div class="header-login-menu"[\s\S]*?<\/div>\s*<a class="button button--primary/)?.[0] || "";
  assert.ok(headerLoginMenu, "landing header login dropdown should exist");
  assert.doesNotMatch(headerLoginMenu, /Admin/i);
  assert.match(client, /ArrowLeft/);
  assert.match(client, /ArrowRight/);
  assert.match(client, /prefers-reduced-motion:\s*reduce/);
  assert.match(client, /IntersectionObserver/);
  assert.match(client, /sessionStorage/);
  assert.match(client, /querySelectorAll\("\[data-auth-trigger\]"\)/);
  assert.match(client, /setNavOpen\(false\), \{ capture: true \}/);
  assert.match(client, /pointerenter/);
  assert.match(client, /focusin/);
  assert.match(css, /\.landing-lockout-banner__eyebrow-icon\s*\{[\s\S]*\/assets\/icons\/ui\/info\.svg/);
  assert.match(css, /\.landing-lockout-banner__close-icon\s*\{[\s\S]*\/assets\/icons\/ui\/close\.svg/);
  assert.match(css, /\.header-login-menu:hover \.header-login-menu__dropdown/);
  assert.match(css, /\.auth-modal-backdrop\.is-open/);
  assert.match(css, /\.ss-auth-access-gate__icon\s*\{[\s\S]*\/assets\/icons\/ui\/key\.svg/);
  assert.match(css, /\.ss-auth-surface-links__summary-label\s*\{[\s\S]*font-size:\s*11px/);
  assert.match(css, /body\s*\{[\s\S]*margin:\s*0;[\s\S]*padding:\s*0;/);
  assert.match(css, /\.brand__mark\s*\{[\s\S]*width:\s*34px;[\s\S]*height:\s*34px;/);
  assert.match(css, /\.brand__wordmark[\s\S]*height:\s*24px;/);
  for (const icon of [
    "icondiag-studioweb.svg",
    "icondiag-studioapp.svg",
    "obs-0.svg",
    "streamsuites-0.svg",
    "alpha.svg",
  ]) {
    assert.ok(exists(`assets/icons/${icon}`));
    assert.match(css, new RegExp(icon.replace(".", "\\.")));
  }
  assert.match(html, /class="studio-mark" aria-hidden="true"><\/span>/);
  assert.match(html, /class="alpha-panel__mark" aria-hidden="true"><\/div>/);
  assert.match(css, /\.product-switcher\s*\{[\s\S]*z-index:\s*2/);
  assert.match(css, /\.product-emblem\s*\{[\s\S]*width:\s*24px;[\s\S]*height:\s*24px;[\s\S]*background-color:\s*currentColor;[\s\S]*mask-size:\s*contain/);
  assert.match(css, /\.product-emblem--browser\s*\{[\s\S]*icondiag-studioweb\.svg/);
  assert.match(css, /\.product-emblem--native\s*\{[\s\S]*icondiag-studioapp\.svg/);
  assert.match(css, /\.product-emblem--obs\s*\{[\s\S]*obs-0\.svg/);
  assert.doesNotMatch(css, /\.product-emblem--(?:browser|native|obs)::(?:before|after)/);
  assert.match(css, /\.studio-device\s*\{[\s\S]*z-index:\s*4;[\s\S]*margin-top:\s*-2px/);
  assert.match(css, /\.studio-window\s*\{[\s\S]*transition:[\s\S]*transform 560ms cubic-bezier/);
  assert.match(css, /\.studio-device:hover \.studio-window\s*\{[\s\S]*rotateY\(-1\.15deg\)/);
  assert.match(css, /\.scroll-cue\s*\{[\s\S]*bottom:\s*6px/);
  assert.match(css, /@media \(max-width:\s*600px\)\s*\{[\s\S]*\.auth-modal-backdrop\s*\{[\s\S]*align-items:\s*center/);
  assert.match(css, /@media \(max-width:\s*720px\)/);
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)/);
});

test("production landing preserves the approved POC hero, bento modules, and authority map", () => {
  const html = read("index.html");
  const css = read("css/studio-first-landing.css");

  assert.match(html, /class="scroll-cue" href="#products"/);
  assert.match(html, /Explore the suite/);
  assert.match(html, /\/css\/studio-first-landing\.css\?v=20260806-card-icons/);
  assert.match(css, /\.landing-hero h1 span\s*\{[\s\S]*linear-gradient\(95deg,[\s\S]*background-clip:\s*text/);
  assert.match(css, /\.scroll-cue i\s*\{[\s\S]*animation:\s*scrollCue/);

  assert.match(html, /class="bento-grid"/);
  for (const moduleClass of ["rooms", "destinations", "chat", "alerts", "engagement", "media"]) {
    assert.match(html, new RegExp(`bento-card--${moduleClass}`));
  }
  for (const detailClass of ["bento-card__icon", "mini-room-list", "destination-row", "chat-stack", "alert-wave", "engagement-pills", "media-strip"]) {
    assert.match(html, new RegExp(detailClass));
    assert.match(css, new RegExp(`\\.${detailClass}`));
  }
  for (const publicRoute of ["/clips", "/polls", "/wheels", "/tallies", "/leaderboards", "/live"]) {
    assert.match(html, new RegExp(`href="${publicRoute}"`));
  }
  assert.doesNotMatch(html, /class="capability-grid"/);

  assert.match(html, /class="authority-map__grid"/);
  assert.match(html, /class="authority-node__icon"[^>]*>S<\/span>/);
  assert.equal((html.match(/class="authority-node__accent"/g) || []).length, 3);
  assert.match(html, /authority-branch--browser[\s\S]*?branch-line[\s\S]*?authority-node--surface/);
  assert.match(html, /legend-line--authority/);
  assert.match(html, /legend-line--media/);
  assert.match(css, /\.authority-map__grid\s*\{[\s\S]*background-size:\s*31px 31px/);
  assert.match(css, /\.authority-branch--native \.branch-line\s*\{[\s\S]*border-radius:\s*18px 0 0/);
  assert.match(css, /\.authority-branch--obs \.branch-line\s*\{[\s\S]*border-radius:\s*0 18px 0 0/);
});

test("approved typography is centralized without external font requests", () => {
  const fonts = read("css/public-fonts.css");
  const landing = read("css/studio-first-landing.css");
  const shell = read("css/public-shell.css");
  const shared = read("css/public-pages-v2.css");
  const download = read("css/download-surface.css");

  for (const expected of [
    "/assets/fonts/Tektur-VariableFont_wdth,wght.ttf",
    "/assets/fonts/Geist-Regular.ttf",
    "/assets/fonts/Geist-Medium.ttf",
    "/assets/fonts/Geist-SemiBold.ttf",
    "/assets/fonts/Geist-Bold.ttf",
    "/assets/fonts/mono/IBMPlexMono-Regular.ttf",
    "/assets/fonts/mono/IBMPlexMono-Medium.ttf",
    "/assets/fonts/mono/IBMPlexMono-SemiBold.ttf",
  ]) {
    assert.match(fonts, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.ok(exists(expected.slice(1)), `missing ${expected}`);
  }

  assert.match(fonts, /font-display:\s*swap/g);
  assert.match(fonts, /--public-font-display:\s*"Tektur"/);
  assert.match(fonts, /--public-font-body:\s*"Geist Sans"/);
  assert.match(fonts, /--public-font-mono:\s*"IBM Plex Mono"/);
  [fonts, landing, shell, shared, download].forEach((css) => {
    assert.doesNotMatch(css, /https?:\/\/[^)"']+\.(?:woff2?|ttf|otf)/i);
  });
  assert.doesNotMatch(download, /SuiGeneris|Recharge/);
});

test("About tells the current product story and keeps its manifest renderer hooks", () => {
  const html = read("about.html");
  const part1 = JSON.parse(read("about/about_part1_core.json"));
  const part2 = JSON.parse(read("about/about_part2_platforms_interfaces.json"));
  const part3 = JSON.parse(read("about/about_part3_about_system_spec.json"));

  assert.match(html, /Production at the center/);
  assert.match(html, /Browser Studio/);
  assert.match(html, /StudioApp/);
  assert.match(html, /Studio for OBS/);
  assert.match(html, /One authority\. Separate media paths/);
  assert.match(html, /Brainstream Media Group/);
  assert.match(html, /id="public-about-errors"/);
  assert.match(html, /id="public-about-sections"/);
  assert.match(html, /id="public-about-version-meta"/);
  assert.match(html, /\/js\/public-about\.js/);
  assert.equal(part1.lastUpdated, "2026-07-31");
  assert.equal(part2.lastUpdated, "2026-07-31");
  assert.equal(part3.lastUpdated, "2026-07-31");

  const narrative = JSON.stringify([part1, part2, part3]);
  assert.match(narrative, /connected livestream-production suite/i);
  assert.match(narrative, /Cloudflare RealtimeKit/);
  assert.match(narrative, /WPF/);
  assert.match(narrative, /OBS-owned|OBS retains/);
  assert.match(narrative, /None of these media paths terminates in Python/);
  assert.doesNotMatch(narrative, /organized into three repositories|fully client-side with no authentication/);
});

test("functional shell connects to real product routes without changing route contracts", () => {
  const shell = read("js/public-shell.js");
  const pages = read("js/public-pages-app.js");
  const redirects = read("_redirects");

  assert.match(shell, /products:\s*"Production"/);
  assert.match(shell, /NAV_GROUP_ORDER = Object\.freeze\(\["dashboard", "products", "community", "account", "quick"\]\)/);
  assert.match(shell, /https:\/\/studio\.streamsuites\.app/);
  assert.match(shell, /\/downloads\/studioapp\//);
  assert.match(shell, /\/downloads\/obs-plugin\//);
  assert.match(shell, /\/assets\/logos\/ssmainlogosq\.webp/);
  assert.match(shell, /logo\.src = "\/assets\/logos\/ssmainlogosq\.webp"/);
  assert.match(read("css/public-shell.css"), /body\.public-shell-page \.sidebar-brand-title\s*\{[\s\S]*font-weight:\s*700/);
  assert.match(read("css/public-shell.css"), /body\.public-shell-page \.sidebar-brand-subheading-text\s*\{[\s\S]*font-weight:\s*400/);
  assert.match(read("css/public-shell.css"), /body\.public-shell-page \.account-menu-overview-value\s*\{[\s\S]*font-family:\s*ui-monospace/);
  assert.match(shell, /isMobileViewport\(\) && initialSidebarState === SIDEBAR_STATES\.expanded[\s\S]*\? SIDEBAR_STATES\.icon/);
  assert.match(pages, /title:\s*"Public Dashboard"/);
  assert.match(pages, /Runtime\/Auth-owned public state/);
  assert.doesNotMatch(pages, /Leaderboards", value: "Scaffold"/);
  assert.ok(exists("home.html"));
  assert.match(redirects, /\/downloads\/studioapp \/downloads\/studioapp\/index\.html 200/);
  assert.match(redirects, /\/downloads\/obs-plugin \/downloads\/obs-plugin\/index\.html 200/);
});

test("application and standalone Public surfaces use the restrained premium polish layers", () => {
  const shellCss = read("css/public-shell.css");
  const pagesCss = read("css/public-pages-v2.css");
  const loginCss = read("css/public-login.css");
  const requestAuthCss = read("css/requests-auth.css");

  assert.match(shellCss, /2026-08 Creator\/Public polish/);
  assert.match(shellCss, /\.public-content > \*\s*\{[\s\S]*max-width:\s*1540px/);
  assert.match(shellCss, /\.home-action-grid\s*\{[\s\S]*min\(100%, 235px\)/);
  assert.match(shellCss, /\.sidebar-link\.active\s*\{[\s\S]*inset 3px 0 0 #68c3ff/);
  assert.match(shellCss, /\.public-main:has\(> \.public-lockout-banner:not\(\[hidden\]\)\) \.public-content/);
  assert.match(shellCss, /@keyframes public-route-enter/);
  assert.match(pagesCss, /body:not\(\.download-surface\) :where\(\.public-hero, \.public-glass-panel\)/);
  assert.match(pagesCss, /@keyframes public-page-enter/);
  assert.match(loginCss, /Public auth presentation harmonization/);
  assert.match(requestAuthCss, /Requests auth follows the same cooler Public presentation/);
  assert.doesNotMatch(read("index.html"), /public-shell\.css|public-pages-v2\.css/);
});

test("POC references remain intact and obsolete live landing CSS is retired", () => {
  assert.ok(exists("sspoc1/index.html"));
  assert.ok(exists("sspoc1/styles.css"));
  assert.ok(exists("StreamSuites-Landing-POC-Option-1-Typography.zip"));
  assert.ok(exists("index-v2.html"));
  assert.ok(exists("css/aurora-landing-v2.css"));
  assert.equal(exists("css/aurora-landing.css"), false);
  assert.doesNotMatch(read("index.html"), /data-about-slide|data-about-progress|about-open/);
});
