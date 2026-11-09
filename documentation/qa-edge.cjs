const { chromium } = require(process.env.SOLA_PLAYWRIGHT || "playwright");
const assert = require("node:assert/strict");
const fs = require("fs");
const OUT = process.env.SOLA_QA_OUTPUT || "/tmp/sola-studio-qa";
fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch({
    executablePath:
      process.env.SOLA_BROWSER ||
      "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
    headless: true,
  });
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  const checks = [],
    errors = [];
  p.on("pageerror", (e) => errors.push(e.message));
  await p.goto("http://127.0.0.1:4173/pages/dashboard.html");
  assert.equal(await p.evaluate(() => credits()), 6);
  assert.equal(
    await p.evaluate(() => {
      const s = getState();
      s.expires = new Date(Date.now() - 86400000).toISOString();
      saveState(s);
      return addBooking(SESSIONS[1].id).ok;
    }),
    false,
  );
  checks.push("Expired membership blocks booking");
  await p.evaluate(() => {
    const s = initialState();
    s.plan = "single";
    s.history = [];
    saveState(s);
  });
  assert.equal(await p.evaluate(() => credits()), 0);
  assert.equal(await p.evaluate(() => addBooking(SESSIONS[1].id).ok), false);
  checks.push("Exhausted single-session credit blocks booking");
  await p.evaluate(() => {
    saveState(initialState());
    getState();
  });
  await p.clock.install({ time: new Date(Date.now() + 15 * 86400000) });
  await p.reload();
  assert.equal(
    await p.evaluate(() => getState().bookings[0].status),
    "elapsed",
  );
  assert.equal(await p.evaluate(() => credits()), 6);
  await p.goto("http://127.0.0.1:4173/pages/dashboard.html#sessions");
  assert(
    (await p.locator(".history-items").textContent()).includes("Hatha Yoga"),
  );
  checks.push(
    "15-day rollover preserves booking history and credit accounting",
  );
  await p.clock.setSystemTime(new Date());
  await p.route("**/studio/**", async (route) => {
    const response = await route.fetch({
      url: route.request().url().replace("/studio/", "/"),
      maxRetries: 2,
    });
    await route.fulfill({ response });
  });
  for (const file of [
    "index.html",
    "pages/home2.html",
    "pages/classes.html",
    "pages/instructors.html",
    "pages/memberships.html",
    "pages/contact.html",
    "pages/login.html",
    "pages/dashboard.html",
  ]) {
    await p.goto("http://127.0.0.1:4173/studio/" + file);
    await p.evaluate(() => document.fonts.ready);
    assert.equal(await p.locator("h1").count(), 1);
    const broken = await p.evaluate(async () => {
      for (const im of document.images) im.loading = "eager";
      await Promise.all(
        [...document.images].map((im) => im.decode().catch(() => {})),
      );
      return [...document.images]
        .filter((im) => !im.naturalWidth)
        .map((im) => im.src);
    });
    assert.deepEqual(broken, []);
  }
  checks.push(
    "All eight pages work under a GitHub Pages-style /studio/ subpath",
  );
  await p.unroute("**/studio/**");
  await p.goto("http://127.0.0.1:4173/index.html");
  await p.locator(".home-menu summary").click();
  assert.equal(await p.locator(".home-menu").getAttribute("open"), "");
  await p.keyboard.press("Escape");
  assert.equal(await p.locator(".home-menu").getAttribute("open"), null);
  await p.locator("#tab-vinyasa").click();
  assert(
    (await p.locator("#practice-panel").textContent()).includes("Breathe in."),
  );
  await p.locator("#tab-vinyasa").focus();
  await p.keyboard.press("ArrowRight");
  assert.equal(
    await p.locator("#tab-yin").getAttribute("aria-selected"),
    "true",
  );
  checks.push("Home dropdown and keyboard-operated practice tabs");
  await p.locator(".motion-toggle").click();
  assert.equal(
    await p
      .locator(".solar-orbit")
      .evaluate((e) => getComputedStyle(e).animationPlayState),
    "paused",
  );
  await p.evaluate(() => window.scrollTo(0, 1000));
  await p.waitForTimeout(100);
  assert(
    await p.locator("#back-top").evaluate((e) => e.classList.contains("show")),
  );
  await p.locator("#back-top").click();
  await p.waitForFunction(() => scrollY < 10);
  assert.equal(
    await p
      .locator(".site-header")
      .evaluate((e) => Math.round(e.getBoundingClientRect().top)),
    0,
  );
  checks.push("Animation pause, floating back-to-top, and sticky header");
  fs.writeFileSync(
    OUT + "/edge-results.json",
    JSON.stringify({ checks, errors }, null, 2),
  );
  console.log(JSON.stringify({ checks, errors }, null, 2));
  await b.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
