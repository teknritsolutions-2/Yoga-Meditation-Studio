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
    ["contact", "Contact"],
  ];
  $("#site-header").innerHTML =
    `<div class="nav-wrap">${brand()}<nav class="public-nav" aria-label="Main navigation" id="public-nav"><details class="home-menu"><summary ${["home", "home2"].includes(current) ? 'data-current="true"' : ""}>Home ${icon("chevron", 13)}</summary><div class="dropdown"><a href="${pageURL("home")}" ${current === "home" ? 'aria-current="page"' : ""}>Home 1 · The studio</a><a href="${pageURL("home2")}" ${current === "home2" ? 'aria-current="page"' : ""}>Home 2 · Your practice</a></div></details>${nav.map(([p, l]) => `<a href="${pageURL(p)}" ${current === p ? 'aria-current="page"' : ""}>${l}</a>`).join("")}<a class="mobile-login" href="${pageURL("login")}">Member login</a></nav><div class="nav-tools">${utilities()}<a class="btn small nav-login" href="${pageURL(isDemo() ? "dashboard" : "login")}">${isDemo() ? "My dashboard" : "Member login"} ${icon("arrow", 15)}</a><button class="icon-btn mobile-menu" aria-label="Open navigation" aria-expanded="false" aria-controls="public-nav">${icon("menu")}</button></div></div>`;
  $("#site-footer").innerHTML =
    `<div class="wrap"><div class="footer-top"><div class="footer-brand">${brand()}<p>Move freely. Find your center.<br>A little space for a lot more you.</p></div><div><h3>Find your way</h3><div class="footer-links">${[["home", "Home 1"], ["home2", "Home 2"], ...nav, ["login", "Member login"], ["dashboard", "Explore member demo"]].map(([p, l]) => `<a href="${pageURL(p)}">${l}</a>`).join("")}</div></div><div class="footer-message"><h3>A space to begin</h3><p>Every body welcome.<br>Every beginning, celebrated.</p><p style="margin-top:15px">New to the mat?<br>Find your starting point.</p></div></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} Sola Studio.</span><span>Made for mindful moments. <button class="text-button" id="asset-credits">Artwork & photography credits ↗</button></span></div></div>`;
  const mobile = $(".mobile-menu");
  mobile.addEventListener("click", () => {
    const open = mobile.getAttribute("aria-expanded") !== "true";
    mobile.setAttribute("aria-expanded", open);
    mobile.setAttribute(
      "aria-label",
      open ? "Close navigation" : "Open navigation",
    );
    mobile.innerHTML = icon(open ? "close" : "menu");
    $(".public-nav").classList.toggle("open", open);
  });
  $("#asset-credits").addEventListener("click", () =>
    dialog(
      `<span class="eyebrow">A little credit where it’s due</span><h2>Art, with intention.</h2><p>Solar orbit, organic ripple, spiral and reflective-ring geometry sourced from the actual fffuel generators and recoloured for Sola.</p><p><a class="text-link" href="https://www.fffuel.co/" target="_blank" rel="noopener">fffuel artwork</a> · <a href="https://www.fffuel.co/license/" target="_blank" rel="noopener">Commercial-use licence</a></p><p>Photography from <a class="text-link" href="https://unsplash.com/license" target="_blank" rel="noopener">Unsplash</a> and <a class="text-link" href="https://www.pexels.com/license/" target="_blank" rel="noopener">Pexels</a>. Stock photographs illustrate the studio concept and sample profiles; no endorsement is implied.</p><p>Fraunces by Undercase Type and Manrope by Mikhail Sharanda, SIL Open Font License. </p>`,
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
    if (menu) {
      menu.classList.remove("open");
      $(".mobile-menu").setAttribute("aria-expanded", "false");
      $(".mobile-menu").innerHTML = icon("menu");
      $(".mobile-menu").focus();
    }
    $$(".home-menu[open]").forEach((d) => (d.open = false));
  }
});
document.addEventListener("click", (e) => {
  $$(".home-menu[open]").forEach((d) => {
    if (!d.contains(e.target)) d.open = false;
  });
});
const topButton = $("#back-top");
window.addEventListener(
  "scroll",
  () => topButton.classList.toggle("show", window.scrollY > 450),
  { passive: true },
);
topButton.addEventListener("click", () =>
  window.scrollTo({
    top: 0,
    behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "instant"
      : "smooth",
  }),
);
if ($(".motion-toggle")) {
  const motion = $(".motion-toggle");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  function motionStatus() {
    if (reduced.matches) {
      document.body.classList.add("paused");
      motion.disabled = true;
      motion.textContent = "Ⅱ";
      motion.setAttribute("aria-label", "Animation stopped for reduced motion");
      motion.setAttribute("aria-pressed", "true");
    } else {
      motion.disabled = false;
      motion.setAttribute(
        "aria-label",
        document.body.classList.contains("paused")
          ? "Play decorative animation"
          : "Pause decorative animation",
      );
    }
  }
  motion.addEventListener("click", () => {
    const paused = document.body.classList.toggle("paused");
    motion.textContent = paused ? "▷" : "Ⅱ";
    motion.setAttribute("aria-pressed", paused);
    motionStatus();
  });
  motionStatus();
  reduced.addEventListener("change", motionStatus);
}
