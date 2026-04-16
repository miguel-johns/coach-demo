import { useState } from "react";

const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";
const C = {
  bg: "#ffffff", text: "#111", sub: "#666", muted: "#999",
  border: "#e0e0e0", borderLight: "#f0f0f0", chip: "#f5f5f5",
  done: "#4caf50", dark: "#1a1a1a",
};

const PROGRAM = {
  name: "Strength Foundation",
  coach: "Rachel Torres",
  client: "Sarah",
  totalWeeks: 8,
  daysPerWeek: 5,
  startDate: "Monday, April 14",
  sentAt: "April 13, 2026",
  coachMessage: "Sarah — here's your full 8-week program. We're building from the ground up: stabilization first, then strength endurance, hypertrophy, and finishing with max strength tests in Week 8. Trust the process. I'll be with you every step.",
  overview: {
    totalSessions: 40,
    estHoursTotal: 33,
    equipment: "Full gym — barbell, dumbbells, cables, machines",
  },
  phases: [
    {
      name: "Stabilization",
      weeks: [1, 2],
      description: "Building your foundation. Core stability, movement quality, and joint prep.",
      focus: ["Balance", "Core activation", "Movement patterns", "Joint stability"],
    },
    {
      name: "Strength Endurance",
      weeks: [3, 4],
      description: "Higher reps, moderate weight. Building work capacity and muscular endurance.",
      focus: ["Supersets", "Moderate load", "12–15 rep range", "Minimal rest"],
    },
    {
      name: "Hypertrophy",
      weeks: [5, 6],
      description: "Time to grow. Increased volume, controlled tempos, progressive overload.",
      focus: ["Volume increase", "8–12 rep range", "Tempo training", "Mind-muscle connection"],
    },
    {
      name: "Max Strength",
      weeks: [7, 8],
      description: "Peak performance. Heavy loads, low reps, full recovery. Week 8 is test week.",
      focus: ["Heavy compounds", "3–6 rep range", "Full recovery", "PR attempts"],
    },
  ],
  weeks: [
    {
      week: 1, phase: "Stabilization",
      days: [
        { day: 1, label: "Upper Body A", focus: "Push · Stabilization", exercises: 6, sets: 18, estTime: 45 },
        { day: 2, label: "Lower Body A", focus: "Quad dominant", exercises: 6, sets: 20, estTime: 50 },
        { day: 3, label: "Active Recovery", focus: "Mobility + Core", exercises: 8, sets: 8, estTime: 25 },
        { day: 4, label: "Upper Body B", focus: "Pull · Stabilization", exercises: 6, sets: 18, estTime: 45 },
        { day: 5, label: "Lower Body B", focus: "Hip dominant", exercises: 6, sets: 20, estTime: 50 },
      ],
    },
    {
      week: 2, phase: "Stabilization",
      days: [
        { day: 1, label: "Upper Body A", focus: "Push progression", exercises: 6, sets: 18, estTime: 45 },
        { day: 2, label: "Lower Body A", focus: "Quad progression", exercises: 6, sets: 20, estTime: 50 },
        { day: 3, label: "Active Recovery", focus: "Mobility + Core", exercises: 8, sets: 8, estTime: 25 },
        { day: 4, label: "Upper Body B", focus: "Pull progression", exercises: 6, sets: 18, estTime: 45 },
        { day: 5, label: "Lower Body B", focus: "Hip progression", exercises: 6, sets: 20, estTime: 50 },
      ],
    },
    {
      week: 3, phase: "Strength Endurance",
      days: [
        { day: 1, label: "Upper Push", focus: "Chest & Shoulders", exercises: 6, sets: 20, estTime: 50 },
        { day: 2, label: "Lower Quad", focus: "Squat patterns", exercises: 6, sets: 22, estTime: 55 },
        { day: 3, label: "Active Recovery", focus: "Mobility + Core", exercises: 8, sets: 8, estTime: 25 },
        { day: 4, label: "Upper Pull", focus: "Back & Biceps", exercises: 6, sets: 20, estTime: 50 },
        { day: 5, label: "Lower Hinge", focus: "Deadlift patterns", exercises: 6, sets: 22, estTime: 55 },
      ],
    },
    {
      week: 4, phase: "Strength Endurance",
      days: [
        { day: 1, label: "Upper Push", focus: "Chest & Shoulders", exercises: 6, sets: 20, estTime: 50 },
        { day: 2, label: "Lower Quad", focus: "Squat patterns", exercises: 6, sets: 22, estTime: 55 },
        { day: 3, label: "Active Recovery", focus: "Mobility + Core", exercises: 8, sets: 8, estTime: 25 },
        { day: 4, label: "Upper Pull", focus: "Back & Biceps", exercises: 6, sets: 20, estTime: 50 },
        { day: 5, label: "Lower Hinge", focus: "Deadlift patterns", exercises: 6, sets: 22, estTime: 55 },
      ],
    },
    {
      week: 5, phase: "Hypertrophy",
      days: [
        { day: 1, label: "Chest & Triceps", focus: "Volume", exercises: 7, sets: 24, estTime: 55 },
        { day: 2, label: "Legs & Glutes", focus: "Volume", exercises: 7, sets: 26, estTime: 60 },
        { day: 3, label: "Active Recovery", focus: "Mobility", exercises: 8, sets: 8, estTime: 25 },
        { day: 4, label: "Back & Biceps", focus: "Volume", exercises: 7, sets: 24, estTime: 55 },
        { day: 5, label: "Shoulders & Core", focus: "Volume", exercises: 6, sets: 20, estTime: 45 },
      ],
    },
    {
      week: 6, phase: "Hypertrophy",
      days: [
        { day: 1, label: "Chest & Triceps", focus: "Peak volume", exercises: 7, sets: 26, estTime: 60 },
        { day: 2, label: "Legs & Glutes", focus: "Peak volume", exercises: 7, sets: 28, estTime: 65 },
        { day: 3, label: "Active Recovery", focus: "Mobility", exercises: 8, sets: 8, estTime: 25 },
        { day: 4, label: "Back & Biceps", focus: "Peak volume", exercises: 7, sets: 26, estTime: 60 },
        { day: 5, label: "Shoulders & Core", focus: "Peak volume", exercises: 6, sets: 22, estTime: 50 },
      ],
    },
    {
      week: 7, phase: "Max Strength",
      days: [
        { day: 1, label: "Heavy Upper", focus: "Bench & OHP", exercises: 5, sets: 18, estTime: 55 },
        { day: 2, label: "Heavy Lower", focus: "Squat & DL", exercises: 5, sets: 18, estTime: 55 },
        { day: 3, label: "Active Recovery", focus: "Mobility", exercises: 8, sets: 8, estTime: 25 },
        { day: 4, label: "Volume Upper", focus: "Accessory work", exercises: 7, sets: 22, estTime: 50 },
        { day: 5, label: "Volume Lower", focus: "Accessory work", exercises: 7, sets: 22, estTime: 50 },
      ],
    },
    {
      week: 8, phase: "Max Strength",
      days: [
        { day: 1, label: "Test Day — Upper", focus: "PR attempts", exercises: 3, sets: 9, estTime: 45 },
        { day: 2, label: "Test Day — Lower", focus: "PR attempts", exercises: 3, sets: 9, estTime: 45 },
        { day: 3, label: "Active Recovery", focus: "Recovery", exercises: 8, sets: 8, estTime: 25 },
        { day: 4, label: "Deload Upper", focus: "Recovery", exercises: 5, sets: 12, estTime: 30 },
        { day: 5, label: "Deload Lower", focus: "Recovery", exercises: 5, sets: 12, estTime: 30 },
      ],
    },
  ],
};

