"use strict";
const SOLA = {
  name: "Sola Studio",
  timezone: "Asia/Kolkata",
  email: "",
  address: "",
  phone: "",
  hours: "",
};
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const inPages = /\/pages\//.test(location.pathname);
const base = inPages ? "../" : "./";
const pageURL = (page, query = "") =>
  base + (page === "home" ? "index.html" : "pages/" + page + ".html") + query;
const asset = (p) => base + "assets/" + p;
const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const money = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
const dateLabel = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", {
    timeZone: SOLA.timezone,
    weekday: "short",
    day: "numeric",
    month: "short",
  });
const timeLabel = (iso) =>
  new Date(iso).toLocaleTimeString("en-IN", {
    timeZone: SOLA.timezone,
    hour: "numeric",
    minute: "2-digit",
  });
const localDate = (d) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: SOLA.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
function readStore(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem("sola-" + key)) ?? fallback;
  } catch {
    return fallback;
  }
}
function writeStore(key, value) {
  try {
    localStorage.setItem("sola-" + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
function isDemo() {
  if (window.solaDemoActive) return true;
  try {
    return (
      sessionStorage.getItem("sola-demo") === "yes" ||
      readStore("remember-demo", false)
    );
  } catch {
    return false;
  }
}
function enterDemo(remember = false) {
  window.solaDemoActive = true;
  try {
    sessionStorage.setItem("sola-demo", "yes");
    if (remember) writeStore("remember-demo", true);
  } catch {}
}
function exitDemo() {
  try {
    sessionStorage.removeItem("sola-demo");
    localStorage.removeItem("sola-remember-demo");
  } catch {}
  location.href = pageURL("login");
}
function toast(message) {
  const el = $("#toast");
  if (!el) return;
  el.textContent = message;
  el.classList.add("visible");
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => el.classList.remove("visible"), 5000);
}
function dialog(content) {
  $("#modal-body").innerHTML = content;
  $("#modal").showModal();
}
function icon(name, size = 20) {
  const paths = {
    arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
    moon: '<path d="M20.5 13a8.5 8.5 0 0 1-9.5-9.5A8.5 8.5 0 1 0 20.5 13Z"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    close: '<path d="m6 6 12 12M6 18 18 6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    calendar:
      '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 11h18"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3"/>',
    bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    chevron: '<path d="m7 10 5 5 5-5"/>',
    up: '<path d="m6 13 6-6 6 6m-6-6v14"/>',
    leaf: '<path d="M20 3C10 2 3 6 4 13c1 8 13 7 16-10ZM4 21l11-12"/>',
    credit:
      '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/>',
    settings: '<path d="M5 3v18M12 3v18M19 3v18M2 7h6m1 10h6m1-11h6"/>',
    exit: '<path d="M9 4H4v16h5m6-13 5 5-5 5m-6-5h11"/>',
  };
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.sun}</svg>`;
}
function brand() {
  return `<a class="brand" href="${pageURL("home")}" aria-label="Sola Studio home"><img src="${asset("graphics/logo.svg")}" alt="" width="39" height="39"><span>sola<span class="brand-sub">STUDIO</span></span></a>`;
}
function photo(name, alt, cls = "", eager = false) {
  return `<img class="${cls}" src="${asset("images/" + name + ".jpg")}" alt="${alt}" loading="${eager ? "eager" : "lazy"}" decoding="async">`;
}
function link(label, page, cls = "btn", query = "") {
  return `<a class="${cls}" href="${pageURL(page, query)}">${label} ${icon("arrow", 18)}</a>`;
}
