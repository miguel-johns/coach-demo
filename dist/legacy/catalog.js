/* What Northline Strength delivers (services) and sells (packages and products). Used by booking and the POS. */
(function(){
  DB.NOW = 16*60+10; /* the clock is fixed at 4:10 PM on Fri, Nov 20 */
  DB.SERVICES = [
    {id:"semi", name:"Semi-private", title:"Semi-private training", len:60, where:"with Coach Tori", price:65, times:["5:30 AM","6:30 AM","9:00 AM","12:00 PM","5:30 PM"]},
    {id:"pt", name:"Personal training", title:"Personal training, 60 min", len:60, where:"with Coach Andre", price:80, tip:true, times:["9:00 AM","10:00 AM","11:00 AM","2:00 PM","4:00 PM"]},
    {id:"rr", name:"Recovery room", title:"Recovery Room, 50 min", len:50, where:"Room B", price:40, times:["9:00 AM","10:00 AM","12:10 PM","3:00 PM","6:30 PM"]},
    {id:"mass", name:"Massage", title:"Massage, 60 min", len:60, where:"with Renee", price:95, tip:true, times:["10:00 AM","11:30 AM","2:00 PM","3:30 PM"]},
    {id:"og", name:"Open gym", title:"Open gym", len:60, where:"Main floor", price:15, times:["9:00 AM","12:00 PM","4:15 PM","6:10 PM"]},
    {id:"sgt", name:"Small group training", title:"Small Group Training", len:60, where:"with Coach Tori", price:25, times:["5:30 PM"]},
    {id:"intro", name:"Free intro class", title:"Free intro class", len:45, where:"with Coach Andre", price:0, times:["9:00 AM","6:00 AM"]}
  ];
  DB.ITEMS = [
    {id:"pt8", svc:"Personal training", name:"8-pack", sub:"8 sessions, 60 min", price:560, kind:"pack", size:8, tip:true},
    {id:"pt1", svc:"Personal training", name:"Drop-in", sub:"1 session, 60 min", price:80, kind:"pack", size:1, tip:true},
    {id:"sp2", svc:"Semi-private", name:"Semi-Private 2x per week", sub:"8 sessions a month", price:449, kind:"membership", per:"month", size:8},
    {id:"sg10", svc:"Small group training", name:"10-pack", sub:"10 sessions, 60 min", price:200, kind:"pack", size:10},
    {id:"sgu", svc:"Small group training", name:"Small Group Unlimited", sub:"Come to any class", price:129, kind:"membership", per:"month", unlimited:true},
    {id:"sg1", svc:"Small group training", name:"Drop-in", sub:"1 session, 60 min", price:25, kind:"pack", size:1},
    {id:"rr4", svc:"Recovery room", name:"4-pack", sub:"4 sessions, 50 min", price:140, kind:"pack", size:4},
    {id:"rr1", svc:"Recovery room", name:"Drop-in", sub:"1 session, 50 min", price:40, kind:"pack", size:1},
    {id:"ms1", svc:"Massage", name:"Drop-in", sub:"1 session, 60 min", price:95, kind:"pack", size:1, tip:true},
    {id:"ogu", svc:"Open gym", name:"Open Gym Unlimited", sub:"Come in any time", price:79, kind:"membership", per:"month", unlimited:true},
    {id:"day", svc:"Open gym", name:"Day Pass", sub:"1 session, good for 30 days", price:15, kind:"pack", size:1},
    {id:"nut", svc:"Nutrition", name:"Nutrition Coaching", sub:"Subscription, nothing to book", price:39.99, kind:"membership", per:"month", unlimited:true},
    {id:"camp", svc:"Youth", name:"Youth Camp Day Pass", sub:"1 camp day", price:25, kind:"pack", size:1},
    {id:"water", svc:"Products", name:"Water", sub:"", price:1, kind:"product"},
    {id:"bar", svc:"Products", name:"Protein bar", sub:"", price:3, kind:"product", stock:19},
    {id:"nrg", svc:"Products", name:"Energy drink", sub:"", price:3, kind:"product", stock:4},
    {id:"tee", svc:"Products", name:"Northline tee", sub:"", price:25, kind:"product", stock:12}
  ];
  DB.klass = {title:"Small Group Training", time:"5:30 PM", len:60, room:7, shown:4, coach:"with Coach Tori",
    roster:[["leah","Leah Ortiz"],["chris","Chris Whitfield"],["billy","Billy Tran"],["devon","Devon Marsh"]],
    asks:[["marcus","Marcus Hale","Asked for a spot · no credits, payment would be due"],["dana","Dana Whitfield","Asked for a spot · has 1 credit"]], declined:0};
  DB.overrides = [["Thu, Nov 26","Whole gym · Thanksgiving","Closed","err"],["Fri, Nov 27","Whole gym","10:00 AM to 2:00 PM","mist"],["Dec 22 to Dec 26","Recovery Room B · maintenance","Closed","err"]];
})();
