import React, { useState, useEffect, useRef } from "react";
import { TEAL, TEAL_LIGHT, WHITE, TEXT, TEXT_SEC, BORDER } from "./constants";

/* ---------- tokens ---------- */
const MONO = "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace";
const PAGE_BG = "#fafcfb";
const T800 = TEAL;
const T700 = "#3aafa9";
const T050 = TEAL_LIGHT;
const T200 = "#c7e5e1";
const FG1 = TEXT;
const FG2 = TEXT_SEC;
const FG3 = "#8ba39e";
const FG4 = "#a8bab6";
const INK100 = "#eef1f0";
const INK150 = "#e4eae8";
const INK200 = "#d5dedb";
const INK300 = "#b9c7c3";
const B_SOFT = BORDER;
const B_SUB = "#edf3f1";
const D_BG = "#fbe9e7", D_FG = "#b3261e", D_MID = "#d9463c";
const W_BG = "#f6edd9", W_FG = "#a86a1f", W_MID = "#c9922f";
const S_BG = "#e6f9ec", S_FG = "#1f7a3e";
const GREEN = "#3aaf6a";
const SHADOW_XS = "0 1px 2px rgba(11,20,23,.06)";
const SHADOW_CARD = "0 1px 3px rgba(11,20,23,.05)";

const ROW = 64, DAY_START = 6, DAY_END = 21, NOW = 10.5;
const KIND = {
  oneone: { bg: "#E2ECFD", bar: "#3F88F2", label: "1:1 session" },
  group: { bg: "#E8F7E3", bar: "#3FA053", label: "Group class" },
  bootcamp: { bg: "#E4F0F0", bar: "#0E5D70", label: "Bootcamp" },
  room: { bg: "#EDE4FE", bar: "#8B5CF6", label: "Room booking" },
  internal: { bg: "#FCEDD2", bar: "#E89C3A", label: "Internal" },
  block: { bg: "#E4E8EE", bar: "#7788A0", label: "Blocked time" },
};
const HOURS = ["6 AM","7 AM","8 AM","9 AM","10 AM","11 AM","12 PM","1 PM","2 PM","3 PM","4 PM","5 PM","6 PM","7 PM","8 PM"];
const DOWS = ["MON","TUE","WED","THU","FRI","SAT","SUN"];
const DOW_FULL = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const TODAY = "2026-08-26";
const WEEK0 = "2026-08-24";

const TRAINERS = [
  { id: "alex", name: "Alex Reyes" },
  { id: "dana", name: "Dana Kim" },
  { id: "priya", name: "Priya Shah" },
];
const ROOMS = [
  { id: "a", name: "Studio A", max: 2, buffer: 10, cap: "Holds 6", slot: "Semi-private and 1:1 work. Two 1:1s may share it; a class takes the whole room." },
  { id: "b", name: "Studio B", max: 1, buffer: 10, cap: "Holds 16", slot: "Bootcamp home room. One booking at a time, no splitting." },
  { id: "rec", name: "Recovery", max: 1, buffer: 15, cap: "One client", slot: "Self-serve. Client books directly, no trainer required." },
  { id: "mas", name: "Massage", max: 1, buffer: 15, cap: "One client", slot: "Needs a staffed therapist; blocks them for the slot plus turnover." },
];
const CLIENTS = ["Sarah Chen","Marcus Johnson","Nina Koval","Ben Olsson","Maya Lee","Chris Wu","Emily Rodriguez","Jake Ramirez","Dion Ruiz","Kyla Boyd","Alicia Vance","Derek Pace"];
const TEMPLATES = [
  { id: "t1", name: "Semi-Private Strength", kind: "group", icon: "◫", spec: "Class · 60 min · cap 4", detail: "Default coach Alex Reyes · Studio A · waitlist off", form: { name: "Semi-Private Strength", dur: 1, cap: 4, room: "a", trainer: "alex", start: 8, waitlist: false }, type: "group" },
  { id: "t2", name: "Bootcamp", kind: "bootcamp", icon: "◎", spec: "Class · 45 min · cap 12", detail: "Default coach Alex Reyes · Studio B · auto-promote waitlist", form: { name: "Bootcamp", dur: 0.75, cap: 12, room: "b", trainer: "alex", start: 17, waitlist: true }, type: "group" },
  { id: "t3", name: "New Member Consult", kind: "oneone", icon: "☖", spec: "Appointment · 30 min · 1:1", detail: "Any coach · Studio A · 10 min buffer", form: { dur: 0.5, room: "a", start: 9, repeat: "once" }, type: "oneone" },
  { id: "t4", name: "Recovery Room", kind: "room", icon: "◍", spec: "Resource · 30 min · self-serve", detail: "No coach · 15 min buffer between bookings", form: { dur: 0.5, room: "rec", start: 16, trainer: "" }, type: "room" },
];
const PROVIDERS = [
  { id: "teams", name: "Microsoft Teams", mono: "Tm", sub: "Calendar-backed events · Outlook", tint: "#4B53BC" },
  { id: "google", name: "Google Meet", mono: "GM", sub: "Google Calendar conference data", tint: "#2E7D46" },
  { id: "apple", name: "Apple Calendar", mono: "Ap", sub: "Two-way busy sync, no meeting links", tint: "#4A5568" },
  { id: "zoom", name: "Zoom", mono: "Zm", sub: "Meetings for an authorized host", tint: "#2D8CFF" },
];
const CLASS_DEFS = [
  { id: "bootcamp", name: "Bootcamp", kind: "bootcamp", dows: [0,1,2,3,4], start: 17, dur: 0.75, cap: 12, room: "b", trainer: "alex", waitlist: true, base: 11, wait: 3 },
  { id: "semi", name: "Semi-Private Strength", kind: "group", dows: [0,1,3,5], start: 8, dur: 1, cap: 4, room: "a", trainer: "alex", waitlist: false, base: 3, wait: 0 },
  { id: "mobility", name: "Mobility Class", kind: "group", dows: [5], start: 9, dur: 1, cap: 12, room: "b", trainer: "priya", waitlist: true, base: 8, wait: 0 },
  { id: "fall", name: "6-Week Fall Bootcamp", kind: "bootcamp", dows: [0,2,4], start: 18, dur: 1, cap: 16, room: "b", trainer: "alex", waitlist: false, base: 14, wait: 0, from: "2026-09-07", to: "2026-10-16" },
];
const SEED = [
  [0, 6, 1, "oneone", "Sarah Chen", "alex", "a", "confirmed"],
  [0, 9, 1, "oneone", "Marcus Johnson", "alex", "a", "confirmed"],
  [0, 12, 2, "block", "Programming block", "alex", "", "confirmed"],
  [0, 6, 1, "oneone", "Ben Olsson", "dana", "b", "confirmed"],
  [0, 17, 1, "oneone", "Dion Ruiz", "dana", "b", "confirmed"],
  [1, 6.5, 1, "oneone", "Nina Koval", "alex", "a", "confirmed"],
  [1, 11, 0.5, "internal", "Team meeting", "alex", "", "confirmed"],
  [1, 16, 0.5, "room", "Ben Olsson", "", "rec", "confirmed"],
  [1, 9, 1.5, "oneone", "Kyla Boyd", "priya", "b", "confirmed"],
  [2, 6, 1, "oneone", "Sarah Chen", "alex", "a", "confirmed"],
  [2, 9, 1, "oneone", "Nina Koval", "alex", "a", "confirmed"],
  [2, 10, 0.5, "internal", "1:1 with Dana Kim", "alex", "", "confirmed"],
  [3, 7, 1, "oneone", "Maya Lee", "alex", "a", "confirmed"],
  [3, 15, 0.75, "room", "Chris Wu", "priya", "mas", "confirmed"],
  [3, 18, 1, "oneone", "Emily Rodriguez", "alex", "a", "unconfirmed"],
  [4, 6, 1, "oneone", "Chris Wu", "alex", "a", "confirmed"],
  [4, 10, 1.5, "oneone", "Sarah Chen", "alex", "a", "confirmed"],
  [4, 14, 2, "block", "Programming block", "alex", "", "confirmed"],
  [5, 11, 0.5, "oneone", "Jake Ramirez", "alex", "a", "confirmed"],
];

/* ---------- date/util helpers ---------- */
const pad = (n) => (n < 10 ? "0" + n : "" + n);
const toISO = (dt) => dt.getFullYear() + "-" + pad(dt.getMonth() + 1) + "-" + pad(dt.getDate());
const toDate = (iso) => { const p = iso.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); };
const addDays = (iso, n) => { const d = toDate(iso); d.setDate(d.getDate() + n); return toISO(d); };
const dowOf = (iso) => (toDate(iso).getDay() + 6) % 7;
const fmtDate = (iso) => { const d = toDate(iso); return MONTHS[d.getMonth()] + " " + d.getDate(); };
const fmtLong = (iso) => { const d = toDate(iso); return DOW_FULL[dowOf(iso)] + ", " + MONTHS[d.getMonth()] + " " + d.getDate(); };
const fmtShort = (iso) => { const d = toDate(iso); const dw = DOWS[dowOf(iso)]; return dw.charAt(0) + dw.slice(1, 3).toLowerCase() + " " + MONTHS[d.getMonth()] + " " + d.getDate(); };
function fmtT(t) {
  const h24 = Math.floor(t), m = Math.round((t - h24) * 60);
  const ap = h24 >= 12 ? "pm" : "am";
  let h = h24 % 12; if (h === 0) h = 12;
  return h + ":" + pad(m) + " " + ap;
}
const range = (t, d) => fmtT(t) + " – " + fmtT(t + d);
const overlaps = (a1, a2, b1, b2) => a1 < b2 && b1 < a2;
const initials = (n) => n.split(" ").map((w) => w.charAt(0)).join("").slice(0, 2);
const trainerName = (id) => { const t = TRAINERS.find((x) => x.id === id); return t ? t.name : ""; };
const roomName = (id) => { const r = ROOMS.find((x) => x.id === id); return r ? r.name : "No room"; };
const roomBuffer = (id) => { const r = ROOMS.find((x) => x.id === id); return r ? r.buffer || 0 : 0; };
const roomMax = (id) => { const r = ROOMS.find((x) => x.id === id); return r ? r.max : 1; };
function hash(s) { let h = 0; for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0; return Math.abs(h); }
const mondayOf = (iso) => addDays(iso, -dowOf(iso));

/* ---------- style helpers ---------- */
const TONES = {
  danger: [D_BG, D_FG], warn: [W_BG, W_FG], success: [S_BG, S_FG],
  brand: [T050, T800], neutral: [INK100, FG2],
};
function tone(t) {
  const c = TONES[t] || TONES.neutral;
  return { display: "inline-flex", alignItems: "center", justifySelf: "start", fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 999, background: c[0], color: c[1] };
}
function seg(active) {
  return { border: 0, cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 600, padding: "6px 13px", borderRadius: 999, background: active ? WHITE : "transparent", color: active ? FG1 : FG3, boxShadow: active ? SHADOW_XS : "none" };
}
function pill(active) {
  return { border: `1px solid ${active ? T800 : B_SOFT}`, background: active ? T050 : WHITE, color: active ? T800 : FG2, fontFamily: "inherit", fontSize: 12, fontWeight: 600, padding: "7px 13px", borderRadius: 999, cursor: "pointer" };
}
function btn(kind) {
  if (kind === "primary") return { border: 0, background: T800, color: WHITE, fontFamily: "inherit", fontSize: 12.5, fontWeight: 600, padding: "9px 18px", borderRadius: 999, cursor: "pointer" };
  if (kind === "danger") return { border: 0, background: D_MID, color: WHITE, fontFamily: "inherit", fontSize: 12.5, fontWeight: 600, padding: "9px 16px", borderRadius: 999, cursor: "pointer" };
  if (kind === "off") return { border: 0, background: INK200, color: WHITE, fontFamily: "inherit", fontSize: 12.5, fontWeight: 600, padding: "9px 18px", borderRadius: 999, cursor: "not-allowed" };
  return { border: `1px solid ${B_SOFT}`, background: WHITE, color: FG1, fontFamily: "inherit", fontSize: 12.5, fontWeight: 600, padding: "9px 16px", borderRadius: 999, cursor: "pointer" };
}
const stepBtn = { width: 26, height: 26, borderRadius: 8, border: `1px solid ${B_SOFT}`, background: WHITE, color: FG1, fontSize: 14, cursor: "pointer", lineHeight: 1 };
function avatarStyle(id, size) {
  const tints = { alex: T200, dana: "#E2ECFD", priya: "#EDE4FE" };
  const fg = { alex: T800, dana: "#2A5FA8", priya: "#6B3FBF" };
  const s = size || 24;
  return { width: s, height: s, flex: `0 0 ${s}px`, borderRadius: 999, fontSize: s > 24 ? 10 : 9.5, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center", background: tints[id] || INK150, color: fg[id] || FG2 };
}
function evStyle(e, ghost, conflict) {
  const k = KIND[e.kind] || KIND.oneone;
  return {
    position: "absolute", left: 3, right: 3, top: (e.start - DAY_START) * ROW + 2, height: e.dur * ROW - 5,
    background: ghost ? "transparent" : conflict ? D_BG : k.bg,
    border: ghost ? `1px dashed ${k.bar}` : "1px solid rgba(11,20,23,.05)",
    borderLeft: `3px solid ${conflict ? D_MID : k.bar}`,
    borderRadius: 7, padding: "4px 7px", display: "flex", flexDirection: "column", gap: 1,
    overflow: "hidden", cursor: "pointer", opacity: ghost ? 0.75 : 1, zIndex: 2, textAlign: "left",
  };
}

/* ---------- small presentational pieces ---------- */
const Eyebrow = ({ children, style }) => (
  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".08em", color: FG4, textTransform: "uppercase", ...style }}>{children}</div>
);
const Card = ({ children, style }) => (
  <div style={{ background: WHITE, border: `1px solid ${B_SOFT}`, borderRadius: 14, boxShadow: SHADOW_CARD, ...style }}>{children}</div>
);
function Select({ value, onChange, options, style }) {
  return (
    <select value={value} onChange={onChange} style={{ border: `1px solid ${B_SOFT}`, background: WHITE, color: FG1, fontFamily: "inherit", fontSize: 12.5, fontWeight: 500, padding: "7px 10px", borderRadius: 9, cursor: "pointer", ...style }}>
      {options.map((o) => <option key={o.v} value={o.v}>{o.label}</option>)}
    </select>
  );
}
const Bar = ({ pct, color }) => (
  <div style={{ height: 5, borderRadius: 999, background: INK100, overflow: "hidden" }}>
    <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 999 }} />
  </div>
);

