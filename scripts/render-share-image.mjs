import { chromium } from "@playwright/test";
import { readFileSync } from "node:fs";
const background = readFileSync(
  "public/images/abstract-tech-poster.jpg",
).toString("base64");
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  });
  await page.setContent(`<!doctype html><html><head><style>
    *{box-sizing:border-box}body{margin:0;width:1200px;height:630px;overflow:hidden;color:#151515;font-family:Menlo,monospace;background:#e5e5e5}.photo{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:grayscale(1) invert(1)}.wash{position:absolute;inset:0;background:linear-gradient(90deg,#f1f1f1ed,#f0f0f0b8 50%,#eeeeee60)}.top{position:absolute;top:35px;left:65px;right:65px;border-bottom:1px solid #00000020;padding-bottom:18px;display:flex;align-items:center;justify-content:space-between;font:10px Menlo,monospace}.brand{font:bold 30px Arial;letter-spacing:-3px}h1{position:absolute;top:163px;left:65px;font-size:44px;line-height:1.4;letter-spacing:-2px;margin:0;font-weight:700}.intro{position:absolute;left:65px;top:394px;width:570px;font-size:12px;line-height:1.8}.stamp{position:absolute;right:70px;bottom:125px;font:800 81px/.91 Arial;letter-spacing:-6px;color:#202020;opacity:.3}.bottom{position:absolute;bottom:32px;left:65px;right:65px;display:flex;justify-content:space-between;font:8px Menlo,monospace;letter-spacing:1px}
  </style></head><body><img class="photo" src="data:image/jpeg;base64,${background}"/><div class="wash"></div><div class="top"><span class="brand">AR.</span><span>AFAQ RAZA / THOUGHTFUL WEB ENGINEERING</span></div><h1>I build thoughtful<br/>digital experiences<br/>that make a difference.</h1><div class="intro">Drupal architecture, modern frontend engineering,<br/>and clear, reliable digital experiences.</div><div class="stamp">AFAQ<br/>RAZA</div><div class="bottom"><span>INDEPENDENT THINKING.</span><span>CONNECTED SOLUTIONS.</span></div></body></html>`);
  await page.locator(".photo").evaluate((image) => image.decode());
  await page.screenshot({ path: "public/og-cover.png" });
  console.log("Created public/og-cover.png (1200×630).");
} finally {
  await browser.close();
}
