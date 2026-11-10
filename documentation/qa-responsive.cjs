const { chromium, webkit } = require(
  process.env.SOLA_PLAYWRIGHT || "playwright",
);
const fs = require("node:fs");
(async () => {
  const engine = process.env.SOLA_AUDIT_ENGINE || "chromium";
  const browser = await (engine === "webkit" ? webkit : chromium).launch(
    engine === "webkit"
      ? { headless: true }
      : {
          executablePath:
            process.env.SOLA_BROWSER ||
            "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
          headless: true,
        },
  );
  const page = await browser.newPage();
  const root = process.env.SOLA_SCREEN_BASE || "http://127.0.0.1:4173";
  const output =
    process.env.SOLA_QA_OUTPUT || "/tmp/sola-responsive-audit/after";
  const widths = (
    process.env.SOLA_AUDIT_WIDTHS ||
    "320,360,390,425,430,599,600,680,681,699,700,701,768,820,959,960,961,1024,1180,1190,1191,1280,1440"
  )
    .split(",")
    .map(Number);
  const routes = [
    ["home", "index.html"],
    ["home2", "pages/home2.html"],
    ["classes", "pages/classes.html"],
    ["instructors", "pages/instructors.html"],
    ["memberships", "pages/memberships.html"],
    ["contact", "pages/contact.html"],
    ["login", "pages/login.html"],
    ["signup", "pages/signup.html"],
    ...[
      "overview",
      "book",
      "sessions",
      "usage",
      "membership",
      "notifications",
      "profile",
    ].map((section) => ["dash-" + section, "pages/dashboard.html#" + section]),
  ];
  const checks = [],
    errors = [],
    requests = [];
  fs.mkdirSync(output, { recursive: true });
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => {
    if (response.status() >= 400)
      requests.push({ status: response.status(), url: response.url() });
  });
  for (const [name, file] of routes) {
    for (const width of widths) {
      await page.setViewportSize({
        width,
        height:
          width === 768
            ? 1024
            : width === 820
              ? 1180
              : width === 1024
                ? 768
                : 1000,
      });
      await page.goto(root + "/" + file);
      await page.evaluate(async () => {
        await document.fonts.ready;
        for (const image of document.images) image.loading = "eager";
        await Promise.all(
          [...document.images].map((image) => image.decode().catch(() => {})),
        );
      });
      for (const theme of ["light", "dark"])
        for (const direction of ["ltr", "rtl"]) {
          await page.evaluate(
            ({ theme, direction }) => {
              document.documentElement.dataset.theme = theme;
              document.documentElement.dir = direction;
              if (typeof applyTheme === "function") applyTheme();
              document
                .querySelectorAll(".direction-toggle")
                .forEach(
                  (button) =>
                    (button.textContent = direction === "rtl" ? "LTR" : "RTL"),
                );
            },
            { theme, direction },
          );
          const metrics = await page.evaluate(() => {
            const visible = (element) => {
              const rect = element.getBoundingClientRect(),
                style = getComputedStyle(element);
              return (
                rect.width > 0 &&
                rect.height > 0 &&
                style.visibility !== "hidden" &&
                style.display !== "none"
              );
            };
            const intentional = (element) =>
              element.closest(
                ".days,.practice-tabs,.ledger-scroll,.dashboard-sidebar,.public-nav",
              );
            const clipped = [
              ...document.querySelectorAll(
                "main p,main h1,main h2,main h3,main h4,main a.btn,main button.btn",
              ),
            ]
              .filter(
                (element) =>
                  visible(element) &&
                  !intentional(element) &&
                  element.scrollWidth > element.clientWidth + 2,
              )
              .map((element) => ({
                selector: element.className,
                text: element.textContent.slice(0, 80),
                scroll: element.scrollWidth,
                width: element.clientWidth,
              }))
              .slice(0, 12);
            const controls = [
              ...document.querySelectorAll(
                "main input:not([type=checkbox]):not([type=range]),main select,main textarea",
              ),
            ]
              .filter(visible)
              .map((element) => ({
                id: element.id,
                font: parseFloat(getComputedStyle(element).fontSize),
                width: element.getBoundingClientRect().width,
                height: element.getBoundingClientRect().height,
              }));
            const images = [...document.querySelectorAll("main img")]
              .filter(visible)
              .map((image) => {
                const r = image.getBoundingClientRect(),
                  c = getComputedStyle(image);
                return {
                  src: image.getAttribute("src"),
                  cls: image.className,
                  width: r.width,
                  height: r.height,
                  nativeWidth: image.naturalWidth,
                  nativeHeight: image.naturalHeight,
                  fit: c.objectFit,
                  transform: c.transform,
                };
              });
            const tiny = [
              ...document.querySelectorAll(
                "main p,main button,main a,main label,main td",
              ),
            ]
              .filter(
                (element) =>
                  visible(element) &&
                  !intentional(element) &&
                  parseFloat(getComputedStyle(element).fontSize) < 13,
              )
              .map((element) => ({
                cls: element.className,
                text: element.textContent.slice(0, 50),
                font: getComputedStyle(element).fontSize,
              }))
              .slice(0, 8);
            const box = (selector) => {
              const element = document.querySelector(selector);
              if (!element) return null;
              const r = element.getBoundingClientRect();
              return { left: r.left, right: r.right };
            };
            const nav = box(".nav-wrap"),
              content = box("main .wrap"),
              footer = box(".site-footer > .wrap");
            const aligned =
              !nav ||
              [content, footer].every(
                (r) =>
                  r &&
                  Math.abs(r.left - nav.left) < 1 &&
                  Math.abs(r.right - nav.right) < 1,
              );
            return {
              overflow: document.documentElement.scrollWidth > innerWidth + 1,
              height: document.documentElement.scrollHeight,
              broken: [...document.images]
                .filter((image) => !image.naturalWidth)
                .map((image) => image.src),
              clipped,
              controls,
              images,
              tiny,
              aligned,
            };
          });
          const failures = [];
          if (metrics.overflow) failures.push("Document overflow");
          if (metrics.broken.length) failures.push("Broken images");
          if (metrics.clipped.length) failures.push("Clipped text");
          if (metrics.tiny.length) failures.push("Useful text below 13px");
          if (!metrics.aligned) failures.push("Container misalignment");
          if (metrics.controls.some((c) => c.font < 16 || c.height < 44))
            failures.push("Small form controls");
          const nativeImages = metrics.images.filter(
            (i) =>
              (width <= 1190 &&
                [
                  "movement.jpg",
                  "quiet-practice.jpg",
                  "guide-leela.jpg",
                  "sunset.jpg",
                ].some((src) => i.src.endsWith(src))) ||
              (width <= 960 && i.cls === "home-hero-photo"),
          );
          if (
            nativeImages.some(
              (i) =>
                Math.abs(i.width / i.height - i.nativeWidth / i.nativeHeight) >
                0.015,
            )
          )
            failures.push("Yoga photo ratio changed");
          checks.push({
            name,
            file,
            width,
            theme,
            direction,
            ...metrics,
            failures,
          });
          const capture =
            ([320, 390, 768, 820, 1024, 1440].includes(width) &&
              theme === "light" &&
              direction === "ltr") ||
            ([390, 820].includes(width) &&
              theme === "dark" &&
              direction === "rtl");
          if (capture) {
            await page.evaluate(async () => {
              for (
                let y = 0;
                y < document.documentElement.scrollHeight;
                y += innerHeight * 0.8
              ) {
                scrollTo({ top: y, behavior: "instant" });
                await new Promise((resolve) => setTimeout(resolve, 15));
              }
              scrollTo({ top: 0, behavior: "instant" });
            });
            await page.waitForTimeout(120);
            await page.screenshot({
              path: `${output}/${name}-${width}-${theme === "light" ? "light" : "rtl"}.png`,
              fullPage: true,
            });
          }
        }
    }
    console.log("Audited", engine, name);
  }
  const failures = checks.filter((check) => check.failures.length);
  fs.writeFileSync(
    output + "/results.json",
    JSON.stringify(
      { engine, widths, checks, errors, requests, failures },
      null,
      2,
    ),
  );
  console.log(
    JSON.stringify(
      {
        engine,
        checks: checks.length,
        errors,
        requests,
        failures: failures.map(
          ({ name, width, theme, direction, failures, clipped }) => ({
            name,
            width,
            theme,
            direction,
            failures,
            clipped,
          }),
        ),
      },
      null,
      2,
    ),
  );
  await browser.close();
  if (errors.length || requests.length || failures.length) process.exitCode = 1;
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
