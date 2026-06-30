import React, { useState, useMemo, useEffect } from "react";

/* ============================================================
   WorkoutCanvasPro — Build Workouts workspace
   A faithful rebuild of the bundled "Milton" prototype:
   a multi-tab workout/exercise management experience.
   Tabs: Library · Sessions · Builder · Calendar · Approvals · Settings
   ============================================================ */

/* ---------- design tokens ---------- */
const ACCENT = "#2F6B5C";
const ACCENT_DEEP = "#16352d";
const PAGE = "#FBFAF7";
const INK = "#243531";
const SUBINK = "#3A4B45";
const B1 = "#ECE9E2"; // hairline
const B2 = "#E2DED5"; // control border
const FOOT = "#FCFBF8";
const TAG_BG = "#EEF2EF";
const TAG_FG = "#5E726B";
const CHIP_BG = "#EEEBE3";
const CHIP_BD = "#E4E0D7";
const M1 = "#8A9690";
const M2 = "#A7B0AA";
const M3 = "#9AA39C";
const M4 = "#6B7A73";
const GOLD = "#B5851A";
const GOLD_BG = "#FBF0D8";
const ARCHIVE = "#C08A2E";
const DANGER = "#D9534F";
const GREEN = "#4F9D69";

const FONT = "'Figtree', -apple-system, system-ui, sans-serif";

/* ---------- tiny icon helper ---------- */
function Icon({ d, size = 16, stroke = "currentColor", sw = 2, fill = "none", children, vb = "0 0 24 24" }) {
  return (
    <svg width={size} height={size} viewBox={vb} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      {d ? <path d={d} /> : children}
    </svg>
  );
}

/* ---------- seed data ---------- */
const IMG = {
  squat: "/exercises/back-squat.png",
  bench: "/exercises/bench-press.png",
  deadlift: "/exercises/deadlift.png",
  pullup: "/exercises/pull-up.png",
  kb: "/exercises/kettlebell-swing.png",
  lunge: "/exercises/dumbbell-lunge.png",
};

const SEED_EXERCISES = [
  { id: "ex1", name: "Barbell Back Squat", equipment: "Barbell, Rack", muscles: ["Quads", "Glutes", "Core"], status: "active", source: "org", img: IMG.squat, hasVideo: true, vidLen: "0:42", updated: "2d ago" },
  { id: "ex2", name: "Barbell Bench Press", equipment: "Barbell, Bench", muscles: ["Chest", "Triceps", "Shoulders"], status: "active", source: "org", img: IMG.bench, hasVideo: true, vidLen: "0:38", updated: "5d ago" },
  { id: "ex3", name: "Conventional Deadlift", equipment: "Barbell", muscles: ["Hamstrings", "Glutes", "Back"], status: "active", source: "org", img: IMG.deadlift, hasVideo: true, vidLen: "0:51", updated: "1w ago" },
  { id: "ex4", name: "Pull-up", equipment: "Pull-up Bar", muscles: ["Lats", "Biceps"], status: "active", source: "org", img: IMG.pullup, hasVideo: true, vidLen: "0:29", updated: "1w ago" },
  { id: "ex5", name: "Kettlebell Swing", equipment: "Kettlebell", muscles: ["Glutes", "Hamstrings", "Core"], status: "active", source: "coach", img: IMG.kb, hasVideo: true, vidLen: "0:33", updated: "3d ago" },
  { id: "ex6", name: "Dumbbell Walking Lunge", equipment: "Dumbbells", muscles: ["Quads", "Glutes"], status: "active", source: "org", img: IMG.lunge, hasVideo: true, vidLen: "0:44", updated: "4d ago" },
  { id: "ex7", name: "DB Bench Press", equipment: "Dumbbells, Bench", muscles: ["Chest", "Triceps"], status: "review", source: "imported", img: IMG.bench, hasVideo: false, updated: "2h ago", dupOf: "Barbell Bench Press" },
  { id: "ex8", name: "Back Squat (High Bar)", equipment: "Barbell, Rack", muscles: ["Quads", "Glutes"], status: "review", source: "imported", img: IMG.squat, hasVideo: false, updated: "2h ago", dupOf: "Barbell Back Squat" },
  { id: "ex9", name: "Romanian Deadlift", equipment: "Barbell", muscles: ["Hamstrings", "Glutes"], status: "active", source: "org", img: IMG.deadlift, hasVideo: true, vidLen: "0:36", updated: "2w ago" },
  { id: "ex10", name: "Chin-up", equipment: "Pull-up Bar", muscles: ["Biceps", "Lats"], status: "review", source: "coach", img: IMG.pullup, hasVideo: false, updated: "1d ago", dupOf: "Pull-up" },
  { id: "ex11", name: "Goblet Squat", equipment: "Kettlebell", muscles: ["Quads", "Core"], status: "active", source: "org", img: IMG.kb, hasVideo: true, vidLen: "0:27", updated: "6d ago" },
  { id: "ex12", name: "Reverse Lunge", equipment: "Dumbbells", muscles: ["Quads", "Glutes", "Balance"], status: "archived", source: "org", img: IMG.lunge, hasVideo: true, vidLen: "0:31", updated: "1mo ago" },
];

const SEED_SESSIONS = [
  { id: "s1", name: "Push Day — Strength", classType: "Personal Training", status: "active", owner: "Org", wtype: "Strength", dur: "55 min", exCount: "7 exercises", updated: "2d ago" },
  { id: "s2", name: "Morning HIIT", classType: "Group · 12 spots", status: "active", owner: "Org", wtype: "Conditioning", dur: "45 min", exCount: "9 exercises", updated: "5d ago" },
  { id: "s3", name: "Lower Body Power", classType: "Semi-Private", status: "active", owner: "Coach Dana", wtype: "Power", dur: "60 min", exCount: "6 exercises", updated: "1w ago" },
  { id: "s4", name: "Mobility & Core", classType: "Group · 10 spots", status: "draft", owner: "Coach Mateo", wtype: "Mobility", dur: "30 min", exCount: "8 exercises", updated: "3h ago" },
  { id: "s5", name: "Pull Day — Hypertrophy", classType: "Personal Training", status: "active", owner: "Org", wtype: "Hypertrophy", dur: "50 min", exCount: "8 exercises", updated: "4d ago" },
  { id: "s6", name: "Evening Bootcamp", classType: "Group · 14 spots", status: "archived", owner: "Coach Dana", wtype: "Conditioning", dur: "45 min", exCount: "10 exercises", updated: "2mo ago" },
];

const WTYPE_DOT = { Strength: ACCENT, Power: "#4338CA", Hypertrophy: "#C2410C", Conditioning: "#D9534F", Mobility: "#0891b2" };

const SEED_PROGRAMS = [
  {
    id: "p1", name: "12-Week Strength Base", status: "active", type: "1:1", coach: "Dana", assigned: "8 clients", meta: "12 weeks · 4 days/wk",
    updated: "1d ago", progress: 0.42,
    days: [
      { dow: "MON", cats: "Lower", count: "6 ex" },
      { dow: "TUE", cats: null, count: "Rest" },
      { dow: "WED", cats: "Push", count: "7 ex" },
      { dow: "THU", cats: null, count: "Rest" },
      { dow: "FRI", cats: "Pull", count: "6 ex" },
    ],
  },
  {
    id: "p2", name: "Hybrid Conditioning", status: "active", type: "Group", coach: "Mateo", assigned: "Morning HIIT",
    meta: "8 weeks · 5 days/wk", updated: "3d ago", progress: 0.65,
    days: [
      { dow: "MON", cats: "Cond", count: "9 ex" },
      { dow: "TUE", cats: "Core", count: "6 ex" },
      { dow: "WED", cats: "Cond", count: "8 ex" },
      { dow: "THU", cats: "Mob", count: "5 ex" },
      { dow: "FRI", cats: "Cond", count: "9 ex" },
    ],
  },
  {
    id: "p3", name: "Off-Season Power Block", status: "draft", type: "1:1", coach: "Dana", assigned: "Unassigned",
    meta: "6 weeks · 3 days/wk", updated: "5d ago", progress: 0.12, busy: true,
    days: [
      { dow: "MON", cats: "Power", count: "5 ex" },
      { dow: "WED", cats: "Power", count: "5 ex" },
      { dow: "FRI", cats: "Acc", count: "4 ex" },
    ],
  },
];

/* builder grid week template */
const DOW = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
function makeBuilderWeeks(numWeeks) {
  const lib = [
    { title: "LOWER — STRENGTH", lines: [
      { sets: "4×", name: "Barbell Back Squat", sub: "6 reps · 185 lb" },
      { sets: "3×", name: "Romanian Deadlift", sub: "8 reps · 135 lb" },
      { sets: "3×", name: "Walking Lunge", sub: "10 / leg" },
    ] },
    { title: "PUSH — HYPERTROPHY", lines: [
      { sets: "4×", name: "Bench Press", sub: "8 reps · 155 lb" },
      { sets: "3×", name: "Incline DB Press", sub: "10 reps · 50 lb" },
      { sets: "3×", name: "Lateral Raise", sub: "15 reps" },
    ] },
    { title: "PULL — STRENGTH", lines: [
      { sets: "4×", name: "Deadlift", sub: "5 reps · 225 lb" },
      { sets: "3×", name: "Pull-up", sub: "8 reps · BW" },
      { sets: "3×", name: "Barbell Row", sub: "10 reps · 115 lb" },
    ] },
  ];
  const pattern = ["lower", "rest", "push", "rest", "pull", "rest", "rest"];
  const map = { lower: lib[0], push: lib[1], pull: lib[2] };
  const today = new Date();
  const weeks = [];
  let dayCounter = 0;
  for (let w = 0; w < numWeeks; w++) {
    const cells = pattern.map((p, di) => {
      const date = new Date(today);
      date.setDate(today.getDate() + dayCounter);
      dayCounter++;
      if (p === "rest") return { rest: true, weekday: DOW[di], dateNum: date.getDate() };
      const base = map[p];
      // status mix across weeks for realism
      let status = "planned";
      if (w === 0) status = di === 0 ? "completed" : di === 2 ? "note" : di === 4 ? "missed" : "planned";
      return { rest: false, weekday: DOW[di], dateNum: date.getDate(), title: base.title, lines: base.lines, status };
    });
    weeks.push({ week: w + 1, cells });
  }
  return weeks;
}

