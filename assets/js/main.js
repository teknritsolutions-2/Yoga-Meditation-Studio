"use strict";
function utilities() {
  return `<button class="icon-btn theme-toggle" aria-label="Switch color theme">${icon(document.documentElement.dataset.theme === "dark" ? "sun" : "moon", 18)}</button><button class="icon-btn direction-toggle" aria-label="Switch reading direction" title="Switch between LTR and RTL">${document.documentElement.dir === "rtl" ? "LTR" : "RTL"}</button>`;
}
function mountPublic() {
  const current = document.body.dataset.page;
  if (!$("#site-header")) return;
  const nav = [
    ["classes", "Classes"],
    ["instructors", "Instructors"],
    ["memberships", "Membership plans"],
    ["dashboard", "Dashboard"],
    ["contact", "Contact"],
  ];
  $("#site-header").innerHTML =
    `<div class="nav-wrap">${brand()}<nav class="public-nav" aria-label="Main navigation" id="public-nav"><details class="home-menu"><summary ${["home", "home2"].includes(current) ? 'data-current="true"' : ""}>Home ${icon("chevron", 13)}</summary><div class="dropdown"><a href="${pageURL("home")}" ${current === "home" ? 'aria-current="page"' : ""}>Home 1 · The studio</a><a href="${pageURL("home2")}" ${current === "home2" ? 'aria-current="page"' : ""}>Home 2 · Your practice</a></div></details>${nav.map(([p, l]) => `<a href="${pageURL(p)}" ${current === p ? 'aria-current="page"' : ""}>${l}</a>`).join("")}<div class="nav-panel-tools"></div></nav><div class="nav-tools"><div class="display-controls">${utilities()}</div><a class="btn small nav-login" href="${pageURL("login")}">Login ${icon("arrow", 15)}</a><button class="icon-btn mobile-menu" aria-label="Open navigation" aria-expanded="false" aria-controls="public-nav">${icon("menu")}</button></div></div><button class="nav-backdrop" aria-label="Close navigation" tabindex="-1"></button>`;
  const footerGroups = [
    [
      "Explore",
      [
        ["home", "Home 1"],
        ["home2", "Home 2"],
        ["classes", "Classes"],
        ["instructors", "Instructors"],
      ],
    ],
    [
      "Membership",
      [
        ["memberships", "Plans"],
        ["login", "Login"],
        ["dashboard", "Dashboard"],
      ],
    ],
    ["Connect", [["contact", "Contact"]]],
  ];
  $("#site-footer").innerHTML =
    `<div class="wrap"><div class="footer-top"><div class="footer-brand">${brand()}<p>Move freely. Find your center.<br>A little space for a lot more you.</p></div>${footerGroups.map(([title, links]) => `<nav class="footer-group" aria-label="${title}"><h3>${title}</h3><div class="footer-links">${links.map(([p, label]) => `<a href="${pageURL(p)}">${label}</a>`).join("")}</div></nav>`).join("")}</div><div class="footer-bottom"><span>© ${new Date().getFullYear()} Sola Studio.</span><button class="text-button" id="asset-credits">Artwork & photography credits ↗</button></div></div>`;
  const mobile = $(".mobile-menu"),
    header = $("#site-header"),
    navPanel = $(".public-nav");
  let previousOverflow = "";
  function setPublicMenu(open, restoreFocus = true) {
    if (open === (mobile.getAttribute("aria-expanded") === "true")) return;
    mobile.setAttribute("aria-expanded", String(open));
    mobile.setAttribute(
      "aria-label",
      open ? "Close navigation" : "Open navigation",
    );
    mobile.innerHTML = icon(open ? "close" : "menu");
    navPanel.classList.toggle("open", open);
    header.toggleAttribute("data-menu-open", open);
    for (const el of [$("main"), $("#site-footer"), $("#back-top")])
      if (el) el.inert = open;
    if (open) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      $(".home-menu summary").focus({ preventScroll: true });
    } else {
      document.body.style.overflow = previousOverflow;
      $$(".home-menu[open]").forEach((d) => (d.open = false));
      if (restoreFocus) mobile.focus({ preventScroll: true });
    }
  }
  mobile.addEventListener("click", () =>
    setPublicMenu(mobile.getAttribute("aria-expanded") !== "true"),
  );
  $(".nav-backdrop").addEventListener("click", () => setPublicMenu(false));
  navPanel.addEventListener("click", (e) => {
    if (e.target.closest("a")) setPublicMenu(false, false);
  });
  matchMedia("(max-width:1190px)").addEventListener("change", (e) => {
    if (!e.matches) setPublicMenu(false, false);
  });
  header.addEventListener("keydown", (e) => {
    if (e.key !== "Tab" || mobile.getAttribute("aria-expanded") !== "true")
      return;
    const focusable = $$("a,button,summary", header).filter(
      (el) => el.tabIndex >= 0 && el.getClientRects().length,
    );
    const first = focusable[0],
      last = focusable.at(-1);
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus({ preventScroll: true });
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus({ preventScroll: true });
    }
  });
  const compactNavigation = matchMedia("(max-width:1190px)");
  function arrangePublicTools() {
    const target = compactNavigation.matches
      ? $(".nav-panel-tools")
      : $(".nav-tools");
    target.prepend($(".display-controls"), $(".nav-login"));
  }
  arrangePublicTools();
  compactNavigation.addEventListener("change", arrangePublicTools);
  $("#asset-credits").addEventListener("click", () =>
    dialog(
      `<span class="eyebrow">A little credit where it’s due</span><h2>Art, with intention.</h2><p>Spiral, organic ripple and reflective-ring geometry sourced from the actual fffuel generators and recoloured for Sola.</p><p><a class="text-link" href="https://www.fffuel.co/" target="_blank" rel="noopener">fffuel artwork</a> · <a href="https://www.fffuel.co/license/" target="_blank" rel="noopener">Commercial-use licence</a></p><p>Photography from <a class="text-link" href="https://unsplash.com/license" target="_blank" rel="noopener">Unsplash</a> and <a class="text-link" href="https://www.pexels.com/license/" target="_blank" rel="noopener">Pexels</a>. Photography depicts independent yoga practitioners. Profile names are editorial concepts, not verified Sola staff biographies.</p><p>Fraunces by Undercase Type and Manrope by Mikhail Sharanda, SIL Open Font License. </p>`,
    ),
  );
}
function applyTheme() {
  const dark = document.documentElement.dataset.theme === "dark";
  $$(".theme-toggle").forEach((b) => {
    b.innerHTML = icon(dark ? "sun" : "moon", 18);
    b.setAttribute(
      "aria-label",
      dark ? "Switch to light theme" : "Switch to dark theme",
    );
  });
}
function toggleTheme() {
  document.documentElement.dataset.theme =
    document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  writeStore("theme", document.documentElement.dataset.theme);
  applyTheme();
}
function toggleDirection() {
  document.documentElement.dir =
    document.documentElement.dir === "rtl" ? "ltr" : "rtl";
  writeStore("direction", document.documentElement.dir);
  $$(".direction-toggle").forEach(
    (b) =>
      (b.textContent = document.documentElement.dir === "rtl" ? "LTR" : "RTL"),
  );
}
mountPublic();
applyTheme();
document.addEventListener("click", (e) => {
  if (e.target.closest(".theme-toggle")) toggleTheme();
  if (e.target.closest(".direction-toggle")) toggleDirection();
  if (e.target.closest(".modal-close")) $("#modal").close();
});
$("#modal").addEventListener("click", (e) => {
  if (e.target === $("#modal")) {
    const r = e.target.getBoundingClientRect();
    if (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    )
      e.target.close();
  }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const menu = $(".public-nav.open");
    if (menu) $(".mobile-menu").click();
    $$(".home-menu[open]").forEach((d) => (d.open = false));
  }
});
document.addEventListener("click", (e) => {
  $$(".home-menu[open]").forEach((d) => {
    if (!d.contains(e.target)) d.open = false;
  });
});
const topButton = $("#back-top");
if (topButton)
  window.addEventListener(
    "scroll",
    () => topButton.classList.toggle("show", window.scrollY > 450),
    { passive: true },
  );
topButton?.addEventListener("click", () =>
  window.scrollTo({
    top: 0,
    behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "instant"
      : "smooth",
  }),
);
