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
      `${photo(p.image, p.name + " practice")}<div class="practice-panel-content"><div class="practice-summary"><div class="practice-meta"><span class="pill">${p.level}</span><span class="pill">${p.duration} minutes</span></div><h3>${p.note}</h3></div><div class="practice-description"><p>${p.desc}</p><div class="actions">${link("Explore " + p.name, "classes", "text-link", "?practice=" + p.id)}</div></div></div>`;
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
  mountWeeklyExplorer();
}
if ($("#classes-week")) {
  function compare() {
    const n = Number($("#classes-week").value);
    $("#week-value").textContent = n;
    $("#comparison-summary").textContent =
      `About ${Math.ceil((n * 30) / 7)} classes over 30 days`;
    $("#plan-comparison").innerHTML = PLANS.map((p) => {
      const expected = Math.ceil((n * p.days) / 7),
        used = p.credits === null ? expected : Math.min(p.credits, expected);
      return `<article class="comparison-card"><div><span class="eyebrow">${p.days}-day validity</span><h3>${p.name}</h3></div><div class="comparison-cost"><bdi>~${money(Math.ceil(p.price / used))}</bdi><span>per attended class</span></div><dl><div><dt>Estimated visits</dt><dd>${used}</dd></div><div><dt>Access</dt><dd>${p.credits === null ? "Unlimited regular classes" : p.credits + (p.credits === 1 ? " class credit" : " class credits")}</dd></div></dl></article>`;
    }).join("");
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
