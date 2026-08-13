async (page) => {
  const profile = {
    public_slug: 'bsmediagroup',
    user_code: 'YR992ZS',
    display_name: 'Admin',
    role: 'ADMIN',
    account_type: 'ADMIN',
    tier: 'PRO',
    bio: 'Administrator account for StreamSuites systems. For assistance, contact support@streamsuites.app.',
    about_enabled: true,
    about: '## Testing Title\n\nAdministrator account for StreamSuites systems. For assistance, contact support@streamsuites.app.',
    about_html: '<h2>Testing Title</h2><p>Administrator account for StreamSuites systems. For assistance, contact support@streamsuites.app.</p>',
    about_video_enabled: true,
    about_video: {
      source_type: 'upload',
      public_url: 'http://127.0.0.1:4173/profile-media/u/YR992ZS/about-video/0123456789abcdef0123456789abcdef.mp4',
      mime_type: 'video/mp4',
      title: 'Birthday attempt 3'
    },
    streamsuites_theme_preset: 'signal_red',
    streamsuites_profile_enabled: true,
    streamsuites_profile_eligible: true,
    streamsuites_profile_visible: true,
    streamsuites_profile_url: 'https://streamsuites.app/u/bsmediagroup',
    streamsuites_share_url: 'https://streamsuites.app/u/bsmediagroup',
    social_links: {
      rumble: 'https://rumble.com/c/bsmediagroup',
      youtube: 'https://www.youtube.com/@bsmediagroup',
      twitch: 'https://www.twitch.tv/bsmediagroup',
      discord: 'https://discord.gg/streamsuites'
    },
    badges: [{ key: 'admin', label: 'Admin', kind: 'role', value: 'admin' }],
    progression: { level: 5, xp: 950, next_level_xp: 1200, global_rank: 6 },
    inventory: [{ item_code: 'material.fabric', quantity: 2, definition: { label: 'Fabric', category: 'Materials', rarity: 'Common' } }]
  };

  const context = page.context();
  await context.route('**/api/public/**', (route) => route.fulfill({ json: {} }));
  await context.route('**/api/public/profile?*', (route) => route.fulfill({ json: { success: true, profile } }));
  await context.route('**/api/public/me', (route) => route.fulfill({ json: { authenticated: false } }));
  await context.route('**/api/public/wheels', (route) => route.fulfill({ json: { items: [] } }));
  await context.route('**/api/public/progression/profile/**', (route) => route.fulfill({ json: { items: [] } }));
  await context.route('**/api/public/analytics/page-visit', (route) => route.fulfill({ status: 204 }));
  await context.route('https://api.streamsuites.app/api/public/status/diagnostics', (route) => route.fulfill({ json: {} }));
  await context.route('https://streamsuites.app/profile-media/**', (route) => route.fulfill({
    status: 200,
    contentType: 'image/svg+xml',
    body: '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="600" viewBox="0 0 1200 600"><rect width="1200" height="600" fill="#0d0e14"/></svg>'
  }));
  await context.route('**/profile-media/u/YR992ZS/about-video/*.mp4', (route) => route.fulfill({
    path: 'C:/NEPTUNE LOCAL/GIT/StreamSuites-Public/clips/sampleclip00.mp4',
    contentType: 'video/mp4'
  }));

  const viewports = [
    { width: 1920, height: 1080 },
    { width: 1024, height: 768 },
    { width: 768, height: 1024 }
  ];
  const results = [];
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto('http://127.0.0.1:4173/u/bsmediagroup');
    await page.locator('.standalone-profile-shell').waitFor({ state: 'visible' });
    await page.waitForTimeout(300);
    const state = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      nav: [...document.querySelectorAll('[data-profile-nav-placement="standalone"] a')].map((link) => link.textContent.trim()),
      sections: [...document.querySelectorAll('#profile-about, #profile-overview, #profile-identity, #media, #clips, #artifacts, #profile-presence, #profile-share, #profile-safety')].map((section) => section.id),
      aboutColumns: getComputedStyle(document.querySelector('.profile-about-layout')).gridTemplateColumns,
      overviewColumns: getComputedStyle(document.querySelector('.profile-overview-definition-list')).gridTemplateColumns,
      watchOpen: document.querySelector('#media').open,
      artifactsOpen: document.querySelector('#artifacts').open,
      minimumHeaderHeight: Math.min(...[...document.querySelectorAll('.profile-content-summary')].map((summary) => summary.getBoundingClientRect().height)),
      h1Count: document.querySelectorAll('h1').length
    }));
    await page.screenshot({
      path: `output/playwright/profile-overview-correction/responsive-${viewport.width}x${viewport.height}.png`,
      fullPage: true
    });
    results.push({ viewport: `${viewport.width}x${viewport.height}`, ...state });
  }
  return results;
}
