/* Guerra v0.4: calculadora compartilhada pelo motor e pela IA local. */
(function () {
'use strict';
const D=window.GSF_DATA;
const safe=(n)=>Number.isFinite(n)?n:0;
function tier(v,id){return Math.max(0,Math.min(10,v?.militaryTech?.[id]||0));}
function upgradeCost(unit,next){return unit.cost.map(n=>Math.ceil(n*.65*Math.pow(1.48,next-1)));}
function offense(army,defs,v){return defs.reduce((n,u)=>n+safe(army[u.id]||0)*u.attack*(1+.06*tier(v,u.id)),0);}
function defense(army,defs,v,mix=.65){return defs.reduce((n,u)=>n+safe(army[u.id]||0)*((u.defInf??u.defense)*mix+(u.defCav??u.defense)*(1-mix))*(1+.06*tier(v,u.id)),0);}
function siege(army,defs){return defs.reduce((n,u)=>n+((u.siege==='ram'||u.siege==='catapult')?safe(army[u.id]||0):0),0);}
function siegeDamage(army,defs,wall){const rams=defs.reduce((a,u)=>a+(u.siege==='ram'?(army[u.id]||0):0),0),cats=defs.reduce((a,u)=>a+(u.siege==='catapult'?(army[u.id]||0):0),0);
 return {wall:Math.max(0,Math.min(wall,Math.floor(rams/3))),building:Math.max(0,Math.floor(cats/3))};}
function fortification(level){return 1+Math.max(0,level)*.075;}
function hide(v){return (v.buildings.cranny||0)*150;}
window.GSF_WAR={tier,upgradeCost,offense,defense,siege,siegeDamage,fortification,hide};
})();
