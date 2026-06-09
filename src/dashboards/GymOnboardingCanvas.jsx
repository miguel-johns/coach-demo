import React, { useState, useEffect, useRef } from "react";

// Palette — matches Milton dashboard
const TEAL = "#2B7A78";
const MINT = "#5CDB95";
const TEAL_LIGHT = "#e8f5f3";
const SAGE = "#3aafa9";
const BG = "#fafcfb";
const WHITE = "#ffffff";
const TEXT = "#1a2e2a";
const TEXT_SEC = "#5f7a76";
const BORDER = "#e0ebe8";

// ── Step sequence ──
const STEPS = [
  { id: "upload", label: "Upload" },
  { id: "exercises", label: "Movements" },
  { id: "templates", label: "Templates" },
  { id: "generate", label: "Programs" },
  { id: "coaches", label: "Coaches" },
  { id: "review", label: "Review" },
];

// ── Coaches available to tag (mirrors dashboard roster) ──
const ONBOARDING_COACHES = [
  { id: "miguel", name: "Miguel Santos", initials: "MS", color: "#2B7A78", specialty: "Strength" },
  { id: "jordan", name: "Jordan Lee", initials: "JL", color: "#6366f1", specialty: "Conditioning" },
  { id: "alana", name: "Alana Reyes", initials: "AR", color: "#ef6c3e", specialty: "Mobility" },
];

// ── Template types (Group / Semi-Private / 1-on-1) ──
const TEMPLATE_TYPES = [
  { id: "group", type: "Group", color: "#c2410c", bg: "#fff1ea" },
  { id: "semi", type: "Semi-Private", color: "#1f7a3e", bg: "#e6f9ec" },
  { id: "pt", type: "1-on-1", color: "#3aafa9", bg: "#e8f5f3" },
];

// ── Mock "extracted" movements (a real gym would have many more) ──
const INITIAL_MOVEMENTS = [
  { id: "m1", name: "Back Squat", category: "Squat" },
  { id: "m2", name: "Front Squat", category: "Squat" },
  { id: "m3", name: "Goblet Squat", category: "Squat" },
  { id: "m4", name: "Box Squat", category: "Squat" },
  { id: "m5", name: "Romanian Deadlift", category: "Hinge" },
  { id: "m6", name: "Conventional Deadlift", category: "Hinge" },
  { id: "m7", name: "Trap Bar Deadlift", category: "Hinge" },
  { id: "m8", name: "Hip Thrust", category: "Hinge" },
  { id: "m9", name: "Kettlebell Swing", category: "Hinge" },
  { id: "m10", name: "Bench Press", category: "Upper Push" },
  { id: "m11", name: "Incline DB Press", category: "Upper Push" },
  { id: "m12", name: "Strict Press", category: "Upper Push" },
  { id: "m13", name: "Push-up", category: "Upper Push" },
  { id: "m14", name: "Pull-up", category: "Upper Pull" },
  { id: "m15", name: "Chin-up", category: "Upper Pull" },
  { id: "m16", name: "Barbell Row", category: "Upper Pull" },
  { id: "m17", name: "Single-Arm DB Row", category: "Upper Pull" },
  { id: "m18", name: "Lat Pulldown", category: "Upper Pull" },
  { id: "m19", name: "Walking Lunge", category: "Unilateral" },
  { id: "m20", name: "Bulgarian Split Squat", category: "Unilateral" },
  { id: "m21", name: "Step-up", category: "Unilateral" },
  { id: "m22", name: "Reverse Lunge", category: "Unilateral" },
  { id: "m23", name: "Plank", category: "Core" },
  { id: "m24", name: "Dead Bug", category: "Core" },
  { id: "m25", name: "Pallof Press", category: "Core" },
  { id: "m26", name: "Hanging Knee Raise", category: "Core" },
  { id: "m27", name: "Assault Bike", category: "Conditioning" },
  { id: "m28", name: "Rowing Intervals", category: "Conditioning" },
  { id: "m29", name: "Sled Push", category: "Conditioning" },
  { id: "m30", name: "Wall Ball", category: "Conditioning" },
  { id: "m31", name: "Farmer Carry", category: "Other" },
  { id: "m32", name: "Turkish Get-up", category: "Other" },
  { id: "m33", name: "Band Pull-apart", category: "Other" },
];

const MOVEMENT_CATEGORIES = ["Squat", "Hinge", "Upper Push", "Upper Pull", "Unilateral", "Core", "Conditioning", "Other"];

// ── Programming styles (templates) — independent of class type ──
// These are complete periodization templates. The gym assigns them to
// Group / Semi-Private / 1-on-1 sessions later, at the generate step.
const PROGRAM_STYLES = [
  {
    id: "linear",
    name: "Linear Progression",
    color: "#2B7A78", bg: "#e8f5f3",
    blockLength: "4-week block",
    periodization: "Linear",
    summary: "Steady week-over-week load increases off a constant structure. Reliable for general strength.",
    phases: [
      { week: 1, label: "Intro", focus: "Volume base", intensity: "65–70%", reps: "3 × 8" },
      { week: 2, label: "Build", focus: "Add load", intensity: "70–75%", reps: "4 × 6" },
      { week: 3, label: "Peak", focus: "Heavy", intensity: "80–85%", reps: "5 × 4" },
      { week: 4, label: "Deload", focus: "Recover", intensity: "60%", reps: "3 × 6" },
    ],
    progressions: ["Add 2.5–5kg when all reps complete", "Tempo eccentric on week 2", "AMRAP final set week 3"],
    regressions: ["Goblet variation", "Reduce range of motion", "Drop to bodyweight + band"],
  },
  {
    id: "dup",
    name: "Undulating (DUP)",
    color: "#1f7a3e", bg: "#e6f9ec",
    blockLength: "4-week block",
    periodization: "Daily undulating",
    summary: "Hypertrophy, strength and power rotate within the block. Great for varied client goals.",
    phases: [
      { week: 1, label: "Hypertrophy", focus: "Volume", intensity: "70%", reps: "4 × 10" },
      { week: 2, label: "Strength", focus: "Load", intensity: "80%", reps: "5 × 5" },
      { week: 3, label: "Power", focus: "Speed", intensity: "75%", reps: "6 × 3" },
      { week: 4, label: "Deload", focus: "Recover", intensity: "60%", reps: "3 × 8" },
    ],
    progressions: ["Auto-regulate via RPE 7–8", "Cluster sets week 3", "Add accessory volume"],
    regressions: ["Machine substitution", "Reduce sets by one", "Longer rest periods"],
  },
  {
    id: "block",
    name: "Block (Assessment-Driven)",
    color: "#c2410c", bg: "#fff1ea",
    blockLength: "4-week block",
    periodization: "Block",
    summary: "Each block targets one quality, sequenced off an assessment. Ideal for individualized work.",
    phases: [
      { week: 1, label: "Assess", focus: "Movement quality", intensity: "Light", reps: "3 × 12" },
      { week: 2, label: "Accumulate", focus: "Volume", intensity: "70%", reps: "4 × 8" },
      { week: 3, label: "Intensify", focus: "Load", intensity: "82%", reps: "5 × 4" },
      { week: 4, label: "Deload", focus: "Recover", intensity: "55%", reps: "2 × 8" },
    ],
    progressions: ["Progress per session notes", "Unilateral loading", "Add complexity weekly"],
    regressions: ["Supported variations", "Tempo control", "Isometric holds"],
  },
];

const STYLE_BY_ID = Object.fromEntries(PROGRAM_STYLES.map((s) => [s.id, s]));

// Default style applied to each class type when generating (gym can change it)
const DEFAULT_STYLE_FOR_TYPE = { group: "linear", semi: "dup", pt: "block" };

// Cadence belongs to the class type, not the style
const TYPE_CADENCE = { group: "5 days / week", semi: "3 days / week", pt: "2–3 days / week" };

// ── Weekly day patterns per template type ──
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const TYPE_DAYS = {
  group: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  semi: ["Mon", "Wed", "Fri"],
  pt: ["Tue", "Thu"],
};

