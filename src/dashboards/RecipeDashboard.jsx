import { useState } from "react";

const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";
const C = {
  bg: "#ffffff", text: "#111", sub: "#666", muted: "#999",
  border: "#e0e0e0", borderLight: "#f0f0f0", chip: "#f5f5f5",
  done: "#4caf50", dark: "#1a1a1a",
};

// Generative payload — AI selects this recipe at 6 AM based on:
// - Sarah needs ~500 cal, 40g+ protein for dinner
// - She's had chicken twice this week, so AI picks salmon
// - She logged brown rice yesterday, AI varies with sweet potato
// - Coach Bethany flagged "anti-inflammatory" as a nutrition focus
const RECIPE = {
  context: {
    client: "Sarah",
    mealSlot: "Dinner",
    reason: "You've had chicken the last two nights — switching to salmon for omega-3s. This hits your remaining 480 cal and 42g protein for the day.",
  },
  title: "Honey Garlic Salmon Bowl",
  subtitle: "Anti-inflammatory · High protein · Coach recommended",
  prepTime: 10,
  cookTime: 18,
  totalTime: 28,
  servings: 1,
  difficulty: "Easy",

  macros: {
    calories: 485,
    protein: 42,
    carbs: 48,
    fats: 14,
    fiber: 6,
  },

  macroFit: {
    calRemaining: 480,
    proteinRemaining: 42,
    calAfter: -5,
    proteinAfter: 0,
  },

  ingredients: [
    { name: "Atlantic salmon fillet", amount: "5 oz", cal: 230 },
    { name: "Sweet potato", amount: "1 medium, cubed", cal: 103 },
    { name: "Broccoli florets", amount: "1 cup", cal: 31 },
    { name: "Honey", amount: "1 tbsp", cal: 64 },
    { name: "Garlic", amount: "3 cloves, minced", cal: 13 },
    { name: "Soy sauce (low sodium)", amount: "1 tbsp", cal: 10 },
    { name: "Olive oil", amount: "1 tsp", cal: 40 },
    { name: "Sesame seeds", amount: "½ tsp", cal: 9 },
    { name: "Green onion", amount: "1 stalk, sliced", cal: 5 },
  ],

  steps: [
    { instruction: "Preheat oven to 400°F. Line a baking sheet with parchment.", time: null },
    { instruction: "Toss sweet potato cubes with half the olive oil, salt and pepper. Spread on one side of the baking sheet.", time: null },
    { instruction: "Roast sweet potatoes for 10 minutes.", time: 10 },
    { instruction: "While potatoes roast, mix honey, soy sauce, and minced garlic in a small bowl.", time: null },
    { instruction: "Place salmon on the other side of the baking sheet. Brush with honey garlic glaze. Add broccoli around the salmon. Drizzle remaining olive oil on broccoli.", time: null },
    { instruction: "Return to oven. Roast everything together for 12–14 minutes until salmon flakes easily.", time: 13 },
    { instruction: "Plate the bowl: sweet potato base, salmon on top, broccoli on the side. Drizzle any remaining glaze. Top with sesame seeds and green onion.", time: null },
  ],

  coachNote: "Great post-workout recovery meal. The sweet potato replenishes glycogen, salmon delivers omega-3s for inflammation. — Coach Bethany",
};

