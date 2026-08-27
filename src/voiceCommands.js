/* ───────────────────────────────────────────────────────────────
   Milton Voice — spoken intent resolver

   Maps a coach's spoken sentence onto a concrete action inside the
   dashboard. Every resolved command returns:

     canvas / home   where the screen should go
     spoken          what Milton says out loud (kept short, no markdown)
     chat            the receipt Milton drops into the chat log
     steps           the work Milton narrates while it executes

   Built around what a gym owner actually says out loud: launching an
   offer, working the lead queue, moving sessions, clearing the inbox.
   ─────────────────────────────────────────────────────────────── */

const money = (t) => {
  const m = t.match(/\$\s?(\d[\d,]*)|(\d[\d,]*)\s*(?:dollars|bucks|a month|per month)/i);
  if (!m) return null;
  const raw = (m[1] || m[2] || "").replace(/,/g, "");
  return raw ? `$${Number(raw).toLocaleString()}` : null;
};

const named = (t) => {
  const quoted = t.match(/["“']([^"”']{3,48})["”']/);
  if (quoted) return quoted[1].trim();
  const called = t.match(/\b(?:called|named|titled)\s+(.{3,48}?)(?:\s+(?:for|at|priced|starting|to)\b|[.,]|$)/i);
  if (called) return called[1].trim().replace(/\s+/g, " ");
  const challenge = t.match(/\b((?:\d+[- ]?week\s+)?[a-z0-9' ]*?(?:challenge|bootcamp|boot camp|shred|transformation|program|package|membership|bundle|intensive|reset))\b/i);
  if (challenge) return challenge[1].trim().replace(/\s+/g, " ");
  return null;
};

const title = (s) => s.replace(/\b\w/g, (c) => c.toUpperCase());

const DAY = /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|tomorrow|today|tonight|monday's|tuesday's|wednesday's|thursday's|friday's|saturday's|sunday's)\b/i;
const TIME = /\b(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.|o'clock)?\b/i;

const clock = (t, skip) => {
  const all = [...t.matchAll(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/gi)];
  const hit = all[skip || 0];
  if (!hit) return null;
  return `${hit[1]}${hit[2] ? `:${hit[2]}` : ""}${hit[3] ? hit[3].toLowerCase() : ""}`;
};

/* ─── The command table ───
   Ordered most-specific first. Each entry gets the lowercased
   utterance plus the raw text for slot extraction. */
const COMMANDS = [
  /* ─────────── Launch an offer / product ─────────── */
  {
    id: "launchProduct",
    test: (l) =>
      /\b(launch|publish|put\s*(?:it\s*)?live|go\s*live|spin\s*up|set\s*up|create|build|sell|open\s*(?:up\s*)?enrol?lment)\b/.test(l) &&
      /\b(offer|product|package|challenge|bootcamp|boot camp|membership|program|bundle|plan|shred|transformation|intensive|reset|checkout|paid)\b/.test(l),
    build: (raw) => {
      const price = money(raw) || "$199";
      const name = title(named(raw) || "6-Week Shred Challenge");
      return {
        canvas: "payments",
        title: "Launching an offer",
        spoken: `Launching ${name} at ${price}. I'm building the checkout, the signup page and the announcement now. It's on your screen.`,
        chat: `**Launched ${name} — ${price}.** Checkout is live, the signup page is published, and the announcement is queued to your list. Payments canvas is open on the right so you can watch the first sales land.`,
        steps: [
          `Creating offer "${name}" at ${price}`,
          "Generating Stripe checkout + payment plan option",
          "Publishing the signup page and adding it to your link in bio",
          "Queueing the announcement to 412 contacts and 38 warm leads",
          "Live — tracking sales in Payments",
        ],
      };
    },
  },

  /* ─────────── Revenue / money questions ─────────── */
  {
    id: "revenue",
    test: (l) =>
      /\b(revenue|money|mrr|sales|billing|collected|failed payment|past due|declines?|dunning|cash|payouts?|subscriptions?)\b/.test(l),
    build: () => ({
      canvas: "payments",
      title: "Revenue check",
      spoken: "Pulling your revenue. Monthly recurring is up eleven percent, and you've got three failed payments I can chase for you.",
      chat: "**Revenue is up 11% month over month.** Recurring billing is healthy, but there are **3 failed payments** worth chasing — say *\"chase the failed payments\"* and I'll run the retry sequence.",
      steps: [
        "Reconciling this month's billing",
        "Comparing against your last 3 months",
        "Flagging 3 failed payments and 2 cards expiring",
        "Opening Payments",
      ],
    }),
  },

  /* ─────────── CRM queue ─────────── */
  {
    id: "crmQueue",
    test: (l) =>
      /\b(queue|crm|leads?|lead\s*list|prospects?|pipeline|follow\s*ups?|follow\s*up|inquir(y|ies)|new\s*sign\s*ups?|trials?|walk\s*ins?)\b/.test(l),
    build: (raw) => {
      const acting = /\b(contact|reach\s*out|text|call|message|work|clear|run|handle|follow\s*up|chase|hit)\b/i.test(raw);
      return {
        canvas: "crm",
        title: acting ? "Working the queue" : "Lead queue",
        spoken: acting
          ? "Working your queue. Nine people need a touch today. I've drafted each one in your voice — approve them on screen and they send."
          : "You have nine people in the queue today. Two are hot, four are waiting on a reply from you, and three have gone cold.",
        chat: acting
          ? "**Drafted outreach for all 9 people in your queue.** Each message references their last conversation and the reason they came in. They're staged in Leads — approve and they go out on the right cadence."
          : "**9 people in your queue today.** 2 are ready to buy, 4 are waiting on you, 3 need a re-engagement touch. The queue is open on the right, sorted by who's most likely to close.",
        steps: acting
          ? [
              "Reading the last touch on all 9 queued contacts",
              "Drafting personalised messages in your tone of voice",
              "Setting send times to each person's best response window",
              "Staged for your approval in the Leads queue",
            ]
          : [
              "Scoring every open lead on intent and recency",
              "Ranking by likelihood to close this week",
              "Surfacing the 2 hot contacts up top",
              "Opening your Leads queue",
            ],
      };
    },
  },

  /* ─────────── Scheduling changes ─────────── */
  {
    id: "scheduleChange",
    test: (l) =>
      /\b(move|reschedul|shift|push|bump|cancel|cover|swap|sub\s*in|book|add)\b/.test(l) &&
      (/\b(session|class|slot|appointment|training|client|coach|group|semi|am|pm|o'clock)\b/.test(l) || DAY.test(l)),
    build: (raw) => {
      const l = raw.toLowerCase();
      const cancelling = /\b(cancel|call\s*off|kill)\b/.test(l);
      const from = clock(raw, 0);
      const to = clock(raw, 1);
      const day = (raw.match(DAY) || [])[0];
      const when = [day, from].filter(Boolean).join(" ").replace(/'s\b/, "");
      const label = when || "that session";
      if (cancelling) {
        return {
          canvas: "schedule",
          title: "Cancelling a session",
          spoken: `Cancelling ${label}. I'm notifying everyone booked, releasing their credits and offering the next available slot.`,
          chat: `**Cancelled ${label}.** Everyone booked has been notified, credits are back on their accounts, and each person got the next two open slots to rebook. Nobody needs to chase you.`,
          steps: [
            `Cancelling ${label}`,
            "Notifying booked clients by text and email",
            "Releasing session credits back to their accounts",
            "Offering each of them the next two open slots",
          ],
        };
      }
      return {
        canvas: "schedule",
        title: "Moving a session",
        spoken: to
          ? `Moving ${label} to ${to}. Everyone booked is being notified and the room is rebooked.`
          : `Rescheduling ${label}. I'm finding the next slot that works for everyone booked.`,
        chat: to
          ? `**Moved ${label} to ${to}.** All attendees notified, calendars updated, room rebooked. Two people had a conflict — I offered them the ${from ? "original" : "earlier"} slot instead and both accepted.`
          : `**Rescheduling ${label}.** I checked every attendee's availability and found the next slot that clears for all of them. It's staged on the calendar for your confirmation.`,
        steps: [
          `Checking conflicts for ${label}`,
          to ? `Moving the session to ${to}` : "Finding the next slot that works for everyone",
          "Updating attendee calendars and sending notifications",
          "Rebooking the room and reassigning your coach",
        ],
      };
    },
  },

  /* ─────────── Schedule view ─────────── */
  {
    id: "schedule",
    test: (l) => /\b(schedule|calendar|agenda|sessions|my day|today's|whats? on|line\s*up|attendance|no\s*shows?)\b/.test(l),
    build: () => ({
      canvas: "schedule",
      title: "Your schedule",
      spoken: "Here's your week. Fourteen sessions booked, two gaps you could fill, and one class running under capacity.",
      chat: "**14 sessions this week.** Two open gaps worth filling, and Thursday's 6am group is at 40% capacity — say *\"fill Thursday's class\"* and I'll invite the right clients.",
      steps: [
        "Loading this week's bookings",
        "Checking capacity and no-show risk per session",
        "Flagging 2 fillable gaps",
        "Opening your schedule",
      ],
    }),
  },

  /* ─────────── Inbox ─────────── */
  {
    id: "inbox",
    test: (l) => /\b(inbox|messages?|dms?|texts?|replies|reply|respond|unread|voicemail|emails?)\b/.test(l),
    build: (raw) => {
      const acting = /\b(repl(y|ies)|respond|answer|clear|handle|draft|catch up|deal with)\b/i.test(raw);
      return {
        canvas: "inbox",
        title: acting ? "Clearing the inbox" : "Your inbox",
        spoken: acting
          ? "Drafting replies to all twelve unread messages. Two need your judgement — a refund ask and an injury question — so I've flagged those instead of answering."
          : "Twelve unread messages. Three are new prospects, seven are current members, and two need a real decision from you.",
        chat: acting
          ? "**Drafted replies to 12 unread messages.** 10 are ready to send as-is. I flagged **2 for you** — a refund request from Dana and an injury question from Marcus — those deserve your voice, not mine."
          : "**12 unread.** 3 new prospects asking about pricing, 7 members with quick questions, 2 that need a decision. Say *\"reply to everything\"* and I'll draft the whole lot in your tone.",
        steps: acting
          ? [
              "Reading 12 unread threads and their history",
              "Drafting replies in your tone of voice",
              "Pulling pricing and policy answers from your playbook",
              "Flagging 2 threads that need your judgement",
            ]
          : [
              "Syncing text, email and DMs into one thread list",
              "Sorting by who's waiting longest",
              "Tagging prospects vs members",
              "Opening your inbox",
            ],
      };
    },
  },

  /* ─────────── Automations ─────────── */
  {
    id: "workflows",
    test: (l) => /\b(automat\w*|workflow|sequence|cadence|nurture|drip|on\s*board\w*|onboarding|win\s*back|reactivat\w*)\b/.test(l),
    build: () => ({
      canvas: "workflows",
      title: "Automations",
      spoken: "Opening your automations. Six are running, and your win-back sequence is the one making you money — twenty-two percent reply rate.",
      chat: "**6 automations running.** Your win-back sequence is pulling a **22% reply rate**. The new-lead cadence is your weakest at 4% — say *\"rewrite the new lead sequence\"* and I'll rebuild it.",
      steps: [
        "Loading your 6 live automations",
        "Pulling reply and conversion rates per sequence",
        "Flagging the underperforming new-lead cadence",
        "Opening Workflows",
      ],
    }),
  },

  /* ─────────── Lead capture forms ─────────── */
  {
    id: "forms",
    test: (l) => /\b(forms?|lead\s*(?:form|capture|magnet)|landing\s*page|sign\s*up\s*page|waiver|intake|qr\s*code)\b/.test(l),
    build: () => ({
      canvas: "forms",
      title: "Lead capture",
      spoken: "Here's your lead capture. The front-desk QR form is converting at thirty-one percent, which is your best source right now.",
      chat: "**Lead capture is live in 4 places.** The front-desk QR form converts at **31%** — your best source. Every submission drops straight into the Leads queue with a first touch inside 5 minutes.",
      steps: [
        "Loading your 4 live capture points",
        "Comparing conversion by source",
        "Verifying each one routes into the Leads queue",
        "Opening Forms",
      ],
    }),
  },

  /* ─────────── Classes ─────────── */
  {
    id: "classes",
    test: (l) => /\b(group\s*class(es)?|semi[- ]?private|class\s*list|packed|capacity|fill\s*(the\s*)?class)\b/.test(l),
    build: (l) => ({
      canvas: /\bsemi/i.test(l) ? "semiPrivate" : "groupClass",
      title: "Class management",
      spoken: "Opening your classes. Two are at capacity and one is running light — I can invite the right clients to fill it.",
      chat: "**Class board is open.** Two sessions are full, one is at 40%. I've picked **9 clients** whose training history and usual times fit the light session — say *\"invite them\"* and the invitations go out.",
      steps: [
        "Loading class capacity across the week",
        "Matching under-filled sessions to client availability",
        "Shortlisting 9 clients likely to book",
        "Opening your class board",
      ],
    }),
  },

  /* ─────────── Programming / workouts ─────────── */
  {
    id: "programming",
    test: (l) => /\b(workout|programming|program|training block|periodi\w*|exercise|lifts?|strength\s*block|build\s*(?:a|the)\s*(?:week|block|plan))\b/.test(l),
    build: () => ({
      canvas: "programming",
      title: "Programming",
      spoken: "Building it out. I'm writing the block off your playbook and your members' movement history, so the progressions actually fit the room.",
      chat: "**Programming is open.** I built the block from your playbook and your members' logged history — progressions scale per person, and every substitution respects the injuries on file.",
      steps: [
        "Reading your coaching playbook and movement standards",
        "Pulling logged history across your active members",
        "Writing progressions that scale per athlete",
        "Applying injury-safe substitutions",
      ],
    }),
  },

  /* ─────────── Retention / at-risk ─────────── */
  {
    id: "retention",
    test: (l) => /\b(retention|churn|at\s*risk|cancel\w*\s*members?|drop\s*off|attendance\s*down|quit|slipping|ghosted?)\b/.test(l),
    build: () => ({
      home: "analytics",
      title: "Retention risk",
      spoken: "Seven members are trending toward cancelling. Attendance dropped for all of them in the last three weeks. I can start a win-back today.",
      chat: "**7 members are at risk.** Attendance is down 40%+ over three weeks for each. Say *\"win them back\"* and I'll run a personal check-in from you — not a template — to every one of them.",
      steps: [
        "Scanning attendance trends across 118 active members",
        "Scoring cancellation risk on 3-week movement",
        "Isolating the 7 highest-risk members",
        "Opening your analytics",
      ],
    }),
  },

  /* ─────────── Roster ─────────── */
  {
    id: "clients",
    test: (l) => /\b(clients?|members?|roster|my people|athletes?|who'?s? (?:in|on)|member list)\b/.test(l),
    build: () => ({
      home: "clients",
      title: "Your roster",
      spoken: "Here's your roster. A hundred and eighteen active members, four flagged for a check-in this week.",
      chat: "**118 active members.** 4 are flagged for a check-in this week based on missed sessions and check-in notes. Their profiles are one tap away.",
      steps: ["Loading 118 active members", "Flagging 4 who need a check-in", "Opening your roster"],
    }),
  },

  /* ─────────── Business overview ─────────── */
  {
    id: "analytics",
    test: (l) => /\b(analytics|numbers|how'?s? (?:the\s*)?(?:gym|business|month|week)|kpis?|metrics|report|overview|dashboard)\b/.test(l),
    build: () => ({
      home: "analytics",
      title: "Business overview",
      spoken: "Here's the state of the gym. Revenue up eleven percent, retention holding at ninety-one, and lead response time down to four minutes.",
      chat: "**The gym at a glance.** Revenue **+11%**, retention **91%**, average lead response **4 minutes** (was 6 hours before I was answering). Your bottleneck this month is class capacity, not leads.",
      steps: [
        "Aggregating revenue, retention and lead metrics",
        "Comparing against your trailing 3 months",
        "Identifying this month's bottleneck",
        "Opening analytics",
      ],
    }),
  },

  /* ─────────── Library ─────────── */
  {
    id: "library",
    test: (l) => /\b(library|templates?|exercise\s*library|movement\s*library)\b/.test(l),
    build: () => ({
      canvas: "library",
      title: "Library",
      spoken: "Opening your library.",
      chat: "**Library is open** — your movements, templates and programs in one place.",
      steps: ["Loading your movement and template library", "Opening Library"],
    }),
  },

  /* ─────────── Home ─────────── */
  {
    id: "home",
    test: (l) => /\b(home|command\s*cent(er|re)|start\s*over|main\s*screen|take\s*me\s*back)\b/.test(l),
    build: () => ({
      home: "cards",
      title: "Home",
      spoken: "Back to your command center.",
      chat: "Back at your command center.",
      steps: ["Returning to your command center"],
    }),
  },
];

export function resolveVoiceCommand(raw) {
  const text = (raw || "").trim();
  if (!text) return null;
  const l = text.toLowerCase();
  for (const cmd of COMMANDS) {
    if (cmd.test(l)) {
      const built = cmd.build(text);
      return { id: cmd.id, utterance: text, ...built };
    }
  }
  return null;
}

/* Spoken prompts shown as chips in voice mode — written the way a
   gym owner would actually say them out loud. */
export const VOICE_SUGGESTIONS = [
  "Launch a 6-week shred challenge at $199",
  "Who's in my queue today?",
  "Reply to everything in my inbox",
  "Move Thursday's 6am class to 7am",
  "How's the gym doing this month?",
  "Who's about to cancel?",
];

export const VOICE_FALLBACK = {
  spoken:
    "I can launch an offer, work your lead queue, clear your inbox, move sessions, or show you the numbers. Let me take that one to chat.",
  chat: null,
};
