/* Milton Studio kit: the member data snapshot, the component catalog, the chart kit, the illustration library and the renderer.
   Ported from Milton_Studio_Component_Catalog.html, with the story cards from Milton_Studio_in_the_Home_flow.html.
   Rebuilt on the prototype's gym and people. Reports and stories keep their own look, so they draw inside a shadow root. */
(function(){

/* =====================================================================
   MILTON DATA (mock). 12 weeks of daily data per member, calculated the
   way Milton's backend would. Components reference these by key.
   ===================================================================== */
const MON=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const ND=84, START=Date.UTC(2026,7,28);
const DAYS=[...Array(ND)].map((_,i)=>new Date(START+i*864e5));
const fmtD=d=>MON[d.getUTCMonth()]+" "+d.getUTCDate();
const DLAB=DAYS.map(fmtD);
const WEEKS=[...Array(12)].map((_,w)=>DLAB[w*7]);
const PERIOD=DLAB[0]+" to "+DLAB[ND-1];
const SNAP_AT="2026-11-20T08:40", TODAY="Nov 20, 2026";
const GYM={name:"Northline Strength",short:"NS",link:"northlinestrength.com/s/",voice:"Direct, warm, no fluff. Celebrate effort. Plain words."};
function seeded(s){return ()=>{s=(s*16807)%2147483647;return (s-1)/2147483646}}
const ease=(t,k)=>1-Math.pow(1-t,k);
const avg=a=>a.reduce((x,y)=>x+y,0)/(a.length||1);
const rolling=(a,n)=>a.map((_,i)=>avg(a.slice(Math.max(0,i-n+1),i+1)));
const r1=v=>Math.round(v*10)/10;

const MEMBER_CFG={
 "devon":{seed:11,name:"Devon Marsh",first:"Devon",coach:"Andre Lewis",program:"Strength Block 2, semi-private 3x/week",goal:"Squat 315 by spring and stop skipping meals on work days",
  trainDays:[0,2,5],miss:.09,weight:[198.6,195.8],weightGood:"down",bf:[22.4,20.6],
  lifts:[["squat_e1rm","Back squat",250,305,5,"lb"],["deadlift_e1rm","Deadlift",315,345,5,"lb"],["bench_e1rm","Bench press",200,215,5,"lb"]],
  volume:[21000,30500],steps:[6500,7900],sleep:[6.7,7.2],protein:[98,112,150],carbs:290,fat:84,logMiss:.24,
  radar:{then:[55,58,50,52,40,56],now:[78,80,64,56,49,62]},
  goals:[["goal_squat","Back squat to 315 lb","squat_e1rm",315],["goal_protein","Protein to 150 g a day","protein_weekly",150],["goal_sleep","Sleep to 7.5 h a night","sleep_weekly",7.5]],
  extraPR:[["Solo Sunday workout","6 Sundays in a row","Nov 15","His own idea"]],
  notes:[["Oct 26","Starting Block 2: heavier squats, three days. Protein is the thing to watch."],["Nov 13","Late cancel, called into work. He did Workout B on his own Sunday."],["Nov 17","Deadlift 295 for 5, moved well. Bench stalled, likely under-eating on work days."]]},
 "dana":{seed:29,name:"Dana Whitfield",first:"Dana",coach:"Tori Lane",program:"Strength and Recover, semi-private 2x/week",goal:"Keep up with Maya at camp and feel strong carrying everything",
  trainDays:[1,4],miss:.08,weight:[152.2,149.4],weightGood:"down",bf:[29.6,27.7],
  lifts:[["trapbar_e1rm","Trap bar deadlift",125,145,5,"lb"],["goblet_e1rm","Goblet squat",40,55,5,"lb"],["row_e1rm","Single-arm cable row",35,45,5,"lb"]],
  volume:[9000,14500],steps:[7500,8900],sleep:[6.9,7.2],protein:[90,108,120],carbs:185,fat:60,logMiss:.14,
  radar:{then:[44,66,62,64,58,60],now:[63,84,74,70,71,68]},
  goals:[["goal_trapbar","Trap bar deadlift to 155 lb","trapbar_e1rm",155],["goal_steps","Steps to 9,500 a day","steps_weekly",9500],["goal_protein","Protein to 120 g a day","protein_weekly",120]],
  extraPR:[["Box squat","Pain-free at full depth","Nov 9","First time since spring"]],
  notes:[["Oct 5","Knee flared after a long hike. Dropped trap bar load for two weeks."],["Nov 2","Goal set: pain-free squats and a 135 lb trap bar deadlift by January."],["Nov 9","Back to 125 for 5 and it moved fast."]]},
 "leah":{seed:47,name:"Leah Ortiz",first:"Leah",coach:"Tori Lane",program:"Semi-private 2x/week",goal:"Stronger hips for her long runs, and a routine she can keep",
  trainDays:[1,3],miss:.16,weight:[141.0,140.2],weightGood:"down",bf:[26.4,25.6],
  lifts:[["hipthrust_e1rm","Hip thrust",100,150,5,"lb"],["goblet_e1rm","Goblet squat",30,45,5,"lb"],["pushup_reps","Push-ups, best set",5,12,1,"reps"]],
  volume:[6500,11000],steps:[6100,7400],sleep:[6.6,6.9],protein:[70,84,100],carbs:200,fat:62,logMiss:.3,
  radar:{then:[34,50,58,54,42,52],now:[58,66,70,60,50,60]},
  goals:[["goal_steps","Steps to 8,000 a day","steps_weekly",8000],["goal_pushups","15 push-ups in a row","pushup_reps",15],["goal_hip","Hip thrust to 165 lb","hipthrust_e1rm",165]],
  extraPR:[["Long run","9 miles, hips felt fine","Nov 8","Longest since joining"]],
  notes:[["Aug 5","Started hip thrusts for hip strength on long runs."],["Nov 4","Hip thrust 115 for 10. Missed two sessions this month for work travel."]]}
};
const RADAR_AXES=["Strength","Consistency","Activity","Sleep","Nutrition","Recovery"];

function fmtVal(v,unit,dec){
  if(v==null||isNaN(v))return "";
  if(unit==="steps")return Math.round(v).toLocaleString("en-US");
  const n=dec!=null?v.toFixed(dec):(Math.abs(v)>=100?Math.round(v).toString():r1(v).toString());
  return unit==="%"?n+"%":unit?n+" "+unit:n;
}

function buildMember(id){
  const c=MEMBER_CFG[id], r=seeded(c.seed), g=()=>(r()+r()+r()-1.5)/1.5;
  const D={};
  const S=(key,o)=>{D[key]={key,kind:"series",source:"",dec:null,...o}};
  // body weight, daily
  const wob=[...Array(13)].map(()=>g()*0.55);
  const bw=DAYS.map((d,i)=>{const dow=d.getUTCDay();return r1(wob[Math.floor(i/7)]*(i>6?1:0)+c.weight[0]+(c.weight[1]-c.weight[0])*ease(i/(ND-1),1.25)+g()*0.7+(dow===0||dow===1?0.5:0))});
  bw[0]=c.weight[0];
  S("bodyweight",{label:"Body weight",unit:"lb",dec:1,cadence:"daily",x:DLAB,v:bw,goodDir:c.weightGood,source:"Scale photos logged in the app"});
  const wk=(arr,dec=1)=>[...Array(12)].map((_,w)=>+avg(arr.slice(w*7,w*7+7)).toFixed(dec));
  S("bodyweight_weekly",{label:"Body weight, weekly average",unit:"lb",dec:1,cadence:"weekly",x:WEEKS,v:wk(bw),goodDir:c.weightGood,source:"Weekly average of daily weigh-ins"});
  // scans every 2 weeks
  const scanIdx=[0,14,28,42,56,70,83];
  const bf=scanIdx.map((d,i)=>i===0?c.bf[0]:r1(c.bf[0]+(c.bf[1]-c.bf[0])*ease(i/6,1.3)+g()*0.25));bf[6]=c.bf[1];
  const scanW=scanIdx.map(i=>avg(bw.slice(Math.max(0,i-2),i+1)));
  const lean=scanW.map((w,i)=>r1(w*(1-bf[i]/100))), fat=scanW.map((w,i)=>r1(w*bf[i]/100));
  const scanX=scanIdx.map(i=>DLAB[i]);
  S("body_fat",{label:"Body fat",unit:"%",dec:1,cadence:"scan",x:scanX,v:bf,goodDir:"down",source:"Body composition scans every 2 weeks"});
  S("lean_mass",{label:"Lean muscle mass",unit:"lb",dec:1,cadence:"scan",x:scanX,v:lean,goodDir:"up",source:"Body composition scans every 2 weeks"});
  S("fat_mass",{label:"Fat mass",unit:"lb",dec:1,cadence:"scan",x:scanX,v:fat,goodDir:"down",source:"Body composition scans every 2 weeks"});
  D.body_comp={key:"body_comp",kind:"partsCompare",label:"Body composition",unit:"lb",source:"First and latest scan",rows:[{label:scanX[0],parts:[{label:"Lean mass",v:lean[0]},{label:"Fat mass",v:fat[0]}]},{label:scanX[6],parts:[{label:"Lean mass",v:lean[6]},{label:"Fat mass",v:fat[6]}]}]};
  // sessions
  const train=DAYS.map((d,i)=>c.trainDays.includes(d.getUTCDay())?(r()<c.miss&&i>2?0:1):null);
  const sessIdx=train.map((v,i)=>v===1?i:-1).filter(i=>i>=0);
  c.lifts.forEach(([key,label,a,b,step,unit])=>{
    const n=sessIdx.length;let prev=a;
    const v=sessIdx.map((di,k)=>{if(k===0)return a;if(k===n-1)return b;let x=a+(b-a)*ease(k/(n-1),1.5)+g()*(b-a)*.05;x=Math.round(x/step)*step;if(x<prev-step)x=prev-step;prev=Math.max(prev,x);return x});
    S(key,{label:label+(unit==="reps"?"":" (est. 1RM)"),unit,dec:0,cadence:"session",x:sessIdx.map(i=>DLAB[i]),v,goodDir:"up",source:"Estimated from logged working sets"});
  });
  const wsess=[...Array(12)].map((_,w)=>train.slice(w*7,w*7+7).filter(v=>v===1).length);
  S("weekly_sessions",{label:"Sessions per week",unit:"sessions",dec:0,cadence:"weekly",x:WEEKS,v:wsess,target:c.trainDays.length,goodDir:"up",source:"Check-ins on scheduled sessions"});
  const vol=[...Array(12)].map((_,w)=>{let x=c.volume[0]+(c.volume[1]-c.volume[0])*ease(w/11,1.2);x=x*(wsess[w]/c.trainDays.length);if(w===7)x*=.62;return Math.round(x/100)*100});
  S("weekly_volume",{label:"Training volume",unit:"lb",dec:0,cadence:"weekly",x:WEEKS,v:vol,goodDir:"up",source:"Sets x reps x load, all logged lifts"});
  // stacked minutes
  const mStr=wsess.map(s=>s*40+Math.round(g()*6)),mCon=wsess.map((s,w)=>s*12+Math.round(6+w*1.2+g()*5)),mMob=wsess.map((s,w)=>Math.max(0,Math.round(8+w*1.4+g()*4)));
  D.training_minutes={key:"training_minutes",kind:"stack",label:"Training minutes by type",unit:"min",x:WEEKS,series:[{label:"Strength",v:mStr},{label:"Conditioning",v:mCon},{label:"Mobility",v:mMob}],source:"Logged workouts by block type"};
  // steps, sleep, protein daily
  const steps=DAYS.map((d,i)=>Math.max(1500,Math.round(c.steps[0]+(c.steps[1]-c.steps[0])*ease(i/(ND-1),1.3)+g()*1600+(d.getUTCDay()===6?900:0))));
  S("steps_daily",{label:"Daily steps",unit:"steps",dec:0,cadence:"daily",x:DLAB,v:steps,goodDir:"up",source:"Phone step count"});
  S("steps_weekly",{label:"Daily steps, weekly average",unit:"steps",dec:0,cadence:"weekly",x:WEEKS,v:wk(steps,0).map(v=>Math.round(v/10)*10),goodDir:"up",source:"Phone step count, weekly average"});
  const sleep=DAYS.map((d,i)=>r1(c.sleep[0]+(c.sleep[1]-c.sleep[0])*ease(i/(ND-1),1.2)+g()*.55));
  S("sleep_weekly",{label:"Sleep per night",unit:"h",dec:1,cadence:"weekly",x:WEEKS,v:wk(sleep),goodDir:"up",source:"Wearable sleep, weekly average"});
  const prot=DAYS.map((d,i)=>{const we=[0,6].includes(d.getUTCDay());return Math.round(c.protein[0]+(c.protein[1]-c.protein[0])*ease(i/(ND-1),1.2)+g()*10-(we?18:0))});
  S("protein_weekly",{label:"Protein per day",unit:"g",dec:0,cadence:"weekly",x:WEEKS,v:wk(prot,0),target:c.protein[2],goodDir:"up",source:"Food logs, logged days"});
  const pg=avg(prot.slice(-28));
  D.macros={key:"macros",kind:"parts",label:"Calories by macro, last 4 weeks",unit:"kcal",source:"Food logs",parts:[{label:"Protein",v:Math.round(pg*4)},{label:"Carbs",v:Math.round(c.carbs*4)},{label:"Fat",v:Math.round(c.fat*9)}]};
  const tm=[mStr,mCon,mMob].map(a=>a.slice(-4).reduce((x,y)=>x+y,0));
  D.training_mix={key:"training_mix",kind:"parts",label:"Training mix, last 4 weeks",unit:"min",source:"Logged workouts by block type",parts:[{label:"Strength",v:tm[0]},{label:"Conditioning",v:tm[1]},{label:"Mobility",v:tm[2]}]};
  // habits: last 30 days + prior 30
  const logged=DAYS.map(d=>{const we=[0,6].includes(d.getUTCDay());return r()<(we?c.logMiss*2.6:c.logMiss*.5)?0:1});
  const habitRows=(a,b)=>[{label:"Training",cells:train.slice(a,b)},{label:"7k+ steps",cells:steps.slice(a,b).map(v=>v>=7000?1:0)},{label:"7h+ sleep",cells:sleep.slice(a,b).map(v=>v>=7?1:0)},{label:"Food logged",cells:logged.slice(a,b)}];
  const cons=rows=>{let p=0,d=0;rows.forEach(rw=>rw.cells.forEach(v=>{if(v!==null){p++;d+=v}}));return {pct:Math.round(d/p*100),p,d}};
  const last=habitRows(ND-30,ND),prior=habitRows(ND-60,ND-30);const cl=cons(last),cp=cons(prior);
  D.habits={key:"habits",kind:"habits",label:"Health actions, last 30 days",days:DLAB.slice(ND-30),dows:DAYS.slice(ND-30).map(d=>"SMTWTFS"[d.getUTCDay()]),rows:last,source:"Training check-ins, steps, sleep, food logs"};
  D.activity_calendar={key:"activity_calendar",kind:"calendar",label:"Activity, 12 weeks",days:DLAB,dows:DAYS.map(d=>d.getUTCDay()),levels:DAYS.map((d,i)=>train[i]===1?(steps[i]>=8000?4:3):steps[i]>=9000?2:steps[i]>=6500?1:0),source:"Sessions and daily steps"};
  // metrics
  const M=(key,o)=>{D[key]={key,kind:"metric",...o}};
  M("consistency",{label:"Consistency",display:cl.pct+"%",value:cl.pct,prior:cp.pct+"%",delta:(cl.pct-cp.pct>=0?"+":"")+(cl.pct-cp.pct)+" pts",good:cl.pct>=cp.pct,source:"Planned health actions done, last 30 days ("+cl.d+" of "+cl.p+")"});
  const t30=train.slice(ND-30).filter(v=>v!==null),tp=train.slice(ND-60,ND-30).filter(v=>v!==null);
  const s30=t30.filter(v=>v).length,sp=tp.filter(v=>v).length;
  M("sessions",{label:"Sessions attended",display:s30+" of "+t30.length,value:s30,prior:sp+" of "+tp.length,delta:(s30-sp>=0?"+":"")+(s30-sp)+" vs prior 30 days",good:s30>=sp,source:"Check-ins on scheduled sessions, last 30 days"});
  const pct=c.lifts.map(l=>(l[3]-l[2])/l[2]);const si=Math.round(avg(pct)*100);
  M("strength_index",{label:"Strength change",display:"+"+si+"%",value:si,delta:"avg of "+c.lifts.length+" main lifts",good:true,source:"Average change in estimated 1RM, 12 weeks"});
  const st4=Math.round(avg(steps.slice(-28))/10)*10,st0=Math.round(avg(steps.slice(0,28))/10)*10;
  M("steps_avg",{label:"Daily steps",display:st4.toLocaleString("en-US"),value:st4,prior:st0.toLocaleString("en-US"),delta:(st4-st0>=0?"+":"")+(st4-st0).toLocaleString("en-US")+" a day",good:st4>=st0,source:"Last 4 weeks vs first 4 weeks"});
  const sl4=r1(avg(sleep.slice(-28))),sl0=r1(avg(sleep.slice(0,28)));
  M("sleep_avg",{label:"Sleep",display:sl4.toFixed(1)+" h",value:sl4,prior:sl0.toFixed(1)+" h",delta:(sl4-sl0>=0?"+":"")+(sl4-sl0).toFixed(1)+" h",good:sl4>=sl0,source:"Last 4 weeks vs first 4 weeks"});
  const p4=Math.round(pg);
  M("protein_avg",{label:"Protein",display:p4+" g/day",value:p4,target:c.protein[2]+" g",delta:(p4-c.protein[2])+" g vs target",good:p4>=c.protein[2],source:"Food logs, last 4 weeks"});
  const wkly=D.bodyweight_weekly.v,wd=r1(wkly[11]-wkly[0]);
  M("weight_change",{label:"Weight change",display:(wd>0?"+":"")+wd+" lb",value:wd,delta:"since "+WEEKS[0],good:c.weightGood==="down"?wd<=0:wd>=0,source:"Weekly average, first vs latest week"});
  const ld=r1(lean[6]-lean[0]);
  M("lean_change",{label:"Lean mass change",display:(ld>=0?"+":"")+ld+" lb",value:ld,delta:"since "+scanX[0],good:ld>=0,source:"First vs latest scan"});
  const bfd=r1(bf[6]-bf[0]);
  M("bodyfat_change",{label:"Body fat change",display:(bfd>0?"+":"")+bfd+" pts",value:bfd,delta:bf[0]+"% to "+bf[6]+"%",good:bfd<=0,source:"First vs latest scan"});
  const logW=logged.slice(ND-30).filter((v,i)=>[0,6].includes(DAYS[ND-30+i].getUTCDay()));
  M("weekend_logging",{label:"Weekend food logging",display:logW.filter(v=>v).length+" of "+logW.length+" days",value:logW.filter(v=>v).length,good:false,source:"Food logs, last 30 days"});
  // radar
  D.scores={key:"scores",kind:"radar",label:"Health scores, 0 to 100",axes:RADAR_AXES,then:c.radar.then,now:c.radar.now,thenLabel:WEEKS[0],nowLabel:"Now",source:"Milton scores, first week vs now"};
  // goals
  c.goals.forEach(([key,label,src,target])=>{const s=D[src];const start=s.v[0],cur=s.cadence==="weekly"?s.v[11]:s.v[s.v.length-1];const p=Math.max(0,Math.min(1,(cur-start)/(target-start)));
    D[key]={key,kind:"goal",label,start,current:cur,target,unit:s.unit,dec:s.dec,progress:p,source:s.source+" vs coach goal"}});
  // records
  const rec=c.lifts.map(([key,label,a,b,step,unit])=>{const s=D[key];const mx=Math.max(...s.v);const i=s.v.lastIndexOf(mx);return {label,best:fmtVal(mx,unit,0),date:s.x[i],gain:"+"+(mx-s.v[0])+" "+unit,series:key}});
  c.extraPR.forEach(([label,best,date,gain])=>rec.push({label,best,date,gain}));
  D.records={key:"records",kind:"records",label:"Personal records",rows:rec,source:"Best logged results, 12 weeks"};
  return {id,name:c.name,first:c.first,coach:c.coach,program:c.program,goal:c.goal,notes:c.notes,data:D};
}
const MEMBERS={};Object.keys(MEMBER_CFG).forEach(id=>MEMBERS[id]=buildMember(id));

/* value helpers used by tokens and tiles */
function seriesSummary(s){const a=s.v[0],b=s.v[s.v.length-1];const ch=b-a;const good=s.goodDir==="down"?ch<=0:s.goodDir==="up"?ch>=0:null;
  const chs=(ch>0?"+":ch<0?"−":"")+fmtVal(Math.abs(ch),s.unit,s.dec==null?1:s.dec);
  return {display:fmtVal(b,s.unit,s.dec),start:fmtVal(a,s.unit,s.dec),change:chs,good,since:s.x[0]}}
function resolveToken(t,m){
  const [a,b]=t.split(".");
  if(a==="member")return b==="firstName"?m.first:b==="name"?m.name:b==="goal"?m.goal:b==="coach"?m.coach:null;
  if(a==="gym")return b==="name"?GYM.name:null;
  const x=m.data[a];if(!x)return null;
  if(x.kind==="metric"){if(!b||b==="value")return x.display;if(b==="delta")return x.delta||null;if(b==="target")return x.target||null;if(b==="prior")return x.prior||null;return null}
  if(x.kind==="series"){const s=seriesSummary(x);if(!b||b==="end"||b==="value")return s.display;if(b==="start")return s.start;if(b==="change")return s.change;if(b==="target")return x.target!=null?fmtVal(x.target,x.unit,x.dec):null;return null}
  if(x.kind==="goal"){if(!b)return Math.round(x.progress*100)+"%";if(b==="target")return fmtVal(x.target,x.unit,x.dec);if(b==="current")return fmtVal(x.current,x.unit,x.dec);return null}
  return null;
}

/* =====================================================================
   CHART KIT. Hand-built SVG in Milton's chart style: thin marks, 2px lines,
   4px rounded data ends, hairline grid, surface gaps and rings, hover tips.
   ===================================================================== */
const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const INK="var(--ink)",INK2="var(--ink2)",MUTED="var(--muted)",GRID="var(--grid)",SURF="#fff";
const C=i=>`var(--c${i+1})`;
const GOOD="var(--good)",AWAY="var(--away)";
let UID=0;
function niceStep(r){const p=Math.pow(10,Math.floor(Math.log10(r||1)));const n=r/p;return (n<=1?1:n<=2?2:n<=2.5?2.5:n<=5?5:10)*p}
function ticks(lo,hi,n=4){if(lo===hi){lo-=1;hi+=1}const st=niceStep((hi-lo)/n);const a=Math.floor(lo/st)*st,b=Math.ceil(hi/st)*st;const t=[];for(let v=a;v<=b+st/2;v+=st)t.push(+v.toFixed(6));return {lo:a,hi:b,t}}
function tickFmt(v,unit,max){if(Math.abs(max)>=10000)return (v/1000).toLocaleString("en-US")+"K";if(Math.abs(max)>=1000)return Math.round(v).toLocaleString("en-US");return (Math.round(v*10)/10).toString()+(unit==="%"?"%":"")}
function txt(x,y,s,o={}){return `<text x="${x}" y="${y}" font-size="${o.size||11}" fill="${o.fill||MUTED}" text-anchor="${o.anchor||"start"}" font-weight="${o.weight||400}"${o.base?` dominant-baseline="${o.base}"`:""}>${esc(s)}</text>`}
function monotone(pts){ // Fritsch-Carlson monotone cubic path
  const n=pts.length;if(n<2)return "";if(n===2)return `M${pts[0][0]},${pts[0][1]}L${pts[1][0]},${pts[1][1]}`;
  const dx=[],dy=[],m=[],t=[];for(let i=0;i<n-1;i++){dx[i]=pts[i+1][0]-pts[i][0];dy[i]=pts[i+1][1]-pts[i][1];m[i]=dy[i]/dx[i]}
  t[0]=m[0];t[n-1]=m[n-2];for(let i=1;i<n-1;i++)t[i]=m[i-1]*m[i]<=0?0:(m[i-1]+m[i])/2;
  for(let i=0;i<n-1;i++){if(m[i]===0){t[i]=t[i+1]=0;continue}const a=t[i]/m[i],b=t[i+1]/m[i],h=a*a+b*b;if(h>9){const s=3/Math.sqrt(h);t[i]=s*a*m[i];t[i+1]=s*b*m[i]}}
  let d=`M${pts[0][0]},${pts[0][1]}`;for(let i=0;i<n-1;i++){const h=dx[i]/3;d+=`C${pts[i][0]+h},${pts[i][1]+h*t[i]} ${pts[i+1][0]-h},${pts[i+1][1]-h*t[i+1]} ${pts[i+1][0]},${pts[i+1][1]}`}return d}
function colPath(x,y,w,h,r=4,down=false){if(h<=0)return "";r=Math.min(r,h,w/2);
  if(!down)return `M${x},${y+h}V${y+r}Q${x},${y} ${x+r},${y}H${x+w-r}Q${x+w},${y} ${x+w},${y+r}V${y+h}Z`;
  return `M${x},${y}V${y+h-r}Q${x},${y+h} ${x+r},${y+h}H${x+w-r}Q${x+w},${y+h} ${x+w},${y+h-r}V${y}Z`}
function dot(x,y,r,fill){return `<circle cx="${x}" cy="${y}" r="${r+2}" fill="${SURF}"/><circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`}
function svgWrap(W,H,inner,label){return `<svg class="viz" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label)}">${inner}</svg>`}
function xLabelIdx(n,max=6){if(n<=max)return [...Array(n).keys()];const out=[];for(let k=0;k<max;k++)out.push(Math.round(k*(n-1)/(max-1)));return out}
function pill(text,good){return `<span class="pill ${good===true?"good":good===false?"away":""}">${esc(text)}</span>`}
function legend(items,shape="rect"){return `<div class="legend">${items.map(([l,c])=>`<span><i class="${shape}" style="background:${c}"></i>${esc(l)}</span>`).join("")}</div>`}
function crosshair(P,H){return `<line class="xh" x1="0" x2="0" y1="${P.t}" y2="${H-P.b}" stroke="var(--ink2)" stroke-width="1" opacity="0"/>`}
function hitCols(xs,P,H,tips){const w=xs.length>1?(xs[1]-xs[0]):40;return xs.map((x,i)=>`<rect class="hit" x="${x-w/2}" y="${P.t}" width="${w}" height="${H-P.t-P.b}" fill="transparent" data-x="${x}" data-tip="${esc(tips[i])}"/>`).join("")}
const tipRow=(label,val,color)=>`<div class="tr">${color?`<i style="background:${color}"></i>`:""}<b>${val}</b><span>${label}</span></div>`;

/* ---- single series trend ---- */
function vizTrend(s,o={}){
  const W=640,H=o.h||250,P={l:46,r:o.compact?14:64,t:20,b:30};
  const raw=s.v,daily=s.cadence==="daily";const main=daily?rolling(raw,7).map(r1):raw;
  let lo=Math.min(...raw),hi=Math.max(...raw);if(s.target!=null&&o.goal!==false){lo=Math.min(lo,s.target);hi=Math.max(hi,s.target)}
  const pad=(hi-lo)*.12||1;const tk=ticks(lo-pad,hi+pad,4);
  const n=raw.length,X=i=>P.l+i*(W-P.l-P.r)/(n-1),Y=v=>P.t+(tk.hi-v)/(tk.hi-tk.lo)*(H-P.t-P.b);
  let g="";tk.t.forEach(v=>{g+=`<line x1="${P.l}" x2="${W-P.r}" y1="${Y(v)}" y2="${Y(v)}" stroke="${GRID}"/>`+txt(P.l-8,Y(v)+4,tickFmt(v,s.unit,tk.hi),{anchor:"end"})});
  xLabelIdx(n,o.compact?4:6).forEach(i=>g+=txt(X(i),H-8,s.x[i],{anchor:i===0?"start":i===n-1?"end":"middle"}));
  const id="g"+(++UID);
  g+=`<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C(0)}" stop-opacity=".16"/><stop offset="1" stop-color="${C(0)}" stop-opacity="0"/></linearGradient></defs>`;
  const pts=main.map((v,i)=>[X(i),Y(v)]);const path=monotone(pts);
  if(o.variant!=="line")g+=`<path d="${path}L${X(n-1)},${Y(tk.lo)}L${X(0)},${Y(tk.lo)}Z" fill="url(#${id})"/>`;
  if(daily)raw.forEach((v,i)=>g+=`<circle cx="${X(i)}" cy="${Y(v)}" r="1.6" fill="${C(0)}" opacity=".28"/>`);
  if(s.target!=null&&o.goal!==false){g+=`<line x1="${P.l}" x2="${W-P.r}" y1="${Y(s.target)}" y2="${Y(s.target)}" stroke="var(--ink2)" stroke-width="1"/>`+txt(W-P.r+6,Y(s.target)+4,"Goal "+fmtVal(s.target,s.unit,s.dec),{fill:INK2,size:11})}
  g+=`<path d="${path}" fill="none" stroke="${C(0)}" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"/>`;
  if(!daily&&n<=16)pts.slice(1,-1).forEach(p=>g+=dot(p[0],p[1],3,C(0)));
  g+=dot(pts[0][0],pts[0][1],4,C(0))+dot(pts[n-1][0],pts[n-1][1],5,C(0));
  if(!o.compact){const sv=fmtVal(main[0],s.unit,s.dec),ev=fmtVal(main[n-1],s.unit,s.dec);
    const up=main[n-1]>=main[0];
    g+=txt(pts[0][0]+8,pts[0][1]+(up?16:-10),sv,{fill:INK2,size:11.5});
    g+=txt(pts[n-1][0]+10,pts[n-1][1]+4,ev,{fill:INK,size:12.5,weight:700});
    if(o.annotate==="minmax"){const mi=main.indexOf(Math.min(...main)),ma=main.indexOf(Math.max(...main));[[mi,"Low",14],[ma,"High",-10]].forEach(([i,l,dy])=>{if(i>0&&i<n-1){g+=dot(X(i),Y(main[i]),3.5,C(0))+txt(X(i),Y(main[i])+dy,l+" "+fmtVal(main[i],s.unit,s.dec),{anchor:"middle",fill:INK2,size:11})}})}}
  const tips=raw.map((v,i)=>`<div class="th">${esc(s.x[i])}</div>`+tipRow(daily?"Day":s.label,fmtVal(v,s.unit,s.dec),C(0))+(daily?tipRow("7-day average",fmtVal(main[i],s.unit,s.dec),C(0)):""));
  g+=crosshair(P,H)+hitCols(pts.map(p=>p[0]),P,H,tips);
  return svgWrap(W,H,g,s.label+" trend");
}
/* ---- up to 3 series ---- */
function vizMulti(list,o={}){
  const W=640,H=o.h||260,P={l:50,r:16,t:16,b:30};
  const units=new Set(list.map(s=>s.unit));const idx=units.size>1||o.mode==="percent";
  const ser=list.map(s=>{const v=s.cadence==="daily"?rolling(s.v,7):s.v;return idx?v.map(x=>(x-v[0])/v[0]*100):v});
  const all=ser.flat();let lo=Math.min(...all),hi=Math.max(...all);if(idx)lo=Math.min(0,lo);const pad=(hi-lo)*.1||1;const tk=ticks(lo-(idx?0:pad),hi+pad,4);
  const Xs=ser.map(v=>i=>P.l+i*(W-P.l-P.r)/(v.length-1)),Y=v=>P.t+(tk.hi-v)/(tk.hi-tk.lo)*(H-P.t-P.b);
  let g="";tk.t.forEach(v=>{g+=`<line x1="${P.l}" x2="${W-P.r}" y1="${Y(v)}" y2="${Y(v)}" stroke="${v===0&&idx?"var(--ink2)":GRID}"/>`+txt(P.l-8,Y(v)+4,idx?(v>0?"+":"")+Math.round(v)+"%":tickFmt(v,list[0].unit,tk.hi),{anchor:"end"})});
  const ref=list.reduce((a,b)=>b.x.length>a.x.length?b:a);const n=ref.x.length;const Xr=i=>P.l+i*(W-P.l-P.r)/(n-1);
  xLabelIdx(n,6).forEach(i=>g+=txt(Xr(i),H-8,ref.x[i],{anchor:i===0?"start":i===n-1?"end":"middle"}));
  ser.forEach((v,j)=>{const pts=v.map((y,i)=>[Xs[j](i),Y(y)]);g+=`<path d="${monotone(pts)}" fill="none" stroke="${C(j)}" stroke-width="2" stroke-linecap="round"/>`+dot(pts[pts.length-1][0],pts[pts.length-1][1],4,C(j))});
  const tips=ref.x.map((x,i)=>{const t=i/(n-1);return `<div class="th">${esc(x)}</div>`+list.map((s,j)=>{const k=Math.round(t*(ser[j].length-1));const val=idx?((ser[j][k]>=0?"+":"")+ser[j][k].toFixed(1)+"%"):fmtVal(ser[j][k],s.unit,s.dec);return tipRow(s.label,val,C(j))}).join("")});
  g+=crosshair(P,H)+hitCols([...Array(n)].map((_,i)=>Xr(i)),P,H,tips);
  return svgWrap(W,H,g,list.map(s=>s.label).join(", "))+legend(list.map((s,j)=>[s.label+"  "+(idx?(ser[j].at(-1)>=0?"+":"")+Math.round(ser[j].at(-1))+"%":fmtVal(ser[j].at(-1),s.unit,s.dec)),C(j)]),"line")+(idx?`<p class="cap">Shown as % change from the first point so different units share one scale.</p>`:"");
}
/* ---- sparkline ---- */
function spark(s,w=120,h=36,color){const v=s.cadence==="daily"?rolling(s.v,7):s.v;const lo=Math.min(...v),hi=Math.max(...v)||1;const X=i=>2+i*(w-8)/(v.length-1),Y=x=>3+(hi-x)/((hi-lo)||1)*(h-8);
  const pts=v.map((x,i)=>[X(i),Y(x)]);const d=monotone(pts);const col=color||C(0);
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" aria-hidden="true"><path d="${d}L${X(v.length-1)},${h}L${X(0)},${h}Z" fill="${col}" opacity=".1"/><path d="${d}" fill="none" stroke="${col}" stroke-width="2" stroke-linecap="round"/>${dot(pts.at(-1)[0],pts.at(-1)[1],3,col)}</svg>`}
/* ---- vertical columns ---- */
function vizColumns(s,o={}){
  const W=640,H=o.h||250,P={l:46,r:o.average||s.target!=null?70:16,t:26,b:30};const v=s.v,n=v.length;
  let hi=Math.max(...v,s.target||0)*1.12;const tk=ticks(0,hi,4);
  const band=(W-P.l-P.r)/n,bw=Math.min(24,band*.62),X=i=>P.l+band*i+band/2,Y=x=>P.t+(tk.hi-x)/(tk.hi-tk.lo)*(H-P.t-P.b);
  let g="";tk.t.forEach(t=>{g+=`<line x1="${P.l}" x2="${W-P.r}" y1="${Y(t)}" y2="${Y(t)}" stroke="${t===0?"var(--ink2)":GRID}"/>`+txt(P.l-8,Y(t)+4,tickFmt(t,s.unit,tk.hi),{anchor:"end"})});
  const best=v.indexOf(Math.max(...v));const hl=o.highlight||"latest";
  v.forEach((x,i)=>{const on=hl==="all"||(hl==="latest"&&i===n-1)||(hl==="best"&&i===best);
    g+=`<path d="${colPath(X(i)-bw/2,Y(x),bw,Y(0)-Y(x))}" fill="${on?C(0):"var(--t3)"}" class="mk" data-tip="${esc(`<div class="th">${esc(s.x[i])}</div>`+tipRow(s.label,fmtVal(x,s.unit,s.dec),C(0)))}"/>`;
    if(on&&hl!=="all")g+=txt(X(i),Y(x)-8,fmtVal(x,s.unit==="sessions"?"":s.unit,s.dec),{anchor:"middle",fill:INK,size:12,weight:700});
    if(n<=12||i%2===0)g+=txt(X(i),H-8,s.x[i],{anchor:"middle",size:10.5})});
  if(s.target!=null){g+=`<line x1="${P.l}" x2="${W-P.r}" y1="${Y(s.target)}" y2="${Y(s.target)}" stroke="var(--ink)" stroke-width="1"/>`+txt(W-P.r+6,Y(s.target)+4,"Goal "+fmtVal(s.target,s.unit==="sessions"?"":s.unit,s.dec),{fill:INK2})}
  if(o.average){const a=avg(v);g+=`<line x1="${P.l}" x2="${W-P.r}" y1="${Y(a)}" y2="${Y(a)}" stroke="var(--ink2)" stroke-width="1" opacity=".7"/>`+txt(W-P.r+6,Y(a)+(s.target!=null&&Math.abs(Y(a)-Y(s.target))<14?16:4),"Avg "+fmtVal(a,s.unit==="sessions"?"":s.unit,s.unit==="sessions"?1:s.dec),{fill:INK2})}
  return svgWrap(W,H,g,s.label+" by week");
}
/* ---- stacked columns ---- */
function vizStack(d,o={}){
  const W=640,H=o.h||260,P={l:46,r:16,t:16,b:30};const n=d.x.length;const tot=d.x.map((_,i)=>d.series.reduce((a,s)=>a+s.v[i],0));
  const tk=ticks(0,Math.max(...tot)*1.08,4);const band=(W-P.l-P.r)/n,bw=Math.min(24,band*.62),X=i=>P.l+band*i+band/2,Y=x=>P.t+(tk.hi-x)/(tk.hi-tk.lo)*(H-P.t-P.b);
  let g="";tk.t.forEach(t=>{g+=`<line x1="${P.l}" x2="${W-P.r}" y1="${Y(t)}" y2="${Y(t)}" stroke="${t===0?"var(--ink2)":GRID}"/>`+txt(P.l-8,Y(t)+4,tickFmt(t,"",tk.hi),{anchor:"end"})});
  d.x.forEach((x,i)=>{let base=0;const tip=`<div class="th">${esc(x)}</div>`+d.series.map((s,j)=>tipRow(s.label,s.v[i]+" "+d.unit,C(j))).join("")+tipRow("Total",tot[i]+" "+d.unit);
    d.series.forEach((s,j)=>{const y0=Y(base),y1=Y(base+s.v[i]);const top=j===d.series.length-1;const h=y0-y1-(j>0?2:0);
      g+=top?`<path d="${colPath(X(i)-bw/2,y1,bw,h)}" fill="${C(j)}" class="mk" data-tip="${esc(tip)}"/>`:`<rect x="${X(i)-bw/2}" y="${y1}" width="${bw}" height="${Math.max(0,h)}" fill="${C(j)}" class="mk" data-tip="${esc(tip)}"/>`;base+=s.v[i]});
    g+=txt(X(i),H-8,x,{anchor:"middle",size:10.5})});
  const li=n-1;g+=txt(X(li),Y(tot[li])-8,tot[li]+" "+d.unit,{anchor:"middle",fill:INK,size:12,weight:700});
  return svgWrap(W,H,g,d.label)+legend(d.series.map((s,j)=>[s.label,C(j)]));
}
/* ---- week over week change ---- */
function vizDelta(s,o={}){
  const W=640,H=o.h||230,P={l:46,r:16,t:22,b:30};const d=s.v.slice(1).map((v,i)=>+(v-s.v[i]).toFixed(s.dec??1));const xs=s.x.slice(1);const n=d.length;
  const m=Math.max(...d.map(Math.abs))*1.2||1;const tk=ticks(-m,m,4);
  const band=(W-P.l-P.r)/n,bw=Math.min(24,band*.6),X=i=>P.l+band*i+band/2,Y=x=>P.t+(tk.hi-x)/(tk.hi-tk.lo)*(H-P.t-P.b);
  let g="";tk.t.forEach(t=>{g+=`<line x1="${P.l}" x2="${W-P.r}" y1="${Y(t)}" y2="${Y(t)}" stroke="${t===0?"var(--ink2)":GRID}"/>`+txt(P.l-8,Y(t)+4,(t>0?"+":"")+tickFmt(t,s.unit,tk.hi),{anchor:"end"})});
  const big=d.map(Math.abs).indexOf(Math.max(...d.map(Math.abs)));
  d.forEach((v,i)=>{const good=s.goodDir==="down"?v<=0:v>=0;const col=good?GOOD:AWAY;const tip=`<div class="th">Week of ${esc(xs[i])}</div>`+tipRow(good?"Toward goal":"Away from goal",(v>0?"+":"")+fmtVal(v,s.unit,s.dec),col);
    g+=v>=0?`<path d="${colPath(X(i)-bw/2,Y(v),bw,Y(0)-Y(v))}" fill="${col}" class="mk" data-tip="${esc(tip)}"/>`:`<path d="${colPath(X(i)-bw/2,Y(0),bw,Y(v)-Y(0),4,true)}" fill="${col}" class="mk" data-tip="${esc(tip)}"/>`;
    if(i===big||i===n-1)g+=txt(X(i),v>=0?Y(v)-7:Y(v)+15,(v>0?"+":"")+fmtVal(v,s.unit,s.dec),{anchor:"middle",fill:INK,size:11.5,weight:700});
    g+=txt(X(i),H-8,xs[i],{anchor:"middle",size:10.5})});
  return svgWrap(W,H,g,s.label+" week over week")+legend([["Toward goal",GOOD],["Away from goal",AWAY]]);
}
/* ---- dumbbell: start vs now ---- */
function vizDumbbell(list){
  const same=new Set(list.map(s=>s.unit)).size===1;const gmax=Math.max(...list.flatMap(s=>s.v));
  const W=640,rowH=54,P={l:12,r:70},H=list.length*rowH+18;let g="";
  list.forEach((s,i)=>{const a=s.v[0],b=s.v.at(-1),mx=(same?gmax:Math.max(a,b))*1.08;const X=v=>P.l+v/mx*(W-P.l-P.r);const y=i*rowH+38;
    g+=txt(P.l,y-16,s.label,{fill:INK2,size:12.5,weight:600});
    g+=`<line x1="${P.l}" x2="${W-P.r}" y1="${y}" y2="${y}" stroke="${GRID}" stroke-width="2" stroke-linecap="round"/>`;
    g+=`<line x1="${X(a)}" x2="${X(b)}" y1="${y}" y2="${y}" stroke="var(--t3)" stroke-width="6" stroke-linecap="round"/>`;
    g+=dot(X(a),y,5,"var(--t4)")+dot(X(b),y,6,C(0));
    g+=txt(X(a),y+20,fmtVal(a,s.unit,s.dec),{anchor:"middle",size:11});
    g+=txt(W-P.r+8,y+4,fmtVal(b,s.unit,s.dec),{fill:INK,size:12.5,weight:700});
    g+=`<rect x="${P.l}" y="${y-18}" width="${W-P.l-P.r}" height="34" fill="transparent" class="mk" data-tip="${esc(`<div class="th">${esc(s.label)}</div>`+tipRow(s.x[0],fmtVal(a,s.unit,s.dec),"var(--t4)")+tipRow(s.x.at(-1),fmtVal(b,s.unit,s.dec),C(0)))}"/>`});
  return svgWrap(W,H,g,"Start versus now")+legend([[list[0].x[0],"var(--t4)"],["Now",C(0)]],"dot");
}
/* ---- tall segmented bar ---- */
function vizSegments(d){
  const rows=d.kind==="partsCompare"?d.rows:[{label:null,parts:d.parts}];const max=Math.max(...rows.map(r=>r.parts.reduce((a,p)=>a+p.v,0)));
  const h=rows.map(r=>{const tot=r.parts.reduce((a,p)=>a+p.v,0);const w=d.kind==="partsCompare"?tot/max*100:100;
    return `<div class="segrow">${r.label?`<span class="seglab">${esc(r.label)}</span>`:""}<div class="segbar" style="width:${w}%">${r.parts.map((p,j)=>{const share=Math.round(p.v/tot*100);const lab=d.kind==="partsCompare"?fmtVal(p.v,d.unit,1):share+"%";
      return `<div class="seg" style="flex:${p.v};background:${C(j)}" data-tip="${esc(`<div class="th">${esc(r.label||d.label)}</div>`+tipRow(p.label,fmtVal(p.v,d.unit,d.unit==="lb"?1:0)+" · "+share+"%",C(j)))}"><span>${esc(lab)}</span></div>`}).join("")}</div>${d.kind==="partsCompare"?`<span class="segtot">${fmtVal(tot,d.unit,1)}</span>`:""}</div>`}).join("");
  return `<div class="segs">${h}</div>`+legend(rows[0].parts.map((p,j)=>[p.label,C(j)]));
}
/* ---- donut ---- */
function vizDonut(d,o={}){
  const tot=d.parts.reduce((a,p)=>a+p.v,0);const R=78,r=54,cx=90,cy=90;let a0=-Math.PI/2,g="";
  d.parts.forEach((p,j)=>{const a1=a0+p.v/tot*Math.PI*2;const lg=a1-a0>Math.PI?1:0;const P=(rad,a)=>[cx+rad*Math.cos(a),cy+rad*Math.sin(a)];
    const [x0,y0]=P(R,a0),[x1,y1]=P(R,a1),[x2,y2]=P(r,a1),[x3,y3]=P(r,a0);
    g+=`<path d="M${x0},${y0}A${R},${R} 0 ${lg} 1 ${x1},${y1}L${x2},${y2}A${r},${r} 0 ${lg} 0 ${x3},${y3}Z" fill="${C(j)}" stroke="#fff" stroke-width="2" class="mk" data-tip="${esc(tipRow(p.label,Math.round(p.v/tot*100)+"% · "+p.v.toLocaleString("en-US")+" "+d.unit,C(j)))}"/>`;a0=a1});
  const top=d.parts.reduce((a,b)=>b.v>a.v?b:a);
  g+=`<text x="${cx}" y="${cy-2}" text-anchor="middle" font-size="24" font-weight="700" fill="var(--ink)">${Math.round(top.v/tot*100)}%</text><text x="${cx}" y="${cy+16}" text-anchor="middle" font-size="11" fill="var(--muted)">${esc(top.label)}</text>`;
  return `<div class="donut"><svg viewBox="0 0 180 180" class="viz" style="max-width:180px" role="img" aria-label="${esc(d.label)}">${g}</svg><ul class="dlist">${d.parts.map((p,j)=>`<li><i style="background:${C(j)}"></i><span>${esc(p.label)}</span><b>${Math.round(p.v/tot*100)}%</b><em>${p.v.toLocaleString("en-US")} ${esc(d.unit)}</em></li>`).join("")}</ul></div>`;
}
/* ---- radar ---- */
function vizRadar(d){
  const S=300,cx=150,cy=150,R=104,n=d.axes.length;const A=i=>-Math.PI/2+i*2*Math.PI/n;const P=(v,i)=>[cx+R*v/100*Math.cos(A(i)),cy+R*v/100*Math.sin(A(i))];
  let g="";[25,50,75,100].forEach(k=>{g+=`<polygon points="${d.axes.map((_,i)=>P(k,i).join(",")).join(" ")}" fill="none" stroke="${GRID}"/>`});
  d.axes.forEach((a,i)=>{const [x,y]=P(100,i);g+=`<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="${GRID}"/>`;const [lx,ly]=P(122,i);
    g+=`<text x="${lx}" y="${ly}" text-anchor="${Math.abs(lx-cx)<8?"middle":lx>cx?"start":"end"}" font-size="11.5" fill="var(--ink2)" dominant-baseline="middle">${esc(a)} <tspan font-weight="700" fill="var(--ink)">${d.now[i]}</tspan></text>`});
  g+=`<polygon points="${d.then.map((v,i)=>P(v,i).join(",")).join(" ")}" fill="var(--away)" fill-opacity=".18" stroke="var(--away2)" stroke-width="2" stroke-linejoin="round"/>`;
  g+=`<polygon points="${d.now.map((v,i)=>P(v,i).join(",")).join(" ")}" fill="${C(0)}" fill-opacity=".12" stroke="${C(0)}" stroke-width="2" stroke-linejoin="round"/>`;
  d.now.forEach((v,i)=>{const [x,y]=P(v,i);g+=dot(x,y,3.5,C(0))+`<circle cx="${x}" cy="${y}" r="12" fill="transparent" class="mk" data-tip="${esc(`<div class="th">${esc(d.axes[i])}</div>`+tipRow("Now",v,C(0))+tipRow(d.thenLabel,d.then[i],"var(--away2)"))}"/>`});
  return `<div style="display:flex;justify-content:center">${`<svg class="viz" viewBox="-60 0 420 300" style="max-width:460px" role="img" aria-label="${esc(d.label)}">${g}</svg>`}</div>`+legend([["Now",C(0)],[d.thenLabel,"var(--away2)"]]);
}
/* ---- slope: then vs now scores ---- */
function dodge(ideal,gap=16){ // ideal: [{i,y}] -> positions without overlap, clusters centered
  let items=ideal.slice().sort((a,b)=>a.y-b.y).map(o=>({...o,p:o.y}));
  for(let it=0;it<20;it++){let moved=false;let k=0;while(k<items.length){let j=k;while(j+1<items.length&&items[j+1].p-items[j].p<gap-0.01)j++;
    if(j>k){const mean=avg(items.slice(k,j+1).map(o=>o.y));const start=mean-(j-k)*gap/2;for(let q=k;q<=j;q++){const np=start+(q-k)*gap;if(Math.abs(items[q].p-np)>0.01)moved=true;items[q].p=np}}k=j+1}
    for(let q=1;q<items.length;q++)if(items[q].p-items[q-1].p<gap-0.01){items[q].p=items[q-1].p+gap;moved=true}if(!moved)break}
  const out={};items.forEach(o=>out[o.i]=o.p);return out}
function vizSlope(d){
  const lo=Math.max(0,Math.floor((Math.min(...d.then)-8)/10)*10);
  const W=640,H=320,P={l:130,r:170,t:30,b:20},Y=v=>P.t+(100-v)/(100-lo)*(H-P.t-P.b);const xa=P.l,xb=W-P.r;
  let g=txt(xa,14,d.thenLabel,{anchor:"middle",fill:INK2,weight:600})+txt(xb,14,"Now",{anchor:"middle",fill:INK2,weight:600});
  g+=`<line x1="${xa}" x2="${xa}" y1="${P.t}" y2="${H-P.b}" stroke="${GRID}"/><line x1="${xb}" x2="${xb}" y1="${P.t}" y2="${H-P.b}" stroke="${GRID}"/>`;
  const gain=d.axes.map((a,i)=>d.now[i]-d.then[i]);const top=gain.indexOf(Math.max(...gain));
  const yN=dodge(d.axes.map((a,i)=>({i,y:Y(d.now[i])}))),yT=dodge(d.axes.map((a,i)=>({i,y:Y(d.then[i])})));
  d.axes.forEach((a,i)=>{const hl=i===top;const col=hl?C(0):"var(--t3)";
    g+=`<line x1="${xa}" y1="${Y(d.then[i])}" x2="${xb}" y2="${Y(d.now[i])}" stroke="${col}" stroke-width="${hl?2.75:2}"/>`;
    g+=`<path d="M${xb+6},${Y(d.now[i])}L${xb+12},${yN[i]}" stroke="var(--grid)" fill="none"/><path d="M${xa-6},${Y(d.then[i])}L${xa-12},${yT[i]}" stroke="var(--grid)" fill="none"/>`});
  d.axes.forEach((a,i)=>{const hl=i===top;const col=hl?C(0):"var(--t4)";g+=dot(xa,Y(d.then[i]),3.5,col)+dot(xb,Y(d.now[i]),4,col);
    g+=txt(xb+16,yN[i]+4,a,{fill:hl?INK:INK2,size:12,weight:hl?700:400})+txt(xb+112,yN[i]+4,d.now[i]+"  +"+gain[i],{fill:INK,size:12,weight:hl?700:500});
    g+=txt(xa-16,yT[i]+4,a+"  "+d.then[i],{anchor:"end",fill:INK2,size:12});
    g+=`<line x1="${xa}" y1="${Y(d.then[i])}" x2="${xb}" y2="${Y(d.now[i])}" stroke="transparent" stroke-width="14" class="mk" data-tip="${esc(`<div class="th">${esc(a)}</div>`+tipRow("Now",d.now[i],col)+tipRow(d.thenLabel,d.then[i],"")+tipRow("Gain","+"+gain[i],""))}"/>`});
  return svgWrap(W,H,g,d.label);
}
/* ---- progress ring ---- */
function ring(goal){const R=40,c=2*Math.PI*R,p=goal.progress;return `<svg viewBox="0 0 100 100" class="ring" aria-hidden="true"><circle cx="50" cy="50" r="${R}" fill="none" stroke="var(--t1b)" stroke-width="9"/><circle cx="50" cy="50" r="${R}" fill="none" stroke="${C(0)}" stroke-width="9" stroke-linecap="round" stroke-dasharray="${c*p} ${c}" transform="rotate(-90 50 50)"/><text x="50" y="55" text-anchor="middle" font-size="19" font-weight="700" fill="var(--ink)">${Math.round(p*100)}%</text></svg>`}
/* ---- 12 week calendar heat map ---- */
function vizCalendar(d){
  const cell=18,gap=4,cols=12,P={l:30,t:22};const W=P.l+cols*(cell+gap)+4,H=P.t+7*(cell+gap)+4;const fills=["var(--sunk)","var(--t2)","var(--t3)","var(--t4)",C(0)];const names=["Rest","Light day","Active day","Session","Session, 8k+ steps"];
  let g="";["S","M","T","W","T","F","S"].forEach((l,k)=>{if(k%2===1)g+=txt(P.l-8,P.t+k*(cell+gap)+cell-4,l,{anchor:"end",size:10})});
  const first=d.dows[0];let col=0,lastMon=-1;
  d.levels.forEach((lv,i)=>{const dow=d.dows[i];if(i>0&&dow===0)col++;const x=P.l+col*(cell+gap),y=P.t+dow*(cell+gap);
    const mon=d.days[i].split(" ")[0];if(mon!==lastMon&&dow<=1){g+=txt(x,12,mon,{size:10.5});lastMon=mon}
    g+=`<rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="4" fill="${fills[lv]}" class="mk" data-tip="${esc(`<div class="th">${esc(d.days[i])}</div>`+tipRow(names[lv],"",fills[lv]))}"/>`});
  const Wt=P.l+(col+1)*(cell+gap)+4;
  const active=d.levels.filter(l=>l>0).length,sess=d.levels.filter(l=>l>=3).length;let best=0,run=0;d.levels.forEach(l=>{run=l>0?run+1:0;best=Math.max(best,run)});
  return `<div class="cal-wrap"><div class="cal">${svgWrap(Wt,H,g,d.label)}<div class="cal-key"><span>Less</span>${fills.map(f=>`<i style="background:${f}"></i>`).join("")}<span>More</span></div></div><div class="cal-stats"><div><b>${active}</b><span>active days of ${d.levels.length}</span></div><div><b>${sess}</b><span>training sessions</span></div><div><b>${best} days</b><span>longest active streak</span></div></div></div>`;
}
/* ---- 30 day habit grid ---- */
function vizHabits(d){let h=`<span></span>`+d.days.map((x,i)=>`<span class="dl">${i%7===0||i===29?esc(x.split(" ")[1]):""}</span>`).join("");
  d.rows.forEach(r=>{h+=`<span class="rl">${esc(r.label)}</span>`+r.cells.map((v,i)=>`<span class="hd ${v===null?"dn":v?"d1":"d0"}" data-tip="${esc(`<div class="th">${esc(d.days[i])}</div>`+tipRow(r.label,v===null?"Rest day":v?"Done":"Missed",""))}"></span>`).join("")});
  return `<div class="grid30">${h}</div>`+`<div class="legend"><span><i class="dot" style="background:${C(0)}"></i>Done</span><span><i class="dot" style="background:#fff;border:1.5px solid var(--t3)"></i>Missed</span><span><i class="dot" style="background:var(--sunk)"></i>Rest day</span></div>`}

/* =====================================================================
   MILTON ILLUSTRATION LIBRARY. 120x120 artboards, flat layered style.
   Colors are CSS variables so every illustration takes the gym's brand:
   --m main, --md deep, --ml light, --mxl wash, --a accent, --ad accent deep,
   --al accent light, --ink, --g / --gd neutrals, --paper.
   ===================================================================== */
const I_M="var(--m)",I_MD="var(--md)",I_ML="var(--ml)",I_MXL="var(--mxl)",I_A="var(--a)",I_AD="var(--ad)",I_AL="var(--al)",I_W="#fff",I_G="var(--g)",I_GD="var(--gd)",I_INK="var(--iink)",I_P="var(--paper)",I_PD="var(--paperd)";
const shadow=(rx=32,cy=104)=>`<ellipse cx="60" cy="${cy}" rx="${rx}" ry="4.5" fill="${I_INK}" opacity=".09"/>`;
const shine=(x,y,w,h,r)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r??w/2}" fill="#fff" opacity=".38"/>`;
const star4=(x,y,s,f)=>`<path d="M${x} ${y-s}Q${x+s*.18} ${y-s*.18} ${x+s} ${y}Q${x+s*.18} ${y+s*.18} ${x} ${y+s}Q${x-s*.18} ${y+s*.18} ${x-s} ${y}Q${x-s*.18} ${y-s*.18} ${x} ${y-s}Z" fill="${f}"/>`;
const check=(x,y,s,c="#fff",w=3)=>`<path d="M${x-s} ${y}l${s*.7} ${s*.7} ${s*1.3} -${s*1.4}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
function wedge(cx,cy,r,a0,a1,f){const p=a=>[cx+r*Math.cos(a),cy+r*Math.sin(a)];const [x0,y0]=p(a0),[x1,y1]=p(a1);return `<path d="M${cx} ${cy}L${x0.toFixed(1)} ${y0.toFixed(1)}A${r} ${r} 0 ${a1-a0>Math.PI?1:0} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}Z" fill="${f}"/>`}

const ILLOS=[
/* ---------------- Training ---------------- */
["barbell","Barbell","Training",()=>shadow(46)+`
<rect x="10" y="57" width="100" height="6" rx="3" fill="${I_GD}"/>
<rect x="22" y="34" width="12" height="52" rx="5" fill="${I_M}"/><rect x="34" y="40" width="9" height="40" rx="4" fill="${I_MD}"/>
<rect x="86" y="34" width="12" height="52" rx="5" fill="${I_M}"/><rect x="77" y="40" width="9" height="40" rx="4" fill="${I_MD}"/>
<rect x="43" y="54" width="5" height="12" rx="2" fill="${I_A}"/><rect x="72" y="54" width="5" height="12" rx="2" fill="${I_A}"/>
${shine(25,38,3,22)}${shine(89,38,3,22)}`],
["dumbbell","Dumbbell","Training",()=>shadow(38)+`<g transform="rotate(-24 60 62)">
<rect x="38" y="57" width="44" height="10" rx="5" fill="${I_GD}"/>
<rect x="44" y="57" width="2" height="10" fill="#fff" opacity=".35"/><rect x="50" y="57" width="2" height="10" fill="#fff" opacity=".35"/><rect x="68" y="57" width="2" height="10" fill="#fff" opacity=".35"/><rect x="74" y="57" width="2" height="10" fill="#fff" opacity=".35"/>
<rect x="18" y="42" width="22" height="40" rx="8" fill="${I_M}"/><rect x="18" y="62" width="22" height="20" rx="8" fill="${I_MD}" opacity=".45"/>
<rect x="80" y="42" width="22" height="40" rx="8" fill="${I_M}"/><rect x="80" y="62" width="22" height="20" rx="8" fill="${I_MD}" opacity=".45"/>
<rect x="38" y="52" width="5" height="20" rx="2.5" fill="${I_A}"/><rect x="77" y="52" width="5" height="20" rx="2.5" fill="${I_A}"/>
${shine(22,46,3.5,16)}${shine(84,46,3.5,16)}</g>`],
["kettlebell","Kettlebell","Training",()=>shadow(30)+`
<path d="M42 56V44a18 18 0 0 1 36 0v12" fill="none" stroke="${I_MD}" stroke-width="10" stroke-linecap="round"/>
<path d="M42 56V44a18 18 0 0 1 36 0v12" fill="none" stroke="${I_M}" stroke-width="6" stroke-linecap="round"/>
<circle cx="60" cy="74" r="28" fill="${I_M}"/><path d="M60 46a28 28 0 0 1 0 56a28 28 0 0 0 0-56z" fill="${I_MD}" opacity=".35"/>
<rect x="40" y="96" width="40" height="7" rx="3.5" fill="${I_MD}"/>
<rect x="50" y="70" width="20" height="12" rx="4" fill="${I_A}"/><rect x="54" y="74.5" width="12" height="3" rx="1.5" fill="#fff" opacity=".8"/>
${shine(44,60,5,14)}`],
["weight-plate","Weight plate","Training",()=>shadow(34)+`
<circle cx="60" cy="60" r="40" fill="${I_M}"/><circle cx="60" cy="60" r="32" fill="${I_MD}"/><circle cx="60" cy="60" r="24" fill="${I_M}"/>
<circle cx="60" cy="60" r="8" fill="${I_MXL}"/><circle cx="60" cy="60" r="8" fill="none" stroke="${I_A}" stroke-width="3"/>
<rect x="49" y="26" width="22" height="8" rx="4" fill="${I_MXL}"/><rect x="49" y="86" width="22" height="8" rx="4" fill="${I_MXL}"/>
<path d="M30 44a34 34 0 0 1 22 -18" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity=".4"/>`],
["pull-up","Pull-up bar","Training",()=>shadow(34)+`
<rect x="14" y="20" width="10" height="22" rx="4" fill="${I_MD}"/><rect x="96" y="20" width="10" height="22" rx="4" fill="${I_MD}"/>
<rect x="12" y="27" width="96" height="7" rx="3.5" fill="${I_GD}"/>
<rect x="30" y="25" width="14" height="11" rx="4" fill="${I_M}"/><rect x="76" y="25" width="14" height="11" rx="4" fill="${I_M}"/>
<path d="M50 34C44 66 48 96 60 96S76 66 70 34" fill="none" stroke="${I_A}" stroke-width="7" stroke-linecap="round"/>
<path d="M50 34C44 66 48 96 60 96S76 66 70 34" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".35" transform="translate(-1.5 0)"/>
${star4(92,62,6,I_ML)}${star4(26,72,4,I_ML)}`],
["jump-rope","Jump rope","Training",()=>shadow(36)+`
<path d="M38 46C22 100 98 100 82 46" fill="none" stroke="${I_A}" stroke-width="4.5" stroke-linecap="round"/>
<g transform="rotate(-18 34 32)"><rect x="28" y="12" width="12" height="32" rx="6" fill="${I_M}"/><rect x="30" y="40" width="8" height="7" rx="2" fill="${I_MD}"/>${shine(31,16,2.5,14)}</g>
<g transform="rotate(18 86 32)"><rect x="80" y="12" width="12" height="32" rx="6" fill="${I_M}"/><rect x="82" y="40" width="8" height="7" rx="2" fill="${I_MD}"/>${shine(83,16,2.5,14)}</g>`],
["sneaker","Running shoe","Training",()=>shadow(42,100)+`
<path d="M18 80h80a7 7 0 0 1 0 14H25a7 7 0 0 1-7-7z" fill="#fff"/><rect x="20" y="86" width="84" height="2.5" rx="1.25" fill="${I_G}"/>
<path d="M20 81C19 64 26 54 38 51l18-4c4 10 14 15 28 17c11 2 17 8 16 16z" fill="${I_M}"/>
<path d="M56 47c4 10 14 15 28 17c11 2 17 8 16 16H60z" fill="${I_MD}" opacity=".3"/>
<path d="M38 51c1-9 9-14 18-4" fill="${I_MD}"/>
<path d="M20 70c-1-9 3-15 8-18l5 3c-5 4-7 9-6 15z" fill="${I_A}"/>
<path d="M50 58l7-4M56 63l7-4M62 67l7-4" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
<rect x="72" y="72" width="18" height="3.5" rx="1.75" fill="#fff" opacity=".45"/>`],
["yoga-mat","Mat","Training",()=>shadow(42)+`
<rect x="24" y="44" width="64" height="38" rx="4" fill="${I_M}"/>
<rect x="24" y="44" width="64" height="12" fill="#fff" opacity=".18"/>
<ellipse cx="88" cy="63" rx="11" ry="19" fill="${I_MD}"/><ellipse cx="88" cy="63" rx="7" ry="13" fill="${I_ML}"/><ellipse cx="88" cy="63" rx="3.5" ry="7" fill="${I_MD}"/>
<ellipse cx="24" cy="63" rx="11" ry="19" fill="${I_M}"/>
<rect x="42" y="43" width="6" height="40" rx="2" fill="${I_A}"/><rect x="64" y="43" width="6" height="40" rx="2" fill="${I_A}"/>`],
/* ---------------- Nutrition ---------------- */
["shaker","Protein shake","Nutrition",()=>shadow(26)+`
<path d="M40 44h40l-4.5 53a7 7 0 0 1-7 6.4H51.5a7 7 0 0 1-7-6.4z" fill="${I_M}"/>
<path d="M60 44h20l-4.5 53a7 7 0 0 1-7 6.4H60z" fill="${I_MD}" opacity=".3"/>
<rect x="49" y="58" width="22" height="34" rx="5" fill="${I_ML}" opacity=".55"/>
<path d="M53 66h6M53 74h9M53 82h6" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>
<rect x="37" y="34" width="46" height="13" rx="5" fill="${I_MD}"/>
<rect x="52" y="22" width="16" height="14" rx="4" fill="${I_A}"/><rect x="56" y="18" width="8" height="6" rx="2" fill="${I_AD}"/>
${shine(43,50,3.5,24)}`],
["plate","Balanced plate","Nutrition",()=>shadow(38)+`
<circle cx="64" cy="60" r="40" fill="#fff"/><circle cx="64" cy="60" r="33" fill="${I_G}" opacity=".35"/>
${wedge(64,60,28,-Math.PI/2,Math.PI/2,I_ML)}${wedge(64,60,28,Math.PI/2,Math.PI,I_A)}${wedge(64,60,28,Math.PI,Math.PI*1.5,I_AL)}
<path d="M64 32v56M36 60h28" stroke="#fff" stroke-width="3"/>
<circle cx="76" cy="50" r="5" fill="${I_M}"/><circle cx="84" cy="62" r="4" fill="${I_M}"/><circle cx="74" cy="72" r="4.5" fill="${I_M}"/>
<circle cx="47" cy="50" r="1.6" fill="#fff"/><circle cx="53" cy="44" r="1.6" fill="#fff"/><circle cx="44" cy="44" r="1.6" fill="#fff"/>
<rect x="12" y="34" width="5" height="54" rx="2.5" fill="${I_GD}"/><path d="M9 22v16a5.5 5.5 0 0 0 11 0V22" fill="none" stroke="${I_GD}" stroke-width="3" stroke-linecap="round"/><path d="M14.5 22v14" stroke="${I_GD}" stroke-width="3" stroke-linecap="round"/>`],
["water","Hydration","Nutrition",()=>shadow(26)+`
<path d="M36 28h48l-6.2 69a7 7 0 0 1-7 6.4H49.2a7 7 0 0 1-7-6.4z" fill="#fff"/>
<path d="M38.2 52Q49 46 60 52T81.8 52L77.8 97a7 7 0 0 1-7 6.4H49.2a7 7 0 0 1-7-6.4z" fill="var(--h2o)"/>
<path d="M60 52Q71 58 81.8 52L77.8 97a7 7 0 0 1-7 6.4H60z" fill="var(--h2od)" opacity=".3"/>
<rect x="46" y="58" width="13" height="13" rx="3" fill="#fff" opacity=".55" transform="rotate(-14 52 64)"/>
<circle cx="66" cy="80" r="2.5" fill="#fff" opacity=".6"/><circle cx="56" cy="88" r="1.8" fill="#fff" opacity=".6"/>
<path d="M36 28h48" stroke="var(--h2ol)" stroke-width="3" stroke-linecap="round"/>
<path d="M95 16c6 8 9 12 9 16.5a9 9 0 0 1-18 0C86 28 89 24 95 16z" fill="var(--h2o)"/>${shine(91,28,2.5,6)}`],
["apple","Fruit","Nutrition",()=>shadow(30)+`
<path d="M60 44C46 34 24 40 24 64c0 22 16 39 29 37 3-.5 4.5-2 7-2s4 1.5 7 2c13 2 29-15 29-37 0-24-22-30-36-20z" fill="${I_A}"/>
<path d="M60 44c14-10 36-4 36 20 0 22-16 39-29 37-3-.5-4.5-2-7-2z" fill="${I_AD}" opacity=".35"/>
<path d="M60 46c0-8 1-13 4-18" stroke="${I_GD}" stroke-width="4" stroke-linecap="round" fill="none"/>
<path d="M63 38c0-12 10-18 22-18 0 11-9 18-22 18z" fill="${I_M}"/><path d="M63 38c5-6 11-10 18-14" stroke="#fff" stroke-width="1.6" opacity=".5" fill="none"/>
${shine(34,56,6,16)}`],
["broccoli","Vegetables","Nutrition",()=>shadow(28)+`
<path d="M51 66h18l5 33a3 3 0 0 1-3 3H49a3 3 0 0 1-3-3z" fill="${I_ML}"/><path d="M60 66h9l5 33a3 3 0 0 1-3 3H60z" fill="${I_M}" opacity=".25"/>
<circle cx="42" cy="58" r="15" fill="${I_M}"/><circle cx="78" cy="58" r="15" fill="${I_M}"/><circle cx="60" cy="44" r="18" fill="${I_M}"/>
<circle cx="52" cy="66" r="12" fill="${I_MD}"/><circle cx="69" cy="66" r="12" fill="${I_MD}"/>
<circle cx="54" cy="38" r="4" fill="#fff" opacity=".3"/><circle cx="38" cy="54" r="3" fill="#fff" opacity=".3"/><circle cx="66" cy="34" r="2.5" fill="#fff" opacity=".3"/><circle cx="80" cy="52" r="2.5" fill="#fff" opacity=".3"/>`],
["eggs","Eggs","Nutrition",()=>shadow(34)+`
<path d="M28 64c-4-18 14-30 28-24 12-10 36-2 34 18 8 14-6 36-26 32-16 10-40-2-36-26z" fill="#fff"/>
<path d="M88 58c8 14-6 36-26 32-16 10-40-2-36-26" fill="none" stroke="${I_G}" stroke-width="3"/>
<circle cx="61" cy="61" r="15" fill="${I_A}"/><circle cx="61" cy="61" r="15" fill="none" stroke="${I_AD}" stroke-width="2.5" opacity=".35"/>
<ellipse cx="56" cy="56" rx="5" ry="3.5" fill="#fff" opacity=".6" transform="rotate(-30 56 56)"/>
<circle cx="92" cy="30" r="2" fill="${I_GD}"/><circle cx="98" cy="36" r="1.6" fill="${I_GD}"/><circle cx="90" cy="38" r="1.4" fill="${I_GD}"/>`],
["meal-prep","Meal prep","Nutrition",()=>shadow(42)+`
<rect x="22" y="22" width="76" height="16" rx="6" fill="${I_M}" transform="rotate(-8 60 30)"/>
<rect x="16" y="48" width="88" height="50" rx="11" fill="#fff"/>
<rect x="22" y="54" width="42" height="38" rx="7" fill="${I_ML}"/><circle cx="34" cy="66" r="6" fill="${I_M}"/><circle cx="48" cy="72" r="7" fill="${I_M}"/><circle cx="36" cy="82" r="5" fill="${I_MD}"/>
<rect x="68" y="54" width="30" height="17" rx="6" fill="${I_A}"/><path d="M73 62.5h20" stroke="#fff" stroke-width="2" opacity=".5" stroke-dasharray="4 3"/>
<rect x="68" y="75" width="30" height="17" rx="6" fill="${I_AL}"/><circle cx="75" cy="81" r="1.5" fill="#fff"/><circle cx="82" cy="85" r="1.5" fill="#fff"/><circle cx="90" cy="80" r="1.5" fill="#fff"/><circle cx="88" cy="87" r="1.5" fill="#fff"/>`],
["groceries","Groceries","Nutrition",()=>shadow(32)+`
<path d="M44 46c-4-14 0-24 8-26 6 6 6 16 2 26z" fill="${I_M}"/><path d="M56 46c0-16 8-24 18-24 0 12-6 20-14 24z" fill="${I_ML}"/>
<rect x="70" y="20" width="12" height="30" rx="4" fill="${I_A}"/><rect x="72" y="14" width="8" height="8" rx="2" fill="${I_AD}"/>
<path d="M30 44h60l-5 56a4 4 0 0 1-4 3.6H39a4 4 0 0 1-4-3.6z" fill="${I_P}"/>
<path d="M60 44h30l-5 56a4 4 0 0 1-4 3.6H60z" fill="${I_PD}" opacity=".45"/>
<rect x="28" y="42" width="64" height="9" rx="3" fill="${I_PD}"/>
<rect x="47" y="64" width="26" height="20" rx="5" fill="#fff" opacity=".7"/><path d="M53 74l5 5 8-9" fill="none" stroke="${I_M}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`],
/* ---------------- Recovery ---------------- */
["sleep","Sleep","Recovery",()=>shadow(30)+`
<path d="M70 20a36 36 0 1 0 28 58A30 30 0 1 1 70 20z" fill="${I_M}"/>
<path d="M98 78a36 36 0 0 1-62 -6 30 30 0 0 0 62 6z" fill="${I_MD}" opacity=".35"/>
${star4(34,30,7,I_A)}${star4(24,54,4,I_AL)}${star4(88,38,4.5,I_AL)}
<path d="M70 92h18a9 9 0 0 0 0-18 12 12 0 0 0-22-2 8 8 0 0 0 4 20z" fill="#fff"/>`],
["pillow","Rest","Recovery",()=>shadow(40)+`
<path d="M22 46q-4-6 4-9 34-9 68 0 8 3 4 9 4 20 0 40 4 6-4 9-34 9-68 0-8-3-4-9-4-20 0-40z" fill="${I_ML}"/>
<path d="M60 39q17 0 34-2 8 3 4 9 4 20 0 40 4 6-4 9-17 4-34 4z" fill="${I_M}" opacity=".22"/>
<path d="M29 48q31-7 62 0M29 82q31 7 62 0" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-dasharray="4 4" opacity=".8"/>
<ellipse cx="44" cy="56" rx="10" ry="5" fill="#fff" opacity=".35" transform="rotate(-10 44 56)"/>
<text x="76" y="30" font-family="DM Sans,system-ui" font-weight="700" font-size="17" fill="${I_M}">Z</text><text x="91" y="19" font-family="DM Sans,system-ui" font-weight="700" font-size="12" fill="${I_A}">z</text>`],
["foam-roller","Foam roller","Recovery",()=>shadow(42)+`
<rect x="22" y="46" width="72" height="36" rx="6" fill="${I_M}"/>
${[30,42,54,66,78].map(x=>`<rect x="${x}" y="50" width="7" height="8" rx="2.5" fill="${I_ML}"/><rect x="${x+4}" y="62" width="7" height="8" rx="2.5" fill="${I_MD}" opacity=".5"/><rect x="${x}" y="74" width="7" height="5" rx="2" fill="${I_ML}" opacity=".7"/>`).join("")}
<ellipse cx="22" cy="64" rx="9" ry="18" fill="${I_M}"/><ellipse cx="94" cy="64" rx="9" ry="18" fill="${I_MD}"/><ellipse cx="94" cy="64" rx="4" ry="8" fill="${I_MXL}"/>
<path d="M30 46h56" stroke="#fff" stroke-width="2.5" opacity=".35" stroke-linecap="round"/>`],
["cold-plunge","Cold plunge","Recovery",()=>shadow(38)+`
<path d="M18 92q10-6 21 0t21 0 21 0 21 0" fill="none" stroke="${I_ML}" stroke-width="4" stroke-linecap="round"/>
<rect x="24" y="44" width="38" height="38" rx="9" fill="${I_ML}" transform="rotate(-12 43 63)"/><rect x="29" y="49" width="12" height="5" rx="2.5" fill="#fff" opacity=".7" transform="rotate(-12 43 63)"/>
<rect x="56" y="52" width="34" height="34" rx="9" fill="#fff" transform="rotate(10 73 69)"/><rect x="61" y="57" width="10" height="4.5" rx="2.25" fill="${I_ML}" transform="rotate(10 73 69)"/>
<g stroke="${I_M}" stroke-width="3" stroke-linecap="round"><path d="M88 18v26M75 31h26M79 22l18 18M97 22L79 40"/></g>`],
["sauna","Heat","Recovery",()=>shadow(22)+`
<path d="M30 72q-6-8 0-16t0-16M90 72q-6-8 0-16t0-16" fill="none" stroke="${I_AL}" stroke-width="4" stroke-linecap="round"/>
<rect x="51" y="16" width="18" height="66" rx="9" fill="#fff"/><circle cx="60" cy="86" r="15" fill="${I_A}"/>
<rect x="56.5" y="36" width="7" height="50" rx="3.5" fill="${I_A}"/><circle cx="60" cy="86" r="15" fill="none" stroke="${I_AD}" stroke-width="2" opacity=".3"/>
<path d="M69 28h5M69 38h5M69 48h5M69 58h5" stroke="${I_GD}" stroke-width="2" stroke-linecap="round"/>${shine(54,82,4,8)}`],
["breathwork","Breathwork","Recovery",()=>`
<path d="M18 46h52a11 11 0 1 0-11-11" fill="none" stroke="${I_M}" stroke-width="7" stroke-linecap="round"/>
<path d="M18 64h68a11 11 0 1 1-11 11" fill="none" stroke="${I_ML}" stroke-width="7" stroke-linecap="round"/>
<path d="M30 84h30a9 9 0 1 1-9 9" fill="none" stroke="${I_A}" stroke-width="6" stroke-linecap="round"/>
${star4(96,32,5,I_AL)}`],
["massage-gun","Massage gun","Recovery",()=>shadow(26)+`
<rect x="56" y="54" width="18" height="46" rx="7" fill="${I_MD}"/><rect x="61" y="78" width="8" height="3" rx="1.5" fill="${I_A}"/><rect x="61" y="84" width="8" height="3" rx="1.5" fill="${I_A}"/><rect x="61" y="90" width="8" height="3" rx="1.5" fill="#fff" opacity=".4"/>
<rect x="34" y="32" width="64" height="28" rx="14" fill="${I_M}"/><path d="M76 40v12M82 40v12M88 40v12" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".5"/>
<rect x="22" y="40" width="14" height="12" rx="3" fill="${I_GD}"/><circle cx="18" cy="46" r="9" fill="${I_A}"/>${shine(15,40,3,6)}
<path d="M10 30q-4 16 0 32M4 26q-6 20 0 40" fill="none" stroke="${I_AL}" stroke-width="2.5" stroke-linecap="round" opacity=".8"/>`],
["tea","Rest day","Recovery",()=>shadow(36,100)+`
<ellipse cx="58" cy="94" rx="36" ry="7" fill="${I_ML}"/>
<path d="M78 56h5a10 10 0 0 1 0 20h-6" fill="none" stroke="#fff" stroke-width="6"/>
<path d="M32 50h48v16a24 24 0 0 1-48 0z" fill="#fff"/><ellipse cx="56" cy="50" rx="24" ry="5" fill="${I_AL}"/>
<path d="M62 50v18" stroke="${I_GD}" stroke-width="1.5"/><rect x="57" y="68" width="10" height="11" rx="2" fill="${I_A}"/>
<path d="M46 40q-5-7 0-13t0-13M58 40q-5-7 0-13t0-13M70 40q-5-7 0-13" fill="none" stroke="${I_M}" stroke-width="3" stroke-linecap="round" opacity=".55"/>`],
/* ---------------- Body ---------------- */
["heart","Heart health","Body",()=>shadow(32)+`
<path d="M60 98C32 80 16 64 16 46c0-14 11-23 23-23 10 0 17 6 21 13 4-7 11-13 21-13 12 0 23 9 23 23 0 18-16 34-44 52z" fill="${I_A}"/>
<path d="M60 98c28-18 44-34 44-52 0-14-11-23-23-23-3 0-6 .6-8.5 1.6C86 30 90 56 60 98z" fill="${I_AD}" opacity=".3"/>
<path d="M28 58h14l5-10 7 20 6-14 4 4h28" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
<ellipse cx="34" cy="38" rx="6" ry="4" fill="#fff" opacity=".4" transform="rotate(-35 34 38)"/>`],
["heart-rate","Heart rate","Body",()=>shadow(40)+`
<rect x="14" y="28" width="92" height="64" rx="14" fill="#fff"/>
<path d="M20 70h20l6-14 8 26 8-38 7 30 5-4h26" fill="none" stroke="${I_M}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M30 40c-3-3-8-1-8 3 0 3 3 6 8 9 5-3 8-6 8-9 0-4-5-6-8-3z" fill="${I_A}"/>
<rect x="44" y="38" width="22" height="5" rx="2.5" fill="${I_G}"/><rect x="80" y="38" width="16" height="9" rx="4.5" fill="${I_ML}"/>`],
["lungs","Lungs","Body",()=>shadow(32)+`
<path d="M54 42C40 38 24 56 22 78c-2 16 10 22 20 18 8-4 12-12 12-22z" fill="${I_M}"/>
<path d="M66 42c14-4 30 14 32 36 2 16-10 22-20 18-8-4-12-12-12-22z" fill="${I_M}"/>
<path d="M66 42c14-4 30 14 32 36 2 16-10 22-20 18 10-4 14-30-12-54z" fill="${I_MD}" opacity=".35"/>
<path d="M60 18v34M60 50l-10 9M60 50l10 9" fill="none" stroke="${I_ML}" stroke-width="6" stroke-linecap="round"/>
<circle cx="36" cy="70" r="3" fill="#fff" opacity=".5"/><circle cx="44" cy="80" r="2" fill="#fff" opacity=".5"/><circle cx="82" cy="68" r="2.5" fill="#fff" opacity=".5"/>
${star4(98,28,5,I_A)}`],
["brain","Mind","Body",()=>shadow(32)+`
<rect x="54" y="84" width="12" height="16" rx="5" fill="${I_MD}"/>
${[[42,48,16],[58,38,17],[76,46,16],[86,62,13],[72,74,15],[50,76,15],[36,64,14],[60,58,16]].map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${I_M}"/>`).join("")}
<path d="M60 24v64" stroke="${I_MXL}" stroke-width="3"/>
<path d="M40 50q6-6 12 0M66 44q6-6 12 0M72 66q6 6 12 0M40 70q6 6 12 0" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".5"/>
${star4(100,24,6,I_A)}${star4(18,34,4,I_AL)}`],
["bone","Bones and joints","Body",()=>shadow(30)+`<g transform="rotate(-35 60 60)"><g transform="translate(0 3)" fill="${I_ML}"><rect x="34" y="52" width="52" height="16" rx="6"/><circle cx="32" cy="50" r="11"/><circle cx="32" cy="70" r="11"/><circle cx="88" cy="50" r="11"/><circle cx="88" cy="70" r="11"/></g>
<g fill="#fff"><rect x="34" y="52" width="52" height="16" rx="6"/><circle cx="32" cy="50" r="11"/><circle cx="32" cy="70" r="11"/><circle cx="88" cy="50" r="11"/><circle cx="88" cy="70" r="11"/></g>
<path d="M40 57h40" stroke="${I_G}" stroke-width="3" stroke-linecap="round"/></g>
<circle cx="90" cy="88" r="11" fill="${I_A}"/><path d="M90 82.5v11M84.5 88h11" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`],
["tape","Body measurements","Body",()=>shadow(40)+`
<path d="M48 76h56a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H48z" fill="${I_AL}"/>
${[56,62,68,74,80,86,92,98].map((x,i)=>`<path d="M${x} 76v${i%2?5:8}" stroke="${I_INK}" stroke-width="1.6" opacity=".45"/>`).join("")}
<rect x="104" y="72" width="5" height="26" rx="2" fill="${I_MD}"/>
<circle cx="46" cy="60" r="30" fill="${I_A}"/><circle cx="46" cy="60" r="30" fill="none" stroke="${I_AD}" stroke-width="3" opacity=".3"/>
<circle cx="46" cy="60" r="14" fill="${I_AD}" opacity=".35"/><circle cx="46" cy="60" r="7" fill="#fff"/>
<path d="M24 46a26 26 0 0 1 14-14" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".45"/>`],
["scale","Weigh-in","Body",()=>shadow(42)+`
<rect x="20" y="30" width="80" height="68" rx="20" fill="#fff"/><rect x="20" y="30" width="80" height="68" rx="20" fill="none" stroke="${I_G}" stroke-width="2.5"/>
<rect x="42" y="42" width="36" height="16" rx="5" fill="${I_M}"/><path d="M48 50h6M57 50h4M64 50h8" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
<ellipse cx="44" cy="80" rx="9" ry="6" fill="${I_ML}" opacity=".6"/><ellipse cx="76" cy="80" rx="9" ry="6" fill="${I_ML}" opacity=".6"/>
<circle cx="86" cy="40" r="3" fill="${I_A}"/>`],
["blood","Blood work","Body",()=>shadow(26)+`
<path d="M60 16c16 22 26 36 26 50a26 26 0 0 1-52 0c0-14 10-28 26-50z" fill="${I_A}"/>
<path d="M60 16c16 22 26 36 26 50a26 26 0 0 1-26 26c22-10 20-40 0-76z" fill="${I_AD}" opacity=".3"/>
<path d="M60 56v20M50 66h20" stroke="#fff" stroke-width="5" stroke-linecap="round"/>${shine(42,52,5,14)}
<rect x="88" y="62" width="12" height="34" rx="6" fill="#fff"/><rect x="88" y="80" width="12" height="16" rx="6" fill="${I_M}"/>`],
/* ---------------- Tracking ---------------- */
["steps","Steps","Tracking",()=>`
<path d="M30 102c10-10 22-14 34-16s26-8 32-20" fill="none" stroke="${I_ML}" stroke-width="3" stroke-dasharray="1 7" stroke-linecap="round"/>
<g transform="rotate(-18 40 64)"><ellipse cx="40" cy="70" rx="11" ry="17" fill="${I_M}"/><ellipse cx="40" cy="94" rx="8" ry="6" fill="${I_M}"/></g>
<g transform="rotate(14 78 40)"><ellipse cx="78" cy="38" rx="11" ry="17" fill="${I_A}"/><ellipse cx="78" cy="62" rx="8" ry="6" fill="${I_A}"/></g>
${shine(33,58,3.5,10)}`],
["watch","Wearable","Tracking",()=>shadow(22)+`
<rect x="44" y="12" width="32" height="30" rx="6" fill="${I_MD}"/><rect x="44" y="78" width="32" height="30" rx="6" fill="${I_MD}"/>
<rect x="34" y="34" width="52" height="52" rx="15" fill="${I_INK}"/><rect x="39" y="39" width="42" height="42" rx="11" fill="${I_M}"/>
<circle cx="60" cy="60" r="14" fill="none" stroke="${I_ML}" stroke-width="5" opacity=".5"/>
<circle cx="60" cy="60" r="14" fill="none" stroke="${I_A}" stroke-width="5" stroke-linecap="round" stroke-dasharray="62 100" transform="rotate(-90 60 60)"/>
<circle cx="60" cy="60" r="4" fill="#fff"/><rect x="86" y="52" width="5" height="14" rx="2.5" fill="${I_GD}"/>`],
["calendar","Streak","Tracking",()=>shadow(38)+`
<rect x="18" y="24" width="84" height="76" rx="12" fill="#fff"/><path d="M18 36a12 12 0 0 1 12-12h60a12 12 0 0 1 12 12v8H18z" fill="${I_M}"/>
<rect x="34" y="16" width="6" height="16" rx="3" fill="${I_MD}"/><rect x="80" y="16" width="6" height="16" rx="3" fill="${I_MD}"/>
${[0,1,2,3].flatMap(c=>[0,1,2].map(r=>{const x=27+c*18,y=52+r*15,on=r*4+c<9;return `<rect x="${x}" y="${y}" width="13" height="11" rx="3" fill="${on?I_M:I_G}" opacity="${on?1:.6}"/>`+(on?`<path d="M${x+3.5} ${y+5.5}l2.5 2.5 4-5" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`:"")})).join("")}
<path d="M88 88c-6 0-9-4-9-8 0-5 5-7 5-12 4 2 5 5 5 8 1-1 2-3 2-5 4 3 6 6 6 9 0 5-4 8-9 8z" fill="${I_A}"/>`],
["progress","Progress","Tracking",()=>shadow(40)+`
<rect x="16" y="22" width="88" height="78" rx="14" fill="#fff"/>
<rect x="28" y="70" width="12" height="20" rx="3" fill="${I_ML}"/><rect x="46" y="60" width="12" height="30" rx="3" fill="${I_ML}"/><rect x="64" y="52" width="12" height="38" rx="3" fill="${I_ML}"/><rect x="82" y="40" width="12" height="50" rx="3" fill="${I_M}"/>
<path d="M28 58l18-10 18 4 24-20" fill="none" stroke="${I_A}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M80 30h9v9" fill="none" stroke="${I_A}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`],
["target","Goals","Tracking",()=>shadow(34)+`
<circle cx="56" cy="64" r="38" fill="#fff"/><circle cx="56" cy="64" r="29" fill="${I_A}"/><circle cx="56" cy="64" r="20" fill="#fff"/><circle cx="56" cy="64" r="11" fill="${I_A}"/>
<path d="M56 64L94 26" stroke="${I_MD}" stroke-width="4" stroke-linecap="round"/><path d="M88 18l2 10 10 2-8 8-10-2-2-10z" fill="${I_M}"/>
<circle cx="56" cy="64" r="3.5" fill="${I_MD}"/>`],
["trophy","Personal record","Tracking",()=>shadow(26)+`
<path d="M38 26h44v22a22 22 0 0 1-44 0z" fill="${I_A}"/><path d="M60 26h22v22a22 22 0 0 1-22 22z" fill="${I_AD}" opacity=".3"/>
<path d="M38 32H28a10 10 0 0 0 12 16M82 32h10a10 10 0 0 1-12 16" fill="none" stroke="${I_A}" stroke-width="5" stroke-linecap="round"/>
<rect x="55" y="68" width="10" height="14" fill="${I_AD}"/><rect x="40" y="82" width="40" height="16" rx="4" fill="${I_M}"/><rect x="48" y="87" width="24" height="5" rx="2.5" fill="#fff" opacity=".5"/>
${star4(60,44,9,"#fff")}${star4(98,22,5,I_ML)}`],
["medal","Milestone","Tracking",()=>shadow(26)+`
<path d="M36 14h16l14 34H50z" fill="${I_M}"/><path d="M84 14H68L54 48h16z" fill="${I_MD}"/>
<circle cx="60" cy="72" r="27" fill="${I_A}"/><circle cx="60" cy="72" r="19" fill="${I_AL}"/><circle cx="60" cy="72" r="27" fill="none" stroke="${I_AD}" stroke-width="2.5" opacity=".3"/>
${star4(60,72,11,"#fff")}`],
["check-in","Check-in","Tracking",()=>shadow(26)+`
<rect x="36" y="14" width="48" height="90" rx="12" fill="${I_INK}"/><rect x="40" y="22" width="40" height="74" rx="7" fill="#fff"/>
<circle cx="60" cy="48" r="13" fill="${I_M}"/>${check(57,48,6,"#fff",3.5)}
<rect x="46" y="68" width="28" height="4" rx="2" fill="${I_G}"/><rect x="50" y="76" width="20" height="4" rx="2" fill="${I_G}"/>
<rect x="74" y="12" width="30" height="18" rx="9" fill="${I_A}"/><circle cx="83" cy="21" r="2" fill="#fff"/><circle cx="89" cy="21" r="2" fill="#fff"/><circle cx="95" cy="21" r="2" fill="#fff"/>`],
/* ---------------- Lifestyle ---------------- */
["sun","Outdoors","Lifestyle",()=>`
<g transform="translate(60 46)">${[...Array(8)].map((_,i)=>`<rect x="-3" y="-38" width="6" height="12" rx="3" fill="${I_AL}" transform="rotate(${i*45})"/>`).join("")}</g>
<circle cx="60" cy="46" r="20" fill="${I_A}"/>${shine(50,36,5,10)}
<path d="M8 104c12-22 32-30 52-20 14-14 36-16 52 4v16z" fill="${I_ML}"/><path d="M8 104c20-16 42-18 62-8 12-6 28-6 42 8z" fill="${I_M}"/>`],
["meditation","Meditation","Lifestyle",()=>shadow(40)+`
<path d="M60 96C46 82 44 62 60 40c16 22 14 42 0 56z" fill="${I_M}"/>
<path d="M60 96c-18-4-30-18-30-38 16 2 28 14 30 38zM60 96c18-4 30-18 30-38-16 2-28 14-30 38z" fill="${I_ML}"/>
<path d="M60 96c-24 2-40-8-46-22 18-4 34 4 46 22zM60 96c24 2 40-8 46-22-18-4-34 4-46 22z" fill="${I_AL}"/>
<path d="M60 96C52 86 52 70 60 56c8 14 8 30 0 40z" fill="#fff" opacity=".35"/>${star4(60,24,6,I_A)}`],
["energy","Energy","Lifestyle",()=>shadow(32)+`
<rect x="22" y="38" width="70" height="44" rx="10" fill="#fff"/><rect x="92" y="52" width="8" height="16" rx="3" fill="${I_GD}"/>
<rect x="28" y="44" width="40" height="32" rx="6" fill="${I_M}"/><rect x="28" y="44" width="40" height="10" rx="5" fill="#fff" opacity=".2"/>
<path d="M66 24L50 62h14l-6 34 22-44H66z" fill="${I_A}" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>`],
["community","Community","Lifestyle",()=>shadow(42)+`
<circle cx="32" cy="48" r="11" fill="${I_ML}"/><path d="M14 92a18 22 0 0 1 36 0z" fill="${I_ML}"/>
<circle cx="88" cy="48" r="11" fill="${I_AL}"/><path d="M70 92a18 22 0 0 1 36 0z" fill="${I_AL}"/>
<circle cx="60" cy="42" r="14" fill="${I_M}"/><path d="M36 98a24 28 0 0 1 48 0z" fill="${I_M}"/>
${shine(53,34,3.5,8)}`],
["whistle","Coaching","Lifestyle",()=>shadow(32)+`
<path d="M20 22c14 4 22 20 30 30" fill="none" stroke="${I_A}" stroke-width="4" stroke-linecap="round"/>
<circle cx="50" cy="56" r="6" fill="none" stroke="${I_GD}" stroke-width="4"/>
<path d="M56 50h40a6 6 0 0 1 6 6v6a6 6 0 0 1-6 6H86" fill="${I_MD}"/>
<circle cx="66" cy="72" r="22" fill="${I_M}"/><circle cx="66" cy="72" r="9" fill="${I_MD}"/>${shine(52,62,4,10)}
<path d="M98 34l6-6M104 44h8M92 26v-8" stroke="${I_AL}" stroke-width="3" stroke-linecap="round"/>`],
["journal","Journal","Lifestyle",()=>shadow(32)+`
<rect x="28" y="18" width="62" height="84" rx="8" fill="${I_M}"/><rect x="34" y="22" width="52" height="76" rx="5" fill="#fff"/>
${[30,42,54,66,78,90].map(y=>`<rect x="22" y="${y-3}" width="14" height="6" rx="3" fill="${I_GD}"/>`).join("")}
<path d="M44 40h32M44 50h26M44 60h30M44 70h18" stroke="${I_G}" stroke-width="3" stroke-linecap="round"/>
<g transform="rotate(35 86 78)"><rect x="80" y="44" width="11" height="48" rx="3" fill="${I_A}"/><path d="M80 92h11l-5.5 10z" fill="${I_P}"/><rect x="80" y="44" width="11" height="7" rx="2" fill="${I_AD}"/></g>`],
["checklist","Habits","Lifestyle",()=>shadow(32)+`
<rect x="26" y="20" width="68" height="84" rx="10" fill="#fff"/><rect x="44" y="14" width="32" height="14" rx="5" fill="${I_M}"/>
${[44,62,80].map((y,i)=>`<rect x="36" y="${y-6}" width="12" height="12" rx="3.5" fill="${i<2?I_M:I_G}"/>${i<2?check(41,y,3.5,"#fff",2.4):""}<rect x="54" y="${y-2.5}" width="${i===1?22:30}" height="5" rx="2.5" fill="${I_G}"/>`).join("")}
${star4(96,30,5,I_A)}`],
["routine","Routine","Lifestyle",()=>shadow(30)+`
<circle cx="40" cy="30" r="10" fill="${I_M}"/><circle cx="80" cy="30" r="10" fill="${I_M}"/>
<path d="M42 96l-6 8M78 96l6 8" stroke="${I_MD}" stroke-width="5" stroke-linecap="round"/>
<circle cx="60" cy="64" r="36" fill="${I_M}"/><circle cx="60" cy="64" r="28" fill="#fff"/>
${[0,1,2,3].map(i=>`<rect x="58.5" y="38" width="3" height="6" rx="1.5" fill="${I_GD}" transform="rotate(${i*90} 60 64)"/>`).join("")}
<path d="M60 64V48M60 64l11 7" stroke="${I_INK}" stroke-width="4" stroke-linecap="round"/><circle cx="60" cy="64" r="3.5" fill="${I_A}"/>`]
];
const ILLO_BY_KEY=Object.fromEntries(ILLOS.map(x=>[x[0],x]));
const ILLO_ALIASES={strength:"barbell",lifting:"barbell",weights:"dumbbell",training:"dumbbell",workout:"dumbbell",kettlebells:"kettlebell",pullup:"pull-up",pullups:"pull-up","pull-ups":"pull-up",cardio:"jump-rope",conditioning:"jump-rope",running:"sneaker",run:"sneaker",walking:"steps",walk:"steps",mobility:"yoga-mat",stretching:"yoga-mat",yoga:"yoga-mat",
  protein:"shaker",shake:"shaker",supplements:"shaker",nutrition:"plate",meals:"plate",meal:"plate",macros:"plate",hydration:"water",water:"water",fruit:"apple",vegetables:"broccoli",veggies:"broccoli",greens:"broccoli",breakfast:"eggs",mealprep:"meal-prep","meal prep":"meal-prep",grocery:"groceries",shopping:"groceries",
  sleep:"sleep",rest:"pillow",recovery:"foam-roller","foam rolling":"foam-roller",cold:"cold-plunge","ice bath":"cold-plunge",sauna:"sauna",heat:"sauna",breathing:"breathwork",breath:"breathwork",stress:"breathwork",massage:"massage-gun","rest day":"tea",
  heart:"heart",cardiovascular:"heart","heart rate":"heart-rate",hrv:"heart-rate",lungs:"lungs",mind:"brain",mental:"brain",focus:"brain",bones:"bone",joints:"bone",measurements:"tape","body composition":"tape",weight:"scale","weigh-in":"scale",labs:"blood","blood work":"blood",glucose:"blood",
  steps:"steps",wearable:"watch",watch:"watch",streak:"calendar",calendar:"calendar",consistency:"calendar",progress:"progress",goal:"target",goals:"target",pr:"trophy",record:"trophy",milestone:"medal",achievement:"medal","check-in":"check-in",app:"check-in",
  outdoors:"sun",sunlight:"sun",meditation:"meditation",mindfulness:"meditation",energy:"energy",community:"community",group:"community",coach:"whistle",coaching:"whistle",journal:"journal",habits:"checklist",habit:"checklist",routine:"routine",schedule:"routine"};
