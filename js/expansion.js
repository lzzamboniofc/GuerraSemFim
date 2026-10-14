/* Guerra Sem Fim v0.7 — Expansão dos Impérios, economia NPC e eventos. Offline. */
(function(){
'use strict';
const D=window.GSF_DATA;
const FACTIONS=['corvos','aurora','espinhos'];
const OFFERS={
 corvos:{give:'wood',receive:'iron',cost:120,amount:92,label:'Ferro das fronteiras'},
 aurora:{give:'crop',receive:'clay',cost:120,amount:100,label:'Cerâmica da Aurora'},
 espinhos:{give:'clay',receive:'wood',cost:120,amount:100,label:'Madeira dos Espinhos'}
};
const EVENTS=[
 {name:'Colheita excepcional',icon:'🌾',resource:'crop',amount:160,desc:'A estação trouxe uma safra generosa aos celeiros.'},
 {name:'Caravana de artesãos',icon:'🔨',resource:'iron',amount:140,desc:'Os artesãos deixaram uma oferta de ferro ao reino.'},
 {name:'Festival das florestas',icon:'🌲',resource:'wood',amount:150,desc:'Os lenhadores reuniram madeira para o império.'},
 {name:'Feira das pedreiras',icon:'🧱',resource:'clay',amount:145,desc:'Uma feira regional ampliou as reservas de barro.'}
];
function init(st){
 if(!st.expansion)st.expansion={version:1,lastEventTurn:st.ai?.turn||0,history:[],trades:{}};
 return st.expansion;
}
function culture(st){return window.GSF_CAMPAIGN?.culture(st)||0;}
function neededCulture(st){return 40+Math.max(0,st.villages.length-1)*90;}
function npcTrade(st,factionId){
 const offer=OFFERS[factionId],faction=st.ai?.factions?.find(f=>f.id===factionId);
 if(!offer||!faction||faction.defeated)return {ok:false,error:'Esta oferta não está disponível.'};
 const v=st.villages.find(v=>v.id===st.activeVillageId)||st.villages[0];
 if(!v||!(v.buildings.marketplace>=1))return {ok:false,error:'Construa um Mercado na aldeia selecionada.'};
 if(!window.GSF_CAMPAIGN?.isAlly(st,factionId) && !(faction.treatyUntil>st.ai.turn))return {ok:false,error:'O comércio requer uma trégua ou aliança com esta facção.'};
 const ex=init(st),last=ex.trades[factionId];
 if(last!==undefined&&st.ai.turn-last<2)return {ok:false,error:'A feira reabre em dois turnos da IA.'};
 if(v.resources[offer.give]<offer.cost)return {ok:false,error:'Recursos insuficientes.'};
 if(v.resources[offer.receive]+offer.amount>window.GSF.capacity(v,offer.receive))return {ok:false,error:'Sem espaço no armazenamento para receber a mercadoria.'};
 v.resources[offer.give]-=offer.cost;v.resources[offer.receive]+=offer.amount;ex.trades[factionId]=st.ai.turn;
 note(st,`🤝 ${faction.name}: ${offer.label}`,`Troca realizada: ${offer.cost} ${D.RESOURCE[offer.give].name} por ${offer.amount} ${D.RESOURCE[offer.receive].name}.`);
 window.GSF.save(st);return {ok:true,offer};
}
function note(st,title,message){
 const at=Date.now();st.events.unshift({id:'e'+st.nextId++,message,type:'trade',at});st.events=st.events.slice(0,45);
 st.reports.unshift({id:'e'+st.nextId++,title,body:message,type:'info',at,read:false});st.reports=st.reports.slice(0,100);
}
function onTurn(st,turn,at){
 const ex=init(st);if(turn<8||turn-ex.lastEventTurn<8)return false;
 ex.lastEventTurn=turn;
 const data=EVENTS[Math.floor(turn/8-1)%EVENTS.length];
 const target=st.villages[turn/8%st.villages.length|0]||st.villages[0];
 const before=target.resources[data.resource],cap=window.GSF?.capacity(target,data.resource)||1200;
 const added=Math.max(0,Math.min(data.amount,cap-before));target.resources[data.resource]+=added;
 const event={turn,at,title:data.name,icon:data.icon,village:target.name,resource:data.resource,amount:Math.floor(added)};
 ex.history.unshift(event);ex.history=ex.history.slice(0,12);
 note(st,data.icon+' '+data.name,`${data.desc} ${target.name} recebeu ${Math.floor(added)} ${D.RESOURCE[data.resource].name}.`);
 return true;
}
function validate(ex){
 if(ex===undefined)return true;
 if(!ex||ex.version!==1||!Number.isSafeInteger(ex.lastEventTurn)||ex.lastEventTurn<0||ex.lastEventTurn>1e9||!Array.isArray(ex.history)||ex.history.length>12||!ex.trades||typeof ex.trades!=='object'||Array.isArray(ex.trades))return false;
 if(!Object.entries(ex.trades).every(([id,n])=>FACTIONS.includes(id)&&Number.isSafeInteger(n)&&n>=0&&n<=1e9))return false;
 return ex.history.every(e=>e&&typeof e.title==='string'&&e.title.length<=100&&typeof e.village==='string'&&e.village.length<=100&&D.RES.includes(e.resource)&&Number.isSafeInteger(e.amount)&&e.amount>=0&&e.amount<=300&&Number.isSafeInteger(e.turn)&&e.turn>=0&&typeof e.at==='number'&&Number.isFinite(e.at));
}
window.GSF_EXPANSION={init,culture,neededCulture,OFFERS,EVENTS,npcTrade,onTurn,validate};
})();
