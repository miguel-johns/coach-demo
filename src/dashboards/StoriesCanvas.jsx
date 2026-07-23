import { useState, useEffect, useCallback } from "react";

/* ────────────────────────────────────────────────────────────
 * Progress Stories — coach-facing surface where Milton turns
 * logged client data into shareable, Instagram-style story cards.
 *
 * Views:
 *   home     → queue (Ready / Scheduled / Sent) + New story
 *   review   → client-facing preview strip + About/Share rail
 *   player   → full-screen story player (tap to advance)
 *   formats  → card-format explorations + palette recolor
 * ──────────────────────────────────────────────────────────── */

const FONT = "'Lexend', 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif";

// Chrome palette — matches the Milton app tokens
const C = {
  bg: "#f3f6f4",
  wash: "#f7faf9",
  white: "#ffffff",
  text: "#1a2e2a",
  sub: "#5f7a76",
  faint: "#9fb0ac",
  border: "#e0ebe8",
  borderSoft: "#eef4f1",
  teal: "#2B7A78",
  tealDeep: "#0E5D70",
  tealBg: "#e8f5f3",
  green: "#2f9e44",
  greenBg: "#e2f3df",
  greenFg: "#2d7d3e",
  violet: "#8B5CF6",
  violetBg: "#ede4fe",
  violetFg: "#6a3fd7",
  info: "#1f5ba8",
  infoBg: "#dce8f9",
  amber: "#9a6409",
  amberBg: "#fdeecc",
  dark: "#0f1a1c",
};

// Palettes for the format explorer — recolors the story-card accent
const PALETTES = {
  Milton: { accent: "#6ECB74", card: "#0f1a1c", quote: "#2B7A78" },
  Violet: { accent: "#b79bff", card: "#171225", quote: "#6a3fd7" },
  Amber: { accent: "#f4c04e", card: "#1e1710", quote: "#b5791a" },
  Ocean: { accent: "#5bc7d6", card: "#0a1a20", quote: "#0E5D70" },
};

/* ── Story data — assembled by Milton from logged data ── */
const sarahCards = [
  { kind: "cover", eyebrow: "MILTON WRAPPED", big: "12", unit: "weeks of showing up", sub: "Mar 30 – Jul 20 · Sarah Chen" },
  { kind: "stat", eyebrow: "STRENGTH", heading: "The squat moved", big: "+40 lb", sub: "Back squat 95 → 135 lb", bars: [42, 52, 58, 66, 74, 84, 100], footer: "+42% in 12 weeks · every set logged" },
  { kind: "grid", eyebrow: "CONSISTENCY", heading: "She kept showing up", big: "34", sub: "of 36 sessions · 94% attendance", total: 36, filled: 34, footer: "Longest streak: 8 straight weeks" },
  { kind: "stat", eyebrow: "EFFORT", heading: "Every rep counted", big: "847", sub: "sets logged across the block", bars: [30, 44, 52, 60, 70, 82, 95], footer: "84 nutrition days · 2 assessments" },
  { kind: "beforeafter", eyebrow: "DAY 1 → TODAY", rows: [
    { label: "Bodyweight", from: "167", to: "153", delta: "−14 lb" },
    { label: "Body fat", from: "29.4", to: "25.2", unit: "%", delta: "−4.2%" },
    { label: "Squat working weight", from: "95", to: "135", delta: "+42%" },
  ], footer: "Same person. New baseline." },
  { kind: "quote", eyebrow: "FROM YOUR COACH", quote: "Sarah showed up on the days she didn't want to. That's the whole game.", author: "— Coach Alex", teal: true },
  { kind: "cta", eyebrow: "WHAT'S NEXT", heading: "Phase 3 starts Monday", sub: "New block. New baseline. Same discipline.", footer: "MILTON × MMNT" },
];

const marcusCards = [
  { kind: "cover", eyebrow: "MILESTONE", big: "315", unit: "lb deadlift — a new PR", sub: "Jul 18 · Marcus Johnson", teal: true },
  { kind: "stat", eyebrow: "STRENGTH", heading: "The bar kept climbing", big: "+40 lb", sub: "Deadlift 275 → 315 lb since April", bars: [55, 62, 70, 78, 86, 92, 100], footer: "16 sessions in 4 weeks" },
  { kind: "quote", eyebrow: "FROM YOUR COACH", quote: "Marcus earned every plate. Four weeks of relentless work — this is what it buys.", author: "— Coach Alex", teal: true },
];

