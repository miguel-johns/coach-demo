import React, { useMemo, useState } from "react";
import {
  Package as PackageIcon, ChevronRight, Check, X, Clock, Calendar,
  Plus, SlidersHorizontal, RefreshCw, PauseCircle, CreditCard, Info,
} from "lucide-react";

/* Palette mapped to the app theme — kept in sync with ClientProfile */
const T = {
  ink: "#1a2e2a",
  inkSoft: "#5f7a76",
  inkFaint: "rgba(26,46,42,0.42)",
  teal: "#3aafa9",
  tealDark: "#2B7A78",
  tealDeep: "#2B7A78",
  tealTint: "#e8f5f3",
  tealSoft: "#bfe6e1",
  tealPale: "#f0f9f7",
  mintTint: "#e6f6ec",
  mintTx: "#1f6b2e",
  amberTint: "#fbeed8",
  amberTx: "#8a5a12",
  redTint: "#fdeceb",
  redTx: "#c23a30",
  cream: "#f3f6f4",
  creamTint: "#eaf0ee",
  white: "#ffffff",
  line: "#e0ebe8",
};
const FONT = `'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif`;
const MONO = `'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace`;

const cardBase = {
  background: T.white,
  borderRadius: 12,
  border: `1px solid ${T.line}`,
};

/* ---------- session status metadata ---------- */
const SESSION_META = {
  completed: { label: "Completed", icon: Check, color: T.mintTx, tint: T.mintTint, draw: true, effect: "-1" },
  "late-cancel": { label: "Late cancel", icon: X, color: T.redTx, tint: T.redTint, draw: true, effect: "-1" },
  "no-show": { label: "No show", icon: X, color: T.redTx, tint: T.redTint, draw: true, effect: "-1" },
  booked: { label: "Booked", icon: Clock, color: T.tealDark, tint: T.tealTint, draw: false, effect: "held" },
  cancelled: { label: "Cancelled in policy", icon: Calendar, color: T.inkSoft, tint: T.creamTint, draw: false, effect: "0" },
};

/* ---------- mock data (spec: Carrie Nolan) ---------- */
const INITIAL_SESSIONS = [
  { id: "s1", day: "Fri", date: "Aug 1", time: "7:00 AM", coach: "Devon", status: "completed" },
  { id: "s2", day: "Mon", date: "Aug 4", time: "7:00 AM", coach: "Devon", status: "completed" },
  { id: "s3", day: "Tue", date: "Aug 5", time: "6:00 PM", coach: "Devon", status: "late-cancel" },
  { id: "s4", day: "Wed", date: "Aug 6", time: "7:00 AM", coach: "Devon", status: "completed" },
  { id: "s5", day: "Thu", date: "Aug 7", time: "7:00 AM", coach: "Devon", status: "completed" },
  { id: "s6", day: "Fri", date: "Aug 8", time: "7:00 AM", coach: "Devon", status: "completed" },
  { id: "s7", day: "Mon", date: "Aug 11", time: "7:00 AM", coach: "Devon", status: "booked" },
  { id: "s8", day: "Wed", date: "Aug 13", time: "7:00 AM", coach: "Devon", status: "booked" },
  { id: "s9", day: "Fri", date: "Aug 15", time: "7:00 AM", coach: "Devon", status: "booked" },
  { id: "s10", day: "Mon", date: "Aug 18", time: "7:00 AM", coach: "Devon", status: "booked" },
];

const PAST_CYCLES = [
  { id: "jul", num: 3, range: "Jul 1 – Jul 31", plan: 12, added: 0, carriedIn: 3, used: 9 },
  { id: "jun", num: 2, range: "Jun 1 – Jun 30", plan: 12, added: 0, carriedIn: 0, used: 9 },
  { id: "may", num: 1, range: "May 1 – May 31", plan: 12, added: 0, carriedIn: 0, used: 12 },
];

