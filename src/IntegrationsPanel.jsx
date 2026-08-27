import React, { useState, useEffect, useRef } from "react";
import { TEAL, TEAL_LIGHT, WHITE, TEXT, TEXT_SEC, BORDER } from "./constants";

const MONO = "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace";
const INK_050 = "#f5f8f7";
const GREEN = "#1f7a3e";
const GREEN_TINT = "#e6f9ec";
const AMBER = "#a86a1f";
const AMBER_TINT = "#f6edd9";
const RED = "#c0432a";
const RED_TINT = "#fbeae6";
const META_BLUE = "#1877f2";

// The four states this screen can be in.
const DISCONNECTED = "disconnected";
const CONNECTING = "connecting";
const CONNECTED = "connected";
const ERROR = "error";

// What Milton asks Meta for, in the coach's words rather than scope names.
const PERMISSIONS = [
  { k: "leads", label: "Read your lead forms", why: "So a new lead reaches your queue the moment they submit, not the next time you log in." },
  { k: "ads", label: "Read your ads and spend", why: "So Milton can tell you which ad actually produced paying clients, not just cheap clicks." },
  { k: "pages", label: "See the Pages you manage", why: "So you can pick the right business Page if you run more than one." },
];

// A connected account, as Meta would report it back.
const ACCOUNT = {
  page: "Ridgeline Strength",
  pageId: "104882317755291",
  adAccount: "Ridgeline Strength — Ads",
  adAccountId: "act_882410557",
  connectedBy: "Dana Whitfield",
  connectedOn: "12 Aug 2026",
};

const FORMS = [
  { id: "f1", name: "Free intro session", leads: 213, last: "6 minutes ago", live: true },
  { id: "f2", name: "12 week transformation", leads: 84, last: "2 hours ago", live: true },
  { id: "f3", name: "New year intake 2026", leads: 341, last: "3 months ago", live: false },
];

const money = (n) => "$" + Number(n).toLocaleString();

// ── Primitives, matched to the rest of the app ──────────────────
const Eyebrow = ({ children }) => (
  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: TEXT_SEC }}>{children}</div>
);

const Pill = ({ bg, color, dot, children }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 999,
    background: bg, color, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
  }}>
    {dot && <span style={{ width: 6, height: 6, borderRadius: 999, background: dot, flexShrink: 0 }} />}
    {children}
  </span>
);

const Card = ({ children, style }) => (
  <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 18, ...style }}>{children}</div>
);

const Btn = ({ kind = "secondary", sm, block, onClick, children, disabled, danger }) => {
  const base = {
    borderRadius: 10, cursor: disabled ? "not-allowed" : "pointer", fontWeight: 700, fontFamily: "inherit",
    fontSize: sm ? 12.5 : 13.5, padding: sm ? "7px 12px" : "10px 16px", width: block ? "100%" : undefined,
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, whiteSpace: "nowrap",
    opacity: disabled ? 0.5 : 1,
  };
  const skins = {
    primary: { background: TEAL, color: "#fff", border: `1px solid ${TEAL}` },
    meta: { background: META_BLUE, color: "#fff", border: `1px solid ${META_BLUE}` },
    secondary: {
      background: WHITE,
      color: danger ? RED : TEXT,
      border: `1px solid ${danger ? "#f0c9c0" : BORDER}`,
    },
  };
  return <button disabled={disabled} onClick={onClick} style={{ ...base, ...skins[kind] }}>{children}</button>;
};

