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
const AMBER = "#92400e";
const AMBER_BG = "#fef3c7";

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

// ── Mock "extracted" data ──
const EXTRACTED_EXERCISES = [
  { name: "Back Squat", category: "Lower — Squat", source: "extracted" },
  { name: "Front Squat", category: "Lower — Squat", source: "extracted" },
  { name: "Romanian Deadlift", category: "Lower — Hinge", source: "extracted" },
  { name: "Conventional Deadlift", category: "Lower — Hinge", source: "extracted" },
  { name: "Bench Press", category: "Upper — Push", source: "extracted" },
  { name: "Strict Press", category: "Upper — Push", source: "extracted" },
  { name: "Pull-up", category: "Upper — Pull", source: "extracted" },
  { name: "Barbell Row", category: "Upper — Pull", source: "extracted" },
  { name: "KB Swing", category: "Conditioning", source: "extracted" },
  { name: "Assault Bike", category: "Conditioning", source: "extracted" },
  { name: "Walking Lunge", category: "Lower — Unilateral", source: "extracted" },
  { name: "Plank", category: "Core", source: "extracted" },
  // Milton library fills the gaps
  { name: "Bulgarian Split Squat", category: "Lower — Unilateral", source: "milton" },
  { name: "Hip Thrust", category: "Lower — Hinge", source: "milton" },
  { name: "Incline DB Press", category: "Upper — Push", source: "milton" },
  { name: "Face Pull", category: "Upper — Pull", source: "milton" },
  { name: "Dead Bug", category: "Core", source: "milton" },
  { name: "Row Intervals", category: "Conditioning", source: "milton" },
];

const EXTRACTED_TEMPLATES = [
  {
    id: "group",
    type: "Group",
    color: "#c2410c",
    bg: "#fff1ea",
    name: "Group Strength + Conditioning",
    cadence: "5 days / week",
    sessionLen: "60 min",
    blocks: ["Warm-up flow", "Primary strength lift", "Conditioning piece", "Accessory / core", "Cool-down"],
    notes: "Up to 12 members off one shared board, scaled loads per member.",
  },
  {
    id: "semi",
    type: "Semi-Private",
    color: "#1f7a3e",
    bg: "#e6f9ec",
    name: "Semi-Private Progressions",
    cadence: "3 days / week",
    sessionLen: "60 min",
    blocks: ["Individual warm-up", "Strength block (per client)", "Shared finisher", "Mobility"],
    notes: "2–6 clients training together, each on their own progression.",
  },
  {
    id: "pt",
    type: "1-on-1",
    color: "#3aafa9",
    bg: "#e8f5f3",
    name: "1-on-1 Personalized Build",
    cadence: "2–3 days / week",
    sessionLen: "45–60 min",
    blocks: ["Movement prep", "Primary lift", "Secondary lift", "Accessory circuit", "Conditioning finisher"],
    notes: "Fully individualized programming driven by intake + assessment.",
  },
];

// Calendar generation — one month, 4 weeks
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const TEMPLATE_FOR_DAY = {
  // distribute the three template types across the week
  Mon: "group", Tue: "semi", Wed: "group", Thu: "pt", Fri: "group",
};

