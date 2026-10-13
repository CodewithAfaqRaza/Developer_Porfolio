import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// Optional: supply { "project-id": "https://preview.example.com/" } in
// PROJECT_PREVIEW_URLS. Public links in the portfolio remain unchanged.
const overrides = JSON.parse(process.env.PROJECT_PREVIEW_URLS || '{}');
const projects = [
  ['leap', 'https://onegiantleap.com/'],
  ['leap-east', 'https://leapeast.com/'],
  ['black-hat-mea', 'https://blackhatmea.com/'],
  ['deepfest', 'https://deepfest.com/'],
  ['tahaluf', 'https://tahaluf.com/'],
  ['cityscape-global', 'https://cityscapeglobal.com/'],
  ['umrah-ziyarah', 'https://umrah-ziyarah.com/'],
  ['bio-middle-east', 'https://biomiddleeast.com/'],
  ['idwsc', 'https://idwsc.com/'],
  ['red-sea-yacht-show', 'https://redseayachtshow.com/'],
  ['kingdom-of-gaming', 'https://kingdomofgaming.com/'],
  ['american-elements', 'https://www.americanelements.com/'],
];
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];
mkdirSync('public/images/projects', { recursive: true });
try {
  async function capture([id, publicUrl]) {
    const url = overrides[id] || publicUrl;
    // Keep bottom-anchored privacy widgets below the captured area as well.
    const page = await browser.newPage({ viewport: { width: 1440, height: 1440 } });
    try {
      const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForTimeout(5000);
      const title = await page.title();
      if (!response?.ok() || /attention required|just a moment|access denied/i.test(title)) {
        results.push({ id, publicUrl, status: response?.status(), captured: false });
        console.log(`${id}: blocked; existing cover retained`);
        return;
      }
      for (const frame of page.frames()) {
        await frame.addStyleTag({ content: `
          #onetrust-consent-sdk, #onetrust-banner-sdk, #onetrust-pc-sdk,
          #CybotCookiebotDialog, #CookiebotWidget, #cookie-notice,
          #cookie-law-info-bar, #truste-consent-track, .cc-window,
          .osano-cm-window, .cmpbox, .cmpboxBG, .qc-cmp2-container,
          [aria-label="Cookie consent"], [aria-label="Privacy center"],
          iframe[title*="cookie" i], iframe[title*="consent" i],
          iframe[title*="privacy" i] { display: none !important; }
        ` }).catch(() => {});
        await frame.evaluate(() => {
          for (const element of document.querySelectorAll('body *')) {
            const style = getComputedStyle(element);
            if (!['fixed', 'sticky'].includes(style.position)) continue;
            const text = element.textContent || '';
            if (/we use cookies|cookie preferences|your privacy choices/i.test(text)
                && /accept|preferences|choices/i.test(text)
                && element.getBoundingClientRect().height < 600) {
              element.style.display = 'none';
            }
          }
        }).catch(() => {});
      }
      await page.addStyleTag({ content: 'html { filter: grayscale(1) !important; }' });
      await page.screenshot({
        path: join('public/images/projects', `${id}.jpg`),
        type: 'jpeg', quality: 85,
        clip: { x: 0, y: 0, width: 1440, height: 960 },
      });
      results.push({ id, publicUrl, status: response.status(), captured: true, width: 1440, height: 960, grayscale: true });
      console.log(`${id}: clean monochrome screenshot captured`);
    } catch (error) {
      results.push({ id, publicUrl, captured: false, error: error.message });
      console.log(`${id}: ${error.message}`);
    } finally {
      await page.close();
    }
  }
  for (let i = 0; i < projects.length; i += 3) {
    await Promise.all(projects.slice(i, i + 3).map(capture));
  }
  writeFileSync('research/project-captures.json', JSON.stringify(results, null, 2) + '\n');
} finally {
  await browser.close();
}
