import React, { useState, useEffect, useMemo } from "react";
import {
  ChevronLeft, Sparkles, Camera, User, Plus, X, Clock, Check,
  Calendar, ChevronDown, ChevronRight,
  TrendingUp, Activity, Ruler, History,
} from "lucide-react";

/* Palette mapped to the app theme (TEAL / MINT / SAGE / DM Sans) */
const T = {
  ink: "#1a2e2a",
  inkSoft: "#5f7a76",
  inkFaint: "rgba(26,46,42,0.42)",
  teal: "#3aafa9",
  tealDark: "#2B7A78",
  tealDeep: "#2B7A78",
  tealTint: "#e8f5f3",
  green: "#3aaf6a",
  greenTint: "#e6f6ec",
  red: "#e8453c",
  redTint: "#fdeceb",
  redTx: "#c23a30",
  amberTint: "#fbeed8",
  amberTx: "#8a5a12",
  mintTint: "#e6f6ec",
  mintTx: "#1f6b2e",
  cream: "#f3f6f4",
  creamTint: "#eaf0ee",
  white: "#ffffff",
  line: "#e0ebe8",
};

const FONT = `'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif`;
const HEAT = ["", "#e8f5f3", "#bfe6e1", "#7fd0c6", "#3aafa9"];

const cardBase = {
  background: T.white,
  borderRadius: 22,
  border: `1px solid ${T.line}`,
  boxShadow: "0 1px 2px rgba(26,46,42,0.05)",
};

const MEAL_POOL = {
  4: ["Eggs and oats · 520 cal", "Chicken bowl · 780 cal", "Salmon, rice, veg · 840 cal"],
  3: ["Greek yogurt · 340 cal", "Turkey wrap · 610 cal", "Pasta dinner · 910 cal"],
  2: ["Protein shake · 320 cal", "Burrito bowl · 1,140 cal"],
  1: ["Coffee and toast · 280 cal"],
  0: [],
};
const STEPS_BY_LEVEL = [1500, 3800, 6200, 8600, 10200];
const SLEEP_BY_LEVEL = [4.8, 5.6, 6.4, 7.2, 7.9];
const BEDTIME = ["1:30 AM", "12:40 AM", "12:05 AM", "11:15 PM", "10:40 PM"];
const ACTIVE_BY_LEVEL = [0, 10, 22, 38, 54];

const PILLARS = [
  ["all", "All"],
  ["nutrition", "Nutrition"],
  ["movement", "Movement"],
  ["recovery", "Recovery"],
];

const levelFor = (day, pillar) =>
  pillar === "nutrition" ? day.nLevel :
  pillar === "movement" ? day.mLevel :
  pillar === "recovery" ? day.rLevel : day.composite;

const TL_BADGE = {
  milestone: ["Milestone", T.mintTint, T.mintTx],
  change: ["Change", T.creamTint, T.inkSoft],
  log: ["Log", T.creamTint, T.inkSoft],
  note: ["Coach note", T.tealTint, T.tealDark],
};