const INITIAL_BILLING = [
  { id: "b1", date: "Aug 6", type: "addon", desc: "4-pack added by Devon", amount: "+$260" },
  { id: "b2", date: "Aug 1", type: "renewal", desc: "Renewal charged · 6 carried forward", amount: "$720" },
  { id: "b3", date: "Jul 19", type: "adjust", desc: "Balance corrected +1 by Rolland · billing error", amount: "+1" },
  { id: "b4", date: "Jul 1", type: "renewal", desc: "Renewal charged · 3 carried forward", amount: "$720" },
];

const PLAN = 12;
const CARRIED_IN = 6;
const ROLLOVER_CAP = 8; // sessions that can roll to next cycle

/* ---------- derived-state hook (single source of truth) ---------- */
export function usePackageState() {
  const [sessions, setSessions] = useState(INITIAL_SESSIONS);
  const [added, setAdded] = useState(4);
  const [adjust, setAdjust] = useState(0);
  const [billing, setBilling] = useState(INITIAL_BILLING);
  const [lateCancelDraws] = useState(true); // package policy

  const derived = useMemo(() => {
    const used = sessions.filter((s) => {
      if (s.status === "late-cancel") return lateCancelDraws;
      return SESSION_META[s.status]?.draw;
    }).length;
    const booked = sessions.filter((s) => s.status === "booked").length;
    const available = PLAN + CARRIED_IN + added + adjust;
    const remaining = available - used;
    const unscheduled = Math.max(0, remaining - booked);
    return { used, booked, available, remaining, unscheduled };
  }, [sessions, added, adjust, lateCancelDraws]);

  const markComplete = (id) =>
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, status: "completed" } : s)));

  const addSessions = (n) => {
    if (!n || n < 1) return;
    setAdded((a) => a + n);
    setBilling((b) => [
      { id: `b${Date.now()}`, date: "Aug 8", type: "addon", desc: `${n}-pack added by Devon`, amount: `+$${n * 65}` },
      ...b,
    ]);
  };

  const adjustBalance = (delta, reason) => {
    if (!delta || !reason?.trim()) return false;
    setAdjust((a) => a + delta);
    setBilling((b) => [
      {
        id: `b${Date.now()}`,
        date: "Aug 8",
        type: "adjust",
        desc: `Balance corrected ${delta > 0 ? "+" : ""}${delta} by Rolland · ${reason.trim()}`,
        amount: `${delta > 0 ? "+" : ""}${delta}`,
      },
      ...b,
    ]);
    return true;
  };

  // current cycle summary row for the ledger
  const currentCycle = {
    id: "aug",
    num: 4,
    range: "Aug 1 – Aug 31",
    plan: PLAN,
    added,
    adjust,
    carriedIn: CARRIED_IN,
    used: derived.used,
    current: true,
  };

  return {
    name: "Strength · Personal training",
    statusLabel: "Active",
    autoRenews: true,
    coach: "Devon",
    price: 720,
    cadence: "monthly",
    cycleNum: 4,
    cycleRange: "Aug 1 – Aug 31",
    plan: PLAN,
    carriedIn: CARRIED_IN,
    added,
    adjust,
    rolloverCap: ROLLOVER_CAP,
    lateCancelDraws,
    sessions,
    currentCycle,
    pastCycles: PAST_CYCLES,
    billing,
    payment: { brand: "Visa", last4: "4412", autopay: true, nextDate: "Sep 1", nextAmount: 720 },
    ...derived,
    markComplete,
    addSessions,
    adjustBalance,
  };
}

/* ---------- small building blocks ---------- */
function Pill({ children, bg, color }) {
  return (
    <span style={{ background: bg, color, fontSize: 12, fontWeight: 500, borderRadius: 999, padding: "4px 12px", whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

function StackedBar({ used, booked, unscheduled, available }) {
  const total = available || 1;
  const seg = [
    { w: (used / total) * 100, color: T.teal },
    { w: (booked / total) * 100, color: T.tealSoft },
    { w: (unscheduled / total) * 100, color: T.tealPale },
  ];
  return (
    <div>
      <div style={{ display: "flex", height: 12, borderRadius: 999, overflow: "hidden", background: T.tealPale }}>
        {seg.map((s, i) => (
          <div key={i} style={{ width: `${s.w}%`, background: s.color }} />
        ))}
      </div>
      <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 11, color: T.inkSoft, flexWrap: "wrap" }}>
        <Legend color={T.teal} label={`Used ${used}`} />
        <Legend color={T.tealSoft} label={`Booked ${booked}`} />
        <Legend color={T.tealPale} label={`Unscheduled ${unscheduled}`} border />
      </div>
    </div>
  );
}
function Legend({ color, label, border }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 10, height: 10, borderRadius: 3, background: color, border: border ? `1px solid ${T.line}` : "none" }} />
      {label}
    </span>
  );
}

