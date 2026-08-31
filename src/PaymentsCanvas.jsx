import React, { useState, useMemo } from "react";
import { TEAL, TEAL_LIGHT, WHITE, TEXT, TEXT_SEC, BORDER, ALERT_RED } from "./constants";

const MONO = "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace";
const PAGE_BG = "#fafcfb";
const AMBER = "#a86a1f";
const AMBER_TINT = "#f6edd9";
const GREEN = "#1f7a3e";
const GREEN_TINT = "#e6f9ec";
const RED_TINT = "#fbe9e7";

const money = (n) => (n === "" || n == null ? "$—" : "$" + Number(n).toLocaleString());
const fmtPerSession = (total, qty) => {
  if (total === "" || total == null || !qty) return "$—";
  const v = Number(total) / qty;
  return Number.isInteger(v) ? "$" + v : "$" + v.toFixed(2);
};

// ── Two-axis model ──────────────────────────────────────────────
const INTERVAL_NOUN = { week: "week", month: "month", quarter: "quarter", year: "year" };
const INTERVAL_LABEL = { week: "Weekly", month: "Monthly", quarter: "Quarterly", year: "Annual" };
const DELIVERABLE_LABEL = { sessions: "Sessions", access: "Access", program: "Program", item: "Product" };

const PRESETS = [
  { id: "session_pack", name: "Session pack", desc: "A set number of sessions, paid once.", deliverable: "sessions", billing: "one_time", icon: "hash" },
  { id: "membership", name: "Membership", desc: "Open access billed on a recurring interval.", deliverable: "access", billing: "recurring", icon: "infinity" },
  { id: "session_membership", name: "Session membership", desc: "A session allowance that renews each interval.", deliverable: "sessions", billing: "recurring", icon: "repeat" },
  { id: "drop_in", name: "Drop-in / day pass", desc: "Single-visit access, paid once.", deliverable: "access", billing: "one_time", icon: "ticket" },
  { id: "program", name: "Challenge or program", desc: "A dated program with a start and end.", deliverable: "program", billing: "one_time", icon: "calendar" },
  { id: "product", name: "Product", desc: "A physical or digital good.", deliverable: "item", billing: "one_time", icon: "box" },
];

const PRESET_ICON = {
  hash: <path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18" />,
  infinity: <path d="M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.133-8-12.739-8-4.585 0-4.585 8 0 8 5.606 0 7.644-8 12.74-8z" />,
  repeat: <><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></>,
  ticket: <><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" /><line x1="13" y1="5" x2="13" y2="19" /></>,
  calendar: <><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>,
  box: <><path d="M21 8V21H3V8" /><rect x="1" y="3" width="22" height="5" /><line x1="10" y1="12" x2="14" y2="12" /></>,
};

// ── Levenshtein for service dedupe ──────────────────────────────
function editDistance(a, b) {
  a = a.toLowerCase().trim(); b = b.toLowerCase().trim();
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return dp[m][n];
}

// ── Derived copy (never stored) ─────────────────────────────────
function catalogSubtitle(p) {
  const bits = [];
  if (p.deliverable === "sessions") {
    const s = p.sessions_config;
    bits.push(p.billing === "recurring" ? `${s.quantity} / ${INTERVAL_NOUN[p.interval]}` : `${s.quantity}-pack`);
    bits.push(s.service);
    if (p.billing === "recurring") bits.push(s.rollover.enabled ? `rollover ${s.rollover.cap}` : "no rollover");
  } else if (p.deliverable === "access") {
    bits.push(p.billing === "recurring" ? `access · per ${INTERVAL_NOUN[p.interval]}` : "day pass");
    const c = p.access_config.usage_cap;
    if (c.count) bits.push(`${c.count}/${c.period}`);
  } else if (p.deliverable === "program") {
    const g = p.program_config;
    bits.push(g.mode === "fixed" ? "fixed dates" : `${g.duration_weeks} weeks`);
    if (g.capacity) bits.push(`${g.capacity} seats`);
  } else if (p.deliverable === "item") {
    bits.push(p.item_config.fulfillment === "ship" ? "shipped" : p.item_config.fulfillment === "digital" ? "digital" : "pickup");
    if (p.item_config.track_inventory) bits.push(`${p.item_config.stock} in stock`);
  }
  return bits.join(" · ");
}

function priceLine(p) {
  if (p.billing === "recurring") return `${money(p.price)} / ${INTERVAL_NOUN[p.interval]}`;
  return money(p.price);
}

// Plain-language terms summary for the review screen
function termsSummary(p) {
  const s = [];
  const int = INTERVAL_NOUN[p.interval];
  if (p.deliverable === "sessions") {
    const c = p.sessions_config;
    if (p.billing === "recurring") {
      s.push(`${c.quantity} sessions per ${int}, ${money(p.price)}.`);
      if (c.rollover.enabled) {
        s.push(`Unused sessions carry over up to ${c.rollover.cap === "unlimited" ? "no limit" : c.rollover.cap}` +
          (c.rollover.expire_days && c.rollover.cap !== "unlimited" ? ` and expire after ${c.rollover.expire_days} days.` : "."));
      } else s.push("Unused sessions don't carry over.");
    } else {
      s.push(`${c.quantity} sessions for ${money(p.price)}.`);
      if (c.expiry_days !== "never") s.push(`They expire ${c.expiry_days} days after purchase.`);
    }
    const uses = [];
    if (c.usage.late_cancel) uses.push("a late cancel");
    if (c.usage.no_show) uses.push("a no-show");
    if (uses.length) s.push(`Cancel an appointment less than ${c.cancel_window_hours} hours out and ${uses.join(" or ")} uses a session.`);
  } else if (p.deliverable === "access") {
    s.push(p.billing === "recurring"
      ? `Open access, ${money(p.price)} per ${int}.`
      : `Single-visit access, ${money(p.price)}.`);
    const cap = p.access_config.usage_cap;
    if (cap.count) s.push(`Limited to ${cap.count} visits per ${cap.period}.`);
  } else if (p.deliverable === "program") {
    const g = p.program_config;
    s.push(`${p.name || "Program"}, ${money(p.price)}.`);
    s.push(g.mode === "fixed" ? `Runs ${g.start_date || "TBD"} to ${g.end_date || "TBD"}.` : `Runs ${g.duration_weeks} weeks from enrollment.`);
    if (g.capacity) s.push(`${g.capacity} seats, waitlist when full.`);
  } else if (p.deliverable === "item") {
    s.push(`${p.name || "Product"}, ${money(p.price)}.`);
    s.push(p.item_config.fulfillment === "ship" ? "Shipped to the buyer." : p.item_config.fulfillment === "digital" ? "Delivered digitally." : "Pickup at the facility.");
  }
  if (p.billing === "recurring") {
    const bp = p.billing_policy;
    const tail = [];
    if (bp.commitment_months) tail.push(`${bp.commitment_months} month commitment`);
    if (bp.notice_days) tail.push(`${bp.notice_days} days notice to cancel`);
    if (bp.etf_type === "flat") tail.push(`$${bp.etf_amount} early termination fee`);
    else if (bp.etf_type === "remaining_balance") tail.push("early termination bills the remaining balance");
    if (tail.length) s.push(tail.join(", ") + ".");
  }
  return s.join(" ");
}

// ── Package factory ─────────────────────────────────────────────
function newPackageFrom(preset, services) {
  const base = {
    id: "new", name: "", description: "", image_url: "",
    deliverable: preset.deliverable, billing: preset.billing,
    interval: "month", price: "", currency: "usd",
    status: "draft", visibility: "staff_only", version: 1,
    activeSubs: 0, lifetimePurchases: 0, presetName: preset.name,
    billing_policy: {
      trial_days: 0, commitment_months: 0, notice_days: 0,
      etf_type: "none", etf_amount: 0,
      pause: { enabled: true, max_days: 90, per_year: 2 },
      failed_payment: "suspend",
      payment_plan: { mode: "full", installments: 3, deposit: 0 },
    },
  };
  if (preset.deliverable === "sessions") {
    base.sessions_config = {
      quantity: preset.billing === "recurring" ? 12 : 8,
      service: services[0] || "1-on-1", duration_min: 60, coach_scope: "all",
      expiry_days: "never",
      rollover: { enabled: true, cap: 12, expire_days: 60 },
      usage: { completed: true, late_cancel: true, no_show: true, coach_cancel: false },
      cancel_window_hours: 24,
    };
  }
  if (preset.deliverable === "access") base.access_config = { included_service_ids: [], usage_cap: { count: 0, period: "week" } };
  if (preset.deliverable === "program") base.program_config = { mode: "fixed", start_date: "", end_date: "", duration_weeks: 6, capacity: 0, enrollment_opens: "", enrollment_closes: "", includes_sessions: false };
  if (preset.deliverable === "item") base.item_config = { track_inventory: false, stock: 0, fulfillment: "pickup", variants: [] };
  return base;
}

// ── Mock data (migrated to new schema) ──────────────────────────
const SERVICE_SEED = ["1-on-1", "2–4 people", "Group"];

