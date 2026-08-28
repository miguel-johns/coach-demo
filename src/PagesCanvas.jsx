import React, { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import { TEAL, TEAL_LIGHT, WHITE, TEXT, TEXT_SEC, BORDER } from "./constants";

const MONO = "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace";
const INK_050 = "#f5f8f7";
const DARK = "#14403d";
const GREEN = "#1f7a3e";
const GREEN_TINT = "#e6f9ec";
const AMBER = "#a86a1f";
const AMBER_TINT = "#f6edd9";
const QUIET_RED = "#a4453a";

const SUBDOMAIN = "ridgeline.milton.site";
const urlFor = (slug) => `https://${SUBDOMAIN}/${slug}`;

const embedFor = (slug) =>
  `<div id="milton-page-${slug}"></div>
<script
  src="https://embed.milton.site/v1.js"
  data-page="${slug}"
  data-height="auto"
  async
></script>`;

// ── Modes. Named so a form only page reads as lead capture, not selling ──
const MODES = [
  {
    k: "form",
    label: "Collect leads",
    line: "A form only. Nothing is sold on this page.",
    detail: "This is how you build a lead capture form. Answers land in your Leads queue and Milton makes the first touch.",
    examples: "Free intro session, front desk signup, general enquiry",
  },
  {
    k: "products",
    label: "Sell a package",
    line: "Your packages with a checkout. No questions first.",
    detail: "Pulled straight from Milton billing, so the price and the terms are always the ones you actually charge.",
    examples: "Semi private block, six week challenge, session pack",
  },
  {
    k: "both",
    label: "Collect then sell",
    line: "Questions first, then your packages below.",
    detail: "Everyone who answers becomes a lead even if they do not buy, so nobody is lost at the checkout.",
    examples: "12 week transformation, new year intake",
  },
];
const modeOf = (k) => MODES.find((m) => m.k === k) || MODES[0];

// ── Products, as they exist in Milton billing ──
const BILLING = [
  { id: "t1", name: "12 sessions monthly", service: "1-on-1", price: 720, cadence: "per month" },
  { id: "t2", name: "8 sessions monthly", service: "1-on-1", price: 520, cadence: "per month" },
  { id: "t3", name: "Semi-private 3x", service: "2 to 4 people", price: 360, cadence: "per week" },
  { id: "t4", name: "4-pack add-on", service: "1-on-1", price: 260, cadence: "one time" },
];

const IMAGES = [
  { id: "gym", src: "/pages/gym-floor.png", label: "Gym floor" },
  { id: "coach", src: "/pages/coach-client.png", label: "Coaching a lift" },
  { id: "class", src: "/pages/morning-class.png", label: "Morning group" },
];

const money = (n) => "$" + Number(n).toLocaleString();

const CONTACT_QS = [
  { id: "q1", label: "Your name", type: "Short text", locked: true },
  { id: "q2", label: "Mobile number", type: "Phone", locked: true },
  { id: "q3", label: "Email", type: "Email", locked: true },
];

const DEFAULT_QUESTIONS = CONTACT_QS.concat([
  { id: "q4", label: "What do you want to be different in 12 weeks?", type: "Long text", locked: false },
  { id: "q5", label: "Have you trained with a coach before?", type: "Choice", locked: false },
]);

// Full content lives on the page, so the detail view can render the real thing.
const SEED_PAGES = [
  {
    id: "p1", name: "12 week transformation", mode: "both", slug: "12-week-transformation",
    leads: 84, sales: 11, revenue: 7920, updated: "2 days ago", published: true,
    headline: "Your strongest 12 weeks, start to finish",
    subhead: "Three coached sessions a week, a plan that adjusts as you go, and a coach who knows your name.",
    imageId: "coach",
    questions: CONTACT_QS.concat([
      { id: "q4", label: "What do you want to be different in 12 weeks?", type: "Long text", locked: false },
      { id: "q5", label: "Have you trained with a coach before?", type: "Choice", locked: false },
    ]),
    bonusId: "q4",
    picked: ["t1", "t3"],
  },
  {
    id: "p2", name: "Free intro session", mode: "form", slug: "free-intro-session",
    leads: 213, sales: 0, revenue: 0, updated: "Last week", published: true,
    headline: "Book a free intro session",
    subhead: "One session, no cost, no pressure. We will see where you are and talk through what comes next.",
    imageId: "gym",
    questions: CONTACT_QS.concat([
      { id: "q4", label: "What are you hoping to get out of it?", type: "Long text", locked: false },
    ]),
    bonusId: "q4",
    picked: [],
  },
  {
    id: "p3", name: "Semi private mornings", mode: "products", slug: "semi-private-mornings",
    leads: 0, sales: 9, revenue: 3240, updated: "Yesterday", published: true,
    headline: "Semi private, three mornings a week",
    subhead: "Small groups of two to four, coached every rep, before the day gets going.",
    imageId: "class",
    questions: CONTACT_QS.slice(),
    bonusId: "",
    picked: ["t3"],
  },
  {
    id: "p4", name: "Front desk signup", mode: "form", slug: "front-desk-signup",
    leads: 46, sales: 0, revenue: 0, updated: "3 weeks ago", published: false,
    headline: "Leave your details at the front desk",
    subhead: "Scan, add your number, and we will follow up before you leave the car park.",
    imageId: "gym",
    questions: CONTACT_QS.slice(),
    bonusId: "",
    picked: [],
  },
];

const slugify = (s) =>
  s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 48) || "untitled";

// ── Primitives ──────────────────────────────────────────────────
const Eyebrow = ({ children, color }) => (
  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: color || TEXT_SEC }}>{children}</div>
);

const Pill = ({ bg, color, dot, children, outline }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 999,
    background: bg, color, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
    border: outline ? `1px solid ${BORDER}` : "1px solid transparent",
  }}>
    {dot && <span style={{ width: 6, height: 6, borderRadius: 999, background: dot, flexShrink: 0 }} />}
    {children}
  </span>
);

const MODE_PILL = {
  form: { bg: TEAL_LIGHT, color: TEAL, dot: TEAL, label: "Collect leads" },
  products: { bg: GREEN_TINT, color: GREEN, dot: "#3aaf6a", label: "Sell a package" },
  both: { bg: AMBER_TINT, color: AMBER, dot: "#c9922f", label: "Collect then sell" },
};
const ModePill = ({ mode }) => {
  const m = MODE_PILL[mode] || MODE_PILL.form;
  return <Pill bg={m.bg} color={m.color} dot={m.dot}>{m.label}</Pill>;
};

const StatusPill = ({ published }) =>
  published
    ? <Pill bg={GREEN_TINT} color={GREEN} dot="#3aaf6a">Live</Pill>
    : <Pill bg="#eef1f0" color={TEXT_SEC} dot="#9fb0ab">Unpublished</Pill>;

