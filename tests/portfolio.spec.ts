import { expect, test } from "@playwright/test";

test("layout, navigation, modal keyboard behavior, and reduced-motion fallback", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const width of [360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await expect(page.getByTestId("hero-webgl")).toHaveCount(0);
    await page.screenshot({
      path: `test-results/portfolio-${width}.png`,
      fullPage: true,
    });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(
    page.getByRole("button", { name: "Close navigation" }),
  ).toHaveAttribute("aria-expanded", "true");
  await page
    .getByRole("navigation")
    .getByRole("link", { name: /Work/ })
    .click();
  await expect(page).toHaveURL(/#work$/);
  await expect(
    page.getByRole("button", { name: "Open navigation" }),
  ).toHaveAttribute("aria-expanded", "false");
  const trigger = page.getByRole("button", {
    name: "Explore LEAP",
    exact: true,
  });
  await trigger.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Close project details" }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await page
    .getByRole("link", { name: "Let’s build something", exact: true })
    .click();
  await expect(page).toHaveURL(/#contact$/);
  await expect(
    page.getByRole("link", { name: "Connect with Danyal Zeb on LinkedIn" }),
  ).toHaveAttribute(
    "href",
    "https://www.linkedin.com/in/danyal-zeb-4a1571249/",
  );
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main$/);
  expect(errors).toEqual([]);
});

test("native scrolling drives the hero and gallery, with reduced-motion cleanup", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const art = page.locator(".hero-background");
  const initial = await art.evaluate(
    (element) => getComputedStyle(element).transform,
  );
  await page.screenshot({ path: "test-results/portfolio-motion-hero.png" });
  await page.evaluate(() => window.scrollTo(0, 600));
  await expect
    .poll(() => art.evaluate((element) => getComputedStyle(element).transform))
    .not.toBe(initial);
  const project = page.locator(".project-card").first();
  await project.scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      project
        .locator(".project-art")
        .evaluate((element) => element.style.transform),
    )
    .not.toBe("");
  await page.screenshot({ path: "test-results/portfolio-motion-work.png" });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect
    .poll(() =>
      page
        .locator(".hero-copy")
        .first()
        .evaluate((element) => element.style.transform),
    )
    .toBe("");
  await expect(page.locator(".scroll-progress")).not.toBeVisible();
  await page
    .getByRole("button", { name: "Explore LEAP", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  expect(errors).toEqual([]);
});

test("touch scrolling retains navigation and project access", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:5173/");
  await page.getByRole("link", { name: "Explore work", exact: true }).tap();
  await expect(page).toHaveURL(/#work$/);
  await page
    .getByRole("button", { name: "Explore LEAP", exact: true })
    .tap();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Close project details" }).tap();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await context.close();
});

test("capability details expand accessibly and hero image loads", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".hero-background")).toBeVisible();
  expect(
    await page
      .locator(".hero-background")
      .evaluate((image) => (image as HTMLImageElement).naturalWidth),
  ).toBeGreaterThan(0);
  const card = page.locator(".capability").first();
  await card.getByRole("button", { name: "Explore stack" }).click();
  await expect(card.getByRole("button", { name: "Show less" })).toHaveAttribute(
    "aria-expanded",
    "true",
  );
  await expect(card.locator(".capability-details")).toBeVisible();
  await card.getByRole("button", { name: "Show less" }).click();
  await expect(card.locator(".capability-details")).not.toBeVisible();
});