function findIllo(subject){const s=String(subject||"").toLowerCase().trim();if(ILLO_BY_KEY[s])return ILLO_BY_KEY[s];if(ILLO_ALIASES[s])return ILLO_BY_KEY[ILLO_ALIASES[s]];
  for(const w of s.split(/[^a-z-]+/)){if(ILLO_BY_KEY[w])return ILLO_BY_KEY[w];if(ILLO_ALIASES[w])return ILLO_BY_KEY[ILLO_ALIASES[w]]}return null}
function illoSVG(key,frame="circle",label){const x=ILLO_BY_KEY[key];if(!x)return "";
  const bg=frame==="circle"?`<circle cx="60" cy="60" r="56" fill="var(--mxl)"/>`:frame==="squircle"?`<rect x="4" y="4" width="112" height="112" rx="30" fill="var(--mxl)"/>`:"";
  return `<svg class="ill" viewBox="0 0 120 120" role="img" aria-label="${(label||x[1]).replace(/"/g,"&quot;")}">${bg}${x[3]()}</svg>`}

/* =====================================================================
   CATALOG v2. What the model may compose. "data" props take keys from the
   member's snapshot, limited to the kinds each component can draw.
   ===================================================================== */
const str=(o={})=>({t:"str",...o}),text=(o={})=>({t:"text",...o}),en=(vals,o={})=>({t:"enum",vals,...o});
const data=(kinds,o={})=>({t:"data",kinds,...o}),dataList=(kinds,min,max,o={})=>({t:"dataList",kinds,min,max,...o});
const CATALOG={
  ReportLayout:{desc:"Root page. Exactly one.",kids:1,props:{title:text({req:1}),subtitle:text(),theme:en(["milton","gym"]),main:str(),accent:str()}},
  Section:{desc:"Titled group of blocks.",kids:1,props:{title:text({req:1}),eyebrow:str(),layout:en(["stack","two-column","three-column"])}},
  Divider:{desc:"Thin rule.",props:{}},
  Hero:{desc:"Opening statement. statement = words only. metric = words plus a featured number. number = one giant number leads. trend = words plus a sparkline of a series.",props:{variant:en(["statement","metric","number","trend"]),eyebrow:str(),headline:text({req:1}),body:text(),data:data(["metric","series","goal"])}},
  TextBlock:{desc:"Paragraph. lead = large intro.",props:{body:text({req:1}),variant:en(["plain","lead","small"])}},
  CoachNote:{desc:"Personal note in the coach's voice.",props:{body:text({req:1}),from:str()}},
  Callout:{desc:"Highlighted box: info, watch, celebrate.",props:{tone:en(["info","watch","celebrate"]),title:text(),body:text({req:1})}},
  Stats:{desc:"1 to 6 numbers. tiles = cards with change pills. spark = tiles with a sparkline (series only). compact = one tight row.",props:{variant:en(["tiles","spark","compact"]),items:{t:"statItems",req:1,min:1,max:6}}},
  TrendLine:{desc:"One series over time, any number of points. Daily data shows dots plus a 7-day average. Shows the goal line when the series has a target.",props:{title:str(),data:data(["series"],{req:1}),variant:en(["area","line"]),annotate:en(["ends","minmax"]),caption:text()}},
  MultiLine:{desc:"2 or 3 series on one chart. Mixed units switch to % change.",props:{title:str(),data:dataList(["series"],2,3,{req:1}),caption:text()}},
  SmallMultiples:{desc:"Grid of mini trend cards, 2 to 6 series.",props:{title:str(),data:dataList(["series"],2,6,{req:1})}},
  ColumnChart:{desc:"Vertical columns for a weekly series. highlight latest, best or all. Optional average line; goal line when the series has a target.",props:{title:str(),data:data(["series"],{req:1,weekly:1}),highlight:en(["latest","best","all"]),average:{t:"bool"},caption:text()}},
  StackedColumns:{desc:"Vertical stacked columns by week (2 or 3 parts).",props:{title:str(),data:data(["stack"],{req:1}),caption:text()}},
  ChangeBars:{desc:"Week-over-week change, up and down from zero, colored toward or away from the goal.",props:{title:str(),data:data(["series"],{req:1,weekly:1}),caption:text()}},
  Dumbbell:{desc:"Start vs now for 1 to 5 series, one row each.",props:{title:str(),data:dataList(["series"],1,5,{req:1}),caption:text()}},
  SegmentedBar:{desc:"One whole split into parts, or before and after rows (body composition).",props:{title:str(),data:data(["parts","partsCompare"],{req:1}),caption:text()}},
  Donut:{desc:"Share of a whole, up to 6 parts, at a glance.",props:{title:str(),data:data(["parts"],{req:1}),caption:text()}},
  Radar:{desc:"Score profile across 4 to 8 areas, then vs now.",props:{title:str(),data:data(["radar"],{req:1}),caption:text()}},
  SlopeChart:{desc:"Then vs now for each score area, sorted, biggest gain highlighted.",props:{title:str(),data:data(["radar"],{req:1}),caption:text()}},
  CompareTable:{desc:"Then vs now for 2 to 8 series. table = rows with sparklines. cards = big before and after cards.",props:{title:str(),variant:en(["table","cards"]),data:dataList(["series"],2,8,{req:1})}},
  GoalProgress:{desc:"Progress toward coach goals. rings or bars.",props:{title:str(),variant:en(["rings","bars"]),data:dataList(["goal"],1,4,{req:1})}},
  ConsistencyGrid:{desc:"30 days of planned health actions as circles.",props:{title:str(),data:data(["habits"],{req:1}),caption:text()}},
  CalendarHeatmap:{desc:"12 weeks of activity as a calendar heat map.",props:{title:str(),data:data(["calendar"],{req:1}),caption:text()}},
  RecordBoard:{desc:"Personal records with dates and gains.",props:{title:str(),data:data(["records"],{req:1})}},
  List:{desc:"wins, focus, checklist or steps. items: {title, detail?, note?}",props:{variant:en(["wins","focus","checklist","steps"]),title:str(),items:{t:"listItems",req:1,min:1,max:10}}},
  ActionPlan:{desc:"Plan of 1 to 12 weeks. Layout adapts: 1 week detailed, 2 to 4 columns, 5 to 12 a phased grid. weeks: {label, theme, actions[], phase?}",props:{title:str(),weeks:{t:"weeks",req:1,min:1,max:12}}},
  Illustration:{desc:"Branded illustration from the Milton library. subject is a key or plain word (hydration, protein, sleep, steps...). Unknown subjects show a placeholder.",props:{subject:str({req:1}),caption:text()}}
};