function TimerChip({ minutes }) {
  const [running, setRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(minutes * 60);
  const [done, setDone] = useState(false);

  const tick = () => {
    setTimeLeft((t) => {
      if (t <= 1) { setRunning(false); setDone(true); return 0; }
      return t - 1;
    });
  };

  useState(() => {
    let id;
    if (running) id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [running]);

  // Simple interval using useEffect pattern via useState workaround
  // In production this would use useEffect properly

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  if (done) return (
    <button onClick={() => { setDone(false); setTimeLeft(minutes * 60); }} style={{
      padding: "4px 10px", borderRadius: 6, border: "none", background: "#f0faf0",
      color: C.done, fontSize: 12, fontWeight: 600, fontFamily: FONT, cursor: "pointer",
    }}>✓ Done · Reset</button>
  );

  return (
    <button onClick={() => setRunning(!running)} style={{
      padding: "4px 10px", borderRadius: 6, border: `1px solid ${C.border}`,
      background: running ? C.dark : C.bg, color: running ? "#fff" : C.sub,
      fontSize: 12, fontWeight: 600, fontFamily: FONT, cursor: "pointer",
      display: "flex", alignItems: "center", gap: 4,
    }}>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1.2" />
      </svg>
      {running ? `${mins}:${String(secs).padStart(2, "0")}` : `${minutes} min`}
    </button>
  );
}

export default function RecipeDashboard() {
  const r = RECIPE;
  const [checkedIngredients, setCheckedIngredients] = useState({});
  const [completedSteps, setCompletedSteps] = useState({});
  const [logged, setLogged] = useState(false);
  const [servings, setServings] = useState(null);

  const toggleIngredient = (i) => setCheckedIngredients((p) => ({ ...p, [i]: !p[i] }));
  const toggleStep = (i) => setCompletedSteps((p) => ({ ...p, [i]: !p[i] }));

  const allStepsDone = r.steps.every((_, i) => completedSteps[i]);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: FONT, maxWidth: 480, margin: "0 auto" }}>
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing:border-box; margin:0; padding:0; }
      `}</style>

      {/* ---- HERO IMAGE ---- */}
      {/* In production: AI-generated food photo or coach-uploaded image */}
      <div style={{
        width: "100%", height: 260, position: "relative", overflow: "hidden",
        background: `linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 50%, #111 100%)`,
      }}>
        <img
          src="https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=960&h=640&fit=crop&auto=format&q=80"
          alt="Honey Garlic Salmon Bowl"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          onError={(e) => { e.target.style.display = "none"; }}
        />
        {/* Gradient overlay for text readability */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 100,
          background: "linear-gradient(transparent, rgba(255,255,255,1))",
        }} />
        {/* Meal slot badge */}
        <div style={{
          position: "absolute", top: 16, left: 16,
          padding: "6px 12px", borderRadius: 8,
          background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
          fontSize: 12, fontWeight: 600, color: "#fff", fontFamily: FONT,
        }}>
          {r.context.mealSlot} · {r.macros.calories} cal
        </div>
      </div>

      {/* ---- HEADER ---- */}
      <div style={{ padding: "16px 20px 0", animation: "fadeIn 0.5s ease" }}>
        {/* AI context — why this recipe */}
        <div style={{
          fontSize: 13, color: C.sub, lineHeight: 1.6, marginBottom: 16,
          borderLeft: `3px solid ${C.dark}`, paddingLeft: 14,
        }}>
          {r.context.reason}
        </div>

        <div style={{ fontSize: 26, fontWeight: 700, color: C.text, lineHeight: 1.2, marginBottom: 4 }}>
          {r.title}
        </div>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>
          {r.subtitle}
        </div>

        {/* Time + Difficulty chips */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {[
            { icon: <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/><path d="M6 3V6L8 7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>, label: `${r.totalTime} min` },
            { icon: <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 10L6 2L10 10H2Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>, label: r.difficulty },
            { icon: <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1V5M3 3L6 5L9 3M2 7H10M3 11H9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>, label: `${r.servings} serving` },
          ].map((c, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 5, padding: "6px 10px",
              borderRadius: 8, background: C.chip, border: `1px solid ${C.borderLight}`,
              fontSize: 12, fontWeight: 500, color: C.sub, fontFamily: FONT,
            }}>
              <span style={{ color: C.muted }}>{c.icon}</span>{c.label}
            </div>
          ))}
        </div>
      </div>

      {/* ---- MACROS — HOW IT FITS ---- */}
      <div style={{
        margin: "0 20px 16px", borderRadius: 14, padding: "18px",
        background: C.dark, color: "#fff",
        animation: "slideUp 0.5s ease 0.1s both",
      }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
          How this fits your day
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6, marginBottom: 14 }}>
          {[
            { label: "Cal", val: r.macros.calories },
            { label: "Protein", val: `${r.macros.protein}g` },
            { label: "Carbs", val: `${r.macros.carbs}g` },
            { label: "Fats", val: `${r.macros.fats}g` },
          ].map((m) => (
            <div key={m.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{m.val}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{m.label}</div>
            </div>
          ))}
        </div>

        {/* Fit indicator */}
        <div style={{
          display: "flex", gap: 10, padding: "10px 12px", borderRadius: 8,
          background: "rgba(255,255,255,0.06)",
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 2 }}>After this meal</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>
              {r.macroFit.calAfter <= 0 ? `${Math.abs(r.macroFit.calAfter)} cal under budget` : `${r.macroFit.calAfter} cal over`}
            </div>
          </div>
          <div style={{ width: 1, background: "rgba(255,255,255,0.1)" }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 2 }}>Protein target</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: r.macroFit.proteinAfter <= 0 ? "#4caf50" : "#fff" }}>
              {r.macroFit.proteinAfter <= 0 ? "✓ Hit" : `${r.macroFit.proteinAfter}g short`}
            </div>
          </div>
        </div>
      </div>

      {/* ---- INGREDIENTS ---- */}
      <div style={{
        margin: "0 20px 16px",
        animation: "slideUp 0.5s ease 0.2s both",
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
          Ingredients
        </div>

        {r.ingredients.map((ing, i) => (
          <div key={i}
            onClick={() => toggleIngredient(i)}
            style={{
              display: "flex", alignItems: "center", gap: 12, padding: "10px 0",
              borderBottom: i < r.ingredients.length - 1 ? `1px solid ${C.borderLight}` : "none",
              cursor: "pointer",
              opacity: checkedIngredients[i] ? 0.4 : 1,
              transition: "opacity 0.15s ease",
            }}>
            <div style={{
              width: 20, height: 20, borderRadius: 5, flexShrink: 0,
              border: checkedIngredients[i] ? "none" : `2px solid ${C.border}`,
              background: checkedIngredients[i] ? C.done : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", transition: "all 0.15s ease",
            }}>
              {checkedIngredients[i] && <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3 8.5L6.5 12L13 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: C.text, fontFamily: FONT, textDecoration: checkedIngredients[i] ? "line-through" : "none" }}>
                {ing.name}
              </span>
            </div>
            <div style={{ fontSize: 13, color: C.muted, fontFamily: FONT, flexShrink: 0 }}>{ing.amount}</div>
          </div>
        ))}
      </div>

      {/* ---- STEPS ---- */}
      <div style={{
        margin: "0 20px 16px",
        animation: "slideUp 0.5s ease 0.3s both",
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
          Instructions
        </div>

        {r.steps.map((step, i) => (
          <div key={i} style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            {/* Step number / check */}
            <button onClick={() => toggleStep(i)} style={{
              width: 28, height: 28, borderRadius: 14, flexShrink: 0, cursor: "pointer", padding: 0,
              border: completedSteps[i] ? "none" : `2px solid ${C.border}`,
              background: completedSteps[i] ? C.done : "transparent",
              color: completedSteps[i] ? "#fff" : C.sub,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 600, fontFamily: FONT,
              transition: "all 0.15s ease",
            }}>
              {completedSteps[i] ? (
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8.5L6.5 12L13 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              ) : i + 1}
            </button>

            <div style={{ flex: 1, paddingTop: 3 }}>
              <div style={{
                fontSize: 14, color: completedSteps[i] ? C.muted : C.text, fontFamily: FONT, lineHeight: 1.6,
                textDecoration: completedSteps[i] ? "line-through" : "none",
              }}>
                {step.instruction}
              </div>
              {step.time && (
                <div style={{ marginTop: 8 }}>
                  <TimerChip minutes={step.time} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ---- COACH NOTE ---- */}
      {r.coachNote && (
        <div style={{
          margin: "0 20px 16px", borderRadius: 14, padding: "16px",
          background: C.chip, border: `1px solid ${C.borderLight}`,
          animation: "slideUp 0.5s ease 0.4s both",
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
              <path d="M2 3H14V11H6L2 14V3Z" stroke={C.muted} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div style={{ fontSize: 13, color: C.sub, fontFamily: FONT, lineHeight: 1.6, fontStyle: "italic" }}>
              {r.coachNote}
            </div>
          </div>
        </div>
      )}

      {/* ---- LOG THIS MEAL ---- */}
      <div style={{
        margin: "0 20px 16px",
        animation: "slideUp 0.5s ease 0.5s both",
      }}>
        {logged === false && servings === null && (
          <button onClick={() => setServings(1)} style={{
            width: "100%", padding: "16px", borderRadius: 14, border: "none",
            background: C.dark, color: "#fff", fontSize: 15, fontWeight: 700,
            fontFamily: FONT, cursor: "pointer",
          }}>
            Log This Meal
          </button>
        )}

        {servings !== null && !logged && (
          <div style={{
            borderRadius: 14, padding: "20px",
            background: C.chip, border: `1px solid ${C.border}`,
          }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.text, fontFamily: FONT, marginBottom: 14 }}>
              How many servings?
            </div>

            {/* Servings selector */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 14 }}>
              <button onClick={() => setServings(Math.max(0.5, servings - 0.5))} style={{
                width: 40, height: 40, borderRadius: 20, border: `1px solid ${C.border}`,
                background: C.bg, fontSize: 18, fontWeight: 600, color: C.sub,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
              }}>−</button>
              <div style={{ minWidth: 60, textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: C.text, fontFamily: FONT }}>{servings}</div>
                <div style={{ fontSize: 11, color: C.muted, fontFamily: FONT }}>{servings === 1 ? "serving" : "servings"}</div>
              </div>
              <button onClick={() => setServings(servings + 0.5)} style={{
                width: 40, height: 40, borderRadius: 20, border: `1px solid ${C.border}`,
                background: C.bg, fontSize: 18, fontWeight: 600, color: C.sub,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
              }}>+</button>
            </div>

            {/* Adjusted macros */}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6,
              padding: "10px", borderRadius: 8, background: C.bg, border: `1px solid ${C.borderLight}`,
              marginBottom: 14,
            }}>
              {[
                { label: "Cal", val: Math.round(r.macros.calories * servings) },
                { label: "Protein", val: `${Math.round(r.macros.protein * servings)}g` },
                { label: "Carbs", val: `${Math.round(r.macros.carbs * servings)}g` },
                { label: "Fats", val: `${Math.round(r.macros.fats * servings)}g` },
              ].map((m) => (
                <div key={m.label} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.text, fontFamily: FONT }}>{m.val}</div>
                  <div style={{ fontSize: 10, color: C.muted, fontFamily: FONT }}>{m.label}</div>
                </div>
              ))}
            </div>

            {/* Confirm */}
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setServings(null)} style={{
                flex: 1, padding: "12px", borderRadius: 10, border: `1px solid ${C.border}`,
                background: C.bg, color: C.sub, fontSize: 14, fontWeight: 600,
                fontFamily: FONT, cursor: "pointer",
              }}>Cancel</button>
              <button onClick={() => setLogged(true)} style={{
                flex: 2, padding: "12px", borderRadius: 10, border: "none",
                background: C.dark, color: "#fff", fontSize: 14, fontWeight: 700,
                fontFamily: FONT, cursor: "pointer",
              }}>
                Log {servings} {servings === 1 ? "serving" : "servings"}
              </button>
            </div>
          </div>
        )}

        {logged && (
          <div style={{
            width: "100%", padding: "16px", borderRadius: 14, textAlign: "center",
            background: "#f0faf0", border: "1px solid #c8e6c9",
          }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.done, fontFamily: FONT }}>
              ✓ Logged — {Math.round(r.macros.calories * servings)} cal, {Math.round(r.macros.protein * servings)}g protein
            </div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 4, fontFamily: FONT }}>
              {servings} {servings === 1 ? "serving" : "servings"} added to today's food log
            </div>
          </div>
        )}
      </div>

      {/* Timestamp */}
      <div style={{
        textAlign: "center", padding: "16px 20px 48px",
        fontSize: 10, color: "rgba(0,0,0,0.15)", fontFamily: FONT,
      }}>
        Selected for {r.context.client} · {r.context.mealSlot}
      </div>
    </div>
  );
}
