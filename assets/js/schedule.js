"use strict";
function mountWeeklyExplorer() {
  const root = $("#weekly-timetable");
  if (!root) return;
  const available = [...new Set(upcomingCatalog().map((s) => s.date))];
  const monday = available.find(
    (d) => new Date(d + "T12:00:00+05:30").getUTCDay() === 1,
  );
  const dates = available.filter((d) => d >= monday).slice(0, 7);
  root.innerHTML = `<div class="week-tabs" role="tablist" aria-label="Choose a day">${dates
    .map((date, i) => {
      const d = new Date(date + "T12:00:00+05:30");
      return `<button class="week-tab" role="tab" id="week-${date}" aria-selected="false" aria-controls="week-sessions" tabindex="-1" data-week-day="${date}"><strong>${d.toLocaleDateString("en-GB", { weekday: "long", timeZone: SOLA.timezone })}</strong><span>${d.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: SOLA.timezone })}</span></button>`;
    })
    .join(
      "",
    )}</div><div class="week-heading"><h3 id="week-title"></h3><span>All times in IST</span></div><div class="week-sessions" id="week-sessions" role="tabpanel" aria-live="polite"></div>`;
  function choose(date, focus = false) {
    $$("[data-week-day]", root).forEach((b) => {
      const active = b.dataset.weekDay === date;
      b.setAttribute("aria-selected", active);
      b.tabIndex = active ? 0 : -1;
      if (active && focus) b.focus();
    });
    $("#week-title").textContent = dateLabel(date + "T12:00:00+05:30");
    $("#week-sessions").setAttribute("aria-labelledby", "week-" + date);
    $("#week-sessions").innerHTML = upcomingCatalog()
      .filter((s) => s.date === date)
      .map((s) => {
        const p = practiceFor(s),
          g = guideFor(p),
          booked = isDemo() && activeBookings().some((b) => b.session === s.id);
        return `<article class="week-card"><div class="week-card-top"><time datetime="${s.start}"><bdi>${timeLabel(s.start)}</bdi></time><span>${p.duration} min</span></div><h4>${p.name}</h4><p>${g.name} · ${p.level}</p><div class="week-card-actions"><button class="text-link" data-details="${s.id}">View class ${icon("arrow", 16)}</button><button class="btn small ${booked ? "outline" : ""}" data-book="${s.id}" ${booked ? "disabled" : ""}>${booked ? "In your schedule" : "Book class"}</button></div></article>`;
      })
      .join("");
  }
  root.addEventListener("click", (e) => {
    const b = e.target.closest("[data-week-day]");
    if (b) choose(b.dataset.weekDay);
  });
  root.querySelector(".week-tabs").addEventListener("keydown", (e) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    let i = dates.findIndex(
      (d) => $("#week-" + d).getAttribute("aria-selected") === "true",
    );
    if (e.key === "Home") i = 0;
    else if (e.key === "End") i = 6;
    else
      i =
        (i +
          (e.key === "ArrowRight" ? 1 : -1) *
            (document.documentElement.dir === "rtl" ? -1 : 1) +
          7) %
        7;
    choose(dates[i], true);
  });
  choose([...dates].sort()[0]);
}
