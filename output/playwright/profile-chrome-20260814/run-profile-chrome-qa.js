const { chromium } = require("C:/Temp/codex-playwright-session/node_modules/playwright-core");
const fs = require("node:fs");
const path = require("node:path");

const baseUrl = "http://127.0.0.1:18089/u/bsmediagroup?profile_chrome_qa=1";
const outputDir = __dirname;

const baseProfile = {
  public_slug: "bsmediagroup",
  user_code: "YR992ZS",
  display_name: "Admin",
  role: "ADMIN",
  account_type: "ADMIN",
  tier: "PRO",
  bio: "Administrator account for StreamSuites systems. This deliberately long biography verifies the three-line hero clamp across desktop, tablet, and mobile without changing the authoritative stored profile content or the expanded About story.",
  about: "## Testing title\n\nAdministrator account for StreamSuites systems. For assistance, contact support@streamsuites.app.",
  about_html: "<h2>Testing title</h2><p>Administrator account for StreamSuites systems. For assistance, contact support@streamsuites.app.</p>",
  about_video_enabled: true,
  about_video_source_type: "upload",
  about_video: {
    source_type: "upload",
    public_url: "https://streamsuites.app/profile-media/u/YR992ZS/about-video/0123456789abcdef0123456789abcdef.mp4",
    mime_type: "video/mp4",
    title: "Birthday attempt 3",
    file_size: 1048576,
  },
  about_video_upload: { enabled: true, max_bytes: 52428800, mime_types: ["video/mp4", "video/webm"] },
  about_video_providers: [],
  streamsuites_theme_preset: "signal_red",
  avatar_url: "",
  cover_image_url: "/assets/placeholders/defaultprofilecover.webp",
  background_image_url: "",
  streamsuites_profile_enabled: true,
  streamsuites_profile_eligible: true,
  streamsuites_profile_visible: true,
  streamsuites_profile_url: "https://streamsuites.app/u/bsmediagroup",
  streamsuites_share_url: "https://streamsuites.app/u/bsmediagroup",
  social_links: {
    rumble: "https://rumble.com/c/bsmediagroup",
    youtube: "https://www.youtube.com/@bsmediagroup",
    twitch: "https://www.twitch.tv/bsmediagroup",
    discord: "https://discord.gg/streamsuites"
  },
  badges: [{ key: "admin", label: "Admin", kind: "role", value: "admin" }],
  inventory: [{
    item_code: "material.fabric",
    quantity: 2,
    definition: {
      label: "Fabric",
      category: "Materials",
      rarity: "Common",
      description: "Flexible fabric for cosmetic crafting, supply bundles, and soft-material recipes."
    }
  }],
  is_anonymous: false,
  is_listed: true,
};

function profileForState(state) {
  if (state === "video-only") return { ...baseProfile, about: "", about_html: "" };
  if (state === "story-only") return { ...baseProfile, about_video_enabled: false, about_video: null };
  return { ...baseProfile };
}

async function installFixtureRoutes(page, options) {
  let profile = { ...profileForState(options.aboutState || "story-video"), ...(options.profileOverrides || {}) };
  await page.route("**/profile-media/u/YR992ZS/about-video/*.mp4", (route) => route.fulfill({
    path: path.resolve(__dirname, "../../../clips/sampleclip00.mp4"),
    contentType: "video/mp4"
  }));
  await page.route("**/api/public/me", (route) => route.fulfill({
    json: options.owner
      ? { authenticated: true, account_id: "owner-fixture", user_code: "YR992ZS", public_slug: "bsmediagroup", display_name: profile.display_name, role: profile.role, account_type: profile.account_type, tier: profile.tier }
      : { authenticated: false }
  }));
  await page.route("**/api/public/profile/me", (route) => route.fulfill({ json: { success: true, profile } }));
  await page.route("**/api/public/profile?**", (route) => route.fulfill({ json: { success: true, profile } }));
  await page.route("**/api/public/progression/**", (route) => route.fulfill({ status: 404, json: { success: false } }));
  await page.route("**/api/public/profile/about/preview", (route) => route.fulfill({ json: { success: true, about_html: profile.about_html } }));
  await page.route("**/api/public/profile/about-video/resolve", (route) => route.fulfill({ status: 400, json: { success: false, error: "Fixture only" } }));
}

