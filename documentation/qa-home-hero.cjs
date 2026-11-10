const { chromium } = require(process.env.SOLA_PLAYWRIGHT || "playwright"),
  assert = require("node:assert/strict"),
  fs = require("node:fs");
(async () => {
  const browser = await chromium.launch({
    executablePath:
      process.env.SOLA_BROWSER ||
      "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
    headless: true,
  });
  const page = await browser.newPage();
  const root = process.env.SOLA_SCREEN_BASE || "http://127.0.0.1:4173",
    out = process.env.SOLA_QA_OUTPUT || "/tmp/sola-hero/final",
    checks = [],
    errors = [];
  fs.mkdirSync(out, { recursive: true });
  page.on("pageerror", (e) => errors.push(e.message));
  for (const width of [320, 390, 768, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 1100 });
    await page.goto(root + "/index.html");
    await page.evaluate(async () => {
      await document.fonts.ready;
      for (const s of [".home-hero-photo", ".hero-waves"])
        await document.querySelector(s).decode();
    });
    for (const theme of ["light", "dark"])
      for (const dir of ["ltr", "rtl"]) {
        await page.evaluate(
          ({ theme, dir }) => {
            document.documentElement.dataset.theme = theme;
            document.documentElement.dir = dir;
            scrollTo({ top: 0, behavior: "instant" });
          },
          { theme, dir },
        );
        await page.waitForTimeout(200);
        const metrics = await page.evaluate(() => {
          const rect = (s) => {
            const r = document.querySelector(s).getBoundingClientRect();
            return {
              x: r.x,
              y: r.y,
              width: r.width,
              height: r.height,
              right: r.right,
              bottom: r.bottom,
            };
          };
          return {
            heading: rect(".hero-heading"),
            stage: rect(".hero-stage"),
            photo: rect(".home-hero-photo"),
            story: rect(".hero-story"),
            wave: rect(".hero-waves"),
            overflow: document.documentElement.scrollWidth > innerWidth + 1,
          };
        });
        assert.equal(metrics.overflow, false);
        assert(metrics.heading.bottom <= metrics.stage.y);
        assert.equal(
          await page.locator(".solar-orbit,.photo-note,.motion-toggle").count(),
          0,
        );
        assert.equal(await page.locator("h1").count(), 1);
        assert(
          (await page.locator(".hero-waves").getAttribute("src")).endsWith(
            "hero-waves.svg",
          ),
        );
        assert.equal(
          await page.locator(".home-hero-photo").getAttribute("src"),
          "./assets/images/flow.jpg",
        );
        assert.equal(
          await page
            .locator(".hero-waves")
            .evaluate((e) => getComputedStyle(e).animationName),
          "none",
        );
        assert.equal(await page.locator(".hero-story .btn").count(), 2);
        assert(
          (
            await page.locator(".hero-story .btn").first().getAttribute("href")
          ).endsWith("pages/classes.html"),
        );
        assert(
          (
            await page.locator(".hero-story .btn").last().getAttribute("href")
          ).endsWith("pages/memberships.html"),
        );
        if (width <= 700) {
          assert(metrics.story.bottom <= metrics.photo.y + 1);
          assert(
            Math.abs(metrics.photo.width / metrics.photo.height - 1400 / 933) <
              0.01,
          );
        } else {
          assert(Math.abs(metrics.photo.y - metrics.story.y) < 1);
          assert(Math.abs(metrics.photo.height - metrics.story.height) < 1);
        }
        await page.screenshot({
          path: `${out}/home-${width}-${theme}-${dir}.png`,
        });
        checks.push({ width, theme, dir, ...metrics });
      }
  }
  assert.deepEqual(errors, []);
  fs.writeFileSync(
    out + "/results.json",
    JSON.stringify({ checks, errors }, null, 2),
  );
  console.log({ configurations: checks.length, errors });
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
