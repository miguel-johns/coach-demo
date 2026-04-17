import { useState } from "react";

const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";
const C = { bg: "#ffffff", text: "#111", sub: "#666", muted: "#999", border: "#e0e0e0", borderLight: "#f0f0f0", chip: "#f5f5f5", done: "#4caf50", cardDark: "#1a1a1a", cardDarkSub: "#2a2a2a" };

const SAMPLE_DATA = {
  clientName: "Marcus",
  date: "Today",
  calories: { current: 1847, goal: 2000 },
  macros: { protein: { current: 78, goal: 150 }, carbs: { current: 186, goal: 250 }, fats: { current: 46, goal: 67 } },
  fiber: { current: 18, goal: 25 },
  water: { current: 6, goal: 8 },
  meals: [
    { id: 1, name: "Greek yogurt, Berries", time: "8:30am", calories: 280, protein: 28, carbs: 32, fats: 12,
      items: [
        { name: "Greek yogurt (plain, 2%)", serving: "1 cup (227g)", cal: 180, p: 22, c: 12, f: 5 },
        { name: "Mixed berries", serving: "¾ cup (110g)", cal: 60, p: 1, c: 15, f: 0 },
        { name: "Honey", serving: "1 tsp (7g)", cal: 21, p: 0, c: 6, f: 0 },
        { name: "Granola", serving: "2 tbsp (14g)", cal: 19, p: 5, c: -1, f: 7 },
      ], note: "" },
    { id: 2, name: "Grilled chicken salad, Whole grain bread", time: "12:45pm", calories: 620, protein: 45, carbs: 52, fats: 18,
      items: [
        { name: "Grilled chicken breast", serving: "6 oz (170g)", cal: 280, p: 38, c: 0, f: 6 },
        { name: "Mixed greens", serving: "2 cups", cal: 15, p: 1, c: 2, f: 0 },
        { name: "Cherry tomatoes", serving: "½ cup", cal: 15, p: 1, c: 3, f: 0 },
        { name: "Olive oil dressing", serving: "1 tbsp", cal: 90, p: 0, c: 1, f: 10 },
        { name: "Whole grain bread", serving: "1 slice", cal: 120, p: 5, c: 22, f: 2 },
        { name: "Feta cheese", serving: "1 oz (28g)", cal: 100, p: 0, c: 24, f: 0 },
      ], note: "Meal prepped Sunday" },
    { id: 3, name: "Protein bar, Almonds", time: "3:15pm", calories: 347, protein: 22, carbs: 38, fats: 14,
      items: [
        { name: "Protein bar (chocolate)", serving: "1 bar (60g)", cal: 230, p: 20, c: 28, f: 8 },
        { name: "Almonds (raw)", serving: "¼ cup (35g)", cal: 117, p: 2, c: 10, f: 6 },
      ], note: "" },
    { id: 4, name: "Salmon, Brown rice, Broccoli", time: "7:00pm", calories: 600, protein: 42, carbs: 64, fats: 16,
      items: [
        { name: "Atlantic salmon (baked)", serving: "5 oz (140g)", cal: 290, p: 32, c: 0, f: 12 },
        { name: "Brown rice (cooked)", serving: "1 cup (195g)", cal: 220, p: 5, c: 52, f: 2 },
        { name: "Broccoli (steamed)", serving: "1 cup (156g)", cal: 55, p: 4, c: 10, f: 1 },
        { name: "Soy sauce", serving: "1 tbsp", cal: 10, p: 1, c: 1, f: 0 },
        { name: "Sesame oil", serving: "½ tsp", cal: 25, p: 0, c: 1, f: 1 },
      ], note: "Coach recommended post-workout" },
  ],
};

const WEEK_DATA = {
  dailyGoal: 2000,
  weeklyGoal: 14000,
  days: [
    { label: "Mon", cal: 1920, protein: 142, carbs: 240, fats: 62, logged: true },
    { label: "Tue", cal: 2050, protein: 155, carbs: 230, fats: 70, logged: true },
    { label: "Wed", cal: 1780, protein: 138, carbs: 210, fats: 58, logged: true },
    { label: "Thu", cal: 1847, protein: 78, carbs: 186, fats: 46, logged: false, isToday: true },
    { label: "Fri", cal: 0, protein: 0, carbs: 0, fats: 0, logged: false },
    { label: "Sat", cal: 0, protein: 0, carbs: 0, fats: 0, logged: false, isWeekend: true },
    { label: "Sun", cal: 0, protein: 0, carbs: 0, fats: 0, logged: false, isWeekend: true },
  ],
};