async function waitForProfile(page, owner) {
  await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.locator(".standalone-profile-shell").waitFor({ state: "visible", timeout: 30000 });
  if (owner) await page.locator(".profile-edit-open-button--hero").waitFor({ state: "visible" });
  await page.waitForTimeout(350);
}

async function collectPageState(page, label) {
  return page.evaluate((stateLabel) => {
    const shell = document.querySelector(".standalone-profile-shell");
    const header = document.querySelector(".profile-overlay-header");
    const standaloneNav = document.querySelector('[data-profile-nav-placement="standalone"]');
    const headerNav = document.querySelector('[data-profile-nav-placement="header"]');
    const bio = document.querySelector(".profile-hero-bio");
    const aboutLayout = document.querySelector(".profile-about-layout");
    const identityChip = document.querySelector('.profile-signal-row [data-ss-badge-kind="role"]');
    const tierChip = document.querySelector('.profile-signal-row [data-ss-badge-kind="tier"]');
    const social = document.querySelector(".profile-header-social-btn");
    const account = document.querySelector(".profile-header-account .account-pill");
    return {
      label: stateLabel,
      viewport: [innerWidth, innerHeight],
      scrollY: Math.round(scrollY),
      docked: shell?.classList.contains("is-profile-nav-docked"),
      headerTop: Math.round(header?.getBoundingClientRect().top || 0),
      wordmarkHidden: document.querySelector(".profile-overlay-brand-text")?.getAttribute("aria-hidden") === "true",
      standaloneNav: {
        hidden: standaloneNav?.hidden,
        inert: standaloneNav?.inert,
        tabStops: standaloneNav ? [...standaloneNav.querySelectorAll("a")].filter((item) => item.tabIndex >= 0).length : -1
      },
      headerNav: {
        hidden: headerNav?.hidden,
        inert: headerNav?.inert,
        tabStops: headerNav ? [...headerNav.querySelectorAll("a")].filter((item) => item.tabIndex >= 0).length : -1
      },
      activeStandalone: standaloneNav?.querySelector('[aria-current="location"]')?.getAttribute("href") || "",
      activeHeader: headerNav?.querySelector('[aria-current="location"]')?.getAttribute("href") || "",
      bioClamp: bio ? getComputedStyle(bio).webkitLineClamp : "",
      aboutState: aboutLayout?.dataset.profileAboutState || "",
      aboutColumns: aboutLayout ? getComputedStyle(aboutLayout).gridTemplateColumns : "",
      aboutWidth: Math.round(aboutLayout?.getBoundingClientRect().width || 0),
      videoWidth: Math.round(document.querySelector(".profile-about-video-presentation")?.getBoundingClientRect().width || 0),
      identity: identityChip?.textContent.trim() || "",
      tier: tierChip?.textContent.trim() || "",
      tierIcon: Boolean(tierChip?.querySelector("img.ss-tier-badge")),
      leftRoleChipCount: document.querySelectorAll(".profile-hero-content .profile-hero-role-chip").length,
      socialBorder: social ? getComputedStyle(social).borderColor : "",
      accountBorder: account ? getComputedStyle(account).borderColor : "",
      rootTheme: document.documentElement.dataset.profileTheme || "",
      profilePageState: document.documentElement.dataset.profilePage || "",
      bodyScrollbar: getComputedStyle(document.body).scrollbarColor,
      rootScrollbar: getComputedStyle(document.documentElement).scrollbarColor,
      horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  }, label);
}

(async () => {
  fs.mkdirSync(outputDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const results = { breakpoints: [], profileStates: [], aboutStates: [], themeCoverage: [], editor: null, lightbox: null, keyboardHandoff: null, routeCleanup: null, reducedMotion: null, pageErrors: [] };
  console.log("QA breakpoints");

  for (const [width, height] of [[1920,1080], [1440,900], [1024,768], [768,1024], [390,844]]) {
    const context = await browser.newContext({ viewport: { width, height } });
    const page = await context.newPage();
    page.on("pageerror", (error) => results.pageErrors.push(`${width}x${height}: ${error.message}`));
    await installFixtureRoutes(page, { owner: width !== 1024, aboutState: "story-video" });
    await waitForProfile(page, width !== 1024);
    const top = await collectPageState(page, `${width}x${height}-top`);
    await page.evaluate(() => window.scrollTo(0, Math.max(900, document.querySelector("#profile-live")?.offsetTop || 900)));
    await page.waitForTimeout(260);
    const docked = await collectPageState(page, `${width}x${height}-docked`);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(180);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(260);
    const returned = await collectPageState(page, `${width}x${height}-returned`);
    results.breakpoints.push({ width, height, top, docked, returned });
    if (width === 1440 || width === 390) {
      await page.screenshot({ path: path.join(outputDir, `profile-${width}x${height}-top.png`), fullPage: false });
      await page.evaluate(() => window.scrollTo(0, Math.max(900, document.querySelector("#profile-live")?.offsetTop || 900)));
      await page.waitForTimeout(220);
      await page.screenshot({ path: path.join(outputDir, `profile-${width}x${height}-docked.png`), fullPage: false });
    }
    await context.close();
  }

  console.log("QA Creator / Gold visitor state");
  {
    const context = await browser.newContext({ viewport: { width: 1024, height: 768 } });
    const page = await context.newPage();
    page.on("pageerror", (error) => results.pageErrors.push(`creator-gold: ${error.message}`));
    await installFixtureRoutes(page, {
      owner: true,
      aboutState: "story-video",
      profileOverrides: {
        display_name: "Creator fixture",
        role: "CREATOR",
        account_type: "CREATOR",
        tier: "GOLD",
        badges: [{ key: "creator", label: "Creator", kind: "role", value: "creator" }],
      },
    });
    await waitForProfile(page, true);
    results.profileStates.push(await collectPageState(page, "creator-gold-owner"));
    await page.screenshot({ path: path.join(outputDir, "profile-creator-gold-1024x768.png"), fullPage: false });
    await context.close();
  }

  console.log("QA keyboard handoff and route cleanup");
  {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    page.on("pageerror", (error) => results.pageErrors.push(`keyboard: ${error.message}`));
    await installFixtureRoutes(page, { owner: true, aboutState: "story-video" });
    await waitForProfile(page, true);
    await page.locator('[data-profile-nav-placement="standalone"] [data-profile-section-href="#profile-about"]').focus();
    await page.evaluate(() => window.scrollTo(0, 900));
    await page.waitForTimeout(260);
    const dockedFocus = await page.evaluate(() => ({
      placement: document.activeElement?.closest?.("[data-profile-nav-placement]")?.dataset?.profileNavPlacement || "",
      href: document.activeElement?.dataset?.profileSectionHref || "",
    }));
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(260);
    const returnedFocus = await page.evaluate(() => ({
      placement: document.activeElement?.closest?.("[data-profile-nav-placement]")?.dataset?.profileNavPlacement || "",
      href: document.activeElement?.dataset?.profileSectionHref || "",
    }));
    results.keyboardHandoff = { dockedFocus, returnedFocus };
    await page.goto("http://127.0.0.1:18089/", { waitUntil: "domcontentloaded" });
    results.routeCleanup = await page.evaluate(() => ({
      profilePageState: document.documentElement.dataset.profilePage || "",
      profileTheme: document.documentElement.dataset.profileTheme || "",
    }));
    await context.close();
  }

  console.log("QA About states");
  for (const aboutState of ["story-video", "video-only", "story-only"]) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await installFixtureRoutes(page, { owner: true, aboutState });
    await waitForProfile(page, true);
    await page.locator("#profile-about").scrollIntoViewIfNeeded();
    await page.waitForTimeout(180);
    const state = await collectPageState(page, `about-${aboutState}`);
    results.aboutStates.push(state);
    await page.screenshot({ path: path.join(outputDir, `about-${aboutState}-1440x900.png`), fullPage: false });
    await context.close();
  }

  console.log("QA themes, editor, and lightbox");
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await installFixtureRoutes(page, { owner: true, aboutState: "story-video" });
    await waitForProfile(page, true);
    await page.locator(".profile-edit-open-button--hero").click();
    await page.locator(".profile-edit-modal--profile").waitFor({ state: "visible" });
    for (const theme of ["violet_blue", "signal_red", "emerald_cyan", "gold_amber", "dark_slate", "neutral_greytone", "frosted_silver"]) {
      results.themeCoverage.push(await page.evaluate((nextTheme) => {
        const preset = [...document.querySelectorAll('[data-profile-theme-option]')].find((input) => input.value === nextTheme);
        if (preset) {
          preset.checked = true;
          preset.dispatchEvent(new Event("change", { bubbles: true }));
        }
        const root = getComputedStyle(document.documentElement);
        const logo = getComputedStyle(document.querySelector(".profile-overlay-brand-glyph"));
        return {
          theme: nextTheme,
          thumb: root.getPropertyValue("--profile-scroll-thumb").trim(),
          hover: root.getPropertyValue("--profile-scroll-thumb-hover").trim(),
          active: root.getPropertyValue("--profile-scroll-thumb-active").trim(),
          scrollbar: root.scrollbarColor,
          logoBackground: logo.backgroundImage,
          logoAnimation: logo.animationName
        };
      }, theme));
    }
    const savedTheme = "signal_red";
    await page.evaluate(() => {
      const themeInput = [...document.querySelectorAll('[data-profile-theme-option]')].find((input) => input.value === "emerald_cyan");
      themeInput.checked = true;
      themeInput.dispatchEvent(new Event("change", { bubbles: true }));
    });
    const preview = await page.evaluate(() => ({
      root: document.documentElement.dataset.profileTheme,
      rootScrollbar: getComputedStyle(document.documentElement).scrollbarColor,
      bodyScrollbar: getComputedStyle(document.body).scrollbarColor,
      modalScrollbar: getComputedStyle(document.querySelector(".profile-edit-scrollbody")).scrollbarColor,
      markdownScrollbar: getComputedStyle(document.querySelector(".profile-markdown-toolbar")).scrollbarColor,
      socialMenuScrollbar: getComputedStyle(document.querySelector(".profile-link-add-options")).scrollbarColor,
      zIndex: getComputedStyle(document.querySelector(".profile-edit-modal-backdrop")).zIndex,
      headerZIndex: getComputedStyle(document.querySelector(".profile-overlay-header")).zIndex,
      outerScrollTop: document.querySelector(".profile-edit-modal--profile").scrollTop,
      horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
    }));
    await page.screenshot({ path: path.join(outputDir, "owner-editor-emerald-1440x900.png"), fullPage: false });
    await page.locator(".profile-edit-button-secondary").last().click();
    await page.waitForTimeout(120);
    const cancelled = await page.evaluate(() => ({
      root: document.documentElement.dataset.profileTheme,
      rootScrollbar: getComputedStyle(document.documentElement).scrollbarColor
    }));
    results.editor = { savedTheme, preview, cancelled };

    const inventoryRow = page.locator("[data-inventory-row]").first();
    if (await inventoryRow.count()) {
      await inventoryRow.scrollIntoViewIfNeeded();
      await inventoryRow.click();
      await page.locator(".market-item-lightbox").waitFor({ state: "visible" });
      results.lightbox = await page.evaluate(() => ({
        scrollbar: getComputedStyle(document.querySelector(".market-item-lightbox")).scrollbarColor,
        zIndex: getComputedStyle(document.querySelector(".market-item-lightbox-backdrop")).zIndex,
        headerZIndex: getComputedStyle(document.querySelector(".profile-overlay-header")).zIndex
      }));
      await page.screenshot({ path: path.join(outputDir, "inventory-lightbox-1440x900.png"), fullPage: false });
    }
    await context.close();
  }

  console.log("QA reduced motion");
  {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    await installFixtureRoutes(page, { owner: false, aboutState: "video-only" });
    await waitForProfile(page, false);
    results.reducedMotion = await page.evaluate(() => ({
      logoAnimation: getComputedStyle(document.querySelector(".profile-overlay-brand-logo")).animationName,
      glyphAnimation: getComputedStyle(document.querySelector(".profile-overlay-brand-glyph")).animationName,
      wordmarkTransition: getComputedStyle(document.querySelector(".profile-overlay-brand-text")).transitionDuration,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
    }));
    await context.close();
  }

  await browser.close();
  fs.writeFileSync(path.join(outputDir, "qa-results.json"), JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
