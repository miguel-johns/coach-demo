import React, { useState, useEffect, useRef } from "react";
import { TEAL, TEAL_LIGHT, WHITE, TEXT, TEXT_SEC, BORDER, ALERT_RED } from "./constants";
import PagesSection from "./PagesCanvas";

const MONO = "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace";
const PAGE_BG = "#fafcfb";
const INK_050 = "#f5f8f7";

const OPENER =
  "Four new leads overnight. Two answered the bonus question and are worth a call today, start with Danielle.";

const BAND = {
  Hot: { bg: "#fbe9e7", color: "#b3261e", dot: "#d9463c" },
  Warm: { bg: "#f6edd9", color: "#a86a1f", dot: "#c9922f" },
  Cool: { bg: "#e7f1f6", color: "#2f6f8f", dot: "#5c7b9a" },
};

const TYPE_PILL = {
  Lead: { bg: "#eef1f0", color: TEXT_SEC, dot: "#9db0ac" },
  Customer: { bg: "#e6f9ec", color: "#1f7a3e", dot: "#3aaf6a" },
  Partner: { bg: TEAL_LIGHT, color: TEAL, dot: TEAL },
  "Past client": { bg: "transparent", color: TEXT_SEC, dot: "#9db0ac" },
};

const AV = ["#e58a5b", "#5c7b9a", "#7c6bb0", "#2B7A78", "#c9922f", "#c96b8f", "#6b7f8a", "#4f8a5b"];

const DOT = { blue: "#5c7b9a", teal: TEAL, green: "#3aaf6a", amber: "#c9922f", red: ALERT_RED };

// Pipeline board. Every contact lands in exactly one stage, keyed off the state
// billing and behaviour already wrote, so the board never needs its own truth.
const PIPE_COLS = [
  { key: "New", dot: "#5c7b9a", note: "Just arrived, first touch already out" },
  { key: "Qualified", dot: TEAL, note: "Replied and in conversation" },
  { key: "Booked", dot: "#c9922f", note: "A call is on the calendar" },
  { key: "Won", dot: "#3aaf6a", note: "Paying customers" },
  { key: "Cold", dot: "#9db0ac", note: "No-showed or gone quiet" },
];

const stageOf = (state) => {
  if (state === "New") return "New";
  if (state === "Booked") return "Booked";
  if (state === "Won") return "Won";
  if (state === "No-showed" || state === "Dormant") return "Cold";
  return "Qualified"; // Engaged, Showed, Reaching out
};

// [name, band, reason, source, action, isNew, state, last]
const LEADS = [
  ["Danielle Reyes", "Hot", "Answered the bonus question in detail, replied within 4 minutes.", "Meta lead ad", "Call", 1, "Engaged", "41 min ago"],
  ["Tyler Boone", "Hot", "Named a wedding date in the bonus answer, replied inside 2 minutes.", "QR, front desk", "Call", 1, "Booked", "2 hours ago"],
  ["Priya Anand", "Hot", "Two replies in six minutes, asked what the 12 week programme costs.", "Meta lead ad", "Send sales page", 1, "Engaged", "3 hours ago"],
  ["Marcus Webb", "Hot", "Booked Thursday 7 am, opened your sales page twice last night.", "Milton form", "Text", 0, "Booked", "Yesterday"],
  ["Alicia Grant", "Warm", "Booked, then no-showed Tuesday. Has not replied since.", "Meta lead ad", "Call", 0, "No-showed", "2 days ago"],
  ["Devon Miles", "Warm", "Opened your sales page twice yesterday, never replied to your text.", "Milton form", "Text", 0, "Reaching out", "Yesterday"],
  ["Renee Castillo", "Warm", "Clicked your booking link, did not pick a time.", "Milton sales page", "Send booking link", 0, "Engaged", "2 days ago"],
  ["Sam Okafor", "Warm", "Replied Monday, three turns, then went quiet.", "Meta lead ad", "Text", 0, "Engaged", "3 days ago"],
  ["Jordan Pike", "Warm", "Answered the bonus question well, has not replied to two touches.", "Meta lead ad", "Call", 0, "Reaching out", "3 days ago"],
  ["Hannah Liu", "Warm", "Showed for a call last week, asked for pricing, then silence.", "Milton form", "Send sales page", 0, "Showed", "5 days ago"],
  ["Bianca Ferrell", "Cool", "Submitted 40 minutes ago, your first touch is already out.", "QR, front desk", "Text", 0, "New", "40 min ago"],
  ["Nate Brennan", "Cool", "Was warm nine days ago, has said nothing since Tuesday.", "Meta lead ad", "Call", 0, "Dormant", "9 days ago"],
  ["Chris Doyle", "Cool", "Form only, no bonus answer, no reply to two touches.", "Meta lead ad", "Text", 0, "Reaching out", "4 days ago"],
  ["Omar Haddad", "Cool", "One word bonus answer, opened nothing you sent.", "Meta lead ad", "Text", 0, "Reaching out", "6 days ago"],
  ["Kelsey Pratt", "Cool", "Scanned the QR at the front desk, nothing beyond her name.", "QR, front desk", "Text", 0, "New", "5 hours ago"],
];

// [name, band, reason, source, state, last, type]
const OFF_LIST = [
  ["Renata Diaz", "Hot", "Paid on 12 August, billing moved her to Won.", "Milton sales page", "Won", "12 August", "Customer"],
  ["Paul Iversen", "Hot", "Paid on 4 August, billing moved him to Won.", "Meta lead ad", "Won", "4 August", "Customer"],
  ["Tasha Bell", "Hot", "Semi private, two mornings a week since March.", "Referral", "Won", "6 days ago", "Customer"],
  ["Ellie Vance", "Warm", "Trained with you until May, asked to be contacted in September.", "Milton form", "Dormant", "31 days ago", "Past client"],
  ["Cormac Shea", "Warm", "Finished the 12 week block in June, no re-signup yet.", "Referral", "Dormant", "26 days ago", "Past client"],
  ["Nadia Osei", "Warm", "Runs the physio clinic upstairs, sends you two or three people a month.", "Introduced by you", "Engaged", "8 days ago", "Partner"],
  ["Jamie Ruiz", "Warm", "Owns the smoothie bar, hosts your QR poster at the counter.", "Introduced by you", "Engaged", "3 weeks ago", "Partner"],
  ["Marissa Kohl", "Cool", "Quiet for three weeks, Milton is still touching her monthly.", "Meta lead ad", "Dormant", "22 days ago", "Lead"],
  ["Dre Whitfield", "Cool", "Answered two of six questions, no reply since.", "QR, front desk", "Dormant", "18 days ago", "Lead"],
  ["Gus Portillo", "Cool", "Wrong number on the form, Milton flagged it.", "Meta lead ad", "Reaching out", "11 days ago", "Lead"],
];

// Which lead sources each Pages entry feeds. Keyed by the stable page id from
// PagesCanvas so renaming a page (which changes its slug) does not break the
// link between a page and the people it brought in.
const PAGE_SOURCES = {
  p1: ["Meta lead ad", "Milton sales page"],
  p2: ["Milton form"],
  p3: ["Milton sales page", "Referral"],
  p4: ["QR, front desk"],
};

const EXTRA_TAGS = {
  "Danielle Reyes": ["Wedding Oct"],
  "Tyler Boone": ["Wedding Oct"],
  "Marcus Webb": ["Quit at wk 8"],
  "Alicia Grant": ["No-showed"],
  "Hannah Liu": ["Price sensitive"],
  "Nate Brennan": ["Was warm"],
  "Kelsey Pratt": ["Walk in"],
  "Tasha Bell": ["Post rehab", "Referred by Nadia"],
  "Cormac Shea": ["Post rehab", "Referred by Nadia"],
  "Ellie Vance": ["Contact in Sept"],
  "Nadia Osei": ["Referrer"],
  "Jamie Ruiz": ["Hosts QR"],
  "Renata Diaz": ["Wk 2 of 12"],
  "Paul Iversen": ["Wk 3 of 12"],
  "Gus Portillo": ["Bad number"],
};

const TAG_SUGGESTIONS = ["Wedding Oct", "Post rehab", "Price sensitive", "Referrer", "Walk in", "No-showed", "Morning only"];

