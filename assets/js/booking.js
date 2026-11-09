"use strict";
let storageWarning = false;
function initialState() {
  const now = new Date(),
    start = new Date(now);
  start.setDate(start.getDate() - 7);
  const end = new Date(now);
  end.setDate(end.getDate() + 53);
  return {
    version: 1,
    seed: SCHEDULE_SEED,
    profile: { name: "Alex", style: "Hatha Yoga" },
    plan: "ten",
    started: start.toISOString(),
    expires: end.toISOString(),
    bookings: [
      {
        id: "seed-upcoming",
        session: SESSIONS[0].id,
        status: "booked",
        charged: true,
        created: now.toISOString(),
      },
    ],
    history: [
      {
        name: "Hatha Yoga",
        date: new Date(now.getTime() - 86400000 * 2).toISOString(),
        status: "attended",
      },
      {
        name: "Yin Yoga",
        date: new Date(now.getTime() - 86400000 * 4).toISOString(),
        status: "attended",
      },
      {
        name: "Vinyasa Flow",
        date: new Date(now.getTime() - 86400000 * 6).toISOString(),
        status: "attended",
      },
    ],
    notifications: [],
    renewal: null,
  };
}
function loadState() {
  let s = readStore("state", null);
  if (
    !s ||
    s.version !== 1 ||
    !Array.isArray(s.bookings) ||
    !Array.isArray(s.history) ||
    !Array.isArray(s.notifications) ||
    typeof s.profile?.name !== "string" ||
    !s.expires ||
    !PLANS.some((p) => p.id === s.plan)
  )
    s = initialState();
  return s;
}
function saveState(s) {
  if (writeStore("state", s)) {
    window.solaMemoryState = null;
  } else {
    window.solaMemoryState = s;
    storageWarning = true;
  }
}
function getState() {
  const s = window.solaMemoryState || loadState();
  let changed = false;
  s.bookings.forEach((b) => {
    const slot = SESSIONS.find((x) => x.id === b.session);
    if (!b.snapshot && slot) {
      b.snapshot = { ...slot };
      changed = true;
    }
    const start = slot?.start || b.snapshot?.start;
    if (b.status === "booked" && start && new Date(start) <= new Date()) {
      b.status = "elapsed";
      changed = true;
    }
  });
  if (changed) saveState(s);
  return s;
}
function slotForBooking(b) {
  return SESSIONS.find((s) => s.id === b.session) || b.snapshot;
}