// Day focus labels rotate to feel like real programming
const DAY_FOCUS = {
  group: { Mon: "Lower — Squat", Tue: "Upper — Push", Wed: "Conditioning", Thu: "Lower — Hinge", Fri: "Upper — Pull" },
  semi: { Mon: "Full Body A", Wed: "Full Body B", Fri: "Full Body C" },
  pt: { Tue: "Priority Block A", Thu: "Priority Block B" },
};

// Build a workout (list of exercise prescriptions) for a given style + focus + week
function buildWorkout(styleId, focus, week) {
  const phase = STYLE_BY_ID[styleId].phases[week - 1];
  const pick = (cat, n = 1) => INITIAL_MOVEMENTS.filter((m) => m.category === cat).slice(0, n);
  let mains = [];
  if (/Squat/.test(focus)) mains = [...pick("Squat", 1), ...pick("Unilateral", 1), ...pick("Core", 1)];
  else if (/Hinge/.test(focus)) mains = [...pick("Hinge", 1), ...pick("Unilateral", 1), ...pick("Core", 1)];
  else if (/Push/.test(focus)) mains = [...pick("Upper Push", 2), ...pick("Core", 1)];
  else if (/Pull/.test(focus)) mains = [...pick("Upper Pull", 2), ...pick("Core", 1)];
  else if (/Conditioning/.test(focus)) mains = [...pick("Conditioning", 2), ...pick("Core", 1)];
  else mains = [...pick("Squat", 1), ...pick("Upper Push", 1), ...pick("Upper Pull", 1), ...pick("Core", 1)];
  return mains.map((m, i) => ({
    id: `${m.id}-${i}`,
    movementId: m.id,
    name: m.name,
    sets: i === 0 ? phase.reps.split(" × ")[0] : "3",
    reps: i === 0 ? phase.reps.split(" × ")[1] : "10",
    load: i === 0 ? phase.intensity : "RPE 7",
  }));
}

// Build full program (all weeks) for one class type using a chosen programming style
function buildProgram(typeId, styleId) {
  const days = TYPE_DAYS[typeId];
  const sessions = [];
  for (let week = 1; week <= 4; week++) {
    days.forEach((day) => {
      const focus = DAY_FOCUS[typeId][day];
      sessions.push({
        id: `${typeId}-w${week}-${day}`,
        typeId,
        styleId,
        week,
        day,
        focus,
        coachId: null,
        exercises: buildWorkout(styleId, focus, week),
      });
    });
  }
  return sessions;
}

// ── Icons ──
function Icon({ name, size = 20, color = "currentColor", strokeWidth = 1.8 }) {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (name) {
    case "upload": return <svg {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>;
    case "check": return <svg {...p}><polyline points="20 6 9 17 4 12" /></svg>;
    case "x": return <svg {...p}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
    case "file": return <svg {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>;
    case "arrow": return <svg {...p}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>;
    case "back": return <svg {...p}><polyline points="15 18 9 12 15 6" /></svg>;
    case "home": return <svg {...p}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>;
    case "sparkle": return <svg {...p}><path d="M12 3l1.9 5.8L19 11l-5.1 2.2L12 19l-1.9-5.8L5 11l5.1-2.2z" /></svg>;
    case "lock": return <svg {...p}><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>;
    case "users": return <svg {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
    case "send": return <svg {...p}><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>;
    case "calendar": return <svg {...p}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
    case "plus": return <svg {...p}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
    case "edit": return <svg {...p}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z" /></svg>;
    case "trash": return <svg {...p}><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>;
    case "info": return <svg {...p}><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>;
    default: return null;
  }
}

// ── Progress rail ──
function StepRail({ currentIndex, isMobile }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 4 : 8, flexWrap: "wrap" }}>
      {STEPS.map((s, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <React.Fragment key={s.id}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <div style={{
                width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700,
                background: done ? MINT : active ? TEAL : "#eef3f1",
                color: done || active ? WHITE : TEXT_SEC,
                transition: "all 0.25s ease",
              }}>
                {done ? <Icon name="check" size={13} color={WHITE} strokeWidth={2.5} /> : i + 1}
              </div>
              {!isMobile && (
                <span style={{ fontSize: 12, fontWeight: active ? 700 : 500, color: active ? TEXT : TEXT_SEC }}>{s.label}</span>
              )}
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ width: isMobile ? 12 : 20, height: 2, borderRadius: 2, background: done ? MINT : "#e6edeb", transition: "all 0.25s ease" }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Primary button ──
function PrimaryButton({ children, onClick, disabled, full }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10,
        padding: "14px 26px", borderRadius: 14, border: "none",
        background: disabled ? "#c5d6d2" : MINT,
        color: WHITE, fontSize: 15, fontWeight: 700, fontFamily: "inherit",
        cursor: disabled ? "default" : "pointer", width: full ? "100%" : "auto",
        boxShadow: disabled ? "none" : hover ? "0 8px 22px rgba(92,219,149,0.4)" : "0 4px 14px rgba(92,219,149,0.28)",
        transform: !disabled && hover ? "translateY(-1px)" : "none",
        transition: "all 0.18s ease",
      }}
    >
      {children}
    </button>
  );
}

// ════════════════════════ STEP 1: UPLOAD ════════════════════════
function UploadStep({ onContinue }) {
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const SEED = [
    { name: "GemDoc3_Glossary.docx", size: "15.63 KB" },
    { name: "2025_Program_Library.pdf", size: "1.2 MB" },
    { name: "Intake_Form_Template.docx", size: "48 KB" },
  ];

  const addFiles = (list) => {
    const incoming = list && list.length
      ? Array.from(list).map((f) => ({ name: f.name, size: `${(f.size / 1024).toFixed(1)} KB` }))
      : [SEED[files.length % SEED.length]];
    setFiles((prev) => [...prev, ...incoming]);
  };

  const removeFile = (idx) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <div>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: TEXT, margin: 0, letterSpacing: "-0.02em" }}>
          Drop everything you know.
        </h1>
        <p style={{ fontSize: 16, color: TEXT_SEC, margin: "12px 0 0", maxWidth: 540, lineHeight: 1.5 }}>
          Programs, intake forms, client notes, progressions, your communication rules. The messier the better. I&apos;ll find the structure.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, alignItems: "start" }}>
        {/* Dropzone */}
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
          style={{
            border: `2px dashed ${dragging ? TEAL : "#bfe0d8"}`,
            background: dragging ? "#e2f3ee" : TEAL_LIGHT,
            borderRadius: 18, padding: "40px 24px", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center",
            textAlign: "center", minHeight: 280, justifyContent: "center",
            transition: "all 0.18s ease",
          }}
        >
          <input ref={inputRef} type="file" multiple style={{ display: "none" }} onChange={(e) => addFiles(e.target.files)} />
          <div style={{ width: 64, height: 64, borderRadius: 16, background: "#cdeee4", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
            <Icon name="upload" size={28} color={TEAL} />
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: TEXT }}>Drop your work here</div>
          <div style={{ fontSize: 14, color: TEXT_SEC, marginTop: 4 }}>or click to browse</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 20 }}>
            {[".pdf", ".docx", ".md", ".txt", ".csv", "images"].map((t) => (
              <span key={t} style={{ fontSize: 12, fontWeight: 600, color: TEXT_SEC, background: WHITE, border: `1px solid ${BORDER}`, padding: "6px 12px", borderRadius: 9 }}>{t}</span>
            ))}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setFiles(SEED); }}
            style={{ marginTop: 18, border: "none", background: "transparent", color: TEAL, fontSize: 13, fontWeight: 700, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}
          >
            Load sample files
          </button>
        </div>

        {/* Right column — file list / status */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, minHeight: 280 }}>
          {files.length === 0 ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 12, color: TEXT_SEC }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>What happens next?</div>
              {["You upload your files", "I read and analyze them", "I build your knowledge base"].map((step, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 22, height: 22, borderRadius: "50%", background: TEAL_LIGHT, color: TEAL, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
                  <span style={{ fontSize: 14 }}>{step}</span>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#cdeee4", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="check" size={20} color={TEAL} strokeWidth={2.5} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>{files.length} file{files.length > 1 ? "s" : ""} uploaded successfully</div>
                  <div style={{ fontSize: 13, color: TEXT_SEC }}>Ready to process</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {files.map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, background: "#f1f7f5", borderRadius: 12, padding: "12px 14px" }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: WHITE, display: "flex", alignItems: "center", justifyContent: "center", color: SAGE }}>
                      <Icon name="file" size={18} color={SAGE} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: TEXT, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.name}</div>
                      <div style={{ fontSize: 12, color: TEXT_SEC }}>{f.size} • <span style={{ color: SAGE, fontWeight: 600 }}>Ready</span></div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); removeFile(i); }} style={{ border: "none", background: "transparent", color: TEXT_SEC, cursor: "pointer", padding: 4, display: "flex" }}>
                      <Icon name="x" size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <PrimaryButton onClick={() => onContinue(files)} disabled={files.length === 0} full>
          Continue Processing ({files.length} file{files.length !== 1 ? "s" : ""}) <Icon name="arrow" size={18} color={WHITE} />
        </PrimaryButton>
        <div style={{ display: "flex", alignItems: "center", gap: 7, justifyContent: "center", color: TEXT_SEC, fontSize: 13 }}>
          <Icon name="lock" size={14} /> Your data is private and secure
        </div>
      </div>
    </div>
  );
}

