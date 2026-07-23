import { useState, useMemo, useEffect, useCallback } from "react";

/* ============================================================================
   Progress Stories — data-driven social-card engine for Milton.
   Every number in every card is computed from a real client record
   (assessment / sessions / weightData / streak / attendance).
   Formats mirror the four exploration turns:
     Turn 1 (1a-1f): six social-card directions
     Turn 2 (2a-2e): graphs + before/after
     Turn 3 (3a-3e): real people, real sessions (photo slots)
     Turn 4 (4a-4f): 1080x1080 carousels
   A palette bar recolors every card on the canvas.
========================================================================== */

/* ----------------------------- palettes --------------------------------- */
const PALETTES = {
  milton: { name: "Milton", dots: ["#cfe8d0", "#6cc24a", "#0f1720"], ink: "#0f1720", inkSoft: "#1b2630", solid: "#134e4a", accent: "#6cc24a", accentSoft: "#b7e4a0", paper: "#ffffff", paperInk: "#0f1720", chip: "#dff3d6", grid: "#28323c" },
  violet: { name: "Violet", dots: ["#f0abfc", "#d946ef", "#160f26"], ink: "#160f26", inkSoft: "#241634", solid: "#4c1d95", accent: "#c084fc", accentSoft: "#e9d5ff", paper: "#ffffff", paperInk: "#160f26", chip: "#f3e8ff", grid: "#332246" },
  amber: { name: "Amber", dots: ["#7c4a1e", "#f59e0b", "#231708"], ink: "#231708", inkSoft: "#33240f", solid: "#7c4a1e", accent: "#f59e0b", accentSoft: "#fcd9a1", paper: "#fffdf8", paperInk: "#231708", chip: "#fdedd0", grid: "#3a2c14" },
  ocean: { name: "Ocean", dots: ["#93c5fd", "#38bdf8", "#0d1b2e"], ink: "#0d1b2e", inkSoft: "#152740", solid: "#1e3a8a", accent: "#38bdf8", accentSoft: "#bae6fd", paper: "#ffffff", paperInk: "#0d1b2e", chip: "#dbeafe", grid: "#22334d" },
};

const BRAND = "MILTON × MMNT";

/* ----------------------------- helpers ---------------------------------- */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function fmtDate(str) {
  if (!str) return "";
  const d = new Date(str);
  if (isNaN(d)) return str;
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}
function firstName(n) { return (n || "").split(" ")[0]; }
function round(n) { return Math.round(n); }
function maxLift(sessions, re) {
  let best = 0;
  (sessions || []).forEach((s) => (s.exercises || []).forEach((e) => {
    if (re.test(e.name)) (e.sets || []).forEach((st) => { if (st.weight > best) best = st.weight; });
  }));
  return best;
}
function topSet(session) {
  let best = null;
  (session?.exercises || []).forEach((e) => (e.sets || []).forEach((st) => {
    if (!best || st.weight > best.weight) best = { ...st, name: e.name };
  }));
  return best;
}
function sessionVolume(session) {
  let v = 0;
  (session?.exercises || []).forEach((e) => (e.sets || []).forEach((st) => { v += (st.weight || 0) * (st.reps || 0); }));
  return v;
}

/* Build a normalized "story" object from a raw client record. */
function buildStory(client) {
  if (!client) return null;
  const a = client.assessment || {};
  const cur = client.current || {};
  const sessions = client.sessions || [];
  const wd = client.weightData || [];
  const base = a.strengthBaselines || {};

  const bwStart = a.bodyweight ?? wd[0] ?? null;
  const bwNow = cur.bodyweight ?? wd[wd.length - 1] ?? null;
  const bwDelta = bwStart != null && bwNow != null ? round((bwNow - bwStart) * 10) / 10 : null;

  const squatStart = base.squat?.weight ?? null;
  const squatNow = maxLift(sessions, /squat/i) || squatStart;
  const squatDelta = squatStart != null && squatNow != null ? squatNow - squatStart : null;
  const squatPct = squatStart ? round((squatDelta / squatStart) * 100) : null;

  const deadStart = base.deadlift?.weight ?? null;
  const deadNow = maxLift(sessions, /deadlift/i) || deadStart;
  const benchStart = base.benchPress?.weight ?? null;
  const benchNow = maxLift(sessions, /bench/i) || benchStart;

  const latest = sessions[0] || null;
  const ts = topSet(latest);

  const streakBest = client.streak?.best ?? client.streak?.current ?? null;
  const attendance = client.attendanceRate ?? null;
  const total = client.totalSessions ?? sessions.length;
  const planned = attendance ? round(total / (attendance / 100)) : total;

  // squat progression series (baseline -> observed session maxes, oldest->newest)
  const squatSeries = [];
  if (squatStart != null) squatSeries.push(squatStart);
  [...sessions].reverse().forEach((s) => {
    const m = maxLift([s], /squat/i);
    if (m) squatSeries.push(m);
  });
  if (squatSeries.length === 1 && squatNow) squatSeries.push(squatNow);

  // headline metric — the single strongest brag we can prove
  let headline;
  if (squatDelta && squatDelta > 0) headline = { big: `+${squatDelta}`, unit: "lb squat", kind: "squat" };
  else if (bwDelta && bwDelta < 0) headline = { big: `${bwDelta}`, unit: "lb bodyweight", kind: "bw" };
  else headline = { big: `${total}`, unit: "sessions", kind: "sessions" };

  const start = a.date;
  const end = latest?.date;
  let weeks = wd.length ? wd.length : null;
  if (start && end) {
    const d = (new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24 * 7);
    if (d > 0) weeks = round(d);
  }

  return {
    name: client.name, firstName: firstName(client.name), program: client.program, startLabel: fmtDate(start), endLabel: fmtDate(end) || "Now",
    bwStart, bwNow, bwDelta, bwAbs: bwDelta != null ? Math.abs(bwDelta) : null,
    bwPct: bwStart && bwDelta != null ? Math.abs(round((bwDelta / bwStart) * 100 * 10) / 10) : null,
    squatStart, squatNow, squatDelta, squatPct, squatSeries,
    deadStart, deadNow, benchStart, benchNow,
    total, streakBest, attendance, planned, weeks,
    weightData: wd,
    latest: latest ? { type: latest.type, duration: latest.duration, date: fmtDate(latest.date), volume: sessionVolume(latest), topSet: ts } : null,
    goalPrimary: client.goals?.primary, narrative: client.narrative,
    headline,
    readiness: computeReadiness(client),
  };
}

function computeReadiness(client) {
  const wd = client.weightData || [];
  const hasLifts = !!client.assessment?.strengthBaselines;
  const total = client.totalSessions || 0;
  let score = 0;
  if (wd.length >= 5) score += 2; else if (wd.length >= 3) score += 1;
  if (hasLifts) score += 2;
  if (total >= 12) score += 2; else if (total >= 6) score += 1;
  if ((client.sessions || []).length >= 3) score += 1;
  if (score >= 5) return { level: "ready", label: "Story ready", tone: "#2f9e44" };
  if (score >= 3) return { level: "enough", label: "Enough data", tone: "#1f5ba8" };
  return { level: "thin", label: "Thin data", tone: "#9a6409" };
}