/* ---------- validation ---------- */
const TOKEN_RE=/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g;
function validate(spec,m){
  const issues=[],out={root:spec&&spec.root,elements:{}};const els=(spec&&spec.elements)||{};const seen=new Set();let count=0,tokens=0;
  const okData=(k,kinds,sch)=>{const d=m.data[k];if(!d||!kinds.includes(d.kind))return false;if(sch&&sch.weekly&&d.cadence!=="weekly")return false;return true};
  const walk=(id,depth)=>{if(seen.has(id)||depth>8)return false;seen.add(id);const el=els[id];
    if(!el){issues.push(["w",`Child "${id}" missing.`]);return false}
    const def=CATALOG[el.type];if(!def){issues.push(["e",`"${el.type}" isn't in the catalog.`]);return false}
    const p=el.props||{},props={};
    for(const [k,s] of Object.entries(def.props)){const v=p[k];
      if(v==null){if(s.req){issues.push(["e",`${el.type} ${id} missing ${k}.`]);return false}continue}
      if(s.t==="any"){props[k]=v;continue}
      if(s.t==="enum"&&!s.vals.includes(v)){issues.push(["w",`${id}: "${v}" not allowed for ${k}.`]);continue}
      if(s.t==="data"&&!okData(v,s.kinds,s)){issues.push(["e",`${id}: "${v}" isn't ${s.kinds.join(" or ")} data${s.weekly?" by week":""}.`]);if(s.req)return false;continue}
      if(s.t==="dataList"){const arr=(Array.isArray(v)?v:[v]).filter(x=>okData(x,s.kinds));if(arr.length<s.min){issues.push(["e",`${id}: needs ${s.min}+ valid series.`]);return false}props[k]=arr.slice(0,s.max);continue}
      if(s.t==="statItems"){const arr=(v||[]).filter(it=>it&&m.data[it.data]&&["metric","series","goal"].includes(m.data[it.data].kind));if(!arr.length)return false;props[k]=arr.slice(0,s.max);continue}
      if((s.t==="listItems"||s.t==="weeks")&&!Array.isArray(v)){issues.push(["e",`${id}: ${k} must be a list.`]);return false}
      if(s.t==="weeks"&&(v.length<1||v.length>12)){issues.push(["w",`${id}: plans hold 1 to 12 weeks.`])}
      props[k]=s.t==="weeks"?v.slice(0,12):v}
    JSON.stringify(props).replace(TOKEN_RE,(_,t)=>{tokens++;if(resolveToken(t,m)==null)issues.push(["e",`${id} references {{${t}}}, not in the data.`])});
    const children=def.kids&&Array.isArray(el.children)?el.children.filter(c=>walk(c,depth+1)):[];
    out.elements[id]={type:el.type,props,children};count++;return true};
  if(spec&&els[spec.root])walk(spec.root,0);else issues.push(["e","Root missing."]);
  issues.unshift(["ok",`Validated ${count} elements. ${tokens} data references resolved.`]);
  return {spec:out,issues,count};
}