function buildMonthSessions() {
  const sessions = [];
  for (let week = 0; week < 4; week++) {
    WEEKDAYS.forEach((day) => {
      const tplId = TEMPLATE_FOR_DAY[day];
      const tpl = EXTRACTED_TEMPLATES.find((t) => t.id === tplId);
      sessions.push({
        id: `w${week + 1}-${day}`,
        week: week + 1,
        day,
        templateId: tplId,
        type: tpl.type,
        color: tpl.color,
        bg: tpl.bg,
        name: tpl.name,
        coachId: null,
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

// ════════════════════════ STEP 2: EXERCISES ════════════════════════
function ExercisesStep({ onContinue }) {
  const categories = [...new Set(EXTRACTED_EXERCISES.map((e) => e.category))];
  const extractedCount = EXTRACTED_EXERCISES.filter((e) => e.source === "extracted").length;
  const miltonCount = EXTRACTED_EXERCISES.filter((e) => e.source === "milton").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: TEXT, margin: 0, letterSpacing: "-0.02em" }}>
          Here are your movements.
        </h1>
        <p style={{ fontSize: 15, color: TEXT_SEC, margin: "10px 0 0", maxWidth: 600, lineHeight: 1.5 }}>
          I pulled <strong style={{ color: TEXT }}>{extractedCount} exercises</strong> straight from your uploads. The
          {" "}<strong style={{ color: TEAL }}>Milton library filled {miltonCount} gaps</strong> with movements your programming references.
        </p>
      </div>

      <div style={{ display: "flex", gap: 16 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, color: TEXT_SEC }}>
          <span style={{ width: 12, height: 12, borderRadius: 4, background: TEAL }} /> From your files
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, color: TEXT_SEC }}>
          <span style={{ width: 12, height: 12, borderRadius: 4, background: MINT }} /> Milton library
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
        {categories.map((cat) => {
          const items = EXTRACTED_EXERCISES.filter((e) => e.category === cat);
          return (
            <div key={cat} style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: TEXT_SEC, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 12 }}>{cat}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {items.map((ex) => (
                  <div key={ex.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <span style={{ fontSize: 14, color: TEXT, fontWeight: 500 }}>{ex.name}</span>
                    <span style={{
                      fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.03em",
                      padding: "3px 8px", borderRadius: 7,
                      background: ex.source === "milton" ? "#e7fbef" : TEAL_LIGHT,
                      color: ex.source === "milton" ? "#1f7a3e" : TEAL,
                    }}>{ex.source === "milton" ? "Milton" : "Yours"}</span>
                  </div>
                ))}
              </div>
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

// ════════════════════════ STEP 3: TEMPLATES ════════════════════════
function TemplatesStep({ approved, setApproved, onContinue }) {
  const allApproved = EXTRACTED_TEMPLATES.every((t) => approved[t.id]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: TEXT, margin: 0, letterSpacing: "-0.02em" }}>
          Your programming templates.
        </h1>
        <p style={{ fontSize: 15, color: TEXT_SEC, margin: "10px 0 0", maxWidth: 600, lineHeight: 1.5 }}>
          I found three structures in your work — one for each way you train clients. Approve each one and we&apos;ll use them to generate your programs.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 }}>
        {EXTRACTED_TEMPLATES.map((tpl) => {
          const isApproved = approved[tpl.id];
          return (
            <div key={tpl.id} style={{
              background: WHITE, borderRadius: 16, padding: 22,
              border: `1.5px solid ${isApproved ? tpl.color : BORDER}`,
              boxShadow: isApproved ? `0 6px 18px ${tpl.color}22` : "0 2px 8px rgba(0,0,0,0.04)",
              transition: "all 0.2s ease", display: "flex", flexDirection: "column", gap: 14,
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: tpl.color, background: tpl.bg, padding: "5px 12px", borderRadius: 20 }}>{tpl.type}</span>
                {isApproved && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: "#1f7a3e" }}>
                    <Icon name="check" size={14} color="#1f7a3e" strokeWidth={2.5} /> Approved
                  </span>
                )}
              </div>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, color: TEXT }}>{tpl.name}</div>
                <div style={{ fontSize: 13, color: TEXT_SEC, marginTop: 4 }}>{tpl.cadence} · {tpl.sessionLen}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {tpl.blocks.map((b, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13, color: TEXT }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: tpl.color, flexShrink: 0 }} />
                    {b}
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 12.5, color: TEXT_SEC, margin: 0, lineHeight: 1.5, fontStyle: "italic" }}>{tpl.notes}</p>
              <button
                onClick={() => setApproved((prev) => ({ ...prev, [tpl.id]: !prev[tpl.id] }))}
                style={{
                  marginTop: "auto", padding: "11px 16px", borderRadius: 11, fontFamily: "inherit",
                  fontSize: 14, fontWeight: 700, cursor: "pointer",
                  border: `1.5px solid ${isApproved ? "#1f7a3e" : tpl.color}`,
                  background: isApproved ? "#e6f9ec" : WHITE,
                  color: isApproved ? "#1f7a3e" : tpl.color,
                  transition: "all 0.15s ease",
                }}
              >
                {isApproved ? "Approved" : "Approve template"}
              </button>
            </div>
          );
        })}
      </div>

      <PrimaryButton onClick={onContinue} disabled={!allApproved}>
        {allApproved ? "Generate my first programs" : "Approve all three to continue"} <Icon name="arrow" size={18} color={WHITE} />
      </PrimaryButton>
    </div>
  );
}

