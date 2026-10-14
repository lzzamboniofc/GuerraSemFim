/* Era das Guerras v0.4 — integração sem rede ou pacotes externos. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const db=new Map();const localStorage={getItem:k=>db.get(k)??null,setItem:(k,v)=>db.set(k,String(v)),removeItem:k=>db.delete(k)};
const context={window:{},localStorage,console,Date,Math,JSON};vm.createContext(context);
for(const name of ['data','war','ai','engine'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../js',name+'.js'),'utf8'),context,{filename:name});
const E=context.window.GSF,D=context.window.GSF_DATA,W=context.window.GSF_WAR,AI=context.window.GSF_AI;
let passed=0;function test(name,run){run();console.log('✓ '+name);passed++;}
const game=(tribe='romans')=>{const s=E.newGame({tribe,speed:12}),v=E.active(s);return {s,v};};
const due=(s,m,ms=50000)=>{const t=Date.now();m.startedAt=t-ms;m.endsAt=t-ms/2;s.lastTick=t-ms;E.advance(s,t);};
test('Cada tribo tem batedores, aríetes e catapultas com edifícios válidos',()=>{
 for(const tribe of Object.keys(D.TRIBES)){
  const d=D.TROOPS[tribe];assert.equal(d.filter(u=>u.scout).length,1);assert.equal(d.filter(u=>u.siege==='ram').length,1);assert.equal(d.filter(u=>u.siege==='catapult').length,1);
  assert(d.every(u=>D.BUILDINGS[u.building]));
 }
});
test('Salvar campanhas antigas sem militaryTech ainda é válido',()=>{
 const {s,v}=game();delete v.militaryTech;assert(E.validateState(s));const text=E.exportSave(s);assert(E.importSave(text).ok);assert.equal(W.tier(v,'legionary'),0);
});
test('Melhoria do Ferreiro tem pré-requisitos, custo e aumenta combate',()=>{
 const {s,v}=game();assert.equal(E.upgradeMilitary(s,v,'legionary').ok,false);
 v.buildings.smithy=2;const before=W.offense({legionary:10},D.TROOPS.romans,v);
 const first=E.upgradeMilitary(s,v,'legionary');assert(first.ok);assert.equal(v.militaryTech.legionary,1);
 assert(W.offense({legionary:10},D.TROOPS.romans,v)>before);
 assert(E.upgradeMilitary(s,v,'legionary').ok);assert.equal(E.upgradeMilitary(s,v,'legionary').ok,false);
 assert(E.validateState(s));
});
test('Reforços chegam à aldeia correta, sem duplicação',()=>{
 const {s,v}=game();s.villages.push({...structuredClone(v),id:'e800',name:'Posto Sul',x:1,y:0,troops:{},militaryTech:{}});
 v.troops.legionary=90;const moved=E.reinforce(s,v,'e800',{legionary:35});assert(moved.ok);assert.equal(v.troops.legionary,55);
 assert.equal(s.movements[0].mode,'reinforce');due(s,s.movements[0]);assert.equal(s.villages[1].troops.legionary,35);assert.equal(s.movements.length,0);
 assert.equal(v.troops.legionary,55);assert(E.validateState(s));
});
test('Reforços inválidos nunca retiram tropas',()=>{
 const {s,v}=game();const original=v.troops.legionary;
 assert.equal(E.reinforce(s,v,'e1',{legionary:1}).ok,false);
 assert.equal(E.reinforce(s,v,'missing',{legionary:1}).ok,false);
 s.villages.push({...structuredClone(v),id:'e801',name:'Posto',x:1,y:0,troops:{},militaryTech:{}});
 for(const army of [{legionary:original+1},{legionary:-1},{badunit:3},{legionary:1.2}])assert.equal(E.reinforce(s,v,'e801',army).ok,false);
 assert.equal(v.troops.legionary,original);assert.equal(s.movements.length,0);
});
test('Espionagem contra reino rival revela recursos, sem saquear',()=>{
 const {s,v}=game(),target=s.ai.factions[0].villages[0];v.troops.speculator=30;
 assert.equal(E.send(s,v,target.x,target.y,{speculator:20},'scout').ok,true);
 assert.equal(E.send(s,v,target.x,target.y,{legionary:1},'scout').ok,false);
 due(s,s.movements[0]);assert(s.reports.some(r=>r.title.includes('Espionagem bem-sucedida')&&r.body.includes('Guarnição')));
 assert(!s.reports.some(r=>r.title.includes('Espionagem bem-sucedida')&&r.details?.loot));
 assert.equal(s.movements.length,0);assert.equal(v.troops.speculator,30);
});
test('Espionagem pode ser detectada e perder batedores',()=>{
 const {s,v}=game();v.troops.speculator=2;
 const target=s.ai.factions[0].villages[0];target.walls=8;target.level=10;
 assert(E.send(s,v,target.x,target.y,{speculator:2},'scout').ok);
 due(s,s.movements[0]);assert.equal(v.troops.speculator,1);
 assert(s.reports.some(r=>r.title.includes('Batedores descobertos')));
});
test('Aríetes e catapultas prejudicam uma fortificação rival após ataque completo',()=>{
 const {s,v}=game(),rival=s.ai.factions[0].villages[0];
 rival.troops=15;rival.level=10;rival.walls=8;
 v.troops.legionary=450;v.troops.ram=60;v.troops.catapult=45;
 assert(E.send(s,v,rival.x,rival.y,{legionary:350,ram:50,catapult:40},'attack').ok);
 due(s,s.movements[0]);assert(rival.walls<8);assert(rival.level<10);
 assert(s.reports.some(r=>r.title.includes('Cerco a')));assert(E.validateState(s));
});
test('Em saques, armas de cerco não causam dano estrutural',()=>{
 const {s,v}=game(),rival=s.ai.factions[1].villages[0];rival.troops=25;rival.level=7;rival.walls=4;
 v.troops.legionary=500;v.troops.ram=30;v.troops.catapult=30;
 assert(E.send(s,v,rival.x,rival.y,{legionary:420,ram:28,catapult:28},'raid').ok);
 due(s,s.movements[0]);assert.equal(rival.walls,4);assert.equal(rival.level,7);
});
test('Muralhas melhoram a defesa; esconderijos reduzem saque',()=>{
 const {s,v}=game();v.troops.legionary=25;
 const units=D.TROOPS.romans;
 const weak=(W.defense(v.troops,units,v)+18)*W.fortification(0);
 v.buildings.wall=16;
 assert((W.defense(v.troops,units,v)+18)*W.fortification(v.buildings.wall)>weak);
 v.buildings.cranny=10;assert.equal(W.hide(v),1500);
 const faction=s.ai.factions[0],src=faction.villages[0];
 s.ai.movements.push({id:'n300',factionId:faction.id,sourceId:src.id,targetVillageId:v.id,troops:160,phase:'outbound',startedAt:Date.now()-1000,endsAt:Date.now()-1,duration:6000,loot:null});
 s.lastTick=Date.now()-2000;E.advance(s,Date.now());assert(s.ai.movements[0].loot);
 assert(Object.values(s.ai.movements[0].loot).every(n=>n===0));assert(E.validateState(s));
});
test('Simulador antecipa combate sem modificar soldados, recursos ou movimentos',()=>{
 const {s,v}=game();v.troops.legionary=200;
 const rival=s.ai.factions[0].villages[0];
 const before=JSON.stringify({troops:v.troops,resources:v.resources,movements:s.movements});
 const sim=E.simulate(s,v,rival.x,rival.y,{legionary:100});assert(sim.ok);assert(sim.power>0);assert(sim.defense>0);
 assert.equal(JSON.stringify({troops:v.troops,resources:v.resources,movements:s.movements}),before);
 assert.equal(E.simulate(s,v,rival.x,rival.y,{legionary:201}).ok,false);
});
test('Defesas contra infantaria e cavalaria são diferentes e coerentes',()=>{
 const {s,v}=game();v.troops.praetorian=30;
 const defs=D.TROOPS.romans;
 assert(W.defense(v.troops,defs,v,1)>W.defense(v.troops,defs,v,0));
});
test('Saves alterados com pesquisas fora do limite são rejeitados',()=>{
 const {s,v}=game();v.militaryTech={ram:11};assert.equal(E.validateState(s),false);
 v.militaryTech={legionary:2};assert(E.validateState(s));assert(E.save(s));
});
console.log(`\n${passed} testes da Era das Guerras aprovados.`);