function WeekView() {
  const data = WEEK_DATA;
  const consumed = data.days.reduce((a, d) => a + d.cal, 0);
  const remaining = data.weeklyGoal - consumed;
  const todayIdx = data.days.findIndex((d) => d.isToday);
  const daysLeft = data.days.length - todayIdx;
  const weekendBudget = remaining > 0 ? remaining - (data.dailyGoal * Math.max(daysLeft - 2, 0)) : 0;
  const maxCal = Math.max(...data.days.map((d) => d.cal), data.dailyGoal);
  const weekPct = data.weeklyGoal > 0 ? (consumed / data.weeklyGoal) * 100 : 0;

  const loggedDays = data.days.filter((d) => d.logged || d.isToday);
  const avgProtein = Math.round(loggedDays.reduce((a, d) => a + d.protein, 0) / Math.max(loggedDays.length, 1));
  const avgCarbs = Math.round(loggedDays.reduce((a, d) => a + d.carbs, 0) / Math.max(loggedDays.length, 1));
  const avgFats = Math.round(loggedDays.reduce((a, d) => a + d.fats, 0) / Math.max(loggedDays.length, 1));

  return (
    <div style={{ padding: "0 16px" }}>
      {/* Weekly summary */}
      <div style={{ background: C.chip, borderRadius: 14, padding: "18px 20px", marginBottom: 12, border: `1px solid ${C.borderLight}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text, fontFamily: FONT }}>Weekly Calories</div>
          <div style={{ fontSize: 12, color: C.muted, fontFamily: FONT }}>Mon – Sun</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: C.text, fontFamily: FONT }}>
            {consumed.toLocaleString()}<span style={{ fontSize: 16, fontWeight: 400, color: C.muted }}>/{data.weeklyGoal.toLocaleString()}</span>
          </div>
          <div style={{ fontSize: 13, color: remaining > 0 ? C.sub : "#d44", fontWeight: 500, fontFamily: FONT }}>
            {remaining > 0 ? `${remaining.toLocaleString()} left` : "Over budget"}
          </div>
        </div>
        <div style={{ width: "100%", height: 5, background: C.borderLight, borderRadius: 3, overflow: "hidden" }}>
          <div style={{ width: `${Math.min(weekPct, 100)}%`, height: "100%", background: weekPct > 100 ? "#d44" : C.text, borderRadius: 3, transition: "width 0.4s ease" }} />
        </div>
      </div>

      {/* Day-by-day bars */}
      <div style={{ background: C.cardDark, borderRadius: 14, padding: "20px", marginBottom: 12 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", fontFamily: FONT, marginBottom: 16 }}>Daily Breakdown</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 120, marginBottom: 8 }}>
          {data.days.map((day, i) => {
            const h = maxCal > 0 ? (day.cal / maxCal) * 100 : 0;
            const goalH = maxCal > 0 ? (data.dailyGoal / maxCal) * 100 : 0;
            const over = day.cal > data.dailyGoal;
            const empty = day.cal === 0 && !day.isToday;
            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end", position: "relative" }}>
                <div style={{ position: "absolute", bottom: `${goalH}%`, left: 0, right: 0, borderTop: "1px dashed rgba(255,255,255,0.12)" }} />
                <div style={{
                  width: "100%", maxWidth: 32, borderRadius: "4px 4px 0 0",
                  height: empty ? 3 : `${Math.max(h, 3)}%`,
                  background: day.isToday ? "#fff" : over ? "#ff6b6b" : day.isWeekend ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.4)",
                  transition: "height 0.4s ease",
                }} />
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {data.days.map((day, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center", fontSize: 11, fontWeight: day.isToday ? 700 : 500, color: day.isToday ? "#fff" : day.isWeekend ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.5)", fontFamily: FONT }}>{day.label}</div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
          {data.days.map((day, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center", fontSize: 10, fontWeight: 600, color: day.isToday ? "#fff" : day.cal > 0 ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.15)", fontFamily: FONT }}>{day.cal > 0 ? day.cal : "—"}</div>
          ))}
        </div>
      </div>

      {/* Weekend Budget */}
      <div style={{ background: C.chip, borderRadius: 14, padding: "18px 20px", marginBottom: 12, border: `1px solid ${C.borderLight}` }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.muted, fontFamily: FONT, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>Weekend Budget</div>
        <div style={{ fontSize: 13, color: C.sub, fontFamily: FONT, lineHeight: 1.5, marginBottom: 12 }}>
          Hit your goal today and Friday → <b style={{ color: C.text }}>{weekendBudget > 0 ? weekendBudget.toLocaleString() : 0} kcal</b> to split across Sat & Sun.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div style={{ background: C.bg, borderRadius: 8, padding: "12px", textAlign: "center", border: `1px solid ${C.borderLight}` }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.text, fontFamily: FONT }}>{weekendBudget > 0 ? Math.round(weekendBudget / 2).toLocaleString() : "—"}</div>
            <div style={{ fontSize: 11, color: C.muted, fontFamily: FONT }}>kcal per day</div>
          </div>
          <div style={{ background: C.bg, borderRadius: 8, padding: "12px", textAlign: "center", border: `1px solid ${C.borderLight}` }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: weekendBudget / 2 > data.dailyGoal ? C.done : C.text, fontFamily: FONT }}>
              {weekendBudget > 0 ? (Math.round(weekendBudget / 2) > data.dailyGoal ? `+${Math.round(weekendBudget / 2) - data.dailyGoal}` : `${Math.round(weekendBudget / 2) - data.dailyGoal}`) : "—"}
            </div>
            <div style={{ fontSize: 11, color: C.muted, fontFamily: FONT }}>vs. daily goal</div>
          </div>
        </div>
      </div>

      {/* Weekly macro averages */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
        {[
          { label: "Avg Protein", val: `${avgProtein}g` },
          { label: "Avg Carbs", val: `${avgCarbs}g` },
          { label: "Avg Fats", val: `${avgFats}g` },
        ].map((m) => (
          <div key={m.label} style={{ background: C.chip, borderRadius: 10, padding: "14px 10px", textAlign: "center", border: `1px solid ${C.borderLight}` }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.text, fontFamily: FONT }}>{m.val}</div>
            <div style={{ fontSize: 11, color: C.muted, fontFamily: FONT, marginTop: 2 }}>{m.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 30-day view — generative. In production, AI assembles this per-client.
const MONTH_DATA = {
  plan: { type: "cut", targetLoss: 1.5, unit: "lbs/week", dailyTarget: 2000, startWeight: 198, currentWeight: 194.2, goalWeight: 185 },
  weeks: [
    { label: "Week 1", avgCal: 2120, avgProtein: 135, deficit: -280, projected: -0.6, actual: -0.8 },
    { label: "Week 2", avgCal: 1950, avgProtein: 148, deficit: -550, projected: -1.1, actual: -1.2 },
    { label: "Week 3", avgCal: 1880, avgProtein: 152, deficit: -620, projected: -1.2, actual: -1.0 },
    { label: "Week 4", avgCal: 1920, avgProtein: 141, deficit: -580, projected: -1.2, actual: null },
  ],
  dailyCals: [
    2200,2050,1980,2100,2300,2400,1850,
    1900,1950,2000,1880,1920,2100,1900,
    1850,1800,1920,1900,1950,1800,1880,
    1900,1950,1880,1920,1850,1847,0,0,0
  ],
  consistency: { daysLogged: 27, totalDays: 30, streak: 12 },
  // This is the generative piece — AI writes this based on the data
  aiSummary: "You're down 3.8 lbs in 3 weeks — tracking ahead of your 1.5 lbs/week target. Your protein has been climbing each week which is protecting lean mass. Weekends are your swing factor — Week 1 you went 300 over on Saturday, but Week 3 you nailed it. If you stay consistent through Week 4, you'll hit 193 by month end.",
  aiInsights: [
    { type: "positive", text: "Protein trending up — 135g → 152g avg. Lean mass is protected." },
    { type: "positive", text: "12-day logging streak. Consistency drives results." },
    { type: "warning", text: "Weekend calories average 15% higher than weekdays. Not a problem yet — just awareness." },
    { type: "action", text: "At this rate you'll hit 185 lbs by late June. Stay the course." },
  ],
};

function MonthView() {
  const d = MONTH_DATA;
  const totalLost = d.plan.startWeight - d.plan.currentWeight;
  const toGoal = d.plan.currentWeight - d.plan.goalWeight;
  const goalPct = ((d.plan.startWeight - d.plan.currentWeight) / (d.plan.startWeight - d.plan.goalWeight)) * 100;
  const maxWeekCal = Math.max(...d.weeks.map((w) => w.avgCal), d.plan.dailyTarget);
  const maxDailyCal = Math.max(...d.dailyCals.filter(c => c > 0), d.plan.dailyTarget);

  return (
    <div style={{ padding: "0 16px" }}>
      {/* AI Summary — the generative hero */}
      <div style={{
        background: C.cardDark, borderRadius: 14, padding: "20px", marginBottom: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1L10 5.5L15 6.5L11.5 10L12.5 15L8 12.5L3.5 15L4.5 10L1 6.5L6 5.5L8 1Z" stroke="rgba(255,255,255,0.6)" strokeWidth="1.3" strokeLinejoin="round"/></svg>
          <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.6)", fontFamily: FONT, textTransform: "uppercase", letterSpacing: "0.04em" }}>AI Summary</span>
        </div>
        <div style={{ fontSize: 14, color: "#fff", fontFamily: FONT, lineHeight: 1.65 }}>
          {d.aiSummary}
        </div>
      </div>

      {/* Weight Progress */}
      <div style={{ background: C.chip, borderRadius: 14, padding: "18px 20px", marginBottom: 12, border: `1px solid ${C.borderLight}` }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.text, fontFamily: FONT, marginBottom: 14 }}>Weight Progress</div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 11, color: C.muted, fontFamily: FONT, marginBottom: 2 }}>Start</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.text, fontFamily: FONT }}>{d.plan.startWeight}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 11, color: C.muted, fontFamily: FONT, marginBottom: 2 }}>Current</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.text, fontFamily: FONT }}>{d.plan.currentWeight}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 11, color: C.muted, fontFamily: FONT, marginBottom: 2 }}>Goal</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.muted, fontFamily: FONT }}>{d.plan.goalWeight}</div>
          </div>
        </div>
        {/* Progress track */}
        <div style={{ position: "relative", height: 8, background: C.borderLight, borderRadius: 4, overflow: "hidden", marginBottom: 8 }}>
          <div style={{ width: `${Math.min(goalPct, 100)}%`, height: "100%", background: C.text, borderRadius: 4, transition: "width 0.5s ease" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontFamily: FONT }}>
          <span style={{ color: C.done, fontWeight: 600 }}>↓ {totalLost.toFixed(1)} lbs lost</span>
          <span style={{ color: C.muted }}>{toGoal.toFixed(1)} lbs to go</span>
        </div>
      </div>

      {/* Weekly Averages */}
      <div style={{ background: C.cardDark, borderRadius: 14, padding: "20px", marginBottom: 12 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", fontFamily: FONT, marginBottom: 16 }}>Weekly Averages</div>
        {d.weeks.map((w, i) => {
          const barW = maxWeekCal > 0 ? (w.avgCal / maxWeekCal) * 100 : 0;
          const goalW = maxWeekCal > 0 ? (d.plan.dailyTarget / maxWeekCal) * 100 : 0;
          const isCurrent = i === d.weeks.length - 1;
          return (
            <div key={i} style={{ marginBottom: i < d.weeks.length - 1 ? 12 : 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: isCurrent ? 700 : 500, color: isCurrent ? "#fff" : "rgba(255,255,255,0.6)", fontFamily: FONT }}>{w.label}{isCurrent ? " (current)" : ""}</span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: FONT }}>
                  {w.avgCal} avg · {w.actual !== null ? <span style={{ color: C.done }}>↓{Math.abs(w.actual).toFixed(1)} lb</span> : <span style={{ color: "rgba(255,255,255,0.3)" }}>in progress</span>}
                </span>
              </div>
              <div style={{ position: "relative", height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ position: "absolute", left: `${goalW}%`, top: 0, bottom: 0, width: 1, background: "rgba(255,255,255,0.2)" }} />
                <div style={{ width: `${barW}%`, height: "100%", background: isCurrent ? "#fff" : w.avgCal > d.plan.dailyTarget ? "#ff6b6b" : "rgba(255,255,255,0.4)", borderRadius: 3, transition: "width 0.4s ease" }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* 30-day heatmap strip */}
      <div style={{ background: C.chip, borderRadius: 14, padding: "18px 16px", marginBottom: 12, border: `1px solid ${C.borderLight}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text, fontFamily: FONT }}>Daily Calories</div>
          <div style={{ fontSize: 11, color: C.muted, fontFamily: FONT }}>{d.consistency.daysLogged}/{d.consistency.totalDays} days logged</div>
        </div>
        <div style={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          {d.dailyCals.map((cal, i) => {
            const intensity = cal > 0 ? Math.min(cal / maxDailyCal, 1) : 0;
            const over = cal > d.plan.dailyTarget;
            return (
              <div key={i} style={{
                width: "calc((100% - 12px) / 7)", aspectRatio: "1", borderRadius: 3,
                background: cal === 0 ? C.borderLight : over ? `rgba(220,60,60,${0.3 + intensity * 0.5})` : `rgba(17,17,17,${0.1 + intensity * 0.6})`,
                transition: "background 0.2s ease",
              }} />
            );
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 10, color: C.muted, fontFamily: FONT }}>
          <span>Mar 11</span><span>Today</span>
        </div>
      </div>

      {/* AI Insights */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.text, fontFamily: FONT, marginBottom: 10 }}>Insights</div>
        {d.aiInsights.map((insight, i) => {
          const icons = {
            positive: <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke={C.done} strokeWidth="1.5"/><path d="M5.5 8.5L7 10L10.5 6" stroke={C.done} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
            warning: <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 2L14 13H2L8 2Z" stroke="#e6a117" strokeWidth="1.5" strokeLinejoin="round"/><path d="M8 7V9.5" stroke="#e6a117" strokeWidth="1.5" strokeLinecap="round"/><circle cx="8" cy="11.5" r="0.5" fill="#e6a117"/></svg>,
            action: <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8H13M10 5L13 8L10 11" stroke={C.text} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
          };
          const bgColors = { positive: "#f0faf0", warning: "#fef8e8", action: C.chip };
          const borderColors = { positive: "#c8e6c9", warning: "#f5e6b8", action: C.borderLight };
          return (
            <div key={i} style={{
              display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 14px",
              background: bgColors[insight.type], border: `1px solid ${borderColors[insight.type]}`,
              borderRadius: 10, marginBottom: 8, fontSize: 13, color: C.text, fontFamily: FONT, lineHeight: 1.5,
            }}>
              <div style={{ flexShrink: 0, marginTop: 2 }}>{icons[insight.type]}</div>
              {insight.text}
            </div>
          );
        })}
      </div>

      {/* Consistency */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
        {[
          { label: "Days Logged", val: `${d.consistency.daysLogged}/${d.consistency.totalDays}` },
          { label: "Current Streak", val: `${d.consistency.streak} days` },
          { label: "Avg Deficit", val: `${Math.round(d.weeks.reduce((a, w) => a + w.deficit, 0) / d.weeks.length)} cal` },
        ].map((m) => (
          <div key={m.label} style={{ background: C.chip, borderRadius: 10, padding: "14px 10px", textAlign: "center", border: `1px solid ${C.borderLight}` }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text, fontFamily: FONT }}>{m.val}</div>
            <div style={{ fontSize: 10, color: C.muted, fontFamily: FONT, marginTop: 2 }}>{m.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Ring({ current, goal, size = 80, strokeWidth = 7, color = "#fff", trackColor = "rgba(255,255,255,0.15)", label, icon }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(current / goal, 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} style={{ transition: "stroke-dashoffset 0.5s ease" }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {icon}
        </div>
      </div>
      {label && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontFamily: FONT }}>{label}</div>}
      <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", fontFamily: FONT }}>
        {current}g<span style={{ fontWeight: 400, color: "rgba(255,255,255,0.4)" }}>/{goal}g</span>
      </div>
    </div>
  );
}

function ProgressBar({ current, goal, color = C.text, height = 4 }) {
  const pct = Math.min((current / goal) * 100, 100);
  return (
    <div style={{ width: "100%", height, background: C.borderLight, borderRadius: height / 2, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: height / 2, transition: "width 0.4s ease" }} />
    </div>
  );
}

function MealRow({ meal, onEdit, onDelete, expanded, onExpand }) {

  return (
    <div style={{
      background: C.chip, borderRadius: 10, marginBottom: 8,
      border: expanded ? `1px solid ${C.border}` : `1px solid ${C.borderLight}`,
      transition: "border 0.15s ease",
    }}>
      {/* Collapsed row */}
      <div onClick={() => onExpand(meal.id)} style={{
        padding: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.text, fontFamily: FONT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 8 }}>
              {meal.name}
            </div>
            <div style={{ fontSize: 12, color: C.muted, fontFamily: FONT, flexShrink: 0 }}>{meal.time}</div>
          </div>
          <div style={{ display: "flex", gap: 12, fontSize: 12, color: C.sub, fontFamily: FONT }}>
            <span><b style={{ color: C.text }}>{meal.calories}</b> kcal</span>
            {!expanded && <>
              <span>P {meal.protein}g</span>
              <span>C {meal.carbs}g</span>
              <span>F {meal.fats}g</span>
            </>}
          </div>
        </div>
        <div style={{ color: C.muted, flexShrink: 0, display: "flex", alignItems: "center" }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ transform: expanded ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s ease" }}>
            <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ padding: "0 14px 14px", animation: "fadeIn 0.15s ease" }}>
          {/* Individual food items */}
          <div style={{ borderTop: `1px solid ${C.borderLight}`, paddingTop: 10 }}>
            {meal.items.map((item, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                padding: "8px 0", borderBottom: i < meal.items.length - 1 ? `1px solid ${C.borderLight}` : "none",
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: C.text, fontFamily: FONT }}>{item.name}</div>
                  <div style={{ fontSize: 12, color: C.muted, fontFamily: FONT, marginTop: 1 }}>{item.serving}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0, paddingLeft: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text, fontFamily: FONT }}>{item.cal} kcal</div>
                  <div style={{ fontSize: 11, color: C.muted, fontFamily: FONT, marginTop: 1 }}>
                    P {item.p}g · C {item.c}g · F {item.f}g
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Coach note */}
          {meal.note && (
            <div style={{
              background: C.bg, border: `1px solid ${C.borderLight}`, borderRadius: 8,
              padding: "10px 12px", marginTop: 10, fontSize: 12, color: C.sub, fontFamily: FONT, fontStyle: "italic",
              display: "flex", alignItems: "flex-start", gap: 6,
            }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }}><path d="M2 3H14V11H6L2 14V3Z" stroke={C.muted} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              {meal.note}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button onClick={(e) => { e.stopPropagation(); onEdit(meal.id); }} style={{
              flex: 1, padding: "10px", borderRadius: 8, border: `1px solid ${C.border}`,
              background: C.bg, cursor: "pointer", fontFamily: FONT, fontSize: 13, fontWeight: 600, color: C.sub,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}>
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M11.5 1.5L14.5 4.5L5 14H2V11L11.5 1.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Edit
            </button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(meal.id); }} style={{
              padding: "10px 16px", borderRadius: 8, border: "none",
              background: "#fee", cursor: "pointer", fontFamily: FONT, fontSize: 13, fontWeight: 600, color: "#d44",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}>
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M3 4H13M5 4V3C5 2.4 5.4 2 6 2H10C10.6 2 11 2.4 11 3V4M6 7V12M10 7V12M4 4L5 14C5 14.6 5.4 15 6 15H10C10.6 15 11 14.6 11 14L12 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function NutritionDashboard({ config = {} }) {
  const [data] = useState(SAMPLE_DATA);
  const [view, setView] = useState("today");
  const [meals, setMeals] = useState(SAMPLE_DATA.meals);
  const [expandedMealId, setExpandedMealId] = useState(null);

  const calLeft = data.calories.goal - data.calories.current;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: FONT, maxWidth: 480, margin: "0 auto" }}>
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(-4px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing:border-box; margin:0; padding:0; }
      `}</style>

      {/* Top nav */}
      <div style={{ padding: "48px 16px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", background: C.chip, borderRadius: 20, padding: 3, border: `1px solid ${C.borderLight}` }}>
          {["today", "7 days", "30 days"].map((v) => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: "8px 14px", borderRadius: 18, border: "none", cursor: "pointer",
              fontFamily: FONT, fontSize: 13, fontWeight: 600, textTransform: "capitalize",
              background: view === v ? C.cardDark : "transparent", color: view === v ? "#fff" : C.sub,
              transition: "all 0.15s ease",
            }}>{v === "today" ? "Today" : v === "7 days" ? "7 Days" : "30 Days"}</button>
          ))}
        </div>

      </div>

      {view === "7 days" && <WeekView />}
      {view === "30 days" && <MonthView />}

      {view === "today" && <div style={{ padding: "0 16px" }}>
        {/* Calories Card */}
        <div style={{
          background: C.chip, borderRadius: 14, padding: "18px 20px", marginBottom: 12,
          border: `1px solid ${C.borderLight}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M9 1L3 9H8L7 15L13 7H8L9 1Z" stroke={C.text} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Calories</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: C.text }}>
              {data.calories.current.toLocaleString()}<span style={{ fontSize: 16, fontWeight: 400, color: C.muted }}>/{data.calories.goal.toLocaleString()} kcal</span>
            </div>
            <div style={{ fontSize: 13, color: C.sub, fontWeight: 500 }}>{calLeft > 0 ? `${calLeft} kcal left` : "Goal reached"}</div>
          </div>
          <ProgressBar current={data.calories.current} goal={data.calories.goal} height={6} />
        </div>

        {/* Macros Card — dark */}
        <div style={{
          background: C.cardDark, borderRadius: 14, padding: "20px", marginBottom: 12,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 18 }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 14V9M6 14V6M10 14V3M14 14V1" stroke="rgba(255,255,255,0.5)" strokeWidth="1.8" strokeLinecap="round"/></svg>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>Macros</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-around" }}>
            <Ring current={data.macros.protein.current} goal={data.macros.protein.goal} color="#fff" label="Protein"
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 4C17.2 4 19 5.8 19 8C19 10.2 17.2 12 15 12C14.4 12 13.8 11.8 13.3 11.5L10 14.8L9 17L7 18L5 17L4 15L5 13L7 12L10.2 8.7C9.9 8.2 9.8 7.6 9.8 7C9.8 5.3 11.1 4 12.8 4H15Z" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>} />
            <Ring current={data.macros.carbs.current} goal={data.macros.carbs.goal} color="#aaa" label="Carbs"
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 3C12 3 11 1 9 1M17 8C19.2 8 21 10.5 21 13.5C21 17.5 18 22 15 22C14 22 13 21.5 12 21.5C11 21.5 10 22 9 22C6 22 3 17.5 3 13.5C3 10.5 4.8 8 7 8C8.5 8 10 9 12 9C14 9 15.5 8 17 8Z" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 3C12 3 15 3 15 5" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round"/></svg>} />
            <Ring current={data.macros.fats.current} goal={data.macros.fats.goal} color="#666" label="Fats"
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 3L7 12C7 15.3 9.2 18 12 18C14.8 18 17 15.3 17 12L12 3Z" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>} />
          </div>
        </div>

        {/* Fiber + Water */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
          <div style={{ background: C.chip, borderRadius: 12, padding: "16px", border: `1px solid ${C.borderLight}` }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 }}>Fiber</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 8 }}>
              {data.fiber.current}g<span style={{ fontWeight: 400, color: C.muted }}>/{data.fiber.goal}g</span>
            </div>
            <ProgressBar current={data.fiber.current} goal={data.fiber.goal} color={C.cardDark} height={5} />
          </div>
          <div style={{ background: C.chip, borderRadius: 12, padding: "16px", border: `1px solid ${C.borderLight}` }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 }}>Water</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 8 }}>
              {data.water.current}<span style={{ fontWeight: 400, color: C.muted }}>/{data.water.goal} cups</span>
            </div>
            <ProgressBar current={data.water.current} goal={data.water.goal} color={C.cardDark} height={5} />
          </div>
        </div>

        {/* Food Log */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.text }}>Food Log</div>
          <button style={{ background: "none", border: "none", color: C.sub, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: FONT, textDecoration: "underline" }}>View All</button>
        </div>

        {meals.map((meal) => (
          <MealRow
            key={meal.id}
            meal={meal}
            expanded={expandedMealId === meal.id}
            onExpand={(id) => setExpandedMealId((p) => p === id ? null : id)}
            onEdit={(id) => console.log("edit", id)}
            onDelete={(id) => setMeals((prev) => prev.filter((m) => m.id !== id))}
          />
        ))}

        {meals.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 20px", color: C.muted, fontSize: 14 }}>
            No meals logged yet today.
          </div>
        )}
      </div>}



      <div style={{ height: 100 }} />
    </div>
  );
}