const STORIES_SEED = {
  ready: [
    {
      id: "sarah", client: { first: "Sarah", name: "Sarah Chen", initials: "SC", color: "#E87560" },
      title: "Sarah's 12-Week Wrapped", kind: "Recap", kindTone: "brand",
      cardBadge: { top: "12", bottom: "weeks", tone: "dark" },
      meta: "7 cards · built from 847 sets, 84 nutrition days, 2 assessments · generated 6:12 AM",
      highlights: "+40 lb squat · 34 sessions · 8-week streak · −14 lb",
      about: [
        ["Trigger", "12-week block completed"],
        ["Cards", "7"],
        ["Built from", "847 sets · 84 nutrition days · 2 assessments"],
        ["Generated", "Today, 6:12 AM"],
      ],
      note: "I built this from Sarah's own logs. Every number is verifiable — nothing inflated.",
      subhead: "Sarah Chen · Fat Loss — Phase 2 · ready to send",
      cards: sarahCards,
    },
    {
      id: "marcus", client: { first: "Marcus", name: "Marcus Johnson", initials: "MJ", color: "#2B7A78" },
      title: "Marcus — Deadlift PR", kind: "Milestone", kindTone: "success",
      cardBadge: { top: "315", bottom: "lb PR", tone: "teal" },
      meta: "3 cards · triggered by a new 1RM logged Jul 18 · generated 14 min ago",
      highlights: "315 lb deadlift · +40 lb since April · 16 sessions in 4 weeks",
      about: [
        ["Trigger", "New 1RM logged"],
        ["Cards", "3"],
        ["Built from", "1RM history · 16 sessions"],
        ["Generated", "14 min ago"],
      ],
      note: "Auto-generated the moment Marcus logged 315. Confirm before it goes out.",
      subhead: "Marcus Johnson · Strength — Off-season · ready to send",
      cards: marcusCards,
    },
  ],
  scheduled: [
    {
      id: "david", client: { first: "David", name: "David Park", initials: "DP", color: "#E89C3A" },
      title: "David — July Recap", kind: "Monthly", kindTone: "neutral",
      cardBadge: { top: "Jul 31", tone: "dashed" },
      meta: "Generates Jul 31 · 3 sessions left in the month · meet prep block, week 6 of 8",
      tracking: "first powerlifting meet · Aug 22",
    },
  ],
  sent: [
    { id: "emily", client: { first: "Emily", name: "Emily Rodriguez", initials: "ER", color: "#8B5CF6" }, title: "Emily's June Recap", kind: "Recap", kindTone: "brand", meta: "3 cards · sent Jul 1, 6:00 AM · opened · 4 shares", cardBadge: { top: "3", bottom: "cards", tone: "muted" } },
    { id: "rachel", client: { first: "Rachel", name: "Rachel Kim", initials: "RK", color: "#3F88F2" }, title: "Rachel — First Unassisted Pull-up", kind: "Milestone", kindTone: "success", meta: "3 cards · sent Jun 26, 11:40 AM · opened · 2 shares", cardBadge: { top: "1st", bottom: "pull-up", tone: "muted" } },
    { id: "jason", client: { first: "Jason", name: "Jason Williams", initials: "JW", color: "#0891b2" }, title: "Jason's June Recap", kind: "Recap", kindTone: "brand", meta: "4 cards · sent Jul 1, 6:00 AM · opened", cardBadge: { top: "4", bottom: "cards", tone: "muted" } },
    { id: "nina", client: { first: "Nina", name: "Nina Alvarez", initials: "NA", color: "#be123c" }, title: "Nina — 30 Sessions", kind: "Milestone", kindTone: "success", meta: "3 cards · sent Jun 20, 8:15 AM · opened · 1 share", cardBadge: { top: "30", bottom: "sessions", tone: "muted" } },
  ],
};

const NEW_STORY_CLIENTS = [
  { name: "Sarah Chen", initials: "SC", color: "#E87560", note: "847 sets · 84 nutrition days · block just ended", ready: "Story ready", tone: "success" },
  { name: "Marcus Johnson", initials: "MJ", color: "#2B7A78", note: "New deadlift 1RM Jul 18 · 16 sessions in 4 weeks", ready: "Story ready", tone: "success" },
  { name: "David Park", initials: "DP", color: "#E89C3A", note: "Meet prep week 6 of 8 · recap scheduled Jul 31", ready: "Enough data", tone: "info" },
  { name: "Emily Rodriguez", initials: "ER", color: "#8B5CF6", note: "Only 4 logged sessions · missed last 2", ready: "Thin data", tone: "warn" },
];

