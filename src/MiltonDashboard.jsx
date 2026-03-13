import { useState, useEffect, useRef, useCallback } from "react";

const TEAL = "#2B7A78";
const MINT = "#5CDB95";
const TEAL_LIGHT = "#e8f5f3";
const SAGE = "#3aafa9";
const BG = "#f3f6f4";
const WHITE = "#ffffff";
const TEXT = "#1a2e2a";
const TEXT_SEC = "#5f7a76";
const CHAT_BG = "#f7faf9";
const BORDER = "#e0ebe8";
const USER_BUBBLE = "#2B7A78";
const ALERT_RED = "#e8453c";
const ALERT_GREEN = "#3aaf6a";
const MOBILE_BP = 768;
const LOGO_URL = "data:image/png;base64,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";


function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= MOBILE_BP);
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth <= MOBILE_BP);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return isMobile;
}

function NavIcon({ icon, size = 20 }) {
  const s = { width: size, height: size, strokeWidth: 1.6, stroke: "currentColor", fill: "none", strokeLinecap: "round", strokeLinejoin: "round" };
  const icons = {
    grid: <svg {...s} viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>,
    users: <svg {...s} viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
    "file-text": <svg {...s} viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    layers: <svg {...s} viewBox="0 0 24 24"><polygon points="12,2 2,7 12,12 22,7"/><polyline points="2,17 12,22 22,17"/><polyline points="2,12 12,17 22,12"/></svg>,
    settings: <svg {...s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.32 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
    paperclip: <svg {...s} viewBox="0 0 24 24"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.49"/></svg>,
    smile: <svg {...s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>,
    message: <svg {...s} viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
    more: <svg {...s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>,
    chevron: <svg {...s} viewBox="0 0 24 24" style={{...s, width: 16, height: 16}}><polyline points="9,18 15,12 9,6"/></svg>,
    "chevron-down": <svg {...s} viewBox="0 0 24 24" style={{...s, width: 14, height: 14}}><polyline points="6,9 12,15 18,9"/></svg>,
    "chevron-left": <svg {...s} viewBox="0 0 24 24" style={{...s, width: 18, height: 18}}><polyline points="15,18 9,12 15,6"/></svg>,
    menu: <svg {...s} viewBox="0 0 24 24" style={{...s, width: 18, height: 18}}><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
    x: <svg {...s} viewBox="0 0 24 24" style={{...s, width: 18, height: 18}}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  };
  return icons[icon] || null;
}

const dataConnectors = {
  watch: {
    bg: "#2B7A78", color: "#fff", name: "Watch",
    icon: (s) => <svg width={s} height={s} viewBox="0 0 14 14" fill="none" stroke="#fff" strokeWidth="1.4" strokeLinecap="round"><rect x="3.5" y="1" width="7" height="12" rx="2.5"/><circle cx="7" cy="6.5" r="2" /><line x1="7" y1="5.5" x2="8.2" y2="6.5"/></svg>
  },
  scale: {
    bg: "#45818e", color: "#fff", name: "Scale",
    icon: (s) => <svg width={s} height={s} viewBox="0 0 14 14" fill="none" stroke="#fff" strokeWidth="1.4" strokeLinecap="round"><rect x="1.5" y="3.5" width="11" height="8" rx="2"/><circle cx="7" cy="7.5" r="2"/><line x1="7" y1="6.2" x2="8.4" y2="7.2"/></svg>
  },
  cgm: {
    bg: "#7bc67e", color: "#fff", name: "CGM",
    icon: (s) => <svg width={s} height={s} viewBox="0 0 14 14" fill="none" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="1,7 3.5,7 5,4 7,10 9,5.5 10.5,7 13,7"/></svg>
  },
  milton: {
    bg: "#3aafa9", color: "#fff", name: "Milton",
    icon: (s) => <svg width={s} height={s} viewBox="0 0 14 14" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round"><text x="4" y="10.5" fill="#fff" stroke="none" fontSize="9" fontWeight="700" fontFamily="DM Sans, sans-serif">M</text></svg>
  },
  foodlog: {
    bg: "#ef6c3e", color: "#fff", name: "Food Log",
    icon: (s) => <svg width={s} height={s} viewBox="0 0 14 14" fill="none" stroke="#fff" strokeWidth="1.3" strokeLinecap="round"><path d="M4.5 2v4c0 1.4 1.1 2.5 2.5 2.5S9.5 7.4 9.5 6V2"/><line x1="7" y1="8.5" x2="7" y2="12"/><line x1="5" y1="12" x2="9" y2="12"/></svg>
  },
  sleep: {
    bg: "#8e7cc3", color: "#fff", name: "Sleep",
    icon: (s) => <svg width={s} height={s} viewBox="0 0 14 14" fill="none" stroke="#fff" strokeWidth="1.3" strokeLinecap="round"><path d="M11 8A5 5 0 116 3a3.5 3.5 0 005 5z"/></svg>
  },
  bloodwork: {
    bg: "#e06666", color: "#fff", name: "Bloodwork",
    icon: (s) => <svg width={s} height={s} viewBox="0 0 14 14" fill="none" stroke="#fff" strokeWidth="1.3" strokeLinecap="round"><path d="M7 2C7 2 3.5 6 3.5 8.5a3.5 3.5 0 007 0C10.5 6 7 2 7 2z"/></svg>
  },
};

const initialClients = [
  { name: "Aaron Smith", alert: "Needs Attention", alertType: "red", connectors: ["watch", "scale", "foodlog", "cgm"], progress: 65, program: "Fat Loss Phase", startDate: "Feb 12", mealsLogged: 21, weightTrend: -2.1, proteinAvg: 78, proteinTarget: 100, engagementScore: 84, weekLog: [3,2,0,0,3,2,1], weightData: [185,184.5,184.2,183.8,183.5,183.2,183.0,182.9], steps: 8420, workoutDays: 4, insight: "Aaron logs meals consistently early in the week but drops off after Wednesday. Protein intake averages 22g below target.", coachAngle: "Focus on simple protein options for busy days. Consider meal prep suggestions for Wed–Fri.", streaks: { logging: 3, exercise: 8, steps: 14, best: { type: "steps", days: 14 } }, narrative: "Down 2.1 lbs but stopped logging Thursday — his usual mid-week drop-off is back." },
  { name: "Cahrta Marile", alert: "Report Ready", alertType: "blue", connectors: ["watch", "milton", "foodlog", "cgm"], progress: 100, progressLabel: "Report Ready", program: "Muscle Gain", startDate: "Jan 8", mealsLogged: 28, weightTrend: 1.3, proteinAvg: 132, proteinTarget: 130, engagementScore: 96, weekLog: [3,3,3,3,3,2,3], weightData: [142,142.3,142.8,143.0,143.2,143.5,143.8,143.3], steps: 10200, workoutDays: 5, insight: "Cahrta is highly consistent — logging nearly every meal. Weight gain is on track at 1.3 lbs over 14 days.", coachAngle: "Celebrate consistency. Suggest progressive overload update for next phase.", streaks: { logging: 26, exercise: 18, steps: 22, best: { type: "logging", days: 26 } }, narrative: "On a 26-day logging streak and hitting protein targets — her best month yet." },
  { name: "Jason Smith", alert: "Report Ready", alertType: "blue", connectors: ["watch", "scale", "milton", "foodlog"], progress: 100, progressLabel: "Report Ready", program: "Maintenance", startDate: "Dec 1", mealsLogged: 24, weightTrend: -0.3, proteinAvg: 105, proteinTarget: 110, engagementScore: 91, weekLog: [3,3,2,3,3,3,3], weightData: [175,175.1,174.8,175.0,174.9,174.7,174.6,174.7], steps: 9100, workoutDays: 4, insight: "Jason is maintaining weight effectively. Slight protein deficit but within acceptable range.", coachAngle: "Reinforce current habits. Discuss goals for next quarter.", streaks: { logging: 19, exercise: 12, steps: 30, best: { type: "steps", days: 30 } }, narrative: "Just hit a 30-day steps streak. Weight holding steady at 174.7 — maintenance is working." },
  { name: "Daniald Lurenn", alert: "Made Progress", alertType: "green", connectors: ["watch", "foodlog", "sleep"], progress: 48, program: "Fat Loss Phase", startDate: "Feb 20", mealsLogged: 14, weightTrend: -1.0, proteinAvg: 65, proteinTarget: 90, engagementScore: 62, weekLog: [2,1,2,0,1,0,0], weightData: [210,209.5,209.8,209.2,209.0,208.8,209.1,209.0], steps: 5800, workoutDays: 2, insight: "Daniald has inconsistent logging and drops off on weekends. Sleep data shows late nights correlating with missed logs.", coachAngle: "Address weekend routine. Pair evening meals with a simple logging reminder.", streaks: { logging: 0, exercise: 2, steps: 4, best: { type: "steps", days: 7 } }, narrative: "Logging streak broke over the weekend — sleep data shows 2 AM bedtimes Fri and Sat." },
  { name: "Assara Honer", alert: "Report Ready", alertType: "blue", connectors: ["milton", "cgm", "bloodwork"], progress: 82, program: "Metabolic Health", startDate: "Jan 15", mealsLogged: 19, weightTrend: -0.8, proteinAvg: 88, proteinTarget: 95, engagementScore: 78, weekLog: [3,2,3,2,2,1,2], weightData: [155,154.8,154.5,154.2,154.0,154.3,154.1,154.2], steps: 7200, workoutDays: 3, insight: "Assara's CGM data shows glucose spikes after lunch consistently. Bloodwork improving on lipid panel.", coachAngle: "Focus on lunch composition — more protein/fiber before carbs. Share CGM insight visually.", streaks: { logging: 11, exercise: 9, steps: 16, best: { type: "steps", days: 16 } }, narrative: "Glucose spikes are down 15% since changing lunch order. Bloodwork trending in the right direction." },
  { name: "Mathel Bronma", alert: "Made Progress", alertType: "green", connectors: ["foodlog", "scale", "sleep"], progress: 72, program: "Fat Loss Phase", startDate: "Feb 1", mealsLogged: 18, weightTrend: -1.5, proteinAvg: 72, proteinTarget: 85, engagementScore: 70, weekLog: [3,2,2,1,3,1,0], weightData: [195,194.5,194.0,193.8,193.5,193.2,193.5,193.5], steps: 6500, workoutDays: 3, insight: "Mathel shows good weekday adherence but Sunday logging drops completely. Steady weight loss trend.", coachAngle: "Praise the downward trend. Create a simple Sunday meal template.", streaks: { logging: 5, exercise: 6, steps: 10, best: { type: "steps", days: 10 } }, narrative: "Lost 1.5 lbs this week and logging is improving — but Sundays are still a blind spot." },
  { name: "John Smith", alert: "Made Progress", alertType: "green", connectors: ["cgm", "watch", "milton"], progress: 55, program: "Performance", startDate: "Mar 1", mealsLogged: 12, weightTrend: 0.2, proteinAvg: 110, proteinTarget: 120, engagementScore: 58, weekLog: [2,1,0,2,1,0,0], weekData: [178,178.2,178.1,178.3,178.2,178.4,178.3,178.2], steps: 11000, workoutDays: 5, insight: "John trains consistently but logging is sporadic. High activity level but nutrition data gaps make coaching difficult.", coachAngle: "Emphasize that training + logging = results. Suggest photo-logging as a low-friction option.", streaks: { logging: 1, exercise: 21, steps: 28, best: { type: "steps", days: 28 } }, narrative: "Training 5x/week with a 21-day exercise streak, but only logged 1 meal this week." },
];

const chatSeedMessages = [
  { type: "ai", title: "Good morning, Coach!", text: "You have 3 clients needing attention today. Aaron's protein is trending low, Daniald has inconsistent logging, and Cahrta just hit a new milestone. What would you like to tackle first?" },
];

const suggestedPrompts = [
  "Who needs attention today?",
  "Show me Aaron's progress",
  "What's Cahrta's milestone?",
  "Give me a client summary",
];

function generateAIResponse(msg, clientNames, clientsData) {
  const lower = msg.toLowerCase();
  const matchedClient = clientNames.find(n => lower.includes(n.toLowerCase().split(" ")[0].toLowerCase()));
  const matchedIdx = matchedClient ? clientsData.findIndex(c => c.name === matchedClient) : -1;
  const cl = matchedIdx >= 0 ? clientsData[matchedIdx] : null;

  // Extract numbers from message
  const nums = msg.match(/\d+\.?\d*/g);
  const extractNum = () => nums ? parseFloat(nums[nums.length - 1]) : null;

  // Extract program names
  const programs = ["Fat Loss Phase", "Muscle Gain", "Maintenance", "Metabolic Health", "Performance"];
  const matchedProgram = programs.find(p => lower.includes(p.toLowerCase()));

  if (matchedClient && cl) {
    const first = matchedClient.split(" ")[0];

    // === MODIFICATION COMMANDS ===

    // Change program
    if (matchedProgram && (lower.includes("change") || lower.includes("switch") || lower.includes("move") || lower.includes("set") || lower.includes("update"))) {
      return {
        title: `${first}'s Program Updated`, 
        text: `Done! I've switched ${first} from ${cl.program} to ${matchedProgram}. Their goal trajectory and report will update to reflect the new program focus.`,
        clientUpdate: { idx: matchedIdx, changes: { program: matchedProgram } }
      };
    }

    // Change protein target
    if ((lower.includes("protein") && (lower.includes("target") || lower.includes("goal") || lower.includes("change") || lower.includes("set") || lower.includes("update"))) && extractNum()) {
      const newTarget = extractNum();
      if (newTarget > 30 && newTarget < 300) {
        return {
          title: `${first}'s Protein Target Updated`,
          text: `Updated ${first}'s protein target from ${cl.proteinTarget}g to ${newTarget}g. Their goal trajectory chart will now project toward ${newTarget}g. This change is live.`,
          clientUpdate: { idx: matchedIdx, changes: { proteinTarget: newTarget } }
        };
      }
    }

    // Change weight / goal weight
    if ((lower.includes("weight") || lower.includes("goal")) && (lower.includes("change") || lower.includes("set") || lower.includes("update") || lower.includes("target")) && extractNum()) {
      const newWeight = extractNum();
      if (newWeight > 80 && newWeight < 400) {
        const newData = [...(cl.weightData || [])];
        newData[newData.length - 1] = newWeight;
        return {
          title: `${first}'s Weight Updated`,
          text: `Updated ${first}'s current weight to ${newWeight} lbs. The goal trajectory and transformation charts now reflect this change.`,
          clientUpdate: { idx: matchedIdx, changes: { weightData: newData, weightTrend: Math.round((newWeight - (cl.weightData?.[0] || 185)) * 10) / 10 } }
        };
      }
    }

    // Change start date
    if (lower.includes("start") && (lower.includes("date") || lower.includes("change") || lower.includes("set") || lower.includes("update"))) {
      const dateMatch = msg.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+\d{1,2}/i);
      if (dateMatch) {
        const newDate = dateMatch[0].replace(/(\w{3})\w*/, '$1');
        return {
          title: `${first}'s Start Date Updated`,
          text: `Updated ${first}'s program start date to ${newDate}. Timeline and transformation views now reflect the new start date.`,
          clientUpdate: { idx: matchedIdx, changes: { startDate: newDate } }
        };
      }
    }

    // Change calorie / meals
    if ((lower.includes("calorie") || lower.includes("calories")) && (lower.includes("change") || lower.includes("set") || lower.includes("update") || lower.includes("increase") || lower.includes("decrease")) && extractNum()) {
      const newCal = extractNum();
      return {
        title: `${first}'s Calorie Target Updated`,
        text: `Updated ${first}'s daily calorie target to ${newCal}. This will be reflected in their nutrition tracking and reports.`,
      };
    }

    // Change steps goal
    if (lower.includes("steps") && (lower.includes("goal") || lower.includes("change") || lower.includes("set") || lower.includes("target")) && extractNum()) {
      const newSteps = extractNum();
      if (newSteps >= 1000) {
        return {
          title: `${first}'s Steps Goal Updated`,
          text: `Updated ${first}'s daily steps goal to ${newSteps.toLocaleString()}. Progress rings will now track against this target.`,
          clientUpdate: { idx: matchedIdx, changes: { steps: Math.round(newSteps * 0.85) } }
        };
      }
    }

    // === QUERY COMMANDS ===
    if (lower.includes("protein") || lower.includes("macro") || lower.includes("calor") || lower.includes("nutri")) {
      return { title: `${first}'s Nutrition`, text: `${first}'s 7-day averages:\n\nCalories: 1,580 • Protein: ${cl.proteinAvg}g (target: ${cl.proteinTarget}g)\nCarbs: ${Math.round(cl.proteinAvg*1.8)}g • Fats: ${Math.round(cl.proteinAvg*0.55)}g • Fiber: 22g\n\nProtein is ${cl.proteinTarget - cl.proteinAvg}g below target — the gap is mostly at breakfast. I'd suggest adding a Greek yogurt or protein shake to their morning routine.\n\nYou can say "Set ${first}'s protein target to 140g" to adjust.` };
    }
    if (lower.includes("weight") || lower.includes("progress") || lower.includes("trend")) {
      return { title: `${first}'s Progress`, text: `${first} is ${cl.weightTrend > 0 ? "up" : "down"} ${Math.abs(cl.weightTrend)} lbs over the past 14 days, tracking at a healthy rate. Consistency score is ${65 + (cl.engagementScore % 30)} — weekday adherence is strong but weekends are the gap. Want me to generate a full report?` };
    }
    if (lower.includes("plan") || lower.includes("program") || lower.includes("adjust")) {
      return { title: `${first}'s Current Plan`, text: `${first} is on the ${cl.program} program (started ${cl.startDate}).\n\nTo change, just say:\n• "Switch ${first} to Muscle Gain"\n• "Change ${first}'s protein target to 140g"\n• "Update ${first}'s start date to March 15"` };
    }
    if (lower.includes("sleep") || lower.includes("rest") || lower.includes("recovery")) {
      return { title: `${first}'s Sleep & Recovery`, text: `${first} is averaging 6.8 hrs/night with a bedtime consistency of 72%. Tue-Thu they sleep 7+ hours but weekends drop to 5.5-6 hrs. Sleep quality is rated "Good" on weekdays, "Fair" on weekends. Better sleep correlates with their better weekday logging — there's a lifestyle pattern here.` };
    }
    if (lower.includes("report")) {
      return { title: `${first}'s Report`, text: `I've pulled together ${first}'s progress report with their consistency score, goal trajectory, Rule of 30 progress, and key insights. You can open their profile and tap "Generate Report" to see the full visualization.` };
    }
    if (lower.includes("send") || lower.includes("message") || lower.includes("tip")) {
      return { title: `Message Sent`, text: `Done! I sent ${first} a check-in message with a personalized tip based on their latest data. I included their weekly wins and a gentle nudge about the areas to focus on. They usually respond within a few hours.` };
    }
    const score = 65 + (cl.engagementScore % 25);
    return { title: `About ${first}`, text: `${first} is on the ${cl.program} program (started ${cl.startDate}).\n\nConsistency Score: ${score}\nStrongest pillar: Exercise (${Math.min(30, cl.workoutDays*4+2)}/30 days)\nNeeds work: Meal logging (${cl.mealsLogged + 5}/30 days)\n\nTo make changes, try:\n• "Switch ${first} to Performance"\n• "Set ${first}'s protein target to 130g"\n• "Update ${first}'s start date to Feb 1"` };
  }

  if (lower.includes("report") || lower.includes("generate")) {
    return { title: "Reports", text: "I can generate reports for any client. Just say something like \"Generate a report for Sarah\" or \"Show me Aaron's progress.\" I'll pull together their consistency score, goal trajectory, and key insights." };
  }
  if (lower.includes("attention") || lower.includes("priority") || lower.includes("who needs") || lower.includes("queue")) {
    return { title: "Priority Clients Today", text: "3 clients need attention:\n\n🔴 Sarah Chen — missed 2 logging days, weekend pattern recurring\n🔴 Aaron Brooks — protein averaging 15g below target for 5 days\n🟢 Mike Torres — hit 30-day exercise streak! Send congratulations?\n\nWho would you like to start with?" };
  }
  if (lower.includes("schedule") || lower.includes("today") || lower.includes("session")) {
    return { title: "Today's Schedule", text: "You have 4 sessions today:\n\n9:00 AM — Sarah Chen (check-in, address logging gaps)\n10:30 AM — Aaron Brooks (nutrition review)\n1:00 PM — Lisa Park (new client onboarding)\n3:30 PM — Mike Torres (milestone celebration)\n\nWant me to prep talking points for any of these?" };
  }
  if (lower.includes("milestone") || lower.includes("celebrate") || lower.includes("wins")) {
    return { title: "Client Wins This Week", text: "Some great wins to celebrate:\n\n⭐ Mike Torres — 30-day exercise streak\n⭐ Sarah Chen — best protein week (avg 128g)\n⭐ Lisa Park — logged every meal for 2 weeks straight\n⭐ Aaron Brooks — down 4 lbs this month\n\nWant me to send personalized congratulation messages?" };
  }
  if (lower.includes("help") || lower.includes("what can you")) {
    return { title: "How I Can Help", text: "I can help you with:\n\n• Client check-ins — \"How is Sarah doing?\"\n• Adjust plans — \"Change Aaron's program to Muscle Gain\"\n• Set targets — \"Set Aaron's protein target to 140g\"\n��������� Update dates — \"Change Aaron's start date to March 1\"\n• Generate reports — \"Create a report for Mike\"\n• Send messages — \"Send Lisa a meal prep tip\"\n• Review data — \"Show me Sarah's sleep trends\"\n\nChanges happen in real-time — watch the charts update!" };
  }

  return { title: "Milton AI", text: `I can help with that! Try asking about a specific client by name, or ask me things like "Who needs attention today?", "Show me Sarah's nutrition", or "Change Aaron's program to Muscle Gain."\n\nI can update client data in real-time — just tell me what to change.` };
}

function Avatar({ name, size = 36 }) {
  const colors = ["#2B7A78", "#3aafa9", "#5CDB95", "#45818e", "#6aa84f", "#e06666", "#f6b26b", "#8e7cc3"];
  const idx = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length;
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2);
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: colors[idx],
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontSize: size * 0.38, fontWeight: 600, flexShrink: 0
    }}>{initials}</div>
  );
}

function ConnectorDot({ type, first }) {
  const c = dataConnectors[type] || { bg: "#999", color: "#fff", name: "?", icon: () => null };
  return (
    <div style={{
      width: 28, height: 28, borderRadius: "50%", background: c.bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      marginLeft: first ? 0 : -6, position: "relative", zIndex: 1,
      border: "2px solid #fff"
    }}>{c.icon ? c.icon(14) : null}</div>
  );
}

function AlertBadge({ type, label }) {
  const colors = {
    red: { bg: "#fde8e7", color: "#c0392b", border: "#f5c6c0" },
    blue: { bg: "#e3f2fd", color: TEAL, border: "#b6dfd8" },
    green: { bg: "#e8f5e9", color: "#2e7d32", border: "#a5d6a7" },
  };
  const c = colors[type] || colors.blue;
  return (
    <span style={{
      display: "inline-block", padding: "4px 12px", borderRadius: 20,
      background: c.bg, color: c.color, fontSize: 12, fontWeight: 600,
      border: `1px solid ${c.border}`, whiteSpace: "nowrap"
    }}>{label}</span>
  );
}

function StreakBadge({ streak, compact }) {
  if (!streak || !streak.best || streak.best.days < 3) return null;
  const d = streak.best.days;
  const labels = { logging: "Logging", exercise: "Exercise", steps: "Steps" };
  const isHot = d >= 14;
  const isFire = d >= 21;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: compact ? 3 : 4,
      padding: compact ? "3px 8px" : "4px 10px", borderRadius: 16,
      background: isFire ? "#fff3e0" : isHot ? "#fff8e1" : "#f0f4f3",
      border: `1px solid ${isFire ? "#ffe0b2" : isHot ? "#fff176" : BORDER}`,
      fontSize: compact ? 10 : 11, fontWeight: 700,
      color: isFire ? "#e65100" : isHot ? "#f57f17" : TEXT_SEC,
      whiteSpace: "nowrap"
    }}>
      <span style={{ fontSize: compact ? 10 : 12 }}>{isFire ? "🔥" : isHot ? "🔥" : "⚡"}</span>
      {d}d {!compact && (labels[streak.best.type] || "")}
    </span>
  );
}

