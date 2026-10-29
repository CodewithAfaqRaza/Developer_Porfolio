import { expect, test } from '@playwright/test';

const featuredIds = ['leap', 'black-hat-mea', 'cityscape-global', 'kingdom-of-gaming', 'umrah-ziyarah'];
const remainingIds = ['money2020-middle-east', 'cityscape-west-ksa', 'deepfest', 'leap-east', 'bio-middle-east', 'idwsc', 'red-sea-yacht-show', 'tahaluf', 'american-elements'];
for (const width of [390, 1440]) {
  test(`showcase selection and remaining collection work at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    // Selecting the first project must not jump past the hero on initial load.
    expect(await page.evaluate(() => scrollY)).toBe(0);
    await expect(page.locator('.project-card')).toHaveCount(1);
    const selectors = page.getByRole('group', { name: 'Featured project selector' }).getByRole('button');
    await expect(selectors).toHaveCount(5);
    for (let i = 0; i < 5; i++) {
      await selectors.nth(i).click();
      await expect(selectors.nth(i)).toHaveAttribute('aria-pressed', 'true');
      await expect(page.locator('.showcase-stage .project-card')).toHaveAttribute('data-project-id', featuredIds[i]);
      await expect(page.locator('.showcase-stage .showcase-details')).toBeVisible();
    }
    await expect(page.getByRole('button', { name: 'Next featured project' })).toBeDisabled();
    await page.getByRole('button', { name: 'Previous featured project' }).click();
    await expect(selectors.nth(3)).toHaveAttribute('aria-pressed', 'true');
    const batch = width < 768 ? 2 : 5;
    const cards = page.locator('.project-grid .project-card');
    await page.getByRole('button', { name: 'View all projects' }).click();
    await expect(cards).toHaveCount(batch);
    await expect(cards.first().locator('.project-open')).toBeFocused();
    for (let shown = batch; shown < 9; shown += batch) {
      await page.getByRole('button', { name: 'Load more projects' }).click();
      await expect(cards).toHaveCount(Math.min(9, shown + batch));
      await expect(cards.nth(shown).locator('.project-open')).toBeFocused();
    }
    await expect(page.getByRole('button', { name: 'Load more projects' })).toHaveCount(0);
    expect(await cards.evaluateAll(els => els.map(el => el.getAttribute('data-project-id')))).toEqual(remainingIds);
    await cards.last().locator('.project-open').click();
    await expect(page.getByRole('dialog')).toContainText('American Elements');
    await page.keyboard.press('Escape');
    await expect(cards.last().locator('.project-open')).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.setViewportSize({ width: width === 390 ? 1440 : 390, height: 900 });
    await expect(cards).toHaveCount(9);
    await expect(page.getByRole('link', { name: 'GitHub', exact: true })).toHaveAttribute('href', 'https://github.com/CodewithAfaqRaza');
  });
}

test('keyboard selector and new-card animations respect reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const selectors = page.getByRole('group', { name: 'Featured project selector' }).getByRole('button');
  await selectors.nth(1).focus();
  await page.keyboard.press('Enter');
  await expect(selectors.nth(1)).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'View all projects' }).click();
  const card = page.locator('.project-grid .project-card').first();
  await expect.poll(() => card.locator('.project-art').evaluate(el => el.style.transform)).not.toBe('');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(() => card.locator('.project-art').evaluate(el => el.style.transform)).toBe('');
  await expect(page.locator('.showcase-stage .project-card')).toHaveCSS('animation-name', 'none');
});