const KIND_TONES = {
  brand: { bg: C.violetBg, fg: C.violetFg },
  success: { bg: C.greenBg, fg: C.greenFg },
  info: { bg: C.infoBg, fg: C.info },
  neutral: { bg: "#eef2f1", fg: C.sub },
  warn: { bg: C.amberBg, fg: C.amber },
};

/* ── Small UI atoms ── */
function Pill({ tone = "neutral", children }) {
  const t = KIND_TONES[tone] || KIND_TONES.neutral;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 999, background: t.bg, color: t.fg, fontSize: 12, fontWeight: 600 }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: "currentColor" }} />
      {children}
    </span>
  );
}

function Avatar({ initials, color, size = 40 }) {
  return (
    <span style={{ width: size, height: size, borderRadius: 999, background: color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.34, fontWeight: 700, flexShrink: 0 }}>
      {initials}
    </span>
  );
}

/* ── The actual story card visual (shared by strip + player) ── */
function StoryCard({ card, accent, palette, w = 300 }) {
  const isTeal = card.teal;
  const bg = isTeal ? (palette?.quote || C.teal) : (palette?.card || C.dark);
  const scale = w / 300;
  const px = 26 * scale;
  const eyebrowSize = Math.max(9, 11 * scale);

  const eyebrow = (
    <div style={{ fontSize: eyebrowSize, fontWeight: 700, letterSpacing: "0.14em", color: isTeal ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.55)", textTransform: "uppercase" }}>
      {card.eyebrow}
    </div>
  );

  let body = null;
  if (card.kind === "cover") {
    body = (
      <div style={{ marginTop: "auto" }}>
        <div style={{ fontSize: 96 * scale, fontWeight: 800, color: isTeal ? "#fff" : accent, lineHeight: 0.9, letterSpacing: "-0.03em" }}>{card.big}</div>
        <div style={{ fontSize: 27 * scale, fontWeight: 700, color: "#fff", lineHeight: 1.15, marginTop: 10 * scale, maxWidth: 220 * scale }}>{card.unit}</div>
        <div style={{ fontSize: 13 * scale, color: "rgba(255,255,255,0.55)", marginTop: 12 * scale }}>{card.sub}</div>
      </div>
    );
  } else if (card.kind === "stat") {
    body = (
      <div style={{ marginTop: "auto" }}>
        <div style={{ fontSize: 24 * scale, fontWeight: 700, color: "#fff", marginBottom: 4 * scale }}>{card.heading}</div>
        <div style={{ fontSize: 60 * scale, fontWeight: 800, color: accent, lineHeight: 1, letterSpacing: "-0.02em" }}>{card.big}</div>
        <div style={{ fontSize: 13 * scale, color: "rgba(255,255,255,0.6)", marginTop: 8 * scale }}>{card.sub}</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6 * scale, height: 78 * scale, marginTop: 20 * scale }}>
          {card.bars.map((h, i) => (
            <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: `${4 * scale}px ${4 * scale}px 2px 2px`, background: i === card.bars.length - 1 ? accent : "rgba(255,255,255,0.16)" }} />
          ))}
        </div>
        <div style={{ fontSize: 11 * scale, color: "rgba(255,255,255,0.45)", marginTop: 12 * scale }}>{card.footer}</div>
      </div>
    );
  } else if (card.kind === "grid") {
    body = (
      <div style={{ marginTop: "auto" }}>
        <div style={{ fontSize: 24 * scale, fontWeight: 700, color: "#fff", marginBottom: 6 * scale }}>{card.heading}</div>
        <div style={{ fontSize: 56 * scale, fontWeight: 800, color: accent, lineHeight: 1 }}>{card.big}</div>
        <div style={{ fontSize: 13 * scale, color: "rgba(255,255,255,0.6)", marginTop: 6 * scale, marginBottom: 16 * scale }}>{card.sub}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 4 * scale }}>
          {Array.from({ length: card.total }).map((_, i) => (
            <div key={i} style={{ aspectRatio: "1", borderRadius: 3 * scale, background: i < card.filled ? accent : "rgba(255,255,255,0.14)" }} />
          ))}
        </div>
        <div style={{ fontSize: 11 * scale, color: "rgba(255,255,255,0.45)", marginTop: 14 * scale }}>{card.footer}</div>
      </div>
    );
  } else if (card.kind === "beforeafter") {
    body = (
      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 18 * scale }}>
        {card.rows.map((r, i) => (
          <div key={i}>
            <div style={{ fontSize: 13 * scale, color: "rgba(255,255,255,0.6)", marginBottom: 4 * scale }}>{r.label}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10 * scale, flexWrap: "wrap" }}>
              <span style={{ fontSize: 34 * scale, fontWeight: 700, color: "rgba(255,255,255,0.45)" }}>{r.from}</span>
              <span style={{ fontSize: 20 * scale, color: "rgba(255,255,255,0.4)" }}>→</span>
              <span style={{ fontSize: 34 * scale, fontWeight: 800, color: "#fff" }}>{r.to}{r.unit && <span style={{ fontSize: 16 * scale }}>{r.unit}</span>}</span>
              {r.delta && <span style={{ fontSize: 15 * scale, fontWeight: 700, color: accent }}>{r.delta}</span>}
            </div>
          </div>
        ))}
        <div style={{ fontSize: 15 * scale, fontWeight: 600, color: "rgba(255,255,255,0.85)", marginTop: 4 * scale }}>{card.footer}</div>
      </div>
    );
  } else if (card.kind === "quote") {
    body = (
      <div style={{ marginTop: "auto" }}>
        <div style={{ fontSize: 60 * scale, fontWeight: 800, color: "rgba(255,255,255,0.35)", lineHeight: 0.6 }}>{"\u201C"}</div>
        <div style={{ fontSize: 26 * scale, fontWeight: 700, color: "#fff", lineHeight: 1.25, marginTop: 14 * scale }}>{card.quote}</div>
        <div style={{ fontSize: 14 * scale, color: "rgba(255,255,255,0.7)", marginTop: 18 * scale }}>{card.author}</div>
      </div>
    );
  } else if (card.kind === "cta") {
    body = (
      <div style={{ marginTop: "auto" }}>
        <div style={{ fontSize: 30 * scale, fontWeight: 800, color: "#fff", lineHeight: 1.1 }}>{card.heading}</div>
        <div style={{ fontSize: 14 * scale, color: "rgba(255,255,255,0.6)", marginTop: 12 * scale }}>{card.sub}</div>
      </div>
    );
  }

  return (
    <div style={{ width: w, aspectRatio: "9 / 16", background: bg, borderRadius: 16 * scale, padding: px, display: "flex", flexDirection: "column", flexShrink: 0, overflow: "hidden", position: "relative", boxShadow: "0 8px 24px rgba(11,20,23,0.18)" }}>
      {eyebrow}
      {body}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 18 * scale }}>
        <span style={{ fontSize: 10 * scale, fontWeight: 600, letterSpacing: "0.14em", color: "rgba(255,255,255,0.4)" }}>MILTON × MMNT</span>
      </div>
    </div>
  );
}