/* ---------- shared style helpers ---------- */
const primaryBtn = {
  cursor: "pointer", height: 40, whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 7,
  background: `linear-gradient(140deg, ${ACCENT}, ${ACCENT_DEEP})`, color: "#fff", border: "none", borderRadius: 11,
  padding: "0 18px", fontFamily: FONT, fontSize: 13.5, fontWeight: 700,
  boxShadow: "0 4px 14px rgba(47,107,92,.34), inset 0 1px 0 rgba(255,255,255,.16)",
};
const ghostBtn = {
  cursor: "pointer", height: 40, whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 8,
  background: "#fff", color: INK, border: `1px solid ${B2}`, borderRadius: 11, padding: "0 16px",
  fontFamily: FONT, fontSize: 13.5, fontWeight: 600, boxShadow: "0 1px 2px rgba(36,53,49,.04)",
};
const selStyle = {
  height: 40, border: `1px solid ${B2}`, background: "#fff", borderRadius: 11, padding: "0 32px 0 12px",
  fontFamily: FONT, fontSize: 13, fontWeight: 600, color: M4, cursor: "pointer", outline: "none",
  appearance: "none", WebkitAppearance: "none",
  backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7A73' stroke-width='2.5'><path d='M6 9l6 6 6-6'/></svg>\")",
  backgroundRepeat: "no-repeat", backgroundPosition: "right 11px center",
};
const iconBtn = (hoverColor) => ({
  cursor: "pointer", width: 34, height: 34, flex: "none", borderRadius: 8, border: `1px solid ${B2}`,
  background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: M4,
  transition: "border-color .15s, color .15s",
  "--hc": hoverColor || ACCENT,
});

const STATUS_PILL = {
  active: { bg: "rgba(47,107,92,.12)", fg: ACCENT, label: "Active" },
  review: { bg: GOLD_BG, fg: GOLD, label: "Needs review" },
  archived: { bg: "#EFEDE7", fg: M4, label: "Archived" },
  draft: { bg: "#EFEDE7", fg: M4, label: "Draft" },
};

