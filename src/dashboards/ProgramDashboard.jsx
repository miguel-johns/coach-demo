import { useState } from "react";

const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";
const C = {
  bg: "#ffffff", text: "#111", sub: "#666", muted: "#999",
  border: "#e0e0e0", borderLight: "#f0f0f0", chip: "#f5f5f5",
  done: "#4caf50", dark: "#1a1a1a",
};

// Full 8-week program — coach-built, AI-delivered
const PROGRAM = {
  name: "Strength Foundation",
  coach: "Coach Mike",
  client: "Sarah",
  totalWeeks: 8,
  currentWeek: 3,
  currentDay: 2, // 0-indexed within current week
  startDate: "Mar 17, 2026",
  phase: [
    { weeks: [1, 2], label: "Stabilization", color: C.muted },
    { weeks: [3, 4], label: "Strength Endurance", color: C.sub },
    { weeks: [5, 6], label: "Hypertrophy", color: C.dark },
    { weeks: [7, 8], label: "Max Strength", color: C.text },
  ],
  weeks: [
    {
      week: 1, label: "Week 1", phase: "Stabilization",
      days: [
        { day: 1, label: "Upper Body A", focus: "Push", exercises: 6, sets: 18, estTime: 45, completed: true, date: "Mon 3/17" },
        { day: 2, label: "Lower Body A", focus: "Quad dominant", exercises: 6, sets: 20, estTime: 50, completed: true, date: "Tue 3/18" },
        { day: 3, label: "Active Recovery", focus: "Mobility", exercises: 8, sets: 8, estTime: 25, completed: true, date: "Wed 3/19" },
        { day: 4, label: "Upper Body B", focus: "Pull", exercises: 6, sets: 18, estTime: 45, completed: true, date: "Fri 3/21" },
        { day: 5, label: "Lower Body B", focus: "Hip dominant", exercises: 6, sets: 20, estTime: 50, completed: true, date: "Sat 3/22" },
      ],
    },
    {
      week: 2, label: "Week 2", phase: "Stabilization",
      days: [
        { day: 1, label: "Upper Body A", focus: "Push", exercises: 6, sets: 18, estTime: 45, completed: true, date: "Mon 3/24" },
        { day: 2, label: "Lower Body A", focus: "Quad dominant", exercises: 6, sets: 20, estTime: 50, completed: true, date: "Tue 3/25" },
        { day: 3, label: "Active Recovery", focus: "Mobility", exercises: 8, sets: 8, estTime: 25, completed: true, date: "Wed 3/26" },
        { day: 4, label: "Upper Body B", focus: "Pull", exercises: 6, sets: 18, estTime: 45, completed: true, date: "Fri 3/28" },
        { day: 5, label: "Lower Body B", focus: "Hip dominant", exercises: 6, sets: 20, estTime: 50, completed: true, date: "Sat 3/29" },
      ],
    },
    {
      week: 3, label: "Week 3", phase: "Strength Endurance",
      days: [
        { day: 1, label: "Upper Push", focus: "Chest & Shoulders", exercises: 6, sets: 20, estTime: 50, completed: true, date: "Mon 3/31" },
        { day: 2, label: "Lower Quad", focus: "Squat patterns", exercises: 6, sets: 22, estTime: 55, completed: true, date: "Tue 4/1" },
        { day: 3, label: "Active Recovery", focus: "Mobility + Core", exercises: 8, sets: 8, estTime: 25, completed: false, isToday: true, date: "Wed 4/2" },
        { day: 4, label: "Upper Pull", focus: "Back & Biceps", exercises: 6, sets: 20, estTime: 50, completed: false, date: "Fri 4/4" },
        { day: 5, label: "Lower Hinge", focus: "Deadlift patterns", exercises: 6, sets: 22, estTime: 55, completed: false, date: "Sat 4/5" },
      ],
    },
    {
      week: 4, label: "Week 4", phase: "Strength Endurance",
      days: [
        { day: 1, label: "Upper Push", focus: "Chest & Shoulders", exercises: 6, sets: 20, estTime: 50, completed: false, date: "Mon 4/7" },
        { day: 2, label: "Lower Quad", focus: "Squat patterns", exercises: 6, sets: 22, estTime: 55, completed: false, date: "Tue 4/8" },
        { day: 3, label: "Active Recovery", focus: "Mobility + Core", exercises: 8, sets: 8, estTime: 25, completed: false, date: "Wed 4/9" },
        { day: 4, label: "Upper Pull", focus: "Back & Biceps", exercises: 6, sets: 20, estTime: 50, completed: false, date: "Fri 4/11" },
        { day: 5, label: "Lower Hinge", focus: "Deadlift patterns", exercises: 6, sets: 22, estTime: 55, completed: false, date: "Sat 4/12" },
      ],
    },
    {
      week: 5, label: "Week 5", phase: "Hypertrophy",
      days: [
        { day: 1, label: "Chest & Triceps", focus: "Hypertrophy", exercises: 7, sets: 24, estTime: 55, completed: false, date: "Mon 4/14" },
        { day: 2, label: "Legs & Glutes", focus: "Hypertrophy", exercises: 7, sets: 26, estTime: 60, completed: false, date: "Tue 4/15" },
        { day: 3, label: "Active Recovery", focus: "Mobility", exercises: 8, sets: 8, estTime: 25, completed: false, date: "Wed 4/16" },
        { day: 4, label: "Back & Biceps", focus: "Hypertrophy", exercises: 7, sets: 24, estTime: 55, completed: false, date: "Fri 4/18" },
        { day: 5, label: "Shoulders & Core", focus: "Hypertrophy", exercises: 6, sets: 20, estTime: 45, completed: false, date: "Sat 4/19" },
      ],
    },
    {
      week: 6, label: "Week 6", phase: "Hypertrophy",
      days: [
        { day: 1, label: "Chest & Triceps", focus: "Hypertrophy", exercises: 7, sets: 24, estTime: 55, completed: false, date: "Mon 4/21" },
        { day: 2, label: "Legs & Glutes", focus: "Hypertrophy", exercises: 7, sets: 26, estTime: 60, completed: false, date: "Tue 4/22" },
        { day: 3, label: "Active Recovery", focus: "Mobility", exercises: 8, sets: 8, estTime: 25, completed: false, date: "Wed 4/23" },
        { day: 4, label: "Back & Biceps", focus: "Hypertrophy", exercises: 7, sets: 24, estTime: 55, completed: false, date: "Fri 4/25" },
        { day: 5, label: "Shoulders & Core", focus: "Hypertrophy", exercises: 6, sets: 20, estTime: 45, completed: false, date: "Sat 4/26" },
      ],
    },
    {
      week: 7, label: "Week 7", phase: "Max Strength",
      days: [
        { day: 1, label: "Heavy Upper", focus: "Bench & OHP", exercises: 5, sets: 18, estTime: 55, completed: false, date: "Mon 4/28" },
        { day: 2, label: "Heavy Lower", focus: "Squat & DL", exercises: 5, sets: 18, estTime: 55, completed: false, date: "Tue 4/29" },
        { day: 3, label: "Active Recovery", focus: "Mobility", exercises: 8, sets: 8, estTime: 25, completed: false, date: "Wed 4/30" },
        { day: 4, label: "Volume Upper", focus: "Accessory work", exercises: 7, sets: 22, estTime: 50, completed: false, date: "Fri 5/2" },
        { day: 5, label: "Volume Lower", focus: "Accessory work", exercises: 7, sets: 22, estTime: 50, completed: false, date: "Sat 5/3" },
      ],
    },
    {
      week: 8, label: "Week 8", phase: "Max Strength",
      days: [
        { day: 1, label: "Test Day — Upper", focus: "PR attempts", exercises: 3, sets: 9, estTime: 45, completed: false, date: "Mon 5/5" },
        { day: 2, label: "Test Day — Lower", focus: "PR attempts", exercises: 3, sets: 9, estTime: 45, completed: false, date: "Tue 5/6" },
        { day: 3, label: "Active Recovery", focus: "Mobility", exercises: 8, sets: 8, estTime: 25, completed: false, date: "Wed 5/7" },
        { day: 4, label: "Deload Upper", focus: "Recovery", exercises: 5, sets: 12, estTime: 30, completed: false, date: "Fri 5/9" },
        { day: 5, label: "Deload Lower", focus: "Recovery", exercises: 5, sets: 12, estTime: 30, completed: false, date: "Sat 5/10" },
      ],
    },
  ],
};

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3 8.5L6.5 12L13 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
);