/* ---------- renderer ---------- */
function rt(s,m){return esc(s).replace(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g,(_,k)=>{const v=resolveToken(k,m);const d=m.data[k.split(".")[0]];return v==null?`<span class="tok bad">[${esc(k)}]</span>`:`<span class="tok" title="${esc(d?d.source:"Member profile")}">${esc(v)}</span>`})}
function card(p,inner,m,cls=""){return `<div class="card ${cls}">${p.title?`<h5>${esc(p.title)}</h5>`:""}${inner}${p.caption?`<p class="cap">${rt(p.caption,m)}</p>`:""}</div>`}
function headPill(s){const x=seriesSummary(s);return `<div class="chead">${pill(x.change+" since "+x.since,x.good)}</div>`}
function statOf(key,m){const d=m.data[key];
  if(d.kind==="metric")return {label:d.label,display:d.display,delta:d.delta,good:d.good,series:null};
  if(d.kind==="goal")return {label:d.label,display:fmtVal(d.current,d.unit,d.dec),delta:Math.round(d.progress*100)+"% to goal",good:true,series:null};
  const s=seriesSummary(d);return {label:d.label.replace(/, weekly average| \(est\. 1RM\)/,""),display:s.display,delta:s.change+" since "+s.since,good:s.good,series:d}}