/* --------------------------- primitives --------------------------------- */
function CardFrame({ ratio = "9 / 16", bg, color, children, index, total, footer = true, brand = BRAND, pad = 20, radius = 22, style }) {
  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: ratio, background: bg, color, borderRadius: radius, padding: pad, boxSizing: "border-box", overflow: "hidden", display: "flex", flexDirection: "column", fontFamily: "'Inter','Segoe UI',sans-serif" , ...style }}>
      {children}
      {footer && (
        <div style={{ position: "absolute", left: pad, right: pad, bottom: pad * 0.7, display: "flex", justifyContent: "space-between", fontSize: 9, letterSpacing: 1.2, opacity: 0.55, fontWeight: 600 }}>
          <span>{brand}</span>
          {index != null && <span>{String(index).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>}
        </div>
      )}
    </div>
  );
}
function Kicker({ children, color }) {
  return <div style={{ fontSize: 10, letterSpacing: 2, fontWeight: 700, textTransform: "uppercase", color }}>{children}</div>;
}
function PhotoSlot({ label, dark = true }) {
  return (
    <div style={{ flex: 1, borderRadius: 12, background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", border: `1.5px dashed ${dark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.14)"}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 60 }}>
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={dark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.3)"} strokeWidth="1.6"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg>
      {label && <span style={{ fontSize: 11, opacity: 0.55, textAlign: "center", padding: "0 8px" }}>{label}</span>}
    </div>
  );
}
function Bars({ values, accent, base = "#8a95a0", highlightLast = true, height = 120 }) {
  const max = Math.max(...values, 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height }}>
      {values.map((v, i) => {
        const last = i === values.length - 1;
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            {(i === 0 || last) && <span style={{ fontSize: 10, fontWeight: 700, color: last && highlightLast ? accent : "inherit" }}>{v}</span>}
            <div style={{ width: "100%", height: `${(v / max) * 100}%`, minHeight: 4, background: last && highlightLast ? accent : base, borderRadius: 4 }} />
          </div>
        );
      })}
    </div>
  );
}
function LineChart({ values, accent, fill, dark, height = 120, endLabelStart, endLabelEnd }) {
  if (!values || values.length < 2) return null;
  const w = 240, h = height;
  const max = Math.max(...values), min = Math.min(...values);
  const rng = max - min || 1;
  const pts = values.map((v, i) => [(i / (values.length - 1)) * w, h - ((v - min) / rng) * (h - 24) - 12]);
  const d = pts.map((pt, i) => `${i ? "L" : "M"}${pt[0].toFixed(1)},${pt[1].toFixed(1)}`).join(" ");
  const area = `${d} L${w},${h} L0,${h} Z`;
  return (
    <div style={{ position: "relative", width: "100%" }}>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none" style={{ display: "block" }}>
        <path d={area} fill={fill} opacity={0.9} />
        <path d={d} fill="none" stroke={accent} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={pts[0][0]} cy={pts[0][1]} r="4" fill={dark ? "#8a95a0" : "#c3ccd4"} />
        <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="5" fill={accent} />
      </svg>
      <span style={{ position: "absolute", left: 0, bottom: 2, fontSize: 11, fontWeight: 700, opacity: 0.75 }}>{endLabelStart}</span>
      <span style={{ position: "absolute", right: 0, top: 0, fontSize: 11, fontWeight: 700, color: accent }}>{endLabelEnd}</span>
    </div>
  );
}
function Heatmap({ cells, filled, accent, soft, empty, cols = 14 }) {
  const out = [];
  for (let i = 0; i < cells; i++) {
    const on = ((i * 7) % cells) < filled;
    out.push(on ? ((i % 6 === 0) ? soft : accent) : empty);
  }
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 4 }}>
      {out.map((c, i) => <div key={i} style={{ aspectRatio: "1", borderRadius: 3, background: c }} />)}
    </div>
  );
}
function MiltonMark({ p }) {
  return <div style={{ width: 24, height: 24, borderRadius: 6, background: p.accent, display: "flex", alignItems: "center", justifyContent: "center", color: p.ink, fontWeight: 800, fontSize: 13 }}>M</div>;
}
function numberWord(n) {
  const words = { 5: "FIVE", 10: "TEN", 15: "FIFTEEN", 20: "TWENTY", 25: "TWENTY-FIVE", 30: "THIRTY", 35: "THIRTY-FIVE", 40: "FORTY", 45: "FORTY-FIVE", 50: "FIFTY" };
  const rounded = Math.round(n / 5) * 5;
  return words[rounded] || `${n}`;
}
function Dashed() { return <div style={{ borderTop: "1px dashed currentColor", opacity: 0.4, margin: "10px 0" }} />; }

