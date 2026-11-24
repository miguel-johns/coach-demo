/* Start on the view named in the hash, or Home. */
(function(){
  function fromHash(){
    var h=(location.hash||"").replace("#",""), m=h.split("-");
    if(M.pages[m[0]]) return {page:m[0],tab:m[1]||undefined};
    return {page:"home"};
  }
  window.addEventListener("hashchange",function(){var r=fromHash(); if(r.page!==M.route.page||(r.tab||"")!==(M.route.tab||"")) M.go(r)});
  M.go(fromHash());
})();
