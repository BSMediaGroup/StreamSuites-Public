async (page) => {
  const context = page.context();
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
  await page.goto('http://127.0.0.1:4173/u/bsmediagroup');
  await page.waitForTimeout(750);
  return {
    title: await page.title(),
    mediaOpen: await page.locator('#media').getAttribute('open'),
    overflow: await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  };
}
