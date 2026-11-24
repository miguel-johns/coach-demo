/* Shell: routing, the top bar, the Milton panel, side panels, confirm window, toast, calls.
   Each area registers a page in M.pages and its click handlers in M.acts. */
var M = (function(){
  var $ = function(id){return document.getElementById(id)};
  var MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  var M = {pages:{}, acts:{}, changes:[], submits:{}, inputs:[], route:{page:"home"}, chatLog:[], panel:null, call:null, cp:null, queue:[]};
  M.$ = $;
  M.esc = function(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})};
  M.fm = function(n){return "$"+Number(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g,",")};
  M.plural = function(n,w,ws){return n+" "+(n===1?w:(ws||w+"s"))};
  M.fd = function(iso){var a=iso.split("-");return MON[+a[1]-1]+" "+(+a[2])+(a[0]!=="2026"?", "+a[0]:"")};
  M.addDays = function(iso,n){var a=iso.split("-");return new Date(Date.UTC(+a[0],+a[1]-1,+a[2]+n)).toISOString().slice(0,10)};
  M.initials = function(n){var p=n.trim().split(/\s+/);return (p[0][0]+(p.length>1?p[p.length-1][0]:"")).toUpperCase()};
  M.first = function(n){return n.split(" ")[0]};
  M.you = function(){return DB.TEAM.filter(function(t){return t.you})[0]};

  /* people */
  M.person = function(id){
    var p=DB.people.filter(function(x){return x.id===id})[0]; if(!p) return null;
    if(!p._n){
      p._n=true;
      ["plans","past","appts","visits","links","tx","docs","thread","tags"].forEach(function(k){if(!p[k]) p[k]=[]});
      if(p.unnamed){p.first="this person"; p.initials="#"} else {p.first=M.first(p.name); p.initials=M.initials(p.name)}
      if(p.textOk===undefined) p.textOk=true;
      if(!p.replies) p.replies="No replies yet";
      if(!p.details) p.details=[["Birthday",null],["Emergency contact",null],["Came in through",p.source],["Added",M.fd(p.added)]];
      if(!p.read) p.read=[p.name+" was added "+M.fd(p.added)+" from "+p.source.toLowerCase()+".","Nothing booked and nothing purchased yet."];
      if(!p.lastTouch) p.lastTouch="Nobody has reached out yet.";
      if(p.household&&p.household.ref){p.hhRef=p.household.ref}
    }
    return p;
  };
  M.people = function(){return DB.people.map(function(p){return M.person(p.id)})};
  M.household = function(p){var h=p.hhRef?M.person(p.hhRef).household:p.household; return h&&h.members?h:null};
  M.calc = function(p){
    if(!p.tx.length && !p.plans.length) return "Lead";
    if(p.plans.length || p.appts.some(function(a){return a.paid})) return "Customer";
    return "Past customer";
  };
  M.status = function(p){return p.manual||M.calc(p)};
  M.statusChip = function(s,cls){return '<span class="chip '+(s==="Lead"?"warn":(s==="Customer"?"solid":""))+(cls?" "+cls:"")+'">'+s+'</span>'};
  M.coachOpts = function(sel){
    var o=function(t){return '<option value="'+M.esc(t.name)+'"'+(sel===t.name?" selected":"")+'>'+M.esc(t.name)+(t.role==="Coach"?"":", "+t.role)+'</option>'};
    return '<optgroup label="Coaches">'+DB.TEAM.filter(function(t){return t.role==="Coach"}).map(o).join("")+'</optgroup><optgroup label="Managers and Admins">'+DB.TEAM.filter(function(t){return t.role!=="Coach"}).map(o).join("")+'</optgroup>';
  };
  M.dupOf = function(id){return DB.dups.filter(function(d){return d.keep===id||d.drop===id})[0]};

  /* toast */
  var toastT;
  M.toast = function(msg,undo){
    var t=$("toast"); t.textContent=msg; t.classList.toggle("act",!!undo);
    if(undo){var u=document.createElement("button");u.textContent="Undo";u.onclick=function(){t.classList.remove("on");undo()};t.appendChild(u)}
    t.classList.add("on"); clearTimeout(toastT);
    toastT=setTimeout(function(){t.classList.remove("on");t.classList.remove("act")},undo?10000:3600);
  };
  /* A screen this prototype has not built yet. Says so plainly. */
  M.later = function(what){M.toast(what+" is not built in this prototype yet.")};

  /* side panel: M.openPanel(name,arg) asks the current page, then shared panels */
  M.panels = {};
  M.openPanel = function(name,arg){M.panel={name:name,arg:arg||null,pick:null}; M.renderPanel()};
  M.closePanel = function(){M.panel=null; M.renderPanel()};
  M.px = '<button class="ico" data-act="pclose" aria-label="Close">&#10005;</button>';
  M.renderPanel = function(){
    var el=$("spanel"), on=!!M.panel;
    $("scrim").classList.toggle("on",on); el.classList.toggle("on",on);
    if(!on){el.innerHTML="";return}
    var fn=M.panels[M.panel.name]; el.innerHTML=fn?fn(M.panel):"";
    var f=el.querySelector("[autofocus]"); if(f) f.focus();
  };
  /* centered window, only to confirm something that cannot be undone */
  M.confirm = function(o){
    M._cf=o;
    $("confirm").innerHTML='<div class="cwin" role="alertdialog" aria-modal="true"><h3>'+M.esc(o.title)+'</h3><div>'+o.body+'</div><div class="acts" style="justify-content:flex-end"><button class="btn" data-act="cfno">'+M.esc(o.no||"Cancel")+'</button><button class="btn dangerfill" data-act="cfyes">'+M.esc(o.yes)+'</button></div></div>';
    $("confirm").hidden=false;
  };

  /* routing. Views that are worth a link get a plain hash name. */
  M.go = function(r){
    if(typeof r==="string") r={page:r};
    /* the trail: when a link carries you from one card into another, remember where you were so one click goes back */
    var cur=M.route, T=M.trail, top=T[T.length-1];
    if(r.page==="home") M.trail=[];
    else if(!M._back&&cur&&cur.page&&cur.page!=="home"&&cur.page!==r.page){ if(top&&top.r.page===r.page) T.pop(); else{T.push({r:cur,y:window.scrollY||0}); if(T.length>12) T.shift()} }
    M.route=r; M.panel=null; M.chatLog=[];
    try{var h=r.page==="home"?"":(r.page+(r.tab?"-"+r.tab:"")); if(location.hash.replace("#","")!==h) history.replaceState(null,"",h?"#"+h:location.pathname+location.search)}catch(e){}
    M.render(); window.scrollTo(0,0);
  };
  M.trail=[];
  M.acts.trailback=function(){var p=M.trail.pop(); if(!p) return; M._back=true; M.go(p.r); M._back=false; window.scrollTo(0,p.y)};
  M.render = function(){
    var r=M.route, pg=M.pages[r.page]||M.pages.home;
    var keep={}, ae=document.activeElement;
    ["q","msgInput"].forEach(function(id){var e=$(id); if(e) keep[id]={v:e.value,f:ae===e}});
    $("pageTitle").textContent=pg.title;
    $("homeX").hidden=r.page==="home";
    var tb=$("trailB"), last=M.trail[M.trail.length-1], lt=last&&(M.pages[last.r.page]||{}).title; if(tb){tb.hidden=!last; if(last){tb.innerHTML="&#8249; "+M.esc(lt||"Back"); tb.setAttribute("aria-label","Back to "+(lt||"where you were"))}}
    var tabs=pg.tabs?pg.tabs(r):null;
    $("ptabs").innerHTML=tabs?tabs.map(function(t){return '<button data-act="tab" data-id="'+t[0]+'"'+((r.tab||tabs[0][0])===t[0]?' aria-current="page"':'')+'>'+t[1]+(t[2]?'<span class="n">'+t[2]+'</span>':'')+'</button>'}).join(""):"";
    $("ptabs").hidden=!tabs;
    var top=pg.top?pg.top(r):null;
    $("topBtn").innerHTML=top?'<button class="btn pri" data-act="'+top[0]+'" data-id="'+(top[2]||"")+'">'+top[1]+'</button>':"";
    $("app").innerHTML=pg.render(r);
    Object.keys(keep).forEach(function(id){var e=$(id); if(e){e.value=keep[id].v; if(keep[id].f) e.focus()}});
    if(pg.after) pg.after(r);
    M.renderChat(); M.renderPanel(); M.renderCall();
  };
  M.renderChat = function(){
    var pg=M.pages[M.route.page]||M.pages.home, b=pg.brief?pg.brief(M.route):{hd:"",items:[]};
    var h='<div class="mcard"><div class="hd">'+b.hd+'</div>'+(b.items&&b.items.length?'<ul>'+b.items.map(function(x){return '<li>'+x+'</li>'}).join("")+'</ul>':"")+'</div>';
    M.chatLog.forEach(function(c){h+=c.me?'<div class="ubub">'+M.esc(c.text)+'</div>':'<div class="mcard plain">'+M.esc(c.text)+(c.html||"")+'</div>'});
    $("chatBody").innerHTML=h; $("chatBody").scrollTop=$("chatBody").scrollHeight;
    $("sugg").innerHTML=(b.sugg||[]).map(function(s){return '<button data-act="ask" data-id="'+M.esc(s)+'">'+M.esc(s)+'</button>'}).join("");
    $("chatInput").placeholder=b.hint||"Ask Milton";
  };
  M.say = function(me,reply,html){M.chatLog.push({me:true,text:me},{text:reply,html:html}); M.renderChat()};

  /* calls: the choice card, then the live call bar */
  function fmt(ms){var x=Math.floor(ms/1000);return Math.floor(x/60)+":"+("0"+(x%60)).slice(-2)}
  M.startCall = function(id){ if(M.call){M.toast("Finish the current call first.");return} M.queue=[]; M.cp={id:id}; M.closePanel(); M.renderCall() };
  M.renderCall = function(){
    var h="", c;
    if(M.cp && (c=M.person(M.cp.id))){
      h+='<div class="callbar" role="dialog" aria-label="Start a call"><div class="r"><div class="av">'+c.initials+'</div><div><div class="s2">'+(M.queue.length?"Calling new leads, "+M.queue.length+" more after this":"Call from the gym number")+'</div><div class="nm2">'+M.esc(c.name)+'</div><div class="s2">'+M.status(c)+", "+c.phone+". "+M.esc(c.source)+'.</div></div></div><div class="acts"><button class="btn gogo" data-act="cstart" data-id="browser">Call from this computer</button><button class="btn" data-act="cstart" data-id="phone">Ring the gym phone first</button>'+(M.queue.length?'<button class="btn" data-act="cskip">Skip</button>':"")+'<button class="btn" data-act="ccancel">'+(M.queue.length?"Stop":"Cancel")+'</button></div></div>';
    }
    if(M.call && (c=M.person(M.call.id))){
      h+='<div class="callbar"><div class="r"><div class="av">'+c.initials+'</div><div><div class="s2">'+(M.call.mode==="phone"?"On the gym phone":"In the browser")+'</div><div class="nm2">'+M.esc(c.name)+'</div></div><div class="tmr" id="callT">'+fmt(Date.now()-M.call.t0)+'</div></div><div class="s2">Recording with a notice. The person sees the gym number, '+DB.GYM.num+'.</div><div class="acts"><button class="btn" data-act="cmute">Mute</button><button class="btn" data-act="cmove">'+(M.call.mode==="phone"?"Move to this computer":"Move to the gym phone")+'</button><button class="btn end" data-act="cend">End call</button></div></div>';
    }
    if(M.callExtra) h+=M.callExtra();
    $("callLayer").innerHTML=h;
  };
  setInterval(function(){var t=$("callT"); if(t&&M.call) t.textContent=fmt(Date.now()-M.call.t0)},1000);
  function nextInQueue(){M.cp=null; while(M.queue.length){var n=M.queue.shift(); if(M.person(n)){M.cp={id:n}; break}}}

  /* shared actions */
  M.acts.go = function(id){M.go(id)};
  M.acts.tab = function(id){M.go({page:M.route.page,tab:id})};
  M.acts.pclose = function(){M.closePanel()};
  M.acts.panel = function(id){var m=id.split(":"); M.openPanel(m[0],m[1])};
  M.acts.pick = function(id){M.panel.pick=id; M.renderPanel()};
  M.acts.later = function(id){M.later(id)};
  M.acts.cfno = function(){$("confirm").hidden=true};
  M.acts.cfyes = function(){$("confirm").hidden=true; if(M._cf&&M._cf.run) M._cf.run()};
  M.acts.chatup = function(){var up=$("chat").classList.toggle("up"); $("chatTog").textContent=up?"Close":"Open"};
  M.acts.ask = function(id){
    var pg=M.pages[M.route.page]; if(pg&&pg.ask&&pg.ask(id)) return;
    M.say(id,"In the live app I would do that here and show you before anything sends or saves.");
  };
  M.acts.record = function(id){M.go({page:"crm",tab:"contacts",id:id})};
  M.acts.usermenu = function(){
    var u=$("umenu"), y=M.you();
    u.innerHTML='<div class="who"><b>'+y.name+'</b><div class="m">'+y.role+" at "+DB.GYM.name+'</div></div><button data-act="go" data-id="settings"><b>Settings</b><span class="m">Your profile, the gym, payments, calendar and messaging</span></button><button data-act="later" data-id="The Help Center"><b>Help Center</b></button><button data-act="later" data-id="Log out"><b>Log out</b></button>';
    u.hidden=!u.hidden;
  };
  M.acts.copy = function(id){try{navigator.clipboard.writeText(id).then(function(){M.toast("Copied "+id)},function(){M.toast(id)})}catch(e){M.toast(id)}};
  M.acts.callp = function(id){M.startCall(id)};
  M.acts.cstart = function(id){M.call={id:M.cp.id,mode:id,t0:Date.now()}; M.cp=null; M.renderCall(); M.toast(id==="phone"?"Ringing the gym phone. Prototype only, no call was placed.":"Calling. Prototype only, no call was placed.")};
  M.acts.cmute = function(){M.toast("Muted. Prototype only.")};
  M.acts.cmove = function(){M.call.mode=M.call.mode==="phone"?"browser":"phone"; M.renderCall()};
  M.acts.cend = function(){
    var p=M.person(M.call.id), mode=M.call.mode; M.call=null;
    p.thread.push({k:"call",day:"Today",t:"just now",title:(mode==="phone"?"Call through the gym phone":"Call from this computer")+", "+M.you().name,body:"The summary and transcript attach here within about a minute of hanging up.",pending:true});
    if((p.milton||p.miltonBooked||p.handoff)&&M.takeOver) M.takeOver(p); p.cleared=false;
    nextInQueue(); M.render(); if(M.afterCall) M.afterCall(p); M.toast("Call with "+p.name+" logged on their record and in the Inbox.");
  };
  M.acts.cskip = function(){nextInQueue(); M.renderCall()};
  M.acts.ccancel = function(){M.cp=null; M.queue=[]; M.renderCall()};
  M.callQueue = function(ids){ if(M.call){M.toast("Finish the current call first.");return} M.queue=ids.slice(); nextInQueue(); M.renderCall() };

  /* events */
  document.addEventListener("click",function(e){
    if(!e.target.closest("#umenu,[data-act='usermenu']")) $("umenu").hidden=true;
    if(!e.target.closest(".pswrap")) $("psres").hidden=true;
    if(e.target.closest("select,input,textarea,label")) return;
    var b=e.target.closest("[data-act]");
    if(!b){ if(M.onBlank) M.onBlank(); return }
    var fn=M.acts[b.dataset.act];
    if(fn){ if(b.dataset.act!=="usermenu") $("umenu").hidden=true; fn(b.dataset.id,b,e) }
  });
  document.addEventListener("change",function(e){M.changes.forEach(function(f){f(e.target,e)})});
  document.addEventListener("input",function(e){
    if(e.target.id==="psearch") return psearch(e.target.value);
    M.inputs.forEach(function(f){f(e.target,e)});
  });
  document.addEventListener("submit",function(e){
    e.preventDefault();
    if(e.target.id==="chatForm"){var v=$("chatInput").value.trim(); if(!v) return; $("chatInput").value=""; $("chat").classList.add("up"); M.acts.ask(v); return}
    var f=M.submits[e.target.id]; if(f) f(e.target);
  });
  document.addEventListener("keydown",function(e){
    if(e.key!=="Escape") return;
    if(!$("confirm").hidden){$("confirm").hidden=true;return}
    if(M.panel){M.closePanel();return}
    $("umenu").hidden=true; $("psres").hidden=true; if(M.onBlank) M.onBlank();
  });
  /* person search in the top bar: finds a person from any page */
  function psearch(q){
    var box=$("psres"); q=q.trim().toLowerCase();
    if(!q){box.hidden=true;return}
    var hits=M.people().filter(function(p){return (p.name+" "+p.email+" "+p.phone).toLowerCase().indexOf(q)>=0}).slice(0,6);
    box.innerHTML=hits.length?hits.map(function(p,i){return '<button data-act="pshit" data-id="'+p.id+'"'+(i===0?' class="on"':'')+'><b>'+M.esc(p.name)+'</b><span class="m">'+M.status(p)+(p.coach?" · Client of "+M.esc(p.coach):"")+(p.phone&&!p.unnamed?" · "+p.phone:"")+'</span></button>'}).join(""):'<div class="m" style="padding:8px 10px">No one matches. Add them from Contacts.</div>';
    box.hidden=false;
  }
  M.acts.pshit = function(id){$("psearch").value=""; $("psres").hidden=true; M.acts.record(id)};
  document.addEventListener("keydown",function(e){
    if(e.target.id==="psearch"&&e.key==="Enter"){var b=$("psres").querySelector("button"); if(b&&!$("psres").hidden) M.acts.pshit(b.dataset.id)}
  });
  return M;
})();
