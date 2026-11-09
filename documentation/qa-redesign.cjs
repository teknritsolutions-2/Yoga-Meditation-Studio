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
  const p = await browser.newPage({ viewport: { width: 1280, height: 1000 } }),
    checks = [],
    errors = [],
    requests = [];
  const root = process.env.SOLA_SCREEN_BASE || "http://127.0.0.1:4173";
  p.on("pageerror", (e) => errors.push(e.message));
  p.on("request", (r) => requests.push({ method: r.method(), url: r.url() }));
  await p.goto(root + "/pages/classes.html");
  const dates = await p
    .locator("[data-week-day]")
    .evaluateAll((es) => es.map((e) => e.dataset.weekDay));
  assert.equal(dates.length, 7);
  assert.equal(new Date(dates[0] + "T12:00:00+05:30").getUTCDay(), 1);
  for (let i = 0; i < 7; i++) {
    if (i)
      assert.equal((new Date(dates[i]) - new Date(dates[i - 1])) / 86400000, 1);
    await p.locator('[data-week-day="' + dates[i] + '"]').click();
    assert.equal(await p.locator(".week-card").count(), 4);
    assert.equal(
      await p
        .locator(".week-tab[aria-selected=true]")
        .getAttribute("data-week-day"),
      dates[i],
    );
    const ids = await p
      .locator(".week-card [data-book]")
      .evaluateAll((es) => es.map((e) => e.dataset.book));
    assert(
      await p.evaluate(
        ({ ids, date }) =>
          ids.every((id) => SESSIONS.find((s) => s.id === id).date === date),
        { ids, date: dates[i] },
      ),
    );
  }
  checks.push(
    "Seven consecutive Monday–Sunday dates each expose the matching four catalog sessions",
  );
  await p.locator(".week-tab[aria-selected=true]").focus();
  await p.keyboard.press("Home");
  assert.equal(
    await p
      .locator(".week-tab[aria-selected=true]")
      .getAttribute("data-week-day"),
    dates[0],
  );
  await p.keyboard.press("ArrowRight");
  assert.equal(
    await p
      .locator(".week-tab[aria-selected=true]")
      .getAttribute("data-week-day"),
    dates[1],
  );
  await p.evaluate(() => (document.documentElement.dir = "rtl"));
  await p.keyboard.press("ArrowLeft");
  assert.equal(
    await p
      .locator(".week-tab[aria-selected=true]")
      .getAttribute("data-week-day"),
    dates[2],
  );
  const id = await p
    .locator(".week-card [data-details]")
    .first()
    .getAttribute("data-details");
  await p.locator(".week-card [data-details]").first().click();
  assert(await p.locator("#modal").isVisible());
  assert.equal(
    await p.locator("#modal [data-book]").getAttribute("data-book"),
    id,
  );
  await p.keyboard.press("Escape");
  await p.locator(".week-card [data-book]").first().click();
  await p.waitForFunction(() => location.pathname.endsWith("/dashboard.html"));
  assert(await p.locator("#modal").isVisible());
  assert.equal(
    await p.locator("#modal [data-book]").getAttribute("data-book"),
    id,
  );
  checks.push(
    "Keyboard/RTL day selection and View/Book preserve the selected session through direct dashboard access",
  );
  await p.goto(root + "/pages/memberships.html");
  for (const n of [1, 3, 7]) {
    await p.locator("#classes-week").fill(String(n));
    const expected = await p.evaluate(
      (n) =>
        PLANS.map((plan) => {
          let used = Math.min(
            plan.credits ?? Infinity,
            Math.ceil((n * plan.days) / 7),
          );
          return { used, cost: money(Math.ceil(plan.price / used)) };
        }),
      n,
    );
    for (let i = 0; i < 4; i++) {
      const card = p.locator(".comparison-card").nth(i);
      assert.equal(
        (await card.locator("dd").first().innerText()).trim(),
        String(expected[i].used),
      );
      assert(
        (await card.locator(".comparison-cost").innerText()).includes(
          expected[i].cost,
        ),
      );
    }
  }
  checks.push(
    "All four comparison plans retain correct capped/unlimited math at frequencies 1, 3, and 7",
  );
  const storage = await p.evaluate(() => localStorage.getItem("sola-state"));
  for (const file of ["login", "signup"]) {
    await p.goto(root + "/pages/" + file + ".html");
    assert.equal(
      await p
        .locator(
          "#site-header,#site-footer,.public-nav,.site-footer,nav,footer",
        )
        .count(),
      0,
    );
    assert.equal(
      await p
        .locator('a[href="../index.html"],a[href="dashboard.html"]')
        .count(),
      0,
    );
    assert.equal(await p.locator("[data-provider] img").count(), 2);
    assert(
      await p
        .locator("[data-provider] img")
        .evaluateAll((es) => es.every((e) => e.naturalWidth > 0)),
    );
    await p.locator("#auth-email").fill("qa@example.com");
    await p.locator("#auth-password").fill("OnlyForBrowserQA8");
    await p.locator('[data-password-toggle="auth-password"]').click();
    assert.equal(
      await p.locator("#auth-password").getAttribute("type"),
      "text",
    );
    if (file === "signup") {
      await p.locator("#full-name").fill("QA Visitor");
      await p.locator("#confirm-password").fill("DifferentPassword8");
      assert.equal(
        await p.locator("#confirm-password").evaluate((e) => e.validity.valid),
        false,
      );
      await p.locator("#confirm-password").fill("OnlyForBrowserQA8");
      assert.equal(
        await p.locator("#confirm-password").evaluate((e) => e.validity.valid),
        true,
      );
    } else {
      await p.locator("#remember-me").check();
      await p.setViewportSize({ width: 320, height: 900 });
      const row = await p
        .locator(".auth-options")
        .evaluate((e) =>
          [...e.children].map((x) => x.getBoundingClientRect().top),
        );
      assert(Math.abs(row[0] - row[1]) < 10);
    }
    const requestCount = requests.length;
    await p.locator(".auth-submit").click();
    assert(
      (await p.locator("#auth-feedback").innerText()).includes("not connected"),
    );
    assert.equal(await p.locator("#auth-password").inputValue(), "");
    assert.equal(
      await p.evaluate(() =>
        JSON.stringify(localStorage).includes("OnlyForBrowserQA8"),
      ),
      false,
    );
    assert.equal(requests.length, requestCount);
    for (const provider of ["Google", "Apple"]) {
      await p.locator('[data-provider="' + provider + '"]').click();
      assert(
        (await p.locator("#auth-feedback").innerText()).includes(
          "No authentication",
        ),
      );
    }
    if (file === "login") {
      await p.locator("#forgot-password").click();
      await p.locator("#recovery-email").fill("qa@example.com");
      await p.locator("#recovery-form button").click();
      assert(
        (await p.locator("#recovery-feedback").innerText()).includes(
          "No email has been sent",
        ),
      );
      await p.keyboard.press("Escape");
    }
  }
  checks.push(
    "Separate auth pages: native validation, confirmation matching, password visibility, 320px options row, actual provider logos, accurate unconnected feedback, no credential transmission/storage",
  );
  assert.equal(
    await p.evaluate(() => localStorage.getItem("sola-state")),
    storage,
  );
  await p.goto(root + "/pages/dashboard.html");
  assert.equal(await p.locator(".public-nav,.site-footer").count(), 0);
  assert.equal(await p.evaluate(() => credits()), 6);
  checks.push(
    "Direct dashboard remains accessible with its own navigation and unchanged six-credit balance",
  );
  await p.goto(root + "/index.html");
  assert.equal(await p.locator(".motion-toggle,.practice-art").count(), 0);
  assert.deepEqual(
    await p
      .locator(".footer-group")
      .evaluateAll((es) => es.map((e) => e.querySelector("h3")?.textContent)),
    ["Explore", "Membership", "Connect"],
  );
  await p.emulateMedia({ reducedMotion: "reduce" });
  assert.equal(
    await p
      .locator(".hero-visual")
      .evaluate((e) => getComputedStyle(e).animationName),
    "none",
  );
  checks.push(
    "Removed motion/practice widgets, logical footer groups, and reduced-motion entrance behavior",
  );
  assert.deepEqual(errors, []);
  const output = process.env.SOLA_QA_OUTPUT || "/tmp/sola-redesign";
  fs.mkdirSync(output, { recursive: true });
  fs.writeFileSync(
    output + "/targeted-results.json",
    JSON.stringify({ checks, errors }, null, 2),
  );
  console.log(JSON.stringify({ checks, errors }, null, 2));
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
