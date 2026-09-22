import React, { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { HoursBadge, HoursCard, HoursEditor, HoursSourcePicker, ServiceMark, WeekHoursEditor } from "./ScheduleHours";
import MiltonSchedule from "./MiltonSchedule";
import { buildBookingDates, coachLabel, copyWeek, createWeek, dateLabel, hoursError, serviceMeta } from "./scheduleAvailability";

/* ---------- sharing the booking page beyond the app ---------- */
const MONO = "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace";
const BOOKING_SUBDOMAIN = "ridgeline.milton.site";
const bookingUrlFor = (serviceId) =>
  serviceId && serviceId !== "all" ? `https://${BOOKING_SUBDOMAIN}/book?service=${serviceId}` : `https://${BOOKING_SUBDOMAIN}/book`;
const bookingEmbedFor = (serviceId) =>
  `<div id="milton-booking"></div>
<script
  src="https://embed.milton.site/v1.js"
  data-page="book"${serviceId && serviceId !== "all" ? `\n  data-service="${serviceId}"` : ""}
  data-height="auto"
  async
></script>`;

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

async function downloadBookingQr(url, filename) {
  try {
    const data = await QRCode.toDataURL(url, { width: 1024, margin: 2, color: { dark: "#0E5D70ff", light: "#ffffffff" } });
    const a = document.createElement("a");
    a.href = data;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (e) { /* nothing useful to show the coach if the canvas is blocked */ }
}

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

const AVATAR_PALETTE = ["#E87560", "#8B5CF6", "#3F88F2", "#3FA053", "#176B7C", "#E89C3A"];
const PROVIDERS = [
  { name: "Google Calendar", sub: "Google Workspace or Gmail", letter: "G", color: "#3F88F2" },
  { name: "Outlook", sub: "Microsoft 365", letter: "O", color: "#8B5CF6" },
  { name: "Apple Calendar", sub: "iCloud", letter: "A", color: "#3F4A4E" },
];

/* ---------- helpers ---------- */
const initials = (n) => n.split(" ").map((w) => w[0]).join("").slice(0, 2);

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
const Icon = ({ d, size = 14, stroke = 2.2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">{d}</svg>
);
const I_LINK = <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></>;
const I_QR = <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3h-3zM19 19h2M19 14h2v2" /></>;
const I_CODE = <><path d="m9 18-6-6 6-6" /><path d="m15 6 6 6-6 6" /></>;
const I_CHECK = <path d="M20 6 9 17l-5-5" />;
const I_EXT = <><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" /></>;
const I_SHARE = <><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 10.5 6.8-3.9" /><path d="m8.6 13.5 6.8 3.9" /></>;

/* ---------- QR image, generated live from the hosted booking link ---------- */
function BookingQrImg({ url, size = 92 }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    let alive = true;
    QRCode.toDataURL(url, { width: size * 2, margin: 1, color: { dark: "#0E5D70ff", light: "#ffffffff" } })
      .then((u) => { if (alive) setSrc(u); })
      .catch(() => {});
    return () => { alive = false; };
  }, [url, size]);
  if (!src) return <div style={{ width: size, height: size, borderRadius: 10, background: INK050, border: `1px solid ${INK200}`, flex: "none" }} />;
  return <img src={src} width={size} height={size} alt="QR code linking to the booking page" style={{ display: "block", borderRadius: 10, border: `1px solid ${INK200}`, flex: "none" }} />;
}

/* ---------- the three ways to share the booking page beyond the app ---------- */
function BookingShareOutputs({ url, embed }) {
  const [copied, setCopied] = useState(null);
  const timer = useRef(null);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const flash = (key) => {
    setCopied(key);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(null), 1800);
  };
  const doCopy = (key, text) => async () => {
    await writeClipboard(text);
    flash(key);
  };
  const shareBtn = (key, label, iconOn, iconOff, onClick) => (
    <button style={{ ...btn(copied === key ? "primary" : "secondary"), fontSize: 12.5, padding: "7px 12px", display: "inline-flex", alignItems: "center", gap: 6 }} onClick={onClick}>
      <Icon d={copied === key ? iconOn : iconOff} size={13} />{copied === key ? "Copied" : label}
    </button>
  );

  return (
    <div style={{ display: "flex", flexShrink: 0, flexDirection: "column", border: `1px solid ${INK200}`, borderRadius: 14, overflow: "hidden" }}>
      {/* Hosted link */}
      <div style={{ padding: 16, borderBottom: `1px solid ${B_SUB}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ color: TEAL_800, display: "inline-flex" }}><Icon d={I_LINK} size={15} /></span>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: FG1 }}>Booking link</span>
        </div>
        <div style={{ fontFamily: MONO, fontSize: 12, color: FG1, background: INK050, border: `1px solid ${INK200}`, borderRadius: 9, padding: "9px 11px", wordBreak: "break-all", lineHeight: 1.5 }}>{url}</div>
        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          {shareBtn("link", "Copy link", I_CHECK, I_LINK, doCopy("link", url))}
          <button style={{ ...btn("secondary"), fontSize: 12.5, padding: "7px 12px", display: "inline-flex", alignItems: "center", gap: 6 }} onClick={() => window.open(url, "_blank", "noopener,noreferrer")}>
            <Icon d={I_EXT} size={13} />Open
          </button>
        </div>
      </div>

      {/* QR code */}
      <div style={{ padding: 16, borderBottom: `1px solid ${B_SUB}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ color: TEAL_800, display: "inline-flex" }}><Icon d={I_QR} size={15} /></span>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: FG1 }}>QR code</span>
        </div>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          <BookingQrImg url={url} />
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 12.5, color: FG3, lineHeight: 1.55, margin: 0, textWrap: "pretty" }}>Print it for the front desk, a window sign, or a class flyer.</p>
            <div style={{ marginTop: 10 }}>
              <button style={{ ...btn("secondary"), fontSize: 12.5, padding: "7px 12px", display: "inline-flex", alignItems: "center", gap: 6 }} onClick={() => downloadBookingQr(url, "booking-qr.png")}>
                <Icon d={I_QR} size={13} />Download PNG
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Embed snippet */}
      <div style={{ padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, justifyContent: "space-between", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: TEAL_800, display: "inline-flex" }}><Icon d={I_CODE} size={15} /></span>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: FG1 }}>Embed on your website</span>
          </div>
          {shareBtn("embed", "Copy snippet", I_CHECK, I_CODE, doCopy("embed", embed))}
        </div>
        <p style={{ fontSize: 12.5, color: FG3, lineHeight: 1.55, margin: "6px 0 10px", textWrap: "pretty" }}>
          Paste this once, anywhere on your site. It keeps your own header and footer, and it stays in sync when you change hours, coaches, or services.
        </p>
        <pre style={{ margin: 0, fontFamily: MONO, fontSize: 11.5, lineHeight: 1.65, color: "#DCEDEC", background: "#0B2A30", borderRadius: 10, padding: "13px 15px", overflowX: "auto", whiteSpace: "pre" }}>{embed}</pre>
      </div>
    </div>
  );
}