// ════════════════════════ PROCESSING ════════════════════════
function ProcessingStep({ onDone }) {
  const [progress, setProgress] = useState(0);
  const lines = [
    "Reading what you sent.",
    "Pulling out your movements.",
    "Mapping your templates.",
  ];
  const [lineIdx, setLineIdx] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const total = 3200;
    const tick = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, Math.round((elapsed / total) * 100));
      setProgress(pct);
      setLineIdx(Math.min(lines.length - 1, Math.floor((pct / 100) * lines.length)));
      if (pct >= 100) { clearInterval(tick); setTimeout(onDone, 450); }
    }, 60);
    return () => clearInterval(tick);
  }, []);

  return (
    <div style={{ minHeight: 360, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 20 }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: TEAL_LIGHT, padding: "8px 16px", borderRadius: 20 }}>
        <span style={{ display: "flex", gap: 4 }}>
          {[0, 1, 2].map((i) => (
            <span key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: SAGE, animation: `gymDot 1s ${i * 0.18}s infinite ease-in-out` }} />
          ))}
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, color: TEAL }}>Processing in progress</span>
      </div>
      <h1 style={{ fontSize: 40, fontWeight: 800, color: TEXT, margin: 0, letterSpacing: "-0.02em" }}>{lines[lineIdx]}</h1>
      <p style={{ fontSize: 17, color: TEXT_SEC, margin: 0, maxWidth: 460, lineHeight: 1.5 }}>
        I&apos;m going through your work and putting it together as I go. You don&apos;t have to do anything.
      </p>
      <div style={{ width: "min(420px, 80%)", height: 8, borderRadius: 8, background: "#e6efec", overflow: "hidden", marginTop: 8 }}>
        <div style={{ width: `${progress}%`, height: "100%", borderRadius: 8, background: `linear-gradient(90deg, ${SAGE}, ${MINT})`, transition: "width 0.1s linear" }} />
      </div>
      <div style={{ fontSize: 13, color: TEXT_SEC, fontWeight: 600 }}>{progress}%</div>
    </div>
  );
}

// ════════════════════════ STEP 2: MOVEMENTS (editable) ════════════════════════
function ExercisesStep({ movements, setMovements, onContinue }) {
  const [adding, setAdding] = useState(null); // category being added to
  const [draftName, setDraftName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  const commitAdd = (category) => {
    const name = draftName.trim();
    if (name) {
      setMovements((prev) => [...prev, { id: `m${Date.now()}`, name, category }]);
    }
    setDraftName("");
    setAdding(null);
  };

  const commitEdit = (id) => {
    const name = editName.trim();
    if (name) setMovements((prev) => prev.map((m) => m.id === id ? { ...m, name } : m));
    setEditingId(null);
    setEditName("");
  };

  const removeMovement = (id) => setMovements((prev) => prev.filter((m) => m.id !== id));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: TEXT, margin: 0, letterSpacing: "-0.02em" }}>
          Here are your movements.
        </h1>
        <p style={{ fontSize: 15, color: TEXT_SEC, margin: "10px 0 0", maxWidth: 640, lineHeight: 1.5 }}>
          I pulled <strong style={{ color: TEXT }}>{movements.length} movements</strong> out of your uploads, grouped by pattern. Add, rename, or remove anything — it&apos;s your library.
        </p>
      </div>

      {/* Reassurance banner */}
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", background: TEAL_LIGHT, borderRadius: 14, padding: "14px 16px" }}>
        <div style={{ flexShrink: 0, marginTop: 1 }}><Icon name="info" size={18} color={TEAL} /></div>
        <p style={{ fontSize: 13.5, color: TEXT, margin: 0, lineHeight: 1.5 }}>
          You don&apos;t have to have every movement here. Whatever a program needs and isn&apos;t in your library yet, I&apos;ll supply from the Milton library automatically when we build your calendars.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
        {MOVEMENT_CATEGORIES.map((cat) => {
          const items = movements.filter((e) => e.category === cat);
          return (
            <div key={cat} style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 16, display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: TEXT_SEC, textTransform: "uppercase", letterSpacing: "0.04em" }}>{cat}</div>
                <span style={{ fontSize: 11, fontWeight: 700, color: TEAL, background: TEAL_LIGHT, borderRadius: 8, padding: "2px 8px" }}>{items.length}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {items.map((ex) => (
                  <div key={ex.id} className="gymMoveRow" style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 8px", borderRadius: 8 }}>
                    {editingId === ex.id ? (
                      <>
                        <input
                          autoFocus value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") commitEdit(ex.id); if (e.key === "Escape") { setEditingId(null); setEditName(""); } }}
                          onBlur={() => commitEdit(ex.id)}
                          style={{ flex: 1, fontSize: 14, fontFamily: "inherit", color: TEXT, border: `1px solid ${TEAL}`, borderRadius: 7, padding: "4px 8px", outline: "none" }}
                        />
                      </>
                    ) : (
                      <>
                        <span style={{ flex: 1, fontSize: 14, color: TEXT, fontWeight: 500 }}>{ex.name}</span>
                        <button onClick={() => { setEditingId(ex.id); setEditName(ex.name); }} title="Rename" style={iconBtn}>
                          <Icon name="edit" size={14} color={TEXT_SEC} />
                        </button>
                        <button onClick={() => removeMovement(ex.id)} title="Remove" style={iconBtn}>
                          <Icon name="x" size={15} color={TEXT_SEC} />
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {adding === cat ? (
                <input
                  autoFocus value={draftName}
                  placeholder="Movement name"
                  onChange={(e) => setDraftName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") commitAdd(cat); if (e.key === "Escape") { setAdding(null); setDraftName(""); } }}
                  onBlur={() => commitAdd(cat)}
                  style={{ marginTop: 8, fontSize: 14, fontFamily: "inherit", color: TEXT, border: `1px solid ${TEAL}`, borderRadius: 8, padding: "7px 10px", outline: "none" }}
                />
              ) : (
                <button onClick={() => { setAdding(cat); setDraftName(""); }} style={{
                  marginTop: 8, display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit",
                  fontSize: 13, fontWeight: 600, color: TEAL, background: "transparent", border: "none", cursor: "pointer", padding: "4px 0",
                }}>
                  <Icon name="plus" size={15} color={TEAL} /> Add movement
                </button>
              )}
            </div>
          );
        })}
      </div>

      <PrimaryButton onClick={onContinue}>
        Looks right — show my templates <Icon name="arrow" size={18} color={WHITE} />
      </PrimaryButton>
    </div>
  );
}

const iconBtn = {
  border: "none", background: "transparent", cursor: "pointer", padding: 3,
  display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 6,
};

// ════════════════════════ STEP 3: TEMPLATES (programming styles) ════════════════════════
function TemplatesStep({ approved, setApproved, onContinue }) {
  const allApproved = PROGRAM_STYLES.every((s) => approved[s.id]);
  const approvedCount = PROGRAM_STYLES.filter((s) => approved[s.id]).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: TEXT, margin: 0, letterSpacing: "-0.02em" }}>
          Your programming templates.
        </h1>
        <p style={{ fontSize: 15, color: TEXT_SEC, margin: "10px 0 0", maxWidth: 660, lineHeight: 1.5 }}>
          I read the periodization out of your sheets — how blocks progress week to week, plus your progressions and regressions. These are complete programming styles. You&apos;ll assign them to your group, semi-private and 1-on-1 sessions next.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {PROGRAM_STYLES.map((style) => (
          <StyleTemplateCard
            key={style.id}
            style={style}
            approved={!!approved[style.id]}
            onToggle={() => setApproved((prev) => ({ ...prev, [style.id]: !prev[style.id] }))}
          />
        ))}
      </div>

      <PrimaryButton onClick={onContinue} disabled={!allApproved}>
        {allApproved ? "Generate my first programs" : `Approve all templates to continue (${approvedCount}/${PROGRAM_STYLES.length})`} <Icon name="arrow" size={18} color={WHITE} />
      </PrimaryButton>
    </div>
  );
}

