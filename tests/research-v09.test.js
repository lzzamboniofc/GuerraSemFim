'use strict';
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),db=new Map(),storage={getItem:k=>db.get(k)||null,setItem:(k,v)=>db.set(k,String(v)),removeItem:k=>db.delete(k)};
const ctx={window:{},console,Date,JSON,Math,localStorage:storage};vm.createContext(ctx);
for(const f of ['data','war','ai','campaign','expansion','engine'])vm.runInContext(fs.readFileSync(path.join(root,'js',f+'.js'),'utf8'),ctx,{filename:f});
const E=ctx.window.GSF;
let passed=0;function test(name,fn){fn();passed++;console.log('✓ '+name);}
const game=()=>{const s=E.newGame({tribe:'romans',speed:12});return [s,E.active(s)];};
const stock=v=>{for(const k of ['wood','clay','iron','crop'])v.resources[k]=100000;};
test('Pesquisa bloqueia recrutamento até concluir',()=>{
 const [s,v]=game();assert(E.unitUnlocked(s,v,'legionary'));assert(!E.unitUnlocked(s,v,'praetorian'));v.buildings.barracks=3;stock(v);
 assert.match(E.canTrain(s,v,'praetorian',1).error,/Pesquise/);
 assert.match(E.canResearch(s,v,'praetorian').error,/Academia/);
 v.buildings.academy=1;const c=E.startResearch(s,v,'praetorian');assert(c.ok);
 assert.equal(E.startResearch(s,v,'praetorian').ok,false);assert.equal(E.canTrain(s,v,'praetorian',1).ok,false);
 const t=v.research.queue.endsAt;s.lastTick=v.research.queue.startedAt;E.advance(s,t+1000);
 assert.equal(v.research.queue,null);assert(E.unitUnlocked(s,v,'praetorian'));stock(v);assert(E.train(s,v,'praetorian',1).ok);
 assert(s.reports.some(x=>x.title==='Pesquisa concluída'));assert(E.validateState(s));
});
test('Academia e oficinas exigidas; Ferreiro exige pesquisa',()=>{
 const [s,v]=game();v.buildings.academy=10;v.buildings.barracks=3;v.buildings.smithy=10;stock(v);
 assert.match(E.canResearch(s,v,'catapult').error,/Oficina/);
 assert.equal(E.upgradeMilitary(s,v,'imperian').ok,false);
 v.buildings.workshop=1;assert(E.canResearch(s,v,'catapult').ok);
 assert(E.researchRule(s,E.troopDefs(s).find(x=>x.id==='catapult')).academy===10);
});
test('Custos pagos e pesquisa única, por aldeia',()=>{
 const [s,v]=game();v.buildings.academy=3;v.buildings.barracks=3;stock(v);
 const before={...v.resources},price=E.researchPrice(s,'imperian');
 assert(E.startResearch(s,v,'imperian').ok);
 ['wood','clay','iron','crop'].forEach((k,i)=>assert(Math.abs(before[k]-v.resources[k]-price[i])<.001));
 assert.equal(E.startResearch(s,v,'praetorian').ok,false);
 const another=JSON.parse(JSON.stringify(v));another.id='e900';another.x=1;another.y=1;another.research={unlocked:['legionary'],queue:null};another.troops={};s.villages.push(another);
 assert(!E.unitUnlocked(s,another,'imperian'));assert(E.validateState(s));
});
test('Saves legados mantêm unidades existentes',()=>{
 const [s,v]=game();v.buildings.barracks=3;v.buildings.stable=1;v.buildings.workshop=1;delete v.research;
 assert(E.validateState(s));assert(E.importSave(JSON.stringify(s)).ok);
 const restored=E.load();assert(E.unitUnlocked(restored,E.active(restored),'imperian'));assert(E.unitUnlocked(restored,E.active(restored),'ram'));
});
test('Validação bloqueia filas e desbloqueios alterados',()=>{
 const [s,v]=game();v.research.unlocked.push('invalid');assert.equal(E.validateState(s),false);
 v.research.unlocked.pop();v.research.queue={unitId:'praetorian',startedAt:300,endsAt:200};assert.equal(E.validateState(s),false);
 v.research.queue=null;assert(E.validateState(s));
});
test('Três tribos: unidade inicial gratuita e pesquisa de cerco',()=>{
 for(const tribe of ['romans','gauls','teutons']){const s=E.newGame({tribe}),v=E.active(s);
 assert(E.unitUnlocked(s,v,E.troopDefs(s)[0].id));assert(!E.unitUnlocked(s,v,E.troopDefs(s)[1].id));
 assert.equal(E.researchRule(s,E.troopDefs(s).find(x=>x.siege==='catapult')).academy,10);
 }
});
console.log(passed+' grupos da Academia v0.9 aprovados');