/* --------------------------- format renderers --------------------------- */
// 1a — Editorial light
function F1a({ s, p }) {
  const n = s.weeks || s.total;
  return (
    <CardFrame ratio="9 / 16" bg={p.paper} color={p.paperInk} index={1} total={7}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Kicker color={p.solid}>Milton Wrapped</Kicker>
        <MiltonMark p={p} />
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontSize: 92, fontWeight: 800, lineHeight: 0.9, letterSpacing: -3 }}>{n}</div>
        <div style={{ width: 54, height: 6, borderRadius: 3, background: p.accent, margin: "14px 0" }} />
        <div style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.1 }}>weeks of<br />showing up</div>
        <div style={{ marginTop: 10, fontSize: 12, opacity: 0.6 }}>{s.startLabel} – {s.endLabel} · {s.name}</div>
      </div>
    </CardFrame>
  );
}
// 1b — Heatmap
function F1b({ s, p }) {
  const cells = 84, filled = Math.round(cells * ((s.attendance ?? 85) / 100));
  const rest = cells - filled;
  return (
    <CardFrame ratio="9 / 16" bg={p.ink} color="#fff" index={3} total={7}>
      <Kicker color="rgba(255,255,255,0.6)">{cells} days</Kicker>
      <div style={{ margin: "auto 0" }}>
        <Heatmap cells={cells} filled={filled} accent={p.accent} soft={p.accentSoft} empty={p.grid} />
      </div>
      <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.05 }}>
        {filled} in.<br />{rest} rest.<br /><span style={{ color: p.accent }}>0 quit.</span>
      </div>
    </CardFrame>
  );
}
// 1c — Type poster
function F1c({ s, p }) {
  const big = s.squatDelta && s.squatDelta > 0
    ? { top: numberWord(s.squatDelta), high: "POUNDS", tail: "STRONGER.", sub: `Back squat · ${s.weeks || 12} weeks · no shortcuts` }
    : { top: "SHOWED", high: `UP ${s.total}`, tail: "TIMES.", sub: `${s.startLabel} – ${s.endLabel}` };
  return (
    <CardFrame ratio="9 / 16" bg={p.solid} color="#fff" index={2} total={7}>
      <Kicker color="rgba(255,255,255,0.7)">{s.firstName}</Kicker>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontSize: 46, fontWeight: 800, lineHeight: 0.95, letterSpacing: -1 }}>
          {big.top}<br /><span style={{ color: p.accentSoft }}>{big.high}</span> {big.tail}
        </div>
        <div style={{ marginTop: 16, fontSize: 13, opacity: 0.85 }}>{big.sub}</div>
      </div>
    </CardFrame>
  );
}
// 1d — Photo proof
function F1d({ s, p }) {
  const stat = s.squatDelta > 0 ? { n: s.squatNow, d: `+${s.squatPct}%`, l: `lb back squat · ${s.weeks || 12} weeks` } : { n: s.bwNow, d: `${s.bwDelta}`, l: "lb bodyweight" };
  return (
    <CardFrame ratio="9 / 16" bg={p.inkSoft} color="#fff" index={4} total={7}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Kicker color="rgba(255,255,255,0.6)">Milton Wrapped</Kicker>
        <MiltonMark p={p} />
      </div>
      <PhotoSlot label={`Drop ${s.firstName}'s gym photo`} />
      <div style={{ marginTop: 12, alignSelf: "flex-start", background: "rgba(0,0,0,0.45)", borderRadius: 12, padding: "10px 14px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ fontSize: 30, fontWeight: 800 }}>{stat.n}</span>
          <span style={{ color: p.accent, fontWeight: 700, fontSize: 14 }}>{stat.d}</span>
        </div>
        <div style={{ fontSize: 11, opacity: 0.7 }}>{stat.l}</div>
      </div>
    </CardFrame>
  );
}
// 1e — The split
function F1e({ s, p }) {
  return (
    <CardFrame ratio="9 / 16" bg={p.paper} color={p.paperInk} index={5} total={7} pad={0} footer={false}>
      <div style={{ flex: 1, padding: 20 }}>
        <Kicker color={p.solid}>Day 1 · {s.startLabel}</Kicker>
        <div style={{ display: "flex", gap: 22, marginTop: 14 }}>
          <SplitStat n={s.bwStart} l="lb bodyweight" c={p.paperInk} />
          {s.squatStart != null && <SplitStat n={s.squatStart} l="lb squat" c={p.paperInk} />}
        </div>
      </div>
      <div style={{ position: "relative" }}>
        <span style={{ position: "absolute", top: -14, left: 20, background: p.accent, color: p.ink, fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20 }}>{s.weeks || 12} weeks later</span>
      </div>
      <div style={{ flex: 1, padding: 20, background: p.solid, color: "#fff" }}>
        <Kicker color="rgba(255,255,255,0.7)">Today · {s.endLabel}</Kicker>
        <div style={{ display: "flex", gap: 22, marginTop: 14 }}>
          <SplitStat n={s.bwNow} l={`lb · ${s.bwDelta}`} c="#fff" accent={p.accentSoft} />
          {s.squatNow != null && <SplitStat n={s.squatNow} l={`lb squat · +${s.squatDelta}`} c="#fff" accent={p.accentSoft} />}
        </div>
        <div style={{ marginTop: 14, fontSize: 13, opacity: 0.85 }}>Same person. New baseline.</div>
        <div style={{ marginTop: 18, fontSize: 9, letterSpacing: 1.2, opacity: 0.5, fontWeight: 600 }}>{BRAND} · {s.firstName}</div>
      </div>
    </CardFrame>
  );
}
function SplitStat({ n, l, c, accent }) {
  return (<div><div style={{ fontSize: 34, fontWeight: 800, color: accent || c, lineHeight: 1 }}>{n}</div><div style={{ fontSize: 11, opacity: 0.65, color: c }}>{l}</div></div>);
}
// 1f — The receipt
function F1f({ s, p }) {
  const rows = [
    ["SESSIONS ATTENDED", s.total],
    ["LONGEST STREAK", `${s.streakBest || "—"}${s.streakBest ? " SESS" : ""}`],
    s.squatDelta > 0 ? ["SQUAT ADDED (LB)", `+${s.squatDelta}`] : null,
    s.bwDelta != null ? ["BODYWEIGHT (LB)", s.bwDelta] : null,
    s.attendance != null ? ["ATTENDANCE", `${s.attendance}%`] : null,
    ["EXCUSES ACCEPTED", 0],
  ].filter(Boolean);
  return (
    <CardFrame ratio="9 / 16" bg={p.paper} color={p.paperInk} index={7} total={7} footer={false} pad={0}>
      <div style={{ margin: 18, border: `1px dashed ${p.paperInk}`, borderRadius: 10, padding: "18px 16px", fontFamily: "'Courier New',monospace", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ textAlign: "center", fontWeight: 700, letterSpacing: 1 }}>MILTON &amp; CO.</div>
        <div style={{ textAlign: "center", fontSize: 10, opacity: 0.7, marginTop: 4 }}>RECEIPT OF WORK · {s.name.toUpperCase()}<br />{s.startLabel.toUpperCase()} – {s.endLabel.toUpperCase()}</div>
        <Dashed />
        {rows.map((r, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, padding: "3px 0" }}><span>{r[0]}</span><span style={{ fontWeight: 700 }}>{r[1]}</span></div>
        ))}
        <Dashed />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700 }}><span>TOTAL</span><span>EARNED</span></div>
        <div style={{ textAlign: "center", fontSize: 9, opacity: 0.6, marginTop: "auto" }}>NO REFUNDS. NO SHORTCUTS.</div>
      </div>
    </CardFrame>
  );
}
// 2a — Bar climb
function F2a({ s, p }) {
  const series = s.squatSeries.length >= 3 ? s.squatSeries : (s.weightData.length ? s.weightData : [s.bwStart, s.bwNow]);
  const big = s.squatDelta > 0 ? { n: `+${s.squatDelta} lb`, l: `back squat · ${s.weeks || 12} weeks` } : { n: `${s.total}`, l: "sessions logged" };
  return (
    <CardFrame ratio="9 / 16" bg={p.ink} color="#fff" index={2} total={7}>
      <Kicker color={p.accent}>Strength</Kicker>
      <div style={{ fontSize: 44, fontWeight: 800, color: p.accent, lineHeight: 1 }}>{big.n}</div>
      <div style={{ fontSize: 12, opacity: 0.7 }}>{big.l}</div>
      <div style={{ marginTop: "auto" }}><Bars values={series.map(round)} accent={p.accent} base="#6a7480" /></div>
    </CardFrame>
  );
}
// 2b — Trend line
function F2b({ s, p }) {
  const useBw = s.weightData.length >= 3;
  const values = useBw ? s.weightData : s.squatSeries;
  return (
    <CardFrame ratio="9 / 16" bg={p.paper} color={p.paperInk} index={2} total={7}>
      <Kicker color={p.solid}>{useBw ? "Bodyweight" : "Strength"}</Kicker>
      <div style={{ fontSize: 42, fontWeight: 800, color: p.accent, lineHeight: 1 }}>{useBw ? `${s.bwDelta} lb` : `+${s.squatPct}%`}</div>
      <div style={{ fontSize: 12, opacity: 0.65 }}>{useBw ? `${s.bwStart} → ${s.bwNow} · ${s.weightData.length} weigh-ins` : `${s.squatStart} → ${s.squatNow} lb`}</div>
      <div style={{ marginTop: "auto" }}>
        <LineChart values={values} accent={p.accent} fill={p.chip} dark={false} endLabelStart={values[0]} endLabelEnd={values[values.length - 1]} />
      </div>
    </CardFrame>
  );
}
// 2c — Before/after stacked
function F2c({ s, p }) {
  return (
    <CardFrame ratio="9 / 16" bg={p.ink} color="#fff" index={2} total={7} footer={false} pad={0}>
      <div style={{ position: "relative", flex: 1, margin: 14, borderRadius: 12, overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1, position: "relative", background: "rgba(255,255,255,0.04)", borderBottom: "2px solid rgba(255,255,255,0.15)" }}>
            <span style={{ position: "absolute", top: 10, left: 10, background: "rgba(0,0,0,0.5)", padding: "4px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700 }}>DAY 1 · {s.startLabel}</span>
          </div>
          <div style={{ flex: 1, position: "relative", background: "rgba(255,255,255,0.02)" }}>
            <span style={{ position: "absolute", top: 10, left: 10, background: p.accent, color: p.ink, padding: "4px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700 }}>WEEK {s.weeks || 12} · {s.endLabel}</span>
          </div>
        </div>
        <span style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: "#fff", color: p.ink, fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20 }}>{s.weeks || 12} weeks</span>
      </div>
      <div style={{ margin: "0 14px 14px", background: "rgba(0,0,0,0.4)", borderRadius: 12, padding: "12px 14px" }}>
        <div style={{ fontSize: 18, fontWeight: 800 }}>{s.bwDelta} lb{s.squatDelta > 0 ? ` · +${s.squatDelta} lb squat` : ""}</div>
        <div style={{ fontSize: 9, letterSpacing: 1, opacity: 0.55, marginTop: 4 }}>{BRAND} · {s.firstName}</div>
      </div>
    </CardFrame>
  );
}
// 2d — Before/after split
function F2d({ s, p }) {
  return (
    <CardFrame ratio="9 / 16" bg={p.ink} color="#fff" index={2} total={7} footer={false} pad={0}>
      <div style={{ flex: 1, display: "flex", position: "relative" }}>
        <div style={{ flex: 1, position: "relative", background: "rgba(255,255,255,0.04)", borderRight: "1px solid rgba(255,255,255,0.15)" }}>
          <span style={{ position: "absolute", top: 12, left: 12, background: "rgba(0,0,0,0.5)", padding: "4px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700 }}>DAY 1</span>
        </div>
        <div style={{ flex: 1, position: "relative", background: "rgba(255,255,255,0.02)" }}>
          <span style={{ position: "absolute", top: 12, right: 12, background: p.accent, color: p.ink, padding: "4px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700 }}>WEEK {s.weeks || 12}</span>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", padding: 18 }}>
        <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.05 }}>Same<br />person.<br /><span style={{ color: p.accent }}>New baseline.</span></div>
        <div style={{ textAlign: "right", fontSize: 12, fontWeight: 700 }}>{s.bwDelta} lb{s.bwPct ? ` · -${s.bwPct}%` : ""}<div style={{ fontSize: 9, opacity: 0.55, marginTop: 6 }}>{BRAND}</div></div>
      </div>
    </CardFrame>
  );
}
// 2e — Before/after inset polaroid
function F2e({ s, p }) {
  return (
    <CardFrame ratio="9 / 16" bg={p.inkSoft} color="#fff" index={2} total={7}>
      <PhotoSlot label="Drop today's photo (full bleed)" />
      <div style={{ position: "absolute", top: 40, right: 26, width: 92, background: "#fff", padding: 8, borderRadius: 4, transform: "rotate(6deg)", boxShadow: "0 8px 20px rgba(0,0,0,0.4)" }}>
        <div style={{ aspectRatio: "1", background: "#e9edf0", borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9aa4ad" strokeWidth="1.6"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg>
        </div>
        <div style={{ fontSize: 9, color: "#333", marginTop: 4, textAlign: "center", fontWeight: 600 }}>Day 1</div>
      </div>
      <div style={{ position: "absolute", left: 20, right: 20, bottom: 44 }}>
        <div style={{ fontSize: 26, fontWeight: 800 }}>{s.weeks || 12} weeks later</div>
        <div style={{ fontSize: 12, color: p.accent, fontWeight: 700 }}>{s.bwDelta} lb{s.squatDelta > 0 ? ` · +${s.squatDelta} lb squat` : ""} · {s.total} sessions</div>
      </div>
    </CardFrame>
  );
}
// 3a — PR moment
function F3a({ s, p }) {
  const ts = s.latest?.topSet;
  const pr = ts ? `${ts.weight} × ${ts.reps}` : (s.squatNow ? `${s.squatNow} × 5` : `${s.total}`);
  return (
    <CardFrame ratio="9 / 16" bg={p.inkSoft} color="#fff" index={3} total={7} footer={false} pad={0}>
      <span style={{ position: "absolute", top: 16, left: 16, background: "rgba(0,0,0,0.55)", padding: "5px 12px", borderRadius: 20, fontSize: 10, fontWeight: 700, letterSpacing: 0.5, zIndex: 2 }}>DURING SESSION · {s.latest?.date || s.endLabel}</span>
      <PhotoSlot label="Drop the lift photo — mid-rep" />
      <div style={{ background: "rgba(0,0,0,0.4)", padding: 18 }}>
        <Kicker color={p.accent}>New PR</Kicker>
        <div style={{ fontSize: 42, fontWeight: 800, color: p.accent, lineHeight: 1 }}>{pr}</div>
        <div style={{ fontSize: 12, opacity: 0.75 }}>{ts ? ts.name.toLowerCase() : "back squat"}{s.squatDelta > 0 ? ` · up ${s.squatDelta} lb since Day 1` : ""}</div>
        <div style={{ fontSize: 9, letterSpacing: 1, opacity: 0.5, marginTop: 10, display: "flex", justifyContent: "space-between" }}><span>{BRAND}</span><span>{s.name.toUpperCase()}</span></div>
      </div>
    </CardFrame>
  );
}
// 3b — Sweat receipt
function F3b({ s, p }) {
  const l = s.latest;
  const ts = l?.topSet;
  return (
    <CardFrame ratio="9 / 16" bg={p.paper} color={p.paperInk} index={3} total={7}>
      <div style={{ position: "relative", flex: 1, borderRadius: 12, marginBottom: 12 }}>
        <span style={{ position: "absolute", top: 10, left: 10, background: p.accent, color: p.ink, padding: "4px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700, zIndex: 2 }}>DONE · 7:42 AM</span>
        <PhotoSlot label="Drop the post-session selfie" dark={false} />
      </div>
      <StatTable rows={[
        ["Session", l ? `${l.type} · ${l.duration} min` : s.program],
        l ? ["Total volume", `${l.volume.toLocaleString()} lb`] : null,
        ts ? ["Top set", `${ts.weight} × ${ts.reps} · PR`] : null,
        ["Streak", `${s.streakBest || s.total} unbroken`],
      ].filter(Boolean)} p={p} />
    </CardFrame>
  );
}
function StatTable({ rows, p }) {
  return (
    <div>
      {rows.map((r, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderTop: i ? `1px dashed ${p.paperInk}22` : "none", fontSize: 13 }}>
          <span style={{ opacity: 0.6 }}>{r[0]}</span>
          <span style={{ fontWeight: 700, color: String(r[1]).includes("PR") ? p.accent : "inherit" }}>{r[1]}</span>
        </div>
      ))}
    </div>
  );
}
// 3c — Milestone duo
function F3c({ s, p }) {
  return (
    <CardFrame ratio="9 / 16" bg={p.inkSoft} color="#fff" index={3} total={7} footer={false} pad={0}>
      <div style={{ display: "flex", gap: 10, padding: 14 }}>
        <span style={{ background: "rgba(0,0,0,0.55)", padding: "6px 12px", borderRadius: 8, fontSize: 10, fontWeight: 700 }}>AFTER SESSION</span>
        <span style={{ background: "#fff", color: p.solid, padding: "6px 12px", borderRadius: 8, fontSize: 10, fontWeight: 700 }}>MMNT COACHING</span>
      </div>
      <PhotoSlot label="Drop the coach + client photo" />
      <div style={{ margin: 14, background: "rgba(0,0,0,0.45)", borderRadius: 12, padding: 16 }}>
        <div style={{ fontSize: 26, fontWeight: 800 }}>Session <span style={{ color: p.accent }}>{s.total}</span></div>
        <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>{s.name} · since {s.startLabel}</div>
        <div style={{ fontSize: 9, letterSpacing: 1, opacity: 0.5, marginTop: 10 }}>{BRAND}</div>
      </div>
    </CardFrame>
  );
}
// 3d — Wins wall
function F3d({ s, p, roster }) {
  const wins = (roster || []).slice(0, 4);
  return (
    <CardFrame ratio="9 / 16" bg={p.inkSoft} color="#fff" index={3} total={7}>
      <Kicker color="rgba(255,255,255,0.6)">This week at MMNT Coaching</Kicker>
      <div style={{ fontSize: 26, fontWeight: 800, margin: "6px 0 12px" }}>{wins.length} clients. {wins.length} PRs.</div>
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {wins.map((w, i) => (
          <div key={i} style={{ position: "relative", background: "rgba(255,255,255,0.05)", border: "1px dashed rgba(255,255,255,0.15)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", padding: 8 }}>
            <span style={{ fontSize: 11, opacity: 0.55, textAlign: "center" }}>{w.firstName}</span>
            <span style={{ position: "absolute", bottom: 8, left: 8, background: p.accent, color: p.ink, fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 20 }}>{w.win}</span>
          </div>
        ))}
      </div>
    </CardFrame>
  );
}
// 3e — Check-in strip
function F3e({ s, p }) {
  const wd = s.weightData.length ? s.weightData : [s.bwStart, s.bwNow];
  const wk1 = wd[0], wk6 = wd[Math.floor(wd.length / 2)] ?? wd[0], wk12 = wd[wd.length - 1];
  const cols = [["WK 1", wk1], ["WK 6", wk6], [`WK ${s.weeks || wd.length}`, wk12]];
  return (
    <CardFrame ratio="9 / 16" bg={p.paper} color={p.paperInk} index={5} total={7} footer={false}>
      <Kicker color={p.solid}>Progress check-ins</Kicker>
      <div style={{ fontSize: 22, fontWeight: 800, margin: "6px 0 14px" }}>Same pose. {s.weeks || wd.length} weeks apart.</div>
      <div style={{ flex: 1, display: "flex", gap: 8 }}>
        {cols.map((c, i) => {
          const active = i === cols.length - 1;
          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ flex: 1, borderRadius: 10, background: "#eceff1", border: active ? `2px solid ${p.accent}` : "1px solid #dfe4e7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9aa4ad" strokeWidth="1.6"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: active ? p.accent : "inherit" }}>{c[0]}</div>
                <div style={{ fontSize: 10, opacity: 0.55 }}>{c[1]} lb</div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
        <span style={{ fontSize: 22, fontWeight: 800, color: p.accent }}>{s.bwDelta} lb</span>
        <span style={{ fontSize: 9, letterSpacing: 1, opacity: 0.5, fontWeight: 600 }}>{BRAND}</span>
      </div>
    </CardFrame>
  );
}
/* Carousels (turn 4) */
function Carousel({ frames }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
      {frames.map((f, i) => <div key={i}>{f}</div>)}
    </div>
  );
}
function F2dMini({ s, p }) {
  return (
    <CardFrame ratio="1 / 1" bg={p.ink} color="#fff" index={2} total={3} footer={false} pad={0}>
      <div style={{ flex: 1, display: "flex" }}>
        <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", borderRight: "1px solid rgba(255,255,255,0.15)", position: "relative" }}><span style={{ position: "absolute", top: 8, left: 8, fontSize: 9, background: "rgba(0,0,0,0.5)", padding: "3px 8px", borderRadius: 12, fontWeight: 700 }}>DAY 1</span></div>
        <div style={{ flex: 1, background: "rgba(255,255,255,0.02)", position: "relative" }}><span style={{ position: "absolute", top: 8, right: 8, fontSize: 9, background: p.accent, color: p.ink, padding: "3px 8px", borderRadius: 12, fontWeight: 700 }}>WK {s.weeks || 12}</span></div>
      </div>
      <div style={{ textAlign: "center", padding: 10, fontSize: 12, fontWeight: 700 }}>{s.bwDelta} lb{s.squatDelta > 0 ? ` · +${s.squatDelta} lb squat` : ""}</div>
    </CardFrame>
  );
}
function F4a({ s, p }) {
  return <Carousel frames={[
    <CardFrame ratio="1 / 1" bg={p.ink} color="#fff" index={1} total={3}><Kicker color="rgba(255,255,255,0.6)">{s.firstName}'s {s.weeks || 12} weeks</Kicker><div style={{ margin: "auto 0", fontSize: 30, fontWeight: 800, lineHeight: 1 }}>Same person. <span style={{ color: p.accent }}>{s.weeks || 12} weeks apart.</span></div></CardFrame>,
    <F2dMini s={s} p={p} />,
    <CardFrame ratio="1 / 1" bg={p.paper} color={p.paperInk} index={3} total={3}><Kicker color={p.solid}>Bodyweight</Kicker><div style={{ fontSize: 30, fontWeight: 800, color: p.accent }}>{s.bwDelta} lb</div><div style={{ marginTop: "auto" }}><LineChart values={s.weightData.length ? s.weightData : [s.bwStart, s.bwNow]} accent={p.accent} fill={p.chip} dark={false} height={80} endLabelStart={s.bwStart} endLabelEnd={s.bwNow} /></div></CardFrame>,
  ]} />;
}
function F4b({ s, p }) {
  const series = s.squatSeries.length >= 3 ? s.squatSeries.map(round) : [s.squatStart, s.squatNow].filter(Boolean);
  const ts = s.latest?.topSet;
  return <Carousel frames={[
    <CardFrame ratio="1 / 1" bg={p.inkSoft} color="#fff" index={1} total={3} footer={false} pad={0}><PhotoSlot label="Drop the lift photo" /><div style={{ background: "rgba(0,0,0,0.45)", padding: 12 }}><div style={{ fontSize: 22, fontWeight: 800, color: p.accent }}>{ts ? `${ts.weight} × ${ts.reps}` : s.squatNow}</div><div style={{ fontSize: 10, opacity: 0.7 }}>back squat · new PR</div></div></CardFrame>,
    <CardFrame ratio="1 / 1" bg={p.ink} color="#fff" index={2} total={3}><Kicker color={p.accent}>Strength</Kicker><div style={{ fontSize: 26, fontWeight: 800, color: p.accent }}>{s.squatDelta > 0 ? `+${s.squatDelta} lb` : `${s.total}`}</div><div style={{ marginTop: "auto" }}><Bars values={series.length >= 2 ? series : [s.total]} accent={p.accent} base="#6a7480" height={70} /></div></CardFrame>,
    <CardFrame ratio="1 / 1" bg={p.paper} color={p.paperInk} index={3} total={3}><Kicker color={p.solid}>Session receipt</Kicker><div style={{ marginTop: 8 }}><StatTable rows={[["Session", s.latest ? `${s.latest.type}` : s.program], s.latest ? ["Volume", `${s.latest.volume.toLocaleString()} lb`] : null, ["Streak", `${s.streakBest || s.total}`]].filter(Boolean)} p={p} /></div></CardFrame>,
  ]} />;
}
function F3dGridMini({ roster, p }) {
  const wins = (roster || []).slice(0, 4);
  return (
    <CardFrame ratio="1 / 1" bg={p.inkSoft} color="#fff" index={2} total={3} footer={false}>
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        {wins.map((w, i) => (
          <div key={i} style={{ position: "relative", background: "rgba(255,255,255,0.05)", border: "1px dashed rgba(255,255,255,0.15)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ position: "absolute", bottom: 5, left: 5, background: p.accent, color: p.ink, fontSize: 8, fontWeight: 700, padding: "2px 6px", borderRadius: 10 }}>{w.win}</span>
          </div>
        ))}
      </div>
    </CardFrame>
  );
}
function F4c({ s, p, roster }) {
  return <Carousel frames={[
    <CardFrame ratio="1 / 1" bg={p.solid} color="#fff" index={1} total={3}><Kicker color="rgba(255,255,255,0.7)">This week at MMNT</Kicker><div style={{ margin: "auto 0", fontSize: 34, fontWeight: 800, lineHeight: 1 }}>{(roster || []).length} clients.<br />{(roster || []).length} PRs.</div></CardFrame>,
    <F3dGridMini roster={roster} p={p} />,
    <CardFrame ratio="1 / 1" bg={p.inkSoft} color="#fff" index={3} total={3}><span style={{ background: "rgba(0,0,0,0.5)", alignSelf: "flex-start", padding: "4px 10px", borderRadius: 12, fontSize: 9, fontWeight: 700 }}>AFTER SESSION</span><div style={{ marginTop: "auto", fontSize: 22, fontWeight: 800 }}>Session <span style={{ color: p.accent }}>{s.total}</span></div><div style={{ fontSize: 10, opacity: 0.7 }}>{s.firstName} · since {s.startLabel}</div></CardFrame>,
  ]} />;
}
function F4d({ s, p }) {
  const cells = 60, filled = Math.round(cells * ((s.attendance ?? 85) / 100));
  return <Carousel frames={[
    <CardFrame ratio="1 / 1" bg={p.ink} color="#fff" index={1} total={3}><Kicker color="rgba(255,255,255,0.6)">Consistency</Kicker><div style={{ margin: "auto 0", fontSize: 28, fontWeight: 800, lineHeight: 1 }}>{s.total} sessions.<br /><span style={{ color: p.accent }}>Zero excuses.</span></div></CardFrame>,
    <CardFrame ratio="1 / 1" bg={p.paper} color={p.paperInk} index={2} total={3}><Kicker color={p.solid}>{s.weeks || 12} weeks logged</Kicker><div style={{ margin: "auto 0" }}><Heatmap cells={cells} filled={filled} accent={p.accent} soft={p.accentSoft} empty="#e6eaed" cols={10} /></div><div style={{ fontSize: 14, fontWeight: 800, color: p.accent }}>{s.total} of {s.planned} planned</div></CardFrame>,
    <CardFrame ratio="1 / 1" bg={p.inkSoft} color="#fff" index={3} total={3} footer={false} pad={0}><PhotoSlot label="Drop a gym photo" /><div style={{ background: "rgba(0,0,0,0.45)", padding: 12 }}><div style={{ fontSize: 18, fontWeight: 800 }}>{s.streakBest || s.total} unbroken</div><div style={{ fontSize: 10, opacity: 0.7 }}>longest streak · {s.firstName}</div></div></CardFrame>,
  ]} />;
}
function F4e({ s, p }) {
  const wd = s.weightData.length ? s.weightData : [s.bwStart, s.bwNow];
  const idx = [0, Math.floor(wd.length / 2), wd.length - 1];
  const labels = ["Keep swiping →", `${round((wd[idx[1]] ?? wd[0]) - wd[0])} lb and counting`, `${s.bwDelta} lb`];
  return <Carousel frames={idx.map((ix, i) => (
    <CardFrame key={i} ratio="1 / 1" bg={p.inkSoft} color="#fff" index={i + 1} total={3} footer={false} pad={0}>
      <span style={{ position: "absolute", top: 10, left: 10, background: i === 2 ? p.accent : "rgba(0,0,0,0.5)", color: i === 2 ? p.ink : "#fff", padding: "4px 10px", borderRadius: 12, fontSize: 9, fontWeight: 700, zIndex: 2 }}>WK {i === 0 ? 1 : i === 1 ? Math.ceil((s.weeks || wd.length) / 2) : s.weeks || wd.length} · {wd[ix]} LB</span>
      <PhotoSlot label={`Wk ${i === 0 ? 1 : i === 1 ? 6 : 12} photo`} />
      <div style={{ background: "rgba(0,0,0,0.4)", padding: 12, fontSize: 14, fontWeight: 800, color: i === 2 ? p.accent : "#fff" }}>{labels[i]}</div>
    </CardFrame>
  ))} />;
}
function F4f({ s, p }) {
  return <Carousel frames={[
    <CardFrame ratio="1 / 1" bg={p.inkSoft} color="#fff" index={1} total={3} footer={false} pad={0}><span style={{ position: "absolute", top: 10, left: 10, background: "#fff", color: p.solid, padding: "4px 10px", borderRadius: 12, fontSize: 9, fontWeight: 700, zIndex: 2 }}>CLIENT SPOTLIGHT</span><PhotoSlot label="Drop the client portrait" /><div style={{ background: "rgba(0,0,0,0.45)", padding: 12 }}><div style={{ fontSize: 18, fontWeight: 800 }}>{s.name}</div><div style={{ fontSize: 10, opacity: 0.7 }}>{s.program}</div></div></CardFrame>,
    <CardFrame ratio="1 / 1" bg={p.inkSoft} color="#fff" index={2} total={3}><Kicker color="rgba(255,255,255,0.6)">{s.firstName} by the numbers</Kicker><div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>{[[s.deadNow || s.squatNow || "—", s.deadNow ? "deadlift, lb" : "squat, lb"], [s.bwDelta ?? "—", "bodyweight, lb"], [s.total, "sessions logged"], [s.streakBest || "—", "best streak"]].map((c, i) => (<div key={i} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: 10 }}><div style={{ fontSize: 22, fontWeight: 800, color: p.accent }}>{c[0]}</div><div style={{ fontSize: 9, opacity: 0.6 }}>{c[1]}</div></div>))}</div></CardFrame>,
    <CardFrame ratio="1 / 1" bg={p.solid} color="#fff" index={3} total={3}><Kicker color="rgba(255,255,255,0.7)">From Coach</Kicker><div style={{ margin: "auto 0", fontSize: 16, fontWeight: 700, lineHeight: 1.35 }}>"{s.firstName} showed up week after week. The numbers are just what showing up looks like."</div><div style={{ fontSize: 11, fontWeight: 700 }}>Train with MMNT Coaching →</div></CardFrame>,
  ]} />;
}

/* ---------------------- formats registry (explorations) ----------------- */
const FORMATS = [
  { turn: "Turn 1 · Story card directions", turnDesc: "Six directions for the social cards — same data, different brag.", id: "1a", name: "Editorial light", desc: "Gallery-wall number, premium in a bright feed", Comp: F1a },
  { turn: "Turn 1 · Story card directions", id: "1b", name: "The heatmap", desc: "Days as pixels — the Strava move, data is the hero", Comp: F1b },
  { turn: "Turn 1 · Story card directions", id: "1c", name: "Type poster", desc: "No chart, all statement — loudest thumbnail", Comp: F1c },
  { turn: "Turn 1 · Story card directions", id: "1d", name: "Photo proof", desc: "Client's own photo, stat badge on top", Comp: F1d },
  { turn: "Turn 1 · Story card directions", id: "1e", name: "The split", desc: "Day 1 vs today as two literal halves", Comp: F1e },
  { turn: "Turn 1 · Story card directions", id: "1f", name: "The receipt", desc: "\"The receipts,\" literally — playful finale", Comp: F1f },

  { turn: "Turn 2 · Graphs + before/after", turnDesc: "Charts that make you hit share, plus before/after photo templates.", id: "2a", name: "The bar climb", desc: "Tiny first bar, towering last — the flex chart", Comp: F2a },
  { turn: "Turn 2 · Graphs + before/after", id: "2b", name: "Trend lines", desc: "Weight descent / strength climb — every dot a logged week", Comp: F2b },
  { turn: "Turn 2 · Graphs + before/after", id: "2c", name: "Before/after — stacked", desc: "Day 1 on top, today below, delta chip on the seam", Comp: F2c },
  { turn: "Turn 2 · Graphs + before/after", id: "2d", name: "Before/after — split", desc: "Side-by-side with a stat footer", Comp: F2d },
  { turn: "Turn 2 · Graphs + before/after", id: "2e", name: "Before/after — inset", desc: "Today full-bleed, day 1 as a pinned polaroid", Comp: F2e },

  { turn: "Turn 3 · Real people, real sessions", turnDesc: "Templates built around one quick photo before, during, or after a session.", id: "3a", name: "The PR moment · client", desc: "Captured during the session — the number does the talking", Comp: F3a },
  { turn: "Turn 3 · Real people, real sessions", id: "3b", name: "The sweat receipt · client", desc: "Post-session selfie stapled to the session's numbers", Comp: F3b },
  { turn: "Turn 3 · Real people, real sessions", id: "3c", name: "The milestone duo · coach", desc: "Coach + client after a milestone session", Comp: F3c },
  { turn: "Turn 3 · Real people, real sessions", id: "3d", name: "The wins wall · coach", desc: "Four client wins from the week — coach's recap", Comp: F3d, roster: true },
  { turn: "Turn 3 · Real people, real sessions", id: "3e", name: "The check-in strip · client", desc: "Same pose across weeks becomes a timeline", Comp: F3e },

  { turn: "Turn 4 · 1080×1080 carousels", turnDesc: "Story cards recut as square swipe sequences — each row is one post.", id: "4a", name: "Transformation carousel · client", desc: "Hook cover → before/after → the trend receipt", Comp: F4a, wide: true },
  { turn: "Turn 4 · 1080×1080 carousels", id: "4b", name: "PR day carousel · client", desc: "The lift photo → the bar climb → the sweat receipt", Comp: F4b, wide: true },
  { turn: "Turn 4 · 1080×1080 carousels", id: "4c", name: "Coach wins carousel · coach", desc: "Weekly recap cover → the wins wall → milestone close", Comp: F4c, wide: true, roster: true },
  { turn: "Turn 4 · 1080×1080 carousels", id: "4d", name: "Consistency carousel · client", desc: "Type-poster hook → the heatmap → proof photo", Comp: F4d, wide: true },
  { turn: "Turn 4 · 1080×1080 carousels", id: "4e", name: "Check-in strip carousel · client", desc: "One check-in photo per frame — the swipe is the timeline", Comp: F4e, wide: true },
  { turn: "Turn 4 · 1080×1080 carousels", id: "4f", name: "Client spotlight carousel · coach", desc: "Full-bleed portrait → the numbers → coach close with CTA", Comp: F4f, wide: true },
];

/* the client story deck used in the player (7 vertical cards) */
const DECK = [F1c, F1a, F2a, F1e, F1b, F3b, F1f];

/* build a roster of quick wins for the coach cards */
function buildRoster(stories) {
  return stories.map((s) => {
    let win = `${s.total} sessions`;
    if (s.squatDelta > 0) win = `+${s.squatDelta} lb squat`;
    else if (s.bwDelta < 0) win = `${s.bwDelta} lb`;
    return { firstName: s.firstName, win };
  });
}

/* ------------------------------ chrome ---------------------------------- */
function Chrome({ title, subtitle, onClose, onHome, right }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", borderBottom: "1px solid var(--border, #e5e7eb)", background: "var(--card, #fff)", flexShrink: 0 }}>
      <button onClick={onHome} title="Home" style={iconBtn}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
      </button>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 15 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, opacity: 0.6 }}>{subtitle}</div>}
      </div>
      {right}
      <button onClick={onClose} title="Close" style={iconBtn}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
      </button>
    </div>
  );
}
const iconBtn = { width: 34, height: 34, borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", background: "var(--card,#fff)", color: "var(--foreground,#111)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" };
const ghostBtn = { padding: "8px 14px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", background: "var(--card,#fff)", color: "var(--foreground,#111)", cursor: "pointer", fontWeight: 600, fontSize: 13 };
const primaryBtn = (p) => ({ padding: "8px 14px", borderRadius: 8, border: "none", background: p.solid, color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 13 });

/* =============================== MAIN =================================== */
export default function StoriesCanvas({ onClose, onHome, clients = [] }) {
  const [palKey, setPalKey] = useState("milton");
  const p = PALETTES[palKey];

  const allStories = useMemo(() => (clients || []).map(buildStory).filter(Boolean), [clients]);
  const stories = useMemo(() => allStories.filter((s) => s.readiness.level !== "thin"), [allStories]);
  const roster = useMemo(() => buildRoster(stories.length ? stories : allStories), [stories, allStories]);

  const [view, setView] = useState("library");
  const [selName, setSelName] = useState(stories[0]?.name || allStories[0]?.name || null);
  const [showNew, setShowNew] = useState(false);
  const [toast, setToast] = useState(null);
  const [playIdx, setPlayIdx] = useState(0);

  const selected = useMemo(() => allStories.find((s) => s.name === selName) || stories[0] || allStories[0] || null, [allStories, stories, selName]);
  const notify = useCallback((m) => { setToast(m); setTimeout(() => setToast(null), 2200); }, []);

  useEffect(() => {
    if (view !== "player") return;
    const onKey = (e) => {
      if (e.key === "Escape") setView("review");
      else if (e.key === "ArrowRight") setPlayIdx((i) => Math.min(i + 1, DECK.length - 1));
      else if (e.key === "ArrowLeft") setPlayIdx((i) => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [view]);

  if (!allStories.length) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <Chrome title="Progress Stories" onClose={onClose} onHome={onHome} />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.6 }}>No client data available yet.</div>
      </div>
    );
  }

  const paletteBar = (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <span style={{ fontSize: 10, letterSpacing: 1.5, fontWeight: 700, opacity: 0.5, marginRight: 4 }}>PALETTE</span>
      {Object.entries(PALETTES).map(([k, pal]) => (
        <button key={k} onClick={() => setPalKey(k)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 20, border: `1.5px solid ${palKey === k ? "var(--foreground,#111)" : "var(--border,#e5e7eb)"}`, background: "var(--card,#fff)", color: "var(--foreground,#111)", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
          <span style={{ display: "flex" }}>{pal.dots.map((d, i) => <span key={i} style={{ width: 9, height: 9, borderRadius: "50%", background: d, marginLeft: i ? -3 : 0, border: "1px solid rgba(0,0,0,0.1)" }} />)}</span>
          {pal.name}
        </button>
      ))}
    </div>
  );

  const clientPicker = (
    <select value={selName || ""} onChange={(e) => { setSelName(e.target.value); setPlayIdx(0); }} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", background: "var(--card,#fff)", color: "var(--foreground,#111)", fontWeight: 600, fontSize: 13, maxWidth: 240 }}>
      {allStories.map((s) => <option key={s.name} value={s.name}>{s.name} — {s.readiness.label}</option>)}
    </select>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--background,#f6f7f8)", color: "var(--foreground,#111)", position: "relative" }}>
      <Chrome
        title="Progress Stories"
        subtitle={view === "formats" ? "Card format explorations" : `${stories.length} ready · ${allStories.length} clients`}
        onClose={onClose}
        onHome={onHome}
        right={
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setView(view === "formats" ? "library" : "formats")} style={ghostBtn}>{view === "formats" ? "← Stories" : "Explore formats"}</button>
            {view !== "formats" && <button onClick={() => setShowNew(true)} style={primaryBtn(p)}>+ New story</button>}
          </div>
        }
      />

      <div style={{ flex: 1, overflowY: "auto" }}>
        {view === "library" && <Library stories={stories} allStories={allStories} p={p} onReview={(n) => { setSelName(n); setView("review"); }} onPlay={(n) => { setSelName(n); setPlayIdx(0); setView("player"); }} />}
        {view === "review" && selected && <Review s={selected} p={p} picker={clientPicker} onPlay={() => { setPlayIdx(0); setView("player"); }} onBack={() => setView("library")} notify={notify} />}
        {view === "formats" && selected && <Formats s={selected} p={p} paletteBar={paletteBar} picker={clientPicker} roster={roster} />}
      </div>

      {view === "player" && selected && (
        <Player s={selected} p={p} idx={playIdx} setIdx={setPlayIdx} onClose={() => setView("review")} />
      )}

      {showNew && <NewStoryModal allStories={allStories} p={p} onClose={() => setShowNew(false)} onCreate={(n) => { setShowNew(false); setSelName(n); setView("review"); notify(`Story generated for ${firstName(n)}`); }} />}

      {toast && <div style={{ position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "var(--foreground,#111)", color: "var(--background,#fff)", padding: "10px 18px", borderRadius: 24, fontSize: 13, fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.2)", zIndex: 50 }}>{toast}</div>}
    </div>
  );
}

/* ------------------------------ library --------------------------------- */
function Library({ stories, allStories, p, onReview, onPlay }) {
  const ready = stories;
  const thin = allStories.filter((s) => !stories.includes(s));
  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 24 }}>
      <div style={{ background: p.ink, color: "#fff", borderRadius: 16, padding: 20, display: "flex", alignItems: "center", gap: 16, marginBottom: 22 }}>
        <div style={{ width: 42, height: 42, borderRadius: 10, background: p.accent, color: p.ink, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>M</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700 }}>Auto-generate is on</div>
          <div style={{ fontSize: 13, opacity: 0.75 }}>Milton drafts a shareable story whenever a client hits a milestone. {ready.length} are ready to review.</div>
        </div>
      </div>

      <SectionLabel>Ready to send · {ready.length}</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16, marginBottom: 26 }}>
        {ready.map((s) => <QueueRow key={s.name} s={s} p={p} onReview={() => onReview(s.name)} onPlay={() => onPlay(s.name)} />)}
      </div>

      {thin.length > 0 && (<>
        <SectionLabel>Needs more data · {thin.length}</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16 }}>
          {thin.map((s) => <QueueRow key={s.name} s={s} p={p} muted onReview={() => onReview(s.name)} onPlay={() => onPlay(s.name)} />)}
        </div>
      </>)}
    </div>
  );
}
function SectionLabel({ children }) { return <div style={{ fontSize: 12, letterSpacing: 1, fontWeight: 700, textTransform: "uppercase", opacity: 0.5, marginBottom: 12 }}>{children}</div>; }
function QueueRow({ s, p, onReview, onPlay, muted }) {
  return (
    <div style={{ border: "1px solid var(--border,#e5e7eb)", borderRadius: 14, padding: 16, background: "var(--card,#fff)", opacity: muted ? 0.75 : 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 38, height: 38, borderRadius: "50%", background: p.chip, color: p.solid, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{s.firstName[0]}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700 }}>{s.name}</div>
          <div style={{ fontSize: 12, opacity: 0.6 }}>{s.program}</div>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color: s.readiness.tone, background: `${s.readiness.tone}1a`, padding: "3px 9px", borderRadius: 20 }}>{s.readiness.label}</span>
      </div>
      <div style={{ margin: "14px 0", fontSize: 13 }}>
        <div style={{ fontSize: 10, letterSpacing: 0.5, textTransform: "uppercase", opacity: 0.5 }}>Headline</div>
        <div style={{ fontWeight: 700, color: p.solid }}>{s.headline.big} {s.headline.unit} · {s.total} sessions · {s.streakBest || "—"} best streak</div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onReview} style={{ ...ghostBtn, flex: 1 }}>Review</button>
        <button onClick={onPlay} style={{ ...primaryBtn(p), flex: 1 }}>Preview as {s.firstName}</button>
      </div>
    </div>
  );
}

