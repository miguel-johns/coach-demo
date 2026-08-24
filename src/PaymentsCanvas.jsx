import React, { useState } from "react";
import { TEAL, TEAL_LIGHT, WHITE, TEXT, TEXT_SEC, BORDER, ALERT_RED } from "./constants";

const MONO = "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace";
const PAGE_BG = "#fafcfb";
const AMBER = "#a86a1f";
const AMBER_TINT = "#f6edd9";
const GREEN = "#1f7a3e";
const GREEN_TINT = "#e6f9ec";
const RED_TINT = "#fbe9e7";

const money = (n) => "$" + Number(n).toLocaleString();
const perSession = (t) => {
  const v = t.pricePerCycle / t.sessionsPerCycle;
  return Number.isInteger(v) ? "$" + v : "$" + v.toFixed(2);
};

const TYPE_LABEL = {
  "recurring-monthly": "recurring",
  "recurring-weekly": "recurring",
  "one-time": "one-time pack",
};
const CADENCE_LABEL = {
  "recurring-monthly": "per month",
  "recurring-weekly": "per week",
  "one-time": "one-time",
};

// ── Derived copy generators (never stored) ──────────────────────
function describeTemplate(t) {
  const parts = [t.service, TYPE_LABEL[t.type]];
  if (t.rollover === "unlimited") parts.push("unlimited rollover");
  else if (t.rollover === "cap") parts.push(`cap ${t.rolloverCap}`);
  else parts.push("no rollover");
  if (t.rollover !== "none" && t.rolledExpiry !== "never") parts.push(`expires ${t.rolledExpiry}d`);
  const draws = [];
  if (t.drawLateCancel) draws.push("late cancel");
  if (t.drawNoShow) draws.push("no show");
  if (draws.length === 1) parts.push(`${draws[0]} draws`);
  else if (draws.length === 2) parts.push("late cancel & no show draw");
  return parts.join(" · ");
}

function rolloverSentence(t) {
  let base;
  if (t.rollover === "none") base = "Unused sessions don't carry over.";
  else if (t.rollover === "cap") base = `Up to ${t.rolloverCap} unused ${t.rolloverCap === 1 ? "session carries" : "sessions carry"} into next ${t.type === "recurring-weekly" ? "week" : "month"}.`;
  else base = "Unused sessions carry over with no limit.";
  if (t.rollover !== "none" && t.rolledExpiry !== "never") base += ` They expire after ${t.rolledExpiry} days.`;
  return base;
}

function drawSentence(t) {
  const used = ["completed visits"];
  if (t.drawLateCancel) used.push("late cancels");
  if (t.drawNoShow) used.push("no shows");
  let joined;
  if (used.length === 1) joined = used[0];
  else joined = used.slice(0, -1).join(", ") + " and " + used[used.length - 1];
  return `Sessions are used by ${joined}.`;
}

