const { chromium, webkit } = require(
  process.env.SOLA_PLAYWRIGHT || "playwright",
);
const assert = require("node:assert/strict"),
  fs = require("node:fs");
(async () => {
  const engine = process.env.SOLA_AUDIT_ENGINE || "chromium",
    browser = await (engine === "webkit" ? webkit : chromium).launch(
      engine === "webkit"
        ? { headless: true }
        : {
            executablePath:
              process.env.SOLA_BROWSER ||
              "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
            headless: true,
          },
    );
  const p = await browser.newPage(),
    root = process.env.SOLA_SCREEN_BASE || "http://127.0.0.1:4173",
    out =
      process.env.SOLA_QA_OUTPUT || "/tmp/sola-responsive-audit/interactions",
    checks = [],
    errors = [];
  fs.mkdirSync(out, { recursive: true });
  p.on("pageerror", (e) => errors.push(e.message));
  const modes = [
    ["light", "ltr"],
    ["dark", "rtl"],
  ];
  for (const file of process.env.SOLA_AUDIT_SKIP_MENUS
    ? []
    : [
        "index.html",
        "pages/home2.html",
        "pages/classes.html",
        "pages/instructors.html",
        "pages/memberships.html",
        "pages/contact.html",
      ]) {
    for (const [width, height] of [
      [320, 568],
      [390, 844],
      [599, 900],
      [600, 900],
      [680, 900],
      [681, 900],
      [768, 1024],
      [820, 1180],
      [960, 900],
      [1024, 768],
      [1180, 350],
      [1190, 900],
    ]) {
      await p.setViewportSize({ width, height });
      await p.goto(root + "/" + file);
      await p.evaluate(async () => {
        await document.fonts.ready;
        for (const image of document.images) image.loading = "eager";
        await Promise.all(
          [...document.images].map((image) => image.decode().catch(() => {})),
        );
      });
      for (const [theme, dir] of modes) {
        await p.evaluate(
          ({ theme, dir }) => {
            document.documentElement.dataset.theme = theme;
            document.documentElement.dir = dir;
            applyTheme();
          },
          { theme, dir },
        );
        for (const location of ["top", "middle", "footer"]) {
          await p.evaluate(
            (location) =>
              scrollTo({
                top:
                  location === "top"
                    ? 0
                    : location === "middle"
                      ? document.documentElement.scrollHeight / 2
                      : document.documentElement.scrollHeight,
                behavior: "instant",
              }),
            location,
          );
          await p.waitForTimeout(25);
          const scroll = await p.evaluate(() => scrollY);
          assert(
            Math.abs(
              await p
                .locator(".site-header")
                .evaluate((e) => e.getBoundingClientRect().top),
            ) < 1,
          );
          const menuRect = await p.locator(".mobile-menu").boundingBox();
          await p.mouse.click(
            menuRect.x + menuRect.width / 2,
            menuRect.y + menuRect.height / 2,
          );
          assert.equal(await p.locator("main").evaluate((e) => e.inert), true);
          assert.equal(
            await p.evaluate(() => document.body.style.overflow),
            "hidden",
          );
          await p.locator(".home-menu summary").press("Enter");
          assert.equal(await p.locator(".home-menu").getAttribute("open"), "");
          const bounds = await p.locator(".public-nav").evaluate((e) => ({
            r: e.getBoundingClientRect().toJSON(),
            h: innerHeight,
          }));
          assert(bounds.r.bottom <= bounds.h + 1);
          assert(bounds.r.top >= 0);
          const focus = p.locator("#site-header");
          await focus.evaluate((header) => {
            const items = [
              ...header.querySelectorAll("a,button,summary"),
            ].filter((e) => e.tabIndex >= 0 && e.getClientRects().length);
            items.at(-1).focus({ preventScroll: true });
          });
          await p.keyboard.press("Tab");
          assert(
            await p.evaluate(
              () => document.activeElement.closest("#site-header") !== null,
            ),
          );
          if (
            file === "index.html" &&
            [320, 820, 1180].includes(width) &&
            location === "footer"
          )
            await p.screenshot({
              path: `${out}/menu-${width}-${theme}-${dir}.png`,
            });
          await p.keyboard.press("Escape");
          await p.waitForTimeout(150);
          assert.equal(
            await p.locator(".mobile-menu").getAttribute("aria-expanded"),
            "false",
          );
          assert.equal(await p.locator("main").evaluate((e) => e.inert), false);
          assert(
            Math.abs((await p.evaluate(() => scrollY)) - scroll) <= 8,
            JSON.stringify({
              file,
              width,
              theme,
              dir,
              location,
              before: scroll,
              after: await p.evaluate(() => scrollY),
            }),
          );
          const visibleLogin = await p
            .locator(".nav-login,.mobile-login")
            .evaluateAll(
              (es) => es.filter((e) => e.getClientRects().length).length,
            );
          assert.equal(visibleLogin, width <= 700 ? 0 : 1);
          checks.push(
            `Sticky menu/Home/Escape/focus/scroll ${file} ${width} ${theme} ${dir} ${location}`,
          );
        }
      }
    }
  }
  await p.setViewportSize({ width: 390, height: 844 });
  await p.goto(root + "/index.html");
  await p.locator(".mobile-menu").click();
  await p.locator(".theme-toggle").click();
  await p.locator(".direction-toggle").click();
  assert(await p.locator("main").evaluate((e) => e.inert));
  await p.locator(".nav-backdrop").click({ position: { x: 10, y: 700 } });
  assert.equal(await p.locator("main").evaluate((e) => e.inert), false);
  checks.push(
    "Theme/direction switching and backdrop dismissal while menu is open",
  );
  await p.locator(".mobile-menu").click();
  await p.setViewportSize({ width: 1280, height: 900 });
  await p.waitForFunction(() => !document.querySelector("main").inert);
  assert.equal(await p.locator("main").evaluate((e) => e.inert), false);
  assert.equal(await p.evaluate(() => document.body.style.overflow), "");
  checks.push(
    "Open compact menu releases body and focus isolation after desktop resize",
  );
  for (const width of [390, 820]) {
    await p.setViewportSize({ width, height: 1000 });
    await p.goto(root + "/index.html");
    await p.locator(".mobile-menu").click();
    await p.locator(".home-menu summary").click();
    await p.locator('.home-menu a[href$="home2.html"]').click();
    await p.waitForURL("**/pages/home2.html");
    assert.equal(await p.locator("main").evaluate((e) => e.inert), false);
    await p.locator(".mobile-menu").click();
    await p.locator('.public-nav a[href$="dashboard.html"]').click();
    await p.waitForURL("**/pages/dashboard.html");
    assert(await p.locator(".dashboard-shell").isVisible());
    checks.push(`Home dropdown and Dashboard navigation ${width}`);
  }
  for (const width of [320, 390, 681, 820, 960, 1024, 1180])
    for (const dir of ["ltr", "rtl"]) {
      await p.setViewportSize({ width, height: width === 1024 ? 768 : 900 });
      await p.goto(root + "/pages/dashboard.html#overview");
      await p.evaluate((dir) => {
        document.documentElement.dir = dir;
        document.documentElement.dataset.theme =
          dir === "rtl" ? "dark" : "light";
        const state = getState();
        state.profile.name = "W".repeat(40);
        saveState(state);
        renderDashboard();
      }, dir);
      assert.equal(
        await p.evaluate(
          () => document.documentElement.scrollWidth > innerWidth + 1,
        ),
        false,
      );
      if (width <= 960) {
        await p.locator(".dashboard-menu").click();
        assert.equal(
          await p.locator(".dashboard-sidebar").evaluate((e) => e.inert),
          false,
        );
        await p.locator('.dashboard-nav a[href="#overview"]').click();
        assert.equal(
          await p.locator(".dashboard-menu").getAttribute("aria-expanded"),
          "false",
        );
        assert.equal(
          await p.locator(".dashboard-sidebar").evaluate((e) => e.inert),
          true,
        );
        await p.locator(".dashboard-menu").click();
        await p.keyboard.press("Escape");
        assert.equal(
          await p.locator(".dashboard-menu").getAttribute("aria-expanded"),
          "false",
        );
      }
      await p.goto(root + "/pages/dashboard.html#usage");
      const ledger = p.locator(".ledger-scroll");
      await ledger.focus();
      for (let i = 0; i < 5; i++)
        await p.keyboard.press(dir === "rtl" ? "ArrowLeft" : "ArrowRight");
      await p.waitForTimeout(150);
      if (await ledger.evaluate((e) => e.scrollWidth > e.clientWidth + 1))
        assert(
          Math.abs(await ledger.evaluate((e) => e.scrollLeft)) > 0,
          `Keyboard ledger ${width} ${dir}`,
        );
      await p.keyboard.press("Home");
      assert.equal(await ledger.evaluate((e) => e.scrollLeft), 0);
      await p.keyboard.press("End");
      assert(
        await ledger.evaluate(
          (e) =>
            Math.abs(Math.abs(e.scrollLeft) - (e.scrollWidth - e.clientWidth)) <
            1,
        ),
      );
      assert.equal(
        await p.evaluate(
          () => document.documentElement.scrollWidth > innerWidth + 1,
        ),
        false,
      );
      checks.push(
        `Long name, drawer current-link/Escape, keyboard ledger ${width} ${dir}`,
      );
    }
  for (const [width, height] of [
    [320, 568],
    [390, 844],
    [820, 1180],
    [1024, 768],
  ])
    for (const [theme, dir] of [
      ["light", "ltr"],
      ["dark", "ltr"],
      ["light", "rtl"],
      ["dark", "rtl"],
    ]) {
      await p.setViewportSize({ width, height });
      await p.goto(root + "/pages/classes.html");
      await p.evaluate(
        ({ theme, dir }) => {
          document.documentElement.dataset.theme = theme;
          document.documentElement.dir = dir;
          classDetails(
            SESSIONS.find((s) => practiceFor(s).name.includes("Breathwork")).id,
          );
        },
        { theme, dir },
      );
      const modal = p.locator("#modal");
      assert(await modal.isVisible());
      const box = await modal.boundingBox();
      assert(
        box.x >= 0 &&
          box.y >= 0 &&
          box.x + box.width <= width + 1 &&
          box.y + box.height <= height + 1,
      );
      assert(await modal.evaluate((e) => e.scrollWidth <= e.clientWidth + 1));
      await p.locator(".modal-close").click();
      assert.equal(await modal.isVisible(), false);
      await p.evaluate(() =>
        dialog("<h2>Your enquiry</h2><p>" + "W".repeat(200) + "</p>"),
      );
      assert(await modal.evaluate((e) => e.scrollWidth <= e.clientWidth + 1));
      await p.keyboard.press("Escape");
      checks.push(
        `Long class/enquiry dialogs and close controls ${width} ${theme} ${dir}`,
      );
    }
  // Shared rows must follow content rather than clipping or fixed title heights.
  for (const width of [701, 768, 820, 960, 1024, 1180])
    for (const dir of ["ltr", "rtl"]) {
      await p.setViewportSize({ width, height: 1000 });
      for (const [file, selector, parts] of [
        [
          "pages/memberships.html",
          ".membership-all .plan",
          ["h3", "p", ".price", "ul", ".btn", "small"],
        ],
        [
          "pages/home2.html",
          ".compare-practices article",
          ["img", "h3", "p", ".text-link"],
        ],
        ["pages/classes.html", ".week-card", ["h4", "p", ".week-card-actions"]],
      ]) {
        await p.goto(root + "/" + file);
        await p.evaluate(async (dir) => {
          document.documentElement.dir = dir;
          await document.fonts.ready;
        }, dir);
        const rows = await p
          .locator(selector)
          .evaluateAll(
            (cards, parts) =>
              cards.map((card) =>
                parts.map(
                  (s) => card.querySelector(s).getBoundingClientRect().top,
                ),
              ),
            parts,
          );
        for (let i = 0; i < rows.length; i += 2)
          rows[i].forEach((value, j) =>
            assert(
              Math.abs(value - rows[i + 1][j]) < 1,
              `${selector} shared row ${width} ${dir} ${parts[j]}`,
            ),
          );
      }
      checks.push(`Shared plan/comparison/session rows ${width} ${dir}`);
    }
  assert.deepEqual(errors, []);
  fs.writeFileSync(
    out + "/results.json",
    JSON.stringify({ engine, checks, errors }, null, 2),
  );
  console.log({ engine, checks: checks.length, errors });
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
