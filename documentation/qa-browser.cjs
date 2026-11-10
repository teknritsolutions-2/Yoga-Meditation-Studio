const { chromium } = require(process.env.SOLA_PLAYWRIGHT || "playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const OUT = process.env.SOLA_QA_OUTPUT || "/tmp/sola-studio-qa";
fs.mkdirSync(OUT, { recursive: true });
const ROOT = "http://127.0.0.1:4173";
(async () => {
  const b = await chromium.launch({
    executablePath:
      process.env.SOLA_BROWSER ||
      "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
    headless: true,
  });
  const context = await b.newContext();
  const p = await context.newPage();
  const errors = [],
    failures = [],
    checks = [];
  p.on("pageerror", (e) => errors.push(e.message));
  p.on("response", (r) => {
    if (r.status() >= 400) failures.push(r.status() + " " + r.url());
  });
  const pages = [
    "index.html",
    "pages/home2.html",
    "pages/classes.html",
    "pages/instructors.html",
    "pages/memberships.html",
    "pages/contact.html",
    "pages/login.html",
    "pages/signup.html",
    "pages/dashboard.html",
  ];
  for (const file of pages) {
    for (const width of [320, 390, 768, 1024, 1280, 1440]) {
      await p.setViewportSize({ width, height: 900 });
      await p.goto(ROOT + "/" + file);
      await p.evaluate(() => document.fonts.ready);
      const overflow = await p.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        width: innerWidth,
        bad: [...document.querySelectorAll("body *")]
          .filter((e) => {
            let r = e.getBoundingClientRect();
            return (
              r.width &&
              r.right > innerWidth + 2 &&
              getComputedStyle(e).position !== "fixed" &&
              getComputedStyle(e).position !== "absolute" &&
              !e.closest(".timetable") &&
              !e.closest(".practice-tabs") &&
              !e.closest(".days") &&
              !e.closest(".ledger-scroll")
            );
          })
          .slice(0, 6)
          .map((e) => e.tagName + "." + e.className),
      }));
      if (overflow.scroll > width + 1) failures.push({ file, width, overflow });
      const broken = await p.evaluate(async () => {
        const images = [...document.images];
        for (const im of images) im.loading = "eager";
        await Promise.all(images.map((im) => im.decode().catch(() => {})));
        return images.filter((im) => !im.naturalWidth).map((im) => im.src);
      });
      if (broken.length) failures.push({ file, width, broken });
      checks.push(file + " @ " + width);
    }
    for (const width of [390, 1280]) {
      await p.setViewportSize({ width, height: 900 });
      await p.evaluate(() => {
        document.documentElement.dataset.theme = "dark";
        document.documentElement.dir = "rtl";
      });
      const overflow = await p.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      );
      if (overflow) failures.push({ file, width, mode: "dark-rtl", overflow });
      checks.push(file + " dark RTL @ " + width);
    }
    await p.evaluate(() => {
      document.documentElement.dataset.theme = "light";
      document.documentElement.dir = "ltr";
    });
  }
  console.log(
    "Responsive scans complete:",
    checks.length,
    JSON.stringify(failures),
  );
  fs.writeFileSync(
    OUT + "/responsive.json",
    JSON.stringify({ checks, errors, failures }, null, 2),
  );
  await p.goto(ROOT + "/pages/dashboard.html");
  assert.equal(await p.evaluate(() => credits()), 6);
  checks.push("Initial ten-pack balance 6");
  await p.goto(ROOT + "/pages/dashboard.html#book");
  const bookButton = p.locator("[data-book]:not([disabled])").first();
  const classId = await bookButton.getAttribute("data-book");
  await bookButton.click();
  assert.equal(await p.evaluate(() => credits()), 5);
  assert.equal(
    await p.evaluate(
      (id) => activeBookings().filter((b) => b.session === id).length,
      classId,
    ),
    1,
  );
  checks.push("Book: credits 6→5");
  const dup = await p.evaluate((id) => addBooking(id), classId);
  assert.equal(dup.ok, false);
  assert.equal(await p.evaluate(() => credits()), 5);
  checks.push("Duplicate prevented, balance unchanged");
  await p.goto(ROOT + "/pages/dashboard.html#sessions");
  assert.equal(await p.locator("[data-cancel]").count(), 2);
  const bookingId = await p.evaluate(
    (id) => activeBookings().find((b) => b.session === id).id,
    classId,
  );
  await p.locator('[data-cancel="' + bookingId + '"]').click();
  assert.equal(await p.evaluate(() => credits()), 6);
  assert.equal(await p.locator("[data-cancel]").count(), 1);
  const again = await p.evaluate((id) => cancelBooking(id), bookingId);
  assert.equal(again.ok, false);
  assert.equal(await p.evaluate(() => credits()), 6);
  checks.push("Cancel restores one credit, repeated cancellation prevented");
  await p.reload();
  assert.equal(await p.evaluate(() => credits()), 6);
  checks.push("State persists across refresh");
  await p.goto(ROOT + "/pages/dashboard.html#membership");
  const before = await p.evaluate(() => ({
    plan: getState().plan,
    expires: getState().expires,
    balance: credits(),
  }));
  await p.locator("#renewal-plan").selectOption("unlimited");
  await p.locator("#renewal-form button").click();
  await p.locator("#confirm-renewal").click();
  assert.equal(await p.evaluate(() => getState().renewal.plan), "unlimited");
  assert.deepEqual(
    await p.evaluate(() => ({
      plan: getState().plan,
      expires: getState().expires,
      balance: credits(),
    })),
    before,
  );
  checks.push("Renewal preview saves request without applying plan/payment");
  await p.goto(ROOT + "/pages/dashboard.html#profile");
  await p.locator("#profile-name").fill("Sam");
  await p.locator("#profile-form button").click();
  assert.equal(await p.evaluate(() => getState().profile.name), "Sam");
  await p.locator("#sample-model").selectOption("unlimited");
  await p.locator("#load-sample").click();
  await p.locator("#confirm-reset").click();
  assert.equal(await p.evaluate(() => credits()), null);
  await p.goto(ROOT + "/pages/dashboard.html#book");
  await p.locator("[data-book]:not([disabled])").first().click();
  assert.equal(await p.evaluate(() => credits()), null);
  checks.push("Unlimited bookings do not fabricate a credit count");
  await p.goto(ROOT + "/pages/dashboard.html#profile");
  await p.locator("#reset-demo").click();
  await p.locator("#confirm-reset").click();
  assert.equal(await p.evaluate(() => credits()), 6);
  assert.equal(await p.evaluate(() => getState().profile.name), "Alex");
  assert.equal(await p.evaluate(() => getState().renewal), null);
  assert(
    await p.evaluate(() => {
      const s = getState();
      return (
        s.history.every((h) => new Date(h.date) >= new Date(s.started)) &&
        Math.round((new Date(s.expires) - new Date(s.started)) / 86400000) ===
          60
      );
    }),
  );
  checks.push(
    "Reset restores consistent sample state and validity/history dates",
  );
  await p.goto(ROOT + "/pages/classes.html");
  await p.locator("#class-style").selectOption("Meditation");
  assert((await p.locator("#class-list .session-row").count()) > 0);
  assert.equal(
    await p.locator("#class-list .session-info .eyebrow").first().textContent(),
    "Meditation · 30 MIN",
  );
  await p.locator("#class-level").selectOption("Advanced");
  assert.equal(await p.locator("#class-list .session-row").count(), 0);
  await p.locator("button[type=reset]").click();
  await p.waitForTimeout(50);
  assert((await p.locator("#class-list .session-row").count()) > 0);
  checks.push("Style/level filters and reset");
  await p.goto(ROOT + "/pages/home2.html");
  await p.locator("#goal").selectOption("Slow Down");
  await p.locator("#length").selectOption("30");
  await p.locator("#finder-form button").click();
  assert((await p.locator("#finder-results .session-row").count()) > 0);
  checks.push("Practice finder matches goal and duration");
  await p.goto(ROOT + "/pages/memberships.html");
  await p.locator("#classes-week").fill("3");
  assert(
    (await p.locator("#comparison-summary").textContent()).includes(
      "About 13 classes",
    ),
  );
  checks.push("Plan comparison derives visits from sample data");
  await p.goto(ROOT + "/pages/contact.html");
  await p.locator("#contact-name").fill("Demo Visitor");
  await p.locator("#contact-email").fill("demo@example.com");
  await p
    .locator("#contact-message")
    .fill("I would like to ask about a beginner class.");
  await p.locator("input[type=checkbox]").check();
  await p.locator("#contact-form button").click();
  assert(await p.locator("#modal").isVisible());
  assert((await p.locator("#modal-body").textContent()).includes("Not sent"));
  checks.push("Enquiry preview validates and does not claim sending");
  await p.keyboard.press("Escape");
  await p.goto(ROOT + "/pages/dashboard.html");
  await p.evaluate(() => {
    sessionStorage.clear();
    localStorage.removeItem("sola-remember-demo");
  });
  await p.goto(ROOT + "/pages/classes.html");
  const selected = await p
    .locator("[data-book]")
    .first()
    .getAttribute("data-book");
  await p.locator("[data-book]").first().click();
  await p.waitForFunction(() => location.pathname.endsWith("/dashboard.html"));
  await p.locator("#modal").waitFor({ state: "visible" });
  assert(await p.locator("#modal").isVisible());
  assert((await p.locator("#modal-body").textContent()).includes("Hatha Yoga"));
  checks.push(
    "Guest booking opens directly accessible dashboard with selected session",
  );
  await p.keyboard.press("Escape");
  await p.setViewportSize({ width: 390, height: 844 });
  await p.locator(".dashboard-menu").click();
  assert(
    await p
      .locator(".dashboard-shell")
      .evaluate((e) => e.classList.contains("drawer-open")),
  );
  await p.keyboard.press("Escape");
  assert.equal(
    await p.locator(".dashboard-menu").getAttribute("aria-expanded"),
    "false",
  );
  checks.push("Dashboard drawer opens/closes with Escape");
  await p.goto(ROOT + "/index.html");
  await p.locator(".mobile-menu").click();
  assert(await p.locator(".public-nav").isVisible());
  await p.keyboard.press("Escape");
  assert.equal(
    await p.locator(".mobile-menu").getAttribute("aria-expanded"),
    "false",
  );
  await p.locator(".mobile-menu").click();
  await p.locator(".theme-toggle").click();
  await p.locator(".direction-toggle").click();
  await p.reload();
  assert.equal(
    await p.evaluate(() => document.documentElement.dataset.theme),
    "dark",
  );
  assert.equal(await p.evaluate(() => document.documentElement.dir), "rtl");
  checks.push("Mobile navigation and persistent theme/RTL");
  await p.emulateMedia({ reducedMotion: "reduce" });
  await p.reload();
  assert.equal(
    await p
      .locator(".hero-waves")
      .evaluate((e) => getComputedStyle(e).animationName),
    "none",
  );
  checks.push("Reduced motion stops decorative animation");
  fs.writeFileSync(
    OUT + "/results.json",
    JSON.stringify({ checks, errors, failures }, null, 2),
  );
  console.log(
    JSON.stringify({ checks: checks.length, errors, failures }, null, 2),
  );
  await b.close();
  if (errors.length || failures.length) process.exitCode = 1;
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
