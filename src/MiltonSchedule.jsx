"use client";

/**
 * Milton scheduling workspace — services-first model.
 *
 * Rebuilt as native React (previously a stringified HTML app inside an iframe)
 * so the new product model is maintainable and fully interactive. The Milton
 * visual language is preserved exactly: teal #116276, hairline #dce6e6 borders,
 * rounded white cards, Inter typography, pill buttons, soft shadows.
 *
 * Three concepts, kept separate:
 *   1. Service / Class  — a reusable bookable offering (Personal Training, Semi Group).
 *   2. Schedule         — when that offering can be booked each week.
 *   3. Session          — a specific dated occurrence, created when a member books.
 *
 * Publishing a service immediately makes its times bookable in the member
 * booking preview / public link. A session only appears in Upcoming Sessions
 * once somebody books it; multiple bookings of the same date+time increment the
 * same occurrence rather than creating duplicate rows.
 *
 * Prototype boundary: in-memory sample data resets on reload. No live database,
 * payments, messaging, or real public link.
 */

import React, { useMemo, useState } from "react";

/* ------------------------------------------------------------------ tokens */

const STYLES = `
.ms-root{--teal:#116276;--teal-dark:#0d4f5c;--line:#dce6e6;--muted:#637e7e;--ink:#223135;--bg:#f5f7f7;--card:#ffffff;
  font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
  color:var(--ink);background:var(--bg);height:100%;display:flex;flex-direction:column;min-height:0;font-size:16px;box-sizing:border-box;}
.ms-root *{box-sizing:border-box;}
.ms-root button,.ms-root input,.ms-root select{font:inherit;}
.ms-root button{cursor:pointer;}
.ms-head{padding:20px 26px 0;background:var(--card);border-bottom:1px solid var(--line);flex:0 0 auto;}
.ms-eyebrow{font-size:11px;letter-spacing:1.4px;font-weight:750;color:var(--muted);text-transform:uppercase;}
.ms-h1{font-size:25px;letter-spacing:-.6px;margin:4px 0 0;font-weight:750;}
.ms-headrow{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap;}
.ms-tabs{display:flex;gap:24px;margin-top:16px;overflow:auto;}
.ms-tab{background:none;border:0;padding:12px 0;font-size:14px;color:var(--muted);border-bottom:3px solid transparent;white-space:nowrap;font-weight:600;}
.ms-tab:hover{color:var(--teal);}
.ms-tab.active{color:var(--teal);border-bottom-color:var(--teal);font-weight:750;}
.ms-tab b{display:inline-block;background:#edf3f2;color:#507a76;font-size:12px;margin-left:6px;border-radius:20px;padding:2px 7px;font-weight:700;}
.ms-page{overflow:auto;flex:1 1 0;padding:26px;min-height:0;}
.ms-pagehead{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:18px;flex-wrap:wrap;}
.ms-pagehead h2{margin:0;font-size:20px;letter-spacing:-.3px;}
.ms-sub{color:var(--muted);font-size:14px;line-height:1.5;margin:5px 0 0;max-width:560px;}
.ms-btn{border:1px solid var(--line);border-radius:24px;background:var(--card);color:#25494b;padding:10px 16px;font-size:14px;font-weight:650;}
.ms-btn:hover{background:#eef6f3;border-color:#abc9c1;}
.ms-btn.primary{background:var(--teal);border-color:var(--teal);color:#fff;}
.ms-btn.primary:hover{background:var(--teal-dark);}
.ms-btn.ghost{border-color:transparent;background:none;color:var(--teal);}
.ms-btn.ghost:hover{background:#eef6f3;}
.ms-btn.small{padding:6px 11px;font-size:13px;}
.ms-btn.danger{color:#b53630;border-color:transparent;background:none;}
.ms-btn.danger:hover{background:#fdeeed;}
.ms-btn:disabled{opacity:.5;cursor:not-allowed;}
.ms-card{background:var(--card);border:1px solid var(--line);border-radius:18px;box-shadow:0 3px 10px rgba(38,66,65,.05);overflow:hidden;}
.ms-srow{display:flex;align-items:center;gap:14px;padding:18px 20px;border:0;width:100%;background:none;text-align:left;border-bottom:1px solid var(--line);}
.ms-srow:last-child{border-bottom:0;}
.ms-srow:hover{background:#f4f9f7;}
.ms-srow .ms-icon{width:40px;height:40px;border-radius:12px;display:grid;place-items:center;flex:0 0 auto;background:#e6f2ee;color:var(--teal);}
.ms-srow .ms-body{flex:1 1 0;min-width:0;}
.ms-srow .ms-name{font-size:16px;font-weight:700;margin:0 0 3px;}
.ms-srow .ms-meta{font-size:13px;color:var(--muted);}
.ms-chip{font-size:12px;font-weight:700;border-radius:20px;padding:4px 10px;white-space:nowrap;}
.ms-chip.pub{background:#e2f4ec;color:#1c7a5b;}
.ms-chip.draft{background:#eef1f2;color:#61757a;}
.ms-chev{color:#9db3b3;flex:0 0 auto;}
.ms-empty{text-align:center;padding:46px 20px;color:var(--muted);}
.ms-empty svg{color:#bcd0cd;margin-bottom:10px;}

/* upcoming session rows */
.ms-usrow{display:flex;align-items:center;gap:14px;padding:16px 20px;border-bottom:1px solid var(--line);flex-wrap:wrap;}
.ms-usrow:last-child{border-bottom:0;}
.ms-usrow .ms-body{flex:1 1 200px;min-width:0;}
.ms-usrow .ms-name{font-size:15px;font-weight:700;margin:0 0 3px;}
.ms-usrow .ms-when{font-size:13px;color:var(--muted);}
.ms-count{font-size:13px;font-weight:700;color:#25494b;white-space:nowrap;}
.ms-count.full{color:#b06a12;}
.ms-roster{padding:0 20px 16px;margin-top:-4px;font-size:13px;color:var(--muted);}
.ms-roster .ms-rlist{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;}
.ms-pill{background:#eef3f2;border-radius:20px;padding:4px 10px;font-size:12px;color:#4a625f;}

/* inline coach select */
.ms-coach{border:1px solid transparent;background:transparent;color:var(--teal);font-weight:700;padding:5px 8px;font-size:13px;border-radius:8px;cursor:pointer;-webkit-appearance:none;appearance:none;}
.ms-coach:hover,.ms-coach:focus{border-color:var(--line);background:#eef6f3;}
.ms-coach.unassigned{color:#8a9a9c;font-weight:600;}

/* modal */
.ms-overlay{position:absolute;inset:0;background:rgba(11,41,43,.55);display:flex;align-items:center;justify-content:center;padding:16px;z-index:40;}
.ms-modal{background:var(--card);border-radius:18px;box-shadow:0 24px 90px rgba(21,59,57,.4);width:min(860px,100%);max-height:92%;display:flex;flex-direction:column;overflow:hidden;}
.ms-modal.narrow{width:min(520px,100%);}
.ms-mhead{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:20px 24px 16px;border-bottom:1px solid var(--line);flex:0 0 auto;}
.ms-mhead h2{margin:2px 0 0;font-size:21px;letter-spacing:-.3px;}
.ms-mhead .x{border:0;background:none;font-size:26px;line-height:1;color:#8598a0;padding:0 2px;}
.ms-mbody{padding:20px 24px;overflow:auto;flex:1 1 auto;min-height:0;}
.ms-mfoot{display:flex;gap:10px;justify-content:space-between;align-items:center;padding:14px 24px;border-top:1px solid var(--line);flex:0 0 auto;background:var(--card);flex-wrap:wrap;}
.ms-mfoot .ms-right{display:flex;gap:10px;margin-left:auto;}

/* form */
.ms-field{display:flex;flex-direction:column;gap:7px;font-size:13px;font-weight:650;color:#3a5250;margin-bottom:16px;}
.ms-field>input,.ms-field>select{padding:11px 12px;border:1px solid #ccdbd6;border-radius:10px;font-size:15px;font-weight:400;color:#23413f;background:#fff;width:100%;}
.ms-grid2{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
.ms-segrow{display:flex;gap:8px;flex-wrap:wrap;}
.ms-seg{border:1px solid var(--line);background:#fff;border-radius:24px;padding:9px 15px;font-size:14px;font-weight:650;color:#4a625f;}
.ms-seg.active{background:#e3f2ec;border-color:#5db8a0;color:var(--teal);}
.ms-preset{border:1px solid var(--line);background:#fff;border-radius:20px;padding:7px 13px;font-size:13px;font-weight:600;color:#4a625f;}
.ms-preset.active{background:#e3f2ec;border-color:#5db8a0;color:var(--teal);}
.ms-sec{border-top:1px solid var(--line);margin-top:22px;padding-top:20px;}
.ms-sec h3{margin:0 0 4px;font-size:16px;}
.ms-note{font-size:13px;background:#eef5f1;border-radius:10px;padding:11px 13px;color:#4f6d64;line-height:1.5;}

/* schedule editor */
.ms-day{border:1px solid var(--line);border-radius:14px;margin-bottom:12px;overflow:hidden;}
.ms-dayhead{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:12px 14px;background:#f7faf9;border-bottom:1px solid var(--line);}
.ms-dayhead .ms-dn{font-size:14px;font-weight:700;}
.ms-dayhead .ms-dc{font-size:12px;color:var(--muted);}
.ms-daybody{padding:12px 14px;display:flex;flex-direction:column;gap:9px;}
.ms-tline{display:flex;align-items:center;gap:9px;flex-wrap:wrap;}
.ms-tline input[type=checkbox]{width:17px;height:17px;accent-color:var(--teal);flex:0 0 auto;}
.ms-tf{position:relative;}
.ms-tf input{width:96px;padding:9px 10px;border:1px solid #ccdbd6;border-radius:9px;font-size:14px;text-align:center;color:#23413f;background:#fff;}
.ms-tf input:focus{outline:3px solid #42b9aa;outline-offset:1px;}
.ms-dash{color:var(--muted);}
.ms-x{border:1px solid var(--line);background:#fff;border-radius:9px;width:32px;height:32px;color:#8598a0;font-size:16px;flex:0 0 auto;}
.ms-x:hover{background:#fdeeed;color:#b53630;border-color:#e8c4c1;}
.ms-copybar{margin-top:6px;border-top:1px dashed var(--line);padding-top:10px;}
.ms-copyto{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-top:8px;}
.ms-copyto .ms-dchip{border:1px solid var(--line);background:#fff;border-radius:20px;padding:5px 11px;font-size:12px;font-weight:600;color:#4a625f;}
.ms-copyto .ms-dchip.on{background:#e3f2ec;border-color:#5db8a0;color:var(--teal);}
.ms-bulk{display:flex;gap:8px;flex-wrap:wrap;align-items:center;background:#f2f7f5;border:1px solid var(--line);border-radius:12px;padding:11px 13px;margin-bottom:14px;font-size:13px;font-weight:650;color:#3a5250;}
.ms-bulk select{padding:8px 10px;border:1px solid #ccdbd6;border-radius:9px;font-size:13px;background:#fff;color:#23413f;}

/* booking preview */
.ms-bwrap{max-width:560px;}
.ms-steps{display:flex;gap:14px;flex-wrap:wrap;font-size:13px;color:#9db1b3;margin-bottom:20px;}
.ms-steps .on{color:var(--teal);font-weight:750;}
.ms-opt{border:1px solid var(--line);border-radius:16px;background:#fff;padding:16px 18px;text-align:left;width:100%;margin-bottom:10px;display:flex;align-items:center;justify-content:space-between;gap:12px;}
.ms-opt:hover{background:#f4f9f7;border-color:#abc9c1;}
.ms-opt strong{display:block;font-size:16px;margin-bottom:3px;}
.ms-opt small{color:var(--muted);font-size:13px;}
.ms-times{display:flex;gap:10px;flex-wrap:wrap;}
.ms-time{border:1px solid var(--line);border-radius:12px;background:#fff;padding:12px 16px;font-size:14px;font-weight:650;color:#25494b;display:flex;flex-direction:column;gap:2px;align-items:flex-start;}
.ms-time:hover{background:#eef6f3;border-color:#abc9c1;}
.ms-time small{font-weight:500;color:var(--muted);font-size:12px;}
.ms-time:disabled{opacity:.55;}
.ms-time.full{background:#f6f7f7;}
.ms-confirm{background:#e3f2ec;border-radius:16px;padding:22px;text-align:center;color:#1c5a48;}
.ms-confirm h3{margin:0 0 6px;font-size:19px;color:#16493a;}
.ms-back{background:none;border:0;color:var(--teal);font-weight:650;font-size:13px;padding:0;margin-bottom:14px;}

/* toast */
.ms-toast{position:absolute;bottom:22px;left:50%;transform:translateX(-50%);background:#113f38;color:#fff;border-radius:12px;padding:12px 18px;font-size:14px;z-index:60;box-shadow:0 10px 30px rgba(17,63,56,.35);max-width:90%;}

@media (max-width:680px){
  .ms-grid2{grid-template-columns:1fr;}
  .ms-page{padding:18px 14px;}
  .ms-head{padding:16px 16px 0;}
  .ms-overlay{padding:0;align-items:stretch;}
  .ms-modal,.ms-modal.narrow{width:100%;max-height:100%;height:100%;border-radius:0;}
}
`;

