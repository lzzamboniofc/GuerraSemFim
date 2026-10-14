/* Regressões v0.2: node tests/regression.test.js */
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const db=new Map();
const localStorage={getItem:k=>db.get(k)??null,setItem:(k,v)=>db.set(k,String(v)),removeItem:k=>db.delete(k)};
const ctx={window:{},console,Date,Math,JSON,localStorage};
vm.createContext(ctx);
for(const file of ['data','war','campaign','engine'])vm.runInContext(fs.readFileSync(path.join(__dirname,'..','js',file+'.js'),'utf8'),ctx,{filename:file});
const E=ctx.window.GSF;
let tests=0;
function test(label,fn){fn();tests++;console.log('✓ '+label);}

test('Proíbe envio acima das tropas disponíveis sem alterar o estado',()=>{
 const st=E.newGame({tribe:'romans'}),v=E.active(st);v.troops.praetorian=1001;
 const before=JSON.stringify(v.troops),movements=st.movements.length;
 const result=E.send(st,v,2,0,{legionary:13,praetorian:1001},'raid');
 assert.equal(result.ok,false);
 assert.equal(JSON.stringify(v.troops),before);
 assert.equal(st.movements.length,movements);
});

test('Recusa tropas desconhecidas, negativas, fracionárias e missões inválidas',()=>{
 const st=E.newGame({tribe:'gauls'}),v=E.active(st);
 for(const [army,mode] of [[{phalanx:-1},'raid'],[{phalanx:1.5},'raid'],[{phalanx:1,dragon:1},'raid'],[{phalanx:1},'teleport']]){
  assert.equal(E.send(st,v,2,0,army,mode).ok,false);
 }
 assert.equal(v.troops.phalanx,12);
});

test('Conclui construção e aplica produção proporcional ao tempo offline',()=>{
 const st=E.newGame({tribe:'romans'}),v=E.active(st);
 assert.equal(E.startBuild(st,v,'field',0).ok,true);
 const t=Date.now();st.lastTick=t-60000;
 v.buildQueue[0].endsAt=t-30000;
 const first=E.production(st,v).wood;
 const resourcesBefore=v.resources.wood=100;
 const predictedAfter=first+Math.floor(5*Math.pow(1.68,1))*st.speed-5*st.speed;
 E.advance(st,t);
 const expected=resourcesBefore+first*30/3600+predictedAfter*30/3600;
 assert.equal(v.fields[0].level,2);
 assert.ok(Math.abs(v.resources.wood-expected)<0.1,`${v.resources.wood} vs ${expected}`);
});

test('Resolve combate e retorno durante o avanço offline no mesmo ciclo',()=>{
 const st=E.newGame({tribe:'romans'}),v=E.active(st);v.troops.legionary=100;
 assert.equal(E.send(st,v,2,0,{legionary:100},'raid').ok,true);
 const t=Date.now(),march=st.movements[0];march.startedAt=t-60000;march.endsAt=t-45000;st.lastTick=t-60000;
 E.advance(st,t);
 assert.equal(st.movements.length,0);
 assert.ok(st.reports.some(r=>r.title.startsWith('Vitória')||r.title.startsWith('Derrota')));
 assert.ok(v.troops.legionary>=0);
});

test('Recupera automaticamente o save secundário se o principal corromper',()=>{
 const st=E.newGame({tribe:'teutons'}),v=E.active(st);
 const original=v.resources.wood;
 v.resources.wood=original-50;assert.equal(E.save(st),true);
 db.set(E.KEY,'{corrompido...');
 const restored=E.load();assert.ok(restored);
 assert.ok(Math.abs(E.active(restored).resources.wood-original)<0.1);
 assert.equal(ctx.window.GSF_RECOVERED_BACKUP,true);
});

test('Bloqueia saves adulterados ou incompletos e preserva o save original',()=>{
 const st=E.newGame({tribe:'romans'});const previous=db.get(E.KEY);
 for(const transform of [
  s=>{s.villages[0].fields=[];},
  s=>{s.villages[0].resources.wood=-10000;},
  s=>{s.villages[0].troops.legionary=-1;},
  s=>{s.villages[0].buildings.inventado=100;},
  s=>{s.villages[0].trainingQueue=[{unitId:'legionary',qty:-25,endsAt:Date.now()}];},
  s=>{s.villages[0].resources.crop='infinito';},
  s=>{s.world.tiles='mundo';},
 ]){
  const corrupted=JSON.parse(E.exportSave(st));transform(corrupted);
  assert.equal(E.importSave(JSON.stringify(corrupted)).ok,false);
  assert.equal(db.get(E.KEY),previous);
 }
});

test('Limpa save principal e backup ao reiniciar',()=>{
 const st=E.newGame();const v=E.active(st);v.resources.wood-=10;E.save(st);
 assert.ok(db.get(E.BACKUP_KEY));
 E.clear();assert.equal(db.get(E.KEY),undefined);assert.equal(db.get(E.BACKUP_KEY),undefined);
});
console.log(`\n${tests} regressões verificadas.`);
