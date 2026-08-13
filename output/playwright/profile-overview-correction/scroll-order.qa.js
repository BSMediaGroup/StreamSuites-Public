async (page) => {
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(180);
  const sequence = [];
  for (let index = 0; index < 80; index += 1) {
    const current = await page.locator('[data-profile-nav-placement="header"] [aria-current="location"]').allTextContents();
    const label = current[0] || "";
    if (label && sequence.at(-1) !== label) sequence.push(label);
    await page.mouse.wheel(0, 60);
    await page.waitForTimeout(70);
  }
  return sequence;
}
