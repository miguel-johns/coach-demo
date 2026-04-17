import { useState } from "react";

const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";
const C = {
  bg: "#ffffff", text: "#111", sub: "#666", muted: "#999",
  border: "#e0e0e0", borderLight: "#f0f0f0", chip: "#f5f5f5",
  done: "#4caf50", dark: "#1a1a1a", accent: "#111",
};

// ---- GENERATIVE PAYLOAD ----
const DASHBOARD = {
  generated: "2026-04-08T06:00:12Z",
  client: { firstName: "Sarah", photo: null },
  greeting: "Good morning, Sarah.",
  subGreeting: "Wednesday, April 8 — Week 3 of Burn",
  nudge: "You crushed 8 sessions this week already. One more recovery today and Week 3 is a wrap.",
  schedule: [
    { time: "10:00 AM", label: "Training Session", type: "training", trainer: "Coach Mike", location: "Studio B", status: "upcoming" },
    { time: "4:00 PM", label: "Burn Recovery", type: "recovery", trainer: "Coach Mike", location: "Recovery Room", status: "upcoming" },
  ],
  protocol: {
    name: "Burn", week: 3, totalWeeks: 6, sessionsThisWeek: 8, sessionsGoal: 9,
    totalSessions: 38, totalSessionsGoal: 54, phaseLabel: "Metabolic Conditioning",
    nextMilestone: "Week 3 complete — 1 session away",
  },
  challenge: {
    name: "28-Day Nutrition Challenge", day: 19, totalDays: 28, daysLogged: 17, streak: 5,
    mealsLoggedYesterday: 4, caloriesYesterday: 1820, calTarget: 1900, proteinYesterday: 138, proteinTarget: 140,
  },
  yesterdaySummary: "Yesterday you hit 1,820 cal and 138g protein — just under your targets but solid. Four meals logged. Keep that rhythm going.",
  morningAction: { label: "Log your first meal", sublabel: "Tap to log breakfast or snap a photo", icon: "meal" },
  weekDays: [
    { label: "Mon", logged: true, sessions: 2, cal: 1850 },
    { label: "Tue", logged: true, sessions: 2, cal: 1920 },
    { label: "Wed", logged: false, sessions: 0, cal: 0, isToday: true, scheduledSessions: 2 },
    { label: "Thu", logged: false, sessions: 0, cal: 0, scheduledSessions: 1 },
    { label: "Fri", logged: false, sessions: 0, cal: 0, scheduledSessions: 1 },
    { label: "Sat", logged: false, sessions: 0, cal: 0 },
    { label: "Sun", logged: false, sessions: 0, cal: 0 },
  ],
};

function ProgressRing({ current, goal, size = 56, strokeWidth = 5, color = C.text, trackColor = C.borderLight, children }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(current / goal, 1);
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
          style={{ transition: "stroke-dashoffset 0.6s ease" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {children}
      </div>
    </div>
  );
}

function ScheduleCard({ item }) {
  const icons = {
    training: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8H14M4 5V11M12 5V11M1 7V9M15 7V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    recovery: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2C4.7 2 2 4.7 2 8C2 11.3 4.7 14 8 14C11.3 14 14 11.3 14 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M10 4L14 2L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: C.chip, borderRadius: 12, border: `1px solid ${C.borderLight}` }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: C.dark, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {icons[item.type]}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.text, fontFamily: FONT }}>{item.label}</div>
        <div style={{ fontSize: 12, color: C.muted, fontFamily: FONT, marginTop: 1 }}>{item.trainer} · {item.location}</div>
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: C.text, fontFamily: FONT, flexShrink: 0 }}>{item.time}</div>
    </div>
  );
}

