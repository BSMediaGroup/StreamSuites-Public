async (page) => {
  const profileCss = "C:/NEPTUNE LOCAL/GIT/StreamSuites-Public/css/public-profile.css";
  const profileJs = "C:/NEPTUNE LOCAL/GIT/StreamSuites-Public/js/public-pages-app.js";
  const silhouette = "C:/NEPTUNE LOCAL/GIT/StreamSuites-Public/assets/logos/ssmotfinew.webp";
  const sampleVideo = "C:/NEPTUNE LOCAL/GIT/StreamSuites-Public/clips/sampleclip00.mp4";
  const profile = {
    public_slug: "bsmediagroup",
    user_code: "YR992ZS",
    display_name: "Admin",
    role: "ADMIN",
    account_type: "ADMIN",
    tier: "PRO",
    bio: "Administrator account for StreamSuites systems. This fixture validates the owner profile polish without changing live data.",
    about: "## Building StreamSuites\n\nWe build **creator-first** tools with _clear authority boundaries_.\n\n> Production truth stays more important than decoration.\n\n- Native media where it belongs\n- Safe public presentation\n- Accessible, responsive controls",
    about_html: "<h2>Building StreamSuites</h2><p>We build <strong>creator-first</strong> tools with <em>clear authority boundaries</em>.</p><blockquote><p>Production truth stays more important than decoration.</p></blockquote><ul><li>Native media where it belongs</li><li>Safe public presentation</li><li>Accessible, responsive controls</li></ul>",
    about_video_enabled: true,
    about_video_source_type: "upload",
    about_video: {
      source_type: "upload",
      public_url: "https://streamsuites.app/profile-media/u/YR992ZS/about-video/0123456789abcdef0123456789abcdef.mp4",
      mime_type: "video/mp4",
      title: "StreamSuites profile presentation",
      file_size: 1048576,
    },
    about_video_upload: { enabled: true, max_bytes: 52428800, mime_types: ["video/mp4", "video/webm"] },
    about_video_providers: [],
    streamsuites_theme_preset: "signal_red",
    avatar_url: "https://streamsuites.app/profile-media/u/YR992ZS/avatar/v2.webp",
    cover_image_url: "https://streamsuites.app/profile-media/u/YR992ZS/cover/v4.webp",
    background_image_url: "",
    streamsuites_profile_enabled: true,
    streamsuites_profile_eligible: true,
    streamsuites_profile_visible: true,
    streamsuites_profile_url: "https://streamsuites.app/u/bsmediagroup",
    streamsuites_share_url: "https://streamsuites.app/u/bsmediagroup",
    findmehere_enabled: true,
    findmehere_eligible: true,
    findmehere_visible: true,
    findmehere_profile_url: "https://findmehere.live/bsmediagroup",
    social_links: { rumble: "https://rumble.com/c/bsmediagroup", youtube: "https://www.youtube.com/@bsmediagroup" },
    badges: [{ key: "admin", label: "Admin", kind: "role", value: "admin" }],
    is_anonymous: false,
    is_listed: true,
  };

  await page.route("**/css/public-profile.css*", (route) => route.fulfill({ path: profileCss, contentType: "text/css" }));
  await page.route("**/js/public-pages-app.js*", (route) => route.fulfill({ path: profileJs, contentType: "application/javascript" }));
  await page.route("**/assets/logos/ssmotfinew.webp", (route) => route.fulfill({ path: silhouette, contentType: "image/webp" }));
  await page.route("**/profile-media/u/YR992ZS/**", async (route) => {
    const requestedUrl = route.request().url();
    const marker = "/profile-media";
    const upstreamPath = requestedUrl.slice(requestedUrl.indexOf(marker) + marker.length).split(/[?#]/, 1)[0];
    const upstream = await route.fetch({ url: `https://api.streamsuites.app${upstreamPath}`, headers: { Accept: "image/webp" } });
    await route.fulfill({
      response: upstream,
      contentType: upstream.headers()["content-type"] || "image/webp",
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Cross-Origin-Resource-Policy": "same-site",
        "X-Content-Type-Options": "nosniff",
      },
    });
  });
  await page.route("**/profile-media/u/YR992ZS/about-video/*.mp4", (route) => route.fulfill({ path: sampleVideo, contentType: "video/mp4" }));
  await page.route("**/api/public/me", (route) => route.fulfill({
    json: { authenticated: true, account_id: "owner-fixture", user_code: "YR992ZS", public_slug: "bsmediagroup", display_name: "Admin", role: "admin", tier: "PRO" },
  }));
  await page.route("**/api/public/profile/me", (route) => route.fulfill({ json: { success: true, profile } }));
  await page.route("**/api/public/profile?**", (route) => route.fulfill({ json: { success: true, profile } }));
  await page.route("**/api/public/profile/about/preview", (route) => route.fulfill({ json: { success: true, about_html: profile.about_html } }));

  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(String(error.message || error)));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("https://streamsuites.app/u/bsmediagroup?local_owner_fixture=1", { waitUntil: "domcontentloaded" });
  await page.locator(".profile-edit-open-button--hero").waitFor({ state: "visible", timeout: 30000 });
  await page.waitForTimeout(1500);

  const themes = ["violet_blue", "crimson_magenta", "emerald_cyan", "gold_amber", "dark_slate", "neutral_greytone", "frosted_silver"];
  const themeCoverage = [];
  for (const theme of themes) {
    themeCoverage.push(await page.evaluate((nextTheme) => {
      const shell = document.querySelector(".standalone-profile-shell");
      document.body.dataset.profileTheme = nextTheme;
      shell.dataset.profileTheme = nextTheme;
      const logo = document.querySelector(".profile-overlay-brand-logo");
      const eyebrow = document.querySelector(".profile-hero-eyebrow");
      const edit = document.querySelector(".profile-edit-open-button--hero");
      return {
        theme: nextTheme,
        feature: getComputedStyle(shell).getPropertyValue("--profile-feature-bright").trim(),
        logoBorder: getComputedStyle(logo).borderColor,
        eyebrow: getComputedStyle(eyebrow).color,
        editBorder: getComputedStyle(edit).borderColor,
        scrollbar: getComputedStyle(document.body).scrollbarColor,
      };
    }, theme));
  }
  await page.evaluate(() => {
    document.body.dataset.profileTheme = "signal_red";
    document.querySelector(".standalone-profile-shell").dataset.profileTheme = "signal_red";
  });

  const scrollStates = [];
  for (const y of [0, 420, 1600, 0]) {
    await page.evaluate((nextY) => window.scrollTo(0, nextY), y);
    await page.waitForTimeout(180);
    scrollStates.push(await page.evaluate(() => ({
      y: Math.round(window.scrollY),
      headerTop: Math.round(document.querySelector(".profile-overlay-header").getBoundingClientRect().top),
      headerGlassOpacity: getComputedStyle(document.querySelector(".profile-overlay-header"), "::before").opacity,
      coverOpacity: getComputedStyle(document.querySelector(".profile-hero-media")).opacity,
    })));
  }

  await page.screenshot({ path: "C:/NEPTUNE LOCAL/GIT/StreamSuites-Public/output/playwright/profile-media-polish/owner-story-video-1440x900.png", fullPage: false });
  await page.locator(".profile-edit-open-button--hero").click();
  await page.locator(".profile-edit-modal--profile").waitFor({ state: "visible" });
  await page.locator("[data-profile-edit-about]").evaluate((field) => {
    field.focus();
    field.setSelectionRange(0, 0);
  });
  await page.locator('[data-markdown-action="h2"]').click();
  const toolbarSelection = await page.locator("[data-profile-edit-about]").inputValue();
  await page.locator(".profile-markdown-preview-button").click();
  await page.locator(".profile-markdown-preview").waitFor({ state: "visible" });
  await page.screenshot({ path: "C:/NEPTUNE LOCAL/GIT/StreamSuites-Public/output/playwright/profile-media-polish/owner-editor-markdown-upload-1440x900.png", fullPage: false });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(250);
  await page.screenshot({ path: "C:/NEPTUNE LOCAL/GIT/StreamSuites-Public/output/playwright/profile-media-polish/owner-editor-markdown-upload-390x844.png", fullPage: false });

  return await page.evaluate(({ themeCoverage, scrollStates, toolbarSelection, pageErrors }) => ({
    themeCoverage,
    scrollStates,
    toolbarInsertedHeading: toolbarSelection.startsWith("## "),
    previewHeading: document.querySelector(".profile-markdown-preview h2")?.textContent || "",
    ownerButtonInHero: Boolean(document.querySelector(".profile-hero-identity .profile-edit-open-button--hero")),
    ownerButtonInHeader: Boolean(document.querySelector(".profile-overlay-header .profile-edit-open-button")),
    uploadChoicePresent: Boolean(document.querySelector('input[value="upload"]')),
    maxUploadText: Array.from(document.querySelectorAll(".profile-about-upload-copy span")).map((node) => node.textContent).join(" "),
    horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    pageErrors,
  }), { themeCoverage, scrollStates, toolbarSelection, pageErrors });
}
