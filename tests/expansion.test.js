/* v0.7 — regressões de filas extras, colonizadores, comércio e eventos */
'use strict';
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..'),db=new Map(),window={};
const context={window,Date,Math,JSON,console,localStorage:{getItem:k=>db.get(k)||null,setItem:(k,v)=>db.set(k,v),removeItem:k=>db.delete(k)}};
vm.createContext(context);
for(const f of ['data','war','ai','campaign','expansion','engine'])vm.runInContext(fs.readFileSync(path.join(root,'js',f+'.js'),'utf8'),context,{filename:f});
const E=window.GSF,X=window.GSF_EXPANSION;
let total=0;const test=(title,fn)=>{fn();total++;console.log('✓ '+title);};
test('Nova partida recebe uma fila extra e limites por tribo',()=>{
 const roman=E.newGame(),gaul=E.newGame({tribe:'gauls'}),teuton=E.newGame({tribe:'teutons'});
 assert.strictEqual(E.extraBuildSlots(roman),1);assert.strictEqual(E.buildQueueCapacity(roman),3);
 assert.strictEqual(E.buildQueueCapacity(gaul),2);assert.strictEqual(E.buildQueueCapacity(teuton),2);
});
test('Romanos usam terceira fila livre, sem duplicar o mesmo alvo',()=>{
 const s=E.newGame(),v=E.active(s);assert(E.startBuild(s,v,'field',0).ok);
 assert(!E.startBuild(s,v,'field',0).ok,'Não pode repetir o campo');
 assert(E.startBuild(s,v,'building','warehouse',1).ok);
 assert(E.startBuild(s,v,'field',1).ok);
 assert(!E.startBuild(s,v,'field',2).ok,'A quarta obra deve falhar');
 assert.strictEqual(v.buildQueue.length,3);
});
test('Ajuste permite de zero a oito vagas extras, mantendo a diferença romana',()=>{
 const s=E.newGame({tribe:'gauls'});assert(E.setBuildSlots(s,8).ok);assert.strictEqual(E.buildQueueCapacity(s),9);
 assert(E.setBuildSlots(s,0).ok);assert.strictEqual(E.buildQueueCapacity(s),1);
 for(const val of [-1,9,1.2,'abc',null])assert(!E.setBuildSlots(s,val).ok);
});
test('Reduzir vagas não cancela obras e impede iniciar outras até liberar',()=>{
 const s=E.newGame({tribe:'gauls'}),v=E.active(s);
 assert(E.startBuild(s,v,'field',0).ok);assert(E.startBuild(s,v,'field',1).ok);
 assert(E.setBuildSlots(s,0).ok);assert.strictEqual(v.buildQueue.length,2);
 assert(!E.startBuild(s,v,'field',2).ok);
 assert(E.cancelBuild(s,v,v.buildQueue[0].id).ok);
 assert.strictEqual(v.buildQueue.length,1);assert(!E.startBuild(s,v,'field',2).ok);
 assert(E.cancelBuild(s,v,v.buildQueue[0].id).ok);
 assert(E.startBuild(s,v,'field',2).ok);
});
test('Configuração persiste após salvar e importar, inclusive saves antigos',()=>{
 const s=E.newGame();assert(E.setBuildSlots(s,5).ok);assert(E.save(s));assert.strictEqual(E.load().preferences.extraBuildSlots,5);
 const raw=E.exportSave(s);assert(E.importSave(raw).ok);assert.strictEqual(E.load().preferences.extraBuildSlots,5);
 const old=JSON.parse(raw);delete old.preferences.extraBuildSlots;delete old.expansion;delete old.villages[0].settlers;
 assert(E.importSave(JSON.stringify(old)).ok);
 const migrated=E.load();assert.strictEqual(E.extraBuildSlots(migrated),1);assert(migrated.expansion);
 assert(E.validateState(migrated));
});
test('Rejeita preferências inválidas e colonizadores adulterados',()=>{
 const s=E.newGame();s.preferences.extraBuildSlots=10;assert(!E.validateState(s));s.preferences.extraBuildSlots=1;
 E.active(s).settlers=-1;assert(!E.validateState(s));
});
test('Colonizadores precisam de Residência, recursos e limite de três',()=>{
 const s=E.newGame(),v=E.active(s);
 assert(!E.trainSettlers(s,v).ok);v.buildings.residence=10;v.resources={wood:2000,clay:2000,iron:2000,crop:2000};
 assert(E.trainSettlers(s,v,2).ok);assert.strictEqual(v.settlers,2);
 assert(!E.trainSettlers(s,v,2).ok);assert(E.trainSettlers(s,v,1).ok);assert.strictEqual(v.settlers,3);
 assert(E.save(s));
});
test('Colonização exige cultura, colonizadores e consome tropas adequadamente',()=>{
 const s=E.newGame(),v=E.active(s);v.buildings.residence=10;v.buildings.warehouse=8;v.buildings.granary=8;
 v.resources={wood:5000,clay:5000,iron:5000,crop:5000};
 assert(!E.settle(s,v,1,0,'Nova aldeia').ok);
 assert(E.trainSettlers(s,v,3).ok);
 assert(X.culture(s)>=X.neededCulture(s));
 const before=s.villages.length;
 const r=E.settle(s,v,1,0,'Nova aldeia');assert(r.ok,JSON.stringify(r));
 assert.strictEqual(v.settlers,0);assert.strictEqual(s.villages.length,before+1);assert(E.save(s));
});
test('Trocas com reinos NPC exigem Mercado e trégua ou aliança',()=>{
 const s=E.newGame(),v=E.active(s);v.resources={wood:1000,clay:1000,iron:1000,crop:1000};
 assert(!X.npcTrade(s,'corvos').ok);v.buildings.marketplace=1;
 s.ai.factions.find(f=>f.id==='corvos').treatyUntil=0;
 assert(!X.npcTrade(s,'corvos').ok);s.ai.factions.find(f=>f.id==='corvos').treatyUntil=100;
 const oldWood=v.resources.wood,oldIron=v.resources.iron;
 assert(X.npcTrade(s,'corvos').ok);assert.strictEqual(v.resources.wood,oldWood-120);assert.strictEqual(v.resources.iron,oldIron+92);
 assert(!X.npcTrade(s,'corvos').ok);s.ai.turn+=2;assert(X.npcTrade(s,'corvos').ok);
});
test('Eventos do mundo são processados no turno certo e não duplicados',()=>{
 const s=E.newGame(),ex=X.init(s),v=E.active(s);v.resources.crop=100;
 assert.strictEqual(X.onTurn(s,7,Date.now()),false);
 assert(X.onTurn(s,8,Date.now()));assert.strictEqual(ex.history.length,1);
 assert(!X.onTurn(s,8,Date.now()));assert.strictEqual(ex.history.length,1);
 assert(X.onTurn(s,16,Date.now()));assert.strictEqual(ex.history.length,2);
 assert(E.validateState(s));
});
console.log(`\n${total} testes da Expansão dos Impérios aprovados.`);