const Card = ({ children, style }) => (
  <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 18, ...style }}>{children}</div>
);

const MiltonMark = ({ size = 20 }) => (
  <span style={{ width: size, height: size, borderRadius: 7, background: TEAL, flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
    <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round">
      <path d="M12 3v3M12 18v3M4.2 7.5l2.6 1.5M17.2 15l2.6 1.5M4.2 16.5l2.6-1.5M17.2 9l2.6-1.5" />
      <circle cx="12" cy="12" r="3.2" />
    </svg>
  </span>
);

const Btn = ({ kind = "secondary", block, sm, onClick, children, onDark, disabled, title, danger }) => {
  const base = {
    borderRadius: 10, cursor: disabled ? "not-allowed" : "pointer", fontWeight: 700, fontFamily: "inherit",
    fontSize: sm ? 12.5 : 13.5, padding: sm ? "7px 12px" : "10px 16px", width: block ? "100%" : undefined,
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, whiteSpace: "nowrap",
    opacity: disabled ? 0.5 : 1,
  };
  const skins = {
    primary: { background: TEAL, color: "#fff", border: `1px solid ${TEAL}` },
    secondary: onDark
      ? { background: "rgba(255,255,255,0.14)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)" }
      : { background: WHITE, color: TEXT, border: `1px solid ${BORDER}` },
    quiet: { background: "transparent", color: danger ? QUIET_RED : TEXT_SEC, border: "1px solid transparent" },
  };
  return <button title={title} disabled={disabled} onClick={onClick} style={{ ...base, ...skins[kind] }}>{children}</button>;
};

const BackLink = ({ onClick, children }) => (
  <button onClick={onClick} style={{
    background: "none", border: "none", padding: 0, cursor: "pointer", color: TEAL, fontFamily: "inherit",
    fontSize: 13, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6,
  }}>
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></svg>
    {children}
  </button>
);

const Icon = ({ d, size = 14, stroke = 2.2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
);
const I_LINK = <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></>;
const I_QR = <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3h-3zM19 19h2M19 14h2v2" /></>;
const I_CODE = <><path d="m9 18-6-6 6-6" /><path d="m15 6 6 6-6 6" /></>;
const I_CHECK = <path d="M20 6 9 17l-5-5" />;
const I_PLUS = <><path d="M12 5v14" /><path d="M5 12h14" /></>;
const I_TRASH = <><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" /></>;
const I_EXT = <><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" /></>;
const I_STAR = <path d="m12 3 2.6 5.6 6.1.8-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6L3.3 9.4l6.1-.8z" />;
const I_PENCIL = <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></>;
const I_COPY = <><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></>;
const I_EYE = <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></>;
const I_EYE_OFF = <><path d="M9.9 4.24A9 9 0 0 1 12 4c6.5 0 10 8 10 8a13 13 0 0 1-2.16 2.92" /><path d="M6.06 6.06A13 13 0 0 0 2 12s3.5 7 10 7a9 9 0 0 0 4-.94" /><path d="m2 2 20 20" /></>;
const I_USERS = <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>;
const I_ARROW = <><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>;

// The canvas sits beside the chat panel, so the window width tells us nothing
// useful. Measure the container we actually get.
function useContainerWidth() {
  const ref = useRef(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => setW(el.getBoundingClientRect().width);
    read();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", read);
      return () => window.removeEventListener("resize", read);
    }
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

// ── Clipboard, with a fallback for sandboxed frames ──
async function writeClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (e) { /* fall through to the textarea path */ }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch (e) {
    return false;
  }
}

async function downloadQr(slug) {
  try {
    const data = await QRCode.toDataURL(urlFor(slug), { width: 1024, margin: 2, color: { dark: "#14403dff", light: "#ffffffff" } });
    const a = document.createElement("a");
    a.href = data;
    a.download = `${slug}-qr.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (e) { /* nothing useful to show the coach if the canvas is blocked */ }
}

const openLive = (slug) => {
  if (typeof window !== "undefined") window.open(urlFor(slug), "_blank", "noopener,noreferrer");
};

// ── A real, scannable QR of the hosted link ──
function QrImg({ slug, size = 132 }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    let alive = true;
    QRCode.toDataURL(urlFor(slug), { width: size * 2, margin: 1, color: { dark: "#14403dff", light: "#ffffffff" } })
      .then((u) => { if (alive) setSrc(u); })
      .catch(() => {});
    return () => { alive = false; };
  }, [slug, size]);
  if (!src) return <div style={{ width: size, height: size, borderRadius: 10, background: INK_050, border: `1px solid ${BORDER}` }} />;
  return <img src={src} width={size} height={size} alt={`QR code linking to ${urlFor(slug)}`} style={{ display: "block", borderRadius: 10, border: `1px solid ${BORDER}` }} />;
}

// ── The three outputs, shown together ──────────────────────────
function OutputsPanel({ slug, isMobile, heading, note }) {
  const [copied, setCopied] = useState(null);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  const flash = (key) => {
    setCopied(key);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(null), 1800);
  };
  const doCopy = (key, text) => async () => {
    await writeClipboard(text);
    flash(key);
  };

  return (
    <Card style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ padding: 18, borderBottom: `1px solid ${BORDER}` }}>
        <Eyebrow>{heading || "Three ways to share it"}</Eyebrow>
        <div style={{ fontSize: 12.5, color: TEXT_SEC, lineHeight: 1.55, marginTop: 8 }}>
          {note || "All three are generated for you and stay in sync. Change the page and every one of them updates."}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 0 }}>
        {/* Hosted link */}
        <div style={{ padding: 18, borderRight: isMobile ? "none" : `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ color: TEAL, display: "inline-flex" }}><Icon d={I_LINK} size={15} /></span>
            <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>Hosted link</span>
          </div>
          <div style={{
            fontFamily: MONO, fontSize: 12, color: TEXT, background: INK_050, border: `1px solid ${BORDER}`,
            borderRadius: 9, padding: "9px 11px", wordBreak: "break-all", lineHeight: 1.5,
          }}>{urlFor(slug)}</div>
          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            <Btn sm kind={copied === "link" ? "primary" : "secondary"} onClick={doCopy("link", urlFor(slug))}>
              <Icon d={copied === "link" ? I_CHECK : I_LINK} size={13} />
              {copied === "link" ? "Copied" : "Copy link"}
            </Btn>
            <Btn sm onClick={() => openLive(slug)}><Icon d={I_EXT} size={13} />Open</Btn>
          </div>
        </div>

        {/* QR */}
        <div style={{ padding: 18, borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ color: TEAL, display: "inline-flex" }}><Icon d={I_QR} size={15} /></span>
            <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>QR code</span>
          </div>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <QrImg slug={slug} size={96} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12.5, color: TEXT_SEC, lineHeight: 1.55 }}>
                Made the moment you saved. Print it for the front desk, the window, or a poster.
              </div>
              <div style={{ marginTop: 10 }}>
                <Btn sm onClick={() => downloadQr(slug)}><Icon d={I_QR} size={13} />Download PNG</Btn>
              </div>
            </div>
          </div>
        </div>

        {/* Embed */}
        <div style={{ padding: 18, gridColumn: isMobile ? "auto" : "1 / -1" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, justifyContent: "space-between", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: TEAL, display: "inline-flex" }}><Icon d={I_CODE} size={15} /></span>
              <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>Embed on your own site</span>
            </div>
            <Btn sm kind={copied === "embed" ? "primary" : "secondary"} onClick={doCopy("embed", embedFor(slug))}>
              <Icon d={copied === "embed" ? I_CHECK : I_CODE} size={13} />
              {copied === "embed" ? "Copied" : "Copy snippet"}
            </Btn>
          </div>
          <div style={{ fontSize: 12.5, color: TEXT_SEC, lineHeight: 1.55, margin: "6px 0 10px" }}>
            Paste this once where you want the page to appear. It keeps your site&apos;s own header and footer.
          </div>
          <pre style={{
            margin: 0, fontFamily: MONO, fontSize: 11.5, lineHeight: 1.65, color: "#dfeeea",
            background: DARK, borderRadius: 10, padding: "13px 15px", overflowX: "auto", whiteSpace: "pre",
          }}>{embedFor(slug)}</pre>
        </div>
      </div>
    </Card>
  );
}