/* ============================================================ */
export default function WorkoutCanvasPro({ data, clients = [], onClose, onHome }) {
  const [screen, setScreen] = useState("library");

  // library state
  const [exercises, setExercises] = useState(SEED_EXERCISES);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("updated");
  const [statusTab, setStatusTab] = useState("all");
  const [selected, setSelected] = useState([]);
  const [mergeOpen, setMergeOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [ingestOpen, setIngestOpen] = useState(false);
  const [confirm, setConfirm] = useState(null); // { kind, ids, name }
  const [toast, setToast] = useState(null);

  // sessions state
  const [sessions, setSessions] = useState(SEED_SESSIONS);
  const [sessSearch, setSessSearch] = useState("");
  const [sessStatus, setSessStatus] = useState("all");

  // builder state
  const [programs, setPrograms] = useState(SEED_PROGRAMS);
  const [pgSearch, setPgSearch] = useState("");
  const [pgStatus, setPgStatus] = useState("all");
  const [builderProgram, setBuilderProgram] = useState(null); // program id when in builder grid
  const [builderWeeks, setBuilderWeeks] = useState([]);
  const [focusCell, setFocusCell] = useState(null); // { wIdx, dIdx }

  // approvals
  const [autoProgress, setAutoProgress] = useState(false);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 2200);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const flash = (msg) => setToast(msg);

  /* ----- library derived ----- */
  const counts = useMemo(() => ({
    all: exercises.length,
    active: exercises.filter((e) => e.status === "active").length,
    review: exercises.filter((e) => e.status === "review").length,
    archived: exercises.filter((e) => e.status === "archived").length,
  }), [exercises]);

  const visibleExercises = useMemo(() => {
    let list = exercises.slice();
    if (statusTab !== "all") list = list.filter((e) => e.status === statusTab);
    if (sourceFilter !== "all") list = list.filter((e) => e.source === sourceFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((e) => e.name.toLowerCase().includes(q) || e.muscles.join(" ").toLowerCase().includes(q) || e.equipment.toLowerCase().includes(q));
    }
    if (sortBy === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [exercises, statusTab, sourceFilter, search, sortBy]);

  const toggleSelect = (id) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const clearSelection = () => setSelected([]);

  const applyToSelected = (mut, msg) => {
    setExercises((list) => list.map((e) => (selected.includes(e.id) ? mut(e) : e)));
    flash(msg);
    clearSelection();
  };

  const startEdit = (ex) => {
    setEditId(ex.id);
    setDraft({ ...ex, muscleInput: ex.muscles.join(", ") });
  };
  const saveEdit = () => {
    setExercises((list) =>
      list.map((e) =>
        e.id === editId
          ? { ...e, name: draft.name, equipment: draft.equipment, status: draft.status, muscles: draft.muscleInput.split(",").map((m) => m.trim()).filter(Boolean) }
          : e
      )
    );
    setEditId(null);
    setDraft(null);
    flash("Exercise saved");
  };

  const duplicateExercise = (ex) => {
    const copy = { ...ex, id: "ex" + Date.now(), name: ex.name + " (copy)", status: "review", source: "coach", updated: "just now", dupOf: ex.name };
    setExercises((l) => [copy, ...l]);
    flash("Exercise duplicated");
  };

  const doConfirm = () => {
    if (!confirm) return;
    if (confirm.kind === "delete") {
      setExercises((l) => l.filter((e) => !confirm.ids.includes(e.id)));
      flash(confirm.ids.length > 1 ? `${confirm.ids.length} exercises deleted` : "Exercise deleted");
    } else {
      setExercises((l) => l.map((e) => (confirm.ids.includes(e.id) ? { ...e, status: "archived" } : e)));
      flash(confirm.ids.length > 1 ? `${confirm.ids.length} exercises archived` : "Exercise archived");
    }
    setConfirm(null);
    clearSelection();
  };

  const confirmMerge = () => {
    const [keepId, ...rest] = selected;
    setExercises((l) => l.filter((e) => !rest.includes(e.id)).map((e) => (e.id === keepId ? { ...e, status: "active", dupOf: undefined } : e)));
    setMergeOpen(false);
    flash(`Merged ${selected.length} exercises`);
    clearSelection();
  };

  /* ----- sessions derived ----- */
  const sessCounts = useMemo(() => ({
    all: sessions.length,
    active: sessions.filter((s) => s.status === "active").length,
    draft: sessions.filter((s) => s.status === "draft").length,
    archived: sessions.filter((s) => s.status === "archived").length,
  }), [sessions]);
  const visibleSessions = useMemo(() => {
    let l = sessions.slice();
    if (sessStatus !== "all") l = l.filter((s) => s.status === sessStatus);
    if (sessSearch.trim()) l = l.filter((s) => s.name.toLowerCase().includes(sessSearch.toLowerCase()));
    return l;
  }, [sessions, sessStatus, sessSearch]);

  /* ----- programs derived ----- */
  const pgCounts = useMemo(() => ({
    all: programs.length,
    active: programs.filter((p) => p.status === "active").length,
    draft: programs.filter((p) => p.status === "draft").length,
  }), [programs]);
  const visiblePrograms = useMemo(() => {
    let l = programs.slice();
    if (pgStatus !== "all") l = l.filter((p) => p.status === pgStatus);
    if (pgSearch.trim()) l = l.filter((p) => p.name.toLowerCase().includes(pgSearch.toLowerCase()));
    return l;
  }, [programs, pgStatus, pgSearch]);

  const openBuilder = (program) => {
    setBuilderProgram(program.id);
    setBuilderWeeks(makeBuilderWeeks(4));
    setFocusCell(null);
  };

  /* ----- nav config ----- */
  const NAV = [
    { id: "library", label: "Library" },
    { id: "sessions", label: "Sessions" },
    { id: "builder", label: "Builder" },
    { id: "calendar", label: "Calendar" },
    { id: "approvals", label: "Approvals", badge: counts.review || null },
    { id: "settings", label: "Settings" },
  ];

  const activeProgram = programs.find((p) => p.id === builderProgram);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: PAGE, color: INK, fontFamily: FONT, fontSize: 14, minWidth: 0 }}>
      <style>{`
        @keyframes wcp-drawerIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes wcp-modalIn { from { opacity:0; transform: translateY(18px) scale(.94); } to { opacity:1; transform: translateY(0) scale(1); } }
        @keyframes wcp-overlayIn { from { opacity:0; } to { opacity:1; } }
        @keyframes wcp-popIn { from { opacity: 0; transform: translateY(8px) scale(.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes wcp-spin { to { transform: rotate(360deg); } }
        @keyframes wcp-toastIn { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform: translateY(0); } }
        .wcp-scroll::-webkit-scrollbar { width: 10px; height: 10px; }
        .wcp-scroll::-webkit-scrollbar-thumb { background: #DAD6CC; border-radius: 6px; border: 3px solid transparent; background-clip: content-box; }
        .wcp-scroll::-webkit-scrollbar-track { background: transparent; }
        .wcp-card:hover { box-shadow: 0 10px 28px rgba(36,53,49,.12); transform: translateY(-3px); border-color: #D8D3C8; }
        .wcp-ib:hover { border-color: var(--hc) !important; color: var(--hc) !important; }
        .wcp-primary:hover { box-shadow: 0 8px 22px rgba(47,107,92,.42), inset 0 1px 0 rgba(255,255,255,.16); transform: translateY(-1px); }
        .wcp-ghost:hover { border-color: ${ACCENT}; color: ${ACCENT}; background: #F4F8F6; }
        .wcp-tab:hover { color: ${INK}; }
        .wcp-input:focus { border-color: ${ACCENT}; box-shadow: 0 0 0 3px rgba(47,107,92,.13); }
        .wcp-cell:hover { border-color: #CFD9D2; }
      `}</style>

      {/* ===== top nav ===== */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px", borderBottom: `1px solid ${B1}`, background: PAGE, gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          <button onClick={onHome || onClose} title="Back" className="wcp-ib" style={{ ...iconBtn(), width: 36, height: 36, borderRadius: 9 }}>
            <Icon d="M15 18l-6-6 6-6" />
          </button>
          <div style={{ display: "flex", gap: 4, background: "#F1EEE7", border: `1px solid ${B1}`, borderRadius: 10, padding: 4, flexWrap: "wrap" }}>
            {NAV.map((t) => {
              const on = screen === t.id;
              return (
                <button key={t.id} onClick={() => setScreen(t.id)} className="wcp-tab"
                  style={{ cursor: "pointer", border: "none", borderRadius: 7, padding: "7px 14px", fontFamily: FONT, fontSize: 13, fontWeight: 600,
                    background: on ? "#fff" : "transparent", color: on ? INK : M4, boxShadow: on ? "0 1px 3px rgba(36,53,49,.1)" : "none", transition: "all .15s" }}>
                  {t.label}
                  {t.badge ? <span style={{ marginLeft: 7, background: DANGER, color: "#fff", fontSize: 11, fontWeight: 700, borderRadius: 9, padding: "1px 6px" }}>{t.badge}</span> : null}
                </button>
              );
            })}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {screen === "library" && <span style={{ fontSize: 13, color: M3 }}>{counts.all} exercises · org-wide library</span>}
          {screen === "approvals" && (
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <span style={{ fontSize: 12.5, color: M4 }}>Auto-progress</span>
              <div onClick={() => setAutoProgress((v) => !v)} style={{ cursor: "pointer", width: 42, height: 24, borderRadius: 13, padding: 2, display: "flex", background: autoProgress ? ACCENT : "#D8D3C8", justifyContent: autoProgress ? "flex-end" : "flex-start", transition: "all .18s" }}>
                <span style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 2px rgba(0,0,0,.2)" }} />
              </div>
            </div>
          )}
          <button onClick={onClose} title="Close" className="wcp-ib" style={{ ...iconBtn(DANGER), width: 36, height: 36, borderRadius: 9 }}>
            <Icon d="M18 6L6 18M6 6l12 12" />
          </button>
        </div>
      </div>

      {/* ===== body ===== */}
      <div style={{ flex: 1, overflow: "hidden", position: "relative", minHeight: 0 }}>
        {screen === "library" && (
          <LibraryScreen
            rows={visibleExercises} counts={counts} statusTab={statusTab} setStatusTab={setStatusTab}
            search={search} setSearch={setSearch} sourceFilter={sourceFilter} setSourceFilter={setSourceFilter}
            sortBy={sortBy} setSortBy={setSortBy} selected={selected} toggleSelect={toggleSelect}
            clearSelection={clearSelection} onMerge={() => setMergeOpen(true)}
            onBulkActivate={() => applyToSelected((e) => ({ ...e, status: "active" }), `${selected.length} activated`)}
            onBulkArchive={() => setConfirm({ kind: "archive", ids: selected, name: `${selected.length} exercises` })}
            onBulkDelete={() => setConfirm({ kind: "delete", ids: selected, name: `${selected.length} exercises` })}
            onBulkExport={() => flash(`Exported ${selected.length} exercises`)}
            onCreate={() => setCreateOpen(true)} onIngest={() => setIngestOpen(true)}
            onEdit={startEdit} onDuplicate={duplicateExercise}
            onArchive={(ex) => setConfirm({ kind: "archive", ids: [ex.id], name: ex.name })}
            onDelete={(ex) => setConfirm({ kind: "delete", ids: [ex.id], name: ex.name })}
            onPromote={(ex) => { setExercises((l) => l.map((e) => (e.id === ex.id ? { ...e, status: "active", dupOf: undefined } : e))); flash("Promoted to active"); }}
          />
        )}
        {screen === "sessions" && (
          <SessionsScreen rows={visibleSessions} counts={sessCounts} statusTab={sessStatus} setStatusTab={setSessStatus}
            search={sessSearch} setSearch={setSessSearch}
            onArchive={(s) => { setSessions((l) => l.map((x) => (x.id === s.id ? { ...x, status: "archived" } : x))); flash("Session archived"); }}
            onDelete={(s) => { setSessions((l) => l.filter((x) => x.id !== s.id)); flash("Session deleted"); }}
            onDup={(s) => { setSessions((l) => [{ ...s, id: "s" + Date.now(), name: s.name + " (copy)", status: "draft", updated: "just now" }, ...l]); flash("Session duplicated"); }}
            onNew={() => flash("New session — opening builder")} />
        )}
        {screen === "builder" && !builderProgram && (
          <ProgramsScreen rows={visiblePrograms} counts={pgCounts} statusTab={pgStatus} setStatusTab={setPgStatus}
            search={pgSearch} setSearch={setPgSearch} onOpen={openBuilder}
            onArchive={(p) => { setPrograms((l) => l.map((x) => (x.id === p.id ? { ...x, status: "archived" } : x))); flash("Program archived"); }}
            onDelete={(p) => { setPrograms((l) => l.filter((x) => x.id !== p.id)); flash("Program deleted"); }}
            onDup={(p) => { setPrograms((l) => [{ ...p, id: "p" + Date.now(), name: p.name + " (copy)", status: "draft", updated: "just now" }, ...l]); flash("Program duplicated"); }}
            onNew={() => flash("New program created")} />
        )}
        {screen === "builder" && builderProgram && (
          <BuilderScreen program={activeProgram} weeks={builderWeeks} setWeeks={setBuilderWeeks}
            focusCell={focusCell} setFocusCell={setFocusCell} onBack={() => setBuilderProgram(null)} onSave={() => flash("Workout saved")} />
        )}
        {screen === "calendar" && <CalendarScreen programs={programs} />}
        {screen === "approvals" && (
          <ApprovalsScreen rows={exercises.filter((e) => e.status === "review")} autoProgress={autoProgress}
            onApprove={(ex) => { setExercises((l) => l.map((e) => (e.id === ex.id ? { ...e, status: "active", dupOf: undefined } : e))); flash("Approved"); }}
            onReject={(ex) => { setExercises((l) => l.filter((e) => e.id !== ex.id)); flash("Rejected"); }} />
        )}
        {screen === "settings" && <SettingsScreen autoProgress={autoProgress} setAutoProgress={setAutoProgress} />}
      </div>

      {/* ===== merge modal ===== */}
      {mergeOpen && (
        <MergeModal items={exercises.filter((e) => selected.includes(e.id))} onClose={() => setMergeOpen(false)} onConfirm={confirmMerge} />
      )}

      {/* ===== edit drawer ===== */}
      {draft && (
        <EditDrawer draft={draft} setDraft={setDraft} onClose={() => { setEditId(null); setDraft(null); }} onSave={saveEdit} />
      )}

      {/* ===== create modal ===== */}
      {createOpen && (
        <CreateModal onClose={() => setCreateOpen(false)} onCreate={(ex) => { setExercises((l) => [{ ...ex, id: "ex" + Date.now(), status: "review", source: "coach", updated: "just now", muscles: ex.muscleInput.split(",").map((m) => m.trim()).filter(Boolean) }, ...l]); setCreateOpen(false); flash("Exercise added to review"); }} />
      )}

      {/* ===== ingest modal ===== */}
      {ingestOpen && <IngestModal onClose={() => setIngestOpen(false)} onDone={() => { setIngestOpen(false); flash("Ingest queued — items will appear in Needs review"); }} />}

      {/* ===== confirm dialog ===== */}
      {confirm && (
        <ConfirmDialog confirm={confirm} onCancel={() => setConfirm(null)} onConfirm={doConfirm} />
      )}

      {/* ===== toast ===== */}
      {toast && (
        <div style={{ position: "absolute", bottom: 22, left: "50%", transform: "translateX(-50%)", background: INK, color: "#fff", padding: "11px 18px", borderRadius: 11, fontSize: 13, fontWeight: 600, boxShadow: "0 12px 34px rgba(0,0,0,.28)", animation: "wcp-toastIn .2s ease", zIndex: 60, display: "flex", alignItems: "center", gap: 9 }}>
          <Icon d="M5 13l4 4L19 7" stroke="#7FD6A4" sw={3} size={15} />
          {toast}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   Reusable subcomponents
   ============================================================ */

function Toolbar({ children }) {
  return <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "18px 28px 8px", flexWrap: "wrap" }}>{children}</div>;
}

function SearchInput({ value, onChange, placeholder, width = 230 }) {
  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center", flex: "none" }}>
      <span style={{ position: "absolute", left: 13, pointerEvents: "none", display: "flex" }}>
        <Icon size={15} stroke="#9AA39C"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></Icon>
      </span>
      <input className="wcp-input" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        style={{ width, height: 40, border: `1px solid ${B2}`, background: "#fff", borderRadius: 11, padding: "0 14px 0 36px", fontFamily: FONT, fontSize: 13.5, outline: "none", color: INK, boxShadow: "0 1px 2px rgba(36,53,49,.04)", transition: "border-color .18s, box-shadow .18s" }} />
    </div>
  );
}

function StatusChips({ chips, value, onChange }) {
  return (
    <div style={{ display: "inline-flex", gap: 3, background: CHIP_BG, border: `1px solid ${CHIP_BD}`, borderRadius: 12, padding: 4, boxShadow: "inset 0 1px 2px rgba(36,53,49,.05)" }}>
      {chips.map((c) => {
        const on = value === c.id;
        return (
          <button key={c.id} onClick={() => onChange(c.id)}
            style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 7, border: "none", borderRadius: 9, padding: "6px 12px",
              fontFamily: FONT, fontSize: 12.5, fontWeight: 600, background: on ? "#fff" : "transparent", color: on ? INK : M4,
              boxShadow: on ? "0 1px 2px rgba(36,53,49,.12)" : "none", transition: "all .15s" }}>
            {c.label}
            <span style={{ fontSize: 11, fontWeight: 700, color: on ? ACCENT : M2, background: on ? "rgba(47,107,92,.1)" : "transparent", borderRadius: 6, padding: "1px 6px" }}>{c.count}</span>
          </button>
        );
      })}
    </div>
  );
}