// ── Mock data ───────────────────────────────────────────────────
const SEED_TEMPLATES = [
  {
    id: "t1", name: "12 sessions monthly", service: "1-on-1", type: "recurring-monthly",
    sessionsPerCycle: 12, pricePerCycle: 720, sessionLength: 60,
    rollover: "unlimited", rolloverCap: 12, rolledExpiry: "never",
    drawLateCancel: true, drawNoShow: true, availability: "staff", coaches: "all",
    state: "published", activeSubs: 14,
  },
  {
    id: "t2", name: "8 sessions monthly", service: "1-on-1", type: "recurring-monthly",
    sessionsPerCycle: 8, pricePerCycle: 520, sessionLength: 60,
    rollover: "cap", rolloverCap: 4, rolledExpiry: "never",
    drawLateCancel: true, drawNoShow: true, availability: "staff", coaches: "all",
    state: "published", activeSubs: 11,
  },
  {
    id: "t3", name: "Semi-private 3x", service: "2–4 people", type: "recurring-weekly",
    sessionsPerCycle: 12, pricePerCycle: 360, sessionLength: 60,
    rollover: "none", rolloverCap: 0, rolledExpiry: "never",
    drawLateCancel: true, drawNoShow: false, availability: "both", coaches: "all",
    state: "published", activeSubs: 13,
  },
  {
    id: "t4", name: "4-pack add-on", service: "1-on-1", type: "one-time",
    sessionsPerCycle: 4, pricePerCycle: 260, sessionLength: 60,
    rollover: "none", rolloverCap: 0, rolledExpiry: "60",
    drawLateCancel: true, drawNoShow: true, availability: "staff", coaches: "all",
    state: "draft", activeSubs: 0,
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

const cardBase = { background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}` };

function Card({ children, style }) {
  return <div style={{ ...cardBase, ...style }}>{children}</div>;
}

// ── Setup & routing tab ─────────────────────────────────────────
function SetupTab({ routingActive, onActivate }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Stripe ready band */}
      <div style={{ ...cardBase, borderLeft: `4px solid ${TEAL}`, background: "linear-gradient(90deg,#f0f8f6,#ffffff 55%)", padding: 24, display: "flex", gap: 18 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: TEXT, color: WHITE, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11.5 14.5 16 9"/></svg>
        </div>
        <div>
          <Eyebrow>Stripe Connect</Eyebrow>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: TEXT, margin: "6px 0 6px", letterSpacing: "-0.01em" }}>Your payment account is ready</h2>
          <p style={{ margin: 0, fontSize: 14, color: TEXT_SEC, lineHeight: 1.5, maxWidth: 620 }}>
            Card payments are available. Stripe may still request additional information as your organization grows.
          </p>
        </div>
      </div>

      {/* Status row */}
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

      {/* Provider cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card style={{ padding: 22, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: "#ece9fb", color: "#6b5bd0", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>
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

      {/* Payment routing */}
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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Routes active
          </div>
        ) : (
          <button onClick={onActivate} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: TEAL, color: WHITE, border: "none", borderRadius: 8, padding: "11px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Activate available routes
          </button>
        )}
      </Card>

      {/* Security band */}
      <div style={{ ...cardBase, background: TEAL_LIGHT, borderColor: "#cfe6e2", padding: "18px 22px", display: "flex", gap: 14 }}>
        <div style={{ color: TEAL, flexShrink: 0, marginTop: 1 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
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
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M14.5 9a2.5 2 0 0 0-2.5-1.5c-1.5 0-2.5.8-2.5 2s1 1.6 2.5 2 2.5.9 2.5 2-1 2-2.5 2A2.5 2 0 0 1 9.5 15"/><line x1="12" y1="6" x2="12" y2="7"/><line x1="12" y1="17" x2="12" y2="18"/></svg>
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: TEXT }}>{emptyTitle}</div>
        <div style={{ fontSize: 13.5, color: TEXT_SEC, marginTop: 6 }}>{emptyBody}</div>
      </div>
    </Card>
  );
}

// ── Packages tab ────────────────────────────────────────────────
function PackagesTab({ routingActive, templates, defaults, onGoSetup, onOpenTemplate, onNewTemplate, onOpenScheduling }) {
  const tiles = [
    { label: "Active subscriptions", value: METRICS.activeSubs.toLocaleString(), sub: "across published packages" },
    { label: "Monthly recurring", value: money(METRICS.mrr), sub: "billed on renewal" },
    { label: "Unused sessions owed", value: METRICS.unusedSessions.toLocaleString(), sub: `≈ ${money(METRICS.unusedValue)} in delivery owed`, accent: true },
  ];
  const defaultRows = [
    { label: "Rollover", value: "Cap at one cycle" },
    { label: "Late cancel", value: "Draws a session" },
    { label: "No show", value: "Draws a session" },
    { label: "Cancellation window", value: "24 hours", locked: true },
    { label: "Failed payment", value: "Retry 3 times, then pause" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Blocking notice */}
      {!routingActive && (
        <div style={{ ...cardBase, borderLeft: `4px solid ${AMBER}`, background: AMBER_TINT, borderColor: "#ecdcb8", padding: "18px 22px" }}>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: "#7a4e14" }}>Templates cannot bill yet</div>
          <p style={{ margin: "5px 0 14px", fontSize: 13.5, color: "#8a5f2a", lineHeight: 1.55, maxWidth: 680 }}>
            No payment route is active, so a published package has no way to charge. Build your catalog now and publish once routes are live.
          </p>
          <button onClick={onGoSetup} style={{ background: WHITE, border: `1px solid #e0cfa6`, color: "#7a4e14", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            Go to Setup &amp; routing
          </button>
        </div>
      )}

      {/* Metric row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {tiles.map((t) => (
          <Card key={t.label} style={{ padding: "18px 20px", borderColor: t.accent ? "#cfe6e2" : BORDER, background: t.accent ? "#f4faf9" : WHITE }}>
            <div style={{ fontSize: 12, color: TEXT_SEC, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{t.label}</div>
            <div style={{ fontFamily: MONO, fontSize: 28, fontWeight: 600, color: t.accent ? TEAL : TEXT, margin: "10px 0 4px", letterSpacing: "-0.01em" }}>{t.value}</div>
            <div style={{ fontSize: 12.5, color: TEXT_SEC }}>{t.sub}</div>
          </Card>
        ))}
      </div>

      {/* Templates list */}
      <Card>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: `1px solid ${BORDER}` }}>
          <div>
            <Eyebrow>Catalog</Eyebrow>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: TEXT, margin: "5px 0 0" }}>Packages you sell</h3>
          </div>
          <button onClick={onNewTemplate} style={{ display: "inline-flex", alignItems: "center", gap: 7, background: TEAL, color: WHITE, border: "none", borderRadius: 8, padding: "9px 15px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New template
          </button>
        </div>
        <div>
          {templates.map((t, i) => (
            <div key={t.id} onClick={() => onOpenTemplate(t.id)}
              style={{ display: "flex", alignItems: "center", gap: 16, padding: "15px 20px", borderTop: i === 0 ? "none" : `1px solid ${BORDER}`, cursor: "pointer" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = PAGE_BG)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>{t.name}</span>
                  {t.state === "draft" && <Pill bg="#eef1f0" color={TEXT_SEC}>Draft</Pill>}
                </div>
                <div style={{ fontSize: 12, color: TEXT_SEC, marginTop: 4 }}>{describeTemplate(t)}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: MONO, fontSize: 15, fontWeight: 600, color: TEXT }}>{money(t.pricePerCycle)}</div>
                <div style={{ fontSize: 11.5, color: TEXT_SEC, marginTop: 3 }}>
                  {t.state === "published" ? `${t.activeSubs} active` : "not published"}
                </div>
              </div>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#b7c6c2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          ))}
        </div>
      </Card>

      {/* Defaults card */}
      <Card style={{ padding: "18px 20px" }}>
        <Eyebrow>Policy</Eyebrow>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: TEXT, margin: "5px 0 2px" }}>Defaults for new templates</h3>
        <p style={{ margin: "0 0 6px", fontSize: 12.5, color: TEXT_SEC, lineHeight: 1.5 }}>
          These seed new templates only. Changing them never touches an existing template or client.
        </p>
        <div>
          {defaultRows.map((r, i) => (
            <div key={r.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderTop: i === 0 ? `1px solid ${BORDER}` : `1px solid ${BORDER}` }}>
              <span style={{ fontSize: 13.5, color: TEXT }}>{r.label}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: TEXT_SEC }}>{r.value}</span>
                {r.locked && (
                  <button onClick={onOpenScheduling} style={{ fontSize: 12, fontWeight: 600, color: TEAL, background: "none", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 3 }}>
                    Scheduling
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7"/><path d="M7 7h10v10"/></svg>
                  </button>
                )}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Subscriptions tab ───────────────────────────────────────────
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
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12" y2="16"/></svg>
                  Can they still book against earned sessions? Needs a decision.
                </div>
              )}
              {s.status === "paused" && (
                <div style={{ fontSize: 12, color: AMBER, marginTop: 6, display: "flex", alignItems: "center", gap: 5 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12" y2="16"/></svg>
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
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#b7c6c2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── Template editor ─────────────────────────────────────────────
const SectionTitle = ({ n, children }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
    <span style={{ width: 22, height: 22, borderRadius: "50%", background: TEAL_LIGHT, color: TEAL, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{n}</span>
    <h3 style={{ fontSize: 15, fontWeight: 700, color: TEXT, margin: 0 }}>{children}</h3>
  </div>
);

const Field = ({ label, children }) => (
  <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
    <span style={{ fontSize: 11.5, fontWeight: 600, color: TEXT_SEC }}>{label}</span>
    {children}
  </label>
);

const inputStyle = { padding: "9px 11px", borderRadius: 9, border: `1px solid ${BORDER}`, fontSize: 13, color: TEXT, background: WHITE, width: "100%", boxSizing: "border-box", fontFamily: "inherit" };

function DrawRow({ label, sub, fixed, fixedLabel, checked, onToggle }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 0", borderTop: `1px solid ${BORDER}` }}>
      <input type="checkbox" checked={fixed ? (fixedLabel === "Always draws") : checked} disabled={fixed} onChange={fixed ? undefined : onToggle}
        style={{ width: 17, height: 17, marginTop: 1, accentColor: TEAL, cursor: fixed ? "default" : "pointer", flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: TEXT }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: TEXT_SEC, marginTop: 2, lineHeight: 1.45 }}>{sub}</div>}
      </div>
      {fixed && <span style={{ fontSize: 11.5, fontWeight: 600, color: TEXT_SEC, background: "#eef1f0", padding: "3px 9px", borderRadius: 999, flexShrink: 0 }}>{fixedLabel}</span>}
    </div>
  );
}

function RadioRow({ selected, onSelect, title, consequence, children }) {
  return (
    <div onClick={onSelect} style={{ display: "flex", gap: 11, padding: "12px 14px", borderRadius: 10, border: `1px solid ${selected ? TEAL : BORDER}`, background: selected ? TEAL_LIGHT : WHITE, cursor: "pointer", marginBottom: 8 }}>
      <span style={{ width: 17, height: 17, borderRadius: "50%", border: `2px solid ${selected ? TEAL : "#c2d1cd"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
        {selected && <span style={{ width: 8, height: 8, borderRadius: "50%", background: TEAL }} />}
      </span>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: TEXT }}>{title}</span>
          {children}
        </div>
        <div style={{ fontSize: 12, color: TEXT_SEC, marginTop: 3, lineHeight: 1.45 }}>{consequence}</div>
      </div>
    </div>
  );
}

function TemplateEditor({ initial, isNew, routingActive, onCancel, onSave }) {
  const [d, setD] = useState(initial);
  const set = (patch) => setD((prev) => ({ ...prev, ...patch }));

  const rolloverConsequence = {
    none: "Nothing carries over. The balance resets every cycle.",
    cap: `At most ${d.rolloverCap} unused sessions bank into the next cycle.`,
    unlimited: "Nothing expires. You carry the delivery liability indefinitely.",
  };

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
      {/* 1. Basics */}
      <Card style={{ padding: 22 }}>
        <SectionTitle n={1}>Basics</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Name"><input value={d.name} onChange={(e) => set({ name: e.target.value })} placeholder="e.g. 12 sessions monthly" style={inputStyle} /></Field>
          <Field label="Service">
            <select value={d.service} onChange={(e) => set({ service: e.target.value })} style={inputStyle}>
              <option>1-on-1</option><option>2–4 people</option><option>Group</option>
            </select>
          </Field>
          <Field label="Type">
            <select value={d.type} onChange={(e) => set({ type: e.target.value })} style={inputStyle}>
              <option value="recurring-monthly">Recurring monthly</option>
              <option value="recurring-weekly">Recurring weekly</option>
              <option value="one-time">One-time pack</option>
            </select>
          </Field>
          <Field label="Sessions per cycle"><input type="number" min="1" value={d.sessionsPerCycle} onChange={(e) => set({ sessionsPerCycle: Math.max(1, +e.target.value || 1) })} style={inputStyle} /></Field>
          <Field label="Price per cycle ($)"><input type="number" min="0" value={d.pricePerCycle} onChange={(e) => set({ pricePerCycle: Math.max(0, +e.target.value || 0) })} style={inputStyle} /></Field>
          <Field label="Session length (min)"><input type="number" min="15" step="5" value={d.sessionLength} onChange={(e) => set({ sessionLength: +e.target.value || 60 })} style={inputStyle} /></Field>
        </div>
        <div style={{ marginTop: 14, fontSize: 13, color: TEXT_SEC }}>
          Per session: <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 600, color: TEAL }}>{perSession(d)}</span>
        </div>
      </Card>

      {/* 2. Rollover */}
      <Card style={{ padding: 22 }}>
        <SectionTitle n={2}>Rollover</SectionTitle>
        <RadioRow selected={d.rollover === "none"} onSelect={() => set({ rollover: "none" })} title="Use it or lose it" consequence={rolloverConsequence.none} />
        <RadioRow selected={d.rollover === "cap"} onSelect={() => set({ rollover: "cap" })} title="Cap at" consequence={rolloverConsequence.cap}>
          <input type="number" min="1" value={d.rolloverCap || 1} onClick={(e) => e.stopPropagation()} onChange={(e) => set({ rollover: "cap", rolloverCap: Math.max(1, +e.target.value || 1) })} style={{ ...inputStyle, width: 64, padding: "5px 8px" }} />
          <span style={{ fontSize: 13, color: TEXT_SEC }}>sessions</span>
        </RadioRow>
        <RadioRow selected={d.rollover === "unlimited"} onSelect={() => set({ rollover: "unlimited" })} title="Unlimited rollover" consequence={rolloverConsequence.unlimited} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, paddingTop: 14, borderTop: `1px solid ${BORDER}`, opacity: d.rollover === "none" ? 0.5 : 1 }}>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: TEXT }}>Rolled sessions expire after</div>
            <div style={{ fontSize: 12, color: TEXT_SEC, marginTop: 2 }}>The cap bounds what banks; expiry clears what banked.</div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {[["never", "Never"], ["30", "30 days"], ["60", "60 days"], ["90", "90 days"]].map(([v, l]) => (
              <button key={v} disabled={d.rollover === "none"} onClick={() => set({ rolledExpiry: v })}
                style={{ padding: "6px 11px", borderRadius: 999, border: `1px solid ${d.rolledExpiry === v ? TEAL : BORDER}`, background: d.rolledExpiry === v ? TEAL_LIGHT : WHITE, color: d.rolledExpiry === v ? TEAL : TEXT_SEC, fontSize: 12, fontWeight: 600, cursor: d.rollover === "none" ? "default" : "pointer" }}>{l}</button>
            ))}
          </div>
        </div>
      </Card>

      {/* 3. Draw-down */}
      <Card style={{ padding: 22 }}>
        <SectionTitle n={3}>Draw-down policy</SectionTitle>
        <DrawRow label="Completed session" fixed fixedLabel="Always draws" />
        <DrawRow label="Late cancel" sub="Uses the 24-hour cancellation window set in Scheduling." checked={d.drawLateCancel} onToggle={() => set({ drawLateCancel: !d.drawLateCancel })} />
        <DrawRow label="No show" checked={d.drawNoShow} onToggle={() => set({ drawNoShow: !d.drawNoShow })} />
        <DrawRow label="Coach cancelled" fixed fixedLabel="Never draws" />
      </Card>

      {/* 4. Availability */}
      <Card style={{ padding: 22 }}>
        <SectionTitle n={4}>Availability</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Who can start this package">
            <select value={d.availability} onChange={(e) => set({ availability: e.target.value })} style={inputStyle}>
              <option value="staff">Staff only</option>
              <option value="both">Staff and clients in app</option>
            </select>
          </Field>
          <Field label="Available for coaches">
            <select value={d.coaches} onChange={(e) => set({ coaches: e.target.value })} style={inputStyle}>
              <option value="all">All coaches</option>
              <option value="select">Selected coaches</option>
            </select>
          </Field>
        </div>
      </Card>

      {/* 5. Client preview */}
      <div style={{ background: TEAL_LIGHT, borderRadius: 12, border: `1px solid #cfe6e2`, padding: 22 }}>
        <SectionTitle n={5}>Client preview</SectionTitle>
        <Card style={{ padding: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: TEXT }}>{d.name || "Untitled package"}</div>
          <div style={{ fontSize: 13.5, color: TEXT_SEC, marginTop: 3 }}>
            <span style={{ fontFamily: MONO, fontWeight: 600, color: TEXT }}>{money(d.pricePerCycle)}</span> {CADENCE_LABEL[d.type]}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 22, fontWeight: 600, color: TEAL, margin: "12px 0 12px" }}>{d.sessionsPerCycle} sessions</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontSize: 13, color: TEXT, lineHeight: 1.5 }}>{rolloverSentence(d)}</div>
            <div style={{ fontSize: 13, color: TEXT, lineHeight: 1.5 }}>{drawSentence(d)}</div>
          </div>
        </Card>
      </div>

      {/* 6. Actions */}
      <Card style={{ padding: 22 }}>
        <SectionTitle n={6}>Save</SectionTitle>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <button onClick={() => onSave(d, "draft")} style={{ background: WHITE, border: `1px solid ${BORDER}`, color: TEXT, borderRadius: 8, padding: "10px 18px", fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>
            Save draft
          </button>
          <button onClick={() => routingActive && onSave(d, "published")} disabled={!routingActive}
            style={{ background: routingActive ? TEAL : "#cbd5d3", border: "none", color: WHITE, borderRadius: 8, padding: "10px 18px", fontSize: 13.5, fontWeight: 700, cursor: routingActive ? "pointer" : "not-allowed" }}>
            Publish
          </button>
        </div>
        <p style={{ margin: "12px 0 0", fontSize: 12.5, color: TEXT_SEC, lineHeight: 1.5 }}>
          {!routingActive
            ? "Publish is blocked until a payment route is active."
            : isNew
              ? "Publishing creates the matching Stripe price."
              : "Editing a published price creates a new one. Existing subscribers stay on the old."}
        </p>
      </Card>
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

const newTemplateFrom = (defaults) => ({
  id: "new", name: "", service: "1-on-1", type: "recurring-monthly",
  sessionsPerCycle: 12, pricePerCycle: 0, sessionLength: 60,
  rollover: "cap", rolloverCap: 12, rolledExpiry: "never",
  drawLateCancel: true, drawNoShow: true, availability: "staff", coaches: "all",
  state: "draft", activeSubs: 0,
});

export default function PaymentsCanvas({ onClose, isMobile, onOpenClient }) {
  const [routingActive, setRoutingActive] = useState(false);
  const [templates, setTemplates] = useState(SEED_TEMPLATES);
  const [tab, setTab] = useState("setup");
  const [editor, setEditor] = useState(null); // { id } | { new: true }

  const editingTemplate = editor
    ? (editor.new ? newTemplateFrom() : templates.find((t) => t.id === editor.id))
    : null;

  const handleSave = (draft, nextState) => {
    setTemplates((prev) => {
      if (editor.new) {
        const id = "t" + (Date.now());
        return [...prev, { ...draft, id, state: nextState, activeSubs: 0 }];
      }
      return prev.map((t) => (t.id === editor.id ? { ...draft, id: t.id, state: nextState, activeSubs: t.activeSubs } : t));
    });
    setEditor(null);
  };

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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Tab bar OR breadcrumb */}
        {editingTemplate ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
              <button onClick={() => setEditor(null)} style={{ background: "none", border: "none", color: TEAL, fontWeight: 700, cursor: "pointer", padding: 0, fontSize: 14, display: "inline-flex", alignItems: "center", gap: 5 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15,18 9,12 15,6"/></svg>
                Packages
              </button>
              <span style={{ color: "#c2d1cd" }}>/</span>
              <span style={{ color: TEXT, fontWeight: 600 }}>{editor.new ? "New template" : editingTemplate.name}</span>
            </div>
            {editor.new
              ? <Pill bg="#eef1f0" color={TEXT_SEC}>Draft</Pill>
              : (editingTemplate.state === "published"
                ? <Pill bg={TEAL_LIGHT} color={TEAL}>Published</Pill>
                : <Pill bg="#eef1f0" color={TEXT_SEC}>Draft</Pill>)}
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
          {editingTemplate ? (
            <TemplateEditor
              key={editor.new ? "new" : editor.id}
              initial={editingTemplate}
              isNew={!!editor.new}
              routingActive={routingActive}
              onCancel={() => setEditor(null)}
              onSave={handleSave}
            />
          ) : (
            <>
              {tab === "setup" && <SetupTab routingActive={routingActive} onActivate={() => setRoutingActive(true)} />}
              {tab === "packages" && (
                <PackagesTab
                  routingActive={routingActive}
                  templates={templates}
                  onGoSetup={() => setTab("setup")}
                  onOpenTemplate={(id) => setEditor({ id })}
                  onNewTemplate={() => setEditor({ new: true })}
                  onOpenScheduling={() => {}}
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
