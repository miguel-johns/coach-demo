import { useState, useRef, useEffect, useCallback } from "react";
import { resolveVoiceCommand, VOICE_SUGGESTIONS, VOICE_FALLBACK } from "./voiceCommands";

/* ── Voice studio palette: a deep teal room that the light dashboard
      recedes behind. One signature element — the reactive ring. ── */
const INK = "#08201e";
const INK_2 = "#0d2c29";
const MINT = "#5CDB95";
const SAGE = "#3aafa9";
const PAPER = "#f2f7f5";
const MUTED = "rgba(242,247,245,0.56)";
const HAIR = "rgba(92,219,149,0.18)";
const font = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const SpeechRec =
  typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

/* ─────────────────────────────────────────────────────────────
   Reactive ring — radial bars driven by live mic amplitude.
   ───────────────────────────────────────────────────────────── */
function VoiceRing({ analyser, phase, size = 232 }) {
  const canvasRef = useRef(null);
  const raf = useRef(null);
  const smooth = useRef(new Array(72).fill(0));

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cvs.width = size * dpr;
    cvs.height = size * dpr;
    ctx.scale(dpr, dpr);

    const bins = 72;
    const data = analyser ? new Uint8Array(analyser.frequencyBinCount) : null;
    let t = 0;

    const draw = () => {
      t += 0.016;
      ctx.clearRect(0, 0, size, size);
      const cx = size / 2;
      const cy = size / 2;
      const base = size * 0.29;

      if (analyser && data) analyser.getByteTimeDomainData(data);

      // Amplitude per bar: real audio when listening, a calm idle drift otherwise.
      for (let i = 0; i < bins; i++) {
        let amp;
        if (analyser && data && phase === "listening") {
          const slice = Math.floor(data.length / bins);
          let peak = 0;
          for (let j = 0; j < slice; j++) {
            const v = Math.abs(data[i * slice + j] - 128) / 128;
            if (v > peak) peak = v;
          }
          amp = Math.min(peak * 2.6, 1);
        } else if (phase === "speaking") {
          amp = 0.22 + Math.abs(Math.sin(t * 3.1 + i * 0.42)) * 0.4;
        } else if (phase === "thinking" || phase === "executing") {
          amp = 0.1 + Math.abs(Math.sin(t * 2.2 + i * 0.28)) * 0.16;
        } else {
          amp = 0.06 + Math.abs(Math.sin(t * 0.9 + i * 0.2)) * 0.06;
        }
        smooth.current[i] = smooth.current[i] * 0.72 + amp * 0.28;
      }

      // Halo
      const halo = ctx.createRadialGradient(cx, cy, base * 0.5, cx, cy, base * 1.9);
      halo.addColorStop(0, "rgba(92,219,149,0.14)");
      halo.addColorStop(1, "rgba(92,219,149,0)");
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, size, size);

      // Inner ring
      ctx.beginPath();
      ctx.arc(cx, cy, base - 10, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(92,219,149,0.22)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Bars
      for (let i = 0; i < bins; i++) {
        const a = (i / bins) * Math.PI * 2 - Math.PI / 2;
        const len = 6 + smooth.current[i] * (size * 0.2);
        const x1 = cx + Math.cos(a) * base;
        const y1 = cy + Math.sin(a) * base;
        const x2 = cx + Math.cos(a) * (base + len);
        const y2 = cy + Math.sin(a) * (base + len);
        const g = ctx.createLinearGradient(x1, y1, x2, y2);
        g.addColorStop(0, phase === "speaking" ? "rgba(58,175,169,0.95)" : "rgba(92,219,149,0.95)");
        g.addColorStop(1, "rgba(92,219,149,0.12)");
        ctx.strokeStyle = g;
        ctx.lineWidth = 2.4;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => raf.current && cancelAnimationFrame(raf.current);
  }, [analyser, phase, size]);

  return <canvas ref={canvasRef} style={{ width: size, height: size, display: "block" }} />;
}

