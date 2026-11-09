"use strict";
$$("[data-plans]").forEach(
  (el) => (el.innerHTML = planCards(el.dataset.plans.split(","))),
);
if ($("#practice-tabs")) {
  const tabs = $("#practice-tabs");
  tabs.innerHTML = PRACTICES.map(
    (p, i) =>
      `<button class="practice-tab" id="tab-${p.id}" role="tab" aria-controls="practice-panel" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-practice="${p.id}">${p.name}<span>0${i + 1}</span>${icon("arrow", 20)}</button>`,
  ).join("");
  function selectPractice(id, focus = false) {
    const p = PRACTICES.find((p) => p.id === id);
    $$(".practice-tab").forEach((b) => {
      const active = b.dataset.practice === id;
      b.setAttribute("aria-selected", active);
      b.tabIndex = active ? 0 : -1;
      if (active && focus) b.focus();
    });
    $("#practice-panel").setAttribute("aria-labelledby", "tab-" + id);
    $("#practice-panel").innerHTML =
      `${photo(p.image, p.name + " practice")}<div class="practice-panel-content"><div><div class="practice-meta"><span class="pill">${p.level}</span><span class="pill">${p.duration} minutes</span></div><h3>${p.note}</h3><p>${p.desc}</p><div class="actions">${link("Explore " + p.name, "classes", "text-link", "?practice=" + p.id)}</div></div><img class="practice-art" src="${asset("graphics/organic-ripples.svg")}" alt=""></div>`;
  }
  tabs.addEventListener("click", (e) => {
    const b = e.target.closest("[data-practice]");
    if (b) selectPractice(b.dataset.practice);
  });
  tabs.addEventListener("keydown", (e) => {
    if (
      ![
        "ArrowLeft",
        "ArrowRight",
        "ArrowDown",
        "ArrowUp",
        "Home",
        "End",
      ].includes(e.key)
    )
      return;
    e.preventDefault();
    let i = PRACTICES.findIndex(
      (p) => $("#tab-" + p.id).getAttribute("aria-selected") === "true",
    );
    const rtl = document.documentElement.dir === "rtl";
    if (e.key === "Home") i = 0;
    else if (e.key === "End") i = 5;
    else
      i =
        (i +
          (["ArrowRight", "ArrowDown"].includes(e.key) ? 1 : -1) *
            (rtl &&
            e.key.startsWith("Arrow") &&
            ["ArrowRight", "ArrowLeft"].includes(e.key)
              ? -1
              : 1) +
          6) %
        6;
    selectPractice(PRACTICES[i].id, true);
  });
  selectPractice("hatha");
}
if ($("#schedule-days")) {
  const days = [...new Set(upcomingCatalog().map((s) => s.date))].slice(0, 7);
  $("#schedule-days").innerHTML = days
    .map(
      (d, i) =>
        `<button class="day-btn" aria-pressed="${i === 0}" data-day="${d}">${dateLabel(d + "T12:00:00+05:30")}</button>`,
    )
    .join("");
  function selectDay(day) {
    $$("[data-day]").forEach((b) =>
      b.setAttribute("aria-pressed", b.dataset.day === day),
    );
    $("#schedule-preview").innerHTML = sessionRows(
      upcomingCatalog().filter((s) => s.date === day),
    );
  }
  $("#schedule-days").addEventListener("click", (e) => {
    const b = e.target.closest("[data-day]");
    if (b) selectDay(b.dataset.day);
  });
  selectDay(days[0]);
}
if ($("#finder-form")) {
  function findPractice(e) {
    e?.preventDefault();
    const goal = $("#goal").value,
      level = $("#experience").value,
      length = $("#length").value,
      time = $("#time-of-day").value;
    const matches = PRACTICES.filter(
      (p) =>
        p.goal.includes(goal) &&
        (level === "All Levels" ||
          p.level === level ||
          p.level === "All Levels") &&
        (length === "any" || p.duration === Number(length)),
    );
    let sessions = upcomingCatalog().filter(
      (s) =>
        matches.some((p) => p.id === s.practice) &&
        (time === "any" ||
          (time === "morning"
            ? Number(s.start.slice(11, 13)) < 12
            : Number(s.start.slice(11, 13)) >= 12)),
    );
    $("#finder-results").innerHTML =
      matches.length && sessions.length
        ? `<div class="finder-result"><span class="eyebrow">A few places to begin</span><h3>${matches.map((p) => p.name).join(" · ")}</h3><p>${sessions.length} matching sessions over the next two weeks. Here are the next three.</p>${sessionRows(sessions.slice(0, 3))}</div>`
        : '<div class="empty"><h3>Let’s try a little flexibility.</h3><p>No exact match for this combination. Try any length or a different time of day.</p></div>';
  }
  $("#finder-form").addEventListener("submit", findPractice);
  findPractice();
}
if ($("#class-filters")) {
  const params = new URLSearchParams(location.search);
  let limit = 12;
  let practice = params.get("practice");
  const chosen = PRACTICES.find((p) => p.id === practice);
  if (chosen) $("#class-style").value = chosen.category;
  else if (["Yoga", "Meditation", "Breathwork"].includes(params.get("style")))
    $("#class-style").value = params.get("style");
  else practice = null;
  const days = [...new Set(upcomingCatalog().map((s) => s.date))];
  $("#class-date").insertAdjacentHTML(
    "beforeend",
    days
      .map(
        (d) =>
          `<option value="${d}">${dateLabel(d + "T12:00:00+05:30")}</option>`,
      )
      .join(""),
  );
  $("#style-chips").innerHTML = ["all", "Yoga", "Meditation", "Breathwork"]
    .map(
      (s) =>
        `<button class="chip" data-style="${s}" aria-pressed="${$("#class-style").value === s}">${s === "all" ? "All practices" : s}</button>`,
    )
    .join("");
  function showClasses() {
    const style = $("#class-style").value,
      level = $("#class-level").value,
      date = $("#class-date").value;
    const slots = upcomingCatalog().filter((s) => {
      const p = practiceFor(s);
      return (
        (style === "all" || p.category === style) &&
        (level === "all" || p.level === level) &&
        (date === "all" || s.date === date) &&
        (!practice || p.id === practice)
      );
    });
    $$("[data-style]").forEach((b) =>
      b.setAttribute("aria-pressed", b.dataset.style === style),
    );
    $("#class-count").textContent =
      `${slots.length} sessions${practice ? " · " + PRACTICES.find((p) => p.id === practice).name : ""} · Next two weeks · IST`;
    $("#class-list").innerHTML = sessionRows(slots.slice(0, limit));
    $("#load-classes").hidden = slots.length <= limit;
  }
  $("#class-filters").addEventListener("change", () => {
    limit = 12;
    practice = null;
    showClasses();
  });
  $("#class-filters").addEventListener("submit", (e) => e.preventDefault());
  $("#class-filters").addEventListener("reset", () => {
    limit = 12;
    practice = null;
    setTimeout(showClasses, 0);
  });
  $("#style-chips").addEventListener("click", (e) => {
    const b = e.target.closest("[data-style]");
    if (b) {
      $("#class-style").value = b.dataset.style;
      practice = null;
      limit = 12;
      showClasses();
    }
  });
  $("#load-classes").addEventListener("click", () => {
    limit += 12;
    showClasses();
  });
  showClasses();
  $("#weekly-timetable").innerHTML = days
    .slice(0, 7)
    .map(
      (d) =>
        `<div><h3>${dateLabel(d + "T12:00:00+05:30")}</h3>${upcomingCatalog()
          .filter((s) => s.date === d)
          .map(
            (s) =>
              `<button data-details="${s.id}"><strong>${timeLabel(s.start)}</strong><br>${practiceFor(s).name}<span>${practiceFor(s).duration} min · ${practiceFor(s).level}</span></button>`,
          )
          .join("")}</div>`,
    )
    .join("");
}
if ($("#classes-week")) {
  function compare() {
    const n = Number($("#classes-week").value);
    $("#week-value").textContent = n;
    const regular30 = Math.ceil((n * 30) / 7);
    $("#plan-comparison").innerHTML =
      `<span class="eyebrow">At ${n} ${n === 1 ? "class" : "classes"} per week</span><h3>About ${regular30} classes<br>over 30 days.</h3>${PLANS.map(
        (p) => {
          const expected = Math.ceil((n * p.days) / 7);
          const usable =
            p.credits === null ? expected : Math.min(p.credits, expected);
          return `<div class="comparison-row"><div><strong>${p.name}</strong><br><small>${p.days}-day validity · ${p.credits === null ? "Unlimited" : p.credits + " credits"}</small></div><div style="text-align:end"><strong>~${money(Math.ceil(p.price / usable))}/class</strong><br><small>${usable} assumed visits in validity</small></div></div>`;
        },
      ).join(
        "",
      )}<p>Price divided by expected usable visits, rounded up. Visits = the lesser of pack credits and ⌈classes/week × validity days ÷ 7⌉. Unlimited uses all expected visits. This compares one pack at a time; it does not assume unused credits roll over or rank a plan as best.</p>`;
  }
  $("#classes-week").addEventListener("input", compare);
  compare();
}
if ($("#contact-form")) {
  const topic = new URLSearchParams(location.search).get("topic");
  if (topic === "Workshop") $("#contact-topic").value = "Workshop";
  $("#contact-form").addEventListener("submit", (e) => {
    e.preventDefault();
    if (!e.target.reportValidity()) return;
    const name = $("#contact-name").value,
      email = $("#contact-email").value,
      message = $("#contact-message").value;
    dialog(
      `<span class="eyebrow">Enquiry preview · Not sent</span><h2>A little hello from ${esc(name)}.</h2><p><strong>Reply to:</strong> ${esc(email)}</p><p><strong>Topic:</strong> ${esc($("#contact-topic").value)}</p><p style="white-space:pre-wrap">${esc(message)}</p><p class="notice">This preview stays in your browser while open. No message was sent and no enquiry is stored. Studio contact details are awaiting configuration.</p><button class="btn" id="close-enquiry">Back to my message</button>`,
    );
    $("#close-enquiry").addEventListener("click", () => $("#modal").close());
  });
}
if ($("#login-form")) {
  const params = new URLSearchParams(location.search);
  const id = params.get("class"),
    plan = PLANS.find((p) => p.id === params.get("plan")),
    s = SESSIONS.find((s) => s.id === id);
  if (s)
    $("#login-context").innerHTML =
      `<p class="notice" style="margin-bottom:24px">${practiceFor(s).name} · ${dateLabel(s.start)} · ${timeLabel(s.start)} IST<br>Open the demo to review and add this class.</p>`;
  else if (id)
    $("#login-context").innerHTML =
      '<p class="notice">That sample session is no longer in the current schedule. Explore upcoming classes in the demo.</p>';
  else if (plan)
    $("#login-context").innerHTML =
      `<p class="notice" style="margin-bottom:24px">Exploring ${plan.name} · ${money(plan.price)} example price. Open the demo to preview a plan-change request.</p>`;
  $("#show-password").addEventListener("click", () => {
    const input = $("#login-password"),
      show = input.type === "password";
    input.type = show ? "text" : "password";
    $("#show-password").textContent = show ? "Hide" : "Show";
    $("#show-password").setAttribute("aria-pressed", show);
  });
  $("#login-form").addEventListener("submit", (e) => {
    e.preventDefault();
    $("#login-password").value = "";
    $("#login-feedback").textContent =
      "Real sign-in is not connected. Your credentials were not sent or saved. Use “Explore demo member dashboard” below.";
  });
  $("#enter-demo").addEventListener("click", () => {
    enterDemo($("#remember-demo").checked);
    const q = s
      ? "?class=" + encodeURIComponent(s.id)
      : plan
        ? "?plan=" + plan.id
        : "";
    location.href = pageURL("dashboard", q + (plan ? "#membership" : ""));
  });
}