// ── Single programming-style template card ──
function StyleTemplateCard({ style, approved, onToggle }) {
  return (
    <div style={{ background: WHITE, border: `1.5px solid ${approved ? "#1f7a3e" : style.color}`, borderRadius: 18, padding: 22, display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 19, fontWeight: 800, color: TEXT }}>{style.name}</div>
          <div style={{ fontSize: 13.5, color: TEXT_SEC, marginTop: 4, maxWidth: 560 }}>{style.summary}</div>
        </div>
        {approved && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: "#1f7a3e", background: "#e6f9ec", padding: "5px 12px", borderRadius: 20, whiteSpace: "nowrap" }}>
            <Icon name="check" size={14} color="#1f7a3e" strokeWidth={2.5} /> Approved
          </span>
        )}
      </div>

      {/* Meta chips */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {[
          { label: "Periodization", value: style.periodization },
          { label: "Block length", value: style.blockLength },
        ].map((m) => (
          <div key={m.label} style={{ background: style.bg, borderRadius: 10, padding: "8px 14px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: style.color, textTransform: "uppercase", letterSpacing: "0.04em" }}>{m.label}</div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: TEXT, marginTop: 2 }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Block calendar — the 4-week progression */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: TEXT_SEC, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>4-week block progression</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10 }}>
          {style.phases.map((ph) => (
            <div key={ph.week} style={{ border: `1px solid ${style.color}33`, background: BG, borderRadius: 12, padding: 14, display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: TEXT_SEC }}>WEEK {ph.week}</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: style.color }}>{ph.label}</div>
              <div style={{ fontSize: 12.5, color: TEXT_SEC }}>{ph.focus}</div>
              <div style={{ marginTop: 4, display: "flex", flexDirection: "column", gap: 3 }}>
                <div style={{ fontSize: 12, color: TEXT }}><strong>{ph.reps}</strong></div>
                <div style={{ fontSize: 12, color: TEXT_SEC }}>{ph.intensity}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progressions / regressions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {[
          { title: "Progressions", items: style.progressions, dot: "#1f7a3e" },
          { title: "Regressions", items: style.regressions, dot: "#c2410c" },
        ].map((col) => (
          <div key={col.title} style={{ border: `1px solid ${BORDER}`, borderRadius: 12, padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: TEXT_SEC, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>{col.title}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {col.items.map((it, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 9, fontSize: 13, color: TEXT, lineHeight: 1.4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: col.dot, flexShrink: 0, marginTop: 6 }} />
                  {it}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onToggle}
        style={{
          padding: "12px 16px", borderRadius: 11, fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer",
          border: `1.5px solid ${approved ? "#1f7a3e" : style.color}`,
          background: approved ? "#e6f9ec" : WHITE, color: approved ? "#1f7a3e" : style.color,
          transition: "all 0.15s ease",
        }}
      >
        {approved ? "Approved — tap to undo" : `Approve ${style.name} template`}
      </button>
    </div>
  );
}


// ════════════════════════ STEP 4: GENERATE PROGRAMS ════════════════════════
// Class calendars (Group + Semi-Private). 1-on-1s are programmed separately.
const CLASS_TYPES = TEMPLATE_TYPES.filter((t) => t.id !== "pt");

function GenerateStep({ programs, setPrograms, approvedTemplates, onContinue }) {
  const [selected, setSelected] = useState({ group: true, semi: true });
  const [styleFor, setStyleFor] = useState({ group: DEFAULT_STYLE_FOR_TYPE.group, semi: DEFAULT_STYLE_FOR_TYPE.semi });
  const [generating, setGenerating] = useState(false);
  const generated = Object.keys(programs).length > 0;
  const [activeTab, setActiveTab] = useState("group");
  const [classDropOpen, setClassDropOpen] = useState(false);
  const [openSession, setOpenSession] = useState(null);

  // Only styles the gym approved are assignable
  const approvedStyles = PROGRAM_STYLES.filter((s) => approvedTemplates[s.id]);

  const runGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      const built = {};
      CLASS_TYPES.forEach((t) => { if (selected[t.id]) built[t.id] = buildProgram(t.id, styleFor[t.id]); });
      setPrograms(built);
      const firstTab = CLASS_TYPES.find((t) => selected[t.id])?.id || "group";
      setActiveTab(firstTab);
      setGenerating(false);
    }, 1400);
  };

  const updateSession = (updated) => {
    setPrograms((prev) => ({
      ...prev,
      [updated.typeId]: prev[updated.typeId].map((s) => s.id === updated.id ? updated : s),
    }));
    setOpenSession(updated);
  };

  const availableTabs = CLASS_TYPES.filter((t) => programs[t.id]);
  const active = CLASS_TYPES.find((t) => t.id === activeTab) || availableTabs[0];
  const activeStyle = programs[active?.id]?.[0]?.styleId ? STYLE_BY_ID[programs[active.id][0].styleId] : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: TEXT, margin: 0, letterSpacing: "-0.02em" }}>
          Generate your first month.
        </h1>
        <p style={{ fontSize: 15, color: TEXT_SEC, margin: "10px 0 0", maxWidth: 660, lineHeight: 1.5 }}>
          Assign a programming template to each class you run, and I&apos;ll auto-populate a full <strong style={{ color: TEXT }}>4-week calendar</strong> with your movements — laid out just like your live programming view. Click any session to view and edit. 1-on-1 sessions are programmed separately.
        </p>
      </div>

      {!generated ? (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {CLASS_TYPES.map((t) => {
              const on = selected[t.id];
              return (
                <div key={t.id} style={{
                  background: on ? t.bg : WHITE, borderRadius: 14, padding: 18,
                  border: `1.5px solid ${on ? t.color : BORDER}`, transition: "all 0.15s ease",
                  display: "flex", flexDirection: "column", gap: 14,
                }}>
                  <button
                    onClick={() => setSelected((p) => ({ ...p, [t.id]: !p[t.id] }))}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit", padding: 0, textAlign: "left" }}
                  >
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: TEXT }}>{t.type}</div>
                      <div style={{ fontSize: 12.5, color: TEXT_SEC, marginTop: 2 }}>{TYPE_CADENCE[t.id]}</div>
                    </div>
                    <span style={{
                      width: 22, height: 22, borderRadius: 7, flexShrink: 0,
                      border: `1.5px solid ${on ? t.color : "#c8d6d2"}`, background: on ? t.color : WHITE,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>{on && <Icon name="check" size={14} color={WHITE} strokeWidth={3} />}</span>
                  </button>

                  {on && (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: TEXT_SEC, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>Programming template</div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {approvedStyles.map((s) => {
                          const picked = styleFor[t.id] === s.id;
                          return (
                            <button key={s.id} onClick={() => setStyleFor((p) => ({ ...p, [t.id]: s.id }))} style={{
                              display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 13px", borderRadius: 10, fontFamily: "inherit",
                              fontSize: 13, fontWeight: 700, cursor: "pointer",
                              border: `1.5px solid ${picked ? s.color : BORDER}`,
                              background: WHITE, color: picked ? s.color : TEXT_SEC, transition: "all 0.15s ease",
                            }}>
                              <span style={{ width: 9, height: 9, borderRadius: "50%", background: s.color }} />
                              {s.name}
                              {picked && <Icon name="check" size={13} color={s.color} strokeWidth={2.5} />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* 1-on-1 note */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#f1f7f5", borderRadius: 12, padding: "12px 16px" }}>
              <Icon name="info" size={16} color={TEXT_SEC} />
              <span style={{ fontSize: 12.5, color: TEXT_SEC, lineHeight: 1.45 }}>
                <strong style={{ color: TEXT }}>1-on-1 sessions</strong> are programmed separately, per client, after onboarding.
              </span>
            </div>
          </div>
          <PrimaryButton onClick={runGenerate} disabled={generating || !Object.values(selected).some(Boolean)}>
            {generating ? "Building your calendars…" : "Auto-populate calendars"} {!generating && <Icon name="sparkle" size={18} color={WHITE} />}
          </PrimaryButton>
        </>
      ) : (
        <>
          {/* Calendar header — styled like the live programming view */}
          <div style={{
            background: WHITE, border: `1px solid ${BORDER}`, borderRadius: "16px 16px 0 0",
            borderBottom: "none", padding: "16px 18px",
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: active.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon name="calendar" size={20} color={active.color} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: TEXT, lineHeight: 1.2 }}>{active.type} Programming</div>
                {activeStyle && (
                  <div style={{ fontSize: 12.5, color: TEXT_SEC, marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: activeStyle.color }} />
                    {activeStyle.name} · 4-week block
                  </div>
                )}
              </div>
            </div>

            {/* Class dropdown (Group / Semi-Private) — replaces client dropdown */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setClassDropOpen((v) => !v)}
                style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "9px 14px", borderRadius: 9,
                  background: active.bg, border: `1px solid ${active.color}`, cursor: "pointer",
                  fontFamily: "inherit", fontSize: 13.5, fontWeight: 700, color: active.color, transition: "all 0.15s ease",
                }}
              >
                <Icon name="users" size={16} color={active.color} />
                <span>{active.type}</span>
                <span style={{ transform: classDropOpen ? "rotate(-90deg)" : "rotate(90deg)", display: "inline-flex", transition: "transform 0.15s ease" }}>
                  <Icon name="back" size={13} color={active.color} strokeWidth={2.4} />
                </span>
              </button>
              {classDropOpen && (
                <div style={{
                  position: "absolute", top: "100%", right: 0, marginTop: 6, zIndex: 50,
                  background: WHITE, borderRadius: 10, border: `1px solid ${BORDER}`,
                  boxShadow: "0 12px 30px rgba(0,0,0,0.14)", minWidth: 220, overflow: "hidden",
                }}>
                  {availableTabs.map((t, i) => {
                    const sel = t.id === active.id;
                    const st = programs[t.id]?.[0]?.styleId ? STYLE_BY_ID[programs[t.id][0].styleId] : null;
                    return (
                      <button key={t.id} onClick={() => { setActiveTab(t.id); setClassDropOpen(false); }} style={{
                        width: "100%", textAlign: "left", fontFamily: "inherit", cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 10, padding: "11px 14px",
                        background: sel ? t.bg : WHITE, border: "none",
                        borderBottom: i < availableTabs.length - 1 ? `1px solid ${BORDER}` : "none",
                      }}>
                        <span style={{ width: 28, height: 28, borderRadius: 8, background: t.bg, color: t.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Icon name="users" size={15} color={t.color} />
                        </span>
                        <span style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ display: "block", fontSize: 13.5, fontWeight: 700, color: TEXT }}>{t.type}</span>
                          <span style={{ display: "block", fontSize: 11, color: TEXT_SEC }}>{st ? st.name : `${programs[t.id].length} sessions`}</span>
                        </span>
                        {sel && <Icon name="check" size={15} color={t.color} strokeWidth={2.5} />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <ProgramCalendar
            type={active}
            sessions={programs[active.id]}
            onSessionClick={setOpenSession}
            attached
          />

          <PrimaryButton onClick={onContinue}>
            Tag coaches to sessions <Icon name="arrow" size={18} color={WHITE} />
          </PrimaryButton>
        </>
      )}

      {openSession && (
        <WorkoutEditor
          session={openSession}
          movements={INITIAL_MOVEMENTS}
          onClose={() => setOpenSession(null)}
          onSave={updateSession}
        />
      )}
    </div>
  );
}

// ── Per-type program calendar (4 weeks × that type's training days) ──
// Styled to match the live programming view: colored category header band per
// day cell, exercise list with "Nx" prefix and "reps · load" subtext.
function ProgramCalendar({ type, sessions, onSessionClick, coachAssign, attached }) {
  const days = TYPE_DAYS[type.id];
  const weeks = [1, 2, 3, 4];
  return (
    <div style={{
      background: WHITE, border: `1px solid ${BORDER}`,
      borderRadius: attached ? "0 0 16px 16px" : 16, borderTop: attached ? "none" : `1px solid ${BORDER}`,
      overflow: "hidden",
    }}>
      <div style={{ padding: 14, overflowX: "auto" }}>
        <div style={{ minWidth: days.length * 150 }}>
          {/* Day-of-week header row */}
          <div style={{ display: "grid", gridTemplateColumns: `48px repeat(${days.length}, 1fr)`, gap: 8, marginBottom: 8 }}>
            <div />
            {days.map((d) => (
              <div key={d} style={{ fontSize: 11, fontWeight: 700, color: TEXT_SEC, textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left", paddingLeft: 4 }}>{d}</div>
            ))}
          </div>
          {weeks.map((wk) => (
            <div key={wk} style={{ display: "grid", gridTemplateColumns: `48px repeat(${days.length}, 1fr)`, gap: 8, marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: TEXT_SEC }}>WK{wk}</div>
              {days.map((day) => {
                const sess = sessions.find((s) => s.week === wk && s.day === day);
                if (!sess) return <div key={day} style={{ background: "#f6f8f7", borderRadius: 10, minHeight: 150, border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", color: "#b7c5c1", fontSize: 11, fontStyle: "italic" }}>Rest</div>;
                const coach = coachAssign ? ONBOARDING_COACHES.find((c) => c.id === sess.coachId) : null;
                const cat = /Conditioning/.test(sess.focus) ? "CONDITIONING" : "STRENGTH";
                return (
                  <button key={day} onClick={() => onSessionClick && onSessionClick(sess)} style={{
                    textAlign: "left", fontFamily: "inherit", cursor: onSessionClick ? "pointer" : "default", padding: 0,
                    background: WHITE, borderRadius: 10, minHeight: 150, overflow: "hidden",
                    border: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", transition: "all 0.15s ease",
                  }}
                    onMouseEnter={(e) => { if (onSessionClick) { e.currentTarget.style.borderColor = type.color; e.currentTarget.style.boxShadow = `0 4px 12px ${type.color}22`; } }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    {/* Category header band */}
                    <div style={{ padding: "7px 10px", background: type.bg, borderBottom: `1px solid ${type.color}22`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                      <span style={{ fontSize: 10, fontWeight: 800, color: type.color, textTransform: "uppercase", letterSpacing: "0.04em" }}>{cat}</span>
                      {coach && (
                        <span style={{ width: 17, height: 17, borderRadius: "50%", background: coach.color, color: WHITE, fontSize: 8.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{coach.initials}</span>
                      )}
                    </div>
                    {/* Exercise list */}
                    <div style={{ flex: 1, padding: "4px 0" }}>
                      {sess.exercises.slice(0, 3).map((ex, i) => (
                        <div key={ex.id} style={{ padding: "5px 10px", display: "flex", alignItems: "flex-start", gap: 7, borderBottom: i < Math.min(sess.exercises.length, 3) - 1 ? `1px solid #f0f4f3` : "none" }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: type.color, minWidth: 18 }}>{ex.sets}x</span>
                          <span style={{ flex: 1, minWidth: 0 }}>
                            <span style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ex.name}</span>
                            <span style={{ display: "block", fontSize: 9.5, color: TEXT_SEC, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ex.reps} reps · {ex.load}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                    {/* Footer cue */}
                    <div style={{ padding: "5px 10px", borderTop: `1px solid #f0f4f3` }}>
                      {coachAssign ? (
                        coach ? (
                          <span style={{ fontSize: 9.5, color: TEXT_SEC, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{coach.name.split(" ")[0]}</span>
                        ) : (
                          <span style={{ fontSize: 9.5, fontWeight: 700, color: "#b08900", background: "#fff7e0", borderRadius: 5, padding: "2px 6px" }}>Tag coach</span>
                        )
                      ) : (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 9.5, fontWeight: 600, color: type.color }}>
                          <Icon name="edit" size={10} color={type.color} /> {sess.exercises.length} exercises
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      {/* Footer hint — mirrors the live view */}
      <div style={{ padding: "11px 16px", borderTop: `1px solid ${BORDER}`, background: "#f8faf9", display: "flex", alignItems: "center", gap: 8 }}>
        <Icon name="info" size={14} color={type.color} />
        <span style={{ fontSize: 12, color: TEXT_SEC }}>Click any session to view or edit exercises</span>
      </div>
    </div>
  );
}

// ── Workout editor modal ──
function WorkoutEditor({ session, movements, onClose, onSave }) {
  const type = TEMPLATE_TYPES.find((t) => t.id === session.typeId);
  const [exercises, setExercises] = useState(session.exercises.map((e) => ({ ...e })));
  const [adding, setAdding] = useState(false);
  const [pickId, setPickId] = useState(movements[0]?.id || "");

  const update = (id, field, value) => setExercises((prev) => prev.map((e) => e.id === id ? { ...e, [field]: value } : e));
  const remove = (id) => setExercises((prev) => prev.filter((e) => e.id !== id));
  const addExercise = () => {
    const m = movements.find((mm) => mm.id === pickId);
    if (!m) return;
    setExercises((prev) => [...prev, { id: `${m.id}-${Date.now()}`, movementId: m.id, name: m.name, sets: "3", reps: "10", load: "RPE 7" }]);
    setAdding(false);
  };

  const save = () => { onSave({ ...session, exercises }); onClose(); };

  const cell = { fontSize: 13, fontFamily: "inherit", color: TEXT, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "6px 8px", outline: "none", width: "100%", background: WHITE };

  return (
    <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(20,40,38,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60, padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: WHITE, borderRadius: 18, width: "min(560px, 100%)", maxHeight: "88%", overflowY: "auto", boxShadow: "0 24px 60px rgba(0,0,0,0.25)" }}>
        {/* Header */}
        <div style={{ padding: "20px 22px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, position: "sticky", top: 0, background: WHITE, borderRadius: "18px 18px 0 0" }}>
          <div>
            <span style={{ fontSize: 12, fontWeight: 700, color: type.color, background: type.bg, padding: "4px 10px", borderRadius: 20 }}>{type.type}</span>
            <div style={{ fontSize: 18, fontWeight: 800, color: TEXT, marginTop: 8 }}>{session.focus}</div>
            <div style={{ fontSize: 13, color: TEXT_SEC, marginTop: 2 }}>Week {session.week} · {session.day}</div>
          </div>
          <button onClick={onClose} style={{ ...iconBtn, border: `1px solid ${BORDER}`, padding: 7 }}><Icon name="x" size={16} color={TEXT_SEC} /></button>
        </div>

        {/* Exercise table */}
        <div style={{ padding: "16px 22px", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 52px 52px 88px 28px", gap: 8, fontSize: 11, fontWeight: 700, color: TEXT_SEC, textTransform: "uppercase", letterSpacing: "0.04em", padding: "0 2px" }}>
            <span>Movement</span><span>Sets</span><span>Reps</span><span>Load</span><span />
          </div>
          {exercises.map((ex) => (
            <div key={ex.id} style={{ display: "grid", gridTemplateColumns: "1fr 52px 52px 88px 28px", gap: 8, alignItems: "center" }}>
              <input value={ex.name} onChange={(e) => update(ex.id, "name", e.target.value)} style={cell} />
              <input value={ex.sets} onChange={(e) => update(ex.id, "sets", e.target.value)} style={{ ...cell, textAlign: "center" }} />
              <input value={ex.reps} onChange={(e) => update(ex.id, "reps", e.target.value)} style={{ ...cell, textAlign: "center" }} />
              <input value={ex.load} onChange={(e) => update(ex.id, "load", e.target.value)} style={{ ...cell, textAlign: "center" }} />
              <button onClick={() => remove(ex.id)} style={iconBtn}><Icon name="trash" size={15} color={TEXT_SEC} /></button>
            </div>
          ))}

          {adding ? (
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4 }}>
              <select value={pickId} onChange={(e) => setPickId(e.target.value)} style={{ ...cell, flex: 1, cursor: "pointer" }}>
                {MOVEMENT_CATEGORIES.map((cat) => (
                  <optgroup key={cat} label={cat}>
                    {movements.filter((m) => m.category === cat).map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </optgroup>
                ))}
              </select>
              <button onClick={addExercise} style={{ padding: "8px 14px", borderRadius: 9, border: "none", background: type.color, color: WHITE, fontSize: 13, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>Add</button>
              <button onClick={() => setAdding(false)} style={{ ...iconBtn, border: `1px solid ${BORDER}`, padding: 7 }}><Icon name="x" size={15} color={TEXT_SEC} /></button>
            </div>
          ) : (
            <button onClick={() => setAdding(true)} style={{
              marginTop: 4, display: "flex", alignItems: "center", gap: 6, alignSelf: "flex-start", fontFamily: "inherit",
              fontSize: 13, fontWeight: 600, color: type.color, background: "transparent", border: "none", cursor: "pointer", padding: "4px 0",
            }}>
              <Icon name="plus" size={15} color={type.color} /> Add exercise
            </button>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 22px", borderTop: `1px solid ${BORDER}`, display: "flex", justifyContent: "flex-end", gap: 10, position: "sticky", bottom: 0, background: WHITE, borderRadius: "0 0 18px 18px" }}>
          <button onClick={onClose} style={{ padding: "11px 18px", borderRadius: 11, border: `1.5px solid ${BORDER}`, background: WHITE, color: TEXT, fontSize: 14, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>Cancel</button>
          <button onClick={save} style={{ padding: "11px 20px", borderRadius: 11, border: "none", background: MINT, color: WHITE, fontSize: 14, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>Save workout</button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════ STEP 5: COACHES ════════════════════════
function CoachesStep({ programs, setPrograms, onContinue }) {
  const [activeTab, setActiveTab] = useState(TEMPLATE_TYPES.find((t) => programs[t.id])?.id || "group");
  const [activeSession, setActiveSession] = useState(null);

  const allSessions = Object.values(programs).flat();
  const taggedCount = allSessions.filter((s) => s.coachId).length;
  const allTagged = taggedCount === allSessions.length && allSessions.length > 0;

  const assignCoach = (coachId) => {
    setPrograms((prev) => ({
      ...prev,
      [activeSession.typeId]: prev[activeSession.typeId].map((s) => s.id === activeSession.id ? { ...s, coachId } : s),
    }));
    setActiveSession(null);
  };

  const bulkAssign = (typeId, coachId) => {
    setPrograms((prev) => ({ ...prev, [typeId]: prev[typeId].map((s) => ({ ...s, coachId })) }));
  };

  const availableTabs = TEMPLATE_TYPES.filter((t) => programs[t.id]);
  const active = TEMPLATE_TYPES.find((t) => t.id === activeTab);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: TEXT, margin: 0, letterSpacing: "-0.02em" }}>
          Tag your coaches.
        </h1>
        <p style={{ fontSize: 15, color: TEXT_SEC, margin: "10px 0 0", maxWidth: 640, lineHeight: 1.5 }}>
          Assign a coach to each session across all three calendars — group, semi-private, and 1-on-1. Click any session, or bulk-assign a whole calendar below.
        </p>
      </div>

      {/* Quick assign for the active calendar */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, background: "#f1f7f5", borderRadius: 14, padding: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>Quick assign all {active.type} sessions to</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {ONBOARDING_COACHES.map((c) => (
            <button key={c.id} onClick={() => bulkAssign(active.id, c.id)} style={{
              display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 13px", borderRadius: 20,
              border: `1px solid ${BORDER}`, background: WHITE, cursor: "pointer", fontFamily: "inherit", fontSize: 12.5, fontWeight: 600, color: TEXT,
            }}>
              <span style={{ width: 18, height: 18, borderRadius: "50%", background: c.color, color: WHITE, fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{c.initials}</span>
              {c.name.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Progress */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ flex: 1, height: 8, borderRadius: 8, background: "#e6efec", overflow: "hidden" }}>
          <div style={{ width: `${allSessions.length ? (taggedCount / allSessions.length) * 100 : 0}%`, height: "100%", background: MINT, transition: "width 0.3s ease" }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: allTagged ? "#1f7a3e" : TEXT_SEC }}>{taggedCount} / {allSessions.length} tagged</span>
      </div>

      {/* Calendar tabs */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {availableTabs.map((t) => {
          const on = activeTab === t.id;
          const tagged = programs[t.id].filter((s) => s.coachId).length;
          return (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 16px", borderRadius: 11, fontFamily: "inherit",
              fontSize: 14, fontWeight: 700, cursor: "pointer",
              border: `1.5px solid ${on ? t.color : BORDER}`,
              background: on ? t.bg : WHITE, color: on ? t.color : TEXT_SEC, transition: "all 0.15s ease",
            }}>
              {t.type}
              <span style={{ fontSize: 11, fontWeight: 700, opacity: 0.85 }}>{tagged}/{programs[t.id].length}</span>
            </button>
          );
        })}
      </div>

      <ProgramCalendar type={active} sessions={programs[active.id]} coachAssign onSessionClick={setActiveSession} />

      <PrimaryButton onClick={onContinue} disabled={!allTagged}>
        {allTagged ? "Send to coaches for review" : "Tag every session to continue"} <Icon name="send" size={17} color={WHITE} />
      </PrimaryButton>

      {/* Coach picker modal */}
      {activeSession && (
        <div onClick={() => setActiveSession(null)} style={{ position: "absolute", inset: 0, background: "rgba(20,40,38,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: WHITE, borderRadius: 18, padding: 24, width: "min(380px, 100%)", boxShadow: "0 20px 50px rgba(0,0,0,0.2)" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: active.color }}>{active.type} · Week {activeSession.week} · {activeSession.day}</div>
            <div style={{ fontSize: 15, color: TEXT_SEC, margin: "2px 0 0" }}>{activeSession.focus}</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: TEXT, margin: "12px 0 16px" }}>Assign a coach</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {ONBOARDING_COACHES.map((c) => (
                <button key={c.id} onClick={() => assignCoach(c.id)} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12,
                  border: `1px solid ${activeSession.coachId === c.id ? c.color : BORDER}`, background: activeSession.coachId === c.id ? `${c.color}12` : WHITE,
                  cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                }}>
                  <span style={{ width: 34, height: 34, borderRadius: "50%", background: c.color, color: WHITE, fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{c.initials}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: TEXT_SEC }}>{c.specialty}</div>
                  </div>
                  {activeSession.coachId === c.id && <Icon name="check" size={18} color={c.color} strokeWidth={2.5} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════ STEP 6: REVIEW / DONE ════════════════════════
function ReviewStep({ programs, files, onReturning, onFinish }) {
  const allSessions = Object.values(programs).flat();
  const byType = TEMPLATE_TYPES.filter((t) => programs[t.id]).map((t) => ({ ...t, count: programs[t.id].length }));
  const coaches = [...new Set(allSessions.map((s) => s.coachId))].map((id) => ONBOARDING_COACHES.find((c) => c.id === id)).filter(Boolean);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, alignItems: "center", textAlign: "center", paddingTop: 12 }}>
      <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#e6f9ec", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name="check" size={36} color="#1f7a3e" strokeWidth={2.5} />
      </div>
      <div>
        <h1 style={{ fontSize: 30, fontWeight: 800, color: TEXT, margin: 0, letterSpacing: "-0.02em" }}>Sent for review.</h1>
        <p style={{ fontSize: 16, color: TEXT_SEC, margin: "12px 0 0", maxWidth: 520, lineHeight: 1.5 }}>
          Your first month is built across all three calendars and on its way to your coaches. They&apos;ll get a notification to review their tagged sessions before anything goes live.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14, width: "100%", maxWidth: 620 }}>
        {[
          { label: "Files learned", value: files?.length || 3 },
          { label: "Sessions built", value: allSessions.length },
          { label: "Weeks programmed", value: 4 },
          { label: "Coaches tagged", value: coaches.length },
        ].map((stat) => (
          <div key={stat.label} style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "18px 14px" }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: TEAL }}>{stat.value}</div>
            <div style={{ fontSize: 12.5, color: TEXT_SEC, marginTop: 2 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
        {byType.map((t) => (
          <span key={t.id} style={{ fontSize: 12.5, fontWeight: 700, color: t.color, background: t.bg, padding: "6px 14px", borderRadius: 20 }}>{t.type} — {t.count}</span>
        ))}
      </div>

      <div style={{ background: TEAL_LIGHT, borderRadius: 16, padding: "20px 24px", maxWidth: 560, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
          <Icon name="calendar" size={18} color={TEAL} />
          <span style={{ fontSize: 14, fontWeight: 700, color: TEAL }}>What happens from here</span>
        </div>
        <p style={{ fontSize: 14, color: TEXT_SEC, margin: 0, lineHeight: 1.55 }}>
          From now on you pick up right from your programming calendar — no more uploads. Each cycle you&apos;ll build out the next four weeks on top of what&apos;s already there.
        </p>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <PrimaryButton onClick={onReturning}>
          Build the next 4 weeks <Icon name="arrow" size={18} color={WHITE} />
        </PrimaryButton>
        <button onClick={onFinish} style={{
          padding: "14px 26px", borderRadius: 14, border: `1.5px solid ${BORDER}`, background: WHITE,
          color: TEXT, fontSize: 15, fontWeight: 700, fontFamily: "inherit", cursor: "pointer",
        }}>Done for now</button>
      </div>
    </div>
  );
}

// ════════════════════════ RETURNING FLOW ════════════════════════
function ReturningStep({ programs, onFinish }) {
  const [nextPrograms, setNextPrograms] = useState({});
  const [activeTab, setActiveTab] = useState(TEMPLATE_TYPES.find((t) => programs[t.id])?.id || "group");
  const [openSession, setOpenSession] = useState(null);
  const built = Object.keys(nextPrograms).length > 0;

  const baseCount = Object.values(programs).flat().length;

  const buildNext = () => {
    const next = {};
    Object.entries(programs).forEach(([typeId, sessions]) => {
      next[typeId] = sessions.map((s) => ({ ...s, id: `next-${s.id}`, week: s.week + 4, exercises: s.exercises.map((e) => ({ ...e })) }));
    });
    setNextPrograms(next);
  };

  const updateSession = (updated) => {
    setNextPrograms((prev) => ({ ...prev, [updated.typeId]: prev[updated.typeId].map((s) => s.id === updated.id ? updated : s) }));
    setOpenSession(updated);
  };

  const availableTabs = TEMPLATE_TYPES.filter((t) => nextPrograms[t.id]);
  const active = TEMPLATE_TYPES.find((t) => t.id === activeTab);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: TEXT, margin: 0, letterSpacing: "-0.02em" }}>
          Pick up where you left off.
        </h1>
        <p style={{ fontSize: 15, color: TEXT_SEC, margin: "10px 0 0", maxWidth: 640, lineHeight: 1.5 }}>
          Your first month is live. Now we build the next four weeks straight off your existing calendars — same templates, same coaches, progressed loads. Click any session to fine-tune it. No uploads needed.
        </p>
      </div>

      <div style={{ background: "#f1f7f5", borderRadius: 14, padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: WHITE, display: "flex", alignItems: "center", justifyContent: "center", color: "#1f7a3e" }}>
          <Icon name="check" size={20} color="#1f7a3e" strokeWidth={2.5} />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>Weeks 1–4 · Published</div>
          <div style={{ fontSize: 13, color: TEXT_SEC }}>{baseCount} sessions running across all calendars, coaches assigned</div>
        </div>
      </div>

      {!built ? (
        <PrimaryButton onClick={buildNext}>
          Build weeks 5–8 from these calendars <Icon name="sparkle" size={18} color={WHITE} />
        </PrimaryButton>
      ) : (
        <>
          <div style={{ fontSize: 13, fontWeight: 700, color: TEXT_SEC, textTransform: "uppercase", letterSpacing: "0.05em" }}>Next block — weeks 5–8</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {availableTabs.map((t) => {
              const on = activeTab === t.id;
              return (
                <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                  display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 16px", borderRadius: 11, fontFamily: "inherit",
                  fontSize: 14, fontWeight: 700, cursor: "pointer",
                  border: `1.5px solid ${on ? t.color : BORDER}`,
                  background: on ? t.bg : WHITE, color: on ? t.color : TEXT_SEC, transition: "all 0.15s ease",
                }}>
                  {t.type}<span style={{ fontSize: 11, fontWeight: 700, opacity: 0.85 }}>{nextPrograms[t.id].length}</span>
                </button>
              );
            })}
          </div>
          <ProgramCalendarWeeks type={active} sessions={nextPrograms[active.id]} onSessionClick={setOpenSession} />
          <PrimaryButton onClick={onFinish}>
            Send block to coaches <Icon name="send" size={17} color={WHITE} />
          </PrimaryButton>
        </>
      )}

      {openSession && (
        <WorkoutEditor session={openSession} movements={INITIAL_MOVEMENTS} onClose={() => setOpenSession(null)} onSave={updateSession} />
      )}
    </div>
  );
}

// Calendar variant for arbitrary week numbers (weeks 5-8)
function ProgramCalendarWeeks({ type, sessions, onSessionClick }) {
  const days = TYPE_DAYS[type.id];
  const weeks = [...new Set(sessions.map((s) => s.week))].sort((a, b) => a - b);
  return (
    <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 16, overflowX: "auto" }}>
      <div style={{ minWidth: days.length * 130 }}>
        <div style={{ display: "grid", gridTemplateColumns: `64px repeat(${days.length}, 1fr)`, gap: 8, marginBottom: 8 }}>
          <div />
          {days.map((d) => <div key={d} style={{ fontSize: 12, fontWeight: 700, color: TEXT_SEC, textTransform: "uppercase", letterSpacing: "0.04em", textAlign: "center" }}>{d}</div>)}
        </div>
        {weeks.map((wk) => (
          <div key={wk} style={{ display: "grid", gridTemplateColumns: `64px repeat(${days.length}, 1fr)`, gap: 8, marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", fontSize: 11, fontWeight: 700, color: TEXT_SEC }}>WK {wk}</div>
            {days.map((day) => {
              const sess = sessions.find((s) => s.week === wk && s.day === day);
              if (!sess) return <div key={day} style={{ background: "#f1f5f4", borderRadius: 10, minHeight: 86 }} />;
              const coach = ONBOARDING_COACHES.find((c) => c.id === sess.coachId);
              return (
                <button key={day} onClick={() => onSessionClick(sess)} style={{
                  textAlign: "left", fontFamily: "inherit", cursor: "pointer",
                  background: type.bg, borderRadius: 10, padding: 10, minHeight: 86,
                  border: `1px solid ${type.color}33`, display: "flex", flexDirection: "column", gap: 5,
                }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: type.color, lineHeight: 1.25 }}>{sess.focus}</div>
                  <div style={{ fontSize: 11, color: TEXT_SEC }}>{sess.exercises.length} exercises</div>
                  {coach && (
                    <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ width: 18, height: 18, borderRadius: "50%", background: coach.color, color: WHITE, fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{coach.initials}</span>
                      <span style={{ fontSize: 10, color: TEXT_SEC }}>{coach.name.split(" ")[0]}</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════ MAIN CANVAS ════════════════════════
export default function GymOnboardingCanvas({ onClose, onHome, isMobile }) {
  const [step, setStep] = useState("upload");
  const [files, setFiles] = useState([]);
  const [movements, setMovements] = useState(INITIAL_MOVEMENTS);
  const [approvedTemplates, setApprovedTemplates] = useState({});
  const [programs, setPrograms] = useState({}); // { group: [...], semi: [...], pt: [...] }

  const railIndex = { upload: 0, processing: 0, exercises: 1, templates: 2, generate: 3, coaches: 4, review: 5, returning: 5 }[step];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", position: "relative", background: BG, fontFamily: "inherit" }}>
      <style>{`@keyframes gymDot { 0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; } 40% { transform: scale(1); opacity: 1; } } .gymMoveRow:hover { background: ${BG}; }`}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: isMobile ? "14px 16px" : "16px 28px", borderBottom: `1px solid ${BORDER}`, background: WHITE, flexShrink: 0 }}>
        <button onClick={onHome} style={{ width: 34, height: 34, borderRadius: 10, border: `1px solid ${BORDER}`, background: WHITE, color: TEXT_SEC, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name="back" size={18} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: TEXT, whiteSpace: "nowrap" }}>Gym Onboarding</div>
          {!isMobile && <div style={{ fontSize: 12, color: TEXT_SEC }}>From your files to a live programming calendar</div>}
        </div>
        <StepRail currentIndex={railIndex} isMobile={isMobile} />
        <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 10, border: `1px solid ${BORDER}`, background: WHITE, color: TEXT_SEC, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name="x" size={18} />
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "20px 16px 40px" : "36px 40px 48px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          {step === "upload" && (
            <UploadStep onContinue={(f) => { setFiles(f); setStep("processing"); }} />
          )}
          {step === "processing" && (
            <ProcessingStep onDone={() => setStep("exercises")} />
          )}
          {step === "exercises" && (
            <ExercisesStep movements={movements} setMovements={setMovements} onContinue={() => setStep("templates")} />
          )}
          {step === "templates" && (
            <TemplatesStep approved={approvedTemplates} setApproved={setApprovedTemplates} onContinue={() => setStep("generate")} />
          )}
          {step === "generate" && (
            <GenerateStep programs={programs} setPrograms={setPrograms} approvedTemplates={approvedTemplates} onContinue={() => setStep("coaches")} />
          )}
          {step === "coaches" && (
            <CoachesStep programs={programs} setPrograms={setPrograms} onContinue={() => setStep("review")} />
          )}
          {step === "review" && (
            <ReviewStep programs={programs} files={files} onReturning={() => setStep("returning")} onFinish={onClose} />
          )}
          {step === "returning" && (
            <ReturningStep programs={programs} onFinish={onClose} />
          )}
        </div>
      </div>
    </div>
  );
}