/* Compact level meter used in the docked bar */
function MiniLevels({ analyser, phase }) {
  const ref = useRef(null);
  const raf = useRef(null);
  const smooth = useRef(new Array(22).fill(0));
  useEffect(() => {
    const cvs = ref.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = 76, h = 26;
    cvs.width = w * dpr; cvs.height = h * dpr; ctx.scale(dpr, dpr);
    const data = analyser ? new Uint8Array(analyser.frequencyBinCount) : null;
    let t = 0;
    const draw = () => {
      t += 0.05;
      ctx.clearRect(0, 0, w, h);
      if (analyser && data) analyser.getByteTimeDomainData(data);
      const bars = 22;
      for (let i = 0; i < bars; i++) {
        let amp;
        if (analyser && data && phase === "listening") {
          const slice = Math.floor(data.length / bars);
          let peak = 0;
          for (let j = 0; j < slice; j++) {
            const v = Math.abs(data[i * slice + j] - 128) / 128;
            if (v > peak) peak = v;
          }
          amp = Math.min(peak * 2.8, 1);
        } else if (phase === "speaking") amp = 0.25 + Math.abs(Math.sin(t * 2 + i * 0.5)) * 0.5;
        else amp = 0.08 + Math.abs(Math.sin(t * 0.8 + i * 0.4)) * 0.08;
        smooth.current[i] = smooth.current[i] * 0.7 + amp * 0.3;
        const bh = Math.max(2, smooth.current[i] * h);
        ctx.fillStyle = phase === "speaking" ? "rgba(58,175,169,0.9)" : "rgba(92,219,149,0.9)";
        ctx.beginPath();
        ctx.roundRect(i * 3.4, (h - bh) / 2, 2, bh, 1);
        ctx.fill();
      }
      raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => raf.current && cancelAnimationFrame(raf.current);
  }, [analyser, phase]);
  return <canvas ref={ref} style={{ width: 76, height: 26, display: "block" }} />;
}

/* ─────────────────────────────────────────────────────────────
   Voice mode
   ───────────────────────────────────────────────────────────── */
export default function VoiceMode({ open, onClose, onCommand, onFallback }) {
  const [phase, setPhase] = useState("idle"); // idle | listening | thinking | executing | speaking
  const [interim, setInterim] = useState("");
  const [log, setLog] = useState([]); // { role: 'coach'|'milton', text }
  const [actions, setActions] = useState([]); // { title, steps, done }
  const [docked, setDocked] = useState(false);
  const [micError, setMicError] = useState(null);
  const [analyser, setAnalyser] = useState(null);
  const [typed, setTyped] = useState("");
  const [muted, setMuted] = useState(false);

  const recRef = useRef(null);
  const listenRef = useRef(false);
  const busyRef = useRef(false);
  const streamRef = useRef(null);
  const audioCtxRef = useRef(null);
  const logEndRef = useRef(null);
  const voiceRef = useRef(null);
  const timersRef = useRef([]);
  const mutedRef = useRef(false);

  useEffect(() => { mutedRef.current = muted; }, [muted]);

  const clearTimers = () => { timersRef.current.forEach(clearTimeout); timersRef.current = []; };
  const later = (fn, ms) => { timersRef.current.push(setTimeout(fn, ms)); };

  /* ── Milton's voice ── */
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const pick = () => {
      const all = window.speechSynthesis.getVoices();
      if (!all.length) return;
      const wanted = ["Google US English", "Samantha", "Microsoft Aria", "Alex", "Daniel", "Karen"];
      voiceRef.current =
        wanted.map((n) => all.find((v) => v.name.includes(n))).find(Boolean) ||
        all.find((v) => v.lang?.startsWith("en")) ||
        all[0];
    };
    pick();
    window.speechSynthesis.onvoiceschanged = pick;
  }, []);

  const stopRecognition = useCallback(() => {
    listenRef.current = false;
    try { recRef.current?.stop(); } catch {}
  }, []);

  const startRecognition = useCallback(() => {
    if (!SpeechRec || busyRef.current) return;
    listenRef.current = true;
    try { recRef.current?.start(); } catch {}
  }, []);

  const speak = useCallback((text, after) => {
    const done = () => {
      busyRef.current = false;
      // Only claim to be listening if the mic is actually available.
      if (SpeechRec && !micErrorRef.current) { setPhase("listening"); startRecognition(); }
      else setPhase("idle");
      after?.();
    };
    if (typeof window === "undefined" || !window.speechSynthesis || mutedRef.current) {
      // Still hold the floor briefly so the UI reads as a turn.
      busyRef.current = true;
      setPhase("speaking");
      later(done, Math.min(4200, 900 + text.length * 32));
      return;
    }
    busyRef.current = true;
    stopRecognition();
    setPhase("speaking");
    window.speechSynthesis.cancel();
    const u = new window.SpeechSynthesisUtterance(text);
    if (voiceRef.current) u.voice = voiceRef.current;
    u.rate = 1.04;
    u.pitch = 1.0;
    u.onend = done;
    u.onerror = done;
    window.speechSynthesis.speak(u);
    // Safety net if the engine never fires onend (known Safari quirk).
    later(() => { if (busyRef.current) done(); }, 1200 + text.length * 75);
  }, [startRecognition, stopRecognition]);

  /* ── Run one utterance through the pipeline ── */
  const handleUtterance = useCallback((raw) => {
    const text = (raw || "").trim();
    if (!text || busyRef.current) return;
    setInterim("");
    setLog((p) => [...p, { role: "coach", text }]);
    setPhase("thinking");
    stopRecognition();

    const cmd = resolveVoiceCommand(text);

    if (!cmd) {
      onFallback?.(text);
      setLog((p) => [...p, { role: "milton", text: VOICE_FALLBACK.spoken }]);
      later(() => speak(VOICE_FALLBACK.spoken), 260);
      return;
    }

    later(() => {
      setPhase("executing");
      const entry = { title: cmd.title, steps: cmd.steps, done: 0, id: Date.now() };
      setActions((p) => [...p.slice(-2), entry]);
      onCommand?.(cmd);
      setLog((p) => [...p, { role: "milton", text: cmd.spoken }]);
      speak(cmd.spoken);

      // Narrate the work as it lands.
      cmd.steps.forEach((_, i) => {
        later(() => {
          setActions((p) => p.map((a) => (a.id === entry.id ? { ...a, done: i + 1 } : a)));
        }, 480 + i * 620);
      });
      // Once the work is visible, get out of the way so the screen shows.
      later(() => setDocked(true), 520 + cmd.steps.length * 620);
    }, 420);
  }, [onCommand, onFallback, speak, stopRecognition]);

  /* ── Speech recognition wiring ── */
  useEffect(() => {
    if (!open || !SpeechRec) return;
    const rec = new SpeechRec();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onresult = (e) => {
      let live = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) {
          const t = r[0].transcript.trim();
          if (t) handleUtterance(t);
          live = "";
        } else {
          live += r[0].transcript;
        }
      }
      setInterim(live);
    };
    rec.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        setMicError("Microphone blocked — allow mic access, or type below to drive Milton by text.");
        listenRef.current = false;
        setPhase("idle");
      }
    };
    rec.onend = () => {
      if (listenRef.current && !busyRef.current) {
        try { rec.start(); } catch {}
      }
    };

    recRef.current = rec;
    listenRef.current = true;
    try { rec.start(); setPhase("listening"); } catch {}

    return () => {
      listenRef.current = false;
      try { rec.onend = null; rec.stop(); } catch {}
      recRef.current = null;
    };
  }, [open, handleUtterance]);

  /* ── Mic capture for the ring ── */
  useEffect(() => {
    if (!open || typeof navigator === "undefined" || !navigator.mediaDevices) return;
    let cancelled = false;
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        const Ctx = window.AudioContext || window.webkitAudioContext;
        const ctx = new Ctx();
        audioCtxRef.current = ctx;
        const src = ctx.createMediaStreamSource(stream);
        const an = ctx.createAnalyser();
        an.fftSize = 1024;
        an.smoothingTimeConstant = 0.6;
        src.connect(an);
        setAnalyser(an);
      })
      .catch(() => {
        setMicError("Microphone blocked — allow mic access, or type below to drive Milton by text.");
      });
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      audioCtxRef.current?.close?.();
      audioCtxRef.current = null;
      setAnalyser(null);
    };
  }, [open]);

  /* ── Reset + teardown ── */
  useEffect(() => {
    if (open) return;
    clearTimers();
    busyRef.current = false;
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    setPhase("idle"); setInterim(""); setLog([]); setActions([]); setDocked(false); setMicError(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const esc = (e) => { if (e.key === "Escape") { if (docked) onClose(); else setDocked(true); } };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open, docked, onClose]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [log, actions, interim]);

  if (!open) return null;

  const label =
    phase === "listening" ? "Listening" :
    phase === "thinking" ? "Thinking" :
    phase === "executing" ? "Working" :
    phase === "speaking" ? "Milton is speaking" : "Ready";

  const submitTyped = () => {
    const t = typed.trim();
    if (!t) return;
    setTyped("");
    handleUtterance(t);
  };

  const current = actions[actions.length - 1];

  /* ─────────── Docked bar: Milton stays live while the coach
                 watches the canvas do the work. ─────────── */
  if (docked) {
    return (
      <div style={{
        position: "fixed", left: "50%", bottom: 22, transform: "translateX(-50%)",
        zIndex: 4000, fontFamily: font,
        display: "flex", alignItems: "center", gap: 14,
        padding: "10px 12px 10px 18px", borderRadius: 999,
        background: `linear-gradient(135deg, ${INK}, ${INK_2})`,
        border: `1px solid ${HAIR}`,
        boxShadow: "0 18px 44px rgba(8,32,30,0.4)",
        maxWidth: "min(760px, calc(100vw - 40px))",
        animation: "vmDock 0.36s cubic-bezier(0.22,1,0.36,1)",
      }}>
        <style>{`@keyframes vmDock{from{opacity:0;transform:translate(-50%,16px)}to{opacity:1;transform:translate(-50%,0)}}
          @keyframes vmPulse{0%,100%{opacity:.5}50%{opacity:1}}`}</style>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <span style={{
            width: 7, height: 7, borderRadius: "50%",
            background: phase === "speaking" ? SAGE : MINT,
            animation: "vmPulse 1.4s ease-in-out infinite",
          }} />
          <span style={{ fontSize: 11, letterSpacing: 0.9, textTransform: "uppercase", color: MINT, fontWeight: 600 }}>
            {label}
          </span>
        </div>
        <MiniLevels analyser={analyser} phase={phase} />
        <div style={{ flex: 1, minWidth: 0, fontSize: 13, color: PAPER, lineHeight: 1.4 }}>
          <span style={{ opacity: interim ? 1 : 0.72 }}>
            {interim ||
              (current && current.done < current.steps.length ? current.steps[current.done] : null) ||
              [...log].reverse().find((l) => l.role === "coach")?.text ||
              "Keep talking — I'm still listening."}
          </span>
        </div>
        <button onClick={() => setDocked(false)} style={pill(false)}>Expand</button>
        <button onClick={onClose} style={pill(true)} aria-label="Exit voice mode">End</button>
      </div>
    );
  }

  /* ─────────── Full voice studio ─────────── */
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 4000, fontFamily: font,
      background: "radial-gradient(120% 90% at 22% 12%, rgba(13,44,41,0.97), rgba(8,32,30,0.99))",
      backdropFilter: "blur(3px)",
      display: "flex", flexDirection: "column",
      animation: "vmIn 0.3s ease",
    }}>
      <style>{`
        @keyframes vmIn{from{opacity:0}to{opacity:1}}
        @keyframes vmRise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes vmPulse{0%,100%{opacity:.45}50%{opacity:1}}
        @keyframes vmTick{from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:translateX(0)}}
        .vm-scroll::-webkit-scrollbar{width:5px}
        .vm-scroll::-webkit-scrollbar-thumb{background:rgba(92,219,149,0.22);border-radius:9px}
        .vm-chip:hover{background:rgba(92,219,149,0.14)!important;border-color:rgba(92,219,149,0.5)!important}
      `}</style>

      {/* Header */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 26px", borderBottom: `1px solid ${HAIR}`, flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <span style={{
            width: 8, height: 8, borderRadius: "50%", background: MINT,
            animation: "vmPulse 1.5s ease-in-out infinite",
          }} />
          <span style={{ fontSize: 12, letterSpacing: 1.4, textTransform: "uppercase", color: MINT, fontWeight: 600 }}>
            Milton Voice
          </span>
          <span style={{ fontSize: 12, color: MUTED }}>· hands-free control</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <button onClick={() => setMuted((m) => !m)} style={pill(false)}>
            {muted ? "Voice off" : "Voice on"}
          </button>
          <button onClick={() => setDocked(true)} style={pill(false)}>Minimise</button>
          <button onClick={onClose} style={pill(true)}>Exit voice mode</button>
        </div>
      </header>

      <div style={{
        flex: 1, minHeight: 0, display: "flex", gap: 0,
      }}>
        {/* ── Left: the ring, the live transcript, the mic ── */}
        <div style={{
          flex: "1 1 58%", minWidth: 0, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 26, padding: "22px 34px",
        }}>
          <div style={{ position: "relative", display: "grid", placeItems: "center" }}>
            <VoiceRing analyser={analyser} phase={phase} size={232} />
            <div style={{ position: "absolute", textAlign: "center" }}>
              <div style={{ fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", color: MINT, fontWeight: 600 }}>
                {label}
              </div>
              <div style={{ marginTop: 5, fontSize: 12, color: MUTED }}>
                {phase === "listening" ? "just talk" : phase === "speaking" ? "" : "one moment"}
              </div>
            </div>
          </div>

          {/* Live utterance */}
          <div style={{ minHeight: 62, maxWidth: 560, textAlign: "center" }}>
            <p style={{
              margin: 0, fontSize: 25, lineHeight: 1.35, fontWeight: 500,
              color: interim ? PAPER : "rgba(242,247,245,0.34)",
              textWrap: "balance",
            }}>
              {interim ||
                [...log].reverse().find((l) => l.role === "coach")?.text ||
                (micError ? "" : "\u201cLaunch a 6-week shred challenge at $199\u201d")}
            </p>
          </div>

          {micError && (
            <p style={{ margin: 0, fontSize: 12.5, color: "#ffb4a8", maxWidth: 460, textAlign: "center", lineHeight: 1.5 }}>
              {micError}
            </p>
          )}
          {!SpeechRec && (
            <p style={{ margin: 0, fontSize: 12.5, color: "#ffb4a8", maxWidth: 460, textAlign: "center", lineHeight: 1.5 }}>
              This browser has no speech recognition. Use Chrome or Edge for voice — or type below, everything else works the same.
            </p>
          )}

          {/* Typed fallback so the demo never stalls */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8, width: "min(520px, 100%)",
            background: "rgba(242,247,245,0.06)", border: `1px solid ${HAIR}`,
            borderRadius: 999, padding: "9px 9px 9px 17px",
          }}>
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.nativeEvent.isComposing && e.keyCode !== 229) { e.preventDefault(); submitTyped(); }
              }}
              placeholder="…or type a command"
              style={{
                flex: 1, background: "transparent", border: "none", outline: "none",
                color: PAPER, fontSize: 13.5, fontFamily: font,
              }}
            />
            <button onClick={submitTyped} style={{
              width: 30, height: 30, borderRadius: "50%", border: "none",
              background: typed.trim() ? MINT : "rgba(242,247,245,0.12)",
              color: INK, cursor: typed.trim() ? "pointer" : "default",
              display: "grid", placeItems: "center", flexShrink: 0,
            }} aria-label="Send command">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                <line x1="12" y1="19" x2="12" y2="5" /><polyline points="5,12 12,5 19,12" />
              </svg>
            </button>
          </div>

          {/* Spoken prompt chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, justifyContent: "center", maxWidth: 600 }}>
            {VOICE_SUGGESTIONS.map((s) => (
              <button key={s} className="vm-chip" onClick={() => handleUtterance(s)} style={{
                padding: "7px 13px", borderRadius: 999, cursor: "pointer",
                background: "rgba(242,247,245,0.05)", border: `1px solid ${HAIR}`,
                color: "rgba(242,247,245,0.8)", fontSize: 12.5, fontFamily: font,
                transition: "all 0.15s ease",
              }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* ── Right: what Milton is actually doing ── */}
        <aside className="vm-scroll" style={{
          flex: "0 0 384px", minWidth: 0, borderLeft: `1px solid ${HAIR}`,
          padding: "22px 24px", overflowY: "auto",
          background: "rgba(8,32,30,0.5)",
        }}>
          <div style={{
            fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase",
            color: MUTED, fontWeight: 600, marginBottom: 16,
          }}>
            Live actions
          </div>

          {actions.length === 0 && log.length === 0 && (
            <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.7 }}>
              Talk to Milton the way you'd talk to a front-desk manager who never
              leaves. Launch an offer, work the lead queue, clear the inbox, move a
              session — he does the work and the screen follows.
            </div>
          )}

          {actions.map((a) => (
            <div key={a.id} style={{
              marginBottom: 16, padding: "14px 15px", borderRadius: 13,
              background: "rgba(242,247,245,0.045)", border: `1px solid ${HAIR}`,
              animation: "vmRise 0.3s ease",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 11 }}>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: PAPER }}>{a.title}</span>
                <span style={{ fontSize: 11, color: a.done >= a.steps.length ? MINT : MUTED, fontWeight: 600 }}>
                  {a.done >= a.steps.length ? "Done" : `${a.done}/${a.steps.length}`}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {a.steps.map((s, i) => {
                  const complete = i < a.done;
                  const active = i === a.done;
                  return (
                    <div key={s} style={{
                      display: "flex", gap: 9, alignItems: "flex-start",
                      opacity: complete ? 1 : active ? 0.9 : 0.34,
                      animation: complete ? "vmTick 0.28s ease" : "none",
                    }}>
                      <span style={{
                        width: 15, height: 15, borderRadius: "50%", flexShrink: 0, marginTop: 1,
                        display: "grid", placeItems: "center",
                        background: complete ? MINT : "transparent",
                        border: complete ? "none" : `1.5px solid ${active ? MINT : "rgba(242,247,245,0.28)"}`,
                        animation: active ? "vmPulse 1.2s ease-in-out infinite" : "none",
                      }}>
                        {complete && (
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="3.4" strokeLinecap="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </span>
                      <span style={{ fontSize: 12.5, lineHeight: 1.45, color: complete ? PAPER : "rgba(242,247,245,0.72)" }}>
                        {s}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Turn-by-turn transcript */}
          {log.length > 0 && (
            <>
              <div style={{
                fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase",
                color: MUTED, fontWeight: 600, margin: "22px 0 13px",
              }}>
                Transcript
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {log.map((l, i) => (
                  <div key={i} style={{ animation: "vmRise 0.26s ease" }}>
                    <div style={{
                      fontSize: 10.5, letterSpacing: 0.8, textTransform: "uppercase",
                      color: l.role === "coach" ? "rgba(242,247,245,0.42)" : MINT,
                      fontWeight: 600, marginBottom: 4,
                    }}>
                      {l.role === "coach" ? "You" : "Milton"}
                    </div>
                    <div style={{ fontSize: 12.5, lineHeight: 1.55, color: "rgba(242,247,245,0.86)" }}>
                      {l.text}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          <div ref={logEndRef} />
        </aside>
      </div>
    </div>
  );
}

function pill(strong) {
  return {
    padding: "7px 14px", borderRadius: 999, cursor: "pointer",
    fontSize: 12, fontWeight: 600, fontFamily: font,
    background: strong ? MINT : "rgba(242,247,245,0.07)",
    color: strong ? INK : "rgba(242,247,245,0.82)",
    border: strong ? "none" : `1px solid ${HAIR}`,
    whiteSpace: "nowrap",
    transition: "all 0.15s ease",
  };
}
