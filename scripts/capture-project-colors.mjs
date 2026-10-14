import { chromium } from '@playwright/test';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { projects } from '../src/data/projects.ts';

// Keep captures private until visually reviewed; never replace assets with challenge pages.
const destination = '.local/project-color-captures';
const mobile = process.argv.includes('--mobile');
const available = (mobile || process.argv.includes('--available')) ? JSON.parse(readFileSync(`${destination}/results.json`, 'utf8')).filter(row => row.captured).map(row => row.id) : null;
mkdirSync(destination, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const results = [];
async function capture(project) {
  const page = await browser.newPage({ viewport: { width: mobile ? 390 : 1440, height: 1440 }, isMobile: mobile });
  try {
    const response = await page.goto(project.href, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(project.id === 'red-sea-yacht-show' ? 15000 : 6500);
    const title = await page.title();
    if (!response?.ok() || /attention required|just a moment|access denied/i.test(title)) {
      results.push({ id: project.id, status: response?.status(), captured: false, title });
      console.log(`${project.id}: blocked (${response?.status()})`); return;
    }
    for (const frame of page.frames()) {
      await frame.addStyleTag({ content: `
        #onetrust-consent-sdk, #onetrust-banner-sdk, #CybotCookiebotDialog,
        #CookiebotWidget, #cookie-notice, .cc-window, .osano-cm-window,
        .cmpbox, .cmpboxBG, .qc-cmp2-container, .cky-consent-container,
        [aria-label="Cookie consent"], [aria-label="Privacy center"],
        iframe[title*="cookie" i], iframe[title*="consent" i],
        iframe[title*="privacy" i] { display: none !important; }
      ` }).catch(() => {});
      await frame.evaluate(() => {
        for (const node of document.querySelectorAll('body *')) {
          const style = getComputedStyle(node); const rect = node.getBoundingClientRect();
          if (style.position === 'fixed' && rect.top > innerHeight / 2 && rect.width < 500 && rect.height < 400 && /cookie|privacy|whatsapp|register via/i.test(`${node.id} ${node.className} ${node.textContent || ''}`) && !node.closest('header, nav')) node.style.visibility = 'hidden';
          if (['fixed', 'sticky'].includes(style.position) && rect.height < 600
            && /we use cookies|cookie preferences|your privacy choices/i.test(node.textContent || '')) node.style.visibility = 'hidden';
        }
      }).catch(() => {});
    }
    await page.screenshot({ path: `${destination}/${project.id}${mobile ? '-mobile' : ''}.jpg`, type: 'jpeg', quality: 86,
      clip: { x: 0, y: 0, width: mobile ? 390 : 1440, height: mobile ? 844 : 960 } });
    results.push({ id: project.id, url: project.href, status: response.status(), captured: true, title });
    console.log(`${project.id}: color screenshot captured`);
  } catch (error) { results.push({ id: project.id, captured: false, error: error.message }); console.log(`${project.id}: capture unavailable`); }
  finally { await page.close(); }
}
try {
  const selected = available ? projects.filter(project => available.includes(project.id)) : projects;
  for (let i = 0; i < selected.length; i += 3) await Promise.all(selected.slice(i, i + 3).map(capture));
  writeFileSync(`${destination}/results${mobile ? '-mobile' : ''}.json`, JSON.stringify(results, null, 2) + '\n');
} finally { await browser.close(); }
