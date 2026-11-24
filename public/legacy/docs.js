/* Documents: the CRM tab that replaces Waivers. Many signable documents per gym, a rule for who signs
   each one, one signing link per person, signing on this device, and paper copies.
   Follows the Milton Documents spec. Short tasks open in the side panel, per the Rule Sheet. */
(function(){
  var esc=M.esc, $=M.$, G=DB.GYM, TODAYL="Nov 20, 2026";
  var TYPES={Waiver:{ic:"W",blurb:"A release of liability. Usually for everyone, before a first session.",kind:"everyone",required:true},
    Agreement:{ic:"A",blurb:"Membership or package terms. Usually tied to what someone buys.",kind:"specific",required:true},
    Consent:{ic:"C",blurb:"Permission for one thing, like photos and video.",kind:"everyone",required:false},
    Policy:{ic:"P",blurb:"House rules to acknowledge, like cancellations.",kind:"everyone",required:true},
    Other:{ic:"O",blurb:"Anything else that needs a signature.",kind:"manual",required:true}};
  var ST={not_sent:["Not sent",""],awaiting:["Awaiting signature","mist"],signed:["Signed","ok"],needs_new:["Needs new signature","warn"],needs_resend:["Needs resend","err"]};
  var CATALOG=DB.SERVICES.map(function(s){return s.name}).concat(["Semi-Private 2x per week","Open Gym Unlimited","Nutrition Coaching"]);
  var docs=[
    {id:"waiver",name:"Liability Waiver",type:"Waiver",rule:{kind:"everyone",items:[]},required:true,valid:"version",version:8,published:"Nov 11, 2026",status:"live",file:"New Client Waiver Jan 2024 Update (1).pdf",pages:1,fields:22,hist:[[8,"Nov 11, 2026","Used for new requests only"],[7,"Jan 9, 2026","Used for new requests only"],[6,"Aug 2, 2025","Used for new requests only"]]},
    {id:"agreement",name:"Membership Agreement",type:"Agreement",rule:{kind:"specific",items:["Semi-Private 2x per week","Open Gym Unlimited"]},required:true,valid:"version",version:2,published:"Oct 28, 2026",status:"live",file:"Membership Agreement 2026.pdf",pages:3,fields:14,hist:[[2,"Oct 28, 2026","Used for new requests only"],[1,"Sep 1, 2026","First version"]]},
    {id:"recovery",name:"Recovery Room Agreement",type:"Waiver",rule:{kind:"specific",items:["Recovery room"]},required:true,valid:"year",version:1,published:"Sep 2, 2025",status:"live",file:"Recovery Waiver.pdf",pages:1,fields:9},
    {id:"massage",name:"Massage Intake Form",type:"Other",rule:{kind:"specific",items:["Massage"]},required:true,valid:"version",version:1,published:"Nov 3, 2026",status:"live",file:"Massage intake.pdf",pages:2,fields:12},
    {id:"photo",name:"Photo and Media Release",type:"Consent",rule:{kind:"everyone",items:[]},required:false,valid:"version",version:1,published:"Sep 15, 2026",status:"live",file:"Media Release.pdf",pages:1,fields:4},
    {id:"pt",name:"Personal Training Agreement",type:"Agreement",rule:{kind:"specific",items:["Personal training"]},required:true,valid:"version",version:1,published:null,status:"draft",file:"PT Agreement 2026.pdf",pages:2,fields:11}
  ];
  function sg(on,v,how){return {s:"signed",on:on,v:v,how:how||"Text link"}}
  function aw(sent){return {s:"awaiting",sent:sent,note:"Delivered"}}
  function ns(){return {s:"not_sent"}}
  var SEED={dana:{waiver:sg("Dec 15, 2025",6),agreement:sg("Oct 30, 2026",2),recovery:sg("Sep 14, 2026",1),photo:ns()},
    chris:{waiver:sg("Jan 9, 2026",7),agreement:{s:"needs_resend",why:"Text not delivered Nov 18"},photo:sg("Sep 20, 2026",1)},
    maya:{waiver:sg("Jun 1, 2026",7,"Text link, signed by Dana Whitfield as guardian"),photo:ns()},
    marcus:{waiver:sg("Nov 12, 2026",8),massage:ns(),photo:ns()},
    billy:{waiver:sg("Nov 20, 2026",8,"In person"),agreement:ns(),photo:ns()},
    sam:{waiver:aw("Nov 19"),photo:ns()},
    leah:{waiver:sg("Aug 3, 2026",7),agreement:sg("Oct 29, 2026",2),photo:sg("Sep 18, 2026",1)},
    devon:{waiver:sg("Jun 22, 2026",7),photo:sg("Sep 16, 2026",1)},
    tom:{waiver:sg("Mar 2, 2025",5,"Paper copy on file"),recovery:{s:"needs_new",on:"Nov 2, 2025",v:1}},
    ava:{waiver:sg("Sep 18, 2024",4)}};
  M.people().forEach(function(p){p.dsig=SEED[p.id]||{}});
  var st={view:"home",seg:"docs",pf:"tosend",q:"",sel:{},did:null,dt:"signatures",df:"all",wiz:null,send:null,sign:null,copy:null,add:null};

  function doc(id){return docs.filter(function(d){return d.id===id})[0]}
  function live(){return docs.filter(function(d){return d.status==="live"})}
  function ppl(){return M.people().filter(function(p){ if(!p.dsig) p.dsig={}; var d=M.dupOf(p.id); return !(d&&d.drop===p.id)})}
  function has(p){var o=[]; p.plans.forEach(function(x){o.push(x.service,x.name)}); p.appts.concat(p.visits.map(function(v){return {title:v[2]}})).forEach(function(a){DB.SERVICES.forEach(function(s){ if(String(a.title).toLowerCase().indexOf(s.title.split(",")[0].toLowerCase())===0||String(a.title).toLowerCase().indexOf(s.name.toLowerCase())===0) o.push(s.name)})}); return o}
  function qualifies(p,d){ if(d.rule.kind==="manual") return false; var any=p.plans.length||p.appts.length||p.visits.length||p.tx.length; if(d.rule.kind==="everyone") return !!any; var h=has(p).map(function(x){return String(x).toLowerCase()}); return d.rule.items.some(function(i){return h.indexOf(i.toLowerCase())>=0}) }
  /* a document comes due when someone matches its rule. Nothing is stored about "due" beyond the person's row. */
  function refresh(){
    ppl().forEach(function(p){ live().forEach(function(d){ if(!p.dsig[d.id]&&!(d.skip&&d.skip[p.id])&&qualifies(p,d)) p.dsig[d.id]=ns() });
      p.docs=live().filter(function(d){return p.dsig[d.id]&&d.required}).map(function(d){var x=p.dsig[d.id]; return {name:d.name,status:x.s==="signed"?"signed":(x.s==="awaiting"?"sent":"missing"),when:detail(p,d)}}) });
  }
  function reqDocs(p){return live().filter(function(d){return d.required&&p.dsig[d.id]})}
  function outstanding(p){return reqDocs(p).filter(function(d){return p.dsig[d.id].s!=="signed"})}
  function toSend(p){return outstanding(p).filter(function(d){return p.dsig[d.id].s!=="awaiting"})}
  function optOpen(p){return live().filter(function(d){return !d.required&&p.dsig[d.id]&&p.dsig[d.id].s!=="signed"})}
  function pstate(p){return toSend(p).length?"tosend":(outstanding(p).length?"waiting":"signed")}
  function listed(){return ppl().filter(function(p){return Object.keys(p.dsig).some(function(k){var d=doc(k); return d&&d.status==="live"})})}
  function soon(p){return p.appts.length>0}
  function ctx(p){var a=p.appts[0]; return a?a.title.split(",")[0]+", "+a.day+" "+a.time:(p.plans[0]?p.plans[0].name:"Nothing booked")}
  function whenClause(p){var a=p.appts[0]; return a?" before your "+a.title.split(",")[0].toLowerCase()+(a.day==="Today"?" today":" on "+a.day.split(",")[0]):""}
  function noText(p){return !p.textOk||!p.phone}
  function stats(d){var c={total:0,signed:0,awaiting:0,not_sent:0,needs_new:0,needs_resend:0}; ppl().forEach(function(p){var x=p.dsig[d.id]; if(!x) return; c.total++; c[x.s]++}); return c}
  function joinOr(a){return a.length<2?(a[0]||""):a.slice(0,-1).join(", ")+" or "+a[a.length-1]}
  function joinAnd(a){return a.length<2?(a[0]||""):a.slice(0,-1).join(", ")+" and "+a[a.length-1]}
  function ruleText(d){var r=d.rule; if(r.kind==="everyone") return "Everyone who books or buys"; if(r.kind==="manual") return "Only people you send it to"; if(!r.items.length) return "People who book or buy specific things"; return "Anyone who books or buys "+r.items.slice(0,2).join(", ")+(r.items.length>2?" and "+(r.items.length-2)+" more":"")}
  function ruleSentence(d){var r=d.rule, verb=d.required?"Required for":"Offered to", tail=d.required?"":" They can skip it."; if(r.kind==="manual") return "Only for people you send it to."; if(r.kind==="everyone") return verb+" everyone who books or buys."+tail; return verb+" anyone who books or buys "+(r.items.length?joinOr(r.items):"the things you pick")+"."+tail}
  function detail(p,d){var x=p.dsig[d.id]; if(x.s==="signed") return "Signed "+x.on+" · Version "+x.v+" · "+x.how; if(x.s==="awaiting") return "Texted "+x.sent+" · "+x.note; if(x.s==="needs_new") return "Signed Version "+x.v+" on "+x.on+(d.valid==="year"?". 12 months have passed":""); if(x.s==="needs_resend") return x.why; return noText(p)?"Cannot be texted":(d.required?"No request sent yet":"Offered on the next link. Can be skipped.")}
  function pill(s){return '<span class="chip '+ST[s][1]+'">'+ST[s][0]+'</span>'}
  function dchip(p,d){var s=p.dsig[d.id].s; return '<span class="chip '+ST[s][1]+'" title="'+esc(ST[s][0]+". "+detail(p,d))+'">'+esc(d.name)+'<span class="vh">, '+ST[s][0]+'</span></span>'}
  function tile(d){return '<span class="av" style="border-radius:10px">'+(TYPES[d.type]||TYPES.Other).ic+'</span>'}
  function seg(act,cur,opts){return '<div class="seg" role="group">'+opts.map(function(o){return '<button data-act="'+act+'" data-id="'+o[0]+'" aria-pressed="'+(cur===o[0])+'">'+o[1]+(o[2]!==undefined?' <span class="m">'+o[2]+'</span>':"")+'</button>'}).join("")+'</div>'}
  function fchips(act,cur,opts){return '<div class="filters" style="margin:0;padding:0">'+opts.map(function(o){return '<button class="fchip" data-act="'+act+'" data-id="'+o[0]+'" aria-pressed="'+(cur===o[0])+'">'+o[1]+' <span class="n">'+o[2]+'</span></button>'}).join("")+'</div>'}

  /* ---------- home ---------- */
  function banner(){
    var L=listed(), ts=L.filter(function(p){return pstate(p)==="tosend"}), wt=L.filter(function(p){return pstate(p)==="waiting"});
    if(!ts.length&&!wt.length) return '<div class="infobox" style="background:var(--ok-soft);border-color:var(--ok-line);color:var(--ok)"><b>Every required document is signed.</b></div>';
    if(!ts.length) return '<div class="infobox dban"><div><b>Every request is out.</b> '+M.plural(wt.length,"person has","people have")+" a link and "+(wt.length===1?"has":"have")+' not signed yet.</div><button class="btn sm" data-act="dseg" data-id="people:waiting">See who</button></div>';
    var sn=ts.filter(soon).length, sub=sn?sn+" of them "+(sn===1?"is":"are")+" booked in the next 7 days.":"None of them are booked this week.";
    if(wt.length) sub+=" "+wt.length+" more "+(wt.length===1?"has":"have")+" a link and "+(wt.length===1?"has":"have")+" not signed yet.";
    return '<div class="warnbox dban"><div><b>'+M.plural(ts.length,"person needs","people need")+' a signing request.</b> '+sub+'</div><button class="btn sm" data-act="dsendopen" data-id="all">Review and send</button></div>';
  }
  function docsTable(){
    var rows=docs.filter(function(d){return d.status!=="archived"}).map(function(d){
      var c=stats(d), need=c.needs_new+c.needs_resend+c.not_sent, draft=d.status==="draft";
      return '<tr class="go" data-act="dopen" data-id="'+d.id+'"><td><div class="nmc">'+tile(d)+'<b>'+esc(d.name)+'</b></div></td><td>'+d.type+'</td><td>'+(draft?"Draft version "+d.version:"Version "+d.version)+'</td><td>'+esc(ruleText(d))+'</td><td>'+(d.required?"Required":"Optional")+'</td><td>'+(draft?'<span class="chip mist">Draft</span>':(c.total?'<span class="dmeter" role="img" aria-label="'+c.signed+" of "+c.total+' signed"><i style="width:'+Math.round(c.signed/c.total*100)+'%"></i></span> '+c.signed+" of "+c.total:"Nobody needs this yet"))+'</td><td>'+(draft?"":(d.required?(need?'<span class="chip warn">'+need+'</span>':"0"):'<span class="m">Optional</span>'))+'</td><td>'+(draft?"":c.awaiting)+'</td><td><div class="ract"><button class="btn sm quiet" data-act="dopen" data-id="'+d.id+'">'+(draft?"Continue setup":"Open")+'</button></div></td></tr>'}).join("");
    return '<section class="card flush"><div class="tw" style="border-top:0"><table class="pin"><thead><tr><th>Document</th><th>Type</th><th>Version</th><th>Who signs it</th><th>Required</th><th>Signed</th><th>Need a request</th><th>Awaiting</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div></section><p class="sub" style="margin-top:12px">Signed copies also show on each person\'s contact record.</p>';
  }
  function peopleList(){var q=st.q.trim().toLowerCase(), ord={tosend:0,waiting:1,signed:2}; return listed().filter(function(p){return (st.pf==="all"||pstate(p)===st.pf)&&(!q||p.name.toLowerCase().indexOf(q)>-1)}).sort(function(a,b){return ord[pstate(a)]-ord[pstate(b)]||(soon(b)?1:0)-(soon(a)?1:0)||a.name.localeCompare(b.name)})}
  function peopleRows(){
    var L=peopleList(); if(!L.length) return '<tr><td colspan="6"><div class="none">Nobody here. Try another filter or clear the search.</div></td></tr>';
    return L.map(function(p){
      var s=pstate(p), ts=toSend(p), act, cb="";
      if(s==="tosend") act=noText(p)?'<button class="btn sm" data-act="dsign" data-id="'+p.id+'">Sign on this device</button>':'<button class="btn sm" data-act="dsendone" data-id="'+p.id+'">Send '+M.plural(ts.length,"document")+'</button><button class="btn sm quiet" data-act="dsign" data-id="'+p.id+'">Sign here</button>';
      else if(s==="waiting") act='<button class="btn sm" data-act="dsendone" data-id="'+p.id+'">Resend</button><button class="btn sm quiet" data-act="dsign" data-id="'+p.id+'">Sign here</button>';
      else act='<button class="btn sm quiet" data-act="record" data-id="'+p.id+'">View</button>';
      if(s!=="signed"&&!noText(p)) cb='<input type="checkbox" class="pick" data-dsel="'+p.id+'"'+(st.sel[p.id]?" checked":"")+' aria-label="Select '+esc(p.name)+'">';
      return '<tr><td style="width:34px">'+cb+'</td><td><button class="link" data-act="record" data-id="'+p.id+'">'+esc(p.name)+'</button></td><td>'+M.statusChip(M.status(p))+'</td><td>'+(soon(p)&&s!=="signed"?'<span style="color:var(--warn);font-weight:600">'+esc(ctx(p))+'</span>':esc(ctx(p)))+(noText(p)?' <span class="chip warn">No texts</span>':"")+'</td><td><div class="rbar" style="gap:4px;flex-wrap:nowrap">'+(reqDocs(p).map(function(d){return dchip(p,d)}).join("")||'<span class="m">Nothing required</span>')+'</div></td><td><div class="ract">'+act+'</div></td></tr>'}).join("");
  }
  function bulk(){var n=Object.keys(st.sel).filter(function(k){return st.sel[k]}).length; return n?'<div class="bulk"><b>'+n+' selected</b><button class="btn sm hl" data-act="dsendsel">Send what\'s missing</button><button class="btn sm quiet" data-act="dclearsel">Clear</button></div>':""}
  function peopleView(){
    var c={tosend:0,waiting:0,signed:0}, L=listed(); L.forEach(function(p){c[pstate(p)]++});
    return '<div class="rbar" style="margin-bottom:12px">'+fchips("dpf",st.pf,[["tosend","To send",c.tosend],["waiting","Waiting on them",c.waiting],["signed","All signed",c.signed],["all","Everyone",L.length]])+'<span class="sp"></span><input class="search" id="dq" type="search" placeholder="Search by name" aria-label="Search by name" value="'+esc(st.q)+'"></div><section class="card flush"><div id="dbulk">'+bulk()+'</div><div class="tw" style="border-top:0"><table><thead><tr><th></th><th>Person</th><th>Status</th><th>Next session</th><th>Required documents</th><th></th></tr></thead><tbody id="drows">'+peopleRows()+'</tbody></table></div></section><div class="rbar" style="margin-top:10px;gap:6px"><span class="m">Key:</span>'+Object.keys(ST).map(pill).join("")+'</div>';
  }
  function homeHTML(){
    return '<p class="sub">Waivers, agreements and anything else people sign. They sign on their phone, and Milton keeps the signed copy.</p>'+banner()+'<div class="rbar" style="margin:14px 0 12px">'+seg("dseg",st.seg,[["docs","Documents",docs.length],["people","People",listed().length]])+'<span class="sp"></span><button class="btn sm" data-act="panel" data-id="dpick">Sign on this device</button><button class="btn sm" data-act="dpreview" data-id="">Preview as member</button><button class="btn sm" data-act="dnew">New document</button></div>'+(st.seg==="docs"?docsTable():peopleView());
  }
  /* ---------- one document ---------- */
  function ruleEditor(o){
    var rc=function(k,t,b){return '<button class="opt" data-act="drule" data-id="kind:'+k+'" aria-pressed="'+(o.rule.kind===k)+'"><b>'+t+'</b><span class="m">'+b+'</span></button>'};
    return '<div class="field"><label>Who signs it</label><div class="stack" style="gap:8px">'+rc("everyone","Everyone who books or buys","It comes due the first time someone books a session or buys anything. Leads who never book are left alone.")+rc("specific","People who book or buy specific things","Pick the services and packages. A recovery agreement for recovery bookings, an agreement for memberships.")+(o.rule.kind==="specific"?'<div class="pills">'+CATALOG.map(function(i){return '<button data-act="drule" data-id="item:'+esc(i)+'" aria-pressed="'+(o.rule.items.indexOf(i)>-1)+'">'+esc(i)+'</button>'}).join("")+'</div>':"")+rc("manual","Only people I send it to","For one-off contracts. It never comes due on its own.")+'</div></div><div class="setrow"><div><b>Required</b><div class="m">Required documents count toward who still needs a request, and flag the person on the schedule. Optional ones ride along on the same link and can be skipped.</div></div><button class="sw" role="switch" data-act="drule" data-id="req:" aria-checked="'+!!o.required+'" aria-label="Required"></button></div><div class="field" style="margin-top:12px"><label for="dValid">Good for</label><select id="dValid" data-dvalid="1"><option value="version"'+(o.valid==="version"?" selected":"")+'>Until a new version asks for a new signature</option><option value="year"'+(o.valid==="year"?" selected":"")+'>12 months, then sign again</option></select></div>';
  }
  function docHTML(){
    var d=doc(st.did), c=stats(d), h='<button class="backl" data-act="dhome">&#8249; Documents</button><section class="card"><div class="ch" style="margin:0"><div class="nmc">'+tile(d)+'<div><h2 class="h3" style="font-size:22px">'+esc(d.name)+'</h2><div class="m">'+d.type+" · Version "+d.version+" · Published "+d.published+" · "+M.plural(d.pages,"page")+", "+d.fields+' fields</div><div style="margin-top:4px">'+esc(ruleSentence(d))+'</div></div></div><div class="acts"><button class="btn sm" data-act="dpreview" data-id="'+d.id+'">Preview as member</button></div></div></section><div class="rbar" style="margin:14px 0 12px">'+seg("ddt",st.dt,[["signatures","Signatures"],["setup","Setup"],["versions","Versions"]])+'</div>';
    if(st.dt==="signatures"){
      if(!c.total) return h+'<section class="card"><div class="none"><b>Nobody needs this yet.</b> It comes due when someone matches the rule in Setup. You can also send it to anyone with Send for signature.</div></section>';
      var ord={needs_resend:0,needs_new:1,not_sent:2,awaiting:3,signed:4};
      var L=ppl().filter(function(p){return p.dsig[d.id]&&(st.df==="all"||p.dsig[d.id].s===st.df)}).sort(function(a,b){return ord[a.dsig[d.id].s]-ord[b.dsig[d.id].s]||a.name.localeCompare(b.name)});
      h+='<div style="margin-bottom:12px">'+fchips("ddf",st.df,[["all","All",c.total],["not_sent","Not sent",c.not_sent],["awaiting","Awaiting signature",c.awaiting],["signed","Signed",c.signed],["needs_new","Needs new signature",c.needs_new],["needs_resend","Needs resend",c.needs_resend]])+'</div><section class="card flush"><div class="tw" style="border-top:0"><table class="pin"><thead><tr><th>Person</th><th>Status</th><th>Document status</th><th>Detail</th><th></th></tr></thead><tbody>'+(L.map(function(p){var s=p.dsig[d.id].s, act;
        if(s==="signed") act='<button class="btn sm" data-act="dcopy" data-id="'+p.id+":"+d.id+'">View signed copy</button>'; else if(noText(p)) act='<button class="btn sm" data-act="dsign" data-id="'+p.id+'">Sign on this device</button>'; else act='<button class="btn sm" data-act="dsendone" data-id="'+p.id+":"+d.id+'">'+(s==="not_sent"?"Send":(s==="awaiting"?"Resend":"Send new link"))+'</button>';
        return '<tr><td><button class="link" data-act="record" data-id="'+p.id+'">'+esc(p.name)+'</button></td><td>'+M.statusChip(M.status(p))+'</td><td>'+pill(s)+'</td><td>'+esc(detail(p,d))+'</td><td><div class="ract">'+act+'</div></td></tr>'}).join("")||'<tr><td colspan="5"><div class="none">Nobody in this status.</div></td></tr>')+'</tbody></table></div></section>';
    } else if(st.dt==="setup"){
      h+='<section class="card" style="max-width:760px"><div class="stack" style="gap:12px"><div class="field"><label for="dName">Name</label><input id="dName" value="'+esc(d.name)+'"><div class="m">Members see this name on their signing link.</div></div><div class="field"><label for="dType">Type</label><select id="dType" data-dtype="1">'+Object.keys(TYPES).map(function(k){return '<option'+(d.type===k?" selected":"")+'>'+k+'</option>'}).join("")+'</select><div class="m">Sets the icon and the wording of the text. It does not limit what the document can do.</div></div>'+ruleEditor(d)+'</div></section><p class="sub" style="margin-top:12px">Changes apply to new signing requests. Signed copies never change.</p>';
    } else {
      var hist=d.hist||[[d.version,d.published,"First version"]];
      h+='<section class="card">'+hist.map(function(x,i){return '<div class="row"><div class="what"><div class="t">Version '+x[0]+" "+(i===0?'<span class="chip ok">Live</span>':'<span class="chip">Replaced</span>')+'</div><div class="m">Published '+x[1]+" · "+x[2]+" · "+(i===0?c.signed+" signed":"Signed copies kept")+'</div></div><div class="acts">'+(i===0?'<button class="btn sm" data-act="dedit" data-id="'+d.id+'">Edit fields</button><button class="btn sm" data-act="later" data-id="Replacing the PDF, which starts a draft and sends nothing,">Replace PDF</button>':'<button class="btn sm quiet" data-act="later" data-id="Opening an older version, read only,">View</button>')+'</div></div>'}).join("")+'</section><p class="sub" style="margin-top:12px">Source file: '+esc(d.file)+'. Every signed copy stays with the version that was signed. Editing or replacing starts a draft and sends nothing.</p>';
    }
    return h;
  }
  /* ---------- new document, three steps ---------- */
  function cleanName(f){var s=f.replace(/\.pdf$/i,"").replace(/_+/g," ").replace(/\([^)]*\)/g," "); s=s.replace(/\b(final|update|updated|copy|draft|v\d+)\b/gi," ").replace(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?\s*\d{4}\b/gi," ").replace(/\b20\d{2}\b/g," "); return s.replace(/\s+/g," ").trim()||"Untitled document"}
  function guessType(n){if(/waiver|liability/i.test(n)) return "Waiver"; if(/agreement|contract|terms/i.test(n)) return "Agreement"; if(/photo|media|consent|release/i.test(n)) return "Consent"; if(/policy|rules/i.test(n)) return "Policy"; return "Other"}
  function startWiz(d,step){st.view="wiz"; st.wiz=d?{id:d.id,step:step||2,file:d.file,name:d.name,type:d.type,rule:{kind:d.rule.kind,items:d.rule.items.slice()},required:d.required,valid:d.valid,existing:"all",touched:true,liveEdit:d.status==="live"}:{id:null,step:1,file:null,name:"",type:"Waiver",rule:{kind:"everyone",items:[]},required:true,valid:"version",existing:"all",touched:false}}
  function setFile(n){var w=st.wiz; w.file=n; w.name=cleanName(n); w.type=guessType(w.name); if(!w.touched){w.rule.kind=TYPES[w.type].kind; w.required=TYPES[w.type].required}}
  function paper(name,agreement){return '<div class="dpaper"><h4>'+esc(name)+'</h4><div class="prow">Name <span class="fbox sel">Full name</span> Email <span class="fbox">Email address</span></div>'+(agreement?'<div class="prow">Package <span class="fbox">Package name</span> Price <span class="fbox">Price</span> Starts <span class="fbox">Start date</span></div>':'<div class="prow">Phone <span class="fbox">Phone</span> Born <span class="fbox">Date of birth</span> Emergency <span class="fbox">Name and phone</span></div>')+'<div class="ln"></div><div class="ln"></div><div class="ln s"></div><div class="prow"><span class="fbox ini">Initials</span><span class="lns"><div class="ln"></div><div class="ln s"></div></span></div><div class="ln"></div><div class="ln"></div><div class="ln s"></div><div class="prow"><span class="fbox" style="flex:3">Signature</span><span class="fbox">Date signed</span></div><div class="prow"><span class="fbox" style="flex:3">Guardian signature</span><span class="fbox">Guardian date signed</span></div></div>'}
  function wizHTML(){
    var w=st.wiz, steps=["Upload","Fields","Rules and publish"], body;
    var h='<button class="backl" data-act="dhome">&#8249; Documents</button><h2 class="h3" style="font-size:22px;margin:0 2px 10px">'+(w.id?esc(w.name):"New document")+'</h2><div class="steps">'+steps.map(function(l,i){return '<button data-act="dwstep" data-id="'+(i+1)+'"'+(w.step===i+1?' aria-current="step"':"")+(i+1>w.step||(i===0&&w.id)?" disabled":"")+'><span>'+(i+1)+'</span>'+l+'</button>'}).join("")+'</div>';
    if(w.step===1){
      body='<section class="card" style="max-width:760px"><div class="stack" style="gap:14px">'+(w.file?'<div class="setrow" style="margin:0"><div class="nmc"><span class="av" style="border-radius:10px">PDF</span><div><b>'+esc(w.file)+'</b><div class="m">Ready. The original file name is kept with the version.</div></div></div><button class="btn sm quiet" data-act="dwfile" data-id="">Remove</button></div>':'<div class="ddrop"><b>Add the PDF your gym already uses</b><div class="m">PDF only. Up to 10 MB and 20 pages.</div><div class="acts" style="justify-content:center;margin-top:10px"><label class="btn hl" style="cursor:pointer">Choose a PDF<input type="file" accept="application/pdf,.pdf" data-dfile="wiz" class="vh"></label><button class="btn" data-act="dwfile" data-id="Cancellation Policy 2026 FINAL.pdf">Use a sample PDF</button></div></div>')
        +(w.file?'<div class="field"><label for="dwName">Name</label><input id="dwName" value="'+esc(w.name)+'"><div class="m">Named from the file. Change it to what members should see.</div></div><div class="field"><label>Type</label><div class="stack" style="gap:8px">'+Object.keys(TYPES).map(function(k){return '<button class="opt" data-act="dwtype" data-id="'+k+'" aria-pressed="'+(w.type===k)+'"><b>'+k+'</b><span class="m">'+TYPES[k].blurb+'</span></button>'}).join("")+'</div></div>':"")+'</div><div class="acts" style="margin-top:16px;padding-top:14px;border-top:1px solid var(--line)"><button class="btn pri" data-act="dwnext"'+(w.file?"":" disabled")+'>Continue to fields</button><button class="btn quiet" data-act="dhome">Cancel</button></div></section>';
    } else if(w.step===2){
      body='<p class="sub">This is the field editor you have today, with two additions: Fill in from, and signing dates in your gym\'s time zone.</p><div class="ped" style="margin-top:0"><section class="card">'+paper(w.name,w.type==="Agreement")+'</section><aside class="pside" style="position:static"><div class="card"><div class="ch"><h3>Form fields</h3></div><button class="btn sm" data-act="dtoast" data-id="11 fields found. Check where each one sits, then continue.">Detect fields</button><div class="m" style="margin-top:6px">11 fields found.</div><div class="field" style="margin-top:12px"><label for="fAdd">Field to add</label><select id="fAdd"><option>Text</option><option>Signature</option><option>Full name</option><option>Date</option><option>Signing date</option><option>Multiline text</option><option>Checkbox</option><option>Initials</option></select></div><div class="k" style="margin-top:14px">Selected: Full name</div><div class="field" style="margin-top:6px"><label for="fLabel">Field label</label><input id="fLabel" value="Full name"></div><div class="field" style="margin-top:8px"><label for="fSigner">Signer</label><select id="fSigner"><option>Member</option><option>Parent or guardian</option></select></div><div class="field" style="margin-top:8px"><label for="fFill">Fill in from</label><select id="fFill"><option>Contact record: name</option><option>Contact record: email</option><option>Contact record: phone</option><option>Contact record: date of birth</option><option>Contact record: emergency contact</option><option>Package: name</option><option>Package: price</option><option>Package: start date</option><option>Nothing. The member types it.</option></select><div class="m">Members confirm what Milton already knows. They can change it.</div></div><label class="pk" style="padding:10px 0 0;border:0"><input type="checkbox" class="pick" checked><span>Required answer</span></label><div class="m" style="margin-top:8px">Signing dates use your gym\'s time zone, '+G.tz+'.</div></div></aside></div><section class="card" style="margin-top:16px"><div class="acts"><button class="btn pri" data-act="dwnext">Continue to rules</button><button class="btn" data-act="dwstep" data-id="1"'+(w.id?" disabled":"")+'>Back</button><button class="btn quiet" data-act="dwsave" data-id="draft">Save draft</button></div></section>';
    } else {
      var n=ppl().filter(function(p){return qualifies(p,w)&&!(w.id&&p.dsig[w.id])}).length;
      body='<section class="card" style="max-width:760px"><div class="stack" style="gap:12px">'+ruleEditor(w)+'<div class="field"><label>People who already qualify</label><div class="stack" style="gap:8px"><button class="opt" data-act="dwex" data-id="all" aria-pressed="'+(w.existing==="all")+'"><b>Ask them too</b><span class="m">'+M.plural(n,"person qualifies","people qualify")+' today. They show under People, To send.</span></button><button class="opt" data-act="dwex" data-id="future" aria-pressed="'+(w.existing==="future")+'"><b>Only people who qualify from now on</b><span class="m">Nobody is asked today.</span></button></div></div><div class="infobox"><b>'+esc(w.name)+'.</b> '+esc(ruleSentence(w))+' Publishing sends no messages.</div></div><div class="acts" style="margin-top:16px;padding-top:14px;border-top:1px solid var(--line)"><button class="btn pri" data-act="dwsave" data-id="live">Publish document</button><button class="btn" data-act="dwstep" data-id="2">Back</button><button class="btn quiet" data-act="dwsave" data-id="draft">Save draft</button></div></section>';
    }
    return h+body;
  }

  /* ---------- sending: one text and one link per person ---------- */
  function packet(p,scope){ if(scope==="all") return outstanding(p); var d=doc(scope); return d&&p.dsig[scope]&&p.dsig[scope].s!=="signed"?[d]:[] }
  function cands(scope){return listed().filter(function(p){return packet(p,scope).length}).sort(function(a,b){return (soon(b)?1:0)-(soon(a)?1:0)||a.name.localeCompare(b.name)})}
  function needsReq(p,scope){return packet(p,scope).some(function(d){return p.dsig[d.id].s!=="awaiting"})}
  function openSend(o){
    refresh(); var scope=o.scope||"all", c=cands(scope).filter(function(p){return !noText(p)});
    var ids=o.ids?o.ids.filter(function(id){return c.some(function(p){return p.id===id})}):c.filter(function(p){return needsReq(p,scope)}).map(function(p){return p.id});
    if(o.ids&&!ids.length) return M.toast("Nothing to send. Everything in scope is signed, or the person cannot be texted.");
    var sel={}; ids.forEach(function(id){sel[id]=true});
    st.send={scope:scope,one:scope==="all"?live()[0].id:scope,sel:sel,step:o.step||1,q:""}; M.openPanel("dsend");
  }
  function selIds(){return Object.keys(st.send.sel).filter(function(k){return st.send.sel[k]})}
  function sms(p,pk){return G.name+": Hi "+p.first+", "+(pk.length===1?"please sign the "+pk[0].name:"you have "+pk.length+" documents to sign")+whenClause(p)+". It takes about 2 minutes. "}
  function sendRows(){
    var m=st.send, q=m.q.trim().toLowerCase(), L=cands(m.scope).filter(function(p){return !q||p.name.toLowerCase().indexOf(q)>-1});
    if(!L.length) return '<div class="none">Nobody to send to. Everyone in scope has signed.</div>';
    return L.map(function(p){var chips=packet(p,m.scope).map(function(d){return dchip(p,d)}).join(" ");
      return '<label class="pk'+(noText(p)?" off":"")+'" style="align-items:flex-start"><input type="checkbox" class="pick" style="margin-top:3px" data-dsend="'+p.id+'"'+(noText(p)?" disabled":(m.sel[p.id]?" checked":""))+'><span><b style="font-weight:600">'+esc(p.name)+'</b><div class="m">'+(noText(p)?"Cannot be texted. Sign on this device from their record.":esc(ctx(p)))+'</div><div class="rbar" style="gap:4px;margin-top:4px">'+chips+'</div></span></label>'}).join("");
  }
  M.panels.dsend=function(){
    var m=st.send, n=selIds().length;
    if(m.step===1){
      var c=cands(m.scope).filter(function(p){return !noText(p)}), cN=c.filter(function(p){return needsReq(p,m.scope)}).length, cS=c.filter(soon).length, cW=c.filter(function(p){return !needsReq(p,m.scope)}).length;
      return '<div class="sph"><div><h3>Send for signature</h3><div class="m">One text per person. One link with everything they still owe.</div></div>'+M.px+'</div><div class="spb"><div class="k">What to send</div><button class="opt" data-act="dsscope" data-id="all" aria-pressed="'+(m.scope==="all")+'"><b>Everything each person is missing</b><span class="m">Required documents first. Optional ones ride along and can be skipped.</span></button><button class="opt" data-act="dsscope" data-id="one" aria-pressed="'+(m.scope!=="all")+'"><b>Only one document</b></button>'+(m.scope!=="all"?'<select class="fld" data-dsone="1" aria-label="Document to send">'+live().map(function(d){return '<option value="'+d.id+'"'+(m.scope===d.id?" selected":"")+'>'+esc(d.name)+'</option>'}).join("")+'</select>':"")+'<div class="k" style="margin-top:6px">Who gets it</div><div class="filters" style="margin:0;padding:0">'+[["need","Needs a request",cN],["soon","Booked this week",cS],["wait","Waiting on them",cW],["none","None",""]].map(function(x){return '<button class="fchip" data-act="dspick" data-id="'+x[0]+'">'+x[1]+(x[2]!==""?' <span class="n">'+x[2]+'</span>':"")+'</button>'}).join("")+'</div><input class="search" style="max-width:none;flex:none" id="dsq" type="search" placeholder="Search by name" aria-label="Search by name" value="'+esc(m.q)+'"><div class="svc" style="margin:0" id="dsrows">'+sendRows()+'</div></div><div class="spf"><button class="btn pri" data-act="dsstep" data-id="2"'+(n?"":" disabled")+' id="dsgo">Review '+M.plural(n,"person","people")+'</button><button class="btn" data-act="pclose">Cancel</button></div>';
    }
    var P=selIds().map(M.person), f=P[0], pk=packet(f,m.scope), opt=P.some(function(p){return m.scope==="all"&&optOpen(p).length}), cant=cands(m.scope).filter(noText);
    return '<div class="sph"><div><h3>Review and send</h3><div class="m">Nothing goes out until you press Send.</div></div>'+M.px+'</div><div class="spb"><div class="k">The text '+esc(f.first)+' gets</div><div class="msg l" style="max-width:100%"><div class="bub">'+esc(sms(f,pk))+'<span style="color:var(--ocean);text-decoration:underline">private signing link</span> Reply STOP to opt out.</div><div class="meta">Text from '+G.num+'</div></div><div class="k" style="margin-top:6px">'+M.plural(P.length,"person","people")+'</div><div class="svc" style="margin:0">'+P.map(function(p){return '<div class="pk" style="cursor:default;align-items:flex-start"><span></span><span><b style="font-weight:600">'+esc(p.name)+'</b><div class="rbar" style="gap:4px;margin-top:4px">'+packet(p,m.scope).map(function(d){return dchip(p,d)}).join(" ")+'</div></span></div>'}).join("")+'</div>'+(opt?'<div class="m">Optional documents ride along on the same link and can be skipped.</div>':"")+(cant.length?'<div class="warnbox">'+esc(joinAnd(cant.map(function(p){return p.name})))+" cannot be texted and "+(cant.length===1?"is":"are")+' left out. Use Sign on this device.</div>':"")+'</div><div class="spf"><button class="btn pri" data-act="dsgo">Send to '+M.plural(P.length,"person","people")+'</button><button class="btn" data-act="dsstep" data-id="1">Back</button></div>';
  };
  function doSend(ids,scope){
    var nd=0; ids.forEach(function(id){var p=M.person(id), pk=packet(p,scope); if(!pk.length) return;
      pk.forEach(function(d){p.dsig[d.id]=aw("Nov 20"); nd++});
      p.thread.push({k:"auto",src:"Signing request",name:pk.length===1?pk[0].name:pk.length+" documents",ch:"Text",day:"Today",t:"just now",body:sms(p,pk)+"[link] Reply STOP to opt out."}) });
    refresh(); return nd;
  }
  /* ---------- the member's signing page: a text link, a preview, or this device ---------- */
  function ov(){var e=$("signer"); if(!e){e=document.createElement("div"); e.id="signer"; e.className="takeover dsigner"; e.hidden=true; document.body.appendChild(e)} return e}
  function openSign(o){
    refresh(); var p=M.person(o.pid), ds;
    if(o.mode==="preview") ds=o.did?[doc(o.did)]:live().filter(function(d){return d.id==="waiver"||d.id==="agreement"||d.id==="photo"});
    else ds=outstanding(p).concat(optOpen(p));
    if(!ds.length) return M.toast(p.first+" has nothing left to sign.");
    M.closePanel(); st.sign={mode:o.mode,pid:p.id,ds:ds.map(function(d){return d.id}),i:-1,inits:0,signed:false,typed:"",sig:"",done:[]}; drawSign();
  }
  function initNeed(d){return d.type==="Waiver"?2:1}
  function ready(){var m=st.sign, d=doc(m.ds[m.i]); return m.inits>=initNeed(d)&&(m.signed||(!m.sig&&m.typed.trim().length>2))}
  function drawSign(){
    var m=st.sign, e=ov(); if(!m){e.hidden=true; e.innerHTML=""; return}
    var p=M.person(m.pid), ds=m.ds.map(doc), reqN=ds.filter(function(d){return d.required}).length, scr;
    if(m.i===-1) scr='<div class="dmtop">'+esc(G.name)+'</div><div class="mbody"><h3 class="h3">Hi '+esc(p.first)+". "+(reqN?"You have "+M.plural(reqN,"document")+" to sign"+(ds.length>reqN?", plus "+(ds.length-reqN)+" optional":"")+".":"You have "+M.plural(ds.length,"optional document")+".")+'</h3><div class="m">About 2 minutes. You sign once and tap to apply it to each one.</div>'+ds.map(function(d){return '<div class="setrow" style="justify-content:flex-start">'+tile(d)+'<div><b>'+esc(d.name)+'</b><div class="m">'+M.plural(d.pages,"page")+(d.required?"":" · Optional")+'</div></div></div>'}).join("")+'<button class="btn pri big" data-act="dmstart" style="margin-top:14px">Start</button></div>';
    else if(m.i>=ds.length){var sk=ds.length-m.done.length; scr='<div class="dmtop">'+esc(G.name)+'</div><div class="mbody" style="text-align:center"><div class="donec">&#10003;</div><h3 class="h3">All signed</h3><div class="m">'+M.plural(m.done.length,"document")+" signed"+(sk?", "+sk+" skipped":"")+". "+esc(G.name)+' has your copies, and you can download them from this link any time.</div><button class="btn pri big" data-act="dmdone" style="margin-top:14px">Done</button></div>'}
    else {
      var d=ds[m.i], need=initNeed(d), boxes="", k, sig;
      for(k=0;k<need;k++) boxes+='<div class="prow"><button class="ibox'+(k<m.inits?" done":"")+'" data-act="dminit"'+(k<m.inits?" disabled":"")+'>'+(k<m.inits?esc(p.initials):"Initial")+'</button><span class="lns"><div class="ln"></div><div class="ln s"></div></span></div>';
      if(m.signed) sig='<div class="sigbox done"><span class="script">'+esc(m.sig)+'</span></div>';
      else if(m.sig) sig='<button class="sigbox" data-act="dmuse">Tap to sign as <span class="script">'+esc(m.sig)+'</span></button>';
      else sig='<input class="fld" id="dSig" placeholder="Type your full name to sign" aria-label="Type your full name to sign" autocomplete="off" value="'+esc(m.typed)+'"><div class="sigbox'+(m.typed?" done":"")+'" id="dSigPrev">'+(m.typed?'<span class="script">'+esc(m.typed)+'</span>':"Your signature shows here")+'</div>';
      scr='<div class="dmtop"><span>'+esc(d.name)+'</span><span>'+(m.i+1)+" of "+ds.length+'</span></div><div class="mbody">'+(d.required?"":'<span class="chip" style="align-self:flex-start">Optional</span>')+'<div class="dpaper sm"><div class="prow">Name <span class="fbox filled">'+esc(p.name)+'</span></div>'+(m.i===0?'<div class="m" style="font-size:12px">Filled in from your profile. Tap to change.</div>':"")+'<div class="ln"></div><div class="ln"></div><div class="ln s"></div>'+boxes+'</div>'+sig+'<button class="btn pri big" id="dmSign" data-act="dmsign"'+(ready()?"":" disabled")+'>'+(m.i===ds.length-1?"Sign and finish":"Sign and continue")+'</button>'+(d.required?"":'<button class="btn quiet" data-act="dmskip">Skip this one</button>')+'</div>';
    }
    var prev=m.mode==="preview";
    e.innerHTML='<div class="dsh"><div><h2 class="h3" style="font-size:19px">'+(prev?"Preview as member":"Hand the device to "+esc(p.first))+'</h2><div class="m">'+(prev?"Preview only. Nothing is sent or saved.":"Signing here saves to "+esc(p.name)+"'s record, marked In person. No text is sent.")+'</div></div><button class="btn" data-act="dmclose">'+(prev?"Close preview":"Close")+'</button></div><div class="dsw"><div class="dphone"><div class="dscreen">'+scr+'</div></div><div class="dnotes"><div class="k">'+(prev?"What a member sees":"How this works")+'</div><ul><li>One link opens everything they still owe, in order'+(reqN<ds.length?", required first":"")+'.</li><li>Name, phone and email fill in from the contact record.</li><li>They type their signature once, then tap to apply it to each document.</li><li>Optional documents come last and can be skipped.</li><li>A signed copy is saved as each document is signed, so leaving partway keeps what was done.</li><li>Signing dates use your gym\'s time zone.</li></ul></div></div>';
    e.hidden=false; var f=$("dSig"); if(f&&m.i>=0) f.focus();
  }
  function closeSign(){
    var m=st.sign; if(!m) return; var p=M.person(m.pid), n=m.done.length;
    st.sign=null; drawSign(); refresh(); M.render();
    if(m.mode==="live"&&n) M.toast(M.plural(n,"document")+" signed on this device. Saved to "+p.first+"'s record.");
  }
  /* signed copy and paper copy panels */
  M.panels.dpick=function(){
    refresh(); var L=listed().filter(function(p){return outstanding(p).length||optOpen(p).length}).sort(function(a,b){return (soon(b)?1:0)-(soon(a)?1:0)||outstanding(b).length-outstanding(a).length||a.name.localeCompare(b.name)});
    return '<div class="sph"><div><h3>Sign on this device</h3><div class="m">Who is signing? You hand them this screen. No text is sent.</div></div>'+M.px+'</div><div class="spb">'+(L.length?L.map(function(p){var o=outstanding(p), op=optOpen(p); return '<button class="opt" data-act="dsign" data-id="'+p.id+'"><b>'+esc(p.name)+'</b><span class="m">'+(o.length?esc(joinAnd(o.map(function(d){return d.name})))+(op.length?", plus "+op.length+" optional":""):op.length+" optional, nothing required")+(soon(p)?" · "+esc(ctx(p)):"")+'</span></button>'}).join(""):'<div class="none">Nobody has anything left to sign.</div>')+'<div class="m">Someone new? Book or sell to them first and their documents come due.</div></div>';
  };
  M.panels.dcopy=function(){
    var p=M.person(st.copy.pid), d=doc(st.copy.did), x=p.dsig[d.id], how={"Text link":"Text link, on their phone","In person":"In person, on the gym's device","Paper copy on file":"Paper copy on file, added by your team"}[x.how]||x.how;
    return '<div class="sph"><div><h3>'+esc(d.name)+'</h3><div class="m">Completed document · Read only</div></div>'+M.px+'</div><div class="spb"><div class="dpaper sm"><h4>'+esc(d.name)+'</h4><div class="prow">Name <span class="fbox filled">'+esc(p.name)+'</span></div><div class="ln"></div><div class="ln"></div><div class="ln s"></div><div class="ln"></div><div class="prow"><span class="fbox filled" style="flex:3"><span class="script">'+esc(p.name)+'</span></span><span class="fbox filled">'+esc(x.on)+'</span></div></div><dl class="vrows"><div><dt>Signed by</dt><dd>'+esc(p.name)+'</dd></div><div><dt>When</dt><dd>'+esc(x.on)+", gym time ("+G.tz+')</dd></div><div><dt>Version</dt><dd>'+x.v+'</dd></div><div><dt>How</dt><dd>'+esc(how)+'</dd></div></dl></div><div class="spf"><button class="btn pri" data-act="pclose">Done</button><button class="btn" data-act="later" data-id="Downloading the signed PDF">Download PDF</button></div>';
  };
  M.panels.dadd=function(){
    var m=st.add, p=M.person(m.pid), c=live().filter(function(d){return p.dsig[d.id]&&p.dsig[d.id].s!=="signed"});
    return '<div class="sph"><div><h3>Add a signed copy</h3><div class="m">For paper, or anything '+esc(p.first)+' signed before Milton.</div></div>'+M.px+'</div><div class="spb"><div class="field"><label for="daDoc">Document</label><select id="daDoc">'+c.map(function(d){return '<option value="'+d.id+'">'+esc(d.name)+'</option>'}).join("")+'</select></div><div class="field"><label for="daDate">Date signed</label><input id="daDate" type="date" value="'+DB.TODAY+'" max="'+DB.TODAY+'"></div>'+(m.file?'<div class="setrow" style="margin:0"><div><b>'+esc(m.file)+'</b><div class="m">Ready to file</div></div></div>':'<div class="ddrop"><b>Add the scan or photo</b><div class="m">PDF or image, up to 10 MB</div><div class="acts" style="justify-content:center;margin-top:10px"><label class="btn hl" style="cursor:pointer">Choose a file<input type="file" accept="application/pdf,image/*" data-dfile="add" class="vh"></label><button class="btn" data-act="dafile">Use a sample scan</button></div></div>')+'<div class="m">It is saved as signed and marked "Paper copy on file" so nobody mistakes it for a signature collected in Milton.</div></div><div class="spf"><button class="btn pri" data-act="dasave"'+(m.file?"":" disabled")+'>Save signed copy</button><button class="btn" data-act="pclose">Cancel</button></div>';
  };

  /* ---------- what the rest of the platform shows ---------- */
  M.docs={
    refresh:refresh, state:function(p){ if(!p.dsig) p.dsig={}; return pstate(p)}, toSend:toSend,
    recordHTML:function(p){
      if(!p.dsig) p.dsig={}; refresh(); var rows=live().filter(function(d){return p.dsig[d.id]}), s=pstate(p), ts=toSend(p), out=outstanding(p);
      var h='<section class="card" id="recDocs"><div class="ch"><h3>Documents</h3><button class="link" data-act="zgo" data-id="crm:documents">All documents</button></div>';
      if(!rows.length) return h+'<div class="empty"><span>Nothing to sign yet. Documents come due when '+esc(p.first)+' books or buys.</span></div></section>';
      h+=s==="tosend"?'<div class="warnbox">'+M.plural(ts.length,"required document needs","required documents need")+" a signing request."+(soon(p)?" "+esc(ctx(p))+".":"")+'</div>':(s==="waiting"?'<div class="infobox">'+esc(p.first)+' has a link and has not signed yet.</div>':'<div class="infobox" style="background:var(--ok-soft);border-color:var(--ok-line);color:var(--ok)">Every required document is signed.</div>');
      if(noText(p)&&out.length) h+='<div class="m" style="margin-top:8px">'+esc(p.first)+' cannot be texted. Sign on this device or add a signed copy.</div>';
      rows.forEach(function(d){var x=p.dsig[d.id]; h+='<div class="row"><div class="what"><div class="t" style="font-weight:500">'+esc(d.name)+'</div><div class="m">'+d.type+" · "+(d.required?"Required":"Optional")+'</div><div class="m">'+esc(detail(p,d))+'</div>'+(x.s==="signed"?'<button class="link" style="margin-top:4px" data-act="dcopy" data-id="'+p.id+":"+d.id+'">View signed copy</button>':"")+'</div>'+pill(x.s)+'</div>'});
      return h+'<div class="acts" style="margin-top:12px"><button class="btn sm hl" data-act="dsendone" data-id="'+p.id+'"'+(out.length&&!noText(p)?"":" disabled")+'>'+(s==="waiting"?"Resend the link":"Send what's missing")+'</button><button class="btn sm" data-act="dsign" data-id="'+p.id+'"'+(out.length||optOpen(p).length?"":" disabled")+'>Sign on this device</button><button class="btn sm" data-act="dadd" data-id="'+p.id+'"'+(rows.some(function(d){return p.dsig[d.id].s!=="signed"})?"":" disabled")+'>Add a signed copy</button></div></section>';
    },
    html:function(){refresh(); return st.view==="doc"&&doc(st.did)?docHTML():(st.view==="wiz"&&st.wiz?wizHTML():homeHTML())},
    top:function(){return st.view==="wiz"?null:["dsendopen","Send for signature",st.view==="doc"?st.did:"all"]},
    brief:function(){
      refresh(); var L=listed(), ts=L.filter(function(p){return pstate(p)==="tosend"}), sn=ts.filter(soon), wt=L.filter(function(p){return pstate(p)==="waiting"}), hd;
      if(!ts.length&&!wt.length) hd="Every required document is signed."; else if(!ts.length) hd="Every request is out. "+M.plural(wt.length,"person has","people have")+" not signed yet."; else hd=M.plural(ts.length,"person needs","people need")+" a signing request."+(sn.length?" "+sn.length+" "+(sn.length===1?"is":"are")+" booked this week.":"");
      var items=sn.length?['<span class="k">Booked this week</span>'].concat(sn.map(function(p){return '<button class="link" data-act="record" data-id="'+p.id+'">'+esc(p.name)+'</button> '+esc(ctx(p))+". "+esc(joinAnd(toSend(p).map(function(d){return d.name})))+" not sent."})):[];
      wt.forEach(function(p){items.push('<button class="link" data-act="record" data-id="'+p.id+'">'+esc(p.name)+'</button> has a link and has not signed yet.')});
      return {hd:hd,items:items,hint:"Ask Milton about your documents",sugg:["Send what's missing to people booked this week","Who hasn't signed the Membership Agreement?","Add a new document"]};
    },
    ask:function(q){
      if(/booked this week/i.test(q)){var L=listed().filter(function(p){return soon(p)&&pstate(p)==="tosend"&&!noText(p)}); if(!L.length){M.say(q,"Nobody booked this week needs a signing request."); return true}
        st.ask=L.map(function(p){return p.id}); M.say(q,M.plural(L.length,"person","people")+" booked this week "+(L.length===1?"needs":"need")+" a request: "+joinAnd(L.map(function(p){return p.name+" ("+toSend(p).length+")"}))+". Want me to text each of them one link?",'<div class="acts" style="margin-top:8px"><button class="btn sm hl" data-act="dasksend">Send to '+L.length+'</button><button class="btn sm" data-act="daskreview">Review first</button></div>'); return true}
      if(/membership agreement/i.test(q)){var miss=ppl().filter(function(p){return p.dsig.agreement&&p.dsig.agreement.s!=="signed"}); st.view="doc"; st.did="agreement"; st.dt="signatures"; st.df="all"; M.go({page:"crm",tab:"documents"}); M.say(q,miss.length?M.plural(miss.length,"person","people")+": "+joinAnd(miss.map(function(p){return p.name}))+". The list is open on the right.":"Everyone who needs it has signed. The list is open on the right."); return true}
      if(/new document/i.test(q)){startWiz(null); M.go({page:"crm",tab:"documents"}); M.say(q,"Add the PDF on the right. I will name it from the file and find the fields."); return true}
      return false;
    }
  };

  var A=M.acts;
  function re(msg){M.render(); if(msg) M.toast(msg)}
  function target(){return st.view==="wiz"?st.wiz:doc(st.did)}
  function grabDoc(){var e=$("dName"), d=doc(st.did); if(e&&d&&e.value.trim()) d.name=e.value.trim(); e=$("dwName"); if(e&&st.wiz) st.wiz.name=e.value.trim()}
  A.dtoast=function(id){M.toast(id)};
  A.dhome=function(){grabDoc(); st.view="home"; st.wiz=null; M.go({page:"crm",tab:"documents"})};
  A.dseg=function(id){var a=id.split(":"); st.seg=a[0]; if(a[1]) st.pf=a[1]; M.render()};
  A.dpf=function(id){st.pf=id; st.sel={}; M.render()};
  A.dopen=function(id,el,e){var d=doc(id); if(d.status==="draft") startWiz(d); else {st.view="doc"; st.did=id; st.dt="signatures"; st.df="all"} M.render(); window.scrollTo(0,0)};
  A.ddt=function(id){grabDoc(); st.dt=id; M.render()};
  A.ddf=function(id){st.df=id; M.render()};
  A.dnew=function(){startWiz(null); M.render(); window.scrollTo(0,0)};
  A.dedit=function(id){startWiz(doc(id),2); M.render(); window.scrollTo(0,0); M.toast("Editing starts a draft. The live version stays until you publish.")};
  A.drule=function(id){grabDoc(); var o=target(), a=id.split(":"), v=a.slice(1).join(":"); if(a[0]==="kind"){o.rule.kind=v; o.touched=true} else if(a[0]==="item"){var i=o.rule.items.indexOf(v); if(i>-1) o.rule.items.splice(i,1); else o.rule.items.push(v)} else {o.required=!o.required; o.touched=true} if(st.view==="doc") refresh(); M.render()};
  A.dwfile=function(id){ if(id) setFile(id); else st.wiz.file=null; M.render()};
  A.dwtype=function(id){grabDoc(); var w=st.wiz; w.type=id; if(!w.touched){w.rule.kind=TYPES[id].kind; w.required=TYPES[id].required} M.render()};
  A.dwstep=function(id){grabDoc(); st.wiz.step=+id; M.render(); window.scrollTo(0,0)};
  A.dwnext=function(){grabDoc(); var w=st.wiz; if(w.step===1&&!w.name) return M.toast("Add a name."); w.step++; M.render(); window.scrollTo(0,0)};
  A.dwex=function(id){st.wiz.existing=id; M.render()};
  A.dwsave=function(id){
    grabDoc(); var w=st.wiz, d, was;
    if(id==="live"&&w.rule.kind==="specific"&&!w.rule.items.length) return M.toast("Pick at least one service or package, or choose another rule.");
    if(w.id){d=doc(w.id); was=d.status} else {d={id:"d"+Date.now(),version:1,pages:2,fields:11}; docs.push(d)}
    if(id==="draft"&&was==="live"){st.view="doc"; st.wiz=null; return re("Draft version "+(d.version+1)+" saved. The live version stays until you publish.")}
    d.name=w.name||"Untitled document"; d.type=w.type; d.rule={kind:w.rule.kind,items:w.rule.items.slice()}; d.required=w.required; d.valid=w.valid; d.file=w.file; d.status=id;
    if(id==="live"){ if(was==="live"){d.version++; d.hist=[[d.version,TODAYL,"Used for new requests only"]].concat(d.hist||[[d.version-1,d.published,"First version"]])} d.published=TODAYL; if(w.existing==="future"){d.skip={}; ppl().forEach(function(p){ if(qualifies(p,d)&&!p.dsig[d.id]) d.skip[p.id]=true })} }
    st.wiz=null; st.view="home"; st.seg="docs"; refresh(); re(id==="live"?"Published. No signing requests were sent.":"Draft saved. Nothing is live yet.");
  };
  /* sending */
  A.dsendopen=function(id){openSend({scope:id||"all"})};
  A.dsendone=function(id){var a=id.split(":"); openSend({scope:a[1]||"all",ids:[a[0]],step:2})};
  A.dsendp=A.dsendone;
  A.dsendsel=function(){openSend({scope:"all",ids:Object.keys(st.sel).filter(function(k){return st.sel[k]}),step:2})};
  A.dclearsel=function(){st.sel={}; M.render()};
  A.dsscope=function(id){var m=st.send; m.scope=id==="all"?"all":m.one; var ok={}; cands(m.scope).forEach(function(p){ if(m.sel[p.id]&&!noText(p)) ok[p.id]=true }); m.sel=ok; M.renderPanel()};
  A.dspick=function(id){var m=st.send, c=cands(m.scope).filter(function(p){return !noText(p)}); m.sel={}; c.forEach(function(p){ if(id==="need"?needsReq(p,m.scope):(id==="soon"?soon(p):(id==="wait"?!needsReq(p,m.scope):false))) m.sel[p.id]=true }); M.renderPanel()};
  A.dsstep=function(id){ if(+id===2&&!selIds().length) return; st.send.step=+id; M.renderPanel()};
  A.dsgo=function(){var ids=selIds(), nd=doSend(ids,st.send.scope); st.send=null; st.sel={}; M.closePanel(); re(ids.length===1?"Signing link texted to "+M.person(ids[0]).first+".":"Sent "+ids.length+" texts covering "+M.plural(nd,"document")+".")};
  A.dasksend=function(){var ids=st.ask||[], nd=doSend(ids,"all"); st.ask=null; M.chatLog.push({text:"Done. I texted "+M.plural(ids.length,"person","people")+" one link each, covering "+M.plural(nd,"document")+". They show under Waiting on them."}); M.render()};
  A.daskreview=function(){openSend({scope:"all",ids:st.ask||[],step:2})};
  /* signing */
  A.dpreview=function(id){var p=listed()[0]||M.people()[0]; openSign({mode:"preview",pid:"dana",did:id||null})};
  A.dsign=function(id){openSign({mode:"live",pid:id})};
  A.dmclose=function(){closeSign()};
  A.dmstart=function(){st.sign.i=0; drawSign()};
  A.dminit=function(){st.sign.inits++; drawSign()};
  A.dmuse=function(){st.sign.signed=true; drawSign()};
  function advance(){var m=st.sign; m.i++; m.inits=0; m.signed=false; drawSign()}
  A.dmsign=function(){var m=st.sign; if(!ready()) return; if(!m.sig) m.sig=m.typed.trim(); var id=m.ds[m.i]; m.done.push(id); if(m.mode==="live"){var p=M.person(m.pid); p.dsig[id]=sg(TODAYL,doc(id).version,"In person"); p.thread.push({k:"event",day:"Today",t:"just now",body:p.first+" signed "+doc(id).name+" on this device, with "+M.you().name+"."})} advance()};
  A.dmskip=function(){advance()};
  A.dmdone=function(){closeSign()};
  A.dcopy=function(id){var a=id.split(":"); st.copy={pid:a[0],did:a[1]}; M.openPanel("dcopy")};
  A.dadd=function(id){st.add={pid:id,file:null}; M.openPanel("dadd")};
  A.dafile=function(){st.add.file="Scanned form, Nov 20.pdf"; M.renderPanel()};
  A.dasave=function(){var m=st.add, p=M.person(m.pid), did=$("daDoc").value, d=doc(did), iso=$("daDate").value||DB.TODAY; p.dsig[did]=sg(M.fd(iso)+(iso.slice(0,4)==="2026"?", 2026":""),d.version,"Paper copy on file"); p.thread.push({k:"event",day:"Today",t:"just now",body:M.you().name+" added a paper copy of "+d.name+"."}); st.add=null; M.closePanel(); refresh(); re(d.name+" saved as signed. Marked Paper copy on file.")};

  M.changes.push(function(el){
    var d=el.dataset||{};
    if(d.dsel){st.sel[d.dsel]=el.checked; if($("dbulk")) $("dbulk").innerHTML=bulk(); return}
    if(d.dsend){st.send.sel[d.dsend]=el.checked; var n=selIds().length, b=$("dsgo"); b.disabled=!n; b.textContent="Review "+M.plural(n,"person","people"); return}
    if(d.dsone){st.send.one=el.value; st.send.scope=el.value; var ok={}; cands(el.value).forEach(function(p){ if(st.send.sel[p.id]&&!noText(p)) ok[p.id]=true }); st.send.sel=ok; return M.renderPanel()}
    if(d.dvalid){target().valid=el.value; return}
    if(d.dtype){grabDoc(); doc(st.did).type=el.value; return M.render()}
    if(d.dfile&&el.files&&el.files[0]){ if(d.dfile==="wiz"){setFile(el.files[0].name); M.render()} else {st.add.file=el.files[0].name; M.renderPanel()} }
  });
  M.inputs.push(function(el){
    if(el.id==="dq"&&$("drows")){st.q=el.value; $("drows").innerHTML=peopleRows(); return}
    if(el.id==="dsq"){st.send.q=el.value; $("dsrows").innerHTML=sendRows(); return}
    if(el.id==="dSig"&&st.sign){st.sign.typed=el.value; var pv=$("dSigPrev"); pv.className="sigbox"+(el.value?" done":""); pv.innerHTML=el.value?'<span class="script">'+esc(el.value)+'</span>':"Your signature shows here"; $("dmSign").disabled=!ready()}
  });
  document.addEventListener("keydown",function(e){ if(e.key==="Escape"&&st.sign) closeSign() });
  refresh();
})();
