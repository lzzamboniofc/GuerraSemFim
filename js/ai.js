/* Mundo Vivo — IA de facções rivais. Sem rede, relógio externo ou aleatoriedade não determinística. */
(function () {
'use strict';
const D = window.GSF_DATA;
const SPECS = [
 {id:'corvos', name:'Clã dos Corvos', icon:'🦅', color:'#7a3433', aggression:0.84, home:[-6,-5], city:'Ninho de Ferro'},
 {id:'aurora', name:'Ordem da Aurora', icon:'🛡️', color:'#b29042', aggression:0.56, home:[6,-4], city:'Alvorada'},
 {id:'espinhos', name:'Liga dos Espinhos', icon:'🌲', color:'#397855', aggression:0.68, home:[5,6], city:'Bosque Velado'}
];
const interval = st => Math.max(30000, Math.round(900000 / st.speed));
const rand = (seed, n) => { let x=Math.imul(seed+1,1664525)+Math.imul(n+1,1013904223);x^=x>>>16;x=Math.imul(x,2246822519);return ((x^(x>>>13))>>>0)/4294967295;};
const coord = (x,y) => `${x}:${y}`;
const occupied = (st,x,y) => st.villages.some(v=>v.x===x&&v.y===y) || st.ai?.factions.some(f=>f.villages.some(v=>v.x===x&&v.y===y));
const free = (st,x,y) => Math.abs(x)<=8 && Math.abs(y)<=8 && !occupied(st,x,y) && st.world.tiles.some(t=>t.x===x&&t.y===y&&t.kind==='empty');
function findSite(st,x,y,radius=5){
 if(free(st,x,y))return {x,y};
 for(let r=1;r<=radius;r++)for(let yy=y-r;yy<=y+r;yy++)for(let xx=x-r;xx<=x+r;xx++){
  if(Math.max(Math.abs(xx-x),Math.abs(yy-y))===r&&free(st,xx,yy))return {x:xx,y:yy};
 }
 return null;
}
function init(st,at=Date.now()){
 if(st.ai)return st.ai;
 const ai={version:1,turn:0,nextTurnAt:at+interval(st),movements:[],factions:[]};
 st.ai=ai;
 for(const f of SPECS){
  const site=findSite(st,...f.home,7);
  ai.factions.push({id:f.id,name:f.name,icon:f.icon,color:f.color,aggression:f.aggression,turns:0,defeated:false,
    villages:site?[{id:f.id+'-capital',name:f.city,x:site.x,y:site.y,level:1,walls:1,troops:24,stock:{wood:220,clay:200,iron:160,crop:260}}]:[]});
 }
 return ai;
}
function tileAt(st,x,y){
 if(!st.ai)return null;
 for(const f of st.ai.factions){
  const city=f.villages.find(v=>v.x===x&&v.y===y);
  if(city)return {id:`rival:${coord(x,y)}`,kind:'rival',name:city.name,x,y,factionId:f.id,factionName:f.name,
   banner:f.icon,color:f.color,power:city.troops,walls:city.walls,level:city.level};
 }
 return null;
}
const isRivalTarget=(st,m)=>typeof m.targetId==='string'&&m.targetId.startsWith('rival:');
function report(st,title,body,type='info',details=null){
 st.reports.unshift({id:'e'+st.nextId++,title,body,type,details,at:st.ai?.eventAt||Date.now(),read:false});
 if(st.reports.length>100)st.reports.length=100;
}
function log(st,message,type='army'){
 st.events.unshift({id:'e'+st.nextId++,message,type,at:st.ai?.eventAt||Date.now()});
 if(st.events.length>45)st.events.length=45;
}
function cityAt(st,x,y){for(const f of st.ai.factions){const city=f.villages.find(v=>v.x===x&&v.y===y);if(city)return {f,city};}return null;}
function resolveBattle(st,m,at){
 const ref=cityAt(st,m.x,m.y);
 const defs=D.TROOPS[st.tribe],origin=st.villages.find(v=>v.id===m.villageId),power=window.GSF_WAR.offense(m.army,defs,origin);
 const resistance=ref?(ref.city.troops*27+18)*window.GSF_WAR.fortification(ref.city.walls):0;
 const won=Boolean(ref)&&power>=resistance*.85;
 const ratio=ref?(won?Math.min(.65,resistance/(power+resistance)*.72):Math.min(1,.50+resistance/(power+resistance)*.43)):0;
 let carried=0,casualties=0;const losses={};
 for(const t of defs){const before=m.army[t.id]||0;const dead=Math.min(before,Math.round(before*ratio));if(before){m.army[t.id]=before-dead;casualties+=dead;losses[t.id]=dead;carried+=(before-dead)*t.carry;}}
 const loot={wood:0,clay:0,iron:0,crop:0};
 if(ref){
  const garrisonLoss=won?Math.max(1,Math.min(ref.city.troops,Math.ceil(power/31))):Math.min(ref.city.troops,Math.ceil(power/85));
  ref.city.troops-=garrisonLoss;
  if(won){
   if(m.mode==='attack'){
    const damage=window.GSF_WAR.siegeDamage(m.army,defs,ref.city.walls);
    if(damage.wall||damage.building){ref.city.walls-=damage.wall;ref.city.level=Math.max(1,ref.city.level-damage.building);
     report(st,'Cerco a '+ref.city.name,`Aríetes reduziram ${damage.wall} nível(is) da muralha; catapultas destruíram ${damage.building} nível(is) de construções.`,'victory');}
   }
   let capacity=Math.floor(carried);
   for(const k of D.RES){const take=Math.min(capacity,Math.floor(ref.city.stock[k]*.4));loot[k]=take;capacity-=take;ref.city.stock[k]-=take;}
   if(m.mode==='attack'&&ref.city.troops===0){
    ref.f.villages.splice(ref.f.villages.indexOf(ref.city),1);
    if(!ref.f.villages.length){ref.f.defeated=true;log(st,`${ref.f.name} foi derrotado!`,'army');}
    report(st,'Território libertado',`${ref.city.name} caiu. O vale está livre para uma futura colonização.`,'victory');
   }
  }
 }
 m.phase='returning';m.loot=loot;m.endsAt=at+Math.max(5000,at-m.startedAt);
 report(st,won?`Vitória contra ${ref.f.name}`:`Derrota em (${m.x}|${m.y})`,ref?`O ataque a ${ref.city.name} ${won?'foi bem-sucedido':'foi repelido'}. Baixas: ${casualties}. Sobreviventes: ${Object.values(m.army).reduce((a,b)=>a+b,0)}.`:'O assentamento rival já havia sido abandonado. As tropas estão retornando.',won?'victory':ref?'defeat':'info',{losses,loot});
 log(st,won?`Vitória contra ${ref.f.name} em (${m.x}|${m.y}).`:`Ataque encerrado em (${m.x}|${m.y}).`);
}
function battleDefense(st,m,at){
 const target=st.villages.find(v=>v.id===m.targetVillageId);
 const origin=st.ai.factions.find(f=>f.id===m.factionId);
 const source=origin?.villages.find(v=>v.id===m.sourceId);
 if(!target){m.phase='returning';m.endsAt=at+m.duration;return;}
 const defenders=D.TROOPS[st.tribe];
 const def=(window.GSF_WAR.defense(target.troops,defenders,target)+18)*window.GSF_WAR.fortification(target.buildings.wall||0);
 const atk=m.troops*35;
 const win=atk>def*.9;
 const ratio=win?Math.min(.85,atk/(def+atk)*.50):Math.min(1,def/(def+atk)*.82);
 const deaths={};let lost=0;
 for(const u of defenders){const n=target.troops[u.id]||0,dead=Math.min(n,Math.floor(n*ratio));if(n){target.troops[u.id]-=dead;deaths[u.id]=dead;lost+=dead;}}
 const attackerLost=Math.min(m.troops,Math.max(1,Math.ceil(m.troops*(win?.26:.78))));m.troops-=attackerLost;
 const loot={wood:0,clay:0,iron:0,crop:0};
 if(win){let capacity=m.troops*15;for(const k of D.RES){const protectedStock=window.GSF_WAR.hide(target);const take=Math.min(capacity,Math.max(0,Math.floor(target.resources[k]*.20)-protectedStock));loot[k]=take;target.resources[k]-=take;capacity-=take;}}
 m.loot=loot;m.phase='returning';m.endsAt=at+m.duration;
 report(st,(win?'Ataque inimigo!':'Defesa vitoriosa!')+` — ${origin?.name||'Rival'}`,`A aldeia ${target.name} ${win?'foi saqueada':'repeliu os invasores'}. Baixas próprias: ${lost}. ${win?'Recursos saqueados: '+D.RES.map(k=>k+' '+loot[k]).join(', '):'Os inimigos recuaram.'}`,win?'defeat':'victory',{losses:deaths,loot});
 log(st,`${origin?.icon||'⚔️'} ${origin?.name||'Inimigos'} ${win?'saquearam':'atacaram sem sucesso'} ${target.name}.`);
}
function nextEvents(st,cursor){if(!st.ai)return [];const times=[st.ai.nextTurnAt,...st.ai.movements.map(m=>m.endsAt)];return times.filter(t=>t>cursor);}
function turn(st,at){
 const ai=st.ai;ai.turn++;
 for(const [index,f] of ai.factions.entries()){
  if(f.defeated)continue;
  f.turns++;
  for(const c of f.villages){
   for(const k of D.RES)c.stock[k]=Math.min(9000,c.stock[k]+Math.ceil((55+c.level*22)*(.8+rand(index+9,ai.turn)*.4)));
   if(c.stock.wood>150+c.level*50&&c.stock.clay>100+c.level*30&&f.turns%3===index%3){
    c.stock.wood-=120+c.level*30;c.stock.clay-=95+c.level*25;c.level=Math.min(15,c.level+1);
    if(c.level%3===0)c.walls=Math.min(8,c.walls+1);
   }
   const affordable=Math.floor(Math.min(c.stock.wood/13,c.stock.iron/12,c.stock.crop/9));
   const recruits=Math.min(Math.max(0,affordable),3+Math.floor(c.level/2),Math.max(0,300-c.troops));
   c.troops+=recruits;c.stock.wood-=recruits*13;c.stock.iron-=recruits*12;c.stock.crop-=recruits*9;
  }
  if(f.turns%12===0&&f.villages.length<3&&f.villages[0]?.level>=4){
   const base=f.villages[0];const direction=[[2,1],[-2,1],[-1,-2],[1,-2]][(ai.turn+index)%4];
   const p=findSite(st,base.x+direction[0],base.y+direction[1],4);
   if(p){f.villages.push({id:`${f.id}-v${f.turns}`,name:`Posto ${f.villages.length+1} de ${f.name}`,x:p.x,y:p.y,level:1,walls:0,troops:12,stock:{wood:100,clay:120,iron:100,crop:160}});
    log(st,`${f.icon} ${f.name} fundou uma aldeia em (${p.x}|${p.y}).`,'army');}
  }
  // Trégua inicial de cinco turnos para um novo comandante.
  if(ai.turn>5&&ai.turn%(index+4)===0&&ai.movements.filter(m=>m.factionId===f.id).length<2){
   const source=f.villages.filter(c=>c.troops>=36).sort((a,b)=>b.troops-a.troops)[0];
   const target=st.villages.slice().sort((a,b)=>Math.hypot(source?.x-a.x||100,source?.y-a.y||100)-Math.hypot(source?.x-b.x||100,source?.y-b.y||100))[0];
   if(source&&target&&rand(index+34,ai.turn)<f.aggression){
    const troops=Math.min(Math.floor(source.troops*.37),34+source.level*5);
    if(troops>=12){source.troops-=troops;
     const duration=Math.max(20000,Math.round(Math.hypot(source.x-target.x,source.y-target.y)*240000/(st.speed*1.5)));
     ai.movements.push({id:'n'+st.nextId++,factionId:f.id,sourceId:source.id,targetVillageId:target.id,troops,phase:'outbound',startedAt:at,endsAt:at+duration,duration,loot:null});
     log(st,`${f.icon} Batedores avistaram ${troops} soldados de ${f.name} marchando para ${target.name}!`,'army');
    }
   }
  }
 }
}
function resolveDue(st,at){
 if(!st.ai)return false;
 const ai=st.ai;ai.eventAt=at;let changed=false;
 for(const m of ai.movements.slice().filter(m=>m.endsAt<=at)){
  if(m.phase==='outbound')battleDefense(st,m,at);
  else{
   const home=ai.factions.find(f=>f.id===m.factionId)?.villages.find(v=>v.id===m.sourceId);
   if(home){home.troops=Math.min(300,home.troops+m.troops);if(m.loot)for(const k of D.RES)home.stock[k]=Math.min(9000,home.stock[k]+m.loot[k]);}
   ai.movements.splice(ai.movements.indexOf(m),1);
  }
  changed=true;
 }
 if(ai.nextTurnAt<=at){turn(st,at);ai.nextTurnAt=at+interval(st);changed=true;}
 delete ai.eventAt;return changed;
}
function prepare(st,cursor,time){
 init(st,cursor);
 const ai=st.ai,i=interval(st);
 const cap=i*240;
 if(time-ai.nextTurnAt>cap){ai.nextTurnAt=time-cap;log(st,'Os reinos rivais evoluíram durante sua ausência. O resumo do mundo foi atualizado.','army');}
}
function validate(ai,st){
 const num=(x,min=0,max=1e14)=>typeof x==='number'&&Number.isFinite(x)&&x>=min&&x<=max;
 if(!ai||ai.version!==1||!Number.isSafeInteger(ai.turn)||!num(ai.nextTurnAt)||!Array.isArray(ai.factions)||ai.factions.length>3||!Array.isArray(ai.movements)||ai.movements.length>100)return false;
 const occupiedTiles=new Set(st.villages.map(v=>coord(v.x,v.y)));
 if(new Set(ai.factions.map(f=>f.id)).size!==ai.factions.length)return false;
 for(const f of ai.factions){
  const spec=SPECS.find(spec=>spec.id===f.id);
  if(!spec||f.name!==spec.name||f.icon!==spec.icon||f.color!==spec.color||!num(f.aggression,0,1)||!Array.isArray(f.villages)||f.villages.length>3||!Number.isSafeInteger(f.turns))return false;
  for(const v of f.villages){
   if(typeof v.id!=='string'||typeof v.name!=='string'||v.name.length>80||!Number.isSafeInteger(v.x)||!Number.isSafeInteger(v.y)||Math.abs(v.x)>8||Math.abs(v.y)>8||!num(v.level,1,15)||!num(v.walls,0,8)||!num(v.troops,0,300)||!v.stock)return false;
   if(occupiedTiles.has(coord(v.x,v.y)))return false;occupiedTiles.add(coord(v.x,v.y));
   if(!D.RES.every(k=>num(v.stock[k],0,9000)))return false;
  }
 }
 return ai.movements.every(m=>typeof m.id==='string'&&ai.factions.some(f=>f.id===m.factionId)&&typeof m.sourceId==='string'&&st.villages.some(v=>v.id===m.targetVillageId)&&num(m.troops,0,300)&&num(m.endsAt)&&num(m.startedAt)&&num(m.duration)&&['outbound','returning'].includes(m.phase));
}
window.GSF_AI={init,prepare,tileAt,isRivalTarget,resolveBattle,resolveDue,nextEvents,validate,interval};
})();
