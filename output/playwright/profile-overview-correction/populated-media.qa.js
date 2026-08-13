async (page) => {
  await page.context().unroute('**/api/public/profile?*');
  await page.context().route('**/api/public/profile?*', async (route) => {
    await route.fulfill({
      json: {
        public_slug: 'qamedia',
        user_code: 'QA00001',
        display_name: 'Media QA',
        account_type: 'CREATOR',
        tier: 'GOLD',
        streamsuites_profile_visible: true,
        streamsuites_profile_enabled: true,
        streamsuites_profile_eligible: true,
        streamsuites_theme_preset: 'royal_blue',
        about_enabled: false,
        latest_stream: {
          platform: 'youtube',
          platform_label: 'YouTube',
          title: 'QA populated media',
          url: 'https://youtube.com/watch?v=qa',
          thumbnail_url: '/assets/share/streamsuites-og.png',
          status: 'recent_stream',
          recent_streams: [
            {
              platform: 'youtube',
              platform_label: 'YouTube',
              title: 'Recent public broadcast',
              url: 'https://youtube.com/watch?v=recent',
              thumbnail_url: '/assets/share/streamsuites-og.png',
              status: 'ended'
            }
          ]
        }
      }
    });
  });
  await page.goto('http://127.0.0.1:4173/u/qamedia');
  await page.waitForTimeout(450);
  const media = page.locator('#media');
  return {
    open: await media.getAttribute('open'),
    label: await media.locator('.profile-content-summary-title').textContent(),
    title: await media.locator('[data-latest-stream-title]').textContent(),
    trayCards: await media.locator('.profile-latest-stream-thumb').count(),
    aboutPresent: await page.locator('#profile-about').count()
  };
}