export default function ProgramPreview() {
  const p = PROGRAM;
  const [expandedPhase, setExpandedPhase] = useState(null);
  const [accepted, setAccepted] = useState(false);

  const totalSets = p.weeks.reduce((a, w) => a + w.days.reduce((b, d) => b + d.sets, 0), 0);
  const totalExercises = p.weeks.reduce((a, w) => a + w.days.reduce((b, d) => b + d.exercises, 0), 0);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: FONT, maxWidth: 480, margin: "0 auto" }}>
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing:border-box; margin:0; padding:0; }
      `}</style>

      {/* ---- HERO ---- */}
      <div style={{
        padding: "52px 20px 28px", background: C.dark, color: "#fff",
        animation: "fadeIn 0.5s ease",
      }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
          New Program from {p.coach}
        </div>
        <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.15, marginBottom: 4 }}>
          {p.name}
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 24 }}>
          {p.totalWeeks} weeks · {p.daysPerWeek} days/week · Starts {p.startDate}
        </div>

        {/* At a glance */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {[
            { val: p.overview.totalSessions, label: "Sessions" },
            { val: totalSets, label: "Total Sets" },
            { val: `~${p.overview.estHoursTotal}h`, label: "Est. Time" },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center", animation: `slideUp 0.4s ease ${0.15 + i * 0.1}s both` }}>
              <div style={{ fontSize: 24, fontWeight: 800 }}>{s.val}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ---- COACH MESSAGE ---- */}
      <div style={{
        margin: "20px 20px 0",
        animation: "slideUp 0.4s ease 0.2s both",
      }}>
        <div style={{
          padding: "16px", borderRadius: 12,
          background: C.chip, border: `1px solid ${C.borderLight}`,
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
              <path d="M2 3H14V11H6L2 14V3Z" stroke={C.muted} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div style={{ fontSize: 13, color: C.sub, fontFamily: FONT, lineHeight: 1.65, fontStyle: "italic" }}>
              {p.coachMessage}
            </div>
          </div>
        </div>
      </div>

      {/* ---- PHASE ROADMAP ---- */}
      <div style={{ padding: "20px 20px 0", animation: "slideUp 0.4s ease 0.3s both" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
          Your Roadmap
        </div>

        {p.phases.map((phase, pi) => {
          const isExpanded = expandedPhase === pi;
          const phaseWeeks = p.weeks.filter((w) => phase.weeks.includes(w.week));
          const phaseSets = phaseWeeks.reduce((a, w) => a + w.days.reduce((b, d) => b + d.sets, 0), 0);
          const phaseSessions = phaseWeeks.reduce((a, w) => a + w.days.length, 0);

          return (
            <div key={pi} style={{ marginBottom: 8 }}>
              <button onClick={() => setExpandedPhase(isExpanded ? null : pi)} style={{
                width: "100%", display: "flex", alignItems: "center", padding: "16px",
                background: C.bg, border: `1px solid ${C.borderLight}`,
                borderRadius: isExpanded ? "12px 12px 0 0" : 12,
                cursor: "pointer", gap: 14, textAlign: "left",
              }}>
                {/* Phase number */}
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: C.dark, color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 800, fontFamily: FONT,
                }}>{pi + 1}</div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.text, fontFamily: FONT }}>{phase.name}</div>
                  <div style={{ fontSize: 12, color: C.muted, fontFamily: FONT, marginTop: 1 }}>
                    Weeks {phase.weeks[0]}–{phase.weeks[phase.weeks.length - 1]} · {phaseSessions} sessions
                  </div>
                </div>

                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{
                  transform: isExpanded ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s ease",
                }}><path d="M4 6L8 10L12 6" stroke={C.muted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>

              {isExpanded && (
                <div style={{
                  border: `1px solid ${C.borderLight}`, borderTop: "none",
                  borderRadius: "0 0 12px 12px", overflow: "hidden",
                  animation: "fadeIn 0.15s ease",
                }}>
                  {/* Phase description */}
                  <div style={{ padding: "14px 16px", background: "rgba(17,17,17,0.02)", borderBottom: `1px solid ${C.borderLight}` }}>
                    <div style={{ fontSize: 13, color: C.sub, lineHeight: 1.6, fontFamily: FONT, marginBottom: 10 }}>
                      {phase.description}
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {phase.focus.map((f) => (
                        <span key={f} style={{
                          padding: "3px 8px", borderRadius: 5, fontSize: 11, fontWeight: 500,
                          background: C.chip, border: `1px solid ${C.borderLight}`, color: C.sub, fontFamily: FONT,
                        }}>{f}</span>
                      ))}
                    </div>
                  </div>

                  {/* Week breakdowns */}
                  {phaseWeeks.map((week) => (
                    <div key={week.week}>
                      <div style={{
                        padding: "10px 16px", background: C.chip,
                        fontSize: 12, fontWeight: 600, color: C.muted, fontFamily: FONT,
                        borderBottom: `1px solid ${C.borderLight}`,
                      }}>
                        Week {week.week}
                      </div>
                      {week.days.map((day, di) => (
                        <div key={di} style={{
                          display: "flex", alignItems: "center", padding: "11px 16px", gap: 10,
                          borderBottom: di < week.days.length - 1 ? `1px solid ${C.borderLight}` : "none",
                          background: C.bg,
                        }}>
                          <div style={{
                            width: 22, height: 22, borderRadius: 11, flexShrink: 0,
                            border: `1.5px solid ${C.borderLight}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 10, fontWeight: 600, color: C.muted, fontFamily: FONT,
                          }}>{day.day}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 500, color: C.text, fontFamily: FONT }}>{day.label}</div>
                            <div style={{ fontSize: 11, color: C.muted, fontFamily: FONT }}>{day.focus}</div>
                          </div>
                          <div style={{ textAlign: "right", flexShrink: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: C.text, fontFamily: FONT }}>{day.sets} sets</div>
                            <div style={{ fontSize: 10, color: C.muted }}>~{day.estTime}m</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ---- VOLUME PREVIEW ---- */}
      <div style={{
        margin: "16px 20px", borderRadius: 14, padding: "18px",
        background: C.dark, color: "#fff",
        animation: "slideUp 0.4s ease 0.4s both",
      }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 14 }}>
          Volume by Week
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 56, marginBottom: 8 }}>
          {p.weeks.map((w, i) => {
            const weekSets = w.days.reduce((a, d) => a + d.sets, 0);
            const maxSets = Math.max(...p.weeks.map((wk) => wk.days.reduce((a, d) => a + d.sets, 0)));
            const h = (weekSets / maxSets) * 100;
            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)" }}>{weekSets}</div>
                <div style={{
                  width: "100%", maxWidth: 28, borderRadius: "3px 3px 1px 1px",
                  height: `${Math.max(h, 8)}%`, background: "rgba(255,255,255,0.15)",
                }} />
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {p.weeks.map((w, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center", fontSize: 9, color: "rgba(255,255,255,0.3)", fontFamily: FONT }}>W{w.week}</div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 3, marginTop: 10 }}>
          {p.phases.map((ph, i) => (
            <div key={i} style={{ flex: ph.weeks.length, textAlign: "center" }}>
              <div style={{ height: 2, background: "rgba(255,255,255,0.1)", borderRadius: 1, marginBottom: 4 }} />
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.25)" }}>{ph.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ---- EQUIPMENT ---- */}
      <div style={{
        margin: "0 20px", padding: "14px 16px", borderRadius: 12,
        background: C.chip, border: `1px solid ${C.borderLight}`,
        display: "flex", alignItems: "center", gap: 10,
        animation: "slideUp 0.4s ease 0.45s both",
      }}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
          <path d="M2 9H16M4 6V12M14 6V12M1 8V10M17 8V10" stroke={C.muted} strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <div style={{ fontSize: 13, color: C.sub, fontFamily: FONT }}>{p.overview.equipment}</div>
      </div>

      {/* ---- ACCEPT PROGRAM ---- */}
      <div style={{ padding: "24px 20px", animation: "slideUp 0.4s ease 0.5s both" }}>
        {!accepted ? (
          <>
            <button onClick={() => setAccepted(true)} style={{
              width: "100%", padding: "18px", borderRadius: 14, border: "none",
              background: C.dark, color: "#fff", fontSize: 16, fontWeight: 700,
              fontFamily: FONT, cursor: "pointer",
            }}>
              Accept Program
            </button>
            <div style={{ textAlign: "center", fontSize: 11, color: C.muted, marginTop: 8 }}>
              Your first workout will be available {p.startDate}.
            </div>
          </>
        ) : (
          <div style={{
            width: "100%", padding: "20px", borderRadius: 14, textAlign: "center",
            background: "#f0faf0", border: "1px solid #c8e6c9",
          }}>
            <svg width="24" height="24" viewBox="0 0 16 16" fill="none" style={{ margin: "0 auto 8px", display: "block" }}><path d="M3 8.5L6.5 12L13 4" stroke={C.done} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.done, fontFamily: FONT }}>Program Accepted</div>
            <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>
              You'll get your first workout Monday morning. Let's go.
            </div>
          </div>
        )}
      </div>

      {/* Timestamp */}
      <div style={{
        textAlign: "center", padding: "0 20px 48px",
        fontSize: 10, color: "rgba(0,0,0,0.12)", fontFamily: FONT,
      }}>
        Sent by {p.coach} · {p.sentAt}
      </div>
    </div>
  );
}
