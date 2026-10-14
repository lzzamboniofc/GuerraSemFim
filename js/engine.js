(function () {
'use strict';
const D = window.GSF_DATA;
const KEY = 'guerra-sem-fim-save-v1';
const now = () => Date.now();
const clamp = (x,a,b) => Math.min(b,Math.max(a,x));
const sum = arr => arr.reduce((a,b)=>a+b,0);
const random = (x,y,seed=17) => { let k = Math.imul(x+1009,73856093)^Math.imul(y+997,19349663)^Math.imul(seed,83492791); k = Math.imul(k ^ k >>> 16, 2246822507); return ((k^k>>>13)>>>0)/4294967295; };
const id = st => 'e'+(st.nextId++);
const round = n => Math.floor(n);
function fieldMix() {return ['wood','wood','wood','wood','clay','clay','clay','clay','iron','iron','iron','iron','crop','crop','crop','crop','crop','crop'];}
function village(st,name,x,y,starter=false) {
 const fields = fieldMix().map((type,i)=>({type,level:starter?1:0,id:i}));
 const buildings = {main:starter?3:1,warehouse:1,granary:1,rally:1};
 const troops = {};
 if(starter) troops[D.TROOPS[st.tribe][0].id]=12;
 return {id:id(st),name,x,y,fields,buildings,resources:starter?{wood:1000,clay:1000,iron:1000,crop:1000}:{wood:650,clay:650,iron:650,crop:650},buildQueue:[],trainingQueue:[],troops,buildingSlots:{0:'main',1:'warehouse',2:'granary',3:'rally'},foundedAt:now()};
}
function newGame(options={}) {
 const tribe = D.TRIBES[options.tribe]?options.tribe:'romans';
 const st={version:1,nextId:1,player:(options.player||'Comandante').trim().slice(0,25)||'Comandante',tribe,speed:clamp(Number(options.speed)||12,1,100),
  villages:[],activeVillageId:null,hero:{name:'Guardião',level:1,xp:0,hp:100,attack:4,resources:0,points:0,adventure:null,adventures:0},
  world:{seed:37,tiles:[]},movements:[],reports:[],events:[],questsClaimed:[],tutorialDismissed:false,createdAt:now(),lastTick:now()};
 const home=village(st,(options.village||'Nova Esperança').trim().slice(0,28)||'Nova Esperança',0,0,true);
 st.villages=[home];st.activeVillageId=home.id;
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
 log(st,'Bem-vindo ao Guerra Sem Fim! Sua aldeia está pronta para crescer.','welcome');
 report(st,'O início de um império','Seu povo ergueu os primeiros edifícios e aguarda suas ordens. Expanda os campos, crie um exército e descubra o mapa.', 'info');
 save(st);return st;
}
function active(st){return st.villages.find(v=>v.id===st.activeVillageId)||st.villages[0];}
function tileAt(st,x,y){const owned=st.villages.find(v=>v.x===x&&v.y===y);if(owned)return {id:owned.id,x,y,kind:'player',name:owned.name};return st.world.tiles.find(t=>t.x===x&&t.y===y)||null;}
function buildLevel(v,key){return v.buildings[key]||0;}
function cost(type,key,next) {const base=type==='field'?D.FIELDS[key].base:D.BUILDINGS[key].base;return base.map(n=>Math.ceil(n*Math.pow(1.32,next-1)));}
function buildTime(st,v,type,key,next){const base=type==='field'?D.FIELDS[key].time:D.BUILDINGS[key].time;const main=buildLevel(v,'main');return Math.max(5,Math.round(base*Math.pow(1.23,next-1)*Math.pow(0.96,Math.max(0,main-1))/st.speed));}
function capacity(v,key){return key==='crop'?Math.round(1200*Math.pow(1.52,Math.max(0,buildLevel(v,'granary')-1))):Math.round(1200*Math.pow(1.52,Math.max(0,buildLevel(v,'warehouse')-1)));}
function troopDefs(st){return D.TROOPS[st.tribe];}
function population(v){let n=2;for(const [k,l] of Object.entries(v.buildings))n+=l*(D.BUILDINGS[k]?.pop||0);n+=v.fields.reduce((a,f)=>a+Math.ceil(f.level/3),0);return n;}
function upkeep(st,v){return troopDefs(st).reduce((a,t)=>a+(v.troops[t.id]||0)*t.upkeep,0);}
function production(st,v){const base={wood:0,clay:0,iron:0,crop:0};v.fields.forEach(f=>{base[f.type]+=f.level?Math.round(5*Math.pow(1.68,f.level-1)):0;});
 const out={};const bonus={wood:'sawmill',clay:'brickyard',iron:'ironworks',crop:'mill'};
 D.RES.forEach(k=>{out[k]=Math.floor(base[k]*(1+0.05*buildLevel(v,bonus[k]))*st.speed);});
 if(st.villages[0].id===v.id)out.wood+=st.hero.resources*st.speed*2;
 out.crop-=population(v)+upkeep(st,v);return out;
}
function canPay(v,price,count=1){return D.RES.every((k,i)=>v.resources[k]+0.000001>=price[i]*count);}
function pay(v,price,count=1){if(!canPay(v,price,count))return false;D.RES.forEach((k,i)=>v.resources[k]-=price[i]*count);return true;}
function addResources(v,rewards){D.RES.forEach(k=>v.resources[k]=clamp(v.resources[k]+(rewards[k]||0),0,capacity(v,k)));}
function unmet(v,key){const req=D.BUILDINGS[key].req;return Object.entries(req).filter(([k,l])=>buildLevel(v,k)<l).map(([k,l])=>`${D.BUILDINGS[k].name} nível ${l}`);}
function canBuild(st,v,type,ref,slot) {
 let key,level;
 if(type==='field') {const f=v.fields[ref];if(!f)return {ok:false,error:'Campo inválido.'};key=f.type;level=f.level;if(level>=20)return {ok:false,error:'Nível máximo.'};}
 else {key=ref;if(!D.BUILDINGS[key])return {ok:false,error:'Edifício desconhecido.'};level=buildLevel(v,key);if(level>=D.BUILDINGS[key].max)return {ok:false,error:'Nível máximo.'};const req=unmet(v,key);if(req.length)return {ok:false,error:'Requer: '+req.join(', ')};
   if(level===0&&(slot===undefined||slot===null||v.buildingSlots[slot]))return {ok:false,error:'Escolha um terreno livre.'};
   if(level===0&&Object.values(v.buildingSlots).includes(key))return {ok:false,error:'Este edifício já foi construído.'};
 }
 const isRoman=st.tribe==='romans';const queueBusy=v.buildQueue.some(q=>!isRoman || q.type===type);
 if(queueBusy)return {ok:false,error:isRoman?'Já existe uma obra deste tipo.':'Os construtores estão ocupados.'};
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
function canTrain(st,v,unitId,qty){const unit=troopDefs(st).find(t=>t.id===unitId);if(!unit)return {ok:false,error:'Unidade inválida.'};if(buildLevel(v,unit.building)<1)return {ok:false,error:`Requer ${D.BUILDINGS[unit.building].name}.`};
 qty=Math.floor(Number(qty));if(!Number.isFinite(qty)||qty<1||qty>500)return {ok:false,error:'Escolha entre 1 e 500 unidades.'};
 if(!canPay(v,unit.cost,qty))return {ok:false,error:'Recursos insuficientes.'};
 const seconds=Math.max(3,Math.floor(unit.time*Math.pow(.965,buildLevel(v,unit.building)-1)*qty/st.speed));return {ok:true,unit,qty,seconds};}
function train(st,v,unitId,qty){const c=canTrain(st,v,unitId,qty);if(!c.ok)return c;pay(v,c.unit.cost,c.qty);
 const last=v.trainingQueue.filter(q=>q.building===c.unit.building).reduce((a,b)=>Math.max(a,b.endsAt),now());
 v.trainingQueue.push({id:id(st),unitId,qty:c.qty,building:c.unit.building,endsAt:last+c.seconds*1000});
 log(st,`Recrutamento de ${c.qty} ${c.unit.name}(s) iniciado.`,'army');save(st);return {ok:true};}
function distance(a,b){return Math.hypot(a.x-b.x,a.y-b.y);}
function send(st,v,x,y,army,mode='raid'){
 const target=tileAt(st,x,y);if(!target||target.kind!=='enemy')return {ok:false,error:'Escolha um acampamento hostil no mapa.'};
 if(buildLevel(v,'rally')<1)return {ok:false,error:'Construa o Ponto de Reunião.'};
 const chosen={};let count=0,speed=999,power=0;
 troopDefs(st).forEach(t=>{const n=Math.floor(Number(army[t.id])||0);if(n>0){chosen[t.id]=n;count+=n;speed=Math.min(speed,t.speed);power+=n*t.attack;if(n>(v.troops[t.id]||0))count=-999;}});
 if(count<=0)return {ok:false,error:'Selecione tropas disponíveis.'};
 if(count>20000)return {ok:false,error:'Limite de 20.000 unidades por marcha.'};
 const seconds=Math.max(5,Math.ceil(distance(v,target)*120/(speed*st.speed)));
 for(const [k,n] of Object.entries(chosen))v.troops[k]-=n;
 st.movements.push({id:id(st),villageId:v.id,targetId:target.id,x,y,army:chosen,mode,phase:'going',endsAt:now()+seconds*1000,startedAt:now(),power});
 log(st,`Exército enviado para ${target.name} (${x}|${y}).`,'army');save(st);return {ok:true,seconds};
}
function report(st,title,body,type='info',details=null){st.reports.unshift({id:id(st),title,body,type,details,at:now(),read:false});if(st.reports.length>100)st.reports.length=100;}
function log(st,message,type='info'){st.events.unshift({id:id(st),message,type,at:now()});if(st.events.length>45)st.events.length=45;}
function resolveBattle(st,m,arrivedAt){const v=st.villages.find(q=>q.id===m.villageId),t=st.world.tiles.find(q=>q.id===m.targetId);if(!v||!t){m.phase='returning';m.endsAt=now()+5000;return;}
 const defs=troopDefs(st);const atk=sum(defs.map(u=>(m.army[u.id]||0)*u.attack));const def=t.power*32+10;
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
 log(st,`As tropas voltaram a ${v.name}${m.loot?' com recursos saqueados':''}.`,'army');}
function startAdventure(st){if(st.hero.adventure)return {ok:false,error:'O herói já está em uma aventura.'};if(st.hero.hp<20)return {ok:false,error:'Seu herói precisa recuperar a saúde.'};
 const seconds=Math.max(10,Math.round(240/st.speed));st.hero.adventure={id:id(st),endsAt:now()+seconds*1000};log(st,'O herói partiu para explorar terras desconhecidas.','hero');save(st);return {ok:true};}
function resolveAdventure(st){st.hero.adventures++;st.hero.xp+=36+st.hero.level*6;st.hero.hp=Math.max(15,st.hero.hp-8);const v=st.villages[0];const r={wood:110+st.hero.level*20,clay:110+st.hero.level*20,iron:110+st.hero.level*20,crop:110+st.hero.level*20};addResources(v,r);
 while(st.hero.xp>=st.hero.level*100){st.hero.xp-=st.hero.level*100;st.hero.level++;st.hero.points+=4;st.hero.hp=100;log(st,`Seu herói subiu para o nível ${st.hero.level}!`,'hero');}
 report(st,'Aventura concluída',`O herói retornou com recursos e experiência. Recompensa: ${r.wood} de cada recurso e experiência de combate.`,'victory');
 log(st,'Seu herói concluiu a aventura com sucesso.','hero');st.hero.adventure=null;}
function spendHero(st,kind){if(!['attack','resources'].includes(kind)||st.hero.points<1)return {ok:false,error:'Sem pontos de atributo disponíveis.'};st.hero.points--;st.hero[kind]++;save(st);return {ok:true};}
function healHero(st){const v=active(st);const price=[100,100,100,100];if(st.hero.hp>=100)return {ok:false,error:'O herói já está saudável.'};if(!pay(v,price))return {ok:false,error:'Recursos insuficientes.'};st.hero.hp=Math.min(100,st.hero.hp+45);save(st);return {ok:true};}
function trade(st,v,from,to,amount){amount=Math.floor(Number(amount));if(!D.RES.includes(from)||!D.RES.includes(to)||from===to||!Number.isFinite(amount)||amount<100)return {ok:false,error:'Troca inválida (mínimo 100).'};
 if(buildLevel(v,'marketplace')<1)return {ok:false,error:'Construa o Mercado.'};
 const received=Math.floor(amount*.75);if(v.resources[from]<amount)return {ok:false,error:'Recursos insuficientes.'};if(v.resources[to]+received>capacity(v,to))return {ok:false,error:'Sem espaço no armazém de destino.'};
 v.resources[from]-=amount;v.resources[to]+=received;log(st,`Mercado: ${amount} ${D.RESOURCE[from].name} por ${received} ${D.RESOURCE[to].name}.`,'trade');save(st);return {ok:true,received};}
function settle(st,v,x,y,name){const tile=tileAt(st,x,y);if(!tile||tile.kind!=='empty')return {ok:false,error:'Escolha um vale desabitado.'};if(buildLevel(v,'residence')<10)return {ok:false,error:'É necessária uma Residência nível 10.'};
 if(st.villages.length>=5)return {ok:false,error:'Limite de cinco aldeias nesta versão.'};
 const price=[1600,1600,1600,1600];if(!canPay(v,price))return {ok:false,error:'Colonização custa 1.600 de cada recurso.'};
 pay(v,price);const next=village(st,(name||'Nova Colônia').trim().slice(0,28)||'Nova Colônia',x,y);st.villages.push(next);st.activeVillageId=next.id;
 log(st,`Uma nova aldeia foi fundada em (${x}|${y})!`,'build');report(st,'Nova aldeia fundada',`${next.name} agora faz parte do seu império.`,'victory');save(st);return {ok:true};}
function questList(st){const v=st.villages[0];const levels=v.fields.filter(f=>f.level>=2).length;const available=[
 {id:'welcome',title:'Primeiros passos',desc:'Inicie seu império.',done:true,reward:120},
 {id:'fields',title:'Terra fértil',desc:'Melhore 3 campos ao nível 2.',done:levels>=3,reward:200},
 {id:'construction',title:'Pedra sobre pedra',desc:'Construa ou melhore 5 edifícios (níveis somados: 12).',done:sum(Object.values(v.buildings))>=12,reward:300},
 {id:'army',title:'Bandeira de guerra',desc:'Treine um total de 20 tropas em uma aldeia.',done:st.villages.some(v=>sum(Object.values(v.troops))>=20),reward:280},
 {id:'adventure',title:'Desbravador',desc:'Conclua uma aventura do herói.',done:st.hero.adventures>=1,reward:250},
 {id:'raid',title:'Os despojos',desc:'Retorne com sucesso de um ataque.',done:st.reports.some(r=>r.type==='victory'&&r.title.includes('Vitória em')),reward:400},
 {id:'settle',title:'Um novo horizonte',desc:'Funde uma segunda aldeia.',done:st.villages.length>=2,reward:800}
 ];return available.map(q=>({...q,claimed:st.questsClaimed.includes(q.id)}));}
function claim(st,questId){const q=questList(st).find(q=>q.id===questId);if(!q||!q.done||q.claimed)return {ok:false,error:'Missão ainda não concluída.'};st.questsClaimed.push(q.id);const v=st.villages[0];addResources(v,{wood:q.reward,clay:q.reward,iron:q.reward,crop:q.reward});log(st,`Missão concluída: ${q.title}.`,'quest');save(st);return {ok:true};}
function advance(st,time=now()){
 if(!st||!st.villages)return st;
 let cursor=Number(st.lastTick)||time;
 if(time<cursor){st.lastTick=time;return st;}
 // Limit catch-up to 30 days, preventing unusable loops after clock tampering.
 cursor=Math.max(cursor,time-30*86400000);
 let iterations=0;
 while(cursor<time&&iterations++<1000){
  const eventTimes=[];
  st.villages.forEach(v=>{v.buildQueue.forEach(q=>eventTimes.push(q.endsAt));v.trainingQueue.forEach(q=>eventTimes.push(q.endsAt));});
  st.movements.forEach(m=>eventTimes.push(m.endsAt));if(st.hero.adventure)eventTimes.push(st.hero.adventure.endsAt);
  const future=eventTimes.filter(t=>t>cursor);const end=Math.min(time,...future);const hours=Math.max(0,end-cursor)/3600000;
  st.villages.forEach(v=>{const productionRates=production(st,v);D.RES.forEach(k=>v.resources[k]=clamp(v.resources[k]+productionRates[k]*hours,0,capacity(v,k)));});
  cursor=end;
  st.villages.forEach(v=>{
   for(const q of v.buildQueue.filter(q=>q.endsAt<=cursor)){if(q.type==='field')v.fields[q.ref].level=q.level;else v.buildings[q.ref]=q.level;
    log(st,`Obra concluída: ${q.type==='field'?D.FIELDS[v.fields[q.ref].type].name:D.BUILDINGS[q.ref].name} nível ${q.level}.`,'build');}
   v.buildQueue=v.buildQueue.filter(q=>q.endsAt>cursor);
   for(const q of v.trainingQueue.filter(q=>q.endsAt<=cursor)){v.troops[q.unitId]=(v.troops[q.unitId]||0)+q.qty;log(st,`${q.qty} tropas terminaram o treinamento em ${v.name}.`,'army');}
   v.trainingQueue=v.trainingQueue.filter(q=>q.endsAt>cursor);
  });
  const done=st.movements.filter(m=>m.endsAt<=cursor);for(const m of done){if(m.phase==='going')resolveBattle(st,m,cursor);else returnArmy(st,m);}
  st.movements=st.movements.filter(m=>!(done.includes(m)&&m.phase==='returning'&&m.endsAt<=cursor));
  if(st.hero.adventure&&st.hero.adventure.endsAt<=cursor)resolveAdventure(st);
 }
 st.lastTick=time;return st;
}
function save(st){try{localStorage.setItem(KEY,JSON.stringify(st));return true;}catch(e){return false;}}
function load(){try{const raw=localStorage.getItem(KEY);if(!raw)return null;const s=JSON.parse(raw);if(s.version!==1||!Array.isArray(s.villages)||!s.world?.tiles||!D.TRIBES[s.tribe])return null;return advance(s);}catch(e){return null;}}
function clear(){localStorage.removeItem(KEY);}
function exportSave(st){return JSON.stringify(st,null,2);}
function importSave(text){let s;try{s=JSON.parse(text);}catch(e){return {ok:false,error:'Arquivo JSON inválido.'};}if(s.version!==1||!Array.isArray(s.villages)||!s.world?.tiles||!D.TRIBES[s.tribe])return {ok:false,error:'Este arquivo não é um save compatível.'};
 if(s.villages.length>5||s.world.tiles.length>1000)return {ok:false,error:'Save inválido: tamanho excessivo.'};s.lastTick=now();save(s);return {ok:true,state:s};}
window.GSF={KEY,newGame,active,tileAt,cost,buildTime,capacity,production,population,upkeep,buildLevel,unmet,canPay,canBuild,startBuild,cancelBuild,canTrain,train,send,startAdventure,spendHero,healHero,trade,settle,questList,claim,advance,save,load,clear,exportSave,importSave,troopDefs};
})();