/* ------------------------------ review ---------------------------------- */
function Review({ s, p, picker, onPlay, onBack, notify }) {
  const previews = [F1c, F1a, F2a, F1e];
  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
        <button onClick={onBack} style={ghostBtn}>← Stories</button>
        <div style={{ flex: 1 }} />
        {picker}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr)", gap: 24, alignItems: "start" }}>
        <div>
          <SectionLabel>Client-facing story · tap Preview to play</SectionLabel>
          <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
            {previews.map((Comp, i) => <div key={i} style={{ width: 180, flexShrink: 0 }}><Comp s={s} p={p} /></div>)}
          </div>
          <button onClick={onPlay} style={{ ...primaryBtn(p), marginTop: 14, padding: "12px 20px" }}>▶ Preview as {s.firstName}</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Panel title="About this story">
            <Row k="Client" v={s.name} />
            <Row k="Trigger" v={s.readiness.label} />
            <Row k="Cards" v={`${DECK.length} in the deck`} />
            <Row k="Window" v={`${s.startLabel} – ${s.endLabel}`} />
            <Row k="Source" v={`${s.total} sessions · ${s.weightData.length} weigh-ins`} />
            <div style={{ marginTop: 10, fontSize: 12, opacity: 0.6, lineHeight: 1.5 }}>Every number is pulled from {s.firstName}'s logged sessions and check-ins — verifiable, nothing inflated.</div>
          </Panel>
          <Panel title="Share">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button style={ghostBtn} onClick={() => notify("Card images downloaded")}>Download card images</button>
              <button style={ghostBtn} onClick={() => notify("Share link copied")}>Copy share link</button>
              <button style={primaryBtn(p)} onClick={() => notify(`Story sent to ${s.firstName}`)}>Send to {s.firstName}</button>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