test("animated hero autoplays silently without controls and suspends offscreen", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const video = page.locator(".hero-video");
  await expect(video).toHaveClass(/is-ready/, { timeout: 15000 });
  await expect
    .poll(() =>
      video.evaluate((element) => (element as HTMLVideoElement).paused),
    )
    .toBe(false);
  const properties = await video.evaluate((element) => {
    const media = element as HTMLVideoElement;
    return {
      muted: media.muted,
      loop: media.loop,
      inline: media.playsInline,
      width: media.videoWidth,
      duration: media.duration,
    };
  });
  expect(properties.muted).toBe(true);
  expect(properties.loop).toBe(true);
  expect(properties.inline).toBe(true);
  expect(properties.width).toBeGreaterThan(0);
  expect(properties.duration).toBeGreaterThan(0);
  await expect(video).toHaveCSS("opacity", "1");
  await page.screenshot({ path: "test-results/portfolio-video-hero.png" });
  await expect(page.locator(".hero-video-control")).toHaveCount(0);
  await expect(video).toHaveAttribute(
    "src",
    "/videos/abstract-technology-30s.mp4",
  );
  await page.waitForTimeout(1400);
  await page.screenshot({ path: "test-results/portfolio-video-hero.png" });
  await page.evaluate(() => scrollTo(0, 1500));
  await expect
    .poll(() =>
      video.evaluate((element) => (element as HTMLVideoElement).paused),
    )
    .toBe(true);
  await page.evaluate(() => scrollTo(0, 0));
  await expect
    .poll(() =>
      video.evaluate((element) => (element as HTMLVideoElement).paused),
    )
    .toBe(false);
});

test("reduced motion skips video downloads and failed footage keeps the poster", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator(".hero-video")).toHaveCount(0);
  expect(
    requests.some((url) => url.includes("abstract-technology-30s.mp4")),
  ).toBe(false);
  await page.route("**/videos/abstract-technology-30s.mp4", (route) =>
    route.abort(),
  );
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await expect(page.locator(".hero-video")).toHaveCount(0, { timeout: 10000 });
  await expect(page.locator(".hero-background")).toBeVisible();
  expect(
    await page
      .locator(".hero-background")
      .evaluate((image) => (image as HTMLImageElement).naturalWidth),
  ).toBeGreaterThan(0);
  await expect(
    page.getByRole("link", { name: "Explore work", exact: true }),
  ).toBeVisible();
});

test("supporting text is comfortably readable on desktop and mobile", async ({
  page,
}) => {
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    for (const selector of [
      ".project-summary",
      ".about-copy>p:not(.eyebrow)",
      ".capability>p",
    ]) {
      const sizes = await page
        .locator(selector)
        .evaluateAll((elements) =>
          elements.map((element) =>
            parseFloat(getComputedStyle(element).fontSize),
          ),
        );
      expect(sizes.every((size) => size >= 13)).toBe(true);
    }
  }
});

test("30-second hero contains changing scenes and loops at its endpoint", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const video = page.locator(".hero-video");
  await expect(video).toHaveClass(/is-ready/, { timeout: 15000 });
  const duration = await video.evaluate(
    (element) => (element as HTMLVideoElement).duration,
  );
  expect(duration).toBeCloseTo(30, 1);
  await video.evaluate((element) => (element as HTMLVideoElement).pause());
  const frames: number[] = [];
  for (const time of [2, 8, 15, 21, 27]) {
    await video.evaluate(
      (element, time) =>
        new Promise<void>((resolve) => {
          element.addEventListener("seeked", () => resolve(), { once: true });
          (element as HTMLVideoElement).currentTime = time;
        }),
      time,
    );
    frames.push(
      await video.evaluate((element) => {
        const canvas = document.createElement("canvas");
        canvas.width = 160;
        canvas.height = 90;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(element as HTMLVideoElement, 0, 0, 160, 90);
        return ctx
          .getImageData(0, 0, 160, 90)
          .data.reduce((hash, value) => ((hash * 31) ^ value) >>> 0, 0);
      }),
    );
    await page
      .locator(".hero")
      .screenshot({ path: `test-results/hero-timeline-${time}s.png` });
  }
  expect(new Set(frames).size).toBe(5);
  await video.evaluate((element) => {
    (element as HTMLVideoElement).currentTime = 29.8;
    return (element as HTMLVideoElement).play();
  });
  await expect
    .poll(
      () =>
        video.evaluate((element) => (element as HTMLVideoElement).currentTime),
      { timeout: 5000 },
    )
    .toBeLessThan(2);
  await expect
    .poll(() =>
      video.evaluate((element) => (element as HTMLVideoElement).paused),
    )
    .toBe(false);
});

