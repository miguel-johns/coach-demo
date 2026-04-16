import { useState, useEffect, useRef } from "react";

const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";
const C = {
  bg: "#ffffff", text: "#111", sub: "#666", muted: "#999",
  border: "#e0e0e0", borderLight: "#f0f0f0", chip: "#f5f5f5",
  done: "#4caf50", dark: "#1a1a1a",
};

const WORKOUT = {
  coachName: "Rachel Torres",
  programName: "Strength Foundation — Phase 2",
  weekNumber: 3,
  dayLabel: "Day 1 — Upper Body Push",
  date: "Monday, April 13",
  coachNote: "Focus on controlled negatives today. If 155 feels heavy on bench, drop to 145 — no ego. Quality reps.",
  exercises: [
    { id: 1, name: "Barbell Bench Press", sets: 4, reps: "8", weight: "155", tempo: "3-1-2-0", rest: 90, videoUrl: "https://youtube.com/watch?v=example1", notes: "Retract scapulae, drive feet into floor." },
    { id: 2, name: "Incline DB Press", sets: 3, reps: "10", weight: "50", tempo: "2-1-2-0", rest: 60, videoUrl: "https://youtube.com/watch?v=example2", notes: "30° incline. Full ROM — dumbbells to chest level." },
    { id: 3, name: "Cable Fly", sets: 3, reps: "12", weight: "25", tempo: "2-0-2-1", rest: 45, videoUrl: null, notes: "Squeeze at peak contraction for 1 count." },
    { id: 4, name: "Overhead Press (DB)", sets: 3, reps: "10", weight: "40", tempo: "2-1-2-0", rest: 60, videoUrl: "https://youtube.com/watch?v=example4", notes: "Neutral grip if shoulder mobility is limited." },
    { id: 5, name: "Lateral Raise", sets: 3, reps: "15", weight: "15", tempo: "2-0-2-0", rest: 30, videoUrl: null, notes: "Slight forward lean, pinkies up at top." },
    { id: 6, name: "Tricep Rope Pushdown", sets: 3, reps: "12", weight: "40", tempo: "2-0-2-1", rest: 30, videoUrl: "https://youtube.com/watch?v=example6", notes: "Split the rope at the bottom, squeeze triceps." },
  ],
  coachSettings: { showTempo: true, showRest: true },
};

function initSetLogs(exercises) {
  const logs = {};
  exercises.forEach((ex) => { logs[ex.id] = Array.from({ length: ex.sets }, () => ({ weight: ex.weight, reps: ex.reps, done: false })); });
  return logs;
}

const CheckIcon = () => <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8.5L6.5 12L13 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const ChevronDown = ({ open }) => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s ease" }}><path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const PlayIcon = () => <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M3 1.5V12.5L12 7L3 1.5Z" fill="currentColor"/></svg>;

