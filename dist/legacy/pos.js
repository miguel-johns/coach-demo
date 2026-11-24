/* One-Screen POS: catalog on the left, one ticket on the right, no pop-ups.
   Follows the One-Screen POS design and spec. Opens as a takeover and closes back to where you were. */
(function(){
  var esc=M.esc, money=M.fm, fd=M.fd, TODAY=DB.TODAY, root=document.getElementById("takeover");
  var ITEMS=DB.ITEMS, TABS=["All"].concat(ITEMS.map(function(i){return i.svc}).filter(function(v,i,a){return a.indexOf(v)===i}));
  var S, O={};
  function fresh(){return {tab:"All",q:"",cart:{},cust:null,custQ:"",adding:false,newName:"",view:"ticket",tipMode:"none",tipCustom:"",promoOpen:false,promo:false,promoErr:"",newCard:false,busy:false,paid:null,when:"now",laterDate:"",extra:null}}
  function q(s){return root.querySelector(s)}
  function item(id){ if(S.extra&&S.extra.id===id) return S.extra; return ITEMS.filter(function(i){return i.id===id})[0] }
  function cust(){return S.cust?M.person(S.cust):null}
  function cartIds(){return Object.keys(S.cart)}
  function isPkg(it){return it.kind==="pack"||it.kind==="membership"}
  function pkgIds(){return cartIds().filter(function(id){return isPkg(item(id))})}
  function later(){return S.when==="later"&&pkgIds().length>0}
  function laterOk(){return !!S.laterDate&&S.laterDate>TODAY}
  function label(it){return /^(\d+-pack|Drop-in)$/.test(it.name)?it.svc+" "+it.name:it.name}
  function startedMsg(){var ids=pkgIds(); return (ids.length===1?label(item(ids[0])):ids.length+" packages")+" started. First charge "+fd(S.laterDate)+"."}
  function totals(){
    var sub=0,subNow=0,subLater=0,tipBase=0,renew=[],L=later(),promoBase=0;
    cartIds().forEach(function(id){
      var it=item(id),n=S.cart[id],amt=it.price*n; sub+=amt;
      if(L&&isPkg(it)) subLater+=amt; else subNow+=amt;
      if(it.tip) tipBase+=amt;
      if(it.kind!=="product") promoBase+=amt;
      if(it.kind==="membership") renew.push(money(it.price)+" every "+it.per);
    });
    if(L) tipBase=0;
    var rate=S.promo?0.10:0, tip=0;
    if(tipBase>0){ if(typeof S.tipMode==="number") tip=tipBase*S.tipMode/100; else if(S.tipMode==="custom") tip=Math.max(0,parseFloat(S.tipCustom)||0) }
    var discNow=cartIds().reduce(function(t,id){var it=item(id); return t+((it.kind!=="product"&&!(L&&isPkg(it)))?it.price*S.cart[id]*rate:0)},0);
    return {sub:sub,disc:promoBase*rate,tip:tip,tipBase:tipBase,total:subNow-discNow+tip,laterAmt:subLater*(1-rate),later:L,renew:renew};
  }
  function tabsHTML(){return TABS.map(function(s){return '<button class="tab" role="tab" data-pa="tab" data-v="'+esc(s)+'" aria-selected="'+(S.tab===s)+'">'+esc(s)+'</button>'}).join("")}
  function gridHTML(){
    var qq=S.q.trim().toLowerCase();
    var list=ITEMS.filter(function(it){return !it.hidden&&it.status!=="Draft"&&it.status!=="Archived"&&(S.tab==="All"||it.svc===S.tab)&&(!qq||(it.name+" "+it.svc).toLowerCase().indexOf(qq)>=0)});
    if(!list.length) return '<p class="m" style="padding:24px 4px">Nothing matches that search.</p>';
    return list.map(function(it){
      var n=S.cart[it.id]||0, sub=it.sub;
      if(it.stock!=null) sub='<span class="'+(it.stock<=5?"low":"")+'">'+it.stock+' left</span>';
      return '<button class="tile'+(n?" on":"")+'" data-pa="add" data-v="'+it.id+'">'+(n?'<span class="qty num">'+n+'</span>':"")+'<span class="svc">'+esc(it.svc)+'</span><span class="name">'+esc(it.name)+'</span>'+(sub?'<span class="sub2">'+sub+'</span>':"")+'<span class="price num">'+money(it.price)+(it.per?" <small>/ "+it.per+"</small>":"")+'</span></button>';
    }).join("");
  }
  function custBlock(){
    var c=cust();
    if(c){
      var bits=c.plans.filter(function(p){return !p.unlimited}).map(function(p){return p.open+" "+p.service.toLowerCase()+" left to book"});
      if(c.card) bits.push(c.card+" on file");
      if(!bits.length) bits.push("No active packages");
      return '<div class="cust"><span class="av">'+c.initials+'</span><div class="who"><b>'+esc(c.name)+'</b><span>'+esc(bits.join(" · "))+'</span></div>'+(S.view==="ticket"?'<button class="link" data-pa="changeCust">Change</button>':"")+'</div>';
    }
    if(S.adding) return '<div style="display:grid;gap:8px"><div class="k">New customer</div><input class="pfield" id="newName" placeholder="Full name" value="'+esc(S.newName)+'" autocomplete="off"><input class="pfield" id="newPhone" placeholder="Mobile number" inputmode="tel" autocomplete="off"><div class="pay"><button class="pbtn" data-pa="cancelNew">Cancel</button><button class="pbtn primary" data-pa="saveNew">Add and select</button></div><p class="perr" id="newErr" hidden>Enter a name to add this customer.</p></div>';
    return '<div class="k">Customer</div><input class="pfield" id="custSearch" type="search" placeholder="Name, email or phone" value="'+esc(S.custQ)+'" autocomplete="off"><div id="custResults">'+custResults()+'</div>';
  }
  function custResults(){
    var qq=S.custQ.trim().toLowerCase(); if(!qq) return "";
    var hits=M.people().filter(function(c){return (c.name+" "+c.email+" "+c.phone).toLowerCase().indexOf(qq)>=0}).slice(0,4);
    return '<div class="results">'+hits.map(function(c){return '<button class="res" data-pa="pickCust" data-v="'+c.id+'"><b>'+esc(c.name)+'</b><span>'+esc(c.email||c.phone||M.status(c))+'</span></button>'}).join("")+'<button class="res new" data-pa="startNew"><b>Add "'+esc(S.custQ.trim())+'" as a new customer</b><span>Name and mobile number, nothing else</span></button></div>';
  }
  function linesBlock(edit){
    var ids=cartIds(), c=cust();
    if(!ids.length) return '<div class="blank">Tap an item to start the sale.</div>';
    return '<div>'+ids.map(function(id){
      var it=item(id), n=S.cart[id], note="";
      if(c&&it.kind==="pack") c.plans.forEach(function(p){ if(p.service===it.svc&&!p.unlimited&&p.open>0) note='<div class="pnote">'+esc(c.first)+" has "+M.plural(p.open,it.svc.toLowerCase()+" credit")+' left to book.</div>' });
      return '<div class="line"><div><div class="n">'+esc(it.name)+'</div><div class="s">'+esc(it.svc)+(it.per?" · renews every "+it.per:"")+'</div></div>'+(edit&&it.kind!=="session"?'<div class="step"><button data-pa="dec" data-v="'+id+'" aria-label="Remove one '+esc(it.name)+'">&minus;</button><span class="num">'+n+'</span><button data-pa="inc" data-v="'+id+'" aria-label="Add one '+esc(it.name)+'">+</button></div>':(edit?'<button class="link" data-pa="dec" data-v="'+id+'">Remove</button>':'<div class="s num">x'+n+'</div>'))+'<div class="p num">'+money(it.price*n)+'</div>'+note+'</div>';
    }).join("")+'</div>';
  }
  function extrasBlock(t){
    if(!cartIds().length) return "";
    var h="";
    if(t.tipBase>0) h+='<div><div class="k" style="margin-bottom:6px">Tip</div><div class="prow">'+[["none","None"],[15,"15%"],[20,"20%"],[25,"25%"],["custom","Custom"]].map(function(o){return '<button class="pill'+(S.tipMode===o[0]?" on":"")+'" data-pa="tip" data-v="'+o[0]+'">'+o[1]+'</button>'}).join("")+(S.tipMode==="custom"?'<input class="mini num" id="tipCustom" inputmode="decimal" placeholder="$0.00" value="'+esc(S.tipCustom)+'">':"")+'</div></div>';
    if(S.promo) h+='<div class="prow"><span class="pill on">WELCOME10 applied</span><button class="link" data-pa="promoRemove">Remove</button></div>';
    else if(S.promoOpen) h+='<div><div class="prow"><input class="pfield" id="promoCode" style="height:38px;width:170px" placeholder="Try WELCOME10" autocomplete="off"><button class="pill" data-pa="promoApply">Apply</button><button class="link" data-pa="promoClose">Cancel</button></div>'+(S.promoErr?'<div class="perr">'+esc(S.promoErr)+'</div>':"")+'</div>';
    else h+='<button class="link" data-pa="promoOpen" style="align-self:flex-start">Add promo code</button>';
    return h+whenBlock(t);
  }
  function whenBlock(t){
    var n=pkgIds().length; if(!n) return "";
    var c=cust(), L=S.when==="later";
    var h='<div style="display:grid;gap:8px"><div class="k">When to charge</div><div class="pseg" role="group" aria-label="When to charge"><button data-pa="when" data-v="now" aria-pressed="'+(!L)+'">Charge now</button><button data-pa="when" data-v="later" aria-pressed="'+L+'">Charge on a later date</button></div>';
    if(L){
      h+='<label class="m" for="laterDate">First charge</label><input class="pfield" id="laterDate" type="date" min="'+M.addDays(TODAY,1)+'" value="'+esc(S.laterDate)+'"><div class="prow"><button class="pill" data-pa="addWeeks" data-v="1">Add 1 week</button><button class="pill" data-pa="addWeeks" data-v="2">Add 2 weeks</button></div>'+(laterOk()?"":'<div class="perr">Pick a first charge date after today.</div>');
      if(c&&laterOk()) h+=c.card?'<div class="t">Charges '+esc(c.card)+" on "+fd(S.laterDate)+'</div>':'<div class="warnbox">No card on file. Add one before starting.<div style="margin-top:8px"><button class="btn sm" data-pa="addCard">Add card</button></div></div>';
      h+='<div class="warnbox">'+(n===1?"The package starts today.":"The packages start today.")+' Sessions can be used before the first charge.</div><p class="m" style="margin:0">'+(t.total>0?"Only the products are charged today. If the first charge fails, it follows your failed renewal setting.":"Nothing is charged today. If the charge fails, it follows your failed renewal setting.")+'</p>';
    }
    return h+'</div>';
  }
  function sumBlock(t){
    var r="";
    if(t.disc>0||t.tip>0) r+='<div><span>Subtotal</span><span class="num">'+money(t.sub)+'</span></div>';
    if(t.disc>0) r+='<div><span>Promo WELCOME10</span><span class="num">&minus;'+money(t.disc)+'</span></div>';
    if(t.tip>0) r+='<div><span>Tip</span><span class="num">'+money(t.tip)+'</span></div>';
    r+='<div class="total"><span>Due today</span><span class="num">'+money(t.total)+'</span></div>';
    if(t.later&&laterOk()) r+='<div class="firstc"><span>First charge '+fd(S.laterDate)+'</span><span class="num">'+money(t.laterAmt)+'</span></div>';
    if(t.renew.length) r+='<div><span>Then '+esc(t.renew.join(", "))+'</span></div>';
    return '<div class="sum">'+r+'</div>';
  }
  function tenderOptions(total){var out=[],seen={}; [5,10,20,50,100].forEach(function(step){var v=Math.ceil(total/step)*step; if(v>total+0.001&&!seen[v]&&out.length<3){seen[v]=1;out.push(v)}}); return out}
  function footBlock(t){
    var c=cust(), has=cartIds().length>0, ready=has&&!!c;
    if(S.view==="ticket"){
      var hint=ready?"":(!has&&!c?"Add an item and a customer to take payment.":!has?"Add an item to take payment.":"Pick a customer so this lands in their purchase history."), dis=ready?"":" disabled";
      if(t.later){
        var okL=ready&&!!c.card&&laterOk(), hintL=!c?"Pick a customer to start the package.":(!laterOk()?"Pick a first charge date after today.":(!c.card?"Add a card on file to start.":"")), disL=okL?"":" disabled";
        if(t.total>0) return sumBlock(t)+'<div class="pay"><button class="pbtn primary" data-pa="pay" data-v="card"'+disL+'>Card</button><button class="pbtn primary" data-pa="pay" data-v="cash"'+disL+'>Cash</button><button class="pbtn wide" data-pa="pay" data-v="check"'+disL+'>Check</button></div><p class="hint">'+(hintL||"Takes "+money(t.total)+" today for the products and starts the package.")+'</p>';
        return sumBlock(t)+'<button class="pbtn primary wide" data-pa="startLater"'+disL+'>Start now, charge '+(laterOk()?fd(S.laterDate):"later")+'</button>'+(hintL?'<p class="hint">'+hintL+'</p>':"");
      }
      if(ready&&t.total===0) return sumBlock(t)+'<button class="pbtn primary wide" data-pa="free">Complete, nothing to pay</button><p class="hint">A free item skips payment and still lands in their purchase history.</p>';
      var nomob=c&&!c.phone;
      return sumBlock(t)+'<div class="pay"><button class="pbtn primary" data-pa="pay" data-v="card"'+dis+'>Card</button><button class="pbtn primary" data-pa="pay" data-v="cash"'+dis+'>Cash</button><button class="pbtn" data-pa="pay" data-v="check"'+dis+'>Check</button><button class="pbtn" data-pa="pay" data-v="link"'+(ready&&!nomob?"":" disabled")+'>Text a link</button></div>'+(hint?'<p class="hint">'+hint+'</p>':(nomob?'<p class="hint">No mobile number on file, so a link cannot be texted.</p>':""));
    }
    var back='<button class="link" data-pa="back" style="align-self:flex-start">Back to sale</button>';
    if(S.view==="cash") return sumBlock(t)+'<div class="k">Cash received</div><div class="tender"><button class="pbtn primary" data-pa="tender" data-v="'+t.total+'">Exact<small class="num">'+money(t.total)+'</small></button>'+tenderOptions(t.total).map(function(v){return '<button class="pbtn" data-pa="tender" data-v="'+v+'"><span class="num">'+money(v)+'</span><small class="num">Change '+money(v-t.total)+'</small></button>'}).join("")+'</div><div class="prow"><input class="pfield num" id="cashOther" style="flex:1;min-width:0" inputmode="decimal" placeholder="Other amount"><button class="pbtn" data-pa="tenderOther" style="height:46px">Record</button></div><p class="perr" id="cashErr" hidden>That is less than the '+money(t.total)+' due.</p>'+back;
    if(S.view==="card"){
      var h=sumBlock(t), locked=cartIds().some(function(id){return item(id).kind==="membership"});
      if(c.card&&!S.newCard) h+='<button class="pbtn primary wide" data-pa="charge"'+(S.busy?" disabled":"")+'>'+(S.busy?"Charging...":"Charge "+esc(c.card)+' · <span class="num">'+money(t.total)+'</span>')+'</button><button class="link" data-pa="newCard" style="align-self:center">Use a different card</button>';
      else h+='<div class="cardmock"><input class="pfield" readonly tabindex="-1" value="Card number" aria-label="Card number placeholder"><div class="row3"><input class="pfield" readonly tabindex="-1" value="MM / YY" aria-label="Expiry placeholder"><input class="pfield" readonly tabindex="-1" value="CVC" aria-label="CVC placeholder"><input class="pfield" readonly tabindex="-1" value="ZIP" aria-label="ZIP placeholder"></div><label class="m" style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="saveCard" checked'+(locked?" disabled":"")+'> Save this card for next time'+(locked?". Needed for the renewal.":"")+'</label><p>The card form from the payment processor sits here, inside the sale. Card only at the desk. Apple Pay and Link stay on texted links.</p></div><button class="pbtn primary wide" data-pa="charge"'+(S.busy?" disabled":"")+'>'+(S.busy?"Charging...":'Charge <span class="num">'+money(t.total)+'</span>')+'</button>';
      return h+back;
    }
    if(S.view==="check") return sumBlock(t)+'<input class="pfield" id="checkNo" inputmode="numeric" placeholder="Check number (optional)" autocomplete="off"><button class="pbtn primary wide" data-pa="recordCheck">Record check · <span class="num">'+money(t.total)+'</span></button>'+back;
    if(S.view==="link") return sumBlock(t)+'<button class="pbtn primary wide" data-pa="sendLink">Text link to '+esc(c.phone)+'</button><p class="hint">'+esc(c.first)+' pays on their phone. Their items unlock when the payment clears.</p>'+back;
    return "";
  }
  function doneBlock(){
    var p=S.paid, pending=p.method==="link";
    return '<div class="done'+(pending?" pending":"")+'" role="status"><div class="tick">'+(pending?'<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 3L10 14M21 3l-7 18-4-7-7-4 18-7z"/></svg>':'<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>')+'</div><h2>'+(pending?"Link sent":"Paid")+'</h2><div class="bigp num">'+money(p.total)+'</div><p>'+esc(p.detail)+'</p>'+(p.change>0?'<div class="change num">Change due '+money(p.change)+'</div>':"")+(p.laterLine?'<div class="warnbox" style="text-align:left">'+esc(p.laterLine)+' Not paid yet.</div>':"")+(p.extra?'<p>'+esc(p.extra)+'</p>':"")+'<p>'+(pending?"Waiting on "+esc(p.first)+". You can start the next sale now.":"Saved to "+esc(p.first)+"'s purchase history.")+'</p><button class="pbtn primary" data-pa="newSale" id="newSaleBtn">New sale</button>'+(pending||!p.phone?"":'<button class="link" data-pa="receipt">Text receipt to '+esc(p.first)+'</button>')+'</div>';
  }
  function renderRail(focusId){
    var rail=q("#rail");
    if(S.view==="done"){rail.innerHTML=doneBlock(); var b=q("#newSaleBtn"); if(b) b.focus(); return}
    var t=totals(), ed=S.view==="ticket";
    rail.innerHTML='<div class="rail-scroll">'+custBlock()+linesBlock(ed)+(ed?extrasBlock(t):"")+'</div><div class="rail-foot">'+footBlock(t)+'</div>';
    if(focusId){var el=document.getElementById(focusId); if(el) el.focus()}
  }
  function renderAll(f){q("#ptabs").innerHTML=tabsHTML(); q("#pgrid").innerHTML=gridHTML(); renderRail(f)}

  /* what a completed sale does to the person's record */
  function grant(c,method,t,isLater){
    var names=[];
    cartIds().forEach(function(id){
      var it=item(id), n=S.cart[id], nm=label(it); names.push(nm);
      if(it.stock!=null) it.stock=Math.max(0,it.stock-n);
      if(it.kind==="session"){O.appt.paid=true; if(method!=="link") c.tx.unshift(["Nov 20",it.name,method,money(it.price)]); return}
      var lat=isLater&&isPkg(it);
      if(method!=="link"&&!lat) c.tx.unshift(["Nov 20",nm,method,money(it.price*n*(S.promo&&it.kind!=="product"?0.9:1))]);
      if(!isPkg(it)||method==="link") return;
      var pl=c.plans.filter(function(p){return p.name.toLowerCase()===nm.toLowerCase()})[0];
      if(pl&&it.kind==="pack"){ if(pl.open===0&&pl.booked===0){pl.open=it.size*n; pl.used=0} else pl.open+=it.size*n; pl.when="Bought Nov 20"; pl.queued=false }
      else if(!pl){
        pl={id:"p"+Date.now()+id,name:nm,kind:it.kind==="pack"?"Pack":(it.svc==="Nutrition"?"Subscription":"Membership"),service:it.svc,price:money(it.price)+(it.per?" a "+it.per:""),amt:it.price,booked:0,used:0};
        if(it.unlimited) pl.unlimited=true; else {pl.open=it.size*n; pl.size=it.size}
        if(it.kind==="membership"){pl.start=TODAY; pl.next=lat?S.laterDate:"2026-12-20"; pl.dates=true} else pl.when=lat?"Started Nov 20":"Bought Nov 20";
        if(lat){pl.first=true; pl.next=S.laterDate}
        c.plans.push(pl);
      }
      /* a credit that arrives covers a session that was waiting on payment */
      c.appts.forEach(function(a){ if(a.due&&!a.paid&&!a.plan&&a.title.toLowerCase().indexOf(it.svc.toLowerCase().split(" ")[0])===0&&(pl.unlimited||pl.open>0)){a.plan=pl.id; delete a.due; if(!pl.unlimited){pl.open--; pl.booked++}} });
    });
    if(!c.since&&method!=="link") c.since="Nov 20";
    if(c.stage&&method!=="link") c.stage=cartIds().some(function(id){return item(id).kind==="membership"})?"Joined":(c.stage==="Joined"?"Joined":"Came in");
    return names;
  }
  function finish(method,detail,change){
    var t=totals(), c=cust(), mlabel=method==="card"?((c.card&&!S.newCard)?c.card:"Visa ending 4242"):(method==="cash"?"Cash":(method==="check"?detail:(method==="free"?"No payment required":"link")));
    if(method==="card"&&(!c.card||S.newCard)){var sv=q("#saveCard"); if(!sv||sv.checked) c.card="Visa ending 4242"}
    var names=grant(c,method==="link"?"link":mlabel,t,t.later), extra="";
    if(method==="link") c.links.push({id:"l"+Date.now(),text:names.join(", ")+", "+money(t.total),meta:"Payment link sent today. Not paid yet. Expires Mon, Nov 23."});
    c.thread.push({k:"event",day:"Today",t:"just now",body:method==="link"?"Payment link sent: "+names.join(", ")+", "+money(t.total):M.you().name+" took payment: "+names.join(", ")+", "+money(t.total)+(t.tip>0?" including a "+money(t.tip)+" tip":"")+". "+mlabel+"."});
    if(O.appt&&O.checkout&&method!=="link"&&O.appt.status==="in"){M.sess.set(c,O.appt,"out"); extra="Checked out."}
    S.paid={method:method,total:t.total,detail:detail,change:change||0,first:c.first,phone:c.phone,laterLine:t.later?startedMsg():"",extra:extra};
    if(t.later){c.thread.push({k:"event",day:"Today",t:"just now",body:M.you().name+" started a package. First charge set for "+fd(S.laterDate)+"."}); M.toast(S.paid.laterLine)}
    S.view="done"; S.busy=false; renderAll();
  }
  function open(o){
    O=o||{}; S=fresh();
    if(O.cust) S.cust=O.cust;
    if(O.appt){S.extra={id:"appt",svc:O.appt.day+" · "+O.appt.time,name:O.appt.title,price:O.appt.due,kind:"session",tip:/Massage|Personal/.test(O.appt.title)}; S.cart.appt=1}
    if(O.item) S.cart[O.item]=1;
    if(O.renew){var it=ITEMS.filter(function(i){return label(i).toLowerCase()===O.renew.name.toLowerCase()})[0]; if(it) S.cart[it.id]=1}
    root.innerHTML='<div class="pos"><header class="ptop"><button class="ico" data-pa="close" aria-label="Close the POS and go back to where you were">&#10005;</button><h1>Point of sale</h1></header><div class="pmain"><section class="catalog" aria-label="Catalog"><input class="isearch" id="itemSearch" type="search" placeholder="Search services, packages or products" autocomplete="off"><div class="tabs" id="ptabs" role="tablist"></div><div class="pgrid" id="pgrid"></div></section><aside class="rail" id="rail" aria-label="Current sale"></aside></div></div>';
    root.hidden=false; renderAll(S.cust?null:"custSearch");
  }
  function close(){var f=O&&O.after; root.hidden=true; root.innerHTML=""; M.render(); if(f) f()}
  M.pos={open:open,close:close,isOpen:function(){return !root.hidden}};

  root.addEventListener("click",function(e){
    var b=e.target.closest("[data-pa]"); if(!b||b.disabled) return;
    var a=b.getAttribute("data-pa"), v=b.getAttribute("data-v"), t, c=cust(), it, n;
    if(a==="close") return close();
    if(S.view==="done"&&a!=="newSale"&&a!=="receipt"){O={}; S=fresh()}
    switch(a){
      case "tab": S.tab=v; q("#ptabs").innerHTML=tabsHTML(); q("#pgrid").innerHTML=gridHTML(); return;
      case "add": S.view="ticket"; it=item(v); n=S.cart[v]||0; if(it.kind==="membership"&&n>=1) return; if(it.stock!=null&&n>=it.stock) return; S.cart[v]=n+1; q("#pgrid").innerHTML=gridHTML(); renderRail(); return;
      case "inc": it=item(v); if(it.kind==="membership") return; if(it.stock!=null&&S.cart[v]>=it.stock) return; S.cart[v]++; q("#pgrid").innerHTML=gridHTML(); renderRail(); return;
      case "dec": S.cart[v]--; if(S.cart[v]<=0){delete S.cart[v]; if(v==="appt"){S.extra=null; O.appt=null}} if(!pkgIds().length) S.when="now"; if(!totals().tipBase){S.tipMode="none"; S.tipCustom=""} q("#pgrid").innerHTML=gridHTML(); renderRail(); return;
      case "when": S.when=v; if(v==="later"){ if(!S.laterDate) S.laterDate=M.addDays(TODAY,14); S.tipMode="none"; S.tipCustom=""} renderRail(); return;
      case "addWeeks": S.laterDate=M.addDays(laterOk()?S.laterDate:TODAY,7*parseInt(v,10)); renderRail(); return;
      case "addCard": M.openPanel("poscard"); return;
      case "startLater": if(!(c&&c.card&&laterOk()&&later())) return; var msg=startedMsg(); grant(c,"later",totals(),true); c.thread.push({k:"event",day:"Today",t:"just now",body:M.you().name+" started a package. First charge set for "+fd(S.laterDate)+"."}); O={}; S=fresh(); renderAll("custSearch"); M.toast(msg); return;
      case "pickCust": S.cust=v; S.custQ=""; renderRail(); return;
      case "changeCust": S.cust=null; S.custQ=""; renderRail("custSearch"); return;
      case "startNew": S.adding=true; S.newName=S.custQ.trim(); renderRail("newPhone"); return;
      case "cancelNew": S.adding=false; renderRail("custSearch"); return;
      case "saveNew":
        var nm=q("#newName").value.trim(), ph=q("#newPhone").value.trim();
        if(!nm){q("#newErr").hidden=false; q("#newName").focus(); return}
        var id="n"+Date.now(); DB.people.unshift({id:id,name:nm,phone:ph,email:"",source:"Front desk",added:TODAY,stage:"New"});
        S.cust=id; S.adding=false; S.custQ=""; renderRail(); return;
      case "tip": S.tipMode=(v==="none"||v==="custom")?v:parseInt(v,10); renderRail(S.tipMode==="custom"?"tipCustom":null); return;
      case "promoOpen": S.promoOpen=true; S.promoErr=""; renderRail("promoCode"); return;
      case "promoClose": S.promoOpen=false; S.promoErr=""; renderRail(); return;
      case "promoRemove": S.promo=false; renderRail(); return;
      case "promoApply": var code=q("#promoCode").value.trim().toUpperCase(); if(code==="WELCOME10"){S.promo=true; S.promoOpen=false; S.promoErr=""; renderRail()} else {S.promoErr=code?"That code is not live. Check the spelling.":"Enter a code first."; renderRail("promoCode")} return;
      case "pay": S.view=v; S.newCard=false; renderRail(v==="check"?"checkNo":null); return;
      case "back": S.view="ticket"; S.busy=false; renderRail(); return;
      case "free": finish("free","No payment required"); return;
      case "tender": t=totals(); var got=parseFloat(v); finish("cash",got>t.total+0.001?"Cash, "+money(got)+" received":"Cash, exact amount",got-t.total); return;
      case "tenderOther": t=totals(); var amt=parseFloat(q("#cashOther").value); if(!(amt>=t.total-0.001)){q("#cashErr").hidden=false; q("#cashOther").focus(); return} finish("cash","Cash, "+money(amt)+" received",amt-t.total); return;
      case "newCard": S.newCard=true; renderRail(); return;
      case "charge": var lb=(c.card&&!S.newCard)?c.card:"Visa ending 4242"; S.busy=true; renderRail(); setTimeout(function(){ if(S.busy&&S.view==="card") finish("card",lb) },700); return;
      case "recordCheck": var no=q("#checkNo").value.trim(); finish("check",no?"Check #"+no:"Check"); return;
      case "sendLink": finish("link","Payment link texted to "+c.phone); return;
      case "receipt": b.textContent="Receipt texted. Prototype only."; b.disabled=true; return;
      case "newSale": O={}; S=fresh(); renderAll("custSearch"); return;
    }
  });
  root.addEventListener("input",function(e){
    var id=e.target.id;
    if(id==="itemSearch"){S.q=e.target.value; q("#pgrid").innerHTML=gridHTML()}
    else if(id==="custSearch"){S.custQ=e.target.value; q("#custResults").innerHTML=custResults()}
    else if(id==="newName") S.newName=e.target.value;
    else if(id==="tipCustom"){S.tipCustom=e.target.value; q(".rail-foot").innerHTML=footBlock(totals())}
  });
  root.addEventListener("change",function(e){ if(e.target.id==="laterDate"){S.laterDate=e.target.value; renderRail()} });
  root.addEventListener("keydown",function(e){
    if(e.key!=="Enter") return;
    var id=e.target.id, btn=null;
    if(id==="custSearch"&&S.custQ.trim()) btn=q("#custResults [data-pa]");
    else if(id==="newName"||id==="newPhone") btn=q('[data-pa="saveNew"]');
    else if(id==="promoCode") btn=q('[data-pa="promoApply"]');
    else if(id==="cashOther") btn=q('[data-pa="tenderOther"]');
    else if(id==="checkNo") btn=q('[data-pa="recordCheck"]');
    if(btn){e.preventDefault(); btn.click()}
  });
  /* the Card on file panel is the same one the Contact Record uses */
  M.panels.poscard=function(){
    var c=cust();
    return '<div class="sph"><div><h3>Card on file</h3><div class="m">'+(c.card?"Now: "+esc(c.card):"No card yet")+'</div></div>'+M.px+'</div><div class="spb"><div class="k">Enter it now</div><div class="stripe">The secure card form from the payment processor goes here. Milton never sees or stores the card number.</div><div class="k" style="margin-top:8px">Or let them do it</div><button class="opt" data-act="poscardlink"><b>Text a link to add the card</b><span class="m">They enter it on their own phone. Nothing is charged.</span></button><div class="m">Saving a card charges nothing. '+(laterOk()?"It is used for the first charge on "+fd(S.laterDate)+".":"It is used the next time something is charged.")+'</div></div><div class="spf"><button class="btn pri" data-act="poscardsave">Save card</button><button class="btn" data-act="pclose">Cancel</button></div>';
  };
  M.acts.poscardsave=function(){var c=cust(); c.card="Visa ending 2204"; M.closePanel(); renderRail(); M.toast(c.card+" saved. Nothing was charged.")};
  M.acts.poscardlink=function(){M.closePanel(); M.toast("Link texted to "+cust().phone+". Prototype only, nothing was sent.")};
  M.acts.pos=function(){open({})};
})();
