/* Campanha v0.6: capítulos, influência, alianças e finais, sem serviços externos. */
(function () {
'use strict';
const D=window.GSF_DATA;
const IDS=['corvos','aurora','espinhos'];
const LEVELS={easy:{label:'Explorador',aggression:.65,recruit:.75},normal:{label:'Equilibrado',aggression:1,recruit:1},hard:{label:'Conquistador',aggression:1.35,recruit:1.28}};
const chapterDefinitions=[
 {id:'fundacao',number:1,title:'O Nascimento de um Reino',description:'Erga os fundamentos do seu império e prove o valor do herói.',reward:300},
 {id:'fronteiras',number:2,title:'O Conselho das Fronteiras',description:'Expanda suas terras e estabeleça seu primeiro contato diplomático.',reward:500},
 {id:'legado',number:3,title:'O Destino dos Três Reinos',description:'Unifique as facções pela diplomacia ou vença a guerra contra todos os rivais.',reward:800}
];
function init(st,requested='normal'){
 if(st.campaign)return st.campaign;
 const difficulty=LEVELS[requested]?requested:'normal';
 st.campaign={version:1,difficulty,chaptersClaimed:[],reputation:{corvos:0,aurora:0,espinhos:0},lastOffer:{},allies:[],offersMade:0,trucesSigned:0,victory:null};
 return st.campaign;
}
function info(st){return init(st);}
function isAlly(st,id){return Boolean(st.campaign?.allies?.includes(id));}
function culture(st){return st.villages.reduce((total,v)=>total+Object.values(v.buildings).reduce((n,l)=>n+l,0)+v.fields.reduce((n,f)=>n+f.level,0),0);}
function militaryWin(st){return IDS.every(id=>st.ai?.factions.some(f=>f.id===id&&f.defeated));}
function diplomaticWin(st){return st.villages.length>=2 && IDS.every(id=>isAlly(st,id));}
function chapters(st){const c=info(st),base=st.villages[0];
 const steps=[
  [{label:'Três campos de recursos no nível 2',done:base.fields.filter(f=>f.level>=2).length>=3},{label:'Primeira aventura concluída',done:st.hero.adventures>=1}],
  [{label:'Fundar segunda aldeia ou derrotar um reino',done:st.villages.length>=2||st.ai?.factions.some(f=>f.defeated)},{label:'Firmar uma trégua, aliança ou derrotar um reino',done:c.trucesSigned>=1||c.allies.length>=1||st.ai?.factions.some(f=>f.defeated)}],
  [{label:'Unificar os três reinos (alianças) ou derrotar os três rivais',done:militaryWin(st)||diplomaticWin(st)}]
 ];
 return chapterDefinitions.map((d,i)=>({...d,steps:steps[i],done:steps[i].every(s=>s.done),claimed:c.chaptersClaimed.includes(d.id),unlocked:i===0||c.chaptersClaimed.includes(chapterDefinitions[i-1].id)}));
}
function note(st,title,message){const at=Date.now();st.events.unshift({id:'e'+st.nextId++,message,type:'quest',at});st.events=st.events.slice(0,45);st.reports.unshift({id:'e'+st.nextId++,title,body:message,type:'victory',at,read:false});st.reports=st.reports.slice(0,100);}
function claimChapter(st,chapterId){const c=info(st),q=chapters(st).find(x=>x.id===chapterId);
 if(!q||!q.unlocked||!q.done||q.claimed)return {ok:false,error:'Complete os objetivos do capítulo anterior e deste capítulo.'};
 c.chaptersClaimed.push(q.id);
 const v=st.villages[0];D.RES.forEach(k=>v.resources[k]=Math.min(window.GSF.capacity(v,k),v.resources[k]+q.reward));
 if(q.id==='fundacao')IDS.forEach(id=>c.reputation[id]=Math.min(100,c.reputation[id]+15));
 if(q.id==='fronteiras')IDS.forEach(id=>c.reputation[id]=Math.min(100,c.reputation[id]+10));
 if(q.id==='legado')c.victory={type:militaryWin(st)?'militar':'diplomatica',at:Date.now()};
 note(st,q.id==='legado'?'🏆 Campanha vitoriosa':`Capítulo ${q.number} concluído`,q.id==='legado'?'Seu legado foi coroado! Você venceu a campanha e pode continuar jogando.':`Capítulo ${q.number}: ${q.title}. Recompensa de ${q.reward} de cada recurso.`);
 return {ok:true,victory:c.victory};
}
function findEmbassy(st,level){return st.villages.find(v=>(v.buildings.embassy||0)>=level);}
function offer(st,id){const c=info(st),f=st.ai?.factions.find(f=>f.id===id);
 if(!f||f.defeated||isAlly(st,id))return {ok:false,error:'Não é possível negociar com essa facção.'};
 const v=findEmbassy(st,1);if(!v)return {ok:false,error:'Requer Embaixada nível 1.'};
 if(c.lastOffer[id]!==undefined && st.ai.turn-c.lastOffer[id]<3)return {ok:false,error:'Os emissários só podem retornar após três turnos.'};
 const costs={wood:120,clay:100,iron:90,crop:140};
 if(!D.RES.every(k=>v.resources[k]>=costs[k]))return {ok:false,error:'Recursos insuficientes para a missão diplomática.'};
 D.RES.forEach(k=>v.resources[k]-=costs[k]);c.lastOffer[id]=st.ai.turn;c.offersMade++;
 c.reputation[id]=Math.min(100,c.reputation[id]+20);
 note(st,'Missão diplomática',`Seus emissários levaram presentes a ${f.name}. Reputação atual: ${c.reputation[id]}/100.`);
 return {ok:true,reputation:c.reputation[id]};
}
function ally(st,id){const c=info(st),f=st.ai?.factions.find(f=>f.id===id);
 if(!f||f.defeated||isAlly(st,id))return {ok:false,error:'Esta facção não pode assinar a aliança.'};
 const v=findEmbassy(st,3);if(!v)return {ok:false,error:'Aliança requer Embaixada nível 3.'};
 if(c.reputation[id]<40)return {ok:false,error:'É necessário alcançar 40 pontos de reputação.'};
 const price={wood:220,clay:180,iron:180,crop:240};
 if(!D.RES.every(k=>v.resources[k]>=price[k]))return {ok:false,error:'Recursos insuficientes para a aliança.'};
 D.RES.forEach(k=>v.resources[k]-=price[k]);c.allies.push(id);
 // Cancel hostile marches from the newly allied faction without casualties.
 for(const m of (st.ai?.movements||[]).slice().filter(m=>m.factionId===id&&m.phase==='outbound')){
  const origin=f.villages.find(x=>x.id===m.sourceId);if(origin)origin.troops=Math.min(300,origin.troops+m.troops);
  st.ai.movements.splice(st.ai.movements.indexOf(m),1);
 }
 note(st,'Aliança diplomática',`${f.name} assinou uma aliança permanente com seu império. Suas forças não atacarão umas às outras.`);
 return {ok:true};
}
function onTruce(st,id){const c=info(st);c.trucesSigned++;c.reputation[id]=Math.min(100,c.reputation[id]+10);}
function difficulty(st){return LEVELS[st.campaign?.difficulty]||LEVELS.normal;}
function setDifficulty(st,value){if(!LEVELS[value])return {ok:false,error:'Dificuldade inválida.'};info(st).difficulty=value;return {ok:true};}
function attackBonus(st){return 1+Math.max(0,(st.hero?.attack||0)-4)*.015;}
function validate(c){if(c===undefined)return true;
 if(!c||c.version!==1||!LEVELS[c.difficulty]||!Array.isArray(c.chaptersClaimed)||c.chaptersClaimed.length>3||new Set(c.chaptersClaimed).size!==c.chaptersClaimed.length||!c.chaptersClaimed.every(id=>chapterDefinitions.some(ch=>ch.id===id)))return false;
 if(!c.reputation||!IDS.every(id=>Number.isSafeInteger(c.reputation[id])&&c.reputation[id]>=0&&c.reputation[id]<=100))return false;
 if(!Array.isArray(c.allies)||c.allies.length>3||new Set(c.allies).size!==c.allies.length||!c.allies.every(id=>IDS.includes(id)))return false;
 if(!c.lastOffer||!Object.entries(c.lastOffer).every(([id,turn])=>IDS.includes(id)&&Number.isSafeInteger(turn)&&turn>=0&&turn<=1e9))return false;
 if(!Number.isSafeInteger(c.offersMade)||c.offersMade<0||c.offersMade>1e9||!Number.isSafeInteger(c.trucesSigned)||c.trucesSigned<0||c.trucesSigned>1e9)return false;
 return c.victory===null||Boolean(c.victory&&['militar','diplomatica'].includes(c.victory.type)&&Number.isFinite(c.victory.at)&&c.victory.at>0&&c.chaptersClaimed.includes('legado'));
}
window.GSF_CAMPAIGN={init,info,chapters,claimChapter,offer,ally,onTruce,isAlly,culture,militaryWin,diplomaticWin,difficulty,setDifficulty,attackBonus,validate,LEVELS};
})();