const mkSessions = (o) => ({
  quantity: o.quantity, service: o.service, duration_min: 60, coach_scope: "all",
  expiry_days: o.expiry_days ?? "never",
  rollover: o.rollover ?? { enabled: false, cap: 0, expire_days: 60 },
  usage: { completed: true, late_cancel: o.late ?? true, no_show: o.noshow ?? true, coach_cancel: false },
  cancel_window_hours: 24,
});
const defPolicy = (o = {}) => ({
  trial_days: 0, commitment_months: o.commitment_months ?? 0, notice_days: o.notice_days ?? 0,
  etf_type: o.etf_type ?? "none", etf_amount: o.etf_amount ?? 0,
  pause: { enabled: true, max_days: 90, per_year: 2 }, failed_payment: "suspend",
  payment_plan: { mode: "full", installments: 3, deposit: 0 },
});

const SEED_PACKAGES = [
  {
    id: "t1", name: "12 sessions monthly", description: "", image_url: "", deliverable: "sessions", billing: "recurring",
    interval: "month", price: 720, currency: "usd", status: "active", visibility: "staff_only", version: 2,
    activeSubs: 14, lifetimePurchases: 41, presetName: "Session membership",
    sessions_config: mkSessions({ quantity: 12, service: "1-on-1", rollover: { enabled: true, cap: 12, expire_days: 60 } }),
    billing_policy: defPolicy({ commitment_months: 3, notice_days: 30 }),
  },
  {
    id: "t2", name: "8 sessions monthly", description: "", image_url: "", deliverable: "sessions", billing: "recurring",
    interval: "month", price: 520, currency: "usd", status: "active", visibility: "staff_only", version: 1,
    activeSubs: 11, lifetimePurchases: 22, presetName: "Session membership",
    sessions_config: mkSessions({ quantity: 8, service: "1-on-1", rollover: { enabled: true, cap: 4, expire_days: 60 } }),
    billing_policy: defPolicy({ commitment_months: 3, notice_days: 30 }),
  },
  {
    id: "t3", name: "Semi-private 3x", description: "", image_url: "", deliverable: "sessions", billing: "recurring",
    interval: "week", price: 360, currency: "usd", status: "active", visibility: "client_self_serve", version: 1,
    activeSubs: 13, lifetimePurchases: 19, presetName: "Session membership",
    sessions_config: mkSessions({ quantity: 12, service: "2–4 people", noshow: false }),
    billing_policy: defPolicy(),
  },
  {
    id: "t5", name: "Unlimited membership", description: "Open-gym access, all class types.", image_url: "", deliverable: "access", billing: "recurring",
    interval: "month", price: 199, currency: "usd", status: "active", visibility: "client_self_serve", version: 1,
    activeSubs: 26, lifetimePurchases: 58, presetName: "Membership",
    access_config: { included_service_ids: ["Group", "2–4 people"], usage_cap: { count: 0, period: "week" } },
    billing_policy: defPolicy({ commitment_months: 0, notice_days: 15 }),
  },
  {
    id: "t4", name: "4-pack add-on", description: "", image_url: "", deliverable: "sessions", billing: "one_time",
    interval: "month", price: 260, currency: "usd", status: "draft", visibility: "staff_only", version: 1,
    activeSubs: 0, lifetimePurchases: 0, presetName: "Session pack",
    sessions_config: mkSessions({ quantity: 4, service: "1-on-1", expiry_days: "60" }),
    billing_policy: defPolicy(),
  },
  {
    id: "t6", name: "Milton hoodie", description: "Heavyweight fleece, embroidered logo.", image_url: "", deliverable: "item", billing: "one_time",
    interval: "month", price: 45, currency: "usd", status: "draft", visibility: "client_self_serve", version: 1,
    activeSubs: 0, lifetimePurchases: 0, presetName: "Product",
    item_config: { track_inventory: true, stock: 24, fulfillment: "pickup", variants: [] },
    billing_policy: defPolicy(),
  },
];

const SUBSCRIPTIONS = [
  { id: "s1", client: "Carrie Nolan", template: "12 sessions monthly", coach: "Devon", start: "May 1", remaining: 16, status: "healthy", next: "Renews Sep 1" },
  { id: "s2", client: "Marcus Webb", template: "8 sessions monthly", coach: "Marisa", start: "Feb 14", remaining: 3, status: "healthy", next: "Renews Aug 14" },
  { id: "s3", client: "Priya Raman", template: "Semi-private 3x", coach: "Rolland", start: "Jun 3", remaining: 0, status: "failed", next: "Retry Aug 11" },
  { id: "s4", client: "Dana Okoye", template: "12 sessions monthly", coach: "Devon", start: "Jan 8", remaining: 9, status: "paused", next: "Resumes Sep 1" },
];

const METRICS = { activeSubs: 38, mrr: 21480, unusedSessions: 211, unusedValue: 12660 };

// ── Small shared bits ───────────────────────────────────────────
function Eyebrow({ children }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: TEXT_SEC, textTransform: "uppercase", letterSpacing: "0.08em" }}>
      {children}
    </div>
  );
}

function Pill({ children, bg, color }) {
  return (
    <span style={{ fontSize: 11.5, fontWeight: 600, color, background: bg, padding: "4px 11px", borderRadius: 999, whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 5 }}>
      {children}
    </span>
  );
}

function statusPill(status) {
  if (status === "failed") return <Pill bg={RED_TINT} color={ALERT_RED}>Payment failed</Pill>;
  if (status === "paused") return <Pill bg={AMBER_TINT} color={AMBER}>Paused</Pill>;
  return null;
}

function pkgStatePill(status) {
  if (status === "active") return <Pill bg={TEAL_LIGHT} color={TEAL}>Active</Pill>;
  if (status === "archived") return <Pill bg="#eef1f0" color={TEXT_SEC}>Archived</Pill>;
  return <Pill bg="#eef1f0" color={TEXT_SEC}>Draft</Pill>;
}