function Tile({ label, value, sub, accent }) {
  return (
    <div style={{ background: T.cream, borderRadius: 12, padding: "14px 16px" }}>
      <div style={{ fontSize: 12, color: T.inkSoft, fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: accent ? T.tealDark : T.ink, lineHeight: 1.2, marginTop: 2 }}>{value}</div>
      <div style={{ fontSize: 11, color: T.inkFaint, marginTop: 2 }}>{sub}</div>
    </div>
  );
}

/* ---------- summary card (inline in profile) ---------- */
export function PackagesSummary({ pkg, onManage, isMobile }) {
  const composition = `${pkg.plan} plan + ${pkg.carriedIn} carried + ${pkg.added} added${pkg.adjust ? ` ${pkg.adjust > 0 ? "+" : ""}${pkg.adjust} adjusted` : ""}`;
  const remainingSub = pkg.rolloverCap > 0 ? "rolls forward" : "expires Aug 31";
  return (
    <div style={{ ...cardBase, padding: isMobile ? 20 : "22px 24px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
        <div style={{ width: 46, height: 46, borderRadius: 14, background: T.tealTint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <PackageIcon size={22} color={T.tealDark} />
        </div>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 16, fontWeight: 500, color: T.ink }}>{pkg.name}</span>
            <Pill bg={T.mintTint} color={T.tealDark}>{pkg.statusLabel}</Pill>
            {pkg.autoRenews && <Pill bg={T.creamTint} color={T.inkSoft}>Auto-renews</Pill>}
          </div>
          <div style={{ fontSize: 13, color: T.inkSoft, marginTop: 4 }}>
            Cycle {pkg.cycleNum} · {pkg.cycleRange} · ${pkg.price}/mo
          </div>
        </div>
        <button onClick={onManage}
          style={{ fontFamily: FONT, fontSize: 13.5, fontWeight: 500, cursor: "pointer", borderRadius: 999, padding: "9px 16px", border: `1px solid ${T.line}`, background: T.white, color: T.ink, display: "inline-flex", alignItems: "center", gap: 4 }}>
          Manage <ChevronRight size={15} />
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 10, marginBottom: 16 }}>
        <Tile label="Available" value={pkg.available} sub={composition} />
        <Tile label="Used" value={pkg.used} sub="this cycle" />
        <Tile label="Remaining" value={pkg.remaining} sub={remainingSub} accent />
      </div>

      <StackedBar used={pkg.used} booked={pkg.booked} unscheduled={pkg.unscheduled} available={pkg.available} />
    </div>
  );
}

/* ---------- detail view (replaces profile body) ---------- */
function MathTerm({ value, label, tip, op }) {
  return (
    <>
      {op && <span style={{ color: T.inkFaint }}> {op} </span>}
      <span title={tip} style={{ cursor: "help", borderBottom: `1px dotted ${T.inkFaint}` }}>
        {value} {label}
      </span>
    </>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(26,46,42,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()}
        style={{ ...cardBase, width: "100%", maxWidth: 400, padding: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: T.ink }}>{title}</span>
          <X size={18} color={T.inkSoft} style={{ cursor: "pointer" }} onClick={onClose} />
        </div>
        {children}
      </div>
    </div>
  );
}