function Panel({ title, children }) {
  return <div style={{ border: "1px solid var(--border,#e5e7eb)", borderRadius: 14, padding: 16, background: "var(--card,#fff)" }}><div style={{ fontWeight: 700, marginBottom: 10 }}>{title}</div>{children}</div>;
}
function Row({ k, v }) {
  return <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13, borderTop: "1px solid var(--border,#f0f0f0)" }}><span style={{ opacity: 0.6 }}>{k}</span><span style={{ fontWeight: 600, textAlign: "right" }}>{v}</span></div>;
}

/* ------------------------------ player ---------------------------------- */
function Player({ s, p, idx, setIdx, onClose }) {
  const Comp = DECK[idx];
  const next = () => setIdx(Math.min(idx + 1, DECK.length - 1));
  const prev = () => setIdx(Math.max(idx - 1, 0));
  return (
    <div style={{ position: "absolute", inset: 0, background: "rgba(10,12,14,0.92)", zIndex: 40, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 340 }}>
        <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
          {DECK.map((_, i) => <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= idx ? "#fff" : "rgba(255,255,255,0.3)" }} />)}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: p.accent, color: p.ink, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>{s.firstName[0]}</div>
          <div><div style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{s.name}</div><div style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}>from Coach · now</div></div>
        </div>
        <div style={{ position: "relative" }}>
          <Comp s={s} p={p} />
          <button onClick={prev} aria-label="Previous" style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "35%", background: "transparent", border: "none", cursor: "pointer" }} />
          <button onClick={next} aria-label="Next" style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "45%", background: "transparent", border: "none", cursor: "pointer" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
          <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>{idx + 1} / {DECK.length}</span>
          <button onClick={onClose} style={{ ...ghostBtn, background: "transparent", color: "#fff", borderColor: "rgba(255,255,255,0.3)" }}>Close player</button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ formats --------------------------------- */
