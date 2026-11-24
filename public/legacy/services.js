/* Services & Packages: what the gym delivers (services) and what it sells for them (packages),
   plus passes, products, subscriptions, bundles and online links.
   A saved service opens on one page with Edit on each row. The steps are for a new service only.
   Rules come from the gym defaults unless a service sets its own. */
(function(){
  var esc=M.esc, $=M.$, fm=M.fm, G=DB.GYM, ITEMS=DB.ITEMS, SV=DB.SERVICES;
  G.rules=G.rules||{late:12,lateUses:true,noShowUses:true,notice:2,setup:0,cleanup:10,order:"book",currency:"USD"};
  var ORDER={pay:"Pay first, then book",book:"Book first, pay at check-in",free:"Book without payment"};
  var WITHIN=["30 days","90 days","6 months","1 year","No expiry"];
  /* fill in what the catalog does not carry yet */
  var EXTRA={semi:{kind:"Group",cap:4,who:["Tori Lane"]},sgt:{kind:"Group",cap:7,who:["Tori Lane"]},pt:{kind:"1-on-1",who:["Andre Lewis"]},rr:{kind:"Room",rooms:["Room B"]},mass:{kind:"1-on-1",who:["Renee Castillo"]},og:{kind:"Room",rooms:["Main floor"],cap:30},intro:{kind:"Group",cap:8,who:["Andre Lewis"],access:"Public"}};
  SV.forEach(function(s){var x=EXTRA[s.id]||{}; s.kind=x.kind||"1-on-1"; s.cap=x.cap||1; s.who=x.who||[]; s.rooms=x.rooms||[]; s.lens=[s.len]; s.hours="gym"; s.aud="All ages"; s.access=x.access||"People already with your gym"; s.book="Clients and team"; s.status="Live"; s.rules={own:false}});
  SV.filter(function(s){return s.id==="mass"})[0].rules={own:true,late:24,lateUses:true,noShowUses:true,notice:12,setup:10,cleanup:15,order:"book"};
  ITEMS.forEach(function(i){i.status="Live"; i.online=i.kind!=="product"||i.id==="tee"; if(i.id==="day"||i.id==="camp"){i.pass=true; i.good=30; i.works=i.id==="day"?["Open gym"]:["Semi-private"]} if(i.id==="nut"){i.sub1=true; i.billed="Monthly"; i.one=true; i.desc="A plan and weekly check-ins from your coach, in the app."} if(i.id==="rr4"){i.also=["Open gym"]; i.auto=true} if(i.kind==="pack"&&!i.pass) i.within=i.size===1?"30 days":"90 days"; if(i.kind==="product"){i.low=5; i.sku=""} });
  ITEMS.push({id:"introfree",svc:"Free intro class",name:"Drop-in",sub:"1 session, 45 min",price:0,free:true,kind:"pack",size:1,status:"Live",online:true,limit:"once",within:"30 days",hidden:true});
  var bundles=DB.bundles=[{id:"b1",name:"Train and recover",items:{pt8:1,rr4:1},price:650,status:"Live",online:true},{id:"b2",name:"New member starter",items:{pt1:2,ms1:1},price:199,status:"Draft",online:false}];
  var links=[{id:"shop",t:"shop",name:"Online shop",url:"northlinestrength.com/shop",on:true},{id:"l_sp2",t:"item",ref:"sp2",name:"Semi-Private 2x per week",url:"northlinestrength.com/join/semi-private",on:true},{id:"l_intro",t:"item",ref:"introfree",name:"Free intro class",url:"northlinestrength.com/intro",on:true},{id:"l_tee",t:"item",ref:"tee",name:"Northline tee",url:"northlinestrength.com/shop/tee",on:false}];
  var st={filt:"live",edit:null,w:null,pk:null,neu:null,item:null,err:[]};

  function svc(id){return SV.filter(function(s){return s.id===id})[0]||(st.neu&&st.neu.w.id===id?st.neu.w:null)}
  function pks(s){return s._pk||ITEMS.filter(function(i){return i.svc===s.name&&i.kind!=="product"&&!i.pass&&!i.sub1})}
  function pkKind(i){return i.kind==="membership"?"Membership":(i.size===1?"Drop-in":"Pack")}
  function pkPrice(i){return i.free||!i.price?"Free":fm(i.price)+(i.per?" a "+i.per:"")}
  function pkWhat(i){return i.kind==="membership"?(i.unlimited?"Unlimited sessions":i.size+" sessions a "+(i.per||"month")):(M.plural(i.size,"session")+(i.within&&i.within!=="No expiry"?", use within "+i.within:""))}
  function range(s){var a=pks(s).filter(function(i){return i.status!=="Archived"}).map(function(i){return i.free?0:i.price}); if(!a.length) return "No packages yet"; var lo=Math.min.apply(null,a), hi=Math.max.apply(null,a); return lo===hi?(lo?fm(lo):"Free"):(lo?fm(lo):"Free")+" to "+fm(hi)}
  function whoLine(s){return s.kind==="Room"?(s.rooms.length?s.rooms.join(", "):"No room yet"):(s.who==="none"?"No coach needed":(s.who==="later"||!s.who.length?"Coach picked later":s.who.join(", ")))}
  function R(s){return s.rules.own?s.rules:G.rules}
  function hrs(n,w){return n?M.plural(n,w||"hour"):"None"}
  function ruleLines(r){return [["Late cancel window",r.late?M.plural(r.late,"hour")+" before the session":"No window"],["A late cancel",r.lateUses?"Uses a session":"Does not use a session"],["A no-show",r.noShowUses?"Uses a session":"Does not use a session"],["Booking notice",r.notice?"At least "+M.plural(r.notice,"hour")+" ahead":"None"],["Setup and cleanup",hrs(r.setup,"minute")+" before, "+hrs(r.cleanup,"minute").toLowerCase()+" after"],["Paying and booking",ORDER[r.order]]]}
  function chip(sx){return '<span class="chip '+(sx==="Live"?"ok":(sx==="Draft"?"mist":""))+'">'+sx+'</span>'}
  function seg(act,cur,opts){return '<div class="seg" role="group">'+opts.map(function(o){var v=o.pop?o[0]:o, t=o.pop?o[1]:o; return '<button data-act="'+act+'" data-id="'+esc(v)+'" aria-pressed="'+(String(cur)===String(v))+'">'+esc(t)+'</button>'}).join("")+'</div>'}
  function sw(act,id,on,label){return '<button class="sw" role="switch" data-act="'+act+'" data-id="'+id+'" aria-checked="'+!!on+'" aria-label="'+esc(label)+'"></button>'}
  function field(id,label,val,x){return '<div class="field"><label for="'+id+'">'+label+'</label><input id="'+id+'" value="'+esc(val==null?"":val)+'" autocomplete="off" '+(x||"")+'></div>'}

  /* ---------- the list ---------- */
  function listHTML(){
    var rows=SV.filter(function(s){return st.filt==="all"||(st.filt==="arch"?s.status==="Archived":s.status!=="Archived")});
    var h='<div class="rbar" style="margin-bottom:12px">'+seg("vfilt",st.filt,[["live","Live and drafts"],["arch","Archived"],["all","All"]])+'<span class="sp"></span><span class="m">Rules such as the late cancel window come from your <button class="link" data-act="vdefaults">gym defaults</button>.</span></div><section class="card flush"><div class="tw" style="border-top:0"><table class="pin"><thead><tr><th>Service</th><th>Lengths</th><th>Packages</th><th>Price</th><th>Coach or room</th><th>Status</th><th></th></tr></thead><tbody>';
    if(!rows.length) h+='<tr><td colspan="7"><div class="none">'+(st.filt==="arch"?"Nothing is archived.":"No services yet. Add your first one with New.")+'</div></td></tr>';
    rows.forEach(function(s){var n=pks(s).filter(function(i){return i.status!=="Archived"}).length;
      h+='<tr class="go" data-act="vopen" data-id="'+s.id+'"><td><b>'+esc(s.name)+'</b><div class="m">'+s.kind+(s.kind!=="1-on-1"?", up to "+M.plural(s.cap,"person","people"):"")+'</div></td><td>'+s.lens.map(function(l){return l+" min"}).join(", ")+'</td><td>'+(n?M.plural(n,"package"):"None yet")+'</td><td>'+range(s)+'</td><td>'+esc(whoLine(s))+'</td><td>'+chip(s.status)+(s.rules.own?' <span class="chip">Own rules</span>':"")+'</td><td><div class="ract"><button class="btn sm quiet" data-act="vopen" data-id="'+s.id+'">Edit</button></div></td></tr>'});
    return h+'</tbody></table></div></section>';
  }

  /* ---------- one service on one page ---------- */
  var SECT=[["basics","Basics"],["lengths","Lengths"],["who","Coaches"],["hours","Schedule"],["pricing","Packages"],["rules","Rules"]];
  function sectTitle(k,s){return k==="who"&&s.kind==="Room"?"Rooms":SECT.filter(function(x){return x[0]===k})[0][1]}
  function viewRows(k,s){
    if(k==="basics") return [["Name",esc(s.name)],["Kind",s.kind+(s.kind==="Group"?", up to "+M.plural(s.cap,"person","people"):(s.kind==="Room"?", up to "+M.plural(s.cap,"person","people")+" at a time":""))],["Who it is for",s.aud],["Booking",s.access+", "+s.book.toLowerCase()+" can book"]];
    if(k==="lengths") return [["Lengths sold",s.lens.map(function(l){return l+" min"}).join(", ")]];
    if(k==="who") return [[s.kind==="Room"?"Rooms":"Coaches",esc(whoLine(s))]];
    if(k==="hours") return [["Hours",s.hours==="gym"?"Your gym hours: Mon to Fri 5:00 AM to 8:00 PM, Sat 8:00 AM to 1:00 PM":esc(s.hours)]].concat(s.times&&s.times.length?[["Usual start times",s.times.join(", ")]]:[]);
    if(k==="rules") return ruleLines(R(s));
    return [];
  }
  function formHTML(k,s){
    if(k==="basics") return field("vName","Name, as clients say it",s.name,'placeholder="Personal training"')+'<div class="field"><label>Kind</label>'+seg("vset","kind:"+s.kind,[["kind:1-on-1","1-on-1"],["kind:Group","Group"],["kind:Room","Room"]])+'<div class="m" style="margin-top:4px">'+(s.kind==="Room"?"A space people book, with no coach. Open gym, a recovery room, a sauna.":(s.kind==="Group"?"A class or small group with a coach.":"One client with one coach."))+'</div></div>'+(s.kind!=="1-on-1"?field("vCap","How many people at once",s.cap,'inputmode="numeric" style="max-width:120px"'):"")+'<div class="field"><label>Who it is for</label>'+seg("vset","aud:"+s.aud,[["aud:All ages","All ages"],["aud:Adults","Adults"],["aud:Kids","Kids"]])+'</div><div class="field"><label>Booking</label>'+seg("vset","access:"+s.access,[["access:People already with your gym","People already with your gym"],["access:Public","Public"]])+'</div><div class="field"><label>Who can book</label>'+seg("vset","book:"+s.book,[["book:Clients and team","Clients and team"],["book:Team only","Team only"]])+'</div>';
    if(k==="lengths") return '<div class="field"><label>Every length you sell</label><div class="pills">'+[20,30,45,50,60,90].map(function(l){return '<button data-act="vlen" data-id="'+l+'" aria-pressed="'+(s.lens.indexOf(l)>=0)+'">'+l+' min</button>'}).join("")+'</div><div class="m" style="margin-top:6px">Each length gets its own packages and prices.</div></div>';
    if(k==="who"){ if(s.kind==="Room") return field("vRooms","Rooms, separated by commas",s.rooms.join(", "),'placeholder="Room A, Room B"')+'<div class="m">Each room takes one booking at a time unless the service allows more people at once.</div>';
      return '<div class="field"><label>Who delivers it</label>'+DB.TEAM.map(function(t){return '<label class="pk" style="border:1px solid var(--line);border-radius:10px;margin-top:6px"><input type="checkbox" class="pick" data-vwho="'+esc(t.name)+'"'+(s.who.indexOf&&s.who.indexOf(t.name)>=0?" checked":"")+'><span><b style="font-weight:600">'+esc(t.name)+'</b> <span class="m">'+t.role+'</span></span><span class="m">'+(t.id==="rn"?"Calendar not connected":"Calendar connected")+'</span></label>'}).join("")+'</div><div class="acts"><button class="btn sm'+(s.who==="none"?" hl":"")+'" data-act="vset" data-id="who:none">No coach needed</button><button class="btn sm'+(s.who==="later"?" hl":"")+'" data-act="vset" data-id="who:later">Pick coaches later</button></div><div class="m">Milton books around each coach\'s connected calendar.</div>'}
    if(k==="hours") return '<div class="field"><label>When it can be booked</label>'+seg("vset","hours:"+(s.hours==="gym"?"gym":"own"),[["hours:gym","Your gym hours"],["hours:own","Its own hours"]])+'</div>'+(s.hours==="gym"?'<div class="m">Mon to Fri 5:00 AM to 8:00 PM, Sat 8:00 AM to 1:00 PM. Change these on Schedule.</div>':field("vHours","Hours for this service",s.hours==="own"?"":s.hours,'placeholder="Tue and Thu, 9:00 AM to 4:00 PM"'))+field("vTimes","Usual start times, separated by commas",(s.times||[]).join(", "),'placeholder="9:00 AM, 12:00 PM, 5:30 PM"');
    if(k==="rules"){var r=s.rules, d=G.rules;
      var h='<div class="field"><label>Rules for this service</label>'+seg("vset","own:"+(r.own?"1":"0"),[["own:0","Use the gym defaults"],["own:1","Set its own"]])+'</div>';
      if(!r.own) return h+'<div class="infobox">This service follows your gym defaults. Change them once in Settings and every service that uses them follows. <button class="link" data-act="vdefaults">Open gym defaults</button></div><dl class="vrows">'+ruleLines(d).map(function(x){return '<div><dt>'+x[0]+'</dt><dd>'+x[1]+'</dd></div>'}).join("")+'</dl>';
      return h+'<div class="two">'+field("vLate","Late cancel window, in hours",r.late,'inputmode="numeric"')+field("vNotice","Booking notice, in hours",r.notice,'inputmode="numeric"')+field("vSetup","Setup time before, in minutes",r.setup,'inputmode="numeric"')+field("vClean","Cleanup time after, in minutes",r.cleanup,'inputmode="numeric"')+'</div><div class="field"><label>A late cancel</label>'+seg("vset","lateUses:"+(r.lateUses?"1":"0"),[["lateUses:1","Uses a session"],["lateUses:0","Does not use a session"]])+'</div><div class="field"><label>A no-show</label>'+seg("vset","noShowUses:"+(r.noShowUses?"1":"0"),[["noShowUses:1","Uses a session"],["noShowUses:0","Does not use a session"]])+'</div><div class="field"><label>Paying and booking</label>'+seg("vset","order:"+r.order,[["order:pay",ORDER.pay],["order:book",ORDER.book],["order:free",ORDER.free]])+'</div>'}
    return "";
  }
  /* read typed values into the working copy before anything re-renders */
  function grab(){
    grabPk(); var s=st.neu?st.neu.w:st.w; if(!s) return;
    var g=function(id){var e=$(id); return e?e.value.trim():null}, n=function(id,cur){var v=g(id); if(v===null) return cur; v=parseInt(v,10); return isNaN(v)||v<0?cur:v}, v;
    if((v=g("vName"))!==null) s.name=v;
    s.cap=Math.max(1,n("vCap",s.cap));
    if((v=g("vRooms"))!==null) s.rooms=v?v.split(",").map(function(x){return x.trim()}).filter(Boolean):[];
    if((v=g("vHours"))!==null) s.hours=v||"own";
    if((v=g("vTimes"))!==null) s.times=v?v.split(",").map(function(x){return x.trim()}).filter(Boolean):[];
    if(s.rules.own){s.rules.late=n("vLate",s.rules.late); s.rules.notice=n("vNotice",s.rules.notice); s.rules.setup=n("vSetup",s.rules.setup); s.rules.cleanup=n("vClean",s.rules.cleanup)}
  }
  function check(k,s){
    if(k==="basics"){ if(!s.name) return "Add a name."; if(SV.some(function(x){return x!==s&&x.id!==s.id&&x.name.toLowerCase()===s.name.toLowerCase()})) return "Another service already has that name." }
    if(k==="lengths"&&!s.lens.length) return "Pick at least one length.";
    if(k==="who"&&s.kind==="Room"&&!s.rooms.length) return "Add at least one room.";
    if(k==="who"&&s.kind!=="Room"&&s.who.pop&&!s.who.length) return "Pick a coach, or choose No coach needed or Pick coaches later.";
    if(k==="hours"&&s.hours==="own") return "Add the hours for this service.";
    if(k==="pricing"&&!pks(s).length) return "Add at least one package so there is something to sell.";
    return "";
  }

  /* packages inside a service */
  function pkBlank(s){return {id:null,svc:s.name,name:"",kind:"pack",size:1,price:"",free:false,within:"30 days",per:"month",unlimited:false,auto:false,limit:"none",limitN:"2",also:[],online:true,status:"Live",tip:!!s.tip}}
  function pkForm(s){
    var p=st.pk.w, kind=pkKind(p), mem=p.kind==="membership", isNew=!st.pk.id;
    var h='<div class="pked"><div class="ch"><h3>'+(isNew?"New package":esc(p.name))+'</h3><span class="m">'+esc(s.name)+'</span></div>';
    if(isNew) h+='<div class="field"><label>Kind</label>'+seg("vpkset","t:"+(mem?"m":(p.size===1&&p._drop!==false?"d":"p")),[["t:d","Drop-in"],["t:p","Pack"],["t:m","Membership"]])+'<div class="m" style="margin-top:4px">'+(mem?"A monthly or weekly charge with sessions to book.":(kind==="Drop-in"&&p._drop!==false?"One session of this service.":"A set number of sessions, paid once."))+'</div></div>';
    h+='<div class="two">'+field("vpName","Name",p.name,'placeholder="'+(mem?"Unlimited":(kind==="Drop-in"?"Drop-in":"8-pack"))+'"');
    if(mem) h+='<div class="field"><label for="vpSize">Sessions each '+p.per+'</label><div class="rbar"><input id="vpSize" inputmode="numeric" style="max-width:100px" value="'+(p.unlimited?"":esc(p.size))+'"'+(p.unlimited?" disabled":"")+'>'+sw("vpkset","unlimited",p.unlimited,"Unlimited")+'<span>Unlimited</span></div></div>';
    else if(!(isNew&&p._drop!==false&&p.size===1)) h+=field("vpSize","Sessions",p.size,'inputmode="numeric" style="max-width:120px"');
    h+='</div><div class="two"><div class="field"><label for="vpPrice">Price (USD)'+(mem?" each "+p.per:"")+'</label><div class="rbar"><input id="vpPrice" inputmode="decimal" style="max-width:130px" value="'+(p.free?"":esc(p.price))+'"'+(p.free?" disabled":"")+'>'+sw("vpkset","free",p.free,"This is free")+'<span>This is free</span></div></div>';
    h+=mem?'<div class="field"><label>Billed</label>'+seg("vpkset","per:"+p.per,[["per:month","Monthly"],["per:week","Weekly"]])+'</div>':'<div class="field"><label for="vpWithin">Use within</label><select id="vpWithin">'+WITHIN.map(function(w){return '<option'+(p.within===w?" selected":"")+'>'+w+'</option>'}).join("")+'</select></div>';
    h+='</div>';
    if(!mem&&kind!=="Drop-in") h+='<div class="setrow"><div><b>Renew automatically</b><div class="m">When the last session is checked out, charge the card on file and start a new pack. Booking the last session does not trigger it. With no card on file, the front desk gets a Renew reminder on the session.</div></div>'+sw("vpkset","auto",p.auto,"Renew automatically")+'</div>';
    h+='<div class="field"><label>How many can one person buy?</label><div class="rbar">'+seg("vpkset","limit:"+p.limit,[["limit:none","No limit"],["limit:once","Once"],["limit:n","Set a number"]])+(p.limit==="n"?'<input class="fld" id="vpLimitN" inputmode="numeric" style="width:80px" value="'+esc(p.limitN||"2")+'" aria-label="How many">':"")+'</div><div class="m" style="margin-top:4px">Use Once for an intro offer. The limit counts per person, not per household.</div></div>';
    if(kind!=="Drop-in"||mem){var others=SV.filter(function(x){return x.name!==s.name&&p.also.indexOf(x.name)<0&&x.status!=="Archived"});
      h+='<div class="field"><label>Credits are also good for</label><div class="rbar">'+(p.also.length?p.also.map(function(a){return '<span class="chip mist">'+esc(a)+' <button class="xbtn" data-act="vpkset" data-id="rm:'+esc(a)+'" aria-label="Remove '+esc(a)+'">&#10005;</button></span>'}).join(""):'<span class="m">Only '+esc(s.name.toLowerCase())+'</span>')+(others.length?'<select class="csel" data-vpalso="1" aria-label="Add a service"><option value="">Add a service</option>'+others.map(function(x){return '<option>'+esc(x.name)+'</option>'}).join("")+'</select>':"")+'</div><div class="m" style="margin-top:4px">One credit is one session of any service listed here.</div></div>'}
    if(mem) h+='<div class="setrow"><div><b>AI in the app</b><div class="m">Same as the gym default. Change it to give these members more, such as AI coaching.</div></div><button class="btn sm" data-act="later" data-id="AI access for a membership">Change</button></div>';
    h+='<div class="setrow"><div><b>Clients can buy this online</b><div class="m">In your online shop and by link. Your team can always sell it at the front desk.</div></div>'+sw("vpkset","online",p.online,"Clients can buy this online")+'</div>';
    h+='<div class="acts" style="margin-top:12px"><button class="btn hl" data-act="vpksave">Save package</button><button class="btn quiet" data-act="vpkcancel">Cancel</button>'+(isNew?"":'<span class="sp" style="flex:1"></span><button class="btn sm danger" data-act="vpkarch">'+(p.status==="Archived"?"Restore":"Archive")+'</button>')+'<span class="errline" id="vpErr"></span></div>'+(isNew?"":'<div class="m" style="margin-top:6px">People who already hold this package keep it and renew at the price they bought at.</div>')+'</div>';
    return h;
  }
  function grabPk(){
    if(!st.pk) return; var p=st.pk.w, e;
    if((e=$("vpName"))) p.name=e.value.trim();
    if((e=$("vpSize"))&&!e.disabled){var n=parseInt(e.value,10); if(!isNaN(n)&&n>0){p.size=n; if(p.kind==="pack"&&n>1) p._drop=false}}
    if((e=$("vpPrice"))&&!e.disabled) p.price=e.value.replace(/[$,\s]/g,"");
    if((e=$("vpWithin"))) p.within=e.value;
    if((e=$("vpLimitN"))) p.limitN=e.value.replace(/\D/g,"")||"2";
  }
  function pricingHTML(s,editable){
    var list=pks(s), h="";
    if(!list.length&&!(st.pk&&st.pk.sid===s.id)) h+='<div class="empty"><span>No packages yet. A package is how someone pays for this service: a drop-in, a pack or a membership.</span></div>';
    list.forEach(function(i){
      if(st.pk&&st.pk.sid===s.id&&st.pk.id===i.id){h+=pkForm(s); return}
      var bits=[pkWhat(i)]; if(i.auto) bits.push("renews automatically"); if(i.limit==="once") bits.push("one per person"); else if(i.limit==="n") bits.push("up to "+i.limitN+" per person"); if(i.also&&i.also.length) bits.push("also good for "+i.also.join(", ").toLowerCase()); if(!i.online) bits.push("front desk only");
      h+='<div class="row"><div class="what"><div class="t">'+esc(i.name)+' <span class="chip">'+pkKind(i)+'</span>'+(i.status!=="Live"?" "+chip(i.status):"")+'</div><div class="m">'+esc(bits.join(" · "))+'</div></div><div class="amt">'+pkPrice(i)+'</div>'+(editable?'<div class="acts"><button class="btn sm" data-act="vpk" data-id="'+s.id+":"+i.id+'">Edit</button></div>':"")+'</div>';
    });
    if(st.pk&&st.pk.sid===s.id&&!st.pk.id) h+=pkForm(s);
    else if(editable) h+='<div style="margin-top:10px"><button class="btn sm" data-act="vpk" data-id="'+s.id+':">Add a package</button></div>';
    return h;
  }
  function howHTML(s){
    var r=R(s), l=pks(s).filter(function(i){return i.status==="Live"});
    return '<div class="infobox"><div class="k" style="color:inherit">How it books</div><div style="margin-top:6px"><b>'+(s.name?esc(s.name):"Your service")+'</b>, '+s.lens.map(function(x){return x+" min"}).join(" or ")+", "+esc(whoLine(s))+'.</div><div style="margin-top:6px">'+(s.access==="Public"?"Anyone":"Members")+" can book "+(s.book==="Team only"?"through your team":"themselves or through your team")+(r.notice?", at least "+M.plural(r.notice,"hour")+" ahead":"")+'.</div><div style="margin-top:6px">'+(l.length?M.plural(l.length,"package")+" for sale, "+range(s).toLowerCase()+".":"Nothing for sale yet.")+'</div><div style="margin-top:6px">'+(r.late?"Canceling inside "+M.plural(r.late,"hour")+(r.lateUses?" uses a session.":" does not use a session."):"No late cancel window.")+" "+ORDER[r.order]+'.</div>'+(s.times&&s.times.length?'<div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--mist-line);font-size:13.5px"><b>Schedule preview:</b> '+esc(s.times.slice(0,5).join(", "))+'</div>':"")+'</div>';
  }
  function cardFor(k,s,editable){
    var editing=st.edit===k&&st.w&&st.w.id===s.id, t=sectTitle(k,s);
    if(k==="pricing") return '<section class="card" id="vsec_pricing"><div class="ch"><h3>Packages</h3><span class="m">What people buy for this service</span></div>'+pricingHTML(s,editable)+'</section>';
    if(editing) return '<section class="card" id="vsec_'+k+'"><div class="ch"><h3>'+t+'</h3></div><div class="stack" style="gap:12px">'+formHTML(k,st.w)+'</div><div class="acts" style="margin-top:14px"><button class="btn hl" data-act="vsave">Save</button><button class="btn quiet" data-act="vcancel">Cancel</button><span class="errline">'+esc(st.err[0]||"")+'</span></div></section>';
    return '<section class="card" id="vsec_'+k+'"><div class="ch"><h3>'+t+(k==="rules"?(s.rules.own?' <span class="chip">Own rules</span>':' <span class="chip mist">Gym defaults</span>'):"")+'</h3>'+(editable?'<button class="btn sm" data-act="vedit" data-id="'+k+'">Edit</button>':"")+'</div><dl class="vrows">'+viewRows(k,s).map(function(x){return '<div><dt>'+x[0]+'</dt><dd>'+x[1]+'</dd></div>'}).join("")+'</dl></section>';
  }
  function serviceHTML(s){
    var arch=s.status==="Archived";
    var h='<button class="backl" data-act="vopen" data-id="">&#8249; All services</button><div class="ped" style="margin-top:0"><div class="stack" style="min-width:0"><section class="card"><div class="ch" style="margin:0"><div><h2 class="h3" style="font-size:22px">'+esc(s.name)+'</h2><div class="rbar" style="margin-top:6px">'+chip(s.status)+'<span class="chip">'+s.kind+'</span></div></div><div class="acts">'+(s.status==="Draft"?'<button class="btn hl" data-act="vlive" data-id="'+s.id+'">Make it live</button>':"")+'<button class="btn sm quiet" data-act="varch" data-id="'+s.id+'">'+(arch?"Restore":"Archive")+'</button></div></div>'+(arch?'<div class="warnbox" style="margin-top:10px">Archived. Nobody new can buy or book it. People who hold its packages keep booking and renew at their original price.</div>':"")+'</section>';
    SECT.forEach(function(x){h+=cardFor(x[0],s,!arch)});
    return h+'</div><aside class="pside">'+howHTML(st.w&&st.w.id===s.id?st.w:s)+'<div class="card"><div class="k">Where it shows</div><div class="m" style="margin-top:6px">The schedule, your booking page and Take payment all read from this page. A change here shows in all three.</div><div class="acts" style="margin-top:10px"><button class="btn sm" data-act="go" data-id="schedule">Open Schedule</button></div></div></aside></div>';
  }

  /* ---------- a new service, in steps ---------- */
  function newHTML(){
    var n=st.neu, s=n.w, steps=SECT.concat([["review","Review"]]), k=steps[n.step][0];
    var h='<button class="backl" data-act="vnewx">&#8249; All services</button><div class="steps">'+steps.map(function(x,i){return '<button data-act="vstep" data-id="'+i+'"'+(i===n.step?' aria-current="step"':"")+(i>n.max?" disabled":"")+'><span>'+(i+1)+'</span>'+(x[0]==="who"&&s.kind==="Room"?"Rooms":x[1])+'</button>'}).join("")+'</div><div class="ped"><div class="stack" style="min-width:0">';
    if(k==="review"){ h+='<section class="card"><div class="ch" style="margin:0"><div><h2 class="h3" style="font-size:22px">'+esc(s.name)+'</h2><div class="m">Check it over. Edit goes back to that step.</div></div></div></section>';
      SECT.forEach(function(x,i){ h+=x[0]==="pricing"?'<section class="card"><div class="ch"><h3>Packages</h3><button class="btn sm" data-act="vstep" data-id="'+i+'">Edit</button></div>'+pricingHTML(s,false)+'</section>':'<section class="card"><div class="ch"><h3>'+sectTitle(x[0],s)+'</h3><button class="btn sm" data-act="vstep" data-id="'+i+'">Edit</button></div><dl class="vrows">'+viewRows(x[0],s).map(function(r){return '<div><dt>'+r[0]+'</dt><dd>'+r[1]+'</dd></div>'}).join("")+'</dl></section>' });
      h+='<section class="card"><div class="acts"><button class="btn pri" data-act="vnewsave" data-id="Live">Make it live</button><button class="btn" data-act="vnewsave" data-id="Draft">Save as draft</button><button class="btn quiet" data-act="vstep" data-id="'+(n.step-1)+'">Back</button></div><div class="m" style="margin-top:8px">A draft cannot be booked or bought until you make it live.</div></section>';
    } else {
      h+='<section class="card"><div class="ch"><h3>'+sectTitle(k,s)+'</h3><span class="m">Step '+(n.step+1)+' of '+steps.length+'</span></div>'+(k==="pricing"?pricingHTML(s,true):'<div class="stack" style="gap:12px">'+formHTML(k,s)+'</div>')+'<div class="acts" style="margin-top:16px;padding-top:14px;border-top:1px solid var(--line)"><button class="btn pri" data-act="vnext">Continue</button>'+(n.step?'<button class="btn" data-act="vstep" data-id="'+(n.step-1)+'">Back</button>':"")+'<button class="btn quiet" data-act="vnewsave" data-id="Draft">Save as draft</button><span class="errline">'+esc(st.err[0]||"")+'</span></div></section>';
    }
    return h+'</div><aside class="pside">'+howHTML(s)+'</aside></div>';
  }

  /* ---------- passes, products, subscriptions, bundles ---------- */
  var KIND={passes:{one:"pass",title:"Passes",line:"One visit that works for the services you pick. A pass can be free, such as a guest pass or a trial.",get:function(){return ITEMS.filter(function(i){return i.pass})}},
    products:{one:"product",title:"Products",line:"Shirts, snacks and anything else you stock.",get:function(){return ITEMS.filter(function(i){return i.kind==="product"})}},
    subs:{one:"subscription",title:"Subscriptions",line:"A monthly or weekly charge with nothing to book, such as online programming or nutrition coaching.",get:function(){return ITEMS.filter(function(i){return i.sub1})}},
    bundles:{one:"bundle",title:"Bundles",line:"Several packages sold together at one price.",get:function(){return bundles}}};
  function subsCount(i){var n=0; M.people().forEach(function(p){p.plans.forEach(function(pl){ if(pl.name===i.name) n++ })}); return n}
  function bundleSum(b){var t=0; Object.keys(b.items).forEach(function(id){var it=ITEMS.filter(function(x){return x.id===id})[0]; if(it) t+=it.price*b.items[id]}); return t}
  function bundleLine(b){return Object.keys(b.items).map(function(id){var it=ITEMS.filter(function(x){return x.id===id})[0]; return it?(b.items[id]>1?b.items[id]+" x ":"")+it.svc+" "+it.name.toLowerCase():""}).filter(Boolean).join(" + ")||"Nothing included yet"}
  function otherHTML(tab){
    var K=KIND[tab], list=K.get();
    if(st.item&&st.item.tab===tab) return itemEditor(tab);
    var h='<p class="sub">'+K.line+'</p><section class="card"><div class="ch"><h3>'+K.title+'</h3><button class="btn sm" data-act="vitem" data-id="'+tab+':">New '+K.one+'</button></div>';
    if(!list.length) h+='<div class="empty"><span>None yet.</span></div>';
    list.forEach(function(i){
      var m=tab==="passes"?"Works for "+(i.works||[]).join(", ").toLowerCase()+". Good for "+M.plural(i.good||30,"day")+".":(tab==="products"?(i.stock!=null?i.stock+" in stock"+(i.stock<=(i.low||0)?", running low":"")+".":"Stock is not tracked.")+(i.online?" Sold in the app.":" Front desk only."):(tab==="subs"?"Billed "+(i.billed||"Monthly").toLowerCase()+". "+M.plural(subsCount(i),"subscriber")+"."+(i.one?" One per person.":""):bundleLine(i)+". Separately "+fm(bundleSum(i))+"."));
      h+='<div class="row"><div class="what"><div class="t">'+esc(i.name)+(tab==="products"&&i.stock!=null&&i.stock<=(i.low||0)?' <span class="chip warn">Low stock</span>':"")+'</div><div class="m">'+esc(m)+'</div></div><div class="amt">'+(tab==="subs"?fm(i.price)+' <span class="m">a '+(i.per||"month")+'</span>':(i.price?fm(i.price):"Free"))+'</div>'+chip(i.status)+'<div class="acts"><button class="btn sm" data-act="vitem" data-id="'+tab+":"+i.id+'">Edit</button></div></div>';
    });
    return h+'</section>';
  }
  function itemEditor(tab){
    var w=st.item.w, K=KIND[tab], isNew=!st.item.id, h='<button class="backl" data-act="vitemx">&#8249; All '+K.title.toLowerCase()+'</button><div class="ped" style="margin-top:0"><div class="stack" style="min-width:0"><section class="card"><div class="ch"><h3>'+(isNew?"New "+K.one:esc(w.name))+'</h3>'+(isNew?"":chip(w.status))+'</div><div class="stack" style="gap:12px">'+field("viName","Name",w.name);
    if(tab==="subs") h+=field("viDesc","Description (optional)",w.desc||"")+'<div class="two"><div class="field"><label>Billing schedule</label>'+seg("viset","billed:"+(w.billed||"Monthly"),[["billed:Weekly","Weekly"],["billed:Monthly","Monthly"]])+'</div>'+field("viPrice","Price per "+((w.billed||"Monthly")==="Weekly"?"week":"month")+" (USD)",w.price,'inputmode="decimal"')+'</div><div class="setrow"><div><b>Clients can buy this online</b><div class="m">In your online shop and as a link. Your team can also sell it at the front desk.</div></div>'+sw("viset","online",w.online,"Clients can buy this online")+'</div><div class="setrow"><div><b>One per person</b><div class="m">Stops the same person subscribing twice.</div></div>'+sw("viset","one",w.one,"One per person")+'</div><div class="setrow"><div><b>AI in the app</b><div class="m">Same as the gym default. Change it to give subscribers more, such as AI coaching.</div></div><button class="btn sm" data-act="later" data-id="AI access for a subscription">Change</button></div>';
    else if(tab==="passes") h+='<div class="two"><div class="field"><label for="viPrice">Price (USD)</label><div class="rbar"><input id="viPrice" inputmode="decimal" style="max-width:130px" value="'+(w.free?"":esc(w.price))+'"'+(w.free?" disabled":"")+'>'+sw("viset","free",w.free,"This is free")+'<span>This is free</span></div></div>'+field("viGood","Good for, in days",w.good||30,'inputmode="numeric"')+'</div><div class="field"><label>Works for</label>'+SV.filter(function(s){return s.status!=="Archived"}).map(function(s){return '<label class="pk" style="border:1px solid var(--line);border-radius:10px;margin-top:6px"><input type="checkbox" class="pick" data-viwork="'+esc(s.name)+'"'+((w.works||[]).indexOf(s.name)>=0?" checked":"")+'><span>'+esc(s.name)+'</span><span class="m">'+s.kind+'</span></label>'}).join("")+'</div><div class="setrow"><div><b>Clients can buy this online</b><div class="m">Turn off for a pass only your team hands out.</div></div>'+sw("viset","online",w.online,"Clients can buy this online")+'</div>';
    else if(tab==="products") h+='<div class="two">'+field("viPrice","Price (USD)",w.price,'inputmode="decimal"')+field("viSku","SKU (optional)",w.sku||"")+'</div><div class="setrow"><div><b>Track stock</b><div class="m">Counts down with every sale and warns when it runs low.</div></div>'+sw("viset","track",w.stock!=null,"Track stock")+'</div>'+(w.stock!=null?'<div class="two">'+field("viStock","In stock",w.stock,'inputmode="numeric"')+field("viLow","Warn me at",w.low==null?5:w.low,'inputmode="numeric"')+'</div>':"")+'<div class="setrow"><div><b>Clients can buy this in the app</b></div>'+sw("viset","online",w.online,"Clients can buy this in the app")+'</div>';
    else { h+='<div class="field"><label>What is included</label>'+SV.filter(function(s){return s.status!=="Archived"}).map(function(s){var l=pks(s).filter(function(i){return i.status==="Live"&&i.price>0&&i.kind==="pack"}); if(!l.length) return ""; return '<div class="svc"><div class="svch"><span>'+esc(s.name)+'</span></div>'+l.map(function(i){var q=w.items[i.id]||0; return '<div class="pk" style="cursor:default"><span></span><span>'+esc(i.name)+' <span class="m">'+fm(i.price)+'</span></span><span class="rbar"><button class="btn sm" data-act="viqty" data-id="'+i.id+':-1" aria-label="One less"'+(q?"":" disabled")+'>&minus;</button><b style="min-width:16px;text-align:center">'+q+'</b><button class="btn sm" data-act="viqty" data-id="'+i.id+':1" aria-label="One more">+</button></span></div>'}).join("")+'</div>'}).join("")+'</div>'+field("viPrice","Bundle price (USD)",w.price,'inputmode="decimal" style="max-width:160px"')+'<div class="setrow"><div><b>Clients can buy this online</b></div>'+sw("viset","online",w.online,"Clients can buy this online")+'</div>' }
    h+='</div></section></div><aside class="pside" id="viside">'+itemSide(tab)+'</aside></div>';
    return h;
  }
  function itemSide(tab){
    var w=st.item.w, K=KIND[tab], isNew=!st.item.id, price=parseFloat(w.price)||0, rows=[];
    if(tab==="subs") rows=[["Billed",(w.billed||"Monthly")+", from the join date"],["Sold online",w.online?"Yes":"No"],["Limit",w.one?"One per person":"No limit"],["AI in the app","Gym default"]];
    if(tab==="passes") rows=[["Works for",(w.works||[]).join(", ")||"Nothing picked yet"],["Good for",M.plural(parseInt(w.good,10)||30,"day")],["Sold online",w.online?"Yes":"No"]];
    if(tab==="products") rows=[["Stock",w.stock!=null?w.stock+" left, warn at "+(w.low==null?5:w.low):"Not tracked"],["Sold in the app",w.online?"Yes":"No"]];
    if(tab==="bundles"){var sum=bundleSum(w); rows=[["Includes",bundleLine(w)],["Separately",fm(sum)],["Buyer saves",price&&sum>price?fm(sum-price):"Nothing yet"]]}
    return '<div class="infobox"><div class="k" style="color:inherit">Summary</div><div style="margin-top:6px"><b>'+(w.name?esc(w.name):"Your "+K.one)+'</b></div><div class="big" style="margin-top:2px">'+(w.free||!price?(tab==="passes"&&w.free?"Free":"No price yet"):fm(price)+(tab==="subs"?" per "+((w.billed||"Monthly")==="Weekly"?"week":"month"):""))+'</div><dl class="vrows" style="margin-top:8px">'+rows.map(function(r){return '<div><dt>'+r[0]+'</dt><dd>'+esc(r[1])+'</dd></div>'}).join("")+'</dl>'+(tab==="subs"?'<div style="margin-top:8px;font-size:13.5px">Nothing to schedule. Subscribers are charged until they cancel or you cancel for them.</div>':"")+'</div><div class="card"><div class="acts"><button class="btn pri" data-act="visave" data-id="Live">'+(w.status==="Live"&&!isNew?"Save changes":"Make it live")+'</button>'+(w.status==="Live"&&!isNew?"":'<button class="btn" data-act="visave" data-id="Draft">Save as draft</button>')+'<button class="btn quiet" data-act="vitemx">Cancel</button></div><div class="errline" id="viErr" style="margin-top:6px"></div>'+(isNew?"":'<div style="margin-top:8px"><button class="btn sm quiet" data-act="visave" data-id="'+(w.status==="Archived"?"Live":"Archived")+'">'+(w.status==="Archived"?"Restore":"Archive")+'</button></div>')+'</div>';
  }
  function grabItem(){
    if(!st.item) return; var w=st.item.w, e;
    if((e=$("viName"))) w.name=e.value.trim();
    if((e=$("viDesc"))) w.desc=e.value.trim();
    if((e=$("viPrice"))&&!e.disabled) w.price=e.value.replace(/[$,\s]/g,"");
    if((e=$("viGood"))) w.good=parseInt(e.value,10)||30;
    if((e=$("viSku"))) w.sku=e.value.trim();
    if((e=$("viStock"))) w.stock=Math.max(0,parseInt(e.value,10)||0);
    if((e=$("viLow"))) w.low=Math.max(0,parseInt(e.value,10)||0);
  }
  function lkKind(x,b){return b?"Bundle":x.kind==="product"?"Product":x.pass?"Pass":x.sub1?"Subscription":"Package"}
  function lkTarget(l){if(l.t==="shop") return null; return l.t==="bundle"?bundles.filter(function(b){return b.id===l.ref})[0]:ITEMS.filter(function(i){return i.id===l.ref})[0]}
  function lkName(x,b){return b||x.kind==="product"||x.pass||x.sub1||x.kind==="membership"?x.name:x.svc+", "+x.name}
  function lkSlug(n){return String(n).toLowerCase().replace(/&/g,"and").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}
  function lkFree(){var has=function(t,id){return links.some(function(l){return l.t===t&&l.ref===id})}, o=[];
    ITEMS.forEach(function(x){if(x.status==="Live"&&!has("item",x.id)) o.push({t:"item",ref:x.id,x:x,kind:lkKind(x),name:lkName(x)})});
    bundles.forEach(function(b){if(b.status==="Live"&&!has("bundle",b.id)) o.push({t:"bundle",ref:b.id,x:b,kind:"Bundle",name:b.name})});
    var ord=["Product","Pass","Subscription","Package","Bundle"]; return o.sort(function(a,b){return ord.indexOf(a.kind)-ord.indexOf(b.kind)})}
  function lkMake(t,ref,name){var x=t==="bundle"?bundles.filter(function(b){return b.id===ref})[0]:ITEMS.filter(function(i){return i.id===ref})[0], was=x.online, nm=name||lkName(x,t==="bundle"), base="northlinestrength.com/"+(t==="item"&&x.kind==="product"?"shop/":"join/")+lkSlug(nm), url=base, n=2;
    while(links.some(function(l){return l.url===url})) url=base+"-"+(n++);
    x.online=true; links.push({id:"l"+Date.now(),t:t,ref:ref,name:nm,url:url,on:true}); return {url:url,name:nm,turned:!was}}
  function lkWhat(l){var x=lkTarget(l); return l.t==="shop"?"Everything you sell online":lkKind(x||{},l.t==="bundle")+(x&&x.price!=null?" · "+(x.free||!+x.price?"Free":fm(+x.price)):"")}
  function lkGone(l){var x=lkTarget(l); return l.t!=="shop"&&(!x||x.status!=="Live"||!x.online)}
  function linksHTML(){
    return '<p class="sub">Links your clients use to buy without your team. Put them in a text, your bio or your website. Any package, pass, product, subscription or bundle can have its own link.</p><section class="card"><div class="ch"><h3>Online links</h3><span class="m">'+M.plural(links.length,"link")+'</span></div>'+links.map(function(l){
      return '<div class="row"><div class="what"><button class="link t" data-act="panel" data-id="vlk:'+l.id+'">'+esc(l.name)+'</button><div class="m">'+esc(lkWhat(l))+'. <span class="code" style="font-weight:500">'+esc(l.url)+'</span></div></div>'+(lkGone(l)?'<span class="chip warn">Not sold online</span>':"")+'<div class="acts"><button class="btn sm" data-act="vlcopy" data-id="'+l.url+'">Copy link</button><span class="m" style="min-width:44px;text-align:right">'+(l.on?"Live":"Paused")+'</span><button class="sw" role="switch" aria-checked="'+l.on+'" aria-label="'+esc(l.name)+' link is live" data-act="vlpause" data-id="'+l.id+'"></button></div></div>'}).join("")+'</section>';
  }
  M.panels.vlk=function(pn){var id=pn&&pn.arg;
    var l=links.filter(function(x){return x.id===id})[0]; if(!l) return "";
    return '<div class="sph"><div><h3>'+esc(l.name)+'</h3><div class="m">'+esc(lkWhat(l))+'</div></div>'+M.px+'</div><div class="spb">'+(lkGone(l)?'<div class="infobox">This item is not on sale online right now, so the link shows that it is not available.</div>':"")+'<div class="field"><label for="vlkName">Link name</label><input id="vlkName" class="fld" value="'+esc(l.name)+'"></div><div class="field"><label>Web address</label><div class="rbar"><span class="code" style="flex:1;min-width:0;overflow-wrap:anywhere">'+esc(l.url)+'</span><button class="btn sm" data-act="vlcopy" data-id="'+l.url+'">Copy link</button></div></div><div class="setrow"><div><b>Live</b><div class="m">When it is off, anyone who opens the link sees that it is not available right now.</div></div><button class="sw" role="switch" aria-checked="'+l.on+'" aria-label="Live" data-act="vlpause" data-id="'+l.id+'"></button></div><div><button class="btn sm" data-act="later" data-id="The QR code download">Download QR code</button></div></div><div class="spf"><button class="btn pri" data-act="vlksave" data-id="'+l.id+'">Save</button><button class="btn" data-act="pclose">Cancel</button>'+(l.t==="shop"?"":'<button class="btn quiet rm" style="margin-left:auto" data-act="vldel" data-id="'+l.id+'">Delete link</button>')+'</div>';
  };
  M.panels.vlink=function(){
    var free=lkFree(), g={}; free.forEach(function(f){(g[f.kind]=g[f.kind]||[]).push(f)});
    return '<div class="sph"><div><h3>New link</h3><div class="m">One link sells one thing. The online shop link already shows everything.</div></div>'+M.px+'</div><div class="spb">'+(free.length?'<div class="field"><label for="vlTarget">What should this link sell?</label><select id="vlTarget" class="fld">'+Object.keys(g).map(function(k){return '<optgroup label="'+k+(k==="Pass"?"es":"s")+'">'+g[k].map(function(f){return '<option value="'+f.t+":"+f.ref+'">'+esc(f.name)+(f.x.online?"":" (front desk only today)")+'</option>'}).join("")+'</optgroup>'}).join("")+'</select></div><div class="field"><label for="vlName">Link name (optional)</label><input id="vlName" class="fld" placeholder="Uses the item name if left blank"></div><div class="m">The web address is made from the name. If the item is sold at the front desk only, creating the link also puts it on sale online.</div>':'<div class="m">Everything live already has a link. Add a product, pass or package first.</div>')+'</div><div class="spf">'+(free.length?'<button class="btn pri" data-act="vlmake">Create link</button>':"")+'<button class="btn" data-act="pclose">Cancel</button></div>';
  };

  M.pages.services={
    title:"Services & Packages",
    tabs:function(){return [["services","Services"],["passes","Passes"],["products","Products"],["subs","Subscriptions"],["bundles","Bundles"],["links","Online links"]]},
    top:function(r){return r&&r.tab==="links"?["panel","New link","vlink"]:["panel","New","vnew"]},
    render:function(r){
      var tab=r.tab||"services";
      if(tab!=="services"){st.neu=null; st.edit=null; st.w=null; st.pk=null} if(st.item&&st.item.tab!==tab) st.item=null;
      if(tab==="links") return linksHTML();
      if(tab!=="services") return otherHTML(tab);
      if(st.neu) return newHTML();
      var s=r.id&&svc(r.id);
      return s?serviceHTML(s):'<p class="sub">A service is what you deliver and schedule. A package is what you sell for it: a drop-in, a pack or a membership.</p>'+listHTML();
    },
    brief:function(r){
      var live=SV.filter(function(s){return s.status==="Live"}), s=r.id&&svc(r.id), low=ITEMS.filter(function(i){return i.kind==="product"&&i.stock!=null&&i.stock<=(i.low||0)});
      if(s&&!st.neu) return {hd:s.name+" has "+M.plural(pks(s).length,"package")+" and "+(s.rules.own?"its own rules.":"follows the gym defaults."),items:ruleLines(R(s)).map(function(x){return "<b>"+x[0]+".</b> "+x[1]}),hint:"Ask Milton about this service",sugg:["What does a late cancel do here?","Who can book this?"]};
      return {hd:M.plural(live.length,"service")+" live, with "+M.plural(ITEMS.filter(function(i){return i.kind!=="product"&&i.status==="Live"&&!i.hidden}).length,"package")+" for sale.",items:["<b>Rules.</b> "+M.plural(SV.filter(function(x){return x.rules.own}).length,"service")+" set their own rules. The rest follow your gym defaults.",low.length?"<b>Low stock.</b> "+low.map(function(i){return esc(i.name)+", "+i.stock+" left"}).join("; ")+".":"<b>Stock.</b> Nothing is running low.","<b>Bundles.</b> "+bundles.filter(function(b){return b.status==="Live"}).length+" live, "+bundles.filter(function(b){return b.status==="Draft"}).length+" in draft."],hint:"Ask Milton about what you sell",sugg:["Which services set their own rules?","What is running low?","Add a new service"]};
    },
    ask:function(q){
      if(/own rules/i.test(q)){var o=SV.filter(function(x){return x.rules.own}); M.say(q,o.length?o.map(function(x){return x.name}).join(", ")+" "+(o.length===1?"sets its":"set their")+" own rules. Every other service follows the gym defaults.":"None. Every service follows the gym defaults."); return true}
      if(/low/i.test(q)){M.go({page:"services",tab:"products"}); var low=ITEMS.filter(function(i){return i.kind==="product"&&i.stock!=null&&i.stock<=(i.low||0)}); M.say(q,low.length?low.map(function(i){return i.name+" has "+i.stock+" left"}).join(". ")+". I opened Products.":"Nothing is running low."); return true}
      if(/new service/i.test(q)){A.vnewpick("service"); M.say(q,"I started a new service. Name it the way your clients say it, then pick a kind."); return true}
      if(/late cancel/i.test(q)){var s=svc(M.route.id); if(!s) return false; var r=R(s); M.say(q,(r.late?"Canceling inside "+M.plural(r.late,"hour")+" of the session "+(r.lateUses?"uses a session.":"does not use a session."):"There is no late cancel window.")+" A no-show "+(r.noShowUses?"uses a session.":"does not use a session.")+(s.rules.own?" These are this service's own rules.":" These come from the gym defaults.")); return true}
      if(/who can book/i.test(q)){var s2=svc(M.route.id); if(!s2) return false; M.say(q,s2.access+". "+s2.book+" can book it. It is for "+s2.aud.toLowerCase()+"."); return true}
      return false;
    }
  };
  M.panels.vnew=function(){
    var o=[["service","Service","Something you deliver and schedule: training, a class, a room"],["pass","Pass","One visit that works for the services you pick"],["product","Product","Shirts, snacks and anything you stock"],["subscription","Subscription","A monthly or weekly charge with nothing to book"],["bundle","Bundle","Several packages sold together at one price"]];
    return '<div class="sph"><div><h3>New</h3><div class="m">What do you want to add?</div></div>'+M.px+'</div><div class="spb">'+o.map(function(x){return '<button class="opt" data-act="vnewpick" data-id="'+x[0]+'"><b>'+x[1]+'</b><span class="m">'+x[2]+'</span></button>'}).join("")+'<div class="m">To add a drop-in, pack or membership, open the service it belongs to and choose Add a package.</div></div>';
  };

  var A=M.acts;
  function re(msg){M.render(); if(msg) M.toast(msg)}
  function cur(){return st.neu?st.neu.w:svc(M.route.id)}
  A.vdefaults=function(){ if(M.pages.settings) M.go({page:"settings",tab:"rules"}); else M.later("The Settings page with gym defaults") };
  A.vfilt=function(id){st.filt=id; M.render()};
  A.vopen=function(id,el,e){ if(e&&e.stopPropagation) e.stopPropagation(); st.edit=null; st.w=null; st.pk=null; st.err=[]; M.go({page:"services",tab:"services",id:id||undefined})};
  A.vedit=function(id){var s=cur(); st.edit=id; st.pk=null; st.err=[]; st.w=JSON.parse(JSON.stringify(s)); M.render()};
  A.vcancel=function(){st.edit=null; st.w=null; st.err=[]; M.render()};
  A.vset=function(id){
    grab(); var s=st.neu?st.neu.w:st.w, a=id.split(":"), k=a[0], v=a.slice(1).join(":");
    if(k==="own"){ if(v==="1"&&!s.rules.own){var d=G.rules; s.rules={own:true,late:d.late,lateUses:d.lateUses,noShowUses:d.noShowUses,notice:d.notice,setup:d.setup,cleanup:d.cleanup,order:d.order}} else if(v==="0") s.rules={own:false} }
    else if(k==="lateUses"||k==="noShowUses") s.rules[k]=v==="1";
    else if(k==="order") s.rules.order=v;
    else if(k==="hours") s.hours=v==="gym"?"gym":"own";
    else if(k==="who") s.who=v;
    else if(k==="kind"){ if(s.kind!==v){s.kind=v; if(v==="1-on-1") s.cap=1; else if(s.cap<2) s.cap=v==="Group"?6:1} }
    else s[k]=v;
    M.render();
  };
  A.vlen=function(id){grab(); var s=st.neu?st.neu.w:st.w, l=+id, i=s.lens.indexOf(l); if(i>=0) s.lens.splice(i,1); else {s.lens.push(l); s.lens.sort(function(a,b){return a-b})} M.render()};
  A.vsave=function(){
    grab(); var w=st.w, s=svc(w.id), e=check(st.edit,w); if(e){st.err=[e]; return M.render()}
    var go=function(){ var old=s.name; if(w.kind!==s.kind){ if(w.kind==="Room") w.who=[]; else w.rooms=[] } Object.keys(w).forEach(function(k){s[k]=w[k]}); if(old!==s.name) ITEMS.forEach(function(i){ if(i.svc===old) i.svc=s.name }); s.len=s.lens[0]; s.where=s.kind==="Room"?(s.rooms[0]||""):(s.who.pop&&s.who.length?"with "+(s.who[0]==="Renee Castillo"?"Renee":"Coach "+M.first(s.who[0])):""); st.edit=null; st.w=null; st.err=[]; re("Saved. The schedule, booking page and Take payment follow.") };
    if(st.edit==="basics"&&w.kind!==s.kind) return M.confirm({title:"Change the kind to "+w.kind+"?",body:"The "+(s.kind==="Room"?"rooms":"coaches")+" picked for this service are cleared. The name, lengths, packages and rules stay.",no:"Keep "+s.kind,yes:"Change the kind",run:go});
    go();
  };
  A.varch=function(id){var s=svc(id); if(s.status==="Archived"){s.status="Live"; return re(s.name+" is live again.")} M.confirm({title:"Archive "+s.name+"?",body:"Nobody new can buy or book it. People who hold its packages keep booking and renew at their original price. You can restore it later.",no:"Keep it",yes:"Archive",run:function(){s.status="Archived"; st.edit=null; re(s.name+" archived.")}})};
  A.vlive=function(id){var s=svc(id), bad=SECT.map(function(x){return check(x[0],s)}).filter(Boolean)[0]; if(bad) return M.toast("Not live yet. "+bad); s.status="Live"; re(s.name+" is live. It can be booked and bought now.")};
  /* packages */
  A.vpk=function(id){grab(); var a=id.split(":"), s=svc(a[0]), i=a[1]?pks(s).filter(function(x){return x.id===a[1]})[0]:null; st.edit=null; st.w=st.neu?st.w:null; st.pk={sid:s.id,id:i?i.id:null,w:i?JSON.parse(JSON.stringify(i)):pkBlank(s)}; var w=st.pk.w; if(!w.also) w.also=[]; if(!w.limit) w.limit="none"; if(w.online===undefined) w.online=true; M.render(); var f=$("vpName"); if(f) f.focus()};
  A.vpkcancel=function(){st.pk=null; M.render()};
  A.vpkset=function(id){
    grabPk(); var p=st.pk.w, a=id.split(":"), k=a[0], v=a.slice(1).join(":");
    if(k==="t"){ if(v==="m"){p.kind="membership"; if(p.size<2) p.size=8; p.auto=false} else {p.kind="pack"; p.unlimited=false; if(v==="d"){p.size=1; p._drop=true; p.auto=false} else {p._drop=false; if(p.size<2) p.size=8}} }
    else if(k==="per"||k==="limit") p[k]=v;
    else if(k==="rm") p.also=p.also.filter(function(x){return x!==v});
    else p[k]=!p[k];
    M.render();
  };
  A.vpksave=function(){
    grabPk(); var p=st.pk.w, s=svc(st.pk.sid), mem=p.kind==="membership", price=parseFloat(p.price), err="";
    if(!p.name) p.name=mem?(p.unlimited?"Unlimited":p.size+" a "+p.per):(p.size===1?"Drop-in":p.size+"-pack");
    if(!p.free&&!(price>0)) err="Enter a price above zero, or mark this free.";
    else if(pks(s).some(function(x){return x.id!==st.pk.id&&x.name.toLowerCase()===p.name.toLowerCase()&&x.status!=="Archived"})) err="This service already has a package with that name.";
    if(err){$("vpErr").textContent=err; return}
    p.price=p.free?0:price; delete p._drop; if(!mem){delete p.per; p.unlimited=false}
    p.sub=pkWhat(p); p.svc=s.name;
    if(st.pk.id){var t=pks(s).filter(function(x){return x.id===st.pk.id})[0]; Object.keys(p).forEach(function(k){t[k]=p[k]}); if(!mem) delete t.per}
    else {p.id="k"+Date.now(); if(s._pk) s._pk.push(p); else ITEMS.push(p)}
    st.err=[]; st.pk=null; re(p.name+" saved. "+(p.status==="Live"&&s.status==="Live"?"It is for sale in Take payment now.":"It goes on sale when the service is live."));
  };
  A.vpkarch=function(){var s=svc(st.pk.sid), t=pks(s).filter(function(x){return x.id===st.pk.id})[0]; t.status=t.status==="Archived"?"Live":"Archived"; st.pk=null; re(t.name+(t.status==="Archived"?" archived. People who hold it keep it.":" is for sale again."))};
  /* new service */
  A.vnewpick=function(id){
    M.closePanel(); st.edit=null; st.pk=null; st.err=[];
    if(id==="service"){st.neu={step:0,max:0,w:{id:"n"+Date.now(),name:"",kind:"1-on-1",cap:1,who:[],rooms:[],lens:[60],len:60,hours:"gym",times:[],aud:"All ages",access:"People already with your gym",book:"Clients and team",status:"Draft",rules:{own:false},_pk:[],price:0,title:"",where:""}}; M.go({page:"services",tab:"services"}); var f=$("vName"); if(f) f.focus(); return}
    var tab={pass:"passes",product:"products",subscription:"subs",bundle:"bundles"}[id]; st.neu=null; A.vitem(tab+":");
  };
  A.vnewx=function(){var n=st.neu; if(n&&(n.w.name||n.w._pk.length)) return M.confirm({title:"Leave without saving?",body:"This new service has not been saved. Save it as a draft to come back to it.",no:"Keep editing",yes:"Leave",run:function(){st.neu=null; M.render()}}); st.neu=null; M.render()};
  A.vstep=function(id){grab(); var n=st.neu; if(+id>n.max) return; n.step=+id; st.pk=null; st.err=[]; M.render(); window.scrollTo(0,0)};
  A.vnext=function(){grab(); var n=st.neu, k=SECT[n.step][0], e=check(k,n.w); if(e){st.err=[e]; return M.render()} st.err=[]; st.pk=null; n.step++; n.max=Math.max(n.max,n.step); M.render(); window.scrollTo(0,0)};
  A.vnewsave=function(id){
    grab(); var n=st.neu, s=n.w;
    if(!s.name){n.step=0; st.err=["Add a name."]; return M.render()}
    if(id==="Live"){var bad=null; SECT.some(function(x,i){var e=check(x[0],s); if(e){bad=[i,e]; return true}}); if(bad){n.step=bad[0]; st.err=[bad[1]]; return M.render()}}
    var pk=s._pk; delete s._pk; s.status=id; s.len=s.lens[0]||60; s.title=s.name+", "+s.len+" min"; s.where=s.kind==="Room"?(s.rooms[0]||""):(s.who.pop&&s.who.length?"with Coach "+M.first(s.who[0]):""); s.price=(pk.filter(function(p){return p.size===1})[0]||pk[0]||{price:0}).price; if(!s.times.length) s.times=["9:00 AM","12:00 PM","5:30 PM"];
    pk.forEach(function(p){p.svc=s.name; ITEMS.push(p)}); SV.push(s); st.neu=null; st.err=[];
    M.go({page:"services",tab:"services",id:s.id}); M.toast(s.name+(id==="Live"?" is live. It can be booked and bought now.":" saved as a draft."));
  };
  /* passes, products, subscriptions, bundles */
  A.vitem=function(id){
    var a=id.split(":"), tab=a[0], i=a[1]?KIND[tab].get().filter(function(x){return x.id===a[1]})[0]:null;
    var blank={passes:{name:"",price:"",free:false,good:30,works:[],online:true,status:"Draft"},products:{name:"",price:"",sku:"",stock:null,low:5,online:false,status:"Draft"},subs:{name:"",desc:"",price:"",billed:"Monthly",online:true,one:true,status:"Draft"},bundles:{name:"",items:{},price:"",online:true,status:"Draft"}}[tab];
    st.item={tab:tab,id:i?i.id:null,w:i?JSON.parse(JSON.stringify(i)):blank};
    if(M.route.page!=="services"||M.route.tab!==tab) M.go({page:"services",tab:tab}); else M.render();
    window.scrollTo(0,0); if(!i&&$("viName")) $("viName").focus();
  };
  A.vitemx=function(){st.item=null; M.render()};
  A.viset=function(id){grabItem(); var w=st.item.w, a=id.split(":"); if(a[0]==="billed") w.billed=a[1]; else if(a[0]==="track") w.stock=w.stock!=null?null:0; else w[a[0]]=!w[a[0]]; M.render()};
  A.viqty=function(id){grabItem(); var a=id.split(":"), w=st.item.w, q=(w.items[a[0]]||0)+(+a[1]); if(q>0) w.items[a[0]]=q; else delete w.items[a[0]]; M.render()};
  A.visave=function(id){
    grabItem(); var it=st.item, w=it.w, tab=it.tab, price=parseFloat(w.price), err="";
    if(id!=="Archived"){
      if(!w.name) err="Add a name.";
      else if(id==="Live"){ if(!(tab==="passes"&&w.free)&&!(price>0)) err="Enter a price above zero"+(tab==="passes"?", or mark this free.":"."); else if(tab==="passes"&&!(w.works||[]).length) err="Pick at least one service this pass works for."; else if(tab==="bundles"&&Object.keys(w.items).length<1) err="Add at least one package to the bundle." }
      if(err){$("viErr").textContent=err; return}
    }
    w.status=id; w.price=w.free?0:(price>0?price:0);
    if(tab==="bundles"){ if(it.id){ var bi=bundles.findIndex(function(b){return b.id===it.id}); if(bi>=0) bundles[bi]=w } else {w.id="b"+Date.now(); bundles.push(w)} }
    else {
      if(tab==="subs"){w.per=w.billed==="Weekly"?"week":"month"; w.sub="Subscription, nothing to book"}
      if(tab==="passes") w.sub="1 session, good for "+M.plural(w.good,"day");
      if(it.id){var t=ITEMS.filter(function(x){return x.id===it.id})[0]; Object.keys(w).forEach(function(k){t[k]=w[k]})}
      else {w.id="i"+Date.now(); if(tab==="passes"){w.pass=true; w.kind="pack"; w.size=1; w.svc=w.works[0]||"Passes"} else if(tab==="products"){w.kind="product"; w.svc="Products"; w.sub=""} else {w.sub1=true; w.kind="membership"; w.unlimited=true; w.svc="Subscriptions"} ITEMS.push(w)}
    }
    st.item=null; re(w.name+(id==="Live"?" is live.":(id==="Draft"?" saved as a draft.":" archived.")));
  };
  A.vlcopy=function(id){try{navigator.clipboard.writeText("https://"+id).then(function(){M.toast("Link copied.")},function(){M.toast(id)})}catch(e){M.toast(id)}};
  function lkDone(r){M.render(); M.toast(r.name+" has a link now."+(r.turned?" It is also on sale online.":"")+" "+r.url)}
  A.vlquick=function(id){var a=id.split(":"); lkDone(lkMake(a[0],a[1]))};
  A.vlmake=function(){var a=document.getElementById("vlTarget").value.split(":"), n=document.getElementById("vlName").value.trim(); M.closePanel(); lkDone(lkMake(a[0],a[1],n))};
  A.vlksave=function(id){var l=links.filter(function(x){return x.id===id})[0], n=document.getElementById("vlkName").value.trim(); if(n) l.name=n; M.closePanel(); re("Link saved.")};
  A.vldel=function(id){var l=links.filter(function(x){return x.id===id})[0]; M.confirm({title:"Delete the "+l.name+" link?",body:"Anyone who opens "+l.url+" will see that it is no longer available. The item itself stays, and you can make a new link for it later.",no:"Keep link",yes:"Delete link",run:function(){links.splice(links.indexOf(l),1); M.closePanel(); re(l.name+" link deleted.")}})};
  A.vlpause=function(id){var l=links.filter(function(x){return x.id===id})[0]; l.on=!l.on; M.renderPanel&&M.renderPanel(); re(l.on?l.name+" link is live again.":l.name+" link is paused. Anyone who opens it sees that it is not available right now.")};

  M.changes.push(function(el){
    if(M.route.page!=="services") return; var d=el.dataset||{};
    if(d.vwho){grab(); var s=st.neu?st.neu.w:st.w; if(!s.who.pop) s.who=[]; var i=s.who.indexOf(d.vwho); if(el.checked&&i<0) s.who.push(d.vwho); if(!el.checked&&i>=0) s.who.splice(i,1); return M.render()}
    if(d.vpalso&&el.value){grabPk(); st.pk.w.also.push(el.value); return M.render()}
    if(d.viwork){grabItem(); var w=st.item.w; w.works=w.works||[]; var j=w.works.indexOf(d.viwork); if(el.checked&&j<0) w.works.push(d.viwork); if(!el.checked&&j>=0) w.works.splice(j,1); $("viside").innerHTML=itemSide(st.item.tab)}
  });
  M.inputs.push(function(el){
    if(M.route.page!=="services") return;
    if(st.item&&/^vi[A-Z]/.test(el.id)){grabItem(); $("viside").innerHTML=itemSide(st.item.tab)}
  });
})();
