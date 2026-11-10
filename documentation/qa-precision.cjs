const { chromium } = require(process.env.SOLA_PLAYWRIGHT || "playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
(async () => {
  const browser = await chromium.launch({
    executablePath:
      process.env.SOLA_BROWSER ||
      "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
    headless: true,
  });
  const page = await browser.newPage(),
    errors = [],
    checks = [],
    sizes = [];
  const root = process.env.SOLA_SCREEN_BASE || "http://127.0.0.1:4173",
    out = process.env.SOLA_QA_OUTPUT || "/tmp/sola-precision/targeted";
  fs.mkdirSync(out, { recursive: true });
  page.on("pageerror", (e) => errors.push(e.message));
  const pages = [
    "index.html",
    "pages/home2.html",
    "pages/classes.html",
    "pages/instructors.html",
    "pages/memberships.html",
    "pages/contact.html",
  ];
  // Opening the workspace first must never replace the public Login CTA.
  await page.goto(root + "/pages/dashboard.html");
  for (const width of [320, 390, 768, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const file of pages) {
      await page.goto(root + "/" + file);
      await page.evaluate(() => document.fonts.ready);
      for (const dir of ["ltr", "rtl"]) {
        await page.evaluate((dir) => {
          document.documentElement.dir = dir;
          document.documentElement.dataset.theme =
            dir === "rtl" ? "dark" : "light";
        }, dir);
        const metrics = await page.evaluate(() => {
          const box = (s) => {
            const el = document.querySelector(s),
              r = el.getBoundingClientRect(),
              c = getComputedStyle(el);
            return {
              left: r.left,
              right: r.right,
              padStart: c.paddingInlineStart,
              padEnd: c.paddingInlineEnd,
            };
          };
          return {
            nav: box(".nav-wrap"),
            content: box("main .wrap"),
            footer: box(".site-footer > .wrap"),
            overflow: document.documentElement.scrollWidth > innerWidth + 1,
          };
        });
        assert.deepEqual(
          metrics.nav,
          metrics.content,
          `${file} nav/content ${width} ${dir}`,
        );
        assert.deepEqual(metrics.nav, metrics.footer);
        assert.equal(
          metrics.overflow,
          false,
          `${file} overflow ${width} ${dir}`,
        );
        assert.equal(
          (await page.locator(".nav-login").innerText()).trim(),
          "Login",
        );
        assert(
          (await page.locator(".nav-login").getAttribute("href")).endsWith(
            "pages/login.html",
          ) ||
            (await page.locator(".nav-login").getAttribute("href")) ===
              "login.html",
        );
        assert(
          (
            await page
              .locator(".footer-group a")
              .filter({ hasText: "Member Dashboard" })
              .getAttribute("href")
          ).endsWith("dashboard.html"),
        );
        if (width <= 1190) {
          await page.locator(".mobile-menu").click();
          assert(await page.locator(".mobile-login").isVisible());
          assert(
            (await page.locator(".mobile-login").getAttribute("href")).endsWith(
              "login.html",
            ),
          );
          await page.keyboard.press("Escape");
        }
        checks.push(
          `Shared navbar/content/footer guides and persistent Login: ${file} ${width} ${dir}`,
        );
      }
    }
  }
  for (const width of [320, 390, 768, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const [name, file, focus] of [
      ["hero", "index.html", null],
      ["banner", "pages/classes.html", null],
      ["feature", "pages/instructors.html", ".guide-feature"],
      ["pair", "pages/instructors.html", ".guide-pair"],
      ["login", "pages/login.html", null],
      ["signup", "pages/signup.html", null],
    ]) {
      await page.goto(root + "/" + file);
      await page.evaluate(async () => {
        await document.fonts.ready;
        for (const im of document.images) im.loading = "eager";
        await Promise.all(
          [...document.images].map((im) => im.decode().catch(() => {})),
        );
      });
      for (const [mode, dir] of [
        ["light", "ltr"],
        ["dark", "ltr"],
        ...([390, 1024].includes(width) ? [["dark", "rtl"]] : []),
      ]) {
        await page.evaluate(
          ({ mode, dir, focus }) => {
            document.documentElement.dataset.theme = mode;
            document.documentElement.dir = dir;
            scrollTo({
              top: focus
                ? Math.max(
                    0,
                    document.querySelector(focus).getBoundingClientRect().top +
                      scrollY -
                      105,
                  )
                : 0,
              behavior: "instant",
            });
          },
          { mode, dir, focus },
        );
        await page.waitForTimeout(name === "hero" ? 700 : 80);
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth + 1,
          ),
          false,
        );
        if (name === "hero") {
          assert.equal(await page.locator(".motion-toggle").count(), 0);
          const w = await page
            .locator(".hero-waves")
            .evaluate((e) => e.getBoundingClientRect().width);
          sizes.push({ name, width, mode, dir, artWidth: w });
          assert.equal(
            await page
              .locator(".hero-waves")
              .evaluate((e) => getComputedStyle(e).animationName),
            "none",
          );
        }
        if (name === "banner") {
          assert(
            (
              await page.locator(".class-banner-art").getAttribute("src")
            ).endsWith("organic-spiral.svg"),
          );
          sizes.push({
            name,
            width,
            mode,
            dir,
            artWidth: await page
              .locator(".class-banner-art")
              .evaluate((e) => e.getBoundingClientRect().width),
          });
        }
        if (name === "pair" && width > 700) {
          const aligned = await page.locator(".guide-pair").evaluate((e) =>
            [...e.children].map((a) => {
              const selectors = [
                ".guide-pair-image",
                "h2",
                ".guide-specialty",
                ".text-link",
              ];
              return selectors.map(
                (s) => a.querySelector(s).getBoundingClientRect().top,
              );
            }),
          );
          aligned[0].forEach((v, i) =>
            assert(
              Math.abs(v - aligned[1][i]) < 1,
              "Instructor image/text/link alignment",
            ),
          );
        }
        if (name === "login" || name === "signup") {
          assert.equal(
            await page
              .locator(".public-nav,.site-footer,#site-header,#site-footer")
              .count(),
            0,
          );
          assert.equal(
            await page.locator(".auth-brand").getAttribute("href"),
            "../index.html",
          );
          await page.locator(".auth-brand").focus();
          assert(
            await page
              .locator(".auth-brand")
              .evaluate(
                (e) =>
                  e.matches(":focus-visible") &&
                  getComputedStyle(e).outlineStyle !== "none",
              ),
          );
        }
        const select = page.locator("select");
        if (await select.count()) {
          const props = await select.first().evaluate((e) => {
            const c = getComputedStyle(e);
            return {
              appearance: c.appearance,
              image: c.backgroundImage,
              position: c.backgroundPosition,
              padding: c.paddingInlineEnd,
              height: e.getBoundingClientRect().height,
            };
          });
          assert.equal(props.appearance, "none");
          assert(props.image.includes("svg"));
          assert(props.position.includes("16px"));
          assert.equal(props.padding, "48px");
          assert(props.height >= 48);
        }
        await page.screenshot({
          path: `${out}/${name}-${width}-${mode}-${dir}.png`,
        });
      }
    }
  }
  await page.goto(root + "/pages/classes.html");
  await page.locator("#class-style").focus();
  await page.keyboard.press("m");
  assert.equal(await page.locator("#class-style").inputValue(), "Meditation");
  checks.push("Native select keyboard changes work with custom chevrons");
  await page.evaluate(() => scrollTo({ top: 1000, behavior: "instant" }));
  await page.waitForTimeout(100);
  assert.equal(
    await page
      .locator(".site-header")
      .evaluate((e) => e.getBoundingClientRect().top),
    0,
  );
  await page.locator("#back-top").click();
  await page.waitForFunction(() => scrollY < 10);
  checks.push("Sticky header and floating back-to-top preserved");
  for (const file of ["login", "signup"]) {
    await page.goto(root + "/pages/" + file + ".html");
    await page.locator(".auth-brand").focus();
    await page.keyboard.press("Enter");
    await page.waitForURL("**/index.html");
    checks.push(`${file} brand navigates home by keyboard`);
  }
  assert.deepEqual(errors, []);
  fs.writeFileSync(
    out + "/results.json",
    JSON.stringify({ checks, sizes, errors }, null, 2),
  );
  console.log(
    JSON.stringify({ checks: checks.length, screenshots: 84, errors }, null, 2),
  );
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
