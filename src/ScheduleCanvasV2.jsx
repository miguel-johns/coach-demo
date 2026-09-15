import React, { useState } from "react";

/* ---------- tokens (from Milton design system) ---------- */
const WHITE = "#FFFFFF";
const FG1 = "#1A2327"; // display / headers
const FG2 = "#3F4A4E"; // body
const FG3 = "#7D8789"; // captions
const FG4 = "#9FA8AB"; // disabled
const B_SOFT = "#DEE4E5";
const B_SUB = "#EBEEEF";
const BG_APP = "#F3F5F6";
const INK050 = "#F9FAFA";
const INK100 = "#F3F5F6";
const INK200 = "#DEE4E5";
const TEAL_800 = "#0E5D70";
const TEAL_100 = "#E4F0F0";
const TEAL_050 = "#F0F7F7";
const TEAL_300 = "#A9D3D6";
const GREEN_600 = "#51B565";
const S_FG = "#2D7D3E";
const S_BG = "#E2F3DF";
const V_FG = "#6A3FD7";
const V_BG = "#EDE4FE";
const SHADOW_CARD = "0 1px 0 rgba(14,93,112,.04), 0 2px 8px rgba(14,93,112,.06)";
const SHADOW_XL = "0 28px 60px rgba(14,93,112,.20)";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const AVATAR_PALETTE = ["#E87560", "#8B5CF6", "#3F88F2", "#3FA053", "#176B7C", "#E89C3A"];
const TIMES = ["5:00 AM", "5:30 AM", "6:00 AM", "6:30 AM", "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM"];
const PROVIDERS = [
  { name: "Google Calendar", sub: "Google Workspace or Gmail", letter: "G", color: "#3F88F2" },
  { name: "Outlook", sub: "Microsoft 365", letter: "O", color: "#8B5CF6" },
  { name: "Apple Calendar", sub: "iCloud", letter: "A", color: "#3F4A4E" },
];
// Builds the next `count` open days from the coach's hours, for the member date picker.
function buildDates(hours, count = 14) {
  const out = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 1; out.length < count && i < 90; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const idx = (d.getDay() + 6) % 7; // convert JS Sun=0 to Mon=0
    if (!hours[idx].on) continue;
    out.push({
      key: `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`,
      offset: i,
      dow: DAY_NAMES[idx],
      day: d.getDate(),
      month: d.toLocaleString("en-US", { month: "short" }),
      start: hours[idx].start,
      end: hours[idx].end,
    });
  }
  return out;
}

// Returns the bookable time slots that fall within a day's open hours.
function slotsFor(date) {
  if (!date) return [];
  const si = TIMES.indexOf(date.start);
  const ei = TIMES.indexOf(date.end);
  if (si === -1 || ei === -1) return TIMES;
  return TIMES.slice(si, ei + 1);
}

// Friendly label for a chosen date, e.g. "Monday, Sep 15".
function dateLabel(date) {
  if (!date) return "";
  return `${date.dow}, ${date.month} ${date.day}`;
}

/* ---------- helpers ---------- */
const initials = (n) => n.split(" ").map((w) => w[0]).join("").slice(0, 2);

// Groups consecutive open days that share the same open/close time into rows.
function summarizeHours(days) {
  const rows = [];
  for (let i = 0; i < 7; i++) {
    const d = days[i];
    if (!d.on) continue;
    const last = rows[rows.length - 1];
    if (last && last.lastIdx === i - 1 && last.start === d.start && last.end === d.end) {
      last.lastIdx = i;
      last.endDay = DAYS[i];
    } else {
      rows.push({ startDay: DAYS[i], endDay: DAYS[i], lastIdx: i, start: d.start, end: d.end });
    }
  }
  return rows.map((r) => ({
    label: r.startDay === r.endDay ? r.startDay : `${r.startDay} – ${r.endDay}`,
    time: `${r.start} – ${r.end}`,
  }));
}

const serviceMeta = (x) =>
  `${x.dur} min · ${x.kind === "group" ? `${x.cap} ${x.cap === 1 ? "spot" : "spots"}` : "1 person"} · ${x.staff}`;

