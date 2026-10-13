import { test, expect, type Page } from '@playwright/test';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { decryptInquiryPayload } from '../server/contact';

async function fillInquiry(page: Page) {
  await page.locator('#contact-name').fill('Portfolio integration test');
  await page.locator('#contact-email').fill('portfolio-test@example.com');
  await page.getByRole('combobox', { name: 'Country or region' }).fill('Pakistan');
  await page.getByRole('option', { name: 'Pakistan PK', exact: true }).click();
  await page.locator('#contact-budget').selectOption('discuss');
  await page.locator('#contact-description').fill('A synthetic inquiry used only to verify persistent encrypted storage.');
  await page.locator('#contact-consent').check();
}

test('contact submission stores an encrypted inquiry and returns a real receipt', async ({ page }) => {
  await page.goto('/#contact');
  await fillInquiry(page);
  await expect(page.locator('#contact-phone, #contact-kind')).toHaveCount(0);
  await page.getByRole('checkbox', { name: 'Verify this local test submission' }).check();
  const pending = page.waitForResponse(response => response.url().endsWith('/api/contact') && response.request().method() === 'POST');
  await page.getByRole('button', { name: 'Send inquiry', exact: true }).click();
  const response = await pending;
  expect(response.status()).toBe(201);
  const { reference } = await response.json() as { reference: string };
  const database = new DatabaseSync('.local/contact.sqlite');
  try {
    await expect(page.locator('.contact-success')).toContainText(reference);
    const row = database.prepare('SELECT * FROM contact_inquiries WHERE id = ?').get(reference)!;
    expect(row).toBeTruthy();
    expect(row.payload).not.toContain('portfolio-test@example.com');
    const key = JSON.parse(readFileSync('.local/contact-secrets.json','utf8')).DATA_ENCRYPTION_KEY as string;
    const details = await decryptInquiryPayload(String(row.payload),key,String(row.id),Number(row.created_at)) as Record<string,unknown>;
    expect(details).toMatchObject({name:'Portfolio integration test', email:'portfolio-test@example.com',country:'PK',budget:'discuss',consent:true});
    expect(details).not.toHaveProperty('phone');
    expect(details).not.toHaveProperty('kind');
  } finally {
    database.prepare('DELETE FROM contact_inquiries WHERE id = ?').run(reference);
    database.close();
  }
});

test('form validation and mobile layout work without submitting incomplete data', async ({ page }) => {
  await page.goto('/#contact');
  let posts=0;
  page.on('request',request=>{ if(request.url().endsWith('/api/contact') && request.method()==='POST')posts++; });
  await page.locator('#contact-email').fill('invalid');
  await expect(page.getByRole('button',{name:'Send inquiry',exact:true})).toBeEnabled();
  await page.getByRole('button',{name:'Send inquiry',exact:true}).click();
  await expect(page.locator('#contact-name')).toBeFocused();
  await expect(page.locator('#contact-email')).toHaveAttribute('aria-invalid','true');
  expect(posts).toBe(0);
  for(const width of [390,1440]) {
    await page.setViewportSize({width,height:1000});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.locator('.contact-form-shell').screenshot({path:`test-results/contact-form-${width}.png`});
  }
});

test('a failed save preserves fields, resets verification, and prevents duplicate posts', async ({ page }) => {
  await page.goto('/#contact');await fillInquiry(page);
  await page.getByRole('checkbox',{name:'Verify this local test submission'}).check();
  let posts=0;
  await page.route('**/api/contact',async route=>{
    posts++;await new Promise(resolve=>setTimeout(resolve,150));
    await route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({ok:false,error:'The form is temporarily unavailable.'})});
  });
  await page.locator('.contact-form').evaluate(element=>{const form=element as HTMLFormElement;form.requestSubmit();form.requestSubmit();});
  await expect(page.locator('.contact-form-error')).toContainText('temporarily unavailable');
  expect(posts).toBe(1);
  await expect(page.locator('#contact-email')).toHaveValue('portfolio-test@example.com');
  await expect(page.getByRole('checkbox',{name:'Verify this local test submission'})).not.toBeChecked();
  await expect(page.locator('.contact-success')).toHaveCount(0);
});