const DRAFTS = {
  engaged: {
    Call: (n) => `Calling ${n} is the right move, they are already replying to you. Want me to text first so the phone gets picked up? "Hey ${n}, it is Ray at Iron Ridge, calling you in two minutes."`,
    Text: (n) => `Drafted for ${n}: "Picking up where we left off. Do you want to talk it through, or would you rather I just send you the whole thing to read?"`,
    "Send sales page": (n) => `Drafted for ${n}: "Here is the whole thing, pricing included, no call needed if you would rather just read it. milton.page/ironridge/summer-reset"`,
    "Send booking link": (n) => `Drafted for ${n}: "You clicked through but did not pick a time. Here are three that are open tomorrow, take whichever."`,
  },
  relationship: {
    Call: (n) => `Calling ${n}. Want me to text first so the number is not cold? "Hey ${n}, it is Ray at Iron Ridge, calling you in two minutes."`,
    Text: (n) => `Drafted for ${n}: "Checking in, nothing urgent. Anything you need from me this week?"`,
    "Send sales page": (n) => `Drafted for ${n}: "Sending you the page in case it is useful to pass on. milton.page/ironridge/summer-reset"`,
    "Send booking link": (n) => `Drafted for ${n}: "Easier to pick a time than to text back and forth. Here are three that are open this week."`,
  },
  quiet: {
    Call: (n) => `You have had no reply from ${n} to two touches, so a call is the only thing left to try. Want me to text first so the number is not cold? "Hey ${n}, it is Ray at Iron Ridge, calling you in two minutes."`,
    Text: (n) => `Drafted for ${n}: "Hey ${n}, it is Ray at Iron Ridge. You started the form but did not get to the last question. One line is enough: what are you actually trying to change?"`,
    "Send sales page": (n) => `Drafted for ${n}: "No pressure and no call. Here is the whole thing, pricing included, read it whenever. milton.page/ironridge/summer-reset"`,
    "Send booking link": (n) => `Drafted for ${n}: "Easier to pick a time than to text back and forth. Here are three that are open tomorrow."`,
  },
};

const RECORDS = {
  "Danielle Reyes": {
    state: "Engaged",
    captured: "Meta lead ad · 19 August, 11:04 pm",
    metaLine: "Meta lead ad, Summer Reset campaign · Captured 19 August, 11:04 pm · 3 touches · Last contact 41 minutes ago",
    answersTitle: "What she told you",
    bonusQ: "Bonus question · Why now, and what have you already tried?",
    bonusA: "My sister’s wedding is 4 October and I am the maid of honour. I did MacroFit for five months in 2024, lost 14 pounds, then stopped when I changed jobs and put it all back on. I do not need motivation, I need someone to tell me exactly what to eat on the days I work doubles.",
    bonusNote: "Specific goal, named timeline, prior programme history. This is a high intent answer.",
    read: "She replied in 4 minutes at 11 pm and raised the doubles problem twice. Call her, do not text again.",
    drafts: {
      Call: 'Calling Danielle is the right move, she asked twice about the days she works doubles. Want me to text first so she picks up? "Hey Danielle, it is Ray at Iron Ridge, calling you in two minutes about the October date."',
      "Send booking link": 'Drafted for Danielle: "You said mornings are better. Here are three open before 9 am this week, take whichever."',
    },
    primaryAction: "Call Danielle",
    altAction: "Send booking link instead",
    sourceNote: "Meta lead ad, Summer Reset campaign. All six answers arrived structured, no field mapping needed.",
    answers: [
      ["What is your main goal?", "Lose 20 pounds and keep it off this time"],
      ["Where are you training now?", "Nowhere since January. I have a gym membership I do not use."],
      ["How many days a week can you train?", "Three, four on a good week"],
      ["Budget you had in mind", "$200 to $300 a month"],
      ["Best number to reach you", "(512) 442 0198"],
    ],
    facts: [["Touches from you", "3"], ["Her replies", "2"], ["Fastest reply", "4 minutes"], ["Last contact", "41 minutes ago"], ["In your queue since", "19 August"]],
    timeline: [
      ["11:04 pm", "Form submitted", "Meta lead ad, Summer Reset campaign. Six answers, all structured.", "blue"],
      ["11:05 pm", "Milton sent the first touch", 'Automatic. "Got your answers Danielle, the October date is tight but doable."', "teal"],
      ["11:09 pm", "She replied", '4 minutes. "Really? I work doubles Thursdays and Fridays, that is where I fall apart."', "green"],
      ["11:14 pm", "Milton drafted, you sent", '"Doubles are the easy part, we pack them. Want to talk tomorrow?"', "teal"],
      ["11:31 pm", "She replied", '"Yes. Morning is better."', "green"],
      ["7:58 am", "Opened your sales page", "Twice, 90 seconds and 4 minutes. Stopped on the pricing block.", "amber"],
    ],
    raw: [
      ["contact_id", "4471f0a2-cc19"], ["full_name", "Danielle Reyes"], ["cf_goal_primary_v2", "lose_20_keep_off"],
      ["cf_train_loc", "nowhere_since_jan"], ["cf_days_avail", "3"], ["cf_budget_band", "200_300"],
      ["cf_bonus_q_long_txt", "My sisters wedding is 4 October and I am the maid of hon..."],
      ["utm_source", "fb"], ["utm_campaign", "sr_2608_lal1"], ["lead_score", "82"],
      ["tags", "fb_lead,summer_reset,untagged"], ["opt_in_sms", "true"],
    ],
  },
  "Marcus Webb": {
    state: "Booked",
    captured: "Milton form · 18 August, 9:35 pm",
    metaLine: "Milton form, Summer Reset page · Captured 18 August, 9:35 pm · 4 touches · Last contact yesterday",
    answersTitle: "What he told you",
    bonusQ: "Bonus question · Why now?",
    bonusA: "Turning 40 in December. I have started three times and quit around week eight every time. I want someone checking on me so quitting is awkward.",
    bonusNote: "Names the exact failure point. Build the call around week eight.",
    read: "He booked at 11:20 pm after reading the page twice. Do not sell, just show him what week eight looks like.",
    drafts: {
      Text: 'Drafted for Marcus: "You said week eight is where it usually falls apart. That is exactly what the Tuesday check in is for. Still good for 7 am Thursday?"',
      "Send sales page": 'Drafted for Marcus: "Sending the page again so you have it Thursday morning. milton.page/ironridge/summer-reset"',
    },
    primaryAction: "Text Marcus",
    altAction: "Send the page again",
    sourceNote: "Milton form on the Summer Reset page. Structured on the way in, nothing to map.",
    hasBrief: true,
    briefTeaser: "He booked Thursday 7:00 am. The brief is ready.",
    answers: [
      ["Main goal", "Get under 200 pounds and stay there"],
      ["Training now", "Peloton twice a week, nothing heavy since 2023"],
      ["Days a week", "Four, early mornings only"],
      ["Budget", "Whatever it costs if it actually works"],
    ],
    facts: [["Touches from you", "4"], ["His replies", "3"], ["Fastest reply", "6 minutes"], ["Sales page opens", "2"], ["Call booked", "Thursday 7:00 am"]],
    timeline: [
      ["9:35 pm", "Form submitted", "Milton form on the Summer Reset page. Six answers.", "blue"],
      ["9:41 pm", "Milton sent the first touch", 'Automatic. "Week eight is where most people quit, that is a coaching problem not a you problem."', "teal"],
      ["9:47 pm", "He replied", '6 minutes. "That is a bold claim. What do you actually do differently at week eight?"', "green"],
      ["10:52 pm", "Milton drafted, you sent", '"I change the programme before you get bored, not after. Want to see how it looks?"', "teal"],
      ["11:02 pm", "He replied", '"Send it."', "green"],
      ["11:06 pm", "Opened your sales page", "Twice, 3 minutes then 6 minutes.", "amber"],
      ["11:20 pm", "Booked a call", "Thursday 7:00 am, 30 minutes, Zoom. Brief sent to you.", "green"],
    ],
    raw: [
      ["contact_id", "9d02be71-4a55"], ["full_name", "Marcus Webb"], ["cf_goal_primary_v2", "under_200_maintain"],
      ["cf_train_loc", "home_peloton"], ["cf_days_avail", "4"], ["cf_budget_band", "unspecified"],
      ["cf_bonus_q_long_txt", "Turning 40 in December. I have started three times and q..."],
      ["utm_source", "milton_page"], ["utm_campaign", "sr_direct"], ["lead_score", "91"],
      ["tags", "form_lead,summer_reset,booked"], ["opt_in_sms", "true"], ["appt_ts", "1756368000"],
    ],
    brief: {
      notif: "Marcus booked you for Thursday 7:00 am. Here is what he said.",
      slot: "Thursday 7:00 am, 30 minutes, Zoom",
      open: "He has done this before and quit at the eight week mark, three times. Lead with how you handle week eight, not with the price.",
      why: "Replied in 6 minutes, four turns back and forth, opened your sales page twice last night, then booked at 11:20 pm.",
      exchange: [
        ["m", "Marcus, saw your answers. Week eight is where most people quit, that is a coaching problem not a you problem.", "Milton, automatic, 9:41 pm"],
        ["u", "That is a bold claim. What do you actually do differently at week eight?", "Marcus, 6 minutes later"],
        ["m", "I check in every Tuesday and I change the programme before you get bored, not after. Want to see how it looks?", "You, drafted by Milton"],
        ["u", "Send it.", "Marcus, 11:02 pm"],
        ["u", "Booked Thursday 7 am.", "Marcus, 11:20 pm"],
      ],
    },
  },
};

