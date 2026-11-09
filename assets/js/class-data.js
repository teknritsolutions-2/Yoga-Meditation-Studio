"use strict";
const GUIDES = [
  {
    id: "maya",
    name: "Maya Rao",
    specialty: "Hatha · Restorative",
    image: "guide-maya",
    approach:
      "A steady pace, thoughtful guidance, and space to discover what feels good in your body.",
  },
  {
    id: "arjun",
    name: "Arjun Mehta",
    specialty: "Vinyasa · Breathwork",
    image: "guide-arjun",
    approach:
      "Fluid sequences and an easy sense of curiosity. Bring your energy; find your own rhythm.",
  },
  {
    id: "leela",
    name: "Leela Shah",
    specialty: "Yin · Meditation",
    image: "guide-leela",
    approach:
      "Unhurried moments, softer edges, and a welcoming invitation to simply be.",
  },
];
const PRACTICES = [
  {
    id: "hatha",
    name: "Hatha Yoga",
    category: "Yoga",
    level: "Beginner",
    duration: 60,
    guide: "maya",
    goal: ["Move", "Build Strength"],
    image: "practice",
    desc: "Find your footing. A thoughtful balance of foundational postures, steady breathing, and a little time to pause.",
    note: "Steady movement. A fresh beginning.",
  },
  {
    id: "vinyasa",
    name: "Vinyasa Flow",
    category: "Yoga",
    level: "Intermediate",
    duration: 60,
    guide: "arjun",
    goal: ["Move", "Build Strength"],
    image: "flow",
    desc: "Follow your breath through fluid, energising sequences. An expressive practice for finding strength and ease.",
    note: "Breathe in. Flow into your day.",
  },
  {
    id: "yin",
    name: "Yin Yoga",
    category: "Yoga",
    level: "All Levels",
    duration: 45,
    guide: "leela",
    goal: ["Unwind", "Slow Down"],
    image: "quiet",
    desc: "Settle into supported, longer-held postures. A quiet practice with plenty of room to slow your pace.",
    note: "Less hurry. More presence.",
  },
  {
    id: "restorative",
    name: "Restorative Yoga",
    category: "Yoga",
    level: "Beginner",
    duration: 45,
    guide: "maya",
    goal: ["Unwind", "Slow Down"],
    image: "stillness",
    desc: "Blankets, bolsters, and permission to rest. Explore gentle supported shapes with attentive guidance.",
    note: "Give yourself a softer landing.",
  },
  {
    id: "meditation",
    name: "Guided Meditation",
    category: "Meditation",
    level: "All Levels",
    duration: 30,
    guide: "leela",
    goal: ["Unwind", "Slow Down"],
    image: "quiet-practice",
    desc: "An approachable guided session in noticing the present moment. No perfect posture or quiet mind required.",
    note: "A little space. Just for you.",
  },
  {
    id: "breathwork",
    name: "Breathwork & Mindfulness",
    category: "Breathwork",
    level: "Advanced",
    duration: 30,
    guide: "arjun",
    goal: ["Slow Down", "Move"],
    image: "sunset",
    desc: "Explore intentional breath and mindful attention in a guided practice. Choose a comfortable pace and take breaks whenever you need.",
    note: "Come back to the here and now.",
  },
];
const SCHEDULE_SEED = localDate(new Date());
const SESSIONS = Array.from({ length: 14 }, (_, day) => {
  const d = new Date(SCHEDULE_SEED + "T12:00:00+05:30");
  d.setUTCDate(d.getUTCDate() + day + 1);
  const date = localDate(d);
  return ["07:00", "09:30", "17:00", "18:30"].map((time, i) => {
    const practice = PRACTICES[(day * 2 + i) % PRACTICES.length];
    return {
      id: date + "-" + i,
      practice: practice.id,
      date,
      start: date + "T" + time + ":00+05:30",
      capacity: 12,
      sampleOccupied: 5 + ((day + i) % 6),
    };
  });
}).flat();
const practiceFor = (session) =>
  PRACTICES.find((p) => p.id === session.practice);
const guideFor = (practice) => GUIDES.find((g) => g.id === practice.guide);
const upcomingCatalog = () =>
  SESSIONS.filter((s) => new Date(s.start) > new Date());
