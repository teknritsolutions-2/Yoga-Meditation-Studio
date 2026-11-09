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
  const output = process.env.SOLA_QA_OUTPUT || "/tmp/sola-components";
  fs.mkdirSync(output, { recursive: true });
  const root = process.env.SOLA_SCREEN_BASE || "http://127.0.0.1:4173";
  const errors = [];
  p.on("pageerror", (e) => errors.push(e.message));
  const scenes = [
    ["hero", "index.html", null],
    ["practice", "index.html", ".practice-layout"],
    ["guides", "index.html", ".guides-grid"],
    ["footer", "index.html", ".site-footer"],
    ["classes", "pages/classes.html", ".class-intro"],
    ["week", "pages/classes.html", ".weekly-explorer"],
    ["teachers", "pages/instructors.html", ".guide-feature"],
    ["comparison", "pages/memberships.html", ".comparison"],
    ["login", "pages/login.html", null],
    ["signup", "pages/signup.html", null],
    ["dashboard", "pages/dashboard.html", null],
  ];
  for (const width of [320, 390, 768, 1024, 1280, 1440]) {
    await p.setViewportSize({ width, height: 1000 });
    for (const [name, file, focus] of scenes) {
      await p.goto(root + "/" + file);
      await p.evaluate(async () => {
        await document.fonts.ready;
        for (const im of document.images) im.loading = "eager";
        await Promise.all(
          [...document.images].map((im) => im.decode().catch(() => {})),
        );
      });
      if (!focus)
        await p.evaluate(() =>
          window.scrollTo({ top: 0, behavior: "instant" }),
        );
      if (focus)
        await p.evaluate(
          (s) =>
            window.scrollTo({
              top: Math.max(
                0,
                document.querySelector(s).getBoundingClientRect().top +
                  scrollY -
                  105,
              ),
              behavior: "instant",
            }),
          focus,
        );
      await p.waitForTimeout(name === "hero" ? 750 : 120);
      for (const mode of ["light", "dark"]) {
        await p.evaluate((mode) => {
          document.documentElement.dataset.theme = mode;
          document.documentElement.dir = "ltr";
        }, mode);
        await p.screenshot({ path: `${output}/${name}-${width}-${mode}.png` });
      }
      if ([390, 1024].includes(width)) {
        await p.evaluate(() => (document.documentElement.dir = "rtl"));
        await p.screenshot({ path: `${output}/${name}-${width}-rtl.png` });
      }
    }
  }
  console.log({ errors });
  await b.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