function BulkBar({ count, canMerge, onActivate, onArchive, onExport, onDelete, onMerge, onClear }) {
  const txt = (label, color, fn) => (
    <button onClick={fn} style={{ cursor: "pointer", background: "transparent", border: "none", fontFamily: FONT, fontSize: 12.5, fontWeight: 600, color, padding: "5px 8px", borderRadius: 6 }}>{label}</button>
  );
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto", background: INK, borderRadius: 10, padding: "6px 8px 6px 14px", animation: "wcp-popIn .15s ease" }}>
      <span style={{ fontSize: 12.5, fontWeight: 600, color: "#fff" }}>{count} selected</span>
      <div style={{ width: 1, height: 18, background: "rgba(255,255,255,.2)" }} />
      {txt("Activate", "#CFE0D8", onActivate)}
      {txt("Archive", "#CFE0D8", onArchive)}
      {txt("Export", "#CFE0D8", onExport)}
      {txt("Delete", "#F0B4B1", onDelete)}
      {canMerge && (
        <button onClick={onMerge} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 6, background: ACCENT, border: "none", fontFamily: FONT, fontSize: 12.5, fontWeight: 600, color: "#fff", padding: "6px 12px", borderRadius: 7 }}>
          <Icon size={13} d="M7 4v6a4 4 0 0 0 4 4h6M7 4H4m3 0h3M17 14l3-3-3-3" /> Merge
        </button>
      )}
      <button onClick={onClear} style={{ cursor: "pointer", width: 26, height: 26, borderRadius: 6, background: "transparent", border: "none", color: "#9FB1A9", fontSize: 16 }}>×</button>
    </div>
  );
}

