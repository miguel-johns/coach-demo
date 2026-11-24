/* One example gym for the whole prototype. Every name and number is made up.
   Today is fixed at Fri, Nov 20, 2026 so every screen agrees. */
var DB = (function(){
  var GYM = {name:"Northline Strength", num:"(316) 555-0100", phone:"(316) 555-0101", site:"northlinestrength.com", tz:"Central Time"};
  var TODAY = "2026-11-20";
  var TEAM = [
    {id:"mj", name:"Miguel Johns", role:"Admin", you:true, email:"miguel@northlinestrength.com"},
    {id:"rc", name:"Riley Chen", role:"Manager", email:"riley@northlinestrength.com"},
    {id:"tl", name:"Tori Lane", role:"Coach", email:"tori@northlinestrength.com"},
    {id:"al", name:"Andre Lewis", role:"Coach", email:"andre@northlinestrength.com"},
    {id:"rn", name:"Renee Castillo", role:"Coach", email:"renee@northlinestrength.com"}
  ];
  var CATALOG = [
    {name:"Semi-Private 2x per week", kind:"Membership", service:"Semi-private", price:"$449.00 a month", amt:449, open:8, dates:true},
    {name:"Nutrition Coaching", kind:"Subscription", service:"Nutrition", price:"$39.99 a month", amt:39.99, unlimited:true, dates:true},
    {name:"Recovery Room 4-pack", kind:"Pack", service:"Recovery room", price:"$140.00", amt:140, size:4, open:4}
  ];

  var people = [
    {id:"dana", name:"Dana Whitfield", added:"2025-12-12", source:"Referral", tags:["Semi-private","Recovery"],
      since:"Dec 15, 2025", coach:"Tori Lane",
      phone:"(316) 555-0142", email:"dana.whitfield@example.com", replies:"Text", owner:"Riley Chen",
      details:[["Birthday","March 8"],["Emergency contact","Chris Whitfield, (316) 555-0177"],["Came in through","Referred by a member"],["Added","Dec 12, 2025"]],
      household:{name:"Whitfield household", members:[{id:"dana",n:"Dana Whitfield",kind:"Adult",pays:true},{id:"chris",n:"Chris Whitfield",kind:"Adult"},{id:"maya",n:"Maya Whitfield",kind:"Youth"}]},
      plans:[
        {id:"sp", name:"Semi-Private 2x per week", kind:"Membership", service:"Semi-private", price:"$449.00 a month", amt:449, start:"2026-11-01", next:"2026-12-01", open:1, booked:2, used:5, dates:true},
        {id:"rr", name:"Recovery Room 4-pack", kind:"Pack", service:"Recovery room", price:"$140.00", amt:140, size:4, when:"Bought Nov 2, expires Feb 2, 2027", open:0, booked:1, used:3},
        {id:"nu", name:"Nutrition Coaching", kind:"Subscription", service:"Nutrition", price:"$39.99 a month", amt:39.99, start:"2026-10-05", next:"2026-12-05", unlimited:true, dates:true}
      ],
      past:[["Recovery Room 4-pack","Sep 14 to Nov 1","Used up"],["Semi-Private Founding Month","Oct 1 to Oct 31","Ended"],["Intro Week Pass","Dec 15 to Dec 22, 2025","Expired"]],
      appts:[
        {id:"a1", today:true, day:"Today", time:"6:30 PM", title:"Recovery Room, 50 min", where:"Room B", plan:"rr", status:"booked"},
        {id:"a2", day:"Mon, Nov 23", time:"5:30 AM", title:"Semi-private training", where:"with Coach Tori", plan:"sp", status:"booked"},
        {id:"a3", day:"Wed, Nov 25", time:"5:30 AM", title:"Semi-private training", where:"with Coach Tori", plan:"sp", status:"booked"}
      ],
      visits:[["Wed, Nov 18","5:30 AM","Semi-private training","Checked out"],["Mon, Nov 16","5:30 AM","Semi-private training","Checked out"],["Fri, Nov 13","5:30 AM","Semi-private training","Late cancel, credit used"],["Wed, Nov 11","12:10 PM","Recovery Room, 50 min","Checked out"],["Mon, Nov 9","5:30 AM","Semi-private training","Checked out"]],
      card:"Visa ending 4417",
      links:[{id:"l1", text:"Youth Camp Day Pass, $25.00", meta:"Payment link sent Nov 19. Not paid yet. Expires Nov 22."}],
      tx:[["Nov 5","Nutrition Coaching","Visa ending 4417","$39.99"],["Nov 2","Recovery Room 4-pack","Visa ending 4417","$140.00"],["Nov 1","Semi-Private 2x per week","Visa ending 4417","$449.00"],["Oct 24","Protein bar","Cash","$3.00"],["Oct 5","Nutrition Coaching","Visa ending 4417","$39.99"],["Oct 1","Semi-Private Founding Month","Visa ending 4417","$399.00"],["Sep 14","Recovery Room 4-pack","Visa ending 4417","$140.00"]],
      docs:[{name:"Liability waiver", status:"signed", when:"Signed Dec 15, 2025"},{name:"Recovery room agreement", status:"signed", when:"Signed Sep 14"}],
      coaching:"Strength Base, phase 2. Week 3 of 6.",
      thread:[
        {k:"note", day:"Mon, Nov 9", t:"6:40 AM", by:"Tori Lane", body:"Prefers the 5:30 AM group. Books recovery on training days."},
        {k:"auto", day:"Tue, Nov 17", t:"5:30 PM", ch:"Text", src:"Workflow", name:"Session reminder", body:"See you tomorrow at 5:30 AM for Semi-private training."},
        {k:"call", day:"Thu, Nov 19", t:"2:05 PM", title:"Call with Riley Chen, 2 min", body:"Asked about a day pass for Maya's camp day. Riley sent a payment link."},
        {k:"out", day:"Thu, Nov 19", t:"2:09 PM", ch:"Text", by:"Riley Chen", body:"Here is the link for Maya's camp day pass. It is good through Sunday."},
        {k:"event", day:"Thu, Nov 19", t:"2:09 PM", body:"Payment link sent: Youth Camp Day Pass, $25.00"},
        {k:"in", day:"Today", t:"9:12 AM", ch:"Text", body:"Is camp still on for Saturday? I will pay the link tonight."}
      ],
      read:["Dana has a session today and 1 semi-private credit left to book.","Her Recovery Room 4-pack is on its last credit.","She wrote at 9:12 AM about camp. Nobody has replied."]
    },
    {id:"chris", name:"Chris Whitfield", added:"2026-01-09", source:"Added by Dana", tags:["Whitfield household"], since:"Jan 9", coach:"Andre Lewis",
      phone:"(316) 555-0177", email:"chris.whitfield@example.com", replies:"Text",
      household:{ref:"dana"},
      plans:[{id:"og", name:"Open Gym Unlimited", kind:"Membership", service:"Open gym", price:"$79.00 a month", amt:79, start:"2026-01-09", next:"2026-12-09", unlimited:true, dates:true}],
      visits:[["Tue, Nov 17","6:10 PM","Open gym","Checked out"]], card:"Visa ending 4417",
      tx:[["Nov 9","Open Gym Unlimited","Visa ending 4417","$79.00"]],
      docs:[{name:"Liability waiver", status:"signed", when:"Signed Jan 9"}],
      read:["Chris is in the Whitfield household. Dana pays.","He last checked in Tue, Nov 17 for open gym."]},
    {id:"maya", name:"Maya Whitfield", added:"2026-06-01", source:"Added by Dana", tags:["Whitfield household","Youth"], since:"Jun 1",
      phone:"", email:"", household:{ref:"dana"},
      appts:[{id:"y1", day:"Sat, Nov 21", time:"9:00 AM", title:"Youth Camp Day", where:"Main floor", due:25, status:"booked"}],
      tx:[["Jun 1","Youth Summer Camp Week","Visa ending 4417","$120.00"]],
      docs:[{name:"Liability waiver", status:"signed", when:"Signed by Dana Whitfield, Jun 1"}],
      read:["Maya is a youth member of the Whitfield household.","Her camp day on Sat, Nov 21 is not paid yet. Dana has an open payment link."]},
    {id:"marcus", name:"Marcus Hale", added:"2026-11-12", source:"Front desk", tags:["Massage"], since:"Nov 12", manual:"Customer", stage:"Came in",
      phone:"(316) 555-0119", email:"marcus.hale@example.com", replies:"Calls",
      details:[["Birthday",null],["Emergency contact",null],["Came in through","Added at the front desk"],["Added","Nov 12"]],
      past:[["Day Pass","Nov 12","Used up"]],
      appts:[{id:"m1", day:"Tue, Nov 24", time:"2:00 PM", title:"Massage, 60 min", where:"with Renee", due:95, status:"booked"}],
      visits:[["Thu, Nov 12","4:15 PM","Open gym, Day Pass","Checked out"]],
      tx:[["Nov 12","Day Pass","Cash","$15.00"]],
      docs:[{name:"Liability waiver", status:"signed", when:"Signed Nov 12"},{name:"Massage intake form", status:"missing", when:"Needed before Tuesday"}],
      thread:[
        {k:"event", day:"Thu, Nov 12", t:"4:10 PM", body:"Added at the front desk by Riley Chen"},
        {k:"auto", day:"Mon, Nov 16", t:"11:02 AM", ch:"Text", src:"Workflow", name:"Booking confirmation", body:"You are booked for Massage on Tue, Nov 24 at 2:00 PM."},
        {k:"call", dir:"missed", day:"Wed, Nov 18", t:"3:41 PM", title:"Missed call, voicemail 0:22", body:"Asked whether he needs to bring anything to the massage."}
      ],
      read:["Marcus has a massage on Tue, Nov 24 with nothing covering it. $95.00 is due.","He left a voicemail on Wed, Nov 18 that nobody has returned."]},
    {id:"priya", name:"Priya Raman", added:"2026-11-19", source:"Free intro class form", stage:"In conversation",
      phone:"(316) 555-0164", email:"priya.raman@example.com", replies:"No replies yet", owner:"Milton, appointment setter",
      details:[["Birthday",null],["Emergency contact",null],["Came in through","Website form, Free intro class"],["Added","Nov 19"]],
      form:{name:"Free intro class form", when:"Thu, Nov 19 · 3:58 PM", qa:[["What is your main goal?","Get stronger and have more energy by spring."],["Have you worked with a coach before?","Once, a few years ago."],["Which days work best?","Weekday mornings."]]},
      lastTouch:"Milton messaged Thu, Nov 19 · 4:12 PM. No reply yet.", milton:true,
      thread:[
        {k:"event", day:"Thu, Nov 19", t:"3:58 PM", body:"Came in through the Free intro class form"},
        {k:"milton", day:"Thu, Nov 19", t:"4:12 PM", ch:"Text", body:"Hi Priya, thanks for asking about the free intro class. We have Saturday at 9:00 AM or Monday at 6:00 AM. Which works better?"}
      ],
      read:["Priya came in yesterday through the Free intro class form.","I offered her Saturday 9:00 AM or Monday 6:00 AM. No reply yet. I follow up today.","She may be the same person as Priya R. Raman from the imported list."]},
    {id:"priya2", name:"Priya R. Raman", added:"2026-11-03", source:"Imported list", phone:"(316) 555-0191", email:"priya.raman@example.com", stage:"New"},
    {id:"billy", name:"Billy Tran", added:"2026-11-20", source:"Front desk", since:"Nov 20", stage:"Joined",
      phone:"(316) 555-0173", email:"billy.tran@example.com", replies:"No replies yet", owner:"Riley Chen",
      details:[["Birthday",null],["Emergency contact",null],["Came in through","Added at the front desk"],["Added","Today"]],
      plans:[{id:"sp", name:"Semi-Private 2x per week", kind:"Membership", service:"Semi-private", price:"$449.00 a month", amt:449, start:"2026-11-20", next:"2026-12-04", first:true, open:7, booked:1, used:0, dates:true}],
      appts:[{id:"b1", day:"Mon, Nov 23", time:"5:30 AM", title:"Semi-private training", where:"with Coach Tori", plan:"sp", status:"booked"}],
      card:"Visa ending 2204",
      docs:[{name:"Liability waiver", status:"signed", when:"Signed Nov 20"}],
      thread:[{k:"event", day:"Today", t:"10:15 AM", body:"Riley Chen started Semi-Private 2x per week. First charge set for Dec 4."}],
      read:["Billy started Semi-Private 2x per week today. His first charge is Dec 4 for $449.00.","He has a session on Mon, Nov 23. Sessions can be used before the first charge."]},
    {id:"anon", name:"(316) 555-0188", unnamed:true, added:"2026-11-20", source:"Dialed from Milton", tags:["Unsaved number"], stage:"In conversation",
      phone:"(316) 555-0188", email:"", replies:"Calls", owner:"Miguel Johns",
      details:[["Birthday",null],["Emergency contact",null],["Came in through","Dialed from Milton"],["Added","Today"]],
      lastTouch:"You called today at 8:51 AM.",
      thread:[{k:"call", day:"Today", t:"8:51 AM", title:"Call from this computer, 1 min", body:"Asked about kids classes. Wants a call back after 3:00 PM."}],
      read:["This number was saved from a call you placed at 8:51 AM. It has no name yet.","They asked about kids classes and want a call back after 3:00 PM."]},
    {id:"jordan", name:"Jordan Ellis", added:"2026-11-20", source:"Free intro class form", stage:"New",
      phone:"(316) 555-0156", email:"jordan.ellis@example.com", lastTouch:"Nobody has reached out yet.",
      form:{name:"Free intro class form", when:"Today · 7:44 AM", qa:[["What is your main goal?","Lose 15 pounds before a wedding in May."],["Have you worked with a coach before?","No."],["Which days work best?","Evenings after 5:30."]]},
      thread:[{k:"event", day:"Today", t:"7:44 AM", body:"Came in through the Free intro class form"}],
      read:["Jordan filled in the Free intro class form at 7:44 AM today.","Nobody has reached out yet."]},
    {id:"sam", name:"Sam Okafor", added:"2026-11-19", source:"Free intro class form", tags:["Intro booked"], stage:"Booked",
      phone:"(316) 555-0175", email:"sam.okafor@example.com", owner:"Milton, appointment setter", miltonBooked:true,
      appts:[{id:"s1", day:"Sat, Nov 21", time:"9:00 AM", title:"Free intro class", where:"with Coach Andre", free:true, status:"booked"}],
      thread:[
        {k:"event", day:"Thu, Nov 19", t:"10:02 AM", body:"Came in through the Free intro class form"},
        {k:"milton", day:"Thu, Nov 19", t:"10:03 AM", ch:"Text", body:"Hi Sam, thanks for asking about the free intro class. We have Saturday at 9:00 AM or Monday at 6:00 AM. Which works better?"},
        {k:"in", day:"Thu, Nov 19", t:"10:20 AM", ch:"Text", body:"Saturday works."},
        {k:"milton", day:"Thu, Nov 19", t:"10:21 AM", ch:"Text", body:"You are booked for Saturday, Nov 21 at 9:00 AM with Coach Andre. I sent the waiver to sign before you come in."},
        {k:"event", day:"Thu, Nov 19", t:"10:21 AM", body:"Booked by Milton: Free intro class, Sat, Nov 21 at 9:00 AM. Liability waiver sent."}
      ],
      docs:[{name:"Liability waiver", status:"sent", when:"Sent Nov 19"}],
      read:["I booked Sam into the free intro class on Sat, Nov 21 at 9:00 AM.","His waiver is sent and not signed yet."]},
    {id:"sam2", name:"Samuel Okafor", added:"2026-11-14", source:"Imported list", phone:"", email:"sam.okafor@example.com", stage:"New"},
    {id:"leah", name:"Leah Ortiz", added:"2026-08-03", source:"Referral", tags:["Semi-private"], since:"Aug 3", coach:"Tori Lane",
      phone:"(316) 555-0131", email:"leah.ortiz@example.com", replies:"App",
      plans:[{id:"sp", name:"Semi-Private 2x per week", kind:"Membership", service:"Semi-private", price:"$449.00 a month", amt:449, start:"2026-08-03", next:"2026-12-03", open:3, booked:2, used:3, dates:true}],
      appts:[{id:"e1", day:"Mon, Nov 23", time:"5:30 AM", title:"Semi-private training", where:"with Coach Tori", plan:"sp", status:"booked"}],
      visits:[["Wed, Nov 18","5:30 AM","Semi-private training","Checked out"]], card:"Mastercard ending 8210",
      tx:[["Nov 3","Semi-Private 2x per week","Mastercard ending 8210","$449.00"],["Oct 3","Semi-Private 2x per week","Mastercard ending 8210","$449.00"]],
      docs:[{name:"Liability waiver", status:"signed", when:"Signed Aug 3"}], coaching:"Strength Base, phase 1. Week 5 of 6.",
      read:["Leah trains with Tori on Mondays and Wednesdays at 5:30 AM.","An imported row shares her name and phone number."]},
    {id:"leah2", name:"Leah Ortiz", added:"2026-11-14", source:"Imported list", phone:"(316) 555-0131", email:"leah.o@example.com", stage:"New"},
    {id:"devon", name:"Devon Marsh", added:"2026-06-22", source:"Website form", tags:["Semi-private"], since:"Jun 22", coach:"Andre Lewis",
      phone:"(316) 555-0150", email:"devon.marsh@example.com", replies:"Text",
      plans:[{id:"pt", name:"Personal Training 8-pack", kind:"Pack", service:"Personal training", price:"$560.00", amt:560, size:8, when:"Bought Oct 28, expires Jan 28, 2027", open:4, booked:1, used:3}],
      appts:[{id:"d1", today:true, day:"Today", time:"4:00 PM", title:"Personal training, 60 min", where:"with Coach Andre", plan:"pt", status:"booked"}],
      visits:[["Tue, Nov 17","4:00 PM","Personal training, 60 min","Checked out"]], card:"Visa ending 9034",
      tx:[["Oct 28","Personal Training 8-pack","Visa ending 9034","$560.00"]],
      docs:[{name:"Liability waiver", status:"signed", when:"Signed Jun 22"}], coaching:"Return to Lifting. Week 2 of 8.",
      read:["Devon trains with Andre today at 4:00 PM.","He has 4 personal training credits left to book."]},
    {id:"devon2", name:"Devon Marsh", added:"2026-11-14", source:"Imported list", phone:"(316) 555-0193", email:"dmarsh.work@example.com", stage:"New"},
    {id:"tom", name:"Tom Becker", added:"2025-03-02", source:"Front desk", tags:["No texts"], since:"Mar 2, 2025", textOk:false,
      phone:"(316) 555-0106", email:"tom.becker@example.com", replies:"Email", stage:"Not now",
      past:[["Open Gym Unlimited","Mar 2, 2025 to Sep 2","Ended"]],
      visits:[["Fri, Aug 28","5:15 PM","Open gym","Checked out"]],
      tx:[["Aug 2","Open Gym Unlimited","Cash","$79.00"]],
      docs:[{name:"Liability waiver", status:"signed", when:"Signed Mar 2, 2025"}],
      read:["Tom's membership ended on Sep 2. He paused for travel and did not come back.","He opted out of texts. Email still works."]},
    {id:"ava", name:"Ava Lindqvist", added:"2024-09-18", source:"Website form", since:"Sep 18, 2024",
      phone:"(316) 555-0122", email:"ava.lindqvist@example.com", replies:"Text",
      past:[["Semi-Private 2x per week","Sep 18, 2024 to Jun 30","Ended"]],
      tx:[["Jun 1","Semi-Private 2x per week","Visa ending 6120","$449.00"]],
      docs:[{name:"Liability waiver", status:"signed", when:"Signed Sep 18, 2024"}],
      read:["Ava's membership ended on Jun 30. She moved away for the summer."]}
  ];
  var dups = [
    {id:"d1", keep:"devon", drop:"devon2", why:"Same first and last name"},
    {id:"d2", keep:"priya", drop:"priya2", why:"Same email"},
    {id:"d3", keep:"sam", drop:"sam2", why:"Same email"},
    {id:"d4", keep:"leah", drop:"leah2", why:"Same name and phone number"}
  ];

  var funnels = [
    {id:"f1", name:"Free intro class", type:"Form", live:true, last:"Today, 7:44 AM", opened:61, leads:14, booked:6, showed:4, joined:2, next:"Milton texts the lead and books an intro class",
      questions:[["What is your main goal?","Long answer",true],["Have you worked with a coach before?","Short answer",true],["Which days work best?","Choice",false]], title:"Try a free intro class", thanks:"Thanks. We will text you in a minute to find a time."},
    {id:"f2", name:"northlinestrength.com", type:"Website connection", live:true, last:"Yesterday", opened:null, leads:9, booked:3, showed:2, joined:1, next:"Milton texts the lead and books an intro class"},
    {id:"f3", name:"3 recovery rooms for $99", type:"Offer link", live:true, last:"Wed, Nov 18", opened:38, leads:7, booked:5, showed:4, joined:4, next:"Pay, then book. Then the Welcome and documents workflow", order:"Pay, then book"},
    {id:"f4", name:"Spring intro, Facebook and Instagram", type:"Meta lead ads", live:false, last:"No leads yet", opened:null, leads:0, booked:0, showed:0, joined:0, next:"Milton texts the lead and books an intro class"}
  ];
  var workflows = [
    {id:"w1", name:"Welcome after first booking", desc:"Welcomes a new person and sends what they need to sign.", status:"Live", starts:"Session booked · First session", people:"Everyone who books for the first time", ends:"After the last step in each run", runs:23,
      steps:[["Text","Hi {First name}, welcome to Northline Strength. You are booked for {Session} on {Day} at {Time}. Reply here with any questions."],["Request signature","Everything they are missing. Skips when nothing is unsigned."],["Wait","Until required documents are signed, up to 2 days"],["Text","One more thing before {Day}: please sign your documents here. {Signing link}"]]},
    {id:"w2", name:"Session reminder", desc:"A reminder the evening before each session.", status:"Live", starts:"Daily · 5:30 PM · Central Time", people:"Anyone with a session tomorrow", ends:"After the last step in each run", runs:212,
      steps:[["Text","See you tomorrow at {Time} for {Session}."]]},
    {id:"w3", name:"Purchase onboarding", desc:"Adds a new buyer as a client and invites them to the app.", status:"Live", starts:"Purchase completed", people:"Anyone who buys for the first time", ends:"After the last step in each run", runs:8,
      steps:[["Add client","Adds the buyer to Clients on their existing record"],["Text","Welcome to Northline Strength. Download our app to book sessions and follow your program: {App link}"]]},
    {id:"w4", name:"At-risk check-in", desc:"Checks in when a client goes quiet.", status:"Draft", starts:"Client health turns yellow", people:"Clients with a coach", ends:"After the last step in each run", runs:0,
      steps:[["Condition","Has the client opted out of texts?"],["Text","Hey {First name}, we missed you this week. Want me to hold your usual spot?"],["Wait","1 day"],["Team note","Tell the coach if there is still no reply"]]},
    {id:"w5", name:"Missed workout follow-up", desc:"Check in, wait one day, then follow up.", status:"Paused", starts:"Session marked no-show", people:"Everyone", ends:"After the last step in each run", runs:14,
      steps:[["Text","We missed you today, {First name}. Want to rebook?"],["Wait","1 day"],["Text","Here is the link to pick a new time: {Booking link}"]]},
    {id:"w6", name:"Holiday hours 2025", desc:"Last year's closure notice.", status:"Archived", starts:"Started by hand", people:"Contacts you choose", ends:"After the last step in each run", runs:1, steps:[["Text","We are closed Dec 24 and 25. See you on the 26th."]]}
  ];
  var templates = [
    ["Welcome after first booking","Welcome a new person and ask for their documents.","4 steps · Session booked"],
    ["Documents after booking","Ask for anything unsigned before the first session.","2 steps · Session booked"],
    ["Session reminder","A reminder the evening before each session.","1 step · Daily · 5:30 PM"],
    ["Purchase onboarding","Add a buyer as a client and invite them to the app.","2 steps · Purchase completed"],
    ["Trial onboarding","Welcome a lead and follow up after one day.","3 steps · Started by hand"],
    ["At-risk check-in","Check in when a client goes quiet.","4 steps · Client health turns yellow"],
    ["Missed workout follow-up","Check in, wait one day, then follow up.","3 steps · Session marked no-show"]
  ];
  var stages = ["Tour booked","Trial week"];
  return {GYM:GYM, TODAY:TODAY, TEAM:TEAM, CATALOG:CATALOG, people:people, dups:dups, funnels:funnels, workflows:workflows, templates:templates, stages:stages};
})();