const NON_LEAD = {
  "Renata Diaz": {
    answersTitle: "What she is on",
    metaLine: "Customer since 12 August · Milton sales page · Billing wrote Won automatically",
    answers: [
      ["Programme", "12 week transformation, week 2 of 12"],
      ["Billing", "$249 a month, three payments, next on 12 September"],
      ["Training", "Tuesdays and Thursdays, 6 am"],
      ["Started as", "Meta lead ad, 28 July. Sixteen days from form to paid."],
    ],
    facts: [["Customer since", "12 August"], ["Week of programme", "2 of 12"], ["Payments made", "1 of 3"], ["Last contact", "6 days ago"]],
    timeline: [
      ["28 July", "Form submitted", "Milton sales page, Summer Reset. Bonus answer named a September holiday.", "blue"],
      ["28 July", "Milton sent the first touch", "Automatic, inside a minute.", "teal"],
      ["3 August", "Showed for the call", "Transcript in her notes. Asked about the payment split.", "green"],
      ["12 August", "Paid", "Billing wrote Won. She left the queue that morning.", "green"],
      ["18 August", "Week 1 check in", "Sent by you, she replied the same day.", "teal"],
    ],
    read: "She is two weeks in and paying on schedule. Nothing needs you today, week four is the next real checkpoint.",
    primaryAction: "Text Renata",
    altAction: "Send her the renewal page",
    sourceNote: "Started as a Meta lead ad in July, converted through the Summer Reset page. Billing owns her state now, not behaviour.",
  },
  "Paul Iversen": {
    answersTitle: "What he is on",
    metaLine: "Customer since 4 August · Meta lead ad · Billing wrote Won automatically",
    answers: [
      ["Programme", "12 week transformation, week 3 of 12"],
      ["Billing", "$249 a month, three payments, next on 4 September"],
      ["Training", "Mondays and Fridays, 5:30 am"],
      ["Started as", "Meta lead ad, 21 July. Fourteen days from form to paid."],
    ],
    facts: [["Customer since", "4 August"], ["Week of programme", "3 of 12"], ["Payments made", "1 of 3"], ["Last contact", "4 August"]],
    timeline: [
      ["21 July", "Form submitted", "Meta lead ad, Summer Reset campaign.", "blue"],
      ["21 July", "Milton sent the first touch", "Automatic, inside a minute.", "teal"],
      ["30 July", "Showed for the call", "Transcript in his notes.", "green"],
      ["4 August", "Paid", "Billing wrote Won.", "green"],
    ],
    read: "Three weeks in and you have not spoken since he paid. That is the gap where people go quiet, send him something.",
    primaryAction: "Text Paul",
    altAction: "Send him the renewal page",
    sourceNote: "Meta lead ad, Summer Reset campaign. Converted 4 August, billing owns his state now.",
  },
  "Tasha Bell": {
    answersTitle: "What she is on",
    metaLine: "Customer since March · Referred by Nadia Osei · Semi private",
    answers: [
      ["Programme", "Semi private, two mornings a week"],
      ["Billing", "$149 a month, rolling, next on 1 September"],
      ["Training", "Wednesdays and Saturdays, 7 am"],
      ["Came from", "Nadia Osei at the physio clinic, March"],
    ],
    facts: [["Customer since", "March"], ["Months running", "5"], ["Sessions this month", "7"], ["Last contact", "6 days ago"]],
    timeline: [
      ["March", "Introduced by Nadia Osei", "Physio referral, post rehab. No lead form.", "teal"],
      ["March", "Paid", "Billing wrote Won on the first payment.", "green"],
      ["June", "Re-assessment", "Notes in her record.", "blue"],
      ["18 August", "Last session", "Attended, no follow up needed.", "green"],
    ],
    read: "Five months and no re-assessment since June. Book one, she is the referral Nadia will ask about.",
    primaryAction: "Text Tasha",
    altAction: "Send her a booking link",
    sourceNote: "Referred by Nadia Osei, no lead form and no ad spend behind her.",
  },
  "Ellie Vance": {
    answersTitle: "What she finished",
    metaLine: "Past client · Trained January to May · Asked to be contacted in September",
    answers: [
      ["What she did", "12 week transformation, finished in May"],
      ["Result on file", "Down 11 pounds over the block"],
      ["Why she stopped", "Work travel through the summer, her words"],
      ["What she asked for", "A message in September"],
    ],
    facts: [["Trained", "Jan to May"], ["Blocks completed", "1"], ["Last contact", "31 days ago"], ["Asked for", "September"]],
    timeline: [
      ["January", "Started the 12 week block", "Paid monthly, no gaps.", "green"],
      ["May", "Finished the block", "Down 11 pounds. No re-signup.", "blue"],
      ["24 July", "She messaged you", '"Travelling until September, message me then."', "green"],
    ],
    read: "She asked for September and it is nearly September. I will draft it on the first, or you can send it now.",
    primaryAction: "Text Ellie",
    altAction: "Send her the September page",
    sourceNote: "Came in through a Milton form in January. She is not a lead, she is someone who already worked with you.",
  },
  "Cormac Shea": {
    answersTitle: "What he finished",
    metaLine: "Past client · Finished the 12 week block in June · No re-signup yet",
    answers: [
      ["What he did", "12 week transformation, finished in June"],
      ["Result on file", "Deadlift 285 to 340, down 8 pounds"],
      ["Why he stopped", "Block ended, never asked about the next one"],
      ["Referred by", "Nadia Osei"],
    ],
    facts: [["Trained", "Mar to Jun"], ["Blocks completed", "1"], ["Last contact", "26 days ago"], ["Re-signed", "No"]],
    timeline: [
      ["March", "Introduced by Nadia Osei", "Physio referral. No lead form.", "teal"],
      ["June", "Finished the block", "Deadlift 285 to 340. No conversation about a second block.", "blue"],
      ["29 July", "You messaged him", "No reply.", "teal"],
    ],
    read: "He put 55 pounds on his deadlift and then nobody asked him to stay. Lead with the number, not with an offer.",
    primaryAction: "Text Cormac",
    altAction: "Send him the next block",
    sourceNote: "Referred by Nadia Osei in March. No ad spend, no lead form.",
  },
  "Nadia Osei": {
    answersTitle: "The referral relationship",
    metaLine: "Partner · Physio clinic upstairs · Sends two or three people a month",
    answers: [
      ["Who she is", "Runs the physio clinic on the second floor"],
      ["What she sends", "Post rehab clients cleared to train, two or three a month"],
      ["People sent", "14 since March, 6 became customers"],
      ["Last introduction", "Tasha Bell in March, then two in July"],
    ],
    facts: [["Partner since", "March"], ["People sent", "14"], ["Became customers", "6"], ["Last contact", "8 days ago"]],
    timeline: [
      ["March", "Partnership started", "You agreed to take her cleared clients.", "teal"],
      ["March", "First introduction", "Tasha Bell, now five months in.", "green"],
      ["July", "Two more introductions", "One booked, one still in the queue.", "green"],
      ["16 August", "She messaged you", "Asked how Tasha and Cormac are doing.", "green"],
    ],
    read: "She asked about Tasha and Cormac eight days ago and has not heard back. Six of her fourteen paid, tell her that.",
    primaryAction: "Text Nadia",
    altAction: "Send her the page to share",
    sourceNote: "Not a lead and never scored. She is the reason six people are customers, which is more than any single ad.",
  },
  "Jamie Ruiz": {
    answersTitle: "The referral relationship",
    metaLine: "Partner · Smoothie bar next door · Hosts your QR poster at the counter",
    answers: [
      ["Who he is", "Owns the smoothie bar next door"],
      ["What he does", "Keeps your QR poster on the counter"],
      ["Scans from his counter", "9 this month, 2 answered the bonus question"],
      ["What he asked for", "A new poster, the current one is faded"],
    ],
    facts: [["Partner since", "May"], ["Scans this month", "9"], ["Scans all time", "38"], ["Last contact", "3 weeks ago"]],
    timeline: [
      ["May", "Poster went up", "QR generated per page, scans land with the source attached.", "teal"],
      ["July", "He asked for a new poster", "The current one is faded. Not sent yet.", "amber"],
      ["August", "9 scans from his counter", "Two answered the bonus question, both in your queue now.", "green"],
    ],
    read: "He asked for a fresh poster in July and never got one. Nine scans came off the faded one anyway.",
    primaryAction: "Text Jamie",
    altAction: "Send him a fresh QR poster",
    sourceNote: "QR code on his counter. Every scan carries his location as its source.",
  },
};

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

const BandPill = ({ band }) => {
  const b = BAND[band];
  if (!b) return <span style={{ fontSize: 12, color: TEXT_SEC }}>—</span>;
  return <Pill bg={b.bg} color={b.color} dot={b.dot}>{band}</Pill>;
};

const TypePill = ({ type }) => {
  const t = TYPE_PILL[type] || TYPE_PILL.Lead;
  return <Pill bg={t.bg} color={t.color} dot={t.dot} outline={type === "Past client"}>{type}</Pill>;
};

