import { useState } from "react";

const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";
const C = {
  bg: "#ffffff", text: "#111", sub: "#666", muted: "#999",
  border: "#e0e0e0", borderLight: "#f0f0f0", chip: "#f5f5f5",
  done: "#4caf50", dark: "#1a1a1a", red: "#e53935",
};

// Generative payload — AI assembles this at the 90-day milestone
const PROGRESS = {
  client: { firstName: "Sarah" },
  period: { label: "90-Day Progress", start: "Jan 6, 2026", end: "Apr 6, 2026" },

  // AI writes this based on all the data below
  aiSummary: "Sarah, in 90 days you've lost 12.4 lbs while adding lean muscle. Your waist is down 3 inches, your deadlift is up 45 lbs, and you logged 78 out of 90 days of nutrition. This isn't a crash diet result — this is structural change. Your body composition has fundamentally shifted.",

  // Body composition
  body: {
    weight: { before: 168, after: 155.6, unit: "lbs", good: "down" },
    bodyFat: { before: 32, after: 26.4, unit: "%", good: "down" },
    leanMass: { before: 114.2, after: 114.6, unit: "lbs", good: "up" },
    bmi: { before: 27.1, after: 25.1, unit: "", good: "down" },
  },

  // Weight trend — weekly averages (actual through week 13)
  weightTrend: [168, 167.2, 166.5, 165.8, 164.9, 164.1, 163.2, 162.0, 161.1, 160.2, 158.8, 157.4, 155.6],
  // Projected trend — AI projects weeks 14–24 based on current rate
  weightProjected: [155.6, 154.2, 152.9, 151.5, 150.2, 149.0, 147.8, 146.7, 145.8, 145.1, 144.6, 144.2],
  goalWeight: 145,

  // Measurements
  measurements: [
    { area: "Waist", before: 34, after: 31, unit: "in" },
    { area: "Hips", before: 42, after: 39.5, unit: "in" },
    { area: "Chest", before: 38, after: 37, unit: "in" },
    { area: "R. Arm", before: 12, after: 12.5, unit: "in" },
    { area: "R. Thigh", before: 24, after: 23, unit: "in" },
  ],

  // Strength gains
  strength: [
    { lift: "Deadlift", before: 135, after: 180, unit: "lbs" },
    { lift: "Squat", before: 115, after: 155, unit: "lbs" },
    { lift: "Bench Press", before: 75, after: 95, unit: "lbs" },
    { lift: "Pull-ups", before: 0, after: 3, unit: "reps" },
  ],

  // Consistency
  consistency: {
    daysLogged: 78,
    totalDays: 90,
    sessionsCompleted: 64,
    sessionsScheduled: 72,
    challengesCompleted: ["28-Day Nutrition Challenge", "Burn Protocol (6 weeks)"],
    currentStreak: 18,
    longestStreak: 32,
  },

  // Milestones the AI detected
  milestones: [
    { day: 14, label: "First full week of meal logging" },
    { day: 28, label: "Completed 28-Day Nutrition Challenge" },
    { day: 35, label: "First unassisted pull-up" },
    { day: 42, label: "Burn Protocol complete — all 54 sessions" },
    { day: 60, label: "Hit 160 lbs — 50% to goal" },
    { day: 78, label: "Deadlift 180 lbs — new PR" },
    { day: 90, label: "90-day milestone — 12.4 lbs lost" },
  ],

  coachNote: "Sarah, I'm genuinely proud of this. You showed up on days you didn't want to, you logged meals when it wasn't convenient, and you trusted the process. The pull-up at Day 35 was the moment I knew this was going to work. Let's talk about what 180 days looks like. — Coach Mike",
};

