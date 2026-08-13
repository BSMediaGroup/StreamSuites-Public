async (page) => {
  const profileCss = "C:/NEPTUNE LOCAL/GIT/StreamSuites-Public/css/public-profile.css";
  const profileJs = "C:/NEPTUNE LOCAL/GIT/StreamSuites-Public/js/public-pages-app.js";
  const silhouette = "C:/NEPTUNE LOCAL/GIT/StreamSuites-Public/assets/logos/ssmotfinew.webp";
  await page.route("**/css/public-profile.css*", (route) => route.fulfill({ path: profileCss, contentType: "text/css" }));
  await page.route("**/js/public-pages-app.js*", (route) => route.fulfill({ path: profileJs, contentType: "application/javascript" }));
  await page.route("**/assets/logos/ssmotfinew.webp", (route) => route.fulfill({ path: silhouette, contentType: "image/webp" }));
  await page.route("**/profile-media/u/YR992ZS/**", async (route) => {
    const requestedUrl = route.request().url();
    const marker = "/profile-media";
    const upstreamPath = requestedUrl.slice(requestedUrl.indexOf(marker) + marker.length).split(/[?#]/, 1)[0];
    const upstreamUrl = `https://api.streamsuites.app${upstreamPath}`;
    const upstream = await route.fetch({ url: upstreamUrl, headers: { Accept: "image/webp" } });
    await route.fulfill({
      response: upstream,
      contentType: upstream.headers()["content-type"] || "image/webp",
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Cross-Origin-Resource-Policy": "same-origin",
        "X-Content-Type-Options": "nosniff",
      },
    });
  });

  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error.message || error)));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("https://streamsuites.app/u/bsmediagroup?local_profile_polish=1", { waitUntil: "domcontentloaded" });
  await page.locator(".standalone-profile-shell").waitFor({ state: "visible", timeout: 30000 });
  await page.waitForTimeout(3500);

  const viewports = [
    [1920, 1080],
    [1440, 900],
    [1024, 768],
    [768, 1024],
    [390, 844],
  ];
  for (const [width, height] of viewports) {
    await page.setViewportSize({ width, height });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(250);
    await page.screenshot({
      path: `C:/NEPTUNE LOCAL/GIT/StreamSuites-Public/output/playwright/profile-media-polish/bsmediagroup-top-${width}x${height}.png`,
      fullPage: false,
    });
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.locator("#profile-about").scrollIntoViewIfNeeded();
  await page.waitForTimeout(350);
  await page.screenshot({
    path: "C:/NEPTUNE LOCAL/GIT/StreamSuites-Public/output/playwright/profile-media-polish/bsmediagroup-about-1440x900.png",
    fullPage: false,
  });

  const result = await page.evaluate(() => {
    const shell = document.querySelector(".standalone-profile-shell");
    const avatar = document.querySelector(".profile-hero-avatar");
    const hero = document.querySelector(".profile-cinematic-hero");
    const about = document.querySelector("#profile-about");
    const silhouetteStyle = about ? getComputedStyle(about, "::before") : null;
    return {
      title: document.title,
      theme: shell?.getAttribute("data-profile-theme") || "",
      avatarBackground: avatar ? getComputedStyle(avatar).backgroundImage : "",
      coverImage: hero ? getComputedStyle(hero).getPropertyValue("--profile-cover-image").trim() : "",
      silhouetteImage: silhouetteStyle?.backgroundImage || "",
      horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      h1Count: document.querySelectorAll("h1").length,
      aboutPresent: Boolean(about),
      headerPosition: getComputedStyle(document.querySelector(".profile-overlay-header")).position,
    };
  });
  return { ...result, pageErrors: errors };
}