const Icon = ({ d, size = 14, stroke = 2.2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">{d}</svg>
);
const I_CHECK = <path d="M20 6 9 17l-5-5" />;
const I_ALERT = <><path d="M12 9v4" /><path d="M12 17h.01" /><circle cx="12" cy="12" r="9" /></>;
const I_REFRESH = <><path d="M21 12a9 9 0 1 1-3-6.7" /><path d="M21 3v6h-6" /></>;
const I_EXT = <><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" /></>;
const I_LOCK = <><rect x="4" y="10" width="16" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>;
const I_UNLINK = <><path d="M15 7h2a5 5 0 0 1 0 10h-2" /><path d="M9 17H7A5 5 0 0 1 7 7h2" /><path d="M4 4l16 16" /></>;

// Meta's wordmark, drawn rather than imported so it stays crisp.
const MetaGlyph = ({ size = 34 }) => (
  <span style={{
    width: size, height: size, borderRadius: 9, flexShrink: 0, background: "#e8f1fe",
    display: "inline-flex", alignItems: "center", justifyContent: "center",
  }}>
    <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 24" fill="none" stroke={META_BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 15c0-5 2.2-8 4.6-8C9.4 7 11 12 12 14c1-2 2.6-7 5.4-7C19.8 7 22 10 22 15" />
    </svg>
  </span>
);

// ── Header, identical across all four states so the screen never jumps ──
function IntegrationHeader({ state, onRetry }) {
  const badge =
    state === CONNECTED ? <Pill bg={GREEN_TINT} color={GREEN} dot="#3aaf6a">Connected</Pill>
    : state === ERROR ? <Pill bg={RED_TINT} color={RED} dot={RED}>Action needed</Pill>
    : state === CONNECTING ? <Pill bg={AMBER_TINT} color={AMBER} dot="#c9922f">Connecting</Pill>
    : <Pill bg={INK_050} color={TEXT_SEC} dot="#b9c7c3">Not connected</Pill>;

  return (
    <Card>
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        <MetaGlyph />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: TEXT, letterSpacing: "-0.01em" }}>Meta Ads</h2>
            {badge}
          </div>
          <p style={{ margin: "7px 0 0", fontSize: 13, color: TEXT_SEC, lineHeight: 1.6 }}>
            Facebook and Instagram lead forms. Connect once and every lead arrives in your queue by itself,
            with the ad that produced them attached.
          </p>
        </div>
      </div>
    </Card>
  );
}

