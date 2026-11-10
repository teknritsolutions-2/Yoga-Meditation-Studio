const { chromium } = require(process.env.SOLA_PLAYWRIGHT || "playwright"),
  fs = require("fs"),
  assert = require("node:assert/strict");
(async () => {
  const b = await chromium.launch({
    executablePath:
      process.env.SOLA_BROWSER ||
      "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
    headless: true,
  });
  const p = await b.newPage(),
    root = process.env.SOLA_SCREEN_BASE || "http://127.0.0.1:4173",
    out = process.env.SOLA_QA_OUTPUT || "/tmp/sola-responsive-audit/states";
  fs.mkdirSync(out, { recursive: true });
  const errors = [];
  p.on("pageerror", (error) => errors.push(error.message));
  let count = 0;
  const shot = async (name, selector) => {
    await p.evaluate(async () => {
      await document.fonts.ready;
      for (const i of document.images) i.loading = "eager";
      await Promise.all(
        [...document.images].map((i) => i.decode().catch(() => {})),
      );
    });
    assert(
      await p.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    );
    if (selector)
      await p.locator(selector).screenshot({ path: out + "/" + name + ".png" });
    else
      await p.screenshot({ path: out + "/" + name + ".png", fullPage: true });
    count++;
  };
  for (const width of [390, 820])
    for (const dir of ["ltr", "rtl"]) {
      await p.setViewportSize({ width, height: width === 820 ? 1180 : 844 });
      await p.goto(root + "/index.html");
      await p.evaluate((dir) => {
        document.documentElement.dir = dir;
        document.documentElement.dataset.theme =
          dir === "rtl" ? "dark" : "light";
        writeStore("theme", document.documentElement.dataset.theme);
        writeStore("direction", dir);
      }, dir);
      for (let i = 0; i < 6; i++) {
        await p.locator("[data-practice]").nth(i).click();
        await shot(`practice-${i}-${width}-${dir}`, ".practice-layout");
      }
      await p.goto(root + "/pages/classes.html");
      await p.locator("[data-week-day]").last().click();
      await shot(`weekly-selected-${width}-${dir}`, ".weekly-explorer");
      await p.locator("#class-style").selectOption("Meditation");
      await p.locator("#class-level").selectOption("Advanced");
      await shot(`empty-classes-${width}-${dir}`, "#class-filters");
      assert.equal(await p.locator("#class-list .session-row").count(), 0);
      await p.locator("#class-filters button[type=reset]").click();
      await p.locator("#class-list .session-row").first().waitFor();
      await p.locator("#load-classes").click();
      assert.equal(await p.locator("#class-list .session-row").count(), 24);
      await p.goto(root + "/pages/memberships.html");
      await p.locator("#classes-week").focus();
      await p.keyboard.press("Home");
      assert.equal(await p.locator("#classes-week").inputValue(), "1");
      await p.keyboard.press("End");
      assert.equal(await p.locator("#classes-week").inputValue(), "7");
      await shot(`comparison-seven-${width}-${dir}`, ".comparison");
      for (const file of ["login", "signup"]) {
        await p.goto(root + "/pages/" + file + ".html");
        for (const toggle of await p.locator("[data-password-toggle]").all()) {
          const id = await toggle.getAttribute("data-password-toggle");
          await toggle.click();
          assert.equal(await p.locator("#" + id).getAttribute("type"), "text");
          await toggle.click();
          assert.equal(
            await p.locator("#" + id).getAttribute("type"),
            "password",
          );
        }
        await p.locator('[data-provider="Google"]').click();
        await shot(`${file}-feedback-${width}-${dir}`);
        await p.locator(".auth-brand").click();
        await p.waitForURL("**/index.html");
      }
      await p.goto(root + "/pages/dashboard.html#membership");
      await p.locator("#renewal-plan").selectOption("unlimited");
      await p.locator("#renewal-form button").click();
      await shot(`renewal-preview-${width}-${dir}`, "#modal");
      await p.keyboard.press("Escape");
      await p.goto(root + "/pages/memberships.html");
      for (const summary of await p.locator("main details summary").all()) {
        const was = await summary.locator("..").evaluate((e) => e.open);
        await summary.click();
        assert.notEqual(
          await summary.locator("..").evaluate((e) => e.open),
          was,
        );
      }
      await shot(`faq-expanded-${width}-${dir}`);
      await p.goto(root + "/pages/contact.html");
      await p.evaluate(() =>
        dialog("<h2>Your enquiry</h2><p>" + "W".repeat(200) + "</p>"),
      );
      await shot(`long-enquiry-${width}-${dir}`, "#modal");
    }
  assert.deepEqual(errors, []);
  fs.writeFileSync(
    out + "/results.json",
    JSON.stringify({ selectedStateCaptures: count, errors }, null, 2),
  );
  console.log({ selectedStateCaptures: count });
  await b.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
