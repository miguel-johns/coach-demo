/* CRM: Contacts list, Pipeline, Funnels, Workflows, Documents, Settings.
   Contacts follows the Contacts List design and spec. Pipeline, Funnels and Workflows follow the live CRM. */
(function(){
  var esc=M.esc, $=M.$;
  var st={sel:{},sort:{key:"added",dir:-1},filter:"All",nocoach:false,q:"",menu:false,pmenu:null,psrc:"All sources",fid:null,wid:null,wtab:"mine",wstat:"All statuses",wq:"",wview:"steps",fmenu:false,range:"30 days",imp:null};
  var ORDER={Lead:0,Customer:1,"Past customer":2};
  var LANES=[["New","Just came in. Nobody has reached out yet."],["In conversation","Milton or your team is messaging them."],["Booked","A first session is on the schedule."],["Came in","Came in or bought a one-time pass. Not paying for a package yet."],["Joined","Paying for a package."],["Not now","Not interested for now."]];
  var HAND=["New","In conversation","Not now"];

  function list(){return M.people()}
  function pairs(){return DB.dups.filter(function(d){return M.person(d.keep)&&M.person(d.drop)})}
  function shown(){
    var q=st.q.toLowerCase(), k=st.sort.key, d=st.sort.dir;
    var rows=list().filter(function(c){
      if(st.filter!=="All" && M.status(c)!==st.filter) return false;
      if(st.nocoach && c.coach) return false;
      if(q && (c.name+" "+c.email+" "+c.phone).toLowerCase().indexOf(q)<0) return false;
      return true;
    });
    var val=function(c){return k==="name"?c.name.toLowerCase():(k==="status"?ORDER[M.status(c)]:(k==="coach"?(c.coach?c.coach.toLowerCase():"￿"):c.added))};
    return rows.map(function(c,i){return [c,i]}).sort(function(x,y){var a=val(x[0]),b=val(y[0]);return a<b?-d:(a>b?d:x[1]-y[1])}).map(function(x){return x[0]});
  }
  function selIds(){return Object.keys(st.sel).filter(function(id){return st.sel[id]&&M.person(id)})}
  function th(key,label,inner){
    var on=st.sort.key===key;
    return '<th aria-sort="'+(on?(st.sort.dir>0?"ascending":"descending"):"none")+'">'+(inner||"")+'<button class="sortb" data-act="csort" data-id="'+key+'">'+label+'<span aria-hidden="true">'+(on?(st.sort.dir>0?"▲":"▼"):"↕")+'</span></button></th>';
  }
  function rowsHTML(){
    var rows=shown(), sel=selIds(), h="", dash='<span class="m">None</span>';
    if(sel.length) h+='<div class="bulk"><b>'+sel.length+' selected</b><select class="csel" id="bulkCoach" aria-label="Assign a coach to the selected people"><option value="">Assign coach</option>'+M.coachOpts("")+'<option value="__none">No coach</option></select><button class="btn sm" data-act="bulktag">Add tag</button><button class="btn sm" data-act="bulkmsg">Message</button><button class="btn sm quiet" data-act="clearsel">Clear</button></div>';
    if(!rows.length) return h+'<div class="none">'+(st.q?"No one matches that search.":"No one in this group yet.")+'</div>';
    var allOn=rows.every(function(c){return st.sel[c.id]}), stg=DB.stages.length;
    return h+'<div class="tw"><table class="pin"><thead><tr>'+th("name","Name",'<span class="nmc" style="display:inline-flex;margin-right:10px"><input type="checkbox" class="pick" id="pickAll" aria-label="Select everyone shown"'+(allOn?" checked":"")+'></span>')+th("status","Status")+th("coach","Coach")+(stg?'<th>Stage</th>':"")+'<th>Phone</th><th>Email</th><th>Tags</th><th>Source</th>'+th("added","Added")+'<th>Reach</th></tr></thead><tbody>'
      +rows.map(function(c){
        var s=M.status(c);
        return '<tr class="go'+(st.sel[c.id]?" on":"")+'" data-act="record" data-id="'+c.id+'"><td><div class="nmc"><input type="checkbox" class="pick" data-id="'+c.id+'" aria-label="Select '+esc(c.name)+'"'+(st.sel[c.id]?" checked":"")+'><span class="av">'+c.initials+'</span><b>'+esc(c.name)+'</b>'+(M.dupOf(c.id)?'<button class="chip warn" data-act="cfilter" data-id="dup">Possible duplicate</button>':"")+'</div></td>'
          +'<td><button class="lab" data-act="statusp" data-id="'+c.id+'" title="Change status">'+M.statusChip(s)+(c.manual?'<span class="hand">Set by hand</span>':"")+'</button></td>'
          +'<td><select class="csel coachsel" data-id="'+c.id+'" aria-label="Coach for '+esc(c.name)+'"><option value="">None</option>'+M.coachOpts(c.coach)+'</select></td>'
          +(stg?'<td>'+(c.custom?'<span class="chip">'+esc(c.custom)+'</span>':dash)+'</td>':"")
          +'<td class="m">'+(c.phone&&!c.unnamed?c.phone:(c.unnamed?c.phone:dash))+'</td><td class="m">'+(c.email?esc(c.email):dash)+'</td>'
          +'<td>'+(c.tags.length?c.tags.map(function(t){return '<span class="chip'+(t==="No texts"||t==="Unsaved number"?" warn":"")+'">'+esc(t)+'</span>'}).join(" "):dash)+'</td>'
          +'<td class="m">'+esc(c.source)+'</td><td class="m num">'+M.fd(c.added)+'</td>'
          +'<td><div class="ract">'+(c.phone?'<button class="btn sm'+(s==="Lead"?"":" quiet")+'" data-act="callp" data-id="'+c.id+'">Call</button>':"")+'<button class="btn sm quiet" data-act="msgrow" data-id="'+c.id+'">Message</button></div></td></tr>';
      }).join("")+'</tbody></table></div>';
  }
  function sideHTML(c,keep){
    return '<div class="side'+(keep?" keep":"")+'"><div class="k">'+(keep?"Keeps this record":"Folds into it")+'</div><b>'+esc(c.name)+'</b><div class="m">'+M.statusChip(M.status(c))+" Added "+M.fd(c.added)+'</div><div class="m" style="margin-top:4px">'+(c.phone||"No phone")+"<br>"+esc(c.email||"No email")+'</div><div class="m" style="margin-top:4px">'+esc(c.source)+'</div></div>';
  }
  function dupHTML(){
    var h='<div class="dupnote"><span>Merging keeps the record with more history and adds anything the other one has. Sessions, payments and messages are combined. You can undo a merge for 7 days.</span><button class="link" data-act="cfilter" data-id="All">Back to everyone</button></div>';
    pairs().forEach(function(d){
      h+='<div class="pair"><div class="pairh"><span class="chip warn">'+d.why+'</span><span class="acts"><button class="btn sm" data-act="notdup" data-id="'+d.id+'">Not the same person</button><button class="btn pri sm" data-act="merge" data-id="'+d.id+'">Merge</button></span></div><div class="two">'+sideHTML(M.person(d.keep),true)+sideHTML(M.person(d.drop),false)+'</div></div>';
    });
    return h;
  }
  function contactsHTML(){
    var all=list(), nd=pairs().length;
    if(st.filter==="dup" && !nd) st.filter="All";
    var h='<p class="sub">Contacts. Everyone you know, including people who are not clients yet.</p><section class="card flush">';
    h+='<div class="tool"><div class="count">All contacts <span class="chip">'+all.length+'</span></div><div class="tr"><input class="search" id="q" type="search" placeholder="Search contacts" aria-label="Search contacts">'
      +'<span class="split"><button class="btn pri" data-act="panel" data-id="addc">+ Add contact</button><button class="btn pri" data-act="cmenu" aria-label="More ways to add contacts" aria-expanded="'+st.menu+'">&#9662;</button>'
      +(st.menu?'<span class="menu"><button data-act="panel" data-id="addc"><b>Add one person</b><span class="m">Name, phone and email</span></button><button data-act="panel" data-id="import"><b>Import a list</b><span class="m">Bring in a CSV from your old system</span></button></span>':"")
      +'</span></div></div>';
    var counts={All:all.length,Lead:0,Customer:0,"Past customer":0};
    all.forEach(function(c){counts[M.status(c)]++});
    h+='<div class="filters">'+["All","Lead","Customer","Past customer"].map(function(f){return '<button data-act="cfilter" data-id="'+f+'" aria-pressed="'+(st.filter===f)+'">'+f+' <span class="n">'+counts[f]+'</span></button>'}).join("")
      +'<span class="sep" aria-hidden="true"></span><button data-act="nocoach" aria-pressed="'+st.nocoach+'">No coach <span class="n">'+all.filter(function(c){return !c.coach}).length+'</span></button>'
      +(nd?'<button class="dupf" data-act="cfilter" data-id="dup" aria-pressed="'+(st.filter==="dup")+'">'+M.plural(nd,"possible duplicate")+'</button>':"")+'</div>';
    return h+'<div id="rows">'+(st.filter==="dup"?dupHTML():rowsHTML())+'</div></section>';
  }

  /* Pipeline */
  M.stageOf=stageOf;
  function stageOf(p){
    if(p.stage) return p.stage;
    var s=M.status(p); return s==="Customer"?"Joined":(s==="Past customer"?null:"New");
  }
  function pipelineHTML(){
    var ps=list().filter(function(p){var d=M.dupOf(p.id); return stageOf(p)&&!(d&&d.drop===p.id)&&(st.psrc==="All sources"||p.source===st.psrc)});
    var srcs=["All sources"].concat(list().map(function(p){return p.source}).filter(function(v,i,a){return a.indexOf(v)===i}));
    var mh=ps.filter(function(p){return p.milton||p.miltonBooked}).length, np=ps.filter(function(p){return stageOf(p)==="New"}).length;
    var lanes=LANES.slice(0,5).concat(DB.stages.map(function(s){return [s,"Your own stage. Moved by hand."]})).concat(LANES.slice(5));
    var h='<p class="sub">How far each new person has got, from first contact to joining.</p><div class="acts" style="margin-bottom:10px"><select class="csel" id="psrc" aria-label="Source">'+srcs.map(function(s){return '<option'+(s===st.psrc?" selected":"")+'>'+esc(s)+'</option>'}).join("")+'</select><span class="chip glow">Milton is handling '+mh+'</span><span class="chip warn">Needs a person '+np+'</span><span class="m">Move a card between the first steps or to Not now with its Move to menu. The rest move on their own.</span></div><div class="board">';
    lanes.forEach(function(L){
      var inl=ps.filter(function(p){return (p.custom||stageOf(p))===L[0]});
      h+='<div class="lane"><h3>'+L[0]+' <span class="chip">'+inl.length+'</span></h3><div class="m">'+L[1]+'</div>'+(inl.length?inl.map(function(p){
        var can=HAND.indexOf(stageOf(p))>=0||p.custom;
        return '<div class="pcard"><div class="top"><button class="link" style="font-size:15px" data-act="record" data-id="'+p.id+'">'+esc(p.name)+'</button>'+(can?'<span class="pswrap"><button class="btn sm quiet" data-act="pmove" data-id="'+p.id+'">Move to &#9662;</button>'+(st.pmenu===p.id?'<span class="menu">'+HAND.concat(DB.stages).filter(function(x){return x!==(p.custom||stageOf(p))}).map(function(x){return '<button data-act="pmoveto" data-id="'+p.id+'|'+x+'"><b>'+x+'</b></button>'}).join("")+'</span>':"")+'</span>':"")+'</div><div class="m">'+esc(p.lastTouch&&stageOf(p)!=="Joined"&&stageOf(p)!=="Booked"?p.lastTouch:(p.appts[0]?p.appts[0].title+", "+p.appts[0].day+" at "+p.appts[0].time:"Added "+M.fd(p.added)))+'</div><div class="chips">'+M.statusChip(M.status(p))+(p.milton?'<span class="chip glow">Milton is handling</span>':"")+(p.miltonBooked?'<span class="chip glow">Booked by Milton</span>':"")+'<span class="chip">'+esc(p.source)+'</span></div></div>';
      }).join(""):'<div class="m" style="text-align:center;padding:16px 0">No one here</div>')+'</div>';
    });
    return h+'</div>';
  }

  M.crmState=function(){return st};
  /* Funnels */
  var FICON={Form:"Form","Website connection":"Web","Offer link":"Link","Meta lead ads":"Ads",Studio:"Stu"};
  function funnelsHTML(){
    if(st.fid) return M.fnb.html(DB.funnels.filter(function(f){return f.id===st.fid})[0],st.range);
    var h='<p class="sub">Every way a lead or buyer gets in. Each one lands in your contacts with where they came from.</p><section class="card flush"><div class="tool"><div class="count">All funnels <span class="chip">'+DB.funnels.length+'</span></div></div><div class="tw"><table class="pin"><thead><tr><th>Funnel</th><th>Type</th><th>Status</th><th>What happens next</th><th>Last lead</th><th>Leads, 30 days</th><th>Booked</th><th>Came in</th><th>Joined</th><th>Live</th></tr></thead><tbody>';
    DB.funnels.forEach(function(f){
      h+='<tr class="go" data-act="funnel" data-id="'+f.id+'"><td><div class="nmc"><span class="av" style="border-radius:10px;font-size:11px">'+FICON[f.type]+'</span><b>'+esc(f.name)+'</b></div></td><td>'+f.type+'</td><td>'+(f.live?'<span class="chip ok">Live</span>':'<span class="chip">Off</span>')+'</td><td class="m">'+esc(f.next)+'</td><td class="m">'+f.last+'</td><td class="num">'+f.leads+'</td><td class="num">'+f.booked+'</td><td class="num">'+f.showed+'</td><td class="num">'+f.joined+'</td><td><button class="sw" role="switch" aria-checked="'+f.live+'" aria-label="'+esc(f.name)+' is live" data-act="ftoggle" data-id="'+f.id+'"></button></td></tr>';
    });
    return h+'</tbody></table></div></section>';
  }
  function funnelHTML(f){
    var h='<button class="backl" data-act="funnel" data-id="">&#8249; All funnels</button><section class="head"><div class="id"><div class="av lg" style="border-radius:14px;font-size:13px">'+FICON[f.type]+'</div><div><h2 class="name">'+esc(f.name)+'</h2><div class="chips"><span class="chip">'+f.type+'</span>'+(f.live?'<span class="chip ok">Live</span>':'<span class="chip">Draft</span>')+'</div></div></div><div class="acts"><span class="m">Live</span><button class="sw" role="switch" aria-checked="'+f.live+'" aria-label="Live" data-act="ftoggle" data-id="'+f.id+'"></button></div></section><div class="grid"><div class="col">';
    if(f.type==="Form"){
      h+='<section class="card"><div class="ch"><h3>Questions</h3><button class="btn sm" data-act="later" data-id="The form preview">Preview</button></div><div class="row"><div class="what"><div class="t">Name, mobile and email</div></div><span class="chip">Always asked</span></div>'
        +f.questions.map(function(q,i){return '<div class="row"><div class="what"><div class="t" style="font-weight:500">'+esc(q[0])+'</div><div class="m">'+q[1]+'</div></div><div class="acts"><span class="m">Required</span><button class="sw" role="switch" aria-checked="'+q[2]+'" aria-label="Required" data-act="qreq" data-id="'+i+'"></button></div></div>'}).join("")
        +'<div class="row"><button class="btn sm" data-act="qadd">+ Add a question</button></div><div class="consent" style="margin-top:8px"><span>"I agree to receive text messages about my enquiry and membership. Message and data rates may apply. Reply STOP to opt out at any time." Always shown.</span></div></section>'
        +'<section class="card"><div class="ch"><h3>Title and ending</h3></div><div class="stack" style="gap:10px"><div class="field"><label for="fTitle">Title, shown at the top of the form</label><input id="fTitle" type="text" value="'+esc(f.title)+'"></div><div class="field"><label for="fThanks">When they finish, show this message</label><input id="fThanks" type="text" value="'+esc(f.thanks)+'"></div><div class="acts"><button class="btn pri" data-act="fsave">Save form</button></div></div></section>'
        +'<section class="card"><div class="ch"><h3>Share it</h3></div><div class="row"><div class="what"><div class="t" style="font-weight:500">Link</div><div class="m">'+DB.GYM.site+'/intro</div></div><div class="acts"><button class="btn sm" data-act="copy" data-id="https://'+DB.GYM.site+'/intro">Copy link</button><button class="btn sm" data-act="later" data-id="The QR code download">QR code</button><button class="btn sm" data-act="later" data-id="The website snippet">Website snippet</button></div></div></section>';
    } else if(f.type==="Offer link"){
      h+='<section class="card"><div class="ch"><h3>The offer</h3></div><dl><div><dt>Package</dt><dd>Recovery Room 3-pack, $99.00</dd></div><div><dt>Order</dt><dd><div class="seg"><button aria-pressed="true">Pay, then book</button><button aria-pressed="false" data-act="later" data-id="Changing the checkout order">Book, then pay</button><button aria-pressed="false" data-act="later" data-id="Changing the checkout order">Book without payment</button></div></dd></div><div><dt>After they pay</dt><dd>They land on the sessions this purchase covers and pick a time. If they leave first, the confirmation email takes them back without charging again.</dd></div><div><dt>Sign step</dt><dd>Liability waiver and Recovery room agreement, after booking</dd></div></dl></section>'
        +'<section class="card"><div class="ch"><h3>Share it</h3></div><div class="row"><div class="what"><div class="t" style="font-weight:500">Link</div><div class="m">'+DB.GYM.site+'/offer/recovery-3</div></div><div class="acts"><button class="btn sm" data-act="copy" data-id="https://'+DB.GYM.site+'/offer/recovery-3">Copy link</button><button class="btn sm" data-act="later" data-id="The QR code download">QR code</button></div></div></section>';
    } else if(f.type==="Website connection"){
      h+='<section class="card"><div class="ch"><h3>Connection</h3><span class="chip ok">Connected</span></div><dl><div><dt>Website</dt><dd>'+DB.GYM.site+'</dd></div><div><dt>Forms sending leads</dt><dd>Contact us, Free intro class</dd></div><div><dt>Last lead</dt><dd>'+f.last+'</dd></div></dl></section>';
    } else {
      h+='<section class="card"><div class="ch"><h3>Connection</h3><span class="chip warn">Not connected</span></div><p class="m" style="margin:0 0 10px">Connect your own Meta account. Each lead from a lead form lands in your contacts within a minute, with their answers.</p><button class="btn" data-act="later" data-id="Connecting a Meta account">Connect Facebook and Instagram</button></section>';
    }
    h+='<section class="card"><div class="ch"><h3>What happens next</h3></div><p style="margin:0">'+esc(f.next)+'.</p><div style="margin-top:8px"><button class="link" data-act="tab" data-id="workflows">Open Workflows</button></div></section></div><div class="col">';
    h+='<section class="card"><div class="ch"><h3>Results</h3><div class="seg">'+["7 days","30 days","90 days"].map(function(r){return '<button data-act="frange" data-id="'+r+'" aria-pressed="'+(st.range===r)+'">'+r+'</button>'}).join("")+'</div></div><div class="statgrid">'+[["Opened",f.opened],["Leads",f.leads],["Booked",f.booked],["Came in",f.showed],["Joined",f.joined]].filter(function(x){return x[1]!==null}).map(function(x){var k=st.range==="7 days"?.3:(st.range==="90 days"?2.6:1);return '<div><span class="k">'+x[0]+'</span><b class="num">'+Math.round(x[1]*k)+'</b></div>'}).join("")+'</div><p class="m" style="margin:8px 0 0">Booked and Came in follow each person as they move through the Pipeline.</p></section>';
    return h+'<section class="card"><div class="ch"><h3>Status</h3></div><div class="t">'+(f.live?"Taking leads":"Not live yet")+'</div><p class="m" style="margin:4px 0 0">'+(f.live?"Everyone who comes in this way lands in your contacts with this funnel as their source.":"Turn it on when it is ready. Nothing comes in until then.")+'</p></section></div></div>';
  }

  /* Workflows */
  var WCHIP={Live:"ok",Draft:"",Paused:"warn",Archived:""};
  function workflowsHTML(){
    if(st.wid) return workflowHTML(DB.workflows.filter(function(w){return w.id===st.wid})[0]);
    var h='<p class="sub">Automate thoughtful coaching, without losing control.</p><div class="seg" style="margin-bottom:12px">'+[["mine","My workflows"],["tpl","Templates "+DB.templates.length],["appr","Needs approval 0"]].map(function(t){return '<button data-act="wtab" data-id="'+t[0]+'" aria-pressed="'+(st.wtab===t[0])+'">'+t[1]+'</button>'}).join("")+'</div>';
    if(st.wtab==="tpl") return h+'<p class="m">Start with a template, then make it yours. Nothing is saved or switched on until you choose.</p><div class="tgrid">'+DB.templates.map(function(t,i){return '<button class="hcard" style="min-height:0" data-act="panel" data-id="wftpl:'+i+'"><span class="nm" style="font-size:15px">'+t[0]+'</span><span class="ds">'+t[1]+'</span><span class="m">'+t[2]+'</span></button>'}).join("")+'</div>';
    if(st.wtab==="appr") return h+'<div class="card"><div class="empty"><span>Nothing is waiting for your approval. Messages Milton drafts inside a workflow show here before they send.</span></div></div>';
    var q=(st.wq||"").toLowerCase(), rows=DB.workflows.filter(function(w){return (st.wstat==="All statuses"||w.status===st.wstat)&&(!q||(w.name+" "+(w.desc||"")).toLowerCase().indexOf(q)>=0)});
    h+='<section class="card flush"><div class="tool"><div class="count">Saved workflows <span class="chip">'+rows.length+'</span></div><div class="tr"><input class="fld" id="wq" placeholder="Name or description" aria-label="Search workflows" value="'+esc(st.wq||"")+'" style="width:220px"><select class="csel" id="wstat" aria-label="Status">'+["All statuses","Draft","Live","Paused","Archived"].map(function(x){return '<option'+(x===st.wstat?" selected":"")+'>'+x+'</option>'}).join("")+'</select></div></div><div class="tw"><table class="pin"><thead><tr><th>Workflow</th><th>Status</th><th>Starts when</th><th>Steps</th></tr></thead><tbody>';
    rows.forEach(function(w){h+='<tr class="go" data-act="workflow" data-id="'+w.id+'"><td><b style="font-weight:600">'+esc(w.name)+'</b>'+(w.desc?'<div class="m">'+esc(w.desc)+'</div>':"")+'</td><td><span class="chip '+WCHIP[w.status]+'">'+w.status+'</span></td><td class="m">'+esc(w.starts)+'</td><td class="num">'+M.wfCount(w)+'</td></tr>'});
    if(!rows.length) h+='<tr><td colspan="4" class="m">No workflows match.</td></tr>';
    return h+'</tbody></table></div></section>';
  }
  function workflowHTML(w){
    return M.wfb.html(w,st.wview);
    var live=w.status==="Live";
    var acts=live?'<button class="btn" data-act="wset" data-id="Paused">Pause</button>':(w.status==="Archived"?'<button class="btn" data-act="wset" data-id="Draft">Restore as a draft</button>':'<button class="btn pri" data-act="wflive">Make it live</button>');
    var h='<button class="backl" data-act="workflow" data-id="">&#8249; All workflows</button><section class="head"><div class="id"><div><h2 class="name">'+esc(w.name)+'</h2><div class="chips"><span class="chip '+WCHIP[w.status]+'">'+w.status+'</span><span class="m">'+esc(w.desc)+'</span></div></div></div><div class="acts">'+acts+(w.status!=="Archived"?'<button class="btn quiet" data-act="wfdup">Duplicate</button><button class="btn rm" data-act="wset" data-id="Archived">Archive</button>':"")+'</div></section>';
    if(live) h+='<div class="infobox" style="margin-top:12px">This workflow is live. Pause it to change its steps or who it runs for.</div>';
    h+='<div class="seg" style="margin:14px 0 12px">'+[["steps","Steps"],["people","People"],["hist","Run history "+w.runs],["appr","Needs approval 0"]].map(function(t){return '<button data-act="wview" data-id="'+t[0]+'" aria-pressed="'+(st.wview===t[0])+'">'+t[1]+'</button>'}).join("")+'</div>';
    if(st.wview==="people") return h+'<div class="card"><div class="ch"><h3>Who it runs for</h3></div><p style="margin:0">'+esc(w.people)+'.</p><p class="m" style="margin:6px 0 0">Anyone who opted out of texts is skipped on text steps. Consent is checked at the moment of sending.</p></div>';
    if(st.wview==="hist") return h+'<div class="card flush"><div class="tw"><table><thead><tr><th>Person</th><th>Started</th><th>Result</th><th></th></tr></thead><tbody>'+(w.runs?[["Sam Okafor","Thu, Nov 19 · 10:21 AM","Finished","ok"],["Billy Tran","Today · 10:15 AM","Finished","ok"],["Marcus Hale","Mon, Nov 16 · 11:02 AM","Stopped at step 2. No mobile number on the form.","warn"]].map(function(r){return '<tr><td><b style="font-weight:600">'+r[0]+'</b></td><td class="m">'+r[1]+'</td><td><span class="chip '+r[3]+'">'+r[2]+'</span></td><td>'+(r[3]==="warn"?'<button class="btn sm" data-act="later" data-id="Retrying a run from the step that failed">Retry from step 2</button>':"")+'</td></tr>'}).join(""):'<tr><td colspan="4" class="m">No runs yet.</td></tr>')+'</tbody></table></div></div>';
    if(st.wview==="appr") return h+'<div class="card"><div class="empty"><span>Nothing is waiting for your approval.</span></div></div>';
    h+='<div class="rules3"><div><div class="k">Starts</div><div class="t">'+esc(w.starts)+'</div></div><div><div class="k">Runs for</div><div class="t">'+esc(w.people)+'</div></div><div><div class="k">Ends</div><div class="t">'+esc(w.ends)+'</div></div></div><div class="canvas" style="margin-top:12px"><span class="pillnode">Starts: '+esc(w.starts)+'</span>';
    
    return h+'<span class="wire"></span>'+(live?"":'<button class="btn sm" data-act="later" data-id="Adding a step">+ Add a step</button><span class="wire"></span>')+'<span class="pillnode end">End of workflow</span></div>';
  }

  /* Settings (CRM section) */
  var set={rec:true};
  function settingsHTML(){
    return '<p class="sub">How your gym reaches people. The rest of your settings are on the Settings page in your menu.</p><div class="stack" style="max-width:820px">'
      +'<section class="card"><div class="ch"><h3>Email</h3><span class="chip ok">Connected</span></div><dl><div><dt>Mailbox</dt><dd>hello@'+DB.GYM.site+'</dd></div><div><dt>Used for</dt><dd>Email in conversations and workflow emails</dd></div></dl></section>'
      +'<section class="card"><div class="ch"><h3>Phone and text messaging</h3><span class="chip ok">Verified</span></div><dl><div><dt>Gym number</dt><dd>'+DB.GYM.num+'. Every text and call goes out from this number.</dd></div><div><dt>Business phone</dt><dd>'+DB.GYM.phone+'. Incoming calls ring here and in the browser for Managers and Admins.</dd></div></dl><div class="row" style="margin-top:8px;border-top:1px solid var(--line)"><div class="what"><div class="t">Record calls</div><div class="m">A short notice plays to both sides at the start of each call. Voicemail is always transcribed.</div></div><button class="sw" role="switch" aria-checked="'+set.rec+'" aria-label="Record calls" data-act="setrec"></button></div></section>'
      +'<section class="card"><div class="ch"><h3>Custom stages</h3><button class="btn sm" data-act="stageadd">+ Add a stage</button></div><p class="m" style="margin:0 0 6px">Your own Pipeline stages, moved by hand. Status (Lead, Customer, Past customer) is separate and worked out by Milton.</p>'
      +(DB.stages.length?DB.stages.map(function(s,i){return '<div class="row"><div class="what"><div class="t" style="font-weight:500">'+esc(s)+'</div></div><div class="acts"><button class="btn sm rm" data-act="stagerm" data-id="'+i+'">Remove</button></div></div>'}).join(""):'<div class="empty"><span>No custom stages. The Pipeline uses the built-in steps.</span></div>')+'</section></div>';
  }
  function docsSoon(){return '<div class="card bigempty"><h3 class="h3">Documents is next in this prototype</h3><p>This tab is not built yet. It will be built from the Milton Documents design and spec: many documents per gym, who signs each one, one signing link per person, and signing on this device.</p></div>'}

  /* page */
  M.pages.crm={
    title:"CRM",
    tabs:function(){return [["contacts","Contacts"],["pipeline","Pipeline"],["funnels","Funnels"],["workflows","Workflows"],["documents","Documents"],["settings","Settings"]]},
    top:function(r){var t=r.tab||"contacts"; if(t==="documents") return M.docs.top(); return t==="funnels"&&!st.fid?["fnew","+ New funnel"]:(t==="workflows"&&!st.wid?["wfnew","+ New workflow",""]:null)},
    render:function(r){
      var t=r.tab||"contacts";
      if(t==="contacts") return r.id&&M.person(r.id)?M.recordHTML(M.person(r.id)):contactsHTML();
      var h=t==="pipeline"?pipelineHTML():(t==="funnels"?funnelsHTML():(t==="workflows"?workflowsHTML():(t==="documents"?M.docs.html():settingsHTML())));
      if(t==="funnels"&&st.fmenu) h='<div class="pswrap" style="display:block;height:0"><span class="menu" style="top:-8px">'+M.fnewTypes.map(function(x){return '<button data-act="fbnew" data-id="'+x[0]+'"><b>'+x[0]+'</b><span class="m">'+x[1]+'</span></button>'}).join("")+'</span></div>'+h;
      return h;
    },
    after:function(r){ if((r.tab||"contacts")==="contacts"&&r.id) M.recordAfter() },
    brief:function(r){
      var t=r.tab||"contacts", all=list(), nd=pairs().length, nl=all.filter(function(c){return M.status(c)==="Lead"}).length;
      if(t==="contacts"&&r.id&&M.person(r.id)) return M.recordBrief(M.person(r.id));
      if(t==="pipeline") return {hd:"I am handling 2 leads. 1 needs a person.",items:["<b>Jordan Ellis</b> came in at 7:44 AM and nobody has reached out.","I am texting <b>Priya Raman</b> and follow up today.","<b>Sam Okafor</b> is booked for Sat, Nov 21 at 9:00 AM."],hint:"Ask Milton about your pipeline",sugg:["Call my new leads"]};
      if(t==="funnels") return {hd:"30 leads in the last 30 days, from 3 live funnels.",items:["The Free intro class form brings the most: 14 leads, 6 booked.","The recovery offer link converts best: 4 of 7 joined."],hint:"Ask Milton about your funnels",sugg:["Which funnel works best?"]};
      if(t==="workflows") return {hd:"3 workflows are live. 1 run stopped.",items:["Welcome after first booking stopped for Marcus Hale at step 2.","Session reminders go out at 5:30 PM Central Time."],hint:"Ask Milton about your workflows",sugg:["Why did a run stop?"]};
      if(t==="documents") return M.docs.brief();
      if(t==="documents"||t==="settings") return {hd:t==="settings"?"Your gym number is verified and email is connected.":"Documents is not built in this prototype yet.",items:[],hint:"Ask Milton about your "+(t==="settings"?"settings":"documents")};
      return {hd:all.length+" contacts, "+nl+" of them leads.",
        items:[nd?'<button class="link" data-act="cfilter" data-id="dup">'+M.plural(nd,"possible duplicate")+'</button> from the Nov 14 import. I only merge when you say so.':"No duplicates to review.",'2 new leads in the last two days that nobody has called. <button class="link" data-act="callleads">Call them one by one</button>'],
        hint:"Ask Milton about your contacts", sugg:["Import my member list","Clean up duplicates","Add a contact"]};
    },
    ask:function(q){
      if(M.route.tab==="documents"&&M.docs.ask(q)) return true;
      if(/import/i.test(q)){M.openPanel("import"); M.say(q,"Drop the file in the panel I opened, or attach it here. I will match the columns and show you what I found before saving."); return true}
      if(/duplicate/i.test(q)){st.filter="dup"; M.go({page:"crm",tab:"contacts"}); M.say(q,"I opened the possible duplicates. Each one shows which record is kept. I only merge when you say so."); return true}
      if(/add a contact/i.test(q)){M.openPanel("addc"); M.say(q,"Fill in the panel I opened, or tell me their name and number here."); return true}
      if(/call/i.test(q)){M.acts.callleads(); M.say(q,"I lined up the new leads nobody has called. Leads I already booked are left out."); return true}
      return false;
    }
  };
  M.onBlank=function(){ if(st.menu||st.pmenu||st.fmenu){st.menu=false;st.pmenu=null;st.fmenu=false;M.render()} };

  /* panels */
  M.panels.addc=function(){
    return '<div class="sph"><div><h3>Add contact</h3><div class="m">One person</div></div>'+M.px+'</div><form class="spb" id="addForm"><div class="field"><label for="fName">Name</label><input id="fName" type="text" autocomplete="off" autofocus><div class="errmsg" id="fNameErr" hidden>Add a name first.</div></div><div class="field"><label for="fPhone">Phone</label><input id="fPhone" type="text" autocomplete="off"></div><div class="field"><label for="fEmail">Email</label><input id="fEmail" type="text" autocomplete="off"></div><div id="fMatch"></div><p class="m" style="margin:0">New people start as a Lead. They become a Customer on their first payment.</p></form><div class="spf"><button class="btn pri" data-act="addsave">Add contact</button><button class="btn" data-act="pclose">Cancel</button></div>';
  };
  M.panels.import=function(){
    if(st.imp==="review") return '<div class="sph"><div><h3>Import a list</h3><div class="m">members-export.csv</div></div>'+M.px+'</div><div class="spb"><div class="k">Review before anything is saved</div><div class="statgrid"><div><span class="k">New contacts</span><b>41</b></div><div><span class="k">Match someone</span><b>3</b></div><div><span class="k">Could not read</span><b>1</b></div></div><div class="m">Columns matched: Name, Mobile to Phone, Email, Joined to Added. The 3 matches are flagged as possible duplicates and are never merged on their own. Row 17 has no name, phone or email.</div><div class="m">Recorded text and email permission carries over. Anyone who opted out stays blocked.</div></div><div class="spf"><button class="btn pri" data-act="impdo">Import 41 contacts</button><button class="btn" data-act="impback">Back</button></div>';
    return '<div class="sph"><div><h3>Import a list</h3><div class="m">A CSV from the system you use today</div></div>'+M.px+'</div><div class="spb"><div class="drop">Drop a CSV here or <button class="link" data-act="imppick">choose a file</button><div class="m" style="margin-top:4px">'+(st.imp==="file"?"<b>members-export.csv</b>, 45 rows":"Milton matches the columns and flags possible duplicates before anything is saved.")+'</div></div><label class="consent" for="fOk"><input id="fOk" type="checkbox"><span>Everyone on this list agreed to receive messages from my gym. Anyone who already opted out stays blocked.</span></label><div class="field"><div class="errmsg" id="impErr" hidden></div></div></div><div class="spf"><button class="btn pri" data-act="impnext">Import</button><button class="btn" data-act="pclose">Cancel</button></div>';
  };
  M.panels.status=function(pn){
    var p=M.person(pn.arg), c=M.calc(p);
    var o=function(v,t,sub){return '<button class="opt" data-act="pick" data-id="'+v+'" aria-pressed="'+(pn.pick===v)+'"><b>'+t+'</b><span class="m">'+sub+'</span></button>'};
    return '<div class="sph"><div><h3>Status</h3><div class="m">'+esc(p.name)+'</div></div>'+M.px+'</div><div class="spb">'+o("auto","Automatic","Now: "+c+". Milton works it out from payments.")+'<div class="k" style="margin-top:8px">Or set it by hand</div>'+o("Lead","Lead","Has never paid.")+o("Customer","Customer","Has an active package or a purchase still to be used.")+o("Past customer","Past customer","Has paid before and has nothing active.")+'<div class="m">A status set by hand stays until someone chooses Automatic. Only an Admin or a Manager can set it.</div></div><div class="spf"><button class="btn pri" data-act="savestatus">Save status</button><button class="btn" data-act="pclose">Cancel</button></div>';
  };
  M.acts.statusp=function(id){var p=M.person(id); M.openPanel("status",id); M.panel.pick=p.manual||"auto"; M.renderPanel()};
  M.acts.savestatus=function(){
    var p=M.person(M.panel.arg), was=p.manual; p.manual=M.panel.pick==="auto"?null:M.panel.pick;
    if(p.manual!==was) p.thread.push({k:"event",day:"Today",t:"just now",body:M.you().name+(p.manual?" set status to "+p.manual+" by hand.":" switched status back to automatic.")});
    M.closePanel(); M.render(); M.toast(p.manual?"Status set by hand: "+p.manual+".":"Status is automatic again: "+M.calc(p)+".");
  };

  /* actions */
  M.acts.csort=function(id){ if(st.sort.key===id) st.sort.dir=-st.sort.dir; else st.sort={key:id,dir:id==="added"?-1:1}; M.render() };
  M.acts.cfilter=function(id,b,e){ if(e) e.stopPropagation(); st.filter=id; st.sel={}; st.menu=false; if(M.route.tab&&M.route.tab!=="contacts"||M.route.id) M.go({page:"crm",tab:"contacts"}); else M.render() };
  M.acts.nocoach=function(){st.nocoach=!st.nocoach; st.sel={}; if(st.filter==="dup") st.filter="All"; M.render()};
  M.acts.cmenu=function(){st.menu=!st.menu; M.render()};
  M.acts.clearsel=function(){st.sel={}; M.render()};
  M.acts.bulktag=function(){var n=selIds().length; selIds().forEach(function(id){var p=M.person(id); if(p.tags.indexOf("Follow up")<0) p.tags.push("Follow up")}); st.sel={}; M.render(); M.toast('Added the tag "Follow up" to '+M.plural(n,"person","people")+". The live app asks which tag.")};
  M.acts.bulkmsg=function(){M.toast("Opens a broadcast to the "+selIds().length+" selected. Milton shows the audience and the message before it sends.")};
  M.acts.msgrow=function(id){M.go({page:"crm",tab:"contacts",id:id}); setTimeout(function(){M.acts.focusmsg()},0)};
  M.acts.callleads=function(){
    var ids=list().filter(function(p){return M.status(p)==="Lead"&&p.phone&&!p.miltonBooked&&!p.milton&&!(M.dupOf(p.id)&&M.dupOf(p.id).drop===p.id)&&p.added>=M.addDays(DB.TODAY,-2)&&!p.thread.some(function(i){return i.k==="call"||i.k==="out"})}).map(function(p){return p.id});
    if(!ids.length){M.toast("No new leads are waiting on a call.");return}
    M.callQueue(ids);
  };
  M.acts.merge=function(id){
    var d=DB.dups.filter(function(x){return x.id===id})[0], k=M.person(d.keep), x=M.person(d.drop);
    var snap={people:DB.people.slice(),dups:DB.dups.slice(),phone:k.phone,email:k.email,len:k.thread.length};
    if(!k.phone) k.phone=x.phone; if(!k.email) k.email=x.email;
    k.thread.push({k:"event",merge:d.id,day:"Today",t:"just now",body:M.you().name+" merged "+x.name+" into this record. Its details and imported row were folded in."});
    k.merged={dup:d,other:x,snap:snap};
    DB.people=DB.people.filter(function(c){return c.id!==d.drop}); DB.dups=DB.dups.filter(function(q){return q.id!==id});
    M.render(); M.toast("Merged into "+k.name+".",function(){M.undoMerge(k)});
  };
  M.undoMerge=function(k){
    var s=k.merged.snap; DB.people=s.people; DB.dups=s.dups; k.phone=s.phone; k.email=s.email;
    k.thread=k.thread.filter(function(i){return !i.merge}); k.merged=null;
    M.render(); M.toast("Merge undone. Both contacts are back as they were.");
  };
  M.acts.notdup=function(id){DB.dups=DB.dups.filter(function(q){return q.id!==id}); M.closePanel(); M.render(); M.toast("Kept as two people. Milton will not flag this pair again.")};
  M.acts.addsave=function(){
    var n=$("fName").value.trim(), ph=$("fPhone").value.trim(), em=$("fEmail").value.trim();
    if(!n){$("fNameErr").hidden=false; $("fName").focus(); return}
    var hit=list().filter(function(p){return (ph&&p.phone.replace(/\D/g,"")===ph.replace(/\D/g,""))||(em&&p.email.toLowerCase()===em.toLowerCase())})[0];
    if(hit && !st.forceAdd){st.forceAdd=true; $("fMatch").innerHTML='<div class="warnbox">'+esc(hit.name)+' already has that '+(em&&hit.email.toLowerCase()===em.toLowerCase()?"email":"phone number")+'.<div class="acts" style="margin-top:8px"><button class="btn sm" data-act="record" data-id="'+hit.id+'">Open '+esc(hit.first)+'</button><span class="m">Or press Add contact again to add a new person anyway.</span></div></div>'; return}
    st.forceAdd=false;
    var id="n"+Date.now(); DB.people.unshift({id:id,name:n,phone:ph,email:em,source:"Front desk",added:DB.TODAY,stage:"New"});
    st.filter="All"; st.q=""; M.closePanel(); M.render(); M.toast(n+" added as a Lead.");
  };
  M.acts.imppick=function(){st.imp="file"; M.renderPanel()};
  M.acts.impnext=function(){
    var err=$("impErr");
    if(st.imp!=="file"){err.textContent="Choose a CSV file first."; err.hidden=false; return}
    if(!$("fOk").checked){err.textContent="Confirm that everyone on the list agreed to receive messages."; err.hidden=false; return}
    st.imp="review"; M.renderPanel();
  };
  M.acts.impback=function(){st.imp="file"; M.renderPanel()};
  M.acts.impdo=function(){st.imp=null; M.closePanel(); M.toast("In the live app this imports 41 contacts and flags 3 possible duplicates. Nothing was imported here.")};
  M.acts.pmove=function(id){st.pmenu=st.pmenu===id?null:id; M.render()};
  M.acts.pmoveto=function(id){var m=id.split("|"), p=M.person(m[0]); if(DB.stages.indexOf(m[1])>=0){p.custom=m[1]} else {p.custom=null; p.stage=m[1]} st.pmenu=null; M.render(); M.toast(p.name+" moved to "+m[1]+".")};
  M.acts.funnel=function(id){st.fid=id||null; st.fmenu=false; M.render(); window.scrollTo(0,0)};
  M.acts.fnew=function(){st.fmenu=!st.fmenu; M.render()};
  M.acts.ftoggle=function(id,b,e){ if(e) e.stopPropagation(); var f=DB.funnels.filter(function(x){return x.id===id})[0]; if(!f.live&&f.type==="Meta lead ads"){M.toast("Connect Facebook and Instagram before turning this on.");return} f.live=!f.live; M.render(); M.toast(f.name+(f.live?" is live.":" is off. Nothing comes in until it is back on."))};
  M.acts.frange=function(id){st.range=id; M.render()};
  M.acts.qreq=function(id){var f=DB.funnels.filter(function(x){return x.id===st.fid})[0]; f.questions[+id][2]=!f.questions[+id][2]; M.render()};
  M.acts.qadd=function(){var f=DB.funnels.filter(function(x){return x.id===st.fid})[0]; f.questions.push(["New question","Short answer",false]); M.render(); M.toast("Question added. The live app lets you type its wording.")};
  M.acts.fsave=function(){var f=DB.funnels.filter(function(x){return x.id===st.fid})[0]; f.title=$("fTitle").value; f.thanks=$("fThanks").value; M.toast("Form saved.")};
  M.acts.wtab=function(id){st.wtab=id; M.render()};
  M.acts.workflow=function(id){st.wid=id||null; st.wview="steps"; M.render(); window.scrollTo(0,0)};
  M.acts.wview=function(id){st.wview=id; M.render()};
  M.acts.wsave=function(){M.toast("Draft saved.")};
  M.acts.wset=function(id){var w=DB.workflows.filter(function(x){return x.id===st.wid})[0]; w.status=id; M.render(); M.toast(w.name+(id==="Live"?" is live.":(id==="Paused"?" is paused. Nothing sends until it is live again.":(id==="Archived"?" is archived.":" is a draft again."))))};
  M.acts.setrec=function(){set.rec=!set.rec; M.render(); M.toast(set.rec?"Calls are recorded, with a notice at the start.":"Call recording is off. Calls still show their length and who handled them.")};
  M.acts.stageadd=function(){var n=["Tour booked","Trial week","Waiting on spouse","Summer return"].filter(function(s){return DB.stages.indexOf(s)<0})[0]; if(!n){M.toast("The live app lets you name the stage.");return} DB.stages.push(n); M.render(); M.toast('Stage "'+n+'" added. The live app lets you name it.')};
  M.acts.stagerm=function(id){var n=DB.stages[+id]; M.confirm({title:'Remove "'+n+'"?',body:"People in this stage go back to their built-in Pipeline step. This cannot be undone.",no:"Keep it",yes:"Remove stage",run:function(){DB.stages.splice(+id,1); M.people().forEach(function(p){if(p.custom===n) p.custom=null}); M.render(); M.toast('Stage "'+n+'" removed.')}})};

  M.changes.push(function(el){
    if(!el.classList) return;
    if(el.classList.contains("pick")&&$("rows")&&M.route.page==="crm"){ if(el.id==="pickAll") shown().forEach(function(c){st.sel[c.id]=el.checked}); else st.sel[el.dataset.id]=el.checked; $("rows").innerHTML=rowsHTML(); return }
    if(el.id==="bulkCoach"){
      var ids=selIds(), to=el.value==="__none"?"":el.value; if(!el.value) return;
      ids.forEach(function(id){M.person(id).coach=to}); st.sel={}; M.render();
      M.toast(to?M.plural(ids.length,"person is","people are")+" now on "+M.first(to)+"'s client list.":M.plural(ids.length,"person has","people have")+" no coach now."); return;
    }
    if(el.classList.contains("coachsel")){
      var c=M.person(el.dataset.id), was=c.coach; c.coach=el.value; M.render();
      M.toast(c.coach?c.name+" is now on "+M.first(c.coach)+"'s client list."+(was?" Moved from "+M.first(was)+".":""):c.name+" was taken off "+M.first(was)+"'s client list."); return;
    }
    if(el.id==="psrc"){st.psrc=el.value; M.render(); return}
    if(el.id==="wstat"){st.wstat=el.value; M.render()}
    if(el.id==="wq"){st.wq=el.value; M.render()}
  });
  M.inputs.push(function(el){ if(el.id==="q"){st.q=el.value; if(st.filter==="dup") st.filter="All"; var r=$("rows"); if(r) r.innerHTML=rowsHTML()} });
  M.submits.addForm=function(){M.acts.addsave()};
})();
