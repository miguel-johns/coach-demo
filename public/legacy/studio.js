/* Studio: reports, stories and guides for clients.
   Screens follow Milton_Studio_in_the_Home_flow.html (Home card, Studio, one creation with its views, checks and versions).
   The reports are drawn from the component catalog in studio_kit.js and keep their own look.
   Everything around them follows the Rule Sheet: side panels for short tasks, a centered window only to confirm. */
(function(){
  var esc=M.esc, $=M.$, A=M.acts, K=SK, MB=K.MEMBERS;
  function el(type,props,children){return {type:type,props:props||{},children:children||[]}}
  function clone(o){return JSON.parse(JSON.stringify(o))}
  var LIFT={devon:["squat_e1rm","deadlift_e1rm","bench_e1rm"],dana:["trapbar_e1rm","goblet_e1rm","row_e1rm"],leah:["hipthrust_e1rm","goblet_e1rm","pushup_reps"]};
  var LEAD={devon:"squat_e1rm",dana:"trapbar_e1rm",leah:"hipthrust_e1rm"};

  /* ---------- what Milton writes: specs built from the catalog. Numbers are only ever {{keys}}. ---------- */
  function reportSpec(id){
    var m=MB[id], L=LIFT[id], f=m.first;
    return {root:"r",elements:{
      r:el("ReportLayout",{title:"Your 12-Week Progress",subtitle:"Steady work, and it shows.",theme:"milton"},["hero","stats","s1","s2","s3","coach"]),
      hero:el("Hero",{variant:"metric",eyebrow:"12-week check-in",headline:f+", you got stronger every month.",body:"Strength is up across your main lifts, and you made {{sessions}} sessions in the last 30 days. That kind of consistency is what builds the strength you are after.",data:"strength_index"}),
      stats:el("Stats",{variant:"tiles",items:[{data:"consistency"},{data:"sessions"},{data:"steps_avg"},{data:"sleep_avg"}]}),
      s1:el("Section",{eyebrow:"What improved",title:"Strength"},["lifts","ltxt"]),
      lifts:el("MultiLine",{title:"Your main lifts",data:L,caption:"Estimated from your logged working sets."}),
      ltxt:el("TextBlock",{body:"Your "+m.data[L[0]].label.replace(" (est. 1RM)","").toLowerCase()+" moved {{"+L[0]+".change}} and your "+m.data[L[1]].label.replace(" (est. 1RM)","").toLowerCase()+" moved {{"+L[1]+".change}}. The bar is moving faster, and the technique work is paying off."}),
      s2:el("Section",{eyebrow:"What you are doing well",title:"Consistency",layout:"two-column"},["grid","wins"]),
      grid:el("ConsistencyGrid",{data:"habits",caption:"Each circle is a planned health action. Filled means done."}),
      wins:el("List",{variant:"wins",title:"Wins worth celebrating",items:[{title:"You showed up",detail:"{{sessions}} sessions in the last 30 days."},{title:"Moving more",detail:"Steps averaged {{steps_avg}}, {{steps_avg.delta}}."},{title:"Stronger",detail:"Strength up {{strength_index}} across your main lifts."}]}),
      s3:el("Section",{eyebrow:"Next 4 weeks",title:"What to focus on next"},["watch","focus"]),
      watch:el("Callout",{tone:"watch",title:"Protein is the gap",body:"You averaged {{protein_avg}} against a {{protein_avg.target}} target, and logged food on {{weekend_logging}} on weekends."}),
      focus:el("List",{variant:"focus",title:"Your focus list",items:[{title:"Protein at every meal",detail:"Prep two grab-and-go options on Sunday night.",note:"Protein supports the strength you are building."},{title:"Keep your training rhythm",detail:"Same days, same times.",note:"Consistency is your superpower right now."},{title:"Lights out 30 minutes earlier",detail:"Sleep is averaging {{sleep_avg}}.",note:"Recovery is where the strength shows up."}]}),
      coach:el("CoachNote",{body:f+", the way you have shown up these twelve weeks is how people reach their goals. Proud of you. Let's keep going.",from:m.coach})
    }};
  }
  function reportShort(id){
    var m=MB[id], L=LIFT[id], f=m.first;
    return {root:"r",elements:{
      r:el("ReportLayout",{title:"Your 12-Week Progress",subtitle:"Stronger every month.",theme:"gym"},["hero","stats","lifts","grid","sec","plan","coach"]),
      hero:el("Hero",{variant:"number",eyebrow:"12 weeks",headline:"Stronger every single month.",body:"Main lift {{"+L[0]+".change}}. Sessions {{sessions}}.",data:"strength_index"}),
      stats:el("Stats",{variant:"compact",items:[{data:"consistency"},{data:"sessions"},{data:"steps_avg"},{data:"sleep_avg"}]}),
      lifts:el("Dumbbell",{title:"Week 1 vs now",data:L}),
      grid:el("ConsistencyGrid",{data:"habits"}),
      sec:el("Section",{title:"Your focus areas",layout:"three-column"},["i1","i2","i3"]),
      i1:el("Illustration",{subject:"Protein",caption:"{{protein_avg.target}} a day"}),
      i2:el("Illustration",{subject:"Sleep",caption:"7 hours, 5 nights a week"}),
      i3:el("Illustration",{subject:"Routine",caption:"Same days, same times"}),
      plan:el("ActionPlan",{title:"Your next four weeks",weeks:[{label:"Week 1",theme:"Set the food plan",actions:["Prep 2 protein snacks Sunday","Log every work day","All sessions booked"]},{label:"Week 2",theme:"Add the load",actions:["One more rep per top set","Protein at breakfast","Lights out by 10:30"]},{label:"Week 3",theme:"Build volume",actions:["Extra back-off set","Hit protein 6 of 7 days","Walk 20 min after dinner"]},{label:"Week 4",theme:"Test and celebrate",actions:["Test the main lift","Monthly check-in","New goals with your coach"]}]}),
      coach:el("CoachNote",{body:"Proud of you, "+f+". Next stop: the next plate.",from:m.coach})
    }};
  }
  function guideSpec(id){
    var m=MB[id];
    return {root:"r",elements:{
      r:el("ReportLayout",{title:"Your Work-Day Protein Guide",subtitle:"Busy days, one simple plan.",theme:"milton"},["hero","why","pics","list","call","coach"]),
      hero:el("Hero",{variant:"metric",eyebrow:"Guide",headline:"Training is solid. Food on busy days is the gap.",body:"You averaged {{protein_avg}} against a {{protein_avg.target}} target.",data:"protein_avg"}),
      why:el("TextBlock",{variant:"lead",body:"Protein is what turns the training you are already doing into strength. You do not need a new diet, just a plan for the days that get away from you."}),
      pics:el("Section",{title:"Three easy wins",layout:"three-column"},["p1","p2","p3"]),
      p1:el("Illustration",{subject:"Protein",caption:"A shake you can drink in the car"}),
      p2:el("Illustration",{subject:"Meal prep",caption:"Two boxes ready on Sunday"}),
      p3:el("Illustration",{subject:"Eggs",caption:"Protein within an hour of waking"}),
      list:el("List",{variant:"checklist",title:"Your work-day checklist",items:[{title:"Prep two grab-and-go protein options on Sunday night"},{title:"Eat protein within an hour of waking"},{title:"Order the protein first when you eat out"},{title:"Log the day before bed",detail:"Even a rough log counts."}]}),
      call:el("Callout",{tone:"info",title:"Why this matters for you",body:"Your goal: {{member.goal}}. Hitting {{protein_avg.target}} a day supports the strength you built this block."}),
      coach:el("CoachNote",{body:"Small fix, big payoff. You have got this.",from:m.coach})
    }};
  }
  function storySpec(id,title,kind){
    var m=MB[id], k=LEAD[id], L=LIFT[id], f=m.first, low=m.data[k].label.replace(" (est. 1RM)","");
    return {root:"s",elements:{
      s:el("StoryLayout",{title:title,kind:kind||"Recap",theme:"story"},["hero","lift","show","habit","then","quote","rc"]),
      hero:el("StoryHero",{label:"12 weeks",metric:"strength_index",headline:"stronger in 12 weeks",sub:"{{member.name}} · {{gym.name}}"}),
      lift:el("StoryStat",{label:"Strength",headline:"The "+low.toLowerCase()+" moved",metric:k,show:"delta",sub:low+" {{"+k+".start}} to {{"+k+"}}",note:"Estimated from every logged working set"}),
      show:el("StoryStat",{label:"Showing up",headline:f+" kept showing up",metric:"sessions",sub:"sessions attended in the last 30 days",note:"Each square is a scheduled session"}),
      habit:el("StoryStat",{label:"Habits",headline:"The small stuff added up",metric:"consistency",sub:"of planned health actions done",note:"Training, steps, sleep and food logging. {{consistency.delta}} on the month before."}),
      then:el("StoryCompare",{label:"Then and now",metrics:[L[1],L[2],"steps_weekly"],note:"Same person. New baseline."}),
      quote:el("StoryQuote",{label:"From your coach",body:f+" showed up on the days it would have been easy not to. That is the whole game.",from:m.coach}),
      rc:el("StoryReceipts",{label:"The receipts",headline:"12 weeks of proof",metrics:["sessions",k,L[1],"consistency"],note:"Every number from {{member.firstName}}'s own logs."})
    }};
  }
  function storyShort(id,title){
    var m=MB[id], k=LEAD[id], low=m.data[k].label.replace(" (est. 1RM)","").toLowerCase(), full=storySpec(id,title);
    return {root:"s",elements:{
      s:el("StoryLayout",{title:title,kind:"Recap",theme:"story"},["lead","climb","quote","rc"]),
      lead:el("StoryHero",{label:"12 weeks",metric:k,show:"delta",headline:"on the "+low,sub:"{{member.name}} · {{gym.name}}"}),
      climb:el("StoryClimb",{label:"The climb",headline:"A little more every few weeks",metric:k,note:"Estimated from every logged working set"}),
      quote:full.elements.quote, rc:full.elements.rc
    }};
  }
  function milestoneSpec(id,title){
    var m=MB[id], k=LEAD[id], low=m.data[k].label.replace(" (est. 1RM)","");
    return {root:"s",elements:{
      s:el("StoryLayout",{title:title,kind:"Milestone",theme:"story"},["hero","climb","quote"]),
      hero:el("StoryHero",{label:"New best",metric:k,headline:"and still climbing",sub:low+" · {{member.name}}"}),
      climb:el("StoryClimb",{label:"The climb",headline:"{{"+k+".change}} in 12 weeks",metric:k,note:"Built around a cranky knee, one careful week at a time"}),
      quote:el("StoryQuote",{label:"From your coach",body:"Pain-free at full depth, and the bar moved fast. That is what the work is for.",from:m.coach})
    }};
  }
  /* ---------- state ---------- */
  var wk=null;
  var st={all:false,aq:"",ak:"All types",as:"All statuses",an:12,arts:[],cur:null,view:"main",ver:null,si:0,goal:null,building:null,
    scheduled:[{id:"leah12",pid:"leah",title:"Leah: first 12 weeks",date:"Nov 23",meta:"Builds Nov 23, when her first block closes"}],
    sent:[
      {title:"Weekend protein guide",kind:"Guide",who:"Billy Tran",date:"Oct 30",shared:true,opens:9,views:124,leads:3},
      {title:"Chris's October progress report",kind:"Report",who:"Chris Whitfield",date:"Nov 2",shared:true,opens:6,views:88,leads:2},
      {title:"Ava: first strict pull-up",kind:"Milestone",who:"Ava Lindqvist",date:"Oct 26",shared:true,opens:5,views:41,leads:1},
      {title:"Marcus's October recap",kind:"Recap",who:"Marcus Hale",date:"Nov 1",shared:false,opens:2,views:0,leads:0},
      {title:"Priya's first 8 weeks",kind:"Recap",who:"Priya Nair",date:"Oct 22",shared:true,opens:4,views:36,leads:0,old:true},
      {title:"Squat depth guide",kind:"Guide",who:"Marcus Hale",date:"Oct 19",shared:false,opens:3,views:0,leads:0,old:true},
      {title:"Billy's September progress report",kind:"Report",who:"Billy Tran",date:"Oct 3",shared:false,opens:5,views:0,leads:0,old:true},
      {title:"Chris: 100 sessions",kind:"Milestone",who:"Chris Whitfield",date:"Sep 28",shared:true,opens:7,views:62,leads:1,old:true},
      {title:"Ava's September recap",kind:"Recap",who:"Ava Lindqvist",date:"Sep 30",shared:true,opens:3,views:29,leads:0,old:true},
      {title:"Travel week training guide",kind:"Guide",who:"Priya Nair",date:"Sep 24",shared:false,opens:2,views:0,leads:0,old:true},
      {title:"Marcus's September recap",kind:"Recap",who:"Marcus Hale",date:"Oct 1",shared:false,opens:1,views:0,leads:0,old:true},
      {title:"Billy: first 200 lb deadlift",kind:"Milestone",who:"Billy Tran",date:"Sep 17",shared:true,opens:6,views:54,leads:1,old:true},
      {title:"Chris's September progress report",kind:"Report",who:"Chris Whitfield",date:"Oct 2",shared:false,opens:4,views:0,leads:0,old:true},
      {title:"Sleep basics handout",kind:"Guide",who:"Ava Lindqvist",date:"Sep 12",shared:false,opens:2,views:0,leads:0,old:true}]};
  function rootOf(s){return s.elements[s.root]}
  function isStorySpec(s){return rootOf(s).type==="StoryLayout"}
  function last(a){return a.versions[a.versions.length-1]}
  function isStory(a){return isStorySpec(last(a).spec)}
  function kind(a){return a.kind||(isStory(a)?"Story":"Report")}
  function addVer(a,spec,by,note){var v=K.validate(clone(spec),MB[a.pid]); a.versions.push({n:a.versions.length+1,spec:v.spec,issues:v.issues,count:v.count,by:by,note:note}); a.status="Draft"; a.updated="Just now"; st.ver=null; return v}
  function make(o){var a={id:o.id||("art"+Date.now()+Math.floor(Math.random()*99)),title:o.title,pid:o.pid,kind:o.kind,origin:o.origin||null,slug:o.slug||o.pid+"-"+String(Date.now()).slice(-4),share:!!o.share,versions:[],status:"Draft",leads:0}; addVer(a,o.spec,"Milton","First draft"); a.updated=o.updated||"Just now"; st.arts.push(a); return a}
  function art(id){return st.arts.filter(function(a){return a.id===id})[0]}
  function ready(){return st.arts.filter(function(a){return a.origin&&a.status!=="Sent"})}
  make({id:"a_rep",title:"Devon's 12-week progress report",pid:"devon",kind:"Report",spec:reportSpec("devon"),slug:"devon-12-weeks",updated:"Yesterday"});
  make({id:"a_sty",title:"Devon's 12-week story",pid:"devon",kind:"Recap",spec:storySpec("devon","Devon's 12-week story"),slug:"devon-story",share:true,updated:"Today, 6:12 AM",origin:{why:"Devon's 12-week block closed Nov 19",hl:"{{squat_e1rm.change}} squat · {{sessions}} sessions · {{consistency}} consistency"}});
  make({id:"a_ms",title:"Dana: trap bar milestone",pid:"dana",kind:"Milestone",spec:milestoneSpec("dana","Dana: trap bar milestone"),slug:"dana-trapbar",share:true,updated:"Today, 8:26 AM",origin:{why:"Dana logged a new trap bar best Nov 9",hl:"Trap bar deadlift {{trapbar_e1rm}}, {{trapbar_e1rm.change}}"}});
  var KCH={Report:"mist",Guide:"mist",Story:"glow",Recap:"glow",Milestone:"ok",Consistency:"glow"}, SCH={Draft:"",Approved:"mist",Sent:"ok"};
  function chipK(a){return '<span class="chip '+(KCH[kind(a)]||"")+'">'+kind(a)+'</span>'}
  function link(a){return K.GYM.link+a.slug}
  function draw(a,ver,ctx){return K.render(ver.spec,MB[a.pid],ctx)}
  function thumb(a){var v=last(a); return '<div class="st-thumb">'+(isStory(a)?K.slot("th_"+a.id,draw(a,v,{one:0}),"thumb"):'<div class="st-thumbr">'+K.slot("th_"+a.id,draw(a,v),"thumb")+'</div>')+'</div>'}

  /* ---------- Studio page ---------- */
  function listHTML(){
    var R=ready(), h='<p class="sub">Reports, stories and guides for your clients. Milton builds them from each client\'s own data, and nothing goes out until you approve it.</p>';
    h+='<section class="st-sec"><div class="st-h"><h3>Ready for review</h3>'+(R.length?'<span class="chip solid">'+R.length+'</span>':"")+'<span class="m">Milton made these on his own. Nothing goes out until you approve.</span></div>'
      +(R.length?'<div class="st-ready">'+R.map(function(a){var m=MB[a.pid]; return '<article class="card st-rc">'+thumb(a)+'<div class="st-rcb"><div class="t">'+esc(a.title)+'</div><div class="rbar">'+chipK(a)+(a.status==="Approved"?'<span class="chip mist">Approved</span>':"")+'</div><p class="m">Milton made this because '+esc(a.origin.why.charAt(0).toLowerCase()==="d"?a.origin.why:a.origin.why)+'.</p><div class="st-hl">'+K.rt(a.origin.hl,m)+'</div><div class="acts"><button class="btn sm pri" data-act="stopen" data-id="'+a.id+'">Review</button></div></div></article>'}).join("")+'</div>'
        :'<div class="card"><div class="empty"><span><b>You are caught up</b><br>Milton puts new stories here when a client hits a milestone or finishes a block.</span></div></div>')+'</section>';
    var starts=[["Report","Progress report","A client's 12 weeks, explained"],["Story","Progress story","Cards a client will want to share"],["Guide","Guide or handout","Teach one thing, on one page"]];
    h+='<section class="st-sec"><div class="st-h"><h3>Make something</h3><span class="m">Pick a starting point, or ask Milton in the chat.</span></div><div class="st-starts">'+starts.map(function(s){return '<button class="opt" data-act="stnew" data-id="'+s[0]+'"><b>'+s[1]+'</b><span class="m">'+s[2]+'</span></button>'}).join("")+'</div></section>';
    if(st.building) h+='<section class="st-sec"><div class="st-h"><h3>Coming up</h3></div><div class="card"><div class="row"><div class="what"><div class="t">Building '+esc(st.building.title)+'</div><div class="m" id="stStep" aria-live="polite">Reading the verified data</div></div><span class="chip glow">Milton is working</span></div></div></section>';
    else if(st.scheduled.length) h+='<section class="st-sec"><div class="st-h"><h3>Coming up</h3></div><div class="card">'+st.scheduled.map(function(s){return '<div class="row"><div class="what"><div class="t">'+esc(s.title)+'</div><div class="m">'+esc(s.meta)+'</div></div><span class="chip">Scheduled</span><button class="btn sm" data-act="stgen" data-id="'+s.id+'">Build now</button></div>'}).join("")+'</div></section>';
    var R2=allRows(), recent=st.sent.filter(function(x){return !x.old});
    var shared=recent.filter(function(s){return s.shared}).length+st.arts.filter(function(a){return a.status==="Sent"&&a.share}).length, views=recent.reduce(function(n,s){return n+s.views},0), leads=recent.reduce(function(n,s){return n+s.leads},0)+st.arts.reduce(function(n,a){return n+a.leads},0);
    h+='<section class="st-sec"><div class="st-h"><h3>Recent</h3><span class="m">The last 30 days</span></div><div class="statgrid" style="margin-bottom:10px"><div><span class="k">Shared by clients, 30 days</span><b class="num">'+shared+'</b></div><div><span class="k">Share-page views</span><b class="num">'+views+'</b></div><div><span class="k">New leads in CRM</span><b class="num">'+leads+'</b></div></div><div class="card">'
      +R2.slice(0,5).map(function(r){return r.html}).join("")+(R2.length>5?'<div class="row" style="justify-content:center"><button class="link" data-act="stall" data-id="1">See all '+R2.length+'</button></div>':"")+'</div></section>';
    return h;
  }
  function allRows(){
    var mine=st.arts.filter(function(a){return ready().indexOf(a)<0}).slice().reverse();
    return mine.map(function(a){var m=MB[a.pid]; return {kind:kind(a),status:a.status,text:a.title+" "+m.name,html:'<div class="row"><div class="what"><button class="link t" data-act="stopen" data-id="'+a.id+'">'+esc(a.title)+'</button><div class="m">'+kind(a)+" · "+esc(m.name)+" · "+(a.status==="Sent"?(a.share?"share link on":"sent privately"):"updated "+esc(a.updated.toLowerCase()))+'</div></div><span class="chip '+SCH[a.status]+'">'+a.status+'</span></div>'}})
      .concat(st.sent.map(function(s){return {kind:s.kind,status:"Sent",text:s.title+" "+s.who,html:'<div class="row"><div class="what"><div class="t">'+esc(s.title)+'</div><div class="m">'+s.kind+" · "+esc(s.who)+" · sent "+s.date+" · "+(s.shared?s.views+" views"+(s.leads?", "+M.plural(s.leads,"lead"):""):"opened "+s.opens+" times, not shared")+'</div></div><span class="chip ok">Sent</span></div>'}}));
  }
  function allHTML(){
    var q=st.aq.toLowerCase(), R=allRows().concat(ready().map(function(a){return {kind:kind(a),status:a.status,text:a.title+" "+MB[a.pid].name,html:'<div class="row"><div class="what"><button class="link t" data-act="stopen" data-id="'+a.id+'">'+esc(a.title)+'</button><div class="m">'+kind(a)+" · "+esc(MB[a.pid].name)+' · made by Milton, waiting for review</div></div><span class="chip '+SCH[a.status]+'">'+a.status+'</span></div>'}})), KK=["All types","Report","Guide","Recap","Milestone"], SS=["All statuses","Draft","Approved","Sent"];
    var F=R.filter(function(r){return (st.ak==="All types"||r.kind===st.ak)&&(st.as==="All statuses"||r.status===st.as)&&(!q||r.text.toLowerCase().indexOf(q)>=0)});
    return '<button class="backl" data-act="stall" data-id="">&#8249; Studio</button><section class="card flush"><div class="tool"><div class="count">Everything made in Studio <span class="chip">'+F.length+'</span></div><div class="tr"><input class="fld" id="staq" placeholder="Title or client" aria-label="Search Studio" value="'+esc(st.aq)+'" style="width:200px"><select class="csel" id="stak" aria-label="Type">'+KK.map(function(x){return '<option'+(x===st.ak?" selected":"")+'>'+x+'</option>'}).join("")+'</select><select class="csel" id="stas" aria-label="Status">'+SS.map(function(x){return '<option'+(x===st.as?" selected":"")+'>'+x+'</option>'}).join("")+'</select></div></div><div style="padding:0 18px 6px">'
      +(F.length?F.slice(0,st.an).map(function(r){return r.html}).join(""):'<div class="empty"><span><b>Nothing matches</b><br>Try a different name, type or status.</span></div>')+(F.length>st.an?'<div class="row" style="justify-content:center"><button class="link" data-act="stmore">Show '+Math.min(12,F.length-st.an)+' more</button></div>':"")+'</div></section>';
  }
  function oneHTML(a){
    var m=MB[a.pid], vi=st.ver!=null?st.ver:a.versions.length-1, ver=a.versions[vi], latest=vi===a.versions.length-1, canPick=latest&&a.status!=="Sent"&&st.view==="main", W=latest&&wk&&wk.id===a.id?wk:null;
    if(W){var wv=K.validate(clone(W.spec),m); ver={n:ver.n,spec:wv.spec,issues:wv.issues,count:wv.count,note:ver.note,by:ver.by}}
    var story=isStorySpec(ver.spec), root=rootOf(ver.spec), n=story?root.children.length:0, pk=canPick?((W&&W.sel)||true):null;
    if(st.view==="page") st.view="main"; if(st.si>n-1) st.si=Math.max(0,n-1);
    var errs=ver.issues.filter(function(i){return i[0]==="e"}).length, warns=ver.issues.filter(function(i){return i[0]==="w"}).length;
    var tabs=[["main",story?"Story":kind(a)==="Guide"?"Guide":"Report"]].concat([["client","Client view"],["share","Share page"]]);
    var act=a.status==="Draft"?'<button class="btn pri" data-act="stapprove">Approve</button>':a.status==="Approved"?'<button class="btn pri" data-act="panel" data-id="stsend">Send to '+esc(m.first)+'</button>':"";
    var h='<button class="backl" data-act="stopen" data-id="">&#8249; Studio</button><section class="head"><div class="id" style="flex:1;min-width:240px"><div style="min-width:0"><h2 class="name">'+esc(a.title)+'</h2><div class="chips"><span class="chip '+SCH[a.status]+'">'+(a.status==="Draft"?"Draft, needs review":a.status==="Sent"?"Sent to "+esc(m.first):a.status)+'</span><span class="m">'+kind(a)+" for "+esc(m.name)+(a.origin?". Made by Milton because "+esc(a.origin.why)+".":". Made by Milton at your request.")+'</span></div></div></div><div class="acts">'+act+'</div><div class="wf-tools"><button class="btn sm quiet" data-act="panel" data-id="stchk">'+(errs?errs+" fixed by checks":warns?warns+" to check":"&#10003; Every number verified")+'</button>'+(a.status==="Sent"?"":'<button class="btn sm quiet" data-act="stparts">Change parts</button><button class="btn sm quiet" data-act="panel" data-id="stedit">Edit text</button>')+'<button class="btn sm quiet" data-act="stdl">Download</button><button class="btn sm quiet rm" data-act="stdel">Delete</button></div></section>';
    h+='<div class="rbar" style="margin:14px 0 12px;justify-content:space-between"><div class="seg">'+tabs.map(function(t){return '<button data-act="stview" data-id="'+t[0]+'" aria-pressed="'+(st.view===t[0])+'">'+t[1]+'</button>'}).join("")+'</div><div class="rbar"><span class="m">Versions</span><div class="seg">'+a.versions.map(function(v,i){return '<button data-act="stver" data-id="'+i+'" aria-pressed="'+(i===vi)+'" title="'+esc(v.by+": "+v.note)+'">v'+v.n+'</button>'}).join("")+'</div></div></div>';
    if(!latest) h+='<div class="infobox" style="margin-bottom:12px">Viewing v'+ver.n+" ("+esc(ver.note)+'). Changes go on top of the latest version. <button class="btn sm" data-act="strestore">Restore as a new version</button></div>';
    var lk=a.share?link(a):null;
    if(st.view==="main") h+=story?'<div class="m" style="margin-bottom:6px">What '+esc(m.first)+" gets · "+n+' cards · swipes left to right'+(pk?" · click a card to swap or change it":"")+'</div>'+K.slot("main",draw(a,ver,{link:lk,pick:pk}),pk?"pick":""):(pk?'<div class="m" style="margin-bottom:6px">Click any part to swap it, change what it shows or remove it.</div>':"")+K.slot("main",draw(a,ver,{pick:pk}),pk?"pick":"");
    else if(st.view==="client") h+='<div class="st-phone"><div class="st-phin"><div class="st-phtop"><span>9:41</span><span>'+esc(K.GYM.name)+'</span></div><div class="st-phmsg">'+(a.status==="Sent"?esc(m.coach)+" sent you a "+(story?"story":"report")+".":"Preview. "+esc(m.first)+" sees this in the client app once you approve and send it.")+'</div>'+phoneBody(a,ver,story,root,n,lk)+'</div></div>';
    else h+=shareHTML(a,ver,m,story,root,n);
    return h;
  }
  function phoneBody(a,ver,story,root,n,lk){
    if(!story) return K.slot("main",draw(a,ver),"nar");
    return '<div class="st-story"><div class="st-segs">'+root.children.map(function(_,i){return '<span class="'+(i<=st.si?"on":"")+'"></span>'}).join("")+'</div>'+K.slot("main",'<div class="pl-card">'+draw(a,ver,{one:st.si,link:lk})+'<button class="prev" data-snav="-1" aria-label="Previous card"></button><button class="next" data-snav="1" aria-label="Next card"></button></div>',"")+'<div class="m" style="text-align:center">Card '+(st.si+1)+" of "+n+' · tap right to go on, left to go back</div></div>';
  }
  function shareHTML(a,ver,m,story,root,n){
    var L=a.lead, what=story?"story":"report", lk=link(a);
    var body=story?'<div class="st-spstory">'+K.slot("main",draw(a,ver,{one:st.si,link:lk}),"")+'<div class="rbar" style="justify-content:center;margin-top:8px"><button class="btn sm" data-act="stnav" data-id="-1"'+(st.si===0?" disabled":"")+'>&#8592;</button><span class="m">'+(st.si+1)+" of "+n+'</span><button class="btn sm" data-act="stnav" data-id="1"'+(st.si===n-1?" disabled":"")+'>&#8594;</button></div></div>':'<div class="st-sprpt">'+K.slot("main",draw(a,ver),"nar")+'</div>';
    var cta=L?'<div class="st-cta" role="status"><h3>You are on the list, '+esc(L.name)+'.</h3><p>'+esc(m.coach)+" will text you to set up your free intro at "+esc(K.GYM.name)+'.</p></div>'
      :'<div class="st-cta"><h3>Want a '+what+" like "+esc(m.first)+'\'s?</h3><p>Train with '+esc(m.coach)+" at "+esc(K.GYM.name)+'. Start with a free intro session.</p><div class="field"><label for="stLfName">First name</label><input id="stLfName" autocomplete="off"></div><div class="field"><label for="stLfPhone">Mobile number</label><input id="stLfPhone" inputmode="tel" autocomplete="off"></div><div><div class="m" style="margin-bottom:6px">What are you working toward?</div><div class="rbar">'+["Lose fat","Build strength","Get consistent"].map(function(g){return '<button class="wf-chip" aria-pressed="'+(st.goal===g)+'" data-act="stgoal" data-id="'+g+'">'+g+'</button>'}).join("")+'</div></div><div class="m" id="stLfErr" role="alert" style="color:var(--err);font-weight:600"></div><button class="btn pri" data-act="stlead">Get my free intro</button><p class="m" style="margin:0">By sending this you agree to receive text messages from '+esc(K.GYM.name)+'. Reply STOP to opt out.</p></div>';
    return '<div class="infobox" style="margin-bottom:12px">'+(a.share?'This is the public page behind the share link. <span class="code">'+esc(lk)+'</span> <button class="btn sm" data-act="copy" data-id="https://'+esc(lk)+'">Copy link</button>':"Sharing is off for this one. Turn it on when you send it and "+esc(m.first)+" gets a link to this page.")+' Anyone who fills in the form lands in your CRM as a lead, marked as coming from Studio.</div><div class="st-share"><div class="st-spbrand">'+esc(K.GYM.name)+'</div>'+body+cta+'</div>';
  }
  M.pages.studio={
    title:"Studio",
    top:function(r){return r.id?null:["panel","Make something","stnew"]},
    render:function(r){st.cur=r.id?art(r.id):null; return st.cur?oneHTML(st.cur):st.all?allHTML():listHTML()},
    after:function(){K.fill()},
    brief:function(r){
      var a=r.id&&art(r.id);
      if(!a){var R=ready(); return {hd:R.length?M.plural(R.length,"story is","stories are")+" ready for your review.":"You are caught up in Studio.",items:R.map(function(x){return "<b>"+esc(x.title)+".</b> "+esc(x.origin.why)+"."}).concat(["<b>Coming up.</b> "+(st.scheduled[0]?esc(st.scheduled[0].title)+" builds "+st.scheduled[0].date+".":"Nothing scheduled.")]),hint:"Ask Milton to make something",sugg:["Create a progress report for Dana","Create a story for Leah's first 12 weeks","Make a work-day protein guide for Devon"]}}
      var m=MB[a.pid], v=last(a), story=isStory(a);
      return {hd:esc(a.title)+" is "+(a.status==="Draft"?"a draft":a.status.toLowerCase())+".",items:["Checked "+v.count+" parts against "+esc(m.first)+"'s data. Every number is placed by reference, never typed.","Version "+v.n+" of "+a.versions.length+": "+esc(v.note)+"."],hint:"Ask Milton to change it",sugg:a.status==="Sent"?[]:story?["Make it shorter and lead with the main lift","Use our gym colors"]:["Make it shorter and add a four-week plan","Use our gym colors"]};
    },
    ask:function(q){
      var a=st.cur, t=q.toLowerCase();
      if(!a){var pid=/dana/.test(t)?"dana":/leah/.test(t)?"leah":/devon/.test(t)?"devon":null, k=/story/.test(t)?"Story":/guide|handout/.test(t)?"Guide":/report/.test(t)?"Report":null;
        if(!pid||!k) return false; build(k,pid,q); return true}
      if(a.status==="Sent"){M.say(q,"This one has been sent, so it is locked. I can make a new version as a fresh draft if you want."); return true}
      var m=MB[a.pid], story=isStory(a), cur=clone(last(a).spec), note=null;
      if(/short/.test(t)){cur=story?storyShort(a.pid,a.title):reportShort(a.pid); if(!/gym|color|brand/.test(t)&&!story) cur.elements.r.props.theme=last(a).spec.elements[last(a).spec.root].props.theme||"milton"; note=story?"Shorter, leads with the main lift":"Shorter, with a four-week plan"}
      if(/gym|color|brand/.test(t)){cur.elements[cur.root].props.theme="gym"; note=note?note+", in gym colors":"Gym colors"}
      if(!note) return false;
      var v=addVer(a,cur,"Milton",note); M.render();
      M.say(q,"Done. That is version "+last(a).n+": "+note.toLowerCase()+". I checked "+v.count+" parts against "+m.first+"'s data and every number still comes from the snapshot. It is back to a draft, so it needs your approval again.");
      return true;
    }
  };
  function build(k,pid,q){
    var m=MB[pid], title=k==="Report"?m.first+"'s 12-week progress report":k==="Guide"?m.first+"'s work-day protein guide":m.first+": first 12 weeks";
    var a=make({title:title,pid:pid,kind:k==="Story"?"Recap":k,spec:k==="Report"?reportSpec(pid):k==="Guide"?guideSpec(pid):storySpec(pid,title),share:k==="Story"});
    st.view="main"; st.si=0; M.go({page:"studio",id:a.id});
    M.say(q||("Create a "+k.toLowerCase()+" for "+m.first),"Here is a first draft of "+title+". I pulled "+m.first+"'s last 12 weeks, picked the parts that tell the story, and checked "+last(a).count+" parts against the data. Nothing goes to "+m.first+" until you approve it.");
    return a;
  }
  M.studio={
    ready:function(){return ready().length},
    shared:function(){return st.arts.filter(function(a){return a.status==="Sent"&&a.share}).map(function(a){return [a.title,kind(a)+" · "+MB[a.pid].name,M.plural(a.leads,"lead")]}).concat(st.sent.filter(function(s){return s.shared}).map(function(s){return [s.title,s.kind+" · "+s.who+" · "+s.views+" views",M.plural(s.leads,"lead")]}))},
    forClient:function(pid){return st.arts.filter(function(a){return a.pid===pid})},
    has:function(pid){return !!MB[pid]},
    clientRow:function(pid,open){
      var L=st.arts.filter(function(a){return a.pid===pid}), can=!!MB[pid], sum=L.length?M.plural(L.length,"report or story","reports and stories")+(L.some(function(a){return a.status!=="Sent"})?" · "+L.filter(function(a){return a.status!=="Sent"}).length+" not sent yet":""):"Nothing made yet";
      var h='<section class="card cp-row"><button class="cp-rowh" data-act="cprow" data-id="studio" aria-expanded="'+!!open+'"><span class="cp-rt"><b>Studio</b><span class="m">'+sum+'</span></span><span class="cp-chev" aria-hidden="true">'+(open?"&#9652;":"&#9662;")+'</span></button>';
      if(!open) return h+'</section>';
      return h+'<div class="cp-rb">'+(L.length?L.slice().reverse().map(function(a){return '<div class="row"><div class="what"><button class="link t" data-act="stgo" data-id="'+a.id+'">'+esc(a.title)+'</button><div class="m">'+kind(a)+" · "+(a.status==="Sent"?"sent "+esc(a.sentOn||"today"):"updated "+esc(a.updated.toLowerCase()))+'</div></div><span class="chip '+SCH[a.status]+'">'+a.status+'</span></div>'}).join(""):'<p class="m" style="margin:0">Reports, stories and guides made for this client show here.</p>')
        +'<div class="acts" style="margin-top:10px">'+(can?'<button class="btn sm" data-act="stmake" data-id="Report|'+pid+'">Make a progress report</button><button class="btn sm" data-act="stmake" data-id="Story|'+pid+'">Make a story</button>':'<span class="m">Milton needs a few weeks of logged data before he can build one.</span>')+'</div></div></section>';
    }
  };

  /* ---------- acts ---------- */
  A.stopen=function(id){wk=null; st.view="main"; st.ver=null; st.si=0; st.goal=null; M.go(id?{page:"studio",id:id}:{page:"studio"})};
  A.stgo=A.stopen;
  A.stall=function(v){st.all=!!v; st.an=12; if(!v){st.aq=""; st.ak="All types"; st.as="All statuses"} M.render(); window.scrollTo(0,0)};
  A.stmore=function(){st.an+=12; M.render()};
  M.inputs.push(function(el){if(el.id==="staq"){st.aq=el.value; st.an=12; M.render(); var e=$("staq"); if(e){e.focus(); e.setSelectionRange(e.value.length,e.value.length)}}});
  M.changes.push(function(el){if(el.id==="stak"){st.ak=el.value; st.an=12; M.render()} if(el.id==="stas"){st.as=el.value; st.an=12; M.render()}});
  A.stview=function(v){st.view=v; st.si=0; M.render()};
  A.stver=function(i){st.ver=+i===st.cur.versions.length-1?null:+i; M.render()};
  A.strestore=function(){var a=st.cur, v=a.versions[st.ver]; addVer(a,v.spec,"You","Restored v"+v.n); M.render(); M.toast("Restored as version "+last(a).n+". It is a draft again.")};
  A.stnav=function(d){var a=st.cur; if(!a) return; var n=rootOf((st.ver!=null?a.versions[st.ver]:last(a)).spec).children.length; st.si=Math.max(0,Math.min(n-1,st.si+(+d))); M.render()};
  A.stgoal=function(g){var n=$("stLfName").value, p=$("stLfPhone").value; st.goal=st.goal===g?null:g; M.render(); $("stLfName").value=n; $("stLfPhone").value=p};
  A.stlead=function(){var a=st.cur, name=$("stLfName").value.trim(), phone=$("stLfPhone").value.trim();
    if(!name||phone.replace(/\D/g,"").length<7){$("stLfErr").textContent="Add your first name and a mobile number so the coach can reach you."; return}
    var id="st"+Date.now(); DB.people.push({id:id,name:name,added:"2026-11-20",source:"Studio share page",stage:"New",phone:phone,email:"",lastTouch:"Nobody has reached out yet.",form:{name:"Studio share page",when:"Today · just now",qa:[["What are you working toward?",st.goal||"Not answered"],["Which page?",a.title]]},thread:[{k:"event",day:"Today",t:"just now",body:"Came in through the share page for "+a.title}],read:[name+" asked for a free intro from the share page for "+a.title+".","Nobody has reached out yet."]});
    a.lead={name:name,id:id}; a.leads++; var f=DB.funnels.filter(function(x){return x.type==="Studio"})[0]; if(f){f.leads++; f.last="Just now"}
    M.render(); M.toast(name+" is in your CRM as a new lead, with Studio as the source.")};
  A.stapprove=function(){var a=st.cur, v=last(a); if(v.issues.some(function(i){return i[0]==="e"})) return M.toast("Fix the items under checks before approving."); a.status="Approved"; M.render(); M.toast("Approved. Send it when you are ready.")};
  A.stdel=function(){var a=st.cur; M.confirm({title:"Delete "+a.title+"?",body:(a.status==="Sent"?"It disappears from "+MB[a.pid].first+"'s app and its share link stops working. ":"")+"Every version goes with it. This cannot be undone.",no:"Keep it",yes:"Delete",run:function(){st.arts.splice(st.arts.indexOf(a),1); A.stopen(""); M.toast(a.title+" deleted.")}})};
  var sd=null;
  M.panels.stsend=function(){
    var a=st.cur, m=MB[a.pid], story=isStory(a); if(!sd||sd.id!==a.id) sd={id:a.id,share:a.share,text:true,msg:"Hi "+m.first+", I put together your "+(story?"12-week story":kind(a).toLowerCase())+". Take a look when you have a minute."};
    return '<div class="sph"><div><h3>Send to '+esc(m.first)+'</h3><div class="m">'+esc(a.title)+'</div></div>'+M.px+'</div><div class="spb"><div class="infobox">It shows in '+esc(m.first)+'\'s app right away. The conversation in your Inbox gets a line saying it was sent.</div><div class="setrow" style="margin-top:0"><div><b>Text a link too</b><div class="m">Sent from your gym number with the message below.</div></div><button class="sw" role="switch" aria-checked="'+sd.text+'" aria-label="Text a link too" data-act="stsw" data-id="text"></button></div>'+(sd.text?'<div class="field"><label for="stMsg">Message</label><textarea id="stMsg" rows="3">'+esc(sd.msg)+'</textarea></div>':"")+'<div class="setrow"><div><b>Let '+esc(m.first)+' share it</b><div class="m">Adds a public link and a share button. The share page has a form that sends new leads to your CRM.</div></div><button class="sw" role="switch" aria-checked="'+sd.share+'" aria-label="Let them share it" data-act="stsw" data-id="share"></button></div>'+(sd.share?'<div class="m">Share link: <span class="code">'+esc(link(a))+'</span></div>':"")+'</div><div class="spf"><button class="btn pri" data-act="stsendgo">Review and send</button><button class="btn" data-act="pclose">Cancel</button></div>';
  };
  A.stsw=function(k){if($("stMsg")) sd.msg=$("stMsg").value; sd[k]=!sd[k]; M.renderPanel()};
  A.stsendgo=function(){var a=st.cur, m=MB[a.pid]; if($("stMsg")) sd.msg=$("stMsg").value;
    M.confirm({title:"Send to "+m.first+"?",body:m.first+" gets it in the app"+(sd.text?" and by text":"")+(sd.share?", with a link to share it":"")+". Once it is sent it cannot be unsent.",no:"Not yet",yes:"Send",run:function(){
      a.status="Sent"; a.share=sd.share; a.sentOn="today"; var p=M.person(a.pid);
      if(p&&p.thread){ if(sd.text) p.thread.push({k:"out",day:"Today",t:"just now",ch:"Text",by:M.you().name,body:sd.msg+" "+K.GYM.link+a.slug}); p.thread.push({k:"event",day:"Today",t:"just now",body:M.you().name+" sent "+a.title+" from Studio"+(sd.share?", with sharing on":"")+"."})}
      sd=null; M.closePanel(); M.render(); M.toast("Sent to "+m.first+". It is in the conversation in your Inbox.")}})};
  M.panels.stchk=function(){
    var a=st.cur, m=MB[a.pid], v=st.ver!=null?a.versions[st.ver]:last(a), used={}; JSON.stringify(v.spec).replace(/\{\{\s*([a-zA-Z0-9_]+)[a-zA-Z0-9_.]*\s*\}\}/g,function(_,k){used[k]=1}); Object.keys(v.spec.elements).forEach(function(id){var p=v.spec.elements[id].props; [].concat(p.data||[],p.metric||[],p.metrics||[],(p.items||[]).map(function(i){return i&&i.data})).forEach(function(k){if(k&&typeof k==="string") used[k]=1})});
    var rows=Object.keys(used).filter(function(k){return m.data[k]}).map(function(k){var d=m.data[k], val=K.resolveToken(k,m)||"Chart"; return '<div class="row"><div class="what"><div class="t" style="font-weight:500">'+esc(d.label)+'</div><div class="m">'+esc(d.source||"Member profile")+'</div></div><b class="num">'+esc(val)+'</b></div>'}).join("");
    return '<div class="sph"><div><h3>Checks for v'+v.n+'</h3><div class="m">Run on every version before it can be approved.</div></div>'+M.px+'</div><div class="spb">'+v.issues.map(function(i){return '<div class="row"><span class="chip '+(i[0]==="ok"?"ok":i[0]==="w"?"warn":"err")+'">'+(i[0]==="ok"?"Pass":i[0]==="w"?"Check":"Fix")+'</span><div class="what">'+esc(i[1])+'</div></div>'}).join("")+'<div class="k" style="margin-top:8px">Where the numbers come from</div><div class="m">'+esc(m.name)+" · "+K.PERIOD+'. Milton places these values by reference and never types a number.</div>'+rows+'</div><div class="spf"><button class="btn" data-act="pclose">Close</button></div>';
  };
  var TXT={headline:"Headline",body:"Text",title:"Title",subtitle:"Line under the title",sub:"Small line",note:"Note",caption:"Caption"};
  M.panels.stedit=function(){
    var a=st.cur, v=last(a), f=[]; Object.keys(v.spec.elements).forEach(function(id){var e=v.spec.elements[id]; Object.keys(TXT).forEach(function(k){if(typeof e.props[k]==="string"&&e.props[k]) f.push([id,k,e.type.replace(/^Story/,"Story card: ").replace(/([a-z])([A-Z])/g,"$1 $2"),e.props[k]])})});
    return '<div class="sph"><div><h3>Edit text</h3><div class="m">'+esc(a.title)+'</div></div>'+M.px+'</div><div class="spb"><div class="infobox">Anything in double braces, like {{sessions}}, is a number Milton fills in from the data. Leave those as they are. For bigger changes, ask Milton in the chat.</div>'+f.map(function(x,i){return '<div class="field"><label for="ste'+i+'">'+esc(x[2])+" · "+TXT[x[1]]+'</label><textarea id="ste'+i+'" data-ste="'+x[0]+"|"+x[1]+'" rows="'+(x[3].length>90?3:2)+'">'+esc(x[3])+'</textarea></div>'}).join("")+'</div><div class="spf"><button class="btn pri" data-act="steditgo">Save as a new version</button><button class="btn" data-act="pclose">Cancel</button></div>';
  };
  A.steditgo=function(){var a=st.cur, s=clone(last(a).spec), n=0; document.querySelectorAll("[data-ste]").forEach(function(e){var k=e.dataset.ste.split("|"), v=e.value.trim(); if(v&&s.elements[k[0]].props[k[1]]!==v){s.elements[k[0]].props[k[1]]=v; n++}});
    if(!n){M.closePanel(); return M.toast("Nothing changed.")} var v=addVer(a,s,"You","Text edited by you"); M.closePanel(); M.render(); M.toast(v.issues.some(function(i){return i[0]==="e"})?"Saved as version "+last(a).n+". A number reference did not match the data, see checks.":"Saved as version "+last(a).n+". It is a draft again.")};
  var nw=null;
  M.panels.stnew=function(pn){
    if(!nw) nw={k:(pn&&pn.arg)||"Report",pid:"dana"};
    var opts=[["Report","Progress report","A client's 12 weeks, explained"],["Story","Progress story","Cards a client will want to share"],["Guide","Guide or handout","Teach one thing, on one page"]];
    return '<div class="sph"><div><h3>Make something</h3><div class="m">Milton builds a first draft from the client\'s own data.</div></div>'+M.px+'</div><div class="spb">'+opts.map(function(o){return '<button class="opt" aria-pressed="'+(nw.k===o[0])+'" data-act="stnk" data-id="'+o[0]+'"><b>'+o[1]+'</b><span class="m">'+o[2]+'</span></button>'}).join("")+'<div class="field"><label for="stWho">For</label><select id="stWho">'+Object.keys(MB).map(function(id){return '<option value="'+id+'"'+(nw.pid===id?" selected":"")+'>'+esc(MB[id].name)+'</option>'}).join("")+'</select><div class="m" style="margin-top:4px">Clients with at least four weeks of logged data.</div></div></div><div class="spf"><button class="btn pri" data-act="stnewgo">Build a draft</button><button class="btn" data-act="pclose">Cancel</button></div>';
  };
  A.stnew=function(k){nw={k:k||"Report",pid:"dana"}; M.openPanel("stnew")};
  A.stnk=function(k){nw.pid=$("stWho").value; nw.k=k; M.renderPanel()};
  A.stnewgo=function(){var k=nw.k, pid=$("stWho").value; nw=null; M.closePanel(); build(k,pid)};
  A.stmake=function(id){var a=id.split("|"); build(a[0],a[1])};
  A.stgen=function(id){var s=st.scheduled.filter(function(x){return x.id===id})[0]; if(!s||st.building) return; st.building=s; M.render();
    var steps=["Reading the verified data","Choosing the cards","Checking every number against the data"], i=0, t=setInterval(function(){i++; var e=$("stStep"); if(i<steps.length){if(e) e.textContent=steps[i]; return} clearInterval(t);
      st.scheduled.splice(st.scheduled.indexOf(s),1); st.building=null; make({title:s.title,pid:s.pid,kind:"Recap",spec:storySpec(s.pid,s.title),share:true,origin:{why:"Leah's first 12-week block closes Nov 23, and you asked for it early",hl:"{{hipthrust_e1rm.change}} hip thrust · {{sessions}} sessions"}});
      if(M.route.page==="studio"&&!M.route.id) M.render(); M.toast(s.title+" is ready for review.")},700)};
  /* ---------- parts: click one to swap it, change what it shows, move it or remove it ---------- */
  var NAME={Hero:"Opening",Section:"Section",Divider:"Divider line",TextBlock:"Paragraph",CoachNote:"Coach note",Callout:"Callout box",Stats:"Number tiles",TrendLine:"Trend line",MultiLine:"Lines together",SmallMultiples:"Mini trends",ColumnChart:"Weekly columns",StackedColumns:"Stacked columns",ChangeBars:"Week-over-week change",Dumbbell:"Start vs now",SegmentedBar:"Split bar",Donut:"Donut",Radar:"Score profile",SlopeChart:"Scores, then vs now",CompareTable:"Then and now table",GoalProgress:"Goal progress",ConsistencyGrid:"Consistency circles",CalendarHeatmap:"Activity calendar",RecordBoard:"Personal records",List:"List",ActionPlan:"Action plan",Illustration:"Illustration",StoryHero:"Opening card",StoryStat:"Number card",StoryClimb:"Climb card",StoryCompare:"Then and now card",StoryQuote:"Coach quote card",StoryReceipts:"Receipts card"};
  var FAM=[["TrendLine","ColumnChart","ChangeBars","MultiLine","SmallMultiples","Dumbbell","CompareTable"],["Donut","SegmentedBar"],["Radar","SlopeChart"],["ConsistencyGrid","CalendarHeatmap"],["Stats","GoalProgress","RecordBoard"],["TextBlock","Callout","CoachNote"],["StoryHero","StoryStat","StoryClimb"],["StoryCompare","StoryReceipts"]];
  var SM={StoryHero:{prop:"metric",kinds:["metric","series"]},StoryStat:{prop:"metric",kinds:["metric","series"]},StoryClimb:{prop:"metric",kinds:["series"]},StoryCompare:{prop:"metrics",multi:1,min:2,max:3,kinds:["series"]},StoryReceipts:{prop:"metrics",multi:1,min:2,max:4,kinds:["metric","series"]}};
  var ENUM={variant:"Look",tone:"Tone",layout:"Layout",highlight:"Highlight",annotate:"Labels"}, ELBL={"two-column":"Two columns","three-column":"Three columns",minmax:"High and low",ends:"Start and end",stack:"Stacked"};
  var PRE=[["Milton","#0E6E9A","#F08A4B"],["Your gym","#B23A2B","#E9A23B"],["Forest","#2F7D5B","#F2B33D"],["Plum","#6B3FA0","#F07C6C"],["Coral","#E2574C","#2F6FB0"],["Slate","#334E68","#3FB8AF"]];
  var PICS=["Protein","Sleep","Steps","Hydration","Routine","Meal prep","Eggs"];
  function cap(v){return ELBL[v]||v.charAt(0).toUpperCase()+v.slice(1)}
  function dsch(type){
    if(SM[type]) return SM[type];
    if(type==="Stats") return {prop:"items",multi:1,min:1,max:6,kinds:["metric","series","goal"],items:1};
    var d=K.CATALOG[type]&&K.CATALOG[type].props.data; if(!d) return null;
    return d.t==="dataList"?{prop:"data",multi:1,min:d.min,max:d.max,kinds:d.kinds}:{prop:"data",kinds:d.kinds,weekly:d.weekly};
  }
  function valid(m,s,type){return Object.keys(m.data).filter(function(k){var d=m.data[k]; return s.kinds.indexOf(d.kind)>=0&&(!s.weekly||d.cadence==="weekly")&&(!SM[type]||m.metrics[k])})}
  function keysOf(e){var s=dsch(e.type); if(!s) return []; var v=e.props[s.prop]; return s.items?(v||[]).map(function(i){return i.data}):[].concat(v||[])}
  function setKeys(e,keys){var s=dsch(e.type); e.props[s.prop]=s.items?keys.map(function(k){return {data:k}}):s.multi?keys:keys[0]}
  function prefs(pid,V){var P=LIFT[pid].concat(["steps_weekly","sleep_weekly","weekly_sessions","bodyweight_weekly","consistency","sessions","steps_avg","sleep_avg"]); return P.filter(function(k){return V.indexOf(k)>=0}).concat(V.filter(function(k){return P.indexOf(k)<0}))}
  function fitKeys(pid,type,keys){var m=MB[pid], s=dsch(type); if(!s) return null; var V=valid(m,s,type), out=keys.filter(function(k,i){return V.indexOf(k)>=0&&keys.indexOf(k)===i}), need=s.multi?s.min:1;
    prefs(pid,V).forEach(function(k){if(out.length<need&&out.indexOf(k)<0) out.push(k)}); if(out.length<need) return false; return out.slice(0,s.multi?s.max:1)}
  function label(m,k){return m.data[k].label.replace(/ \(est\. 1RM\)/,"")}
  function swapTo(pid,e,type){
    var m=MB[pid], def=K.CATALOG[type].props, np={}; ["title","caption","body","label","headline","note","sub","from"].forEach(function(k){if(def[k]&&e.props[k]) np[k]=e.props[k]});
    var x={type:type,props:np,children:[]}, ks=fitKeys(pid,type,keysOf(e)); if(ks) setKeys(x,ks); if(ks&&!ks.some(function(k){return keysOf(e).indexOf(k)>=0})) delete np.caption; if(ks&&def.title&&!dsch(type).multi&&!SM[type]) np.title=label(m,ks[0]).replace(/, weekly average/,"");
    if(def.body&&def.body.req&&!np.body) np.body="Add a line here.";
    if(def.headline&&def.headline.req&&!np.headline) np.headline=type==="StoryHero"?"and still climbing":ks?label(m,ks[0]):"Look at this";
    return x;
  }
  function alts(pid,e){var f=FAM.filter(function(F){return F.indexOf(e.type)>=0})[0]; var c=keysOf(e); return f?f.filter(function(t){var k=fitKeys(pid,t,c); return t!==e.type&&k!==false&&(!k||!c.length||!dsch(e.type)||dsch(e.type).kinds[0]!=="series"||k.some(function(x){return c.indexOf(x)>=0}))}):[]}
  function parentOf(spec,id){var r=null; Object.keys(spec.elements).forEach(function(k){if((spec.elements[k].children||[]).indexOf(id)>=0) r=spec.elements[k]}); return r}
  function work(){var a=st.cur; if(!wk||wk.id!==a.id) wk={id:a.id,spec:clone(last(a).spec),n:0,sel:null}; return wk}
  function canEdit(){var a=st.cur; return a&&a.status!=="Sent"&&st.ver==null}
  function changed(){wk.n++; M.render(); M.renderPanel()}
  function mini(key,pid,e,story){
    var spec=story?{root:"r",elements:{r:el("StoryLayout",{title:"x",theme:rootOf(wk.spec).props.theme},["x"]),x:e}}:{root:"r",elements:{r:el("ReportLayout",{title:"x",theme:rootOf(wk.spec).props.theme},["x"]),x:e}};
    var v=K.validate(clone(spec),MB[pid]).spec; if(!v.elements.x) return "";
    return story?'<div class="st-minis">'+K.slot(key,K.render(v,MB[pid],{one:0}),"thumb")+'</div>':'<div class="st-mini">'+K.slot(key,K.render(v,MB[pid]),"mini")+'</div>';
  }
  function pfoot(){return '<div class="spf"><button class="btn pri" data-act="stpsave"'+(wk&&wk.n?"":" disabled")+'>Save as a new version</button><button class="btn" data-act="pclose">Cancel</button></div>'}
  function desc(e,m){var ks=keysOf(e), p=e.props; return ks.length?ks.slice(0,3).map(function(k){return m.data[k]?label(m,k):k}).join(", ")+(ks.length>3?" and "+(ks.length-3)+" more":""):esc(String(p.title||p.headline||p.subject||p.body||"").replace(/\{\{[^}]*\}\}/g,"…").slice(0,54))}
  M.panels.stparts=function(){
    var a=st.cur, m=MB[a.pid], w=work(), R=rootOf(w.spec), story=isStorySpec(w.spec), themes=K.CATALOG[R.type].props.theme.vals, th=R.props.theme||themes[0];
    PRE[1][1]=DB.GYM.color||PRE[1][1]; PRE[1][2]=DB.GYM.accent||PRE[1][2]; var cm=R.props.main||(th==="gym"?PRE[1][1]:PRE[0][1]), ca=R.props.accent||(th==="gym"?PRE[1][2]:PRE[0][2]), ci=-1; PRE.forEach(function(c,i){if(ci<0&&c[1].toLowerCase()===cm.toLowerCase()&&c[2].toLowerCase()===ca.toLowerCase()&&(i>0)===(th==="gym")) ci=i});
    function rows(ids,depth){return ids.map(function(id,i){var e=w.spec.elements[id]; if(!e) return ""; return '<div class="row st-prow" style="'+(depth?"padding-left:18px":"")+'"><div class="what"><button class="link t" data-act="stpick" data-id="'+id+'">'+(story?(i+1)+". ":"")+(NAME[e.type]||e.type)+'</button><div class="m">'+(e.type==="Section"?esc(e.props.title||""):desc(e,m))+'</div></div><span class="wf-mv"><button data-act="stpmove" data-id="'+id+'|-1" aria-label="Move up"'+(i===0?" disabled":"")+'>&#9650;</button><button data-act="stpmove" data-id="'+id+'|1" aria-label="Move down"'+(i===ids.length-1?" disabled":"")+'>&#9660;</button></span></div>'+(e.children&&e.children.length?rows(e.children,1):"")}).join("")}
    return '<div class="sph"><div><h3>Change parts</h3><div class="m">'+esc(a.title)+'</div></div>'+M.px+'</div><div class="spb"><div class="infobox">Pick a part to swap it or change what it shows. The '+(story?"story":"page")+' behind this panel updates as you go.</div><div><div class="k" style="margin-bottom:6px">Colors</div><div class="rbar">'+PRE.map(function(c,i){return '<button class="st-col" data-act="stptheme" data-id="'+i+'" aria-pressed="'+(ci===i)+'" aria-label="'+c[0]+' colors" title="'+c[0]+'"><i style="background:linear-gradient(135deg,'+c[1]+' 50%,'+c[2]+' 50%)"></i></button>'}).join("")+'</div><div class="m" style="margin:6px 0 8px">'+(ci>=0?PRE[ci][0]:"Custom")+(th==="gym"?" · shows "+esc(K.GYM.name)+" at the top":" · shows Milton at the top")+'</div><div class="rbar"><label class="st-pick">Main<input type="color" data-stcol="main" value="'+cm+'"></label><label class="st-pick">Accent<input type="color" data-stcol="accent" value="'+ca+'"></label></div></div><div class="k" style="margin-top:6px">'+(story?"Cards, in order":"Parts, top to bottom")+'</div>'+rows(R.children,0)+'<button class="btn" style="margin-top:10px" data-act="stpaddopen"'+(story&&R.children.length>=8?" disabled":"")+'>'+(story?"Add a card":"Add a part")+'</button>'+(story&&R.children.length>=8?'<div class="m">A story holds up to 8 cards.</div>':"")+'</div>'+pfoot();
  };
  M.panels.stpart=function(pn){
    var a=st.cur, m=MB[a.pid], w=work(), id=pn.arg, e=w.spec.elements[id]; if(!e) return M.panels.stparts();
    var story=/^Story/.test(e.type), def=K.CATALOG[e.type].props, s=dsch(e.type), R=rootOf(w.spec), h='<div class="sph"><div><h3>'+(NAME[e.type]||e.type)+'</h3><div class="m">'+(e.type==="Section"?esc(e.props.title||""):desc(e,m))+'</div></div>'+M.px+'</div><div class="spb"><button class="backl" style="margin:0;justify-self:start;align-self:flex-start" data-act="stparts">&#8249; All parts</button>';
    Object.keys(ENUM).forEach(function(k){if(def[k]&&def[k].t==="enum"){var cur=e.props[k]||def[k].vals[0]; h+='<div><div class="k" style="margin-bottom:6px">'+ENUM[k]+'</div><div class="seg" style="flex-wrap:wrap">'+def[k].vals.map(function(v){return '<button data-act="stpvar" data-id="'+k+"|"+v+'" aria-pressed="'+(cur===v)+'">'+cap(v)+'</button>'}).join("")+'</div></div>'}});
    if(e.type==="Illustration"){var hit=K.findIllo(e.props.subject), ck=hit?hit[0]:"", cats=[]; K.ILLOS.forEach(function(x){if(cats.indexOf(x[2])<0) cats.push(x[2])}); h+='<div class="field"><label for="stPic">Picture of</label><select id="stPic" data-stpic="1">'+cats.map(function(c){return '<optgroup label="'+c+'">'+K.ILLOS.filter(function(x){return x[2]===c}).map(function(x){return '<option value="'+x[0]+'"'+(x[0]===ck?" selected":"")+'>'+esc(x[1])+'</option>'}).join("")+'</optgroup>'}).join("")+'</select><div class="m" style="margin-top:4px">All 48 pictures in the library. They take the report colors.</div></div>'}
    if(s){var V=prefs(a.pid,valid(m,s,e.type)), cur=keysOf(e);
      if(s.multi) h+='<div><div class="k" style="margin-bottom:6px">Shows · pick '+s.min+" to "+s.max+'</div><div class="rbar">'+V.map(function(k){var on=cur.indexOf(k)>=0; return '<button class="wf-chip" aria-pressed="'+on+'" data-act="stpkey" data-id="'+k+'"'+((on&&cur.length<=s.min)||(!on&&cur.length>=s.max)?" disabled":"")+'>'+esc(label(m,k))+'</button>'}).join("")+'</div></div>';
      else h+='<div class="field"><label for="stKey">Shows</label><select id="stKey" data-stkey="1">'+V.map(function(k){return '<option value="'+k+'"'+(cur[0]===k?" selected":"")+'>'+esc(label(m,k))+'</option>'}).join("")+'</select></div>'}
    var A2=alts(a.pid,e);
    if(A2.length) h+='<div><div class="k" style="margin-bottom:6px">Swap for</div><div class="'+(story?"st-swaps3":"st-swaps")+'">'+A2.map(function(t){return '<button class="opt st-sw" data-act="stpswap" data-id="'+t+'"><b>'+NAME[t]+'</b>'+mini("sw_"+t,a.pid,swapTo(a.pid,e,t),story)+'</button>'}).join("")+'</div><div class="m" style="margin-top:6px">Each one shows the same numbers a different way.</div></div>';
    var par=parentOf(w.spec,id), lockd=story&&R.children.length<=3;
    h+='<div style="margin-top:6px"><button class="btn sm quiet rm" data-act="stprm"'+(lockd?" disabled":"")+'>Remove this '+(story?"card":"part")+'</button>'+(lockd?'<div class="m">A story needs at least 3 cards.</div>':"")+'</div></div>';
    return h+pfoot();
  };
  function addList(pid,story){
    var L=LIFT[pid], f=MB[pid].first;
    if(story) return [["Cards",[el("StoryStat",{label:"Showing up",headline:f+" kept showing up",metric:"sessions",sub:"sessions in the last 30 days"}),el("StoryClimb",{label:"The climb",headline:"A little more every few weeks",metric:LEAD[pid]}),el("StoryCompare",{label:"Then and now",metrics:[L[0],L[1],"steps_weekly"]}),el("StoryQuote",{label:"From your coach",body:"Proud of the work you put in.",from:MB[pid].coach}),el("StoryReceipts",{label:"The receipts",headline:"12 weeks of proof",metrics:["sessions",L[0],"consistency"]})]]];
    return [["Numbers",[el("Stats",{variant:"tiles",items:[{data:"consistency"},{data:"sessions"},{data:"steps_avg"},{data:"sleep_avg"}]}),el("GoalProgress",{title:"Goals",variant:"rings",data:Object.keys(MB[pid].data).filter(function(k){return MB[pid].data[k].kind==="goal"})}),el("RecordBoard",{title:"Personal records",data:"records"})]],
      ["Charts",[el("TrendLine",{title:"Body weight",data:"bodyweight_weekly"}),el("MultiLine",{title:"Main lifts",data:L}),el("Dumbbell",{title:"Week 1 vs now",data:L}),el("CompareTable",{title:"Then and now",variant:"cards",data:L}),el("ColumnChart",{title:"Sessions each week",data:"weekly_sessions"}),el("StackedColumns",{title:"Training minutes",data:"training_minutes"}),el("Donut",{title:"Training mix",data:"training_mix"}),el("SegmentedBar",{title:"Body composition",data:"body_comp"}),el("Radar",{title:"Score profile",data:"scores"})]],
      ["Habits",[el("ConsistencyGrid",{title:"Last 30 days",data:"habits"}),el("CalendarHeatmap",{title:"12 weeks of activity",data:"activity_calendar"})]],
      ["Words",[el("TextBlock",{body:"Add a line here."}),el("Callout",{tone:"celebrate",title:"Worth celebrating",body:"You made {{sessions}} sessions in the last 30 days."}),el("List",{variant:"wins",title:"Wins",items:[{title:"You showed up",detail:"{{sessions}} sessions in the last 30 days."},{title:"Moving more",detail:"Steps averaged {{steps_avg}}."}]}),el("CoachNote",{body:"Proud of you, "+f+".",from:MB[pid].coach})]],
      ["Plans and pictures",[el("ActionPlan",{title:"Your next two weeks",weeks:[{label:"Week 1",theme:"Set the plan",actions:["Book every session","Protein at breakfast"]},{label:"Week 2",theme:"Build on it",actions:["One more rep per top set","Lights out by 10:30"]}]}),el("Illustration",{subject:"Protein",caption:"Protein at every meal"})]]];
  }
  M.panels.stadd=function(){
    var a=st.cur, w=work(), story=isStorySpec(w.spec), G=addList(a.pid,story), n=0;
    return '<div class="sph"><div><h3>'+(story?"Add a card":"Add a part")+'</h3><div class="m">Every number comes from '+esc(MB[a.pid].first)+"'s own data.</div></div>"+M.px+'</div><div class="spb"><button class="backl" style="margin:0;justify-self:start;align-self:flex-start" data-act="stparts">&#8249; All parts</button>'+G.map(function(g,gi){return '<div><div class="k" style="margin-bottom:6px">'+g[0]+'</div><div class="'+(story?"st-swaps3":"st-swaps")+'">'+g[1].map(function(e,i){return '<button class="opt st-sw" data-act="stpadd" data-id="'+gi+"|"+i+'"><b>'+NAME[e.type]+'</b>'+mini("ad_"+(n++),a.pid,e,story)+'</button>'}).join("")+'</div></div>'}).join("")+'</div>'+pfoot();
  };
  A.stparts=function(){if(!canEdit()) return M.toast(st.ver!=null?"Go to the latest version to change parts.":"This one has been sent, so it is locked."); work().sel=null; M.openPanel("stparts"); M.render()};
  A.stpick=function(id){if(!canEdit()) return; var w=work(); if(!w.spec.elements[id]) return; w.sel=id; M.openPanel("stpart",id); M.render()};
  A.stpaddopen=function(){M.openPanel("stadd")};
  A.stptheme=function(i){var R=rootOf(work().spec), T=K.CATALOG[R.type].props.theme.vals; i=+i; R.props.theme=i===0?T[0]:"gym"; if(i<2){delete R.props.main; delete R.props.accent} else {R.props.main=PRE[i][1]; R.props.accent=PRE[i][2]} changed()};
  M.changes.push(function(t){if(!wk||!t.dataset||!t.dataset.stcol) return; var R=rootOf(wk.spec), th=R.props.theme==="gym"?1:0; if(!R.props.main){R.props.main=PRE[th][1]; R.props.accent=PRE[th][2]} R.props[t.dataset.stcol]=t.value; R.props.theme="gym"; changed()});
  A.stpvar=function(id){var k=id.split("|"); wk.spec.elements[wk.sel].props[k[0]]=k[1]; changed()};
  A.stpkey=function(k){var e=wk.spec.elements[wk.sel], c=keysOf(e), i=c.indexOf(k); if(i>=0) c.splice(i,1); else c.push(k); setKeys(e,c); changed()};
  M.changes.push(function(t){if(!wk||!wk.sel||!t.dataset) return; var x=wk.spec.elements[wk.sel]; if(t.dataset.stkey){setKeys(x,[t.value]); changed()} else if(t.dataset.stpic){x.props.subject=t.value; changed()}});
  A.stpswap=function(t){var a=st.cur, e=wk.spec.elements[wk.sel]; wk.spec.elements[wk.sel]=swapTo(a.pid,e,t); changed()};
  A.stpmove=function(id){var k=id.split("|"), w=work(), p=parentOf(w.spec,k[0]), i=p.children.indexOf(k[0]), j=i+(+k[1]); if(j<0||j>=p.children.length) return; p.children.splice(i,1); p.children.splice(j,0,k[0]); changed()};
  A.stprm=function(){var w=wk, id=w.sel, p=parentOf(w.spec,id); p.children.splice(p.children.indexOf(id),1); w.sel=null; w.n++; M.openPanel("stparts"); M.render()};
  A.stpadd=function(id){var a=st.cur, k=id.split("|"), w=work(), story=isStorySpec(w.spec), e=clone(addList(a.pid,story)[+k[0]][1][+k[1]]), nid="n"+Date.now().toString(36), R=rootOf(w.spec), lastId=R.children[R.children.length-1], lt=lastId&&w.spec.elements[lastId].type;
    w.spec.elements[nid]=e; if(lt==="CoachNote"||lt==="StoryReceipts") R.children.splice(R.children.length-1,0,nid); else R.children.push(nid);
    w.sel=nid; w.n++; M.openPanel("stpart",nid); M.render()};
  A.stpsave=function(){var a=st.cur, w=wk; if(!w||!w.n) return; wk=null; var v=addVer(a,w.spec,"You","Parts changed by you"); M.closePanel(); M.render(); M.toast(v.issues.some(function(i){return i[0]==="e"})?"Saved as version "+last(a).n+". One part did not pass, see checks.":"Saved as version "+last(a).n+". It is a draft again.")};
  document.addEventListener("sk-pick",function(e){if(M.route.page==="studio"&&st.cur) A.stpick(e.detail)});
  var _cp=M.closePanel; M.closePanel=function(){var was=M.panel&&M.panel.name, keep=wk; _cp(); if(keep&&/^st(parts|part|add)$/.test(was)){wk=null; M.render(); if(keep.n) M.toast("Changes dropped.",function(){wk=keep; keep.sel=null; M.render(); M.openPanel("stparts")})}};
  /* ---------- download: a report as a PDF, a story as one image per card ---------- */
  function snap(html,cls,width){
    return new Promise(function(res,rej){
      var host=document.createElement("div"); host.style.cssText="position:fixed;left:-20000px;top:0;width:"+width+"px"; document.body.appendChild(host);
      var sh=host.attachShadow({mode:"open"}); sh.innerHTML="<style>"+K.css+"</style><div class='sk-root "+cls+"'>"+html+"</div>";
      var root=sh.querySelector(".sk-root"), h=Math.ceil(root.getBoundingClientRect().height), body=new XMLSerializer().serializeToString(root); host.remove();
      if(!h) return rej(new Error("empty"));
      var css=K.css.replace(/:host/g,".sk-host");
      var svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+width+'" height="'+h+'"><foreignObject x="0" y="0" width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml" class="sk-host" style="width:'+width+'px;background:#fff"><style><![CDATA['+css+']]></style>'+body+'</div></foreignObject></svg>';
      var img=new Image(); img.onload=function(){try{var c=document.createElement("canvas"), k=2; c.width=width*k; c.height=h*k; var x=c.getContext("2d"); x.fillStyle="#fff"; x.fillRect(0,0,c.width,c.height); x.drawImage(img,0,0,c.width,c.height); c.toDataURL("image/png",.1).length; res(c)}catch(e){rej(e)}};
      img.onerror=function(){rej(new Error("image"))}; img.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svg);
    });
  }
  function bytes(dataUrl){var b=atob(dataUrl.split(",")[1]), u=new Uint8Array(b.length); for(var i=0;i<b.length;i++) u[i]=b.charCodeAt(i); return u}
  function pdfOf(c){
    var jpg=bytes(c.toDataURL("image/jpeg",.92)), W=612, H=Math.round(612*c.height/c.width), parts=[], len=0, off=[];
    function put(x){var u=typeof x==="string"?Uint8Array.from(x,function(ch){return ch.charCodeAt(0)}):x; parts.push(u); len+=u.length}
    function obj(n,head,stream){off[n]=len; put(n+" 0 obj\n"+head+"\n"); if(stream){put("stream\n"); put(stream); put("\nendstream\n")} put("endobj\n")}
    var content="q "+W+" 0 0 "+H+" 0 0 cm /Im0 Do Q";
    put("%PDF-1.4\n"); obj(1,"<< /Type /Catalog /Pages 2 0 R >>"); obj(2,"<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
    obj(3,"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 "+W+" "+H+"] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>");
    obj(4,"<< /Type /XObject /Subtype /Image /Width "+c.width+" /Height "+c.height+" /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length "+jpg.length+" >>",jpg);
    obj(5,"<< /Length "+content.length+" >>",content);
    var xr=len; put("xref\n0 6\n0000000000 65535 f \n"+[1,2,3,4,5].map(function(n){return ("0000000000"+off[n]).slice(-10)+" 00000 n \n"}).join("")+"trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n"+xr+"\n%%EOF");
    return new Blob(parts,{type:"application/pdf"});
  }
  function save(blob,name){var a2=document.createElement("a"); a2.href=URL.createObjectURL(blob); a2.download=name; document.body.appendChild(a2); a2.click(); a2.remove()}
  A.stdl=function(){
    var a=st.cur, m=MB[a.pid], ver=st.ver!=null?a.versions[st.ver]:last(a), story=isStorySpec(ver.spec), base=a.slug||"milton-studio", lk=a.share?link(a):null;
    function fail(){M.toast("The download was blocked here. In Milton it saves "+(story?"one image per card.":"a PDF."))}
    M.toast(story?"Making the images.":"Making the PDF.");
    if(!story) return snap(K.render(ver.spec,m),"",860).then(function(c){save(pdfOf(c),base+".pdf"); M.toast("Downloaded "+base+".pdf.")}).catch(fail);
    var n=rootOf(ver.spec).children.length, i=0;
    (function next(){ if(i>=n) return M.toast("Downloaded "+M.plural(n,"image")+", one per card.");
      snap(K.render(ver.spec,m,{one:i,link:lk}),"thumb",360).then(function(c){c.toBlob(function(b){ if(!b) return fail(); save(b,base+"-"+(i+1)+".png"); i++; setTimeout(next,250)},"image/png")}).catch(fail)})();
  };
  var _rp=M.renderPanel; M.renderPanel=function(){_rp(); K.fill()};
  var _pc=A.pclose; A.pclose=function(a,b,c){sd=null; nw=null; _pc(a,b,c)};
  /* Studio as a source in Funnels */
  DB.funnels.push({id:"fstudio",name:"Studio share pages",type:"Studio",live:true,last:"Wed, Nov 18",opened:253,leads:6,booked:3,showed:2,joined:1,next:"",wfid:"setter"});
})();
