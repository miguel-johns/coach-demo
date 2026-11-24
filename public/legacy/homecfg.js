/* Home, set up in two places.
   Settings, Your profile: each person puts their own cards in the order they like.
   Team, a member's panel: an Admin chooses which cards that person sees. Classes are prefixed hc-. */
(function(){
  var esc=M.esc, A=M.acts, H=M.home;
  function mine(){var y=M.you(); return H.sorted().filter(function(k){return H.shows(y,k.id)})}
  function section(){
    var L=mine();
    return '<section class="card" id="hc_order"><div class="ch"><h3>Your Home</h3><span class="m">The order of your cards. Only your Home changes.</span></div>'
      +(L.length?L.map(function(k,i){return '<div class="row hc-row" draggable="true" data-hc="'+k.id+'"><span class="hc-grip" aria-hidden="true">&#8942;&#8942;</span><span class="hc-n">'+(i+1)+'</span><div class="what"><div class="t" style="font-weight:500">'+k.nm+'</div></div><span class="wf-mv"><button data-act="hmove" data-id="'+k.id+'|-1" aria-label="Move '+k.nm+' up"'+(i===0?" disabled":"")+'>&#9650;</button><button data-act="hmove" data-id="'+k.id+'|1" aria-label="Move '+k.nm+' down"'+(i===L.length-1?" disabled":"")+'>&#9660;</button></span></div>'}).join(""):'<div class="m">You have no cards yet. An Admin chooses which cards you see.</div>')
      +'<div class="acts" style="margin-top:12px"><button class="btn sm" data-act="hreset"'+(H.isDef()?" disabled":"")+'>Back to the default order</button><button class="btn sm" data-act="go" data-id="home">See your Home</button></div><div class="m" style="margin-top:8px">Drag a row or use the arrows. Home fills left to right, three cards to a row. Changes save as you go.'+(M.you().role==="Admin"?' To choose which cards someone else sees, open them in <button class="link" data-act="go" data-id="team">Team</button>.':"")+'</div></section>';
  }
  var P=M.pages.settings, r=P.render;
  P.render=function(route){var out=r.call(P,route), tab=(route&&route.tab)||"profile"; return tab==="profile"?out.replace(/<\/div>$/,section()+"</div>"):out};
  /* a hidden card is blocked, not only left off Home */
  H.DEF.forEach(function(id){var P=M.pages[id]; if(!P) return; var r0=P.render, t0=P.tabs, top0=P.top;
    function ok(){return H.shows(M.you(),id)}
    P.render=function(route){return ok()?r0.call(P,route):'<div class="card"><div class="empty"><span><b>'+P.title+' is not on your Home</b><br>An Admin at '+esc(DB.GYM.name)+' chooses which cards you can open. Ask them if you need this one.</span></div><div class="acts" style="justify-content:center;margin-bottom:10px"><button class="btn" data-act="go" data-id="home">Back to Home</button></div></div>'};
    if(t0) P.tabs=function(route){return ok()?t0.call(P,route):null};
    if(top0) P.top=function(route){return ok()?top0.call(P,route):null}});
  /* an Admin chooses the cards */
  var W=null;
  function member(id){return DB.TEAM.filter(function(t){return t.id===id})[0]}
  var p0=M.panels.trole; M.panels.trole=function(pn){var out=p0(pn), t=DB.TEAM.filter(function(x){return out.indexOf("<h3>"+esc(x.name)+"</h3>")>=0})[0]; if(!t) return out; var n=H.cardsOf(t).length;
    return out.replace('</div><div class="spf">','<div class="setrow"><div><b>Cards on Home</b><div class="m">'+(t.role==="Admin"?"Sees every card":n+" of "+H.DEF.length+" cards"+(t.cards?", changed from the "+t.role+" default":", the "+t.role+" default"))+'</div></div><button class="btn sm" data-act="hcopen" data-id="'+t.id+'">Open</button></div></div><div class="spf">')};
  A.hcopen=function(id){var t=member(id); W={id:id,on:H.cardsOf(t)}; M.openPanel("hcards",id)};
  M.panels.hcards=function(pn){
    var t=member(pn.arg), admin=t.role==="Admin"; if(!W||W.id!==t.id) W={id:t.id,on:H.cardsOf(t)}; var def=H.ROLE[t.role]||H.DEF, same=def.length===W.on.length&&def.every(function(k){return W.on.indexOf(k)>=0});
    return '<div class="sph"><div><h3>Cards on Home</h3><div class="m">'+esc(t.name)+" · "+t.role+'</div></div>'+M.px+'</div><div class="spb">'+(admin?'<div class="infobox">Admins see every card. To limit what '+esc(M.first(t.name))+' sees, change the role first.</div>':'<div class="infobox">Choose what '+esc(M.first(t.name))+' sees on Home. A hidden card is also left out of search and links for '+esc(M.first(t.name))+'. What '+esc(M.first(t.name))+' can do inside a card is set under Roles and access.</div>')
      +H.cards.slice().sort(function(a,b){return H.DEF.indexOf(a.id)-H.DEF.indexOf(b.id)}).map(function(k){var on=W.on.indexOf(k.id)>=0; return '<div class="setrow" style="margin-top:8px"><div><b id="hcs_'+k.id+'">'+k.nm+'</b><div class="m">'+k.ds+'</div></div><button class="sw" role="switch" data-act="hcsw" data-id="'+k.id+'" aria-checked="'+on+'" aria-labelledby="hcs_'+k.id+'"'+(admin?" disabled":"")+'></button></div>'}).join("")
      +(admin?"":'<div class="acts" style="margin-top:6px"><button class="btn sm" data-act="hcdef"'+(same?" disabled":"")+'>Back to the '+t.role+' default</button></div>')+'</div><div class="spf">'+(admin?'<button class="btn" data-act="hcback">Back</button>':'<button class="btn pri" data-act="hcsave">Save</button><button class="btn" data-act="hcback">Cancel</button>')+'</div>';
  };
  A.hcsw=function(id){var i=W.on.indexOf(id); if(i>=0) W.on.splice(i,1); else W.on.push(id); M.renderPanel()};
  A.hcdef=function(){var t=member(W.id); W.on=(H.ROLE[t.role]||H.DEF).slice(); M.renderPanel()};
  A.hcback=function(){W=null; M.closePanel()};
  A.hcsave=function(){var t=member(W.id), def=H.ROLE[t.role]||H.DEF, same=def.length===W.on.length&&def.every(function(k){return W.on.indexOf(k)>=0}); t.cards=same?null:H.DEF.filter(function(k){return W.on.indexOf(k)>=0}); var n=H.cardsOf(t).length; W=null; M.closePanel(); M.render(); M.toast(M.first(t.name)+" now sees "+M.plural(n,"card")+" on Home. It applies the next time "+M.first(t.name)+" loads Milton.")};
})();