/* ---------- LIBRARY ---------- */
function LibraryScreen(props) {
  const { rows, counts, statusTab, setStatusTab, search, setSearch, sourceFilter, setSourceFilter, sortBy, setSortBy,
    selected, toggleSelect, clearSelection, onMerge, onBulkActivate, onBulkArchive, onBulkDelete, onBulkExport,
    onCreate, onIngest, onEdit, onDuplicate, onArchive, onDelete, onPromote } = props;

  const chips = [
    { id: "all", label: "All", count: counts.all },
    { id: "active", label: "Active", count: counts.active },
    { id: "review", label: "Needs review", count: counts.review },
    { id: "archived", label: "Archived", count: counts.archived },
  ];

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Toolbar>
        <SearchInput value={search} onChange={setSearch} placeholder="Search exercises" />
        <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} style={selStyle}>
          <option value="all">All sources</option>
          <option value="org">Org library</option>
          <option value="imported">Imported</option>
          <option value="coach">Coach-added</option>
        </select>
        <div style={{ flex: 1 }} />
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={selStyle}>
          <option value="updated">Recently updated</option>
          <option value="name">Name A–Z</option>
        </select>
        <button onClick={onIngest} className="wcp-ghost" style={ghostBtn}>
          <Icon stroke={ACCENT} d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" /> Ingest
        </button>
        <button onClick={onCreate} className="wcp-primary" style={primaryBtn}>
          <Icon stroke="#fff" sw={2.4} d="M12 5v14M5 12h14" /> Add exercise
        </button>
      </Toolbar>

      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "6px 28px 14px", minHeight: 34 }}>
        <StatusChips chips={chips} value={statusTab} onChange={setStatusTab} />
        {selected.length >= 1 && (
          <BulkBar count={selected.length} canMerge={selected.length >= 2} onActivate={onBulkActivate} onArchive={onBulkArchive} onExport={onBulkExport} onDelete={onBulkDelete} onMerge={onMerge} onClear={clearSelection} />
        )}
      </div>

      <div className="wcp-scroll" style={{ flex: 1, overflowY: "auto", padding: "4px 28px 28px" }}>
        {rows.length === 0 ? (
          <EmptyState title="No exercises found" body="Try a different search or filter, or add a new exercise." />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(264px, 1fr))", gap: 16 }}>
            {rows.map((r) => (
              <ExerciseCard key={r.id} r={r} checked={selected.includes(r.id)} onToggle={() => toggleSelect(r.id)}
                onEdit={() => onEdit(r)} onDuplicate={() => onDuplicate(r)} onArchive={() => onArchive(r)} onDelete={() => onDelete(r)} onPromote={() => onPromote(r)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ExerciseCard({ r, checked, onToggle, onEdit, onDuplicate, onArchive, onDelete, onPromote }) {
  const pill = STATUS_PILL[r.status] || STATUS_PILL.active;
  const isReview = r.status === "review";
  return (
    <div className="wcp-card" style={{ display: "flex", flexDirection: "column", background: "#fff", border: `1px solid ${checked ? ACCENT : B1}`, borderRadius: 16, overflow: "hidden", transition: "box-shadow .18s, transform .18s, border-color .18s", boxShadow: checked ? "0 0 0 3px rgba(47,107,92,.14)" : "none" }}>
      {/* thumbnail */}
      <div style={{ position: "relative", height: 152, overflow: "hidden", background: "#11201B" }}>
        <img src={r.img || "/placeholder.svg"} alt={r.name} crossOrigin="anonymous" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(180deg, rgba(15,28,23,.35) 0%, rgba(15,28,23,0) 32%, rgba(15,28,23,.08) 60%, rgba(15,28,23,.5) 100%)" }} />
        {r.hasVideo ? (
          <>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,.92)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(0,0,0,.3)" }}>
                <Icon size={19} fill="#1C2623" stroke="none"><path d="M8 5v14l11-7z" /></Icon>
              </div>
            </div>
            <span style={{ position: "absolute", bottom: 9, right: 10, pointerEvents: "none", background: "rgba(15,28,23,.78)", color: "#fff", fontFamily: "ui-monospace,monospace", fontSize: 11, fontWeight: 600, padding: "2px 7px", borderRadius: 6 }}>{r.vidLen}</span>
          </>
        ) : (
          <span style={{ position: "absolute", bottom: 9, left: 10, pointerEvents: "none", display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(217,83,79,.92)", color: "#fff", fontSize: 10.5, fontWeight: 700, padding: "3px 8px", borderRadius: 6 }}>
            <Icon size={11} sw={2.2}><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /><path d="M12 9v4M12 17h.01" /></Icon> No video
          </span>
        )}
        {/* check dot */}
        <div onClick={(e) => { e.stopPropagation(); onToggle(); }} style={{ position: "absolute", top: 10, left: 10, cursor: "pointer", width: 24, height: 24, borderRadius: 7, border: `2px solid ${checked ? ACCENT : "rgba(255,255,255,.85)"}`, background: checked ? ACCENT : "rgba(15,28,23,.35)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(2px)" }}>
          {checked && <Icon size={13} stroke="#fff" sw={3.5} d="M5 13l4 4L19 7" />}
        </div>
        <span style={{ position: "absolute", top: 10, right: 10, background: pill.bg, color: pill.fg, fontSize: 10.5, fontWeight: 700, padding: "3px 9px", borderRadius: 7, backdropFilter: "blur(2px)" }}>{pill.label}</span>
      </div>

      {/* body */}
      <div style={{ padding: "14px 16px 12px", flex: 1, display: "flex", flexDirection: "column" }}>
        <div onClick={onEdit} style={{ cursor: "pointer", fontSize: 15.5, fontWeight: 700, color: INK, lineHeight: 1.25 }}>{r.name}</div>
        {r.dupOf ? (
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, color: GOLD, marginTop: 4 }}>
            <Icon size={12}><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /><path d="M12 9v4M12 17h.01" /></Icon>
            Resembles “{r.dupOf}”
          </div>
        ) : (
          <div style={{ fontSize: 11.5, color: M2, marginTop: 4 }}>{r.source === "org" ? "Org library" : r.source === "imported" ? "Imported" : "Coach-added"}</div>
        )}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, alignItems: "center", marginTop: 11 }}>
          {r.muscles.slice(0, 2).map((m) => (
            <span key={m} style={{ background: TAG_BG, color: TAG_FG, fontSize: 11.5, fontWeight: 500, padding: "3px 9px", borderRadius: 7 }}>{m}</span>
          ))}
          {r.muscles.length > 2 && <span style={{ fontSize: 11, color: M2 }}>+{r.muscles.length - 2}</span>}
        </div>
      </div>

      {/* meta strip */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 16px", borderTop: `1px solid #F4F1EA`, fontSize: 12, color: M1 }}>
        <Icon size={13} stroke="#A7B0AA" style={{ flex: "none" }}><path d="M6.5 6.5l11 11M21 16l-2 2M8 5 5 8M16 3l5 5M3 16l5 5M2 22l2-2M22 2l-2 2" /></Icon>
        <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.equipment}</span>
        <span style={{ marginLeft: "auto", flex: "none", color: M2 }}>{r.updated}</span>
      </div>

      {/* actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", borderTop: `1px solid #F4F1EA`, background: FOOT }}>
        {isReview ? (
          <button onClick={onPromote} style={{ cursor: "pointer", flex: 1, background: ACCENT, color: "#fff", border: "none", borderRadius: 8, padding: "8px 10px", fontFamily: FONT, fontSize: 12.5, fontWeight: 600 }}>Promote to active</button>
        ) : (
          <button onClick={onEdit} className="wcp-ghost" style={{ cursor: "pointer", flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "#fff", color: SUBINK, border: `1px solid ${B2}`, borderRadius: 8, padding: "8px 10px", fontFamily: FONT, fontSize: 12.5, fontWeight: 600 }}>
            <Icon size={13} d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /> Edit
          </button>
        )}
        <button onClick={onDuplicate} title="Duplicate" className="wcp-ib" style={iconBtn()}><Icon size={14}><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></Icon></button>
        <button onClick={onArchive} title="Archive" className="wcp-ib" style={iconBtn(ARCHIVE)}><Icon size={14}><rect x="3" y="4" width="18" height="4" rx="1" /><path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8M10 12h4" /></Icon></button>
        <button onClick={onDelete} title="Delete" className="wcp-ib" style={iconBtn(DANGER)}><Icon size={14} d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6" /></button>
      </div>
    </div>
  );
}

function EmptyState({ title, body }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "70px 20px", textAlign: "center", color: M1 }}>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: "#F1EEE7", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14, color: M2 }}>
        <Icon size={26}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></Icon>
      </div>
      <div style={{ fontSize: 15.5, fontWeight: 700, color: INK }}>{title}</div>
      <div style={{ fontSize: 13, marginTop: 5, maxWidth: 320 }}>{body}</div>
    </div>
  );
}

/* ---------- SESSIONS ---------- */
function SessionsScreen({ rows, counts, statusTab, setStatusTab, search, setSearch, onArchive, onDelete, onDup, onNew }) {
  const chips = [
    { id: "all", label: "All", count: counts.all },
    { id: "active", label: "Active", count: counts.active },
    { id: "draft", label: "Drafts", count: counts.draft },
    { id: "archived", label: "Archived", count: counts.archived },
  ];
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Toolbar>
        <SearchInput value={search} onChange={setSearch} placeholder="Search sessions" width={220} />
        <div style={{ flex: 1 }} />
        <button onClick={onNew} className="wcp-primary" style={primaryBtn}><Icon stroke="#fff" sw={2.4} d="M12 5v14M5 12h14" /> New session</button>
      </Toolbar>
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "6px 28px 14px" }}>
        <StatusChips chips={chips} value={statusTab} onChange={setStatusTab} />
      </div>
      <div className="wcp-scroll" style={{ flex: 1, overflowY: "auto", padding: "4px 28px 28px" }}>
        {rows.length === 0 ? <EmptyState title="No sessions yet" body="Create a session template to reuse across clients and classes." /> : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px,1fr))", gap: 16 }}>
            {rows.map((t) => {
              const pill = STATUS_PILL[t.status] || STATUS_PILL.active;
              return (
                <div key={t.id} className="wcp-card" style={{ display: "flex", flexDirection: "column", background: "#fff", border: `1px solid ${B1}`, borderRadius: 16, overflow: "hidden", transition: "box-shadow .18s, transform .18s, border-color .18s" }}>
                  <div style={{ padding: "16px 18px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <span style={{ background: pill.bg, color: pill.fg, fontSize: 10.5, fontWeight: 700, padding: "3px 9px", borderRadius: 7 }}>{pill.label}</span>
                      <div style={{ flex: 1 }} />
                      <span style={{ fontSize: 11.5, fontWeight: 600, color: M4, background: "#F1EEE7", padding: "3px 9px", borderRadius: 7 }}>{t.owner}</span>
                    </div>
                    <div style={{ fontSize: 16.5, fontWeight: 700, color: INK, lineHeight: 1.25 }}>{t.name}</div>
                    <div style={{ fontSize: 12.5, color: M1, marginTop: 3 }}>{t.classType}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 12 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: WTYPE_DOT[t.wtype] || ACCENT }} />
                      <span style={{ fontSize: 12.5, color: M4, fontWeight: 500 }}>{t.wtype}</span>
                      <span style={{ color: "#D8D3C8" }}>·</span>
                      <span style={{ fontSize: 12.5, color: M4 }}>{t.dur}</span>
                      <span style={{ color: "#D8D3C8" }}>·</span>
                      <span style={{ fontSize: 12.5, color: M4 }}>{t.exCount}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", borderTop: `1px solid #F4F1EA`, background: FOOT }}>
                    <span style={{ flex: 1, fontSize: 11.5, color: M2 }}>Updated {t.updated}</span>
                    <button title="Edit" className="wcp-ib" style={iconBtn()}><Icon size={14} d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></button>
                    <button onClick={() => onDup(t)} title="Duplicate" className="wcp-ib" style={iconBtn()}><Icon size={14}><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></Icon></button>
                    <button onClick={() => onArchive(t)} title="Archive" className="wcp-ib" style={iconBtn(ARCHIVE)}><Icon size={14}><rect x="3" y="4" width="18" height="4" rx="1" /><path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8M10 12h4" /></Icon></button>
                    <button onClick={() => onDelete(t)} title="Delete" className="wcp-ib" style={iconBtn(DANGER)}><Icon size={14} d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6" /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- PROGRAMS LIST ---------- */
function ProgramsScreen({ rows, counts, statusTab, setStatusTab, search, setSearch, onOpen, onArchive, onDelete, onDup, onNew }) {
  const chips = [
    { id: "all", label: "All", count: counts.all },
    { id: "active", label: "Active", count: counts.active },
    { id: "draft", label: "Drafts", count: counts.draft },
  ];
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Toolbar>
        <SearchInput value={search} onChange={setSearch} placeholder="Search programs" width={220} />
        <div style={{ flex: 1 }} />
        <button onClick={onNew} className="wcp-primary" style={primaryBtn}><Icon stroke="#fff" sw={2.4} d="M12 5v14M5 12h14" /> New program</button>
      </Toolbar>
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "6px 28px 14px" }}>
        <StatusChips chips={chips} value={statusTab} onChange={setStatusTab} />
      </div>
      <div className="wcp-scroll" style={{ flex: 1, overflowY: "auto", padding: "4px 28px 28px" }}>
        {rows.length === 0 ? <EmptyState title="No programs" body="Build a multi-week program and assign it to clients or classes." /> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {rows.map((p) => {
              const pill = STATUS_PILL[p.status] || STATUS_PILL.active;
              return (
                <div key={p.id} style={{ border: `1px solid ${B1}`, borderRadius: 16, background: "#fff", overflow: "hidden", transition: "box-shadow .18s, border-color .18s" }} className="wcp-card">
                  <div style={{ padding: "18px 20px 14px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 14 }}>
                      <div onClick={() => onOpen(p)} style={{ cursor: "pointer", minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 17, fontWeight: 700, color: INK }}>{p.name}</span>
                          <span style={{ background: pill.bg, color: pill.fg, fontSize: 10.5, fontWeight: 700, padding: "3px 9px", borderRadius: 7 }}>{pill.label}</span>
                          <span style={{ background: "#EEF2EF", color: TAG_FG, fontSize: 10.5, fontWeight: 700, padding: "3px 9px", borderRadius: 7 }}>{p.type}</span>
                          {p.busy && (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, color: GOLD }}>
                              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#E0A93B" }} /> Agent building…
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 12.5, color: M1, marginTop: 4 }}>{p.meta} · Coach {p.coach} · {p.assigned}</div>
                      </div>
                      <button onClick={() => onOpen(p)} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 8, background: ACCENT, color: "#fff", border: "none", borderRadius: 10, padding: "10px 16px", fontFamily: FONT, fontSize: 13, fontWeight: 600, flex: "none" }}>
                        <Icon size={15}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 10h18M8 4v4M16 4v4" /></Icon> Open builder
                      </button>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      {p.days.map((sl, i) => {
                        const rest = sl.count === "Rest";
                        return (
                          <div key={i} style={{ flex: 1, minWidth: 64, borderRadius: 10, border: `1px solid ${rest ? "#F0EEE8" : "#E7EDE9"}`, background: rest ? "#FAF9F5" : "#F4F8F6", padding: "9px 8px", textAlign: "center" }}>
                            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".06em", color: M3 }}>{sl.dow}</div>
                            {sl.cats && <div style={{ fontSize: 12.5, fontWeight: 700, color: ACCENT, marginTop: 4 }}>{sl.cats}</div>}
                            <div style={{ fontSize: 11, color: rest ? M2 : M4, marginTop: 3 }}>{sl.count}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", borderTop: `1px solid #F4F1EA`, background: FOOT }}>
                    <span style={{ flex: 1, fontSize: 11.5, color: M2 }}>Updated {p.updated}</span>
                    <button title="Edit" className="wcp-ib" style={iconBtn()}><Icon size={14} d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></button>
                    <button onClick={() => onDup(p)} title="Duplicate" className="wcp-ib" style={iconBtn()}><Icon size={14}><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></Icon></button>
                    <button onClick={() => onArchive(p)} title="Archive" className="wcp-ib" style={iconBtn(ARCHIVE)}><Icon size={14}><rect x="3" y="4" width="18" height="4" rx="1" /><path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8M10 12h4" /></Icon></button>
                    <button onClick={() => onDelete(p)} title="Delete" className="wcp-ib" style={iconBtn(DANGER)}><Icon size={14} d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6" /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- BUILDER GRID + SESSION EDITOR ---------- */
function BuilderScreen({ program, weeks, setWeeks, focusCell, setFocusCell, onBack, onSave }) {
  if (focusCell) {
    const cell = weeks[focusCell.wIdx]?.cells[focusCell.dIdx];
    if (!cell) return null;
    return (
      <SessionEditor program={program} cell={cell} dateLabel={`${cell.weekday} ${cell.dateNum}`}
        onChange={(rows) => setWeeks((ws) => ws.map((w, wi) => wi === focusCell.wIdx ? { ...w, cells: w.cells.map((c, di) => di === focusCell.dIdx ? { ...c, lines: rows } : c) } : w))}
        onBack={() => setFocusCell(null)} onSave={onSave} />
    );
  }
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 28px", borderBottom: `1px solid ${B1}`, flexWrap: "wrap" }}>
        <button onClick={onBack} className="wcp-ghost" style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, height: 38, padding: "0 14px", borderRadius: 10, border: `1px solid ${B2}`, background: "#fff", fontFamily: FONT, fontSize: 13, fontWeight: 700, color: ACCENT }}>
          <Icon size={14} sw={2.4} d="M15 18l-6-6 6-6" /> {program?.name || "Program"}
        </button>
        <div style={{ flex: 1 }} />
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 38, padding: "0 14px", borderRadius: 10, border: `1px solid ${B2}`, background: "#fff", fontSize: 13, fontWeight: 600, color: M4 }}>
          <Icon size={15} stroke={ACCENT}><circle cx="12" cy="8" r="3.5" /><path d="M5 20a7 7 0 0 1 14 0" /></Icon> {program?.assigned || "All clients"}
        </div>
        <button onClick={() => setWeeks((ws) => [...ws, ...makeBuilderWeeks(1).map((w) => ({ ...w, week: ws.length + 1 }))])} className="wcp-primary" style={{ ...primaryBtn, height: 38 }}>
          <Icon stroke="#fff" sw={2.4} d="M12 5v14M5 12h14" /> Add week
        </button>
      </div>
      <div className="wcp-scroll" style={{ flex: 1, overflow: "auto", padding: "16px 28px 24px" }}>
        <div style={{ minWidth: 1080 }}>
          <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
            {DOW.map((d) => <div key={d} style={{ flex: 1, minWidth: 158, fontSize: 11, fontWeight: 700, letterSpacing: ".06em", color: M3, paddingLeft: 4 }}>{d}</div>)}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {weeks.map((row, wi) => (
              <div key={wi} style={{ display: "flex", gap: 12, alignItems: "stretch" }}>
                {row.cells.map((c, di) => (
                  <BuilderCell key={di} c={c} onClick={() => !c.rest && setFocusCell({ wIdx: wi, dIdx: di })} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "12px 28px", borderTop: `1px solid ${B1}`, background: FOOT, flexWrap: "wrap" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, color: M1 }}>
          <Icon size={15} stroke={ACCENT}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 10h18M8 4v4M16 4v4" /></Icon> Click any workout day to expand it
        </span>
        <div style={{ flex: 1 }} />
        <Legend color={GREEN} icon={<Icon size={13} stroke={GREEN} sw={3} d="M5 13l4 4L19 7" />} label="Completed" />
        <Legend dot="#E0A93B" label="Has note" />
        <Legend color={DANGER} icon={<Icon size={12} stroke={DANGER} sw={3} d="M6 6l12 12M18 6L6 18" />} label="Missed" />
      </div>
    </div>
  );
}

function Legend({ icon, dot, label }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: M1 }}>
      {dot ? <span style={{ width: 9, height: 9, borderRadius: "50%", background: dot }} /> : icon}
      {label}
    </span>
  );
}

function BuilderCell({ c, onClick }) {
  if (c.rest) {
    return (
      <div style={{ flex: 1, minWidth: 158, borderRadius: 12, border: `1px dashed #E4E0D7`, background: "#FAF9F5", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px" }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".05em", color: M3 }}>{c.weekday}</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: INK }}>{c.dateNum}</span>
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#C2C8C1", fontSize: 13, fontStyle: "italic", padding: "10px 0 18px" }}>Rest</div>
      </div>
    );
  }
  const statusBox = {
    completed: { bg: "rgba(79,157,105,.14)" },
    note: { bg: "rgba(224,169,59,.16)" },
    missed: { bg: "rgba(217,83,79,.14)" },
    planned: { bg: "transparent" },
  }[c.status || "planned"];
  return (
    <div onClick={onClick} className="wcp-cell" style={{ flex: 1, minWidth: 158, borderRadius: 12, border: `1px solid ${B1}`, background: "#fff", overflow: "hidden", cursor: "pointer", display: "flex", flexDirection: "column", transition: "border-color .15s, box-shadow .15s" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px" }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".05em", color: M3 }}>{c.weekday}</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: INK }}>{c.dateNum}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "#EEF3F0" }}>
        <span style={{ flex: 1, fontSize: 11, fontWeight: 700, letterSpacing: ".02em", color: "#3A554C", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.title}</span>
        <span style={{ width: 20, height: 20, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", background: statusBox.bg }}>
          {c.status === "completed" && <Icon size={11} stroke={GREEN} sw={3.2} d="M5 13l4 4L19 7" />}
          {c.status === "note" && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#E0A93B" }} />}
          {c.status === "missed" && <Icon size={11} stroke={DANGER} sw={3.2} d="M6 6l12 12M18 6L6 18" />}
        </span>
      </div>
      <div style={{ padding: "8px 12px 11px", display: "flex", flexDirection: "column", gap: 9 }}>
        {c.lines.map((ln, i) => (
          <div key={i} style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
            <span style={{ flex: "none", fontSize: 12, fontWeight: 700, color: ACCENT, width: 24 }}>{ln.sets}</span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: INK, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ln.name}</div>
              <div style={{ fontSize: 11.5, color: M1, marginTop: 1 }}>{ln.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SessionEditor({ program, cell, dateLabel, onChange, onBack, onSave }) {
  const [rows, setRows] = useState(() => cell.lines.map((l) => ({
    name: l.name,
    sets: parseInt(l.sets) || 3,
    reps: (l.sub.match(/(\d+)\s*reps?/) || [])[1] || "10",
    weight: (l.sub.split("·")[1] || "").trim() || "BW",
    rest: "60-90s",
  })));
  const cols = "44px 1fr 84px 96px 110px 104px 40px";
  const update = (i, field, val) => setRows((r) => r.map((row, idx) => (idx === i ? { ...row, [field]: val } : row)));
  const del = (i) => setRows((r) => r.filter((_, idx) => idx !== i));
  const add = () => setRows((r) => [...r, { name: "New exercise", sets: 3, reps: "10", weight: "BW", rest: "60-90s" }]);
  const cellInput = { width: "72%", textAlign: "center", border: `1px solid transparent`, borderRadius: 8, padding: "7px 4px", fontFamily: FONT, fontSize: 13.5, fontWeight: 600, color: INK, outline: "none", background: "transparent", transition: "all .15s" };

  const save = () => { onChange(rows.map((r) => ({ sets: `${r.sets}×`, name: r.name, sub: `${r.reps} reps · ${r.weight}` }))); onSave(); onBack(); };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 28px 16px" }}>
        <button onClick={onBack} className="wcp-ib" style={{ ...iconBtn(), width: 34, height: 34, borderRadius: 10 }}><Icon size={16} sw={2.2} d="M15 18l-6-6 6-6" /></button>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: INK, letterSpacing: "-.01em" }}>{dateLabel}</div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase", color: M2, marginTop: 2 }}>{cell.title} · Workout session</div>
        </div>
        <div style={{ flex: 1 }} />
        <button onClick={save} className="wcp-primary" style={primaryBtn}><Icon stroke="#fff" sw={2.4} d="M5 13l4 4L19 7" /> Save session</button>
      </div>
      <div className="wcp-scroll" style={{ flex: 1, overflow: "auto", padding: "0 28px 20px" }}>
        <div style={{ border: `1px solid ${B1}`, borderRadius: 14, overflow: "hidden", background: "#fff" }}>
          <div style={{ display: "grid", gridTemplateColumns: cols, background: "#F8F6F1", borderBottom: `1px solid ${B1}`, fontSize: 11, fontWeight: 700, letterSpacing: ".05em", color: M3 }}>
            <div style={{ padding: "13px 16px" }}>#</div>
            <div style={{ padding: "13px 4px" }}>EXERCISE</div>
            <div style={{ padding: "13px 4px", textAlign: "center" }}>SETS</div>
            <div style={{ padding: "13px 4px", textAlign: "center" }}>REPS</div>
            <div style={{ padding: "13px 4px", textAlign: "center" }}>WEIGHT</div>
            <div style={{ padding: "13px 4px", textAlign: "center" }}>REST</div>
            <div />
          </div>
          {rows.map((r, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: cols, alignItems: "center", borderBottom: `1px solid #F4F1EA` }}>
              <div style={{ padding: "0 16px", fontSize: 14, fontWeight: 600, color: INK }}>{i + 1}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 4px", minWidth: 0 }}>
                <span style={{ flex: "none", width: 34, height: 34, borderRadius: 9, background: `linear-gradient(140deg, ${ACCENT}, ${ACCENT_DEEP})`, color: "#fff", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{String.fromCharCode(65 + i)}</span>
                <input value={r.name} onChange={(e) => update(i, "name", e.target.value)} style={{ flex: 1, minWidth: 0, border: "1px solid transparent", borderRadius: 8, padding: "7px 8px", fontFamily: FONT, fontSize: 14.5, fontWeight: 600, color: INK, outline: "none", background: "transparent" }} onFocus={(e) => { e.target.style.borderColor = ACCENT; e.target.style.background = "#fff"; }} onBlur={(e) => { e.target.style.borderColor = "transparent"; e.target.style.background = "transparent"; }} />
              </div>
              <div style={{ textAlign: "center" }}><input value={r.sets} onChange={(e) => update(i, "sets", e.target.value)} style={cellInput} onFocus={(e) => { e.target.style.borderColor = ACCENT; e.target.style.background = "#fff"; }} onBlur={(e) => { e.target.style.borderColor = "transparent"; e.target.style.background = "transparent"; }} /></div>
              <div style={{ textAlign: "center" }}><input value={r.reps} onChange={(e) => update(i, "reps", e.target.value)} style={cellInput} onFocus={(e) => { e.target.style.borderColor = ACCENT; e.target.style.background = "#fff"; }} onBlur={(e) => { e.target.style.borderColor = "transparent"; e.target.style.background = "transparent"; }} /></div>
              <div style={{ textAlign: "center" }}><input value={r.weight} onChange={(e) => update(i, "weight", e.target.value)} style={cellInput} onFocus={(e) => { e.target.style.borderColor = ACCENT; e.target.style.background = "#fff"; }} onBlur={(e) => { e.target.style.borderColor = "transparent"; e.target.style.background = "transparent"; }} /></div>
              <div style={{ textAlign: "center" }}><input value={r.rest} onChange={(e) => update(i, "rest", e.target.value)} style={cellInput} onFocus={(e) => { e.target.style.borderColor = ACCENT; e.target.style.background = "#fff"; }} onBlur={(e) => { e.target.style.borderColor = "transparent"; e.target.style.background = "transparent"; }} /></div>
              <div style={{ textAlign: "center" }}><button onClick={() => del(i)} title="Remove" className="wcp-ib" style={{ ...iconBtn(DANGER), width: 28, height: 28, border: "none", background: "transparent" }}>×</button></div>
            </div>
          ))}
          <button onClick={add} style={{ width: "100%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, background: FOOT, border: "none", padding: "13px", fontFamily: FONT, fontSize: 13, fontWeight: 600, color: ACCENT }}>
            <Icon size={15} sw={2.2} d="M12 5v14M5 12h14" /> Add exercise
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- CALENDAR ---------- */
function CalendarScreen() {
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const startDay = (monthStart.getDay() + 6) % 7; // mon-first
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const monthLabel = today.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const events = { 3: { t: "Lower", c: ACCENT }, 5: { t: "Push", c: "#4338CA" }, 8: { t: "Pull", c: "#C2410C" }, 10: { t: "HIIT", c: DANGER }, 12: { t: "Lower", c: ACCENT }, 15: { t: "Mobility", c: "#0891b2" }, 17: { t: "Push", c: "#4338CA" }, 19: { t: "Pull", c: "#C2410C" }, 22: { t: "Lower", c: ACCENT }, 24: { t: "HIIT", c: DANGER } };
  const cells = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 28px 12px" }}>
        <span style={{ fontSize: 18, fontWeight: 800, color: INK }}>{monthLabel}</span>
        <div style={{ flex: 1 }} />
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 38, padding: "0 14px", borderRadius: 10, border: `1px solid ${B2}`, background: "#fff", fontSize: 13, fontWeight: 600, color: M4 }}>
          <Icon size={15} stroke={ACCENT}><circle cx="12" cy="8" r="3.5" /><path d="M5 20a7 7 0 0 1 14 0" /></Icon> All clients
        </div>
      </div>
      <div className="wcp-scroll" style={{ flex: 1, overflowY: "auto", padding: "0 28px 28px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 8, marginBottom: 8 }}>
          {DOW.map((d) => <div key={d} style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".06em", color: M3, padding: "0 4px" }}>{d}</div>)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 8 }}>
          {cells.map((d, i) => {
            const ev = d && events[d];
            const isToday = d === today.getDate();
            return (
              <div key={i} style={{ minHeight: 96, borderRadius: 12, border: `1px solid ${d ? B1 : "transparent"}`, background: d ? "#fff" : "transparent", padding: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                {d && (
                  <>
                    <span style={{ fontSize: 13, fontWeight: 700, color: isToday ? "#fff" : INK, background: isToday ? ACCENT : "transparent", width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>{d}</span>
                    {ev && (
                      <div style={{ background: "#F4F8F6", borderLeft: `3px solid ${ev.c}`, borderRadius: 6, padding: "5px 8px" }}>
                        <div style={{ fontSize: 11.5, fontWeight: 700, color: INK }}>{ev.t}</div>
                        <div style={{ fontSize: 10.5, color: M2 }}>Workout</div>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------- APPROVALS ---------- */
function ApprovalsScreen({ rows, autoProgress, onApprove, onReject }) {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "18px 28px 8px" }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: INK }}>Pending approvals</div>
        <div style={{ fontSize: 13, color: M1, marginTop: 4 }}>Imported and coach-added exercises that resemble existing library entries. {autoProgress ? "Auto-progress is on for in-bounds items." : "Review each before promoting."}</div>
      </div>
      <div className="wcp-scroll" style={{ flex: 1, overflowY: "auto", padding: "14px 28px 28px" }}>
        {rows.length === 0 ? <EmptyState title="All caught up" body="There are no exercises waiting for review." /> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 760 }}>
            {rows.map((r) => (
              <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 16, background: "#fff", border: `1px solid ${B1}`, borderRadius: 14, padding: 14 }}>
                <div style={{ width: 72, height: 56, borderRadius: 10, overflow: "hidden", background: "#11201B", flex: "none" }}>
                  <img src={r.img || "/placeholder.svg"} alt={r.name} crossOrigin="anonymous" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: INK }}>{r.name}</div>
                  {r.dupOf && <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: GOLD, marginTop: 3 }}><Icon size={12}><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /><path d="M12 9v4M12 17h.01" /></Icon> Resembles “{r.dupOf}”</div>}
                  <div style={{ fontSize: 12, color: M2, marginTop: 3 }}>{r.equipment} · {r.muscles.join(", ")}</div>
                </div>
                <button onClick={() => onReject(r)} className="wcp-ghost" style={{ ...ghostBtn, height: 36 }}>Reject</button>
                <button onClick={() => onApprove(r)} style={{ cursor: "pointer", height: 36, background: ACCENT, color: "#fff", border: "none", borderRadius: 10, padding: "0 16px", fontFamily: FONT, fontSize: 13, fontWeight: 600 }}>Approve</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- SETTINGS ---------- */
function SettingsScreen({ autoProgress, setAutoProgress }) {
  const [units, setUnits] = useState("lb");
  const [autoVideo, setAutoVideo] = useState(true);
  const Row = ({ title, body, children }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 18px", borderBottom: `1px solid #F4F1EA` }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: INK }}>{title}</div>
        <div style={{ fontSize: 12.5, color: M1, marginTop: 3 }}>{body}</div>
      </div>
      {children}
    </div>
  );
  const Toggle = ({ on, onClick }) => (
    <div onClick={onClick} style={{ cursor: "pointer", width: 42, height: 24, borderRadius: 13, padding: 2, display: "flex", background: on ? ACCENT : "#D8D3C8", justifyContent: on ? "flex-end" : "flex-start", transition: "all .18s", flex: "none" }}>
      <span style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 2px rgba(0,0,0,.2)" }} />
    </div>
  );
  return (
    <div className="wcp-scroll" style={{ height: "100%", overflowY: "auto", padding: "22px 28px 32px" }}>
      <div style={{ maxWidth: 640 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: INK, marginBottom: 4 }}>Workout settings</div>
        <div style={{ fontSize: 13, color: M1, marginBottom: 18 }}>Defaults applied across the exercise library and program builder.</div>
        <div style={{ background: "#fff", border: `1px solid ${B1}`, borderRadius: 16, overflow: "hidden" }}>
          <Row title="Auto-progress in-bounds workouts" body="Automatically advance loads when a session is completed within target ranges.">
            <Toggle on={autoProgress} onClick={() => setAutoProgress((v) => !v)} />
          </Row>
          <Row title="Require video on new exercises" body="Coach-added exercises stay in review until a demo clip is attached.">
            <Toggle on={autoVideo} onClick={() => setAutoVideo((v) => !v)} />
          </Row>
          <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 18px" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: INK }}>Default weight units</div>
              <div style={{ fontSize: 12.5, color: M1, marginTop: 3 }}>Used when prescribing loads in the builder.</div>
            </div>
            <div style={{ display: "inline-flex", gap: 3, background: CHIP_BG, border: `1px solid ${CHIP_BD}`, borderRadius: 10, padding: 3 }}>
              {["lb", "kg"].map((u) => (
                <button key={u} onClick={() => setUnits(u)} style={{ cursor: "pointer", border: "none", borderRadius: 7, padding: "6px 16px", fontFamily: FONT, fontSize: 13, fontWeight: 600, background: units === u ? "#fff" : "transparent", color: units === u ? INK : M4, boxShadow: units === u ? "0 1px 2px rgba(36,53,49,.12)" : "none" }}>{u}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- MODALS / DRAWER ---------- */
function Overlay({ children, onClose, align = "center" }) {
  return (
    <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(20,32,28,.42)", display: "flex", alignItems: align === "right" ? "stretch" : "center", justifyContent: align === "right" ? "flex-end" : "center", zIndex: 50, animation: "wcp-overlayIn .15s ease", padding: align === "right" ? 0 : 24 }}>
      {children}
    </div>
  );
}

function MergeModal({ items, onClose, onConfirm }) {
  const [keepId, setKeepId] = useState(items[0]?.id);
  return (
    <Overlay onClose={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 460, maxWidth: "100%", background: "#fff", borderRadius: 18, overflow: "hidden", animation: "wcp-modalIn .22s cubic-bezier(.2,.8,.2,1)", boxShadow: "0 30px 70px rgba(0,0,0,.32)" }}>
        <div style={{ padding: "20px 22px 14px", borderBottom: `1px solid ${B1}` }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: INK }}>Merge {items.length} exercises</div>
          <div style={{ fontSize: 13, color: M1, marginTop: 4 }}>Keep one entry. The others will be removed and references re-pointed.</div>
        </div>
        <div style={{ padding: "14px 22px", display: "flex", flexDirection: "column", gap: 8, maxHeight: 280, overflowY: "auto" }} className="wcp-scroll">
          {items.map((it) => {
            const on = keepId === it.id;
            return (
              <label key={it.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 12, border: `1.5px solid ${on ? ACCENT : B1}`, background: on ? "#F4F8F6" : "#fff", cursor: "pointer" }}>
                <input type="radio" checked={on} onChange={() => setKeepId(it.id)} style={{ accentColor: ACCENT }} />
                <div style={{ width: 40, height: 32, borderRadius: 7, overflow: "hidden", background: "#11201B", flex: "none" }}><img src={it.img || "/placeholder.svg"} alt="" crossOrigin="anonymous" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: INK }}>{it.name}</div>
                  <div style={{ fontSize: 11.5, color: M2 }}>{it.equipment}</div>
                </div>
                {on && <span style={{ fontSize: 11, fontWeight: 700, color: ACCENT, background: "rgba(47,107,92,.1)", padding: "3px 8px", borderRadius: 6 }}>KEEP</span>}
              </label>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 10, padding: "14px 22px 18px", borderTop: `1px solid ${B1}` }}>
          <button onClick={onClose} className="wcp-ghost" style={{ ...ghostBtn, flex: 1, justifyContent: "center" }}>Cancel</button>
          <button onClick={onConfirm} className="wcp-primary" style={{ ...primaryBtn, flex: 1, justifyContent: "center" }}>Merge exercises</button>
        </div>
      </div>
    </Overlay>
  );
}

function EditDrawer({ draft, setDraft, onClose, onSave }) {
  const label = { fontSize: 10.5, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: M2, marginBottom: 6 };
  const inp = { width: "100%", border: `1px solid ${B2}`, background: "#fff", borderRadius: 10, padding: "10px 12px", fontFamily: FONT, fontSize: 14, color: INK, outline: "none" };
  return (
    <Overlay onClose={onClose} align="right">
      <div onClick={(e) => e.stopPropagation()} style={{ width: 420, maxWidth: "100%", height: "100%", background: "#fff", display: "flex", flexDirection: "column", animation: "wcp-drawerIn .26s cubic-bezier(.2,.8,.2,1)", boxShadow: "-20px 0 60px rgba(0,0,0,.22)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 22px", borderBottom: `1px solid ${B1}` }}>
          <div style={{ flex: 1, fontSize: 16, fontWeight: 800, color: INK }}>Edit exercise</div>
          <button onClick={onClose} className="wcp-ib" style={{ ...iconBtn(), width: 32, height: 32 }}><Icon size={16} d="M18 6L6 18M6 6l12 12" /></button>
        </div>
        <div className="wcp-scroll" style={{ flex: 1, overflowY: "auto", padding: 22, display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ height: 150, borderRadius: 12, overflow: "hidden", background: "#11201B" }}><img src={draft.img || "/placeholder.svg"} alt={draft.name} crossOrigin="anonymous" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>
          <div><div style={label}>Name</div><input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} style={inp} /></div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}><div style={label}>Equipment</div><input value={draft.equipment} onChange={(e) => setDraft({ ...draft, equipment: e.target.value })} style={inp} /></div>
            <div style={{ flex: 1.4 }}><div style={label}>Muscles</div><input value={draft.muscleInput} onChange={(e) => setDraft({ ...draft, muscleInput: e.target.value })} placeholder="comma separated" style={inp} /></div>
          </div>
          <div>
            <div style={label}>Status</div>
            <div style={{ display: "flex", gap: 8 }}>
              {["active", "review", "archived"].map((s) => {
                const on = draft.status === s;
                const p = STATUS_PILL[s];
                return <button key={s} onClick={() => setDraft({ ...draft, status: s })} style={{ cursor: "pointer", flex: 1, border: `1.5px solid ${on ? ACCENT : B2}`, background: on ? "#F4F8F6" : "#fff", borderRadius: 10, padding: "9px", fontFamily: FONT, fontSize: 12.5, fontWeight: 700, color: on ? ACCENT : M4 }}>{p.label}</button>;
              })}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, padding: "16px 22px", borderTop: `1px solid ${B1}` }}>
          <button onClick={onClose} className="wcp-ghost" style={{ ...ghostBtn, flex: 1, justifyContent: "center" }}>Cancel</button>
          <button onClick={onSave} className="wcp-primary" style={{ ...primaryBtn, flex: 1, justifyContent: "center" }}>Save changes</button>
        </div>
      </div>
    </Overlay>
  );
}

function CreateModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ name: "", equipment: "", muscleInput: "" });
  const label = { fontSize: 10.5, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: M2, marginBottom: 6 };
  const inp = { width: "100%", border: `1px solid ${B2}`, background: "#fff", borderRadius: 10, padding: "10px 12px", fontFamily: FONT, fontSize: 14, color: INK, outline: "none" };
  return (
    <Overlay onClose={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 440, maxWidth: "100%", background: "#fff", borderRadius: 18, overflow: "hidden", animation: "wcp-modalIn .22s cubic-bezier(.2,.8,.2,1)", boxShadow: "0 30px 70px rgba(0,0,0,.32)" }}>
        <div style={{ padding: "20px 22px 14px", borderBottom: `1px solid ${B1}` }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: INK }}>Add exercise</div>
          <div style={{ fontSize: 13, color: M1, marginTop: 4 }}>New exercises land in Needs review until approved.</div>
        </div>
        <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 16 }}>
          <div><div style={label}>Name</div><input autoFocus value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Bulgarian Split Squat" style={inp} /></div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}><div style={label}>Equipment</div><input value={form.equipment} onChange={(e) => setForm({ ...form, equipment: e.target.value })} placeholder="Dumbbells" style={inp} /></div>
            <div style={{ flex: 1.4 }}><div style={label}>Muscles</div><input value={form.muscleInput} onChange={(e) => setForm({ ...form, muscleInput: e.target.value })} placeholder="Quads, Glutes" style={inp} /></div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, padding: "14px 22px 18px", borderTop: `1px solid ${B1}` }}>
          <button onClick={onClose} className="wcp-ghost" style={{ ...ghostBtn, flex: 1, justifyContent: "center" }}>Cancel</button>
          <button onClick={() => form.name.trim() && onCreate(form)} className="wcp-primary" style={{ ...primaryBtn, flex: 1, justifyContent: "center", opacity: form.name.trim() ? 1 : 0.5 }}>Add exercise</button>
        </div>
      </div>
    </Overlay>
  );
}

function IngestModal({ onClose, onDone }) {
  return (
    <Overlay onClose={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 460, maxWidth: "100%", background: "#fff", borderRadius: 18, overflow: "hidden", animation: "wcp-modalIn .22s cubic-bezier(.2,.8,.2,1)", boxShadow: "0 30px 70px rgba(0,0,0,.32)" }}>
        <div style={{ padding: "20px 22px 14px", borderBottom: `1px solid ${B1}` }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: INK }}>Ingest exercises</div>
          <div style={{ fontSize: 13, color: M1, marginTop: 4 }}>Import from a spreadsheet or another coach's library. Items are de-duplicated against your org library.</div>
        </div>
        <div style={{ padding: 22 }}>
          <div style={{ border: `2px dashed ${B2}`, borderRadius: 14, padding: "34px 20px", textAlign: "center", color: M1, background: "#FCFBF8" }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: "#F1EEE7", display: "inline-flex", alignItems: "center", justifyContent: "center", color: ACCENT, marginBottom: 12 }}>
              <Icon size={22} stroke={ACCENT} d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: INK }}>Drop a CSV or XLSX file</div>
            <div style={{ fontSize: 12.5, marginTop: 4 }}>or click to browse · max 500 rows</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, padding: "0 22px 18px" }}>
          <button onClick={onClose} className="wcp-ghost" style={{ ...ghostBtn, flex: 1, justifyContent: "center" }}>Cancel</button>
          <button onClick={onDone} className="wcp-primary" style={{ ...primaryBtn, flex: 1, justifyContent: "center" }}>Start ingest</button>
        </div>
      </div>
    </Overlay>
  );
}

function ConfirmDialog({ confirm, onCancel, onConfirm }) {
  const isArchive = confirm.kind === "archive";
  return (
    <Overlay onClose={onCancel}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 400, maxWidth: "100%", background: "#fff", borderRadius: 18, overflow: "hidden", animation: "wcp-modalIn .22s cubic-bezier(.2,.8,.2,1)", boxShadow: "0 30px 70px rgba(0,0,0,.32)" }}>
        <div style={{ padding: "22px 22px 16px" }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: isArchive ? "rgba(192,138,46,.12)" : "rgba(217,83,79,.12)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
            {isArchive
              ? <Icon size={20} stroke={ARCHIVE}><rect x="3" y="4" width="18" height="4" rx="1" /><path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8M10 12h4" /></Icon>
              : <Icon size={20} stroke={DANGER} d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6" />}
          </div>
          <div style={{ fontSize: 17, fontWeight: 800, color: INK }}>{isArchive ? "Archive" : "Delete"} {confirm.name}?</div>
          <div style={{ fontSize: 13.5, color: M1, marginTop: 6, lineHeight: 1.5 }}>
            {isArchive ? "Archived items are hidden from the active library but can be restored later." : "This permanently removes the selection. This action cannot be undone."}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, padding: "0 22px 18px" }}>
          <button onClick={onCancel} className="wcp-ghost" style={{ ...ghostBtn, flex: 1, justifyContent: "center" }}>Cancel</button>
          <button onClick={onConfirm} style={{ cursor: "pointer", flex: 1, border: "none", borderRadius: 11, padding: 11, fontFamily: FONT, fontSize: 14, fontWeight: 700, color: "#fff", background: isArchive ? ARCHIVE : DANGER }}>{isArchive ? "Archive" : "Delete"}</button>
        </div>
      </div>
    </Overlay>
  );
}