// ════════════════════════ STEP 4: GENERATE ════════════════════════
function GenerateStep({ sessions, setSessions, generated, setGenerated, onContinue }) {
  const [selected, setSelected] = useState({ group: true, semi: true, pt: true });
  const [generating, setGenerating] = useState(false);

  const runGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      const built = buildMonthSessions().filter((s) => selected[s.templateId]);
      setSessions(built);
      setGenerated(true);
      setGenerating(false);
    }, 1400);
  };

  const countByType = (id) => sessions.filter((s) => s.templateId === id).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: TEXT, margin: 0, letterSpacing: "-0.02em" }}>
          Generate your first month.
        </h1>
        <p style={{ fontSize: 15, color: TEXT_SEC, margin: "10px 0 0", maxWidth: 600, lineHeight: 1.5 }}>
          Pick the templates to build from. I&apos;ll auto-populate a full <strong style={{ color: TEXT }}>4-week calendar</strong> with your movements. We start one month at a time — later you&apos;ll extend up to 12.
        </p>
      </div>

      {!generated ? (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            {EXTRACTED_TEMPLATES.map((tpl) => {
              const on = selected[tpl.id];
              return (
                <button key={tpl.id} onClick={() => setSelected((p) => ({ ...p, [tpl.id]: !p[tpl.id] }))} style={{
                  textAlign: "left", cursor: "pointer", fontFamily: "inherit",
                  background: on ? tpl.bg : WHITE, borderRadius: 14, padding: 18,
                  border: `1.5px solid ${on ? tpl.color : BORDER}`, transition: "all 0.15s ease",
                  display: "flex", flexDirection: "column", gap: 8,
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: tpl.color }}>{tpl.type}</span>
                    <span style={{
                      width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                      border: `1.5px solid ${on ? tpl.color : "#c8d6d2"}`, background: on ? tpl.color : WHITE,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>{on && <Icon name="check" size={13} color={WHITE} strokeWidth={3} />}</span>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>{tpl.name}</div>
                  <div style={{ fontSize: 12.5, color: TEXT_SEC }}>{tpl.cadence}</div>
                </button>
              );
            })}
          </div>
          <PrimaryButton onClick={runGenerate} disabled={generating || !Object.values(selected).some(Boolean)}>
            {generating ? "Building your calendar…" : "Auto-populate 4-week calendar"} {!generating && <Icon name="sparkle" size={18} color={WHITE} />}
          </PrimaryButton>
        </>
      ) : (
        <>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {EXTRACTED_TEMPLATES.filter((t) => countByType(t.id) > 0).map((t) => (
              <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 8, background: t.bg, borderRadius: 10, padding: "8px 14px" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: t.color }}>{t.type}</span>
                <span style={{ fontSize: 13, color: TEXT_SEC }}>{countByType(t.id)} sessions</span>
              </div>
            ))}
          </div>
          <CalendarGrid sessions={sessions} />
          <PrimaryButton onClick={onContinue}>
            Tag coaches to sessions <Icon name="arrow" size={18} color={WHITE} />
          </PrimaryButton>
        </>
      )}
    </div>
  );
}

