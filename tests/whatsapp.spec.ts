import { expect, test } from '@playwright/test';

test('WhatsApp contact stays in the corner, works by keyboard, opens the right chat and respects dialogs', async ({ page, context }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const button = page.getByRole('link', { name: /Chat with Danyal Zeb on WhatsApp/ });
    await expect(button).toBeVisible();
    const href = new URL((await button.getAttribute('href'))!);
    expect(href.origin).toBe('https://wa.me');
    expect(href.pathname).toBe('/923169712793');
    expect(href.searchParams.get('text')).toBe('Hi Danyal Zeb, I’d like to discuss a project or collaboration.');
    await expect(button).toHaveAttribute('target', '_blank');
    await expect(button).toHaveAttribute('rel', 'noopener noreferrer');
    await expect.poll(() => button.locator('img').evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
    const before = (await button.boundingBox())!;
    expect(before.width).toBeGreaterThanOrEqual(44);
    expect(before.x + before.width).toBeLessThan(width);
    expect(before.y + before.height).toBeLessThan(900);
    await page.locator('.footer-bottom').scrollIntoViewIfNeeded();
    await expect(page.getByRole('checkbox', { name: 'Verify this local test submission' })).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    const after = (await button.boundingBox())!;
    expect(after.x).toBeCloseTo(before.x, 0);
    expect(after.y).toBeCloseTo(before.y, 0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const footer = (await page.locator('.footer-bottom').boundingBox())!;
    expect(footer.y + footer.height).toBeLessThanOrEqual(after.y);
    await button.focus();
    await expect(button).toBeFocused();
    await expect(button.locator('.whatsapp-contact-label')).toBeVisible();
    expect(await button.evaluate(element => getComputedStyle(element).outlineStyle)).toBe('solid');
    await page.screenshot({ path: `test-results/whatsapp-${width}.png` });
  }
  // Verify keyboard activation without sending a message or requiring WhatsApp sign-in.
  await context.route('https://wa.me/**', route => route.fulfill({ contentType: 'text/html', body: 'WhatsApp link navigation test' }));
  await page.locator('.whatsapp-contact').focus();
  const popupPromise = page.waitForEvent('popup');
  await page.keyboard.press('Enter');
  const popup = await popupPromise;
  await popup.waitForLoadState('domcontentloaded');
  expect(new URL(popup.url()).pathname).toBe('/923169712793');
  await popup.close();
  await page.getByRole('button', { name: 'Explore LEAP', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  expect(await page.locator('.whatsapp-contact').evaluate(element => {
    const rect = element.getBoundingClientRect();
    return document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2)?.closest('.whatsapp-contact') === element;
  })).toBe(false);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.goto('/admin');
  await expect(page.locator('.whatsapp-contact')).toHaveCount(0);
});
