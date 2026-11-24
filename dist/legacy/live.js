/* Live workout: a coach opens a workout and logs sets, weight and rest as it happens.
   One client or several side by side, for semi-private and classes. Swap or add an exercise mid-session.
   Full screen, big targets, works on a tablet at the rack. Finishing writes results to each client's profile. */
(function(){
  var esc=M.esc, $=M.$, CP=DB.CP, F=CP.f, TODAY=DB.TODAY, L=null, tick=null;
  var G=DB.GYM; G.tablets=G.tablets||[{id:"t1",name:"Rack 1 iPad"},{id:"t2",name:"Rack 2 iPad"},{id:"t3",name:"Rack 3 iPad"},{id:"t4",name:"Platform iPad"}];
  function tab(id){return G.tablets.filter(function(t){return t.id===id})[0]}
  function el(){var e=$("liveW"); if(!e){e=document.createElement("div"); e.id="liveW"; e.className="takeover lw"; e.hidden=true; document.body.appendChild(e)} return e}
  function mmss(s){s=Math.max(0,Math.round(s)); return Math.floor(s/60)+":"+("0"+(s%60)).slice(-2)}
  function restOf(name,w){return /plank|bug|rotation|carry|push|hold|stretch|cat|breath|rope|bike/i.test(name)?60:(w&&+w>=100?150:90)}
  function lastOf(c,name){var r=c.results.filter(function(x){return !x.archived&&x.label.toLowerCase()===name.toLowerCase()&&x.pts.length})[0]; return r?r.pts[r.pts.length-1][1]+(r.unit?" "+r.unit:"")+" on "+F.sd(r.pts[r.pts.length-1][0]):""}
  function mk(c,name,n,target,unit,w,rx,swap){var sets=[],i; for(i=0;i<n;i++) sets.push({r:String(target),w:w==null?"":String(w),done:false}); return {name:name,rx:rx||(n+" × "+target+(unit&&unit!=="reps"?" "+unit:"")+(w!=null&&w!==""?" · "+w+" lb":"")),unit:unit||"reps",sets:sets,rest:restOf(name,w),note:"",last:lastOf(c,name),swap:swap||"",hasLb:w!=null&&w!==""}}
  /* a lane is one client's workout */
  function laneFromProgram(pid,iso,letter){
    var p=M.person(pid), c=CP.get(pid), S=CP.slots(c), s;
    if(letter){var g=CP.progOn(c,TODAY); if(!g||!g.workouts||!g.workouts[letter]) return null; s=S.filter(function(x){return x.prog===g&&x.workout===letter&&x.status==="planned"})[0]||{prog:g,workout:letter,wname:g.workouts[letter].name,status:"planned",iso:TODAY}; s={prog:s.prog,workout:letter,wname:g.workouts[letter].name,status:"planned",iso:TODAY,real:s}}
    else s=S.filter(function(x){return x.iso===(iso||TODAY)&&x.workout})[0]||S.filter(function(x){return x.status==="planned"&&x.workout})[0];
    if(!s) return null;
    var ex=CP.exercises(c,s.real||s,S).map(function(e){var m=/(\d+) × (\d+)(.*)/.exec(e[1])||[0,3,10,""], lb=/(\d+(?:\.\d+)?) lb/.exec(e[2]||""); return mk(c,e[0],+m[1],m[2],(m[3]||"").trim()||"reps",lb?lb[1]:null,e[1]+(e[2]?" · "+e[2]:""),e[4]?"Swapped from "+e[4].from+" · "+e[4].why:"")});
    return {pid:pid,iso:letter?TODAY:s.iso,title:"Workout "+s.workout+(s.wname?" · "+s.wname:""),workout:s.workout,ex:ex,restEnd:0,restFor:"",changes:[]};
  }
  function laneFromBuilder(pid,day,title){
    var c=CP.get(pid), ex=[]; day.items.forEach(function(it){(it.g?it.items:[it]).forEach(function(e){var n=it.g?Math.max(e.sets,it.rounds):e.sets; if(it.g&&/Warm|Cool/.test(it.kind)) return; ex.push(mk(c,e.name,n,e.target,e.unit,e.loadKind==="Weight"&&e.load!==""?e.load:null))})});
    return {pid:pid,iso:TODAY,title:title,workout:"",ex:ex,restEnd:0,restFor:"",changes:[]};
  }
  function start(lanes){ M.closePanel(); L={lanes:lanes,cur:0,t0:Date.now(),done:false,view:false,pick:null,adding:false,mode:"all",rack:null,sending:false}; draw(); if(!tick) tick=setInterval(beat,500) }
  function open(pid,iso,letter){
    var p=M.person(pid), c=CP.get(pid), key=iso||TODAY, saved=!letter&&c.live&&c.live[key];
    if(saved){L={lanes:[JSON.parse(JSON.stringify(saved))],cur:0,view:true,done:false}; return draw()}
    var ln=laneFromProgram(pid,iso,letter); if(!ln) return M.toast(p.first+" has no program yet. Write one in Workout Builder first.");
    start([ln]);
  }
  function openClass(){
    var k=DB.klass, g=DB.PROGS.filter(function(x){return x.id==="pg_sgt"})[0], day=g.weeks[0].days[(F.dow(TODAY)+6)%7]||g.weeks[0].days.filter(Boolean)[0];
    start(k.roster.map(function(r){return laneFromBuilder(r[0],day,k.title+" · "+day.name)}));
  }
  function openMany(pids){var lanes=pids.map(function(id){var ln=laneFromProgram(id,null,null); if(ln) ln.iso=TODAY; return ln}).filter(Boolean); if(!lanes.length) return M.toast("None of them has a program yet."); start(lanes)}
  function openGroup(prog,day){
    var ps=prog.clients.map(function(n){return M.people().filter(function(x){return x.name===n})[0]}).filter(Boolean); if(!ps.length) return M.toast("Nobody is enrolled in this program yet. Assign it first.");
    start(ps.map(function(p){var own=prog.type==="Semi"?laneFromProgram(p.id,null,null):null; if(own){own.iso=TODAY; return own} return laneFromBuilder(p.id,day,prog.name+" · "+day.name)}));
  }
  function beat(){ if(!L||L.done||L.view) return; var a=$("lwClock"); if(a) a.textContent=mmss((Date.now()-L.t0)/1000); L.lanes.forEach(function(ln,i){ if(!ln.restEnd) return; var left=(ln.restEnd-Date.now())/1000, b=$("lwRest"+i); if(left<=0){ln.restEnd=0; grab(); draw(); M.toast("Rest is over for "+M.person(ln.pid).first+".")} else if(b) b.textContent=mmss(left) }) }
  function grab(){ if(!L||L.view||L.done) return; L.lanes.forEach(function(ln,l){ln.ex.forEach(function(e,i){e.sets.forEach(function(s,j){var r=$("lw_r_"+l+"_"+i+"_"+j), w=$("lw_w_"+l+"_"+i+"_"+j); if(r) s.r=r.value; if(w) s.w=w.value}); var n=$("lw_n_"+l+"_"+i); if(n) e.note=n.value})}); var q=$("lwq"); if(q&&L.pick) L.pick.q=q.value }
  function counts(ln){var d=0,t=0; ln.ex.forEach(function(e){e.sets.forEach(function(s){t++; if(s.done) d++})}); return [d,t]}
  function total(){var d=0,t=0; L.lanes.forEach(function(ln){var k=counts(ln); d+=k[0]; t+=k[1]}); return [d,t]}
  function pickHTML(l){
    var pk=L.pick, ln=L.lanes[l], cur=pk.ex!=null?ln.ex[pk.ex]:null, def=cur&&DB.EX.filter(function(x){return x.name.toLowerCase()===cur.name.toLowerCase()})[0], q=(pk.q||"").toLowerCase();
    var R=DB.EX.filter(function(x){return x.status!=="Archived"&&(!cur||x.name!==cur.name)&&(!q||x.name.toLowerCase().indexOf(q)>=0)}).sort(function(a,b){return (def&&b.move===def.move?1:0)-(def&&a.move===def.move?1:0)||a.name.localeCompare(b.name)}).slice(0,q?12:8);
    return '<div class="lw-pick"><div class="crow"><b>'+(cur?"Swap "+esc(cur.name)+" for":"Add an exercise")+'</b><button class="btn sm quiet" data-act="lwpick" data-id="">Cancel</button></div><input class="search" id="lwq" type="search" placeholder="Search exercises" aria-label="Search exercises" value="'+esc(pk.q||"")+'" style="max-width:none;width:100%;flex:none"><div class="lw-res" id="lwres">'+resHTML(R,def)+'</div>'+(cur?'<div class="m">Sets, reps and rest carry over. This changes today only. The program stays as written.</div>':'<div class="m">Added for today only.</div>')+'</div>';
  }
  function resHTML(R,def){return R.length?R.map(function(x){return '<button data-act="lwchoose" data-id="'+x.id+'"><b>'+esc(x.name)+'</b><span class="m">'+x.move+(def&&x.move===def.move?" · same movement":"")+" · "+esc(x.equip)+'</span></button>'}).join(""):'<div class="m">No exercise matches.</div>'}
  function laneHTML(ln,l){
    var p=M.person(ln.pid), k=counts(ln), ro=L.view||L.done, multi=L.lanes.length>1, onRack=L.rack===l;
    if(ln.tab&&!ro&&!onRack){var nx=ln.ex.filter(function(e){return e.sets.some(function(s){return !s.done})})[0], t=tab(ln.tab);
      return '<div class="lw-lane lw-mon'+(l===L.cur?" cur":"")+'"><div class="lw-lh"><div class="lw-who"><span class="av">'+p.initials+'</span><div style="min-width:0"><b>'+esc(p.name)+'</b><div class="m">'+esc(ln.title)+'</div></div></div><span class="chip glow">On '+esc(t?t.name:"a tablet")+'</span></div><section class="card"><div class="lw-monrow"><div><span class="k">Sets</span><b>'+k[0]+" of "+k[1]+'</b></div><div><span class="k">'+(ln.restEnd?"Resting":"Now")+'</span><b'+(ln.restEnd?' id="lwRest'+l+'"':"")+'>'+(ln.restEnd?mmss((ln.restEnd-Date.now())/1000):esc(nx?nx.name:"All done"))+'</b></div></div>'+ln.ex.map(function(x){var dn=x.sets.filter(function(s){return s.done}).length; return '<div class="lw-monex"><span>'+esc(x.name)+'</span><span class="cp-segs">'+x.sets.map(function(s){return '<i class="'+(s.done?"d":"")+'"></i>'}).join("")+'</span><span class="m">'+dn+"/"+x.sets.length+'</span></div>'}).join("")+'<div class="m" style="margin-top:8px">'+esc(p.first)+" logs on the tablet. What "+p.first+' logs shows here as it happens.</div><div class="acts" style="margin-top:10px"><button class="btn sm" data-act="lwrack" data-id="'+l+'">See what the tablet shows</button><button class="btn sm quiet" data-act="lwsendset" data-id="'+l+':">Bring back to this screen</button></div></section></div>'}
    var h='<div class="lw-lane'+(l===L.cur?" cur":"")+'"><div class="lw-lh"><div class="lw-who"><span class="av">'+p.initials+'</span><div style="min-width:0"><b>'+esc(p.name)+'</b><div class="m">'+esc(ln.title)+'</div></div></div>'+(ro?"":(ln.restEnd?'<div class="lw-rest"><span class="k">Rest</span><b id="lwRest'+l+'">'+mmss((ln.restEnd-Date.now())/1000)+'</b><button class="btn sm" data-act="lwrest" data-id="'+l+':30">+30 sec</button><button class="btn sm quiet" data-act="lwrest" data-id="'+l+':0">Skip</button></div>':'<span class="chip '+(k[0]===k[1]&&k[1]?"ok":"")+'">'+k[0]+" of "+k[1]+' sets</span>'))+(multi&&!ro&&!k[0]?'<button class="btn sm quiet" data-act="lwdrop" data-id="'+l+'" aria-label="Remove '+esc(p.first)+' from this workout">Remove</button>':"")+'</div>';
    if(L.done) h+='<div class="box lw-sumbox"><b>'+k[0]+" of "+k[1]+' sets logged.</b> '+(ln.saved.length?esc(ln.saved.join(". "))+".":"Saved to "+esc(p.first)+"'s profile.")+'<div class="acts" style="margin-top:8px">'+(ln.canOut?'<button class="btn sm hl" data-act="lwout" data-id="'+l+'">Check out '+esc(p.first)+'</button>':"")+'<button class="btn sm" data-act="lwprofile" data-id="'+ln.pid+'">Open profile</button></div></div>';
    ln.ex.forEach(function(x,i){var dn=x.sets.filter(function(s){return s.done}).length, all=dn===x.sets.length;
      h+='<section class="card lw-ex'+(all?" all":"")+'"><div class="ch"><div style="min-width:0"><h3>'+esc(x.name)+'</h3><div class="m">'+esc(x.rx)+(x.last?" · last result "+esc(x.last):"")+'</div>'+(x.swap?'<div class="m">'+esc(x.swap)+'</div>':"")+'</div><span class="acts" style="flex-wrap:nowrap"><span class="chip '+(all?"ok":"")+'">'+dn+" of "+x.sets.length+'</span>'+(ro?"":'<button class="btn sm" data-act="lwpick" data-id="'+l+":"+i+'">Swap</button>')+'</span></div>';
      if(L.pick&&L.pick.lane===l&&L.pick.ex===i) h+=pickHTML(l);
      h+='<div class="lw-sets"><div class="lw-h"><span>Set</span><span>'+(x.unit==="reps"||/^each/.test(x.unit)?"Reps":esc(x.unit.replace(/ each.*/,"")))+'</span><span>Weight, lb</span><span></span></div>'+x.sets.map(function(s,j){var id=l+"_"+i+"_"+j; return '<div class="lw-set'+(s.done?" done":"")+'"><b>'+(j+1)+'</b><input id="lw_r_'+id+'" inputmode="decimal" value="'+esc(s.r)+'" aria-label="'+esc(p.first+", "+x.name)+" set "+(j+1)+' reps"'+(ro||s.done?" disabled":"")+'><input id="lw_w_'+id+'" inputmode="decimal" value="'+esc(s.w)+'" placeholder="'+(x.hasLb?"":"bodyweight")+'" aria-label="'+esc(p.first+", "+x.name)+" set "+(j+1)+' weight"'+(ro||s.done?" disabled":"")+'>'+(ro?'<span class="m">'+(s.done?"Done":"Skipped")+'</span>':'<button class="btn '+(s.done?"":"pri")+'" data-act="lwset" data-id="'+l+":"+i+":"+j+'" aria-pressed="'+s.done+'">'+(s.done?"Undo":"Done")+'</button>')+'</div>'}).join("")+'</div>'+(ro?(x.note?'<div class="m" style="margin-top:8px">Note: '+esc(x.note)+'</div>':""):'<div class="rbar" style="margin-top:10px"><button class="btn sm" data-act="lwadd" data-id="'+l+":"+i+'">Add a set</button>'+(x.sets.length>1?'<button class="btn sm quiet" data-act="lwrm" data-id="'+l+":"+i+'">Remove last set</button>':"")+(dn?"":'<button class="btn sm quiet" data-act="lwskip" data-id="'+l+":"+i+'">Skip exercise</button>')+'<label class="m" for="lw_rest_'+l+"_"+i+'">Rest</label><select class="csel" id="lw_rest_'+l+"_"+i+'" data-lwrest="'+l+":"+i+'">'+[30,45,60,90,120,150,180,240].map(function(s){return '<option value="'+s+'"'+(x.rest===s?" selected":"")+'>'+(s<60?s+" sec":(s%60?Math.floor(s/60)+" min "+(s%60)+" sec":(s/60)+" min"))+'</option>'}).join("")+'</select><input class="fld" id="lw_n_'+l+"_"+i+'" style="flex:1 1 160px;width:auto" placeholder="Note, like a cue that worked" aria-label="Note for '+esc(x.name)+'" value="'+esc(x.note)+'"></div>')+'</section>'});
    if(!ro) h+=L.pick&&L.pick.lane===l&&L.pick.ex==null?'<section class="card">'+pickHTML(l)+'</section>':'<button class="btn lw-addx" data-act="lwpick" data-id="'+l+':">Add an exercise</button>';
    return h+'</div>';
  }
  function draw(){
    var e=el(); if(!L){e.hidden=true; e.innerHTML=""; return}
    var k=total(), ro=L.view||L.done, multi=L.lanes.length>1, y=e.scrollTop, xs=e.querySelector(".lw-lanes"), x=xs?xs.scrollLeft:0;
    var h='<header class="lw-top"><div class="lw-who"><div><b>'+(multi?M.plural(L.lanes.length,"client")+", one screen":esc(M.person(L.lanes[0].pid).name))+'</b><div class="m">'+(L.view?"Logged sets, "+F.rel(L.lanes[0].iso):(L.done?"Workout logged":esc(multi?L.lanes[0].title:L.lanes[0].title+" · "+F.rel(L.lanes[0].iso))))+'</div></div></div>';
    if(ro) h+='<div class="acts"><button class="btn" data-act="lwclose">Close</button></div>';
    else h+='<div class="lw-timers"><div><span class="k">Time</span><b id="lwClock">'+mmss((Date.now()-L.t0)/1000)+'</b></div><div><span class="k">Sets</span><b>'+k[0]+" of "+k[1]+'</b></div></div><div class="acts">'+(multi?'<div class="seg lw-modeseg" role="group" aria-label="View"><button data-act="lwmode" data-id="all" aria-pressed="'+(L.mode==="all")+'">All on one screen</button><button data-act="lwmode" data-id="one" aria-pressed="'+(L.mode==="one")+'">One at a time</button></div>':"")+'<button class="btn" data-act="lwsend" aria-expanded="'+!!L.sending+'">Send to tablets</button><button class="btn" data-act="lwaddc" aria-expanded="'+!!L.adding+'">Add a client</button><button class="btn pri" data-act="lwfinish">Finish workout</button><button class="btn" data-act="lwclose">Close</button></div>';
    h+='</header>';
    if(L.adding){var inIt=L.lanes.map(function(ln){return ln.pid}), now=function(p){return p.appts.some(function(a){return a.day==="Today"})}, C=CP.clients().filter(function(p){return inIt.indexOf(p.id)<0&&CP.progOn(CP.get(p.id),TODAY)}).sort(function(a,b){return (now(b)?1:0)-(now(a)?1:0)||a.name.localeCompare(b.name)});
      h+='<div class="lw-addc"><b>Add a client to this screen</b>'+(C.length?C.map(function(p){var g=CP.progOn(CP.get(p.id),TODAY); return '<button class="btn sm" data-act="lwaddgo" data-id="'+p.id+'">'+esc(p.name)+' <span class="m">'+esc(g.name)+'</span></button>'}).join(""):'<span class="m">Everyone with a program is already here.</span>')+'<button class="btn sm quiet" data-act="lwaddc">Cancel</button></div>'}
    if(L.sending&&!ro) h+='<div class="lw-addc lw-send"><div style="flex:1 1 100%"><b>Send each client to a tablet</b> <span class="m">These are the rack tablets set up in Settings. A client sent to a tablet sees only their own workout there.</span></div>'+L.lanes.map(function(ln,l){return '<label class="lw-sendrow"><span>'+esc(M.person(ln.pid).name)+'</span><select class="csel" data-lwtab="'+l+'"><option value="">This screen</option>'+G.tablets.map(function(t){var taken=L.lanes.some(function(o,j){return j!==l&&o.tab===t.id}); return '<option value="'+t.id+'"'+(ln.tab===t.id?" selected":"")+(taken?" disabled":"")+'>'+esc(t.name)+(taken?", in use":"")+'</option>'}).join("")+'</select></label>'}).join("")+'<button class="btn sm hl" data-act="lwsendall">Send everyone, one per tablet</button><button class="btn sm quiet" data-act="lwsendnone">Bring everyone back</button><button class="btn sm quiet" data-act="lwsend">Done</button></div>';
    if(L.rack!=null){var rl=L.lanes[L.rack], rt=tab(rl.tab); e.innerHTML='<div class="lw-rackbar"><span><b>'+esc(rt?rt.name:"Tablet")+'</b> · This is what the tablet at the rack shows. Only '+esc(M.person(rl.pid).first)+'\'s workout. The client can change reps and weight, tap Done and run the rest timer. Swapping, skipping, adding sets and notes stay with the coach.</span><button class="btn sm" data-act="lwrack" data-id="">Back to the coach screen</button></div><div class="lw-lanes rack">'+laneHTML(rl,L.rack)+'</div>'; e.hidden=false; e.scrollTop=y; return}
    if(multi) h+='<div class="lw-tabs" role="tablist">'+L.lanes.map(function(ln,l){var c=counts(ln); return '<button data-act="lwtab" data-id="'+l+'" aria-pressed="'+(l===L.cur)+'">'+esc(M.person(ln.pid).first)+' <span class="m">'+c[0]+"/"+c[1]+'</span>'+(ln.restEnd?' <i>rest</i>':"")+'</button>'}).join("")+'</div>';
    if(L.done&&!multi) h+='<div class="lw-body" style="padding-bottom:0"><section class="card lw-sum"><div class="donec">&#10003;</div><h2 class="h3" style="font-size:22px">Workout logged</h2><div class="m">'+k[0]+" of "+k[1]+" sets in "+mmss(L.secs)+'.</div></section></div>';
    h+='<div class="lw-lanes'+(multi?" multi n"+Math.min(4,L.lanes.length)+(L.mode==="one"?" one":""):"")+'">'+L.lanes.map(laneHTML).join("")+'</div>';
    e.innerHTML=h; e.hidden=false; e.scrollTop=y; var ns=e.querySelector(".lw-lanes"); if(ns) ns.scrollLeft=x; var q=$("lwq"); if(q&&L.pick&&L.pick.focus){L.pick.focus=false; q.focus()}
  }
  function finish(){
    grab(); L.secs=(Date.now()-L.t0)/1000;
    L.lanes.forEach(function(ln){
      var p=M.person(ln.pid), c=CP.get(ln.pid), k=counts(ln), saved=[]; ln.restEnd=0;
      ln.ex.forEach(function(x){var ws=x.sets.filter(function(s){return s.done&&s.w!==""}).map(function(s){return parseFloat(s.w)}).filter(function(v){return !isNaN(v)}); if(!ws.length) return; var top=Math.max.apply(null,ws), r=c.results.filter(function(y){return !y.archived&&y.label.toLowerCase()===x.name.toLowerCase()})[0]; if(!r) return; r.pts=r.pts.filter(function(pt){return pt[0]!==ln.iso}); r.pts.push([ln.iso,top]); r.pts.sort(function(a,b){return a[0]<b[0]?-1:1}); saved.push(x.name+" "+top+" lb added to "+c.pron.pos+" results")});
      ln.ex.forEach(function(x){ if(x.note) c.notes.push({by:M.you().name,iso:TODAY,text:x.name+": "+x.note,pinned:false,fresh:true}) });
      if(k[0]) c.events.unshift({iso:TODAY,t:"training",time:"just now",fresh:true,text:"<b>Logged live:</b> "+esc(ln.title)+", "+k[0]+" of "+k[1]+" sets in "+mmss(L.secs)+", by "+esc(M.you().name)+"."+(ln.changes.length?" "+esc(ln.changes.join(". "))+".":"")});
      var a=p.appts.filter(function(x){return M.sess.dayISO(x.day)===ln.iso&&/^(Semi-private|Personal training)/i.test(x.title)})[0]; ln.canOut=!!a&&ln.iso===TODAY&&a.status!=="out"; ln.apptId=a?a.id:null; ln.saved=saved; ln.secs=L.secs;
      if(k[0]){c.live=c.live||{}; c.live[ln.iso]=JSON.parse(JSON.stringify(ln))}
    });
    L.done=true; L.pick=null; L.adding=false; L.sending=false; L.rack=null; draw(); el().scrollTop=0;
  }
  M.live={open:open,openClass:openClass,openMany:openMany,openGroup:openGroup,has:function(pid,iso){var c=CP.get(pid); return !!(c&&c.live&&c.live[iso])}};
  var A=M.acts;
  function ids(id){return String(id).split(":").map(function(x){return x===""?null:+x})}
  A.lwopen=function(id){var a=String(id).split("|"); open(a[0],a[1]||null,a[2]||null)};
  A.lwclass=function(){openClass()};
  A.lwmode=function(id){grab(); L.mode=id; draw()};
  A.lwsend=function(){grab(); L.sending=!L.sending; L.adding=false; draw()};
  A.lwsendall=function(){grab(); var free=G.tablets.filter(function(t){return !L.lanes.some(function(o){return o.tab===t.id})}); L.lanes.forEach(function(ln){ if(!ln.tab&&free.length) ln.tab=free.shift().id }); var n=L.lanes.filter(function(o){return o.tab}).length; draw(); M.toast(M.plural(n,"client")+" sent to tablets."+(n<L.lanes.length?" "+(L.lanes.length-n)+" stayed here, since every tablet is in use.":"")+" Prototype only, nothing was sent.")};
  A.lwsendnone=function(){grab(); L.lanes.forEach(function(ln){ln.tab=null}); draw(); M.toast("Everyone is back on this screen.")};
  A.lwsendset=function(id){grab(); var a=String(id).split(":"), ln=L.lanes[+a[0]]; ln.tab=a[1]||null; draw(); M.toast(a[1]?M.person(ln.pid).first+" is on "+tab(a[1]).name+".":M.person(ln.pid).first+" is back on this screen.")};
  A.lwrack=function(id){grab(); L.rack=id===""||id==null?null:+id; L.pick=null; draw(); el().scrollTop=0};
  A.lwtab=function(id){grab(); L.cur=+id; draw(); var ln=el().querySelectorAll(".lw-lane")[+id]; if(ln&&ln.scrollIntoView) ln.scrollIntoView({inline:"start",block:"nearest"})};
  A.lwset=function(id){grab(); var a=ids(id), ln=L.lanes[a[0]], x=ln.ex[a[1]], s=x.sets[a[2]]; s.done=!s.done; L.cur=a[0]; if(s.done){var more=ln.ex.some(function(e){return e.sets.some(function(y){return !y.done})}); ln.restEnd=more&&x.rest?Date.now()+x.rest*1000:0; ln.restFor=x.name; var nx=x.sets[a[2]+1]; if(nx&&!nx.done&&nx.w===""&&s.w!=="") nx.w=s.w} else ln.restEnd=0; draw()};
  A.lwrest=function(id){grab(); var a=ids(id), ln=L.lanes[a[0]]; if(a[1]) ln.restEnd+=30000; else ln.restEnd=0; draw()};
  A.lwadd=function(id){grab(); var a=ids(id), x=L.lanes[a[0]].ex[a[1]], last=x.sets[x.sets.length-1]; x.sets.push({r:last.r,w:last.w,done:false}); draw()};
  A.lwrm=function(id){grab(); var a=ids(id); L.lanes[a[0]].ex[a[1]].sets.pop(); draw()};
  A.lwskip=function(id){grab(); var a=ids(id), ln=L.lanes[a[0]], x=ln.ex.splice(a[1],1)[0]; ln.changes.push("Skipped "+x.name); L.pick=null; draw(); M.toast(x.name+" skipped for today.",function(){ln.ex.splice(a[1],0,x); ln.changes.pop(); draw()})};
  A.lwpick=function(id){grab(); if(id===""||id==null){L.pick=null; return draw()} var a=ids(id); L.pick={lane:a[0],ex:a[1],q:"",focus:true}; L.cur=a[0]; draw()};
  A.lwchoose=function(id){grab(); var pk=L.pick, ln=L.lanes[pk.lane], d=DB.EX.filter(function(x){return x.id===id})[0], c=CP.get(ln.pid);
    if(pk.ex!=null){var x=ln.ex[pk.ex], old=x.name; x.name=d.name; x.swap="Swapped from "+old+" today"; x.last=lastOf(c,d.name); x.rx=x.sets.length+" × "+x.sets[0].r+(x.unit!=="reps"?" "+x.unit:""); x.sets.forEach(function(s){ if(!s.done) s.w="" }); x.hasLb=false; ln.changes.push("Swapped "+old+" for "+d.name); M.toast("Swapped to "+d.name+". Today only.")}
    else {var n=mk(c,d.name,d.sets,d.target,d.unit,null); n.swap="Added today"; ln.ex.push(n); ln.changes.push("Added "+d.name); M.toast(d.name+" added for today.")}
    L.pick=null; draw()};
  A.lwaddc=function(){grab(); L.adding=!L.adding; draw()};
  A.lwaddgo=function(id){grab(); var ln=laneFromProgram(id,null,null); if(!ln) return; ln.iso=TODAY; L.lanes.push(ln); L.cur=L.lanes.length-1; L.adding=false; draw(); M.toast(M.person(id).first+" added. Each client has their own sets and rest timer.")};
  A.lwdrop=function(id){grab(); var ln=L.lanes.splice(+id,1)[0]; L.cur=0; if(L.pick) L.pick=null; draw(); M.toast(M.person(ln.pid).first+" removed from this screen.")};
  A.lwfinish=function(){grab(); var k=total(); if(!k[0]) return M.toast("Mark at least one set done first."); if(k[0]<k[1]) return M.confirm({title:"Finish with "+(k[1]-k[0])+" sets not done?",body:"The sets you marked done are saved. The rest are logged as skipped."+(L.lanes.length>1?" This finishes the workout for all "+L.lanes.length+" clients.":""),no:"Keep going",yes:"Finish workout",run:finish}); finish()};
  A.lwclose=function(){ if(L&&!L.done&&!L.view&&total()[0]) return M.confirm({title:"Leave this workout?",body:"The sets you logged are not saved until you finish.",no:"Keep going",yes:"Leave without saving",run:function(){L=null; draw(); M.render()}}); L=null; draw(); M.render()};
  A.lwout=function(id){var ln=L.lanes[+id], p=M.person(ln.pid), a=p.appts.filter(function(x){return x.id===ln.apptId})[0]; if(a){ if(a.status!=="in") M.sess.checkIn(p,a); var m=M.sess.checkOut(p,a); ln.canOut=false; draw(); M.toast(m)} };
  A.lwprofile=function(id){L=null; draw(); M.go({page:"clients",id:id})};
  M.changes.push(function(e2){var d=e2.dataset||{}; if(d.lwtab&&L){return A.lwsendset(d.lwtab+":"+e2.value)} if(d.lwrest&&L){var a=ids(d.lwrest); L.lanes[a[0]].ex[a[1]].rest=+e2.value} });
  M.inputs.push(function(e2){ if(e2.id==="lwq"&&L&&L.pick){L.pick.q=e2.value; var ln=L.lanes[L.pick.lane], cur=L.pick.ex!=null?ln.ex[L.pick.ex]:null, def=cur&&DB.EX.filter(function(x){return x.name.toLowerCase()===cur.name.toLowerCase()})[0], q=e2.value.toLowerCase(); $("lwres").innerHTML=resHTML(DB.EX.filter(function(x){return x.status!=="Archived"&&(!cur||x.name!==cur.name)&&(!q||x.name.toLowerCase().indexOf(q)>=0)}).sort(function(a,b){return (def&&b.move===def.move?1:0)-(def&&a.move===def.move?1:0)||a.name.localeCompare(b.name)}).slice(0,q?12:8),def)} });
})();