test('country search supports names, country codes, keyboard selection and empty results', async ({ page }) => {
  await page.goto('/#contact');
  const country = page.getByRole('combobox', { name: 'Country or region' });
  await country.fill('pk');
  await expect(page.getByRole('option', { name: 'Pakistan PK', exact: true })).toBeVisible();
  await country.press('Enter');
  await expect(country).toHaveValue('Pakistan');
  await expect(country).toHaveAttribute('aria-expanded', 'false');
  await country.fill('united');
  await expect(page.getByRole('listbox').getByRole('option')).toHaveCount(3);
  await country.press('ArrowDown');
  await country.press('Enter');
  await expect(country).toHaveValue('United Kingdom');
  await country.fill('Ivoire');
  await expect(page.getByRole('listbox').getByRole('option')).toHaveCount(1);
  await page.getByRole('listbox').getByRole('option').click();
  await expect(country).toHaveValue(/Ivoire/);
  await country.fill('not-a-country');
  await expect(page.getByRole('status').filter({ hasText: 'No countries found' })).toBeVisible();
  await country.press('Escape');
  await expect(country).toHaveAttribute('aria-expanded', 'false');
  await expect(country).toHaveValue('');
  await page.getByRole('button', { name: 'Send inquiry', exact: true }).click();
  await expect(country).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#contact-name')).toBeFocused();
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await country.click();
    await country.fill('Pakistan');
    await expect(page.getByRole('option', { name: 'Pakistan PK', exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator('.contact-form-shell').screenshot({ path: `test-results/country-search-${width}.png` });
    await country.press('Enter');
    const spacing = await page.locator('#contact-budget').evaluate(element => {
      const style = getComputedStyle(element); return { appearance: style.appearance, padding: parseFloat(style.paddingRight), position: style.backgroundPosition };
    });
    expect(spacing.appearance).toBe('none');
    expect(spacing.padding).toBeGreaterThanOrEqual(48);
    expect(spacing.position).toContain('18px');
  }
});

test('production widget expires tokens and never falls back to local verification', async ({ page }) => {
  await page.route('**/api/contact/config',route=>route.fulfill({contentType:'application/json',body:JSON.stringify({siteKey:'0xREAL_WIDGET_KEY_FOR_TEST_ONLY',local:false})}));
  await page.route('https://challenges.cloudflare.com/turnstile/v0/api.js*',route=>route.fulfill({contentType:'application/javascript',body:`window.turnstile={render:(el,opts)=>{window.contactTestOptions=opts;const b=document.createElement('button');b.type='button';b.textContent='Complete test verification';b.onclick=()=>opts.callback('browser-test-token');el.append(b);return 'test-widget';},reset:()=>{},remove:()=>{}};`}));
  await page.goto('/#contact');await fillInquiry(page);
  await expect(page.getByRole('checkbox',{name:'Verify this local test submission'})).toHaveCount(0);
  await page.getByRole('button',{name:'Complete test verification'}).click();
  await page.evaluate(()=>{const w=window as unknown as {contactTestOptions:Record<string,()=>void>};w.contactTestOptions['expired-callback']();});
  let posts=0;page.on('request',r=>{if(r.url().endsWith('/api/contact')&&r.method()==='POST')posts++;});
  await page.getByRole('button',{name:'Send inquiry',exact:true}).click();
  await expect(page.locator('#contact-turnstileToken-error')).toBeVisible();expect(posts).toBe(0);
  for(const path of ['/.local/contact-secrets.json','/.local/contact.sqlite','/@fs/Users/mc/Desktop/Danyal%27s%20portfolio/.local/contact-secrets.json']) {
    const response=await page.request.get(path);expect(response.status()).toBe(403);
  }
});