const Avatar = ({ initials, bg, size = 30 }) => (
  <span style={{
    width: size, height: size, borderRadius: 999, background: bg, color: "#fff",
    display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    fontSize: size > 40 ? 16 : 11, fontWeight: 700, letterSpacing: "0.02em",
  }}>{initials}</span>
);

const Card = ({ children, style }) => (
  <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 18, ...style }}>{children}</div>
);

const MiltonMark = ({ size = 20 }) => (
  <span style={{
    width: size, height: size, borderRadius: 7, background: TEAL, flexShrink: 0,
    display: "inline-flex", alignItems: "center", justifyContent: "center",
  }}>
    <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round">
      <path d="M12 3v3M12 18v3M4.2 7.5l2.6 1.5M17.2 15l2.6 1.5M4.2 16.5l2.6-1.5M17.2 9l2.6-1.5" />
      <circle cx="12" cy="12" r="3.2" />
    </svg>
  </span>
);

const Btn = ({ kind = "secondary", block, sm, onClick, children, onDark }) => {
  const base = {
    borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: sm ? 12.5 : 13.5,
    padding: sm ? "7px 12px" : "10px 16px", width: block ? "100%" : undefined,
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, whiteSpace: "nowrap",
  };
  const skins = {
    primary: { background: TEAL, color: "#fff", border: `1px solid ${TEAL}` },
    secondary: onDark
      ? { background: "rgba(255,255,255,0.14)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)" }
      : { background: WHITE, color: TEXT, border: `1px solid ${BORDER}` },
  };
  return <button onClick={onClick} style={{ ...base, ...skins[kind] }}>{children}</button>;
};

const AddTagBtn = ({ active, onClick }) => (
  <button onClick={onClick} aria-label="Add a tag" title="Add a tag" style={{
    width: 20, height: 20, borderRadius: 999, padding: 0, cursor: "pointer",
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    border: `1px dashed ${active ? TEAL : "#c2d1cd"}`,
    background: active ? TEAL_LIGHT : "transparent", color: active ? TEAL : TEXT_SEC,
  }}>
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
  </button>
);

const BackLink = ({ onClick, children }) => (
  <button onClick={onClick} style={{
    background: "none", border: "none", padding: 0, cursor: "pointer", color: TEAL,
    fontSize: 13, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6,
  }}>
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></svg>
    {children}
  </button>
);

const QA = ({ q, a }) => (
  <div>
    <div style={{ fontSize: 12, color: TEXT_SEC, marginBottom: 3 }}>{q}</div>
    <div style={{ fontSize: 13.5, color: TEXT, fontWeight: 600, lineHeight: 1.5 }}>{a}</div>
  </div>
);

const initialsOf = (name) => name.split(" ").map((w) => w[0]).join("");