/* ---------- deterministic helpers ---------- */
function seedFrom(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const clamp04 = (v) => Math.max(0, Math.min(4, Math.round(v)));
const round1 = (v) => Math.round(v * 10) / 10;
function fmtIso(iso) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function addDaysFmt(iso, days) {
  const d = new Date((iso || "2026-01-01") + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function genLevels(archetype, rng, kind) {
  const arr = [];
  for (let w = 0; w < 4; w++) {
    for (let d = 0; d < 7; d++) {
      const weekend = d >= 5;
      let t;
      if (archetype === "strong") t = weekend ? 3 : 4;
      else if (archetype === "weekendGap") t = weekend ? 0 : 4;
      else if (archetype === "declining") t = 4 - w - (weekend ? 1 : 0);
      else t = 1 + w - (weekend ? 1 : 0); // improving
      if (kind === "recovery") t = weekend ? t + 1 : t;
      if (kind === "movement") t = t - 1;
      const r = rng();
      const noise = r < 0.28 ? -1 : r > 0.86 ? 1 : 0;
      arr.push(clamp04(t + noise));
    }
  }
  return arr;
}

function makeSeries(base, cur, n = 8) {
  const arr = [];
  for (let i = 0; i < n; i++) {
    const p = i / (n - 1);
    arr.push(round1(base + (cur - base) * Math.pow(p, 0.7)));
  }
  arr[n - 1] = round1(cur);
  arr[0] = round1(base);
  return arr;
}

function weekLabels(startIso, n, spanDays = 90) {
  const out = [];
  const start = new Date((startIso || "2026-01-01") + "T00:00:00").getTime();
  for (let i = 0; i < n; i++) {
    const d = new Date(start + (i * spanDays / (n - 1)) * 86400000);
    out.push(d.toLocaleDateString("en-US", { month: "short", day: "numeric" }));
  }
  return out;
}

/* ---------- per-client derivation ---------- */
function deriveClient(client) {
  const c = client || {};
  const name = c.name || "Client";
  const firstName = name.split(" ")[0];
  const initial = firstName.charAt(0).toUpperCase();
  const seed = seedFrom(name);
  const rng = mulberry32(seed);

  const archetype = ["strong", "weekendGap", "declining", "improving"][(seed >>> 3) % 4];
  const photoBucket = seed % 10;
  const photoState = photoBucket <= 4 ? "photos" : photoBucket <= 7 ? "none" : "declined";

  const assess = c.assessment || {};
  const current = c.current || {};
  const goals = c.goals || {};
  const nut = c.nutrition || {};

  const calTarget = nut.calorieTarget || 2000;
  const proteinTarget = nut.proteinTarget || 140;
  const targets = {
    cal: calTarget,
    protein: proteinTarget,
    carbs: Math.round((calTarget * 0.45) / 4),
    fat: Math.round((calTarget * 0.3) / 9),
    steps: 9000,
    sleep: 7,
    active: 45,
  };

  const nLevels = genLevels(archetype, rng, "nutrition");
  const mLevels = genLevels(archetype, rng, "movement");
  const rLevels = genLevels(archetype, rng, "recovery");

  // attendance from real rate
  const rate = typeof c.attendanceRate === "number" ? c.attendanceRate : 75;
  const sess = c.sessions || [];
  const olderIso = sess[1]?.date || assess.date;
  const newerIso = sess[0]?.date || assess.date;
  const recentType = sess[0]?.type || "Strength";
  let att = rate >= 80 ? ["attended", "attended"] : rate >= 55 ? ["attended", "missed"] : ["missed", "missed"];

  // mark missed days on the heat calendar
  const missedDays = [];
  if (att[0] === "missed") missedDays.push(7 + (seed % 5));
  if (att[1] === "missed") missedDays.push(21 + (seed % 5));

  const days = nLevels.map((nLevel, i) => {
    const mLevel = mLevels[i];
    const rLevel = rLevels[i];
    const cal = Math.round(calTarget * (0.35 + nLevel * 0.16));
    const protein = Math.round(proteinTarget * (0.3 + nLevel * 0.18));
    return {
      date: `Jun ${i + 1}`,
      nLevel, mLevel, rLevel,
      composite: Math.round((nLevel + mLevel + rLevel) / 3),
      cal,
      protein,
      carbs: Math.round((cal * 0.45) / 4),
      fat: Math.round((cal * 0.3) / 9),
      meals: MEAL_POOL[nLevel] || [],
      steps: STEPS_BY_LEVEL[mLevel] + (i % 3) * 150,
      active: ACTIVE_BY_LEVEL[mLevel] + (i % 2) * 4,
      sleep: round1(SLEEP_BY_LEVEL[rLevel] + (i % 2) * 0.2),
      bedtime: BEDTIME[rLevel],
      restingHR: 68 - rLevel * 2 + (i % 2),
      session: missedDays.includes(i) ? "missed" : null,
    };
  });

  const defaultDay = missedDays.length ? missedDays[missedDays.length - 1] : 27;

  // progress metrics from real numbers
  const dates = weekLabels(assess.date, 8);
  const buildMetric = (base, cur, unit, label, betterLower, target) => {
    const series = makeSeries(base, cur);
    const last = series[series.length - 1];
    const delta = round1(last - series[0]);
    let good;
    if (typeof target === "number") good = Math.abs(cur - target) < Math.abs(base - target);
    else good = betterLower ? cur <= base : cur >= base;
    return { series, last, delta, unit, label, good };
  };

  const progress = {
    weight: buildMetric(
      assess.bodyweight ?? 180, current.bodyweight ?? assess.bodyweight ?? 180,
      " lb", "Weight", true, goals.targetWeight
    ),
    waist: buildMetric(
      assess.measurements?.waist ?? 34, current.measurements?.waist ?? assess.measurements?.waist ?? 34,
      " in", "Waist", true
    ),
    bodyfat: buildMetric(
      assess.bodyFat ?? 24, current.bodyFat ?? assess.bodyFat ?? 24,
      "%", "Body fat", true, goals.targetBodyFat
    ),
  };
  // annotate weight chart where cumulative change first hits ~5
  const wSeries = progress.weight.series;
  let annotateIdx = null;
  if (Math.abs(progress.weight.delta) >= 5) {
    for (let i = 1; i < wSeries.length; i++) {
      if (Math.abs(wSeries[i] - wSeries[0]) >= 5) { annotateIdx = i; break; }
    }
  }
  progress.weight.annotateIdx = annotateIdx;
  progress.weight.annotateLabel = "First 5 lb";

  // sessions rail
  const attendedCount = att.filter((a) => a === "attended").length;
  const sessions = [
    { date: fmtIso(olderIso), status: att[0] },
    { date: fmtIso(newerIso), status: att[1] },
    { date: addDaysFmt(newerIso, 3), status: "next" },
    { date: addDaysFmt(newerIso, 6), status: "scheduled" },
    { date: addDaysFmt(newerIso, 9), status: "scheduled" },
    { date: addDaysFmt(newerIso, 12), status: "scheduled" },
  ];
  const nextLabel = sessions[2].date;
  const sessionsSub = `${attendedCount} of 2 attended · 4 scheduled · ${recentType}`;

  // measurements
  const meas = [];
  if (assess.bodyweight != null && current.bodyweight != null)
    meas.push(measRow("Weight", "", assess.bodyweight, current.bodyweight, " lb", true, goals.targetWeight));
  if (assess.measurements?.waist != null && current.measurements?.waist != null)
    meas.push(measRow("Waist", "", assess.measurements.waist, current.measurements.waist, " in", true));
  if (assess.bodyFat != null && current.bodyFat != null)
    meas.push(measRow("Body fat", "InBody", assess.bodyFat, current.bodyFat, "%", true, goals.targetBodyFat, " pts"));
  if (assess.leanMass != null && current.leanMass != null)
    meas.push(measRow("Muscle mass", "InBody", assess.leanMass, current.leanMass, " lb", false));

  // benchmarks for opted-out clients (from strength baselines)
  const sb = assess.strengthBaselines || {};
  const bench = [];
  const bnames = { squat: "Back squat", deadlift: "Deadlift", benchPress: "Bench press", overheadPress: "Overhead press" };
  ["squat", "benchPress", "deadlift"].forEach((k, idx) => {
    if (sb[k]) {
      const from = sb[k].weight;
      const gain = 1.18 + (idx * 0.06) + (seed % 5) * 0.01;
      const to = Math.round(from * gain / 5) * 5;
      const pct = Math.round(((to - from) / from) * 100);
      bench.push([bnames[k], `${from} lb`, `${to} lb`, `+${pct}%`]);
    }
  });

  // Milton's read
  const archLine = {
    strong: `${firstName} is dialed in — logging is consistent and sessions are getting done.`,
    weekendGap: `${firstName} logs every weekday but weekends go dark, several weeks running. That gap is the pattern to close.`,
    declining: `${firstName} started strong, but the last two weeks have slipped across nutrition and movement.`,
    improving: `${firstName} was shaky early on, but the trend is up — this past week is the best yet.`,
  }[archetype];
  const read = `${archLine} ${c.insight || c.narrative || ""}`.trim();

  const pillarSummary = {
    all: {
      strong: "All three pillars are holding. Recovery leads, nutrition close behind.",
      weekendGap: "Nutrition carries the score. Weekends drag it. Recovery is steady.",
      declining: "Nutrition and movement both softening. Recovery is the last thing holding.",
      improving: "Every pillar is climbing week over week. Momentum is real.",
    }[archetype],
    nutrition: {
      strong: "Logged nearly every day. Protein consistently near target.",
      weekendGap: "Weekdays strong, weekends unlogged. Several straight weeks.",
      declining: "Was consistent, now trailing off. Dinners increasingly unlogged.",
      improving: "Logging discipline is building. Last week was the most complete yet.",
    }[archetype],
    movement: {
      strong: "Steps near target most days and sessions attended.",
      weekendGap: "Steps flat around 6k. Sessions inconsistent.",
      declining: "Step count sliding and a session slipped. Worth a nudge.",
      improving: "Steps trending up and attendance improving.",
    }[archetype],
    recovery: {
      strong: "Sleep is his anchor — over 7 hours most nights.",
      weekendGap: "Sleep trending up. His best pillar.",
      declining: "Sleep still fine but bedtime creeping later.",
      improving: "Sleep steadily improving alongside everything else.",
    }[archetype],
  };

  const readActions = {
    photos: [
      ["Draft a check-in", `Draft a check-in message to ${firstName} before the next session`],
      ["Nudge on weekends", `Draft a weekend logging nudge for ${firstName}`],
    ],
    none: [
      ["Draft a check-in", `Draft a check-in message to ${firstName} before the next session`],
      ["Request baseline photos", `Ask ${firstName} for baseline photos with the pose guide`],
    ],
    declined: [
      ["Draft a check-in", `Draft a check-in message to ${firstName} before the next session`],
      ["Ask for fresh measurements", `Ask ${firstName} to log measurements this week`],
    ],
  };

  // timeline from real data
  const startLabel = c.startDate || fmtIso(assess.date) || "—";
  const timeline = [];
  if (sess[0]) timeline.push([fmtIso(sess[0].date), "log", `Logged session · ${sess[0].type}`]);
  if (att.includes("missed")) timeline.push([fmtIso(newerIso), "change", `Missed session · ${recentType}`]);
  if (c.narrative) timeline.push([dates[4] || startLabel, "milestone", c.narrative]);
  if (c.coachAngle) timeline.push([dates[3] || startLabel, "note", c.coachAngle]);
  if (c.program) timeline.push([dates[1] || startLabel, "change", `Program assigned · ${c.program}`]);
  timeline.push([startLabel, "milestone", "Baseline measurements captured"]);
  timeline.push([startLabel, "change", "Client onboarded"]);
  const timelineCount = 120 + (seed % 110);

  // days since last measurement (from most recent session)
  const lastMeasDays = 18 + (seed % 40);

  const subLine = [
    (c.clientTypes && c.clientTypes.length ? c.clientTypes.join(" · ") : null),
    goals.primary ? `Goal: ${goals.primary}` : null,
  ].filter(Boolean).join(" · ");

  return {
    name, firstName, initial, subLine,
    program: c.program, startLabel, nextLabel,
    photoState, read, readActions, pillarSummary,
    targets, days, defaultDay,
    progress, dates,
    sessions, sessionsSub,
    meas, bench, timeline, timelineCount, lastMeasDays,
    photoBaseline: dates[0], photoLatest: dates[dates.length - 1],
  };
}

function measRow(metric, src, base, cur, unit, betterLower, target, deltaUnit) {
  const delta = round1(cur - base);
  let good;
  if (typeof target === "number") good = Math.abs(cur - target) < Math.abs(base - target);
  else good = betterLower ? cur <= base : cur >= base;
  const du = deltaUnit || unit;
  return {
    metric, src,
    base: `${round1(base)}${unit}`,
    cur: `${round1(cur)}${unit}`,
    delta: `${delta > 0 ? "+" : ""}${delta}${du}`,
    good,
  };
}

function noteFor(pillar, d, firstName) {
  if (pillar === "all") {
    if (d.session === "missed") return "Missed the scheduled session, and steps stayed low. This was the day to catch.";
    if (d.nLevel === 0) return "Nothing logged and barely any steps synced.";
    if (d.nLevel >= 3 && d.mLevel >= 3) return "Solid day across all three pillars.";
    if (d.nLevel >= 3 && d.mLevel <= 2) return `Nutrition on point. Movement is the soft spot at ${(d.steps / 1000).toFixed(1)}k steps.`;
    return "Partial logging. Enough to see the shape of the day, not the whole picture.";
  }
  if (pillar === "nutrition") {
    if (d.nLevel === 0) return "Nothing logged this day.";
    if (d.nLevel === 1) return "One meal, then nothing. Likely unlogged, not undereaten.";
    if (d.nLevel === 2) return "Two meals logged, one missing. The protein gap is mostly the missing meal.";
    if (d.nLevel === 3) return "Logged the whole day. Protein came in slightly light.";
    return "Hit calories and protein. Textbook day.";
  }
  if (pillar === "movement") {
    if (d.session === "missed") return "Missed the scheduled session, and steps stayed low.";
    if (d.mLevel >= 3) return `${(d.steps / 1000).toFixed(1)}k steps, near target without a session.`;
    if (d.mLevel === 2) return "Steps around 6k. No session scheduled — the unprompted baseline.";
    return "Barely moved. A quiet day worth watching.";
  }
  if (d.rLevel >= 4) return "Best sleep of the month. In bed before 11.";
  if (d.rLevel === 3) return "Over 7 hours and bedtime holding steady.";
  return "Short night, late bedtime is the driver.";
}

/* ---------- presentational components ---------- */
function IconSquare({ icon: Icon, tint, color }) {
  return (
    <div style={{ width: 46, height: 46, borderRadius: 14, background: tint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Icon size={22} color={color} />
    </div>
  );
}

function SectionHeader({ icon, tint, color, title, sub, right }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18, flexWrap: "wrap" }}>
      <IconSquare icon={icon} tint={tint} color={color} />
      <div style={{ flex: 1, minWidth: 160 }}>
        <div style={{ fontSize: 19, fontWeight: 700, color: T.ink }}>{title}</div>
        {sub && <div style={{ fontSize: 13.5, color: T.inkSoft, marginTop: 1 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

function Pill({ children, bg, color }) {
  return (
    <span style={{ background: bg, color, fontSize: 13, fontWeight: 500, borderRadius: 999, padding: "6px 14px", whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

function PrimaryBtn({ children, onClick }) {
  return (
    <button onClick={onClick}
      style={{ fontFamily: FONT, fontSize: 13.5, fontWeight: 500, cursor: "pointer", borderRadius: 999, padding: "10px 18px", border: "none", background: T.tealDeep, color: T.white }}>
      {children}
    </button>
  );
}

function GhostBtn({ children, onClick }) {
  return (
    <button onClick={onClick}
      style={{ fontFamily: FONT, fontSize: 13.5, fontWeight: 500, cursor: "pointer", borderRadius: 999, padding: "9px 16px", border: `1px solid ${T.line}`, background: T.white, color: T.ink, boxShadow: "0 1px 2px rgba(26,46,42,0.04)" }}>
      {children}
    </button>
  );
}

function Segmented({ options, value, onChange }) {
  return (
    <div style={{ display: "flex", background: T.creamTint, borderRadius: 999, padding: 4, gap: 2, flexWrap: "wrap" }}>
      {options.map(([k, label]) => (
        <button key={k} onClick={() => onChange(k)}
          style={{
            fontFamily: FONT, fontSize: 12.5, fontWeight: 500, cursor: "pointer",
            border: "none", borderRadius: 999, padding: "7px 14px",
            background: value === k ? T.tealDeep : "transparent",
            color: value === k ? T.white : T.inkSoft,
          }}>
          {label}
        </button>
      ))}
    </div>
  );
}

function ProgressChart({ metric, series, dates, annotateIdx, annotateLabel }) {
  const s = series;
  const min = Math.min(...s);
  const max = Math.max(...s);
  const span = max - min || 1;
  const lo = min - span * 0.3;
  const hi = max + span * 0.3;
  const X = (i) => 48 + (i * 532) / (s.length - 1);
  const Y = (v) => 16 + ((hi - v) / (hi - lo)) * 128;
  const pts = s.map((v, i) => `${X(i)},${Y(v)}`).join(" ");
  const fmt = (v) => (metric === "weight" ? Math.round(v) : round1(v));
  return (
    <svg viewBox="0 0 600 176" width="100%" role="img" aria-label="Metric trend since baseline">
      {[max, (max + min) / 2, min].map((v, i) => (
        <g key={i}>
          <line x1="48" x2="584" y1={Y(v)} y2={Y(v)} stroke={T.line} strokeWidth="1" />
          <text x="42" y={Y(v) + 4} textAnchor="end" fontSize="11" fill={T.inkFaint} fontFamily={FONT}>{fmt(v)}</text>
        </g>
      ))}
      <polyline points={pts} fill="none" stroke={T.teal} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {s.map((v, i) => (
        <circle key={i} cx={X(i)} cy={Y(v)} r={i === s.length - 1 ? 5 : 3.5} fill={i === s.length - 1 ? T.tealDeep : T.white} stroke={T.teal} strokeWidth="2" />
      ))}
      {metric === "weight" && annotateIdx != null && (
        <g>
          <circle cx={X(annotateIdx)} cy={Y(s[annotateIdx])} r="8" fill="none" stroke={T.mintTx} strokeWidth="1.5" />
          <text x={X(annotateIdx)} y={Y(s[annotateIdx]) - 14} textAnchor="middle" fontSize="11" fill={T.mintTx} fontFamily={FONT} fontWeight="500">{annotateLabel}</text>
        </g>
      )}
      {[0, 3, 7].map((i) => (
        <text key={i} x={X(i)} y="171" textAnchor="middle" fontSize="11" fill={T.inkFaint} fontFamily={FONT}>{dates[i]}</text>
      ))}
    </svg>
  );
}

function Silhouette({ label, date }) {
  return (
    <div>
      <div style={{ aspectRatio: "3/4", background: T.cream, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <User size={56} color={T.inkFaint} strokeWidth={1.25} />
      </div>
      <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: T.tealDark }}>{label}</span>
        <span style={{ fontSize: 12.5, color: T.inkSoft }}>{date}</span>
      </div>
    </div>
  );
}

function StatTile({ label, value, target, pct }) {
  const barColor = pct >= 80 ? T.teal : pct >= 45 ? "#d4a63c" : T.red;
  return (
    <div style={{ background: T.cream, borderRadius: 16, padding: "14px 16px" }}>
      <div style={{ fontSize: 12.5, color: T.inkSoft, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: T.ink }}>
        {value} {target && <span style={{ fontSize: 13, fontWeight: 400, color: T.inkFaint }}>/ {target}</span>}
      </div>
      {pct != null && (
        <div style={{ height: 5, borderRadius: 3, background: T.line, marginTop: 9 }}>
          <div style={{ width: `${Math.min(100, Math.round(pct))}%`, height: 5, borderRadius: 3, background: barColor }} />
        </div>
      )}
    </div>
  );
}

export default function ClientProfile({ client, onBack, isMobile }) {
  const d = useMemo(() => deriveClient(client), [client]);

  const [photoState, setPhotoState] = useState(d.photoState);
  const [pillar, setPillar] = useState("all");
  const [metric, setMetric] = useState("weight");
  const [selectedDay, setSelectedDay] = useState(d.defaultDay);
  const [mealsOpen, setMealsOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // reset local state when switching clients
  useEffect(() => {
    setPhotoState(d.photoState);
    setSelectedDay(d.defaultDay);
    setPillar("all");
    setMetric("weight");
  }, [d]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => setMealsOpen(false), [selectedDay]);

  const send = (msg) => setToast(msg);
  const day = d.days[selectedDay] || d.days[d.days.length - 1];
  const prog = d.progress[metric];
  const progLast = prog.last;
  const progDelta = prog.delta;

  const gradeLevel = levelFor(day, pillar);
  const zeroLabel = pillar === "movement" || pillar === "recovery" ? "Off plan" : "Nothing logged";
  const pill =
    gradeLevel >= 3 ? ["On plan", T.mintTint, T.mintTx] :
    gradeLevel >= 1 ? ["Partial day", T.amberTint, T.amberTx] :
    [zeroLabel, T.redTint, T.redTx];

  const pad = isMobile ? "20px" : "24px 26px";
  const card = { ...cardBase, padding: pad };

  return (
    <div style={{ fontFamily: FONT, background: T.cream, minHeight: "100vh", color: T.ink }}>
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: isMobile ? "16px 16px" : "20px 32px", flexWrap: "wrap", gap: 12 }}>
        <div onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 8, color: T.inkSoft, fontSize: 15, cursor: "pointer", fontWeight: 500 }}>
          <ChevronLeft size={18} /> Back to Dashboard
        </div>
      </div>

      <div style={{ maxWidth: 880, margin: "0 auto", padding: isMobile ? "0 16px 64px" : "0 32px 64px", display: "grid", gap: 16 }}>

        {/* Client header */}
        <div style={{ ...card, display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 74, height: 74, borderRadius: "50%", background: T.teal, color: T.white, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, fontWeight: 700, flexShrink: 0 }}>{d.initial}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: isMobile ? 24 : 30, fontWeight: 700, lineHeight: 1.15, color: T.ink }}>{d.name}</div>
            <div style={{ fontSize: 14, color: T.inkSoft, marginTop: 3 }}>{d.subLine}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
              {d.program && <Pill bg={T.tealTint} color={T.tealDark}>{d.program}</Pill>}
              <Pill bg={T.creamTint} color={T.inkSoft}>Next: {d.nextLabel}</Pill>
              <Pill bg={T.creamTint} color={T.inkSoft}>Client since {d.startLabel}</Pill>
              {photoState === "declined" && <Pill bg={T.amberTint} color={T.amberTx}>Photos off</Pill>}
            </div>
          </div>
        </div>

        {/* Milton's read */}
        <div style={{ ...card, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -46, right: -46, width: 150, height: 150, borderRadius: "50%", background: "rgba(58,175,169,0.10)" }} />
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start", position: "relative" }}>
            <IconSquare icon={Sparkles} tint={T.tealTint} color={T.tealDark} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 19, fontWeight: 700, color: T.ink, marginBottom: 6 }}>Milton&apos;s read</div>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: T.inkSoft }}>{d.read}</p>
              <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                {d.readActions[photoState].map(([label, msg]) => (
                  <GhostBtn key={label} onClick={() => send(msg)}>{label}</GhostBtn>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div style={card}>
          <SectionHeader
            icon={TrendingUp} tint={T.tealTint} color={T.tealDark}
            title="Progress" sub={`Since baseline · ${d.dates[0]}`}
            right={<Segmented options={Object.entries(d.progress).map(([k, v]) => [k, v.label])} value={metric} onChange={setMetric} />}
          />
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
            <span style={{ fontSize: 30, fontWeight: 700, color: T.ink }}>{progLast}{prog.unit}</span>
            <Pill bg={prog.good ? T.mintTint : T.amberTint} color={prog.good ? T.mintTx : T.amberTx}>
              {progDelta > 0 ? "+" : ""}{progDelta}{prog.unit} since {d.dates[0]}
            </Pill>
          </div>
          <ProgressChart metric={metric} series={prog.series} dates={d.dates} annotateIdx={prog.annotateIdx} annotateLabel={prog.annotateLabel} />
          <p style={{ margin: "10px 0 0", fontSize: 14, color: T.inkSoft, lineHeight: 1.55, display: "flex", gap: 8 }}>
            <Sparkles size={15} color={T.tealDark} style={{ flexShrink: 0, marginTop: 2 }} /> {progDelta === 0 ? "Holding flat since baseline." : `${prog.good ? "Trending toward goal" : "Moving away from goal"} — ${Math.abs(progDelta)}${prog.unit} change since ${d.dates[0]}.`}
          </p>
        </div>

        {/* Adherence heat strip */}
        <div style={card}>
          <SectionHeader
            icon={Activity} tint={T.tealTint} color={T.tealDark}
            title="Adherence" sub="Last 28 days · tap a day for details"
            right={<Segmented options={PILLARS.map(([k, label]) => [k, label])} value={pillar} onChange={setPillar} />}
          />
          <div style={{ display: "grid", gridTemplateColumns: "48px repeat(7, 1fr)", gap: 6, alignItems: "center" }}>
            <span />
            {["M", "T", "W", "T", "F", "S", "S"].map((dd, i) => (
              <span key={i} style={{ fontSize: 12, color: T.inkFaint, textAlign: "center", fontWeight: 500 }}>{dd}</span>
            ))}
            {[0, 1, 2, 3].map((w) => (
              <React.Fragment key={w}>
                <span style={{ fontSize: 12, color: T.inkFaint, fontWeight: 500 }}>Jun {w * 7 + 1}</span>
                {[0, 1, 2, 3, 4, 5, 6].map((dd) => {
                  const idx = w * 7 + dd;
                  const level = levelFor(d.days[idx], pillar);
                  const selected = idx === selectedDay;
                  return (
                    <button key={dd} onClick={() => setSelectedDay(idx)}
                      aria-label={`${d.days[idx].date}, ${pillar} adherence level ${level} of 4`}
                      style={{
                        height: 30, borderRadius: 9, cursor: "pointer", padding: 0, position: "relative",
                        background: level === 0 ? T.cream : HEAT[level],
                        border: selected ? `2px solid ${T.tealDeep}` : level === 0 ? `1px solid ${T.line}` : "1px solid transparent",
                      }}>
                      {d.days[idx].session === "missed" && (pillar === "all" || pillar === "movement") && (
                        <span style={{ position: "absolute", top: 4, right: 5, width: 6, height: 6, borderRadius: "50%", background: T.red }} />
                      )}
                    </button>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, borderTop: `1px solid ${T.line}`, paddingTop: 14, flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: T.inkFaint }}>
              <span>Off plan</span>
              <div style={{ width: 14, height: 14, borderRadius: 4, background: T.cream, border: `1px solid ${T.line}` }} />
              {[1, 2, 3, 4].map((l) => <div key={l} style={{ width: 14, height: 14, borderRadius: 4, background: HEAT[l] }} />)}
              <span>On plan</span>
              <span style={{ marginLeft: 10, display: "inline-flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.red, display: "inline-block" }} /> Missed session
              </span>
            </div>
            <span style={{ fontSize: 13.5, color: T.inkSoft, display: "flex", alignItems: "center", gap: 6 }}>
              <Sparkles size={14} color={T.tealDark} /> {d.pillarSummary[pillar]}
            </span>
          </div>
        </div>

        {/* Day peek */}
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 19, fontWeight: 700, color: T.ink }}>{day.date}</span>
              {day.session === "missed" && <Pill bg={T.redTint} color={T.redTx}>Session missed</Pill>}
            </div>
            <Pill bg={pill[1]} color={pill[2]}>{pill[0]}</Pill>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: 14 }}>
            {pillar === "all" && (<>
              <StatTile label="Calories" value={day.cal.toLocaleString()} target={d.targets.cal.toLocaleString()} pct={(day.cal / d.targets.cal) * 100} />
              <StatTile label="Protein" value={`${day.protein}g`} target={`${d.targets.protein}g`} pct={(day.protein / d.targets.protein) * 100} />
              <StatTile label="Steps" value={day.steps.toLocaleString()} target={d.targets.steps.toLocaleString()} pct={(day.steps / d.targets.steps) * 100} />
              <StatTile label="Sleep" value={`${day.sleep}h`} target={`${d.targets.sleep}h`} pct={(day.sleep / d.targets.sleep) * 100} />
            </>)}
            {pillar === "nutrition" && (<>
              <StatTile label="Calories" value={day.cal.toLocaleString()} target={d.targets.cal.toLocaleString()} pct={(day.cal / d.targets.cal) * 100} />
              <StatTile label="Protein" value={`${day.protein}g`} target={`${d.targets.protein}g`} pct={(day.protein / d.targets.protein) * 100} />
              <StatTile label="Carbs" value={`${day.carbs}g`} target={`${d.targets.carbs}g`} pct={(day.carbs / d.targets.carbs) * 100} />
              <StatTile label="Fat" value={`${day.fat}g`} target={`${d.targets.fat}g`} pct={(day.fat / d.targets.fat) * 100} />
            </>)}
            {pillar === "movement" && (<>
              <StatTile label="Steps" value={day.steps.toLocaleString()} target={d.targets.steps.toLocaleString()} pct={(day.steps / d.targets.steps) * 100} />
              <StatTile label="Active minutes" value={day.active} target={d.targets.active} pct={(day.active / d.targets.active) * 100} />
              <StatTile label="Session" value={day.session === "missed" ? "Missed" : "Rest day"} />
            </>)}
            {pillar === "recovery" && (<>
              <StatTile label="Sleep" value={`${day.sleep}h`} target={`${d.targets.sleep}h`} pct={(day.sleep / d.targets.sleep) * 100} />
              <StatTile label="Bedtime" value={day.bedtime} />
              <StatTile label="Resting HR" value={`${day.restingHR} bpm`} />
            </>)}
          </div>
          <p style={{ margin: "0 0 12px", fontSize: 14, color: T.inkSoft, lineHeight: 1.55, display: "flex", gap: 8 }}>
            <Sparkles size={15} color={T.tealDark} style={{ flexShrink: 0, marginTop: 2 }} /> {noteFor(pillar, day, d.firstName)}
          </p>
          <div style={{ borderTop: `1px solid ${T.line}`, paddingTop: 14, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 160 }}>
              {(pillar === "all" || pillar === "nutrition") && (day.meals.length > 0 ? (
                <>
                  <button onClick={() => setMealsOpen(!mealsOpen)}
                    style={{ fontFamily: FONT, background: "none", border: "none", cursor: "pointer", fontSize: 13.5, color: T.inkSoft, display: "flex", alignItems: "center", gap: 4, padding: 0, fontWeight: 500 }}>
                    {mealsOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                    {day.meals.length} {day.meals.length === 1 ? "meal" : "meals"}
                  </button>
                  {mealsOpen && (
                    <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
                      {day.meals.map((m) => (
                        <div key={m} style={{ fontSize: 13.5, color: T.inkSoft, background: T.cream, borderRadius: 12, padding: "9px 14px" }}>{m}</div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <span style={{ fontSize: 13.5, color: T.inkFaint }}>No meals logged</span>
              ))}
              {pillar === "movement" && (
                <span style={{ fontSize: 13.5, color: T.inkFaint }}>
                  {day.session === "missed" ? "Session · not attended" : "No session scheduled this day"}
                </span>
              )}
              {pillar === "recovery" && (
                <span style={{ fontSize: 13.5, color: T.inkFaint }}>Synced from Apple Health · last sync 6:12 AM</span>
              )}
            </div>
            {(pillar === "all" || pillar === "movement") && day.session === "missed" && <GhostBtn onClick={() => send(`Draft a reschedule message for the missed ${day.date} session`)}>Reschedule ask</GhostBtn>}
            {(pillar === "all" || pillar === "nutrition") && !day.session && day.nLevel <= 1 && <GhostBtn onClick={() => send(`Draft a weekend logging nudge for ${d.firstName}`)}>Nudge on weekends</GhostBtn>}
          </div>
        </div>

        {/* Sessions rail */}
        <div style={card}>
          <SectionHeader icon={Calendar} tint={T.tealTint} color={T.tealDark} title="Sessions" sub={d.sessionsSub} />
          <div style={{ display: "flex", gap: 8 }}>
            {d.sessions.map((s, i) => (
              <div key={i} style={{
                flex: 1, textAlign: "center", padding: "14px 4px", borderRadius: 16,
                background: T.cream,
                border: s.status === "next" ? `2px solid ${T.teal}` : "1px solid transparent",
              }}>
                <div style={{ fontSize: 12, color: T.inkFaint, marginBottom: 6, fontWeight: 500 }}>{s.date}</div>
                {s.status === "missed" && <X size={16} color={T.red} />}
                {s.status === "attended" && <Check size={16} color={T.green} />}
                {s.status === "next" && <Clock size={16} color={T.tealDark} />}
                {s.status === "scheduled" && <Calendar size={16} color={T.inkFaint} />}
                <div style={{ fontSize: 12, color: T.inkSoft, marginTop: 6 }}>
                  {s.status === "missed" ? "Missed" : s.status === "attended" ? "Done" : s.status === "next" ? "Next" : "Planned"}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress evidence, adaptive */}
        <div style={card}>
          <SectionHeader
            icon={Camera} tint={T.greenTint} color={T.green}
            title={photoState === "declined" ? "Progress markers" : "Progress photos"}
            sub={photoState === "photos" ? `Front pose · ${d.photoBaseline} to ${d.photoLatest}` : photoState === "none" ? "Nothing captured yet" : "Photos are off for this client"}
          />

          {photoState === "photos" && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Silhouette label="Baseline" date={d.photoBaseline} />
                <Silhouette label="Latest" date={d.photoLatest} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${T.line}`, marginTop: 16, paddingTop: 14 }}>
                <div style={{ display: "flex", gap: 6 }}>
                  {[0, 1, 2].map((i) => (
                    <div key={i} style={{ width: 34, height: 44, borderRadius: 8, background: T.cream, border: i === 0 ? `2px solid ${T.teal}` : `1px solid ${T.line}` }} />
                  ))}
                  <div style={{ width: 34, height: 44, borderRadius: 8, background: T.cream, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Plus size={14} color={T.inkFaint} />
                  </div>
                </div>
                <GhostBtn onClick={() => send(`Have Milton request fresh progress photos from ${d.firstName} with the pose guide`)}>Request next set</GhostBtn>
              </div>
            </>
          )}

          {photoState === "none" && (
            <div style={{ border: `1.5px dashed ${T.line}`, borderRadius: 16, padding: "28px 24px", textAlign: "center" }}>
              <div style={{ width: 46, height: 46, borderRadius: 14, background: T.greenTint, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                <Camera size={20} color={T.green} />
              </div>
              <p style={{ margin: "12px auto 4px", fontSize: 15.5, fontWeight: 700, color: T.ink }}>No photos yet</p>
              <p style={{ margin: "0 auto 16px", fontSize: 14, color: T.inkSoft, maxWidth: 380, lineHeight: 1.55 }}>
                Milton can send {d.firstName} a baseline request with the pose guide before the next session. Two minutes on their phone.
              </p>
              <PrimaryBtn onClick={() => send(`Ask ${d.firstName} for baseline photos with the pose guide`)}>Have Milton ask</PrimaryBtn>
              <div style={{ marginTop: 14 }}>
                <button onClick={() => setPhotoState("declined")}
                  style={{ fontFamily: FONT, background: "none", border: "none", cursor: "pointer", fontSize: 13, color: T.inkFaint, textDecoration: "underline" }}>
                  {d.firstName} prefers not to share photos? Turn photos off
                </button>
              </div>
            </div>
          )}

          {photoState === "declined" && (
            <>
              <p style={{ margin: "0 0 14px", fontSize: 14, color: T.inkSoft, lineHeight: 1.55 }}>
                {d.firstName} opted out of photos, so Milton tracks progress through performance and measurements instead. They will never be asked for photos.
              </p>
              {d.bench.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
                  {d.bench.map(([nm, from, to, delta]) => (
                    <div key={nm} style={{ background: T.cream, borderRadius: 16, padding: "14px 16px" }}>
                      <div style={{ fontSize: 12.5, color: T.inkSoft, marginBottom: 6 }}>{nm}</div>
                      <div style={{ fontSize: 17, fontWeight: 700, color: T.ink }}>{from} <span style={{ color: T.inkFaint, fontWeight: 400 }}>&rarr;</span> {to}</div>
                      <div style={{ fontSize: 12.5, fontWeight: 500, color: T.mintTx, marginTop: 4 }}>{delta} since baseline</div>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "flex-end", borderTop: `1px solid ${T.line}`, marginTop: 16, paddingTop: 14, gap: 10, alignItems: "center" }}>
                <button onClick={() => setPhotoState("none")}
                  style={{ fontFamily: FONT, background: "none", border: "none", cursor: "pointer", fontSize: 13, color: T.inkFaint, textDecoration: "underline" }}>
                  Turn photos back on
                </button>
                <GhostBtn onClick={() => send(`Add a new strength benchmark for ${d.firstName}`)}>Add a benchmark</GhostBtn>
              </div>
            </>
          )}
        </div>

        {/* Measurements */}
        <div style={card}>
          <SectionHeader
            icon={Ruler} tint={T.greenTint} color={T.green}
            title="Measurements" sub="Tape and InBody"
            right={<Pill bg={T.amberTint} color={T.amberTx}>Last logged {d.lastMeasDays} days ago</Pill>}
          />
          <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ fontSize: 12.5, color: T.inkFaint, textAlign: "right", fontWeight: 500 }}>
                <th style={{ textAlign: "left", fontWeight: 500, padding: "8px 0" }}>Metric</th>
                <th style={{ fontWeight: 500 }}>Baseline</th>
                <th style={{ fontWeight: 500 }}>Current</th>
                <th style={{ fontWeight: 500 }}>Change</th>
              </tr>
            </thead>
            <tbody>
              {d.meas.map((r) => (
                <tr key={r.metric} style={{ borderTop: `1px solid ${T.line}` }}>
                  <td style={{ padding: "12px 0", color: T.ink, fontWeight: 500 }}>{r.metric}{r.src && <span style={{ fontSize: 12, color: T.inkFaint, marginLeft: 8, fontWeight: 400 }}>{r.src}</span>}</td>
                  <td style={{ textAlign: "right", color: T.inkSoft }}>{r.base}</td>
                  <td style={{ textAlign: "right", fontWeight: 700, color: T.ink }}>{r.cur}</td>
                  <td style={{ textAlign: "right", color: r.good ? T.mintTx : T.inkSoft, fontWeight: 500 }}>{r.delta}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ display: "flex", justifyContent: "flex-end", borderTop: `1px solid ${T.line}`, marginTop: 4, paddingTop: 14 }}>
            <GhostBtn onClick={() => send(`Ask ${d.firstName} to log fresh measurements this week`)}>Ask for new numbers</GhostBtn>
          </div>
        </div>

        {/* Timeline */}
        <div style={card}>
          <SectionHeader
            icon={History} tint={T.tealTint} color={T.tealDark}
            title="Timeline" sub="Everything Milton tracked"
            right={<GhostBtn onClick={() => send(`Add a note to ${d.firstName}'s timeline`)}>Add note</GhostBtn>}
          />
          <div>
            {d.timeline.map(([date, type, text], i) => (
              <div key={i} style={{ display: "flex", gap: 12, padding: "12px 0", borderTop: i ? `1px solid ${T.line}` : "none", alignItems: "flex-start" }}>
                <span style={{ fontSize: 12.5, color: T.inkFaint, width: 54, flexShrink: 0, paddingTop: 3, fontWeight: 500 }}>{date}</span>
                <span style={{ background: TL_BADGE[type][1], color: TL_BADGE[type][2], fontSize: 12, fontWeight: 500, borderRadius: 999, padding: "4px 12px", flexShrink: 0, whiteSpace: "nowrap" }}>{TL_BADGE[type][0]}</span>
                <span style={{ fontSize: 14, color: type === "note" ? T.ink : T.inkSoft, flex: 1, lineHeight: 1.55 }}>{text}</span>
              </div>
            ))}
          </div>
          <div style={{ borderTop: `1px solid ${T.line}`, paddingTop: 14, marginTop: 2 }}>
            <button onClick={() => send(`Show ${d.firstName}'s full timeline`)}
              style={{ fontFamily: FONT, background: "none", border: "none", cursor: "pointer", fontSize: 13.5, color: T.tealDark, padding: 0, fontWeight: 700 }}>
              Show all {d.timelineCount} entries
            </button>
          </div>
        </div>
      </div>

      {/* Toast simulating handoff to the chat rail */}
      {toast && (
        <div style={{ position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)", background: T.tealDeep, color: T.white, borderRadius: 999, padding: "13px 20px", fontSize: 13.5, display: "flex", alignItems: "center", gap: 10, maxWidth: 500, boxShadow: "0 8px 24px rgba(26,46,42,0.25)", zIndex: 1000 }}>
          <Sparkles size={15} color="#5CDB95" />
          <span>Sent to Milton: &quot;{toast}&quot;</span>
          <X size={14} color="rgba(255,255,255,0.65)" style={{ cursor: "pointer" }} onClick={() => setToast(null)} />
        </div>
      )}
    </div>
  );
}