const inputStyle = {
  fontFamily: FONT, fontSize: 14, width: "100%", padding: "10px 12px",
  borderRadius: 10, border: `1px solid ${T.line}`, color: T.ink, outline: "none",
};
const primaryBtn = {
  fontFamily: FONT, fontSize: 13.5, fontWeight: 500, cursor: "pointer",
  borderRadius: 999, padding: "10px 18px", border: "none", background: T.tealDeep, color: T.white,
};
const ghostBtn = {
  fontFamily: FONT, fontSize: 13.5, fontWeight: 500, cursor: "pointer",
  borderRadius: 999, padding: "9px 16px", border: `1px solid ${T.line}`, background: T.white, color: T.ink,
};

export function PackageDetail({ pkg, clientName, onClose, onToast, isMobile }) {
  const [expanded, setExpanded] = useState(false);
  const [modal, setModal] = useState(null); // "add" | "adjust"
  const [addN, setAddN] = useState(4);
  const [adjDelta, setAdjDelta] = useState(1);
  const [adjReason, setAdjReason] = useState("");
  const [adjError, setAdjError] = useState(false);

  const card = { ...cardBase, padding: isMobile ? 18 : "22px 24px" };

  // build ledger rows: current + past, compute carried out
  const carriedOut = (c) => c.plan + (c.added || 0) + (c.adjust || 0) + c.carriedIn - c.used;
  const ledgerRows = [pkg.currentCycle, ...pkg.pastCycles];
  // dev assertion: every closed row must balance
  if (typeof window !== "undefined") {
    pkg.pastCycles.forEach((c) => {
      const co = carriedOut(c);
      if (co < 0) console.log("[v0] ledger balance error", c.id, co);
    });
  }
  const lifetime = ledgerRows.reduce(
    (a, c) => ({
      plan: a.plan + c.plan,
      added: a.added + (c.added || 0),
      used: a.used + c.used,
    }),
    { plan: 0, added: 0, used: 0 }
  );

  // collapse consecutive identical statuses in the session list
  const rows = [];
  const src = pkg.sessions;
  for (let i = 0; i < src.length; i++) {
    const run = [src[i]];
    while (i + 1 < src.length && src[i + 1].status === src[i].status) {
      run.push(src[++i]);
    }
    if (run.length > 2 && !expanded) {
      rows.push({ collapsed: true, status: run[0].status, items: run });
    } else {
      run.forEach((s) => rows.push({ collapsed: false, ...s }));
    }
  }
  const hasCollapsible = src.some((_, i) => i);

  const billingIcon = { renewal: RefreshCw, addon: Plus, adjust: SlidersHorizontal };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {/* breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13.5, color: T.inkSoft }}>
        <button onClick={onClose} style={{ fontFamily: FONT, background: "none", border: "none", cursor: "pointer", color: T.inkSoft, fontSize: 13.5, padding: 0 }}>
          {clientName}
        </button>
        <span style={{ color: T.inkFaint }}>/</span>
        <span style={{ color: T.ink, fontWeight: 500 }}>Packages</span>
      </div>

      {/* 1. header block */}
      <div style={{ ...card, display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: T.ink }}>{pkg.name}</span>
            <Pill bg={T.mintTint} color={T.tealDark}>{pkg.statusLabel}</Pill>
          </div>
          <div style={{ fontSize: 13.5, color: T.inkSoft, marginTop: 4 }}>
            {pkg.cycleRange} · Coach {pkg.coach}
          </div>
        </div>
        <div style={{ textAlign: isMobile ? "left" : "right" }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: T.tealDark, lineHeight: 1 }}>{pkg.remaining}</div>
          <div style={{ fontSize: 12, color: T.inkFaint, marginTop: 2 }}>remaining</div>
        </div>
      </div>

      {/* 2. the math line */}
      <div style={card}>
        <div style={{ fontSize: 12, fontWeight: 500, color: T.inkSoft, textTransform: "none", marginBottom: 10 }}>How that number is built</div>
        <div style={{ background: T.tealTint, borderRadius: 12, padding: "14px 16px", overflowX: "auto" }}>
          <div style={{ fontFamily: MONO, fontSize: 13, color: T.ink, whiteSpace: "nowrap", lineHeight: 1.8 }}>
            <MathTerm value={pkg.plan} label="plan" tip="Sessions included in the monthly plan" />
            <MathTerm value={pkg.carriedIn} label="carried" op="+" tip="Unused sessions carried from July" />
            <MathTerm value={pkg.added} label="added" op="+" tip="4-pack purchased Aug 6" />
            {pkg.adjust ? <MathTerm value={pkg.adjust} label="adjusted" op="+" tip="Manual balance correction" /> : null}
            <span style={{ color: T.inkFaint }}> = </span>
            <span style={{ fontWeight: 600 }}>{pkg.available} available</span>
            <span style={{ color: T.inkFaint }}> − </span>
            <MathTerm value={pkg.used} label="used" tip="Completed sessions plus policy draws" />
            <span style={{ color: T.inkFaint }}> = </span>
            <span style={{ fontWeight: 600, color: T.tealDark }}>{pkg.remaining} remaining</span>
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <StackedBar used={pkg.used} booked={pkg.booked} unscheduled={pkg.unscheduled} available={pkg.available} />
        </div>
      </div>

      {/* 3. sessions this cycle */}
      <div style={card}>
        <div style={{ fontSize: 17, fontWeight: 700, color: T.ink }}>Sessions this cycle</div>
        <div style={{ fontSize: 12, color: T.inkSoft, marginTop: 3, marginBottom: 12, lineHeight: 1.5 }}>
          A session leaves the balance when it completes or late cancels. No shows are set by your policy.
        </div>
        <div>
          {rows.map((r, i) => {
            if (r.collapsed) {
              const meta = SESSION_META[r.status];
              return (
                <div key={`c${i}`} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderTop: i ? `1px solid ${T.line}` : "none" }}>
                  <span style={{ width: 26, display: "flex", justifyContent: "center" }}>
                    <meta.icon size={16} color={meta.color} />
                  </span>
                  <span style={{ flex: 1, fontSize: 13.5, color: T.inkSoft }}>
                    {r.items.length} {meta.label.toLowerCase()}, {r.items[0].date}–{r.items[r.items.length - 1].date}
                  </span>
                  <button onClick={() => setExpanded(true)} style={{ fontFamily: FONT, background: "none", border: "none", cursor: "pointer", fontSize: 13, color: T.tealDark, fontWeight: 500 }}>
                    View all
                  </button>
                </div>
              );
            }
            const meta = SESSION_META[r.status];
            return (
              <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderTop: i ? `1px solid ${T.line}` : "none" }}>
                <span style={{ width: 26, display: "flex", justifyContent: "center" }}>
                  <meta.icon size={16} color={meta.color} />
                </span>
                <span style={{ width: 78, fontSize: 13.5, color: T.ink, fontWeight: 500 }}>{r.day} {r.date}</span>
                <span style={{ flex: 1, fontSize: 13, color: T.inkSoft }}>{r.time} · {r.coach}</span>
                <span style={{ fontSize: 12.5, color: meta.color, minWidth: 84, textAlign: "right" }}>{meta.label}</span>
                {r.status === "booked" ? (
                  <button onClick={() => pkg.markComplete(r.id)}
                    style={{ fontFamily: FONT, fontSize: 12, fontWeight: 500, cursor: "pointer", borderRadius: 999, padding: "5px 12px", border: `1px solid ${T.line}`, background: T.white, color: T.tealDark, marginLeft: 8 }}>
                    Mark complete
                  </button>
                ) : (
                  <span style={{ fontFamily: MONO, fontSize: 13, color: meta.draw ? T.ink : T.inkFaint, width: 48, textAlign: "right", marginLeft: 8 }}>{meta.effect}</span>
                )}
              </div>
            );
          })}
        </div>
        {expanded && hasCollapsible && (
          <button onClick={() => setExpanded(false)} style={{ fontFamily: FONT, background: "none", border: "none", cursor: "pointer", fontSize: 13, color: T.tealDark, fontWeight: 500, marginTop: 10, padding: 0 }}>
            Collapse
          </button>
        )}
      </div>

      {/* 4. rollover ledger */}
      <div style={card}>
        <div style={{ fontSize: 17, fontWeight: 700, color: T.ink, marginBottom: 12 }}>Rollover ledger</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 460 }}>
            <thead>
              <tr style={{ fontSize: 12, color: T.inkFaint, textAlign: "right", fontWeight: 500 }}>
                <th style={{ textAlign: "left", fontWeight: 500, padding: "6px 0" }}>Cycle</th>
                <th style={{ fontWeight: 500 }}>Plan</th>
                <th style={{ fontWeight: 500 }}>Added</th>
                <th style={{ fontWeight: 500 }}>Carried in</th>
                <th style={{ fontWeight: 500 }}>Used</th>
                <th style={{ fontWeight: 500 }}>Carried out</th>
              </tr>
            </thead>
            <tbody style={{ fontFamily: MONO }}>
              {ledgerRows.map((c) => {
                const co = carriedOut(c);
                return (
                  <tr key={c.id} style={{ borderTop: `1px solid ${T.line}` }}>
                    <td style={{ padding: "10px 0", fontFamily: FONT, color: T.ink, fontWeight: 500 }}>
                      {c.range.split(" – ")[0]}
                      {c.current && <span style={{ fontFamily: FONT, background: T.tealTint, color: T.tealDark, fontSize: 10.5, fontWeight: 500, borderRadius: 999, padding: "2px 8px", marginLeft: 8 }}>now</span>}
                    </td>
                    <td style={{ textAlign: "right", color: T.inkSoft }}>{c.plan}</td>
                    <td style={{ textAlign: "right", color: T.inkSoft }}>{c.added || 0}</td>
                    <td style={{ textAlign: "right", color: T.inkSoft }}>{c.carriedIn}</td>
                    <td style={{ textAlign: "right", color: T.inkSoft }}>{c.used}</td>
                    <td style={{ textAlign: "right", color: T.ink, fontWeight: 500 }}>{c.current ? `${co} open` : co}</td>
                  </tr>
                );
              })}
              <tr style={{ borderTop: `2px solid ${T.line}` }}>
                <td style={{ padding: "10px 0", fontFamily: FONT, color: T.ink, fontWeight: 700 }}>Lifetime</td>
                <td style={{ textAlign: "right", color: T.ink, fontWeight: 700 }}>{lifetime.plan}</td>
                <td style={{ textAlign: "right", color: T.ink, fontWeight: 700 }}>{lifetime.added}</td>
                <td style={{ textAlign: "right", color: T.inkFaint }}>—</td>
                <td style={{ textAlign: "right", color: T.ink, fontWeight: 700 }}>{lifetime.used}</td>
                <td style={{ textAlign: "right", color: T.tealDark, fontWeight: 700 }}>{pkg.remaining}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style={{ fontSize: 12, color: T.inkSoft, marginTop: 12, display: "flex", alignItems: "center", gap: 6 }}>
          <Info size={13} color={T.inkFaint} /> Rollover cap is {pkg.rolloverCap} sessions.
          <button onClick={() => onToast("Open rollover cap settings")} style={{ fontFamily: FONT, background: "none", border: "none", cursor: "pointer", fontSize: 12, color: T.tealDark, fontWeight: 500, padding: 0 }}>
            Change cap
          </button>
        </div>
      </div>

      {/* 5. billing & adjustments */}
      <div style={card}>
        <div style={{ fontSize: 17, fontWeight: 700, color: T.ink, marginBottom: 12 }}>Billing and adjustments</div>
        <div>
          {pkg.billing.map((b, i) => {
            const Icon = billingIcon[b.type] || RefreshCw;
            const tint = b.type === "adjust" ? T.amberTint : T.tealTint;
            const color = b.type === "adjust" ? T.amberTx : T.tealDark;
            return (
              <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderTop: i ? `1px solid ${T.line}` : "none" }}>
                <span style={{ width: 32, height: 32, borderRadius: 10, background: tint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={15} color={color} />
                </span>
                <span style={{ width: 54, fontSize: 12.5, color: T.inkFaint, flexShrink: 0 }}>{b.date}</span>
                <span style={{ flex: 1, fontSize: 13.5, color: T.ink }}>{b.desc}</span>
                <span style={{ fontFamily: MONO, fontSize: 13, color: T.ink, fontWeight: 500 }}>{b.amount}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. payment & actions */}
      <div style={card}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span style={{ width: 32, height: 32, borderRadius: 10, background: T.creamTint, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CreditCard size={16} color={T.inkSoft} />
          </span>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 13.5, color: T.ink, fontWeight: 500 }}>
              {pkg.payment.brand} ending {pkg.payment.last4} · Autopay {pkg.payment.autopay ? "on" : "off"}
            </div>
            <div style={{ fontSize: 12.5, color: T.inkSoft, marginTop: 2 }}>
              Next charge {pkg.payment.nextDate} for ${pkg.payment.nextAmount}
            </div>
          </div>
          <button onClick={() => onToast("Update payment method")} style={{ fontFamily: FONT, background: "none", border: "none", cursor: "pointer", fontSize: 13, color: T.tealDark, fontWeight: 500 }}>
            Update
          </button>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", borderTop: `1px solid ${T.line}`, marginTop: 16, paddingTop: 16 }}>
          <button onClick={() => setModal("add")} style={{ ...ghostBtn, display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Plus size={15} /> Add sessions
          </button>
          <button onClick={() => setModal("adjust")} style={{ ...ghostBtn, display: "inline-flex", alignItems: "center", gap: 6 }}>
            <SlidersHorizontal size={15} /> Adjust balance
          </button>
          <button onClick={() => onToast("Change plan at next cycle boundary")} style={{ ...ghostBtn, display: "inline-flex", alignItems: "center", gap: 6 }}>
            <RefreshCw size={15} /> Change plan
          </button>
          <button onClick={() => onToast("Pause billing and expiry")} style={{ ...ghostBtn, display: "inline-flex", alignItems: "center", gap: 6 }}>
            <PauseCircle size={15} /> Pause
          </button>
        </div>
      </div>

      {/* modals */}
      {modal === "add" && (
        <Modal title="Add sessions" onClose={() => setModal(null)}>
          <label style={{ fontSize: 13, color: T.inkSoft, fontWeight: 500 }}>Number of sessions</label>
          <input type="number" min={1} value={addN} onChange={(e) => setAddN(parseInt(e.target.value) || 0)} style={{ ...inputStyle, marginTop: 6, marginBottom: 16 }} />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button onClick={() => setModal(null)} style={ghostBtn}>Cancel</button>
            <button onClick={() => { pkg.addSessions(addN); onToast(`Added ${addN} sessions`); setModal(null); }} style={primaryBtn}>
              Add sessions
            </button>
          </div>
        </Modal>
      )}
      {modal === "adjust" && (
        <Modal title="Adjust balance" onClose={() => setModal(null)}>
          <label style={{ fontSize: 13, color: T.inkSoft, fontWeight: 500 }}>Change (+/−)</label>
          <input type="number" value={adjDelta} onChange={(e) => setAdjDelta(parseInt(e.target.value) || 0)} style={{ ...inputStyle, marginTop: 6, marginBottom: 14 }} />
          <label style={{ fontSize: 13, color: T.inkSoft, fontWeight: 500 }}>Reason (required)</label>
          <input value={adjReason} onChange={(e) => { setAdjReason(e.target.value); setAdjError(false); }} placeholder="e.g. billing error" style={{ ...inputStyle, marginTop: 6, marginBottom: adjError ? 6 : 16, borderColor: adjError ? T.redTx : T.line }} />
          {adjError && <div style={{ fontSize: 12, color: T.redTx, marginBottom: 14 }}>A reason is required to adjust the balance.</div>}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button onClick={() => setModal(null)} style={ghostBtn}>Cancel</button>
            <button onClick={() => {
              const ok = pkg.adjustBalance(adjDelta, adjReason);
              if (!ok) { setAdjError(true); return; }
              onToast(`Balance adjusted ${adjDelta > 0 ? "+" : ""}${adjDelta}`);
              setAdjReason(""); setModal(null);
            }} style={primaryBtn}>
              Save adjustment
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