function Formats({ s, p, paletteBar, picker, roster }) {
  const groups = [];
  FORMATS.forEach((f) => {
    let g = groups.find((x) => x.turn === f.turn);
    if (!g) { g = { turn: f.turn, turnDesc: f.turnDesc, items: [] }; groups.push(g); }
    g.items.push(f);
  });
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
      <div style={{ position: "sticky", top: 0, background: "var(--background,#f6f7f8)", zIndex: 5, padding: "6px 0 14px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", borderBottom: "1px solid var(--border,#e5e7eb)", marginBottom: 20 }}>
        {paletteBar}
        {picker}
      </div>
      {groups.map((g) => (
        <div key={g.turn} style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 12, letterSpacing: 1, fontWeight: 700, textTransform: "uppercase", opacity: 0.5 }}>{g.turn}</div>
          {g.turnDesc && <div style={{ fontSize: 14, opacity: 0.7, marginTop: 4, marginBottom: 16, maxWidth: 620 }}>{g.turnDesc}</div>}
          <div style={{ display: "grid", gridTemplateColumns: g.items[0].wide ? "1fr" : "repeat(auto-fill,minmax(230px,1fr))", gap: 22 }}>
            {g.items.map((f) => {
              const Comp = f.Comp;
              return (
                <div key={f.id}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ background: p.solid, color: "#fff", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 12 }}>{f.id}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{f.name}</div>
                      <div style={{ fontSize: 11, opacity: 0.6 }}>{f.desc}</div>
                    </div>
                  </div>
                  <div style={{ maxWidth: f.wide ? 620 : 260 }}>
                    <Comp s={s} p={p} roster={roster} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* --------------------------- new story modal ---------------------------- */
function NewStoryModal({ allStories, p, onClose, onCreate }) {
  const [name, setName] = useState(allStories[0]?.name || "");
  const sel = allStories.find((s) => s.name === name);
  return (
    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 45, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 440, background: "var(--card,#fff)", color: "var(--foreground,#111)", borderRadius: 16, padding: 22 }}>
        <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 4 }}>New progress story</div>
        <div style={{ fontSize: 13, opacity: 0.65, marginBottom: 16 }}>Milton builds the deck from this client's real logged data.</div>
        <label style={{ fontSize: 12, fontWeight: 600, opacity: 0.7 }}>Client</label>
        <select value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", background: "var(--card,#fff)", color: "var(--foreground,#111)", fontWeight: 600, margin: "6px 0 16px" }}>
          {allStories.map((s) => <option key={s.name} value={s.name}>{s.name}</option>)}
        </select>
        {sel && (
          <div style={{ border: "1px solid var(--border,#e5e7eb)", borderRadius: 10, padding: 14, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontWeight: 700 }}>Data check</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: sel.readiness.tone, background: `${sel.readiness.tone}1a`, padding: "2px 8px", borderRadius: 20 }}>{sel.readiness.label}</span>
            </div>
            <Row k="Sessions logged" v={sel.total} />
            <Row k="Weigh-ins" v={sel.weightData.length} />
            <Row k="Strength baseline" v={sel.squatStart != null ? "on file" : "missing"} />
          </div>
        )}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={ghostBtn}>Cancel</button>
          <button onClick={() => onCreate(name)} style={primaryBtn(p)}>Generate story</button>
        </div>
      </div>
    </div>
  );
}