/* ---------- style helpers ---------- */
function btn(kind) {
  const base = { fontFamily: "inherit", fontSize: 13.5, fontWeight: 600, padding: "9px 16px", borderRadius: 999, cursor: "pointer", lineHeight: 1 };
  if (kind === "primary") return { ...base, border: 0, background: TEAL_800, color: WHITE };
  if (kind === "ghost") return { ...base, border: 0, background: "transparent", color: FG2 };
  if (kind === "brandGhost") return { ...base, border: `1px solid ${B_SOFT}`, background: WHITE, color: TEAL_800, display: "inline-flex", alignItems: "center", gap: 8 };
  return { ...base, border: `1px solid ${B_SOFT}`, background: WHITE, color: FG1 };
}
function chip(active) {
  return { padding: "9px 14px", borderRadius: 999, border: `1px solid ${active ? TEAL_800 : INK200}`, background: active ? TEAL_800 : WHITE, color: active ? WHITE : FG2, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", lineHeight: 1 };
}
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
);
const Chevron = ({ color = FG4 }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color, flex: "none" }}><path d="m9 18 6-6-6-6" /></svg>
);

/* ---------- card ---------- */
function Card({ children, style }) {
  return <section style={{ background: WHITE, border: `1px solid ${B_SUB}`, borderRadius: 16, boxShadow: SHADOW_CARD, overflow: "hidden", ...style }}>{children}</section>;
}

/* ---------- modal shell ---------- */
function Modal({ width = 480, onClose, children }) {
  return (
    <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(11,20,23,.42)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: width, maxHeight: "92%", overflow: "auto", background: WHITE, borderRadius: 24, boxShadow: SHADOW_XL, padding: "26px 26px 22px", display: "flex", flexDirection: "column", gap: 18 }}>
        {children}
      </div>
    </div>
  );
}
function ModalTitle({ title, sub }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <h2 style={{ fontSize: 23, fontWeight: 600, letterSpacing: "-.01em", margin: 0, color: FG1 }}>{title}</h2>
      {sub && <p style={{ fontSize: 14.5, color: FG3, margin: 0 }}>{sub}</p>}
    </div>
  );
}
const fieldLabel = { fontSize: 13, fontWeight: 600, color: FG2 };
const inputStyle = { border: `1px solid ${INK200}`, borderRadius: 12, padding: "10px 14px", fontSize: 15, fontFamily: "inherit", color: FG1, background: WHITE, width: "100%", boxSizing: "border-box" };

