import React, { useState, useRef, useEffect } from "react";

/* ============================================================
 * Milton — Files
 * Built from the Files experience spec. Tokens are scoped to
 * .mfx so this canvas can't leak styles into the dashboard.
 * ============================================================ */

const FX_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&display=swap');

.mfx {
  --white:#FFFFFF;
  --teal-050:#F0F7F7; --teal-100:#E4F0F0; --teal-200:#CFE6E6; --teal-300:#A9D3D6;
  --teal-400:#7DBEC4; --teal-500:#4BA3AE; --teal-600:#2A8897; --teal-700:#176B7C;
  --teal-800:#0E5D70; --teal-900:#0C5060;
  --ink-050:#F9FAFA; --ink-100:#F3F5F6; --ink-150:#EBEEEF; --ink-200:#DEE4E5;
  --ink-300:#C2CACC; --ink-400:#9FA8AB; --ink-500:#7D8789; --ink-600:#5E6A6E;
  --ink-700:#3F4A4E; --ink-800:#242D31; --ink-900:#1A2327; --ink-950:#0B1417;
  --green-100:#E8F7E3; --green-600:#51B565; --green-700:#3FA053; --green-800:#2F7E3E;
  --accent-blue-100:#E2ECFD; --accent-blue-200:#C7DDFB; --accent-blue-500:#3F88F2;
  --accent-red-100:#FDDCDC; --accent-red-200:#F9C8C8; --accent-red-500:#E14D4D;
  --accent-amber-100:#FCEDD2; --accent-amber-200:#F7DBA8; --accent-amber-500:#E89C3A;
  --accent-violet-100:#EDE4FE; --accent-violet-500:#8B5CF6;
  --accent-slate-100:#E4E8EE; --accent-slate-500:#7788A0;
  --accent-peach-500:#E87560;
  --sem-brand-bg:var(--accent-violet-100); --sem-brand-fg:#6A3FD7;
  --sem-warn-bg:#FDEECC; --sem-warn-fg:#9A6409;
  --sem-danger-bg:#FBE1DE; --sem-danger-fg:#A4302E; --sem-danger-mid:var(--accent-red-500);
  --sem-info-bg:#DCE8F9; --sem-info-fg:#1F5BA8;
  --fg-1:var(--ink-900); --fg-2:var(--ink-700); --fg-3:var(--ink-500);
  --bg-app:var(--ink-100);
  --radius-md:12px; --radius-lg:16px;
  --shadow-sm:0 1px 3px rgba(14,93,112,.08), 0 1px 2px rgba(14,93,112,.04);
  --shadow-md:0 4px 12px rgba(14,93,112,.10);
  --shadow-lg:0 12px 32px rgba(14,93,112,.14);
  font-family:'Lexend', system-ui, sans-serif;
  color:var(--fg-1);
}
.mfx *, .mfx *::before, .mfx *::after { box-sizing:border-box; }
.mfx h2, .mfx h3 { margin:0; font-weight:600; }

.mfx .eyebrow { font-size:12px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:var(--fg-3); }

.mfx .btn {
  display:inline-flex; align-items:center; justify-content:center; gap:8px;
  padding:10px 18px; border-radius:999px; font-family:inherit; font-size:14px;
  font-weight:600; line-height:1; border:0; cursor:pointer; white-space:nowrap;
  transition:background .15s ease, box-shadow .15s ease, color .15s ease;
}
.mfx .btn--sm { padding:6px 12px; font-size:13px; }
.mfx .btn--block { width:100%; }
.mfx .btn--primary { background:var(--teal-800); color:var(--white); box-shadow:var(--shadow-sm); }
.mfx .btn--primary:hover { background:var(--teal-700); box-shadow:var(--shadow-md); }
.mfx .btn--secondary { background:var(--white); color:var(--fg-1); box-shadow:inset 0 0 0 1px var(--ink-200); }
.mfx .btn--secondary:hover { background:var(--ink-050); box-shadow:inset 0 0 0 1px var(--ink-300); }
.mfx .btn--ghost { background:transparent; color:var(--fg-2); }
.mfx .btn--ghost:hover { background:var(--ink-100); color:var(--fg-1); }

.mfx .status {
  display:inline-flex; align-items:center; gap:6px; padding:4px 12px; border-radius:999px;
  font-size:12px; font-weight:600; line-height:1.4; white-space:nowrap;
}
.mfx .status--dot::before {
  content:''; display:inline-block; width:6px; height:6px; border-radius:999px;
  background:currentColor; flex:none;
}
.mfx .status--brand { background:var(--sem-brand-bg); color:var(--sem-brand-fg); }

.mfx .quote {
  position:relative; padding:12px 16px 12px 20px; background:var(--teal-050);
  border-radius:0 var(--radius-md) var(--radius-md) 0; color:var(--fg-2); line-height:1.5;
}
.mfx .quote::before { content:''; position:absolute; left:0; top:0; bottom:0; width:3px; background:var(--teal-600); border-radius:999px; }
.mfx .quote--amber { background:var(--accent-amber-100); }
.mfx .quote--amber::before { background:var(--accent-amber-500); }