// ── Shared calendar grid ──
function CalendarGrid({ sessions, onSessionClick, coachAssign }) {
  const weeks = [1, 2, 3, 4];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {weeks.map((wk) => (
        <div key={wk}>
          <div style={{ fontSize: 12, fontWeight: 700, color: TEXT_SEC, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Week {wk}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
            {WEEKDAYS.map((day) => {
              const sess = sessions.find((s) => s.week === wk && s.day === day);
              if (!sess) return <div key={day} style={{ background: "#f1f5f4", borderRadius: 10, minHeight: 78 }} />;
              const coach = coachAssign ? ONBOARDING_COACHES.find((c) => c.id === sess.coachId) : null;
              return (
                <div key={day}
                  onClick={() => onSessionClick && onSessionClick(sess)}
                  style={{
                    background: sess.bg, borderRadius: 10, padding: 11, minHeight: 78,
                    border: `1px solid ${sess.color}33`, cursor: onSessionClick ? "pointer" : "default",
                    display: "flex", flexDirection: "column", gap: 6, transition: "all 0.15s ease",
                  }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: TEXT_SEC }}>{day}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: sess.color }}>{sess.type}</div>
                  {coachAssign && (
                    coach ? (
                      <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 5 }}>
                        <span style={{ width: 18, height: 18, borderRadius: "50%", background: coach.color, color: WHITE, fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{coach.initials}</span>
                        <span style={{ fontSize: 10, color: TEXT_SEC, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{coach.name.split(" ")[0]}</span>
                      </div>
                    ) : (
                      <div style={{ marginTop: "auto", fontSize: 10, fontWeight: 600, color: "#b08900", background: "#fff7e0", borderRadius: 6, padding: "2px 6px", display: "inline-block", width: "fit-content" }}>Tag coach</div>
                    )
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ════════════════════════ STEP 5: COACHES ════════════════════════
function CoachesStep({ sessions, setSessions, onContinue, isMobile }) {
  const [activeSession, setActiveSession] = useState(null);
  const taggedCount = sessions.filter((s) => s.coachId).length;
  const allTagged = taggedCount === sessions.length;

  const assignCoach = (coachId) => {
    setSessions((prev) => prev.map((s) => s.id === activeSession.id ? { ...s, coachId } : s));
    setActiveSession(null);
  };

  const bulkAssign = (templateId, coachId) => {
    setSessions((prev) => prev.map((s) => s.templateId === templateId ? { ...s, coachId } : s));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: TEXT, margin: 0, letterSpacing: "-0.02em" }}>
          Tag your coaches.
        </h1>
        <p style={{ fontSize: 15, color: TEXT_SEC, margin: "10px 0 0", maxWidth: 600, lineHeight: 1.5 }}>
          Assign a coach to each session across all three types — 1-on-1, semi-private, and group. Click any session in the calendar, or bulk-assign a whole template below.
        </p>
      </div>

      {/* Bulk assign row */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, background: "#f1f7f5", borderRadius: 14, padding: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>Quick assign by template</div>
        {EXTRACTED_TEMPLATES.filter((t) => sessions.some((s) => s.templateId === t.id)).map((t) => (
          <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: t.color, minWidth: 92 }}>{t.type}</span>
            {ONBOARDING_COACHES.map((c) => (
              <button key={c.id} onClick={() => bulkAssign(t.id, c.id)} style={{
                display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 20,
                border: `1px solid ${BORDER}`, background: WHITE, cursor: "pointer", fontFamily: "inherit", fontSize: 12.5, fontWeight: 600, color: TEXT,
              }}>
                <span style={{ width: 18, height: 18, borderRadius: "50%", background: c.color, color: WHITE, fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{c.initials}</span>
                {c.name.split(" ")[0]}
              </button>
            ))}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ flex: 1, height: 8, borderRadius: 8, background: "#e6efec", overflow: "hidden" }}>
          <div style={{ width: `${(taggedCount / sessions.length) * 100}%`, height: "100%", background: MINT, transition: "width 0.3s ease" }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: allTagged ? "#1f7a3e" : TEXT_SEC }}>{taggedCount} / {sessions.length} tagged</span>
      </div>

      <CalendarGrid sessions={sessions} coachAssign onSessionClick={setActiveSession} />

      <PrimaryButton onClick={onContinue} disabled={!allTagged}>
        {allTagged ? "Send to coaches for review" : "Tag every session to continue"} <Icon name="send" size={17} color={WHITE} />
      </PrimaryButton>

      {/* Coach picker modal */}
      {activeSession && (
        <div onClick={() => setActiveSession(null)} style={{ position: "absolute", inset: 0, background: "rgba(20,40,38,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: WHITE, borderRadius: 18, padding: 24, width: "min(380px, 100%)", boxShadow: "0 20px 50px rgba(0,0,0,0.2)" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: activeSession.color }}>{activeSession.type} · Week {activeSession.week} · {activeSession.day}</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: TEXT, margin: "4px 0 18px" }}>Assign a coach</div>
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
function ReviewStep({ sessions, files, onReturning, onFinish }) {
  const byType = EXTRACTED_TEMPLATES.map((t) => ({ ...t, count: sessions.filter((s) => s.templateId === t.id).length })).filter((t) => t.count > 0);
  const coaches = [...new Set(sessions.map((s) => s.coachId))].map((id) => ONBOARDING_COACHES.find((c) => c.id === id)).filter(Boolean);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, alignItems: "center", textAlign: "center", paddingTop: 12 }}>
      <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#e6f9ec", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name="check" size={36} color="#1f7a3e" strokeWidth={2.5} />
      </div>
      <div>
        <h1 style={{ fontSize: 30, fontWeight: 800, color: TEXT, margin: 0, letterSpacing: "-0.02em" }}>Sent for review.</h1>
        <p style={{ fontSize: 16, color: TEXT_SEC, margin: "12px 0 0", maxWidth: 520, lineHeight: 1.5 }}>
          Your first month is built and on its way to your coaches. They&apos;ll get a notification to review their tagged sessions before anything goes live.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14, width: "100%", maxWidth: 620 }}>
        {[
          { label: "Files learned", value: files?.length || 3 },
          { label: "Sessions built", value: sessions.length },
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
function ReturningStep({ baseSessions, onFinish }) {
  // Existing 4 weeks already programmed; building the NEXT block (weeks 5-8)
  const [nextSessions, setNextSessions] = useState([]);
  const [built, setBuilt] = useState(false);

  const buildNext = () => {
    const next = baseSessions.map((s) => ({
      ...s,
      id: `next-${s.id}`,
      week: s.week + 4,
    }));
    setNextSessions(next);
    setBuilt(true);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: TEXT, margin: 0, letterSpacing: "-0.02em" }}>
          Pick up where you left off.
        </h1>
        <p style={{ fontSize: 15, color: TEXT_SEC, margin: "10px 0 0", maxWidth: 600, lineHeight: 1.5 }}>
          Your first month is live. Now we build the next four weeks straight off your existing calendar — same templates, same coaches, progressed loads. No uploads needed.
        </p>
      </div>

      {/* Existing month summary */}
      <div style={{ background: "#f1f7f5", borderRadius: 14, padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: WHITE, display: "flex", alignItems: "center", justifyContent: "center", color: "#1f7a3e" }}>
          <Icon name="check" size={20} color="#1f7a3e" strokeWidth={2.5} />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>Weeks 1–4 · Published</div>
          <div style={{ fontSize: 13, color: TEXT_SEC }}>{baseSessions.length} sessions running, coaches assigned</div>
        </div>
      </div>

      {!built ? (
        <PrimaryButton onClick={buildNext}>
          Build weeks 5–8 from this calendar <Icon name="sparkle" size={18} color={WHITE} />
        </PrimaryButton>
      ) : (
        <>
          <div style={{ fontSize: 13, fontWeight: 700, color: TEXT_SEC, textTransform: "uppercase", letterSpacing: "0.05em" }}>Next block — weeks 5–8</div>
          <CalendarGridContinued sessions={nextSessions} />
          <PrimaryButton onClick={onFinish}>
            Send block to coaches <Icon name="send" size={17} color={WHITE} />
          </PrimaryButton>
        </>
      )}
    </div>
  );
}

// Calendar grid variant that labels weeks 5-8
function CalendarGridContinued({ sessions }) {
  const weeks = [...new Set(sessions.map((s) => s.week))].sort((a, b) => a - b);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {weeks.map((wk) => (
        <div key={wk}>
          <div style={{ fontSize: 12, fontWeight: 700, color: TEXT_SEC, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Week {wk}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
            {WEEKDAYS.map((day) => {
              const sess = sessions.find((s) => s.week === wk && s.day === day);
              if (!sess) return <div key={day} style={{ background: "#f1f5f4", borderRadius: 10, minHeight: 70 }} />;
              const coach = ONBOARDING_COACHES.find((c) => c.id === sess.coachId);
              return (
                <div key={day} style={{ background: sess.bg, borderRadius: 10, padding: 11, minHeight: 70, border: `1px solid ${sess.color}33`, display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: TEXT_SEC }}>{day}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: sess.color }}>{sess.type}</div>
                  {coach && (
                    <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ width: 18, height: 18, borderRadius: "50%", background: coach.color, color: WHITE, fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{coach.initials}</span>
                      <span style={{ fontSize: 10, color: TEXT_SEC }}>{coach.name.split(" ")[0]}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ════════════════════════ MAIN CANVAS ════════════════════════
export default function GymOnboardingCanvas({ onClose, onHome, isMobile }) {
  const [step, setStep] = useState("upload"); // upload | processing | exercises | templates | generate | coaches | review | returning
  const [files, setFiles] = useState([]);
  const [approvedTemplates, setApprovedTemplates] = useState({});
  const [sessions, setSessions] = useState([]);
  const [generated, setGenerated] = useState(false);

  // Map step -> rail index (processing & returning don't get their own dot)
  const railIndex = { upload: 0, processing: 0, exercises: 1, templates: 2, generate: 3, coaches: 4, review: 5, returning: 5 }[step];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", position: "relative", background: BG, fontFamily: "inherit" }}>
      <style>{`@keyframes gymDot { 0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; } 40% { transform: scale(1); opacity: 1; } }`}</style>

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
        <div style={{ maxWidth: 920, margin: "0 auto" }}>
          {step === "upload" && (
            <UploadStep onContinue={(f) => { setFiles(f); setStep("processing"); }} />
          )}
          {step === "processing" && (
            <ProcessingStep onDone={() => setStep("exercises")} />
          )}
          {step === "exercises" && (
            <ExercisesStep onContinue={() => setStep("templates")} />
          )}
          {step === "templates" && (
            <TemplatesStep approved={approvedTemplates} setApproved={setApprovedTemplates} onContinue={() => setStep("generate")} />
          )}
          {step === "generate" && (
            <GenerateStep sessions={sessions} setSessions={setSessions} generated={generated} setGenerated={setGenerated} onContinue={() => setStep("coaches")} />
          )}
          {step === "coaches" && (
            <CoachesStep sessions={sessions} setSessions={setSessions} onContinue={() => setStep("review")} isMobile={isMobile} />
          )}
          {step === "review" && (
            <ReviewStep sessions={sessions} files={files} onReturning={() => setStep("returning")} onFinish={onClose} />
          )}
          {step === "returning" && (
            <ReturningStep baseSessions={sessions} onFinish={onClose} />
          )}
        </div>
      </div>
    </div>
  );
}