/* ── Full-screen story player ── */
function StoryPlayer({ story, onClose }) {
  const [idx, setIdx] = useState(0);
  const total = story.cards.length;

  const next = useCallback(() => setIdx((i) => (i + 1 < total ? i + 1 : i)), [total]);
  const prev = useCallback(() => setIdx((i) => (i > 0 ? i - 1 : 0)), []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, onClose]);

  return (
    <div style={{ position: "absolute", inset: 0, background: "rgba(11,20,23,0.94)", zIndex: 60, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 20 }}>
      {/* progress dots */}
      <div style={{ display: "flex", gap: 4, width: "100%", maxWidth: 300, position: "absolute", top: 24 }}>
        {story.cards.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 999, background: "rgba(255,255,255,0.25)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: i <= idx ? "100%" : "0%", background: "#fff", transition: "width 0.3s ease" }} />
          </div>
        ))}
      </div>

      {/* header */}
      <div style={{ position: "absolute", top: 40, width: "100%", maxWidth: 300, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar initials={story.client.initials} color={story.client.color} size={34} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{story.client.name}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>from Coach Alex · now</div>
          </div>
        </div>
        <button onClick={onClose} aria-label="Close player" style={{ width: 30, height: 30, borderRadius: 999, border: "none", background: "rgba(255,255,255,0.15)", color: "#fff", cursor: "pointer", fontSize: 16, lineHeight: 1 }}>×</button>
      </div>

      <StoryCard card={story.cards[idx]} accent="#6ECB74" w={300} />

      {/* tap zones */}
      <button onClick={prev} aria-label="Previous card" style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "35%", background: "transparent", border: "none", cursor: idx > 0 ? "pointer" : "default" }} />
      <button onClick={next} aria-label="Next card" style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "45%", background: "transparent", border: "none", cursor: idx + 1 < total ? "pointer" : "default" }} />

      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", textAlign: "center", position: "absolute", bottom: 24 }}>
        Previewing as {story.client.first} · tap right to advance, left to go back &nbsp;·&nbsp; {idx + 1} / {total}
      </div>
    </div>
  );
}