const PHASE_C=["var(--c1)","var(--c2)","var(--c3)","var(--t4)"];
const HEX=/^#[0-9a-fA-F]{6}$/;
function brandStyle(p,story){const g=(window.DB&&DB.GYM)||{};let M=p.main,A=p.accent;if(!HEX.test(M||"")&&p.theme==="gym"){M=g.color;A=g.accent}if(!HEX.test(M||""))return "";A=HEX.test(A||"")?A:"#F08A4B";
  return story?` style="--s-bg:color-mix(in srgb,${M} 30%,#0b0f14);--s-feature:${M};--s-accent:color-mix(in srgb,${A} 72%,#fff);--s-label:color-mix(in srgb,${M} 28%,#fff)"`
    :` style="--accent:color-mix(in srgb,${M} 88%,#000);--deep:color-mix(in srgb,${M} 32%,#0b0f14);--c1:${M};--c2:${A};--c3:color-mix(in srgb,${A} 55%,${M});--a:${A}"`}
function renderEl(id,ctx){const e=ctx.spec.elements[id],h=renderEl0(id,ctx);return ctx.pick&&h&&e&&id!==ctx.spec.root&&!/^Story/.test(e.type)?`<div class="pk${ctx.pick===id?" pksel":""}" data-pk="${id}">${h}</div>`:h}
function renderEl0(id,ctx){
  if(ctx.spec.elements[id]&&/^Story/.test(ctx.spec.elements[id].type))return renderStory(id,ctx);
  const el=ctx.spec.elements[id];if(!el)return "";const p=el.props,m=ctx.m,D=m.data,kids=()=>el.children.map(c=>renderEl(c,ctx)).join("");
  switch(el.type){
  case "ReportLayout":return `<article class="rpt ${p.theme==="gym"?"gym":""}"${brandStyle(p)}><header class="rpt-head"><div class="rpt-brand"><span class="mark">${p.theme==="gym"?GYM.short:"M"}</span>${esc(p.theme==="gym"?GYM.name:"Milton")}</div><h2>${rt(p.title,m)}</h2>${p.subtitle?`<p>${rt(p.subtitle,m)}</p>`:""}<div class="rpt-for"><span>For ${esc(m.name)}</span><span>${PERIOD}</span><span>From ${esc(m.coach)}</span></div></header><div class="rpt-body">${kids()}</div><footer class="rpt-foot"><span>Data from Milton</span><span>${PERIOD}</span><span>Calculated ${TODAY}</span></footer></article>`;
  case "Section":return `<section class="sec"><div class="sec-h">${p.eyebrow?`<div class="eyebrow">${esc(p.eyebrow)}</div>`:""}<h4>${rt(p.title,m)}</h4></div><div class="sec-body ${p.layout||""}">${kids()}</div></section>`;
  case "Divider":return `<hr class="div">`;
  case "Hero":{const v=p.variant||(p.data?"metric":"statement");const d=p.data&&D[p.data];const st=d?statOf(p.data,m):null;
    const words=`<div>${p.eyebrow?`<div class="eyebrow">${esc(p.eyebrow)}</div>`:""}<h3>${rt(p.headline,m)}</h3>${p.body?`<p>${rt(p.body,m)}</p>`:""}</div>`;
    if(v==="statement")return `<div class="hero statement">${words}</div>`;
    if(v==="number"&&st)return `<div class="hero number"><div class="bignum"><b>${esc(st.display)}</b><span>${esc(st.label)}</span>${st.delta?pill(st.delta,st.good):""}</div>${words}</div>`;
    if(v==="trend"&&st&&st.series)return `<div class="hero trend">${words}<div class="hero-spark"><div class="hs-top"><b>${esc(st.display)}</b>${pill(st.delta,st.good)}</div>${spark(st.series,260,70)}</div></div>`;
    return `<div class="hero metric">${words}${st?`<div class="hero-metric"><b>${esc(st.display)}</b><span>${esc(st.label)}</span></div>`:""}</div>`}
  case "TextBlock":return `<p class="txt ${p.variant||""}">${rt(p.body,m)}</p>`;
  case "CoachNote":return `<figure class="coach"><span class="q">“</span><div><p>${rt(p.body,m)}</p><small>${esc(p.from||m.coach)}</small></div></figure>`;
  case "Callout":return `<aside class="callout ${p.tone||"info"}">${p.title?`<b>${rt(p.title,m)}</b>`:""}<p>${rt(p.body,m)}</p></aside>`;
  case "Stats":{const v=p.variant||"tiles";const items=p.items.map(it=>({...statOf(it.data,m),label2:it.label,note:it.note}));
    if(v==="compact")return `<div class="stats-c">${items.map(s=>`<div><span>${esc(s.label2||s.label)}</span><b>${esc(s.display)}</b>${s.delta?`<em class="${s.good===true?"g":s.good===false?"a":""}">${esc(s.delta)}</em>`:""}</div>`).join("")}</div>`;
    return `<div class="stats">${items.map(s=>`<div class="tile"><span class="lab">${esc(s.label2||s.label)}</span><span class="val">${esc(s.display)}</span>${s.delta?pill(s.delta,s.good):""}${v==="spark"&&s.series?spark(s.series,200,44):""}${s.note?`<span class="note2">${rt(s.note,m)}</span>`:""}</div>`).join("")}</div>`}
  case "TrendLine":{const s=D[p.data];return card({...p,title:p.title||s.label},headPill(s)+vizTrend(s,{variant:p.variant,annotate:p.annotate}),m,"chart")}
  case "MultiLine":return card(p,vizMulti(p.data.map(k=>D[k])),m,"chart");
  case "SmallMultiples":return `<div class="sm-wrap">${p.title?`<h5>${esc(p.title)}</h5>`:""}<div class="sm">${p.data.map(k=>{const s=D[k],x=seriesSummary(s);return `<div class="smc"><span class="lab">${esc(s.label.replace(/, weekly average| \(est\. 1RM\)/,""))}</span><b>${esc(x.display)}</b>${pill(x.change,x.good)}${spark(s,220,56)}<span class="smx">${esc(s.x[0])} to ${esc(s.x.at(-1))}</span></div>`}).join("")}</div></div>`;
  case "ColumnChart":{const s=D[p.data];return card({...p,title:p.title||s.label},vizColumns(s,{highlight:p.highlight,average:p.average}),m,"chart")}
  case "StackedColumns":return card({...p,title:p.title||D[p.data].label},vizStack(D[p.data]),m,"chart");
  case "ChangeBars":{const s=D[p.data];return card({...p,title:p.title||s.label+", week over week"},vizDelta(s),m,"chart")}
  case "Dumbbell":return card(p,vizDumbbell(p.data.map(k=>D[k])),m,"chart");
  case "SegmentedBar":return card({...p,title:p.title||D[p.data].label},vizSegments(D[p.data]),m);
  case "Donut":return card({...p,title:p.title||D[p.data].label},vizDonut(D[p.data]),m);
  case "Radar":return card({...p,title:p.title||D[p.data].label},vizRadar(D[p.data]),m,"chart");
  case "SlopeChart":return card({...p,title:p.title||D[p.data].label},vizSlope(D[p.data]),m,"chart");
  case "CompareTable":{const rows=p.data.map(k=>{const s=D[k],x=seriesSummary(s);return {s,x}});
    if(p.variant==="cards")return card(p,`<div class="ba">${rows.map(({s,x})=>`<div class="bac"><span class="lab">${esc(s.label.replace(/, weekly average| \(est\. 1RM\)/,""))}</span><div class="bav"><div><small>${esc(s.x[0])}</small><em>${esc(x.start)}</em></div><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="var(--muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><div><small>Now</small><b>${esc(x.display)}</b></div></div>${pill(x.change,x.good)}</div>`).join("")}</div>`,m);
    return card(p,`<div class="tbl-wrap"><table class="ctbl"><thead><tr><th>Measure</th><th>${esc(WEEKS[0])}</th><th>Now</th><th>Change</th><th>Trend</th></tr></thead><tbody>${rows.map(({s,x})=>`<tr><td>${esc(s.label.replace(/, weekly average| \(est\. 1RM\)/,""))}</td><td class="n">${esc(x.start)}</td><td class="n"><b>${esc(x.display)}</b></td><td>${pill(x.change,x.good)}</td><td>${spark(s,110,30)}</td></tr>`).join("")}</tbody></table></div>`,m)}
  case "GoalProgress":{const gs=p.data.map(k=>D[k]);
    if(p.variant==="bars")return card(p,`<div class="gbars">${gs.map(g=>`<div class="gb"><div class="gb-top"><span>${esc(g.label)}</span><b>${Math.round(g.progress*100)}%</b></div><div class="meter"><i style="width:${g.progress*100}%"></i></div><div class="gb-bot"><span>Started ${esc(fmtVal(g.start,g.unit,g.dec))}</span><span>Now <b>${esc(fmtVal(g.current,g.unit,g.dec))}</b></span><span>Goal ${esc(fmtVal(g.target,g.unit,g.dec))}</span></div></div>`).join("")}</div>`,m);
    return card(p,`<div class="rings">${gs.map(g=>`<div class="rg">${ring(g)}<b>${esc(g.label)}</b><span>${esc(fmtVal(g.current,g.unit,g.dec))} now, goal ${esc(fmtVal(g.target,g.unit,g.dec))}</span></div>`).join("")}</div>`,m)}
  case "ConsistencyGrid":return card({...p,title:p.title||"Your last 30 days"},vizHabits(D[p.data])+`<div class="cg-sum"><b>${esc(D.consistency.display)}</b> of planned actions done</div>`,m);
  case "CalendarHeatmap":return card({...p,title:p.title||D[p.data].label},vizCalendar(D[p.data]),m);
  case "RecordBoard":{const r=D[p.data].rows;return card({...p,title:p.title||"Personal records"},`<ol class="prs">${r.map((x,i)=>`<li><span class="rk">${i+1}</span><div class="prl"><b>${esc(x.label)}</b><span>${esc(x.date)}</span></div>${x.series?spark(D[x.series],90,28):"<span></span>"}<div class="prv"><b>${esc(x.best)}</b>${pill(x.gain,true)}</div></li>`).join("")}</ol>`,m)}
  case "List":{const v=p.variant||"focus";const it=p.items.map(x=>typeof x==="string"?{title:x}:x);
    if(v==="checklist")return card(p,`<ul class="check">${it.map(x=>`<li><span><b>${rt(x.title,m)}</b>${x.detail?`<span>${rt(x.detail,m)}</span>`:""}</span></li>`).join("")}</ul>`,m);
    if(v==="steps")return card(p,`<ol class="steps">${it.map((x,i)=>`<li><span class="sn">${i+1}</span><div><b>${rt(x.title,m)}</b>${x.detail?`<span>${rt(x.detail,m)}</span>`:""}</div></li>`).join("")}</ol>`,m);
    return card(p,`<ol class="list ${v}">${it.map((x,i)=>`<li class="li"><span class="n">${v==="wins"?`<svg viewBox="0 0 24 24" width="16" height="16"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`:i+1}</span><div><b>${rt(x.title,m)}</b>${x.detail?`<span>${rt(x.detail,m)}</span>`:""}${x.note?`<em>${rt(x.note,m)}</em>`:""}</div></li>`).join("")}</ol>`,m)}
  case "ActionPlan":{const W=p.weeks,n=W.length;const head=p.title?`<div class="sec-h"><h4 style="font-size:19px">${esc(p.title)}</h4></div>`:"";
    if(n===1){const w=W[0];return `<section class="sec">${head}<div class="plan1"><div class="p1-h"><small>${esc(w.label||"This week")}</small><b>${rt(w.theme||"",m)}</b></div><ul>${(w.actions||[]).map(a=>`<li>${rt(a,m)}</li>`).join("")}</ul></div></section>`}
    if(n<=4)return `<section class="sec">${head}<div class="plan cols${n}">${W.map((w,i)=>`<div class="wk"><div class="wk-h" style="background:${n===2?(i?"var(--deep)":C(0)):`color-mix(in srgb,${C(0)} ${100-i*14}%,var(--deep))`}"><small>${esc(w.label||"Week "+(i+1))}</small><b>${rt(w.theme||"",m)}</b></div><ul>${(w.actions||[]).map(a=>`<li><span>${rt(a,m)}</span></li>`).join("")}</ul></div>`).join("")}</div></section>`;
    const phases=[];W.forEach(w=>{const ph=w.phase||"Plan";if(!phases.length||phases.at(-1).name!==ph)phases.push({name:ph,n:1});else phases.at(-1).n++});
    return `<section class="sec">${head}<div class="phases">${phases.map((ph,i)=>`<div class="ph" style="flex:${ph.n}"><i style="background:${PHASE_C[i%4]}"></i><b>${esc(ph.name)}</b><span>${ph.n} week${ph.n>1?"s":""}</span></div>`).join("")}</div><div class="plan grid">${W.map((w,i)=>{const pi=phases.findIndex((ph,k)=>{let s=0;for(let j=0;j<k;j++)s+=phases[j].n;return i>=s&&i<s+ph.n});return `<div class="wkc"><div class="wkc-h"><span class="wn" style="background:${PHASE_C[pi%4]}">${i+1}</span><b>${rt(w.theme||"",m)}</b></div><ul>${(w.actions||[]).slice(0,3).map(a=>`<li>${rt(a,m)}</li>`).join("")}</ul></div>`}).join("")}</div></section>`}
  case "Illustration":{const il=findIllo(p.subject);if(il)return `<div class="illo">${illoSVG(il[0],"circle")}<b>${esc(p.subject)}</b>${p.caption?`<span>${rt(p.caption,m)}</span>`:""}</div>`;}
    return `<div class="illo-ph"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="9" cy="10" r="2" fill="currentColor"/><path d="M4 18l5-5 4 4 3-3 4 4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg><b>Illustration needed</b><span>${esc(p.subject)}</span>${p.caption?`<em>${rt(p.caption,m)}</em>`:""}<small>Not in the library yet</small></div>`;
  }
  return `<div class="unknown">Unknown ${esc(el.type)}</div>`;
}


Object.assign(CATALOG,{
  StoryLayout:{desc:"Story root. Holds 3 to 8 story cards.",kids:1,props:{title:text({req:1}),kind:str(),theme:en(["story","gym"]),main:str(),accent:str()}},
  StoryHero:{desc:"Opening card. One giant number.",props:{label:str(),metric:{t:"any",req:1},show:str(),headline:text({req:1}),sub:text()}},
  StoryStat:{desc:"One number with a small picture of it.",props:{label:str(),headline:text({req:1}),metric:{t:"any",req:1},show:str(),sub:text(),note:text()}},
  StoryClimb:{desc:"Start to now for one series.",props:{label:str(),headline:text({req:1}),metric:{t:"any",req:1},note:text()}},
  StoryCompare:{desc:"Then and now for up to 3 measures.",props:{label:str(),metrics:{t:"any",req:1},note:text()}},
  StoryQuote:{desc:"A line from the coach.",props:{label:str(),body:text({req:1}),from:str()}},
  StoryReceipts:{desc:"Closing card listing the numbers.",props:{label:str(),headline:text(),metrics:{t:"any",req:1},note:text()}}
});
/* stories read a flat metric view of the same snapshot */
function sample5(v){const n=v.length;return [0,1,2,3,4].map(k=>v[Math.round(k*(n-1)/4)])}
Object.values(MEMBERS).forEach(m=>{const X={};Object.values(m.data).forEach(d=>{
  if(d.kind==="series"){const v=d.cadence==="daily"?rolling(d.v,7).map(r1):d.v,a=v[0],b=v[v.length-1],ch=b-a,p=a?Math.round(ch/a*100):0;
    X[d.key]={key:d.key,label:d.label.replace(/, weekly average| \(est\. 1RM\)/,""),value:b,display:fmtVal(b,d.unit,d.dec),unit:d.unit==="steps"?"":d.unit,prior:a,delta:(ch>=0?"+":"-")+fmtVal(Math.abs(ch),d.unit==="steps"?"":d.unit,d.dec)+" ("+(p>=0?"+":"")+p+"%)",dir:ch>=0?"up":"down",series:sample5(v),source:d.source}}
  if(d.kind==="metric")X[d.key]={key:d.key,label:d.label,value:d.value,display:d.display,delta:d.delta,prior:d.prior,dir:d.good?"up":"down",source:d.source}});
  m.metrics=X;m.grid={rows:m.data.habits.rows}});
const pad=n=>String(n).padStart(2,"0");
function fmtN(v){return Math.abs(v)>=1000?Math.round(v).toLocaleString("en-US"):(Math.round(v*10)/10).toString()}
function ed(id,prop,s,m){return rt(s,m)}
/* story helpers: the big number is always read from the snapshot, never typed */
function bigVal(x,show){return show==="delta"&&x.delta?x.delta.split(" (")[0].replace(/ vs .*$/,""):x.display.replace("/day","").replace("/night","")}
const bigCls=b=>b.length>6?" l":b.length>3?" m":"";
function sBars(series){const lo=Math.min(...series),hi=Math.max(...series);return `<div class="s-bars">${series.map(v=>`<i style="height:${Math.round(35+65*(v-lo)/((hi-lo)||1))}%"></i>`).join("")}</div>`}
function storyViz(x,m){
  if(x.series)return sBars(x.series);
  if(x.key==="sessions"){const r=m.grid.rows[0].cells.filter(v=>v!==null);const cols=r.length>8?Math.ceil(r.length/2):r.length;return `<div class="s-dots" style="grid-template-columns:repeat(${cols},1fr)">${r.map(v=>`<i class="${v?"":"x"}"></i>`).join("")}</div>`}
  if(x.key==="consistency")return `<div class="s-prog"><i style="width:${Math.max(0,Math.min(100,x.value))}%"></i></div>`;
  return "";
}
function storyCard(id,ctx,inner,o={}){
  const p=ctx.spec.elements[id].props,last=ctx.si===ctx.sn-1;
  const fresh=ctx.fresh&&ctx.fresh.has(id)?" fresh":"";
  return `<div class="sc el${fresh}${ctx.pick===id?" pksel":""}" data-el="${id}"><div class="sc-in ${o.cls||""}">${o.bg||""}${p.label?`<div class="sc-label">${esc(p.label)}</div>`:""}<div class="sc-mid${o.low?" low":""}">${inner}</div><div class="sc-foot"><span class="${last&&ctx.link?"lk":""}">${last&&ctx.link?esc(ctx.link):"MILTON × "+esc(GYM.short)}</span><span>${pad((ctx.si||0)+1)} / ${pad(ctx.sn||1)}</span></div></div></div>`;
}
function renderStory(id,ctx){
  const el=ctx.spec.elements[id],p=el.props,m=ctx.m;
  const sNote=()=>p.note?`<div class="s-note">${ed(id,"note",p.note,m)}</div>`:"";
  switch(el.type){
    case "StoryLayout":{const n=el.children.length,one=ctx.one!=null;
      return `<div class="story ${p.theme==="gym"?"gym":""} ${one?"one":"strip"}" data-el="${id}"${brandStyle(p,1)}${one?"":` tabindex="0" aria-label="Story cards"`}>${el.children.map((c,i)=>one&&ctx.one!==i?"":renderEl(c,{...ctx,si:i,sn:n})).join("")}</div>`}
    case "StoryHero":{const b=bigVal(m.metrics[p.metric],p.show);
      return storyCard(id,ctx,`<div class="s-big${bigCls(b)}">${esc(b)}</div><div class="s-lines">${ed(id,"headline",p.headline,m)}</div>${p.sub?`<div class="s-sub">${ed(id,"sub",p.sub,m)}</div>`:""}`)}
    case "StoryStat":{const x=m.metrics[p.metric],b=bigVal(x,p.show);
      return storyCard(id,ctx,`<div class="s-h">${ed(id,"headline",p.headline,m)}</div><div class="s-big${bigCls(b)||" m"}">${esc(b)}</div>${p.sub?`<div class="s-sub">${ed(id,"sub",p.sub,m)}</div>`:""}${storyViz(x,m)}${sNote()}`)}
    case "StoryClimb":{const x=m.metrics[p.metric];
      return storyCard(id,ctx,`<div class="s-h">${ed(id,"headline",p.headline,m)}</div><div class="s-ft"><span>${fmtN(x.series[0])}</span><span class="ar">→</span><span class="to">${fmtN(x.series[4])}</span><small>${esc(x.unit)}</small></div>${sBars(x.series)}${sNote()}`)}
    case "StoryCompare":return storyCard(id,ctx,`<div class="s-cmp">${p.metrics.map(k=>{const x=m.metrics[k];return `<div><div class="s-sub">${esc(x.label)}</div><div class="s-ft"><span>${fmtN(x.prior)}</span><span class="ar">→</span><span class="to">${esc(bigVal(x))}</span></div></div>`}).join("")}</div>${sNote()}`);
    case "StoryQuote":return storyCard(id,ctx,`<div class="s-q" aria-hidden="true">“</div><div class="s-quote">${ed(id,"body",p.body,m)}</div><div class="s-sub">${esc(p.from||m.coach)}</div>`,{cls:"feature"});
    case "StoryReceipts":return storyCard(id,ctx,`${p.headline?`<div class="s-h">${ed(id,"headline",p.headline,m)}</div>`:""}<div class="s-rc">${p.metrics.map(k=>{const x=m.metrics[k];return `<div><span>${esc(x.label)}</span><b>${esc(x.display)}</b></div>`}).join("")}</div>${sNote()}`);
  }
  return "";
}

const CSS=":host{display:block;--ocean:#0B5A78;--mist:#E5F2F7;--mist-b:#C5DFEA;--mist-t:#0A4A63;--navy:#0D2B40;--ink:#0D2B40;--ink2:#45596A;--muted:#5B6F80;--page:#F2F5F8;--panel:#F8FAFC;--sunk:#EDF2F6;--line:#DFE7EE;--grid:#E6EDF2;--glow:#2FD9CB;--glow-soft:#E3F9F6;--good:#1E8A5A;--good-bg:#E3F4EA;--warn:#B7791F;--bad:#C2413B;--away:#C3CDD6;--away2:#8E9DAA;--f-display:\"Archivo\",system-ui,sans-serif;--f-body:\"DM Sans\",system-ui,sans-serif;--f-mono:\"JetBrains Mono\",ui-monospace,monospace;color:var(--navy);font-family:var(--f-body);font-size:15px;line-height:1.5}\n*{box-sizing:border-box}button{font:inherit;cursor:pointer}\n.sk-root{position:relative}\n.tok{cursor:default}\n.nar .rpt{border-radius:0;box-shadow:none;max-width:none}\n.nar .rpt-head{padding:22px 20px}.nar .rpt-head h2{font-size:25px}\n.nar .rpt-body{padding:18px 14px}\n.nar .hero.metric,.nar .hero.trend,.nar .hero.number{grid-template-columns:1fr}\n.nar .bignum{border-right:none;padding-right:0;border-bottom:1px solid rgba(255,255,255,.16);padding-bottom:14px}\n.nar .sec-body.two-column,.nar .sec-body.three-column{grid-template-columns:1fr}\n.nar .plan.cols3,.nar .plan.cols4,.nar .plan.grid{grid-template-columns:1fr 1fr}.nar .plan1 ul{grid-template-columns:1fr}\n.nar .grid30{grid-template-columns:64px repeat(30,minmax(0,1fr));gap:4px 1px}\n.nar .prs li{grid-template-columns:28px 1fr auto}.nar .prs .spark{display:none}\n.nar .hero.statement h3{font-size:26px}.nar .bignum b{font-size:52px}\n.onepage .rpt{border-radius:24px;box-shadow:0 10px 30px rgba(13,43,64,.18)}\n.rpt.share{--c1:#6ECB74;--c2:#7FD3E8;--c3:#F2C46D;--deep:#11181B;background:#1A2327;color:#fff;--ink:#fff;--navy:#fff;--ink2:rgba(255,255,255,.78);--muted:rgba(255,255,255,.6);--line:rgba(255,255,255,.12);--grid:rgba(255,255,255,.1);--sunk:rgba(255,255,255,.12);--good:#6ECB74;--good-bg:rgba(110,203,116,.16);--t1:rgba(255,255,255,.06);--t1b:rgba(255,255,255,.1);--t2:rgba(255,255,255,.16);--t3:rgba(255,255,255,.3);--t4:rgba(255,255,255,.5)}\n.rpt.share .card,.rpt.share .tile,.rpt.share .smc,.rpt.share .stats-c,.rpt.share .hero-metric,.rpt.share .hero-spark{background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.12)}\n.rpt.share .pill{background:rgba(255,255,255,.12);color:#fff}.rpt.share .pill.good{background:rgba(110,203,116,.2);color:#9be3a0}\n.rpt.share .rpt-foot{border-color:rgba(255,255,255,.12)}\n.story.strip .sc{width:min(260px,70vw)}\n.thumb{pointer-events:none}\n.thumb .story.one .sc{width:100%}\n.thumb .rpt{width:860px;transform-origin:0 0}\n.pl-card{position:relative}.pl-card>button{position:absolute;top:0;bottom:0;border:none;background:transparent;z-index:2}.pl-card .prev{left:0;width:35%}.pl-card .next{right:0;width:65%}\n#tip{position:fixed}\n/* ---------- report theme (charts validated: Milton ocean/orange/violet, gym brick/ocean/gold) ---------- */\n.rpt{--accent:#0B5A78;--deep:#0D2B40;--c1:#0E6E9A;--c2:#eb6834;--c3:#7a5ad6;\n  --t1:color-mix(in srgb,var(--c1) 8%,#fff);--t1b:color-mix(in srgb,var(--c1) 14%,#fff);--t2:color-mix(in srgb,var(--c1) 24%,#fff);--t3:color-mix(in srgb,var(--c1) 42%,#fff);--t4:color-mix(in srgb,var(--c1) 66%,#fff)}\n.rpt{--m:var(--c1);--a:#F08A4B;--md:color-mix(in srgb,var(--m) 68%,#06121c);--ml:color-mix(in srgb,var(--m) 42%,#fff);--mxl:color-mix(in srgb,var(--m) 10%,#fff);--ad:color-mix(in srgb,var(--a) 72%,#3a1408);--al:color-mix(in srgb,var(--a) 45%,#fff);--g:#DCE4EB;--gd:#9AAAB8;--iink:#0D2B40;--paper:#EFD9B4;--paperd:#DCBD88;--h2o:#2F8FC9;--h2od:#1D6694;--h2ol:#A9D3EC}\n.rpt.gym{--a:#E9A23B}\n.illo{display:flex;flex-direction:column;align-items:center;text-align:center;gap:8px;background:#fff;border:1px solid var(--line);border-radius:16px;padding:16px 14px}\n.illo .ill{width:96px;height:96px}\n.illo b{font-size:14.5px}.illo span{font-size:13px;color:var(--ink2)}\n.rpt.gym{--accent:#B23A2B;--deep:#2A1512;--c1:#B23A2B;--c2:#0E6E9A;--c3:#c98500}\n.rpt{max-width:880px;margin:0 auto;background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 1px 2px rgba(13,43,64,.06),0 12px 40px rgba(13,43,64,.07)}\n.rpt-head{background:var(--deep);color:#fff;padding:26px 30px;position:relative;overflow:hidden}\n.rpt-head::after{content:\"\";position:absolute;right:-60px;top:-90px;width:280px;height:280px;border-radius:50%;background:radial-gradient(circle,color-mix(in srgb,var(--c1) 75%,transparent),transparent 70%);opacity:.7}\n.rpt-brand{display:flex;align-items:center;gap:8px;font-size:12px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;opacity:.85;position:relative;z-index:1}\n.rpt-brand .mark{width:22px;height:22px;border-radius:6px;background:var(--c1);display:grid;place-items:center;font-family:var(--f-display);font-size:11px;font-weight:800}\n.rpt-head h2{font-family:var(--f-display);font-size:30px;line-height:1.1;margin:12px 0 6px;letter-spacing:-.02em;position:relative;z-index:1}\n.rpt-head p{margin:0;opacity:.82;position:relative;z-index:1}\n.rpt-for{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px;position:relative;z-index:1}\n.rpt-for span{font-size:12px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.18);padding:3px 10px;border-radius:99px}\n.rpt-body{padding:24px 26px;display:flex;flex-direction:column;gap:22px}\n.rpt-foot{padding:12px 26px 18px;border-top:1px solid var(--line);font-size:11.5px;color:var(--muted);font-family:var(--f-mono);display:flex;gap:6px 18px;flex-wrap:wrap}\n.eyebrow{font-size:11.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--c1)}\n.sec{display:flex;flex-direction:column;gap:14px}\n.sec-h h4{font-family:var(--f-display);font-size:21px;margin:2px 0 0;letter-spacing:-.01em}\n.sec-body{display:flex;flex-direction:column;gap:16px}\n.sec-body.two-column{display:grid;grid-template-columns:1fr 1fr;gap:16px}\n.sec-body.three-column{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}\nhr.div{border:none;border-top:1px solid var(--line);margin:0}\n\n/* hero */\n.hero{border-radius:16px;padding:24px 26px;background:var(--t1)}\n.hero h3{font-family:var(--f-display);font-size:26px;line-height:1.15;margin:6px 0 8px;letter-spacing:-.015em;text-wrap:balance}\n.hero p{margin:0;color:var(--ink2);max-width:58ch}\n.hero.statement{background:none;padding:6px 0 4px;border-left:4px solid var(--c1);padding-left:20px;border-radius:0}\n.hero.statement h3{font-size:34px;line-height:1.1}\n.hero.statement p{font-size:17px}\n.hero.metric{display:grid;grid-template-columns:1fr auto;gap:24px;align-items:center}\n.hero-metric{text-align:center;min-width:150px;background:#fff;border-radius:14px;padding:16px 18px;border:1px solid var(--t2)}\n.hero-metric b{display:block;font-size:44px;line-height:1;font-weight:700;letter-spacing:-.02em}\n.hero-metric span{font-size:12.5px;color:var(--muted)}\n.hero.number{display:grid;grid-template-columns:auto 1fr;gap:28px;align-items:center;background:var(--deep);color:#fff}\n.hero.number .pill{background:rgba(255,255,255,.14);color:#fff;align-self:flex-start}\n.hero.number p{color:rgba(255,255,255,.78)}\n.hero.number .eyebrow{color:color-mix(in srgb,var(--c1) 45%,#fff)}\n.bignum{display:flex;flex-direction:column;gap:6px;padding-right:28px;border-right:1px solid rgba(255,255,255,.16)}\n.bignum b{font-size:64px;line-height:.95;font-weight:700;letter-spacing:-.03em}\n.bignum span{font-size:13px;opacity:.8}\n.hero.trend{display:grid;grid-template-columns:1fr 280px;gap:24px;align-items:center}\n.hero-spark{background:#fff;border-radius:14px;padding:14px 14px 6px;border:1px solid var(--t2)}\n.hs-top{display:flex;align-items:center;gap:8px;justify-content:space-between;margin-bottom:4px}\n.hs-top b{font-size:26px;font-weight:700}\n.hero-spark .spark{width:100%;height:auto}\n\n/* text */\n.txt{margin:0;max-width:66ch}\n.txt.lead{font-size:18px}\n.txt.small{font-size:13.5px;color:var(--ink2)}\n.tok{border-bottom:1.5px dotted var(--t3);font-weight:600;cursor:help}\n.tok.bad{color:var(--bad);border-color:var(--bad)}\n.coach{display:flex;gap:14px;background:var(--t1);border-radius:14px;padding:18px 20px;margin:0}\n.coach .q{font-family:var(--f-display);font-size:40px;line-height:.8;color:var(--c1)}\n.coach p{margin:0;font-size:16px}\n.coach small{display:block;margin-top:8px;color:var(--muted);font-weight:600}\n.callout{border-radius:14px;padding:14px 16px;border-left:4px solid var(--c1);background:var(--t1);margin:0}\n.callout.watch{border-left-color:var(--warn);background:#FDF6EA}\n.callout.celebrate{border-left-color:var(--good);background:#EDF8F1}\n.callout b{display:block;margin-bottom:2px}\n.callout p{margin:0;font-size:14px;color:var(--ink2)}\n\n/* cards + charts */\n.card{border:1px solid var(--line);border-radius:14px;padding:16px 18px;background:#fff;min-width:0}\n.card h5{font-size:15px;margin:0 0 6px;font-weight:600}\n.chead{margin:-2px 0 6px}\n.viz{width:100%;height:auto;display:block;font-family:var(--f-body)}\n.viz text{font-family:var(--f-body);font-variant-numeric:tabular-nums}\n.viz .mk{cursor:default;transition:opacity .15s}\n.viz .mk:hover{opacity:.82}\n.cap{font-size:12px;color:var(--muted);margin:8px 0 0}\n.legend{display:flex;gap:14px;flex-wrap:wrap;font-size:12px;color:var(--ink2);margin-top:8px}\n.legend i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:6px;vertical-align:-1px}\n.legend i.line{width:14px;height:2.5px;border-radius:2px;vertical-align:3px}\n.legend i.dot{border-radius:50%}\n.pill{display:inline-block;font-size:12px;font-weight:600;padding:2px 9px;border-radius:99px;background:var(--t1b);color:var(--ink2);white-space:nowrap;font-variant-numeric:tabular-nums}\n.pill.good{background:var(--good-bg);color:var(--good)}\n.pill.away{background:#F1F3F5;color:var(--ink2)}\n.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px}\n.tile{border:1px solid var(--line);border-radius:14px;padding:14px 16px;display:flex;flex-direction:column;gap:5px;background:#fff;align-items:flex-start}\n.tile .lab{font-size:12.5px;color:var(--muted);font-weight:500}\n.tile .val{font-size:28px;font-weight:700;line-height:1.1;letter-spacing:-.01em}\n.tile .spark{width:100%;height:auto;margin-top:6px}\n.tile .note2{font-size:12px;color:var(--muted)}\n.stats-c{display:flex;flex-wrap:wrap;border:1px solid var(--line);border-radius:14px;background:#fff;overflow:hidden}\n.stats-c>div{flex:1 1 140px;padding:12px 16px;display:flex;flex-direction:column;gap:2px;border-right:1px solid var(--line)}\n.stats-c>div:last-child{border-right:none}\n.stats-c span{font-size:12px;color:var(--muted)}\n.stats-c b{font-size:20px;font-weight:700}\n.stats-c em{font-style:normal;font-size:12px;color:var(--ink2);font-weight:600}\n.stats-c em.g{color:var(--good)}\n.sm-wrap h5{font-size:15px;margin:0 0 10px;font-weight:600}\n.sm{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:12px}\n.smc{border:1px solid var(--line);border-radius:14px;padding:14px 14px 10px;background:#fff;display:flex;flex-direction:column;gap:4px;align-items:flex-start}\n.smc .lab{font-size:12.5px;color:var(--muted)}\n.smc b{font-size:22px;font-weight:700;line-height:1.1}\n.smc .spark{width:100%;height:auto;margin-top:4px}\n.smx{font-size:10.5px;color:var(--muted);font-family:var(--f-mono)}\n.segs{display:flex;flex-direction:column;gap:12px;margin-top:8px}\n.segrow{display:flex;align-items:center;gap:10px}\n.seglab{width:58px;font-size:12px;color:var(--ink2);flex:none}\n.segtot{font-size:12.5px;font-weight:700;white-space:nowrap}\n.segbar{display:flex;gap:2px;height:28px}\n.seg{border-radius:4px;display:flex;align-items:center;padding:0 8px;min-width:0;overflow:visible}\n.seg span{color:#fff;font-size:12px;font-weight:600;white-space:nowrap}\n.donut{display:flex;align-items:center;gap:24px;flex-wrap:wrap}\n.dlist{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px;flex:1;min-width:180px}\n.dlist li{display:grid;grid-template-columns:12px 1fr auto auto;gap:10px;align-items:center;font-size:13.5px}\n.dlist i{width:10px;height:10px;border-radius:3px}\n.dlist b{font-variant-numeric:tabular-nums}\n.dlist em{font-style:normal;color:var(--muted);font-size:12px;font-variant-numeric:tabular-nums;min-width:70px;text-align:right}\n.tbl-wrap{overflow-x:auto}\n.ctbl{width:100%;border-collapse:collapse;font-size:13.5px}\n.ctbl th{text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);font-weight:600;padding:8px 10px;border-bottom:1px solid var(--line)}\n.ctbl td{padding:9px 10px;border-bottom:1px solid var(--line);vertical-align:middle}\n.ctbl tr:last-child td{border-bottom:none}\n.ctbl td.n{font-variant-numeric:tabular-nums;white-space:nowrap}\n.ctbl .spark{width:110px;height:30px;display:block}\n.ba{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-top:6px}\n.bac{border-radius:12px;background:var(--t1);padding:14px;display:flex;flex-direction:column;gap:8px;align-items:flex-start}\n.bac .lab{font-size:12.5px;color:var(--ink2);font-weight:600}\n.bav{display:flex;align-items:flex-end;gap:10px}\n.bav small{display:block;font-size:11px;color:var(--muted)}\n.bav em{font-style:normal;font-size:17px;color:var(--ink2)}\n.bav b{font-size:24px}\n.rings{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:14px;margin-top:6px}\n.rg{display:flex;flex-direction:column;align-items:center;text-align:center;gap:4px}\n.ring{width:110px;height:110px}\n.rg b{font-size:13.5px}\n.rg span{font-size:12px;color:var(--muted)}\n.gbars{display:flex;flex-direction:column;gap:18px;margin-top:8px}\n.gb-top{display:flex;justify-content:space-between;font-size:14px;margin-bottom:6px}\n.meter{height:10px;border-radius:99px;background:var(--t1b);overflow:hidden}\n.meter i{display:block;height:100%;border-radius:99px;background:var(--c1)}\n.gb-bot{display:flex;justify-content:space-between;font-size:12px;color:var(--muted);margin-top:6px;gap:8px;flex-wrap:wrap}\n.gb-bot b{color:var(--ink)}\n.grid30{display:grid;grid-template-columns:86px repeat(30,minmax(0,1fr));gap:5px 3px;align-items:center;margin-top:6px}\n.grid30 .rl{font-size:12px;color:var(--ink2);white-space:nowrap}\n.grid30 .dl{font-size:10px;color:var(--muted);text-align:center;font-family:var(--f-mono)}\n.hd{aspect-ratio:1;border-radius:50%;width:100%;max-width:15px;justify-self:center}\n.hd.d1{background:var(--c1)}.hd.d0{background:#fff;border:1.5px solid var(--t3)}.hd.dn{background:var(--sunk)}\n.cg-sum{font-size:13px;color:var(--ink2);margin-top:8px}\n.cal-wrap{display:flex;gap:28px;align-items:center;flex-wrap:wrap}\n.cal-stats{display:flex;flex-direction:column;gap:14px}\n.cal-stats div{display:flex;flex-direction:column}\n.cal-stats b{font-size:24px;font-weight:700;line-height:1.1}\n.cal-stats span{font-size:12.5px;color:var(--muted)}\n.cal{flex:0 1 360px;display:flex;flex-direction:column;gap:8px}\n.cal .viz{max-width:360px}\n.cal-key{display:flex;align-items:center;gap:4px;font-size:11.5px;color:var(--muted)}\n.cal-key i{width:14px;height:14px;border-radius:3px}\n.cal-key span{margin:0 4px}\n.prs{list-style:none;margin:6px 0 0;padding:0;display:flex;flex-direction:column}\n.prs li{display:grid;grid-template-columns:30px 1fr 90px auto;gap:12px;align-items:center;padding:10px 0;border-bottom:1px solid var(--line)}\n.prs li:last-child{border-bottom:none}\n.rk{width:28px;height:28px;border-radius:8px;background:var(--t1b);display:grid;place-items:center;font-weight:700;font-size:13px}\n.prl b{display:block;font-size:14px}.prl span{font-size:12px;color:var(--muted)}\n.prv{text-align:right;display:flex;flex-direction:column;align-items:flex-end;gap:3px}\n.prv b{font-size:15px}\n.prs .spark{width:90px;height:28px}\n/* lists */\n.list{display:flex;flex-direction:column;gap:12px;margin:6px 0 0;padding:0;list-style:none}\n.li{display:grid;grid-template-columns:30px 1fr;gap:12px;align-items:start}\n.li .n{width:30px;height:30px;border-radius:9px;background:var(--t1b);color:var(--c1);display:grid;place-items:center;font-weight:700;font-size:14px}\n.list.wins .n{background:var(--good-bg);color:var(--good);border-radius:50%}\n.li b{display:block;font-size:15px}\n.li span{font-size:13.5px;color:var(--ink2)}\n.li em{display:block;font-style:normal;font-size:12.5px;color:var(--c1);margin-top:2px;font-weight:500}\n.check{list-style:none;margin:6px 0 0;padding:0;display:flex;flex-direction:column;gap:10px}\n.check li{display:grid;grid-template-columns:20px 1fr;gap:10px;font-size:14.5px}\n.check li::before{content:\"\";width:18px;height:18px;border-radius:5px;border:2px solid var(--c1);margin-top:2px}\n.check li span span{display:block;font-size:13px;color:var(--ink2)}\n.check b{font-weight:500}\n.steps{list-style:none;margin:6px 0 0;padding:0;display:flex;flex-direction:column}\n.steps li{display:grid;grid-template-columns:30px 1fr;gap:12px;position:relative;padding-bottom:16px}\n.steps li:not(:last-child)::after{content:\"\";position:absolute;left:14px;top:30px;bottom:0;width:2px;background:var(--t2)}\n.sn{width:30px;height:30px;border-radius:50%;background:var(--c1);color:#fff;display:grid;place-items:center;font-weight:700;font-size:13px;z-index:1}\n.steps b{display:block}.steps li>div>span{font-size:13.5px;color:var(--ink2)}\n/* plans */\n.plan1{border:1px solid var(--t2);border-radius:14px;overflow:hidden}\n.p1-h{background:var(--c1);color:#fff;padding:14px 18px}\n.p1-h small{display:block;font-size:11px;letter-spacing:.08em;text-transform:uppercase;opacity:.85;font-weight:600}\n.p1-h b{font-family:var(--f-display);font-size:19px}\n.plan1 ul{list-style:none;margin:0;padding:16px 18px;display:grid;grid-template-columns:1fr 1fr;gap:10px 24px}\n.plan1 li{display:grid;grid-template-columns:18px 1fr;gap:10px;font-size:14.5px}\n.plan1 li::before{content:\"\";width:16px;height:16px;border-radius:5px;border:2px solid var(--t3);margin-top:2px}\n.plan{display:grid;gap:12px}\n.plan.cols2{grid-template-columns:1fr 1fr}.plan.cols3,.plan.cols4{grid-template-columns:repeat(auto-fit,minmax(170px,1fr))}\n.wk{border-radius:14px;border:1px solid var(--t2);overflow:hidden;background:#fff;display:flex;flex-direction:column}\n.wk-h{color:#fff;padding:10px 14px}\n.wk-h small{display:block;font-size:11px;letter-spacing:.08em;text-transform:uppercase;opacity:.8;font-weight:600}\n.wk-h b{font-family:var(--f-display);font-size:15px}\n.wk ul{list-style:none;margin:0;padding:12px 14px;display:flex;flex-direction:column;gap:8px;font-size:13.5px}\n.wk li{display:grid;grid-template-columns:16px 1fr;gap:8px}\n.wk li::before{content:\"\";width:14px;height:14px;border-radius:4px;border:1.5px solid var(--t3);margin-top:3px}\n.phases{display:flex;gap:4px}\n.ph{display:flex;flex-direction:column;gap:3px;min-width:0}\n.ph i{height:8px;border-radius:99px;display:block}\n.ph b{font-size:13px;margin-top:2px}.ph span{font-size:11.5px;color:var(--muted)}\n.plan.grid{grid-template-columns:repeat(4,1fr)}\n.wkc{border:1px solid var(--line);border-radius:12px;padding:10px 12px;background:#fff;display:flex;flex-direction:column;gap:6px}\n.wkc-h{display:flex;gap:8px;align-items:flex-start}\n.wn{width:22px;height:22px;border-radius:6px;color:#fff;font-size:11.5px;font-weight:700;display:grid;place-items:center;flex:none}\n.wkc-h b{font-size:13px;line-height:1.3}\n.wkc ul{margin:0;padding:0 0 0 2px;list-style:none;display:flex;flex-direction:column;gap:3px;font-size:12px;color:var(--ink2)}\n.wkc li::before{content:\"\u00b7 \";color:var(--muted)}\n.illo-ph{border:1.5px dashed var(--mist-b);border-radius:14px;background:var(--panel);padding:18px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:4px;color:var(--mist-t)}\n.illo-ph b{font-size:13.5px}.illo-ph span{font-size:13px;color:var(--ink2)}.illo-ph em{font-style:normal;font-size:12.5px;color:var(--ink2)}.illo-ph small{font-size:11px;color:var(--muted);margin-top:4px}\n.unknown{border:1px dashed var(--bad);color:var(--bad);padding:10px;border-radius:10px}\n\n/* tooltip */\n#tip{position:fixed;z-index:50;pointer-events:none;background:#fff;border:1px solid var(--line);border-radius:10px;box-shadow:0 8px 24px rgba(13,43,64,.14);padding:8px 10px;font-size:12.5px;min-width:120px;display:none}\n#tip .th{font-size:11.5px;color:var(--muted);margin-bottom:4px}\n#tip .tr{display:flex;align-items:center;gap:8px}\n#tip .tr i{width:12px;height:2.5px;border-radius:2px;flex:none}\n#tip .tr b{font-variant-numeric:tabular-nums}\n#tip .tr span{color:var(--ink2)}\n\n@media (max-width:760px){\n  .hero.metric,.hero.trend,.hero.number{grid-template-columns:1fr}\n  .bignum{border-right:none;padding-right:0;border-bottom:1px solid rgba(255,255,255,.16);padding-bottom:14px}\n  .sec-body.two-column,.sec-body.three-column{grid-template-columns:1fr}\n  .plan.cols3,.plan.cols4,.plan.grid{grid-template-columns:1fr 1fr}\n  .plan1 ul{grid-template-columns:1fr}\n  .grid30{grid-template-columns:64px repeat(30,minmax(0,1fr));gap:4px 1px}\n  .rpt-body{padding:18px 14px}\n  .prs li{grid-template-columns:28px 1fr auto}.prs .spark{display:none}\n}\n@media (prefers-reduced-motion:reduce){*{transition:none!important}}\n\n\n/* ---------- story cards (rendered from spec, every size is em-based off the card width) ---------- */\n.story{--s-bg:#1A2327;--s-accent:#6ECB74;--s-feature:#0B5A78;--s-label:#A9D3D6}\n.story.gym{--s-bg:#2A1512;--s-accent:#F4A08F;--s-feature:#B23A2B;--s-label:#E9C4BC}\n.story.strip{display:flex;gap:16px;overflow-x:auto;padding:10px 4px 30px;scroll-snap-type:x proximity;scrollbar-width:thin}\n.story.strip .sc{width:280px;flex:none;scroll-snap-align:start}\n.story.one .sc{width:100%}\n.sc{container-type:inline-size;aspect-ratio:9/16}\n.sc.el{border-radius:24px}\n.sc-in{height:100%;font-size:3.5714cqw;border-radius:2.4em;background:var(--s-bg);color:#fff;padding:2.6em;display:flex;flex-direction:column;position:relative;overflow:hidden;font-family:var(--f-display);box-shadow:0 10px 30px rgba(13,43,64,.18)}\n.sc-in.feature{background:var(--s-feature)}\n.sc-label{font-size:1em;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--s-label);position:relative;z-index:1}\n.sc-mid{flex:1;display:flex;flex-direction:column;justify-content:center;gap:.9em;position:relative;z-index:1;min-height:0}\n.sc-mid.low{justify-content:flex-end;padding-bottom:1.6em}\n.sc-foot{display:flex;justify-content:space-between;gap:1em;font-size:1em;letter-spacing:.08em;color:rgba(255,255,255,.45);font-family:var(--f-body);position:relative;z-index:1}\n.sc-foot .lk{letter-spacing:.02em}\n.sc .tok{border-bottom:none;font-weight:inherit}\n.s-big{font-size:11em;font-weight:800;line-height:.9;letter-spacing:-.03em;color:var(--s-accent);font-variant-numeric:tabular-nums}\n.s-big.m{font-size:6.4em;line-height:1}\n.s-big.l{font-size:4.4em;line-height:1.05}\n.s-big.w{color:#fff}\n.s-lines{font-size:2.4em;font-weight:600;line-height:1.18}\n.s-h{font-size:2em;font-weight:600;line-height:1.2}\n.s-sub{font-size:1.3em;color:rgba(255,255,255,.78);font-family:var(--f-body)}\n.s-note{font-size:1.1em;color:rgba(255,255,255,.55);font-family:var(--f-body)}\n.s-bars{display:flex;align-items:flex-end;gap:.8em;height:11em;margin-top:1em}\n.s-bars i{flex:1;border-radius:.6em .6em 0 0;background:rgba(255,255,255,.28)}\n.s-bars i:last-child{background:var(--s-accent)}\n.s-dots{display:grid;gap:.55em;margin-top:.6em}\n.s-dots i{aspect-ratio:1;border-radius:.3em;background:var(--s-accent)}\n.s-dots i.x{background:rgba(255,255,255,.14)}\n.s-prog{height:.9em;border-radius:99px;background:rgba(255,255,255,.14);overflow:hidden;margin-top:.6em}\n.s-prog i{display:block;height:100%;background:var(--s-accent);border-radius:99px}\n.s-ft{font-size:3.4em;font-weight:700;display:flex;align-items:baseline;gap:.3em;flex-wrap:wrap;font-variant-numeric:tabular-nums;line-height:1.1}\n.s-ft .ar{opacity:.5;font-weight:500;font-size:.7em}\n.s-ft .to{color:var(--s-accent)}\n.s-ft small{font-size:.42em;color:var(--s-accent);font-weight:700}\n.s-cmp{display:flex;flex-direction:column;gap:1.6em}\n.s-cmp .s-ft{font-size:2.7em}\n.s-cmp .s-ft .to{color:#fff}\n.s-q{font-size:4.6em;line-height:.6;color:var(--s-label);font-weight:800;height:.5em}\n.s-quote{font-size:2.2em;font-weight:700;line-height:1.3}\n.s-rc{display:flex;flex-direction:column}\n.s-rc div{display:flex;justify-content:space-between;align-items:baseline;gap:1em;padding:1.1em 0;border-bottom:1px solid rgba(255,255,255,.1);font-family:var(--f-body);font-size:1.3em;color:rgba(255,255,255,.8)}\n.s-rc b{font-family:var(--f-display);font-size:1.35em;color:var(--s-accent);white-space:nowrap}\n.s-ph{position:absolute;inset:0;display:flex;flex-direction:column}\n.s-ph > div{flex:1;background:repeating-linear-gradient(135deg,#2A353B 0 1.2em,#222C31 1.2em 2.4em);position:relative;display:grid;place-items:center}\n.s-ph > div + div{border-top:2px solid rgba(255,255,255,.7)}\n.s-ph span{font-family:var(--f-body);font-size:1.1em;color:rgba(255,255,255,.4)}\n.s-ph em{position:absolute;left:1.6em;top:1.6em;font-style:normal;font-size:1em;font-weight:700;letter-spacing:.14em;text-transform:uppercase}\n.s-ph em.tag{background:var(--s-accent);color:#10301A;padding:.5em 1em;border-radius:99px;left:1.4em;top:1.2em}\n.s-shade{position:absolute;inset:auto 0 0 0;height:55%;background:linear-gradient(transparent,rgba(10,16,19,.92))}\n.sp-story .story{width:min(260px,100%)}\n.story.strip .sc{width:min(280px,72vw)}\n.story{--s-feature:#1F6B66}";
const CSS2=".pick .pk,.pick .sc{cursor:pointer}.pick .pk{border-radius:14px;outline:2px solid transparent;outline-offset:5px;transition:outline-color .12s}.pick .pk:hover:not(:has(.pk:hover)),.pick .pk:focus-visible{outline-color:#8DBBD0}.pick .pk.pksel{outline-color:#0B5A78}.pick .sc{border-radius:22px;outline:3px solid transparent;outline-offset:3px}.pick .sc:hover{outline-color:#8DBBD0}.pick .sc.pksel{outline-color:#0B5A78}.mini{pointer-events:none}.mini .rpt-head,.mini .rpt-foot{display:none}.mini .rpt{box-shadow:none;border-radius:0;width:520px;background:transparent}.mini .rpt-body{padding:6px}";
/* slots: a page writes <div class="sk-slot" data-sk="key"></div> and registers the html; fill() draws it in a shadow root */
const slots={};
function slot(key,html,cls,style){slots[key]={html,cls:cls||""};return `<div class="sk-slot" data-sk="${key}"${style?` style="${style}"`:""}></div>`}
function fill(){document.querySelectorAll(".sk-slot:not([data-done])").forEach(h=>{const d=slots[h.dataset.sk];if(!d)return;h.dataset.done=1;
  const sh=h.shadowRoot||h.attachShadow({mode:"open"});sh.innerHTML=`<style>${CSS}${CSS2}</style><div class="sk-root ${d.cls}">${d.html}</div><div id="tip"></div>`;
  const tip=sh.getElementById("tip");
  sh.addEventListener("pointermove",e=>{const t=e.target.closest&&e.target.closest("[data-tip]");
    sh.querySelectorAll(".xh").forEach(l=>{if(!t||!t.dataset.x||l.closest("svg")!==t.closest("svg"))l.setAttribute("opacity","0")});
    if(!t){tip.style.display="none";return}
    tip.innerHTML=t.dataset.tip;tip.style.display="block";
    if(t.dataset.x){const l=t.closest("svg").querySelector(".xh");if(l){l.setAttribute("x1",t.dataset.x);l.setAttribute("x2",t.dataset.x);l.setAttribute("opacity",".5")}}
    const r=tip.getBoundingClientRect();let x=e.clientX+14,y=e.clientY+14;if(x+r.width>innerWidth-8)x=e.clientX-r.width-14;if(y+r.height>innerHeight-8)y=e.clientY-r.height-14;tip.style.left=x+"px";tip.style.top=y+"px"});
  sh.addEventListener("pointerleave",()=>{tip.style.display="none"});
  sh.addEventListener("click",e=>{if(d.cls.indexOf("pick")>=0){const t=e.target.closest&&e.target.closest("[data-pk],.sc[data-el]");if(t){h.dispatchEvent(new CustomEvent("sk-pick",{detail:t.dataset.pk||t.dataset.el,bubbles:true}));return}}const b=e.target.closest&&e.target.closest("[data-snav]");if(b&&window.M&&M.acts.stnav)M.acts.stnav(b.dataset.snav)})})}
window.SK={css:CSS+CSS2,ILLOS:ILLOS.map(x=>[x[0],x[1],x[2]]),MEMBERS,GYM,PERIOD,TODAY,CATALOG,validate,renderEl,resolveToken,rt,esc,slot,fill,findIllo,fmtVal,
  render(spec,m,ctx){return renderEl(spec.root,Object.assign({spec,m},ctx||{}))}};
})();