function StatCard({ label, before, after, unit, good }) {
  const diff = after - before;
  const improved = good === "down" ? diff < 0 : diff > 0;
  const arrow = diff > 0 ? "↑" : diff < 0 ? "↓" : "—";

  return (
    <div style={{
      background: C.chip, borderRadius: 12, padding: "16px 14px",
      border: `1px solid ${C.borderLight}`, textAlign: "center",
    }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: C.muted, fontFamily: FONT, textDecoration: "line-through" }}>{before}</span>
        <svg width="16" height="8" viewBox="0 0 16 8" fill="none"><path d="M0 4H14M11 1L14 4L11 7" stroke={C.muted} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        <span style={{ fontSize: 22, fontWeight: 800, color: C.text, fontFamily: FONT }}>{after}</span>
      </div>
      <div style={{ fontSize: 11, color: C.muted, fontFamily: FONT, marginBottom: 4 }}>{unit}</div>
      <div style={{
        display: "inline-block", padding: "2px 8px", borderRadius: 4,
        fontSize: 11, fontWeight: 700, fontFamily: FONT,
        background: improved ? "#f0faf0" : "#fff3f0",
        color: improved ? C.done : C.red,
      }}>
        {arrow} {Math.abs(diff).toFixed(1)}{unit}
      </div>
    </div>
  );
}

