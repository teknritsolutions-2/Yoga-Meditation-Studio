const { chromium } = require(process.env.SOLA_PLAYWRIGHT || "playwright");
const fs = require("fs");
(async () => {
  const b = await chromium.launch({
    executablePath:
      process.env.SOLA_BROWSER ||
      "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
    headless: true,
  });
  const p = await b.newPage();
  const root = process.env.SOLA_SCREEN_BASE || "http://127.0.0.1:4173";
  const output = process.env.SOLA_QA_OUTPUT || "/tmp/sola-studio-refinement";
  const out = output + "/matrix";
  fs.mkdirSync(out, { recursive: true });
  const errors = [],
    checks = [];
  p.on("pageerror", (e) => errors.push(e.message));
  const pages = [
    ["home", "index.html", null],
    ["home2", "pages/home2.html", "#practice-finder"],
    ["classes", "pages/classes.html", "#class-filters"],
    ["instructors", "pages/instructors.html", ".guide-feature"],
    ["memberships", "pages/memberships.html", ".membership-all"],
    ["contact", "pages/contact.html", "#contact-form"],
    ["login", "pages/login.html", null],
    ["signup", "pages/signup.html", null],
    ["dashboard", "pages/dashboard.html", null],
  ];
  for (const [name, file, focus] of pages) {
    for (const width of [320, 390, 768, 1024, 1280, 1440]) {
      await p.setViewportSize({ width, height: 1000 });
      await p.goto(root + "/" + file);
      await p.evaluate(async () => {
        await document.fonts.ready;
        for (const im of document.images) im.loading = "eager";
        await Promise.all(
          [...document.images].map((im) => im.decode().catch(() => {})),
        );
      });
      for (const mode of ["light", "dark"]) {
        await p.evaluate((mode) => {
          document.documentElement.dataset.theme = mode;
          document.documentElement.dir = "ltr";
        }, mode);
        await p.evaluate(() => scrollTo(0, 0));
        if (focus)
          await p.evaluate(
            (s) =>
              window.scrollTo({
                top: Math.max(
                  0,
                  document.querySelector(s).getBoundingClientRect().top +
                    scrollY -
                    115,
                ),
                behavior: "instant",
              }),
            focus,
          );
        await p.waitForTimeout(750);
        const metrics = await p.evaluate(() => ({
          overflow: document.documentElement.scrollWidth > innerWidth + 1,
          broken: [...document.images]
            .filter((im) => !im.naturalWidth)
            .map((im) => im.src),
          small: [...document.querySelectorAll("p,button,a,label,th,td,small")]
            .filter((e) => {
              const c = getComputedStyle(e),
                r = e.getBoundingClientRect();
              return (
                r.width &&
                r.height &&
                c.visibility !== "hidden" &&
                parseFloat(c.fontSize) < 13 &&
                !e.closest(".brand") &&
                !e.matches(".eyebrow,.sidebar-label,.motion-toggle")
              );
            })
            .map((e) => ({
              selector: e.className,
              text: e.textContent.slice(0, 60),
              size: getComputedStyle(e).fontSize,
            }))
            .slice(0, 12),
        }));
        checks.push({ name, width, mode, ...metrics });
        await p.screenshot({ path: `${out}/${name}-${width}-${mode}.png` });
      }
    }
  }
  for (const [name, file, focus] of pages) {
    for (const width of [390, 1024]) {
      await p.setViewportSize({ width, height: 1000 });
      await p.goto(root + "/" + file);
      await p.evaluate(() => {
        document.documentElement.dataset.theme = "dark";
        document.documentElement.dir = "rtl";
      });
      if (focus)
        await p.evaluate(
          (s) =>
            window.scrollTo({
              top: Math.max(
                0,
                document.querySelector(s).getBoundingClientRect().top +
                  scrollY -
                  115,
              ),
              behavior: "instant",
            }),
          focus,
        );
      await p.waitForTimeout(100);
      checks.push({
        name,
        width,
        mode: "dark-rtl",
        overflow: await p.evaluate(
          () => document.documentElement.scrollWidth > innerWidth + 1,
        ),
      });
      await p.screenshot({ path: `${out}/${name}-${width}-rtl.png` });
    }
  }
  const failures = checks.filter(
    (c) => c.overflow || c.broken?.length || c.small?.length,
  );
  fs.writeFileSync(
    output + "/visual-matrix.json",
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