// ── Row actions on the list, one tap each ──
function RowOutputs({ slug, compact }) {
  const [copied, setCopied] = useState(null);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  const flash = (k) => { setCopied(k); clearTimeout(timer.current); timer.current = setTimeout(() => setCopied(null), 1500); };

  const btn = (key, label, iconOn, iconOff, onClick) => (
    <button
      key={key}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      title={label}
      aria-label={label}
      style={{
        display: "inline-flex", alignItems: "center", gap: 5, cursor: "pointer", fontFamily: "inherit",
        fontSize: 11.5, fontWeight: 700, padding: compact ? "5px 8px" : "6px 10px", borderRadius: 8,
        border: `1px solid ${copied === key ? TEAL : BORDER}`,
        background: copied === key ? TEAL_LIGHT : WHITE,
        color: copied === key ? TEAL : TEXT_SEC,
        whiteSpace: "nowrap",
      }}
    >
      <Icon d={copied === key ? iconOn : iconOff} size={12.5} />
      {!compact && (copied === key ? "Copied" : label)}
    </button>
  );

  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {btn("link", "Link", I_CHECK, I_LINK, async () => { await writeClipboard(urlFor(slug)); flash("link"); })}
      {btn("qr", "QR", I_QR, I_QR, () => downloadQr(slug))}
      {btn("embed", "Embed", I_CHECK, I_CODE, async () => { await writeClipboard(embedFor(slug)); flash("embed"); })}
    </div>
  );
}

