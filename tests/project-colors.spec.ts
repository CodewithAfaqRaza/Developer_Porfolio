import { expect, test } from '@playwright/test';

test('all project sources retain color and reveal it on hover and keyboard focus', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const cards = page.locator('.project-open');
  await expect(cards).toHaveCount(12);
  for (const card of await cards.all()) {
    await card.scrollIntoViewIfNeeded();
    await page.mouse.move(0, 0);
    const image = card.locator('.project-desktop');
    await expect(image).toHaveCSS('filter', 'grayscale(1)');
    const hasColor = await image.evaluate(async (element: HTMLImageElement) => {
      await element.decode();
      const canvas = document.createElement('canvas');
      canvas.width = 80; canvas.height = 50;
      const context = canvas.getContext('2d')!;
      context.drawImage(element, 0, 0, 80, 50);
      const pixels = context.getImageData(0, 0, 80, 50).data;
      let colored = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        if (Math.max(pixels[i], pixels[i + 1], pixels[i + 2]) - Math.min(pixels[i], pixels[i + 1], pixels[i + 2]) > 20) colored++;
      }
      return colored > 20;
    });
    expect(hasColor, await image.getAttribute('src') || '').toBe(true);
    await card.hover();
    await expect(image).toHaveCSS('filter', 'grayscale(0)');
    await expect(image).toHaveCSS('transition-duration', '0s');
    await page.mouse.move(0, 0);
    await expect(image).toHaveCSS('filter', 'grayscale(1)');
  }
  await page.keyboard.press('Tab');
  await cards.first().focus();
  await expect(cards.first().locator('.project-desktop')).toHaveCSS('filter', 'grayscale(0)');
});

test('touch users can view colors by opening project details', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('http://127.0.0.1:5173/');
  await page.getByRole('button', { name: 'Explore LEAP', exact: true }).click();
  await expect(page.getByRole('dialog').locator('.project-desktop')).toHaveCSS('filter', 'grayscale(0)');
  await context.close();
});