// ── Main ────────────────────────────────────────────────────────
export default function CrmCanvas({ onClose, isMobile }) {
  const [screen, setScreen] = useState("queue");
  const [who, setWho] = useState("Danielle Reyes");
  const [from, setFrom] = useState("queue");
  const [filter, setFilter] = useState("Everyone");
  const [draft, setDraft] = useState(null);
  const [sent, setSent] = useState(false);
  const [tagFor, setTagFor] = useState(null);
  const [added, setAdded] = useState({});
  const [pageFilter, setPageFilter] = useState(null);
  // Pipeline board edits: stage overrides, removed cards, and manually added cards.
  const [pipeMoves, setPipeMoves] = useState({});
  const [pipeRemoved, setPipeRemoved] = useState({});
  const [pipeExtra, setPipeExtra] = useState([]);
  const [dragCard, setDragCard] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);
  const [dragPos, setDragPos] = useState(null);
  const [addingCol, setAddingCol] = useState(null);
  const [addName, setAddName] = useState("");
  const dragMoved = useRef(false);
  const [vw, setVw] = useState(() => (typeof window === "undefined" ? 1280 : window.innerWidth));

  useEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const bg = 47;
  const allRows = LEADS.map((r) => [r[0], r[1], r[2], r[3], r[6], r[7], "Lead"]).concat(OFF_LIST);

  const tagsFor = (name, rowType) => [rowType].concat(EXTRA_TAGS[name] || []).concat(added[name] || []).filter(Boolean);
  const suggestionsFor = (name) => {
    const have = tagsFor(name, "");
    return TAG_SUGGESTIONS.filter((t) => have.indexOf(t) < 0).slice(0, 4);
  };
  const applyTag = (name, tag) => {
    setAdded((prev) => ({ ...prev, [name]: (prev[name] || []).concat([tag]) }));
    setTagFor(null);
  };
  const toggleTag = (name) => (e) => {
    if (e) e.stopPropagation();
    setTagFor((cur) => (cur === name ? null : name));
    setDraft(null);
    setSent(false);
  };
  const go = (s) => () => { setScreen(s); setDraft(null); setSent(false); };
  // The tabs are a fresh start, so they drop any page filter. Back links keep
  // using go(), so returning from a contact preserves the filtered list.
  const goTab = (s) => () => { setPageFilter(null); setScreen(s); setDraft(null); setSent(false); };
  const openContactsForPage = (page) => {
    setPageFilter({ id: page.id, name: page.name, sources: PAGE_SOURCES[page.id] || [] });
    setFilter("Everyone");
    setScreen("list");
    setDraft(null);
    setSent(false);
  };
  const openContact = (name, origin) => (e) => {
    if (e) e.stopPropagation();
    setWho(name); setFrom(origin); setScreen("contact"); setDraft(null); setSent(false);
  };
  // ── Pipeline board mutations ──
  const moveCard = (name, stage) => {
    setPipeMoves((prev) => ({ ...prev, [name]: stage }));
    setDragCard(null);
    setDragOverCol(null);
  };
  const removeCard = (name) => (e) => {
    if (e) e.stopPropagation();
    setPipeRemoved((prev) => ({ ...prev, [name]: true }));
  };
  const addCard = (stage) => {
    const name = addName.trim();
    if (!name) return;
    setPipeExtra((prev) => (prev.some((c) => c.name === name) ? prev : prev.concat([{ name }])));
    setPipeMoves((prev) => ({ ...prev, [name]: stage }));
    setPipeRemoved((prev) => { const next = { ...prev }; delete next[name]; return next; });
    setAddName("");
    setAddingCol(null);
  };
  // Add an existing contact (pull from the directory) into a stage.
  const addExisting = (name, stage) => {
    setPipeRemoved((prev) => { const next = { ...prev }; delete next[name]; return next; });
    setPipeMoves((prev) => ({ ...prev, [name]: stage }));
    setAddName("");
    setAddingCol(null);
  };
  // Pointer-based drag so cards move reliably inside the preview iframe (HTML5
  // native drag is flaky there). A floating ghost follows the pointer and the
  // column under it highlights; on release the card drops into that stage.
  const startPipeDrag = (name, e) => {
    if (e.button != null && e.button !== 0) return;
    dragMoved.current = false;
    const startX = e.clientX, startY = e.clientY;
    let active = false;
    const colUnder = (x, y) => {
      const el = document.elementFromPoint(x, y);
      const colEl = el && el.closest ? el.closest("[data-pipe-col]") : null;
      return colEl ? colEl.getAttribute("data-pipe-col") : null;
    };
    const move = (ev) => {
      if (!active) {
        if (Math.abs(ev.clientX - startX) + Math.abs(ev.clientY - startY) < 6) return;
        active = true;
        dragMoved.current = true;
        setDragCard(name);
      }
      setDragPos({ x: ev.clientX, y: ev.clientY });
      setDragOverCol(colUnder(ev.clientX, ev.clientY));
    };
    const up = (ev) => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      if (active) {
        const target = colUnder(ev.clientX, ev.clientY);
        if (target) moveCard(name, target);
      }
      setDragCard(null);
      setDragOverCol(null);
      setDragPos(null);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };
  const compose = (name, action) => (e) => {
    if (e) e.stopPropagation();
    setDraft({ full: name, name: name.split(" ")[0], action });
    setSent(false);
  };

  // ── Record assembly ──
  const buildRecord = (name) => {
    const row =
      LEADS.map((r) => r.concat(["Lead"]))
        .concat(OFF_LIST.map((r) => [r[0], r[1], r[2], r[3], "Text", 0, r[4], r[5], r[6]]))
        .find((r) => r[0] === name) || LEADS[0].concat(["Lead"]);
    const base = RECORDS[name];
    const reason = row[2], source = row[3], state = row[6], last = row[7], type = row[8];
    const isLead = type === "Lead";
    const band = isLead ? row[1] : type;
    const idx = LEADS.findIndex((r) => r[0] === name);
    const av = AV[(idx < 0 ? 6 : idx) % AV.length];
    const initials = initialsOf(name);

    const nl = !isLead
      ? { state, captured: source, bonusA: null, noBonus: null, raw: [], ...(NON_LEAD[name] || {
          answersTitle: "The relationship",
          metaLine: `${type} · ${source} · Last contact ${last}`,
          answers: [["What they are to you", type], ["How they came in", source], ["Last contact", last]],
          facts: [["Type", type], ["Last contact", last]],
          timeline: [["—", "No lead form", "They never came in through a form, so there is nothing to score.", "teal"]],
          read: "Not a lead and not scored. Nothing here is waiting on you.",
          primaryAction: `Text ${name.split(" ")[0]}`,
          altAction: "Send them the page",
          sourceNote: `${source}. No lead form and no band, this record is a relationship not a queue entry.`,
        }) }
      : null;

    const r = nl || base || {
      state,
      captured: `${source} · captured this month`,
      metaLine: `${source} · ${state} · Last contact ${last}`,
      answersTitle: "What they told you",
      bonusQ: "Bonus question · Why now, and what have you already tried?",
      bonusA: null,
      noBonus: "Bonus question left blank. That absence is most of the reason this record sits low.",
      read: `Nothing new from them. Milton is still touching them on the ${state.toLowerCase()} cadence, you do not need to do anything.`,
      primaryAction: `Text ${name.split(" ")[0]}`,
      altAction: "Send the page again",
      sourceNote: `${source}. Answers arrived structured, no field mapping needed.`,
      answers: [
        ["What is your main goal?", "Lose weight"],
        ["Where are you training now?", "Not currently training"],
        ["How many days a week can you train?", "2"],
        ["Best number to reach you", "On file"],
      ],
      facts: [["Touches from you", "2"], ["Their replies", "0"], ["Last contact", last], ["State", state]],
      timeline: [
        ["Day 1", "Form submitted", `${source}. Four of six answers, bonus question skipped.`, "blue"],
        ["Day 1", "Milton sent the first touch", "Automatic, inside a minute.", "teal"],
        ["Day 2", "Milton sent the second touch", "No reply to either.", "teal"],
      ],
      raw: [
        ["contact_id", `0000-${initials.toLowerCase()}`], ["full_name", name], ["cf_goal_primary_v2", "lose_weight"],
        ["cf_train_loc", "none"], ["cf_days_avail", "2"], ["cf_budget_band", "null"],
        ["cf_bonus_q_long_txt", ""], ["utm_source", "fb"], ["lead_score", "31"], ["tags", "untagged"],
      ],
    };

    const primaryAct = /Call/.test(r.primaryAction) ? "Call" : "Text";
    return {
      name, band, reason, source, initials, last, type, isLead, av,
      state: isLead ? r.state || state : null,
      showState: isLead,
      tags: tagsFor(name, type),
      metaLine: r.metaLine,
      captured: r.captured,
      answersTitle: r.answersTitle,
      hasBonus: !!r.bonusA, bonusQ: r.bonusQ, bonusA: r.bonusA, bonusNote: r.bonusNote || null,
      noBonus: r.bonusA ? null : r.noBonus,
      read: r.read, sourceNote: r.sourceNote,
      primaryAction: r.primaryAction, altAction: r.altAction,
      primaryAct,
      altAct: /booking/.test(r.altAction) ? "Send booking link" : "Send sales page",
      answers: r.answers, facts: r.facts, timeline: r.timeline, raw: r.raw || [],
      hasBrief: !!r.hasBrief, briefTeaser: r.briefTeaser, brief: r.brief || null,
      backToRecord: `Back to ${name.split(" ")[0]}’s record`,
      answersHeadline: `${name.split(" ")[0]}’s submission, twice`,
    };
  };

  const c = buildRecord(who);

  // ── Milton bubbles ──
  // Only speaks when there is something to act on. The standing commentary lives
  // in the queue card and the dashboard's own chat rail.
  const bubbles = () => {
    const out = [];
    if (draft) {
      out.push({ from: "u", text: `${draft.action} ${draft.name}`, meta: null });
      if (sent) {
        out.push({ from: "m", text: `Sent to ${draft.name}. I will tell you the moment they reply.`, meta: "Just now" });
      } else {
        const rec = RECORDS[draft.full];
        const own = rec && rec.drafts && rec.drafts[draft.action];
        const row = LEADS.concat(OFF_LIST).find((r) => r[0] === draft.full);
        const hasReplied = !!rec || (row && row[1] !== "Cool");
        const nonLead = row && row.length === 7 && row[6] !== "Lead";
        const set = nonLead ? DRAFTS.relationship : hasReplied ? DRAFTS.engaged : DRAFTS.quiet;
        out.push({ from: "m", text: own || set[draft.action](draft.name), meta: null, isDraft: true });
      }
    } else if (tagFor) {
      out.push({ from: "m", text: `Tagging ${tagFor.split(" ")[0]}. Pick one below or type your own, tags are yours and never change the ranking.`, meta: null });
    }
    return out;
  };

  const filtered =
    pageFilter ? allRows.filter((r) => pageFilter.sources.indexOf(r[3]) >= 0)
    : filter === "Everyone" ? allRows
    : filter === "Quiet" ? allRows.filter((r) => r[4] === "Dormant" || r[4] === "Reaching out")
    : allRows.filter((r) => r[4] === filter);

  const TABS = [["queue", "Queue"], ["pipeline", "Pipeline"], ["list", "Contact list"], ["pages", "Hooks"]];
  const tabActive = (k) =>
    screen === k || (["contact", "answers", "brief"].includes(screen) && from === k);

  // Source and last-contact are the first to go when the canvas gets narrow —
  // name, tags, band and state are what the coach actually scans.
  const wide = !isMobile && vw >= 1180;
  const gridCols = wide
    ? "30px minmax(140px,1.5fr) minmax(150px,1.4fr) 72px 96px minmax(96px,1fr) 84px"
    : "30px minmax(120px,1.5fr) minmax(130px,1.3fr) 72px 96px";

  // ── Screens ──
  const Queue = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Card style={{ display: "flex", gap: 12, alignItems: "flex-start", background: WHITE }}>
        <MiltonMark size={26} />
        <div>
          <Eyebrow color={TEAL}>Milton, 6:42 am</Eyebrow>
          <div style={{ fontSize: 15, color: TEXT, lineHeight: 1.55, marginTop: 6, fontWeight: 600 }}>{OPENER}</div>
        </div>
      </Card>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 7, height: 7, borderRadius: 999, background: BAND.Hot.dot }} />
          <span style={{ fontSize: 12.5, fontWeight: 700, color: TEXT }}>3 new since yesterday</span>
        </div>
        <span style={{ fontSize: 12, color: TEXT_SEC }}>Tuesday 20 August</span>
      </div>

      <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: "hidden" }}>
        {LEADS.map((l, i) => {
          const [name, band, reason, source, action, isNew] = l;
          return (
            <div key={name} onClick={openContact(name, "queue")}
              style={{
                display: "flex", alignItems: isMobile ? "flex-start" : "center", gap: 12,
                padding: isMobile ? "13px 14px" : "13px 18px", cursor: "pointer",
                borderTop: i === 0 ? "none" : `1px solid ${BORDER}`,
                flexDirection: isMobile ? "column" : "row",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = INK_050)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flex: 1, minWidth: 0 }}>
                <Avatar initials={initialsOf(name)} bg={AV[i % AV.length]} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>{name}</span>
                    <BandPill band={band} />
                    <span style={{ fontSize: 11.5, color: TEXT_SEC }}>{source}</span>
                    {isNew ? <Pill bg={TEAL_LIGHT} color={TEAL}>New</Pill> : null}
                  </div>
                  <div style={{ fontSize: 13, color: TEXT_SEC, marginTop: 3, lineHeight: 1.45 }}>{reason}</div>
                </div>
              </div>
              <Btn sm kind={band === "Hot" ? "primary" : "secondary"} onClick={compose(name, action)}>{action}</Btn>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: TEXT_SEC }}>
          <MiltonMark size={18} />
          {`Milton is working ${bg} others in the background.`}
        </div>
        <span style={{ fontSize: 12, color: TEXT_SEC }}>Nothing here needs sorting.</span>
      </div>
    </div>
  );

  const Pipeline = () => {
    const stageFor = (r) => pipeMoves[r[0]] || stageOf(r[4]);
    const rowsAll = allRows
      .concat(pipeExtra.map((c) => [c.name, "Warm", "Added by you. Open to fill in the details.", "Manual", "New", "Just now", "Lead"]))
      .filter((r) => !pipeRemoved[r[0]]);
    const cols = PIPE_COLS.map((col) => ({
      ...col,
      rows: rowsAll.filter((r) => stageFor(r) === col.key),
    }));
    // Full contact directory for the add-card autocomplete (existing names + manual adds).
    const directory = allRows.map((r) => r[0])
      .concat(pipeExtra.map((c) => c.name))
      .filter((n, i, arr) => arr.indexOf(n) === i);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: TEXT, letterSpacing: "-0.01em" }}>Pipeline</h3>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: TEXT_SEC, lineHeight: 1.5, maxWidth: 620 }}>
              Drag a card to move someone between stages, use the plus to add a card, or the ✕ to take one off the board.
            </p>
          </div>
          <span style={{ fontSize: 12, color: TEXT_SEC, fontFamily: MONO, whiteSpace: "nowrap" }}>
            {rowsAll.length} in play
          </span>
        </div>

        <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 4, alignItems: "flex-start" }}>
          {cols.map((col) => (
            <div key={col.key} data-pipe-col={col.key}
              style={{ flex: "1 0 0", minWidth: isMobile ? 224 : 186, display: "flex", flexDirection: "column", gap: 10,
                borderRadius: 14, padding: dragOverCol === col.key ? 6 : 0, margin: dragOverCol === col.key ? -6 : 0,
                background: dragOverCol === col.key ? TEAL_LIGHT : "transparent", outline: dragOverCol === col.key ? `1px dashed ${TEAL}` : "none", transition: "background 0.12s" }}
            >
              <div style={{ background: INK_050, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "10px 12px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 999, background: col.dot, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>{col.key}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: TEXT_SEC, fontFamily: MONO }}>{col.rows.length}</span>
                    <button onClick={() => { setAddingCol((c) => (c === col.key ? null : col.key)); setAddName(""); }}
                      aria-label={`Add a card to ${col.key}`} title={`Add a card to ${col.key}`}
                      style={{ width: 22, height: 22, borderRadius: 7, border: `1px solid ${BORDER}`, background: WHITE, color: TEAL, fontSize: 15, lineHeight: 1, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
                      {addingCol === col.key ? "\u00d7" : "+"}
                    </button>
                  </div>
                </div>
                <div style={{ fontSize: 11.5, color: TEXT_SEC, marginTop: 4, lineHeight: 1.4 }}>{col.note}</div>
              </div>

              {addingCol === col.key && (() => {
                const onBoard = new Set(rowsAll.map((r) => r[0]));
                const q = addName.trim().toLowerCase();
                const matches = directory
                  .filter((n) => (q ? n.toLowerCase().includes(q) : true))
                  .slice(0, 6);
                const exact = directory.some((n) => n.toLowerCase() === q);
                return (
                  <div style={{ background: WHITE, border: `1px solid ${TEAL}`, borderRadius: 12, padding: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                    <input autoFocus value={addName} onChange={(e) => setAddName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.nativeEvent.isComposing && e.keyCode !== 229) {
                          if (exact) addExisting(directory.find((n) => n.toLowerCase() === q), col.key);
                          else addCard(col.key);
                        }
                        if (e.key === "Escape") { setAddingCol(null); setAddName(""); }
                      }}
                      placeholder="Search contacts or type a new name"
                      style={{ width: "100%", boxSizing: "border-box", padding: "7px 9px", borderRadius: 8, border: `1px solid ${BORDER}`, fontSize: 13, color: TEXT, outline: "none" }}
                    />
                    {matches.length > 0 && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 2, maxHeight: 168, overflowY: "auto" }}>
                        {matches.map((n) => {
                          const di = allRows.findIndex((r) => r[0] === n);
                          return (
                            <button key={n} onClick={() => addExisting(n, col.key)}
                              style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left", padding: "6px 7px", borderRadius: 8, border: "none", background: "transparent", cursor: "pointer" }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = INK_050)}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                            >
                              <Avatar initials={initialsOf(n)} bg={AV[(di < 0 ? 6 : di) % AV.length]} size={22} />
                              <span style={{ fontSize: 12.5, fontWeight: 700, color: TEXT, flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{n}</span>
                              {onBoard.has(n) && <span style={{ fontSize: 10.5, color: TEXT_SEC, whiteSpace: "nowrap" }}>{`in ${stageFor(allRows.find((r) => r[0] === n) || [n])}`}</span>}
                            </button>
                          );
                        })}
                      </div>
                    )}
                    {addName.trim() && !exact && (
                      <button onClick={() => addCard(col.key)}
                        style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 8px", borderRadius: 8, border: `1px dashed ${TEAL}`, background: TEAL_LIGHT, color: TEAL, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                        {`+ Add new contact "${addName.trim()}"`}
                      </button>
                    )}
                    <button onClick={() => { setAddingCol(null); setAddName(""); }}
                      style={{ padding: "6px 10px", borderRadius: 8, border: `1px solid ${BORDER}`, background: WHITE, color: TEXT_SEC, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                      Cancel
                    </button>
                  </div>
                );
              })()}

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {col.rows.map((r) => {
                  const [name, band, reason, source, state, last, type] = r;
                  const idx = LEADS.findIndex((l) => l[0] === name);
                  const av = AV[(idx < 0 ? 6 : idx) % AV.length];
                  return (
                    <div key={name}
                      onClick={(e) => { if (dragMoved.current) { dragMoved.current = false; return; } openContact(name, "pipeline")(e); }}
                      onPointerDown={(e) => startPipeDrag(name, e)}
                      style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 12, paddingRight: 30, cursor: "grab", position: "relative", opacity: dragCard === name ? 0.4 : 1, touchAction: "none", userSelect: "none" }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#bfe0dc")}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = BORDER)}
                    >
                      <button onClick={removeCard(name)} onPointerDown={(e) => e.stopPropagation()} aria-label={`Remove ${name} from the board`} title="Remove from board"
                        style={{ position: "absolute", top: 8, right: 8, width: 20, height: 20, borderRadius: 6, border: "none", background: "transparent", color: TEXT_SEC, fontSize: 14, lineHeight: 1, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = INK_050; e.currentTarget.style.color = ALERT_RED; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = TEXT_SEC; }}
                      >
                        {"\u00d7"}
                      </button>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                        <Avatar initials={initialsOf(name)} bg={av} size={26} />
                        <span style={{ fontSize: 13.5, fontWeight: 700, color: TEXT, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</span>
                      </div>
                      <div style={{ fontSize: 12, color: TEXT_SEC, marginTop: 8, lineHeight: 1.45, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{reason}</div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 10 }}>
                        {type === "Lead" ? <BandPill band={band} /> : <TypePill type={type} />}
                        <span style={{ fontSize: 11, color: TEXT_SEC, whiteSpace: "nowrap" }}>{last}</span>
                      </div>
                    </div>
                  );
                })}
                {col.rows.length === 0 && (
                  <div style={{ fontSize: 12, color: TEXT_SEC, textAlign: "center", padding: "16px 8px", border: `1px dashed ${BORDER}`, borderRadius: 12 }}>
                    No one here
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        {dragCard && dragPos && (
          <div style={{ position: "fixed", left: dragPos.x + 10, top: dragPos.y + 10, zIndex: 1000, pointerEvents: "none",
            background: WHITE, border: `1px solid ${TEAL}`, borderRadius: 10, padding: "8px 12px",
            boxShadow: "0 10px 28px rgba(0,0,0,0.18)", fontSize: 13, fontWeight: 700, color: TEXT, maxWidth: 200,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {dragCard}
          </div>
        )}
      </div>
    );
  };

  const TagCell = ({ name, rowType }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
      {tagsFor(name, rowType).map((t) =>
        TYPE_PILL[t] ? <TypePill key={t} type={t} /> : <Pill key={t} bg="transparent" color={TEXT_SEC} outline>{t}</Pill>
      )}
      <AddTagBtn active={tagFor === name} onClick={toggleTag(name)} />
      {tagFor === name && suggestionsFor(name).map((s) => (
        <button key={s} onClick={(e) => { e.stopPropagation(); applyTag(name, s); }}
          style={{ padding: "3px 8px", borderRadius: 999, border: `1px solid ${BORDER}`, background: WHITE, color: TEAL, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
          + {s}
        </button>
      ))}
    </div>
  );

  const List = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: TEXT, letterSpacing: "-0.01em" }}>Contact list</h3>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: TEXT_SEC, lineHeight: 1.5, maxWidth: 620 }}>
            Everyone you have. Tags are yours to add and never feed the ranking, bands and states only apply to leads.
          </p>
        </div>
        <span style={{ fontSize: 12, color: TEXT_SEC, fontFamily: MONO, whiteSpace: "nowrap" }}>
          {pageFilter ? `${filtered.length} shown` : `${allRows.length + 41} contacts`}
        </span>
      </div>

      {pageFilter ? (
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", padding: "12px 14px", background: TEAL_LIGHT, border: `1px solid #bfe0dc`, borderRadius: 12 }}>
          <MiltonMark size={20} />
          <div style={{ flex: 1, minWidth: 200, fontSize: 13.5, color: TEXT, lineHeight: 1.45 }}>
            The people who came in through <strong>{pageFilter.name}</strong>.
            {filtered.length === 0 && " No one from this page is in your contacts yet."}
          </div>
          <Btn sm onClick={() => setPageFilter(null)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            Clear, show everyone
          </Btn>
        </div>
      ) : null}

      <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: "hidden" }}>
        {!isMobile && (
          <div style={{ display: "grid", gridTemplateColumns: gridCols, gap: 12, padding: "10px 18px", background: INK_050 }}>
            <span />
            <Eyebrow>Name</Eyebrow><Eyebrow>Tags</Eyebrow><Eyebrow>Band</Eyebrow>
            <Eyebrow>State</Eyebrow>
            {wide && <><Eyebrow>Source</Eyebrow><Eyebrow>Last contact</Eyebrow></>}
          </div>
        )}
        {filtered.map(([name, band, reason, source, rowState, last, rowType], n) => {
          const isLead = rowType === "Lead";
          const i = LEADS.findIndex((r) => r[0] === name);
          const av = AV[(i < 0 ? name.length + 3 : i) % AV.length];
          const tagging = tagFor === name;
          if (isMobile) {
            return (
              <div key={name} onClick={openContact(name, "list")}
                style={{ padding: "13px 14px", borderTop: n === 0 ? "none" : `1px solid ${BORDER}`, cursor: "pointer", background: tagging ? TEAL_LIGHT : "transparent" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <Avatar initials={initialsOf(name)} bg={av} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>{name}</span>
                      {isLead ? <BandPill band={band} /> : <span style={{ fontSize: 12, color: TEXT_SEC }}>—</span>}
                      <span style={{ fontSize: 11.5, color: TEXT_SEC }}>{isLead ? rowState : source}</span>
                    </div>
                    <div style={{ fontSize: 12.5, color: TEXT_SEC, marginTop: 3, lineHeight: 1.45 }}>{reason}</div>
                    <div style={{ marginTop: 7 }}><TagCell name={name} rowType={rowType} /></div>
                  </div>
                </div>
              </div>
            );
          }
          return (
            <div key={name} onClick={openContact(name, "list")}
              style={{
                display: "grid", gridTemplateColumns: gridCols, gap: 12, alignItems: "center",
                padding: "11px 18px", borderTop: `1px solid ${BORDER}`, cursor: "pointer",
                background: tagging ? TEAL_LIGHT : "transparent",
              }}>
              <Avatar initials={initialsOf(name)} bg={av} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
                <div style={{ fontSize: 12, color: TEXT_SEC, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{reason}</div>
              </div>
              <TagCell name={name} rowType={rowType} />
              {isLead ? <BandPill band={band} /> : <span style={{ fontSize: 12, color: TEXT_SEC }}>—</span>}
              <span style={{ fontSize: 12.5, color: TEXT }}>{isLead ? rowState : "—"}</span>
              {wide && (
                <>
                  <span style={{ fontSize: 12, color: TEXT_SEC, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{source}</span>
                  <span style={{ fontSize: 12, color: TEXT_SEC, fontFamily: MONO, whiteSpace: "nowrap" }}>{last}</span>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: TEXT_SEC }}>
        <MiltonMark size={18} />
        Every one of these is on a cadence. Milton only puts someone in the queue when there is a reason to act.
      </div>
    </div>
  );

  const Contact = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <BackLink onClick={go(from === "list" ? "list" : "queue")}>
        {from === "list" ? "Back to the contact list" : "Back to the queue"}
      </BackLink>

      {c.hasBrief && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: TEAL_LIGHT, border: `1px solid #bfe0dc`, borderRadius: 12, flexWrap: "wrap" }}>
          <MiltonMark size={20} />
          <div style={{ flex: 1, minWidth: 180, fontSize: 13.5, color: TEXT, fontWeight: 600 }}>{c.briefTeaser}</div>
          <Btn sm kind="primary" onClick={go("brief")}>Read the brief</Btn>
        </div>
      )}

      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        <Avatar initials={c.initials} bg={c.av} size={52} />
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <h3 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: TEXT, letterSpacing: "-0.02em" }}>{c.name}</h3>
            {c.isLead ? <BandPill band={c.band} /> : <TypePill type={c.type} />}
            {c.showState && <Pill bg="#eef1f0" color={TEXT_SEC}>{c.state}</Pill>}
          </div>
          <div style={{ fontSize: 12.5, color: TEXT_SEC, marginTop: 6, lineHeight: 1.5 }}>{c.metaLine}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 10, flexWrap: "wrap" }}>
            <Eyebrow>Tags</Eyebrow>
            <TagCell name={c.name} rowType={c.type} />
          </div>
        </div>
        <Btn kind="primary" onClick={compose(c.name, c.primaryAct)}>{c.primaryAction}</Btn>
      </div>

      <div style={{ borderLeft: `3px solid ${TEAL}`, paddingLeft: 14, fontSize: 14.5, color: TEXT, lineHeight: 1.55, fontStyle: "italic" }}>
        {c.reason}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "minmax(0,1.6fr) minmax(0,1fr)", gap: 16, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Card>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
              <Eyebrow>{c.answersTitle}</Eyebrow>
              {c.isLead && (
                <button onClick={go("answers")} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: TEAL, fontSize: 12.5, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 5 }}>
                  See the full submission
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                </button>
              )}
            </div>
            {c.hasBonus && (
              <div style={{ background: INK_050, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
                <div style={{ fontSize: 12, color: TEXT_SEC, marginBottom: 6 }}>{c.bonusQ}</div>
                <div style={{ fontSize: 14, color: TEXT, lineHeight: 1.6 }}>{c.bonusA}</div>
                {c.bonusNote && (
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginTop: 12, paddingTop: 12, borderTop: `1px solid ${BORDER}` }}>
                    <MiltonMark size={18} />
                    <span style={{ fontSize: 12.5, color: TEAL, fontWeight: 600, lineHeight: 1.5 }}>{c.bonusNote}</span>
                  </div>
                )}
              </div>
            )}
            {c.noBonus && (
              <div style={{ fontSize: 13, color: TEXT_SEC, lineHeight: 1.55, marginBottom: 14, fontStyle: "italic" }}>{c.noBonus}</div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>
              {c.answers.map(([q, a]) => <QA key={q} q={q} a={a} />)}
            </div>
          </Card>

          <Card>
            <Eyebrow>Everything that has happened</Eyebrow>
            <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 0 }}>
              {c.timeline.map(([when, title, text, col], i) => (
                <div key={`${when}-${title}`} style={{ display: "grid", gridTemplateColumns: "72px 14px 1fr", gap: 10 }}>
                  <div style={{ fontSize: 11.5, color: TEXT_SEC, fontFamily: MONO, paddingTop: 3 }}>{when}</div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <span style={{ width: 9, height: 9, borderRadius: 999, background: DOT[col], marginTop: 5, flex: "0 0 9px" }} />
                    {i < c.timeline.length - 1 && <span style={{ width: 1, flex: 1, background: BORDER, marginTop: 3 }} />}
                  </div>
                  <div style={{ paddingBottom: i < c.timeline.length - 1 ? 16 : 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: TEXT }}>{title}</div>
                    <div style={{ fontSize: 12.5, color: TEXT_SEC, marginTop: 3, lineHeight: 1.5 }}>{text}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: "#14403d", borderRadius: 14, padding: 18, color: "#fff" }}>
            <Eyebrow color="#8fd0c9">Milton&apos;s read</Eyebrow>
            <div style={{ fontSize: 14, lineHeight: 1.6, marginTop: 10, marginBottom: 16 }}>{c.read}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Btn kind="primary" block onClick={compose(c.name, c.primaryAct)}>{c.primaryAction}</Btn>
              <Btn kind="secondary" onDark block onClick={compose(c.name, c.altAct)}>{c.altAction}</Btn>
            </div>
          </div>

          <Card>
            <Eyebrow>The plain numbers</Eyebrow>
            <div style={{ marginTop: 12 }}>
              {c.facts.map(([k, v], i) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "8px 0", borderTop: i === 0 ? "none" : `1px solid ${BORDER}` }}>
                  <span style={{ fontSize: 12.5, color: TEXT_SEC }}>{k}</span>
                  <span style={{ fontSize: 12.5, color: TEXT, fontWeight: 700, fontFamily: MONO }}>{v}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <Eyebrow>Where they came from</Eyebrow>
            <div style={{ fontSize: 12.5, color: TEXT_SEC, lineHeight: 1.6, marginTop: 10 }}>{c.sourceNote}</div>
          </Card>
        </div>
      </div>
    </div>
  );

  const Answers = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <BackLink onClick={go("contact")}>{c.backToRecord}</BackLink>
      <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: TEXT, letterSpacing: "-0.02em" }}>{c.answersHeadline}</h3>
      <p style={{ margin: 0, fontSize: 13, color: TEXT_SEC, lineHeight: 1.55, maxWidth: 640 }}>
        One submission. On the left, what a typical lead tool gives the coach today. On the right, what Milton gives them.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16, alignItems: "start" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <Pill bg="#eef1f0" color={TEXT_SEC}>Before</Pill>
            <span style={{ fontSize: 12, color: TEXT_SEC }}>Today, custom fields tab</span>
          </div>
          <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden" }}>
            {c.raw.map(([k, v], i) => (
              <div key={k} style={{ display: "grid", gridTemplateColumns: "minmax(0,150px) minmax(0,1fr)", gap: 10, padding: "8px 12px", borderTop: i === 0 ? "none" : `1px solid ${BORDER}` }}>
                <span style={{ fontSize: 11.5, color: TEXT_SEC, fontFamily: MONO, overflow: "hidden", textOverflow: "ellipsis" }}>{k}</span>
                <span style={{ fontSize: 11.5, color: TEXT, fontFamily: MONO, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginTop: 10, fontSize: 12.5, color: TEXT_SEC, lineHeight: 1.5 }}>
            <span style={{ width: 7, height: 7, borderRadius: 999, background: ALERT_RED, marginTop: 6, flexShrink: 0 }} />
            The one answer that predicts the sale is truncated mid sentence and labelled with a field key.
          </div>
        </div>

        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <Pill bg="#e6f9ec" color="#1f7a3e" dot="#3aaf6a">After</Pill>
            <span style={{ fontSize: 12, color: TEXT_SEC }}>Milton, contact record</span>
          </div>
          <Card>
            <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 14, borderBottom: `1px solid ${BORDER}` }}>
              <Avatar initials={c.initials} bg={c.av} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: TEXT }}>{c.name}</div>
                <div style={{ fontSize: 11.5, color: TEXT_SEC, marginTop: 2 }}>{c.captured}</div>
              </div>
              {c.isLead ? <BandPill band={c.band} /> : <TypePill type={c.type} />}
            </div>
            {c.hasBonus && (
              <div style={{ background: INK_050, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 14, margin: "14px 0" }}>
                <div style={{ fontSize: 12, color: TEXT_SEC, marginBottom: 6 }}>{c.bonusQ}</div>
                <div style={{ fontSize: 13.5, color: TEXT, lineHeight: 1.6 }}>{c.bonusA}</div>
                {c.bonusNote && (
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginTop: 12, paddingTop: 12, borderTop: `1px solid ${BORDER}` }}>
                    <MiltonMark size={18} />
                    <span style={{ fontSize: 12.5, color: TEAL, fontWeight: 600, lineHeight: 1.5 }}>{c.bonusNote}</span>
                  </div>
                )}
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 14 }}>
              {c.answers.map(([q, a]) => <QA key={q} q={q} a={a} />)}
            </div>
          </Card>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginTop: 10, fontSize: 12.5, color: TEXT_SEC, lineHeight: 1.5 }}>
            <span style={{ width: 7, height: 7, borderRadius: 999, background: "#3aaf6a", marginTop: 6, flexShrink: 0 }} />
            Question in muted type, answer in full weight, nothing truncated, no expand toggle.
          </div>
        </div>
      </div>
    </div>
  );

  const Brief = () => {
    const b = c.brief || { notif: "", slot: "", open: "", why: "", exchange: [] };
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <BackLink onClick={go("contact")}>{c.backToRecord}</BackLink>

        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 12, flexWrap: "wrap" }}>
          <MiltonMark size={20} />
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ fontSize: 13.5, color: TEXT, fontWeight: 600 }}>{b.notif}</div>
            <div style={{ fontSize: 11.5, color: TEXT_SEC, marginTop: 3 }}>Notification · 4 minutes ago</div>
          </div>
          <Btn sm>Dismiss</Btn>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <Avatar initials={c.initials} bg={c.av} size={52} />
          <div>
            <h3 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: TEXT, letterSpacing: "-0.02em" }}>{c.name}</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6, flexWrap: "wrap" }}>
              {c.isLead ? <BandPill band={c.band} /> : <TypePill type={c.type} />}
              <span style={{ fontSize: 12.5, color: TEXT_SEC }}>{b.slot}</span>
            </div>
          </div>
        </div>

        <div style={{ background: "#14403d", borderRadius: 14, padding: 18, color: "#fff" }}>
          <Eyebrow color="#8fd0c9">Open the call with this</Eyebrow>
          <div style={{ fontSize: 15, lineHeight: 1.6, marginTop: 10 }}>{b.open}</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16, alignItems: "start" }}>
          <Card>
            <Eyebrow>Why they are on your calendar</Eyebrow>
            <div style={{ fontSize: 13, color: TEXT_SEC, lineHeight: 1.6, marginTop: 10 }}>{b.why}</div>
            {c.hasBonus && (
              <div style={{ background: INK_050, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 14, margin: "14px 0" }}>
                <div style={{ fontSize: 12, color: TEXT_SEC, marginBottom: 6 }}>{c.bonusQ}</div>
                <div style={{ fontSize: 13.5, color: TEXT, lineHeight: 1.6 }}>{c.bonusA}</div>
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {c.answers.map(([q, a]) => <QA key={q} q={q} a={a} />)}
            </div>
          </Card>

          <Card>
            <Eyebrow>What they said to you</Eyebrow>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 14 }}>
              {b.exchange.map(([f, text, meta], i) => {
                const mine = f === "m";
                return (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: mine ? "flex-start" : "flex-end" }}>
                    <div style={{
                      maxWidth: "92%", fontSize: 13, lineHeight: 1.55, padding: "10px 13px", borderRadius: 14,
                      background: mine ? INK_050 : TEAL, color: mine ? TEXT : "#fff",
                      border: mine ? `1px solid ${BORDER}` : "1px solid transparent",
                    }}>{text}</div>
                    <div style={{ fontSize: 11, color: TEXT_SEC, marginTop: 4, textAlign: mine ? "left" : "right" }}>{meta}</div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    );
  };

  const msgs = bubbles();

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: PAGE_BG }}>
      {/* Header */}
      <div style={{ padding: isMobile ? "14px 16px" : "16px 32px", background: WHITE, borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", minWidth: 0 }}>
            <h1 style={{ fontSize: isMobile ? 22 : 26, fontWeight: 700, color: TEXT, margin: 0, letterSpacing: "-0.02em" }}>CRM</h1>
            <Pill bg={TEAL_LIGHT} color={TEAL} dot={TEAL}>{`Working ${bg} leads quietly`}</Pill>

            {/* Segmented toggle, matching the schedule canvas's Admin/Trainer control */}
            <div style={{ display: "inline-flex", gap: 3, background: INK_050, padding: 3, borderRadius: 999, border: `1px solid ${BORDER}` }}>
              {TABS.map(([k, label]) => {
                const active = tabActive(k);
                return (
                  <button key={k} onClick={goTab(k)}
                    style={{ border: 0, cursor: "pointer", fontFamily: "inherit", fontSize: 12.5, fontWeight: 600, padding: "6px 14px", borderRadius: 999, background: active ? WHITE : "transparent", color: active ? TEAL : TEXT_SEC, boxShadow: active ? "0 1px 2px rgba(16,40,34,0.08)" : "none" }}>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${BORDER}`, background: WHITE, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: TEXT_SEC, flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? 16 : "24px 32px" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>
          {screen === "queue" && <Queue />}
          {screen === "pipeline" && <Pipeline />}
          {screen === "list" && <List />}
          {screen === "contact" && <Contact />}
          {screen === "answers" && <Answers />}
          {screen === "brief" && <Brief />}
          {screen === "pages" && <PagesSection isMobile={isMobile} onOpenContacts={openContactsForPage} />}
        </div>
      </div>

      {/* Milton strip — only when there is a draft to approve or a tag to pick */}
      {msgs.length > 0 && (
      <div style={{ borderTop: `1px solid ${BORDER}`, background: WHITE, padding: isMobile ? "12px 16px" : "14px 32px" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto", display: "flex", flexDirection: "column", gap: 8 }}>
          {msgs.map((b, i) => {
            const mine = b.from === "u";
            return (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: mine ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "88%", fontSize: 13, lineHeight: 1.55, padding: "9px 13px", borderRadius: 14,
                  background: mine ? TEAL : INK_050, color: mine ? "#fff" : TEXT,
                  border: mine ? "1px solid transparent" : `1px solid ${BORDER}`,
                }}>
                  {b.text}
                  {b.isDraft && (
                    <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                      <Btn sm kind="primary" onClick={() => setSent(true)}>Send it</Btn>
                      <Btn sm onClick={() => setDraft(null)}>Discard</Btn>
                    </div>
                  )}
                </div>
                {b.meta && <div style={{ fontSize: 11, color: TEXT_SEC, marginTop: 4 }}>{b.meta}</div>}
              </div>
            );
          })}
          {tagFor && (
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap", paddingTop: 2 }}>
              {suggestionsFor(tagFor).map((t) => (
                <button key={t} onClick={() => applyTag(tagFor, t)}
                  style={{ padding: "5px 11px", borderRadius: 999, border: `1px solid ${BORDER}`, background: WHITE, color: TEAL, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                  + {t}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
}
