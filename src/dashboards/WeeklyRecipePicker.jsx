import { useState, useRef } from "react";

const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";
const C = {
  bg: "#ffffff", text: "#111", sub: "#666", muted: "#999",
  border: "#e0e0e0", borderLight: "#f0f0f0", chip: "#f5f5f5",
  done: "#4caf50", dark: "#1a1a1a", red: "#e53935",
};

const MEAL_SLOTS = ["Breakfast", "Lunch", "Dinner", "Snack", "Dessert"];

// Coach curated + AI recommended batch for the week
const WEEKLY_RECIPES = {
  clientName: "Sarah",
  week: "April 7–13",
  coachMessage: "Here are your picks for the week. Swipe right on the ones that look good — skip anything that doesn't fit. No pressure to fill every slot.",
  slots: {
    Breakfast: [
      { id: "b1", title: "Overnight Oats with Berries", time: 5, cal: 340, protein: 22, carbs: 48, fats: 8, reason: "Quick no-cook option for training mornings", image: "https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=600&h=400&fit=crop&auto=format&q=80", tags: ["Meal prep", "High fiber"] },
      { id: "b2", title: "Egg White Veggie Scramble", time: 12, cal: 290, protein: 32, carbs: 12, fats: 10, reason: "High protein, low carb — pairs with toast if you want carbs", image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&h=400&fit=crop&auto=format&q=80", tags: ["High protein", "Quick"] },
      { id: "b3", title: "Protein Pancakes", time: 15, cal: 380, protein: 28, carbs: 42, fats: 10, reason: "Weekend treat that still hits macros", image: "https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=600&h=400&fit=crop&auto=format&q=80", tags: ["Weekend", "Kid-friendly"] },
      { id: "b4", title: "Greek Yogurt Parfait", time: 3, cal: 310, protein: 26, carbs: 38, fats: 6, reason: "Zero cook time, high protein", image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&h=400&fit=crop&auto=format&q=80", tags: ["No cook", "Fast"] },
    ],
    Lunch: [
      { id: "l1", title: "Chicken Caesar Lettuce Wraps", time: 10, cal: 420, protein: 38, carbs: 18, fats: 22, reason: "Low carb lunch, keeps you light for afternoon recovery", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop&auto=format&q=80", tags: ["Low carb", "Light"] },
      { id: "l2", title: "Turkey & Avocado Grain Bowl", time: 15, cal: 510, protein: 36, carbs: 52, fats: 16, reason: "Balanced macros, good sustained energy", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop&auto=format&q=80", tags: ["Balanced", "Filling"] },
      { id: "l3", title: "Tuna Poke Bowl", time: 12, cal: 440, protein: 34, carbs: 46, fats: 12, reason: "Omega-3s, light but satisfying", image: "https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?w=600&h=400&fit=crop&auto=format&q=80", tags: ["Anti-inflammatory", "Fresh"] },
    ],
    Dinner: [
      { id: "d1", title: "Honey Garlic Salmon Bowl", time: 28, cal: 485, protein: 42, carbs: 48, fats: 14, reason: "Omega-3s, anti-inflammatory — coach recommended", image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&h=400&fit=crop&auto=format&q=80", tags: ["Coach pick", "Anti-inflammatory"] },
      { id: "d2", title: "Lean Beef Stir Fry", time: 20, cal: 520, protein: 40, carbs: 44, fats: 18, reason: "Iron-rich, good for recovery weeks", image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&h=400&fit=crop&auto=format&q=80", tags: ["Iron-rich", "Recovery"] },
      { id: "d3", title: "Stuffed Bell Peppers", time: 35, cal: 460, protein: 35, carbs: 40, fats: 16, reason: "Meal prep friendly — make 4 for the week", image: "https://images.unsplash.com/photo-1601000938259-9e92002320b2?w=600&h=400&fit=crop&auto=format&q=80", tags: ["Meal prep", "Batch cook"] },
      { id: "d4", title: "Lemon Herb Chicken Thighs", time: 25, cal: 440, protein: 38, carbs: 22, fats: 20, reason: "Simple comfort food, solid protein", image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=600&h=400&fit=crop&auto=format&q=80", tags: ["Comfort", "Simple"] },
    ],
    Snack: [
      { id: "s1", title: "Apple & Almond Butter", time: 2, cal: 210, protein: 6, carbs: 28, fats: 10, reason: "Quick energy between sessions", image: "https://images.unsplash.com/photo-1568702846914-96b305d2ead1?w=600&h=400&fit=crop&auto=format&q=80", tags: ["Quick", "Pre-workout"] },
      { id: "s2", title: "Cottage Cheese & Pineapple", time: 2, cal: 180, protein: 20, carbs: 18, fats: 2, reason: "High protein, sweet craving fix", image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&h=400&fit=crop&auto=format&q=80", tags: ["High protein", "Sweet"] },
      { id: "s3", title: "Trail Mix (portioned)", time: 0, cal: 240, protein: 8, carbs: 22, fats: 14, reason: "Keep in your bag for busy days", image: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=600&h=400&fit=crop&auto=format&q=80", tags: ["Portable", "No prep"] },
    ],
    Dessert: [
      { id: "de1", title: "Protein Chocolate Mousse", time: 5, cal: 160, protein: 18, carbs: 14, fats: 4, reason: "Satisfies the sweet tooth, 18g protein", image: "https://images.unsplash.com/photo-1541783245831-57d6fb0926d3?w=600&h=400&fit=crop&auto=format&q=80", tags: ["High protein", "Guilt-free"] },
      { id: "de2", title: "Frozen Yogurt Bark", time: 5, cal: 140, protein: 10, carbs: 20, fats: 3, reason: "Make a batch Sunday, break off pieces all week", image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&h=400&fit=crop&auto=format&q=80", tags: ["Meal prep", "Fun"] },
    ],
  },
};

function RecipeCard({ recipe, onSave, onSkip, isTop }) {
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);

  const handleStart = (clientX) => {
    startX.current = clientX;
    setDragging(true);
  };
  const handleMove = (clientX) => {
    if (!dragging) return;
    currentX.current = clientX - startX.current;
    setDragX(currentX.current);
  };
  const handleEnd = () => {
    if (!dragging) return;
    setDragging(false);
    if (currentX.current > 80) { onSave(); }
    else if (currentX.current < -80) { onSkip(); }
    setDragX(0);
    currentX.current = 0;
  };

  const rotation = dragX * 0.05;
  const opacity = Math.max(0, 1 - Math.abs(dragX) / 300);
  const saveIndicator = dragX > 30 ? Math.min((dragX - 30) / 50, 1) : 0;
  const skipIndicator = dragX < -30 ? Math.min((-dragX - 30) / 50, 1) : 0;

  return (
    <div
      onMouseDown={(e) => handleStart(e.clientX)}
      onMouseMove={(e) => handleMove(e.clientX)}
      onMouseUp={handleEnd}
      onMouseLeave={() => { if (dragging) handleEnd(); }}
      onTouchStart={(e) => handleStart(e.touches[0].clientX)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
      onTouchEnd={handleEnd}
      style={{
        position: isTop ? "relative" : "absolute",
        top: isTop ? 0 : 4,
        left: isTop ? 0 : 4,
        right: isTop ? 0 : 4,
        width: isTop ? "100%" : "calc(100% - 8px)",
        transform: isTop ? `translateX(${dragX}px) rotate(${rotation}deg)` : "scale(0.97)",
        opacity: isTop ? opacity : 0.6,
        transition: dragging ? "none" : "transform 0.3s ease, opacity 0.3s ease",
        cursor: isTop ? "grab" : "default",
        userSelect: "none",
        zIndex: isTop ? 2 : 1,
        borderRadius: 16,
        overflow: "hidden",
        background: C.bg,
        border: `1px solid ${C.borderLight}`,
        boxShadow: isTop ? "0 4px 20px rgba(0,0,0,0.08)" : "none",
      }}
    >
      {/* Save / Skip indicators */}
      {isTop && saveIndicator > 0 && (
        <div style={{
          position: "absolute", top: 16, left: 16, zIndex: 10,
          padding: "8px 16px", borderRadius: 8, border: `3px solid ${C.done}`,
          color: C.done, fontSize: 18, fontWeight: 800, fontFamily: FONT,
          transform: `rotate(-15deg) scale(${0.8 + saveIndicator * 0.2})`,
          opacity: saveIndicator,
        }}>SAVE</div>
      )}
      {isTop && skipIndicator > 0 && (
        <div style={{
          position: "absolute", top: 16, right: 16, zIndex: 10,
          padding: "8px 16px", borderRadius: 8, border: `3px solid ${C.red}`,
          color: C.red, fontSize: 18, fontWeight: 800, fontFamily: FONT,
          transform: `rotate(15deg) scale(${0.8 + skipIndicator * 0.2})`,
          opacity: skipIndicator,
        }}>SKIP</div>
      )}

      {/* Image */}
      <div style={{ width: "100%", height: 200, background: C.chip, position: "relative" }}>
        <img src={recipe.image} alt={recipe.title}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          onError={(e) => { e.target.style.display = "none"; }}
        />
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 60,
          background: "linear-gradient(transparent, rgba(0,0,0,0.5))",
        }} />
        <div style={{
          position: "absolute", bottom: 10, left: 14,
          display: "flex", gap: 6,
        }}>
          {recipe.tags.map((t) => (
            <span key={t} style={{
              padding: "3px 8px", borderRadius: 5, fontSize: 10, fontWeight: 600,
              background: "rgba(255,255,255,0.2)", color: "#fff", fontFamily: FONT,
              backdropFilter: "blur(4px)",
            }}>{t}</span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "16px 18px 18px" }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: C.text, fontFamily: FONT, lineHeight: 1.2, marginBottom: 4 }}>
          {recipe.title}
        </div>
        <div style={{ fontSize: 13, color: C.sub, fontFamily: FONT, lineHeight: 1.5, marginBottom: 14 }}>
          {recipe.reason}
        </div>

        {/* Macros row */}
        <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
          {[
            { label: "Cal", val: recipe.cal },
            { label: "P", val: `${recipe.protein}g` },
            { label: "C", val: `${recipe.carbs}g` },
            { label: "F", val: `${recipe.fats}g` },
            { label: "Time", val: `${recipe.time}m` },
          ].map((m) => (
            <div key={m.label} style={{ textAlign: "center", flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.text, fontFamily: FONT }}>{m.val}</div>
              <div style={{ fontSize: 10, color: C.muted, fontFamily: FONT }}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function WeeklyRecipePicker() {
  const data = WEEKLY_RECIPES;
  const [currentSlotIdx, setCurrentSlotIdx] = useState(0);
  const [cardIndices, setCardIndices] = useState(
    Object.fromEntries(MEAL_SLOTS.map((s) => [s, 0]))
  );
  const [saved, setSaved] = useState(
    Object.fromEntries(MEAL_SLOTS.map((s) => [s, []]))
  );
  const [showSummary, setShowSummary] = useState(false);

  const currentSlot = MEAL_SLOTS[currentSlotIdx];
  const recipes = data.slots[currentSlot] || [];
  const cardIdx = cardIndices[currentSlot];
  const isDone = cardIdx >= recipes.length;
  const allSlotsDone = MEAL_SLOTS.every((s) => cardIndices[s] >= (data.slots[s]?.length || 0));

  const advance = () => {
    const next = { ...cardIndices, [currentSlot]: cardIdx + 1 };
    setCardIndices(next);
    // Auto-advance to next slot when done
    if (next[currentSlot] >= recipes.length && currentSlotIdx < MEAL_SLOTS.length - 1) {
      setTimeout(() => setCurrentSlotIdx(currentSlotIdx + 1), 400);
    }
    if (MEAL_SLOTS.every((s) => next[s] >= (data.slots[s]?.length || 0))) {
      setTimeout(() => setShowSummary(true), 500);
    }
  };

  const handleSave = () => {
    setSaved((p) => ({ ...p, [currentSlot]: [...p[currentSlot], recipes[cardIdx]] }));
    advance();
  };
  const handleSkip = () => advance();

  const totalSaved = Object.values(saved).flat().length;

  if (showSummary) {
    const totalCal = Object.values(saved).flat().reduce((a, r) => a + r.cal, 0);
    const totalProtein = Object.values(saved).flat().reduce((a, r) => a + r.protein, 0);
    return (
      <div style={{ minHeight: "100vh", background: C.bg, fontFamily: FONT, maxWidth: 480, margin: "0 auto" }}>
        <style>{`
          @keyframes fadeIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
          * { box-sizing:border-box; margin:0; padding:0; }
        `}</style>
        <div style={{ padding: "52px 20px 20px", animation: "fadeIn 0.5s ease" }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: C.text, marginBottom: 4 }}>Your Week</div>
          <div style={{ fontSize: 14, color: C.muted, marginBottom: 20 }}>{data.week} · {totalSaved} recipes saved</div>

          {MEAL_SLOTS.map((slot) => {
            const items = saved[slot];
            if (items.length === 0) return null;
            return (
              <div key={slot} style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>{slot}</div>
                {items.map((r) => (
                  <div key={r.id} style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
                    background: C.chip, borderRadius: 10, marginBottom: 6, border: `1px solid ${C.borderLight}`,
                  }}>
                    <img src={r.image} alt="" style={{ width: 48, height: 48, borderRadius: 8, objectFit: "cover" }}
                      onError={(e) => { e.target.style.display = "none"; }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: C.text, fontFamily: FONT }}>{r.title}</div>
                      <div style={{ fontSize: 12, color: C.muted, fontFamily: FONT }}>{r.cal} cal · {r.protein}g protein · {r.time}m</div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}

          {/* Weekly totals */}
          <div style={{
            background: C.dark, borderRadius: 14, padding: "18px", marginBottom: 16,
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
              If you cook all {totalSaved}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#fff" }}>{totalCal.toLocaleString()}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>total calories</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#fff" }}>{totalProtein}g</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>total protein</div>
              </div>
            </div>
          </div>

          <button onClick={() => { setShowSummary(false); }} style={{
            width: "100%", padding: "14px", borderRadius: 12, border: `1px solid ${C.border}`,
            background: C.bg, color: C.sub, fontSize: 14, fontWeight: 600,
            fontFamily: FONT, cursor: "pointer", marginBottom: 8,
          }}>Edit Picks</button>

          <button style={{
            width: "100%", padding: "14px", borderRadius: 12, border: "none",
            background: C.dark, color: "#fff", fontSize: 15, fontWeight: 700,
            fontFamily: FONT, cursor: "pointer",
          }}>Confirm My Week</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: FONT, maxWidth: 480, margin: "0 auto" }}>
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing:border-box; margin:0; padding:0; }
      `}</style>

      {/* Header */}
      <div style={{ padding: "48px 20px 12px" }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 2 }}>
          Meal Picks
        </div>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 12 }}>
          {data.week} · {totalSaved} saved
        </div>

        {/* Coach message */}
        <div style={{
          fontSize: 13, color: C.sub, lineHeight: 1.6, marginBottom: 16,
          borderLeft: `3px solid ${C.dark}`, paddingLeft: 14,
        }}>
          {data.coachMessage}
        </div>

        {/* Slot tabs */}
        <div style={{ display: "flex", gap: 4, overflowX: "auto" }}>
          {MEAL_SLOTS.map((slot, i) => {
            const slotDone = cardIndices[slot] >= (data.slots[slot]?.length || 0);
            const slotSaved = saved[slot].length;
            const active = i === currentSlotIdx;
            return (
              <button key={slot} onClick={() => setCurrentSlotIdx(i)} style={{
                padding: "8px 14px", borderRadius: 10, border: "none", cursor: "pointer",
                fontFamily: FONT, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap",
                background: active ? C.dark : slotDone ? C.chip : C.chip,
                color: active ? "#fff" : slotDone ? C.done : C.sub,
                transition: "all 0.15s ease",
                display: "flex", alignItems: "center", gap: 4,
              }}>
                {slotDone && slotSaved > 0 && (
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3 8.5L6.5 12L13 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                )}
                {slot}
                {slotSaved > 0 && <span style={{ opacity: 0.6 }}>({slotSaved})</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Card stack area */}
      <div style={{ padding: "12px 20px", minHeight: 420 }}>
        {!isDone ? (
          <div style={{ position: "relative" }}>
            {/* Next card (behind) */}
            {cardIdx + 1 < recipes.length && (
              <RecipeCard recipe={recipes[cardIdx + 1]} onSave={() => {}} onSkip={() => {}} isTop={false} />
            )}
            {/* Current card */}
            <RecipeCard recipe={recipes[cardIdx]} onSave={handleSave} onSkip={handleSkip} isTop={true} />
          </div>
        ) : (
          <div style={{ textAlign: "center", paddingTop: 60 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>
              {saved[currentSlot].length > 0 ? "✓" : "—"}
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 4 }}>
              {saved[currentSlot].length > 0
                ? `${saved[currentSlot].length} ${currentSlot.toLowerCase()} recipe${saved[currentSlot].length > 1 ? "s" : ""} saved`
                : `No ${currentSlot.toLowerCase()} recipes picked`
              }
            </div>
            <div style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>
              {currentSlotIdx < MEAL_SLOTS.length - 1 ? "Moving to the next category..." : "All done — review your picks below."}
            </div>
          </div>
        )}
      </div>

      {/* Action buttons (for accessibility — not everyone swipes) */}
      {!isDone && (
        <div style={{ display: "flex", justifyContent: "center", gap: 20, padding: "0 20px 20px" }}>
          <button onClick={handleSkip} style={{
            width: 56, height: 56, borderRadius: 28, border: `2px solid ${C.border}`,
            background: C.bg, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            color: C.muted, padding: 0,
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
          <button onClick={handleSave} style={{
            width: 56, height: 56, borderRadius: 28, border: "none",
            background: C.dark, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", padding: 0,
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 21C12 21 4 14 4 8.5C4 5.4 6.4 3 9.5 3C11.2 3 12 4 12 4C12 4 12.8 3 14.5 3C17.6 3 20 5.4 20 8.5C20 14 12 21 12 21Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/></svg>
          </button>
        </div>
      )}

      {/* Progress + summary shortcut */}
      <div style={{ padding: "0 20px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ fontSize: 12, color: C.muted, fontFamily: FONT }}>
            {cardIdx + 1} of {recipes.length} in {currentSlot}
          </div>
          {totalSaved > 0 && (
            <button onClick={() => setShowSummary(true)} style={{
              background: "none", border: "none", color: C.sub, fontSize: 12,
              fontWeight: 600, cursor: "pointer", fontFamily: FONT, textDecoration: "underline",
            }}>View My Week ({totalSaved})</button>
          )}
        </div>
        <div style={{ display: "flex", gap: 3 }}>
          {recipes.map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 3, borderRadius: 2,
              background: i < cardIdx ? (saved[currentSlot].some((s) => s.id === recipes[i].id) ? C.done : C.border) : i === cardIdx ? C.dark : C.borderLight,
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}