test("all 12 real Drupal projects have live links and accurate integration scope", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#work");
  const projects = [
    ["LEAP", "https://onegiantleap.com/", true],
    ["LEAP East", "https://leapeast.com/", true],
    ["Black Hat MEA", "https://blackhatmea.com/", true],
    ["DeepFest", "https://deepfest.com/", true],
    ["Tahaluf", "https://tahaluf.com/", false],
    ["Cityscape Global", "https://cityscapeglobal.com/", true],
    ["Umrah & Ziyarah Forum", "https://umrah-ziyarah.com/", true],
    ["BIO Middle East", "https://biomiddleeast.com/", true],
    ["Global Water Sustainability Conference", "https://idwsc.com/", true],
    ["Red Sea Yacht Show", "https://redseayachtshow.com/", true],
    ["Kingdom of Gaming", "https://kingdomofgaming.com/", true],
    ["American Elements", "https://www.americanelements.com/", false],
  ] as const;
  await expect(page.locator(".project-card")).toHaveCount(12);
  await expect(page.locator(".project-card img.project-desktop")).toHaveCount(12);
  for (const [title, href, integrated] of projects) {
    const live = page.getByRole("link", { name: `Visit ${title}`, exact: true });
    await expect(live).toHaveAttribute("href", href);
    await expect(live).toHaveAttribute("rel", "noopener noreferrer");
    await page.getByRole("button", { name: `Explore ${title}`, exact: true }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("heading", { name: title, exact: true })).toBeVisible();
    await expect(dialog.getByRole("link", { name: "Visit project" })).toHaveAttribute("href", href);
    for (const contribution of ["Swapcard integration", "Custom UTM tracking", "Custom URN handling", "API integration"]) {
      await expect(dialog.getByRole("listitem").filter({ hasText: contribution })).toHaveCount(integrated ? 1 : 0);
    }
    await expect(dialog).not.toContainText("ILLUSTRATIVE CONCEPT");
    await dialog.getByRole("button", { name: "Close project details" }).click();
  }
  for (const image of await page.locator(".project-card img").all()) {
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((el) => (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  }
  await page.locator("#work").screenshot({ path: "test-results/real-project-gallery.png" });
});

test("mobile corner previews remain usable and hover motion respects reduced motion", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await expect(page.locator(".project-card .project-mobile-device")).toHaveCount(12);
  await expect(page.locator(".project-card .project-mobile-caption").filter({ hasText: "Mobile concept" })).toHaveCount(12);
  const trigger = page.getByRole("button", { name: "Explore LEAP", exact: true });
  await trigger.scrollIntoViewIfNeeded();
  const device = trigger.locator(".project-mobile-device");
  await device.locator("img").evaluate((img) => (img as HTMLImageElement).decode());
  await page.mouse.move(0, 0);
  const transform = () => device.evaluate((el) => getComputedStyle(el).transform);
  const initial = await transform();
  await trigger.hover();
  await expect.poll(transform).not.toBe(initial);
  await trigger.screenshot({ path: "test-results/project-hover-mobile-preview.png" });
  await page.mouse.move(0, 0);
  await expect.poll(transform).toBe(initial);
  await page.emulateMedia({ reducedMotion: "reduce" });
  const reducedInitial = await transform();
  await trigger.hover();
  await expect.poll(transform).toBe(reducedInitial);
  await trigger.click();
  await expect(page.getByRole("dialog").locator(".project-mobile-device")).toBeVisible();
  await page.getByRole("button", { name: "Close project details" }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await trigger.scrollIntoViewIfNeeded();
  await expect(device).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await trigger.screenshot({ path: "test-results/project-mobile-inset-390.png" });
});