function WeightChart({ actual, projected, goalWeight }) {
  const [activeIdx, setActiveIdx] = useState(null);

  const all = [...actual, ...projected.slice(1)];
  const totalPoints = all.length;

  const padding = { top: 32, right: 52, bottom: 32, left: 36 };
  const W = 420;
  const H = 200;
  const chartW = W - padding.left - padding.right;
  const chartH = H - padding.top - padding.bottom;

  const rawMin = Math.min(...all, goalWeight);
  const rawMax = Math.max(...all);
  const yMin = Math.floor(rawMin - 3);
  const yMax = Math.ceil(rawMax + 2);
  const yRange = yMax - yMin;

  const yTicks = [];
  const yStep = yRange <= 15 ? 3 : yRange <= 25 ? 5 : 10;
  for (let v = Math.ceil(yMin / yStep) * yStep; v <= yMax; v += yStep) yTicks.push(v);

  const toX = (i) => padding.left + (i / (totalPoints - 1)) * chartW;
  const toY = (v) => padding.top + (1 - (v - yMin) / yRange) * chartH;

  const nowIdx = actual.length - 1;
  const endIdx = totalPoints - 1;

  // Actual line path
  const actualPath = actual.map((v, i) => `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(" ");
  // Area under actual
  const actualArea = actualPath + ` L${toX(nowIdx)},${toY(yMin)} L${toX(0)},${toY(yMin)} Z`;
  // Projected line path (starts from last actual point)
  const projPath = projected.map((v, i) => `${i === 0 ? "M" : "L"}${toX(nowIdx + i).toFixed(1)},${toY(v).toFixed(1)}`).join(" ");

  return (
    <div style={{ position: "relative" }}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block", overflow: "visible" }}>
        <defs>
          <linearGradient id="actualAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.dark} stopOpacity="0.07" />
            <stop offset="100%" stopColor={C.dark} stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {/* Grid lines + Y labels */}
        {yTicks.map((v) => (
          <g key={v}>
            <line x1={padding.left} y1={toY(v)} x2={W - padding.right} y2={toY(v)} stroke={C.borderLight} strokeWidth="1" />
            <text x={padding.left - 8} y={toY(v) + 3.5} textAnchor="end" fill={C.muted} fontSize="9.5" fontFamily={FONT} fontWeight="500">{v}</text>
          </g>
        ))}

        {/* Goal weight line */}
        <line x1={padding.left} y1={toY(goalWeight)} x2={W - padding.right} y2={toY(goalWeight)}
          stroke={C.border} strokeWidth="1" strokeDasharray="6 4" opacity="0.5" />
        <text x={W - padding.right + 6} y={toY(goalWeight) + 3.5}
          fill={C.muted} fontSize="9" fontFamily={FONT} fontWeight="500">Goal</text>

        {/* "Now" vertical divider */}
        <line x1={toX(nowIdx)} y1={padding.top - 8} x2={toX(nowIdx)} y2={padding.top + chartH + 4}
          stroke={C.border} strokeWidth="1" strokeDasharray="4 3" />

        {/* Area fill under actual */}
        <path d={actualArea} fill="url(#actualAreaGrad)" />

        {/* Actual line — solid */}
        <path d={actualPath} fill="none" stroke={C.dark} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Projected line — dashed */}
        <path d={projPath} fill="none" stroke={C.dark} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray="8 6" opacity="0.4" />

        {/* Actual data dots — open circles */}
        {actual.map((v, i) => {
          const isFirst = i === 0;
          const isNow = i === nowIdx;
          const isActive = activeIdx === i;
          const showDot = isFirst || isNow || isActive || i % 2 === 0;
          return (
            <g key={`a${i}`}>
              <rect x={toX(i) - 14} y={padding.top - 8} width={28} height={chartH + 16}
                fill="transparent" onMouseEnter={() => setActiveIdx(i)} onMouseLeave={() => setActiveIdx(null)}
                onTouchStart={() => setActiveIdx(i)} onTouchEnd={() => setActiveIdx(null)}
                style={{ cursor: "pointer" }} />
              {showDot && (
                <>
                  {isNow && <circle cx={toX(i)} cy={toY(v)} r="10" fill={C.dark} opacity="0.08" />}
                  <circle cx={toX(i)} cy={toY(v)} r={isNow ? 6 : isFirst ? 4.5 : isActive ? 4.5 : 3}
                    fill={isNow ? C.dark : C.bg}
                    stroke={C.dark} strokeWidth={isNow ? 3 : 2} />
                </>
              )}
            </g>
          );
        })}

        {/* Projected dots — smaller, muted */}
        {projected.slice(1).map((v, i) => {
          const idx = nowIdx + 1 + i;
          const isEnd = i === projected.length - 2;
          return (
            <g key={`p${i}`}>
              {(isEnd || i % 3 === 0) && (
                <circle cx={toX(idx)} cy={toY(v)} r={isEnd ? 5 : 2.5}
                  fill={isEnd ? C.dark : C.bg}
                  stroke={C.dark} strokeWidth={isEnd ? 2 : 1.5}
                  opacity={isEnd ? 0.6 : 0.3} />
              )}
            </g>
          );
        })}

        {/* START callout */}
        <g>
          <rect x={toX(0) - 22} y={toY(actual[0]) - 26} width={44} height={18} rx={6} fill={C.dark} opacity="0.75" />
          <text x={toX(0)} y={toY(actual[0]) - 14} textAnchor="middle" fill="#fff" fontSize="10.5" fontFamily={FONT} fontWeight="700">
            {actual[0]}
          </text>
          <text x={toX(0)} y={padding.top + chartH + 20} textAnchor="middle" fill={C.muted} fontSize="9.5" fontFamily={FONT} fontWeight="600">
            Start
          </text>
        </g>

        {/* NOW callout */}
        <g>
          <rect x={toX(nowIdx) - 30} y={toY(actual[nowIdx]) - 28} width={60} height={20} rx={7} fill={C.dark} />
          <text x={toX(nowIdx)} y={toY(actual[nowIdx]) - 15} textAnchor="middle" fill="#fff" fontSize="11" fontFamily={FONT} fontWeight="700">
            {actual[nowIdx]}lbs
          </text>
          <text x={toX(nowIdx)} y={padding.top + chartH + 20} textAnchor="middle" fill={C.text} fontSize="10" fontFamily={FONT} fontWeight="700">
            Now
          </text>
        </g>

        {/* GOAL callout */}
        <g>
          <rect x={toX(endIdx) - 30} y={toY(projected[projected.length - 1]) + 8} width={60} height={20} rx={7} fill={C.dark} opacity="0.6" />
          <text x={toX(endIdx)} y={toY(projected[projected.length - 1]) + 21} textAnchor="middle" fill="#fff" fontSize="11" fontFamily={FONT} fontWeight="700">
            {projected[projected.length - 1]}lbs
          </text>
          <text x={toX(endIdx)} y={padding.top + chartH + 20} textAnchor="middle" fill={C.muted} fontSize="9.5" fontFamily={FONT} fontWeight="500">
            W{totalPoints}
          </text>
        </g>

        {/* Active tooltip */}
        {activeIdx !== null && activeIdx !== 0 && activeIdx !== nowIdx && (
          <g>
            <rect x={toX(activeIdx) - 20} y={toY(actual[activeIdx]) - 24} width={40} height={16} rx={5} fill={C.dark} />
            <text x={toX(activeIdx)} y={toY(actual[activeIdx]) - 13} textAnchor="middle" fill="#fff" fontSize="10" fontFamily={FONT} fontWeight="700">
              {actual[activeIdx]}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

export default function ProgressDashboard({ config = {} }) {
  const d = PROGRESS;
  const [showAllMilestones, setShowAllMilestones] = useState(false);
  const visibleMilestones = showAllMilestones ? d.milestones : d.milestones.slice(-4);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: FONT, maxWidth: 480, margin: "0 auto" }}>
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes countUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing:border-box; margin:0; padding:0; }
      `}</style>

      {/* ---- HERO ---- */}
      <div style={{
        padding: "52px 20px 28px",
        background: C.dark, color: "#fff",
        animation: "fadeIn 0.6s ease",
      }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
          {d.period.label}
        </div>
        <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.1, marginBottom: 2 }}>
          {d.client.firstName}'s
        </div>
        <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.1, marginBottom: 8 }}>
          Transformation
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
          {d.period.start} → {d.period.end}
        </div>

        {/* Hero stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 24 }}>
          {[
            { val: `${Math.abs(d.body.weight.before - d.body.weight.after).toFixed(1)}`, label: "lbs lost", suffix: "" },
            { val: `${Math.abs(d.body.bodyFat.before - d.body.bodyFat.after).toFixed(1)}`, label: "% body fat", suffix: "↓" },
            { val: `${d.consistency.sessionsCompleted}`, label: "sessions", suffix: "" },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center", animation: `countUp 0.5s ease ${0.2 + i * 0.15}s both` }}>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{s.val}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ---- AI SUMMARY ---- */}
      <div style={{
        margin: "20px 20px 16px", animation: "slideUp 0.5s ease 0.2s both",
      }}>
        <div style={{
          fontSize: 14, color: C.text, lineHeight: 1.7, fontFamily: FONT,
          borderLeft: `3px solid ${C.dark}`, paddingLeft: 16,
        }}>
          {d.aiSummary}
        </div>
      </div>

      {/* ---- WEIGHT TREND ---- */}
      <div style={{
        margin: "0 20px 16px", borderRadius: 14, padding: "18px 14px 12px",
        background: C.chip, border: `1px solid ${C.borderLight}`,
        animation: "slideUp 0.5s ease 0.3s both",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4, padding: "0 4px" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Weight Trend</div>
          <div style={{ fontSize: 12, color: C.done, fontWeight: 600 }}>↓ {(d.body.weight.before - d.body.weight.after).toFixed(1)} lbs</div>
        </div>
        <div style={{ fontSize: 11, color: C.muted, marginBottom: 8, padding: "0 4px" }}>
          Weekly averages · {d.body.weight.before} → {d.body.weight.after} lbs
        </div>
        <WeightChart actual={d.weightTrend} projected={d.weightProjected} goalWeight={d.goalWeight} />
      </div>

      {/* ---- BODY COMPOSITION ---- */}
      <div style={{
        margin: "0 20px 16px",
        animation: "slideUp 0.5s ease 0.35s both",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Body Composition
          </div>
          <div style={{ display: "flex", gap: 10, fontSize: 10, color: C.muted }}>
            <span style={{ display: "flex", alignItems: "center", gap: 3 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: C.border, display: "inline-block" }} />Before</span>
            <span style={{ display: "flex", alignItems: "center", gap: 3 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: C.dark, display: "inline-block" }} />Now</span>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {Object.entries(d.body).map(([key, val]) => {
            const label = key === "bodyFat" ? "Body Fat" : key === "leanMass" ? "Lean Mass" : key === "bmi" ? "BMI" : "Weight";
            const diff = val.after - val.before;
            const improved = val.good === "down" ? diff < 0 : diff > 0;
            const maxVal = Math.max(val.before, val.after);
            const barH = 64;
            const beforeH = (val.before / maxVal) * barH;
            const afterH = (val.after / maxVal) * barH;

            return (
              <div key={key} style={{
                background: C.chip, borderRadius: 12, padding: "14px 16px 12px",
                border: `1px solid ${C.borderLight}`, textAlign: "center",
              }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                  {label}
                </div>

                {/* Numbers row */}
                <div style={{ display: "flex", justifyContent: "center", alignItems: "baseline", gap: 6, marginBottom: 10 }}>
                  <span style={{ fontSize: 13, color: C.muted, fontFamily: FONT, textDecoration: "line-through", fontWeight: 500 }}>{val.before}</span>
                  <span style={{ fontSize: 22, fontWeight: 800, color: C.text, fontFamily: FONT }}>{val.after}</span>
                  <span style={{ fontSize: 10, color: C.muted, fontFamily: FONT }}>{val.unit}</span>
                </div>

                {/* Vertical bars */}
                <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 12, height: barH, marginBottom: 10 }}>
                  <div style={{
                    width: 32, borderRadius: "6px 6px 4px 4px",
                    height: beforeH, background: C.border,
                    transition: "height 0.5s ease",
                  }} />
                  <div style={{
                    width: 32, borderRadius: "6px 6px 4px 4px",
                    height: afterH, background: C.dark,
                    transition: "height 0.5s ease 0.1s",
                  }} />
                </div>

                {/* Delta */}
                <div style={{
                  display: "inline-block", padding: "3px 10px", borderRadius: 5,
                  fontSize: 12, fontWeight: 700, fontFamily: FONT,
                  background: improved ? "#f0faf0" : "#fff3f0",
                  color: improved ? C.done : C.red,
                }}>
                  {diff > 0 ? "+" : ""}{diff.toFixed(1)}{val.unit}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ---- MEASUREMENTS ---- */}
      <div style={{
        margin: "0 20px 16px",
        animation: "slideUp 0.5s ease 0.4s both",
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
          Measurements
        </div>
        <div style={{
          background: C.chip, borderRadius: 14, padding: "20px 16px 16px",
          border: `1px solid ${C.borderLight}`,
        }}>
          {/* Measurement rows */}
          {d.measurements.map((m, i) => {
            const diff = m.after - m.before;
            return (
              <div key={i} style={{
                display: "flex", alignItems: "center", padding: "10px 4px",
                borderTop: `1px solid ${C.borderLight}`,
              }}>
                <div style={{ width: 72, fontSize: 13, fontWeight: 600, color: C.text, fontFamily: FONT }}>{m.area}</div>
                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 12, color: C.muted, fontFamily: FONT }}>{m.before}"</span>
                  <svg width="16" height="6" viewBox="0 0 16 6" fill="none"><path d="M0 3H14M11 0.5L14 3L11 5.5" stroke={C.border} strokeWidth="1" strokeLinecap="round"/></svg>
                  <span style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: FONT }}>{m.after}"</span>
                </div>
                <div style={{
                  fontSize: 12, fontWeight: 700,
                  color: diff < 0 ? C.done : diff > 0 ? C.dark : C.muted,
                  fontFamily: FONT,
                }}>
                  {diff > 0 ? "+" : ""}{diff.toFixed(1)}"
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ---- STRENGTH GAINS ---- */}
      <div style={{
        margin: "0 20px 16px", borderRadius: 14, padding: "20px",
        background: C.dark, color: "#fff",
        animation: "slideUp 0.5s ease 0.45s both",
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 14 }}>
          Strength Gains
        </div>
        {d.strength.map((s, i) => {
          const gain = s.after - s.before;
          const pct = s.before > 0 ? Math.round((gain / s.before) * 100) : 100;
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 0",
              borderBottom: i < d.strength.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{s.lift}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
                  {s.before} → {s.after} {s.unit}
                </div>
              </div>
              <div style={{
                padding: "4px 10px", borderRadius: 6,
                background: "rgba(255,255,255,0.1)",
                fontSize: 14, fontWeight: 800,
              }}>
                +{gain} {s.unit}
              </div>
              <div style={{
                fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", width: 40, textAlign: "right",
              }}>
                +{pct}%
              </div>
            </div>
          );
        })}
      </div>

      {/* ---- CONSISTENCY ---- */}
      <div style={{
        margin: "0 20px 16px",
        animation: "slideUp 0.5s ease 0.5s both",
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
          Consistency
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
          {[
            { val: `${d.consistency.daysLogged}/${d.consistency.totalDays}`, label: "Days Logged" },
            { val: `${d.consistency.sessionsCompleted}/${d.consistency.sessionsScheduled}`, label: "Sessions" },
            { val: `${d.consistency.longestStreak} days`, label: "Best Streak" },
          ].map((s) => (
            <div key={s.label} style={{
              background: C.chip, borderRadius: 10, padding: "14px 10px", textAlign: "center",
              border: `1px solid ${C.borderLight}`,
            }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>{s.val}</div>
              <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* 90-day grid */}
        <div style={{
          background: C.chip, borderRadius: 12, padding: "14px",
          border: `1px solid ${C.borderLight}`,
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.sub, marginBottom: 8 }}>90-Day Activity</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            {Array.from({ length: 90 }).map((_, i) => {
              const logged = i < d.consistency.daysLogged + (90 - d.consistency.totalDays);
              // Simulate some missed days
              const missed = [8, 15, 23, 34, 45, 52, 58, 66, 71, 74, 80, 85].includes(i);
              return (
                <div key={i} style={{
                  width: "calc((100% - 26px) / 14)", aspectRatio: "1", borderRadius: 2,
                  background: missed ? C.borderLight : i < 78 ? C.dark : i < 90 ? C.borderLight : C.borderLight,
                  opacity: missed ? 0.4 : i < 78 ? 0.2 + (i / 90) * 0.8 : 0.15,
                }} />
              );
            })}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 10, color: C.muted }}>
            <span>Day 1</span><span>Day 90</span>
          </div>
        </div>
      </div>

      {/* ---- MILESTONES TIMELINE ---- */}
      <div style={{
        margin: "0 20px 16px",
        animation: "slideUp 0.5s ease 0.55s both",
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
          Milestones
        </div>
        <div style={{ position: "relative", paddingLeft: 20 }}>
          {/* Vertical line */}
          <div style={{
            position: "absolute", left: 5, top: 4, bottom: 4, width: 2,
            background: C.borderLight, borderRadius: 1,
          }} />

          {visibleMilestones.map((m, i) => (
            <div key={i} style={{ display: "flex", gap: 14, marginBottom: 14, position: "relative" }}>
              <div style={{
                position: "absolute", left: -16, top: 4,
                width: 12, height: 12, borderRadius: 6,
                background: i === visibleMilestones.length - 1 ? C.dark : C.bg,
                border: `2px solid ${i === visibleMilestones.length - 1 ? C.dark : C.border}`,
              }} />
              <div>
                <div style={{ fontSize: 10, fontWeight: 600, color: C.muted, fontFamily: FONT, marginBottom: 2 }}>Day {m.day}</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: C.text, fontFamily: FONT, lineHeight: 1.4 }}>{m.label}</div>
              </div>
            </div>
          ))}

          {!showAllMilestones && d.milestones.length > 4 && (
            <button onClick={() => setShowAllMilestones(true)} style={{
              background: "none", border: "none", color: C.sub, fontSize: 12,
              fontWeight: 600, cursor: "pointer", fontFamily: FONT, textDecoration: "underline",
              paddingLeft: 0,
            }}>Show all {d.milestones.length} milestones</button>
          )}
        </div>
      </div>

      {/* ---- COACH NOTE ---- */}
      <div style={{
        margin: "0 20px 16px", borderRadius: 14, padding: "20px",
        background: C.dark, color: "#fff",
        animation: "slideUp 0.5s ease 0.6s both",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 3H14V11H6L2 14V3Z" stroke="rgba(255,255,255,0.4)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.05em" }}>From Your Coach</span>
        </div>
        <div style={{ fontSize: 14, lineHeight: 1.7, color: "rgba(255,255,255,0.85)", fontStyle: "italic" }}>
          {d.coachNote}
        </div>
      </div>

      {/* ---- SHARE / NEXT ---- */}
      <div style={{
        padding: "0 20px 16px",
        animation: "slideUp 0.5s ease 0.65s both",
      }}>
        <button style={{
          width: "100%", padding: "16px", borderRadius: 14, border: "none",
          background: C.dark, color: "#fff", fontSize: 15, fontWeight: 700,
          fontFamily: FONT, cursor: "pointer", marginBottom: 8,
        }}>
          Share My Progress
        </button>
        <button style={{
          width: "100%", padding: "14px", borderRadius: 14, border: `1px solid ${C.border}`,
          background: C.bg, color: C.sub, fontSize: 14, fontWeight: 600,
          fontFamily: FONT, cursor: "pointer",
        }}>
          What's Next? → Plan My Next 90 Days
        </button>
      </div>

      <div style={{
        textAlign: "center", padding: "16px 20px 48px",
        fontSize: 10, color: "rgba(0,0,0,0.12)", fontFamily: FONT,
      }}>
        Generated April 6, 2026 · 90-Day Milestone
      </div>
    </div>
  );
}
