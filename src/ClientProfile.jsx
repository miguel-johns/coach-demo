import React, { useState, useEffect } from "react";
import {
  ChevronLeft, Sparkles, Camera, User, Plus, X, Clock,
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

const TARGETS = { cal: 2200, protein: 140, carbs: 250, fat: 75, steps: 9000, sleep: 7, active: 45 };

const NUTRITION = [
  [4, 4, 3, 4, 2, 0, 0],
  [4, 3, 4, 4, 3, 1, 0],
  [4, 4, 3, 4, 2, 1, 0],
  [4, 4, 3, 4, 3, 2, 1],
].flat();

const MOVEMENT = [
  [2, 3, 2, 2, 2, 1, 1],
  [3, 2, 2, 3, 2, 1, 1],
  [2, 3, 2, 2, 2, 1, 0],
  [2, 2, 0, 2, 2, 1, 1],
].flat();

const RECOVERY = [
  [2, 2, 3, 2, 2, 3, 2],
  [3, 2, 3, 3, 2, 3, 3],
  [3, 3, 3, 3, 4, 3, 3],
  [3, 4, 3, 4, 3, 4, 4],
].flat();

const NUTRITION_META = {
  4: { cal: 2140, protein: 136, meals: ["Eggs and oats · 520 cal", "Chicken bowl · 780 cal", "Steak, rice, veg · 840 cal"] },
  3: { cal: 1910, protein: 112, meals: ["Breakfast tacos · 390 cal", "Turkey sandwich · 610 cal", "Pasta dinner · 910 cal"] },
  2: { cal: 1480, protein: 88, meals: ["Protein shake · 320 cal", "Chipotle bowl · 1,160 cal"] },
  1: { cal: 390, protein: 20, meals: ["Breakfast tacos · 390 cal"] },
  0: { cal: 0, protein: 0, meals: [] },
};

const STEPS_BY_LEVEL = [1500, 3800, 6200, 8600, 9800];
const SLEEP_BY_LEVEL = [4.8, 5.6, 6.4, 7.2, 7.8];
const BEDTIME = ["1:30 AM", "12:40 AM", "12:05 AM", "11:15 PM", "10:45 PM"];
const ACTIVE_BY_LEVEL = [0, 10, 22, 38, 52];
const SESSION_DAYS = { 23: "missed" };

const NOTES = {
  all: (d) => {
    if (d.session === "missed") return "Missed his scheduled session, and steps stayed low. This was the day to catch.";
    if (d.nLevel === 0) return "Nothing logged and barely any steps synced. Weekend gap, fourth week in a row.";
    if (d.nLevel === 1) return "One breakfast, then nothing. Matches his weekend pattern. Likely unlogged, not undereaten.";
    if (d.nLevel >= 3 && d.mLevel <= 2) return `Nutrition on point. Movement is the soft spot at ${(d.steps / 1000).toFixed(1)}k steps.`;
    if (d.nLevel >= 3 && d.mLevel >= 3) return "Solid day across all three pillars.";
    return "Partial logging. Enough to see the shape of the day, not the whole picture.";
  },
  nutrition: (d) => {
    if (d.nLevel === 0) return "Nothing logged. Weekend gap, fourth week in a row.";
    if (d.nLevel === 1) return "One breakfast, then nothing. Matches his weekend pattern. Likely unlogged, not undereaten.";
    if (d.nLevel === 2) return "Two meals logged, dinner missing. The protein gap is mostly the missing meal.";
    if (d.nLevel === 3) return "Logged the whole day. Protein came in light, macros otherwise fine.";
    return "Hit calories and protein. Textbook day.";
  },
  movement: (d) => {
    if (d.session === "missed") return "Missed his scheduled Strength session, and steps stayed low. This was the day to catch.";
    if (d.mLevel >= 3) return `${(d.steps / 1000).toFixed(1)}k steps, near target without a session. His good days are walk-driven.`;
    if (d.mLevel === 2) return "Steps around 6k. No session scheduled, so this is his unprompted baseline.";
    return "Barely moved. Weekend inactivity mirrors the logging gap. A pattern, not a fluke.";
  },
  recovery: (d) => {
    if (d.rLevel >= 4) return "Best sleep of the month. In bed before 11.";
    if (d.rLevel === 3) return "Over 7 hours and bedtime holding steady. Recovery is his quiet win.";
    return "Short night, late bedtime is the driver. Worth watching, not worth a message yet.";
  },
};

const DAYS = NUTRITION.map((nLevel, i) => {
  const mLevel = MOVEMENT[i];
  const rLevel = RECOVERY[i];
  const n = NUTRITION_META[nLevel];
  const wiggle = nLevel >= 2 ? (i % 3) * 40 : 0;
  const cal = n.cal + wiggle;
  return {
    date: `Jun ${i + 1}`,
    nLevel, mLevel, rLevel,
    composite: Math.round((nLevel + mLevel + rLevel) / 3),
    cal,
    protein: n.protein + (nLevel >= 2 ? (i % 2) * 6 : 0),
    carbs: Math.round((cal * 0.45) / 4),
    fat: Math.round((cal * 0.3) / 9),
    meals: n.meals,
    steps: STEPS_BY_LEVEL[mLevel] + (i % 3) * 150,
    active: ACTIVE_BY_LEVEL[mLevel] + (i % 2) * 4,
    sleep: +(SLEEP_BY_LEVEL[rLevel] + (i % 2) * 0.2).toFixed(1),
    bedtime: BEDTIME[rLevel],
    restingHR: 68 - rLevel * 2 + (i % 2),
    session: SESSION_DAYS[i] || null,
  };
});

const PILLARS = [
  ["all", "All", "Nutrition carries the score. Movement drags it. Recovery is quietly improving."],
  ["nutrition", "Nutrition", "Weekdays strong, weekends unlogged. Four straight weeks."],
  ["movement", "Movement", "Steps flat around 6k. Zero sessions attended."],
  ["recovery", "Recovery", "Sleep trending up. His best pillar."],
];

const levelFor = (day, pillar) =>
  pillar === "nutrition" ? day.nLevel :
  pillar === "movement" ? day.mLevel :
  pillar === "recovery" ? day.rLevel : day.composite;

const SESSIONS = [
  { date: "Jun 24", status: "missed" },
  { date: "Jun 29", status: "missed" },
  { date: "Jul 5", status: "next" },
  { date: "Jul 7", status: "scheduled" },
  { date: "Jul 9", status: "scheduled" },
  { date: "Jul 12", status: "scheduled" },
];

const PROGRESS = {
  weight: { label: "Weight", unit: " lb", series: [212, 210.5, 209, 207.5, 206.5, 206.4, 206.1, 206] },
  waist: { label: "Waist", unit: " in", series: [40.5, 40.2, 39.9, 39.6, 39.3, 39.1, 39, 39] },
  bodyfat: { label: "Body fat", unit: "%", series: [28.2, 27.9, 27.6, 27.3, 27.1, 27, 26.9, 26.9] },
};
const PROGRESS_DATES = ["May 14", "May 21", "May 28", "Jun 4", "Jun 11", "Jun 18", "Jun 25", "Jul 1"];
const PROGRESS_NOTES = {
  weight: "Down 6 lb since May, then flat for three weeks. The adherence below is why.",
  waist: "Down 1.5 in. Stalled alongside the weight the last two weeks.",
  bodyfat: "Down 1.3 points while muscle held. The early loss was fat, not lean mass.",
};

const TIMELINE = [
  ["Jul 1", "log", "Logged breakfast · 390 cal"],
  ["Jun 29", "change", "Missed session · Strength, 11:00 PM"],
  ["Jun 24", "change", "Missed session · Strength, 11:00 PM"],
  ["Jun 18", "milestone", "First 5 lb lost · 212 to 206.5"],
  ["Jun 12", "note", "Knee felt tight on squats. Keeping loads moderate for two weeks."],
  ["Jun 5", "change", "Program assigned · Full Body Starter Block"],
  ["May 22", "milestone", "Baseline measurements and photos captured"],
  ["May 14", "change", "Client onboarded"],
];
const TL_BADGE = {
  milestone: ["Milestone", T.mintTint, T.mintTx],
  change: ["Change", T.creamTint, T.inkSoft],
  log: ["Log", T.creamTint, T.inkSoft],
  note: ["Coach note", T.tealTint, T.tealDark],
};

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

function ProgressChart({ metric }) {
  const m = PROGRESS[metric];
  const s = m.series;
  const min = Math.min(...s);
  const max = Math.max(...s);
  const span = max - min || 1;
  const lo = min - span * 0.3;
  const hi = max + span * 0.3;
  const X = (i) => 48 + (i * 532) / (s.length - 1);
  const Y = (v) => 16 + ((hi - v) / (hi - lo)) * 128;
  const pts = s.map((v, i) => `${X(i)},${Y(v)}`).join(" ");
  const fmt = (v) => (metric === "weight" ? Math.round(v) : +v.toFixed(1));
  return (
    <svg viewBox="0 0 600 176" width="100%" role="img" aria-label={`${m.label} trend since baseline`}>
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
      {metric === "weight" && (
        <g>
          <circle cx={X(4)} cy={Y(s[4])} r="8" fill="none" stroke={T.mintTx} strokeWidth="1.5" />
          <text x={X(4)} y={Y(s[4]) - 14} textAnchor="middle" fontSize="11" fill={T.mintTx} fontFamily={FONT} fontWeight="500">First 5 lb</text>
        </g>
      )}
      {[0, 3, 7].map((i) => (
        <text key={i} x={X(i)} y="171" textAnchor="middle" fontSize="11" fill={T.inkFaint} fontFamily={FONT}>{PROGRESS_DATES[i]}</text>
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
  const [photoState, setPhotoState] = useState("photos");
  const [pillar, setPillar] = useState("all");
  const [metric, setMetric] = useState("weight");
  const [selectedDay, setSelectedDay] = useState(27);
  const [mealsOpen, setMealsOpen] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => setMealsOpen(false), [selectedDay]);

  const send = (msg) => setToast(msg);
  const day = DAYS[selectedDay];
  const pillarMeta = PILLARS.find(([k]) => k === pillar);
  const prog = PROGRESS[metric];
  const progLast = prog.series[prog.series.length - 1];
  const progDelta = +(progLast - prog.series[0]).toFixed(1);

  const gradeLevel = levelFor(day, pillar);
  const zeroLabel = pillar === "movement" || pillar === "recovery" ? "Off plan" : "Nothing logged";
  const pill =
    gradeLevel >= 3 ? ["On plan", T.mintTint, T.mintTx] :
    gradeLevel >= 1 ? ["Partial day", T.amberTint, T.amberTx] :
    [zeroLabel, T.redTint, T.redTx];

  const readActions = {
    photos: [
      ["Draft a check-in", "Draft a check-in message to Pops before Sunday"],
      ["Nudge on weekends", "Draft a weekend logging nudge for Pops"],
    ],
    none: [
      ["Draft a check-in", "Draft a check-in message to Pops before Sunday"],
      ["Request baseline photos", "Ask Pops for baseline photos with the pose guide"],
    ],
    declined: [
      ["Draft a check-in", "Draft a check-in message to Pops before Sunday"],
      ["Ask for fresh measurements", "Ask Pops to log measurements this week"],
    ],
  };

  const pad = isMobile ? "20px" : "24px 26px";
  const card = { ...cardBase, padding: pad };

  return (
    <div style={{ fontFamily: FONT, background: T.cream, minHeight: "100vh", color: T.ink }}>
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: isMobile ? "16px 16px" : "20px 32px", flexWrap: "wrap", gap: 12 }}>
        <div onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 8, color: T.inkSoft, fontSize: 15, cursor: "pointer", fontWeight: 500 }}>
          <ChevronLeft size={18} /> Back to Dashboard
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 12.5, color: T.inkFaint, fontWeight: 500 }}>Photo state</span>
          <Segmented
            options={[["photos", "Has photos"], ["none", "None yet"], ["declined", "Opted out"]]}
            value={photoState}
            onChange={setPhotoState}
          />
        </div>
      </div>

      <div style={{ maxWidth: 880, margin: "0 auto", padding: isMobile ? "0 16px 64px" : "0 32px 64px", display: "grid", gap: 16 }}>

        {/* Client header */}
        <div style={{ ...card, display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 74, height: 74, borderRadius: "50%", background: T.teal, color: T.white, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, fontWeight: 700, flexShrink: 0 }}>P</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: isMobile ? 24 : 30, fontWeight: 700, lineHeight: 1.15, color: T.ink }}>Pops</div>
            <div style={{ fontSize: 14, color: T.inkSoft, marginTop: 3 }}>58 · Male · Goal: lose 20 lb</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
              <Pill bg={T.tealTint} color={T.tealDark}>Full Body Starter Block · Week 1 of 4 · At-Home</Pill>
              <Pill bg={T.creamTint} color={T.inkSoft}>Next: Sun 7/5</Pill>
              <Pill bg={T.creamTint} color={T.inkSoft}>Client since May</Pill>
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
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: T.inkSoft }}>
                Pops logs meals every weekday but weekends go dark, four weeks running. Sleep is climbing, so recovery is fine. Movement is the problem: steps sit at 6k and he has missed both scheduled sessions. His next one is Sunday.
              </p>
              <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                {readActions[photoState].map(([label, msg]) => (
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
            title="Progress" sub="Since baseline · May 14"
            right={<Segmented options={Object.entries(PROGRESS).map(([k, v]) => [k, v.label])} value={metric} onChange={setMetric} />}
          />
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
            <span style={{ fontSize: 30, fontWeight: 700, color: T.ink }}>{progLast}{prog.unit}</span>
            <Pill bg={progDelta <= 0 ? T.mintTint : T.amberTint} color={progDelta <= 0 ? T.mintTx : T.amberTx}>
              {progDelta > 0 ? "+" : ""}{progDelta}{prog.unit} since May 14
            </Pill>
          </div>
          <ProgressChart metric={metric} />
          <p style={{ margin: "10px 0 0", fontSize: 14, color: T.inkSoft, lineHeight: 1.55, display: "flex", gap: 8 }}>
            <Sparkles size={15} color={T.tealDark} style={{ flexShrink: 0, marginTop: 2 }} /> {PROGRESS_NOTES[metric]}
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
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <span key={i} style={{ fontSize: 12, color: T.inkFaint, textAlign: "center", fontWeight: 500 }}>{d}</span>
            ))}
            {[0, 1, 2, 3].map((w) => (
              <React.Fragment key={w}>
                <span style={{ fontSize: 12, color: T.inkFaint, fontWeight: 500 }}>Jun {w * 7 + 1}</span>
                {[0, 1, 2, 3, 4, 5, 6].map((d) => {
                  const idx = w * 7 + d;
                  const level = levelFor(DAYS[idx], pillar);
                  const selected = idx === selectedDay;
                  return (
                    <button key={d} onClick={() => setSelectedDay(idx)}
                      aria-label={`${DAYS[idx].date}, ${pillar} adherence level ${level} of 4`}
                      style={{
                        height: 30, borderRadius: 9, cursor: "pointer", padding: 0, position: "relative",
                        background: level === 0 ? T.cream : HEAT[level],
                        border: selected ? `2px solid ${T.tealDeep}` : level === 0 ? `1px solid ${T.line}` : "1px solid transparent",
                      }}>
                      {DAYS[idx].session === "missed" && (pillar === "all" || pillar === "movement") && (
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
              <Sparkles size={14} color={T.tealDark} /> {pillarMeta[2]}
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
              <StatTile label="Calories" value={day.cal.toLocaleString()} target={TARGETS.cal.toLocaleString()} pct={(day.cal / TARGETS.cal) * 100} />
              <StatTile label="Protein" value={`${day.protein}g`} target={`${TARGETS.protein}g`} pct={(day.protein / TARGETS.protein) * 100} />
              <StatTile label="Steps" value={day.steps.toLocaleString()} target={TARGETS.steps.toLocaleString()} pct={(day.steps / TARGETS.steps) * 100} />
              <StatTile label="Sleep" value={`${day.sleep}h`} target={`${TARGETS.sleep}h`} pct={(day.sleep / TARGETS.sleep) * 100} />
            </>)}
            {pillar === "nutrition" && (<>
              <StatTile label="Calories" value={day.cal.toLocaleString()} target={TARGETS.cal.toLocaleString()} pct={(day.cal / TARGETS.cal) * 100} />
              <StatTile label="Protein" value={`${day.protein}g`} target={`${TARGETS.protein}g`} pct={(day.protein / TARGETS.protein) * 100} />
              <StatTile label="Carbs" value={`${day.carbs}g`} target={`${TARGETS.carbs}g`} pct={(day.carbs / TARGETS.carbs) * 100} />
              <StatTile label="Fat" value={`${day.fat}g`} target={`${TARGETS.fat}g`} pct={(day.fat / TARGETS.fat) * 100} />
            </>)}
            {pillar === "movement" && (<>
              <StatTile label="Steps" value={day.steps.toLocaleString()} target={TARGETS.steps.toLocaleString()} pct={(day.steps / TARGETS.steps) * 100} />
              <StatTile label="Active minutes" value={day.active} target={TARGETS.active} pct={(day.active / TARGETS.active) * 100} />
              <StatTile label="Session" value={day.session === "missed" ? "Missed" : "Rest day"} />
            </>)}
            {pillar === "recovery" && (<>
              <StatTile label="Sleep" value={`${day.sleep}h`} target={`${TARGETS.sleep}h`} pct={(day.sleep / TARGETS.sleep) * 100} />
              <StatTile label="Bedtime" value={day.bedtime} />
              <StatTile label="Resting HR" value={`${day.restingHR} bpm`} />
            </>)}
          </div>
          <p style={{ margin: "0 0 12px", fontSize: 14, color: T.inkSoft, lineHeight: 1.55, display: "flex", gap: 8 }}>
            <Sparkles size={15} color={T.tealDark} style={{ flexShrink: 0, marginTop: 2 }} /> {NOTES[pillar](day)}
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
                  {day.session === "missed" ? "Strength · 11:00 PM · not attended" : "No session scheduled this day"}
                </span>
              )}
              {pillar === "recovery" && (
                <span style={{ fontSize: 13.5, color: T.inkFaint }}>Synced from Apple Health · last sync 6:12 AM</span>
              )}
            </div>
            {(pillar === "all" || pillar === "movement") && day.session === "missed" && <GhostBtn onClick={() => send("Draft a reschedule message for the missed Jun 24 session")}>Reschedule ask</GhostBtn>}
            {(pillar === "all" || pillar === "nutrition") && !day.session && day.nLevel <= 1 && <GhostBtn onClick={() => send("Draft a weekend logging nudge for Pops")}>Nudge on weekends</GhostBtn>}
          </div>
        </div>

        {/* Sessions rail */}
        <div style={card}>
          <SectionHeader icon={Calendar} tint={T.tealTint} color={T.tealDark} title="Sessions" sub="0 of 2 attended · 4 scheduled · all Strength, 11:00 PM" />
          <div style={{ display: "flex", gap: 8 }}>
            {SESSIONS.map((s) => (
              <div key={s.date} style={{
                flex: 1, textAlign: "center", padding: "14px 4px", borderRadius: 16,
                background: T.cream,
                border: s.status === "next" ? `2px solid ${T.teal}` : "1px solid transparent",
              }}>
                <div style={{ fontSize: 12, color: T.inkFaint, marginBottom: 6, fontWeight: 500 }}>{s.date}</div>
                {s.status === "missed" && <X size={16} color={T.red} />}
                {s.status === "next" && <Clock size={16} color={T.tealDark} />}
                {s.status === "scheduled" && <Calendar size={16} color={T.inkFaint} />}
                <div style={{ fontSize: 12, color: T.inkSoft, marginTop: 6 }}>
                  {s.status === "missed" ? "Missed" : s.status === "next" ? "Next" : "Strength"}
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
            sub={photoState === "photos" ? "Front pose · 48 days apart" : photoState === "none" ? "Nothing captured yet" : "Photos are off for this client"}
          />

          {photoState === "photos" && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Silhouette label="Baseline" date="May 14" />
                <Silhouette label="Latest" date="Jul 1" />
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
                <GhostBtn onClick={() => send("Have Milton request August progress photos from Pops with the pose guide")}>Request next set</GhostBtn>
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
                Milton can send Pops a baseline request with the pose guide before Sunday&apos;s session. Two minutes on his phone.
              </p>
              <PrimaryBtn onClick={() => send("Ask Pops for baseline photos with the pose guide")}>Have Milton ask</PrimaryBtn>
              <div style={{ marginTop: 14 }}>
                <button onClick={() => setPhotoState("declined")}
                  style={{ fontFamily: FONT, background: "none", border: "none", cursor: "pointer", fontSize: 13, color: T.inkFaint, textDecoration: "underline" }}>
                  Pops prefers not to share photos? Turn photos off
                </button>
              </div>
            </div>
          )}

          {photoState === "declined" && (
            <>
              <p style={{ margin: "0 0 14px", fontSize: 14, color: T.inkSoft, lineHeight: 1.55 }}>
                Pops opted out of photos, so Milton tracks his progress through performance and measurements instead. He will never be asked for photos.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
                {[
                  ["Goblet squat", "35 lb", "50 lb", "+43%"],
                  ["Push-ups", "8 reps", "15 reps", "+88%"],
                  ["Single-arm row", "65 lb", "85 lb", "+31%"],
                ].map(([name, from, to, delta]) => (
                  <div key={name} style={{ background: T.cream, borderRadius: 16, padding: "14px 16px" }}>
                    <div style={{ fontSize: 12.5, color: T.inkSoft, marginBottom: 6 }}>{name}</div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: T.ink }}>{from} <span style={{ color: T.inkFaint, fontWeight: 400 }}>&rarr;</span> {to}</div>
                    <div style={{ fontSize: 12.5, fontWeight: 500, color: T.mintTx, marginTop: 4 }}>{delta} since baseline</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", borderTop: `1px solid ${T.line}`, marginTop: 16, paddingTop: 14, gap: 10, alignItems: "center" }}>
                <button onClick={() => setPhotoState("none")}
                  style={{ fontFamily: FONT, background: "none", border: "none", cursor: "pointer", fontSize: 13, color: T.inkFaint, textDecoration: "underline" }}>
                  Turn photos back on
                </button>
                <GhostBtn onClick={() => send("Add a new strength benchmark for Pops")}>Add a benchmark</GhostBtn>
              </div>
            </>
          )}
        </div>

        {/* Measurements */}
        <div style={card}>
          <SectionHeader
            icon={Ruler} tint={T.greenTint} color={T.green}
            title="Measurements" sub="Tape and InBody"
            right={<Pill bg={T.amberTint} color={T.amberTx}>Last logged 39 days ago</Pill>}
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
              {[
                ["Weight", "", "212 lb", "206 lb", "-6 lb"],
                ["Waist", "", "40.5 in", "39 in", "-1.5 in"],
                ["Body fat", "InBody", "28.2%", "26.9%", "-1.3 pts"],
                ["Muscle mass", "InBody", "78.1 lb", "78.4 lb", "+0.3 lb"],
              ].map(([m, src, base, cur, delta]) => (
                <tr key={m} style={{ borderTop: `1px solid ${T.line}` }}>
                  <td style={{ padding: "12px 0", color: T.ink, fontWeight: 500 }}>{m}{src && <span style={{ fontSize: 12, color: T.inkFaint, marginLeft: 8, fontWeight: 400 }}>{src}</span>}</td>
                  <td style={{ textAlign: "right", color: T.inkSoft }}>{base}</td>
                  <td style={{ textAlign: "right", fontWeight: 700, color: T.ink }}>{cur}</td>
                  <td style={{ textAlign: "right", color: T.mintTx, fontWeight: 500 }}>{delta}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ display: "flex", justifyContent: "flex-end", borderTop: `1px solid ${T.line}`, marginTop: 4, paddingTop: 14 }}>
            <GhostBtn onClick={() => send("Ask Pops to log fresh measurements this week")}>Ask for new numbers</GhostBtn>
          </div>
        </div>

        {/* Timeline */}
        <div style={card}>
          <SectionHeader
            icon={History} tint={T.tealTint} color={T.tealDark}
            title="Timeline" sub="Everything Milton tracked"
            right={<GhostBtn onClick={() => send("Add a note to Pops' timeline")}>Add note</GhostBtn>}
          />
          <div>
            {TIMELINE.map(([date, type, text], i) => (
              <div key={i} style={{ display: "flex", gap: 12, padding: "12px 0", borderTop: i ? `1px solid ${T.line}` : "none", alignItems: "flex-start" }}>
                <span style={{ fontSize: 12.5, color: T.inkFaint, width: 54, flexShrink: 0, paddingTop: 3, fontWeight: 500 }}>{date}</span>
                <span style={{ background: TL_BADGE[type][1], color: TL_BADGE[type][2], fontSize: 12, fontWeight: 500, borderRadius: 999, padding: "4px 12px", flexShrink: 0, whiteSpace: "nowrap" }}>{TL_BADGE[type][0]}</span>
                <span style={{ fontSize: 14, color: type === "note" ? T.ink : T.inkSoft, flex: 1, lineHeight: 1.55 }}>{text}</span>
              </div>
            ))}
          </div>
          <div style={{ borderTop: `1px solid ${T.line}`, paddingTop: 14, marginTop: 2 }}>
            <button onClick={() => send("Show Pops' full timeline")}
              style={{ fontFamily: FONT, background: "none", border: "none", cursor: "pointer", fontSize: 13.5, color: T.tealDark, padding: 0, fontWeight: 700 }}>
              Show all 214 entries
            </button>
          </div>
        </div>
      </div>

      {/* Toast simulating handoff to the chat rail */}
      {toast && (
        <div style={{ position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)", background: T.tealDeep, color: T.white, borderRadius: 999, padding: "13px 20px", fontSize: 13.5, display: "flex", alignItems: "center", gap: 10, maxWidth: 500, boxShadow: "0 8px 24px rgba(26,46,42,0.25)", zIndex: 1000 }}>
          <Sparkles size={15} color={T.mint || "#5CDB95"} />
          <span>Sent to Milton: &quot;{toast}&quot;</span>
          <X size={14} color="rgba(255,255,255,0.65)" style={{ cursor: "pointer" }} onClick={() => setToast(null)} />
        </div>
      )}
    </div>
  );
}
