"use strict";
const DASH_NAV = [
  ["overview", "Overview", "grid"],
  ["book", "Book a class", "calendar"],
  ["sessions", "My sessions", "clock"],
  ["usage", "Class pack usage", "credit"],
  ["membership", "Membership & renewal", "leaf"],
  ["notifications", "Notifications", "bell"],
  ["profile", "Profile & settings", "settings"],
];
let dashSection = location.hash.slice(1) || "overview";
let bookFilters = { style: "all", date: "all" };
let bookLimit = 12;
let drawerFocus = null;
function dashboardShell() {
  const s = getState();
  $("#dashboard-app").innerHTML =
    `<div class="dashboard-shell"><button class="drawer-backdrop" aria-label="Close workspace navigation" tabindex="-1"></button><aside id="workspace-nav" class="dashboard-sidebar" aria-label="Member workspace navigation">${brand().replace(pageURL("home"), pageURL("dashboard") + "#overview")}<span class="sidebar-label">YOUR PRACTICE SPACE</span><nav class="dashboard-nav">${DASH_NAV.map(([id, label, ico]) => `<a href="#${id}" data-section="${id}">${icon(ico, 18)}${label}</a>`).join("")}</nav><div class="sidebar-bottom"><button id="exit-demo">${icon("exit", 17)} Exit workspace</button></div></aside><div class="dashboard-main"><header class="dashboard-topbar"><button class="icon-btn dashboard-menu" aria-label="Open workspace navigation" aria-expanded="false" aria-controls="workspace-nav">${icon("menu")}</button><span>A little more space for your practice.</span><div class="actions">${utilities()}<a href="#notifications" class="icon-btn" aria-label="View notifications">${icon("bell", 18)}</a><a href="#profile" class="avatar" aria-label="Open profile">${esc(s.profile.name.slice(0, 1).toUpperCase())}</a></div></header><main class="dashboard-content" id="main" tabindex="-1"></main></div></div>`;
  $("#exit-demo").addEventListener("click", exitDemo);
  $(".dashboard-menu").addEventListener("click", () => toggleDrawer());
  $(".drawer-backdrop").addEventListener("click", () => toggleDrawer(false));
  applyTheme();
  const mobile = matchMedia("(max-width:960px)");
  const sync = () => {
    if (!mobile.matches) {
      $(".dashboard-shell").classList.remove("drawer-open");
      document.body.style.overflow = "";
      $(".dashboard-menu").setAttribute("aria-expanded", "false");
    }
    $(".dashboard-sidebar").inert =
      mobile.matches &&
      !$(".dashboard-shell").classList.contains("drawer-open");
  };
  sync();
  $(".dashboard-sidebar").addEventListener("click", (e) => {
    if (
      e.target.closest("a") &&
      mobile.matches &&
      $(".dashboard-shell").classList.contains("drawer-open")
    )
      toggleDrawer(false);
  });
  mobile.addEventListener("change", sync);
}
function toggleDrawer(force) {
  const shell = $(".dashboard-shell"),
    open = force ?? !shell.classList.contains("drawer-open");
  shell.classList.toggle("drawer-open", open);
  $(".dashboard-menu").setAttribute("aria-expanded", open);
  $(".dashboard-sidebar").inert =
    matchMedia("(max-width:960px)").matches && !open;
  if (open) {
    drawerFocus = document.activeElement;
    $(".dashboard-nav a").focus();
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
    drawerFocus?.focus();
  }
}
function dashHeading(title, desc, action = "") {
  return `<div class="dash-heading"><div><span class="eyebrow">Your practice, all together</span><h1>${title}</h1><p>${desc}</p></div>${action}</div>`;
}
function daysRemaining(s) {
  return Math.max(0, Math.ceil((new Date(s.expires) - new Date()) / 86400000));
}
function usagePanel(s) {
  const p = PLANS.find((p) => p.id === s.plan),
    remaining = credits(s),
    used = remaining === null ? 0 : p.credits - remaining;
  return `<span class="eyebrow">${p.credits === null ? "Your access" : "Your current class pack"}</span><h3>${p.name}</h3><p>Valid until ${dateLabel(s.expires)} · ${daysRemaining(s)} days remaining</p>${remaining === null ? '<p style="margin-top:20px">Unlimited regular class access. No credit limit.</p>' : `<div class="progress" role="progressbar" aria-label="Class credits used" aria-valuemin="0" aria-valuemax="${p.credits}" aria-valuenow="${used}"><span style="width:${Math.min(100, (used / p.credits) * 100)}%"></span></div><div class="usage-numbers"><span>${used} used or held</span><strong>${remaining} of ${p.credits} remaining</strong></div>`}`;
}
function nextSession(s) {
  return activeBookings(s)
    .map((b) => slotForBooking(b))
    .filter((slot) => slot && new Date(slot.start) > new Date())
    .sort((a, b) => new Date(a.start) - new Date(b.start))[0];
}
function notificationItems(s) {
  const items = [...s.notifications];
  const next = nextSession(s);
  if (next)
    items.push({
      text:
        "Next in your schedule: " +
        practiceFor(next).name +
        " · " +
        dateLabel(next.start) +
        " at " +
        timeLabel(next.start) +
        " IST.",
      date: next.start,
    });
  if (credits(s) !== null && credits(s) <= 2)
    items.push({
      text:
        "You have " +
        credits(s) +
        " class credits remaining in your class pack.",
      date: new Date().toISOString(),
    });
  items.push({
    text:
      "Your " +
      PLANS.find((p) => p.id === s.plan).name +
      " expires " +
      dateLabel(s.expires) +
      ". Renewals are preview requests only.",
    date: s.expires,
  });
  return items;
}
function activity(items) {
  return `<ul class="activity-list">${items.map((n) => `<li><span class="activity-dot"></span><div>${esc(n.text)}<small>${dateLabel(n.date)}</small></div></li>`).join("")}</ul>`;
}
function overview(s) {
  const p = PLANS.find((p) => p.id === s.plan),
    next = nextSession(s),
    upcoming = activeBookings(s).filter((b) => {
      const slot = slotForBooking(b);
      return slot && new Date(slot.start) > new Date();
    }).length;
  return `${dashHeading("A little time for you, " + esc(s.profile.name) + ".", "Welcome back. Your next moment on the mat is right here.", '<a class="btn small" href="#book">Book a class ' + icon("arrow", 16) + "</a>")}<div class="stats-grid">${[
    [
      "Your membership",
      p.name,
      p.credits === null
        ? "Unlimited regular classes"
        : p.credits + "-class pack",
      "leaf",
    ],
    [
      "Credits remaining",
      credits(s) === null ? "Unlimited" : credits(s),
      credits(s) === null ? "No credit limit" : "Bookings hold one credit",
      "credit",
    ],
    ["Upcoming sessions", upcoming, "In your schedule", "calendar"],
    [
      "Days remaining",
      daysRemaining(s),
      "Until " + dateLabel(s.expires),
      "clock",
    ],
  ]
    .map(
      ([label, n, sub, i]) =>
        `<article class="stat-card"><div>${label}${icon(i, 19)}</div><strong class="${typeof n === "string" ? "stat-value-label" : "stat-value"}">${n}</strong><small><bdi>${sub}</bdi></small></article>`,
    )
    .join(
      "",
    )}</div><div class="dash-grid"><section class="panel"><div class="panel-title"><h2>Your next little pause</h2><a href="#sessions">My sessions ↗</a></div>${next ? `<div class="next-session"><span class="eyebrow">${dateLabel(next.start)} · ${timeLabel(next.start)} IST</span><h3>${practiceFor(next).name}</h3><p>${guideFor(practiceFor(next)).name} · ${practiceFor(next).duration} min · ${practiceFor(next).level}</p><div class="actions"><button class="btn small" data-details="${next.id}">Session details ${icon("arrow", 15)}</button><a href="#sessions" class="text-link">Manage booking</a></div></div>` : '<div class="empty"><h3>Your mat is waiting.</h3><p>Choose an upcoming session to get started.</p><a class="btn small" href="#book" style="margin-top:20px">Find a class</a></div>'}</section><section class="panel membership-summary">${usagePanel(s)}<a class="btn outline small" href="#usage">View class pack ${icon("arrow", 15)}</a></section></div><section class="panel"><div class="panel-title"><h2>A little heads-up</h2><a href="#notifications">All notifications ↗</a></div>${activity(notificationItems(s).slice(0, 3))}</section>`;
}
function bookPage() {
  return `${dashHeading("Make a little time.", "Browse upcoming classes. All session times are in IST.")}<form class="filters" id="dashboard-filters"><div class="field"><label for="dash-style">Practice</label><select id="dash-style">${["all", "Yoga", "Meditation", "Breathwork"].map((c) => `<option value="${c}" ${bookFilters.style === c ? "selected" : ""}>${c === "all" ? "All styles" : c}</option>`).join("")}</select></div><div class="field"><label for="dash-date">Day</label><select id="dash-date"><option value="all">All upcoming days</option>${[...new Set(upcomingCatalog().map((s) => s.date))].map((d) => `<option value="${d}" ${bookFilters.date === d ? "selected" : ""}>${dateLabel(d + "T12:00:00+05:30")}</option>`).join("")}</select></div><button class="btn outline" type="reset">Reset filters</button></form><p class="results-count" id="dash-class-count" aria-live="polite"></p><div id="dash-class-list"></div><button class="btn outline small" id="dash-more" style="margin-top:25px">Show more classes</button><p class="table-caption">Regular classes use one credit per booking. Unlimited plans have no credit counter. Reservations are not connected. Cancel before the session start time for a credit return.</p>`;
}
function showDashClasses() {
  const slots = upcomingCatalog().filter(
    (s) =>
      (bookFilters.style === "all" ||
        practiceFor(s).category === bookFilters.style) &&
      (bookFilters.date === "all" || s.date === bookFilters.date),
  );
  $("#dash-class-count").textContent =
    slots.length + " upcoming sessions · IST";
  $("#dash-class-list").innerHTML = sessionRows(slots.slice(0, bookLimit));
  $("#dash-more").hidden = slots.length <= bookLimit;
}
function sessionsPage(s) {
  const slots = activeBookings(s)
    .map((b) => slotForBooking(b))
    .filter((x) => x && new Date(x.start) > new Date())
    .sort((a, b) => new Date(a.start) - new Date(b.start));
  const cancelled = s.bookings.filter((b) => b.status === "cancelled");
  const past = s.bookings.filter((b) => {
    const slot = slotForBooking(b);
    return b.status === "elapsed" && slot;
  });
  return `${dashHeading("Your moments on the mat.", "Keep track of what’s coming up, and the practice you’ve already made time for.", '<a class="btn small" href="#book">Find a class ' + icon("arrow", 16) + "</a>")}<section class="panel"><div class="panel-title"><h2>Coming up · ${slots.length}</h2><span class="pill">IST</span></div>${slots.length ? sessionRows(slots, { cancel: true }) : '<div class="empty"><h3>A little room in your week.</h3><p>Find a class and add your next practice to this space.</p></div>'}<p class="table-caption">Cancellation rule: cancel before the session starts to restore one held credit. Unlimited access has no credits to restore.</p></section><h2 class="dash-section-title">Your practice history</h2><div class="history-items">${s.history.map((h) => `<div class="history-item"><div><strong>${esc(h.name)}</strong><br><small>${dateLabel(h.date)} · Practice history</small></div><span class="status">Attended</span></div>`).join("")}${past
    .map((b) => {
      const slot = slotForBooking(b);
      return `<div class="history-item"><div><strong>${practiceFor(slot).name}</strong><br><small>${dateLabel(slot.start)}</small></div><span class="status">Session elapsed</span></div>`;
    })
    .join("")}${cancelled
    .map((b) => {
      const slot = slotForBooking(b);
      return `<div class="history-item"><div><strong>${slot ? practiceFor(slot).name : "Previous session"}</strong><br><small>${slot ? dateLabel(slot.start) : dateLabel(b.created)}</small></div><span class="status">Cancelled${b.charged ? " · Credit restored" : ""}</span></div>`;
    })
    .join("")}</div>`;
}
function usagePage(s) {
  const p = PLANS.find((p) => p.id === s.plan);
  return `${dashHeading("A little consistency goes a long way.", "Every visit and every credit, clearly accounted for.")}<section class="panel membership-summary">${usagePanel(s)}<p class="table-caption">${p.credits === null ? "Unlimited access covers regular classes without a credit limit." : "Used credits include past sessions and credits held by bookings. Cancel an upcoming class to return its credit."} Started ${dateLabel(s.started)}.</p></section><h2 class="dash-section-title">Your class ledger</h2><p class="scroll-hint">Scroll across to explore the full ledger ${icon("arrow", 16)}</p><div class="panel ledger-scroll" tabindex="0" role="region" aria-label="Class pack ledger"><table class="ledger"><caption class="sr-only">Practice booking and credit history</caption><thead><tr><th>Class</th><th>Date</th><th>Status</th><th>Credit impact</th></tr></thead><tbody>${s.history.map((h) => `<tr><td>${esc(h.name)}</td><td>${dateLabel(h.date)}</td><td><span class="status">Recorded</span></td><td>${p.credits === null ? "Included" : "−1"}</td></tr>`).join("")}${s.bookings
    .map((b) => {
      const slot = slotForBooking(b);
      return `<tr><td>${slot ? practiceFor(slot).name : "Previous class"}</td><td>${slot ? dateLabel(slot.start) : dateLabel(b.created)}</td><td><span class="status">${b.status === "cancelled" ? "Cancelled" : b.status === "elapsed" ? "Elapsed" : "Planned"}</span></td><td>${b.status === "cancelled" ? (b.charged ? "0 · restored" : "Included") : b.charged ? (b.status === "elapsed" ? "−1 · used" : "−1 · held") : "Included"}</td></tr>`;
    })
    .join("")}</tbody></table></div>`;
}
function membershipPage(s) {
  const p = PLANS.find((p) => p.id === s.plan),
    selected = new URLSearchParams(location.search).get("plan");
  return `${dashHeading("A rhythm that grows with you.", "Review your membership and preview what comes next.")}<div class="renewal-grid"><section class="panel membership-summary">${usagePanel(s)}<dl class="details-list"><div><dt>Started</dt><dd>${dateLabel(s.started)}</dd></div><div><dt>Expires</dt><dd>${dateLabel(s.expires)}</dd></div><div><dt>Indicative price</dt><dd>${money(p.price)}</dd></div><div><dt>Renewal</dt><dd>Manual request · No auto-renewal</dd></div></dl><p>Includes all regular classes. Workshops excluded.</p></section><section class="panel"><h2>Look ahead.</h2><p style="margin-top:17px">Choose a plan to preview a renewal or change request.</p><form id="renewal-form"><div class="field"><label for="renewal-plan">Plan to explore</label><select id="renewal-plan">${PLANS.map((plan) => `<option value="${plan.id}" ${(selected || s.plan) === plan.id ? "selected" : ""}>${plan.name} · ${money(plan.price)}</option>`).join("")}</select></div><div class="notice">This creates a local request. No payment is taken and your active plan, credits, and expiry stay unchanged.</div><button class="btn" type="submit">Preview renewal request ${icon("arrow", 16)}</button></form></section></div>${s.renewal ? `<section class="panel" style="margin-top:25px"><div class="panel-title"><h2>Your local request</h2><span class="status">Preview only · Not paid</span></div><p style="">${PLANS.find((p) => p.id === s.renewal.plan).name} · ${money(PLANS.find((p) => p.id === s.renewal.plan).price)} example pricing</p><p class="table-caption">Created ${dateLabel(s.renewal.created)}. Your active membership has not changed.</p><button class="btn outline small" id="remove-renewal" style="margin-top:20px">Remove local request</button></section>` : ""}`;
}
function profilePage(s) {
  return `${dashHeading("Your space. Your preferences.", "Keep it personal, keep it simple. Your preferences stay on this device.")}<div class="dash-grid"><section class="panel"><div class="panel-title"><h2>A little about you</h2></div><form class="profile-form" id="profile-form"><div class="field"><label for="profile-name">Display name</label><input id="profile-name" required maxlength="40" value="${esc(s.profile.name)}" autocomplete="off"></div><div class="field"><label for="profile-style">Preferred practice</label><select id="profile-style">${PRACTICES.map((p) => `<option ${s.profile.style === p.name ? "selected" : ""}>${p.name}</option>`).join("")}</select></div><button class="btn small" type="submit">Save preferences ${icon("check", 16)}</button><p class="schedule-note">This workspace stores practice plans on this device. Account authentication, reservations, and payments are not connected.</p></form></section><section class="panel"><div class="panel-title"><h2>Make yourself at home</h2></div><div class="settings-row"><div><h3>Color theme</h3><p>A sunlit studio or a warm evening.</p></div><button class="btn outline small theme-toggle">${icon("moon", 18)}</button></div><div class="settings-row"><div><h3>Reading direction</h3><p>Switch between LTR and RTL layout.</p></div><button class="btn outline small direction-toggle">${document.documentElement.dir === "rtl" ? "LTR" : "RTL"}</button></div><div class="settings-row"><div><h3>Leave the workspace</h3><p>Leave this workspace.</p></div><button class="btn outline small" id="profile-exit">Exit workspace</button></div></section></div><section class="panel"><h2 style="font-size:25px">Explore plan models</h2><p style="margin-top:15px">Load a fresh plan model to inspect limited-credit and unlimited behaviour. This replaces the local bookings and history. It is not a purchase or renewal.</p><div class="settings-row"><div class="field"><label for="sample-model">Plan model</label><select id="sample-model">${PLANS.map((p) => `<option value="${p.id}" ${s.plan === p.id ? "selected" : ""}>${p.name}</option>`).join("")}</select></div><button class="btn outline small" id="load-sample">Load plan model</button></div><div class="settings-row"><div><h3>Reset local practice data</h3><p>Restore Alex’s Ten-Class Pack, practice history, and one upcoming booking.</p></div><button class="btn outline small danger" id="reset-demo">Reset practice data</button></div></section>`;
}
function renderDashboard() {
  const s = getState();
  if (!DASH_NAV.some((n) => n[0] === dashSection)) dashSection = "overview";
  $$("[data-section]").forEach((a) => {
    if (a.dataset.section === dashSection)
      a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
  const content = {
    overview: () => overview(s),
    book: bookPage,
    sessions: () => sessionsPage(s),
    usage: () => usagePage(s),
    membership: () => membershipPage(s),
    notifications: () =>
      `${dashHeading("A little heads-up.", "Updates from your bookings, plan, and recent actions.")}<section class="panel">${activity(notificationItems(s))}</section>`,
    profile: () => profilePage(s),
  };
  $("#main").innerHTML = content[dashSection]();
  if (storageWarning)
    $("#main").insertAdjacentHTML(
      "afterbegin",
      '<p class="notice">Browser storage is unavailable. Changes last for this page session only.</p>',
    );
  if (dashSection === "book") {
    showDashClasses();
    $("#dashboard-filters").addEventListener("submit", (e) =>
      e.preventDefault(),
    );
    $("#dashboard-filters").addEventListener("change", () => {
      bookFilters = {
        style: $("#dash-style").value,
        date: $("#dash-date").value,
      };
      bookLimit = 12;
      showDashClasses();
    });
    $("#dashboard-filters").addEventListener("reset", () => {
      bookFilters = { style: "all", date: "all" };
      bookLimit = 12;
      setTimeout(showDashClasses, 0);
    });
    $("#dash-more").addEventListener("click", () => {
      bookLimit += 12;
      showDashClasses();
    });
  }
  if (dashSection === "membership") {
    $("#renewal-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const p = PLANS.find((p) => p.id === $("#renewal-plan").value);
      dialog(
        `<span class="eyebrow">Renewal preview · No payment</span><h2>${p.name}</h2><p>${money(p.price)} example price · ${p.days} days · ${p.credits === null ? "Unlimited regular classes" : p.credits + " class credits"}</p><p class="notice">Save a local request only. Your active membership, expiry, and credits remain unchanged. No real request is sent to a studio.</p><button class="btn" id="confirm-renewal">Save local request</button>`,
      );
      $("#confirm-renewal").addEventListener("click", () => {
        const state = getState();
        state.renewal = { plan: p.id, created: new Date().toISOString() };
        state.notifications.unshift({
          text:
            "Local " +
            p.name +
            " renewal preview saved. No payment or membership change.",
          date: new Date().toISOString(),
        });
        saveState(state);
        $("#modal").close();
        renderDashboard();
        toast("Local renewal preview saved. No payment taken.");
      });
    });
    $("#remove-renewal")?.addEventListener("click", () => {
      const state = getState();
      state.renewal = null;
      state.notifications.unshift({
        text: "Local renewal preview removed.",
        date: new Date().toISOString(),
      });
      saveState(state);
      renderDashboard();
      toast("Request removed.");
    });
  }
  if (dashSection === "profile") {
    applyTheme();
    $("#profile-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const name = $("#profile-name").value.trim();
      if (!name) {
        $("#profile-name").setCustomValidity("Please enter a display name.");
        $("#profile-name").reportValidity();
        return;
      }
      const state = getState();
      state.profile = { name, style: $("#profile-style").value };
      saveState(state);
      $(".avatar").textContent = name.slice(0, 1).toUpperCase();
      toast("Preferences saved on this device.");
    });
    $("#profile-name").addEventListener("input", (e) =>
      e.target.setCustomValidity(""),
    );
    $("#profile-exit").addEventListener("click", exitDemo);
    $("#reset-demo").addEventListener("click", () =>
      confirmSample("ten", true),
    );
    $("#load-sample").addEventListener("click", () =>
      confirmSample($("#sample-model").value, false),
    );
  }
}
function confirmSample(plan, reset) {
  const p = PLANS.find((p) => p.id === plan);
  dialog(
    `<span class="eyebrow">Practice data</span><h2>${reset ? "A fresh beginning." : "Explore " + p.name + "."}</h2><p>This replaces your local bookings, history, preferences, and renewal preview with a fresh practice plan. Your theme and reading direction are kept.</p><div class="actions"><button class="btn" id="confirm-reset">${reset ? "Reset practice data" : "Load plan model"}</button><button class="btn outline modal-close-static">Keep current plan</button></div>`,
  );
  $(".modal-close-static").addEventListener("click", () => $("#modal").close());
  $("#confirm-reset").addEventListener("click", () => {
    const fresh = initialState();
    fresh.plan = plan;
    if (plan === "single") fresh.history = [];
    if (plan === "five") fresh.history = fresh.history.slice(0, 1);
    if (plan === "unlimited")
      fresh.bookings.forEach((b) => (b.charged = false));
    fresh.started = fresh.history.length
      ? fresh.started
      : new Date().toISOString();
    fresh.expires = new Date(
      new Date(fresh.started).getTime() + p.days * 86400000,
    ).toISOString();
    saveState(fresh);
    $("#modal").close();
    $(".avatar").textContent = "A";
    renderDashboard();
    toast(
      reset
        ? "Practice plan restored."
        : "Plan model loaded. No purchase made.",
    );
  });
}
enterDemo();
dashboardShell();
renderDashboard();
window.addEventListener("hashchange", () => {
  dashSection = location.hash.slice(1) || "overview";
  if ($(".dashboard-shell").classList.contains("drawer-open"))
    toggleDrawer(false);
  renderDashboard();
  $("#main").focus({ preventScroll: true });
  window.scrollTo(0, 0);
});
document.addEventListener("click", (e) => {
  const cancel = e.target.closest("[data-cancel]");
  if (cancel) {
    const result = cancelBooking(cancel.dataset.cancel);
    renderDashboard();
    toast(result.message);
  }
});
document.addEventListener("keydown", (e) => {
  const ledger = e.target.closest(".ledger-scroll");
  if (
    ledger === e.target &&
    ["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)
  ) {
    e.preventDefault();
    if (e.key === "Home") ledger.scrollLeft = 0;
    else if (e.key === "End")
      ledger.scrollLeft =
        (ledger.scrollWidth - ledger.clientWidth) *
        (getComputedStyle(ledger).direction === "rtl" ? -1 : 1);
    else ledger.scrollBy({ left: e.key === "ArrowLeft" ? -80 : 80 });
    return;
  }
  if (!$(".dashboard-shell.drawer-open")) return;
  if (e.key === "Escape") {
    toggleDrawer(false);
    return;
  }
  if (e.key === "Tab") {
    const items = $$("a,button", $(".dashboard-sidebar"));
    const first = items[0],
      last = items.at(-1);
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    }
    if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});
const requested = new URLSearchParams(location.search).get("class");
if (requested) {
  history.replaceState(null, "", location.pathname + location.hash);
  if (SESSIONS.some((s) => s.id === requested)) classDetails(requested);
  else toast("That session is no longer current. Browse upcoming classes.");
}