const cardBase = { background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}` };

function Card({ children, style }) {
  return <div style={{ ...cardBase, ...style }}>{children}</div>;
}

const Icon = ({ d, size = 16, sw = 2, children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">{children || <path d={d} />}</svg>
);

// ── Setup & routing tab (unchanged) ─────────────────────────────
function SetupTab({ routingActive, onActivate }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ ...cardBase, borderLeft: `4px solid ${TEAL}`, background: "linear-gradient(90deg,#f0f8f6,#ffffff 55%)", padding: 24, display: "flex", gap: 18 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: TEXT, color: WHITE, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="9 12 11.5 14.5 16 9" /></svg>
        </div>
        <div>
          <Eyebrow>Stripe Connect</Eyebrow>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: TEXT, margin: "6px 0 6px", letterSpacing: "-0.01em" }}>Your payment account is ready</h2>
          <p style={{ margin: 0, fontSize: 14, color: TEXT_SEC, lineHeight: 1.5, maxWidth: 620 }}>
            Card payments are available. Stripe may still request additional information as your organization grows.
          </p>
        </div>
      </div>

      <Card style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>
        {[
          { label: "Card payments", value: "On", dot: TEAL, bold: false },
          { label: "Payouts to bank", value: "On", dot: TEAL, bold: false },
          { label: "Verification", value: "Verified", dot: "#c2d1cd", bold: true },
        ].map((s, i) => (
          <div key={s.label} style={{ padding: "18px 22px", borderLeft: i === 0 ? "none" : `1px solid ${BORDER}` }}>
            <div style={{ fontSize: 12.5, color: TEXT_SEC, marginBottom: 8 }}>{s.label}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.dot }} />
              <span style={{ fontSize: 14, fontWeight: s.bold ? 700 : 600, color: TEXT }}>{s.value}</span>
            </div>
          </div>
        ))}
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card style={{ padding: 22, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: "#ece9fb", color: "#6b5bd0", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>
            </div>
            <Pill bg={TEAL_LIGHT} color={TEAL}>Payments live</Pill>
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: TEXT, margin: "16px 0 6px" }}>Stripe Connect</h3>
          <p style={{ margin: 0, fontSize: 13, color: TEXT_SEC, lineHeight: 1.5 }}>Credit and debit cards. Stripe verifies the business and pays funds directly to its bank account.</p>
          <div style={{ marginTop: 16, alignSelf: "flex-start", background: PAGE_BG, border: `1px solid ${BORDER}`, borderRadius: 7, padding: "6px 10px", fontFamily: MONO, fontSize: 12.5, color: TEXT }}>
            acct_1U1zTlKsdG4oYBil
          </div>
        </Card>

        <Card style={{ padding: 22, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: GREEN_TINT, color: GREEN, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="22" x2="21" y2="22" /><line x1="6" y1="18" x2="6" y2="11" /><line x1="10" y1="18" x2="10" y2="11" /><line x1="14" y1="18" x2="14" y2="11" /><line x1="18" y1="18" x2="18" y2="11" /><polygon points="12 2 20 7 4 7" /></svg>
            </div>
            <Pill bg={AMBER_TINT} color={AMBER}>Coming soon</Pill>
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: TEXT, margin: "16px 0 6px" }}>More payment options</h3>
          <p style={{ margin: 0, fontSize: 13, color: TEXT_SEC, lineHeight: 1.5 }}>We're working on support for additional payment processors, including bank payment options. They'll appear here when they're ready.</p>
          <button disabled style={{ marginTop: 16, alignSelf: "flex-start", background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "9px 14px", fontSize: 13, fontWeight: 600, color: TEXT_SEC, cursor: "default" }}>
            More processors coming soon
          </button>
        </Card>
      </div>

      <Card style={{ padding: 24 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
          <div>
            <Eyebrow>Payment routing</Eyebrow>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: TEXT, margin: "8px 0 0" }}>How new checkouts are processed</h3>
          </div>
          {routingActive
            ? <Pill bg={TEAL_LIGHT} color={TEAL}>Active</Pill>
            : <Pill bg="#eef1f0" color={TEXT_SEC}>Not configured</Pill>}
        </div>
        <p style={{ margin: "16px 0 18px", fontSize: 14, color: TEXT_SEC, lineHeight: 1.55, maxWidth: 640 }}>
          Activate routes after a provider can accept payments. Existing transactions and subscriptions stay pinned to their original provider.
        </p>
        {routingActive ? (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: TEAL_LIGHT, color: TEAL, borderRadius: 8, padding: "11px 16px", fontSize: 14, fontWeight: 700 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            Routes active
          </div>
        ) : (
          <button onClick={onActivate} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: TEAL, color: WHITE, border: "none", borderRadius: 8, padding: "11px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            Activate available routes
          </button>
        )}
      </Card>

      <div style={{ ...cardBase, background: TEAL_LIGHT, borderColor: "#cfe6e2", padding: "18px 22px", display: "flex", gap: 14 }}>
        <div style={{ color: TEAL, flexShrink: 0, marginTop: 1 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
        </div>
        <div>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: TEXT }}>Milton does not store card, bank, tax, or identity data.</div>
          <div style={{ fontSize: 13, color: TEXT_SEC, marginTop: 3, lineHeight: 1.5 }}>The browser receives only short-lived provider URLs. Provider secrets remain in the Commerce service and all user requests pass through Milton Backend.</div>
        </div>
      </div>
    </div>
  );
}

// ── Empty state (Payments / Payouts tabs) ───────────────────────
function EmptyTab({ eyebrow, title, emptyTitle, emptyBody }) {
  return (
    <Card>
      <div style={{ padding: "20px 24px", borderBottom: `1px solid ${BORDER}` }}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: TEXT, margin: "6px 0 0" }}>{title}</h3>
      </div>
      <div style={{ padding: "70px 24px", textAlign: "center" }}>
        <div style={{ color: "#a9bab6", marginBottom: 14 }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M14.5 9a2.5 2 0 0 0-2.5-1.5c-1.5 0-2.5.8-2.5 2s1 1.6 2.5 2 2.5.9 2.5 2-1 2-2.5 2A2.5 2 0 0 1 9.5 15" /><line x1="12" y1="6" x2="12" y2="7" /><line x1="12" y1="17" x2="12" y2="18" /></svg>
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: TEXT }}>{emptyTitle}</div>
        <div style={{ fontSize: 13.5, color: TEXT_SEC, marginTop: 6 }}>{emptyBody}</div>
      </div>
    </Card>
  );
}

// ── Packages tab ────────────────────────────────────────────────
function PackagesTab({ routingActive, packages, onGoSetup, onOpenPackage, onNewPackage }) {
  const tiles = [
    { label: "Active subscriptions", value: METRICS.activeSubs.toLocaleString(), sub: "across published packages" },
    { label: "Monthly recurring", value: money(METRICS.mrr), sub: "billed on renewal" },
    { label: "Unused sessions owed", value: METRICS.unusedSessions.toLocaleString(), sub: `≈ ${money(METRICS.unusedValue)} in delivery owed`, accent: true },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {!routingActive && (
        <div style={{ ...cardBase, borderLeft: `4px solid ${AMBER}`, background: AMBER_TINT, borderColor: "#ecdcb8", padding: "18px 22px" }}>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: "#7a4e14" }}>Packages cannot bill yet</div>
          <p style={{ margin: "5px 0 14px", fontSize: 13.5, color: "#8a5f2a", lineHeight: 1.55, maxWidth: 680 }}>
            No payment route is active, so a published package has no way to charge. Build your catalog now and publish once routes are live.
          </p>
          <button onClick={onGoSetup} style={{ background: WHITE, border: `1px solid #e0cfa6`, color: "#7a4e14", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            Go to Setup &amp; routing
          </button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {tiles.map((t) => (
          <Card key={t.label} style={{ padding: "18px 20px", borderColor: t.accent ? "#cfe6e2" : BORDER, background: t.accent ? "#f4faf9" : WHITE }}>
            <div style={{ fontSize: 12, color: TEXT_SEC, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{t.label}</div>
            <div style={{ fontFamily: MONO, fontSize: 28, fontWeight: 600, color: t.accent ? TEAL : TEXT, margin: "10px 0 4px", letterSpacing: "-0.01em" }}>{t.value}</div>
            <div style={{ fontSize: 12.5, color: TEXT_SEC }}>{t.sub}</div>
          </Card>
        ))}
      </div>

      <Card>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: `1px solid ${BORDER}` }}>
          <div>
            <Eyebrow>Catalog</Eyebrow>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: TEXT, margin: "5px 0 0" }}>Packages you sell</h3>
          </div>
          <button onClick={onNewPackage} style={{ display: "inline-flex", alignItems: "center", gap: 7, background: TEAL, color: WHITE, border: "none", borderRadius: 8, padding: "9px 15px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            New package
          </button>
        </div>
        <div>
          {packages.map((p, i) => (
            <div key={p.id} onClick={() => onOpenPackage(p.id)}
              style={{ display: "flex", alignItems: "center", gap: 16, padding: "15px 20px", borderTop: i === 0 ? "none" : `1px solid ${BORDER}`, cursor: "pointer" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = PAGE_BG)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <span style={{ width: 34, height: 34, borderRadius: 9, background: TEAL_LIGHT, color: TEAL, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={17}>{PRESET_ICON[(PRESETS.find((x) => x.deliverable === p.deliverable && x.billing === p.billing) || {}).icon] || PRESET_ICON.box}</Icon>
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>{p.name}</span>
                  {p.status !== "active" && pkgStatePill(p.status)}
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: TEXT_SEC, background: "#eef1f0", padding: "2px 7px", borderRadius: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>{DELIVERABLE_LABEL[p.deliverable]}</span>
                </div>
                <div style={{ fontSize: 12, color: TEXT_SEC, marginTop: 4 }}>{catalogSubtitle(p)}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: MONO, fontSize: 15, fontWeight: 600, color: TEXT }}>{priceLine(p)}</div>
                <div style={{ fontSize: 11.5, color: TEXT_SEC, marginTop: 3 }}>
                  {p.status === "active" ? `${p.activeSubs} active${p.version > 1 ? ` · v${p.version}` : ""}` : "not published"}
                </div>
              </div>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#b7c6c2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><polyline points="9 18 15 12 9 6" /></svg>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Subscriptions tab (unchanged) ───────────────────────────────
function SubscriptionsTab({ onOpenClient }) {
  return (
    <Card>
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BORDER}` }}>
        <Eyebrow>Agreements</Eyebrow>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: TEXT, margin: "5px 0 0" }}>Active subscriptions</h3>
      </div>
      <div>
        {SUBSCRIPTIONS.map((s, i) => (
          <div key={s.id} onClick={() => onOpenClient?.(s.client)}
            style={{ display: "flex", alignItems: "center", gap: 16, padding: "15px 20px", borderTop: i === 0 ? "none" : `1px solid ${BORDER}`, cursor: "pointer" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = PAGE_BG)}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
                <span style={{ fontSize: 14.5, fontWeight: 700, color: TEXT }}>{s.client}</span>
                {statusPill(s.status)}
              </div>
              <div style={{ fontSize: 12, color: TEXT_SEC, marginTop: 4 }}>{s.template} · {s.coach} · since {s.start}</div>
              {s.status === "failed" && (
                <div style={{ fontSize: 12, color: ALERT_RED, marginTop: 6, display: "flex", alignItems: "center", gap: 5 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12" y2="16" /></svg>
                  Can they still book against earned sessions? Needs a decision.
                </div>
              )}
              {s.status === "paused" && (
                <div style={{ fontSize: 12, color: AMBER, marginTop: 6, display: "flex", alignItems: "center", gap: 5 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12" y2="16" /></svg>
                  Does the pause freeze session expiry too? Needs a decision.
                </div>
              )}
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: MONO, fontSize: 15, fontWeight: 600, color: s.remaining === 0 ? ALERT_RED : TEXT }}>
                {s.remaining} {s.status === "paused" ? "held" : "left"}
              </div>
              <div style={{ fontSize: 11.5, color: TEXT_SEC, marginTop: 3 }}>{s.next}</div>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#b7c6c2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><polyline points="9 18 15 12 9 6" /></svg>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── Builder atoms ───────────────────────────────────────────────
const inputStyle = { padding: "9px 11px", borderRadius: 9, border: `1px solid ${BORDER}`, fontSize: 13, color: TEXT, background: WHITE, width: "100%", boxSizing: "border-box", fontFamily: "inherit" };

const SectionHead = ({ title, caption, right }) => (
  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
    <div>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: TEXT, margin: 0 }}>{title}</h3>
      {caption && <p style={{ fontSize: 12.5, color: TEXT_SEC, margin: "3px 0 0", lineHeight: 1.45 }}>{caption}</p>}
    </div>
    {right}
  </div>
);

const Field = ({ label, hint, children }) => (
  <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
    <span style={{ fontSize: 11.5, fontWeight: 600, color: TEXT_SEC }}>{label}</span>
    {children}
    {hint && <span style={{ fontSize: 11.5, color: TEXT_SEC, lineHeight: 1.4 }}>{hint}</span>}
  </label>
);

function ChipRow({ options, value, onChange, disabled }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {options.map(([v, l]) => {
        const on = value === v;
        return (
          <button key={String(v)} type="button" disabled={disabled} onClick={() => onChange(v)}
            style={{ padding: "6px 12px", borderRadius: 999, border: `1px solid ${on ? TEAL : BORDER}`, background: on ? TEAL_LIGHT : WHITE, color: on ? TEAL : TEXT_SEC, fontSize: 12.5, fontWeight: 600, cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.5 : 1 }}>
            {l}
          </button>
        );
      })}
    </div>
  );
}

function Segmented({ options, value, onChange, disabled }) {
  return (
    <div style={{ display: "inline-flex", border: `1px solid ${BORDER}`, borderRadius: 9, overflow: "hidden", opacity: disabled ? 0.5 : 1 }}>
      {options.map(([v, l], i) => {
        const on = value === v;
        return (
          <button key={String(v)} type="button" disabled={disabled} onClick={() => onChange(v)}
            style={{ padding: "8px 14px", background: on ? TEAL : WHITE, color: on ? WHITE : TEXT_SEC, border: "none", borderLeft: i === 0 ? "none" : `1px solid ${BORDER}`, fontSize: 12.5, fontWeight: 700, cursor: disabled ? "default" : "pointer" }}>
            {l}
          </button>
        );
      })}
    </div>
  );
}

function Toggle({ checked, onChange, disabled }) {
  return (
    <button type="button" role="switch" aria-checked={checked} disabled={disabled} onClick={() => onChange(!checked)}
      style={{ width: 40, height: 23, borderRadius: 999, border: "none", background: checked ? TEAL : "#cbd5d3", position: "relative", cursor: disabled ? "default" : "pointer", flexShrink: 0, transition: "background .15s", opacity: disabled ? 0.5 : 1 }}>
      <span style={{ position: "absolute", top: 2, left: checked ? 19 : 2, width: 19, height: 19, borderRadius: "50%", background: WHITE, transition: "left .15s" }} />
    </button>
  );
}

function ToggleRow({ label, sub, checked, onChange, disabled }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, padding: "12px 0" }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: TEXT }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: TEXT_SEC, marginTop: 2, lineHeight: 1.45 }}>{sub}</div>}
      </div>
      <Toggle checked={checked} onChange={onChange} disabled={disabled} />
    </div>
  );
}

// Collapsed policy row: one-line summary + Adjust/Edit toggle
function Collapsible({ title, summary, children, defaultOpen = false, action = "Adjust" }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, padding: "13px 15px", background: open ? PAGE_BG : WHITE }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: TEXT }}>{title}</div>
          {summary && <div style={{ fontSize: 12.5, color: TEXT_SEC, marginTop: 3, lineHeight: 1.5 }}>{summary}</div>}
        </div>
        <button type="button" onClick={() => setOpen((o) => !o)} style={{ background: "none", border: "none", color: TEAL, fontSize: 12.5, fontWeight: 700, cursor: "pointer", flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 4 }}>
          {open ? "Done" : action}
          <Icon size={13} sw={2.4}><polyline points={open ? "18 15 12 9 6 15" : "6 9 12 15 18 9"} /></Icon>
        </button>
      </div>
      {open && <div style={{ padding: "4px 15px 15px", borderTop: `1px solid ${BORDER}` }}>{children}</div>}
    </div>
  );
}

// ── Service combobox: search / create / dedupe ──────────────────
function ServiceCombobox({ value, services, onChange, onCreate, disabled }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const q = query.trim();
  const filtered = services.filter((s) => s.toLowerCase().includes(q.toLowerCase()));
  const exact = services.some((s) => s.toLowerCase() === q.toLowerCase());
  const nearest = useMemo(() => {
    if (!q || exact) return null;
    let best = null, bd = Infinity;
    services.forEach((s) => { const d = editDistance(s, q); if (d < bd) { bd = d; best = s; } });
    return bd > 0 && bd <= 2 ? best : null;
  }, [q, exact, services]);

  const pick = (name) => { onChange(name); setQuery(""); setOpen(false); };
  const create = () => { onCreate(q); onChange(q); setQuery(""); setOpen(false); };

  return (
    <div style={{ position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, ...inputStyle, padding: "0 11px", cursor: disabled ? "default" : "text", opacity: disabled ? 0.6 : 1 }}
        onClick={() => !disabled && setOpen(true)}>
        <Icon size={15}><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></Icon>
        <input
          value={open ? query : ""} disabled={disabled}
          onFocus={() => setOpen(true)}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onKeyDown={(e) => { if (e.key === "Enter" && q && !exact) { e.preventDefault(); create(); } }}
          placeholder={value || "Search services"}
          style={{ border: "none", outline: "none", flex: 1, fontSize: 13, color: TEXT, background: "transparent", padding: "9px 0", fontFamily: "inherit" }}
        />
        {!open && value && <span style={{ fontSize: 12.5, fontWeight: 700, color: TEAL }}>{value}</span>}
      </div>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 10 }} />
          <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 10, boxShadow: "0 8px 28px rgba(20,50,44,0.12)", zIndex: 11, overflow: "hidden" }}>
            {filtered.map((s) => (
              <div key={s} onClick={() => pick(s)} style={{ padding: "10px 13px", fontSize: 13, color: TEXT, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = PAGE_BG)} onMouseLeave={(e) => (e.currentTarget.style.background = WHITE)}>
                {s}{value === s && <Icon size={14}><polyline points="20 6 9 17 4 12" /></Icon>}
              </div>
            ))}
            {q && !exact && (
              <div onClick={create} style={{ padding: "10px 13px", fontSize: 13, color: TEAL, fontWeight: 700, cursor: "pointer", borderTop: filtered.length ? `1px solid ${BORDER}` : "none", display: "flex", alignItems: "center", gap: 7 }}
                onMouseEnter={(e) => (e.currentTarget.style.background = PAGE_BG)} onMouseLeave={(e) => (e.currentTarget.style.background = WHITE)}>
                <Icon size={14} sw={2.4}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></Icon>
                Create “{q}”
              </div>
            )}
            {filtered.length === 0 && !q && <div style={{ padding: "10px 13px", fontSize: 12.5, color: TEXT_SEC }}>Type to search or create a service</div>}
          </div>
        </>
      )}

      {nearest && value === q && q !== "" && !services.includes(value) && (
        <div style={{ marginTop: 8, background: AMBER_TINT, border: "1px solid #ecdcb8", borderRadius: 9, padding: "10px 12px", fontSize: 12.5, color: "#7a4e14", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <span>You already have <strong>{nearest}</strong>. Use that instead?</span>
          <button type="button" onClick={() => onChange(nearest)} style={{ background: WHITE, border: "1px solid #e0cfa6", color: "#7a4e14", borderRadius: 7, padding: "5px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>Use {nearest}</button>
        </div>
      )}
    </div>
  );
}

// ── Preset picker (Screen 1) ────────────────────────────────────
function PresetPicker({ onPick }) {
  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: TEXT, margin: 0, letterSpacing: "-0.01em" }}>What are you selling?</h2>
        <p style={{ fontSize: 13.5, color: TEXT_SEC, margin: "6px 0 0", lineHeight: 1.5 }}>Pick the closest match. Every field after this adapts to it — you'll only answer what applies.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {PRESETS.map((p) => (
          <button key={p.id} type="button" onClick={() => onPick(p)}
            style={{ textAlign: "left", background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 18, cursor: "pointer", display: "flex", gap: 14, alignItems: "flex-start", transition: "border-color .12s, box-shadow .12s" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = TEAL; e.currentTarget.style.boxShadow = "0 4px 16px rgba(43,122,120,0.1)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.boxShadow = "none"; }}>
            <span style={{ width: 42, height: 42, borderRadius: 11, background: TEAL_LIGHT, color: TEAL, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon size={21}>{PRESET_ICON[p.icon]}</Icon>
            </span>
            <span>
              <span style={{ display: "block", fontSize: 15, fontWeight: 700, color: TEXT }}>{p.name}</span>
              <span style={{ display: "block", fontSize: 12.5, color: TEXT_SEC, marginTop: 4, lineHeight: 1.5 }}>{p.desc}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Sessions block (shared by sessions deliverable + program nesting) ──
function SessionsBlock({ d, set, setCfg, services, onCreateService, locked }) {
  const c = d.sessions_config;
  const setUsage = (patch) => setCfg({ usage: { ...c.usage, ...patch } });
  const setRoll = (patch) => setCfg({ rollover: { ...c.rollover, ...patch } });
  const qtyLabel = d.billing === "recurring" ? `Sessions per ${INTERVAL_NOUN[d.interval]}` : "Sessions included";
  const rollSummary = c.rollover.enabled
    ? `Up to ${c.rollover.cap === "unlimited" ? "no limit" : c.rollover.cap} sessions.${c.rollover.cap !== "unlimited" && c.rollover.expire_days ? ` Expire after ${c.rollover.expire_days} days.` : ""}`
    : "Use it or lose it — nothing carries over.";
  const usageSummary = (() => {
    const use = ["Completed"];
    if (c.usage.late_cancel) use.push("late cancel");
    if (c.usage.no_show) use.push("no-show");
    return `${use.join(", ")} use a session. Coach cancellations don't.`;
  })();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Service">
          <ServiceCombobox value={c.service} services={services} onChange={(v) => setCfg({ service: v })} onCreate={onCreateService} disabled={locked} />
        </Field>
        <Field label="Session length">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="number" min="15" step="5" value={c.duration_min} onChange={(e) => setCfg({ duration_min: +e.target.value || 60 })} style={{ ...inputStyle, width: 90 }} />
            <span style={{ fontSize: 13, color: TEXT_SEC }}>minutes</span>
          </div>
        </Field>
      </div>

      <Field label={qtyLabel}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <ChipRow options={[[4, "4"], [8, "8"], [12, "12"], [20, "20"]]} value={c.quantity} onChange={(v) => setCfg({ quantity: v })} disabled={locked} />
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 12.5, color: TEXT_SEC }}>Custom</span>
            <input type="number" min="1" value={c.quantity} disabled={locked} onChange={(e) => setCfg({ quantity: Math.max(1, +e.target.value || 1) })} style={{ ...inputStyle, width: 72, padding: "7px 9px" }} />
          </div>
        </div>
      </Field>

      <Field label="Coaches">
        <Segmented options={[["all", "All coaches"], ["select", "Select coaches"]]} value={c.coach_scope} onChange={(v) => setCfg({ coach_scope: v })} />
      </Field>

      {/* Expiry — one_time only */}
      {d.billing === "one_time" && (
        <Field label="Sessions expire" hint="A pack has no cycles, so this is a hard expiry from the purchase date.">
          <ChipRow options={[["never", "Never"], ["30", "30 days"], ["60", "60 days"], ["90", "90 days"]]} value={c.expiry_days} onChange={(v) => setCfg({ expiry_days: v })} />
        </Field>
      )}

      {/* Rollover — recurring only, collapsed */}
      {d.billing === "recurring" && (
        <Collapsible title="Rollover" summary={rollSummary} action="Adjust">
          <div style={{ paddingTop: 12, display: "flex", flexDirection: "column", gap: 14 }}>
            <ToggleRow label="Unused sessions carry over" sub="Unused sessions carry into the next month, up to the cap." checked={c.rollover.enabled} onChange={(v) => setRoll({ enabled: v })} />
            {c.rollover.enabled && (
              <>
                <Field label="Carry-over cap">
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <input type="number" min="1" value={c.rollover.cap === "unlimited" ? "" : c.rollover.cap} placeholder="12"
                      onChange={(e) => setRoll({ cap: Math.max(1, +e.target.value || 1) })} style={{ ...inputStyle, width: 80 }} disabled={c.rollover.cap === "unlimited"} />
                    <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, color: TEXT_SEC, cursor: "pointer" }}>
                      <input type="checkbox" checked={c.rollover.cap === "unlimited"} onChange={(e) => setRoll({ cap: e.target.checked ? "unlimited" : c.quantity })} style={{ accentColor: TEAL, width: 16, height: 16 }} />
                      No limit
                    </label>
                  </div>
                </Field>
                {c.rollover.cap === "unlimited" ? (
                  <div style={{ background: AMBER_TINT, border: "1px solid #ecdcb8", borderRadius: 9, padding: "10px 12px", fontSize: 12.5, color: "#7a4e14", lineHeight: 1.5 }}>
                    Nothing expires. You carry the delivery liability indefinitely.
                  </div>
                ) : (
                  <Field label="Carried sessions expire after" hint="Unused sessions carry into the next month, up to the cap. They expire if not used in time.">
                    <ChipRow options={[["", "Never"], [30, "30 days"], [60, "60 days"], [90, "90 days"]]} value={c.rollover.expire_days} onChange={(v) => setRoll({ expire_days: v })} />
                  </Field>
                )}
              </>
            )}
          </div>
        </Collapsible>
      )}

      {/* Session usage — collapsed preset */}
      <Collapsible title="Session usage" summary={usageSummary} action="Adjust">
        <div style={{ paddingTop: 6 }}>
          <UsageEditRow label="Completed session" state="fixed-on" />
          <UsageEditRow label="Late cancel" sub={`Inside the ${c.cancel_window_hours}-hour window.`} checked={c.usage.late_cancel} onToggle={() => setUsage({ late_cancel: !c.usage.late_cancel })} />
          <UsageEditRow label="No show" checked={c.usage.no_show} onToggle={() => setUsage({ no_show: !c.usage.no_show })} />
          <UsageEditRow label="Coach cancelled" state="fixed-off" />
        </div>
      </Collapsible>

      <Field label="Appointment cancellation window" hint="Cancel a booked appointment inside this window and it counts as a late cancel.">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input type="number" min="0" value={c.cancel_window_hours} onChange={(e) => setCfg({ cancel_window_hours: Math.max(0, +e.target.value || 0) })} style={{ ...inputStyle, width: 90 }} />
          <span style={{ fontSize: 13, color: TEXT_SEC }}>hours before start</span>
        </div>
      </Field>
    </div>
  );
}

