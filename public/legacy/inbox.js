/* Inbox: one conversation per person. Texts, app messages, email, calls, team notes and automated sends
   share one thread. Follows the Milton Inbox design and spec. The same thread shows on the Contact Record. */
(function(){
  var esc=M.esc, $=M.$, GYM_NUM=DB.GYM.num;
  var THX="Thanksgiving week at the gym: normal hours Mon to Wed, closed Thu, open gym 7 to 11 AM Fri. Reply here with any questions.";
  /* a few more conversations so every state has an example */
  DB.people.push({id:"nina", name:"Nina Alvarez", added:"2026-11-20", source:"Free intro class form", stage:"In conversation",
    phone:"(316) 555-0147", email:"nina.alvarez@example.com", handoff:{reason:"Injury question and family pricing"}, lastTouch:"Milton handed this to the team today at 7:51 AM.",
    form:{name:"Free intro class form", when:"Today · 7:41 AM", qa:[["What is your main goal?","Get back to training after knee surgery."],["Have you worked with a coach before?","Yes, before the surgery."],["Which days work best?","Saturdays."]]},
    thread:[{k:"event",day:"Today",t:"7:41 AM",body:"Came in through the Free intro class form"},
      {k:"milton",ch:"Text",day:"Today",t:"7:42 AM",body:"Hi Nina, thanks for asking about the free intro class. Which days work best for you?"},
      {k:"in",ch:"Text",day:"Today",t:"7:50 AM",body:"Saturdays. I had knee surgery in March though, is that going to be a problem? And do you do family pricing?"},
      {k:"milton",ch:"Text",day:"Today",t:"7:51 AM",body:"Good questions. A coach should answer both, so I am passing this to the team. Someone will contact you today."},
      {k:"event",day:"Today",t:"7:51 AM",body:"Milton handed this to the team. Reason: injury question and family pricing"}],
    read:["I handed Nina to the team at 7:51 AM. She asked about knee surgery and family pricing.","Nobody has replied to her yet."]});
  (function(){
    var P=M.person, dana=P("dana"), leah=P("leah"), tom=P("tom"), priya=P("priya"), marcus=P("marcus");
    dana.thread.splice(1,0,{k:"auto",src:"Broadcast",name:"Thanksgiving week hours",sid:"s1",ch:"Text",day:"Wed, Nov 18",t:"4:00 PM",body:THX},{k:"in",ch:"Text",day:"Wed, Nov 18",t:"4:20 PM",body:"Is Friday 7 AM open gym only, or classes too?"},{k:"out",by:"Tori Lane",ch:"Text",day:"Wed, Nov 18",t:"4:45 PM",body:"Open gym only on Friday. Classes are back Monday."});
    dana.thread.forEach(function(i){ if(i.k==="call") i.lines=[["Dana","Hi, can I get a day pass for Maya's camp day on Saturday?"],["Riley","Yes. It is $25.00. I will text you a link to pay."],["Dana","Perfect, thank you."]]; if(i.k==="auto"&&i.name==="Session reminder") i.sid="s2" });
    leah.thread.push({k:"call",dir:"out",day:"Sat, Nov 14",t:"3:10 PM",title:"Outgoing call, 6 min, Tori Lane on the gym phone",body:"Talked through moving to 3 sessions a week in January. Leah wants to decide after the holidays.",lines:[["Tori","Hey Leah, it is Tori from the gym. Do you have a few minutes to talk about January?"],["Leah","Yes, I have been thinking about adding a third day."],["Tori","Great. No rush, let us look at it after the holidays."]]},{k:"in",ch:"App",day:"Today",t:"6:55 AM",body:"Can I switch Monday's session to Tuesday?"});
    leah.owner="Tori Lane";
    tom.thread.push({k:"auto",src:"Broadcast",name:"Thanksgiving week hours",sid:"s1",ch:"Text",day:"Wed, Nov 18",t:"4:00 PM",body:THX},{k:"in",ch:"Text",day:"Wed, Nov 18",t:"4:03 PM",body:"STOP",handled:true},{k:"event",day:"Wed, Nov 18",t:"4:03 PM",body:"Tom opted out of texts. Email and app messages still work."});
    priya.thread.push({k:"queued",day:"Today",t:"5:00 PM",body:"Milton will follow up today at 5:00 PM if Priya has not replied.",next:"Hi Priya, just checking in. Want me to hold Saturday 9:00 AM or Monday 6:00 AM for your free intro class?"});
    marcus.thread.forEach(function(i){ if(i.k==="auto") i.sid="s3" }); marcus.owner="Renee Castillo";
  })();
  var sends=[
    {id:"s4",kind:"Appointment setter",name:"Free intro class",ch:"Text",when:"Running since Nov 19",aud:"New leads from the Free intro class form",setter:true,body:"Milton texts each new lead within a minute, answers basic questions and books the class. It hands off anything about injuries, pricing details or complaints."},
    {id:"s2",kind:"Workflow",name:"Session reminder",ch:"Text",when:"Last 7 days",aud:"Anyone with a session the next day",stats:[["Sent",41],["Delivered",41],["Replied",0],["Opted out",0]],body:"See you tomorrow at {Time} for {Session}.",replies:[]},
    {id:"s1",kind:"Broadcast",name:"Thanksgiving week hours",ch:"Text",when:"Sent Wed, Nov 18 · 4:00 PM",aud:"Customers and past customers",stats:[["Sent",96],["Delivered",94],["Replied",2],["Opted out",1]],body:THX,replies:[{pid:"dana",text:"Is Friday 7 AM open gym only, or classes too?",chip:"Answered by Tori Lane",cls:"ok"},{pid:"tom",text:"STOP",chip:"Opted out",cls:"warn"}]},
    {id:"s3",kind:"Workflow",name:"Booking confirmation",ch:"Text",when:"Last 7 days",aud:"Anyone who books a session",stats:[["Sent",12],["Delivered",12],["Replied",0],["Opted out",0]],body:"You are booked for {Session} on {Day} at {Time}.",replies:[]}
  ];
  var st={tab:"needs",pid:null,sid:"s4",q:"",open:false,details:false,more:false,incoming:null,dial:""};
  var cv={pid:null,filt:"all",ch:{},note:false};
  var MSG={"in":1,out:1,milton:1,auto:1,call:1};
  function everyone(){return M.people().filter(function(p){var d=M.dupOf(p.id); return p.thread.length&&!(d&&d.drop===p.id)})}
  function lastMsg(p){for(var i=p.thread.length-1;i>=0;i--) if(MSG[p.thread[i].k]) return p.thread[i]; return p.thread[p.thread.length-1]||null}
  function miltonOn(p){return !!(p.milton||p.miltonBooked)}
  /* Needs reply: handed off, or a missed call last, or an inbound message nobody on the team has answered.
     Automated sends never count as an answer. */
  M.needsReply=needs;
  function needs(p){
    if(p.cleared) return false;
    if(p.handoff) return true;
    if(miltonOn(p)) return false;
    var real=p.thread.filter(function(i){return i.k==="in"||i.k==="out"||i.k==="milton"||i.k==="call"}), l=real[real.length-1];
    if(!l) return false;
    if(l.k==="call") return l.dir==="missed";
    return l.k==="in"&&!l.handled;
  }
  function mins(t){var m=/(\d+):(\d+) (AM|PM)/.exec(t||""); if(!m) return 2000; return ((+m[1])%12+(m[3]==="PM"?12:0))*60+(+m[2])}
  function rank(p){var l=lastMsg(p); if(!l) return -1e9; if(l.day==="Today") return mins(l.t); var d=Date.parse(l.day.replace(/^[A-Za-z]+, /,"")+", 2026"); return (isNaN(d)?-9e8:(d-Date.parse("Nov 20, 2026"))/60000)+mins(l.t)-1440}
  function order(){return everyone().sort(function(a,b){return rank(b)-rank(a)})}
  function chan(p){
    var c=cv.ch[p.id];
    if(!c){for(var i=p.thread.length-1;i>=0;i--) if(p.thread[i].k==="in"){c=p.thread[i].ch;break} c=c||"Text"}
    if(c==="Text"&&(!p.textOk||!p.phone)) c=p.email?"Email":"App";
    if(c==="Email"&&!p.email) c="App";
    return c;
  }
  function who(p){return p.unnamed?"this number":p.first}
  function takeOver(p){
    p.milton=false; p.miltonBooked=false; p.handoff=null; p.setterPaused=true; p.owner=M.you().name;
    p.thread=p.thread.filter(function(x){return x.k!=="queued"});
    p.thread.push({k:"event",day:"Today",t:"just now",body:M.you().name+" took over from Milton. Milton will not send anything else here."});
  }
  M.takeOver=takeOver;
  function handlerChip(p){
    if(p.handoff) return '<span class="chip warn">Handed to the team</span>';
    if(miltonOn(p)) return '<span class="chip glow">'+(p.miltonBooked?"Booked by Milton":"Milton is handling")+'</span>';
    return "";
  }

  /* the thread: used here and on the Contact Record */
  function itemHTML(p,it,i){
    if(cv.filt==="people"&&(it.k==="auto"||it.k==="event"||it.k==="queued")) return "";
    if(cv.filt==="calls"&&it.k!=="call") return "";
    if(it.k==="event") return '<div class="ev">'+esc(it.body)+' <span class="meta">· '+it.t+'</span>'+(it.merge?' <button class="link" data-act="unmerge">Undo merge</button> <span class="meta">available until Fri, Nov 27</span>':"")+'</div>';
    if(it.k==="note") return '<div class="nt">'+esc(it.body)+'<div class="meta">Note from '+esc(it.by)+", team only · "+it.t+'</div></div>';
    if(it.k==="call"){
      var ms=it.dir==="missed", hasT=it.lines&&it.lines.length;
      return '<div class="call'+(ms?" missed":"")+'"><div class="t">'+esc(it.title)+'</div><div class="m">'+esc(it.body)+'</div><div class="meta">'+(it.pending?"On the way":(ms?"Voicemail transcript":"Summary from the call transcript"))+" · "+it.t+'</div><div class="cact">'+(hasT?'<button class="link" data-act="transcript" data-id="'+i+'">'+(it.open?"Hide transcript":"Show transcript")+'</button>':"")+(it.pending?"":'<button class="link" data-act="later" data-id="Playing a recording">'+(ms?"Play voicemail":"Play recording")+'</button>')+(ms?'<button class="link" data-act="callp" data-id="'+p.id+'">Call back</button>':"")+'</div>'+(hasT&&it.open?'<div class="lines">'+it.lines.map(function(l){return '<div><b>'+esc(l[0])+":</b> "+esc(l[1])+'</div>'}).join("")+'</div>':"")+'</div>';
    }
    if(it.k==="queued") return '<div class="queue"><span>'+esc(it.body)+'</span><span class="acts"><button class="btn sm" data-act="qsend" data-id="'+i+'">Send now</button><button class="btn sm quiet" data-act="qskip" data-id="'+i+'">Skip</button></span></div>';
    if(it.k==="in") return '<div class="msg l"><div class="bub">'+esc(it.body)+'</div><div class="meta">'+esc(p.unnamed?p.phone:p.first)+" · "+it.ch+" · "+it.t+'</div></div>';
    if(it.k==="out") return '<div class="msg r out"><div class="bub">'+esc(it.body)+'</div><div class="meta">'+esc(it.by)+" · "+it.ch+" · "+it.t+'</div></div>';
    if(it.k==="milton") return '<div class="msg r milton"><div class="bub">'+esc(it.body)+'</div><div class="meta">Milton, appointment setter · '+it.ch+" · "+it.t+'</div></div>';
    return '<div class="msg r auto"><div class="src">'+it.src+": "+(it.sid?'<button class="link" style="font-size:12px" data-act="isend" data-id="'+it.sid+'">'+esc(it.name)+'</button>':esc(it.name))+'</div><div class="bub">'+esc(it.body)+'</div><div class="meta">Automated · '+it.ch+" · "+it.t+'</div></div>';
  }
  function bodyHTML(p){
    cv.pid=p.id;
    var h='<div class="fbar"><div class="seg"><button data-act="rfilt" data-id="all" aria-pressed="'+(cv.filt==="all")+'">Everything</button><button data-act="rfilt" data-id="people" aria-pressed="'+(cv.filt==="people")+'">Conversation only</button><button data-act="rfilt" data-id="calls" aria-pressed="'+(cv.filt==="calls")+'">Calls</button></div><span class="m">'+(cv.filt==="all"?"Showing automated sends and activity too":(cv.filt==="calls"?"Calls and voicemails only":"Hiding automated sends and activity"))+'</span></div><div class="scroll" id="scroll">';
    var day=null, shown=0;
    p.thread.forEach(function(it,i){var s=itemHTML(p,it,i); if(!s) return; if(it.day!==day){day=it.day; h+='<div class="day">'+day+'</div>'} h+=s; shown++});
    if(!shown) h+='<div class="ev">'+(cv.filt==="calls"?"No calls with "+esc(who(p))+" yet.":"Nothing here yet. Messages, calls and activity with "+esc(who(p))+" show in this one conversation.")+'</div>';
    h+='</div>';
    if(miltonOn(p)) h+='<div class="banner">Milton is running this conversation. Goal: book the free intro class. Sending a message takes it over.</div>';
    else if(p.handoff) h+='<div class="banner" style="background:var(--warn-soft);border-color:var(--warn-line);color:#5E3A00">Milton stopped and told '+esc(p.first)+' a team member will be in touch. '+esc(p.handoff.reason)+'.</div>';
    var c=chan(p), note=cv.note;
    h+='<div class="comp"><div class="crow"><div class="pills">'+["Text","App","Email"].map(function(x){var off=(x==="Text"&&(!p.textOk||!p.phone))||(x==="Email"&&!p.email); return '<button data-act="chan" data-id="'+x+'" aria-pressed="'+(!note&&c===x)+'"'+(off?" disabled":"")+'>'+x+(x==="Text"&&!p.textOk?", opted out":"")+'</button>'}).join("")+'<button class="notep" data-act="notemode" aria-pressed="'+note+'">Team note</button></div><span class="m">'+(note?"Only your team sees notes":(c==="Text"?"Sends from the gym number, "+GYM_NUM:(c==="App"?"Sends in the member app":"Sends to "+esc(p.email))))+'</span></div>';
    var ph=note?"Add a note for the team":"Message "+who(p);
    return h+'<form class="send'+(note?" notem":"")+'" id="sendForm"><input id="msgInput" type="text" autocomplete="off" placeholder="'+esc(ph)+'" aria-label="'+esc(ph)+'"><button class="btn sm'+(note?"":" pri")+'" type="submit">'+(note?"Add note":"Send")+'</button></form></div>';
  }
  M.conv={
    html:function(p){ if(cv.pid!==p.id){cv.filt="all"; cv.note=false} return '<section class="card conv" id="conv"><div class="ch"><h3>Conversation</h3><span class="acts">'+(miltonOn(p)?'<button class="btn sm" data-act="take">Take over</button>':(p.setterPaused?'<button class="btn sm" data-act="handback">Hand back to Milton</button>':""))+'<button class="link" data-act="inboxp" data-id="'+p.id+'">Open in Inbox</button></span></div>'+bodyHTML(p)+'</section>' },
    needs:needs, miltonOn:miltonOn, needList:function(){return order().filter(needs)}
  };
  function snap(p){
    var nx=p.appts[0], cr=p.plans.filter(function(x){return !x.unlimited}), due=p.appts.filter(function(a){return a.due&&!a.paid}).reduce(function(t,a){return t+a.due},0), miss=p.docs.filter(function(d){return d.status!=="signed"}).length;
    return [["Next session",nx?nx.day+", "+nx.time:"Nothing booked",""],["Credits",cr.length?cr.reduce(function(a,c){return a+c.open},0)+" left to book":(p.plans.length?"Unlimited":"No active package"),""],["Money",due?M.fm(due)+" due":(p.tx.length||p.plans.length?"Nothing due":"No purchases"),due?"warn":""],["Documents",miss?miss+" missing":(p.docs.length?"All signed":"Not yet"),miss?"warn":""]];
  }
  function ctxHTML(p){
    return '<aside class="ictx"><div class="crow"><span class="k">From the contact record</span><button class="link detb" data-act="idetails">Back to messages</button></div><div class="isnap">'+snap(p).map(function(s){return '<div class="'+s[2]+'"><div class="k">'+s[0]+'</div><div class="v">'+s[1]+'</div></div>'}).join("")+'</div><dl><div><dt>Phone</dt><dd>'+(p.phone||"None yet")+'</dd></div><div><dt>Email</dt><dd>'+(p.email||"None yet")+'</dd></div><div><dt>Texts</dt><dd>'+(p.textOk?'<span class="chip ok">Allowed</span>':'<span class="chip warn">Opted out</span>')+'</dd></div><div><dt>Calls</dt><dd>From the gym number. Recorded with a notice.</dd></div><div><dt>Usually replies by</dt><dd>'+p.replies+'</dd></div><div><dt>Owner</dt><dd>'+(miltonOn(p)?"Milton, appointment setter":(p.owner||"Unassigned"))+'</dd></div></dl><button class="btn" data-act="record" data-id="'+p.id+'">Open contact record</button></aside>';
  }
  function listHTML(){
    var h="";
    if(st.tab==="sent") return sends.map(function(s){return '<button class="irow" data-act="isend" data-id="'+s.id+'" aria-current="'+(s.id===st.sid)+'"><span class="idot '+(s.setter?"g":"off")+'"></span><span class="rb"><span class="r1"><span class="nm">'+esc(s.name)+'</span></span><span class="sn">'+esc(s.when)+'</span><span class="tags"><span class="chip '+(s.setter?"glow":(s.kind==="Broadcast"?"mist":""))+'">'+s.kind+'</span><span class="chip">'+s.ch+'</span></span></span></button>'}).join("");
    var q=st.q.toLowerCase(), ids=order().filter(function(p){return (!q||(p.name+" "+p.phone+" "+p.email).toLowerCase().indexOf(q)>=0)&&(st.tab==="needs"?needs(p):(st.tab==="milton"?miltonOn(p):true))});
    if(!ids.length) return '<div class="none">'+(st.q?"No one matches that search.":(st.tab==="needs"?"All caught up. Nobody is waiting on a reply.":"Nothing here yet."))+'</div>';
    ids.forEach(function(p){
      var l=lastMsg(p), n=needs(p), pre=l.k==="out"?esc(M.first(l.by))+": ":(l.k==="milton"?"Milton: ":(l.k==="auto"?esc(l.src)+": ":""));
      h+='<button class="irow'+(n?" unread":"")+'" data-act="ipick" data-id="'+p.id+'" aria-current="'+(p.id===st.pid)+'"><span class="idot '+(n?"":(miltonOn(p)?"g":"off"))+'"></span><span class="av">'+p.initials+'</span><span class="rb"><span class="r1"><span class="nm">'+esc(p.name)+'</span><span class="tm">'+(l.day==="Today"?l.t:l.day.replace(/^[A-Za-z]+, /,""))+'</span></span><span class="sn">'+(l.k==="call"?esc(l.title):pre+esc(l.body))+'</span><span class="tags">'+M.statusChip(M.status(p))+handlerChip(p)+(p.unnamed?'<span class="chip warn">Unsaved number</span>':"")+(p.textOk?"":'<span class="chip warn">No texts</span>')+'</span></span></button>';
    });
    return h;
  }
  function threadHTML(p){
    var items="";
    if(!miltonOn(p)){
      if(needs(p)&&!p.handoff) items+='<button data-act="idone"><b>No reply needed</b><span class="m">Clear it from Needs reply</span></button>';
      if(p.owner!==M.you().name) items+='<button data-act="iassign"><b>Assign to me</b><span class="m">'+(p.owner?"Now with "+esc(p.owner):"Nobody owns this yet")+'</span></button>';
      if(p.setterPaused||p.handoff) items+='<button data-act="handback"><b>Hand back to Milton</b><span class="m">Milton picks the conversation up again</span></button>';
    }
    if(p.unnamed) items+='<button data-act="panel" data-id="inname:'+p.id+'"><b>Add name</b><span class="m">Save this number as a contact</span></button>';
    items+='<button class="detb" data-act="idetails"><b>Details</b><span class="m">Sessions, credits, money, documents</span></button><button data-act="record" data-id="'+p.id+'"><b>Open contact record</b></button>';
    return '<div class="ithread"><div class="ithead"><div class="nmc"><button class="btn sm quiet iback" data-act="iback" aria-label="Back to the list">Back</button><span class="av">'+p.initials+'</span><div><div class="h3" style="font-size:17px">'+esc(p.name)+'</div><div class="chips">'+M.statusChip(M.status(p))+handlerChip(p)+'</div></div></div><div class="acts">'+(miltonOn(p)?'<button class="btn sm" data-act="take">Take over</button>':"")+(p.phone?'<button class="btn sm" data-act="callp" data-id="'+p.id+'">Call</button>':"")+'<span class="pswrap"><button class="btn sm quiet" data-act="imore" aria-expanded="'+st.more+'">More</button>'+(st.more?'<span class="menu">'+items+'</span>':"")+'</span></div></div>'+bodyHTML(p)+'</div>';
  }
  function setterLeads(){return M.people().filter(function(p){return p.milton||p.miltonBooked||p.handoff||p.setterPaused})}
  function sendHTML(s){
    var stats=s.stats, replies=s.replies||[];
    if(s.setter){
      var L=setterLeads();
      stats=[["Leads contacted",L.length],["Replied",L.filter(function(p){return p.thread.some(function(x){return x.k==="in"})}).length],["Booked",L.filter(function(p){return p.miltonBooked}).length],["Handed to the team",L.filter(function(p){return p.handoff}).length]];
      replies=L.map(function(p){var l=lastMsg(p); return {pid:p.id,text:(l.k==="milton"?"Milton: ":"")+l.body,chip:p.miltonBooked?"Booked":(p.handoff?"Needs a person":(p.setterPaused?"Team took over":"In progress")),cls:p.miltonBooked?"ok":(p.handoff?"warn":(p.setterPaused?"":"glow"))}});
    }
    var h='<div class="ithread"><div class="ithead"><div class="nmc"><button class="btn sm quiet iback" data-act="iback">Back</button><div><div class="h3">'+esc(s.name)+'</div><div class="chips"><span class="chip '+(s.setter?"glow":(s.kind==="Broadcast"?"mist":""))+'">'+s.kind+'</span><span class="chip">'+s.ch+'</span><span class="chip">'+esc(s.when)+'</span></div></div></div><div class="acts">'+(s.kind==="Workflow"?'<button class="btn sm" data-act="iwf">Open workflow</button>':'<button class="btn sm" data-act="later" data-id="'+(s.setter?"The setter settings":"The broadcast view")+'">'+(s.setter?"Setter settings":"View broadcast")+'</button>')+'</div></div><div class="isbody"><div><div class="k">Goes to</div><div style="margin-top:3px">'+esc(s.aud)+'</div></div><div><div class="k">'+(s.setter?"How it works":"Message")+'</div><div class="box" style="margin-top:6px">'+esc(s.body)+'</div></div><div class="statgrid">'+stats.map(function(x){return '<div><span class="k">'+x[0]+'</span><b>'+x[1]+'</b></div>'}).join("")+'</div><div><div class="k">'+(s.setter?"Conversations":"Replies")+'</div>';
    if(!replies.length) h+='<div class="m" style="margin-top:6px">No replies yet. Any reply shows here and in that person\'s conversation. A reply within 72 hours counts against the send before it.</div>';
    replies.forEach(function(r){var p=M.person(r.pid); h+='<div class="row"><span class="av">'+p.initials+'</span><div class="what"><div class="t">'+esc(p.name)+'</div><div class="m">'+esc(r.text)+'</div></div><span class="chip '+r.cls+'">'+r.chip+'</span><button class="link" data-act="inboxp" data-id="'+r.pid+'">Open conversation</button></div>'});
    return h+'</div></div></div>';
  }
  M.pages.inbox={
    title:"Inbox",
    render:function(){
      var all=order(), nN=all.filter(needs).length, nM=all.filter(miltonOn).length;
      if(!st.pid||!M.person(st.pid)){var f=all.filter(needs)[0]||all[0]; st.pid=f.id}
      var p=M.person(st.pid), tabs=[["needs","Needs reply",nN,true],["milton","Milton",nM],["all","All",all.length],["sent","Sent"]];
      return '<p class="sub">Everyone your gym is talking to, and everything that was sent to them.</p><div class="ishell'+(st.tab==="sent"?" sent":"")+(st.open?" iopen":"")+(st.details&&st.tab!=="sent"?" idet":"")+'"><div class="ilist"><div class="iltop"><div class="itabs">'+tabs.map(function(t){return '<button data-act="itab" data-id="'+t[0]+'" aria-pressed="'+(st.tab===t[0])+'">'+t[1]+(t[2]!==undefined?'<span class="n'+(t[3]&&t[2]?" hot":"")+'">'+t[2]+'</span>':"")+'</button>'}).join("")+'</div>'+(st.tab==="sent"?'<div class="m">Broadcasts, workflows and the setter. Each send is also logged in every recipient\'s conversation.</div>':'<div class="acts" style="flex-wrap:nowrap"><input class="search" id="q" type="search" placeholder="Search people" aria-label="Search people"><button class="btn sm" data-act="panel" data-id="dial">New call</button></div>')+'</div><div class="irows" id="irows">'+listHTML()+'</div></div>'+(st.tab==="sent"?sendHTML(sends.filter(function(s){return s.id===st.sid})[0]):threadHTML(p)+ctxHTML(p))+'</div>';
    },
    after:function(){var sc=$("scroll"); if(sc) sc.scrollTop=sc.scrollHeight},
    brief:function(){
      var nd=order().filter(needs), ml=order().filter(miltonOn), items=[];
      if(nd.length) items.push('<span class="k">Needs reply</span>');
      nd.forEach(function(p){var l=lastMsg(p); items.push('<button class="link" data-act="inboxp" data-id="'+p.id+'">'+esc(p.name)+'</button> '+(p.handoff?"I handed this one off. "+esc(p.handoff.reason)+".":(l.k==="call"?"called "+(l.day==="Today"?"at "+l.t:"on "+l.day)+" and left a voicemail.":"wrote "+(l.day==="Today"?"at "+l.t:"on "+l.day)+" by "+l.ch.toLowerCase()+".")))});
      if(ml.length) items.push('<span class="k">I am handling</span>');
      ml.forEach(function(p){items.push('<button class="link" data-act="inboxp" data-id="'+p.id+'">'+esc(p.name)+'</button> '+(p.miltonBooked?"is booked for "+p.appts[0].day+" at "+p.appts[0].time+".":"has not replied yet. I follow up today."))});
      return {hd:(nd.length?M.plural(nd.length,"person needs","people need")+" a reply.":"Nobody is waiting on a reply.")+" I am handling "+M.plural(ml.length,"lead")+".",items:items,hint:"Ask Milton about your inbox",sugg:["Draft a reply to Dana","Send a broadcast","How are my new leads doing?","Show an incoming call"]};
    },
    ask:function(q){
      if(/draft/i.test(q)){st.tab="all"; st.pid="dana"; st.open=true; st.details=false; cv.note=false; M.render(); $("msgInput").value="Yes, camp is still on for Saturday. Thanks for taking care of the link tonight."; M.say(q,"I put a draft in Dana's conversation. Edit it or press Send. Nothing goes out until you do."); return true}
      if(/broadcast/i.test(q)){M.say(q,"Tell me who it goes to and what it should say. I will show you the audience count and the exact message before anything sends. After that it appears under Sent and in each person's conversation."); return true}
      if(/lead/i.test(q)){st.tab="sent"; st.sid="s4"; st.open=true; M.render(); var L=setterLeads(); M.say(q,L.length+" leads came in through the Free intro class form. "+L.filter(function(p){return p.miltonBooked}).length+" booked, "+L.filter(function(p){return p.handoff}).length+" handed to the team, the rest in progress. I opened the setter on the right."); return true}
      if(/incoming/i.test(q)){ if(M.call){M.toast("Finish the current call first.");return true} st.incoming="nina"; M.renderCall(); return true}
      return false;
    }
  };
  /* incoming call card, shown with the other call cards */
  M.callExtra=function(){
    if(!st.incoming) return "";
    var p=M.person(st.incoming);
    return '<div class="callbar" role="alertdialog" aria-label="Incoming call"><div class="r"><div class="av">'+p.initials+'</div><div><div class="s2">Incoming call to the gym number. The gym phone is ringing too.</div><div class="nm2">'+esc(p.name)+'</div><div class="s2">'+M.status(p)+(p.handoff?". Milton handed this lead to the team: "+esc(p.handoff.reason.toLowerCase())+".":(p.appts[0]?". Next session "+p.appts[0].day+", "+p.appts[0].time+".":"."))+'</div></div></div><div class="acts"><button class="btn gogo" data-act="ianswer">Answer here</button><button class="btn end" data-act="idecline">To voicemail</button></div></div>';
  };
  M.afterCall=function(p){ if(p.unnamed) M.openPanel("inname",p.id) };
  function digits(v){var d=String(v).replace(/\D/g,""); return d.length===11&&d[0]==="1"?d.slice(1):d}
  function pretty(d){return d.length===10?"("+d.slice(0,3)+") "+d.slice(3,6)+"-"+d.slice(6):d}
  function matchNum(v){var d=digits(v); if(d.length<10) return null; return M.people().filter(function(p){return digits(p.phone)===d})[0]||null}
  function matchHTML(){var d=digits(st.dial), m=matchNum(st.dial); if(d.length<10) return "Type or paste a number."; if(m) return "This is <b>"+esc(m.name)+"</b>, "+M.status(m).toLowerCase()+". The call is logged in their conversation."; return "Not in your contacts. Milton asks for a name after the call and saves them as a Lead."}
  M.panels.dial=function(){
    return '<div class="sph"><div><h3>New call</h3><div class="m">They see the gym number, '+GYM_NUM+'</div></div>'+M.px+'</div><div class="spb"><div class="field"><label for="dialInput">Phone number</label><input id="dialInput" type="tel" inputmode="tel" autocomplete="off" placeholder="(316) 555-0100" value="'+esc(st.dial)+'" autofocus></div><div class="m" id="dialMatch">'+matchHTML()+'</div><div class="keys">'+["1","2","3","4","5","6","7","8","9","Clear","0","Del"].map(function(k){return '<button data-act="dkey" data-id="'+k+'"'+(k.length>1?' style="font-size:13px"':"")+'>'+k+'</button>'}).join("")+'</div></div><div class="spf"><button class="btn pri" data-act="dialgo" data-id="browser">Call from this computer</button><button class="btn" data-act="dialgo" data-id="phone">Ring the gym phone first</button></div>';
  };
  M.panels.inname=function(pn){var p=M.person(pn.arg); return '<div class="sph"><div><h3>Who was that?</h3><div class="m">'+p.phone+'</div></div>'+M.px+'</div><form class="spb" id="innameForm"><div class="m">Save them so the call, and anything after it, has a home.</div><div class="field"><label for="saveName">First and last name</label><input id="saveName" type="text" autocomplete="off" autofocus><div class="errmsg" id="saveErr" hidden>Add a name, or choose Not now.</div></div></form><div class="spf"><button class="btn pri" data-act="innamesave">Save as a Lead</button><button class="btn" data-act="pclose">Not now</button></div>'};

  var A=M.acts;
  function cur(){return M.person(cv.pid)}
  A.rfilt=function(id){cv.filt=id; M.render()};
  A.chan=function(id){cv.ch[cv.pid]=id; cv.note=false; M.render()};
  A.notemode=function(){cv.note=!cv.note; M.render()};
  A.focusmsg=function(){cv.note=false; M.render(); var c=$("conv"); if(c&&c.scrollIntoView) c.scrollIntoView({block:"center"}); if($("msgInput")) $("msgInput").focus()};
  A.transcript=function(id){var it=cur().thread[+id]; it.open=!it.open; M.render()};
  A.qsend=function(id){var p=cur(), q=p.thread[+id]; p.thread.splice(+id,1,{k:"milton",ch:"Text",day:"Today",t:"just now",body:q.next}); M.render(); M.toast("Follow-up sent by Milton. Prototype only, nothing was sent.")};
  A.qskip=function(id){var p=cur(); p.thread.splice(+id,1); M.render(); M.toast("Follow-up skipped. Milton waits for "+p.first+" to reply.")};
  A.take=function(){takeOver(cur()); M.render(); M.toast("You have this conversation now. Milton stopped.")};
  A.handback=function(){var p=cur(); st.more=false; p.setterPaused=false; p.handoff=null; p.milton=true; p.cleared=false; p.owner="Milton, appointment setter"; p.thread.push({k:"event",day:"Today",t:"just now",body:"Handed back to Milton. Goal: book the free intro class"}); M.render(); M.toast("Milton picks the conversation back up.")};
  A.inboxp=function(id){st.tab="all"; st.q=""; st.pid=id; st.open=true; st.details=false; st.more=false; M.go("inbox")};
  A.msgrow=A.inboxp;
  A.unmerge=function(){M.undoMerge(cur())};
  A.itab=function(id){st.tab=id; st.details=false; st.open=false; st.more=false; if(id!=="sent"){var ids=order().filter(function(p){return id==="needs"?needs(p):(id==="milton"?miltonOn(p):true)}); if(ids.length&&!ids.some(function(p){return p.id===st.pid})) st.pid=ids[0].id} M.render()};
  A.ipick=function(id){st.pid=id; st.open=true; st.details=false; st.more=false; cv.note=false; if($("msgInput")) $("msgInput").value=""; M.render()};
  A.isend=function(id){st.tab="sent"; st.sid=id; st.open=true; if(M.route.page!=="inbox") M.go("inbox"); else M.render()};
  A.iback=function(){st.open=false; st.details=false; M.render()};
  A.idetails=function(){st.details=!st.details; st.open=true; st.more=false; M.render()};
  A.imore=function(){st.more=!st.more; M.render()};
  A.iassign=function(){var p=cur(); p.owner=M.you().name; st.more=false; M.render(); M.toast(p.first+" is assigned to you.")};
  A.idone=function(){var p=cur(); p.cleared=true; st.more=false; M.render(); M.toast("Cleared from Needs reply. It comes back if "+p.first+" writes again.")};
  A.iwf=function(){M.go({page:"crm",tab:"workflows"})};
  A.dkey=function(id){st.dial=id==="Clear"?"":(id==="Del"?st.dial.slice(0,-1):st.dial+id); $("dialInput").value=st.dial; $("dialMatch").innerHTML=matchHTML()};
  A.dialgo=function(id){
    var d=digits(st.dial); if(d.length<10){M.toast("Enter a 10 digit number first.");return}
    var m=matchNum(st.dial);
    if(!m){var nid="u"+Date.now(); DB.people.unshift({id:nid,name:pretty(d),unnamed:true,added:DB.TODAY,source:"Dialed from Milton",tags:["Unsaved number"],stage:"In conversation",phone:pretty(d),email:"",owner:M.you().name,thread:[{k:"event",day:"Today",t:"just now",body:"New number dialed by "+M.you().name}]}); m=M.person(nid)}
    st.dial=""; st.tab="all"; st.pid=m.id; st.open=true; M.closePanel(); M.cp={id:m.id}; M.acts.cstart(id); M.render();
  };
  A.ianswer=function(){var id=st.incoming; st.incoming=null; st.pid=id; st.tab="all"; st.open=true; M.call={id:id,mode:"browser",t0:Date.now(),dir:"in"}; M.render(); M.toast("Connected. The gym phone stopped ringing.")};
  A.idecline=function(){var p=M.person(st.incoming); st.incoming=null; p.cleared=false; p.thread.push({k:"call",dir:"missed",day:"Today",t:"just now",title:"Missed call, voicemail 0:14",body:"Voicemail: Hi, it is "+p.first+", following up on my text about Saturday. Call me back when you can."}); M.render(); M.toast("Sent to voicemail. "+p.first+" is in Needs reply.")};
  A.innamesave=function(){
    var p=M.person(M.panel.arg), nm=$("saveName").value.trim(); if(!nm){$("saveErr").hidden=false; return}
    p.name=nm; p.first=M.first(nm); p.initials=M.initials(nm); p.unnamed=false; p.tags=p.tags.filter(function(t){return t!=="Unsaved number"});
    p.thread.push({k:"event",day:"Today",t:"just now",body:"Saved as a Lead by "+M.you().name}); M.closePanel(); M.render(); M.toast(nm+" saved as a Lead.");
  };
  M.submits.innameForm=function(){A.innamesave()};
  M.submits.sendForm=function(){
    var p=cur(), v=$("msgInput").value.trim(); if(!v) return;
    $("msgInput").value="";
    if(cv.note){p.thread.push({k:"note",day:"Today",t:"just now",by:M.you().name,body:v}); M.render(); M.toast("Note added. Only your team sees it."); return}
    if(miltonOn(p)||p.handoff) takeOver(p); else if(!p.owner) p.owner=M.you().name;
    p.cleared=false;
    p.thread.push({k:"out",day:"Today",t:"just now",ch:chan(p),by:M.you().name,body:v});
    if(cv.filt==="calls") cv.filt="all";
    M.render(); if($("msgInput")) $("msgInput").focus(); M.toast("Logged in the conversation. Prototype only, nothing was sent.");
  };
  M.inputs.push(function(el){
    if(el.id==="dialInput"){st.dial=el.value; $("dialMatch").innerHTML=matchHTML()}
    if(el.id==="q"&&M.route.page==="inbox"){st.q=el.value; $("irows").innerHTML=listHTML()}
  });
  var ob=M.onBlank; M.onBlank=function(){ if(st.more){st.more=false; if(M.route.page==="inbox") M.render()} if(ob) ob() };
})();