function ProgressBar({ value }) {
  return (
    <div style={{ width: 100, height: 6, borderRadius: 3, background: "#e0ebe8" }}>
      <div style={{
        width: `${value}%`, height: "100%", borderRadius: 3,
        background: `linear-gradient(90deg, ${TEAL}, ${SAGE})`,
        transition: "width 1s ease"
      }} />
    </div>
  );
}


function ReportBlock({ id, label, customizeMode, onEditBlock, onRemoveBlock, children }) {
  const [hov, setHov] = useState(false);
  if (!customizeMode) return children;
  return (
    <div
      style={{ position: "relative", borderRadius: 22, transition: "all 0.2s ease",
        outline: hov ? "2px solid rgba(43,122,120,0.35)" : "2px solid transparent",
        outlineOffset: 4
      }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
    >
      {children}
      <div style={{
        position: "absolute", top: 10, right: 10, display: "flex", gap: 6, zIndex: 10,
        opacity: hov ? 1 : 0, transform: hov ? "translateY(0)" : "translateY(-4px)",
        transition: "all 0.2s ease", pointerEvents: hov ? "auto" : "none"
      }}>
        <div onClick={() => onEditBlock(id, label)} style={{
          padding: "5px 12px", borderRadius: 20,
          background: "linear-gradient(135deg, #2B7A78, #3aafa9)", color: "#fff",
          fontSize: 11, fontWeight: 700, cursor: "pointer",
          boxShadow: "0 2px 8px rgba(43,122,120,0.35)",
          display: "flex", alignItems: "center", gap: 5
        }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v4m0 14v4M4.22 4.22l2.83 2.83m9.9 9.9l2.83 2.83M1 12h4m14 0h4M4.22 19.78l2.83-2.83m9.9-9.9l2.83-2.83"/></svg>
          Edit with Milton
        </div>
        <div onClick={() => onRemoveBlock(id)} style={{
          padding: "5px 10px", borderRadius: 20, background: "rgba(255,255,255,0.95)",
          border: "1px solid #e0ebe8", color: "#5f7a76", fontSize: 11, fontWeight: 600,
          cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.08)"
        }}>Remove</div>
      </div>
      {hov && <div style={{
        position: "absolute", bottom: -6, left: "50%", transform: "translateX(-50%)",
        padding: "3px 10px", borderRadius: 10, background: "rgba(43,122,120,0.08)",
        fontSize: 10, fontWeight: 600, color: "#2B7A78", whiteSpace: "nowrap"
      }}>{label}</div>}
    </div>
  );
}

function ChatContent({ chatInput, setChatInput, messages, onSend, chatEndRef, isMobile, typing }) {
  const font = `'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif`;
  const showPrompts = messages.length === 1 && messages[0].type === "ai";
  
  const renderMessage = (msg, i) => {
    if (msg.type === "user") {
      return (
        <div style={{
          background: USER_BUBBLE, color: "#fff", padding: "10px 16px",
          borderRadius: "18px 18px 4px 18px", fontSize: 14, fontWeight: 500,
          maxWidth: "85%", lineHeight: 1.5,
          boxShadow: "0 2px 8px rgba(43,122,120,0.15)"
        }}>{msg.text}</div>
      );
    }
    return (
      <div style={{ display: "flex", gap: 10, maxWidth: "90%" }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", overflow: "hidden", flexShrink: 0, marginTop: 2 }}>
          <img src={LOGO_URL} alt="Milton" style={{ width: 32, height: 32 }} />
        </div>
        <div style={{
          background: WHITE, padding: "12px 16px", borderRadius: "4px 18px 18px 18px",
          border: `1px solid ${BORDER}`, fontSize: 13.5, lineHeight: 1.55,
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)"
        }}>
          {msg.title && <div style={{ fontWeight: 700, color: TEXT, marginBottom: 4, fontSize: 14 }}>{msg.title}</div>}
          <div style={{ color: TEXT_SEC, whiteSpace: "pre-line" }}>{msg.text}</div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div style={{
        flex: 1, overflowY: "auto", padding: isMobile ? "12px 14px 8px" : "16px 16px 8px",
        display: "flex", flexDirection: "column", gap: 12,
        background: isMobile ? "transparent" : "#f7faf9"
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: "flex", flexDirection: "column",
            alignItems: msg.type === "user" ? "flex-end" : "flex-start",
            opacity: 0, animation: "fadeSlideIn 0.4s ease forwards",
            animationDelay: `${Math.min(i * 0.05, 0.3)}s`
          }}>
            {renderMessage(msg, i)}
          </div>
        ))}
        {showPrompts && !typing && (
          <div style={{
            display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8, marginLeft: 42,
            opacity: 0, animation: "fadeSlideIn 0.4s ease forwards", animationDelay: "0.3s"
          }}>
            {suggestedPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => onSend(prompt)}
                style={{
                  background: "transparent",
                  border: `1.5px solid ${TEAL}`,
                  borderRadius: 20,
                  padding: "8px 16px",
                  fontSize: 13,
                  fontWeight: 500,
                  color: TEAL,
                  cursor: "pointer",
                  fontFamily: font,
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={e => { e.target.style.background = TEAL; e.target.style.color = "#fff"; }}
                onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.color = TEAL; }}
              >
                {prompt}
              </button>
            ))}
          </div>
        )}
        {typing && (
          <div style={{ display: "flex", gap: 10, maxWidth: "90%", opacity: 0, animation: "fadeSlideIn 0.3s ease forwards" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
              <img src={LOGO_URL} alt="Milton" style={{ width: 32, height: 32 }} />
            </div>
            <div style={{
              background: WHITE, padding: "14px 18px", borderRadius: "4px 18px 18px 18px",
              border: `1px solid ${BORDER}`, display: "flex", gap: 5, alignItems: "center"
            }}>
              {[0,1,2].map(j => (
                <div key={j} style={{ width: 7, height: 7, borderRadius: "50%", background: TEAL, opacity: 0.4, animation: `typingDot 1.2s ease ${j * 0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      <div style={{ padding: isMobile ? "8px 12px 12px" : "12px 16px 16px" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8, background: WHITE,
          borderRadius: 24, border: `1.5px solid ${BORDER}`, padding: "10px 12px 10px 16px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
        }}>
          <input value={chatInput} onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && chatInput.trim()) { onSend(chatInput.trim()); setChatInput(""); }}}
            placeholder="Ask Milton about your clients..."
            style={{ flex: 1, border: "none", outline: "none", fontSize: 14, fontFamily: font, color: TEXT, background: "transparent" }}
          />
          <div onClick={() => { if (chatInput.trim()) { onSend(chatInput.trim()); setChatInput(""); }}} style={{
            width: 32, height: 32, borderRadius: "50%", background: chatInput.trim() ? TEAL : "#c8d8d4",
            display: "flex", alignItems: "center", justifyContent: "center", cursor: chatInput.trim() ? "pointer" : "default",
            boxShadow: chatInput.trim() ? "0 2px 6px rgba(43,122,120,0.3)" : "none", transition: "all 0.15s ease"
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
              <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5,12 12,5 19,12"/>
            </svg>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Mobile Glass Chat Bar + Expandable Sheet ─── */
function MobileChatSheet({ chatOpen, setChatOpen, chatInput, setChatInput, messages, onSend, chatEndRef, typing }) {
  const [sheetHeight, setSheetHeight] = useState(65);
  const [hasPeeked, setHasPeeked] = useState(false);
  const startY = useRef(0);
  const startH = useRef(65);
  const inputRef = useRef(null);
  const font = `'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif`;
  
  // Peek animation on mount - show notification hint
  useEffect(() => {
    if (!chatOpen && !hasPeeked) {
      const timer = setTimeout(() => setHasPeeked(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [chatOpen, hasPeeked]);
  
  const latestAIMessage = messages.filter(m => m.type === "ai").slice(-1)[0];

  const onDragStart = useCallback((e) => {
    e.preventDefault();
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    startY.current = clientY;
    startH.current = sheetHeight;
    const onMove = (ev) => {
      ev.preventDefault();
      const cy = ev.touches ? ev.touches[0].clientY : ev.clientY;
      const deltaVh = ((startY.current - cy) / window.innerHeight) * 100;
      setSheetHeight(Math.min(94, Math.max(15, startH.current + deltaVh)));
    };
    const onEnd = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onEnd);
      document.removeEventListener("touchmove", onMove, { passive: false });
      document.removeEventListener("touchend", onEnd);
      setSheetHeight(h => {
        if (h < 25) { setChatOpen(false); return 65; }
        return h;
      });
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onEnd);
    document.addEventListener("touchmove", onMove, { passive: false });
    document.addEventListener("touchend", onEnd);
  }, [sheetHeight, setChatOpen]);

  const glass = {
    background: "rgba(247, 250, 249, 0.72)",
    backdropFilter: "blur(24px) saturate(180%)",
    WebkitBackdropFilter: "blur(24px) saturate(180%)",
  };

  return (
    <>
      {/* ── Collapsed: floating glass chat bar with peek notification ── */}
      {!chatOpen && (
        <div
          onClick={() => { setChatOpen(true); setTimeout(() => inputRef.current?.focus(), 350); }}
          style={{
            position: "fixed", bottom: 16, left: 16, right: 16, zIndex: 80,
            display: "flex", flexDirection: "column", gap: 0,
            background: "rgba(255,255,255,0.72)",
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
            borderRadius: 26, 
            border: "1px solid rgba(224,235,232,0.6)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.06)",
            cursor: "pointer",
            animation: hasPeeked ? "none" : "peekUp 2.5s ease-out 0.8s forwards",
            transform: "translateY(0)",
            overflow: "hidden"
          }}
        >
          {/* Message preview peek */}
          {latestAIMessage && (
            <div style={{
              padding: "12px 16px 8px",
              borderBottom: "1px solid rgba(224,235,232,0.4)",
              animation: hasPeeked ? "none" : "peekFadeIn 0.5s ease-out 1.3s both",
              opacity: hasPeeked ? 1 : 0
            }}>
              <div style={{ 
                display: "flex", alignItems: "center", gap: 8, marginBottom: 6 
              }}>
                <div style={{
                  width: 24, height: 24, borderRadius: "50%",
                  background: `linear-gradient(135deg, ${TEAL}, ${SAGE})`,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="1" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0014 0"/>
                  </svg>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: TEAL }}>
                  {latestAIMessage.title || "Milton"}
                </span>
                <span style={{ 
                  fontSize: 10, color: TEXT_SEC, marginLeft: "auto",
                  background: `${MINT}22`, padding: "2px 8px", borderRadius: 10
                }}>
                  New
                </span>
              </div>
              <p style={{ 
                fontSize: 13, color: TEXT_PRI, margin: 0,
                lineHeight: 1.4,
                display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                overflow: "hidden", textOverflow: "ellipsis"
              }}>
                {latestAIMessage.text}
              </p>
            </div>
          )}
          
          {/* Input hint bar */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "12px 16px",
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: `linear-gradient(135deg, ${TEAL}, ${SAGE})`,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              boxShadow: "0 2px 8px rgba(43,122,120,0.25)"
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="1" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0014 0"/><line x1="12" y1="17" x2="12" y2="21"/><line x1="8" y1="21" x2="16" y2="21"/>
              </svg>
            </div>
            <span style={{ flex: 1, fontSize: 14, color: TEXT_SEC, fontWeight: 500 }}>
              Tap to chat with Milton...
            </span>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: `linear-gradient(135deg, ${TEAL}, ${SAGE})`,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              boxShadow: "0 2px 6px rgba(43,122,120,0.3)"
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round">
                <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5,12 12,5 19,12"/>
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* ── Expanded: glass bottom sheet ── */}
      {chatOpen && (
        <>
          <div onClick={() => setChatOpen(false)} style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)",
            zIndex: 90, transition: "opacity 0.3s ease"
          }} />
          <div style={{
            position: "fixed", bottom: 0, left: 0, right: 0,
            height: `${sheetHeight}vh`,
            ...glass, background: "rgba(243, 246, 244, 0.82)",
            zIndex: 100, borderRadius: "22px 22px 0 0",
            boxShadow: "0 -6px 40px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.6)",
            border: "1px solid rgba(224,235,232,0.5)", borderBottom: "none",
            display: "flex", flexDirection: "column", overflow: "hidden"
          }}>
            {/* Drag handle */}
            <div onMouseDown={onDragStart} onTouchStart={onDragStart}
              style={{ cursor: "grab", padding: "10px 0 0", touchAction: "none", flexShrink: 0 }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(43,122,120,0.2)", margin: "0 auto 8px" }} />
            </div>
            {/* Header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "0 16px 12px", borderBottom: "1px solid rgba(224,235,232,0.5)", flexShrink: 0
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <img src={LOGO_URL} alt="Milton" style={{ width: 28, height: 28, borderRadius: 8 }} />
                <span style={{ fontSize: 16, fontWeight: 700, color: TEXT }}>Milton AI</span>
              </div>
              <div onClick={() => setChatOpen(false)} style={{
                cursor: "pointer", color: TEXT_SEC, padding: 6, borderRadius: 8,
                display: "flex", background: "rgba(224,235,232,0.3)"
              }}>
                <NavIcon icon="x" size={16} />
              </div>
            </div>
            {/* Messages */}
            <div style={{
              flex: 1, overflowY: "auto", padding: "12px 14px 8px",
              display: "flex", flexDirection: "column", gap: 12
            }}>
              {messages.map((msg, i) => (
                <div key={i} style={{
                  display: "flex", flexDirection: "column",
                  alignItems: msg.type === "user" ? "flex-end" : "flex-start",
                  opacity: 0, animation: "fadeSlideIn 0.4s ease forwards",
                  animationDelay: `${Math.min(i * 0.05, 0.3)}s`
                }}>
                  {msg.type === "user" ? (
                    <div style={{
                      background: USER_BUBBLE, color: "#fff", padding: "10px 16px",
                      borderRadius: "18px 18px 4px 18px", fontSize: 14, fontWeight: 500,
                      maxWidth: "85%", lineHeight: 1.5,
                      boxShadow: "0 2px 8px rgba(43,122,120,0.15)"
                    }}>{msg.text}</div>
                  ) : (
                    <div style={{ display: "flex", gap: 10, maxWidth: "90%" }}>
                      <div style={{ width: 30, height: 30, borderRadius: "50%", overflow: "hidden", flexShrink: 0, marginTop: 2 }}>
                        <img src={LOGO_URL} alt="Milton" style={{ width: 30, height: 30 }} />
                      </div>
                      <div style={{
                        background: "rgba(255,255,255,0.7)",
                        backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
                        padding: "12px 16px", borderRadius: "4px 18px 18px 18px",
                        border: "1px solid rgba(224,235,232,0.5)", fontSize: 13.5, lineHeight: 1.55,
                      }}>
                        {msg.title && <div style={{ fontWeight: 700, color: TEXT, marginBottom: 4, fontSize: 14 }}>{msg.title}</div>}
                        {msg.text && <div style={{ color: TEXT_SEC, whiteSpace: "pre-line" }}>{msg.text}</div>}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {typing && (
                <div style={{ display: "flex", gap: 10, maxWidth: "90%", opacity: 0, animation: "fadeSlideIn 0.3s ease forwards" }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
                    <img src={LOGO_URL} alt="Milton" style={{ width: 30, height: 30 }} />
                  </div>
                  <div style={{
                    background: "rgba(255,255,255,0.7)", padding: "14px 18px", borderRadius: "4px 18px 18px 18px",
                    border: "1px solid rgba(224,235,232,0.5)", display: "flex", gap: 5, alignItems: "center"
                  }}>
                    {[0,1,2].map(j => (
                      <div key={j} style={{ width: 7, height: 7, borderRadius: "50%", background: TEAL, opacity: 0.4, animation: `typingDot 1.2s ease ${j*0.2}s infinite` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            {/* Input */}
            <div style={{
              padding: "8px 12px", paddingBottom: "max(12px, env(safe-area-inset-bottom))",
              borderTop: "1px solid rgba(224,235,232,0.4)",
              ...glass, background: "rgba(247,250,249,0.6)"
            }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "rgba(255,255,255,0.8)", borderRadius: 22,
                border: "1px solid rgba(224,235,232,0.7)",
                padding: "10px 12px 10px 16px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
              }}>
                <input ref={inputRef} value={chatInput} onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && chatInput.trim()) { onSend(chatInput.trim()); setChatInput(""); }}}
                  placeholder="Ask Milton about your clients..."
                  style={{ flex: 1, border: "none", outline: "none", fontSize: 14, fontFamily: font, color: TEXT, background: "transparent" }}
                />
                <div onClick={() => { if (chatInput.trim()) { onSend(chatInput.trim()); setChatInput(""); }}} style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: chatInput.trim() ? `linear-gradient(135deg, ${TEAL}, ${SAGE})` : "#c8d8d4",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: chatInput.trim() ? "pointer" : "default",
                  transition: "all 0.15s ease"
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
                    <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5,12 12,5 19,12"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════
   REPORT VISUALIZATION SCREEN
   ═══════════════════════════════════════════ */
function ReportView({ client, onBack, isMobile }) {
  const [expandedDetail, setExpandedDetail] = useState(null);
  const [showShare, setShowShare] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const reportRef = useRef(null);
  const font = `'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif`;

  const shareLink = `https://app.miltonai.com/report/${client.name.toLowerCase().replace(/ /g,"-")}-${Date.now().toString(36)}`;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(shareLink).catch(() => {});
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
  };

  const handleExportPDF = () => {
    const printWin = window.open("", "_blank");
    if (!printWin) return;
    const isFatLoss = client.program === "Fat Loss Phase" || client.program === "Metabolic Health";
    const startW = client.weightData?.[0] || 185;
    const currW = client.weightData?.[client.weightData.length-1] || 183;
    const goalW = startW - 10;
    const ms = Math.min(100, Math.round((client.mealsLogged / 21) * 100));
    const es = Math.min(100, Math.round((client.workoutDays / 5) * 100));
    const mvs = Math.min(100, Math.round((client.steps / 8000) * 100));
    const ss = 78;
    const cs = Math.round(ms * 0.4 + es * 0.25 + mvs * 0.2 + ss * 0.15);
    const pils = [
      { label: "Exercise", days: Math.min(30, client.workoutDays * 4 + 2), color: "#2B7A78" },
      { label: "Steps", days: Math.min(30, Math.round(client.steps / 350)), color: "#3aafa9" },
      { label: "Meals", days: Math.min(30, client.mealsLogged + 5), color: "#ef6c3e" },
      { label: "Sleep", days: 21, color: "#8e7cc3" },
    ];
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${client.name} - Milton Report</title>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: 'DM Sans', sans-serif; color: #1a2e2a; background: #fff; padding: 40px; max-width: 700px; margin: 0 auto; }
      .card { border-radius: 16px; border: 1px solid #e0ebe8; padding: 24px; margin-bottom: 20px; }
      .score-card { background: linear-gradient(135deg, #f7faf9, #eef6f3); text-align: center; padding: 36px 24px; }
      .score-num { font-size: 56px; font-weight: 800; color: #1a2e2a; }
      .score-label { font-size: 16px; font-weight: 700; color: ${cs >= 80 ? "#5CDB95" : cs >= 60 ? "#3aafa9" : "#ef6c3e"}; margin-top: 4px; }
      .sub { font-size: 13px; color: #5f7a76; }
      .pillars { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 12px; }
      .pillar { text-align: center; padding: 14px 8px; border-radius: 12px; background: #fafcfb; border: 1px solid #e0ebe8; }
      .pillar-days { font-size: 22px; font-weight: 800; }
      .pillar-label { font-size: 12px; font-weight: 700; color: #1a2e2a; margin-bottom: 6px; }
      .bar-bg { height: 4px; border-radius: 2px; background: #e8f0ee; margin-top: 8px; }
      .bar-fill { height: 4px; border-radius: 2px; }
      .section-title { font-size: 18px; font-weight: 700; margin-bottom: 12px; }
      .insight-card { background: linear-gradient(135deg, rgba(43,122,120,0.06), rgba(92,219,149,0.06)); border: 1px solid rgba(43,122,120,0.15); }
      .focus-card { background: linear-gradient(140deg, #f2faf8, #eaf6f2); border: 1px solid rgba(43,122,120,0.12); }
      .weights { display: flex; justify-content: center; gap: 24px; margin-top: 14px; }
      .weight-item { text-align: center; }
      .weight-num { font-size: 18px; font-weight: 700; }
      .weight-label { font-size: 11px; color: #5f7a76; font-weight: 600; }
      .goal-row { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; }
      .header { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #e0ebe8; }
      .logo { width: 32px; height: 32px; border-radius: 8px; background: #2B7A78; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 16px; }
      .client-name { font-size: 20px; font-weight: 700; }
      .date { font-size: 12px; color: #5f7a76; }
      @media print { body { padding: 20px; } .no-print { display: none !important; } }
    </style></head><body>
    <div class="header">
      <div class="logo">M</div>
      <div><div class="client-name">${client.name}</div><div class="date">Report generated ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div></div>
    </div>
    <div class="card score-card">
      <div class="sub" style="text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px;">Consistency Score</div>
      <div class="score-num">${cs}</div>
      <div style="font-size:13px;color:#5f7a76;">out of 100</div>
      <div class="score-label">${cs >= 85 ? "Exceptional Consistency" : cs >= 70 ? "Strong Consistency" : cs >= 55 ? "Building Momentum" : "Getting Started"}</div>
      <div style="font-size:13px;color:#5f7a76;margin-top:8px;">Slow & steady wins the race</div>
      <div class="weights">
        <div class="weight-item"><div class="weight-num" style="color:#ef6c3e">${ms}</div><div class="weight-label">Meals (40%)</div></div>
        <div class="weight-item"><div class="weight-num" style="color:#2B7A78">${es}</div><div class="weight-label">Exercise (25%)</div></div>
        <div class="weight-item"><div class="weight-num" style="color:#3aafa9">${mvs}</div><div class="weight-label">Movement (20%)</div></div>
        <div class="weight-item"><div class="weight-num" style="color:#8e7cc3">${ss}</div><div class="weight-label">Sleep (15%)</div></div>
      </div>
    </div>
    <div class="card" style="background:linear-gradient(160deg,#f7fcfb,#eef8f5)">
      <div class="section-title">Primary Goal</div>
      <div class="goal-row"><span class="sub">Target</span><span style="font-size:20px;font-weight:800;color:#2B7A78">${isFatLoss ? goalW + " lbs" : (client.proteinTarget+20) + "g protein"}</span></div>
      <div class="goal-row"><span class="sub">Current</span><span style="font-size:16px;font-weight:700">${isFatLoss ? currW + " lbs" : client.proteinAvg + "g"}</span></div>
      <div class="bar-bg"><div class="bar-fill" style="width:${isFatLoss ? Math.min(100,(Math.abs(client.weightTrend)/10)*100) : Math.min(100,(client.proteinAvg/(client.proteinTarget+20))*100)}%;background:linear-gradient(90deg,#2B7A78,#5CDB95)"></div></div>
    </div>
    <div class="card" style="background:linear-gradient(145deg,#faf9f7,#f5f8f4)">
      <div class="section-title">Rule of 30</div>
      <div class="sub" style="margin-bottom:14px">Every 30 days you unlock a new learning about yourself</div>
      <div class="pillars">
        ${pils.map(p => `<div class="pillar"><div class="pillar-label">${p.label}</div><div class="pillar-days" style="color:${p.color}">${p.days}<span style="font-size:12px;font-weight:500;color:#5f7a76"> / 30</span></div><div class="bar-bg"><div class="bar-fill" style="width:${Math.round(p.days/30*100)}%;background:${p.color}"></div></div></div>`).join("")}
      </div>
    </div>
    <div class="card focus-card">
      <div style="font-size:11px;font-weight:700;color:#2B7A78;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px">This Week's Focus</div>
      <div style="font-size:18px;font-weight:700;line-height:1.4">${client.coachAngle}</div>
    </div>
    <div style="text-align:center;margin-top:24px;color:#5f7a76;font-size:11px">
      Generated by Milton AI &bull; miltonai.com
    </div>
    <div class="no-print" style="text-align:center;margin-top:24px;">
      <button onclick="window.print()" style="padding:12px 28px;border-radius:10px;background:#2B7A78;color:#fff;font-size:14px;font-weight:600;border:none;cursor:pointer;font-family:DM Sans,sans-serif">Save as PDF</button>
    </div>
    </body></html>`;
    printWin.document.write(html);
    printWin.document.close();
  };

  // Consistency score calculation (Meals 40%, Exercise 25%, Movement 20%, Sleep 15%)
  const mealsScore = Math.min(100, Math.round((client.mealsLogged / 21) * 100));
  const exerciseScore = Math.min(100, Math.round((client.workoutDays / 5) * 100));
  const movementScore = Math.min(100, Math.round((client.steps / 8000) * 100));
  const sleepScore = 78; // simulated
  const consistencyScore = Math.round(mealsScore * 0.4 + exerciseScore * 0.25 + movementScore * 0.2 + sleepScore * 0.15);

  // Rule of 30 data (days logged out of 30)
  const pillars = [
    { key: "exercise", label: "Exercise", days: Math.min(30, client.workoutDays * 4 + 2), color: TEAL, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><rect x="1" y="10" width="4" height="4" rx="1"/><rect x="19" y="10" width="4" height="4" rx="1"/><rect x="5" y="7" width="3" height="10" rx="1"/><rect x="16" y="7" width="3" height="10" rx="1"/><line x1="8" y1="12" x2="16" y2="12"/></svg> },
    { key: "steps", label: "Steps", days: Math.min(30, Math.round(client.steps / 350)), color: "#3aafa9", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18 Q3 12 6 9 Q8 7 9 8 L11 11 Q12 12.5 14 12.5 L18 12.5 Q21 13 21 16 L21 17 Q21 19 19 19 L5 19 Q3 19 3 18Z"/><line x1="8" y1="19" x2="8" y2="16"/><line x1="12" y1="19" x2="12" y2="16"/><line x1="16" y1="19" x2="16" y2="16"/></svg> },
    { key: "meals", label: "Meals", days: Math.min(30, client.mealsLogged + 5), color: "#ef6c3e", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3Q13 2 14.5 3 Q13 4 12 5.5"/><path d="M12 5.5 Q7 5 5 9 Q3 13 5 17 Q7 21 11.5 21 Q12 20 12.5 21 Q17 21 19 17 Q21 13 19 9 Q17 5 12 5.5Z"/></svg> },
    { key: "sleep", label: "Sleep", days: Math.min(30, 21), color: "#8e7cc3", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg> },
  ];

  // Calendar data (28 days, 4 weeks)
  const calDays = Array.from({ length: 28 }).map((_, i) => {
    const seed = (i * 7 + client.name.charCodeAt(0)) % 100;
    return {
      exercise: seed < exerciseScore,
      steps: seed < movementScore + 5,
      meals: seed < mealsScore - 5,
      sleep: seed < sleepScore + 3,
    };
  });

  // Circular progress ring with icon
  const PillarRing = ({ days, color, icon, size = 110 }) => {
    const pct = Math.min(100, (days / 30) * 100);
    const r = size / 2 - 12;
    const circ = 2 * Math.PI * r;
    const offset = circ * (1 - pct / 100);
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e8f0ee" strokeWidth="10"/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`}
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)" }}
        />
        <g transform={`translate(${size/2 - 9}, ${size/2 - 9})`} style={{ color }}>
          {icon}
        </g>
      </svg>
    );
  };

  const SectionCard = ({ children, style: s }) => (
    <div style={{
      background: WHITE, borderRadius: 20, border: `1px solid ${BORDER}`,
      padding: isMobile ? "20px" : "28px 32px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", ...s
    }}>{children}</div>
  );

  const DetailCard = ({ pillar, expanded, onToggle }) => {
    const detailData = {
      exercise: { items: [{ l: "Workouts", v: `${client.workoutDays}/week`, g: "5/week" }, { l: "Avg Duration", v: "48 min", g: "45 min" }, { l: "Top Type", v: "Strength" }, { l: "Intensity", v: "Moderate-High" }] },
      steps: { items: [{ l: "Daily Avg", v: client.steps?.toLocaleString(), g: "10,000" }, { l: "Active Minutes", v: "42 min", g: "45 min" }, { l: "Distance", v: "3.8 mi", g: "4.5 mi" }, { l: "Floors", v: "8", g: "10" }] },
      meals: { items: [{ l: "Calories Avg", v: "1,580", g: "1,800" }, { l: "Protein", v: `${client.proteinAvg}g`, g: `${client.proteinTarget}g` }, { l: "Carbs", v: `${Math.round(client.proteinAvg * 1.8)}g`, g: `${Math.round(client.proteinTarget * 2)}g` }, { l: "Fats", v: `${Math.round(client.proteinAvg * 0.55)}g`, g: `${Math.round(client.proteinTarget * 0.6)}g` }, { l: "Fiber", v: "22g", g: "30g" }, { l: "Water", v: "64 oz", g: "80 oz" }] },
      sleep: { items: [{ l: "Avg Duration", v: "6.8 hrs", g: "8 hrs" }, { l: "Bedtime", v: "11:15 PM", g: "10:30 PM" }, { l: "Consistency", v: "72%", g: "85%" }, { l: "Quality", v: "Good" }] },
    };
    const d = detailData[pillar.key];
    return (
      <div onClick={onToggle} style={{
        background: WHITE, borderRadius: 16, border: `1px solid ${expanded ? pillar.color : BORDER}`,
        padding: "16px 18px", cursor: "pointer",
        boxShadow: expanded ? `0 2px 12px ${pillar.color}20` : "0 1px 4px rgba(0,0,0,0.03)",
        transition: "all 0.2s ease"
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, background: `${pillar.color}15`,
              display: "flex", alignItems: "center", justifyContent: "center", color: pillar.color
            }}>{pillar.icon}</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>{pillar.label}</div>
              <div style={{ fontSize: 12, color: TEXT_SEC }}>{pillar.days}/30 days logged</div>
            </div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={TEXT_SEC} strokeWidth="2" strokeLinecap="round"
            style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}>
            <polyline points="6,9 12,15 18,9"/>
          </svg>
        </div>
        {expanded && d && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${BORDER}`, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {d.items.map((item, j) => {
              const hasGoal = item.g !== undefined;
              const numVal = parseFloat(String(item.v).replace(/[^0-9.]/g, ""));
              const numGoal = hasGoal ? parseFloat(String(item.g).replace(/[^0-9.]/g, "")) : 0;
              const pct = hasGoal && numGoal > 0 ? Math.min(100, (numVal / numGoal) * 100) : 0;
              const met = hasGoal && pct >= 95;
              const close = hasGoal && pct >= 80 && pct < 95;
              return (
                <div key={j} style={{ padding: "8px 10px", borderRadius: 10, background: "#f8faf9" }}>
                  <div style={{ fontSize: 11, color: TEXT_SEC, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{item.l}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: TEXT, marginTop: 2 }}>{item.v}</div>
                  {hasGoal && (
                    <>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3 }}>
                        <span style={{ fontSize: 10, color: met ? ALERT_GREEN : close ? "#d4a63c" : TEXT_SEC, fontWeight: 600 }}>Goal: {item.g}</span>
                        {met && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={ALERT_GREEN} strokeWidth="3" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg>}
                      </div>
                      <div style={{ width: "100%", height: 3, borderRadius: 2, background: "#e8f0ee", marginTop: 3 }}>
                        <div style={{ width: `${pct}%`, height: "100%", borderRadius: 2, background: met ? ALERT_GREEN : close ? "#d4a63c" : pillar.color, transition: "width 0.6s ease" }} />
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Score ring color
  const scoreColor = consistencyScore >= 80 ? MINT : consistencyScore >= 60 ? SAGE : "#ef6c3e";

  return (
    <div style={{
      flex: 1, overflowY: "auto",
      padding: isMobile ? "68px 14px 76px" : "24px 28px",
      display: "flex", flexDirection: "column", gap: isMobile ? 14 : 18
    }}>
      {/* Back */}
      {!isMobile && <div onClick={onBack} style={{
        display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
        color: TEXT_SEC, fontSize: 14, fontWeight: 600, width: "fit-content"
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15,18 9,12 15,6"/></svg>
        Back to {client.name}
      </div>}

      {/* ─── HERO: CONSISTENCY SCORE ─── */}
      <SectionCard style={{
        background: `linear-gradient(135deg, #f7faf9, #eef6f3, #f0f8f5)`,
        textAlign: "center", padding: isMobile ? "28px 20px" : "36px 32px",
        position: "relative", overflow: "hidden"
      }}>
        {/* Subtle radial glow */}
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          width: 300, height: 300, borderRadius: "50%",
          background: `radial-gradient(circle, ${scoreColor}18 0%, transparent 70%)`,
          pointerEvents: "none"
        }} />
        <div style={{ fontSize: 12, fontWeight: 700, color: TEXT_SEC, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6, position: "relative" }}>
          {client.name}'s Consistency Score
        </div>
        <div style={{ position: "relative", display: "inline-block", margin: "12px 0" }}>
          {(() => {
            const sz = isMobile ? 180 : 220;
            const r = sz / 2 - 16;
            const circ = 2 * Math.PI * r;
            const offset = circ * (1 - consistencyScore / 100);
            return (
              <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`}>
                <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke="#e0ebe8" strokeWidth="12"/>
                <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke={scoreColor} strokeWidth="12"
                  strokeDasharray={circ} strokeDashoffset={offset}
                  strokeLinecap="round" transform={`rotate(-90 ${sz/2} ${sz/2})`}
                  style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1)" }}
                />
                {/* Inner subtle ring */}
                <circle cx={sz/2} cy={sz/2} r={r - 18} fill="none" stroke={`${scoreColor}15`} strokeWidth="1"/>
                <text x={sz/2} y={sz/2 - 8} textAnchor="middle" dominantBaseline="central"
                  style={{ fontSize: isMobile ? 52 : 64, fontWeight: 800, fill: TEXT, fontFamily: font }}>
                  {consistencyScore}
                </text>
                <text x={sz/2} y={sz/2 + (isMobile ? 28 : 34)} textAnchor="middle" dominantBaseline="central"
                  style={{ fontSize: 13, fontWeight: 600, fill: TEXT_SEC, fontFamily: font, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  out of 100
                </text>
              </svg>
            );
          })()}
        </div>
        <div style={{ position: "relative" }}>
          <div style={{ fontSize: isMobile ? 16 : 18, fontWeight: 700, color: scoreColor, marginBottom: 6 }}>
            {consistencyScore >= 85 ? "Exceptional Consistency" : consistencyScore >= 70 ? "Strong Consistency" : consistencyScore >= 55 ? "Building Momentum" : "Getting Started"}
          </div>
          <div style={{ fontSize: 13, color: TEXT_SEC, maxWidth: 400, margin: "0 auto", lineHeight: 1.55 }}>
            Slow & steady wins the race. This score reflects daily commitment across meals, exercise, movement, and sleep.
          </div>
        </div>
        {/* Weight breakdown */}
        <div style={{ display: "flex", justifyContent: "center", gap: isMobile ? 12 : 20, marginTop: 18, position: "relative" }}>
          {[
            { label: "Meals", pct: mealsScore, weight: "40%", color: "#ef6c3e" },
            { label: "Exercise", pct: exerciseScore, weight: "25%", color: TEAL },
            { label: "Movement", pct: movementScore, weight: "20%", color: "#3aafa9" },
            { label: "Sleep", pct: sleepScore, weight: "15%", color: "#8e7cc3" },
          ].map((w, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: w.color }}>{w.pct}</div>
              <div style={{ fontSize: 11, color: TEXT_SEC, fontWeight: 600 }}>{w.label}</div>
              <div style={{ fontSize: 10, color: TEXT_SEC }}>{w.weight}</div>
            </div>
          ))}
        </div>
      </SectionCard>


      {/* ─── TRANSFORMATION ─── */}
      <SectionCard style={{ background: `linear-gradient(145deg, #f0f9f5, #eaf6f2, #f5faf8)` }}>
        {(() => {
          const isFatLoss = client.program === "Fat Loss Phase" || client.program === "Metabolic Health";
          const startW = (client.weightData?.[0] || 185) + 4;
          const currW = client.weightData?.[client.weightData.length-1] || 183;
          const goalLabel = isFatLoss ? "Weight" : "Protein";
          const goalUnit = isFatLoss ? " lbs" : "g";
          const weeks = ["Week 1", "Week 2", "Week 3", "Week 4"];
          const w1c = Math.max(15, consistencyScore - 32 - (client.name.charCodeAt(0) % 8));
          const consistencyData = [w1c, w1c + 12, w1c + 22, consistencyScore];
          const goalData = isFatLoss
            ? [startW, startW - 1.2, startW - 2.5, currW]
            : [client.proteinAvg - 28, client.proteinAvg - 16, client.proteinAvg - 6, client.proteinAvg];
          const cw2 = 420, ch2 = 200, pL = 44, pR = 44, pT = 16, pB = 32;
          const pW = cw2 - pL - pR, pH = ch2 - pT - pB;
          const toYc = (v) => pT + (1 - v / 100) * pH;
          const toX = (i) => pL + (i / (weeks.length - 1)) * pW;
          const gVals = goalData;
          const gMin = Math.min(...gVals) - 3, gMax = Math.max(...gVals) + 3;
          const toYg = (v) => pT + (1 - (v - gMin) / (gMax - gMin)) * pH;
          const smooth = (pts) => { let d = `M ${pts[0].x},${pts[0].y}`; for (let i = 0; i < pts.length - 1; i++) { const cp = (pts[i+1].x - pts[i].x) / 2.5; d += ` C ${pts[i].x+cp},${pts[i].y} ${pts[i+1].x-cp},${pts[i+1].y} ${pts[i+1].x},${pts[i+1].y}`; } return d; };
          const cPts = consistencyData.map((v, i) => ({ x: toX(i), y: toYc(v) }));
          const gPts = goalData.map((v, i) => ({ x: toX(i), y: toYg(v) }));
          const cPath = smooth(cPts);
          const gPath = smooth(gPts);
          const cArea = `${cPath} L ${cPts[cPts.length-1].x},${pT + pH} L ${cPts[0].x},${pT + pH} Z`;
          const cLast = cPts[cPts.length - 1];
          const gLast = gPts[gPts.length - 1];
          const scoreChange = consistencyScore - w1c;
          const totalChange = isFatLoss ? `${(startW - currW).toFixed(1)} lbs lost` : `+${client.proteinAvg - (client.proteinAvg - 28)}g protein`;

          return (<>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
              <div>
                <div style={{ fontSize: isMobile ? 18 : 20, fontWeight: 700, color: TEXT }}>Your Transformation</div>
                <div style={{ fontSize: 13, color: TEXT_SEC, marginTop: 2 }}>Consistency drives results — 4 weeks of progress</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ padding: "4px 10px", borderRadius: 16, background: `${TEAL}12`, fontSize: 11, fontWeight: 700, color: TEAL }}>+{scoreChange} pts</div>
                <div style={{ padding: "4px 10px", borderRadius: 16, background: `${ALERT_GREEN}15`, fontSize: 11, fontWeight: 700, color: ALERT_GREEN }}>{totalChange}</div>
              </div>
            </div>
            <div style={{ borderRadius: 14, background: WHITE, border: `1px solid ${BORDER}`, padding: isMobile ? "10px 6px" : "14px 10px" }}>
              <svg width="100%" height={ch2} viewBox={`0 0 ${cw2} ${ch2}`} preserveAspectRatio="xMidYMid meet" style={{ display: "block" }}>
                <defs>
                  <linearGradient id="rcAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={TEAL} stopOpacity="0.12"/>
                    <stop offset="100%" stopColor={TEAL} stopOpacity="0.01"/>
                  </linearGradient>
                </defs>
                {[0, 25, 50, 75, 100].map((v, i) => (
                  <line key={i} x1={pL} y1={toYc(v)} x2={cw2 - pR} y2={toYc(v)} stroke={BORDER} strokeWidth="0.7" opacity="0.5"/>
                ))}
                {[0, 50, 100].map((v, i) => (
                  <text key={i} x={pL - 6} y={toYc(v) + 3} textAnchor="end" fill={TEAL} fontSize="10" fontWeight="600" fontFamily="DM Sans, sans-serif">{v}</text>
                ))}
                {[gMin + 1, (gMin + gMax) / 2, gMax - 1].map((v, i) => (
                  <text key={i} x={cw2 - pR + 6} y={toYg(v) + 3} textAnchor="start" fill={ALERT_GREEN} fontSize="10" fontWeight="600" fontFamily="DM Sans, sans-serif">{Math.round(v)}</text>
                ))}
                {weeks.map((w, i) => (
                  <text key={i} x={toX(i)} y={ch2 - 6} textAnchor="middle" fill={TEXT_SEC} fontSize="10" fontWeight="600" fontFamily="DM Sans, sans-serif">{w}</text>
                ))}
                <path d={cArea} fill="url(#rcAreaGrad)" />
                <path d={cPath} fill="none" stroke={TEAL} strokeWidth="2.5" strokeLinecap="round" />
                <path d={gPath} fill="none" stroke={ALERT_GREEN} strokeWidth="2.5" strokeLinecap="round" strokeDasharray="6,4" />
                {cPts.map((p, i) => (
                  <g key={`rc${i}`}>
                    {i === cPts.length - 1 && <circle cx={p.x} cy={p.y} r="8" fill={TEAL} opacity="0.1"/>}
                    <circle cx={p.x} cy={p.y} r={i === cPts.length - 1 ? 5 : 3.5} fill={WHITE} stroke={TEAL} strokeWidth="2"/>
                  </g>
                ))}
                {gPts.map((p, i) => (
                  <g key={`rg${i}`}>
                    {i === gPts.length - 1 && <circle cx={p.x} cy={p.y} r="8" fill={ALERT_GREEN} opacity="0.1"/>}
                    <circle cx={p.x} cy={p.y} r={i === gPts.length - 1 ? 5 : 3.5} fill={WHITE} stroke={ALERT_GREEN} strokeWidth="2"/>
                  </g>
                ))}
                <g>
                  <rect x={cLast.x - 16} y={cLast.y - 22} width="32" height="16" rx="8" fill={TEAL}/>
                  <text x={cLast.x} y={cLast.y - 11.5} textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700" fontFamily="DM Sans">{consistencyScore}</text>
                </g>
                <g>
                  <rect x={gLast.x - 22} y={gLast.y + 8} width="44" height="16" rx="8" fill={ALERT_GREEN}/>
                  <text x={gLast.x} y={gLast.y + 18.5} textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700" fontFamily="DM Sans">{isFatLoss ? `${currW}` : `${client.proteinAvg}g`}</text>
                </g>
              </svg>
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: isMobile ? 16 : 24, marginTop: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 16, height: 3, borderRadius: 2, background: TEAL }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: TEXT_SEC }}>Consistency Score</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 16, height: 0, borderTop: `2.5px dashed ${ALERT_GREEN}` }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: TEXT_SEC }}>{goalLabel}</span>
              </div>
            </div>
          </>);
        })()}
      </SectionCard>

      {/* ─── GOAL PROGRESS ─── */}
      <SectionCard style={{ background: `linear-gradient(160deg, #f7fcfb, #eef8f5, #f5faf8)` }}>
        <div style={{ marginBottom: 6 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: TEXT_SEC, textTransform: "uppercase", letterSpacing: "0.1em" }}>We predict you'll reach</div>
        </div>
        {(() => {
          const isFatLoss = client.program === "Fat Loss Phase" || client.program === "Metabolic Health";
          const startVal = isFatLoss ? (client.weightData?.[0] || 185) : client.proteinAvg;
          const currentVal = isFatLoss ? (client.weightData?.[client.weightData.length-1] || 183) : client.proteinAvg;
          const goalVal = isFatLoss ? startVal - 10 : client.proteinTarget + 20;
          const unit = isFatLoss ? "lbs" : "g protein/day";
          const goalLabel = isFatLoss ? "Weight Goal" : "Protein Goal";
          const weeksTotal = 12;
          const weeksCurrent = 4;
          const projectedWeeks = Math.round(weeksTotal * 0.9);
          const goalDown = isFatLoss;

          // Chart dimensions
          const cw = 380, ch = 180, padL = 44, padR = 20, padT = 20, padB = 36;
          const plotW = cw - padL - padR, plotH = ch - padT - padB;

          // Value range
          const valMin = goalDown ? goalVal - 2 : startVal - 5;
          const valMax = goalDown ? startVal + 2 : goalVal + 5;
          const valRange = valMax - valMin;

          const toY = (v) => padT + (1 - (v - valMin) / valRange) * plotH;
          const toX = (w) => padL + (w / weeksTotal) * plotW;

          // Actual data points (weeks 0 to current)
          const actualPts = [];
          for (let w = 0; w <= weeksCurrent; w++) {
            const t = w / weeksCurrent;
            const v = startVal + (currentVal - startVal) * t + (Math.sin(t * 4) * 0.5);
            actualPts.push({ x: toX(w), y: toY(v) });
          }

          // Projected path (current to goal)
          const projPts = [];
          for (let w = weeksCurrent; w <= weeksTotal; w++) {
            const t = (w - weeksCurrent) / (weeksTotal - weeksCurrent);
            const v = currentVal + (goalVal - currentVal) * (t * t * 0.3 + t * 0.7);
            projPts.push({ x: toX(w), y: toY(v) });
          }

          // Smooth curve builder
          const smooth = (pts) => {
            if (pts.length < 2) return "";
            let d = `M ${pts[0].x},${pts[0].y}`;
            for (let i = 0; i < pts.length - 1; i++) {
              const cp = (pts[i+1].x - pts[i].x) / 2.5;
              d += ` C ${pts[i].x+cp},${pts[i].y} ${pts[i+1].x-cp},${pts[i+1].y} ${pts[i+1].x},${pts[i+1].y}`;
            }
            return d;
          };

          const actualPath = smooth(actualPts);
          const projPath = smooth(projPts);
          const lastActual = actualPts[actualPts.length - 1];
          const goalY = toY(goalVal);
          const goalX = toX(weeksTotal);

          // Area under actual path
          const actualArea = `${actualPath} L ${lastActual.x},${padT + plotH} L ${actualPts[0].x},${padT + plotH} Z`;

          return (
            <>
              <div style={{ fontSize: isMobile ? 22 : 28, fontWeight: 800, color: TEXT, marginBottom: 2 }}>
                <span style={{ color: TEAL }}>{goalDown ? goalVal : goalVal + "g"}</span> {unit.replace("g protein/day","").replace("lbs","")} by <span style={{ color: TEAL }}>Week {weeksTotal}</span>
              </div>
              <div style={{ fontSize: 13, color: TEXT_SEC, marginBottom: 16 }}>
                {goalLabel}: {startVal}{isFatLoss ? " lbs" : "g"} → {goalVal}{isFatLoss ? " lbs" : "g"} • Currently at <strong style={{ color: TEXT }}>{currentVal}{isFatLoss ? " lbs" : "g"}</strong>
              </div>

              {/* Chart */}
              <div style={{
                borderRadius: 16, background: "#f7faf9", border: `1px solid ${BORDER}`,
                padding: isMobile ? "12px 8px" : "16px 12px", marginBottom: 16
              }}>
                <svg width="100%" height={ch} viewBox={`0 0 ${cw} ${ch}`} preserveAspectRatio="xMidYMid meet" style={{ display: "block" }}>
                  <defs>
                    <linearGradient id="goalAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={TEAL} stopOpacity="0.15"/>
                      <stop offset="100%" stopColor={TEAL} stopOpacity="0.02"/>
                    </linearGradient>
                  </defs>

                  {/* Y-axis grid lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
                    const v = valMin + t * valRange;
                    const y = toY(v);
                    return (
                      <g key={i}>
                        <line x1={padL} y1={y} x2={cw - padR} y2={y} stroke={BORDER} strokeWidth="1" />
                        <text x={padL - 6} y={y + 4} textAnchor="end" fill={TEXT_SEC} fontSize="10" fontFamily="DM Sans, sans-serif">
                          {Math.round(v)}
                        </text>
                      </g>
                    );
                  })}

                  {/* Goal line (horizontal dashed) */}
                  <line x1={padL} y1={goalY} x2={cw - padR} y2={goalY}
                    stroke={TEAL} strokeWidth="1.5" strokeDasharray="6,4" opacity="0.5"/>

                  {/* Area under actual */}
                  <path d={actualArea} fill="url(#goalAreaGrad)" />

                  {/* Actual line (solid, thick) */}
                  <path d={actualPath} fill="none" stroke={TEAL} strokeWidth="3" strokeLinecap="round" />

                  {/* Projected line (dashed, thinner) */}
                  <path d={projPath} fill="none" stroke={MINT} strokeWidth="2.5" strokeLinecap="round" strokeDasharray="8,5" />

                  {/* Start label pill */}
                  <g>
                    <rect x={actualPts[0].x - 24} y={actualPts[0].y - 24} width="48" height="20" rx="10" fill={TEAL}/>
                    <text x={actualPts[0].x} y={actualPts[0].y - 11} textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700" fontFamily="DM Sans">{startVal}{isFatLoss ? "" : "g"}</text>
                  </g>

                  {/* Current position dot + label */}
                  <circle cx={lastActual.x} cy={lastActual.y} r="10" fill={TEAL} opacity="0.12"/>
                  <circle cx={lastActual.x} cy={lastActual.y} r="6" fill={WHITE} stroke={TEAL} strokeWidth="3"/>
                  <g>
                    <rect x={lastActual.x - 28} y={lastActual.y - 28} width="56" height="20" rx="10" fill={TEAL}/>
                    <text x={lastActual.x} y={lastActual.y - 15} textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700" fontFamily="DM Sans">{currentVal}{isFatLoss ? " lbs" : "g"}</text>
                  </g>

                  {/* Goal endpoint */}
                  <circle cx={goalX} cy={goalY} r="8" fill={MINT} opacity="0.2"/>
                  <circle cx={goalX} cy={goalY} r="5" fill={MINT}/>
                  <rect x={goalX - 22} y={goalY + 10} width="44" height="18" rx="9" fill={MINT}/>
                  <text x={goalX} y={goalY + 22} textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700" fontFamily="DM Sans">{goalVal}{isFatLoss ? "" : "g"}</text>

                  {/* "Now" marker line */}
                  <line x1={lastActual.x} y1={padT} x2={lastActual.x} y2={padT + plotH}
                    stroke={TEXT_SEC} strokeWidth="1" strokeDasharray="3,3" opacity="0.3"/>
                  <text x={lastActual.x} y={ch - 6} textAnchor="middle" fill={TEXT} fontSize="10" fontWeight="700" fontFamily="DM Sans">Now</text>

                  {/* Week labels */}
                  <text x={toX(0)} y={ch - 6} textAnchor="middle" fill={TEXT_SEC} fontSize="10" fontFamily="DM Sans">W1</text>
                  <text x={toX(weeksTotal)} y={ch - 6} textAnchor="middle" fill={TEXT_SEC} fontSize="10" fontFamily="DM Sans">W{weeksTotal}</text>
                </svg>
              </div>

              {/* Callouts */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { text: `${goalDown ? "Down" : "Up"} ${Math.abs(Math.round((currentVal - startVal) * 10) / 10)} ${isFatLoss ? "lbs" : "g"} from starting point`, check: true },
                  { text: `On track to reach goal by Week ${projectedWeeks}`, check: true },
                  { text: "Consistency score supports this projection", check: consistencyScore >= 65 },
                ].map((c, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                      background: c.check ? "#e8f5e9" : "#fff3e0",
                      display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                      {c.check ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={ALERT_GREEN} strokeWidth="3" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg>
                      ) : (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef6c3e" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="0.5"/></svg>
                      )}
                    </div>
                    <span style={{ fontSize: 13, color: TEXT, fontWeight: 500 }}>{c.text}</span>
                  </div>
                ))}
              </div>
            </>
          );
        })()}
      </SectionCard>

      {/* ─── RULE OF 30: PROGRESS RINGS ─── */}
      <SectionCard style={{ background: `linear-gradient(145deg, #faf9f7, #f5f8f4, #f8faf7)` }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: isMobile ? 18 : 20, fontWeight: 700, color: TEXT }}>Rule of 30</div>
            <div style={{ fontSize: 13, color: TEXT_SEC, marginTop: 2 }}>Every 30 days you unlock a new learning about yourself</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: isMobile ? 12 : 16 }}>
          {pillars.map((p) => {
            const fillPct = (p.days / 30) * 100;
            return (
            <div key={p.key} style={{
              borderRadius: 16, border: `1px solid ${BORDER}`, padding: isMobile ? "14px 10px" : "18px 14px",
              background: "#fafcfb", textAlign: "center",
              display: "flex", flexDirection: "column", alignItems: "center"
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, marginBottom: 10 }}>{p.label}</div>
              <PillarRing days={p.days} color={p.color} icon={p.icon} size={isMobile ? 90 : 110} />
              <div style={{ marginTop: 10 }}>
                <span style={{ fontSize: 24, fontWeight: 800, color: p.color }}>{p.days}</span>
                <span style={{ fontSize: 13, color: TEXT_SEC, fontWeight: 500 }}> / 30</span>
              </div>
              <div style={{ fontSize: 11, color: fillPct >= 90 ? ALERT_GREEN : TEXT_SEC, fontWeight: 600, marginTop: 2 }}>
                {fillPct >= 90 ? "Almost there!" : fillPct >= 60 ? "Keep going!" : "Building..."}
              </div>
            </div>
            );
          })}
        </div>
      </SectionCard>

      {/* ─── DETAIL BREAKOUTS ─── */}
      <SectionCard style={{ background: `linear-gradient(150deg, #faf8f5, #f8f6f2, #faf9f6)` }}>
        <div style={{ fontSize: isMobile ? 18 : 20, fontWeight: 700, color: TEXT, marginBottom: 4 }}>Detail Breakouts</div>
        <div style={{ fontSize: 13, color: TEXT_SEC, marginBottom: 16 }}>Tap to expand each category</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {pillars.map(p => (
            <DetailCard
              key={p.key} pillar={p}
              expanded={expandedDetail === p.key}
              onToggle={() => setExpandedDetail(expandedDetail === p.key ? null : p.key)}
            />
          ))}
        </div>
      </SectionCard>

      {/* ─── CALENDAR HEATMAP ─── */}
      <SectionCard style={{ background: `linear-gradient(155deg, #f8f7fc, #f4f6fa, #f7f9fc)` }}>
        <div style={{ fontSize: isMobile ? 18 : 20, fontWeight: 700, color: TEXT, marginBottom: 4 }}>Daily Activity Calendar</div>
        <div style={{ fontSize: 13, color: TEXT_SEC, marginBottom: 16 }}>Last 28 days — each dot is a tracked category</div>

        {/* Day headers */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: isMobile ? 4 : 6, marginBottom: 6 }}>
          {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => (
            <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 600, color: TEXT_SEC }}>{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: isMobile ? 4 : 6 }}>
          {calDays.map((day, i) => {
            const dots = [
              day.exercise && TEAL,
              day.steps && "#3aafa9",
              day.meals && "#ef6c3e",
              day.sleep && "#8e7cc3",
            ].filter(Boolean);
            const count = dots.length;
            return (
              <div key={i} style={{
                aspectRatio: "1", borderRadius: isMobile ? 8 : 10,
                background: count === 4 ? "#eef6f3" : count >= 2 ? "#f5f8f7" : "#fafcfb",
                border: `1px solid ${count === 4 ? "#c8e6c9" : BORDER}`,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                gap: 2, position: "relative"
              }}>
                <div style={{ display: "flex", gap: 3, flexWrap: "wrap", justifyContent: "center" }}>
                  {dots.map((c, j) => (
                    <div key={j} style={{ width: isMobile ? 5 : 7, height: isMobile ? 5 : 7, borderRadius: "50%", background: c }} />
                  ))}
                </div>
                {count === 0 && <div style={{ width: isMobile ? 5 : 7, height: isMobile ? 5 : 7, borderRadius: "50%", border: "1.5px dashed #d0dbd7" }} />}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: isMobile ? 10 : 16, marginTop: 14, justifyContent: "center" }}>
          {[
            { label: "Exercise", color: TEAL },
            { label: "Steps", color: "#3aafa9" },
            { label: "Meals", color: "#ef6c3e" },
            { label: "Sleep", color: "#8e7cc3" },
          ].map((l, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: TEXT_SEC }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: l.color }} />
              {l.label}
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ─── ONE RECOMMENDATION ─── */}
      <SectionCard style={{ background: `linear-gradient(140deg, #f2faf8, #eaf6f2, #f0f9f5)`, border: `1px solid rgba(43,122,120,0.12)` }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: TEAL, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>
          This Week's Focus
        </div>
        <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700, color: TEXT, lineHeight: 1.4 }}>
          {client.coachAngle}
        </div>
      </SectionCard>

      {/* ─── Share / Export ─── */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        <div onClick={() => setShowShare(true)} style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "14px 18px",
          borderRadius: 14, cursor: "pointer", fontSize: 14, fontWeight: 600,
          background: TEAL, color: "#fff", boxShadow: "0 2px 8px rgba(43,122,120,0.3)",
          minWidth: 160
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M22 2L11 13"/><polygon points="22,2 15,22 11,13 2,9"/></svg>
          Share with {client.name.split(" ")[0]}
        </div>
        <div onClick={handleExportPDF} style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "14px 18px",
          borderRadius: 14, cursor: "pointer", fontSize: 14, fontWeight: 600,
          background: WHITE, color: TEXT, border: `1px solid ${BORDER}`, boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          minWidth: 160
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export PDF
        </div>
      </div>

      {/* ═══ SHARE MODAL ═══ */}
      {showShare && (<>
        <div onClick={() => setShowShare(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 200 }} />
        <div style={{
          position: "fixed",
          top: isMobile ? "auto" : "50%", bottom: isMobile ? 0 : "auto",
          left: isMobile ? 0 : "50%", transform: isMobile ? "none" : "translate(-50%, -50%)",
          width: isMobile ? "100%" : 440, maxHeight: isMobile ? "85vh" : "auto",
          background: WHITE, borderRadius: isMobile ? "24px 24px 0 0" : 24,
          zIndex: 210, padding: isMobile ? "24px 20px 32px" : "28px 32px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)", border: `1px solid ${BORDER}`,
          display: "flex", flexDirection: "column", gap: 18
        }}>
          {/* Drag handle mobile */}
          {isMobile && <div style={{ width: 36, height: 4, borderRadius: 2, background: BORDER, margin: "0 auto 4px" }} />}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: TEXT }}>Share Report</div>
              <div style={{ fontSize: 13, color: TEXT_SEC }}>Send {client.name.split(" ")[0]}'s progress report</div>
            </div>
            <div onClick={() => setShowShare(false)} style={{
              width: 32, height: 32, borderRadius: 8, background: "#f0f4f3",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: TEXT_SEC
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </div>
          </div>

          {/* Link */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: TEXT_SEC, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Report Link</div>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{
                flex: 1, padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${BORDER}`,
                fontSize: 13, color: TEXT, background: "#f8faf9", overflow: "hidden",
                textOverflow: "ellipsis", whiteSpace: "nowrap"
              }}>{shareLink}</div>
              <div onClick={handleCopyLink} style={{
                padding: "10px 16px", borderRadius: 10, cursor: "pointer",
                fontSize: 13, fontWeight: 600,
                background: linkCopied ? ALERT_GREEN : TEAL, color: "#fff",
                display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap",
                transition: "all 0.2s ease", boxShadow: "0 2px 6px rgba(43,122,120,0.2)"
              }}>
                {linkCopied ? (
                  <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg>Copied</>
                ) : (
                  <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>Copy</>
                )}
              </div>
            </div>
          </div>

          {/* Share options */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: TEXT_SEC, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Send Via</div>
            <div style={{ display: "flex", gap: 10 }}>
              {[
                { label: "Email", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="3"/><polyline points="22,4 12,13 2,4"/></svg>, color: TEAL,
                  action: () => window.open(`mailto:?subject=${encodeURIComponent(`${client.name}'s Progress Report - Milton`)}&body=${encodeURIComponent(`Hi ${client.name.split(" ")[0]},\n\nHere's your latest progress report from Milton:\n\n${shareLink}\n\nKeep up the great work!`)}`) },
                { label: "Text", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>, color: "#3aafa9",
                  action: () => window.open(`sms:?body=${encodeURIComponent(`Check out your Milton progress report: ${shareLink}`)}`) },
                { label: "WhatsApp", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>, color: "#25D366",
                  action: () => window.open(`https://wa.me/?text=${encodeURIComponent(`Check out your Milton progress report: ${shareLink}`)}`) },
              ].map((opt, i) => (
                <div key={i} onClick={opt.action} style={{
                  flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                  padding: "14px 10px", borderRadius: 14, cursor: "pointer",
                  background: "#f8faf9", border: `1px solid ${BORDER}`,
                  transition: "all 0.15s ease"
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = opt.color; e.currentTarget.style.background = `${opt.color}08`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.background = "#f8faf9"; }}
                >
                  <div style={{ color: opt.color }}>{opt.icon}</div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: TEXT }}>{opt.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Also export */}
          <div onClick={() => { setShowShare(false); handleExportPDF(); }} style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            padding: "12px 18px", borderRadius: 12, cursor: "pointer",
            fontSize: 13, fontWeight: 600, color: TEXT_SEC,
            background: "#f8faf9", border: `1px solid ${BORDER}`
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Or export as PDF instead
          </div>
        </div>
      </>)}
    </div>
  );
}

/* ─── Data Card Period Tabs ─── */
function DataCardPeriods({ periods, color, isMobile }) {
  const [activePeriod, setActivePeriod] = useState(0);
  const p = periods[activePeriod];
  return (
    <div style={{ padding: "12px 16px 16px" }}>
      {/* Period tabs */}
      <div style={{ display: "flex", gap: 4, background: "#f0f4f3", borderRadius: 8, padding: 3, marginBottom: 14 }}>
        {periods.map((pr, i) => (
          <div key={i} onClick={() => setActivePeriod(i)} style={{
            flex: 1, textAlign: "center", padding: "6px 4px", borderRadius: 6, cursor: "pointer",
            background: activePeriod === i ? WHITE : "transparent",
            color: activePeriod === i ? TEXT : TEXT_SEC,
            fontSize: 11, fontWeight: activePeriod === i ? 700 : 500,
            boxShadow: activePeriod === i ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
            transition: "all 0.2s ease"
          }}>{pr.label}</div>
        ))}
      </div>
      {/* Data grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
        {p.rows.map((row, ri) => {
          const hasGoal = row.g !== undefined && row.g !== null;
          const numVal = parseFloat(String(row.v).replace(/[^0-9.]/g, ""));
          const numGoal = hasGoal ? parseFloat(String(row.g).replace(/[^0-9.]/g, "")) : 0;
          const pct = hasGoal && numGoal > 0 ? Math.min(100, (numVal / numGoal) * 100) : 0;
          const met = hasGoal && pct >= 95;
          const close = hasGoal && pct >= 80 && pct < 95;
          return (
            <div key={ri} style={{ padding: "8px 10px", borderRadius: 10, background: `${color}06` }}>
              <div style={{ fontSize: 9, fontWeight: 600, color: TEXT_SEC, textTransform: "uppercase", letterSpacing: "0.04em" }}>{row.l}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: TEXT, marginTop: 3 }}>{row.v}</div>
              {hasGoal && (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                    <div style={{ fontSize: 10, color: met ? ALERT_GREEN : close ? "#d4a63c" : TEXT_SEC, fontWeight: 600 }}>
                      Goal: {row.g}
                    </div>
                    {met && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={ALERT_GREEN} strokeWidth="3" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg>}
                  </div>
                  <div style={{ width: "100%", height: 3, borderRadius: 2, background: "#e8f0ee", marginTop: 3 }}>
                    <div style={{ width: `${pct}%`, height: "100%", borderRadius: 2, background: met ? ALERT_GREEN : close ? "#d4a63c" : color, transition: "width 0.6s ease" }} />
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   CLIENT PROFILE SCREEN
   ═══════════════════════════════════════════ */
function ClientProfile({ client, onBack, isMobile, onReportOpen, reportBlocks, setReportBlocks }) {
  const [showReport, setShowReport] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedDay, setSelectedDay] = useState(16);
  const [customizeMode, setCustomizeMode] = useState(false);
  const [coachNoteText, setCoachNoteText] = useState("");
  const [showAddDevice, setShowAddDevice] = useState(false);
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const maxMeals = 3;
  const wData = client.weightData || [0,0,0,0,0,0,0,0];
  const wMin = Math.min(...wData) - 1;
  const wMax = Math.max(...wData) + 1;
  const wRange = wMax - wMin || 1;
  const font = `'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif`;

  // Consistency scores
  const mealsScore = Math.min(100, Math.round((client.mealsLogged / 21) * 100));
  const exerciseScore = Math.min(100, Math.round((client.workoutDays / 5) * 100));
  const movementScore = Math.min(100, Math.round((client.steps / 8000) * 100));
  const sleepScore = 78;
  const consistencyScore = Math.round(mealsScore * 0.4 + exerciseScore * 0.25 + movementScore * 0.2 + sleepScore * 0.15);
  const scoreColor = consistencyScore >= 80 ? MINT : consistencyScore >= 60 ? SAGE : "#ef6c3e";

  const ovPillars = [
    { key: "exercise", label: "Exercise", days: Math.min(30, client.workoutDays * 4 + 2), color: TEAL, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><rect x="1" y="10" width="4" height="4" rx="1"/><rect x="19" y="10" width="4" height="4" rx="1"/><rect x="5" y="7" width="3" height="10" rx="1"/><rect x="16" y="7" width="3" height="10" rx="1"/><line x1="8" y1="12" x2="16" y2="12"/></svg> },
    { key: "steps", label: "Steps", days: Math.min(30, Math.round(client.steps / 350)), color: "#3aafa9", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18 Q3 12 6 9 Q8 7 9 8 L11 11 Q12 12.5 14 12.5 L18 12.5 Q21 13 21 16 L21 17 Q21 19 19 19 L5 19 Q3 19 3 18Z"/><line x1="8" y1="19" x2="8" y2="16"/><line x1="12" y1="19" x2="12" y2="16"/><line x1="16" y1="19" x2="16" y2="16"/></svg> },
    { key: "meals", label: "Meals", days: Math.min(30, client.mealsLogged + 5), color: "#ef6c3e", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3Q13 2 14.5 3 Q13 4 12 5.5"/><path d="M12 5.5 Q7 5 5 9 Q3 13 5 17 Q7 21 11.5 21 Q12 20 12.5 21 Q17 21 19 17 Q21 13 19 9 Q17 5 12 5.5Z"/></svg> },
    { key: "sleep", label: "Sleep", days: Math.min(30, 21), color: "#8e7cc3", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg> },
  ];

  const dayNames = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const calDays = Array.from({ length: 28 }).map((_, i) => {
    const seed = (i * 7 + client.name.charCodeAt(0)) % 100;
    const ex = seed < exerciseScore, st = seed < movementScore + 5, ml = seed < mealsScore - 5, sl = seed < sleepScore + 3;
    const weekNum = Math.floor(i / 7) + 1;
    const dayLabel = dayNames[i % 7];
    return {
      exercise: ex, steps: st, meals: ml, sleep: sl,
      label: `Week ${weekNum}, ${dayLabel}`,
      details: {
        exercise: ex ? { type: ["Strength","HIIT","Cardio","Yoga"][i%4], duration: `${35 + (i%4)*8} min`, intensity: ["Moderate","High","Low","Moderate"][i%4] } : null,
        steps: st ? { count: (5000 + (seed * 73) % 7000).toLocaleString(), distance: `${(2 + (seed%30)/10).toFixed(1)} mi`, active: `${25 + seed%30} min` } : null,
        meals: ml ? {
          logged: [2,3,3,2,3,1,2][i%7],
          calories: (1300 + (seed*11)%500),
          protein: `${client.proteinAvg - 10 + (i%5)*5}g`,
          carbs: `${Math.round(client.proteinAvg * 1.6 + (i%3)*10)}g`,
          fats: `${Math.round(client.proteinAvg * 0.5 + (i%4)*3)}g`,
          water: `${48 + (i%5)*8} oz`
        } : null,
        sleep: sl ? { duration: `${6 + (seed%20)/10} hrs`, bedtime: ["10:30 PM","11:15 PM","10:45 PM","11:30 PM","10:00 PM"][i%5], quality: ["Good","Fair","Great","Good","Fair"][i%5] } : null,
      }
    };
  });

  const StatCard = ({ label, value, sub, children }) => (
    <div style={{
      background: WHITE, borderRadius: 16, border: `1px solid ${BORDER}`,
      padding: isMobile ? "14px" : "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
      display: "flex", flexDirection: "column", gap: 4
    }}>
      <span style={{ fontSize: 11, color: TEXT_SEC, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
      <span style={{ fontSize: isMobile ? 24 : 30, fontWeight: 700, color: TEXT, letterSpacing: "-0.03em", lineHeight: 1 }}>{value}</span>
      {sub && <span style={{ fontSize: 12, color: TEXT_SEC, fontWeight: 500 }}>{sub}</span>}
      {children}
    </div>
  );

  const ActionBtn = ({ label, primary, icon, onClick, disabled }) => (
    <div onClick={disabled ? undefined : onClick} style={{
      display: "flex", alignItems: "center", gap: 6,
      padding: isMobile ? "10px 14px" : "10px 18px",
      borderRadius: 12, cursor: disabled ? "default" : "pointer", fontSize: 13, fontWeight: 600,
      background: disabled ? "#eef0ee" : primary ? TEAL : WHITE,
      color: disabled ? "#b0b8b4" : primary ? "#fff" : TEXT,
      border: primary ? "none" : `1px solid ${disabled ? "#dde2e0" : BORDER}`,
      boxShadow: disabled ? "none" : primary ? "0 2px 8px rgba(43,122,120,0.3)" : "0 1px 3px rgba(0,0,0,0.04)",
      whiteSpace: "nowrap", transition: "all 0.15s ease",
      opacity: disabled ? 0.7 : 1
    }}>
      {icon}{label}
    </div>
  );

  const handleEditBlock = (blockId, label) => {
    // Pre-fill chat context for this block
  };
  const handleRemoveBlock = (blockId) => {
    setReportBlocks(prev => prev.filter(b => b !== blockId));
  };
  const handleAddBlock = (blockId) => {
    setReportBlocks(prev => prev.includes(blockId) ? prev : [...prev, blockId]);
  };

  const availableBlocks = [
    { id: "top3", label: "Score & Charts", icon: "grid" },
    { id: "rule30", label: "Rule of 30", icon: "layers" },
    { id: "dataCards", label: "Data Cards", icon: "grid" },
    { id: "calendar", label: "Daily Activity", icon: "grid" },
    { id: "insight", label: "Milton Insight", icon: "message" },
    { id: "nutrition", label: "Nutrition Breakdown", icon: "layers" },
    { id: "focus", label: "Focus Areas", icon: "file-text" },
    { id: "coachNotes", label: "Coach Notes", icon: "file-text" },
  ];
  const hiddenBlocks = availableBlocks.filter(b => !reportBlocks.includes(b.id));

  if (showReport) {
    return <ReportView client={client} onBack={() => setShowReport(false)} isMobile={isMobile} />;
  }

  return (
    <div style={{
      flex: 1, overflowY: "auto",
      padding: isMobile ? "68px 14px 76px" : "24px 28px",
      display: "flex", flexDirection: "column", gap: isMobile ? 14 : 18
    }}>
      {/* Back */}
      {!isMobile && <div onClick={onBack} style={{
        display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
        color: TEXT_SEC, fontSize: 14, fontWeight: 600, width: "fit-content"
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15,18 9,12 15,6"/></svg>
        Back to Dashboard
      </div>}

      {/* ─── CLIENT HEADER ─── */}
      <div style={{
        background: WHITE, borderRadius: 20, border: `1px solid ${BORDER}`,
        padding: isMobile ? "18px" : "24px 28px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        display: "flex", flexDirection: "column", gap: 16
      }}>
        <div style={{ display: "flex", alignItems: isMobile ? "flex-start" : "center", gap: isMobile ? 14 : 18, flexWrap: "wrap" }}>
          <Avatar name={client.name} size={isMobile ? 56 : 64} />
          <div style={{ flex: 1, minWidth: 160 }}>
            <h2 style={{ fontSize: isMobile ? 22 : 26, fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>{client.name}</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: isMobile ? 8 : 14, marginTop: 6, alignItems: "center" }}>
              <AlertBadge type={client.alertType} label={client.alert} />
              <StreakBadge streak={client.streaks} />
              <span style={{ fontSize: 13, color: TEXT_SEC }}>Program: <strong style={{ color: TEXT }}>{client.program}</strong></span>
              <span style={{ fontSize: 13, color: TEXT_SEC }}>Start: <strong style={{ color: TEXT }}>{client.startDate}</strong></span>
            </div>
          </div>
        </div>
        {/* Connections */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
          {client.connectors.map((c, j) => {
            const conn = dataConnectors[c];
            if (!conn) return null;
            return (
              <div key={j} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{
                  width: 26, height: 26, borderRadius: "50%", background: conn.bg,
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>{conn.icon(13)}</div>
                <span style={{ fontSize: 12, fontWeight: 500, color: TEXT_SEC }}>{conn.name}</span>
              </div>
            );
          })}
        </div>
        {/* Action buttons */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <ActionBtn label="Generate Report" primary onClick={() => { setShowReport(true); onReportOpen?.(client); }} icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
          } />
          <div style={{ position: "relative", display: "inline-flex" }} title="Coming Soon">
            <ActionBtn label="Send Message" icon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            } disabled />
          </div>
          <ActionBtn label="Add Device" onClick={() => setShowAddDevice(v => !v)} icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          } />
        </div>
        {showAddDevice && (
          <div style={{
            padding: "14px 16px", borderRadius: 14,
            background: "#f7faf9", border: `1px solid ${BORDER}`,
            animation: "fadeSlideIn 0.2s ease"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>Connect a Device</span>
              <div onClick={() => setShowAddDevice(false)} style={{ cursor: "pointer", color: TEXT_SEC, padding: 2 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {Object.entries(dataConnectors).filter(([key]) => !client.connectors.includes(key)).map(([key, conn]) => (
                <div key={key} onClick={() => setShowAddDevice(false)} style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 14px", borderRadius: 22,
                  background: WHITE, border: `1px solid ${BORDER}`,
                  cursor: "pointer", fontSize: 12, fontWeight: 600, color: TEXT,
                  transition: "all 0.15s ease"
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = conn.bg; e.currentTarget.style.boxShadow = `0 2px 8px ${conn.bg}25`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <div style={{
                    width: 22, height: 22, borderRadius: "50%", background: conn.bg,
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}>{conn.icon(11)}</div>
                  {conn.name}
                </div>
              ))}
              {Object.entries(dataConnectors).filter(([key]) => !client.connectors.includes(key)).length === 0 && (
                <span style={{ fontSize: 12, color: TEXT_SEC }}>All devices connected</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ─── TAB BAR ─── */}
      <div style={{
        display: "flex", gap: 4, background: WHITE, borderRadius: 14, padding: 4,
        border: `1px solid ${BORDER}`, boxShadow: "0 1px 4px rgba(0,0,0,0.03)", overflowX: "auto"
      }}>
        {[
          { id: "overview", label: "Overview" },
          { id: "profile", label: "Health Profile" },
          { id: "journey", label: "Journey" },
          { id: "chats", label: "Chats" },
        ].map(tab => (
          <div key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
            padding: isMobile ? "10px 8px" : "10px 16px", borderRadius: 10, cursor: "pointer",
            background: activeTab === tab.id ? TEAL : "transparent",
            color: activeTab === tab.id ? "#fff" : TEXT_SEC,
            fontWeight: activeTab === tab.id ? 600 : 500,
            fontSize: isMobile ? 12 : 13, whiteSpace: "nowrap",
            transition: "all 0.2s ease",
            boxShadow: activeTab === tab.id ? "0 2px 8px rgba(43,122,120,0.25)" : "none"
          }}>{tab.label}</div>
        ))}
      </div>

      {/* ═══ TAB: OVERVIEW ═══ */}
      {activeTab === "overview" && (<>


      {reportBlocks.includes("top3") && <ReportBlock id="top3" label="Score & Charts" customizeMode={customizeMode} onEditBlock={handleEditBlock} onRemoveBlock={handleRemoveBlock}>
      <div style={{
        display: "flex", flexDirection: isMobile ? "column" : "row",
        gap: isMobile ? 16 : 16, alignItems: "stretch"
      }}>

      {/* ─── Consistency Score (compact) ─── */}
      <div style={{
        background: `linear-gradient(135deg, #f7faf9, #eef6f3, #f0f8f5)`,
        borderRadius: 20, border: `1px solid ${BORDER}`, padding: isMobile ? "20px" : "22px 22px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column",
        position: "relative", overflow: "hidden",
        flex: isMobile ? "unset" : "0.7 1 0", minWidth: 0
      }}>
        <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)", width: 180, height: 180, borderRadius: "50%", background: `radial-gradient(circle, ${scoreColor}10 0%, transparent 70%)`, pointerEvents: "none" }} />
        {/* Score ring centered */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 18, position: "relative" }}>
          {(() => {
            const sz = isMobile ? 100 : 96;
            const r = sz / 2 - 9;
            const circ = 2 * Math.PI * r;
            const offset = circ * (1 - consistencyScore / 100);
            return (
              <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`}>
                <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke="#e0ebe8" strokeWidth="8"/>
                <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke={scoreColor} strokeWidth="8"
                  strokeDasharray={circ} strokeDashoffset={offset}
                  strokeLinecap="round" transform={`rotate(-90 ${sz/2} ${sz/2})`}
                  style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1)" }}
                />
                <text x={sz/2} y={sz/2 + 1} textAnchor="middle" dominantBaseline="central"
                  style={{ fontSize: 30, fontWeight: 800, fill: TEXT, fontFamily: font }}>{consistencyScore}</text>
              </svg>
            );
          })()}
          <div style={{ fontSize: 10, fontWeight: 700, color: TEXT_SEC, textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 10 }}>Consistency Score</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: scoreColor, marginTop: 2 }}>
            {consistencyScore >= 85 ? "Exceptional" : consistencyScore >= 70 ? "Strong" : consistencyScore >= 55 ? "Building" : "Getting Started"}
          </div>
        </div>
        {/* Pillar breakdown rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1, justifyContent: "center", position: "relative" }}>
          {[
            { label: "Meals", pct: mealsScore, color: "#ef6c3e" },
            { label: "Exercise", pct: exerciseScore, color: TEAL },
            { label: "Steps", pct: movementScore, color: "#3aafa9" },
            { label: "Sleep", pct: sleepScore, color: "#8e7cc3" },
          ].map((w, i) => (
            <div key={i}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: TEXT_SEC }}>{w.label}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: w.color }}>{w.pct}</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: "#e8f0ee", overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 3, background: w.color, width: `${w.pct}%`, transition: "width 1.2s cubic-bezier(0.16, 1, 0.3, 1)" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Transformation ─── */}
      {(() => {
        const isFatLoss = client.program === "Fat Loss Phase" || client.program === "Metabolic Health";
        const startW = (client.weightData?.[0] || 185) + 4;
        const currW = client.weightData?.[client.weightData.length-1] || 183;
        const goalLabel = isFatLoss ? "Weight" : "Protein";
        const goalUnit = isFatLoss ? " lbs" : "g";

        // Weekly data points
        const weeks = ["Week 1", "Week 2", "Week 3", "Week 4"];
        const w1c = Math.max(15, consistencyScore - 32 - (client.name.charCodeAt(0) % 8));
        const consistencyData = [w1c, w1c + 12, w1c + 22, consistencyScore];
        const goalData = isFatLoss
          ? [startW, startW - 1.2, startW - 2.5, currW]
          : [client.proteinAvg - 28, client.proteinAvg - 16, client.proteinAvg - 6, client.proteinAvg];
        const goalGoingDown = isFatLoss;

        // Chart layout
        const cw = 380, ch = 180, padL = 42, padR = 42, padT = 14, padB = 30;
        const plotW = cw - padL - padR, plotH = ch - padT - padB;

        // Consistency axis (left, 0-100)
        const cMin = 0, cMax = 100;
        const toYc = (v) => padT + (1 - (v - cMin) / (cMax - cMin)) * plotH;
        const toX = (i) => padL + (i / (weeks.length - 1)) * plotW;

        // Goal axis (right)
        const gVals = goalData;
        const gMin = Math.min(...gVals) - 3;
        const gMax = Math.max(...gVals) + 3;
        const toYg = (v) => padT + (1 - (v - gMin) / (gMax - gMin)) * plotH;

        // Build smooth paths
        const smooth = (pts) => {
          let d = `M ${pts[0].x},${pts[0].y}`;
          for (let i = 0; i < pts.length - 1; i++) {
            const cp = (pts[i+1].x - pts[i].x) / 2.5;
            d += ` C ${pts[i].x+cp},${pts[i].y} ${pts[i+1].x-cp},${pts[i+1].y} ${pts[i+1].x},${pts[i+1].y}`;
          }
          return d;
        };

        const cPts = consistencyData.map((v, i) => ({ x: toX(i), y: toYc(v) }));
        const gPts = goalData.map((v, i) => ({ x: toX(i), y: toYg(v) }));
        const cPath = smooth(cPts);
        const gPath = smooth(gPts);
        const cArea = `${cPath} L ${cPts[cPts.length-1].x},${padT + plotH} L ${cPts[0].x},${padT + plotH} Z`;

        const cLast = cPts[cPts.length - 1];
        const gLast = gPts[gPts.length - 1];

        const totalChange = isFatLoss
          ? `${(startW - currW).toFixed(1)} lbs lost`
          : `+${(client.proteinAvg - (client.proteinAvg - 28))}g protein`;
        const scoreChange = consistencyScore - w1c;

        return (
          <div style={{
            background: `linear-gradient(145deg, #f0f9f5, #eaf6f2, #f5faf8)`,
            borderRadius: 20, border: `1px solid ${BORDER}`,
            padding: isMobile ? "20px" : "20px 22px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            flex: isMobile ? "unset" : "1.2 1 0", minWidth: 0
          }}>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: isMobile ? 16 : 15, fontWeight: 700, color: TEXT }}>{client.name.split(" ")[0]}'s Transformation</div>
              <div style={{ fontSize: 12, color: TEXT_SEC, marginTop: 2 }}>Consistency drives results — 4 weeks of progress</div>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <div style={{ padding: "4px 10px", borderRadius: 16, background: `${TEAL}12`, fontSize: 11, fontWeight: 700, color: TEAL }}>+{scoreChange} pts</div>
                <div style={{ padding: "4px 10px", borderRadius: 16, background: `${ALERT_GREEN}15`, fontSize: 11, fontWeight: 700, color: ALERT_GREEN }}>{totalChange}</div>
              </div>
            </div>

            {/* Dual-line chart */}
            <div style={{
              borderRadius: 14, background: WHITE, border: `1px solid ${BORDER}`,
              padding: isMobile ? "10px 6px" : "14px 10px"
            }}>
              <svg width="100%" height={ch} viewBox={`0 0 ${cw} ${ch}`} preserveAspectRatio="xMidYMid meet" style={{ display: "block" }}>
                <defs>
                  <linearGradient id="cAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={TEAL} stopOpacity="0.12"/>
                    <stop offset="100%" stopColor={TEAL} stopOpacity="0.01"/>
                  </linearGradient>
                </defs>

                {/* Horizontal grid */}
                {[0, 25, 50, 75, 100].map((v, i) => (
                  <line key={i} x1={padL} y1={toYc(v)} x2={cw - padR} y2={toYc(v)} stroke={BORDER} strokeWidth="0.7" opacity="0.5"/>
                ))}

                {/* Left Y-axis labels (Consistency) */}
                {[0, 50, 100].map((v, i) => (
                  <text key={i} x={padL - 6} y={toYc(v) + 3} textAnchor="end" fill={TEAL} fontSize="9" fontWeight="600" fontFamily="DM Sans, sans-serif">{v}</text>
                ))}

                {/* Right Y-axis labels (Goal) */}
                {[gMin + 1, (gMin + gMax) / 2, gMax - 1].map((v, i) => (
                  <text key={i} x={cw - padR + 6} y={toYg(v) + 3} textAnchor="start" fill={ALERT_GREEN} fontSize="9" fontWeight="600" fontFamily="DM Sans, sans-serif">{Math.round(v)}</text>
                ))}

                {/* Week labels */}
                {weeks.map((w, i) => (
                  <text key={i} x={toX(i)} y={ch - 6} textAnchor="middle" fill={TEXT_SEC} fontSize="9" fontWeight="600" fontFamily="DM Sans, sans-serif">{isMobile ? `W${i+1}` : w}</text>
                ))}

                {/* Consistency area fill */}
                <path d={cArea} fill="url(#cAreaGrad)" />

                {/* Consistency line */}
                <path d={cPath} fill="none" stroke={TEAL} strokeWidth="2.5" strokeLinecap="round" />

                {/* Goal line */}
                <path d={gPath} fill="none" stroke={ALERT_GREEN} strokeWidth="2.5" strokeLinecap="round" strokeDasharray="6,4" />

                {/* Consistency dots */}
                {cPts.map((p, i) => (
                  <g key={`c${i}`}>
                    {i === cPts.length - 1 && <circle cx={p.x} cy={p.y} r="8" fill={TEAL} opacity="0.1"/>}
                    <circle cx={p.x} cy={p.y} r={i === cPts.length - 1 ? 5 : 3.5} fill={WHITE} stroke={TEAL} strokeWidth="2"/>
                  </g>
                ))}

                {/* Goal dots */}
                {gPts.map((p, i) => (
                  <g key={`g${i}`}>
                    {i === gPts.length - 1 && <circle cx={p.x} cy={p.y} r="8" fill={ALERT_GREEN} opacity="0.1"/>}
                    <circle cx={p.x} cy={p.y} r={i === gPts.length - 1 ? 5 : 3.5} fill={WHITE} stroke={ALERT_GREEN} strokeWidth="2"/>
                  </g>
                ))}

                {/* End labels */}
                <g>
                  <rect x={cLast.x - 16} y={cLast.y - 22} width="32" height="16" rx="8" fill={TEAL}/>
                  <text x={cLast.x} y={cLast.y - 11.5} textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700" fontFamily="DM Sans">{consistencyScore}</text>
                </g>
                <g>
                  <rect x={gLast.x - 22} y={gLast.y + 8} width="44" height="16" rx="8" fill={ALERT_GREEN}/>
                  <text x={gLast.x} y={gLast.y + 18.5} textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700" fontFamily="DM Sans">{isFatLoss ? `${currW}` : `${client.proteinAvg}g`}</text>
                </g>
              </svg>
            </div>

            {/* Legend */}
            <div style={{ display: "flex", justifyContent: "center", gap: isMobile ? 16 : 24, marginTop: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 16, height: 3, borderRadius: 2, background: TEAL }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: TEXT_SEC }}>Consistency Score</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 16, height: 0, borderTop: `2.5px dashed ${ALERT_GREEN}` }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: TEXT_SEC }}>{goalLabel}</span>
              </div>
            </div>
          </div>
        );
      })()}


      {/* ─── Goal Trajectory ─── */}
      {(() => {
        const isFatLoss = client.program === "Fat Loss Phase" || client.program === "Metabolic Health";
        const startVal = isFatLoss ? (client.weightData?.[0] || 185) : client.proteinAvg;
        const currentVal = isFatLoss ? (client.weightData?.[client.weightData.length-1] || 183) : client.proteinAvg;
        const goalVal = isFatLoss ? startVal - 10 : client.proteinTarget + 20;
        const unit = isFatLoss ? "lbs" : "g protein/day";
        const goalLabel = isFatLoss ? "Weight Goal" : "Protein Goal";
        const weeksTotal = 12, weeksCurrent = 4;
        const projectedWeeks = Math.round(weeksTotal * 0.9);
        const goalDown = isFatLoss;
        const cw = 380, ch = 160, padL = 42, padR = 18, padT = 16, padB = 30;
        const plotW = cw - padL - padR, plotH = ch - padT - padB;
        const valMin = goalDown ? goalVal - 2 : startVal - 5;
        const valMax = goalDown ? startVal + 2 : goalVal + 5;
        const valRange = valMax - valMin;
        const toY = (v) => padT + (1 - (v - valMin) / valRange) * plotH;
        const toX = (w) => padL + (w / weeksTotal) * plotW;
        const actualPts = []; for (let w = 0; w <= weeksCurrent; w++) { const t = w / weeksCurrent; actualPts.push({ x: toX(w), y: toY(startVal + (currentVal - startVal) * t + Math.sin(t * 4) * 0.5) }); }
        const projPts = []; for (let w = weeksCurrent; w <= weeksTotal; w++) { const t = (w - weeksCurrent) / (weeksTotal - weeksCurrent); projPts.push({ x: toX(w), y: toY(currentVal + (goalVal - currentVal) * (t * t * 0.3 + t * 0.7)) }); }
        const smooth = (pts) => { let d = `M ${pts[0].x},${pts[0].y}`; for (let i = 0; i < pts.length - 1; i++) { const cp = (pts[i+1].x - pts[i].x) / 2.5; d += ` C ${pts[i].x+cp},${pts[i].y} ${pts[i+1].x-cp},${pts[i+1].y} ${pts[i+1].x},${pts[i+1].y}`; } return d; };
        const actualPath = smooth(actualPts), projPath = smooth(projPts);
        const lastActual = actualPts[actualPts.length - 1];
        const goalY = toY(goalVal), goalX = toX(weeksTotal);
        const actualArea = `${actualPath} L ${lastActual.x},${padT + plotH} L ${actualPts[0].x},${padT + plotH} Z`;

        return (
          <div style={{
            background: `linear-gradient(160deg, #f7fcfb, #eef8f5, #f5faf8)`,
            borderRadius: 20, border: `1px solid ${BORDER}`,
            padding: isMobile ? "18px" : "20px 22px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            flex: isMobile ? "unset" : "1.2 1 0", minWidth: 0
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: TEXT_SEC, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>We predict you'll reach</div>
            <div style={{ fontSize: isMobile ? 20 : 20, fontWeight: 800, color: TEXT, marginBottom: 2 }}>
              <span style={{ color: TEAL }}>{goalDown ? goalVal : goalVal + "g"}</span> {unit.replace("g protein/day","").replace("lbs","")} by <span style={{ color: TEAL }}>Week {weeksTotal}</span>
            </div>
            <div style={{ fontSize: 12, color: TEXT_SEC, marginBottom: 14 }}>
              {goalLabel}: {startVal}{isFatLoss ? " lbs" : "g"} → {goalVal}{isFatLoss ? " lbs" : "g"} • Currently at <strong style={{ color: TEXT }}>{currentVal}{isFatLoss ? " lbs" : "g"}</strong>
            </div>
            <div style={{ borderRadius: 14, background: WHITE, border: `1px solid ${BORDER}`, padding: isMobile ? "8px 4px" : "12px 8px", marginBottom: 12 }}>
              <svg width="100%" height={ch} viewBox={`0 0 ${cw} ${ch}`} preserveAspectRatio="xMidYMid meet" style={{ display: "block" }}>
                <defs>
                  <linearGradient id="ovGoalArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={TEAL} stopOpacity="0.15"/>
                    <stop offset="100%" stopColor={TEAL} stopOpacity="0.02"/>
                  </linearGradient>
                </defs>
                {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
                  const v = valMin + t * valRange; const y = toY(v);
                  return (<g key={i}><line x1={padL} y1={y} x2={cw - padR} y2={y} stroke={BORDER} strokeWidth="0.7"/><text x={padL - 5} y={y + 3} textAnchor="end" fill={TEXT_SEC} fontSize="9" fontFamily="DM Sans, sans-serif">{Math.round(v)}</text></g>);
                })}
                <line x1={padL} y1={goalY} x2={cw - padR} y2={goalY} stroke={TEAL} strokeWidth="1.5" strokeDasharray="6,4" opacity="0.5"/>
                <path d={actualArea} fill="url(#ovGoalArea)" />
                <path d={actualPath} fill="none" stroke={TEAL} strokeWidth="2.5" strokeLinecap="round" />
                <path d={projPath} fill="none" stroke={MINT} strokeWidth="2" strokeLinecap="round" strokeDasharray="8,5" />
                <g><rect x={actualPts[0].x - 22} y={actualPts[0].y - 22} width="44" height="18" rx="9" fill={TEAL}/><text x={actualPts[0].x} y={actualPts[0].y - 10} textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700" fontFamily="DM Sans">{startVal}{isFatLoss ? "" : "g"}</text></g>
                <circle cx={lastActual.x} cy={lastActual.y} r="9" fill={TEAL} opacity="0.1"/>
                <circle cx={lastActual.x} cy={lastActual.y} r="5" fill={WHITE} stroke={TEAL} strokeWidth="2.5"/>
                <g><rect x={lastActual.x - 26} y={lastActual.y - 24} width="52" height="18" rx="9" fill={TEAL}/><text x={lastActual.x} y={lastActual.y - 12.5} textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700" fontFamily="DM Sans">{currentVal}{isFatLoss ? " lbs" : "g"}</text></g>
                <circle cx={goalX} cy={goalY} r="7" fill={MINT} opacity="0.2"/>
                <circle cx={goalX} cy={goalY} r="4" fill={MINT}/>
                <rect x={goalX - 20} y={goalY + 8} width="40" height="16" rx="8" fill={MINT}/>
                <text x={goalX} y={goalY + 18.5} textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700" fontFamily="DM Sans">{goalVal}{isFatLoss ? "" : "g"}</text>
                <line x1={lastActual.x} y1={padT} x2={lastActual.x} y2={padT + plotH} stroke={TEXT_SEC} strokeWidth="1" strokeDasharray="3,3" opacity="0.25"/>
                <text x={lastActual.x} y={ch - 6} textAnchor="middle" fill={TEXT} fontSize="9" fontWeight="700" fontFamily="DM Sans">Now</text>
                <text x={toX(0)} y={ch - 6} textAnchor="middle" fill={TEXT_SEC} fontSize="9" fontFamily="DM Sans">W1</text>
                <text x={toX(weeksTotal)} y={ch - 6} textAnchor="middle" fill={TEXT_SEC} fontSize="9" fontFamily="DM Sans">W{weeksTotal}</text>
              </svg>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { text: `${goalDown ? "Down" : "Up"} ${Math.abs(Math.round((currentVal - startVal) * 10) / 10)} ${isFatLoss ? "lbs" : "g"} from starting point`, check: true },
                { text: `On track to reach goal by Week ${projectedWeeks}`, check: true },
                { text: "Consistency score supports this projection", check: consistencyScore >= 65 },
              ].map((c, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", flexShrink: 0, background: c.check ? "#e8f5e9" : "#fff3e0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {c.check ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={ALERT_GREEN} strokeWidth="3" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg>
                    : <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#ef6c3e" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="0.5"/></svg>}
                  </div>
                  <span style={{ fontSize: 12, color: TEXT, fontWeight: 500 }}>{c.text}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      </div>{/* end top 3 row */}
      </ReportBlock>}

      {reportBlocks.includes("rule30") && <ReportBlock id="rule30" label="Rule of 30" customizeMode={customizeMode} onEditBlock={handleEditBlock} onRemoveBlock={handleRemoveBlock}>
      <div style={{
        background: `linear-gradient(145deg, #faf9f7, #f5f8f4, #f8faf7)`,
        borderRadius: 20, border: `1px solid ${BORDER}`,
        padding: isMobile ? "20px" : "24px 28px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
      }}>
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: isMobile ? 18 : 20, fontWeight: 700, color: TEXT }}>Rule of 30</div>
          <div style={{ fontSize: 13, color: TEXT_SEC, marginTop: 2 }}>Every 30 days you unlock a new learning about yourself</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: isMobile ? 12 : 16 }}>
          {ovPillars.map((p) => {
            const fillPct = (p.days / 30) * 100;
            const sz = isMobile ? 90 : 110;
            const r = sz / 2 - 12;
            const circ = 2 * Math.PI * r;
            const offset = circ * (1 - Math.min(100, fillPct) / 100);
            return (
              <div key={p.key} style={{
                borderRadius: 16, border: `1px solid ${BORDER}`, padding: isMobile ? "14px 10px" : "18px 14px",
                background: "#fafcfb", textAlign: "center",
                display: "flex", flexDirection: "column", alignItems: "center"
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, marginBottom: 10 }}>{p.label}</div>
                <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`}>
                  <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke="#e8f0ee" strokeWidth="10"/>
                  <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke={p.color} strokeWidth="10"
                    strokeDasharray={circ} strokeDashoffset={offset}
                    strokeLinecap="round" transform={`rotate(-90 ${sz/2} ${sz/2})`}
                    style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)" }}
                  />
                  <g transform={`translate(${sz/2 - 9}, ${sz/2 - 9})`} style={{ color: p.color }}>{p.icon}</g>
                </svg>
                <div style={{ marginTop: 10 }}>
                  <span style={{ fontSize: 24, fontWeight: 800, color: p.color }}>{p.days}</span>
                  <span style={{ fontSize: 13, color: TEXT_SEC, fontWeight: 500 }}> / 30</span>
                </div>
                <div style={{ fontSize: 11, color: fillPct >= 90 ? ALERT_GREEN : TEXT_SEC, fontWeight: 600, marginTop: 2 }}>
                  {fillPct >= 90 ? "Almost there!" : fillPct >= 60 ? "Keep going!" : "Building..."}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      </ReportBlock>}

      {reportBlocks.includes("dataCards") && <ReportBlock id="dataCards" label="Data Cards" customizeMode={customizeMode} onEditBlock={handleEditBlock} onRemoveBlock={handleRemoveBlock}>
      {/* ─── Data Cards (swipable) ─── */}
      {(() => {
        const cards = [
          {
            title: "Nutrition", color: "#ef6c3e",
            icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3Q13 2 14.5 3 Q13 4 12 5.5"/><path d="M12 5.5 Q7 5 5 9 Q3 13 5 17 Q7 21 11.5 21 Q12 20 12.5 21 Q17 21 19 17 Q21 13 19 9 Q17 5 12 5.5Z"/></svg>,
            periods: [
              { label: "Today", rows: [
                { l: "Calories", v: "1,620", g: "1,800" }, { l: "Protein", v: `${client.proteinAvg + 2}g`, g: `${client.proteinTarget}g` },
                { l: "Carbs", v: `${Math.round(client.proteinAvg * 1.9)}g`, g: `${Math.round(client.proteinTarget * 2)}g` }, { l: "Fats", v: `${Math.round(client.proteinAvg * 0.58)}g`, g: `${Math.round(client.proteinTarget * 0.6)}g` },
                { l: "Fiber", v: "24g", g: "30g" }, { l: "Water", v: "72 oz", g: "80 oz" },
              ]},
              { label: "Last 7 Days", rows: [
                { l: "Calories", v: "1,580", g: "1,800" }, { l: "Protein", v: `${client.proteinAvg}g`, g: `${client.proteinTarget}g` },
                { l: "Carbs", v: `${Math.round(client.proteinAvg * 1.8)}g`, g: `${Math.round(client.proteinTarget * 2)}g` }, { l: "Fats", v: `${Math.round(client.proteinAvg * 0.55)}g`, g: `${Math.round(client.proteinTarget * 0.6)}g` },
                { l: "Fiber", v: "22g", g: "30g" }, { l: "Water", v: "64 oz", g: "80 oz" },
              ]},
              { label: "Last 30 Days", rows: [
                { l: "Calories", v: "1,540", g: "1,800" }, { l: "Protein", v: `${client.proteinAvg - 6}g`, g: `${client.proteinTarget}g` },
                { l: "Carbs", v: `${Math.round(client.proteinAvg * 1.7)}g`, g: `${Math.round(client.proteinTarget * 2)}g` }, { l: "Fats", v: `${Math.round(client.proteinAvg * 0.52)}g`, g: `${Math.round(client.proteinTarget * 0.6)}g` },
                { l: "Fiber", v: "20g", g: "30g" }, { l: "Water", v: "58 oz", g: "80 oz" },
              ]},
            ],
          },
          {
            title: "Activity", color: TEAL,
            icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><rect x="1" y="10" width="4" height="4" rx="1"/><rect x="19" y="10" width="4" height="4" rx="1"/><rect x="5" y="7" width="3" height="10" rx="1"/><rect x="16" y="7" width="3" height="10" rx="1"/><line x1="8" y1="12" x2="16" y2="12"/></svg>,
            periods: [
              { label: "Today", rows: [
                { l: "Steps", v: client.steps?.toLocaleString(), g: "10,000" }, { l: "Workouts", v: "1", g: "1" },
                { l: "Active Min", v: "48 min", g: "45 min" }, { l: "Distance", v: "4.1 mi", g: "4.5 mi" },
                { l: "Cal Burned", v: "420", g: "500" }, { l: "Floors", v: "10", g: "10" },
              ]},
              { label: "Last 7 Days", rows: [
                { l: "Steps Avg", v: client.steps?.toLocaleString(), g: "10,000" }, { l: "Workouts", v: `${client.workoutDays}`, g: "5" },
                { l: "Active Min", v: "42 min", g: "45 min" }, { l: "Distance", v: "3.8 mi", g: "4.5 mi" },
                { l: "Cal Burned", v: "385", g: "500" }, { l: "Floors", v: "8", g: "10" },
              ]},
              { label: "Last 30 Days", rows: [
                { l: "Steps Avg", v: `${(client.steps - 400).toLocaleString()}`, g: "10,000" }, { l: "Workouts", v: `${client.workoutDays * 4}`, g: "20" },
                { l: "Active Min", v: "38 min", g: "45 min" }, { l: "Distance", v: "3.4 mi", g: "4.5 mi" },
                { l: "Cal Burned", v: "350", g: "500" }, { l: "Floors", v: "7", g: "10" },
              ]},
            ],
          },
          {
            title: "Sleep", color: "#8e7cc3",
            icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>,
            periods: [
              { label: "Today", rows: [
                { l: "Duration", v: "7.2 hrs", g: "8 hrs" }, { l: "Bedtime", v: "10:45 PM", g: "10:30 PM" },
                { l: "Wake Time", v: "5:57 AM" }, { l: "Quality", v: "Good" },
                { l: "Deep Sleep", v: "1.8 hrs", g: "2 hrs" }, { l: "REM", v: "2.1 hrs", g: "2 hrs" },
              ]},
              { label: "Last 7 Days", rows: [
                { l: "Duration", v: "6.8 hrs", g: "8 hrs" }, { l: "Bedtime", v: "11:15 PM", g: "10:30 PM" },
                { l: "Wake Time", v: "6:05 AM" }, { l: "Quality", v: "Good" },
                { l: "Deep Sleep", v: "1.5 hrs", g: "2 hrs" }, { l: "REM", v: "1.9 hrs", g: "2 hrs" },
              ]},
              { label: "Last 30 Days", rows: [
                { l: "Duration", v: "6.5 hrs", g: "8 hrs" }, { l: "Bedtime", v: "11:30 PM", g: "10:30 PM" },
                { l: "Wake Time", v: "6:10 AM" }, { l: "Quality", v: "Fair" },
                { l: "Deep Sleep", v: "1.3 hrs", g: "2 hrs" }, { l: "REM", v: "1.7 hrs", g: "2 hrs" },
              ]},
            ],
          },
        ];

        return (
          <div>
      <div style={{ fontSize: isMobile ? 15 : 16, fontWeight: 700, color: TEXT, marginBottom: 10 }}>Daily Breakdown</div>
            <div style={{
              display: "flex", gap: 14, overflowX: "auto", scrollSnapType: "x mandatory",
              paddingBottom: 8, WebkitOverflowScrolling: "touch",
              msOverflowStyle: "none", scrollbarWidth: "none"
            }}>
              {cards.map((card, ci) => (
                <div key={ci} style={{
                  flex: "none", width: isMobile ? "85vw" : 320,
                  scrollSnapAlign: "start",
                  background: WHITE, borderRadius: 20, border: `1px solid ${BORDER}`,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)", overflow: "hidden"
                }}>
                  {/* Card header */}
                  <div style={{
                    padding: "16px 18px 12px", display: "flex", alignItems: "center", gap: 8,
                    borderBottom: `1px solid ${BORDER}`,
                    background: `linear-gradient(135deg, ${card.color}08, ${card.color}04)`
                  }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: 8,
                      background: `${card.color}15`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: card.color
                    }}>{card.icon}</div>
                    <span style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>{card.title}</span>
                  </div>

                  {/* Period tabs + data */}
                  <DataCardPeriods periods={card.periods} color={card.color} isMobile={isMobile} />
                </div>
              ))}
            </div>
            {/* Scroll hint */}
            <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 8 }}>
              {cards.map((_, i) => (
                <div key={i} style={{ width: i === 0 ? 16 : 6, height: 6, borderRadius: 3, background: i === 0 ? TEAL : "#d4ddd9", transition: "all 0.3s ease" }} />
              ))}
            </div>
          </div>
        );
      })()}

      </ReportBlock>}

      {reportBlocks.includes("calendar") && <ReportBlock id="calendar" label="Daily Activity" customizeMode={customizeMode} onEditBlock={handleEditBlock} onRemoveBlock={handleRemoveBlock}>
      {/* ─── Calendar Heatmap (clickable) ─── */}
      <div style={{
        background: WHITE, borderRadius: 20, border: `1px solid ${BORDER}`,
        padding: isMobile ? "16px" : "20px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontSize: isMobile ? 15 : 16, fontWeight: 700, color: TEXT }}>Daily Activity</div>
          <div style={{ display: "flex", gap: 10 }}>
            {[{ label: "Exercise", color: TEAL },{ label: "Steps", color: "#3aafa9" },{ label: "Meals", color: "#ef6c3e" },{ label: "Sleep", color: "#8e7cc3" }].map((l,i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10, color: TEXT_SEC }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: l.color }} />{!isMobile && l.label}
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: isMobile ? 0 : 16 }}>
        <div style={{ flex: isMobile ? "unset" : (selectedDay !== null ? "0 0 55%" : "1 1 100%"), transition: "flex 0.25s ease" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: isMobile ? 3 : 5, marginBottom: 4 }}>
          {["M","T","W","T","F","S","S"].map((d,i) => (
            <div key={i} style={{ textAlign: "center", fontSize: 10, fontWeight: 600, color: TEXT_SEC }}>{d}</div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: isMobile ? 3 : 5 }}>
          {calDays.map((day, i) => {
            const dots = [day.exercise && TEAL, day.steps && "#3aafa9", day.meals && "#ef6c3e", day.sleep && "#8e7cc3"].filter(Boolean);
            const count = dots.length;
            const isSel = selectedDay === i;
            return (
              <div key={i} onClick={() => setSelectedDay(isSel ? null : i)} style={{
                aspectRatio: "1", borderRadius: isMobile ? 6 : 8,
                background: isSel ? `${TEAL}18` : count === 4 ? "#eef6f3" : count >= 2 ? "#f5f8f7" : "#fafcfb",
                border: isSel ? `2px solid ${TEAL}` : `1px solid ${count === 4 ? "#c8e6c9" : BORDER}`,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 2,
                cursor: "pointer", transition: "all 0.15s ease",
                transform: isSel ? "scale(1.08)" : "scale(1)"
              }}>
                {dots.map((c, j) => (
                  <div key={j} style={{ width: isMobile ? 4 : 6, height: isMobile ? 4 : 6, borderRadius: "50%", background: c }} />
                ))}
                {count === 0 && <div style={{ width: isMobile ? 4 : 6, height: isMobile ? 4 : 6, borderRadius: "50%", border: "1.5px dashed #d0dbd7" }} />}
              </div>
            );
          })}
        </div>
        </div>{/* end calendar wrapper */}

        {/* Day Detail Panel */}
        {selectedDay !== null && (() => {
          const day = calDays[selectedDay];
          const d = day.details;
          const anyData = d.exercise || d.steps || d.meals || d.sleep;
          return (
            <div style={{
              flex: isMobile ? "unset" : "1 1 45%", minWidth: 0,
              marginTop: isMobile ? 14 : 0, padding: "16px", borderRadius: 14,
              background: `linear-gradient(135deg, #f7faf9, #f0f8f5)`,
              border: `1px solid ${BORDER}`, animation: "fadeSlideIn 0.25s ease"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>{day.label}</div>
                <div onClick={() => setSelectedDay(null)} style={{ cursor: "pointer", color: TEXT_SEC, padding: 2 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </div>
              </div>
              {!anyData ? (
                <div style={{ textAlign: "center", padding: "12px 0", color: TEXT_SEC, fontSize: 13 }}>No data logged this day</div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: 10 }}>
                  {d.exercise && (
                    <div style={{ padding: "12px 14px", borderRadius: 12, background: WHITE, border: `1px solid ${BORDER}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                        <div style={{ width: 22, height: 22, borderRadius: 6, background: `${TEAL}15`, display: "flex", alignItems: "center", justifyContent: "center", color: TEAL }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><rect x="1" y="10" width="4" height="4" rx="1"/><rect x="19" y="10" width="4" height="4" rx="1"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>Exercise</span>
                      </div>
                      <div style={{ display: "flex", gap: 12, fontSize: 12, flexWrap: "wrap" }}>
                        <div><span style={{ color: TEXT_SEC }}>Type: </span><strong style={{ color: TEXT }}>{d.exercise.type}</strong></div>
                        <div><span style={{ color: TEXT_SEC }}>{d.exercise.duration}</span></div>
                        <div><span style={{ color: TEXT_SEC }}>{d.exercise.intensity}</span></div>
                      </div>
                    </div>
                  )}
                  {d.steps && (
                    <div style={{ padding: "12px 14px", borderRadius: 12, background: WHITE, border: `1px solid ${BORDER}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                        <div style={{ width: 22, height: 22, borderRadius: 6, background: "#3aafa915", display: "flex", alignItems: "center", justifyContent: "center", color: "#3aafa9" }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18 Q3 12 6 9 Q8 7 9 8 L11 11 Q12 12.5 14 12.5 L18 12.5 Q21 13 21 16 L21 17 Q21 19 19 19 L5 19 Q3 19 3 18Z"/></svg>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>Steps</span>
                      </div>
                      <div style={{ display: "flex", gap: 12, fontSize: 12, flexWrap: "wrap" }}>
                        <div><strong style={{ color: TEXT }}>{d.steps.count}</strong> <span style={{ color: TEXT_SEC }}>steps</span></div>
                        <div><span style={{ color: TEXT_SEC }}>{d.steps.distance}</span></div>
                        <div><span style={{ color: TEXT_SEC }}>{d.steps.active} active</span></div>
                      </div>
                    </div>
                  )}
                  {d.meals && (
                    <div style={{ padding: "12px 14px", borderRadius: 12, background: WHITE, border: `1px solid ${BORDER}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                        <div style={{ width: 22, height: 22, borderRadius: 6, background: "#ef6c3e15", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef6c3e" }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 3Q13 2 14.5 3 Q13 4 12 5.5"/><path d="M12 5.5 Q7 5 5 9 Q3 13 5 17 Q7 21 11.5 21 Q12 20 12.5 21 Q17 21 19 17 Q21 13 19 9 Q17 5 12 5.5Z"/></svg>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>Meals</span>
                        <span style={{ fontSize: 11, color: TEXT_SEC, marginLeft: "auto" }}>{d.meals.logged}/3 logged</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 5, fontSize: 11 }}>
                        {[
                          { l: "Cal", v: d.meals.calories },
                          { l: "Protein", v: d.meals.protein },
                          { l: "Carbs", v: d.meals.carbs },
                          { l: "Fats", v: d.meals.fats },
                          { l: "Water", v: d.meals.water },
                        ].map((m,j) => (
                          <div key={j} style={{ padding: "4px 6px", borderRadius: 6, background: "#faf8f6" }}>
                            <div style={{ color: TEXT_SEC, fontSize: 9, textTransform: "uppercase" }}>{m.l}</div>
                            <div style={{ fontWeight: 700, color: TEXT }}>{m.v}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {d.sleep && (
                    <div style={{ padding: "12px 14px", borderRadius: 12, background: WHITE, border: `1px solid ${BORDER}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                        <div style={{ width: 22, height: 22, borderRadius: 6, background: "#8e7cc315", display: "flex", alignItems: "center", justifyContent: "center", color: "#8e7cc3" }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>Sleep</span>
                      </div>
                      <div style={{ display: "flex", gap: 12, fontSize: 12, flexWrap: "wrap" }}>
                        <div><strong style={{ color: TEXT }}>{d.sleep.duration}</strong></div>
                        <div><span style={{ color: TEXT_SEC }}>Bed: </span><span style={{ color: TEXT }}>{d.sleep.bedtime}</span></div>
                        <div><span style={{ color: TEXT_SEC }}>Quality: </span><strong style={{ color: d.sleep.quality === "Great" ? ALERT_GREEN : d.sleep.quality === "Fair" ? "#ef6c3e" : TEXT }}>{d.sleep.quality}</strong></div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })()}
        </div>{/* end flex row */}
      </div>


      </ReportBlock>}

      {reportBlocks.includes("insight") && <ReportBlock id="insight" label="Milton Insight" customizeMode={customizeMode} onEditBlock={handleEditBlock} onRemoveBlock={handleRemoveBlock}>
      {/* ─── Milton Insight + Action ─── */}
      <div style={{
        background: `linear-gradient(135deg, rgba(43,122,120,0.06), rgba(92,219,149,0.06))`,
        borderRadius: 20, border: `1px solid rgba(43,122,120,0.15)`,
        padding: isMobile ? "18px" : "24px 28px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg, ${TEAL}, ${SAGE})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v4m0 14v4M4.22 4.22l2.83 2.83m9.9 9.9l2.83 2.83M1 12h4m14 0h4M4.22 19.78l2.83-2.83m9.9-9.9l2.83-2.83"/></svg>
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>Milton Insight</span>
        </div>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: TEXT, margin: "0 0 12px" }}>{client.insight}</p>
        <div style={{
          padding: "12px 16px", borderRadius: 12, background: "rgba(255,255,255,0.7)",
          border: "1px solid rgba(43,122,120,0.1)", marginBottom: 14
        }}>
          <div style={{ fontSize: 11, color: TEAL, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>This Week's Focus</div>
          <p style={{ fontSize: 13, lineHeight: 1.55, color: TEXT, margin: 0, fontWeight: 600 }}>{client.coachAngle}</p>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <ActionBtn label="Generate Report" primary onClick={() => { setShowReport(true); onReportOpen?.(client); }} icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>} />
          <ActionBtn label="Send Tip" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 2L11 13"/><polygon points="22,2 15,22 11,13 2,9"/></svg>} />
          <ActionBtn label="Save Insight" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>} />
        </div>
      </div>
      </ReportBlock>}


      {/* ─── NEW BLOCK: Nutrition Breakdown ─── */}
      {reportBlocks.includes("nutrition") && <ReportBlock id="nutrition" label="Nutrition Breakdown" customizeMode={customizeMode} onEditBlock={handleEditBlock} onRemoveBlock={handleRemoveBlock}>
      <div style={{
        background: `linear-gradient(145deg, #fdf8f4, #faf5ee, #fdf9f5)`,
        borderRadius: 20, border: `1px solid ${BORDER}`,
        padding: isMobile ? "18px" : "24px 28px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: isMobile ? 16 : 18, fontWeight: 700, color: TEXT }}>Nutrition Breakdown</div>
            <div style={{ fontSize: 12, color: TEXT_SEC, marginTop: 2 }}>Average daily intake — past 7 days</div>
          </div>
          <div style={{ padding: "5px 12px", borderRadius: 16, background: "#ef6c3e15", fontSize: 11, fontWeight: 700, color: "#ef6c3e" }}>
            {client.mealsLogged}/21 meals
          </div>
        </div>
        {(() => {
          const macros = [
            { label: "Protein", value: client.proteinAvg || 95, target: client.proteinTarget || 120, unit: "g", color: TEAL },
            { label: "Carbs", value: 145, target: 180, unit: "g", color: "#3aafa9" },
            { label: "Fats", value: 52, target: 60, unit: "g", color: "#ef6c3e" },
            { label: "Calories", value: 1586, target: 1800, unit: "", color: "#8e7cc3" },
          ];
          return (
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 12 }}>
              {macros.map((m, i) => {
                const pct = Math.min(100, Math.round((m.value / m.target) * 100));
                return (
                  <div key={i} style={{ padding: "16px", borderRadius: 14, background: WHITE, border: `1px solid ${BORDER}`, textAlign: "center" }}>
                    <div style={{ position: "relative", width: 64, height: 64, margin: "0 auto 10px" }}>
                      {(() => {
                        const sz = 64, r = 24, circ = 2 * Math.PI * r;
                        const off = circ * (1 - pct / 100);
                        return (
                          <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`}>
                            <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke="#e8f0ee" strokeWidth="6"/>
                            <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke={m.color} strokeWidth="6"
                              strokeDasharray={circ} strokeDashoffset={off}
                              strokeLinecap="round" transform={`rotate(-90 ${sz/2} ${sz/2})`}
                              style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)" }}
                            />
                            <text x={sz/2} y={sz/2 + 1} textAnchor="middle" dominantBaseline="central"
                              style={{ fontSize: 13, fontWeight: 800, fill: TEXT }}>{pct}%</text>
                          </svg>
                        );
                      })()}
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: m.color }}>{m.value}{m.unit}</div>
                    <div style={{ fontSize: 11, color: TEXT_SEC, marginTop: 2 }}>{m.label}</div>
                    <div style={{ fontSize: 10, color: TEXT_SEC, marginTop: 4 }}>Target: {m.target}{m.unit}</div>
                  </div>
                );
              })}
            </div>
          );
        })()}
        <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 10, background: "rgba(239,108,62,0.06)", border: "1px solid rgba(239,108,62,0.12)" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#ef6c3e" }}>Protein is {Math.round(((client.proteinAvg || 95) / (client.proteinTarget || 120)) * 100)}% of target — encourage post-workout shakes</div>
        </div>
      </div>
      </ReportBlock>}

      {/* ─── NEW BLOCK: Focus Areas ─── */}
      {reportBlocks.includes("focus") && <ReportBlock id="focus" label="Focus Areas" customizeMode={customizeMode} onEditBlock={handleEditBlock} onRemoveBlock={handleRemoveBlock}>
      <div style={{
        background: `linear-gradient(135deg, rgba(43,122,120,0.04), rgba(92,219,149,0.04))`,
        borderRadius: 20, border: `1px solid rgba(43,122,120,0.12)`,
        padding: isMobile ? "18px" : "24px 28px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: `${TEAL}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
          </div>
          <div style={{ fontSize: isMobile ? 16 : 18, fontWeight: 700, color: TEXT }}>Focus Areas This Week</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 12 }}>
          {[
            { num: "01", title: "Hit protein target 5/7 days", desc: `Currently averaging ${client.proteinAvg || 95}g — need ${client.proteinTarget || 120}g. Post-workout window is the biggest opportunity.`, color: TEAL, status: "In progress" },
            { num: "02", title: "Sleep before 11pm 4 nights", desc: "Average bedtime is 11:30pm. Each 30min earlier correlates with +8% next-day consistency.", color: "#8e7cc3", status: "Needs attention" },
            { num: "03", title: "Complete 3 strength sessions", desc: `${client.workoutDays} sessions done so far. Add one more upper-body day for balanced programming.`, color: "#3aafa9", status: "On track" },
          ].map((f, i) => (
            <div key={i} style={{
              padding: "18px", borderRadius: 14, background: WHITE, border: `1px solid ${BORDER}`,
              display: "flex", flexDirection: "column", gap: 10
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: `${f.color}25`, lineHeight: 1 }}>{f.num}</div>
                <div style={{ padding: "3px 8px", borderRadius: 10, fontSize: 10, fontWeight: 600,
                  background: f.status === "On track" ? "#3aaf6a15" : f.status === "In progress" ? `${TEAL}12` : "#ef6c3e12",
                  color: f.status === "On track" ? "#3aaf6a" : f.status === "In progress" ? TEAL : "#ef6c3e"
                }}>{f.status}</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, lineHeight: 1.3 }}>{f.title}</div>
              <div style={{ fontSize: 12, color: TEXT_SEC, lineHeight: 1.5, flex: 1 }}>{f.desc}</div>
              <div style={{ height: 4, borderRadius: 2, background: "#e8f0ee", overflow: "hidden", marginTop: 4 }}>
                <div style={{ height: "100%", borderRadius: 2, background: f.color,
                  width: f.status === "On track" ? "85%" : f.status === "In progress" ? "55%" : "25%",
                  transition: "width 1s ease"
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      </ReportBlock>}

      {/* ─── NEW BLOCK: Coach Notes ─── */}
      {reportBlocks.includes("coachNotes") && <ReportBlock id="coachNotes" label="Coach Notes" customizeMode={customizeMode} onEditBlock={handleEditBlock} onRemoveBlock={handleRemoveBlock}>
          <div style={{
            background: WHITE, borderRadius: 20, border: `1px solid ${BORDER}`,
            padding: isMobile ? "18px" : "24px 28px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "#f0e8ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8e7cc3" strokeWidth="2" strokeLinecap="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              </div>
              <div style={{ fontSize: isMobile ? 16 : 18, fontWeight: 700, color: TEXT }}>Coach Notes</div>
              <div style={{ fontSize: 11, color: TEXT_SEC, marginLeft: "auto" }}>Editable — visible in shared report</div>
            </div>
            <textarea
              value={coachNoteText || `Great week overall for ${client.name.split(" ")[0]}. Consistency score trending up and weight is moving in the right direction. Main opportunity is protein intake — let's discuss meal prep strategies in our next session.`}
              onChange={e => setCoachNoteText(e.target.value)}
              style={{
                width: "100%", minHeight: 100, padding: "14px 16px", borderRadius: 12,
                border: `1px solid ${BORDER}`, background: "#f8faf9", color: TEXT,
                fontSize: 14, lineHeight: 1.65, fontFamily: "inherit", resize: "vertical",
                outline: "none", transition: "border-color 0.15s ease",
              }}
              onFocus={e => e.target.style.borderColor = TEAL}
              onBlur={e => e.target.style.borderColor = BORDER}
            />
          </div>
      </ReportBlock>}

      </>)}

      {/* ═══ TAB: HEALTH PROFILE ═══ */}
      {activeTab === "profile" && (<>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 14 : 18 }}>
          <div style={{ background: WHITE, borderRadius: 20, border: `1px solid ${BORDER}`, padding: isMobile ? "18px" : "24px 28px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: isMobile ? 16 : 18, fontWeight: 700, color: TEXT, marginBottom: 12 }}>Vitals & Body</div>
            {[
              ["Age", "34"], ["Gender", "Female"], ["Height", `5'6"`],
              ["Current Weight", `${wData[wData.length-1]} lbs`],
              ["Goal Weight", `${Math.round(wData[wData.length-1]-10)} lbs`],
              ["Activity Level", client.steps > 9000 ? "Very Active" : client.steps > 6000 ? "Moderately Active" : "Lightly Active"],
              ["Sleep Avg", "6.8 hrs"],
            ].map(([l,v],i) => (
              <div key={i} style={{ padding: "11px 0", borderBottom: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", gap: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: TEXT_SEC }}>{l}</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: TEXT, textAlign: "right" }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ background: WHITE, borderRadius: 20, border: `1px solid ${BORDER}`, padding: isMobile ? "18px" : "24px 28px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: isMobile ? 16 : 18, fontWeight: 700, color: TEXT, marginBottom: 12 }}>Medical & Dietary</div>
            {[
              ["Conditions", "Pre-diabetic, Mild anxiety"],
              ["Medications", "Metformin 500mg"],
              ["Allergies", "Shellfish, Dairy (mild)"],
              ["Diet Preference", "Mediterranean, High protein"],
              ["Supplements", "Vitamin D, Omega-3, Magnesium"],
              ["Stress Level", "Moderate"],
            ].map(([l,v],i) => (
              <div key={i} style={{ padding: "11px 0", borderBottom: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", gap: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: TEXT_SEC }}>{l}</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: TEXT, textAlign: "right" }}>{v}</span>
              </div>
            ))}
            <div style={{ padding: "11px 0" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: TEXT_SEC }}>Coach Notes</span>
              <p style={{ fontSize: 13, color: TEXT, margin: "6px 0 0", lineHeight: 1.55 }}>{client.name.split(" ")[0]} prefers morning workouts. Responds well to accountability check-ins.</p>
            </div>
          </div>
        </div>
      </>)}

      {/* ═══ TAB: JOURNEY ═══ */}
      {activeTab === "journey" && (
        <div style={{ background: WHITE, borderRadius: 20, border: `1px solid ${BORDER}`, padding: isMobile ? "18px" : "24px 28px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize: isMobile ? 16 : 18, fontWeight: 700, color: TEXT, marginBottom: 20 }}>Journey Timeline</div>
          <div style={{ position: "relative", paddingLeft: 28 }}>
            <div style={{ position: "absolute", left: 9, top: 8, bottom: 8, width: 2, background: `linear-gradient(180deg, ${TEAL}, ${MINT})`, borderRadius: 1 }} />
            {[
              { date: client.startDate, type: "start", title: "Program Started", desc: `Began ${client.program} program. Initial assessment completed.`, color: TEAL },
              { date: "Week 1", type: "milestone", title: "First Full Week Logged", desc: "Logged all meals for 7 consecutive days. Strong start.", color: MINT },
              { date: "Week 2", type: "insight", title: "Milton Insight", desc: "Identified protein gap — intake averaging 20g below target.", color: "#8e7cc3" },
              { date: "Week 2", type: "action", title: "Coach Check-in", desc: "Discussed protein sources. Sent meal prep guide.", color: "#ef6c3e" },
              { date: "Week 3", type: "milestone", title: "Weight Milestone", desc: `Down ${Math.abs(client.weightTrend)} lbs from starting weight. On track.`, color: MINT },
              { date: "Week 3", type: "insight", title: "Pattern Detected", desc: "Weekend logging drops significantly. Calorie intake +28% on weekends.", color: "#8e7cc3" },
              { date: "Week 4", type: "action", title: "Plan Adjustment", desc: "Added weekend meal templates. Set reminder for Saturday logging.", color: "#ef6c3e" },
              { date: "Today", type: "current", title: "Current Status", desc: `Engagement: ${client.engagementScore}%. ${client.alert}.`, color: ALERT_GREEN },
            ].map((ev, i, arr) => (
              <div key={i} style={{ position: "relative", marginBottom: i < arr.length - 1 ? 24 : 0 }}>
                <div style={{
                  position: "absolute", left: -28, top: 2, width: 20, height: 20, borderRadius: "50%",
                  background: ev.color, display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: `0 2px 6px ${ev.color}40`
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />
                </div>
                <div style={{ fontSize: 11, color: TEXT_SEC, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>{ev.date}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: TEXT, marginBottom: 3 }}>{ev.title}</div>
                <div style={{ fontSize: 13, color: TEXT_SEC, lineHeight: 1.55 }}>{ev.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ TAB: CHATS ═══ */}
      {activeTab === "chats" && (
        <div style={{ background: WHITE, borderRadius: 20, border: `1px solid ${BORDER}`, padding: isMobile ? "18px" : "24px 28px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize: isMobile ? 16 : 18, fontWeight: 700, color: TEXT, marginBottom: 6 }}>{client.name.split(" ")[0]}'s Conversations</div>
          <div style={{ fontSize: 12, color: TEXT_SEC, marginBottom: 18 }}>Chat history between {client.name.split(" ")[0]} and Milton AI</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { role: "user", text: "I had a rough weekend — didn't track anything Saturday or Sunday.", time: "Mon 9:12 AM" },
              { role: "ai", text: "That's okay! You tracked consistently Mon–Fri. Would you like me to suggest some quick weekend meal ideas?", time: "Mon 9:12 AM" },
              { role: "user", text: "Yes please, especially for Saturday brunch.", time: "Mon 9:14 AM" },
              { role: "ai", text: "Here are 3 high-protein brunch options under 15 min:\n\n1) Greek yogurt parfait (32g protein)\n2) Egg & veggie scramble with toast (28g)\n3) Protein smoothie bowl with PB (35g)\n\nWant me to add any to your meal plan?", time: "Mon 9:14 AM" },
              { role: "user", text: "The smoothie bowl sounds great. Add that!", time: "Mon 9:16 AM" },
              { role: "ai", text: `Done! Added Protein Smoothie Bowl to your Saturday plan. I'll send a reminder Saturday morning. Keep it up! 💪`, time: "Mon 9:16 AM" },
            ].map((msg, i) => (
              <div key={i} style={{ display: "flex", gap: 10 }}>
                {msg.role === "user" ? (
                  <Avatar name={client.name} size={32} />
                ) : (
                  <div style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0, background: `linear-gradient(135deg, ${TEAL}, ${SAGE})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v4m0 14v4M4.22 4.22l2.83 2.83m9.9 9.9l2.83 2.83M1 12h4m14 0h4M4.22 19.78l2.83-2.83m9.9-9.9l2.83-2.83"/></svg>
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>{msg.role === "user" ? client.name.split(" ")[0] : "Milton"}</span>
                    <span style={{ fontSize: 11, color: TEXT_SEC }}>{msg.time}</span>
                  </div>
                  <div style={{
                    padding: "12px 16px", borderRadius: "4px 16px 16px 16px",
                    background: msg.role === "user" ? "#f7faf9" : `linear-gradient(135deg, rgba(43,122,120,0.04), rgba(92,219,149,0.04))`,
                    border: `1px solid ${msg.role === "user" ? BORDER : "rgba(43,122,120,0.12)"}`,
                    fontSize: 13, lineHeight: 1.6, color: TEXT, whiteSpace: "pre-line"
                  }}>{msg.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   ADD CLIENT MODAL
   ═══════════════════════════════════════════ */
function AddClientModal({ onClose, isMobile }) {
  const [mode, setMode] = useState("single"); // single | csv
  const [form, setForm] = useState({ name: "", email: "", phone: "", program: "", notes: "" });
  const [csvFile, setCsvFile] = useState(null);
  const [csvPreview, setCsvPreview] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef(null);
  const font = `'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif`;

  const handleCsvSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      const lines = text.split("\n").filter(l => l.trim());
      const headers = lines[0].split(",").map(h => h.trim());
      const rows = lines.slice(1, 6).map(l => l.split(",").map(c => c.trim()));
      setCsvPreview({ headers, rows, total: lines.length - 1 });
    };
    reader.readAsText(file);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1800);
  };

  const InputField = ({ label, placeholder, field, type = "text" }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: TEXT_SEC, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>
      <input
        type={type} value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
        placeholder={placeholder}
        style={{
          padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${BORDER}`,
          fontSize: 14, fontFamily: font, color: TEXT, outline: "none",
          background: WHITE, transition: "border-color 0.15s ease"
        }}
        onFocus={e => e.target.style.borderColor = TEAL}
        onBlur={e => e.target.style.borderColor = BORDER}
      />
    </div>
  );

  if (submitted) {
    return (
      <>
        <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 200 }} />
        <div style={{
          position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          width: isMobile ? "90vw" : 480, background: WHITE, borderRadius: 24,
          padding: "48px 32px", zIndex: 210, textAlign: "center",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)", border: `1px solid ${BORDER}`
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%", margin: "0 auto 16px",
            background: `linear-gradient(135deg, ${TEAL}, ${SAGE})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 16px rgba(43,122,120,0.3)"
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12"/></svg>
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: TEXT, marginBottom: 6 }}>
            {mode === "csv" ? `${csvPreview?.total || 0} Clients Added!` : "Client Added!"}
          </div>
          <div style={{ fontSize: 14, color: TEXT_SEC }}>
            {mode === "csv" ? "Your client list has been imported successfully." : `${form.name || "New client"} has been added to your roster.`}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 200 }} />
      <div style={{
        position: "fixed",
        top: isMobile ? 0 : "50%", left: isMobile ? 0 : "50%",
        transform: isMobile ? "none" : "translate(-50%, -50%)",
        width: isMobile ? "100vw" : 520,
        height: isMobile ? "100vh" : "auto",
        maxHeight: isMobile ? "100vh" : "88vh",
        background: WHITE, borderRadius: isMobile ? 0 : 24,
        zIndex: 210, display: "flex", flexDirection: "column",
        boxShadow: isMobile ? "none" : "0 20px 60px rgba(0,0,0,0.15)",
        border: isMobile ? "none" : `1px solid ${BORDER}`,
        overflow: "hidden"
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: isMobile ? "16px 18px" : "20px 28px",
          borderBottom: `1px solid ${BORDER}`, flexShrink: 0
        }}>
          <div>
            <div style={{ fontSize: isMobile ? 18 : 20, fontWeight: 700, color: TEXT }}>Add Client</div>
            <div style={{ fontSize: 13, color: TEXT_SEC, marginTop: 2 }}>Add a single client or import a list</div>
          </div>
          <div onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: TEXT_SEC, background: "#f0f4f3"
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </div>
        </div>

        {/* Mode Toggle */}
        <div style={{ padding: isMobile ? "14px 18px 0" : "18px 28px 0", flexShrink: 0 }}>
          <div style={{
            display: "flex", gap: 4, background: "#f0f4f3", borderRadius: 10, padding: 3
          }}>
            {[
              { id: "single", label: "Single Client", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
              { id: "csv", label: "Import CSV", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="12" y1="18" x2="12" y2="12"/><polyline points="9,15 12,12 15,15"/></svg> },
            ].map(m => (
              <div key={m.id} onClick={() => setMode(m.id)} style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                padding: "9px 12px", borderRadius: 8, cursor: "pointer",
                background: mode === m.id ? WHITE : "transparent",
                color: mode === m.id ? TEXT : TEXT_SEC,
                fontWeight: mode === m.id ? 600 : 500, fontSize: 13,
                boxShadow: mode === m.id ? "0 1px 4px rgba(0,0,0,0.06)" : "none",
                transition: "all 0.2s ease"
              }}>
                {m.icon}{m.label}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "18px" : "20px 28px" }}>
          {mode === "single" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <InputField label="Full Name" placeholder="Marie Rodriguez" field="name" />
                <InputField label="Email" placeholder="marie@email.com" field="email" type="email" />
              </div>
              <InputField label="Phone" placeholder="(555) 123-4567" field="phone" type="tel" />
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: TEXT_SEC, textTransform: "uppercase", letterSpacing: "0.05em" }}>Notes (optional)</label>
                <textarea
                  value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Any notes about this client..."
                  rows={3}
                  style={{
                    padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${BORDER}`,
                    fontSize: 14, fontFamily: font, color: TEXT, outline: "none",
                    background: WHITE, resize: "vertical"
                  }}
                  onFocus={e => e.target.style.borderColor = TEAL}
                  onBlur={e => e.target.style.borderColor = BORDER}
                />
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Drop zone */}
              <div
                onClick={() => fileRef.current?.click()}
                style={{
                  border: `2px dashed ${csvFile ? TEAL : BORDER}`,
                  borderRadius: 16, padding: "36px 24px", textAlign: "center",
                  cursor: "pointer", background: csvFile ? TEAL_LIGHT : "#fafcfb",
                  transition: "all 0.2s ease"
                }}
              >
                <input ref={fileRef} type="file" accept=".csv,.tsv,.txt" onChange={handleCsvSelect} style={{ display: "none" }} />
                {csvFile ? (
                  <>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, margin: "0 auto 12px",
                      background: `linear-gradient(135deg, ${TEAL}, ${SAGE})`,
                      display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>{csvFile.name}</div>
                    <div style={{ fontSize: 13, color: TEXT_SEC, marginTop: 4 }}>{csvPreview?.total || 0} clients found</div>
                    <div style={{ fontSize: 12, color: TEAL, marginTop: 6, fontWeight: 600 }}>Click to replace file</div>
                  </>
                ) : (
                  <>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, margin: "0 auto 12px",
                      background: "#f0f4f3", display: "flex", alignItems: "center", justifyContent: "center", color: TEXT_SEC
                    }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>Upload CSV File</div>
                    <div style={{ fontSize: 13, color: TEXT_SEC, marginTop: 4 }}>Click to browse or drag and drop</div>
                    <div style={{ fontSize: 12, color: TEXT_SEC, marginTop: 8 }}>Accepts .csv files with columns: name, email, phone, program</div>
                  </>
                )}
              </div>

              {/* CSV Preview */}
              {csvPreview && (
                <div style={{ borderRadius: 12, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
                  <div style={{ padding: "10px 14px", background: "#fafcfb", borderBottom: `1px solid ${BORDER}`, fontSize: 12, fontWeight: 700, color: TEXT }}>
                    Preview ({csvPreview.total} rows)
                  </div>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                      <thead>
                        <tr>
                          {csvPreview.headers.map((h, i) => (
                            <th key={i} style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, color: TEXT_SEC, borderBottom: `1px solid ${BORDER}`, whiteSpace: "nowrap" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {csvPreview.rows.map((row, ri) => (
                          <tr key={ri}>
                            {row.map((cell, ci) => (
                              <td key={ci} style={{ padding: "8px 12px", color: TEXT, borderBottom: ri < csvPreview.rows.length - 1 ? `1px solid ${BORDER}` : "none", whiteSpace: "nowrap" }}>{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {csvPreview.total > 5 && (
                    <div style={{ padding: "8px 14px", fontSize: 11, color: TEXT_SEC, textAlign: "center", borderTop: `1px solid ${BORDER}`, background: "#fafcfb" }}>
                      Showing 5 of {csvPreview.total} rows
                    </div>
                  )}
                </div>
              )}

              {/* Template download hint */}
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "12px 16px", borderRadius: 12,
                background: TEAL_LIGHT, border: "1px solid #b6dfd8"
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                <span style={{ fontSize: 12, color: TEAL, fontWeight: 500 }}>
                  CSV should include columns: <strong>name, email, phone, program</strong>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: isMobile ? "14px 18px" : "16px 28px",
          borderTop: `1px solid ${BORDER}`, flexShrink: 0,
          display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10
        }}>
          <div onClick={onClose} style={{
            padding: "10px 20px", borderRadius: 10, cursor: "pointer",
            fontSize: 13, fontWeight: 600, color: TEXT_SEC,
            border: `1px solid ${BORDER}`, background: WHITE
          }}>Cancel</div>
          <div onClick={handleSubmit} style={{
            padding: "10px 24px", borderRadius: 10, cursor: "pointer",
            fontSize: 13, fontWeight: 600, color: "#fff",
            background: (mode === "single" && form.name) || (mode === "csv" && csvFile) ? TEAL : "#b0c4c0",
            boxShadow: (mode === "single" && form.name) || (mode === "csv" && csvFile) ? "0 2px 8px rgba(43,122,120,0.3)" : "none",
            pointerEvents: (mode === "single" && form.name) || (mode === "csv" && csvFile) ? "auto" : "none",
            transition: "all 0.15s ease"
          }}>
            {mode === "csv" ? `Import ${csvPreview?.total || 0} Clients` : "Add Client"}
          </div>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════
   MAIN DASHBOARD
   ═══════════════════════════════════════════ */
export default function MiltonDashboard() {
  const isMobile = useIsMobile();
  const [clients, setClients] = useState([...initialClients]);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([...chatSeedMessages]);
  const [chatTyping, setChatTyping] = useState(false);
  const [hoveredClient, setHoveredClient] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientFilter, setClientFilter] = useState(null);
  const [showAddClient, setShowAddClient] = useState(false);
  const [mainReportBlocks, setMainReportBlocks] = useState(null);
  const [mainCustomizeMode, setMainCustomizeMode] = useState(false);
  const chatEndRef = useRef(null);
  const [animatedKPIs, setAnimatedKPIs] = useState([false, false, false, false]);

  const clientNames = clients.map(c => c.name);

  const handleChatSend = (text) => {
    setChatMessages(prev => [...prev, { type: "user", text }]);
    setChatTyping(true);
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    const delay = 800 + Math.random() * 1200;

    // Report customization commands
    const low = text.toLowerCase();
    const reportCmd = (() => {
      const blocks = mainReportBlocks || ["top3", "rule30", "dataCards", "calendar", "insight"];
      const blockMap = {
        "nutrition": { id: "nutrition", label: "Nutrition Breakdown" },
        "focus": { id: "focus", label: "Focus Areas" },
        "coach notes": { id: "coachNotes", label: "Coach Notes" },
        "coach note": { id: "coachNotes", label: "Coach Notes" },
        "notes": { id: "coachNotes", label: "Coach Notes" },
        "rule of 30": { id: "rule30", label: "Rule of 30" },
        "rule30": { id: "rule30", label: "Rule of 30" },
        "calendar": { id: "calendar", label: "Daily Activity" },
        "daily activity": { id: "calendar", label: "Daily Activity" },
        "activity": { id: "calendar", label: "Daily Activity" },
        "data cards": { id: "dataCards", label: "Data Cards" },
        "score": { id: "top3", label: "Score & Charts" },
        "charts": { id: "top3", label: "Score & Charts" },
        "transformation": { id: "top3", label: "Score & Charts" },
        "insight": { id: "insight", label: "Milton Insight" },
      };
      if (low.includes("add") || low.includes("include") || low.includes("show")) {
        for (const [key, val] of Object.entries(blockMap)) {
          if (low.includes(key) && !blocks.includes(val.id)) {
            return { action: "add", block: val, newBlocks: [...blocks, val.id] };
          }
        }
      }
      if (low.includes("remove") || low.includes("hide") || low.includes("delete") || low.includes("take out")) {
        for (const [key, val] of Object.entries(blockMap)) {
          if (low.includes(key) && blocks.includes(val.id)) {
            return { action: "remove", block: val, newBlocks: blocks.filter(b => b !== val.id) };
          }
        }
      }
      if (low.includes("move") && low.includes("top")) {
        for (const [key, val] of Object.entries(blockMap)) {
          if (low.includes(key) && blocks.includes(val.id)) {
            const rest = blocks.filter(b => b !== val.id);
            return { action: "move", block: val, newBlocks: [val.id, ...rest] };
          }
        }
      }
      if (low.includes("move") && low.includes("bottom")) {
        for (const [key, val] of Object.entries(blockMap)) {
          if (low.includes(key) && blocks.includes(val.id)) {
            const rest = blocks.filter(b => b !== val.id);
            return { action: "move", block: val, newBlocks: [...rest, val.id] };
          }
        }
      }
      return null;
    })();

    if (reportCmd) {
      setTimeout(() => {
        setMainReportBlocks(reportCmd.newBlocks);
        const msgs = {
          add: { title: `Added: ${reportCmd.block.label}`, text: `I've added the ${reportCmd.block.label} section to the report. You can see it in the overview now. Want me to adjust anything about it?` },
          remove: { title: `Removed: ${reportCmd.block.label}`, text: `Done — I've removed the ${reportCmd.block.label} section. You can always add it back by telling me or clicking the + button in customize mode.` },
          move: { title: `Moved: ${reportCmd.block.label}`, text: `I've moved ${reportCmd.block.label} to the ${low.includes("top") ? "top" : "bottom"} of the report. Let me know if you want to rearrange anything else.` },
        };
        setChatMessages(prev => [...prev, { type: "ai", ...(msgs[reportCmd.action] || msgs.add) }]);
        setChatTyping(false);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      }, delay);
      return;
    }

    setTimeout(() => {
      const resp = generateAIResponse(text, clientNames, clients);
      // Apply real-time client data updates
      if (resp.clientUpdate) {
        const { idx, changes } = resp.clientUpdate;
        setClients(prev => {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], ...changes };
          return updated;
        });
      }
      setChatMessages(prev => [...prev, { type: "ai", title: resp.title, text: resp.text }]);
      setChatTyping(false);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }, delay);
  };


  useEffect(() => {
    const timers = [];
    [0,1,2,3].forEach((_, i) => {
      timers.push(setTimeout(() => setAnimatedKPIs(prev => { const n = [...prev]; n[i] = true; return n; }), 200 + i * 150));
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const font = `'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif`;

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", background: BG, fontFamily: font, color: TEXT, overflow: "hidden", position: "relative" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* ═══ MOBILE HEADER BAR ═══ */}
      {isMobile && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 16px", height: 56, background: WHITE,
          borderBottom: `1px solid ${BORDER}`, boxShadow: "0 1px 6px rgba(0,0,0,0.04)"
        }}>
          {selectedClient !== null ? (
            <div onClick={() => setSelectedClient(null)} style={{ cursor: "pointer", color: TEXT_SEC, padding: 6 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15,18 9,12 15,6"/></svg>
            </div>
          ) : (
            <div style={{
              width: 34, height: 34, borderRadius: "50%", background: "#f0f4f3",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: TEXT_SEC
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <img src={LOGO_URL} alt="Milton" style={{ width: 30, height: 30, borderRadius: 8 }} />
            <span style={{ fontSize: 18, fontWeight: 700, color: TEXT }}>Milton</span>
          </div>
          <div onClick={() => setShowAddClient(true)} style={{
              width: 34, height: 34, borderRadius: 10, background: TEAL,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", boxShadow: "0 2px 6px rgba(43,122,120,0.3)"
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                <line x1="8" y1="3" x2="8" y2="13"/><line x1="3" y1="8" x2="13" y2="8"/>
              </svg>
            </div>
        </div>
      )}

      {/* ═══ DESKTOP CHAT PANEL ═══ */}
      {!isMobile && (
        <div style={{
          width: 352, flexShrink: 0, padding: "14px 6px 14px 10px",
          display: "flex", flexDirection: "column"
        }}>
          <section style={{
            flex: 1, background: WHITE, display: "flex", flexDirection: "column",
            borderRadius: 20, border: `1px solid ${BORDER}`,
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            overflow: "hidden"
          }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "16px 18px", borderBottom: `1px solid ${BORDER}`
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <img src={LOGO_URL} alt="Milton" style={{ width: 28, height: 28, borderRadius: 8 }} />
                <span style={{ fontSize: 16, fontWeight: 700, color: TEXT }}>Milton AI</span>
              </div>
              <div style={{ display: "flex", gap: 10, color: TEXT_SEC }}>
                <NavIcon icon="message" size={18} /><NavIcon icon="settings" size={18} />
              </div>
            </div>
            <ChatContent
              chatInput={chatInput} setChatInput={setChatInput}
              messages={chatMessages} onSend={handleChatSend}
              chatEndRef={chatEndRef} isMobile={false} typing={chatTyping}
            />
          </section>
        </div>
      )}

      {/* ═══ MAIN CONTENT ═══ */}
      {selectedClient !== null ? (
        <main style={{ flex: 1, overflowY: "auto" }}>
          <ClientProfile
            client={clients[selectedClient]}
            onBack={() => setSelectedClient(null)}
            isMobile={isMobile}
            reportBlocks={mainReportBlocks || ["top3", "rule30", "dataCards", "calendar", "insight"]}
            setReportBlocks={(v) => setMainReportBlocks(typeof v === "function" ? v(mainReportBlocks || ["top3", "rule30", "dataCards", "calendar", "insight"]) : v)}
            onReportOpen={(client) => {
              setChatMessages(prev => [...prev, {
                type: "ai",
                title: `${client.name.split(" ")[0]}'s Report — Milton Insight`,
                text: `${client.insight}\n\nCoaching angle: ${client.coachAngle}`
              }]);
            }}
          />
        </main>
      ) : (
      <main style={{
        flex: 1, overflowY: "auto",
        padding: isMobile ? "68px 14px 76px" : "24px 28px",
        display: "flex", flexDirection: "column", gap: isMobile ? 14 : 20
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 0 : 16 }}>
            {!isMobile && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginRight: 8 }}>
                <img src={LOGO_URL} alt="Milton" style={{ width: 36, height: 36, borderRadius: 10 }} />
                <span style={{ fontSize: 22, fontWeight: 700, color: TEXT, letterSpacing: "-0.02em" }}>Milton</span>
              </div>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {!isMobile && (<>
              <div onClick={() => setShowAddClient(true)} style={{
                display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
                background: TEAL, borderRadius: 10, color: "#fff",
                fontSize: 13, fontWeight: 600, cursor: "pointer",
                boxShadow: "0 2px 8px rgba(43,122,120,0.3)",
                transition: "all 0.15s ease"
              }}
                onMouseEnter={e => e.currentTarget.style.background = "#236664"}
                onMouseLeave={e => e.currentTarget.style.background = TEAL}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                  <line x1="8" y1="3" x2="8" y2="13"/><line x1="3" y1="8" x2="13" y2="8"/>
                </svg>
                Add Client
              </div>
              <div style={{
                width: 38, height: 38, borderRadius: "50%", background: "#f0f4f3",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: TEXT_SEC, border: `1px solid ${BORDER}`,
                transition: "all 0.15s ease"
              }}
                onMouseEnter={e => { e.currentTarget.style.background = TEAL_LIGHT; e.currentTarget.style.color = TEAL; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#f0f4f3"; e.currentTarget.style.color = TEXT_SEC; }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
            </>)}
          </div>
        </div>

        {/* KPI Cards */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: isMobile ? 10 : 14 }}>

          {/* ── Card 1: Active Clients - Person Icons ── */}
          <div style={{
            background: WHITE, borderRadius: 16, border: `1px solid ${BORDER}`,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)", padding: isMobile ? "14px" : "18px 20px",
            opacity: animatedKPIs[0] ? 1 : 0, transform: animatedKPIs[0] ? "translateY(0)" : "translateY(12px)",
            transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)", display: "flex", flexDirection: "column"
          }}>
            <div style={{ fontSize: 11, color: TEXT_SEC, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Active Clients</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: isMobile ? 12 : 16 }}>
              <span style={{ fontSize: isMobile ? 28 : 36, fontWeight: 700, color: TEXT, letterSpacing: "-0.03em", lineHeight: 1 }}>12</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: ALERT_GREEN, background: "#e8f5e9", padding: "2px 7px", borderRadius: 10, display: "inline-flex", alignItems: "center", gap: 2 }}>
                <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke={ALERT_GREEN} strokeWidth="2" strokeLinecap="round"><polyline points="1,8 6,3 11,8" /></svg>
                +3
              </span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: "auto" }}>
              {Array.from({ length: 12 }).map((_, j) => {
                const colors = ["#2B7A78", "#3aafa9", "#5CDB95", "#45818e", "#6aa84f", "#e06666", "#f6b26b", "#8e7cc3", "#2B7A78", "#3aafa9", "#45818e", "#5CDB95"];
                return (
                  <svg key={j} width={isMobile ? 22 : 26} height={isMobile ? 22 : 26} viewBox="0 0 26 26">
                    <circle cx="13" cy="10" r="5" fill={colors[j]} opacity="0.85"/>
                    <ellipse cx="13" cy="22" rx="7" ry="5" fill={colors[j]} opacity="0.5"/>
                  </svg>
                );
              })}
            </div>
          </div>

          {/* ── Card 2: Engagement Rate - Dot Grid ── */}
          <div style={{
            background: WHITE, borderRadius: 16, border: `1px solid ${BORDER}`,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)", padding: isMobile ? "14px" : "18px 20px",
            opacity: animatedKPIs[1] ? 1 : 0, transform: animatedKPIs[1] ? "translateY(0)" : "translateY(12px)",
            transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)", display: "flex", flexDirection: "column"
          }}>
            <div style={{ fontSize: 11, color: TEXT_SEC, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Engagement Rate</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: isMobile ? 10 : 14 }}>
              <span style={{ fontSize: isMobile ? 28 : 36, fontWeight: 700, color: TEXT, letterSpacing: "-0.03em", lineHeight: 1 }}>83%</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: ALERT_GREEN, background: "#e8f5e9", padding: "2px 7px", borderRadius: 10, display: "inline-flex", alignItems: "center", gap: 2 }}>
                <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke={ALERT_GREEN} strokeWidth="2" strokeLinecap="round"><polyline points="1,8 6,3 11,8" /></svg>
                +12%
              </span>
            </div>
            {(() => {
              const total = 12;
              const engaged = 10;
              const dotSize = isMobile ? 20 : 24;
              const engagedColors = ["#2B7A78", "#3aafa9", "#5CDB95", "#45818e", "#2B7A78", "#3aafa9", "#6aa84f", "#5CDB95", "#45818e", "#2B7A78"];
              return (
                <div style={{ display: "flex", flexWrap: "wrap", gap: isMobile ? 5 : 6, marginTop: "auto" }}>
                  {Array.from({ length: total }).map((_, j) => {
                    const isEngaged = j < engaged;
                    return (
                      <div key={j} style={{
                        width: dotSize, height: dotSize, borderRadius: "50%",
                        background: isEngaged ? engagedColors[j] : "transparent",
                        border: isEngaged ? "none" : `2px dashed #c8d8d4`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.4s ease",
                        transitionDelay: `${j * 0.04}s`
                      }}>
                        {isEngaged && (
                          <svg width={dotSize * 0.5} height={dotSize * 0.5} viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="2,6 5,9 10,3" />
                          </svg>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}
            <div style={{ fontSize: 11, color: TEXT_SEC, fontWeight: 500, marginTop: 8 }}>
              <span style={{ fontWeight: 700, color: TEXT }}>10</span> of 12 clients engaged
            </div>
          </div>

          {/* ── Card 3: Client Growth - Progressive Bar Chart ── */}
          <div style={{
            background: WHITE, borderRadius: 16, border: `1px solid ${BORDER}`,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)", padding: isMobile ? "14px" : "18px 20px",
            opacity: animatedKPIs[2] ? 1 : 0, transform: animatedKPIs[2] ? "translateY(0)" : "translateY(12px)",
            transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)", display: "flex", flexDirection: "column"
          }}>
            <div style={{ fontSize: 11, color: TEXT_SEC, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Client Growth</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: isMobile ? 10 : 14 }}>
              <span style={{ fontSize: isMobile ? 28 : 36, fontWeight: 700, color: TEXT, letterSpacing: "-0.03em", lineHeight: 1 }}>12</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: ALERT_GREEN, background: "#e8f5e9", padding: "2px 7px", borderRadius: 10, display: "inline-flex", alignItems: "center", gap: 2 }}>
                <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke={ALERT_GREEN} strokeWidth="2" strokeLinecap="round"><polyline points="1,8 6,3 11,8" /></svg>
                +12
              </span>
            </div>
            {(() => {
              const months = [
                { label: "Jul", value: 1 },
                { label: "Aug", value: 2 },
                { label: "Sep", value: 3 },
                { label: "Oct", value: 5 },
                { label: "Nov", value: 7 },
                { label: "Dec", value: 8 },
                { label: "Jan", value: 10 },
                { label: "Feb", value: 12 },
              ];
              const maxVal = 12;
              const barH = isMobile ? 50 : 60;
              return (
                <div style={{ display: "flex", alignItems: "flex-end", gap: isMobile ? 3 : 5, flex: 1, marginTop: "auto" }}>
                  {months.map((m, j) => {
                    const h = Math.max(3, (m.value / maxVal) * barH);
                    const isLast = j === months.length - 1;
                    const intensity = 0.15 + (j / (months.length - 1)) * 0.85;
                    return (
                      <div key={j} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, gap: 4 }}>
                        <span style={{ fontSize: 9, fontWeight: 700, color: isLast ? TEAL : TEXT_SEC }}>
                          {m.value}
                        </span>
                        <div style={{
                          width: "100%", height: h, borderRadius: 4,
                          background: isLast
                            ? `linear-gradient(180deg, ${TEAL}, ${SAGE})`
                            : `rgba(43,122,120,${intensity})`,
                          transition: "height 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
                          transitionDelay: `${j * 0.07}s`
                        }} />
                        <span style={{ fontSize: 9, color: TEXT_SEC, fontWeight: 500 }}>{m.label}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          {/* ── Card 4: Data Points Collected - Progressive Bar Chart ── */}
          <div style={{
            background: WHITE, borderRadius: 16, border: `1px solid ${BORDER}`,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)", padding: isMobile ? "14px" : "18px 20px",
            opacity: animatedKPIs[3] ? 1 : 0, transform: animatedKPIs[3] ? "translateY(0)" : "translateY(12px)",
            transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)", display: "flex", flexDirection: "column"
          }}>
            <div style={{ fontSize: 11, color: TEXT_SEC, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Data Points</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: isMobile ? 10 : 14 }}>
              <span style={{ fontSize: isMobile ? 28 : 36, fontWeight: 700, color: TEXT, letterSpacing: "-0.03em", lineHeight: 1 }}>1,847</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: ALERT_GREEN, background: "#e8f5e9", padding: "2px 7px", borderRadius: 10, display: "inline-flex", alignItems: "center", gap: 2 }}>
                <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke={ALERT_GREEN} strokeWidth="2" strokeLinecap="round"><polyline points="1,8 6,3 11,8" /></svg>
                +22%
              </span>
            </div>
            {(() => {
              const months = [
                { label: "Jul", value: 42 },
                { label: "Aug", value: 98 },
                { label: "Sep", value: 187 },
                { label: "Oct", value: 295 },
                { label: "Nov", value: 410 },
                { label: "Dec", value: 520 },
                { label: "Jan", value: 680 },
                { label: "Feb", value: 847 },
              ];
              const maxVal = months[months.length - 1].value;
              const barH = isMobile ? 50 : 60;
              return (
                <div style={{ display: "flex", alignItems: "flex-end", gap: isMobile ? 3 : 5, flex: 1, marginTop: "auto" }}>
                  {months.map((m, j) => {
                    const h = Math.max(3, (m.value / maxVal) * barH);
                    const isLast = j === months.length - 1;
                    const intensity = 0.12 + (j / (months.length - 1)) * 0.88;
                    return (
                      <div key={j} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, gap: 4 }}>
                        <span style={{ fontSize: 9, fontWeight: 700, color: isLast ? SAGE : TEXT_SEC }}>
                          {m.value}
                        </span>
                        <div style={{
                          width: "100%", height: h, borderRadius: 4,
                          background: isLast
                            ? `linear-gradient(180deg, ${MINT}, ${SAGE})`
                            : `rgba(92,219,149,${intensity})`,
                          transition: "height 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
                          transitionDelay: `${j * 0.07}s`
                        }} />
                        <span style={{ fontSize: 9, color: TEXT_SEC, fontWeight: 500 }}>{m.label}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>

        </div>

        {/* Coaching Queue */}
        <div style={{
          background: WHITE, borderRadius: 16, padding: isMobile ? "16px" : "20px 24px",
          border: `1px solid ${BORDER}`, boxShadow: "0 1px 4px rgba(0,0,0,0.03)"
        }}>
          <div style={{ marginBottom: 14 }}>
            <span style={{ fontSize: isMobile ? 16 : 18, fontWeight: 700, color: TEXT }}>Today's Coaching Queue</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: isMobile ? 8 : 10 }}>
            {[
              {
                count: clients.filter(c => c.alertType === "red").length, label: "Clients Attention", filterType: "red",
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill="#fee2e2"/>
                    <circle cx="12" cy="12" r="6" fill="#fca5a5"/>
                    <circle cx="12" cy="12" r="2.5" fill="#ef4444"/>
                  </svg>
                )
              },
              {
                count: clients.filter(c => c.alertType === "blue").length, label: "Reports Ready", filterType: "blue",
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <rect x="4" y="3" width="16" height="18" rx="3" fill="#dbeafe"/>
                    <rect x="7" y="7" width="6" height="1.5" rx="0.75" fill="#60a5fa"/>
                    <rect x="7" y="10.5" width="10" height="1.5" rx="0.75" fill="#93c5fd"/>
                    <rect x="7" y="14" width="8" height="1.5" rx="0.75" fill="#93c5fd"/>
                    <circle cx="17" cy="17" r="5" fill="#34d399"/>
                    <polyline points="14.5,17 16.2,18.7 19.5,15.3" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                )
              },
              {
                count: clients.filter(c => c.alertType === "green").length, label: "Client Milestone", filterType: "green",
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="9" r="5" fill="#e9d5ff"/>
                    <path d="M12 4l1.5 3 3.5.5-2.5 2.4.6 3.5L12 12l-3.1 1.4.6-3.5L7 7.5l3.5-.5z" fill="#a78bfa"/>
                    <path d="M6 18c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="#c4b5fd" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                  </svg>
                )
              },
            ].map((q, i) => {
              const isActive = clientFilter === q.filterType;
              return (
              <div key={i} onClick={() => setClientFilter(isActive ? null : q.filterType)} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: isMobile ? "10px 14px" : "10px 16px",
                borderRadius: 28,
                background: isActive ? TEAL : "#f8faf9",
                border: isActive ? `1px solid ${TEAL}` : `1px solid ${BORDER}`,
                cursor: "pointer",
                boxShadow: isActive ? "0 2px 10px rgba(43,122,120,0.3)" : "0 1px 3px rgba(0,0,0,0.03)",
                transition: "all 0.2s ease", whiteSpace: "nowrap",
                transform: isActive ? "scale(1.03)" : "scale(1)"
              }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.07)"; e.currentTarget.style.transform = "translateY(-1px)"; }}}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.03)"; e.currentTarget.style.transform = "scale(1)"; }}}
              >
                {q.icon}
                <span style={{ fontSize: 13, fontWeight: 600, color: isActive ? "#fff" : TEXT }}>
                  {q.count} {q.label}
                </span>
                {isActive && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                )}
              </div>
              );
            })}
          </div>
        </div>

        {/* Client Table / List */}
        {clientFilter && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 16px", borderRadius: 12, background: TEAL_LIGHT,
            border: `1px solid #b6dfd8`
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: TEAL }}>
              Showing: {clientFilter === "red" ? "Needs Attention" : clientFilter === "blue" ? "Report Ready" : "Made Progress"} ({clients.filter(c => c.alertType === clientFilter).length})
            </span>
            <div onClick={() => setClientFilter(null)} style={{ cursor: "pointer", color: TEAL, display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600 }}>
              Clear filter
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </div>
          </div>
        )}
        {isMobile ? (
          /* ─── Mobile: Individual client cards ─── */
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {clients.filter(c => !clientFilter || c.alertType === clientFilter).map((client, _fi) => { const i = clients.indexOf(client); return (
              <div key={i} onClick={() => setSelectedClient(i)} style={{
                background: WHITE, borderRadius: 16, border: `1px solid ${BORDER}`,
                boxShadow: "0 2px 6px rgba(0,0,0,0.04)", padding: "16px",
                display: "flex", flexDirection: "column", gap: 12, cursor: "pointer"
              }}>
                {/* Row 1: Avatar + Name + Badge */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Avatar name={client.name} size={48} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: TEXT }}>{client.name}</span>
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                    <AlertBadge type={client.alertType} label={client.alert} />
                    <StreakBadge streak={client.streaks} compact />
                  </div>
                </div>

                {/* Narrative */}
                {client.narrative && (
                  <div style={{ fontSize: 12, color: TEXT_SEC, lineHeight: 1.5, fontStyle: "italic", padding: "0 2px" }}>
                    "{client.narrative}"
                  </div>
                )}


                {/* Row 3: Progress bar full width */}
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: TEXT_SEC, marginBottom: 6 }}>
                    {client.progressLabel ? (
                      <span>100% — <span style={{ color: TEAL, fontWeight: 700 }}>{client.progressLabel}</span></span>
                    ) : (
                      <span>Report Progress: <span style={{ color: TEXT, fontWeight: 700 }}>{client.progress}% complete</span></span>
                    )}
                  </div>
                  <div style={{ width: "100%", height: 6, borderRadius: 3, background: "#e8f0ee" }}>
                    <div style={{
                      width: `${client.progress || 0}%`, height: "100%", borderRadius: 3,
                      background: client.progressLabel
                        ? `linear-gradient(90deg, ${SAGE}, ${MINT})`
                        : `linear-gradient(90deg, ${TEAL}, ${SAGE})`,
                      transition: "width 1s ease"
                    }} />
                  </div>
                </div>
              </div>
            ); })}
          </div>
        ) : (
          /* ─── Desktop: Table ─── */
          <div style={{
            background: WHITE, borderRadius: 16, border: `1px solid ${BORDER}`,
            boxShadow: "0 1px 4px rgba(0,0,0,0.03)", overflow: "hidden", flex: 1
          }}>
            <div style={{
              display: "grid", gridTemplateColumns: "2fr 1.1fr 1fr 1fr 36px",
              padding: "12px 24px", background: "#fafcfb",
              borderBottom: `1px solid ${BORDER}`, fontSize: 12, fontWeight: 600,
              color: TEXT_SEC, textTransform: "uppercase", letterSpacing: "0.05em"
            }}>
              <span>Client Name</span><span>Alerts</span><span>Data Connections</span><span>Report Progress</span><span />
            </div>
            {clients.filter(c => !clientFilter || c.alertType === clientFilter).map((client, _fi) => { const i = clients.indexOf(client); return (
              <div key={i}
                onClick={() => setSelectedClient(i)}
                onMouseEnter={() => setHoveredClient(i)} onMouseLeave={() => setHoveredClient(null)}
                style={{
                  display: "grid", gridTemplateColumns: "2fr 1.1fr 1fr 1fr 36px",
                  padding: "14px 24px", alignItems: "center",
                  borderBottom: i < clients.length - 1 ? `1px solid ${BORDER}` : "none",
                  background: hoveredClient === i ? "#f7faf9" : "transparent",
                  transition: "background 0.15s ease", cursor: "pointer"
                }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Avatar name={client.name} size={34} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{client.name}</div>
                    {client.narrative && <div style={{ fontSize: 11, color: TEXT_SEC, marginTop: 2, fontStyle: "italic", lineHeight: 1.4, maxWidth: 260 }}>"{client.narrative}"</div>}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}><AlertBadge type={client.alertType} label={client.alert} /><StreakBadge streak={client.streaks} compact /></div>
                <div style={{ display: "flex", paddingLeft: 4 }}>
                  {client.connectors.map((c, j) => <ConnectorDot key={j} type={c} first={j === 0} />)}
                </div>
                <div>
                  {client.progressLabel ? (
                    <span style={{ fontSize: 13, fontWeight: 600, color: TEAL }}>{client.progressLabel}</span>
                  ) : (
                    <ProgressBar value={client.progress || 0} />
                  )}
                </div>
                <div style={{ color: TEXT_SEC, display: "flex", justifyContent: "center" }}>
                  <NavIcon icon="chevron" size={16} />
                </div>
              </div>
            ); })}
          </div>
        )}
      </main>
      )}

      {/* ═══ ADD CLIENT MODAL ═══ */}
      {showAddClient && <AddClientModal onClose={() => setShowAddClient(false)} isMobile={isMobile} />}

      {/* ═══ MOBILE GLASS CHAT BAR + SHEET ═══ */}
      {isMobile && (
        <MobileChatSheet
          chatOpen={chatOpen} setChatOpen={setChatOpen}
          chatInput={chatInput} setChatInput={setChatInput}
          messages={chatMessages} onSend={handleChatSend}
          chatEndRef={chatEndRef} typing={chatTyping}
        />
      )}

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        @keyframes typingDot {
          0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(-3px); }
        }
        @keyframes peekUp {
          0% { transform: translateY(60px); }
          15% { transform: translateY(60px); }
          35% { transform: translateY(-8px); }
          50% { transform: translateY(0); }
          100% { transform: translateY(0); }
        }
        @keyframes peekFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${BORDER}; border-radius: 3px; }
        input::placeholder { color: ${TEXT_SEC}; opacity: 0.7; }
      `}</style>
    </div>
  );
}
