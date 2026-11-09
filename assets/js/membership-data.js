"use strict";
const PLANS = [
  {
    id: "single",
    name: "Single Session",
    price: 700,
    credits: 1,
    days: 7,
    audience: "A little room to explore.",
    features: [
      "One regular studio class",
      "Use within 7 days",
      "Choose any practice style",
    ],
  },
  {
    id: "five",
    name: "Five-Class Pack",
    price: 3000,
    credits: 5,
    days: 30,
    audience: "Make a little time for yourself.",
    features: [
      "Five regular class credits",
      "Use within 30 days",
      "A flexible weekly ritual",
    ],
  },
  {
    id: "ten",
    name: "Ten-Class Pack",
    price: 5500,
    credits: 10,
    days: 60,
    audience: "Find your everyday rhythm.",
    features: [
      "Ten regular class credits",
      "Use within 60 days",
      "Room to try every practice",
    ],
  },
  {
    id: "unlimited",
    name: "Unlimited Monthly",
    price: 6500,
    credits: null,
    days: 30,
    audience: "For a practice that grows with you.",
    features: [
      "Unlimited regular classes",
      "30 days of practice",
      "One active booking per session",
    ],
  },
];
function planCards(ids = PLANS.map((p) => p.id)) {
  return `<div class="plans-grid">${ids
    .map((id) => {
      const p = PLANS.find((p) => p.id === id);
      return `<article class="plan ${id === "ten" ? "featured" : ""}">${id === "ten" ? '<span class="plan-tag">A regular rhythm</span>' : ""}<span class="eyebrow">${p.credits === null ? "Unlimited access" : p.credits + " class" + (p.credits > 1 ? "es" : "")}</span><h3>${p.name}</h3><p>${p.audience}</p><div class="price">${money(p.price)}<span> / ${p.credits === null ? "month" : p.credits === 1 ? "session" : "pack"}</span></div><ul>${p.features.map((f) => `<li>${icon("check", 16)} ${f}</li>`).join("")}</ul>${link("Explore this plan", "dashboard", "btn " + (id === "ten" ? "" : "outline"), "?plan=" + p.id + "#membership")}<small>Manual renewal · Workshops excluded.</small></article>`;
    })
    .join("")}</div>`;
}
