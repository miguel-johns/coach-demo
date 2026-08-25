import { useState, useRef, useEffect } from "react";
import { resolveVoiceCommand, VOICE_SUGGESTIONS } from "./voiceCommands";

/* ── Inline voice bar. Lives inside the chat composer, so the dashboard
      stays visible while Milton listens and works. Scripted for demo:
      it runs hands-free, no mic permission and no clicking required. ── */
const TEAL = "#2C7A7B";
const TEAL_DEEP = "#1f5b5c";
const TEAL_WASH = "#f2f8f8";
const TEXT = "#1a2e2e";
const MUTED = "#6b8280";
const BORDER = "#e3ece9";
const WHITE = "#ffffff";
const font = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

/* Timing of the scripted loop, in ms. */
const T = {
  listenDwell: 1500,
  wordDelay: 105,
  beforeSend: 620,
  stepDelay: 680,
  afterDone: 1500,
};

/* ── Live waveform. Synthetic amplitude, driven by rAF so it breathes
      like a real signal rather than looping a fixed CSS animation. ── */
function Waveform({ active, speaking, bars = 26 }) {
  const [amps, setAmps] = useState(() => new Array(bars).fill(0.12));
  const raf = useRef(null);
  const t = useRef(0);

  useEffect(() => {
    if (!active) {
      setAmps(new Array(bars).fill(0.12));
      return;
    }
    const tick = () => {
      t.current += 0.08;
      const gain = speaking ? 1 : 0.34;
      setAmps(
        Array.from({ length: bars }, (_, i) => {
          const wave =
            Math.sin(t.current * 1.5 + i * 0.55) * 0.5 +
            Math.sin(t.current * 2.6 - i * 0.31) * 0.32;
          const envelope = Math.sin((i / (bars - 1)) * Math.PI); // taper the ends
          const v = (Math.abs(wave) * 0.8 + Math.random() * 0.2) * envelope * gain;
          return Math.max(0.1, Math.min(1, v));
        })
      );
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [active, speaking, bars]);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2.5, height: 22 }} aria-hidden="true">
      {amps.map((a, i) => (
        <div
          key={i}
          style={{
            width: 2.5,
            height: `${Math.round(a * 22)}px`,
            borderRadius: 2,
            background: speaking ? TEAL : `rgba(44,122,123,0.42)`,
            transition: "height 90ms linear, background 200ms ease",
          }}
        />
      ))}
    </div>
  );
}

/* ── The composer-level voice surface. ── */
export default function VoiceBar({ active, onStop, onCommand }) {
  const [phase, setPhase] = useState("listening"); // listening | hearing | working
  const [typed, setTyped] = useState("");
  const [steps, setSteps] = useState([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [queue, setQueue] = useState(0);

  const timers = useRef([]);
  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  const later = (fn, ms) => { timers.current.push(setTimeout(fn, ms)); };

  /* Reset whenever voice mode is toggled. */
  useEffect(() => {
    if (!active) { clearTimers(); setPhase("listening"); setTyped(""); setSteps([]); setStepIdx(0); }
    return clearTimers;
  }, [active]);

  /* The scripted loop: listen → hear a command → work it → listen again. */
  useEffect(() => {
    if (!active) return;
    clearTimers();

    const utterance = VOICE_SUGGESTIONS[queue % VOICE_SUGGESTIONS.length];
    const words = utterance.split(" ");

    setPhase("listening");
    setTyped("");
    setSteps([]);
    setStepIdx(0);

    later(() => {
      setPhase("hearing");
      words.forEach((_, i) => {
        later(() => setTyped(words.slice(0, i + 1).join(" ")), i * T.wordDelay);
      });

      const spoken = words.length * T.wordDelay + T.beforeSend;
      later(() => {
        const cmd = resolveVoiceCommand(utterance);
        onCommand?.(cmd || { utterance, chat: null, steps: [] });

        const list = cmd?.steps?.length ? cmd.steps : ["Working on it"];
        setSteps(list);
        setStepIdx(0);
        setPhase("working");

        list.forEach((_, i) => later(() => setStepIdx(i), i * T.stepDelay));
        later(() => setQueue(q => q + 1), list.length * T.stepDelay + T.afterDone);
      }, spoken);
    }, T.listenDwell);
  }, [active, queue]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!active) return null;

  const label =
    phase === "listening" ? "Listening" : phase === "hearing" ? "Listening" : "Milton is on it";

  return (
    <div
      style={{
        border: `1px solid ${phase === "working" ? BORDER : "rgba(44,122,123,0.35)"}`,
        background: phase === "working" ? WHITE : TEAL_WASH,
        borderRadius: 16,
        padding: "10px 10px 12px 14px",
        display: "flex",
        flexDirection: "column",
        gap: 7,
        fontFamily: font,
        transition: "background 240ms ease, border-color 240ms ease",
      }}
      role="status"
      aria-live="polite"
    >
      {/* Row 1 — state, live signal, and the way out */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
            background: phase === "working" ? "#e0a33e" : TEAL,
            boxShadow: phase === "working" ? "none" : `0 0 0 4px rgba(44,122,123,0.14)`,
            animation: "vbPulse 1.5s ease-in-out infinite",
          }}
        />
        <span style={{ fontSize: 10, letterSpacing: 0.8, textTransform: "uppercase", color: MUTED, fontWeight: 600 }}>
          {label}
        </span>

        <span style={{ flex: 1 }} />

        {phase !== "working"
          ? <Waveform active={active} speaking={phase === "hearing"} bars={16} />
          : <span style={{ color: MUTED, fontSize: 11, fontWeight: 600 }}>{stepIdx + 1}/{steps.length}</span>}

        <button
          onClick={onStop}
          title="Stop voice mode"
          aria-label="Stop voice mode"
          style={{
            width: 26, height: 26, borderRadius: "50%", flexShrink: 0, cursor: "pointer",
            border: "none", background: TEAL_DEEP, display: "grid", placeItems: "center",
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: 2, background: WHITE, display: "block" }} />
        </button>
      </div>

      {/* Row 2 — what Milton heard, then what he's doing about it */}
      {phase === "working" ? (
        <span style={{ fontSize: 13, color: TEXT, fontWeight: 500, lineHeight: 1.45, display: "flex", alignItems: "flex-start", gap: 7 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="3"
            strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 4 }}>
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{steps[stepIdx] || "Working on it"}</span>
        </span>
      ) : (
        <span style={{ fontSize: 14, color: typed ? TEXT : MUTED, fontWeight: typed ? 500 : 400, lineHeight: 1.45 }}>
          {typed || "Say something to Milton\u2026"}
          {phase === "hearing" && <span style={{ color: TEAL }}>|</span>}
        </span>
      )}

      <style>{`@keyframes vbPulse { 0%,100% { opacity: 1 } 50% { opacity: 0.35 } }`}</style>
    </div>
  );
}