function RestTimer({ restSeconds }) {
  const [running, setRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(restSeconds);
  const intervalRef = useRef(null);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (running && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => { if (t <= 1) { clearInterval(intervalRef.current); setRunning(false); setFinished(true); return 0; } return t - 1; });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const reset = () => { clearInterval(intervalRef.current); setRunning(false); setFinished(false); setTimeLeft(restSeconds); };
  const toggle = () => { if (finished) { reset(); return; } setRunning((r) => !r); };
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const pct = restSeconds > 0 ? ((restSeconds - timeLeft) / restSeconds) * 100 : 0;

  return (
    <div style={{ background: finished ? "#f0faf0" : C.chip, border: `1px solid ${finished ? "#c8e6c9" : C.border}`, borderRadius: 8, padding: "10px 12px", display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ position: "relative", width: 40, height: 40, flexShrink: 0 }}>
        <svg width="40" height="40" viewBox="0 0 40 40" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="20" cy="20" r="16" fill="none" stroke={C.borderLight} strokeWidth="3" />
          <circle cx="20" cy="20" r="16" fill="none" stroke={finished ? C.done : C.text} strokeWidth="3" strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 16}`} strokeDashoffset={`${2 * Math.PI * 16 * (1 - pct / 100)}`}
            style={{ transition: "stroke-dashoffset 0.3s linear" }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontSize: 12, fontWeight: 600, color: finished ? C.done : C.text }}>
          {finished ? "✓" : `${mins}:${String(secs).padStart(2, "0")}`}
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: finished ? C.done : C.text, fontFamily: FONT }}>{finished ? "Rest Complete" : running ? "Resting..." : "Rest Timer"}</div>
        <div style={{ fontSize: 11, color: C.muted, fontFamily: FONT }}>{restSeconds}s programmed</div>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {(running || (!finished && timeLeft < restSeconds)) && (
          <button onClick={reset} style={{ padding: "6px 10px", borderRadius: 6, border: `1px solid ${C.border}`, cursor: "pointer", fontFamily: FONT, fontSize: 13, fontWeight: 600, background: C.bg, color: C.sub }}>↺</button>
        )}
        <button onClick={toggle} style={{
          padding: "6px 14px", borderRadius: 6, border: "none", cursor: "pointer", fontFamily: FONT, fontSize: 13, fontWeight: 600,
          background: finished ? "#f0faf0" : running ? C.chip : C.dark, color: finished ? C.done : running ? C.text : "#fff",
        }}>{finished ? "Reset" : running ? "Pause" : "Start"}</button>
      </div>
    </div>
  );
}

function SetLogger({ setLog, setIndex, onUpdate }) {
  const done = setLog.done;
  const inputStyle = {
    width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6,
    padding: "8px 32px 8px 10px", color: C.text, fontSize: 14, fontFamily: FONT, fontWeight: 500,
    outline: "none", WebkitAppearance: "none", MozAppearance: "textfield",
  };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "28px 1fr 1fr 36px", alignItems: "center", gap: 8, padding: "5px 0", opacity: done ? 0.4 : 1, transition: "opacity 0.15s ease" }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: C.muted, fontFamily: FONT, textAlign: "center" }}>{setIndex + 1}</div>
      <div style={{ position: "relative" }}>
        <input type="number" value={setLog.weight} onChange={(e) => onUpdate({ ...setLog, weight: e.target.value })} style={inputStyle}
          onFocus={(e) => e.target.style.borderColor = C.text} onBlur={(e) => e.target.style.borderColor = C.border} />
        <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: C.muted, fontFamily: FONT, pointerEvents: "none" }}>lbs</span>
      </div>
      <div style={{ position: "relative" }}>
        <input type="number" value={setLog.reps} onChange={(e) => onUpdate({ ...setLog, reps: e.target.value })} style={inputStyle}
          onFocus={(e) => e.target.style.borderColor = C.text} onBlur={(e) => e.target.style.borderColor = C.border} />
        <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: C.muted, fontFamily: FONT, pointerEvents: "none" }}>reps</span>
      </div>
      <button onClick={() => onUpdate({ ...setLog, done: !done })} style={{
        width: 28, height: 28, borderRadius: 6, border: done ? "none" : `2px solid ${C.border}`,
        background: done ? C.done : "transparent", color: done ? "#fff" : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0,
      }}><CheckIcon /></button>
    </div>
  );
}

function ExerciseRow({ exercise, showTempo, showRest, setLogs, onSetUpdate, onToggleAll, expanded, onExpand }) {
  const allDone = setLogs.every((s) => s.done);
  const doneSets = setLogs.filter((s) => s.done).length;

  return (
    <div style={{ borderBottom: `1px solid ${C.borderLight}` }}>
      <div onClick={() => onExpand(exercise.id)} style={{
        display: "grid", gridTemplateColumns: "36px 1fr 52px 44px 60px 32px",
        alignItems: "center", padding: "12px", cursor: "pointer",
        background: allDone ? "#f0faf0" : C.bg, transition: "background 0.15s ease", gap: "4px",
      }}>
        <button onClick={(e) => { e.stopPropagation(); onToggleAll(exercise.id); }} style={{
          width: 22, height: 22, borderRadius: 5, cursor: "pointer", padding: 0,
          border: allDone ? "none" : `2px solid ${C.border}`,
          background: allDone ? C.done : doneSets > 0 ? "#e8e8e8" : "transparent",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: allDone ? "#fff" : "transparent", transition: "all 0.15s ease",
        }}>
          {allDone ? <CheckIcon /> : doneSets > 0 && (
            <span style={{ fontSize: 10, fontWeight: 700, color: C.sub, fontFamily: FONT }}>{doneSets}</span>
          )}
        </button>
        <div style={{ fontFamily: FONT, fontSize: 14, fontWeight: 500, color: allDone ? C.muted : C.text, textDecoration: allDone ? "line-through" : "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{exercise.name}</div>
        <div style={{ fontFamily: FONT, fontSize: 13, color: allDone ? C.muted : C.sub, textAlign: "center" }}>{exercise.sets}×{exercise.reps}</div>
        <div style={{ fontFamily: FONT, fontSize: 12, color: allDone ? C.muted : C.text, textAlign: "center", fontWeight: 600 }}>{exercise.weight}</div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          {exercise.videoUrl ? (
            <a href={exercise.videoUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
              style={{ display: "flex", alignItems: "center", gap: 3, color: C.sub, fontSize: 11, textDecoration: "none", fontFamily: FONT }}>
              <PlayIcon /> Video
            </a>
          ) : <span style={{ fontSize: 11, color: C.muted }}>—</span>}
        </div>
        <div style={{ color: C.muted, display: "flex", justifyContent: "center" }}><ChevronDown open={expanded} /></div>
      </div>

      {expanded && (
        <div style={{ padding: "4px 12px 16px", animation: "fadeIn 0.15s ease" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12, paddingLeft: 36 }}>
            {showTempo && exercise.tempo && (
              <div style={{ background: C.chip, border: `1px solid ${C.borderLight}`, borderRadius: 5, padding: "3px 8px", fontSize: 12, fontFamily: FONT, color: C.sub }}>
                <span style={{ color: C.muted, marginRight: 4 }}>Tempo</span>{exercise.tempo}
              </div>
            )}
            {exercise.notes && (
              <div style={{ fontSize: 12, color: C.muted, fontStyle: "italic", fontFamily: FONT, lineHeight: 1.5, flex: 1, minWidth: 180 }}>{exercise.notes}</div>
            )}
          </div>
          <div style={{ background: C.chip, border: `1px solid ${C.borderLight}`, borderRadius: 8, padding: "10px 12px 6px", marginBottom: 10 }}>
            <div style={{ display: "grid", gridTemplateColumns: "28px 1fr 1fr 36px", gap: 8, marginBottom: 6 }}>
              {["Set", "Weight", "Reps", ""].map((h, i) => (
                <div key={i} style={{ fontSize: 10, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "center", fontFamily: FONT }}>{h}</div>
              ))}
            </div>
            {setLogs.map((sl, i) => (
              <SetLogger key={i} setLog={sl} setIndex={i} onUpdate={(updated) => onSetUpdate(exercise.id, i, updated)} />
            ))}
          </div>
          {showRest && exercise.rest > 0 && <RestTimer restSeconds={exercise.rest} />}
        </div>
      )}
    </div>
  );
}

export default function WorkoutDashboard() {
  const [workout] = useState(WORKOUT);
  const [setLogs, setSetLogs] = useState(() => initSetLogs(WORKOUT.exercises));
  const [expandedId, setExpandedId] = useState(null);
  const [saved, setSaved] = useState(false);
  const [started, setStarted] = useState(false);

  const handleSetUpdate = (exId, setIndex, updated) => {
    setSaved(false);
    setSetLogs((prev) => { const copy = { ...prev }; copy[exId] = [...copy[exId]]; copy[exId][setIndex] = updated; return copy; });
  };
  const handleToggleAll = (exId) => {
    setSaved(false);
    setSetLogs((prev) => { const copy = { ...prev }; const allDone = copy[exId].every((s) => s.done); copy[exId] = copy[exId].map((s) => ({ ...s, done: !allDone })); return copy; });
  };
  const completeAll = () => {
    setSaved(false);
    setSetLogs((prev) => { const copy = {}; for (const exId in prev) { copy[exId] = prev[exId].map((s) => ({ ...s, done: true })); } return copy; });
  };

  const totalSets = workout.exercises.reduce((a, e) => a + e.sets, 0);
  const doneSets = Object.values(setLogs).flat().filter((s) => s.done).length;
  const allExDone = workout.exercises.every((ex) => setLogs[ex.id].every((s) => s.done));
  const progress = totalSets > 0 ? (doneSets / totalSets) * 100 : 0;

  // ---- NOT STARTED STATE ----
  if (!started) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, fontFamily: FONT, maxWidth: 480, margin: "0 auto" }}>
        <style>{`
          @keyframes fadeIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
          @keyframes slideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
          * { box-sizing:border-box; margin:0; padding:0; }
        `}</style>

        {/* Hero */}
        <div style={{
          padding: "52px 20px 28px", background: C.dark, color: "#fff",
          animation: "fadeIn 0.5s ease",
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
            {workout.coachName} · {workout.date}
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.15, marginBottom: 4 }}>
            {workout.dayLabel}
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 20 }}>
            {workout.programName} · Week {workout.weekNumber}
          </div>

          {/* Quick stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {[
              { val: workout.exercises.length, label: "Exercises" },
              { val: totalSets, label: "Total Sets" },
              { val: "~50 min", label: "Est. Time" },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "center", animation: `slideUp 0.4s ease ${0.15 + i * 0.1}s both` }}>
                <div style={{ fontSize: 22, fontWeight: 800 }}>{s.val}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Coach note */}
        <div style={{
          margin: "20px 20px 0", padding: "14px 16px", borderRadius: 12,
          background: C.chip, border: `1px solid ${C.borderLight}`,
          animation: "slideUp 0.4s ease 0.2s both",
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
              <path d="M2 3H14V11H6L2 14V3Z" stroke={C.muted} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div style={{ fontSize: 13, color: C.sub, fontFamily: FONT, lineHeight: 1.6, fontStyle: "italic" }}>
              {workout.coachNote}
            </div>
          </div>
        </div>

        {/* Exercise preview list */}
        <div style={{ padding: "20px 20px 0", animation: "slideUp 0.4s ease 0.3s both" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
            Today's Exercises
          </div>

          {workout.exercises.map((ex, i) => (
            <div key={ex.id} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "12px 0",
              borderBottom: i < workout.exercises.length - 1 ? `1px solid ${C.borderLight}` : "none",
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 14, background: C.chip,
                border: `1px solid ${C.borderLight}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 600, color: C.muted, fontFamily: FONT, flexShrink: 0,
              }}>{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: C.text, fontFamily: FONT }}>{ex.name}</div>
                <div style={{ fontSize: 12, color: C.muted, fontFamily: FONT, marginTop: 1 }}>
                  {ex.sets} sets × {ex.reps} reps · {ex.weight} lbs
                </div>
              </div>
              {ex.videoUrl && (
                <a href={ex.videoUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                  style={{ display: "flex", alignItems: "center", gap: 3, color: C.sub, fontSize: 11, textDecoration: "none", fontFamily: FONT, flexShrink: 0 }}>
                  <PlayIcon /> Video
                </a>
              )}
            </div>
          ))}
        </div>

        {/* Start workout button */}
        <div style={{ padding: "24px 20px", animation: "slideUp 0.4s ease 0.4s both" }}>
          <button onClick={() => setStarted(true)} style={{
            width: "100%", padding: "18px", borderRadius: 14, border: "none",
            background: C.dark, color: "#fff", fontSize: 16, fontWeight: 700,
            fontFamily: FONT, cursor: "pointer",
          }}>
            Start Workout
          </button>
          <div style={{ textAlign: "center", fontSize: 11, color: C.muted, marginTop: 8 }}>
            You can also mark it all complete if you trained on your own.
          </div>
        </div>
      </div>
    );
  }

  // ---- ACTIVE WORKOUT STATE ----
  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: FONT, maxWidth: 480, margin: "0 auto" }}>
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(-4px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing:border-box; margin:0; padding:0; }
        input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance:none; margin:0; }
      `}</style>

      <div style={{ padding: "48px 16px 16px" }}>
        <div style={{ fontSize: 12, color: C.muted, fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 4 }}>
          {workout.coachName} · {workout.date}
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: C.text, lineHeight: 1.2, marginBottom: 2 }}>{workout.dayLabel}</div>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>{workout.programName} · Week {workout.weekNumber}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ flex: 1, height: 3, background: C.borderLight, borderRadius: 2, overflow: "hidden" }}>
            <div style={{ width: `${progress}%`, height: "100%", background: allExDone ? C.done : C.text, borderRadius: 2, transition: "width 0.3s ease" }} />
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: allExDone ? C.done : C.sub, fontFamily: FONT }}>{doneSets}/{totalSets} sets</div>
        </div>
      </div>

      <div style={{
        display: "grid", gridTemplateColumns: "36px 1fr 52px 44px 60px 32px",
        padding: "6px 12px", borderBottom: `1px solid ${C.border}`, borderTop: `1px solid ${C.border}`,
        background: C.chip, position: "sticky", top: 0, zIndex: 10, gap: "4px",
      }}>
        {["", "Exercise", "Sets", "Wt", "Demo", ""].map((l, i) => (
          <div key={i} style={{ fontSize: 10, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em", textAlign: i < 2 || i === 5 ? "left" : "center", fontFamily: FONT }}>{l}</div>
        ))}
      </div>

      {workout.exercises.map((ex) => (
        <ExerciseRow key={ex.id} exercise={ex} showTempo={workout.coachSettings.showTempo} showRest={workout.coachSettings.showRest}
          setLogs={setLogs[ex.id]} onSetUpdate={handleSetUpdate} onToggleAll={handleToggleAll} expanded={expandedId === ex.id} onExpand={(id) => setExpandedId((p) => p === id ? null : id)} />
      ))}

      {!allExDone && (
        <div style={{ padding: "20px 16px 8px" }}>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={completeAll} style={{
              flex: 1, padding: "12px", borderRadius: 8, border: `1px solid ${C.border}`,
              background: C.bg, color: C.sub, fontSize: 14, fontWeight: 600, fontFamily: FONT, cursor: "pointer",
            }}>Mark All Complete</button>
            <button onClick={() => setSaved(true)} style={{
              padding: "12px 20px", borderRadius: 8, border: "none",
              background: saved ? "#f0faf0" : C.dark, color: saved ? C.done : "#fff",
              fontSize: 14, fontWeight: 600, fontFamily: FONT, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              {saved ? <><CheckIcon /> Saved</> : "Save"}
            </button>
          </div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 6, textAlign: "center" }}>{saved ? "Progress saved · coach notified" : "Save progress anytime"}</div>
        </div>
      )}

      {allExDone && (
        <div style={{ textAlign: "center", padding: "36px 16px", animation: "fadeIn 0.3s ease" }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>✓</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.done, marginBottom: 4 }}>Workout Complete</div>
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>
            {saved ? `Saved · ${workout.coachName} has been notified` : "Review your sets above, then save."}
          </div>
          {!saved ? (
            <button onClick={() => setSaved(true)} style={{
              width: "100%", maxWidth: 260, padding: "12px 24px", borderRadius: 8, border: "none",
              background: C.dark, color: "#fff", fontSize: 15, fontWeight: 700, fontFamily: FONT, cursor: "pointer",
            }}>Save Workout</button>
          ) : (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px",
              borderRadius: 6, background: "#f0faf0", border: "1px solid #c8e6c9", color: C.done, fontSize: 13, fontWeight: 600, fontFamily: FONT,
            }}><CheckIcon /> Saved</div>
          )}
        </div>
      )}

      <div style={{ height: 48 }} />
    </div>
  );
}