export default function ScheduleCanvasV2({ onClose, isMobile }) {
  const narrow = !!isMobile;
  const [calendars, setCalendars] = useState([
    { name: "Miguel Ortega", provider: "Google Calendar" },
    { name: "Joe Fields", provider: "Outlook" },
  ]);
  const [hours, setHours] = useState([
    { on: true, start: "6:00 AM", end: "7:00 PM" },
    { on: true, start: "6:00 AM", end: "7:00 PM" },
    { on: true, start: "6:00 AM", end: "7:00 PM" },
    { on: true, start: "6:00 AM", end: "7:00 PM" },
    { on: true, start: "6:00 AM", end: "7:00 PM" },
    { on: false, start: "8:00 AM", end: "12:00 PM" },
    { on: false, start: "8:00 AM", end: "12:00 PM" },
  ]);
  const [services, setServices] = useState([
    { name: "Personal Training", dur: 60, kind: "individual", cap: 1, staff: "Miguel", when: "Business hours" },
    { name: "Initial Assessment", dur: 30, kind: "individual", cap: 1, staff: "Miguel", when: "Business hours" },
    { name: "Strength Class", dur: 60, kind: "group", cap: 12, staff: "Joe", when: "Mon · Wed · Fri, 6:00 AM" },
    { name: "Recovery Room", dur: 30, kind: "group", cap: 1, staff: "Any coach", when: "Business hours" },
  ]);

  const [modal, setModal] = useState(null);
  const [connectName, setConnectName] = useState("");
  const [hoursDraft, setHoursDraft] = useState(hours);
  const [form, setForm] = useState({ name: "", dur: 60, kind: "individual", cap: 12, staff: "Miguel", when: "Business hours" });
  const [booking, setBooking] = useState({ step: 0, service: null, date: null, time: null });
  const [toast, setToast] = useState("");

  const flash = (msg) => { setToast(msg); window.clearTimeout(flash._t); flash._t = window.setTimeout(() => setToast(""), 2600); };
  const close = () => setModal(null);
  const setF = (patch) => setForm((f) => ({ ...f, ...patch }));

  const hoursRows = summarizeHours(hours);
  const bookingDates = buildDates(hours);

  const addService = (svc) => {
    setServices((prev) => (prev.some((x) => x.name === svc.name) ? prev : [...prev, svc]));
  };

  const pickProvider = (p) => {
    const name = connectName.trim() || "New coach";
    setCalendars((prev) => [...prev, { name, provider: p.name }]);
    close();
    flash(`${name}'s ${p.name} is connected`);
  };

  const saveHours = () => { setHours(hoursDraft); close(); flash("Hours updated"); };

  const saveService = () => {
    if (!form.name.trim()) return;
    addService({ ...form, name: form.name.trim(), when: form.when.trim() || "Business hours", cap: form.kind === "group" ? form.cap : 1 });
    close();
    flash(`${form.name.trim()} is now bookable`);
  };

  const PAD = narrow ? 16 : 24;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: BG_APP, position: "relative", overflow: "hidden", fontFamily: "inherit", color: FG1 }}>
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: `14px ${PAD}px`, position: "relative" }}>
        <div style={{ flex: 1 }} />
        <button onClick={() => { setBooking({ step: 0, service: null, date: null, time: null }); setModal("book"); }} style={{ ...btn("secondary"), fontSize: 12.5, padding: "8px 14px" }}>
          Preview member booking
        </button>
        {onClose && (
          <button onClick={onClose} aria-label="Close" style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${B_SOFT}`, background: WHITE, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: FG3 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        )}
      </div>

      {/* body */}
      <div style={{ flex: 1, overflowY: "auto", padding: `4px ${PAD}px 40px` }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 760, width: "100%", margin: "0 auto" }}>
          {/* intro */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "8px 4px 0" }}>
            <h1 style={{ fontSize: narrow ? 26 : 30, fontWeight: 700, letterSpacing: "-.02em", lineHeight: 1.1, margin: 0 }}>Schedule</h1>
            <p style={{ fontSize: 15, color: FG3, margin: 0, textWrap: "pretty" }}>
              Connect calendars, set your hours, and choose what members can book. Milton handles the rest.
            </p>
          </div>

          {/* Connected Calendars */}
          <Card>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16, padding: "20px 24px 8px" }}>
              <h2 style={{ fontSize: 17, fontWeight: 600, margin: 0 }}>Connected Calendars</h2>
              <span style={{ fontSize: 13, color: FG3 }}>{calendars.length ? `${calendars.length} connected` : ""}</span>
            </div>
            {calendars.length === 0 && (
              <p style={{ padding: "6px 24px 8px", fontSize: 14, color: FG3, margin: 0, textWrap: "pretty" }}>
                Connect each coach&apos;s calendar once. Bookings land there automatically and busy times are respected.
              </p>
            )}
            {calendars.map((c, i) => (
              <div key={c.name + i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 24px", borderTop: `1px solid ${B_SUB}` }}>
                <span style={{ width: 36, height: 36, flex: "none", borderRadius: 999, background: AVATAR_PALETTE[i % AVATAR_PALETTE.length], color: WHITE, fontSize: 13, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{initials(c.name)}</span>
                <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 1 }}>
                  <span style={{ fontSize: 15, fontWeight: 600 }}>{c.name}</span>
                  <span style={{ fontSize: 13, color: FG3 }}>{c.provider}</span>
                </div>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: S_FG, background: S_BG, padding: "4px 10px", borderRadius: 999 }}>
                  <span style={{ width: 6, height: 6, borderRadius: 999, background: GREEN_600 }} />Connected
                </span>
              </div>
            ))}
            <div style={{ padding: "12px 24px 18px", borderTop: `1px solid ${B_SUB}` }}>
              <button style={btn("brandGhost")} onClick={() => { setConnectName(""); setModal("connect"); }}><PlusIcon />Connect Calendar</button>
            </div>
          </Card>

          {/* Hours */}
          <Card style={{ overflow: "visible", padding: "20px 24px 22px", display: "flex", alignItems: "flex-start", gap: 20, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 220, display: "flex", flexDirection: "column", gap: 12 }}>
              <h2 style={{ fontSize: 17, fontWeight: 600, margin: 0 }}>Hours</h2>
              {hoursRows.length === 0 ? (
                <span style={{ fontSize: 18, color: FG3 }}>Closed every day</span>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {hoursRows.map((r) => (
                    <div key={r.label} style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                      <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-.01em", minWidth: 92 }}>{r.label}</span>
                      <span style={{ fontSize: 18, color: FG2 }}>{r.time}</span>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ display: "flex", gap: 6, marginTop: 2 }}>
                {DAYS.map((d, i) => (
                  <span key={d} style={{ width: 28, height: 28, borderRadius: 999, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, background: hours[i].on ? TEAL_800 : INK100, color: hours[i].on ? WHITE : FG4 }}>{d[0]}</span>
                ))}
              </div>
            </div>
            <button style={btn("secondary")} onClick={() => { setHoursDraft(hours.map((d) => ({ ...d }))); setModal("hours"); }}>Edit Hours</button>
          </Card>

          {/* Services & Classes */}
          <Card>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16, padding: "20px 24px 8px" }}>
              <h2 style={{ fontSize: 17, fontWeight: 600, margin: 0 }}>Services &amp; Classes</h2>
              <span style={{ fontSize: 13, color: FG3 }}>{services.length ? `${services.length} bookable` : ""}</span>
            </div>
            {services.length === 0 && (
              <p style={{ padding: "6px 24px 8px", fontSize: 14, color: FG3, margin: 0, textWrap: "pretty" }}>
                Nothing is bookable yet. Add a service for one-on-one sessions, or a class with a set number of spots.
              </p>
            )}
            {services.map((s, i) => {
              const group = s.kind === "group";
              return (
                <div key={s.name + i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 24px", borderTop: `1px solid ${B_SUB}` }}>
                  <span style={{ width: 36, height: 36, flex: "none", borderRadius: 10, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, background: group ? V_BG : TEAL_100, color: group ? V_FG : TEAL_800 }}>{group ? "G" : "1"}</span>
                  <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 1 }}>
                    <span style={{ fontSize: 15, fontWeight: 600 }}>{s.name}</span>
                    <span style={{ fontSize: 13, color: FG3 }}>{serviceMeta(s)}</span>
                  </div>
                  <span style={{ fontSize: 13, color: FG3, whiteSpace: "nowrap" }}>{s.when}</span>
                  <Chevron />
                </div>
              );
            })}
            <div style={{ padding: "12px 24px 18px", borderTop: `1px solid ${B_SUB}` }}>
              <button style={btn("brandGhost")} onClick={() => { setForm({ name: "", dur: 60, kind: "individual", cap: 12, staff: "Miguel", when: "Business hours" }); setModal("service"); }}><PlusIcon />Add Service or Class</button>
            </div>
          </Card>
        </div>
      </div>

      {/* ---------- Connect calendar modal ---------- */}
      {modal === "connect" && (
        <Modal onClose={close}>
          <ModalTitle title="Connect a calendar" sub="The coach signs in once. Bookings show up on their calendar and busy times stay blocked." />
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={fieldLabel}>Coach</span>
            <input style={inputStyle} placeholder="e.g. Sarah Kim" value={connectName} onChange={(e) => setConnectName(e.target.value)} />
          </label>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={fieldLabel}>Calendar</span>
            {PROVIDERS.map((p) => (
              <button key={p.name} onClick={() => pickProvider(p)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 14, border: `1px solid ${INK200}`, background: WHITE, cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>
                <span style={{ width: 36, height: 36, flex: "none", borderRadius: 10, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, background: p.color, color: WHITE }}>{p.letter}</span>
                <span style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: FG1 }}>{p.name}</span>
                  <span style={{ fontSize: 13, color: FG3 }}>{p.sub}</span>
                </span>
                <Chevron />
              </button>
            ))}
          </div>
          <span style={{ fontSize: 12, color: FG4, textAlign: "center" }}>Opens a secure sign-in window. Milton never sees the password.</span>
        </Modal>
      )}

      {/* ---------- Hours modal ---------- */}
      {modal === "hours" && hoursDraft && (
        <Modal onClose={close}>
          <ModalTitle title="Hours" sub="Set the times members can book, day by day." />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {DAY_NAMES.map((name, i) => {
              const d = hoursDraft[i];
              return (
                <div key={name} style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 40 }}>
                  <button
                    onClick={() => setHoursDraft((h) => h.map((x, j) => (j === i ? { ...x, on: !x.on } : x)))}
                    aria-pressed={d.on}
                    style={{ display: "flex", alignItems: "center", gap: 8, width: 116, flex: "none", background: "transparent", border: 0, cursor: "pointer", fontFamily: "inherit", padding: 0, textAlign: "left" }}
                  >
                    <span style={{ width: 18, height: 18, flex: "none", borderRadius: 6, border: `1.5px solid ${d.on ? TEAL_800 : INK200}`, background: d.on ? TEAL_800 : WHITE, display: "inline-flex", alignItems: "center", justifyContent: "center", color: WHITE }}>
                      {d.on && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7" /></svg>}
                    </span>
                    <span style={{ fontSize: 15, fontWeight: 600, color: d.on ? FG1 : FG3 }}>{name}</span>
                  </button>
                  {d.on ? (
                    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                      <select style={{ ...inputStyle, padding: "8px 10px", fontSize: 14 }} value={d.start} onChange={(e) => setHoursDraft((h) => h.map((x, j) => (j === i ? { ...x, start: e.target.value } : x)))}>
                        {TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <span style={{ color: FG3, fontSize: 14 }}>–</span>
                      <select style={{ ...inputStyle, padding: "8px 10px", fontSize: 14 }} value={d.end} onChange={(e) => setHoursDraft((h) => h.map((x, j) => (j === i ? { ...x, end: e.target.value } : x)))}>
                        {TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <button title="Copy to all open days" onClick={() => setHoursDraft((h) => h.map((x) => (x.on ? { ...x, start: d.start, end: d.end } : x)))} style={{ flex: "none", width: 32, height: 32, borderRadius: 8, border: `1px solid ${INK200}`, background: WHITE, cursor: "pointer", color: FG3, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></svg>
                      </button>
                    </div>
                  ) : (
                    <span style={{ flex: 1, fontSize: 14, color: FG4 }}>Closed</span>
                  )}
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 4 }}>
            <button style={btn("ghost")} onClick={close}>Cancel</button>
            <button style={btn("primary")} onClick={saveHours}>Save Hours</button>
          </div>
        </Modal>
      )}

      {/* ---------- Add service modal ---------- */}
      {modal === "service" && (
        <Modal onClose={close}>
          <ModalTitle title="New service or class" sub="A few things. Milton fills in the rest." />
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={fieldLabel}>Name</span>
            <input style={{ ...inputStyle, fontSize: 16 }} placeholder="e.g. Mobility Class" value={form.name} onChange={(e) => setF({ name: e.target.value })} />
          </label>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={fieldLabel}>Duration</span>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {[30, 45, 60, 90].map((d) => <button key={d} style={chip(form.dur === d)} onClick={() => setF({ dur: d })}>{d} min</button>)}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: form.kind === "group" ? "1fr 1fr" : "1fr", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={fieldLabel}>Type</span>
              <div style={{ display: "flex", gap: 6 }}>
                {[["individual", "Individual"], ["group", "Group"]].map(([k, l]) => <button key={k} style={chip(form.kind === k)} onClick={() => setF({ kind: k })}>{l}</button>)}
              </div>
            </div>
            {form.kind === "group" && (
              <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={fieldLabel}>Spots</span>
                <input style={inputStyle} type="number" min="1" value={form.cap} onChange={(e) => setF({ cap: Math.max(1, +e.target.value || 1) })} />
              </label>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={fieldLabel}>Coach</span>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["Miguel", "Joe", "Any coach"].map((k) => <button key={k} style={chip(form.staff === k)} onClick={() => setF({ staff: k })}>{k}</button>)}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={fieldLabel}>When</span>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <button style={chip(form.when === "Business hours")} onClick={() => setF({ when: "Business hours" })}>During business hours</button>
              <button style={chip(form.when !== "Business hours")} onClick={() => setF({ when: "" })}>Specific times</button>
            </div>
            {form.when !== "Business hours" && (
              <input style={inputStyle} placeholder="e.g. Mon, Wed, Fri at 6:00 AM" value={form.when} onChange={(e) => setF({ when: e.target.value })} />
            )}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 4 }}>
            <button style={btn("ghost")} onClick={close}>Cancel</button>
            <button style={{ ...btn("primary"), ...(form.name.trim() ? {} : { opacity: 0.45, cursor: "default" }) }} disabled={!form.name.trim()} onClick={saveService}>Publish</button>
          </div>
        </Modal>
      )}

      {/* ---------- Member booking preview modal ---------- */}
      {modal === "book" && (
        <Modal width={520} onClose={close}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".08em", color: FG4, textTransform: "uppercase" }}>Member view</span>
            <span style={{ flex: 1 }} />
            {booking.step > 0 && booking.step < 4 && (
              <button style={{ ...btn("ghost"), fontSize: 12.5, padding: "6px 12px" }} onClick={() => setBooking((b) => ({ ...b, step: b.step - 1 }))}>Back</button>
            )}
            <button style={{ ...btn("ghost"), fontSize: 12.5, padding: "6px 12px" }} onClick={close}>Close</button>
          </div>

          {/* Step indicator */}
          {booking.step < 4 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {["Service", "Date", "Time", "Confirm"].map((label, i) => {
                const done = i < booking.step;
                const current = i === booking.step;
                return (
                  <React.Fragment key={label}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 20, height: 20, flex: "none", borderRadius: 999, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, background: done || current ? TEAL_800 : INK100, color: done || current ? WHITE : FG4 }}>{i + 1}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: current ? FG1 : FG4 }}>{label}</span>
                    </span>
                    {i < 3 && <span style={{ flex: 1, height: 1, background: done ? TEAL_800 : INK200 }} />}
                  </React.Fragment>
                );
              })}
            </div>
          )}

          {/* Step 0 — pick a service */}
          {booking.step === 0 && (
            <>
              <h2 style={{ fontSize: 23, fontWeight: 600, letterSpacing: "-.01em", margin: 0 }}>What would you like to book?</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {services.map((s, i) => {
                  const group = s.kind === "group";
                  return (
                    <button key={s.name + i} onClick={() => setBooking({ step: 1, service: s, date: null, time: null })} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 14, border: `1px solid ${INK200}`, background: WHITE, cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>
                      <span style={{ width: 36, height: 36, flex: "none", borderRadius: 10, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, background: group ? "#8B5CF6" : TEAL_800, color: WHITE }}>{group ? "G" : "1"}</span>
                      <span style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                        <span style={{ fontSize: 15, fontWeight: 600, color: FG1 }}>{s.name}</span>
                        <span style={{ fontSize: 13, color: FG3 }}>{serviceMeta(s)}</span>
                      </span>
                      <Chevron />
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Step 1 — pick a date */}
          {booking.step === 1 && booking.service && (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <h2 style={{ fontSize: 23, fontWeight: 600, letterSpacing: "-.01em", margin: 0 }}>Pick a date</h2>
                <span style={{ fontSize: 14, color: FG3 }}>{booking.service.name} · {booking.service.dur} min with {booking.service.staff}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(88px,1fr))", gap: 8 }}>
                {bookingDates.map((d) => {
                  const active = booking.date && booking.date.key === d.key;
                  return (
                    <button key={d.key} onClick={() => setBooking((b) => ({ ...b, date: d, time: null, step: 2 }))} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "12px 8px", borderRadius: 12, border: `1px solid ${active ? TEAL_800 : INK200}`, background: active ? TEAL_050 : WHITE, cursor: "pointer", fontFamily: "inherit" }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: FG3, textTransform: "uppercase", letterSpacing: ".04em" }}>{d.dow.slice(0, 3)}</span>
                      <span style={{ fontSize: 20, fontWeight: 700, color: FG1, lineHeight: 1.1 }}>{d.day}</span>
                      <span style={{ fontSize: 12, color: FG3 }}>{d.month}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Step 2 — pick a time */}
          {booking.step === 2 && booking.service && booking.date && (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <h2 style={{ fontSize: 23, fontWeight: 600, letterSpacing: "-.01em", margin: 0 }}>Pick a time</h2>
                <span style={{ fontSize: 14, color: FG3 }}>{dateLabel(booking.date)} · {booking.service.name}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(96px,1fr))", gap: 8 }}>
                {slotsFor(booking.date).map((t) => {
                  const active = booking.time === t;
                  return (
                    <button key={t} onClick={() => setBooking((b) => ({ ...b, time: t, step: 3 }))} style={{ padding: "12px 8px", borderRadius: 12, border: `1px solid ${active ? TEAL_800 : INK200}`, background: active ? TEAL_050 : WHITE, fontSize: 14, fontWeight: 600, color: TEAL_800, cursor: "pointer", fontFamily: "inherit" }}>{t}</button>
                  );
                })}
              </div>
            </>
          )}

          {/* Step 3 — confirm the details */}
          {booking.step === 3 && booking.service && booking.date && booking.time && (
            <>
              <h2 style={{ fontSize: 23, fontWeight: 600, letterSpacing: "-.01em", margin: 0 }}>Confirm your booking</h2>
              <div style={{ display: "flex", flexDirection: "column", border: `1px solid ${INK200}`, borderRadius: 14, overflow: "hidden" }}>
                {[
                  ["Service", booking.service.name],
                  ["Date", dateLabel(booking.date)],
                  ["Time", booking.time],
                  ["Duration", `${booking.service.dur} min`],
                  ["Coach", booking.service.staff],
                  booking.service.kind === "group" ? ["Type", `Group class · ${booking.service.cap} spots`] : ["Type", "One-on-one"],
                ].map(([k, v], i) => (
                  <div key={k} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "12px 16px", borderTop: i === 0 ? "none" : `1px solid ${B_SUB}` }}>
                    <span style={{ fontSize: 13, color: FG3 }}>{k}</span>
                    <span style={{ fontSize: 14.5, fontWeight: 600, color: FG1, textAlign: "right" }}>{v}</span>
                  </div>
                ))}
              </div>
              <button style={{ ...btn("primary"), width: "100%", padding: "12px 18px", fontSize: 15 }} onClick={() => setBooking((b) => ({ ...b, step: 4 }))}>
                {booking.service.kind === "group" ? "Reserve my spot" : "Confirm booking"}
              </button>
            </>
          )}

          {/* Step 4 — success */}
          {booking.step === 4 && booking.service && (
            <>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "12px 0 4px", textAlign: "center" }}>
                <span style={{ width: 56, height: 56, borderRadius: 999, background: S_BG, color: S_FG, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7" /></svg>
                </span>
                <h2 style={{ fontSize: 23, fontWeight: 600, letterSpacing: "-.01em", margin: 0 }}>{booking.service.kind === "group" ? "Spot reserved" : "You're booked"}</h2>
                <p style={{ fontSize: 15, color: FG2, margin: 0, textWrap: "pretty" }}>{`${booking.service.name} on ${dateLabel(booking.date)} at ${booking.time} with ${booking.service.staff}. It's on the calendar and a reminder goes out the day before.`}</p>
              </div>
              <button style={{ ...btn("primary"), width: "100%", padding: "12px 18px", fontSize: 15 }} onClick={close}>Done</button>
            </>
          )}
        </Modal>
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
