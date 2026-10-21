/* Guerra Sem Fim — Temporada offline e Maravilha do Mundo.
 * Regras adaptadas ao jogo solo; nenhum relógio ou servidor externo. */
(function(){
'use strict';
const D=window.GSF_DATA;
const MILESTONES=[
 {turn:12,title:'Os rumores do povo antigo',text:'Cronistas relatam fortalezas de um povo Natar além da fronteira.'},
 {turn:24,title:'Artefatos antigos revelados',text:'Uma expedição com herói e Tesouraria pode conquistar uma relíquia de produção.'},
 {turn:40,title:'As fortalezas da Maravilha foram abertas',text:'Prepare um administrador e tropas para assumir a Grande Obra em nome do seu império.'},
 {turn:56,title:'Planos da Maravilha descobertos',text:'A Tesouraria pode guardar um plano. Para avançar além do nível 49, procure um segundo plano com uma facção aliada.'}
];
const SEASONS=[
 {id:'harvest',title:'Colheita farta',icon:'🌾',resource:'crop',bonus:.12,description:'Os campos de cereal produzem 12% a mais por quatro turnos.'},
 {id:'forest',title:'Trabalho nas florestas',icon:'🌲',resource:'wood',bonus:.12,description:'A produção de madeira aumenta 12% por quatro turnos.'},
 {id:'clay',title:'Feira dos oleiros',icon:'🧱',resource:'clay',bonus:.12,description:'A produção de barro aumenta 12% por quatro turnos.'},
 {id:'iron',title:'Demanda dos ferreiros',icon:'⚒️',resource:'iron',bonus:.12,description:'A produção de ferro aumenta 12% por quatro turnos.'},
 {id:'drought',title:'Estiagem',icon:'☀️',resource:'crop',bonus:-.08,description:'A produção de cereal diminui 8% por quatro turnos.'}
];
function init(st){
 if(!st.worldEvents)st.worldEvents={version:1,lastTurn:st.ai?.turn||0,history:[],active:null,relic:null,planVillageId:null,coalitionPlanId:null,wonderVillageId:null,level:0,queue:null,natarLevel:0,winner:null};
 return st.worldEvents;
}
function notice(st,title,body,at){
 const id=()=> 'e'+st.nextId++;
 st.events.unshift({id:id(),message:title+': '+body,type:'quest',at});st.events=st.events.slice(0,45);
 st.reports.unshift({id:id(),title,body,type:'info',at,read:false});st.reports=st.reports.slice(0,100);
}
function onTurn(st,turn,at){
 const w=init(st);
 if(turn<=w.lastTurn)return false;
 w.lastTurn=turn;
 for(const m of MILESTONES)if(m.turn===turn)notice(st,'📯 '+m.title,m.text,at);
 if(turn>=6&&turn%6===0){
  const season=SEASONS[(turn/6-1)%SEASONS.length];
  w.active={id:season.id,until:turn+4};
  w.history.unshift({turn,title:season.title,description:season.description,icon:season.icon});
  w.history=w.history.slice(0,16);
  notice(st,season.icon+' '+season.title,season.description,at);
 }
 if(turn>=56&&turn%4===0&&!w.winner){
  w.natarLevel=Math.min(100,w.natarLevel+1);
  if(w.natarLevel===100){w.winner='natars';notice(st,'🏴 Vitória dos Natares','A Maravilha Natar atingiu o nível 100. O mundo terminou, mas sua campanha pode ser consultada.',at);}
  else if(w.natarLevel%20===0)notice(st,'🏗️ A Grande Obra dos Natares','Os Natares alcançaram o nível '+w.natarLevel+'. A disputa continua.',at);
 }
 return true;
}
function modifier(st,resource){
 const w=st.worldEvents;
 if(!w)return 1;
 let mod=1;
 if(w.active&&w.active.until>(st.ai?.turn||0)){
  const e=SEASONS.find(e=>e.id===w.active.id);
  if(e&&e.resource===resource)mod+=e.bonus;
 }
 if(w.relic==='harvest'&&resource==='crop')mod+=.08;
 return Math.max(.5,mod);
}
function power(st,v){return window.GSF_WAR.offense(v.troops,D.TROOPS[st.tribe],v);}
function casualties(st,v,fraction){
 let lost=0;
 for(const troop of D.TROOPS[st.tribe]){
  if(troop.scout)continue;
  const amount=v.troops[troop.id]||0;
  const count=Math.min(amount,Math.floor(amount*fraction));
  v.troops[troop.id]=amount-count;lost+=count;
 }
 return lost;
}
function expedition(st,v,required,health){
 if(!v||!st.villages.some(q=>q.id===v.id))return {ok:false,error:'Escolha uma aldeia própria.'};
 if(st.hero.hp<health)return {ok:false,error:'O herói precisa recuperar sua saúde antes desta expedição.'};
 if(power(st,v)<required)return {ok:false,error:'Reúna um exército com pelo menos '+required+' de poder de ataque nesta aldeia.'};
 return {ok:true};
}
function captureRelic(st,v){
 const w=init(st);
 if((st.ai?.turn||0)<24)return {ok:false,error:'As relíquias ainda não apareceram (turno 24).'};
 if(w.winner)return {ok:false,error:'A temporada já terminou.'};
 if(w.relic)return {ok:false,error:'Seu império já possui uma relíquia.'};
 if((v?.buildings.treasury||0)<10)return {ok:false,error:'É necessária uma Tesouraria nível 10 na aldeia de partida.'};
 const check=expedition(st,v,750,30);if(!check.ok)return check;
 const lost=casualties(st,v,.08);st.hero.hp-=8;
 w.relic='harvest';
 notice(st,'🏺 Artefato recuperado','O Chifre da Terra concede +8% à produção de cereal em todas as aldeias. Baixas na expedição: '+lost+'.',Date.now());
 return {ok:true,losses:lost};
}
function conquerWonder(st,v){
 const w=init(st);
 if((st.ai?.turn||0)<40)return {ok:false,error:'O reduto da Maravilha só abre no turno 40.'};
 if(w.winner)return {ok:false,error:'A temporada já terminou.'};
 if(w.wonderVillageId)return {ok:false,error:'Seu império já controla a Grande Obra.'};
 if((v?.buildings.residence||0)<10&&(v?.buildings.palace||0)<10)return {ok:false,error:'É necessária uma Residência ou Palácio nível 10.'};
 if(!(v?.administrators>0))return {ok:false,error:'Prepare um administrador para conquistar a fortaleza Natar.'};
 const check=expedition(st,v,2000,40);if(!check.ok)return check;
 const lost=casualties(st,v,.12);v.administrators--;st.hero.hp=Math.max(1,st.hero.hp-12);
 w.wonderVillageId=v.id;
 notice(st,'🏛️ A Grande Obra foi tomada',v.name+' comanda o sítio da Maravilha. Baixas: '+lost+'. Os planos serão revelados no turno 56.',Date.now());
 return {ok:true,losses:lost};
}
function capturePlan(st,v){
 const w=init(st);
 if((st.ai?.turn||0)<56)return {ok:false,error:'Os planos da Maravilha surgem no turno 56.'};
 if(w.winner)return {ok:false,error:'A temporada já terminou.'};
 if(w.planVillageId)return {ok:false,error:'Você já guarda um plano; o segundo deve pertencer a um aliado.'};
 if((v?.buildings.treasury||0)<10)return {ok:false,error:'Construa uma Tesouraria nível 10 na aldeia de partida.'};
 const check=expedition(st,v,1000,20);if(!check.ok)return check;
 const lost=casualties(st,v,.10);st.hero.hp=Math.max(1,st.hero.hp-10);
 w.planVillageId=v.id;
 notice(st,'📜 Plano de construção conquistado','O plano está guardado em '+v.name+'. Baixas na expedição: '+lost+'.',Date.now());
 return {ok:true,losses:lost};
}
function allyPlan(st){
 const w=init(st);
 if((st.ai?.turn||0)<56||!w.planVillageId)return {ok:false,error:'Capture primeiro seu plano Natar.'};
 if(w.winner)return {ok:false,error:'A temporada já terminou.'};
 const allies=st.campaign?.allies||[];
 const f=st.ai?.factions.find(f=>allies.includes(f.id)&&!f.defeated);
 if(!f)return {ok:false,error:'Você precisa de uma facção aliada ativa para guardar o segundo plano.'};
 w.coalitionPlanId=f.id;
 notice(st,'🤝 Segundo plano assegurado',f.name+' mantém um plano de construção aliado. A Grande Obra pode ultrapassar o nível 49 enquanto a aliança durar.',Date.now());
 return {ok:true};
}
function hasCoalition(st){const w=st.worldEvents;return !!(w?.coalitionPlanId&&st.campaign?.allies?.includes(w.coalitionPlanId)&&st.ai?.factions.some(f=>f.id===w.coalitionPlanId&&!f.defeated));}
function wonderCost(level){
 const factor=Math.pow(1.08,Math.max(0,level-1));
 return [1100,1000,1150,550].map(v=>Math.ceil(v*factor));
}
function canUpgrade(st,v){
 const w=init(st);
 if(w.winner)return {ok:false,error:'A temporada já foi encerrada.'};
 if(!w.wonderVillageId||v?.id!==w.wonderVillageId)return {ok:false,error:'Selecione a aldeia responsável pela Grande Obra.'};
 if((st.ai?.turn||0)<56)return {ok:false,error:'A construção começa quando os planos surgirem, no turno 56.'};
 if(w.planVillageId!==v.id)return {ok:false,error:'O primeiro plano deve estar na Tesouraria da aldeia responsável.'};
 if((v.buildings.treasury||0)<10)return {ok:false,error:'Mantenha a Tesouraria nível 10 para guardar o plano.'};
 if(w.queue)return {ok:false,error:'Já existe uma etapa de construção em andamento.'};
 if(w.level>=100)return {ok:false,error:'A Maravilha já foi concluída.'};
 if(w.level>=49&&!hasCoalition(st))return {ok:false,error:'Do nível 50 em diante, é necessário o plano de uma facção aliada ativa.'};
 const price=wonderCost(w.level+1);
 if(!window.GSF.canPay(v,price))return {ok:false,error:'Recursos insuficientes para a próxima etapa.'};
 return {ok:true,price,level:w.level+1};
}
function upgrade(st,v){
 const check=canUpgrade(st,v);if(!check.ok)return check;
 const w=init(st);
 D.RES.forEach((resource,i)=>v.resources[resource]-=check.price[i]);
 const startedAt=Date.now();
 const seconds=Math.max(10,Math.round(90*Math.pow(1.035,w.level)/st.speed));
 w.queue={level:check.level,startedAt,endsAt:startedAt+seconds*1000};
 return {ok:true,level:check.level,seconds};
}
function nextEvents(st,cursor){const q=st.worldEvents?.queue;return q&&q.endsAt>cursor?[q.endsAt]:[];}
function resolveDue(st,at){
 const w=st.worldEvents,q=w?.queue;
 if(!q||q.endsAt>at)return false;
 w.level=q.level;w.queue=null;
 if(w.level===100){
  w.winner='player';
  notice(st,'🏆 Vitória da Maravilha','A Maravilha do Mundo chegou ao nível 100! Seu império venceu a temporada offline.',at);
 }else if(w.level%10===0)notice(st,'🏛️ Grande Obra nível '+w.level,'A Maravilha do Mundo atingiu um novo marco de construção.',at);
 return true;
}
function phase(st){
 const turn=st.ai?.turn||0;
 if(turn<12)return 'Fundação';
 if(turn<24)return 'Rumores Natares';
 if(turn<40)return 'Artefatos';
 if(turn<56)return 'Redutos Natares';
 return 'Planos e Maravilha';
}
function validate(w,st){
 if(w===undefined)return true;
 const integer=(n,min,max)=>Number.isSafeInteger(n)&&n>=min&&n<=max;
 const village=id=>id===null||typeof id==='string'&&st.villages.some(v=>v.id===id);
 if(!w||w.version!==1||!integer(w.lastTurn,0,1e9)||!Array.isArray(w.history)||w.history.length>16||
  !w.history.every(h=>h&&integer(h.turn,0,1e9)&&typeof h.title==='string'&&h.title.length<100&&typeof h.description==='string'&&h.description.length<300&&typeof h.icon==='string'&&h.icon.length<20)||
  !village(w.planVillageId)||!village(w.wonderVillageId)||!integer(w.level,0,100)||!integer(w.natarLevel,0,100)||
  ![null,'harvest'].includes(w.relic)||![null,'player','natars'].includes(w.winner)||
  !(w.coalitionPlanId===null||['corvos','aurora','espinhos'].includes(w.coalitionPlanId)))return false;
 if(w.active!==null&&(!w.active||!SEASONS.some(s=>s.id===w.active.id)||!integer(w.active.until,0,1e9)))return false;
 if(w.queue!==null&&(!w.queue||!integer(w.queue.level,1,100)||w.queue.level!==w.level+1||
   typeof w.queue.startedAt!=='number'||!Number.isFinite(w.queue.startedAt)||w.queue.startedAt<0||
   typeof w.queue.endsAt!=='number'||!Number.isFinite(w.queue.endsAt)||w.queue.endsAt<=w.queue.startedAt))return false;
 if(w.level>0&&!w.wonderVillageId)return false;
 if(w.winner==='player'&&w.level!==100||w.winner==='natars'&&w.natarLevel!==100)return false;
 return true;
}
window.GSF_WORLD={init,onTurn,modifier,phase,MILESTONES,SEASONS,wonderCost,power,captureRelic,conquerWonder,capturePlan,allyPlan,hasCoalition,canUpgrade,upgrade,nextEvents,resolveDue,validate};
})();