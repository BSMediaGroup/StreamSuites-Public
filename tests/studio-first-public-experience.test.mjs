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
  assert.match(client, /sessionStorage\.removeItem\(LEGACY_ALPHA_NOTICE_KEY\)/);
  assert.doesNotMatch(client, /sessionStorage\.(?:getItem|setItem)\(ALPHA_NOTICE_KEY/);
  assert.match(html, /sessionStorage\.removeItem\(LEGACY_DISMISS_KEY\)/);
  assert.doesNotMatch(html, /sessionStorage\.(?:getItem|setItem)\(DISMISS_KEY/);
  assert.match(html, /<script src="\/js\/studio-first-landing\.js\?v=20260809-banner-stage-interval" defer><\/script>/);
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
    "ui/clipcards.svg",
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
  assert.match(css, /\.studio-device\s*\{[\s\S]*perspective\(1600px\)[\s\S]*rotateY\(calc\(-3\.2deg \+ var\(--tilt-y\)\)\)[\s\S]*rotateX\(calc\(1\.4deg \+ var\(--tilt-x\)\)\)/);
  assert.match(css, /\.studio-device:hover\s*\{[\s\S]*rotateY\(calc\(-1\.3deg \+ var\(--tilt-y\)\)\)[\s\S]*rotateX\(calc\(\.5deg \+ var\(--tilt-x\)\)\)/);
  assert.match(css, /\.preview-state--studio \.studio-window,[\s\S]*\.studio-device:hover \.preview-state--studio \.studio-window\s*\{\s*transform:\s*none/);
  assert.match(css, /\.scroll-cue\s*\{[\s\S]*bottom:\s*6px/);
  assert.match(css, /@media \(max-width:\s*600px\)\s*\{[\s\S]*\.auth-modal-backdrop\s*\{[\s\S]*align-items:\s*center/);
  assert.match(css, /@media \(max-width:\s*720px\)/);
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)/);
});

test("production landing preserves the approved POC hero, bento modules, and authority map", () => {
  const html = read("index.html");
  const css = read("css/studio-first-landing.css");
  const client = read("js/studio-first-landing.js");

  assert.match(html, /class="scroll-cue" href="#products"/);
  assert.match(html, /Explore the suite/);
  assert.match(html, /\/css\/feature-edges\.css\?v=20260809-footer-only/);
  assert.match(html, /\/css\/studio-first-landing\.css\?v=20260809-banner-stage-tone/);
  assert.match(css, /\.landing-hero h1 span\s*\{[\s\S]*linear-gradient\(95deg,[\s\S]*background-clip:\s*text/);
  assert.match(html, /class="hero__feature-line">Run it your way\.<\/span>/);
  assert.equal((html.match(/class="hero-aurora /g) || []).length, 2);
  for (const atmosphereLayer of ["hero-depth-bloom", "hero-radiance", "hero-light-rays", "hero-light-ribbons", "hero-signal-tracers"]) {
    assert.match(html, new RegExp(`class="${atmosphereLayer}`));
    assert.match(css, new RegExp(`\\.${atmosphereLayer}`));
  }
  assert.equal((html.match(/class="hero-light-ribbons"[\s\S]*?<\/div>/g) || []).length, 1);
  assert.match(css, /\.hero-backdrop::before\s*\{[\s\S]*right:\s*auto;[\s\S]*left:\s*-20%;/);
  assert.match(css, /\.hero-horizon\s*\{[\s\S]*right:\s*auto;[\s\S]*left:\s*-14%;/);
  assert.match(css, /\.hero-constellation\s*\{[\s\S]*right:\s*auto;[\s\S]*left:\s*-5%;/);
  const featureLineRule = css.match(/\.landing-hero h1 \.hero__feature-line\s*\{[\s\S]*?\n\s*\}/)?.[0] || "";
  assert.match(featureLineRule, /var\(--product-accent\)/);
  assert.match(featureLineRule, /var\(--product-accent-bright\)/);
  assert.match(featureLineRule, /var\(--product-accent-bright\) 10%, #fbfcfe/);
  assert.match(featureLineRule, /var\(--product-accent-bright\) 55%, #edf3f7/);
  assert.match(featureLineRule, /var\(--product-accent\) 82%, #26313c/);
  assert.match(featureLineRule, /animation:\s*heroFeatureGradient 10s/);
  assert.doesNotMatch(featureLineRule, /landing-(?:blue|lime|gold)|#c2b3ff/);
  assert.match(css, /\.scroll-cue i\s*\{[\s\S]*animation:\s*scrollCue/);
  assert.match(html, /class="header-scroll-progress" aria-hidden="true"/);
  assert.match(css, /\.header-scroll-progress\s*\{[\s\S]*height:\s*3px;[\s\S]*pointer-events:\s*none/);
  assert.match(css, /\[data-status-widget-host\]\[data-footer-avoiding="true"\]/);
  assert.match(css, /transform:\s*scaleX\(var\(--scroll-progress\)\)/);
  assert.match(css, /linear-gradient\(90deg, #7957ee 0%, var\(--product-accent\) 54%, var\(--product-accent-bright\) 100%\)/);
  assert.match(client, /document\.documentElement\.scrollHeight - window\.innerHeight/);
  assert.match(client, /requestAnimationFrame/);

  assert.equal((html.match(/data-product-tab=/g) || []).length, 4);
  assert.equal((html.match(/data-product-cycle-dot=/g) || []).length, 4);
  assert.match(html, /data-product-cycle-toggle/);
  assert.match(client, /const PRODUCT_CYCLE_DELAY = 10000/);
  assert.match(client, /productCycleRequested = true/);
  assert.match(client, /scheduleProductCycle/);
  assert.match(client, /productCycleToggle\.disabled = reducedMotionQuery\.matches/);
  assert.match(client, /createPreviewTransitionLayer/);
  assert.match(client, /cloneNode\(true\)/);
  assert.match(client, /preview-transition-layer/);
  assert.match(css, /@keyframes productPreviewEnter/);
  assert.match(css, /@keyframes productPreviewExit/);
  assert.match(css, /\.preview-transition-layer\.is-leaving\s*\{[\s\S]*productPreviewExit 900ms/);
  assert.match(css, /\.preview-state\.is-active\.is-product-entering\s*\{[\s\S]*productPreviewEnter 880ms[\s\S]*previewFloat 10s 880ms/);
  assert.match(css, /\.preview-transition-layer\[data-transition-product="browser"\] \.participant/);
  assert.match(css, /\.preview-transition-layer\[data-transition-product="native"\] \.solo-streamer/);
  for (const product of ["browser", "native", "obs", "public"]) {
    assert.match(html, new RegExp(`data-product-tab="${product}"`));
    assert.match(client, new RegExp(`^\\s*${product}: \\{`, "m"));
  }
  assert.equal((html.match(/data-preview-state=/g) || []).length, 3);
  assert.match(html, /data-preview-state="studio"/);
  assert.match(html, /data-preview-state="obs"/);
  assert.match(html, /data-preview-state="public"/);
  assert.match(client, /previewStates\.forEach/);
  assert.match(client, /tab\.setAttribute\("aria-selected"/);
  assert.match(client, /tab\.tabIndex = active \? 0 : -1/);
  assert.match(client, /ctaHref:\s*"https:\/\/streamsuites\.app\/clips"/);

  for (const asset of [
    "assets/icons/icondiag-studioweb.svg",
    "assets/icons/icondiag-studioapp.svg",
    "assets/icons/obs-0.svg",
    "assets/icons/ui/clipcards.svg",
    "assets/icons/ui/scenes.svg",
    "assets/icons/ui/media.svg",
    "assets/icons/ui/community.svg",
    "assets/icons/ui/destinations-filled.svg",
    "assets/icons/ui/cast.svg",
    "assets/icons/streamsuites-0.svg",
    "assets/placeholders/livestreamer1.webp",
    "assets/placeholders/livestreamer2.webp",
    "assets/placeholders/solostreamer1.webp",
    "assets/placeholders/livecommenter1.webp",
    "assets/placeholders/livecommenter2.webp",
  ]) {
    assert.ok(exists(asset), `missing ${asset}`);
    assert.match(`${html}\n${css}\n${client}`, new RegExp(asset.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/^assets/, "\\/assets")));
  }
  assert.doesNotMatch(`${html}\n${css}\n${client}`, /file:\/\//i);
  assert.match(html, />Shorrin</);
  assert.match(html, />Tully</);
  assert.match(html, /BUBBLE BOB/);
  assert.match(html, /Is it true you guys invented Jimothy\?/);
  assert.match(client, /THIRD RAILIFY/);
  assert.match(client, /Hey bro that's a pretty nice chair you have/);
  assert.match(css, /html\[data-product="native"\] \.solo-streamer\s*\{\s*display:\s*block/);
  assert.match(html, /Authorized ingress/);
  assert.match(html, /OBS-owned output/);
  assert.match(html, /NO DUPLICATE MEDIA ENGINE/);
  assert.match(html, /ROOM<\/span><span>INVITE<\/span><span>SESSION/);
  assert.match(html, /STREAMSUITES PUBLIC/);
  assert.equal((html.match(/class="public-clip-card"/g) || []).length, 6);
  assert.match(css, /\.preview-state\s*\{[\s\S]*min-height:\s*var\(--hero-preview-height\)/);
  assert.match(client, /Math\.min\(window\.devicePixelRatio \|\| 1, 1\.5\)/);
  assert.match(client, /const count = compact \? 54 : Math\.round\(clamp\(this\.width \/ 9, 96, 156\)\)/);
  assert.match(client, /const leftWeightedCount = Math\.ceil\(count \* 0\.7\)/);
  assert.match(client, /this\.width \* \(0\.015 \+ Math\.random\(\) \* 0\.655\)/);
  assert.match(client, /this\.signals = Array\.from/);
  assert.match(client, /const signalCount = compact \? 2 : 5/);
  assert.match(client, /context\.createRadialGradient/);
  assert.match(client, /particle\.beacon/);
  assert.match(client, /const maxLinks = this\.width < 760 \? 44 : 144/);
  assert.match(client, /document\.hidden/);

  assert.equal((html.match(/data-product-card=/g) || []).length, 4);
  assert.match(html, /data-product-card="public"[\s\S]*class="product-card__number">04<[\s\S]*StreamSuites Public[\s\S]*Audience-facing artifacts/);
  assert.match(html, /Clips, polls, wheels, tallies, and scoreboards/);
  assert.match(html, /Profiles, leaderboards, economy, and progression/);
  assert.match(html, /href="\/clips">Explore Public/);
  assert.match(css, /\.product-card--public\s*\{[\s\S]*--card-accent:\s*var\(--landing-gold\)/);
  assert.match(css, /\.product-card__number\s*\{[\s\S]*position:\s*absolute;[\s\S]*top:\s*14px;[\s\S]*right:\s*18px;[\s\S]*width:\s*max-content/);
  assert.match(css, /\.product-card__topline\s*\{[\s\S]*min-height:\s*34px;[\s\S]*padding-right:\s*58px/);
  assert.match(css, /\.product-card\.glow-surface > \.product-card__number\s*\{\s*position:\s*absolute/);
  assert.match(css, /\.product-caption > \.product-cycle-controls\s*\{[\s\S]*display:\s*inline-flex/);
  assert.match(css, /\.product-caption > \.product-cycle-controls \.product-cycle-dots\s*\{[\s\S]*display:\s*inline-flex/);
  assert.match(css, /@media \(min-width:\s*1500px\)[\s\S]*grid-template-columns:\s*repeat\(4, minmax\(0, 1fr\)\)/);

  assert.match(html, /class="program-stage"[\s\S]*class="program-stage__grid"[\s\S]*class="program-stage__safe-area"[\s\S]*class="program-stage__mock-output-bg"[\s\S]*class="solo-streamer"/);
  assert.doesNotMatch(html, /program-stage__output/);
  assert.doesNotMatch(css, /\.program-stage__output/);
  assert.match(css, /\.program-stage\s*\{[\s\S]*linear-gradient\(180deg, #020306 0%, #010204 56%, #000103 100%\)/);
  assert.match(css, /\.program-stage::after\s*\{[\s\S]*var\(--product-accent\) 5%[\s\S]*opacity:\s*0\.18/);
  assert.match(css, /\.program-stage__mock-output-bg\s*\{[\s\S]*inset:\s*8%;[\s\S]*linear-gradient\(135deg, #050b12 0%, #090e17 38%, #0b0f19 61%, #03070d 100%\);[\s\S]*filter:\s*brightness\(1\.15\)/);
  assert.match(css, /\.program-stage__grid\s*\{[\s\S]*opacity:\s*0\.12/);
  assert.match(css, /\.program-stage__safe-area\s*\{[\s\S]*inset:\s*8%;[\s\S]*border:\s*1px solid/);
  assert.match(css, /\.solo-streamer\s*\{[\s\S]*inset:\s*8%;/);
  assert.match(css, /\.participant\s*\{[\s\S]*top:\s*29%;[\s\S]*width:\s*33%;[\s\S]*height:\s*40%/);
  assert.match(css, /\.lower-third\s*\{[\s\S]*right:\s*21%;[\s\S]*bottom:\s*10\.5%;[\s\S]*left:\s*21%/);
  assert.match(css, /\.floating-signal__heading\s*\{[\s\S]*grid-template-columns:\s*25px minmax\(0, 1fr\)/);
  assert.match(css, /\.floating-signal__heading strong\s*\{[\s\S]*white-space:\s*nowrap/);
  assert.match(css, /\.preview-state\.is-active > \.studio-window::before,[\s\S]*\.public-hero-preview::before[\s\S]*animation:\s*previewBorderGlint 13s/);
  assert.match(css, /\.preview-state:not\(\.is-active\):not\(\.preview-transition-layer\),[\s\S]*animation-play-state:\s*paused !important/);
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*\.hero__feature-line,[\s\S]*\.preview-state\.is-active,[\s\S]*\.floating-signal[\s\S]*animation:\s*none !important/);

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
  assert.match(html, /class="authority-node__icon" aria-hidden="true"><\/span>/);
  assert.equal((html.match(/data-topology-node=/g) || []).length, 5);
  assert.equal((html.match(/data-topology-route=/g) || []).length, 4);
  assert.equal((html.match(/authority-route__trace--halo/g) || []).length, 4);
  assert.equal((html.match(/authority-route__trace--spark/g) || []).length, 4);
  assert.equal((html.match(/authority-route__trace--packet/g) || []).length, 4);
  assert.match(html, /authority-node--browser/);
  assert.match(html, /authority-node--public/);
  assert.match(html, /authority-node--native/);
  assert.match(html, /authority-node--obs/);
  assert.match(html, /Not a production media engine/);
  assert.match(html, /legend-line--authority/);
  assert.match(html, /legend-line--media/);
  assert.match(css, /\.authority-map__grid\s*\{[\s\S]*background-size:\s*31px 31px/);
  assert.match(css, /\.authority-route__trace--halo\s*\{[\s\S]*stroke-width:\s*8/);
  assert.match(css, /\.authority-map\[data-active-route="browser"\]\s*\{ --topology-active-color:\s*var\(--landing-blue-bright\); \}/);
  assert.match(css, /\.authority-map\[data-active-route="native"\]\s*\{ --topology-active-color:\s*var\(--landing-lime-bright\); \}/);
  assert.match(css, /\.authority-map\[data-active-route="obs"\]\s*\{ --topology-active-color:\s*#b8a6ff; \}/);
  assert.match(css, /\.authority-map\[data-active-route="public"\]\s*\{ --topology-active-color:\s*var\(--landing-gold-bright\); \}/);
  assert.match(css, /\.authority-map \.authority-node--core\s*\{[\s\S]*var\(--topology-active-color\)[\s\S]*transition:\s*border-color 880ms/);
  assert.match(css, /@keyframes topologyCoreDispatch\s*\{[\s\S]*var\(--topology-active-color\) 9%[\s\S]*var\(--topology-active-color\) 18%/);
  assert.match(css, /@media \(max-width: 720px\)\s*\{\s*\.studio-device,[\s\S]*\.floating-signal--destinations\s*\{\s*display:\s*none/);
  assert.match(css, /\.authority-map \.authority-node--core \.authority-node__icon\s*\{[\s\S]*color:\s*var\(--topology-active-color\)/);
  assert.match(css, /@keyframes topologyRouteTrace/);
  assert.match(client, /const outward = route\.id === "browser" \|\| route\.id === "native"/);
  assert.match(client, /new IntersectionObserver/);
  assert.match(client, /visibilitychange/);
  assert.match(client, /Static authority topology/);
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*\.authority-route__trace/);
});

test("approved typography is centralized without external font requests", () => {
  const fonts = read("css/public-fonts.css");
  const landing = read("css/studio-first-landing.css");
  const shell = read("css/public-shell.css");
  const shared = read("css/public-pages-v2.css");
  const download = read("css/download-surface.css");

  for (const expected of [
    "/assets/fonts/Tektur-VariableFont_wdth,wght.ttf",
    "/assets/fonts/body/Blinker-Thin.ttf",
    "/assets/fonts/body/Blinker-ExtraLight.ttf",
    "/assets/fonts/body/Blinker-Light.ttf",
    "/assets/fonts/body/Blinker-Regular.ttf",
    "/assets/fonts/body/Blinker-SemiBold.ttf",
    "/assets/fonts/body/Blinker-Bold.ttf",
    "/assets/fonts/body/Blinker-ExtraBold.ttf",
    "/assets/fonts/body/Blinker-Black.ttf",
    "/assets/fonts/mono/IBMPlexMono-Regular.ttf",
    "/assets/fonts/mono/IBMPlexMono-Medium.ttf",
    "/assets/fonts/mono/IBMPlexMono-SemiBold.ttf",
  ]) {
    assert.match(fonts, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.ok(exists(expected.slice(1)), `missing ${expected}`);
  }

  assert.match(fonts, /font-display:\s*swap/g);
  assert.match(fonts, /--public-font-display:\s*"Tektur"/);
  assert.match(fonts, /--public-font-body:\s*"Blinker"/);
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