.mfx .fx-row { cursor:pointer; transition:background .12s ease; }
.mfx .fx-row:hover { background:var(--teal-050); }
.mfx .fx-card { transition:border-color .12s ease, background .12s ease; }
.mfx .fx-card:hover { border-color:var(--teal-400); }
.mfx .fx-folder:hover { border-color:var(--teal-400); background:var(--teal-050); }
.mfx .fx-link { background:none; border:none; cursor:pointer; padding:0; font-family:inherit; transition:color .12s ease; }
.mfx .fx-link:hover { color:var(--teal-800); }
.mfx .fx-remove:hover { color:var(--sem-danger-fg); }
.mfx input { font-family:inherit; }
@keyframes fxFade { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:none; } }
.mfx .fx-fade { animation:fxFade .22s ease; }
@keyframes fxSlide { from { opacity:0; transform:translateX(16px); } to { opacity:1; transform:none; } }
.mfx .fx-slide { animation:fxSlide .2s ease; }
@media (prefers-reduced-motion: reduce) { .mfx .fx-fade, .mfx .fx-slide { animation:none; } }
`;

/* ---------- data ---------- */

const KIND = {
  video: ["var(--accent-blue-100)", "var(--accent-blue-500)", "MP4"],
  mov: ["var(--accent-blue-100)", "var(--accent-blue-500)", "MOV"],
  pdf: ["var(--accent-red-100)", "var(--accent-red-500)", "PDF"],
  image: ["var(--accent-violet-100)", "var(--accent-violet-500)", "JPG"],
  doc: ["var(--accent-amber-100)", "var(--accent-amber-500)", "DOC"],
  zip: ["var(--accent-slate-100)", "var(--accent-slate-500)", "ZIP"],
};

const PERM = {
  "All coaches": ["var(--ink-100)", "var(--fg-2)"],
  "Admins · coach read": ["var(--sem-warn-bg)", "var(--sem-warn-fg)"],
  "Admins only": ["var(--sem-warn-bg)", "var(--sem-warn-fg)"],
};

const FOLDERS = [
  ["Exercise Library", "428 files", "Movement videos, demos, variations", "All coaches"],
  ["Programs & Templates", "36 files", "Program files, workout templates", "All coaches"],
  ["Courses & Education", "12 files", "Course material, lesson content", "All coaches"],
  ["Handouts & Guides", "24 files", "Client-facing PDFs, nutrition guides", "All coaches"],
  ["Forms & Waivers", "9 files", "Intake forms, liability waivers, policies", "Admins · coach read"],
  ["Brand & Marketing", "61 files", "Logos, gym photos, social assets", "All coaches"],
  ["Operations", "18 files", "SOPs, staff onboarding, schedules", "Admins only"],
];

const CLIENTS = [
  ["Sarah Mitchell", "var(--accent-peach-500)", "Fat loss phase 2 · week 6 of 12", "14 files · 6 from her, 7 shared, 1 from Milton", 2],
  ["Derek Yu", "var(--accent-blue-500)", "Strength block · week 3 of 8", "9 files · 3 from him, 5 shared, 1 from Milton", 0],
  ["Marcus Johnson", "var(--green-700)", "Re-assessment due · 8 weeks in", "6 files · 2 from him, 4 shared", 1],
  ["Emily Rodriguez", "var(--accent-violet-500)", "Returning · missed 2 sessions", "11 files · 5 from her, 6 shared", 0],
  ["Priya Shah", "var(--teal-700)", "Onboarding · week 1", "4 files · 1 from her, 3 shared", 3],
  ["Tom Alvarez", "var(--accent-slate-500)", "Hybrid · remote check-ins", "7 files · 2 from him, 5 shared", 0],
];

const RECENT = [
  ["Barbell Deadlift — Conventional.mp4", "mov", "0:42 · 84 MB · you, 2h ago", "Deadlift (Conventional)", "Exercise Library", "All coaches", false, "library", "hinge barbell posterior chain deadlift"],
  ["Sarah — week 6 progress photos.heic", "image", "3 images · Sarah Mitchell, 4h ago", "Progress photo, front + side", "Sarah Mitchell", "Sarah + her coach", true, "client", "progress photo sarah mitchell"],
  ["Fat Loss Phase 2 — 12 week.pdf", "pdf", "14 pages · you, yesterday", "Program document", "Programs & Templates, Sarah M., Derek Y.", "All coaches", false, "library", "program fat loss phase deadlift squat"],
  ["Front Squat — Tempo 3-1-1.mp4", "mov", "0:38 · 61 MB · you, yesterday", "Front Squat (Tempo) · possible duplicate", "Confirm queue", "All coaches", false, "library", "front squat tempo"],
  ["Derek — bloodwork Jan 2026.pdf", "pdf", "4 pages · Derek Yu, 2d ago", "Lab document", "Derek Yu", "Derek + his coach", true, "client", "bloodwork derek labs"],
  ["Nutrition Starter Guide.pdf", "pdf", "8 pages · Marcus, 3d ago", "Client handout", "Handouts & Guides, 14 clients", "All coaches", false, "library", "nutrition guide handout protein"],
  ["Liability Waiver 2026.pdf", "pdf", "2 pages · admin, 4d ago", "Waiver, signature required", "Forms & Waivers", "Admins · coach read", false, "library", "waiver liability form"],
  ["Rack wall — gym interior.jpg", "image", "4.1 MB · admin, 5d ago", "Gym photo, equipment", "Brand & Marketing", "All coaches", false, "library", "gym photo rack brand"],
];

const EXERCISE_FILES = [
  ["Barbell Deadlift — Conventional.mp4", "mov", "0:42", "Deadlift (Conventional)", "Exercise Library, Sarah M.", "All coaches"],
  ["Romanian Deadlift — Dumbbell.mp4", "mov", "0:31", "Romanian Deadlift (DB)", "Exercise Library", "All coaches"],
  ["Front Squat — Tempo.mp4", "mov", "0:36", "Front Squat (Tempo)", "Exercise Library, 3 programs", "All coaches"],
  ["Kettlebell Swing — Russian.mp4", "mov", "0:24", "KB Swing (Russian)", "Exercise Library", "All coaches"],
  ["Walking Lunge — Dumbbell.mp4", "mov", "0:29", "Walking Lunge (DB)", "Exercise Library, Emily R.", "All coaches"],
  ["Bench Press — Paused.mp4", "mov", "0:33", "Bench Press (Paused)", "Exercise Library, Derek Y.", "All coaches"],
  ["Split Squat — Rear Foot Elevated.mp4", "mov", "0:41", "RFE Split Squat", "Exercise Library", "All coaches"],
  ["Pull-up — Tempo eccentric.mp4", "mov", "0:27", "Pull-up (Eccentric)", "Exercise Library, Beginner Program", "All coaches"],
];

const OTHER_FILES = [
  ["Beginner Strength — 8 week.pdf", "pdf", "12 pages", "Program document", "Programs & Templates, 6 clients", "All coaches"],
  ["Intake Questionnaire.pdf", "pdf", "3 pages", "Intake form", "Forms & Waivers", "Admins · coach read"],
  ["Protein Targets — one pager.pdf", "pdf", "1 page", "Client handout", "Handouts & Guides, 22 clients", "All coaches"],
  ["Staff Onboarding SOP.docx", "doc", "9 pages", "Internal SOP", "Operations", "Admins only"],
];

const TRASH = [
  ["Front Squat — Tempo (old).mp4", "mov", "Replaced by you · 26 days left", "3 program references repoint on delete"],
  ["Nutrition Guide v1.pdf", "pdf", "Deleted by admin · 12 days left", "2 client shares break on delete"],
  ["Gym exterior — old signage.jpg", "image", "Deleted by admin · 4 days left", "No references"],
];

const CONFIRM = [
  { id: "c1", file: "IMG_4821.MOV", dur: "0:42", name: "Barbell Deadlift — Conventional", match: "Deadlift (Conventional) · 96% transcript + pose match", tags: "hinge · barbell · posterior chain", dest: "Exercise Library", kind: "clean" },
  { id: "c2", file: "IMG_4822.MOV", dur: "0:31", name: "Romanian Deadlift — Dumbbell", match: "Romanian Deadlift (DB) · 94% match", tags: "hinge · dumbbell · hamstrings", dest: "Exercise Library", kind: "clean" },
  { id: "c3", file: "IMG_4823.MOV", dur: "0:38", name: "Front Squat — Tempo 3-1-1", match: "Front Squat (Tempo) · 91% match", tags: "squat · barbell · tempo", dest: "Exercise Library", kind: "dup", dupName: "Front Squat — Tempo.mp4", dupMeta: "Uploaded Mar 2025 · 0:36 · used in 3 programs", newMeta: "Today · 0:38 · 61 MB" },
  { id: "c4", file: "IMG_4826.MOV", dur: "0:24", name: "Kettlebell Swing — Russian", match: "KB Swing (Russian) · 97% match", tags: "hinge · kettlebell · conditioning", dest: "Exercise Library", kind: "clean" },
  { id: "c5", file: "IMG_4830.MOV", dur: "1:12", name: "", match: "No confident match", tags: "unset", dest: "Exercise Library", kind: "ambiguous", note: "Two movements in one clip. Split it or name it yourself." },
  { id: "c6", file: "IMG_4831.MOV", dur: "0:29", name: "Walking Lunge — Dumbbell", match: "Walking Lunge (DB) · 95% match", tags: "lunge · dumbbell · unilateral", dest: "Exercise Library", kind: "clean" },
];

const SNIP = {
  mov: "“Set up mid-foot, brace hard, then push the floor away.” — transcript 0:12. Searchable by anything said in the clip.",
  video: "“Set up mid-foot, brace hard, then push the floor away.” — transcript 0:12.",
  pdf: "Text layer indexed. Page 4: “protein target 1.8 g/kg bodyweight”. Search reaches inside the document.",
  image: "Recognized as a progress photo, front + side. Stored against the client profile, not the Library.",
  doc: "Text layer indexed. Internal document — not client-facing.",
};

const TAGS = {
  mov: ["Movement video", "Transcript indexed", "Pose matched"],
  video: ["Movement video", "Transcript indexed", "Pose matched"],
  pdf: ["Document", "Text indexed", "Client-facing"],
  image: ["Image", "Client upload", "Auto-filed"],
  doc: ["Document", "Internal", "Text indexed"],
};

const TRAY_ITEMS = [
  { name: "IMG_4821.MOV", state: "Tagged", pct: "100%", fg: "var(--green-800)" },
  { name: "IMG_4822.MOV", state: "Tagged", pct: "100%", fg: "var(--green-800)" },
  { name: "IMG_4823.MOV", state: "Duplicate found", pct: "100%", fg: "var(--sem-warn-fg)" },
  { name: "IMG_4824.MOV", state: "Transcribing", pct: "68%", fg: "var(--fg-3)" },
  { name: "IMG_4825.MOV", state: "Uploading", pct: "24%", fg: "var(--fg-3)" },
];

const SHARE_TARGETS = ["Sarah Mitchell", "Derek Yu", "Marcus Johnson", "Beginner group", "All active clients"];
const TABS = ["Library", "Clients", "Recent", "Trash"];
const TAB_COUNTS = { Library: "588", Clients: "73", Recent: "31", Trash: "3" };

/* ---------- small pieces ---------- */

const kindOf = (k) => {
  const [kbg, kfg, klabel] = KIND[k] || KIND.doc;
  return { kbg, kfg, klabel };
};
const permOf = (p) => {
  const [pbg, pfg] = PERM[p] || ["var(--sem-info-bg)", "var(--sem-info-fg)"];
  return { perm: p, pbg, pfg };
};

function MiltonMark({ size = 34, radius = 10 }) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: size, height: size, borderRadius: radius, flex: "none",
        background: "linear-gradient(150deg, var(--teal-700), var(--teal-900))",
        display: "grid", placeItems: "center",
      }}
    >
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none" stroke="#CFE6E6" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l1.9 5.3L19 10.2l-5.1 1.9L12 17.4l-1.9-5.3L5 10.2l5.1-1.9L12 3z" />
      </svg>
    </span>
  );
}

const Chevron = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
);

function KindTile({ f, size = 42 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: 10, background: f.kbg, color: f.kfg, display: "grid", placeItems: "center", fontSize: 10.5, fontWeight: 700, flex: "none" }}>
      {f.klabel}
    </div>
  );
}

function PermPill({ f, width }) {
  return (
    <span style={{ flex: "none", width, textAlign: width ? "center" : undefined, fontSize: 11.5, fontWeight: 600, padding: "5px 10px", borderRadius: 999, background: f.pbg, color: f.pfg }}>
      {f.perm}
    </span>
  );
}

const truncate = { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" };
const panel = { background: "var(--white)", border: "1px solid var(--ink-200)", borderRadius: "var(--radius-lg)", overflow: "hidden" };
const rowBase = { display: "flex", alignItems: "center", gap: 14, borderTop: "1px solid var(--ink-150)" };

function SectionHead({ title, meta, upper }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 10, paddingBottom: 8 }}>
      <h3 style={upper ? { fontSize: 14, textTransform: "uppercase", letterSpacing: ".08em", color: "var(--fg-3)" } : { fontSize: 15 }}>{title}</h3>
      <span style={{ fontSize: 12, color: "var(--fg-3)" }}>{meta}</span>
    </div>
  );
}

/* ---------- canvas ---------- */

export default function FilesCanvas({ onClose, isMobile = false, orgName = "MMNT Strength Co", defaultTab = "Recent", showMiltonRead = true, density = "Comfortable" }) {
  const [tab, setTab] = useState(defaultTab);
  const [folder, setFolder] = useState(null);
  const [client, setClient] = useState(null);
  const [query, setQuery] = useState("");
  const [tray, setTray] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [share, setShare] = useState(null);
  const [detail, setDetail] = useState(null);
  const [drop, setDrop] = useState(false);
  const [removed, setRemoved] = useState([]);
  const [grid, setGrid] = useState(true);
  const [done, setDone] = useState([]);
  const [dup, setDup] = useState({});
  const [names, setNames] = useState({});
  const [restored, setRestored] = useState([]);
  const [shareTarget, setShareTarget] = useState("Sarah Mitchell");

  /* The spec is drawn at 1200px+. Inside a canvas panel it can be far
     narrower, so columns drop out in tiers instead of truncating to noise. */
  const rootRef = useRef(null);
  const [w, setW] = useState(1200);
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([entry]) => setW(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const compact = isMobile || w < 1060;
  const tight = isMobile || w < 680;

  const rowPad = density === "Compact" ? "9px" : "14px";
  const q = query.trim().toLowerCase();
  const searching = q.length > 1;

  const openShare = (name, owner) => (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setShare({ name, owner: owner || null });
  };

  const mkFile = (row) => {
    const [name, k, meta, read, refs, perm, isNew] = row;
    const f = {
      name, meta, read: read || "Auto-tagged by Milton", refs, isNew: !!isNew, kindKey: k,
      dur: (String(meta).match(/\d:\d\d/) || ["0:00"])[0],
      onShare: openShare(name, isNew ? refs : null),
      ...kindOf(k), ...permOf(perm),
    };
    f.open = () => { setDetail(f); setRemoved([]); };
    return f;
  };

  const goTab = (t) => () => { setTab(t); setFolder(null); setClient(null); };

  const allRows = RECENT.concat(
    EXERCISE_FILES.map((r) => [r[0], r[1], r[2] + " · Exercise Library", r[3], r[4], r[5], false, "library", r[0].toLowerCase()]),
    OTHER_FILES.map((r) => [r[0], r[1], r[2], r[3], r[4], r[5], false, "library", r[0].toLowerCase()])
  );
  const hits = allRows.filter((r) => (r[0] + " " + r[3] + " " + r[4] + " " + (r[8] || "")).toLowerCase().includes(q));
  const mkHit = (r) => ({ ...mkFile(r), hit: "Matched " + (r[8] && r[8].includes(q) ? "tag + transcript" : "filename") + " · " + r[2] });
  const libResults = hits.filter((r) => r[7] === "library").map(mkHit);
  const clientResults = hits.filter((r) => r[7] === "client").map(mkHit);

  const folderFiles = (folder === "Exercise Library" ? EXERCISE_FILES : OTHER_FILES)
    .map((r) => mkFile([r[0], r[1], r[2], r[3], r[4], r[5], false]));

  const pending = CONFIRM.filter((c) => done.indexOf(c.id) < 0);
  const cleanIds = pending.filter((c) => c.kind === "clean").map((c) => c.id);

  const cur = CLIENTS.find((c) => c[0] === client) || CLIENTS[0];
  const first = cur[0].split(" ")[0];

  const detailRefs = (detail ? String(detail.refs).split(", ") : []).filter((r) => removed.indexOf(r) < 0);
  const refCount = detailRefs.length + (detailRefs.length === 1 ? " location" : " locations");

  const contextNote = tab === "Library" ? "Milton built this structure at setup"
    : tab === "Clients" ? "Auto-filed, nothing to organize"
    : tab === "Trash" ? "30 days, restore in one tap" : "Both zones, newest first";

  const showFolders = !searching && tab === "Library" && !folder;
  const inFolder = !searching && tab === "Library" && !!folder;

  /* --- reusable rows --- */

  const FileRow = ({ f, second, mid, midStatus, refsFlex = 1.2, permWidth, right, pad = "13px" }) => (
    <div className="fx-row" onClick={f.open} role="button" tabIndex={0} style={{ ...rowBase, padding: `${pad} 16px` }}>
      <KindTile f={f} size={pad === "13px" ? 42 : 44} />
      <div style={{ flex: 1.5, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 14.5, fontWeight: 600, ...truncate }}>{f.name}</span>
          {f.isNew && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--green-600)", flex: "none" }} />}
        </div>
        <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 3, ...truncate }}>{second}</div>
      </div>
      {mid && showMiltonRead && !compact && (midStatus
        ? <span className="status status--dot status--brand" style={{ flex: 1, minWidth: 0, ...truncate }}>{mid}</span>
        : <span style={{ flex: 1, minWidth: 0, fontSize: 12, color: "var(--fg-2)", ...truncate }}>{mid}</span>)}
      {!tight && <span style={{ flex: refsFlex, minWidth: 0, fontSize: 12, color: "var(--fg-2)", ...truncate }}>In: {f.refs}</span>}
      {!tight && <PermPill f={f} width={compact ? undefined : permWidth} />}
      {right || <button className="btn btn--sm btn--secondary" onClick={f.onShare} style={{ flex: "none" }}>Share</button>}
    </div>
  );

  /* --- client view --- */

  const clientFiles = {
    fromClient: [
      [first + " — week 6 progress photos.heic", "image", "3 images · 4h ago", "", cur[0], first + " + her coach", true],
      [first + " — kitchen scale check.jpg", "image", "1.8 MB · 2d ago", "", cur[0], first + " + her coach", true],
      [first + " — squat form check 120kg.mov", "mov", "0:18 · 5d ago", "", cur[0], first + " + her coach", false],
      [first + " — lab panel Dec.pdf", "pdf", "4 pages · 3w ago", "", cur[0], first + " + her coach", false],
    ].map(mkFile),
    sharedWith: [
      ["Fat Loss Phase 2 — 12 week.pdf", "pdf", "Sent 6 Aug", "", "Programs & Templates, 2 clients", "All coaches"],
      ["Barbell Deadlift — Conventional.mp4", "mov", "Sent 4 Aug", "", "Exercise Library, " + cur[0], "All coaches"],
      ["Nutrition Starter Guide.pdf", "pdf", "Sent 22 Jul", "", "Handouts & Guides, 14 clients", "All coaches"],
      ["Liability Waiver 2026.pdf", "pdf", "Signed 18 Jul", "", "Forms & Waivers", "Admins · coach read"],
    ].map(mkFile),
    fromMilton: [
      ["Progress Report — weeks 1-6", "doc", "Generated 6 Aug · shared with " + first, "Progress Report canvas", "Canvas, " + cur[0], first + " + assigned coach"],
      ["Check-in summary — July", "doc", "Generated 1 Aug · not shared", "Check-in summary", "Canvas", first + " + assigned coach"],
    ].map(mkFile),
  };

  const pagePad = compact ? "18px 18px 0" : "22px 32px 0";
  const bodyPad = compact ? "20px 18px 48px" : "22px 32px 48px";

  return (
    <div ref={rootRef} className="mfx" style={{ display: "flex", height: "100%", position: "relative", background: "var(--bg-app)", overflow: "hidden" }}>
      <style>{FX_CSS}</style>

      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        {client ? (
          <div className="fx-fade" style={{ flex: 1, overflow: "auto" }}>
            <div style={{ padding: pagePad }}>
              <button className="fx-link" onClick={() => setClient(null)} style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--fg-3)", fontSize: 12.5, fontWeight: 500 }}>
                <Chevron /> Back to Files
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0 0", flexWrap: "wrap" }}>
                <span style={{ width: 52, height: 52, borderRadius: 16, background: cur[1], color: "var(--white)", display: "grid", placeItems: "center", fontSize: 18, fontWeight: 600 }}>
                  {cur[0].split(" ").map((w) => w[0]).join("")}
                </span>
                <div>
                  <h2 style={{ fontSize: 24, letterSpacing: "-.02em" }}>{cur[0]}</h2>
                  <div style={{ fontSize: 13, color: "var(--fg-3)", marginTop: 3 }}>{cur[2]}</div>
                </div>
                <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                  <button className="btn btn--secondary btn--sm">Message</button>
                  <button className="btn btn--primary btn--sm" onClick={openShare("Fat Loss Phase 2 — 12 week.pdf")}>Share a file</button>
                </div>
              </div>
              <div style={{ display: "flex", gap: 26, borderBottom: "1px solid var(--ink-200)", marginTop: 20 }}>
                {["Overview", "Program", "Nutrition"].map((t) => (
                  <span key={t} style={{ padding: "0 0 12px", fontSize: 14, color: "var(--fg-3)" }}>{t}</span>
                ))}
                <span style={{ padding: "0 0 10px", fontSize: 14, fontWeight: 600, color: "var(--teal-800)", borderBottom: "2px solid var(--teal-800)" }}>Files</span>
              </div>
            </div>

            <div style={{ padding: bodyPad, display: "flex", flexDirection: "column", gap: 22 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 12.5, color: "var(--fg-3)" }}>Nothing to file. Uploads land here on their own.</span>
                <button className="btn btn--sm btn--ghost" style={{ marginLeft: "auto" }}>Select</button>
                <button className="btn btn--sm btn--ghost">Clean up</button>
              </div>

              <div>
                <SectionHead title="From client" meta={"Auto-saved from " + first + ". No triage, no queue."} />
                <div style={panel}>
                  {clientFiles.fromClient.map((f) => (
                    <div key={f.name} className="fx-row" onClick={f.open} role="button" tabIndex={0} style={{ ...rowBase, padding: "13px 16px" }}>
                      <KindTile f={f} size={40} />
                      <div style={{ flex: 1.4, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 14, fontWeight: 600, ...truncate }}>{f.name}</span>
                          {f.isNew && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--green-600)", flex: "none" }} />}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 3 }}>{f.meta}</div>
                      </div>
                      <PermPill f={f} />
                      <button className="btn btn--sm btn--secondary" onClick={f.onShare} style={{ flex: "none" }}>Share</button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <SectionHead title="Shared with client" meta="7 files sent · newest first" />
                <div style={panel}>
                  {clientFiles.sharedWith.map((f) => (
                    <div key={f.name} className="fx-row" onClick={f.open} role="button" tabIndex={0} style={{ ...rowBase, padding: "13px 16px" }}>
                      <KindTile f={f} size={40} />
                      <div style={{ flex: 1.4, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, ...truncate }}>{f.name}</div>
                        <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 3 }}>{f.meta}</div>
                      </div>
                      <span style={{ flex: 1, minWidth: 0, fontSize: 12, color: "var(--fg-2)", ...truncate }}>In: {f.refs}</span>
                      <button className="btn btn--sm btn--ghost" style={{ flex: "none" }}>Unshare</button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <SectionHead title="From Milton" meta="Generated, not uploaded" />
                <div style={panel}>
                  {clientFiles.fromMilton.map((f) => (
                    <div key={f.name} className="fx-row" onClick={f.open} role="button" tabIndex={0} style={{ ...rowBase, padding: "13px 16px" }}>
                      <MiltonMark size={40} />
                      <div style={{ flex: 1.4, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{f.name}</div>
                        <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 3 }}>{f.meta}</div>
                      </div>
                      <span style={{ flex: 1, minWidth: 0, fontSize: 12, color: "var(--fg-2)" }}>{f.refs}</span>
                      <button className="btn btn--sm btn--secondary" onClick={f.onShare} style={{ flex: "none" }}>Share</button>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ fontSize: 12.5, color: "var(--fg-3)", lineHeight: 1.6, maxWidth: 620 }}>
                Client app shows these in the conversation as they come through. No file browser on the client side in v1.
              </div>
            </div>
          </div>
        ) : (
          <>
            <div style={{ padding: pagePad, flex: "none" }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
                <div>
                  <div className="eyebrow">{orgName} · 4 coaches</div>
                  <h2 style={{ margin: "3px 0 0", fontSize: 26, letterSpacing: "-.02em" }}>Files</h2>
                </div>
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
                  {!compact && <span style={{ fontSize: 12.5, color: "var(--fg-3)" }}>588 org files · 73 client files</span>}
                  <button className="btn btn--secondary btn--sm" onClick={() => { setConfirmOpen(true); setTray(false); }}>
                    Confirm queue · {pending.length}
                  </button>
                  <button className="btn btn--primary" onClick={() => { setDrop(true); setDetail(null); }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
                    Upload
                  </button>
                  {onClose && (
                    <button className="btn btn--sm btn--ghost" onClick={onClose} aria-label="Close Files" title="Close">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div style={{ padding: compact ? "14px 18px 10px" : "16px 32px 10px", flex: "none", background: "var(--bg-app)", borderBottom: "1px solid var(--ink-200)" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--white)", border: "1px solid var(--ink-200)", borderRadius: 999, padding: "13px 20px", boxShadow: "var(--shadow-sm)" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--teal-700)" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="find the deadlift video I sent Sarah"
                  aria-label="Search files"
                  style={{ flex: 1, minWidth: 0, border: "none", outline: "none", background: "transparent", fontSize: 16, color: "var(--fg-1)" }}
                />
                {!compact && <span style={{ fontSize: 11.5, color: "var(--fg-3)", whiteSpace: "nowrap" }}>filenames · tags · transcripts · PDF text · client names</span>}
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 12, flexWrap: "wrap" }}>
                {TABS.map((t) => {
                  const on = tab === t;
                  return (
                    <button key={t} onClick={goTab(t)} style={{ display: "inline-flex", alignItems: "center", gap: 7, border: `1px solid ${on ? "var(--teal-800)" : "var(--ink-200)"}`, background: on ? "var(--teal-800)" : "var(--white)", color: on ? "var(--white)" : "var(--fg-2)", borderRadius: 999, padding: "8px 15px", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                      {t}<span style={{ fontSize: 11.5, fontWeight: 500, opacity: 0.7 }}>{TAB_COUNTS[t]}</span>
                    </button>
                  );
                })}
                {!compact && <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--fg-3)" }}>{contextNote}</span>}
              </div>
            </div>

            <div style={{ flex: 1, overflow: "auto", padding: bodyPad }}>
              {searching && (
                <div className="fx-fade" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  <div style={{ fontSize: 13, color: "var(--fg-2)" }}>
                    {hits.length} matches for “{query}” — grouped by zone, because which zone is the first thing you need to know.
                  </div>
                  <div>
                    <SectionHead upper title="Library" meta={libResults.length + " in Library"} />
                    <div style={panel}>
                      {libResults.map((f) => <FileRow key={f.name} f={f} second={f.hit} />)}
                    </div>
                  </div>
                  <div>
                    <SectionHead upper title="Clients" meta={clientResults.length + " in client files"} />
                    <div style={panel}>
                      {clientResults.map((f) => <FileRow key={f.name} f={f} second={f.hit} />)}
                    </div>
                  </div>
                </div>
              )}

              {showFolders && (
                <div className="fx-fade">
                  <div style={{ fontSize: 13, color: "var(--fg-2)", paddingBottom: 14, maxWidth: 660 }}>
                    Milton set these up when the org was created. One level deep — folders are for orientation, search is for finding.
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${compact ? 200 : 236}px, 1fr))`, gap: 14 }}>
                    {FOLDERS.map((d) => {
                      const p = permOf(d[3]);
                      return (
                        <button key={d[0]} className="fx-folder" onClick={() => setFolder(d[0])} style={{ textAlign: "left", background: "var(--white)", border: "1px solid var(--ink-200)", borderRadius: "var(--radius-lg)", padding: 18, cursor: "pointer", display: "flex", flexDirection: "column", gap: 12, boxShadow: "var(--shadow-sm)", fontFamily: "inherit", transition: "border-color .12s ease, background .12s ease" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--teal-700)" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M3 7.5A1.5 1.5 0 014.5 6h4l2 2.5h7A1.5 1.5 0 0119 10v7a1.5 1.5 0 01-1.5 1.5h-13A1.5 1.5 0 013 17V7.5z" /></svg>
                            <span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--fg-3)" }}>{d[1]}</span>
                          </div>
                          <div>
                            <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-.01em", color: "var(--fg-1)" }}>{d[0]}</div>
                            <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 4, lineHeight: 1.45 }}>{d[2]}</div>
                          </div>
                          <span style={{ alignSelf: "flex-start", fontSize: 11.5, fontWeight: 600, padding: "5px 10px", borderRadius: 999, background: p.pbg, color: p.pfg }}>{p.perm}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {inFolder && (
                <div className="fx-fade">
                  <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 16, flexWrap: "wrap" }}>
                    <button className="fx-link" onClick={() => setFolder(null)} style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--fg-3)", fontSize: 13, fontWeight: 500 }}>
                      <Chevron /> Library
                    </button>
                    <span style={{ color: "var(--ink-300)" }}>/</span>
                    <span style={{ fontSize: 15, fontWeight: 600 }}>{folder}</span>
                    <span style={{ fontSize: 12.5, color: "var(--fg-3)" }}>{folderFiles.length} files · Milton picked {grid ? "grid" : "list"} for this folder</span>
                    <div style={{ marginLeft: "auto", display: "flex", gap: 6, background: "var(--ink-150)", padding: 3, borderRadius: 999 }}>
                      {[["Grid", grid, () => setGrid(true)], ["List", !grid, () => setGrid(false)]].map(([label, on, fn]) => (
                        <button key={label} onClick={fn} style={{ border: "none", cursor: "pointer", borderRadius: 999, padding: "6px 13px", fontSize: 12.5, fontWeight: 600, fontFamily: "inherit", background: on ? "var(--white)" : "transparent", color: on ? "var(--fg-1)" : "var(--fg-3)" }}>{label}</button>
                      ))}
                    </div>
                  </div>

                  {grid ? (
                    <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${compact ? 210 : 240}px, 1fr))`, gap: 16 }}>
                      {folderFiles.map((f) => (
                        <div key={f.name} className="fx-card" onClick={f.open} role="button" tabIndex={0} style={{ background: "var(--white)", border: "1px solid var(--ink-200)", borderRadius: "var(--radius-lg)", overflow: "hidden", boxShadow: "var(--shadow-sm)", cursor: "pointer" }}>
                          <div style={{ aspectRatio: "16 / 10", background: "var(--ink-150)", display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: 10 }}>
                            <span style={{ fontSize: 10.5, fontWeight: 700, padding: "4px 8px", borderRadius: 6, background: f.kbg, color: f.kfg }}>{f.klabel}</span>
                            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--white)", background: "rgba(11,20,23,.6)", padding: "3px 7px", borderRadius: 6 }}>{f.dur}</span>
                          </div>
                          <div style={{ padding: "12px 13px 13px", display: "flex", flexDirection: "column", gap: 8 }}>
                            <div style={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.35, textWrap: "pretty" }}>{f.name}</div>
                            {showMiltonRead && <span className="status status--dot status--brand" style={{ alignSelf: "flex-start", maxWidth: "100%", ...truncate }}>{f.read}</span>}
                            <div style={{ fontSize: 11.5, color: "var(--fg-2)", ...truncate }}>In: {f.refs}</div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 9px", borderRadius: 999, background: f.pbg, color: f.pfg }}>{f.perm}</span>
                              <button className="btn btn--sm btn--ghost" onClick={f.onShare} style={{ marginLeft: "auto" }}>Share</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={panel}>
                      {folderFiles.map((f) => <FileRow key={f.name} f={f} second={f.meta} mid={f.read} midStatus />)}
                    </div>
                  )}
                </div>
              )}

              {!searching && tab === "Clients" && (
                <div className="fx-fade">
                  <div style={{ fontSize: 13, color: "var(--fg-2)", paddingBottom: 14, maxWidth: 660 }}>
                    A mirror of the roster, not a folder tree. Every client area fills itself — client uploads save straight to the profile.
                  </div>
                  <div style={panel}>
                    {CLIENTS.map((c) => (
                      <div key={c[0]} className="fx-row" onClick={() => setClient(c[0])} role="button" tabIndex={0} style={{ ...rowBase, padding: "14px 16px" }}>
                        <span style={{ width: 42, height: 42, borderRadius: 12, background: c[1], color: "var(--white)", display: "grid", placeItems: "center", fontSize: 14, fontWeight: 600, flex: "none" }}>
                          {c[0].split(" ").map((w) => w[0]).join("")}
                        </span>
                        <div style={{ flex: 1.2, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 14.5, fontWeight: 600 }}>{c[0]}</span>
                            {c[4] > 0 && <span style={{ fontSize: 11, fontWeight: 600, color: "var(--green-800)", background: "var(--green-100)", padding: "3px 8px", borderRadius: 999 }}>{c[4]} new</span>}
                          </div>
                          <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 3 }}>{c[2]}</div>
                        </div>
                        <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, color: "var(--fg-2)", ...(compact ? truncate : null) }}>{c[3]}</span>
                        {!compact && (
                          <span style={{ flex: "none", fontSize: 11.5, fontWeight: 600, padding: "5px 10px", borderRadius: 999, background: "var(--sem-info-bg)", color: "var(--sem-info-fg)" }}>
                            {c[0].split(" ")[0]} + assigned coach
                          </span>
                        )}
                        <button className="btn btn--sm btn--secondary" onClick={() => setClient(c[0])} style={{ flex: "none" }}>Open files</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!searching && tab === "Recent" && (
                <div className="fx-fade">
                  <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 12 }}>
                    <span style={{ fontSize: 13, color: "var(--fg-2)" }}>Last 7 days across both zones.</span>
                    {!compact && <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--fg-3)" }}>Where else it lives · Who can see it · Milton&apos;s read</span>}
                  </div>
                  <div style={panel}>
                    {RECENT.map(mkFile).map((f) => (
                      <FileRow key={f.name} f={f} second={f.meta} mid={f.read} midStatus refsFlex={1.3} permWidth={150} pad={rowPad} />
                    ))}
                  </div>
                </div>
              )}

              {!searching && tab === "Trash" && (
                <div className="fx-fade">
                  <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 12 }}>
                    <span style={{ fontSize: 13, color: "var(--fg-2)" }}>Thirty days, then gone. Permanent delete is Admin-only.</span>
                    <button className="btn btn--sm btn--ghost" style={{ marginLeft: "auto" }}>Empty Trash</button>
                  </div>
                  <div style={panel}>
                    {TRASH.filter((t) => restored.indexOf(t[0]) < 0).map((t) => {
                      const k = kindOf(t[1]);
                      return (
                        <div key={t[0]} style={{ ...rowBase, padding: "14px 16px" }}>
                          <div style={{ width: 44, height: 44, borderRadius: 10, background: k.kbg, color: k.kfg, display: "grid", placeItems: "center", fontSize: 10.5, fontWeight: 700, flex: "none", opacity: 0.7 }}>{k.klabel}</div>
                          <div style={{ flex: 1.4, minWidth: 0 }}>
                            <div style={{ fontSize: 14.5, fontWeight: 600, color: "var(--fg-2)" }}>{t[0]}</div>
                            <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 3 }}>{t[2]}</div>
                          </div>
                          {!tight && <span style={{ flex: 1.6, minWidth: 0, fontSize: 12, fontWeight: 500, padding: "6px 11px", borderRadius: 999, background: "var(--sem-danger-bg)", color: "var(--sem-danger-fg)", ...truncate }}>Breaks: {t[3]}</span>}
                          <button className="btn btn--sm btn--secondary" onClick={() => setRestored(restored.concat([t[0]]))} style={{ flex: "none" }}>Restore</button>
                          {!compact && <button className="btn btn--sm btn--ghost" style={{ flex: "none", color: "var(--sem-danger-fg)" }}>Delete now</button>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* upload tray */}
      {tray && (
        <div className="fx-fade" style={{ position: "absolute", right: 24, bottom: 24, width: compact ? "calc(100% - 36px)" : 380, maxWidth: 380, background: "var(--white)", border: "1px solid var(--ink-200)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-lg)", overflow: "hidden", zIndex: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderBottom: "1px solid var(--ink-150)" }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>12 files uploading · {pending.length} tagged</span>
            <button className="fx-link" onClick={() => setTray(false)} style={{ marginLeft: "auto", color: "var(--fg-3)", fontSize: 13 }}>Close</button>
          </div>
          <div style={{ maxHeight: 230, overflow: "auto" }}>
            {TRAY_ITEMS.map((u) => (
              <div key={u.name} style={{ padding: "11px 16px", borderBottom: "1px solid var(--ink-150)", display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
                  <span style={{ flex: 1, minWidth: 0, color: "var(--fg-2)", ...truncate }}>{u.name}</span>
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: u.fg }}>{u.state}</span>
                </div>
                <div style={{ height: 4, borderRadius: 999, background: "var(--ink-150)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: u.pct, background: "var(--green-600)", borderRadius: 999 }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, background: "var(--ink-050)" }}>
            <span style={{ fontSize: 12, color: "var(--fg-3)", lineHeight: 1.4 }}>Walk away if you want. I&apos;ll keep tagging.</span>
            <button className="btn btn--sm btn--primary" onClick={() => { setConfirmOpen(true); setTray(false); }} style={{ marginLeft: "auto" }}>Review {pending.length}</button>
          </div>
        </div>
      )}

      {/* confirm queue */}
      {confirmOpen && (
        <div className="fx-fade" style={{ position: "absolute", inset: 0, background: "rgba(11,20,23,.42)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: compact ? "24px 12px" : "48px 24px", zIndex: 50, overflow: "auto" }}>
          <div style={{ width: "100%", maxWidth: 940, background: "var(--bg-app)", borderRadius: 18, overflow: "hidden", boxShadow: "var(--shadow-lg)" }}>
            <div style={{ background: "var(--white)", padding: "20px 24px", borderBottom: "1px solid var(--ink-200)", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <MiltonMark />
              <div>
                <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-.01em" }}>{pending.length ? pending.length + " uploads waiting on you" : "Nothing waiting"}</div>
                <div style={{ fontSize: 12.5, color: "var(--fg-3)", marginTop: 2 }}>I named, matched and tagged each one. Confirm publishes to the Exercise Library.</div>
              </div>
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
                {cleanIds.length > 0 && (
                  <button className="btn btn--primary btn--sm" onClick={() => setDone(done.concat(cleanIds))}>Confirm all clean matches · {cleanIds.length}</button>
                )}
                <button className="fx-link" onClick={() => setConfirmOpen(false)} style={{ color: "var(--fg-3)", fontSize: 13 }}>Close</button>
              </div>
            </div>

            <div style={{ padding: "20px 24px 28px", display: "flex", flexDirection: "column", gap: 14 }}>
              {pending.map((c) => {
                const name = names[c.id] !== undefined ? names[c.id] : c.name;
                const resolved = dup[c.id];
                const tone = c.kind === "dup"
                  ? { tagLabel: "Duplicate", tagBg: "var(--sem-warn-bg)", tagFg: "var(--sem-warn-fg)", accent: "var(--accent-amber-500)", bd: "var(--accent-amber-200)", stateNote: "Held out of batch confirm" }
                  : c.kind === "ambiguous"
                  ? { tagLabel: "Needs you", tagBg: "var(--sem-danger-bg)", tagFg: "var(--sem-danger-fg)", accent: "var(--accent-red-500)", bd: "var(--accent-red-200)", stateNote: c.note }
                  : { tagLabel: "Clean match", tagBg: "var(--sem-brand-bg)", tagFg: "var(--sem-brand-fg)", accent: "var(--accent-amber-500)", bd: "var(--ink-200)", stateNote: "Milton named and tagged it" };
                const resolvedNote = resolved === "replace" ? "Replacing. Old file moves to Trash for 30 days, 3 references repoint."
                  : resolved === "variation" ? "Filed as a variation of Front Squat (Tempo). New file set as primary."
                  : resolved === "both" ? "Keeping both. Two entries in the Exercise Library." : "";

                return (
                  <div key={c.id} style={{ background: "var(--white)", border: `1px solid ${tone.bd}`, borderLeft: `4px solid ${tone.accent}`, borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
                    <div style={{ display: "flex", gap: 16, padding: "16px 18px", flexWrap: compact ? "wrap" : "nowrap" }}>
                      <div style={{ width: 168, flex: "none" }}>
                        <div style={{ aspectRatio: "16 / 10", background: "var(--ink-150)", borderRadius: 10, display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: 8 }}>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 7px", borderRadius: 5, background: "var(--accent-blue-100)", color: "var(--accent-blue-500)" }}>MOV</span>
                          <span style={{ fontSize: 10.5, fontWeight: 600, color: "var(--white)", background: "rgba(11,20,23,.6)", padding: "2px 6px", borderRadius: 5 }}>{c.dur}</span>
                        </div>
                        <div style={{ height: 4, borderRadius: 999, background: "var(--ink-200)", marginTop: 7, position: "relative" }}>
                          <span style={{ position: "absolute", left: "34%", top: -3, width: 10, height: 10, borderRadius: "50%", background: "var(--teal-800)" }} />
                        </div>
                        <div style={{ fontSize: 11, color: "var(--fg-3)", marginTop: 7 }}>{c.file}</div>
                      </div>

                      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 999, background: tone.tagBg, color: tone.tagFg }}>{tone.tagLabel}</span>
                          <span style={{ fontSize: 12, color: "var(--fg-3)" }}>{tone.stateNote}</span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "96px 1fr", gap: "8px 14px", alignItems: "center" }}>
                          <span style={{ fontSize: 12, color: "var(--fg-3)" }}>Name</span>
                          <input
                            value={name}
                            onChange={(e) => setNames({ ...names, [c.id]: e.target.value })}
                            placeholder="Name this movement"
                            aria-label="File name"
                            style={{ border: "1px solid var(--ink-200)", borderRadius: 9, padding: "8px 11px", fontSize: 14, fontWeight: 600, color: "var(--fg-1)", background: "var(--white)", outline: "none", minWidth: 0 }}
                          />
                          <span style={{ fontSize: 12, color: "var(--fg-3)" }}>Matched</span>
                          <span style={{ fontSize: 13, color: "var(--fg-2)" }}>{c.match}</span>
                          <span style={{ fontSize: 12, color: "var(--fg-3)" }}>Tags</span>
                          <span style={{ fontSize: 13, color: "var(--fg-2)" }}>{c.tags}</span>
                          <span style={{ fontSize: 12, color: "var(--fg-3)" }}>Destination</span>
                          <span style={{ fontSize: 13, color: "var(--fg-2)" }}>{c.dest}</span>
                        </div>

                        {c.kind === "dup" && (
                          <div style={{ background: "var(--sem-warn-bg)", borderRadius: 12, padding: 14, marginTop: 2 }}>
                            <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--sem-warn-fg)" }}>Already in the Exercise Library</div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 10 }}>
                              {[["New", name, c.newMeta], ["In library", c.dupName, c.dupMeta]].map(([label, title, meta]) => (
                                <div key={label} style={{ background: "var(--white)", borderRadius: 10, padding: 11 }}>
                                  <div style={{ fontSize: 11, fontWeight: 600, color: "var(--fg-3)", textTransform: "uppercase", letterSpacing: ".06em" }}>{label}</div>
                                  <div style={{ aspectRatio: "16 / 9", background: "var(--ink-150)", borderRadius: 8, margin: "8px 0" }} />
                                  <div style={{ fontSize: 12.5, fontWeight: 600 }}>{title}</div>
                                  <div style={{ fontSize: 11.5, color: "var(--fg-3)", marginTop: 3 }}>{meta}</div>
                                </div>
                              ))}
                            </div>
                            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                              <button className="btn btn--sm btn--secondary" onClick={() => setDup({ ...dup, [c.id]: "replace" })}>Replace · old to Trash 30 days</button>
                              <button className="btn btn--sm btn--secondary" onClick={() => setDup({ ...dup, [c.id]: "variation" })}>Add as variation</button>
                              <button className="btn btn--sm btn--secondary" onClick={() => setDup({ ...dup, [c.id]: "both" })}>Keep both separate</button>
                            </div>
                            {resolved && <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--green-800)", marginTop: 10 }}>{resolvedNote}</div>}
                          </div>
                        )}
                      </div>

                      <div style={{ flex: "none", display: "flex", flexDirection: "column", gap: 8, width: 118 }}>
                        <button className="btn btn--sm btn--primary btn--block" onClick={() => setDone(done.concat([c.id]))}>Confirm</button>
                        <button className="btn btn--sm btn--secondary btn--block">Edit</button>
                        <button className="btn btn--sm btn--ghost btn--block" style={{ fontSize: 12 }}>Discard</button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {pending.length === 0 && (
                <div style={{ ...panel, padding: 36, textAlign: "center" }}>
                  <div style={{ display: "flex", justifyContent: "center" }}><MiltonMark size={44} radius={13} /></div>
                  <div style={{ fontSize: 17, fontWeight: 600, marginTop: 12 }}>Queue&apos;s clear.</div>
                  <div style={{ fontSize: 13, color: "var(--fg-2)", marginTop: 6 }}>Everything you confirmed is live in the Exercise Library and searchable by transcript.</div>
                  <button className="btn btn--primary btn--sm" onClick={() => setConfirmOpen(false)} style={{ marginTop: 16 }}>Back to Files</button>
                </div>
              )}

              <div style={{ fontSize: 12, color: "var(--fg-3)", textAlign: "center", paddingTop: 4 }}>
                Duplicates are held out of batch confirm. Nothing is destroyed unless you choose it — Replace is recoverable for 30 days.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* share */}
      {share && (
        <div className="fx-fade" style={{ position: "absolute", inset: 0, background: "rgba(11,20,23,.42)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60, padding: 24 }}>
          <div style={{ width: "100%", maxWidth: 460, background: "var(--white)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-lg)", overflow: "hidden" }}>
            <div style={{ padding: "18px 20px", borderBottom: "1px solid var(--ink-150)" }}>
              <div style={{ fontSize: 16, fontWeight: 600 }}>Share</div>
              <div style={{ fontSize: 12.5, color: "var(--fg-3)", marginTop: 3, ...truncate }}>{share.name}</div>
            </div>
            <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--fg-3)", textTransform: "uppercase", letterSpacing: ".06em", paddingBottom: 8 }}>Send to</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {SHARE_TARGETS.map((t) => {
                    const on = shareTarget === t;
                    return (
                      <button key={t} onClick={() => setShareTarget(t)} style={{ border: `1px solid ${on ? "var(--teal-400)" : "var(--ink-200)"}`, background: on ? "var(--teal-100)" : "var(--white)", color: on ? "var(--teal-800)" : "var(--fg-2)", borderRadius: 999, padding: "7px 13px", fontSize: 12.5, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>{t}</button>
                    );
                  })}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--fg-3)", textTransform: "uppercase", letterSpacing: ".06em", paddingBottom: 8 }}>Who can see it now</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {[
                    ["Owner / Admin", "Full"],
                    ["Coach", "View, upload"],
                    ["Staff", "View"],
                    ["Client", share.owner ? "Own files only" : "None until shared"],
                  ].map(([role, access]) => (
                    <div key={role} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", background: "var(--ink-050)", borderRadius: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{role}</span>
                      <span style={{ fontSize: 12, color: "var(--fg-3)" }}>{access}</span>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 11.5, color: "var(--fg-3)", marginTop: 8, lineHeight: 1.5 }}>Role defaults. Per-item override is the exception, not the workflow.</div>
              </div>
              {share.owner && (
                <div className="quote quote--amber" style={{ fontSize: 12.5 }}>
                  This file came from {String(share.owner).split(",")[0]}&apos;s profile. Sharing it puts a client&apos;s own upload in front of someone else. Confirm you mean to.
                </div>
              )}
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button className="btn btn--sm btn--ghost" onClick={() => setShare(null)}>Cancel</button>
                <button className="btn btn--sm btn--primary" onClick={() => setShare(null)}>Share with {shareTarget}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* drop zone */}
      {drop && (
        <div className="fx-fade" style={{ position: "absolute", inset: 0, background: "rgba(14,93,112,.14)", zIndex: 45, display: "flex", alignItems: "center", justifyContent: "center", padding: compact ? 24 : 60 }}>
          <div style={{ flex: 1, height: "100%", border: "2px dashed var(--teal-500)", borderRadius: 20, background: "rgba(255,255,255,.86)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: 20, textAlign: "center" }}>
            <MiltonMark size={52} radius={16} />
            <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-.01em" }}>Drop anywhere in Files</div>
            <div style={{ fontSize: 13.5, color: "var(--fg-2)", maxWidth: 420, lineHeight: 1.55 }}>
              200 exercise videos at once is a normal Tuesday. I&apos;ll name, tag and match each one, then hold them for your confirmation.
            </div>
            <button className="btn btn--primary" onClick={() => { setDrop(false); setTray(true); }} style={{ marginTop: 8 }}>Simulate dropping 12 videos</button>
            <button className="fx-link" onClick={() => setDrop(false)} style={{ color: "var(--fg-3)", fontSize: 12.5 }}>Cancel</button>
          </div>
        </div>
      )}

      {/* detail drawer */}
      {detail && (
        <div className="fx-slide" style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: tight ? "100%" : 440, background: "var(--white)", borderLeft: "1px solid var(--ink-200)", boxShadow: "var(--shadow-lg)", zIndex: 44, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "18px 20px", borderBottom: "1px solid var(--ink-150)" }}>
            <KindTile f={detail} size={40} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.35, textWrap: "pretty" }}>{detail.name}</div>
              <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 3 }}>{detail.meta}</div>
            </div>
            <button className="fx-link" onClick={() => setDetail(null)} style={{ color: "var(--fg-3)", fontSize: 13, flex: "none" }}>Close</button>
          </div>

          <div style={{ flex: 1, overflow: "auto", padding: "18px 20px", display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <div style={{ aspectRatio: "16 / 10", background: "var(--ink-150)", borderRadius: 12, display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: 10 }}>
                <span style={{ fontSize: 10.5, fontWeight: 700, padding: "4px 8px", borderRadius: 6, background: detail.kbg, color: detail.kfg }}>{detail.klabel}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--white)", background: "rgba(11,20,23,.6)", padding: "3px 7px", borderRadius: 6 }}>{detail.dur}</span>
              </div>
              <div style={{ height: 4, borderRadius: 999, background: "var(--ink-200)", marginTop: 9, position: "relative" }}>
                <span style={{ position: "absolute", left: "28%", top: -3, width: 10, height: 10, borderRadius: "50%", background: "var(--teal-800)" }} />
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase", color: "var(--fg-3)", paddingBottom: 8 }}>Milton&apos;s read</div>
              <span className="status status--dot status--brand">{detail.read}</span>
              <div className="quote" style={{ fontSize: 12.5, marginTop: 10 }}>{SNIP[detail.kindKey] || SNIP.pdf}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                {(TAGS[detail.kindKey] || TAGS.pdf).map((t) => (
                  <span key={t} style={{ fontSize: 11.5, fontWeight: 500, padding: "5px 10px", borderRadius: 999, background: "var(--ink-100)", color: "var(--fg-2)" }}>{t}</span>
                ))}
              </div>
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 8 }}>
                <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase", color: "var(--fg-3)" }}>Where else it lives</span>
                <span style={{ fontSize: 11.5, color: "var(--fg-3)", marginLeft: "auto" }}>{refCount}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {detailRefs.map((r) => (
                  <div key={r} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "var(--ink-050)", border: "1px solid var(--ink-150)", borderRadius: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, flex: 1, minWidth: 0, ...truncate }}>{r}</span>
                    <button className="fx-link fx-remove" onClick={() => setRemoved(removed.concat([r]))} style={{ color: "var(--fg-3)", fontSize: 12, fontWeight: 600, flex: "none" }}>Remove</button>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 11.5, color: "var(--fg-3)", marginTop: 8, lineHeight: 1.5 }}>
                Remove takes the file out of that one location. One file object — the file itself stays put.
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase", color: "var(--fg-3)", paddingBottom: 8 }}>Who can see it</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 600, padding: "6px 11px", borderRadius: 999, background: detail.pbg, color: detail.pfg }}>{detail.perm}</span>
                <button className="btn btn--sm btn--ghost" onClick={detail.onShare} style={{ marginLeft: "auto" }}>Manage access</button>
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase", color: "var(--fg-3)", paddingBottom: 8 }}>Activity</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {[
                  "You uploaded it · " + (String(detail.meta).split(" · ").pop() || "recently"),
                  "Milton named it, tagged it and matched the movement",
                  "Referenced in " + refCount + " — removing one leaves the file intact",
                ].map((a) => (
                  <div key={a} style={{ display: "flex", gap: 10, fontSize: 12.5, color: "var(--fg-2)" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--teal-400)", flex: "none", marginTop: 6 }} />
                    <span style={{ flex: 1 }}>{a}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ padding: "14px 20px", borderTop: "1px solid var(--ink-150)", display: "flex", gap: 8, alignItems: "center" }}>
            <button className="btn btn--sm btn--primary" onClick={detail.onShare}>Share</button>
            <button className="btn btn--sm btn--secondary">Download</button>
            <button className="btn btn--sm btn--ghost" style={{ marginLeft: "auto", color: "var(--sem-danger-fg)" }}>Move to Trash</button>
          </div>
        </div>
      )}
    </div>
  );
}