/* ── New story modal ── */
function NewStoryModal({ onClose, onGenerate }) {
  const [sel, setSel] = useState(null);
  return (
    <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(11,20,23,0.45)", zIndex: 55, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 520, background: C.white, borderRadius: 20, padding: 28, boxShadow: "0 28px 60px rgba(14,93,112,0.24)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.01em", color: C.text }}>New story</div>
            <div style={{ fontSize: 14, color: C.sub, marginTop: 2 }}>Pick a client. Milton builds only from what they've logged.</div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ width: 30, height: 30, borderRadius: 999, border: "none", background: C.borderSoft, color: C.sub, cursor: "pointer", fontSize: 16 }}>×</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, margin: "18px 0" }}>
          {NEW_STORY_CLIENTS.map((cl) => {
            const on = sel === cl.name;
            return (
              <button key={cl.name} onClick={() => setSel(cl.name)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 14, border: `1.5px solid ${on ? C.teal : C.border}`, background: on ? C.tealBg : C.white, cursor: "pointer", textAlign: "left", fontFamily: FONT, transition: "all 0.15s ease" }}>
                <Avatar initials={cl.initials} color={cl.color} size={40} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{cl.name}</div>
                  <div style={{ fontSize: 12.5, color: C.sub, marginTop: 2 }}>{cl.note}</div>
                </div>
                <Pill tone={cl.tone}>{cl.ready}</Pill>
              </button>
            );
          })}
        </div>

        <div style={{ position: "relative", padding: "12px 16px 12px 20px", background: C.tealBg, borderRadius: "0 12px 12px 0", fontSize: 13.5, color: C.text, marginBottom: 18 }}>
          <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: C.teal, borderRadius: 999 }} />
          Stories only use logged data — nothing estimated, nothing inflated.
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: 999, border: `1px solid ${C.border}`, background: C.white, color: C.text, fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: FONT }}>Cancel</button>
          <button disabled={!sel} onClick={() => onGenerate(sel)} style={{ padding: "10px 22px", borderRadius: 999, border: "none", background: sel ? C.teal : "#c7d6d3", color: "#fff", fontWeight: 600, fontSize: 14, cursor: sel ? "pointer" : "default", fontFamily: FONT }}>Generate story</button>
        </div>
      </div>
    </div>
  );
}