export default function ProgramDashboard() {
  const p = PROGRAM;
  const [expandedWeek, setExpandedWeek] = useState(p.currentWeek);

  const totalDays = p.weeks.reduce((a, w) => a + w.days.length, 0);
  const completedDays = p.weeks.reduce((a, w) => a + w.days.filter((d) => d.completed).length, 0);
  const overallPct = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;

  // Current phase
  const currentPhase = p.phase.find((ph) => ph.weeks.includes(p.currentWeek));

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: FONT, maxWidth: 480, margin: "0 auto" }}>
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing:border-box; margin:0; padding:0; }
      `}</style>

      {/* ---- HEADER ---- */}
      <div style={{
        padding: "48px 20px 20px", background: C.dark, color: "#fff",
        animation: "fadeIn 0.5s ease",
      }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
          {p.coach} · 8-Week Program
        </div>
        <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.2, marginBottom: 2 }}>{p.name}</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 18 }}>Started {p.startDate}</div>

        {/* Overall progress */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <div style={{ flex: 1, height: 5, background: "rgba(255,255,255,0.1)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ width: `${overallPct}%`, height: "100%", background: "#fff", borderRadius: 3, transition: "width 0.5s ease" }} />
          </div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>{completedDays}/{totalDays}</div>
        </div>

        {/* Phase timeline */}
        <div style={{ display: "flex", gap: 3 }}>
          {p.phase.map((ph, i) => {
            const isCurrent = ph.weeks.includes(p.currentWeek);
            const isPast = ph.weeks[ph.weeks.length - 1] < p.currentWeek;
            return (
              <div key={i} style={{ flex: 1, textAlign: "center" }}>
                <div style={{
                  height: 4, borderRadius: 2, marginBottom: 6,
                  background: isPast ? "rgba(255,255,255,0.5)" : isCurrent ? "#fff" : "rgba(255,255,255,0.1)",
                }} />
                <div style={{
                  fontSize: 10, fontWeight: isCurrent ? 700 : 500,
                  color: isCurrent ? "#fff" : isPast ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.2)",
                }}>{ph.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ---- CURRENT WEEK HIGHLIGHT ---- */}
      {(() => {
        const cw = p.weeks[p.currentWeek - 1];
        const cwCompleted = cw.days.filter((d) => d.completed).length;
        const todayWorkout = cw.days.find((d) => d.isToday);

        return (
          <div style={{
            margin: "16px 20px", borderRadius: 14, padding: "18px",
            background: C.chip, border: `1px solid ${C.borderLight}`,
            animation: "slideUp 0.4s ease 0.1s both",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>This Week</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>{cw.label} — {cw.phase}</div>
              </div>
              <div style={{
                padding: "4px 10px", borderRadius: 6, background: C.dark, color: "#fff",
                fontSize: 13, fontWeight: 700,
              }}>{cwCompleted}/{cw.days.length}</div>
            </div>

            {/* Mini day dots */}
            <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
              {cw.days.map((day, i) => (
                <div key={i} style={{
                  flex: 1, height: 6, borderRadius: 3,
                  background: day.completed ? C.done : day.isToday ? C.dark : C.borderLight,
                }} />
              ))}
            </div>

            {/* Today's workout CTA */}
            {todayWorkout && (
              <div style={{
                display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
                background: C.bg, borderRadius: 10, border: `1px solid ${C.borderLight}`,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, background: C.dark,
                  display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0,
                }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8H14M4 5V11M12 5V11M1 7V9M15 7V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Today: {todayWorkout.label}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{todayWorkout.focus} · {todayWorkout.exercises} exercises · ~{todayWorkout.estTime} min</div>
                </div>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4L10 8L6 12" stroke={C.muted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            )}
          </div>
        );
      })()}

      {/* ---- WEEK-BY-WEEK ACCORDION ---- */}
      <div style={{ padding: "0 20px", animation: "slideUp 0.4s ease 0.2s both" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
          Full Program
        </div>

        {p.weeks.map((week) => {
          const isExpanded = expandedWeek === week.week;
          const weekCompleted = week.days.filter((d) => d.completed).length;
          const allDone = weekCompleted === week.days.length;
          const isCurrent = week.week === p.currentWeek;
          const isFuture = week.week > p.currentWeek;
          const weekPhase = p.phase.find((ph) => ph.weeks.includes(week.week));

          return (
            <div key={week.week} style={{ marginBottom: 6 }}>
              {/* Week header */}
              <button onClick={() => setExpandedWeek(isExpanded ? null : week.week)} style={{
                width: "100%", display: "flex", alignItems: "center", padding: "14px",
                background: isCurrent ? C.chip : C.bg,
                border: `1px solid ${isCurrent ? C.border : C.borderLight}`,
                borderRadius: isExpanded ? "12px 12px 0 0" : 12,
                cursor: "pointer", gap: 12, textAlign: "left",
                transition: "all 0.15s ease",
              }}>
                {/* Status */}
                <div style={{
                  width: 28, height: 28, borderRadius: 14, flexShrink: 0,
                  background: allDone ? C.done : isCurrent ? C.dark : "transparent",
                  border: allDone || isCurrent ? "none" : `2px solid ${isFuture ? C.borderLight : C.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: allDone || isCurrent ? "#fff" : C.muted,
                  fontSize: 11, fontWeight: 700, fontFamily: FONT,
                }}>
                  {allDone ? <CheckIcon /> : week.week}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: isFuture ? C.muted : C.text, fontFamily: FONT }}>{week.label}</span>
                    {isCurrent && (
                      <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: C.dark, color: "#fff" }}>NOW</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: C.muted, fontFamily: FONT, marginTop: 1 }}>
                    {week.phase} · {week.days.length} sessions
                  </div>
                </div>

                {/* Progress mini */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  <div style={{ display: "flex", gap: 2 }}>
                    {week.days.map((day, i) => (
                      <div key={i} style={{
                        width: 6, height: 6, borderRadius: 3,
                        background: day.completed ? C.done : day.isToday ? C.dark : C.borderLight,
                      }} />
                    ))}
                  </div>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{
                    transform: isExpanded ? "rotate(180deg)" : "rotate(0)",
                    transition: "transform 0.2s ease",
                  }}><path d="M4 6L8 10L12 6" stroke={C.muted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </button>

              {/* Expanded days */}
              {isExpanded && (
                <div style={{
                  border: `1px solid ${isCurrent ? C.border : C.borderLight}`,
                  borderTop: "none",
                  borderRadius: "0 0 12px 12px",
                  overflow: "hidden",
                  animation: "fadeIn 0.15s ease",
                }}>
                  {week.days.map((day, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", padding: "12px 14px", gap: 12,
                      background: day.isToday ? "rgba(17,17,17,0.03)" : C.bg,
                      borderBottom: i < week.days.length - 1 ? `1px solid ${C.borderLight}` : "none",
                      cursor: "pointer",
                    }}>
                      {/* Day status */}
                      <div style={{
                        width: 24, height: 24, borderRadius: 12, flexShrink: 0,
                        background: day.completed ? C.done : day.isToday ? C.dark : "transparent",
                        border: day.completed || day.isToday ? "none" : `1.5px solid ${C.border}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: day.completed || day.isToday ? "#fff" : C.muted,
                        fontSize: 10, fontWeight: 700, fontFamily: FONT,
                      }}>
                        {day.completed ? <CheckIcon /> : day.isToday ? "!" : day.day}
                      </div>

                      {/* Day info */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{
                            fontSize: 14, fontWeight: day.isToday ? 700 : 500,
                            color: day.completed ? C.muted : C.text,
                            textDecoration: day.completed ? "line-through" : "none",
                            fontFamily: FONT,
                          }}>{day.label}</span>
                          {day.isToday && (
                            <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 3, background: C.done, color: "#fff" }}>TODAY</span>
                          )}
                        </div>
                        <div style={{ fontSize: 11, color: C.muted, fontFamily: FONT, marginTop: 1 }}>
                          {day.focus} · {day.exercises} exercises · {day.sets} sets · ~{day.estTime} min
                        </div>
                      </div>

                      {/* Date + arrow */}
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: 11, color: C.muted, fontFamily: FONT }}>{day.date}</div>
                      </div>
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M6 4L10 8L6 12" stroke={C.borderLight} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ---- PROGRAM STATS ---- */}
      <div style={{
        margin: "16px 20px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8,
        animation: "slideUp 0.4s ease 0.3s both",
      }}>
        {[
          { val: `${completedDays}`, label: "Completed" },
          { val: `${totalDays - completedDays}`, label: "Remaining" },
          { val: `${Math.round(overallPct)}%`, label: "Progress" },
        ].map((s) => (
          <div key={s.label} style={{
            background: C.chip, borderRadius: 10, padding: "14px 10px",
            textAlign: "center", border: `1px solid ${C.borderLight}`,
          }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.text, fontFamily: FONT }}>{s.val}</div>
            <div style={{ fontSize: 10, color: C.muted, fontFamily: FONT, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ---- VOLUME TREND ---- */}
      <div style={{
        margin: "0 20px 16px", borderRadius: 14, padding: "18px",
        background: C.dark, color: "#fff",
        animation: "slideUp 0.4s ease 0.35s both",
      }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 14 }}>
          Weekly Volume Progression
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 60, marginBottom: 8 }}>
          {p.weeks.map((w, i) => {
            const totalSets = w.days.reduce((a, d) => a + d.sets, 0);
            const maxSets = Math.max(...p.weeks.map((wk) => wk.days.reduce((a, d) => a + d.sets, 0)));
            const h = (totalSets / maxSets) * 100;
            const isCurrent = w.week === p.currentWeek;
            const isPast = w.week < p.currentWeek;
            return (
              <div key={i} style={{
                flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              }}>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontFamily: FONT }}>{totalSets}</div>
                <div style={{
                  width: "100%", maxWidth: 28, borderRadius: "4px 4px 2px 2px",
                  height: `${Math.max(h, 8)}%`,
                  background: isCurrent ? "#fff" : isPast ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.1)",
                  transition: "height 0.4s ease",
                }} />
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {p.weeks.map((w, i) => (
            <div key={i} style={{
              flex: 1, textAlign: "center", fontSize: 9,
              color: w.week === p.currentWeek ? "#fff" : "rgba(255,255,255,0.3)",
              fontWeight: w.week === p.currentWeek ? 700 : 500, fontFamily: FONT,
            }}>W{w.week}</div>
          ))}
        </div>
      </div>

      <div style={{ height: 48 }} />
    </div>
  );
}
