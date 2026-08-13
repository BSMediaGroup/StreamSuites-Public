async (page) => {
  await page.goto('http://127.0.0.1:4173/u/bsmediagroup');
  await page.setViewportSize({ width: 1440, height: 900 });
  const navLink = page.locator('[data-profile-nav-placement="standalone"] a[href="#profile-presence"]');
  await navLink.hover();
  await page.waitForTimeout(220);
  const nav = await navLink.evaluate((element) => {
    const style = getComputedStyle(element);
    return { color: style.color, background: style.backgroundColor, border: style.borderColor };
  });
  await page.locator('[data-profile-nav-placement="standalone"]').screenshot({
    path: 'output/playwright/profile-overview-correction/navigation-hover-theme-1440.png'
  });

  const primary = page.locator('.profile-feature-action--primary').first();
  await primary.hover();
  await page.waitForTimeout(220);
  const primaryHover = await primary.evaluate((element) => {
    const style = getComputedStyle(element);
    return { background: style.backgroundImage, filter: style.filter };
  });
  await primary.screenshot({ path: 'output/playwright/profile-overview-correction/primary-hover-final-two-colour.png' });

  const brand = page.locator('.profile-overlay-brand');
  await brand.hover();
  await page.waitForTimeout(220);
  const headerHover = await page.locator('.profile-overlay-brand-glyph').evaluate((element) => {
    const style = getComputedStyle(element);
    return { background: style.backgroundImage, filter: style.filter };
  });
  await page.locator('.profile-overlay-brand-logo').screenshot({
    path: 'output/playwright/profile-overview-correction/header-icon-hover-final-two-colour.png'
  });

  return { nav, primaryHover, headerHover };
}