function UsageEditRow({ label, sub, state, checked, onToggle }) {
  const fixed = state === "fixed-on" || state === "fixed-off";
  const tag = state === "fixed-on" ? "Uses a session" : state === "fixed-off" ? "Doesn't use a session" : null;
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "11px 0", borderTop: `1px solid ${BORDER}` }}>
      {!fixed && (
        <input type="checkbox" checked={checked} onChange={onToggle} style={{ width: 17, height: 17, marginTop: 1, accentColor: TEAL, cursor: "pointer", flexShrink: 0 }} />
      )}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: TEXT }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: TEXT_SEC, marginTop: 2 }}>{sub}</div>}
        {!fixed && <div style={{ fontSize: 12, color: TEXT_SEC, marginTop: 2 }}>{checked ? "Uses a session" : "Doesn't use a session"}</div>}
      </div>
      {fixed && <span style={{ fontSize: 11.5, fontWeight: 600, color: TEXT_SEC, background: "#eef1f0", padding: "3px 9px", borderRadius: 999, flexShrink: 0 }}>{tag}</span>}
    </div>
  );
}

// ── Package builder (Screen 2) ──────────────────────────────────
function PackageBuilder({ d, set, services, onCreateService, locked, errors }) {
  const setCfg = (patch) => set({ sessions_config: { ...d.sessions_config, ...patch } });
  const setAccess = (patch) => set({ access_config: { ...d.access_config, ...patch } });
  const setProgram = (patch) => set({ program_config: { ...d.program_config, ...patch } });
  const setItem = (patch) => set({ item_config: { ...d.item_config, ...patch } });
  const setPolicy = (patch) => set({ billing_policy: { ...d.billing_policy, ...patch } });

  const isSessions = d.deliverable === "sessions";
  const errStyle = (k) => (errors[k] ? { borderColor: ALERT_RED } : null);

  // Program can nest a sessions block
  const ensureNestedSessions = (on) => {
    if (on && !d.sessions_config) {
      set({ program_config: { ...d.program_config, includes_sessions: true }, sessions_config: newPackageFrom({ deliverable: "sessions", billing: "one_time" }, services).sessions_config });
    } else {
      setProgram({ includes_sessions: on });
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {locked && (
        <div style={{ background: TEAL_LIGHT, border: "1px solid #cfe6e2", borderRadius: 10, padding: "12px 15px", fontSize: 12.5, color: TEAL, lineHeight: 1.5 }}>
          This package has active enrollments. Type and billing are locked, and changing price or policy publishes a new version — existing buyers keep the terms they bought.
        </div>
      )}

      {/* Basics — always shown */}
      <Card style={{ padding: 22 }}>
        <SectionHead title="Basics" />
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Name" hint={errors.name ? "" : undefined}>
            <input value={d.name} onChange={(e) => set({ name: e.target.value })} placeholder="e.g. 12 sessions monthly" style={{ ...inputStyle, ...errStyle("name") }} />
            {errors.name && <span style={{ fontSize: 11.5, color: ALERT_RED }}>Give the package a name.</span>}
          </Field>

          {/* Price — bidirectional for sessions */}
          <div style={{ display: "grid", gridTemplateColumns: isSessions ? "1fr 1fr" : "1fr", gap: 12 }}>
            <Field label={isSessions ? "Total price" : "Price"}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 13, color: TEXT_SEC }}>$</span>
                <input type="number" min="0" value={d.price} placeholder="0"
                  onChange={(e) => set({ price: e.target.value === "" ? "" : Math.max(0, +e.target.value) })}
                  style={{ ...inputStyle, ...errStyle("price") }} />
                {d.billing === "recurring" && <span style={{ fontSize: 12.5, color: TEXT_SEC, whiteSpace: "nowrap" }}>/ {INTERVAL_NOUN[d.interval]}</span>}
              </div>
            </Field>
            {isSessions && (
              <Field label="Per session">
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 13, color: TEXT_SEC }}>$</span>
                  <input type="number" min="0" value={d.price === "" ? "" : +(Number(d.price) / d.sessions_config.quantity).toFixed(2)} placeholder="0"
                    onChange={(e) => set({ price: e.target.value === "" ? "" : Math.round(+e.target.value * d.sessions_config.quantity) })}
                    style={inputStyle} />
                </div>
              </Field>
            )}
          </div>
          {errors.price && <span style={{ fontSize: 11.5, color: ALERT_RED, marginTop: -8 }}>Set a price, or mark the package free below.</span>}

          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: TEXT_SEC, cursor: "pointer" }}>
            <input type="checkbox" checked={d.price === 0} onChange={(e) => set({ price: e.target.checked ? 0 : "" })} style={{ accentColor: TEAL, width: 16, height: 16 }} />
            This package is free
          </label>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Who can buy this">
              <Segmented options={[["staff_only", "Staff only"], ["client_self_serve", "Clients self-serve"]]} value={d.visibility} onChange={(v) => set({ visibility: v })} />
            </Field>
            <Field label="Status">
              <Segmented options={[["draft", "Draft"], ["active", "Active"], ["archived", "Archived"]]} value={d.status} onChange={(v) => set({ status: v })} />
            </Field>
          </div>

          <Field label="Description (optional)">
            <textarea value={d.description} onChange={(e) => set({ description: e.target.value })} rows={2} placeholder="What the buyer gets, in a sentence or two." style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }} />
          </Field>

          <Field label={d.deliverable === "item" ? "Product image" : "Image (optional)"}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: d.deliverable === "item" ? 72 : 48, height: d.deliverable === "item" ? 72 : 48, borderRadius: 10, border: `1px dashed ${BORDER}`, background: PAGE_BG, display: "flex", alignItems: "center", justifyContent: "center", color: "#a9bab6", flexShrink: 0 }}>
                <Icon size={20}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></Icon>
              </div>
              <button type="button" style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "8px 13px", fontSize: 12.5, fontWeight: 600, color: TEXT, cursor: "pointer" }}>Upload image</button>
            </div>
          </Field>
        </div>
      </Card>

      {/* Sessions block */}
      {isSessions && (
        <Card style={{ padding: 22 }}>
          <SectionHead title="Sessions" caption="What the buyer can book against this balance." />
          <SessionsBlock d={d} set={set} setCfg={setCfg} services={services} onCreateService={onCreateService} locked={locked} />
        </Card>
      )}

      {/* Access block */}
      {d.deliverable === "access" && (
        <Card style={{ padding: 22 }}>
          <SectionHead title="Access" caption="What this membership admits. No session balance to track." />
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Field label="Included services">
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {services.map((s) => {
                  const on = d.access_config.included_service_ids.includes(s);
                  return (
                    <button key={s} type="button" onClick={() => setAccess({ included_service_ids: on ? d.access_config.included_service_ids.filter((x) => x !== s) : [...d.access_config.included_service_ids, s] })}
                      style={{ padding: "7px 13px", borderRadius: 999, border: `1px solid ${on ? TEAL : BORDER}`, background: on ? TEAL_LIGHT : WHITE, color: on ? TEAL : TEXT_SEC, fontSize: 12.5, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
                      {on && <Icon size={13} sw={2.6}><polyline points="20 6 9 17 4 12" /></Icon>}{s}
                    </button>
                  );
                })}
              </div>
            </Field>
            <Collapsible title="Usage cap" summary={d.access_config.usage_cap.count ? `Limited to ${d.access_config.usage_cap.count} visits per ${d.access_config.usage_cap.period}.` : "Unlimited — no cap on visits."} action="Adjust">
              <div style={{ paddingTop: 12, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span style={{ fontSize: 13, color: TEXT }}>Limit to</span>
                <input type="number" min="0" value={d.access_config.usage_cap.count || ""} placeholder="∞" onChange={(e) => setAccess({ usage_cap: { ...d.access_config.usage_cap, count: Math.max(0, +e.target.value || 0) } })} style={{ ...inputStyle, width: 70 }} />
                <span style={{ fontSize: 13, color: TEXT }}>visits per</span>
                <Segmented options={[["day", "Day"], ["week", "Week"], ["month", "Month"]]} value={d.access_config.usage_cap.period} onChange={(v) => setAccess({ usage_cap: { ...d.access_config.usage_cap, period: v } })} />
              </div>
            </Collapsible>
          </div>
        </Card>
      )}

      {/* Program block */}
      {d.deliverable === "program" && (
        <Card style={{ padding: 22 }}>
          <SectionHead title="Program" caption="A dated thing with a beginning and an end." />
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Field label="Dates">
              <Segmented options={[["fixed", "Fixed dates"], ["rolling", "Rolling from enrollment"]]} value={d.program_config.mode} onChange={(v) => setProgram({ mode: v })} />
            </Field>
            {d.program_config.mode === "fixed" ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Start date"><input type="date" value={d.program_config.start_date} onChange={(e) => setProgram({ start_date: e.target.value })} style={{ ...inputStyle, ...(errors.dates ? { borderColor: ALERT_RED } : null) }} /></Field>
                <Field label="End date"><input type="date" value={d.program_config.end_date} onChange={(e) => setProgram({ end_date: e.target.value })} style={{ ...inputStyle, ...(errors.dates ? { borderColor: ALERT_RED } : null) }} /></Field>
              </div>
            ) : (
              <Field label="Length">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input type="number" min="1" value={d.program_config.duration_weeks} onChange={(e) => setProgram({ duration_weeks: Math.max(1, +e.target.value || 1) })} style={{ ...inputStyle, width: 90 }} />
                  <span style={{ fontSize: 13, color: TEXT_SEC }}>weeks from enrollment</span>
                </div>
              </Field>
            )}
            {errors.dates && <span style={{ fontSize: 11.5, color: ALERT_RED, marginTop: -8 }}>End date must be after the start date.</span>}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Capacity (optional)" hint="Drives a waitlist when full.">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input type="number" min="0" value={d.program_config.capacity || ""} placeholder="∞" onChange={(e) => setProgram({ capacity: Math.max(0, +e.target.value || 0) })} style={{ ...inputStyle, width: 90 }} />
                  <span style={{ fontSize: 13, color: TEXT_SEC }}>seats</span>
                </div>
              </Field>
            </div>
            <Collapsible title="Enrollment window" summary={d.program_config.enrollment_opens || d.program_config.enrollment_closes ? `Opens ${d.program_config.enrollment_opens || "—"}, closes ${d.program_config.enrollment_closes || "—"}.` : "Open until the program starts."} action="Adjust">
              <div style={{ paddingTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Enrollment opens"><input type="date" value={d.program_config.enrollment_opens} onChange={(e) => setProgram({ enrollment_opens: e.target.value })} style={inputStyle} /></Field>
                <Field label="Enrollment closes"><input type="date" value={d.program_config.enrollment_closes} onChange={(e) => setProgram({ enrollment_closes: e.target.value })} style={inputStyle} /></Field>
              </div>
            </Collapsible>
            <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 4 }}>
              <ToggleRow label="Includes sessions" sub="Nest a session component, e.g. 4 check-in calls inside the program." checked={d.program_config.includes_sessions} onChange={ensureNestedSessions} />
            </div>
            {d.program_config.includes_sessions && d.sessions_config && (
              <div style={{ background: PAGE_BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 16 }}>
                <SessionsBlock d={{ ...d, deliverable: "sessions", billing: "one_time" }} set={set} setCfg={setCfg} services={services} onCreateService={onCreateService} locked={locked} />
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Item block */}
      {d.deliverable === "item" && (
        <Card style={{ padding: 22 }}>
          <SectionHead title="Fulfillment & inventory" caption="A physical or digital good. No scheduling or session policy." />
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Field label="Fulfillment">
              <Segmented options={[["pickup", "Pickup"], ["ship", "Ship"], ["digital", "Digital"]]} value={d.item_config.fulfillment} onChange={(v) => setItem({ fulfillment: v })} />
            </Field>
            <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 4 }}>
              <ToggleRow label="Track inventory" sub="Hides the item from the storefront when stock hits zero." checked={d.item_config.track_inventory} onChange={(v) => setItem({ track_inventory: v })} />
            </div>
            {d.item_config.track_inventory && (
              <Field label="Stock on hand">
                <input type="number" min="0" value={d.item_config.stock} onChange={(e) => setItem({ stock: Math.max(0, +e.target.value || 0) })} style={{ ...inputStyle, width: 120 }} />
              </Field>
            )}
            {/* Variants */}
            <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 14 }}>
              <SectionHead title="Variants" caption="Size, flavor, or color. Optional — most gyms sell one SKU." />
              {d.item_config.variants.map((v, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <input value={v.name} placeholder="e.g. Large" onChange={(e) => setItem({ variants: d.item_config.variants.map((x, xi) => xi === i ? { ...x, name: e.target.value } : x) })} style={{ ...inputStyle, flex: 1 }} />
                  <input type="number" min="0" value={v.stock} placeholder="Stock" onChange={(e) => setItem({ variants: d.item_config.variants.map((x, xi) => xi === i ? { ...x, stock: Math.max(0, +e.target.value || 0) } : x) })} style={{ ...inputStyle, width: 90 }} />
                  <button type="button" onClick={() => setItem({ variants: d.item_config.variants.filter((_, xi) => xi !== i) })} style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 8, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", color: TEXT_SEC, cursor: "pointer", flexShrink: 0 }}>
                    <Icon size={15}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></Icon>
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => setItem({ variants: [...d.item_config.variants, { name: "", stock: 0 }] })} style={{ background: WHITE, border: `1px dashed ${BORDER}`, borderRadius: 8, padding: "9px 13px", fontSize: 12.5, fontWeight: 600, color: TEAL, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Icon size={14} sw={2.4}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></Icon>
                Add variant
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Billing block */}
      <Card style={{ padding: 22 }}>
        <SectionHead title="Billing" caption={d.billing === "recurring" ? "How and how often this charges." : "How this one-time charge is collected."} />
        {d.billing === "one_time" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Field label="Payment plan">
              <Segmented options={[["full", "Pay in full"], ["split", "Split payments"], ["deposit", "Deposit + balance"]]} value={d.billing_policy.payment_plan.mode} onChange={(v) => setPolicy({ payment_plan: { ...d.billing_policy.payment_plan, mode: v } })} />
            </Field>
            {d.billing_policy.payment_plan.mode === "split" && (
              <Field label="Number of payments">
                <input type="number" min="2" value={d.billing_policy.payment_plan.installments} onChange={(e) => setPolicy({ payment_plan: { ...d.billing_policy.payment_plan, installments: Math.max(2, +e.target.value || 2) } })} style={{ ...inputStyle, width: 90 }} />
              </Field>
            )}
            {d.billing_policy.payment_plan.mode === "deposit" && (
              <Field label="Deposit taken upfront">
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 13, color: TEXT_SEC }}>$</span>
                  <input type="number" min="0" value={d.billing_policy.payment_plan.deposit} onChange={(e) => setPolicy({ payment_plan: { ...d.billing_policy.payment_plan, deposit: Math.max(0, +e.target.value || 0) } })} style={{ ...inputStyle, width: 120 }} />
                </div>
              </Field>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Interval">
                <select value={d.interval} onChange={(e) => set({ interval: e.target.value })} disabled={locked} style={inputStyle}>
                  {Object.entries(INTERVAL_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </Field>
              <Field label="Free trial">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input type="number" min="0" value={d.billing_policy.trial_days} onChange={(e) => setPolicy({ trial_days: Math.max(0, +e.target.value || 0) })} style={{ ...inputStyle, width: 80 }} />
                  <span style={{ fontSize: 13, color: TEXT_SEC }}>days</span>
                </div>
              </Field>
            </div>

            {/* Membership cancellation terms — distinct from appointment cancellation */}
            <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 16 }}>
              <SectionHead title="Membership cancellation terms" caption="These govern ending the subscription — not cancelling a single appointment." />
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <Field label="Commitment term">
                  <ChipRow options={[[0, "None"], [3, "3 months"], [6, "6 months"], [12, "12 months"]]} value={d.billing_policy.commitment_months} onChange={(v) => setPolicy({ commitment_months: v })} />
                </Field>
                <Field label="Cancellation notice">
                  <ChipRow options={[[0, "None"], [15, "15 days"], [30, "30 days"]]} value={d.billing_policy.notice_days} onChange={(v) => setPolicy({ notice_days: v })} />
                </Field>
                {d.billing_policy.commitment_months > 0 && d.billing_policy.notice_days === 0 && (
                  <div style={{ background: AMBER_TINT, border: "1px solid #ecdcb8", borderRadius: 9, padding: "9px 12px", fontSize: 12, color: "#7a4e14" }}>
                    A commitment term with no notice period lets members leave the day it ends. That's allowed — just confirm it's intended.
                  </div>
                )}
                <Field label="Early termination fee">
                  <ChipRow options={[["none", "None"], ["flat", "Flat amount"], ["remaining_balance", "Remaining balance"]]} value={d.billing_policy.etf_type} onChange={(v) => setPolicy({ etf_type: v })} />
                </Field>
                {d.billing_policy.etf_type === "flat" && (
                  <Field label="Fee amount">
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 13, color: TEXT_SEC }}>$</span>
                      <input type="number" min="0" value={d.billing_policy.etf_amount} onChange={(e) => setPolicy({ etf_amount: Math.max(0, +e.target.value || 0) })} style={{ ...inputStyle, width: 120 }} />
                    </div>
                  </Field>
                )}
              </div>
            </div>

            <Collapsible title="Pause & failed payments" summary={`Pause up to ${d.billing_policy.pause.max_days} days, ${d.billing_policy.pause.per_year}× a year · failed payment ${d.billing_policy.failed_payment === "suspend" ? "suspends" : d.billing_policy.failed_payment === "cancel" ? "cancels" : "keeps balance access"}.`} action="Adjust">
              <div style={{ paddingTop: 12, display: "flex", flexDirection: "column", gap: 14 }}>
                <ToggleRow label="Allow members to pause" checked={d.billing_policy.pause.enabled} onChange={(v) => setPolicy({ pause: { ...d.billing_policy.pause, enabled: v } })} />
                {d.billing_policy.pause.enabled && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <Field label="Max days per pause"><input type="number" min="1" value={d.billing_policy.pause.max_days} onChange={(e) => setPolicy({ pause: { ...d.billing_policy.pause, max_days: Math.max(1, +e.target.value || 1) } })} style={inputStyle} /></Field>
                    <Field label="Times per year"><input type="number" min="1" value={d.billing_policy.pause.per_year} onChange={(e) => setPolicy({ pause: { ...d.billing_policy.pause, per_year: Math.max(1, +e.target.value || 1) } })} style={inputStyle} /></Field>
                  </div>
                )}
                <Field label="When a payment fails">
                  <select value={d.billing_policy.failed_payment} onChange={(e) => setPolicy({ failed_payment: e.target.value })} style={inputStyle}>
                    <option value="suspend">Retry, then suspend access</option>
                    <option value="existing_balance_only">Keep earned-session access only</option>
                    <option value="cancel">Cancel the subscription</option>
                  </select>
                </Field>
              </div>
            </Collapsible>
          </div>
        )}
      </Card>
    </div>
  );
}

// ── Review (Screen 3) ───────────────────────────────────────────
function ReviewScreen({ d }) {
  const int = INTERVAL_NOUN[d.interval];
  const headlineQty = d.deliverable === "sessions"
    ? `${d.sessions_config.quantity} sessions`
    : d.deliverable === "access" ? "Unlimited access"
      : d.deliverable === "program" ? (d.program_config.mode === "fixed" ? "Fixed program" : `${d.program_config.duration_weeks}-week program`)
        : d.name || "Product";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: TEXT, margin: 0, letterSpacing: "-0.01em" }}>Review before publishing</h2>
        <p style={{ fontSize: 13.5, color: TEXT_SEC, margin: "6px 0 0", lineHeight: 1.5 }}>This is what a client sees, and the terms they agree to. Screenshot it and send it if you like.</p>
      </div>

      {/* Client-facing card */}
      <div style={{ background: TEAL_LIGHT, borderRadius: 14, border: "1px solid #cfe6e2", padding: 22 }}>
        <Eyebrow>Client preview</Eyebrow>
        <Card style={{ padding: 22, marginTop: 12 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: TEXT }}>{d.name || "Untitled package"}</div>
              {d.description && <div style={{ fontSize: 13, color: TEXT_SEC, marginTop: 4, lineHeight: 1.5, maxWidth: 380 }}>{d.description}</div>}
            </div>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: TEAL, background: TEAL_LIGHT, padding: "3px 8px", borderRadius: 6, textTransform: "uppercase", letterSpacing: "0.05em", flexShrink: 0 }}>{DELIVERABLE_LABEL[d.deliverable]}</span>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 26, fontWeight: 600, color: TEAL, margin: "16px 0 4px" }}>{headlineQty}</div>
          <div style={{ fontSize: 14, color: TEXT }}>
            <span style={{ fontFamily: MONO, fontWeight: 600 }}>{money(d.price)}</span>
            {d.billing === "recurring" ? ` per ${int}` : " one-time"}
            {d.deliverable === "sessions" && d.price !== "" && <span style={{ color: TEXT_SEC }}> · {fmtPerSession(d.price, d.sessions_config.quantity)} / session</span>}
          </div>
        </Card>
      </div>

      {/* Plain-language terms */}
      <Card style={{ padding: 22 }}>
        <SectionHead title="Terms, in plain language" />
        <p style={{ fontSize: 15, color: TEXT, lineHeight: 1.65, margin: 0 }}>{termsSummary(d)}</p>
      </Card>
    </div>
  );
}

