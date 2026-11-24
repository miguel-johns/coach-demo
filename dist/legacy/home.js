/* Home: the eleven cards. Tier numbers and dashboards are left out on purpose for now. */
(function(){
  var I = function(d){return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+d+'</svg>'};
  var CARDS = [
    {id:"clients", nm:"Clients", ds:"Everyone assigned to a coach", ic:I('<circle cx="9" cy="8" r="3.2"/><path d="M3 19c.6-3 2.9-4.6 6-4.6s5.4 1.6 6 4.6"/><circle cx="17" cy="9" r="2.4"/><path d="M16.5 14.5c2.400 .2 3.900 1.500 4.500 3.700"/>'), src:"the Client Profile design and spec"},
    {id:"inbox", nm:"Inbox", ds:"Every message and call, one conversation per person", ic:I('<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3.500 7.500 12 13l8.500-5.500"/>'), src:"the Inbox design and spec"},
    {id:"studio", nm:"Studio", ds:"Reports, stories and guides for your clients", ic:I('<path d="M11 4l1.800 4.700L17.500 10.500l-4.700 1.800L11 17l-1.800-4.700L4.500 10.500l4.700-1.800z"/><path d="M18.500 15v4M16.500 17h4M18 3.500v3M16.500 5h3"/>'), src:"Milton Studio in the Home flow"},
    {id:"workouts", nm:"Workout Builder", ds:"Write and assign training programs", ic:I('<path d="M4 20V10M10 20V4M16 20v-7M21 20H3"/>'), src:"the live Workout Builder"},
    {id:"services", nm:"Services & Packages", ds:"What you deliver, and what you sell for it", ic:I('<path d="M12 3 3 7.500l9 4.500 9-4.500L12 3Z"/><path d="m3 12 9 4.500 9-4.500M3 16.500 12 21l9-4.500"/>'), src:"the live editor, Payments Designs and the one-page service editing decision"},
    {id:"schedule", nm:"Schedule", ds:"Sessions, check-in and booking", ic:I('<rect x="3.500" y="5" width="17" height="15" rx="2.500"/><path d="M8 3v4M16 3v4M3.500 10h17"/>'), src:"the Session Panel and Scheduling designs"},
    {id:"customize", nm:"Customize Milton", ds:"Teach Milton your method", ic:I('<path d="m12 3 2.700 5.600 6.100.800-4.500 4.300 1.100 6.100L12 16.900l-5.400 2.900 1.100-6.100L3.200 9.400l6.100-.800L12 3Z"/>'), src:"the live Customize Milton page"},
    {id:"payments", nm:"Payments", ds:"Money in, reports and subscriptions", ic:I('<rect x="3" y="5.500" width="18" height="13" rx="2.500"/><path d="M3 10h18M7 15h3"/>'), src:"the Payments Four Tabs design and spec"},
    {id:"crm", nm:"CRM", ds:"Contacts, pipeline, funnels and workflows", ic:I('<rect x="4" y="3.500" width="16" height="17" rx="2.500"/><circle cx="12" cy="10" r="2.600"/><path d="M7.500 17c.700-2 2.300-3 4.500-3s3.800 1 4.500 3"/>')},
    {id:"library", nm:"Library", ds:"Your exercises and demo videos", ic:I('<path d="M5 4h4v16H5zM10.500 4h4v16h-4zM16.500 6.500l3.500-1 3 13.500-3.500 1z" transform="translate(-1.500 0)"/>'), src:"the live Library, without its demo tabs"},
    {id:"team", nm:"Team", ds:"People, roles and access", ic:I('<circle cx="9" cy="8" r="3.200"/><path d="M3 19c.600-3 2.900-4.600 6-4.600 1.400 0 2.600.300 3.600 1"/><circle cx="17.500" cy="16.500" r="2.200"/><path d="M17.500 12.800v1.200M17.500 19v1.200M13.800 16.500H15M20 16.500h1.200"/>'), src:"the Team Card design and spec"}
  ];
  M.cards = CARDS;
  /* the order of the cards. One default for everyone, and each person can arrange their own. */
  var DEF=["schedule","inbox","crm","clients","studio","workouts","services","payments","team","library","customize"], order=DEF.slice(), arr=false, drag=null;
  try{var sv=JSON.parse(localStorage.getItem("milton.home.order")||"null"); if(sv&&sv.length===DEF.length&&DEF.every(function(k){return sv.indexOf(k)>=0})) order=sv}catch(e){}
  function keep(){try{localStorage.setItem("milton.home.order",JSON.stringify(order))}catch(e){}}
  function sorted(){return order.map(function(id){return CARDS.filter(function(k){return k.id===id})[0]}).filter(Boolean)}
  /* which cards a person sees. Admins see all of them. Everyone else starts from their role and an Admin can change it. */
  var ROLE={Manager:["schedule","inbox","crm","clients","studio","workouts","services","payments","library"],Coach:["schedule","inbox","clients","studio","workouts","library"]};
  function cardsOf(t){return t.role==="Admin"?DEF.slice():(t.cards||ROLE[t.role]||DEF).slice()}
  function shows(t,id){return cardsOf(t).indexOf(id)>=0}
  M.home={DEF:DEF,ROLE:ROLE,cards:CARDS,sorted:sorted,cardsOf:cardsOf,shows:shows,isDef:function(){return isDef()},arrange:function(on){arr=on}};
  function isDef(){return order.join()===DEF.join()}
  function move(id,to){var i=order.indexOf(id); if(i<0||to<0||to>=order.length||to===i) return; order.splice(i,1); order.splice(to,0,id); keep()}
  M.acts.hmove=function(id){var a=id.split("|"); move(a[0],order.indexOf(a[0])+(+a[1])); M.render(); var b=document.querySelector('[data-hc="'+a[0]+'"] [data-id="'+id+'"]'); if(b&&!b.disabled) b.focus()};
  M.acts.hreset=function(){var was=order.slice(); order=DEF.slice(); keep(); M.render(); M.toast("Back to the default order.",function(){order=was; keep(); M.render()})};
  document.addEventListener("dragstart",function(e){var c=e.target.closest&&e.target.closest("[data-hc]"); if(!c) return; drag=c.dataset.hc; c.classList.add("hc-drag"); try{e.dataTransfer.effectAllowed="move"; e.dataTransfer.setData("text/plain",drag)}catch(x){}});
  document.addEventListener("dragover",function(e){if(!drag) return; var c=e.target.closest&&e.target.closest("[data-hc]"); if(!c) return; e.preventDefault(); document.querySelectorAll(".hc-over").forEach(function(x){x.classList.remove("hc-over")}); if(c.dataset.hc!==drag) c.classList.add("hc-over")});
  document.addEventListener("drop",function(e){if(!drag) return; var c=e.target.closest&&e.target.closest("[data-hc]"); e.preventDefault(); if(c&&c.dataset.hc!==drag) move(drag,order.indexOf(c.dataset.hc)); drag=null; M.render()});
  document.addEventListener("dragend",function(){if(drag){drag=null; M.render()}});
  function counts(){
    var ps=M.people(), today=0, reply=0, milton=0, leads=0;
    ps.forEach(function(p){
      today+=p.appts.filter(function(a){return a.today}).length;
      var last=p.thread.filter(function(i){return i.k!=="event"&&i.k!=="note"&&i.k!=="auto"}).slice(-1)[0];
      if(p.milton||p.miltonBooked) milton++;
      else if(last&&(last.k==="in"||(last.k==="call"&&last.dir==="missed"))) reply++;
      if(M.status(p)==="Lead"&&!M.dupOf(p.id)||(M.status(p)==="Lead"&&M.dupOf(p.id)&&M.dupOf(p.id).keep===p.id)) leads++;
    });
    if(M.conv){reply=M.conv.needList().length}
    return {today:today,reply:reply,milton:milton,leads:leads,clients:ps.filter(function(p){return p.coach}).length};
  }
  M.counts = counts;
  M.pages.home = {
    title:"Home",
    render:function(){
      var c=counts(), badge={clients:c.clients+" clients",inbox:c.reply?c.reply+" need a reply":"",schedule:c.today+" today",crm:c.leads+" leads",studio:M.studio&&M.studio.ready()?M.studio.ready()+" ready":""};
      var L=sorted().filter(function(k){return shows(M.you(),k.id)});
      return '<p class="sub">'+DB.GYM.name+'. Everything you run, one click away.</p>'+(L.length?"":'<div class="card"><div class="empty"><span><b>No cards yet</b><br>An Admin at '+DB.GYM.name+' chooses which cards you see.</span></div></div>')+'<div class="cards">'+L.map(function(k){
        return '<button class="hcard hc-'+({clients:"people",crm:"people",team:"people",workouts:"train",library:"train",payments:"money",services:"money",customize:"milton"}[k.id]||"day")+'" data-act="go" data-id="'+k.id+'"><span class="tile">'+k.ic+'</span><span class="nm">'+k.nm+(badge[k.id]?'<span class="chip mist">'+badge[k.id]+'</span>':'')+'</span><span class="ds">'+k.ds+'</span></button>';
      }).join("")+'</div>';
    },
    brief:function(){
      var c=counts();
      return {hd:M.plural(c.today,"session")+" today. "+M.plural(c.reply,"person","people")+" "+(c.reply===1?"is":"are")+" waiting on a reply.",
        items:[
          '<b>Needs a reply.</b> '+M.conv.needList().map(function(p){return '<button class="link" data-act="inboxp" data-id="'+p.id+'">'+M.esc(p.name)+'</button>'}).join(", ")+'.',
          '<b>Money.</b> Marcus has $95.00 due at his massage on Tue, Nov 24. A $25.00 payment link to Dana expires Sunday.',
          '<b>New leads.</b> <button class="link" data-act="record" data-id="jordan">Jordan Ellis</button> came in at 7:44 AM. I am handling '+c.milton+' more.',
          '<b>Today.</b> Devon Marsh at 4:00 PM with Andre. Dana Whitfield at 6:30 PM in Room B.'
        ],
        hint:"Ask Milton about your gym", sugg:["Who needs a reply?","Call my new leads"]};
    },
    ask:function(q){
      if(/lead/i.test(q)){M.go({page:"crm",tab:"pipeline"}); M.say(q,"I opened the Pipeline. Jordan Ellis is new, and I am texting Priya Raman. Sam Okafor is booked for Saturday."); return true}
      return false;
    }
  };
  /* Areas that are next in line. Each says what it will be built from. */
  CARDS.forEach(function(k){
    if(k.id==="crm") return;
    M.pages[k.id]={title:k.nm, top:(k.id==="payments"||k.id==="services")?function(){return ["pos","Take payment"]}:null,
      render:function(){return '<div class="card bigempty"><h3 class="h3">'+k.nm+' is next in this prototype</h3><p>This area is not built yet. It will be built from '+k.src+', in the same frame, with the same example people.</p><button class="btn" data-act="go" data-id="home">Back to Home</button></div>'},
      brief:function(){return {hd:k.nm+" is not built in this prototype yet.",items:["The frame, Home and the CRM are built. This area comes next."],hint:"Ask Milton about "+k.nm.toLowerCase()}}
    };
  });
})();
