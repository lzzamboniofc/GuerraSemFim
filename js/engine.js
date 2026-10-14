(function () {
'use strict';
const D = window.GSF_DATA;
const KEY = 'guerra-sem-fim-save-v1';
const HERO_ARTIFACTS={axe:{name:'Machado do Lenhador',icon:'🪓',text:'+10% madeira',type:'wood',bonus:.10},horn:{name:'Chifre da Colheita',icon:'🌾',text:'+10% cereal',type:'crop',bonus:.10},crown:{name:'Coroa do Reino',icon:'👑',text:'+5% em todos os recursos',type:'all',bonus:.05}};
const now = () => Date.now();
const clamp = (x,a,b) => Math.min(b,Math.max(a,x));
const sum = arr => arr.reduce((a,b)=>a+b,0);
const random = (x,y,seed=17) => { let k = Math.imul(x+1009,73856093)^Math.imul(y+997,19349663)^Math.imul(seed,83492791); k = Math.imul(k ^ k >>> 16, 2246822507); return ((k^k>>>13)>>>0)/4294967295; };
const id = st => 'e'+(st.nextId++);
const round = n => Math.floor(n);
function fieldMix(profile='balanced') {
 if(profile==='crop15')return ['wood','clay','iron',...Array(15).fill('crop')];
 if(profile==='crop9')return [...Array(3).fill('wood'),...Array(3).fill('clay'),...Array(3).fill('iron'),...Array(9).fill('crop')];
 return [...Array(4).fill('wood'),...Array(4).fill('clay'),...Array(4).fill('iron'),...Array(6).fill('crop')];
}
function tileProfile(t){if(!t||t.kind!=='empty')return 'balanced';const p=random(t.x+831,t.y-471,97);return p<.065?'crop15':p<.18?'crop9':'balanced';}
function oasisResource(t){return t.oasisType||D.RES[Math.floor(random(t.x+93,t.y-61,31)*4)%4];}
function oasisCount(st,v){return st.world.tiles.filter(t=>t.kind==='oasis'&&t.ownerVillageId===v.id).length;}
function oasisLimit(v){const lv=buildLevel(v,'heroMansion');return lv>=20?3:lv>=10?2:lv>=1?1:0;}
function captureOasis(st,v,x,y){
 const t=st.world.tiles.find(t=>t.x===x&&t.y===y&&t.kind==='oasis');
 if(!t)return {ok:false,error:'Selecione um oásis no mapa.'};
 if(t.ownerVillageId)return {ok:false,error:'Este oásis já está ocupado.'};
 if(Math.hypot(x-v.x,y-v.y)>3)return {ok:false,error:'O oásis precisa estar a no máximo três campos da aldeia.'};
 if(!oasisLimit(v))return {ok:false,error:'Construa a Mansão do Herói para ocupar oásis.'};
 if(oasisCount(st,v)>=oasisLimit(v))return {ok:false,error:'Limite de oásis desta aldeia atingido. Evolua a Mansão do Herói.'};
 if(st.hero.hp<25)return {ok:false,error:'O herói precisa de pelo menos 25 de vida.'};
 const warriors=troopDefs(st).filter(u=>!u.scout&&!u.siege).reduce((sum,u)=>sum+(v.troops[u.id]||0),0);
 if(warriors<20)return {ok:false,error:'Deixe 20 soldados de infantaria ou cavalaria na aldeia.'};
 const price=[250,250,250,250];if(!canPay(v,price))return {ok:false,error:'A ocupação exige 250 unidades de cada recurso.'};
 pay(v,price);st.hero.hp-=15;t.ownerVillageId=v.id;t.oasisType=oasisResource(t);
 log(st,`Oásis de ${D.RESOURCE[t.oasisType].name} conquistado por ${v.name} (${x}|${y}).`,'build');
 report(st,'Oásis conquistado',`${v.name} conquistou um oásis em (${x}|${y}), obtendo +25% de produção de ${D.RESOURCE[t.oasisType].name.toLowerCase()}.`,'victory');
 save(st);return {ok:true,resource:t.oasisType};
}
function releaseOasis(st,v,x,y){const t=st.world.tiles.find(t=>t.x===x&&t.y===y&&t.kind==='oasis'&&t.ownerVillageId===v.id);if(!t)return {ok:false,error:'Oásis não pertence à aldeia atual.'};delete t.ownerVillageId;log(st,`Oásis (${x}|${y}) foi abandonado.`,'build');save(st);return {ok:true};}
function heroTargets(st){
 const saved=st.hero.productionTargets;
 if(Array.isArray(saved)&&saved.length&&saved.every(k=>D.RES.includes(k))&&new Set(saved).size===saved.length)return saved;
 const focus=st.hero.productionFocus;return focus==='all'?[...D.RES]:D.RES.includes(focus)?[focus]:['wood'];
}
function heroFocus(st){const selected=heroTargets(st);return selected.length===4?'all':selected.length===1?selected[0]:'custom';}
function heroBonus(st,k,v){if(v.id!==st.villages[0].id||!st.hero.resources)return 0;const targets=heroTargets(st);return targets.includes(k)?st.hero.resources*st.speed*8/targets.length:0;}
function setHeroTargets(st,targets){
 if(!Array.isArray(targets)||targets.length<1||targets.length>4||new Set(targets).size!==targets.length||!targets.every(k=>D.RES.includes(k)))return {ok:false,error:'Selecione de um a quatro recursos distintos.'};
 st.hero.productionTargets=[...D.RES].filter(k=>targets.includes(k));st.hero.productionFocus=heroFocus(st);save(st);return {ok:true,targets:st.hero.productionTargets};
}
function setHeroFocus(st,focus){if(![...D.RES,'all'].includes(focus))return {ok:false,error:'Escolha um recurso válido ou todos.'};return setHeroTargets(st,focus==='all'?[...D.RES]:[focus]);}
function village(st,name,x,y,starter=false,profile='balanced') {
 const fields = fieldMix(profile).map((type,i)=>({type,level:starter?1:0,id:i}));
 const buildings = {main:starter?3:1,warehouse:1,granary:1,rally:1};
 const troops = {};
 if(starter) troops[D.TROOPS[st.tribe][0].id]=12;
 return {id:id(st),name,x,y,fieldProfile:profile,planQueue:[],fields,buildings,resources:starter?{wood:1000,clay:1000,iron:1000,crop:1000}:{wood:650,clay:650,iron:650,crop:650},buildQueue:[],trainingQueue:[],troops,buildingSlots:{0:'main',1:'warehouse',2:'granary',3:'rally'},militaryTech:{},research:{unlocked:[D.TROOPS[st.tribe][0].id],queue:null},administrators:0,administratorQueue:null,settlers:0,foundedAt:now()};
}
function newGame(options={}) {
 const tribe = D.TRIBES[options.tribe]?options.tribe:'romans';
 const st={version:1,nextId:1,player:(options.player||'Comandante').trim().slice(0,25)||'Comandante',tribe,speed:clamp(Number(options.speed)||12,1,100),
  villages:[],activeVillageId:null,capitalVillageId:null,preferences:{enemyAttacks:options.enemyAttacks!==false,extraBuildSlots:1,viewMode:'original'},hero:{name:'Guardião',level:1,xp:0,hp:100,attack:4,resources:0,points:0,adventure:null,adventures:0,inventory:[],equipped:null,productionFocus:'wood',productionTargets:['wood']},
  world:{seed:37,tiles:[]},movements:[],reports:[],events:[],questsClaimed:[],tutorialDismissed:false,createdAt:now(),lastTick:now()};
 const home=village(st,(options.village||'Nova Esperança').trim().slice(0,28)||'Nova Esperança',0,0,true);
 st.villages=[home];st.activeVillageId=home.id;st.capitalVillageId=home.id;
 for(let y=-8;y<=8;y++)for(let x=-8;x<=8;x++){
  if(x===0&&y===0)continue;
  const roll=random(x,y);
  let kind='empty';if(roll>.85)kind='enemy';else if(roll>.72)kind='oasis';
  if([[2,0],[-2,1],[1,-2],[-3,-2],[3,3]].some(([a,b])=>a===x&&b===y))kind='enemy';
  const power=Math.max(1,Math.round((Math.abs(x)+Math.abs(y))*1.5+random(y,x)*5));
  const prefix=['Acampamento','Baluarte','Ruínas','Refúgio','Posto'][Math.floor(random(x+3,y+4)*5)];
  st.world.tiles.push({id:`${x}:${y}`,x,y,kind,name:kind==='enemy'?`${prefix} Sombrio`:kind==='oasis'?'Oásis Selvagem':'Vale Desabitado',
   power:kind==='enemy'?power:0,resources:kind==='enemy'?{wood:130+power*29,clay:110+power*27,iron:110+power*25,crop:160+power*26}:null});
 }
 if(window.GSF_AI)window.GSF_AI.init(st,now());
 window.GSF_CAMPAIGN?.init(st,options.difficulty);
 window.GSF_EXPANSION?.init(st);
 log(st,'Bem-vindo ao Guerra Sem Fim! Sua aldeia está pronta para crescer.','welcome');
 report(st,'O início de um império','Seu povo ergueu os primeiros edifícios e aguarda suas ordens. Expanda os campos, crie um exército e descubra o mapa.', 'info');
 save(st);return st;
}
// Um Palácio por império e capital inicial preservada em campanhas legadas.
function capital(st){return st.villages.find(v=>v.id===st.capitalVillageId)||st.villages[0];}
function isCapital(st,v){return !!v&&capital(st)?.id===v.id;}
function setCapital(st,v){
 if(!v||!st.villages.includes(v))return {ok:false,error:'Aldeia inválida.'};
 if(isCapital(st,v))return {ok:false,error:'Esta aldeia já é a capital.'};
 const old=capital(st);if(old?.fields.some(f=>f.level>20))return {ok:false,error:'Não é possível transferir a capital enquanto a antiga possui campos acima do nível 20.'};
 if(buildLevel(v,'palace')<1)return {ok:false,error:'Construa um Palácio para transferir a capital.'};
 st.capitalVillageId=v.id;
 log(st,`${v.name} tornou-se a nova capital do império.`,'build');
 report(st,'Capital transferida',`${v.name} é agora a capital e pode desenvolver campos até o nível 25.`,'info');
 save(st);return {ok:true};
}
function fieldMax(st,v){return isCapital(st,v)?25:20;}
function active(st){return st.villages.find(v=>v.id===st.activeVillageId)||st.villages[0];}
function tileAt(st,x,y){const owned=st.villages.find(v=>v.x===x&&v.y===y);if(owned)return {id:owned.id,x,y,kind:'player',name:owned.name};const rival=window.GSF_AI?.tileAt(st,x,y);return rival||st.world.tiles.find(t=>t.x===x&&t.y===y)||null;}
function buildLevel(v,key){return v.buildings[key]||0;}
function cost(type,key,next) {const base=type==='field'?D.FIELDS[key].base:D.BUILDINGS[key].base;return base.map(n=>Math.ceil(n*Math.pow(1.32,next-1)));}
function buildTime(st,v,type,key,next){const base=type==='field'?D.FIELDS[key].time:D.BUILDINGS[key].time;const main=buildLevel(v,'main');return Math.max(5,Math.round(base*Math.pow(1.23,next-1)*Math.pow(0.96,Math.max(0,main-1))/st.speed));}
function capacity(v,key){return key==='crop'?Math.round(1200*Math.pow(1.52,Math.max(0,buildLevel(v,'granary')-1))):Math.round(1200*Math.pow(1.52,Math.max(0,buildLevel(v,'warehouse')-1)));}
function troopDefs(st){return D.TROOPS[st.tribe];}
// Academia: unidades básicas são gratuitas; as demais exigem uma pesquisa por aldeia.
// Pesquisas concluídas pertencem à aldeia e não são transferidas com reforços.
function researchRule(st,unit){
 const defs=troopDefs(st),index=defs.findIndex(u=>u.id===unit.id);
 if(index===0)return {academy:0,rank:0};
 if(unit.siege)return {academy:unit.siege==='catapult'?10:7,rank:unit.siege==='catapult'?7:6};
 if(unit.scout)return {academy:2,rank:3};
 if(unit.cavalry)return {academy:5,rank:5};
 return {academy:index===1?1:3,rank:index===1?1:2};
}
function initResearch(st,v){
 if(v.research)return v.research;
 // Migração de saves antigos: uma unidade já recrutável continua desbloqueada.
 const eligible=troopDefs(st).filter((u,i)=>i===0||buildLevel(v,u.building)>0||(v.troops[u.id]||0)>0||v.trainingQueue.some(q=>q.unitId===u.id)||(v.militaryTech?.[u.id]||0)>0);
 v.research={unlocked:eligible.map(u=>u.id),queue:null};
 return v.research;
}
function unitUnlocked(st,v,unitId){
 const unit=troopDefs(st).find(u=>u.id===unitId);if(!unit)return false;
 if(!v.research)return troopDefs(st)[0].id===unitId||buildLevel(v,unit.building)>0||(v.troops[unitId]||0)>0||v.trainingQueue.some(q=>q.unitId===unitId)||(v.militaryTech?.[unitId]||0)>0;
 return v.research.unlocked.includes(unitId);
}
function researchPrice(st,unitId){
 const u=troopDefs(st).find(t=>t.id===unitId);if(!u)return null;
 const {rank}=researchRule(st,u);return u.cost.map(n=>Math.ceil(n*(1.4+rank*.32)));
}
function canResearch(st,v,unitId){
 const unit=troopDefs(st).find(t=>t.id===unitId);
 if(!unit)return {ok:false,error:'Unidade desconhecida.'};
 const {academy,rank}=researchRule(st,unit);
 if(!academy)return {ok:false,error:'Esta unidade já está disponível desde o início.'};
 if(unitUnlocked(st,v,unitId))return {ok:false,error:'Unidade já pesquisada nesta aldeia.'};
 const queue=v.research?.queue;
 if(queue)return {ok:false,error:'Uma pesquisa já está em andamento nesta aldeia.'};
 if(buildLevel(v,'academy')<academy)return {ok:false,error:`Requer Academia nível ${academy}.`};
 if(buildLevel(v,unit.building)<1)return {ok:false,error:`Requer ${D.BUILDINGS[unit.building].name}.`};
 const price=researchPrice(st,unitId);
 if(!canPay(v,price))return {ok:false,error:'Recursos insuficientes para pesquisar.'};
 const seconds=Math.max(12,Math.ceil(unit.time*(3+rank*.5)/(st.speed*(1+.08*(buildLevel(v,'academy')-1)))));
 return {ok:true,unit,price,seconds,academy};
}
function startResearch(st,v,unitId){
 const c=canResearch(st,v,unitId);if(!c.ok)return c;
 const research=initResearch(st,v);
 pay(v,c.price);
 research.queue={unitId,startedAt:now(),endsAt:now()+c.seconds*1000};
 log(st,`Academia de ${v.name}: iniciada a pesquisa de ${c.unit.name}.`,'army');save(st);
 return {ok:true,seconds:c.seconds};
}
function population(v){let n=2;for(const [k,l] of Object.entries(v.buildings))n+=l*(D.BUILDINGS[k]?.pop||0);n+=v.fields.reduce((a,f)=>a+Math.ceil(f.level/3),0);return n;}
function upkeep(st,v){return troopDefs(st).reduce((a,t)=>a+(v.troops[t.id]||0)*t.upkeep,0);}
function production(st,v){const base={wood:0,clay:0,iron:0,crop:0};v.fields.forEach(f=>{base[f.type]+=f.level?Math.round(5*Math.pow(1.68,f.level-1)):0;});
 const out={};const bonus={wood:'sawmill',clay:'brickyard',iron:'ironworks',crop:'mill'};
 D.RES.forEach(k=>{const item=HERO_ARTIFACTS[st.hero.equipped];const gearBonus=st.villages[0].id===v.id&&(item?.type===k||item?.type==='all')?item.bonus:0;out[k]=Math.floor(base[k]*(1+0.05*buildLevel(v,bonus[k])+gearBonus)*st.speed);});
 const oases=st.world.tiles.filter(t=>t.kind==='oasis'&&t.ownerVillageId===v.id);
 for(const t of oases){const key=oasisResource(t);out[key]+=Math.floor(base[key]*.25*st.speed);}
 for(const key of D.RES)out[key]+=heroBonus(st,key,v);
 out.crop-=population(v)+upkeep(st,v);return out;
}
function canPay(v,price,count=1){return D.RES.every((k,i)=>v.resources[k]+0.000001>=price[i]*count);}
function pay(v,price,count=1){if(!canPay(v,price,count))return false;D.RES.forEach((k,i)=>v.resources[k]-=price[i]*count);return true;}
function addResources(v,rewards){D.RES.forEach(k=>v.resources[k]=clamp(v.resources[k]+(rewards[k]||0),0,capacity(v,k)));}
function unmet(v,key){const req=D.BUILDINGS[key].req;return Object.entries(req).filter(([k,l])=>buildLevel(v,k)<l).map(([k,l])=>`${D.BUILDINGS[k].name} nível ${l}`);}
const MAX_EXTRA_BUILD_SLOTS=8;
function viewMode(st){return st?.preferences?.viewMode==='compact'?'compact':'original';}
function setViewMode(st,mode){
 if(!st||!['original','compact'].includes(mode))return {ok:false,error:'Modo de visualização inválido.'};
 st.preferences??={enemyAttacks:true,extraBuildSlots:1};
 st.preferences.viewMode=mode;
 return {ok:true};
}
function extraBuildSlots(st){const x=st.preferences?.extraBuildSlots;return Number.isSafeInteger(x)?clamp(x,0,MAX_EXTRA_BUILD_SLOTS):1;}
function buildQueueCapacity(st){return (st.tribe==='romans'?2:1)+extraBuildSlots(st);}
function setBuildSlots(st,value){const n=Number(value);if((typeof value!=='string'&&typeof value!=='number')||String(value).trim()===''||!Number.isSafeInteger(n)||n<0||n>MAX_EXTRA_BUILD_SLOTS)return {ok:false,error:'Selecione entre 0 e 8 vagas extras.'};
 st.preferences??={enemyAttacks:true};st.preferences.extraBuildSlots=n;
 save(st);return {ok:true,capacity:buildQueueCapacity(st)};}
function canBuild(st,v,type,ref,slot) {
 let key,level;
 if(type==='field') {const f=v.fields[ref];if(!f)return {ok:false,error:'Campo inválido.'};key=f.type;level=f.level;if(level>=fieldMax(st,v))return {ok:false,error:'Nível máximo.'};}
 else {key=ref;if(!D.BUILDINGS[key])return {ok:false,error:'Edifício desconhecido.'};level=buildLevel(v,key);if(level>=D.BUILDINGS[key].max)return {ok:false,error:'Nível máximo.'};const req=unmet(v,key);if(req.length)return {ok:false,error:'Requer: '+req.join(', ')};
   if(level===0&&(slot===undefined||slot===null||v.buildingSlots[slot]))return {ok:false,error:'Escolha um terreno livre.'};
   if(level===0&&Object.values(v.buildingSlots).includes(key))return {ok:false,error:'Este edifício já foi construído.'};
   if(level===0&&key==='palace'&&st.villages.some(other=>other!==v&&(buildLevel(other,'palace')>0||other.buildQueue.some(q=>q.type==='building'&&q.ref==='palace'))))return {ok:false,error:'Seu império pode ter apenas um Palácio.'};
 }
 // Uma fila extra por padrão, ajustável em Configurações. Os Romanos mantêm
 // uma obra de campo e uma obra civil em paralelo, além das vagas extras flexíveis.
 if(v.buildQueue.some(q=>q.type===type&&(type==='field'?q.ref===ref:q.ref===ref)))
  return {ok:false,error:'Este local já possui uma melhoria em andamento.'};
 const extra=extraBuildSlots(st),max=buildQueueCapacity(st);
 if(v.buildQueue.length>=max)return {ok:false,error:`Todas as ${max} vagas de construção estão ocupadas.`};
 if(st.tribe==='romans'){
  const fieldJobs=v.buildQueue.filter(q=>q.type==='field').length+(type==='field'?1:0);
  const buildingJobs=v.buildQueue.filter(q=>q.type==='building').length+(type==='building'?1:0);
  if(Math.max(0,fieldJobs-1)+Math.max(0,buildingJobs-1)>extra)
   return {ok:false,error:'Não há vaga extra para outra obra deste tipo.'};
 }
 const price=cost(type,key,level+1);if(!canPay(v,price))return {ok:false,error:'Recursos insuficientes.',price};
 return {ok:true,price,seconds:buildTime(st,v,type,key,level+1),level:level+1,key};
}
function startBuild(st,v,type,ref,slot){const c=canBuild(st,v,type,ref,slot);if(!c.ok)return c;
 pay(v,c.price);if(type==='building'&&buildLevel(v,ref)===0)v.buildingSlots[slot]=ref;
 v.buildQueue.push({id:id(st),type,ref,slot,level:c.level,endsAt:now()+c.seconds*1000});
 log(st,`Obra iniciada: ${type==='field'?D.FIELDS[c.key].name:D.BUILDINGS[c.key].name} nível ${c.level}.`,'build');save(st);return {ok:true};
}
function cancelBuild(st,v,idValue){const i=v.buildQueue.findIndex(q=>q.id===idValue);if(i<0)return {ok:false,error:'Obra não encontrada.'};const q=v.buildQueue[i];const key=q.type==='field'?v.fields[q.ref].type:q.ref;const refund=cost(q.type,key,q.level);D.RES.forEach((k,j)=>v.resources[k]=Math.min(capacity(v,k),v.resources[k]+Math.floor(refund[j]*0.75)));
 if(q.type==='building'&&buildLevel(v,q.ref)===0)delete v.buildingSlots[q.slot];v.buildQueue.splice(i,1);log(st,'Construção cancelada. 75% dos recursos foram devolvidos.','build');save(st);return {ok:true};}
const MAX_BUILD_PLANS=40;
function plans(v){return v.planQueue||(v.planQueue=[]);}
function planBuild(st,v,type,ref,slot){
 if(!['field','building'].includes(type))return {ok:false,error:'Tipo de construção inválido.'};
 const queue=plans(v);if(queue.length>=MAX_BUILD_PLANS)return {ok:false,error:'Limite de 40 obras planejadas.'};
 if(type==='field'&&(!Number.isSafeInteger(ref)||ref<0||ref>=18||v.fields[ref].level>=fieldMax(st,v)))return {ok:false,error:'Campo indisponível.'};
 if(type==='building'&&(!D.BUILDINGS[ref]||!Number.isSafeInteger(slot)||slot<0||slot>=20))return {ok:false,error:'Edifício ou terreno inválido.'};
 if(type==='building'&&(v.buildingSlots[slot]&&v.buildingSlots[slot]!==ref||!v.buildingSlots[slot]&&Object.values(v.buildingSlots).includes(ref)))return {ok:false,error:'Este terreno ou edifício não está disponível.'};
 if(type==='building'&&buildLevel(v,ref)>=D.BUILDINGS[ref].max)return {ok:false,error:'Edifício no nível máximo.'};
 if(type==='building'&&ref==='palace'&&st.villages.some(other=>other!==v&&(buildLevel(other,'palace')>0||other.buildQueue.some(q=>q.type==='building'&&q.ref==='palace')||plans(other).some(q=>q.type==='building'&&q.ref==='palace'))))return {ok:false,error:'Seu império pode ter apenas um Palácio.'};
 if(queue.some(q=>q.type===type&&(type==='field'?q.ref===ref:q.ref===ref||q.slot===slot))||v.buildQueue.some(q=>q.type===type&&q.ref===ref))return {ok:false,error:'Esta obra já está na fila ou no planejamento.'};
 queue.push({id:id(st),type,ref,slot:type==='building'?slot:null});save(st);return {ok:true};
}
function removePlan(st,v,planId){const q=plans(v),i=q.findIndex(x=>x.id===planId);if(i<0)return {ok:false,error:'Obra planejada não encontrada.'};q.splice(i,1);save(st);return {ok:true};}
function movePlan(st,v,planId,direction){const q=plans(v),i=q.findIndex(x=>x.id===planId),j=i+(direction==='up'?-1:direction==='down'?1:0);if(i<0||j<0||j>=q.length||i===j)return {ok:false,error:'Não é possível mover esta obra.'};[q[i],q[j]]=[q[j],q[i]];save(st);return {ok:true};}
function runPlanned(st){
 let started=0;
 for(const v of st.villages){
  const q=plans(v);
  for(let i=0;i<q.length&&v.buildQueue.length<buildQueueCapacity(st);){
   const plan=q[i],res=canBuild(st,v,plan.type,plan.ref,plan.slot);
   if(res.ok){q.splice(i,1);const r=startBuild(st,v,plan.type,plan.ref,plan.slot);if(r.ok){started++;continue;}q.splice(i,0,plan);}
   i++;
  }
 }
 return started;
}
const MAX_TRAIN_BATCH=1000000;
function maxTrainable(st,v,unitId){
 const unit=troopDefs(st).find(t=>t.id===unitId);
 if(!v||!unit||buildLevel(v,unit.building)<1||!unitUnlocked(st,v,unitId))return 0;
 const queued=v.trainingQueue.filter(q=>q.unitId===unitId).reduce((total,q)=>total+q.qty,0);
 const availableSlots=Math.max(0,1000000-(v.troops[unitId]||0)-queued);
 const affordable=D.RES.map((k,i)=>unit.cost[i]>0?Math.floor((v.resources[k]+0.000001)/unit.cost[i]):MAX_TRAIN_BATCH);
 return Math.max(0,Math.min(MAX_TRAIN_BATCH,availableSlots,...affordable));
}
function canTrain(st,v,unitId,qty){const unit=troopDefs(st).find(t=>t.id===unitId);if(!unit)return {ok:false,error:'Unidade inválida.'};if(buildLevel(v,unit.building)<1)return {ok:false,error:`Requer ${D.BUILDINGS[unit.building].name}.`};
 if(!unitUnlocked(st,v,unitId))return {ok:false,error:`Pesquise ${unit.name} na Academia antes de recrutar.`};
 qty=Math.floor(Number(qty));if(!Number.isFinite(qty)||qty<1||qty>MAX_TRAIN_BATCH)return {ok:false,error:'Escolha entre 1 e 1.000.000 de unidades.'};
 const queued=v.trainingQueue.filter(q=>q.unitId===unitId).reduce((total,q)=>total+q.qty,0);
 if((v.troops[unitId]||0)+queued+qty>1000000)return {ok:false,error:'Limite de um milhão de tropas por unidade nesta aldeia.'};
 if(!canPay(v,unit.cost,qty))return {ok:false,error:'Recursos insuficientes.'};
 const seconds=Math.max(3,Math.floor(unit.time*Math.pow(.965,buildLevel(v,unit.building)-1)*qty/st.speed));return {ok:true,unit,qty,seconds};}
function train(st,v,unitId,qty){const c=canTrain(st,v,unitId,qty);if(!c.ok)return c;pay(v,c.unit.cost,c.qty);
 const last=v.trainingQueue.filter(q=>q.building===c.unit.building).reduce((a,b)=>Math.max(a,b.endsAt),now());
 v.trainingQueue.push({id:id(st),unitId,qty:c.qty,building:c.unit.building,endsAt:last+c.seconds*1000});
 log(st,`Recrutamento de ${c.qty} ${c.unit.name}(s) iniciado.`,'army');save(st);return {ok:true};}
const ADMIN_PRICE=[850,950,800,700];
function administratorName(st){return st.tribe==='romans'?'Senador':st.tribe==='gauls'?'Chefe de Clã':'Ancião';}
function canTrainAdministrator(st,v){
 if(!v||!st.villages.includes(v))return {ok:false,error:'Aldeia inválida.'};
 if(buildLevel(v,'residence')<10&&buildLevel(v,'palace')<10)return {ok:false,error:'Requer Residência ou Palácio nível 10.'};
 if(v.administratorQueue)return {ok:false,error:'Já existe um administrador sendo preparado.'};
 if((v.administrators||0)>=3)return {ok:false,error:'Limite de três administradores nesta aldeia.'};
 if(!canPay(v,ADMIN_PRICE))return {ok:false,error:'Recursos insuficientes para preparar o administrador.'};
 return {ok:true,price:[...ADMIN_PRICE],seconds:Math.max(10,Math.round(900/st.speed))};
}
function trainAdministrator(st,v){
 const c=canTrainAdministrator(st,v);if(!c.ok)return c;
 pay(v,ADMIN_PRICE);const startedAt=now();v.administratorQueue={startedAt,endsAt:startedAt+c.seconds*1000};
 log(st,`${administratorName(st)} em preparação em ${v.name}.`,'army');save(st);return {ok:true,seconds:c.seconds};
}
function sendConquest(st,v,x,y,army){
 const target=tileAt(st,x,y);
 if(!target||target.kind!=='rival')return {ok:false,error:'A conquista administrativa exige uma aldeia de reino rival.'};
 if(st.villages.length>=5)return {ok:false,error:'Limite de cinco aldeias atingido.'};
 if((v.administrators||0)<1)return {ok:false,error:`Prepare um ${administratorName(st)} antes de conquistar.`};
 if((window.GSF_EXPANSION?.culture(st)||0)<(window.GSF_EXPANSION?.neededCulture(st)||0))return {ok:false,error:'Pontos de cultura insuficientes para dominar outra aldeia.'};
 const choice=army&&typeof army==='object'&&!Array.isArray(army)?army:null;
 if(!choice||!troopDefs(st).some(u=>!u.scout&&!u.siege&&Number(choice[u.id]||0)>0))return {ok:false,error:'Escolha soldados de combate para escoltar o administrador.'};
 const r=send(st,v,x,y,army,'attack');if(!r.ok)return r;
 const march=st.movements[st.movements.length-1];march.mode='conquer';march.administrators=1;
 v.administrators--;
 log(st,`${administratorName(st)} partiu para reduzir a lealdade de ${target.name}.`,'army');save(st);
 return {ok:true,seconds:r.seconds};
}
function conquerRival(st,f,city,adminMarch){
 if(st.villages.length>=5)return false;
 const name=city.name,x=city.x,y=city.y;
 const profile=tileProfile({kind:'empty',x,y}),next=village(st,name,x,y,false,profile);
 const level=Math.max(1,Math.min(10,city.level||1));
 next.buildings.main=level;
 next.buildings.warehouse=Math.max(1,Math.min(8,Math.floor(level/2)));
 next.buildings.granary=Math.max(1,Math.min(8,Math.floor(level/2)));
 next.buildings.wall=Math.max(0,Math.min(8,city.walls||0));
 if(next.buildings.wall)next.buildingSlots[4]='wall';
 next.fields.forEach(field=>field.level=Math.max(1,Math.min(8,Math.floor(level/2))));
 for(const k of D.RES)next.resources[k]=Math.min(capacity(next,k),Math.floor(city.stock[k]||0));
 next.conqueredFrom=f.id;
 st.villages.push(next);
 f.villages.splice(f.villages.indexOf(city),1);
 if(!f.villages.length)f.defeated=true;
 // Uma marcha inimiga que partiu da aldeia conquistada deixa de ser hostil.
 for(const m of (st.ai?.movements||[]).slice().filter(m=>m.sourceId===city.id&&m.phase==='outbound')){
  st.ai.movements.splice(st.ai.movements.indexOf(m),1);
 }
 adminMarch.administrators=0;st.activeVillageId=next.id;
 log(st,`${name} passou ao controle do império!`,'army');
 report(st,'Aldeia conquistada',`${name} (${x}|${y}) foi incorporada ao império com parte de seus campos, edifícios e recursos preservados.`,'victory');
 return true;
}
function distance(a,b){return Math.hypot(a.x-b.x,a.y-b.y);}
function send(st,v,x,y,army,mode='raid'){
 const target=tileAt(st,x,y);
 if(!target||!['enemy','rival'].includes(target.kind))return {ok:false,error:'Escolha um acampamento ou reino rival no mapa.'};
 if(target.kind==='rival'&&window.GSF_CAMPAIGN?.isAlly(st,target.factionId))return {ok:false,error:'Esta facção é sua aliada. Rompa o pacto antes de atacar (ainda não disponível).'};
 if(buildLevel(v,'rally')<1)return {ok:false,error:'Construa o Ponto de Reunião.'};
 if(!army||typeof army!=='object'||Array.isArray(army))return {ok:false,error:'Seleção de tropas inválida.'};
 if(!['raid','attack','scout'].includes(mode))return {ok:false,error:'Tipo de missão inválido.'};
 const chosen={};let count=0,speed=Infinity,power=0;
 const defs=troopDefs(st),allowed=new Set(defs.map(t=>t.id));
 for(const unitId of Object.keys(army)){
  if(!allowed.has(unitId))return {ok:false,error:'Unidade desconhecida.'};
  const qty=Number(army[unitId]);
  if(!Number.isSafeInteger(qty)||qty<0)return {ok:false,error:'Quantidade de tropas inválida.'};
 }
 for(const t of defs){
  const n=Number(army[t.id]??0);
  if(n>(v.troops[t.id]||0))return {ok:false,error:`Tropas insuficientes: ${t.name}.`};
  if(n>0){chosen[t.id]=n;count+=n;speed=Math.min(speed,t.speed);power+=n*t.attack;}
 }
 if(count<=0)return {ok:false,error:'Selecione tropas disponíveis.'};
 if(count>20000)return {ok:false,error:'Limite de 20.000 unidades por marcha.'};
 if(mode==='scout'&&defs.some(t=>chosen[t.id]&&!t.scout))return {ok:false,error:'Envie somente batedores para espionagem.'};
 if(mode!=='scout'&&!defs.some(t=>chosen[t.id]&&!t.scout))return {ok:false,error:'Envie unidades de combate para atacar.'};
 const startedAt=now(),seconds=Math.max(5,Math.ceil(distance(v,target)*120/(speed*st.speed)));
 for(const [k,n] of Object.entries(chosen))v.troops[k]-=n;
 st.movements.push({id:id(st),villageId:v.id,targetId:target.id,x,y,army:chosen,mode,phase:'going',endsAt:startedAt+seconds*1000,startedAt,power});
 log(st,`Exército enviado para ${target.name} (${x}|${y}).`,'army');save(st);return {ok:true,seconds};
}
// Transferência de tropas: entre aldeias próprias, sem duplicar unidades.
// Previsão aproximada: não altera a campanha nem executa a batalha.
function simulate(st,v,x,y,army){
 const target=tileAt(st,x,y),defs=troopDefs(st);
 if(!target||!['rival','enemy'].includes(target.kind))return {ok:false,error:'Escolha um alvo hostil.'};
 if(!army||typeof army!=='object'||Array.isArray(army))return {ok:false,error:'Tropas inválidas.'};
 let count=0;for(const [key,value] of Object.entries(army)){
  if(!defs.some(u=>u.id===key)||!Number.isSafeInteger(Number(value))||Number(value)<0||Number(value)>(v.troops[key]||0))return {ok:false,error:'Quantidade inválida.'};count+=Number(value);
 }
 if(!count)return {ok:false,error:'Selecione tropas para simular.'};
 const power=window.GSF_WAR.offense(army,defs,v)*(window.GSF_CAMPAIGN?.attackBonus(st)||1),defense=target.kind==='rival'?(target.power*27+18)*window.GSF_WAR.fortification(target.walls||0):target.power*32+10;
 const wins=target.kind==='rival'?power>=defense*.85:power>=defense*.72;
 const ratio=wins?Math.min(.65,defense/(power+defense)*.72):Math.min(1,.50+defense/(power+defense)*.43);
 return {ok:true,power:Math.round(power),defense:Math.round(defense),wins,losses:Math.round(count*ratio),units:count,warning:'Estimativa simplificada; resultados reais podem variar conforme tropas e fortificações.'};
}
function reinforce(st,from,targetVillageId,army){
 const target=st.villages.find(v=>v.id===targetVillageId);
 if(!target||target.id===from.id)return {ok:false,error:'Selecione outra aldeia sua.'};
 if(!army||typeof army!=='object'||Array.isArray(army))return {ok:false,error:'Seleção inválida.'};
 const defs=troopDefs(st),known=new Set(defs.map(u=>u.id));
 if(Object.keys(army).some(k=>!known.has(k)||!Number.isSafeInteger(Number(army[k]))||Number(army[k])<0))return {ok:false,error:'Quantidades inválidas.'};
 const chosen={};let speed=Infinity,count=0;
 for(const u of defs){const qty=Number(army[u.id]||0);if(qty>(from.troops[u.id]||0))return {ok:false,error:'Tropas insuficientes.'};if(qty){chosen[u.id]=qty;count+=qty;speed=Math.min(speed,u.speed);}}
 if(count<1||count>20000)return {ok:false,error:'Escolha entre 1 e 20.000 soldados.'};
 const startedAt=now(),seconds=Math.max(5,Math.ceil(distance(from,target)*120/(speed*st.speed)));
 for(const [unit,qty] of Object.entries(chosen))from.troops[unit]-=qty;
 st.movements.push({id:id(st),villageId:from.id,targetVillageId:target.id,targetId:target.id,x:target.x,y:target.y,army:chosen,mode:'reinforce',phase:'going',endsAt:startedAt+seconds*1000,startedAt,power:0});
 log(st,`Reforços enviados de ${from.name} para ${target.name}.`,'army');save(st);return {ok:true,seconds};
}
function upgradeMilitary(st,v,unitId){
 const unit=troopDefs(st).find(u=>u.id===unitId);if(!unit)return {ok:false,error:'Unidade inválida.'};
 const smithy=buildLevel(v,'smithy'),lv=window.GSF_WAR.tier(v,unitId);
 if(!smithy)return {ok:false,error:'Construa um Ferreiro.'};
 if(!unitUnlocked(st,v,unitId))return {ok:false,error:'Pesquise esta unidade na Academia antes de aprimorá-la no Ferreiro.'};
 if(lv>=10||lv>=smithy)return {ok:false,error:'Eleve o nível do Ferreiro para pesquisar mais.'};
 const price=window.GSF_WAR.upgradeCost(unit,lv+1);
 if(!pay(v,price))return {ok:false,error:'Recursos insuficientes.'};
 v.militaryTech??={};v.militaryTech[unitId]=lv+1;
 log(st,`Ferreiro: ${unit.name} aprimorado para nível ${lv+1}.`,'army');save(st);return {ok:true,level:lv+1};
}
function resolveScouting(st,m,at){
 const target=tileAt(st,m.x,m.y);
 const spies=troopDefs(st).reduce((n,u)=>n+(u.scout?(m.army[u.id]||0):0),0);
 let strength=0,intel='';
 if(target?.kind==='rival'){
  const ref=st.ai?.factions.flatMap(f=>f.villages.map(v=>({f,v}))).find(o=>o.v.x===m.x&&o.v.y===m.y);
  if(ref){strength=ref.v.walls+Math.floor(ref.v.level/2);intel=`Guarnição: ${ref.v.troops} · Muralha: nível ${ref.v.walls} · Fortaleza: nível ${ref.v.level} · Recursos: ${D.RES.map(k=>k+' '+ref.v.stock[k]).join(', ')}.`;}
 }else if(target?.kind==='enemy'){
  strength=Math.floor(target.power/3);intel=`Inimigos estimados: ${target.power} · Recursos: ${D.RES.map(k=>k+' '+target.resources[k]).join(', ')}.`;
 }
 const success=spies>strength;
 if(!success){for(const u of troopDefs(st)){if(u.scout)m.army[u.id]=Math.floor((m.army[u.id]||0)*.5);} }
 report(st,success?'Espionagem bem-sucedida':'Batedores descobertos',success?`Relatório de (${m.x}|${m.y}): ${intel}`:`Os defensores detectaram os batedores em (${m.x}|${m.y}). Algumas unidades foram perdidas.` ,success?'victory':'defeat');
 m.loot=null;m.phase='returning';m.endsAt=at+Math.max(5000,at-m.startedAt);
}
function report(st,title,body,type='info',details=null){st.reports.unshift({id:id(st),title,body,type,details,at:now(),read:false});if(st.reports.length>100)st.reports.length=100;}
function log(st,message,type='info'){st.events.unshift({id:id(st),message,type,at:now()});if(st.events.length>45)st.events.length=45;}
function resolveBattle(st,m,arrivedAt){
 if(m.mode==='scout')return resolveScouting(st,m,arrivedAt);
 if(window.GSF_AI?.isRivalTarget(st,m))return window.GSF_AI.resolveBattle(st,m,arrivedAt);const v=st.villages.find(q=>q.id===m.villageId),t=st.world.tiles.find(q=>q.id===m.targetId);if(!v||!t){m.phase='returning';m.endsAt=arrivedAt+5000;return;}
 const defs=troopDefs(st);const atk=window.GSF_WAR.offense(m.army,defs,v)*(window.GSF_CAMPAIGN?.attackBonus(st)||1);const def=t.power*32+10;
 const win=atk>=def*0.72;const fraction=win?clamp((def/(atk+def))*0.55,0.02,0.58):clamp(def/(atk+def)*0.9,.4,1);
 const survivors={};const losses={};defs.forEach(u=>{const n=m.army[u.id]||0;const killed=Math.min(n,Math.round(n*fraction));if(n){survivors[u.id]=n-killed;losses[u.id]=killed;}});
 let loot={wood:0,clay:0,iron:0,crop:0};if(win){const carry=sum(defs.map(u=>(survivors[u.id]||0)*u.carry));const per=Math.floor(carry/4);D.RES.forEach(k=>{loot[k]=Math.min(per,t.resources[k]);t.resources[k]-=loot[k];});
  t.power=Math.max(0,t.power-(m.mode==='attack'?Math.ceil(atk/50):Math.ceil(atk/100)));}
 m.army=survivors;m.loot=loot;m.phase='returning';m.endsAt=arrivedAt+Math.max(5000,arrivedAt-m.startedAt);
 const lossText=Object.values(losses).reduce((a,b)=>a+b,0),total=Object.values(survivors).reduce((a,b)=>a+b,0);
 report(st,(win?'Vitória':'Derrota')+' em '+t.name,`As tropas ${win?'venceram o confronto':'foram repelidas'} em (${t.x}|${t.y}). Perdas: ${lossText}. Sobreviventes: ${total}. ${win?'O saque será recebido no retorno.':''}`,win?'victory':'defeat',{losses,loot,survivors});
 log(st,`Relatório de batalha: ${win?'vitória':'derrota'} em ${t.x}|${t.y}.`,'army');}
function returnArmy(st,m){const v=st.villages.find(q=>q.id===m.villageId);if(!v)return;
 for(const [id,n] of Object.entries(m.army))v.troops[id]=(v.troops[id]||0)+n;
 if(m.loot)addResources(v,m.loot);
 if(m.administrators)v.administrators=(v.administrators||0)+m.administrators;
 log(st,`As tropas voltaram a ${v.name}${m.loot?' com recursos saqueados':''}.`,'army');}
function startAdventure(st){if(st.hero.adventure)return {ok:false,error:'O herói já está em uma aventura.'};if(st.hero.hp<20)return {ok:false,error:'Seu herói precisa recuperar a saúde.'};
 const seconds=Math.max(10,Math.round(240/st.speed));st.hero.adventure={id:id(st),endsAt:now()+seconds*1000};log(st,'O herói partiu para explorar terras desconhecidas.','hero');save(st);return {ok:true};}
function resolveAdventure(st){st.hero.inventory ||= [];st.hero.adventures++;st.hero.xp+=36+st.hero.level*6;st.hero.hp=Math.max(15,st.hero.hp-8);if(st.hero.adventures===2||st.hero.adventures===4||st.hero.adventures===6){const reward=st.hero.adventures===2?'axe':st.hero.adventures===4?'horn':'crown';if(!st.hero.inventory.includes(reward)){st.hero.inventory.push(reward);log(st,`Artefato encontrado: ${HERO_ARTIFACTS[reward].name}.`,'hero');}}const v=st.villages[0];const r={wood:110+st.hero.level*20,clay:110+st.hero.level*20,iron:110+st.hero.level*20,crop:110+st.hero.level*20};addResources(v,r);
 while(st.hero.xp>=st.hero.level*100){st.hero.xp-=st.hero.level*100;st.hero.level++;st.hero.points+=4;st.hero.hp=100;log(st,`Seu herói subiu para o nível ${st.hero.level}!`,'hero');}
 report(st,'Aventura concluída',`O herói retornou com recursos e experiência. Recompensa: ${r.wood} de cada recurso e experiência de combate.`,'victory');
 log(st,'Seu herói concluiu a aventura com sucesso.','hero');st.hero.adventure=null;}
function equipHero(st,itemId){if(itemId!==null&&(!HERO_ARTIFACTS[itemId]||!(st.hero.inventory||[]).includes(itemId)))return {ok:false,error:'Artefato não encontrado no inventário.'};st.hero.equipped=itemId;save(st);return {ok:true};}
function spendHero(st,kind){if(!['attack','resources'].includes(kind)||st.hero.points<1)return {ok:false,error:'Sem pontos de atributo disponíveis.'};st.hero.points--;st.hero[kind]++;save(st);return {ok:true};}
function healHero(st){const v=active(st);const price=[100,100,100,100];if(st.hero.hp>=100)return {ok:false,error:'O herói já está saudável.'};if(!pay(v,price))return {ok:false,error:'Recursos insuficientes.'};st.hero.hp=Math.min(100,st.hero.hp+45);save(st);return {ok:true};}
// v1.1 — mercadores com carga mista, viagens de ida/volta e rotas automáticas.
const MERCHANT_CAPACITY={romans:500,gauls:750,teutons:1000};
const emptyCargo=()=>({wood:0,clay:0,iron:0,crop:0});
function merchantCapacity(st){return MERCHANT_CAPACITY[st.tribe]||500;}
function merchantsTotal(v){return buildLevel(v,'marketplace')?Math.min(80,5+2*(buildLevel(v,'marketplace')-1)):0;}
function merchantsBusy(st,v){return st.movements.filter(m=>m.mode==='merchant'&&m.villageId===v.id).reduce((n,m)=>n+(m.merchants||0),0);}
function merchantsFree(st,v){return Math.max(0,merchantsTotal(v)-merchantsBusy(st,v));}
function cleanCargo(cargo){
 if(!cargo||typeof cargo!=='object'||Array.isArray(cargo))return null;
 const clean=emptyCargo();for(const k of D.RES){const n=Number(cargo[k]||0);if(!Number.isSafeInteger(n)||n<0||n>1000000000)return null;clean[k]=n;}
 return clean;
}
function sendMerchantCargo(st,from,targetId,cargo,at=now(),automatic=false){
 const target=st.villages.find(v=>v.id===targetId);
 if(!target||target.id===from?.id)return {ok:false,error:'Escolha outra aldeia do seu império.'};
 if(!from||!st.villages.includes(from)||!merchantsTotal(from))return {ok:false,error:'Construa um Mercado na aldeia de origem.'};
 const c=cleanCargo(cargo),total=c&&D.RES.reduce((n,k)=>n+c[k],0);
 if(!c||total<50)return {ok:false,error:'Envie pelo menos 50 unidades no total.'};
 if(D.RES.some(k=>c[k]>from.resources[k]+0.000001))return {ok:false,error:'Não há recursos suficientes para este carregamento.'};
 const qty=Math.ceil(total/merchantCapacity(st));if(qty>merchantsFree(st,from))return {ok:false,error:`São necessários ${qty} mercadores e há ${merchantsFree(st,from)} disponíveis.`};
 if(st.movements.length>=490)return {ok:false,error:'Há muitas marchas em andamento.'};
 if(D.RES.some(k=>c[k]>Math.max(0,capacity(target,k)-target.resources[k])))return {ok:false,error:'O carregamento ultrapassa o espaço livre no depósito de destino.'};
 D.RES.forEach(k=>from.resources[k]-=c[k]);
 const seconds=Math.max(10,Math.ceil(distance(from,target)*240/st.speed));
 st.movements.push({id:id(st),villageId:from.id,targetVillageId:target.id,mode:'merchant',phase:'going',army:{},cargo:c,merchants:qty,startedAt:at,endsAt:at+seconds*1000,x:target.x,y:target.y});
 log(st,`${qty} mercador(es) de ${from.name} partiram para ${target.name} com ${total} recursos${automatic?' pela rota automática':''}.`,'trade');
 if(!automatic)save(st);return {ok:true,merchants:qty,seconds,cargo:c};
}
function routes(v){return v.tradeRoutes||(v.tradeRoutes=[]);}
function addTradeRoute(st,v,targetId,cargo,interval=60){
 const target=st.villages.find(t=>t.id===targetId),c=cleanCargo(cargo),n=c&&D.RES.reduce((a,k)=>a+c[k],0);
 const minutes=Number(interval);
 if(!target||target.id===v.id)return {ok:false,error:'Escolha outra aldeia.'};
 if(!merchantsTotal(v))return {ok:false,error:'Construa Mercado na aldeia.'};
 if(!c||n<50||n>merchantCapacity(st)*merchantsTotal(v))return {ok:false,error:'Carga fora da capacidade da frota.'};
 if(![15,30,60,180,360,720,1440].includes(minutes))return {ok:false,error:'Intervalo inválido.'};
 if(routes(v).length>=5)return {ok:false,error:'Máximo de 5 rotas por aldeia.'};
 const route={id:id(st),targetVillageId:targetId,cargo:c,interval:minutes,nextAt:now()+minutes*60000,enabled:true};
 routes(v).push(route);log(st,`Rota automática de ${v.name} até ${target.name} criada.`,'trade');save(st);return {ok:true,route};
}
function removeTradeRoute(st,v,routeId){const list=routes(v),index=list.findIndex(r=>r.id===routeId);if(index<0)return {ok:false,error:'Rota não encontrada.'};list.splice(index,1);save(st);return {ok:true};}
function toggleTradeRoute(st,v,routeId){const route=routes(v).find(r=>r.id===routeId);if(!route)return {ok:false,error:'Rota não encontrada.'};route.enabled=!route.enabled;if(route.enabled)route.nextAt=now()+route.interval*60000;save(st);return {ok:true,enabled:route.enabled};}
function processTradeRoutes(st,at){
 let acted=false;
 for(const v of st.villages)for(const route of routes(v)){
  if(!route.enabled||route.nextAt>at)continue;
  // Cada execução tem limite de 1 tentativa por rota, com agendamento futuro estável.
  route.nextAt=at+route.interval*60000;
  const r=sendMerchantCargo(st,v,route.targetVillageId,route.cargo,at,true);
  if(r.ok)acted=true;
 }
 return acted;
}
function canFestival(st,v){
 if(buildLevel(v,'townhall')<1)return {ok:false,error:'Construa uma Prefeitura.'};
 if(v.festivalQueue)return {ok:false,error:'Já há uma celebração em andamento.'};
 const price=[750,800,600,650];if(!canPay(v,price))return {ok:false,error:'A celebração exige 750 madeira, 800 barro, 600 ferro e 650 cereal.'};
 return {ok:true,price};
}
function startFestival(st,v){const c=canFestival(st,v);if(!c.ok)return c;pay(v,c.price);const at=now(),seconds=Math.max(60,Math.ceil(3600/st.speed));v.festivalQueue={startedAt:at,endsAt:at+seconds*1000};log(st,`Celebração iniciada na Prefeitura de ${v.name}.`,'quest');save(st);return {ok:true,seconds};}
function starvation(st,v,shortage,at){
 let amount=Math.min(100000,Math.ceil(shortage/6));if(amount<=0)return;
 for(const u of troopDefs(st)){
  const have=v.troops[u.id]||0;if(!have||!amount)continue;
  const kill=Math.min(have,amount);v.troops[u.id]-=kill;amount-=kill;
  v.famineLosses=(v.famineLosses||0)+kill;
  if(!amount)break;
 }
 if(v.famineLosses&&(at-(v.lastFamineAt||0)>3600000)){
  log(st,`Fome em ${v.name}: cereal insuficiente e tropas perdidas.`,'army');
  report(st,'Fome no exército',`O celeiro de ${v.name} ficou sem cereal; até agora ${v.famineLosses} tropas morreram de fome.`,'defeat');
  v.lastFamineAt=at;
 }
}
function produceSegment(st,v,hours,at){
 const r=production(st,v),cropStart=v.resources.crop;
 D.RES.forEach(k=>v.resources[k]=clamp(v.resources[k]+r[k]*hours,0,capacity(v,k)));
 if(r.crop<0&&cropStart+r.crop*hours<0)starvation(st,v,-(cropStart+r.crop*hours),at);
}
function maxExchangeOffer(v,from,to){
 if(!D.RES.includes(from)||!D.RES.includes(to)||from===to)return 0;
 const available=Math.max(0,Math.floor(v.resources[from]));
 const free=Math.max(0,Math.floor(capacity(v,to)-v.resources[to]));
 let left=0,right=available;
 while(left<right){const mid=Math.ceil((left+right)/2);if(Math.floor(mid*.75)<=free)left=mid;else right=mid-1;}
 return left>=100?left:0;
}
function trade(st,v,from,to,amount){amount=Number(amount);if(!Number.isSafeInteger(amount)||!D.RES.includes(from)||!D.RES.includes(to)||from===to||amount<100)return {ok:false,error:'Troca inválida (mínimo 100).'};
 if(buildLevel(v,'marketplace')<1)return {ok:false,error:'Construa o Mercado.'};
 const received=Math.floor(amount*.75);if(v.resources[from]<amount)return {ok:false,error:'Recursos insuficientes.'};if(v.resources[to]+received>capacity(v,to))return {ok:false,error:'Sem espaço no armazém de destino.'};
 v.resources[from]-=amount;v.resources[to]+=received;log(st,`Mercado: ${amount} ${D.RESOURCE[from].name} por ${received} ${D.RESOURCE[to].name}.`,'trade');save(st);return {ok:true,received};}
function sendCaravan(st,v,targetId,resource,amount){
 const target=st.villages.find(v=>v.id===targetId);
 if(!target||target.id===v.id)return {ok:false,error:'Escolha outra aldeia do seu império.'};
 if(buildLevel(v,'marketplace')<1)return {ok:false,error:'Construa um Mercado na aldeia de origem.'};
 const n=Number(amount);
 if(!D.RES.includes(resource)||!Number.isSafeInteger(n)||n<50||n>100000)return {ok:false,error:'Envie de 50 a 100.000 unidades de um recurso.'};
 if(v.resources[resource]<n)return {ok:false,error:'Recursos insuficientes.'};
 if(target.resources[resource]>=capacity(target,resource))return {ok:false,error:'O destino está com o armazenamento cheio.'};
 v.resources[resource]-=n;
 const seconds=Math.max(10,Math.ceil(distance(v,target)*240/st.speed));
 const cargo={wood:0,clay:0,iron:0,crop:0};cargo[resource]=n;
 st.movements.push({id:id(st),villageId:v.id,targetVillageId:target.id,mode:'trade',phase:'going',army:{},cargo,startedAt:now(),endsAt:now()+seconds*1000,x:target.x,y:target.y});
 log(st,`Caravana de ${n} ${D.RESOURCE[resource].name} enviada para ${target.name}.`,'trade');
 save(st);return {ok:true,seconds};
}
function trainSettlers(st,v,count=1){
 const n=Number(count);
 if(!Number.isSafeInteger(n)||n<1||n>3)return {ok:false,error:'Recrute de 1 a 3 colonizadores por vez.'};
 if(buildLevel(v,'residence')<10)return {ok:false,error:'Requer Residência nível 10.'};
 if((v.settlers||0)+n>3)return {ok:false,error:'Esta aldeia pode preparar até 3 colonizadores.'};
 const price=[350,350,350,350];if(!canPay(v,price,n))return {ok:false,error:'Recursos insuficientes: cada colonizador custa 350 de cada recurso.'};
 pay(v,price,n);v.settlers=(v.settlers||0)+n;
 log(st,`${n} colonizador(es) preparados em ${v.name}.`,'build');save(st);return {ok:true};
}
function settle(st,v,x,y,name){const tile=tileAt(st,x,y);if(!tile||tile.kind!=='empty')return {ok:false,error:'Escolha um vale desabitado.'};if(buildLevel(v,'residence')<10)return {ok:false,error:'É necessária uma Residência nível 10.'};
 if(st.villages.length>=5)return {ok:false,error:'Limite de cinco aldeias nesta versão.'};
 if((v.settlers||0)<3)return {ok:false,error:'Prepare 3 colonizadores na Residência da aldeia de origem.'};
 const culture=window.GSF_EXPANSION?.culture(st)||0,needed=window.GSF_EXPANSION?.neededCulture(st)||0;
 if(culture<needed)return {ok:false,error:`Cultura insuficiente: ${culture}/${needed} pontos.`};
 const price=[1600,1600,1600,1600];if(!canPay(v,price))return {ok:false,error:'Colonização custa 1.600 de cada recurso.'};
 pay(v,price);v.settlers-=3;const next=village(st,(name||'Nova Colônia').trim().slice(0,28)||'Nova Colônia',x,y,false,tileProfile(tile));st.villages.push(next);st.activeVillageId=next.id;
 log(st,`Uma nova aldeia foi fundada em (${x}|${y})!`,'build');report(st,'Nova aldeia fundada',`${next.name} agora faz parte do seu império.`,'victory');save(st);return {ok:true};}
// Missões progressivas inspiradas na organização geral das tarefas de Travian:
// missões globais e linhas de objetivos por aldeia. Arte, textos e recompensas são próprios.
function questList(st){
 const first=st.villages[0], claimed=new Set(st.questsClaimed||[]), out=[];
 const allTroops=st.villages.reduce((n,v)=>n+sum(Object.values(v.troops)),0);
 const add=(id,category,series,title,desc,progress,target,reward,xp=0,villageId=null)=>{
  const count=Number.isFinite(progress)?Math.max(0,Math.floor(progress)):0;
  out.push({id,category,series,title,desc,progress:count,target,done:count>=target,reward,xp,villageId,claimed:claimed.has(id)});
 };
 const legacy=[
  ['welcome','Primeiros passos','Inicie seu império.',1,1,120],
  ['fields','Terra fértil','Melhore 3 campos ao nível 2.',first.fields.filter(f=>f.level>=2).length,3,200],
  ['construction','Pedra sobre pedra','Construa ou melhore 5 edifícios (níveis somados: 12).',sum(Object.values(first.buildings)),12,300],
  ['army','Bandeira de guerra','Mantenha pelo menos 20 tropas em uma aldeia.',Math.max(...st.villages.map(v=>sum(Object.values(v.troops)))),20,280],
  ['adventure','Desbravador','Conclua uma aventura do herói.',st.hero.adventures,1,250],
  ['raid','Os despojos','Retorne com sucesso de um ataque.',st.reports.some(r=>r.type==='victory'&&r.title.includes('Vitória em'))?1:0,1,400],
  ['settle','Um novo horizonte','Funde uma segunda aldeia.',st.villages.length,2,800]
 ];
 for(const [key,title,desc,value,target,reward] of legacy)
  add(key,'Início',`intro:${key}`,title,desc,value,target,reward,20,first.id);
 const buildingGoals={
  main:[1,3,7,12,20],warehouse:[1,3,7,12,20],granary:[1,3,7,12,20],
  barracks:[1,3,7,12,20],stable:[1,3,7,12,20],academy:[1,10,20],
  smithy:[1,10,20],townhall:[1,10,20],workshop:[1],rally:[1,10,20],
  marketplace:[1,3,7,12,20],embassy:[1,3,7,12,20],residence:[1,3,7,10,20],
  heroMansion:[1,10,20],wall:[1,3,7,12,20],cranny:[1,3,6,10],
  sawmill:[1,5],brickyard:[1,5],ironworks:[1,5],mill:[1,5]
 };
 const military=new Set(['barracks','stable','academy','smithy','workshop','rally','wall']);
 const resourceBuildings=new Set(['warehouse','granary','marketplace','cranny','sawmill','brickyard','ironworks','mill']);
 const resourceGoals=[2,4,7,10];
 for(const [position,v] of st.villages.entries()){
  const scope=`v:${v.id}`,fresh=position>0;
  for(const [key,baseTargets] of Object.entries(buildingGoals)){
   const b=D.BUILDINGS[key];
   const targets=fresh?baseTargets.filter(n=>n===1||n===10||n===20):baseTargets;
   for(const [index,target] of targets.entries()){
    if(target>b.max)continue;
    const cat=military.has(key)?'Militar':resourceBuildings.has(key)?'Economia':'Aldeia';
    add(`${scope}:b:${key}:${target}`,cat,`${scope}:b:${key}`,`${b.name} — nível ${target}`,
     `${v.name}: evolua ${b.name} até o nível ${target}.`,buildLevel(v,key),target,
     Math.min(3200,70+target*48+index*85),15+target*3,v.id);
   }
  }
  for(const resource of D.RES){
   const fields=v.fields.filter(f=>f.type===resource);
   for(const [i,target] of resourceGoals.entries()){
    const progress=Math.max(...fields.map(f=>f.level));
    add(`${scope}:field:${resource}:${target}`,'Campos',`${scope}:field:${resource}`,
     `${D.FIELDS[resource].name} — nível ${target}`,
     `${v.name}: eleve pelo menos um campo de ${D.RESOURCE[resource].name.toLowerCase()} ao nível ${target}.`,
     progress,target,Math.min(2400,140+target*60+i*40),15+target*3,v.id);
   }
   for(const target of [2,3,5,8,10]){
    const count=fields.filter(f=>f.level>=target).length;
    add(`${scope}:all:${resource}:${target}`,'Campos',`${scope}:all:${resource}`,
     `Todos os campos de ${D.RESOURCE[resource].name} — nível ${target}`,
     `${v.name}: tenha os ${fields.length} campos de ${D.RESOURCE[resource].name.toLowerCase()} no nível ${target}.`,
     count,fields.length,Math.min(3300,250+target*65),25+target*4,v.id);
   }
  }
  for(const target of [2,4,7,8,9,10]){
   const progress=v.fields.filter(f=>f.level>=target).length;
   add(`${scope}:all-fields:${target}`,'Campos',`${scope}:all-fields`,
    `Desenvolvimento equilibrado — nível ${target}`,
    `${v.name}: eleve todos os 18 campos ao nível ${target}.`,
    progress,18,Math.min(4500,380+target*95),40+target*4,v.id);
  }
  for(const [i,target] of [50,100,150,250,350,500,750,1000].entries()){
   add(`${scope}:pop:${target}`,'Aldeia',`${scope}:pop`,`${v.name}: ${target} habitantes`,
    `Alcance ${target} habitantes nesta aldeia.`,population(v),target,180+100*i,30+i*8,v.id);
  }
 }
 for(const [i,target] of [50,100,150,250,350,500,750,1000].entries()){
  const count=st.villages.reduce((n,v)=>n+population(v),0);
  add(`g:population:${target}`,'Império','g:population',`Império populoso — ${target}`,
   `Tenha pelo menos ${target} habitantes somando todas as aldeias.`,count,target,280+i*155,40+i*10,first.id);
 }
 for(const [i,target] of [1,3,5,10,20,30].entries()){
  add(`g:adventures:${target}`,'Herói','g:adventures',`Explorador experiente — ${target} aventuras`,
   `Conclua ${target} aventuras com o herói.`,st.hero.adventures,target,180+i*230,30+i*20,first.id);
 }
 for(const [i,target] of [25,50,100,200,400].entries()){
  add(`g:troops:${target}`,'Militar','g:troops',`Força militar — ${target} soldados`,
   `Mantenha ${target} soldados disponíveis nas suas aldeias.`,allTroops,target,180+i*255,35+i*15,first.id);
 }
 for(const [i,target] of [2,3,4,5].entries()){
  add(`g:villages:${target}`,'Império','g:villages',`Novas fronteiras — ${target} aldeias`,
   `Controle ${target} aldeias em seu império.`,st.villages.length,target,650+i*400,70+i*25,first.id);
 }
 const oases=st.world.tiles.filter(t=>t.kind==='oasis'&&st.villages.some(v=>v.id===t.ownerVillageId)).length;
 for(const [i,target] of [1,2,3,5].entries()){
  add(`g:oases:${target}`,'Expansão','g:oases',`Senhor dos oásis — ${target}`,
   `Conquiste ${target} oásis para suas aldeias.`,oases,target,400+i*245,55+i*25,first.id);
 }
 return out;
}
function claim(st,questId){
 const q=questList(st).find(q=>q.id===questId);
 if(!q||!q.done||q.claimed)return {ok:false,error:'Missão ainda não concluída ou já resgatada.'};
 const v=st.villages.find(v=>v.id===q.villageId)||st.villages[0];
 // Grava o resgate de forma atômica: não permite obter a mesma recompensa duas vezes.
 st.questsClaimed.push(q.id);
 addResources(v,{wood:q.reward,clay:q.reward,iron:q.reward,crop:q.reward});
 st.hero.xp+=(q.xp||0);
 while(st.hero.xp>=st.hero.level*100&&st.hero.level<1000){
  st.hero.xp-=st.hero.level*100;st.hero.level++;st.hero.points+=4;st.hero.hp=100;
  log(st,`Seu herói subiu para o nível ${st.hero.level}!`,'hero');
 }
 log(st,`Missão concluída: ${q.title} (+${q.reward} de cada recurso e +${q.xp||0} EXP).`,'quest');
 save(st);return {ok:true};
}
// Processa eventos em ordem temporal antes de contabilizar a produção do próximo trecho.
// Isto evita perder construções, retornos de tropas ou mudanças econômicas durante o tempo offline.
function resolveDue(st,at){
 let resolved=false;
 for(const v of st.villages){
  const completed=v.buildQueue.filter(q=>q.endsAt<=at);
  for(const q of completed){
   if(q.type==='field')v.fields[q.ref].level=q.level;
   else v.buildings[q.ref]=q.level;
   log(st,`Obra concluída: ${q.type==='field'?D.FIELDS[v.fields[q.ref].type].name:D.BUILDINGS[q.ref].name} nível ${q.level}.`,'build');
   resolved=true;
  }
  v.buildQueue=v.buildQueue.filter(q=>q.endsAt>at);
  const recruited=v.trainingQueue.filter(q=>q.endsAt<=at);
  for(const q of recruited){
   v.troops[q.unitId]=(v.troops[q.unitId]||0)+q.qty;
   log(st,`${q.qty} tropas terminaram o treinamento em ${v.name}.`,'army');resolved=true;
  }
  v.trainingQueue=v.trainingQueue.filter(q=>q.endsAt>at);
  if(v.administratorQueue&&v.administratorQueue.endsAt<=at){v.administrators=(v.administrators||0)+1;v.administratorQueue=null;log(st,`${administratorName(st)} pronto em ${v.name}.`,'army');resolved=true;}
  if(v.festivalQueue&&v.festivalQueue.endsAt<=at){v.festivalQueue=null;v.festivalPoints=(v.festivalPoints||0)+150;log(st,`Celebração em ${v.name}: +150 pontos de cultura!`,'quest');report(st,'Celebração encerrada',`A Prefeitura de ${v.name} gerou 150 pontos de cultura.`,'victory');resolved=true;}
  if(v.research?.queue&&v.research.queue.endsAt<=at){
   const unitId=v.research.queue.unitId,unit=troopDefs(st).find(u=>u.id===unitId);
   if(!v.research.unlocked.includes(unitId))v.research.unlocked.push(unitId);
   v.research.queue=null;
   log(st,`Academia de ${v.name}: pesquisa de ${unit.name} concluída!`,'army');
   report(st,'Pesquisa concluída',`${v.name} desbloqueou ${unit.name} na Academia.`,'info');resolved=true;
  }
 }
 for(const m of st.movements.slice()){
  if(m.endsAt>at)continue;
  if(m.mode==='merchant'&&m.phase==='going'){
   const dest=st.villages.find(v=>v.id===m.targetVillageId);
   if(dest){addResources(dest,m.cargo);log(st,`Mercadores chegaram a ${dest.name} com carga de ${D.RES.reduce((n,k)=>n+m.cargo[k],0)} recursos.`,'trade');}
   m.phase='returning';m.startedAt=at;m.endsAt=at+Math.max(10000,(m.endsAt-m.startedAt)||10000);
   const origin=st.villages.find(v=>v.id===m.villageId);
   m.endsAt=at+Math.max(10000,Math.ceil(distance(origin||dest||{x:0,y:0},dest||origin||{x:0,y:0})*240/st.speed)*1000);
  }else if(m.mode==='merchant'&&m.phase==='returning'){
   st.movements.splice(st.movements.indexOf(m),1);
   log(st,`Mercadores regressaram à aldeia de origem.`,'trade');
  }else if(m.phase==='going'&&m.mode==='trade'){
   const dest=st.villages.find(v=>v.id===m.targetVillageId);if(dest){addResources(dest,m.cargo);log(st,`Caravana recebida por ${dest.name}.`,'trade');}
   st.movements.splice(st.movements.indexOf(m),1);
  }else if(m.phase==='going'&&m.mode==='reinforce'){
   const destination=st.villages.find(v=>v.id===m.targetVillageId);
   if(destination){for(const [unit,qty] of Object.entries(m.army))destination.troops[unit]=(destination.troops[unit]||0)+qty;
    log(st,`Reforços chegaram a ${destination.name}.`,'army');st.movements.splice(st.movements.indexOf(m),1);}
   else {m.phase='returning';m.endsAt=at+5000;}
  }else if(m.phase==='going')resolveBattle(st,m,m.endsAt);
  else {returnArmy(st,m);st.movements.splice(st.movements.indexOf(m),1);}
  resolved=true;
 }
 if(st.hero.adventure&&st.hero.adventure.endsAt<=at){resolveAdventure(st);resolved=true;}
 if(processTradeRoutes(st,at))resolved=true;
 if(window.GSF_AI?.resolveDue(st,at))resolved=true;
 return resolved;
}
function advance(st,time=now()){
 if(!st||!st.villages)return st;
 if(!Number.isFinite(time))return st;
 let cursor=Number(st.lastTick)||time;
 if(time<cursor){st.lastTick=time;return st;}
 cursor=Math.max(cursor,time-30*86400000);
 window.GSF_AI?.prepare(st,cursor,time);
 // Eventos que já venceram antes do ponto inicial também devem ser resolvidos.
 let steps=0;
 while(resolveDue(st,cursor)&&++steps<10000){}
 while(cursor<time&&steps++<10000){
  const next=[];
  st.villages.forEach(v=>{v.buildQueue.forEach(q=>{if(q.endsAt>cursor)next.push(q.endsAt);});v.trainingQueue.forEach(q=>{if(q.endsAt>cursor)next.push(q.endsAt);});if(v.administratorQueue?.endsAt>cursor)next.push(v.administratorQueue.endsAt);if(v.research?.queue?.endsAt>cursor)next.push(v.research.queue.endsAt);if(v.festivalQueue?.endsAt>cursor)next.push(v.festivalQueue.endsAt);for(const r of routes(v))if(r.enabled&&r.nextAt>cursor)next.push(r.nextAt);});
  st.movements.forEach(m=>{if(m.endsAt>cursor)next.push(m.endsAt);});
  if(st.hero.adventure?.endsAt>cursor)next.push(st.hero.adventure.endsAt);
  if(window.GSF_AI)next.push(...window.GSF_AI.nextEvents(st,cursor));
  const end=Math.min(time,...next),hours=Math.max(0,end-cursor)/3600000;
  st.villages.forEach(v=>produceSegment(st,v,hours,end));
  cursor=end;
  while(resolveDue(st,cursor)&&++steps<10000){}
 }
 // Em um save com filas anormalmente grandes, conclui o avanço sem travar o navegador.
 if(cursor<time){const hours=(time-cursor)/3600000;st.villages.forEach(v=>produceSegment(st,v,hours,time));}
 st.lastTick=time;runPlanned(st);return st;
}
const BACKUP_KEY=KEY+'-backup';
const validNumber=(x,min=0,max=1e15)=>typeof x==='number'&&Number.isFinite(x)&&x>=min&&x<=max;
const validArray=(a,max)=>Array.isArray(a)&&a.length<=max;
const plain=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const validRes=r=>plain(r)&&D.RES.every(k=>validNumber(r[k],0,1e12));
const validArmy=(army,tribe)=>plain(army)&&Object.entries(army).every(([k,n])=>D.TROOPS[tribe].some(t=>t.id===k)&&Number.isSafeInteger(n)&&n>=0&&n<=1000000);
function validateState(st){
 if(!plain(st)||st.version!==1||!D.TRIBES[st.tribe]||typeof st.player!=='string'||st.player.length>100||
  !validNumber(st.speed,1,100)||!Number.isSafeInteger(st.nextId)||st.nextId<1||
  !validNumber(st.lastTick,0)||!validNumber(st.createdAt,0)||
  !validArray(st.villages,5)||st.villages.length===0||!plain(st.world)||!validArray(st.world.tiles,1000)||
  !validArray(st.movements,500)||!validArray(st.reports,100)||!validArray(st.events,100)||
  !validArray(st.questsClaimed,1000)||!st.questsClaimed.every(q=>typeof q==='string'&&q.length<=100)||new Set(st.questsClaimed).size!==st.questsClaimed.length||!plain(st.hero))return false;
 if(st.capitalVillageId!==undefined&&(!st.villages.some(v=>v.id===st.capitalVillageId)))return false;
 if(st.preferences!==undefined&&(!plain(st.preferences)||typeof st.preferences.enemyAttacks!=='boolean'||(st.preferences.extraBuildSlots!==undefined&&(!Number.isSafeInteger(st.preferences.extraBuildSlots)||st.preferences.extraBuildSlots<0||st.preferences.extraBuildSlots>MAX_EXTRA_BUILD_SLOTS))||(st.preferences.viewMode!==undefined&&!['original','compact'].includes(st.preferences.viewMode))))return false;
 if(window.GSF_EXPANSION&&!window.GSF_EXPANSION.validate(st.expansion))return false;
 if(st.hero.productionFocus!==undefined&&!['wood','clay','iron','crop','all','custom'].includes(st.hero.productionFocus))return false;
 if(st.hero.productionTargets!==undefined&&(!validArray(st.hero.productionTargets,4)||!st.hero.productionTargets.length||new Set(st.hero.productionTargets).size!==st.hero.productionTargets.length||!st.hero.productionTargets.every(k=>D.RES.includes(k))))return false;
 if(st.hero.inventory!==undefined&&(!validArray(st.hero.inventory,3)||new Set(st.hero.inventory).size!==st.hero.inventory.length||!st.hero.inventory.every(id=>!!HERO_ARTIFACTS[id])))return false;
 if(st.hero.equipped!==undefined&&st.hero.equipped!==null&&(!HERO_ARTIFACTS[st.hero.equipped]||!st.hero.inventory?.includes(st.hero.equipped)))return false;
 if(!validNumber(st.hero.level,1,1000)||!validNumber(st.hero.hp,0,100)||
  !validNumber(st.hero.xp,0,1e8)||!validNumber(st.hero.attack,0,10000)||
  !validNumber(st.hero.resources,0,10000)||!validNumber(st.hero.points,0,10000)||
  !validNumber(st.hero.adventures,0,1e8)||
  (st.hero.adventure!==null&&(!plain(st.hero.adventure)||!validNumber(st.hero.adventure.endsAt))))return false;
 const ids=new Set(),positions=new Set();
 for(const v of st.villages){
  if(!plain(v)||typeof v.id!=='string'||typeof v.name!=='string'||v.name.length>100||
   !Number.isSafeInteger(v.x)||!Number.isSafeInteger(v.y)||Math.abs(v.x)>8||Math.abs(v.y)>8||
   ids.has(v.id)||positions.has(v.x+':'+v.y)||!validRes(v.resources)||
   (v.fieldProfile!==undefined&&!['balanced','crop9','crop15'].includes(v.fieldProfile))||
   (v.planQueue!==undefined&&(!validArray(v.planQueue,MAX_BUILD_PLANS)||!v.planQueue.every(q=>plain(q)&&typeof q.id==='string'&&['field','building'].includes(q.type)&&((q.type==='field'&&Number.isSafeInteger(q.ref)&&q.ref>=0&&q.ref<18)||(q.type==='building'&&!!D.BUILDINGS[q.ref]&&Number.isSafeInteger(q.slot)&&q.slot>=0&&q.slot<20)))))||
   (v.settlers!==undefined&&(!Number.isSafeInteger(v.settlers)||v.settlers<0||v.settlers>3))||
   (v.administrators!==undefined&&(!Number.isSafeInteger(v.administrators)||v.administrators<0||v.administrators>3))||
   (v.administratorQueue!==undefined&&v.administratorQueue!==null&&(!plain(v.administratorQueue)||!validNumber(v.administratorQueue.startedAt)||!validNumber(v.administratorQueue.endsAt)||v.administratorQueue.endsAt<=v.administratorQueue.startedAt))||
   (v.tradeRoutes!==undefined&&(!validArray(v.tradeRoutes,5)||!v.tradeRoutes.every(r=>plain(r)&&typeof r.id==='string'&&typeof r.targetVillageId==='string'&&validRes(r.cargo)&&Number.isSafeInteger(r.interval)&&[15,30,60,180,360,720,1440].includes(r.interval)&&validNumber(r.nextAt)&&typeof r.enabled==='boolean')))||
   (v.festivalQueue!==undefined&&v.festivalQueue!==null&&(!plain(v.festivalQueue)||!validNumber(v.festivalQueue.startedAt)||!validNumber(v.festivalQueue.endsAt)||v.festivalQueue.endsAt<=v.festivalQueue.startedAt))||
   (v.festivalPoints!==undefined&&(!Number.isSafeInteger(v.festivalPoints)||v.festivalPoints<0||v.festivalPoints>1000000000))||
   (v.famineLosses!==undefined&&(!Number.isSafeInteger(v.famineLosses)||v.famineLosses<0||v.famineLosses>1000000000))||
   (v.conqueredFrom!==undefined&&(!['corvos','aurora','espinhos'].includes(v.conqueredFrom)))||
   !plain(v.buildings)||!plain(v.buildingSlots)||!validArmy(v.troops,st.tribe)||
   (v.militaryTech!==undefined&&(!plain(v.militaryTech)||!Object.entries(v.militaryTech).every(([k,l])=>D.TROOPS[st.tribe].some(u=>u.id===k)&&Number.isSafeInteger(l)&&l>=0&&l<=10)))||
   (v.research!==undefined&&(!plain(v.research)||!validArray(v.research.unlocked,D.TROOPS[st.tribe].length)||!v.research.unlocked.includes(D.TROOPS[st.tribe][0].id)||new Set(v.research.unlocked).size!==v.research.unlocked.length||!v.research.unlocked.every(id=>D.TROOPS[st.tribe].some(u=>u.id===id))||(v.research.queue!==null&&(!plain(v.research.queue)||!D.TROOPS[st.tribe].some(u=>u.id===v.research.queue.unitId)||v.research.unlocked.includes(v.research.queue.unitId)||!validNumber(v.research.queue.startedAt)||!validNumber(v.research.queue.endsAt)||v.research.queue.endsAt<=v.research.queue.startedAt))))||
   !validArray(v.fields,18)||v.fields.length!==18||!validArray(v.buildQueue,50)||!validArray(v.trainingQueue,500))return false;
  ids.add(v.id);positions.add(v.x+':'+v.y);
  if(!v.fields.every(f=>plain(f)&&D.FIELDS[f.type]&&Number.isSafeInteger(f.level)&&f.level>=0&&f.level<=(v.id===(st.capitalVillageId||st.villages[0].id)?25:20)))return false;
  if(!Object.entries(v.buildings).every(([k,l])=>D.BUILDINGS[k]&&Number.isSafeInteger(l)&&l>=0&&l<=D.BUILDINGS[k].max))return false;
  if(!Object.entries(v.buildingSlots).every(([slot,k])=>/^(?:[0-9]|1[0-9])$/.test(slot)&&!!D.BUILDINGS[k]))return false;
  if(!v.buildQueue.every(q=>plain(q)&&validNumber(q.endsAt)&&Number.isSafeInteger(q.level)&&q.level>=1&&q.level<=(q.type==='field'?fieldMax(st,v):20)&&
   (q.type==='field'?(Number.isSafeInteger(q.ref)&&q.ref>=0&&q.ref<18):(q.type==='building'&&!!D.BUILDINGS[q.ref]&&Number.isSafeInteger(q.slot)&&q.slot>=0&&q.slot<20))))return false;
  if(!v.trainingQueue.every(q=>plain(q)&&validNumber(q.endsAt)&&Number.isSafeInteger(q.qty)&&q.qty>=1&&q.qty<=MAX_TRAIN_BATCH&&D.TROOPS[st.tribe].some(t=>t.id===q.unitId)))return false;
 }
 if(!ids.has(st.activeVillageId))return false;
 for(const v of st.villages)if(v.tradeRoutes?.some(r=>!ids.has(r.targetVillageId)||r.targetVillageId===v.id||D.RES.reduce((n,k)=>n+r.cargo[k],0)<50))return false;
 if(st.villages.filter(v=>buildLevel(v,'palace')>0||v.buildQueue.some(q=>q.type==='building'&&q.ref==='palace')).length>1)return false;
 if(st.ai&&window.GSF_AI&&!window.GSF_AI.validate(st.ai,st))return false;
 if(window.GSF_CAMPAIGN&&!window.GSF_CAMPAIGN.validate(st.campaign))return false;
 if(!st.world.tiles.every(t=>plain(t)&&typeof t.id==='string'&&typeof t.name==='string'&&
  Number.isSafeInteger(t.x)&&Number.isSafeInteger(t.y)&&Math.abs(t.x)<=8&&Math.abs(t.y)<=8&&
  ['empty','enemy','oasis'].includes(t.kind)&&validNumber(t.power,0,1e9)&&
  (t.resources===null||validRes(t.resources))&&
  (t.oasisType===undefined||t.kind==='oasis'&&D.RES.includes(t.oasisType))&&
  (t.ownerVillageId===undefined||t.kind==='oasis'&&ids.has(t.ownerVillageId))))return false;
 if(!st.movements.every(m=>plain(m)&&ids.has(m.villageId)&&
  ['going','returning'].includes(m.phase)&&validNumber(m.endsAt)&&validNumber(m.startedAt)&&
  validArmy(m.army,st.tribe)&&(!m.loot||validRes(m.loot))&&
  (m.administrators===undefined||(Number.isSafeInteger(m.administrators)&&m.administrators>=0&&m.administrators<=1))&&
  (m.mode!=='conquer'||m.administrators===0||m.administrators===1)&&
  (m.mode!=='merchant'||(ids.has(m.targetVillageId)&&m.targetVillageId!==m.villageId&&validRes(m.cargo)&&Number.isSafeInteger(m.merchants)&&m.merchants>=1&&m.merchants<=80))&&
  (m.mode!=='trade'||(ids.has(m.targetVillageId)&&m.targetVillageId!==m.villageId&&validRes(m.cargo)&&D.RES.reduce((n,k)=>n+m.cargo[k],0)>=50))&&
  (m.mode!=='reinforce'||(ids.has(m.targetVillageId)&&m.targetVillageId!==m.villageId))))return false;
 return st.reports.every(r=>plain(r)&&typeof r.title==='string'&&typeof r.body==='string'&&validNumber(r.at))&&
  st.events.every(e=>plain(e)&&typeof e.message==='string'&&validNumber(e.at));
}
function save(st){
 if(!validateState(st))return false;
 try{
  const text=JSON.stringify(st);
  const previous=localStorage.getItem(KEY);
  // Mantém a versão anterior válida para recuperar uma gravação interrompida.
  if(previous&&previous!==text){
   try{if(validateState(JSON.parse(previous)))localStorage.setItem(BACKUP_KEY,previous);}catch(_){}
  }
  localStorage.setItem(KEY,text);return true;
 }catch(_){return false;}
}
function load(){
 for(const key of [KEY,BACKUP_KEY]){
  try{
   const raw=localStorage.getItem(key);if(!raw)continue;
   const st=JSON.parse(raw);if(!validateState(st))continue;
   window.GSF_RECOVERED_BACKUP=key===BACKUP_KEY;
   window.GSF_CAMPAIGN?.init(st);
   window.GSF_EXPANSION?.init(st);
   st.capitalVillageId ||= st.villages[0].id;
   st.villages.forEach(v=>initResearch(st,v));
   advance(st);
   // Não sobrescrever o backup recuperado até o jogador executar a próxima ação.
   return st;
  }catch(_){}
 }
 return null;
}
function clear(){localStorage.removeItem(KEY);localStorage.removeItem(BACKUP_KEY);}
function exportSave(st){return JSON.stringify(st,null,2);}
function importSave(text){
 let st;try{st=JSON.parse(text);}catch(_){return {ok:false,error:'Arquivo JSON inválido.'};}
 if(!validateState(st))return {ok:false,error:'Save incompatível ou dados inválidos.'};
 st.lastTick=now();
 window.GSF_CAMPAIGN?.init(st);
 window.GSF_EXPANSION?.init(st);
 st.capitalVillageId ||= st.villages[0].id;
 st.villages.forEach(v=>initResearch(st,v));
 if(!save(st))return {ok:false,error:'Não foi possível salvar a partida neste navegador.'};
 return {ok:true,state:st};
}
window.GSF={maxExchangeOffer,merchantCapacity,merchantsTotal,merchantsFree,sendMerchantCargo,addTradeRoute,removeTradeRoute,toggleTradeRoute,routes,canFestival,startFestival,maxTrainable,capital,isCapital,setCapital,fieldMax,administratorName,canTrainAdministrator,trainAdministrator,sendConquest,conquerRival,researchRule,researchPrice,canResearch,startResearch,unitUnlocked,initResearch,viewMode,setViewMode,fieldMix,tileProfile,oasisResource,oasisCount,oasisLimit,captureOasis,releaseOasis,heroFocus,heroTargets,heroBonus,setHeroFocus,setHeroTargets,plans,planBuild,removePlan,movePlan,runPlanned,KEY,newGame,active,tileAt,cost,buildTime,capacity,production,population,upkeep,buildLevel,unmet,canPay,canBuild,startBuild,cancelBuild,canTrain,train,send,simulate,reinforce,upgradeMilitary,startAdventure,spendHero,healHero,trade,settle,questList,claim,advance,save,load,clear,exportSave,importSave,troopDefs,validateState,BACKUP_KEY,sendCaravan,HERO_ARTIFACTS,equipHero,extraBuildSlots,buildQueueCapacity,setBuildSlots,trainSettlers};
})();