/* ── Queue card (Ready / Scheduled / Sent list item) ── */
function QueueCard({ story, onReview, onSend, sent }) {
  const b = story.cardBadge || {};
  const badgeBg = b.tone === "teal" ? C.teal : b.tone === "dashed" ? C.borderSoft : b.tone === "muted" ? "#eef2f1" : C.dark;
  const badgeFg = b.tone === "dashed" || b.tone === "muted" ? C.sub : "#fff";
  const topColor = b.tone === "teal" ? "#fff" : b.tone === "dark" ? "#6ECB74" : badgeFg;

  return (
    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, boxShadow: "0 1px 3px rgba(14,93,112,0.06)", padding: 18, display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
      <div style={{ width: 60, height: 106, borderRadius: 10, background: badgeBg, border: b.tone === "dashed" ? `1px dashed ${C.faint}` : "none", flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
        <div style={{ fontSize: b.top && b.top.length > 3 ? 15 : 24, fontWeight: 700, color: topColor, lineHeight: 1 }}>{b.top}</div>
        {b.bottom && <div style={{ fontSize: 7, letterSpacing: "0.08em", color: b.tone === "muted" || b.tone === "dashed" ? C.faint : "rgba(255,255,255,0.6)", textTransform: "uppercase" }}>{b.bottom}</div>}
      </div>

      <div style={{ flex: 1, minWidth: 180 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 16.5, fontWeight: 600, color: C.text }}>{story.title}</span>
          <Pill tone={story.kindTone}>{story.kind}</Pill>
          {sent && <Pill tone="success">Sent</Pill>}
        </div>
        <div style={{ fontSize: 12.5, color: C.sub, marginTop: 5 }}>{story.meta}</div>
        {story.highlights && <div style={{ fontSize: 13, color: C.text, marginTop: 6 }}>Highlights: {story.highlights}</div>}
        {story.tracking && <div style={{ fontSize: 13, color: C.text, marginTop: 6 }}>Tracking toward: <strong>{story.tracking}</strong></div>}
      </div>

      <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
        {story.cards && (
          <button onClick={() => onReview(story)} style={{ padding: "10px 18px", borderRadius: 999, background: C.white, color: C.text, border: `1px solid ${C.border}`, fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: FONT }}>Review</button>
        )}
        {story.cards && !sent && (
          <button onClick={() => onSend(story)} style={{ padding: "10px 18px", borderRadius: 999, background: C.teal, color: "#fff", border: "none", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: FONT }}>Send to {story.client.first}</button>
        )}
        {!story.cards && (
          <button style={{ padding: "10px 18px", borderRadius: 999, background: C.white, color: C.text, border: `1px solid ${C.border}`, fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: FONT }}>Generate now</button>
        )}
      </div>
    </div>
  );
}

/* ── Format explorer (build additional story-card explorations) ── */
const FORMAT_DIRECTIONS = [
  { id: "bignum", name: "Big number", desc: "One hero stat, maximum impact", card: { kind: "cover", eyebrow: "MILTON WRAPPED", big: "12", unit: "weeks of showing up", sub: "Sarah Chen" } },
  { id: "bars", name: "Stat + bars", desc: "The climb, visualized", card: { kind: "stat", eyebrow: "STRENGTH", heading: "The squat moved", big: "+40 lb", sub: "95 → 135 lb", bars: [42, 52, 60, 70, 82, 100], footer: "every set logged" } },
  { id: "grid", name: "Session grid", desc: "Consistency you can see", card: { kind: "grid", eyebrow: "CONSISTENCY", heading: "Showed up", big: "34", sub: "of 36 sessions", total: 36, filled: 34, footer: "8-week streak" } },
  { id: "beforeafter", name: "Before / after", desc: "The receipts, side by side", card: { kind: "beforeafter", eyebrow: "DAY 1 → TODAY", rows: [{ label: "Bodyweight", from: "167", to: "153", delta: "−14" }, { label: "Squat", from: "95", to: "135", delta: "+42%" }], footer: "New baseline." } },
  { id: "poster", name: "Type poster", desc: "Words that hit", card: { kind: "quote", eyebrow: "FROM YOUR COACH", quote: "Showed up on the days she didn't want to.", author: "— Coach Alex", teal: true } },
  { id: "cta", name: "Closing CTA", desc: "Point at what's next", card: { kind: "cta", eyebrow: "WHAT'S NEXT", heading: "Phase 3 starts Monday", sub: "Same discipline." } },
];

function FormatsView({ onBack }) {
  const [paletteName, setPaletteName] = useState("Milton");
  const palette = PALETTES[paletteName];

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto" }}>
      <button onClick={onBack} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 999, background: C.white, border: `1px solid ${C.border}`, color: C.teal, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: FONT, marginBottom: 18 }}>← Stories</button>

      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 8 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", color: C.text }}>Card explorations</h2>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: C.sub }}>Six formats Milton can build from any client's data. Recolor and preview before you commit.</p>
        </div>
        <div style={{ display: "inline-flex", gap: 4, background: C.borderSoft, padding: 4, borderRadius: 999 }}>
          {Object.keys(PALETTES).map((name) => {
            const on = paletteName === name;
            return (
              <button key={name} onClick={() => setPaletteName(name)} style={{ padding: "7px 14px", borderRadius: 999, border: "none", cursor: "pointer", fontFamily: FONT, fontSize: 12.5, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 7, background: on ? C.dark : "transparent", color: on ? "#fff" : C.sub }}>
                <span style={{ width: 10, height: 10, borderRadius: 999, background: PALETTES[name].accent }} />
                {name}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20, marginTop: 24 }}>
        {FORMAT_DIRECTIONS.map((f) => (
          <div key={f.id} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <StoryCard card={f.card} accent={palette.accent} palette={palette} w={220} />
            <div>
              <div style={{ fontSize: 14.5, fontWeight: 600, color: C.text }}>{f.name}</div>
              <div style={{ fontSize: 12.5, color: C.sub, marginTop: 2 }}>{f.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Review view (client-facing preview + rail) ── */
function ReviewView({ story, onBack, onPreview, sent, onSend }) {
  return (
    <div style={{ maxWidth: 1180, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 6 }}>
        <button onClick={onBack} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 999, background: C.white, border: `1px solid ${C.border}`, color: C.teal, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: FONT }}>← Stories</button>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", color: C.text }}>{story.title}</h2>
          <div style={{ fontSize: 13, color: C.sub, marginTop: 2 }}>{story.subhead}</div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={onPreview} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 999, background: C.tealBg, color: C.teal, border: "none", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: FONT }}>▶ Preview as {story.client.first}</button>
          <button style={{ padding: "10px 16px", borderRadius: 999, background: C.white, color: C.text, border: `1px solid ${C.border}`, fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: FONT }}>Regenerate</button>
          <button onClick={() => onSend(story)} style={{ padding: "10px 18px", borderRadius: 999, background: C.teal, color: "#fff", border: "none", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: FONT }}>{sent ? "Sent" : `Send to ${story.client.first}`}</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 300px", gap: 24, marginTop: 20, alignItems: "start" }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: C.faint, textTransform: "uppercase", marginBottom: 14 }}>Client-facing preview · swipes left to right</div>
          <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 12 }}>
            {story.cards.map((card, i) => (
              <StoryCard key={i} card={card} accent="#6ECB74" w={240} />
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: C.faint, textTransform: "uppercase", marginBottom: 14 }}>About this story</div>
            {story.about.map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "7px 0", borderBottom: `1px solid ${C.borderSoft}` }}>
                <span style={{ fontSize: 13, color: C.sub, flexShrink: 0 }}>{k}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.text, textAlign: "right" }}>{v}</span>
              </div>
            ))}
            <div style={{ position: "relative", padding: "10px 14px 10px 16px", background: C.tealBg, borderRadius: "0 10px 10px 0", fontSize: 13, color: C.text, marginTop: 14 }}>
              <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: C.teal, borderRadius: 999 }} />
              {story.note}
            </div>
          </div>

          <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: C.faint, textTransform: "uppercase", marginBottom: 14 }}>Share</div>
            <button style={{ width: "100%", padding: "11px", borderRadius: 999, background: C.white, color: C.text, border: `1px solid ${C.border}`, fontWeight: 600, fontSize: 13.5, cursor: "pointer", fontFamily: FONT, marginBottom: 10 }}>Download {story.cards.length} story images</button>
            <button style={{ width: "100%", padding: "11px", borderRadius: 999, background: C.white, color: C.text, border: `1px solid ${C.border}`, fontWeight: 600, fontSize: 13.5, cursor: "pointer", fontFamily: FONT, marginBottom: 10 }}>Copy share link</button>
            <button onClick={() => onSend(story)} style={{ width: "100%", padding: "12px", borderRadius: 999, background: C.teal, color: "#fff", border: "none", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: FONT }}>{sent ? "Sent" : `Send to ${story.client.first}`}</button>
            <div style={{ fontSize: 12, color: C.sub, marginTop: 12, lineHeight: 1.5 }}>{story.client.first} gets it in the app and by text, sized for Instagram stories. The share link tracks views.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main canvas ── */
