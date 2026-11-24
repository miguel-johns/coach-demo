/* Schedule: the day's sessions, the Session Panel, booking, and Setup.
   The Session Panel follows the Milton Session Panel design. Overrides, automatic check-out and
   "Ask for a spot" follow the Scheduling and Workout Designs. */
(function(){
  var esc=M.esc, $=M.$, fm=M.fm, TODAY=DB.TODAY;
  var DOW=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"], DOWL=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"], MON=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  var st={date:TODAY,view:"Day",sel:null,mode:"view",confirm:null,setup:null,auto:false,skipDue:true,remind:true,coach:"Everyone",bk:null,share:false,grp:null};
  var bucket={booked:"booked","in":"booked",out:"used",late:"used",noshow:"used",canceled:"open"};
  var label={booked:"Booked","in":"Checked in",out:"Checked out",late:"Late cancel",noshow:"No show",canceled:"Canceled"};
  var tone={booked:"","in":"mist",out:"ok",late:"warn",noshow:"warn",canceled:""};
  /* Milton's tools use the same session logic as this screen. */
  M.sessionsOn=sessions; M.dayISO=dayISO; M.toMin=toMin; M.apptLabel=label;
  M.addBooking=function(p,s,d,t,w){return addBooking(p,s,d,t,w)}; M.setStatus=function(p,a,s){return setStatus(p,a,s)};
  M.schedDay=function(iso){st.date=iso; st.view="Day"; st.sel=null};
  DB.openSessions=DB.openSessions||[];
  /* Sessions put on the calendar with nobody booked yet. */
  function openRows(iso){
    return DB.openSessions.filter(function(o){return o.iso===iso&&!sessions(iso).some(function(x){return x.a.time===o.time&&x.a.title===o.title&&x.a.status!=="canceled"})}).map(function(o){
      return [toMin(o.time),'<div class="row srow"><div class="when"><b>'+o.time+'</b><span>'+o.len+' min</span></div><span class="av">+</span><div class="what"><div class="t">Open, nobody booked yet</div><div class="m">'+esc(o.title.replace(/, \d+ min/,""))+", "+esc(o.where)+'</div></div></div>']});
  }

  function dow(iso){var a=iso.split("-");return new Date(Date.UTC(+a[0],+a[1]-1,+a[2])).getUTCDay()}
  function dayLabel(iso){return iso===TODAY?"Today":DOW[dow(iso)]+", "+M.fd(iso)}
  function longDay(iso){return DOWL[dow(iso)]+", "+M.fd(iso)}
  function dayISO(s){
    if(s==="Today") return TODAY;
    var m=/([A-Z][a-z]{2}) (\d+)/.exec(s.replace(/^[A-Za-z]+, /,"")); if(!m) return TODAY;
    return "2026-"+("0"+(MON.indexOf(m[1])+1)).slice(-2)+"-"+("0"+m[2]).slice(-2);
  }
  function toMin(t){var m=/(\d+):(\d+) (AM|PM)/.exec(t); var h=+m[1]%12+(m[3]==="PM"?12:0); return h*60+ +m[2]}
  function fromMin(n){var h=Math.floor(n/60)%24, m=n%60; return ((h+11)%12+1)+":"+("0"+m).slice(-2)+" "+(h<12?"AM":"PM")}
  function svcOf(a){return DB.SERVICES.filter(function(s){return a.title.indexOf(s.title.split(",")[0])===0})[0]||{len:60}}
  function lenOf(a){var m=/(\d+) min/.exec(a.title); return m?+m[1]:svcOf(a).len}
  function started(a){var d=dayISO(a.day); return d<TODAY||(d===TODAY&&toMin(a.time)<=DB.NOW)}
  function lateWin(a){var d=dayISO(a.day); return d<=TODAY||(d===M.addDays(TODAY,1)&&toMin(a.time)<DB.NOW)}
  function planOf(p,a){return a.plan?p.plans.filter(function(x){return x.id===a.plan})[0]:null}
  function counted(pl){return pl&&!pl.unlimited}

  /* Group sessions. People booked at the same time, with the same coach and service, are one session
     on the Day view. Each person keeps their own booking, credit, payment and status. */
  function gkeyOf(a){var s=svcOf(a); return dayISO(a.day)+"|"+a.time+"|"+(s.id||a.title)+"|"+a.where}
  function coming(x){return /^(booked|in|out)$/.test(x.a.status)}
  function owes(x){return !!(x.a.due&&!x.a.paid&&!x.a.plan)}
  function gmake(key,ms){var a=ms[0].a, s=svcOf(a); return {key:key,ms:ms,iso:dayISO(a.day),time:a.time,where:a.where,svc:s,len:lenOf(a),cap:s.cap||0,name:a.title.replace(/, \d+ min/,"")}}
  function group(key){ if(!key) return null; var ms=sessions(key.split("|")[0]).filter(function(x){return gkeyOf(x.a)===key}); return ms.length?gmake(key,ms):null}
  function inGroup(a){var g=group(gkeyOf(a)); return g&&g.ms.length>1?g:null}
  function dayParts(iso,coach){
    var list=sessions(iso).filter(function(x){return !coach||coach==="Everyone"||x.a.where.indexOf(M.first(coach))>=0}), by={}, order=[];
    list.forEach(function(x){var k=gkeyOf(x.a); if(!by[k]){by[k]=[]; order.push(k)} by[k].push(x)});
    var singles=[], groups=[];
    order.forEach(function(k){ if(by[k].length>1) groups.push(gmake(k,by[k])); else singles.push(by[k][0]) });
    return {list:list,singles:singles,groups:groups,count:singles.filter(function(x){return x.a.status!=="canceled"}).length+groups.length};
  }
  function asksOf(g){var k=DB.klass; return g&&g.iso===TODAY&&g.svc.id==="sgt"&&g.time===k.time?k:null}
  function sortAppts(p){p.appts.sort(function(x,y){return dayISO(x.day)<dayISO(y.day)?-1:(dayISO(x.day)>dayISO(y.day)?1:toMin(x.time)-toMin(y.time))})}
  function planFor(p,s){return p.plans.filter(function(x){return x.service===s.name})[0]}
  function addBooking(p,s,d,time,where){
    var pl=planFor(p,s), a={id:"b"+Date.now()+Math.floor(Math.random()*1000),day:dayLabel(d),today:d===TODAY,time:time,title:s.title,where:where||s.where,status:"booked"};
    if(pl&&(pl.unlimited||pl.open>0)){a.plan=pl.id; if(!pl.unlimited){pl.open--; pl.booked++}} else if(s.price) a.due=s.price; else a.free=true;
    p.appts.push(a); sortAppts(p); return a;
  }
  function creditText(x){
    var pl=planOf(x.p,x.a), a=x.a;
    if(counted(pl)) return pl.open+" left to book · "+pl.booked+" booked · "+pl.used+" used";
    if(pl) return "Unlimited";
    if(a.free) return "Free";
    if(owes(x)) return '<span style="color:var(--warn);font-weight:600">'+fm(a.due)+" due</span>";
    return a.due?"Paid "+fm(a.due):"";
  }
  function whenOf(g){return (g.iso===TODAY?"Fri, Nov 20":DOW[dow(g.iso)]+", "+M.fd(g.iso))+" · "+g.time}

  /* example group sessions for the fixed day: a class this evening and a semi-private that ran at noon */
  (function(){
    var S=DB.SERVICES.filter(function(x){return x.id==="sgt"})[0]; if(!S) return;
    var put=function(id,pl,a,tx){var p=M.person(id); if(!p) return; if(pl) p.plans.push(pl); if(tx) p.tx.push(tx); a.day="Today"; a.today=true; a.time="5:30 PM"; a.title=S.title; a.where=S.where; a.status="booked"; p.appts.push(a); sortAppts(p)};
    put("leah",{id:"sg",name:"Small Group 10-pack",kind:"Pack",service:S.name,price:"$200.00",amt:200,size:10,when:"Bought Oct 12, expires Jan 12, 2027",open:6,booked:1,used:3},{id:"g1",plan:"sg"},["Oct 12","Small Group 10-pack","Mastercard ending 8210","$200.00"]);
    put("chris",{id:"sgu",name:"Small Group Unlimited",kind:"Membership",service:S.name,price:"$129.00 a month",amt:129,start:"2026-10-09",next:"2026-12-09",unlimited:true,dates:true},{id:"g2",plan:"sgu"});
    put("billy",{id:"sg",name:"Small Group 10-pack",kind:"Pack",service:S.name,price:"$200.00",amt:200,size:10,when:"Bought Oct 30, expires Jan 30, 2027",open:2,booked:1,used:7},{id:"g3",plan:"sg"},["Oct 30","Small Group 10-pack","Visa ending 2204","$200.00"]);
    put("devon",null,{id:"g4",due:S.price});
    var past=function(id,aid,status,out){var p=M.person(id); if(!p) return; var a={id:aid,day:"Today",today:true,time:"12:00 PM",title:"Semi-private training",where:"with Coach Tori",plan:"sp",status:status}; p.visits.unshift(["Fri, Nov 20","12:00 PM",a.title,out,a])};
    past("dana","g5","out","Checked out"); past("leah","g6","late","Late cancel, credit used");
  })();

  /* every session on a date: upcoming ones from each person, plus ones finished today */
  function sessions(iso){
    var out=[];
    M.people().forEach(function(p){
      p.appts.forEach(function(a){ if(dayISO(a.day)===iso) out.push({p:p,a:a}) });
      p.visits.forEach(function(v){ if(v[4]&&dayISO(v[4].day)===iso) out.push({p:p,a:v[4]}) });
    });
    return out.sort(function(x,y){return toMin(x.a.time)-toMin(y.a.time)});
  }
  function find(key){var m=key.split("|"), p=M.person(m[0]); if(!p) return null; var a=p.appts.filter(function(x){return x.id===m[1]})[0]; if(!a){var v=p.visits.filter(function(x){return x[4]&&x[4].id===m[1]})[0]; a=v&&v[4]} return a?{p:p,a:a}:null}
  function outcome(p,a){var pl=planOf(p,a), c=counted(pl); return {out:"Checked out",late:"Late cancel"+(c?", credit used":""),noshow:"No show"+(c?", credit used":""),canceled:"Canceled"}[a.status]}

  /* one place that changes a session's status and keeps credits and the record in step */
  function setStatus(p,a,s){
    var pl=planOf(p,a);
    if(counted(pl)){pl[bucket[a.status]]--; pl[bucket[s]]++}
    a.status=s;
    p.visits=p.visits.filter(function(v){return v[4]!==a});
    p.appts=p.appts.filter(function(x){return x!==a});
    if(s==="booked"||s==="in") {p.appts.push(a); p.appts.sort(function(x,y){return (dayISO(x.day)+("000"+toMin(x.time)).slice(-4))<(dayISO(y.day)+("000"+toMin(y.time)).slice(-4))?-1:1})}
    else p.visits.unshift([a.day==="Today"?"Fri, Nov 20":a.day,a.time,a.title,outcome(p,a),a]);
    if(s==="out"&&pl&&pl.queued&&pl.open===0&&pl.booked===0){pl.open=pl.size; pl.used=0; pl.queued=false; p.tx.unshift(["Nov 20",pl.name,p.card||"Cash",fm(pl.amt)]); return "Checked out and renewed. "+pl.open+" "+pl.service.toLowerCase()+" credits left to book."}
    return null;
  }
  function checkIn(p,a){setStatus(p,a,"in"); return p.first+" is checked in. No credit used yet."}
  function checkOut(p,a){var pl=planOf(p,a), r=setStatus(p,a,"out"); return r||("Checked out."+(counted(pl)?" 1 "+pl.service.toLowerCase()+" credit used, "+pl.open+" left to book.":""))}
  M.sess={set:setStatus,checkIn:checkIn,checkOut:checkOut,dayISO:dayISO,find:find,
    open:function(pid,aid){st.sel=pid+"|"+aid; st.mode="view"; st.confirm=null; M.openPanel("session")},
    book:function(pid){var d0=st.date<TODAY?TODAY:st.date; st.bk={pid:pid||null,q:"",svc:null,date:d0,from:d0,time:null,repeat:false,extra:false,off:false}; M.openPanel("book")}};

  function creditLine(p,a){
    var pl=planOf(p,a);
    if(counted(pl)) return '<div class="m">'+pl.open+" left to book · "+pl.booked+" booked · "+pl.used+' used</div>';
    if(pl) return '<div class="m">'+esc(pl.name)+'</div>';
    if(a.free) return '<div class="m">Free</div>';
    if(a.due&&!a.paid) return '<div class="m" style="color:var(--warn);font-weight:600">'+fm(a.due)+' due</div>';
    return a.due?'<div class="m">Paid '+fm(a.due)+'</div>':"";
  }
  function rowHTML(x,showDay){
    var p=x.p,a=x.a,key=p.id+"|"+a.id;
    var quick=a.status==="booked"&&dayISO(a.day)===TODAY?'<button class="btn sm" data-act="rowin" data-id="'+key+'">Check in</button>':'<span class="chip '+tone[a.status]+'">'+label[a.status]+'</span>';
    return '<div class="row srow'+(a.status==="canceled"?" dim":"")+'" data-act="sessopen" data-id="'+key+'"><div class="when"><b>'+(showDay?a.day+" · ":"")+a.time+'</b><span>'+lenOf(a)+' min</span></div><span class="av">'+p.initials+'</span><div class="what"><div class="t">'+esc(p.name)+(a.staff?' <span class="chip mist">Staff booked</span>':"")+(a.auto?' <span class="chip">Auto</span>':"")+'</div><div class="m">'+esc(a.title.replace(/, \d+ min/,""))+(/^with /.test(a.where)?" ":", ")+esc(a.where)+'</div>'+creditLine(p,a)+'</div><div class="acts">'+quick+'</div></div>';
  }
  function groupRow(g){
    var live=g.ms.filter(coming), inn=live.filter(function(x){return x.a.status==="in"}).length, arr=live.filter(function(x){return x.a.status==="booked"}).length, ow=live.filter(owes).length, k=asksOf(g);
    return '<div class="row srow" data-act="gopen" data-id="'+esc(g.key)+'"><div class="when"><b>'+g.time+'</b><span>'+g.len+' min</span></div><span class="av grp" aria-hidden="true">'+live.length+'</span><div class="what"><div class="t">'+esc(g.name)+'</div><div class="m">'+esc(g.where)+'</div><div class="m">'+live.length+(g.cap?" of "+g.cap:"")+" booked · "+inn+" checked in"+(ow?' · <span style="color:var(--warn);font-weight:600">'+ow+" payment due</span>":"")+(k&&k.asks.length?' · <span style="color:var(--warn);font-weight:600">'+k.asks.length+" asking for a spot</span>":"")+'</div></div><div class="acts"><span class="chip'+(arr?"":(live.length?" ok":""))+'">'+(arr?arr+" to arrive":(live.length?"All here":"Nobody coming"))+'</span></div></div>';
  }
  function dayHTML(){
    var d=dayParts(st.date,st.coach), list=d.list, isToday=st.date===TODAY;
    var h='<div class="m" style="margin:10px 0 2px"><b>'+d.count+"</b> "+(d.count===1?"session":"sessions")+" · <b>"+list.filter(function(x){return x.a.status==="booked"}).length+"</b> to arrive · <b>"+list.filter(function(x){return x.a.status==="in"}).length+"</b> checked in"+(st.auto&&isToday?' · <span class="chip ok">Automatic check-out is on</span>':"")+'</div>';
    var rows=d.singles.map(function(x){return [toMin(x.a.time),rowHTML(x)]}).concat(d.groups.map(function(g){return [toMin(g.time),groupRow(g)]})).concat(openRows(st.date));
    rows.sort(function(a,b){return a[0]-b[0]});
    h+=rows.map(function(r){return r[1]}).join("");
    if(!rows.length) h+='<div class="empty" style="border-top:1px solid var(--line);margin-top:8px;padding-top:16px"><span>Nothing booked this day.</span><button class="btn sm" data-act="booknow">Book a session</button></div>';
    return h;
  }
  function weekStart(iso){return M.addDays(iso,-((dow(iso)+6)%7))}
  function weekHTML(){
    var s=weekStart(st.date), h='<div class="wk">';
    for(var i=0;i<7;i++){
      var d=M.addDays(s,i), list=sessions(d);
      h+='<button class="wkd'+(d===TODAY?" today":"")+'" data-act="sday" data-id="'+d+'"><span class="k">'+DOW[dow(d)]+" "+(+d.slice(8))+'</span>'+(list.length?list.slice(0,4).map(function(x){return '<span class="wks"><b>'+x.a.time.replace(":00","")+"</b> "+esc(x.p.first)+'</span>'}).join("")+(list.length>4?'<span class="m">'+(list.length-4)+" more</span>":""):"")+'</button>';
    }
    return h+'</div>';
  }
  function listHTML(){
    var all=[]; for(var i=0;i<14;i++) all=all.concat(sessions(M.addDays(TODAY,i)));
    return all.length?all.map(function(x){return rowHTML(x,true)}).join(""):'<div class="empty"><span>Nothing booked in the next two weeks.</span></div>';
  }
  function setupHTML(){
    var row=function(id,name,val,body){var on=st.setup===id; return '<div class="row" style="cursor:pointer" data-act="ssetup" data-id="'+id+'"><div class="what"><div class="t">'+name+'</div></div><span class="m">'+val+" "+(on?"⌃":"⌄")+'</span></div>'+(on?'<div style="padding:0 0 14px">'+body+'</div>':"")};
    var sw=function(k,name,sub){return '<div class="row"><div class="what"><div class="t" style="font-weight:500">'+name+'</div><div class="m">'+sub+'</div></div><button class="sw" role="switch" aria-checked="'+st[k]+'" aria-label="'+name+'" data-act="ssw" data-id="'+k+'"></button></div>'};
    return '<section class="card" style="margin-top:16px"><div class="ch"><h3>Setup</h3><span class="m">Calendars, hours and check-out. You will not need these often.</span></div>'
      +row("cal","Connected calendars","5 connected",DB.TEAM.map(function(t){return '<div class="row"><div class="what"><div class="t" style="font-weight:500">'+t.name+'</div><div class="m">Google Calendar · '+t.email+'</div></div><span class="chip ok">Connected</span></div>'}).join(""))
      +row("hours","Hours","Mon to Fri · 5:00 AM to 8:00 PM, Sat · 8:00 AM to 1:00 PM",'<div class="k" style="margin:4px 0">Date overrides</div><div class="m">Days that are closed or run different hours. Past ones drop off on their own.</div>'+DB.overrides.map(function(o,i){return '<div class="row"><div class="what"><div class="t" style="font-weight:500">'+o[0]+'</div><div class="m">'+o[1]+'</div></div><span class="chip '+o[3]+'">'+o[2]+'</span><button class="btn sm rm" data-act="ovrm" data-id="'+i+'">Remove</button></div>'}).join("")+'<div style="margin-top:8px"><button class="btn sm" data-act="panel" data-id="override">+ Add an override</button></div>')
      +row("out","Check-out",st.auto?"Automatic":"By hand",'<div class="seg"><button data-act="sauto" data-id="" aria-pressed="'+(!st.auto)+'">By hand</button><button data-act="sauto" data-id="1" aria-pressed="'+st.auto+'">Automatic</button></div>'+(st.auto?'<div class="infobox" style="margin:10px 0">Each session is checked in and out when it ends, and the credit or session is recorded. Sessions already marked as a no show or cancel are left alone.</div>'+sw("skipDue","Skip sessions with a payment due","They stay open and flagged until someone takes payment.")+sw("remind","Remind me to review the day","A note in the brief each evening with anything that needs a look."):'<p class="m" style="margin:10px 0 0">Your team checks each person out. Turn on Automatic to have sessions check themselves out when they end.</p>'))
      +row("svc","Services",DB.SERVICES.filter(function(x){return (x.status||"Live")==="Live"}).length+" live",'<div class="m">Everything that can be booked comes from Services & Packages.</div><div style="margin-top:8px"><button class="btn sm" data-act="go" data-id="services">Open Services & Packages</button></div>')
      +'</section>';
  }
  M.pages.schedule={
    title:"Schedule",
    top:function(){return ["booknow","+ Book"]},
    render:function(){
      var h='<section class="card"><div class="ch"><h3>'+(st.view==="List"?"Next two weeks":(st.view==="Week"?"Week of "+M.fd(weekStart(st.date)):longDay(st.date)))+(st.date===TODAY&&st.view==="Day"?' <span class="chip mist">Today</span>':"")+'</h3><div class="acts">'
        +'<select class="csel" id="scoach" aria-label="Show sessions for">'+["Everyone"].concat(DB.TEAM.filter(function(t){return t.role==="Coach"}).map(function(t){return t.name})).map(function(n){return '<option'+(n===st.coach?" selected":"")+'>'+n+'</option>'}).join("")+'</select>'
        +'<div class="seg">'+["Day","Week","List"].map(function(v){return '<button data-act="sview" data-id="'+v+'" aria-pressed="'+(st.view===v)+'">'+v+'</button>'}).join("")+'</div>'
        +(st.view==="List"?"":'<button class="ico" data-act="snav" data-id="-1" aria-label="Previous">&#8249;</button><button class="ico" data-act="snav" data-id="1" aria-label="Next">&#8250;</button><button class="btn sm" data-act="sday" data-id="'+TODAY+'">Today</button>')
        +'<button class="btn sm" data-act="panel" data-id="share">Share your booking page</button></div></div>';
      h+=st.view==="Day"?dayHTML():(st.view==="Week"?weekHTML():listHTML());
      return h+'<div class="m" style="margin-top:12px">Central Time</div></section>'+setupHTML();
    },
    brief:function(){
      var list=sessions(TODAY), due=[];
      M.people().forEach(function(p){p.appts.forEach(function(a){if(a.due&&!a.paid) due.push(p.first+" "+fm(a.due)+" on "+a.day)})});
      return {hd:M.plural(dayParts(TODAY).count,"session")+" today. "+list.filter(function(x){return x.a.status==="booked"}).length+" still to arrive.",
        items:["Devon Marsh's 4:00 PM has started and he is not checked in.","Small Group Training at 5:30 PM has "+M.plural(DB.klass.asks.length,"person","people")+" asking for a spot.",due.length?"Payment due: "+due.join(", ")+".":"No payments due on upcoming sessions.","Closed Thu, Nov 26 for Thanksgiving. Short hours on Fri, Nov 27."],
        hint:"Ask Milton about your schedule",sugg:["Who has not checked in?","Book a session"]};
    },
    ask:function(q){ if(/book/i.test(q)){M.sess.book(); M.say(q,"I opened booking. Tell me who and when and I will fill it in."); return true} return false }
  };

  /* Session Panel */
  M.panels.session=function(){
    var x=find(st.sel); if(!x) return "";
    var p=x.p,a=x.a,pl=planOf(p,a),credit=counted(pl),h="",iso=dayISO(a.day);
    var whenLine=(iso===TODAY?"Fri, Nov 20":a.day)+" · "+a.time+" to "+fromMin(toMin(a.time)+lenOf(a));
    var grp=inGroup(a), from=st.grp?group(st.grp):null, back=from?'<button class="link" data-act="gback">&#8249; '+esc(from.name)+", "+from.time+'</button>':"";
    if(st.mode==="edit"){
      var days=[]; for(var i=0;i<8;i++) days.push(M.addDays(TODAY,i));
      if(days.indexOf(iso)<0) days.unshift(iso);
      var times=(svcOf(a).times||[]).slice(); if(times.indexOf(a.time)<0) times.unshift(a.time);
      h+='<div class="sph"><div><button class="link" data-act="smode" data-id="view">&#8249; Back to session</button><h3 style="margin-top:6px">Edit session</h3><div class="m">'+esc(p.name)+" · "+esc(a.title)+'</div></div>'+M.px+'</div><div class="spb">'+(grp?'<div class="box">To move '+esc(p.first)+' to another time, go back and use Reschedule. It keeps the same credit booked.</div>':'<div class="two"><div class="field"><label for="eDay">Day</label><select id="eDay">'+days.map(function(d){return '<option value="'+d+'"'+(d===iso?" selected":"")+'>'+(d===TODAY?"Today, ":"")+DOW[dow(d)]+", "+M.fd(d)+'</option>'}).join("")+'</select></div><div class="field"><label for="eTime">Time</label><select id="eTime">'+times.map(function(t){return '<option'+(t===a.time?" selected":"")+'>'+t+'</option>'}).join("")+'</select></div></div>')
        +'<div class="field"><label for="ePlan">Paid with</label><select id="ePlan"><option>'+(pl?esc(pl.name):(a.free?"Free":"Pay at the session"))+'</option>'+(pl?'<option>Pay at the session</option>':"")+'</select></div>'
        +'<div class="field"><label for="eStatus">Status</label><select id="eStatus">'+["booked","in","out","late","noshow","canceled"].map(function(s){return '<option value="'+s+'"'+(s===a.status?" selected":"")+'>'+label[s]+'</option>'}).join("")+'</select></div><div class="field"><label for="eWhy">Reason, if you are correcting the status</label><input id="eWhy" type="text"></div>'
        +'<div style="border-top:1px solid var(--line);padding-top:14px">'+(st.confirm==="remove"?'<div class="confirmbox red"><b>Remove this session?</b><div>It comes off the schedule with no history.'+(credit?" The credit goes back to left to book.":"")+' Payments stay as they are.</div><div class="acts" style="margin-top:10px"><button class="btn dangerfill sm" data-act="sremove">Remove session</button><button class="btn sm" data-act="sconfirm" data-id="">Keep session</button></div></div>':'<button class="btn danger sm" data-act="sconfirm" data-id="remove">Remove session</button><div class="m" style="margin-top:6px">For a session booked by mistake. To keep a record, cancel it instead.</div>')+'</div></div>'
        +'<div class="spf"><button class="btn pri" data-act="ssave">Save changes</button><button class="btn" data-act="smode" data-id="view">Cancel</button></div>';
      return h;
    }
    h+='<div class="sph"><div>'+back+'<h3'+(back?' style="margin-top:6px"':"")+'><button class="link" style="font:inherit;color:var(--navy);text-decoration:underline;text-decoration-color:var(--mist-line);text-underline-offset:4px" data-act="record" data-id="'+p.id+'">'+esc(p.name)+'</button></h3><div class="m">'+whenLine+'</div><div class="m">'+esc(a.title)+(/^with /.test(a.where)?" ":", ")+esc(a.where)+(a.staff?" · Staff booked, outside open hours":"")+'</div></div>'+M.px+'</div><div class="spb"><div class="crow"><span class="chip '+tone[a.status]+'">'+label[a.status]+'</span><button class="link" data-act="smode" data-id="edit">Edit</button></div>';
    if(counted(pl)){
      var pips="",j; for(j=0;j<pl.open;j++) pips+='<span class="pip"></span>'; for(j=0;j<pl.booked;j++) pips+='<span class="pip b"></span>'; for(j=0;j<pl.used;j++) pips+='<span class="pip u"></span>';
      h+='<div class="box" style="background:var(--panel);border:1px solid var(--line)"><div class="t">'+esc(pl.name)+'</div><div class="big" style="font-size:24px;font-weight:700;margin-top:4px">'+pl.open+' left to book</div><div class="pips" aria-hidden="true">'+pips+'</div><div class="m">'+pl.booked+" booked · "+pl.used+" used · "+(pl.next?"Renews "+M.fd(pl.next):pl.when)+'</div></div>';
    } else if(pl) h+='<div class="box" style="background:var(--panel);border:1px solid var(--line)"><div class="t">'+esc(pl.name)+'</div><div class="m">Unlimited. No credits to track.</div></div>';
    else if(a.free) h+='<div class="box" style="background:var(--panel);border:1px solid var(--line)"><div class="t">Free session</div><div class="m">Nothing to pay.</div></div>';
    else if(a.paid) h+='<div class="box" style="background:var(--panel);border:1px solid var(--line)"><div class="t">Paid at the session</div><div class="m">'+fm(a.due)+' paid.</div></div>';
    else h+='<div class="warnbox"><div class="t">No package covers this session</div><div class="big" style="font-size:24px;font-weight:700;margin-top:4px">'+fm(a.due)+' due</div><div class="m" style="color:inherit">Take payment at check-out, or sell a package.</div></div>';
    var late=lateWin(a);
    if(st.confirm==="cancel") h+='<div class="confirmbox"><b>'+(late?"Late cancel this session?":"Cancel this session?")+'</b><div>'+(late?"It is inside the 24 hour window"+(credit?", so 1 credit is used.":"."):"It is outside the 24 hour window."+(credit?" The credit goes back to left to book.":""))+'</div><div class="acts" style="margin-top:10px"><button class="btn pri sm" data-act="scancel">'+(late?"Late cancel":"Cancel session")+'</button><button class="btn sm" data-act="sconfirm" data-id="">Keep session</button></div></div>';
    else if(st.confirm==="noshow") h+='<div class="confirmbox"><b>Mark '+esc(p.first)+' as a no show?</b><div>'+(credit?"1 credit is used.":"The session is closed with nothing charged.")+'</div><div class="acts" style="margin-top:10px"><button class="btn pri sm" data-act="snoshow">Mark no show</button><button class="btn sm" data-act="sconfirm" data-id="">Keep session</button></div></div>';
    else if(a.status==="booked") h+='<div class="acts3"><button class="opt" data-act="'+(grp?"gmove":"smode")+'" data-id="edit"><b>Reschedule</b><span class="m">No credit used</span></button><button class="opt" data-act="sconfirm" data-id="cancel"><b>'+(late?"Late cancel":"Cancel")+'</b><span class="m">'+(credit?(late?"Uses 1 credit":"No credit used"):"Nothing charged")+'</span></button>'+(started(a)?'<button class="opt" data-act="sconfirm" data-id="noshow"><b>No show</b><span class="m">'+(credit?"Uses 1 credit":"Nothing charged")+'</span></button>':"")+'</div>';
    else if(a.status==="in") h+='<div class="box">'+esc(p.first)+' is here. No credit is used until check-out.</div>';
    else h+='<div class="box">'+{out:"Checked out."+(credit?" 1 credit used.":""),late:"Late cancel."+(credit?" 1 credit used.":""),noshow:"No show."+(credit?" 1 credit used.":""),canceled:"Canceled."+(credit?" The credit went back to left to book.":"")}[a.status]+' To correct this, use Edit.</div>';
    var doc=p.docs.filter(function(d){return d.status!=="signed"})[0];
    if(/^(Semi-private|Personal training)/i.test(a.title)&&dayISO(a.day)===TODAY&&DB.CP&&DB.CP.progOn(DB.CP.get(p.id),TODAY)&&a.status!=="out") h+='<div class="infobox dban"><span>Today\'s workout is ready to run.</span><button class="btn sm" data-act="lwopen" data-id="'+p.id+'">Start workout</button></div>';
    if(doc) h+='<div class="alert" style="margin:0"><span>'+M.plural(p.docs.filter(function(d){return d.status!=="signed"}).length,"document")+' missing: '+esc(doc.name)+'.</span><button class="btn sm" data-act="dsign" data-id="'+p.id+'">Sign on this device</button></div>';
    h+='</div>';
    var main="";
    if(a.status==="booked"&&iso===TODAY) main='<button class="btn pri" data-act="sin">Check in</button>';
    else if(a.status==="in") main=(a.due&&!a.paid)?'<button class="btn pri" data-act="spayout">Pay '+fm(a.due)+' and check out</button>':'<button class="btn pri" data-act="sout">Check out</button>';
    var second=(counted(pl)&&pl.open===0)?'<button class="btn hl" data-act="srenew">Renew '+esc(pl.name.replace(/^.* (\d+-pack)$/,"$1"))+'</button>':'<button class="btn" data-act="stake">Take payment</button>';
    return h+'<div class="spf" style="justify-content:space-between"><div>'+main+'</div><div class="acts"><button class="btn" data-act="sbooknext">Book next</button>'+second+'</div></div>';
  };

  /* booking */
  /* open hours for a date, in minutes, or null when closed */
  function bkHours(d){ if(d==="2026-11-26") return null; if(d==="2026-11-27") return [600,840]; var w=dow(d); return w===0?null:(w===6?[480,780]:[300,1200]) }
  function bkWhy(d){return d==="2026-11-26"?"Closed for Thanksgiving":"Closed on Sundays"}
  function bkPerson(){return st.bk&&st.bk.pid?M.person(st.bk.pid):null}
  function bkHits(){
    var b=st.bk, q=b.q.toLowerCase(), g=b.lock?group(b.lock):null, on=g?g.ms.filter(coming).map(function(x){return x.p.id}):[];
    var hits=q?M.people().filter(function(c){return (c.name+" "+c.email+" "+c.phone).toLowerCase().indexOf(q)>=0}).slice(0,5):(g?M.people().filter(function(c){return on.indexOf(c.id)<0&&planFor(c,g.svc)}).slice(0,5):[]);
    return (g&&!q&&hits.length?'<div class="k">Has a package for this</div>':"")+hits.map(function(c){var here=on.indexOf(c.id)>=0; return '<button class="opt" data-act="bkpick" data-id="'+c.id+'"'+(here?" disabled":"")+'><b>'+esc(c.name)+'</b><span class="m">'+(here?"Already on this session":M.status(c))+'</span></button>'}).join("");
  }
  function paidBox(p,s){
    var pl=planFor(p,s);
    return '<div class="k">Paid with</div><div class="box">'+(pl?(pl.unlimited?'<div class="t">'+esc(pl.name)+'</div><div class="m">Unlimited</div>':(pl.open>0?'<div class="t">'+esc(pl.name)+'</div><div class="m">Books 1 credit. '+pl.open+' left to book now. Nothing is used until check-out.</div>':'<div class="t">'+esc(pl.name)+' has 0 left to book</div><div class="m">'+fm(s.price)+' will be due at check-in, or renew the pack.</div>')):(s.price?'<div class="t">No package covers this</div><div class="m">'+fm(s.price)+' will be due at check-in.</div>':'<div class="t">Free</div><div class="m">Nothing to pay.</div>'))+'</div>';
  }
  M.panels.book=function(){
    var b=st.bk, p=bkPerson(), g=b.lock?group(b.lock):null, mv=b.move?find(b.move):null, from=b.back==="roster"?g:(st.grp?group(st.grp):null);
    var back=b.back?'<button class="link" data-act="bkback">&#8249; '+(b.back==="roster"&&from?esc(from.name)+", "+from.time:"Back to session")+'</button>':"";
    var h='<div class="sph"><div>'+back+'<h3'+(back?' style="margin-top:6px"':"")+'>'+(g?"Add a person":(mv?"Reschedule":"Book a session"))+'</h3><div class="m">'+(g?esc(g.name)+" · "+whenOf(g):(p?esc(p.name)+(mv?" · "+esc(mv.a.title.replace(/, \d+ min/,"")):""):"Pick a person first"))+'</div></div>'+M.px+'</div><div class="spb">';
    if(!p){
      return h+'<div class="field"><label for="bkq">Person</label><input id="bkq" type="search" placeholder="Name, phone or email" autocomplete="off" autofocus value="'+esc(b.q)+'"></div><div id="bkhits" class="stack" style="display:grid;gap:8px">'+bkHits()+'</div><div class="m">'+(g?"This session is already chosen. Pick the person and they are on it. ":"")+'Not in Milton yet? Add them from Contacts, then book.</div></div>';
    }
    if(g){
      var live=g.ms.filter(coming).length, over=g.cap&&live>=g.cap;
      return h+'<div class="crow"><div class="nmc"><span class="av">'+p.initials+'</span><b>'+esc(p.name)+'</b></div><button class="link" data-act="bkpick" data-id="">Change</button></div>'
        +'<div class="k">Session</div><div class="box"><div class="t">'+esc(g.name)+'</div><div class="m">'+whenOf(g)+" · "+esc(g.where)+'</div><div class="m">'+live+(g.cap?" of "+g.cap:"")+' booked</div></div>'
        +paidBox(p,g.svc)+(over?'<div class="warnbox">This session is full. Adding '+esc(p.first)+' puts it at '+(live+1)+" of "+g.cap+'.</div>':"")
        +'</div><div class="spf"><button class="btn pri" data-act="bkdo">'+(over?"Add over the limit":"Add to session")+'</button><button class="btn" data-act="bkback">Cancel</button></div>';
    }
    var SV=DB.SERVICES.filter(function(x){return x.status!=="Draft"&&x.status!=="Archived"});
    if(!b.svc&&!b.asked){b.asked=true; var own=SV.filter(function(x){return p.plans.some(function(pl){return pl.service===x.name})})[0]; if(own) b.svc=own.id}
    if(mv){var ms=svcOf(mv.a); b.svc=ms.id; h+='<div class="k">Moving</div><div class="box"><div class="t">'+esc(mv.a.title.replace(/, \d+ min/,""))+'</div><div class="m">Now '+(dayISO(mv.a.day)===TODAY?"Fri, Nov 20":mv.a.day)+" · "+mv.a.time+" · "+esc(mv.a.where)+'</div></div><div class="k">Other times for this service</div>'}
    else h+='<div class="crow"><div class="nmc"><span class="av">'+p.initials+'</span><b>'+esc(p.name)+'</b></div><button class="link" data-act="bkpick" data-id="">Change</button></div><div class="field"><label for="bksvc">Service</label><select id="bksvc" data-bksvc="1"><option value="">Choose a service</option>'+["1-on-1","Group","Room"].map(function(k){var g=SV.filter(function(x){return (x.kind||"1-on-1")===k}); return g.length?'<optgroup label="'+(k==="Room"?"Rooms and open gym":(k==="Group"?"Classes and small groups":"1-on-1"))+'">'+g.map(function(x){return '<option value="'+x.id+'"'+(b.svc===x.id?" selected":"")+'>'+esc(x.name)+", "+x.len+' min</option>'}).join("")+'</optgroup>':""}).join("")+'</select></div>';
    var s=DB.SERVICES.filter(function(x){return x.id===b.svc})[0];
    if(s){
      var days=[], i; for(i=0;i<7;i++) days.push(M.addDays(b.from,i));
      var MONL=["January","February","March","April","May","June","July","August","September","October","November","December"], hr=bkHours(b.date), has=function(d){return p.appts.some(function(a){return dayISO(a.day)===d})};
      h+='<div class="bk-cal"><div class="crow"><b>'+MONL[+b.date.slice(5,7)-1]+" "+b.date.slice(0,4)+'</b><span class="acts"><button class="btn sm bk-arr" data-act="bkweek" data-id="-1" aria-label="Earlier days"'+(b.from<=TODAY?" disabled":"")+'>&#8249;</button><button class="btn sm bk-arr" data-act="bkweek" data-id="1" aria-label="Later days">&#8250;</button><label class="btn sm quiet" style="cursor:pointer">Pick a date<input type="date" class="vh" data-bkdate="1" min="'+TODAY+'" value="'+b.date+'"></label></span></div><div class="bk-days">'+days.map(function(d){var c=!bkHours(d); return '<button data-act="bkday" data-id="'+d+'" aria-pressed="'+(b.date===d)+'" class="'+(c?"closed":"")+'" aria-label="'+DOW[dow(d)]+", "+M.fd(d)+(c?", closed":"")+(has(d)?", already has a session":"")+'"><span>'+(d===TODAY?"Today":DOW[dow(d)])+'</span><b>'+(+d.slice(8))+'</b><i>'+(c?"Closed":(has(d)?"&bull;":"&nbsp;"))+'</i></button>'}).join("")+'</div></div>';
      var all=s.times.filter(function(t){return (b.date!==TODAY||toMin(t)>DB.NOW-240)&&!(mv&&b.date===dayISO(mv.a.day)&&t===mv.a.time)}), inH=all.filter(function(t){return hr&&toMin(t)>=hr[0]&&toMin(t)+s.len<=hr[1]}), out=all.filter(function(t){return inH.indexOf(t)<0});
      ["5:00 AM","8:30 PM"].forEach(function(t){ if(out.indexOf(t)<0&&inH.indexOf(t)<0&&(b.date!==TODAY||toMin(t)>DB.NOW)&&!(hr&&toMin(t)>=hr[0]&&toMin(t)+s.len<=hr[1])) out.push(t) }); out.sort(function(x,y){return toMin(x)-toMin(y)});
      var tbtn=function(t,off){return '<button data-act="bktime" data-id="'+t+(off?"|off":"")+'" aria-pressed="'+(b.time===t)+'"'+(off?' class="off"':"")+'>'+t+'</button>'};
      h+='<div class="crow"><b>'+(b.date===TODAY?"Today, ":"")+DOW[dow(b.date)]+", "+M.fd(b.date)+'</b><span class="m">'+(hr?M.plural(inH.length,"open time"):bkWhy(b.date))+'</span></div>';
      [["Morning",0,720],["Afternoon",720,1020],["Evening",1020,1440]].forEach(function(g){var ts=inH.filter(function(t){return toMin(t)>=g[1]&&toMin(t)<g[2]}); if(ts.length) h+='<div class="k">'+g[0]+'</div><div class="bk-times">'+ts.map(function(t){return tbtn(t,false)}).join("")+'</div>'});
      if(!inH.length) h+='<div class="m">'+(hr?"No open times left for "+esc(s.name.toLowerCase())+" this day.":"No open times. "+bkWhy(b.date)+".")+'</div>';
      if(out.length) h+=b.extra?'<div class="bk-extra"><div class="crow"><span class="k">Outside open hours</span><button class="link" data-act="bkextra">Hide</button></div><div class="bk-times">'+out.map(function(t){return tbtn(t,true)}).join("")+'</div><div class="m">Only Admins can book these. The time stays closed on your booking page.</div></div>':'<button class="link bk-more" data-act="bkextra">Need a time outside open hours?</button>';
      if(b.off&&b.time) h+='<div class="warnbox">'+b.time+' is outside your open hours. Only this booking is added.</div>';
      if(mv){var mpl=planOf(mv.p,mv.a); h+='<div class="k">Paid with</div><div class="box">'+(counted(mpl)?'<div class="t">'+esc(mpl.name)+'</div><div class="m">Keeps the same credit booked. No credit is used.</div>':(mpl?'<div class="t">'+esc(mpl.name)+'</div><div class="m">Unlimited. Nothing changes.</div>':(owes(mv)?'<div class="t">'+fm(mv.a.due)+' due</div><div class="m">Still due at check-in. Nothing is charged for moving.</div>':'<div class="t">Nothing changes</div><div class="m">No credit is used for moving.</div>')))+'</div>'}
      else {
        h+=paidBox(p,s);
        if(s.id==="semi"||s.id==="og") h+='<div class="row"><div class="what"><div class="t" style="font-weight:500">Repeat weekly for 4 weeks</div></div><button class="sw" role="switch" aria-checked="'+b.repeat+'" aria-label="Repeat weekly" data-act="bkrep"></button></div>';
      }
    }
    if(mv) return h+'</div><div class="spf"><button class="btn pri" data-act="bkdo"'+(b.time?"":" disabled")+'>Move session</button><button class="btn" data-act="bkback">Cancel</button></div>';
    return h+'</div><div class="spf"><button class="btn pri" data-act="bkdo"'+(s&&b.time?"":" disabled")+'>'+(b.off?"Book anyway":"Book session")+'</button><button class="btn" data-act="pclose">Cancel</button></div>';
  };
  function rosRow(x){
    var p=x.p, a=x.a, key=p.id+"|"+a.id, btn;
    if(a.status==="booked") btn=dayISO(a.day)===TODAY?'<button class="btn sm" data-act="gin" data-id="'+key+'">Check in</button>':'<span class="chip">Booked</span>';
    else if(a.status==="in") btn=owes(x)?'<button class="btn sm hl" data-act="gpay" data-id="'+key+'">Pay '+fm(a.due)+' and check out</button>':'<button class="btn sm" data-act="gout" data-id="'+key+'">Check out</button>';
    else btn='<span class="chip '+tone[a.status]+'">'+label[a.status]+'</span>';
    return '<div class="gros'+(coming(x)?"":" dim")+'"><span class="av">'+p.initials+'</span><div class="rw"><button class="link nm" data-act="gmember" data-id="'+key+'">'+esc(p.name)+'</button><div class="m">'+creditText(x)+'</div></div>'+btn+'</div>';
  }
  M.panels.roster=function(){
    var g=group(st.grp); if(!g) return "";
    var live=g.ms.filter(coming), gone=g.ms.filter(function(x){return !coming(x)}), arr=live.filter(function(x){return x.a.status==="booked"}), inn=live.filter(function(x){return x.a.status==="in"}), fin=live.filter(function(x){return x.a.status==="out"}), ow=live.filter(owes), k=asksOf(g), open=g.cap?g.cap-live.length:1, boss=M.you().role!=="Coach";
    var h='<div class="sph"><div><h3>'+esc(g.name)+'</h3><div class="m">'+whenOf(g)+" to "+fromMin(toMin(g.time)+g.len)+'</div><div class="m">'+esc(g.where)+'</div></div>'+M.px+'</div><div class="spb">';
    h+='<div class="gchips"><span class="chip">'+live.length+(g.cap?" of "+g.cap:"")+' booked</span><span class="chip'+(inn.length?" mist":"")+'">'+inn.length+' checked in</span>'+(arr.length?'<span class="chip">'+arr.length+' to arrive</span>':"")+(fin.length?'<span class="chip ok">'+fin.length+' done</span>':"")+(ow.length?'<span class="chip warn">'+ow.length+' payment due</span>':"")+'</div>';
    h+='<div><div class="k" style="margin-bottom:6px">Coming</div>'+(live.length?'<div class="groster">'+live.map(rosRow).join("")+'</div>':'<div class="m">Nobody is coming yet.</div>')+'</div>';
    if(open>0) h+='<div class="crow"><span class="m">'+(g.cap?M.plural(open,"spot")+" open":"")+'</span><button class="btn sm" data-act="gadd">Add a person</button></div>';
    else h+='<div class="crow"><span class="m">This session is full.</span>'+(boss?'<button class="btn sm" data-act="gadd" data-id="over">Add over the limit</button>':"")+'</div>';
    if(k&&k.asks.length) h+='<div><div class="k" style="margin-bottom:6px">Asking for a spot</div>'+k.asks.map(function(r,i){var q=M.person(r[0]), pl=q&&planFor(q,g.svc); return '<div class="warnbox" style="margin-bottom:8px"><div class="t">'+esc(r[1])+'</div><div class="m" style="color:inherit">'+(pl?(pl.unlimited?"Unlimited package":"Has "+M.plural(pl.open,"credit")+" left to book"):"No package, "+fm(g.svc.price)+" would be due")+'</div><div class="acts" style="margin-top:8px"><button class="btn sm" data-act="kok" data-id="'+i+'">Approve</button><button class="btn sm" data-act="kno" data-id="'+i+'">Decline</button></div></div>'}).join("")+'</div>';
    if(gone.length) h+='<div><div class="k" style="margin-bottom:6px">Not coming</div><div class="groster">'+gone.map(rosRow).join("")+'</div></div>';
    h+='<div class="m">Tap a name for that person: their credits, payment, reschedule, late cancel and no show.'+(k?" The booking page never shows more than "+k.shown+" spots for this class.":"")+'</div></div>';
    var main="";
    if(arr.length&&g.iso===TODAY) main='<button class="btn pri" data-act="gallin">Check in all '+arr.length+'</button>';
    else if(inn.length>inn.filter(owes).length) main='<button class="btn pri" data-act="gallout">Check out all '+inn.length+'</button>';
    return h+(main?'<div class="spf">'+main+'</div>':"");
  };
  M.panels.klass=function(){var k=DB.klass, S=DB.SERVICES.filter(function(x){return x.id==="sgt"})[0]; st.grp=TODAY+"|"+k.time+"|sgt|"+S.where; return M.panels.roster()};
  M.panels.override=function(){
    return '<div class="sph"><div><h3>Add an override</h3><div class="m">Close a day or run different hours</div></div>'+M.px+'</div><div class="spb"><div class="two"><div class="field"><label for="oFrom">From</label><input id="oFrom" type="date" value="2026-12-24" min="'+TODAY+'"></div><div class="field"><label for="oTo">To</label><input id="oTo" type="date" value="2026-12-25" min="'+TODAY+'"></div></div><div class="field"><label for="oFor">Applies to</label><select id="oFor"><option>Whole gym</option><option>Recovery Room A</option><option>Recovery Room B</option><option>Small Group Training</option></select></div><div class="field"><label for="oDay">That day</label><select id="oDay"><option>Closed</option><option>Different hours</option></select></div><div class="field"><label for="oWhy">Reason, for your team only</label><input id="oWhy" type="text" value="Christmas"></div><div class="warnbox"><b>3 sessions are already booked on those days.</b> Saving cancels them and tells each member. Every credit comes back on its own.</div><div class="m">A closed day shows no times on the booking page. No reason is shown to members.</div></div><div class="spf"><button class="btn pri" data-act="ovsave">Save override</button><button class="btn" data-act="pclose">Cancel</button></div>';
  };
  M.panels.share=function(){
    return '<div class="sph"><div><h3>Share your booking page</h3><div class="m">Clients book themselves from a phone, a poster or your website</div></div>'+M.px+'</div><div class="spb"><div class="box"><div class="k">Link</div><div class="v">'+DB.GYM.site+'/book</div><div class="acts" style="margin-top:6px"><button class="btn sm" data-act="copy" data-id="https://'+DB.GYM.site+'/book">Copy link</button></div></div><div class="box"><div class="k">QR code</div><div class="m">For the front desk or a flyer.</div><div class="acts" style="margin-top:6px"><button class="btn sm" data-act="later" data-id="The QR code download">Get the QR code</button></div></div><div class="box"><div class="k">Website button</div><div class="m">A snippet to paste into your site.</div><div class="acts" style="margin-top:6px"><button class="btn sm" data-act="copy" data-id="<a href=&quot;https://'+DB.GYM.site+'/book&quot;>Book a session</a>">Copy snippet</button></div></div><div class="m">The booking page uses your gym name and color.</div></div>';
  };

  var A=M.acts;
  function re(msg){M.render(); if(msg) M.toast(msg)}
  function cur(){return find(st.sel)}
  A.sview=function(id){st.view=id; M.render()};
  A.snav=function(id){st.date=M.addDays(st.date,(st.view==="Week"?7:1)*+id); M.render()};
  A.sday=function(id){st.date=id; st.view="Day"; M.render()};
  A.ssetup=function(id,b,e){ if(e.target.closest("button,.seg")&&e.target.closest("[data-act]")!==b) return; st.setup=st.setup===id?null:id; M.render()};
  A.ssw=function(id){st[id]=!st[id]; M.render()};
  A.sauto=function(id){st.auto=!!id; re(st.auto?"Automatic check-out is on. Sessions check themselves out when they end.":"Check-out is by hand again.")};
  A.ovrm=function(id){var o=DB.overrides.splice(+id,1)[0]; re("Override for "+o[0]+" removed. Normal hours apply.")};
  A.ovsave=function(){var f=$("oFrom").value,t=$("oTo").value; if(!f||!t||t<f){M.toast("The end date is before the start date.");return} DB.overrides.push([M.fd(f)+(t!==f?" to "+M.fd(t):""),$("oFor").value+($("oWhy").value?" · "+$("oWhy").value:""),$("oDay").value==="Closed"?"Closed":"10:00 AM to 2:00 PM",$("oDay").value==="Closed"?"err":"mist"]); st.setup="hours"; M.panel=null; re("Override saved. 3 sessions canceled, 3 credits returned, and each member was told.")};
  A.booknow=function(){M.sess.book()};
  A.sessopen=function(id){var m=id.split("|"); st.grp=null; M.sess.open(m[0],m[1])};
  var _cp=M.closePanel; M.closePanel=function(){st.grp=null; _cp()};
  function roster(key){st.grp=key; st.sel=null; M.openPanel("roster")}
  function rr(msg,undo){M.render(); M.renderPanel(); if(msg) M.toast(msg,undo)}
  A.gopen=function(id){roster(id)};
  A.gback=function(){roster(st.grp)};
  A.gmember=function(id){var key=st.grp, m=id.split("|"); M.sess.open(m[0],m[1]); st.grp=key; M.renderPanel()};
  A.gin=function(id){var x=find(id); rr(checkIn(x.p,x.a))};
  A.gout=function(id){var x=find(id), pl=planOf(x.p,x.a), r=setStatus(x.p,x.a,"out"); rr(r?x.p.first+": "+r:x.p.first+" is checked out."+(counted(pl)?" 1 credit used, "+pl.open+" left to book.":""))};
  A.gpay=function(id){var x=find(id), key=st.grp; _cp(); M.pos.open({cust:x.p.id,appt:x.a,checkout:true,after:function(){roster(key)}})};
  A.gallin=function(){var g=group(st.grp), ms=g.ms.filter(function(x){return x.a.status==="booked"}); ms.forEach(function(x){setStatus(x.p,x.a,"in")}); rr(ms.length+" checked in. No credits used yet.",function(){ms.forEach(function(x){if(x.a.status==="in") setStatus(x.p,x.a,"booked")}); rr()})};
  A.gallout=function(){
    var g=group(st.grp), ms=g.ms.filter(function(x){return x.a.status==="in"}), held=ms.filter(owes), done=ms.filter(function(x){return !owes(x)});
    done.forEach(function(x){setStatus(x.p,x.a,"out")});
    rr((done.length?done.length+" checked out, each on their own credit.":"Nobody was checked out.")+(held.length?" "+held.length+" still "+(held.length===1?"owes":"owe")+" payment.":""),done.length?function(){done.forEach(function(x){if(x.a.status==="out") setStatus(x.p,x.a,"in")}); rr()}:null);
  };
  A.gadd=function(id){var g=group(st.grp); if(!g) return; st.bk={pid:null,q:"",svc:g.svc.id||null,date:g.iso,from:g.iso,time:g.time,repeat:false,extra:false,off:false,asked:true,lock:g.key,over:id==="over",back:"roster"}; M.openPanel("book")};
  A.gmove=function(){var x=cur(), iso=dayISO(x.a.day), d0=iso<TODAY?TODAY:iso; st.bk={pid:x.p.id,q:"",svc:svcOf(x.a).id||null,date:d0,from:d0,time:null,repeat:false,extra:false,off:false,asked:true,move:st.sel,back:"session"}; M.openPanel("book")};
  A.bkback=function(){var b=st.bk||{}; if(b.back==="roster") roster(b.lock); else {st.mode="view"; st.confirm=null; M.openPanel("session")}};
  document.addEventListener("keydown",function(e){
    if(e.key!=="Escape"||!M.panel||!$("confirm").hidden) return;
    var n=M.panel.name, stop=function(){e.stopPropagation(); e.preventDefault()};
    if(n==="session"&&st.grp&&group(st.grp)){stop(); if(st.mode==="edit"||st.confirm){st.mode="view"; st.confirm=null; M.renderPanel()} else A.gback()}
    else if(n==="book"&&st.bk&&st.bk.back){stop(); A.bkback()}
  },true);
  A.rowin=function(id,b,e){ if(e) e.stopPropagation(); var x=find(id); re(checkIn(x.p,x.a))};
  A.smode=function(id){st.mode=id; st.confirm=null; M.renderPanel()};
  A.sconfirm=function(id){st.confirm=id||null; M.renderPanel()};
  A.sin=function(){var x=cur(); re(checkIn(x.p,x.a))};
  A.sout=function(){var x=cur(); re(checkOut(x.p,x.a))};
  A.spayout=function(){var x=cur(); M.closePanel(); M.pos.open({cust:x.p.id,appt:x.a,checkout:true})};
  A.stake=function(){var x=cur(); M.closePanel(); M.pos.open({cust:x.p.id,appt:(x.a.due&&!x.a.paid)?x.a:null})};
  A.srenew=function(){var x=cur(), pl=planOf(x.p,x.a); M.closePanel(); M.pos.open({cust:x.p.id,renew:pl})};
  A.sbooknext=function(){var x=cur(); M.sess.book(x.p.id); st.bk.svc=(DB.SERVICES.filter(function(s){return x.a.title.indexOf(s.title.split(",")[0])===0})[0]||{}).id||null; M.renderPanel()};
  A.scancel=function(){var x=cur(), l=lateWin(x.a), pl=planOf(x.p,x.a); setStatus(x.p,x.a,l?"late":"canceled"); st.confirm=null; re(l?"Late cancel recorded."+(counted(pl)?" 1 credit used.":""):"Session canceled."+(counted(pl)?" "+pl.open+" left to book.":""))};
  A.snoshow=function(){var x=cur(); setStatus(x.p,x.a,"noshow"); st.confirm=null; re("No show recorded.")};
  A.sremove=function(){var x=cur(), pl=planOf(x.p,x.a); if(counted(pl)){pl[bucket[x.a.status]]--; pl.open++} x.p.appts=x.p.appts.filter(function(q){return q!==x.a}); x.p.visits=x.p.visits.filter(function(v){return v[4]!==x.a}); st.sel=null; st.confirm=null; M.panel=null; re("Session removed from the schedule.")};
  A.ssave=function(){
    var x=cur(), a=x.a, s=$("eStatus").value, d=$("eDay")?$("eDay").value:dayISO(a.day), t=$("eTime")?$("eTime").value:a.time, why=$("eWhy").value.trim(), moved=(d!==dayISO(a.day)||t!==a.time);
    a.day=dayLabel(d); a.time=t; a.today=d===TODAY;
    if(s!==a.status){setStatus(x.p,a,s); x.p.thread.push({k:"event",day:"Today",t:"just now",body:M.you().name+" changed "+a.title+" to "+label[s]+"."+(why?" Reason: "+why:"")})} else setStatus(x.p,a,s);
    st.mode="view"; if(moved) st.date=d; re(moved?"Moved to "+dayLabel(d)+" at "+t+". No credit used.":"Changes saved.");
  };
  A.bkpick=function(id){st.bk.pid=id||null; st.bk.q=""; M.renderPanel()};
  A.bksvc=function(id){st.bk.svc=id; st.bk.time=null; st.bk.off=false; M.renderPanel()};
  A.bktime=function(id){var a=id.split("|"); st.bk.time=a[0]; st.bk.off=a[1]==="off"; M.renderPanel()};
  A.bkday=function(id){st.bk.date=id; st.bk.time=null; st.bk.off=false; M.renderPanel()};
  A.bkweek=function(id){var b=st.bk; b.from=M.addDays(b.from,7*(+id)); if(b.from<TODAY) b.from=TODAY; b.date=b.from; b.time=null; b.off=false; M.renderPanel()};
  A.bkextra=function(){st.bk.extra=!st.bk.extra; if(!st.bk.extra&&st.bk.off){st.bk.time=null; st.bk.off=false} M.renderPanel()};
  M.changes.push(function(el){var d=el.dataset||{}; if(d.bksvc){A.bksvc(el.value||null)} if(d.bkdate&&el.value){st.bk.date=el.value; st.bk.from=el.value; st.bk.time=null; st.bk.off=false; M.renderPanel()}});
  A.bkrep=function(){st.bk.repeat=!st.bk.repeat; M.renderPanel()};
  A.bkdo=function(id,b){
    if(b.disabled) return;
    if(st.bk.lock){
      var kb=st.bk, g=group(kb.lock), q=bkPerson(), na=addBooking(q,g.svc,g.iso,g.time,g.where);
      if(q.stage==="New"||q.stage==="In conversation") q.stage="Booked";
      var ak=asksOf(g); if(ak) ak.asks=ak.asks.filter(function(r){return r[0]!==q.id});
      roster(g.key); M.render();
      return M.toast(q.first+" is on "+g.name+" at "+g.time+"."+(na.due?" "+fm(na.due)+" due at check-in.":(na.plan&&counted(planOf(q,na))?" 1 credit booked, none used.":"")),function(){var pl=planOf(q,na); if(counted(pl)){pl.booked--; pl.open++} q.appts=q.appts.filter(function(z){return z!==na}); rr()});
    }
    if(st.bk.move){
      var mb=st.bk, x=find(mb.move), was=[x.a.day,x.a.time,x.a.today];
      x.a.day=dayLabel(mb.date); x.a.time=mb.time; x.a.today=mb.date===TODAY; sortAppts(x.p);
      st.date=mb.date; st.sel=null; M.panel=null; st.grp=null; M.render();
      return M.toast(x.p.first+" moved to "+dayLabel(mb.date)+" at "+mb.time+". Same credit booked, none used.",function(){x.a.day=was[0]; x.a.time=was[1]; x.a.today=was[2]; sortAppts(x.p); st.date=dayISO(was[0]); M.render()});
    }
    var k=st.bk, p=bkPerson(), s=DB.SERVICES.filter(function(x){return x.id===k.svc})[0], pl=p.plans.filter(function(x){return x.service===s.name})[0], n=k.repeat?4:1, made=0;
    for(var i=0;i<n;i++){
      var d=M.addDays(k.date,7*i), a={id:"b"+Date.now()+i,day:dayLabel(d),today:d===TODAY,time:k.time,title:s.title,where:s.where,status:"booked",staff:!!k.off};
      if(pl&&(pl.unlimited||pl.open>0)){a.plan=pl.id; if(!pl.unlimited){pl.open--; pl.booked++}} else if(s.price) a.due=s.price; else a.free=true;
      p.appts.push(a); made++;
    }
    p.appts.sort(function(x,y){return dayISO(x.day)<dayISO(y.day)?-1:(dayISO(x.day)>dayISO(y.day)?1:toMin(x.time)-toMin(y.time))});
    if(p.stage==="New"||p.stage==="In conversation") p.stage="Booked";
    st.date=k.date; M.panel=null; re(p.first+" is booked for "+s.title+" on "+dayLabel(k.date)+" at "+k.time+"."+(made>1?" Repeats for 4 weeks.":"")+(!p.docs.length?" The waiver goes out with this first booking.":""));
  };
  A.kok=function(id){var k=DB.klass, g=group(st.grp); if(!g) return; if(g.ms.filter(coming).length>=k.room){M.toast("The room holds "+k.room+". Nobody else fits.");return} var r=k.asks.splice(+id,1)[0], q=M.person(r[0]); if(q) addBooking(q,g.svc,g.iso,g.time,g.where); k.roster.push(r); M.renderPanel(); M.render(); M.toast(r[1]+" is in. They were texted, and the booking page still shows "+k.shown+" of "+k.shown+".")};
  A.kno=function(id){var k=DB.klass, r=k.asks.splice(+id,1)[0]; k.declined++; M.renderPanel(); M.render(); M.toast(r[1]+" was told there is no spot. Nothing was charged.")};
  M.changes.push(function(el){
    if(el.id==="scoach"){st.coach=el.value; M.render()}
    if(el.id==="bkday"){st.bk.date=el.value; st.bk.time=null; M.renderPanel()}
  });
  M.inputs.push(function(el){
    if(el.id!=="bkq") return; st.bk.q=el.value; $("bkhits").innerHTML=bkHits();
  });
})();
