/* v0.5 — testes do motor, economia, diplomacia, configurações e saves antigos */
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert');
const dir=path.resolve(__dirname,'..'), memory=new Map(),window={};
const ctx={window,Date,Math,JSON,console,localStorage:{getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)}};
vm.createContext(ctx);
for(const f of ['data','war','ai','engine'])vm.runInContext(fs.readFileSync(path.join(dir,'js',f+'.js'),'utf8'),ctx,{filename:f});
const E=window.GSF,AI=window.GSF_AI;
let count=0;function check(name,fn){fn();console.log('✓ '+name);count++;}
check('Configuração padrão é permitir invasões, e nova campanha aceita desativação',()=>{
 const a=E.newGame({enemyAttacks:false});assert.strictEqual(a.preferences.enemyAttacks,false);assert.strictEqual(AI.attacksEnabled(a),false);
 assert.strictEqual(E.newGame().preferences.enemyAttacks,true);
});
check('Ataques desligados não são criados em turnos; reinos ainda evoluem',()=>{
 const st=E.newGame({enemyAttacks:false,speed:60});const before=st.ai.factions[0].villages[0].troops;
 st.ai.turn=8;for(let i=0;i<32;i++)AI.resolveDue(st,st.ai.nextTurnAt);
 assert.strictEqual(st.ai.movements.filter(m=>m.phase==='outbound').length,0);
 assert(st.ai.factions[0].villages[0].level>1);assert(st.ai.factions[0].villages[0].troops>before);
});
check('Desativar ataques cancela invasões sem causar saque ou morte',()=>{
 const st=E.newGame();const target=st.villages[0],f=st.ai.factions[0],home=f.villages[0];
 const resources={...target.resources},troops={...target.troops},before=home.troops;
 st.ai.movements.push({id:'inbound',factionId:f.id,sourceId:home.id,targetVillageId:target.id,troops:15,phase:'outbound',startedAt:Date.now(),endsAt:Date.now()+500,duration:500,loot:null});
 assert(AI.setHostileAttacks(st,false).ok);
 assert.strictEqual(st.ai.movements.length,0);assert.strictEqual(home.troops,Math.min(300,before+15));
 assert.strictEqual(JSON.stringify(target.resources),JSON.stringify(resources));assert.strictEqual(JSON.stringify(target.troops),JSON.stringify(troops));
 assert(E.save(st));assert.strictEqual(E.load().preferences.enemyAttacks,false);
 assert(AI.setHostileAttacks(st,true).ok);assert(AI.attacksEnabled(st));
});
check('Trégua exige embaixada, custa recursos e impede ataques por 12 turnos',()=>{
 const st=E.newGame();const home=st.villages[0];
 assert(!AI.negotiate(st,'corvos').ok);
 home.buildings.embassy=1;E.active(st).resources={wood:1200,clay:1200,iron:1200,crop:1200};
 const original=home.resources.wood,f=st.ai.factions.find(f=>f.id==='corvos');
 assert(AI.negotiate(st,'corvos').ok);
 assert.strictEqual(home.resources.wood,original-250);
 assert.strictEqual(f.treatyUntil,st.ai.turn+12);
 assert(!AI.negotiate(st,'corvos').ok);
 assert(E.save(st));assert.strictEqual(E.load().ai.factions.find(f=>f.id==='corvos').treatyUntil,f.treatyUntil);
});
check('Caravana viaja entre aldeias e é entregue com o avanço do tempo',()=>{
 const st=E.newGame({speed:60});const from=st.villages[0],to=JSON.parse(JSON.stringify(from));
 to.id='e999';to.name='Colônia';to.x=1;to.y=1;to.resources={wood:0,clay:0,iron:0,crop:0};st.villages.push(to);
 from.buildings.marketplace=1;
 assert(!E.sendCaravan(st,from,from.id,'wood',150).ok);
 assert(!E.sendCaravan(st,from,to.id,'wood',12).ok);
 assert(!E.sendCaravan(st,from,to.id,'unknown',100).ok);
 assert(!E.sendCaravan(st,from,to.id,'wood',999999).ok);
 const start=from.resources.wood;
 const sent=E.sendCaravan(st,from,to.id,'wood',200);
 assert(sent.ok);assert.strictEqual(from.resources.wood,start-200);
 assert.strictEqual(st.movements[0].mode,'trade');assert(E.save(st));
 const m=st.movements[0];st.lastTick=m.startedAt;E.advance(st,m.endsAt+1);
 assert.strictEqual(st.movements.length,0);assert(to.resources.wood>=200);
});
check('Caravana é limitada pela capacidade do destino',()=>{
 const st=E.newGame({speed:60}),a=st.villages[0],b=JSON.parse(JSON.stringify(a));
 b.id='e777';b.x=1;b.y=0;b.name='Vila 2';b.resources.wood=1190;st.villages.push(b);a.buildings.marketplace=1;
 assert(E.sendCaravan(st,a,b.id,'wood',100).ok);
 const m=st.movements[0];st.lastTick=m.startedAt;E.advance(st,m.endsAt+1);
 assert(b.resources.wood<=E.capacity(b,'wood'));
});
check('Herói descobre e equipa artefatos com bônus de produção',()=>{
 const st=E.newGame(),v=E.active(st);st.hero.adventures=1;st.hero.inventory=[];
 assert(E.startAdventure(st).ok);st.hero.adventure.endsAt=Date.now()-1;st.lastTick=Date.now()-2000;E.advance(st,Date.now());
 assert(st.hero.inventory.includes('axe'));
 const before=E.production(st,v).wood;assert(E.equipHero(st,'axe').ok);
 assert(E.production(st,v).wood>before);assert(!E.equipHero(st,'crown').ok);
 assert(E.equipHero(st,null).ok);assert.strictEqual(E.production(st,v).wood,before);
 assert(E.save(st));
});
check('Saves antigos sem preferências ou inventário continuam válidos',()=>{
 const st=E.newGame();delete st.preferences;delete st.hero.inventory;delete st.hero.equipped;
 st.ai.factions.forEach(f=>delete f.treatyUntil);
 assert(E.validateState(st));assert(E.save(st));assert(E.load());
 assert.strictEqual(AI.attacksEnabled(E.load()),true);
});
check('Saves adulterados com preferências ou artefatos inválidos são rejeitados',()=>{
 const st=E.newGame();st.preferences.enemyAttacks='false';assert(!E.validateState(st));
 st.preferences.enemyAttacks=false;st.hero.inventory=['magic-hack'];assert(!E.validateState(st));
 st.hero.inventory=['axe'];st.hero.equipped='crown';assert(!E.validateState(st));
});
console.log(`\n${count} testes da Era dos Impérios aprovados.`);