export default function StoriesCanvas({ onClose, onHome, isMobile }) {
  const [view, setView] = useState("home"); // home | review | formats
  const [tab, setTab] = useState("ready");
  const [active, setActive] = useState(null);
  const [player, setPlayer] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [sentIds, setSentIds] = useState({});
  const [toast, setToast] = useState(null);
  const [data, setData] = useState(STORIES_SEED);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const openReview = (s) => { setActive(s); setView("review"); };
  const sendStory = (s) => { setSentIds((p) => ({ ...p, [s.id]: true })); setToast(`${s.title} sent to ${s.client.first}`); };
  const generate = (name) => {
    setShowNew(false);
    setToast(`Building a story for ${name.split(" ")[0]}… I'll only use logged data.`);
  };

  const tabs = [
    ["ready", "Ready", data.ready.length],
    ["scheduled", "Scheduled", data.scheduled.length],
    ["sent", "Sent", data.sent.length],
  ];
  const list = data[tab];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: C.bg, fontFamily: FONT, color: C.text, position: "relative" }}>
      <style>{`.stories-scroll::-webkit-scrollbar{height:8px}.stories-scroll::-webkit-scrollbar-thumb{background:#cddad6;border-radius:999px}`}</style>

      {/* close */}
      {!isMobile && (
        <button onClick={onClose} title="Close" aria-label="Close" style={{ position: "absolute", top: 14, right: 16, zIndex: 40, width: 36, height: 36, display: "inline-flex", alignItems: "center", justifyContent: "center", background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, cursor: "pointer", boxShadow: "0 1px 3px rgba(14,93,112,0.08)" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
      )}

      <div className="stories-scroll" style={{ flex: 1, overflow: "auto", padding: isMobile ? "20px 16px 96px" : "36px 40px 64px" }}>
        {view === "home" && (
          <div style={{ maxWidth: 1080, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 8 }}>
              <div>
                <h1 style={{ margin: 0, fontSize: isMobile ? 26 : 32, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.1 }}>Progress Stories</h1>
                <p style={{ margin: "6px 0 0", fontSize: 15, color: C.sub }}>Milton turns client progress into stories they'll want to share</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <button onClick={() => setView("formats")} style={{ padding: "9px 16px", borderRadius: 999, background: C.white, border: `1px solid ${C.border}`, color: C.text, fontWeight: 600, fontSize: 13.5, cursor: "pointer", fontFamily: FONT }}>Explore formats</button>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 999, background: C.greenBg, color: C.greenFg, fontSize: 12, fontWeight: 600 }}>
                  <span style={{ width: 6, height: 6, borderRadius: 999, background: "currentColor" }} />
                  Auto-generate on
                </div>
                <button onClick={() => setShowNew(true)} style={{ padding: "10px 18px", borderRadius: 999, background: C.teal, color: "#fff", border: "none", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: FONT }}>New story</button>
              </div>
            </div>

            <div style={{ position: "relative", margin: "20px 0 24px", padding: "12px 16px 12px 20px", background: C.tealBg, borderRadius: "0 12px 12px 0", fontSize: 14, color: C.text }}>
              <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: C.teal, borderRadius: 999 }} />
              Sarah finished her 12-week block this morning — I built her Wrapped from 847 logged sets. Nothing ships until you say so.
            </div>

            <div style={{ display: "inline-flex", gap: 4, background: "#e6ece9", padding: 4, borderRadius: 999, marginBottom: 20 }}>
              {tabs.map(([key, label, count]) => {
                const on = tab === key;
                return (
                  <button key={key} onClick={() => setTab(key)} style={{ padding: "8px 18px", borderRadius: 999, border: "none", fontFamily: FONT, fontSize: 13, fontWeight: 600, cursor: "pointer", background: on ? C.teal : "transparent", color: on ? "#fff" : C.sub }}>
                    {label} &nbsp;{count}
                  </button>
                );
              })}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {list.map((s) => (
                <QueueCard key={s.id} story={s} sent={tab === "sent" || sentIds[s.id]} onReview={openReview} onSend={sendStory} />
              ))}
            </div>
          </div>
        )}

        {view === "review" && active && (
          <ReviewView story={active} sent={sentIds[active.id]} onBack={() => setView("home")} onPreview={() => setPlayer(active)} onSend={sendStory} />
        )}

        {view === "formats" && <FormatsView onBack={() => setView("home")} />}
      </div>

      {player && <StoryPlayer story={player} onClose={() => setPlayer(null)} />}
      {showNew && <NewStoryModal onClose={() => setShowNew(false)} onGenerate={generate} />}

      {toast && (
        <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", background: C.dark, color: "#fff", padding: "12px 20px", borderRadius: 999, fontSize: 13.5, fontWeight: 500, boxShadow: "0 12px 32px rgba(14,93,112,0.24)", zIndex: 50, maxWidth: "90%" }}>
          {toast}
        </div>
      )}
    </div>
  );
}