/* ------------------------------------------------------------------ data */

const COACHES = ["Miguel Johnson", "Sarah Lin", "Jim Alvarez", "Hayden Guzinski"];
const MEMBERS = ["Jordan Miller", "Alicia King", "Taylor Smith", "Brandon Lee", "Morgan Davis", "Casey Wilson", "Priya Nair", "Devon Brooks"];
const DAYS = [["Mon", "Monday"], ["Tue", "Tuesday"], ["Wed", "Wednesday"], ["Thu", "Thursday"], ["Fri", "Friday"], ["Sat", "Saturday"], ["Sun", "Sunday"]];
const DOW_KEYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DURATION_PRESETS = [30, 45, 60, 90];
const DEFAULT_WINDOW = { start: 360, end: 1200 }; // 6:00 AM – 8:00 PM

let SEQ = 0;
const uid = (p = "id") => `${p}-${Date.now().toString(36)}-${++SEQ}`;

const fmt = (min) => {
  const h = Math.floor(min / 60), m = min % 60;
  const ap = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ap}`;
};

function parseTime(input) {
  if (input == null) return null;
  let s = String(input).trim().toLowerCase().replace(/\s+/g, " ");
  if (!s) return null;
  let ap = null;
  if (s.endsWith("am")) { ap = "am"; s = s.slice(0, -2).trim(); }
  else if (s.endsWith("pm")) { ap = "pm"; s = s.slice(0, -2).trim(); }
  else if (s.endsWith("a")) { ap = "am"; s = s.slice(0, -1).trim(); }
  else if (s.endsWith("p")) { ap = "pm"; s = s.slice(0, -1).trim(); }
  let h, m;
  if (s.includes(":")) { const [hh, mm] = s.split(":"); h = parseInt(hh, 10); m = parseInt(mm, 10); }
  else { h = parseInt(s, 10); m = 0; }
  if (Number.isNaN(h) || Number.isNaN(m) || m < 0 || m > 59) return null;
  if (ap) { if (h < 1 || h > 12) return null; if (ap === "pm" && h !== 12) h += 12; if (ap === "am" && h === 12) h = 0; }
  else if (h < 0 || h > 23) return null;
  return h * 60 + m;
}

const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const todayYmd = () => ymd(new Date());
const dowOf = (dateStr) => new Date(dateStr + "T12:00:00").getDay();
const dateLabel = (dateStr, opts = { weekday: "long", month: "short", day: "numeric" }) =>
  new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", opts);

function nextDateFor(dowKey) {
  const target = DOW_KEYS.indexOf(dowKey);
  const d = new Date(); d.setHours(12, 0, 0, 0);
  for (let i = 0; i < 7; i++) { if (d.getDay() === target) return ymd(d); d.setDate(d.getDate() + 1); }
  return todayYmd();
}

function emptyByDay(val) {
  const o = {};
  DAYS.forEach(([k]) => { o[k] = typeof val === "function" ? val() : (Array.isArray(val) ? [] : val); });
  return o;
}

function weeklyTimeCount(service) {
  if (service.type !== "group") return 0;
  return DAYS.reduce((n, [k]) => n + (service.times[k] ? service.times[k].length : 0), 0);
}

function serviceMeta(service) {
  if (service.type === "group") {
    const n = weeklyTimeCount(service);
    return `${service.duration} min · ${service.capacity} spots · ${n} weekly time${n === 1 ? "" : "s"}`;
  }
  if (service.type === "space") {
    return `${service.duration} min · capacity ${service.capacity} · availability windows`;
  }
  return `${service.duration} min · 1:1 · ${service.coach || "coach TBD"}`;
}

function getWindows(service, dayKey) {
  if (service.useDefaultHours) return [DEFAULT_WINDOW];
  return service.availability[dayKey] || [];
}

function seedServices() {
  const semiTimes = emptyByDay([]);
  const pattern = [
    [420, "Sarah Lin"], [480, "Miguel Johnson"], [540, "Miguel Johnson"], [1020, "Jim Alvarez"], [1080, "Jim Alvarez"],
  ];
  ["Mon", "Tue", "Thu", "Fri"].forEach((k) => { semiTimes[k] = pattern.map(([t, c]) => ({ id: uid("t"), time: t, coach: c })); });
  semiTimes["Wed"] = [{ id: uid("t"), time: 420, coach: "" }, { id: uid("t"), time: 480, coach: "Sarah Lin" }];

  const ptAvail = emptyByDay([]);
  ptAvail["Mon"] = [{ start: 540, end: 720 }, { start: 1020, end: 1200 }];
  ptAvail["Tue"] = [{ start: 420, end: 600 }, { start: 1080, end: 1260 }];
  ptAvail["Wed"] = [{ start: 540, end: 720 }];
  ptAvail["Thu"] = [{ start: 420, end: 600 }, { start: 1080, end: 1260 }];
  ptAvail["Fri"] = [{ start: 540, end: 780 }];

  return [
    {
      id: uid("svc"), name: "Semi Group", type: "group", duration: 60, capacity: 6, coach: "",
      status: "published", useDefaultHours: false, availability: emptyByDay([]), times: semiTimes,
    },
    {
      id: uid("svc"), name: "Personal Training", type: "individual", duration: 60, capacity: 1, coach: "Miguel Johnson",
      status: "published", useDefaultHours: false, availability: ptAvail, times: emptyByDay([]),
    },
    {
      id: uid("svc"), name: "Open Gym", type: "space", duration: 60, capacity: 12, coach: "",
      status: "draft", useDefaultHours: true, availability: emptyByDay([]), times: emptyByDay([]),
    },
  ];
}

function seedSessions(services) {
  const semi = services[0], pt = services[1];
  return [
    { id: uid("ses"), serviceId: semi.id, serviceName: semi.name, type: "group", date: nextDateFor("Fri"), time: 540, coach: "Miguel Johnson", capacity: 6, members: ["Jordan Miller"] },
    { id: uid("ses"), serviceId: semi.id, serviceName: semi.name, type: "group", date: nextDateFor("Fri"), time: 420, coach: "Sarah Lin", capacity: 6, members: ["Alicia King", "Brandon Lee", "Morgan Davis"] },
    { id: uid("ses"), serviceId: pt.id, serviceName: pt.name, type: "individual", date: nextDateFor("Mon"), time: 540, coach: "Miguel Johnson", capacity: 1, members: ["Taylor Smith"] },
  ];
}

/* ------------------------------------------------------------------ small UI */

function Chevron() {
  return (
    <svg className="ms-chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
  );
}

function TimeField({ value, onChange, ariaLabel }) {
  const [raw, setRaw] = useState(fmt(value));
  const [editing, setEditing] = useState(false);
  const display = editing ? raw : fmt(value);
  return (
    <span className="ms-tf">
      <input
        aria-label={ariaLabel}
        value={display}
        onFocus={() => { setEditing(true); setRaw(fmt(value)); }}
        onChange={(e) => setRaw(e.target.value)}
        onBlur={() => { const p = parseTime(raw); if (p != null) onChange(p); setEditing(false); }}
        onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
      />
    </span>
  );
}

function CoachSelect({ value, onChange, ariaLabel, className = "ms-coach" }) {
  return (
    <select
      className={className + (value ? "" : " unassigned")}
      aria-label={ariaLabel}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      onClick={(e) => e.stopPropagation()}
    >
      <option value="">Unassigned</option>
      {COACHES.map((c) => <option key={c} value={c}>{c}</option>)}
    </select>
  );
}

/* ------------------------------------------------------------------ service editor */

function ServiceEditor({ initial, onCancel, onSave }) {
  const [draft, setDraft] = useState(() => JSON.parse(JSON.stringify(initial)));
  const [copyFrom, setCopyFrom] = useState(null); // day key showing copy panel
  const [copyTargets, setCopyTargets] = useState([]);
  const [bulkCoach, setBulkCoach] = useState(COACHES[0]);
  const [bulkTime, setBulkTime] = useState("");
  const [selected, setSelected] = useState({}); // timeId -> bool

  const set = (patch) => setDraft((d) => ({ ...d, ...patch }));

  /* group time helpers */
  const setTimes = (dayKey, list) => setDraft((d) => ({ ...d, times: { ...d.times, [dayKey]: list } }));
  const addTime = (dayKey) => {
    const existing = draft.times[dayKey] || [];
    const last = existing.length ? existing[existing.length - 1].time + 60 : 420;
    setTimes(dayKey, [...existing, { id: uid("t"), time: Math.min(last, 1380), coach: "" }].sort((a, b) => a.time - b.time));
  };
  const updateTime = (dayKey, id, patch) =>
    setTimes(dayKey, (draft.times[dayKey] || []).map((t) => (t.id === id ? { ...t, ...patch } : t)).sort((a, b) => a.time - b.time));
  const removeTime = (dayKey, id) => setTimes(dayKey, (draft.times[dayKey] || []).filter((t) => t.id !== id));

  const copyDay = (fromKey, withCoaches) => {
    const src = draft.times[fromKey] || [];
    setDraft((d) => {
      const next = { ...d.times };
      copyTargets.forEach((k) => { next[k] = src.map((t) => ({ id: uid("t"), time: t.time, coach: withCoaches ? t.coach : "" })); });
      return { ...d, times: next };
    });
    setCopyFrom(null); setCopyTargets([]);
  };

  const distinctTimes = useMemo(() => {
    const s = new Set();
    DAYS.forEach(([k]) => (draft.times[k] || []).forEach((t) => s.add(t.time)));
    return [...s].sort((a, b) => a - b);
  }, [draft.times]);

  const selectedIds = Object.keys(selected).filter((k) => selected[k]);
  const assignSelected = () => {
    setDraft((d) => {
      const next = {};
      DAYS.forEach(([k]) => { next[k] = (d.times[k] || []).map((t) => (selected[t.id] ? { ...t, coach: bulkCoach } : t)); });
      return { ...d, times: next };
    });
    setSelected({});
  };
  const assignAllAtTime = () => {
    if (bulkTime === "") return;
    const t = Number(bulkTime);
    setDraft((d) => {
      const next = {};
      DAYS.forEach(([k]) => { next[k] = (d.times[k] || []).map((x) => (x.time === t ? { ...x, coach: bulkCoach } : x)); });
      return { ...d, times: next };
    });
  };

  /* individual / space availability helpers */
  const setWindows = (dayKey, list) => setDraft((d) => ({ ...d, availability: { ...d.availability, [dayKey]: list } }));
  const addWindow = (dayKey) => {
    const existing = draft.availability[dayKey] || [];
    setWindows(dayKey, [...existing, { start: 540, end: 720 }]);
  };
  const updateWindow = (dayKey, idx, patch) =>
    setWindows(dayKey, (draft.availability[dayKey] || []).map((w, i) => (i === idx ? { ...w, ...patch } : w)));
  const removeWindow = (dayKey, idx) => setWindows(dayKey, (draft.availability[dayKey] || []).filter((_, i) => i !== idx));

  const isGroup = draft.type === "group";
  const usesWindows = draft.type === "individual" || draft.type === "space";

  const save = (status) => {
    if (!draft.name.trim()) return;
    onSave({ ...draft, name: draft.name.trim(), status });
  };

  return (
    <div className="ms-overlay" role="dialog" aria-modal="true" aria-label="Service settings">
      <div className="ms-modal">
        <div className="ms-mhead">
          <div>
            <span className="ms-eyebrow">{initial.name ? "Edit service" : "New service or class"}</span>
            <h2>{draft.name.trim() || "Untitled service"}</h2>
          </div>
          <button className="x" aria-label="Close" onClick={onCancel}>×</button>
        </div>

        <div className="ms-mbody">
          {/* Coach near top for Individual */}
          {draft.type === "individual" && (
            <div className="ms-field">
              Coach
              <select value={draft.coach} onChange={(e) => set({ coach: e.target.value })}>
                <option value="">Choose a coach</option>
                {COACHES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}

          <div className="ms-field">
            Name
            <input value={draft.name} onChange={(e) => set({ name: e.target.value })} placeholder="e.g. Semi Group" />
          </div>

          <div className="ms-grid2">
            <div className="ms-field">
              Type
              <div className="ms-segrow">
                {[["individual", "Individual"], ["group", "Group"], ["space", "Space"]].map(([v, l]) => (
                  <button key={v} type="button" className={"ms-seg" + (draft.type === v ? " active" : "")}
                    onClick={() => set({ type: v, capacity: v === "individual" ? 1 : (draft.capacity < 2 ? 6 : draft.capacity) })}>{l}</button>
                ))}
              </div>
            </div>
            {draft.type !== "individual" && (
              <div className="ms-field">
                Capacity
                <input type="number" min="1" max="50" value={draft.capacity}
                  onChange={(e) => set({ capacity: Math.max(1, Number(e.target.value) || 1) })} />
              </div>
            )}
          </div>

          <div className="ms-field">
            Duration
            <div className="ms-segrow" style={{ marginBottom: 8 }}>
              {DURATION_PRESETS.map((p) => (
                <button key={p} type="button" className={"ms-preset" + (draft.duration === p ? " active" : "")}
                  onClick={() => set({ duration: p })}>{p} min</button>
              ))}
            </div>
            <input type="number" min="5" max="240" step="5" value={draft.duration}
              onChange={(e) => set({ duration: Math.max(5, Number(e.target.value) || 5) })}
              aria-label="Custom duration in minutes" style={{ maxWidth: 160 }} />
          </div>

          {/* GROUP: weekly recurring class times */}
          {isGroup && (
            <div className="ms-sec">
              <h3>Weekly class times</h3>
              <p className="ms-sub" style={{ marginBottom: 14 }}>
                Add each recurring start time. Coaches are optional — Unassigned is fine and will not block publishing.
              </p>

              {distinctTimes.length > 0 && (
                <div className="ms-bulk">
                  <span>Quick assign</span>
                  <select value={bulkCoach} onChange={(e) => setBulkCoach(e.target.value)} aria-label="Coach to assign">
                    {COACHES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select value={bulkTime} onChange={(e) => setBulkTime(e.target.value)} aria-label="Time to assign">
                    <option value="">all classes at time…</option>
                    {distinctTimes.map((t) => <option key={t} value={t}>{fmt(t)}</option>)}
                  </select>
                  <button type="button" className="ms-btn small" onClick={assignAllAtTime} disabled={bulkTime === ""}>Assign to time</button>
                  <button type="button" className="ms-btn small" onClick={assignSelected} disabled={!selectedIds.length}>
                    Assign to selected{selectedIds.length ? ` (${selectedIds.length})` : ""}
                  </button>
                </div>
              )}

              {DAYS.map(([key, label]) => {
                const list = draft.times[key] || [];
                return (
                  <div className="ms-day" key={key}>
                    <div className="ms-dayhead">
                      <span className="ms-dn">{label}</span>
                      <span className="ms-dc">{list.length} time{list.length === 1 ? "" : "s"}</span>
                    </div>
                    <div className="ms-daybody">
                      {list.map((t) => (
                        <div className="ms-tline" key={t.id}>
                          <input type="checkbox" aria-label={`Select ${label} ${fmt(t.time)}`}
                            checked={!!selected[t.id]} onChange={(e) => setSelected((s) => ({ ...s, [t.id]: e.target.checked }))} />
                          <TimeField ariaLabel={`${label} class time`} value={t.time} onChange={(v) => updateTime(key, t.id, { time: v })} />
                          <CoachSelect ariaLabel={`Coach for ${label} ${fmt(t.time)}`} value={t.coach} onChange={(v) => updateTime(key, t.id, { coach: v })} />
                          <button type="button" className="ms-x" aria-label="Remove time" onClick={() => removeTime(key, t.id)}>×</button>
                        </div>
                      ))}
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button type="button" className="ms-btn small ghost" onClick={() => addTime(key)}>+ Add time</button>
                        {list.length > 0 && (
                          <button type="button" className="ms-btn small ghost"
                            onClick={() => { setCopyFrom(copyFrom === key ? null : key); setCopyTargets([]); }}>
                            Copy {label} to…
                          </button>
                        )}
                      </div>
                      {copyFrom === key && (
                        <div className="ms-copybar">
                          <div className="ms-copyto">
                            {DAYS.filter(([k]) => k !== key).map(([k, l]) => (
                              <button key={k} type="button" className={"ms-dchip" + (copyTargets.includes(k) ? " on" : "")}
                                onClick={() => setCopyTargets((t) => t.includes(k) ? t.filter((x) => x !== k) : [...t, k])}>{l}</button>
                            ))}
                          </div>
                          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                            <button type="button" className="ms-btn small primary" disabled={!copyTargets.length} onClick={() => copyDay(key, false)}>Copy times only</button>
                            <button type="button" className="ms-btn small" disabled={!copyTargets.length} onClick={() => copyDay(key, true)}>Copy times + coaches</button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* INDIVIDUAL / SPACE: availability windows */}
          {usesWindows && (
            <div className="ms-sec">
              <h3>Availability</h3>
              <div className="ms-segrow" style={{ margin: "10px 0 14px" }}>
                <button type="button" className={"ms-seg" + (draft.useDefaultHours ? " active" : "")} onClick={() => set({ useDefaultHours: true })}>Use default hours</button>
                <button type="button" className={"ms-seg" + (!draft.useDefaultHours ? " active" : "")} onClick={() => set({ useDefaultHours: false })}>Custom availability</button>
              </div>
              {draft.useDefaultHours ? (
                <div className="ms-note">Bookable {fmt(DEFAULT_WINDOW.start)} – {fmt(DEFAULT_WINDOW.end)} every day. Switch to custom to set specific windows per day.</div>
              ) : (
                DAYS.map(([key, label]) => {
                  const list = draft.availability[key] || [];
                  return (
                    <div className="ms-day" key={key}>
                      <div className="ms-dayhead">
                        <span className="ms-dn">{label}</span>
                        <span className="ms-dc">{list.length ? `${list.length} window${list.length === 1 ? "" : "s"}` : "Closed"}</span>
                      </div>
                      <div className="ms-daybody">
                        {list.map((w, i) => (
                          <div className="ms-tline" key={i}>
                            <TimeField ariaLabel={`${label} window start`} value={w.start} onChange={(v) => updateWindow(key, i, { start: v })} />
                            <span className="ms-dash">–</span>
                            <TimeField ariaLabel={`${label} window end`} value={w.end} onChange={(v) => updateWindow(key, i, { end: v })} />
                            <button type="button" className="ms-x" aria-label="Remove window" onClick={() => removeWindow(key, i)}>×</button>
                          </div>
                        ))}
                        <button type="button" className="ms-btn small ghost" onClick={() => addWindow(key)}>+ Add availability window</button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        <div className="ms-mfoot">
          {initial.status === "published"
            ? <span className="ms-chip pub">Published</span>
            : <span className="ms-chip draft">Draft</span>}
          <div className="ms-right">
            <button type="button" className="ms-btn" onClick={onCancel}>Cancel</button>
            <button type="button" className="ms-btn" onClick={() => save("draft")}>Save draft</button>
            <button type="button" className="ms-btn primary" onClick={() => save("published")}>Publish</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ one-time event */

function OneTimeEditor({ services, onCancel, onSave }) {
  const [name, setName] = useState(services[0] ? services[0].name : "One-time session");
  const [serviceId, setServiceId] = useState(services[0] ? services[0].id : "");
  const [date, setDate] = useState(todayYmd());
  const [timeRaw, setTimeRaw] = useState(540);
  const [coach, setCoach] = useState("");
  const [capacity, setCapacity] = useState(6);

  return (
    <div className="ms-overlay" role="dialog" aria-modal="true" aria-label="Add one-time event">
      <div className="ms-modal narrow">
        <div className="ms-mhead">
          <div><span className="ms-eyebrow">Secondary action</span><h2>Add one-time event</h2></div>
          <button className="x" aria-label="Close" onClick={onCancel}>×</button>
        </div>
        <div className="ms-mbody">
          <div className="ms-field">
            Based on
            <select value={serviceId} onChange={(e) => { setServiceId(e.target.value); const s = services.find((x) => x.id === e.target.value); if (s) { setName(s.name); setCapacity(s.capacity); } }}>
              <option value="">Custom event</option>
              {services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="ms-field">Name<input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="ms-grid2">
            <div className="ms-field">Date<input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
            <div className="ms-field">Time<TimeField ariaLabel="Event time" value={timeRaw} onChange={setTimeRaw} /></div>
          </div>
          <div className="ms-grid2">
            <div className="ms-field">Coach<CoachSelect className="ms-coach" ariaLabel="Coach" value={coach} onChange={setCoach} /></div>
            <div className="ms-field">Capacity<input type="number" min="1" max="50" value={capacity} onChange={(e) => setCapacity(Math.max(1, Number(e.target.value) || 1))} /></div>
          </div>
        </div>
        <div className="ms-mfoot">
          <div className="ms-right">
            <button className="ms-btn" onClick={onCancel}>Cancel</button>
            <button className="ms-btn primary" onClick={() => name.trim() && onSave({ serviceId, name: name.trim(), date, time: timeRaw, coach, capacity })}>Add event</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ member booking */

function slotsForWindow(w, duration) {
  const out = [];
  for (let s = w.start; s + duration <= w.end; s += duration) out.push(s);
  return out;
}

function MemberBooking({ services, sessions, onBook }) {
  const published = services.filter((s) => s.status === "published");
  const [serviceId, setServiceId] = useState(null);
  const [date, setDate] = useState(todayYmd());
  const [confirmed, setConfirmed] = useState(null);

  const service = published.find((s) => s.id === serviceId) || null;
  const dayKey = DOW_KEYS[dowOf(date)];

  const times = useMemo(() => {
    if (!service) return [];
    if (service.type === "group") {
      return (service.times[dayKey] || []).slice().sort((a, b) => a.time - b.time).map((t) => {
        const ses = sessions.find((x) => x.serviceId === service.id && x.date === date && x.time === t.time);
        const booked = ses ? ses.members.length : 0;
        return { time: t.time, coach: t.coach, remaining: service.capacity - booked, capacity: service.capacity };
      });
    }
    const wins = getWindows(service, dayKey);
    const starts = [];
    wins.forEach((w) => slotsForWindow(w, service.duration).forEach((s) => starts.push(s)));
    return [...new Set(starts)].sort((a, b) => a - b).map((time) => {
      const ses = sessions.find((x) => x.serviceId === service.id && x.date === date && x.time === time);
      const booked = ses ? ses.members.length : 0;
      const cap = service.type === "space" ? service.capacity : 1;
      return { time, coach: service.coach, remaining: cap - booked, capacity: cap };
    });
  }, [service, dayKey, date, sessions]);

  if (confirmed) {
    return (
      <div className="ms-bwrap">
        <div className="ms-confirm">
          <h3>Booking confirmed</h3>
          <p style={{ margin: 0 }}>{confirmed.serviceName} · {dateLabel(confirmed.date)} · {fmt(confirmed.time)}{confirmed.coach ? ` · ${confirmed.coach}` : ""}</p>
          <p className="ms-sub" style={{ margin: "8px auto 0" }}>This now appears in Upcoming Sessions for the gym owner.</p>
        </div>
        <div style={{ marginTop: 16 }}>
          <button className="ms-btn primary" onClick={() => { setConfirmed(null); setServiceId(null); }}>Book another</button>
        </div>
      </div>
    );
  }

  return (
    <div className="ms-bwrap">
      <div className="ms-steps">
        <span className={!service ? "on" : ""}>1. Service</span>
        <span className={service ? "on" : ""}>2. Date</span>
        <span className={service ? "on" : ""}>3. Time</span>
        <span>4. Confirm</span>
      </div>

      {!service && (
        <>
          {published.length === 0 && <div className="ms-note">No published services yet. Publish a service to make it bookable here.</div>}
          {published.map((s) => (
            <button key={s.id} className="ms-opt" onClick={() => setServiceId(s.id)}>
              <span><strong>{s.name}</strong><small>{serviceMeta(s)}</small></span>
              <Chevron />
            </button>
          ))}
        </>
      )}

      {service && (
        <>
          <button className="ms-back" onClick={() => setServiceId(null)}>‹ Back to services</button>
          <div className="ms-field" style={{ maxWidth: 220 }}>
            Date
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <h3 style={{ margin: "6px 0 12px", fontSize: 16 }}>{dateLabel(date)}</h3>
          {times.length === 0 ? (
            <div className="ms-note">No available times for {service.name} on this day. Try another date.</div>
          ) : (
            <div className="ms-times">
              {times.map((t) => {
                const full = t.remaining <= 0;
                const showSpots = service.type !== "individual";
                return (
                  <button key={t.time} className={"ms-time" + (full ? " full" : "")} disabled={full}
                    onClick={() => { onBook({ service, date, time: t.time, coach: t.coach }); setConfirmed({ serviceName: service.name, date, time: t.time, coach: t.coach }); }}>
                    {fmt(t.time)}
                    {full ? <small>Full</small> : showSpots ? <small>{t.remaining} spot{t.remaining === 1 ? "" : "s"} left</small> : <small>Available</small>}
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ upcoming sessions */

function UpcomingSessions({ sessions, onChangeCoach, onAddOneTime }) {
  const [open, setOpen] = useState({});
  const sorted = [...sessions].sort((a, b) => a.date.localeCompare(b.date) || a.time - b.time);

  return (
    <>
      <div className="ms-pagehead">
        <div>
          <h2>Upcoming Sessions</h2>
          <p className="ms-sub">Sessions appear here when members book your published services and classes.</p>
        </div>
        <button className="ms-btn" onClick={onAddOneTime}>+ Add one-time event</button>
      </div>

      {sorted.length === 0 ? (
        <div className="ms-card"><div className="ms-empty">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="4" width="18" height="18" rx="3" /><path d="M3 10h18M8 2v4M16 2v4" /></svg>
          <p style={{ margin: 0 }}>No sessions booked yet. Publish a service, then simulate a booking in Member Booking.</p>
        </div></div>
      ) : (
        <div className="ms-card">
          {sorted.map((s) => {
            const booked = s.members.length;
            const full = booked >= s.capacity;
            return (
              <div key={s.id}>
                <div className="ms-usrow">
                  <div className="ms-body">
                    <p className="ms-name">{s.serviceName}</p>
                    <span className="ms-when">{dateLabel(s.date)} · {fmt(s.time)}</span>
                  </div>
                  <CoachSelect ariaLabel={`Coach for ${s.serviceName} on ${dateLabel(s.date)}`} value={s.coach} onChange={(v) => onChangeCoach(s.id, v)} />
                  <span className={"ms-count" + (full ? " full" : "")}>{full ? "Full" : `${booked}/${s.capacity} booked`}</span>
                  <button className="ms-btn small ghost" onClick={() => setOpen((o) => ({ ...o, [s.id]: !o[s.id] }))}>
                    {open[s.id] ? "Close" : "Open ›"}
                  </button>
                </div>
                {open[s.id] && (
                  <div className="ms-roster">
                    {s.members.length ? (
                      <>
                        Booked members
                        <div className="ms-rlist">{s.members.map((m, i) => <span className="ms-pill" key={i}>{m}</span>)}</div>
                      </>
                    ) : "No members booked yet."}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ services list */

function blankService() {
  return {
    id: uid("svc"), name: "", type: "group", duration: 60, capacity: 6, coach: "",
    status: "draft", useDefaultHours: false, availability: emptyByDay([]), times: emptyByDay([]),
  };
}

function ServicesList({ services, onOpen, onNew, onShare }) {
  return (
    <>
      <div className="ms-pagehead">
        <div>
          <h2>Services &amp; Classes</h2>
          <p className="ms-sub">Each row is one offering and its weekly schedule. Publishing makes its times bookable right away.</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="ms-btn" onClick={onShare}>Share booking link</button>
          <button className="ms-btn primary" onClick={onNew}>+ New service or class</button>
        </div>
      </div>
      <div className="ms-card">
        {services.map((s) => (
          <button className="ms-srow" key={s.id} onClick={() => onOpen(s)}>
            <span className="ms-icon">
              {s.type === "group"
                ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="9" cy="7" r="3" /><path d="M2 21v-1a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v1" /><circle cx="18" cy="8" r="2.4" /><path d="M22 21v-1a4 4 0 0 0-3-3.8" /></svg>
                : s.type === "space"
                  ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18" /></svg>
                  : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="7" r="3.2" /><path d="M5 21v-1a6 6 0 0 1 6-6h2a6 6 0 0 1 6 6v1" /></svg>}
            </span>
            <span className="ms-body">
              <p className="ms-name">{s.name}</p>
              <span className="ms-meta">{serviceMeta(s)}</span>
            </span>
            <span className={"ms-chip " + (s.status === "published" ? "pub" : "draft")}>{s.status === "published" ? "Published" : "Draft"}</span>
            <Chevron />
          </button>
        ))}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ root */

export default function MiltonSchedule({ className, height = "calc(100dvh - 100px)" }) {
  const [services, setServices] = useState(seedServices);
  const [sessions, setSessions] = useState(() => seedSessions(services));
  const [tab, setTab] = useState("services");
  const [editing, setEditing] = useState(null); // service being edited (or blank for new)
  const [oneTime, setOneTime] = useState(false);
  const [toast, setToast] = useState("");

  const flash = (msg) => { setToast(msg); clearTimeout(flash.t); flash.t = setTimeout(() => setToast(""), 3200); };

  const saveService = (svc) => {
    setServices((prev) => {
      const idx = prev.findIndex((s) => s.id === svc.id);
      if (idx >= 0) { const copy = [...prev]; copy[idx] = svc; return copy; }
      return [...prev, svc];
    });
    setEditing(null);
    flash(svc.status === "published" ? `${svc.name} published — times are now bookable.` : `${svc.name} saved as draft.`);
  };

  const pickMember = (existing) => MEMBERS.find((m) => !existing.includes(m)) || "Guest";

  const bookSession = ({ service, date, time, coach }) => {
    setSessions((prev) => {
      const idx = prev.findIndex((s) => s.serviceId === service.id && s.date === date && s.time === time);
      if (idx >= 0) {
        const s = prev[idx];
        if (s.members.length >= s.capacity) return prev;
        const copy = [...prev];
        copy[idx] = { ...s, members: [...s.members, pickMember(s.members)] };
        return copy;
      }
      const capacity = service.type === "individual" ? 1 : service.capacity;
      return [...prev, { id: uid("ses"), serviceId: service.id, serviceName: service.name, type: service.type, date, time, coach: coach || "", capacity, members: [pickMember([])] }];
    });
    flash("Member booked — session updated in Upcoming Sessions.");
  };

  const addOneTime = ({ serviceId, name, date, time, coach, capacity }) => {
    setSessions((prev) => [...prev, { id: uid("ses"), serviceId: serviceId || "custom", serviceName: name, type: "group", date, time, coach: coach || "", capacity, members: [] }]);
    setOneTime(false);
    setTab("sessions");
    flash("One-time event added.");
  };

  const changeCoach = (id, coach) => {
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, coach } : s)));
    flash(coach ? `Coach set to ${coach} for this session.` : "Session set to Unassigned.");
  };

  return (
    <div className={"ms-root" + (className ? " " + className : "")} style={{ height }}>
      <style>{STYLES}</style>

      <div className="ms-head">
        <div className="ms-headrow">
          <div>
            <span className="ms-eyebrow">Scheduling</span>
            <h1 className="ms-h1">Booking &amp; Schedule</h1>
          </div>
        </div>
        <div className="ms-tabs" role="tablist">
          <button className={"ms-tab" + (tab === "services" ? " active" : "")} onClick={() => setTab("services")} role="tab" aria-selected={tab === "services"}>
            Services &amp; Classes <b>{services.length}</b>
          </button>
          <button className={"ms-tab" + (tab === "sessions" ? " active" : "")} onClick={() => setTab("sessions")} role="tab" aria-selected={tab === "sessions"}>
            Upcoming Sessions <b>{sessions.length}</b>
          </button>
          <button className={"ms-tab" + (tab === "booking" ? " active" : "")} onClick={() => setTab("booking")} role="tab" aria-selected={tab === "booking"}>
            Member Booking
          </button>
        </div>
      </div>

      <div className="ms-page">
        {tab === "services" && (
          <ServicesList
            services={services}
            onOpen={(s) => setEditing(s)}
            onNew={() => setEditing(blankService())}
            onShare={() => flash("Public booking link copied (demo). Published services appear instantly.")}
          />
        )}
        {tab === "sessions" && (
          <UpcomingSessions sessions={sessions} onChangeCoach={changeCoach} onAddOneTime={() => setOneTime(true)} />
        )}
        {tab === "booking" && (
          <>
            <div className="ms-pagehead">
              <div>
                <h2>Preview Member Booking</h2>
                <p className="ms-sub">Preview exactly what members see on your public booking link. Published services show up here with no extra setup.</p>
              </div>
            </div>
            <MemberBooking services={services} sessions={sessions} onBook={bookSession} />
          </>
        )}
      </div>

      {editing && (
        <ServiceEditor initial={editing} onCancel={() => setEditing(null)} onSave={saveService} />
      )}
      {oneTime && (
        <OneTimeEditor services={services} onCancel={() => setOneTime(false)} onSave={addOneTime} />
      )}

      {toast && <div className="ms-toast" role="status">{toast}</div>}
    </div>
  );
}
