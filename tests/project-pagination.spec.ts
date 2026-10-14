import { expect, test } from '@playwright/test';

for (const width of [390, 1440]) {
  test(`project batches and details work at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const cards = page.locator('.project-card');
    const load = page.getByRole('button', { name: 'Load more projects' });
    const batch = width < 768 ? 2 : 5;
    await expect(cards).toHaveCount(batch);
    // Unrevealed images are not mounted or downloaded by the gallery.
    await expect(page.locator('.project-desktop')).toHaveCount(batch);
    const initialIds = await cards.evaluateAll(elements => elements.map(el => el.getAttribute('data-project-id')));
    for (let shown = batch; shown < 12; shown += batch) {
      await load.click();
      await expect(cards).toHaveCount(Math.min(12, shown + batch));
      await expect(cards.nth(shown).locator('.project-open')).toBeFocused();
      await expect(page.locator('.project-pagination [role="status"]')).toHaveText(`Showing ${Math.min(12, shown + batch)} of 12 projects`);
    }
    await expect(load).toHaveCount(0);
    const ids = await cards.evaluateAll(elements => elements.map(el => el.getAttribute('data-project-id')));
    expect(ids).toEqual(['leap', 'black-hat-mea', 'cityscape-global', 'kingdom-of-gaming', 'umrah-ziyarah', 'deepfest', 'leap-east', 'bio-middle-east', 'idwsc', 'red-sea-yacht-show', 'tahaluf', 'american-elements']);
    expect(new Set(ids).size).toBe(12);
    expect(ids.slice(0, batch)).toEqual(initialIds);
    await cards.last().locator('.project-open').click();
    await expect(page.getByRole('dialog')).toContainText('American Elements');
    await page.keyboard.press('Escape');
    await expect(cards.last().locator('.project-open')).toBeFocused();
    await page.setViewportSize({ width: width === 390 ? 1440 : 390, height: 900 });
    await expect(cards).toHaveCount(12);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator('.project-pagination').screenshot({ path: `test-results/project-pagination-${width}.png` });
  });
}

test('new cards keep scroll animations and keyboard load-more works', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const load = page.getByRole('button', { name: 'Load more projects' });
  await load.focus();
  await page.keyboard.press('Enter');
  const newCard = page.locator('.project-card').nth(5);
  await expect(newCard.locator('.project-open')).toBeFocused();
  await expect.poll(() => newCard.locator('.project-art').evaluate(el => el.style.transform)).not.toBe('');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(() => newCard.locator('.project-art').evaluate(el => el.style.transform)).toBe('');
});
