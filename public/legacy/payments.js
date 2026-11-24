/* Payments: four tabs (Overview, Reports, Subscriptions, Setup). Follows the Payments Four Tabs spec.
   Everything opens in place: details, refunds, reasons, the date range, filters and the promo code editor. */
(function(){
  var esc=M.esc, $=M.$, TODAY=DB.TODAY, MON=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  function usd(n){var s=M.fm(Math.abs(n)); return n<0?"-"+s:s}
  function neg(n){return n?'<span class="neg">('+usd(n)+')</span>':'<span class="mut">$0.00</span>'}
  function z(n){return n?usd(n):'<span class="mut">$0.00</span>'}
  function sd(iso){var a=iso.split("-"); return MON[+a[1]-1]+" "+(+a[2])}
  function ld(iso){return sd(iso)+", "+iso.slice(0,4)}
  function sum(a,k){return a.reduce(function(s,x){return s+(x.fail?0:x[k])},0)}
  function r2(n){return Math.round(n*100)/100}

  /* the ledger behind Reports. Rows match what each person's record shows under Payments. */
  var seq=0;
  function row(iso,pid,item,tm,sold,src,price,disc,tip,tax,cred,meth,x){
    var t={id:"t"+(++seq),iso:iso,pid:pid,item:item,tm:tm||"",sold:sold||"",src:src,price:price,disc:disc,tip:tip,tax:tax,cred:cred,meth:meth,status:"Paid",refunded:0};
    if(x) Object.keys(x).forEach(function(k){t[k]=x[k]});
    t.paid=r2(price-disc+tip+tax-cred); return t;
  }
  /* The ledger lives on DB so Milton's tools and this screen read the same rows. */
  var T=DB.tx=[
    row("2026-11-20","chris","Northline tee","","Miguel Johns","Front desk",25,0,0,1.88,0,"Card"),
    row("2026-11-19","chris","Energy drink","","Riley Chen","Front desk",3,0,0,0.23,0,"Cash"),
    row("2026-11-18","leah","Nutrition Coaching","","","Renewal",39.99,0,0,0,0,"Card",{fail:true,status:"Failed"}),
    row("2026-11-18","devon","Protein bar","","Riley Chen","Front desk",3,0,0,0.23,0,"Cash"),
    row("2026-11-17","devon","Personal training, 60 min","Andre Lewis","","App",70,0,10,0,70,"Card"),
    row("2026-11-16","dana","Semi-private training","Tori Lane","","App",56.13,0,0,0,56.13,"Credit"),
    row("2026-11-13","leah","Semi-private training","Tori Lane","","App",56.13,0,0,0,56.13,"Credit"),
    row("2026-11-12","marcus","Day Pass","","Riley Chen","Front desk",15,0,0,0,0,"Cash"),
    row("2026-11-12","devon","Personal training, 60 min","Andre Lewis","","App",70,0,0,0,70,"Credit"),
    row("2026-11-10","devon","Personal training, 60 min","Andre Lewis","","App",70,0,0,0,70,"Credit"),
    row("2026-11-09","chris","Open Gym Unlimited","","","Renewal",79,0,0,0,0,"Card"),
    row("2026-11-07","tom","Day Pass","","Riley Chen","Front desk",15,1.5,0,0,0,"Cash"),
    row("2026-11-06","marcus","Massage, 60 min","Renee Castillo","Riley Chen","Front desk",95,0,19,0,0,"Card"),
    row("2026-11-05","dana","Nutrition Coaching","","","Renewal",39.99,0,0,0,0,"Card"),
    row("2026-11-04","dana","Recovery Room, 50 min","","","App",35,0,0,0,35,"Credit"),
    row("2026-11-03","leah","Semi-Private 2x per week","Tori Lane","","Renewal",449,0,0,0,0,"Card"),
    row("2026-11-02","dana","Recovery Room 4-pack","","","Payment link",140,0,0,0,0,"Card"),
    row("2026-11-01","dana","Semi-Private 2x per week","Tori Lane","","Renewal",449,0,0,0,0,"Card"),
    row("2026-10-28","devon","Personal Training 8-pack","Andre Lewis","Riley Chen","Front desk",560,0,0,0,0,"Card"),
    row("2026-10-24","dana","Protein bar","","Riley Chen","Front desk",3,0,0,0,0,"Cash"),
    row("2026-10-09","chris","Open Gym Unlimited","","","Renewal",79,0,0,0,0,"Card"),
    row("2026-10-05","dana","Nutrition Coaching","","","Renewal",39.99,0,0,0,0,"Card"),
    row("2026-10-03","leah","Semi-Private 2x per week","Tori Lane","","Renewal",449,0,0,0,0,"Card"),
    row("2026-10-01","dana","Semi-Private Founding Month","Tori Lane","","Renewal",399,0,0,0,0,"Card")
  ];
  var payouts=[["2026-11-19",612.4],["2026-11-12",388.1],["2026-11-05",905.75],["2026-10-29",731.2],["2026-10-22",448.6],["2026-10-08",842.99]];
  var BANK="Bank ending 2291";
  var noAccess=[{id:"na1",pid:"marcus",item:"Day Pass",amt:15}];
  var canceled=[];
  var msgDefault="Hi {First name}, here is your link to pay {Amount} for {Item} at {Gym name}: {Link}";
  var G=DB.GYM; G.payMsg=G.payMsg||msgDefault; if(G.goal===undefined) G.goal=3000;
  var SV=[], ALLPK=[];
  DB.ITEMS.forEach(function(i){ if(i.kind==="product") return; var g=SV.filter(function(v){return v.name===i.svc})[0]; if(!g){g={name:i.svc,pk:[]}; SV.push(g)} var p={id:i.id,n:i.name,p:i.price,per:i.per,svc:i.svc}; g.pk.push(p); ALLPK.push(p) });
  var FREE=1;
  function blank(){return {id:null,name:"",code:"",type:"pct",value:"10",scope:"all",picked:{},renew:"first",startOn:"live",starts:"",endOn:"never",ends:"",total:"",per:"",newOnly:false,status:"Draft",used:0}}
  var promos=[
    {id:"p1",name:"Front desk welcome",code:"WELCOME10",type:"pct",value:"10",scope:"all",picked:{},renew:"first",startOn:"live",starts:"",endOn:"never",ends:"",total:"",per:"",newOnly:false,status:"Live",used:14},
    {id:"p2",name:"Bring a friend",code:"FRIEND10",type:"amt",value:"10",scope:"some",picked:{pt8:true,rr4:true},renew:"first",startOn:"live",starts:"",endOn:"never",ends:"",total:"",per:"",newOnly:false,status:"Live",used:3},
    {id:"p3",name:"Summer memberships",code:"SUMMER25",type:"pct",value:"25",scope:"some",picked:{sp2:true,ogu:true},renew:"first",startOn:"date",starts:"2026-06-01",endOn:"date",ends:"2026-08-31",total:"50",per:"1",newOnly:false,status:"Ended",used:41},
    {id:"p4",name:"January kickoff",code:"NEWYEAR",type:"pct",value:"15",scope:"all",picked:{},renew:"first",startOn:"date",starts:"2027-01-01",endOn:"date",ends:"2027-01-31",total:"",per:"1",newOnly:true,status:"Draft",used:0}
  ];
  var RANGES={today:["Today",TODAY,TODAY],week:["Last 7 days","2026-11-14",TODAY],month:["This month","2026-11-01",TODAY],last:["Last month","2026-10-01","2026-10-31"]};
  var st={range:"month",from:"2026-11-01",to:TODAY,rangeOpen:false,showF:false,f:{meth:"",tm:"",src:""},view:"tx",by:"tm",q:"",failed:false,open:null,refund:null,reason:null,promo:null,pq:"",pend:null,focusGoal:false,checked:"today at 3:43 PM"};

  /* example state that the rest of the prototype also sees */
  (function(){
    var P=M.person, leah=P("leah"), devon=P("devon"), ava=P("ava"), marcus=P("marcus"), tom=P("tom"), chris=P("chris");
    leah.plans.push({id:"nu",name:"Nutrition Coaching",kind:"Subscription",service:"Nutrition",price:"$39.99 a month",amt:39.99,start:"2026-09-18",next:"2026-11-23",unlimited:true,dates:true,failed:"2026-11-18"});
    devon.plans.push({id:"nu",name:"Nutrition Coaching",kind:"Subscription",service:"Nutrition",price:"$39.99 a month",amt:39.99,start:"2026-11-13",next:"2026-11-27",unlimited:true,dates:true,state:"Trial"});
    ava.plans.push({id:"og",name:"Open Gym Unlimited",kind:"Membership",service:"Open gym",price:"$79.00 a month",amt:79,start:"2026-06-01",next:"2027-01-05",unlimited:true,dates:true,state:"Paused",reason:"Traveling"});
    marcus.tx.push(["Nov 6","Massage, 60 min","Visa ending 3391","$114.00"]);
    tom.tx.unshift(["Nov 7","Day Pass","Cash","$13.50"]);
    devon.tx.unshift(["Nov 18","Protein bar","Cash","$3.23"],["Nov 17","Tip, personal training","Visa ending 9034","$10.00"]);
    chris.tx.unshift(["Nov 20","Northline tee","Visa ending 4417","$26.88"],["Nov 19","Energy drink","Cash","$3.23"]);
    M.people().forEach(function(p){p.tx.forEach(function(x){x._l=true})});
  })();
  /* anything sold today in the POS or renewed on a record joins the ledger */
  function sync(){
    M.people().forEach(function(p){
      p.tx.forEach(function(x){
        if(x._l) return; x._l=true;
        var amt=parseFloat(String(x[3]).replace(/[^0-9.\-]/g,""))||0, m=String(x[2]), meth=/cash/i.test(m)?"Cash":(/check/i.test(m)?"Check":"Card");
        T.unshift(row(TODAY,p.id,x[1],"",M.you().name,"Front desk",amt,0,0,0,0,meth));
        p.plans.forEach(function(pl){ if(pl.failed&&pl.name.toLowerCase()===String(x[1]).toLowerCase()){pl.failed=null; pl.next="2026-12-20"} });
      });
    });
  }
  function name(pid){var p=M.person(pid); return p?p.name:pid}
  function needList(){
    var o=[];
    M.people().forEach(function(p){p.plans.forEach(function(pl){ if(pl.failed) o.push({id:"f:"+p.id+":"+pl.id,kind:"Failed payment",chip:"err",text:p.name+"'s "+pl.name+" renewal of "+usd(pl.amt)+" failed on "+sd(pl.failed)+".",meta:"Card declined. Milton tries again on "+sd(pl.next)+".",btns:[["msg","Message"],["pay","Take payment"]]}) })});
    noAccess.forEach(function(n){o.push({id:"a:"+n.id,kind:"Paid, no access yet",chip:"warn",text:name(n.pid)+" paid "+usd(n.amt)+" for a "+n.item+" and the pass was not added.",meta:"Trying again never charges the customer twice.",btns:[["retry","Try again"]]})});
    M.people().forEach(function(p){p.links.forEach(function(l){o.push({id:"l:"+p.id+":"+l.id,kind:"Unfinished checkout",chip:"mist",text:p.name+" has not finished paying for "+l.text+".",meta:l.meta,btns:[["resend","Resend link"],["cancel","Cancel checkout"]]})})});
    return o;
  }
  M.payNeeds=needList;

  /* Overview */
  function monthRows(){return T.filter(function(t){return t.iso>="2026-11-01"&&t.iso<=TODAY})}
  function overview(){
    var need=needList(), h="";
    if(need.length) h+='<section class="card" aria-label="Needs attention"><div class="ch"><h3>Needs attention</h3><span class="m">'+need.length+' open</span></div>'+need.map(function(n){return '<div class="row"><div class="what"><span class="chip '+n.chip+'" style="margin:0 0 6px">'+n.kind+'</span><div class="t">'+esc(n.text)+'</div><div class="m">'+esc(n.meta)+'</div></div><div class="acts">'+n.btns.map(function(b,i){return '<button class="btn sm'+(i===0?" hl":" quiet")+'" data-act="yneed" data-id="'+n.id+"|"+b[0]+'">'+b[1]+'</button>'}).join("")+'</div></div>'}).join("")+'</section>';
    else h+='<section class="card"><div class="clearline"><span class="okdot"></span>Nothing needs attention. No failed payments, unfinished checkouts or orders waiting on access.</div></section>';
    var m=monthRows(), paid=sum(m,"paid"), goal=G.goal, pct=goal?Math.min(100,Math.round(paid/goal*100)):0;
    h+='<section class="card"><div class="ch"><h3>This month</h3><button class="link" data-act="ygoto" data-id="reports:tx">Open reports</button></div><div class="k">Money in, Nov 1 to Nov 20</div><div class="big" style="font-size:26px">'+usd(paid)+(goal?' <span class="m" style="font-family:var(--body);font-weight:500;font-size:15px">of a '+usd(goal)+' goal</span>':"")+'</div>'
      +(goal?'<div class="gbar" role="img" aria-label="'+pct+' percent of the monthly goal"><i style="width:'+pct+'%"></i></div><div class="m">'+pct+'% of the goal with 10 days left. <button class="link" data-act="ygoto" data-id="setup:goal">Edit goal</button></div>':'<div class="m" style="margin-top:6px">No monthly goal yet. <button class="link" data-act="ygoto" data-id="setup:goal">Set a monthly goal</button></div>')
      +'<div class="strip">'+[["Full price","price"],["Discounts","disc"],["Tips","tip"],["Credits used","cred"]].map(function(c){return '<div class="cell"><div class="k">'+c[0]+'</div><div class="v">'+usd(sum(m,c[1]))+'</div></div>'}).join("")+'</div></section>';
    h+='<div class="two ytwo"><section class="card"><div class="ch"><h3>Latest payout</h3></div><div class="big" style="font-size:22px">'+usd(payouts[0][1])+'</div><div class="m">Sent '+sd(payouts[0][0])+" to "+BANK.toLowerCase()+'.</div><div style="margin-top:10px"><button class="link" data-act="ygoto" data-id="reports:pay">Payout history</button></div></section>'
      +'<section class="card"><div class="ch"><h3>Payments status</h3><span class="chip ok">Payments live</span></div><div>Cards, cash and checks are on. Payouts to your bank are on.</div><div class="m" style="margin-top:4px">Last checked '+st.checked+'.</div><div style="margin-top:10px"><button class="link" data-act="ygoto" data-id="setup">Open setup</button></div></section></div>';
    return h;
  }

  /* Reports */
  function rangeLabel(){return (st.range==="custom"?"Custom":RANGES[st.range][0])+": "+(st.from===st.to?ld(st.to):sd(st.from)+" to "+ld(st.to))}
  function nF(){return (st.f.meth?1:0)+(st.f.tm?1:0)+(st.f.src?1:0)}
  function RT(){return T.filter(function(t){return t.iso>=st.from&&t.iso<=st.to&&(!st.f.meth||t.meth===st.f.meth)&&(!st.f.tm||(t.tm||"No team member")===st.f.tm)&&(!st.f.src||t.src===st.f.src)})}
  function uniq(k){var o=[]; T.forEach(function(t){var v=t[k]||"No team member"; if(o.indexOf(v)<0) o.push(v)}); return o.sort()}
  function PO(){return payouts.filter(function(p){return p[0]>=st.from&&p[0]<=st.to})}
  function sales(a){return a.filter(function(t){return !t.ref&&!t.fail}).length}
  function groups(k){var m={},o=[]; RT().forEach(function(t){ if(t.fail) return; var key=(k==="tm"?(st.by==="tm"?t.tm:t.sold):t.item.replace(/^Refund: /,""))||"No team member"; if(!m[key]){m[key]=[]; o.push(key)} m[key].push(t)}); return {m:m,o:o.sort(function(a,b){return a==="No team member"?1:(b==="No team member"?-1:(a<b?-1:1))})}}
  function none(){return '<div class="none">No payments in this date range'+(nF()?" with these filters":"")+'.</div>'}
  function grouped(k,first){
    var all=RT().filter(function(t){return !t.fail}); if(!all.length) return none();
    var g=groups(k);
    return '<div class="tw"><table class="num"><thead><tr><th>'+first+'</th><th>Sessions and sales</th><th>Full price</th><th>Discounts</th><th>Tips</th><th>Tax</th><th>Credits used</th><th>Total paid</th></tr></thead><tbody>'+g.o.map(function(key){var a=g.m[key]; return '<tr><td><b>'+esc(key)+'</b></td><td>'+sales(a)+'</td><td>'+usd(sum(a,"price"))+'</td><td>'+neg(sum(a,"disc"))+'</td><td>'+z(sum(a,"tip"))+'</td><td>'+z(sum(a,"tax"))+'</td><td>'+neg(sum(a,"cred"))+'</td><td><b>'+usd(sum(a,"paid"))+'</b></td></tr>'}).join("")+'</tbody><tfoot><tr><td>Total</td><td>'+sales(all)+'</td><td>'+usd(sum(all,"price"))+'</td><td>'+neg(sum(all,"disc"))+'</td><td>'+usd(sum(all,"tip"))+'</td><td>'+usd(sum(all,"tax"))+'</td><td>'+neg(sum(all,"cred"))+'</td><td>'+usd(sum(all,"paid"))+'</td></tr></tfoot></table></div>';
  }
  function left(t){return r2(t.paid-t.refunded)}
  function txTable(){
    var q=st.q.toLowerCase(), a=RT().filter(function(t){return (!q||(name(t.pid)+" "+t.item+" "+t.tm).toLowerCase().indexOf(q)>-1)&&(!st.failed||t.fail)});
    if(!a.length) return '<div class="none">'+(st.failed?"No failed payments in this period.":(st.q?'No payments match "'+esc(st.q)+'".':"No payments in this date range"+(nF()?" with these filters":"")+"."))+'</div>';
    var h='<div class="tw"><table class="num ytx"><thead><tr><th>Date</th><th>Customer</th><th>Item</th><th>Team member</th><th>Full price</th><th>Discounts</th><th>Tips</th><th>Credits used</th><th>Total paid</th><th>Paid by</th><th></th></tr></thead><tbody>';
    a.forEach(function(t){
      var mark=t.fail?' <span class="chip err">Failed</span>':(t.refunded?(left(t)<=0?' <span class="chip">Refunded</span>':' <span class="chip">Partly refunded</span>'):"");
      h+='<tr'+(st.open===t.id?' class="on"':"")+'><td>'+sd(t.iso)+'</td><td><b>'+esc(name(t.pid))+'</b></td><td>'+esc(t.item)+'</td><td>'+(t.tm?esc(t.tm):'<span class="mut">None</span>')+'</td><td>'+usd(t.price)+'</td><td>'+neg(t.disc)+'</td><td>'+z(t.tip)+'</td><td>'+neg(t.cred)+'</td><td><b>'+(t.fail?'<span class="mut">$0.00</span>':usd(t.paid))+'</b></td><td>'+t.meth+mark+'</td><td><button class="link" data-act="ydetail" data-id="'+t.id+'">'+(st.open===t.id?"Hide":"Details")+'</button></td></tr>';
      if(st.open!==t.id) return;
      var p=M.person(t.pid), can=!t.fail&&!t.ref&&left(t)>0;
      h+='<tr class="detail"><td colspan="11"><div class="dwrap"><div class="kv"><span><b>Sold through:</b> '+t.src+(t.sold?", "+esc(t.sold):"")+'</span><span><b>Tax:</b> '+usd(t.tax)+'</span><span><b>Status:</b> '+t.status+'</span><span><b>Receipt:</b> '+(t.fail?"not sent":"sent by "+(p&&p.textOk&&p.phone?"text":"email"))+'</span>'+(t.refunded?'<span><b>Refunded so far:</b> '+usd(t.refunded)+'</span>':"")+'</div>';
      h+='<div class="acts" style="margin-top:10px"><button class="btn sm" data-act="record" data-id="'+t.pid+'">Open '+esc(p?p.first:"")+'\'s record</button>'+(t.fail?'<button class="btn sm" data-act="ypayfail" data-id="'+t.pid+'">Take payment</button>':'<button class="btn sm" data-act="later" data-id="The receipt view">View receipt</button>')+(can?'<button class="btn sm danger" data-act="yrefund" data-id="'+t.id+'">Refund '+usd(left(t))+'</button>':"")+'</div>'+(can?'<div class="m" style="margin-top:6px">A Manager sees Refund only when an Admin has turned it on.</div>':"");
      h+='</div></td></tr>';
    });
    var ok=a.filter(function(t){return !t.fail});
    return h+'</tbody><tfoot><tr><td>Total</td><td></td><td></td><td></td><td>'+usd(sum(ok,"price"))+'</td><td>'+neg(sum(ok,"disc"))+'</td><td>'+usd(sum(ok,"tip"))+'</td><td>'+neg(sum(ok,"cred"))+'</td><td>'+usd(sum(ok,"paid"))+'</td><td></td><td></td></tr></tfoot></table></div>';
  }
  function reports(){
    var views=[["tx","Every payment"],["item","By item"],["team","By team member"],["pay","Payouts"]], nf=T.filter(function(t){return t.fail&&t.iso>=st.from&&t.iso<=st.to}).length;
    var h='<section class="card"><div class="rbar"><button class="btn sm" data-act="yrangeopen" aria-expanded="'+st.rangeOpen+'">'+rangeLabel()+' &#9662;</button><div class="seg" role="group" aria-label="Report view">'+views.map(function(v){return '<button data-act="yview" data-id="'+v[0]+'" aria-pressed="'+(st.view===v[0])+'">'+v[1]+'</button>'}).join("")+'</div><span class="sp"></span>'+(st.view==="pay"?"":'<button class="btn sm" data-act="yshowf" aria-expanded="'+st.showF+'">Filters'+(nF()?' <span class="cnt">'+nF()+'</span>':"")+'</button>')+'<button class="btn sm" data-act="yprint">Print</button><button class="btn sm" data-act="ydownload">Download</button></div>';
    if(st.rangeOpen) h+='<div class="inplace"><div class="seg">'+Object.keys(RANGES).map(function(k){return '<button data-act="yrange" data-id="'+k+'" aria-pressed="'+(st.range===k)+'">'+RANGES[k][0]+'</button>'}).join("")+'</div><span class="sp"></span><label class="m" for="yFrom">From</label><input class="fld" style="width:auto" type="date" id="yFrom" value="'+st.from+'"><label class="m" for="yTo">to</label><input class="fld" style="width:auto" type="date" id="yTo" value="'+st.to+'"><button class="btn sm hl" data-act="yrangeapply">Apply</button></div>';
    if(st.showF&&st.view!=="pay"){
      var sel=function(k,lab,vals){return '<label class="m" for="yf_'+k+'">'+lab+'</label><select class="csel" id="yf_'+k+'" data-yf="'+k+'"><option value="">All</option>'+vals.map(function(v){return '<option'+(st.f[k]===v?" selected":"")+'>'+esc(v)+'</option>'}).join("")+'</select>'};
      h+='<div class="inplace">'+sel("meth","Paid by",uniq("meth"))+sel("tm","Team member",uniq("tm"))+sel("src","Sold through",uniq("src"))+(nF()?'<button class="btn sm quiet" data-act="yclearf">Clear filters</button>':"")+'<span class="m">Filters apply to every view and to the download.</span></div>';
    }
    if(st.view==="tx") h+='<div class="rbar" style="margin-top:12px"><input class="search" id="yq" type="search" placeholder="Search payments" aria-label="Search payments" value="'+esc(st.q)+'"><div class="seg" role="group" aria-label="Show"><button data-act="yfailed" data-id="0" aria-pressed="'+(!st.failed)+'">All</button><button data-act="yfailed" data-id="1" aria-pressed="'+st.failed+'">Failed '+nf+'</button></div></div><div id="ytx">'+txTable()+'</div>';
    else if(st.view==="item") h+='<div style="margin-top:12px">'+grouped("item","Item")+'</div>';
    else if(st.view==="team") h+='<div class="rbar" style="margin-top:12px"><span class="m">Count by</span><div class="seg" role="group" aria-label="Count by"><button data-act="yby" data-id="tm" aria-pressed="'+(st.by==="tm")+'">Who delivered it</button><button data-act="yby" data-id="sold" aria-pressed="'+(st.by==="sold")+'">Who sold it</button></div></div>'+grouped("tm","Team member");
    else if(!PO().length) h+='<div class="none">No payouts in this date range.</div>';
    else h+='<div class="tw" style="margin-top:12px"><table><thead><tr><th>Sent</th><th>Amount</th><th>Status</th><th>To</th></tr></thead><tbody>'+PO().map(function(p){return '<tr><td>'+ld(p[0])+'</td><td><b>'+usd(p[1])+'</b></td><td><span class="chip ok">Paid</span></td><td>'+BANK+'</td></tr>'}).join("")+'</tbody></table></div>';
    return h+'</section>';
  }
  function csvOut(){
    var rows,nm; function q(v){v=String(v); return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v}
    if(st.view==="pay"){rows=[["Sent","Amount","Status","To"]].concat(PO().map(function(p){return [p[0],p[1].toFixed(2),"Paid",BANK]})); nm="payouts"}
    else if(st.view==="tx"){rows=[["Date","Customer","Item","Team member","Sold through","Full price","Discounts","Tips","Tax","Credits used","Total paid","Paid by","Status"]].concat(RT().map(function(t){return [t.iso,name(t.pid),t.item,t.tm,t.src,t.price.toFixed(2),t.disc.toFixed(2),t.tip.toFixed(2),t.tax.toFixed(2),t.cred.toFixed(2),(t.fail?0:t.paid).toFixed(2),t.meth,t.status]})); nm="every-payment"}
    else{var k=st.view==="item"?"item":"tm", g=groups(k); rows=[[k==="item"?"Item":"Team member","Sessions and sales","Full price","Discounts","Tips","Tax","Credits used","Total paid"]].concat(g.o.map(function(key){var a=g.m[key]; return [key,sales(a),sum(a,"price").toFixed(2),sum(a,"disc").toFixed(2),sum(a,"tip").toFixed(2),sum(a,"tax").toFixed(2),sum(a,"cred").toFixed(2),sum(a,"paid").toFixed(2)]})); nm=k==="item"?"by-item":"by-team-member"}
    return {name:"milton-"+nm+"-"+st.from+"-to-"+st.to+".csv",text:rows.map(function(r){return r.map(q).join(",")}).join("\n"),n:rows.length-1};
  }

  /* Subscriptions */
  function subs(){
    var o=[];
    M.people().forEach(function(p){p.plans.forEach(function(pl){ if(!pl.dates) return; var s=pl.state||"Active"; o.push({key:p.id+":"+pl.id,p:p,pl:pl,state:s}) })});
    canceled.forEach(function(c){o.push(c)});
    var ord={Active:0,Trial:1,Paused:2,Canceled:3}; return o.sort(function(a,b){return ord[a.state]-ord[b.state]});
  }
  var WHY={Pause:["Traveling","Injury or illness","Money is tight","Other"],Cancel:["Moved away","Cost","Not using it","Went to another gym","Other"]};
  function subsTab(){
    var S=subs(), n=function(s){return S.filter(function(x){return x.state===s}).length};
    var h='<div class="strip" style="margin-top:0;grid-template-columns:repeat(3,1fr)">'+[["Active","Active"],["Trials","Trial"],["Paused","Paused"]].map(function(c){return '<div class="cell"><div class="k">'+c[0]+'</div><div class="v">'+n(c[1])+'</div></div>'}).join("")+'</div><section class="card" style="margin-top:16px"><div class="ch"><h3>Memberships and subscriptions</h3><span class="m">Active first</span></div>';
    S.forEach(function(s){
      var pl=s.pl, p=s.p, kind=pl.kind.toLowerCase(), per=pl.price.replace(/^\S+ /,"");
      var next=s.state==="Canceled"?"Canceled "+sd(TODAY)+". Reason: "+s.reason.toLowerCase():(s.state==="Paused"?"Paused until "+ld(pl.next)+". Reason: "+String(pl.reason||"not given").toLowerCase():(s.state==="Trial"?"Trial ends "+sd(pl.next):(pl.failed?"Renewal failed "+sd(pl.failed)+". Next try "+sd(pl.next):(pl.first?"First charge "+sd(pl.next):"Renews "+sd(pl.next)))));
      var chip=s.state==="Active"?(pl.failed?'<span class="chip err">Payment failed</span>':(pl.first?'<span class="chip mist">First charge '+sd(pl.next)+'</span>':'<span class="chip ok">Active</span>')):(s.state==="Trial"?'<span class="chip mist">Trial</span>':(s.state==="Paused"?'<span class="chip warn">Paused</span>':'<span class="chip">Canceled</span>'));
      var acts=s.state==="Canceled"?"":(s.state==="Paused"?'<button class="btn sm" data-act="yresume" data-id="'+s.key+'">Resume</button>':'<button class="btn sm" data-act="yask" data-id="'+s.key+'|Pause">Pause</button>')+'<button class="btn sm quiet" data-act="yask" data-id="'+s.key+'|Cancel">Cancel</button>';
      h+='<div class="row"><div class="what"><div class="t"><button class="link" data-act="record" data-id="'+p.id+'">'+esc(p.name)+'</button></div><div class="m">'+esc(pl.name)+", "+kind+". "+esc(next)+'.</div></div><div class="amt">'+usd(pl.amt)+' <span class="m">'+esc(per)+'</span></div>'+chip+'<div class="acts">'+(s.state==="Canceled"?"":'<button class="btn sm" data-act="ymanage" data-id="'+s.key+'" >Manage</button>')+'</div>';
      h+='</div>';
    });
    return h+'</section><p class="sub" style="margin-top:14px">Looking for checkouts that were started and not finished? They are in <button class="link" data-act="ygoto" data-id="overview">Needs attention on Overview</button>.</p>';
  }

  /* promo codes */
  function pkOf(d){return d.scope==="all"?ALLPK:ALLPK.filter(function(p){return d.picked[p.id]})}
  function hasRecurring(d){return pkOf(d).some(function(p){return p.per})}
  function offText(d){var v=parseFloat(d.value); if(!(v>0)) return ""; return d.type==="pct"?v+"% off":usd(v)+" off"}
  function after(d,p){var v=parseFloat(d.value)||0; return Math.max(0,d.type==="pct"?p*(1-v/100):p-v)}
  function pkName(p){return /^(Drop-in|\d+-pack)$/.test(p.n)?p.svc+" "+p.n.toLowerCase():p.n}
  function lines(d){
    var off=offText(d), pk=pkOf(d), o=[]; if(!off) return ["Add how much to take off."];
    var a=off.charAt(0).toUpperCase()+off.slice(1)+" "+(d.scope==="all"?"every package you sell":(pk.length?(pk.length===1?pkName(pk[0]):pk.length+" packages"):"no packages yet"));
    if(hasRecurring(d)) a+=d.renew==="first"?", on the first payment only":", on the first payment and every renewal";
    o.push(a+".");
    o.push((d.startOn==="date"&&d.starts?"Starts "+ld(d.starts):"Starts when you make it live")+(d.endOn==="date"&&d.ends?" and ends "+ld(d.ends)+".":", with no end date."));
    var lim=[]; if(d.total) lim.push("Up to "+d.total+" uses in total"); if(d.per) lim.push(d.per+" per customer");
    o.push(lim.length?lim.join(", ")+".":"No limit on uses.");
    if(d.newOnly) o.push("New customers only.");
    return o;
  }
  function shortLine(d){var pk=pkOf(d); return (offText(d)||"No discount set")+" "+(d.scope==="all"?"every package":(pk.length===1?pkName(pk[0]):pk.length+" packages"))+(d.newOnly?", new customers only":"")}
  function problems(d){
    var o=[], v=parseFloat(d.value);
    if(!d.code.trim()) o.push("Add a promo code.");
    else if(!/^[A-Z0-9]+$/.test(d.code)) o.push("Use only letters and numbers in the code, with no spaces.");
    else if(promos.some(function(p){return p.code===d.code&&p.id!==d.id})) o.push("The code "+d.code+" is already in use.");
    if(!(v>0)) o.push("Add how much to take off."); else if(d.type==="pct"&&v>100) o.push("A percentage cannot be more than 100.");
    if(d.scope==="some"&&!pkOf(d).length) o.push("Pick at least one package.");
    if(d.startOn==="date"&&!d.starts) o.push("Pick a start date.");
    if(d.endOn==="date"&&!d.ends) o.push("Pick an end date.");
    if(d.startOn==="date"&&d.endOn==="date"&&d.starts&&d.ends&&d.ends<d.starts) o.push("The end date is before the start date.");
    return o;
  }
  function sideHTML(d){
    var pr=problems(d), ex=pkOf(d).filter(function(p){return p.p>0})[0];
    var h='<div class="infobox"><div class="k" style="color:inherit">What this code does</div><div class="code" style="margin-top:4px">'+(d.code?esc(d.code):"YOURCODE")+'</div>'+lines(d).map(function(l){return '<div style="margin-top:6px">'+esc(l)+'</div>'}).join("");
    if(ex&&offText(d)) h+='<div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--mist-line);font-size:13.5px"><b>Example:</b> '+esc(pkName(ex))+". "+usd(ex.p)+" becomes <b>"+usd(after(d,ex.p))+"</b>"+(ex.per?(d.renew==="first"?" for the first "+ex.per+", then "+usd(ex.p):" every "+ex.per):"")+'.</div>';
    h+='</div><div class="card"><div class="acts"><button class="btn pri" data-act="yplive">'+(d.status==="Live"?"Save changes":"Make it live")+'</button>'+(d.status==="Live"?"":'<button class="btn" data-act="ypdraft">Save as draft</button>')+'<button class="btn quiet" data-act="ypcancel">Cancel</button></div>'+(pr.length?'<ul class="todo" id="ytodo">'+pr.map(function(x){return '<li>'+esc(x)+'</li>'}).join("")+'</ul>':'<div class="m" style="margin-top:8px">'+(d.status==="Live"?"Changes apply to new checkouts right away.":"A draft does nothing at checkout until you make it live.")+'</div>')+'</div>';
    return h;
  }
  function pickHTML(d){
    var q=st.pq.toLowerCase(), h="";
    SV.forEach(function(v){
      var pk=v.pk.filter(function(p){return !q||(p.n+" "+v.name).toLowerCase().indexOf(q)>-1}); if(!pk.length) return;
      var all=v.pk.every(function(p){return d.picked[p.id]});
      h+='<div class="svc"><div class="svch"><span>'+esc(v.name)+'</span><button class="link" data-act="ypsvc" data-id="'+esc(v.name)+'">'+(all?"Clear":"Select all")+'</button></div>'+pk.map(function(p){return '<label class="pk"><input type="checkbox" class="pick" data-yp="pick" data-id="'+p.id+'"'+(d.picked[p.id]?" checked":"")+'><span>'+esc(p.n)+'</span><span class="m">'+usd(p.p)+(p.per?" a "+p.per:"")+'</span></label>'}).join("")+'</div>';
    });
    return h||'<div class="m" style="padding:10px 2px">No packages match "'+esc(st.pq)+'".</div>';
  }
  function promoEditor(){
    var d=st.promo, n=pkOf(d).length;
    function opt(f,v,t,sub){return '<button class="opt" data-act="ypopt" data-id="'+f+":"+v+'" aria-pressed="'+(d[f]===v)+'"><b>'+t+'</b>'+(sub?'<span class="m">'+sub+'</span>':"")+'</button>'}
    var h='<div><button class="btn sm quiet" data-act="ypcancel">&#8249; Back to setup</button></div><div class="ped"><div class="stack" style="min-width:0">';
    h+='<section class="card"><div class="ch"><h3>'+(d.id?"Edit promo code":"New promo code")+'</h3>'+(d.id?'<span class="rbar"><span class="chip '+(d.status==="Live"?"ok":(d.status==="Draft"?"mist":""))+'">'+d.status+'</span>'+(d.status==="Live"?'<button class="btn sm quiet rm" data-act="ypend2" data-id="'+d.id+'">End code</button>':"")+'</span>':"")+'</div><div class="two"><div class="field"><label for="ypcode">Promo code</label><input id="ypcode" data-yp="code" value="'+esc(d.code)+'" placeholder="WELCOME10" autocapitalize="characters" autocomplete="off" spellcheck="false" class="code"><div class="m">What customers type at checkout.</div></div><div class="field"><label for="ypname">Name for your team (optional)</label><input id="ypname" data-yp="name" value="'+esc(d.name)+'" placeholder="New customer offer"><div class="m">Customers never see this.</div></div></div><div class="two" style="margin-top:14px"><div class="field"><label>Take off</label><div class="seg" role="group" aria-label="Discount type"><button data-act="yptype" data-id="pct" aria-pressed="'+(d.type==="pct")+'">A percentage</button><button data-act="yptype" data-id="amt" aria-pressed="'+(d.type==="amt")+'">A dollar amount</button></div></div><div class="field"><label for="ypval">'+(d.type==="pct"?"Percent off":"Dollars off")+'</label><input id="ypval" data-yp="value" inputmode="decimal" value="'+esc(d.value)+'" style="max-width:160px"></div></div></section>';
    h+='<section class="card"><div class="ch"><h3>What it works on</h3><span class="m">'+(d.scope==="all"?ALLPK.length+" packages":n+" picked")+'</span></div><div class="two">'+opt("scope","all","Every package you sell","Includes packages you add later.")+opt("scope","some","Only the packages I pick","Grouped by service.")+'</div>';
    if(d.scope==="some") h+='<div style="margin-top:12px"><input class="search" style="max-width:none;width:100%" id="ypq" type="search" placeholder="Search packages or services" aria-label="Search packages or services" value="'+esc(st.pq)+'"><div id="yplist" style="margin-top:10px">'+pickHTML(d)+'</div></div>';
    h+='<div class="m" style="margin-top:10px">Products are not included. '+FREE+' free package is left out because there is nothing to take off.</div>';
    if(hasRecurring(d)) h+='<div style="margin-top:14px"><div class="k">On memberships and subscriptions</div><div class="two" style="margin-top:6px">'+opt("renew","first","First payment only","Renewals go back to the regular price.")+opt("renew","every","First payment and every renewal","The discount stays for as long as they do.")+'</div></div>';
    h+='</section><section class="card"><div class="ch"><h3>When and how often</h3><span class="m">All optional</span></div><div class="two"><div class="stack" style="gap:8px"><div class="k">Starts</div>'+opt("startOn","live","When I make it live")+opt("startOn","date","On a date")+(d.startOn==="date"?'<input class="fld" type="date" data-yp="starts" aria-label="Start date" value="'+d.starts+'">':"")+'</div><div class="stack" style="gap:8px"><div class="k">Ends</div>'+opt("endOn","never","Never")+opt("endOn","date","On a date")+(d.endOn==="date"?'<input class="fld" type="date" data-yp="ends" aria-label="End date" value="'+d.ends+'">':"")+'</div></div><div class="m" style="margin-top:8px">Dates use your gym\'s time zone, '+G.tz+'. A code starts at the beginning of its first day and ends at the close of its last.</div><div class="two" style="margin-top:14px"><div class="field"><label for="yptot">Total uses</label><input id="yptot" data-yp="total" inputmode="numeric" placeholder="No limit" value="'+esc(d.total)+'"></div><div class="field"><label for="ypper">Uses per customer</label><input id="ypper" data-yp="per" inputmode="numeric" placeholder="No limit" value="'+esc(d.per)+'"></div></div><label class="pk" style="margin-top:12px;border:1px solid var(--line);border-radius:10px;padding:10px 12px"><input type="checkbox" class="pick" data-yp="newOnly"'+(d.newOnly?" checked":"")+'><span><b style="font-weight:600">New customers only</b><br><span class="m">Works only for people who have never paid your gym before.</span></span></label>'+(d.id?'<div class="m" style="margin-top:10px">Used '+M.plural(d.used,"time")+' so far.</div>':"")+'</section>';
    return h+'</div><aside class="pside" id="yside" aria-label="Summary">'+sideHTML(d)+'</aside></div>';
  }

  /* Setup */
  function preview(){return G.payMsgDraft.replace("{First name}","Dana").replace("{Amount}","$25.00").replace("{Item}","Youth Camp Day Pass").replace("{Gym name}",G.name).replace("{Link}","pay.northlinestrength.com/x7Kq")}
  function setup(){
    if(st.promo) return promoEditor();
    if(G.payMsgDraft===undefined) G.payMsgDraft=G.payMsg;
    var bad=G.payMsgDraft.indexOf("{Link}")<0, goal=G.goal;
    var h='<div class="stack"><section class="card"><div class="ch"><h3>Your payment account</h3><span class="chip ok">Payments live</span></div><div>Your payment account is ready. Card payments are available.</div><div class="kv"><span><b>Card payments:</b> On</span><span><b>Payouts to bank:</b> On</span><span><b>Verification:</b> Verified</span></div><div class="acts" style="margin-top:12px"><button class="btn sm" data-act="yrefresh">Refresh status</button><button class="btn sm" data-act="later" data-id="Your Stripe dashboard">Open Stripe dashboard</button></div><div class="m" style="margin-top:6px">Last checked '+st.checked+'.</div></section>';
    h+='<section class="card"><div class="ch"><h3>How checkouts are processed</h3><span class="chip ok">Live</span></div><div class="kv"><span><b>Method:</b> Card</span><span><b>Processor:</b> Stripe</span><span><b>Currency:</b> USD</span></div></section>';
    h+='<section class="card" id="ygoalcard"><div class="ch"><h3>Monthly goal</h3><span class="m">Shows on Overview</span></div><div class="m">How much you want to bring in each month. Milton measures money in against it.</div><div class="rbar" style="margin-top:10px"><label class="t" for="yGoal">Goal per month</label><input class="fld" id="yGoal" inputmode="decimal" style="width:160px" value="'+(goal?goal.toLocaleString("en-US"):"")+'" placeholder="No goal"><button class="btn sm hl" data-act="ysavegoal">Save</button>'+(goal?'<button class="btn sm quiet" data-act="ycleargoal">Remove goal</button>':"")+'</div><div class="m" style="margin-top:6px">Only Admins can change this.</div></section>';
    h+='<section class="card"><div class="ch"><h3>Promo codes</h3><button class="btn sm" data-act="ypnew">New promo code</button></div>'+promos.map(function(p){
      var c=p.status==="Live"?"ok":(p.status==="Draft"?"mist":"");
      var r='<div class="row"><div class="what"><div class="t"><button class="link code" data-act="ypedit" data-id="'+p.id+'">'+esc(p.code)+'</button>'+(p.name?' <span class="m" style="font-weight:400">'+esc(p.name)+'</span>':"")+'</div><div class="m">'+esc(shortLine(p))+(p.status==="Live"&&p.startOn==="date"&&p.starts>TODAY?". Works from "+ld(p.starts):"")+'</div></div><span class="m">'+p.used+" used"+(p.total?" of "+p.total:"")+'</span><span class="chip '+c+'">'+p.status+'</span><div class="acts"><button class="btn sm" data-act="ypcopy" data-id="'+p.code+'">Copy code</button></div>';
      return r+'</div>'}).join("")+'</section>';
    h+='<section class="card"><div class="ch"><h3>Messages to customers</h3><span class="m">What customers get by text</span></div><div class="t">Payment link</div><div class="m">Sent when a team member texts a link from the POS or a session.</div><div class="two" style="margin-top:10px"><div><label class="k" for="yMsg">Message</label><textarea class="fld" id="yMsg" rows="4" style="margin-top:4px">'+esc(G.payMsgDraft)+'</textarea><div class="m" style="margin-top:4px">You can use {First name}, {Gym name}, {Item}, {Amount} and {Link}.</div><div id="yMsgBad"'+(bad?"":" hidden")+' class="warnbox" style="margin-top:6px;background:var(--err-soft);border-color:var(--err-line);color:var(--err)">The link is missing. Add {Link} so the customer can pay.</div><div class="acts" style="margin-top:10px"><button class="btn sm hl" id="yMsgSave" data-act="ysavemsg"'+(bad?" disabled":"")+'>Save</button><button class="btn sm quiet" data-act="yresetmsg">Reset to the default</button></div></div><div><div class="k">Preview</div><div class="msg l" style="margin-top:6px;max-width:100%"><div class="bub" id="yPv">'+esc(preview())+'</div><div class="meta">Text from '+G.num+'</div></div></div></div></section>';
    h+='<div class="infobox"><b>Moved out of Payments.</b> Member access and Billing accounts now live on each person\'s Contact Record, under Packages and credits and Household. <button class="link" data-act="go" data-id="crm">Open contacts</button></div></div>';
    return h;
  }

  M.pages.payments={
    title:"Payments",
    tabs:function(){var n=needList().length; return [["overview","Overview",n||""],["reports","Reports"],["subs","Subscriptions"],["setup","Setup"]]},
    top:function(){return ["pos","Take payment"]},
    render:function(r){
      sync(); var tab=r.tab||"overview"; if(tab!=="setup") st.promo=null;
      return '<p class="sub">What needs attention, what came in, and how payments are set up. Prices and what you sell are in <button class="link" data-act="go" data-id="services">Services and packages</button>.</p>'+(tab==="overview"?overview():(tab==="reports"?reports():(tab==="subs"?subsTab():setup())));
    },
    after:function(){ if(st.focusGoal){st.focusGoal=false; var g=$("ygoalcard"); if(g){g.scrollIntoView({block:"center"}); $("yGoal").focus()}} },
    brief:function(r){
      sync(); var need=needList(), m=monthRows(), paid=sum(m,"paid"), S=subs();
      var items=need.map(function(n){return '<b>'+n.kind+".</b> "+esc(n.text)});
      items.push("<b>This month.</b> "+usd(paid)+" in so far"+(G.goal?", "+Math.min(100,Math.round(paid/G.goal*100))+"% of your "+usd(G.goal)+" goal.":"."));
      items.push("<b>Subscriptions.</b> "+S.filter(function(s){return s.state==="Active"}).length+" active, "+S.filter(function(s){return s.state==="Trial"}).length+" on a trial, "+S.filter(function(s){return s.state==="Paused"}).length+" paused.");
      return {hd:need.length?M.plural(need.length,"thing needs","things need")+" attention in Payments.":"Nothing needs attention in Payments.",items:items,hint:"Ask Milton about payments",sugg:["What failed this month?","Who brought in the most?","Show last month"]};
    },
    ask:function(q){
      if(/fail/i.test(q)){st.view="tx"; st.failed=true; st.range="month"; st.from=RANGES.month[1]; st.to=TODAY; M.go({page:"payments",tab:"reports"}); var f=T.filter(function(t){return t.fail}); M.say(q,f.length?M.plural(f.length,"payment")+" failed this month: "+f.map(function(t){return name(t.pid)+", "+t.item+", "+usd(t.price)}).join("; ")+". I opened Reports on the failed ones.":"No payments failed this month."); return true}
      if(/most|team/i.test(q)){st.view="team"; M.go({page:"payments",tab:"reports"}); var g=groups("tm"), best=g.o.filter(function(k){return k!=="No team member"}).sort(function(a,b){return sum(g.m[b],"paid")+sum(g.m[b],"cred")-sum(g.m[a],"paid")-sum(g.m[a],"cred")})[0]; M.say(q,best?best+" delivered the most in this range: "+usd(sum(g.m[best],"paid"))+" paid and "+usd(sum(g.m[best],"cred"))+" in credits used. I opened By team member.":"No payments in this range."); return true}
      if(/last month/i.test(q)){st.range="last"; st.from=RANGES.last[1]; st.to=RANGES.last[2]; st.view="tx"; st.failed=false; M.go({page:"payments",tab:"reports"}); M.say(q,"October brought in "+usd(sum(RT(),"paid"))+" across "+sales(RT())+" payments. I set Reports to last month."); return true}
      return false;
    }
  };

  var A=M.acts;
  function re(msg){M.render(); if(msg) M.toast(msg)}
  function findSub(key){var a=key.split(":"), p=M.person(a[0]); return {p:p,pl:p.plans.filter(function(x){return x.id===a[1]})[0]}}
  A.ygoto=function(id){var a=id.split(":"); if(a[1]==="goal") st.focusGoal=true; else if(a[1]) st.view=a[1]; st.promo=null; M.go({page:"payments",tab:a[0]})};
  A.yneed=function(id){
    var a=id.split("|"), k=a[0].split(":"), p;
    if(k[0]==="f"){ if(a[1]==="msg") return A.inboxp(k[1]); return M.pos.open({cust:k[1],item:"nut"}) }
    if(k[0]==="a"){var n=noAccess.filter(function(x){return x.id===k[1]})[0]; p=M.person(n.pid); noAccess=noAccess.filter(function(x){return x!==n}); p.plans.push({id:"dp"+Date.now(),name:n.item,kind:"Pack",service:"Open gym",price:usd(n.amt),amt:n.amt,size:1,open:1,booked:0,used:0,when:"Bought Nov 12, good for 30 days"}); p.thread.push({k:"event",day:"Today",t:"just now",body:n.item+" added by "+M.you().name+". Nothing was charged."}); return re(n.item+" added to "+p.first+"'s record. Nothing was charged.")}
    p=M.person(k[1]); var l=p.links.filter(function(x){return x.id===k[2]})[0];
    if(a[1]==="resend"){l.meta="Payment link sent again today. Not paid yet. Expires Nov 23."; p.thread.push({k:"auto",src:"Payment link",name:l.text,ch:"Text",day:"Today",t:"just now",body:G.payMsg.replace("{First name}",p.first).replace("{Amount}",(l.text.match(/\$[\d.,]+/)||[""])[0]).replace("{Item}",l.text.replace(/, \$.*/,"")).replace("{Gym name}",G.name).replace("{Link}","pay.northlinestrength.com/x7Kq")}); return re("Payment link sent again. Prototype only, nothing was sent.")}
    p.links=p.links.filter(function(x){return x!==l}); p.thread.push({k:"event",day:"Today",t:"just now",body:"Checkout canceled by "+M.you().name+": "+l.text}); re("Checkout canceled. Nothing was charged.");
  };
  A.ypayfail=function(id){M.pos.open({cust:id,item:"nut"})};
  A.yview=function(id){st.view=id; st.open=null; st.refund=null; M.render()};
  A.yrangeopen=function(){st.rangeOpen=!st.rangeOpen; M.render()};
  A.yrange=function(id){st.range=id; st.from=RANGES[id][1]; st.to=RANGES[id][2]; st.rangeOpen=false; st.open=null; M.render()};
  A.yrangeapply=function(){var a=$("yFrom").value, b=$("yTo").value; if(!a||!b) return M.toast("Pick both dates."); if(b<a) return M.toast("The end date is before the start date."); st.range="custom"; st.from=a; st.to=b; st.rangeOpen=false; st.open=null; M.render()};
  A.yshowf=function(){st.showF=!st.showF; M.render()};
  A.yclearf=function(){st.f={meth:"",tm:"",src:""}; M.render()};
  A.yby=function(id){st.by=id; M.render()};
  A.yfailed=function(id){st.failed=id==="1"; st.open=null; M.render()};
  A.ydetail=function(id){st.open=st.open===id?null:id; st.refund=null; M.render()};
  A.yrefund=function(id){ if(!id) return M.closePanel(); st.refund=id; st.referr=""; M.openPanel("yrefp")};
  M.panels.yrefp=function(){
    var t=T.filter(function(x){return x.id===st.refund})[0]; if(!t) return ""; var p=M.person(t.pid), how=t.meth==="Card"?"the card":t.meth.toLowerCase();
    return '<div class="sph"><div><h3>Refund</h3><div class="m">'+esc(t.item)+", "+esc(name(t.pid))+'</div></div>'+M.px+'</div><div class="spb"><dl class="vrows"><div><dt>Paid</dt><dd>'+usd(t.paid)+" by "+esc(t.meth.toLowerCase())+'</dd></div>'+(t.refunded?'<div><dt>Already refunded</dt><dd>'+usd(t.refunded)+'</dd></div>':"")+'<div><dt>Left to refund</dt><dd>'+usd(left(t))+'</dd></div></dl><div class="field"><label for="yRefAmt">Refund amount</label><input id="yRefAmt" inputmode="decimal" style="max-width:160px" value="'+left(t).toFixed(2)+'" autofocus></div><div class="field"><label for="yRefNote">Note (optional)</label><input id="yRefNote" placeholder="Why it was refunded"></div>'+(st.referr?'<div class="m" role="alert" style="color:var(--err);font-weight:600">'+st.referr+'</div>':"")+'<div class="m">The money goes back the way '+esc(p?p.first:"the customer")+' paid, to '+esc(how)+'. It shows as its own row dated today.</div></div><div class="spf"><button class="btn pri" data-act="yrefundgo" data-id="'+t.id+'">Review refund</button><button class="btn" data-act="pclose">Keep the payment</button></div>';
  };
  A.yrefundgo=function(id){
    var t=T.filter(function(x){return x.id===id})[0], v=r2(parseFloat($("yRefAmt").value.replace(/[$,\s]/g,""))), note=$("yRefNote").value.trim(), p=M.person(t.pid);
    if(!(v>0)){st.referr="Enter an amount above zero."; return M.renderPanel()}
    if(v>left(t)){st.referr="That is more than what is left to refund, "+usd(left(t))+"."; return M.renderPanel()}
    st.referr=""; var al=document.querySelector("#spanel [role=alert]"); if(al) al.remove();
    M.confirm({title:"Refund "+usd(v)+" to "+name(t.pid)+"?",body:"The money goes back to "+(t.meth==="Card"?"the card":t.meth.toLowerCase())+" they paid with. A refund cannot be undone.",no:"Keep the payment",yes:"Refund "+usd(v),run:function(){
      t.refunded=r2(t.refunded+v); t.status=left(t)<=0?"Refunded":"Partly refunded";
      T.unshift(row(TODAY,t.pid,"Refund: "+t.item,t.tm,t.sold,t.src,-v,0,0,0,0,t.meth,{ref:t.id,status:"Refund"}));
      if(p){var x=["Nov 20","Refund: "+t.item,t.meth,"-"+usd(v)]; x._l=true; p.tx.unshift(x); p.thread.push({k:"event",day:"Today",t:"just now",body:M.you().name+" refunded "+usd(v)+" for "+t.item+(note?". "+note:".")})}
      st.refund=null; M.closePanel(); re("Refunded "+usd(v)+" to "+name(t.pid)+". It shows as its own row dated today.")}});
  };
  A.yprint=function(){try{window.print()}catch(e){} M.toast("Prints the view on screen, with the date range and filters applied.")};
  A.ydownload=function(){
    var c=csvOut(); if(!c.n) return M.toast("Nothing to download for this date range.");
    try{var a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([c.text],{type:"text/csv"})); a.download=c.name; document.body.appendChild(a); a.click(); a.remove()}catch(e){}
    M.toast("Downloaded "+c.name+" with "+M.plural(c.n,"row")+".");
  };
  A.ymanage=function(id){ if(!id) return M.closePanel(); var x=findSub(id); st.manage=id; st.reason={key:id,kind:x.pl.state==="Paused"?"Cancel":"Pause"}; M.openPanel("ysubp")};
  A.yask=function(id){if(!id) return M.closePanel(); var a=id.split("|"); st.manage=a[0]; st.reason={key:a[0],kind:a[1]}; if(M.panel&&M.panel.name==="ysubp") M.renderPanel(); else M.openPanel("ysubp")};
  M.panels.ysubp=function(){
    var x=findSub(st.manage); if(!x.pl) return ""; var p=x.p, pl=x.pl, kind=pl.kind.toLowerCase(), k=st.reason.kind, paused=pl.state==="Paused";
    return '<div class="sph"><div><h3>'+esc(p.first)+"'s "+kind+'</h3><div class="m">'+esc(pl.name)+", "+usd(pl.amt)+'</div></div>'+M.px+'</div><div class="spb">'+(paused?'<div class="infobox">Paused'+(pl.reason?". Reason: "+esc(String(pl.reason).toLowerCase()):"")+'. No charges until it resumes.</div><div><button class="btn" data-act="yresume" data-id="'+st.manage+'">Resume now</button></div><div class="k" style="margin-top:6px">Or cancel it</div>':'<div class="field"><label>What do you want to do?</label><div class="seg">'+["Pause","Cancel"].map(function(o){return '<button data-act="yask" data-id="'+st.manage+"|"+o+'" aria-pressed="'+(k===o)+'">'+o+'</button>'}).join("")+'</div></div>')
      +'<div class="field"><label for="yWhy">Reason to '+k.toLowerCase()+'</label><select id="yWhy">'+WHY[k].map(function(o){return '<option>'+o+'</option>'}).join("")+'</select></div><div class="field"><label for="yNote">Note (optional)</label><input id="yNote"></div><div class="m">'+(k==="Pause"?"No charges while it is paused. "+esc(p.first)+" keeps what is already paid for.":"Nothing more is charged. "+esc(p.first)+" keeps access through what is already paid for.")+'</div></div><div class="spf"><button class="btn pri" data-act="yconfirm">Review '+(k==="Pause"?"pause":"cancellation")+'</button><button class="btn" data-act="pclose">Keep it</button></div>';
  };
  A.yconfirm=function(){
    var s2=findSub(st.reason.key), p=s2.p, pl=s2.pl, why=$("yWhy").value, note=$("yNote").value.trim(), kind=pl.kind.toLowerCase(), k=st.reason.kind;
    M.confirm({title:k+" "+p.first+"'s "+kind+"?",body:k==="Pause"?pl.name+" stops charging until you resume it. Reason: "+why.toLowerCase()+".":pl.name+" ends and nothing more is charged. To bring it back you would sell it again. Reason: "+why.toLowerCase()+".",no:"Keep it",yes:k==="Pause"?"Pause it":"Cancel it",run:function(){
      st.reason=null; st.manage=null; M.closePanel();
      if(k==="Pause"){pl.state="Paused"; pl.reason=why; pl.note=note; pl.failed=null; p.thread.push({k:"event",day:"Today",t:"just now",body:M.you().name+" paused "+pl.name+". Reason: "+why.toLowerCase()+(note?". "+note:"")}); return re(p.name+"'s "+kind+" is paused. No charges until it resumes.")}
      p.plans=p.plans.filter(function(x){return x!==pl}); p.past.unshift([pl.name,sd(pl.start)+" to "+sd(TODAY),"Canceled"]);
      canceled.push({key:"x"+Date.now(),p:p,pl:pl,state:"Canceled",reason:why});
      p.thread.push({k:"event",day:"Today",t:"just now",body:M.you().name+" canceled "+pl.name+". Reason: "+why.toLowerCase()+(note?". "+note:"")});
      re(p.name+"'s "+kind+" is canceled. Nothing more will be charged.")}});
  };
  A.yresume=function(id){M.closePanel(); st.manage=null; st.reason=null; var s=findSub(id); s.pl.state=null; s.pl.reason=null; s.pl.next="2026-12-20"; s.p.thread.push({k:"event",day:"Today",t:"just now",body:M.you().name+" resumed "+s.pl.name+". Next charge Dec 20."}); re(s.p.name+"'s "+s.pl.kind.toLowerCase()+" is active again. Next charge Dec 20.")};
  A.yrefresh=function(){st.checked="just now"; re("Status checked just now. Payments are live.")};
  A.ysavegoal=function(){var v=parseFloat($("yGoal").value.replace(/[$,\s]/g,"")); if(!(v>0)) return M.toast("Enter an amount above zero, like 25,000."); G.goal=v; re("Monthly goal saved: "+usd(v)+".")};
  A.ycleargoal=function(){G.goal=0; re("Monthly goal removed.")};
  A.ysavemsg=function(){ if(G.payMsgDraft.indexOf("{Link}")<0) return; G.payMsg=G.payMsgDraft; M.toast("Saved. New payment link texts use this wording.")};
  A.yresetmsg=function(){G.payMsgDraft=G.payMsg=msgDefault; re("Back to the default wording.")};
  function top(){window.scrollTo(0,0)}
  A.ypnew=function(){st.promo=blank(); st.pq=""; M.render(); top(); $("ypcode").focus()};
  A.ypedit=function(id){st.promo=JSON.parse(JSON.stringify(promos.filter(function(x){return x.id===id})[0])); st.pq=""; st.pend=null; M.render(); top()};
  A.ypcancel=function(){st.promo=null; M.render()};
  A.yptype=function(id){st.promo.type=id; M.render()};
  A.ypopt=function(id){var a=id.split(":"); st.promo[a[0]]=a[1]; M.render()};
  A.ypsvc=function(id){var sv=SV.filter(function(v){return v.name===id})[0], d=st.promo, all=sv.pk.every(function(p){return d.picked[p.id]}); sv.pk.forEach(function(p){ if(all) delete d.picked[p.id]; else d.picked[p.id]=true }); M.render()};
  function psave(live){
    var d=st.promo, pr=problems(d);
    if(live&&pr.length){var td=$("ytodo"); if(td) td.scrollIntoView({block:"center"}); return M.toast("Not saved yet. "+pr[0])}
    if(!live&&!d.code.trim()) return M.toast("Add a promo code to save a draft.");
    d.status=live?"Live":"Draft";
    if(d.id) promos=promos.map(function(x){return x.id===d.id?d:x}); else {d.id="p"+Date.now(); promos.unshift(d)}
    st.promo=null; re(d.code+(live?" is live. Customers can use it at checkout "+(d.startOn==="date"&&d.starts>TODAY?"from "+ld(d.starts)+".":"now."):" saved as a draft."));
  }
  A.yplive=function(){psave(true)}; A.ypdraft=function(){psave(false)};
  A.ypend2=function(id){var p=promos.filter(function(x){return x.id===id})[0]; M.confirm({title:"End "+p.code+"?",body:"It stops working at new checkouts. Anyone already getting it on every renewal keeps their discount for as long as their membership runs.",no:"Keep it live",yes:"End code",run:function(){st.promo=null; A.ypendgo(id)}})};
  A.ypend=function(id){st.pend=id||null; M.render()};
  A.ypendgo=function(id){var p=promos.filter(function(x){return x.id===id})[0]; p.status="Ended"; st.pend=null; re(p.code+" has ended. It no longer works at new checkouts.")};
  A.ypgo=function(id){var p=promos.filter(function(x){return x.id===id})[0], pr=problems(p); if(pr.length) return M.toast("Open it to finish first. "+pr[0]); p.status="Live"; re(p.code+" is live.")};
  A.ypcopy=function(id){try{navigator.clipboard.writeText(id).then(function(){M.toast("Copied "+id)},function(){M.toast(id)})}catch(e){M.toast(id)}};

  M.changes.push(function(el){
    if(M.route.page!=="payments") return;
    var yf=el.dataset&&el.dataset.yf; if(yf){st.f[yf]=el.value; st.open=null; return M.render()}
    var f=el.dataset&&el.dataset.yp, d=st.promo; if(!f||!d) return;
    if(f==="pick"){ if(el.checked) d.picked[el.dataset.id]=true; else delete d.picked[el.dataset.id] }
    else if(f==="newOnly") d.newOnly=el.checked;
    else if(el.type==="date") d[f]=el.value;
    else return;
    var y=window.scrollY; M.render(); window.scrollTo(0,y);
  });
  M.inputs.push(function(el){
    if(M.route.page!=="payments") return;
    var f=el.dataset&&el.dataset.yp, d=st.promo;
    if(d&&f&&el.type!=="checkbox"&&el.type!=="date"){
      var v=el.value;
      if(f==="code"){v=v.toUpperCase().replace(/\s+/g,""); if(v!==el.value){var c=el.selectionStart; el.value=v; try{el.setSelectionRange(c,c)}catch(x){}}}
      if(f==="total"||f==="per"){v=v.replace(/[^0-9]/g,""); if(v!==el.value) el.value=v}
      d[f]=v; $("yside").innerHTML=sideHTML(d); return;
    }
    if(el.id==="ypq"){st.pq=el.value; $("yplist").innerHTML=pickHTML(st.promo); return}
    if(el.id==="yq"&&$("ytx")){st.q=el.value; $("ytx").innerHTML=txTable(); return}
    if(el.id==="yMsg"){G.payMsgDraft=el.value; var bad=el.value.indexOf("{Link}")<0; $("yMsgBad").hidden=!bad; $("yMsgSave").disabled=bad; $("yPv").textContent=preview()}
  });
})();