function activeBookings(s = getState()) {
  return s.bookings.filter((b) => b.status === "booked");
}
function credits(s = getState()) {
  const p = PLANS.find((p) => p.id === s.plan);
  return p.credits === null
    ? null
    : p.credits -
        s.history.length -
        s.bookings.filter((b) => b.charged && b.status !== "cancelled").length;
}
function bookingMessage(sessionId) {
  const s = getState(),
    slot = SESSIONS.find((x) => x.id === sessionId);
  if (!slot)
    return "This sample session is no longer available. Choose another class.";
  if (new Date(slot.start) <= new Date())
    return "This session has already started. Choose an upcoming class.";
  if (new Date(slot.start) > new Date(s.expires))
    return "This session falls outside your demo membership validity.";
  if (activeBookings(s).some((b) => b.session === sessionId))
    return "This class is already in your demo schedule.";
  if (credits(s) !== null && credits(s) <= 0)
    return "You have no remaining class credits. Review your membership options.";
  const end =
    new Date(slot.start).getTime() + practiceFor(slot).duration * 60000;
  if (
    activeBookings(s).some((b) => {
      const other = SESSIONS.find((x) => x.id === b.session);
      return (
        other &&
        new Date(slot.start).getTime() <
          new Date(other.start).getTime() +
            practiceFor(other).duration * 60000 &&
        new Date(other.start).getTime() < end
      );
    })
  )
    return "This time overlaps with a session already in your schedule.";
  return "";
}
function addBooking(sessionId) {
  const issue = bookingMessage(sessionId);
  if (issue) return { ok: false, message: issue };
  const s = getState(),
    slot = SESSIONS.find((x) => x.id === sessionId);
  s.bookings.push({
    id: "booking-" + Date.now(),
    session: sessionId,
    status: "booked",
    snapshot: { ...slot },
    charged: credits(s) !== null,
    created: new Date().toISOString(),
  });
  s.notifications.unshift({
    text: practiceFor(slot).name + " added to your local demo schedule.",
    date: new Date().toISOString(),
  });
  saveState(s);
  return {
    ok: true,
    message: "Added to your demo schedule. No studio seat has been reserved.",
  };
}
function cancelBooking(id) {
  const s = getState(),
    b = s.bookings.find((b) => b.id === id);
  if (!b || b.status !== "booked")
    return { ok: false, message: "This booking is no longer active." };
  const slot = SESSIONS.find((x) => x.id === b.session);
  if (slot && new Date(slot.start) <= new Date())
    return {
      ok: false,
      message: "Only upcoming demo sessions can be cancelled.",
    };
  b.status = "cancelled";
  s.notifications.unshift({
    text:
      "Demo booking cancelled." +
      (b.charged ? " One class credit restored." : ""),
    date: new Date().toISOString(),
  });
  saveState(s);
  return {
    ok: true,
    message:
      "Demo session cancelled." +
      (b.charged ? " Your credit has been restored." : ""),
  };
}
function bookAction(id) {
  if (!isDemo()) {
    location.href = pageURL("login", "?class=" + encodeURIComponent(id));
    return;
  }
  const result = addBooking(id);
  toast(result.message);
  if (document.body.dataset.page === "dashboard") renderDashboard();
}
function classDetails(id) {
  const s = SESSIONS.find((s) => s.id === id);
  if (!s) return;
  const p = practiceFor(s),
    g = guideFor(p);
  dialog(
    `<span class="eyebrow">${p.category} · ${p.level}</span><h2>${p.name}</h2><p>${p.desc}</p><dl class="details-list"><div><dt>Your guide</dt><dd>${g.name}</dd></div><div><dt>When</dt><dd>${dateLabel(s.start)} · ${timeLabel(s.start)} IST</dd></div><div><dt>Duration</dt><dd>${p.duration} minutes</dd></div><div><dt>Capacity</dt><dd>${s.capacity - s.sampleOccupied} illustrative spaces of ${s.capacity}</dd></div></dl><p class="notice">Sample schedule. Availability is illustrative; local demo bookings do not reserve a real seat.</p><button class="btn" data-book="${s.id}">Add to demo schedule ${icon("arrow")}</button>`,
  );
}
function sessionRows(slots, { cancel = false } = {}) {
  if (!slots.length)
    return '<div class="empty"><h3>A little space in your schedule.</h3><p>No sessions match these choices. Try another day or reset your filters.</p></div>';
  return slots
    .map((s) => {
      const p = practiceFor(s),
        g = guideFor(p),
        booked = isDemo() && activeBookings().some((b) => b.session === s.id);
      return `<article class="session-row"><div class="session-time"><strong>${timeLabel(s.start)}</strong><span>${dateLabel(s.start)}</span></div><div class="session-info"><span class="eyebrow">${p.category} · ${p.duration} MIN</span><h3><button class="text-button" data-details="${s.id}">${p.name}</button></h3><span>${g.name} <span aria-hidden="true">·</span> ${p.level}</span></div><span class="session-level">${p.level}</span><div class="session-action">${cancel ? `<button class="btn outline small" data-cancel="${activeBookings().find((b) => b.session === s.id)?.id}">Cancel session</button>` : `<button class="btn ${booked ? "outline" : ""} small" data-book="${s.id}" ${booked ? "disabled" : ""}>${booked ? "In your schedule" : "Book class"} ${booked ? icon("check", 16) : icon("arrow", 16)}</button>`}</div></article>`;
    })
    .join("");
}
document.addEventListener("click", (e) => {
  const book = e.target.closest("[data-book]"),
    detail = e.target.closest("[data-details]");
  if (book) {
    if ($("#modal").open) $("#modal").close();
    bookAction(book.dataset.book);
  }
  if (detail) classDetails(detail.dataset.details);
});
