const { chromium, webkit } = require(
  process.env.SOLA_PLAYWRIGHT || "playwright",
);
const assert = require("node:assert/strict"),
  fs = require("node:fs");
(async () => {
  const engine = process.env.SOLA_AUDIT_ENGINE || "chromium";
  const b = await (engine === "webkit" ? webkit : chromium).launch(
    engine === "webkit"
      ? { headless: true }
      : {
          headless: true,
          executablePath:
            process.env.SOLA_BROWSER ||
            "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
        },
  );
  const p = await b.newPage(),
    root = process.env.SOLA_SCREEN_BASE || "http://127.0.0.1:4173",
    out = process.env.SOLA_QA_OUTPUT || "/tmp/sola-compact/" + engine;
  fs.mkdirSync(out, { recursive: true });
  const checks = [],
    errors = [];
  p.on("pageerror", (e) => errors.push(e.message));
  const mode = async (theme, dir) =>
    p.evaluate(
      ({ theme, dir }) => {
        document.documentElement.dataset.theme = theme;
        document.documentElement.dir = dir;
        applyTheme();
      },
      { theme, dir },
    );
  const fits = async () =>
    assert(
      await p.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    );
  for (const width of [
    320, 390, 700, 701, 768, 820, 960, 1024, 1180, 1190, 1191, 1440,
  ])
    for (const [theme, dir] of [
      ["light", "ltr"],
      ["light", "rtl"],
      ["dark", "ltr"],
      ["dark", "rtl"],
    ]) {
      await p.setViewportSize({
        width,
        height: width === 820 ? 1180 : width === 1024 ? 768 : 900,
      });
      for (const file of ["index.html", "pages/home2.html"]) {
        await p.goto(root + "/" + file);
        await mode(theme, dir);
        await p.evaluate(() => document.fonts.ready);
        await fits();
        if (width <= 1190) {
          assert.equal(await p.locator(".theme-toggle").isVisible(), false);
          assert.equal(await p.locator(".direction-toggle").isVisible(), false);
          assert.equal(await p.locator(".nav-login").isVisible(), false);
          await p.locator(".mobile-menu").click();
          for (const selector of [
            ".theme-toggle",
            ".direction-toggle",
            ".nav-login",
          ]) {
            assert(await p.locator(".public-nav " + selector).isVisible());
            assert.equal(await p.locator(selector).count(), 1);
          }
          const bounds = await p.locator(".public-nav").boundingBox();
          assert(bounds.x >= 0 && bounds.x + bounds.width <= width + 1);
          assert(bounds.width <= 380);
          assert(
            bounds.y + bounds.height <=
              (await p.evaluate(() => innerHeight + 1)),
          );
          await p.locator(".theme-toggle").click();
          assert.equal(
            await p.evaluate(() => document.documentElement.dataset.theme),
            theme === "light" ? "dark" : "light",
          );
          await p.locator(".theme-toggle").click();
          await p.locator(".direction-toggle").click();
          assert.equal(
            await p.evaluate(() => document.documentElement.dir),
            dir === "ltr" ? "rtl" : "ltr",
          );
          await p.locator(".direction-toggle").click();
          if (
            file === "index.html" &&
            [390, 820].includes(width) &&
            theme === "light" &&
            dir === "ltr"
          )
            await p.screenshot({
              path: out + "/public-menu-" + width + ".png",
            });
          await p.keyboard.press("Escape");
          assert.equal(await p.locator(".nav-login").isVisible(), false);
        } else {
          assert(await p.locator(".nav-tools .theme-toggle").isVisible());
          assert(await p.locator(".nav-tools .nav-login").isVisible());
        }
        if (width >= 701 && width <= 1190) {
          const positions = await p
            .locator(".footer-group")
            .evaluateAll((es) => es.map((e) => e.getBoundingClientRect().top));
          assert(Math.max(...positions) - Math.min(...positions) < 1);
          const edges = await p
            .locator(".plans-section .wrap")
            .evaluate((w) => {
              const r = w.getBoundingClientRect(),
                s = getComputedStyle(w),
                cards = [...w.querySelectorAll(".plan")].map((e) =>
                  e.getBoundingClientRect(),
                );
              return {
                left: r.left + parseFloat(s.paddingLeft),
                right: r.right - parseFloat(s.paddingRight),
                cardLeft: Math.min(...cards.map((c) => c.left)),
                cardRight: Math.max(...cards.map((c) => c.right)),
              };
            });
          assert(Math.abs(edges.left - edges.cardLeft) < 1);
          assert(Math.abs(edges.right - edges.cardRight) < 1);
        }
        checks.push(
          `Public controls, pricing, footer ${file} ${width} ${theme} ${dir}`,
        );
      }
      await p.goto(root + "/pages/classes.html");
      await mode(theme, dir);
      if (width <= 1190) {
        for (const id of ["class-style", "class-level", "class-date"]) {
          const trigger = p.locator("#" + id + "-trigger");
          await trigger.click();
          const menu = p.locator("#" + id + "-options");
          assert(await menu.isVisible());
          const a = await trigger.boundingBox(),
            r = await menu.boundingBox();
          assert(Math.abs(a.x - r.x) < 1);
          assert(Math.abs(a.width - r.width) < 1);
          assert(
            Math.min(
              Math.abs(r.y - a.y - a.height - 6),
              Math.abs(a.y - r.y - r.height - 6),
            ) < 2,
          );
          assert(
            r.y >= 0 &&
              r.y + r.height <= (await p.evaluate(() => innerHeight + 1)),
          );
          assert(
            await menu
              .locator("[role=option]")
              .evaluateAll((es) =>
                es.every(
                  (e) =>
                    parseFloat(getComputedStyle(e).fontSize) >= 16 &&
                    e.getBoundingClientRect().height >= 44,
                ),
              ),
          );
          if (
            id === "class-level" &&
            [390, 820].includes(width) &&
            theme === "light" &&
            dir === "ltr"
          )
            await p.screenshot({
              path: out + "/class-options-" + width + ".png",
            });
          await p.keyboard.press("Escape");
          assert.equal(await menu.isVisible(), false);
        }
        await p.locator("#class-style-trigger").click();
        await p
          .locator("#class-style-options [role=option]")
          .filter({ hasText: "Meditation" })
          .click();
        assert.equal(
          await p.locator("#class-style").inputValue(),
          "Meditation",
        );
        await p.locator("#class-level-trigger").click();
        await p.keyboard.press("End");
        await p.keyboard.press("ArrowUp");
        await p.keyboard.press("Enter");
        assert.equal(await p.locator("#class-level").inputValue(), "Advanced");
        assert.equal(await p.locator("#class-list .session-row").count(), 0);
        await p.locator("#class-filters button[type=reset]").click();
        await p.locator("#class-list .session-row").first().waitFor();
        assert.equal(
          await p.locator("#class-style-value").innerText(),
          "All styles",
        );
        await p.locator("#class-date-trigger").click();
        await p.keyboard.press("End");
        await p.keyboard.press("Enter");
        assert.equal(
          await p.locator("#class-date").inputValue(),
          await p.locator("#class-date option").last().getAttribute("value"),
        );
        await p.locator("#class-style-trigger").click();
        await p.locator("h1").click();
        assert.equal(
          await p.locator("#class-style-options").isVisible(),
          false,
        );
      } else {
        assert(await p.locator("#class-style").isVisible());
        assert.equal(
          await p.locator("#class-style-trigger").isVisible(),
          false,
        );
      }
      await fits();
      checks.push(
        `Anchored filters and selection/reset ${width} ${theme} ${dir}`,
      );
      await p.goto(root + "/pages/dashboard.html");
      await mode(theme, dir);
      await p.evaluate(() => document.fonts.ready);
      await fits();
      if (width <= 1190) {
        assert(await p.locator(".dashboard-topbar .brand").isVisible());
        assert.equal(await p.locator(".dashboard-tagline").isVisible(), false);
        assert.equal(await p.locator(".theme-toggle").isVisible(), false);
        assert.equal(await p.locator(".direction-toggle").isVisible(), false);
        const menu = await p.locator(".dashboard-menu").boundingBox(),
          brand = await p.locator(".dashboard-topbar .brand").boundingBox();
        assert(
          dir === "ltr"
            ? menu.x > brand.x + brand.width
            : menu.x + menu.width < brand.x,
        );
        if ([390, 820].includes(width) && theme === "light" && dir === "ltr")
          await p.screenshot({
            path: out + "/dashboard-header-" + width + ".png",
          });
        await p.locator(".dashboard-menu").click();
        assert(await p.locator(".dashboard-sidebar .theme-toggle").isVisible());
        assert(
          await p.locator(".dashboard-sidebar .direction-toggle").isVisible(),
        );
        await p.locator(".theme-toggle").click();
        assert.equal(
          await p.evaluate(() => document.documentElement.dataset.theme),
          theme === "light" ? "dark" : "light",
        );
        await p.locator(".direction-toggle").click();
        assert.equal(
          await p.evaluate(() => document.documentElement.dir),
          dir === "ltr" ? "rtl" : "ltr",
        );
        await p.keyboard.press("Escape");
        assert.equal(
          await p.locator(".dashboard-sidebar").evaluate((e) => e.inert),
          true,
        );
      } else {
        assert(await p.locator(".dashboard-topbar .theme-toggle").isVisible());
        assert.equal(await p.locator(".dashboard-brand").isVisible(), false);
      }
      checks.push(
        `Branded dashboard header and drawer tools ${width} ${theme} ${dir}`,
      );
    }
  await p.setViewportSize({ width: 390, height: 844 });
  await p.goto(root + "/index.html");
  await p.locator(".mobile-menu").click();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.waitForFunction(() => !document.querySelector("main").inert);
  assert(await p.locator(".nav-tools .theme-toggle").isVisible());
  await p.goto(root + "/pages/dashboard.html");
  await p.setViewportSize({ width: 820, height: 1180 });
  await p.waitForFunction(() =>
    document.querySelector(".sidebar-display-controls .theme-toggle"),
  );
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.waitForFunction(() =>
    document.querySelector(".dashboard-topbar .theme-toggle"),
  );
  checks.push("Live resize relocates the same controls without duplicates");
  assert.deepEqual(errors, []);
  fs.writeFileSync(
    out + "/results.json",
    JSON.stringify({ engine, checks, errors }, null, 2),
  );
  console.log({ engine, checks: checks.length, errors });
  await b.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