// ── State one, nothing connected yet ────────────────────────────
function Disconnected({ onConnect, isMobile }) {
  return (
    <>
      <Card>
        <Eyebrow>What changes once this is on</Eyebrow>
        <div style={{ marginTop: 13, display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
          {[
            ["Leads arrive on their own", "No exporting a CSV from Ads Manager on a Sunday night. A submission becomes a lead in seconds."],
            ["First touch inside 5 minutes", "Milton texts them while they still remember filling in the form."],
            ["Spend tied to revenue", "You see which ad produced paying clients, not just the cheapest clicks."],
            ["One place for every source", "Meta leads sit beside your pages and walk-ins, ranked the same way."],
          ].map(([t, d]) => (
            <div key={t} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
              <span style={{ color: TEAL, display: "inline-flex", marginTop: 1, flexShrink: 0 }}><Icon d={I_CHECK} size={15} stroke={2.6} /></span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>{t}</div>
                <div style={{ fontSize: 12.5, color: TEXT_SEC, lineHeight: 1.55, marginTop: 3 }}>{d}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <Eyebrow>What Milton will ask for</Eyebrow>
        <div style={{ fontSize: 12.5, color: TEXT_SEC, lineHeight: 1.55, margin: "8px 0 14px" }}>
          Meta will show you this list too. Milton reads only what is below and never posts, comments, or messages as you.
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {PERMISSIONS.map((p) => (
            <div key={p.k} style={{ display: "flex", gap: 10, alignItems: "flex-start", background: INK_050, border: `1px solid ${BORDER}`, borderRadius: 11, padding: 12 }}>
              <span style={{ color: TEAL, display: "inline-flex", marginTop: 1, flexShrink: 0 }}><Icon d={I_LOCK} size={14} /></span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>{p.label}</div>
                <div style={{ fontSize: 12.5, color: TEXT_SEC, lineHeight: 1.55, marginTop: 3 }}>{p.why}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <Btn kind="meta" onClick={onConnect}>Continue with Facebook</Btn>
        <span style={{ fontSize: 12, color: TEXT_SEC }}>
          You will be asked to sign in to Meta. You can disconnect at any time.
        </span>
      </div>
    </>
  );
}

// ── State two, the handshake ────────────────────────────────────
const STEPS = [
  "Opening Meta and waiting for you to approve",
  "Reading the Pages and ad accounts you manage",
  "Finding your live lead forms",
  "Backfilling the last 30 days of leads",
];

function Connecting({ step, isMobile }) {
  return (
    <Card>
      <Eyebrow>Connecting</Eyebrow>
      <div style={{ fontSize: 13, color: TEXT, lineHeight: 1.6, margin: "9px 0 16px" }}>
        Leave this open. Milton is talking to Meta and will tell you the moment it is done.
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {STEPS.map((s, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <div key={s} style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "10px 0" }}>
              <span style={{
                width: 20, height: 20, borderRadius: 999, flexShrink: 0, marginTop: 1,
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                background: done ? GREEN_TINT : active ? TEAL_LIGHT : INK_050,
                color: done ? GREEN : TEAL,
                border: `1px solid ${done ? "#bfe8cd" : active ? TEAL : BORDER}`,
              }}>
                {done
                  ? <Icon d={I_CHECK} size={11} stroke={3} />
                  : active
                    ? <span style={{ width: 6, height: 6, borderRadius: 999, background: TEAL }} />
                    : null}
              </span>
              <div style={{
                fontSize: 13, lineHeight: 1.5,
                color: done || active ? TEXT : TEXT_SEC,
                fontWeight: active ? 700 : 500,
              }}>{s}</div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ── State three, connected and working ──────────────────────────
function Connected({ onDisconnect, isMobile }) {
  const [confirm, setConfirm] = useState(false);
  const live = FORMS.filter((f) => f.live);

  return (
    <>
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: 18, borderBottom: `1px solid ${BORDER}` }}>
          <Eyebrow>The account Milton is reading</Eyebrow>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr" }}>
          {[
            ["Facebook Page", ACCOUNT.page, ACCOUNT.pageId],
            ["Ad account", ACCOUNT.adAccount, ACCOUNT.adAccountId],
          ].map(([label, value, id], i) => (
            <div key={label} style={{
              padding: 18,
              borderRight: !isMobile && i === 0 ? `1px solid ${BORDER}` : "none",
              borderBottom: isMobile && i === 0 ? `1px solid ${BORDER}` : "none",
            }}>
              <div style={{ fontSize: 11.5, color: TEXT_SEC, fontWeight: 600 }}>{label}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, marginTop: 5 }}>{value}</div>
              <div style={{ fontSize: 11.5, color: TEXT_SEC, marginTop: 3, fontFamily: MONO }}>{id}</div>
            </div>
          ))}
        </div>
        <div style={{ padding: "13px 18px", borderTop: `1px solid ${BORDER}`, background: INK_050, fontSize: 12, color: TEXT_SEC }}>
          Connected by {ACCOUNT.connectedBy} on {ACCOUNT.connectedOn}. Last synced 4 minutes ago.
        </div>
      </Card>

      <Card>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <Eyebrow>Lead forms Milton is watching</Eyebrow>
          <span style={{ fontSize: 12, color: TEXT_SEC }}>{live.length} live of {FORMS.length}</span>
        </div>
        <div style={{ marginTop: 13, display: "flex", flexDirection: "column", gap: 8 }}>
          {FORMS.map((f) => (
            <div key={f.id} style={{
              display: "flex", alignItems: "center", gap: 11, padding: 12,
              border: `1px solid ${BORDER}`, borderRadius: 11, background: f.live ? WHITE : INK_050,
            }}>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 13, fontWeight: 700, color: f.live ? TEXT : TEXT_SEC }}>{f.name}</span>
                <span style={{ display: "block", fontSize: 11.5, color: TEXT_SEC, marginTop: 3 }}>
                  {f.leads} leads · last {f.last}
                </span>
              </span>
              {f.live
                ? <Pill bg={GREEN_TINT} color={GREEN} dot="#3aaf6a">Live</Pill>
                : <Pill bg={INK_050} color={TEXT_SEC} dot="#b9c7c3">Paused</Pill>}
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <Eyebrow>Last 30 days</Eyebrow>
        <div style={{ marginTop: 13, display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 14 }}>
          {[
            ["Leads in", "128"],
            ["Spend", money(2840)],
            ["Cost per lead", "$22.19"],
            ["Became clients", "17"],
          ].map(([label, value]) => (
            <div key={label}>
              <div style={{ fontSize: 20, fontWeight: 700, color: TEXT, fontFamily: MONO, letterSpacing: "-0.02em" }}>{value}</div>
              <div style={{ fontSize: 11.5, color: TEXT_SEC, marginTop: 3 }}>{label}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 15, paddingTop: 14, borderTop: `1px solid ${BORDER}`, fontSize: 12.5, color: TEXT_SEC, lineHeight: 1.6 }}>
          Those 17 clients are worth {money(21420)} on your current packages, against {money(2840)} of spend.
        </div>
      </Card>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <Btn sm><Icon d={I_REFRESH} size={13} />Sync now</Btn>
        <Btn sm><Icon d={I_EXT} size={13} />Open Ads Manager</Btn>
        {confirm ? (
          <span style={{ display: "inline-flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: 12.5, color: RED, fontWeight: 600 }}>
              Disconnect? New Meta leads will stop arriving.
            </span>
            <Btn sm danger onClick={onDisconnect}>Disconnect</Btn>
            <Btn sm onClick={() => setConfirm(false)}>Keep it</Btn>
          </span>
        ) : (
          <Btn sm danger onClick={() => setConfirm(true)}><Icon d={I_UNLINK} size={13} />Disconnect</Btn>
        )}
      </div>
    </>
  );
}

// ── State four, the token went stale ────────────────────────────
function ErrorState({ onRetry, isMobile }) {
  return (
    <>
      <Card style={{ borderColor: "#f0c9c0", background: RED_TINT }}>
        <div style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
          <span style={{ color: RED, display: "inline-flex", marginTop: 1, flexShrink: 0 }}><Icon d={I_ALERT} size={17} /></span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>Meta signed Milton out</div>
            <div style={{ fontSize: 13, color: TEXT_SEC, lineHeight: 1.6, marginTop: 5 }}>
              Meta expires this permission every 60 days, and yours lapsed on 24 Aug. Nothing is lost, but new
              leads have not come through since then. Reconnecting takes about ten seconds.
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <Eyebrow>What this is costing you</Eyebrow>
        <div style={{ marginTop: 13, display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 14 }}>
          {[
            ["3 days", "Since the last sync"],
            ["9 leads", "Waiting in Meta, not in your queue"],
            ["$198", "Spent on those leads already"],
          ].map(([value, label]) => (
            <div key={label}>
              <div style={{ fontSize: 19, fontWeight: 700, color: TEXT, fontFamily: MONO, letterSpacing: "-0.02em" }}>{value}</div>
              <div style={{ fontSize: 11.5, color: TEXT_SEC, marginTop: 3, lineHeight: 1.45 }}>{label}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 15, paddingTop: 14, borderTop: `1px solid ${BORDER}`, fontSize: 12.5, color: TEXT_SEC, lineHeight: 1.6 }}>
          Milton will pull those 9 in as soon as you reconnect, and will still text them, flagged as late so you
          know to open with an apology.
        </div>
      </Card>

      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <Btn kind="meta" onClick={onRetry}>Reconnect with Facebook</Btn>
        <span style={{ fontSize: 12, color: TEXT_SEC }}>Sign in as {ACCOUNT.connectedBy} to keep the same Page and ad account.</span>
      </div>
    </>
  );
}

// ── Shell, owns the state machine ───────────────────────────────
export default function IntegrationsPanel({ isMobile }) {
  const [state, setState] = useState(DISCONNECTED);
  const [step, setStep] = useState(0);
  const timers = useRef([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => clearTimers, []);

  // Walk the handshake, then land on connected.
  const beginConnect = () => {
    clearTimers();
    setState(CONNECTING);
    setStep(0);
    [1, 2, 3].forEach((n) => {
      timers.current.push(setTimeout(() => setStep(n), n * 900));
    });
    timers.current.push(setTimeout(() => setState(CONNECTED), 4 * 900));
  };

  const disconnect = () => {
    clearTimers();
    setState(DISCONNECTED);
    setStep(0);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <IntegrationHeader state={state} />

      {state === DISCONNECTED && <Disconnected isMobile={isMobile} onConnect={beginConnect} />}
      {state === CONNECTING && <Connecting isMobile={isMobile} step={step} />}
      {state === CONNECTED && <Connected isMobile={isMobile} onDisconnect={disconnect} />}
      {state === ERROR && <ErrorState isMobile={isMobile} onRetry={beginConnect} />}

      {/* Demo affordance, so all four states are reachable without waiting 60 days. */}
      <Card style={{ background: INK_050, borderStyle: "dashed" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: TEXT_SEC }}>
            Demo
          </span>
          <span style={{ fontSize: 12.5, color: TEXT_SEC }}>Jump to a state:</span>
          {[
            [DISCONNECTED, "Not connected"],
            [CONNECTING, "Connecting"],
            [CONNECTED, "Connected"],
            [ERROR, "Expired"],
          ].map(([s, label]) => (
            <button
              key={s}
              onClick={() => {
                clearTimers();
                if (s === CONNECTING) { beginConnect(); return; }
                setState(s);
              }}
              style={{
                fontFamily: "inherit", fontSize: 11.5, fontWeight: 700, cursor: "pointer",
                padding: "5px 10px", borderRadius: 999,
                border: `1px solid ${state === s ? TEAL : BORDER}`,
                background: state === s ? TEAL_LIGHT : WHITE,
                color: state === s ? TEAL : TEXT_SEC,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