/* ---------- card ---------- */
function Card({ children, style }) {
  return <section style={{ background: WHITE, border: `1px solid ${B_SUB}`, borderRadius: 16, boxShadow: SHADOW_CARD, overflow: "hidden", ...style }}>{children}</section>;
}

/* ---------- modal shell ---------- */
function Modal({ width = 480, label = "Scheduling settings", onClose, children }) {
  const dialog = useRef(null);
  useEffect(() => {
    const previousFocus = document.activeElement;
    dialog.current?.focus();
    return () => { if (previousFocus?.isConnected) previousFocus.focus(); };
  }, []);
  useEffect(() => {
    if (!dialog.current?.contains(document.activeElement)) dialog.current?.focus();
  });

  function handleKeyDown(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      onClose();
    }
    if (event.key !== "Tab") return;
    const controls = [...dialog.current.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]')].filter((element) => element.getClientRects().length && (element.type !== "radio" || element.checked));
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (!first) { event.preventDefault(); return; }
    if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog.current)) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(11,20,23,.42)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div ref={dialog} className="schedule-modal" role="dialog" aria-modal="true" aria-label={label} tabIndex={-1} onKeyDown={handleKeyDown} onClick={(event) => event.stopPropagation()} style={{ width: "100%", maxWidth: width, maxHeight: "92%", overflow: "auto", background: WHITE, borderRadius: 24, boxShadow: SHADOW_XL, display: "flex", flexDirection: "column", gap: 18 }}>
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
    { id: "miguel", name: "Miguel Ortega", provider: "Google Calendar", hours: null },
    { id: "joe", name: "Joe Fields", provider: "Outlook", hours: null },
  ]);
  const [hours, setHours] = useState(() => createWeek());
  const [services, setServices] = useState(() => [
    { id: "personal-training", name: "Personal Training", dur: 60, kind: "individual", cap: 1, staff: "miguel", hours: null },
    { id: "assessment", name: "Initial Assessment", dur: 30, kind: "individual", cap: 1, staff: "miguel", hours: null },
    { id: "strength", name: "Strength Class", dur: 60, kind: "group", cap: 12, staff: "joe", hours: createWeek([0, 2, 4], "6:00 AM", "7:00 AM") },
    { id: "recovery", name: "Recovery Room", dur: 30, kind: "space", cap: 1, staff: "none", hours: createWeek([0, 1, 2, 3, 4, 5], "9:00 AM", "5:00 PM").map((day, i) => i === 5 ? { ...day, end: "1:00 PM" } : day) },
  ]);

  const [modal, setModal] = useState(null);
  const [connectName, setConnectName] = useState("");
  const [hoursTarget, setHoursTarget] = useState(null);
  const [form, setForm] = useState(() => ({ name: "", dur: 60, kind: "individual", cap: 12, staff: "miguel", hoursMode: "business", hours: copyWeek(hours) }));
  const [booking, setBooking] = useState({ step: 0, service: null, date: null, time: null });
  const [shareService, setShareService] = useState("all");
  const [toast, setToast] = useState("");
  const toastTimer = useRef(null);
  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const flash = (msg) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 2600);
  };
  const close = () => setModal(null);
  const setF = (patch) => setForm((f) => ({ ...f, ...patch }));
  const bookingDates = buildBookingDates(booking.service, hours, calendars);
  const formError = form.hoursMode === "custom" ? hoursError(form.hours) : "";
  const shareUrl = bookingUrlFor(shareService);
  const shareEmbed = bookingEmbedFor(shareService);

  const openHours = (scope, entry) => {
    setHoursTarget({ ...entry, scope });
    setModal("hours");
  };

  const pickProvider = (p) => {
    const name = connectName.trim() || "New coach";
    setCalendars((prev) => [...prev, { id: crypto.randomUUID(), name, provider: p.name, hours: null }]);
    close();
    flash(`${name}'s ${p.name} is connected`);
  };

  const saveHours = (nextHours) => {
    if (nextHours && hoursError(nextHours)) return;
    if (hoursTarget.scope === "business") setHours(nextHours);
    else if (hoursTarget.scope === "team") setCalendars((prev) => prev.map((coach) => coach.id === hoursTarget.id ? { ...coach, hours: nextHours } : coach));
    else setServices((prev) => prev.map((service) => service.id === hoursTarget.id ? { ...service, hours: nextHours } : service));
    close();
    flash(hoursTarget.scope === "business" ? "Business hours updated. Custom schedules stay unchanged." : `${hoursTarget.name} ${nextHours ? "hours updated" : "now follows business hours"}`);
  };

  const saveService = () => {
    const name = form.name.trim();
    if (!name || formError) return;
    if (services.some((service) => service.name.toLowerCase() === name.toLowerCase())) {
      flash("A service with that name already exists.");
      return;
    }
    const { hoursMode, ...details } = form;
    setServices((prev) => [...prev, { ...details, id: crypto.randomUUID(), name, hours: hoursMode === "custom" ? copyWeek(form.hours) : null, cap: form.kind === "group" ? form.cap : 1 }]);
    close();
    flash(`${name} is now bookable`);
  };

  const PAD = narrow ? 16 : 24;

  return (
    <div className="schedule-canvas" style={{ display: "flex", flexDirection: "column", height: "100%", background: BG_APP, position: "relative", overflow: "hidden", fontFamily: "inherit", color: FG1 }}>
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: `14px ${PAD}px`, position: "relative" }}>
        <div style={{ flex: 1 }} />
        <button onClick={() => { setBooking({ step: 0, service: null, date: null, time: null }); setModal("book"); }} style={{ ...btn("secondary"), fontSize: 12.5, padding: "8px 14px" }}>
          Preview member booking
        </button>
        <button onClick={() => { setShareService("all"); setModal("share"); }} style={{ ...btn("brandGhost"), fontSize: 12.5, padding: "8px 14px" }}>
          <Icon d={I_SHARE} size={14} />Share &amp; embed
        </button>
        {onClose && (
          <button onClick={onClose} aria-label="Close" style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${B_SOFT}`, background: WHITE, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: FG3 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        )}
      </div>

      {/* body */}
      <div style={{ flex: 1, overflowY: "auto", padding: `4px ${PAD}px 40px` }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: narrow ? 760 : 960, width: "100%", margin: "0 auto" }}>
          {/* intro */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "8px 4px 0" }}>
            <h1 style={{ fontSize: narrow ? 26 : 30, fontWeight: 700, letterSpacing: "-.02em", lineHeight: 1.1, margin: 0 }}>Schedule</h1>
            <p style={{ fontSize: 15, color: FG3, margin: 0, textWrap: "pretty" }}>
              Connect calendars, set your hours, and choose what members can book. Milton handles the rest.
            </p>
          </div>

          {/* Interactive scheduler */}
          <MiltonSchedule height={narrow ? "calc(100dvh - 160px)" : "calc(100dvh - 120px)"} />

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
          <HoursCard businessHours={hours} onEdit={openHours} />

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
            {services.map((service) => (
              <button type="button" key={service.id} className="schedule-service-row" aria-label={`Set hours for ${service.name}`} onClick={() => openHours("service", service)}>
                <ServiceMark kind={service.kind} />
                <span className="schedule-service-copy">
                  <span className="schedule-service-name">{service.name}</span>
                  <span className="schedule-service-meta">{serviceMeta(service, calendars)}</span>
                </span>
                <HoursBadge custom={service.hours != null} />
                <Chevron />
              </button>
            ))}
            <div style={{ padding: "12px 24px 18px", borderTop: `1px solid ${B_SUB}` }}>
              <button style={btn("brandGhost")} onClick={() => { setForm({ name: "", dur: 60, kind: "individual", cap: 12, staff: calendars[0]?.id || "none", hoursMode: "business", hours: copyWeek(hours) }); setModal("service"); }}><PlusIcon />Add Service or Class</button>
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
      {modal === "hours" && hoursTarget && (
        <Modal width={540} label={hoursTarget.scope === "business" ? "Edit business hours" : `Edit ${hoursTarget.name} hours`} onClose={close}>
          <HoursEditor key={`${hoursTarget.scope}-${hoursTarget.id || "business"}`} target={hoursTarget} businessHours={hours} customHours={hoursTarget.scope === "business" ? hours : hoursTarget.hours} onSave={saveHours} onCancel={close} />
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
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={fieldLabel}>Type</span>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {[["individual", "Individual"], ["group", "Group"], ["space", "Space"]].map(([kind, label]) => <button key={kind} aria-pressed={form.kind === kind} style={chip(form.kind === kind)} onClick={() => setF({ kind, ...(kind === "space" ? { staff: "none" } : {}) })}>{label}</button>)}
              </div>
            </div>
            {form.kind === "group" && (
              <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={fieldLabel}>Spots</span>
                <input style={inputStyle} type="number" min="1" max="100" value={form.cap} onChange={(event) => setF({ cap: Math.min(100, Math.max(1, Math.trunc(+event.target.value) || 1)) })} />
              </label>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={fieldLabel}>Coach</span>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {[...calendars, { id: "any", name: "Any coach" }, { id: "none", name: "No coach needed" }].map((coach) => <button key={coach.id} aria-pressed={form.staff === coach.id} style={chip(form.staff === coach.id)} onClick={() => setF({ staff: coach.id })}>{coach.name}</button>)}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={fieldLabel}>Hours</span>
            <HoursSourcePicker value={form.hoursMode} onChange={(hoursMode) => setF({ hoursMode })} />
            {form.hoursMode === "custom" && <WeekHoursEditor value={form.hours} onChange={(nextHours) => setF({ hours: nextHours })} />}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 4 }}>
            <button style={btn("ghost")} onClick={close}>Cancel</button>
            <button style={{ ...btn("primary"), ...(!form.name.trim() || formError ? { opacity: 0.45, cursor: "not-allowed" } : {}) }} disabled={!form.name.trim() || !!formError} onClick={saveService}>Publish</button>
          </div>
        </Modal>
      )}

      {/* ---------- Share & embed modal ---------- */}
      {modal === "share" && (
        <Modal width={560} label="Share your booking page" onClose={close}>
          <ModalTitle title="Share your booking page" sub="Send the link, print the QR code, or embed it on your own website. Every booking still lands on the connected calendars above." />
          {services.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={fieldLabel}>What should it show?</span>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <button style={chip(shareService === "all")} onClick={() => setShareService("all")}>All services</button>
                {services.map((service) => (
                  <button key={service.id} style={chip(shareService === service.id)} onClick={() => setShareService(service.id)}>{service.name}</button>
                ))}
              </div>
            </div>
          )}
          <BookingShareOutputs url={shareUrl} embed={shareEmbed} />
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button style={btn("ghost")} onClick={close}>Done</button>
          </div>
        </Modal>
      )}

      {/* ---------- Member booking preview modal ---------- */}
      {modal === "book" && (
        <Modal width={520} label="Member booking preview" onClose={close}>
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
                {services.map((service) => (
                  <button key={service.id} onClick={() => setBooking({ step: 1, service, date: null, time: null })} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 14, border: `1px solid ${INK200}`, background: WHITE, cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>
                    <ServiceMark kind={service.kind} />
                    <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: 15, fontWeight: 600, color: FG1 }}>{service.name}</span>
                      <span className="schedule-service-meta">{serviceMeta(service, calendars)}</span>
                    </span>
                    <Chevron />
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Step 1 — pick a date */}
          {booking.step === 1 && booking.service && (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <h2 style={{ fontSize: 23, fontWeight: 600, letterSpacing: "-.01em", margin: 0 }}>Pick a date</h2>
                <span className="schedule-service-meta">{booking.service.name} · {booking.service.dur} min · {coachLabel(booking.service, calendars)}</span>
              </div>
              {bookingDates.length === 0 && <div className="booking-empty">No dates are available for this service with the current hours. Choose another service or adjust its schedule.</div>}
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
                {booking.date.slots.map((t) => {
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
                  ...(booking.service.staff === "none" ? [] : [["Coach", coachLabel(booking.service, calendars)]]),
                  ["Type", booking.service.kind === "space" ? "Self-guided space booking" : booking.service.kind === "group" ? `Group class · ${booking.service.cap} spots` : "Individual session"],
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
                <p style={{ fontSize: 15, color: FG2, margin: 0, textWrap: "pretty" }}>{`${booking.service.name} on ${dateLabel(booking.date)} at ${booking.time}${booking.service.staff === "none" ? "" : ` with ${coachLabel(booking.service, calendars)}`}.`}</p>
                <p className="schedule-service-meta">Demo only. No booking or reminder is sent.</p>
              </div>
              <button style={{ ...btn("primary"), width: "100%", padding: "12px 18px", fontSize: 15 }} onClick={close}>Done</button>
            </>
          )}
        </Modal>
      )}

      {/* toast */}
      {toast && (
        <div role="status" style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", background: FG1, color: WHITE, fontSize: 14, fontWeight: 500, padding: "10px 18px", borderRadius: 999, zIndex: 60, boxShadow: "0 4px 16px rgba(11,20,23,.22)", maxWidth: "88%", textAlign: "center" }}>
          {toast}
        </div>
      )}
    </div>
  );
}