export default function ScheduleCanvasV2({ onClose, isMobile }) {
  const [persona, setPersona] = useState("coach");
  const [tab, setTab] = useState("week");
  const [weekStart, setWeekStart] = useState(WEEK0);
  const [day, setDay] = useState(TODAY);
  const [loc, setLoc] = useState("main");
  const [trainerFilter, setTrainerFilter] = useState("alex");
  const [sheet, setSheet] = useState(null);
  const [ctype, setCtype] = useState("oneone");
  const [sel, setSel] = useState(null);
  const [who, setWho] = useState("facility");
  const [sessCoach, setSessCoach] = useState("all");
  const [sessType, setSessType] = useState("all");
  const [toast, setToast] = useState("");
  const [form, setForm] = useState({ client: "Sarah Chen", trainer: "alex", room: "a", date: "2026-08-27", start: 16, dur: 1, repeat: "once", name: "New class", cap: 4, dow: 0, waitlist: true, who: "all" });
  const [appts, setAppts] = useState(() =>
    SEED.map((s, i) => ({ id: "a" + i, date: addDays(WEEK0, s[0]), start: s[1], dur: s[2], kind: s[3], title: s[4], trainer: s[5], room: s[6], status: s[7] })).concat([
      { id: "v1", date: addDays(WEEK0, 2), start: 15, dur: 0.5, kind: "oneone", title: "Alicia Vance", trainer: "priya", room: "", status: "confirmed", virtual: true },
      { id: "v2", date: addDays(WEEK0, 2), start: 18.5, dur: 0.5, kind: "oneone", title: "Derek Pace", trainer: "dana", room: "", status: "confirmed", virtual: true },
      { id: "v3", date: addDays(WEEK0, 3), start: 12, dur: 0.5, kind: "oneone", title: "Kyla Boyd", trainer: "alex", room: "", status: "confirmed", virtual: true },
    ])
  );
  const [caps, setCaps] = useState({});
  const [enroll, setEnrollState] = useState({});
  const [paused, setPaused] = useState([]);
  const [skipped, setSkipped] = useState([]);
  const [dismissed, setDismissed] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [hours, setHours] = useState({
    facility: [[[5,20]],[[5,20]],[[5,20]],[[5,20]],[[5,19]],[[7,13]],[]],
    alex: [[[6,11],[16,19]],[[6,11],[16,19]],[[6,11]],[[6,11],[16,19]],[[6,11],[14,18]],[[7,12]],[]],
    dana: [[[6,12],[15,19]],[[6,12],[15,19]],[[6,12],[15,19]],[[6,12],[15,19]],[[6,12]],[],[]],
    priya: [[[9,16]],[[7,12]],[[9,16]],[[7,12]],[[7,12]],[[7,12]],[]],
  });
  const [defaultProvider, setDefaultProvider] = useState("teams");
  const [conn, setConn] = useState({ teams: true, google: true, apple: true, zoom: false });
  const [hostMap, setHostMap] = useState({ alex: { teams: "alex@riversidestrength.com", google: "alex@riversidestrength.com" }, dana: { google: "dana@riversidestrength.com" }, priya: {} });
  const [closures, setClosures] = useState([
    { date: "2026-09-07", name: "Labor Day", source: "Default", effect: "all", open: false },
    { date: "2026-09-04", name: "Staff training (half-day)", source: "Custom", effect: "after", after: 12, open: false },
    { date: "2026-11-26", name: "Thanksgiving", source: "Default", effect: "all", open: false },
    { date: "2026-12-25", name: "Christmas Day", source: "Default", effect: "all", open: true },
  ]);
  const [rules, setRules] = useState({ notice: 12, cancel: 12, buffer: 10, maxDay: 8 });
  const [cals, setCals] = useState({ google: true, apple: true });
  const [vw, setVw] = useState(() => (typeof window === "undefined" ? 1280 : window.innerWidth));

  const toastTimer = useRef(null);
  useEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  const flash = (msg) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2800);
  };
  const patchForm = (p) => setForm((f) => ({ ...f, ...p }));
  const openCreate = (patch, type) => { setCtype(type || ctype); setForm((f) => ({ ...f, ...(patch || {}) })); setSheet("create"); };
  const me = "alex";
  const narrow = isMobile || vw < 1100;
  // The rail costs ~270px. Below this the week grid gets so tight that event
  // titles truncate, so the flags move above the calendar instead.
  const showRail = !isMobile && vw >= 1440;

  /* ---------- domain logic ---------- */
  const closureFor = (date) => closures.find((x) => x.date === date && !x.open) || null;
  const linkOf = (a) => {
    if (!a || !a.virtual) return null;
    const hm = hostMap[a.trainer] || {};
    if (hm[defaultProvider]) return { state: defaultProvider === "google" ? "pending" : "ok", provider: defaultProvider };
    const alt = Object.keys(hm)[0];
    if (alt) return { state: alt === "google" ? "pending" : "ok", provider: alt };
    return { state: "failed", provider: defaultProvider };
  };
  const capOf = (c) => (caps[c.id] != null ? caps[c.id] : c.cap);
  const enrollOf = (c, date) => {
    const key = c.id + "|" + date;
    if (enroll[key]) return enroll[key];
    const seed = hash(key);
    return { filled: Math.max(1, Math.min(capOf(c), c.base - 1 + (seed % 3))), wait: c.wait };
  };
  const setEnroll = (c, date, next) => setEnrollState((e) => ({ ...e, [c.id + "|" + date]: next }));
  const classInstances = (date) => {
    const cl = closureFor(date);
    if (cl && cl.effect === "all") return [];
    const dw = dowOf(date), out = [];
    CLASS_DEFS.forEach((c) => {
      if (paused.includes(c.id)) return;
      if (!c.dows.includes(dw)) return;
      if (c.from && (date < c.from || date > c.to)) return;
      if (!c.from && c.id === "fall") return;
      if (skipped.includes(c.id + "|" + date)) return;
      const en = enrollOf(c, date);
      out.push({ instance: true, id: c.id + "|" + date, classId: c.id, date, start: c.start, dur: c.dur, kind: c.kind, title: c.name, trainer: c.trainer, room: c.room, cap: capOf(c), filled: en.filled, wait: en.wait, waitlist: c.waitlist, status: "confirmed" });
    });
    return out;
  };
  const eventsOn = (date) => classInstances(date).concat(appts.concat(drafts).filter((a) => a.date === date));
  const hoursFor = (whoKey, date) => {
    const cl = closureFor(date);
    if (cl && cl.effect === "all") return [];
    let biz = hours.facility[dowOf(date)] || [];
    if (cl && cl.effect === "after") biz = biz.map((r) => [r[0], Math.min(r[1], cl.after)]).filter((r) => r[1] > r[0]);
    if (whoKey === "facility") return biz;
    const rows = (hours[whoKey] || [])[dowOf(date)] || [];
    const out = [];
    rows.forEach((r) => biz.forEach((b) => { const from = Math.max(r[0], b[0]), to = Math.min(r[1], b[1]); if (to > from) out.push([from, to]); }));
    return out;
  };
  const inHours = (w, date, start, dur) => hoursFor(w, date).some((h) => start >= h[0] && start + dur <= h[1]);
  const hoursText = (w, date) => {
    const h = hoursFor(w, date);
    return h.length ? h.map((r) => fmtT(r[0]) + "–" + fmtT(r[1])).join(", ") : "closed";
  };
  const freeRoomId = (cand, ignoreId) => {
    const evs = eventsOn(cand.date);
    const free = ROOMS.filter((r) => {
      if (r.id === cand.room) return false;
      return !evs.some((e) => e.room === r.id && e.id !== ignoreId && overlaps(cand.start, cand.start + cand.dur, e.start, e.start + e.dur));
    });
    return free.length ? free[0].id : "";
  };
  const freeRoom = (cand, ignoreId) => { const id = freeRoomId(cand, ignoreId); return id ? roomName(id) : "another time"; };

  function check(cand, ignoreId) {
    const out = [];
    const cl0 = closureFor(cand.date);
    if (cl0 && cl0.effect === "all") {
      out.push({ title: "The gym is closed that day", body: `${fmtLong(cand.date)} — ${cl0.name} on the facility calendar.` });
      return out;
    }
    if (!inHours("facility", cand.date, cand.start, cand.dur))
      out.push({ title: "Outside business hours", body: `The facility is open ${hoursText("facility", cand.date)} on ${DOW_FULL[dowOf(cand.date)]}.` });
    if (cand.trainer && !inHours(cand.trainer, cand.date, cand.start, cand.dur))
      out.push({ title: `Outside ${trainerName(cand.trainer).split(" ")[0]}'s hours`, body: `${trainerName(cand.trainer)} works ${hoursText(cand.trainer, cand.date)} that day. Booking here means an exception.` });
    eventsOn(cand.date).forEach((e) => {
      if (ignoreId && e.id === ignoreId) return;
      if (!overlaps(cand.start, cand.start + cand.dur, e.start, e.start + e.dur)) return;
      if (cand.trainer && e.trainer === cand.trainer)
        out.push({ title: `${trainerName(cand.trainer).split(" ")[0]} is already booked`, body: `${e.title} · ${range(e.start, e.dur)}${e.room ? " in " + roomName(e.room) : ""}.` });
      if (cand.room && e.room === cand.room) {
        const same = eventsOn(cand.date).filter((x) => x.room === cand.room && overlaps(cand.start, cand.start + cand.dur, x.start, x.start + x.dur) && x.id !== ignoreId);
        const classy = e.instance || e.kind === "group" || e.kind === "bootcamp" || cand.kind === "group" || cand.kind === "bootcamp";
        if (classy || same.length >= roomMax(cand.room))
          out.push({ title: `${roomName(cand.room)} is taken`, body: `${e.title} holds it ${range(e.start, e.dur)}.`, fixLabel: "Move to " + freeRoom(cand, ignoreId), fixRoom: freeRoomId(cand, ignoreId) });
      }
    });
    const seen = {}, dedup = [];
    out.forEach((o) => { if (!seen[o.title + o.body]) { seen[o.title + o.body] = 1; dedup.push(o); } });
    return dedup;
  }
  const openSlots = (trainer, date, dur) => {
    const out = [];
    hoursFor(trainer, date).forEach((h) => {
      for (let t = h[0]; t + dur <= h[1]; t += 0.5)
        if (check({ date, start: t, dur, trainer, room: "a", kind: "oneone" }).length === 0) out.push(t);
    });
    return out;
  };
  function statusOf(e) {
    const link = linkOf(e);
    if (link && link.state === "failed") return { label: "Link failed", tone: "danger" };
    if (link && link.state === "pending") return { label: "Link pending", tone: "brand" };
    const conf = check({ date: e.date, start: e.start, dur: e.dur, trainer: e.trainer, room: e.room, kind: e.kind }, e.id);
    if (conf.some((c) => c.title.includes("is taken"))) return { label: "Room clash", tone: "danger" };
    if (conf.some((c) => c.title.includes("already booked"))) return { label: "Coach clash", tone: "warn" };
    if (conf.length) return { label: "Outside hours", tone: "warn" };
    if (e.status === "unconfirmed") return { label: "Awaiting client", tone: "brand" };
    if (e.cap && e.filled >= e.cap) return { label: e.wait ? "Full · waitlist" : "Full", tone: "warn" };
    return { label: "Scheduled", tone: "success" };
  }

  const addAppt = (a) => setAppts((l) => l.concat([{ id: "n" + Date.now() + Math.round(Math.random() * 999), status: "confirmed", ...a }]));
  const removeAppt = (id) => setAppts((l) => l.filter((a) => a.id !== id));
  const patchAppt = (id, patch) => setAppts((l) => l.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  const weekDate = (dw) => addDays(weekStart, dw);

  function submitCreate() {
    const f = form, t = ctype;
    if (t === "group" || t === "series") {
      const date = t === "series" ? f.date : weekDate(f.dow);
      if (check({ date, start: f.start, dur: f.dur, trainer: f.trainer, room: f.room, kind: "group" }).length) { flash("Fix the conflict first"); return; }
      const reps = t === "series" ? 18 : 8;
      const list = [];
      for (let i = 0; i < reps; i++)
        list.push({ id: "c" + Date.now() + i, date: addDays(date, i * 7), start: f.start, dur: f.dur, kind: t === "series" ? "bootcamp" : "group", title: f.name, trainer: f.trainer, room: f.room, status: "confirmed", cap: f.cap, filled: 0, wait: 0 });
      setAppts((l) => l.concat(list)); setSheet(null); setWeekStart(mondayOf(date));
      flash(`${f.name} created · ${reps} sessions, cap ${f.cap}`);
      return;
    }
    const kind = t === "oneone" ? "oneone" : t === "room" ? "room" : "internal";
    const cand = { date: f.date, start: f.start, dur: f.dur, trainer: t === "room" ? "" : f.trainer, room: t === "internal" ? "" : f.room, kind };
    if (check(cand).length) { flash("Fix the conflict first"); return; }
    const title = t === "oneone" || t === "room" ? f.client : f.name;
    const n = f.repeat === "once" ? 1 : f.repeat === "weekly8" ? 8 : 4;
    const list = [];
    for (let i = 0; i < n; i++) list.push({ ...cand, id: "n" + Date.now() + i, status: "confirmed", date: addDays(f.date, i * 7), title });
    setAppts((l) => l.concat(list)); setSheet(null); setWeekStart(mondayOf(f.date));
    flash(`${title} · ${fmtShort(f.date)} ${fmtT(f.start)}${n > 1 ? " + " + (n - 1) + " more" : ""} booked`);
  }

  /* ---------- derived ---------- */
  const tabsDef = persona === "admin"
    ? [["week","Calendar"],["sessions","Sessions"],["classes","Classes & series"],["templates","Templates"],["sep","RESOURCES"],["coaches","Coaches"],["rooms","Rooms & resources"],["sep","CONFIGURE"],["providers","Providers"],["hostmap","Host mapping"],["hours","Hours & closures"]]
    : [["week","My week"],["sessions","Sessions"],["classes","My classes"],["sep","CONFIGURE"],["hours","My hours"]];
  const realTabs = tabsDef.filter((t) => t[0] !== "sep");
  const activeTab = realTabs.some((t) => t[0] === tab) ? tab : realTabs[0][0];

  const find = (s) => {
    if (!s) return null;
    if (s.instance) return classInstances(s.date).find((i) => i.id === s.id) || null;
    return appts.concat(drafts).find((a) => a.id === s.id) || null;
  };
  const ev = find(sel);

  /* week grid */
  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = addDays(weekStart, i);
    const hrs = hoursFor(persona === "admin" || trainerFilter === "all" ? "facility" : trainerFilter, date);
    let evs = eventsOn(date);
    if (trainerFilter !== "all") evs = evs.filter((e) => e.trainer === trainerFilter || (!e.trainer && e.kind === "room"));
    const cl = closureFor(date);
    const bizFull = hours.facility[dowOf(date)] || [];
    let hoursLabel = "";
    if (cl && cl.effect === "all") hoursLabel = "CLOSED";
    else if (cl && cl.effect === "after") hoursLabel = "CLOSES " + fmtT(cl.after).replace(":00 ", "");
    else if (bizFull.length && bizFull[0][1] - bizFull[0][0] < 10) hoursLabel = "SHORT HRS";
    days.push({ date, dow: DOWS[i], dom: String(toDate(date).getDate()), isToday: date === TODAY, hoursLabel, closedLabel: hrs.length === 0 ? (cl ? "CLOSED" : "OFF") : "", events: evs });
  }

  /* stats */
  let n11 = 0, nGroup = 0, seats = 0, filledN = 0, openH = 0;
  for (let i = 0; i < 7; i++) {
    const date = addDays(weekStart, i);
    eventsOn(date).forEach((e) => {
      if (e.trainer !== me && e.kind !== "room") return;
      if (e.kind === "oneone") n11++;
      if (e.cap) { nGroup++; seats += e.cap; filledN += e.filled; }
    });
    openH += openSlots(me, date, 1).length * 0.5;
  }
  const stats = [
    { value: String(n11), label: "1:1 sessions" },
    { value: String(nGroup), label: "group sessions" },
    { value: (seats ? Math.round((filledN / seats) * 100) : 0) + "%", label: "seats filled" },
    { value: openH.toFixed(1) + "h", label: "bookable hours open" },
  ];

  /* flags */
  const flags = [];
  for (let i = 0; i < 7 && flags.length < 4; i++) {
    const date = addDays(weekStart, i);
    classInstances(date).forEach((inst) => {
      if (dismissed.includes(inst.id) || inst.trainer !== me || flags.length >= 4) return;
      if (inst.wait > 0) {
        flags.push({
          title: `${inst.wait} waitlisted for ${DOW_FULL[dowOf(date)]} ${inst.title}`,
          body: `${roomName(inst.room)} holds more than ${inst.cap}. Raising the cap clears the list.`,
          primary: `Raise cap to ${inst.cap + inst.wait}`,
          act: () => {
            setCaps((c) => ({ ...c, [inst.classId]: inst.cap + inst.wait }));
            setEnroll({ id: inst.classId }, date, { filled: inst.filled + inst.wait, wait: 0 });
            flash(`Cap raised to ${inst.cap + inst.wait} · ${inst.wait} promoted from the waitlist`);
          },
          dismiss: () => setDismissed((d) => d.concat([inst.id])),
        });
      } else if (inst.filled <= inst.cap - 2) {
        flags.push({
          title: `${DOW_FULL[dowOf(date)]} ${fmtT(inst.start)} is ${inst.filled} of ${inst.cap}`,
          body: `${inst.title} in ${roomName(inst.room)} has ${inst.cap - inst.filled} seats two days out.`,
          primary: `Invite ${inst.cap - inst.filled} clients`,
          act: () => { setEnroll({ id: inst.classId }, date, { filled: inst.cap, wait: 0 }); flash(`Invites sent · ${inst.title} is full`); },
          dismiss: () => setDismissed((d) => d.concat([inst.id])),
        });
      }
    });
  }
  appts.forEach((a) => {
    if (a.status !== "unconfirmed" || flags.length >= 4) return;
    if (a.date < weekStart || a.date > addDays(weekStart, 6) || dismissed.includes(a.id)) return;
    flags.push({
      title: `${a.title.split(" ")[0]} has not confirmed`,
      body: `${fmtShort(a.date)} ${fmtT(a.start)} · invited 4 days ago, no reply.`,
      primary: "Send reminder",
      act: () => { patchAppt(a.id, { status: "confirmed" }); flash(`Reminder sent to ${a.title}`); },
      dismiss: () => setDismissed((d) => d.concat([a.id])),
    });
  });

  /* draft next week */
  const weekHasAppts = appts.some((a) => a.date >= weekStart && a.date <= addDays(weekStart, 6));
  const draftsHere = drafts.filter((d) => d.date >= weekStart && d.date <= addDays(weekStart, 6));
  const canDraft = !weekHasAppts && draftsHere.length === 0 && weekStart !== WEEK0;
  const canApprove = draftsHere.length > 0;
  let banner = "";
  if (canDraft) banner = `Nothing on the books that week. I can lay it out from the week of ${fmtDate(WEEK0)} — same clients, same times, your hours only.`;
  else if (canApprove) banner = `Drafted ${draftsHere.length} sessions from your usual pattern. Nothing is live until you approve.`;

  const draftWeek = () => {
    const base = appts.filter((a) => a.date >= WEEK0 && a.date <= addDays(WEEK0, 6) && a.trainer === me && a.kind !== "internal");
    const shift = Math.round((toDate(weekStart) - toDate(WEEK0)) / 86400000);
    const out = [];
    base.forEach((a, i) => {
      const date = addDays(a.date, shift);
      if (check({ date, start: a.start, dur: a.dur, trainer: a.trainer, room: a.room, kind: a.kind }).length) return;
      out.push({ ...a, id: "d" + i, date, draft: true, status: "draft" });
    });
    setDrafts(out);
    flash(`Drafted ${out.length} sessions · nothing is live yet`);
  };

  /* facility day */
  const dayEvents = eventsOn(day);
  const resources = TRAINERS.map((t) => ({ name: t.name, kind: "Trainer", id: t.id, type: "trainer" }))
    .concat(ROOMS.map((r) => ({ name: r.name, kind: "Room · " + r.cap.toLowerCase(), id: r.id, type: "room" })))
    .map((r) => ({ ...r, events: dayEvents.filter((e) => (r.type === "trainer" ? e.trainer === r.id : e.room === r.id)) }));
  const dayConflicts = [];
  dayEvents.forEach((e) => {
    check({ date: e.date, start: e.start, dur: e.dur, trainer: e.trainer, room: e.room, kind: e.kind }, e.id).forEach((c) => {
      if (dayConflicts.length >= 3) return;
      if (dayConflicts.some((x) => x.title === c.title + " · " + range(e.start, e.dur))) return;
      dayConflicts.push({
        title: `${c.title} · ${range(e.start, e.dur)}`,
        body: `${e.title} and the other booking both hold it. Milton will not move either without your call.`,
        fixLabel: e.instance ? `Skip this ${e.title}` : `Move ${e.title} to ${freeRoom(e, e.id)}`,
        fix: () => {
          if (e.instance) { setSkipped((s) => s.concat([e.id])); flash(`${e.title} cancelled for ${fmtShort(e.date)}`); }
          else { const rid = freeRoomId(e, e.id); if (!rid) { flash("No room is free then"); return; } patchAppt(e.id, { room: rid }); flash(`${e.title} moved to ${roomName(rid)}`); }
        },
        open: () => { setSel({ id: e.id, date: e.date, instance: !!e.instance }); setSheet("detail"); },
      });
    });
  });

  /* classes */
  const classRows = CLASS_DEFS.map((c) => {
    const isPaused = paused.includes(c.id);
    const cap = capOf(c);
    let nextDate = null;
    for (let i = 0; i < 40 && !nextDate; i++) {
      const d = addDays(TODAY, i);
      if (classInstances(d).some((x) => x.classId === c.id)) nextDate = d;
    }
    const en = nextDate ? enrollOf(c, nextDate) : { filled: 0, wait: c.wait };
    return { c, isPaused, cap, nextDate, en };
  });

  /* hours rows */
  const whoKey = persona === "admin" ? who : who === "facility" ? "facility" : me;
  const timeOptions = [];
  for (let x = 5; x <= 21; x += 0.5) timeOptions.push({ v: String(x), label: fmtT(x) });
  const patchHours = (dayIdx, slotIdx, field, val) =>
    setHours((h) => ({ ...h, [whoKey]: h[whoKey].map((d, j) => j !== dayIdx ? d : d.map((s, k) => { if (k !== slotIdx) return s; const n = s.slice(); n[field] = val; return n[1] > n[0] ? n : s; })) }));

  /* rooms */
  const roomRows = ROOMS.map((r) => {
    let booked = 0, open = 0, count = 0;
    for (let i = 0; i < 7; i++) {
      const date = addDays(weekStart, i);
      hoursFor("facility", date).forEach((h) => { open += h[1] - h[0]; });
      eventsOn(date).forEach((e) => { if (e.room === r.id) { booked += e.dur; count++; } });
    }
    const pct = open ? Math.round((booked / open) * 100) : 0;
    return { r, pct, count };
  });

  /* sessions */
  const sessionRows = [];
  for (let i = 0; i < 14 && sessionRows.length < 14; i++) {
    const date = addDays(TODAY, i);
    eventsOn(date).sort((a, b) => a.start - b.start).forEach((e) => {
      if (sessionRows.length >= 14 || e.kind === "block") return;
      if (sessCoach !== "all" && e.trainer !== sessCoach) return;
      if (sessType !== "all" && e.kind !== sessType) return;
      sessionRows.push({ e, date, st: statusOf(e), lk: linkOf(e) });
    });
  }

  /* create sheet form fields */
  const conflicts = sheet === "create" ? check((() => {
    const f = form, t = ctype;
    if (t === "group") return { date: weekDate(f.dow), start: f.start, dur: f.dur, trainer: f.trainer, room: f.room, kind: "group" };
    if (t === "series") return { date: f.date, start: f.start, dur: f.dur, trainer: f.trainer, room: f.room, kind: "bootcamp" };
    if (t === "room") return { date: f.date, start: f.start, dur: f.dur, trainer: f.trainer, room: f.room, kind: "room" };
    if (t === "internal") return { date: f.date, start: f.start, dur: f.dur, trainer: f.who === "all" ? "alex" : f.who, room: "", kind: "internal" };
    return { date: f.date, start: f.start, dur: f.dur, trainer: f.trainer, room: f.room, kind: "oneone" };
  })()) : [];

  function buildFields() {
    const f = form, t = ctype;
    const timeOpts = []; for (let x = 5; x <= 20.5; x += 0.5) timeOpts.push({ v: String(x), label: fmtT(x) });
    const dayOpts = []; for (let i = 0; i < 21; i++) { const d = addDays(TODAY, i - 2); dayOpts.push({ v: d, label: fmtShort(d) }); }
    const durOpts = [{ v: "0.5", label: "30 min" }, { v: "0.75", label: "45 min" }, { v: "1", label: "60 min" }, { v: "1.5", label: "90 min" }];
    const trainerOpts = TRAINERS.map((x) => ({ v: x.id, label: x.name }));
    const roomOpts = ROOMS.map((x) => ({ v: x.id, label: x.name }));
    const clientOpts = CLIENTS.map((c) => ({ v: c, label: c }));
    const numKeys = ["start", "dur", "cap", "dow"];
    const sel_ = (label, key, value, options, hint) => ({
      label, isSelect: true, value: String(value), options, hint,
      onChange: (e) => patchForm({ [key]: numKeys.includes(key) ? +e.target.value : e.target.value }),
    });
    if (t === "oneone") return [
      sel_("Client", "client", f.client, clientOpts),
      sel_("Trainer", "trainer", f.trainer, trainerOpts),
      sel_("Day", "date", f.date, dayOpts),
      sel_("Start", "start", f.start, timeOpts, hoursText(f.trainer, f.date) === "closed" ? "off that day" : "works " + hoursText(f.trainer, f.date)),
      sel_("Length", "dur", f.dur, durOpts),
      sel_("Room", "room", f.room, roomOpts),
      sel_("Repeat", "repeat", f.repeat, [{ v: "once", label: "Just once" }, { v: "weekly4", label: "Weekly ×4" }, { v: "weekly8", label: "Weekly ×8" }]),
    ];
    if (t === "group" || t === "series") return [
      { label: "Name", isText: true, value: f.name, onChange: (e) => patchForm({ name: e.target.value }) },
      t === "series"
        ? sel_("First date", "date", f.date, dayOpts, "18 dates, one enrollment")
        : sel_("Repeats on", "dow", f.dow, DOW_FULL.map((d, i) => ({ v: String(i), label: d + "s" })), "weekly, 8 weeks out"),
      sel_("Start", "start", f.start, timeOpts),
      sel_("Length", "dur", f.dur, durOpts),
      { label: "Cap", isStep: true, stepValue: f.cap, hint: "seats per session", dec: () => patchForm({ cap: Math.max(2, f.cap - 1) }), inc: () => patchForm({ cap: Math.min(24, f.cap + 1) }) },
      sel_("Room", "room", f.room, roomOpts, roomName(f.room) + " " + ROOMS.find((r) => r.id === f.room).cap.toLowerCase()),
      sel_("Trainer", "trainer", f.trainer, trainerOpts),
      { label: "Waitlist", isSeg: true, segs: [["Off", false], ["On · auto-promote", true]].map((o) => ({ label: o[0], active: f.waitlist === o[1], onClick: () => patchForm({ waitlist: o[1] }) })) },
    ];
    if (t === "room") return [
      sel_("Room", "room", f.room, roomOpts),
      sel_("Client", "client", f.client, clientOpts),
      sel_("Day", "date", f.date, dayOpts),
      sel_("Start", "start", f.start, timeOpts),
      sel_("Length", "dur", f.dur, durOpts),
      sel_("Staffed by", "trainer", f.trainer, [{ v: "", label: "Unstaffed (self-serve)" }].concat(trainerOpts)),
    ];
    return [
      { label: "Title", isText: true, value: f.name, onChange: (e) => patchForm({ name: e.target.value }) },
      sel_("With", "who", f.who, [{ v: "all", label: "All trainers" }].concat(TRAINERS.map((t2) => ({ v: t2.id, label: t2.name })))),
      sel_("Day", "date", f.date, dayOpts),
      sel_("Start", "start", f.start, timeOpts),
      sel_("Length", "dur", f.dur, durOpts),
    ];
  }

  /* detail sheet */
  let detailRows = [], detailActions = [], roster = [], detailNote = "", hasRoster = false;
  if (ev) {
    detailRows.push({ label: "Trainer", value: trainerName(ev.trainer) || "Unstaffed" });
    detailRows.push({ label: "Where", value: ev.virtual ? "Virtual" : roomName(ev.room) });
    if (ev.virtual) {
      const lk = linkOf(ev);
      const pname = (PROVIDERS.find((p) => p.id === lk.provider) || {}).name;
      detailRows.push({ label: "Meeting link", value: lk.state === "ok" ? pname + " · ready" : lk.state === "pending" ? pname + " · pending" : "Failed — no host" });
    }
    if (ev.cap) detailRows.push({ label: "Seats", value: `${ev.filled} of ${ev.cap}${ev.wait ? " · " + ev.wait + " waitlisted" : ""}` });
    detailRows.push({ label: "Status", value: ev.status === "unconfirmed" ? "Awaiting client" : ev.draft ? "Draft" : "Confirmed" });
    const conf = check({ date: ev.date, start: ev.start, dur: ev.dur, trainer: ev.trainer, room: ev.room, kind: ev.kind }, ev.id);
    if (conf.length) detailNote = conf[0].title + " — " + conf[0].body;
    if (ev.cap) {
      hasRoster = true;
      for (let i = 0; i < ev.filled; i++) {
        const nm = CLIENTS[(hash(ev.id) + i * 5) % CLIENTS.length];
        roster.push({ name: nm, tag: "Enrolled", enrolled: true, action: "Remove", act: () => { setEnroll({ id: ev.classId }, ev.date, { filled: ev.filled - 1, wait: ev.wait }); flash("Removed · seat opened"); } });
      }
      for (let w = 0; w < (ev.wait || 0); w++) {
        const nm = CLIENTS[(hash(ev.id) + 70 + w * 3) % CLIENTS.length];
        roster.push({ name: nm, tag: "Waitlist #" + (w + 1), enrolled: false, action: "Promote", act: () => {
          if (ev.filled >= ev.cap) setCaps((c) => ({ ...c, [ev.classId]: ev.cap + 1 }));
          setEnroll({ id: ev.classId }, ev.date, { filled: ev.filled + 1, wait: ev.wait - 1 });
          flash(`${nm} promoted into the class`);
        } });
      }
      detailActions.push({ label: "Cancel this session", kind: "danger", onClick: () => { setSkipped((s) => s.concat([ev.id])); setSheet(null); flash(`${ev.title} cancelled for ${fmtShort(ev.date)}`); } });
      detailActions.push({ label: "Message the room", kind: "secondary", onClick: () => flash(`Draft sent to your inbox for ${ev.filled} clients`) });
    } else {
      if (ev.status === "unconfirmed") detailActions.push({ label: "Confirm", kind: "primary", onClick: () => { patchAppt(ev.id, { status: "confirmed" }); flash(`${ev.title} confirmed`); } });
      detailActions.push({ label: "Push 30 min", kind: "secondary", onClick: () => {
        const c = check({ date: ev.date, start: ev.start + 0.5, dur: ev.dur, trainer: ev.trainer, room: ev.room, kind: ev.kind }, ev.id);
        if (c.length) { flash(c[0].title); return; }
        patchAppt(ev.id, { start: ev.start + 0.5 }); flash("Moved to " + fmtT(ev.start + 0.5));
      } });
      detailActions.push({ label: "Next day, same time", kind: "secondary", onClick: () => {
        const c = check({ date: addDays(ev.date, 1), start: ev.start, dur: ev.dur, trainer: ev.trainer, room: ev.room, kind: ev.kind }, ev.id);
        if (c.length) { flash(c[0].title); return; }
        patchAppt(ev.id, { date: addDays(ev.date, 1) }); flash("Moved to " + fmtShort(addDays(ev.date, 1)));
      } });
      detailActions.push({ label: "Cancel", kind: "danger", onClick: () => { removeAppt(ev.id); setSheet(null); flash(`${ev.title} cancelled · client notified`); } });
    }
  }

  const miltonLine = persona === "admin"
    ? (dayConflicts.length ? dayConflicts[0].title + ". Recovery is the least used room this week." : "No room conflicts today. Recovery is the least used room this week.")
    : (flags.length ? flags[0].title + ". " + flags[0].body : "Week looks clean — every class is filling and nothing is unconfirmed.");

  /* ---------- render helpers ---------- */
  const PAD = narrow ? 16 : 28;

  const EventBlock = ({ e, ghost }) => {
    const conflict = check({ date: e.date, start: e.start, dur: e.dur, trainer: e.trainer, room: e.room, kind: e.kind }, e.id).length > 0 && !e.draft;
    const short = e.dur < 0.7;
    const tight = !!e.cap && e.dur < 1;
    let meta = e.instance ? roomName(e.room) : e.kind === "oneone" ? "1:1 · " + roomName(e.room) : e.kind === "room" ? roomName(e.room) : e.kind === "block" ? "Not bookable" : "Internal";
    if (tight) meta = `${e.filled}/${e.cap}`;
    if (e.status === "unconfirmed") meta = "Unconfirmed";
    if (e.draft) meta = "Draft";
    const st = evStyle(e, !!e.draft || !!ghost, conflict);
    if (tight && e.filled >= e.cap && !e.draft && !conflict) { st.background = W_BG; st.borderLeft = `3px solid ${W_MID}`; }
    const full = e.cap && e.filled >= e.cap && e.dur >= 1;
    return (
      <button style={st} onClick={() => { setSel({ id: e.id, date: e.date, instance: !!e.instance }); setSheet("detail"); }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4, minWidth: 0 }}>
          {(e.status === "unconfirmed" || conflict || (tight && !!e.wait)) && <span style={{ width: 5, height: 5, borderRadius: 999, flex: "0 0 5px", background: conflict ? D_MID : W_MID }} />}
          <span style={{ fontSize: 11.5, fontWeight: 600, color: FG1, lineHeight: 1.25, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.title}</span>
        </div>
        {!short && <span style={{ flex: "0 0 auto", fontSize: tight ? 9.5 : 10.5, fontWeight: tight ? 700 : 400, color: tight && e.filled >= e.cap ? W_FG : FG3, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{meta}</span>}
        {full && <span style={{ alignSelf: "flex-start", marginTop: "auto", fontSize: 8.5, fontWeight: 700, letterSpacing: ".06em", padding: "2px 6px", borderRadius: 999, background: W_BG, color: W_FG }}>{e.wait ? `FULL · +${e.wait} WAIT` : "FULL"}</span>}
        {e.cap && e.filled < e.cap && e.dur >= 1 && (
          <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ flex: 1, height: 3, borderRadius: 999, background: "rgba(11,20,23,.08)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(e.filled / e.cap) * 100}%`, background: KIND[e.kind].bar }} />
            </div>
            <span style={{ fontSize: 8.5, fontWeight: 700, color: FG3, fontFamily: MONO }}>{e.filled}/{e.cap}</span>
          </div>
        )}
      </button>
    );
  };

  /* ---------- panels ---------- */
  function WeekPanel() {
    return (
      <div style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 14 }}>
          {/* week nav */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <button style={{ ...btn("secondary"), padding: "7px 11px" }} onClick={() => setWeekStart(addDays(weekStart, -7))}>‹</button>
            <div style={{ fontSize: 14, fontWeight: 600, color: FG1, minWidth: narrow ? 0 : 190 }}>{narrow ? `${fmtDate(weekStart)}–${fmtDate(addDays(weekStart, 6))}` : `${fmtDate(weekStart)} – ${fmtDate(addDays(weekStart, 6))}, 2026`}</div>
            <button style={{ ...btn("secondary"), padding: "7px 11px" }} onClick={() => setWeekStart(addDays(weekStart, 7))}>›</button>
            <button style={{ ...btn("secondary"), padding: "7px 13px" }} onClick={() => setWeekStart(WEEK0)}>This week</button>
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <Select value={trainerFilter} onChange={(e) => setTrainerFilter(e.target.value)} options={[{ v: "alex", label: "Alex Reyes (you)" }, { v: "dana", label: "Dana Kim" }, { v: "priya", label: "Priya Shah" }, { v: "all", label: "Everyone" }]} />
              <button style={btn("primary")} onClick={() => openCreate({ date: TODAY, start: 16 }, "oneone")}>+ Book</button>
            </div>
          </div>

          {/* draft banner */}
          {banner && (
            <div style={{ background: T050, border: `1px solid ${T200}`, borderRadius: 12, padding: "13px 16px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 220, fontSize: 12.5, color: T800, lineHeight: 1.5 }}>{banner}</div>
              {canDraft && <button style={btn("primary")} onClick={draftWeek}>Draft it</button>}
              {canApprove && <>
                <button style={btn("primary")} onClick={() => { setAppts((l) => l.concat(drafts.map((d) => ({ ...d, draft: false, status: "confirmed" })))); setDrafts([]); flash(`${draftsHere.length} sessions confirmed and pushed to Google Calendar`); }}>Approve all {draftsHere.length}</button>
                <button style={btn("secondary")} onClick={() => { setDrafts([]); flash("Draft discarded"); }}>Discard</button>
              </>}
            </div>
          )}

          {/* grid */}
          <Card style={{ overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: `52px repeat(7, minmax(0,1fr))`, borderBottom: `1px solid ${B_SUB}` }}>
              <div />
              {days.map((d) => (
                <div key={d.date} style={{ textAlign: "center", padding: "9px 2px 7px", borderLeft: `1px solid ${B_SUB}` }}>
                  <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: ".08em", color: FG4 }}>{d.dow}</div>
                  <div style={{ fontSize: 17, fontWeight: 700, fontFamily: MONO, marginTop: 2, color: d.isToday ? WHITE : FG1, ...(d.isToday ? { background: T800, borderRadius: 999, width: 28, height: 28, display: "inline-flex", alignItems: "center", justifyContent: "center" } : {}) }}>{d.dom}</div>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".08em", marginTop: 3, height: 12, color: d.hoursLabel === "CLOSED" ? D_FG : W_FG }}>{d.hoursLabel}</div>
                </div>
              ))}
            </div>
            <div style={{ maxHeight: 520, overflowY: "auto" }}>
              <div style={{ display: "grid", gridTemplateColumns: `52px repeat(7, minmax(0,1fr))`, position: "relative" }}>
                <div style={{ position: "relative", height: (DAY_END - DAY_START) * ROW }}>
                  {HOURS.map((h, i) => (
                    <div key={h} style={{ position: "absolute", top: i * ROW + 3, right: 8, fontSize: 9.5, fontWeight: 600, color: FG4, fontFamily: MONO }}>{h}</div>
                  ))}
                </div>
                {days.map((d) => (
                  <div key={d.date} style={{ position: "relative", height: (DAY_END - DAY_START) * ROW, borderLeft: `1px solid ${B_SUB}`, background: d.closedLabel ? INK100 : "transparent" }}>
                    {HOURS.map((_, h) => (
                      <div key={h} onClick={() => openCreate({ date: d.date, start: DAY_START + h, trainer: trainerFilter === "all" ? "alex" : trainerFilter }, "oneone")}
                        style={{ position: "absolute", left: 0, right: 0, top: h * ROW, height: ROW, borderTop: `1px solid ${B_SUB}`, cursor: "pointer", zIndex: 1 }} />
                    ))}
                    {d.closedLabel && <div style={{ position: "absolute", top: 8, left: 0, right: 0, textAlign: "center", fontSize: 9, fontWeight: 700, letterSpacing: ".08em", color: FG4 }}>{d.closedLabel}</div>}
                    {d.events.filter((e) => e.kind === "room" && roomBuffer(e.room)).map((e) => (
                      <div key={"b" + e.id} style={{ position: "absolute", left: 3, right: 3, top: (e.start + e.dur - DAY_START) * ROW + 1, height: (roomBuffer(e.room) / 60) * ROW - 2, borderRadius: 5, border: `1px dashed ${KIND.room.bar}`, background: "repeating-linear-gradient(135deg, rgba(139,92,246,.07) 0 5px, rgba(139,92,246,.16) 5px 10px)", fontSize: 8.5, fontWeight: 700, letterSpacing: ".06em", color: KIND.room.bar, display: "flex", alignItems: "center", paddingLeft: 5, overflow: "hidden", zIndex: 3 }}>△ BUFFER</div>
                    ))}
                    {d.events.map((e) => <EventBlock key={e.id} e={e} />)}
                    {d.isToday && <div style={{ position: "absolute", left: 0, right: 0, top: (NOW - DAY_START) * ROW, borderTop: `2px solid ${D_MID}`, zIndex: 5 }} />}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  function FacilityPanel() {
    // Narrower gutter than the mockup's 130px, and columns that can shrink, so
    // the default 5 resources fit the card without a horizontal scrollbar.
    // Past ~7 resources the min kicks in and overflowX takes over.
    const RES_COLS = `52px repeat(${resources.length}, minmax(84px,1fr))`;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <button style={{ ...btn("secondary"), padding: "7px 11px" }} onClick={() => setDay(addDays(day, -1))}>‹</button>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: FG1 }}>{fmtLong(day)}</div>
            <div style={{ fontSize: 11, color: FG3, marginTop: 1 }}>Facility {hoursText("facility", day)} · {TRAINERS.length} trainers · {ROOMS.length} rooms · {dayEvents.length} bookings</div>
          </div>
          <button style={{ ...btn("secondary"), padding: "7px 11px" }} onClick={() => setDay(addDays(day, 1))}>›</button>
          <button style={{ ...btn("secondary"), padding: "7px 13px" }} onClick={() => setDay(TODAY)}>Today</button>
          <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 999, background: dayConflicts.length ? D_BG : S_BG, color: dayConflicts.length ? D_FG : S_FG }}>
            {dayConflicts.length ? `${dayConflicts.length} conflict${dayConflicts.length > 1 ? "s" : ""}` : "No conflicts"}
          </span>
          <button style={btn("primary")} onClick={() => openCreate({ date: day, start: 16 }, "oneone")}>+ Book</button>
        </div>

        {dayConflicts.map((c, i) => (
          <div key={i} style={{ background: D_BG, border: `1px solid ${D_MID}33`, borderRadius: 12, padding: "12px 15px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: D_FG }}>{c.title}</div>
              <div style={{ fontSize: 11.5, color: FG2, marginTop: 3, lineHeight: 1.45 }}>{c.body}</div>
            </div>
            <button style={{ ...btn("secondary"), fontSize: 11.5, padding: "7px 13px" }} onClick={c.fix}>{c.fixLabel}</button>
            <button style={{ border: 0, background: "transparent", color: D_FG, fontFamily: "inherit", fontSize: 11.5, fontWeight: 600, cursor: "pointer" }} onClick={c.open}>Open</button>
          </div>
        ))}

        <Card style={{ overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            {/* No minWidth: the columns flex to fit the card so the admin grid
                does not get its own horizontal scrollbar at normal widths. */}
            <div>
              <div style={{ display: "grid", gridTemplateColumns: RES_COLS, borderBottom: `1px solid ${B_SUB}` }}>
                <div />
                {resources.map((r) => (
                  <div key={r.id + r.type} style={{ padding: "9px 8px", borderLeft: `1px solid ${B_SUB}` }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: FG1 }}>{r.name}</div>
                    <div style={{ fontSize: 9.5, color: FG4, marginTop: 1 }}>{r.kind}</div>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ display: "grid", gridTemplateColumns: RES_COLS }}>
                  <div style={{ position: "relative", height: (DAY_END - DAY_START) * ROW }}>
                    {HOURS.map((h, i) => (
                      <div key={h} style={{ position: "absolute", top: i * ROW + 3, right: 8, fontSize: 9.5, fontWeight: 600, color: FG4, fontFamily: MONO }}>{h}</div>
                    ))}
                  </div>
                  {resources.map((r) => (
                    <div key={r.id + r.type} style={{ position: "relative", height: (DAY_END - DAY_START) * ROW, borderLeft: `1px solid ${B_SUB}` }}>
                      {HOURS.map((_, h) => (
                        <div key={h} onClick={() => openCreate({ date: day, start: DAY_START + h, ...(r.type === "trainer" ? { trainer: r.id } : { room: r.id }) }, "oneone")}
                          style={{ position: "absolute", left: 0, right: 0, top: h * ROW, height: ROW, borderTop: `1px solid ${B_SUB}`, cursor: "pointer", zIndex: 1 }} />
                      ))}
                      {r.events.map((e) => <EventBlock key={e.id + r.id} e={e} />)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  function SessionsPanel() {
    const cols = narrow ? "minmax(0,1.6fr) 96px 92px" : "minmax(0,1.5fr) 100px minmax(0,1.1fr) minmax(0,1fr) 56px 106px";
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <Select value={sessCoach} onChange={(e) => setSessCoach(e.target.value)} options={[{ v: "all", label: "All coaches" }].concat(TRAINERS.map((t) => ({ v: t.id, label: t.name })))} />
          <Select value={sessType} onChange={(e) => setSessType(e.target.value)} options={[{ v: "all", label: "All types" }, { v: "oneone", label: "1:1 sessions" }, { v: "group", label: "Group classes" }, { v: "bootcamp", label: "Bootcamps" }, { v: "room", label: "Room bookings" }, { v: "internal", label: "Internal" }]} />
          <span style={{ marginLeft: "auto", fontSize: 11.5, color: FG3 }}>{sessionRows.length} sessions</span>
        </div>
        <Card style={{ overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: cols, gap: 12, padding: "10px 16px", background: PAGE_BG }}>
            <Eyebrow>Session</Eyebrow><Eyebrow>When</Eyebrow>
            {!narrow && <><Eyebrow>Coach</Eyebrow><Eyebrow>Where</Eyebrow><Eyebrow>Enroll</Eyebrow></>}
            <Eyebrow>Status</Eyebrow>
          </div>
          {sessionRows.map(({ e, date, st, lk }, i) => (
            <div key={e.id + date + i} role="button" tabIndex={0} onClick={() => { setSel({ id: e.id, date: e.date, instance: !!e.instance }); setSheet("detail"); }}
              style={{ display: "grid", gridTemplateColumns: cols, gap: 12, padding: "11px 16px", borderTop: `1px solid ${B_SUB}`, alignItems: "center", cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
                <span style={{ width: 9, height: 9, borderRadius: 999, flex: "0 0 9px", background: KIND[e.kind].bar }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: FG1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.title}</span>
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 11.5, color: FG2, fontFamily: MONO, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{fmtShort(date)}</div>
                <div style={{ fontSize: 11, color: FG3, fontFamily: MONO, whiteSpace: "nowrap", marginTop: 2 }}>{fmtT(e.start)}</div>
              </div>
              {!narrow && <>
                <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
                  <span style={avatarStyle(e.trainer)}>{initials(trainerName(e.trainer) || "S S")}</span>
                  <span style={{ fontSize: 12, color: FG2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{trainerName(e.trainer) || "Self-serve"}</span>
                </div>
                <span style={{ fontSize: 12, color: FG2, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.virtual ? (PROVIDERS.find((p) => p.id === lk.provider) || {}).name : roomName(e.room)}</span>
                <span style={{ fontSize: 12, color: FG2, fontFamily: MONO, whiteSpace: "nowrap" }}>{e.cap ? `${e.filled}/${e.cap}` : "1:1"}</span>
              </>}
              <div style={{ display: "flex", justifyContent: "flex-start", minWidth: 0 }}>
                <span style={{ ...tone(st.tone), whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>{st.label}</span>
              </div>
            </div>
          ))}
          <div style={{ padding: "11px 16px", borderTop: `1px solid ${B_SUB}`, fontSize: 11.5, color: FG3, lineHeight: 1.5 }}>
            Showing the next 14 days. Clashes and link errors are computed from live hours, rooms and host mappings — nothing here is hand-kept.
          </div>
        </Card>
      </div>
    );
  }

  function ClassesPanel() {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 12.5, color: FG2, flex: 1 }}>Caps and waitlists for every recurring class. Changing a cap changes what clients can book immediately.</div>
          <button style={btn("primary")} onClick={() => openCreate({}, "group")}>+ New class</button>
        </div>
        {classRows.map(({ c, isPaused, cap, nextDate, en }) => (
          <Card key={c.id} style={{ padding: "16px 18px", display: "grid", gridTemplateColumns: narrow ? "1fr" : "minmax(0,2fr) minmax(0,1.4fr) 190px 170px", gap: 18, alignItems: "center", opacity: isPaused ? 0.6 : 1 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 9, height: 9, borderRadius: 999, flex: "0 0 9px", background: KIND[c.kind].bar }} />
                <span style={{ fontSize: 13.5, fontWeight: 600, color: FG1 }}>{c.name}</span>
                <span style={{ fontSize: 10.5, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: KIND[c.kind].bg, color: KIND[c.kind].bar }}>{c.from ? "Series · 18 dates" : "Weekly"}</span>
                {isPaused && <span style={tone("neutral")}>Paused</span>}
              </div>
              <div style={{ fontSize: 11.5, color: FG3, marginTop: 5 }}>{trainerName(c.trainer)} · {c.waitlist ? "waitlist on" : "no waitlist"}</div>
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, color: FG1 }}>{(c.from ? fmtDate(c.from) + " – " + fmtDate(c.to) + " · " : "") + c.dows.map((d) => DOWS[d].charAt(0) + DOWS[d].slice(1, 3).toLowerCase()).join(", ")} · {fmtT(c.start)}</div>
              <div style={{ fontSize: 11.5, color: FG3, marginTop: 3 }}>{roomName(c.room)} · {c.dur * 60} min</div>
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Eyebrow style={{ flex: 1 }}>Cap</Eyebrow>
                <button style={stepBtn} onClick={() => { setCaps((x) => ({ ...x, [c.id]: Math.max(2, cap - 1) })); flash(`${c.name} cap ${Math.max(2, cap - 1)}`); }}>−</button>
                <span style={{ fontSize: 14, fontWeight: 700, fontFamily: MONO, minWidth: 22, textAlign: "center", color: FG1 }}>{cap}</span>
                <button style={stepBtn} onClick={() => { setCaps((x) => ({ ...x, [c.id]: Math.min(24, cap + 1) })); flash(`${c.name} cap ${Math.min(24, cap + 1)}`); }}>+</button>
              </div>
              <div style={{ marginTop: 8 }}><Bar pct={(en.filled / cap) * 100} color={KIND[c.kind].bar} /></div>
              <div style={{ fontSize: 11, color: FG3, marginTop: 5 }}>{nextDate ? `Next ${fmtShort(nextDate)} · ${en.filled} of ${cap}${en.wait ? " · " + en.wait + " waitlisted" : ""}` : "No upcoming dates"}</div>
            </div>
            <div style={{ display: "flex", gap: 7, justifyContent: narrow ? "flex-start" : "flex-end" }}>
              <button style={{ ...btn("secondary"), fontSize: 11.5, padding: "7px 13px" }} onClick={() => { if (!nextDate) { flash("No upcoming dates"); return; } setSel({ id: c.id + "|" + nextDate, date: nextDate, instance: true }); setSheet("detail"); }}>Roster</button>
              <button style={{ ...btn("secondary"), fontSize: 11.5, padding: "7px 13px" }} onClick={() => { setPaused((p) => isPaused ? p.filter((x) => x !== c.id) : p.concat([c.id])); flash(`${c.name}${isPaused ? " resumed" : " paused · removed from the calendar"}`); }}>{isPaused ? "Resume" : "Pause"}</button>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  function TemplatesPanel() {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 12.5, color: FG2, flex: 1 }}>Templates prefill the create form. They are shortcuts, not schedule entries.</div>
          <button style={btn("secondary")} onClick={() => flash("New template: name it, then it appears in Create")}>+ New template</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${narrow ? 1 : 2}, minmax(0,1fr))`, gap: 12 }}>
          {TEMPLATES.map((t) => (
            <Card key={t.id} style={{ padding: 16, display: "flex", gap: 13, alignItems: "flex-start" }}>
              <div style={{ width: 38, height: 38, flex: "0 0 38px", borderRadius: 11, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 17, background: KIND[t.kind].bg, color: KIND[t.kind].bar }}>{t.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: FG1 }}>{t.name}</div>
                <div style={{ fontSize: 11.5, color: FG2, marginTop: 3 }}>{t.spec}</div>
                <div style={{ fontSize: 11, color: FG3, marginTop: 4, lineHeight: 1.45 }}>{t.detail}</div>
                <div style={{ display: "flex", gap: 7, marginTop: 11 }}>
                  <button style={{ ...btn("primary"), fontSize: 11.5, padding: "7px 13px" }} onClick={() => { openCreate(t.form, t.type); flash(`Prefilled from ${t.name}`); }}>Use</button>
                  <button style={{ ...btn("secondary"), fontSize: 11.5, padding: "7px 13px" }} onClick={() => flash("Template editor is out of scope for v1")}>Edit</button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  function CoachesPanel() {
    const unmapped = Object.keys(hostMap).filter((k) => Object.keys(hostMap[k]).length === 0);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <div style={{ fontSize: 12.5, color: FG2, flex: 1, minWidth: 200 }}>Weekly availability per coach. This is what Milton draws from when it drafts or takes a booking.</div>
          <div style={{ display: "flex", gap: 12 }}>
            {[["Available", S_BG], ["Partial", W_BG], ["Off", INK100]].map((l) => (
              <div key={l[0]} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 16, height: 7, borderRadius: 3, background: l[1] }} />
                <span style={{ fontSize: 11, color: FG3 }}>{l[0]}</span>
              </div>
            ))}
          </div>
        </div>
        {unmapped.length > 0 && (
          <div style={{ background: D_BG, borderRadius: 12, padding: "12px 15px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 240, fontSize: 12, color: FG2, lineHeight: 1.5 }}>
              {trainerName(unmapped[0])} has no meeting-provider host mapped, so they cannot be assigned to virtual sessions until that is resolved.
            </div>
            <button style={{ ...btn("secondary"), fontSize: 11.5, padding: "7px 13px" }} onClick={() => setTab("hostmap")}>Fix host mapping</button>
          </div>
        )}
        <Card style={{ overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <div style={{ minWidth: 700 }}>
              <div style={{ display: "grid", gridTemplateColumns: `170px repeat(7, minmax(0,1fr))`, gap: 8, padding: "10px 16px", background: PAGE_BG }}>
                <Eyebrow>Coach</Eyebrow>
                {DOWS.map((d) => <Eyebrow key={d} style={{ textAlign: "center" }}>{d}</Eyebrow>)}
              </div>
              {TRAINERS.map((t) => (
                <div key={t.id} style={{ display: "grid", gridTemplateColumns: `170px repeat(7, minmax(0,1fr))`, gap: 8, padding: "11px 16px", borderTop: `1px solid ${B_SUB}`, alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
                    <span style={avatarStyle(t.id, 26)}>{initials(t.name)}</span>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: FG1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name}</span>
                  </div>
                  {DOWS.map((_, i) => {
                    const rows = (hours[t.id] || [])[i] || [];
                    const total = rows.reduce((a, r) => a + (r[1] - r[0]), 0);
                    const label = rows.length ? rows.map((r) => `${r[0] % 12 || 12}–${r[1] % 12 || 12}`).join(" · ") : "Off";
                    const c = total === 0 ? [INK100, FG4] : total >= 6 ? [S_BG, S_FG] : [W_BG, W_FG];
                    return <div key={i} style={{ textAlign: "center", fontSize: 11.5, fontWeight: 600, fontFamily: MONO, padding: "7px 4px", borderRadius: 8, background: c[0], color: c[1] }}>{label}</div>;
                  })}
                </div>
              ))}
            </div>
          </div>
        </Card>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ ...btn("secondary"), fontSize: 11.5 }} onClick={() => flash("Invite resent to Taylor Nguyen")}>Resend pending invite</button>
        </div>
      </div>
    );
  }

  function RoomsPanel() {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ fontSize: 12.5, color: FG2 }}>Utilization is booked hours over open hours for the displayed week. The rule is what the conflict checker enforces.</div>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${narrow ? 1 : 2}, minmax(0,1fr))`, gap: 12 }}>
          {roomRows.map(({ r, pct, count }) => (
            <Card key={r.id} style={{ padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <span style={{ width: 9, height: 9, borderRadius: 999, flex: "0 0 9px", background: r.id === "b" ? KIND.bootcamp.bar : r.id === "a" ? KIND.group.bar : KIND.room.bar }} />
                <span style={{ fontSize: 13.5, fontWeight: 600, color: FG1, flex: 1 }}>{r.name}</span>
                <span style={{ fontSize: 11.5, color: FG3 }}>{r.cap}</span>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 12 }}>
                <span style={{ fontSize: 20, fontWeight: 700, fontFamily: MONO, color: FG1 }}>{pct}%</span>
                <span style={{ fontSize: 11, color: FG3 }}>{count} bookings this week</span>
              </div>
              <div style={{ marginTop: 7 }}><Bar pct={pct} color={pct > 75 ? W_MID : T700} /></div>
              <div style={{ fontSize: 11.5, color: FG2, marginTop: 10, lineHeight: 1.5 }}>{r.slot}</div>
              <button style={{ ...btn("secondary"), fontSize: 11.5, padding: "7px 13px", marginTop: 11 }} onClick={() => openCreate({ room: r.id, date: day, start: 16 }, "room")}>Book this room</button>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  function ProvidersPanel() {
    const missing = Object.keys(hostMap).filter((k) => Object.keys(hostMap[k]).length === 0);
    const health = [
      { provider: "Microsoft Teams", check: "Authorization", status: "OK", t: "success", detail: "Token valid, online-meeting scope granted." },
      { provider: "Google Meet", check: "Conference data", status: "Warning", t: "warn", detail: "Links are created asynchronously — new sessions may show Link pending for a few seconds." },
      { provider: "Apple Calendar", check: "Busy sync", status: conn.apple ? "OK" : "Off", t: conn.apple ? "success" : "neutral", detail: conn.apple ? "Two-way busy sync ran 2 minutes ago." : "Not connected — personal conflicts will not be detected." },
      missing.length
        ? { provider: "Host coverage", check: "Coach → host", status: "Error", t: "danger", detail: `${trainerName(missing[0])} has no mapped host. Virtual sessions assigned to them cannot generate links.` }
        : { provider: "Host coverage", check: "Coach → host", status: "OK", t: "success", detail: "Every coach who runs virtual sessions has a host account." },
    ];
    const details = {
      teams: `Tenant riversidestrength.onmicrosoft.com · ${Object.keys(hostMap).filter((k) => hostMap[k].teams).length} host mappings · online-meeting scope granted.`,
      google: "Meet conference details are created asynchronously, so links can briefly show as pending after a session is created.",
      apple: "Busy blocks only. Milton reads availability and never writes client names into a personal calendar.",
      zoom: "Connect to let coaches host Zoom sessions. Requires a licensed host per coach and periodic re-authorization.",
    };
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ fontSize: 12.5, color: FG2 }}>
          New virtual sessions use <strong style={{ color: FG1 }}>{(PROVIDERS.find((p) => p.id === defaultProvider) || {}).name}</strong> unless a coach is mapped elsewhere.
        </div>
        {PROVIDERS.map((p) => {
          const on = !!conn[p.id];
          const isDefault = defaultProvider === p.id;
          return (
            <Card key={p.id} style={{ padding: 16, display: "flex", gap: 13, alignItems: "flex-start" }}>
              <div style={{ width: 38, height: 38, flex: "0 0 38px", borderRadius: 10, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12.5, fontWeight: 700, color: WHITE, background: p.tint }}>{p.mono}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: FG1 }}>{p.name}</span>
                  <span style={tone(on ? "success" : "neutral")}>{on ? "Connected" : "Not connected"}</span>
                  {isDefault && <span style={tone("brand")}>Default</span>}
                </div>
                <div style={{ fontSize: 11.5, color: FG3, marginTop: 3 }}>{p.sub} · {on ? (p.id === "teams" ? "Authorized 41 days ago" : p.id === "google" ? "Authorized 12 days ago" : "Synced 2 min ago") : "Available"}</div>
                <div style={{ fontSize: 11.5, color: FG2, marginTop: 7, lineHeight: 1.5 }}>{details[p.id]}</div>
                <div style={{ display: "flex", gap: 7, marginTop: 11 }}>
                  <button style={{ ...btn(!on || (on && !isDefault && p.id !== "apple") ? "primary" : "secondary"), fontSize: 11.5, padding: "8px 14px" }}
                    onClick={() => {
                      if (!on) { setConn((c) => ({ ...c, [p.id]: true })); flash(`${p.name} connected`); return; }
                      if (!isDefault && p.id !== "apple") { setDefaultProvider(p.id); flash(`${p.name} is now the default for new virtual sessions`); return; }
                      flash(`${p.name}: connection healthy`);
                    }}>
                    {!on ? `Connect ${p.name.split(" ")[0]}` : isDefault || p.id === "apple" ? "Test connection" : "Make default"}
                  </button>
                  {on && (
                    <button style={{ ...btn("secondary"), fontSize: 11.5, padding: "8px 14px" }}
                      onClick={() => { if (p.id === "apple") { setConn((c) => ({ ...c, apple: false })); flash("Apple Calendar disconnected"); return; } setTab("hostmap"); }}>
                      {p.id === "apple" ? "Disconnect" : "Host mapping"}
                    </button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
        <Eyebrow style={{ marginTop: 4 }}>Connection health</Eyebrow>
        <Card style={{ overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: narrow ? "1fr 90px" : "150px 130px 100px minmax(0,1fr)", gap: 12, padding: "10px 16px", background: PAGE_BG }}>
            <Eyebrow>Provider</Eyebrow>{!narrow && <Eyebrow>Check</Eyebrow>}<Eyebrow>Status</Eyebrow>{!narrow && <Eyebrow>Detail</Eyebrow>}
          </div>
          {health.map((h, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: narrow ? "1fr 90px" : "150px 130px 100px minmax(0,1fr)", gap: 12, padding: "12px 16px", borderTop: `1px solid ${B_SUB}`, alignItems: "center" }}>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: FG1 }}>{h.provider}</span>
              {!narrow && <span style={{ fontSize: 12, color: FG2 }}>{h.check}</span>}
              <span style={tone(h.t)}>{h.status}</span>
              {!narrow && <span style={{ fontSize: 11.5, color: FG2, lineHeight: 1.45 }}>{h.detail}</span>}
            </div>
          ))}
        </Card>
      </div>
    );
  }

  function HostmapPanel() {
    const m = Object.keys(hostMap).find((k) => Object.keys(hostMap[k]).length === 0);
    const warn = m ? `${trainerName(m)} has no Teams host. ${appts.filter((a) => a.virtual && a.trainer === m).length} upcoming virtual session${appts.filter((a) => a.virtual && a.trainer === m).length === 1 ? "" : "s"} could not generate links. Map a host to resolve them, or reassign the sessions to a mapped coach.` : "";
    const cols = narrow ? "minmax(0,1fr) 120px" : "180px minmax(0,1fr) minmax(0,1fr) 110px 130px";
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ fontSize: 12.5, color: FG2 }}>A coach needs a host account on a provider before Milton can generate a meeting link for their virtual sessions.</div>
        {warn && (
          <div style={{ background: D_BG, borderRadius: 12, padding: "12px 15px", fontSize: 12, color: FG2, lineHeight: 1.5 }}>{warn}</div>
        )}
        <Card style={{ overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <div style={{ minWidth: narrow ? 0 : 700 }}>
              <div style={{ display: "grid", gridTemplateColumns: cols, gap: 14, padding: "10px 18px", background: PAGE_BG }}>
                <Eyebrow>Coach</Eyebrow>
                {!narrow && <><Eyebrow>Teams host</Eyebrow><Eyebrow>Google Meet host</Eyebrow><Eyebrow>Zoom host</Eyebrow></>}
                <Eyebrow>Status</Eyebrow>
              </div>
              {TRAINERS.map((t) => {
                const hm = hostMap[t.id] || {};
                const missing = Object.keys(hm).length === 0;
                return (
                  <div key={t.id} style={{ display: "grid", gridTemplateColumns: cols, gap: 14, padding: "13px 18px", borderTop: `1px solid ${B_SUB}`, alignItems: "center", background: missing ? D_BG : "transparent" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
                      <span style={avatarStyle(t.id)}>{initials(t.name)}</span>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: FG1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name}</span>
                    </div>
                    {!narrow && <>
                      <span style={{ fontSize: 11.5, color: FG2, fontFamily: MONO, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {missing ? <button style={{ ...btn("primary"), fontSize: 11, padding: "6px 12px" }} onClick={() => { setHostMap((h) => ({ ...h, [t.id]: { teams: t.name.split(" ")[0].toLowerCase() + "@riversidestrength.com" } })); flash(`${t.name} mapped · 1 failed session link resolved`); }}>Map a host</button> : hm.teams || "—"}
                      </span>
                      <span style={{ fontSize: 11.5, color: FG2, fontFamily: MONO, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{hm.google || "—"}</span>
                      <span style={{ fontSize: 11.5, color: FG2, fontFamily: MONO }}>{hm.zoom || "—"}</span>
                    </>}
                    <span style={tone(missing ? "danger" : "success")}>{missing ? "Missing host" : "Mapped"}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  function HoursPanel() {
    const overrides = closures.filter((c) => !c.open).slice(0, 3);
    const closureCols = narrow ? "minmax(0,1fr) 110px" : "120px minmax(0,1.2fr) 100px 150px minmax(0,1fr) 90px";
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div style={{ display: "inline-flex", gap: 3, background: INK100, padding: 3, borderRadius: 999 }}>
            {[["facility", "Business hours"], ["trainer", persona === "admin" ? "Trainer hours" : "My hours"]].map((w) => (
              <button key={w[0]} style={seg(who === w[0])} onClick={() => setWho(w[0])}>{w[1]}</button>
            ))}
          </div>
          <div style={{ flex: 1, minWidth: 220, fontSize: 12, color: FG2, lineHeight: 1.5 }}>
            {who === "facility" ? "Nothing can be booked outside these hours — trainer hours nest inside them." : `Bookable hours for ${trainerName(me)}. Google busy events carve out of these automatically.`}
          </div>
          {persona === "coach" && who === "trainer" && (
            <button style={btn("secondary")} onClick={() => flash("Availability link copied")}>Share availability</button>
          )}
        </div>

        <Card style={{ padding: 18 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {DOWS.map((d, i) => {
              const rows = (hours[whoKey] || [])[i] || [];
              return (
                <div key={d} style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ width: 22, fontSize: 12, fontWeight: 700, color: FG2 }}>{d.charAt(0)}</div>
                  {rows.length === 0 && <span style={{ fontSize: 12, color: FG4 }}>Closed</span>}
                  {rows.map((r, ri) => (
                    <div key={ri} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Select value={String(r[0])} onChange={(e) => patchHours(i, ri, 0, +e.target.value)} options={timeOptions} style={{ fontSize: 11.5, padding: "5px 7px" }} />
                      <span style={{ fontSize: 11, color: FG4 }}>to</span>
                      <Select value={String(r[1])} onChange={(e) => patchHours(i, ri, 1, +e.target.value)} options={timeOptions} style={{ fontSize: 11.5, padding: "5px 7px" }} />
                      <button style={{ border: 0, background: "transparent", color: FG4, fontSize: 15, cursor: "pointer", lineHeight: 1 }}
                        onClick={() => setHours((h) => ({ ...h, [whoKey]: h[whoKey].map((dd, j) => (j === i ? dd.filter((_, k) => k !== ri) : dd)) }))}>×</button>
                    </div>
                  ))}
                  <button style={{ border: 0, background: "transparent", color: T800, fontFamily: "inherit", fontSize: 11.5, fontWeight: 600, cursor: "pointer", padding: 0 }}
                    onClick={() => setHours((h) => ({ ...h, [whoKey]: h[whoKey].map((dd, j) => (j === i ? dd.concat([[9, 12]]) : dd)) }))}>+ Add</button>
                </div>
              );
            })}
          </div>
          <div style={{ fontSize: 11.5, color: FG3, marginTop: 14, lineHeight: 1.5 }}>
            {who === "facility" ? "Sunday is closed facility-wide, so no trainer can be booked." : "Changing these instantly changes what clients can book and what Milton will draft."}
          </div>
        </Card>

        {persona === "admin" && <>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Eyebrow style={{ flex: 1 }}>Closures & holidays</Eyebrow>
            <button style={{ ...btn("secondary"), fontSize: 11.5, padding: "7px 13px" }}
              onClick={() => {
                const d = addDays(TODAY, 21);
                if (closures.some((x) => x.date === d)) { flash(`${fmtDate(d)} already has a closure`); return; }
                setClosures((c) => c.concat([{ date: d, name: "Custom closure", source: "Custom", effect: "all", open: false }]));
                flash(`${fmtDate(d)} closed · affected sessions flagged for deferral`);
              }}>+ Add closure</button>
          </div>
          <Card style={{ overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: closureCols, gap: 12, padding: "10px 16px", background: PAGE_BG }}>
              <Eyebrow>Date</Eyebrow>{!narrow && <><Eyebrow>Name</Eyebrow><Eyebrow>Source</Eyebrow><Eyebrow>Effect</Eyebrow><Eyebrow>Sessions affected</Eyebrow></>}<Eyebrow />
            </div>
            {closures.map((c) => {
              const hits = appts.filter((a) => a.date === c.date).length + CLASS_DEFS.filter((cd) => cd.dows.includes(dowOf(c.date)) && !cd.from).length;
              return (
                <div key={c.date} style={{ display: "grid", gridTemplateColumns: closureCols, gap: 12, padding: "12px 16px", borderTop: `1px solid ${B_SUB}`, alignItems: "center" }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: FG1, fontFamily: MONO, whiteSpace: "nowrap" }}>{fmtDate(c.date)}, 2026</div>
                    {narrow && <div style={{ fontSize: 11.5, color: FG2, marginTop: 3 }}>{c.name}</div>}
                    {narrow && <div style={{ marginTop: 5 }}><span style={tone(c.open ? "success" : c.effect === "all" ? "danger" : "warn")}>{c.open ? "Open (overridden)" : c.effect === "all" ? "Closed all day" : `Closed after ${fmtT(c.after)}`}</span></div>}
                  </div>
                  {!narrow && <>
                    <span style={{ fontSize: 12, color: FG1 }}>{c.name}</span>
                    <span style={tone(c.source === "Custom" ? "brand" : "neutral")}>{c.source}</span>
                    <span style={tone(c.open ? "success" : c.effect === "all" ? "danger" : "warn")}>{c.open ? "Open (overridden)" : c.effect === "all" ? "Closed all day" : `Closed after ${fmtT(c.after)}`}</span>
                    <span style={{ fontSize: 11.5, color: FG2 }}>{c.open ? "Normal schedule" : `${hits}${c.effect === "all" ? " sessions auto-deferred" : " sessions affected"}`}</span>
                  </>}
                  <button style={{ border: 0, background: "transparent", color: T800, fontFamily: "inherit", fontSize: 12, fontWeight: 600, cursor: "pointer", justifySelf: "start", padding: 0 }}
                    onClick={() => { setClosures((l) => l.map((x) => (x.date === c.date ? { ...x, open: !x.open } : x))); flash(`${fmtDate(c.date)}${c.open ? " closed again" : ` will stay open · ${hits} sessions restored`}`); }}>
                    {c.open ? "Close" : "Stay open"}
                  </button>
                </div>
              );
            })}
          </Card>

          <Eyebrow>Booking rules</Eyebrow>
          <Card style={{ padding: 18, display: "grid", gridTemplateColumns: `repeat(${narrow ? 1 : 2}, minmax(0,1fr))`, gap: 14 }}>
            {[
              { label: "Minimum notice", key: "notice", options: [[2, "2 hours"], [12, "12 hours"], [24, "24 hours"]] },
              { label: "Free cancellation", key: "cancel", options: [[4, "4 hours"], [12, "12 hours"], [24, "24 hours"]] },
              { label: "Buffer between sessions", key: "buffer", options: [[0, "None"], [10, "10 min"], [15, "15 min"]] },
              { label: "Max 1:1s per day", key: "maxDay", options: [[6, "6"], [8, "8"], [10, "10"]] },
            ].map((r) => (
              <div key={r.key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ flex: 1, fontSize: 12.5, color: FG1 }}>{r.label}</span>
                <Select value={String(rules[r.key])} onChange={(e) => setRules((x) => ({ ...x, [r.key]: +e.target.value }))} options={r.options.map((o) => ({ v: String(o[0]), label: o[1] }))} />
              </div>
            ))}
          </Card>
        </>}

        <Eyebrow>Connected calendars</Eyebrow>
        <Card style={{ overflow: "hidden" }}>
          {[
            { key: "google", name: "Google Calendar", detail: cals.google ? "alex@riversidestrength.com · synced 2 min ago" : "Not connected" },
            { key: "apple", name: "Apple Calendar", detail: cals.apple ? "Personal · busy blocks only" : "Not connected" },
          ].map((c, i) => (
            <div key={c.key} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderTop: i ? `1px solid ${B_SUB}` : "none" }}>
              <span style={{ width: 8, height: 8, borderRadius: 999, flex: "0 0 8px", background: cals[c.key] ? GREEN : INK300 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: FG1 }}>{c.name}</div>
                <div style={{ fontSize: 11.5, color: FG3, marginTop: 2 }}>{c.detail}</div>
              </div>
              <button style={{ ...btn("secondary"), fontSize: 11.5, padding: "7px 13px" }}
                onClick={() => { setCals((x) => ({ ...x, [c.key]: !x[c.key] })); flash(`${c.name} ${cals[c.key] ? "disconnected" : "connected"}`); }}>
                {cals[c.key] ? "Disconnect" : "Connect"}
              </button>
            </div>
          ))}
        </Card>
      </div>
    );
  }

  /* ---------- sheets ---------- */
  function CreateSheet() {
    const fields = buildFields();
    const clear = conflicts.length === 0;
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ padding: "18px 20px 14px", borderBottom: `1px solid ${B_SUB}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1, fontSize: 15, fontWeight: 600, color: FG1 }}>
              {{ oneone: "1:1 session", group: "Recurring group class", series: "Bootcamp series", room: "Room booking", internal: "Team meeting" }[ctype]}
            </div>
            <button style={{ border: 0, background: "transparent", color: FG3, fontSize: 20, cursor: "pointer", lineHeight: 1 }} onClick={() => setSheet(null)} aria-label="Close">×</button>
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
            {[["oneone", "1:1 session"], ["group", "Group class"], ["series", "Bootcamp series"], ["room", "Room booking"], ["internal", "Team meeting"]].map((t) => (
              <button key={t[0]} style={pill(ctype === t[0])} onClick={() => setCtype(t[0])}>{t[1]}</button>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 13 }}>
          {fields.map((f, i) => (
            <div key={i}>
              <Eyebrow style={{ marginBottom: 5 }}>{f.label}</Eyebrow>
              {f.isSelect && <Select value={f.value} onChange={f.onChange} options={f.options} style={{ width: "100%" }} />}
              {f.isText && <input value={f.value} onChange={f.onChange} style={{ width: "100%", border: `1px solid ${B_SOFT}`, background: WHITE, color: FG1, fontFamily: "inherit", fontSize: 12.5, padding: "8px 10px", borderRadius: 9, boxSizing: "border-box" }} />}
              {f.isStep && (
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <button style={stepBtn} onClick={f.dec}>−</button>
                  <span style={{ fontSize: 14, fontWeight: 700, fontFamily: MONO, minWidth: 24, textAlign: "center", color: FG1 }}>{f.stepValue}</span>
                  <button style={stepBtn} onClick={f.inc}>+</button>
                </div>
              )}
              {f.isSeg && <div style={{ display: "flex", gap: 6 }}>{f.segs.map((s) => <button key={s.label} style={pill(s.active)} onClick={s.onClick}>{s.label}</button>)}</div>}
              {f.hint && <div style={{ fontSize: 10.5, color: FG4, marginTop: 4 }}>{f.hint}</div>}
            </div>
          ))}
          {conflicts.map((c, i) => (
            <div key={i} style={{ background: D_BG, borderRadius: 11, padding: "12px 14px" }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: D_FG }}>{c.title}</div>
              <div style={{ fontSize: 11.5, color: FG2, marginTop: 4, lineHeight: 1.5 }}>{c.body}</div>
              {c.fixRoom && <button style={{ ...btn("secondary"), fontSize: 11.5, padding: "7px 12px", marginTop: 9 }} onClick={() => { patchForm({ room: c.fixRoom }); flash(`Room switched to ${roomName(c.fixRoom)}`); }}>{c.fixLabel}</button>}
            </div>
          ))}
          {clear && (
            <div style={{ background: S_BG, borderRadius: 11, padding: "11px 14px", fontSize: 12, color: S_FG }}>
              No clashes. Coach, room and hours all check out.
            </div>
          )}
        </div>
        <div style={{ padding: "14px 20px", borderTop: `1px solid ${B_SUB}`, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1, fontSize: 11, color: FG3, lineHeight: 1.45 }}>
            {conflicts.length ? `Resolve ${conflicts.length} conflict${conflicts.length > 1 ? "s" : ""} to book.` : ctype === "group" || ctype === "series" ? "Clients see it the moment you create it." : "Pushes to Google and Apple Calendar."}
          </div>
          <button style={conflicts.length ? btn("off") : btn("primary")} onClick={submitCreate} disabled={conflicts.length > 0}>
            {ctype === "group" ? "Create class" : ctype === "series" ? "Create series" : "Book it"}
          </button>
        </div>
      </div>
    );
  }

  function DetailSheet() {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ padding: "18px 20px 14px", borderBottom: `1px solid ${B_SUB}` }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: FG1 }}>{ev.title}</div>
              <div style={{ fontSize: 12, color: FG3, marginTop: 3 }}>{fmtLong(ev.date)} · {range(ev.start, ev.dur)}</div>
            </div>
            <button style={{ border: 0, background: "transparent", color: FG3, fontSize: 20, cursor: "pointer", lineHeight: 1 }} onClick={() => { setSheet(null); setSel(null); }} aria-label="Close">×</button>
          </div>
          <span style={{ display: "inline-block", marginTop: 10, fontSize: 10.5, fontWeight: 600, padding: "3px 10px", borderRadius: 999, background: KIND[ev.kind].bg, color: KIND[ev.kind].bar }}>{KIND[ev.kind].label}</span>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {detailRows.map((r) => (
              <div key={r.label} style={{ display: "flex", gap: 12 }}>
                <span style={{ width: 100, flex: "0 0 100px", fontSize: 11.5, color: FG3 }}>{r.label}</span>
                <span style={{ fontSize: 12.5, color: FG1, fontWeight: 500 }}>{r.value}</span>
              </div>
            ))}
          </div>
          {detailNote && (
            <div style={{ background: D_BG, borderRadius: 11, padding: "12px 14px", fontSize: 11.5, color: FG2, lineHeight: 1.5 }}>{detailNote}</div>
          )}
          {hasRoster && (
            <div>
              <Eyebrow style={{ marginBottom: 8 }}>Roster · {ev.filled} of {ev.cap}</Eyebrow>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {roster.map((p, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <span style={{ width: 26, height: 26, flex: "0 0 26px", borderRadius: 999, background: p.enrolled ? T200 : INK150, color: p.enrolled ? T800 : FG2, fontSize: 10, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{initials(p.name)}</span>
                    <span style={{ flex: 1, fontSize: 12.5, color: FG1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                    <span style={{ fontSize: 10.5, fontWeight: 600, color: p.enrolled ? S_FG : FG2, background: p.enrolled ? S_BG : INK100, padding: "2px 8px", borderRadius: 999 }}>{p.tag}</span>
                    <button style={{ border: 0, background: "transparent", color: T800, fontFamily: "inherit", fontSize: 11.5, fontWeight: 600, cursor: "pointer" }} onClick={p.act}>{p.action}</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div style={{ padding: "14px 20px", borderTop: `1px solid ${B_SUB}`, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {detailActions.map((a) => (
            <button key={a.label} style={{ ...btn(a.kind), fontSize: 11.5, padding: "8px 14px" }} onClick={a.onClick}>{a.label}</button>
          ))}
        </div>
      </div>
    );
  }

  /* ---------- shell ---------- */
  const sheetOpen = !!sheet && (sheet === "create" || (sheet === "detail" && !!ev));

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: PAGE_BG, position: "relative", overflow: "hidden" }}>
      {/* header */}
      <div style={{ background: WHITE, borderBottom: `1px solid ${B_SOFT}`, padding: `${narrow ? 12 : 14}px ${PAD}px 0` }}>
        {/* Anchored to the corner rather than inline, so it cannot get pushed
            onto a second row when the header controls wrap. */}
        {onClose && (
          <button onClick={onClose} aria-label="Close"
            style={{ position: "absolute", top: narrow ? 12 : 14, right: PAD, zIndex: 5, width: 32, height: 32, borderRadius: 8, border: `1px solid ${B_SOFT}`, background: WHITE, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: FG3 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", paddingRight: 40 }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ fontSize: narrow ? 15 : 17, fontWeight: 700, color: FG1, letterSpacing: "-.01em" }}>
              {persona === "admin" ? "Facility scheduling" : "My schedule"}
            </div>
            <div style={{ fontSize: 11, color: FG3, marginTop: 2 }}>Riverside — Main · Live · synced 2 min ago</div>
          </div>
          {!narrow && persona === "admin" && (
            <Select value={loc} onChange={(e) => { setLoc(e.target.value); flash("Location: " + e.target.options[e.target.selectedIndex].text); }}
              options={[{ v: "main", label: "Riverside — Main" }, { v: "north", label: "Northside" }, { v: "all", label: "All locations (3)" }]} />
          )}
          <div style={{ display: "inline-flex", gap: 3, background: INK100, padding: 3, borderRadius: 999 }}>
            {[["admin", "Admin"], ["coach", "Trainer"]].map((r) => (
              <button key={r[0]} style={seg(persona === r[0])} onClick={() => { setPersona(r[0]); setTab("week"); setSheet(null); }}>{r[1]}</button>
            ))}
          </div>
          {!narrow && persona === "admin" && (
            <button style={btn("secondary")} onClick={() => flash("Schedule published · clients can book it now")}>
              Publish schedule
            </button>
          )}
        </div>
        {/* tabs */}
        <div className="hide-scrollbar" style={{ display: "flex", alignItems: "center", gap: 2, marginTop: 10, overflowX: "auto" }}>
          {tabsDef.map((t, i) =>
            t[0] === "sep" ? (
              <span key={"s" + i} style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".1em", color: FG4, padding: "0 10px 0 16px", whiteSpace: "nowrap" }}>{t[1]}</span>
            ) : (
              <button key={t[0]} onClick={() => setTab(t[0])}
                style={{ border: 0, background: "transparent", cursor: "pointer", fontFamily: "inherit", fontSize: 13.5, fontWeight: activeTab === t[0] ? 600 : 500, color: activeTab === t[0] ? T800 : FG3, padding: "10px 14px 12px", borderBottom: `2px solid ${activeTab === t[0] ? T800 : "transparent"}`, whiteSpace: "nowrap" }}>
                {t[1]}
              </button>
            )
          )}
        </div>
      </div>

      {/* body */}
      <div style={{ flex: 1, overflowY: "auto", padding: `${narrow ? 14 : 20}px ${PAD}px ${narrow ? 18 : 26}px` }}>
        {persona === "coach" && activeTab === "week" && <WeekPanel />}
        {persona === "admin" && activeTab === "week" && <FacilityPanel />}
        {activeTab === "sessions" && <SessionsPanel />}
        {activeTab === "classes" && <ClassesPanel />}
        {activeTab === "templates" && <TemplatesPanel />}
        {activeTab === "coaches" && <CoachesPanel />}
        {activeTab === "rooms" && <RoomsPanel />}
        {activeTab === "providers" && <ProvidersPanel />}
        {activeTab === "hostmap" && <HostmapPanel />}
        {activeTab === "hours" && <HoursPanel />}
      </div>

      {/* Milton strip */}
      <div style={{ borderTop: `1px solid ${B_SOFT}`, background: WHITE, padding: `${narrow ? 11 : 13}px ${PAD}px` }}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <span style={{ width: 24, height: 24, flex: "0 0 24px", borderRadius: 999, background: T050, color: T800, fontSize: 10, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>M</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, color: FG1, lineHeight: 1.5 }}>{miltonLine}</div>
          </div>
        </div>
      </div>

      {/* sheet */}
      {sheetOpen && (
        <>
          <div onClick={() => { setSheet(null); setSel(null); }} style={{ position: "absolute", inset: 0, background: "rgba(11,20,23,.28)", zIndex: 40 }} />
          <div style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: narrow ? "100%" : 400, background: WHITE, borderLeft: `1px solid ${B_SOFT}`, zIndex: 41, boxShadow: "-6px 0 24px rgba(11,20,23,.10)" }}>
            {sheet === "create" ? <CreateSheet /> : <DetailSheet />}
          </div>
        </>
      )}

      {/* toast */}
      {toast && (
        <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", background: FG1, color: WHITE, fontSize: 12.5, fontWeight: 500, padding: "10px 18px", borderRadius: 999, zIndex: 60, boxShadow: "0 4px 16px rgba(11,20,23,.22)", maxWidth: "88%", textAlign: "center" }}>
          {toast}
        </div>
      )}
    </div>
  );
}