export default function MorningDashboard({ config = {} }) {
  const d = DASHBOARD;
  const [mealLogged, setMealLogged] = useState(false);
  
  // Config-driven values with defaults
  const bodyBg = config.bodyBg || C.bg;
  const cardDarkBg = config.cardDarkBg || C.dark;
  const showSchedule = config.showSchedule !== false;
  const showProtocolCard = config.showProtocolCard !== false;
  const showChallengeCard = config.showChallengeCard !== false;
  const showActionButton = config.showActionButton !== false;
  const showWeekGlance = config.showWeekGlance !== false;
  const protocolCardStyle = config.protocolCardStyle || "dark";

  const protocolWeekPct = d.protocol.sessionsGoal > 0 ? d.protocol.sessionsThisWeek / d.protocol.sessionsGoal : 0;
  const protocolTotalPct = d.protocol.totalSessionsGoal > 0 ? d.protocol.totalSessions / d.protocol.totalSessionsGoal : 0;
  const challengePct = d.challenge.totalDays > 0 ? d.challenge.day / d.challenge.totalDays : 0;

  return (
    <div style={{ minHeight: "100vh", background: bodyBg, fontFamily: FONT, maxWidth: 480, margin: "0 auto" }}>
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing:border-box; margin:0; padding:0; }
      `}</style>

      {/* ---- GREETING ---- */}
      <div style={{ padding: "52px 20px 24px", animation: "fadeIn 0.5s ease" }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: C.text, lineHeight: 1.2, marginBottom: 4 }}>{d.greeting}</div>
        <div style={{ fontSize: 14, color: C.muted, marginBottom: 16 }}>{d.subGreeting}</div>
        <div style={{ fontSize: 14, color: C.sub, lineHeight: 1.6, borderLeft: `3px solid ${C.dark}`, paddingLeft: 14 }}>{d.nudge}</div>
      </div>

      {/* ---- TODAY'S SCHEDULE ---- */}
      {showSchedule && (
      <div style={{ padding: "0 20px", marginBottom: 24, animation: "slideUp 0.5s ease 0.1s both" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Today's Schedule</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {d.schedule.map((s, i) => <ScheduleCard key={i} item={s} />)}
        </div>
      </div>
      )}

      {/* ---- PROTOCOL PROGRESS (BURN) ---- */}
      {showProtocolCard && (
      <div style={{ margin: "0 20px 16px", borderRadius: 14, padding: "20px", background: protocolCardStyle === "dark" ? cardDarkBg : C.chip, color: protocolCardStyle === "dark" ? "#fff" : C.text, animation: "slideUp 0.5s ease 0.2s both" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: protocolCardStyle === "dark" ? "rgba(255,255,255,0.4)" : C.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{d.protocol.name} Protocol</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>Week {d.protocol.week} of {d.protocol.totalWeeks}</div>
            <div style={{ fontSize: 12, color: protocolCardStyle === "dark" ? "rgba(255,255,255,0.5)" : C.muted, marginTop: 2 }}>{d.protocol.phaseLabel}</div>
          </div>
          <ProgressRing current={d.protocol.sessionsThisWeek} goal={d.protocol.sessionsGoal} size={52} strokeWidth={4} color={protocolCardStyle === "dark" ? "#fff" : C.text} trackColor={protocolCardStyle === "dark" ? "rgba(255,255,255,0.12)" : C.borderLight}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{d.protocol.sessionsThisWeek}/{d.protocol.sessionsGoal}</div>
          </ProgressRing>
        </div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: protocolCardStyle === "dark" ? "rgba(255,255,255,0.4)" : C.muted, marginBottom: 6 }}>
            <span>This week</span><span>{d.protocol.nextMilestone}</span>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {Array.from({ length: d.protocol.sessionsGoal }).map((_, i) => (
              <div key={i} style={{ flex: 1, height: 6, borderRadius: 3, background: i < d.protocol.sessionsThisWeek ? (protocolCardStyle === "dark" ? "#fff" : C.text) : (protocolCardStyle === "dark" ? "rgba(255,255,255,0.1)" : C.borderLight), transition: "background 0.3s ease" }} />
            ))}
          </div>
        </div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: protocolCardStyle === "dark" ? "rgba(255,255,255,0.4)" : C.muted, marginBottom: 6 }}>
            <span>Overall</span><span>{d.protocol.totalSessions}/{d.protocol.totalSessionsGoal} sessions</span>
          </div>
          <div style={{ height: 4, background: protocolCardStyle === "dark" ? "rgba(255,255,255,0.08)" : C.borderLight, borderRadius: 2, overflow: "hidden" }}>
            <div style={{ width: `${protocolTotalPct * 100}%`, height: "100%", background: protocolCardStyle === "dark" ? "rgba(255,255,255,0.4)" : C.sub, borderRadius: 2, transition: "width 0.5s ease" }} />
          </div>
        </div>
      </div>
      )}

      {/* ---- NUTRITION CHALLENGE ---- */}
      {showChallengeCard && (
      <div style={{ margin: "0 20px 16px", borderRadius: 14, padding: "20px", background: C.chip, border: `1px solid ${C.borderLight}`, animation: "slideUp 0.5s ease 0.3s both" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Nutrition Challenge</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>Day {d.challenge.day} of {d.challenge.totalDays}</div>
          </div>
          <ProgressRing current={d.challenge.day} goal={d.challenge.totalDays} size={52} strokeWidth={4}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{Math.round(challengePct * 100)}%</div>
          </ProgressRing>
        </div>
        <div style={{ display: "flex", gap: 2, marginBottom: 14 }}>
          {Array.from({ length: d.challenge.totalDays }).map((_, i) => (
            <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < d.challenge.day ? (i < d.challenge.daysLogged ? C.dark : C.border) : C.borderLight }} />
          ))}
        </div>
        <div style={{ fontSize: 13, color: C.sub, lineHeight: 1.6, marginBottom: 14, borderLeft: `3px solid ${C.border}`, paddingLeft: 12 }}>{d.yesterdaySummary}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {[
            { label: "Calories", val: d.challenge.caloriesYesterday, target: d.challenge.calTarget, unit: "" },
            { label: "Protein", val: d.challenge.proteinYesterday, target: d.challenge.proteinTarget, unit: "g" },
            { label: "Streak", val: d.challenge.streak, target: null, unit: " days" },
          ].map((s) => (
            <div key={s.label} style={{ background: C.bg, borderRadius: 8, padding: "10px", textAlign: "center", border: `1px solid ${C.borderLight}` }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.text, fontFamily: FONT }}>{s.val}{s.unit}</div>
              {s.target && <div style={{ fontSize: 10, color: s.val >= s.target ? C.done : C.muted, fontFamily: FONT, marginTop: 1 }}>/ {s.target}{s.unit}</div>}
              <div style={{ fontSize: 10, color: C.muted, fontFamily: FONT, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
      )}

      {/* ---- MORNING ACTION ---- */}
      {showActionButton && (
      <div style={{ margin: "0 20px 16px", animation: "slideUp 0.5s ease 0.4s both" }}>
        {!mealLogged ? (
          <button onClick={() => setMealLogged(true)} style={{ width: "100%", padding: "18px 20px", borderRadius: 14, border: "none", background: C.dark, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, transition: "transform 0.1s ease" }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="#fff" strokeWidth="1.5"/><path d="M10 7V13M7 10H13" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{d.morningAction.label}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{d.morningAction.sublabel}</div>
            </div>
          </button>
        ) : (
          <div style={{ width: "100%", padding: "18px 20px", borderRadius: 14, background: "#f0faf0", border: "1px solid #c8e6c9", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: C.done, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#fff" }}>
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M3 8.5L6.5 12L13 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: C.done }}>Meal logged</div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Great start to the day.</div>
            </div>
          </div>
        )}
      </div>
      )}

      {/* ---- WEEK AT A GLANCE ---- */}
      {showWeekGlance && (
      <div style={{ margin: "0 20px 16px", borderRadius: 14, padding: "18px 16px", background: C.chip, border: `1px solid ${C.borderLight}`, animation: "slideUp 0.5s ease 0.5s both" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 14 }}>This Week</div>
        <div style={{ display: "flex", gap: 6 }}>
          {d.weekDays.map((day, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center" }}>
              <div style={{ width: 36, height: 36, borderRadius: 18, margin: "0 auto 6px", background: day.isToday ? C.dark : day.logged ? C.bg : "transparent", border: day.isToday ? "none" : day.logged ? `2px solid ${C.done}` : `1px solid ${C.borderLight}`, color: day.isToday ? "#fff" : day.logged ? C.done : C.muted, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, fontFamily: FONT }}>
                {day.logged ? <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8.5L6.5 12L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> : day.isToday ? "Now" : day.scheduledSessions ? `${day.scheduledSessions}` : "—"}
              </div>
              <div style={{ fontSize: 11, fontWeight: day.isToday ? 700 : 500, color: day.isToday ? C.text : day.logged ? C.sub : C.muted, fontFamily: FONT }}>{day.label}</div>
              {day.cal > 0 && <div style={{ fontSize: 10, color: C.muted, fontFamily: FONT, marginTop: 2 }}>{day.cal}</div>}
            </div>
          ))}
        </div>
      </div>
      )}

      <div style={{ textAlign: "center", padding: "16px 20px 48px", fontSize: 10, color: "rgba(0,0,0,0.15)", fontFamily: FONT, letterSpacing: "0.03em" }}>Generated at 6:00 AM · April 8, 2026</div>
    </div>
  );
}
