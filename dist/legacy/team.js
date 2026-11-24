/* Team: who is on the team and what each role can see and do. Follows the Team Card spec.
   Three roles (Admin, Manager, Coach). Director is later and appears nowhere. */
(function(){
  var esc=M.esc, $=M.$, TEAM=DB.TEAM;
  var ROLES={Admin:"Sees and does everything, including settings and this page.",Manager:"Runs one location: the front desk, the schedule, selling and the business inbox.",Coach:"Works with their own clients: sessions, programming and messages."};
  var ACTIVE={mj:"Today",rc:"Today",tl:"Today",al:"Yesterday",rn:"Tue, Nov 17"};
  TEAM.forEach(function(t){t.active=ACTIVE[t.id]||"Today"});
  var invites=[{id:"i1",name:"Casey Nguyen",role:"Coach",email:"casey@northlinestrength.com",sent:"2026-11-18"},{id:"i2",name:"Jo Park",role:"Manager",email:"jo.park@example.com",sent:"2026-11-09"}];
  var ACCESS=DB.ACCESS={
    Manager:{always:["Every contact's record, and the Contacts list","The schedule, check-in and attendance","Selling and taking payments","Document status","The business inbox: texts, emails and calls on the gym number"],never:"Gym settings, the Team card and full financial reports.",changed:null,
      sw:[{k:"refund",g:"Money",t:"Refund a payment",d:"Can refund from a contact's payments.",on:false,say:["Managers can now refund payments.","Managers can no longer refund payments."]},
        {k:"prices",g:"Money",t:"Change prices",d:"Can edit the price of a service or package, and manage promo codes.",on:false,say:["Managers can now change prices.","Managers can no longer change prices."]},
        {k:"chats",g:"Inbox",t:"Read coach chats",d:"App messages between a client and their coach.",on:false,say:["Managers can now read coach chats.","Managers can no longer read coach chats."]},
        {k:"ring",g:"Inbox",t:"Incoming calls ring in the browser",d:"Calls to the gym number show while they are logged in.",on:true,say:["Incoming calls now ring for Managers.","Incoming calls no longer ring for Managers."]},
        {k:"rec",g:"Inbox",t:"Play recordings and read transcripts",d:"For any call they can see.",on:true,say:["Managers can now play recordings and read transcripts.","Managers can no longer play recordings or read transcripts."]}]},
    Coach:{always:["The clients assigned to them, and each one's Client Profile","Their own schedule and attendance","Workout programming for their clients","Coach chat with their own clients"],never:"Payments, prices, other coaches' clients and gym settings.",changed:null,
      sw:[{k:"leads",g:"People",t:"See leads and contacts who are not their clients",d:"Opens the Contacts list and those conversations to coaches.",on:false,say:["Coaches can now see leads and other contacts.","Coaches now see only their own clients."]},
        {k:"biz",g:"Inbox",t:"See business line items for their own clients",d:"A payment link, a front desk call or a reminder sent to their client.",on:true,say:["Coaches now see business line items for their own clients.","Coaches no longer see business line items."]},
        {k:"ring",g:"Inbox",t:"Incoming calls ring in the browser",d:"Calls to the gym number show while they are logged in.",on:false,say:["Incoming calls now ring for Coaches.","Incoming calls no longer ring for Coaches."]},
        {k:"rec",g:"Inbox",t:"Play recordings and read transcripts, for their own clients",d:"For calls with their own clients.",on:true,say:["Coaches can now play recordings and read transcripts for their own clients.","Coaches can no longer play recordings or read transcripts."]}]}};
  var st={role:null,pick:null,inv:{role:"Coach",err:{}},rm:null};
  function clients(n){return M.people().filter(function(p){return p.coach===n&&!(M.dupOf(p.id)&&M.dupOf(p.id).drop===p.id)}).length}
  function member(id){return TEAM.filter(function(t){return t.id===id})[0]}
  function admins(){return TEAM.filter(function(t){return t.role==="Admin"}).length}
  function age(iso){return Math.round((Date.parse(DB.TODAY)-Date.parse(iso))/864e5)}
  function rchip(r,id){var c='chip'+(r==="Admin"?" solid":" mist"); return id?'<button class="'+c+' caret" data-act="trole" data-id="'+id+'">'+r+'</button>':'<span class="'+c+'">'+r+'</span>'}
  function roleOpts(act,cur){return Object.keys(ROLES).map(function(r){return '<button class="opt" data-act="'+act+'" data-id="'+r+'" aria-pressed="'+(cur===r)+'"><b>'+r+'</b><span class="m">'+ROLES[r]+'</span></button>'}).join("")}
  function peopleHTML(){
    var h='<section class="card flush"><div class="ch" style="padding:14px 16px 8px;margin:0"><h3>Team members</h3><span class="m">'+TEAM.length+' people</span></div><div class="tw"><table class="pin"><thead><tr><th>Name</th><th>Role</th><th>Email</th><th>Clients</th><th>Last active</th><th>Status</th><th></th></tr></thead><tbody>'+TEAM.map(function(t){var n=clients(t.name);
      return '<tr><td><div class="nmc"><span class="av">'+M.initials(t.name)+'</span>'+(t.you?'<b>'+esc(t.name)+'</b> <span class="m">(you)</span>':'<button class="link" style="font-weight:600" data-act="trole" data-id="'+t.id+'">'+esc(t.name)+'</button>')+'</div></td><td>'+rchip(t.role,t.you?null:t.id)+'</td><td>'+esc(t.email)+'</td><td>'+(n?n:(t.role==="Coach"?"0":"None"))+'</td><td>'+t.active+'</td><td><span class="chip ok">Active</span></td></tr>'}).join("")+'</tbody></table></div></section>';
    h+='<section class="card flush" style="margin-top:16px"><div class="ch" style="padding:14px 16px 8px;margin:0"><h3>Pending invites</h3><span class="m">A link works for 7 days</span></div>';
    if(!invites.length) return h+'<div class="none">Nobody is waiting on an invite. Use Invite team member to add someone.</div></section>';
    return h+'<div class="tw"><table class="pin"><thead><tr><th>Name</th><th>Role</th><th>Email</th><th>Sent</th><th>Status</th><th></th></tr></thead><tbody>'+invites.map(function(i){var ex=age(i.sent)>=7;
      return '<tr><td><b>'+esc(i.name)+'</b></td><td>'+rchip(i.role)+'</td><td>'+esc(i.email)+'</td><td>'+(i.sent===DB.TODAY?"Today":M.fd(i.sent))+'</td><td>'+(ex?'<span class="chip warn">Expired</span>':'<span class="chip">Waiting</span>')+'</td><td><div class="ract"><button class="btn sm'+(ex?"":" quiet")+'" data-act="tresend" data-id="'+i.id+'">Resend</button><button class="btn sm quiet" data-act="tcancel" data-id="'+i.id+'">Cancel invite</button></div></td></tr>'}).join("")+'</tbody></table></div></section>';
  }
  function accessHTML(){
    var h='<div class="infobox">Admins see and do everything, so they have no switches. '+M.plural(admins(),"person is an Admin","people are Admins")+'.</div>';
    ["Manager","Coach"].forEach(function(r){var a=ACCESS[r], n=TEAM.filter(function(t){return t.role===r}).length, g=null;
      h+='<section class="card" style="margin-top:16px"><div class="ch"><h3>'+(r==="Coach"?"Coaches":r+"s")+'</h3><span class="m">'+M.plural(n,"person","people")+'</span></div><div class="m">'+ROLES[r]+'</div><div class="two" style="margin-top:12px"><div class="box"><div class="k">Always has</div><ul class="tlist">'+a.always.map(function(x){return '<li>'+esc(x)+'</li>'}).join("")+'</ul></div><div class="box"><div class="k">Never has</div><div style="margin-top:6px">'+esc(a.never)+'</div></div></div>';
      a.sw.forEach(function(s){ if(s.g!==g){g=s.g; h+='<div class="k" style="margin-top:16px">'+g+'</div>'} h+='<div class="setrow"><div><b id="tsw_'+r+s.k+'">'+s.t+'</b><div class="m">'+s.d+'</div></div><button class="sw" role="switch" data-act="tsw" data-id="'+r+":"+s.k+'" aria-checked="'+s.on+'" aria-labelledby="tsw_'+r+s.k+'"></button></div>' });
      h+='<div class="m" style="margin-top:12px">'+(a.changed?"Last changed by "+esc(a.changed)+", today.":"These are the defaults. Nobody has changed them.")+'</div></section>'});
    return h;
  }
  M.pages.team={
    title:"Team",
    tabs:function(){return [["people","People"],["access","Roles and access"]]},
    top:function(){return ["panel","Invite team member","tinvite"]},
    render:function(r){return (r.tab||"people")==="access"?accessHTML():peopleHTML()},
    brief:function(){
      var ex=invites.filter(function(i){return age(i.sent)>=7}).length, coaches=TEAM.filter(function(t){return t.role==="Coach"}), off=ACCESS.Manager.sw.filter(function(s){return s.g==="Money"&&!s.on});
      var items=["<b>Clients.</b> "+coaches.map(function(t){return esc(M.first(t.name))+" "+clients(t.name)}).join(", ")+"."];
      if(invites.length) items.push("<b>Invites.</b> "+(invites.length-ex)+" waiting"+(ex?", "+ex+" expired.":"."));
      if(off.length) items.push("<b>Managers cannot</b> "+off.map(function(s){return s.t.toLowerCase()}).join(" or ")+" until you turn it on.");
      return {hd:M.plural(TEAM.length,"person","people")+" on the team: "+["Admin","Manager","Coach"].map(function(r){var n=TEAM.filter(function(t){return t.role===r}).length; return n+" "+r+(n===1?"":(r==="Coach"?"es":"s"))}).join(", ")+".",items:items,hint:"Ask Milton about your team",sugg:["Invite a coach","What can a manager do?","Resend expired invites"]};
    },
    ask:function(q){
      if(/invite a coach/i.test(q)){st.inv={role:"Coach",err:{}}; M.openPanel("tinvite"); M.say(q,"I opened the invite with Coach selected. Add their name and email and press Send invite."); return true}
      if(/manager/i.test(q)){var a=ACCESS.Manager; M.go({page:"team",tab:"access"}); M.say(q,"A Manager always has contacts, the schedule, selling, document status and the business inbox. Right now a Manager "+a.sw.map(function(s){return (s.on?"can ":"cannot ")+s.t.toLowerCase()}).join(", ")+". I opened Roles and access."); return true}
      if(/resend/i.test(q)){var ex=invites.filter(function(i){return age(i.sent)>=7}); if(!ex.length){M.say(q,"No invites have expired."); return true} st.askResend=ex.map(function(i){return i.id}); M.say(q,M.plural(ex.length,"invite has","invites have")+" expired: "+ex.map(function(i){return i.name}).join(", ")+". Send "+(ex.length===1?"a new link":"new links")+"?",'<div class="acts" style="margin-top:8px"><button class="btn sm hl" data-act="taskresend">Send '+M.plural(ex.length,"new link")+'</button></div>'); return true}
      return false;
    }
  };
  M.panels.tinvite=function(){
    var v=st.inv, e=v.err;
    return '<div class="sph"><div><h3>Invite team member</h3><div class="m">They get an email with a link to set up their login.</div></div>'+M.px+'</div><form class="spb" id="tinvForm"><div class="field"><label for="tiName">Name</label><input id="tiName" autocomplete="off" value="'+esc(v.name||"")+'" autofocus>'+(e.name?'<div class="errmsg">'+e.name+'</div>':"")+'</div><div class="field"><label for="tiEmail">Email</label><input id="tiEmail" type="email" autocomplete="off" value="'+esc(v.email||"")+'">'+(e.email?'<div class="errmsg">'+e.email+'</div>':"")+'</div><div class="k">Role</div>'+roleOpts("tinvrole",v.role)+'<div class="m">The link works for 7 days. You can resend it or cancel the invite from Pending invites.</div></form><div class="spf"><button class="btn pri" data-act="tinvsend">Send invite</button><button class="btn" data-act="pclose">Cancel</button></div>';
  };
  M.panels.trole=function(){
    var t=member(st.role), last=t.role==="Admin"&&admins()===1, n=clients(t.name);
    return '<div class="sph"><div><h3>'+esc(t.name)+'</h3><div class="m">'+esc(t.email)+'</div></div>'+M.px+'</div><div class="spb">'+(last?'<div class="warnbox">'+esc(M.first(t.name))+' is the only Admin. Make someone else an Admin first.</div>':"")+roleOpts("tpick",st.pick)+(t.role==="Coach"&&n&&st.pick!=="Coach"?'<div class="infobox">'+esc(M.first(t.name))+" keeps "+M.plural(n,"client")+". Managers and Admins can be assigned clients.</div>":"")+'<div class="m">The change applies the next time '+esc(M.first(t.name))+' loads Milton.</div></div><div class="spf"><button class="btn pri" data-act="trolesave"'+(st.pick===t.role||last?" disabled":"")+'>Save role</button><button class="btn" data-act="pclose">Cancel</button><button class="btn quiet rm" style="margin-left:auto" data-act="trm" data-id="'+t.id+'">Remove from team</button></div>';
  };
  function rmWindow(){
    var t=member(st.rm.id), n=clients(t.name), f=M.first(t.name);
    var body='<p style="margin:0 0 10px">'+esc(f)+' loses access right away. Their past messages, notes and sessions stay on record under their name. You can invite them again later.</p>';
    if(n) body+='<div class="k">Who takes '+esc(f)+"'s "+M.plural(n,"client")+'?</div><div class="stack" style="gap:6px;margin-top:6px">'+TEAM.filter(function(x){return x.id!==t.id}).map(function(x){return '<button class="opt" data-act="trmpick" data-id="'+x.id+'" aria-pressed="'+(st.rm.to===x.id)+'"><b>'+esc(x.name)+'</b><span class="m">'+x.role+", "+M.plural(clients(x.name),"client")+'</span></button>'}).join("")+'<button class="opt" data-act="trmpick" data-id="none" aria-pressed="'+(st.rm.to==="none")+'"><b>Leave them unassigned</b><span class="m">They show under Needs a coach on the Clients list.</span></button></div>';
    $("confirm").innerHTML='<div class="cwin" role="alertdialog" aria-modal="true" style="max-width:520px"><h3>Remove '+esc(t.name)+'?</h3><div>'+body+'</div><div class="acts" style="justify-content:flex-end;margin-top:14px"><button class="btn" data-act="trmno">Keep '+esc(f)+'</button><button class="btn dangerfill" data-act="trmgo"'+(n&&!st.rm.to?" disabled":"")+'>Remove team member</button></div></div>';
    $("confirm").hidden=false;
  }
  var A=M.acts;
  function re(m){M.render(); if(m) M.toast(m)}
  A.tinvrole=function(id){st.inv.name=$("tiName").value; st.inv.email=$("tiEmail").value; st.inv.role=id; M.renderPanel()};
  A.tinvsend=function(){
    var v=st.inv, n=$("tiName").value.trim(), e=$("tiEmail").value.trim().toLowerCase(); v.name=n; v.email=e; v.err={};
    if(!n) v.err.name="Add their name.";
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) v.err.email="Enter an email address, like name@example.com.";
    else if(TEAM.some(function(t){return t.email.toLowerCase()===e})) v.err.email="That email is already on the team.";
    else if(invites.some(function(i){return i.email.toLowerCase()===e})) v.err.email="That email already has an invite. Resend it from Pending invites.";
    if(v.err.name||v.err.email) return M.renderPanel();
    invites.unshift({id:"i"+Date.now(),name:n,role:v.role,email:e,sent:DB.TODAY}); st.inv={role:"Coach",err:{}}; M.closePanel(); M.go({page:"team",tab:"people"}); M.toast("Invite sent to "+n+" as "+(v.role==="Admin"?"an Admin":"a "+v.role)+". Prototype only, nothing was sent.");
  };
  M.submits.tinvForm=function(){A.tinvsend()};
  A.trole=function(id){st.role=id; st.pick=member(id).role; M.openPanel("trole")};
  A.tpick=function(id){st.pick=id; M.renderPanel()};
  A.trolesave=function(){var t=member(st.role), old=t.role; if(st.pick===old) return; t.role=st.pick; M.closePanel(); re(t.name+" is now "+(t.role==="Admin"?"an Admin":"a "+t.role)+", was "+(old==="Admin"?"an Admin":"a "+old)+".")};
  A.trm=function(id){var t=member(id); if(t.role==="Admin"&&admins()===1) return M.toast(M.first(t.name)+" is the only Admin and cannot be removed. Make someone else an Admin first."); st.rm={id:id,to:null}; rmWindow()};
  A.trmpick=function(id){st.rm.to=id; rmWindow()};
  A.trmno=function(){st.rm=null; $("confirm").hidden=true};
  A.trmgo=function(){
    var t=member(st.rm.id), to=st.rm.to&&st.rm.to!=="none"?member(st.rm.to):null, n=clients(t.name);
    M.people().forEach(function(p){ if(p.coach===t.name){p.coach=to?to.name:""; p.wasClient=true; p.thread.push({k:"event",day:"Today",t:"just now",body:to?"Coach changed from "+t.name+" to "+to.name+".":t.name+" was removed. No coach assigned."})} });
    DB.TEAM.splice(DB.TEAM.indexOf(t),1); DB.SERVICES.forEach(function(s){ if(s.who&&s.who.pop){var i=s.who.indexOf(t.name); if(i>=0) s.who.splice(i,1)} });
    st.rm=null; $("confirm").hidden=true; re(t.name+" removed."+(n?" "+M.plural(n,"client")+(to?" moved to "+to.name+".":" left unassigned."):"")+" Sessions on the schedule that name "+M.first(t.name)+" need a new coach.");
  };
  A.tresend=function(id){var i=invites.filter(function(x){return x.id===id})[0]; i.sent=DB.TODAY; re("New link sent to "+i.name+". It works for 7 days.")};
  A.tcancel=function(id){var i=invites.filter(function(x){return x.id===id})[0]; invites=invites.filter(function(x){return x!==i}); re("Invite to "+i.name+" canceled. The link no longer works.")};
  A.taccept=function(id){var i=invites.filter(function(x){return x.id===id})[0]; invites=invites.filter(function(x){return x!==i}); TEAM.push({id:"t"+Date.now(),name:i.name,role:i.role,email:i.email,active:"Today"}); re(i.name+" accepted and joined as "+(i.role==="Admin"?"an Admin":"a "+i.role)+".")};
  A.taskresend=function(){var ids=st.askResend||[], names=[]; invites.forEach(function(i){ if(ids.indexOf(i.id)>=0){i.sent=DB.TODAY; names.push(i.name)} }); st.askResend=null; M.chatLog.push({text:"Done. "+names.join(", ")+" got a new link. Each works for 7 days. Prototype only, nothing was sent."}); M.render()};
  A.tsw=function(id){var a=id.split(":"), r=ACCESS[a[0]], s=r.sw.filter(function(x){return x.k===a[1]})[0]; s.on=!s.on; r.changed=M.you().name; re(s.say[s.on?0:1])};
})();
