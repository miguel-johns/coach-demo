/* Contact Record: the one business page for every person. Follows the Contact Record design and spec. */
(function(){
  var esc=M.esc, $=M.$, fm=M.fm, fd=M.fd, plural=M.plural, TODAY=DB.TODAY, GYM_NUM=DB.GYM.num;
  var st={pid:null,view:"up",past:false,allTx:false,filt:"all",ch:"Text",note:false,cc:null};
  function P(){return M.person(st.pid)}
  function plan(id){return P().plans.filter(function(x){return x.id===id})[0]}
  function who(p){return p.unnamed?"this number":p.first}
  function Who(p){return p.unnamed?"This person":p.first}
  function whenLine(pl){if(pl.state==="Paused") return "Paused until "+fd(pl.next)+". Reason: "+String(pl.reason||"not given").toLowerCase(); if(pl.state==="Trial") return "Trial ends "+fd(pl.next); if(pl.failed) return "Renewal failed "+fd(pl.failed)+". Next try "+fd(pl.next); return pl.next?(pl.first?"First charge ":"Renews ")+fd(pl.next):pl.when}
  function nextCharge(p){var c=p.plans.filter(function(x){return x.next}).sort(function(a,b){return a.next<b.next?-1:1})[0]; return c?{pl:c,text:fd(c.next)+", "+fm(c.amt)}:null}
  function notes(p){return p.thread.filter(function(i){return i.k==="note"}).slice().reverse()}
  function dupInfo(p){var d=M.dupOf(p.id); return d?{d:d,other:M.person(d.keep===p.id?d.drop:d.keep)}:null}

  function alerts(p){
    var out=[], du=dupInfo(p);
    if(du) out.push({text:"Possible duplicate of "+du.other.name+".", btns:[["panel","dup","Review and merge"]]});
    p.appts.forEach(function(a){
      if(a.due && !a.paid) out.push({text:a.title+" on "+a.day+" is not covered by a package. "+fm(a.due)+" is due at check-in.", btns:[["pay",a.id,"Take payment"],["sell","","Sell a package"]]});
    });
    p.plans.forEach(function(pl){ if(pl.failed) out.push({text:"The "+pl.name+" renewal of "+fm(pl.amt)+" failed on "+fd(pl.failed)+". Milton tries the card again on "+fd(pl.next)+".", btns:[["sell","","Take payment"]]}) });
    p.plans.forEach(function(pl){
      if(pl.unlimited || pl.kind!=="Pack" || pl.open>0 || pl.queued) return;
      if(pl.booked>0) out.push({text:"The last "+pl.service.toLowerCase()+" credit is booked. Renew when "+p.first+" checks out.", btns:[["renew",pl.id,"Renew now, "+pl.price]]});
      else out.push({text:pl.name+" is used up.", btns:[["renew",pl.id,"Renew, "+pl.price]]});
    });
    if(M.docs&&M.docs.state(p)==="tosend"){var nd=M.docs.toSend(p).length; out.push({text:M.plural(nd,"required document needs","required documents need")+" a signing request.", btns:p.textOk&&p.phone?[["dsendp",p.id,"Send what's missing"],["dsign",p.id,"Sign on this device"]]:[["dsign",p.id,"Sign on this device"]]})}
    if(M.status(p)==="Lead" && !p.appts.length) out.push({text:"No session booked yet. "+p.lastTouch, btns:[["book","","Book a session"]]});
    return out;
  }
  function cover(a){
    if(a.plan){var pl=plan(a.plan);return '<span class="chip mist">Uses 1 '+esc(pl.service.toLowerCase())+' credit</span>'}
    if(a.free) return '<span class="chip ok">Free</span>';
    if(a.paid) return '<span class="chip ok">Paid '+fm(a.due)+'</span>';
    if(a.due) return '<span class="chip warn">'+fm(a.due)+' due at check-in</span>';
    return "";
  }
  function apptActs(a){
    if(a.status==="in"){
      if(a.due && !a.paid) return '<button class="btn pri sm" data-act="pay" data-id="'+a.id+'">Pay '+fm(a.due)+' and check out</button>';
      return '<span class="chip ok">Checked in</span><button class="btn sm" data-act="out" data-id="'+a.id+'">Check out</button>';
    }
    if(a.today) return '<button class="btn sm" data-act="in" data-id="'+a.id+'">Check in</button><button class="btn sm quiet" data-act="sessopen" data-id="'+st.pid+'|'+a.id+'">Reschedule</button>';
    var s="";
    if(a.due && !a.paid) s+='<button class="btn sm" data-act="pay" data-id="'+a.id+'">Take payment</button>';
    return s+'<button class="btn sm quiet" data-act="sessopen" data-id="'+st.pid+'|'+a.id+'">Reschedule</button><button class="btn sm quiet" data-act="sessopen" data-id="'+st.pid+'|'+a.id+'">Cancel</button>';
  }
  function creditBlock(pl){
    if(pl.unlimited) return '<div class="big">Unlimited</div><div class="m">No credits to track</div>';
    var pips="",i;
    for(i=0;i<pl.open;i++) pips+='<span class="pip"></span>';
    for(i=0;i<pl.booked;i++) pips+='<span class="pip b"></span>';
    for(i=0;i<pl.used;i++) pips+='<span class="pip u"></span>';
    return '<div class="big">'+pl.open+' left to book</div><div class="pips" aria-hidden="true">'+pips+'</div><div class="m">'+pl.booked+" booked · "+pl.used+" used"+(pl.queued?". Renewal starts when these are used.":"")+'</div>';
  }
  function itemHTML(p,it){
    if(st.filt==="people" && (it.k==="auto"||it.k==="event")) return "";
    if(st.filt==="calls" && it.k!=="call") return "";
    if(it.k==="event") return '<div class="ev">'+esc(it.body)+' <span class="meta">· '+it.t+'</span>'+(it.merge?' <button class="link" data-act="unmerge">Undo merge</button> <span class="meta">available until Fri, Nov 27</span>':"")+'</div>';
    if(it.k==="note") return '<div class="nt">'+esc(it.body)+'<div class="meta">Note from '+esc(it.by)+", team only · "+it.t+'</div></div>';
    if(it.k==="call"){
      var ms=it.dir==="missed";
      return '<div class="call'+(ms?" missed":"")+'"><div class="t">'+esc(it.title)+'</div><div class="m">'+esc(it.body)+'</div><div class="meta">'+(it.pending?"On the way":(ms?"Voicemail transcript":"Summary from the call transcript"))+" · "+it.t+'</div>'+(it.pending?"":'<div class="cact"><button class="link" data-act="later" data-id="Playing a recording">'+(ms?"Play voicemail":"Play recording")+'</button>'+(ms?'<button class="link" data-act="callp" data-id="'+p.id+'">Call back</button>':"")+'</div>')+'</div>';
    }
    if(it.k==="in") return '<div class="msg l"><div class="bub">'+esc(it.body)+'</div><div class="meta">'+esc(p.unnamed?p.phone:p.first)+" · "+it.ch+" · "+it.t+'</div></div>';
    if(it.k==="out") return '<div class="msg r out"><div class="bub">'+esc(it.body)+'</div><div class="meta">'+esc(it.by)+" · "+it.ch+" · "+it.t+'</div></div>';
    if(it.k==="milton") return '<div class="msg r milton"><div class="bub">'+esc(it.body)+'</div><div class="meta">Milton, appointment setter · '+it.ch+" · "+it.t+'</div></div>';
    return '<div class="msg r auto"><div class="src">'+it.src+": "+esc(it.name)+'</div><div class="bub">'+esc(it.body)+'</div><div class="meta">Automated · '+it.ch+" · "+it.t+'</div></div>';
  }
  function convHTML(p){
    var h='<section class="card conv" id="conv"><div class="ch"><h3>Conversation</h3><button class="link" data-act="later" data-id="The Inbox">Open in Inbox</button></div>';
    h+='<div class="fbar"><div class="seg"><button data-act="rfilt" data-id="all" aria-pressed="'+(st.filt==="all")+'">Everything</button><button data-act="rfilt" data-id="people" aria-pressed="'+(st.filt==="people")+'">Conversation only</button><button data-act="rfilt" data-id="calls" aria-pressed="'+(st.filt==="calls")+'">Calls</button></div><span class="m">'+(st.filt==="all"?"Showing automated sends and activity too":(st.filt==="calls"?"Calls and voicemails only":"Hiding automated sends and activity"))+'</span></div><div class="scroll" id="scroll">';
    var day=null, shown=0;
    p.thread.forEach(function(it){
      var s=itemHTML(p,it); if(!s) return;
      if(it.day!==day){day=it.day; h+='<div class="day">'+day+'</div>'}
      h+=s; shown++;
    });
    if(!shown) h+='<div class="ev">'+(st.filt==="calls"?"No calls with "+esc(who(p))+" yet.":"Nothing here yet. Messages, calls and activity with "+esc(who(p))+" show in this one conversation.")+'</div>';
    h+='</div>';
    if(p.milton) h+='<div class="banner">Milton is running this conversation. Goal: book a free intro class. Sending a message takes it over.</div>';
    var note=st.note, chans=["Text","App","Email"].filter(function(x){return (x!=="Email"||p.email)&&(x!=="Text"||p.phone)});
    if(chans.indexOf(st.ch)<0) st.ch=chans[0];
    if(st.ch==="Text"&&!p.textOk) st.ch=p.email?"Email":"App";
    h+='<div class="comp"><div class="crow"><div class="pills">'+chans.map(function(x){var off=x==="Text"&&!p.textOk; return '<button data-act="chan" data-id="'+x+'" aria-pressed="'+(!note&&st.ch===x)+'"'+(off?' disabled title="Opted out of texts"':"")+'>'+x+(off?", opted out":"")+'</button>'}).join("")+'<button class="notep" data-act="notemode" aria-pressed="'+note+'">Team note</button></div><span class="m">'+(note?"Only your team sees notes":(st.ch==="Text"?"Sends from the gym number, "+GYM_NUM:(st.ch==="App"?"Sends in the member app":"Sends to "+esc(p.email))))+'</span></div>';
    var ph=note?"Add a note for the team":"Message "+who(p);
    return h+'<form class="send'+(note?" notem":"")+'" id="sendForm"><input id="msgInput" type="text" autocomplete="off" placeholder="'+esc(ph)+'" aria-label="'+esc(ph)+'"><button class="btn sm" type="submit">'+(note?"Add note":"Send")+'</button></form></div></section>';
  }

  M.recordHTML=function(p){
    if(st.pid!==p.id) st={pid:p.id,view:"up",past:false,allTx:false,filt:"all",ch:"Text",note:false,cc:null};
    var h='<button class="backl" data-act="tab" data-id="contacts">&#8249; All contacts</button>', al=alerts(p), s=M.status(p), hh=M.household(p);
    h+='<section class="head"><div class="id"><div class="av lg">'+p.initials+'</div><div><h2 class="name">'+esc(p.name)+'</h2><div class="chips"><button class="chip caret '+(s==="Lead"?"warn":(s==="Customer"?"solid":""))+'" data-act="statusp" data-id="'+p.id+'" aria-label="Status: '+s+'. Change status">'+s+'</button>'+(p.manual?'<span class="m">Set by hand</span>':"")+'</div></div></div>'
      +'<div class="acts"><button class="btn pri" data-act="book">Book</button><button class="btn" data-act="sell">Take payment</button><button class="btn" data-act="focusmsg">Message</button>'+(p.phone?'<button class="btn" data-act="panel" data-id="callc">Call</button>':"")+(p.unnamed?'<button class="btn" data-act="panel" data-id="name">Add name</button>':"")+'</div></section>';
    var nx=p.appts[0], credits=p.plans.filter(function(x){return !x.unlimited});
    var due=p.appts.filter(function(a){return a.due&&!a.paid}).reduce(function(t,a){return t+a.due},0);
    var missing=p.docs.filter(function(d){return d.status!=="signed"}).length;
    var nc=nextCharge(p), ncLabel=nc?(nc.pl.first?"First charge ":"Next charge ")+nc.text:"";
    h+='<section class="strip">'
     +'<div class="cell"><div class="k">Next session</div><div class="v">'+(nx?nx.day+" · "+nx.time:"Nothing booked")+'</div><div class="s">'+(nx?esc(nx.title):(p.visits.length?"Last session "+p.visits[0][0]:"No sessions yet"))+'</div></div>'
     +'<div class="cell"><div class="k">Credits</div>'+(credits.length?'<div class="v">'+credits.reduce(function(a,c){return a+c.open},0)+' left to book</div><div class="s">'+credits.map(function(c){return c.service+" "+c.open}).join(", ")+'</div>':'<div class="v">'+(p.plans.length?"Unlimited":"No active package")+'</div><div class="s">'+(p.plans.length?"":"Nothing to draw from")+'</div>')+'</div>'
     +'<div class="cell '+(due?"warn":"")+'"><div class="k">Money</div><div class="v">'+(due?fm(due)+" due":(p.tx.length||p.plans.length?"Nothing due":"No purchases"))+'</div><div class="s">'+(due?"At the next session":(nc?ncLabel:(p.card?p.card:"No card on file")))+'</div></div>'
     +'<div class="cell '+(missing?"warn":(p.docs.length?"ok":""))+'"><div class="k">Documents</div><div class="v">'+(missing?missing+" missing":(p.docs.length?"All signed":"Not yet"))+'</div><div class="s">'+(p.docs.length?plural(p.docs.length,"document"):"Waiver sends at first booking")+'</div></div></section>';
    if(al.length) h+='<section class="alerts" aria-label="Needs attention">'+al.map(function(a){return '<div class="alert"><span>'+esc(a.text)+'</span><span class="acts">'+a.btns.map(function(b){return '<button class="btn sm" data-act="'+b[0]+'" data-id="'+b[1]+'">'+b[2]+'</button>'}).join("")+'</span></div>'}).join("")+'</section>';
    h+='<div class="grid"><div class="col">';
    h+='<section class="card"><div class="ch"><h3>Sessions</h3><div class="seg"><button data-act="rview" data-id="up" aria-pressed="'+(st.view==="up")+'">Upcoming '+p.appts.length+'</button><button data-act="rview" data-id="past" aria-pressed="'+(st.view==="past")+'">Past '+p.visits.length+'</button></div></div>';
    if(st.view==="up"){
      if(!p.appts.length) h+='<div class="empty"><span>Nothing booked.</span><button class="btn sm" data-act="book">Book a session</button></div>';
      p.appts.forEach(function(a){h+='<div class="row"><div class="when"><b>'+a.day+'</b><span>'+a.time+'</span></div><div class="what"><div class="t">'+esc(a.title)+'</div><div class="m">'+esc(a.where)+'</div>'+cover(a)+'</div><div class="acts">'+apptActs(a)+'</div></div>'});
    } else {
      if(!p.visits.length) h+='<div class="empty"><span>No sessions yet.</span></div>';
      p.visits.forEach(function(v){h+='<div class="row"><div class="when"><b>'+v[0]+'</b><span>'+v[1]+'</span></div><div class="what"><div class="t">'+esc(v[2])+'</div></div><span class="chip '+(v[3].indexOf("Late")===0?"warn":"")+'">'+esc(v[3])+'</span></div>'});
    }
    h+='</section>';
    if(p.form) h+='<section class="card"><div class="ch"><h3>What they told us</h3><span class="m">'+p.form.name+", "+p.form.when+'</span></div>'+p.form.qa.map(function(q){return '<div class="qa"><div class="m">'+esc(q[0])+'</div><div class="t">'+esc(q[1])+'</div></div>'}).join("")+'</section>';
    h+=M.conv.html(p);
    h+='<section class="card"><div class="ch"><h3>Packages and credits</h3><button class="link" data-act="sell">Sell a package</button></div>';
    if(!p.plans.length) h+='<div class="empty"><span>'+(p.tx.length?"No active package. Sessions are paid one at a time.":"Nothing purchased yet.")+'</span></div>';
    p.plans.forEach(function(pl){
      h+='<div class="row plan"><div class="pm"><div class="t">'+esc(pl.name)+'</div><div class="m">'+pl.kind+", "+pl.price+". "+whenLine(pl)+'.</div>'
        +(pl.first?'<div class="m" style="color:var(--warn);font-weight:600">Not paid yet. Sessions can be used before the first charge.</div>':"")
        +(pl.dates?'<div style="margin-top:6px"><button class="btn sm" data-act="panel" data-id="dates:'+pl.id+'">Edit dates</button></div>':"")
        +'</div><div class="pc">'+creditBlock(pl)+'</div><div class="acts">'+(pl.unlimited?"":'<button class="btn sm" data-act="use" data-id="'+pl.id+'">Record a use</button>')+'<button class="btn sm quiet" data-act="later" data-id="Package history">History</button></div></div>';
    });
    if(p.plans.some(function(x){return !x.unlimited})) h+='<div class="key"><span><i class="pip"></i>Left to book</span><span><i class="pip b"></i>Booked</span><span><i class="pip u"></i>Used</span><span>A credit is used at check-out or a late cancel, never at booking.</span></div>';
    if(p.past.length){
      h+='<div style="margin-top:10px"><button class="link" data-act="rpast">'+(st.past?"Hide":"Show")+" "+plural(p.past.length,"past package")+'</button></div>';
      if(st.past) h+=p.past.map(function(x){return '<div class="row" style="padding:9px 0"><div class="what"><div class="t" style="font-weight:500">'+esc(x[0])+'</div><div class="m">'+x[1]+'</div></div><span class="chip">'+x[2]+'</span></div>'}).join("");
    }
    h+='</section><section class="card"><div class="ch"><h3>Payments</h3></div>';
    var ncBtns="";
    if(nc){
      ncBtns='<button class="btn sm" data-act="panel" data-id="dates:'+nc.pl.id+'">Change date</button>';
      if(nc.pl.first) ncBtns+=(st.cc===nc.pl.id?'<button class="btn sm hl" data-act="chargenow" data-id="'+nc.pl.id+'">Confirm: charge '+fm(nc.pl.amt)+'</button><button class="btn sm quiet" data-act="cc" data-id="">Cancel</button>':'<button class="btn sm" data-act="cc" data-id="'+nc.pl.id+'">Charge now</button>');
    }
    h+='<div class="pay2"><div class="box"><div class="k">Card on file</div><div class="v">'+(p.card||"None")+'</div><div class="acts" style="margin-top:6px"><button class="btn sm" data-act="panel" data-id="card">'+(p.card?"Update card":"Add card")+'</button></div><div class="m" style="margin-top:4px">Saving a card charges nothing.</div></div>'
      +'<div class="box"><div class="k">'+(nc&&nc.pl.first?"First charge":"Next charge")+'</div><div class="v">'+(nc?nc.text:"Nothing scheduled")+'</div><div class="m">'+(nc?esc(nc.pl.name):"")+'</div><div class="acts" style="margin-top:6px">'+ncBtns+'<button class="btn sm" data-act="panel" data-id="laterpkg">Start a package on a later date</button></div></div></div>';
    p.links.forEach(function(l){h+='<div class="open"><div><div class="t">'+esc(l.text)+'</div><div class="m">'+esc(l.meta)+'</div></div><div class="acts"><button class="btn sm" data-act="relink" data-id="'+l.id+'">Resend</button><button class="btn sm" data-act="unlink" data-id="'+l.id+'">Cancel link</button></div></div>'});
    if(p.tx.length){
      h+='<div class="k" style="margin-top:14px">History</div>';
      (st.allTx?p.tx:p.tx.slice(0,4)).forEach(function(t){h+='<div class="tx"><span class="d">'+t[0]+'</span><span><span class="t" style="font-weight:500">'+esc(t[1])+'</span><span class="m"> '+esc(t[2])+'</span></span><span class="a">'+t[3]+'</span></div>'});
      if(p.tx.length>4) h+='<div style="margin-top:8px"><button class="link" data-act="alltx">'+(st.allTx?"Show fewer":"Show all "+p.tx.length)+'</button></div>';
    } else h+='<div class="empty"><span>No payments yet.</span></div>';
    h+='</section></div><div class="col">';
    h+='<section class="card"><div class="ch"><h3>Details</h3><button class="link" data-act="later" data-id="Editing details">Edit</button></div><dl>'
      +'<div><dt><label for="coachSel">Coach</label></dt><dd><select class="fld coachsel" id="coachSel" data-id="'+p.id+'"><option value="">None</option>'+M.coachOpts(p.coach)+'</select></dd></div>'
      +'<div><dt>Customer since</dt><dd>'+(p.since||"Not a customer yet")+'</dd></div><div><dt>Household</dt><dd>'+(hh?esc(hh.name):"None")+'</dd></div>'
      +p.details.map(function(d){return '<div><dt>'+d[0]+'</dt><dd>'+(d[1]?esc(d[1]):'<button class="link" data-act="later" data-id="Adding a '+d[0].toLowerCase()+'">Add '+d[0].toLowerCase()+'</button>')+'</dd></div>'}).join("")+'</dl></section>';
    h+='<section class="card"><div class="ch"><h3>Reach</h3></div><dl>'
      +'<div><dt>Phone</dt><dd>'+(p.phone?'<button class="link" style="font-size:15px" data-act="copy" data-id="'+p.phone+'" title="Copy phone">'+p.phone+'</button>':"None yet")+'</dd></div>'
      +'<div><dt>Email</dt><dd>'+(p.email?'<button class="link" style="font-size:15px" data-act="copy" data-id="'+p.email+'" title="Copy email">'+p.email+'</button>':"None yet")+'</dd></div>'
      +'<div><dt>Texts</dt><dd>'+(p.textOk?'<span class="chip ok">Allowed</span>':'<span class="chip warn">Opted out</span>')+'</dd></div>'
      +'<div><dt>Calls</dt><dd>From the gym number. Recorded with a notice.</dd></div><div><dt>Usually replies by</dt><dd>'+p.replies+'</dd></div><div><dt>Conversation owner</dt><dd>'+(p.owner||"Unassigned")+'</dd></div></dl></section>';
    h+='<section class="card"><div class="ch"><h3>Household</h3>'+(hh?'<button class="link" data-act="panel" data-id="hh">Add a person</button>':"")+'</div>';
    if(hh){
      hh.members.forEach(function(m,i){
        var me=m.id===p.id;
        h+='<div class="row"><div class="what"><div class="t" style="font-weight:'+(me?600:500)+'">'+esc(m.n)+(me?' <span class="m">(this record)</span>':"")+'</div><div class="m">'+m.kind+(m.pays?" · Pays for the household":"")+'</div></div><div class="acts">'+(m.pays||m.kind==="Youth"?"":'<button class="btn sm quiet" data-act="hhpay" data-id="'+i+'">Set as payer</button>')+(me||!M.person(m.id)?"":'<button class="btn sm quiet" data-act="record" data-id="'+m.id+'">Open</button>')+'<button class="btn sm rm" data-act="hhrm" data-id="'+i+'">Remove</button></div></div>';
      });
    } else h+='<div class="empty"><span>Not in a household.</span><button class="btn sm" data-act="hhnew">Create a household</button></div>';
    h+='</section>'+M.docs.recordHTML(p).replace(/<\/section>$/,"");
    var nl=notes(p);
    h+='</section><section class="card"><div class="ch"><h3>Team notes</h3></div>'
      +(nl.length?nl.map(function(n){return '<div class="note"><div>'+esc(n.body)+'</div><div class="m">'+esc(n.by)+" · "+esc(n.day)+'</div></div>'}).join(""):'<div class="m">No notes yet.</div>')
      +'<div class="m" style="margin-top:8px">The same notes show in the conversation.</div><form class="noteadd" id="noteForm"><input id="noteInput" type="text" placeholder="Add a note for the team" aria-label="Add a note for the team"><button class="btn sm" type="submit">Add</button></form></section>';
    h+='<section class="card"><div class="ch"><h3>Coaching</h3></div>'+(p.coach?'<div>Client of '+esc(p.coach)+"."+(p.coaching?" "+esc(p.coaching):"")+'</div><div style="margin-top:8px"><button class="link" data-act="clopen" data-id="'+p.id+'">Open Client Profile</button></div>':'<div class="m">No coach assigned. Choose one under Details.</div>')+'</section>';
    return h+'</div></div>';
  };
  M.recordAfter=function(){var sc=$("scroll"); if(sc) sc.scrollTop=sc.scrollHeight};
  M.recordBrief=function(p){return {hd:esc(p.read[0]),items:p.read.slice(1).map(esc),hint:"Ask Milton about "+who(p),sugg:["Draft a reply","Book the next session"]}};

  /* panels on the record */
  M.panels.callc=function(){var p=P(); return '<div class="sph"><div><h3>Call '+esc(who(p))+'</h3><div class="m">'+p.phone+'</div></div>'+M.px+'</div><div class="spb"><button class="opt" data-act="rcall" data-id="browser"><b>Call from this computer</b><span class="m">Uses your headset or speakers.</span></button><button class="opt" data-act="rcall" data-id="phone"><b>Ring the gym phone first</b><span class="m">Pick up the gym phone, then Milton connects you.</span></button><div class="m">The person sees the gym number, '+GYM_NUM+', either way. Calls are recorded with a notice.</div></div>'};
  M.panels.dup=function(){
    var p=P(), du=dupInfo(p); if(!du) return "";
    var o=du.other, col=function(t,c){return '<div><div class="k">'+t+'</div><div class="t" style="margin-top:4px">'+esc(c.name)+'</div><div class="m">'+(c.phone||"No phone")+'</div><div class="m">'+esc(c.email||"No email")+'</div><div class="m">Added '+fd(c.added)+'</div><div class="m">'+esc(c.source)+'</div></div>'};
    return '<div class="sph"><div><h3>Possible duplicate</h3><div class="m">'+du.d.why+'</div></div>'+M.px+'</div><div class="spb"><div class="cmp">'+col("This record",p)+col("Other record",o)+'</div><div class="m">Merging keeps this record and folds the other one in: sessions, payments, documents, notes and one combined conversation. You can undo a merge for 7 days.</div></div><div class="spf"><button class="btn pri" data-act="rmerge">Merge into this record</button><button class="btn" data-act="notdup" data-id="'+du.d.id+'">Not a duplicate</button></div>';
  };
  M.panels.hh=function(){
    var p=P(), hh=M.household(p), have=hh.members.map(function(m){return m.id});
    var cands=M.people().filter(function(c){return have.indexOf(c.id)<0&&!c.unnamed&&!M.household(c)}).slice(0,5);
    return '<div class="sph"><div><h3>Add a person</h3><div class="m">'+esc(hh.name)+'</div></div>'+M.px+'</div><div class="spb"><div class="field"><label for="hhq">Find a contact</label><input id="hhq" type="search" placeholder="Name, phone or email"></div>'+cands.map(function(c){return '<div class="opt" style="grid-template-columns:1fr auto;align-items:center"><span><b>'+esc(c.name)+'</b><br><span class="m">'+M.status(c)+'</span></span><button class="btn sm" data-act="hhadd" data-id="'+c.id+'">Add</button></div>'}).join("")+'<div class="m">Each person keeps their own record. One adult pays for the household.</div></div>';
  };
  M.panels.dates=function(pn){
    var dp=plan(pn.arg);
    return '<div class="sph"><div><h3>Edit dates</h3><div class="m">'+esc(dp.name)+'</div></div>'+M.px+'</div><div class="spb"><div class="field"><label for="dStart">Started</label><input id="dStart" type="date" value="'+dp.start+'" max="'+TODAY+'"></div><div class="field"><label for="dNext">'+(dp.first?"First charge":"Next charge")+'</label><input id="dNext" type="date" value="'+dp.next+'" min="'+TODAY+'"></div><div class="acts"><button class="btn sm" data-act="bump" data-id="7">Add 1 week</button><button class="btn sm" data-act="bump" data-id="14">Add 2 weeks</button></div><div class="field"><label for="dWhy">Reason</label><input id="dWhy" type="text" autocomplete="off" placeholder="Such as: away for two weeks"></div><div class="m">Nothing is charged when you save. The current cycle and its credits run until the new charge date. Only an Admin can edit dates.</div></div><div class="spf"><button class="btn pri" data-act="savedates">Save dates</button><button class="btn" data-act="pclose">Cancel</button></div>';
  };
  M.panels.card=function(){
    var p=P(), ncp=nextCharge(p);
    return '<div class="sph"><div><h3>Card on file</h3><div class="m">'+(p.card?"Now: "+p.card:"No card yet")+'</div></div>'+M.px+'</div><div class="spb"><div class="k">Enter it now</div><div class="stripe">The secure card form from the payment processor goes here. Milton never sees or stores the card number.</div><div class="k" style="margin-top:8px">Or let them do it</div><button class="opt" data-act="cardlink"><b>Text a link to update the card</b><span class="m">They enter it on their own phone. Nothing is charged.</span></button><div class="m">Saving a card charges nothing. '+(p.card?"It replaces "+p.card+". ":"")+(ncp?"It is used for the next charge on "+fd(ncp.pl.next)+".":"It is used the next time something is charged.")+' Members can also change their card in the app.</div></div><div class="spf"><button class="btn pri" data-act="savecard">Save card</button><button class="btn" data-act="pclose">Cancel</button></div>';
  };
  M.panels.laterpkg=function(){
    var p=P();
    return '<div class="sph"><div><h3>Start on a later date</h3><div class="m">'+esc(p.name)+'</div></div>'+M.px+'</div><div class="spb"><div class="field"><label for="lPkg">Package</label><select id="lPkg">'+DB.CATALOG.map(function(c,i){return '<option value="'+i+'">'+c.name+", "+c.price+'</option>'}).join("")+'</select></div><div class="field"><label for="dNext">First charge</label><input id="dNext" type="date" value="'+M.addDays(TODAY,14)+'" min="'+M.addDays(TODAY,1)+'"></div><div class="acts"><button class="btn sm" data-act="bump" data-id="7">Add 1 week</button><button class="btn sm" data-act="bump" data-id="14">Add 2 weeks</button></div>'
      +(p.card?'<div class="m">Charges '+p.card+' on that date.</div>':'<div class="warnbox">No card on file. Add one before starting.<div style="margin-top:8px"><button class="btn sm" data-act="panel" data-id="card">Add card</button></div></div>')
      +'<div class="warnbox">The package starts today. Sessions can be used before the first charge.</div><div class="m">Nothing is charged today. If the charge fails, it follows your failed renewal setting.</div></div><div class="spf"><button class="btn pri" data-act="startlater">Start package</button><button class="btn" data-act="pclose">Cancel</button></div>';
  };
  M.panels.name=function(){var p=P(); return '<div class="sph"><div><h3>Add name</h3><div class="m">'+p.phone+'</div></div>'+M.px+'</div><form class="spb" id="nameForm"><div class="field"><label for="fn">First name</label><input id="fn" type="text" autocomplete="off" autofocus><div class="errmsg" id="fnErr" hidden>Enter a first name to save.</div></div><div class="field"><label for="ln">Last name</label><input id="ln" type="text" autocomplete="off"></div></form><div class="spf"><button class="btn pri" data-act="savename">Save name</button><button class="btn" data-act="pclose">Cancel</button></div>'};

  function ev(p,body){p.thread.push({k:"event",day:"Today",t:"just now",body:body})}
  function done(msg){M.render(); if(msg) M.toast(msg)}
  function finish(p,a){
    var pl=a.plan?plan(a.plan):null, msg="Checked out.";
    if(pl){
      pl.booked--; pl.used++;
      msg="Checked out. 1 "+pl.service.toLowerCase()+" credit used, "+pl.open+" left to book.";
      if(pl.queued && pl.open===0 && pl.booked===0){ pl.open=pl.size; pl.used=0; pl.queued=false; p.tx.unshift(["Nov 20",pl.name,p.card||"Cash",fm(pl.amt)]); msg="Checked out and renewed. "+pl.open+" "+pl.service.toLowerCase()+" credits left to book." }
    }
    p.appts=p.appts.filter(function(x){return x!==a});
    p.visits.unshift([a.day==="Today"?"Fri, Nov 20":a.day,a.time,a.title,"Checked out"]);
    return msg;
  }
  function appt(id){return P().appts.filter(function(x){return x.id===id})[0]}
  var A=M.acts;
  A.rview=function(id){st.view=id; M.render()};
  A.rpast=function(){st.past=!st.past; M.render()};
  A.alltx=function(){st.allTx=!st.allTx; M.render()};
  A.rfilt=function(id){st.filt=id; M.render()};
  A.chan=function(id){st.ch=id; st.note=false; M.render()};
  A.notemode=function(){st.note=!st.note; M.render()};
  A.focusmsg=function(){st.note=false; M.render(); var cv=$("conv"); if(cv&&cv.scrollIntoView) cv.scrollIntoView({block:"center"}); if($("msgInput")) $("msgInput").focus()};
  A.rcall=function(id){var p=P(); M.closePanel(); M.cp={id:p.id}; M.acts.cstart(id)};
  A.rmerge=function(){var p=P(), du=dupInfo(p), d=du.d; if(d.keep!==p.id){d.drop=d.keep; d.keep=p.id} M.closePanel(); M.acts.merge(d.id)};
  A.unmerge=function(){M.undoMerge(P())};
  A.bump=function(id){var dn=$("dNext"); dn.value=M.addDays(dn.value||TODAY,+id)};
  A.cc=function(id){st.cc=id||null; M.render()};
  A.savedates=function(){
    var p=P(), pl=plan(M.panel.arg), ns=$("dStart").value, nn=$("dNext").value, why=$("dWhy").value.trim(), chg=[];
    if(!ns||!nn){M.toast("Enter both dates.");return}
    if(nn<TODAY){M.toast("The charge date cannot be in the past.");return}
    if(ns!==pl.start) chg.push("start from "+fd(pl.start)+" to "+fd(ns));
    if(nn!==pl.next) chg.push((pl.first?"first charge":"next charge")+" from "+fd(pl.next)+" to "+fd(nn));
    M.panel=null;
    if(!chg.length) return done("No dates changed.");
    pl.start=ns; pl.next=nn; ev(p,M.you().name+" changed "+pl.name+": "+chg.join(", ")+"."+(why?" Reason: "+why:"")); done("Dates saved. Nothing was charged.");
  };
  A.savecard=function(){var p=P(), old=p.card; p.card=old==="Mastercard ending 8210"?"Visa ending 3391":"Mastercard ending 8210"; M.panel=null; ev(p,M.you().name+" "+(old?"replaced the card on file":"added a card on file")+". Nothing was charged."); done(p.card+" saved. Nothing was charged.")};
  A.cardlink=function(){var p=P(); M.panel=null; p.thread.push({k:"auto",day:"Today",t:"just now",ch:"Text",src:"Payments",name:"Card update link",body:"Use this secure link to update your card on file. Nothing is charged."}); done("Link texted to "+who(p)+". Prototype only, nothing was sent.")};
  A.startlater=function(){
    var p=P(); if(!p.card){M.toast("Add a card on file first.");return}
    var c=DB.CATALOG[+$("lPkg").value], dt=$("dNext").value;
    if(!dt||dt<=TODAY){M.toast("Pick a first charge date after today.");return}
    if(p.plans.some(function(x){return x.name===c.name})){M.toast(Who(p)+" already has "+c.name+".");return}
    var pl={id:"n"+Date.now(),name:c.name,kind:c.kind,service:c.service,price:c.price,amt:c.amt,start:TODAY,next:dt,first:true,booked:0,used:0};
    if(c.unlimited) pl.unlimited=true; else pl.open=c.open; if(c.size) pl.size=c.size; if(c.dates) pl.dates=true;
    p.plans.push(pl); if(!p.since) p.since="Nov 20"; M.panel=null;
    ev(p,M.you().name+" started "+c.name+". First charge set for "+fd(dt)+"."); done(c.name+" started. First charge "+fd(dt)+".");
  };
  A.chargenow=function(id){var p=P(), pl=plan(id); st.cc=null; p.tx.unshift(["Nov 20",pl.name,p.card||"Cash",fm(pl.amt)]); pl.first=false; if(pl.dates) pl.next="2026-12-20"; else {pl.next=null; pl.when="Bought Nov 20"} ev(p,M.you().name+" charged "+fm(pl.amt)+" for "+pl.name+" ahead of the scheduled date."); done("Charged "+fm(pl.amt)+" to "+(p.card||"cash")+".")};
  A.savename=function(){
    var p=P(), f=$("fn").value.trim(), l=$("ln").value.trim();
    if(!f){$("fnErr").hidden=false; $("fn").focus(); return}
    p.name=f+(l?" "+l:""); p.first=f; p.initials=M.initials(p.name); p.unnamed=false; p.tags=p.tags.filter(function(t){return t!=="Unsaved number"});
    M.panel=null; ev(p,M.you().name+" saved this number as "+p.name+"."); done("Saved as "+p.name+".");
  };
  A.hhnew=function(){var p=P(), last=p.unnamed?"New":p.name.split(" ").slice(-1)[0]; p.household={name:last+" household",members:[{id:p.id,n:p.name,kind:"Adult",pays:true}]}; done(p.household.name+" created. "+Who(p)+" pays.")};
  A.hhadd=function(id){var p=P(), c=M.person(id), hh=M.household(p); hh.members.push({id:c.id,n:c.name,kind:"Adult"}); c.hhRef=p.hhRef||p.id; M.panel=null; done(c.name+" added to the household.")};
  A.hhpay=function(id){var hh=M.household(P()); hh.members.forEach(function(x,i){x.pays=(i===+id)}); done(hh.members[+id].n+" now pays for the household.")};
  A.hhrm=function(id){
    var p=P(), hh=M.household(p), m=hh.members[+id], owner=M.person(p.hhRef||p.id);
    if(m.pays && hh.members.length>1){M.toast("Set another payer before removing "+m.n+".");return}
    var c=M.person(m.id);
    if(hh.members.length===1){owner.household=null; if(c) c.hhRef=null; return done(m.n+" is no longer in a household.")}
    hh.members.splice(+id,1); if(c&&c.id!==owner.id){c.hhRef=null; c.household=null}
    done(m.n+" removed from the household.");
  };
  A["in"]=function(id){var p=P(); done(M.sess.checkIn(p,appt(id)))};
  A.out=function(id){var p=P(); done(M.sess.checkOut(p,appt(id)))};
  A.pay=function(id){var a=appt(id); M.pos.open({cust:st.pid,appt:a,checkout:a.status==="in"})};
  A.renew=function(id){var p=P(), pl=plan(id); if(pl.booked>0){pl.queued=true; return done("Renewal set. It starts when the last credit is used.")} pl.open=pl.size; pl.used=0; p.tx.unshift(["Nov 20",pl.name,p.card||"Cash",fm(pl.amt)]); done(pl.name+" renewed. "+pl.open+" left to book.")};
  A.use=function(id){var pl=plan(id); if(pl.open>0){pl.open--; pl.used++; done("1 "+pl.service.toLowerCase()+" credit recorded as used. "+pl.open+" left to book.")} else M.toast("No credits left to book on this package.")};
  A.unlink=function(id){var p=P(); p.links=p.links.filter(function(l){return l.id!==id}); ev(p,M.you().name+" canceled a payment link. Nothing was charged."); done("Payment link canceled. Nothing was charged.")};
  A.relink=function(){M.toast("Link sent again. Prototype only, nothing was sent.")};
  A.send=function(id){var p=P(); p.docs[+id].status="sent"; p.docs[+id].when="Sent today"; done("Form texted to "+p.first+". Prototype only, nothing was sent.")};
  A.book=function(){M.sess.book(st.pid)};
  A.sell=function(){M.pos.open({cust:st.pid})};
  M.submits.noteForm=function(){var v=$("noteInput").value.trim(); if(!v) return; P().thread.push({k:"note",day:"Today",t:"just now",by:M.you().name,body:v}); M.render()};
  M.submits.nameForm=function(){A.savename()};
  M.submits.sendForm=function(){
    var p=P(), v=$("msgInput").value.trim(); if(!v) return;
    $("msgInput").value="";
    if(st.note) p.thread.push({k:"note",day:"Today",t:"just now",by:M.you().name,body:v});
    else { p.thread.push({k:"out",day:"Today",t:"just now",ch:st.ch,by:M.you().name,body:v}); if(p.milton){p.milton=false; p.owner=M.you().name; ev(p,M.you().name+" took over from Milton.")} else if(!p.owner) p.owner=M.you().name }
    if(st.filt==="calls") st.filt="all";
    M.render(); $("msgInput").focus();
  };
})();