// ── Builder shell: picker → build → review ──────────────────────
function BuilderShell({ editor, routingActive, services, onCreateService, onChangeDraft, onSetStage, onCancel, onSave }) {
  const d = editor.draft;
  const set = (patch) => onChangeDraft(patch);
  const locked = !editor.isNew && (d.activeSubs > 0 || d.lifetimePurchases > 0);
  const stage = editor.stage;
  const setStage = onSetStage;
  const [showErrors, setShowErrors] = useState(false);

  const errors = useMemo(() => {
    const e = {};
    if (!d.name.trim()) e.name = true;
    if (d.price === "") e.price = true; // 0 is allowed only via the free checkbox, which sets 0
    if (d.deliverable === "program" && d.program_config.mode === "fixed" && d.program_config.start_date && d.program_config.end_date && d.program_config.end_date < d.program_config.start_date) e.dates = true;
    return e;
  }, [d]);
  const publishBlocked = Object.keys(errors).length > 0;

  const goReview = () => {
    if (publishBlocked) { setShowErrors(true); return; }
    setStage("review");
  };

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", paddingBottom: 90 }}>
      {stage === "build" && (
        <PackageBuilder d={d} set={set} services={services} onCreateService={onCreateService} locked={locked} errors={showErrors ? errors : {}} />
      )}
      {stage === "review" && <ReviewScreen d={d} />}

      {/* Sticky footer */}
      <div style={{ position: "sticky", bottom: 0, marginTop: 16, background: "rgba(250,252,251,0.92)", backdropFilter: "blur(6px)", borderTop: `1px solid ${BORDER}`, padding: "14px 0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ fontSize: 12, color: TEXT_SEC, maxWidth: 360, lineHeight: 1.45 }}>
          {!routingActive
            ? "Publish is blocked until a payment route is active."
            : locked
              ? "Editing price or policy publishes a new version. Existing buyers keep their terms."
              : stage === "review" ? "Publishing creates the matching Stripe price." : "Review shows the client-facing terms before you publish."}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {stage === "review" ? (
            <button type="button" onClick={() => setStage("build")} style={{ background: WHITE, border: `1px solid ${BORDER}`, color: TEXT, borderRadius: 8, padding: "10px 16px", fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>Back to edit</button>
          ) : (
            <button type="button" onClick={() => onSave(d, "draft")} style={{ background: WHITE, border: `1px solid ${BORDER}`, color: TEXT, borderRadius: 8, padding: "10px 16px", fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>Save draft</button>
          )}
          {stage === "build" ? (
            <button type="button" onClick={goReview} style={{ background: TEAL, border: "none", color: WHITE, borderRadius: 8, padding: "10px 18px", fontSize: 13.5, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
              Review <Icon size={15} sw={2.4}><polyline points="9 18 15 12 9 6" /></Icon>
            </button>
          ) : (
            <button type="button" onClick={() => routingActive && onSave(d, "active")} disabled={!routingActive}
              style={{ background: routingActive ? TEAL : "#cbd5d3", border: "none", color: WHITE, borderRadius: 8, padding: "10px 18px", fontSize: 13.5, fontWeight: 700, cursor: routingActive ? "pointer" : "not-allowed" }}>
              {locked ? "Publish new version" : "Publish"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main canvas ─────────────────────────────────────────────────
const TABS = [
  { id: "setup", label: "Setup & routing" },
  { id: "packages", label: "Packages" },
  { id: "subscriptions", label: "Subscriptions" },
  { id: "payments", label: "Payments" },
  { id: "payouts", label: "Payouts" },
];

export default function PaymentsCanvas({ onClose, isMobile, onOpenClient }) {
  const [routingActive, setRoutingActive] = useState(false);
  const [packages, setPackages] = useState(SEED_PACKAGES);
  const [services, setServices] = useState(SERVICE_SEED);
  const [tab, setTab] = useState("setup");
  const [editor, setEditor] = useState(null); // { stage:'picker' } | { stage:'build'|'review', draft, isNew, id? }

  const createService = (name) => setServices((prev) => (prev.some((s) => s.toLowerCase() === name.toLowerCase()) ? prev : [...prev, name]));
  const changeDraft = (patch) => setEditor((prev) => ({ ...prev, draft: { ...prev.draft, ...patch } }));

  const openNew = () => setEditor({ stage: "picker" });
  const pickPreset = (preset) => setEditor({ stage: "build", isNew: true, draft: newPackageFrom(preset, services) });
  const openExisting = (id) => { const p = packages.find((x) => x.id === id); setEditor({ stage: "build", isNew: false, id, draft: JSON.parse(JSON.stringify(p)) }); };

  const handleSave = (draft, status) => {
    setPackages((prev) => {
      if (editor.isNew) {
        return [...prev, { ...draft, id: "t" + Date.now(), status, activeSubs: 0, lifetimePurchases: 0 }];
      }
      return prev.map((p) => {
        if (p.id !== editor.id) return p;
        const isLive = p.activeSubs > 0 || p.lifetimePurchases > 0;
        return { ...draft, id: p.id, status, activeSubs: p.activeSubs, lifetimePurchases: p.lifetimePurchases, version: isLive && status === "active" ? p.version + 1 : p.version };
      });
    });
    setEditor(null);
  };

  const inEditor = !!editor;
  const editingName = editor?.isNew ? (editor.stage === "picker" ? "New package" : (editor.draft.presetName || "New package")) : editor?.draft?.name;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: PAGE_BG }}>
      {/* Header */}
      <div style={{ padding: isMobile ? "16px" : "22px 32px", background: WHITE, borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <Eyebrow>Organization settings</Eyebrow>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <h1 style={{ fontSize: isMobile ? 24 : 30, fontWeight: 700, color: TEXT, margin: 0, letterSpacing: "-0.02em" }}>Payments</h1>
              <Pill bg={TEAL_LIGHT} color={TEAL}>Payments live</Pill>
            </div>
            <p style={{ fontSize: 14, color: TEXT_SEC, margin: "8px 0 0", lineHeight: 1.5, maxWidth: 640 }}>
              Connect providers, define what you sell, and monitor money moving through your organization.
            </p>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${BORDER}`, background: WHITE, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: TEXT_SEC, flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        {/* Tab bar OR breadcrumb */}
        {inEditor ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, flexWrap: "wrap" }}>
              <button onClick={() => setEditor(null)} style={{ background: "none", border: "none", color: TEAL, fontWeight: 700, cursor: "pointer", padding: 0, fontSize: 14, display: "inline-flex", alignItems: "center", gap: 5 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15,18 9,12 15,6" /></svg>
                Packages
              </button>
              <span style={{ color: "#c2d1cd" }}>/</span>
              <span style={{ color: TEXT, fontWeight: 600 }}>{editingName}</span>
              {editor.stage === "review" && (<><span style={{ color: "#c2d1cd" }}>/</span><span style={{ color: TEXT_SEC }}>Review</span></>)}
            </div>
            {editor.stage !== "picker" && pkgStatePill(editor.draft.status)}
          </div>
        ) : (
          <div style={{ display: "flex", gap: 22, marginTop: 18, borderBottom: `1px solid ${BORDER}`, marginLeft: -4 }}>
            {TABS.map((t) => {
              const active = tab === t.id;
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  style={{ background: "none", border: "none", padding: "0 4px 10px", cursor: "pointer", fontSize: 14, fontWeight: active ? 700 : 500, color: active ? TEAL : TEXT_SEC, borderBottom: `2px solid ${active ? TEAL : "transparent"}`, marginBottom: -1 }}>
                  {t.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? 16 : "24px 32px" }}>
        <div style={{ maxWidth: 940, margin: "0 auto" }}>
          {inEditor ? (
            editor.stage === "picker" ? (
              <PresetPicker onPick={pickPreset} />
            ) : (
              <BuilderShell
                key={editor.id || "new"}
                editor={editor}
                routingActive={routingActive}
                services={services}
                onCreateService={createService}
                onChangeDraft={changeDraft}
                onSetStage={(s) => setEditor((prev) => ({ ...prev, stage: s }))}
                onCancel={() => setEditor(null)}
                onSave={handleSave}
              />
            )
          ) : (
            <>
              {tab === "setup" && <SetupTab routingActive={routingActive} onActivate={() => setRoutingActive(true)} />}
              {tab === "packages" && (
                <PackagesTab
                  routingActive={routingActive}
                  packages={packages}
                  onGoSetup={() => setTab("setup")}
                  onOpenPackage={openExisting}
                  onNewPackage={openNew}
                />
              )}
              {tab === "subscriptions" && <SubscriptionsTab onOpenClient={onOpenClient} />}
              {tab === "payments" && (
                <EmptyTab eyebrow="Transactions" title="Payments" emptyTitle="No payments yet" emptyBody="Create a test checkout after activating a payment route." />
              )}
              {tab === "payouts" && (
                <EmptyTab eyebrow="Settlement" title="Payouts" emptyTitle="No payouts yet" emptyBody="Payouts will appear after providers settle successful payments." />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
