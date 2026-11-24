/* Client Profile data and rules: targets, logs, results, programs and the plan engine.
   Follows the Client Profile spec. Example data for Northline's clients, with today fixed at Fri, Nov 20, 2026. */
(function(){
  var TODAY=DB.TODAY, NOW=DB.NOW, MON=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"], WD=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"], WDL=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"], MONL=["January","February","March","April","May","June","July","August","September","October","November","December"];
  function dt(iso){var a=iso.split("-"); return new Date(Date.UTC(+a[0],+a[1]-1,+a[2]))}
  function dow(iso){return dt(iso).getUTCDay()}
  function add(iso,n){return M.addDays(iso,n)}
  function diff(a,b){return Math.round((dt(b)-dt(a))/864e5)}
  function sd(iso){var a=iso.split("-"); return MON[+a[1]-1]+" "+(+a[2])+(a[0]!==TODAY.slice(0,4)?", "+a[0]:"")}
  function wd(iso){return WD[dow(iso)]+", "+sd(iso)}
  function rel(iso){return iso===TODAY?"Today":(iso===add(TODAY,1)?"Tomorrow":(iso===add(TODAY,-1)?"Yesterday":wd(iso)))}
  function longd(iso){var a=iso.split("-"); return WDL[dow(iso)]+", "+MONL[+a[1]-1]+" "+(+a[2])}
  function tm(min,short){var h=Math.floor(min/60), m=min%60, ap=h>=12?"PM":"AM"; h=h%12||12; return h+(short&&!m?"":":"+("0"+m).slice(-2))+" "+ap}
  function toMin(t){var m=/(\d+):(\d+) (AM|PM)/.exec(t); return m?((+m[1])%12+(m[3]==="PM"?12:0))*60+(+m[2]):0}
  function hash(s){var h=2166136261; for(var i=0;i<s.length;i++){h^=s.charCodeAt(i); h=Math.imul(h,16777619)} return h>>>0}
  function rng(seed){return function(){seed|=0; seed=seed+0x6D2B79F5|0; var t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296}}
  function num(n){return Math.round(n).toLocaleString("en-US")}

  var SHE={sub:"she",obj:"her",pos:"her"}, HE={sub:"he",obj:"him",pos:"his"};
  var MEALS={
    dana:{Breakfast:[["Greek yogurt, berries and granola",410,28,50,11],["Eggs, toast and avocado",520,26,38,29],["Oatmeal with banana and peanut butter",480,17,72,15]],Lunch:[["Chicken rice bowl",640,44,72,17],["Turkey wrap and fruit",540,33,62,15],["Salad with salmon",520,36,24,30]],Snack:[["Protein smoothie",300,29,33,6],["Apple and peanut butter",280,8,30,16],["String cheese and crackers",250,14,23,11]],Dinner:[["Salmon, rice and vegetables",620,40,58,23],["Chicken pasta",680,42,80,19],["Tacos at home",610,34,54,27]]},
    devon:{Breakfast:[["Breakfast burrito",620,26,58,30],["Bagel with cream cheese",430,13,60,15],["Cereal and milk",380,12,66,8]],Lunch:[["Burger and fries",980,38,96,48],["Chicken rice bowl",720,48,82,18],["Deli sandwich and chips",760,30,84,32]],Snack:[["Protein bar",230,20,24,8],["Trail mix",300,8,28,19],["Chips",270,3,30,16]],Dinner:[["Steak, rice and broccoli",820,52,78,30],["Pasta with meat sauce",880,38,110,28],["Pizza, 3 slices",860,34,100,34]]}
  };
  var MT={Breakfast:[400,40],Lunch:[735,45],Snack:[930,40],Dinner:[1125,60]};
  var P={
    dana:{age:38,pron:SHE,goals:{client:"Keep up with Maya at camp and feel strong carrying everything.",coach:"Pain-free squats and a 135 lb trap bar deadlift by January.",by:"Tori Lane",on:"2026-11-02"},
      health:{ok:true,sub:"Updated Sep 8 after her knee visit"},tracks:{n:true,s:true,st:true},logs:{n:true,s:true,st:true},targets:{kcal:1900,protein:120,carbs:190,fat:65,sleep:7.5,steps:8000},
      booked:[{dow:1,time:330,coach:"Tori Lane"},{dow:3,time:330,coach:"Tori Lane"}],extras:[{iso:"2026-11-13",time:330,coach:"Tori Lane"}],solo:[],outcomes:{"2026-11-13":{s:"late",why:"Maya was sick overnight"},"2026-10-21":{s:"miss",why:"No show"}},
      notes:[{by:"Tori Lane",iso:"2026-09-08",text:"Left knee: patellar tendon irritation. No jumping and no deep lunges. Box squats and sled pushes are fine.",pinned:true},{by:"Tori Lane",iso:"2025-12-15",text:"Mom of Maya. Books 5:30 AM so she is home by 7. Likes to know the plan the night before.",pinned:true},{by:"Tori Lane",iso:"2026-11-18",text:"Lower back tight since Monday's Romanian deadlifts. Keep hinges light on Monday and re-check before loading.",pinned:false},{by:"Tori Lane",iso:"2026-11-09",text:"Trap bar deadlift 125 lb for 5, moved well. Ready for 130 next time it comes up.",pinned:false},{by:"Riley Chen",iso:"2026-11-02",text:"Asked about adding a third training day in January. Revisit after the holidays.",pinned:false},{by:"Tori Lane",iso:"2026-10-21",text:"No show. Texted her and she had the wrong day. No charge this once.",pinned:false}],
      programs:[{name:"Foundations",start:"2025-12-15",end:"2026-04-24",rot:["A","B"],focus:"Learn the main lifts and build a twice a week habit.",why:"She was moving well and wanted more lower body work before summer.",whyBy:"Tori Lane",whyDay:"2026-04-24"},
        {name:"Summer Strength",start:"2026-04-27",end:"2026-09-04",rot:["A","B"],focus:"Heavier lower body work, two days a week.",why:"Knee pain on lunges in early September. Her doctor found patellar tendon irritation.",whyBy:"Tori Lane",whyDay:"2026-09-08"},
        {name:"Knee Friendly Strength",start:"2026-09-08",end:"2026-10-30",rot:["A","B"],focus:"Keep her training while the knee settles. Box squats, sleds and upper body.",why:"Knee is pain-free on box squats. Time to load hinges and carries again.",whyBy:"Tori Lane",whyDay:"2026-10-30",workouts:{A:{name:"Lower + Pull"},B:{name:"Upper + Core"}}},
        {name:"Strength and Recover",start:"2026-11-02",end:null,rot:["A","B"],focus:"Build back to her summer numbers, with a Recovery Room session each week.",workouts:{
          A:{name:"Lower + Pull",ex:[["Trap bar deadlift","3 × 5","125 lb"],["Romanian deadlift","3 × 8","55 lb","rdl"],["Box squat","3 × 8","65 lb",null,{from:"Reverse lunge",why:"knee note"}],["Single-arm cable row","3 × 10 each","30 lb"],["Farmer carry","3 × 40 yd","35 lb DBs","carry"]]},
          B:{name:"Upper + Core",ex:[["Dumbbell bench press","4 × 8","30 lb DBs"],["Half-kneeling cable press","3 × 10 each","20 lb"],["Chest-supported row","3 × 10","25 lb DBs"],["Sled push","4 × 20 yd","90 lb"],["Pallof press","3 × 10 each","15 lb"],["Dead bug","3 × 8 each",""]]}}}],
      gaps:[{start:"2026-07-13",end:"2026-07-26",name:"Family vacation"}],
      results:[{key:"tb",label:"Trap bar deadlift",unit:"lb",better:"up",sub:"5 reps",kind:"Strength",how:"workouts",by:"Tori Lane",on:"2026-01-12",why:"Her main lower body lift since she started",pts:[["2026-01-12",85],["2026-03-16",105],["2026-06-08",125],["2026-08-24",135],["2026-10-05",115],["2026-11-09",125]]},
        {key:"bp",label:"Dumbbell bench press",unit:"lb",better:"up",sub:"8 reps, each hand",kind:"Strength",how:"workouts",by:"Tori Lane",on:"2026-02-04",why:"Upper body strength she can feel carrying things",pts:[["2026-02-04",15],["2026-04-15",20],["2026-07-06",25],["2026-09-23",27.5],["2026-11-11",30]]},
        {key:"sq",label:"Box squat",unit:"lb",better:"up",sub:"8 reps",kind:"Strength",how:"workouts",by:"Tori Lane",on:"2026-09-09",why:"Her squat while the knee settles",pts:[["2026-09-09",35],["2026-10-07",50],["2026-11-16",65]]},
        {key:"kn",label:"Knee pain",unit:"",rec:"score_10",better:"down",sub:"0 to 10, after each session",kind:"Check-ins",how:"milton_asks",by:"Tori Lane",on:"2026-09-08",why:"So we know the knee is settling before we load it",pts:[["2026-09-09",6],["2026-09-23",4],["2026-10-07",3],["2026-10-28",2],["2026-11-18",1]]},
        {key:"bw",label:"Bodyweight",unit:"lb",better:"steady",sub:"weigh-ins",kind:"Body",how:"check_ins",by:"Tori Lane",on:"2025-12-15",why:"Part of every intake",pts:[["2025-12-15",152],["2026-04-27",150],["2026-09-08",151],["2026-11-02",149.5]]},
        {key:"rd",label:"Romanian deadlift",unit:"lb",better:"up",sub:"8 reps",kind:"Strength",how:"workouts",by:"Tori Lane",on:"2026-05-04",why:"Charted over the summer",pts:[["2026-05-04",45],["2026-08-17",65]],archived:true}],
      media:{consent:true,sets:["2026-01-05","2026-04-27","2026-09-08","2026-10-23"],videos:[["2026-09-09","Box squat"],["2026-11-16","Box squat"]]},
      files:[{name:"Knee visit summary",iso:"2026-09-08",type:"PDF",got:"Patellar tendon irritation, left knee. No jumping or deep lunges for 8 weeks. Box squats and sled work are fine."},{name:"Intake and health history",iso:"2025-12-15",type:"Form",got:"No surgeries. Lower back strain in 2022, fully healed."}],
      events:[{iso:"2026-11-19",t:"message",time:"6:12 PM",text:"<b>Dana:</b> Back is a little tight but fine to walk. Still good for Monday?"},{iso:"2026-11-19",t:"message",time:"6:40 PM",text:"<b>Tori:</b> Yes. I left a note, so we will keep Monday light on hinges."},{iso:"2026-11-19",t:"milton",time:"5:30 PM",text:"Milton sent Dana a reminder for Recovery Room on Friday at 6:30 PM."},{iso:"2026-11-02",t:"program",time:"8:30 AM",text:"<b>Started Strength and Recover.</b> Milton kept the box squat swap from the knee note."},{iso:"2026-11-01",t:"account",time:"6:02 AM",text:"Paid $449.00 for Semi-Private 2x per week. Visa ending 4417."}],
      swapPool:{rdl:["Hip thrust","3 × 10","95 lb"],carry:["Pallof press hold","3 × 20 sec each","15 lb"]},
      read:{lead:"Tori flagged a tight lower back on Wednesday. Monday's Workout A has Romanian deadlifts and farmer carries.",ask:"Swap them for hip thrusts and Pallof press holds?",why:"Tori's Nov 18 note says to keep hinges light and re-check. Workout A lands on Mon, Nov 23 at 5:30 AM. Romanian deadlifts and loaded carries are the two hinge and bracing movements in it. Trap bar deadlift stays, since the note says light, not none.",action:"swaps",label:"Apply the swaps",state:"open"}},
    devon:{age:31,pron:HE,goals:{client:"Squat 315 by spring and stop skipping meals on work days.",coach:"Three workouts a week, every week, and 150 g of protein a day.",by:"Andre Lewis",on:"2026-10-26"},
      health:{ok:false,last:"Jun 2025"},tracks:{n:true,s:true,st:false},logs:{n:true,s:true,st:false},targets:{kcal:2700,protein:160,carbs:300,fat:85,sleep:7.5,steps:9000},
      booked:[{dow:2,time:960,coach:"Andre Lewis"},{dow:5,time:960,coach:"Andre Lewis"}],extras:[],solo:[0],outcomes:{"2026-11-13":{s:"late",why:"Called into work at 2 PM"}},soloOpen:{},
      notes:[{by:"Andre Lewis",iso:"2026-06-22",text:"Desk job, travels for work about one week a month. Solo Sunday workout is his own idea, so hold him to it.",pinned:true},{by:"Andre Lewis",iso:"2026-11-17",text:"Deadlift 295 for 5, moved well. Bench stalled at 185 on Sunday, likely under-eating on work days.",pinned:false},{by:"Andre Lewis",iso:"2026-11-13",text:"Late cancel, called into work. He did Workout B on his own Sunday.",pinned:false},{by:"Andre Lewis",iso:"2026-10-26",text:"Starting Block 2: heavier squats, three days. Protein is the thing to watch.",pinned:false}],
      programs:[{name:"Strength Block 1",start:"2026-06-29",end:"2026-10-23",rot:["A","B"],focus:"Learn the squat, bench and deadlift with a coach twice a week.",why:"He asked for a third day and has the technique for heavier work.",whyBy:"Andre Lewis",whyDay:"2026-10-23",workouts:{A:{name:"Squat + Pull"},B:{name:"Bench + Hinge"}}},
        {name:"Strength Block 2",start:"2026-10-26",end:null,rot:["A","B","C"],soloOk:true,focus:"Heavier squats three days a week: two sessions with Andre and one on his own.",workouts:{
          A:{name:"Squat",ex:[["Back squat","4 × 5","265 lb"],["Split squat","3 × 8 each","40 lb DBs"],["Lat pulldown","3 × 10","130 lb"],["Plank","3 × 45 sec",""]]},
          B:{name:"Bench",ex:[["Bench press","4 × 5","185 lb"],["Dumbbell row","3 × 10 each","65 lb"],["Overhead press","3 × 8","95 lb"],["Face pull","3 × 15","40 lb"]]},
          C:{name:"Deadlift",ex:[["Deadlift","3 × 5","295 lb"],["Front squat","3 × 6","165 lb"],["Pull-up","3 × 6",""],["Farmer carry","3 × 40 yd","70 lb DBs"]]}}}],
      gaps:[],
      results:[{key:"sq",label:"Back squat",unit:"lb",better:"up",sub:"5 reps",kind:"Strength",how:"workouts",by:"Andre Lewis",on:"2026-07-07",why:"His goal is a 315 squat",pts:[["2026-07-07",185],["2026-08-11",215],["2026-09-15",235],["2026-10-20",250],["2026-11-10",265]]},
        {key:"bn",label:"Bench press",unit:"lb",better:"up",sub:"5 reps",kind:"Strength",how:"workouts",by:"Andre Lewis",on:"2026-07-10",why:"His main upper body lift",pts:[["2026-07-10",145],["2026-08-14",165],["2026-09-18",180],["2026-10-30",185],["2026-11-15",185]]},
        {key:"bw",label:"Bodyweight",unit:"lb",better:"steady",sub:"weigh-ins",kind:"Body",how:"check_ins",by:"Andre Lewis",on:"2026-06-22",why:"He wants to stay lean while he gets stronger",pts:[["2026-06-22",188],["2026-08-17",186],["2026-10-26",184],["2026-11-17",183]]},
        {key:"bf",label:"Body fat",unit:"%",rec:"percent",better:"down",sub:"from his scans",kind:"Body",how:"files",by:"Andre Lewis",on:"2026-07-01",why:"From the scan he gets each quarter",pts:[["2026-07-01",19.8],["2026-10-02",17.9]]}],
      media:{consent:false,sets:[],videos:[]},
      files:[{name:"Body composition scan",iso:"2026-10-02",type:"PDF",got:"Body fat 17.9%, lean mass 151 lb."},{name:"Body composition scan",iso:"2026-07-01",type:"PDF",got:"Body fat 19.8%, lean mass 149 lb."}],
      events:[{iso:"2026-11-19",t:"milton",time:"4:00 PM",text:"Milton sent Devon a reminder for Friday at 4:00 PM with Andre."},{iso:"2026-11-13",t:"milton",time:"2:20 PM",text:"Milton moved Workout B to Sunday and told Devon."},{iso:"2026-10-28",t:"account",time:"11:14 AM",text:"Paid $560.00 for Personal Training 8-pack. Visa ending 9034."},{iso:"2026-10-26",t:"program",time:"9:00 AM",text:"<b>Started Strength Block 2.</b>"}],
      read:{lead:"Devon made 2 of 3 workouts last week, with Friday's late cancel moved to Sunday. Protein is the gap: about 110 g a day against 160.",ask:"Send him a check-in with two easy additions for work days?",why:"Over the last 7 full days he logged every day and averaged roughly 110 g of protein, under 90% of his 160 g target on most days. Andre's Nov 17 note ties the stalled bench to under-eating on work days. Calories are close to target, so this is about what he eats, not how much.",action:"checkin",label:"Send the check-in",state:"open"}},
    leah:{age:44,pron:SHE,goals:{client:"",coach:"",by:"",on:""},health:{ok:true,sub:"Updated Aug 3 at intake"},tracks:{n:false,s:false,st:true},logs:{n:false,s:false,st:true},targets:{steps:7000},
      booked:[{dow:1,time:330,coach:"Tori Lane"},{dow:3,time:330,coach:"Tori Lane"}],extras:[],solo:[],outcomes:{},
      notes:[{by:"Tori Lane",iso:"2026-08-03",text:"Runs three mornings a week. Wants strength work that does not leave her legs dead for Saturday long runs.",pinned:true},{by:"Tori Lane",iso:"2026-11-14",text:"Talked about moving to three sessions a week in January. She wants to decide after the holidays.",pinned:false}],
      programs:[{name:"Runner Strength",start:"2026-08-03",end:null,rot:["A","B"],focus:"Two short strength sessions a week that support her running.",workouts:{A:{name:"Single Leg + Core",ex:[["Step-up","3 × 8 each","25 lb DBs"],["Single-leg Romanian deadlift","3 × 8 each","30 lb"],["Side plank","3 × 30 sec each",""],["Calf raise","3 × 12","bodyweight"]]},B:{name:"Upper + Hips",ex:[["Push-up","3 × 10",""],["Seated cable row","3 × 10","60 lb"],["Hip thrust","3 × 10","115 lb"],["Copenhagen plank","3 × 20 sec each",""]]}}}],
      gaps:[],results:[{key:"ht",label:"Hip thrust",unit:"lb",better:"up",sub:"10 reps",kind:"Strength",how:"workouts",by:"Tori Lane",on:"2026-08-05",why:"Hip strength for her long runs",pts:[["2026-08-05",75],["2026-09-16",95],["2026-11-04",115]]},{key:"st",label:"Daily steps",unit:"",rec:"count",better:"up",sub:"weekly average",kind:"Activity",how:"phone",by:"Tori Lane",on:"2026-08-03",why:"Shows her running weeks against her rest weeks",pts:[["2026-10-19",9800]]}],
      media:{consent:true,sets:["2026-08-03"],videos:[]},files:[],events:[{iso:"2026-11-03",t:"account",time:"6:01 AM",text:"Paid $449.00 for Semi-Private 2x per week. Mastercard ending 8210."}],
      read:{lead:"Leah has made every session since Oct 26, and her hip thrust is up 40 lb since August.",ask:"She is deciding on a third day in January. Want me to draft an update she can read over the holidays?",why:"Tori's Nov 14 note says Leah wants to decide after the holidays. She has 8 of 8 sessions done in the last four weeks, and hip thrust went from 75 to 115 lb since Aug 5.",action:"draft",label:"Draft the update",state:"open"}}
  };
  function blank(p){return {age:null,pron:{sub:p.first,obj:p.first,pos:p.first+"'s",name:true},goals:{client:"",coach:"",by:"",on:""},health:{ok:false,last:null},tracks:{n:false,s:false,st:false},logs:{n:false,s:false,st:false},targets:{},booked:[],extras:[],solo:[],outcomes:{},notes:[],programs:[],gaps:[],results:[],media:{consent:false,sets:[],videos:[]},files:[],events:[],read:null}}
  function get(pid){
    var p=M.person(pid); if(!p) return null;
    if(!p.cp){var c=P[pid]||blank(p); c.pid=pid; c.swaps=c.swaps||[]; c.soloOpen=c.soloOpen||{}; c.access=c.access||{program:null,ask:null,rule:null}; c.targets=c.targets||{};
      var d={kcal:2000,protein:120,carbs:220,fat:65,sleep:7.5,steps:7000}; Object.keys(d).forEach(function(k){ if(c.targets[k]==null) c.targets[k]=d[k] });
      c.results.forEach(function(r){r.rec=r.rec||"weight"; r.pts.sort(function(a,b){return a[0]<b[0]?-1:1})}); p.cp=c}
    return p.cp;
  }
  /* ---------- logs: meals, sleep and steps come from the client's app ---------- */
  var cache={};
  function logFor(c,iso){
    if(iso>TODAY) return null; var key=c.pid+iso; if(cache[key]) return cache[key];
    var r=rng(hash(key)), L={iso:iso}, today=iso===TODAY;
    if(c.logs.s){var sl=c.pid==="devon"?6.7+(r()-0.5)*1.9:7.5+(r()-0.5)*1.4; L.sleep=Math.round(Math.max(4.5,Math.min(9.2,sl))*10)/10}
    if(c.logs.st){var st0=c.pid==="leah"?8600+(r()-0.5)*7000:8300+(r()-0.5)*5000; if(today) st0*=0.62; L.steps=Math.round(st0/10)*10}
    if(c.logs.n){
      var pool=MEALS[c.pid]||MEALS.dana, skip=!today&&r()<0.07, meals=[];
      if(!skip) ["Breakfast","Lunch","Snack","Dinner"].forEach(function(k){
        if(k==="Snack"&&r()<0.25) return; var t=MT[k][0]+Math.round((r()-0.5)*MT[k][1]); if(today&&t>NOW) return;
        var m=pool[k][Math.floor(r()*pool[k].length)], f=0.9+r()*0.22;
        var o={meal:k,time:t,text:m[0],kcal:Math.round(m[1]*f/10)*10,p:Math.round(m[2]*f),c:Math.round(m[3]*f),f:Math.round(m[4]*f),via:r()<0.6?"photo":"text"};
        if(r()<0.05) o.edited="2 "+m[0].toLowerCase().split(",")[0]; meals.push(o)});
      L.meals=meals; ["kcal","p","c","f"].forEach(function(k){L[k]=meals.reduce(function(a,m){return a+m[k]},0)});
    }
    return cache[key]=L;
  }
  /* statuses per the spec's thresholds */
  function stat(kind,v,t,today){
    if(v==null) return "none"; if(today&&kind!=="sleep") return "sofar"; var x=v/t;
    if(kind==="kcal") return x<0.85?"under":(x>1.10?"over":"hit");
    if(kind==="protein") return x>=0.9?"hit":"under";
    if(kind==="carbs"||kind==="fat") return x<0.85?"under":(x>1.15?"over":"hit");
    if(kind==="sleep") return v>=t-0.25?"hit":"under";
    return v>=t?"hit":"under";
  }
  var SW={hit:"Hit",under:"Under",over:"Over",sofar:"So far",none:"No logs yet",goal:"Daily goal"};
  /* ---------- the plan engine: workouts go on sessions first, then solo days. A miss moves forward. ---------- */
  function progOn(c,iso){return c.programs.filter(function(g){return g.start<=iso&&(!g.end||g.end>=iso)})[0]||null}
  function inGap(c,iso){return c.gaps.some(function(g){return g.start<=iso&&g.end>=iso})}
  function training(a){return /^(Semi-private|Personal training)/i.test(a.title)}
  function slots(c){
    var p=M.person(c.pid), first=c.programs.length?c.programs[0].start:add(TODAY,-28), end=add(TODAY,56), out=[], d, seen={};
    var appts={}; p.appts.forEach(function(a){ if(training(a)){var i=M.sess.dayISO(a.day); (appts[i]=appts[i]||[]).push(a)} });
    p.visits.forEach(function(v){ if(v[4]&&training(v[4])){var i=M.sess.dayISO(v[0]); if(i===TODAY) (appts[i]=appts[i]||[]).push(v[4])} });
    for(d=first; d<=end; d=add(d,1)){
      if(inGap(c,d)) continue; var g=progOn(c,d), day=[], w=dow(d);
      c.booked.forEach(function(b){ if(b.dow===w&&(!b.from||b.from<=d)) day.push({iso:d,time:b.time,coach:b.coach,kind:"session"}) });
      c.extras.forEach(function(x){ if(x.iso===d) day.push({iso:d,time:x.time,coach:x.coach,kind:"session"}) });
      (appts[d]||[]).forEach(function(a){var t=toMin(a.time); var hit=day.filter(function(s){return s.time===t})[0]; if(hit) hit.appt=a; else if(d>=TODAY) day.push({iso:d,time:t,coach:(a.where||"").replace(/^with (Coach )?/,"")||p.coach,kind:"session",appt:a}) });
      if(g&&g.soloOk&&c.solo.indexOf(w)>=0&&!day.length) day.push({iso:d,time:null,coach:null,kind:"solo"});
      day.sort(function(a,b){return (a.time||0)-(b.time||0)}).forEach(function(s){s.prog=g; out.push(s)});
    }
    var rot={}, carry={};
    out.forEach(function(s){
      var past=s.iso<TODAY||(s.iso===TODAY&&s.time!=null&&s.time+60<=NOW), o=c.outcomes[s.iso];
      if(s.iso===TODAY&&s.appt){var stx=s.appt.status; s.status=stx==="out"?"done":(stx==="in"?"open":(stx==="noshow"?"missed":(stx==="late"?"late_cancel":(past?"open":"planned")))); if(s.status==="open"&&stx==="in") s.checkedIn=true}
      else if(!past) s.status="planned";
      else if(o){s.status=o.s==="late"?"late_cancel":"missed"; s.reason=o.why}
      else if(s.kind==="solo") s.status=c.soloOpen[s.iso]?"open":"done";
      else s.status="done";
      if(!s.prog){s.workout=null; return}
      var key=s.prog.name, i=rot[key]||0, bad=s.status==="missed"||s.status==="late_cancel";
      s.workout=s.prog.rot[i%s.prog.rot.length]; s.wname=(s.prog.workouts&&s.prog.workouts[s.workout]||{}).name||"";
      if(carry[key]){s.movedFrom=carry[key].iso; carry[key].movedTo=s.iso; carry[key]=null}
      if(bad) carry[key]=s; else rot[key]=i+1;
    });
    return out;
  }
  function exercises(c,s,all){
    var w=s.prog&&s.prog.workouts&&s.prog.workouts[s.workout]; if(!w||!w.ex) return [];
    var nextOf={}; all.forEach(function(x){ if(x.prog===s.prog&&x.status==="planned"&&!nextOf[x.workout]) nextOf[x.workout]=x });
    return w.ex.map(function(e){var sw=c.swaps.filter(function(x){return x.workout===s.workout&&x.key===e[3]&&nextOf[s.workout]===s})[0]; if(sw) return [sw.to[0],sw.to[1],sw.to[2],null,{from:e[0],why:sw.why}]; return e});
  }
  DB.CP={get:get,logFor:logFor,stat:stat,SW:SW,slots:slots,exercises:exercises,progOn:progOn,
    f:{sd:sd,wd:wd,rel:rel,longd:longd,tm:tm,add:add,dow:dow,diff:diff,num:num,WD:WD,MON:MON,MONL:MONL},
    clients:function(){return M.people().filter(function(p){return (p.coach||P[p.id]||p.wasClient)&&!(M.dupOf(p.id)&&M.dupOf(p.id).drop===p.id)})}};
})();
