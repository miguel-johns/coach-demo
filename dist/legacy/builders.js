/* CRM builders: the Workflow builder and the Funnel builder.
   Base: the live builders, as written up in "Milton Live Workflow and Funnel Builders: Review" (Nov 23, 2026).
   Look and words follow the Rule Sheet: side panels for short tasks, a centered window only to confirm, "Live" for on.
   Added on top of live, by Miguel's choice: Preview a run, stop early, wait until, more step types,
   detail buttons, texts Milton writes, and the not-yet-live funnel pieces shown as designed. */
(function(){
  var esc=M.esc, $=M.$, A=M.acts, G=DB.GYM;
  function wfs(){return DB.workflows}
  function wf(id){return wfs().filter(function(x){return x.id===id})[0]}
  function fn(id){return DB.funnels.filter(function(x){return x.id===id})[0]}
  function opt(list,cur){return list.map(function(o){var v=Array.isArray(o)?o[0]:o, l=Array.isArray(o)?o[1]:o; return '<option value="'+esc(v)+'"'+(String(v)===String(cur)?" selected":"")+'>'+esc(l)+'</option>'}).join("")}
  function sw(act,id,on,label){return '<button class="sw" role="switch" aria-checked="'+!!on+'" aria-label="'+esc(label)+'" data-act="'+act+'" data-id="'+id+'"></button>'}
  function val(id){var e=$(id); return e?e.value.trim():""}
  function clone(o){return JSON.parse(JSON.stringify(o))}
  function low(s){return s.charAt(0).toLowerCase()+s.slice(1)}
  function allTags(){var o=[]; M.people().forEach(function(p){(p.tags||[]).forEach(function(t){if(o.indexOf(t)<0) o.push(t)})}); return o.sort()}
  function offerings(kind){return DB.SERVICES.filter(function(s){var g=(s.cap||1)>1||/group|class/i.test(s.kind||""); return s.status!=="Archived"&&(kind==="group"?g:true)}).map(function(s){return s.name})}

  /* ================= Workflows ================= */
  var ST=["Any session","Group class","1:1","Room"], ST2=["Any session","Group class","1:1"];
  var TZ=["Eastern","Central","Mountain","Arizona (Phoenix)","Pacific","Alaska (Anchorage)","Hawaii","Atlantic (Halifax)","Atlantic (Puerto Rico)","UTC"];
  var DAYS=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  function stype(o){return o.type==="Any session"?"Classes and 1:1":o.type}
  function t12(t){var a=String(t||"09:00").split(":"), h=+a[0]; return (h%12||12)+":"+a[1]+" "+(h<12?"AM":"PM")}
  /* f: [key,label,type,default,extra]. types: num, sel, chk, off, tags, time, date */
  var TR=[
    {g:"Bookings and attendance",k:"Class is under-booked",d:"Invite eligible contacts from selected tags to a low-fill group class",f:[["cap","Below capacity (%)","num",50],["hrs","Hours before class","num",24],["off","Only for (optional)","off",[],"group"],["tags","Invite contacts with any of these tags (required)","tags",[]]],help:"One invitation cycle per workflow and class. Existing bookings and eligible waiting-list contacts take priority. Class, tag and booking eligibility are rechecked before every message. Classes requiring child profiles are excluded.",s:function(o){return "Class below "+o.cap+"% capacity, within "+o.hrs+" hours"},r:"Eligible contacts in selected tags"},
    {g:"Bookings and attendance",k:"Visits dropped",d:"A verified decline in attended classes and 1:1 sessions",f:[["drop","Attendance drop (%)","num",50]],help:"Checked daily: attended classes and 1:1s in the last 7 complete days compared with the weekly average of the previous 4 weeks, using your gym's time zone. Requires 35 full days of membership and 4 baseline visits. Unmarked attendance pauses evaluation. Each decline starts once; recovery stops pending outreach.",s:function(o){return "Visits dropped by "+o.drop+"%"},r:"Members with declining attendance"},
    {g:"Bookings and attendance",k:"Class cancelled or coach out",d:"People booked into an affected session",f:[["when","When this happens","chk",["Class/session cancelled","Coach unavailable"],["Class/session cancelled","Coach unavailable"]],["type","Session type","sel","Any session",ST],["off","Only for (optional)","off",[]],["tags","Affected person has any of these tags (optional)","tags",[]]],help:"Only contacts booked when the issue is recorded join. Member cancellations do not start this workflow. Messages stop at the session start. Coverage, corrections and tag changes stop stale messages.",s:function(o){return (o.when.length?o.when.join(" or "):"Nothing chosen")+" · "+o.type},r:"The affected booked person"},
    {g:"Bookings and attendance",k:"Waiting spot opens",d:"The person automatically promoted from a class waitlist",f:[["off","Only for (optional)","off",[],"group"],["tags","Promoted person has any of these tags (optional)","tags",[]]],help:"Only the person automatically promoted to a class joins. Milton's booking confirmation remains unchanged; use this workflow for an additional follow-up. Tags and the booking are checked again before every message.",s:function(){return "Waiting spot opens · Group class"},r:"The promoted person"},
    {g:"Bookings and attendance",k:"Attended a session",d:"Marked present by a team member for a class or 1:1",f:[["type","Session type","sel","Any session",ST2],["off","Only for (optional)","off",[]],["tags","Attendee has any of these tags (optional)","tags",[]]],help:"Only the person marked present by a team member joins. Rooms are excluded. Tags and attendance are checked again before every message; corrections stop stale outreach.",s:function(o){return "Attended a session · "+stype(o)},r:"The qualifying attendee"},
    {g:"Bookings and attendance",k:"Missed a session",d:"Marked absent by a team member after the session ends",f:[["type","Session type","sel","Any session",ST2],["off","Only for (optional)","off",[]],["tags","Attendee has any of these tags (optional)","tags",[]],["delay","Wait after session ends (minutes)","num",15]],help:"Only an absence recorded by a team member qualifies, after the session ends and the selected delay. Unmarked attendance is not a missed session. Tags and attendance are checked again before every message; corrections stop stale outreach.",s:function(o){return "Missed a session · "+stype(o)},r:"The qualifying attendee"},
    {g:"Bookings and attendance",k:"Session booked",d:"The person who books a group class, 1:1 or room",f:[["type","Session type","sel","Any session",ST],["off","Only for (optional)","off",[]],["tags","Booker has any of these tags (optional)","tags",[]]],help:"Only the person who booked joins, once for each confirmed booking. Tags are checked again before every message. Cancellation stops that booking's remaining steps.",s:function(o){return "Session booked · "+o.type},r:"The qualifying person who booked"},
    {g:"Bookings and attendance",k:"No class booked recently",d:"Members with usable class access and no recent or upcoming booking",f:[["days","Days without a class booking","num",7]],help:"Checked daily for members with usable group-class credits or unlimited access and no upcoming class. New members and new class access get this grace period. Each message checks eligibility again.",s:function(o){return "No class booked in "+o.days+" days"},r:"Members with unused class access"},
    {g:"Purchases",k:"Purchase completed",d:"The person whose service or package purchase is fulfilled",f:[],help:"The buyer joins automatically, once for each fulfilled purchase.",s:function(){return "Purchase completed"},r:"The person who bought"},
    {g:"Leads and forms",k:"Signup form filled",d:"When someone completes one of your forms",f:[["form","Which form","sel","Any form",function(){return ["Any form"].concat(DB.funnels.filter(function(f){return f.type==="Form"}).map(function(f){return f.name}))}]],help:"The person who filled in the form joins, once for each submission.",s:function(o){return "Signup form filled · "+o.form},r:"The person who filled it in"},
    {g:"Leads and forms",k:"New lead from a funnel",d:"A lead arrives through a website connection, an offer link or Meta lead ads",added:true,f:[["funnel","Which funnel","sel","Any funnel",function(){return ["Any funnel"].concat(DB.funnels.map(function(f){return f.name}))}]],help:"The new lead joins once. Someone who was already a contact does not start it again.",s:function(o){return "New lead · "+o.funnel},r:"The new lead"},
    {g:"Dates and schedules",k:"On a schedule",d:"Once, daily or weekly, in the workflow time zone",assign:true,f:[["freq","Frequency","sel","Daily",["Once","Daily","Weekly"]],["date","Date","date","2026-11-23"],["day","Weekday","sel","Monday",DAYS],["time","Local time","time","09:00"],["tz","Time zone","sel","Central",TZ]],help:"",s:function(o){return (o.freq==="Once"?"Once · "+o.date:o.freq==="Weekly"?o.day:"Daily")+" · "+t12(o.time)+" · "+o.tz},r:"Contacts you assign"},
    {g:"Dates and schedules",k:"Only when started manually",d:"You choose when to run it",assign:true,f:[],help:"",s:function(){return "Started manually"},r:"Contacts you assign"}
  ];
  function trg(k){return TR.filter(function(t){return t.k===k})[0]}
  function defaults(t){var o={}; t.f.forEach(function(f){o[f[0]]=Array.isArray(f[3])?f[3].slice():f[3]}); return o}
  function shown(t,o){return t.f.filter(function(f){return !(t.k==="On a schedule"&&((f[0]==="date"&&o.freq!=="Once")||(f[0]==="day"&&o.freq!=="Weekly")))})}
  var STEPS=[["text","Text","Send an SMS to the assigned contact"],["email","Email","Send through a connected mailbox"],["wait","Wait","Pause before the next step"],["if","Condition","Match contact rules and choose Yes or No"],
    ["setter","Appointment setter","Milton takes over the conversation to get them booked"],["invite","App invite","Invite them to your member app"],["client","Add client","Add them to Clients and pick a coach"],["stage","Move in Pipeline","Move them to a Pipeline stage"],["studio","Studio report or story","Milton builds one from the person's own data"],["tag","Add tag","Tag the contact"],["note","Team note","Tell a team member to do something"]];
  var SNAME={}; STEPS.forEach(function(s){SNAME[s[0]]=s[1]});
  var EX=["Exists","Does not exist"], IS=["Is","Is not"];
  var FIELDS={"Name":{r:EX},"Email":{r:EX},"Phone number":{r:EX},"Welcome SMS status":{r:IS,s:["Not welcomed","Pending","Accepted by SMS provider","Failed","Needs delivery review"]},"Current waiver status":{r:IS,s:["Needs signature","Current waiver signed","No published waiver"]},
    "Reply":{r:EX,w:["Has replied","Has not replied"]},"Upcoming booking":{r:EX,w:["Has an upcoming booking","Has no upcoming booking"]},"Active package":{r:EX,w:["Has an active package","Has no active package"]},"Coach":{r:EX,w:["Has a coach","Has no coach"]}};
  var MERGE=["{First name}","{Gym name}","{Session}","{Day}","{Time}","{Booking link}","{App link}","{Coach}"];
  var UNTIL=["They reply","Documents are signed","They book a session","Their session starts"];
  var GOALS=["Your gym default","Book an intro class","Book a session for a service","Send to a checkout link"];
  var PSTAGES=["New lead","Contacted","Booked","Came in","Joined"];
  var PURPOSE=["General message","Welcome once per contact","Waiver request"];

  function ruleTxt(r){var F=FIELDS[r.f]; if(F.w) return F.w[r.r==="Exists"?0:1]; if(F.s) return r.f+" "+low(r.r)+" "+r.s; return r.f+(r.r==="Exists"?" is provided":" is not provided")}
  function condTxt(s){return s.rules.map(ruleTxt).join(s.match==="Any"?" OR ":" AND ")}
  function waitTxt(s){var u=low(s.unit), d=s.n+" "+(+s.n===1?u.replace(/s$/,""):u); return s.mode==="until"?"Wait until "+low(s.until)+", up to "+d:"Wait "+d+" before the next step"}
  function sum(s){
    if(s.t==="text") return s.ai?"Milton writes it each time: "+(s.instr||"no instruction yet"):s.body||"No message yet";
    if(s.t==="email") return (s.subject||"No subject yet")+(s.body?". "+s.body:"");
    if(s.t==="wait") return waitTxt(s);
    if(s.t==="if") return condTxt(s);
    if(s.t==="studio") return "Milton builds a "+s.kind.toLowerCase()+" from their data. "+(s.send==="After human review"?"It waits in Studio for your approval.":"It sends as soon as every number checks out.");
    if(s.t==="invite") return "Sends the invite to your member app. Skips anyone who already has it.";
    if(s.t==="client") return "Adds them to Clients on their existing record. Coach: "+s.coach+".";
    if(s.t==="stage") return "Moves them to "+s.stage+".";
    if(s.t==="tag") return 'Adds the tag "'+(s.tag||"")+'".';
    if(s.t==="note") return "To "+low(s.to)+": "+(s.body||"No note yet");
    if(s.t==="setter") return "Milton texts back and forth until they are booked. Goal: "+low(s.goal)+".";
    return "";
  }
  function T(body,x){return Object.assign({t:"text",name:"Text",body:body,send:"Automatically",purpose:PURPOSE[0],ai:false,instr:""},x||{})}
  function W(n,unit,x){return Object.assign({t:"wait",name:"Wait",mode:"for",n:n,unit:unit||"Days",until:UNTIL[0]},x||{})}
  function IF(rules,yes,no,name){return {t:"if",name:name||"Condition",match:"All",rules:rules,yes:yes||[],no:no||[]}}
  function blank(t){return {text:T("Hi {First name},"),email:{t:"email",name:"Email",mailbox:"hello@"+G.site,sender:G.name+" <hello@"+G.site+">",subject:"A note from your coach",body:"Hi {First name},",send:"Automatically"},wait:W(1),"if":IF([{f:"Name",r:"Exists",s:""}]),setter:{t:"setter",name:"Appointment setter",goal:GOALS[0]},invite:{t:"invite",name:"App invite"},studio:{t:"studio",name:"Studio report or story",kind:"Progress story",send:"After human review"},client:{t:"client",name:"Add client",coach:"Decide later"},stage:{t:"stage",name:"Move in Pipeline",stage:PSTAGES[2]},tag:{t:"tag",name:"Add tag",tag:""},note:{t:"note",name:"Team note",to:"Their coach",body:""}}[t]}
  var WAIVER=T("Please review and sign your waiver: {Signing link} Reply STOP to unsubscribe.",{name:"Waiver SMS",purpose:PURPOSE[2]});
  /* The example gym's workflows, rebuilt on the live triggers and step types. */
  (function seed(){
    var D={
      w1:[{k:"Session booked",o:{type:"Any session",off:[],tags:[]}},[IF([{f:"Welcome SMS status",r:"Is",s:"Not welcomed"}],[T("Hi {First name}, welcome to "+G.name+". You are booked for {Session} on {Day} at {Time}. Reply here with any questions.",{name:"Welcome SMS",purpose:PURPOSE[1]})],[],"Check current status"),IF([{f:"Current waiver status",r:"Is",s:"Needs signature"}],[clone(WAIVER)],[],"Needs a waiver?")]],
      w2:[{k:"On a schedule",o:{freq:"Daily",date:"2026-11-23",day:"Monday",time:"17:30",tz:"Central"}},[T("See you tomorrow at {Time} for {Session}.",{name:"Reminder"})]],
      w3:[{k:"Purchase completed",o:{}},[{t:"client",name:"Add client",coach:"Decide later"},IF([{f:"Welcome SMS status",r:"Is",s:"Not welcomed"}],[T("Welcome to "+G.name+". Download our app to book sessions and follow your program: {App link}",{name:"Welcome and app links",purpose:PURPOSE[1]})],[],"Check current status")]],
      w4:[{k:"Visits dropped",o:{drop:50}},[IF([{f:"Phone number",r:"Exists",s:""}],[T("Hey {First name}, we missed you this week. Want me to hold your usual spot?",{name:"Check in"}),W(1),{t:"note",name:"Team note",to:"Their coach",body:"Tell the coach if there is still no reply"}],[{t:"email",name:"Check in by email",mailbox:"hello@"+G.site,sender:G.name+" <hello@"+G.site+">",subject:"We missed you this week",body:"Hi {First name}, want me to hold your usual spot?",send:"Automatically"}],"At risk?")]],
      w5:[{k:"Missed a session",o:{type:"Any session",off:[],tags:[],delay:15}},[T("We missed you today, {First name}. Want to rebook?",{name:"Check in"}),W(1,"Days",{name:"Wait one day"}),T("Here is the link to pick a new time: {Booking link}",{name:"Rebook link"})]],
      w6:[{k:"Only when started manually",o:{}},[T("We are closed Dec 24 and 25. See you on the 26th.")]]
    };
    wfs().forEach(function(w){var d=D[w.id]; if(!d) return; w.trig=d[0]; w.steps=d[1]; w.stop={reply:w.id==="w4"||w.id==="w5",book:false}; w.assign=w.id==="w2"?{c:[],t:["Semi-private"]}:w.id==="w6"?{c:["dana","leah"],t:[]}:{c:[],t:[]}; w._state="saved"; sync(w); w._saved=snap(w)});
    DB.templates=[
      ["Missed Workout Escalation","Check in, wait one day, then personalize a follow-up.","3 steps · Started manually"],
      ["Trial Onboarding","Welcome a lead and follow up after one day.","3 steps · Started manually"],
      ["Session Reminder","Send a scheduled reminder to enrolled clients.","1 step · Daily · 9:00 AM · Central"],
      ["At-Risk Check-in","Use a condition to choose the right contact channel.","3 steps · Started manually"],
      ["Welcome after first booking","SMS only. Starts as a draft; review service filters and sender readiness.","2 steps · Session booked · Any session"],
      ["Waiver after booking","SMS only. Starts as a draft; review service filters and sender readiness.","2 steps · Session booked · Any session"],
      ["Welcome and invite to the Milton app","After a completed purchase, welcome clients who have not received a Welcome SMS and share the app download links.","2 steps · Purchase completed"]
    ];
  })();
  var MAN={k:"Only when started manually",o:{}}, SB={k:"Session booked",o:{type:"Any session",off:[],tags:[]}};
  var TPL=[
    function(){return [MAN,[T("Hi {First name}, we missed you this week. Want help finding a session?",{name:"Check in"}),W(1,"Days",{name:"Wait one day"}),T("",{name:"Personalize follow-up",ai:true,instr:"Draft a warm, concise follow-up that helps this client return to training.",send:"After human review"})]]},
    function(){return [MAN,[T("Welcome {First name}! Reply with one goal you want to work toward.",{name:"Welcome"}),W(1,"Days",{name:"Wait one day"}),Object.assign(blank("email"),{name:"Getting started",subject:"Your first week"})]]},
    function(){return [{k:"On a schedule",o:{freq:"Daily",date:"2026-11-23",day:"Monday",time:"09:00",tz:"Central"}},[T("Hi {First name}, this is your coaching reminder for today.",{name:"Reminder"})]]},
    function(){return [MAN,[IF([{f:"Phone number",r:"Exists",s:""}],[T("Hi {First name}, checking in. How is training going?",{name:"Text check-in"})],[Object.assign(blank("email"),{name:"Email check-in",subject:"Checking in"})],"At risk?")]]},
    function(){return [SB,[IF([{f:"Welcome SMS status",r:"Is",s:"Not welcomed"}],[T("Hi {First name}, welcome to {Gym name}. We will see you at {Session} on {Day} at {Time}.",{name:"Welcome SMS",purpose:PURPOSE[1]})],[],"Check current status")]]},
    function(){return [SB,[IF([{f:"Current waiver status",r:"Is",s:"Needs signature"}],[clone(WAIVER)],[],"Check current status")]]},
    function(){return [{k:"Purchase completed",o:{}},[IF([{f:"Welcome SMS status",r:"Is",s:"Not welcomed"}],[T("Welcome to {Gym name}, {First name}. Download our app to book sessions and follow your program: {App link}",{name:"Welcome and app links",purpose:PURPOSE[1]})],[],"Check current status")]]}
  ];
  function starts(w){var t=trg(w.trig.k); return t?t.s(w.trig.o):"Not set yet"}
  function runsFor(w){var t=trg(w.trig.k), n=w.assign.c.length+w.assign.t.length; return t.assign&&n?M.plural(n,"contact or tag assignment"):t.r}
  function ends(w){return (w.stop.reply||w.stop.book)?"When "+[w.stop.reply?"they reply":"",w.stop.book?"they book":""].filter(Boolean).join(" or ")+", or after the last step":"After the last step in each run"}
  function sync(w){w.starts=starts(w); w.people=runsFor(w); w.ends=ends(w)}
  function snap(w){return JSON.stringify({name:w.name,trig:w.trig,stop:w.stop,steps:w.steps,assign:w.assign})}
  function count(L){return L.reduce(function(a,s){return a+1+(s.t==="if"?count(s.yes)+count(s.no):0)},0)}
  function getList(w,lp){var L=w.steps; if(!lp) return L; var g=lp.split("."); for(var i=0;i<g.length;i+=2) L=L[+g[i]][g[i+1]]; return L}
  function at(w,id){var a=id.split("|"); return {L:getList(w,a[0]),i:+a[1],lp:a[0]}}
  function each(L,f){L.forEach(function(s){f(s); if(s.t==="if"){each(s.yes,f); each(s.no,f)}})}
  function issues(w){
    var o=[]; if(!w.steps.length) o.push("Add at least one step.");
    var t=trg(w.trig.k); if(t.k==="Class is under-booked"&&!w.trig.o.tags.length) o.push("Class is under-booked needs at least one tag to invite.");
    each(w.steps,function(s){
      if(s.t==="text"&&!s.ai&&!(s.body||"").trim()) o.push('The text "'+s.name+'" has no message.');
      if(s.t==="text"&&s.ai&&!(s.instr||"").trim()) o.push('Tell Milton what the text "'+s.name+'" should say.');
      if(s.t==="email"&&(!s.mailbox||!s.sender)) o.push("Choose a connected mailbox and verified sender for the email step.");
      if(s.t==="email"&&!(s.subject||"").trim()) o.push('The email "'+s.name+'" has no subject.');
      if(s.t==="tag"&&!(s.tag||"").trim()) o.push("A tag step has no tag."); if(s.t==="note"&&!(s.body||"").trim()) o.push("A team note is empty.");
    });
    return o.filter(function(x,i){return o.indexOf(x)===i});
  }
  var wst={run:null,open:null,chk:null,undo:[],redo:[],ppl:"Contacts",pq:"",pick:null,hrun:null,tq:""};
  function cur(){return wf(M.crmState().wid)}
  function touch(w){wst.undo.push(JSON.stringify(w.steps)); if(wst.undo.length>40) wst.undo.shift(); wst.redo=[]; w._state="dirty"; wst.chk=null}
  function reW(msg){M.render(); if(msg) M.toast(msg)}
  function grabHead(){var w=cur(); if(w&&$("wfName")){var n=val("wfName")||w.name; if(n!==w.name){w.name=n; w._state="dirty"}}}

  function listHTML(w,L,lp,ro){
    var h="", add=function(i){return ro?'<span class="wire"></span>':'<span class="wire"></span><button class="wf-add" data-act="wfadd" data-id="'+lp+"|"+i+'" aria-label="Add a step '+(i<L.length?"before step "+(i+1):"at the end")+'" title="Add a step">+</button><span class="wire"></span>'};
    L.forEach(function(s,i){
      var id=lp+"|"+i, named=s.name&&s.name!==SNAME[s.t];
      h+=add(i)+'<div class="node wf-node'+(s.t==="if"?" wf-if":"")+'"><button class="wf-open" data-act="wfedit" data-id="'+id+'"'+(ro?" disabled":"")+'><span class="k">'+(i+1)+" · "+SNAME[s.t]+((s.t==="text"||s.t==="email"||s.t==="studio")&&s.send==="After human review"?" · Review before sending":"")+(s.t==="text"&&s.ai?" · Written by Milton":"")+'</span>'+(named?'<b class="wf-sn">'+esc(s.name)+'</b>':"")+'<span class="wf-sum">'+esc(sum(s))+'</span></button>'+(ro?"":'<span class="wf-mv"><button data-act="wfmove" data-id="'+id+'|-1" aria-label="Move step up"'+(i===0?" disabled":"")+'>&#8593;</button><button data-act="wfmove" data-id="'+id+'|1" aria-label="Move step down"'+(i===L.length-1?" disabled":"")+'>&#8595;</button></span>')+'</div>';
      if(s.t==="if"){var base=(lp?lp+".":"")+i; h+='<span class="wire"></span><div class="wf-br">'+["yes","no"].map(function(b){return '<div class="wf-lane"><span class="wf-ll">'+(b==="yes"?"Yes":"No")+'</span>'+listHTML(w,s[b],base+"."+b,ro)+'</div>'}).join("")+'</div>'}
    });
    return h+add(L.length);
  }
  var WCHIP={Live:"ok",Draft:"",Paused:"warn",Archived:""};
  M.wfCount=function(w){return count(w.steps)};
  function head(w,view){
    var live=w.status==="Live", arch=w.status==="Archived", ro=live||arch, iss=issues(w), t=trg(w.trig.k);
    var stateLine=live?"Pause this workflow before changing its steps or who it runs for.":arch?"Archived. Duplicate it to use it again.":w._state==="new"?"Not saved yet":w._state==="dirty"?"Unsaved changes":"Draft saved";
    var h='<button class="backl" data-act="wfback">&#8249; All workflows</button><section class="head wf-head"><div class="id" style="flex:1;min-width:240px"><div style="flex:1;min-width:0">'+(ro?'<h2 class="name">'+esc(w.name)+'</h2>':'<input class="wf-name" id="wfName" aria-label="Workflow name" value="'+esc(w.name)+'">')+'<div class="chips"><span class="chip '+WCHIP[w.status]+'">'+w.status+'</span><span class="m">'+stateLine+'</span></div></div></div><div class="acts">'+(live?'<button class="btn" data-act="wfpause">Pause to edit</button>':arch?"":'<button class="btn" data-act="wfsavedraft">Save draft</button><button class="btn pri" data-act="wflive"'+(wst.chk==="run"?" disabled":"")+'>'+(wst.chk==="run"?"Working...":"Make it live")+'</button>')+'</div><div class="wf-tools">'+(ro?"":'<button class="btn sm quiet" data-act="wfundo"'+(wst.undo.length?"":" disabled")+'>Undo</button><button class="btn sm quiet" data-act="wfredo"'+(wst.redo.length?"":" disabled")+'>Redo</button>')+'<button class="btn sm quiet" data-act="panel" data-id="wfrun">Preview a run</button><button class="btn sm quiet" data-act="wfdup">Duplicate</button>'+(arch?"":'<button class="btn sm quiet rm" data-act="wfarch">Archive</button>')+'</div></section>';
    if(wst.chk==="run") h+='<div class="infobox" style="margin-top:12px">Checking recipient eligibility...</div>';
    else if(wst.chk==="why"&&iss.length) h+='<div class="infobox wf-err" role="alert" style="margin-top:12px"><b>Not ready to go live yet.</b><ul>'+iss.map(function(x){return "<li>"+esc(x)+"</li>"}).join("")+'</ul></div>';
    else if(wst.chk==="none") h+='<div class="card" style="margin-top:12px;padding:10px 14px"><b>SMS: 0 of 0 eligible</b></div><div class="infobox wf-bad" role="alert" style="margin-top:8px">Your draft and assignments are saved, but nobody is assigned yet. Open People and assign contacts or tags, then try again. Nothing went live and no messages were sent.</div>';
    else if(wst.chk&&wst.chk.ok) h+='<div class="card" style="margin-top:12px;padding:10px 14px"><b>SMS: '+wst.chk.ok+'</b> <span class="m">Eligibility is checked again before every message.</span></div>';
    h+='<div class="seg" style="margin:14px 0 12px">'+[["steps","Steps "+count(w.steps)],["people","People"],["hist","Run history "+hist(w).length],["appr","Needs approval 0"]].map(function(x){return '<button data-act="wview" data-id="'+x[0]+'" aria-pressed="'+(view===x[0])+'">'+x[1]+'</button>'}).join("")+'</div>';
    return h;
  }
  function stepsView(w){
    var ro=w.status==="Live"||w.status==="Archived";
    var h='<button class="rules3 wf-sumbar" data-act="panel" data-id="wftrig"'+(ro?" disabled":"")+' aria-label="Change what starts it"><div><div class="k">Starts</div><div class="t">'+esc(starts(w))+'</div></div><div><div class="k">Runs for</div><div class="t">'+esc(runsFor(w))+'</div></div><div><div class="k">Ends</div><div class="t">'+esc(ends(w))+'</div></div></button>';
    h+='<div class="canvas wf-canvas"><span class="pillnode">Starts: '+esc(starts(w))+'</span>'+listHTML(w,w.steps,"",ro)+(w.steps.length?"":'<div class="wf-empty"><b>Add your first step</b><span class="m">Choose a message, a wait, or a condition.</span></div><span class="wire"></span>')+'<span class="pillnode end">End of workflow</span></div>';
    return h;
  }
  function peopleView(w){
    var t=trg(w.trig.k), live=w.status==="Live";
    if(!t.assign){
      var txt=t.k==="Purchase completed"?"The buyer joins automatically when a service or package purchase is fulfilled while this workflow is live.":t.k==="Session booked"?"Only qualifying bookers join automatically while this workflow is live. Each booking has its own run. The selected tags filter the booker; other tagged contacts are not enrolled.":t.r+" joins automatically while this workflow is live. Nobody needs to be assigned.";
      var rows=t.k==="Session booked"&&w.runs?hist(w).slice(0,4).map(function(r){return '<div class="row"><div class="what"><div class="t">'+esc(r.who.name)+'</div><div class="m">'+esc(r.what)+'</div></div><span class="chip '+(r.ok?"ok":"err")+'">'+(r.ok?"Completed":"Failed")+'</span></div>'}).join(""):"";
      return '<section class="card wf-narrow"><div class="ch"><h3>'+(t.k==="Purchase completed"?"Purchase audience":t.k==="Session booked"?"Booking audience":"Who it runs for")+'</h3></div><p style="margin:0">'+esc(txt)+'</p>'+(t.help?'<p class="m" style="margin:8px 0 0">'+esc(t.help)+'</p>':"")+rows+'</section>';
    }
    if(!wst.pick||wst.pick.id!==w.id) wst.pick={id:w.id,c:w.assign.c.slice(),t:w.assign.t.slice()};
    var pk=wst.pick, q=wst.pq.toLowerCase(), n=pk.c.length+pk.t.length, list=wst.ppl==="Contacts"?M.people().filter(function(p){return !q||p.name.toLowerCase().indexOf(q)>=0}).map(function(p){return [p.id,p.name,M.status(p),pk.c.indexOf(p.id)>=0]}):allTags().filter(function(x){return !q||x.toLowerCase().indexOf(q)>=0}).map(function(x){return [x,x,M.plural(M.people().filter(function(p){return (p.tags||[]).indexOf(x)>=0}).length,"contact"),pk.t.indexOf(x)>=0]});
    var sel=pk.c.map(function(id){return ["c",id,M.person(id).name,"Contact"]}).concat(pk.t.map(function(x){return ["t",x,x,"Tag"]}));
    return '<section class="card wf-narrow"><div class="ch"><h3>Assign contacts</h3><span class="m">'+(live?"Pause the workflow to change who it runs for":"Saved separately from the steps")+'</span></div>'
      +'<div class="k">Selected audience ('+n+')</div>'+(sel.length?sel.map(function(s){return '<div class="row"><div class="what"><div class="t" style="font-weight:500">'+esc(s[2])+'</div><div class="m">'+s[3]+'</div></div>'+(live?"":'<button class="btn sm quiet" data-act="wfpdel" data-id="'+s[0]+":"+esc(s[1])+'">Remove</button>')+'</div>'}).join(""):'<p class="m" style="margin:4px 0 0">Nobody yet. Add contacts or tags below.</p>')
      +(live?"":'<div class="rbar" style="margin:14px 0 8px"><div class="seg">'+["Contacts","Tags"].map(function(x){return '<button data-act="wfptab" data-id="'+x+'" aria-pressed="'+(wst.ppl===x)+'">'+x+'</button>'}).join("")+'</div><input class="fld" id="wfPq" placeholder="Search" aria-label="Search" value="'+esc(wst.pq)+'" style="flex:1;min-width:140px"></div>'+(wst.ppl==="Tags"?'<p class="m" style="margin:0 0 6px">Everyone who has the tag now is included. People tagged later are not added on their own yet.</p>':"")+'<div class="wf-plist" id="wfPl">'+plist(list)+'</div><div style="margin-top:12px"><button class="btn pri" style="width:100%" data-act="wfpsave">Save assignments ('+n+')</button></div>')+'</section>';
  }
  function plist(list){return list.length?list.map(function(x){return '<div class="row"><div class="what"><div class="t" style="font-weight:500">'+esc(x[1])+'</div><div class="m">'+esc(x[2])+'</div></div>'+(x[3]?'<span class="chip ok">Added</span>':'<button class="btn sm" data-act="wfpadd" data-id="'+esc(x[0])+'" aria-label="Add '+esc(x[1])+'">+ Add</button>')+'</div>'}).join(""):'<p class="m">No matches.</p>'}
  function hist(w){
    if(w._hist) return w._hist; var P=M.people(), n=Math.min(w.runs||0,6), o=[], when=["Today · 10:15 AM","Sat, Nov 21 · 8:48 AM","Thu, Nov 19 · 10:21 AM","Wed, Nov 18 · 5:30 PM","Mon, Nov 16 · 11:02 AM","Sun, Nov 15 · 9:04 AM"];
    for(var i=0;i<n;i++){var p=P[(i*3+w.id.charCodeAt(1))%P.length]; o.push({id:w.id+"r"+i,who:p,mode:"Live",when:when[i],ok:!(w.id==="w1"&&i===4),what:(p.appts&&p.appts[0]?p.appts[0].title:"Personal training")+" · "+when[i]})}
    return w._hist=o;
  }
  function condFor(s,p){var st=M.status(p), lead=/lead/i.test(String(st)), f=function(r){var v={"Name":true,"Email":!!p.email,"Phone number":!!p.phone,"Reply":false,"Upcoming booking":!!(p.appts&&p.appts.length),"Active package":!lead,"Coach":!!p.coach}[r.f]; if(v==null){var is=r.f==="Welcome SMS status"?(lead?"Not welcomed":"Accepted by SMS provider"):(lead?"Needs signature":"Current waiver signed"); v=is===r.s; return r.r==="Is"?v:!v} return r.r==="Exists"?v:!v}; return s.match==="Any"?s.rules.some(f):s.rules.every(f)}
  function histView(w){
    var H=hist(w);
    if(!H.length) return '<section class="card wf-narrow"><div class="empty"><span>No runs yet. Each time the workflow starts for someone, the run shows here.</span></div></section>';
    return '<section class="card wf-narrow"><div class="ch"><h3>Run history</h3><span class="m">Newest first</span></div>'+H.map(function(r){
      var open=wst.hrun===r.id, h='<div class="row wf-hrow"><button class="link what" style="text-align:left" data-act="wfhrun" data-id="'+r.id+'" aria-expanded="'+open+'"><div class="t">'+esc(r.who.name)+'</div><div class="m">'+r.mode+" · "+esc(r.when)+'</div></button><span class="chip '+(r.ok?"ok":"err")+'">'+(r.ok?"Completed":"Failed")+'</span></div>';
      if(open){var rows=[], failed=false; (function walk(L,off){L.forEach(function(s){ if(s.t==="if"){var y=condFor(s,r.who); rows.push([s.name,off?"Not selected":"Completed",off]); walk(y?s.yes:s.no,off); walk(y?s.no:s.yes,true)} else {var bad=!r.ok&&!off&&!failed&&s.t==="text"; if(bad) failed=true; rows.push([s.name,off?"Not selected":bad?"Failed":failed?"Not reached":"Completed",off||(failed&&!bad)])}})})(w.steps,false);
        h+='<div class="wf-tl"><div class="ch" style="margin-bottom:6px"><b>Run timeline</b><button class="btn sm quiet" data-act="wfhrun" data-id="">Close</button></div>'+(r.ok?"":'<div class="infobox wf-bad"><b>Run failed</b><div>SMS delivery is not allowed for this contact. They have not agreed to texts, or they replied STOP.</div><button class="btn sm" style="margin-top:8px" data-act="wfretry">Retry run</button></div>')+rows.map(function(x){return '<div class="row'+(x[2]?" wf-off":"")+'"><div class="what">'+esc(x[0])+'</div><span class="chip '+(x[1]==="Completed"?"ok":x[1]==="Failed"?"err":"")+'">'+x[1]+'</span></div>'}).join("")+'</div>'}
      return h}).join("")+'</section>';
  }
  M.wfb={html:function(w,view){
    if(!w.trig||!w.trig.o){w.trig=clone(MAN)} if(!w.assign) w.assign={c:[],t:[]}; if(!w.stop) w.stop={reply:false,book:false}; if(!w._state){w._state="saved"; w._saved=snap(w)} sync(w);
    if(wst.open!==w.id){wst.open=w.id; wst.undo=[]; wst.redo=[]; wst.chk=null; wst.hrun=null; wst.pick=null; wst.pq=""}
    return head(w,view)+(view==="people"?peopleView(w):view==="hist"?histView(w):view==="appr"?'<section class="card wf-narrow"><div class="empty"><span><b>No messages awaiting approval</b><br>Messages set to review before sending appear here when they are prepared.</span></div></section>':stepsView(w));
  }};

  /* step panels */
  var ed=null;
  M.panels.wfadd=function(){
    var q=(wst.sq||"").toLowerCase(), L=STEPS.filter(function(s){return !q||(s[1]+" "+s[2]).toLowerCase().indexOf(q)>=0});
    return '<div class="sph"><div><h3>Add a step</h3><div class="m">Choose what happens next.</div></div>'+M.px+'</div><div class="spb"><input class="fld" id="wfSq" placeholder="Message, wait, condition..." aria-label="Search steps" value="'+esc(wst.sq||"")+'"><div id="wfSl" style="display:grid;gap:10px">'+L.map(function(s){return '<button class="opt" data-act="wfpick" data-id="'+s[0]+'"><b>'+s[1]+'</b><span class="m">'+s[2]+'</span></button>'}).join("")+'</div></div><div class="spf"><button class="btn" data-act="pclose">Cancel</button></div>';
  };
  function chips(){return '<div class="wf-merge"><span class="m">Add a detail:</span>'+MERGE.map(function(m){return '<button class="pill" data-act="wfmerge" data-id="'+m+'">'+m.replace(/[{}]/g,"")+'</button>'}).join("")+'</div>'}
  function counter(v){var n=v.length, seg=Math.max(1,Math.ceil(n/153)); return n+" characters · about "+M.plural(seg,"SMS segment")+(v.indexOf("{")>=0?" · Before personalization":"")}
  function sendSel(s){return '<div class="field"><label for="wfSend">Send</label><select id="wfSend">'+opt(["Automatically","After human review"],s.send)+'</select></div>'}
  function grabStep(){
    if(!ed||!ed.s) return; var s=ed.s; if($("wfSn")) s.name=val("wfSn")||SNAME[s.t];
    if(s.t==="text"){ if($("wfBody")) s.body=$("wfBody").value; if($("wfInstr")) s.instr=$("wfInstr").value; s.send=val("wfSend"); if($("wfPurp")) s.purpose=val("wfPurp"); if($("wfAdv")) ed.adv=$("wfAdv").open}
    if(s.t==="email"){s.mailbox=val("wfMb"); s.sender=val("wfSd"); s.subject=val("wfSubj"); s.body=$("wfBody").value; s.send=val("wfSend")}
    if(s.t==="wait"){s.n=Math.max(0,parseInt(val("wfN"),10)||0); s.unit=val("wfUnit"); if($("wfUntil")) s.until=val("wfUntil")}
    if(s.t==="if"){ if($("wfMatch")) s.match=val("wfMatch"); s.rules.forEach(function(r,i){var f=document.querySelector('[data-wfrf="'+i+'"]'), ru=document.querySelector('[data-wfrr="'+i+'"]'), sx=document.querySelector('[data-wfrs="'+i+'"]'); if(f){ if(f.value!==r.f){r.f=f.value; r.r=FIELDS[r.f].r[0]; r.s=FIELDS[r.f].s?FIELDS[r.f].s[0]:""} else {r.r=ru.value; if(sx) r.s=sx.value}}})}
    if(s.t==="studio"){s.kind=val("wfSk"); s.send=val("wfSend")}
    if(s.t==="setter") s.goal=val("wfGoal"); if(s.t==="client") s.coach=val("wfCoach"); if(s.t==="stage") s.stage=val("wfStage"); if(s.t==="tag") s.tag=val("wfTag");
    if(s.t==="note"){s.to=val("wfTo"); s.body=$("wfBody").value}
  }
  M.panels.wfstep=function(){
    if(!ed||!ed.s) return ""; var s=ed.s, w=cur(), t=trg(w.trig.k), b='<div class="field"><label for="wfSn">Step name</label><input id="wfSn" value="'+esc(s.name)+'"></div>';
    if(s.t==="text"){
      b+='<div class="infobox"><b>SMS readiness</b><div>'+(t.assign?(w.assign.c.length+w.assign.t.length?"Based on saved assignments. Eligibility is checked again before sending.":"Assign contacts on the People tab to check SMS readiness."):"Recipients join automatically. SMS permission and current sending eligibility are checked for each recipient before sending.")+'</div></div>';
      b+='<div class="setrow" style="margin-top:0"><div><b>Let Milton write it each time</b><div class="m">Milton writes a fresh message for each person from what he knows about them.</div></div>'+sw("wfai","ai",s.ai,"Let Milton write it each time")+'</div>';
      if(s.purpose===PURPOSE[1]) b+='<div class="m">Sends one welcome per contact in this gym. STOP and SMS permission checks still apply.</div>';
      if(s.purpose===PURPOSE[2]) b+='<div class="rbar"><button class="btn sm" data-act="wfmerge" data-id="{Signing link}">Insert waiver link</button><span class="m">The private link is created when it sends. Contacts with a current signed waiver are skipped.</span></div>';
      b+=s.ai?'<div class="field"><label for="wfInstr">Tell Milton what it should say</label><textarea id="wfInstr" rows="4" placeholder="Like: check in on how their first week went and offer to book the next session">'+esc(s.instr||"")+'</textarea></div>'
        :'<div class="field"><label for="wfBody">Message</label><textarea id="wfBody" rows="5">'+esc(s.body||"")+'</textarea><div class="m" id="wfCount">'+counter(s.body||"")+'</div></div>'+chips();
      b+=sendSel(s)+'<details id="wfAdv"'+(ed.adv||s.purpose!==PURPOSE[0]?" open":"")+'><summary class="t">Advanced settings</summary><div class="field" style="margin-top:8px"><label for="wfPurp">Message purpose</label><select id="wfPurp" data-wfre="1">'+opt(PURPOSE,s.purpose)+'</select><div class="m" style="margin-top:4px">General messages send ordinary text. Welcome messages track one welcome per contact. Waiver requests prepare a private signing link.</div></div></details>';
    }
    if(s.t==="email") b+='<div class="field"><label for="wfMb">Email connection</label><select id="wfMb">'+opt([["","Choose a connected mailbox"],"hello@"+G.site],s.mailbox)+'</select></div><div class="field"><label for="wfSd">Verified sender</label><select id="wfSd">'+opt([["","Choose a verified sender"],G.name+" <hello@"+G.site+">"],s.sender)+'</select><div class="m" style="margin-top:4px">Connect or verify one in <button class="link" data-act="wfemailset">CRM Settings</button>.</div></div><div class="field"><label for="wfSubj">Subject</label><input id="wfSubj" value="'+esc(s.subject||"")+'"></div><div class="field"><label for="wfBody">Email</label><textarea id="wfBody" rows="7">'+esc(s.body||"")+'</textarea></div>'+chips()+sendSel(s);
    if(s.t==="wait") b+='<div class="field"><label>Wait</label><div class="seg">'+[["for","For a set time"],["until","Until something happens"]].map(function(x){return '<button data-act="wfmode" data-id="'+x[0]+'" aria-pressed="'+(s.mode===x[0])+'">'+x[1]+'</button>'}).join("")+'</div></div>'+(s.mode==="until"?'<div class="field"><label for="wfUntil">Until</label><select id="wfUntil">'+opt(UNTIL,s.until)+'</select></div>':"")+'<div class="two"><div class="field"><label for="wfN">'+(s.mode==="until"?"But no longer than":"Wait")+'</label><input id="wfN" inputmode="numeric" value="'+s.n+'"></div><div class="field"><label for="wfUnit">Unit</label><select id="wfUnit">'+opt(["Minutes","Hours","Days"],s.unit)+'</select></div></div>';
    if(s.t==="if") b+=(s.rules.length>1?'<div class="field"><label for="wfMatch">Match rules</label><select id="wfMatch">'+opt([["All","All rules (AND)"],["Any","Any rule (OR)"]],s.match)+'</select></div>':"")+s.rules.map(function(r,i){var F=FIELDS[r.f]; return '<fieldset class="wf-rule"><legend>Rule '+(i+1)+'</legend><div class="two"><div class="field"><label>Recipient field</label><select data-wfrf="'+i+'" data-wfre="1">'+opt(Object.keys(FIELDS),r.f)+'</select></div><div class="field"><label>Rule</label><select data-wfrr="'+i+'">'+opt(F.r,r.r)+'</select></div></div>'+(F.s?'<div class="field"><label>Status</label><select data-wfrs="'+i+'">'+opt(F.s,r.s)+'</select></div>':"")+(s.rules.length>1?'<div><button class="btn sm quiet rm" data-act="wfrdel" data-id="'+i+'">Remove rule</button></div>':"")+'</fieldset>'}).join("")+'<div><button class="btn sm" data-act="wfradd">Add rule</button></div><div class="m">The workflow splits into a Yes side and a No side. Steps after both sides run for everyone.</div>';
    if(s.t==="setter") b+='<div class="field"><label for="wfGoal">What Milton is trying to get them to do</label><select id="wfGoal">'+opt(GOALS,s.goal)+'</select></div><div class="m">Milton runs the whole conversation by text. If they ask for something outside what he can do, he says a team member will be in touch and tells your team.</div>';
    if(s.t==="studio") b+='<div class="field"><label for="wfSk">What Milton makes</label><select id="wfSk">'+opt(["Progress report","Progress story","Guide"],s.kind)+'</select></div>'+sendSel(s)+'<div class="m">Milton builds it from the person\'s own data when the workflow reaches this step. With review on, it lands in Studio under Ready for review and nothing goes out until you approve it.</div>';
    if(s.t==="invite") b+='<div class="m">Sends your member app invite by text and email. Anyone who already has the app is skipped.</div>';
    if(s.t==="client") b+='<div class="field"><label for="wfCoach">Coach</label><select id="wfCoach">'+opt(["Decide later"].concat(DB.TEAM.map(function(x){return x.name})),s.coach)+'</select></div><div class="m">Adds them to Clients on the record they already have. Nothing is duplicated.</div>';
    if(s.t==="stage") b+='<div class="field"><label for="wfStage">Move them to</label><select id="wfStage">'+opt(PSTAGES.concat(DB.stages),s.stage)+'</select></div>';
    if(s.t==="tag") b+='<div class="field"><label for="wfTag">Tag</label><input id="wfTag" value="'+esc(s.tag||"")+'" placeholder="Like: intro offer"></div>';
    if(s.t==="note") b+='<div class="field"><label for="wfTo">Who should see it</label><select id="wfTo">'+opt(["Their coach","Front desk","Managers and admins"],s.to)+'</select></div><div class="field"><label for="wfBody">Note</label><textarea id="wfBody" rows="4" placeholder="Like: call them if there is still no reply">'+esc(s.body||"")+'</textarea></div>';
    return '<div class="sph"><div><h3>'+SNAME[s.t]+'</h3><div class="m">'+(ed.isNew?"New step":"Step in "+esc(w.name))+'</div></div>'+M.px+'</div><div class="spb">'+b+(ed.err?'<div class="m" role="alert" style="color:var(--err);font-weight:600">'+ed.err+'</div>':"")+'</div><div class="spf"><button class="btn pri" data-act="wfsave">'+(ed.isNew?"Add step":"Done")+'</button><button class="btn" data-act="pclose">Cancel</button>'+(ed.isNew?"":'<button class="btn quiet" style="margin-left:auto" data-act="wfcopy">Duplicate</button><button class="btn quiet rm" data-act="wfdel">Delete</button>')+'</div>';
  };
  A.wfadd=function(id){grabHead(); wst.sq=""; ed={at:id,isNew:true,s:null}; M.openPanel("wfadd")};
  A.wfpick=function(t){ed.s=blank(t); ed.err=""; M.openPanel("wfstep")};
  A.wfedit=function(id){grabHead(); var p=at(cur(),id); ed={at:id,isNew:false,s:clone(p.L[p.i]),err:""}; M.openPanel("wfstep")};
  A.wfai=function(){grabStep(); ed.s.ai=!ed.s.ai; M.renderPanel()};
  A.wfmode=function(m){grabStep(); ed.s.mode=m; M.renderPanel()};
  A.wfradd=function(){grabStep(); ed.s.rules.push({f:"Phone number",r:"Exists",s:""}); M.renderPanel()};
  A.wfrdel=function(i){grabStep(); ed.s.rules.splice(+i,1); M.renderPanel()};
  A.wfemailset=function(){M.closePanel(); M.go({page:"crm",tab:"settings"})};
  A.wfmerge=function(m){var e=$("wfBody"); if(!e) return; var a=e.selectionStart==null?e.value.length:e.selectionStart; e.value=e.value.slice(0,a)+m+e.value.slice(e.selectionEnd==null?a:e.selectionEnd); e.focus(); e.selectionStart=e.selectionEnd=a+m.length; if($("wfCount")) $("wfCount").textContent=counter(e.value)};
  A.wfsave=function(){
    grabStep(); var s=ed.s, e="";
    if(s.t==="text"&&!s.ai&&!s.body.trim()) e="Write the message first."; if(s.t==="text"&&s.ai&&!s.instr.trim()) e="Tell Milton what it should say.";
    if(s.t==="email"&&!s.subject) e="Give the email a subject."; if(s.t==="tag"&&!s.tag) e="Type the tag."; if(s.t==="note"&&!s.body.trim()) e="Write the note first.";
    if(e){ed.err=e; return M.renderPanel()}
    var w=cur(), p=at(w,ed.at); touch(w); if(ed.isNew) p.L.splice(p.i,0,s); else p.L[p.i]=s; ed=null; M.closePanel(); reW();
  };
  A.wfdel=function(){var w=cur(), p=at(w,ed.at), s=p.L[p.i]; M.confirm({title:"Delete this step?",body:'Remove "'+s.name+'" from this draft?'+(s.t==="if"&&count(s.yes)+count(s.no)?" Its "+M.plural(count(s.yes)+count(s.no),"step")+" on the Yes and No sides go with it.":"")+" You can undo this before leaving the editor.",no:"Cancel",yes:"Delete step",run:function(){touch(w); p.L.splice(p.i,1); ed=null; M.closePanel(); reW()}})};
  A.wfcopy=function(){var w=cur(), p=at(w,ed.at); touch(w); p.L.splice(p.i+1,0,clone(p.L[p.i])); ed=null; M.closePanel(); reW("Step duplicated.")};
  A.wfmove=function(id){grabHead(); var a=id.split("|"), w=cur(), L=getList(w,a[0]), i=+a[1], j=i+(+a[2]); if(j<0||j>=L.length) return; touch(w); var s=L.splice(i,1)[0]; L.splice(j,0,s); M.render()};
  A.wfundo=function(){var w=cur(); if(!wst.undo.length) return; wst.redo.push(JSON.stringify(w.steps)); w.steps=JSON.parse(wst.undo.pop()); w._state="dirty"; M.render()};
  A.wfredo=function(){var w=cur(); if(!wst.redo.length) return; wst.undo.push(JSON.stringify(w.steps)); w.steps=JSON.parse(wst.redo.pop()); w._state="dirty"; M.render()};

  /* trigger panel */
  var tg=null;
  function chipset(key,all,sel,ph){var q=(tg.q[key]||"").toLowerCase(); return '<input class="fld" data-wftq="'+key+'" placeholder="'+ph+'" aria-label="'+ph+'" value="'+esc(tg.q[key]||"")+'"><div class="wf-chips">'+all.filter(function(x){return !q||x.toLowerCase().indexOf(q)>=0}).map(function(x){var on=sel.indexOf(x)>=0; return '<button class="wf-chip" aria-pressed="'+on+'" data-act="wftchip" data-id="'+key+"|"+esc(x)+'">'+(on?"&#10003; ":"")+esc(x)+'</button>'}).join("")+(all.length?"":'<span class="m">None yet.</span>')+'</div>'}
  M.panels.wftrig=function(){
    var w=cur(); if(!tg) tg={k:w.trig.k,o:clone(w.trig.o),reply:w.stop.reply,book:w.stop.book,pick:false,q:{},sq:""};
    if(tg.pick){var q=tg.sq.toLowerCase(), g="", h="";
      TR.filter(function(t){return !q||(t.k+" "+t.d).toLowerCase().indexOf(q)>=0}).forEach(function(t){ if(t.g!==g){g=t.g; h+='<div class="k" style="margin-top:6px">'+g+'</div>'} h+='<button class="opt" aria-pressed="'+(t.k===tg.k)+'" data-act="wftpick" data-id="'+esc(t.k)+'"><b>'+t.k+'</b><span class="m">'+t.d+'</span></button>'});
      return '<div class="sph"><div><h3>What starts it</h3><div class="m">'+esc(w.name)+'</div></div>'+M.px+'</div><div class="spb"><input class="fld" id="wfTsq" placeholder="Search triggers" aria-label="Search triggers" value="'+esc(tg.sq)+'"><div id="wfTl" style="display:grid;gap:10px">'+h+'</div></div><div class="spf"><button class="btn" data-act="wftback">Back</button></div>'}
    var t=trg(tg.k), o=tg.o, b='<div class="field"><label>Starts when</label><button class="opt" data-act="wftchange"><b>'+t.k+'</b><span class="m">'+t.d+'. Tap to change.</span></button></div>';
    shown(t,o).forEach(function(f){var k=f[0], id="wfT_"+k;
      if(f[2]==="num") b+='<div class="field"><label for="'+id+'">'+f[1]+'</label><input id="'+id+'" inputmode="numeric" style="max-width:140px" value="'+esc(o[k])+'"></div>';
      if(f[2]==="sel") b+='<div class="field"><label for="'+id+'">'+f[1]+'</label><select id="'+id+'" data-wftre="1">'+opt(typeof f[4]==="function"?f[4]():f[4],o[k])+'</select></div>';
      if(f[2]==="time") b+='<div class="field"><label for="'+id+'">'+f[1]+'</label><input id="'+id+'" type="time" style="max-width:160px" value="'+esc(o[k])+'"></div>';
      if(f[2]==="date") b+='<div class="field"><label for="'+id+'">'+f[1]+'</label><input id="'+id+'" type="date" style="max-width:200px" value="'+esc(o[k])+'"></div>';
      if(f[2]==="chk") b+='<div class="field"><label>'+f[1]+'</label><div class="wf-chips">'+f[4].map(function(x){var on=o[k].indexOf(x)>=0; return '<button class="wf-chip" aria-pressed="'+on+'" data-act="wftchip" data-id="'+k+"|"+esc(x)+'">'+(on?"&#10003; ":"")+x+'</button>'}).join("")+'</div></div>';
      if(f[2]==="off") b+='<div class="field"><label>'+f[1]+'</label>'+chipset(k,offerings(f[4]),o[k],"Search offerings")+'<div class="m" style="margin-top:4px">No offering selected means all offerings of this type.</div></div>';
      if(f[2]==="tags") b+='<div class="field"><label>'+f[1]+'</label>'+chipset(k,allTags(),o[k],"Search tags")+'</div>';
    });
    if(t.help) b+='<div class="infobox">'+esc(t.help)+'</div>';
    b+='<div class="rules3" style="grid-template-columns:1fr"><div><div class="k">Runs for</div><div class="t">'+esc(t.r)+'</div>'+(t.assign?'<div class="m">Assign contacts or tags on the People tab.</div>':"")+'</div></div>';
    b+='<div class="k" style="margin-top:6px">Stop early</div><div class="setrow" style="margin-top:0"><div><b>When they reply</b><div class="m">The conversation moves to your Inbox and the rest is skipped.</div></div>'+sw("wftsw","reply",tg.reply,"Stop when they reply")+'</div><div class="setrow"><div><b>When they book</b><div class="m">Good for follow-up that is trying to get a booking.</div></div>'+sw("wftsw","book",tg.book,"Stop when they book")+'</div>';
    return '<div class="sph"><div><h3>What starts it</h3><div class="m">'+esc(w.name)+'</div></div>'+M.px+'</div><div class="spb">'+b+'</div><div class="spf"><button class="btn pri" data-act="wftsave">Save</button><button class="btn" data-act="pclose">Cancel</button></div>';
  };
  function grabT(){if(!tg||tg.pick) return; var t=trg(tg.k); shown(t,tg.o).forEach(function(f){var e=$("wfT_"+f[0]); if(!e) return; tg.o[f[0]]=f[2]==="num"?Math.max(0,parseInt(e.value,10)||0):e.value})}
  A.wftchange=function(){grabT(); tg.pick=true; tg.sq=""; M.renderPanel()};
  A.wftback=function(){tg.pick=false; M.renderPanel()};
  A.wftpick=function(k){if(k!==tg.k){tg.k=k; tg.o=defaults(trg(k)); tg.q={}} tg.pick=false; M.renderPanel()};
  A.wftchip=function(id){grabT(); var a=id.split("|"), L=tg.o[a[0]], i=L.indexOf(a[1]); if(i>=0) L.splice(i,1); else L.push(a[1]); M.renderPanel()};
  A.wftsw=function(k){grabT(); tg[k]=!tg[k]; M.renderPanel()};
  A.wftsave=function(){grabT(); var w=cur(); w.trig={k:tg.k,o:tg.o}; w.stop={reply:tg.reply,book:tg.book}; w._state="dirty"; wst.chk=null; tg=null; M.closePanel(); reW()};

  /* people, history, header actions */
  A.wfptab=function(x){wst.ppl=x; wst.pq=""; M.render()};
  A.wfpadd=function(id){var k=wst.ppl==="Contacts"?"c":"t"; if(wst.pick[k].indexOf(id)<0) wst.pick[k].push(id); M.render()};
  A.wfpdel=function(id){var a=id.split(":"), L=wst.pick[a[0]], i=L.indexOf(a.slice(1).join(":")); if(i>=0) L.splice(i,1); M.render()};
  A.wfpsave=function(){var w=cur(); w.assign={c:wst.pick.c.slice(),t:wst.pick.t.slice()}; wst.chk=null; sync(w); reW("Assignments saved.")};
  A.wfhrun=function(id){wst.hrun=wst.hrun===id?null:(id||null); M.render()};
  A.wfretry=function(){M.toast("In the live app this runs the failed step again for this contact. Nothing was sent here.")};
  A.wfsavedraft=function(){grabHead(); var w=cur(); w._state="saved"; w._saved=snap(w); sync(w); reW("Draft saved.")};
  A.wflive=function(){grabHead(); var w=cur(), iss=issues(w), t=trg(w.trig.k); if(iss.length){wst.chk="why"; M.render(); window.scrollTo(0,0); return}
    w._state="saved"; w._saved=snap(w); wst.chk="run"; M.render(); window.scrollTo(0,0);
    setTimeout(function(){ if(cur()!==w) return; var n=t.assign?w.assign.c.length+M.people().filter(function(p){return w.assign.t.some(function(x){return (p.tags||[]).indexOf(x)>=0})&&w.assign.c.indexOf(p.id)<0}).length:null;
      if(t.assign&&!n){wst.chk="none"; return M.render()} w.status="Live"; wst.chk={ok:t.assign?n+" of "+n+" eligible":"checked for each person as they join"}; reW(w.name+" is live.")},900)};
  var wops=M.wfOps={
    /* Stops sending. People part way through wait where they are until it is live again. No message is sent. */
    pause:function(w){if(w.status!=="Live") throw new Error(w.name+" is not live, so there is nothing to pause."); w.status="Paused"; return w.name+" is paused. Nothing sends until it is live again."},
    /* Stops it for good and moves it to Archived. Nobody part way through gets more steps. It can be duplicated later. */
    archive:function(w){if(w.status==="Archived") throw new Error(w.name+" is already archived."); w.status="Archived"; w._state="saved"; return w.name+" is archived."}
  };
  A.wfpause=function(){var w=cur(), m; try{m=wops.pause(w)}catch(e){return M.toast(e.message)} wst.chk=null; reW(m)};
  A.wfarch=function(){var w=cur(); M.confirm({title:"Archive "+w.name+"?",body:(w.status==="Live"?"It stops for everyone part way through. ":"")+"It moves to Archived and stops running. You can duplicate it later to use it again.",no:"Keep it",yes:"Archive",run:function(){reW(wops.archive(w))}})};
  A.wfdup=function(){grabHead(); var w=cur(), c=clone(w); delete c._hist; c.id="w"+Date.now(); c.name=w.name+" copy"; c.status="Draft"; c.runs=0; c.assign={c:[],t:[]}; c._state="saved"; c._saved=snap(c); wfs().unshift(c); wst.open=null; A.workflow(c.id); M.toast("Duplicated as a draft, without its assignments.")};
  A.wfback=function(){grabHead(); var w=cur(); if(w&&w._state!=="saved"&&w.status!=="Live"&&w.status!=="Archived") return M.confirm({title:"Discard unsaved workflow changes?",body:"Your workflow details, steps and unsaved contact or tag assignments will be lost if you leave.",no:"Stay",yes:"Discard changes",run:function(){ if(w._state==="new"||!w._saved) wfs().splice(wfs().indexOf(w),1); else {var s=JSON.parse(w._saved); w.name=s.name; w.trig=s.trig; w.stop=s.stop; w.steps=s.steps; w.assign=s.assign; w._state="saved"; sync(w)} wst.open=null; A.workflow("")}}); wst.open=null; A.workflow("")};
  /* For Milton: a draft workflow built from plain step descriptions, in the builder's own format. */
  var TRIG={manual:MAN,session_booked:SB,purchase_completed:{k:"Purchase completed",o:{}}};
  M.workflowSummary=function(w){return {trigger:w.trig?w.trig.k:null,starts:w.starts,people:w.people,steps:(w.steps||[]).map(function(s){return {kind:s.t,name:s.name,detail:sum(s)}})}};
  M.newWorkflow=function(name,desc,trigger,steps){
    var list=steps.map(function(s){
      if(s.kind==="wait") return W(s.days||1,"Days");
      if(s.kind==="email") return Object.assign(blank("email"),{name:s.name||"Email",subject:s.subject||"A note from "+G.name,body:s.body||""});
      return T(s.body||"",{name:s.name||"Text"});
    });
    var w=newWf(name,desc,TRIG[trigger]||MAN,list,"saved"); w._saved=snap(w); return w;
  };
  function newWf(name,desc,trig,steps,state){var w={id:"w"+Date.now(),name:name,desc:desc||"",status:"Draft",runs:0,trig:clone(trig||MAN),stop:{reply:false,book:false},assign:{c:[],t:[]},steps:steps||[],_state:state||"new"}; sync(w); wfs().unshift(w); return w}
  function openWf(w){wst.open=null; M.go({page:"crm",tab:"workflows"}); A.workflow(w.id)}
  A.wfnew=function(){openWf(newWf("Untitled workflow",""))};
  M.panels.wftpl=function(pn){
    var i=+pn.arg, t=DB.templates[i], d=TPL[i](), tr=trg(d[0].k), rows="";
    (function walk(L,ind){L.forEach(function(s){rows+='<div class="row" style="padding-left:'+(ind*16)+'px"><div class="what"><div class="k">'+SNAME[s.t]+'</div><div class="t">'+esc(s.name)+'</div><div class="m">'+esc(sum(s))+'</div></div></div>'; if(s.t==="if"){rows+='<div class="k" style="padding-left:'+((ind+1)*16)+'px;margin-top:6px">Yes</div>'; walk(s.yes,ind+1); if(!s.yes.length) rows+='<div class="m" style="padding-left:'+((ind+1)*16)+'px">Nothing</div>'; rows+='<div class="k" style="padding-left:'+((ind+1)*16)+'px;margin-top:6px">No</div>'; walk(s.no,ind+1); if(!s.no.length) rows+='<div class="m" style="padding-left:'+((ind+1)*16)+'px">Nothing</div>'}})})(d[1],0);
    return '<div class="sph"><div><h3>'+esc(t[0])+'</h3><div class="m">'+esc(t[1])+'</div></div>'+M.px+'</div><div class="spb"><div><span class="pillnode">Starts: '+esc(tr.s(d[0].o))+'</span></div>'+rows+'<div class="m">Review the steps and assign contacts before making it live. Recipient eligibility is checked separately.</div></div><div class="spf"><button class="btn pri" data-act="wfmake" data-id="'+i+'">Use template</button><button class="btn" data-act="pclose">Cancel</button></div>';
  };
  A.wfmake=function(i){var t=DB.templates[+i], d=TPL[+i](); M.closePanel(); var w=newWf(t[0],t[1],d[0],d[1],"dirty"); openWf(w); M.toast("Nothing is saved until you choose Save draft.")};
  function merged(t,p){var a=(p.appts||[])[0]; return String(t||"").replace(/\{First name\}/g,p.first).replace(/\{Gym name\}/g,G.name).replace(/\{Session\}/g,a?a.title:"Personal training").replace(/\{Day\}/g,"Tuesday").replace(/\{Time\}/g,a?a.time:"4:00 PM").replace(/\{Booking link\}/g,G.site+"/book").replace(/\{Signing link\}/g,G.site+"/sign/"+p.first.toLowerCase()).replace(/\{App link\}/g,G.site+"/app").replace(/\{Coach\}/g,p.coach||"your coach")}
  M.panels.wfrun=function(){
    var w=cur(), P=M.people().slice(0,12), p=M.person(wst.run)||P[0], rows=[], t="Right away";
    (function walk(L){L.forEach(function(s){
      if(s.t==="wait"){t="After "+low(waitTxt(s)).replace(/^wait /,"").replace(/ before the next step$/,""); rows.push(["Wait",waitTxt(s),"w"]); return}
      if(s.t==="if"){var y=condFor(s,p); rows.push(["Condition",condTxt(s)+"? "+(y?"Yes":"No")+" for "+p.first+".","c"]); walk(y?s.yes:s.no); return}
      rows.push([SNAME[s.t]+(s.send==="After human review"?" · waits for your approval":""),s.t==="text"?(s.ai?"Milton writes this one for "+p.first+": "+s.instr:merged(s.body,p)):(s.t==="email"?merged(s.subject,p)+". "+merged(s.body,p):merged(sum(s),p)),s.t==="text"?"t":"", t]);
    })})(w.steps);
    return '<div class="sph"><div><h3>Preview a run</h3><div class="m">What one person would get. Nothing is sent.</div></div>'+M.px+'</div><div class="spb"><div class="field"><label for="wfRunWho">Preview for</label><select id="wfRunWho" data-wfrun="1">'+opt(P.map(function(x){return [x.id,x.name]}),p.id)+'</select></div><div class="wf-run"><div class="wf-rs"><span class="k">Start</span><div>'+esc(starts(w))+'</div></div>'+rows.map(function(r){return '<div class="wf-rs '+(r[2]||"")+'"><span class="k">'+r[0]+(r[3]?" · "+esc(r[3]):"")+'</span><div'+(r[2]==="t"?' class="wf-bub"':"")+'>'+esc(r[1])+'</div></div>'}).join("")+(rows.length?"":'<div class="m">No steps yet.</div>')+'<div class="wf-rs"><span class="k">End</span><div class="m">'+esc(ends(w))+'</div></div></div></div><div class="spf"><button class="btn" data-act="wftest">Send the texts to my phone</button><button class="btn" data-act="pclose">Close</button></div>';
  };
  A.wftest=function(){M.toast("In the live app the texts in this run go to your own phone. Nothing was sent here.")};
  M.changes.push(function(el){var d=el.dataset||{};
    if(d.wftre){grabT(); return M.renderPanel()}
    if(d.wfre){grabStep(); return M.renderPanel()}
    if(d.wfrun){wst.run=el.value; return M.renderPanel()}
    if(el.id==="wfName"){grabHead(); return M.render()}
  });
  M.inputs.push(function(el){var d=el.dataset||{};
    if(el.id==="wfBody"&&$("wfCount")) $("wfCount").textContent=counter(el.value);
    if(el.id==="wfPq"){wst.pq=el.value; var w=cur(), pk=wst.pick, q=wst.pq.toLowerCase(); $("wfPl").innerHTML=plist(wst.ppl==="Contacts"?M.people().filter(function(p){return !q||p.name.toLowerCase().indexOf(q)>=0}).map(function(p){return [p.id,p.name,M.status(p),pk.c.indexOf(p.id)>=0]}):allTags().filter(function(x){return !q||x.toLowerCase().indexOf(q)>=0}).map(function(x){return [x,x,"Tag",pk.t.indexOf(x)>=0]}))}
    if(el.id==="wfSq"){wst.sq=el.value; var q2=wst.sq.toLowerCase(); $("wfSl").innerHTML=STEPS.filter(function(s){return !q2||(s[1]+" "+s[2]).toLowerCase().indexOf(q2)>=0}).map(function(s){return '<button class="opt" data-act="wfpick" data-id="'+s[0]+'"><b>'+s[1]+'</b><span class="m">'+s[2]+'</span></button>'}).join("")||'<span class="m">No step matches.</span>'}
    if(el.id==="wfTsq"&&tg){tg.sq=el.value; var pos=el.selectionStart; M.renderPanel(); var e=$("wfTsq"); e.focus(); e.selectionStart=e.selectionEnd=pos}
    if(d.wftq&&tg){grabT(); tg.q[d.wftq]=el.value; var k=d.wftq, p2=el.selectionStart; M.renderPanel(); var e2=document.querySelector('[data-wftq="'+k+'"]'); if(e2){e2.focus(); e2.selectionStart=e2.selectionEnd=p2}}
  });
  var _pclose=A.pclose; A.pclose=function(a,b,c){tg=null; _pclose(a,b,c)};

  /* ================= Funnels ================= */
  var QT=["Short answer","Long answer","Choice"];
  var ORD=["Pay, then book","Book, then pay","Book without payment"];
  var CONSENT="I agree to receive text messages about my enquiry and membership. Message and data rates may apply. Reply STOP to opt out at any time.";
  var FSUB={Form:"How this form is doing and whether people are filling it in.","Website connection":"How this connection is wired up and whether leads are coming through.","Meta lead ads":"Whether your Facebook Page is connected and leads are coming through.","Offer link":"How this offer is set up and whether people are buying.",Studio:"Leads who came in through the share pages of your reports and stories."};
  var FNEW={
    "Website connection":["Send the forms on your own website into Milton","The forms on your own website send their leads into Milton. Name it so your team knows which site it is.","For example, riverbendfit.com"],
    "Offer link":["One link to pay and book, in the order you choose","One link where someone pays and books, in the order you choose. Name it so your team knows which offer it is.","For example, 3 recovery rooms for $99"],
    "Form":["Your own questions, as a link, a QR code or on your website","Ask your own questions and share them as a link or QR code. Name it so your team knows what it is for.","For example, Spring trial week"],
    "Meta lead ads":["Leads from your Facebook and Instagram lead forms","Leads from your Facebook and Instagram lead forms land in your contacts with their answers. Name it so your team knows which Page it is for.","For example, Riverbend Facebook Page"]};
  M.fnewTypes=Object.keys(FNEW).map(function(k){return [k,FNEW[k][0]]});
  function tok(){return "form_"+Math.random().toString(36).slice(2,10)+Math.random().toString(36).slice(2,6)}
  function slug(n){return String(n).toLowerCase().replace(/&/g,"and").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}
  function items(){return DB.ITEMS.filter(function(i){return i.status!=="Archived"&&i.status!=="Draft"&&i.kind!=="product"})}
  function itemName(i){return i?(i.kind==="membership"||i.pass||i.sub1?i.name:i.svc+", "+i.name)+", "+(i.free||!+i.price?"Free":M.fm(+i.price)):"No package chosen"}
  function fconv(f){
    if(f._b) return f; f._b=true;
    f.wfid=f.wfid||(f.type==="Offer link"?"w1":"setter"); f.goal=f.goal||GOALS[1];
    if(f.type==="Form"){f.questions=(f.questions||[]).map(function(q){return Array.isArray(q)?{q:q[0],t:q[1]==="Choice"?"Choice":q[1]==="Long answer"?"Long answer":"Short answer",req:q[2],opts:q[1]==="Choice"?["Weekday mornings","Weekday evenings","Weekends"]:["",""]}:q}); f.title=f.title||f.name; f.end=f.end||{mode:"msg",msg:f.thanks||"Thank you! We have received your details and will be in touch shortly.",url:""}; f.consent=f.consent||CONSENT; f.tok=f.tok||tok()}
    if(f.type==="Offer link"){f.pkg=f.pkg||"rr4"; f.order=f.order||ORD[0]; f.hold=f.hold||15; f.sign=f.sign||"Everything they are missing"; f.signWhen=f.signWhen||"After booking"; f.head=f.head||f.name; f.blurb=f.blurb||"Three recovery room sessions to use in your first month."; f.btn=f.btn||"Get started"; f.slug=f.slug||"offer/"+slug(f.name)}
    if(f.type==="Website connection"){if(f.connected==null) f.connected=f.leads>0; if(f.key==null) f.key="active"}
    if(f.type==="Meta lead ads"){if(f.connected==null) f.connected=false; f.page=f.page||G.name; f.forms=f.forms||[{n:"Spring intro offer",on:true},{n:"Free week pass",on:false}]}
    return f;
  }
  function nextStr(f){if(f.wfid==="none") return "Nothing yet"; if(f.wfid==="setter") return "Milton texts the lead. Goal: "+low(f.goal); var w=wf(f.wfid); return (f.type==="Offer link"?f.order+". Then the ":"The ")+(w?w.name:"chosen")+" workflow"}
  var pv={step:0}, fst={cons:false};
  function curF(){return fconv(fn(M.crmState().fid))}
  function grabF(){
    var f=fn(M.crmState().fid); if(!f||!$("fbName")) return; f.name=val("fbName")||f.name;
    if(f.type==="Form"){f.title=val("fbTitle"); if($("fbMsg")) f.end.msg=$("fbMsg").value; if($("fbUrl")) f.end.url=val("fbUrl"); if($("fbCons")) f.consent=$("fbCons").value;
      f.questions.forEach(function(q,i){var a=document.querySelector('[data-fbq="'+i+'"]'), b=document.querySelector('[data-fbt="'+i+'"]'); if(a) q.q=a.value; if(b) q.t=b.value; document.querySelectorAll('[data-fbo^="'+i+'|"]').forEach(function(e){q.opts[+e.dataset.fbo.split("|")[1]]=e.value})})}
    if(f.type==="Offer link"){f.head=val("fbHead"); f.blurb=val("fbBlurb"); f.btn=val("fbBtn")||"Get started"; f.pkg=val("fbPkg"); if($("fbHold")) f.hold=+val("fbHold")||f.hold; f.sign=val("fbSign"); if($("fbSignWhen")) f.signWhen=val("fbSignWhen"); if($("fbSlug")) f.slug=val("fbSlug").split("/").map(slug).filter(Boolean).join("/")||f.slug}
    if(f.type==="Meta lead ads"&&$("fbPage")) f.page=val("fbPage");
    if($("fbNext")) f.wfid=val("fbNext"); if($("fbGoal")) f.goal=val("fbGoal");
    f.next=nextStr(f);
  }
  function reF(msg){M.render(); if(msg) M.toast(msg)}
  function qr(sz){var h='<svg viewBox="0 0 21 21" width="'+sz+'" height="'+sz+'" role="img" aria-label="QR code">',seed=11;function r(){seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff}
    function eye(x,y){return '<rect x="'+x+'" y="'+y+'" width="7" height="7" fill="#0D2B40"/><rect x="'+(x+1)+'" y="'+(y+1)+'" width="5" height="5" fill="#fff"/><rect x="'+(x+2)+'" y="'+(y+2)+'" width="3" height="3" fill="#0D2B40"/>'}
    for(var y=0;y<21;y++)for(var x=0;x<21;x++){var e=(x<8&&y<8)||(x>12&&y<8)||(x<8&&y>12); if(!e&&r()>.52)h+='<rect x="'+x+'" y="'+y+'" width="1" height="1" fill="#0D2B40"/>'} return h+eye(0,0)+eye(14,0)+eye(0,14)+'</svg>'}
  function copyRow(text,label){return '<div class="rbar fb-copy"><span class="code">'+esc(text)+'</span><button class="btn sm" data-act="copy" data-id="'+esc(text)+'">'+(label||"Copy")+'</button></div>'}
  function statusCard(f){
    var a, b;
    if(f.type==="Form"){a=f.live?"Taking submissions":"Off"; b=f.live?"This form is live. Everyone who fills it in lands in your contacts with this funnel as their source.":"This form is off. Its link does not work until you turn it back on."}
    else if(f.type==="Website connection"){a=!f.live?"Off":f.connected?"Connected":"Not connected"; b=!f.live?"This connection is off. Leads sent from your website are not accepted until you turn it back on.":f.connected?"This funnel has an active key and has received at least one lead.":"The key is active but no lead has come through yet. Send a test lead to check the wiring."}
    else if(f.type==="Studio"){a=f.live?"Taking leads":"Off"; b=f.live?"Every shared report and story has a form. Anyone who fills it in lands in your contacts with Studio as their source.":"The forms on your share pages are hidden until you turn this back on."}
    else if(f.type==="Offer link"){a=f.live?"Taking orders":"Off"; b=f.live?"This link is live. Everyone who buys lands in your contacts with this funnel as their source.":"This link is off. It does not work until you turn it back on."}
    else {a=!f.connected?"Not connected":f.live?"Taking leads":"Off"; b=!f.connected?"Connect your Facebook Page to start.":f.live?"Leads from the lead forms you switched on land in your contacts within a minute.":"This funnel is off. New leads are not brought in until you turn it back on."}
    return '<section class="card"><div class="k">Status</div><div class="t" style="font-size:17px;margin-top:4px">'+a+'</div><p class="m" style="margin:4px 0 10px">'+b+'</p><div class="k">Last lead</div><div>'+esc(f.last)+'</div></section>';
  }
  function resultsCard(f,range){
    var k={"7 days":.3,"30 days":1,"90 days":2.6,"All time":4}[range]||1, n=function(v){return Math.round((v||0)*k)}, L=n(f.leads), pct=function(v){return L?'<span class="m">'+Math.round(n(v)/L*100)+"% of leads</span>":""};
    var tiles=f.opened!==null?[["Opened",n(f.opened),""],[f.type==="Offer link"?"Bought":"Filled in",L,""],["Booked",n(f.booked),""],["Came in",n(f.showed),""],["Joined",n(f.joined),""]]:[["Leads",L,""],["Booked",n(f.booked),pct(f.booked)],["Came in",n(f.showed),pct(f.showed)],["Joined",n(f.joined),pct(f.joined)]];
    return '<section class="card"><div class="k">Results</div><div class="seg" style="margin:8px 0 10px">'+["7 days","30 days","90 days","All time"].map(function(r){return '<button data-act="frange" data-id="'+r+'" aria-pressed="'+(range===r)+'">'+r+'</button>'}).join("")+'</div><div class="statgrid fb-stats">'+tiles.map(function(x){return '<div><span class="k">'+x[0]+'</span><b class="num">'+x[1]+'</b>'+x[2]+'</div>'}).join("")+'</div>'+(L?"":'<p class="m" style="margin:8px 0 0">No leads yet in this period.</p>')+'<p class="m" style="margin:8px 0 0">Booked and Came in follow each person\'s step on the Pipeline. Joined counts people who became clients after coming through this funnel. Someone who was already a client counts as a lead only.</p></section>';
  }
  function nextCard(f){
    var W=wfs().filter(function(w){return w.status!=="Archived"}), w=wf(f.wfid);
    return '<section class="card"><div class="k">What happens next</div><div class="field" style="margin-top:8px"><label for="fbNext">When someone comes in this way</label><select id="fbNext" data-fbs="1">'+opt([["setter","Milton's appointment setter texts them"]].concat(W.map(function(x){return [x.id,"Workflow: "+x.name+(x.status==="Live"?"":" ("+low(x.status)+")")]})).concat([["none","Nothing yet"]]),f.wfid)+'</select></div>'
      +(f.wfid==="setter"?'<div class="field" style="margin-top:10px"><label for="fbGoal">What Milton is trying to get them to do</label><select id="fbGoal" data-fbs="1">'+opt(GOALS,f.goal)+'</select></div><p class="m" style="margin:8px 0 0">Milton texts within a minute and runs the whole conversation. When it is outside what he can do, he says a team member will be in touch.</p>':"")
      +(f.wfid==="none"?'<p class="m" style="margin:8px 0 0">New leads simply land in your contacts, marked with this funnel as their source.</p>':"")
      +(w&&w.status!=="Live"?'<div class="infobox" style="margin-top:10px">'+esc(w.name)+' is '+low(w.status)+'. It will not run until it is live.</div>':"")
      +'<div class="acts" style="margin-top:10px">'+(w?'<button class="btn sm" data-act="fbopenwf" data-id="'+w.id+'">Open the workflow</button>':"")+'<button class="btn sm" data-act="fbmakewf">Build a workflow for this funnel</button></div></section>';
  }
  function shareForm(f){
    var url="https://coach.getmilton.com/f/"+f.tok, code='<iframe src="'+url+'" title="'+f.title+'" width="100%" height="720" style="border:0"></iframe>';
    return '<section class="card"><div class="k">Share</div><div class="t" style="margin-top:8px">Public link</div><p class="m" style="margin:2px 0 6px">Anyone with this link can open the form. Put it in texts, emails or your social bio.</p>'+copyRow(url)
      +'<div class="t" style="margin-top:14px">QR code</div><div class="fb-qrrow">'+qr(96)+'<div><p class="m" style="margin:0 0 6px">For flyers and posters: print it and anyone who scans it lands on this form.</p><button class="btn sm" data-act="later" data-id="The QR code download">Download QR code (PNG)</button></div></div>'
      +'<div class="t" style="margin-top:14px">Embed on your website</div><p class="m" style="margin:2px 0 6px">Paste this into the HTML or embed block of your website builder. The form shows right on the page.</p><pre class="fb-code">'+esc(code)+'</pre><div style="margin-top:6px"><button class="btn sm" data-act="copy" data-id="'+esc(code)+'">Copy</button></div>'
      +'<div style="border-top:1px solid var(--line);margin-top:14px;padding-top:12px"><button class="btn sm" data-act="fbnewlink">Get a new link</button><p class="m" style="margin:6px 0 0">If this link ended up somewhere you regret, get a new one. The old one stops working.</p></div></section>';
  }
  function fHTML(f0,range){
    var f=fconv(f0), FI={Form:"Form","Website connection":"Web","Offer link":"Link","Meta lead ads":"Ads",Studio:"Stu"}; f.next=nextStr(f);
    var h='<p class="sub">'+FSUB[f.type]+'</p><button class="backl" data-act="funnel" data-id="">&#8249; All funnels</button><section class="head"><div class="id" style="flex:1;min-width:240px"><div class="av lg" style="border-radius:14px;font-size:13px">'+FI[f.type]+'</div><div style="flex:1;min-width:0"><input class="wf-name" id="fbName" data-fb="1" aria-label="Funnel name" value="'+esc(f.name)+'"><div class="m">'+f.type+'. The name is only for you and your team.</div></div></div><div class="acts"><span class="chip '+(f.live?"ok":"")+'">'+(f.live?"Live":"Off")+'</span>'+sw("ftoggle",f.id,f.live,"Live")+'</div>'+(f.type==="Studio"?"":'<div class="wf-tools"><button class="btn sm quiet" data-act="fbdup">Duplicate</button><button class="btn sm quiet rm" data-act="fbdel">Delete</button></div>')+'</section>';
    if(f.type==="Studio"){var SA=M.studio.shared(); return h+'<div class="grid fb-grid"><div class="col"><section class="card"><div class="ch"><div class="k">Share pages</div><button class="btn sm" data-act="go" data-id="studio">Open Studio</button></div>'+(SA.length?SA.map(function(x){return '<div class="row"><div class="what"><div class="t" style="font-weight:500">'+esc(x[0])+'</div><div class="m">'+esc(x[1])+'</div></div><span class="m num">'+x[2]+'</span></div>'}).join(""):'<p class="m" style="margin:0">Nothing shared yet.</p>')+'<p class="m" style="margin:8px 0 0">A share page exists for every report or story sent with sharing on. This funnel is built in, so there is nothing to set up.</p></section>'+nextCard(f)+'</div><div class="col">'+statusCard(f)+resultsCard(f,range)+'</div></div>'}
    if(f.type==="Form"){
      h+='<div class="grid fb-grid"><div class="col"><section class="card"><div class="k">Questions</div><div class="row"><div class="what"><div class="t" style="font-weight:500">Name, mobile and email</div></div><span class="chip">Always asked</span></div>'
        +f.questions.map(function(q,i){return '<div class="fb-q"><input data-fbq="'+i+'" aria-label="Question '+(i+1)+'" placeholder="What do you want to ask?" value="'+esc(q.q)+'"><div class="fb-qbot"><select class="csel" data-fbt="'+i+'" data-fbs="1" aria-label="Answer type">'+opt(QT,q.t)+'</select>'+sw("fbqreq",i,q.req,"Required")+'<span class="m">Required</span><span class="wf-mv fb-mv"><button data-act="fbqmove" data-id="'+i+'|-1" aria-label="Move question '+(i+1)+' up"'+(i===0?" disabled":"")+'>&#8593;</button><button data-act="fbqmove" data-id="'+i+'|1" aria-label="Move question '+(i+1)+' down"'+(i===f.questions.length-1?" disabled":"")+'>&#8595;</button><button data-act="fbqdel" data-id="'+i+'" aria-label="Remove question '+(i+1)+'">&#10005;</button></span></div>'
          +(q.t==="Choice"?'<div class="fb-opts">'+q.opts.map(function(o,j){return '<div class="rbar"><input data-fbo="'+i+"|"+j+'" placeholder="Option '+(j+1)+'" aria-label="Option '+(j+1)+'" value="'+esc(o)+'"><button class="btn sm quiet" data-act="fbodel" data-id="'+i+"|"+j+'" aria-label="Remove option '+(j+1)+'"'+(q.opts.length<=2?" disabled":"")+'>&#10005;</button></div>'}).join("")+'<div><button class="btn sm" data-act="fboadd" data-id="'+i+'"'+(q.opts.length>=12?" disabled":"")+'>+ Add an option</button></div><div class="m">A choice question offers 2 to 12 options.</div></div>':"")+'</div>'}).join("")
        +'<div style="margin-top:10px"><button class="btn sm" data-act="fbqadd">+ Add a question</button></div><div class="fb-cons">'+(fst.cons?'<div class="field"><label for="fbCons">Consent wording</label><textarea id="fbCons" rows="3" maxlength="2000">'+esc(f.consent)+'</textarea><div class="m"><span id="fbConsN">'+f.consent.length+'</span>/2000. Shown under the questions exactly as written here. Everyone who submits the form agrees to it.</div></div><button class="btn sm" data-act="fbcons">Done</button>':'<p class="m" style="margin:0;font-style:italic">"'+esc(f.consent)+'"</p><div class="rbar" style="margin-top:6px"><span class="chip">Always shown</span><button class="btn sm quiet" data-act="fbcons">Edit wording</button></div>')+'</div></section>';
      h+='<section class="card"><div class="k">Title and ending</div><div class="field" style="margin-top:8px"><label for="fbTitle">Title</label><input id="fbTitle" value="'+esc(f.title)+'"><div class="m" style="margin-top:4px">Shown at the top of the form.</div></div><div class="t" style="margin-top:12px">When they finish</div>'
        +'<label class="fb-radio"><input type="radio" name="fbEnd" data-fbend="msg"'+(f.end.mode==="msg"?" checked":"")+'> Show a thank-you message</label>'+(f.end.mode==="msg"?'<div class="field fb-ind"><label for="fbMsg">Message</label><textarea id="fbMsg" rows="3" maxlength="500">'+esc(f.end.msg)+'</textarea><div class="m" style="text-align:right"><span id="fbMsgN">'+f.end.msg.length+'</span>/500</div></div>':"")
        +'<label class="fb-radio"><input type="radio" name="fbEnd" data-fbend="url"'+(f.end.mode==="url"?" checked":"")+'> Send them to a web address</label>'+(f.end.mode==="url"?'<div class="field fb-ind"><label for="fbUrl">Web address</label><input id="fbUrl" placeholder="https://" value="'+esc(f.end.url)+'"><div class="m" style="margin-top:4px">They land here right after submitting. The address must start with https://.</div></div>':"")+'</section>'
        +'<div class="acts"><button class="btn pri" data-act="fbsaveform">Save form</button><button class="btn" data-act="panel" data-id="fbprev">Preview</button></div></div><div class="col">'+statusCard(f)+resultsCard(f,range)+shareForm(f)+nextCard(f)+'</div></div>';
    } else if(f.type==="Offer link"){
      var url=G.site+"/"+f.slug;
      h+='<div class="grid fb-grid"><div class="col"><section class="card"><div class="k">The offer</div><div class="stack" style="gap:10px;margin-top:8px"><div class="field"><label for="fbPkg">What they buy</label><select id="fbPkg" data-fbs="1">'+opt(items().map(function(i){return [i.id,itemName(i)]}),f.pkg)+'</select></div><div class="field"><label>Order</label><div class="seg">'+ORD.map(function(o,i){return '<button data-act="fbord" data-id="'+i+'" aria-pressed="'+(f.order===o)+'">'+o+'</button>'}).join("")+'</div><div class="m" style="margin-top:6px">'+(f.order===ORD[0]?"They pay, then land on the sessions this purchase covers and pick a time. If they leave first, the confirmation email takes them back without charging again.":f.order===ORD[1]?"They pick a time first. The spot is held while they pay and released if they do not.":"They book without paying. Good for a free intro or paying at the front desk.")+'</div></div>'+(f.order===ORD[1]?'<div class="field"><label for="fbHold">Hold the spot for</label><select id="fbHold" style="max-width:200px">'+opt([[10,"10 minutes"],[15,"15 minutes"],[30,"30 minutes"]],f.hold)+'</select></div>':"")+'<div class="two"><div class="field"><label for="fbSign">Sign step</label><select id="fbSign" data-fbs="1">'+opt(["None","Everything they are missing","Liability waiver","Membership agreement"],f.sign)+'</select></div>'+(f.sign==="None"?"":'<div class="field"><label for="fbSignWhen">When</label><select id="fbSignWhen" data-fbs="1">'+opt(["After booking","Before paying"],f.signWhen)+'</select></div>')+'</div></div></section>'
        +'<section class="card"><div class="k">The page</div><div class="stack" style="gap:10px;margin-top:8px"><div class="field"><label for="fbHead">Headline</label><input id="fbHead" value="'+esc(f.head)+'"></div><div class="field"><label for="fbBlurb">Description</label><input id="fbBlurb" value="'+esc(f.blurb)+'"></div><div class="field"><label for="fbBtn">Button</label><input id="fbBtn" style="max-width:220px" value="'+esc(f.btn)+'"></div><p class="m" style="margin:0">No login inside the link. The app invite can be a step in the workflow after.</p></div></section>'
        +'<div class="acts"><button class="btn pri" data-act="fbsaveform">Save offer</button><button class="btn" data-act="panel" data-id="fbprev">Preview</button></div></div><div class="col">'+statusCard(f)+resultsCard(f,range)
        +'<section class="card"><div class="k">Share</div><div class="field" style="margin-top:8px"><label for="fbSlug">Web address</label><div class="rbar"><span class="m">'+esc(G.site)+'/</span><input id="fbSlug" value="'+esc(f.slug)+'" style="flex:1;min-width:100px"></div></div><div class="acts" style="margin-top:8px"><button class="btn sm" data-act="copy" data-id="https://'+esc(url)+'">Copy</button></div><div class="fb-qrrow" style="margin-top:12px">'+qr(96)+'<div><p class="m" style="margin:0 0 6px">Print it and anyone who scans it lands on this offer.</p><button class="btn sm" data-act="later" data-id="The QR code download">Download QR code (PNG)</button></div></div></section>'+nextCard(f)+'</div></div>';
    } else if(f.type==="Website connection"){
      var ep="https://api.getmilton.com/api/v1/public/leads/website", codeW='await fetch("'+ep+'", {\n  method: "POST",\n  headers: {\n    "Content-Type": "application/json",\n    "X-Milton-Funnel-Key": process.env.MILTON_FUNNEL_KEY\n  },\n  body: JSON.stringify({ name, email, phone })\n});';
      h+='<div class="grid fb-grid"><div class="col">'+statusCard(f)+nextCard(f)+'</div><div class="col">'+resultsCard(f,range)+'</div></div>'
        +'<section class="card" style="margin-top:16px"><div class="k">Connect your website</div><p style="margin:8px 0 10px">Your website\'s server posts each form submission to this address, with your funnel key in the X-Milton-Funnel-Key header.</p><div class="t">Endpoint address</div>'+copyRow(ep)
        +'<div class="t" style="margin-top:14px">Funnel key</div>'+(f.key==="new"?copyRow("mk_live_7f3a9c2e41d84b6fa05e9d7c")+'<p class="m" style="margin:6px 0 0"><b>You will not see this key again.</b> Store it in your server\'s environment as MILTON_FUNNEL_KEY before you leave this page.</p>':f.key==="revoked"?'<p class="m" style="margin:4px 0 8px">No key is active. Leads from your website are not accepted until you create one.</p><button class="btn sm" data-act="fbkey" data-id="rotate">Create a key</button>':'<p style="margin:4px 0 2px">A key is active for this funnel.</p><p class="m" style="margin:0 0 8px">A key is shown only once, right after it is created. If this one is lost, rotate it to get a new one.</p><div class="acts"><button class="btn sm" data-act="fbkey" data-id="rotate">Rotate key</button><button class="btn sm quiet rm" data-act="fbkey" data-id="revoke">Revoke key</button></div>')
        +'<div class="t" style="margin-top:14px">Server-side example (Node)</div><pre class="fb-code">'+esc(codeW)+'</pre><div style="margin-top:6px"><button class="btn sm" data-act="copy" data-id="'+esc(codeW)+'">Copy</button></div><div class="warnbox" style="margin-top:12px">The key belongs on your server only. Never put it in browser code or anywhere a visitor could see it. Anyone who has it can send leads into your account.</div></section>'
        +'<section class="card" style="margin-top:16px"><div class="k">Send a test lead</div><p style="margin:8px 0 10px">Sends a sample lead through the exact route your website uses. It lands on one fixed Milton test lead contact, so your real contacts stay untouched.</p><button class="btn" data-act="fbtest">Send a test lead</button></section>';
    } else {
      h+='<section class="card" style="margin-top:16px"><div class="ch"><div class="k">Meta connection</div>'+(f.connected?'<span class="chip ok">Connected</span>':'<span class="chip warn">Not connected</span>')+'</div>'+(f.connected?'<div class="stack" style="gap:10px"><div class="field"><label for="fbPage">Facebook Page</label><select id="fbPage" style="max-width:340px">'+opt([G.name,G.name+" Kids"],f.page)+'</select></div><div><div class="t">Lead forms on this Page</div>'+f.forms.map(function(x,i){return '<div class="row"><div class="what"><div class="t" style="font-weight:500">'+esc(x.n)+'</div></div><span class="m">'+(x.on?"Sending leads":"Off")+'</span>'+sw("fbform",i,x.on,x.n+" sends leads")+'</div>'}).join("")+'</div><p class="m" style="margin:0">Lead forms only. Each lead lands in your contacts within a minute, with their answers.</p><div class="acts"><button class="btn sm" data-act="fbtest">Send a test lead</button><button class="btn sm quiet rm" data-act="fbdisc">Disconnect</button></div></div>':'<p style="margin:0 0 10px">Connect your own Meta account, the same way you connected Stripe. Each lead from a lead form lands in your contacts within a minute, with their answers.</p><button class="btn pri" data-act="panel" data-id="fbmeta">Connect Facebook and Instagram</button>')+'</section><div class="grid fb-grid"><div class="col">'+resultsCard(f,range)+'</div><div class="col">'+nextCard(f)+'</div></div>';
    }
    return h;
  }
  M.fnb={html:fHTML};
  /* form and offer preview, in a side panel */
  function brandBar(){return '<div class="fb-brand">'+esc(G.name)+'</div>'}
  function qInput(q){
    if(q.t==="Long answer") return '<textarea rows="3"></textarea>';
    if(q.t==="Choice") return '<div class="fb-ch">'+q.opts.filter(function(o){return String(o).trim()}).map(function(o){return '<label><input type="radio" name="fbp'+esc(q.q)+'"> '+esc(o)+'</label>'}).join("")+'</div>';
    return '<input type="text">';
  }
  function offerPages(f){var p=["Offer"], pay=f.order!==ORD[2], sign=f.sign!=="None"; if(sign&&f.signWhen==="Before paying") p.push("Sign"); if(f.order===ORD[1]) p.push("Book"); if(pay) p.push("Pay"); if(f.order!==ORD[1]) p.push("Book"); if(sign&&f.signWhen!=="Before paying") p.push("Sign"); p.push("Done"); return p}
  M.panels.fbprev=function(){
    var f=curF(), body;
    if(f.type==="Form") body='<div class="fb-phone">'+brandBar()+'<div class="fb-pb"><h4>'+esc(f.title||"Your title")+'</h4><div class="field"><label>Name <span class="fb-req">*</span></label><input type="text"></div><div class="field"><label>Mobile</label><input type="text"></div><div class="field"><label>Email</label><input type="text"><div class="m">Mobile or email is required.</div></div>'+f.questions.map(function(q){return '<div class="field"><label>'+esc(q.q||"Question")+(q.req?' <span class="fb-req">*</span>':"")+'</label>'+qInput(q)+'</div>'}).join("")+'<label class="fb-consent"><input type="checkbox"> <b>'+esc(f.consent)+'</b></label><button class="fb-go" disabled>Send</button><p class="m" style="margin:0">This is a preview, so Send is turned off. Nothing you type here is sent anywhere.</p></div></div><div class="k" style="margin-top:8px">After they send</div><div class="fb-phone"><div class="fb-pb fb-done"><div class="fb-tick">&#10003;</div><p>'+(f.end.mode==="msg"?esc(f.end.msg):"They go to "+esc(f.end.url||"your web address")+".")+'</p></div></div>';
    else {var P=offerPages(f), i=Math.min(pv.step,P.length-1), pg=P[i], it=DB.ITEMS.filter(function(x){return x.id===f.pkg})[0], price=it?(it.free||!+it.price?"Free":M.fm(+it.price)):"", b="";
      if(pg==="Offer") b='<h4>'+esc(f.head||"Your headline")+'</h4><p class="m">'+esc(f.blurb)+'</p><div class="fb-price">'+price+'</div><p class="m">'+esc(it?itemName(it).replace(/, [^,]*$/,""):"")+'</p>';
      if(pg==="Pay") b='<h4>Pay</h4><p class="m">'+esc(it?itemName(it):"")+'</p><div class="field"><label>Card number</label><input type="text" placeholder="1234 1234 1234 1234"></div><div class="two"><div class="field"><label>Expires</label><input type="text" placeholder="MM / YY"></div><div class="field"><label>CVC</label><input type="text"></div></div>'+(f.order===ORD[1]?'<p class="m">Your spot is held for '+f.hold+' minutes.</p>':"");
      if(pg==="Book") b='<h4>Pick a time</h4><p class="m">'+(f.order===ORD[0]?"You are paid up. Book your first session now and the rest later.":"Choose a session to start.")+'</p><div class="fb-slots"><span>Mon 6:00 PM</span><span class="on">Tue 10:00 AM</span><span>Wed 6:00 PM</span><span>Sat 9:00 AM</span></div>';
      if(pg==="Sign") b='<h4>Sign before you come in</h4><p class="m">'+esc(f.sign==="Everything they are missing"?"Liability waiver and anything else your gym needs":f.sign)+'</p><div class="fb-sig">Sign here</div>';
      if(pg==="Done") b='<div class="fb-done"><div class="fb-tick">&#10003;</div><p>You are all set. A confirmation is on its way by text and email.</p></div>';
      body='<div class="fb-phone">'+brandBar()+'<div class="fb-steps">'+P.map(function(x,j){return '<button data-act="fbstep" data-id="'+j+'" class="'+(j===i?"on":j<i?"dn":"")+'">'+x+'</button>'}).join("")+'</div><div class="fb-pb">'+b+(pg==="Done"?'<button class="link" data-act="fbstep" data-id="0">Start again</button>':'<button class="fb-go" data-act="fbstep" data-id="'+(i+1)+'">'+(pg==="Offer"?esc(f.btn):pg==="Pay"?"Pay "+price:"Continue")+'</button>')+'</div></div>'}
    return '<div class="sph"><div><h3>What your customer sees</h3><div class="m">Straight from this editor, unsaved changes included. You can type in it; nothing is sent.</div></div>'+M.px+'</div><div class="spb">'+body+'</div><div class="spf"><button class="btn" data-act="pclose">Close</button></div>';
  };
  var _panel=A.panel; A.panel=function(id,b,c){ if(id==="fbprev"){grabF(); pv.step=0} _panel(id,b,c)};
  A.fbstep=function(id){pv.step=+id; M.renderPanel()};
  A.fbsaveform=function(){grabF(); var f=curF(), e=f.type==="Form"?(!f.title?"Give the form a title.":f.questions.some(function(q){return !q.q.trim()})?"A question is blank. Type it or remove it.":f.questions.some(function(q){return q.t==="Choice"&&q.opts.filter(function(o){return String(o).trim()}).length<2})?"A choice question needs at least 2 options.":f.end.mode==="url"&&!/^https:\/\//.test(f.end.url)?"The web address must start with https://.":""):(!f.head?"Give the page a headline.":""); if(e) return M.toast(e); fst.cons=false; reF(f.type==="Form"?"Form saved. The link, QR code and embed all show the new version.":"Offer saved.")};
  A.fbqadd=function(){grabF(); curF().questions.push({q:"",t:"Short answer",req:false,opts:["",""]}); M.render(); var q=document.querySelectorAll("[data-fbq]"); if(q.length) q[q.length-1].focus()};
  A.fbqdel=function(i){grabF(); var f=curF(), q=f.questions.splice(+i,1)[0]; M.render(); M.toast("Question removed.",function(){f.questions.splice(+i,0,q); M.render()})};
  A.fbqreq=function(i){grabF(); var q=curF().questions[+i]; q.req=!q.req; M.render()};
  A.fbqmove=function(id){grabF(); var a=id.split("|"), L=curF().questions, i=+a[0], j=i+(+a[1]); if(j<0||j>=L.length) return; var q=L.splice(i,1)[0]; L.splice(j,0,q); M.render()};
  A.fboadd=function(i){grabF(); var q=curF().questions[+i]; if(q.opts.length<12) q.opts.push(""); M.render()};
  A.fbodel=function(id){grabF(); var a=id.split("|"), q=curF().questions[+a[0]]; if(q.opts.length>2) q.opts.splice(+a[1],1); M.render()};
  A.fbcons=function(){grabF(); fst.cons=!fst.cons; M.render()};
  A.fbnewlink=function(){var f=curF(); M.confirm({title:"Get a new link?",body:"The current link, QR code and embed code stop working at once. Anything already printed or posted will need the new one.",no:"Keep this link",yes:"Get a new link",run:function(){f.tok=tok(); reF("New link ready. The old one no longer works.")}})};
  A.fbord=function(i){grabF(); curF().order=ORD[+i]; reF()};
  A.fbform=function(i){grabF(); var x=curF().forms[+i]; x.on=!x.on; reF(x.n+(x.on?" now sends leads.":" is off."))};
  A.fbtest=function(){grabF(); var f=curF(); f.connected=true; f.last="Just now, test lead"; reF("Test lead received. It landed on the Milton test lead contact, so your real contacts are untouched.")};
  A.fbkey=function(k){var f=curF(); if(k==="rotate"&&f.key==="revoked"){f.key="new"; return reF("New key created. Copy it now.")}
    M.confirm(k==="rotate"?{title:"Rotate the funnel key?",body:"The current key stops working at once. Your website stops sending leads until its server has the new key.",no:"Keep this key",yes:"Rotate key",run:function(){f.key="new"; reF("New key created. Copy it now.")}}:{title:"Revoke the funnel key?",body:"Your website stops sending leads into Milton until you create a new key. Leads you already have stay.",no:"Keep this key",yes:"Revoke key",run:function(){f.key="revoked"; f.connected=false; reF("Key revoked.")}})};
  A.fbdisc=function(){var f=curF(); M.confirm({title:"Disconnect Facebook and Instagram?",body:"New leads from your lead forms stop coming in. Leads you already have stay.",no:"Stay connected",yes:"Disconnect",run:function(){f.connected=false; f.live=false; reF("Disconnected.")}})};
  M.panels.fbmeta=function(){return '<div class="sph"><div><h3>Connect Facebook and Instagram</h3><div class="m">Lead forms only. Milton does not post or run ads.</div></div>'+M.px+'</div><div class="spb"><div class="infobox">You sign in with Facebook, pick the Page, and allow Milton to read leads from its lead forms. You can disconnect at any time.</div><div class="m">Milton asks for: your Pages list, and leads from lead forms on the Page you pick.</div></div><div class="spf"><button class="btn pri" data-act="fbmetago">Continue with Facebook</button><button class="btn" data-act="pclose">Cancel</button></div>'};
  A.fbmetago=function(){var f=curF(); f.connected=true; M.closePanel(); reF("Connected. Prototype only, no account was linked.")};
  A.fbopenwf=function(id){grabF(); wst.open=null; M.go({page:"crm",tab:"workflows"}); A.workflow(id)};
  A.fbmakewf=function(){grabF(); var f=curF(), offer=f.type==="Offer link", trig=f.type==="Form"?{k:"Signup form filled",o:{form:f.name}}:offer?{k:"Purchase completed",o:{}}:{k:"New lead from a funnel",o:{funnel:f.name}};
    var w=newWf(f.name+" follow-up","Follows up with everyone who comes in through "+f.name+".",trig,offer?[IF([{f:"Welcome SMS status",r:"Is",s:"Not welcomed"}],[T("Thanks for joining us, {First name}. You are booked for {Session} on {Day} at {Time}.",{name:"Welcome SMS",purpose:PURPOSE[1]})],[],"Check current status"),IF([{f:"Current waiver status",r:"Is",s:"Needs signature"}],[clone(WAIVER)],[],"Needs a waiver?"),{t:"invite",name:"App invite"}]:[T("Hi {First name}, thanks for reaching out to {Gym name}. Want to come try a class this week? {Booking link}",{name:"First text"}),W(1,"Days",{mode:"until",until:"They reply"}),IF([{f:"Upcoming booking",r:"Exists",s:""}],[],[{t:"note",name:"Team note",to:"Front desk",body:"Call them. No reply to the first text."}],"Booked yet?")],"dirty");
    w.stop={reply:!offer,book:!offer}; sync(w); f.wfid=w.id; f.next=nextStr(f); openWf(w); M.toast("Draft workflow created and attached to "+f.name+". Save it, then make it live when it is ready.")};
  A.fbdup=function(){grabF(); var f=curF(), c=clone(f); c.id="f"+Date.now(); c.name=f.name+" copy"; if(c.tok) c.tok=tok(); if(c.slug) c.slug=f.slug+"-copy"; c.live=false; c.leads=c.booked=c.showed=c.joined=0; c.opened=f.opened===null?null:0; c.last="No leads yet"; if(c.type==="Website connection"){c.key="new"; c.connected=false} DB.funnels.unshift(c); A.funnel(c.id); M.toast("Duplicated. It is off until you turn it on.")};
  A.fbdel=function(){var f=curF(); M.confirm({title:"Delete "+f.name+"?",body:(f.type==="Form"||f.type==="Offer link"?"Its link and QR code stop working. ":"Leads stop coming in this way. ")+"The "+M.plural(f.leads,"lead")+" it brought in stay in your contacts. This cannot be undone.",no:"Keep it",yes:"Delete funnel",run:function(){DB.funnels.splice(DB.funnels.indexOf(f),1); A.funnel(""); M.toast(f.name+" deleted.")}})};
  A.ftoggle=function(id,b,e){ if(e) e.stopPropagation(); if(M.crmState().fid===id) grabF(); var f=fconv(fn(id));
    if(!f.live){var why=f.type==="Meta lead ads"&&!f.connected?"Connect Facebook and Instagram before turning this on.":f.type==="Website connection"&&f.key==="revoked"?"Create a funnel key before turning this on.":""; if(why){M.toast(why);return}}
    f.live=!f.live; M.render(); M.toast(f.name+(f.live?" is live.":" is off. Nothing comes in until it is back on."))};
  var nf=null;
  M.panels.fbnewp=function(){var x=FNEW[nf.type]; return '<div class="sph"><div><div class="k">New funnel</div><h3>'+nf.type+'</h3><div class="m">'+x[1]+'</div></div>'+M.px+'</div><div class="spb"><div class="field"><label for="fbNewName">Name</label><input id="fbNewName" placeholder="'+esc(x[2])+'" value="'+esc(nf.name)+'" autofocus></div>'+(nf.err?'<div class="m" role="alert" style="color:var(--err);font-weight:600">'+nf.err+'</div>':"")+'<div class="m">It starts switched off. Turn it on when it is ready.</div></div><div class="spf"><button class="btn pri" data-act="fbcreate">Create funnel</button><button class="btn" data-act="pclose">Cancel</button></div>'};
  A.fbnew=function(type){M.crmState().fmenu=false; nf={type:type,name:"",err:""}; M.render(); M.openPanel("fbnewp")};
  A.fbcreate=function(){var n=val("fbNewName"); nf.name=n; if(!n){nf.err="Give it a name first."; return M.renderPanel()} var type=nf.type, f={id:"f"+Date.now(),name:n,type:type,live:false,last:"No leads yet",opened:type==="Form"||type==="Offer link"?0:null,leads:0,booked:0,showed:0,joined:0,next:""};
    if(type==="Form") f.questions=[]; if(type==="Website connection"){f.connected=false; f.key="new"}
    fconv(f); f.next=nextStr(f); DB.funnels.unshift(f); M.closePanel(); A.funnel(f.id); M.toast(type==="Website connection"?"Funnel created. Copy the key now, it is shown only once.":"Funnel created. It is off until you turn it on.")};
  var _funnel=A.funnel; A.funnel=function(id){ if(M.crmState().fid&&$("fbName")) grabF(); fst.cons=false; _funnel(id)};
  M.inputs.push(function(el){ if(el.id==="fbMsg"&&$("fbMsgN")) $("fbMsgN").textContent=el.value.length; if(el.id==="fbCons"&&$("fbConsN")) $("fbConsN").textContent=el.value.length });
  M.changes.push(function(el){var d=el.dataset||{}; if(!$("fbName")) return; if(d.fbend){grabF(); curF().end.mode=d.fbend; return M.render()} if(d.fbs){grabF(); return M.render()} if(el.id==="fbName"||el.id==="fbHold"||el.id==="fbPage") grabF()});
})();