// ── Live preview, the finished page ─────────────────────────────
function Preview({ mode, headline, subhead, image, questions, bonusId, picked, slug, isMobile }) {
  const prods = BILLING.filter((b) => picked.indexOf(b.id) >= 0);
  const showForm = mode === "form" || mode === "both";
  const showProds = mode === "products" || mode === "both";
  const empty = !(headline && headline.trim()) && !(subhead && subhead.trim());

  return (
    <div style={{ position: isMobile ? "static" : "sticky", top: 0 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
        <Eyebrow>Live preview</Eyebrow>
        <span style={{ fontSize: 11.5, color: TEXT_SEC }}>What a visitor sees</span>
      </div>

      <div style={{ border: `1px solid ${BORDER}`, borderRadius: 14, overflow: "hidden", background: WHITE }}>
        {/* browser chrome, so the hosted link is always visible */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", background: INK_050, borderBottom: `1px solid ${BORDER}` }}>
          <span style={{ display: "flex", gap: 4 }}>
            {["#d9d9d9", "#d9d9d9", "#d9d9d9"].map((c, i) => <span key={i} style={{ width: 8, height: 8, borderRadius: 999, background: c }} />)}
          </span>
          <div style={{
            flex: 1, minWidth: 0, fontFamily: MONO, fontSize: 10.5, color: TEXT_SEC, background: WHITE,
            border: `1px solid ${BORDER}`, borderRadius: 999, padding: "4px 10px",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{SUBDOMAIN}/{slug}</div>
        </div>

        <div style={{ maxHeight: isMobile ? "none" : 560, overflowY: "auto" }}>
          {/* the gym's own bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "12px 18px", borderBottom: `1px solid ${BORDER}` }}>
            <span style={{ width: 22, height: 22, borderRadius: 6, background: DARK, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>R</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: TEXT, letterSpacing: "-0.01em" }}>Ridgeline Strength</span>
          </div>

          {image && !empty && (
            <img
              src={image.src}
              alt=""
              style={{ display: "block", width: "100%", height: 150, objectFit: "cover" }}
            />
          )}

          {empty ? (
            <div style={{ padding: "34px 22px", textAlign: "center" }}>
              <div style={{
                width: "100%", height: 116, borderRadius: 12, border: `1px dashed #c2d1cd`, background: INK_050,
                display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18,
              }}>
                <span style={{ color: "#9fb0ab", display: "inline-flex" }}><Icon d={I_PLUS} size={22} /></span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: TEXT, letterSpacing: "-0.01em" }}>Your page builds itself here</div>
              <p style={{ margin: "8px auto 0", fontSize: 12.5, color: TEXT_SEC, lineHeight: 1.6, maxWidth: 300 }}>
                Add a headline on the left and it lands here straight away. Every field you fill shows up the moment you type it.
              </p>
              <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 9, alignItems: "stretch", maxWidth: 280, marginLeft: "auto", marginRight: "auto" }}>
                {[80, 100, 62].map((w, i) => (
                  <span key={i} style={{ height: 11, width: `${w}%`, borderRadius: 999, background: "#e7eeec", alignSelf: "center" }} />
                ))}
              </div>
            </div>
          ) : (
            <div style={{ padding: 18 }}>
              <h4 style={{ margin: 0, fontSize: 21, fontWeight: 700, color: TEXT, lineHeight: 1.22, letterSpacing: "-0.02em", textWrap: "balance" }}>
                {headline || "Your headline goes here"}
              </h4>
              {(subhead || "") && (
                <p style={{ margin: "9px 0 0", fontSize: 13.5, color: TEXT_SEC, lineHeight: 1.6, textWrap: "pretty" }}>{subhead}</p>
              )}

              {showForm && (
                <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 12 }}>
                  {questions.map((q) => (
                    <div key={q.id}>
                      <div style={{ fontSize: 12, color: TEXT, fontWeight: 600, marginBottom: 5, display: "flex", alignItems: "center", gap: 6 }}>
                        {q.label || "Untitled question"}
                        {q.id === bonusId && (
                          <span style={{ color: TEAL, display: "inline-flex" }} title="Bonus question"><Icon d={I_STAR} size={12} /></span>
                        )}
                      </div>
                      <div style={{
                        border: `1px solid ${BORDER}`, borderRadius: 9, background: WHITE,
                        padding: q.type === "Long text" ? "10px 11px 30px" : "10px 11px",
                        fontSize: 12.5, color: "#a9b8b4",
                      }}>
                        {q.type === "Choice" ? "Select one" : q.type === "Long text" ? "Type your answer" : q.type}
                      </div>
                    </div>
                  ))}
                  <button style={{ marginTop: 2, padding: "11px 16px", borderRadius: 10, border: `1px solid ${TEAL}`, background: TEAL, color: "#fff", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                    {mode === "both" ? "Continue" : "Send it over"}
                  </button>
                  <div style={{ fontSize: 11, color: TEXT_SEC, textAlign: "center" }}>
                    We reply the same day, usually inside a few minutes.
                  </div>
                </div>
              )}

              {showProds && (
                <div style={{ marginTop: showForm ? 24 : 18 }}>
                  {showForm && (
                    <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 18, marginBottom: 14 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>Pick your package</div>
                    </div>
                  )}
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {prods.length === 0 && (
                      <div style={{ border: `1px dashed ${BORDER}`, borderRadius: 11, padding: 16, fontSize: 12.5, color: TEXT_SEC, textAlign: "center" }}>
                        No packages picked yet. Choose at least one on the left.
                      </div>
                    )}
                    {prods.map((p) => (
                      <div key={p.id} style={{ border: `1px solid ${BORDER}`, borderRadius: 11, padding: 14, display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>{p.name}</div>
                          <div style={{ fontSize: 11.5, color: TEXT_SEC, marginTop: 2 }}>{p.service}</div>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, fontFamily: MONO }}>{money(p.price)}</div>
                          <div style={{ fontSize: 10.5, color: TEXT_SEC }}>{p.cadence}</div>
                        </div>
                        <button style={{ flexShrink: 0, padding: "8px 13px", borderRadius: 9, border: `1px solid ${TEAL}`, background: TEAL, color: "#fff", fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                          Buy
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Field wrappers ─────────────────────────────────────────────
const inputStyle = {
  width: "100%", boxSizing: "border-box", fontFamily: "inherit", fontSize: 13.5, color: TEXT,
  background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 9, padding: "10px 12px", outline: "none",
};

const Label = ({ children, hint }) => (
  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
    <span style={{ fontSize: 12.5, fontWeight: 700, color: TEXT }}>{children}</span>
    {hint && <span style={{ fontSize: 11.5, color: TEXT_SEC }}>{hint}</span>}
  </div>
);

// ── The form state, shared by create and edit so there is one builder ──
function usePageForm(initial) {
  const seed = initial || {};
  const [mode, setMode] = useState(seed.mode || null);
  const [name, setName] = useState(seed.name || "");
  const [headline, setHeadline] = useState(seed.headline || "");
  const [subhead, setSubhead] = useState(seed.subhead || "");
  const [imageId, setImageId] = useState(seed.imageId || "gym");
  const [upload, setUpload] = useState(null);
  const [questions, setQuestions] = useState((seed.questions || DEFAULT_QUESTIONS).map((q) => ({ ...q })));
  const [bonusId, setBonusId] = useState(seed.bonusId !== undefined ? seed.bonusId : "q4");
  const [picked, setPicked] = useState((seed.picked || ["t1", "t3"]).slice());
  const fileRef = useRef(null);

  useEffect(() => () => { if (upload && upload.src.startsWith("blob:")) URL.revokeObjectURL(upload.src); }, [upload]);

  const slug = slugify(name || headline || seed.slug || "new-page");
  const image = upload || IMAGES.find((i) => i.id === imageId) || null;
  const showForm = mode === "form" || mode === "both";
  const showProds = mode === "products" || mode === "both";
  const bonus = questions.find((q) => q.id === bonusId);

  const pickFile = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setUpload({ id: "upload", src: URL.createObjectURL(f), label: f.name });
  };
  const setQ = (id, patch) => setQuestions((qs) => qs.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  const addQ = () => {
    const id = `q${Date.now()}`;
    setQuestions((qs) => qs.concat([{ id, label: "", type: "Short text", locked: false }]));
  };
  const removeQ = (id) => {
    setQuestions((qs) => qs.filter((q) => q.id !== id));
    if (id === bonusId) setBonusId("");
  };
  const reset = (p) => {
    const s = p || {};
    setMode(s.mode || null);
    setName(s.name || "");
    setHeadline(s.headline || "");
    setSubhead(s.subhead || "");
    setImageId(s.imageId || "gym");
    setUpload(null);
    setQuestions((s.questions || DEFAULT_QUESTIONS).map((q) => ({ ...q })));
    setBonusId(s.bonusId !== undefined ? s.bonusId : "q4");
    setPicked((s.picked || ["t1", "t3"]).slice());
  };
  const values = () => ({
    mode, name: name.trim() || headline.trim(), slug, headline: headline.trim(), subhead: subhead.trim(),
    imageId, questions, bonusId, picked,
  });

  return {
    mode, setMode, name, setName, headline, setHeadline, subhead, setSubhead, imageId, setImageId,
    upload, setUpload, questions, setQuestions, bonusId, setBonusId, picked, setPicked, fileRef,
    slug, image, showForm, showProds, bonus, pickFile, setQ, addQ, removeQ, reset, values,
  };
}

// ── The editable fields, the one and only builder form ─────────
function BuilderFields({ form, tight }) {
  const { name, setName, headline, setHeadline, subhead, setSubhead, imageId, setImageId, upload, setUpload,
    questions, bonusId, setBonusId, picked, setPicked, fileRef, slug, showForm, showProds, bonus,
    pickFile, setQ, addQ, removeQ } = form;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
      <Card>
        <Eyebrow>The basics</Eyebrow>
        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <Label hint="Only you see this">Page name</Label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="12 week transformation" style={inputStyle} />
            <div style={{ fontSize: 11.5, color: TEXT_SEC, marginTop: 6, fontFamily: MONO }}>
              {SUBDOMAIN}/{slug}
            </div>
          </div>
          <div>
            <Label>Headline</Label>
            <input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="Get strong before October" style={inputStyle} />
          </div>
          <div>
            <Label hint="Optional">Subhead</Label>
            <textarea
              value={subhead}
              onChange={(e) => setSubhead(e.target.value)}
              rows={2}
              placeholder="Three mornings a week with a coach who knows your name."
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
            />
          </div>
        </div>
      </Card>

      <Card>
        <Eyebrow>Image</Eyebrow>
        <div style={{ fontSize: 12.5, color: TEXT_SEC, lineHeight: 1.55, margin: "8px 0 12px" }}>
          One image, at the top of the page. Your own photo of the gym beats anything stock.
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {IMAGES.map((im) => {
            const active = !upload && imageId === im.id;
            return (
              <button
                key={im.id}
                onClick={() => { setUpload(null); setImageId(im.id); }}
                aria-label={im.label}
                style={{
                  padding: 0, cursor: "pointer", borderRadius: 10, overflow: "hidden", lineHeight: 0,
                  border: `2px solid ${active ? TEAL : BORDER}`, background: WHITE,
                }}
              >
                <img src={im.src} alt={im.label} width={84} height={56} style={{ display: "block", objectFit: "cover" }} />
              </button>
            );
          })}
          <button
            onClick={() => fileRef.current && fileRef.current.click()}
            style={{
              width: 84, height: 60, borderRadius: 10, cursor: "pointer", fontFamily: "inherit",
              border: `1px dashed ${upload ? TEAL : "#c2d1cd"}`, background: upload ? TEAL_LIGHT : WHITE,
              color: upload ? TEAL : TEXT_SEC, fontSize: 11.5, fontWeight: 700,
              display: "inline-flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3,
            }}
          >
            <Icon d={I_PLUS} size={14} />
            {upload ? "Yours" : "Upload"}
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={pickFile} style={{ display: "none" }} />
        </div>
      </Card>

      {showForm && (
        <Card>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <Eyebrow>Questions</Eyebrow>
            <Btn sm onClick={addQ}><Icon d={I_PLUS} size={12.5} />Add question</Btn>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
            {questions.map((q) => {
              const isBonus = q.id === bonusId;
              return (
                <div
                  key={q.id}
                  style={{
                    border: `1px solid ${isBonus ? TEAL : BORDER}`,
                    background: isBonus ? TEAL_LIGHT : WHITE,
                    borderRadius: 11, padding: 12,
                    boxShadow: isBonus ? `0 0 0 3px rgba(43,122,120,0.07)` : "none",
                  }}
                >
                  {isBonus && (
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 9 }}>
                      <span style={{ color: TEAL, display: "inline-flex" }}><Icon d={I_STAR} size={13} /></span>
                      <Pill bg={TEAL} color="#fff">Bonus question</Pill>
                      <span style={{ fontSize: 11.5, color: TEAL, fontWeight: 600 }}>Milton ranks your queue on this answer</span>
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 9, alignItems: "flex-start", flexWrap: tight ? "wrap" : "nowrap" }}>
                    <input
                      value={q.label}
                      onChange={(e) => setQ(q.id, { label: e.target.value })}
                      placeholder="Ask something in their words"
                      style={{ ...inputStyle, flex: 1, minWidth: 160, background: WHITE }}
                    />
                    <select
                      value={q.type}
                      onChange={(e) => setQ(q.id, { type: e.target.value })}
                      style={{ ...inputStyle, width: tight ? "100%" : 124, flexShrink: 0, cursor: "pointer" }}
                    >
                      {["Short text", "Long text", "Email", "Phone", "Choice"].map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    {!q.locked && (
                      <button
                        onClick={() => removeQ(q.id)}
                        aria-label="Remove question"
                        title="Remove question"
                        style={{ width: 38, height: 38, flexShrink: 0, borderRadius: 9, border: `1px solid ${BORDER}`, background: WHITE, color: TEXT_SEC, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                      >
                        <Icon d={I_TRASH} size={13} />
                      </button>
                    )}
                  </div>
                  {!isBonus && (
                    <button
                      onClick={() => setBonusId(q.id)}
                      style={{
                        marginTop: 9, background: "none", border: "none", padding: 0, cursor: "pointer",
                        color: TEAL, fontFamily: "inherit", fontSize: 11.5, fontWeight: 700,
                        display: "inline-flex", alignItems: "center", gap: 5,
                      }}
                    >
                      <Icon d={I_STAR} size={12} />
                      Make this the bonus question
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginTop: 14, paddingTop: 14, borderTop: `1px solid ${BORDER}` }}>
            <MiltonMark size={20} />
            <div style={{ fontSize: 12.5, color: TEXT_SEC, lineHeight: 1.55 }}>
              {bonus
                ? <>Answers to <strong style={{ color: TEXT }}>{bonus.label || "your bonus question"}</strong> predict who buys better than anything else on the form. A long, specific answer moves someone to the top of your queue.</>
                : <>Nothing is marked as the bonus question. Pick the one that asks why they are really here, it is the strongest signal you will get.</>}
            </div>
          </div>
        </Card>
      )}

      {showProds && (
        <Card>
          <Eyebrow>Packages</Eyebrow>
          <div style={{ fontSize: 12.5, color: TEXT_SEC, lineHeight: 1.55, margin: "8px 0 12px" }}>
            Pulled from Milton billing, so prices and terms match what you actually charge.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {BILLING.map((b) => {
              const on = picked.indexOf(b.id) >= 0;
              return (
                <button
                  key={b.id}
                  onClick={() => setPicked((p) => (on ? p.filter((x) => x !== b.id) : p.concat([b.id])))}
                  style={{
                    display: "flex", alignItems: "center", gap: 11, textAlign: "left", cursor: "pointer", fontFamily: "inherit",
                    border: `1px solid ${on ? TEAL : BORDER}`, background: on ? TEAL_LIGHT : WHITE,
                    borderRadius: 10, padding: 12, width: "100%",
                  }}
                >
                  <span style={{
                    width: 18, height: 18, borderRadius: 5, flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center",
                    border: `1.5px solid ${on ? TEAL : "#c2d1cd"}`, background: on ? TEAL : WHITE, color: "#fff",
                  }}>
                    {on && <Icon d={I_CHECK} size={11} stroke={3} />}
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: "block", fontSize: 13, fontWeight: 700, color: TEXT }}>{b.name}</span>
                    <span style={{ display: "block", fontSize: 11.5, color: TEXT_SEC, marginTop: 2 }}>{b.service}</span>
                  </span>
                  <span style={{ textAlign: "right", flexShrink: 0 }}>
                    <span style={{ display: "block", fontSize: 13, fontWeight: 700, color: TEXT, fontFamily: MONO }}>{money(b.price)}</span>
                    <span style={{ display: "block", fontSize: 10.5, color: TEXT_SEC }}>{b.cadence}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

// ── Screen one, the list ────────────────────────────────────────
function PagesList({ pages, isMobile, width, onNew, onOpen, onOpenContacts }) {
  const totalLeads = pages.reduce((s, p) => s + p.leads, 0);
  const totalSales = pages.reduce((s, p) => s + p.sales, 0);
  // Below this the table cannot hold name, mode, url, results and three
  // actions without clipping, so each page becomes its own card.
  const wide = !isMobile && width >= 900;
  const compactActions = width < 1080;
  const cols = `minmax(150px,1.5fr) 116px minmax(120px,1.1fr) 132px ${compactActions ? "108px" : "212px"}`;

  const resultsButton = (p, block) => {
    const label =
      p.mode === "products" ? `${p.sales} sales, ${money(p.revenue)}`
      : p.mode === "form" ? `${p.leads} leads`
      : `${p.leads} leads, ${p.sales} sales`;
    const none = p.leads === 0 && p.sales === 0;
    return (
      <button
        onClick={(e) => { e.stopPropagation(); if (!none) onOpenContacts(p); }}
        disabled={none}
        title={none ? "No one yet" : "See the people this page brought in"}
        style={{
          display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "inherit", textAlign: "left",
          fontSize: 12.5, fontWeight: 700, color: none ? TEXT_SEC : TEAL, cursor: none ? "default" : "pointer",
          background: "none", border: "none", padding: 0, width: block ? "100%" : undefined,
        }}
      >
        {none ? <span style={{ color: TEXT_SEC, fontWeight: 600 }}>No one yet</span> : (
          <>
            <span>{label}</span>
            <span style={{ display: "inline-flex" }}><Icon d={I_USERS} size={12.5} /></span>
          </>
        )}
      </button>
    );
  };

  const titleButton = (p) => (
    <button
      onClick={() => onOpen(p)}
      style={{
        background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "inherit", textAlign: "left",
        fontSize: wide ? 13.5 : 14, fontWeight: 700, color: TEXT, display: "inline-flex", alignItems: "center", gap: 7,
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%",
      }}
    >
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
    </button>
  );

  if (pages.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Card style={{ padding: isMobile ? 26 : 46, textAlign: "center" }}>
          <div style={{ display: "inline-flex", marginBottom: 16 }}><MiltonMark size={34} /></div>
          <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: TEXT, letterSpacing: "-0.02em" }}>
            No pages yet
          </h3>
          <p style={{ margin: "10px auto 0", fontSize: 13.5, color: TEXT_SEC, lineHeight: 1.6, maxWidth: 430 }}>
            A page is how someone new reaches you. Fill in a few fields and Milton builds it on your brand,
            then hands you a link, a QR code for the gym floor, and a snippet for your website.
          </p>
          <div style={{ marginTop: 20, display: "flex", justifyContent: "center" }}>
            <Btn kind="primary" onClick={onNew}><Icon d={I_PLUS} size={14} />Create your first page</Btn>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Card style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <MiltonMark size={26} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, color: TEXT, lineHeight: 1.6 }}>
            Your {pages.length} pages have brought in {totalLeads} leads and {totalSales} sales.
            The front desk QR is quietly your third best source this month.
          </div>
        </div>
        {!isMobile && (
          <Btn kind="primary" onClick={onNew}><Icon d={I_PLUS} size={14} />New page</Btn>
        )}
      </Card>

      {isMobile && <Btn kind="primary" block onClick={onNew}><Icon d={I_PLUS} size={14} />New page</Btn>}

      <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: "hidden" }}>
        {wide && (
          <div style={{
            display: "grid", gridTemplateColumns: cols,
            gap: 12, padding: "10px 16px", borderBottom: `1px solid ${BORDER}`, background: INK_050,
          }}>
            {["Page", "What it does", "Live at", "Results", "Share it"].map((h) => (
              <div key={h} style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: TEXT_SEC }}>{h}</div>
            ))}
          </div>
        )}

        {pages.map((p, i) => {
          if (!wide) {
            return (
              <div key={p.id} style={{ padding: 14, borderTop: i === 0 ? "none" : `1px solid ${BORDER}`, display: "flex", flexDirection: "column", gap: 9 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                  {titleButton(p)}
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}><StatusPill published={p.published} /></div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <ModePill mode={p.mode} />
                  <span style={{ fontFamily: MONO, fontSize: 11.5, color: TEXT_SEC, wordBreak: "break-all" }}>{SUBDOMAIN}/{p.slug}</span>
                </div>
                {resultsButton(p, true)}
                <RowOutputs slug={p.slug} />
              </div>
            );
          }

          return (
            <div key={p.id} style={{
              display: "grid", gridTemplateColumns: cols,
              gap: 12, padding: "13px 16px", borderTop: i === 0 ? "none" : `1px solid ${BORDER}`, alignItems: "center",
            }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                  {titleButton(p)}
                  {!p.published && <StatusPill published={false} />}
                </div>
                <div style={{ fontSize: 11.5, color: TEXT_SEC, marginTop: 2 }}>Updated {p.updated}</div>
              </div>
              <div><ModePill mode={p.mode} /></div>
              <div style={{ fontFamily: MONO, fontSize: 11.5, color: TEXT_SEC, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {SUBDOMAIN}/{p.slug}
              </div>
              <div>{resultsButton(p)}</div>
              <div><RowOutputs slug={p.slug} compact={compactActions} /></div>
            </div>
          );
        })}
      </div>

      <div style={{ fontSize: 12, color: TEXT_SEC, lineHeight: 1.55 }}>
        Tap a page name to open it. Tap its results to see the people it brought in. Every page lives on your Milton subdomain.
      </div>
    </div>
  );
}

// ── Screen two, the builder, used to create a page ──────────────
function PageBuilder({ isMobile, width, onBack, onSave }) {
  const stacked = isMobile || width < 880;
  const tight = isMobile || width < 640;
  const modeCols = width < 640 ? "1fr" : "repeat(3, 1fr)";
  const form = usePageForm(null);
  const [saved, setSaved] = useState(false);
  const { mode, setMode, name, headline, slug } = form;

  // ── Step one, the mode. Chosen before anything else ──
  if (!mode) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <BackLink onClick={onBack}>All pages</BackLink>
        <div>
          <h3 style={{ margin: 0, fontSize: 21, fontWeight: 700, color: TEXT, letterSpacing: "-0.02em" }}>
            What is this page for?
          </h3>
          <p style={{ margin: "8px 0 0", fontSize: 13.5, color: TEXT_SEC, lineHeight: 1.6, maxWidth: 560 }}>
            Pick this first. Everything after it is a handful of fields, and Milton renders the finished page on your brand.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: modeCols, gap: 14, alignItems: "stretch" }}>
          {MODES.map((m) => (
            <button
              key={m.k}
              onClick={() => setMode(m.k)}
              style={{
                textAlign: "left", cursor: "pointer", fontFamily: "inherit", background: WHITE,
                border: `1px solid ${BORDER}`, borderRadius: 14, padding: 18,
                display: "flex", flexDirection: "column", gap: 9, height: "100%",
              }}
            >
              <ModePill mode={m.k} />
              <div style={{ fontSize: 15.5, fontWeight: 700, color: TEXT, letterSpacing: "-0.01em", marginTop: 2 }}>{m.label}</div>
              <div style={{ fontSize: 13, color: TEXT, lineHeight: 1.5, fontWeight: 600 }}>{m.line}</div>
              <div style={{ fontSize: 12.5, color: TEXT_SEC, lineHeight: 1.55 }}>{m.detail}</div>
              <div style={{ marginTop: "auto", paddingTop: 12, borderTop: `1px solid ${BORDER}`, fontSize: 11.5, color: TEXT_SEC, lineHeight: 1.5 }}>
                {m.examples}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── Saved, the three outputs ──
  if (saved) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <BackLink onClick={onBack}>All pages</BackLink>
        <div style={{ display: "flex", alignItems: "center", gap: 11, flexWrap: "wrap" }}>
          <span style={{ width: 30, height: 30, borderRadius: 999, background: GREEN_TINT, color: GREEN, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon d={I_CHECK} size={16} stroke={2.6} />
          </span>
          <div>
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: TEXT, letterSpacing: "-0.02em" }}>
              {name || headline} is live
            </h3>
            <div style={{ fontSize: 12.5, color: TEXT_SEC, marginTop: 3 }}>
              {modeOf(mode).label}. New answers land in your Leads queue.
            </div>
          </div>
        </div>

        <OutputsPanel slug={slug} isMobile={tight} />

        <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
          <Btn kind="primary" onClick={onBack}>Done</Btn>
          <Btn onClick={() => setSaved(false)}>Keep editing</Btn>
        </div>
      </div>
    );
  }

  // ── The builder, form left and preview right ──
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <BackLink onClick={onBack}>All pages</BackLink>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <h3 style={{ margin: 0, fontSize: 21, fontWeight: 700, color: TEXT, letterSpacing: "-0.02em" }}>New page</h3>
          <ModePill mode={mode} />
          <button
            onClick={() => setMode(null)}
            style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: TEAL, fontFamily: "inherit", fontSize: 12.5, fontWeight: 700 }}
          >
            Change
          </button>
        </div>
        <Btn kind="primary" disabled={!headline.trim() || !name.trim()} onClick={() => { setSaved(true); onSave(form.values()); }}>
          Save and publish
        </Btn>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: stacked ? "minmax(0,1fr)" : "minmax(0,1fr) minmax(0,400px)", gap: 20, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
          <BuilderFields form={form} tight={tight} />
          <Card style={{ background: INK_050 }}>
            <div style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
              <span style={{ color: TEAL, display: "inline-flex", marginTop: 2 }}><Icon d={I_QR} size={17} /></span>
              <div style={{ fontSize: 12.5, color: TEXT_SEC, lineHeight: 1.6 }}>
                When you save, you get three things without asking: a link on your Milton subdomain,
                a QR code ready to print, and a snippet for your own website.
              </div>
            </div>
          </Card>
        </div>

        <Preview
          mode={form.mode}
          headline={form.headline}
          subhead={form.subhead}
          image={form.image}
          questions={form.questions}
          bonusId={form.bonusId}
          picked={form.picked}
          slug={form.slug}
          isMobile={stacked}
        />
      </div>
    </div>
  );
}

// ── A read-only summary of the page, shown in the detail view ──
function DetailSummary({ page, form, onOpenContacts }) {
  const { showForm, showProds, questions, bonusId, picked, image } = form;
  const prods = BILLING.filter((b) => picked.indexOf(b.id) >= 0);
  const stat = (label, value) => (
    <div>
      <div style={{ fontSize: 20, fontWeight: 700, color: TEXT, fontFamily: MONO, letterSpacing: "-0.01em" }}>{value}</div>
      <div style={{ fontSize: 11.5, color: TEXT_SEC, marginTop: 2 }}>{label}</div>
    </div>
  );
  const field = (label, value) => (
    <div>
      <Eyebrow>{label}</Eyebrow>
      <div style={{ fontSize: 13.5, color: value ? TEXT : TEXT_SEC, lineHeight: 1.5, marginTop: 6 }}>{value || "Not set"}</div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
      <Card>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 14 }}>
          <Eyebrow>Results</Eyebrow>
          <ModePill mode={page.mode} />
        </div>
        <div style={{ display: "flex", gap: 26, flexWrap: "wrap" }}>
          {(page.mode === "form" || page.mode === "both") && stat("Leads", page.leads)}
          {(page.mode === "products" || page.mode === "both") && stat("Sales", page.sales)}
          {(page.mode === "products" || page.mode === "both") && stat("Revenue", money(page.revenue))}
        </div>
        {(page.leads > 0 || page.sales > 0) && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${BORDER}` }}>
            <Btn sm onClick={() => onOpenContacts(page)}>
              <Icon d={I_USERS} size={13} />
              See the people this page brought in
              <Icon d={I_ARROW} size={13} />
            </Btn>
          </div>
        )}
      </Card>

      <Card>
        <Eyebrow>The basics</Eyebrow>
        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <Eyebrow>Live at</Eyebrow>
            <div style={{ fontSize: 12.5, color: TEXT, fontFamily: MONO, marginTop: 6, wordBreak: "break-all" }}>{urlFor(page.slug)}</div>
          </div>
          {field("Headline", page.headline)}
          {field("Subhead", page.subhead)}
          {image && (
            <div>
              <Eyebrow>Image</Eyebrow>
              <img src={image.src} alt={image.label || ""} style={{ display: "block", width: "100%", maxWidth: 260, height: 120, objectFit: "cover", borderRadius: 10, border: `1px solid ${BORDER}`, marginTop: 8 }} />
            </div>
          )}
        </div>
      </Card>

      {showForm && (
        <Card>
          <Eyebrow>Questions</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
            {questions.map((q) => (
              <div key={q.id} style={{ display: "flex", alignItems: "center", gap: 9, justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: TEXT, display: "inline-flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                  {q.id === bonusId && <span style={{ color: TEAL, display: "inline-flex", flexShrink: 0 }}><Icon d={I_STAR} size={12} /></span>}
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{q.label || "Untitled question"}</span>
                </span>
                <Pill bg={INK_050} color={TEXT_SEC} outline>{q.type}</Pill>
              </div>
            ))}
          </div>
        </Card>
      )}

      {showProds && (
        <Card>
          <Eyebrow>Packages</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
            {prods.length === 0 && <div style={{ fontSize: 12.5, color: TEXT_SEC }}>No packages on this page yet.</div>}
            {prods.map((b) => (
              <div key={b.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <span style={{ fontSize: 13, color: TEXT, fontWeight: 600 }}>{b.name}</span>
                <span style={{ fontSize: 12.5, color: TEXT, fontFamily: MONO }}>{money(b.price)} <span style={{ color: TEXT_SEC }}>{b.cadence}</span></span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// ── Screen three, the page detail. Same builder, opened on a page ──
function PageDetail({ page, isMobile, width, onBack, onUpdate, onDuplicate, onDelete, onTogglePublish, onOpenContacts }) {
  const stacked = isMobile || width < 880;
  const tight = isMobile || width < 640;
  const form = usePageForm(page);
  const [editing, setEditing] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  const done = () => { onUpdate(page.id, form.values()); setEditing(false); };
  const cancel = () => { form.reset(page); setEditing(false); };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <BackLink onClick={onBack}>All pages</BackLink>

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <h3 style={{ margin: 0, fontSize: 21, fontWeight: 700, color: TEXT, letterSpacing: "-0.02em" }}>{editing ? (form.name || "Untitled page") : page.name}</h3>
            <ModePill mode={page.mode} />
            <StatusPill published={page.published} />
          </div>
          <div style={{ fontSize: 12.5, color: TEXT_SEC, marginTop: 5, fontFamily: MONO }}>{urlFor(page.slug)}</div>
        </div>
      </div>

      {/* Action row, above the preview */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", padding: 10, background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 12 }}>
        <Btn kind="primary" disabled={!page.published} title={page.published ? "Open the live page" : "Publish first to open it"} onClick={() => openLive(page.slug)}>
          <Icon d={I_EXT} size={14} />Open live page
        </Btn>
        {editing ? (
          <>
            <Btn kind="primary" onClick={done}><Icon d={I_CHECK} size={14} />Done</Btn>
            <Btn onClick={cancel}>Cancel</Btn>
          </>
        ) : (
          <Btn kind="primary" onClick={() => setEditing(true)}><Icon d={I_PENCIL} size={14} />Edit</Btn>
        )}
        <Btn onClick={() => onDuplicate(page)}><Icon d={I_COPY} size={14} />Duplicate</Btn>
        <Btn onClick={() => onTogglePublish(page.id)}>
          <Icon d={page.published ? I_EYE_OFF : I_EYE} size={14} />{page.published ? "Unpublish" : "Publish"}
        </Btn>
        <div style={{ marginLeft: "auto" }}>
          <Btn kind="quiet" danger onClick={() => setConfirmDel(true)}><Icon d={I_TRASH} size={14} />Delete</Btn>
        </div>
      </div>

      {confirmDel && (
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", padding: 14, background: "#fbf1ef", border: `1px solid #e7c9c3`, borderRadius: 12 }}>
          <div style={{ flex: 1, minWidth: 200, fontSize: 13, color: TEXT, lineHeight: 1.5 }}>
            Delete <strong>{page.name}</strong>? The link, QR code, and embed stop working straight away. This cannot be undone.
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn onClick={() => setConfirmDel(false)}>Keep it</Btn>
            <button
              onClick={() => onDelete(page.id)}
              style={{ borderRadius: 10, cursor: "pointer", fontWeight: 700, fontFamily: "inherit", fontSize: 13.5, padding: "10px 16px", background: QUIET_RED, color: "#fff", border: `1px solid ${QUIET_RED}`, display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <Icon d={I_TRASH} size={14} />Delete page
            </button>
          </div>
        </div>
      )}

      {editing && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: TEAL, fontWeight: 600 }}>
          <MiltonMark size={18} />
          Editing. Every change shows in the preview as you make it. Press Done to publish it.
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: stacked ? "minmax(0,1fr)" : "minmax(0,1fr) minmax(0,400px)", gap: 20, alignItems: "start" }}>
        {editing
          ? <BuilderFields form={form} tight={tight} />
          : <DetailSummary page={page} form={form} onOpenContacts={onOpenContacts} />}

        <Preview
          mode={form.mode}
          headline={form.headline}
          subhead={form.subhead}
          image={form.image}
          questions={form.questions}
          bonusId={form.bonusId}
          picked={form.picked}
          slug={editing ? form.slug : page.slug}
          isMobile={stacked}
        />
      </div>

      <OutputsPanel
        slug={page.slug}
        isMobile={tight}
        heading="Grab and go"
        note="The same link, QR code, and embed shown on the list. They are here too, so you never have to leave the page to share it."
      />
    </div>
  );
}

// ── Section shell ───────────────────────────────────────────────
export default function PagesSection({ isMobile, onOpenContacts }) {
  const [view, setView] = useState("list");
  const [activeId, setActiveId] = useState(null);
  const [pages, setPages] = useState(SEED_PAGES);
  const [ref, width] = useContainerWidth();

  const openContacts = onOpenContacts || (() => {});
  const active = pages.find((p) => p.id === activeId) || null;

  const addPage = (content) => {
    const id = `p${Date.now()}`;
    setPages((ps) => [{
      id, leads: 0, sales: 0, revenue: 0, updated: "just now", published: true, ...content,
    }].concat(ps));
  };
  const openPage = (p) => { setActiveId(p.id); setView("detail"); };
  const updatePage = (id, patch) => setPages((ps) => ps.map((p) => (p.id === id ? { ...p, ...patch, updated: "just now" } : p)));
  const duplicatePage = (p) => {
    const id = `p${Date.now()}`;
    const name = `${p.name} copy`;
    setPages((ps) => [{ ...p, id, name, slug: slugify(name), leads: 0, sales: 0, revenue: 0, updated: "just now", published: false }].concat(ps));
    setActiveId(id);
    setView("detail");
  };
  const deletePage = (id) => {
    setPages((ps) => ps.filter((p) => p.id !== id));
    setActiveId(null);
    setView("list");
  };
  const togglePublish = (id) => setPages((ps) => ps.map((p) => (p.id === id ? { ...p, published: !p.published, updated: "just now" } : p)));

  // width is 0 on the very first paint, before the observer reports. Render
  // the roomy layout then so nothing flashes into a stacked state and back.
  const w = width || 1000;

  return (
    <div ref={ref}>
      {view === "builder" && (
        <PageBuilder isMobile={isMobile} width={w} onBack={() => setView("list")} onSave={addPage} />
      )}
      {view === "detail" && active && (
        <PageDetail
          key={active.id}
          page={active}
          isMobile={isMobile}
          width={w}
          onBack={() => setView("list")}
          onUpdate={updatePage}
          onDuplicate={duplicatePage}
          onDelete={deletePage}
          onTogglePublish={togglePublish}
          onOpenContacts={openContacts}
        />
      )}
      {(view === "list" || (view === "detail" && !active)) && (
        <PagesList
          pages={pages}
          isMobile={isMobile}
          width={w}
          onNew={() => setView("builder")}
          onOpen={openPage}
          onOpenContacts={openContacts}
        />
      )}
    </div>
  );
}
